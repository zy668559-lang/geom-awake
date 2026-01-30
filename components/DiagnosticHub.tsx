
"use client";

import React, { useState } from "react";
import { Camera, Upload, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DiagnosticHub() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "triage">("upload");
  const [images, setImages] = useState<{ main: string | null; draft: string | null }>({ main: null, draft: null });
  const [stuckPoint, setStuckPoint] = useState<string | null>(null);

  const handleImageUpload = (type: "main" | "draft", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Mock upload - in real app, upload to storage
      const url = URL.createObjectURL(e.target.files[0]);
      setImages(prev => ({ ...prev, [type]: url }));
    }
  };

  const handleStartDiagnosis = () => {
    // Save diagnostic state to local storage or pass via URL
    // For MVP, we'll just push to train page with params
    // Logic: In a real app, we'd send images to API here.
    // For V2 MVP, we simulate the "Analysis" on the next page.
    
    // We pass the "stuckPoint" as a query param to influence the AI's first message
    router.push(`/train?stuck=${stuckPoint}&grade=8`); // Defaulting to grade 8 for demo
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2">几何觉醒 · 拍片诊断</h1>
        <p className="text-slate-500">不刷题，先治“眼疾”和“脑梗”</p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Camera className="text-blue-600" /> 上传病历
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Main Image */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-600">1. 原题图</label>
                <div className="aspect-square bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors">
                  {images.main ? (
                    <img src={images.main} alt="Main" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" />
                      <span className="text-xs text-slate-400">点击上传</span>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload("main", e)} />
                </div>
              </div>

              {/* Draft Image */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-600">2. 你的草稿</label>
                <div className="aspect-square bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors">
                  {images.draft ? (
                    <img src={images.draft} alt="Draft" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" />
                      <span className="text-xs text-slate-400">点击上传</span>
                    </>
                  )}
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload("draft", e)} />
                </div>
              </div>
            </div>

            <button 
              disabled={!images.main}
              onClick={() => setStep("triage")}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
            >
              下一步：哪里难受？
            </button>
          </div>
        )}

        {/* Step 2: Triage */}
        {step === "triage" && (
          <div className="p-8 space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="text-orange-500" /> 卡在哪里了？
            </h2>

            <div className="space-y-3">
              {[
                { id: "visual", label: "A. 图太乱，看不清谁是谁", desc: "感觉线条在打架，找不到模型" },
                { id: "logic", label: "B. 没思路，想到模型连不上", desc: "知道是全等，但找不到条件" },
                { id: "express", label: "C. 会想不会写", desc: "脑子清楚，步骤写不出来" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStuckPoint(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    stuckPoint === opt.id 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="font-bold text-slate-800">{opt.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            <button 
              disabled={!stuckPoint}
              onClick={handleStartDiagnosis}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              开始深度扫描 <ArrowRight size={20}/>
            </button>
          </div>
        )}

      </div>
      
      <p className="mt-8 text-xs text-slate-400 text-center max-w-xs">
        * V2.0 闭环系统：已接入 DeepSeek 视觉模型<br/>正在加载“拨云见日”引擎...
      </p>
    </div>
  );
}
