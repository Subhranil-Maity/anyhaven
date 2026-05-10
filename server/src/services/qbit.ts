import { loadSettings } from "./settings.js";

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

let authCookie: string | null = null;

async function authenticate(): Promise<string> {
  const settings = await loadSettings();
  if (!settings) throw new Error("Settings not configured");

  const res = await fetch(`${settings.qbitUrl}/api/v2/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: settings.username || "",
      password: settings.password || "",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to authenticate with qBittorrent");
  }

  const text = await res.text();
  if (text !== "Ok.") {
    throw new Error("Authentication failed: " + text);
  }

  let cookieHeader = res.headers.get("set-cookie");
  if (!cookieHeader && typeof (res.headers as any).getSetCookie === "function") {
    const cookies = (res.headers as any).getSetCookie();
    if (cookies && cookies.length > 0) {
      cookieHeader = cookies.join(";");
    }
  }

  if (cookieHeader) {
    const match = cookieHeader.match(/SID=([^;]+)/);
    if (match) {
      authCookie = `SID=${match[1]}`;
      return authCookie;
    }
  }

  throw new Error("Could not find session cookie in response");
}

async function request(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const settings = await loadSettings();
  if (!settings) throw new Error("Settings not configured");

  if (!authCookie) {
    await authenticate();
  }

  let res = await fetch(`${settings.qbitUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: authCookie!,
    },
  });

  if (res.status === 403) {
    authCookie = null;
    await authenticate();
    res = await fetch(`${settings.qbitUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: authCookie!,
      },
    });
  }

  return res;
}

export async function testConnection(): Promise<boolean> {
  try {
    const res = await request("/api/v2/app/webapiVersion");
    console.log("qBit test connection:", await res.text());
    return res.ok;
  } catch (error) {
    console.log("qBit test connection failed:", error);
    return false;
  }
}

export async function getTorrents(): Promise<Torrent[]> {
  try {
    const res = await request("/api/v2/torrents/info");

    if (!res.ok) throw new Error(`qBit request failed: ${res.status}`);

    const torrents = await res.json();

    return torrents.map((t: any) => ({
      hash: t.hash,
      name: t.name,
      size: t.size,
      progress: t.progress,
      state: t.state,
      downloadSpeed: t.dl_speed,
      uploadSpeed: t.up_speed,
      eta: t.eta,
    }));
  } catch (error) {
    throw error;
  }
}

export async function addMagnet(magnet: string): Promise<void> {
  try {
    const res = await request("/api/v2/torrents/add", {
      method: "POST",
      body: new URLSearchParams({
        urls: magnet,
      }),
    });

    if (!res.ok) throw new Error(`Failed to add torrent: ${res.status}`);
  } catch (error) {
    throw error;
  }
}

export async function pauseTorrent(hash: string): Promise<void> {
  try {
    const res = await request("/api/v2/torrents/pause", {
      method: "POST",
      body: new URLSearchParams({
        hashes: hash,
      }),
    });

    if (!res.ok) throw new Error(`Failed to pause torrent: ${res.status}`);
  } catch (error) {
    throw error;
  }
}

export async function resumeTorrent(hash: string): Promise<void> {
  try {
    const res = await request("/api/v2/torrents/resume", {
      method: "POST",
      body: new URLSearchParams({
        hashes: hash,
      }),
    });

    if (!res.ok) throw new Error(`Failed to resume torrent: ${res.status}`);
  } catch (error) {
    throw error;
  }
}

export async function deleteTorrent(
  hash: string,
  deleteFiles: boolean = false
): Promise<void> {
  try {
    const res = await request("/api/v2/torrents/delete", {
      method: "POST",
      body: new URLSearchParams({
        hashes: hash,
        deleteFiles: deleteFiles ? "true" : "false",
      }),
    });

    if (!res.ok) throw new Error(`Failed to delete torrent: ${res.status}`);
  } catch (error) {
    throw error;
  }
}
