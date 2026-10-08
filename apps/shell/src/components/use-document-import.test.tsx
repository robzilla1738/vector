// @vitest-environment jsdom
import { act, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const host = vi.hoisted(() => ({
  pick: vi.fn(),
  read: vi.fn(),
  release: vi.fn(),
  call: vi.fn(),
  error: vi.fn(),
  state: { connected: true, layout: { activeSpaceId: "space" } },
  windowId: "window",
  privateMode: false,
}));
vi.mock("../bridge", () => ({
  bridge: {
    pickEvidenceDocuments: host.pick,
    readEvidenceDocument: host.read,
    releaseEvidenceDocuments: host.release,
    get windowId() {
      return host.windowId;
    },
    get privateMode() {
      return host.privateMode;
    },
    windowKind: "normal",
  },
}));
vi.mock("../store", () => ({
  call: host.call,
  errToast: host.error,
  useStore: { getState: () => host.state },
}));
import { useDocumentImport } from "./use-document-import";
function held<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
let root: ReturnType<typeof createRoot>, element: HTMLDivElement;
let actions: ReturnType<typeof useDocumentImport>;
let chat: string | null;
const changed = vi.fn(),
  busy = vi.fn();
function Harness() {
  const current = useDocumentImport({
    chatId: chat,
    privateTask: false,
    disabled: false,
    busy: false,
    ensureChatId: () => chat ?? "allocated-chat",
    onBusy: busy,
    onChange: changed,
  });
  useLayoutEffect(() => {
    actions = current;
  });
  return <div>{current.progress?.attached}</div>;
}
async function render(id = chat) {
  chat = id;
  await act(async () => root.render(<Harness />));
}
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  host.state.connected = true;
  host.state.layout.activeSpaceId = "space";
  host.windowId = "window";
  host.privateMode = false;
  host.pick.mockReset().mockResolvedValue({ selectionId: "selection", count: 30 });
  host.read.mockReset().mockImplementation(async (_selection, index) => ({
    filename: `${index}.txt`,
    content: `body ${index}`,
  }));
  host.release.mockReset().mockResolvedValue(undefined);
  host.call
    .mockReset()
    .mockImplementation(async (_method, input) => ({ attachments: [{ attachmentId: input.filename }] }));
  element = document.createElement("div");
  document.body.append(element);
  root = createRoot(element);
  chat = null;
  await render();
});
afterEach(async () => {
  await act(async () => root.unmount());
  element.remove();
  vi.unstubAllGlobals();
});
it("imports thirty selected files sequentially into its new chat, keeping valid files after one read fails", async () => {
  const firstRead = held<{ filename: string; content: string }>(),
    firstSave = held<{ attachments: [] }>();
  host.read.mockImplementation(async (_selection, index) => {
    if (index === 0) return firstRead.promise;
    if (index === 9) throw new Error("invalid_argument: bad.txt: could not read UTF-8 text up to 2 MiB");
    return { filename: `${index}.txt`, content: `body ${index}` };
  });
  host.call.mockReturnValueOnce(firstSave.promise);
  let completion!: Promise<void>;
  await act(async () => {
    completion = actions.start();
  });
  expect(host.read).toHaveBeenCalledExactlyOnceWith("selection", 0);
  expect(host.call).not.toHaveBeenCalled();
  await render("allocated-chat");
  await act(async () => firstRead.resolve({ filename: "0.txt", content: "body 0" }));
  expect(host.read).toHaveBeenCalledTimes(1);
  expect(host.call).toHaveBeenCalledExactlyOnceWith("conversations.attachments.add", {
    chatId: "allocated-chat",
    filename: "0.txt",
    content: "body 0",
  });
  await act(async () => {
    firstSave.resolve({ attachments: [] });
    await completion;
  });
  expect(host.read).toHaveBeenCalledTimes(30);
  expect(host.call).toHaveBeenCalledTimes(29);
  expect(host.call.mock.calls.every(([, input]) => input.chatId === "allocated-chat")).toBe(true);
  expect(actions.progress).toMatchObject({ count: 30, attached: 29, busy: false });
  expect(actions.progress?.errors).toEqual([expect.stringContaining("bad.txt")]);
  expect(changed).toHaveBeenCalledTimes(29);
  expect(host.release).toHaveBeenCalledExactlyOnceWith("selection");
});
it("cancel keeps an accepted in-flight file and never reads the next selected file", async () => {
  const save = held<{ attachments: [] }>();
  host.call.mockReturnValueOnce(save.promise);
  await render("chat");
  let completion!: Promise<void>;
  await act(async () => {
    completion = actions.start();
  });
  await act(async () => actions.cancel());
  expect(host.release).toHaveBeenCalledExactlyOnceWith("selection");
  await act(async () => {
    save.resolve({ attachments: [] });
    await completion;
  });
  expect(host.read).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenCalledExactlyOnceWith([]);
  expect(actions.progress).toMatchObject({ count: 30, attached: 1, busy: false });
});
it("retires a held read across chat ABA and releases a late picker without clearing the fresh import", async () => {
  const oldPick = held<{ selectionId: string; count: number }>(),
    freshRead = held<{ filename: string; content: string }>();
  host.pick.mockReturnValueOnce(oldPick.promise).mockResolvedValueOnce({ selectionId: "fresh", count: 1 });
  host.read.mockReturnValueOnce(freshRead.promise);
  await render("chat");
  let old!: Promise<void>, fresh!: Promise<void>;
  await act(async () => {
    old = actions.start();
  });
  await render("other");
  await render("chat");
  await act(async () => {
    fresh = actions.start();
  });
  await act(async () => {
    oldPick.resolve({ selectionId: "old", count: 30 });
    await old;
  });
  expect(host.release).toHaveBeenCalledWith("old");
  expect(host.read).toHaveBeenCalledExactlyOnceWith("fresh", 0);
  expect(actions.progress).toMatchObject({ busy: true, count: 1 });
  await render("other");
  await render("chat");
  await act(async () => {
    freshRead.resolve({ filename: "retired.txt", content: "not for the new chat" });
    await fresh;
  });
  expect(host.call).not.toHaveBeenCalled();
  expect(host.release).toHaveBeenCalledWith("fresh");
  expect(actions.progress).toBeNull();
});
it("stops the entire selection when native ownership is lost", async () => {
  host.read.mockRejectedValueOnce(new Error("ref_stale: This selection was closed."));
  await act(async () => actions.start());
  expect(host.read).toHaveBeenCalledTimes(1);
  expect(host.call).not.toHaveBeenCalled();
  expect(host.release).toHaveBeenCalledExactlyOnceWith("selection");
  expect(actions.progress).toMatchObject({ count: 30, attached: 0, busy: false });
});
