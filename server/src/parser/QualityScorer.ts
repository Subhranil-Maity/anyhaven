import { NormalizedAnimeRelease } from "./types.js";

const TRUSTED_GROUPS = [
  "subsplease",
  "erai-raws",
  "judas",
  "ember",
  "seadex",
  "dvd",
  "commie",
  "moff",
  "okatu",
  "animetime"
];

export class QualityScorer {
  static score(release: NormalizedAnimeRelease, seeders: number = 0): number {
    let score = 50; // Base score

    // Resolution
    if (release.resolution === "1080p") score += 20;
    else if (release.resolution === "2160p") score += 25;
    else if (release.resolution === "720p") score += 10;

    // Source
    if (release.source === "BDRip") score += 20;
    else if (release.source === "WEB-DL") score += 10;
    
    // Audio / Extras
    if (release.isDualAudio) score += 10;
    if (release.isMultiSub) score += 5;
    if (release.isRemux) score += 15;

    // Group Reputation
    if (release.releaseGroup && TRUSTED_GROUPS.includes(release.releaseGroup)) {
      score += 15;
    }

    // Seeders bonus
    if (seeders > 100) score += 10;
    else if (seeders > 20) score += 5;
    else if (seeders === 0) score -= 20;

    // Cap at 100, though could go higher for perfect releases
    return Math.min(score, 100);
  }
}
