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
    {
    title:
      'Google Flow Storyboard Studio: From Idea to AI Short Film (Free Guide)',

    slug: 'google-flow-storyboard-studio',

    description:
      'Learn how to use Google Flow Storyboard Studio to develop a story, create characters, locations and props, build a storyboard, and turn your scenes into a complete AI short film.',

    thumbnail:
      '/images/tutorials/Storyboard-Studio.png',

    badge: 'FREE',

    category: 'AI Filmmaking',

    youtubeId: 'OJZC40izHdc',
    uploadDate: '2026-09-10',

    guideId: 'google-flow-storyboard-studio',

    guide: {
      title: 'Google Flow Storyboard Studio — The AI Filmmaking Guide',
      file: '/guides/google-flow-storyboard-studio-guide.pdf',
    },

    whatYoullLearn: [
      {
        title: 'Develop your short-film story',
        description:
          'Use Storyboard Studio to develop an original story and organize it into a three-act structure.',
      },
      {
        title: 'Build characters, locations and props',
        description:
          'Create and refine the visual assets needed to maintain a consistent visual foundation throughout your film.',
      },
      {
        title: 'Create and refine your storyboard',
        description:
          'Turn your story into scenes and storyboard frames, then refine them for stronger visual continuity.',
      },
      {
        title: 'Animate your scenes',
        description:
          'Use Agent Mode or Standard Mode to transform storyboard frames into cinematic AI video scenes.',
      },
      {
        title: 'Build the final AI short film',
        description:
          'Combine your generated scenes into a complete short film using a structured AI filmmaking workflow.',
      },
    ],
  },
    {
    title:
      'I Found Google’s Secret FREE AI Tool for Filmmakers (Free Guide)',

    slug: 'google-flow-music-ai-filmmaking',

    description:
      'Discover how to use Google Flow Music to turn an existing script into cinematic images, video scenes, dialogue, consistent character voices, and a matching soundtrack.',

    thumbnail:
      '/images/tutorials/google-flow-music-ai-filmmaking.png',

    badge: 'FREE',

    category: 'AI Filmmaking',

    youtubeId: '-_omF8KmqUE',
    uploadDate: '2026-09-26',

    guideId: 'google-flow-music-ai-filmmaking',

    guide: {
      title: 'Google Flow Music — AI Filmmaking Guide',
      file: '/guides/google-flow-music-ai-filmmaking-guide.pdf',
    },

    whatYoullLearn: [
      {
        title: 'Create cinematic environments',
        description:
          'Build cinematic environments from your existing script and control the model, aspect ratio and quality directly through your prompts.',
      },
      {
        title: 'Create consistent characters and scenes',
        description:
          'Use character and environment references to maintain visual continuity across your AI filmmaking workflow.',
      },
      {
        title: 'Generate cinematic video and dialogue',
        description:
          'Turn your images into video scenes, extend your sequences, and create dialogue scenes with consistent visual references.',
      },
      {
        title: 'Achieve consistent character voices',
        description:
          'Separate generated voices, replace them with consistent voices using ElevenLabs, and preserve the original sound effects.',
      },
      {
        title: 'Create a cinematic soundtrack',
        description:
          'Generate a soundtrack designed to match the scenes you created and bring the complete workflow together in your final edit.',
      },
    ],
  },
];