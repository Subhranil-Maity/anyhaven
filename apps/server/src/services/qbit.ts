import { Torrent, TorrentFile } from "@repo/shared/types/qbit";
import { loadSettings } from "./settings.js";



let authCookie: string | null = null;

function baseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

async function authenticate(): Promise<string> {
  const settings = await loadSettings();
  if (!settings) throw new Error("Settings not configured");

  const url = baseUrl(settings.qbitUrl);

  const res = await fetch(`${url}/api/v2/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": url + "/",
    },
    body: new URLSearchParams({
      username: settings.username || "",
      password: settings.password || "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to authenticate with qBittorrent (${res.status})`);
  }

  if (res.status === 204) {
    // qBittorrent ≥5.x returns 204 No Content on successful login
    // without a body. Fall through to extract the cookie.
  } else {
    const text = await res.text();
    if (text !== "Ok.") {
      throw new Error(`Authentication failed (${res.status}): "${text}"`);
    }
  }

  let cookieHeader: string | null = null;

  // Bun / modern runtimes: Set-Cookie is forbidden from Headers.get(),
  // must use the getSetCookie() accessor.
  if (typeof (res.headers as any).getSetCookie === "function") {
    const cookies = (res.headers as any).getSetCookie();
    if (cookies && cookies.length > 0) {
      cookieHeader = cookies.join(";");
    }
  }

  // Fallback for runtimes where getSetCookie() is not available.
  if (!cookieHeader) {
    cookieHeader = res.headers.get("set-cookie");
  }

  if (cookieHeader) {
    // qBittorrent v4.x uses "SID=...", v5.x+ uses "QBT_SID_<port>=..."
    const match = cookieHeader.match(/(QBT_SID_\d+|SID)=([^;]+)/);
    if (match) {
      authCookie = `${match[1]}=${match[2]}`;
      return authCookie;
    }
    console.warn(`[qbit] Set-Cookie header present but no session cookie found in: "${cookieHeader}"`);
  }

  throw new Error("Could not find session cookie in response");
}

async function request(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const settings = await loadSettings();
  if (!settings) throw new Error("Settings not configured");

  const url = baseUrl(settings.qbitUrl);

  if (!authCookie) {
    await authenticate();
  }

  let res = await fetch(`${url}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: authCookie!,
      "Referer": url + "/",
    },
  });

  if (res.status === 403) {
    authCookie = null;
    await authenticate();
    res = await fetch(`${url}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: authCookie!,
        "Referer": url + "/",
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

export async function getTorrents(includeFiles: boolean = false): Promise<Torrent[]> {
  try {
    const res = await request("/api/v2/torrents/info");

    if (!res.ok) throw new Error(`qBit request failed: ${res.status}`);

    const torrents = await res.json();
    
    if (!includeFiles) {
      return torrents.map((t: any) => ({
        hash: t.hash,
        name: t.name,
        size: t.size,
        progress: t.progress,
        state: t.state,
        downloadSpeed: t.dl_speed,
        uploadSpeed: t.up_speed,
        eta: t.eta,
        files: []
      }));
    }

    // Fetch files for each torrent concurrently (only if requested)
    return Promise.all(torrents.map(async (t: any) => {
      const files = await getTorrentFiles(t.hash).catch(() => []);
      
      return {
        hash: t.hash,
        name: t.name,
        size: t.size,
        progress: t.progress,
        state: t.state,
        downloadSpeed: t.dl_speed,
        uploadSpeed: t.up_speed,
        eta: t.eta,
        files: files.filter(f => f.priority > 0) // Only show files that are being downloaded
      };
    }));
  } catch (error) {
    throw error;
  }
}


/** Converts a nyaa.si view URL to its direct .torrent download URL. */
function toTorrentDownloadUrl(url: string): string {
  // Already a direct download link (ends with .torrent or is a magnet)
  if (url.startsWith("magnet:") || url.endsWith(".torrent")) return url;
  // nyaa.si/view/XXXXXX  →  nyaa.si/download/XXXXXX.torrent
  return url.replace("nyaa.si/view/", "nyaa.si/download/") + ".torrent";
}

export async function addTorrent(torrentUrl: string): Promise<void> {
  const settings = await loadSettings();
  if (!settings) throw new Error("Settings not configured");

  const host = baseUrl(settings.qbitUrl);

  if (!authCookie) await authenticate();

  if (torrentUrl.startsWith("magnet:")) {
    // Magnet link — pass directly via URL-encoded form.
    const res = await request("/api/v2/torrents/add", {
      method: "POST",
      body: new URLSearchParams({ urls: torrentUrl, category: "anyhaven" }),
    });
    if (!res.ok) throw new Error(`Failed to add magnet: ${res.status}`);
    return;
  }

  // .torrent file — fetch the binary on our server, then upload as multipart.
  // This is more reliable than having qBit reach out to nyaa.si directly.
  const dlUrl = toTorrentDownloadUrl(torrentUrl);
  console.log(`[qbit] Fetching torrent file from: ${dlUrl}`);

  const torrentRes = await fetch(dlUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; anyhaven/1.0)" },
  });
  if (!torrentRes.ok) {
    throw new Error(`Failed to fetch .torrent file (${torrentRes.status}): ${dlUrl}`);
  }

  const torrentBuffer = await torrentRes.arrayBuffer();
  const form = new FormData();
  form.append(
    "torrents",
    new Blob([torrentBuffer], { type: "application/x-bittorrent" }),
    "download.torrent"
  );
  form.append("category", "anyhaven");

  const res = await fetch(`${host}/api/v2/torrents/add`, {
    method: "POST",
    headers: { Cookie: authCookie!, Referer: host + "/" },
    body: form,
  });

  if (res.status === 403) {
    authCookie = null;
    await authenticate();
    const retry = await fetch(`${host}/api/v2/torrents/add`, {
      method: "POST",
      headers: { Cookie: authCookie!, Referer: host + "/" },
      body: form,
    });
    if (!retry.ok) throw new Error(`Failed to add torrent after re-auth: ${retry.status}`);
    return;
  }

  if (!res.ok) throw new Error(`Failed to add torrent: ${res.status}`);
}

