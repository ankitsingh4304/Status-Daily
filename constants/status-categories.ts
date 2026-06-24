/** Category IDs — map to home.categories.{id} translation keys */
export type CategoryId =
  | 'all'
  | 'happy'
  | 'sad'
  | 'goodMorning'
  | 'goodNight'
  | 'friendship'
  | 'love'
  | 'motivational'
  | 'devotional'
  | 'festival'
  | 'shayari'
  | 'birthday'
  | 'anniversary'
  | 'attitude'
  | 'emotional';

export const CATEGORY_ICONS: Record<CategoryId, string> = {
  all: '✨',
  happy: '😊',
  sad: '😢',
  goodMorning: '🌅',
  goodNight: '🌙',
  friendship: '🤝',
  love: '❤️',
  motivational: '💪',
  devotional: '🙏',
  festival: '🎉',
  shayari: '✍️',
  birthday: '🎂',
  anniversary: '💍',
  attitude: '😎',
  emotional: '💫',
};

/** 2 compact scrollable rows for the home header (Crafto-style small bricks) */
export const CATEGORY_ROWS: CategoryId[][] = [
  ['all', 'happy', 'sad', 'goodMorning', 'goodNight', 'friendship', 'love', 'motivational'],
  ['devotional', 'festival', 'shayari', 'birthday', 'anniversary', 'attitude', 'emotional'],
];

/** Flat list of every category (for the "More" picker). */
export const ALL_CATEGORIES: CategoryId[] = CATEGORY_ROWS.flat();

/** Categories shown inline on the home header before the "More" button.
 *  Kept dense so each wrapped row fills out; the full set still lives in "More". */
export const PRIMARY_CATEGORIES: CategoryId[] = [
  'all',
  'happy',
  'love',
  'goodMorning',
  'motivational',
  'devotional',
  'festival',
  'shayari',
  'goodNight',
  'friendship',
  'birthday',
  'attitude',
];

export function categoryTranslationKey(id: CategoryId): string {
  return `home.categories.${id}`;
}
