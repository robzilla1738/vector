// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { Conversation } from "./Conversation";
import { executeCommand } from "../commands";
import { makeRun } from "../mock/fixtures";
import { COMMANDS } from "@aux/contracts";
import { ConversationDetails, useConversationOwner } from "./ConversationControls";


let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  useStore.setState({ agentDraft: "Keep this page-free question", railOpen: false, runs: [], pendingTurns: [], pages: [], connected: true, conversationId: null, toasts: [] });
  vi.spyOn(bridge, "invoke").mockImplementation(async method => {
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
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true);
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});

function Details({ id, text = "Original diagnostic" }: { id: string; text?: string }) {
  const current = useConversationOwner(id, true);
  return <ConversationDetails current={current} text={text} />;
}
it("dispatches the original native disclosure once and supports its focused remapped action", async () => {
  await act(async () => root.render(<Details id="a" />));
  const summary = host.querySelector("summary")!;
  const details = host.querySelector("details")!;
  await act(async () => summary.click());
  expect(details.open).toBe(true);
  summary.focus();
  await act(async () => { await executeCommand("toggle-conversation-error-details"); });
  expect(details.open).toBe(false);
  expect(host.querySelector("p")?.textContent).toBe("Original diagnostic");
});
it("refuses a changed native window before disclosure and keeps foreign focus out", async () => {
  await act(async () => root.render(<Details id="a" />));
  const summary = host.querySelector("summary")!; summary.focus();
  const original = bridge.windowId;
  bridge.windowId = "foreign";
  await expect(executeCommand("toggle-conversation-error-details")).rejects.toThrow("current conversation");
  expect(host.querySelector("details")!.open).toBe(false);
  bridge.windowId = original;
  const foreign = document.createElement("button"); document.body.append(foreign); foreign.focus();
  await expect(executeCommand("toggle-conversation-error-details")).rejects.toThrow("original focused");
  foreign.remove();
});
it("retries genuine failed history through its registered original button", async () => {
  let attempts = 0;
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "runs.list" && ++attempts === 1) throw new Error("Original history failure");
    return original(method, params);
  });
  await act(async () => root.render(<Conversation chatId="a" />));
  expect(host.textContent).toContain("Original history failure");
  const retry = host.querySelector<HTMLButtonElement>('[data-command-id="load-conversation-history"]')!;
  expect(retry.textContent).toBe("Try again");
  await act(async () => retry.click());
  expect(attempts).toBe(2);
  expect(host.textContent).not.toContain("Original history failure");
  expect(useStore.getState().pages).toEqual([]);
});
it("retires a held history error across committed chat A to B to A", async () => {
  let reject!: (reason: Error) => void;
  let attempts = 0;
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "runs.list" && ++attempts === 1) return new Promise((_done, fail) => { reject = fail; });
    return original(method, params);
  });
  await act(async () => root.render(<Conversation chatId="a" />));
  await act(async () => root.render(<Conversation chatId="b" />));
  await act(async () => root.render(<Conversation chatId="a" />));
  await act(async () => reject(new Error("Retired history diagnostic")));
  expect(host.textContent).not.toContain("Retired history diagnostic");
  expect(host.textContent).not.toContain("Loading conversation…");
});
it("retries actual saved-context failure without changing the retained draft", async () => {
  let attempts = 0;
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "conversations.images.get" && ++attempts === 1) throw new Error("Original context failure");
    return original(method, params);
  });
  useStore.setState({ conversationDrafts: { "chat:a": "Retained reply" } });
  await act(async () => root.render(<Conversation chatId="a" />));
  const retry = host.querySelector<HTMLButtonElement>('[data-command-id="reload-conversation-context"]')!;
  expect(retry).toBeTruthy();
  await act(async () => retry.click());
  expect(attempts).toBe(2);
  expect(host.textContent).not.toContain("Original context failure");
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("Retained reply");
});

it("keeps the original history cursor and reserves same-tick load-earlier input", async () => {
  let complete!: (value: unknown[]) => void;
  let attempts = 0;
  const rows = Array.from({ length: 50 }, (_, n) => makeRun({ runId: `run-${n}`, status: "completed", createdAt: n + 1 }));
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "runs.list") {
      if (++attempts === 1) return rows;
      return new Promise(done => { complete = done; });
    }
    return original(method, params);
  });
  await act(async () => root.render(<Conversation chatId="a" />));
  const earlier = host.querySelector<HTMLButtonElement>('[data-command-id="load-conversation-history"]')!;
  expect(earlier.textContent).toBe("Load earlier messages");
  await act(async () => { earlier.click(); earlier.click(); });
  expect(attempts).toBe(2);
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.list")[1]?.[1]).toEqual({ chatId: "a", limit: 50, before: { createdAt: 50, runId: "run-49" } });
  await act(async () => complete([]));
  expect(host.querySelector('[data-command-id="load-conversation-history"]')).toBeNull();
});
it("does not deliver a held old context failure after a committed chat roundtrip", async () => {
  let reject!: (reason: Error) => void;
  let attempts = 0;
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "conversations.images.get" && ++attempts === 1) return new Promise((_done, fail) => { reject = fail; });
    return original(method, params);
  });
  await act(async () => root.render(<Conversation chatId="a" />));
  await act(async () => root.render(<Conversation chatId="b" />));
  await act(async () => root.render(<Conversation chatId="a" />));
  await act(async () => reject(new Error("Retired context diagnostic")));
  expect(host.textContent).not.toContain("Retired context diagnostic");
  expect(host.querySelector('[data-command-id="reload-conversation-context"]')).toBeNull();
});
it("registers only the closed original normal-window scoped command policies", () => {
  for (const id of ["load-conversation-history", "reload-conversation-context", "toggle-conversation-error-details"]) {
    const command = COMMANDS.find(command => command.id === id)!;
    expect(command).toMatchObject({ handler: "shell", dispatch: "scoped", windows: ["normal"], palette: false, intercept: true, bindings: [] });
  }
});
