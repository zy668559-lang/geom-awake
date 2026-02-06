"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ReportPage() {
    const router = useRouter();

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
                <span className="mx-auto font-bold text-slate-800">体检报告</span>
                <div className="w-8" /> {/* 占位 */}
            </nav>

            {/* 核心内容区 */}
            <main className="max-w-3xl mx-auto p-6 space-y-6">

                {/* 顶部大标题 */}
                <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 leading-snug mb-2">
                        体检结论：孩子不是笨，<br />是这层窗户纸还没捅破！
                    </h1>
                </div>

                {/* 诊断核心区块 */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                    {/* 家长扎心话 */}
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            扎心真相
                        </h2>
                        <div className="relative pl-6 border-l-4 border-slate-200">
                            <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                                “我看了一眼，这道题孩子其实已经走到门口了，就差临门一脚。他不是不会做，是手里没武器（模型意识）。”
                            </p>
                        </div>
                    </div>

                    {/* 陈老师支招 */}
                    <div className="p-8 bg-gradient-to-br from-[#F0F4FF] as-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#667EEA] flex items-center justify-center text-white font-bold text-lg">
                                陈
                            </div>
                            <h2 className="text-lg font-bold text-[#667EEA]">
                                陈老师支招
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#667EEA]/10">
                            <p className="text-2xl font-black text-slate-800 leading-relaxed">
                                “记住陈老师这句话：见中点连中点，辅助线一出，题就解了一半！”
                            </p>
                        </div>
                    </div>
                </div>

                {/* 底部行动按钮 */}
                <button
                    className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-6 rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
                    onClick={() => alert("Mock: 跳转到专项练习")}
                >
                    领取 3 天针对性训练
                    <ArrowRight size={20} />
                </button>

            </main>
        </div>
    );
}
