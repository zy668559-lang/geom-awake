import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export function generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

export function getCachedResult(hash: string): string | null {
    const cachePath = path.join(CACHE_DIR, `${hash}.txt`);
    if (fs.existsSync(cachePath)) {
        console.log(`[Cache] 🎯 Hit! Found cached result for hash: ${hash.substring(0, 8)}`);
        return fs.readFileSync(cachePath, 'utf-8');
    }
    return null;
}

export function setCachedResult(hash: string, result: string) {
    const cachePath = path.join(CACHE_DIR, `${hash}.txt`);
    fs.writeFileSync(cachePath, result, 'utf-8');
    console.log(`[Cache] 💾 Saved result for hash: ${hash.substring(0, 8)}`);
}
