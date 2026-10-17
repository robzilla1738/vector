import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { readFileSync } from "node:fs";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { HOME_DRAFT_CHAT_KEY, PENDING_CHAT_KEY } from "../conversation-drafts";
import { draftWriter } from "../store/persistence";
import { Conversation } from "./Conversation";
import HomeAsk from "./HomeAsk";
import { QuickAsk } from "./QuickAsk";
import { captureFirstFrame, listenFirstFrame, takeFirstFrame } from "../first-frame";
import { makePage, makeRun } from "../mock/fixtures";
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
let transcriptStyle: HTMLStyleElement | undefined;
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
beforeEach(() => {
  draftWriter.flush();
  localStorage.clear();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({
    connected: true,
    settings: { modelConfigured: true },
    pages: normalizePages([]),
    runs: [],
    pendingTurns: [],
    conversationId: "original",
    toasts: [],
    conversationDrafts: { "chat:original": "Original question", "chat:other": "Other question" },
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Original chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  transcriptStyle?.remove();
  transcriptStyle = undefined;
  captureFirstFrame();
  takeFirstFrame();
  draftWriter.flush();
  localStorage.clear();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
it.each(["same", "new-draft", "other-chat"])(
  "actual owning store delivers original start failure to composer (%s)",
  async (scenario) => {
    const realStart = useStore.getState().startRun;
    let reject!: (reason: Error) => void;
    const originalError = new Error(
      "The original selected browser tab changed. Review its context before sending.",
    );
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    invoke.mockImplementation((method, params) =>
      method === "runs.start"
        ? new Promise((_resolve, fail) => {
            reject = fail;
          })
        : fallback(method, params),
    );
    await act(async () => root.render(<Conversation chatId="original" />));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
    expect(useStore.getState().startRun).toBe(realStart);
    expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toHaveLength(1);
    expect(useStore.getState().pendingTurns).toMatchObject([
      { goal: "Original question", chatId: "original" },
    ]);
    expect(useStore.getState().conversationDrafts["chat:original"] ?? "").toBe("");
    if (scenario === "new-draft")
      await act(async () => useStore.getState().setConversationDraft("original", "New question"));
    if (scenario === "other-chat") await act(async () => root.render(<Conversation chatId="other" />));
    await act(async () => reject(originalError));
    const stayed = scenario !== "other-chat",
      alert = host.querySelector('[role="alert"]'),
      details = alert?.parentElement?.querySelector("details");
    expect(alert?.textContent ?? null).toBe(
      stayed ? "Your message couldn’t be sent. Try sending it again. Your reply is kept." : null,
    );
    expect(details?.textContent ?? null).toBe(stayed ? `Details${originalError.message}` : null);
    expect(details?.open ?? null).toBe(stayed ? false : null);
    expect(useStore.getState().pendingTurns).toEqual([]);
    expect(useStore.getState().runs).toEqual([]);
    expect(orderedPages(useStore.getState().pages)).toEqual([]);
    expect(useStore.getState().toasts).toEqual([]);
    expect(useStore.getState().conversationDrafts["chat:original"]).toBe(
      scenario === "new-draft" ? "New question" : "Original question",
    );
    expect(useStore.getState().conversationDrafts["chat:other"]).toBe("Other question");
    expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe(
      scenario === "other-chat"
        ? "Other question"
        : scenario === "new-draft"
          ? "New question"
          : "Original question",
    );
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.disabled).toBe(false);
  },
);
it("ordinary store caller retains null, toast and its owned draft recovery", async () => {
  vi.mocked(bridge.invoke).mockRejectedValue(new Error("original runtime refusal"));
  const result = await useStore
    .getState()
    .startRun("Ordinary question", { chatId: "original", pageId: null, scope: "new" });
  expect(result).toBeNull();
  expect(useStore.getState().pendingTurns).toEqual([]);
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe("Ordinary question");
});

it.each([false, true])(
  "keeps a first chat's identity and send error after assigning its chat (temporary=%s)",
  async (temporary) => {
    useStore.setState({ conversationId: null, agentDraft: "First question", conversationDrafts: {} });
    useStore.getState().setComposerPreferences("new", { privateTask: temporary });
    const writes = vi.spyOn(Storage.prototype, "setItem");
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    invoke.mockImplementation(async (method, params) => {
      if (method === "conversations.get") return null;
      if (method === "runs.start") throw new Error("Model unavailable");
      if (method === "runs.reconcileStart") return { status: "not_started", run: null };
      return fallback(method, params);
    });
    await act(async () => root.render(<Conversation />));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
    const assigned = useStore.getState().conversationId;
    expect(assigned).toBeTruthy();
    expect(useStore.getState().conversationDrafts[`chat:${assigned}`]).toBe("First question");
    draftWriter.flush();
    expect(writes.mock.calls.flat().join(" ").includes("First question")).toBe(!temporary);
    expect(localStorage.getItem(PENDING_CHAT_KEY)).toBe(temporary ? null : assigned);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Your message couldn’t be sent");
    expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toHaveLength(1);
  },
);

function earlyAsk() {
  const skeleton = document.createElement("div");
  skeleton.innerHTML = '<input id="first-frame-entry"><input id="first-frame-ask" type="radio" checked>';
  document.body.append(skeleton);
  const input = skeleton.querySelector("input")!;
  input.focus();
  input.value = "Original startup question";
  listenFirstFrame();
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  input.value = "Newer unsent question";
  const entry = captureFirstFrame()!;
  skeleton.remove();
  return entry;
}
it.each([true, false])(
  "hands original early Ask to normal Send once, retaining newer text (connected=%s)",
  async (connected) => {
    const entry = earlyAsk();
    useStore.setState({
      connected,
      conversationId: null,
      agentDraft: entry.text,
      conversationDrafts: {},
      railOpen: false,
    });
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    let acceptedRun: ReturnType<typeof makeRun>;
    invoke.mockImplementation(async (method, params) => {
      if (method === "conversations.get") return null;
      if (method === "runs.get") return { run: acceptedRun, steps: [] };
      if (method === "runs.start") {
        const request = params as { goal: string; chatId: string };
        return (acceptedRun = makeRun({
          runId: "startup-run",
          goal: request.goal,
          config: { chatId: request.chatId },
          pageIds: [],
        }));
      }
      return fallback(method, params);
    });
    await act(async () => root.render(<HomeAsk firstFrame={entry} onSearch={() => {}} />));
    const starts = invoke.mock.calls.filter(([method]) => method === "runs.start");
    expect(
      starts.map(([, value]) => {
        const request = value as { goal: string; pageIds: string[] };
        return { goal: request.goal, pageIds: request.pageIds };
      }),
    ).toEqual(connected ? [{ goal: "Original startup question", pageIds: [] }] : []);
    const sentChat = (starts[0]?.[1] as { chatId: string } | undefined)?.chatId;
    const originalChat = sentChat ?? localStorage.getItem(PENDING_CHAT_KEY)!;
    expect(useStore.getState().conversationDrafts[`chat:${originalChat}`]).toBe(
      connected ? "Newer unsent question" : "Original startup question",
    );
    expect(
      connected ? useStore.getState().conversationDrafts[`chat:${sentChat}`] : useStore.getState().agentDraft,
    ).toBe("Newer unsent question");
    expect(useStore.getState().toasts.at(-1)?.action?.label).toBe(
      connected ? undefined : "Open original prompt",
    );
    await act(async () => {
      useStore.setState({ connected: true });
      root.render(<HomeAsk firstFrame={entry} onSearch={() => {}} />);
    });
    expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toHaveLength(connected ? 1 : 0);
  },
);
it("keeps text typed while normal Send awaits source recovery", async () => {
  const page = makePage(0, { pageId: "source", windowId: bridge.windowId, url: "https://example.test/" });
  useStore.setState({ pages: normalizePages([page]), activePageId: "source" });
  useStore.getState().setConversationContext("original", "source");
  let release!: (value: []) => void;
  const invoke = vi.mocked(bridge.invoke),
    fallback = invoke.getMockImplementation()!;
  const acceptedRun = makeRun({
    runId: "ordinary-run",
    goal: "Original question",
    config: { chatId: "original" },
    pageIds: ["source"],
  });
  invoke.mockImplementation(async (method, params) => {
    if (method === "runs.get") return { run: acceptedRun, steps: [] };
    if (method === "browser.recovery.list")
      return new Promise((done) => {
        release = done;
      });
    if (method === "runs.start") return acceptedRun;
    return fallback(method, params);
  });
  await act(async () => root.render(<Conversation chatId="original" />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
  expect(release).toBeTypeOf("function");
  await act(async () => useStore.getState().setConversationDraft("original", "Typed while source refreshed"));
  await act(async () => release([]));
  expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toHaveLength(1);
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe("Typed while source refreshed");
});

async function renderCompact(surface: "Quick Ask" | "Home") {
  useStore.setState({ railOpen: false, agentDraft: "" });
  localStorage.setItem(HOME_DRAFT_CHAT_KEY, "original");
  transcriptStyle = document.createElement("style");
  // Apply the shipped transcript visibility rules without CSS layers, which jsdom does not parse.
  transcriptStyle.textContent = ["./QuickAsk.css", "./HomeAsk.css"]
    .flatMap((file) =>
      [
        ...readFileSync(new URL(file, import.meta.url), "utf8").matchAll(
          /\.(?:quick-ask|home-ask)\s[^{}]*\{[^{}]*\}/g,
        ),
      ]
        .map(([rule]) => rule)
        .filter((rule) => rule.includes(".conversation-scroll")),
    )
    .join("\n");
  document.head.append(transcriptStyle);
  await act(async () =>
    root.render(surface === "Quick Ask" ? <QuickAsk onExpand={vi.fn()} /> : <HomeAsk onSearch={vi.fn()} />),
  );
}

it("compact Quick Ask expands with its original draft and keeps the ordinary context trigger", async () => {
  const expand = vi.fn();
  await act(async () => root.render(<QuickAsk onExpand={expand} />));
  const input = host.querySelector<HTMLTextAreaElement>("textarea")!;
  expect(input.value).toBe("Original question");
  expect(host.querySelector("[data-quick-ask-compact]")).not.toBeNull();
  expect(host.querySelector('[aria-label="Add context"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Thinking level"]')).toBeNull();
  await act(async () => host.querySelector<HTMLButtonElement>(".quick-ask-expand")!.click());
  expect(expand).toHaveBeenCalledTimes(1);
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe("Original question");
});

it.each(["Quick Ask", "Home"] as const)(
  "%s reveals a first pending turn and returns to the blank layout only after it settles",
  async (surface) => {
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    let reject!: (reason: Error) => void;
    invoke.mockImplementation((method, params) =>
      method === "runs.start"
        ? new Promise((_resolve, fail) => {
            reject = fail;
          })
        : fallback(method, params),
    );
    await renderCompact(surface);
    const scroll = host.querySelector<HTMLElement>(".conversation-scroll")!;
    expect(getComputedStyle(scroll).display).toBe("none");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
    expect(useStore.getState().pendingTurns).toMatchObject([
      { chatId: "original", goal: "Original question" },
    ]);
    expect(scroll.querySelector(".conversation-turn.pending")?.textContent).toContain("Original question");
    expect(scroll.textContent).toContain("Starting…");
    expect(getComputedStyle(scroll).display).not.toBe("none");
    expect(scroll.querySelector(".conversation-empty")).toBeNull();
    await act(async () => reject(new Error("Start was refused")));
    expect(scroll.querySelector(".conversation-turn.pending")).toBeNull();
    expect(getComputedStyle(scroll).display).toBe("none");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Your reply is kept");
    expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("Original question");
  },
);

it.each([
  ["Quick Ask", true],
  ["Quick Ask", false],
  ["Home", true],
  ["Home", false],
] as const)("%s keeps branch instructions visible (source available=%s)", async (surface, available) => {
  const invoke = vi.mocked(bridge.invoke),
    fallback = invoke.getMockImplementation()!;
  invoke.mockImplementation(async (method, params) =>
    method === "conversations.get"
      ? {
          kind: "branch-draft",
          chatId: "original",
          sourceRunId: "source",
          privateTask: false,
          draftText: "Original question",
          contextPageRefs: [],
          title: "Edited first turn",
          archived: false,
          mode: "edit",
          available,
        }
      : fallback(method, params),
  );
  await renderCompact(surface);
  const scroll = host.querySelector<HTMLElement>(".conversation-scroll")!;
  expect(scroll.textContent).toContain("Edit the message, then send.");
  expect(scroll.textContent?.includes("The original source is unavailable; this draft cannot be sent.")).toBe(
    !available,
  );
  expect(getComputedStyle(scroll).display).not.toBe("none");
  expect(scroll.querySelector(".conversation-empty")).toBeNull();
  expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toEqual([]);
});

it.each(["Quick Ask", "Home"] as const)(
  "%s keeps changed-task message errors and their Retry visible before the first turn",
  async (surface) => {
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    let failed = true;
    invoke.mockImplementation((method, params) =>
      method === "runs.messages.list" && failed
        ? Promise.reject(new Error("Messages unavailable"))
        : fallback(method, params),
    );
    await renderCompact(surface);
    const scroll = host.querySelector<HTMLElement>(".conversation-scroll")!;
    expect(scroll.querySelector('[role="alert"]')?.textContent).toContain(
      "Changed-task messages could not be loaded",
    );
    expect(getComputedStyle(scroll).display).not.toBe("none");
    failed = false;
    await act(async () => scroll.querySelector<HTMLButtonElement>('[role="alert"] button')!.click());
    expect(scroll.querySelector('[role="alert"]')).toBeNull();
    expect(getComputedStyle(scroll).display).toBe("none");
    expect(invoke.mock.calls.filter(([method]) => method === "runs.messages.list")).toHaveLength(2);
  },
);
