import * as anitomy from "anitomy";
import { GroupDetector } from "./GroupDetector.js";
import { GroupStrategies, GroupStrategyResult, ParseDecision } from "./GroupStrategies.js";
import { FallbackSemanticParser } from "./FallbackSemanticParser.js";
import { ReleaseAnalyzer } from "./ReleaseAnalyzer.js";
import { ReleaseNormalizer } from "./ReleaseNormalizer.js";
import { NormalizedAnimeRelease, AnitomyResult } from "./types.js";

export class HybridParser {
  static parse(raw: string): NormalizedAnimeRelease {
    // 1. Group Detection
    const groupName = GroupDetector.detect(raw);
    
    // 2. Check Registry
    let groupResult: GroupStrategyResult = {};
    if (groupName && GroupStrategies[groupName]) {
      groupResult = GroupStrategies[groupName].apply(raw);
    }

    // 3. Fallback Semantic Parser (Always run for baseline)
    const anitomyParsed = anitomy.parse(raw) as AnitomyResult;
    anitomyParsed.raw = raw;
    
    // Recovery layers to ensure AnitomyResult has needed fields
    if (!anitomyParsed.release) anitomyParsed.release = {};
    if (!anitomyParsed.file) anitomyParsed.file = {};
    if (groupName && !anitomyParsed.release.group) {
        anitomyParsed.release.group = groupName;
    }

    const fallbackEp = FallbackSemanticParser.parseEpisode(raw);
    const fallbackSeason = FallbackSemanticParser.parseSeason(raw, anitomyParsed);
    const fallbackBatch = FallbackSemanticParser.parseBatch(raw);

    // 4. Conflict Resolution System
    const finalEpisode = this.resolveConflict(groupResult.episode, fallbackEp.episode);
    const finalEpisodeStart = this.resolveConflict(groupResult.episodeStart, fallbackEp.episodeStart);
    const finalEpisodeEnd = this.resolveConflict(groupResult.episodeEnd, fallbackEp.episodeEnd);
    const finalSeason = fallbackSeason; // No group currently dictates season rules in our registry
    const finalBatch = this.resolveConflict(groupResult.isBatch, fallbackBatch);

    // 5. Old flags (keep the old ReleaseAnalyzer flags for backwards compatibility)
    // ReleaseAnalyzer analyzes the anitomy output
    const analyzed = ReleaseAnalyzer.analyze(anitomyParsed);

    // 6. Output Normalization
    // We pass our strict decisions into a faux Anitomy object or just construct the NormalizedRelease directly
    const normalized = ReleaseNormalizer.normalize(anitomyParsed, analyzed, {
        episode: finalEpisode?.value ?? undefined,
        episodeStart: finalEpisodeStart?.value ?? undefined,
        episodeEnd: finalEpisodeEnd?.value ?? undefined,
    });

    // Override with strict hybrid parser decisions
    normalized.isBatch = finalBatch?.value || false;
    normalized.season = finalSeason?.value ?? undefined;
    normalized.confidence = Math.min(
       100,
       Math.max(
          (finalEpisode?.confidence || 0.5) * 100,
          (finalBatch?.confidence || 0.5) * 100
       )
    );

    return normalized;
  }

  private static resolveConflict<T>(groupDec?: ParseDecision<T>, fallbackDec?: ParseDecision<T>): ParseDecision<T> | undefined {
    if (!groupDec && !fallbackDec) return undefined;
    if (groupDec && !fallbackDec) return groupDec;
    if (!groupDec && fallbackDec) return fallbackDec;
    
    // Both exist, resolve by priority: explicit > group > inferred > fallback
    const priority = {
      "explicit": 4,
      "group": 3,
      "inferred": 2,
      "fallback": 1,
      "metadata": 0
    };

    const gPrio = priority[groupDec!.source];
    const fPrio = priority[fallbackDec!.source];

    if (fPrio > gPrio) return fallbackDec;
    return groupDec;
  }
}
