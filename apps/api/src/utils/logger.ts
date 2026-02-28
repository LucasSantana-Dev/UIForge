import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';

  private sanitize(msg: string): string {
    return msg.replace(/[\r\n]+/g, ' ');
  }

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
      const output = this.formatMessage('debug', message, context);
      console.debug(this.sanitize(output));
    }
  }

  info(message: string, context?: LogContext): void {
    const output = this.formatMessage('info', message, context);
    console.info(this.sanitize(output));
  }

  warn(message: string, context?: LogContext): void {
    const output = this.formatMessage('warn', message, context);
    console.warn(this.sanitize(output));
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
    const output = this.formatMessage('error', message, errorContext);
    console.error(this.sanitize(output));
  }
}

export const logger = new Logger();
