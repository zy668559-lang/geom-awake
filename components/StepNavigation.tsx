import React, { useState } from 'react';
import { ArrowLeft, Menu, Check, Lock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RepairPack } from '@/lib/types';

export type TrainStep = 'DEMO' | 'TEMPLATE' | 'EXAMPLE' | 'MICRO' | 'VARIATION' | 'DEEP' | 'RETEST' | 'COMPLETE';

export const STEPS: { id: TrainStep; label: string; short: string }[] = [
    { id: 'DEMO', label: '觉醒演示', short: '演示' },
    { id: 'TEMPLATE', label: '思维导航', short: '模板' },
    { id: 'EXAMPLE', label: '定制例题', short: '例题' },
    { id: 'MICRO', label: '肌肉微练', short: '微练' },
    { id: 'VARIATION', label: '变式训练', short: '变式' },
    { id: 'DEEP', label: '深度进阶', short: '进阶' },
    { id: 'RETEST', label: '即时复检', short: '复检' },
];

interface StepNavigationProps {
    currentStep: TrainStep;
    onStepClick: (step: TrainStep) => void;
    title: string;
    subTitle?: string;
    pack?: RepairPack | null;
    currentSubProgress?: string; // e.g. "2/3"
}

export default function StepNavigation({ 
    currentStep, 
    onStepClick, 
    title, 
    subTitle,
    pack,
    currentSubProgress
}: StepNavigationProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLockedToast, setShowLockedToast] = useState(false);
    
    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
    
    // Calculate display info
    const currentStepInfo = STEPS[currentStepIndex];
    const stepNumber = currentStep === 'COMPLETE' ? 8 : currentStepIndex + 1;
    
    const handleStepClick = (stepId: TrainStep, index: number) => {
        if (currentStep === 'COMPLETE' || index <= currentStepIndex) {
            onStepClick(stepId);
            setIsMenuOpen(false);
        } else {
            // Show toast for locked steps
            setShowLockedToast(true);
            setTimeout(() => setShowLockedToast(false), 2500);
        }
    };

    return (
        <div className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-100 transition-all duration-300">
            {/* Toast Notification */}
            {showLockedToast && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white px-4 py-2 rounded-full shadow-xl text-sm font-bold z-[60] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Lock size={14} />
                    <span>请先完成当前步骤，解锁下一步</span>
                </div>
            )}
            
            {/* 1. Top Header Bar */}
            <div className="flex items-center justify-between px-4 h-14 bg-white relative z-20">
                {/* Left: Back */}
                <button 
                    onClick={() => router.back()} 
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                >
                    <ArrowLeft size={24} />
                </button>

                {/* Center: Title */}
                <div className="flex-1 mx-4 text-center">
                    <h1 className="font-bold text-slate-800 text-base truncate">{title}</h1>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <span>{currentStep === 'COMPLETE' ? '训练完成' : `Step ${stepNumber} of 7`}</span>
                        {currentSubProgress && (
                            <>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-blue-600 font-bold">{currentSubProgress}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Menu */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-2 -mr-2 rounded-full transition-colors active:scale-95 ${isMenuOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* 2. Visual Progress Bar (Stepper) */}
            <div className="px-4 pb-3 pt-1 bg-white overflow-x-auto no-scrollbar relative z-10">
                <div className="flex items-center justify-between min-w-[320px] relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    
                    {STEPS.map((step, index) => {
                        const isCompleted = currentStep === 'COMPLETE' || index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isLocked = currentStep !== 'COMPLETE' && index > currentStepIndex;

                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.id, index)}
                                className={`relative z-10 flex flex-col items-center gap-1 group w-10`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2
                                    ${isCompleted 
                                        ? 'bg-green-500 border-green-500 text-white shadow-sm scale-100' 
                                        : isCurrent 
                                            ? 'bg-white border-blue-600 text-blue-600 shadow-md scale-110' 
                                            : 'bg-white border-slate-200 text-slate-300'
                                    }
                                `}>
                                    {isCompleted ? (
                                        <Check size={14} strokeWidth={3} />
                                    ) : isLocked ? (
                                        <Lock size={12} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium whitespace-nowrap absolute -bottom-5 transition-colors
                                    ${isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-green-600' : 'text-slate-300'}
                                `}>
                                    {step.short}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="h-4"></div> {/* Spacer for text */}
            </div>

            {/* 3. Expanded Directory Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-slate-100 animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto z-50">
                    <div className="p-4 space-y-1">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">完整闭环导航</h3>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                                {Math.round(((currentStepIndex + (currentStep === 'COMPLETE' ? 1 : 0)) / 7) * 100)}% 完成
                            </span>
                        </div>
                        
                        {STEPS.map((step, index) => {
                            const isCompleted = currentStep === 'COMPLETE' || index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const isLocked = currentStep !== 'COMPLETE' && index > currentStepIndex;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => handleStepClick(step.id, index)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all
                                        ${isCurrent ? 'bg-blue-50 border border-blue-200 shadow-sm translate-x-1' : 'hover:bg-slate-50 border border-transparent'}
                                        ${isLocked ? 'opacity-50' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                            ${isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}
                                        `}>
                                            {isCompleted ? <Check size={16} /> : index + 1}
                                        </div>
                                        <div className="text-left">
                                            <span className={`block text-sm font-bold ${isCurrent ? 'text-blue-900' : 'text-slate-700'}`}>
                                                {step.label}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {isCurrent ? '当前正在进行中...' : isCompleted ? '已完成' : '待解锁'}
                                            </span>
                                        </div>
                                    </div>
                                    {isLocked ? <Lock size={16} className="text-slate-300" /> : <ChevronRight size={16} className="text-slate-300" />}
                                </button>
                            );
                        })}
                    </div>
                    {/* Close Area */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
                        <span className="text-xs text-slate-400">收起菜单</span>
                    </div>
                </div>
            )}
        </div>
    );
}
