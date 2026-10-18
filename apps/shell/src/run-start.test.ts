// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { makeRun } from "./mock/fixtures";
import { createSpace, emptyLayout } from "./workspace";
const initial = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(initial, true);
});
it("starts a page-free chat without opening a tab or displacing newer navigation or drafts", async () => {
  let finish!: (value: unknown) => void;
  const run = makeRun({ runId: "background", config: { chatId: "chat" } });
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const open = vi.fn().mockResolvedValue({ pageId: "task-page" });
  const reveal = vi.fn();
  useStore.setState({
    openBackgroundTab: open,
    openConversation: reveal,
    mode: "conversation",
    conversationId: null,
    overlay: null,
    agentDraft: "Research this",
    settings: { ...initial.settings, modelConfigured: true },
  });
  const pending = useStore.getState().startRun("Research this", {
    scope: "new",
    presentation: "conversation",
    privateTask: true,
    modelId: "fixture/exact",
    reasoning: "high",
  });
  await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
  expect(open).not.toHaveBeenCalled();
  expect(bridge.invoke).toHaveBeenCalledWith(
    "runs.start",
    expect.objectContaining({ pageIds: [], privateTask: true, modelId: "fixture/exact", reasoning: "high" }),
  );
  useStore.setState({ overlay: "settings", agentDraft: "A newer draft" });
  finish(run);
  await pending;
  expect(reveal).not.toHaveBeenCalled();
  expect(useStore.getState().overlay).toBe("settings");
  expect(useStore.getState().agentDraft).toBe("A newer draft");
  expect(useStore.getState().runs).toContain(run);
});
it("opens the requested conversation when the originating view is unchanged", async () => {
  const run = makeRun({ runId: "foreground" });
  vi.spyOn(bridge, "invoke").mockResolvedValue(run);
  const reveal = vi.fn();
  useStore.setState({ openConversation: reveal, settings: { ...initial.settings, modelConfigured: true } });
  await useStore.getState().startRun("Question", { pageId: "page", presentation: "conversation" });
  expect(reveal).toHaveBeenCalledWith(run.runId);
  expect(bridge.invoke).toHaveBeenCalledWith("runs.start", expect.objectContaining({ privateTask: false }));
  const payload = vi.mocked(bridge.invoke).mock.calls[0]?.[1];
  expect(payload).not.toHaveProperty("modelId");
  expect(payload).not.toHaveProperty("reasoning");
});

it("recovers the original accepted chat on reconnect while keeping an edited draft unsent", async () => {
  const chatId = crypto.randomUUID(),
    accepted = makeRun({ runId: "lost-ack", config: { chatId } });
  const invoke = vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Connection lost"));
  const reveal = vi.fn();
  useStore.setState({
    settings: { modelConfigured: true },
    conversationId: chatId,
    openConversation: reveal,
    conversationDrafts: {},
  });
  await expect(
    useStore.getState().startRun("Original question", { chatId, scope: "new", ownsDraft: true }),
  ).rejects.toThrow("Connection lost");
  const original = invoke.mock.calls[0]![1];
  useStore.getState().setConversationDraft(chatId, "Edited while disconnected");
  invoke.mockReset().mockResolvedValue({ status: "accepted", run: accepted });
  await useStore.getState().recoverRunStart(chatId);
  expect(invoke).toHaveBeenCalledExactlyOnceWith("runs.reconcileStart", original);
  expect(useStore.getState().conversationDrafts[`chat:${chatId}`]).toBe("Edited while disconnected");
  expect(reveal).toHaveBeenCalledExactlyOnceWith(accepted.runId);
  expect(useStore.getState().runs).toContain(accepted);
});

