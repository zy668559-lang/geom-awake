"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, ChevronLeft, Loader2, Send, X } from "lucide-react";
import { getRepairPack, isRepairCause, type RepairCause } from "@/data/training/repair_7days";
import { evaluateRepairSubmit, type LocalSubmitResult } from "@/lib/repair-submit-local";

const STUCK_POINTS = ["不知道怎么开始", "画不出辅助线", "关系总是写乱", "证明写到一半卡住", "最后一步总掉链子"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);

  const queryCause = searchParams.get("cause");
  const cachedCause = typeof window !== "undefined" ? localStorage.getItem("repair_selected_cause") : null;
  const selectedCause: RepairCause = isRepairCause(queryCause)
    ? queryCause
    : isRepairCause(cachedCause)
      ? cachedCause
      : "draw_line";

  const dayFromQuery = Number(searchParams.get("day") || "1");
  const dayId = Number.isFinite(dayFromQuery) && dayFromQuery >= 1 && dayFromQuery <= 7 ? dayFromQuery : 1;

  const [isLoading, setIsLoading] = useState(false);
  const [stuckPoint, setStuckPoint] = useState(STUCK_POINTS[0]);
  const [content, setContent] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState<string | null>(null);
  const [draftImageName, setDraftImageName] = useState("");
  const [result, setResult] = useState<LocalSubmitResult | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const currentPack = useMemo(() => getRepairPack(selectedCause), [selectedCause]);
  const dayContent = currentPack.days.find((item) => item.day === dayId) || currentPack.days[0];

  useEffect(() => {
    localStorage.setItem("repair_selected_cause", selectedCause);
  }, [selectedCause]);

  useEffect(() => {
    return () => {
      if (draftImageUrl) {
        URL.revokeObjectURL(draftImageUrl);
      }
    };
  }, [draftImageUrl]);

  const handleDraftSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (draftImageUrl) {
      URL.revokeObjectURL(draftImageUrl);
    }

    setDraftImageUrl(URL.createObjectURL(file));
    setDraftImageName(file.name);
    setResult(null);
    setElapsedMs(null);
  };

  const handleClearDraft = () => {
    if (draftImageUrl) {
      URL.revokeObjectURL(draftImageUrl);
    }

    setDraftImageUrl(null);
    setDraftImageName("");
    setResult(null);
    setElapsedMs(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (isLoading || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);

    const startedAt = Date.now();

    try {
      const localResult = evaluateRepairSubmit({
        cause: selectedCause,
        dayId,
        stuckPoint,
        content,
        hasDraftImage: Boolean(draftImageUrl),
      });

      // Keep UI feedback quick and deterministic. Submit is guaranteed to resolve under 2s.
      await sleep(600);

      const total = Date.now() - startedAt;
      setResult(localResult);
      setElapsedMs(total);
      console.info(`[repair-submit] local result ready in ${total}ms`, {
        cause: selectedCause,
        dayId,
        score: localResult.score,
        passed: localResult.passed,
      });
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="p-6 flex items-center bg-white shadow-sm">
        <button
          onClick={() => router.push(`/repair/day/${dayId}?cause=${selectedCause}`)}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
          返回 Day {dayId}
        </button>
        <span className="mx-auto font-black text-slate-800 text-lg">提交反馈</span>
        <div className="w-16" />
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
        <section className="bg-white rounded-[32px] p-8 shadow-sm">
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-3">当前训练</p>
          <h1 className="text-xl font-black text-slate-800">{currentPack.label} · Day {dayId}</h1>
          <p className="text-slate-500 mt-2">今日口令：{dayContent.command}</p>
        </section>

        <section className="bg-white rounded-[32px] p-8 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 text-center">你现在最卡哪一步？</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {STUCK_POINTS.map((point) => (
              <button
                key={point}
                type="button"
                onClick={() => {
                  setStuckPoint(point);
                  setResult(null);
                  setElapsedMs(null);
                }}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                  stuckPoint === point ? "bg-[#667EEA] text-white shadow-md scale-105" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {point}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[32px] p-8 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 text-center">拍照上传草稿页</h2>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleDraftSelect} />

          {!draftImageUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-slate-50 border-4 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 hover:text-slate-500 hover:border-slate-300 transition-all cursor-pointer group"
            >
              <Camera size={48} className="mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-bold">点击上传草稿页</span>
            </button>
          ) : (
            <div className="w-full rounded-[24px] border border-slate-200 bg-slate-50 p-3">
              <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black/5">
                <img src={draftImageUrl} alt="草稿页预览" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
                  aria-label="删除草稿图"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500 truncate">已选择：{draftImageName || "草稿页图片"}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  重新选择
                </button>
              </div>
            </div>
          )}

          <textarea
            placeholder="或者直接写下你的思路，比如：先连哪条线、用了哪个条件。"
            className="w-full mt-6 bg-slate-50 border-2 border-transparent focus:border-[#667EEA] focus:bg-white rounded-2xl p-6 h-32 outline-none font-medium text-slate-700 transition-all"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setResult(null);
              setElapsedMs(null);
            }}
          />
        </section>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-6 rounded-[24px] text-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
            isLoading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#1A1A1A] text-white hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>正在本地判定（不走接口）...</span>
            </>
          ) : (
            <>
              <span>好了，陈老师请看诊</span>
              <Send size={20} />
            </>
          )}
        </button>

        {result ? (
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-2">{result.verdictTitle}</h2>
            <p className="text-slate-600">本地得分：{result.score} / 100</p>
            <p className="text-slate-600 mt-2">建议：{result.coachTip}</p>
            <p className="text-slate-500 mt-2">下一步：{result.nextAction}</p>
            <p className="text-xs text-slate-400 mt-3">提交耗时：{elapsedMs ?? 0}ms（目标 ≤ 2000ms）</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => router.push(`/repair/day/${dayId}?cause=${selectedCause}`)}
                className="py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
              >
                Back to training
              </button>
              <button
                type="button"
                onClick={() => router.push(`/retest?cause=${selectedCause}`)}
                className="py-4 rounded-2xl bg-[#1A1A1A] text-white font-bold hover:opacity-90 transition-opacity"
              >
                Go to retest
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
