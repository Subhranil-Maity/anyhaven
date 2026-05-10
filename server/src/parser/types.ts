export type NormalizedAnimeRelease = {
  raw: string;
  animeTitle: string;
  englishTitle?: string;
  alternativeTitle?: string;
  alternativeTitles: string[];

  season?: number;
  releaseGroup?: string;
  resolution?: string;
  source?: string;
  codec?: string;
  audio?: string;
  subtitleLanguage?: string;
  checksum?: string;
  year?: number;

  episode?: number;
  episodeStart?: number;
  episodeEnd?: number;

  isBatch: boolean;
  isMovie: boolean;
  isOVA: boolean;
  isONA: boolean;
  isSpecial: boolean;
  isNCOP: boolean;
  isNCED: boolean;
  isDualAudio: boolean;
  isMultiSub: boolean;
  isRemux: boolean;
  releaseType?: "weekly" | "batch" | "unknown";

  qualityScore: number;
  confidence: number;
};

export type FineSearchQuery = {
  animeTitle: string;
  season?: number;
  episode?: number;
  episodeStart?: number;
  episodeEnd?: number;
  isBatch?: boolean;
  preferredResolution?: string;
  preferredSource?: string;
  preferredCodec?: string;
  dualAudio?: boolean;
  preferredGroups?: string[];
  excludeGroups?: string[];
  minimumSeeders?: number;
  allowMultiSub?: boolean;
  category?: string;
};

export type FineSearchResult = {
  animeTitle: string;
  season?: number;
  queriesUsed: string[];
  groups: AggregatedRelease[];
};

export type AggregatedRelease = {
  releaseGroup: string;
  resolution: string;
  source: string;
  codec: string;
  episodes: number[];
  isBatch: boolean;
  totalSize: number;
  avgSeeders: number;
  qualityScore: number;
  torrents: AggregatedTorrent[];
};

export type AggregatedTorrent = {
  title: string;
  link: string;
  seeders: number;
  size: number;
  magnet?: string;
  confidence: number;
  normalized: NormalizedAnimeRelease;
};

export type AnitomyResult = {
  title?: string;
  type?: string;
  season?: string;
  year?: string;
  language?: string;
  subtitles?: string;
  source?: string;
  episode?: {
    number?: number | string;
    numberAlt?: number | string;
    title?: string;
  };
  volume?: {
    number?: number | string;
  };
  video?: {
    term?: string;
    resolution?: string;
  };
  audio?: {
    term?: string;
  };
  release?: {
    version?: string;
    group?: string;
  };
  file?: {
    name?: string;
    extension?: string;
    checksum?: string;
  };
  raw?: string;
  alternative_titles?: string[];
  [key: string]: any;
};
