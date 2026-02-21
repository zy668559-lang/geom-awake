import { RepairCause } from "@/data/training/repair_7days";

export type RetestQuestion = {
  id: string;
  cause: RepairCause;
  stem: string;
  answerPrompt: string;
  options: string[];
  correctOption: number;
  keyPoint: string;
  correctionCommand: string;
};

export type RetestPack = {
  cause: RepairCause;
  label: string;
  questions: RetestQuestion[];
};

const DRAW_LINE_QUESTIONS: RetestQuestion[] = [
  {
    id: "DL-1",
    cause: "draw_line",
    stem: "已知三角形中有中点 M，最先考虑的辅助线是什么？",
    answerPrompt: "选最稳的一步",
    options: ["连 M 到对顶点", "先设未知数", "先列方程"],
    correctOption: 0,
    keyPoint: "中点先连中线是高频入口",
    correctionCommand: "见中点先连线",
  },
  {
    id: "DL-2",
    cause: "draw_line",
    stem: "题干有“平行”条件，补线前先做什么？",
    answerPrompt: "先定角关系再连线",
    options: ["先写角关系", "直接连任意线", "先代数运算"],
    correctOption: 0,
    keyPoint: "平行先触发角关系链",
    correctionCommand: "见平行先想角",
  },
  {
    id: "DL-3",
    cause: "draw_line",
    stem: "出现垂直条件时，辅助线优先目标是？",
    answerPrompt: "选能迅速形成直角结构的答案",
    options: ["构成直角三角形", "先证明相似", "先求周长"],
    correctOption: 0,
    keyPoint: "垂直优先转成直角结构",
    correctionCommand: "见垂直想直角",
  },
  {
    id: "DL-4",
    cause: "draw_line",
    stem: "你想补一条线时，第一判断标准应是？",
    answerPrompt: "选“目的性”最强的一项",
    options: ["这条线能推进全等/相似", "画起来顺手", "图上空位大"],
    correctOption: 0,
    keyPoint: "补线要服务证明目标",
    correctionCommand: "补线先问用途",
  },
  {
    id: "DL-5",
    cause: "draw_line",
    stem: "同一题有两条候选辅助线，先选哪条？",
    answerPrompt: "选推理链更短的",
    options: ["步骤更短那条", "线段更长那条", "看起来更对称那条"],
    correctOption: 0,
    keyPoint: "先选最短可证路径",
    correctionCommand: "先短链后细化",
  },
  {
    id: "DL-6",
    cause: "draw_line",
    stem: "补线卡住时，最有效的重启动作是？",
    answerPrompt: "选可执行动作",
    options: ["重读已知并圈关键点", "直接看答案", "换题"],
    correctOption: 0,
    keyPoint: "回到已知点重启比盲猜有效",
    correctionCommand: "卡住先圈已知",
  },
];

const CONDITION_RELATION_QUESTIONS: RetestQuestion[] = [
  {
    id: "CR-1",
    cause: "condition_relation",
    stem: "读题后第一步应做什么？",
    answerPrompt: "选最稳开局",
    options: ["按边/角/位置分组条件", "先写结论", "先计算数字"],
    correctOption: 0,
    keyPoint: "先分组条件可降复杂度",
    correctionCommand: "条件先分组",
  },
  {
    id: "CR-2",
    cause: "condition_relation",
    stem: "求证是角相等时，推荐推理方向是？",
    answerPrompt: "选更可控路径",
    options: ["从求证倒推到已知", "只从已知顺推", "先凭直觉写"],
    correctOption: 0,
    keyPoint: "倒推可快速发现缺口",
    correctionCommand: "求证倒着推",
  },
  {
    id: "CR-3",
    cause: "condition_relation",
    stem: "“AB=AC”最先联想到哪类信息？",
    answerPrompt: "选关联最强的",
    options: ["底角关系", "面积关系", "周长关系"],
    correctOption: 0,
    keyPoint: "等腰条件优先触发角关系",
    correctionCommand: "等边先想等角",
  },
  {
    id: "CR-4",
    cause: "condition_relation",
    stem: "有平行线时，下列哪种处理更对？",
    answerPrompt: "选先后顺序正确的一项",
    options: ["先写同位/内错角，再推进", "先跳到结论", "先套模板不看图"],
    correctOption: 0,
    keyPoint: "平行关系要先落到角结论",
    correctionCommand: "平行先落角",
  },
  {
    id: "CR-5",
    cause: "condition_relation",
    stem: "条件太多时，先保留哪类条件最关键？",
    answerPrompt: "选可直接推进目标的",
    options: ["能直接连到求证的条件", "最长那条文字", "最后一条条件"],
    correctOption: 0,
    keyPoint: "先抓主链条件",
    correctionCommand: "先主链后支线",
  },
  {
    id: "CR-6",
    cause: "condition_relation",
    stem: "推理中断时，最该补什么？",
    answerPrompt: "选最常缺失环节",
    options: ["过渡结论（因为-所以）", "新设未知", "复杂计算"],
    correctOption: 0,
    keyPoint: "断点通常缺过渡句",
    correctionCommand: "每步都写因为",
  },
];

