import type { StatusMediaType } from '@/data/status-feed';
import type { PersonalizeEditorState } from '@/types/personalize-editor';

export type SavedStatusItem = {
  id: string;
  title: string;
  subtitle?: string;
  gradient: string[];
  mediaUrl?: string;
  mediaType: StatusMediaType;
  categories: string[];
  views: number;
  likes: number;
  savedAt: string;
  /** Full editor snapshot when saved from personalize */
  editorState?: PersonalizeEditorState;
};

export type SavedSort = 'recent' | 'title' | 'likes';
