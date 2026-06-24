/** Status Daily — warm Indian WhatsApp Status design tokens */
export const BrandColors = {
  orange: '#FF7A00',
  /** @deprecated use accent — kept for existing references */
  pink: '#E63946',
  /** Warm gradient end — kept key for existing references */
  purple: '#FFC857',
  gradient: ['#FF7A00', '#FF9F1C', '#FFC857'] as const,
  accent: '#E63946',
  whatsapp: '#25D366',
  gold: '#D4A017',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  surfaceBorder: 'rgba(255, 122, 0, 0.14)',
  bg: '#FFF8F0',
  bgAccent: '#FFF3E6',
  link: '#E63946',
  shadow: 'rgba(255, 122, 0, 0.18)',
  success: '#22C55E',
  warning: '#F59E0B',
};

export const BrandCopy = {
  appName: 'Status Daily',
  tagline: 'Create status, share moments instantly',
  cta: 'Continue',
  legal: 'By continuing, you agree to ',
  termsLabel: 'Terms',
  privacyLabel: 'Privacy',
};

export const DEFAULT_COUNTRY = { code: '+91', label: 'India', flag: '🇮🇳' };

export const COUNTRY_OPTIONS = [
  DEFAULT_COUNTRY,
  { code: '+1', label: 'United States', flag: '🇺🇸' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', label: 'UAE', flag: '🇦🇪' },
];
