import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import mr from '@/locales/mr.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';
import kn from '@/locales/kn.json';
import ml from '@/locales/ml.json';
import { DEFAULT_LOCALE } from '@/locales/languages';
import type { LocaleCode, TranslationTree } from '@/locales/types';

const catalogs: Record<LocaleCode, TranslationTree> = {
  en: en as TranslationTree,
  hi: hi as TranslationTree,
  mr: mr as TranslationTree,
  ta: ta as TranslationTree,
  te: te as TranslationTree,
  kn: kn as TranslationTree,
  ml: ml as TranslationTree,
};

/** Dot-path key into TranslationTree, e.g. "onboarding.profile.title" */
export type TranslationKey = string;

function resolvePath(tree: TranslationTree, path: string): string | undefined {
  const parts = path.split('.');
  let node: unknown = tree;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

export function translate(
  locale: LocaleCode,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const primary = resolvePath(catalogs[locale], key);
  if (primary) return interpolate(primary, params);

  const fallback = resolvePath(catalogs[DEFAULT_LOCALE], key);
  if (fallback) return interpolate(fallback, params);

  return key;
}

export function getCatalog(locale: LocaleCode): TranslationTree {
  return catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
}
