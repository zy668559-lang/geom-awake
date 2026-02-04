export interface Question {
  id: string;
  grade: number;
  tags: string[];
  title: string;
  stem: string;
  figure?: string;
  question: string;
  answer?: string;
  solution_outline: string;
}

export interface Attempt {
  userId: string;
  questionId: string;
  stage: string; // 'DEMO' | 'TEMPLATE' | 'EXAMPLE' | 'MICRO' | 'VARIATION' | 'DEEP' | 'RETEST'
  isCorrect: boolean;
  timeSpent: number; // seconds
  tags: string[]; // Tags of the question
  timestamp: number;
}

export interface IQuestionProvider {
  getQuestions(params: { grade: number; tags?: string[]; n?: number }): Promise<Question[]>;
  getNextQuestion(params: { grade: number; previousLogs: any[] }): Promise<Question | null>;
  submitAttempt(attempt: Omit<Attempt, 'timestamp'>): Promise<void>;
  getAttempts(params: { userId: string; stage?: string }): Promise<Attempt[]>;
}

