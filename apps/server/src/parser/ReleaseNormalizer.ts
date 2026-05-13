import { AnitomyResult, NormalizedAnimeRelease } from "./types.js";

export class ReleaseNormalizer {
  static normalize(parsed: AnitomyResult, analyzed: any, episodes: any): NormalizedAnimeRelease {
    const group = this.normalizeGroup(parsed.release?.group);
    const source = this.normalizeSource(parsed.video?.term || parsed.source || "");
    const resolution = this.normalizeResolution(parsed.video?.resolution || "");
    const title = this.normalizeTitle(parsed.title || "");

    return {
      raw: parsed.raw || "",
      animeTitle: title,
      alternativeTitles: parsed.alternative_titles || [],
      season: parsed.season ? parseInt(parsed.season, 10) : undefined,
      releaseGroup: group,
      resolution,
      source,
      codec: parsed.video?.term,
      audio: parsed.audio?.term,
      subtitleLanguage: parsed.subtitles,
      checksum: parsed.file?.checksum,
      year: parsed.year ? parseInt(parsed.year, 10) : undefined,
      
      episode: episodes.episode,
      episodeStart: episodes.episodeStart,
      episodeEnd: episodes.episodeEnd,

      isBatch: analyzed.isBatch,
      isMovie: analyzed.isMovie,
      isOVA: analyzed.isOVA,
      isONA: analyzed.isONA,
      isSpecial: analyzed.isSpecial,
      isNCOP: analyzed.isNCOP,
      isNCED: analyzed.isNCED,
      isDualAudio: analyzed.isDualAudio,
      isMultiSub: analyzed.isMultiSub,
      isRemux: analyzed.isRemux,

      qualityScore: 0, // Assigned later
      confidence: 100 // TBD based on extraction success
    };
  }

  private static normalizeGroup(group?: string): string | undefined {
    if (!group) return undefined;
    // Strip surrounding brackets and lowercase to create stable slug
    let cleaned = group.replace(/^\[/, "").replace(/\]$/, "");
    return cleaned.toLowerCase().trim();
  }

  private static normalizeSource(source: string): string | undefined {
    if (!source) return undefined;
    const lower = source.toLowerCase();
    if (lower.includes("bd") || lower.includes("blu-ray") || lower.includes("bluray") || lower.includes("brip")) return "BDRip";
    if (lower.includes("web") || lower.includes("web-dl") || lower.includes("webrip")) return "WEB-DL";
    if (lower.includes("dvd")) return "DVD";
    if (lower.includes("tv")) return "TV";
    return source;
  }

  private static normalizeResolution(res: string): string | undefined {
    if (!res) return undefined;
    const lower = res.toLowerCase();
    if (lower.includes("2160") || lower.includes("4k")) return "2160p";
    if (lower.includes("1080")) return "1080p";
    if (lower.includes("720")) return "720p";
    if (lower.includes("480")) return "480p";
    return res;
  }

  private static normalizeTitle(title: string): string {
    return title.trim();
  }
}
