"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, Brain, Camera, Images, Loader2, MessageCircle, Search } from "lucide-react";
import { preprocessImageForAnalyze } from "@/lib/client/image-preprocess";

type SearchState = "IDENTIFYING" | "INTERACTING" | "REASONING";
const DIAGNOSIS_TIMEOUT_MS = 25_000;

const STEPS: Record<SearchState, string> = {
  IDENTIFYING: "正在识图，先把题目条件看准。",
  INTERACTING: "孩子现在卡在哪一步？点一个最接近的。",
  REASONING: "陈老师正在全神贯注诊断中...",
};

const STUCK_OPTIONS = [
  "辅助线完全想不到",
  "题目条件太多，关系理不清",
  "知道要证什么，但过程写不出",
  "公式和定理总是想不起来",
  "我也说不清，让陈老师判断",
];

const DEMO_DIAGNOSIS_FIXTURE = {
  stuckPoint: "你不是不会做，是第一步总是踩偏。",
  rootCause: "你急着一步到位，关键关系没有先排好顺序。",
  coachAdvice: "今晚先慢半拍：先圈条件，再选一条最短推进线。",
  threeDayPlan: [
    { day: 1, task: "每天只做2题，先练看点-选线。" },
    { day: 2, task: "每题先写第一句：因为...所以...。" },
    { day: 3, task: "做完后复盘5分钟：今天到底卡在哪一步。" },
  ],
  MODEL_FAILED: false,
  source: "fallback",
};

