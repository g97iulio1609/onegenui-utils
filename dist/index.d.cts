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

export { cn, getByPath, resolveArrayProp, resolveString, resolveValueProp };
