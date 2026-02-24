"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { REPAIR_CAUSE_OPTIONS, isRepairCause } from "@/data/training/repair_7days";

type PackageId = "A" | "B";

type LeadForm = {
  parentName: string;
  grade: string;
  region: string;
  contact: string;
  currentScore: string;
  mainIssue: string;
};

const PACKAGE_LABEL: Record<PackageId, string> = {
  A: "定制卷+复检（¥199）",
  B: "月度陪跑（¥599）",
};

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

function UpsellSubmitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pkg: PackageId = searchParams.get("pkg") === "B" ? "B" : "A";
  const cause = resolveCause(searchParams.get("cause"));
  const causeLabel = useMemo(() => {
    return REPAIR_CAUSE_OPTIONS.find((item) => item.key === cause)?.label || "画线想不到";
  }, [cause]);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<LeadForm>({
    parentName: "",
    grade: "",
    region: "",
    contact: "",
    currentScore: "",
    mainIssue: causeLabel,
  });

  const handleSubmit = () => {
    if (!form.parentName.trim() || !form.grade.trim() || !form.region.trim() || !form.contact.trim() || !form.mainIssue.trim()) {
      alert("请先补全必填信息。");
      return;
    }

    const payload = {
      packageId: pkg,
      packageName: PACKAGE_LABEL[pkg],
      cause,
      ...form,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("upsell_lead_latest", JSON.stringify(payload));

    const historyRaw = localStorage.getItem("upsell_lead_history");
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    const nextHistory = Array.isArray(history) ? [payload, ...history].slice(0, 10) : [payload];
    localStorage.setItem("upsell_lead_history", JSON.stringify(nextHistory));

    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="p-6 flex items-center bg-white shadow-sm">
        <button
          onClick={() => router.push(`/upsell?cause=${cause}`)}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
          返回方案页
        </button>
        <span className="mx-auto font-black text-slate-800 text-lg">提交联系信息</span>
        <div className="w-16" />
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
        <section className="bg-white rounded-[24px] p-6 shadow-sm">
          <p className="text-sm text-slate-500">已选方案</p>
          <h1 className="text-2xl font-black text-slate-800 mt-1">{PACKAGE_LABEL[pkg]}</h1>
          <p className="text-slate-600 mt-2">默认卡点：{causeLabel}</p>
        </section>

        <section className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-600">家长称呼 *</span>
            <input
              value={form.parentName}
              onChange={(e) => setForm((prev) => ({ ...prev, parentName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#667EEA]"
              placeholder="例如：李妈妈"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">孩子年级 *</span>
            <input
              value={form.grade}
              onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#667EEA]"
              placeholder="例如：初二"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">地区 *</span>
            <input
              value={form.region}
              onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#667EEA]"
              placeholder="例如：杭州"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">微信号或手机号 *</span>
            <input
              value={form.contact}
              onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#667EEA]"
              placeholder="例如：wx123 / 138xxxx"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">当前分数（选填）</span>
            <input
              value={form.currentScore}
              onChange={(e) => setForm((prev) => ({ ...prev, currentScore: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#667EEA]"
              placeholder="例如：82"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">主要卡点 *</span>
            <input
              value={form.mainIssue}
              onChange={(e) => setForm((prev) => ({ ...prev, mainIssue: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#667EEA]"
              placeholder="例如：条件关系总是写乱"
            />
          </label>

          <button
            onClick={handleSubmit}
            className="w-full mt-2 bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            好了，陈老师请看诊
          </button>
        </section>

        {saved ? (
          <section className="bg-green-50 border border-green-200 rounded-[24px] p-6">
            <p className="text-lg font-black text-green-700">已保存到本地，信息提交完成。</p>
            <p className="text-green-700 mt-2">
              下一步：{pkg === "A" ? "24小时内给你交付2套卷+1次复检。" : "24小时内先给你排本周节奏，再按周推进。"}
            </p>
            <p className="text-green-700 mt-1">你现在可以先回训练继续做题，等联系确认即可。</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default function UpsellSubmitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-500">加载中...</div>}>
      <UpsellSubmitPageContent />
    </Suspense>
  );
}
