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
    const [isActive, setIsActive] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('is_activated') === 'true';
        }
        return false;
    });
    const [activationCode, setActivationCode] = useState('');
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = async () => {
        if (!activationCode) return;
        setIsActivating(true);
        try {
            const resp = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: activationCode })
            });
            if (resp.ok) {
                localStorage.setItem('is_activated', 'true');
                setIsActive(true);
            } else {
                const data = await resp.json();
                alert(data.error || "激活失败");
            }
        } catch (e) {
            alert("网络错误，请重试");
        } finally {
            setIsActivating(false);
        }
    };

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
        if (!previewUrl || isAnalyzing) return;

        setIsAnalyzing(true);

        try {
            // 1. 获取图片 Base64
            const response = await fetch(previewUrl);
            const blob = await response.blob();
            const reader = new FileReader();

            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const imageBase64 = await base64Promise;

            // 2. 调用真实 API
            console.log("🚀 [Frontend] Sending analysis request...");
            const apiResp = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 })
            });

            if (!apiResp.ok) {
                const errorData = await apiResp.json();
                throw new Error(errorData.error || "诊断失败");
            }

            const result = await apiResp.json();
            console.log("✅ [Frontend] Analysis success:", result);

            // 3. 跳转到报告页 (带上数据或 ID)
            // 这里我们先跳转，实际项目中可能需要持久化 result 或通过 URL 传参
            const sessionId = "ses-" + Math.random().toString(36).substr(2, 6);
            router.push(`/report/${sessionId}?data=${encodeURIComponent(JSON.stringify(result))}`);
        } catch (e: any) {
            console.error("❌ [Frontend] Diagnosis error:", e);
            alert(e.message || "诊断服务开小差了，请重试");
            setIsAnalyzing(false);
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
                    disabled={!previewUrl || isAnalyzing || !isActive}
                    className={`w-full py-4 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all
                        ${(!previewUrl || !isActive)
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white hover:scale-[1.02] active:scale-[0.98]'
                        }
                    `}
                >
                    {!isActive ? '请先激活服务' : (isAnalyzing ? '诊断中...' : '开始诊断')}
                    {isActive && !isAnalyzing && <ArrowRight size={24} />}
                </button>

                {!isActive && (
                    <div className="mt-6 p-6 bg-white rounded-3xl shadow-lg border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            🔑 激活完整功能
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={activationCode}
                                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                                placeholder="输入激活码 (如: MVP2-TEST-001)"
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#667EEA] transition-colors"
                            />
                            <button
                                onClick={handleActivate}
                                disabled={isActivating || !activationCode}
                                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all"
                            >
                                {isActivating ? '...' : '激活'}
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            激活后可永久解锁当前版本的所有诊断功能
                        </p>
                    </div>
                )}

                <p className="text-center text-xs text-slate-400 mt-4">
                    AI 仅用于辅助教学，结果仅供参考
                </p>
            </div>
        </div>
    );
}