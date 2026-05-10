import { parseAnimeRelease } from "./src/parser/index.js";
import { FineSearchEngine } from "./src/parser/FineSearchEngine.js";

const testTitles = [
  "[EMBER] Solo Leveling (2025) (Season 2) [BDRip] [1080p Dual Audio HEVC 10 bits DDP] (Ore dake Level Up na Ken Season 2: Arise from the Shadow) (Batch)",
  "[SubsPlease] Frieren - 12 (1080p) [ABCD1234]",
  "[Judas] Monogatari Series Batch 01-100 [HEVC]",
  "[Erai-raws] Oshi no Ko - 01v2 [1080p]",
  "[SomeGroup] Movie Title (BD 1080p x265 Dual Audio)"
];

for (const t of testTitles) {
  const parsed = parseAnimeRelease(t);
  console.log("------------------------");
  console.log("RAW:", t);
  console.log("NORMALIZED:", JSON.stringify(parsed, null, 2));
}

// Test search engine query generator
console.log("------------------------");
console.log("QUERIES for Solo Leveling S2 E5:");
// We can test private method by ignoring TS for a sec
// @ts-ignore
const queries = FineSearchEngine.generateQueries({
  animeTitle: "Solo Leveling",
  season: 2,
  episode: 5
});
console.log(queries);
