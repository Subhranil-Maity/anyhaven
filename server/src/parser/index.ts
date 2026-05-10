import { AnimeReleaseParser } from "./AnimeReleaseParser.js";
import { ReleaseAnalyzer } from "./ReleaseAnalyzer.js";
import { EpisodeDetector } from "./EpisodeDetector.js";
import { ReleaseNormalizer } from "./ReleaseNormalizer.js";
import { NormalizedAnimeRelease } from "./types.js";

export function parseAnimeRelease(raw: string): NormalizedAnimeRelease {
  const parsed = AnimeReleaseParser.parse(raw);
  const analyzed = ReleaseAnalyzer.analyze(parsed);
  const episodes = EpisodeDetector.detect(parsed);
  return ReleaseNormalizer.normalize(parsed, analyzed, episodes);
}

export * from "./types.js";
export * from "./QualityScorer.js";
export * from "./FineSearchEngine.js";
