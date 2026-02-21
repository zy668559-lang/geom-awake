"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";

export default function UpsellPage() {
    const router = useRouter();

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

            <main className="flex-1 max-w-2xl mx-auto w-full p-6">
                <header className="bg-white rounded-[28px] p-8 shadow-sm mb-6">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">复检做完了，下一步怎么走？</h1>
                    <p className="text-slate-600 font-medium">你现在这股劲别断，接下来要么稳分，要么冲分。</p>
                </header>

                <div className="space-y-4">
                    <button
                        onClick={() => router.push("/upload")}
                        className="w-full bg-white border border-slate-200 rounded-[24px] p-6 text-left shadow-sm hover:shadow-md transition-all"
                    >
                        <p className="text-2xl font-black text-slate-800 mb-2">继续本月定制卷（稳分卷+提分卷）</p>
                        <p className="text-slate-600 font-medium">这周就按你的薄弱点来，做完我再带你复盘一次。</p>
                        <p className="mt-4 text-[#667EEA] font-bold inline-flex items-center gap-1">
                            继续做卷
                            <ArrowRight size={16} />
                        </p>
                    </button>

                    <button
                        onClick={() => router.push("/upload")}
                        className="w-full bg-[#1A1A1A] rounded-[24px] p-6 text-left shadow-lg hover:shadow-xl transition-all"
                    >
                        <p className="text-2xl font-black text-white mb-2">升级月度陪跑（老师兜底）</p>
                        <p className="text-slate-300 font-medium">你做题我盯过程，卡壳我及时拉一把，不让你越学越乱。</p>
                        <p className="mt-4 text-white font-bold inline-flex items-center gap-1">
                            升级陪跑
                            <ArrowRight size={16} />
                        </p>
                    </button>
                </div>
            </main>
        </div>
    );
}

