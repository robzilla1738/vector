// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
import { normalizePages } from "../store/pages";
import { Conversation } from "./Conversation";

it("keeps a 300-turn chat responsive while its composer changes", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  let intersections!: IntersectionObserverCallback;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersections = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("CSS", { highlights: new Map() });
  vi.stubGlobal(
    "Highlight",
    class {
      constructor(..._ranges: Range[]) {}
    },
  );
  const bounds = {
    top: 0,
    bottom: 600,
    height: 600,
    width: 700,
    left: 0,
    right: 700,
    x: 0,
    y: 0,
    toJSON() {},
  };
  const rangeBounds = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => bounds,
  });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  const initial = useStore.getState();
  const runs = Array.from({ length: 300 }, (_, index) =>
    makeRun({
      runId: `run-${String(index).padStart(3, "0")}`,
      goal: `Question ${index}`,
      createdAt: index,
      status: "completed",
      statusMessage: undefined,
      pageIds: [],
      result: {
        answer:
          `## Answer ${index}\n\n` +
          "This is a saved answer with **details**, sources, and a useful explanation. ".repeat(20),
      },
      config: { chatId: "workload" },
    }),
  );
  let finishOldSearch: ((value: unknown) => void) | undefined;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, input) => {
    if (method === "runs.list") return runs.slice(-50).reverse();
    if (method === "runs.get")
      return { run: runs.find((run) => run.runId === (input as { runId: string }).runId), steps: [] };
    if (method === "runs.messages.list" || method === "artifacts.list") return [];
    if (method === "conversations.get") return { title: "Workload chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    if (method === "conversations.search" && (input as { query: string }).query === "old query")
      return new Promise((resolve) => {
        finishOldSearch = resolve;
      });
    if (method === "conversations.search")
      return {
        match: { runId: "run-005", part: "reply", offset: 16, occurrence: 0, excerpt: "saved answer" },
        matches: 1,
        activeMatch: 1,
      };
    if (method === "conversations.turns")
      return { runs: runs.slice(0, 30), earlierRunId: null, laterRunId: "run-030" };
    return { workspace: null, memory: null };
  });
  useStore.setState({
    connected: true,
    settings: { modelConfigured: true },
    pages: normalizePages([]),
    runs,
    mode: "conversation",
    overlay: "find",
    pendingTurns: [],
    conversationId: "workload",
    toasts: [],
    steps: {},
    modelStats: {},
    conversationDrafts: { "chat:workload": "Unsent thought" },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Conversation chatId="workload" />));
    const panels = host.querySelectorAll('[data-testid="run-panel"]').length;
    const reads = invoke.mock.calls.filter(
      ([method]) => method === "runs.get" || method === "artifacts.list",
    ).length;
    const textarea = host.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.focus();
    const before = host.querySelector('[data-turn-id="run-000"]');
    await act(async () =>
      useStore.getState().setConversationDraft("workload", "Still writing without losing my place"),
    );
    expect(panels).toBeLessThanOrEqual(12);
    expect(reads).toBeLessThan(40);
    expect(textarea.value).toBe("Still writing without losing my place");
    expect(document.activeElement).toBe(textarea);
    expect(host.querySelector('[data-turn-id="run-000"]')).toBe(before);
    const old = host.querySelector<HTMLElement>('[data-turn-id="run-000"]')!;
    const enter = (isIntersecting: boolean) =>
      intersections(
        [
          {
            target: old,
            isIntersecting,
            boundingClientRect: bounds,
            intersectionRatio: isIntersecting ? 1 : 0,
            intersectionRect: bounds,
            rootBounds: bounds,
            time: 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    await act(async () => enter(true));
    const copy = old.querySelector<HTMLButtonElement>('[aria-label="Copy answer"]')!;
    copy.focus();
    await act(async () => enter(false));
    expect(old.querySelector('[data-testid="run-panel"]')).not.toBeNull();
    expect(document.activeElement).toBe(copy);
    textarea.focus();
    expect(document.activeElement).toBe(textarea);
    await act(async () => enter(false));
    expect(old.querySelector('[data-testid="run-panel"]')).toBeNull();
    expect(old.style.height).toBe("600px");
    // Search a turn outside the currently loaded latest history page.
    await act(async () => useStore.setState({ runs: runs.slice(-50) }));
    let finding!: Promise<void>;
    await act(async () => {
      finding = useStore.getState().find("saved answer");
      await Promise.resolve();
    });
    await finding;
    expect(invoke).toHaveBeenCalledWith("conversations.turns", { chatId: "workload", runId: "run-005" });
    expect(host.querySelector('[data-turn-id="run-005"] [data-testid="run-panel"]')).not.toBeNull();
    expect(host.querySelectorAll("[data-turn-id]")).toHaveLength(30);
    expect(useStore.getState().findMatches).toEqual({ matches: 1, activeMatch: 1 });
    expect(document.activeElement).toBe(textarea);
    expect(textarea.value).toBe("Still writing without losing my place");
    let oldSearch!: Promise<void>;
    await act(async () => {
      oldSearch = useStore.getState().find("old query");
      await Promise.resolve();
    });
    await act(async () => {
      finding = useStore.getState().find("saved answer");
      await Promise.resolve();
    });
    await finding;
    const windowReads = invoke.mock.calls.filter(([method]) => method === "conversations.turns").length;
    await act(async () => {
      finishOldSearch!({
        match: { runId: "run-299", part: "goal", offset: 0, occurrence: 0, excerpt: "Question" },
        matches: 99,
        activeMatch: 99,
      });
      await oldSearch;
    });
    expect(useStore.getState().findMatches).toEqual({ matches: 1, activeMatch: 1 });
    expect(invoke.mock.calls.filter(([method]) => method === "conversations.turns")).toHaveLength(
      windowReads,
    );
    expect(document.activeElement).toBe(textarea);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(initial, true);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (rangeBounds) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeBounds);
    else delete (Range.prototype as Partial<Range>).getBoundingClientRect;
  }
});
