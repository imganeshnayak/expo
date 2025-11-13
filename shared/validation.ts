/**
 * Production-ready form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Validate a single field
 */
export const validateField = (
  value: any,
  rules: ValidationRule
): string | null => {
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    return rules.message || 'This field is required';
  }

  if (!value) return null; // If not required and empty, skip other validations

  const stringValue = value.toString();

  // Min length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || `Minimum length is ${rules.minLength} characters`;
  }

  // Max length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || `Maximum length is ${rules.maxLength} characters`;
  }

  // Pattern matching
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || 'Invalid format';
  }

  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return rules.message || 'Validation failed';
  }

  return null;
};

/**
 * Validate entire form/object against schema
 */
export const validate = (
  data: Record<string, any>,
  schema: ValidationSchema
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach((key) => {
    const error = validateField(data[key], schema[key]);
    if (error) {
      errors[key] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== COMMON VALIDATION PATTERNS ====================

export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,  // Indian phone numbers
  phoneInternational: /^\+?[1-9]\d{1,14}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  alphabetic: /^[a-zA-Z]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  postalCode: /^\d{6}$/,  // Indian PIN code
  gst: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  upi: /^[\w.-]+@[\w.-]+$/,
};

// ==================== COMMON VALIDATION RULES ====================

export const CommonValidations = {
  email: {
    required: true,
    pattern: ValidationPatterns.email,
    message: 'Please enter a valid email address',
  },
  phone: {
    required: true,
    pattern: ValidationPatterns.phone,
    message: 'Please enter a valid 10-digit phone number',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters',
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters',
  },
  required: {
    required: true,
    message: 'This field is required',
  },
};

// ==================== SPECIFIC VALIDATORS ====================

export const isValidEmail = (email: string): boolean => {
  return ValidationPatterns.email.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return ValidationPatterns.phone.test(phone);
};

export const isValidURL = (url: string): boolean => {
  return ValidationPatterns.url.test(url);
};

export const isValidGST = (gst: string): boolean => {
  return ValidationPatterns.gst.test(gst);
};

export const isValidPAN = (pan: string): boolean => {
  return ValidationPatterns.pan.test(pan);
};

export const isValidUPI = (upi: string): boolean => {
  return ValidationPatterns.upi.test(upi);
};

export const isValidPostalCode = (code: string): boolean => {
  return ValidationPatterns.postalCode.test(code);
};

// ==================== SANITIZATION ====================

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const sanitizeAmount = (amount: string): number => {
  const cleaned = amount.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};

// ==================== TYPE GUARDS ====================

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

export const isObject = (value: any): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (isString(value) || isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

// ==================== BUSINESS LOGIC VALIDATORS ====================

export const isValidCouponCode = (code: string): boolean => {
  // Coupon codes: 4-20 alphanumeric characters
  return /^[A-Z0-9]{4,20}$/.test(code);
};

export const isValidAmount = (amount: number): boolean => {
  return isNumber(amount) && amount > 0 && amount < 1000000;
};

export const isValidPercentage = (percentage: number): boolean => {
  return isNumber(percentage) && percentage >= 0 && percentage <= 100;
};

export const isValidDate = (date: Date | string | number): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isFutureDate = (date: Date | string | number): boolean => {
  return isValidDate(date) && new Date(date).getTime() > Date.now();
};

export const isPastDate = (date: Date | string | number): boolean => {
  return isValidDate(date) && new Date(date).getTime() < Date.now();
};

// ==================== RATING & REVIEW VALIDATORS ====================

export const isValidRating = (rating: number): boolean => {
  return isNumber(rating) && rating >= 1 && rating <= 5;
};

export const isValidReview = (review: string): boolean => {
  return isString(review) && review.trim().length >= 10 && review.length <= 1000;
};

// ==================== LOCATION VALIDATORS ====================

export const isValidLatitude = (lat: number): boolean => {
  return isNumber(lat) && lat >= -90 && lat <= 90;
};

export const isValidLongitude = (lng: number): boolean => {
  return isNumber(lng) && lng >= -180 && lng <= 180;
};

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return isValidLatitude(lat) && isValidLongitude(lng);
};
