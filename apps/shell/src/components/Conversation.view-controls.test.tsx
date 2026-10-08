import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, type Run } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage, makeRun } from "../mock/fixtures";
import { conversationMarkdown } from "../conversation-export";
import { Conversation } from "./Conversation";

const initial = useStore.getState(),
  windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, runs: Run[];
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
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
  runs = ["a", "b"].map((chat) =>
    makeRun({
      runId: `run-${chat}`,
      goal: `Original ${chat} / question`,
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
      pages: normalizePages([]),
      connected: true,
      conversationId: "a",
      toasts: [],
      pendingTurns: [],
      prompt: null,
      conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" },
      conversationContexts: {},
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
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
function button(id = "export-conversation-markdown") {
  return host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
}
async function dispatch(id = "export-conversation-markdown") {
  let completion!: Promise<unknown>;
  await act(async () => {
    button(id).focus();
    completion = executeCommand(id);
    void completion.catch(() => {});
  });
  return { completion };
}
function heldSave() {
  const pending: { resolve(value: string | null): void; reject(reason: unknown): void }[] = [];
  const save = vi
    .spyOn(bridge, "saveFile")
    .mockImplementation(() => new Promise((resolve, reject) => pending.push({ resolve, reject })));
  return { pending, save };
}
function heldExportRead() {
  const pending: { resolve(value: Run[]): void; reject(reason: unknown): void }[] = [];
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) =>
    method === "runs.list" && (params as { limit?: number }).limit === 500
      ? new Promise((resolve, reject) => pending.push({ resolve, reject }))
      : fallback(method, params),
  );
  return pending;
}
it("Export retains the original filename, Markdown bytes, read arguments and actual Save ACK", async () => {
  useStore.setState({ connected: false });
  await render();
  vi.spyOn(Date, "now").mockReturnValue(1000);
  const { pending, save } = heldSave(),
    original = await dispatch();
  const all = [runs[0]!];
  expect(save).toHaveBeenCalledExactlyOnceWith(
    "aux-conversation-original-a-question.md",
    conversationMarkdown({
      chatId: "a",
      title: all[0]!.goal,
      runs: all,
      attachments: [],
      artifacts: [],
      sources: [],
      workspace: null,
      memory: null,
      generatedAt: 1000,
    }),
  );
  expect(bridge.invoke).toHaveBeenCalledWith("runs.list", { chatId: "a", limit: 500 });
  expect(bridge.invoke).toHaveBeenCalledWith("runs.messages.list", { chatId: "a", runIds: ["run-a"] });
  for (const method of [
    "conversations.attachments.get",
    "conversations.artifacts.get",
    "conversations.workspace.get",
    "conversations.sources.get",
  ])
    expect(bridge.invoke).toHaveBeenCalledWith(method, { chatId: "a" });
  const ack = "/synthetic/owned.md";
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(original.completion).resolves.toBe(ack);
  });
  expect(button().disabled).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().toasts[0]!.text).toBe("Conversation exported");
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("Export preserves a genuine cancelled Save result without a success toast", async () => {
  await render();
  const { pending } = heldSave(),
    original = await dispatch();
  await act(async () => {
    pending[0]!.resolve(null);
    await expect(original.completion).resolves.toBeNull();
  });
  expect(button().disabled).toBe(false);
  expect(useStore.getState().toasts).toEqual([]);
});
it("Export preserves real pagination cursor arguments and complete original Markdown", async () => {
  await render();
  vi.spyOn(Date, "now").mockReturnValue(1000);
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  const first = Array.from({ length: 500 }, (_, index) =>
    makeRun({
      runId: `page-${index}`,
      config: { chatId: "a" },
      goal: `Original turn ${index}`,
      createdAt: index,
    }),
  );
  const last = makeRun({
    runId: "last-page",
    config: { chatId: "a" },
    goal: "Original final turn",
    createdAt: 501,
  });
  const reads: unknown[] = [];
  vi.mocked(bridge.invoke).mockImplementation((method, params) => {
    if (method === "runs.list" && (params as { limit?: number }).limit === 500) {
      reads.push(params);
      return Promise.resolve(reads.length === 1 ? first : [last]);
    }
    return fallback(method, params);
  });
  const save = vi.spyOn(bridge, "saveFile").mockResolvedValue(null),
    original = await dispatch();
  await original.completion;
  expect(reads).toEqual([
    { chatId: "a", limit: 500 },
    { chatId: "a", limit: 500, before: { createdAt: first[499]!.createdAt, runId: first[499]!.runId } },
  ]);
  expect(save).toHaveBeenCalledExactlyOnceWith(
    "aux-conversation-original-final-turn.md",
    conversationMarkdown({
      chatId: "a",
      title: last.goal,
      runs: [...first, last],
      attachments: [],
      artifacts: [],
      sources: [],
      workspace: null,
      memory: null,
      generatedAt: 1000,
    }),
  );
});
it("same-tick Export native clicks reserve once before the first read resolves", async () => {
  await render();
  const pending = heldExportRead(),
    save = vi.spyOn(bridge, "saveFile").mockResolvedValue(null),
    control = button();
  await act(async () => {
    control.click();
    control.click();
  });
  expect(pending).toHaveLength(1);
  expect(button().disabled).toBe(true);
  await act(async () => pending[0]!.resolve([runs[0]!]));
  expect(save).toHaveBeenCalledTimes(1);
  expect(button().disabled).toBe(false);
});
it("retirement after a full export page refuses the next pagination and every context/Save producer", async () => {
  await render();
  const pending = heldExportRead(),
    save = vi.spyOn(bridge, "saveFile"),
    original = await dispatch();
  const baseline = vi.mocked(bridge.invoke).mock.calls.length;
  await render("b");
  const afterMount = vi.mocked(bridge.invoke).mock.calls.length;
  const page = Array.from({ length: 500 }, (_, index) =>
    makeRun({ runId: `export-${index}`, config: { chatId: "a" }, createdAt: index }),
  );
  await act(async () => {
    pending[0]!.resolve(page);
  });
  // An admitted read is retained, but no new producer may start from its retired continuation.
  expect(
    vi
      .mocked(bridge.invoke)
      .mock.calls.slice(afterMount)
      .filter(
        ([method]) =>
          method === "runs.list" || method === "runs.messages.list" || method.startsWith("conversations."),
      ),
  ).toEqual([]);
  expect(baseline).toBeGreaterThan(0);
  expect(save).not.toHaveBeenCalled();
  await expect(original.completion).resolves.toBeUndefined();
});
it("retirement while context reads are held prevents the actual native Save chooser", async () => {
  await render();
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!,
    pending: (() => void)[] = [];
  vi.mocked(bridge.invoke).mockImplementation((method, params) =>
    method === "conversations.attachments.get"
      ? new Promise((resolve) => pending.push(() => resolve({ attachments: [] })))
      : fallback(method, params),
  );
  const save = vi.spyOn(bridge, "saveFile"),
    original = await dispatch();
  await render("b");
  await act(async () => pending[0]!());
  await expect(original.completion).resolves.toBeUndefined();
  expect(save).not.toHaveBeenCalled();
});
it("each context producer checks original admission even when the prior dispatch synchronously retires its bridge", async () => {
  await render();
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) => {
    if (method === "conversations.attachments.get") bridge.windowId = "foreign";
    return fallback(method, params);
  });
  const save = vi.spyOn(bridge, "saveFile"),
    baseline = vi.mocked(bridge.invoke).mock.calls.length,
    original = await dispatch();
  await expect(original.completion).resolves.toBeUndefined();
  const dispatched = vi
    .mocked(bridge.invoke)
    .mock.calls.slice(baseline)
    .map(([method]) => method);
  expect(dispatched).toEqual(["runs.list", "runs.messages.list", "conversations.attachments.get"]);
  expect(save).not.toHaveBeenCalled();
  bridge.windowId = windowId;
});
it("old admitted Save ACK after A to B to A cannot toast or clear a newer Export busy token", async () => {
  await render();
  const { pending } = heldSave(),
    old = await dispatch();
  await render("b");
  await render("a");
  const fresh = await dispatch();
  expect(button().disabled).toBe(true);
  await act(async () => {
    pending[0]!.resolve("/synthetic/old.md");
    await expect(old.completion).resolves.toBe("/synthetic/old.md");
  });
  expect(button().disabled).toBe(true);
  expect(useStore.getState().toasts).toEqual([]);
  await act(async () => {
    pending[1]!.resolve("/synthetic/new.md");
    await expect(fresh.completion).resolves.toBe("/synthetic/new.md");
  });
  expect(button().disabled).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
});
it("retired Save rejection remains identical while current native-click failure reports once", async () => {
  await render();
  const { pending } = heldSave(),
    old = await dispatch();
  await render("b");
  await render("a");
  await act(async () => button().click());
  const error = new Error("Original retired Save");
  await act(async () => {
    pending[0]!.reject(error);
    await expect(old.completion).rejects.toBe(error);
  });
  expect(button().disabled).toBe(true);
  expect(useStore.getState().toasts).toEqual([]);
  await act(async () => pending[1]!.reject(new Error("Current Save failed")));
  expect(button().disabled).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
});
it("focused remapped Continue retains the exact displayed chat and draft while disconnected", async () => {
  useStore.setState({
    connected: false,
    conversationId: "b",
    settings: {
      shortcutOverrides: { "continue-conversation-in-rail": [{ key: "j", command: true, alt: true }] },
    },
  });
  await render();
  button("continue-conversation-in-rail").focus();
  await act(async () => {
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(useStore.getState()).toMatchObject({
    mode: "focus",
    railOpen: true,
    railView: { kind: "run", runId: "run-a" },
  });
  expect(useStore.getState().conversationDrafts).toEqual({
    "chat:a": "Keep A draft",
    "chat:b": "Keep B draft",
  });
});
it("browser preview Show/Hide uses the original synchronous toggle without changing context", async () => {
  const page = makePage(0);
  useStore.setState({
    pages: normalizePages([page]),
    activePageId: page.pageId,
    conversationContexts: { "chat:a": page.pageId },
  });
  await render();
  expect(host.querySelector(".supporting-chip")).not.toBeNull();
  await act(async () => button("toggle-conversation-browser-preview").click());
  expect(host.querySelector(".supporting-chip")).toBeNull();
  expect(button("toggle-conversation-browser-preview").getAttribute("aria-pressed")).toBe("false");
  await dispatch("toggle-conversation-browser-preview");
  expect(host.querySelector(".supporting-chip")).not.toBeNull();
  expect(useStore.getState().conversationContexts["chat:a"]).toBe(page.pageId);
});
it("Jump to latest operates on the original mounted scroll viewport without changing draft or focus", async () => {
  await render();
  const viewport = host.querySelector<HTMLDivElement>(".conversation-scroll")!;
  Object.defineProperties(viewport, {
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 100 },
  });
  viewport.scrollTop = 100;
  await act(async () => viewport.dispatchEvent(new Event("scroll")));
  expect(button("jump-conversation-to-latest")).not.toBeNull();
  await dispatch("jump-conversation-to-latest");
  expect(viewport.scrollTop).toBe(1000);
  expect(button("jump-conversation-to-latest")).toBeNull();
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("hidden controls and observed foreign-window ABA refuse before any new view/export effect", async () => {
  await render();
  const save = vi.spyOn(bridge, "saveFile"),
    continueButton = button("continue-conversation-in-rail");
  continueButton.hidden = true;
  continueButton.focus();
  await expect(executeCommand("continue-conversation-in-rail")).rejects.toThrow();
  continueButton.hidden = false;
  continueButton.focus();
  bridge.windowId = "foreign";
  await expect(executeCommand("continue-conversation-in-rail")).rejects.toThrow();
  bridge.windowId = windowId;
  await expect(executeCommand("continue-conversation-in-rail")).rejects.toThrow();
  expect(useStore.getState().railOpen).toBe(false);
  expect(save).not.toHaveBeenCalled();
});
it("all four view controls remain normal scoped remappable commands", () => {
  for (const id of [
    "export-conversation-markdown",
    "continue-conversation-in-rail",
    "toggle-conversation-browser-preview",
    "jump-conversation-to-latest",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});
