import { useState, useCallback } from 'react';
import { decodeNic, normalizeNic, isValidNic, type NicDecodeResult } from '../utils/nicDecoder';

export interface UseNicAutoFillOptions {
  initialNic?: string;
  onAutoFill?: (dob: string, gender: string) => void;
}

export function useNicAutoFill(options: UseNicAutoFillOptions = {}) {
  const { initialNic = '', onAutoFill } = options;

  const [nicNumber, setNicNumber] = useState(initialNic);
  const [error, setError] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [lastAutoFilledNic, setLastAutoFilledNic] = useState<string | null>(null);

  const handleNicChange = useCallback(
    (val: string) => {
      setNicNumber(val);
      const trimmed = val.trim();

      if (!trimmed) {
        setError(null);
        setAutoFilled(false);
        return;
      }

      const decode: NicDecodeResult = decodeNic(trimmed);

      if (decode.isValid && decode.normalizedNic) {
        setError(null);

        // Auto-fill DOB & Gender when a valid NIC is entered
        if (decode.normalizedNic !== lastAutoFilledNic) {
          setLastAutoFilledNic(decode.normalizedNic);
          if (decode.dateOfBirth && decode.gender) {
            setAutoFilled(true);
            if (onAutoFill) {
              onAutoFill(decode.dateOfBirth, decode.gender);
            }
          }
        }
      } else {
        setAutoFilled(false);
        // Only show error if 10 or more characters have been typed
        if (trimmed.length >= 10) {
          setError(decode.error || 'Please enter a valid Sri Lankan NIC number.');
        } else {
          setError(null);
        }
      }
    },
    [lastAutoFilledNic, onAutoFill]
  );

  const handleBlur = useCallback(() => {
    const trimmed = nicNumber.trim();
    if (!trimmed) {
      setError(null);
      return;
    }
    const decode = decodeNic(trimmed);
    if (!decode.isValid) {
      setError(decode.error || 'Please enter a valid Sri Lankan NIC number.');
    } else {
      setError(null);
    }
  }, [nicNumber]);

  return {
    nicNumber,
    setNicNumber,
    error,
    setError,
    autoFilled,
    setAutoFilled,
    handleNicChange,
    handleBlur,
    isValid: isValidNic(nicNumber),
    normalizedNic: normalizeNic(nicNumber),
    decoded: decodeNic(nicNumber),
  };
}
