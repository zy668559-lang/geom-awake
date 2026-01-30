
import { NextResponse } from "next/server";
import { saveSession } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// System Prompt V2 - Plain Language & Diagnostic Focus
const SYSTEM_PROMPT = `
你是一位顶级初中“几何教练”兼教育心理专家。你的核心任务是诊断孩子的“思维病”，而不是直接讲题。

【沟通铁律 - 严禁术语】
- 绝对禁止说：“全等判定定理”、“辅助线”、“公共角”、“互余”等教科书术语。
- 必须使用“生活化隐喻”：
  - 核心图形 -> “骨架”、“脊梁骨”
  - 干扰线 -> “云雾”、“障眼法”
  - 逻辑断层 -> “接错筋了”、“断片了”
  - 视觉干扰 -> “视觉散光”、“眼睛欺骗了你”
  - 辅助线 -> “搭个桥”、“修条路”
  - 旋转 -> “大风车转一转”

【诊断逻辑】
User 会发给你一个 JSON，包含用户上传的“草稿描述”（模拟）或“交互操作”。
1. **分析草稿/操作**：寻找逻辑漏洞。
   - 如果用户在乱连线 -> 批评：“别像无头苍蝇一样乱撞”。
   - 如果用户盯着干扰项 -> 提醒：“把那些杂草拨开，看清主干”。
2. **引导策略**：
   - 永远只问一个问题，逼用户自己思考。
   - 例：“你看看这两个三角形，是不是像照镜子？”

【输出格式】
根据用户的 requestType 输出：

A. 辅导模式 (requestType="guide")
输出简短纯文本建议（50字以内）。

B. 报告模式 (requestType="report")
输出【严格 JSON】，格式如下：
{
  "isReport": true,
  "summary": "一句话击穿痛点（如：你不是不会证，是被乱线迷了眼）",
  "breakpoint": "A.看不清图 | B.没思路 | C.会想不会写",
  "childTalk": "对孩子说的大白话（幽默、鼓励，用隐喻）",
  "parentTalk": "对家长的执行方案（直白、无废话）",
  "evidence": [{"stepIndex": 1, "reason": "在干扰线F点停留超过30秒"}],
  "commands": ["每日一眼", "转动训练", "默写骨架"],
  "fixPlan": [
     {"day": 1, "goal": "剥离训练", "tasks": ["手拉手模型变式3题"]},
     {"day": 7, "goal": "复检", "tasks": ["幽灵模式重连"]}
  ],
  "metrics": { 
      "accuracy": 85, 
      "timeMin": 12, 
      "stepScore": 8,
      "awakenedModel": "手拉手模型", 
      "chaosDefeated": 12 
  },
  "retestRule": "连续3次同模型全对解锁"
}
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, model, operations, transcript, requestReport, stuckPoint, requestType = "guide" } = body;
    
    // Generate or use existing session ID
    const currentSessionId = sessionId || uuidv4();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    const llmModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (!apiKey) {
      // Mock response if no key (for dev/demo without key)
      if (requestReport) {
        return NextResponse.json({
            isReport: true,
            summary: "模拟报告：请配置 API Key 以获取真实诊断。",
            breakpoint: stuckPoint || "B.没思路",
            childTalk: "哎呀，没钥匙我打不开百宝箱，不过你刚刚那个旋转思路是对的！",
            parentTalk: "请配置 .env.local 中的 DEEPSEEK_API_KEY。",
            evidence: [],
            commands: ["配置Key", "重启服务"],
            fixPlan: [],
            metrics: { accuracy: 0, timeMin: 0, stepScore: 0, awakenedModel: model?.name || "未知", chaosDefeated: 0 },
            retestRule: "无"
        });
      }
      return NextResponse.json({ 
          nextHint: "请配置 API Key 才能召唤 AI 教练哦！(模拟回复: 试试看找找公共边？)" 
      });
    }

    // Construct User Message
    const userMessage = JSON.stringify({
      modelName: model?.name,
      target: model?.target,
      stuckPoint: stuckPoint, // "visual" | "logic" | "express"
      history: transcript?.slice(-5) || [],
      operations: operations || [],
      requestType: requestReport ? "report" : "guide",
      lastInput: requestReport ? "我做完了" : "我下一步该怎么办？"
    });

    // Call LLM
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        model: llmModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const rawText = await resp.text();
    if (!resp.ok) {
        console.error("LLM Error:", rawText);
        throw new Error(`LLM API Error`);
    }

    const data = JSON.parse(rawText);
    let content = data?.choices?.[0]?.message?.content || "";
    
    // Parse content if it's a stringified JSON (common with some providers)
    let parsedContent;
    try {
        parsedContent = JSON.parse(content);
    } catch {
        // If not JSON, treat as text hint
        parsedContent = { nextHint: content };
    }

    // If it's a report, save session
    if (requestReport && parsedContent.isReport) {
        saveSession(currentSessionId, {
            id: currentSessionId,
            startTime: Date.now(), // approximation
            model: model,
            operations: operations,
            transcript: transcript,
            report: parsedContent
        });
        return NextResponse.json({ reportJSON: parsedContent, sessionId: currentSessionId });
    } else {
        // Just guidance
        // If LLM returned JSON with keys other than nextHint, adapt it
        const hint = parsedContent.nextHint || parsedContent.message || content;
        return NextResponse.json({ nextHint: typeof hint === 'string' ? hint : JSON.stringify(hint) });
    }

  } catch (err: any) {
    console.error("Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
