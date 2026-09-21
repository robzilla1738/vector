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
  it("leads the UI stack with the native macOS system font and keeps Inter as fallback", () => {
    expect(tokens).not.toMatch(/PP Mori/);
    const font = tokens.match(/--font-ui:\s*([^;]+);/);
    expect(font, "--font-ui").toBeTruthy();
    expect(font![1]!.trim().startsWith("-apple-system")).toBe(true);
    expect(font![1]).toContain('"Inter Variable"');
  });

  it("defines surface, ink, accent, and agent tokens in both appearances", () => {
    for (const theme of ["dark", "light"] as const) {
      const b = block(theme);
      for (const t of ["--bg-0", "--ink-0", "--accent", "--agent", "--engine", "--ok", "--warn", "--err", "--wait", "--diff-add", "--find-match", "--ring"]) expect(b, `${theme} ${t}`).toMatch(new RegExp(`${t}\\s*:`));
    }
    expect(tokens).toMatch(/--surface-panel:\s*var\(--bg-1\)/);
    expect(tokens).toMatch(/--surface-menu:\s*var\(--bg-2\)/);
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

  it("ships Zai Dark canvas under a lifted panel, not OLED black", () => {
    const dark = block("dark");
    expect(dark).toMatch(/--bg-window:\s*#161616/);
    expect(dark).toMatch(/--bg-1:\s*#202020/);
    expect(dark).not.toMatch(/--bg-window:\s*#000000/);
  });

  it("keeps the toolbar compact at 48px and exposes motion durations as tokens", () => {
    expect(tokens).toMatch(/--toolbar-h:\s*48px/);
    expect(styles).toMatch(/\.toolbar\s*\{[^}]*height:\s*var\(--toolbar-h\)/s);
    expect(tokens).toMatch(/--t-fast:\s*120ms/);
    expect(tokens).toMatch(/--t-med:\s*180ms/);
    expect(tokens).toMatch(/--t-slow:\s*240ms/);
  });

  it("uses an adjustable UI scale from --ui-font-size, never html font-size", () => {
    expect(tokens).toMatch(/--ui-font-size:\s*13px/);
    expect(tokens).toMatch(/--fs-xl:\s*calc\(var\(--ui-font-size\) \+ 4px\)/);
    expect(tokens).toMatch(/--fs-lg:\s*calc\(var\(--ui-font-size\) \+ 2px\)/);
    expect(tokens).toMatch(/--fs-md:\s*var\(--ui-font-size\)/);
    expect(tokens).toMatch(/--fs-caption:\s*calc\(var\(--ui-font-size\) - 1px\)/);
    expect(styles).not.toMatch(/html\s*\{[^}]*font-size\s*:/);
  });

  it("uses a gray sidebar with a raised selected pill in both appearances", () => {
    const dark = block("dark");
    const light = block("light");
    expect(dark).toMatch(/--sb-bg:\s*#161616/);
    expect(dark).toMatch(/--bg-window:\s*#161616/);
    expect(dark).toMatch(/--sb-selected:\s*#2b2b2b/);
    expect(dark).toMatch(/--sb-selected-ink:\s*#f8f8f8/);
    expect(light).toMatch(/--sb-bg:\s*#f0f0f0/);
    expect(light).toMatch(/--bg-window:\s*#f8f8f8/);
    expect(light).toMatch(/--sb-selected:\s*#ffffff/);
    expect(light).toMatch(/--sb-selected-ink:\s*#0d0d0d/);
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

  it("keeps waiting chips on --wait, distinct from success, and diffs off status green/red", () => {
    expect(tokens).toMatch(/--wait:\s*#87d9a4/);
    expect(tokens).not.toMatch(/--wait:\s*var\(--ok\)/);
    expect(styles).toMatch(/\.ctl-chip\.human\s*\{[^}]*color:\s*var\(--wait\)/s);
    expect(styles).toMatch(/\.takeover\s*\{[^}]*background:\s*var\(--wait-soft\)/s);
    expect(styles).toMatch(/\.project-diff \.diff-added\s*\{[^}]*background:\s*var\(--diff-add\)/);
    expect(styles).toMatch(/::highlight\(aux-conversation-matches\)\s*\{[^}]*background:\s*var\(--find-match\)/);
    expect(styles).toMatch(/\.sidebar-rail\s*\{/s);
    expect(styles).toMatch(/\.tl-nest\s*\{/s);
  });
});