export async function addMagnet(magnet: string): Promise<void> {
  return addTorrent(magnet);
}


// ─── File-level management ──────────────────────────────────────────────────

/** Returns the list of files inside a torrent with their 0-based indices. */
export async function getTorrentFiles(hash: string): Promise<TorrentFile[]> {
  const res = await request(`/api/v2/torrents/files?hash=${hash}`);
  if (!res.ok) throw new Error(`Failed to get torrent files: ${res.status}`);
  const files = await res.json();
  return files.map((f: any, index: number) => ({
    index,
    name: f.name as string,
    size: f.size as number,
    progress: f.progress as number,
    priority: f.priority as number,
  }));
}

/** Sets the download priority of specific file indices within a torrent.
 *  priority 0 = skip, 1 = normal, 6 = high, 7 = maximum */
export async function setFilePriority(
  hash: string,
  fileIndices: number[],
  priority: number
): Promise<void> {
  const res = await request("/api/v2/torrents/filePrio", {
    method: "POST",
    body: new URLSearchParams({
      hash,
      id: fileIndices.join("|"),
      priority: String(priority),
    }),
  });
  if (!res.ok) throw new Error(`Failed to set file priority: ${res.status}`);
}

/** Strips directory prefix from a torrent file path so we can compare bare names. */
function baseName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath;
}

/**
 * Per-torrent promise queue to serialize concurrent file-selection requests.
 * Key: infoHash (preferred) or torrent URL. Value: tail of the current promise chain.
 */
const torrentQueues = new Map<string, Promise<void>>();


/**
 * Public entry point. Enqueues the file-selection work for this torrent so that
 * concurrent clicks for the same torrent are processed one-at-a-time. This eliminates
 * the race condition where two rapid clicks both take the "fresh torrent" code path,
 * causing the second one's deselect-all to wipe out the first one's file selection.
 */
export function addTorrentWithFileSelection(
  torrentUrl: string,
  targetFile: string,
  releaseFiles: string[],
  infoHash?: string
): Promise<void> {
  const queueKey = infoHash ?? torrentUrl;
  const prev = torrentQueues.get(queueKey) ?? Promise.resolve();

  const next = prev
    .then(() =>
      _doAddTorrentWithFileSelection(torrentUrl, targetFile, releaseFiles, infoHash)
    )
    .catch((err) => {
      // Log but don't break the queue for future tasks on the same torrent.
      console.error(`[qbit] File selection failed for "${targetFile}":`, err);
    });

  torrentQueues.set(queueKey, next);

  // Prune the queue entry after 5 min to avoid memory leaks.
  next.finally(() => {
    setTimeout(() => {
      if (torrentQueues.get(queueKey) === next) torrentQueues.delete(queueKey);
    }, 5 * 60 * 1000);
  });

  return next;
}

/**
 * Internal implementation. Never call this directly – use addTorrentWithFileSelection.
 * If a torrent from the same release is already tracked in qBittorrent it just enables
 * the requested file. Otherwise it adds the torrent fresh and deselects all other files.
 */
