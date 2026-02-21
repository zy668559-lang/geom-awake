export type RepairCause = "draw_line" | "condition_relation" | "proof_writing";

export type RepairDayContent = {
  day: number;
  title: string;
  command: string;
  microPractice: string[];
  reflectionPrompt: string;
  parentTip: string;
  // Compatibility fields for current page rendering.
  shortProblems: string[];
  reviewTemplate: string;
};

export type RepairCausePack = {
  cause: RepairCause;
  label: string;
  subtitle: string;
  days: RepairDayContent[];
};

export const REPAIR_CAUSE_OPTIONS: Array<{
  key: RepairCause;
  label: string;
  subtitle: string;
}> = [
  { key: "draw_line", label: "画线想不到", subtitle: "先训练辅助线触发感" },
  { key: "condition_relation", label: "条件关系乱", subtitle: "先整理条件关系图" },
  { key: "proof_writing", label: "证明写不出", subtitle: "先搭证明骨架句型" },
];

function makeDay(input: {
  day: number;
  title: string;
  command: string;
  microPractice: string[];
  reflectionPrompt: string;
  parentTip: string;
}): RepairDayContent {
  return {
    ...input,
    shortProblems: input.microPractice,
    reviewTemplate: input.reflectionPrompt,
  };
}

const DRAW_LINE_DAYS: RepairDayContent[] = [
  makeDay({
    day: 1,
    title: "看点连点",
    command: "先圈点，再连线",
    microPractice: [
      "题A：已知中点与平行，先写你会先连哪条线。",
      "题B：已知等腰三角形，写出你第一条辅助线选择。",
    ],
    reflectionPrompt: "我今天先找了___个关键点，再尝试连___条线。",
    parentTip: "先问孩子“你先看到哪个点”，不要急着给答案。",
  }),
  makeDay({
    day: 2,
    title: "垂直触发",
    command: "见垂直，想直角",
    microPractice: [
      "题A：出现垂直符号时，列出可构成的直角三角形。",
      "题B：没有直角符号但有垂直条件，写出可能辅助线。",
    ],
    reflectionPrompt: "我看到垂直后，先锁定了___个直角结构。",
    parentTip: "提醒孩子先口述“哪里是直角”，再动笔。",
  }),
  makeDay({
    day: 3,
    title: "中点触发",
    command: "见中点，想中线",
    microPractice: [
      "题A：题干给出中点，写出你会补哪条中线。",
      "题B：两个中点同时出现，写出你优先连接方案。",
    ],
    reflectionPrompt: "今天我遇到中点时，先补了___，理由是___。",
    parentTip: "陪孩子复述“中点常见连法”比刷题更关键。",
  }),
  makeDay({
    day: 4,
    title: "平行触发",
    command: "见平行，想角链",
    microPractice: [
      "题A：有平行线，先写同位角或内错角对应关系。",
      "题B：平行+中点，写出你会先补哪条线。",
    ],
    reflectionPrompt: "我先写了角关系___，再决定连线___。",
    parentTip: "让孩子先写角关系，避免“乱连线”。",
  }),
  makeDay({
    day: 5,
    title: "全等入口",
    command: "补线只为全等",
    microPractice: [
      "题A：给你三个条件，判断要补哪条线更易凑全等。",
      "题B：写出“补线后想证明哪两三角形全等”。",
    ],
    reflectionPrompt: "我补线的目标是证明___和___全等。",
    parentTip: "问孩子“你补这条线是为了什么”，逼出目标感。",
  }),
  makeDay({
    day: 6,
    title: "两步验证",
    command: "先假设，再验证",
    microPractice: [
      "题A：先写一个辅助线假设，再写验证路径。",
      "题B：对比两条候选辅助线，选更短路径的一条。",
    ],
    reflectionPrompt: "我先假设补___，验证后发现___。",
    parentTip: "允许孩子试错一条线，关键是复盘为什么错。",
  }),
  makeDay({
    day: 7,
    title: "整题联动",
    command: "一图一条主线",
    microPractice: [
      "题A：完整写出“看点-补线-证明”的三步流程。",
      "题B：给一道旧错题，重做并标注本周用到的触发词。",
    ],
    reflectionPrompt: "这周我最稳定的补线触发词是___。",
    parentTip: "让孩子讲一遍流程，比做新题更能固化方法。",
  }),
];

