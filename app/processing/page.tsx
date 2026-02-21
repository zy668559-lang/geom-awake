"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Search, MessageCircle, ArrowRight } from "lucide-react";

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

const DEMO_DIAGNOSIS_FIXTURE = {
    stuckPoint: "你不是不会做，是第一步总容易犹豫。",
    rootCause: "题目一上来你就想一步到位，所以关键关系反而看漏了。",
    coachAdvice: "咱们先慢半拍，先把已知条件圈出来，再选一条最短推进线。",
    threeDayPlan: [
        { day: 1, task: "每天只做2题，先练“看点-选线”这一步。" },
        { day: 2, task: "把每题的第一句“因为”写完整，不求快。" },
        { day: 3, task: "做完后口述1分钟：我今天到底卡在哪。" },
    ],
};

export default function ProcessingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, setState] = useState<SearchState>("IDENTIFYING");
    const [stuckPoint, setStuckPoint] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const hasInitialized = useRef(false);
    const submitLockRef = useRef(false);
    const demoMode = searchParams.get("demo") === "1";
    // 自动流程：读取图片并立即进入交互模式
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const mockImg = localStorage.getItem("pending_geometry_image");
        if (mockImg || demoMode) {
            setImageBase64(mockImg || "demo-image");
            setState("INTERACTING");
        }
    }, [demoMode]);

    const handleStartDiagnosis = async (point: string) => {
        if (isLoading || submitLockRef.current) return; // 双保险：防重复提交
        submitLockRef.current = true;

        const finalPoint = point || stuckPoint;
        setStuckPoint(finalPoint);
        setState("REASONING");
        setIsLoading(true);

        try {
            if (demoMode) {
                const demoResult = {
                    ...DEMO_DIAGNOSIS_FIXTURE,
                    stuckPoint: finalPoint || DEMO_DIAGNOSIS_FIXTURE.stuckPoint,
                };
                localStorage.setItem("latest_diagnosis", JSON.stringify(demoResult));
                router.push("/report");
                return;
            }

            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageBase64,
                    stuckPoint: finalPoint
                })
            });

            const responseData = await res.json();

            if (!res.ok) {
                // 暴力展示所有错误，由用户决定下一步，不再强制等待
                if (responseData.errData) {
                    window.alert(`🛑 视觉识图底层报错 (Google API):\n\n${JSON.stringify(responseData.errData, null, 2)}`);
                } else {
                    window.alert(`❌ 诊断失败: ${responseData.details || "未知错误"}`);
                }
                throw new Error(responseData.details || "诊断失败");
            }

            // 保存结果并跳转
            localStorage.setItem("latest_diagnosis", JSON.stringify(responseData));
            router.push("/report");
        } catch (error: any) {
            console.error("Diagnosis Error:", error);
            // 报错后允许立即重试，不再设置 20s 冷却
            setState("INTERACTING");
        } finally {
            setIsLoading(false);
            submitLockRef.current = false;
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
                                disabled={isLoading}
                                className={`w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-left border border-slate-100 transition-all flex justify-between items-center group ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
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
                                disabled={!stuckPoint.trim() || isLoading}
                                className="bg-slate-900 text-white px-6 rounded-xl font-bold disabled:opacity-30"
                            >
                                {isLoading ? "..." : "确定"}
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
