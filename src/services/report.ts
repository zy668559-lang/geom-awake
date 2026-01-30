import { Attempt } from '@/src/providers/IQuestionProvider';

export interface ReportSummary {
  topWeakTag: string;
  stageAccuracy: Record<string, string>; // e.g. "80%"
  totalTime: string; // e.g. "12m 30s"
  retryCount: number; // Wrong answers count
  prescription: string;
}

export function generateReport(attempts: Attempt[]): ReportSummary {
  if (attempts.length === 0) {
    return {
      topWeakTag: "无数据",
      stageAccuracy: {},
      totalTime: "0s",
      retryCount: 0,
      prescription: "请先完成训练。"
    };
  }

  // 1. Top Weak Tag (Tag with most wrong attempts)
  const tagCounts: Record<string, { total: number, wrong: number }> = {};
  attempts.forEach(a => {
    a.tags.forEach(t => {
      if (!tagCounts[t]) tagCounts[t] = { total: 0, wrong: 0 };
      tagCounts[t].total++;
      if (!a.isCorrect) tagCounts[t].wrong++;
    });
  });

  let topWeakTag = "暂无明显短板";
  let maxWrongRate = -1;

  Object.entries(tagCounts).forEach(([tag, stats]) => {
      if (stats.total < 1) return; // Ignore rare tags
      const wrongRate = stats.wrong / stats.total;
      if (wrongRate > maxWrongRate) {
          maxWrongRate = wrongRate;
          topWeakTag = tag;
      }
  });

  // 2. Stage Accuracy
  const stages = ['EXAMPLE', 'MICRO', 'VARIATION', 'DEEP', 'RETEST', 'RETEST_2'];
  const stageStats: Record<string, { correct: number, total: number }> = {};
  
  attempts.forEach(a => {
      if (!stageStats[a.stage]) stageStats[a.stage] = { correct: 0, total: 0 };
      stageStats[a.stage].total++;
      if (a.isCorrect) stageStats[a.stage].correct++;
  });

  const stageAccuracy: Record<string, string> = {};
  stages.forEach(s => {
      const stats = stageStats[s];
      if (stats) {
          const pct = Math.round((stats.correct / stats.total) * 100);
          stageAccuracy[s] = `${pct}%`;
      } else {
          stageAccuracy[s] = "-";
      }
  });

  // 3. Total Time
  const totalSeconds = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const totalTime = `${minutes}分${seconds}秒`;

  // 4. Retry Count (Total wrong answers)
  const retryCount = attempts.filter(a => !a.isCorrect).length;

  // 5. Prescription
  let prescription = "表现完美，建议直接挑战下一难度！";
  if (retryCount > 5) {
      prescription = `你在【${topWeakTag}】上似乎有些卡顿，建议回看思维模板，多做几道变式题巩固。`;
  } else if (retryCount > 0) {
      prescription = "整体表现不错，注意细节，避免粗心丢分。";
  }

  return {
    topWeakTag,
    stageAccuracy,
    totalTime,
    retryCount,
    prescription
  };
}
