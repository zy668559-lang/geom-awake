
import { v4 as uuidv4 } from 'uuid';
import { Point, Line } from './geometry-models';

export type ModelId = 
  | 'PARALLEL_ANGLE' 
  | 'CONGRUENT' 
  | 'SIMILAR' 
  | 'MIDLINE' 
  | 'HALF_ANGLE' 
  | 'CIRCLE';

export type StepType = 'SELECT_TARGET' | 'CHOOSE_RULE' | 'CHOOSE_AUX';

export interface QuestionStep {
  type: StepType;
  prompt: string;
  options?: string[]; // For CHOOSE_RULE or CHOOSE_AUX
  answer: string | string[]; // Correct answer(s). For SELECT_TARGET, it's point labels or line ids (not implemented yet, let's say labels)
}

export interface StepLog {
  stepIndex: number;
  questionId: string;
  action: string; // What they clicked/selected
  isCorrect: boolean;
  timestamp: number;
}

export interface Question {
  id: string;
  modelId: ModelId;
  title: string;
  imageUrl: string; // Placeholder or local path
  points: Point[];
  lines: Line[];
  steps: QuestionStep[];
  type: 'CHECKUP' | 'TRAIN' | 'RETEST';
}

// Geometry Generators (Simplified for MVP)
const generateGeometry = (modelId: ModelId): { points: Point[], lines: Line[] } => {
  // Default fallback (Square)
  let points: Point[] = [
    { x: 100, y: 100, label: 'A' },
    { x: 200, y: 100, label: 'B' },
    { x: 200, y: 200, label: 'C' },
    { x: 100, y: 200, label: 'D' },
  ];
  let lines: Line[] = [
    { start: 'A', end: 'B' },
    { start: 'B', end: 'C' },
    { start: 'C', end: 'D' },
    { start: 'D', end: 'A' },
  ];

  if (modelId === 'PARALLEL_ANGLE') {
    points = [
      { x: 50, y: 100, label: 'A' }, { x: 250, y: 100, label: 'B' },
      { x: 50, y: 200, label: 'C' }, { x: 250, y: 200, label: 'D' },
      { x: 100, y: 50, label: 'E' }, { x: 200, y: 250, label: 'F' }
    ];
    lines = [
      { start: 'A', end: 'B' }, { start: 'C', end: 'D' },
      { start: 'E', end: 'F' }
    ];
  } else if (modelId === 'CONGRUENT') {
    // Hand in Hand
    points = [
      { x: 150, y: 150, label: 'C' },
      { x: 100, y: 80, label: 'A' }, { x: 60, y: 180, label: 'B' },
      { x: 200, y: 90, label: 'D' }, { x: 240, y: 190, label: 'E' }
    ];
    lines = [
      { start: 'A', end: 'C' }, { start: 'B', end: 'C' }, { start: 'A', end: 'B' },
      { start: 'D', end: 'C' }, { start: 'E', end: 'C' }, { start: 'D', end: 'E' }
    ];
  } else if (modelId === 'SIMILAR') {
    // K-Model
    points = [
       { x: 50, y: 200, label: "B" },
       { x: 150, y: 200, label: "C" },
       { x: 250, y: 200, label: "D" },
       { x: 50, y: 100, label: "A" },
       { x: 250, y: 120, label: "E" }
    ];
    lines = [
       { start: "B", end: "D" }, { start: "A", end: "B" }, { start: "E", end: "D" },
       { start: "A", end: "C" }, { start: "C", end: "E" }
    ];
  } else if (modelId === 'MIDLINE') {
    points = [
      { x: 150, y: 50, label: 'A' }, { x: 50, y: 250, label: 'B' }, { x: 250, y: 250, label: 'C' },
      { x: 100, y: 150, label: 'D' }, { x: 200, y: 150, label: 'E' }
    ];
    lines = [
      { start: 'A', end: 'B' }, { start: 'B', end: 'C' }, { start: 'C', end: 'A' },
      { start: 'D', end: 'E' }
    ];
  } else if (modelId === 'HALF_ANGLE') {
     points = [
       { x: 50, y: 50, label: 'A' }, { x: 50, y: 250, label: 'B' }, { x: 250, y: 250, label: 'C' }, { x: 250, y: 50, label: 'D' },
       { x: 150, y: 150, label: 'E' } // Just a center point for visual
     ];
     lines = [
       { start: 'A', end: 'B' }, { start: 'B', end: 'C' }, { start: 'C', end: 'D' }, { start: 'D', end: 'A' },
       { start: 'B', end: 'D' }
     ];
  } else if (modelId === 'CIRCLE') {
    // Basic inscribed angle
    points = [
      { x: 150, y: 150, label: 'O' },
      { x: 150, y: 50, label: 'A' }, { x: 250, y: 150, label: 'B' }, { x: 50, y: 150, label: 'C' },
      { x: 200, y: 236, label: 'P' }
    ];
    lines = [
      { start: 'A', end: 'B' }, { start: 'B', end: 'C' }, { start: 'C', end: 'A' },
      { start: 'P', end: 'A' }, { start: 'P', end: 'B' }
    ];
  }

  return { points, lines };
};

