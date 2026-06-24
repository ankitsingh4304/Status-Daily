import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nManager } from 'react-native';
import { translate, type TranslationKey } from '@/lib/i18n';
import { DEFAULT_LOCALE, isRtlLocale } from '@/locales/languages';
import type { LocaleCode } from '@/locales/types';
import type { AppTheme, Religion, UserStats } from '@/types/profile';
import { DEFAULT_RELIGION, DEFAULT_USER_STATS } from '@/types/profile';
import {
  clearUserProfile,
  isOnboardingComplete,
  loadBio,
  loadJoinDate,
  loadLocale,
  loadProfilePhotoUri,
  loadReligion,
  loadTheme,
  loadUserName,
  loadUserStats,
  saveUserProfile,
  updateUserProfileFields,
  type StoredUserProfile,
} from '@/services/user-profile-storage';

type LocaleContextValue = {
  locale: LocaleCode;
  previewLocale: LocaleCode | null;
  setPreviewLocale: (code: LocaleCode | null) => void;
  setLocale: (code: LocaleCode) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isReady: boolean;
  onboardingComplete: boolean;
  userName: string | null;
  profilePhotoUri: string | null;
  bio: string;
  theme: AppTheme;
  religion: Religion;
  joinDate: string | null;
  stats: UserStats;
  completeOnboarding: (profile: StoredUserProfile) => Promise<void>;
  updateProfile: (fields: Partial<StoredUserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Clears stored profile AND resets in-memory state so the app returns to the
   *  mobile-number entry page (used by logout / sign out / delete account). */
  signOut: () => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [previewLocale, setPreviewLocale] = useState<LocaleCode | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<AppTheme>('light');
  const [religion, setReligion] = useState<Religion>(DEFAULT_RELIGION);
  const [joinDate, setJoinDate] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  const activeLocale = previewLocale ?? locale;

  const refreshProfile = useCallback(async () => {
    const [
      storedLocale,
      name,
      photo,
      done,
      storedBio,
      storedTheme,
      storedReligion,
      storedJoin,
      storedStats,
    ] = await Promise.all([
      loadLocale(),
      loadUserName(),
      loadProfilePhotoUri(),
      isOnboardingComplete(),
      loadBio(),
      loadTheme(),
      loadReligion(),
      loadJoinDate(),
      loadUserStats(),
    ]);
    if (storedLocale) setLocaleState(storedLocale);
    setUserName(name);
    setProfilePhotoUri(photo);
    setOnboardingComplete(done);
    setBio(storedBio);
    setTheme(storedTheme);
    setReligion(storedReligion);
    setJoinDate(storedJoin);
    setStats(storedStats);
  }, []);

  useEffect(() => {
    refreshProfile().finally(() => setIsReady(true));
  }, [refreshProfile]);

  useEffect(() => {
    const rtl = isRtlLocale(activeLocale);
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
  }, [activeLocale]);

  const setLocale = useCallback(async (code: LocaleCode) => {
    setLocaleState(code);
    setPreviewLocale(null);
    await updateUserProfileFields({ locale: code });
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(activeLocale, key, params),
    [activeLocale]
  );

  const completeOnboarding = useCallback(async (profile: StoredUserProfile) => {
    const withJoin = {
      ...profile,
      joinDate: profile.joinDate ?? new Date().toISOString(),
      theme: profile.theme ?? 'light',
    };
    await saveUserProfile(withJoin);
    setLocaleState(withJoin.locale);
    setPreviewLocale(null);
    setUserName(withJoin.name);
    setProfilePhotoUri(withJoin.photoUri);
    setBio(withJoin.bio ?? '');
    setTheme(withJoin.theme ?? 'light');
    setJoinDate(withJoin.joinDate ?? null);
    setOnboardingComplete(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearUserProfile();
    setLocaleState(DEFAULT_LOCALE);
    setPreviewLocale(null);
    setOnboardingComplete(false);
    setUserName(null);
    setProfilePhotoUri(null);
    setBio('');
    setTheme('light');
    setReligion(DEFAULT_RELIGION);
    setJoinDate(null);
    setStats(DEFAULT_USER_STATS);
  }, []);

  const updateProfile = useCallback(async (fields: Partial<StoredUserProfile>) => {
    await updateUserProfileFields(fields);
    if (fields.name != null) setUserName(fields.name);
    if (fields.photoUri !== undefined) setProfilePhotoUri(fields.photoUri);
    if (fields.locale != null) {
      setLocaleState(fields.locale);
      setPreviewLocale(null);
    }
    if (fields.bio != null) setBio(fields.bio);
    if (fields.theme != null) setTheme(fields.theme);
    if (fields.religion != null) setReligion(fields.religion);
    if (fields.joinDate != null) setJoinDate(fields.joinDate);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      previewLocale,
      setPreviewLocale,
      setLocale,
      t,
      isReady,
      onboardingComplete,
      userName,
      profilePhotoUri,
      bio,
      theme,
      religion,
      joinDate,
      stats,
      completeOnboarding,
      updateProfile,
      refreshProfile,
      signOut,
    }),
    [
      locale,
      previewLocale,
      setLocale,
      t,
      isReady,
      onboardingComplete,
      userName,
      profilePhotoUri,
      bio,
      theme,
      religion,
      joinDate,
      stats,
      completeOnboarding,
      updateProfile,
      refreshProfile,
      signOut,
    ]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useTranslation() {
  const { t, locale, previewLocale, setPreviewLocale } = useLocale();
  return { t, locale: previewLocale ?? locale, setPreviewLocale };
}
