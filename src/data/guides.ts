export type GuideType = 'free' | 'premium';

export interface Guide {
  id: string;
  title: string;
  workflow: string;
  description: string;
  cover: string;
  pages: number;
  type: GuideType;
  tutorialUrl?: string;
  shopUrl?: string;
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
    tutorialUrl: '/tutorials/character-consistency-express-image-workflow/',
    shopUrl:
      'https://shop.pyrosaicreative.com/products/character-consistency-guide-express-image-workflow',
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
    tutorialUrl: 'https://youtu.be/8HaKm1e4NM4',
    shopUrl:
      'https://shop.pyrosaicreative.com/products/character-consistency-guide-express-video-workflow',
  },

  {
    id: 'google-flow-storyboard-studio',
    title: 'Storyboard Studio Guide',
    workflow: 'STORYBOARD STUDIO WORKFLOW',
    description:
      'Learn a complete AI filmmaking workflow in Google Flow, from story development and visual assets to storyboards, animation and a finished short film.',
    cover: '/images/ai-guides/google-flow-storyboard-studio-guide.png',
    pages: 15,
    type: 'free',
    tutorialUrl: 'https://youtu.be/OJZC40izHdc',
    shopUrl:
      'https://shop.pyrosaicreative.com/products/google-flow-storyboard-studio-guide',
  },

  {
    id: 'google-flow-music-ai-filmmaking',
    title: 'Google Flow Music Guide',
    workflow: 'AI FILMMAKING WORKFLOW',
    description:
      'Turn an existing script into cinematic images, video scenes, dialogue, consistent character voices, and a matching soundtrack with Google Flow Music.',
    cover: '/images/ai-guides/google-flow-music-ai-filmmaking-guide.png',
    pages: 16,
    type: 'free',
    tutorialUrl: 'https://youtu.be/-_omF8KmqUE',
    shopUrl:
      'https://shop.pyrosaicreative.com/products/google-flow-music-ai-filmmaking-guide',
  },
];