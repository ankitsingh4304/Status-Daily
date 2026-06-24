import type { PositionAnchor } from '@/types/personalize-editor';

export const PREVIEW_W = 280;
export const PREVIEW_H = 420;
const PHOTO_BASE = 88;

/** Default photo placement before drag offsets (centered, upper third). */
export function defaultPhotoLeft(photoSize = 100): number {
  const size = PHOTO_BASE * (photoSize / 100);
  return (PREVIEW_W - size) / 2;
}

export function defaultPhotoTop(): number {
  return PREVIEW_H * 0.32;
}

/** Drag offset limits so the photo stays inside the preview card. */
export function photoOffsetBounds(photoSize = 100): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  'worklet';
  const size = PHOTO_BASE * (photoSize / 100);
  const baseLeft = (PREVIEW_W - size) / 2;
  const baseTop = PREVIEW_H * 0.32;
  return {
    minX: 8 - baseLeft,
    maxX: PREVIEW_W - size - 8 - baseLeft,
    minY: 24 - baseTop,
    maxY: PREVIEW_H - size - 48 - baseTop,
  };
}

export function clampPhotoOffset(x: number, y: number, photoSize = 100): { x: number; y: number } {
  'worklet';
  const { minX, maxX, minY, maxY } = photoOffsetBounds(photoSize);
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
}

const NAME_BADGE_W = 120;
const NAME_BADGE_H = 44;

/** Default name badge placement (lower area, centered). */
export function defaultNameLeft(): number {
  return (PREVIEW_W - NAME_BADGE_W) / 2;
}

export function defaultNameTop(): number {
  return PREVIEW_H * 0.68;
}

export function nameOffsetBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
  'worklet';
  const baseLeft = (PREVIEW_W - NAME_BADGE_W) / 2;
  const baseTop = PREVIEW_H * 0.68;
  return {
    minX: 8 - baseLeft,
    maxX: PREVIEW_W - NAME_BADGE_W - 8 - baseLeft,
    minY: 24 - baseTop,
    maxY: PREVIEW_H - NAME_BADGE_H - 24 - baseTop,
  };
}

export function clampNameOffset(x: number, y: number): { x: number; y: number } {
  'worklet';
  const { minX, maxX, minY, maxY } = nameOffsetBounds();
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
}

/** Initial bottom-left placement for the photo (drag offsets from its default spot). */
export function bottomLeftPhotoOffset(photoSize = 100): { x: number; y: number } {
  const { minX, maxY } = photoOffsetBounds(photoSize);
  return { x: minX, y: maxY - 36 };
}

/** Initial bottom-left placement for the name badge, kept just below the photo. */
export function bottomLeftNameOffset(): { x: number; y: number } {
  const { minX, maxY } = nameOffsetBounds();
  return { x: minX, y: maxY };
}

/** Horizontal anchor offset from card center (px) */
export function anchorOffsetX(anchor: PositionAnchor, margin = 0): number {
  switch (anchor) {
    case 'left':
      return -PREVIEW_W / 2 + 56 + margin;
    case 'right':
      return PREVIEW_W / 2 - 56 - margin;
    case 'center':
    default:
      return 0;
  }
}

export function clampOffset(v: number, min = -100, max = 100): number {
  return Math.min(max, Math.max(min, v));
}