async function _doAddTorrentWithFileSelection(
  torrentUrl: string,
  targetFile: string,
  releaseFiles: string[],
  infoHash?: string
): Promise<void> {
  // ── 1. Check if the release torrent is already in qBittorrent ──────────────
  const existingTorrents = await getTorrents(false);

  // Fast path: if we have the infoHash, check directly (O(1) lookup).
  if (infoHash) {
    const normalizedHash = infoHash.toLowerCase();
    const existing = existingTorrents.find(
      (t) => t.hash.toLowerCase() === normalizedHash
    );
    if (existing) {
      console.log(`[qbit] Torrent ${normalizedHash} already exists, selecting file.`);
      const qFiles = await getTorrentFiles(existing.hash);
      const targetQFile = qFiles.find((f) => {
        const bn = baseName(f.name);
        return bn === targetFile || bn.includes(targetFile) || targetFile.includes(bn);
      });
      if (targetQFile) {
        await setFilePriority(existing.hash, [targetQFile.index], 1);
        console.log(`[qbit] Enabled "${targetFile}" in existing torrent ${existing.hash}`);
        return;
      }
    }
  }

  // Slow path: probe all existing torrents concurrently by file name matching.
  const probeResults = await Promise.allSettled(
    existingTorrents.map(async (torrent) => {
      const qFiles = await getTorrentFiles(torrent.hash);
      return { torrent, qFiles };
    })
  );

  for (const result of probeResults) {
    if (result.status !== "fulfilled") continue;
    const { torrent, qFiles } = result.value;
    const qBaseNames = qFiles.map((f) => baseName(f.name));

    // Consider it a match when ≥ 1 release file name is present in the torrent.
    const isMatch = releaseFiles.some((rf) =>
      qBaseNames.some(
        (qf) => qf === rf || qf.includes(rf) || rf.includes(qf)
      )
    );

    if (isMatch) {
      // Found it – enable the target file in the existing torrent.
      const targetQFile = qFiles.find((f) => {
        const bn = baseName(f.name);
        return (
          bn === targetFile || bn.includes(targetFile) || targetFile.includes(bn)
        );
      });

      if (targetQFile) {
        await setFilePriority(torrent.hash, [targetQFile.index], 1);
        console.log(
          `[qbit] Enabled file "${targetFile}" in existing torrent ${torrent.hash}`
        );
        return;
      }
    }
  }

  // ── 2. Torrent not found – add it fresh ────────────────────────────────────

  const knownHashes = new Set(existingTorrents.map((t) => t.hash));
  await addTorrent(torrentUrl);

  // Poll for up to 30 s waiting for qBit to register the new torrent.
  let newHash: string | null = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    const current = await getTorrents(false);
    const newTorrent = current.find((t) => !knownHashes.has(t.hash));
    if (newTorrent) {
      newHash = newTorrent.hash;
      break;
    }
  }

  if (!newHash) {
    throw new Error("Torrent was sent but could not be found in qBittorrent after 30s.");
  }

  // Give qBit a couple of seconds to populate the file list.
  await new Promise((r) => setTimeout(r, 2000));

  const qFiles = await getTorrentFiles(newHash);

  if (qFiles.length === 0) {
    // No file data yet (e.g. magnet still resolving metadata) – bail gracefully.
    console.warn("[qbit] No files found yet for new torrent; skipping file selection.");
    return;
  }

  // Deselect everything first, then enable only the target file.
  await setFilePriority(
    newHash,
    qFiles.map((f) => f.index),
    0
  );

  const targetQFile = qFiles.find((f) => {
    const bn = baseName(f.name);
    return (
      bn === targetFile || bn.includes(targetFile) || targetFile.includes(bn)
    );
  });

  if (targetQFile) {
    await setFilePriority(newHash, [targetQFile.index], 1);
    console.log(`[qbit] Selected file "${targetFile}" in new torrent ${newHash}`);
  } else {
    // Fallback: enable all so the download isn't stuck.
    await setFilePriority(
      newHash,
      qFiles.map((f) => f.index),
      1
    );
    console.warn(
      `[qbit] Could not locate "${targetFile}" in torrent; enabled all files as fallback.`
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────

export async function pauseTorrent(hash: string): Promise<void> {
  try {
    let res = await request("/api/v2/torrents/stop", {
      method: "POST",
      body: new URLSearchParams({
        hashes: hash,
      }),
    });

    if (res.status === 404) {
      // Fallback for older qBittorrent versions (< v5.0.0)
      res = await request("/api/v2/torrents/pause", {
        method: "POST",
        body: new URLSearchParams({
          hashes: hash,
        }),
      });
    }

    if (!res.ok) throw new Error(`Failed to pause torrent: ${res.status}`);
  } catch (error) {
    throw error;
  }
}

export async function resumeTorrent(hash: string): Promise<void> {
  try {
    let res = await request("/api/v2/torrents/start", {
      method: "POST",
      body: new URLSearchParams({
        hashes: hash,
      }),
    });

    if (res.status === 404) {
      // Fallback for older qBittorrent versions (< v5.0.0)
      res = await request("/api/v2/torrents/resume", {
        method: "POST",
        body: new URLSearchParams({
          hashes: hash,
        }),
      });
    }

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
