/**
 * URL Security Utilities
 *
 * Validates and sanitizes URLs to prevent XSS via javascript: protocol
 * and other dangerous URL schemes.
 */

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Checks if a URL is safe for use in href attributes
 * Blocks javascript:, data:, vbscript: and other dangerous protocols
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) return false;
  }

  // Allow relative URLs
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;

  // Allow safe protocols
  for (const protocol of ALLOWED_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) return true;
  }

  // Allow protocol-relative URLs
  if (trimmed.startsWith("//")) return true;

  // Block anything else that looks like a protocol
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;

  // Allow plain strings (relative URLs without slash)
  return true;
}

/**
 * Sanitizes a URL for safe use in href attributes
 * Returns a safe fallback if the URL is dangerous
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (isSafeUrl(url)) return url!;
  return "#";
}

/**
 * Validates and returns URL only if it uses https protocol
 * For stricter security contexts
 */
export function validateHttpsUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("https://")) return url;
  return null;
}
