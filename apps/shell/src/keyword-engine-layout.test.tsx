// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("./bridge", () => ({ bridge: { windowId: "one", privateMode: false } }));
vi.mock("./store", () => ({ errToast: vi.fn() }));
vi.mock("./commands", async () => {
  const { invokeScopedControl } = await import("./scoped-control-commands");
  return {
    executeCommand: (id: string, context: object) => {
      try {
        return Promise.resolve(invokeScopedControl(id, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
import { SearchEnginesSetting } from "./components/SearchEnginesSetting";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const longName = "W".repeat(60),
  longUrl = `https://example.com/${"a".repeat(1000)}?q=%s`;
const engine = { keyword: "long_keyword_123", name: longName, template: longUrl };
let host: HTMLDivElement, root: Root, style: HTMLStyleElement;
const settings = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "components/Settings.css"),
  "utf8",
);
beforeEach(() => {
  mocks.save.mockReset().mockResolvedValue(true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  host.className = "settings-content";
  document.body.append(host);
  style = document.createElement("style");
  // Apply genuine flat rules because jsdom does not parse CSS layers/container queries.
  style.textContent = [
    ...settings.matchAll(
      /(?:\.search-engines-setting[^{}]*|\.engine-[^{}]*|\.settings-content \.btn |\.settings-content \.row |\.settings-content :is\(input, select, textarea, \.btn\):focus-visible )\{[^}]*\}/g,
    ),
  ]
    .map((row) => row[0])
    .join("\n");
  document.head.append(style);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  vi.restoreAllMocks();
});
async function render() {
  await act(async () => root.render(<SearchEnginesSetting value={[engine]} onSave={mocks.save} />));
}
it("keeps full keyword, valid sixty-character name and long URL in their original visible text nodes", async () => {
  await render();
  const row = host.querySelector(".engine-row")!;
  expect(row.querySelector(".engine-kw")!.textContent).toBe(engine.keyword);
  expect(row.querySelector(".engine-name")!.textContent).toBe(longName);
  expect(row.querySelector(".engine-url")!.textContent).toBe(longUrl);
  for (const selector of [".engine-kw", ".engine-name", ".engine-url"]) {
    const css = getComputedStyle(row.querySelector(selector)!);
    expect(css.gridColumn).toBe("1");
    expect(css.minWidth).toBe("0");
    expect(css.overflowWrap).toBe("anywhere");
    expect(css.textOverflow).not.toBe("ellipsis");
    expect(css.overflow).not.toBe("hidden");
  }
});
it("uses a shrinkable copy column with a separate original trailing Remove control", async () => {
  await render();
  const row = host.querySelector(".engine-row")!,
    button = row.querySelector("button")!;
  expect(getComputedStyle(row).gridTemplateColumns).toBe("minmax(0, 1fr) auto");
  expect(getComputedStyle(row).display).toBe("grid");
  expect(getComputedStyle(button).gridColumn).toBe("2");
  expect(getComputedStyle(button).gridRow).toBe("1 / span 3");
  expect(getComputedStyle(button).minHeight).toBe("36px");
  button.focus();
  await act(async () => button.click());
  expect(document.activeElement).toBe(button);
  expect(mocks.save).toHaveBeenCalledWith([]);
});
it("removes default list indentation and retains wrapping add fields and all input labels", async () => {
  await render();
  const list = host.querySelector(".engine-list")!;
  expect(getComputedStyle(list).listStyle).toBe("none");
  expect(getComputedStyle(list).padding).toBe("0px");
  expect(getComputedStyle(list).minWidth).toBe("0");
  for (const label of ["Keyword", "Engine name", "Search URL"]) {
    const field = host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
    expect(field).toBeTruthy();
    expect(getComputedStyle(field).maxWidth).toBe("100%");
  }
  expect(getComputedStyle(host.querySelector(".grow")!).flexBasis).toBe("100%");
  expect(getComputedStyle(host.querySelector(".engine-add .row")!).flexWrap).toBe("wrap");
});
it("preserves existing focus, disabled, palette and preference recipes without new clipping or motion", () => {
  const rules = [...settings.matchAll(/(?:\.search-engines-setting[^{}]*|\.engine-[^{}]*)\{[^}]*\}/g)]
    .map((row) => row[0])
    .join("\n");
  expect(rules).not.toMatch(
    /opacity|color:|background|outline|overflow:\s*(hidden|clip)|animation|transition|white-space:\s*nowrap/,
  );
  expect(settings).toMatch(/\.settings-content \.btn\s*\{[^}]*min-height:\s*36px/);
  expect(settings).toMatch(
    /\.settings-content :is\(input, select, textarea, \.btn\):focus-visible\s*\{[^}]*outline:\s*2px solid var\(--focus-line\)/,
  );
  expect(settings).toContain("@media (prefers-reduced-motion: reduce)");
  expect(settings).toContain("@container settings-page (max-width: 680px)");
});
it("keeps the genuine pending disabled control without lowering the original hit area", async () => {
  let resolve!: (value: boolean) => void;
  const held = new Promise<boolean>((done) => {
    resolve = done;
  });
  mocks.save.mockReturnValue(held);
  await render();
  const button = host.querySelector<HTMLButtonElement>(".engine-row button")!;
  await act(async () => button.click());
  expect(button.disabled).toBe(true);
  expect(getComputedStyle(button).minHeight).toBe("36px");
  await act(async () => resolve(false));
  expect(button.disabled).toBe(false);
  expect(host.querySelector('[role="alert"]')!.textContent).toContain("weren’t saved");
  expect(host.querySelector(".engine-name")!.textContent).toBe(longName);
});
