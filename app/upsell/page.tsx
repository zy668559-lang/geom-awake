"use client";

import { useMemo } from "react";
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

const PACKAGE_MAP = {
  A: {
    id: "A",
    name: "定制卷+复检",
    price: "¥199",
    items: [
      "2份PDF：稳分卷1套 + 提分卷1套",
      "1次复检：6题 + 结果页一句话结论",
      "24小时内交付",
    ],
  },
  B: {
    id: "B",
    name: "月度陪跑",
    price: "¥599",
    items: [
      "4周计划：每周复检6题（共4次）+ 周报4份",
      "本月定制卷2套",
      "语音兜底：卡死触发1次10分钟",
    ],
  },
} as const;

export default function UpsellPage() {
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
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
          返回
        </button>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6 pb-24">
        <header className="bg-white rounded-[28px] p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-800 mb-2">这波状态别浪费，把分数稳住</h1>
          <p className="text-slate-600 font-medium">你现在的主要卡点是：{causeLabel}。下面两个方案都能直接落地，不走支付也能先提交流程。</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Package A</p>
            <h2 className="text-2xl font-black text-slate-800">{PACKAGE_MAP.A.name}</h2>
            <p className="text-3xl font-black text-[#667EEA] mt-2">{PACKAGE_MAP.A.price}</p>
            <ul className="mt-4 space-y-2 text-slate-700 font-medium">
              {PACKAGE_MAP.A.items.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <button
              onClick={() => router.push(`/upsell/submit?pkg=A&cause=${cause}`)}
              className="mt-6 w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              我选A
              <ArrowRight size={18} />
            </button>
          </article>

          <article className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Package B</p>
            <h2 className="text-2xl font-black text-slate-800">{PACKAGE_MAP.B.name}</h2>
            <p className="text-3xl font-black text-[#667EEA] mt-2">{PACKAGE_MAP.B.price}</p>
            <ul className="mt-4 space-y-2 text-slate-700 font-medium">
              {PACKAGE_MAP.B.items.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <button
              onClick={() => router.push(`/upsell/submit?pkg=B&cause=${cause}`)}
              className="mt-6 w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              我选B
              <ArrowRight size={18} />
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
