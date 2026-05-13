import { HybridParser } from "./HybridParser.js";
import { NormalizedAnimeRelease } from "./types.js";

export function parseAnimeRelease(raw: string): NormalizedAnimeRelease {
  return HybridParser.parse(raw);
}

export * from "./types.js";
export * from "./QualityScorer.js";
export * from "./FineSearchEngine.js";
