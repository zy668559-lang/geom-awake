"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft, X } from "lucide-react";
import { REPAIR_CAUSE_OPTIONS, RepairCause, isRepairCause } from "@/data/training/repair_7days";
import { getRetest6QPack } from "@/data/retest_6q";

type AnswerMap = Record<string, number | undefined>;

function getQuickComment(rate: number): string {
  if (rate >= 80) return "这轮状态很稳，已经有提分手感了。";
  if (rate >= 60) return "方向是对的，再补两步就能稳住。";
  if (rate >= 40) return "基础在，但关键步还没连上。";
  return "别急，这只是初诊，先把方法踩稳。";
}

export default function RetestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCause, setSelectedCause] = useState<RepairCause>("draw_line");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("cause");
    const fromLocal = localStorage.getItem("repair_selected_cause");
    const cause = isRepairCause(fromQuery) ? fromQuery : isRepairCause(fromLocal) ? fromLocal : "draw_line";
    setSelectedCause(cause);
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem("repair_selected_cause", selectedCause);
    localStorage.setItem("latest_retest_cause", selectedCause);
    setAnswers({});
  }, [selectedCause]);

  const pack = useMemo(() => getRetest6QPack(selectedCause), [selectedCause]);
  const total = pack.questions.length;

  const answeredCount = useMemo(
    () => pack.questions.filter((q) => answers[q.id] !== undefined).length,
    [answers, pack.questions],
  );

  const instantStats = useMemo(() => {
    let hitCount = 0;
    let done = 0;

    for (const q of pack.questions) {
      const picked = answers[q.id];
      if (picked === undefined) continue;
      done += 1;
      if (picked === q.correctOption) hitCount += 1;
    }

    const rate = done > 0 ? Math.round((hitCount / done) * 100) : 0;
    return { done, hitCount, rate };
  }, [answers, pack.questions]);

  const handleSubmit = () => {
    if (answeredCount < total) {
      alert(`还有 ${total - answeredCount} 题没选，先做完再提交。`);
      return;
    }

    let hitCount = 0;
    const wrongItems: Array<{ id: string; wrongReason: string }> = [];

    for (const q of pack.questions) {
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correctOption;
      if (isCorrect) {
        hitCount += 1;
      } else {
        wrongItems.push({
          id: q.id,
          wrongReason: q.wrongReason,
        });
      }
    }

    const hitRate = Math.round((hitCount / total) * 100);
    const fixed = hitRate >= 70;
    const result = {
      cause: selectedCause,
      beforeTag: pack.label,
      total,
      hitCount,
      hitRate,
      fixed,
      wrongItems,
      verdict: fixed ? "这块已经稳住了，继续把分数守住。" : "这块还没彻底稳，先再练一轮。",
      suggestion: fixed ? "进入 upsell" : "再练一轮",
    };

    localStorage.setItem("latest_retest_result", JSON.stringify(result));
    localStorage.setItem("latest_retest_cause", selectedCause);
    const search = new URLSearchParams({
      cause: selectedCause,
      beforeTag: pack.label,
      total: String(total),
      hitCount: String(hitCount),
      hitRate: String(hitRate),
      fixed: fixed ? "1" : "0",
      verdict: result.verdict,
      suggestion: result.suggestion,
      wrongReasons: wrongItems.map((item) => item.wrongReason).join("||"),
    });
    router.push(`/retest/result?${search.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="p-6 flex items-center bg-white shadow-sm">
        <button
          onClick={() => router.push(`/repair?cause=${selectedCause}`)}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
          返回特训
        </button>
        <span className="mx-auto font-black text-slate-800 text-lg">静态小测</span>
        <div className="w-12" />
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6 pb-24">
        <section className="bg-white rounded-[24px] p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">先选本轮要复检的错因线</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {REPAIR_CAUSE_OPTIONS.map((cause) => (
              <button
                key={cause.key}
                onClick={() => setSelectedCause(cause.key)}
                className={`rounded-2xl px-4 py-3 text-left border-2 transition-all ${selectedCause === cause.key ? "border-[#667EEA] bg-[#667EEA]/5" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`}
              >
                <p className="text-sm font-black text-slate-800">{cause.label}</p>
                <p className="text-xs text-slate-500 mt-1">{cause.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-black text-slate-800">
              {pack.label} · 复检题（{total}题）
            </h1>
            <span className="text-sm font-bold text-slate-500">
              已完成 {answeredCount}/{total}
            </span>
          </div>
          <p className="text-sm text-slate-500">这轮只做静态小测，不调外部接口。</p>
        </section>

        {instantStats.done > 0 ? (
          <section className="bg-white rounded-[24px] p-5 shadow-sm border border-[#667EEA]/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-bold text-[#667EEA] uppercase tracking-widest mb-2">即时结果图</p>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-3 bg-[#667EEA] transition-all duration-150"
                style={{ width: `${Math.max(8, instantStats.rate)}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 mt-2">
              当前命中率：<span className="font-black text-slate-800">{instantStats.rate}%</span>（命中 {instantStats.hitCount}/{instantStats.done}）
            </p>
            <p className="text-base font-bold text-slate-800 mt-2">一句话点评：{getQuickComment(instantStats.rate)}</p>
          </section>
        ) : null}

        <div className="space-y-4">
          {pack.questions.map((q, idx) => (
            <section key={q.id} className="bg-white rounded-[24px] p-5 shadow-sm">
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-2">第 {idx + 1} 题</p>
              <p className="text-lg font-bold text-slate-800 mb-2">{q.stem}</p>
              <p className="text-sm text-slate-500 mb-4">从三个选项里，选你现在最稳的一项。</p>
              <div className="space-y-2">
                {q.options.map((option, optionIdx) => {
                  const active = answers[q.id] === optionIdx;
                  return (
                    <button
                      key={option}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }))}
                      className={`w-full text-left rounded-xl px-4 py-3 border transition-all ${active ? "border-[#667EEA] bg-[#667EEA]/5 text-slate-800" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="bg-amber-50 border border-amber-200 rounded-[20px] p-4">
          <p className="text-slate-800 font-bold">
            这只是初诊，点击“深度 AI 诊断”获取完整避坑指南
          </p>
          <button
            onClick={() => setShowRecommendModal(true)}
            className="mt-3 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl font-bold"
          >
            深度 AI 诊断
          </button>
        </section>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#1A1A1A] text-white text-xl font-bold py-5 rounded-[24px] shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          好了，陈老师请看诊
          <ArrowRight size={20} />
        </button>
      </main>

      {showRecommendModal ? (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-white rounded-[24px] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRecommendModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              aria-label="关闭推荐窗口"
            >
              <X size={16} />
            </button>
            <p className="text-xl font-black text-slate-900 leading-relaxed mt-4">病根在这里</p>
            <p className="text-xl font-black text-slate-900 leading-relaxed">解药是这个</p>
            <p className="text-xl font-black text-slate-900 leading-relaxed mb-6">点这里立即开窍</p>
            <button
              onClick={() => {
                setShowRecommendModal(false);
                router.push("/processing");
              }}
              className="w-full bg-[#FF7A00] text-white font-black text-lg py-4 rounded-2xl shadow-lg hover:brightness-105 transition-all"
            >
              获取我的专属开窍路书
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
