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
    workflow: 'EXPRESS IMAGE WORKFLOW',
    description:
      'Create a professional Character Reference Sheet from a single image and use it to create consistent AI images.',
    cover: '/images/ai-guides/character-consistency-express-image-workflow-guide.png',
    pages: 24,
    type: 'free',
    storagePath: 'character-consistency-express-image-workflow-guide.pdf',
  },
];