"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, PlayCircle, RotateCcw, ImageOff, CheckCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepData {
    svg: string;
    caption: string;
    tip: string;
}

interface CheckData {
    question: string;
    options: string[];
    answer: string;
}

interface ModelData {
    modelId?: string; // Support modelId from JSON
    id?: string;      // Support legacy id
    title: string;
    goal?: string;    // Make goal optional
    steps: StepData[];
    check?: CheckData;
}

interface ModelPlayerProps {
    modelId: string;
    onFinish?: () => void;
}

const ModelPlayer: React.FC<ModelPlayerProps> = ({ modelId, onFinish }) => {
    const [data, setData] = useState<ModelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);
    const [showCheck, setShowCheck] = useState(false);
    const [checkSelected, setCheckSelected] = useState<string | null>(null);
    const [checkResult, setCheckResult] = useState<'correct' | 'wrong' | null>(null);

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/models/${modelId}/steps.json`);
                if (!res.ok) throw new Error("Failed to load model steps");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                setError("无法加载演示数据");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [modelId]);

    // Reset image error on step change
    useEffect(() => {
        setImgError(false);
    }, [currentStep, modelId]);

    const handleNext = () => {
        if (!data) return;

        if (currentStep < data.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Check if we need to show self-check
            if (data.check && !showCheck) {
                setShowCheck(true);
            } else {
                onFinish?.();
            }
        }
    };

    const handlePrev = () => {
        if (showCheck) {
            setShowCheck(false);
        } else if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleCheckSubmit = (option: string) => {
        if (!data?.check) return;
        setCheckSelected(option);
        if (option === data.check.answer) {
            setCheckResult('correct');
            setTimeout(() => {
                onFinish?.();
            }, 1500);
        } else {
            setCheckResult('wrong');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">正在加载演示...</div>;
    if (error || !data) return <div className="p-8 text-center text-red-400">加载失败: {error}</div>;

    const step = data.steps[currentStep];
    const isLastStep = currentStep === data.steps.length - 1;

    // 4-Part Layout

    return (
        <div className="space-y-6">

            {/* 1) Goal Header */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <h3 className="text-blue-900 font-bold text-lg mb-1">{data.title}</h3>
                {data.goal && <p className="text-blue-700 text-sm">🎯 目标：{data.goal}</p>}
            </div>

            {/* 2) Player / Self Check Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[300px]">

                {!showCheck ? (
                    // Player Mode
                    <div className="flex flex-col h-full">
                        {/* SVG Display */}
                        <div className="flex-1 bg-slate-50 flex items-center justify-center p-4 relative min-h-[250px]">
                            {!imgError && step.svg ? (
                                <div
                                    className="interactive-svg-wrapper w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-300"
                                    dangerouslySetInnerHTML={{ __html: step.svg }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                                    <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                                        <ImageOff size={32} />
                                    </div>
                                    <p className="text-sm font-bold">演示图暂缺</p>
                                    <p className="text-xs">{step.caption}</p>
                                </div>
                            )}

                            {/* Progress Dots */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-auto">
                                {data.steps.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentStep(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-blue-600 w-6' : 'bg-slate-300 w-2 hover:bg-slate-400'}`}
                                        aria-label={`Go to step ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mantra Strip (3) */}
                        <div className="p-6 text-center space-y-2 bg-white border-t border-slate-100">
                            <h2 className="text-2xl font-black text-slate-800 tracking-wider">
                                “{step.caption}”
                            </h2>
                            <p className="text-slate-500 text-sm">{step.tip}</p>
                        </div>
                    </div>
                ) : (
                    // 4) Self Check Mode
                    <div className="p-8 flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                            <HelpCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 text-center">
                            {data.check?.question}
                        </h3>
                        <div className="w-full space-y-3">
                            {data.check?.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleCheckSubmit(opt)}
                                    disabled={checkResult === 'correct'}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-left transition-all border-2
                                        ${checkSelected === opt
                                            ? (checkResult === 'correct' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700')
                                            : 'bg-white border-slate-100 hover:border-blue-200 text-slate-600'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{opt}</span>
                                        {checkSelected === opt && checkResult === 'correct' && <CheckCircle size={20} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {checkResult === 'wrong' && (
                            <p className="text-red-500 text-sm font-bold">再想想？回看一遍演示吧。</p>
                        )}
                        {checkResult === 'correct' && (
                            <p className="text-green-600 text-sm font-bold">回答正确！即将进入实战...</p>
                        )}
                    </div>
                )}

                {/* Navigation Controls (Only for Player Mode) */}
                {!showCheck && (
                    <div className="absolute bottom-6 right-6 flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="p-2 rounded-full bg-white/80 backdrop-blur text-slate-600 hover:bg-white disabled:opacity-30 shadow-sm border border-slate-200"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg flex items-center gap-1"
                        >
                            {isLastStep ? (data.check ? '去自检' : '完成') : '下一步'}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {/* Back button for Check Mode */}
                {showCheck && checkResult !== 'correct' && (
                    <div className="absolute top-6 left-6">
                        <button
                            onClick={handlePrev}
                            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-bold"
                        >
                            <ArrowLeft size={16} />
                            重看演示
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ModelPlayer;
