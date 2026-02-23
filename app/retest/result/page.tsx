"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronLeft, CircleAlert } from "lucide-react";
import { REPAIR_CAUSE_OPTIONS, isRepairCause } from "@/data/training/repair_7days";

function resolveCause(rawCause: string | null): string {
  if (isRepairCause(rawCause)) return rawCause;

  if (typeof window !== "undefined") {
    const latestRetestCause = localStorage.getItem("latest_retest_cause");
    if (isRepairCause(latestRetestCause)) return latestRetestCause;

    const selectedCause = localStorage.getItem("repair_selected_cause");
    if (isRepairCause(selectedCause)) return selectedCause;
  }

  return "draw_line";
}

function findCauseLabel(cause: string): string {
  return REPAIR_CAUSE_OPTIONS.find((item) => item.key === cause)?.label || "画线想不到";
}

export default function RetestResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cause = resolveCause(searchParams.get("cause"));
  const beforeTag = searchParams.get("beforeTag") || findCauseLabel(cause);
  const total = Number.parseInt(searchParams.get("total") || "0", 10);
  const hitCount = Number.parseInt(searchParams.get("hitCount") || "0", 10);
  const hitRate = Number.parseInt(searchParams.get("hitRate") || "0", 10);
  const fixed = searchParams.get("fixed") === "1";
  const verdict = fixed
    ? "这块已经稳住了，接下来把分数守住就行。"
    : "这块还没彻底稳，先再练一轮马上会好很多。";
  const wrongReasonsRaw = searchParams.get("wrongReasons") || "";

  const wrongReasons = useMemo(() => {
    if (!wrongReasonsRaw) return [];
    return wrongReasonsRaw.split("||").filter(Boolean);
  }, [wrongReasonsRaw]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="p-6 flex items-center bg-white shadow-sm">
        <button
          onClick={() => router.push(`/retest?cause=${cause}`)}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
          返回复检
        </button>
        <span className="mx-auto font-black text-slate-800 text-lg">复检结果</span>
        <div className="w-12" />
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
        <section className="bg-white rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            {fixed ? <CheckCircle2 className="text-green-500" size={28} /> : <CircleAlert className="text-amber-500" size={28} />}
            <h1 className="text-2xl font-black text-slate-800">{fixed ? "这块基本修住了" : "这块还要再练一轮"}</h1>
          </div>
          <p className="text-lg text-slate-700">陈老师结论：{verdict}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">体检标签</p>
            <p className="text-2xl font-black text-slate-800">{beforeTag}</p>
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-green-100">
            <p className="text-xs font-bold text-green-500 tracking-widest uppercase mb-2">复检命中率</p>
            <p className="text-3xl font-black text-green-600">{Number.isFinite(hitRate) ? hitRate : 0}%</p>
            <p className="text-sm text-slate-500 mt-1">
              命中 {Number.isFinite(hitCount) ? hitCount : 0}/{Number.isFinite(total) ? total : 0}
            </p>
          </div>
        </section>

        {wrongReasons.length > 0 ? (
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">这轮没命中的点</p>
            <div className="space-y-2">
              {wrongReasons.slice(0, 4).map((reason, idx) => (
                <p key={`${reason}-${idx}`} className="text-slate-700 font-bold">
                  {idx + 1}. {reason}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/repair?cause=${cause}`)}
            className="w-full bg-white border border-slate-200 text-slate-700 text-lg font-bold py-4 rounded-[20px] shadow-sm hover:bg-slate-50 transition-all"
          >
            再练一轮
          </button>
          <button
            onClick={() => router.push(`/upsell?cause=${cause}`)}
            className="w-full bg-[#1A1A1A] text-white text-lg font-bold py-4 rounded-[20px] shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            把分数稳住
            <ArrowRight size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}
