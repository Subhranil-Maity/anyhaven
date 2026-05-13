export interface Torrent {
  hash: string;
  name: string;
  size: number;
  progress: number;
  state: string;
  downloadSpeed: number;
  uploadSpeed: number;
  eta: number;
}