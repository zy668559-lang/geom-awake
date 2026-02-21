"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { REPAIR_CAUSE_OPTIONS } from "@/data/training/repair_7days";

function findCauseLabel(rawCause: string | null): string {
    const found = REPAIR_CAUSE_OPTIONS.find((item) => item.key === rawCause);
    return found?.label || "未指定错因";
}

export default function RetestResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const beforeTag = searchParams.get("beforeTag") || findCauseLabel(searchParams.get("cause"));
    const total = Number.parseInt(searchParams.get("total") || "0", 10);
    const hitCount = Number.parseInt(searchParams.get("hitCount") || "0", 10);
    const hitRate = Number.parseInt(searchParams.get("hitRate") || "0", 10);
    const fixed = searchParams.get("fixed") === "1";
    const verdict = searchParams.get("verdict") || (fixed ? "这块已经明显稳住了。" : "还差一口气，再补两轮就稳。");
    const suggestion = searchParams.get("suggestion") || (fixed ? "进入 upsell" : "再练一轮");
    const wrongReasonsRaw = searchParams.get("wrongReasons") || "";

    const wrongReasons = useMemo(() => {
        if (!wrongReasonsRaw) return [];
        return wrongReasonsRaw.split("||").filter(Boolean);
    }, [wrongReasonsRaw]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center bg-white shadow-sm">
                <button
                    onClick={() => router.push(`/retest?cause=${searchParams.get("cause") || "draw_line"}`)}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回复检
                </button>
                <span className="mx-auto font-black text-slate-800 text-lg">复检对比结果</span>
                <div className="w-12" />
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        {fixed ? (
                            <CheckCircle2 className="text-green-500" size={28} />
                        ) : (
                            <CircleAlert className="text-amber-500" size={28} />
                        )}
                        <h1 className="text-2xl font-black text-slate-800">
                            {fixed ? "这块基本修住了" : "这块还要再练一轮"}
                        </h1>
                    </div>
                    <p className="text-lg text-slate-600">“{verdict}”</p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">前（体检标签）</p>
                        <p className="text-2xl font-black text-slate-800">{beforeTag}</p>
                    </div>
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-green-100">
                        <p className="text-xs font-bold text-green-500 tracking-widest uppercase mb-2">后（复检命中率）</p>
                        <p className="text-3xl font-black text-green-600">{Number.isFinite(hitRate) ? hitRate : 0}%</p>
                        <p className="text-sm text-slate-500 mt-1">
                            命中 {Number.isFinite(hitCount) ? hitCount : 0}/{Number.isFinite(total) ? total : 0}
                        </p>
                    </div>
                </section>

                {wrongReasons.length > 0 && (
                    <section className="bg-white rounded-[24px] p-6 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">错因解释（本轮没命中）</p>
                        <div className="space-y-2">
                            {wrongReasons.slice(0, 4).map((reason, idx) => (
                                <p key={`${reason}-${idx}`} className="text-slate-700 font-bold">
                                    {idx + 1}. {reason}
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                <button
                    onClick={() => {
                        if (suggestion === "再练一轮") {
                            router.push(`/retest?cause=${searchParams.get("cause") || "draw_line"}`);
                            return;
                        }
                        router.push("/upsell");
                    }}
                    className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-5 rounded-[24px] shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    建议：{suggestion}
                    <ArrowRight size={20} />
                </button>
            </main>
        </div>
    );
}
