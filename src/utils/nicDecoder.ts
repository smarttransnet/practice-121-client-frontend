/**
 * Sri Lankan National Identity Card (NIC) Decoder Utility
 *
 * Supports:
 * - Old Format (10 characters: 9 digits + 'V'/'X') e.g., 882441524V, 917680444X
 * - New Format (12 numeric digits) e.g., 199824401524, 200176800444
 *
 * Extracts:
 * - Date of Birth (YYYY-MM-DD)
 * - Gender ('Male' | 'Female')
 * - Age (number)
 */

export interface NicDecodeResult {
  isValid: boolean;
  dateOfBirth: string | null; // YYYY-MM-DD
  gender: 'Male' | 'Female' | null;
  age: number | null;
  normalizedNic: string | null;
  error: string | null;
}

const NIC_REGEX = /^(?:\d{9}[vVxX]|\d{12})$/;

/**
 * Normalizes NIC string: trims whitespace and converts trailing 'v'/'x' to uppercase ('V'/'X').
 */
export function normalizeNic(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.length === 10) {
    const lastChar = trimmed[9].toUpperCase();
    return `${trimmed.substring(0, 9)}${lastChar}`;
  }
  return trimmed;
}

/**
 * Checks whether the input string is a valid Sri Lankan NIC number.
 */
export function isValidNic(input?: string | null): boolean {
  return decodeNic(input).isValid;
}

/**
 * Decodes a Sri Lankan NIC number into DOB (YYYY-MM-DD), Gender, Age, and Normalized NIC.
 */
export function decodeNic(input?: string | null): NicDecodeResult {
  if (!input) {
    return {
      isValid: false,
      dateOfBirth: null,
      gender: null,
      age: null,
      normalizedNic: null,
      error: 'NIC number is required.',
    };
  }

  const normalized = normalizeNic(input);
  if (!normalized || !NIC_REGEX.test(normalized)) {
    return {
      isValid: false,
      dateOfBirth: null,
      gender: null,
      age: null,
      normalizedNic: normalized,
      error: 'Please enter a valid Sri Lankan NIC number.',
    };
  }

  let year: number;
  let dayOfYearRaw: number;

  if (normalized.length === 10) {
    // Old format: 9 digits + V/X (e.g., 882441524V)
    year = 1900 + parseInt(normalized.substring(0, 2), 10);
    dayOfYearRaw = parseInt(normalized.substring(2, 5), 10);
  } else {
    // New format: 12 digits (e.g., 199824401524)
    year = parseInt(normalized.substring(0, 4), 10);
    dayOfYearRaw = parseInt(normalized.substring(4, 7), 10);
  }

  let gender: 'Male' | 'Female';
  let actualDay: number;

  if (dayOfYearRaw > 500) {
    gender = 'Female';
    actualDay = dayOfYearRaw - 500;
  } else {
    gender = 'Male';
    actualDay = dayOfYearRaw;
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const maxDays = isLeapYear ? 366 : 365;

  if (actualDay < 1 || actualDay > maxDays) {
    return {
      isValid: false,
      dateOfBirth: null,
      gender: null,
      age: null,
      normalizedNic: normalized,
      error: 'Invalid day component in NIC number.',
    };
  }

  // Calculate Date of Birth: Jan 1st of year + (actualDay - 1) days
  const dobDate = new Date(Date.UTC(year, 0, 1));
  dobDate.setUTCDate(dobDate.getUTCDate() + (actualDay - 1));

  const yyyy = dobDate.getUTCFullYear();
  const mm = String(dobDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dobDate.getUTCDate()).padStart(2, '0');
  const dateOfBirth = `${yyyy}-${mm}-${dd}`;

  // Age calculation
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthThisYear = new Date(today.getFullYear(), dobDate.getUTCMonth(), dobDate.getUTCDate());
  if (today < birthThisYear) {
    age--;
  }

  return {
    isValid: true,
    dateOfBirth,
    gender,
    age,
    normalizedNic: normalized,
    error: null,
  };
}
