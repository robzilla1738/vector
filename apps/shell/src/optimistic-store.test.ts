// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { AuxEvent, PageTarget, TabCommandAck } from "@aux/contracts";
import { bridge } from "./bridge";
import { patchPageFields, useStore } from "./store";
import { noteEventSeq, noteStream, resetEventStream } from "./store/shared";
import { emptyLayout, syncLayout, syncOrder, withSyncedOrder } from "./workspace";
import { makeRun } from "./mock/fixtures";

const initial = useStore.getState();
afterEach(() => { vi.restoreAllMocks(); useStore.setState(initial, true); });
const page = (pageId: string): PageTarget => ({ pageId, title: pageId, url: `https://example.test/${pageId}`, ownedByRuntime: false, viewStatus: "visible", controller: "human" } as PageTarget);
const event = (type: string, payload: Record<string, unknown>, seq = Date.now()): AuxEvent => ({ type, payload, seq, streamId: "test", ts: Date.now() });
function tabs(...ids: string[]) {
  const layout = { ...emptyLayout(), order: ids, tabSpace: Object.fromEntries(ids.map(id => [id, emptyLayout().activeSpaceId])) };
  useStore.setState({ pages: ids.map(page), layout, activePageId: ids[0] ?? null, closedTabs: [] });
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
}

it("keeps layout and page identity when nothing changed", () => {
  const layout = { ...emptyLayout(), order: ["a", "b"], tabSpace: { a: emptyLayout().activeSpaceId, b: emptyLayout().activeSpaceId } };
  const pages = [page("a"), page("b")];
  expect(syncOrder(layout.order, pages)).toBe(layout.order);
  expect(withSyncedOrder(layout, pages)).toBe(layout);
  expect(syncLayout(layout, pages)).toBe(layout);
  expect(syncOrder(layout.order, [page("b"), page("c")], ["a"])).toEqual(["a", "b", "c"]);
  tabs("a");
  const before = useStore.getState().pages;
  patchPageFields("a", { title: "a" });
  expect(useStore.getState().pages).toBe(before);
  patchPageFields("a", { loading: true });
  expect(useStore.getState().pages[0]?.loading).toBe(true);
});

it("shows a new tab before main acknowledges it and removes it when the open is refused", async () => {
  tabs("a");
  let finish!: (ack: TabCommandAck) => void;
  const command = vi.spyOn(bridge, "tabCommand").mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const opening = useStore.getState().newTab("https://example.test/new");
  const sent = command.mock.calls[0]![0] as { pageId: string };
  expect(useStore.getState().activePageId).toBe(sent.pageId);
  expect(useStore.getState().layout.order).toEqual(["a", sent.pageId]);
  finish({ commandId: "", status: "rejected", catalogVersion: 0, error: { code: "unavailable", message: "No window" } } as TabCommandAck);
  expect(await opening).toBeNull();
  expect(useStore.getState().pages.map(p => p.pageId)).toEqual(["a"]);
  expect(useStore.getState().activePageId).toBe("a");
});

it("removes a closed row immediately and restores it when the close is refused", async () => {
  tabs("a", "b", "c");
  useStore.setState({ activePageId: "b" });
  let finish!: (ack: TabCommandAck) => void;
  vi.spyOn(bridge, "tabCommand").mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const closing = useStore.getState().closeTab("b");
  expect(useStore.getState().pages.map(p => p.pageId)).toEqual(["a", "c"]);
  // A late catalog upsert for the closing tab must not bring the row back.
  useStore.getState().applyEvent(event("page.added", { page: page("b") }));
  expect(useStore.getState().pages.map(p => p.pageId)).toEqual(["a", "c"]);
  finish({ commandId: "", status: "rejected", catalogVersion: 0, error: { code: "unavailable", message: "Kept by the page" } } as TabCommandAck);
  await closing;
  const state = useStore.getState();
  expect(state.layout.order).toEqual(["a", "b", "c"]);
  expect(state.activePageId).toBe("b");
  expect(state.closedTabs).toEqual([]);
});

it("shows a sent message at once and returns it to the composer if the run cannot start", async () => {
  let fail!: (error: Error) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(() => new Promise((_resolve, reject) => { fail = reject; }));
  useStore.setState({ activePageId: "p", settings: { modelConfigured: true } });
  const starting = useStore.getState().startRun("Summarize", { chatId: "chat", pageId: "p", ownsDraft: true });
  expect(useStore.getState().pendingTurns).toMatchObject([{ chatId: "chat", goal: "Summarize" }]);
  const error = new Error("offline");
  fail(error);
  await expect(starting).rejects.toBe(error);
  expect(useStore.getState().pendingTurns).toEqual([]);
  expect(useStore.getState().conversationDrafts["chat:chat"]).toBeUndefined();
});

