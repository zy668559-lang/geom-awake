import { NextResponse } from "next/server";
import { identifyGeometry } from "@/lib/gemini";

export async function POST(req: Request) {
  console.log("[Analyze API] POST request received");
  try {
    const body = await req.json();
    const { imageBase64, stuckPoint, messages } = body;

    if (!imageBase64) {
      console.warn("[Analyze API] Missing imageBase64");
      return NextResponse.json({ error: "请上传题目图片" }, { status: 400 });
    }

    // 2. 眼睛亮起：调用 Gemini 识图
    console.log("[Eyes] Calling Gemini 2.0 Flash...");
    const geometryDescription = await identifyGeometry(imageBase64);
    console.log("[Eyes] Gemini recognition successful.");

    // 3. 注入灵魂：调用 DeepSeek 推理
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const systemPrompt = `
你是陈老师，一位有20年经验教初中几何的教练。你的风格是：
1. **邻居大姐口吻**：亲切、通俗、接地气。严禁使用"掌握薄弱"、"逻辑断层"等术语。
2. **灵魂诊断**：你要根据图形描述和孩子觉得难的地方（卡点），找出那个最关键的"隐形陷阱"。
3. **具体建议**：给出一个具体的、今晚就能做的3天练习计划。

**必须使用的语气示例**：
- "这道题有个隐形陷阱，孩子没瞧见。"
- "这题就像走路绕了远路，其实有个近道孩子还没发现。"
- "咱们不急，先找那个躲起来的中点。"

**输入信息**：
- 题目描述：${geometryDescription}
- 孩子觉得难在哪：${stuckPoint || "未提供"}

请返回 JSON 格式（严禁返回 Markdown 代码块，只返回纯 JSON 字符串）：
{
  "stuckPoint": "陈老师发现的真正卡点（一句话，口语化）",
  "rootCause": "为什么孩子会卡在这（邻居大姐口吻，例如：孩子眼里没看到那条中位线）",
  "coachAdvice": "陈老师的口语化建议（咱们这样，今晚...）",
  "threeDayPlan": [
    { "day": 1, "task": "具体内容" },
    { "day": 2, "task": "具体内容" },
    { "day": 3, "task": "具体内容" }
  ]
}
    `;

    console.log("[Brain] DeepSeek reasoning started...");
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || [])
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[Brain] DeepSeek Error Resp:", errText);
      throw new Error(`DeepSeek API Error: ${errText}`);
    }

    const data = await resp.json();
    let content = data.choices[0].message.content;

    // 清洗可能存在的 Markdown 标记
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("[Complete] Diagnosis generated and sent.");
    return NextResponse.json(JSON.parse(content));

  } catch (error: unknown) {
    console.error("[Analyze API] ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "分析失败", details: errorMessage },
      { status: 500 }
    );
  }
}
