// @vitest-environment jsdom
import { act } from "react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { BrowserContextPicker } from "./BrowserContextPicker";

const initial = useStore.getState();
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  useStore.setState({ pages: [], activePageId: null });
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); vi.unstubAllGlobals();
});
async function open() {
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!;
  await act(async () => trigger.click());
  return document.querySelector<HTMLDialogElement>('dialog[aria-label="Browser context"]')!;
}
it("discloses the full original long title and URL without changing the selected page identity", async () => {
  const title = "Weekend museum visits and a relaxed dinner with friends and family";
  const url = "https://example.test/planning/a-long-path?original=weekend";
  const page = makePage(0, { pageId: "original-page", title, url });
  useStore.setState({ pages: [page], activePageId: page.pageId });
  const changed = vi.fn();
  await act(async () => root.render(<BrowserContextPicker value="none" onChange={changed}/>));
  const panel = await open();
  const row = panel.querySelector<HTMLButtonElement>('.context-picker-group button')!;
  expect(row.title).toBe(`${title}\n${url}`);
  expect(row.querySelector("strong")!.textContent).toBe(title);
  expect(row.getAttribute("aria-pressed")).toBe("false");
  expect(changed).not.toHaveBeenCalled();
  const current = [...panel.querySelectorAll<HTMLButtonElement>("button")].find(button => button.querySelector("strong")?.textContent === "Current tab")!;
  expect(current.title).toBe(`Current tab\n${title}`);
  await act(async () => row.click());
  expect(changed).toHaveBeenCalledExactlyOnceWith(page.pageId);
  expect(document.querySelector('dialog[aria-label="Browser context"]')).toBeNull();
  expect(document.activeElement).toBe(host.querySelector('[aria-label="Browser context"]'));
  expect(useStore.getState().pages[0]).toEqual(page);
});
it("discloses the complete URL for an untitled page and preserves no-context selection", async () => {
  const url = "https://example.test/untitled/original";
  useStore.setState({ pages: [makePage(0, { pageId: "untitled", title: "", url })] });
  const changed = vi.fn();
  await act(async () => root.render(<BrowserContextPicker value="untitled" onChange={changed}/>));
  const panel = await open(), row = panel.querySelector<HTMLButtonElement>('.context-picker-group button')!;
  expect(row.title).toBe(url); expect(row.querySelector("strong")!.textContent).toBe(url);
  expect(row.getAttribute("aria-pressed")).toBe("true");
  const none = [...panel.querySelectorAll<HTMLButtonElement>("button")].find(button => button.querySelector("strong")?.textContent === "No browser context")!;
  await act(async () => none.click());
  expect(changed).toHaveBeenCalledExactlyOnceWith("none");
});
it("keeps unavailable and protected pages excluded and disabled controls closed", async () => {
  useStore.setState({ pages: [makePage(0, { pageId: "internal", title: "Internal", url: "chrome://settings" }),
    makePage(1, { pageId: "runtime", title: "Worker", url: "https://example.test/worker", ownedByRuntime: true })] });
  const changed = vi.fn();
  await act(async () => root.render(<BrowserContextPicker value="none" disabled onChange={changed}/>));
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(true);
  await open(); expect(document.querySelector("dialog")).toBeNull();
  await act(async () => root.render(<BrowserContextPicker value="none" onChange={changed}/>));
  const panel = await open();
  expect(panel.querySelector('.context-picker-group button')).toBeNull();
  expect(panel.textContent).toContain("No matching available tabs."); expect(changed).not.toHaveBeenCalled();
});

