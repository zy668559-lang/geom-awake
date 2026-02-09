"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, CheckCircle2, Lock, ArrowRight } from "lucide-react";

const PLAN_DATA = [
    { id: 1, title: "Day 1: 见微知著", status: "unlocked", task: "识别图形中的隐藏垂直关系" },
    { id: 2, title: "Day 2: 顺藤摸瓜", status: "locked", task: "辅助线的连法：从垂直推导中线" },
    { id: 3, title: "Day 3: 移花接木", status: "locked", task: "全等替换：图形旋转的核心技巧" },
    { id: 4, title: "Day 4: 抽丝剥茧", status: "locked", task: "拆解复杂多边形为基本三角形" },
    { id: 5, title: "Day 5: 举一反三", status: "locked", task: "相似构造：从局部看整体比例" },
    { id: 6, title: "Day 6: 返璞归真", status: "locked", task: "经典母题串联与识别" },
    { id: 7, title: "Day 7: 成果验收", status: "locked", task: "复检对比：拿下这门题" },
];

export default function RepairPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const isUnlocked = localStorage.getItem("repair_unlocked") === "true";
        if (!isUnlocked) {
            router.push("/unlock");
        } else {
            setIsLoaded(true);
        }
    }, [router]);

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
                    <p className="text-slate-500 font-medium">每天 15 分钟，攻克几何大题</p>
                </header>

                <div className="space-y-4 pb-24">
                    {PLAN_DATA.map((day) => (
                        <div
                            key={day.id}
                            onClick={() => day.status === "unlocked" && router.push(`/repair/day/${day.id}`)}
                            className={`
                                relative p-6 rounded-[24px] border-2 transition-all cursor-pointer group
                                ${day.status === "unlocked"
                                    ? "bg-white border-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                                    : "bg-slate-100 border-transparent opacity-60 grayscale cursor-not-allowed"}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                                    ${day.status === "unlocked" ? "bg-[#667EEA] text-white" : "bg-slate-200 text-slate-400"}
                                `}>
                                    {day.id}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-slate-800">{day.title}</h3>
                                    <p className="text-sm font-medium text-slate-500">{day.task}</p>
                                </div>
                                {day.status === "unlocked" ? (
                                    <ArrowRight size={20} className="text-slate-300 group-hover:text-[#667EEA] group-hover:translate-x-1 transition-all" />
                                ) : (
                                    <Lock size={20} className="text-slate-400" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
