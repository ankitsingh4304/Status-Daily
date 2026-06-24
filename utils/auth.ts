/** Mask phone for subtitle: +91 ••••••3210 */
export function maskPhone(countryCode: string, phone: string): string {
  if (!phone) return countryCode;
  if (phone.length <= 4) return `${countryCode} ${phone}`;
  const tail = phone.slice(-4);
  const hidden = '•'.repeat(phone.length - 4);
  return `${countryCode} ${hidden}${tail}`;
}
