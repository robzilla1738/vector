// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { makeRun } from "../../mock/fixtures";
import { useStore } from "../../store";
import { ArchivedChatsSettings } from "./ArchivedChats";

it("pages archived chats and restores one without losing the remaining results", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const initial = useStore.getState();
  useStore.setState({ connected: true });
  const rows = Array.from({ length: 41 }, (_, index) => ({
    chatId: `archive-${index}`,
    title: `Archived ${index}`,
    archived: true,
    createdAt: 1000 - index,
    updatedAt: 1000 - index,
    turnCount: 1,
    latestRun: makeRun({ runId: `run-${index}`, config: { chatId: `archive-${index}` } }),
  }));
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, input) => {
    if (method === "conversations.list") {
      const params = input as { archived: boolean; limit: number; before?: { chatId: string } };
      const start = params.before ? rows.findIndex((row) => row.chatId === params.before!.chatId) + 1 : 0;
      return rows.slice(start, start + params.limit) as never;
    }
    if (method === "conversations.archive") return { ...rows[0], archived: false } as never;
    throw new Error(`Unexpected method ${method}`);
  });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<ArchivedChatsSettings active />));
    await act(async () => vi.advanceTimersByTimeAsync(180));
    expect(invoke).toHaveBeenCalledWith("conversations.list", expect.objectContaining({ archived: true }));
    expect(container.querySelectorAll(".settings-archived-row")).toHaveLength(40);
    await act(async () =>
      [...container.querySelectorAll<HTMLButtonElement>("button")]
        .find((button) => button.textContent === "Load more")!
        .click(),
    );
    expect(container.querySelectorAll(".settings-archived-row")).toHaveLength(41);
    const trigger = container.querySelector<HTMLButtonElement>(".settings-archived-row .ui-menu-trigger")!;
    await act(async () => trigger.click());
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
        .find((button) => button.textContent?.trim() === "Restore")!
        .click(),
    );
    expect(invoke).toHaveBeenCalledWith("conversations.archive", { chatId: "archive-0", archived: false });
    expect(container.querySelectorAll(".settings-archived-row")).toHaveLength(40);
    expect(container.textContent).not.toContain("Archived 0");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    useStore.setState(initial, true);
  }
});

it("returns focus from its menu and refuses a stale archived selection after deletion review", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const initial = useStore.getState();
  useStore.setState({ connected: true });
  let item = {
    chatId: "original",
    title: "Original archived chat",
    archived: true,
    createdAt: 1,
    updatedAt: 1,
    turnCount: 1,
    latestRun: makeRun({ runId: "original-run", config: { chatId: "original" } }),
  };
  let notify: ((event: any) => void) | undefined;
  vi.spyOn(bridge, "onEvent").mockImplementation((callback) => {
    notify = callback;
    return () => {};
  });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "conversations.list") return [item] as never;
    if (method === "conversations.delete") return undefined as never;
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ArchivedChatsSettings active />));
    await act(async () => vi.advanceTimersByTimeAsync(180));
    const trigger = host.querySelector<HTMLButtonElement>(".ui-menu-trigger")!;
    trigger.focus();
    await act(async () => trigger.click());
    await act(async () =>
      document
        .querySelector('[role="menu"]')!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
    );
    expect(document.activeElement).toBe(trigger);
    await act(async () => trigger.click());
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
        .find((button) => button.textContent?.trim() === "Delete")!
        .click(),
    );
    expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain("Original archived chat");
    item = { ...item, title: "Changed archived chat", updatedAt: 2 };
    await act(async () => {
      notify?.({ type: "conversation.changed", payload: { chatId: "original" } });
      await vi.advanceTimersByTimeAsync(180);
    });
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')]
        .find((button) => button.textContent?.trim() === "Delete chat")!
        .click(),
    );
    expect(invoke.mock.calls.some(([method]) => method === "conversations.delete")).toBe(false);
    expect(host.textContent).toContain("This archived chat changed");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    useStore.setState(initial, true);
  }
});
