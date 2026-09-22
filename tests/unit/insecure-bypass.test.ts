import { expect, it } from "vitest";
import { createInsecureBypass } from "../../apps/desktop/main/insecure-bypass.js";

it("proceeds an HTTPS host case-insensitively and only for that host", () => {
  const bypass = createInsecureBypass();
  expect(bypass.proceed("https://SelfSigned.Test/path?q=1")).toBe("selfsigned.test");
  expect(bypass.has("selfsigned.test")).toBe(true);
  expect(bypass.has("SELFSIGNED.test")).toBe(true);
  expect(bypass.has("other.test")).toBe(false);
  expect(bypass.has("sub.selfsigned.test")).toBe(false);
});

it("rejects non-HTTPS schemes and malformed addresses", () => {
  const bypass = createInsecureBypass();
  for (const url of ["http://site.test", "file:///etc/passwd", "javascript:alert(1)", "chrome://flags", "not a url", ""]) {
    expect(() => bypass.proceed(url), url).toThrow();
    expect(bypass.has("site.test")).toBe(false);
  }
});

it("clear removes every bypassed host", () => {
  const bypass = createInsecureBypass();
  bypass.proceed("https://a.test");
  bypass.proceed("https://b.test");
  bypass.clear();
  expect(bypass.has("a.test")).toBe(false);
  expect(bypass.has("b.test")).toBe(false);
});
