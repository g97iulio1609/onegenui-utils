import { describe, it, expect } from "vitest";
import { isSafeUrl, sanitizeUrl, validateHttpsUrl } from "./url-security";

describe("isSafeUrl", () => {
  it("allows https URLs", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
    expect(isSafeUrl("https://example.com/path?query=1")).toBe(true);
  });

  it("allows http URLs", () => {
    expect(isSafeUrl("http://example.com")).toBe(true);
  });

  it("allows relative URLs", () => {
    expect(isSafeUrl("/path/to/page")).toBe(true);
    expect(isSafeUrl("#anchor")).toBe(true);
    expect(isSafeUrl("page.html")).toBe(true);
  });

  it("allows mailto and tel", () => {
    expect(isSafeUrl("mailto:test@example.com")).toBe(true);
    expect(isSafeUrl("tel:+1234567890")).toBe(true);
  });

  it("blocks javascript: protocol", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isSafeUrl("  javascript:alert(1)")).toBe(false);
  });

  it("blocks data: protocol", () => {
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("blocks vbscript: protocol", () => {
    expect(isSafeUrl("vbscript:alert(1)")).toBe(false);
  });

  it("blocks file: protocol", () => {
    expect(isSafeUrl("file:///etc/passwd")).toBe(false);
  });

  it("handles null and undefined", () => {
    expect(isSafeUrl(null)).toBe(false);
    expect(isSafeUrl(undefined)).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});

describe("sanitizeUrl", () => {
  it("returns safe URLs unchanged", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeUrl("/path")).toBe("/path");
  });

  it("returns # for dangerous URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeUrl("data:text/html,<script>")).toBe("#");
  });

  it("returns # for null/undefined", () => {
    expect(sanitizeUrl(null)).toBe("#");
    expect(sanitizeUrl(undefined)).toBe("#");
  });
});

describe("validateHttpsUrl", () => {
  it("allows https URLs only", () => {
    expect(validateHttpsUrl("https://example.com")).toBe("https://example.com");
  });

  it("rejects http URLs", () => {
    expect(validateHttpsUrl("http://example.com")).toBe(null);
  });

  it("rejects other protocols", () => {
    expect(validateHttpsUrl("javascript:alert(1)")).toBe(null);
    expect(validateHttpsUrl("/path")).toBe(null);
  });

  it("handles null/undefined", () => {
    expect(validateHttpsUrl(null)).toBe(null);
    expect(validateHttpsUrl(undefined)).toBe(null);
  });
});