const PROOF_WRITING_QUESTIONS: RetestQuestion[] = [
  {
    id: "PW-1",
    cause: "proof_writing",
    stem: "写证明最稳的起手是什么？",
    answerPrompt: "选可复用模板",
    options: ["先写“已知+目标句”", "先写结果", "先写感受"],
    correctOption: 0,
    keyPoint: "开头要明确已知与目标",
    correctionCommand: "先写目标句",
  },
  {
    id: "PW-2",
    cause: "proof_writing",
    stem: "“因为…所以…”里最不能缺的是？",
    answerPrompt: "选保证严谨性的",
    options: ["依据来源", "修辞词", "长句子"],
    correctOption: 0,
    keyPoint: "每句都要有依据",
    correctionCommand: "每句带依据",
  },
  {
    id: "PW-3",
    cause: "proof_writing",
    stem: "证明全等前应该先做什么？",
    answerPrompt: "选前置动作",
    options: ["列齐三条判定条件", "直接写“全等”", "先求数值"],
    correctOption: 0,
    keyPoint: "先列条件再下结论",
    correctionCommand: "全等先列条件",
  },
  {
    id: "PW-4",
    cause: "proof_writing",
    stem: "全等成立后下一步推荐？",
    answerPrompt: "选推进终点的一步",
    options: ["立刻提取可用对应结论", "回头重写题干", "停在全等结论"],
    correctOption: 0,
    keyPoint: "全等只是中转站",
    correctionCommand: "全等后立刻用",
  },
  {
    id: "PW-5",
    cause: "proof_writing",
    stem: "一行证明里更推荐哪种写法？",
    answerPrompt: "选最清晰可读的",
    options: ["一行一结论", "一行三结论", "一行不写依据"],
    correctOption: 0,
    keyPoint: "清晰比花哨更稳",
    correctionCommand: "一行只做一事",
  },
  {
    id: "PW-6",
    cause: "proof_writing",
    stem: "写到一半卡住，优先处理方式？",
    answerPrompt: "选可继续推进的",
    options: ["回到上一步补依据", "删除整段", "换一种语言描述"],
    correctOption: 0,
    keyPoint: "卡住多因上一步依据缺失",
    correctionCommand: "卡住先补依据",
  },
];

export const RETEST_PACKS: Record<RepairCause, RetestPack> = {
  draw_line: { cause: "draw_line", label: "画线想不到", questions: DRAW_LINE_QUESTIONS },
  condition_relation: {
    cause: "condition_relation",
    label: "条件关系乱",
    questions: CONDITION_RELATION_QUESTIONS,
  },
  proof_writing: { cause: "proof_writing", label: "证明写不出", questions: PROOF_WRITING_QUESTIONS },
};

export function getRetestPack(cause: RepairCause): RetestPack {
  return RETEST_PACKS[cause];
}