// Helper to generate a dummy question
const createQuestion = (
  modelId: ModelId, 
  type: 'CHECKUP' | 'TRAIN' | 'RETEST', 
  index: number
): Question => {
  const { points, lines } = generateGeometry(modelId);
  
  const steps: QuestionStep[] = [
    {
      type: 'SELECT_TARGET',
      prompt: '请在图中找出关键的已知条件（点击图中元素）',
      answer: [points[0].label] // Dummy answer: first point
    },
    {
      type: 'CHOOSE_AUX',
      prompt: '观察图形，是否需要做辅助线？',
      options: ['不需要', '连接两点', '延长某线', '作平行线'],
      answer: '不需要'
    },
    {
      type: 'CHOOSE_RULE',
      prompt: '根据已知条件，下一步可以使用什么定理？',
      options: ['全等三角形判定', '相似三角形判定', '平行线性质', '勾股定理'],
      answer: '全等三角形判定'
    }
  ];

  return {
    id: uuidv4(),
    modelId,
    title: `${modelId} - ${type === 'CHECKUP' ? '体检题' : type === 'TRAIN' ? '训练题' : '复检题'} ${index + 1}`,
    imageUrl: `/questions/${modelId.toLowerCase()}_${type.toLowerCase()}_${index + 1}.png`,
    points,
    lines,
    steps,
    type
  };
};

export const MODEL_IDS: ModelId[] = [
  'PARALLEL_ANGLE', 
  'CONGRUENT', 
  'SIMILAR', 
  'MIDLINE', 
  'HALF_ANGLE', 
  'CIRCLE'
];

export const generateQuestions = (): Question[] => {
  const questions: Question[] = [];

  MODEL_IDS.forEach(modelId => {
    // 3 Checkup questions
    for (let i = 0; i < 3; i++) {
      questions.push(createQuestion(modelId, 'CHECKUP', i));
    }
    // 3 Train questions
    for (let i = 0; i < 3; i++) {
      questions.push(createQuestion(modelId, 'TRAIN', i));
    }
    // 1 Retest question (Ghost)
    questions.push(createQuestion(modelId, 'RETEST', 0));
  });

  return questions;
};

export const QUESTION_BANK = generateQuestions();

export const getQuestionsByModel = (modelId: ModelId, type: 'CHECKUP' | 'TRAIN' | 'RETEST') => {
  return QUESTION_BANK.filter(q => q.modelId === modelId && q.type === type);
};

export const getAllCheckupQuestions = () => {
  // Return one from each of the first 3 models
  return [
    QUESTION_BANK.find(q => q.modelId === 'PARALLEL_ANGLE' && q.type === 'CHECKUP')!,
    QUESTION_BANK.find(q => q.modelId === 'CONGRUENT' && q.type === 'CHECKUP')!,
    QUESTION_BANK.find(q => q.modelId === 'SIMILAR' && q.type === 'CHECKUP')!
  ];
};

export const getRetestQuestion = (modelId: ModelId): Question | undefined => {
  return QUESTION_BANK.find(q => q.modelId === modelId && q.type === 'RETEST');
};
