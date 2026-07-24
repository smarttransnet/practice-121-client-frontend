import { useState, useCallback } from 'react';
import { isValidLkMobile, normalizeLkMobile } from '../utils/lkPhoneValidation';

export interface UseLkPhoneInputOptions {
  initialValue?: string;
  required?: boolean;
  requiredMessage?: string;
  invalidMessage?: string;
}

export function useLkPhoneInput(options: UseLkPhoneInputOptions = {}) {
  const {
    initialValue = '',
    required = true,
    requiredMessage = 'Mobile number is required',
    invalidMessage = 'Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567).',
  } = options;

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (val: string): boolean => {
      const trimmed = val.trim();
      if (!trimmed) {
        if (required) {
          setError(requiredMessage);
          return false;
        }
        setError(null);
        return true;
      }

      if (!isValidLkMobile(trimmed)) {
        setError(invalidMessage);
        return false;
      }

      setError(null);
      return true;
    },
    [required, requiredMessage, invalidMessage]
  );

  const handleChange = useCallback(
    (val: string) => {
      setValue(val);
      if (touched) {
        validate(val);
      } else {
        setError(null);
      }
    },
    [touched, validate]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate(value);
  }, [value, validate]);

  const normalizedValue = normalizeLkMobile(value);
  const isValid = isValidLkMobile(value) || (!required && !value.trim());

  return {
    value,
    setValue,
    error,
    setError,
    touched,
    isValid,
    normalizedValue,
    onChange: handleChange,
    onBlur: handleBlur,
    validate: () => {
      setTouched(true);
      return validate(value);
    },
  };
}
