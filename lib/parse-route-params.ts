/** Normalize expo-router query params (string | string[] | undefined). */
export function paramString(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  const trimmed = s?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/** Parse gradient JSON passed from home reels → personalize editor. */
export function parseGradientParam(
  raw: string | string[] | undefined,
  fallback: [string, string] = ['#1A1033', '#FF7A00']
): [string, string, ...string[]] {
  const s = paramString(raw);
  if (!s) return fallback;
  try {
    const parsed = JSON.parse(s) as unknown;
    if (Array.isArray(parsed)) {
      const colors = parsed.filter((c): c is string => typeof c === 'string' && c.length > 0);
      if (colors.length >= 2) {
        return colors as [string, string, ...string[]];
      }
    }
  } catch {
    /* ignore invalid JSON */
  }
  return fallback;
}
