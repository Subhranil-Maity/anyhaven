export interface SearchResult {
  title: string;
  link: string;
  guid: string;
  category?: string;
  seeders: number;
  leechers: number;
  downloads: number;
  size?: string;
  trusted: boolean;
  remake: boolean;
  publishedAt?: string;
  magnet?: string;
}

export type { Torrent, TorrentFile } from "@repo/shared/types/qbit";



export interface Settings {
  qbitUrl: string;
  username: string;
  password?: string;
}

export interface ApiError {
  error: string;
}
