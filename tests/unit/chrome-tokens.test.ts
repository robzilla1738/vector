import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const cssPath = join(dirname(fileURLToPath(import.meta.url)), "../../apps/desktop/renderer/src/styles.css");
const css = readFileSync(cssPath, "utf8");

function block(theme: "dark" | "light"): string {
  const re = new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = css.match(re);
  expect(m, `${theme} theme block`).toBeTruthy();
  return m![1]!;
}

describe("shipped stylesheet — native macOS chrome", () => {
  it("leads the UI stack with a system / SF Pro family, not Inter", () => {
    const font = css.match(/--font-ui:\s*([^;]+);/);
    expect(font, "--font-ui").toBeTruthy();
    const stack = font![1]!.trim();
    expect(stack.startsWith("-apple-system") || stack.startsWith('"SF Pro Text"') || stack.startsWith('"SF Pro"')).toBe(
      true,
    );
    expect(stack.toLowerCase().startsWith("inter")).toBe(false);
    expect(stack).not.toMatch(/^"?Inter/);
  });

  it("defines surface, ink, and accent tokens in both appearances", () => {
    for (const theme of ["dark", "light"] as const) {
      const b = block(theme);
      expect(b).toMatch(/--bg-0\s*:/);
      expect(b).toMatch(/--ink-0\s*:/);
      expect(b).toMatch(/--accent\s*:/);
    }
  });

  it("honors reduced motion", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  it("keeps the toolbar compact at 52px", () => {
    expect(css).toMatch(/--toolbar-h:\s*52px/);
    expect(css).toMatch(/\.toolbar\s*\{[^}]*height:\s*var\(--toolbar-h\)/s);
  });
});
