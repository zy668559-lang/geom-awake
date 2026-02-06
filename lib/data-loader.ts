import questionsData from '@/data/models.json';
import repairPacksData from '@/data/repair-packs.json';
import { Question, RepairPack } from './types';

// Cast the JSON to the Question type. 
// In a real app we might validate this with zod, but for now we trust the file.
const questions = questionsData as unknown as Question[];
const repairPacks = repairPacksData as unknown as RepairPack[];

export const getQuestions = (type: 'CHECKUP' | 'TRAIN' | 'RETEST'): Question[] => {
    return questions.filter(q => q.type === type);
};

export const getQuestionsByModel = (model: string, type: 'CHECKUP' | 'TRAIN' | 'RETEST'): Question[] => {
    return questions.filter(q => q.model === model && q.type === type);
}

export const getQuestionById = (id: string): Question | undefined => {
    return questions.find(q => q.id === id);
}

export const getAllModels = (): string[] => {
    return Array.from(new Set(questions.map(q => q.model)));
}

// Repair Pack Loaders
export const getRepairPackById = (id: string): RepairPack | undefined => {
    return repairPacks.find(p => p.id === id);
}

export const getRepairPackByTag = (tagSignal: string): RepairPack | undefined => {
    // Simplified matching for MVP: just match the signal
    return repairPacks.find(p => p.tagCombination.signal === tagSignal);
}

