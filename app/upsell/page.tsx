"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, MessageCircleHeart, Star, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function UpsellContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    const content = type === "coaching" ? {
        title: "陈老师按月陪跑特训",
        desc: "不只是几何，全学期重难点模型一次搞定。",
        price: "99/月",
        features: ["每日重难点驱动", "关键步骤 1对1 语音判定", "考试母题精准覆盖"]
    } : {
        title: "本周几何定制强化卷",
        desc: "针对你还没完全吃透的“辅助线构造”，精准加餐。",
        price: "19/套",
        features: ["5 道核心变式母题", "陈老师独家手写解析", "错一赔三：举一反三特训"]
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回
                </button>
            </nav>

            <main className="flex-1 max-w-md mx-auto w-full p-6 flex flex-col justify-center -mt-12">
                <div className="bg-white rounded-[40px] p-10 shadow-xl relative overflow-hidden">
                    {/* 背景装饰 */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#667EEA]/5 rounded-bl-full -mr-8 -mt-8" />

                    <header className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#667EEA]/10 text-[#667EEA] rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                            <Star size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 mb-2">{content.title}</h1>
                        <p className="text-slate-500 font-medium">“{content.desc}”</p>
                    </header>

                    <ul className="space-y-4 mb-10">
                        {content.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                                <span className="font-bold text-slate-600">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">MVP2 特惠价</p>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-black text-slate-800">¥</span>
                            <span className="text-4xl font-black text-slate-800">{content.price.split('/')[0].replace('¥', '')}</span>
                            <span className="text-lg font-bold text-slate-400">/{content.price.split('/')[1] || '终身'}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/upload")}
                        className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-6 rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6"
                    >
                        立即购买
                        <ArrowRight size={20} />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[#667EEA] font-bold">
                        <MessageCircleHeart size={20} />
                        联系陈老师助手
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-sm font-medium">
                    产品处于内测阶段，如遇问题请多担待
                </p>
            </main>
        </div>
    );
}

export default function UpsellPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">正在加载特惠方案...</div>}>
            <UpsellContent />
        </Suspense>
    );
}
