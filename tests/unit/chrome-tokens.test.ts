import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "../../apps/desktop/renderer/src/tokens.css"), "utf8");
const styles = readFileSync(join(here, "../../apps/desktop/renderer/src/styles.css"), "utf8");
const css = tokens + "\n" + styles;

function block(theme: "dark" | "light"): string {
  const re = new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = tokens.match(re);
  expect(m, `${theme} theme block`).toBeTruthy();
  return m![1]!;
}

describe("shipped stylesheet — native macOS chrome", () => {
  it("leads the UI stack with a system / SF Pro family, not Inter", () => {
    const font = tokens.match(/--font-ui:\s*([^;]+);/);
    expect(font, "--font-ui").toBeTruthy();
    const stack = font![1]!.trim();
    expect(stack.startsWith("-apple-system") || stack.startsWith('"SF Pro Text"') || stack.startsWith('"SF Pro"')).toBe(true);
    expect(stack.toLowerCase().startsWith("inter")).toBe(false);
  });

  it("defines surface, ink, accent, and agent tokens in both appearances", () => {
    for (const theme of ["dark", "light"] as const) {
      const b = block(theme);
      for (const t of ["--bg-0", "--ink-0", "--accent", "--agent", "--engine", "--ok", "--warn", "--err", "--ring"]) expect(b, `${theme} ${t}`).toMatch(new RegExp(`${t}\\s*:`));
    }
  });

  it("keeps all tokens in tokens.css — styles.css never restates a theme block", () => {
    expect(styles).not.toMatch(/\[data-theme="(dark|light)"\]\s*\{/);
    expect(styles).not.toMatch(/--font-ui\s*:/);
  });

  it("honors reduced motion and reduced transparency", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/prefers-reduced-transparency:\s*reduce/);
  });

  it("keeps the toolbar compact at 52px and exposes motion durations as tokens", () => {
    expect(tokens).toMatch(/--toolbar-h:\s*52px/);
    expect(styles).toMatch(/\.toolbar\s*\{[^}]*height:\s*var\(--toolbar-h\)/s);
    expect(tokens).toMatch(/--t-fast:\s*120ms/);
    expect(tokens).toMatch(/--t-med:\s*180ms/);
    expect(tokens).toMatch(/--t-slow:\s*240ms/);
  });

  it("uses tabular numerals for timings", () => {
    expect(styles).toMatch(/\.nums\s*\{\s*font-variant-numeric:\s*tabular-nums/);
  });
});
