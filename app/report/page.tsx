"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, CheckCircle2, Download } from "lucide-react";
import { type RepairCause } from "@/data/training/repair_7days";

type DiagnosisData = {
  stuckPoint: string;
  rootCause: string;
  coachAdvice: string;
  threeDayPlan: { day: number; task: string }[];
};

function inferCause(text: string): RepairCause {
  if (/证明|全等|推理/.test(text)) return "proof_writing";
  if (/条件|关系|因为|所以/.test(text)) return "condition_relation";
  return "draw_line";
}

export default function ReportPage() {
  const router = useRouter();
  const [data, setData] = useState<DiagnosisData | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("latest_diagnosis");
    if (!raw) return;

    try {
      setData(JSON.parse(raw));
    } catch (error) {
      console.error("Failed to parse diagnosis", error);
    }
  }, []);

  const cause = useMemo<RepairCause>(() => {
    if (!data) return "draw_line";
    return inferCause(`${data.stuckPoint} ${data.rootCause}`);
  }, [data]);

  const verdict = useMemo(() => {
    if (!data) return "这题不是不会，是关键一步老掉链子。";
    return `你现在最卡的是“${data.stuckPoint}”，先把这一步修稳，分数就会起来。`;
  }, [data]);

  const handleGeneratePoster = () => {
    setIsGeneratingPoster(true);
    window.setTimeout(() => {
      setIsGeneratingPoster(false);
      window.alert("诊断长图已生成，请直接截图保存。");
    }, 600);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <p className="text-slate-400">正在生成体检报告，请稍候...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <nav className="bg-white px-6 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="text-slate-400 font-medium hover:text-slate-600">
          关闭
        </button>
        <span className="mx-auto font-bold text-slate-800">陈老师亲笔：几何思维体检报告</span>
        <div className="w-8" />
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <section className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 leading-snug mb-3">{data.stuckPoint}</h1>
          <p className="text-slate-700 font-bold">陈老师结论：{verdict}</p>
        </section>

        <button
          onClick={handleGeneratePoster}
          disabled={isGeneratingPoster}
          className="w-full bg-[#F59E0B] text-white text-lg font-black py-4 rounded-[20px] shadow-lg hover:brightness-105 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Download size={20} />
          {isGeneratingPoster ? "正在生成长图..." : "生成诊断长图并保存"}
        </button>

        <section className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">解析总览</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                <p className="text-sm font-black text-red-600">逻辑断层</p>
                <p className="text-sm text-slate-700 mt-1">前后步骤接不上，写到一半就断了。</p>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-sm font-black text-amber-600">凭空捏造</p>
                <p className="text-sm text-slate-700 mt-1">结论看着像对，但中间没依据支撑。</p>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm font-black text-blue-600">图形没拎清</p>
                <p className="text-sm text-slate-700 mt-1">平行、垂直、中点没排好顺序就动笔。</p>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">一句人话版原因</h2>
            <p className="text-xl text-slate-700 font-medium leading-relaxed">{data.rootCause}</p>
          </div>

          <div className="p-8 bg-gradient-to-br from-[#F0F4FF] to-white">
            <h2 className="text-lg font-bold text-[#667EEA] mb-4">今晚先这样练</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#667EEA]/10">
              <p className="text-xl font-bold text-slate-800 leading-relaxed">{data.coachAdvice}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.threeDayPlan.map((plan) => (
            <div key={plan.day} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Day {plan.day}</span>
              </div>
              <p className="text-slate-700 font-bold leading-relaxed">{plan.task}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            className="w-full bg-white border border-slate-200 text-slate-700 text-lg font-bold py-5 rounded-[24px] shadow-sm hover:bg-slate-50 transition-all"
            onClick={() => {
              const isUnlocked = localStorage.getItem("repair_unlocked") === "true";
              const nextPath = `/repair?cause=${cause}`;
              if (isUnlocked) {
                router.push(nextPath);
              } else {
                router.push(`/unlock?next=${encodeURIComponent(nextPath)}`);
              }
            }}
          >
            再练一轮
          </button>

          <button
            className="w-full bg-[#1A1A1A] text-white text-lg font-bold py-5 rounded-[24px] shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            onClick={() => router.push(`/upsell?cause=${cause}`)}
          >
            把分数稳住
            <ArrowRight size={20} />
          </button>
        </section>
      </main>
    </div>
  );
}
