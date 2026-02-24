"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ClipboardCheck } from "lucide-react";
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

function packageText(pkg: string): { title: string; fee: string } {
  if (pkg === "B") {
    return {
      title: "【名师直通版】陈老师团队全程保分（仅限3人）",
      fee: "￥599",
    };
  }
  return {
    title: "【AI 纠偏版】孩子自主开窍方案",
    fee: "￥199",
  };
}

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pkg = searchParams.get("pkg") === "B" ? "B" : "A";
  const cause = resolveCause(searchParams.get("cause"));

  const causeLabel = useMemo(() => {
    return REPAIR_CAUSE_OPTIONS.find((item) => item.key === cause)?.label || "画线想不到";
  }, [cause]);

  const selectedPackage = packageText(pkg);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="p-6 bg-white shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
        >
          <ChevronLeft size={20} />
          返回
        </button>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-5 pb-24">
        <section className="bg-white rounded-[24px] p-6 shadow-sm">
          <p className="text-sm text-slate-500">你已选择</p>
          <h1 className="text-2xl font-black text-slate-900 mt-2">{selectedPackage.title}</h1>
          <p className="text-3xl font-black text-[#FF7A00] mt-3">{selectedPackage.fee}</p>
          <p className="text-slate-600 mt-3">当前错因线：{causeLabel}</p>
        </section>

        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700 mb-3">
            <ClipboardCheck size={20} />
            <p className="font-black">截图提交说明</p>
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-slate-700 font-medium">
            <li>截图本页面（包含套餐和金额）。</li>
            <li>把截图发给陈老师，并附上孩子年级与当前分数。</li>
            <li>等待排期确认后开始交付。</li>
          </ol>
        </section>

        <button
          onClick={() => router.push(`/upsell?cause=${cause}`)}
          className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
        >
          返回套餐页
        </button>
      </main>
    </div>
  );
}
