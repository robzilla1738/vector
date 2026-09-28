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
      const start = params.before ? rows.findIndex(row => row.chatId === params.before!.chatId) + 1 : 0;
      return rows.slice(start, start + params.limit) as never;
    }
    if (method === "conversations.archive") return { ...rows[0], archived: false } as never;
    throw new Error(`Unexpected method ${method}`);
  });
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<ArchivedChatsSettings active />));
    await act(async () => vi.advanceTimersByTimeAsync(180));
    expect(invoke).toHaveBeenCalledWith("conversations.list", expect.objectContaining({ archived: true }));
    expect(container.querySelectorAll(".settings-archived-row")).toHaveLength(40);
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Load more")!.click());
    expect(container.querySelectorAll(".settings-archived-row")).toHaveLength(41);
    await act(async () => container.querySelector<HTMLButtonElement>(".settings-archived-row .btn")!.click());
    expect(invoke).toHaveBeenCalledWith("conversations.archive", { chatId: "archive-0", archived: false });
    expect(container.querySelectorAll(".settings-archived-row")).toHaveLength(40);
    expect(container.textContent).not.toContain("Archived 0");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    useStore.setState(initial, true);
  }
});
