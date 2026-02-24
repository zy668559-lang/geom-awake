"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Brain, MessageCircle, Search } from "lucide-react";

type SearchState = "IDENTIFYING" | "INTERACTING" | "REASONING";

const STEPS: Record<SearchState, string> = {
  IDENTIFYING: "正在识图，先把题目条件看准。",
  INTERACTING: "孩子现在卡在哪一步？点一个最贴近的。",
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
    { day: 1, task: "每天只做2题，先练“看点-选线”。" },
    { day: 2, task: "每题先写第一句“因为...所以...”。" },
    { day: 3, task: "做完后复盘1分钟：今天到底卡在哪一步。" },
  ],
};

function ProcessingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<SearchState>("IDENTIFYING");
  const [stuckPoint, setStuckPoint] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const processingLockRef = useRef(false);
  const demoMode = searchParams.get("demo") === "1";

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const mockImg = localStorage.getItem("pending_geometry_image");
    if (mockImg || demoMode) {
      setImageBase64(mockImg || "demo-image");
      setState("INTERACTING");
    }
  }, [demoMode]);

  const handleStartDiagnosis = async (point: string) => {
    if (isProcessing || processingLockRef.current) return;

    const finalPoint = (point || stuckPoint).trim();
    if (!finalPoint) return;

    // Synchronous lock: block double-click re-entry before React state flush.
    processingLockRef.current = true;
    setIsProcessing(true);
    setStuckPoint(finalPoint);
    setState("REASONING");

    try {
      if (demoMode) {
        localStorage.setItem(
          "latest_diagnosis",
          JSON.stringify({
            ...DEMO_DIAGNOSIS_FIXTURE,
            stuckPoint: finalPoint || DEMO_DIAGNOSIS_FIXTURE.stuckPoint,
          }),
        );
        router.push("/report");
        return;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          stuckPoint: finalPoint,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        window.alert(`诊断失败：${responseData.details || "请稍后再试"}`);
        throw new Error(responseData.details || "诊断失败");
      }

      localStorage.setItem("latest_diagnosis", JSON.stringify(responseData));
      router.push("/report");
    } catch (error) {
      console.error("Diagnosis Error:", error);
      setState("INTERACTING");
    } finally {
      setIsProcessing(false);
      processingLockRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
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

        {state === "INTERACTING" && (
          <div className="grid gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {STUCK_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleStartDiagnosis(opt)}
                disabled={isProcessing}
                className={`w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-left border border-slate-100 transition-all flex justify-between items-center group ${isProcessing ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
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
                disabled={isProcessing}
              />
              <button
                onClick={() => handleStartDiagnosis(stuckPoint)}
                disabled={!stuckPoint.trim() || isProcessing}
                className="bg-slate-900 text-white px-6 rounded-xl font-bold disabled:opacity-30"
              >
                {isProcessing ? "诊断中..." : "确定"}
              </button>
            </div>
          </div>
        )}
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
