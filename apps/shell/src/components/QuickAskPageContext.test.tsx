// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { BrowserContextTray } from "./BrowserContextTray";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { ConversationImages } from "./ConversationImages";
import { executeCommand } from "../commands";
import { bridge } from "../bridge";
import { makePage } from "../mock/fixtures";
import { useStore } from "../store";
import { normalizePages } from "../store/pages";
import { sourceRef } from "../browser-context-sources";
const initial = useStore.getState();
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const originalKind = bridge.windowKind,
  originalWindow = bridge.windowId;
const page = makePage(0, {
  pageId: "main-page",
  windowId: "main-window",
  windowKind: "normal",
  url: "https://example.test/",
  sessionId: "original-read-session",
  documentEpoch: 4,
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  bridge.windowKind = "quick-ask";
  bridge.windowId = "quick-window";
  useStore.setState({
    pages: normalizePages([page]),
    activePageId: page.pageId,
    splitPageId: null,
    connected: true,
    agentDraft: "Original question",
    conversationBrowserSources: {},
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  bridge.windowKind = originalKind;
  bridge.windowId = originalWindow;
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});
it("offers actual scoped expansion instead of selecting or refreshing a normal-window live source", async () => {
  const expand = vi.fn(),
    primary = vi.fn(),
    sources = vi.fn(),
    rpc = vi.spyOn(bridge, "invoke");
  await act(async () =>
    root.render(
      <BrowserContextTray
        primary={page.pageId}
        sources={[sourceRef(page)]}
        onPrimary={primary}
        onSources={sources}
        disabled={false}
        onOpenInAux={expand}
      />,
    ),
  );
  const handback = host.querySelector<HTMLButtonElement>(
    '[data-command-id="open-quick-ask-browser-context"]',
  )!;
  expect(handback.textContent).toContain("Open in Aux");
  expect(host.querySelector('[data-command-id="select-browser-context"]')).toBeNull();
  expect(host.querySelector('[data-command-id="toggle-browser-source"]')).toBeNull();
  handback.focus();
  await act(async () => {
    await executeCommand("open-quick-ask-browser-context");
  });
  expect(expand).toHaveBeenCalledOnce();
  expect(primary).not.toHaveBeenCalled();
  expect(sources).not.toHaveBeenCalled();
  expect(rpc).not.toHaveBeenCalled();
  expect(useStore.getState().agentDraft).toBe("Original question");
});
it("keeps standalone pickers and stale handback controls bound to the original Quick Ask window", async () => {
  const expand = vi.fn(),
    primary = vi.fn();
  await act(async () =>
    root.render(<BrowserContextPicker value="none" onChange={primary} onOpenInAux={expand} />),
  );
  const button = host.querySelector<HTMLButtonElement>("button")!;
  button.focus();
  bridge.windowId = "replacement-quick-window";
  await expect(executeCommand("open-quick-ask-browser-context")).rejects.toThrow("original Quick Ask");
  expect(expand).not.toHaveBeenCalled();
  expect(primary).not.toHaveBeenCalled();
});
it("disables popup page capture before the real pages.capture invocation while preserving file/image intake", async () => {
  const rpc = vi.spyOn(bridge, "invoke"),
    documents = vi.fn(),
    picker = vi.spyOn(bridge, "pickEvidenceImage").mockResolvedValue(null);
  await act(async () =>
    root.render(
      <ConversationImages
        chatId="original"
        page={page}
        images={[]}
        disabled={false}
        ensureChatId={() => "original"}
        onChange={vi.fn()}
        onBusy={vi.fn()}
        onDocument={documents}
      />,
    ),
  );
  const capture = host.querySelector<HTMLButtonElement>('[data-command-id="capture-conversation-page"]')!;
  expect(capture.disabled).toBe(true);
  expect(capture.title).toContain("Open in Aux");
  await act(async () => capture.click());
  expect(rpc).not.toHaveBeenCalled();
  const documentButton = host.querySelector<HTMLButtonElement>(
    '[data-command-id="attach-conversation-document"]',
  )!;
  expect(documentButton.disabled).toBe(false);
  await act(async () => documentButton.click());
  expect(documents).toHaveBeenCalledOnce();
  const imageButton = host.querySelector<HTMLButtonElement>('[data-command-id="choose-conversation-image"]')!;
  expect(imageButton.disabled).toBe(false);
  await act(async () => imageButton.click());
  expect(picker).toHaveBeenCalledOnce();
});
it("keeps normal-window source selection and capture admission intact", async () => {
  bridge.windowKind = "normal";
  bridge.windowId = "main-window";
  await act(async () => root.render(<BrowserContextPicker value={page.pageId} onChange={vi.fn()} />));
  expect(host.querySelector('[data-command-id="open-quick-ask-browser-context"]')).toBeNull();
  expect(host.querySelector("button")?.textContent).toContain(page.title);
  for (const id of [
    "select-browser-context",
    "toggle-browser-source",
    "update-browser-source",
    "capture-conversation-page",
  ])
    expect(COMMANDS.find((item) => item.id === id)).not.toMatchObject({
      windows: expect.arrayContaining(["quick-ask"]),
    });
  expect(COMMANDS.find((item) => item.id === "choose-conversation-image")).toMatchObject({
    windows: expect.arrayContaining(["quick-ask"]),
  });
});
