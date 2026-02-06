import { IQuestionProvider, Question, Attempt } from './IQuestionProvider';

let attemptsStore: Attempt[] = [];

export class MockProvider implements IQuestionProvider {
  async getQuestions({ tags, n = 5 }: { tags?: string[]; n?: number }): Promise<Question[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // After deleting JSON files, this will return empty or we could mock a generic set
    // But since we are moving to AI, we'll keep it minimal.
    return [];
  }

  async getNextQuestion({ previousLogs }: { previousLogs: any[] }): Promise<Question | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return null;
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

