"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
        >
          <ChevronLeft size={20} />
          返回
        </button>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-5 pb-24">
        <header className="bg-white rounded-[24px] p-7 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">价格方案</h1>
          <p className="text-slate-600 mt-2">选你现在最需要的节奏，先把几何分数稳下来。</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">基础版</p>
            <h2 className="text-2xl font-black text-slate-800 mt-1">¥199</h2>
            <p className="text-slate-700 font-medium mt-3">AI 自动化诊断，适合基础自测。</p>
            <button
              onClick={() => router.push("/upsell/submit?pkg=A")}
              className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              选 199 方案
              <ArrowRight size={18} />
            </button>
          </article>

          <article className="bg-[#FFF7DB] border-2 border-[#F59E0B] rounded-[24px] p-6 shadow-lg">
            <p className="text-sm font-bold text-amber-700 uppercase tracking-widest">进阶版（推荐）</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">¥599</h2>
            <p className="text-slate-800 font-bold mt-3">陈老师核心团队人工复核 + 1对1 针对性纠偏 + 提分保险</p>
            <button
              onClick={() => router.push("/upsell/submit?pkg=B")}
              className="mt-6 w-full bg-[#F59E0B] text-white py-3.5 rounded-xl font-black hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              选 599 方案
              <ArrowRight size={18} />
            </button>
          </article>
        </section>

        <p className="text-center text-sm text-slate-500 font-bold">
          已有 856 位家长选择此项，彻底解决孩子几何开窍问题
        </p>
      </main>
    </div>
  );
}
