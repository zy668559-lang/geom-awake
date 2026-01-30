
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { StepLog } from '@/lib/types';

import { getQuestionById } from '@/lib/data-loader';

// Initialize OpenAI client for DeepSeek
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key';
const baseURL = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
const modelName = process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat';

const client = new OpenAI({
  baseURL,
  apiKey,
});

const ALLOWED_TAGS = [
    "条件看不出",
    "角关系乱",
    "画线想不到",
    "模型选不出",
    "理由写不出",
    "步骤算断"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { logs, grade } = body as { logs: StepLog[], grade: number };

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid logs data' }, { status: 400 });
    }

    // Pre-calculate dominant tag from local logic
    const tagCounts: Record<string, number> = {};
    logs.forEach(l => {
        if (l.diagnosisTag) {
            tagCounts[l.diagnosisTag] = (tagCounts[l.diagnosisTag] || 0) + 1;
        }
    });
    
    let dominantTag = '';
    let maxCount = 0;
    Object.entries(tagCounts).forEach(([tag, count]) => {
        if (count > maxCount) {
            maxCount = count;
            dominantTag = tag;
        }
    });

    if (!dominantTag && logs.some(l => !l.isCorrect)) {
        dominantTag = "模型选不出"; 
    }

    let recommendedModel = 'M2_ANGLE'; 
    const firstErrorLog = logs.find(l => !l.isCorrect);
    if (firstErrorLog) {
        const q = getQuestionById(firstErrorLog.questionId);
        if (q) {
             recommendedModel = q.model;
        }
    }

    const prompt = `
        你是一位经验丰富、极具亲和力的初中几何教练，正在直接与学生（和旁听的家长）对话。

        【角色设定】
        - 语气：温暖、敏锐、一针见血，像一位看穿了学生小心思的私教。
        - 话术风格：使用“大白话”，绝对禁止堆砌数学术语。
        - 心理洞察：你要指出孩子“想做但没敢做”的心理。例如：“孩子，你草稿里想连 AD 是对的，但你当时因为心慌没敢连。这说明你已经看到了‘手拉手’的一半，差的是那 1% 的信心。”——让家长觉得你完全看穿了孩子。

        【上下文信息】
        学生年级：${grade}
        诊断标签：${dominantTag}
        推荐模型：${recommendedModel}
        （这是根据系统自动判定的结果，你需要基于这个结果，生成一份人性化的报告）

        【输出JSON格式】
        {
          "coreIssueTag": "${dominantTag}",
          "kidTalk": "直接对孩子说的话。指出他刚才犹豫的那个瞬间，肯定他的直觉，然后指出缺失的那一点点‘勇气’或‘套路’。不要说教，要共情。",
          "commandLine": "一句口令（7个字以内），朗朗上口。",
          "fixPlan": [
             "第一步具体动作（如：拿出红笔，把直角都描粗）",
             "第二步具体动作（如：闭眼回忆一遍刚才的辅助线）",
             "第三步具体动作（如：再找一道类似的题验证一下）"
          ],
          "nextTraining": "${recommendedModel}",
          "parentSummary": "给家长的话。用‘医生’的口吻，解释孩子现在的‘症状’（不是笨，是眼疾/脑梗），并强调‘对症下药’的重要性。例如：‘孩子不是不懂，是几何模型库没建立起来，我们接下来的训练就是帮他把这个架子搭好。’"
        }
      `;

    let resultJSON;

    try {
      // Try calling DeepSeek
      const completion = await client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: modelName,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content from AI");
      
      resultJSON = JSON.parse(content);

      // Ensure valid model ID
      const VALID_MODELS = ['M1_MIDPOINT', 'M2_ANGLE', 'M3_SIMILAR'];
      if (!VALID_MODELS.includes(resultJSON.nextTraining)) {
          // Fallback to M2_ANGLE if AI hallucinates a model
          resultJSON.nextTraining = 'M2_ANGLE';
      }

      // Map to RepairPack ID for V1.0 MVP
      // For MVP, we map ALL valid models to our single available RepairPack 'RP_MIDPOINT_DOUBLE'
      // This ensures the user can experience the full flow regardless of the diagnosis result.
      if (VALID_MODELS.includes(resultJSON.nextTraining)) {
          resultJSON.repairPackId = 'RP_MIDPOINT_DOUBLE';
      }

    } catch (apiError: any) {
      console.error("DeepSeek API Error (using fallback):", apiError);
      // Enhanced Fallback Logic
      resultJSON = getFallbackReport(dominantTag, recommendedModel, grade, apiError);
    }

    const sessionId = uuidv4();
    const dataDir = path.join(process.cwd(), 'data', 'sessions');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const sessionData = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      grade,
      logs,
      report: resultJSON
    };

    fs.writeFileSync(path.join(dataDir, `${sessionId}.json`), JSON.stringify(sessionData, null, 2));

    return NextResponse.json({ sessionId, ...resultJSON });

  } catch (error) {
    console.error("Diagnosis Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getFallbackReport(detectedTag: string, recommendedModel: string, grade: number, error: any) {
  const tag = detectedTag || "模型选不出";
  
  // Standardized fallback message as requested
  const kidTalk = "哎呀，AI 老师暂时有点累（网络拥堵），没能完全看懂你的描述。不过通常来说，看不出条件是因为对基本图形不熟悉。";
  
  let commandLine = "先看图，后想理，模型对号入座！";
  if (grade == 9) {
      commandLine = "复杂图形拆解看，基本模型心中留！";
  } else if (grade == 8) {
      commandLine = "条件判定要对应，性质判定别搞混！";
  }

  let parentMsg = "系统暂时无法连接智能大脑，建议家长引导孩子重新审题，关注题目中的隐含条件。";
  
  // Append technical reason for debugging visibility in report
  if (error?.status === 402) parentMsg += "（提示：余额不足）";
  else if (error?.status === 401) parentMsg += "（提示：API Key 配置错误）";
  else if (error?.status === 500) parentMsg += "（提示：服务内部错误）";

  return {
    "coreIssueTag": tag,
    "kidTalk": kidTalk,
    "commandLine": commandLine,
    "fixPlan": ["每天画3遍基本模型", "总结模型常见变形", "做题前先圈出模型特征"],
    "nextTraining": recommendedModel, 
    "repairPackId": recommendedModel === 'M1_MIDPOINT' ? 'RP_MIDPOINT_DOUBLE' : undefined,
    "parentSummary": parentMsg
  };
}
