"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Send, Sparkles, BookOpen, Quote } from "lucide-react";
import { getRepairPack, isRepairCause } from "@/data/training/repair_7days";

export default function DayDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dayId = Number(params.id);

    const queryCause = searchParams.get("cause");
    const cachedCause = typeof window !== "undefined" ? localStorage.getItem("repair_selected_cause") : null;
    const selectedCause = isRepairCause(queryCause)
        ? queryCause
        : isRepairCause(cachedCause)
            ? cachedCause
            : "draw_line";

    useEffect(() => {
        localStorage.setItem("repair_selected_cause", selectedCause);
    }, [selectedCause]);

    const currentPack = getRepairPack(selectedCause);
    const content = currentPack.days.find((day) => day.day === dayId) || currentPack.days[0];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center justify-between bg-white shadow-sm">
                <button
                    onClick={() => router.push(`/repair?cause=${selectedCause}`)}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回路书
                </button>
                <span className="font-black text-slate-800">{currentPack.label} · Day {content.day}</span>
                <div className="w-20" />
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
                {/* 1. 今日口令 */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Quote className="text-[#667EEA]" size={24} />
                        <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">今日口令</h2>
                    </div>
                    <p className="text-2xl font-black text-slate-800 leading-relaxed italic">
                        {content.command}
                    </p>
                </div>

                {/* 2. 今日小挑战 */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="text-orange-400" size={24} />
                        <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">今日小挑战</h2>
                    </div>

                    <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                        <p className="text-slate-500 font-medium">先做两道小题，按口令一步一步来。</p>
                    </div>

                    <div className="space-y-3">
                        {content.shortProblems.map((problem, idx) => (
                            <p key={idx} className="text-lg font-bold text-slate-700 leading-relaxed">
                                {idx + 1}. {problem}
                            </p>
                        ))}
                    </div>
                </div>

                {/* 3. 陈老师复盘 */}
                <div className="bg-[#667EEA]/5 border border-[#667EEA]/10 rounded-[32px] p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-[#667EEA]" size={24} />
                        <h2 className="text-sm font-bold text-[#667EEA] tracking-widest uppercase">陈老师复盘</h2>
                    </div>
                    <p className="text-lg font-medium text-slate-600 italic">
                        “{content.reviewTemplate}”
                    </p>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-3">家长提示</h2>
                    <p className="text-lg text-slate-700 leading-relaxed">
                        {content.parentTip}
                    </p>
                </div>

                {/* 底部按钮 */}
                <button
                    onClick={() => {
                        if (content.day === 7) {
                            router.push(`/retest?cause=${selectedCause}`);
                            return;
                        }
                        router.push("/repair/submit");
                    }}
                    className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-6 rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                    {content.day === 7 ? "Day7完成，开始复检" : "我写好了，陈老师帮我看看"}
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </main>
        </div>
    );
}
