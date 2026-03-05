import crypto from "crypto";
import { NextResponse } from "next/server";
import { diagnoseGeometryWithGemini } from "@/lib/gemini";

export const maxDuration = 60;

type AnalyzeSuccess = {
  stuckPoint: string;
  rootCause: string;
  coachAdvice: string;
  riskWarning: string;
  threeDayPlan: Array<{ day: number; task: string }>;
  inputHashTail: string;
  fallback: boolean;
};

type AnalyzeErrorPayload = {
  errorCode: string;
  reason: string;
  nextStep: string;
  inputHashTail: string;
  requestId: string;
};

type ParseAnalyzePayload = {
  imageBase64: string;
  mimeType: string;
  imageBytes: number;
  cause: string;
  note: string;
  inputHash: string;
};

type CacheEntry = {
  expiresAt: number;
  value: AnalyzeSuccess;
};

class AnalyzeApiError extends Error {
  status: number;
  errorCode: string;
  nextStep: string;

  constructor(status: number, errorCode: string, reason: string, nextStep: string) {
    super(reason);
    this.name = "AnalyzeApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.nextStep = nextStep;
  }
}

const analyzeCache = new Map<string, CacheEntry>();
const inFlightAnalyze = new Map<string, Promise<AnalyzeSuccess>>();
let analyzeCallCount = 0;

function readIntEnv(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const ANALYZE_CACHE_TTL_MS = readIntEnv("ANALYZE_CACHE_TTL_MS", 120000);
const ANALYZE_MAX_IMAGE_BYTES = 1_000_000;

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

function getAnalyzeCacheHit(key: string): AnalyzeSuccess | null {
  const cached = analyzeCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    analyzeCache.delete(key);
    return null;
  }
  return cached.value;
}

function setAnalyzeCache(key: string, value: AnalyzeSuccess) {
  analyzeCache.set(key, {
    value,
    expiresAt: Date.now() + ANALYZE_CACHE_TTL_MS,
  });
}

function buildMockSuccess(input: { cause: string; note: string; inputHashTail: string }): AnalyzeSuccess {
  const causeLabel =
    input.cause === "condition_relation"
      ? "条件关系"
      : input.cause === "proof_writing"
        ? "证明书写"
        : "画线切入";
  const noteSummary = (input.note || "未填写").slice(0, 60);
  return {
    stuckPoint: `你现在最卡的是：${causeLabel}这里容易断。`,
    rootCause: `结合你写的“${noteSummary}”，我先判断是第一步关系没排顺。`,
    coachAdvice: "先做3分钟：圈已知 -> 画一条推进线 -> 写第一句因为所以。",
    riskWarning: "这步不修，后面证明会一直断，考试最少丢5到10分。",
    threeDayPlan: [
      { day: 1, task: "只练开头第一步，不追求整题做完。" },
      { day: 2, task: "每题固定写一句因为所以，先写顺关系。" },
      { day: 3, task: "复盘最常断的那一步，明天优先再练。" },
    ],
    inputHashTail: input.inputHashTail,
    fallback: true,
  };
}

function parseThreeDayPlan(value: unknown): Array<{ day: number; task: string }> {
  if (!Array.isArray(value)) {
    throw new AnalyzeApiError(
      502,
      "MODEL_RESPONSE_INVALID",
      "模型返回格式异常，暂时无法生成诊断。",
      "请稍后重试，或换一张更清晰的题图。"
    );
  }

  const normalized = value
    .slice(0, 3)
    .map((item: any, index: number) => ({
      day: Number.isFinite(item?.day) ? Number(item.day) : index + 1,
      task: typeof item?.task === "string" ? item.task.trim() : "",
    }))
    .filter((item) => item.task.length > 0);

  if (normalized.length !== 3) {
    throw new AnalyzeApiError(
      502,
      "MODEL_RESPONSE_INVALID",
      "模型返回格式异常，暂时无法生成诊断。",
      "请稍后重试，或换一张更清晰的题图。"
    );
  }

  return normalized;
}

