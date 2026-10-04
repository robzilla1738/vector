// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { Conversation } from "./Conversation";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
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
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({
    agentDraft: "Keep this page-free question",
    railOpen: false,
    runs: [],
    pendingTurns: [],
    pages: [],
    connected: true,
    conversationId: null,
    toasts: [],
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Other chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
it("keeps the actual Conversation image operation alive through its own disabled feedback and delivers the original save ACK", async () => {
  vi.stubGlobal(
    "Image",
    class {
      naturalWidth = 16;
      naturalHeight = 16;
      src = "";
      async decode() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as never);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,AA==");
  let picked!: (value: { filename: string; dataUrl: string }) => void;
  vi.spyOn(bridge, "pickEvidenceImage").mockImplementation(
    () =>
      new Promise((done) => {
        picked = done;
      }),
  );
  const invoke = vi.mocked(bridge.invoke),
    fallback = invoke.getMockImplementation()!;
  let images: unknown[] = [];
  let saved!: (value: unknown) => void;
  invoke.mockImplementation((method, params) => {
    if (method === "conversations.images.get") return Promise.resolve({ images });
    if (method === "conversations.images.add")
      return new Promise((done) => {
        saved = done;
      });
    return fallback(method, params);
  });
  useStore.setState({ conversationDrafts: { "chat:parent-chat": "Original page-free draft" } });
  await act(async () => root.render(<Conversation chatId="parent-chat" />));
  const send = () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!;
  expect(send().disabled).toBe(false);
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!.click());
  const action = [
    ...document.querySelectorAll<HTMLButtonElement>('dialog[aria-label="Add context"] button'),
  ].find((node) => node.textContent === "Image")!;
  await act(async () => action.click());
  expect(host.textContent).toContain("Preparing image…");
  expect(send().disabled).toBe(true); // Actual parent imageOperations → attachmentSaving feedback.
  await act(async () => picked({ filename: "original-owned.png", dataUrl: "data:image/png;base64,AA==" }));
  expect(host.querySelector(".capture-editor img")?.getAttribute("src")).toBe("data:image/png;base64,AA==");
  expect(host.textContent).not.toContain("Preparing image…");
  expect(send().disabled).toBe(false);
  const attach = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (node) => node.textContent === "Attach image",
  )!;
  await act(async () => attach.click());
  expect(send().disabled).toBe(true);
  expect(invoke).toHaveBeenCalledWith(
    "conversations.images.add",
    expect.objectContaining({
      chatId: "parent-chat",
      filename: "original-owned.png",
      dataUrl: "data:image/png;base64,AA==",
    }),
  );
  images = [
    {
      imageId: "image-parent",
      artifactId: "artifact-parent",
      chatId: "parent-chat",
      filename: "original-owned.png",
      width: 16,
      height: 16,
      createdAt: 1,
      included: true,
      byteLength: 15,
      mediaType: "image/png",
    },
  ];
  await act(async () => saved({ chatId: "parent-chat", images }));
  expect(host.querySelector(".capture-editor")).toBeNull();
  expect(host.textContent).toContain("original-owned.png");
  expect(send().disabled).toBe(false);
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("Original page-free draft");
  expect(useStore.getState().pages).toEqual([]);
  expect(useStore.getState().runs).toEqual([]);
  expect(invoke.mock.calls.filter(([method]) => method === "conversations.images.add")).toHaveLength(1);
});
