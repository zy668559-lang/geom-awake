"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handlePhotoScan = () => {
    // Default to grade 8 for simplified flow
    router.push(`/clinic?grade=8`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center p-8 font-sans">
      
      {/* Logo & Title */}
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          几何觉醒
        </h1>
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          AI 找提分秘密
        </p>
      </div>

      {/* Main CTA Button */}
      <button
        onClick={handlePhotoScan}
        className="group relative w-[340px] h-[340px] bg-white rounded-[56px] shadow-2xl shadow-blue-200/60 
                   flex flex-col items-center justify-center gap-6 
                   hover:scale-[1.02] active:scale-[0.98] 
                   transition-all duration-300 ease-out
                   animate-breathing"
      >
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                        flex items-center justify-center shadow-lg shadow-blue-300/50
                        group-hover:shadow-xl group-hover:shadow-blue-400/60 transition-all">
          <Sparkles size={48} className="text-white" strokeWidth={2.5} />
        </div>
        
        {/* Text */}
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-800 mb-2">拍照诊断</div>
          <div className="text-sm text-slate-400 font-medium">上传错题，3分钟找到提分关键</div>
        </div>

        {/* Subtle Pulse Ring */}
        <div className="absolute inset-0 rounded-[56px] border-4 border-blue-400/30 animate-pulse-ring"></div>
      </button>

      {/* Bottom Hint */}
      <p className="mt-16 text-center text-sm text-slate-400 max-w-xs leading-relaxed">
        不是搜题给答案<br/>是把"画线和找关系"练出来
      </p>
    </div>
  );
}
