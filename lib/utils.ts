
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from "fs";
import path from "path";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Storage Helpers (Local JSON) ---
// Note: This works in local dev. On Vercel (Serverless), this is ephemeral.
// For a real Vercel app, use Vercel KV or a Database.

const DATA_DIR = path.join(process.cwd(), "data", "sessions");

export function saveSession(id: string, data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save session:", error);
    return false;
  }
}

export function getSession(id: string) {
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent);
    }
    return null;
  } catch (error) {
    console.error("Failed to read session:", error);
    return null;
  }
}
