// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BrowserContextTray } from "./BrowserContextTray";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { makePage } from "../mock/fixtures";
import { useStore } from "../store";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { sourceRef } from "../browser-context-sources";
const initial = useStore.getState();
const page = makePage(0, {
  pageId: "original",
  title: "Original source",
  url: "https://example.test/original",
  documentEpoch: 2,
  sessionId: "original-session",
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
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
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ pages: [page], activePageId: page.pageId, splitPageId: null, toasts: [] });
  sources.mockReset();
  primary.mockReset();
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
it("actual registered Remove explicitly clears only the original closed stored source without native lookup", async () => {
  useStore.setState({ pages: [] });
  const rpc = vi.spyOn(bridge, "invoke");
  await act(async () =>
    root.render(
      <BrowserContextTray
        primary="none"
        sources={[sourceRef(page)]}
        onSources={sources}
        onPrimary={primary}
        disabled={false}
      />,
    ),
  );
  const button = host.querySelector<HTMLButtonElement>('[data-command-id="remove-browser-source"]')!;
  expect(button).not.toBeNull();
  await act(async () => button.click());
  expect(sources).toHaveBeenCalledExactlyOnceWith([]);
  expect(primary).not.toHaveBeenCalled();
  expect(rpc).not.toHaveBeenCalled();
});
it("actual checkbox command holds genuine page read and refuses same-URL replacement", async () => {
  let finish!: (value: (typeof page)[]) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list")
      return new Promise((done) => {
        finish = done;
      });
    throw new Error(method);
  });
  await act(async () =>
    root.render(
      <BrowserContextTray
        primary="none"
        sources={[]}
        onSources={sources}
        onPrimary={primary}
        disabled={false}
      />,
    ),
  );
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  const input = document.querySelector<HTMLInputElement>('[data-command-id="toggle-browser-source"]')!;
  expect(input).not.toBeNull();
  await act(async () => input.click());
  expect(input.disabled).toBe(true);
  expect(sources).not.toHaveBeenCalled();
  await act(async () => finish([{ ...page, documentEpoch: 3 }]));
  // Additional selection must use its original document, just like Update.
  expect(sources).not.toHaveBeenCalled();
});
it("actual primary picker command selects exact original choice and closes disclosure", async () => {
  await act(async () => root.render(<BrowserContextPicker value="none" onChange={primary} />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!.click());
  const choices = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-command-id="select-browser-context"]'),
  ];
  const original = choices.find((button) => button.textContent?.startsWith("Original source"))!;
  expect(original).not.toBeUndefined();
  await act(async () => original.click());
  expect(primary).toHaveBeenCalledExactlyOnceWith(page.pageId);
  expect(document.querySelector("dialog[open]")).toBeNull();
});
it("focused No context command preserves explicit page-free choice without native lookup", async () => {
  const rpc = vi.spyOn(bridge, "invoke");
  await act(async () => root.render(<BrowserContextPicker value={page.pageId} onChange={primary} />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!.click());
  const none = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-command-id="select-browser-context"]'),
  ].find((button) => button.textContent?.startsWith("No browser context"))!;
  none.focus();
  await act(async () => {
    await executeCommand("select-browser-context", { payload: { pageId: "none" } });
  });
  expect(primary).toHaveBeenCalledExactlyOnceWith("none");
  expect(rpc).not.toHaveBeenCalled();
});
it("original Current tab choice refuses active-page replacement in the same event turn", async () => {
  const foreign = { ...page, pageId: "foreign", sessionId: "foreign-session" };
  useStore.setState({ pages: [page, foreign] });
  await act(async () => root.render(<BrowserContextPicker value="active" onChange={primary} />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!.click());
  const choice = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-command-id="select-browser-context"]'),
  ].find((button) => button.textContent?.startsWith("Current tab"))!;
  await act(async () => {
    useStore.setState({ activePageId: foreign.pageId });
    choice.click();
  });
  expect(primary).not.toHaveBeenCalled();
  expect(useStore.getState().toasts.at(-1)?.text).toContain("context changed");
});
it("registered split selection binds original pair and retains unrelated conversation draft", async () => {
  const first = { ...page, pageId: "primary", sessionId: "primary-session" };
  useStore.setState({
    pages: [first, page],
    activePageId: first.pageId,
    splitPageId: page.pageId,
    conversationDrafts: { "chat:other": "Other original draft" },
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list") return [first, page];
    throw new Error(method);
  });
  await act(async () =>
    root.render(
      <BrowserContextTray
        primary="active"
        sources={[]}
        onSources={sources}
        onPrimary={primary}
        disabled={false}
      />,
    ),
  );
  const split = host.querySelector<HTMLButtonElement>('[data-command-id="toggle-browser-source"]')!;
  expect(split.textContent).toBe("Add split tab");
  await act(async () => split.click());
  expect(sources).toHaveBeenCalledExactlyOnceWith([
    expect.objectContaining({
      pageId: page.pageId,
      sessionId: page.sessionId,
      documentEpoch: page.documentEpoch,
    }),
  ]);
  expect(useStore.getState().conversationDrafts["chat:other"]).toBe("Other original draft");
  expect(primary).not.toHaveBeenCalled();
});
it("disabling an open primary picker retires its original command owner", async () => {
  await act(async () => root.render(<BrowserContextPicker value="none" onChange={primary} />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!.click());
  const choice = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-command-id="select-browser-context"]'),
  ].find((button) => button.textContent?.startsWith("Original source"))!;
  choice.focus();
  await act(async () => root.render(<BrowserContextPicker value="none" disabled onChange={primary} />));
  await expect(
    executeCommand("select-browser-context", { payload: { pageId: page.pageId } }),
  ).rejects.toThrow("focused");
  expect(primary).not.toHaveBeenCalled();
});
