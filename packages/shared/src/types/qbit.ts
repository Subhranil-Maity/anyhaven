export interface TorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number;
  priority: number;
}

export interface Torrent {
  hash: string;
  name: string;
  size: number;
  progress: number;
  state: string;
  downloadSpeed: number;
  uploadSpeed: number;
  eta: number;
  files?: TorrentFile[];
}