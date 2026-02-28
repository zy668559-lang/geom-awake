"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Images, Loader2, X } from "lucide-react";
import { preprocessImageForAnalyze } from "@/lib/client/image-preprocess";

export default function UploadPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareText, setPrepareText] = useState("");
  const [errorText, setErrorText] = useState("");

  const [activationCode, setActivationCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isActive, setIsActive] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("is_activated") === "true";
  });

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

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

  const prepareAndPreview = async (file: File | undefined) => {
    if (!file || isPreparing || isAnalyzing) return;
    setIsPreparing(true);
    setErrorText("");

    try {
      const prepared = await preprocessImageForAnalyze(file, (text) => setPrepareText(text));
      cleanupPreview();
      const nextPreview = URL.createObjectURL(prepared.file);
      setSelectedFile(prepared.file);
      setPreviewUrl(nextPreview);
    } catch (error: any) {
      setErrorText(error?.message || "图片处理失败，请换一张图。");
      setSelectedFile(null);
      cleanupPreview();
      setPreviewUrl(null);
    } finally {
      setIsPreparing(false);
      setPrepareText("");
    }
  };

  const onCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    void prepareAndPreview(file);
  };

  const onAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    void prepareAndPreview(file);
  };

  const handleClear = () => {
    cleanupPreview();
    setPreviewUrl(null);
    setSelectedFile(null);
    setErrorText("");
  };

  const handleStartDiagnosis = async () => {
    if (!selectedFile || isAnalyzing || !isActive) return;
    setIsAnalyzing(true);
    setErrorText("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("cause", "draw_line");
      formData.append("note", note.trim() || "上传页直接诊断");

      const useMockAnalyze = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const headers = useMockAnalyze ? { "x-analyze-mock": "1" } : undefined;

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        headers,
      });

      const payloadText = await response.text();
      const payload = payloadText ? JSON.parse(payloadText) : null;

      if (!response.ok || payload?.errorCode) {
        throw new Error(payload?.reason || payload?.message || payload?.error || `诊断失败（HTTP ${response.status}）`);
      }

      localStorage.setItem("latest_diagnosis", JSON.stringify(payload));
      router.push("/report");
    } catch (error: any) {
      setErrorText(error?.message || "诊断失败，请稍后重试。");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowRight className="rotate-180 text-slate-600" size={24} />
        </button>
        <span className="font-bold text-slate-800">上传错题</span>
        <div className="w-10" />
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onCameraChange}
      />
      <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={onAlbumChange} />

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {!previewUrl ? (
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isPreparing || isAnalyzing}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Camera size={18} />
              拍照上传
            </button>
            <button
              type="button"
              onClick={() => albumInputRef.current?.click()}
              disabled={isPreparing || isAnalyzing}
              className="w-full py-4 rounded-2xl bg-white border border-slate-300 text-slate-800 font-black flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Images size={18} />
              从相册选择
            </button>
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

        {isPreparing ? (
          <div className="mt-4 text-sm font-bold text-slate-600 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span>{prepareText || "正在处理图片..."}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-8 max-w-lg mx-auto w-full space-y-3">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="写一句孩子卡在哪（选填）"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-[#667EEA]"
          disabled={isAnalyzing}
        />
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

        {errorText ? <p className="text-sm font-bold text-red-600">{errorText}</p> : null}
        <p className="text-center text-xs text-slate-400 mt-4">AI 仅用于辅助教学，结果仅供参考。</p>
      </div>
    </div>
  );
}
