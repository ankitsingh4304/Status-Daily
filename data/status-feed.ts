import type { CategoryId } from '@/constants/status-categories';

export type StatusMediaType = 'gradient' | 'image' | 'video';

export type StatusItem = {
  id: string;
  title: string;
  subtitle?: string;
  categories: CategoryId[];
  gradient: [string, string, string?];
  mediaUrl?: string;
  mediaType: StatusMediaType;
  views: number;
  likes: number;
};

export const STATUS_FEED: StatusItem[] = [
  {
    id: '1',
    title: 'Shubh Mangalvar',
    subtitle: 'Start your day with blessings',
    categories: ['devotional', 'goodMorning'],
    gradient: ['#3D1515', '#8B3A2A', '#C4784A'],
    mediaUrl:
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 12400,
    likes: 4800,
  },
  {
    id: '2',
    title: 'Jai Shri Ram',
    subtitle: 'Faith • Devotion • Peace',
    categories: ['devotional', 'motivational'],
    gradient: ['#4A3520', '#9A7B3C', '#D4B87A'],
    mediaUrl:
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74203?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 10900,
    likes: 4300,
  },
  {
    id: '3',
    title: 'Good Morning Sunshine',
    categories: ['happy', 'goodMorning'],
    gradient: ['#FF7A00', '#FF4D6D'],
    mediaUrl:
      'https://images.unsplash.com/photo-1470252649378-9c297eb40af9?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 8200,
    likes: 2100,
  },
  {
    id: '4',
    title: 'Friendship Forever',
    categories: ['friendship', 'happy'],
    gradient: ['#1A1033', '#7B61FF', '#FF4D6D'],
    mediaUrl:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 5600,
    likes: 1900,
  },
  {
    id: '5',
    title: 'Good Night Dreams',
    categories: ['goodNight', 'emotional'],
    gradient: ['#0D0D1A', '#1A1033', '#2D1B4E'],
    mediaUrl:
      'https://images.unsplash.com/photo-1419242902214-272b403f7b38?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 7100,
    likes: 2800,
  },
  {
    id: '6',
    title: 'Love You Always',
    categories: ['love', 'emotional'],
    gradient: ['#FF4D6D', '#7B61FF'],
    mediaUrl:
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 15200,
    likes: 6200,
  },
  {
    id: '7',
    title: 'Stay Strong',
    categories: ['motivational', 'attitude'],
    gradient: ['#001A2E', '#FF7A00'],
    mediaType: 'gradient',
    views: 9400,
    likes: 3100,
  },
  {
    id: '8',
    title: 'Festival of Lights',
    categories: ['festival', 'happy'],
    gradient: ['#2D1800', '#FF7A00', '#FFD700'],
    mediaUrl:
      'https://images.unsplash.com/photo-1605647540934-5dc7f3e71102?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image',
    views: 20100,
    likes: 8900,
  },
  {
    id: '9',
    title: 'Happy Birthday',
    categories: ['birthday', 'happy'],
    gradient: ['#FF4D6D', '#FF7A00', '#7B61FF'],
    mediaType: 'gradient',
    views: 4300,
    likes: 1200,
  },
  {
    id: '10',
    title: 'Shayari Dil Se',
    categories: ['shayari', 'sad', 'emotional'],
    gradient: ['#1A0A14', '#4A2040', '#8B4060'],
    mediaType: 'gradient',
    views: 11800,
    likes: 5400,
  },
  {
    id: '11',
    title: 'Anniversary Love',
    categories: ['anniversary', 'love'],
    gradient: ['#2D0022', '#FF4D6D'],
    mediaType: 'gradient',
    views: 3900,
    likes: 980,
  },
  {
    id: '12',
    title: 'Ocean Calm',
    subtitle: 'Peaceful waves • full video reel',
    mediaUrl:
      'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    categories: ['sad', 'emotional'],
    gradient: ['#001A2E', '#003D5C'],
    mediaType: 'video',
    views: 6700,
    likes: 2200,
  },
];

export function filterByCategory(items: StatusItem[], category: CategoryId): StatusItem[] {
  if (category === 'all') return items;
  return items.filter((i) => i.categories.includes(category));
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
