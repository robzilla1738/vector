// @vitest-environment jsdom
import { act, type ReactNode, type RefObject } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HOME_DRAFT_CHAT_KEY } from "../conversation-drafts";
import { type PageTarget } from "@aux/contracts";

const fixture = vi.hoisted(() => ({
  draft: "",
  conversationDrafts: {} as Record<string, string>,
  conversationContexts: {} as Record<string, string>,
  conversationBrowserSources: {} as Record<string, import("@aux/contracts").PageContextRef[]>,
  pages: { allIds: [] as string[], byId: {} as Record<string, PageTarget> },
  runs: [] as unknown[],
  setAgentDraft: vi.fn(),
  setConversationDraft: vi.fn(),
  setConversationContext: vi.fn(),
  setConversationBrowserSources: vi.fn(),
  railOpen: false,
  focusRequest: 0,
  focusShell: vi.fn(),
  runCommand: vi.fn(),
  listeners: new Set<(event: { type: string; payload: { chatId: string } }) => void>(),
}));
vi.mock("../store", () => {
  const state = () => ({
    ...fixture,
    agentDraft: fixture.draft,
    connected: false,
  });
  return {
    errToast: vi.fn(),
    useStore: Object.assign((select: (value: unknown) => unknown) => select(state()), { getState: state }),
  };
});
vi.mock("../commands", async () => {
  const { invokeScopedControl } = await import("../scoped-control-commands");
  return {
    runCommand: fixture.runCommand,
    executeCommand: (id: string, context: Parameters<typeof invokeScopedControl>[1]) => {
      try {
        return Promise.resolve(invokeScopedControl(id, context));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
});
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "main",
    windowKind: "normal",
    privateMode: false,
    focusShell: fixture.focusShell,
    onEvent: (fn: typeof fixture.listeners extends Set<infer T> ? T : never) => {
      fixture.listeners.add(fn);
      return () => fixture.listeners.delete(fn);
    },
  },
}));
vi.mock("./Conversation", () => ({
  Conversation: ({
    chatId,
    onChatCreated,
    entryControls,
    composerRef,
  }: {
    chatId: string | null;
    onChatCreated: (id: string) => void;
    entryControls?: ReactNode;
    composerRef: RefObject<HTMLTextAreaElement | null>;
  }) => (
    <section data-chat-id={chatId ?? "new"}>
      <textarea ref={composerRef} />
      {entryControls}
      <button onClick={() => onChatCreated("durable-chat")}>Create chat</button>
    </section>
  ),
}));
import HomeAsk from "./HomeAsk";
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  fixture.draft = "";
  fixture.conversationDrafts = {};
  fixture.conversationContexts = {};
  fixture.conversationBrowserSources = {};
  fixture.pages = { allIds: [], byId: {} };
  fixture.runs = [];
  fixture.setAgentDraft.mockReset().mockImplementation((text: string) => {
    fixture.draft = text;
  });
  fixture.setConversationDraft.mockReset().mockImplementation((id: string, text: string) => {
    fixture.conversationDrafts[`chat:${id}`] = text;
  });
  fixture.setConversationContext.mockReset();
  fixture.setConversationBrowserSources.mockReset();
  fixture.railOpen = false;
  fixture.focusRequest = 0;
  fixture.listeners.clear();
  fixture.focusShell.mockReset().mockResolvedValue(undefined);
  fixture.runCommand.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render(onSearch?: () => void) {
  await act(async () => root.render(<HomeAsk onSearch={onSearch} />));
}
function currentChat() {
  return container.querySelector("section")?.getAttribute("data-chat-id");
}

