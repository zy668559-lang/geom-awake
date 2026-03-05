import sharp from "sharp";
import { generateHash, getCachedResult, setCachedResult } from "./cache";
import { buildDiagnoseUserPrompt, DIAGNOSE_SYSTEM_PROMPT } from "@/prompts/diagnose";

export type GeminiDiagnoseInput = {
  imageBase64: string;
  mimeType: string;
  cause: string;
  note: string;
  requestId: string;
};

class VisionApiError extends Error {
  status?: number;
  rawData?: unknown;

  constructor(message: string, status?: number, rawData?: unknown) {
    super(message);
    this.name = "VisionApiError";
    this.status = status;
    this.rawData = rawData;
  }
}

class VisionQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await task());
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
      if (task) await task();
    }
    this.processing = false;
  }
}

const visionQueue = new VisionQueue();
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

function resolveVisionProvider(): "dashscope" | "gemini" {
  if (process.env.DASHSCOPE_API_KEY) return "dashscope";
  return "gemini";
}

function parseOpenAICompatibleText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const textParts = content
      .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
      .filter(Boolean);
    return textParts.join("\n").trim();
  }
  return "";
}

async function callDashScopeVision(input: GeminiDiagnoseInput, optimizedData: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new VisionApiError("DASHSCOPE_API_KEY is not configured", 403);
  }

  const model = process.env.DASHSCOPE_VISION_MODEL || "qwen-vl-max-latest";
  const userPrompt = buildDiagnoseUserPrompt(input.cause, input.note);
  const imageDataUrl = `data:image/jpeg;base64,${optimizedData}`;

  const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DIAGNOSE_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const rawText = await response.text();
    throw new VisionApiError(`DashScope error ${response.status}: ${rawText || response.statusText}`, response.status, {
      rawText,
    });
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = parseOpenAICompatibleText(content);
  if (!text) {
    throw new VisionApiError("DashScope returned empty text", 502, data);
  }
  return text;
}

async function callGeminiVision(input: GeminiDiagnoseInput, optimizedData: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new VisionApiError("GEMINI_API_KEY is not configured", 403);
  }

  const userPrompt = buildDiagnoseUserPrompt(input.cause, input.note);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: DIAGNOSE_SYSTEM_PROMPT }] },
        contents: [
          {
            parts: [
              { text: userPrompt },
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
    throw new VisionApiError(`Gemini error ${response.status}: ${rawText || response.statusText}`, response.status, {
      rawText,
    });
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new VisionApiError("Gemini returned empty text", 502, data);
  }
  return text;
}

export async function diagnoseGeometryWithGemini(input: GeminiDiagnoseInput): Promise<string> {
  const { imageBase64, cause, note, requestId } = input;
  const contentHash = generateHash(`${imageBase64}|${cause}|${note}`);
  const cached = getCachedResult(contentHash);
  if (cached) {
    console.log(`[Vision][${requestId}] cache hit key=${contentHash.slice(0, 8)}`);
    return cached;
  }

  return visionQueue.add(async () => {
    const optimizedData = await optimizeImage(imageBase64);
    const provider = resolveVisionProvider();
    console.log(`[Vision][${requestId}] provider=${provider}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const attemptTag = `[Vision][${requestId}] attempt ${attempt}/${MAX_RETRIES}`;
      try {
        const text =
          provider === "dashscope"
            ? await callDashScopeVision(input, optimizedData)
            : await callGeminiVision(input, optimizedData);

        setCachedResult(contentHash, text);
        return text;
      } catch (error) {
        if (error instanceof VisionApiError) {
          const status = Number(error.status || 500);
          const retryable = RETRYABLE_STATUSES.has(status);
          console.warn(`${attemptTag} failed provider=${provider} status=${status} retryable=${retryable}`);
          if (!retryable || attempt === MAX_RETRIES) {
            throw error;
          }
          await sleep(300 * 2 ** (attempt - 1));
          continue;
        }

        const asMessage = error instanceof Error ? error.message : String(error);
        console.warn(`${attemptTag} unexpected error=${asMessage}`);
        if (attempt === MAX_RETRIES) {
          throw new VisionApiError(`Vision request failed: ${asMessage}`, 500);
        }
        await sleep(300 * 2 ** (attempt - 1));
      }
    }

    throw new VisionApiError("Vision retry exhausted", 500);
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
