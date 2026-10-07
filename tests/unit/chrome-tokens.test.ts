import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import ts from "typescript";
import { readCssGraph } from "./read-css-graph.js";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "../../apps/shell/src/tokens.css"), "utf8");
const styles = readCssGraph(join(here, "../../apps/shell/src/styles.css"));
const sharedUi = readFileSync(join(here, "../../apps/shell/src/ui/ui.css"), "utf8");
const conversationCss = readFileSync(join(here, "../../apps/shell/src/components/Conversation.css"), "utf8");
const css = tokens + "\n" + styles;

// Formatting does not change a declaration, selector or numeric CSS value.
function normalizedCss(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .replace(/:\s+/g, ":")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/(^|[^\w-])\.(\d)/g, "$10.$2")
    .trim();
}
function expectCss(actual: string) {
  return {
    toContain(expected: string) {
      expect(normalizedCss(actual)).toContain(normalizedCss(expected));
    },
    not: {
      toContain(expected: string) {
        expect(normalizedCss(actual)).not.toContain(normalizedCss(expected));
      },
    },
  };
}

function block(theme: "dark" | "light"): string {
  const m =
    theme === "dark"
      ? tokens.match(/:root\s*\{([\s\S]*?)\n\s*\}/)
      : tokens.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\s*\}/);
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
      const b = theme === "dark" ? block("dark") : block("dark") + block("light");
      for (const t of [
        "--bg-0",
        "--ink-0",
        "--accent",
        "--agent",
        "--ok",
        "--warn",
        "--err",
        "--wait",
        "--diff-add",
        "--find-match",
        "--ring",
      ])
        expect(b, `${theme} ${t}`).toMatch(new RegExp(`${t}\\s*:`));
    }
    expect(tokens).toMatch(/--surface-panel:\s*var\(--bg-1\)/);
    expectCss(styles).toContain(
      ".app.native-host .main-col.has-page { --page-shell-background: transparent; --stage-bg: transparent; }",
    );
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

  it("uses the Aside alpha palette and translucent window material", () => {
    const dark = block("dark");
    expect(dark).toMatch(/--bg-window:\s*#17171780/);
    expect(dark).toMatch(/--ink-0:\s*rgb\(255 255 255 \/ 85%\)/);
    expect(block("light")).toMatch(/--ink-0:\s*rgb\(0 0 0 \/ 95%\)/);
    expect(dark).toMatch(/--floating-sidebar-surface:\s*#24272b/);
    expect(dark).not.toMatch(/--bg-window:\s*#000000/);
  });

  it("keeps the toolbar compact and exposes reference motion durations as tokens", () => {
    expect(tokens).toMatch(/--toolbar-h:\s*42px/);
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
    expectCss(styles).toContain(
      ':root[data-sidebar-appearance="translucent"] .app-body { background: transparent; }',
    );
    expectCss(styles).toContain(
      ':root[data-sidebar-appearance="translucent"] .main-col { background: var(--page-shell-background, color-mix(in srgb, var(--bg-0) var(--content-opacity, 95%), transparent)); }',
    );
    expectCss(styles).toContain(
      "--window-glass-tint: color-mix(in srgb, var(--sb-bg) var(--sidebar-tint, 0%), transparent);",
    );
    expectCss(styles).toContain(
      ':root[data-sidebar-appearance="translucent"] .sidebar.expanded { background: var(--window-glass-tint); }',
    );
    expectCss(styles).toContain(":is(.chat-sidebar, .rail)");
    expect(tokens).toMatch(/--surface-menu:\s*var\(--bg-2\)/);
    expect(tokens).toMatch(/--hairline:\s*0\.5px/);
    expect(tokens).toMatch(/--squircle-factor:\s*1\.4/);
    expectCss(styles).toContain("corner-shape: superellipse(var(--squircle-factor))");
    expectCss(styles).toContain("var(--surface-menu) 80%, transparent");
    expectCss(styles).toContain("background: var(--surface-menu); backdrop-filter: none;");
    expect(styles).toMatch(/\.folder-kids\s*\{[^}]*overflow:\s*hidden/s);
  });

  it("gives each space a distinct muted hue in both appearances", () => {
    const hues = [
      ...tokens.matchAll(
        /\[data-space="(\w+)"\]\s*\{\s*--space-color:\s*oklch\(var\(--space-l\) [^ ]+ (\d+)\)/g,
      ),
    ].map((m) => `${m[1]}:${m[2]}`);
    expect(hues).toHaveLength(7);
    expect(new Set(hues.filter((h) => !h.startsWith("slate")).map((h) => h.split(":")[1])).size).toBe(6);
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

  it("keeps pinned tiles in two generous columns without growing into square cards", () => {
    expect(styles).toMatch(/\.sb-pins\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    expect(styles).toMatch(/\.sb-pins \.tile-face\s*\{[^}]*height:\s*44px;[^}]*aspect-ratio:\s*auto/);
    expect(styles).not.toMatch(/\.sb-pins\s*\{[^}]*repeat\(5/);
  });

  it("keeps content painted during a left sidebar reveal and scopes the glass to the floating panel", () => {
    expect(styles).not.toContain("html:is(.toolbar-stacked, .sidebar-peek)");
    expectCss(styles).toContain("transform var(--t-floating-out) var(--ease-emphasized)");
    expectCss(styles).not.toContain(".app.sidebar-peek.layout-hidden .main-col");
  });

  it("keeps a loaded page flush and floats the address bar in from the top edge", () => {
    expectCss(styles).toContain(".app.native-host .main-col.has-page > .toolbar");
    expect(styles).toMatch(
      /\.app\.native-host \.main-col\.has-page > \.toolbar\s*\{[^}]*position:\s*absolute/s,
    );
    expect(styles).toMatch(
      /\.app\.native-host \.main-col\.has-page > \.toolbar\s*\{[^}]*background:\s*transparent/s,
    );
    expectCss(styles).toContain(".main-col.toolbar-revealed > .toolbar > :is(.cmdbar, .tb-left, .tb-right)");
    expectCss(styles).toContain(".app.native-host .main-col.toolbar-revealed.has-page");
    expectCss(styles).toContain("translate3d(0, calc(-100% - 10px), 0)");
    expectCss(tokens).toContain("--ease-emphasized: cubic-bezier(.22, 1, .36, 1)");
    expectCss(styles).toContain("var(--ease-emphasized)");
    expectCss(styles).not.toContain("bottom: -64px");
    expectCss(styles).not.toContain("backdrop-filter: blur(22px) saturate(1.4)");
    expect(styles).toMatch(/mask-image:\s*linear-gradient\(\s*to bottom,[^;]*transparent\s*\)/);
    expectCss(styles).toContain(
      ".app.native-host .main-col.toolbar-revealed.has-page > .toolbar :is(.tb-left, .cmdbar:not(.editing), .tb-right)",
    );
    expectCss(styles).toContain(
      "html.toolbar-stacked :is(.app, .app-body, .main-col, .main, .stage-wrap, .stage-card.has-page)",
    );
    expectCss(styles).toContain(
      ".app.native-host:is(.layout-hidden, .layout-rail) .main-col.has-page .stage-wrap > .findbar { padding-left: var(--traffic-inset); }",
    );
    expectCss(styles).toContain(".app.native-host .sidebar.expanded .sb-head.native-host,");
    expectCss(styles).toContain(
      ".app.native-host .sidebar.peek .sb-head.native-host { padding-left: var(--traffic-inset); }",
    );
    expectCss(styles).toContain(
      ".app.native-host .sidebar.fully-hidden.peek { width: var(--sb-w, var(--sidebar-w)); pointer-events: auto; }",
    );
    expectCss(styles).toContain(
      ".app.native-host.tabs-vertical:is(.layout-hidden, .layout-rail) .conversation:not(.conversation-embedded) > .conversation-head { padding-left: var(--traffic-inset); }",
    );
    expectCss(styles).not.toContain(".sidebar.peek { position: absolute");
    // shell state comes from classes React already sets, not document-wide :has() matching
    expect(styles).not.toMatch(/(?:html|:root|\.app|\.main-col|\.stage-wrap):has\(/);
  });

  it("uses one menu entrance, solid scrims and no white favicon plates", () => {
    expect(styles.match(/animation:\s*menu-enter/g)).toHaveLength(1);
    expectCss(styles).not.toContain("@keyframes dialog-enter");
    expect(styles).toMatch(/\.scrim-soft\s*\{[^}]*background:\s*var\(--scrim\)/);
    expect(styles).not.toMatch(/\.scrim-soft\s*\{[^}]*backdrop-filter/);
    expect(styles).not.toMatch(/\.(tab-fav img|pal-ico img|ov-fav|ov-bigfav)\s*\{[^}]*background:\s*#fff/);
    expect(tokens).toMatch(
      /prefers-contrast:\s*more\)\s*\{\s*:root\s*\{[^}]*--hairline:\s*1px[^}]*--focus-ring/,
    );
  });

  it("reveals the URL field and both icon groups together without moving page layout", () => {
    const controls = ".toolbar > :is(.cmdbar, .tb-left, .tb-right)";
    expect(normalizedCss(styles)).toContain(normalizedCss(`${controls} {\n  opacity: 0;`));
    expectCss(styles).toContain(
      ".toolbar:is(:hover, :focus-within, :has(.cmdbar.editing)) > :is(.cmdbar, .tb-left, .tb-right),",
    );
    expectCss(styles).toContain(`@media (hover: none) {\n  ${controls} { opacity: 1; transform: none; }`);
    expectCss(styles).toContain(
      `@media (prefers-reduced-motion: reduce) {\n  ${controls} { transform: none; transition: none; }`,
    );
  });

  it("does not paint a status color strip on answer or member cards", () => {
    expect(styles).not.toMatch(/inset:\s*3px\s+0\s+0/);
    expect(styles).not.toMatch(/inset\s+3px\s+0\s+0/);
    expect(styles).not.toMatch(/inset\s+0\s+-2px\s+0\s+var\(--ok\)/);
  });

  it("keeps blank chrome draggable while controls keep their pointer targets", () => {
    expectCss(styles).toContain(`.app.native-host :is(.sidebar, .toolbar, .rail-head) {
      -webkit-app-region: drag;
    }`);
    expect(styles).not.toMatch(/\.app\.native-host \.sidebar\s*\{[^}]*-webkit-app-region:\s*no-drag/);
    expect(styles).not.toMatch(
      /\.app\.native-host\.tabs-horizontal \.horizontal-chrome > \.toolbar\s*\{[^}]*-webkit-app-region:\s*no-drag/,
    );
    const chromeControls =
      styles.match(
        /\.app\.native-host\s+:is\(\.sidebar, \.toolbar, \.rail-head\)\s+:is\([\s\S]*?\)\s*\{[^}]*-webkit-app-region:\s*no-drag/,
      )?.[0] ?? "";
    for (const target of [
      "button",
      "input",
      "select",
      "summary",
      '[draggable="true"]',
      '[role="separator"]',
    ]) {
      expect(chromeControls).toContain(target);
    }
    expect(styles).toMatch(/\.horizontal-tabs-row\s*\{[^}]*-webkit-app-region:\s*drag/);
  });

  it("keeps waiting, status, diff and find states distinguishable", () => {
    const dark = block("dark");
    const light = block("light");
    expect(tokens).toMatch(/--warn:\s*#facc15/);
    expect(tokens).toMatch(/--wait:\s*var\(--warn\)/);
    expect(tokens).not.toMatch(/--wait:\s*var\(--ok\)/);
    expect(dark).toMatch(/--accent-surface:\s*color-mix/);
    expect(dark + light).toMatch(/--accent-surface:\s*color-mix/);
    expect(styles).toMatch(/\.ctl-chip\.human\s*\{[^}]*color:\s*var\(--wait\)/s);
    expect(styles).toMatch(/\.takeover\s*\{[^}]*background:\s*var\(--wait-soft\)/s);
    expect(styles).toMatch(/\.project-diff \.diff-added\s*\{[^}]*background:\s*var\(--diff-add\)/);
    expect(styles).toMatch(
      /::highlight\(aux-conversation-matches\)\s*\{[^}]*background:\s*var\(--find-match\)/,
    );
    expect(styles).toMatch(/\.sidebar\.peek\s*\{/s);
    expect(styles).toMatch(/\.tl-nest\s*\{/s);
  });
});

describe("session chrome — search, preview, close, settings, attachments", () => {
  const commandBar = readFileSync(join(here, "../../apps/shell/src/components/CommandBar.tsx"), "utf8");
  const commandTabRows = readFileSync(
    join(here, "../../apps/shell/src/components/command-tab-rows.tsx"),
    "utf8",
  );
  const conversation = readFileSync(join(here, "../../apps/shell/src/components/Conversation.tsx"), "utf8");
  const images = readFileSync(join(here, "../../apps/shell/src/components/ConversationImages.tsx"), "utf8");
  const normalizedStyles = normalizedCss(styles);
  const styleIndex = (value: string) => normalizedStyles.indexOf(normalizedCss(value));
  const superellipse = styleIndex("corner-shape: superellipse(var(--squircle-factor))");

  it("uses tokenized rounded suggestions within the address popover", () => {
    expectCss(styles).toContain(".cmdbar, .cb-pop, .main-col");
    expect(styles).toMatch(/\.cb-pop\s*\{[^}]*border-radius:\s*var\(--r-xl\)/);
    expect(readFileSync("apps/shell/src/components/SearchResultRow.css", "utf8")).toMatch(
      /\.search-result-row\s*\{[^}]*border-radius:\s*var\(--r-lg\);/,
    );
    expectCss(styles).toContain("--cb-radius: var(--r-xl)");
    expectCss(styles).toContain("--cb-radius: var(--r-2xl)");
  });

  it("draws the search suggestion enter mark as the circular accent send control and leaves other hints as text keys", () => {
    const results = readFileSync("apps/shell/src/components/omnibox/results.tsx", "utf8");
    expect(results).toMatch(
      /suggestion\.hint === "↵"\s*\?\s*\(\s*<span className="cb-go" aria-hidden="true">/,
    );
    expect(commandBar).toContain('hint: "Ask"');
    expect(commandTabRows).toContain('hint: "Switch to tab"');
    expect(results).toContain('<span className="cb-tab-action">Switch to this tab</span>');
    expectCss(styles).toContain(
      ".cb-go { display: grid; place-items: center; width: var(--control-h); height: var(--control-h); flex: none; border-radius: 50%; corner-shape: round; background: var(--accent); color: var(--accent-ink); }",
    );
    expect(results).toContain("{shellIconSend}");
    expect(commandBar).not.toContain("shellIconEnter");
    expectCss(styles).toContain(
      ".composer-send-actions > .icon-btn,\n.cb-send { flex: none; border-radius: 50%; corner-shape: round; background: var(--accent); color: var(--accent-ink); }",
    );
  });

  it("keeps a conversation page card live and offers Open in tab and Split view", () => {
    expect(conversation).toMatch(/bridge\s*\.preview\(\s*pageId\s*,?\s*\)/);
    expect(conversation).toContain("window.setTimeout(pull, 700)");
    expect(conversation).toContain("img.current.src = image");
    expect(conversation).toContain(">Open in tab</span>");
    const menu = conversation.slice(conversation.indexOf("conversation-preview-menu"));
    expect(menu.indexOf("splitPlan &&")).toBeGreaterThanOrEqual(0);
    expect(menu.indexOf("splitPlan &&")).toBeLessThan(menu.indexOf(">Split view</span>"));
    expect(conversation).toMatch(/\bpreviewSplit\s*\(/);
  });

  it("forces tab close targets round after the shared superellipse rule", () => {
    expect(superellipse).toBeGreaterThanOrEqual(0);
    const round = styleIndex(
      "button.tab-close, button.horizontal-tab-close, button.icon-btn.sm, button.icon-btn.xs { corner-shape: round; }",
    );
    const radius = styleIndex(
      "button.tab-close, button.horizontal-tab-close {\n  width: 22px;\n  height: 22px;\n  border-radius: var(--r-pill);\n}",
    );
    expect(round).toBeGreaterThan(superellipse);
    expect(radius).toBeGreaterThan(superellipse);
  });

  it("keeps settings navigation one quiet selected surface and groups fields into rounded cards", () => {
    const settingsCss = readFileSync("apps/shell/src/settings/shell.css", "utf8");
    expect(normalizedCss(settingsCss)).toContain(
      normalizedCss(
        '.settings-nav button[aria-current="page"] { background: var(--bg-active); color: var(--ink-0); }',
      ),
    );
    expectCss(settingsCss).toContain(
      ".settings-nav button[data-category] { display: flex; align-items: center; gap: 10px;",
    );
    expectCss(settingsCss).toContain("border-radius: 10px;");
    expectCss(settingsCss).not.toContain("box-shadow:");
    expectCss(settingsCss).toContain(
      ".settings-content .drawer-section + .field.ui-setting, .settings-content section > .field.ui-setting:first-child { border-start-start-radius: 14px; border-start-end-radius: 14px; }",
    );
    expectCss(sharedUi).toContain(
      ".ui-settings-group > div { background:var(--surface-secondary); border-radius:var(--r-xl); overflow:hidden; }",
    );
    expectCss(styles).toContain('input:not([type="range"]):not([type="checkbox"]):not([type="radio"])');
    expectCss(styles).not.toContain(
      ".settings-content .field:first-of-type { border-radius: 14px 14px 0 0; }",
    );
    expectCss(styles).not.toContain(
      ".settings-content .field:last-of-type { border-radius: 0 0 14px 14px; }",
    );
  });

  it("opens attachments without hiding run controls and work history", () => {
    for (const dead of [
      ".context-body",
      ".context-attach",
      ".composer-options",
      ".composer-attach",
      ".attach-page",
    ])
      expectCss(styles).not.toContain(dead);
    expectCss(styles).toContain(
      ".capture-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:var(--space-2); }",
    );
    expect(styles).not.toMatch(/capture-actions[^{]*\{[^}]*display:\s*contents/);
    expect(conversation).not.toContain("context-toggle");
    expect(conversation).not.toContain("conversation-memory-head");
    expect(conversation).not.toContain('aria-label="Context sections"');
    expect(images).toContain('className="capture-triggers"');
    expect(images).toContain('className="conversation-capture-rest"');
    const imageSource = ts.createSourceFile(
      "ConversationImages.tsx",
      images,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const imageControls = new Map<string, string>();
    function visit(node: ts.Node) {
      if (
        ts.isJsxElement(node) &&
        node.openingElement.tagName.getText(imageSource) === "ConversationImageAction"
      ) {
        const command = node.openingElement.attributes.properties.find(
          (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(imageSource) === "command",
        );
        if (
          command &&
          ts.isJsxAttribute(command) &&
          command.initializer &&
          ts.isStringLiteral(command.initializer)
        ) {
          imageControls.set(
            command.initializer.text,
            node.children
              .filter(ts.isJsxText)
              .map((child) => child.text.trim())
              .join(""),
          );
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(imageSource);
    expect(imageControls.get("choose-conversation-image")).toBe("Image");
    expect(imageControls.get("capture-conversation-page")).toBe("Capture");
    expectCss(conversationCss).toContain(".conversation .capture-triggers { display:none; }");
    expectCss(styles).toContain(".conversation .run-msg { display: none; }");
    // Run status (Pause/Stop/state badge) and Work history stay visible in chat panels;
    // hiding them regresses the live-run controls — see .conversation .run-msg above.
    expect(styles).not.toMatch(/\.conversation \.run-status[^{}]*display:\s*none/);
    expect(styles).not.toMatch(/\.conversation \.run-section[^{}]*display:\s*none/);
    expectCss(styles).toContain(
      ".composer-send-actions > .icon-btn,\n.cb-send { flex: none; border-radius: 50%; corner-shape: round; background: var(--accent); color: var(--accent-ink); }",
    );
  });
});
