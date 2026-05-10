export class GroupDetector {
  static detect(raw: string): string | null {
    const match = raw.match(/^\[(.*?)\]/);
    if (!match) return null;
    
    return match[1].toLowerCase().trim();
  }
}
