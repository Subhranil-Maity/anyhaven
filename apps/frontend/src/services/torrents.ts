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

export async function addTorrent(torrenturl: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>("/api/torrents/addtorrent", {
    method: "POST",
    body: JSON.stringify({ torrenturl }),
  });
}

/**
 * Adds a torrent and selects only the specified file.
 * If the torrent already exists in qBittorrent, it selects the file in the existing torrent.
 * The server responds immediately (202 Accepted) and does the work in the background.
 */
export async function addTorrentFile(
  torrentUrl: string,
  fileName: string,
  releaseFiles: string[],
  infoHash?: string
): Promise<{ accepted: boolean }> {
  return fetchApi<{ accepted: boolean }>("/api/torrents/addfile", {
    method: "POST",
    body: JSON.stringify({ torrentUrl, fileName, releaseFiles, infoHash }),
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
