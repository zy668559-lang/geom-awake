"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, CircleAlert, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function SubmitResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const passed = searchParams.get("passed") === "1";
    const nextAction = searchParams.get("next") || "保持节奏，继续做下一题。";
    const retries = Number.parseInt(searchParams.get("retries") || "0", 10);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center bg-white shadow-sm">
                <button
                    onClick={() => router.push("/repair/submit")}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回提交页
                </button>
                <span className="mx-auto font-black text-slate-800 text-lg">提交结果</span>
                <div className="w-16" />
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        {passed ? (
                            <CheckCircle2 className="text-green-500" size={28} />
                        ) : (
                            <CircleAlert className="text-amber-500" size={28} />
                        )}
                        <h1 className="text-2xl font-black text-slate-800">
                            {passed ? "判定通过（占位）" : "判定未通过（占位）"}
                        </h1>
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        “{nextAction}”
                    </p>
                    <p className="mt-4 text-sm text-slate-400">
                        自动退避重试次数：{Number.isFinite(retries) ? retries : 0}
                    </p>
                </section>

                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-4">下一步</h2>
                    <button
                        onClick={() => router.push("/retest")}
                        className="w-full bg-[#1A1A1A] text-white py-5 rounded-[20px] font-bold text-lg shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        进入复检对比
                        <ArrowRight size={20} />
                    </button>
                </section>
            </main>
        </div>
    );
}

export default function SubmitResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">正在生成判定结果...</div>}>
            <SubmitResultContent />
        </Suspense>
    );
}

