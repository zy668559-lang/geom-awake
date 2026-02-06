"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("pending_geometry_image", reader.result as string);
        router.push("/processing");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* 极简标题区 */}
      <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          几何思维 AI 体检中心
        </h1>
        <p className="text-slate-500 text-xl font-medium tracking-wide leading-relaxed">
          陈老师 AI 体检：少走冤枉路
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* 核心交互区 - 极简大圆角按钮 */}
      <button
        onClick={handleStart}
        className="group relative px-12 py-10 bg-white rounded-[64px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)]
                   border border-slate-100/50
                   flex flex-col items-center justify-center gap-8
                   hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="w-28 h-28 rounded-[40px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <Camera size={56} className="text-white" strokeWidth={2} />
        </div>

        <div className="text-center">
          <span className="block text-2xl font-black text-slate-800 tracking-tight">
            拍下难题，开始体检
          </span>
          <span className="block text-sm text-slate-400 mt-2 font-medium">
            AI 辅助寻找解题突破口
          </span>
        </div>
      </button>

      {/* 底部文案 */}
      <div className="fixed bottom-12 text-center">
        <p className="text-xs text-slate-300 font-light tracking-widest uppercase opacity-60">
          极简主义 · 陈老师工作室
        </p>
      </div>
    </div>
  );
}
