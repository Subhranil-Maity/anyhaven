import { AnitomyResult } from "./types.js";

export class ReleaseAnalyzer {
  static analyze(parsed: AnitomyResult) {
    const rawLower = parsed.raw?.toLowerCase() || "";
    const titleLower = parsed.title?.toLowerCase() || "";
    const releaseInfoLower = String(parsed.release?.version || "").toLowerCase();

    return {
      isBatch: this.detectBatch(rawLower, titleLower, parsed),
      isMovie: this.detectMovie(rawLower, parsed),
      isOVA: this.detectOVA(rawLower, parsed),
      isONA: this.detectONA(rawLower, parsed),
      isSpecial: this.detectSpecial(rawLower, titleLower, parsed),
      isNCOP: this.detectNCOP(rawLower),
      isNCED: this.detectNCED(rawLower),
      isDualAudio: this.detectDualAudio(rawLower, parsed),
      isMultiSub: this.detectMultiSub(rawLower, parsed),
      isRemux: this.detectRemux(rawLower, releaseInfoLower),
    };
  }

  private static detectBatch(raw: string, title: string, parsed: AnitomyResult): boolean {
    if (raw.includes("batch") || raw.includes("complete") || raw.includes("season pack")) {
      return true;
    }
    // Check if Anitomy parsed it as a batch
    if (String(parsed.release?.version || "").toLowerCase().includes("batch")) return true;

    // Detect large ranges like 01-12 without it just being an episode
    const epNumber = parsed.episode?.number;
    if (typeof epNumber === 'string' && epNumber.includes("-")) {
      return true; // Simple heuristic: any range is a batch
    }

    return false;
  }

  private static detectMovie(raw: string, parsed: AnitomyResult): boolean {
    if (parsed.type === "Movie" || raw.includes("movie")) return true;
    return false;
  }

  private static detectOVA(raw: string, parsed: AnitomyResult): boolean {
    if (parsed.type === "OVA" || raw.includes("ova")) return true;
    return false;
  }

  private static detectONA(raw: string, parsed: AnitomyResult): boolean {
    if (parsed.type === "ONA" || raw.includes("ona")) return true;
    return false;
  }

  private static detectSpecial(raw: string, title: string, parsed: AnitomyResult): boolean {
    if (parsed.type === "Special" || raw.includes("special") || raw.includes(" sp") || title.includes(" sp")) {
      return true;
    }
    return false;
  }

  private static detectNCOP(raw: string): boolean {
    return raw.includes("ncop") || raw.includes("creditless op");
  }

  private static detectNCED(raw: string): boolean {
    return raw.includes("nced") || raw.includes("creditless ed");
  }

  private static detectDualAudio(raw: string, parsed: AnitomyResult): boolean {
    if (raw.includes("dual audio") || raw.includes("dual-audio")) return true;
    if (parsed.audio?.term?.toLowerCase().includes("dual audio")) return true;
    return false;
  }

  private static detectMultiSub(raw: string, parsed: AnitomyResult): boolean {
    return raw.includes("multi-sub") || raw.includes("multisub") || raw.includes("multi sub");
  }

  private static detectRemux(raw: string, releaseInfo: string): boolean {
    return raw.includes("remux") || releaseInfo.includes("remux");
  }
}
