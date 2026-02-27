"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type QuizOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedbackText: string;
};

const QUIZ_OPTIONS: QuizOption[] = [
  {
    id: "a",
    label: "先把已知条件一条条写清楚，再往下推",
    isCorrect: true,
    feedbackText: "这步做对了，你在用‘先搭骨架再推进’的稳分思路。",
  },
  {
    id: "b",
    label: "直接写结论，后面再补理由",
    isCorrect: false,
    feedbackText: "如果不纠正这个坏习惯，孩子中考几何至少丢10分！别让努力白费，看陈老师怎么说。",
  },
  {
    id: "c",
    label: "先猜答案，再从图上找能对上的点",
    isCorrect: false,
    feedbackText: "如果不纠正这个坏习惯，孩子中考几何至少丢10分！别让努力白费，看陈老师怎么说。",
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [picked, setPicked] = useState<QuizOption | null>(null);

  const resultTitle = useMemo(() => {
    if (!picked) return "";
    return picked.isCorrect ? "这次判断很稳" : "这步容易翻车";
  }, [picked]);

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
          <h1 className="text-2xl font-black text-slate-900">静态小测</h1>
          <p className="text-slate-600 mt-2">当你卡在证明题时，第一步最稳的做法是哪一个？</p>
        </section>

        <section className="bg-white rounded-[24px] p-6 shadow-sm space-y-3">
          {QUIZ_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPicked(opt)}
              className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all ${
                picked?.id === opt.id ? "border-[#667EEA] bg-[#667EEA]/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <span className="font-bold text-slate-800">{opt.label}</span>
            </button>
          ))}
        </section>

        {picked ? (
          <section className="bg-white rounded-[24px] p-6 shadow-lg border border-[#667EEA]/20 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-black text-slate-900">{resultTitle}</h2>
            <p className="text-slate-700 mt-2">{picked.feedbackText}</p>
            <button
              onClick={() => router.push("/processing")}
              className="mt-5 w-full bg-[#FF4D2D] text-white py-5 rounded-2xl font-black text-xl animate-pulse hover:brightness-105 transition-all shadow-[0_12px_30px_rgba(255,77,45,0.45)]"
            >
              立即获取我的专属避坑诊断报告
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
