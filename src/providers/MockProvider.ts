import { IQuestionProvider, Question, Attempt } from './IQuestionProvider';
import g7Data from '@/data/questions_g7.json';
import g8Data from '@/data/questions_g8.json';
import g9Data from '@/data/questions_g9.json';

// Simple in-memory storage for MVP
// In a real app with server actions, this would need to be a singleton or DB
// For client-side demo, a global variable works if we don't refresh.
// If we refresh, we lose data. For MVP "run through", maybe acceptable.
// Better: use localStorage if running in browser, or just a global variable.
// Since this is a "Provider" that might run on server or client? 
// If it runs on server (Server Actions), global var persists per process.
// If client, per page load.
// The user asks for "MockProvider", likely to be used in client components or server actions.
// Given "submitAttempt" returns void, let's assume it's async.

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
