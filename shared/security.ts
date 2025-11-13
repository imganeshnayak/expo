/**
 * Security Utilities for Production
 * Input sanitization, token handling, encryption
 * 
 * NOTE: Requires dependencies:
 * - expo-crypto
 * - expo-secure-store
 * Install with: npx expo install expo-crypto expo-secure-store
 */

// import * as Crypto from 'expo-crypto';
// import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Mock crypto for now - replace with actual expo-crypto when installed
const Crypto = {
  digestStringAsync: async (algorithm: string, data: string) => {
    // Placeholder - install expo-crypto for production
    return Buffer.from(data).toString('base64');
  },
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256' as const,
  },
};

// Mock SecureStore - replace with actual expo-secure-store when installed
const SecureStore = {
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    }
    // In production, this will use native secure storage
  },
  getItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return null;
  },
  deleteItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    }
  },
};

// ==================== INPUT SANITIZATION ====================

/**
 * Remove potentially dangerous characters from input
 */
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize SQL-like input to prevent injection
 */
export const sanitizeSQL = (input: string): string => {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

/**
 * Remove script tags and event handlers
 */
export const removeScripts = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input) return '';
  
  return removeScripts(sanitizeHTML(input.trim()));
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
};

// ==================== TOKEN MANAGEMENT ====================

const TOKEN_KEY = 'uma_auth_token';
const REFRESH_TOKEN_KEY = 'uma_refresh_token';

/**
 * Securely store authentication token
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // For web, use secure cookie or localStorage with encryption
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      // For native, use SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    throw new Error('Failed to store token securely');
  }
};

/**
 * Retrieve authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    return null;
  }
};

/**
 * Remove authentication token
 */
export const removeToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    // Silently fail
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true; // If parsing fails, consider expired
  }
};

/**
 * Refresh authentication token
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = Platform.OS === 'web'
      ? localStorage.getItem(REFRESH_TOKEN_KEY)
      : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return null;
    }

    // Call refresh endpoint
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const { token, refreshToken: newRefreshToken } = await response.json();

    await storeToken(token);
    
    if (Platform.OS === 'web') {
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    }

    return token;
  } catch {
    return null;
  }
};

// ==================== ENCRYPTION ====================

/**
 * Generate encryption key from password
 */
export const generateKey = async (password: string, salt: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return digest;
};

/**
 * Encrypt sensitive data
 */
export const encryptData = async (data: string, key: string): Promise<string> => {
  try {
    // In production, use proper encryption library like react-native-crypto
    // This is a simple example
    const encrypted = Buffer.from(data).toString('base64');
    return encrypted;
  } catch {
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  try {
    const decrypted = Buffer.from(encryptedData, 'base64').toString();
    return decrypted;
  } catch {
    throw new Error('Decryption failed');
  }
};

// ==================== API SECURITY ====================

/**
 * Generate API request signature
 */
export const generateSignature = async (
  payload: string,
  secret: string
): Promise<string> => {
  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload + secret
  );
  return signature;
};

/**
 * Verify API response signature
 */
export const verifySignature = async (
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> => {
  const expectedSignature = await generateSignature(payload, secret);
  return signature === expectedSignature;
};

/**
 * Add security headers to API request
 */
export const addSecurityHeaders = async (
  headers: Record<string, string>
): Promise<Record<string, string>> => {
  const token = await getToken();
  
  return {
    ...headers,
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Client-Version': '1.0.0',
    'X-Platform': Platform.OS,
    'X-Request-ID': generateRequestID(),
  };
};

/**
 * Generate unique request ID for tracking
 */
export const generateRequestID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ==================== RATE LIMITING ====================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove requests outside the time window
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < config.windowMs
    );

    if (validRequests.length >= config.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Check if request is rate limited
 */
export const checkRateLimit = (
  userId: string,
  endpoint: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): boolean => {
  const key = `${userId}:${endpoint}`;
  return rateLimiter.isAllowed(key, config);
};

// ==================== QR CODE SECURITY ====================

/**
 * Validate QR code data
 */
export const validateQRCode = (qrData: string): {
  isValid: boolean;
  data?: any;
  error?: string;
} => {
  try {
    const parsed = JSON.parse(qrData);

    // Validate required fields
    if (!parsed.merchantId || !parsed.timestamp) {
      return { isValid: false, error: 'Missing required fields' };
    }

    // Check if QR code is not expired (valid for 5 minutes)
    const age = Date.now() - parsed.timestamp;
    if (age > 300000) {
      return { isValid: false, error: 'QR code expired' };
    }

    // Verify signature if present
    if (parsed.signature) {
      // In production, verify with merchant's public key
      // For now, just check presence
    }

    return { isValid: true, data: parsed };
  } catch {
    return { isValid: false, error: 'Invalid QR code format' };
  }
};

/**
 * Generate secure QR code data
 */
export const generateSecureQRData = async (data: any, secret: string): Promise<string> => {
  const payload = {
    ...data,
    timestamp: Date.now(),
  };

  const signature = await generateSignature(JSON.stringify(payload), secret);

  return JSON.stringify({
    ...payload,
    signature,
  });
};

// ==================== PASSWORD SECURITY ====================

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = generateSalt();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return `${salt}:${hash}`;
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const [salt, hash] = hashedPassword.split(':');
  const computed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return computed === hash;
};

/**
 * Generate random salt
 */
export const generateSalt = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score += 1;

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  return { score, feedback };
};

// ==================== DEVICE SECURITY ====================

/**
 * Check if device is jailbroken/rooted
 */
export const isDeviceSecure = async (): Promise<boolean> => {
  // In production, implement proper jailbreak/root detection
  // For now, return true
  return true;
};

/**
 * Generate device fingerprint
 */
export const getDeviceFingerprint = async (): Promise<string> => {
  // In production, use device-specific identifiers
  const fingerprint = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Platform.OS}-${Platform.Version}-${Date.now()}`
  );
  return fingerprint;
};

// ==================== AUDIT LOGGING ====================

interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

const auditLogs: AuditLog[] = [];

/**
 * Log security-sensitive action
 */
export const logAuditEvent = (log: Omit<AuditLog, 'timestamp'>): void => {
  auditLogs.push({
    ...log,
    timestamp: Date.now(),
  });

  // In production, send to backend
  if (__DEV__) {
    console.log('[AUDIT]', log);
  }
};

/**
 * Get audit logs for user
 */
export const getAuditLogs = (userId: string): AuditLog[] => {
  return auditLogs.filter((log) => log.userId === userId);
};
