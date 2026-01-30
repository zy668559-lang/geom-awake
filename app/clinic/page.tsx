"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Camera, ArrowRight, Upload, X, Check, MessageSquare, Plus, Trash2, AlertCircle, Menu } from 'lucide-react';
import CoachChat from '@/components/CoachChat';

interface UploadItem {
    id: string;
    file: File | null;
    previewUrl: string;
    questionNo: string; // 题号
    stuckPoint: string; // 卡点
    isCheckup: boolean; // 是否为体检题
    thinkingMode: 'PAPER' | 'ONLINE' | 'SIMPLE'; // 思考模式
    thinkingContent: string; // 思考内容
}

const STUCK_POINTS = [
    "条件看不出", "辅助线不会画", "模型选错了", "性质记不清", "计算算不对", "步骤写不出"
];

function ClinicContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const grade = searchParams.get('grade') || '7';
    
    const [step, setStep] = useState<'upload' | 'analyze' | 'confirm'>('upload');
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    
    const createNewItem = (file: File, previewUrl: string): UploadItem => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        questionNo: '',
        stuckPoint: '',
        isCheckup: false,
        thinkingMode: 'SIMPLE',
        thinkingContent: ''
    });

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (uploads.length >= 10) {
            alert("最多上传10张图片");
            return;
        }

        const files = e.target.files;
        if (files && files.length > 0) {
            const newItems: UploadItem[] = [];
            Array.from(files).forEach(file => {
                if (uploads.length + newItems.length >= 10) return;
                const url = URL.createObjectURL(file);
                newItems.push(createNewItem(file, url));
            });
            setUploads(prev => [...prev, ...newItems]);
        }
        // Reset input
        e.target.value = '';
    };

    const updateItem = (id: string, field: keyof UploadItem, value: any) => {
        setUploads(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id: string) => {
        setUploads(prev => prev.filter(item => item.id !== id));
    };

    const handleCheckupToggle = (id: string, currentVal: boolean) => {
        const checkupCount = uploads.filter(u => u.isCheckup).length;
        if (!currentVal && checkupCount >= 5) {
            alert("最多标记5道体检题");
            return;
        }
        updateItem(id, 'isCheckup', !currentVal);
    };

    const handleAnalyze = async () => {
        if (uploads.length === 0) {
            alert("请至少上传一张图片");
            return;
        }

        // Validate
        for (const item of uploads) {
            if (!item.questionNo || !item.stuckPoint) {
                alert("请完善所有题目的【题号】和【卡点】信息");
                return;
            }
        }

        setIsAnalyzing(true);
        setStep('analyze');

        try {
            // Mock API call for multi-upload
            // In real app, use FormData to send files
            const res = await fetch('/api/clinic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade: parseInt(grade),
                    uploads: uploads.map(u => ({
                        questionNo: u.questionNo,
                        stuckPoint: u.stuckPoint,
                        thinkingMode: u.thinkingMode,
                        thinkingContent: u.thinkingContent,
                        isCheckup: u.isCheckup,
                        // image: base64... (omitted for MVP speed, using mock)
                    }))
                })
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            router.push(`/report/${data.sessionId}`);
        } catch (error) {
            console.error(error);
            alert("诊断服务繁忙，请稍后再试");
            setStep('upload');
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] p-4 flex flex-col max-w-md mx-auto relative pb-24">
             {/* Header */}
             <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#F0F4F8] z-10 py-2">
                 <div className="flex items-center gap-4">
                     <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm">
                         <ArrowRight className="rotate-180" size={20} />
                     </button>
                     <div>
                         <h1 className="text-xl font-bold text-slate-800">{grade}年级错题诊断</h1>
                         <p className="text-xs text-slate-500">建议上传常错5题，精准定位病灶</p>
                     </div>
                 </div>
                 <button className="p-2 bg-white rounded-full shadow-sm">
                     <Menu size={20} className="text-slate-700" />
                 </button>
             </div>

            <div className="flex-1 space-y-6">
                {/* Step 1: Upload List */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        {/* Upload Button Area */}
                        {uploads.length < 10 && (
                            <label className="block w-full py-6 border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors text-center">
                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleUpload} />
                                <div className="flex flex-col items-center gap-2 text-blue-600 font-bold">
                                    <Camera size={32} />
                                    <span>{uploads.length === 0 ? '添加错题照片' : '继续添加 (最多10张)'}</span>
                                </div>
                            </label>
                        )}

                        {/* List of Items */}
                        <div className="space-y-4">
                            {uploads.map((item, index) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 relative group">
                                            <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="题号/位置 (必填)"
                                                    value={item.questionNo}
                                                    onChange={(e) => updateItem(item.id, 'questionNo', e.target.value)}
                                                    className="w-full p-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <select 
                                                value={item.stuckPoint}
                                                onChange={(e) => updateItem(item.id, 'stuckPoint', e.target.value)}
                                                className={`w-full p-2 rounded-lg text-sm border outline-none appearance-none ${!item.stuckPoint ? 'text-slate-400 border-red-200 bg-red-50' : 'text-slate-800 border-slate-200 bg-slate-50'}`}
                                            >
                                                <option value="">选择卡点 (必选)</option>
                                                {STUCK_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Thinking Mode */}
                                    <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                                        <div className="flex gap-2 text-xs overflow-x-auto pb-1">
                                            {[
                                                { id: 'PAPER', label: 'A. 卷面已写' },
                                                { id: 'ONLINE', label: 'B. 在此补写' },
                                                { id: 'SIMPLE', label: 'C. 仅标卡点' }
                                            ].map(mode => (
                                                <button 
                                                    key={mode.id}
                                                    onClick={() => updateItem(item.id, 'thinkingMode', mode.id)}
                                                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${item.thinkingMode === mode.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                                >
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>

                                        {item.thinkingMode === 'ONLINE' && (
                                            <textarea 
                                                placeholder="请按模板补写：1.已知... 2.求证... 3.卡在..."
                                                value={item.thinkingContent}
                                                onChange={(e) => updateItem(item.id, 'thinkingContent', e.target.value)}
                                                className="w-full h-20 p-2 text-sm bg-white rounded-lg border border-slate-200 resize-none outline-none"
                                            />
                                        )}
                                        {item.thinkingMode === 'SIMPLE' && (
                                            <input 
                                                type="text"
                                                placeholder="具体卡在哪一步？(选填)"
                                                value={item.thinkingContent}
                                                onChange={(e) => updateItem(item.id, 'thinkingContent', e.target.value)}
                                                className="w-full p-2 text-sm bg-white rounded-lg border border-slate-200 outline-none"
                                            />
                                        )}
                                    </div>

                                    {/* Checkup Toggle */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={item.isCheckup}
                                                onChange={() => handleCheckupToggle(item.id, item.isCheckup)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            ⭐ 标记为体检题 ({uploads.filter(u => u.isCheckup).length}/5)
                                        </label>
                                        <span className="text-xs text-slate-400">Index: {index + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-100 z-50">
                            <div className="max-w-md mx-auto space-y-3">
                                {/* Compliance Checkbox */}
                                <div className="flex items-start gap-2 px-1">
                                    <input 
                                        type="checkbox" 
                                        id="agreement" 
                                        checked={isAgreed} 
                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                        className="mt-1 w-3 h-3 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="agreement" className="text-[10px] text-slate-400 leading-tight">
                                        我是家长，已阅读并同意<span className="text-blue-600">协议</span>。确认内容脱敏。
                                    </label>
                                </div>

                                <button 
                                    onClick={handleAnalyze}
                                    disabled={uploads.length === 0 || !isAgreed}
                                    className={`w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-white transition-all
                                        ${(uploads.length === 0 || !isAgreed) ? 'bg-slate-300 shadow-none' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}
                                    `}
                                >
                                    开始诊断 ({uploads.length}题) <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Analyzing */}
                {step === 'analyze' && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                         <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-xs">AI</div>
                         </div>
                         <div className="space-y-2">
                            <p className="font-bold text-slate-800 text-lg animate-pulse">
                                DeepSeek 正在会诊...
                            </p>
                            <p className="text-slate-500 text-sm">
                                已受理 {uploads.length} 道错题<br/>
                                正在分析高频病灶...
                            </p>
                         </div>
                    </div>
                )}
            </div>
            
            {step === 'upload' && <CoachChat grade={parseInt(grade)} />}
        </div>
    );
}

export default function ClinicPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">加载中...</div>}>
            <ClinicContent />
        </Suspense>
    );
}