"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Images, Loader2 } from "lucide-react";
import { preprocessImageForAnalyze } from "@/lib/client/image-preprocess";

function buildSessionId() {
  return `sid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function HomePage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const [isPreparing, setIsPreparing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [errorText, setErrorText] = useState("");

  const handlePickCamera = () => {
    if (isPreparing) return;
    cameraInputRef.current?.click();
  };

  const handlePickAlbum = () => {
    if (isPreparing) return;
    albumInputRef.current?.click();
  };

  const handleImageSelected = async (file: File | undefined) => {
    if (!file || isPreparing) return;

    setIsPreparing(true);
    setErrorText("");
    setProgressText("正在读取图片...");

    try {
      const prepared = await preprocessImageForAnalyze(file, (text) => setProgressText(text));
      const sid = buildSessionId();
      localStorage.setItem("pending_geometry_sid", sid);
      localStorage.setItem("pending_geometry_image", prepared.dataUrl);
      router.push(`/processing?sid=${encodeURIComponent(sid)}`);
    } catch (error: any) {
      setErrorText(error?.message || "图片处理失败，请换一张清晰的题图再试。");
      setIsPreparing(false);
      setProgressText("");
    }
  };

  const onCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    void handleImageSelected(file);
  };

  const onAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    void handleImageSelected(file);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">几何思维体检中心</h1>
        <p className="mt-4 text-slate-500 text-lg font-medium">拍题后 1 次诊断，直接看到孩子卡在哪一步。</p>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onCameraChange}
      />
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onAlbumChange}
      />

      <div className="w-full max-w-md space-y-4">
        <button
          onClick={handlePickCamera}
          disabled={isPreparing}
          className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Camera size={20} />
          拍照上传
        </button>
        <button
          onClick={handlePickAlbum}
          disabled={isPreparing}
          className="w-full py-4 rounded-2xl bg-white border border-slate-300 text-slate-800 font-black text-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Images size={20} />
          从相册选择
        </button>
      </div>

      {isPreparing ? (
        <div className="mt-6 flex items-center gap-2 text-slate-600 font-bold">
          <Loader2 className="animate-spin" size={18} />
          <span>{progressText || "正在处理..."}</span>
        </div>
      ) : null}

      {errorText ? (
        <p className="mt-6 max-w-md text-center text-sm font-bold text-red-600 leading-relaxed">{errorText}</p>
      ) : null}
    </div>
  );
}