function createSessionId() {
  return `sid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function inferCauseFromNote(note: string): string {
  if (/辅?助线|画线|看图/.test(note)) return "draw_line";
  if (/条件|关系|因为|所以/.test(note)) return "condition_relation";
  if (/证明|推理|全等/.test(note)) return "proof_writing";
  return "draw_line";
}

function estimateBytesFromBase64(input: string): number {
  const raw = input.includes(",") ? input.split(",").slice(1).join(",") : input;
  const len = raw.length;
  if (!len) return 0;
  const padding = raw.endsWith("==") ? 2 : raw.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

function dataUrlToFile(dataUrl: string, fileName: string): File {
  const hasPrefix = dataUrl.includes(",");
  const [meta, content] = hasPrefix ? dataUrl.split(",", 2) : ["data:image/png;base64", dataUrl];
  const mimeMatch = meta?.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "image/png";
  const binary = atob(content || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], fileName, { type: mimeType });
}

function prettyBytes(size: number): string {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function ProcessingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<SearchState>("IDENTIFYING");
  const [stuckPoint, setStuckPoint] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [prepareText, setPrepareText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState(0);

  const hasInitialized = useRef(false);
  const processingLockRef = useRef(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const demoMode = searchParams.get("demo") === "1";

  const hasValidImage = demoMode || (Boolean(imageBase64) && selectedFileSize > 0);
  const fileMetaText = useMemo(() => {
    if (!selectedFileName && selectedFileSize <= 0) return "";
    return `${selectedFileName || "已选图片"} · ${prettyBytes(selectedFileSize)}`;
  }, [selectedFileName, selectedFileSize]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const pendingImage = localStorage.getItem("pending_geometry_image");
    const pendingName = localStorage.getItem("pending_geometry_file_name") || "";
    const pendingSizeRaw = Number.parseInt(localStorage.getItem("pending_geometry_file_size") || "0", 10);
    const pendingSize = Number.isFinite(pendingSizeRaw) && pendingSizeRaw > 0 ? pendingSizeRaw : estimateBytesFromBase64(pendingImage || "");

    const sidFromQuery = searchParams.get("sid");
    const sidFromStorage = localStorage.getItem("pending_geometry_sid");
    const resolvedSid = sidFromQuery || sidFromStorage || createSessionId();

    localStorage.setItem("pending_geometry_sid", resolvedSid);
    setSessionId(resolvedSid);

    if (!sidFromQuery) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("sid", resolvedSid);
      router.replace(`/processing?${nextParams.toString()}`);
    }

    if (pendingImage || demoMode) {
      setImageBase64(pendingImage || "demo-image");
      setSelectedFileName(pendingName || "uploaded-image");
      setSelectedFileSize(demoMode ? 1 : pendingSize);
      setState("INTERACTING");
      setErrorMessage("");
      return;
    }

    setState("INTERACTING");
    setErrorMessage("请先上传题目图片（支持拍照或相册）。");
  }, [demoMode, router, searchParams]);

  const showFlowError = (message: string) => {
    setErrorMessage(message);
    setState("INTERACTING");
  };

  const handlePickCamera = () => {
    if (isPreparingImage || isProcessing) return;
    cameraInputRef.current?.click();
  };

  const handlePickAlbum = () => {
    if (isPreparingImage || isProcessing) return;
    albumInputRef.current?.click();
  };

  const handleImageSelected = async (file: File | undefined) => {
    if (!file || isPreparingImage || isProcessing) return;

    if (!Number.isFinite(file.size) || file.size <= 0) {
      showFlowError("图片文件无效，请重新选择。");
      return;
    }

    setIsPreparingImage(true);
    setPrepareText("正在处理图片...");
    setErrorMessage("");

    try {
      const prepared = await preprocessImageForAnalyze(file, (text) => setPrepareText(text));
      if (!prepared.file || prepared.file.size <= 0 || !prepared.dataUrl) {
        showFlowError("图片处理失败，请重新上传。");
        return;
      }

      localStorage.setItem("pending_geometry_image", prepared.dataUrl);
      localStorage.setItem("pending_geometry_file_name", prepared.file.name);
      localStorage.setItem("pending_geometry_file_size", String(prepared.file.size));

      setImageBase64(prepared.dataUrl);
      setSelectedFileName(prepared.file.name);
      setSelectedFileSize(prepared.file.size);
      setState("INTERACTING");
      setPrepareText("");
    } catch (error: any) {
      showFlowError(error?.message || "图片处理失败，请换一张更清晰的题图。");
    } finally {
      setIsPreparingImage(false);
    }
  };

  const onCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    void handleImageSelected(file);
  };

  const onAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    void handleImageSelected(file);
  };

  const handleStartDiagnosis = async (point: string) => {
    if (isProcessing || processingLockRef.current) return;

    const finalPoint = (point || stuckPoint).trim();
    if (!finalPoint) return;
    if (!hasValidImage) {
      showFlowError("请先上传有效图片（文件不能为空）。");
      return;
    }

    processingLockRef.current = true;
    setIsProcessing(true);
    setErrorMessage("");
    setStuckPoint(finalPoint);
    setState("REASONING");

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => abortController.abort(), DIAGNOSIS_TIMEOUT_MS);

    try {
      if (demoMode) {
        localStorage.setItem(
          "latest_diagnosis",
          JSON.stringify({
            ...DEMO_DIAGNOSIS_FIXTURE,
            stuckPoint: finalPoint || DEMO_DIAGNOSIS_FIXTURE.stuckPoint,
          })
        );
        router.push("/report");
        return;
      }

      const cause = inferCauseFromNote(finalPoint);
      const imageFile = dataUrlToFile(imageBase64 as string, `geometry-${sessionId || Date.now().toString(36)}.jpg`);
      if (!imageFile || imageFile.size <= 0) {
        throw new Error("上传图片为空，请重新上传。");
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("cause", cause);
      formData.append("note", finalPoint);
      formData.append("sid", sessionId);

      const host = window.location.hostname;
      const useMockAnalyze = host === "localhost" || host === "127.0.0.1";
      const headers = useMockAnalyze ? { "x-analyze-mock": "1" } : undefined;

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
        headers,
      });

      const rawBody = await res.text();
      const responseData = rawBody ? JSON.parse(rawBody) : null;

      if (!res.ok || responseData?.errorCode) {
        throw new Error(
          responseData?.reason ||
            responseData?.message ||
            responseData?.details ||
            responseData?.error ||
            `诊断失败（HTTP ${res.status}）`
        );
      }

      if (!responseData || typeof responseData !== "object") {
        throw new Error("诊断返回格式异常，请重试。");
      }

      localStorage.setItem("latest_diagnosis", JSON.stringify(responseData));
      router.push("/report");
    } catch (error) {
      console.error("Diagnosis Error:", error);
      if (error instanceof DOMException && error.name === "AbortError") {
        showFlowError(`诊断超时（${DIAGNOSIS_TIMEOUT_MS / 1000}秒），请重试或返回重新上传。`);
      } else if (error instanceof Error) {
        showFlowError(error.message || "诊断失败，请稍后再试。");
      } else {
        showFlowError("诊断失败，请稍后再试。");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsProcessing(false);
      processingLockRef.current = false;
    }
  };

  const handleRetry = () => {
    const retryPoint = (stuckPoint || STUCK_OPTIONS[0]).trim();
    if (!retryPoint) return;
    void handleStartDiagnosis(retryPoint);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onCameraChange} />
      <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={onAlbumChange} />

      <div className="relative mb-12">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
          {state === "IDENTIFYING" && <Search className="text-slate-400 w-12 h-12 animate-bounce" />}
          {state === "INTERACTING" && <MessageCircle className="text-blue-500 w-12 h-12" />}
          {state === "REASONING" && <Brain className="text-[#667EEA] w-12 h-12 animate-spin-slow" />}
        </div>
        <div className="absolute inset-0 w-32 h-32 border-4 border-[#667EEA]/20 rounded-full" />
        <div className="absolute inset-0 w-32 h-32 border-4 border-t-[#667EEA] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <h2 className="text-2xl font-black text-slate-800 leading-snug min-h-[4rem]">{STEPS[state]}</h2>
        {isProcessing ? <p className="text-sm font-bold text-[#667EEA]">陈老师正在全神贯注诊断中...</p> : null}

        {isPreparingImage ? (
          <div className="flex items-center justify-center gap-2 text-slate-600 font-bold">
            <Loader2 size={16} className="animate-spin" />
            <span>{prepareText || "正在处理图片..."}</span>
          </div>
        ) : null}

        {fileMetaText ? (
          <p className="text-xs font-bold text-slate-500">当前图片：{fileMetaText}</p>
        ) : null}

        {errorMessage ? (
          <section data-testid="processing-error-card" className="w-full rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-bold text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
            <div className="grid gap-2 mt-4 md:grid-cols-2">
              <button
                data-testid="processing-retry"
                onClick={handleRetry}
                disabled={isProcessing || !hasValidImage}
                className="py-2.5 rounded-xl bg-red-600 text-white font-bold disabled:opacity-40"
              >
                重试
              </button>
              <button
                data-testid="processing-return"
                onClick={() => router.push("/")}
                className="py-2.5 rounded-xl bg-white border border-red-300 text-red-700 font-bold"
              >
                返回重新上传
              </button>
            </div>
          </section>
        ) : null}

        {!hasValidImage && !isProcessing && !demoMode ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">先传一张题图，再开始诊断。</p>
            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={handlePickCamera}
                disabled={isPreparingImage || isProcessing}
                className="py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Camera size={16} />
                拍照上传
              </button>
              <button
                type="button"
                onClick={handlePickAlbum}
                disabled={isPreparingImage || isProcessing}
                className="py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Images size={16} />
                从相册选择
              </button>
            </div>
          </div>
        ) : null}

        {state === "INTERACTING" ? (
          <div className="grid gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {STUCK_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleStartDiagnosis(opt)}
                disabled={isProcessing || !hasValidImage}
                className={`w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-left border border-slate-100 transition-all flex justify-between items-center group ${
                  isProcessing || !hasValidImage ? "opacity-50 cursor-not-allowed" : "active:scale-95"
                }`}
              >
                {opt}
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            <div className="mt-4 flex gap-2">
              <input
                placeholder="或者你自己写一句也行..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={stuckPoint}
                onChange={(e) => setStuckPoint(e.target.value)}
                disabled={isProcessing || !hasValidImage}
              />
              <button
                onClick={() => handleStartDiagnosis(stuckPoint)}
                disabled={!stuckPoint.trim() || isProcessing || !hasValidImage}
                className="bg-slate-900 text-white px-6 rounded-xl font-bold disabled:opacity-30"
              >
                {isProcessing ? "诊断中..." : "确定"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 mt-12 pb-12">
        {["IDENTIFYING", "INTERACTING", "REASONING"].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-500 ${state === step ? "w-8 bg-slate-800" : "w-1.5 bg-slate-200"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-500">加载中...</div>}>
      <ProcessingPageContent />
    </Suspense>
  );
}
