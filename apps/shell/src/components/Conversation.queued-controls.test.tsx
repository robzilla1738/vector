import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, type RunMessage } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";

const initial = useStore.getState(),
  originalWindow = bridge.windowId;
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, message: RunMessage;
let rows: Map<string, RunMessage[]>;
const events = new Set<Parameters<typeof bridge.onEvent>[0]>();
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
  const runs = ["a", "b"].map((chat) =>
    makeRun({ runId: `run-${chat}`, config: { chatId: chat }, pageIds: [], status: "running" }),
  );
  message = {
    messageId: "queued-a",
    chatId: "a",
    targetRunId: "run-a",
    deliveryRunId: "next-a",
    mode: "queue",
    status: "accepted",
    text: "Original queued question",
    pageIds: [],
    contextPageRefs: [],
    expectedRevision: 2,
    createdAt: 1,
    updatedAt: 1,
  };
  rows = new Map([
    ["a", [message]],
    [
      "b",
      [{ ...message, messageId: "queued-b", chatId: "b", targetRunId: "run-b", deliveryRunId: "next-b" }],
    ],
  ]);
  events.clear();
  useStore.setState(
    {
      ...initial,
      runs,
      steps: Object.fromEntries(runs.map((run) => [run.runId, []])),
      pages: normalizePages([]),
      connected: true,
      toasts: [],
      pendingTurns: [],
      prompt: null,
      conversationDrafts: { "chat:a": "Keep the full draft", "chat:b": "Other untouched draft" },
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation((listener) => {
    events.add(listener);
    return () => {
      events.delete(listener);
    };
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    const chatId = (params as { chatId?: string }).chatId;
    if (method === "runs.list") return runs.filter((run) => run.config?.chatId === chatId);
    if (method === "runs.get")
      return {
        run: runs.find((run) => run.runId === (params as { runId: string }).runId)!,
        suspension: null,
        steps: [],
      };
    if (method === "runs.messages.list") return rows.get(chatId!) ?? [];
    if (method === "runs.messages.order")
      return {
        chatId,
        revision: "f".repeat(64),
        messageIds: (rows.get(chatId!) ?? [])
          .filter((item) => !["delivered", "cancelled"].includes(item.status))
          .map((item) => item.messageId),
      };
    if (method === "runs.messages.reorder") {
      const input = params as { chatId: string; messageIds: string[] };
      const current = rows.get(input.chatId) ?? [];
      rows.set(
        input.chatId,
        input.messageIds.map((id) => current.find((item) => item.messageId === id)!),
      );
      return { chatId: input.chatId, revision: "f".repeat(64), messageIds: input.messageIds };
    }
    if (method === "runs.message.cancel") return { ...message, status: "cancelled", updatedAt: 2 };
    if (method === "conversations.get") return { title: "Draft", archived: false };
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
  bridge.windowId = originalWindow;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
async function render(chatId = "a", key?: string) {
  await act(async () => root.render(<Conversation key={key} chatId={chatId} embedded />));
}
function control(edit = true) {
  return host.querySelector<HTMLButtonElement>(
    `[data-command-id="${edit ? "edit" : "remove"}-conversation-queued-message"]`,
  )!;
}
function hold() {
  const pending: { resolve(value: unknown): void; reject(reason: unknown): void }[] = [];
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) =>
    method === "runs.message.cancel"
      ? new Promise((resolve, reject) => pending.push({ resolve, reject }))
      : fallback(method, params),
  );
  return pending;
}
async function dispatch(edit = true) {
  control(edit).focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand(`${edit ? "edit" : "remove"}-conversation-queued-message`);
    void completion.catch(() => {});
  });
  return { completion };
}
it("returns the actual original Edit ACK and prepends the cancelled text to the latest full draft", async () => {
  await render();
  const pending = hold(),
    invocation = await dispatch();
  await act(async () => useStore.getState().setConversationDraft("a", "A newer complete draft"));
  const ack = { ...message, status: "cancelled", updatedAt: 2 };
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(invocation.completion).resolves.toBe(ack);
  });
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe(
    "A newer complete draft\n\nOriginal queued question",
  );
  expect(useStore.getState().conversationDrafts["chat:b"]).toBe("Other untouched draft");
  expect(host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')!.value).toBe(
    "A newer complete draft\n\nOriginal queued question",
  );
  expect(document.activeElement).toBe(host.querySelector('textarea[aria-label="Reply to conversation"]'));
  expect(bridge.invoke).toHaveBeenCalledWith("runs.message.cancel", { messageId: message.messageId });
  expect(control()).toBeNull();
});
it("the focused remapped Remove remains usable disconnected and leaves the original draft unchanged", async () => {
  useStore.setState({
    connected: false,
    settings: {
      shortcutOverrides: { "remove-conversation-queued-message": [{ key: "j", command: true, alt: true }] },
    },
  });
  await render();
  control(false).focus();
  await act(async () => {
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(control()).toBeNull();
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep the full draft");
  expect(bridge.invoke).toHaveBeenCalledWith("runs.message.cancel", { messageId: message.messageId });
});
it("reserves same-tick original clicks before a native cancellation ACK", async () => {
  await render();
  const pending = hold(),
    button = control();
  await act(async () => {
    button.click();
    button.click();
  });
  expect(pending).toHaveLength(1);
  expect(control().disabled).toBe(true);
  expect(control(false).disabled).toBe(true);
  await act(async () => pending[0]!.resolve({ ...message, status: "cancelled" }));
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe(
    "Keep the full draft\n\nOriginal queued question",
  );
});
it("an original A cancellation ACK survives A to B to A without changing the new draft or clearing a newer busy operation", async () => {
  await render();
  const pending = hold(),
    original = await dispatch();
  await render("b");
  expect(control().disabled).toBe(false);
  await render("a");
  expect(control().disabled).toBe(false);
  await act(async () => useStore.getState().setConversationDraft("a", "Current A draft"));
  const newer = await dispatch(false);
  expect(control().disabled).toBe(true);
  const ack = { ...message, status: "cancelled" };
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(original.completion).resolves.toBe(ack);
  });
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Current A draft");
  expect(control().disabled).toBe(true);
  expect(control(false).disabled).toBe(true);
  await act(async () => {
    pending[1]!.resolve(ack);
    await expect(newer.completion).resolves.toBe(ack);
  });
  expect(control()).toBeNull();
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Current A draft");
});
it("retired rejection remains identical and does not clear or toast over a fresh original invocation", async () => {
  await render();
  const pending = hold(),
    original = await dispatch();
  await render("b");
  await render("a");
  const newer = await dispatch(false);
  const error = new Error("Original retired cancellation");
  await act(async () => {
    pending[0]!.reject(error);
    await expect(original.completion).rejects.toBe(error);
  });
  expect(control().disabled).toBe(true);
  expect(useStore.getState().toasts).toEqual([]);
  const currentError = new Error("Original current cancellation");
  await act(async () => {
    pending[1]!.reject(currentError);
    await expect(newer.completion).rejects.toBe(currentError);
  });
  expect(control().disabled).toBe(false);
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep the full draft");
});
it("native button failure reports once and releases busy for the current original owner", async () => {
  await render();
  const pending = hold();
  await act(async () => control().click());
  await act(async () => pending[0]!.reject(new Error("Current original cancellation failed")));
  expect(control().disabled).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep the full draft");
});
it("keeps legitimate browser event publication before the original ACK from losing the Edit draft", async () => {
  await render();
  const pending = hold(),
    invocation = await dispatch();
  const ack = { ...message, status: "cancelled" as const, updatedAt: 2 };
  rows.set("a", [ack]);
  await act(async () => {
    for (const listener of events)
      listener({ type: "conversation.messages.changed", payload: { chatId: "a" } } as never);
  });
  expect(control()).toBeNull();
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(invocation.completion).resolves.toBe(ack);
  });
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe(
    "Keep the full draft\n\nOriginal queued question",
  );
});
it("observed original message mutation refuses permanently before producer dispatch", async () => {
  await render();
  control().focus();
  message.text = "Foreign replacement text";
  await expect(executeCommand("edit-conversation-queued-message")).rejects.toThrow("current queued");
  message.text = "Original queued question";
  await expect(executeCommand("edit-conversation-queued-message")).rejects.toThrow("current queued");
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.message.cancel")).toEqual(
    [],
  );
});
it("refuses hidden or foreign-focused controls and actual window ABA without launching cancellation", async () => {
  await render();
  const edit = control();
  edit.focus();
  edit.hidden = true;
  await expect(executeCommand("edit-conversation-queued-message")).rejects.toThrow("original focused");
  edit.hidden = false;
  const other = document.createElement("button");
  document.body.append(other);
  other.focus();
  await expect(executeCommand("edit-conversation-queued-message")).rejects.toThrow("original focused");
  other.remove();
  edit.focus();
  bridge.windowId = "foreign";
  await expect(executeCommand("edit-conversation-queued-message")).rejects.toThrow("current queued");
  bridge.windowId = originalWindow;
  await expect(executeCommand("edit-conversation-queued-message")).rejects.toThrow("current queued");
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.message.cancel")).toEqual(
    [],
  );
});
it("rejects an unrelated cancellation acknowledgment without appending its text or losing busy cleanup", async () => {
  await render();
  const pending = hold(),
    invocation = await dispatch();
  await act(async () => {
    pending[0]!.resolve({ ...message, text: "Foreign replacement", status: "cancelled" });
    await expect(invocation.completion).rejects.toThrow("acknowledgment");
  });
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep the full draft");
  expect(control().disabled).toBe(false);
});
it("adds exactly the two focused normal-window remappable queue command policies", () => {
  for (const id of ["edit-conversation-queued-message", "remove-conversation-queued-message"])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      handler: "shell",
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
      intercept: true,
      focusShell: true,
    });
});

it("reorders complete queued rows with keyboard-accessible controls and the exact queue revision", async () => {
  rows.set("a", [
    message,
    { ...message, messageId: "second", deliveryRunId: "next-second", text: "Second payload" },
  ]);
  await render();
  const down = host.querySelector<HTMLButtonElement>('button[aria-label="Move queued message 1 down"]')!;
  down.focus();
  await act(async () => down.click());
  expect(bridge.invoke).toHaveBeenCalledWith("runs.messages.reorder", {
    chatId: "a",
    expectedRevision: "f".repeat(64),
    messageIds: ["second", "queued-a"],
  });
  expect(
    [...host.querySelectorAll(".composer-queue li")].map((node) => node.getAttribute("data-message-id")),
  ).toEqual(["second", "queued-a"]);
});
it("disables queue drag and keyboard movement once any pending message begins delivery", async () => {
  rows.set("a", [
    message,
    { ...message, messageId: "second", deliveryRunId: "next-second", status: "delivering" },
  ]);
  await render();
  expect(host.querySelector<HTMLLIElement>(".composer-queue li")!.draggable).toBe(false);
  expect(
    host.querySelector<HTMLButtonElement>('button[aria-label="Move queued message 1 down"]')!.disabled,
  ).toBe(true);
});
