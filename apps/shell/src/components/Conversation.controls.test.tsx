import { normalizePages, orderedPages } from "../store/pages";
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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
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
    agentDraft: "Keep this page-free question",
    railOpen: false,
    runs: [],
    pendingTurns: [],
    pages: normalizePages([]),
    connected: true,
    conversationId: null,
    toasts: [],
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
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
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});

function Details({
  id,
  text = "Original diagnostic",
  capture,
}: {
  id: string;
  text?: string;
  capture?(current: () => boolean): void;
}) {
  const current = useConversationOwner(id, true);
  capture?.(current);
  return <ConversationDetails current={current} text={text} />;
}
it.each([null, "unsaved-uuid"])(
  "shows the unsaved %s draft project from the active Space and follows Space changes",
  async (chatId) => {
    const layout = initial.layout;
    useStore.setState({
      layout: {
        ...layout,
        activeSpaceId: "personal",
        spaces: [
          { id: "personal", name: "Personal", color: "blue", grain: 0, workspaceId: "workspace-personal" },
          { id: "research", name: "Research", color: "teal", grain: 0, workspaceId: "workspace-research" },
        ],
      },
    });
    const original = vi.mocked(bridge.invoke).getMockImplementation()!;
    vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
      if (method === "conversations.get") return null;
      if (method === "packages.list") return { packages: [], defaults: ["aux-core"] };
      if (method === "workspaces.folders.list") {
        const workspaceId = (params as { workspaceId: string }).workspaceId;
        return [{ folderId: workspaceId, path: `/tmp/${workspaceId}`, access: "readWrite" }];
      }
      return original(method, params);
    });
    await act(async () => root.render(<Conversation chatId={chatId} embedded />));
    const openProject = () =>
      act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Composer project"]')!.click());
    await openProject();
    const project = () =>
      document.querySelector<HTMLElement>('[role="dialog"][aria-label="Composer project"]');
    expect(project()!.textContent).toContain("workspace-personal");
    await act(async () => {
      useStore.setState((state) => ({ layout: { ...state.layout, activeSpaceId: "research" } }));
    });
    expect(project()).toBeNull();
    await openProject();
    expect(project()!.textContent).toContain("workspace-research");
    expect(project()!.textContent).not.toContain("workspace-personal");
    expect(bridge.invoke).toHaveBeenCalledWith("workspaces.folders.list", {
      workspaceId: "workspace-research",
    });
  },
);
it.each(["saved", "failed"])("does not borrow the active Space for %s chat context", async (kind) => {
  useStore.setState({
    layout: {
      ...initial.layout,
      activeSpaceId: "personal",
      spaces: [
        { id: "personal", name: "Personal", color: "blue", grain: 0, workspaceId: "workspace-personal" },
      ],
    },
  });
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "conversations.get" && kind === "failed") throw new Error("Unavailable");
    return original(method, params);
  });
  await act(async () => root.render(<Conversation chatId="saved-a" embedded />));
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Composer project"]')!.disabled).toBe(true);
});
it("dispatches the original native disclosure once and supports its focused remapped action", async () => {
  await act(async () => root.render(<Details id="a" />));
  const summary = host.querySelector("summary")!;
  const details = host.querySelector("details")!;
  await act(async () => summary.click());
  expect(details.open).toBe(true);
  summary.focus();
  await act(async () => {
    await executeCommand("toggle-conversation-error-details");
  });
  expect(details.open).toBe(false);
  expect(host.querySelector("p")?.textContent).toBe("Original diagnostic");
});
it("refuses a changed native window before disclosure and keeps foreign focus out", async () => {
  await act(async () => root.render(<Details id="a" />));
  const summary = host.querySelector("summary")!;
  summary.focus();
  const original = bridge.windowId;
  bridge.windowId = "foreign";
  await expect(executeCommand("toggle-conversation-error-details")).rejects.toThrow("current conversation");
  expect(host.querySelector("details")!.open).toBe(false);
  bridge.windowId = original;
  const foreign = document.createElement("button");
  document.body.append(foreign);
  foreign.focus();
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
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
});
it("retires a held history error across committed chat A to B to A", async () => {
  let reject!: (reason: Error) => void;
  let attempts = 0;
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "runs.list" && ++attempts === 1)
      return new Promise((_done, fail) => {
        reject = fail;
      });
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
    if (method === "conversations.images.get" && ++attempts === 1)
      throw new Error("Original context failure");
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
  const rows = Array.from({ length: 50 }, (_, n) =>
    makeRun({ runId: `run-${n}`, status: "completed", createdAt: n + 1 }),
  );
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "runs.list") {
      if (++attempts === 1) return rows;
      return new Promise((done) => {
        complete = done;
      });
    }
    return original(method, params);
  });
  await act(async () => root.render(<Conversation chatId="a" />));
  const earlier = host.querySelector<HTMLButtonElement>('[data-command-id="load-conversation-history"]')!;
  expect(earlier.textContent).toBe("Load earlier messages");
  await act(async () => {
    earlier.click();
    earlier.click();
  });
  expect(attempts).toBe(2);
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.list")[1]?.[1]).toEqual({
    chatId: "a",
    limit: 50,
    before: { createdAt: 50, runId: "run-49" },
  });
  await act(async () => complete([]));
  expect(host.querySelector('[data-command-id="load-conversation-history"]')).toBeNull();
});
it("does not deliver a held old context failure after a committed chat roundtrip", async () => {
  let reject!: (reason: Error) => void;
  let attempts = 0;
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, params) => {
    if (method === "conversations.images.get" && ++attempts === 1)
      return new Promise((_done, fail) => {
        reject = fail;
      });
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
  for (const id of [
    "load-conversation-history",
    "reload-conversation-context",
    "toggle-conversation-error-details",
  ]) {
    const command = COMMANDS.find((command) => command.id === id)!;
    expect(command).toMatchObject({
      handler: "shell",
      dispatch: "scoped",
      windows: ["normal", "private"],
      palette: false,
      intercept: true,
      bindings: [],
    });
  }
});

