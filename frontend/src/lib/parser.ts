/**
 * Anime release parser / normalizer
 *
 * Goal:
 * Convert messy torrent titles into structured metadata.
 */

export type ParsedAnimeRelease = {
  raw: string

  animeTitle: string | null

  releaseGroup: string | null

  episode: number | null

  episodeStart: number | null
  episodeEnd: number | null

  season: number | null

  resolution: string | null

  source: string | null

  codec: string | null

  audio: string | null

  subtitleLanguage: string | null

  crc32: string | null

  isBatch: boolean

  confidence: number

  tags: string[]
}

export class AnimeReleaseParser {
  private readonly raw: string

  constructor(title: string) {
    this.raw = this.cleanInput(title)
  }

  parse(): ParsedAnimeRelease {
    const releaseGroup = this.extractReleaseGroup()
    const resolution = this.extractResolution()
    const season = this.extractSeason()
    const episodeInfo = this.extractEpisodeInfo()
    const source = this.extractSource()
    const codec = this.extractCodec()
    const audio = this.extractAudio()
    const subtitleLanguage = this.extractSubtitleLanguage()
    const crc32 = this.extractCRC32()
    const animeTitle = this.extractAnimeTitle({
      releaseGroup,
      resolution,
      season,
      episodeInfo,
      source,
      codec,
      audio,
      subtitleLanguage,
      crc32
    })

    const isBatch =
      episodeInfo.episodeStart !== null &&
      episodeInfo.episodeEnd !== null &&
      episodeInfo.episodeStart !== episodeInfo.episodeEnd

    const confidence = this.calculateConfidence({
      animeTitle,
      releaseGroup,
      episodeInfo,
      resolution
    })

    const tags = this.extractTags()

    return {
      raw: this.raw,

      animeTitle,

      releaseGroup,

      episode: episodeInfo.episode,

      episodeStart: episodeInfo.episodeStart,
      episodeEnd: episodeInfo.episodeEnd,

      season,

      resolution,

      source,

      codec,

      audio,

      subtitleLanguage,

      crc32,

      isBatch,

      confidence,

      tags
    }
  }

  // =========================================================
  // CLEANUP
  // =========================================================

  private cleanInput(input: string): string {
    return input
      .replace(/\s+/g, " ")
      .replace(/_/g, " ")
      .trim()
  }

  // =========================================================
  // RELEASE GROUP
  // =========================================================

  private extractReleaseGroup(): string | null {
    const patterns = [
      /^\[(.*?)\]/,
      /^\((.*?)\)/,
    ]

    for (const pattern of patterns) {
      const match = this.raw.match(pattern)

      if (match?.[1]) {
        return match[1].trim()
      }
    }

    return null
  }

  // =========================================================
  // RESOLUTION
  // =========================================================

  private extractResolution(): string | null {
    const resolutions = [
      "2160p",
      "1440p",
      "1080p",
      "720p",
      "480p"
    ]

    for (const res of resolutions) {
      if (this.raw.toLowerCase().includes(res.toLowerCase())) {
        return res
      }
    }

    return null
  }

  // =========================================================
  // SEASON
  // =========================================================

  private extractSeason(): number | null {
    const patterns = [
      /season\s?(\d+)/i,
      /s(\d{1,2})/i
    ]

    for (const pattern of patterns) {
      const match = this.raw.match(pattern)

      if (match?.[1]) {
        return Number(match[1])
      }
    }

    return null
  }

  // =========================================================
  // EPISODES
  // =========================================================

  private extractEpisodeInfo(): {
    episode: number | null
    episodeStart: number | null
    episodeEnd: number | null
  } {
    const patterns = [
      /(?:ep|episode)?\s?(\d+)\s?-\s?(\d+)/i,
      /(?:ep|episode)?\s?(\d+)/i,
      /-\s?(\d{1,4})\s?/,
    ]

    for (const pattern of patterns) {
      const match = this.raw.match(pattern)

      if (!match) continue

      // Range
      if (match[1] && match[2]) {
        return {
          episode: null,
          episodeStart: Number(match[1]),
          episodeEnd: Number(match[2])
        }
      }

      // Single
      if (match[1]) {
        const ep = Number(match[1])

        return {
          episode: ep,
          episodeStart: ep,
          episodeEnd: ep
        }
      }
    }

    return {
      episode: null,
      episodeStart: null,
      episodeEnd: null
    }
  }

