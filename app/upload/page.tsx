"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowRight, X, Loader2 } from 'lucide-react';

// 极简上传页 - 只有：拍照/预览/确认
export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleClear = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleStartDiagnosis = async () => {
        if (!previewUrl) return;

        setIsAnalyzing(true);

        // 模拟 API 调用延迟，后续接真实 DeepSeek
        // 这里暂时直接跳转到模拟报告，或者调用 /api/analyze
        try {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 假设分析成功，跳转到报告
            // 这里 ID 暂时写死或随机，后续由 API 返回
            const mockSessionId = "demo-" + Math.random().toString(36).substr(2, 6);
            router.push(`/report/${mockSessionId}`);
        } catch (e) {
            console.error(e);
            setIsAnalyzing(false);
            alert("诊断服务开小差了，请重试");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col p-6">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <ArrowRight className="rotate-180 text-slate-600" size={24} />
                </button>
                <span className="font-bold text-slate-800">上传错题</span>
                <div className="w-10" /> {/* 占位 */}
            </div>

            {/* 核心内容区 */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">

                {!previewUrl ? (
                    /* 1. 上传态 */
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[3/4] bg-white rounded-[32px] border-2 border-dashed border-slate-200 
                                   flex flex-col items-center justify-center gap-6 cursor-pointer
                                   hover:border-[#667EEA] hover:bg-blue-50/30 transition-all group"
                    >
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="text-slate-400 group-hover:text-[#667EEA]" size={40} />
                        </div>
                        <p className="text-slate-400 font-medium">点击拍照 / 上传图片</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    /* 2. 预览态 */
                    <div className="relative w-full aspect-[3/4] bg-black rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />

                        {/* 移除按钮 */}
                        <button
                            onClick={handleClear}
                            disabled={isAnalyzing}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* 遮罩层 (分析中) */}
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                                <Loader2 className="animate-spin mb-4" size={48} />
                                <p className="font-bold text-lg animate-pulse">陈老师正在通过 AI 看诊...</p>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* 底部操作栏 */}
            <div className="mt-8 max-w-lg mx-auto w-full">
                <button
                    onClick={handleStartDiagnosis}
                    disabled={!previewUrl || isAnalyzing}
                    className={`w-full py-4 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all
                        ${!previewUrl
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white hover:scale-[1.02] active:scale-[0.98]'
                        }
                    `}
                >
                    {isAnalyzing ? '诊断中...' : '开始诊断'}
                    {!isAnalyzing && <ArrowRight size={24} />}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                    AI 仅用于辅助教学，结果仅供参考
                </p>
            </div>
        </div>
    );
}