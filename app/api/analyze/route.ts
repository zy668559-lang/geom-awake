import crypto from "crypto";
import { NextResponse } from "next/server";
import { diagnoseGeometryWithGemini } from "@/lib/gemini";

export const maxDuration = 60;

type AnalyzeResult = {
  stuckPoint: string;
  rootCause: string;
  coachAdvice: string;
  threeDayPlan: Array<{ day: number; task: string }>;
  inputHashTail: string;
  fallback: boolean;
};

type ParseAnalyzePayload = {
  imageBase64: string;
  mimeType: string;
  cause: string;
  note: string;
  inputHash: string;
};

type CacheEntry = {
  expiresAt: number;
  value: AnalyzeResult;
};

const analyzeCache = new Map<string, CacheEntry>();
const inFlightAnalyze = new Map<string, Promise<AnalyzeResult>>();

function readIntEnv(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const ANALYZE_CACHE_TTL_MS = readIntEnv("ANALYZE_CACHE_TTL_MS", 120000);

function logMethodPath(req: Request, requestId: string, tag: string) {
  const pathname = new URL(req.url).pathname;
  console.log(`[Analyze API][${requestId}] ${tag} method=${req.method} path=${pathname}`);
}

function stripDataUrlPrefix(input: string): string {
  return input.includes(",") ? input.split(",").slice(1).join(",") : input;
}

function inferCauseFromNote(note: string): string {
  if (/辅?助线|画线|看图/.test(note)) return "draw_line";
  if (/条件|关系|因为|所以/.test(note)) return "condition_relation";
  if (/证明|推理|全等/.test(note)) return "proof_writing";
  return "draw_line";
}

function normalizeCause(cause: string, note: string): string {
  const normalized = (cause || "").trim();
  if (["draw_line", "condition_relation", "proof_writing"].includes(normalized)) {
    return normalized;
  }
  return inferCauseFromNote(note);
}

function buildInputHash(imageBytes: Buffer, note: string, cause: string): string {
  return crypto.createHash("sha256").update(imageBytes).update("|").update(note).update("|").update(cause).digest("hex");
}

function getAnalyzeCacheHit(key: string): AnalyzeResult | null {
  const cached = analyzeCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    analyzeCache.delete(key);
    return null;
  }

  return cached.value;
}

function setAnalyzeCache(key: string, value: AnalyzeResult) {
  analyzeCache.set(key, {
    value,
    expiresAt: Date.now() + ANALYZE_CACHE_TTL_MS,
  });
}

function buildFallback(input: { cause: string; note: string; inputHashTail: string; reason: string }): AnalyzeResult {
  const causeLabel =
    input.cause === "condition_relation"
      ? "条件关系"
      : input.cause === "proof_writing"
        ? "证明书写"
        : "画线切入";

  const noteSummary = (input.note || "没写卡点描述").slice(0, 80);

  return {
    stuckPoint: `你现在最卡的是：${causeLabel}这一步容易掉链子。`,
    rootCause: `我先按你的描述“${noteSummary}”做了兜底诊断，先把第一步抓稳。`,
    coachAdvice: "先用3分钟做一件事：圈出已知条件 -> 选最短推进线 -> 写第一句因为所以。",
    threeDayPlan: [
      { day: 1, task: "只做2题，专盯第一步，不追求整题做完。" },
      { day: 2, task: "每题固定写一句“因为...所以...”，先把关系写顺。" },
      { day: 3, task: "复盘今天最常断掉的那一步，明天先练它。" },
    ],
    inputHashTail: input.inputHashTail,
    fallback: true,
  };
}

function safeParseGeminiJson(raw: string, fallbackCause: string, fallbackNote: string, inputHashTail: string): AnalyzeResult {
  const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as {
      stuckPoint?: unknown;
      rootCause?: unknown;
      coachAdvice?: unknown;
      threeDayPlan?: unknown;
    };

    const plan = Array.isArray(parsed.threeDayPlan)
      ? parsed.threeDayPlan
          .map((item: any, index: number) => ({
            day: Number.isFinite(item?.day) ? Number(item.day) : index + 1,
            task: typeof item?.task === "string" ? item.task : "先看已知条件，再推进一步。",
          }))
          .slice(0, 3)
      : [];

    const finalPlan = plan.length === 3
      ? plan
      : [
          { day: 1, task: "先把题目里已知条件圈出来。" },
          { day: 2, task: "每题先写一句因为所以。" },
          { day: 3, task: "复盘最容易卡住的一步。" },
        ];

    return {
      stuckPoint:
        typeof parsed.stuckPoint === "string"
          ? parsed.stuckPoint
          : "你不是不会，是开头第一步经常踩偏。",
      rootCause:
        typeof parsed.rootCause === "string"
          ? parsed.rootCause
          : "关系没排顺就急着往下写，导致中途断层。",
      coachAdvice:
        typeof parsed.coachAdvice === "string"
          ? parsed.coachAdvice
          : "先慢3分钟：圈条件、选线、写第一句因为所以。",
      threeDayPlan: finalPlan,
      inputHashTail,
      fallback: false,
    };
  } catch {
    return buildFallback({
      cause: fallbackCause,
      note: fallbackNote,
      inputHashTail,
      reason: "GEMINI_PARSE_FAILED",
    });
  }
}

