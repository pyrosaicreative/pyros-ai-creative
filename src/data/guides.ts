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
  tutorialUrl?: string;
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
    tutorialUrl: '/tutorials/character-consistency-express-image-workflow/',
  },

  {
  id: 'character-consistency-express-video',
  title: 'Character Consistency Guide',
  workflow: 'EXPRESS VIDEO WORKFLOW',
  description:
    'Take your Character Reference Sheet into AI video and create consistent characters across cinematic shots.',
  cover: '/images/ai-guides/character-consistency-express-video-workflow-guide.png',
  pages: 27,
  type: 'free',
  storagePath: 'character-consistency-express-video-workflow-guide.pdf',
  tutorialUrl: 'https://youtu.be/8HaKm1e4NM4',
},
];
