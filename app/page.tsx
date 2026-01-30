"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Activity } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [grade, setGrade] = useState("7");

  const handleClinic = () => {
    // Path A: Upload -> Clinic -> 3 Questions
    router.push(`/clinic?grade=${grade}`);
  };

  const handleStart = () => {
    // Path B: Quick Checkup -> Diagnose -> 3 Questions
    router.push(`/diagnose?grade=${grade}`);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-6 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header Image Area */}
        <div className="bg-blue-600 h-48 flex flex-col items-center justify-center text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none"/></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">几何觉醒</h1>
          <p className="text-blue-100 relative z-10">初中几何闭环训练器 v1.0</p>
          <div className="mt-4 text-xs bg-blue-700/50 px-3 py-1 rounded-full">
              闭环 · 画像 · 动作训练 · 双轨验收
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Grade Selector */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">第一步：选择年级</label>
            <div className="grid grid-cols-3 gap-3">
              {["7", "8", "9"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`py-3 rounded-xl font-bold text-lg transition-all
                    ${grade === g 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 ring-2 ring-blue-300" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  {g}年级
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
             <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">第二步：选择入口</label>
             
             {/* Path A: Upload Wrong Question (Priority) */}
             <button
                onClick={handleClinic}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform relative overflow-hidden group"
             >
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold shadow-sm">推荐</span>
                <div className="bg-white/20 p-2 rounded-full">
                    <BookOpen size={20} className="text-white" />
                </div>
                <div className="text-left">
                    <div className="text-sm opacity-90 font-normal">我有错题</div>
                    <div className="text-xl">拍照诊断</div>
                </div>
             </button>

             <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">或者</span>
                <div className="flex-grow border-t border-slate-200"></div>
             </div>

             {/* Path B: Quick Checkup */}
             <button
                onClick={handleStart}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-blue-300 transition-all group"
             >
                <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Activity size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm opacity-60 font-normal">没题</div>
                    <div className="text-xl">做个快体检</div>
                </div>
             </button>
          </div>
          
          <p className="text-center text-xs text-slate-400">
            不是搜题给答案，是把孩子“画线和找关系”练出来
          </p>
        </div>
      </div>
    </div>
  );
}
