"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import {
    getRepairPack,
    REPAIR_CAUSE_OPTIONS,
    RepairCause,
    isRepairCause,
} from "@/data/training/repair_7days";

export default function RepairPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedCause, setSelectedCause] = useState<RepairCause>("draw_line");

    useEffect(() => {
        const isUnlocked = localStorage.getItem("repair_unlocked") === "true";
        if (!isUnlocked) {
            router.push("/unlock");
        } else {
            const cachedCause = localStorage.getItem("repair_selected_cause");
            if (isRepairCause(cachedCause)) {
                setSelectedCause(cachedCause);
            }
            setIsLoaded(true);
        }
    }, [router]);

    const currentPack = getRepairPack(selectedCause);

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => router.push("/report")}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    报告详情
                </button>
                <span className="font-black text-slate-800">7天特训路书</span>
                <div className="w-20" />
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">陈老师 7 天提分计划</h1>
                    <p className="text-slate-500 font-medium">{currentPack.label} · {currentPack.subtitle}</p>
                </header>

                <section className="mb-6 bg-white rounded-[24px] p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">选择当前错因</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {REPAIR_CAUSE_OPTIONS.map((cause) => (
                            <button
                                key={cause.key}
                                onClick={() => {
                                    setSelectedCause(cause.key);
                                    localStorage.setItem("repair_selected_cause", cause.key);
                                }}
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

                <div className="space-y-4 pb-24">
                    {currentPack.days.map((day) => (
                        <div
                            key={day.day}
                            onClick={() => router.push(`/repair/day/${day.day}?cause=${selectedCause}`)}
                            className={`
                                relative p-6 rounded-[24px] border-2 transition-all cursor-pointer group
                                bg-white border-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg bg-[#667EEA] text-white">
                                    {day.day}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-slate-800">Day {day.day}: {day.title}</h3>
                                    <p className="text-sm font-medium text-slate-500">{day.command}</p>
                                </div>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-[#667EEA] group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
