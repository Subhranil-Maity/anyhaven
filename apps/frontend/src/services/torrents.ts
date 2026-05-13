import type { Torrent } from "@/types";
import { fetchApi } from "./api";

export async function getTorrents(): Promise<Torrent[]> {
  return fetchApi<Torrent[]>("/api/torrents");
}

export async function addMagnet(magnet: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>("/api/torrents/add", {
    method: "POST",
    body: JSON.stringify({ magnet }),
  });
}

export async function pauseTorrent(hash: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/api/torrents/${hash}/pause`, {
    method: "POST",
  });
}

export async function resumeTorrent(hash: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/api/torrents/${hash}/resume`, {
    method: "POST",
  });
}

export async function deleteTorrent(hash: string, deleteFiles: boolean = false): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/api/torrents/${hash}`, {
    method: "DELETE",
    body: JSON.stringify({ deleteFiles }),
  });
}
