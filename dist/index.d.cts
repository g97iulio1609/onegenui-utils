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
 * Production-ready Logger with Granular Namespace Control
 *
 * Centralized logging utility that respects NODE_ENV, LOG_LEVEL, and LOG_NAMESPACES.
 * In production, only errors are logged unless explicitly enabled.
 *
 * Environment variables:
 * - NODE_ENV: "production" disables debug/log by default
 * - LOG_LEVEL: "debug" | "log" | "warn" | "error" - global minimum level
 * - DEBUG: "true" | "1" - force all logs enabled
 * - LOG_NAMESPACES: Comma-separated list of enabled namespaces with glob support
 *   Examples:
 *   - "mcp:*" - enable all mcp logs
 *   - "react:streaming,mcp:tools" - enable specific namespaces
 *   - "*" - enable all namespaces
 *   - "-mcp:*" - disable mcp logs (prefix with -)
 *
 * Usage:
 * import { logger, createLogger } from "@onegenui/utils";
 *
 * // Default logger
 * logger.log("message");
 *
 * // Namespaced logger
 * const mcpLogger = createLogger({ prefix: "mcp:tools" });
 * mcpLogger.debug("Tool execution started"); // Only logs if LOG_NAMESPACES includes "mcp:*"
 *
 * // Check if logging is enabled before expensive operations
 * if (mcpLogger.isNamespaceEnabled()) {
 *   mcpLogger.debug("Expensive data:", JSON.stringify(largeObject));
 * }
 */
type LogLevel = "debug" | "log" | "warn" | "error" | "silent";
interface LoggerConfig {
    /** Enable all logs regardless of NODE_ENV */
    forceEnabled?: boolean;
    /** Prefix/namespace for all log messages */
    prefix?: string;
    /** Minimum log level to show */
    minLevel?: LogLevel;
}
interface Logger {
    debug: (...args: unknown[]) => void;
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    /** Create a child logger with a sub-prefix */
    child: (childPrefix: string) => Logger;
    /** Check if this namespace is enabled (use before expensive log formatting) */
    isNamespaceEnabled: () => boolean;
    /** Check if logger is in production mode */
    isProduction: boolean;
    /** Check if debug mode is enabled */
    isDebugEnabled: boolean;
    /** The namespace/prefix of this logger */
    namespace: string;
}
/**
 * Create a logger instance with optional configuration
 */
declare function createLogger(config?: LoggerConfig): Logger;
/**
 * Default logger instance (no namespace)
 */
declare const logger: Logger;
/**
 * No-op logger for completely silent operation
 */
declare const silentLogger: Logger;
/**
 * Pre-configured loggers for common packages
 * These are lazy-initialized to avoid circular dependencies
 */
declare const loggers: {
    readonly core: Logger;
    readonly react: Logger;
    readonly ui: Logger;
    readonly mcp: Logger;
    readonly providers: Logger;
    readonly research: Logger;
    readonly vectorless: Logger;
    readonly jobs: Logger;
    readonly collab: Logger;
};

export { type Logger, type LoggerConfig, cn, createLogger, getByPath, logger, loggers, resolveArrayProp, resolveString, resolveValueProp, silentLogger };
