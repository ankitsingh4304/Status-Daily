import type { LanguageOption, LocaleCode } from '@/locales/types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', nativeLabel: 'हिन्दी', englishLabel: 'Hindi' },
  { code: 'en', nativeLabel: 'English', englishLabel: 'English' },
  { code: 'mr', nativeLabel: 'मराठी', englishLabel: 'Marathi' },
  { code: 'ta', nativeLabel: 'தமிழ்', englishLabel: 'Tamil' },
  { code: 'te', nativeLabel: 'తెలుగు', englishLabel: 'Telugu' },
  { code: 'kn', nativeLabel: 'ಕನ್ನಡ', englishLabel: 'Kannada' },
  { code: 'ml', nativeLabel: 'മലയാളം', englishLabel: 'Malayalam' },
];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export function getLanguageMeta(code: LocaleCode): LanguageOption | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

export function isRtlLocale(_code: LocaleCode): boolean {
  return false;
}
