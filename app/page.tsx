"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Camera } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    // Phase 2: 跳转至处理页模拟上传分析流
    router.push("/processing");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* 极简标题区 */}
      <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent tracking-tight leading-tight">
          几何思维 AI 体检中心
        </h1>
        <p className="text-slate-500 text-xl font-medium tracking-wide leading-relaxed">
          陈老师 AI 体检：少走冤枉路，帮孩子找准那个一拨就开窍的提分点。
        </p>
      </div>

      {/* 核心交互区 - 呼吸感大按钮 */}
      <button
        onClick={handleStart}
        className="group relative w-full max-w-sm aspect-square bg-white rounded-[48px] shadow-[0_20px_60px_-12px_rgba(102,126,234,0.15)]
                   border border-slate-100/50
                   flex flex-col items-center justify-center gap-8
                   animate-hover-lift animate-breathing"
      >
        {/* 图标容器 */}
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#667EEA] to-[#764BA2] 
                        flex items-center justify-center shadow-lg shadow-blue-500/30
                        group-hover:scale-110 transition-transform duration-500">
          <Camera size={56} className="text-white" strokeWidth={2} />
        </div>

        {/* 文字指引 */}
        <div className="text-center px-6 space-y-3">
          <span className="block text-xl font-bold text-slate-800 leading-snug">
            立即上传几何题<br />开启开窍之旅
          </span>
        </div>

        {/* 装饰性光晕 */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/0 to-transparent rounded-b-[48px] pointer-events-none opacity-50" />
      </button>

      {/* 底部极简 Slogan */}
      <div className="fixed bottom-12 text-center">
        <p className="text-xs text-slate-300 font-light tracking-widest uppercase opacity-60">
          Designed by Antigravity
        </p>
      </div>
    </div>
  );
}
