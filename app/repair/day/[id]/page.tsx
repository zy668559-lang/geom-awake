"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, Sparkles, BookOpen, Quote } from "lucide-react";

const DAY_CONTENT: Record<number, any> = {
    1: {
        title: "见微知著",
        password: "“看见”垂直，就是“看见”解题的后半段。",
        problem: "在右图中，找出隐含的直角三角形，并标出理由。",
        review: "有些线段虽然没在那画直角符号，但性质已经替它写好了。",
    }
};

export default function DayDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const dayId = Number(params.id);
    const content = DAY_CONTENT[dayId] || DAY_CONTENT[1]; // Fallback to day 1

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center justify-between bg-white shadow-sm">
                <button
                    onClick={() => router.push("/repair")}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回路书
                </button>
                <span className="font-black text-slate-800">Day {dayId} 特训中</span>
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
                        {content.password}
                    </p>
                </div>

                {/* 2. 今日小挑战 */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="text-orange-400" size={24} />
                        <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">今日小挑战</h2>
                    </div>

                    <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                        <p className="text-slate-400 font-medium">[ 题目图示占位 ]</p>
                    </div>

                    <p className="text-xl font-bold text-slate-700 leading-relaxed">
                        {content.problem}
                    </p>
                </div>

                {/* 3. 陈老师复盘 */}
                <div className="bg-[#667EEA]/5 border border-[#667EEA]/10 rounded-[32px] p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-[#667EEA]" size={24} />
                        <h2 className="text-sm font-bold text-[#667EEA] tracking-widest uppercase">陈老师复盘</h2>
                    </div>
                    <p className="text-lg font-medium text-slate-600 italic">
                        “{content.review}”
                    </p>
                </div>

                {/* 底部按钮 */}
                <button
                    onClick={() => router.push("/repair/submit")}
                    className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-6 rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                    我写好了，陈老师帮我看看
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </main>
        </div>
    );
}