it("permanently retires the original focused disclosure after an observed window mismatch without a render", async () => {
  await act(async () => root.render(<Details id="a" />));
  const summary = host.querySelector("summary")!;
  summary.focus();
  const original = bridge.windowId;
  try {
    bridge.windowId = "foreign";
    await expect(executeCommand("toggle-conversation-error-details")).rejects.toThrow("current conversation");
    bridge.windowId = original;
    await expect(executeCommand("toggle-conversation-error-details")).rejects.toThrow("current conversation");
    expect(host.querySelector("details")!.open).toBe(false);
    expect(host.querySelector("p")?.textContent).toBe("Original diagnostic");
  } finally {
    bridge.windowId = original;
  }
});

for (const heldMethod of ["runs.list", "conversations.images.get"] as const) {
  it(`does not deliver a held ${heldMethod} failure after the original owner observed a foreign window`, async () => {
    let reject!: (reason: Error) => void;
    const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
    vi.mocked(bridge.invoke).mockImplementation((method, params) => {
      if (method === heldMethod)
        return new Promise((_done, fail) => {
          reject = fail;
        });
      if (method === (heldMethod === "runs.list" ? "conversations.images.get" : "runs.list"))
        return Promise.reject(new Error("Other original diagnostic"));
      return fallback(method, params);
    });
    useStore.setState({ conversationDrafts: { "chat:a": "Original retained question" } });
    await act(async () => root.render(<Conversation chatId="a" />));
    const summary = host.querySelector("summary")!;
    expect(summary).toBeTruthy();
    summary.focus();
    const original = bridge.windowId;
    try {
      bridge.windowId = "foreign";
      await expect(executeCommand("toggle-conversation-error-details")).rejects.toThrow(
        "current conversation",
      );
      bridge.windowId = original;
      await act(async () => reject(new Error("Retired original async diagnostic")));
      expect(host.textContent).not.toContain("Retired original async diagnostic");
      expect(host.textContent).toContain("Other original diagnostic");
      expect(host.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe("Original retained question");
      expect(orderedPages(useStore.getState().pages)).toEqual([]);
      expect(useStore.getState().toasts).toEqual([]);
    } finally {
      bridge.windowId = original;
    }
  });
}

it("a stale captured callback refuses without retiring the newer committed conversation owner", async () => {
  let captured!: () => boolean;
  await act(async () =>
    root.render(
      <Details
        id="a"
        capture={(current) => {
          captured = current;
        }}
      />,
    ),
  );
  const original = captured;
  await act(async () =>
    root.render(
      <Details
        id="b"
        capture={(current) => {
          captured = current;
        }}
      />,
    ),
  );
  expect(original()).toBe(false);
  expect(captured()).toBe(true);
  const summary = host.querySelector("summary")!;
  summary.focus();
  await act(async () => {
    await executeCommand("toggle-conversation-error-details");
  });
  expect(host.querySelector("details")!.open).toBe(true);
});

it("opens the original Home conversation through the scoped action while closing its context menu and retaining its draft", async () => {
  useStore.setState({ conversationDrafts: { "chat:a": "Original Home reply" }, conversationId: null });
  await act(async () => root.render(<Conversation chatId="a" home embedded />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!.click());
  const control = document.querySelector<HTMLButtonElement>('[data-command-id="open-home-conversation"]')!;
  expect(control.textContent).toContain("Open full conversation");
  control.focus();
  await act(async () => {
    await executeCommand("open-home-conversation");
  });
  expect(document.querySelector('dialog[aria-label="Add context"]')).toBeNull();
  expect(useStore.getState().conversationId).toBe("a");
  expect(useStore.getState().mode).toBe("conversation");
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Original Home reply");
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.start")).toEqual([]);
});
