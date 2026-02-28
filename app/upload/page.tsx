"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Loader2, X } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isActive, setIsActive] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("is_activated") === "true";
  });

  const handleActivate = async () => {
    if (!activationCode.trim() || isActivating) return;
    setIsActivating(true);

    try {
      const resp = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode.trim() }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.error || "激活失败，请重试。");
      }

      localStorage.setItem("is_activated", "true");
      setIsActive(true);
    } catch (error: any) {
      window.alert(error?.message || "激活失败，请重试。");
    } finally {
      setIsActivating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextPreview);
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartDiagnosis = async () => {
    if (!selectedFile || isAnalyzing || !isActive) return;
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("cause", "draw_line");
      formData.append("note", "上传页直接诊断");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const payloadText = await response.text();
      const payload = payloadText ? JSON.parse(payloadText) : null;

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || `诊断失败（HTTP ${response.status}）`);
      }

      localStorage.setItem("latest_diagnosis", JSON.stringify(payload));
      router.push("/report");
    } catch (error: any) {
      window.alert(error?.message || "诊断失败，请稍后重试。");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowRight className="rotate-180 text-slate-600" size={24} />
        </button>
        <span className="font-bold text-slate-800">上传错题</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] bg-white rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[#667EEA] hover:bg-blue-50/30 transition-all group"
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
          <div className="relative w-full aspect-[3/4] bg-black rounded-[32px] overflow-hidden shadow-2xl">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>
            {isAnalyzing ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-bold text-lg animate-pulse">陈老师正在诊断中...</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-8 max-w-lg mx-auto w-full">
        <button
          onClick={handleStartDiagnosis}
          disabled={!selectedFile || isAnalyzing || !isActive}
          className={`w-full py-4 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
            !selectedFile || !isActive
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {!isActive ? "请先激活服务" : isAnalyzing ? "诊断中..." : "开始诊断"}
          {isActive && !isAnalyzing ? <ArrowRight size={24} /> : null}
        </button>

        {!isActive ? (
          <div className="mt-6 p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
            <h3 className="text-slate-800 font-bold mb-4">激活完整功能</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="输入激活码"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#667EEA] transition-colors"
              />
              <button
                onClick={handleActivate}
                disabled={isActivating || !activationCode.trim()}
                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all"
              >
                {isActivating ? "..." : "激活"}
              </button>
            </div>
          </div>
        ) : null}

        <p className="text-center text-xs text-slate-400 mt-4">AI 仅用于辅助教学，结果仅供参考。</p>
      </div>
    </div>
  );
}
