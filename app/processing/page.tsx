"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, Search } from "lucide-react";

const STEPS = [
    "正在翻看孩子脑海里的几何模型，寻找卡壳的地方...",
    "别急，陈老师正在帮孩子找那个隐藏的辅助线绝招...",
    "找到没开窍的那个点了！陈老师这就给孩子支招..."
];

export default function ProcessingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // 步骤轮播逻辑
        if (currentStep < STEPS.length) {
            const timer = setTimeout(() => {
                if (currentStep < STEPS.length - 1) {
                    setCurrentStep((prev) => prev + 1);
                } else {
                    // 最后一步完成后跳转
                    router.push("/report");
                }
            }, 2000); // 每步停留 2 秒
            return () => clearTimeout(timer);
        }
    }, [currentStep, router]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            {/* 动画图标区 */}
            <div className="relative mb-12">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                    {currentStep === 0 && <Search className="text-slate-400 w-12 h-12 animate-bounce" />}
                    {currentStep === 1 && <Brain className="text-[#667EEA] w-12 h-12 animate-spin-slow" />}
                    {currentStep === 2 && <Sparkles className="text-[#764BA2] w-12 h-12 animate-ping" />}
                </div>

                {/* 环形进度条动画 (纯 CSS 实现) */}
                <div className="absolute inset-0 w-32 h-32 border-4 border-[#667EEA]/20 rounded-full" />
                <div className="absolute inset-0 w-32 h-32 border-4 border-t-[#667EEA] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            {/* 轮播文案区 */}
            <h2 className="text-2xl font-bold text-slate-800 mb-4 h-20 flex items-center justify-center max-w-xl transition-all duration-500 ease-in-out">
                {STEPS[currentStep]}
            </h2>

            {/* 进度指示器 */}
            <div className="flex gap-2 mt-8">
                {STEPS.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-500 ${index === currentStep
                                ? "w-8 bg-gradient-to-r from-[#667EEA] to-[#764BA2]"
                                : index < currentStep
                                    ? "w-2 bg-slate-300"
                                    : "w-2 bg-slate-100"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
