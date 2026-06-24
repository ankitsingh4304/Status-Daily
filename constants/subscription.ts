/**
 * Status Daily — subscription model (client-side).
 *
 * Prices, plan periods and free-tier limits live here. The actual "is this user
 * premium?" answer comes from the subscription store; when the billing backend
 * (Play Billing / UPI AutoPay / our entitlement API) is ready, only the store's
 * activation path changes — every screen keeps reading from the same place.
 */

export type PlanId = 'free' | 'trial' | 'monthly' | 'yearly';
export type PaidPlanId = Exclude<PlanId, 'free'>;
export type AutopayMethod = 'upi' | 'qr';

export type PlanMeta = {
  id: PaidPlanId;
  /** Amount charged for this cycle, in INR. */
  amount: number;
  /** How long one cycle lasts. */
  durationDays: number;
  /** Short unit shown after the price, e.g. "for 7 days", "/month". */
  periodKey: string;
  /** Optional badge translation key (e.g. "Save 30%"). */
  badgeKey?: string;
  taglineKey: string;
  recommended?: boolean;
};

/** Free-tier daily caps (apply only to name-only statuses; own-photo is premium). */
export const FREE_LIMITS = {
  downloadsPerDay: 3,
  sharesPerDay: 5,
};

export const PLANS: PlanMeta[] = [
  {
    id: 'trial',
    amount: 2,
    durationDays: 7,
    periodKey: 'subscription.periodTrial',
    badgeKey: 'subscription.badgeTrial',
    taglineKey: 'subscription.taglineTrial',
  },
  {
    id: 'yearly',
    amount: 499,
    durationDays: 365,
    periodKey: 'subscription.periodYear',
    badgeKey: 'subscription.badgeYear',
    taglineKey: 'subscription.taglineYear',
    recommended: true,
  },
  {
    id: 'monthly',
    amount: 59,
    durationDays: 30,
    periodKey: 'subscription.periodMonth',
    taglineKey: 'subscription.taglineMonth',
  },
];

export function getPlan(id: PlanId): PlanMeta | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPrice(amount: number): string {
  return `₹${amount}`;
}

/**
 * Dummy UPI AutoPay mandate deep link. Opens the user's UPI app to approve a
 * recurring mandate. Replaced with the real merchant VPA + mandate params from
 * the payment provider once billing is live.
 */
export function buildUpiMandateLink(plan: PlanMeta): string {
  // Built manually (not URLSearchParams) — Hermes' polyfill is incomplete.
  const q = [
    ['pa', 'statusdaily@upi'],
    ['pn', 'Status Daily'],
    ['am', String(plan.amount)],
    ['cu', 'INR'],
    ['tn', `Status Daily ${plan.id} plan`],
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `upi://mandate?${q}`;
}

/** QR image for the mandate link (so a family member can scan & approve). */
export function buildQrImageUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    data
  )}`;
}
