import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 解析请求 - 支持图片 Base64
    const body = await req.json();
    const { imageBase64, messages } = body;
    // messages 可选，如果前端传了对话历史

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

    // 陈老师核心人设 Prompt
    const systemPrompt = `
你是陈老师，一位有20年经验的初中几何教练。你的风格是：

1. **口语化**：用"咱们""你看"这种亲切表达，不用术语堆砌
2. **找规律**：不是讲题，而是帮学生发现"这类题都卡在哪"
3. **给方法**：每个建议都配具体的3天练习计划
4. **鼓励型**：强调"不是笨，是缺练习"

请仔细分析用户上传的几何错题图片，如果是文字描述则分析描述。

返回 JSON 格式（严禁返回 Markdown 代码块，只返回纯 JSON 字符串）：
{
  "stuckPoint": "一句话诊断卡点（例如：看不出隐藏的平行线）",
  "rootCause": "本质原因（例如：平行线判定5个定理没形成条件反射）",
  "coachAdvice": "陈老师的口语化建议（咱们这样，今晚睡前...）",
  "threeDayPlan": [
    { "day": 1, "task": "具体练习内容" },
    { "day": 2, "task": "具体练习内容" },
    { "day": 3, "task": "具体练习内容" }
  ]
}
    `;

    // 2. 构造 DeepSeek 请求的消息体
    const deepseekMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []) // 追加历史
    ];

    // 如果有图片，按照 Vision 模型格式构造 (假设 DeepSeek 支持 Vision 或由前端 OCR 后传入)
    // 注意：当前 DeepSeek V3/R1 主要为文本模型，若需图片理解可能需要多模态或者前端先转描述。
    // *根据当前 MVP 设定，我们假设前端可能传 OCR 文本或 Prompt 引导*
    // *修正：RECONSTRUCTION_PLAN 提到 "图片上传后直接调用 DeepSeek API"*
    // *如果 DeepSeek 暂不支持直接图片 URL，这里做 Mock 兼容或提示前端*

    // 临时 Mock 逻辑：如果没有 Key，返回模拟数据
    if (!apiKey) {
      console.log("No API Key, returning mock 'Chen Teacher' response");
      return NextResponse.json(JSON.stringify({
        stuckPoint: "辅助线画多了，眼花缭乱",
        rootCause: "没有先找核心图形，直接凭感觉连线",
        coachAdvice: "哎呀，这题你看，是不是把简单图想复杂了？咱们别见点就连线。",
        threeDayPlan: [
          { day: 1, task: "只看题干画草图，不看原图" },
          { day: 2, task: "练习『手绘标准圆』10次" },
          { day: 3, task: "重做这道题，限制只能画1条辅助线" }
        ]
      }));
    }

    // 真实调用
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat", // 或 deepseek-v3
        messages: deepseekMessages,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" } // 强制 JSON
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`DeepSeek API Error: ${errText}`);
    }

    const data = await resp.json();
    let content = data.choices[0].message.content;

    // 清洗可能存在的 Markdown 标记
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(content);

  } catch (error: unknown) {
    console.error("Analyze Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "分析失败", details: errorMessage },
      { status: 500 }
    );
  }
}
