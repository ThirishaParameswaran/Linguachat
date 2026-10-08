import { useState, useEffect, useCallback, useRef } from 'react';
import { ValidationResult } from '../utils/validators';

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface UseButtonValidationOptions<T> {
  value: T;
  validator: (val: T) => ValidationResult | Promise<ValidationResult>;
  debounceMs?: number;
  validateImmediately?: boolean;
}

export function useButtonValidation<T>({
  value,
  validator,
  debounceMs = 300,
  validateImmediately = false,
}: UseButtonValidationOptions<T>) {
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const isFirstRun = useRef(true);

  const runValidation = useCallback(
    async (val: T) => {
      setStatus('validating');
      try {
        const result = await Promise.resolve(validator(val));
        if (result.isValid) {
          setStatus('valid');
          setErrorMessage(null);
          setIsValid(true);
        } else {
          setStatus('invalid');
          setErrorMessage(result.error || 'Invalid input');
          setIsValid(false);
        }
      } catch (err: any) {
        setStatus('invalid');
        setErrorMessage(err?.message || 'Validation error');
        setIsValid(false);
      }
    },
    [validator]
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (!validateImmediately) {
        return;
      }
    }

    const handler = setTimeout(() => {
      runValidation(value);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [value, debounceMs, validateImmediately, runValidation]);

  const forceValidate = useCallback(() => {
    return runValidation(value);
  }, [runValidation, value]);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setIsValid(false);
  }, []);

  return {
    status,
    isValid,
    errorMessage,
    isValidating: status === 'validating',
    forceValidate,
    reset,
  };
}
