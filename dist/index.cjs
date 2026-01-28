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
  getByPath: () => getByPath,
  resolveArrayProp: () => resolveArrayProp,
  resolveString: () => resolveString,
  resolveValueProp: () => resolveValueProp
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cn,
  getByPath,
  resolveArrayProp,
  resolveString,
  resolveValueProp
});
//# sourceMappingURL=index.cjs.map