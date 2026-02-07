import { NextResponse } from "next/server";
import { identifyGeometry } from "@/lib/gemini";

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const startTime = Date.now();
  console.log(`🚀 [Analyze API][${requestId}] Request Started at ${new Date().toISOString()}`);

  // 强制确认 Key 存在
  console.log(`🔥🔥🔥 [Analyze API Key Check][${requestId}] Gemini Key 前五位:`, process.env.GEMINI_API_KEY?.substring(0, 5) || 'NULL!!!');

  try {
    // 0. Mock Mode Check
    if (process.env.MOCK_MODE === "true") {
      console.log(`[Analyze API][${requestId}] 🟢 Mock Mode Enabled. Returning static result.`);
      return NextResponse.json({
        stuckPoint: "孩子目前的识图卡点是：对图形中的隐形辅助线不敏感。",
        rootCause: "这道题就像是有个机关，藏在地基下面，孩子没找到那个中点。",
        coachAdvice: "咱们今晚先不急着刷题，先拿尺子量量这个中位线。",
        threeDayPlan: [
          { day: 1, task: "找3道类似的图形，只画辅助线，不写过程。" },
          { day: 2, task: "尝试写出一道题的完整逻辑。" },
          { day: 3, task: "给陈老师说说你的思路。" }
        ]
      });
    }

    const body = await req.json();
    const { imageBase64, stuckPoint, messages } = body;
    const imgSizeKB = imageBase64 ? Math.round(imageBase64.length / 1024) : 0;

    console.log(`--- [Step 1][${requestId}] Image Received. Size: ${imgSizeKB}KB. Stuck: ${stuckPoint} ---`);

    if (!imageBase64) {
      console.warn(`⚠️ [Step 1 Error][${requestId}] Missing imageBase64`);
      return NextResponse.json({ error: "请上传题目图片" }, { status: 400 });
    }

    // 2. 调用 Gemini 识图
    console.log(`--- [Step 2][${requestId}] Triggering Gemini Vision ---`);
    const geometryDescription = await identifyGeometry(imageBase64);
    console.log(`--- [Step 3][${requestId}] Gemini recognition success! Result length: ${geometryDescription.length} ---`);

    // 3. 调用 DeepSeek 推理
    console.log(`--- [Step 4][${requestId}] Handing over to DeepSeek ---`);
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

    if (!apiKey) {
      console.error(`❌ [Step 4 Error][${requestId}] DEEPSEEK_API_KEY is missing!`);
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const systemPrompt = `
你是陈老师，一位有20年经验教初中几何的教练。你的风格是：
1. **邻居大姐口吻**：亲切、通俗、接地气。严禁使用"掌握薄弱"、"逻辑断层"、"知识点缺失"等术语。
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

    console.log(`--- [Step 5][${requestId}] Calling DeepSeek API ---`);
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
      console.error(`❌ [Step 5 Error][${requestId}] DeepSeek returned failure:`, errText);
      throw new Error(`DeepSeek API Error: ${errText}`);
    }

    const data = await resp.json();
    let content = data.choices[0].message.content;
    console.log(`--- [Step 6][${requestId}] DeepSeek Reasoning Complete ---`);

    // 清洗可能存在的 Markdown 标记
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    const duration = Date.now() - startTime;
    console.log(`🎉 [Analyze API][${requestId}] Success! Duration: ${duration}ms`);
    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`🚨🚨🚨 [Analyze API FATAL ERROR][${requestId}] Duration: ${duration}ms 🚨🚨🚨`);
    console.error(`[${requestId}] Error Name:`, error?.name);
    console.error(`[${requestId}] Error Message:`, error?.message);
    if (error?.rawData) {
      console.error(`[${requestId}] Raw Error Data included in response.`);
    }

    return NextResponse.json(
      {
        error: error?.message?.includes("校验失败") ? "环境校验中断" : "诊断失败",
        details: error?.message || String(error),
        requestId,
        errData: error?.rawData || null
      },
      { status: 500 }
    );
  }
}
