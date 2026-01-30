
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';

interface AwakeningPosterProps {
  modelName: string;
  onClose: () => void;
}

export default function AwakeningPoster({ modelName, onClose }: AwakeningPosterProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-1 max-w-sm w-full shadow-2xl overflow-hidden relative"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-8 text-center border border-white/20 h-full flex flex-col items-center relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1" fill="none" />
              <path d="M50 10 L50 90 M10 50 L90 50" stroke="white" strokeWidth="1" />
            </svg>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.6)] mb-4">
              <span className="text-4xl">⚡</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">几何觉醒</h2>
            <p className="text-blue-200 text-sm">GEOMETRY AWAKENING</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 rounded-xl p-6 w-full mb-8 shadow-lg transform rotate-1"
          >
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">专项修复报告</p>
            <h3 className="text-xl font-black text-slate-800 mb-4">{modelName} 问题已修复</h3>
            
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">模型动作分</div>
                    <div className="text-2xl font-black text-green-500">100</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">题库迁移分</div>
                    <div className="text-2xl font-black text-blue-500">100</div>
                </div>
            </div>

            <p className="text-slate-600 text-sm font-medium">
                你刚刚给大脑装上了“{modelName}”的自动导航系统！
                <br/>下周记得回来复检，别让它生锈。
            </p>
          </motion.div>

          <div className="mt-auto w-full space-y-4">
            <div className="flex gap-2 justify-center">
              <div className="w-24 h-24 bg-white rounded-lg p-2">
                {/* QR Code Placeholder */}
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 text-center leading-tight">
                  加老师微信<br/>领高阶题库
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-xl font-bold transition-colors"
            >
              继续挑战
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
