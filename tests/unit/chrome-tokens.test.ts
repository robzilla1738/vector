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
  it("uses Geist consistently across the browser and agent surfaces", () => {
    expect(tokens).not.toMatch(/PP Mori/);
    const font = tokens.match(/--font-ui:\s*([^;]+);/);
    expect(font, "--font-ui").toBeTruthy();
    expect(font![1]!.trim().startsWith('"Geist Variable"')).toBe(true);
    expect(font![1]).not.toContain("Inter");
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

  it("uses the reference neutral palette and translucent surface layers", () => {
    const dark = block("dark");
    expect(dark).toMatch(/--bg-window:\s*oklch\(20\.5% 0 0\)/);
    expect(dark).toMatch(/--bg-1:\s*oklch\(26\.9% 0 0\)/);
    expect(dark).not.toMatch(/--bg-window:\s*#000000/);
  });

  it("keeps the toolbar compact and exposes reference motion durations as tokens", () => {
    expect(tokens).toMatch(/--toolbar-h:\s*40px/);
    expect(styles).toMatch(/\.toolbar\s*\{[^}]*height:\s*var\(--toolbar-h\)/s);
    expect(tokens).toMatch(/--t-fast:\s*150ms/);
    expect(tokens).toMatch(/--t-med:\s*150ms/);
    expect(tokens).toMatch(/--t-slow:\s*240ms/);
  });

  it("uses an adjustable UI scale from --ui-font-size, never html font-size", () => {
    expect(tokens).toMatch(/--ui-font-size:\s*14px/);
    expect(tokens).toMatch(/--fs-xl:\s*calc\(var\(--ui-font-size\) \+ 4px\)/);
    expect(tokens).toMatch(/--fs-lg:\s*calc\(var\(--ui-font-size\) \+ 2px\)/);
    expect(tokens).toMatch(/--fs-md:\s*var\(--ui-font-size\)/);
    expect(tokens).toMatch(/--fs-caption:\s*calc\(var\(--ui-font-size\) - 1px\)/);
    expect(styles).not.toMatch(/html\s*\{[^}]*font-size\s*:/);
  });

  it("keeps native material visible and provides a solid menu fallback", () => {
    expect(styles).toContain(':root[data-sidebar-appearance="translucent"] .app-body { background: transparent; }');
    expect(styles).toContain(':root[data-sidebar-appearance="translucent"] .main-col { background: color-mix(in srgb, var(--bg-0) var(--content-opacity, 95%), transparent); }');
    expect(styles).toContain(':root[data-sidebar-appearance="translucent"] .sidebar.expanded { background: color-mix(in srgb, var(--sb-bg) var(--sidebar-tint, 0%), transparent); }');
    expect(tokens).toMatch(/--surface-menu:\s*var\(--bg-2\)/);
    expect(tokens).toMatch(/--hairline:\s*0\.5px/);
    expect(tokens).toMatch(/--squircle-factor:\s*1\.4/);
    expect(styles).toContain("corner-shape: superellipse(var(--squircle-factor))");
    expect(styles).toContain("var(--surface-menu) 80%, transparent");
    expect(styles).toContain("background: var(--surface-menu); backdrop-filter: none;");
    expect(styles).toMatch(/\.folder-kids\s*\{[^}]*overflow:\s*hidden/s);
  });

  it("uses tabular numerals for timings", () => {
    expect(styles).toMatch(/\.nums\s*\{\s*font-variant-numeric:\s*tabular-nums/);
  });

  it("uses the reference editor growth limit and collapsible section tracks", () => {
    expect(styles).toMatch(/\.conversation-input > textarea\s*\{[^}]*max-height:\s*calc\(15lh \+ 1rem\)/);
    expect(styles).toMatch(/\.sidebar-section-body\s*\{[^}]*grid-template-rows:\s*0fr/);
    expect(styles).toMatch(/\.sidebar-section-body\.open\s*\{[^}]*grid-template-rows:\s*1fr/);
  });

  it("lets pinned tiles fill their row without growing into square cards", () => {
    expect(styles).toMatch(/\.sb-pins\s*\{[^}]*grid-auto-flow:\s*column;[^}]*grid-auto-columns:\s*minmax\(0, 1fr\)/);
    expect(styles).toMatch(/\.sb-pins \.tile-face\s*\{[^}]*height:\s*40px;[^}]*aspect-ratio:\s*auto/);
    expect(styles).not.toMatch(/\.sb-pins\s*\{[^}]*repeat\(5/);
  });

  it("reveals the URL field and both icon groups together without moving page layout", () => {
    const controls = ".toolbar > :is(.cmdbar, .tb-left, .tb-right)";
    expect(styles).toContain(`${controls} {\n  opacity: 0;`);
    expect(styles).toContain(".toolbar:is(:hover, :focus-within, :has(.cmdbar.editing)) > :is(.cmdbar, .tb-left, .tb-right)");
    expect(styles).toContain(`@media (hover: none) {\n  ${controls} { opacity: 1; transform: none; }`);
    expect(styles).toContain(`@media (prefers-reduced-motion: reduce) {\n  ${controls} { transform: none; transition: none; }`);
  });

  it("does not paint a status color strip on answer or member cards", () => {
    expect(styles).not.toMatch(/inset:\s*3px\s+0\s+0/);
    expect(styles).not.toMatch(/inset\s+3px\s+0\s+0/);
    expect(styles).not.toMatch(/inset\s+0\s+-2px\s+0\s+var\(--ok\)/);
  });

  it("keeps waiting, status, diff and find states distinguishable", () => {
    const dark = block("dark");
    const light = block("light");
    expect(tokens).toMatch(/--wait:\s*#fbbf24/);
    expect(tokens).not.toMatch(/--wait:\s*var\(--ok\)/);
    expect(dark).toMatch(/--accent-surface:\s*color-mix/);
    expect(light).toMatch(/--accent-surface:\s*color-mix/);
    expect(styles).toMatch(/\.ctl-chip\.human\s*\{[^}]*color:\s*var\(--wait\)/s);
    expect(styles).toMatch(/\.takeover\s*\{[^}]*background:\s*var\(--wait-soft\)/s);
    expect(styles).toMatch(/\.project-diff \.diff-added\s*\{[^}]*background:\s*var\(--diff-add\)/);
    expect(styles).toMatch(/::highlight\(aux-conversation-matches\)\s*\{[^}]*background:\s*var\(--find-match\)/);
    expect(styles).toMatch(/\.sidebar\.peek\s*\{/s);
    expect(styles).toMatch(/\.tl-nest\s*\{/s);
  });
});
