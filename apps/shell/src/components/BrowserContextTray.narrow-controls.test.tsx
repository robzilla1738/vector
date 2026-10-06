// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { BrowserContextTray } from "./BrowserContextTray";

const initial = useStore.getState();
const pages = ["primary", "split", "additional"].map((pageId) =>
  makePage(0, { pageId, title: pageId, url: `https://example.test/${pageId}` }),
);
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
const sources = vi.fn(),
  primary = vi.fn();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100, height: 32 },
  ] as unknown as DOMRectList);
  useStore.setState({ pages, activePageId: "primary", splitPageId: "split", toasts: [] });
  sources.mockReset();
  primary.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  style = document.createElement("style");
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "Conversation.css"), "utf8");
  // Apply the actual narrow-container rules to actual mounted controls; jsdom does not implement container sizing.
  const narrow = css.match(/@container composer \(max-width:420px\) \{([\s\S]*?)\n\}/)![1];
  const wrap = css.match(/^\.composer-footer \.conversation-browser-context-controls \{[^}]+\}/m)![0];
  style.textContent = wrap + narrow;
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = (disabled = false, selected = "none") =>
  act(async () =>
    root.render(
      <div className="composer-footer">
        <BrowserContextTray
          primary={selected}
          sources={[]}
          onPrimary={primary}
          onSources={sources}
          disabled={disabled}
        />
      </div>,
    ),
  );
const addTabs = () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!;
const split = () =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Add split tab",
  )!;
function originalReads() {
  return vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list") return pages;
    throw new Error(method);
  });
}
it("retains explicit additional-tab selection and primary page-free state under the actual narrow rules", async () => {
  const invoke = originalReads();
  await render();
  expect(getComputedStyle(addTabs()).display).not.toBe("none");
  expect(getComputedStyle(host.querySelector(".conversation-browser-context-controls")!).flexWrap).toBe(
    "wrap",
  );
  addTabs().focus();
  expect(document.activeElement).toBe(addTabs());
  await act(async () => addTabs().click());
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Add browser tabs"]')!;
  expect(dialog).not.toBeNull();
  const additional = [...dialog.querySelectorAll<HTMLLabelElement>("label")]
    .find((label) => label.textContent?.includes("additional"))!
    .querySelector<HTMLInputElement>("input")!;
  await act(async () => additional.click());
  expect(sources).toHaveBeenCalledExactlyOnceWith([
    expect.objectContaining({ pageId: "additional", url: pages[2]!.url }),
  ]);
  expect(primary).not.toHaveBeenCalled();
  expect(invoke.mock.calls.map(([method]) => method)).toEqual(["browser.recovery.list", "pages.list"]);
});
it("retains the original split-tab action without selecting primary context", async () => {
  const invoke = originalReads();
  await render(false, "active");
  expect(getComputedStyle(split()).display).not.toBe("none");
  split().focus();
  expect(document.activeElement).toBe(split());
  await act(async () => split().click());
  expect(sources).toHaveBeenCalledExactlyOnceWith([expect.objectContaining({ pageId: "split" })]);
  expect(primary).not.toHaveBeenCalled();
  expect(invoke.mock.calls.map(([method]) => method)).toEqual(["browser.recovery.list", "pages.list"]);
});
it("keeps disabled additional and split controls present but refuses original mutations", async () => {
  const invoke = originalReads();
  await render(true, "active");
  expect(getComputedStyle(addTabs()).display).not.toBe("none");
  expect(addTabs().disabled).toBe(true);
  expect(getComputedStyle(split()).display).not.toBe("none");
  expect(split().disabled).toBe(true);
  await act(async () => {
    addTabs().click();
    split().click();
  });
  expect(document.querySelector("dialog")).toBeNull();
  expect(invoke).not.toHaveBeenCalled();
  expect(sources).not.toHaveBeenCalled();
  expect(primary).not.toHaveBeenCalled();
});
