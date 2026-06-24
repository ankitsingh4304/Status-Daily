import { STATUS_FEED, type StatusItem } from '@/data/status-feed';
import type { ProfileContentTab } from '@/types/profile';

export type ProfileContentItem = StatusItem & {
  createdAt: string;
  categoryLabel: string;
};

function withMeta(items: StatusItem[], startIndex: number): ProfileContentItem[] {
  return items.map((item, i) => ({
    ...item,
    createdAt: new Date(Date.now() - (startIndex + i) * 86400000 * 2).toISOString(),
    categoryLabel: item.categories[0] ?? 'all',
  }));
}

const ALL = withMeta(STATUS_FEED, 0);

export function getProfileContent(tab: ProfileContentTab): ProfileContentItem[] {
  switch (tab) {
    case 'statuses':
      return ALL.slice(0, 8);
    case 'saved':
      return ALL.filter((_, i) => i % 2 === 0).slice(0, 6);
    case 'downloads':
      return ALL.filter((item) => item.mediaType === 'image' || item.mediaType === 'video').slice(0, 6);
    case 'favorites':
      return ALL.filter((item) => item.likes > 4000).slice(0, 6);
    default:
      return ALL.slice(0, 6);
  }
}
