import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  FREE_LIMITS,
  getPlan,
  type AutopayMethod,
  type PaidPlanId,
  type PlanId,
} from '@/constants/subscription';

function todayKey(): string {
  // Local calendar day, e.g. "2026-06-20" — used to reset daily free counters.
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

type SubscriptionState = {
  plan: PlanId;
  startedAt: string | null;
  expiresAt: string | null;
  autopayMethod: AutopayMethod | null;
  autoRenew: boolean;

  // Free-tier usage (reset each calendar day)
  usageDate: string;
  downloadsUsed: number;
  sharesUsed: number;

  /** Activate a paid plan (dummy until billing backend exists). */
  activate: (plan: PaidPlanId, method: AutopayMethod) => void;
  /** Stop auto-renewal but keep access until expiry. */
  cancelAutoRenew: () => void;
  /** Drop back to the free plan immediately. */
  downgradeToFree: () => void;

  /** Roll the daily counters over when the calendar day changes. */
  ensureToday: () => void;
  recordDownload: () => void;
  recordShare: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      startedAt: null,
      expiresAt: null,
      autopayMethod: null,
      autoRenew: false,

      usageDate: todayKey(),
      downloadsUsed: 0,
      sharesUsed: 0,

      activate: (plan, method) => {
        const meta = getPlan(plan);
        const now = new Date();
        const expires = new Date(now.getTime());
        expires.setDate(expires.getDate() + (meta?.durationDays ?? 30));
        set({
          plan,
          startedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
          autopayMethod: method,
          autoRenew: true,
        });
      },

      cancelAutoRenew: () => set({ autoRenew: false }),

      downgradeToFree: () =>
        set({
          plan: 'free',
          startedAt: null,
          expiresAt: null,
          autopayMethod: null,
          autoRenew: false,
        }),

      ensureToday: () => {
        const key = todayKey();
        if (get().usageDate !== key) {
          set({ usageDate: key, downloadsUsed: 0, sharesUsed: 0 });
        }
      },

      recordDownload: () => {
        get().ensureToday();
        set((s) => ({ downloadsUsed: s.downloadsUsed + 1 }));
      },

      recordShare: () => {
        get().ensureToday();
        set((s) => ({ sharesUsed: s.sharesUsed + 1 }));
      },
    }),
    {
      name: '@status_daily/subscription_v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** True while a paid plan is active and not expired. */
export function isPremiumActive(s: Pick<SubscriptionState, 'plan' | 'expiresAt'>): boolean {
  if (s.plan === 'free') return false;
  if (!s.expiresAt) return true;
  return new Date(s.expiresAt).getTime() > Date.now();
}

/** Whole days left before the current plan expires (0 if none/expired). */
export function remainingDays(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function remainingFree(
  s: Pick<SubscriptionState, 'downloadsUsed' | 'sharesUsed'>,
  mode: 'download' | 'share'
): number {
  return mode === 'download'
    ? Math.max(0, FREE_LIMITS.downloadsPerDay - s.downloadsUsed)
    : Math.max(0, FREE_LIMITS.sharesPerDay - s.sharesUsed);
}
