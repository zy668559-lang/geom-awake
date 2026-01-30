"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getRepairPackById } from "@/lib/data-loader";
import { RepairPack } from "@/lib/types";
import CoachChat from "@/components/CoachChat";
import ModelPlayer from "@/components/ModelPlayer";
import StepNavigation, { STEPS, TrainStep } from "@/components/StepNavigation";
import SimpleQuestion from "@/components/SimpleQuestion";
import { mockProvider } from "@/src/providers/MockProvider";
import { Question } from "@/src/providers/IQuestionProvider";
import { generateReport, ReportSummary } from "@/src/services/report";
import { Zap, CheckCircle, Brain, BookOpen, ShieldCheck, Clock, Calendar, BarChart3, AlertCircle } from "lucide-react";

function TrainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Params
  const modelId = searchParams.get("model") || "g7_condition_marking";
  const packIdParam = searchParams.get("packId");
  const userId = "user_001"; // Mock user
  const grade = 8; // Mock grade

  // Data State
  const [pack, setPack] = useState<RepairPack | null>(null);
  const [questions, setQuestions] = useState<{
    example: Question[];
    micro: Question[];
    variation: Question[];
    deep: Question[];
    retest1: Question[];
    retest2: Question[];
  }>({
    example: [],
    micro: [],
    variation: [],
    deep: [],
    retest1: [],
    retest2: []
  });

  // Progress State
  const [currentStep, setCurrentStep] = useState<TrainStep>('DEMO');
  const [subIndex, setSubIndex] = useState(0);
  const [retestPhase, setRetestPhase] = useState<1 | 2>(1); // 1: Immediate, 2: Next Day
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportSummary | null>(null);

  // Load Static Pack & Dynamic Questions
  useEffect(() => {
    async function loadData() {
        try {
            // 1. Load Static Pack (for Demo & Template)
            let loadedPack: RepairPack | undefined;
            if (packIdParam) {
                loadedPack = getRepairPackById(packIdParam);
            } else {
                // Map modelId to pack
                loadedPack = getRepairPackById('RP_MIDPOINT_DOUBLE'); // Default fallback
            }

            if (!loadedPack) throw new Error("Pack not found");
            setPack(loadedPack);

            // 2. Load Dynamic Questions via MockProvider
            // Rules:
            // - Example: topWeakTag (5)
            // - Micro: "基础动作" (5) -> User said 5~15, let's do 5
            // - Variation: topWeakTag (5)
            // - Deep: topWeakTag + "两步题" (2)
            // - Retest1: topWeakTag (3)
            // - Retest2: topWeakTag (3)
            
            // Assume topWeakTag is the pack's signal tag or just modelId
            const topWeakTag = modelId; 

            const [ex, mi, va, de, r1, r2] = await Promise.all([
                mockProvider.getQuestions({ grade, tags: [topWeakTag], n: 5 }),
                mockProvider.getQuestions({ grade, tags: ["基础动作"], n: 5 }),
                mockProvider.getQuestions({ grade, tags: [topWeakTag], n: 5 }),
                mockProvider.getQuestions({ grade, tags: ["两步题"], n: 2 }),
                mockProvider.getQuestions({ grade, tags: [topWeakTag], n: 3 }),
                mockProvider.getQuestions({ grade, tags: [topWeakTag], n: 3 }),
            ]);

            setQuestions({
                example: ex,
                micro: mi,
                variation: va,
                deep: de,
                retest1: r1,
                retest2: r2
            });

        } catch (err) {
            console.error(err);
            setError("加载训练数据失败");
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [modelId, packIdParam]);

  // Navigation Logic
  const handleNextStep = () => {
      setSubIndex(0);
      switch (currentStep) {
          case 'DEMO': setCurrentStep('TEMPLATE'); break;
          case 'TEMPLATE': setCurrentStep('EXAMPLE'); break;
          case 'EXAMPLE': setCurrentStep('MICRO'); break;
          case 'MICRO': setCurrentStep('VARIATION'); break;
          case 'VARIATION': setCurrentStep('DEEP'); break;
          case 'DEEP': setCurrentStep('RETEST'); break;
          case 'RETEST': 
            // Handle Retest Phases
            if (retestPhase === 1) {
                // Finished Retest 1, show "Wait for tomorrow" screen?
                // Actually, we stay in RETEST step but show "Transition UI"
                // Handled in render.
            } else {
                setCurrentStep('COMPLETE');
                // Generate Report
                mockProvider.getAttempts({ userId }).then(attempts => {
                    setReport(generateReport(attempts));
                });
            }
            break;
      }
      window.scrollTo(0, 0);
  };

  const handleStepClick = (stepId: TrainStep) => {
      const currentIndex = STEPS.findIndex(s => s.id === currentStep);
      const targetIndex = STEPS.findIndex(s => s.id === stepId);
      
      if (targetIndex <= currentIndex) {
          setCurrentStep(stepId);
          setSubIndex(0);
          window.scrollTo(0, 0);
      }
  };

  const handleQuestionFinish = async (isCorrect: boolean, currentSet: Question[]) => {
      // Submit Attempt
      const currentQ = currentSet[subIndex];
      await mockProvider.submitAttempt({
          userId,
          questionId: currentQ.id,
          stage: currentStep + (currentStep === 'RETEST' && retestPhase === 2 ? '_2' : ''),
          isCorrect,
          timeSpent: 30, // Mock time
          tags: currentQ.tags
      });

      // Advance
      if (subIndex < currentSet.length - 1) {
          setSubIndex(prev => prev + 1);
      } else {
          if (currentStep === 'RETEST' && retestPhase === 1) {
             // Just force update to show transition UI
             setSubIndex(prev => prev + 1); // Overflow index triggers transition UI
          } else {
             handleNextStep();
          }
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">加载训练中...</div>;
  if (error || !pack) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  // Render Helpers
  const renderQuestionSet = (set: Question[], typeName: string, icon: React.ReactNode) => {
      if (!set || set.length === 0) return <div className="p-8 text-center text-slate-400">暂无题目</div>;
      
      // If finished all in set (only for Retest 1 transition case)
      if (subIndex >= set.length) return null;

      return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-slate-800">{typeName} ({subIndex + 1}/{set.length})</h3>
                      <p className="text-xs text-slate-500">保持专注，逐个击破</p>
                  </div>
                  {icon}
              </div>
              <SimpleQuestion 
                  question={set[subIndex]}
                  onFinish={(isCorrect) => handleQuestionFinish(isCorrect, set)}
              />
          </div>
      );
  };

  const getSubProgress = () => {
      switch (currentStep) {
          case 'DEMO': return '1/1';
          case 'TEMPLATE': return '1/1';
          case 'EXAMPLE': return `${subIndex + 1}/${questions.example.length}`;
          case 'MICRO': return `${subIndex + 1}/${questions.micro.length}`;
          case 'VARIATION': return `${subIndex + 1}/${questions.variation.length}`;
          case 'DEEP': return `${subIndex + 1}/${questions.deep.length}`;
          case 'RETEST': 
             if (retestPhase === 1) return `${Math.min(subIndex + 1, questions.retest1.length)}/${questions.retest1.length}`;
             return `${subIndex + 1}/${questions.retest2.length}`;
          case 'COMPLETE': return 'OK';
          default: return '';
      }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans pb-24">
      
      <StepNavigation 
          currentStep={currentStep} 
          onStepClick={handleStepClick} 
          title={`专项修复：${pack.tagCombination.topic}`}
          subTitle={currentStep === 'COMPLETE' ? '修复完成' : undefined}
          pack={pack}
          currentSubProgress={getSubProgress()}
      />

      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-6">

          {/* Step 1: Demo */}
          {currentStep === 'DEMO' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ModelPlayer modelId={modelId} onFinish={handleNextStep} />
              </div>
          )}

          {/* Step 2: Template */}
          {currentStep === 'TEMPLATE' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-indigo-50">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                      <Brain size={24} />
                      <span className="font-bold text-lg">思维导航仪</span>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 text-sm">
                      记住这个模板，遇到这类题直接套用！
                  </div>
                  <div className="space-y-4">
                      {pack.thinkingTemplate.map((step, i) => (
                          <div key={i} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                  {i + 1}
                              </div>
                              <p className="text-slate-700 text-lg leading-relaxed pt-0.5">{step}</p>
                          </div>
                      ))}
                  </div>
                  <button onClick={handleNextStep} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                      记住了，去实战
                  </button>
              </div>
          )}

          {/* Step 3: Example */}
          {currentStep === 'EXAMPLE' && renderQuestionSet(questions.example, "定制例题", <BookOpen className="text-blue-500" />)}

          {/* Step 4: Micro */}
          {currentStep === 'MICRO' && renderQuestionSet(questions.micro, "肌肉微练", <Zap className="text-green-500" />)}

          {/* Step 5: Variation */}
          {currentStep === 'VARIATION' && renderQuestionSet(questions.variation, "变式训练", <Target className="text-purple-500" />)}

          {/* Step 6: Deep */}
          {currentStep === 'DEEP' && renderQuestionSet(questions.deep, "深度进阶", <Brain className="text-red-500" />)}

          {/* Step 7: Retest (Phase 1 & 2) */}
          {currentStep === 'RETEST' && (
             <>
                {retestPhase === 1 && subIndex < questions.retest1.length && (
                    renderQuestionSet(questions.retest1, "即时复检", <ShieldCheck className="text-orange-500" />)
                )}

                {retestPhase === 1 && subIndex >= questions.retest1.length && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                            <Clock size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">即时复检通过！</h2>
                        <p className="text-slate-500">按艾宾浩斯遗忘曲线，你需要进行隔天复检以确保存证。</p>
                        
                        <div className="py-4">
                            <div className="text-xs text-slate-400 mb-2">--- 开发者模式 ---</div>
                            <button 
                                onClick={() => {
                                    setRetestPhase(2);
                                    setSubIndex(0);
                                }}
                                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                            >
                                <Calendar size={18} />
                                模拟“隔天复检”
                            </button>
                        </div>
                    </div>
                )}

                {retestPhase === 2 && (
                    renderQuestionSet(questions.retest2, "隔天复检 (T+1)", <Calendar className="text-indigo-500" />)
                )}
             </>
          )}

          {/* Complete / Report */}
          {currentStep === 'COMPLETE' && report && (
               <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                   {/* Header */}
                   <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-4">
                       <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                           <CheckCircle size={40} />
                       </div>
                       <div>
                           <h2 className="text-2xl font-black text-slate-800">闭环验收报告</h2>
                           <p className="text-slate-500 text-sm">本次训练数据已存证</p>
                       </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
                           <div className="text-xs text-slate-400 mb-1">最弱项</div>
                           <div className="font-bold text-slate-800 truncate">{report.topWeakTag}</div>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
                           <div className="text-xs text-slate-400 mb-1">总用时</div>
                           <div className="font-bold text-slate-800">{report.totalTime}</div>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
                           <div className="text-xs text-slate-400 mb-1">错题数</div>
                           <div className="font-bold text-red-500">{report.retryCount}</div>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
                           <div className="text-xs text-slate-400 mb-1">微练正确率</div>
                           <div className="font-bold text-green-600">{report.stageAccuracy['MICRO'] || '-'}</div>
                       </div>
                   </div>

                   {/* Prescription */}
                   <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                       <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                           <AlertCircle size={18} />
                           <span>AI 处方建议</span>
                       </div>
                       <p className="text-indigo-900 leading-relaxed text-sm">
                           {report.prescription}
                       </p>
                   </div>

                   {/* Action */}
                   <button onClick={() => router.push('/')} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-slate-900 transition-all">
                       完成训练，返回首页
                   </button>
               </div>
          )}

      </div>

      {currentStep !== 'COMPLETE' && pack && (
          <div className="fixed bottom-6 right-6 z-50">
            <CoachChat 
                grade={grade}
                diagnosisTags={[pack.tagCombination.topic, pack.tagCombination.signal]}
                currentStep={currentStep}
                modelId={modelId}
            />
          </div>
      )}
    </div>
  );
}

export default function TrainPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TrainContent />
        </Suspense>
    );
}
