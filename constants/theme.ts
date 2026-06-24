/**
 * Theme colors + font families used across the app.
 */

import { Platform } from 'react-native';
import { BrandColors } from '@/constants/brand';
import { BrandFonts } from '@/constants/typography';

export const Colors = {
  light: {
    text: BrandColors.text,
    background: BrandColors.bg,
    tint: BrandColors.orange,
    icon: BrandColors.textSecondary,
    tabIconDefault: BrandColors.textMuted,
    tabIconSelected: BrandColors.orange,
  },
  dark: {
    text: '#F4F4F5',
    background: '#1A1208',
    tint: BrandColors.gold,
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: BrandColors.gold,
    surface: 'rgba(255, 248, 240, 0.08)',
    elevatedSurface: 'rgba(255, 248, 240, 0.12)',
  },
};

export const Fonts = {
  sans: BrandFonts.regular,
  serif: Platform.select({ ios: 'ui-serif', default: 'serif', web: "Georgia, 'Times New Roman', serif" }),
  rounded: Platform.select({ ios: 'ui-rounded', default: 'normal', web: "'SF Pro Rounded', sans-serif" }),
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace', web: 'monospace' }),
  heading: BrandFonts.bold,
  subheading: BrandFonts.semibold,
  medium: BrandFonts.medium,
  micro: BrandFonts.bold,
};
