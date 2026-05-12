import { mkdir, access } from "fs/promises";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export interface Settings {
  qbitUrl: string;
  username: string;
  password?: string;
}

// const SETTINGS_FILE = join(process.cwd(), ".settings.json");
const SETTINGS_FILE = process.env.CONFIG_PATH || join(process.cwd(), ".settings.json");
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
async function ensureSettingsFile() {
  if (!(await fileExists(SETTINGS_FILE))) {
    await mkdir(join(SETTINGS_FILE, ".."), { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify({ qbitUrl: "", username: "", password: "" }, null, 2));
  }
}
export async function loadSettings(): Promise<Settings | null> {
  try {
    await ensureSettingsFile();
    const content = await readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(content);
  } catch(e) {
    console.error("Error loading settings:", e);
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
