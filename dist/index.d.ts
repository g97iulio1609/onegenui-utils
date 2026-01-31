import { ClassValue } from 'clsx';

/**
 * Tailwind class name merger
 */

declare function cn(...inputs: ClassValue[]): string;

/**
 * Data resolution utilities
 */
/**
 * Gets a value from a nested object using JSON Pointer or path notation.
 * Supports both "/root/path" and "root/path" formats.
 */
declare function getByPath(obj: unknown, path: string): unknown;
declare function resolveArrayProp<T>(data: unknown, items?: T[] | null, dataPath?: string | null): T[] | undefined;
declare function resolveValueProp<T>(data: unknown, value?: T | {
    path: string;
} | null, valuePath?: string | null): T | undefined;
declare function resolveString(value: unknown): string | undefined;

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
interface LoggerConfig {
    /** Enable all logs regardless of NODE_ENV */
    forceEnabled?: boolean;
    /** Prefix for all log messages */
    prefix?: string;
    /** Minimum log level to show */
    minLevel?: LogLevel;
}
/**
 * Create a logger instance with optional configuration
 */
declare function createLogger(config?: LoggerConfig): {
    debug: (...args: unknown[]) => void;
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    /** Create a child logger with a sub-prefix */
    child: (childPrefix: string) => {
        debug: (...args: unknown[]) => void;
        log: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
        child: /*elided*/ any;
        /** Check if logger is in production mode */
        isProduction: boolean;
        /** Check if debug mode is enabled */
        isDebugEnabled: boolean;
    };
    /** Check if logger is in production mode */
    isProduction: boolean;
    /** Check if debug mode is enabled */
    isDebugEnabled: boolean;
};
/**
 * Default logger instance
 */
declare const logger: {
    debug: (...args: unknown[]) => void;
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    /** Create a child logger with a sub-prefix */
    child: (childPrefix: string) => /*elided*/ any;
    /** Check if logger is in production mode */
    isProduction: boolean;
    /** Check if debug mode is enabled */
    isDebugEnabled: boolean;
};
/**
 * No-op logger for completely silent operation
 */
declare const silentLogger: {
    debug: () => void;
    log: () => void;
    warn: () => void;
    error: () => void;
    child: () => /*elided*/ any;
    isProduction: boolean;
    isDebugEnabled: boolean;
};

export { type LoggerConfig, cn, createLogger, getByPath, logger, resolveArrayProp, resolveString, resolveValueProp, silentLogger };
