import { mkdir } from "fs/promises";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export interface Settings {
  qbitUrl: string;
  username: string;
  password?: string;
}

const SETTINGS_FILE = join(process.cwd(), ".settings.json");

export async function loadSettings(): Promise<Settings | null> {
  try {
    const content = await readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await mkdir(process.cwd(), { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function getSettings(): Promise<Omit<Settings, "password"> | null> {
  const settings = await loadSettings();
  if (!settings) return null;
  const { password, ...safe } = settings;
  return safe;
}
