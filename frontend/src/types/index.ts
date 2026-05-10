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

export interface Torrent {
  hash: string;
  name: string;
  size: number;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  eta: number;
  state: string;
}

export interface Settings {
  qbitUrl: string;
  username: string;
  password?: string;
}

export interface ApiError {
  error: string;
}
