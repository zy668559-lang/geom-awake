"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, Loader2, Send } from "lucide-react";

export default function SubmitPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [stuckPoint, setStuckPoint] = useState("不知道怎么开始");
    const [content, setContent] = useState("");
    const [statusMsg, setStatusMsg] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const submitLockRef = useRef(false);

    // Hash of the last successful submission to prevent duplicate requests.
    const lastSubmissionHash = useRef("");

    const STUCK_POINTS = [
        "不知道怎么开始",
        "画不出辅助线",
        "看不出图形关系",
        "写到一半卡住了",
        "算不出最后结果",
    ];

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleSubmit = async () => {
        if (isLoading || submitLockRef.current) return;

        const currentHash = JSON.stringify({ stuckPoint, content });
        if (lastSubmissionHash.current === currentHash) {
            console.log("[Client] Idempotent: Same content as before, skipping request.");
            return;
        }

        submitLockRef.current = true;
        setIsLoading(true);
        setStatusMsg("正在交给陈老师判定...");

        const submissionId = btoa(currentHash).slice(0, 16);

        try {
            const maxRetries = 3;
            let attempt = 0;
            let response: Response;

            while (true) {
                response = await fetch("/api/repair/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ submissionId, stuckPoint, content }),
                });

                if (response.status !== 429) break;
                if (attempt >= maxRetries) {
                    throw new Error("陈老师今天太累了，请稍后再试（请求过多）");
                }

                const waitTime = 2 ** attempt * 1000;
                attempt += 1;
                setRetryCount(attempt);
                setStatusMsg(
                    `陈老师正在思考中，稍微等我 ${waitTime / 1000} 秒钟...（重试 ${attempt}/${maxRetries}）`
                );
                console.warn(`[Client] 429 Detected. Retrying in ${waitTime}ms... (Attempt ${attempt}/${maxRetries})`);
                await sleep(waitTime);
            }

            if (!response!.ok) throw new Error("服务器出了点小差错，陈老师还在修。");

            const data = await response!.json();
            lastSubmissionHash.current = currentHash;
            setRetryCount(0);
            setStatusMsg("");

            const search = new URLSearchParams({
                passed: data.key_steps_appeared ? "1" : "0",
                next: data.next_action || "保持复盘，继续推进下一题。",
                retries: String(attempt),
            });
            router.push(`/repair/submit/result?${search.toString()}`);
        } catch (err: any) {
            console.error("[Client] Submit Error:", err);
            alert(err.message);
        } finally {
            setIsLoading(false);
            submitLockRef.current = false;
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
                <section className="bg-white rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 text-center">
                        你现在卡在哪了？
                    </h2>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {STUCK_POINTS.map((p) => (
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

                <button
                    onClick={handleSubmit}
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
            </main>
        </div>
    );
}
