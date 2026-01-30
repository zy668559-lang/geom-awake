
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeometryModel } from "@/lib/geometry-models";
import { Eye, RotateCw, CheckCircle, Lock, MousePointer2 } from "lucide-react";
import GeometryCanvas from "./GeometryCanvas";

interface VisualGymProps {
  model: GeometryModel;
  onComplete: () => void;
}

export default function VisualGym({ model, onComplete }: VisualGymProps) {
  const [step, setStep] = useState<"intro" | "clear-clouds" | "soul-rotation">("intro");
  
  // Clear Clouds State
  const [interferenceOpacity, setInterferenceOpacity] = useState(0.9);
  const isCloudsCleared = interferenceOpacity <= 0.1;

  // Soul Rotation State
  const [rotation, setRotation] = useState(0);
  const targetRotation = model.rotationTarget || 0;
  // Tolerance for success
  const isRotatedCorrectly = Math.abs(rotation - targetRotation) < 5;
  const [showRotationSuccess, setShowRotationSuccess] = useState(false);

  // Auto-progress from rotation success
  useEffect(() => {
    if (step === "soul-rotation" && isRotatedCorrectly) {
      setShowRotationSuccess(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, isRotatedCorrectly, onComplete]);

  // Handlers
  const handleClearClouds = () => {
    // Animate opacity down
    const interval = setInterval(() => {
      setInterferenceOpacity((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.05;
      });
    }, 50);
  };

  const handleNextStep = () => {
    if (step === "intro") setStep("clear-clouds");
    else if (step === "clear-clouds" && isCloudsCleared) setStep("soul-rotation");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F4F8] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <h2 className="text-2xl font-black flex items-center justify-center gap-2">
            <Eye className="text-cyan-400" /> 几何觉醒空间操
          </h2>
          <p className="text-slate-400 text-sm mt-1">做题先热身，把脑子里的筋拉开</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-slate-50 p-6 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* 1. Intro */}
            {step === "intro" && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="text-center space-y-6"
              >
                <div className="w-32 h-32 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <RotateCw size={48} className="text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">准备好了吗？</h3>
                <p className="text-slate-600">接下来我们要进行 1 分钟的<br/>“视觉剥离”和“灵魂旋转”训练。</p>
                <button 
                  onClick={handleNextStep}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-cyan-200 transition-all hover:scale-105"
                >
                  开始热身
                </button>
              </motion.div>
            )}

            {/* 2. Clear Clouds (Dialysis) */}
            {step === "clear-clouds" && (
              <motion.div
                key="clouds"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="w-full flex flex-col items-center"
              >
                <div className="mb-4 text-center">
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <Eye size={20} className="text-purple-500"/> 拨云见日
                   </h3>
                   <p className="text-xs text-slate-400">有些线是来捣乱的，点按钮把它们变没！</p>
                </div>

                <div className="relative w-64 h-64 bg-white rounded-xl border border-slate-200 mb-6 shadow-inner overflow-hidden">
                  {/* Custom Canvas Render for Gym */}
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Interference Lines */}
                    {model.lines.filter(l => l.role === "interference").map((l, i) => {
                       const p1 = model.points.find(p => p.label === l.start);
                       const p2 = model.points.find(p => p.label === l.end);
                       if(!p1 || !p2) return null;
                       return (
                         <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                           stroke="#94a3b8" strokeWidth="2" opacity={interferenceOpacity} 
                         />
                       );
                    })}
                     {/* Core Lines */}
                     {model.lines.filter(l => l.role !== "interference").map((l, i) => {
                       const p1 = model.points.find(p => p.label === l.start);
                       const p2 = model.points.find(p => p.label === l.end);
                       if(!p1 || !p2) return null;
                       return (
                         <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                           stroke="#0f172a" strokeWidth="3" 
                         />
                       );
                    })}
                  </svg>
                </div>

                {!isCloudsCleared ? (
                  <button 
                    onClick={handleClearClouds}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 animate-pulse"
                  >
                    ✨ 施展透视魔法
                  </button>
                ) : (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handleNextStep}
                    className="w-full py-4 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-200"
                  >
                    骨架已清晰，继续 <MousePointer2 className="inline ml-2" size={16}/>
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* 3. Soul Rotation */}
            {step === "soul-rotation" && (
               <motion.div
               key="rotation"
               initial={{ opacity: 0, x: 100 }}
               animate={{ opacity: 1, x: 0 }}
               className="w-full flex flex-col items-center"
             >
               <div className="mb-4 text-center">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <RotateCw size={20} className="text-orange-500"/> 灵魂转动
                  </h3>
                  <p className="text-xs text-slate-400">转动三角形，让它和全等兄弟重合</p>
               </div>

               <div className="relative w-64 h-64 bg-white rounded-xl border border-slate-200 mb-6 shadow-inner flex items-center justify-center overflow-hidden">
                 {/* Static Target Shadow (if applicable for model) */}
                 <div 
                    className="absolute w-32 h-32 border-2 border-dashed border-slate-300 pointer-events-none"
                    style={{ transform: `rotate(${targetRotation}deg)` }}
                 >
                    <span className="absolute -top-5 left-0 text-xs text-slate-300">目标位</span>
                 </div>

                 {/* Rotatable Shape (Abstract representation of the core triangle) */}
                 <motion.div
                    className="w-32 h-32 border-4 border-blue-500 bg-blue-50/50"
                    style={{ rotate: rotation }}
                    animate={showRotationSuccess ? { borderColor: "#22c55e", backgroundColor: "#dcfce7", scale: 1.1 } : {}}
                 >
                    <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1">A</div>
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1">B</div>
                 </motion.div>

                 {showRotationSuccess && (
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/80"
                    >
                        <div className="text-green-600 font-black text-2xl flex flex-col items-center">
                            <CheckCircle size={48} className="mb-2"/>
                            Ka-Ching!
                        </div>
                    </motion.div>
                 )}
               </div>

               <div className="w-full px-4">
                  <input 
                    type="range" min="-180" max="180" value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    disabled={showRotationSuccess}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>-180°</span>
                      <span>0°</span>
                      <span>180°</span>
                  </div>
               </div>
             </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
