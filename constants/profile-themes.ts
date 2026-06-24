import type { AppTheme } from '@/types/profile';
import { BrandColors } from '@/constants/brand';

export function getProfileScreenColors(theme: AppTheme): {
  gradient: [string, string, string];
  isDark: boolean;
} {
  switch (theme) {
    case 'dark':
      return { gradient: ['#2D2418', '#1F2937', '#2D2418'], isDark: true };
    case 'amoled':
      return { gradient: ['#1A1208', '#0F0A06', '#1A1208'], isDark: true };
    case 'gradient':
      return {
        gradient: [BrandColors.bg, BrandColors.bgAccent, '#FFFFFF'],
        isDark: false,
      };
    case 'light':
    default:
      return { gradient: [BrandColors.bg, '#FFFFFF', BrandColors.bgAccent], isDark: false };
  }
}
