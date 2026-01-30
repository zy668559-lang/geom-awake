"use client";

import React, { useState } from 'react';
import { Question, StepLog } from '@/lib/types';
import GeometryCanvas from './GeometryCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface InteractiveQuestionProps {
  question: Question;
  onFinish: (logs: StepLog[]) => void;
  ghostMode?: boolean;
}

export default function InteractiveQuestion({ question, onFinish, ghostMode = false }: InteractiveQuestionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const currentStep = question.steps[currentStepIndex];

  const handlePointSelect = (p: { label: string }) => {
    if (currentStep.type !== 'SELECT_TARGET') return;
    
    // Toggle selection
    if (selectedPoints.includes(p.label)) {
      setSelectedPoints(prev => prev.filter(l => l !== p.label));
    } else {
      setSelectedPoints(prev => [...prev, p.label]);
    }
  };

  const submitSelection = () => {
    // Check answer
    // For SELECT_TARGET, usually the answer is one or more points.
    // Logic: All correctActions must be in selectedPoints, and no extra points (unless strictness varies)
    // Simplified: Check if sorted arrays match
    const correctSet = new Set(currentStep.correctActions);
    const selectedSet = new Set(selectedPoints);
    
    // Exact match
    const isCorrect = correctSet.size === selectedSet.size && [...correctSet].every(x => selectedSet.has(x));
    
    // Determine feedback
    let hint = '';
    let diagTag = undefined;

    if (!isCorrect) {
        // Check for specific wrong signals (if single point selected)
        // If multiple points, it's harder to map to a single key in wrongSignals unless we concat
        // For simplicity, check if ANY selected point triggers a wrong signal
        const wrongSelection = selectedPoints.find(p => currentStep.wrongSignals[p]);
        if (wrongSelection) {
            diagTag = currentStep.wrongSignals[wrongSelection];
            hint = currentStep.coachHints[wrongSelection];
        }
        if (!hint) hint = currentStep.coachHints['default'] || "请再仔细观察图中的条件";
    }

    handleResult(selectedPoints.join(','), isCorrect, hint, diagTag);
  };

  const handleOptionClick = (option: string) => {
    const isCorrect = currentStep.correctActions.includes(option);
    
    let hint = '';
    let diagTag = undefined;

    if (!isCorrect) {
        diagTag = currentStep.wrongSignals[option];
        hint = currentStep.coachHints[option] || currentStep.coachHints['default'] || "再想想？";
    }

    handleResult(option, isCorrect, hint, diagTag);
  };

  const handleResult = (action: string, isCorrect: boolean, hint: string, diagTag?: string) => {
    const newLog: StepLog = {
      stepIndex: currentStepIndex,
      questionId: question.id,
      action,
      isCorrect,
      timestamp: Date.now(),
      diagnosisTag: diagTag
    };
    
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    if (isCorrect) {
      setFeedback({ type: 'success', message: '回答正确！' });
      setTimeout(() => {
          setFeedback(null);
          // Next step
          if (currentStepIndex < question.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setSelectedPoints([]);
          } else {
            // Finish question
            onFinish(updatedLogs);
          }
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: hint });
      // Keep selection for retry? Or clear? 
      // Usually keep for them to fix.
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative">
      <div className="flex-1 min-h-[300px] mb-4 relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <GeometryCanvas 
          points={question.svg.points}
          lines={question.svg.lines}
          activePoints={selectedPoints}
          onPointSelect={handlePointSelect}
          ghostMode={ghostMode}
        />
        
        {/* Feedback Overlay */}
        <AnimatePresence>
            {feedback && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute bottom-4 left-4 right-4 p-4 rounded-xl shadow-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {feedback.type === 'success' ? <Check size={24}/> : <X size={24}/>}
                    <span className="font-bold">{feedback.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      
      <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded mb-2">
            Step {currentStepIndex + 1}/{question.steps.length}
          </span>
          <p className="text-slate-800 font-medium text-lg leading-relaxed">
            {currentStep.prompt}
          </p>
        </div>

        {currentStep.type === 'SELECT_TARGET' && (
          <button 
            onClick={submitSelection}
            disabled={selectedPoints.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-blue-200 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            确认选择
          </button>
        )}

        {(currentStep.type === 'CHOOSE_RULE' || currentStep.type === 'CHOOSE_AUX') && (
          <div className="grid grid-cols-1 gap-3">
            {currentStep.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className="w-full py-3 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 font-medium hover:bg-blue-50 hover:border-blue-200 active:scale-95 transition-all text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