it("streams answer text while a run is live and drops it once the run settles", () => {
  const run = makeRun({ runId: "r", status: "running" });
  useStore.setState({ runs: [run] });
  const apply = useStore.getState().applyEvent;
  apply(event("run.answer.delta", { runId: "r", delta: "Hel", seq: 1 }, 1));
  apply(event("run.answer.delta", { runId: "r", delta: "lo", seq: 2 }, 2));
  apply(event("run.answer.delta", { runId: "r", delta: "lo", seq: 2 }, 3));
  expect(useStore.getState().answerStreams.r).toBe("Hello");
  apply(event("run.answer.delta", { runId: "r", text: "Hello there", seq: 3 }, 4));
  expect(useStore.getState().answerStreams.r).toBe("Hello there");
  apply(event("run.updated", { run: { ...run, status: "completed" } }, 5));
  expect(useStore.getState().answerStreams.r).toBeUndefined();
  apply(event("run.answer.delta", { runId: "r", delta: "late", seq: 4 }, 6));
  expect(useStore.getState().answerStreams.r).toBeUndefined();
});

it("keeps error toasts until dismissed", () => {
  vi.useFakeTimers();
  try {
    useStore.getState().toast("Broken", "error");
    vi.advanceTimersByTime(10_000);
    const [toast] = useStore.getState().toasts;
    expect(toast?.text).toBe("Broken");
    useStore.getState().dismissToast(toast!.id);
    expect(useStore.getState().toasts).toEqual([]);
  } finally { vi.useRealTimers(); }
});

it("resyncs from a snapshot on a live-stream gap, stream change, or drops replayed seqs", () => {
  const refresh = vi.fn(async () => {});
  useStore.setState({ connected: true, refresh, activePageId: null });
  resetEventStream();
  noteStream("test");
  noteEventSeq(10);
  const apply = useStore.getState().applyEvent;
  // A forward hole on the unfiltered stream → snapshot resync.
  apply({ type: "page.updated", payload: { pageId: "p1", activePageId: "p1" }, seq: 12, streamId: "test", ts: Date.now() });
  expect(refresh).toHaveBeenCalledTimes(1);
  refresh.mockClear();
  // The contiguous next event still applies.
  apply({ type: "page.updated", payload: { pageId: "p1", activePageId: "p1" }, seq: 11, streamId: "test", ts: Date.now() });
  expect(refresh).not.toHaveBeenCalled();
  expect(useStore.getState().activePageId).toBe("p1");
  // A replayed seq is already applied — neither refresh nor re-apply.
  apply({ type: "page.updated", payload: { pageId: "p2", activePageId: "p2" }, seq: 11, streamId: "test", ts: Date.now() });
  expect(refresh).not.toHaveBeenCalled();
  expect(useStore.getState().activePageId).toBe("p1");
  // A different streamId means the cursor belongs to a dead stream → resync.
  apply({ type: "page.updated", payload: { pageId: "px" }, seq: 12, streamId: "new-generation", ts: Date.now() });
  expect(refresh).toHaveBeenCalledTimes(1);
});

it("keeps actual native split and window ownership through full and partial runtime updates", () => {
  tabs("a");
  const native = { ...page("a"), windowId: "native-own", windowKind: "normal" as const, anchor: false, split: { id: "native-split", index: 0 } };
  useStore.setState({ pages: [native], catalogVersion: 7 });
  useStore.getState().applyEvent(event("page.updated", { page: { ...page("a"), title: "New title", windowId: "stale-other", controller: "agent" } }));
  expect(useStore.getState().pages[0]).toMatchObject({ title: "New title", controller: "agent", windowId: "native-own", split: native.split });
  useStore.getState().applyEvent(event("page.updated", { pageId: "a", loading: true, windowId: "stale-other", split: undefined }));
  expect(useStore.getState().pages[0]).toMatchObject({ loading: true, windowId: "native-own", split: native.split });
});
it("accepts runtime placement before any native catalog is available", () => {
  tabs("a"); useStore.setState({ catalogVersion: 0 });
  useStore.getState().applyEvent(event("page.updated", { page: { ...page("a"), windowId: "runtime-window" } }));
  expect(useStore.getState().pages[0]?.windowId).toBe("runtime-window");
});
