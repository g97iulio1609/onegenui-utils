/**
 * Data resolution utilities
 */

/**
 * Gets a value from a nested object using JSON Pointer or path notation.
 * Supports both "/root/path" and "root/path" formats.
 */
export function getByPath(obj: unknown, path: string): unknown {
  if (!path || path === "/") {
    return obj;
  }

  const segments = path.startsWith("/")
    ? path.slice(1).split("/")
    : path.split("/");

  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function resolveArrayProp<T>(
  data: unknown,
  items?: T[] | null,
  dataPath?: string | null,
): T[] | undefined {
  if (Array.isArray(items)) return items;
  if (!dataPath) return undefined;
  const resolved = getByPath(data, dataPath);
  return Array.isArray(resolved) ? (resolved as T[]) : undefined;
}

export function resolveValueProp<T>(
  data: unknown,
  value?: T | { path: string } | null,
  valuePath?: string | null,
): T | undefined {
  if (value && typeof value === "object" && "path" in value) {
    return getByPath(data, value.path) as T | undefined;
  }
  if (value !== null && value !== undefined) {
    return value as T;
  }
  if (valuePath) {
    return getByPath(data, valuePath) as T | undefined;
  }
  return undefined;
}

export function resolveString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}