it("keeps a temporary caller's failed send draft in memory even outside the composer", async () => {
  const chatId = crypto.randomUUID();
  const writes = vi.spyOn(Storage.prototype, "setItem");
  vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Runtime unavailable"));
  useStore.setState({
    settings: { modelConfigured: true },
    agentDraft: "",
    conversationDrafts: {},
    composerPreferences: {},
  });
  await useStore
    .getState()
    .startRun("Temporary request sentinel", { chatId, privateTask: true, scope: "new" });
  expect(useStore.getState().agentDraft).toBe("Temporary request sentinel");
  expect(writes.mock.calls.flat().join(" ")).not.toContain("Temporary request sentinel");
});

it("conversation deletion scrubs a pending request and a late reply cannot reopen the deleted chat", async () => {
  const chatId = crypto.randomUUID(),
    removed = makeRun({ runId: "removed-run", config: { chatId } });
  let finish!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  useStore.setState({ settings: { modelConfigured: true }, conversationId: chatId, conversationDrafts: {} });
  const pending = useStore
    .getState()
    .startRun("Deleted message sentinel", { chatId, scope: "new", ownsDraft: true });
  await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
  useStore.getState().applyEvent({
    type: "conversation.deleted",
    payload: { chatId },
    seq: 1,
    streamId: "delete-test",
    ts: 1,
  });
  expect(localStorage.getItem(`aux.pending-run-start.v1:${chatId}`)).toBe('{"removed":true}');
  finish(removed);
  await expect(pending).rejects.toThrow(/removed/);
  expect(useStore.getState().runs.some((run) => run.runId === removed.runId)).toBe(false);
  expect(useStore.getState().conversationDrafts[`chat:${chatId}`]).toBeUndefined();
  expect(invoke).toHaveBeenCalledOnce();
});

it("sends from a fresh native Space without borrowing the previous workspace while mapping is pending", async () => {
  const chatId = crypto.randomUUID();
  const run = makeRun({ runId: "unmapped-space-send", config: { chatId } });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(run);
  const previous = emptyLayout();
  previous.spaces[0] = { ...previous.spaces[0]!, workspaceId: "previous-workspace" };
  const layout = createSpace(previous, "Fresh native Space");
  expect(layout.spaces.find((space) => space.id === layout.activeSpaceId)?.workspaceId).toBeUndefined();
  useStore.setState({
    layout,
    conversationId: null,
    settings: { modelConfigured: true },
    composerPreferences: {},
    runs: [makeRun({ config: { chatId: "old-chat", contextWorkspaceId: "previous-workspace" } })],
  });
  await expect(
    useStore.getState().startRun("A new question", { chatId, scope: "new", reveal: false }),
  ).resolves.toBe(run);
  expect(invoke).toHaveBeenCalledOnce();
  const [method, request] = invoke.mock.calls[0]!;
  expect(method).toBe("runs.start");
  expect((request as { defaultWorkspaceId?: string }).defaultWorkspaceId).toBeUndefined();
  expect(request).toMatchObject({ goal: "A new question", chatId, pageIds: [] });
});

it("recovery cannot reclaim navigation taken while its schema validator is loading", async () => {
  const chatId = crypto.randomUUID(),
    accepted = makeRun({ runId: "recovered-background", config: { chatId } });
  const invoke = vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Lost acknowledgement"));
  const reveal = vi.fn();
  useStore.setState({
    settings: { modelConfigured: true },
    mode: "conversation",
    conversationId: chatId,
    openConversation: reveal,
    conversationDrafts: {},
  });
  await expect(
    useStore.getState().startRun("Original", { chatId, scope: "new", ownsDraft: true }),
  ).rejects.toThrow("Lost acknowledgement");
  invoke.mockReset().mockResolvedValue({ status: "accepted", run: accepted });
  const recovering = useStore.getState().recoverRunStart(chatId);
  useStore.setState({ mode: "focus", conversationId: null, activePageId: "newly-selected-page" });
  await recovering;
  expect(reveal).not.toHaveBeenCalled();
  expect(useStore.getState().activePageId).toBe("newly-selected-page");
  expect(useStore.getState().runs).toContain(accepted);
});
