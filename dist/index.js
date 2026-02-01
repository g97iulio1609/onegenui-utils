// src/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/data-utils.ts
function getByPath(obj, path) {
  if (!path || path === "/") {
    return obj;
  }
  const segments = path.startsWith("/") ? path.slice(1).split("/") : path.split("/");
  let current = obj;
  for (const segment of segments) {
    if (current === null || current === void 0) {
      return void 0;
    }
    if (typeof current !== "object") {
      return void 0;
    }
    current = current[segment];
  }
  return current;
}
function resolveArrayProp(data, items, dataPath) {
  if (Array.isArray(items)) return items;
  if (!dataPath) return void 0;
  const resolved = getByPath(data, dataPath);
  return Array.isArray(resolved) ? resolved : void 0;
}
function resolveValueProp(data, value, valuePath) {
  if (value && typeof value === "object" && "path" in value) {
    return getByPath(data, value.path);
  }
  if (value !== null && value !== void 0) {
    return value;
  }
  if (valuePath) {
    return getByPath(data, valuePath);
  }
  return void 0;
}
function resolveString(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return void 0;
}

// src/logger.ts
var LOG_LEVELS = {
  debug: 0,
  log: 1,
  warn: 2,
  error: 3,
  silent: 4
};
var isProduction = process.env.NODE_ENV === "production";
var debugEnabled = process.env.DEBUG === "true" || process.env.DEBUG === "1";
var envLogLevel = process.env.LOG_LEVEL;
var envNamespaces = process.env.LOG_NAMESPACES ?? "";
var { enabledPatterns, disabledPatterns } = parseNamespacePatterns(envNamespaces);
function parseNamespacePatterns(namespaces) {
  if (!namespaces.trim()) {
    return { enabledPatterns: [], disabledPatterns: [] };
  }
  const enabled = [];
  const disabled = [];
  namespaces.split(",").forEach((pattern) => {
    const trimmed = pattern.trim();
    if (!trimmed) return;
    const isDisabled = trimmed.startsWith("-");
    const cleanPattern = isDisabled ? trimmed.slice(1) : trimmed;
    const regexPattern = cleanPattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);
    if (isDisabled) {
      disabled.push(regex);
    } else {
      enabled.push(regex);
    }
  });
  return { enabledPatterns: enabled, disabledPatterns: disabled };
}
function isNamespaceEnabled(namespace) {
  if (enabledPatterns.length === 0 && disabledPatterns.length === 0) {
    return true;
  }
  for (const pattern of disabledPatterns) {
    if (pattern.test(namespace)) {
      return false;
    }
  }
  if (enabledPatterns.length === 0) {
    return true;
  }
  for (const pattern of enabledPatterns) {
    if (pattern.test(namespace)) {
      return true;
    }
  }
  return false;
}
function createLogger(config = {}) {
  const { forceEnabled = false, prefix = "", minLevel } = config;
  const effectiveMinLevel = minLevel ?? envLogLevel ?? (isProduction && !debugEnabled ? "warn" : "debug");
  const namespaceEnabled = isNamespaceEnabled(prefix);
  const shouldLog = (level) => {
    if (LOG_LEVELS[level] >= LOG_LEVELS.warn) {
      return LOG_LEVELS[level] >= LOG_LEVELS[effectiveMinLevel];
    }
    if (!namespaceEnabled && !forceEnabled && !debugEnabled) {
      return false;
    }
    if (forceEnabled || debugEnabled) {
      return LOG_LEVELS[level] >= LOG_LEVELS.debug;
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[effectiveMinLevel];
  };
  const formatMessage = (args) => {
    if (prefix && typeof args[0] === "string") {
      return [`[${prefix}] ${args[0]}`, ...args.slice(1)];
    }
    if (prefix) {
      return [`[${prefix}]`, ...args];
    }
    return args;
  };
  return {
    debug: (...args) => {
      if (shouldLog("debug")) {
        console.debug(...formatMessage(args));
      }
    },
    log: (...args) => {
      if (shouldLog("log")) {
        console.log(...formatMessage(args));
      }
    },
    warn: (...args) => {
      if (shouldLog("warn")) {
        console.warn(...formatMessage(args));
      }
    },
    error: (...args) => {
      if (shouldLog("error")) {
        console.error(...formatMessage(args));
      }
    },
    /** Create a child logger with a sub-prefix */
    child: (childPrefix) => {
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
    namespace: prefix
  };
}
var logger = createLogger();
var silentLogger = {
  debug: () => {
  },
  log: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  child: () => silentLogger,
  isNamespaceEnabled: () => false,
  isProduction: true,
  isDebugEnabled: false,
  namespace: ""
};
var loggers = {
  get core() {
    return createLogger({ prefix: "core" });
  },
  get react() {
    return createLogger({ prefix: "react" });
  },
  get ui() {
    return createLogger({ prefix: "ui" });
  },
  get mcp() {
    return createLogger({ prefix: "mcp" });
  },
  get providers() {
    return createLogger({ prefix: "providers" });
  },
  get research() {
    return createLogger({ prefix: "research" });
  },
  get vectorless() {
    return createLogger({ prefix: "vectorless" });
  },
  get jobs() {
    return createLogger({ prefix: "jobs" });
  },
  get collab() {
    return createLogger({ prefix: "collab" });
  }
};
export {
  cn,
  createLogger,
  getByPath,
  logger,
  loggers,
  resolveArrayProp,
  resolveString,
  resolveValueProp,
  silentLogger
};
//# sourceMappingURL=index.js.map