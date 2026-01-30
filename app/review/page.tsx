"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllModels, getQuestionsByModel } from "@/lib/data-loader";
import { Question, StepLog } from "@/lib/types";
import InteractiveQuestion from "@/components/InteractiveQuestion";
import { ArrowLeft, Ghost, Calendar } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"7day" | "15day">("7day");
  const [question, setQuestion] = useState<Question | null>(null);
  
  // For demo, pick a random model to retest
  useEffect(() => {
    // In real app, load from user history "Due for Review"
    const models = getAllModels();
    if (models.length === 0) return;
    
    const randomModel = models[Math.floor(Math.random() * models.length)];
    const questions = getQuestionsByModel(randomModel, 'RETEST');
    
    if (questions.length > 0) {
        setQuestion(questions[0]);
    }
  }, [activeTab]);

  const handleFinish = (logs: StepLog[]) => {
      const isCorrect = logs.every(l => l.isCorrect);
      if (isCorrect) {
          alert("恭喜！幽灵复检通过！记忆已固化。");
          router.push("/");
      } else {
          alert("记忆有些模糊了？建议重新进行专项训练。");
          router.push(`/train?model=${question?.model}`);
      }
  };

  return (
    <div className="h-screen bg-[#F0F4F8] flex flex-col font-sans text-slate-800">
        
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg flex items-center gap-2">
                <Ghost size={20} className="text-purple-600"/>
                记忆复检中心
            </h1>
            <div className="w-10"></div>
        </header>

        {/* Tabs */}
        <div className="flex justify-center p-4 bg-white/50 backdrop-blur-sm">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                <button 
                    onClick={() => setActiveTab("7day")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${activeTab === "7day" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}
                    `}
                >
                    <Calendar size={16}/> 7天复检
                </button>
                <button 
                    onClick={() => setActiveTab("15day")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${activeTab === "15day" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}
                    `}
                >
                    <Calendar size={16}/> 15天复检
                </button>
            </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col items-center justify-center">
            {question ? (
                <div className="w-full h-full max-w-5xl">
                    <div className="mb-4 flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg w-fit mx-auto">
                        <Ghost size={16}/>
                        <span className="font-bold text-sm">幽灵模式：线条隐形 90%</span>
                    </div>
                    <InteractiveQuestion 
                        key={question.id}
                        question={question}
                        onFinish={handleFinish}
                        ghostMode={true}
                    />
                </div>
            ) : (
                <div className="text-slate-400">暂无待复检题目 (请先完善 data/models.json)</div>
            )}
        </main>
    </div>
  );
}
