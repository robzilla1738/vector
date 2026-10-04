// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Run, Suspension } from "@aux/contracts";
import { COMMANDS } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { dispatchShortcut, executeCommand } from "../commands";
import { makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";
import { ConversationLiveAction, useConversationLiveOwner } from "./ConversationLiveControls";
import { useConversationOwner } from "./ConversationControls";

const initial = useStore.getState();
const originalBridge = { windowId: bridge.windowId, privateMode: bridge.privateMode, windowKind: bridge.windowKind };
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, run: Run, request: Suspension | null;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  bridge.privateMode = false; bridge.windowKind = "normal";
  run = makeRun({ runId: "question-run", pageIds: [], status: "needs_input", statusMessage: "Which account?", config: { chatId: "draft-chat", contextPageRefs: [], messageRevision: 7 } });
  request = { suspensionId: "question-1", runId: run.runId, turnId: run.runId, threadId: "thread-1", state: "pending", kind: "ask-user-question", request: { kind: "ask-user-question", instruction: "Which account?", guidance: "Choose one." }, createdAt: 1 };
  useStore.setState({ ...initial, runs: [run], steps: { [run.runId]: [] }, pages: [], connected: true, pendingTurns: [], prompt: null, toasts: [],
    conversationDrafts: { "chat:draft-chat": "Original follow-up" }, runAnswerDrafts: { [run.runId]: { question: "Which account?", text: "Original answer" } } }, true);
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "runs.list") return [run];
    if (method === "runs.get") return { run, suspension: request, steps: [] };
    if (method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Draft", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    if (method === "runs.steer" || method === "runs.queue") return { ...params, status: "accepted", createdAt: 1, updatedAt: 1 };
    return { workspace: null, memory: null };
  });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); Object.assign(bridge, originalBridge);
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
async function render() { await act(async () => root.render(<Conversation chatId="draft-chat" embedded />)); }
function control(command: string) { return host.querySelector<HTMLButtonElement>(`[data-command-id="${command}"]`)!; }
function input() { return host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!; }

it.each(["steer", "queue"] as const)("dispatches focused remapped %s into its original follow-up producer and preserves the answer draft", async mode => {
  useStore.setState({ settings: { shortcutOverrides: { [`select-conversation-${mode}`]: [{ key: "j", command: true, alt: true }] } } });
  await render(); control(`select-conversation-${mode}`).focus();
  await act(async () => { expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true); });
  expect(input().value).toBe("Original follow-up");
  expect(control(`select-conversation-${mode}`).getAttribute("aria-pressed")).toBe("true");
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
  expect(bridge.invoke).toHaveBeenCalledWith(`runs.${mode}`, expect.objectContaining({ runId: run.runId, chatId: "draft-chat", text: "Original follow-up", pageIds: [], contextPageRefs: [], expectedRevision: 7, expectedTurnId: run.runId, mentions: [] }));
  expect(useStore.getState().runAnswerDrafts[run.runId]?.text).toBe("Original answer");
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.answer")).toEqual([]);
});
it("the original Answer button restores the separate draft and sends the exact typed suspension", async () => {
  await render(); await act(async () => control("select-conversation-queue").click());
  expect(input().value).toBe("Original follow-up");
  await act(async () => control("select-conversation-answer").click());
  expect(input().value).toBe("Original answer");
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
  expect(bridge.invoke).toHaveBeenCalledWith("runs.answer", { runId: run.runId, answer: "Original answer", expectedSuspensionId: "question-1", mentions: [] });
  expect(useStore.getState().conversationDrafts["chat:draft-chat"]).toBe("Original follow-up");
});
it("keeps approval decisions outside Answer and preserves disconnected local mode availability", async () => {
  request = { ...request!, kind: "approval", request: { kind: "approval", approvalId: "approval-1", instruction: "Review action", guidance: "Use approval prompt" } };
  useStore.setState({ connected: false }); await render();
  expect(control("select-conversation-answer")).toBeNull();
  await act(async () => control("select-conversation-queue").click());
  expect(control("select-conversation-queue").getAttribute("aria-pressed")).toBe("true");
  expect(input().value).toBe("Original follow-up");
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.answer" || method === "runs.queue")).toEqual([]);
});
it("retries the original missing durable request through its focused registered control", async () => {
  const originalRequest = request; request = null; await render();
  const retry = control("reload-conversation-request"); expect(retry.textContent).toBe("Retry loading request");
  const initialReads = vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.get").length;
  let complete!: (value: unknown) => void;
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) => method === "runs.get" ? new Promise(resolve => { complete = resolve; }) : fallback(method, params));
  retry.focus(); await act(async () => { await executeCommand("reload-conversation-request"); });
  expect(host.textContent).toContain("Checking the durable request");
  await act(async () => complete({ run, suspension: originalRequest, steps: [] }));
  expect(control("reload-conversation-request")).toBeNull();
  expect(control("select-conversation-answer")).not.toBeNull();
  expect(input().value).toBe("Original answer");
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.get")).toHaveLength(initialReads + 1);
});
it("refuses hidden, foreign-focused and observed-window ABA controls without changing drafts", async () => {
  await render(); const queue = control("select-conversation-queue"); queue.focus(); queue.hidden = true;
  await expect(executeCommand("select-conversation-queue")).rejects.toThrow("original focused"); queue.hidden = false;
  const foreign = document.createElement("button"); document.body.append(foreign); foreign.focus();
  await expect(executeCommand("select-conversation-queue")).rejects.toThrow("original focused"); foreign.remove(); queue.focus();
  bridge.windowId = "foreign-window"; await expect(executeCommand("select-conversation-queue")).rejects.toThrow("current conversation");
  bridge.windowId = originalBridge.windowId; await expect(executeCommand("select-conversation-queue")).rejects.toThrow("current conversation");
  expect(input().value).toBe("Original answer"); expect(useStore.getState().conversationDrafts["chat:draft-chat"]).toBe("Original follow-up");
});

