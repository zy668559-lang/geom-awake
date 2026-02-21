import { RepairCause } from "@/data/training/repair_7days";

export type Retest6QQuestion = {
  id: string;
  cause: RepairCause;
  stem: string;
  options: string[];
  correctOption: number;
  wrongReason: string;
};

export type Retest6QPack = {
  cause: RepairCause;
  label: string;
  questions: Retest6QQuestion[];
};

const DRAW_LINE_QUESTIONS: Retest6QQuestion[] = [
  {
    id: "DL-1",
    cause: "draw_line",
    stem: "已知三角形中有中点 M，最先考虑的辅助线是什么？",
    options: ["连 M 到对顶点", "先设未知数", "先列方程"],
    correctOption: 0,
    wrongReason: "你把“中点触发连线”漏掉了，开局入口没抓住。",
  },
  {
    id: "DL-2",
    cause: "draw_line",
    stem: "题干有“平行”条件，补线前先做什么？",
    options: ["先写角关系", "直接连任意线", "先代数运算"],
    correctOption: 0,
    wrongReason: "平行先出角关系是主线，直接连线容易走偏。",
  },
  {
    id: "DL-3",
    cause: "draw_line",
    stem: "出现垂直条件时，辅助线优先目标是？",
    options: ["构成直角三角形", "先证明相似", "先求周长"],
    correctOption: 0,
    wrongReason: "垂直没先转成直角结构，后续推理就会断掉。",
  },
  {
    id: "DL-4",
    cause: "draw_line",
    stem: "你想补一条线时，第一判断标准应是？",
    options: ["这条线能推进全等/相似", "画起来顺手", "图上空位大"],
    correctOption: 0,
    wrongReason: "补线目的感不足，容易陷入“看着顺手就画”。",
  },
  {
    id: "DL-5",
    cause: "draw_line",
    stem: "同一题有两条候选辅助线，先选哪条？",
    options: ["步骤更短那条", "线段更长那条", "看起来更对称那条"],
    correctOption: 0,
    wrongReason: "没有优先短路径，证明链会被拉长。",
  },
  {
    id: "DL-6",
    cause: "draw_line",
    stem: "补线卡住时，最有效的重启动作是？",
    options: ["重读已知并圈关键点", "直接看答案", "换题"],
    correctOption: 0,
    wrongReason: "卡住时没回到已知条件，重启动作不对。",
  },
];

const CONDITION_RELATION_QUESTIONS: Retest6QQuestion[] = [
  {
    id: "CR-1",
    cause: "condition_relation",
    stem: "读题后第一步应做什么？",
    options: ["按边/角/位置分组条件", "先写结论", "先计算数字"],
    correctOption: 0,
    wrongReason: "条件没分组，信息堆在一起就会乱。",
  },
  {
    id: "CR-2",
    cause: "condition_relation",
    stem: "求证是角相等时，推荐推理方向是？",
    options: ["从求证倒推到已知", "只从已知顺推", "先凭直觉写"],
    correctOption: 0,
    wrongReason: "你没有倒推，关键缺口不容易暴露出来。",
  },
  {
    id: "CR-3",
    cause: "condition_relation",
    stem: "“AB=AC”最先联想到哪类信息？",
    options: ["底角关系", "面积关系", "周长关系"],
    correctOption: 0,
    wrongReason: "等腰条件没转成角关系，主线关联断掉了。",
  },
  {
    id: "CR-4",
    cause: "condition_relation",
    stem: "有平行线时，下列哪种处理更对？",
    options: ["先写同位/内错角，再推进", "先跳到结论", "先套模板不看图"],
    correctOption: 0,
    wrongReason: "平行条件没先落到角，属于典型关系跳步。",
  },
  {
    id: "CR-5",
    cause: "condition_relation",
    stem: "条件太多时，先保留哪类条件最关键？",
    options: ["能直接连到求证的条件", "最长那条文字", "最后一条条件"],
    correctOption: 0,
    wrongReason: "主链条件筛选不准，后面越写越散。",
  },
  {
    id: "CR-6",
    cause: "condition_relation",
    stem: "推理中断时，最该补什么？",
    options: ["过渡结论（因为-所以）", "新设未知", "复杂计算"],
    correctOption: 0,
    wrongReason: "缺少过渡句，关系链在中段断掉。",
  },
];

const PROOF_WRITING_QUESTIONS: Retest6QQuestion[] = [
  {
    id: "PW-1",
    cause: "proof_writing",
    stem: "写证明最稳的起手是什么？",
    options: ["先写“已知+目标句”", "先写结果", "先写感受"],
    correctOption: 0,
    wrongReason: "开头没有“已知+目标”，证明容易失焦。",
  },
  {
    id: "PW-2",
    cause: "proof_writing",
    stem: "“因为…所以…”里最不能缺的是？",
    options: ["依据来源", "修辞词", "长句子"],
    correctOption: 0,
    wrongReason: "依据没写清，句子看起来对但不成立。",
  },
  {
    id: "PW-3",
    cause: "proof_writing",
    stem: "证明全等前应该先做什么？",
    options: ["列齐三条判定条件", "直接写“全等”", "先求数值"],
    correctOption: 0,
    wrongReason: "没先列条件就下结论，属于典型跳证。",
  },
  {
    id: "PW-4",
    cause: "proof_writing",
    stem: "全等成立后下一步推荐？",
    options: ["立刻提取可用对应结论", "回头重写题干", "停在全等结论"],
    correctOption: 0,
    wrongReason: "全等后没有继续推进，证明停在半路。",
  },
  {
    id: "PW-5",
    cause: "proof_writing",
    stem: "一行证明里更推荐哪种写法？",
    options: ["一行一结论", "一行三结论", "一行不写依据"],
    correctOption: 0,
    wrongReason: "一行塞太多结论会让逻辑读不清。",
  },
  {
    id: "PW-6",
    cause: "proof_writing",
    stem: "写到一半卡住，优先处理方式？",
    options: ["回到上一步补依据", "删除整段", "换一种语言描述"],
    correctOption: 0,
    wrongReason: "卡住通常是上一步依据缺失，不是重写就能解决。",
  },
];

export const RETEST_6Q_PACKS: Record<RepairCause, Retest6QPack> = {
  draw_line: { cause: "draw_line", label: "画线想不到", questions: DRAW_LINE_QUESTIONS },
  condition_relation: {
    cause: "condition_relation",
    label: "条件关系乱",
    questions: CONDITION_RELATION_QUESTIONS,
  },
  proof_writing: { cause: "proof_writing", label: "证明写不出", questions: PROOF_WRITING_QUESTIONS },
};

export function getRetest6QPack(cause: RepairCause): Retest6QPack {
  return RETEST_6Q_PACKS[cause];
}

