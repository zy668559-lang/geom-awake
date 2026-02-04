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
  const grade = Number(searchParams.get('grade') || 8);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [allLogs, setAllLogs] = useState<StepLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load first question on mount
  useEffect(() => {
    loadNextQuestion([]);
  }, [grade]);

  const loadNextQuestion = async (logs: StepLog[]) => {
    setIsLoading(true);
    try {
      const nextQ = await mockProvider.getNextQuestion({ grade, previousLogs: logs });
      setCurrentQuestion(nextQ);
    } catch (error) {
      console.error("Failed to load question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionFinish = async (isCorrect: boolean) => {
    if (!currentQuestion) return;

    const diagnosisTag = currentQuestion.tags && currentQuestion.tags.length > 0 ? currentQuestion.tags[0] : "综合";

    const newLog: StepLog = {
      stepIndex: 0,
      questionId: currentQuestion.id,
      action: isCorrect ? "CORRECT" : "WRONG",
      isCorrect,
      timestamp: Date.now(),
      diagnosisTag: !isCorrect ? diagnosisTag : undefined
    };

    const newLogs = [...allLogs, newLog];
    setAllLogs(newLogs);

    // Check if we need more questions
    if (newLogs.length < 3) {
      await loadNextQuestion(newLogs);
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
      alert("提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4 mx-auto" />
          <p>AI 正在为你选题...</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">AI 正在找提分秘密...</p>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        无可用题目
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col font-sans text-slate-800 relative overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="text-lg font-bold text-slate-700">几何体检</div>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${idx < allLogs.length ? 'bg-blue-600 scale-110' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-3xl mx-auto w-full">
        <SimpleQuestion
          key={currentQuestion.id}
          question={currentQuestion}
          onFinish={handleQuestionFinish}
        />
      </main>
    </div>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <DiagnoseContent />
    </Suspense>
  )
}

