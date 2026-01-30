"use client";

import React, { useState } from 'react';
import { Question } from '@/src/providers/IQuestionProvider';
import { Eye, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface SimpleQuestionProps {
  question: Question;
  onFinish: (isCorrect: boolean) => void;
}

export default function SimpleQuestion({ question, onFinish }: SimpleQuestionProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
            {question.tags[0]}
          </span>
          <h3 className="font-bold text-lg text-slate-800">{question.title}</h3>
        </div>
        <div className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
            <span className="font-bold text-slate-400 mr-2">已知</span>
            {question.stem}
        </div>
        {question.figure && (
             <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                 {/* Placeholder for figure */}
                 [图形占位: {question.figure}]
             </div>
        )}
        <div className="text-slate-800 font-medium text-lg pt-2">
            <span className="font-bold text-blue-500 mr-2">求</span>
            {question.question}
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        {!showAnswer ? (
          <button 
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
          >
            <Eye size={18} />
            查看答案
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="text-green-800 font-bold mr-2">答案：</span>
                <span className="text-green-900">{question.answer || '略'}</span>
             </div>
             
             <div className="flex gap-3">
                 <button 
                    onClick={() => onFinish(false)}
                    className="flex-1 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
                 >
                    <XCircle size={18} />
                    做错了
                 </button>
                 <button 
                    onClick={() => onFinish(true)}
                    className="flex-1 py-3 bg-green-50 text-green-600 border border-green-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100"
                 >
                    <CheckCircle size={18} />
                    做对了
                 </button>
             </div>

             <div className="text-center">
                <button 
                    onClick={() => setShowSolution(!showSolution)}
                    className="text-slate-400 text-sm flex items-center justify-center gap-1 mx-auto hover:text-blue-500"
                >
                    <Lightbulb size={14} />
                    {showSolution ? '收起解析' : '查看解析'}
                </button>
                {showSolution && (
                    <div className="mt-3 text-left text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
                        {question.solution_outline}
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