it("keeps missing Current and Conversation tabs explanatory and non-selectable, with page-free recovery", async () => {
  const changed = vi.fn();
  await act(async () => root.render(<BrowserContextPicker value="linked" linkedPageId="missing" onChange={changed}/>));
  const panel = await open();
  const choice = (name: string) => [...panel.querySelectorAll<HTMLButtonElement>("button")].find(button => button.querySelector("strong")?.textContent === name)!;
  const current = choice("Current tab"), linked = choice("Conversation tab");
  expect(current.disabled).toBe(true); expect(current.title).toContain("No website open");
  expect(linked.disabled).toBe(true); expect(linked.title).toContain("Unavailable");
  await act(async () => { current.click(); linked.click(); });
  expect(changed).not.toHaveBeenCalled(); expect(panel.isConnected).toBe(true);
  await act(async () => choice("No browser context").click());
  expect(changed).toHaveBeenCalledExactlyOnceWith("none");
});
it("updates genuine Current and Conversation availability while open and preserves explicit selection", async () => {
  const page = makePage(0, { pageId: "actual-page", title: "Original website", url: "https://example.test/actual" });
  const changed = vi.fn();
  useStore.setState({ pages: [page], activePageId: page.pageId });
  await act(async () => root.render(<BrowserContextPicker value="linked" linkedPageId={page.pageId} onChange={changed}/>));
  const panel = await open();
  const current = () => [...panel.querySelectorAll<HTMLButtonElement>("button")].find(button => button.querySelector("strong")?.textContent === "Current tab")!;
  const linked = () => [...panel.querySelectorAll<HTMLButtonElement>("button")].find(button => button.querySelector("strong")?.textContent === "Conversation tab")!;
  expect(current().disabled).toBe(false); expect(linked().disabled).toBe(false);
  await act(async () => useStore.setState({ pages: [], activePageId: null }));
  expect(current().disabled).toBe(true); expect(linked().disabled).toBe(true);
  await act(async () => current().click()); expect(changed).not.toHaveBeenCalled();
  await act(async () => useStore.setState({ pages: [page], activePageId: page.pageId }));
  expect(linked().disabled).toBe(false);
  await act(async () => linked().click()); expect(changed).toHaveBeenCalledExactlyOnceWith("linked");
  expect(document.querySelector('dialog[aria-label="Browser context"]')).toBeNull();
});

it("keeps unavailable selected choices quiet and readable while enabled selection/focus retains interaction", async () => {
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "ContextPicker.css"), "utf8");
  // jsdom lacks cascade layers. Parse the original rules with only the enclosing
  // layer removed; selectors are the actual shipped selectors, not test copies.
  const sheet = document.createElement("style");
  sheet.textContent = css.replace(/^@layer components \{\s*/, "").replace(/\}\s*$/, "");
  document.head.append(sheet);
  try {
    const rules = [...sheet.sheet!.cssRules].filter((rule): rule is CSSStyleRule => "selectorText" in rule);
    const interactive = rules.find(rule => rule.style.getPropertyValue("background") === "var(--bg-hover)")!;
    const unavailable = rules.find(rule => rule.style.getPropertyValue("color") === "var(--ink-2)" && rule.style.getPropertyValue("cursor") === "default")!;
    expect(interactive).toBeDefined(); expect(unavailable).toBeDefined();
    const changed = vi.fn();
    await act(async () => root.render(<BrowserContextPicker value="active" onChange={changed}/>));
    const panel = await open();
    const current = () => [...panel.querySelectorAll<HTMLButtonElement>("button")].find(button => button.querySelector("strong")?.textContent === "Current tab")!;
    expect(current().disabled).toBe(true); expect(current().getAttribute("aria-pressed")).toBe("true");
    expect(current().matches(interactive.selectorText)).toBe(false); expect(current().matches(unavailable.selectorText)).toBe(true);
    expect(current().querySelector("small")!.textContent).toBe("No website open"); expect(current().title).toContain("No website open");
    expect(unavailable.style.getPropertyValue("opacity")).toBe("");
    await act(async () => current().click()); expect(changed).not.toHaveBeenCalled();
    const page = makePage(0, { pageId: "available-context", title: "Planning", url: "https://example.test/planning" });
    await act(async () => useStore.setState({ pages: [page], activePageId: page.pageId }));
    expect(current().disabled).toBe(false); expect(current().matches(interactive.selectorText)).toBe(true); expect(current().matches(unavailable.selectorText)).toBe(false);
    current().focus(); expect(document.activeElement).toBe(current());
    await act(async () => current().click()); expect(changed).toHaveBeenCalledExactlyOnceWith("active");
  } finally { sheet.remove(); }
});
