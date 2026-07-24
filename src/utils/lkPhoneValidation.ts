/**
 * Sri Lankan Mobile Phone Validator and E.164 Normalizer
 *
 * Valid mobile prefixes: 70, 71, 72, 74, 75, 76, 77, 78.
 * Excluded: landlines (011, 081, etc.) and unassigned mobile prefixes (073, 079).
 */

const LK_MOBILE_REGEX = /^(?:\+94|0094|0)?(7[01245678]\d{7})$/;

/**
 * Checks whether the input string is a valid Sri Lankan mobile phone number.
 */
export function isValidLkMobile(input?: string | null): boolean {
  if (!input) return false;
  const cleaned = input.trim().replace(/[\s-]/g, '');
  return LK_MOBILE_REGEX.test(cleaned);
}

/**
 * Normalizes a Sri Lankan mobile phone number to E.164 format (+947XXXXXXXX).
 * Returns null if the input is not a valid Sri Lankan mobile number.
 */
export function normalizeLkMobile(input?: string | null): string | null {
  if (!input) return null;
  const cleaned = input.trim().replace(/[\s-]/g, '');
  const match = cleaned.match(LK_MOBILE_REGEX);
  if (!match) return null;
  return `+94${match[1]}`;
}

/**
 * Formats an E.164 Sri Lankan mobile number (+947XXXXXXXX) into a human-friendly display string:
 * e.g., "+94 77 123 4567" or "077 123 4567"
 */
export function formatLkMobileDisplay(e164OrRaw?: string | null, localFormat: boolean = false): string {
  if (!e164OrRaw) return '';
  const normalized = normalizeLkMobile(e164OrRaw);
  if (!normalized) return e164OrRaw;

  // normalized is +947XXXXXXXX (12 chars total: +94 + 9 digits)
  const mobileDigits = normalized.substring(3); // e.g. "771234567"
  const prefix = mobileDigits.substring(0, 2); // e.g. "77"
  const part1 = mobileDigits.substring(2, 5);  // e.g. "123"
  const part2 = mobileDigits.substring(5);     // e.g. "4567"

  if (localFormat) {
    return `0${prefix} ${part1} ${part2}`;
  }
  return `+94 ${prefix} ${part1} ${part2}`;
}
