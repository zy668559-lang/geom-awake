
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client for DeepSeek
// Priority: DEEPSEEK_ prefix -> OPENAI_ prefix -> default
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
    
    // Handle new multi-upload structure
    const { grade, uploads } = body as { 
        grade: number; 
        uploads: Array<{
            questionNo: string;
            stuckPoint: string;
            thinkingMode: string;
            thinkingContent: string;
            isCheckup: boolean;
        }> 
    };

    if (!uploads || uploads.length === 0) {
      return NextResponse.json({ error: 'Please upload at least one question' }, { status: 400 });
    }

    // Synthesize user description from uploads
    const problemsSummary = uploads.map((u, i) => 
        `[第${i+1}题 题号:${u.questionNo}] 卡点:${u.stuckPoint}。思考状态:${u.thinkingMode} - ${u.thinkingContent || '无详细描述'}`
    ).join('\n');

    const userDescription = `我上传了${uploads.length}道错题。\n${problemsSummary}`;
    
    // Construct prompt
    const prompt = `
      你是一位经验丰富、极具亲和力的初中几何教练，正在直接与学生（和旁听的家长）对话。
      
      【学生情况】
      年级：${grade}
      错题描述汇总：
      ${userDescription}
      
      【重要提示】
      - 你**看不到**学生上传的题目图片，只能看到上述文字描述。
      - 如果学生的描述太简略，请**不要**编造具体的几何图形，而是给出通用的几何解题策略。
      - 只有当学生明确提到了具体的图形特征时，你才能针对性地分析。
      
      【角色设定】
      - 语气：温暖、敏锐、一针见血。
      - 话术风格：使用“大白话”，禁止堆砌术语。
      - 心理洞察：指出孩子“想做但没敢做”的心理。

      【任务】
      根据学生的描述，生成一份诊断报告。如果描述不清，就侧重于“如何审题”和“心态调整”。
      
      【输出JSON格式】
      {
        "coreIssueTag": "以下6个标签选1个: 条件看不出 / 角关系乱 / 画线想不到 / 模型选不出 / 理由写不出 / 步骤算断",
        "kidTalk": "直接对孩子说的话。如果不知道具体题目，就鼓励他：“是不是图形太乱看花了眼？试着把已知条件用红笔描出来。”",
        "commandLine": "一句口令（7个字以内），如‘条件标记要清晰’。",
        "fixPlan": [
           "第一步具体动作",
           "第二步具体动作",
           "第三步具体动作"
        ],
        "nextTraining": "推荐的模型ID (只能从这3个里选: M1_MIDPOINT / M2_ANGLE / M3_SIMILAR)",
        "parentSummary": "给家长的话。强调几何直觉的培养。如果学生描述不清，请提醒家长：“由于孩子未详细描述题目，建议引导孩子大声读题，把条件‘翻译’成图形语言。”"
      }
    `;

    let resultJSON;

    try {
      // Try calling AI
      // If dummy key, this will fail and go to catch block for fallback
      if (apiKey === 'dummy-key') throw new Error("No API Key");

      const completion = await client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: modelName,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content from AI");
      
      resultJSON = JSON.parse(content);
      
    } catch (aiError) {
      console.log("AI Call failed or skipped, using fallback mock data:", aiError);
      // Fallback Mock Data for MVP stability
      resultJSON = {
        coreIssueTag: "模型选不出",
        kidTalk: "我发现你其实已经看到了中点，但是手里的笔却迟迟不敢连线。是不是怕连错了？记住，几何里‘见中点’就是冲锋号，大胆连起来！",
        commandLine: "见中点，连中点",
        fixPlan: [
            "在图中用红笔圈出所有的中点",
            "连接中点与顶点（或另一个中点）",
            "观察新出现的三角形是否全等"
        ],
        nextTraining: "M1_MIDPOINT",
        parentSummary: "孩子对几何图形的直觉很好，但在‘构造辅助线’这一步缺乏自信。这通常是因为见过的标准模型不够多。我们这次专项训练会重点帮他建立‘中点模型’的肌肉记忆。"
      };
    }

    // Ensure valid model ID and Map to RepairPack
    const VALID_MODELS = ['M1_MIDPOINT', 'M2_ANGLE', 'M3_SIMILAR'];
    if (!VALID_MODELS.includes(resultJSON.nextTraining)) {
        resultJSON.nextTraining = 'M1_MIDPOINT'; // Default fallback
    }
    
    // MVP Mapping: Always map M1_MIDPOINT (or others) to our ready-made 'RP_MIDPOINT_DOUBLE'
    // In a real app, this would map to different packs.
    resultJSON.repairPackId = 'RP_MIDPOINT_DOUBLE';

    // Save session
    const sessionId = uuidv4();
    const sessionData = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      grade,
      uploads, // Save the uploads info
      report: resultJSON
    };

    // Ensure directory exists
    const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(sessionsDir, `${sessionId}.json`), JSON.stringify(sessionData, null, 2));

    return NextResponse.json({ sessionId });

  } catch (error) {
    console.error('Clinic API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
