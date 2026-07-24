import { describe, it, expect } from 'vitest';
import { isValidLkMobile, normalizeLkMobile, formatLkMobileDisplay } from '../lkPhoneValidation';

describe('lkPhoneValidation', () => {
  describe('isValidLkMobile', () => {
    it('should return true for valid Sri Lankan mobile numbers with various prefixes', () => {
      expect(isValidLkMobile('0771234567')).toBe(true);
      expect(isValidLkMobile('+94771234567')).toBe(true);
      expect(isValidLkMobile('0094771234567')).toBe(true);
      expect(isValidLkMobile('771234567')).toBe(true);
      expect(isValidLkMobile('0701234567')).toBe(true);
      expect(isValidLkMobile('0711234567')).toBe(true);
      expect(isValidLkMobile('0721234567')).toBe(true);
      expect(isValidLkMobile('0741234567')).toBe(true);
      expect(isValidLkMobile('0751234567')).toBe(true);
      expect(isValidLkMobile('0761234567')).toBe(true);
      expect(isValidLkMobile('0781234567')).toBe(true);
      expect(isValidLkMobile(' 077 123 4567 ')).toBe(true);
      expect(isValidLkMobile('077-123-4567')).toBe(true);
    });

    it('should return false for landlines, unassigned prefixes, and invalid lengths', () => {
      expect(isValidLkMobile('0112345678')).toBe(false); // Landline Colombo (011)
      expect(isValidLkMobile('0812345678')).toBe(false); // Landline Kandy (081)
      expect(isValidLkMobile('0731234567')).toBe(false); // Unassigned prefix 73
      expect(isValidLkMobile('0791234567')).toBe(false); // Unassigned prefix 79
      expect(isValidLkMobile('07712345')).toBe(false);   // Too short
      expect(isValidLkMobile('077123456789')).toBe(false); // Too long
      expect(isValidLkMobile('')).toBe(false);
      expect(isValidLkMobile(null)).toBe(false);
      expect(isValidLkMobile(undefined)).toBe(false);
      expect(isValidLkMobile('abcdefghij')).toBe(false);
      expect(isValidLkMobile('+14155552671')).toBe(false); // US number
    });
  });

  describe('normalizeLkMobile', () => {
    it('should normalize valid inputs to E.164 (+947XXXXXXXX)', () => {
      expect(normalizeLkMobile('0771234567')).toBe('+94771234567');
      expect(normalizeLkMobile('+94771234567')).toBe('+94771234567');
      expect(normalizeLkMobile('0094771234567')).toBe('+94771234567');
      expect(normalizeLkMobile('771234567')).toBe('+94771234567');
      expect(normalizeLkMobile('0701234567')).toBe('+94701234567');
      expect(normalizeLkMobile('0781234567')).toBe('+94781234567');
      expect(normalizeLkMobile('077 123 4567')).toBe('+94771234567');
      expect(normalizeLkMobile('077-123-4567')).toBe('+94771234567');
    });

    it('should return null for invalid inputs', () => {
      expect(normalizeLkMobile('0112345678')).toBeNull();
      expect(normalizeLkMobile('0731234567')).toBeNull();
      expect(normalizeLkMobile('0791234567')).toBeNull();
      expect(normalizeLkMobile('')).toBeNull();
      expect(normalizeLkMobile(null)).toBeNull();
    });
  });

  describe('formatLkMobileDisplay', () => {
    it('should format numbers nicely for display', () => {
      expect(formatLkMobileDisplay('0771234567')).toBe('+94 77 123 4567');
      expect(formatLkMobileDisplay('0771234567', true)).toBe('077 123 4567');
    });
  });
});
