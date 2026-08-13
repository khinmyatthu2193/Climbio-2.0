export type PromptStatus = 'DRAFT' | 'PUBLISHED';

export interface PromptCategory { id: string; name: string; icon: string | null; description: string | null; isActive: boolean; _count?: { prompts: number } }
export interface AIPrompt { id: string; title: string; categoryId: string; category: PromptCategory; content: string; aiTools: string[]; exampleImageUrl: string | null; status: PromptStatus; usageCount: number; createdAt: string; updatedAt: string }
export type PromptInput = Pick<AIPrompt, 'title' | 'categoryId' | 'content' | 'aiTools' | 'status'> & { exampleImageUrl?: string | null };
