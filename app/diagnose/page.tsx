"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockProvider } from '@/src/providers/MockProvider';
import { Question } from '@/src/providers/IQuestionProvider';
import { StepLog } from '@/lib/types';
import SimpleQuestion from '@/components/SimpleQuestion';
import { Loader2, ArrowLeft } from 'lucide-react';

function DiagnoseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const grade = Number(searchParams.get('grade') || 7);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allLogs, setAllLogs] = useState<StepLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
        // Load 3 random questions for diagnosis
        const qs = await mockProvider.getQuestions({ grade, n: 3 });
        setQuestions(qs);
    }
    loadQuestions();
  }, [grade]);

  const handleQuestionFinish = async (isCorrect: boolean) => {
    const currentQ = questions[currentIndex];
    
    // Create a simplified log entry
    // We assume the first tag is the primary "diagnosis tag" for MVP
    const diagnosisTag = currentQ.tags && currentQ.tags.length > 0 ? currentQ.tags[0] : "综合";

    const newLog: StepLog = {
        stepIndex: 0,
        questionId: currentQ.id,
        action: isCorrect ? "CORRECT" : "WRONG",
        isCorrect,
        timestamp: Date.now(),
        diagnosisTag: !isCorrect ? diagnosisTag : undefined
    };

    const newLogs = [...allLogs, newLog];
    setAllLogs(newLogs);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished all questions
      await submitDiagnosis(newLogs);
    }
  };

  const submitDiagnosis = async (logs: StepLog[]) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, grade })
      });
      
      if (!res.ok) throw new Error("Diagnosis failed");
      
      const data = await res.json();
      if (data.sessionId) {
          router.push(`/report/${data.sessionId}`);
      } else {
          console.error("No session ID returned");
      }

    } catch (e) {
      console.error(e);
      alert("诊断提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
        <div className="h-screen flex items-center justify-center text-slate-500">
            加载诊断题目中... (Grade {grade})
        </div>
    );
  }

  if (isSubmitting) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-[#F0F4F8]">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">正在生成诊断报告...</p>
          </div>
      )
  }

  return (
    <div className="h-screen bg-[#F0F4F8] flex flex-col font-sans text-slate-800 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-2">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={20} className="text-slate-600"/>
                </button>
                <div className="text-lg font-bold text-slate-700">几何体检 (Grade {grade})</div>
            </div>
            <div className="flex gap-2">
                {questions.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-3 h-3 rounded-full ${idx <= currentIndex ? 'bg-blue-600' : 'bg-slate-200'}`}
                    />
                ))}
            </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-3xl mx-auto w-full">
            <SimpleQuestion 
                key={currentIndex}
                question={questions[currentIndex]}
                onFinish={handleQuestionFinish}
            />
        </main>
    </div>
  );
}

export default function DiagnosePage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>}>
            <DiagnoseContent />
        </Suspense>
    )
}
