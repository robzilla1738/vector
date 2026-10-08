// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ConversationSummary } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
import { SidebarChats } from "./SidebarChats";
import { ChatHistory } from "./ChatHistory";

const original = {
  state: useStore.getState(),
  privateMode: bridge.privateMode,
  kind: bridge.windowKind,
  windowId: bridge.windowId,
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const storage = {
  length: 0,
  key: vi.fn(() => null),
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
const chat = (id: string): ConversationSummary => ({
  chatId: id,
  title: id,
  privateTask: true,
  archived: false,
  createdAt: 1,
  updatedAt: 1,
  turnCount: 1,
  latestRun: makeRun({ runId: `run-${id}`, status: "completed", config: { chatId: id, privateTask: true } }),
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("localStorage", storage);
  vi.useFakeTimers();
  vi.clearAllMocks();
  bridge.privateMode = true;
  bridge.windowKind = "private";
  bridge.windowId = "private-window";
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  useStore.setState(
    { ...original.state, connected: true, runs: [], conversationDrafts: {}, conversationId: null },
    true,
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(original.state, true);
  bridge.privateMode = original.privateMode;
  bridge.windowKind = original.kind;
  bridge.windowId = original.windowId;
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("reopens earlier answers from the current private worker after New chat, including its paged history", async () => {
  const rows = [chat("Second private answer"), chat("First private answer")];
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "conversations.list") return rows;
    if (method === "conversations.prepared" || method === "runs.branch.list") return [];
    throw new Error(`Unexpected private history method ${method}`);
  });
  await act(async () => root.render(<SidebarChats compact />));
  await act(async () => vi.advanceTimersByTimeAsync(1));
  expect(host.querySelectorAll(".session-open")).toHaveLength(2);
  await act(async () => useStore.getState().openConversation(null));
  await act(async () => host.querySelectorAll<HTMLButtonElement>(".session-open")[1]!.click());
  expect(useStore.getState().conversationId).toBe("First private answer");
  await act(async () => host.querySelector<HTMLButtonElement>(".sb-show-all")!.click());
  expect(useStore.getState().conversationId).toBe("history");
  await act(async () => root.render(<ChatHistory />));
  await act(async () => vi.advanceTimersByTimeAsync(110));
  expect(host.querySelector("h1")?.textContent).toBe("Private chats");
  expect(host.textContent).toContain("Available until the last private window closes.");
  expect(host.querySelectorAll(".history-conversation")).toHaveLength(2);
  expect(
    invoke.mock.calls.filter(([method]) => method === "conversations.list").map(([, params]) => params),
  ).toEqual([
    { archived: false, limit: 3 },
    { archived: false, limit: 41 },
  ]);
  expect(storage.key).not.toHaveBeenCalled();
  expect(storage.getItem).not.toHaveBeenCalled();
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(storage.removeItem).not.toHaveBeenCalled();
});

it("discards a private history response after its original window and Profile scope retire", async () => {
  let finishPrivate!: (rows: ConversationSummary[]) => void;
  const pending = new Promise<ConversationSummary[]>((resolve) => {
    finishPrivate = resolve;
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method !== "conversations.list") throw new Error(`Unexpected ${method}`);
    return bridge.privateMode ? pending : [chat("Normal worker answer")];
  });
  await act(async () => root.render(<SidebarChats compact />));
  await act(async () => vi.advanceTimersByTimeAsync(1));
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  bridge.windowId = "normal-window";
  await act(async () => root.render(<SidebarChats compact />));
  await act(async () => vi.advanceTimersByTimeAsync(1));
  await act(async () => finishPrivate([chat("Retired private answer")]));
  expect(host.textContent).toContain("Normal worker answer");
  expect(host.textContent).not.toContain("Retired private answer");
  expect(
    useStore
      .getState()
      .runs.map((run) => run.goal)
      .join(" "),
  ).not.toContain("Retired private answer");
});
