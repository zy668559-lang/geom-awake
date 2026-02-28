import crypto from "crypto";
import { NextResponse } from "next/server";
import { identifyGeometry } from "@/lib/gemini";

export const maxDuration = 60;

type AnalyzeResult = {
  stuckPoint: string;
  rootCause: string;
  coachAdvice: string;
  threeDayPlan: Array<{ day: number; task: string }>;
};

type CacheEntry = {
  expiresAt: number;
  value: AnalyzeResult;
};

const analyzeCache = new Map<string, CacheEntry>();
const inFlightAnalyze = new Map<string, Promise<AnalyzeResult>>();
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function readIntEnv(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const ANALYZE_MAX_RETRIES = readIntEnv("ANALYZE_MAX_RETRIES", 3);
const ANALYZE_BASE_BACKOFF_MS = readIntEnv("ANALYZE_BACKOFF_BASE_MS", 800);
const ANALYZE_CACHE_TTL_MS = readIntEnv("ANALYZE_CACHE_TTL_MS", 120000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logMethodPath(req: Request, requestId: string, tag: string) {
  const pathname = new URL(req.url).pathname;
  console.log(`[Analyze API][${requestId}] ${tag} method=${req.method} path=${pathname}`);
}

function makeAnalyzeCacheKey(payload: {
  imageBase64: string;
  stuckPoint: string;
  messages: unknown[];
}) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
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

function buildMockResult(stuckPoint: string): AnalyzeResult {
  return {
    stuckPoint: stuckPoint || "你不是不会做，是第一步总是踩偏。",
    rootCause: "你急着一步到位，关键关系没有先排好顺序。",
    coachAdvice: "今晚先慢半拍：先圈条件，再选一条最短推进线。",
    threeDayPlan: [
      { day: 1, task: "每天只做2题，先练看点-选线。" },
      { day: 2, task: "每题先写第一句：因为...所以...。" },
      { day: 3, task: "做完后复盘5分钟：今天到底卡在哪一步。" },
    ],
  };
}

function safeParseAnalyzeResult(raw: string, fallbackStuckPoint: string, requestId: string): AnalyzeResult {
  const normalized = raw.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(normalized) as AnalyzeResult;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("parsed payload is not object");
    }

    if (
      typeof parsed.stuckPoint !== "string" ||
      typeof parsed.rootCause !== "string" ||
      typeof parsed.coachAdvice !== "string" ||
      !Array.isArray(parsed.threeDayPlan)
    ) {
      throw new Error("parsed payload missing required fields");
    }

    return parsed;
  } catch (error) {
    console.warn(
      `[Analyze API][${requestId}] DeepSeek content is not valid JSON. fallback to mock. reason=${String(error)}`
    );
    return buildMockResult(fallbackStuckPoint);
  }
}

