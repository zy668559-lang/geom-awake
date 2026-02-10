import sharp from 'sharp';
import { generateHash, getCachedResult, setCachedResult } from './cache';

/**
 * 429/Concurrency Solution: Backend Request Queue
 * Ensures only one Gemini request is processed at a time.
 */
class GeminiQueue {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;

    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) await task();
        }
        this.processing = false;
    }
}

const geminiQueue = new GeminiQueue();

/**
 * Image Optimization: Resize and compress
 */
async function optimizeImage(base64: string): Promise<string> {
    const buffer = Buffer.from(base64.split(',')[1] || base64, 'base64');
    const optimized = await sharp(buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    return optimized.toString('base64');
}

export async function identifyGeometry(imageBase64: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ [Gemini] GEMINI_API_KEY IS MISSING!");
        throw new Error("CRITICAL: GEMINI_API_KEY 未找到");
    }

    // 1. 检查缓存
    const imageHash = generateHash(imageBase64);
    const cached = getCachedResult(imageHash);
    if (cached) {
        return cached;
    }

    // Optimization & Token Control
    const MAX_RETRIES = 5; // 可控重试
    const MAX_OUTPUT_TOKENS = 1000; // 降成本

    return geminiQueue.add(async () => {
        let lastError: any = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const optimizedData = await optimizeImage(imageBase64);

                console.log(`--- [Gemini] Attempt ${attempt + 1} (Payload optimized) ---`);

                const payload = {
                    contents: [{
                        parts: [
                            { text: "你是一个专业的几何老师。请客观描述这张几何题目图片的内容、标注、文本和符号。重点记录已知条件和求证/求值目标。" },
                            { inlineData: { data: optimizedData, mimeType: "image/jpeg" } }
                        ]
                    }],
                    generationConfig: {
                        maxOutputTokens: MAX_OUTPUT_TOKENS,
                        temperature: 0.2
                    }
                };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    console.log('✅ [Gemini] Success!');
                    // 存储缓存
                    setCachedResult(imageHash, text);
                    return text;
                }

                const errData = await response.json().catch(() => ({}));
                const status = response.status;

                if (status === 429 || status === 500 || status === 503) {
                    lastError = new Error(`Gemini Error ${status}: ${errData?.error?.message || response.statusText}`);
                    // Exponential backoff with jitter
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
                    console.warn(`⚠️ [Gemini] Rate limited or server error (${status}). Retrying in ${Math.round(delay)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Other fatal errors
                const fatalError: any = new Error(`Gemini Fatal Error: ${errData?.error?.message || response.statusText}`);
                fatalError.rawData = errData;
                throw fatalError;

            } catch (error: any) {
                if (error.rawData) throw error; // Re-throw fatal
                lastError = error;
                console.error(`💥 [Gemini] Unexpected attempt error:`, error.message);
                if (attempt === MAX_RETRIES - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw lastError;
    });
}
