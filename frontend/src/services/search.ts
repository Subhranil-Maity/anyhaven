import type { SearchResult } from "@/types";
import { fetchApi } from "./api";

export async function searchAnime(query: string): Promise<SearchResult[]> {
  if (!query) return [];
  const params = new URLSearchParams({ q: query });
  return fetchApi<SearchResult[]>(`/api/search?${params.toString()}`);
}
