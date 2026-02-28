import fs from "fs";
import path from "path";
import crypto from "crypto";

const memoryCache = new Map<string, string>();
let cacheDir: string | null = null;
let cacheMode: "fs" | "memory" = "memory";
let initDone = false;

function initCache() {
  if (initDone) return;
  initDone = true;

  const preferredDir = process.env.VERCEL
    ? path.join("/tmp", "geometry-cache")
    : path.join(process.cwd(), "data", "cache");

  try {
    fs.mkdirSync(preferredDir, { recursive: true });
    fs.accessSync(preferredDir, fs.constants.W_OK);
    cacheDir = preferredDir;
    cacheMode = "fs";
    console.log(`[Cache] Initialized fs cache dir: ${preferredDir}`);
  } catch (error) {
    cacheMode = "memory";
    cacheDir = null;
    console.warn(`[Cache] FS cache disabled, fallback to memory cache. reason=${String(error)}`);
  }
}

export function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function getCachedResult(hash: string): string | null {
  initCache();

  if (cacheMode === "memory") {
    const hit = memoryCache.get(hash);
    if (hit) {
      console.log(`[Cache] Hit (memory) hash=${hash.substring(0, 8)}`);
      return hit;
    }
    return null;
  }

  const cachePath = path.join(cacheDir as string, `${hash}.txt`);
  if (fs.existsSync(cachePath)) {
    console.log(`[Cache] Hit (fs) hash=${hash.substring(0, 8)}`);
    return fs.readFileSync(cachePath, "utf-8");
  }

  return null;
}

export function setCachedResult(hash: string, result: string) {
  initCache();

  if (cacheMode === "memory") {
    memoryCache.set(hash, result);
    console.log(`[Cache] Saved (memory) hash=${hash.substring(0, 8)}`);
    return;
  }

  const cachePath = path.join(cacheDir as string, `${hash}.txt`);
  fs.writeFileSync(cachePath, result, "utf-8");
  console.log(`[Cache] Saved (fs) hash=${hash.substring(0, 8)}`);
}
