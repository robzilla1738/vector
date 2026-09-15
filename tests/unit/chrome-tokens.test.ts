import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "../../apps/desktop/renderer/src/tokens.css"), "utf8");
const styles = readFileSync(join(here, "../../apps/desktop/renderer/src/styles.css"), "utf8");
const css = tokens + "\n" + styles;

function block(theme: "dark" | "light"): string {
  if (theme === "dark") {
    const m = tokens.match(/:root\s*\{([\s\S]*?)\n\}/);
    expect(m, "dark tokens on :root").toBeTruthy();
    return m![1]!;
  }
  const m = tokens.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/);
  expect(m, "light theme block").toBeTruthy();
  return m![1]!;
}

describe("shipped stylesheet — native macOS chrome", () => {
  it("leads the UI stack with Inter Variable", () => {
    expect(tokens).not.toMatch(/PP Mori/);
    const font = tokens.match(/--font-ui:\s*([^;]+);/);
    expect(font, "--font-ui").toBeTruthy();
    expect(font![1]!.trim().startsWith('"Inter Variable"')).toBe(true);
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

  it("keeps chrome on a 4px grid: 16px icons, 24px chips, 28/32px controls", () => {
    expect(tokens).toMatch(/--ico:\s*16px/);
    expect(tokens).toMatch(/--ico-sm:\s*14px/);
    expect(tokens).toMatch(/--chip-h:\s*24px/);
    expect(tokens).toMatch(/--badge-h:\s*20px/);
    expect(tokens).toMatch(/--control-h:\s*28px/);
    expect(tokens).toMatch(/--control-h-lg:\s*32px/);
    expect(tokens).toMatch(/--row-h:\s*32px/);
    expect(styles).toMatch(/\.ci\.ico-md\s*\{[^}]*width:\s*var\(--ico\)/);
    expect(styles).toMatch(/\.ctl-chip\s*\{[^}]*height:\s*var\(--chip-h\)/s);
    expect(styles).toMatch(/\.cmdbar\.compact\s*\{[^}]*height:\s*var\(--control-h-lg\)/s);
    expect(styles).not.toMatch(/\.ci svg path\s*\{[^}]*fill:\s*currentColor/);
  });

  it("ships a lifted charcoal dark, not OLED black", () => {
    const window = tokens.match(/--bg-window:\s*(#[0-9a-fA-F]{6})/);
    expect(window, "--bg-window").toBeTruthy();
    const hex = window![1]!;
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    expect((r + g + b) / 3).toBeGreaterThan(24);
  });

  it("keeps the toolbar compact at 52px and exposes motion durations as tokens", () => {
    expect(tokens).toMatch(/--toolbar-h:\s*52px/);
    expect(styles).toMatch(/\.toolbar\s*\{[^}]*height:\s*var\(--toolbar-h\)/s);
    expect(tokens).toMatch(/--t-fast:\s*120ms/);
    expect(tokens).toMatch(/--t-med:\s*180ms/);
    expect(tokens).toMatch(/--t-slow:\s*240ms/);
  });

  it("uses Inter’s product scale: 12 caption, 12 control, 13 body, 15 title", () => {
    expect(tokens).toMatch(/--fs-xs:\s*12px/);
    expect(tokens).toMatch(/--fs-sm:\s*12px/);
    expect(tokens).toMatch(/--fs-md:\s*13px/);
    expect(tokens).toMatch(/--fs-lg:\s*15px/);
    expect(tokens).toMatch(/--fs-xl:\s*18px/);
  });

  it("uses a gray Arc sidebar with a raised selected pill in both appearances", () => {
    const dark = block("dark");
    const light = block("light");
    expect(dark).toMatch(/--sb-bg:\s*#1f1f1f/);
    expect(dark).toMatch(/--bg-window:\s*#1f1f1f/);
    expect(dark).toMatch(/--sb-selected:\s*#323230/);
    expect(dark).toMatch(/--sb-selected-ink:\s*#f4f4f2/);
    expect(light).toMatch(/--sb-bg:\s*#eeeeec/);
    expect(light).toMatch(/--bg-window:\s*#eeeeec/);
    expect(light).toMatch(/--sb-selected:\s*#ffffff/);
    expect(light).toMatch(/--sb-selected-ink:\s*#1a1a18/);
    expect(tokens).toMatch(/--sb-selected-shadow:/);
    expect(tokens).toMatch(/--stage-radius:\s*var\(--r-2xl\)/);
    expect(styles).toMatch(/\.stage-wrap\s*\{[^}]*padding:\s*var\(--stage-inset\)/s);
    expect(styles).toMatch(/\.tab-row\.active\s*\{[^}]*box-shadow:\s*var\(--sb-selected-shadow\)/s);
    expect(styles).toMatch(/\.sb-pins\s*\{[^}]*grid-template-columns:\s*repeat\(5/s);
    expect(styles).toMatch(/\.folder-block\.open:hover\s*\{[^}]*background:\s*var\(--sb-field\)/s);
    expect(styles).toMatch(/\.folder-kids \.tab-row\s*\{[^}]*padding-left:\s*calc\(var\(--space-2\) \+ var\(--fav\) \+ var\(--space-2\)\)/s);
    expect(styles).toMatch(/\.folder-kids\s*\{[^}]*overflow:\s*hidden/s);
  });

  it("uses tabular numerals for timings", () => {
    expect(styles).toMatch(/\.nums\s*\{\s*font-variant-numeric:\s*tabular-nums/);
  });

  it("does not paint a status color strip on answer or member cards", () => {
    expect(styles).not.toMatch(/inset:\s*3px\s+0\s+0/);
    expect(styles).not.toMatch(/inset\s+3px\s+0\s+0/);
    expect(styles).not.toMatch(/inset\s+0\s+-2px\s+0\s+var\(--ok\)/);
  });
});
