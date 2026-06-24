import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FREE_LIMITS } from '@/constants/subscription';
import {
  isPremiumActive,
  remainingFree,
  useSubscriptionStore,
} from '@/stores/use-subscription-store';
import { useLocale } from '@/context/locale-context';

export type ExportMode = 'download' | 'share';
export type GateReason = 'photo' | 'limit';

/**
 * Central free/premium gate for exporting a status.
 *
 * Rules:
 *  - Premium users: always allowed.
 *  - Free users sharing/downloading a status that uses THEIR OWN PHOTO → blocked,
 *    paywall opens (reason 'photo'). This is where we first charge.
 *  - Free users with a name-only status: allowed up to a daily limit, then the
 *    paywall opens (reason 'limit'). Each allowed export consumes one free use.
 *
 * `attempt()` returns true when the export may proceed (and consumes a free use
 * for free users); otherwise it routes to the paywall and returns false.
 */
export function useExportGate() {
  const router = useRouter();
  const { profilePhotoUri } = useLocale();

  const plan = useSubscriptionStore((s) => s.plan);
  const expiresAt = useSubscriptionStore((s) => s.expiresAt);
  const ensureToday = useSubscriptionStore((s) => s.ensureToday);
  const recordDownload = useSubscriptionStore((s) => s.recordDownload);
  const recordShare = useSubscriptionStore((s) => s.recordShare);

  const premium = isPremiumActive({ plan, expiresAt });

  const attempt = useCallback(
    (mode: ExportMode): boolean => {
      if (premium) return true;

      // Using the user's own photo is a premium feature.
      if (profilePhotoUri) {
        router.push({ pathname: '/paywall', params: { reason: 'photo' } });
        return false;
      }

      // Name-only export: enforce the daily free allowance.
      ensureToday();
      const { downloadsUsed, sharesUsed } = useSubscriptionStore.getState();
      const left = remainingFree({ downloadsUsed, sharesUsed }, mode);
      if (left <= 0) {
        router.push({ pathname: '/paywall', params: { reason: 'limit' } });
        return false;
      }

      if (mode === 'download') recordDownload();
      else recordShare();
      return true;
    },
    [premium, profilePhotoUri, router, ensureToday, recordDownload, recordShare]
  );

  return { isPremium: premium, freeLimits: FREE_LIMITS, attempt };
}
