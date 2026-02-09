"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";

export default function RepairPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const isUnlocked = localStorage.getItem("repair_unlocked") === "true";
        if (!isUnlocked) {
            router.push("/unlock");
        } else {
            setIsLoaded(true);
        }
    }, [router]);

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <nav className="p-6">
                <button
                    onClick={() => router.push("/report")}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    返回报告
                </button>
            </nav>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 text-center">
                <div className="bg-white rounded-[40px] p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Sparkles size={40} />
                    </div>

                    <h1 className="text-3xl font-black text-slate-800 mb-4">
                        特训开启！
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        陈老师正在为你准备 7 天专属训练计划...<br />
                        先喝口水，好戏马上开场。
                    </p>
                </div>
            </main>
        </div>
    );
}
