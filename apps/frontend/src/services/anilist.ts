import type { Anime } from '@repo/shared/types/anilist';
import { fetchApi } from '@/services/api';

export async function anilistSearchByName(name: String): Promise<Anime[]> {
  return fetchApi<Anime[]>(`/api/anilist/search?q=${name}`, {
    method: "GET",
  });
}

export async function anilistGetAnimeById(id: String): Promise<Anime> {
  return fetchApi<Anime>(`/api/anilist/getAnimeById/${id}`, {
    method: "GET",
  });
}