function safeParseGeminiJson(raw: string, inputHashTail: string): AnalyzeSuccess {
  const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AnalyzeApiError(
      502,
      "MODEL_RESPONSE_INVALID",
      "模型返回格式异常，暂时无法生成诊断。",
      "请稍后重试，或换一张更清晰的题图。"
    );
  }

  if (
    typeof parsed?.stuckPoint !== "string" ||
    typeof parsed?.rootCause !== "string" ||
    typeof parsed?.coachAdvice !== "string"
  ) {
    throw new AnalyzeApiError(
      502,
      "MODEL_RESPONSE_INVALID",
      "模型返回格式异常，暂时无法生成诊断。",
      "请稍后重试，或换一张更清晰的题图。"
    );
  }

  const riskWarning =
    typeof parsed?.riskWarning === "string" && parsed.riskWarning.trim().length > 0
      ? parsed.riskWarning.trim()
      : "这步不修，后面的证明题会持续丢分。";

  return {
    stuckPoint: parsed.stuckPoint.trim(),
    rootCause: parsed.rootCause.trim(),
    coachAdvice: parsed.coachAdvice.trim(),
    riskWarning,
    threeDayPlan: parseThreeDayPlan(parsed.threeDayPlan),
    inputHashTail,
    fallback: false,
  };
}

function mapGeminiError(error: any): AnalyzeApiError {
  const status = Number(error?.status || 500);
  if (status === 403) {
    return new AnalyzeApiError(
      503,
      "GEMINI_FORBIDDEN",
      "诊断服务密钥无效或权限不足。",
      "请检查生产环境 GEMINI_API_KEY 配置。"
    );
  }
  if (status === 429) {
    return new AnalyzeApiError(
      429,
      "GEMINI_QUOTA_LIMIT",
      "当前诊断请求过多，服务暂时限流。",
      "请稍后重试；若频繁出现，请更换更小图片并错峰使用。"
    );
  }
  if (status === 504) {
    return new AnalyzeApiError(
      504,
      "GEMINI_TIMEOUT",
      "诊断超时，图片处理未完成。",
      "请重试一次，或先裁剪题目区域再上传。"
    );
  }
  if (status >= 500) {
    return new AnalyzeApiError(
      503,
      "GEMINI_UPSTREAM_ERROR",
      "诊断服务暂时不可用。",
      "请稍后重试，或先检查服务状态。"
    );
  }
  return new AnalyzeApiError(
    500,
    "GEMINI_UNKNOWN_ERROR",
    "诊断服务发生未知错误。",
    "请稍后重试。"
  );
}

function buildErrorPayload(params: {
  requestId: string;
  inputHashTail: string;
  errorCode: string;
  reason: string;
  nextStep: string;
}): AnalyzeErrorPayload {
  return {
    requestId: params.requestId,
    inputHashTail: params.inputHashTail,
    errorCode: params.errorCode,
    reason: params.reason,
    nextStep: params.nextStep,
  };
}

function ensureImageSize(imageBuffer: Buffer) {
  if (imageBuffer.length === 0) {
    throw new AnalyzeApiError(400, "IMAGE_EMPTY", "上传图片为空。", "请重新拍照或选择图片后再试。");
  }
  if (imageBuffer.length > ANALYZE_MAX_IMAGE_BYTES) {
    throw new AnalyzeApiError(
      413,
      "IMAGE_TOO_LARGE",
      "图片超过1MB，服务端无法稳定处理。",
      "图片过大，请重试/换一张更清晰但更小的照片"
    );
  }
}

