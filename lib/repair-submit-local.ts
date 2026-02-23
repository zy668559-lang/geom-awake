import type { RepairCause } from "@/data/training/repair_7days";

export type SubmitEvaluationInput = {
  cause: RepairCause;
  dayId: number;
  stuckPoint: string;
  content: string;
  hasDraftImage: boolean;
};

export type LocalSubmitResult = {
  score: number;
  passed: boolean;
  verdictTitle: string;
  coachTip: string;
  nextAction: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function contentSignal(content: string): number {
  const text = content.trim();
  if (!text) return 0;
  if (text.length < 8) return 8;
  if (text.length < 20) return 18;
  return 30;
}

function causeSignal(cause: RepairCause, content: string): number {
  const text = content.trim();
  if (!text) return 0;

  if (cause === "draw_line") {
    return /线|中点|垂直|平行/.test(text) ? 12 : 6;
  }

  if (cause === "condition_relation") {
    return /因为|所以|条件|推出/.test(text) ? 12 : 6;
  }

  return /证明|全等|已知|结论/.test(text) ? 12 : 6;
}

export function evaluateRepairSubmit(input: SubmitEvaluationInput): LocalSubmitResult {
  const daySignal = clamp(input.dayId, 1, 7) * 3;
  const imageSignal = input.hasDraftImage ? 20 : 0;
  const stuckSignal = input.stuckPoint.trim() ? 15 : 0;
  const base = 20;
  const score = clamp(
    base + daySignal + imageSignal + stuckSignal + contentSignal(input.content) + causeSignal(input.cause, input.content),
    0,
    100,
  );

  const passed = score >= 70;

  if (passed) {
    return {
      score,
      passed: true,
      verdictTitle: "这次提交通过",
      coachTip: "步骤有条理，继续按今天口令练下一题。",
      nextAction: "回到训练继续推进，Day7后进入复检。",
    };
  }

  return {
    score,
    passed: false,
    verdictTitle: "还差一点就到位",
    coachTip: "先把关键条件写成“因为...所以...”，再补一张草稿图会更稳。",
    nextAction: "先回训练补一轮，再去复检看命中率变化。",
  };
}
