/**
 * Simple logger utility for SmartX applications
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  timestamp?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private timestamp: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || LogLevel.INFO;
    this.prefix = options.prefix || '';
    this.timestamp = options.timestamp !== false;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };
    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const parts = [];

    if (this.timestamp) {
      parts.push(new Date().toISOString());
    }

    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);

    if (args.length > 0) {
      parts.push(...args.map(arg => {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }));
    }

    return parts.join(' ');
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, ...args));
    }
  }
}

/**
 * Create a logger instance
 * @param options Logger options
 * @returns Logger instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}

/**
 * Global logger instance
 */
export const logger = createLogger({
  level: LogLevel.INFO,
  prefix: 'SmartX',
  timestamp: true,
});
