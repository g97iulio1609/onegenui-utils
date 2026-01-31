/**
 * Production-ready Logger
 *
 * Centralized logging utility that respects NODE_ENV and LOG_LEVEL.
 * In production, only errors are logged unless LOG_LEVEL is set.
 *
 * Environment variables:
 * - NODE_ENV: "production" disables debug/log by default
 * - LOG_LEVEL: "debug" | "log" | "warn" | "error" - minimum level to show
 * - DEBUG: "true" | "1" - force all logs enabled
 *
 * Usage:
 * import { logger } from "@onegenui/utils";
 * logger.log("message");     // Only in development
 * logger.debug("message");   // Only in development
 * logger.warn("message");    // Always shown
 * logger.error("message");   // Always shown
 */

type LogLevel = "debug" | "log" | "warn" | "error" | "silent";

export interface LoggerConfig {
  /** Enable all logs regardless of NODE_ENV */
  forceEnabled?: boolean;
  /** Prefix for all log messages */
  prefix?: string;
  /** Minimum log level to show */
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  log: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const isProduction = process.env.NODE_ENV === "production";
const debugEnabled =
  process.env.DEBUG === "true" || process.env.DEBUG === "1";
const envLogLevel = process.env.LOG_LEVEL as LogLevel | undefined;

/**
 * Create a logger instance with optional configuration
 */
export function createLogger(config: LoggerConfig = {}) {
  const { forceEnabled = false, prefix = "", minLevel } = config;

  const effectiveMinLevel = minLevel ?? envLogLevel ?? (isProduction && !debugEnabled ? "warn" : "debug");

  const shouldLog = (level: LogLevel): boolean => {
    if (forceEnabled || debugEnabled) {
      return LOG_LEVELS[level] >= LOG_LEVELS.debug;
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[effectiveMinLevel];
  };

  const formatMessage = (args: unknown[]): unknown[] => {
    if (prefix && typeof args[0] === "string") {
      return [`[${prefix}] ${args[0]}`, ...args.slice(1)];
    }
    if (prefix) {
      return [`[${prefix}]`, ...args];
    }
    return args;
  };

  return {
    debug: (...args: unknown[]) => {
      if (shouldLog("debug")) {
        console.debug(...formatMessage(args));
      }
    },
    log: (...args: unknown[]) => {
      if (shouldLog("log")) {
        console.log(...formatMessage(args));
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog("warn")) {
        console.warn(...formatMessage(args));
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog("error")) {
        console.error(...formatMessage(args));
      }
    },
    /** Create a child logger with a sub-prefix */
    child: (childPrefix: string) => {
      const newPrefix = prefix ? `${prefix}:${childPrefix}` : childPrefix;
      return createLogger({ ...config, prefix: newPrefix });
    },
    /** Check if logger is in production mode */
    isProduction,
    /** Check if debug mode is enabled */
    isDebugEnabled: debugEnabled || forceEnabled,
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * No-op logger for completely silent operation
 */
export const silentLogger = {
  debug: () => {},
  log: () => {},
  warn: () => {},
  error: () => {},
  child: () => silentLogger,
  isProduction: true,
  isDebugEnabled: false,
};
