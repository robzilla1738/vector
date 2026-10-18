// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { AuxEvent } from "@aux/contracts";
import { expect, it, vi } from "vitest";
import { ChatHistory } from "./chat-list/ChatHistory";
import { bridge } from "./bridge";
import { makeRun } from "./mock/fixtures";
import { useStore } from "./store";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("refreshes the loaded history range instead of dropping older pages", async () => {
  vi.useFakeTimers();
  const initial = useStore.getState();
  useStore.setState({ connected: true });
  const rows = Array.from({ length: 90 }, (_, index) => ({
    chatId: `chat-${index}`,
    title: `Chat ${index}`,
    archived: false,
    createdAt: 1000 - index,
    updatedAt: 1000 - index,
    turnCount: 1,
    latestRun: makeRun({ runId: `run-${index}`, config: { chatId: `chat-${index}` } }),
  }));
  let receive!: (event: AuxEvent) => void;
  vi.spyOn(bridge, "onEvent").mockImplementation((callback) => {
    receive = callback;
    return () => {};
  });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, input) => {
    if (method !== "conversations.list") return [];
    const params = input as { limit: number; before?: { chatId: string } };
    const start = params.before ? rows.findIndex((row) => row.chatId === params.before!.chatId) + 1 : 0;
    return rows.slice(start, start + params.limit);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ChatHistory />));
    await act(async () => vi.advanceTimersByTimeAsync(180));
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(40);
    const more = Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "Load more conversations",
    )!;
    await act(async () => more.click());
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(80);
    await act(async () => {
      receive({
        seq: 1,
        streamId: "test",
        ts: Date.now(),
        type: "conversation.changed",
        payload: { chatId: "chat-0" },
      });
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(invoke).toHaveBeenLastCalledWith("conversations.list", expect.objectContaining({ limit: 81 }));
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(80);
    expect(host.textContent).toContain("Load more conversations");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    vi.useRealTimers();
    useStore.setState(initial, true);
  }
});

it("keeps conversation actions in the shared menu and restores focus on Escape", async () => {
  vi.useFakeTimers();
  const initial = useStore.getState();
  useStore.setState({ connected: true });
  const row = {
    chatId: "chat-menu",
    title: "Menu chat",
    archived: false,
    createdAt: 1000,
    updatedAt: 1000,
    turnCount: 1,
    latestRun: makeRun({ runId: "run-menu", config: { chatId: "chat-menu" } }),
  };
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation(async (method) => (method === "conversations.list" ? [row] : []));
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ChatHistory />));
    await act(async () => vi.advanceTimersByTimeAsync(180));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Search chats"]')!.click());
    await act(async () => vi.advanceTimersByTimeAsync(20));
    const search = host.querySelector<HTMLInputElement>('[aria-label="Search conversations"]')!;
    await act(async () =>
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
    );
    expect(document.activeElement).toBe(host.querySelector(".history-conversation"));
    const trigger = host.querySelector<HTMLButtonElement>(".history-actions")!;
    await act(async () => trigger.click());
    const menu = document.querySelector<HTMLDialogElement>(
      'dialog[role="menu"][aria-label="Conversation actions"]',
    )!;
    expect(menu).not.toBeNull();
    expect(document.activeElement?.textContent).toContain("Rename");
    await act(async () => menu.querySelector<HTMLButtonElement>("button.danger")!.click());
    expect(menu.querySelector('[role="group"][aria-label="Confirm conversation deletion"]')).not.toBeNull();
    expect(invoke).not.toHaveBeenCalledWith("conversations.delete", expect.anything());
    await act(async () => menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.querySelector('dialog[role="menu"][aria-label="Conversation actions"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    useStore.setState(initial, true);
  }
});

it("orders oldest-first across every page, then keeps layout and archive filters independent", async () => {
  vi.useFakeTimers();
  const initial = useStore.getState();
  useStore.setState({ connected: true });
  const rows = Array.from({ length: 205 }, (_, index) => ({
    chatId: `chat-${index}`,
    title: `Chat ${index}`,
    archived: false,
    createdAt: 1000 - index,
    updatedAt: 1000 - index,
    turnCount: 1,
    latestRun: makeRun({
      runId: `run-${index}`,
      config: { chatId: `chat-${index}` },
      result: { answer: `Answer excerpt ${index}` },
    }),
  }));
  let finish!: () => void;
  const tail = new Promise<void>((resolve) => {
    finish = resolve;
  });
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, input) => {
    if (method !== "conversations.list") return [];
    const params = input as { limit: number; archived: boolean; before?: { chatId: string } };
    if (params.archived) return [{ ...rows[0]!, title: "Archived chat", archived: true }];
    const start = params.before ? rows.findIndex((row) => row.chatId === params.before!.chatId) + 1 : 0;
    if (params.limit === 200 && start) await tail;
    return rows.slice(start, start + params.limit);
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <ChatHistory composer={<textarea aria-label="Task draft" defaultValue="Keep this draft" />} />,
      ),
    );
    await act(async () => vi.advanceTimersByTimeAsync(180));
    expect(host.querySelector(".history-items.list")).not.toBeNull();
    expect(host.querySelector(".history-conversation strong")?.textContent).toBe("Chat 0");
    expect(host.querySelector(".history-conversation > span")?.textContent).toBe("Answer excerpt 0");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Sort chats"]')!.click());
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')]
        .find((button) => button.textContent === "Oldest first")!
        .click(),
    );
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(0);
    await act(async () => finish());
    expect(host.querySelector(".history-conversation strong")?.textContent).toBe("Chat 204");
    expect(
      invoke.mock.calls.some(
        ([, input]) => (input as { before?: { chatId: string } }).before?.chatId === "chat-199",
      ),
    ).toBe(true);
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(40);
    const more = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent === "Load more conversations",
    )!;
    await act(async () => more.click());
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(80);
    const draft = host.querySelector("textarea");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Card view"]')!.click());
    expect(host.querySelector(".history-items.grid")).not.toBeNull();
    expect(host.querySelector("textarea")).toBe(draft);
    expect(draft?.value).toBe("Keep this draft");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Filter chats"]')!.click());
    const archived = document.querySelectorAll<HTMLInputElement>('input[name="chat-state"]')[1]!;
    await act(async () => archived.click());
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(host.querySelector(".history-conversation strong")?.textContent).toBe("Archived chat");
    expect(draft?.value).toBe("Keep this draft");
    expect(invoke).toHaveBeenLastCalledWith("conversations.list", { archived: true, limit: 200 });
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    useStore.setState(initial, true);
  }
});
