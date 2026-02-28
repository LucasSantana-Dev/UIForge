import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.isDevelopment) {
      return context
        ? `${prefix} ${message} ${JSON.stringify(context, null, 2)}`
        : `${prefix} ${message}`;
    }

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
    });
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context).replace(/[\r\n]+/g, ' '));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context).replace(/[\r\n]+/g, ' '));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context).replace(/[\r\n]+/g, ' '));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
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
    console.error(this.formatMessage('error', message, errorContext).replace(/[\r\n]+/g, ' '));
  }
}

export const logger = new Logger();
