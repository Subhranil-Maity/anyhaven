import type { ReleasesSearchResult } from "@repo/shared/types/releases";
import { fetchApi } from "@/services/api";


export async function releasesSearchById(id: string): Promise<ReleasesSearchResult[]> {
  return fetchApi<ReleasesSearchResult[]>(`/api/releases/searchById/${id}`, {
    method: "GET",
  });
}