  // =========================================================
  // SOURCE
  // =========================================================

  private extractSource(): string | null {
    const sources = [
      "BluRay",
      "BD",
      "WEB-DL",
      "WEBRip",
      "TV",
      "DVD"
    ]

    for (const source of sources) {
      const regex = new RegExp(source, "i")

      if (regex.test(this.raw)) {
        return source
      }
    }

    return null
  }

  // =========================================================
  // CODEC
  // =========================================================

  private extractCodec(): string | null {
    const codecs = [
      "HEVC",
      "x265",
      "x264",
      "AV1",
      "H264",
      "H265"
    ]

    for (const codec of codecs) {
      const regex = new RegExp(codec, "i")

      if (regex.test(this.raw)) {
        return codec
      }
    }

    return null
  }

  // =========================================================
  // AUDIO
  // =========================================================

  private extractAudio(): string | null {
    const audioTypes = [
      "AAC",
      "FLAC",
      "DDP5.1",
      "DTS",
      "TRUEHD"
    ]

    for (const audio of audioTypes) {
      const regex = new RegExp(audio, "i")

      if (regex.test(this.raw)) {
        return audio
      }
    }

    return null
  }

  // =========================================================
  // SUBTITLE LANGUAGE
  // =========================================================

  private extractSubtitleLanguage(): string | null {
    const langs = [
      "MULTI",
      "ENG",
      "DUAL AUDIO"
    ]

    for (const lang of langs) {
      const regex = new RegExp(lang, "i")

      if (regex.test(this.raw)) {
        return lang
      }
    }

    return null
  }

  // =========================================================
  // CRC32
  // =========================================================

  private extractCRC32(): string | null {
    const match = this.raw.match(/\[([A-Fa-f0-9]{8})\]/)

    return match?.[1] ?? null
  }

  // =========================================================
  // TAGS
  // =========================================================

  private extractTags(): string[] {
    const tags: string[] = []

    const knownTags = [
      "UNCENSORED",
      "BATCH",
      "REMUX",
      "MULTI",
      "DUAL AUDIO"
    ]

    for (const tag of knownTags) {
      const regex = new RegExp(tag, "i")

      if (regex.test(this.raw)) {
        tags.push(tag)
      }
    }

    return tags
  }

  // =========================================================
  // TITLE EXTRACTION
  // =========================================================

  private extractAnimeTitle(context: {
    releaseGroup: string | null
    resolution: string | null
    season: number | null
    episodeInfo: {
      episode: number | null
      episodeStart: number | null
      episodeEnd: number | null
    }
    source: string | null
    codec: string | null
    audio: string | null
    subtitleLanguage: string | null
    crc32: string | null
  }): string | null {
    let title = this.raw

    // Remove release group
    if (context.releaseGroup) {
      title = title.replace(
        new RegExp(`^\\[${this.escapeRegex(context.releaseGroup)}\\]`),
        ""
      )
    }

    // Remove metadata blocks
    title = title
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")

    // Remove episode patterns
    title = title
      .replace(/-\s?\d+\s?-\s?\d+/g, "")
      .replace(/-\s?\d+/g, "")
      .replace(/episode\s?\d+/gi, "")
      .replace(/ep\s?\d+/gi, "")

    // Remove resolution
    title = title.replace(/\d{3,4}p/gi, "")

    // Remove codecs
    title = title.replace(/x265|x264|hevc|av1/gi, "")

    // Cleanup
    title = title
      .replace(/\s+/g, " ")
      .replace(/^-/, "")
      .trim()

    if (!title.length) {
      return null
    }

    return title
  }

  // =========================================================
  // CONFIDENCE
  // =========================================================

  private calculateConfidence(data: {
    animeTitle: string | null
    releaseGroup: string | null
    episodeInfo: {
      episode: number | null
      episodeStart: number | null
      episodeEnd: number | null
    }
    resolution: string | null
  }): number {
    let score = 0

    if (data.animeTitle) score += 40
    if (data.releaseGroup) score += 20
    if (
      data.episodeInfo.episode !== null ||
      data.episodeInfo.episodeStart !== null
    ) {
      score += 25
    }
    if (data.resolution) score += 15

    return Math.min(score, 100)
  }

  // =========================================================
  // HELPERS
  // =========================================================

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}
