import type { SearchResult } from "@/types";
import { fetchApi } from "./api";

export type NormalizedAnimeRelease = {
  raw: string;
  animeTitle: string;
  episode?: number;
  isBatch: boolean;
  releaseGroup?: string;
  resolution?: string;
  source?: string;
  codec?: string;
  qualityScore: number;
};

export type FineSearchQuery = {
  animeTitle: string;
  season?: number;
  episode?: number;
  episodeStart?: number;
  episodeEnd?: number;
  isBatch?: boolean;
  preferredResolution?: string;
  preferredSource?: string;
  preferredCodec?: string;
  dualAudio?: boolean;
  preferredGroups?: string[];
  excludeGroups?: string[];
  minimumSeeders?: number;
  allowMultiSub?: boolean;
  category?: string;
};

export type FineSearchResult = {
  animeTitle: string;
  season?: number;
  queriesUsed: string[];
  groups: AggregatedRelease[];
};

export type AggregatedRelease = {
  releaseGroup: string;
  resolution: string;
  source: string;
  codec: string;
  episodes: number[];
  isBatch: boolean;
  totalSize: number;
  avgSeeders: number;
  qualityScore: number;
  torrents: AggregatedTorrent[];
};

export type AggregatedTorrent = {
  title: string;
  link: string;
  seeders: number;
  size: number;
  magnet?: string;
  confidence: number;
  normalized: NormalizedAnimeRelease;
};
export async function searchAnime(query: string, category?: string): Promise<SearchResult[]> {
  if (!query) return [];
  const params = new URLSearchParams({ q: query });
  if (category) {
    params.append("category", category);
  }
  return fetchApi<SearchResult[]>(`/api/search?${params.toString()}`);
}

export async function fineSearchAnime(query: FineSearchQuery): Promise<FineSearchResult> {
  return fetchApi<FineSearchResult>("/api/finesearch", {
    method: "POST",
    body: JSON.stringify(query),
  });
}
