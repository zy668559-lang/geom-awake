
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client for DeepSeek
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key';
const baseURL = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
const modelName = process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat';

const client = new OpenAI({
  baseURL,
  apiKey,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { grade, diagnosisTags, userSelfReport, currentStep, repairPackContext } = body;

    const prompt = `
    你是一位严谨的初中几何私教。请根据学生提供的题目信息和当前训练的【核心修复策略】进行指导。

    【必须遵守的规则】
    1. **防幻觉**：只允许引用下方提供的【核心修复策略】里的内容（口令、模板）。
    2. **信息补全**：如果学生描述太模糊（例如只发了图片但没说哪里卡住了，或者条件不全），**必须**返回 "NeedMoreInfo"。
    3. **输出格式**：必须严格按照以下5段式结构输出（不要加多余的寒暄）：
       - **我看到的条件**：(列出已知条件)
       - **你要证什么**：(明确目标)
       - **下一步动作**：(引用下方【核心修复策略】中的工具/动作)
       - **为什么这样做**：(解释原理，引用思维模板)
       - **你照做**：(具体的行动指令)

    【核心修复策略（只准参考这里）】
    工具/动作：${repairPackContext?.tool || '通用几何思维'}
    觉醒口令：${repairPackContext?.mantra || '先读题，后画图'}
    思维模板：${repairPackContext?.thinkingTemplate?.join('；') || '1. 标已知 2. 找关系 3. 列算式'}

    【学生输入】
    年级：初${grade}
    诊断标签：${diagnosisTags?.join(', ')}
    当前环节：${currentStep}
    学生自述：${userSelfReport}
    `;

    const completion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: modelName,
      temperature: 0.5, // Lower temperature for more controlled output
      max_tokens: 300
    });

    const content = completion.choices[0].message.content;

    return NextResponse.json({ reply: content });

  } catch (error: any) {
    console.error("Chat Error:", error);
    let reply = "哎呀，AI 老师暂时有点累（网络拥堵），没能完全听清。不过你可以先试试重新读一遍题目？";
    
    if (error?.status === 402) reply = "（AI 老师余额不足，请家长检查充值情况）";
    else if (error?.status === 401) reply = "（AI 老师未上岗，请检查 API Key 配置）";
    
    return NextResponse.json({ reply }, { status: 500 });
  }
}
