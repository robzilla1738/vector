// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act, createRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SettingsNav } from "./SettingsNav";

it("keeps a 32px clear target in the bordered field with a 14px glyph while clearing the exact query and restoring input focus", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"),
    style = document.createElement("style");
  host.style.width = "240px";
  document.body.append(host);
  document.head.append(style);
  const root = createRoot(host),
    input = createRef<HTMLInputElement>();
  const original = "OriginalLongSettingsSearch".repeat(12),
    changes = vi.fn();
  const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const css = readFileSync(join(sourceRoot, "components/Settings.css"), "utf8");
  const tokens = readFileSync(join(sourceRoot, "tokens.css"), "utf8");
  const hit = tokens.match(/--hit:\s*([^;]+);/)![1]!;
  // jsdom does not resolve CSS variables; retain actual shipped rules and substitute
  // only this pinned source token for the source geometry control, not native pixels.
  style.textContent = css
    .match(/^\s*\.settings-search-box(?: input| \.icon-btn) \{[^}]+\}/gm)!
    .join("\n")
    .replaceAll("var(--hit)", hit);
  style.textContent +=
    "\n" +
    readFileSync(join(sourceRoot, "styles/chrome-polish.css"), "utf8").match(
      /:is\(\.session-actions, \.session-heading, \.settings-search-box\) \.icon-btn > \.ci,[\s\S]*?\}/,
    )![0];
  function OriginalParent() {
    const [query, setQuery] = useState(original);
    return (
      <SettingsNav
        query={query}
        onQueryChange={(value) => {
          changes(value);
          setQuery(value);
        }}
        category="General"
        connectionTab="Models"
        searching={!!query}
        memoryAvailable={false}
        downloadNamingAvailable={false}
        profilesAvailable={false}
        linkRoutingAvailable={false}
        appleScriptAvailable={false}
        pluginsAvailable={false}
        automationsAvailable={false}
        servicesAvailable={false}
        vaultAvailable={false}
        permissionsAvailable={false}
        extensionsAvailable={false}
        firstCategory={createRef()}
        firstSearchResult={createRef()}
        searchInput={input}
        onOpenCategory={() => {}}
      />
    );
  }
  try {
    await act(async () => root.render(<OriginalParent />));
    const clear = host.querySelector<HTMLButtonElement>('[aria-label="Clear settings search"]')!;
    expect(input.current!.value).toBe(original);
    expect(getComputedStyle(input.current!).height).toBe("30px");
    expect(getComputedStyle(clear).width).toBe("32px");
    expect(getComputedStyle(clear).height).toBe("32px");
    expect(getComputedStyle(clear).minWidth).toBe("32px");
    expect(getComputedStyle(clear).minHeight).toBe("32px");
    expect(getComputedStyle(clear.querySelector(".ci")!).width).toBe("14px");
    clear.focus();
    expect(document.activeElement).toBe(clear);
    await act(async () => clear.click());
    expect(changes).toHaveBeenCalledExactlyOnceWith("");
    expect(input.current!.value).toBe("");
    expect(document.activeElement).toBe(input.current);
    expect(host.querySelector('[aria-label="Clear settings search"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    vi.unstubAllGlobals();
  }
});
