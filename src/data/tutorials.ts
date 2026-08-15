export interface Tutorial {
  title: string;
  slug: string;
  description: string;

  thumbnail: string;
  badge: 'FREE' | 'PREMIUM';

  category: 'AI Filmmaking' | 'AI Characters' | 'AI Worlds' | 'AI Workflows';

  youtubeId: string;
  uploadDate: string;

  guide: {
    title: string;
    file: string;
  };

  software: {
    name: string;
    url: string;
  }[];
}

export const tutorials: Tutorial[] = [
  {
  title: 'This ONE Prompt Fixes AI Character Consistency (Free Guide)',

  slug: 'character-consistency-express-image-workflow',

  description:
    'Learn how to create consistent AI characters quickly using a streamlined workflow with Google AI Studio, Nano Banana and Seedance.',

  thumbnail:
    '/images/tutorials/character-consistency-express-image-workflow.png',

  badge: 'FREE',

  category: 'AI Characters',

  youtubeId: 'wV-SNlnsONI',

  guide: {
    title: 'Character Consistency Guide — Express Workflow',
    file: '/guides/character-consistency-guide-express-workflow.pdf',
  },

  software: [
    {
      name: 'Google AI Studio',
      url: 'https://aistudio.google.com/',
    },
    {
      name: 'Nano Banana',
      url: 'https://aistudio.google.com/',
    },
    {
      name: 'Seedance',
      url: 'https://seedance.ai/',
    },
  ],
},
];