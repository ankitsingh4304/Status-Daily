export type AppTheme = 'light' | 'dark' | 'gradient' | 'amoled';

export type Religion =
  | 'none'
  | 'hindu'
  | 'muslim'
  | 'christian'
  | 'sikh'
  | 'buddhist'
  | 'jain';

export const RELIGIONS: Religion[] = [
  'hindu',
  'muslim',
  'christian',
  'sikh',
  'buddhist',
  'jain',
  'none',
];

export const DEFAULT_RELIGION: Religion = 'none';

export type ProfileContentTab = 'statuses' | 'saved' | 'downloads' | 'favorites';

export type UserStats = {
  statusesCreated: number;
  downloads: number;
  likesReceived: number;
  shares: number;
  savedDesigns: number;
  streak: number;
};

export const DEFAULT_USER_STATS: UserStats = {
  statusesCreated: 24,
  downloads: 186,
  likesReceived: 1240,
  shares: 89,
  savedDesigns: 12,
  streak: 7,
};
