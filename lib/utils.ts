/**
 * Utility Functions
 * Common helper functions used throughout the app
 */

import { BITCOIN, VALIDATION } from './constants';

// ============================================================================
// String Formatting
// ============================================================================

/**
 * Truncate a string with ellipsis in the middle
 * @example truncateAddress('bc1qxy...xyz', 8, 8) => 'bc1qxy...xyz'
 */
export function truncateAddress(address: string, startChars = 10, endChars = 10): string {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncate string with ellipsis at the end
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format number with thousand separators
 * @example formatNumber(1234567) => '1,234,567'
 */
export function formatNumber(num: number | string): string {
  if (typeof num === 'string') num = parseFloat(num);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Format BTC amount with 8 decimal places
 */
export function formatBTC(satoshis: number): string {
  return (satoshis / BITCOIN.SATOSHIS_PER_BTC).toFixed(8);
}

/**
 * Convert BTC to satoshis
 */
export function btcToSats(btc: number): number {
  return Math.floor(btc * BITCOIN.SATOSHIS_PER_BTC);
}

/**
 * Convert satoshis to BTC
 */
export function satsToBTC(sats: number): number {
  return sats / BITCOIN.SATOSHIS_PER_BTC;
}

/**
 * Format percentage with sign
 * @example formatPercentage(5.123) => '+5.12%'
 */
export function formatPercentage(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Date/Time Formatting
// ============================================================================

/**
 * Format date to human-readable string
 */
export function formatDate(date: string | Date, includeTime = true): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d, false);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate Bitcoin address format
 */
export function isValidBitcoinAddress(address: string): boolean {
  if (!address) return false;
  const len = address.length;
  return (
    len >= VALIDATION.BTC_ADDRESS_MIN_LENGTH &&
    len <= VALIDATION.BTC_ADDRESS_MAX_LENGTH &&
    /^[a-zA-Z0-9]+$/.test(address)
  );
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  if (!username) return false;
  const len = username.length;
  return (
    len >= VALIDATION.USERNAME_MIN_LENGTH &&
    len <= VALIDATION.USERNAME_MAX_LENGTH &&
    VALIDATION.USERNAME_REGEX.test(username)
  );
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Storage Helpers
// ============================================================================

/**
 * Safe localStorage get
 */
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe localStorage set
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe localStorage remove
 */
export function removeLocalStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Clipboard
// ============================================================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

// ============================================================================
// Array Helpers
// ============================================================================

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// Object Helpers
// ============================================================================

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

// ============================================================================
// Async Helpers
// ============================================================================

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }
  throw lastError!;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}

// ============================================================================
// Miscellaneous
// ============================================================================

/**
 * Generate random ID
 */
export function generateId(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if mobile device
 */
export function isMobile(): boolean {
  if (!isBrowser()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get query param from URL
 */
export function getQueryParam(name: string): string | null {
  if (!isBrowser()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  if (!isBrowser()) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function keysToCamel<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as any;
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = snakeToCamel(key);
      (result as any)[camelKey] = keysToCamel(obj[key]);
      return result;
    }, {} as T);
  }
  return obj;
}

/**
 * Transform object keys from camelCase to snake_case
 */
export function keysToSnake<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnake(v)) as any;
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = camelToSnake(key);
      (result as any)[snakeKey] = keysToSnake(obj[key]);
      return result;
    }, {} as T);
  }
  return obj;
}

