import sharp from "sharp";
import { generateHash, getCachedResult, setCachedResult } from "./cache";

export type GeminiDiagnoseInput = {
  imageBase64: string;
  mimeType: string;
  cause: string;
  note: string;
  requestId: string;
};

class GeminiApiError extends Error {
  status?: number;
  rawData?: unknown;

  constructor(message: string, status?: number, rawData?: unknown) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
    this.rawData = rawData;
  }
}

class GeminiQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const value = await task();
          resolve(value);
        } catch (error) {
          reject(error);
        }
      });
      void this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.processing = false;
  }
}

const geminiQueue = new GeminiQueue();
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripDataUrlPrefix(input: string): string {
  return input.includes(",") ? input.split(",").slice(1).join(",") : input;
}

async function optimizeImage(base64: string): Promise<string> {
  const raw = Buffer.from(stripDataUrlPrefix(base64), "base64");
  const optimized = await sharp(raw)
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  return optimized.toString("base64");
}

function buildPrompt(cause: string, note: string): string {
  return [
    "你是陈老师，做初中几何思维诊断。请结合图片和学生描述输出严格 JSON。",
    "禁止直接给最终解题答案，只能给诊断和纠偏动作。",
    "文风要求：口语化、短句、家长能听懂，不要堆术语。",
    "输出字段必须是: stuckPoint, rootCause, coachAdvice, riskWarning, threeDayPlan。",
    "threeDayPlan 必须是长度3的数组，每个元素包含 day(1-3) 和 task(一句话，可立刻执行)。",
    "riskWarning 必须是一句话，说明不修这个问题会丢什么分或出什么后果。",
    `错因线索: ${cause || "unknown"}`,
    `学生卡点描述: ${note || "未提供"}`,
  ].join("\n");
}

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiApiError("GEMINI_API_KEY is not configured", 403);
  }
  return apiKey;
}

export async function diagnoseGeometryWithGemini(input: GeminiDiagnoseInput): Promise<string> {
  const { imageBase64, cause, note, requestId } = input;
  const apiKey = getApiKey();

  const contentHash = generateHash(`${imageBase64}|${cause}|${note}`);
  const cached = getCachedResult(contentHash);
  if (cached) {
    console.log(`[Gemini][${requestId}] cache hit key=${contentHash.slice(0, 8)}`);
    return cached;
  }

  return geminiQueue.add(async () => {
    const optimizedData = await optimizeImage(imageBase64);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const attemptTag = `[Gemini][${requestId}] attempt ${attempt}/${MAX_RETRIES}`;
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: buildPrompt(cause, note) },
                    { inlineData: { data: optimizedData, mimeType: "image/jpeg" } },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
                maxOutputTokens: 1200,
              },
            }),
          }
        );

        if (!response.ok) {
          const rawText = await response.text();
          const status = response.status;
          const retryable = RETRYABLE_STATUSES.has(status);
          console.warn(`${attemptTag} failed status=${status} retryable=${retryable}`);

          if (!retryable || attempt === MAX_RETRIES) {
            throw new GeminiApiError(`Gemini error ${status}: ${rawText || response.statusText}`, status, {
              rawText,
            });
          }

          await sleep(300 * 2 ** (attempt - 1));
          continue;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text || typeof text !== "string") {
          throw new GeminiApiError("Gemini returned empty text", 502, data);
        }

        setCachedResult(contentHash, text);
        return text;
      } catch (error) {
        if (error instanceof GeminiApiError) {
          throw error;
        }

        const asMessage = error instanceof Error ? error.message : String(error);
        console.warn(`${attemptTag} unexpected error=${asMessage}`);

        if (attempt === MAX_RETRIES) {
          throw new GeminiApiError(`Gemini request failed: ${asMessage}`, 500);
        }

        await sleep(300 * 2 ** (attempt - 1));
      }
    }

    throw new GeminiApiError("Gemini retry exhausted", 500);
  });
}

export async function identifyGeometry(imageBase64: string): Promise<string> {
  return diagnoseGeometryWithGemini({
    imageBase64,
    mimeType: "image/png",
    cause: "legacy",
    note: "legacy",
    requestId: "LEGACY",
  });
}
