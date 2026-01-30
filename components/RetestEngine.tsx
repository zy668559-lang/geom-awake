
"use client";

import React, { useState } from "react";
import { GeometryModel, Point } from "@/lib/geometry-models";
import { Ghost, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RetestEngineProps {
  model: GeometryModel;
  onPass: () => void;
  onFail: () => void;
}

export default function RetestEngine({ model, onPass, onFail }: RetestEngineProps) {
  // Ghost Mode: Lines are barely visible (10% opacity)
  // User must click vertices in order to "rebuild" the critical triangle or line
  
  // Simplified logic for MVP:
  // User must click the 3 points of the primary triangle (e.g., A, B, C)
  
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [status, setStatus] = useState<"playing" | "success" | "fail">("playing");

  const handlePointClick = (p: Point) => {
    if (status !== "playing") return;

    const newSelected = [...selectedPoints, p.label];
    setSelectedPoints(newSelected);

    // Simple validation: Just checking if they selected 3 points
    // In a real app, check if these 3 form the target triangle
    if (newSelected.length === 3) {
       validate(newSelected);
    }
  };

  const validate = (points: string[]) => {
    // Mock validation logic
    // We'll say if they picked 3 points, they "remembered" the shape
    // In production, match against model.target geometry
    const isCorrect = true; 

    if (isCorrect) {
        setStatus("success");
        setTimeout(onPass, 1500);
    } else {
        setStatus("fail");
        setTimeout(onFail, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-4">
      <div className="text-center text-white mb-8">
        <h2 className="text-3xl font-black flex items-center justify-center gap-2 mb-2">
            <Ghost className="text-purple-400"/> 幽灵复检
        </h2>
        <p className="opacity-70">凭记忆重连核心三角形，证明你真的“看见”了</p>
      </div>

      <div className="relative w-[340px] h-[340px] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Ghost Lines - 10% Opacity */}
            {model.lines.map((l, i) => {
                const p1 = model.points.find(p => p.label === l.start);
                const p2 = model.points.find(p => p.label === l.end);
                if (!p1 || !p2) return null;
                return (
                    <line 
                        key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                        stroke="white" strokeWidth="1" opacity="0.1" 
                    />
                );
            })}

            {/* User drawn lines (connecting selected points) */}
            {selectedPoints.length > 1 && selectedPoints.map((pLabel, i) => {
                if (i === 0) return null;
                const prevLabel = selectedPoints[i-1];
                const p1 = model.points.find(p => p.label === prevLabel);
                const p2 = model.points.find(p => p.label === pLabel);
                if (!p1 || !p2) return null;
                return (
                    <line 
                        key={`user-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                        stroke="#a855f7" strokeWidth="3" strokeLinecap="round"
                    />
                );
            })}
             {/* Close the loop if 3 points */}
             {selectedPoints.length === 3 && (() => {
                const p1 = model.points.find(p => p.label === selectedPoints[2]);
                const p2 = model.points.find(p => p.label === selectedPoints[0]);
                if (!p1 || !p2) return null;
                return (
                     <line 
                        key="close-loop" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                        stroke="#a855f7" strokeWidth="3" strokeLinecap="round"
                    />
                )
             })()}

            {/* Vertices */}
            {model.points.map((p, i) => (
                <g key={i} onClick={() => handlePointClick(p)} className="cursor-pointer">
                    <circle 
                        cx={p.x} cy={p.y} r="12" 
                        fill={selectedPoints.includes(p.label) ? "#a855f7" : "transparent"} 
                        stroke={selectedPoints.includes(p.label) ? "white" : "rgba(255,255,255,0.2)"}
                        strokeWidth="2"
                    />
                    <text 
                        x={p.x} y={p.y} dy="4" textAnchor="middle" 
                        fill="white" fontSize="10" pointerEvents="none"
                        opacity={selectedPoints.includes(p.label) ? 1 : 0.3}
                    >
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>

        {/* Status Overlay */}
        <AnimatePresence>
            {status === "success" && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-green-500/90 flex items-center justify-center text-white font-black text-2xl"
                >
                    <CheckCircle size={48} className="mb-2" /> 复检通过！
                </motion.div>
            )}
             {status === "fail" && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-red-500/90 flex items-center justify-center text-white font-black text-2xl"
                >
                   <X size={48} className="mb-2" /> 还需要练习
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-white/50 text-sm">
        点击3个顶点，重构核心三角形
      </div>
    </div>
  );
}

import { CheckCircle } from "lucide-react";