const CONDITION_RELATION_DAYS: RepairDayContent[] = [
  makeDay({
    day: 1,
    title: "条件分层",
    command: "条件先分组",
    microPractice: [
      "题A：把题干条件分成“边、角、位置”三组。",
      "题B：写出每组条件能推出的第一结论。",
    ],
    reflectionPrompt: "我把条件分成___组，先用了___组。",
    parentTip: "先让孩子分类条件，不要直接催着做证明。",
  }),
  makeDay({
    day: 2,
    title: "关系连线",
    command: "条件画关系图",
    microPractice: [
      "题A：把三个条件用箭头连接成关系图。",
      "题B：标出“可直接用”和“需转化后用”的条件。",
    ],
    reflectionPrompt: "我先连出___条关系箭头，再下笔。",
    parentTip: "看关系图是否清楚，比看答案对错更重要。",
  }),
  makeDay({
    day: 3,
    title: "已知到求证",
    command: "求证倒着推",
    microPractice: [
      "题A：从求证倒推两步，写出需要哪些条件。",
      "题B：匹配题干条件，看缺哪一步转换。",
    ],
    reflectionPrompt: "我从求证倒推到___，再回到已知。",
    parentTip: "多问“你要证明它，需要先有什么”。",
  }),
  makeDay({
    day: 4,
    title: "角边同步",
    command: "角边同时看",
    microPractice: [
      "题A：列出本题可用角关系与边关系各两条。",
      "题B：判断哪组角边能组合成全等入口。",
    ],
    reflectionPrompt: "我先配对了___组角边关系。",
    parentTip: "避免只盯角或只盯边，提醒双线并行。",
  }),
  makeDay({
    day: 5,
    title: "转换句训练",
    command: "每步都写因为",
    microPractice: [
      "题A：把口头推理改写成“因为…所以…”。",
      "题B：补全三条缺失的转换句。",
    ],
    reflectionPrompt: "我今天最关键的转换句是“因为___，所以___”。",
    parentTip: "让孩子读出“因为所以”句，防止跳步。",
  }),
  makeDay({
    day: 6,
    title: "错因回放",
    command: "先找断点",
    microPractice: [
      "题A：复盘旧错题，标出关系断裂位置。",
      "题B：给断裂位置补一条过渡结论。",
    ],
    reflectionPrompt: "我原来卡在___，今天补上了___。",
    parentTip: "先复盘断点，再谈提速。",
  }),
  makeDay({
    day: 7,
    title: "整链输出",
    command: "关系一口气说",
    microPractice: [
      "题A：按“条件-转换-结论”完整口述一题。",
      "题B：写一份三行版关系总图。",
    ],
    reflectionPrompt: "我现在能把关系链从___讲到___。",
    parentTip: "听孩子完整口述，检验是否真正理顺关系。",
  }),
];

const PROOF_WRITING_DAYS: RepairDayContent[] = [
  makeDay({
    day: 1,
    title: "句型起手",
    command: "先写结论句",
    microPractice: [
      "题A：把目标结论写成规范证明句。",
      "题B：把口语“所以相等”改成书面格式。",
    ],
    reflectionPrompt: "我先写了结论句___，再补前提。",
    parentTip: "先训练“会写句子”，再追求整题速度。",
  }),
  makeDay({
    day: 2,
    title: "三步骨架",
    command: "已知-推理-结论",
    microPractice: [
      "题A：把一段证明拆成三行骨架。",
      "题B：给出乱序句子，按证明顺序重排。",
    ],
    reflectionPrompt: "我今天按三步骨架写完了___段。",
    parentTip: "检查孩子是否每段都有“已知依据”。",
  }),
  makeDay({
    day: 3,
    title: "依据标注",
    command: "每句带依据",
    microPractice: [
      "题A：为三条结论补充对应依据。",
      "题B：删去无依据的一句并重写。",
    ],
    reflectionPrompt: "我给___句都补上了依据来源。",
    parentTip: "不要只看答案，重点看“依据是否完整”。",
  }),
  makeDay({
    day: 4,
    title: "全等模板",
    command: "全等先列条件",
    microPractice: [
      "题A：写出判定全等前要列的三条条件。",
      "题B：把“看起来一样”改写成严谨全等证明。",
    ],
    reflectionPrompt: "我先列___、___、___，再写全等。",
    parentTip: "提醒孩子先列条件，再写“所以全等”。",
  }),
  makeDay({
    day: 5,
    title: "结论落地",
    command: "全等后立刻用",
    microPractice: [
      "题A：全等后写出可直接得到的两个结论。",
      "题B：从全等结论中选一个推进终点。",
    ],
    reflectionPrompt: "我从全等里提取了___来推进终结论。",
    parentTip: "问孩子“全等证明完你马上要用什么”。",
  }),
  makeDay({
    day: 6,
    title: "改写精简",
    command: "一行只做一事",
    microPractice: [
      "题A：把冗长证明改成清晰短句。",
      "题B：把两件事写在一行的句子拆开。",
    ],
    reflectionPrompt: "我把___段证明精简成___行。",
    parentTip: "清晰优先于花哨，先做到一步一结论。",
  }),
  makeDay({
    day: 7,
    title: "完整成文",
    command: "按模板写完",
    microPractice: [
      "题A：独立写一题完整证明（占位题）。",
      "题B：给同题写“简版证明”与“标准版证明”各一份。",
    ],
    reflectionPrompt: "我现在写证明时最稳的模板是___。",
    parentTip: "让孩子读自己写的证明，检查是否顺畅。",
  }),
];

export const REPAIR_7DAY_PACKS: Record<RepairCause, RepairCausePack> = {
  draw_line: {
    cause: "draw_line",
    label: "画线想不到",
    subtitle: "先训练辅助线触发感",
    days: DRAW_LINE_DAYS,
  },
  condition_relation: {
    cause: "condition_relation",
    label: "条件关系乱",
    subtitle: "先整理条件关系图",
    days: CONDITION_RELATION_DAYS,
  },
  proof_writing: {
    cause: "proof_writing",
    label: "证明写不出",
    subtitle: "先搭证明骨架句型",
    days: PROOF_WRITING_DAYS,
  },
};

export function isRepairCause(value: string | null | undefined): value is RepairCause {
  return value === "draw_line" || value === "condition_relation" || value === "proof_writing";
}

export function getRepairPack(cause: string | null | undefined): RepairCausePack {
  if (isRepairCause(cause)) {
    return REPAIR_7DAY_PACKS[cause];
  }
  return REPAIR_7DAY_PACKS.draw_line;
}

