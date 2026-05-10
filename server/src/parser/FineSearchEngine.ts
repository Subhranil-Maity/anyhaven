import { FineSearchQuery, FineSearchResult, AggregatedRelease, AggregatedTorrent } from "./types.js";
import { parseAnimeRelease } from "./index.js";
import { QualityScorer } from "./QualityScorer.js";
import { searchAnime } from "../services/nyaa.js";

export class FineSearchEngine {
  static async search(query: FineSearchQuery): Promise<FineSearchResult> {
    const searchQueries = this.generateQueries(query);
    const allTorrents: AggregatedTorrent[] = [];

    // Execute queries. Using a Set to avoid querying the same string multiple times.
    const executedQueries = Array.from(new Set(searchQueries));

    for (const q of executedQueries) {
      try {
        const category = query.category || "1_2"; // Anime - English-translated category as default
        const results = await searchAnime(q, category, "0", undefined, 50);
        for (const res of results) {
          const normalized = parseAnimeRelease(res.title);
          
          // Filters
          if (query.excludeGroups && normalized.releaseGroup && query.excludeGroups.includes(normalized.releaseGroup)) {
            continue;
          }
          if (query.minimumSeeders && res.seeders < query.minimumSeeders) {
            continue;
          }

          normalized.qualityScore = QualityScorer.score(normalized, res.seeders);

          let confidence = 100;
          // Simple confidence metric: Did it find the right title?
          if (!normalized.animeTitle.toLowerCase().includes(query.animeTitle.toLowerCase())) {
             // Fallback: AniList alias matching would happen here. For now, deduct.
             confidence -= 20;
          }

          allTorrents.push({
            title: res.title,
            link: res.link,
            seeders: res.seeders,
            size: this.parseSizeToBytes(res.size || "0 B"),
            magnet: res.magnet,
            confidence,
            normalized
          });
        }
      } catch (e) {
        console.error(`Failed to fetch Nyaa for query: ${q}`, e);
      }
    }

    // Deduplicate torrents by GUID/Link
    const uniqueTorrents = new Map<string, AggregatedTorrent>();
    for (const t of allTorrents) {
      if (!uniqueTorrents.has(t.link) || uniqueTorrents.get(t.link)!.seeders < t.seeders) {
        uniqueTorrents.set(t.link, t);
      }
    }

    const groups = this.aggregateAndRank(Array.from(uniqueTorrents.values()), query);

    return {
      animeTitle: query.animeTitle,
      season: query.season,
      queriesUsed: executedQueries,
      groups
    };
  }

  private static generateQueries(query: FineSearchQuery): string[] {
    const variations: Set<string> = new Set();
    const title = query.animeTitle;
    
    // 1. Base Alias Expansion (Mocked, can plug Anilist here later)
    const aliases = [title];
    // Example: if title === "Solo Leveling", aliases.push("Ore dake Level Up na Ken")

    // 2. Query Strategy Generation
    for (const t of aliases) {
      const isBatchIntent = query.isBatch || (query.episodeStart !== undefined && query.episodeEnd !== undefined);

      if (isBatchIntent) {
        variations.add(`"${t}" batch`);
        variations.add(`"${t}" complete`);
        if (query.season) {
          variations.add(`"${t}" season ${query.season} batch`);
          variations.add(`"${t}" s${query.season} batch`);
        }
        if (query.episodeStart !== undefined && query.episodeEnd !== undefined) {
          const s = query.episodeStart < 10 ? `0${query.episodeStart}` : query.episodeStart;
          const e = query.episodeEnd < 10 ? `0${query.episodeEnd}` : query.episodeEnd;
          variations.add(`"${t}" ${s}-${e}`);
          variations.add(`"${t}" ${s}~${e}`);
        }
      } else if (query.episode !== undefined) {
        variations.add(`"${t}" ${query.episode}`);
        if (query.episode < 10) variations.add(`"${t}" 0${query.episode}`);
        
        if (query.season) {
          const s = query.season < 10 ? `0${query.season}` : query.season;
          const e = query.episode < 10 ? `0${query.episode}` : query.episode;
          variations.add(`"${t}" S${s}E${e}`);
          variations.add(`"${t}" Season ${query.season} ${query.episode}`);
        }
      } else {
        // Fallback or generic season query
        if (query.season) {
          variations.add(`"${t}" Season ${query.season}`);
          variations.add(`"${t}" S${query.season < 10 ? '0'+query.season : query.season}`);
        } else {
          variations.add(`"${t}"`);
        }
      }
    }

    return Array.from(variations);
  }

  private static aggregateAndRank(torrents: AggregatedTorrent[], query: FineSearchQuery): AggregatedRelease[] {
    const groups = new Map<string, AggregatedRelease>();

    for (const t of torrents) {
      const n = t.normalized;
      // Grouping key
      const groupKey = `${n.releaseGroup || "Unknown"}|${n.resolution || "Unknown"}|${n.codec || "Unknown"}|${n.source || "Unknown"}|${n.isBatch}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          releaseGroup: n.releaseGroup || "Unknown",
          resolution: n.resolution || "Unknown",
          source: n.source || "Unknown",
          codec: n.codec || "Unknown",
          episodes: [],
          isBatch: n.isBatch,
          totalSize: 0,
          avgSeeders: 0,
          qualityScore: n.qualityScore,
          torrents: []
        });
      }

      const g = groups.get(groupKey)!;
      g.torrents.push(t);
      if (n.episode !== undefined && !g.episodes.includes(n.episode)) {
        g.episodes.push(n.episode);
      }
      g.totalSize += t.size;
    }

    // Finalize aggregations
    const aggregated = Array.from(groups.values());
    for (const g of aggregated) {
      g.avgSeeders = Math.round(g.torrents.reduce((acc, t) => acc + t.seeders, 0) / g.torrents.length);
      g.episodes.sort((a, b) => a - b);
      
      // Ranking Engine Modifiers
      let score = g.qualityScore;
      
      // Explicit preferences
      if (query.preferredResolution && g.resolution === query.preferredResolution) score += 30;
      if (query.preferredSource && g.source === query.preferredSource) score += 20;
      if (query.preferredCodec && g.codec === query.preferredCodec) score += 10;
      
      // Preferred groups
      if (query.preferredGroups && query.preferredGroups.length > 0 && query.preferredGroups.includes(g.releaseGroup)) {
        score += 40;
      }

      // Completeness (batch vs single)
      const isBatchIntent = query.isBatch || (query.episodeStart !== undefined && query.episodeEnd !== undefined);
      if (isBatchIntent && g.isBatch) {
         score += 25;
      } else if (!isBatchIntent && !g.isBatch) {
         score += 10;
      }

      g.qualityScore = score;
    }

    // Rank
    aggregated.sort((a, b) => b.qualityScore - a.qualityScore);

    return aggregated;
  }

  private static parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/([\d.]+)\s*(GiB|MiB|KiB|GB|MB|KB|B)/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === "GIB" || unit === "GB") return val * 1024 * 1024 * 1024;
    if (unit === "MIB" || unit === "MB") return val * 1024 * 1024;
    if (unit === "KIB" || unit === "KB") return val * 1024;
    return val;
  }
}
