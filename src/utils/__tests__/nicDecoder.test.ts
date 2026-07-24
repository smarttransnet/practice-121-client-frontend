import { describe, it, expect } from 'vitest';
import { isValidNic, normalizeNic, decodeNic } from '../nicDecoder';

describe('nicDecoder', () => {
  describe('normalizeNic', () => {
    it('should uppercase trailing v/x for 10-char NICs', () => {
      expect(normalizeNic('882441524v')).toBe('882441524V');
      expect(normalizeNic('917680444x')).toBe('917680444X');
    });

    it('should keep 12-digit NICs unchanged', () => {
      expect(normalizeNic('199824401524')).toBe('199824401524');
    });
  });

  describe('decodeNic', () => {
    it('should decode valid Old Male NIC (882441524V)', () => {
      const result = decodeNic('882441524V');
      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Male');
      expect(result.dateOfBirth).toBe('1988-08-31'); // 1988 is leap year, day 244 = Aug 31
      expect(result.normalizedNic).toBe('882441524V');
      expect(result.error).toBeNull();
    });

    it('should decode valid Old Female NIC (917680444X)', () => {
      const result = decodeNic('917680444X');
      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Female');
      expect(result.dateOfBirth).toBe('1991-09-25'); // 768 - 500 = 268 -> Sep 25 1991
      expect(result.normalizedNic).toBe('917680444X');
    });

    it('should decode valid New Male NIC (199824401524)', () => {
      const result = decodeNic('199824401524');
      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Male');
      expect(result.dateOfBirth).toBe('1998-09-01'); // 1998 is non-leap year, day 244 = Sep 1
      expect(result.normalizedNic).toBe('199824401524');
    });

    it('should decode valid New Female NIC (200176800444)', () => {
      const result = decodeNic('200176800444');
      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Female');
      expect(result.dateOfBirth).toBe('2001-09-25');
      expect(result.normalizedNic).toBe('200176800444');
    });

    it('should handle leap year dates correctly (960601234V)', () => {
      const result = decodeNic('960601234V');
      expect(result.isValid).toBe(true);
      expect(result.dateOfBirth).toBe('1996-02-29'); // 1996 is leap year, day 60 = Feb 29
    });

    it('should return invalid for malformed inputs', () => {
      expect(decodeNic('123456789A').isValid).toBe(false);
      expect(decodeNic('883671524V').isValid).toBe(false); // Non-leap 1988 day 367 -> invalid
      expect(decodeNic('12345').isValid).toBe(false);
      expect(decodeNic('').isValid).toBe(false);
      expect(decodeNic(null).isValid).toBe(false);
    });
  });

  describe('isValidNic', () => {
    it('should validate correctly', () => {
      expect(isValidNic('882441524V')).toBe(true);
      expect(isValidNic('199824401524')).toBe(true);
      expect(isValidNic('invalid')).toBe(false);
    });
  });
});
