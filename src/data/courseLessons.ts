export interface CourseLesson {
  number: string;
  title: string;
  videoId: string;
  thumbnail: string;
}

export const lessons: CourseLesson[] = [
  {
    number: '01',
    title: 'Introduction to Visual Storytelling',
    videoId: 'wZ0bl99-bXQ',
    thumbnail: '/images/tutorials/lesson1.png',
  },
  {
    number: '02',
    title: '9 Camera Shot Sizes and When to Use Them',
    videoId: 'ptiDRX7W7DY',
    thumbnail: '/images/tutorials/lesson2.png',
  },
];
