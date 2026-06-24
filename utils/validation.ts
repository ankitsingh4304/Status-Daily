export function isValidDisplayName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;
  return /^[\p{L}\p{M}\s'.-]+$/u.test(trimmed);
}
