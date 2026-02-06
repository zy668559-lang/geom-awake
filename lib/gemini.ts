import { GoogleGenerativeAI } from "@google/generative-ai";

export async function identifyGeometry(imageBase64: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error(">>> [Gemini Service] GEMINI_API_KEY is missing in process.env");
        throw new Error("Gemini API Key 未配置");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
你是一位专业的初中几何识图助手。请仔细观察这张几何题目图片，完成以下任务：

1. **图形识别**：描述图中主要的几何图形（如三角形、圆、平行四边形等）。
2. **符号与标注**：列出图中出现的字母标注（点 A, B, C 等）以及几何符号（垂直、平行、中点、角相等、边相等等）。
3. **文本OCR**：识别图片中的所有文字题目信息。
4. **综合描述**：将以上信息整合成一段清晰的结构化文字，描述图形的构成和已知条件。

**注意**：你只需要客观描述看到的图形和文字，**严禁**进行数学证明或给出解题步骤。你的输出将作为另一个逻辑模型的输入。
  `;

    try {
        const base64Data = imageBase64.split(",")[1] || imageBase64;
        console.log(`>>> [Gemini Service] Calling model generateContent. Data length: ${base64Data.length}`);

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();
        console.log(">>> [Gemini Service] Gemini responded successfully");
        return text;
    } catch (error: any) {
        console.error(">>> [Gemini Service] ERROR:", error);
        const detail = error?.message || String(error);
        throw new Error(`视觉识别引擎识别失败: ${detail}`);
    }
}
