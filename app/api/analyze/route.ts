import { NextResponse } from "next/server";
import crypto from "crypto";
import { identifyGeometry } from "@/lib/gemini";

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
    stuckPoint: stuckPoint || "孩子目前的识图卡点是：对图形中的隐形辅助线不敏感。",
    rootCause: "这道题像是有个机关藏在地基下，关键中点还没被看见。",
    coachAdvice: "今晚先别急着刷题，先把题里所有已知条件画到图上，再找能连的线。",
    threeDayPlan: [
      { day: 1, task: "找3道类似图形，只画辅助线，不写过程。" },
      { day: 2, task: "挑1道题，完整写出推理链条。" },
      { day: 3, task: "复盘错因，口述一次完整思路。" },
    ],
  };
}

async function callDeepSeekWithRetry(params: {
  requestId: string;
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: unknown[];
}) {
  const { requestId, baseURL, apiKey, model, systemPrompt, messages } = params;
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
        messages: [{ role: "system", content: systemPrompt }, ...(messages || [])],
        temperature: 0.7,
        max_tokens: 2000,
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
      `${attemptTag} Failed with ${resp.status}. Retryable=${isRetryable}. Body=${errText.slice(0, 300)}`
    );

    if (!isRetryable || attempt === totalAttempts) {
      const err: any = new Error(`DeepSeek API Error ${resp.status}: ${errText || resp.statusText}`);
      err.status = resp.status;
      err.rawData = { errorText: errText };
      throw err;
    }

    const jitter = Math.floor(Math.random() * 200);
    const backoffMs = ANALYZE_BASE_BACKOFF_MS * 2 ** (attempt - 1) + jitter;
    console.log(`${attemptTag} Backing off for ${backoffMs}ms before retry.`);
    await sleep(backoffMs);
  }

  throw new Error("DeepSeek retry loop ended unexpectedly");
}

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const startTime = Date.now();
  console.log(`🚀 [Analyze API][${requestId}] Request Started at ${new Date().toISOString()}`);

  // 强制确认 Key 存在
  console.log(`🔥🔥🔥 [Analyze API Key Check][${requestId}] Gemini Key 前五位:`, process.env.GEMINI_API_KEY?.substring(0, 5) || 'NULL!!!');

  try {
    const body = await req.json();
    const { imageBase64, stuckPoint, messages } = body as {
      imageBase64?: string;
      stuckPoint?: string;
      messages?: unknown[];
    };
    const imgSizeKB = imageBase64 ? Math.round(imageBase64.length / 1024) : 0;

    console.log(`--- [Step 1][${requestId}] Image Received. Size: ${imgSizeKB}KB. Stuck: ${stuckPoint} ---`);

    if (!imageBase64) {
      console.warn(`⚠️ [Step 1 Error][${requestId}] Missing imageBase64`);
      return NextResponse.json({ error: "请上传题目图片" }, { status: 400 });
    }

    const payloadForCache = {
      imageBase64,
      stuckPoint: stuckPoint || "",
      messages: Array.isArray(messages) ? messages : [],
    };
    const cacheKey = makeAnalyzeCacheKey(payloadForCache);
    const cached = getAnalyzeCacheHit(cacheKey);
    if (cached) {
      console.log(
        `[Analyze API][${requestId}] Cache hit for key=${cacheKey.slice(
          0,
          8
        )}, ttl=${ANALYZE_CACHE_TTL_MS}ms`
      );
      return NextResponse.json(cached, { headers: { "x-analyze-cache": "HIT" } });
    }

    const runAnalyze = async (): Promise<AnalyzeResult> => {
      // 0. Mock or local fallback check
      const mockMode = process.env.MOCK_MODE === "true" || process.env.FORCE_MOCK_ANALYZE === "true";
      const missingRequiredKeys = !process.env.GEMINI_API_KEY || !process.env.DEEPSEEK_API_KEY;
      if (mockMode || missingRequiredKeys) {
        const reason = mockMode ? "MOCK_MODE enabled" : "Gemini/DeepSeek key missing";
        console.log(`[Analyze API][${requestId}] Mock fallback enabled (${reason}).`);
        const mock = buildMockResult(stuckPoint || "");
        setAnalyzeCache(cacheKey, mock);
        return mock;
      }

      // 2. 调用 Gemini 识图
      console.log(`--- [Step 2][${requestId}] Triggering Gemini Vision ---`);
      const geometryDescription = await identifyGeometry(imageBase64);
      console.log(
        `--- [Step 3][${requestId}] Gemini recognition success! Result length: ${geometryDescription.length} ---`
      );

      // 3. 调用 DeepSeek 推理
      console.log(`--- [Step 4][${requestId}] Handing over to DeepSeek ---`);
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

      if (!apiKey) {
        console.error(`❌ [Step 4 Error][${requestId}] DEEPSEEK_API_KEY is missing!`);
        throw new Error("DEEPSEEK_API_KEY is not configured");
      }

      const systemPrompt = `
你是陈老师，一位有20年经验教初中几何的教练。你的风格是：
1. **邻居大姐口吻**：亲切、通俗、接地气。严禁使用"掌握薄弱"、"逻辑断层"、"知识点缺失"等术语。
2. **灵魂诊断**：你要根据图形描述和孩子觉得难的地方（卡点），找出那个最关键的"隐形陷阱"。
3. **具体建议**：给出一个具体的、今晚就能做的3天练习计划。

**必须使用的语气示例**：
- "这道题有个隐形陷阱，孩子没瞧见。"
- "这题就像走路绕了远路，其实有个近道孩子还没发现。"
- "咱们不急，先找那个躲起来的中点。"

**输入信息**：
- 题目描述：${geometryDescription}
- 孩子觉得难在哪：${stuckPoint || "未提供"}

请返回 JSON 格式（严禁返回 Markdown 代码块，只返回纯 JSON 字符串）：
{
  "stuckPoint": "陈老师发现的真正卡点（一句话，口语化）",
  "rootCause": "为什么孩子会卡在这（邻居大姐口吻，例如：孩子眼里没看到那条中位线）",
  "coachAdvice": "陈老师的口语化建议（咱们这样，今晚...）",
  "threeDayPlan": [
    { "day": 1, "task": "具体内容" },
    { "day": 2, "task": "具体内容" },
    { "day": 3, "task": "具体内容" }
  ]
}
    `;

      console.log(`--- [Step 5][${requestId}] Calling DeepSeek API with bounded retries ---`);
      let content = await callDeepSeekWithRetry({
        requestId,
        baseURL,
        apiKey,
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        systemPrompt,
        messages: payloadForCache.messages,
      });
      console.log(`--- [Step 6][${requestId}] DeepSeek Reasoning Complete ---`);

      // 清洗可能存在的 Markdown 标记
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(content) as AnalyzeResult;
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
      console.log(`[Analyze API][${requestId}] Coalesced with in-flight request key=${cacheKey.slice(0, 8)}.`);
    }

    const result = await analyzePromise;
    const duration = Date.now() - startTime;
    console.log(`🎉 [Analyze API][${requestId}] Success! Duration: ${duration}ms`);
    return NextResponse.json(result, {
      headers: { "x-analyze-cache": existingInFlight ? "COALESCED" : "MISS" },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`🚨🚨🚨 [Analyze API FATAL ERROR][${requestId}] Duration: ${duration}ms 🚨🚨🚨`);
    console.error(`[${requestId}] Error Name:`, error?.name);
    console.error(`[${requestId}] Error Message:`, error?.message);
    if (error?.rawData) {
      console.error(`[${requestId}] Raw Error Data included in response.`);
    }

    return NextResponse.json(
      {
        error: error?.message?.includes("校验失败") ? "环境校验中断" : "诊断失败",
        details: error?.message || String(error),
        requestId,
        errData: error?.rawData || null
      },
      { status: error?.status || 500 }
    );
  }
}
