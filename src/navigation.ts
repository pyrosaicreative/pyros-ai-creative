import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'Why AI Filmmaking',
      href: getPermalink('/why-ai-filmmaking'),
    },
    {
      text: 'Tutorials',
      href: getPermalink('/tutorials'),
    },
    {
  text: 'Prompt Packs',
  href: getPermalink('/prompt-packs'),
},
  ],
};
