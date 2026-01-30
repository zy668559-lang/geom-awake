export type StepType = 'SELECT_TARGET' | 'CHOOSE_RULE' | 'CHOOSE_AUX';

export interface QuestionStep {
  index: number;
  type: StepType;
  prompt: string;
  options?: string[];
  correctActions: string[];
  wrongSignals: Record<string, string>;
  coachHints: Record<string, string>;
}

export interface Question {
  id: string;
  grade: number;
  model: string;
  type: 'CHECKUP' | 'TRAIN' | 'RETEST';
  svg: {
    points: { x: number, y: number, label: string }[];
    lines: { start: string, end: string }[];
  };
  interactiveType: string;
  steps: QuestionStep[];
}

export interface StepLog {
  questionId: string;
  stepIndex: number;
  action: string;
  isCorrect: boolean;
  timestamp: number;
  diagnosisTag?: string; // Derived from wrongSignals
}

// V1.0 New Data Structures

export interface DiagnosisTagLayers {
  breakStep: string; // e.g. "画线"
  signal: string;    // e.g. "中点"
  tool: string;      // e.g. "倍长中线"
  topic: string;     // e.g. "全等"
}

export interface RepairPack {
  id: string;
  tagCombination: DiagnosisTagLayers;
  mantra: string;          // 觉醒口令
  why: string;             // 为什么这么做
  thinkingTemplate: string[]; // 思维模板 (3-5 sentences)
  modelDemo: {
    title: string;
    description: string;
    imageUrl?: string; // Static fallback
    steps?: { // For ModelPlayer
        imageUrl: string; // or svg content
        description: string;
        mantraKeyword: string; // Highlighted keyword
    }[];
  };
  example: Question;       // 例题
  microPractice: Question[]; // 微练5题
  variation: Question[];   // 变式题
  deep: Question[];        // 深度题
  retest1: Question[];     // 即时复检
  retest2: Question[];     // 隔天复检
}

export interface UserPersona {
    grade: number;
    weakTags: DiagnosisTagLayers[];
    recentErrors: string[];
    completedRepairPacks: string[];
    retestResults: Record<string, number>; // packId -> score
}

