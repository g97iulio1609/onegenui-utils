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

export interface LoggerConfig {
  /** Enable all logs regardless of NODE_ENV */
  forceEnabled?: boolean;
  /** Prefix/namespace for all log messages */
  prefix?: string;
  /** Minimum log level to show */
  minLevel?: LogLevel;
}

export interface Logger {
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

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  log: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/**
 * Runtime-agnostic env access (Node, Vite/browser, Deno, edge workers).
 * Returns undefined when the variable is not available.
 */
function getEnv(key: string): string | undefined {
  // Node.js / Bun
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  // Vite injects import.meta.env at build time
  try {
    const meta = import.meta as unknown as { env?: Record<string, string> };
    if (meta.env) return meta.env[key];
  } catch {
    // import.meta not available in CJS
  }
  return undefined;
}

const isProduction = getEnv("NODE_ENV") === "production";
const debugEnabled =
  getEnv("DEBUG") === "true" || getEnv("DEBUG") === "1";
const envLogLevel = getEnv("LOG_LEVEL") as LogLevel | undefined;
const envNamespaces = getEnv("LOG_NAMESPACES") ?? "";

// Parse namespace patterns once at module load
const { enabledPatterns, disabledPatterns } = parseNamespacePatterns(envNamespaces);

/**
 * Parse LOG_NAMESPACES into enabled and disabled patterns
 */
function parseNamespacePatterns(namespaces: string): {
  enabledPatterns: RegExp[];
  disabledPatterns: RegExp[];
} {
  if (!namespaces.trim()) {
    return { enabledPatterns: [], disabledPatterns: [] };
  }

  const enabled: RegExp[] = [];
  const disabled: RegExp[] = [];

  namespaces.split(",").forEach((pattern) => {
    const trimmed = pattern.trim();
    if (!trimmed) return;

    const isDisabled = trimmed.startsWith("-");
    const cleanPattern = isDisabled ? trimmed.slice(1) : trimmed;
    
    // Convert glob pattern to regex
    const regexPattern = cleanPattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\*/g, ".*")                  // * matches anything
      .replace(/\?/g, ".");                  // ? matches single char

    const regex = new RegExp(`^${regexPattern}$`);
    
    if (isDisabled) {
      disabled.push(regex);
    } else {
      enabled.push(regex);
    }
  });

  return { enabledPatterns: enabled, disabledPatterns: disabled };
}

/**
 * Check if a namespace is enabled based on LOG_NAMESPACES patterns
 */
function isNamespaceEnabled(namespace: string): boolean {
  // If no patterns specified, all namespaces are enabled (default behavior)
  if (enabledPatterns.length === 0 && disabledPatterns.length === 0) {
    return true;
  }

  // Check if explicitly disabled first
  for (const pattern of disabledPatterns) {
    if (pattern.test(namespace)) {
      return false;
    }
  }

  // If no enabled patterns, allow all (except disabled)
  if (enabledPatterns.length === 0) {
    return true;
  }

  // Check if matches any enabled pattern
  for (const pattern of enabledPatterns) {
    if (pattern.test(namespace)) {
      return true;
    }
  }

  return false;
}

/**
 * Create a logger instance with optional configuration
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  const { forceEnabled = false, prefix = "", minLevel } = config;

  const effectiveMinLevel = minLevel ?? envLogLevel ?? (isProduction && !debugEnabled ? "warn" : "debug");

  const namespaceEnabled = isNamespaceEnabled(prefix);

  const shouldLog = (level: LogLevel): boolean => {
    // Always allow warn and error regardless of namespace
    if (LOG_LEVELS[level] >= LOG_LEVELS.warn) {
      return LOG_LEVELS[level] >= LOG_LEVELS[effectiveMinLevel];
    }

    // For debug and log, check namespace
    if (!namespaceEnabled && !forceEnabled && !debugEnabled) {
      return false;
    }

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
    /** Check if this namespace is enabled (use before expensive log formatting) */
    isNamespaceEnabled: () => namespaceEnabled || forceEnabled || debugEnabled,
    /** Check if logger is in production mode */
    isProduction,
    /** Check if debug mode is enabled */
    isDebugEnabled: debugEnabled || forceEnabled,
    /** The namespace/prefix of this logger */
    namespace: prefix,
  };
}

/**
 * Default logger instance (no namespace)
 */
export const logger = createLogger();

/**
 * No-op logger for completely silent operation
 */
export const silentLogger: Logger = {
  debug: () => {},
  log: () => {},
  warn: () => {},
  error: () => {},
  child: () => silentLogger,
  isNamespaceEnabled: () => false,
  isProduction: true,
  isDebugEnabled: false,
  namespace: "",
};

/**
 * Pre-configured loggers for common packages
 * These are lazy-initialized to avoid circular dependencies
 */
export const loggers = {
  get core() { return createLogger({ prefix: "core" }); },
  get react() { return createLogger({ prefix: "react" }); },
  get ui() { return createLogger({ prefix: "ui" }); },
  get mcp() { return createLogger({ prefix: "mcp" }); },
  get providers() { return createLogger({ prefix: "providers" }); },
  get research() { return createLogger({ prefix: "research" }); },
  get vectorless() { return createLogger({ prefix: "vectorless" }); },
  get jobs() { return createLogger({ prefix: "jobs" }); },
  get collab() { return createLogger({ prefix: "collab" }); },
};

// =============================================================================
// Performance Monitoring & Tracing
// =============================================================================

let traceIdCounter = 0;

/**
 * Generate a unique trace ID for request tracing
 */
export function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (traceIdCounter++).toString(36).padStart(4, "0");
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${counter}-${random}`;
}

/**
 * Measure execution time of a function
 */
export async function measure<T>(
  label: string,
  fn: () => Promise<T>,
  log: Logger = logger,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = performance.now() - start;
    log.debug(`${label} completed in ${durationMs.toFixed(2)}ms`);
    return { result, durationMs };
  } catch (error) {
    const durationMs = performance.now() - start;
    log.error(`${label} failed after ${durationMs.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Measure execution time of a sync function
 */
export function measureSync<T>(
  label: string,
  fn: () => T,
  log: Logger = logger,
): { result: T; durationMs: number } {
  const start = performance.now();
  try {
    const result = fn();
    const durationMs = performance.now() - start;
    log.debug(`${label} completed in ${durationMs.toFixed(2)}ms`);
    return { result, durationMs };
  } catch (error) {
    const durationMs = performance.now() - start;
    log.error(`${label} failed after ${durationMs.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Create a performance timer
 */
export function createTimer(): {
  elapsed: () => number;
  elapsedFormatted: () => string;
} {
  const start = performance.now();
  return {
    elapsed: () => performance.now() - start,
    elapsedFormatted: () => `${(performance.now() - start).toFixed(2)}ms`,
  };
}

/**
 * Create a logger with trace ID context
 */
export function createTracedLogger(
  traceId: string,
  basePrefix?: string,
): Logger {
  const prefix = basePrefix ? `${basePrefix}|${traceId}` : traceId;
  return createLogger({ prefix });
}
