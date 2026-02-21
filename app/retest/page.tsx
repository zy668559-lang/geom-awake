"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import {
    REPAIR_CAUSE_OPTIONS,
    RepairCause,
    isRepairCause,
} from "@/data/training/repair_7days";
import { getRetest6QPack } from "@/data/retest_6q";

type AnswerMap = Record<string, number | undefined>;

export default function RetestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedCause, setSelectedCause] = useState<RepairCause>("draw_line");
    const [answers, setAnswers] = useState<AnswerMap>({});

    useEffect(() => {
        const fromQuery = searchParams.get("cause");
        const fromLocal = localStorage.getItem("repair_selected_cause");
        const cause = isRepairCause(fromQuery)
            ? fromQuery
            : isRepairCause(fromLocal)
                ? fromLocal
                : "draw_line";
        setSelectedCause(cause);
    }, [searchParams]);

    useEffect(() => {
        localStorage.setItem("repair_selected_cause", selectedCause);
        localStorage.setItem("latest_retest_cause", selectedCause);
        setAnswers({});
    }, [selectedCause]);

    const pack = useMemo(() => getRetest6QPack(selectedCause), [selectedCause]);
    const total = pack.questions.length;

    const answeredCount = useMemo(
        () => pack.questions.filter((q) => answers[q.id] !== undefined).length,
        [answers, pack.questions]
    );

    const handleSubmit = () => {
        if (answeredCount < total) {
            alert(`你还有 ${total - answeredCount} 题没选，先做完再交。`);
            return;
        }

        let hitCount = 0;
        const wrongItems: Array<{ id: string; wrongReason: string }> = [];

        for (const q of pack.questions) {
            const userChoice = answers[q.id];
            const isCorrect = userChoice === q.correctOption;
            if (isCorrect) {
                hitCount += 1;
            } else {
                wrongItems.push({
                    id: q.id,
                    wrongReason: q.wrongReason,
                });
            }
        }

        const hitRate = Math.round((hitCount / total) * 100);
        const fixed = hitRate >= 70;
        const result = {
            cause: selectedCause,
            beforeTag: pack.label,
            total,
            hitCount,
            hitRate,
            fixed,
            wrongItems,
            verdict: fixed ? "这块已经明显稳住了。" : "还差一口气，再补两轮就稳。",
            suggestion: fixed ? "进入 upsell" : "再练一轮",
        };

        localStorage.setItem("latest_retest_result", JSON.stringify(result));
        localStorage.setItem("latest_retest_cause", selectedCause);
        const search = new URLSearchParams({
            cause: selectedCause,
            beforeTag: pack.label,
            total: String(total),
            hitCount: String(hitCount),
            hitRate: String(hitRate),
            fixed: fixed ? "1" : "0",
            verdict: result.verdict,
            suggestion: result.suggestion,
            wrongReasons: wrongItems.map((item) => item.wrongReason).join("||"),
        });
        router.push(`/retest/result?${search.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center bg-white shadow-sm">
                <button
                    onClick={() => router.push(`/repair?cause=${selectedCause}`)}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回特训
                </button>
                <span className="mx-auto font-black text-slate-800 text-lg">复检小测</span>
                <div className="w-12" />
            </nav>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6 pb-24">
                <section className="bg-white rounded-[24px] p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">先选这轮要复检的错因</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {REPAIR_CAUSE_OPTIONS.map((cause) => (
                            <button
                                key={cause.key}
                                onClick={() => setSelectedCause(cause.key)}
                                className={`rounded-2xl px-4 py-3 text-left border-2 transition-all ${selectedCause === cause.key
                                    ? "border-[#667EEA] bg-[#667EEA]/5"
                                    : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                                    }`}
                            >
                                <p className="text-sm font-black text-slate-800">{cause.label}</p>
                                <p className="text-xs text-slate-500 mt-1">{cause.subtitle}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-white rounded-[24px] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-black text-slate-800">{pack.label} · 复检题（{total}题）</h1>
                        <span className="text-sm font-bold text-slate-500">已完成 {answeredCount}/{total}</span>
                    </div>
                    <p className="text-sm text-slate-500">只做静态小测，不调用任何外部服务。选完直接出对比结果。</p>
                </section>

                <div className="space-y-4">
                    {pack.questions.map((q, idx) => (
                        <section key={q.id} className="bg-white rounded-[24px] p-5 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-2">第 {idx + 1} 题</p>
                            <p className="text-lg font-bold text-slate-800 mb-2">{q.stem}</p>
                            <p className="text-sm text-slate-500 mb-4">从三个选项里选你最稳的答案。</p>
                            <div className="space-y-2">
                                {q.options.map((option, optionIdx) => {
                                    const active = answers[q.id] === optionIdx;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }))}
                                            className={`w-full text-left rounded-xl px-4 py-3 border transition-all ${active
                                                ? "border-[#667EEA] bg-[#667EEA]/5 text-slate-800"
                                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-5 rounded-[24px] shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    提交复检，生成对比
                    <ArrowRight size={20} />
                </button>
            </main>
        </div>
    );
}
