"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Calendar } from "lucide-react";

interface DiagnosisData {
    stuckPoint: string;
    rootCause: string;
    coachAdvice: string;
    threeDayPlan: { day: number; task: string }[];
}

export default function ReportPage() {
    const router = useRouter();
    const [data, setData] = useState<DiagnosisData | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("latest_diagnosis");
        if (raw) {
            try {
                setData(JSON.parse(raw));
            } catch (e) {
                console.error("Failed to parse diagnosis", e);
            }
        }
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <p className="text-slate-400">正在生成体检报告，请稍候...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24">
            {/* 顶部导航 */}
            <nav className="bg-white px-6 py-4 flex items-center shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => router.push("/")}
                    className="text-slate-400 font-medium hover:text-slate-600"
                >
                    关闭
                </button>
                <span className="mx-auto font-bold text-slate-800">陈老师体检报告</span>
                <div className="w-8" />
            </nav>

            {/* 核心内容区 */}
            <main className="max-w-3xl mx-auto p-6 space-y-6">

                {/* 1. 核心结论 */}
                <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 leading-snug mb-2">
                        {data.stuckPoint}
                    </h1>
                    <p className="text-slate-400 font-medium italic">—— 陈老师给孩子的灵魂诊断 ——</p>
                </div>

                {/* 2. 诊断区块 */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    {/* 陈老师大白话 */}
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            陈老师的一句真心话
                        </h2>
                        <div className="relative pl-6 border-l-4 border-slate-200">
                            <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                                “{data.rootCause}”
                            </p>
                        </div>
                    </div>

                    {/* 具体建议 */}
                    <div className="p-8 bg-gradient-to-br from-[#F0F4FF] to-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#667EEA] flex items-center justify-center text-white font-bold text-lg">
                                陈
                            </div>
                            <h2 className="text-lg font-bold text-[#667EEA]">
                                咱们今晚就这样练
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#667EEA]/10">
                            <p className="text-xl font-bold text-slate-800 leading-relaxed">
                                {data.coachAdvice}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. 3天计划 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {data.threeDayPlan.map((plan) => (
                        <div key={plan.day} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Day {plan.day}</span>
                            </div>
                            <p className="text-slate-700 font-bold leading-relaxed">{plan.task}</p>
                        </div>
                    ))}
                </div>

                {/* 底部行动 */}
                <button
                    className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-6 rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    onClick={() => router.push("/")}
                >
                    换一道题再试试
                    <ArrowRight size={20} />
                </button>

            </main>
        </div>
    );
}
