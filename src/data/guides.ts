export type GuideType = 'free' | 'premium';

export interface Guide {
  id: string;
  title: string;
  workflow: string;
  description: string;
  cover: string;
  pages: number;
  type: GuideType;
  storagePath?: string;
}

export const guides: Guide[] = [
  {
    id: 'character-consistency-express',
    title: 'Character Consistency Guide',
    workflow: 'EXPRESS WORKFLOW',
    description:
      'Create highly consistent AI characters from a single image for images, videos and filmmaking.',
    cover: '/images/ai-guides/character-consistency-express-workflow-guide.png',
    pages: 23,
    type: 'free',
    storagePath: 'character-consistency-express-workflow-guide.pdf',
  },
];