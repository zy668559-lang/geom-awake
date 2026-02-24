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
          <h1 className="text-3xl font-black text-slate-900">套餐方案</h1>
          <p className="text-slate-600 mt-2">按孩子当前状态选一档，先把几何成绩稳住。</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="relative bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <span className="absolute -top-3 right-4 bg-[#FF7A00] text-white text-xs font-black px-3 py-1 rounded-full">
              HOT 推荐
            </span>
            <p className="text-sm font-bold text-slate-400 tracking-widest">199 元基础包</p>
            <h2 className="text-2xl font-black text-slate-800 mt-1">￥199</h2>
            <p className="text-slate-800 font-bold mt-3">专治：逻辑断层、证明无思路</p>
            <p className="text-slate-600 mt-2">AI 自动化诊断，适合基础自测。</p>
            <button
              onClick={() => router.push("/confirm?pkg=A")}
              className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              我选 199 套餐
              <ArrowRight size={18} />
            </button>
          </article>

          <article className="bg-[#FFF4D6] border-2 border-[#F59E0B] rounded-[24px] p-6 shadow-lg">
            <p className="text-sm font-black text-amber-700 tracking-widest">599 元进阶包</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">￥599</h2>
            <p className="text-slate-900 font-black mt-3">真人复核 + 1对1 针对性纠偏 + 提分保险</p>
            <p className="text-slate-700 mt-2">适合想冲分、要有人盯进度的家庭。</p>
            <button
              onClick={() => router.push("/confirm?pkg=B")}
              className="mt-6 w-full bg-[#FF7A00] text-white py-3.5 rounded-xl font-black hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              我选 599 套餐
              <ArrowRight size={18} />
            </button>
            <p className="text-sm text-slate-600 font-bold mt-4">
              已有 856 位家长选择此项，彻底解决孩子几何开窍问题
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