async function parseAnalyzePayload(req: Request): Promise<ParseAnalyzePayload> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const note = String(formData.get("note") || formData.get("stuckPoint") || "").trim().slice(0, 300);
    const rawCause = String(formData.get("cause") || "").trim();
    const cause = normalizeCause(rawCause, note);

    const imageEntry = formData.get("image");
    if (!(imageEntry instanceof File)) {
      throw new AnalyzeApiError(400, "IMAGE_MISSING", "缺少上传图片文件。", "请重新选择题图后再试。");
    }

    const imageBuffer = Buffer.from(await imageEntry.arrayBuffer());
    ensureImageSize(imageBuffer);
    const imageBase64 = imageBuffer.toString("base64");
    const mimeType = imageEntry.type || "image/jpeg";
    const inputHash = buildInputHash(imageBuffer, note, cause);
    return {
      imageBase64,
      mimeType,
      imageBytes: imageBuffer.length,
      cause,
      note,
      inputHash,
    };
  }

  const jsonBody = (await req.json().catch(() => null)) as any;
  if (!jsonBody?.imageBase64 || typeof jsonBody.imageBase64 !== "string") {
    throw new AnalyzeApiError(400, "IMAGE_MISSING", "缺少上传图片。", "请重新上传题图后再试。");
  }

  const note = String(jsonBody.note || jsonBody.stuckPoint || "").trim().slice(0, 300);
  const cause = normalizeCause(String(jsonBody.cause || ""), note);
  const base64Raw = stripDataUrlPrefix(jsonBody.imageBase64);
  const imageBuffer = Buffer.from(base64Raw, "base64");
  ensureImageSize(imageBuffer);
  const inputHash = buildInputHash(imageBuffer, note, cause);
  return {
    imageBase64: base64Raw,
    mimeType: "image/jpeg",
    imageBytes: imageBuffer.length,
    cause,
    note,
    inputHash,
  };
}

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const startedAt = Date.now();
  logMethodPath(req, requestId, "incoming");

  let inputHashTail = "00000000";

  try {
    const payload = await parseAnalyzePayload(req);
    inputHashTail = payload.inputHash.slice(-8);
    analyzeCallCount += 1;
    console.log(
      `[Analyze API][${requestId}] payload mime=${payload.mimeType} bytes=${payload.imageBytes} callCount=${analyzeCallCount}`
    );

    const cacheHit = getAnalyzeCacheHit(payload.inputHash);
    if (cacheHit) {
      console.log(`[Analyze API][${requestId}] cache hit hash=${payload.inputHash.slice(0, 8)}`);
      return NextResponse.json(cacheHit, { headers: { "x-analyze-cache": "HIT" } });
    }

    const runAnalyze = async (): Promise<AnalyzeSuccess> => {
      const forceMock =
        req.headers.get("x-analyze-mock") === "1" ||
        process.env.MOCK_MODE === "true" ||
        process.env.FORCE_MOCK_ANALYZE === "true";

      if (forceMock) {
        return buildMockSuccess({
          cause: payload.cause,
          note: payload.note,
          inputHashTail,
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        throw new AnalyzeApiError(
          503,
          "GEMINI_KEY_MISSING",
          "诊断服务密钥未配置，当前无法诊断。",
          "请检查生产环境 GEMINI_API_KEY。"
        );
      }

      try {
        const geminiText = await diagnoseGeometryWithGemini({
          imageBase64: payload.imageBase64,
          mimeType: payload.mimeType,
          cause: payload.cause,
          note: payload.note,
          requestId,
        });
        return safeParseGeminiJson(geminiText, inputHashTail);
      } catch (error: any) {
        throw mapGeminiError(error);
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
    if (error instanceof AnalyzeApiError) {
      console.warn(`[Analyze API][${requestId}] controlled error code=${error.errorCode} status=${error.status}`);
      return NextResponse.json(
        buildErrorPayload({
          requestId,
          inputHashTail,
          errorCode: error.errorCode,
          reason: error.message,
          nextStep: error.nextStep,
        }),
        { status: error.status }
      );
    }

    console.error(`[Analyze API][${requestId}] unexpected`, error?.message || String(error));
    return NextResponse.json(
      buildErrorPayload({
        requestId,
        inputHashTail,
        errorCode: "REQUEST_PARSE_FAILED",
        reason: "请求解析失败。",
        nextStep: "请重新上传题图后再试。",
      }),
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
