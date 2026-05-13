import type { Settings } from "@/types";
import { fetchApi } from "./api";

export async function getSettings(): Promise<Settings> {
  return fetchApi<Settings>("/api/settings");
}

export async function saveSettings(settings: Settings): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export async function testConnection(): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>("/api/settings/test", {
    method: "POST",
  });
}
