const MAX_EDGE = 1280;
const COMPRESS_TRIGGER_BYTES = 1_500_000;
const TARGET_MAX_BYTES = 900_000;
const HARD_MAX_BYTES = 900_000;
const START_QUALITY = 0.7;
const MIN_QUALITY = 0.45;
const QUALITY_STEP = 0.05;

const IOS_FORMAT_TIP = "图片为空/格式不支持，请改用相册或把相机格式改为‘兼容性最佳(JPG)’";

export type PreparedImage = {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  mimeType: string;
};

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败，请重试"));
    reader.readAsDataURL(blob);
  });
}

function isHeicLike(file: File): boolean {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type.includes("heic") || type.includes("heif") || name.endsWith(".heic") || name.endsWith(".heif");
}

function blobToImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(IOS_FORMAT_TIP));
    };
    img.src = url;
  });
}

async function toCanvas(file: File): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const source = await blobToImageElement(file);
  const longest = Math.max(source.width, source.height);
  const ratio = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
  const targetWidth = Math.max(1, Math.round(source.width * ratio));
  const targetHeight = Math.max(1, Math.round(source.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("当前浏览器不支持图片压缩");
  }
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  return { canvas, width: targetWidth, height: targetHeight };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function isValidFile(file: File | null | undefined): file is File {
  return !!file && Number.isFinite(file.size) && file.size > 0;
}

async function toPreparedFromFile(file: File): Promise<PreparedImage> {
  if (!isValidFile(file)) {
    throw new Error(IOS_FORMAT_TIP);
  }
  if (file.size > HARD_MAX_BYTES) {
    throw new Error("图片过大，请重试/换一张更清晰但更小的照片");
  }

  const dataUrl = await readAsDataUrl(file);
  return {
    file,
    dataUrl,
    width: 0,
    height: 0,
    bytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function preprocessImageForAnalyze(file: File, onProgress?: (text: string) => void): Promise<PreparedImage> {
  if (!isValidFile(file)) {
    throw new Error(IOS_FORMAT_TIP);
  }

  const shouldCompress =
    file.size > COMPRESS_TRIGGER_BYTES ||
    file.size > TARGET_MAX_BYTES ||
    file.type !== "image/jpeg" ||
    isHeicLike(file);

  if (!shouldCompress) {
    return toPreparedFromFile(file);
  }

  onProgress?.("正在压缩图片...");

  try {
    const { canvas, width, height } = await toCanvas(file);
    let quality = START_QUALITY;
    let blob = await canvasToBlob(canvas, quality);

    if (!blob || blob.size <= 0) {
      return toPreparedFromFile(file);
    }

    while (blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      const nextBlob = await canvasToBlob(canvas, quality);
      if (!nextBlob || nextBlob.size <= 0) {
        return toPreparedFromFile(file);
      }
      blob = nextBlob;
    }

    if (blob.size <= 0) {
      throw new Error(IOS_FORMAT_TIP);
    }
    if (blob.size > HARD_MAX_BYTES) {
      throw new Error("图片过大，请重试/换一张更清晰但更小的照片");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "geometry";
    const outputFile = new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    if (!isValidFile(outputFile)) {
      throw new Error(IOS_FORMAT_TIP);
    }

    const dataUrl = await readAsDataUrl(outputFile);
    onProgress?.("图片处理完成，准备开始诊断...");
    return {
      file: outputFile,
      dataUrl,
      width,
      height,
      bytes: outputFile.size,
      mimeType: outputFile.type || "image/jpeg",
    };
  } catch (error: any) {
    if (error instanceof Error && (error.message.includes("图片过大") || error.message.includes("格式不支持"))) {
      throw error;
    }
    if (isHeicLike(file)) {
      throw new Error(IOS_FORMAT_TIP);
    }
    return toPreparedFromFile(file);
  }
}
