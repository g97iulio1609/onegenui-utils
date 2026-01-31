"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  cn: () => cn,
  createLogger: () => createLogger,
  getByPath: () => getByPath,
  logger: () => logger,
  resolveArrayProp: () => resolveArrayProp,
  resolveString: () => resolveString,
  resolveValueProp: () => resolveValueProp,
  silentLogger: () => silentLogger
});
module.exports = __toCommonJS(index_exports);

// src/cn.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
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
function createLogger(config = {}) {
  const { forceEnabled = false, prefix = "", minLevel } = config;
  const effectiveMinLevel = minLevel ?? envLogLevel ?? (isProduction && !debugEnabled ? "warn" : "debug");
  const shouldLog = (level) => {
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
    /** Check if logger is in production mode */
    isProduction,
    /** Check if debug mode is enabled */
    isDebugEnabled: debugEnabled || forceEnabled
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
  isProduction: true,
  isDebugEnabled: false
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cn,
  createLogger,
  getByPath,
  logger,
  resolveArrayProp,
  resolveString,
  resolveValueProp,
  silentLogger
});
//# sourceMappingURL=index.cjs.map