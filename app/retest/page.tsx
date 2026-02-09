"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, Zap, Target, ArrowRight } from "lucide-react";

export default function RetestPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center bg-white shadow-sm">
                <button
                    onClick={() => router.push("/repair")}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回特训
                </button>
                <span className="mx-auto font-black text-slate-800 text-lg">复检成果</span>
                <div className="w-12" />
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
                {/* 1. 总览结果 */}
                <header className="bg-white rounded-[40px] p-10 text-center shadow-sm">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">显著进步！</h1>
                    <p className="text-xl text-slate-500 font-medium">
                        “原本卡住的那一步，你现在已经能行云流水地写出来了。”
                    </p>
                </header>

                {/* 2. 前后对比卡片 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">一周前（体检）</p>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-black text-slate-400">45</span>
                            <span className="text-sm font-bold text-slate-300 mb-1">%</span>
                        </div>
                        <p className="text-sm font-bold text-slate-400 leading-tight">核心步骤正确率</p>
                    </div>
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-green-100">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">现在（复检）</p>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-black text-green-500">92</span>
                            <span className="text-sm font-bold text-green-300 mb-1">%</span>
                        </div>
                        <p className="text-sm font-bold text-green-600 leading-tight">核心步骤正确率</p>
                    </div>
                </div>

                {/* 3. 详细对比列表 */}
                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-8">常错步骤消失情况</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Zap className="text-green-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-700">垂直判定推导</p>
                                <p className="text-xs font-medium text-slate-400">之前：经常遗漏判定条件</p>
                            </div>
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">已攻克</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Target className="text-green-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-700">辅助线构造思路</p>
                                <p className="text-xs font-medium text-slate-400">之前：无从下手</p>
                            </div>
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">已攻克</span>
                        </div>
                    </div>
                </section>

                {/* 4. 底部行动 - 转化入口 */}
                <div className="space-y-4">
                    <button
                        onClick={() => router.push("/upsell?type=custom")}
                        className="w-full bg-[#667EEA] text-white text-xl font-bold py-6 rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        继续：拿下本周定制卷
                        <ArrowRight size={22} />
                    </button>
                    <button
                        onClick={() => router.push("/upsell?type=coaching")}
                        className="w-full bg-[#1A1A1A] text-white text-lg font-bold py-5 rounded-[24px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        升级：搞定一学期几何大题
                    </button>
                </div>
            </main>
        </div>
    );
}
