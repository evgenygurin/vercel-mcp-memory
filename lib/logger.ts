/**
 * Simple structured logger for Edge Runtime
 * Replaces console.error with proper logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    // In production, use structured JSON logging
    // In development, use readable console output
    if (this.isDevelopment) {
      const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
      logFn(`[${level.toUpperCase()}] ${message}`, context || '', error || '');
    } else {
      console.info(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();
