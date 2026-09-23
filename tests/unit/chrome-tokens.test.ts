import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "../../apps/desktop/renderer/src/tokens.css"), "utf8");
const styles = readFileSync(join(here, "../../apps/desktop/renderer/src/styles.css"), "utf8");
const css = tokens + "\n" + styles;

function block(theme: "dark" | "light"): string {
  const m = theme === "dark"
    ? tokens.match(/:root\s*\{([\s\S]*?)\n\}/)
    : tokens.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/);
  expect(m, `${theme} theme block`).toBeTruthy();
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
    expect(tokens).not.toMatch(/--t-med\s*:/);
    expect(tokens).not.toMatch(/--ease-spring\s*:/);
    expect(tokens).toMatch(/--t-slow:\s*240ms/);
  });

  it("uses an adjustable UI scale from --ui-font-size, never html font-size", () => {
    expect(tokens).toMatch(/--ui-font-size:\s*14px/);
    expect(tokens).toMatch(/--fs-xl:\s*calc\(var\(--ui-font-size\) \+ 4px\)/);
    expect(tokens).toMatch(/--fs-lg:\s*calc\(var\(--ui-font-size\) \+ 2px\)/);
    expect(tokens).toMatch(/--fs-md:\s*var\(--ui-font-size\)/);
    expect(tokens).toMatch(/--fs-sm:\s*calc\(var\(--ui-font-size\) - 1px\)/);
    expect(tokens).not.toMatch(/--fs-caption\s*:/);
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

  it("keeps literal spacing, type, radius, weight and motion values from growing (ratchet: lower these, never raise)", () => {
    const body = styles.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "");
    const literals = (props: string, unit: RegExp) => {
      let n = 0;
      for (const m of body.matchAll(new RegExp(`(?:^|[{;\\s])(?:${props})\\s*:([^;}]*)`, "g"))) n += (m[1]!.match(unit) ?? []).length;
      return n;
    };
    const px = /(?<![\w.-])[1-9]\d*(?:\.\d+)?px/g;
    expect(literals("(?:padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-[a-z-]+)?", px)).toBeLessThanOrEqual(150);
    expect(literals("font-size", /\d+(?:\.\d+)?px/g)).toBeLessThanOrEqual(1);
    expect(literals("border(?:-[a-z]+)*-radius", px)).toBeLessThanOrEqual(13);
    expect(literals("font-weight", /\b\d{3}\b/g)).toBe(0);
    expect(literals("(?:transition|animation)(?:-[a-z-]+)?", /(?<![\w.-])\.?\d+(?:\.\d+)?m?s\b/g)).toBe(0);
    for (const t of ["--fw-regular", "--fw-medium", "--fw-strong", "--fw-semibold", "--r-control", "--t-quick", "--t-reveal", "--t-slide", "--space-2-5"]) expect(tokens).toMatch(new RegExp(`${t}\\s*:`));
    expect(tokens.match(/--r-sm:\s*([^;]+);/)![1]).not.toBe(tokens.match(/--r-md:\s*([^;]+);/)![1]);
  });

  it("gives each space a distinct muted hue in both appearances", () => {
    const hues = [...tokens.matchAll(/\[data-space="(\w+)"\]\s*\{\s*--space-color:\s*oklch\(var\(--space-l\) [^ ]+ (\d+)\)/g)].map(m => `${m[1]}:${m[2]}`);
    expect(hues).toHaveLength(7);
    expect(new Set(hues.filter(h => !h.startsWith("slate")).map(h => h.split(":")[1])).size).toBe(6);
    expect(block("dark")).toMatch(/--space-l:/);
    expect(block("light")).toMatch(/--space-l:/);
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

  it("keeps a loaded page flush and floats the address bar in from the top edge", () => {
    expect(styles).toContain(".app.electron .main-col.has-page > .toolbar");
    expect(styles).toMatch(/\.app\.electron \.main-col\.has-page > \.toolbar\s*\{[^}]*position:\s*absolute/s);
    expect(styles).toMatch(/\.app\.electron \.main-col\.has-page > \.toolbar\s*\{[^}]*background:\s*transparent/s);
    expect(styles).toContain(".main-col.toolbar-revealed > .toolbar > :is(.cmdbar, .tb-left, .tb-right)");
    expect(styles).toContain(".app.electron .main-col.toolbar-revealed.has-page");
    expect(styles).toContain("translate3d(0, calc(-100% - 10px), 0)");
    expect(tokens).toContain("--ease-emphasized: cubic-bezier(.22, 1, .36, 1)");
    expect(styles).toContain("var(--ease-emphasized)");
    expect(styles).not.toContain("bottom: -64px");
    expect(styles).not.toContain("backdrop-filter: blur(22px) saturate(1.4)");
    expect(styles).toContain("transparent 72%, transparent 100%");
    expect(styles).toContain(".app.electron .main-col.toolbar-revealed.has-page > .toolbar :is(.tb-left, .cmdbar:not(.editing), .tb-right)");
    expect(styles).toContain("html:is(.toolbar-stacked, .sidebar-peek) :is(.app, .app-body, .main-col, .main, .stage-wrap, .stage-card.has-page)");
    expect(styles).toContain(".app.electron:is(.layout-hidden, .layout-rail) .main-col.has-page .stage-wrap > .findbar { padding-left: var(--traffic-inset); }");
    expect(styles).toContain(".app.electron .sidebar.expanded .sb-head.electron,");
    expect(styles).toContain(".app.electron .sidebar.peek .sb-head.electron { padding-left: var(--traffic-inset); }");
    expect(styles).toContain(".app.electron .sidebar.fully-hidden.peek { width: var(--sb-w, var(--sidebar-w)); pointer-events: auto; }");
    expect(styles).toContain(".app.electron:is(.layout-hidden, .layout-rail):not(.sidebar-peek) .conversation:not(.conversation-embedded) > .conversation-head { padding-left: var(--traffic-inset); }");
    expect(styles).not.toContain(".sidebar.peek { position: absolute");
    // shell state comes from classes React already sets, not document-wide :has() matching
    expect(styles).not.toMatch(/(?:html|:root|\.app|\.main-col|\.stage-wrap):has\(/);
  });

  it("uses one menu entrance, solid scrims and no white favicon plates", () => {
    expect(styles.match(/animation:\s*menu-enter/g)).toHaveLength(1);
    expect(styles).not.toContain("@keyframes dialog-enter");
    expect(styles).toMatch(/\.scrim-soft\s*\{[^}]*background:\s*var\(--scrim\)/);
    expect(styles).not.toMatch(/\.scrim-soft\s*\{[^}]*backdrop-filter/);
    expect(styles).not.toMatch(/\.(tab-fav img|pal-ico img|ov-fav|ov-bigfav)\s*\{[^}]*background:\s*#fff/);
    expect(tokens).toMatch(/prefers-contrast:\s*more\)\s*\{\s*:root\s*\{[^}]*--hairline:\s*1px[^}]*--focus-ring/);
  });

  it("reveals the URL field and both icon groups together without moving page layout", () => {
    const controls = ".toolbar > :is(.cmdbar, .tb-left, .tb-right)";
    expect(styles).toContain(`${controls} {\n  opacity: 0;`);
    expect(styles).toContain(".toolbar:is(:hover, :focus-within, :has(.cmdbar.editing)) > :is(.cmdbar, .tb-left, .tb-right),");
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

describe("session chrome — search, preview, close, settings, attachments", () => {
  const commandBar = readFileSync(join(here, "../../apps/desktop/renderer/src/components/CommandBar.tsx"), "utf8");
  const conversation = readFileSync(join(here, "../../apps/desktop/renderer/src/components/Conversation.tsx"), "utf8");
  const images = readFileSync(join(here, "../../apps/desktop/renderer/src/components/ConversationImages.tsx"), "utf8");
  const superellipse = styles.indexOf("corner-shape: superellipse(var(--squircle-factor))");

  it("uses one corner for the address field and its suggestion menu", () => {
    expect(styles).toContain(".cmdbar, .cb-pop, .main-col");
    expect(styles).toMatch(/\.cb-pop\s*\{[^}]*border-radius:\s*var\(--cb-radius\)/);
    expect(styles).toMatch(/\.cb-opt\s*\{[^}]*border-radius:\s*0;/);
    expect(styles).toContain("--cb-radius: var(--r-xl)");
    expect(styles).toContain("--cb-radius: var(--r-2xl)");
  });

  it("draws the search suggestion enter mark as the circular accent send control and leaves other hints as text keys", () => {
    expect(commandBar).toContain('s.hint === "↵" ? <span className="cb-go" aria-hidden="true">{I.send}</span> : s.hint ? <kbd>{s.hint}</kbd> : null');
    expect(commandBar).toContain('hint: "Ask"');
    expect(commandBar).toContain('hint: "Switch"');
    expect(styles).toContain(".cb-go { display: grid; place-items: center; width: var(--control-h); height: var(--control-h); flex: none; border-radius: 50%; corner-shape: round; background: var(--accent); color: var(--accent-ink); }");
    expect(commandBar).toContain("{I.send}");
    expect(commandBar).not.toContain("I.enter");
    expect(styles).toContain(".conversation-input > .icon-btn,\n.cb-send { flex: none; border-radius: 50%; corner-shape: round; background: var(--accent); color: var(--accent-ink); }");
  });

  it("keeps a conversation page card live and offers Open in tab and Split view", () => {
    expect(conversation).toContain("bridge.watchPreview(pageId)");
    expect(conversation).toContain("bridge.onPreviewFrame");
    expect(conversation).toContain("img.current.src = image");
    expect(conversation).toContain(">Open in tab</span>");
    const menu = conversation.slice(conversation.indexOf("conversation-preview-menu"));
    expect(menu.indexOf("splitPlan &&")).toBeGreaterThanOrEqual(0);
    expect(menu.indexOf("splitPlan &&")).toBeLessThan(menu.indexOf(">Split view</span>"));
    expect(conversation).toContain("previewSplit(layout, pages, selectedContext.pageId, activePageId)");
  });

  it("forces tab close targets round after the shared superellipse rule", () => {
    expect(superellipse).toBeGreaterThanOrEqual(0);
    const round = styles.indexOf("button.tab-close, button.horizontal-tab-close, button.icon-btn.sm, button.icon-btn.xs { corner-shape: round; }");
    const radius = styles.indexOf("button.tab-close, button.horizontal-tab-close {\n  width: 22px;\n  height: 22px;\n  border-radius: var(--r-pill);\n}");
    expect(round).toBeGreaterThan(superellipse);
    expect(radius).toBeGreaterThan(superellipse);
  });

  it("keeps settings navigation one quiet selected surface and groups fields into rounded cards", () => {
    const flat = styles.indexOf('.settings-nav button:hover, .settings-nav button[aria-current] { background: var(--bg-active);');
    const selected = styles.indexOf('.settings-nav button[aria-current="page"] { background: var(--surface-primary); color: var(--ink-0); box-shadow: none; }');
    expect(selected).toBeGreaterThan(flat);
    expect(selected).toBeGreaterThan(superellipse);
    expect(styles).toContain("settings-nav button {\n  display: flex;\n  align-items: center;\n  gap: var(--space-2-5);");
    expect(styles).toContain("border-radius: var(--r-control);\n  corner-shape: round;");
    expect(styles).toContain(".settings-content .drawer-section + .field,\n.settings-content section > .field:first-child { border-start-start-radius: var(--r-xl); border-start-end-radius: var(--r-xl); }");
    expect(styles).toContain(".settings-content .field:not(:has(+ .field)) { border-end-start-radius: var(--r-xl); border-end-end-radius: var(--r-xl); border-bottom-color: transparent; }");
    expect(styles).not.toContain(".settings-content .field:first-of-type { border-radius: 14px 14px 0 0; }");
    expect(styles).not.toContain(".settings-content .field:last-of-type { border-radius: 0 0 14px 14px; }");
  });

  it("opens attachments as one row and hides conversation options and work history", () => {
    for (const dead of [".context-body", ".context-attach", ".composer-options", ".composer-attach", ".attach-page"]) expect(styles).not.toContain(dead);
    expect(styles).toContain(".capture-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:var(--space-2); }");
    expect(styles).not.toMatch(/capture-actions[^{]*\{[^}]*display:\s*contents/);
    expect(conversation).not.toContain("context-toggle");
    expect(conversation).not.toContain("conversation-memory-head");
    expect(conversation).not.toContain('aria-label="Context sections"');
    expect(images).toContain('className="capture-triggers"');
    expect(images).toContain('className="conversation-capture-rest"');
    expect(images).toContain(">Image</button>");
    expect(images).toContain(">Capture</button>");
    expect(styles).toContain(".conversation .capture-triggers { display:none; }");
    expect(styles).toContain(".conversation .run-msg { display: none; }");
    // Run status (Pause/Stop/state badge) and Work history stay visible in chat panels;
    // hiding them regresses the live-run controls — see .conversation .run-msg above.
    expect(styles).not.toMatch(/\.conversation \.run-status[^{}]*display:\s*none/);
    expect(styles).not.toMatch(/\.conversation \.run-section[^{}]*display:\s*none/);
    expect(styles).toContain(".conversation-input > .icon-btn,\n.cb-send { flex: none; border-radius: 50%; corner-shape: round; background: var(--accent); color: var(--accent-ink); }");

  });
});
