"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { REPAIR_CAUSE_OPTIONS, isRepairCause } from "@/data/training/repair_7days";

function resolveCause(rawCause: string | null): string {
  if (isRepairCause(rawCause)) return rawCause;

  if (typeof window !== "undefined") {
    const latest = localStorage.getItem("latest_retest_cause");
    if (isRepairCause(latest)) return latest;

    const selected = localStorage.getItem("repair_selected_cause");
    if (isRepairCause(selected)) return selected;
  }

  return "draw_line";
}

function UpsellPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cause = resolveCause(searchParams.get("cause"));
  const causeLabel = useMemo(() => {
    return REPAIR_CAUSE_OPTIONS.find((item) => item.key === cause)?.label || "画线想不到";
  }, [cause]);

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

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6 pb-24">
        <header className="bg-white rounded-[28px] p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900 mb-2">别让这次努力白费，把分数稳住</h1>
          <p className="text-slate-600 font-medium">孩子当前主要卡点：{causeLabel}。别犹豫，先锁定名额，孩子提分等不起。</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">【方案一】AI 自主纠偏包（199元）</h2>
            <p className="text-3xl font-black text-[#667EEA] mt-2">￥199</p>
            <ul className="mt-4 space-y-2 text-slate-700 font-medium">
              <li>- 2份PDF：稳分卷1套 + 提分卷1套</li>
              <li>- 1次复检：6题 + 结果页一句话结论</li>
              <li>- 24小时内交付</li>
            </ul>
            <button
              onClick={() => router.push(`/confirm?pkg=A&cause=${cause}`)}
              className="mt-6 w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              我选 199
              <ArrowRight size={18} />
            </button>
          </article>

          <article className="bg-[#FFF4D6] border-2 border-[#F59E0B] rounded-[24px] p-6 shadow-lg">
            <h2 className="text-2xl font-black text-slate-900">【方案二】陈老师核心团队带练（599元/仅剩3名）</h2>
            <p className="text-3xl font-black text-[#F59E0B] mt-2">￥599</p>
            <ul className="mt-4 space-y-2 text-slate-800 font-bold">
              <li>- 4周计划：每周复检6题（共4次）+ 周报4份</li>
              <li>- 本月定制卷2套</li>
              <li>- 语音兜底：卡死触发1次10分钟</li>
            </ul>
            <p className="mt-4 text-sm font-black text-[#FF7A00]">已有 1245 位家长通过此方案帮孩子挽回 20分</p>
            <button
              onClick={() => router.push(`/confirm?pkg=B&cause=${cause}`)}
              className="mt-6 w-full bg-[#FF7A00] text-white py-4 rounded-2xl font-black hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              我选 599
              <ArrowRight size={18} />
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-500">加载中...</div>}>
      <UpsellPageContent />
    </Suspense>
  );
}
