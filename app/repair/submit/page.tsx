"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SubmitPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [stuckPoint, setStuckPoint] = useState("不知道怎么开始");
    const [content, setContent] = useState("");
    const [result, setResult] = useState<any>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");

    // Hash of the last successful submission to prevent duplicate requests
    const lastSubmissionHash = useRef("");

    const STUCK_POINTS = [
        "不知道怎么开始",
        "画不出辅助线",
        "看不出图形关系",
        "写到一半卡住了",
        "算不出最后结果"
    ];

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (isRetry = false) => {
        const currentHash = JSON.stringify({ stuckPoint, content });

        // 1. Client-side Idempotency
        if (!isRetry && lastSubmissionHash.current === currentHash && result) {
            console.log("[Client] Idempotent: Same content as before, skipping request.");
            return;
        }

        setIsLoading(true);
        setStatusMsg(isRetry ? `正在尝试第 ${retryCount + 1} 次重试...` : "正在交给陈老师判定...");

        const submissionId = btoa(currentHash).slice(0, 16); // Simple hash for MVP2

        try {
            const response = await fetch("/api/repair/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId, stuckPoint, content }),
            });

            // 2. Exponential Backoff for 429
            if (response.status === 429) {
                if (retryCount < 3) {
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    console.warn(`[Client] 429 Detected. Retrying in ${waitTime}ms... (Attempt ${retryCount + 1})`);
                    setStatusMsg(`陈老师正在思考中，稍微等我 ${waitTime / 1000} 秒钟...`);
                    setRetryCount(prev => prev + 1);
                    await sleep(waitTime);
                    return handleSubmit(true);
                } else {
                    throw new Error("陈老师今天太累了，请稍后再试（请求过多）");
                }
            }

            if (!response.ok) throw new Error("服务器出了点小差错，陈老师还在修。");

            const data = await response.json();
            setResult(data);
            lastSubmissionHash.current = currentHash;
            setRetryCount(0);
            setStatusMsg("");
        } catch (err: any) {
            console.error("[Client] Submit Error:", err);
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6 flex items-center bg-white shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回
                </button>
                <span className="mx-auto font-black text-slate-800 text-lg">提交反馈</span>
                <div className="w-12" />
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 pb-24">
                {/* 1. 卡点选择 */}
                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 text-center">
                        你现在卡在哪了？
                    </h2>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {STUCK_POINTS.map(p => (
                            <button
                                key={p}
                                onClick={() => setStuckPoint(p)}
                                className={`
                                    px-6 py-3 rounded-2xl font-bold transition-all
                                    ${stuckPoint === p
                                        ? "bg-[#667EEA] text-white shadow-md scale-105"
                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"}
                                `}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. 上传/输入 */}
                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 text-center">
                        拍个照，或者写下你的进度
                    </h2>

                    <div className="aspect-video bg-slate-50 border-4 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300 hover:text-slate-400 hover:border-slate-300 transition-all cursor-pointer group">
                        <Camera size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">点击拍照上传草稿页</span>
                    </div>

                    <textarea
                        placeholder="或者直接在这里写下你的思路..."
                        className="w-full mt-6 bg-slate-50 border-2 border-transparent focus:border-[#667EEA] focus:bg-white rounded-2xl p-6 h-32 outline-none font-medium text-slate-700 transition-all"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </section>

                {/* 3. 提交按钮 */}
                <button
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className={`
                        w-full py-6 rounded-[24px] text-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                        ${isLoading
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-[#1A1A1A] text-white hover:scale-[1.02] active:scale-[0.98]"}
                    `}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>{statusMsg || "正在提交..."}</span>
                        </>
                    ) : (
                        <>
                            <span>陈老师，帮我看看</span>
                            <Send size={20} />
                        </>
                    )}
                </button>

                {/* 4. 判定结果区域 */}
                {result && (
                    <div className="bg-green-50 border-2 border-green-100 rounded-[32px] p-8 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="text-green-500" size={28} />
                            <h2 className="text-xl font-black text-slate-800">判定结果</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-green-700">✓</span>
                                </div>
                                <p className="text-lg font-bold text-slate-700">
                                    关键步骤提取成功：{result.key_steps_appeared ? "是" : "否"}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">陈老师建议的下一步</p>
                                <p className="text-xl font-black text-[#667EEA] leading-relaxed italic">
                                    “{result.next_action}”
                                </p>
                            </div>

                            <button
                                onClick={() => router.push("/retest")}
                                className="w-full mt-4 bg-green-500 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                我懂了，去复检
                                <CheckCircle2 size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
