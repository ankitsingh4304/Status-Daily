import type { DesignPreset, NameColor, PhotoBorder } from '@/types/personalize-editor';
import { BrandColors } from '@/constants/brand';

export type PresetConfig = {
  id: DesignPreset;
  gradient: [string, string, string];
  statusColor: string;
  accent: string;
};

export const DESIGN_PRESETS: PresetConfig[] = [
  { id: 'motivational', gradient: ['#1A1033', '#FF7A00', '#FF4D6D'], statusColor: '#FFE4C4', accent: BrandColors.orange },
  { id: 'devotional', gradient: ['#0D1A2E', '#1E3A5F', '#4A6FA5'], statusColor: '#E8D5B7', accent: '#C9A227' },
  { id: 'romantic', gradient: ['#2D0A1A', '#8B2252', '#FF4D6D'], statusColor: '#FFD6E8', accent: BrandColors.pink },
  { id: 'dark', gradient: ['#05050A', '#161622', '#2A2A3A'], statusColor: '#F4F4F5', accent: '#A1A1AA' },
  { id: 'festival', gradient: ['#3D1800', '#FF7A00', '#FFD700'], statusColor: '#FFF8E7', accent: '#FFD700' },
  { id: 'minimal', gradient: ['#F8F7F4', '#FFFFFF', '#FFF5EE'], statusColor: BrandColors.text, accent: BrandColors.orange },
  { id: 'emotional', gradient: ['#1A0A2E', '#4A1942', '#7B61FF'], statusColor: '#E0D4FF', accent: BrandColors.purple },
  { id: 'neon', gradient: ['#0A0A14', '#00F5D4', '#7B61FF'], statusColor: '#00F5D4', accent: '#00F5D4' },
];

export function getPreset(id: DesignPreset): PresetConfig {
  return DESIGN_PRESETS.find((p) => p.id === id) ?? DESIGN_PRESETS[0];
}

export const PHOTO_SHAPES = ['circle', 'rounded', 'square'] as const;

export const PHOTO_BORDERS: PhotoBorder[] = ['gradient', 'white', 'black', 'gold', 'none'];

export const NAME_COLORS: NameColor[] = [
  'white',
  'black',
  'gold',
  'orangeGradient',
  'pinkGradient',
  'theme',
];

export const BORDER_COLORS: Record<PhotoBorder, string | 'gradient'> = {
  gradient: 'gradient',
  white: '#FFFFFF',
  black: '#0F0F12',
  gold: '#D4AF37',
  none: 'transparent',
};

export function resolveNameColor(key: NameColor, preset: PresetConfig): string {
  switch (key) {
    case 'white':
      return '#FFFFFF';
    case 'black':
      return '#0F0F12';
    case 'gold':
      return '#D4AF37';
    case 'orangeGradient':
      return BrandColors.orange;
    case 'pinkGradient':
      return BrandColors.pink;
    case 'theme':
      return preset.accent;
    default:
      return '#FFFFFF';
  }
}

export const FONT_WEIGHT_MAP = {
  medium: 'NotoSans_500Medium',
  semibold: 'NotoSans_600SemiBold',
  bold: 'NotoSans_700Bold',
  extrabold: 'NotoSans_700Bold',
} as const;
