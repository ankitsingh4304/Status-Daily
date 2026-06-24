import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_RELIGION,
  DEFAULT_USER_STATS,
  type AppTheme,
  type Religion,
  type UserStats,
} from '@/types/profile';
import type { LocaleCode } from '@/locales/types';
import { StorageKeys } from '@/services/storage-keys';

export type StoredUserProfile = {
  name: string;
  photoUri: string | null;
  locale: LocaleCode;
  bio?: string;
  theme?: AppTheme;
  religion?: Religion;
  joinDate?: string;
};

export async function loadLocale(): Promise<LocaleCode | null> {
  const v = await AsyncStorage.getItem(StorageKeys.locale);
  return v as LocaleCode | null;
}

export async function loadUserName(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.userName);
}

export async function loadProfilePhotoUri(): Promise<string | null> {
  const v = await AsyncStorage.getItem(StorageKeys.profilePhotoUri);
  return v && v.length > 0 ? v : null;
}

export async function loadBio(): Promise<string> {
  return (await AsyncStorage.getItem(StorageKeys.bio)) ?? '';
}

export async function loadTheme(): Promise<AppTheme> {
  const v = await AsyncStorage.getItem(StorageKeys.theme);
  return (v as AppTheme) || 'light';
}

export async function loadReligion(): Promise<Religion> {
  const v = await AsyncStorage.getItem(StorageKeys.religion);
  return (v as Religion) || DEFAULT_RELIGION;
}

export async function loadJoinDate(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.joinDate);
}

export async function loadUserStats(): Promise<UserStats> {
  const raw = await AsyncStorage.getItem(StorageKeys.userStats);
  if (!raw) return { ...DEFAULT_USER_STATS };
  try {
    return { ...DEFAULT_USER_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_USER_STATS };
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(StorageKeys.onboardingComplete);
  return v === 'true';
}

export async function saveUserProfile(profile: StoredUserProfile): Promise<void> {
  const pairs: [string, string][] = [
    [StorageKeys.locale, profile.locale],
    [StorageKeys.userName, profile.name],
    [StorageKeys.profilePhotoUri, profile.photoUri ?? ''],
    [StorageKeys.onboardingComplete, 'true'],
    [StorageKeys.bio, profile.bio ?? ''],
    [StorageKeys.theme, profile.theme ?? 'light'],
  ];
  if (profile.joinDate) {
    pairs.push([StorageKeys.joinDate, profile.joinDate]);
  } else {
    const existing = await loadJoinDate();
    if (!existing) {
      pairs.push([StorageKeys.joinDate, new Date().toISOString()]);
    }
  }
  await AsyncStorage.multiSet(pairs);
}

export async function updateUserProfileFields(
  fields: Partial<StoredUserProfile> & { stats?: UserStats }
): Promise<void> {
  const pairs: [string, string][] = [];
  if (fields.name != null) pairs.push([StorageKeys.userName, fields.name]);
  if (fields.photoUri !== undefined) pairs.push([StorageKeys.profilePhotoUri, fields.photoUri ?? '']);
  if (fields.locale != null) pairs.push([StorageKeys.locale, fields.locale]);
  if (fields.bio != null) pairs.push([StorageKeys.bio, fields.bio]);
  if (fields.theme != null) pairs.push([StorageKeys.theme, fields.theme]);
  if (fields.religion != null) pairs.push([StorageKeys.religion, fields.religion]);
  if (fields.joinDate != null) pairs.push([StorageKeys.joinDate, fields.joinDate]);
  if (fields.stats) pairs.push([StorageKeys.userStats, JSON.stringify(fields.stats)]);
  if (pairs.length > 0) await AsyncStorage.multiSet(pairs);
}

export async function isWalkthroughSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(StorageKeys.walkthroughSeen);
  return v === 'true';
}

export async function markWalkthroughSeen(): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.walkthroughSeen, 'true');
}

export async function isSubscriptionIntroSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(StorageKeys.subscriptionIntroSeen);
  return v === 'true';
}

export async function markSubscriptionIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.subscriptionIntroSeen, 'true');
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(StorageKeys));
}