it("uses the real home draft pointer on creation and remount without adding search controls", async () => {
  await render();
  expect(currentChat()).toBe("new");
  expect(container.querySelector('[aria-label="Search or Ask"]')).toBeNull();
  act(() => container.querySelector<HTMLButtonElement>("button")!.click());
  expect(currentChat()).toBe("durable-chat");
  expect(localStorage.getItem(HOME_DRAFT_CHAT_KEY)).toBe("durable-chat");
  act(() => root.unmount());
  root = createRoot(container);
  await render();
  expect(currentChat()).toBe("durable-chat");
  expect(fixture.listeners.size).toBe(1);
});
it("starts a new text draft instead of reopening an older pending chat", async () => {
  localStorage.setItem(HOME_DRAFT_CHAT_KEY, "older-chat");
  fixture.draft = "A new task";
  await render();
  expect(currentChat()).toBe("new");
  expect(localStorage.getItem(HOME_DRAFT_CHAT_KEY)).toBe("older-chat");
});
it("deletes only the matching mounted draft and cleans its event subscription", async () => {
  localStorage.setItem(HOME_DRAFT_CHAT_KEY, "kept-chat");
  await render();
  act(() => {
    for (const listener of fixture.listeners)
      listener({ type: "conversation.deleted", payload: { chatId: "other" } });
  });
  expect(currentChat()).toBe("kept-chat");
  act(() => {
    for (const listener of fixture.listeners)
      listener({ type: "conversation.deleted", payload: { chatId: "kept-chat" } });
  });
  expect(currentChat()).toBe("new");
  expect(localStorage.getItem(HOME_DRAFT_CHAT_KEY)).toBeNull();
  expect(fixture.listeners.size).toBe(1);
  act(() => root.unmount());
  root = createRoot(container);
  expect(fixture.listeners.size).toBe(0);
  await render();
  expect(currentChat()).toBe("new");
});
it("shows search controls only for the explicit command-bar Ask entry", async () => {
  const search = vi.fn();
  await render(search);
  const buttons = container.querySelectorAll<HTMLButtonElement>('[aria-label="Search or Ask"] button');
  expect(buttons).toHaveLength(2);
  expect(buttons[1]!.getAttribute("aria-pressed")).toBe("true");
  act(() => buttons[0]!.click());
  expect(search).toHaveBeenCalledOnce();
});
it("offers the rail handoff without an implicit search action and avoids stealing its focus", async () => {
  fixture.railOpen = true;
  await render();
  expect(container.querySelector("textarea")).toBeNull();
  expect(container.textContent).not.toContain("Search instead");
  expect(fixture.focusShell).not.toHaveBeenCalled();
  act(() => container.querySelector<HTMLButtonElement>("button")!.click());
  expect(fixture.runCommand).toHaveBeenCalledExactlyOnceWith("agent-rail");
  expect(container.querySelector("button")?.getAttribute("data-command-id")).toBe("agent-rail");
  const search = vi.fn();
  await render(search);
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (b) => b.textContent === "Search instead",
  )!;
  act(() => button.click());
  expect(search).toHaveBeenCalledOnce();
});
it("does not focus a detached composer when the native shell handoff settles late", async () => {
  let resolve!: () => void;
  fixture.focusShell.mockImplementation(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  await render();
  const textarea = container.querySelector("textarea")!;
  const focus = vi.spyOn(textarea, "focus");
  act(() => root.unmount());
  root = createRoot(container);
  await act(async () => resolve());
  expect(focus).not.toHaveBeenCalled();
});

it("preserves a newer home pointer written by another window when this chat is deleted", async () => {
  localStorage.setItem(HOME_DRAFT_CHAT_KEY, "older-chat");
  await render();
  localStorage.setItem(HOME_DRAFT_CHAT_KEY, "newer-chat");
  act(() => {
    for (const listener of fixture.listeners)
      listener({ type: "conversation.deleted", payload: { chatId: "older-chat" } });
  });
  expect(currentChat()).toBe("new");
  expect(localStorage.getItem(HOME_DRAFT_CHAT_KEY)).toBe("newer-chat");
});

it("inserts a suggestion into the existing durable draft once, preserves its text, and acknowledges its exact request", async () => {
  localStorage.setItem(HOME_DRAFT_CHAT_KEY, "first-draft");
  fixture.conversationDrafts["chat:first-draft"] = "Existing unsent question";
  const request = { text: "Draft a routine proposal" };
  const consumed = vi.fn();
  await act(async () => root.render(<HomeAsk promptRequest={request} onPromptConsumed={consumed} />));
  expect(fixture.setConversationDraft).toHaveBeenCalledExactlyOnceWith(
    "first-draft",
    "Existing unsent question\n\nDraft a routine proposal",
  );
  expect(fixture.setAgentDraft).not.toHaveBeenCalled();
  expect(consumed).toHaveBeenCalledExactlyOnceWith(request);
  expect(document.activeElement).toBe(container.querySelector("textarea"));
  await act(async () => root.render(<HomeAsk promptRequest={request} onPromptConsumed={consumed} />));
  expect(fixture.setConversationDraft).toHaveBeenCalledTimes(1);
  expect(fixture.runCommand).not.toHaveBeenCalled();
});

it("keeps a suggestion pending during a rail handoff and inserts it locally without changing chosen browser sources", async () => {
  fixture.railOpen = true;
  fixture.draft = "My draft";
  fixture.conversationContexts = { new: "chosen-source" };
  const request = { text: "Review memory notes" };
  const consumed = vi.fn();
  await act(async () => root.render(<HomeAsk promptRequest={request} onPromptConsumed={consumed} />));
  expect(consumed).not.toHaveBeenCalled();
  expect(fixture.setAgentDraft).not.toHaveBeenCalled();
  fixture.railOpen = false;
  await act(async () => root.render(<HomeAsk promptRequest={request} onPromptConsumed={consumed} />));
  expect(fixture.setAgentDraft).toHaveBeenCalledExactlyOnceWith("My draft\n\nReview memory notes");
  expect(consumed).toHaveBeenCalledExactlyOnceWith(request);
  expect(fixture.setConversationContext).not.toHaveBeenCalled();
  expect(fixture.setConversationBrowserSources).not.toHaveBeenCalled();
  expect(fixture.runCommand).not.toHaveBeenCalled();
});
