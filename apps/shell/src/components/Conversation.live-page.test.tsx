// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage, makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";

vi.mock("../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../bridge")>()),
  inMock: true,
}));

const initial = useStore.getState(),
  windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1100);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  const pages = [0, 1].map((index) =>
    makePage(index, {
      windowId,
      url: `http://127.0.0.1:3210/source-${index}`,
      title: `Original source ${index}`,
    }),
  );
  const layout = {
    ...initial.layout,
    activeSpaceId: initial.layout.spaces[0]!.id,
    tabSpace: Object.fromEntries(pages.map((page) => [page.pageId, initial.layout.spaces[0]!.id])),
    splitGroups: [],
  };
  const runs = ["a", "b"].map((chat) =>
    makeRun({
      runId: `run-${chat}`,
      goal: `Original ${chat}`,
      config: { chatId: chat },
      pageIds: [],
      status: "completed",
    }),
  );
  useStore.setState(
    {
      ...initial,
      runs,
      steps: {},
      pages,
      layout,
      activePageId: pages[1]!.pageId,
      connected: true,
      toasts: [],
      pendingTurns: [],
      prompt: null,
      conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" },
      conversationContexts: { "chat:a": pages[0]!.pageId, "chat:b": pages[0]!.pageId },
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "preview").mockResolvedValue(null);
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    const chat = (params as { chatId?: string }).chatId;
    if (method === "runs.list") return runs.filter((run) => run.config?.chatId === chat);
    if (method === "runs.get")
      return {
        run: useStore.getState().runs.find((run) => run.runId === (params as { runId: string }).runId)!,
        steps: [],
        suspension: null,
      };
    if (method === "conversations.get") return { title: "Original chat", archived: false };
    if (method === "runs.messages.list") return [];
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = windowId;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
async function render(chat = "a") {
  await act(async () => root.render(<Conversation chatId={chat} />));
}

const image = () => host.querySelector<HTMLImageElement>(".conversation-preview-live img")!;
const originalImage = "data:image/png;base64,b3JpZ2luYWw=";
const newImage = "data:image/png;base64,bmV3";
function heldPreviews() {
  const requests: { pageId: string; resolve(image: string | null): void }[] = [];
  vi.mocked(bridge.preview).mockImplementation(
    (pageId) => new Promise((resolve) => requests.push({ pageId, resolve })),
  );
  return requests;
}
it("clears original page pixels while the new selected page preview is pending", async () => {
  const requests = heldPreviews();
  await render();
  const [a, b] = useStore.getState().pages;
  await act(async () => requests[0]!.resolve(originalImage));
  const originalNode = image();
  expect(originalNode.hidden).toBe(false);
  expect(originalNode.getAttribute("src")).toBe(originalImage);
  await act(async () => useStore.setState({ conversationContexts: { "chat:a": b!.pageId } }));
  expect(host.querySelector(".conversation-preview-title b")!.textContent).toBe(b!.title);
  expect(image().hidden).toBe(true);
  expect(image().getAttribute("src")).toBeNull();
  expect(host.textContent).toContain("Watching this page…");
  expect(requests.at(-1)!.pageId).toBe(b!.pageId);
  await act(async () => requests.at(-1)!.resolve(newImage));
  expect(image().hidden).toBe(false);
  expect(image().getAttribute("src")).toBe(newImage);
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
  expect(a!.pageId).not.toBe(b!.pageId);
});
it("retires a held original document preview on same-page document change without replacing its focused control", async () => {
  const requests = heldPreviews();
  await render();
  const control = host.querySelector<HTMLButtonElement>(".conversation-preview-live")!;
  control.focus();
  const original = useStore.getState().pages[0]!;
  await act(async () =>
    useStore.setState({
      pages: useStore
        .getState()
        .pages.map((page) => (page === original ? { ...page, documentEpoch: page.documentEpoch + 1 } : page)),
    }),
  );
  expect(requests).toHaveLength(2);
  expect(image().hidden).toBe(true);
  expect(image().getAttribute("src")).toBeNull();
  await act(async () => requests[0]!.resolve(originalImage));
  expect(image().hidden).toBe(true);
  expect(image().getAttribute("src")).toBeNull();
  await act(async () => requests[1]!.resolve(newImage));
  expect(image().hidden).toBe(false);
  expect(image().getAttribute("src")).toBe(newImage);
  expect(host.querySelector(".conversation-preview-live")).toBe(control);
  expect(document.activeElement).toBe(control);
});
it("removes already visible pixels on same-page document replacement and retains the original empty preview state", async () => {
  const requests = heldPreviews();
  await render();
  await act(async () => requests[0]!.resolve(originalImage));
  const original = useStore.getState().pages[0]!;
  await act(async () =>
    useStore.setState({
      pages: useStore
        .getState()
        .pages.map((page) => (page === original ? { ...page, documentEpoch: page.documentEpoch + 1 } : page)),
    }),
  );
  expect(image().hidden).toBe(true);
  expect(image().getAttribute("src")).toBeNull();
  await act(async () => requests[1]!.resolve(null));
  expect(image().hidden).toBe(true);
  expect(host.textContent).toContain("Watching this page…");
});