async function parseAnalyzePayload(req: Request): Promise<ParseAnalyzePayload> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const note = String(formData.get("note") || formData.get("stuckPoint") || "").trim();
    const rawCause = String(formData.get("cause") || "").trim();
    const cause = normalizeCause(rawCause, note);

    const imageEntry = formData.get("image");
    if (!(imageEntry instanceof File)) {
      throw new Error("缺少上传图片文件");
    }

    const imageBuffer = Buffer.from(await imageEntry.arrayBuffer());
    if (imageBuffer.length === 0) {
      throw new Error("上传图片为空");
    }

    const imageBase64 = imageBuffer.toString("base64");
    const mimeType = imageEntry.type || "image/png";
    const inputHash = buildInputHash(imageBuffer, note, cause);

    return { imageBase64, mimeType, cause, note, inputHash };
  }

  const jsonBody = (await req.json().catch(() => null)) as any;
  if (!jsonBody?.imageBase64 || typeof jsonBody.imageBase64 !== "string") {
    throw new Error("缺少上传图片");
  }

  const note = String(jsonBody.note || jsonBody.stuckPoint || "").trim();
  const cause = normalizeCause(String(jsonBody.cause || ""), note);
  const base64Raw = stripDataUrlPrefix(jsonBody.imageBase64);
  const imageBuffer = Buffer.from(base64Raw, "base64");
  if (imageBuffer.length === 0) {
    throw new Error("图片数据无效");
  }

  const inputHash = buildInputHash(imageBuffer, note, cause);
  const mimeType = "image/png";

  return { imageBase64: base64Raw, mimeType, cause, note, inputHash };
}

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const startedAt = Date.now();
  logMethodPath(req, requestId, "incoming");

  try {
    const payload = await parseAnalyzePayload(req);
    const inputHashTail = payload.inputHash.slice(-8);

    const cacheHit = getAnalyzeCacheHit(payload.inputHash);
    if (cacheHit) {
      console.log(`[Analyze API][${requestId}] cache hit hash=${payload.inputHash.slice(0, 8)}`);
      return NextResponse.json(cacheHit, { headers: { "x-analyze-cache": "HIT" } });
    }

    const runAnalyze = async (): Promise<AnalyzeResult> => {
      const forceFallback =
        req.headers.get("x-analyze-mock") === "1" ||
        process.env.MOCK_MODE === "true" ||
        process.env.FORCE_MOCK_ANALYZE === "true";

      if (forceFallback || !process.env.GEMINI_API_KEY) {
        return buildFallback({
          cause: payload.cause,
          note: payload.note,
          inputHashTail,
          reason: forceFallback ? "FORCED_FALLBACK" : "MISSING_GEMINI_KEY",
        });
      }

      try {
        const geminiText = await diagnoseGeometryWithGemini({
          imageBase64: payload.imageBase64,
          mimeType: payload.mimeType,
          cause: payload.cause,
          note: payload.note,
          requestId,
        });

        return safeParseGeminiJson(geminiText, payload.cause, payload.note, inputHashTail);
      } catch (error: any) {
        const status = Number(error?.status || 500);
        const shouldFallback = status === 403 || status === 429 || status >= 500;
        if (shouldFallback) {
          console.warn(
            `[Analyze API][${requestId}] Gemini failed status=${status}, returning deterministic fallback.`
          );
          return buildFallback({
            cause: payload.cause,
            note: payload.note,
            inputHashTail,
            reason: `GEMINI_${status}`,
          });
        }
        throw error;
      }
    };

    const existingInFlight = inFlightAnalyze.get(payload.inputHash);
    const analyzePromise =
      existingInFlight ||
      runAnalyze().finally(() => {
        inFlightAnalyze.delete(payload.inputHash);
      });

    if (!existingInFlight) {
      inFlightAnalyze.set(payload.inputHash, analyzePromise);
    } else {
      console.log(`[Analyze API][${requestId}] coalesced hash=${payload.inputHash.slice(0, 8)}`);
    }

    const result = await analyzePromise;
    setAnalyzeCache(payload.inputHash, result);

    return NextResponse.json(result, {
      headers: {
        "x-analyze-cache": existingInFlight ? "COALESCED" : "MISS",
      },
    });
  } catch (error: any) {
    console.error(`[Analyze API][${requestId}] request error`, error?.message || String(error));
    return NextResponse.json(
      {
        error: "诊断失败",
        message: error?.message || "请求解析失败，请重新上传后再试。",
        requestId,
      },
      { status: 400 }
    );
  } finally {
    console.log(`[Analyze API][${requestId}] completed in ${Date.now() - startedAt}ms`);
  }
}

export async function OPTIONS(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  logMethodPath(req, requestId, "preflight");

  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-analyze-mock",
    },
  });
}
