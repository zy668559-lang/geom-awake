"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, Search, MessageCircle, ArrowRight } from "lucide-react";

type SearchState = "IDENTIFYING" | "INTERACTING" | "REASONING" | "COMPLETE";

const STEPS = {
    IDENTIFYING: "正在让 Gemini 识图，帮孩子看准题目条件...",
    INTERACTING: "陈老师想问问：孩子目前在这个题上，具体觉得哪儿卡住了？",
    REASONING: "收到！陈老师正在结合识图结果和你的反馈，给孩子支招...",
};

const STUCK_OPTIONS = [
    "辅助线完全想不到",
    "题目条件太多，理不清关系",
    "知道要证什么，但写不出过程",
    "公式/定理记不全",
    "我不确定，让陈老师看看"
];

export default function ProcessingPage() {
    const router = useRouter();
    const [state, setState] = useState<SearchState>("IDENTIFYING");
    const [stuckPoint, setStuckPoint] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // 模拟读取刚才上传的图片 (实际应该从状态或 URL 传过来)
    useEffect(() => {
        // 简单模拟：实际开发中建议使用全局状态或 URL 参数
        const mockImg = localStorage.getItem("pending_geometry_image");
        if (mockImg) setImageBase64(mockImg);

        // 第一步：自动识图 (Gemini)
        const timer = setTimeout(() => {
            setState("INTERACTING");
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleStartDiagnosis = async (point: string) => {
        const finalPoint = point || stuckPoint;
        setStuckPoint(finalPoint);
        setState("REASONING");
        setIsLoading(true);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageBase64,
                    stuckPoint: finalPoint
                })
            });

            if (!res.ok) throw new Error("诊断失败");

            const diagnosisData = await res.json();
            // 保存结果并跳转
            localStorage.setItem("latest_diagnosis", diagnosisData);
            router.push("/report");
        } catch (error) {
            console.error(error);
            alert("陈老师刚才走神了，咱们重试一下？");
            setState("INTERACTING");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            {/* 动画图标区 */}
            <div className="relative mb-12">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                    {(state === "IDENTIFYING" || state === "COMPLETE") && <Search className="text-slate-400 w-12 h-12 animate-bounce" />}
                    {state === "INTERACTING" && <MessageCircle className="text-blue-500 w-12 h-12" />}
                    {state === "REASONING" && <Brain className="text-[#667EEA] w-12 h-12 animate-spin-slow" />}
                </div>
                <div className="absolute inset-0 w-32 h-32 border-4 border-[#667EEA]/20 rounded-full" />
                <div className="absolute inset-0 w-32 h-32 border-4 border-t-[#667EEA] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            {/* 文案区 */}
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-2xl font-black text-slate-800 leading-snug min-h-[4rem]">
                    {state === "INTERACTING" ? STEPS.INTERACTING : (state === "IDENTIFYING" ? STEPS.IDENTIFYING : STEPS.REASONING)}
                </h2>

                {/* 卡点选择区 */}
                {state === "INTERACTING" && (
                    <div className="grid gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {STUCK_OPTIONS.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleStartDiagnosis(opt)}
                                className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-left border border-slate-100 transition-all flex justify-between items-center group"
                            >
                                {opt}
                                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                        <div className="mt-4 flex gap-2">
                            <input
                                placeholder="或者在这儿写两句..."
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={stuckPoint}
                                onChange={(e) => setStuckPoint(e.target.value)}
                            />
                            <button
                                onClick={() => handleStartDiagnosis(stuckPoint)}
                                disabled={!stuckPoint.trim()}
                                className="bg-slate-900 text-white px-6 rounded-xl font-bold disabled:opacity-30"
                            >
                                确定
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 极简指示器 */}
            <div className="flex gap-2 mt-12 pb-12">
                {["IDENTIFYING", "INTERACTING", "REASONING"].map((s) => (
                    <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-500 ${state === s
                            ? "w-8 bg-slate-800"
                            : "w-1.5 bg-slate-200"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
