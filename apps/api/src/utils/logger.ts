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
      const safe = message.replace(/[\r\n]+/g, ' ');
      console.debug(this.formatMessage('debug', safe, context));
    }
  }

  info(message: string, context?: LogContext): void {
    const safe = message.replace(/[\r\n]+/g, ' ');
    console.info(this.formatMessage('info', safe, context));
  }

  warn(message: string, context?: LogContext): void {
    const safe = message.replace(/[\r\n]+/g, ' ');
    console.warn(this.formatMessage('warn', safe, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const safe = message.replace(/[\r\n]+/g, ' ');
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

    console.error(this.formatMessage('error', safe, errorContext));
  }
}

export const logger = new Logger();
