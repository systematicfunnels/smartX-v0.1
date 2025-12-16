/**
 * Common utility functions for SmartX applications
 */

/**
 * Format date for display
 * @param date Date to format
 * @param format Format string (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const pad = (num: number) => num.toString().padStart(2, '0');

  const formats: Record<string, () => string> = {
    'YYYY-MM-DD': () => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    'MM/DD/YYYY': () => `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`,
    'DD-MM-YYYY': () => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`,
    'YYYYMMDD': () => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
  };

  return (formats[format] || formats['YYYY-MM-DD'])();
}

/**
 * Generate a unique ID
 * @param prefix Optional prefix
 * @returns Unique ID string
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Debounce function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Deep clone object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