function OwnerProbe({ value, suspension, capture }: { value: Run; suspension: Suspension | null; capture?(current: () => boolean): void }) {
  const current = useConversationOwner("draft-chat", useStore(state => state.connected));
  const live = useConversationLiveOwner(current, "draft-chat", value, suspension); capture?.(live);
  return <ConversationLiveAction command="select-conversation-queue" current={live} invoke={() => "original local acknowledgment"}>Queue next</ConversationLiveAction>;
}
it("stale run/request callbacks refuse without retiring the newer committed original owner", async () => {
  let old!: () => boolean;
  await act(async () => root.render(<OwnerProbe value={run} suspension={request} capture={value => { old = value; }} />));
  const next = { ...run, statusMessage: "New question" }, nextRequest = { ...request!, suspensionId: "question-2" };
  await act(async () => { useStore.setState({ runs: [next] }); root.render(<OwnerProbe value={next} suspension={nextRequest} />); });
  expect(old()).toBe(false); control("select-conversation-queue").focus();
  await expect(executeCommand("select-conversation-queue")).resolves.toBe("original local acknowledgment");
});
it("retains irreversible observed run mismatch and committed request ABA retirement", async () => {
  let original!: () => boolean;
  await act(async () => root.render(<OwnerProbe value={run} suspension={request} capture={value => { original = value; }} />));
  const state = useStore.getState(); state.runs = [{ ...run, statusMessage: "Foreign current question" }];
  expect(original()).toBe(false); state.runs = [run]; expect(original()).toBe(false);
  let prior!: () => boolean;
  await act(async () => root.render(<OwnerProbe key="request-owner" value={run} suspension={request} capture={value => { prior = value; }} />));
  expect(prior()).toBe(true);
  await act(async () => root.render(<OwnerProbe key="request-owner" value={run} suspension={{ ...request!, suspensionId: "other" }} />));
  await act(async () => root.render(<OwnerProbe key="request-owner" value={run} suspension={request} />));
  expect(prior()).toBe(false); control("select-conversation-queue").focus();
  await expect(executeCommand("select-conversation-queue")).resolves.toBe("original local acknowledgment");
});
it("adds only the four original focused normal-window remappable command policies", () => {
  const ids = ["select-conversation-answer", "select-conversation-steer", "select-conversation-queue", "reload-conversation-request"];
  for (const id of ids) expect(COMMANDS.find(row => row.id === id)).toMatchObject({ handler: "shell", windows: ["normal"], palette: false, bindings: [], intercept: true, focusShell: true });
});

it.each(["ack", "failure"] as const)("does not publish an original held request %s after observed foreign-owner retirement or replace the new mounted owner", async outcome => {
  const originalRequest = request; request = null; await render();
  let resolve!: (value: unknown) => void, reject!: (reason: Error) => void;
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) => method === "runs.get" ? new Promise((done, fail) => { resolve = done; reject = fail; }) : fallback(method, params));
  await act(async () => control("reload-conversation-request").click());
  control("select-conversation-queue").focus(); bridge.windowId = "foreign-window";
  await expect(executeCommand("select-conversation-queue")).rejects.toThrow("current conversation");
  bridge.windowId = originalBridge.windowId;
  await act(async () => { if (outcome === "ack") resolve({ run, suspension: originalRequest, steps: [] }); else reject(new Error("Original retired request error")); });
  expect(control("select-conversation-answer")).toBeNull();
  expect(host.textContent).toContain("Checking the durable request");
  expect(host.textContent).not.toContain("Original retired request error");
  request = originalRequest; vi.mocked(bridge.invoke).mockImplementation(fallback);
  await act(async () => root.render(<Conversation key="new-original-owner" chatId="draft-chat" embedded />));
  expect(control("select-conversation-answer")).not.toBeNull();
  await act(async () => control("select-conversation-queue").click());
  expect(input().value).toBe("Original follow-up"); expect(useStore.getState().toasts).toEqual([]);
});

it("renews genuine request hydration across committed connection ABA and refuses old replies", async () => {
  const pending: { resolve(value: unknown): void; reject(reason: Error): void }[] = [];
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) => method === "runs.get" ? new Promise((resolve, reject) => pending.push({ resolve, reject })) : fallback(method, params));
  await render(); const mountedRequests = pending.length;
  expect(mountedRequests).toBeGreaterThan(0);
  await act(async () => useStore.setState({ connected: false }));
  expect(pending).toHaveLength(mountedRequests + 1);
  expect(control("select-conversation-queue")).not.toBeNull();
  await act(async () => control("select-conversation-queue").click());
  expect(control("select-conversation-queue").getAttribute("aria-pressed")).toBe("true");
  await act(async () => useStore.setState({ connected: true }));
  expect(pending).toHaveLength(mountedRequests + 2);
  const newest = pending.at(-1)!;
  await act(async () => newest.resolve({ run, suspension: request, steps: [] }));
  expect(control("select-conversation-answer")).not.toBeNull();
  await act(async () => control("select-conversation-answer").click());
  expect(input().value).toBe("Original answer");
  await act(async () => {
    for (const original of pending.slice(0, mountedRequests)) original.resolve({ run, suspension: null, steps: [] });
    pending[mountedRequests]!.reject(new Error("Original disconnected request failure"));
  });
  expect(control("select-conversation-answer")).not.toBeNull();
  expect(input().value).toBe("Original answer");
  expect(host.textContent).not.toContain("Current request unavailable");
  expect(host.textContent).not.toContain("Original disconnected request failure");
  expect(useStore.getState().toasts).toEqual([]);
});
