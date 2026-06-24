import type { ProfileCirclePosition } from '@/constants/profile-circle';
import type { PositionAnchor } from '@/types/personalize-editor';

/** Map reel overlay position → editor photo offsets (preview card coords). */
export function reelPositionToEditorPhoto(position: ProfileCirclePosition): {
  photoAnchor: PositionAnchor;
  photoOffsetX: number;
  photoOffsetY: number;
} {
  switch (position) {
    case 'center':
      return { photoAnchor: 'center', photoOffsetX: 0, photoOffsetY: 0 };
    case 'bottomRight':
      return { photoAnchor: 'center', photoOffsetX: 88, photoOffsetY: 112 };
    case 'bottomLeft':
      return { photoAnchor: 'center', photoOffsetX: -88, photoOffsetY: 112 };
    case 'topRight':
      return { photoAnchor: 'center', photoOffsetX: 88, photoOffsetY: -88 };
    case 'topLeft':
      return { photoAnchor: 'center', photoOffsetX: -88, photoOffsetY: -88 };
    default:
      return { photoAnchor: 'center', photoOffsetX: 0, photoOffsetY: 0 };
  }
}
