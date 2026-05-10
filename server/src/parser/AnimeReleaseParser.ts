import * as anitomy from "anitomy";
import { AnitomyResult } from "./types.js";

export class AnimeReleaseParser {
  /**
   * Run Anitomy and perform basic recovery on missing fields.
   */
  static parse(raw: string): AnitomyResult {
    // anitomy default options, we can parse it directly
    const parsed = anitomy.parse(raw) as AnitomyResult;
    
    // Add raw string to result
    parsed.raw = raw;

    // Recovery layer: Anitomy sometimes misses release groups if formatting is weird
    if (!parsed.release) {
      parsed.release = {};
    }
    if (!parsed.release.group) {
      const match = raw.match(/^\[([^\]]+)\]/);
      if (match) {
        parsed.release.group = match[1];
      }
    }

    // Recovery layer: Checksum recovery
    if (!parsed.file) {
      parsed.file = {};
    }
    if (!parsed.file.checksum) {
      const checksumMatch = raw.match(/\[([A-Fa-f0-9]{8})\]/);
      if (checksumMatch && !checksumMatch[1].match(/^\d+$/)) {
        parsed.file.checksum = checksumMatch[1];
      }
    }

    // Attempt to extract alternative titles if separated by ' - ' or similar,
    // though Anitomy sometimes gets them.
    if (!parsed.alternative_titles) {
      parsed.alternative_titles = [];
    }

    return parsed;
  }
}