async function callDeepSeekWithRetry(params: {
  requestId: string;
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}) {
  const { requestId, baseURL, apiKey, model, systemPrompt, userPrompt } = params;
  const totalAttempts = ANALYZE_MAX_RETRIES + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    const attemptTag = `[Analyze API][${requestId}][DeepSeek attempt ${attempt}/${totalAttempts}]`;
    console.log(`${attemptTag} Sending request...`);

    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("DeepSeek returned empty content");
      }
      return content;
    }

    const errText = await resp.text();
    const isRetryable = RETRYABLE_STATUSES.has(resp.status);
    console.warn(
      `${attemptTag} failed with ${resp.status}. retryable=${isRetryable}. body=${errText.slice(0, 300)}`
    );

    if (!isRetryable || attempt === totalAttempts) {
      const err: any = new Error(`DeepSeek API Error ${resp.status}: ${errText || resp.statusText}`);
      err.status = resp.status;
      err.rawData = { errorText: errText };
      throw err;
    }

    const jitter = Math.floor(Math.random() * 200);
    const backoffMs = ANALYZE_BASE_BACKOFF_MS * 2 ** (attempt - 1) + jitter;
    console.log(`${attemptTag} backoff ${backoffMs}ms before retry.`);
    await sleep(backoffMs);
  }

  throw new Error("DeepSeek retry loop ended unexpectedly");
}

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const startedAt = Date.now();
  logMethodPath(req, requestId, "incoming");

  try {
    const body = await req.json().catch(() => null);
    const imageBase64 = body?.imageBase64 as string | undefined;
    const stuckPoint = (body?.stuckPoint as string | undefined) || "";
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!imageBase64) {
      return NextResponse.json(
        { error: "请上传题目图片", message: "缺少上传图片，请返回重新上传后再试。" },
        { status: 400 }
      );
    }

    const payloadForCache = { imageBase64, stuckPoint, messages };
    const cacheKey = makeAnalyzeCacheKey(payloadForCache);

    const cached = getAnalyzeCacheHit(cacheKey);
    if (cached) {
      console.log(`[Analyze API][${requestId}] cache hit key=${cacheKey.slice(0, 8)}`);
      return NextResponse.json(cached, { headers: { "x-analyze-cache": "HIT" } });
    }

    const runAnalyze = async (): Promise<AnalyzeResult> => {
      const mockMode = process.env.MOCK_MODE === "true" || process.env.FORCE_MOCK_ANALYZE === "true";
      const missingRequiredKeys = !process.env.GEMINI_API_KEY || !process.env.DEEPSEEK_API_KEY;
      if (mockMode || missingRequiredKeys) {
        const reason = mockMode ? "MOCK_MODE enabled" : "Gemini/DeepSeek key missing";
        console.log(`[Analyze API][${requestId}] mock fallback enabled (${reason}).`);
        const mock = buildMockResult(stuckPoint);
        setAnalyzeCache(cacheKey, mock);
        return mock;
      }

      const geometryDescription = await identifyGeometry(imageBase64);

      const systemPrompt =
        "你是初中几何教练。请只输出 JSON，字段必须包含: stuckPoint, rootCause, coachAdvice, threeDayPlan(长度3，每项含day/task)。";
      const userPrompt = `题目描述: ${geometryDescription}\n学生卡点: ${stuckPoint || "未提供"}`;

      const content = await callDeepSeekWithRetry({
        requestId,
        baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY as string,
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        systemPrompt,
        userPrompt,
      });

      const parsed = safeParseAnalyzeResult(content, stuckPoint, requestId);
      setAnalyzeCache(cacheKey, parsed);
      return parsed;
    };

    const existingInFlight = inFlightAnalyze.get(cacheKey);
    const analyzePromise =
      existingInFlight ||
      runAnalyze().finally(() => {
        inFlightAnalyze.delete(cacheKey);
      });

    if (!existingInFlight) {
      inFlightAnalyze.set(cacheKey, analyzePromise);
    } else {
      console.log(`[Analyze API][${requestId}] coalesced in-flight key=${cacheKey.slice(0, 8)}`);
    }

    try {
      const result = await analyzePromise;
      return NextResponse.json(result, {
        headers: { "x-analyze-cache": existingInFlight ? "COALESCED" : "MISS" },
      });
    } catch (error: any) {
      console.error(`[Analyze API][${requestId}] upstream failed, fallback to mock`, error?.message || error);
      const fallback = buildMockResult(stuckPoint);
      setAnalyzeCache(cacheKey, fallback);
      return NextResponse.json(fallback, {
        status: 200,
        headers: {
          "x-analyze-cache": "FALLBACK",
          "x-analyze-fallback": "UPSTREAM_ERROR",
        },
      });
    }
  } catch (error: any) {
    console.error(`[Analyze API][${requestId}] fatal`, error?.message || error);
    return NextResponse.json(
      {
        error: "诊断失败",
        message: error?.message || "诊断服务暂时不可用，请稍后重试。",
        details: error?.message || String(error),
        requestId,
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startedAt;
    console.log(`[Analyze API][${requestId}] completed in ${duration}ms`);
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
