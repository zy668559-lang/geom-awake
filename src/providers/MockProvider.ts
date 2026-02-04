import { IQuestionProvider, Question, Attempt } from './IQuestionProvider';
import g7Data from '@/data/questions_g7.json';
import g8Data from '@/data/questions_g8.json';
import g9Data from '@/data/questions_g9.json';

const allQuestions: Record<number, Question[]> = {
  7: g7Data as Question[],
  8: g8Data as Question[],
  9: g9Data as Question[],
};

let attemptsStore: Attempt[] = [];

export class MockProvider implements IQuestionProvider {
  async getQuestions({ grade, tags, n = 5 }: { grade: number; tags?: string[]; n?: number }): Promise<Question[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const questions = allQuestions[grade] || [];

    let filtered = questions;
    if (tags && tags.length > 0) {
      filtered = questions.filter(q =>
        // Match if question has ANY of the requested tags
        tags.some(t => q.tags.includes(t))
      );
    }

    // Randomize
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  async getNextQuestion({ grade, previousLogs }: { grade: number; previousLogs: any[] }): Promise<Question | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const questions = allQuestions[grade] || [];

    // Terminate after 3 questions (MVP)
    if (previousLogs.length >= 3) {
      return null;
    }

    // Question 1: Medium difficulty, standard model question
    if (previousLogs.length === 0) {
      const mediumQuestions = questions.filter(q =>
        q.tags.some(tag => ['模型选不出', '角关系乱'].includes(tag))
      );
      const shuffled = [...mediumQuestions].sort(() => 0.5 - Math.random());
      return shuffled[0] || questions[0];
    }

    const lastLog = previousLogs[previousLogs.length - 1];

    // Question 2-3: Adaptive branching
    if (lastLog.isCorrect) {
      // CORRECT -> Harder question (advanced model or variant)
      const hardQuestions = questions.filter(q =>
        q.tags.some(tag => ['画线想不到', '理由写不出', '步骤算断'].includes(tag))
      );
      const shuffled = [...hardQuestions].sort(() => 0.5 - Math.random());
      return shuffled[0] || questions[Math.floor(Math.random() * questions.length)];
    } else {
      // WRONG -> Easier question (foundational property)
      const easyQuestions = questions.filter(q =>
        q.tags.some(tag => ['条件看不出'].includes(tag))
      );
      const shuffled = [...easyQuestions].sort(() => 0.5 - Math.random());
      return shuffled[0] || questions[Math.floor(Math.random() * questions.length)];
    }
  }

  async submitAttempt(attempt: Omit<Attempt, 'timestamp'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newAttempt = {
      ...attempt,
      timestamp: Date.now(),
    };
    attemptsStore.push(newAttempt);
    console.log(`[MockProvider] Attempt recorded:`, newAttempt);
  }

  async getAttempts({ userId, stage }: { userId: string; stage?: string }): Promise<Attempt[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return attemptsStore.filter(a =>
      a.userId === userId && (!stage || a.stage === stage)
    );
  }
}

// Singleton instance
export const mockProvider = new MockProvider();

