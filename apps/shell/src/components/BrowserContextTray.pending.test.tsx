import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { sourceRef } from "../browser-context-sources";
import { BrowserContextTray } from "./BrowserContextTray";

const initial = useStore.getState();
const pages = ["first", "second"].map((pageId) =>
  makePage(0, { pageId, title: pageId, url: `https://example.test/${pageId}` }),
);
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const sources = vi.fn();
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
    { width: 100, height: 30 },
  ] as unknown as DOMRectList);
  useStore.setState({ pages: normalizePages(pages), toasts: [] });
  sources.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = (disabled = false) =>
  act(async () =>
    root.render(
      <BrowserContextTray
        primary="none"
        sources={[]}
        onPrimary={vi.fn()}
        onSources={sources}
        disabled={disabled}
      />,
    ),
  );
async function open() {
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
}
function choice(index: number) {
  return document.querySelectorAll<HTMLInputElement>('dialog input[type="checkbox"]')[index]!;
}

it("releases retired A without letting late A release fresh B or mutate its context", async () => {
  const replies: ((value: typeof pages) => void)[] = [];
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list")
      return new Promise((done) => {
        replies.push(done);
      });
    throw new Error(method);
  });
  await render();
  await open();
  await act(async () => choice(0).click());
  expect(host.textContent).toContain("Loading tab…");
  expect(replies).toHaveLength(1);
  await render(true);
  await render(false);
  expect(host.textContent).not.toContain("Loading tab…");
  await open();
  await act(async () => choice(1).click());
  expect(replies).toHaveLength(2);
  await act(async () => replies[0]!(pages));
  expect(sources).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Loading tab…");
  expect(choice(0).disabled).toBe(true);
  await act(async () => replies[1]!(pages));
  expect(sources).toHaveBeenCalledExactlyOnceWith([expect.objectContaining({ pageId: "second" })]);
  expect(host.textContent).not.toContain("Loading tab…");
});

it("admits one operation synchronously when two choices are clicked before React commits busy", async () => {
  let finish!: (value: typeof pages) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list")
      return new Promise((done) => {
        finish = done;
      });
    throw new Error(method);
  });
  await render();
  await open();
  await act(async () => {
    choice(0).click();
    choice(1).click();
  });
  expect(invoke.mock.calls.filter(([method]) => method === "browser.recovery.list")).toHaveLength(1);
  expect(invoke.mock.calls.filter(([method]) => method === "pages.list")).toHaveLength(1);
  await act(async () => finish(pages));
  expect(sources).toHaveBeenCalledExactlyOnceWith([expect.objectContaining({ pageId: "first" })]);
});

it("a retired refresh cannot release the replacement refresh or replace another source", async () => {
  const prior = pages.map((page) => sourceRef(page));
  const current = pages.map((page) => ({ ...page, documentEpoch: 2, url: `${page.url}/updated` }));
  useStore.setState({ pages: normalizePages(current) });
  const replies: ((value: typeof pages) => void)[] = [];
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list")
      return new Promise((done) => {
        replies.push(done);
      });
    throw new Error(method);
  });
  const refreshView = (disabled = false) =>
    act(async () =>
      root.render(
        <BrowserContextTray
          primary="none"
          sources={prior}
          onPrimary={vi.fn()}
          onSources={sources}
          disabled={disabled}
        />,
      ),
    );
  await refreshView();
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Use current first"]')!.click());
  await refreshView(true);
  await refreshView(false);
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Use current second"]')!.click());
  expect(replies).toHaveLength(2);
  await act(async () => replies[0]!(current));
  expect(sources).not.toHaveBeenCalled();
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Use current first"]')!.disabled).toBe(true);
  await act(async () => replies[1]!(current));
  expect(sources).toHaveBeenCalledExactlyOnceWith([
    prior[0],
    expect.objectContaining({ pageId: "second", documentEpoch: 2, url: current[1]!.url }),
  ]);
});
