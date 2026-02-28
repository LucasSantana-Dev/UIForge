/**
 * Logging Utility
 * Structured logging for development and production
 */

import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function sanitizeLogMessage(msg: string): string {
  let result = '';
  for (let i = 0; i < msg.length; i++) {
    const code = msg.charCodeAt(i);
    if (code === 10 || code === 13) result += ' ';
    else if (code >= 0x20 && code !== 0x7f) result += msg[i];
  }
  return result;
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const sanitized = sanitizeLogMessage(message);
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.isDevelopment) {
      return context
        ? `${prefix} ${sanitized} ${JSON.stringify(context, null, 2)}`
        : `${prefix} ${sanitized}`;
    }

    // Production: JSON format for log aggregation
    return JSON.stringify({
      timestamp,
      level,
      message: sanitized,
      ...context,
    });
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', sanitizeLogMessage(message), context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', sanitizeLogMessage(message), context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', sanitizeLogMessage(message), context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const safeMessage = sanitizeLogMessage(message);
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    };

    console.error(this.formatMessage('error', safeMessage, errorContext));
  }
}

export const logger = new Logger();
