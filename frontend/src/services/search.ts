import type { SearchResult } from "@/types";
import { fetchApi } from "./api";

export async function searchAnime(query: string, category?: string): Promise<SearchResult[]> {
  if (!query) return [];
  const params = new URLSearchParams({ q: query });
  if (category) {
    params.append("category", category);
  }
  return fetchApi<SearchResult[]>(`/api/search?${params.toString()}`);
}
