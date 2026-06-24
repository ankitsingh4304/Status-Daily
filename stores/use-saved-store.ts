import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StatusItem } from '@/data/status-feed';
import type { SavedSort, SavedStatusItem } from '@/types/saved-status';
import type { PersonalizeEditorState } from '@/types/personalize-editor';

const STORAGE_KEY = '@status_daily/saved_v1';

type SavedState = {
  items: SavedStatusItem[];
  toggleSave: (feed: StatusItem, editorState?: PersonalizeEditorState) => boolean;
  removeSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  /** Updates editor snapshot only when the item is already saved. */
  upsertWithEditor: (feed: StatusItem, editorState: PersonalizeEditorState) => void;
};

function toSavedItem(feed: StatusItem, editorState?: PersonalizeEditorState): SavedStatusItem {
  return {
    id: feed.id,
    title: feed.title,
    subtitle: feed.subtitle,
    gradient: feed.gradient.filter((c): c is string => Boolean(c)),
    mediaUrl: feed.mediaUrl,
    mediaType: feed.mediaType,
    categories: [...feed.categories],
    views: feed.views,
    likes: feed.likes,
    savedAt: new Date().toISOString(),
    editorState: editorState ? { ...editorState } : undefined,
  };
}

export function sortSavedItems(
  items: SavedStatusItem[],
  sort: SavedSort = 'recent'
): SavedStatusItem[] {
  const list = [...items];
  switch (sort) {
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case 'likes':
      return list.sort((a, b) => b.likes - a.likes);
    case 'recent':
    default:
      return list.sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
  }
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],

      isSaved: (id) => get().items.some((i) => i.id === id),

      toggleSave: (feed, editorState) => {
        const exists = get().items.some((i) => i.id === feed.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== feed.id) }));
          return false;
        }
        set((state) => ({
          items: [toSavedItem(feed, editorState), ...state.items],
        }));
        return true;
      },

      removeSaved: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      upsertWithEditor: (feed, editorState) => {
        set((state) => {
          if (!state.items.some((i) => i.id === feed.id)) {
            return state;
          }
          const next = toSavedItem(feed, editorState);
          next.savedAt = state.items.find((i) => i.id === feed.id)?.savedAt ?? next.savedAt;
          const rest = state.items.filter((i) => i.id !== feed.id);
          return { items: [next, ...rest] };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);
