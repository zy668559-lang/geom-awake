"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ChevronLeft } from "lucide-react";

function resolveNextPath(nextValue: string | null): string {
    if (!nextValue) return "/repair";
    if (!nextValue.startsWith("/") || nextValue.startsWith("//")) return "/repair";
    return nextValue;
}

export default function UnlockPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const nextPath = useMemo(() => resolveNextPath(searchParams.get("next")), [searchParams]);

    useEffect(() => {
        const isUnlocked = localStorage.getItem("repair_unlocked") === "true";
        if (isUnlocked) {
            router.replace(nextPath);
        }
    }, [nextPath, router]);

    const handleUnlock = () => {
        if (code === "123456") {
            localStorage.setItem("repair_unlocked", "true");
            router.push(nextPath);
        } else {
            setError("激活码不对哦，再检查一下？");
            setTimeout(() => setError(""), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回报告
                </button>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
                <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
                    <div className="w-16 h-16 bg-[#667EEA]/10 text-[#667EEA] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 mb-2">解锁 7 天特训</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        这个是付费进阶内容哦，请输入你的 7 天邀请码（MVP2 测试码：123456）。
                    </p>

                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="输入 6 位邀请码"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#667EEA] focus:bg-white rounded-2xl px-6 py-4 text-center text-xl font-bold tracking-[0.5em] transition-all outline-none"
                                maxLength={6}
                            />
                            {error && (
                                <p className="absolute -bottom-6 left-0 right-0 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleUnlock}
                            className="w-full bg-[#667EEA] text-white text-lg font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            输入暗号，开启 7 天特训
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        没有邀请码？<br />
                        <span className="text-[#667EEA] cursor-pointer hover:underline">点击这里联系陈老师助手</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
