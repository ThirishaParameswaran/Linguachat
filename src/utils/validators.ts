export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  email: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true };
  },

  password: (value: string, minLength = 6): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Password is required' };
    }
    if (value.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters` };
    }
    return { isValid: true };
  },

  username: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, error: 'Username is required' };
    }
    if (value.trim().length < 2) {
      return { isValid: false, error: 'Username must be at least 2 characters' };
    }
    return { isValid: true };
  },

  phone: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const sanitized = value.replace(/[\s()-]/g, '');
    if (!phoneRegex.test(sanitized)) {
      return { isValid: false, error: 'Please enter a valid international phone number' };
    }
    return { isValid: true };
  },

  url: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, error: 'URL is required' };
    }
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { isValid: false, error: 'URL must start with http:// or https://' };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },

  required: (value: any, fieldName = 'Field'): ValidationResult => {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, error: `${fieldName} cannot be empty` };
    }
    return { isValid: true };
  },

  textMinLength: (value: string, min = 1, fieldName = 'Text'): ValidationResult => {
    if (!value || value.trim().length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    return { isValid: true };
  },
};
