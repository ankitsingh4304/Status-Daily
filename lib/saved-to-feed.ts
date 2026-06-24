import type { StatusItem } from '@/data/status-feed';
import type { SavedStatusItem } from '@/types/saved-status';

export function savedToFeedItem(saved: SavedStatusItem): StatusItem {
  return {
    id: saved.id,
    title: saved.title,
    subtitle: saved.subtitle,
    categories: saved.categories as StatusItem['categories'],
    gradient: saved.gradient as StatusItem['gradient'],
    mediaUrl: saved.mediaUrl,
    mediaType: saved.mediaType,
    views: saved.views,
    likes: saved.likes,
  };
}
