export interface Tutorial {
  title: string;
  slug: string;
  description: string;

  thumbnail: string;
  badge: 'FREE' | 'PREMIUM';

  category: 'AI Filmmaking' | 'AI Characters' | 'AI Worlds' | 'AI Workflows';

  youtubeId: string;
  uploadDate: string;

  guideId: string;

  guide: {
    title: string;
    file: string;
  };

  whatYoullLearn: {
    title: string;
    description: string;
  }[];
}

export const tutorials: Tutorial[] = [
  {
    title:
      'ONE Prompt → Character Reference Sheet → Consistent AI Characters (Free Guide)',

    slug: 'character-consistency-express-image-workflow',

    description:
  'Learn how to create a Character Reference Sheet from a single image and use it to maintain consistent AI character identity across images and videos.',

    thumbnail:
      '/images/tutorials/character-consistency-express-image-workflow.png',

    badge: 'FREE',

    category: 'AI Characters',

    youtubeId: 'wV-SNlnsONI',
    uploadDate: '2026-08-15',

    guideId: 'character-consistency-express',

    guide: {
      title: 'Character Consistency Guide — Express Workflow',
      file: '/guides/character-consistency-guide-express-workflow.pdf',
    },

    whatYoullLearn: [
      {
        title: 'Create a strong character reference',
        description:
          'Build a reliable visual foundation that clearly defines your AI character.',
      },
      {
        title: 'Preserve identity across images',
        description:
          "Maintain the character's key facial and visual features when creating new images.",
      },
      {
        title: 'Create new poses and scenes',
        description:
          'Generate new images while keeping the same character identity.',
      },
      {
        title: 'Build a repeatable workflow',
        description:
          'Turn character consistency into a repeatable part of your AI filmmaking workflow.',
      },
    ],
  },

  {
    title:
      'How to Make AI Videos with Consistent Characters in 2026 (Free Guide)',

    slug: 'character-consistency-express-video-workflow',

    description:
  'Learn how to create consistent AI videos using character and environment reference sheets, cinematic start frames and a reliable animation workflow.',

    thumbnail:
      '/images/tutorials/character-consistency-express-video-workflow.png',

    badge: 'FREE',

    category: 'AI Characters',

    youtubeId: '8HaKm1e4NM4',
    uploadDate: '2026-09-02',

    guideId: 'character-consistency-express-video',

    guide: {
      title: 'Character Consistency Guide — Express Video Workflow',
      file: '/guides/character-consistency-express-video-workflow-guide.pdf',
    },

    whatYoullLearn: [
      {
        title: 'Adapt your character for video',
        description:
          'Adapt your character’s look, outfit, hairstyle and makeup while preserving their identity.',
      },
      {
        title: 'Build consistent environments',
        description:
          'Create an Environment Reference Sheet to maintain location consistency across your shots.',
      },
      {
        title: 'Create cinematic Start Frames',
        description:
          'Build strong visual starting points using your character and environment references.',
      },
      {
        title: 'Generate consistent AI video',
        description:
          'Turn your Start Frame image into a production-ready video while maintaining consistency across camera movement, multiple characters, dialogue and transformations.',
      },
    ],
  },
];