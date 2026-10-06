// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SidebarChats } from "../chat-list/SidebarChats";
import { bridge } from "../bridge";
import { makeRun } from "../mock/fixtures";

it("bounds recent chats, exposes organization in one menu, and requires confirmation before deletion", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    get length() {
      return storage.size;
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.useFakeTimers();
  const rows = Array.from({ length: 9 }, (_, i) => ({
    chatId: `chat-${i}`,
    title: `Session ${i}`,
    archived: false,
    updatedAt: 100 - i,
    createdAt: 100 - i,
    turnCount: 1,
    latestRun: makeRun({ runId: `run-${i}`, config: { chatId: `chat-${i}` } }),
  }));
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation(async (method, params) =>
      method === "conversations.list"
        ? rows
        : method === "conversations.rename"
          ? { ...rows[0], title: (params as { title: string }).title }
          : undefined,
    );
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<SidebarChats compact />));
    await act(async () => vi.advanceTimersByTimeAsync(110));
    expect(host.querySelectorAll(".session-item")).toHaveLength(3);
    expect(host.querySelectorAll(".session-item .ui-menu-trigger")).toHaveLength(3);
    expect(host.textContent).toContain("All chats");
    expect(host.textContent).not.toContain("Projects");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Session 0"]')!.click(),
    );
    const item = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("Delete chat"),
    )!;
    await act(async () => item.click());
    expect(invoke.mock.calls.some(([method]) => method === "conversations.delete")).toBe(false);
    expect(host.querySelector(".session-disclosure.open")?.textContent).toContain(
      "Delete this chat permanently?",
    );
    await act(async () =>
      host
        .querySelector(".session-disclosure.open")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(host.querySelector(".session-disclosure.open")).toBeNull();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Session 0");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Session 0"]')!.click(),
    );
    const move = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("Move to project"),
    )!;
    await act(async () => move.click());
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Project for Session 0");
    await act(async () =>
      host
        .querySelector(".session-disclosure.open")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Session 0");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Session 0"]')!.click(),
    );
    const rename = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("Rename"),
    )!;
    await act(async () => rename.click());
    const name = host.querySelector<HTMLInputElement>('[aria-label="Conversation name"]')!;
    expect(document.activeElement).toBe(name);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        name,
        "Renamed session",
      );
      name.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => host.querySelector<HTMLButtonElement>(".session-editor button")!.click());
    expect(invoke).toHaveBeenCalledWith("conversations.rename", {
      chatId: "chat-0",
      title: "Renamed session",
    });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Renamed session");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Chat options"]')!.click());
    const create = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("New chat project"),
    )!;
    await act(async () => create.click());
    const project = host.querySelector<HTMLInputElement>('[aria-label="Chat project name"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(project, "Review");
      project.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => host.querySelector<HTMLButtonElement>(".session-editor button")!.click());
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Chat options");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for project Review"]')!.click(),
    );
    const renameProject = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("Rename project"),
    )!;
    await act(async () => renameProject.click());
    const projectRename = host.querySelector<HTMLInputElement>('[aria-label="Chat project name"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        projectRename,
        "Focused",
      );
      projectRename.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => host.querySelector<HTMLButtonElement>(".session-editor button")!.click());
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for project Focused");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Renamed session"]')!.click(),
    );
    const moveAgain = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("Move to project"),
    )!;
    await act(async () => moveAgain.click());
    const select = host.querySelector<HTMLSelectElement>('[aria-label="Project for Renamed session"]')!;
    const folderId = select.querySelectorAll("option")[1]!.value;
    await act(async () => {
      select.value = folderId;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Renamed session");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Renamed session"]')!.click(),
    );
    const deleteItem = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes("Delete chat"),
    )!;
    await act(async () => deleteItem.click());
    await act(async () => host.querySelector<HTMLButtonElement>(".session-confirm .danger")!.click());
    expect(invoke).toHaveBeenCalledWith("conversations.delete", { chatId: "chat-0" });
    expect(document.activeElement?.classList.contains("session-open")).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

it("searches all saved chats and reveals matches inside collapsed projects without changing their state", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    get length() {
      return storage.size;
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const { writeChatFolder, moveChatToFolder, readChatFolders } = await import("../chat-folders");
  writeChatFolder(localStorage, { id: "project", name: "Research", collapsed: true });
  moveChatToFolder(localStorage, "match", "project");
  const rows = ["Other chat", "Budget review"].map((title, i) => ({
    chatId: i ? "match" : "other",
    title,
    archived: false,
    updatedAt: i,
    createdAt: i,
    turnCount: 1,
    latestRun: makeRun({ runId: `search-${i}` }),
  }));
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation(async (method) => (method === "conversations.list" ? rows : undefined));
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<SidebarChats query="  BUDGET  " />));
    await act(async () => vi.advanceTimersByTimeAsync(110));
    expect(Array.from(host.querySelectorAll(".session-open"), (row) => row.textContent)).toEqual([
      "Budget review",
    ]);
    expect(host.querySelector(".session-folder-toggle")?.getAttribute("aria-expanded")).toBe("true");
    expect(readChatFolders(localStorage).folders[0]?.collapsed).toBe(true);
    await act(async () => root.render(<SidebarChats query="missing" />));
    expect(host.textContent).toContain("No matching chats.");
    expect(host.querySelector(".session-folder")).toBeNull();
    await act(async () => root.render(<SidebarChats />));
    expect(host.querySelector(".session-folder-toggle")?.getAttribute("aria-expanded")).toBe("false");
    expect(Array.from(host.querySelectorAll(".session-open"), (row) => row.textContent)).toEqual([
      "Other chat",
    ]);
    expect(invoke.mock.calls.filter(([method]) => method === "conversations.list")).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
