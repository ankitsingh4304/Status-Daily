import { BrandColors } from '@/constants/brand';

/** Shared presentation tokens — styling only */
export const UiTokens = {
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: BrandColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    button: {
      shadowColor: BrandColors.orange,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 6,
    },
    bar: {
      shadowColor: BrandColors.orange,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  touch: {
    minHeight: 52,
    chipHeight: 44,
  },
} as const;
