import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stuckPoint, problemInfo } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json({ error: "未读取到 DEEPSEEK_API_KEY" }, { status: 500 });
    }

    const systemPrompt = `
你是一位深谙中国孩子心理的“几何开窍医生”。你的任务是根据孩子的“卡点”和题目信息，给出“大白话”诊断。
【禁止】使用晦涩的数学术语（如“辅助线”、“全等判定”等教科书式语言）。
【必须】使用生动、有趣的类比，例如：
- “透视眼”：指能从复杂图形中看出基本模型。
- “剥洋葱”：指一层层去掉干扰线。
- “接错筋”：指思路连错了方向。
- “逻辑断层”：指想到了但没写出来。

用户的卡点类型：
1. "messy" (🔴图太乱看不清) -> 侧重于“视觉干扰”、“需要透视眼”。
2. "cant_connect" (🟡想到模型连不上) -> 侧重于“接错筋”、“模型匹配”。
3. "cant_write" (🟢会想但写不出) -> 侧重于“逻辑断层”、“表达输出”。

请根据用户的卡点和（可选的）题目描述，生成一段简短、幽默、鼓励性的诊断报告。100字以内。
    `;

    const userContent = `我的卡点是：${stuckPoint}。${problemInfo ? `题目信息：${problemInfo}` : ""}`;

    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.7, // Slightly higher for creativity/humor
      }),
    });

    const rawText = await resp.text();
    if (!resp.ok) {
      return NextResponse.json(
        { error: `DeepSeek API Error (${resp.status})`, detail: rawText },
        { status: 500 }
      );
    }

    const data = JSON.parse(rawText);
    const result = data?.choices?.[0]?.message?.content ?? "（AI 似乎也在思考...）";

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
