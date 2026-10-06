// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { makeRun } from "../mock/fixtures";
import { ContentMemory } from "./ContentMemory";
const mode = vi.hoisted(() => ({ private: false }));
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      windowKind: "normal",
      get privateMode() {
        return mode.private;
      },
    },
  };
});
vi.mock("./MemoryRecoveryNotice", () => ({ MemoryRecoveryNotice: () => null }));
const initial = useStore.getState();
const memory = { workspaceId: "space", revision: 3, enabled: true, content: "" };
const item = {
  memoryId: "article",
  workspaceId: "space",
  profileId: "profile",
  pageId: "source",
  documentEpoch: 4,
  title: "Recorded article",
  url: "https://source.example/article",
  capturedAt: 1,
  snippet: "Saved text",
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  mode.private = false;
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(
    () => [{ width: 100 }] as unknown as DOMRectList,
  );
  useStore.setState({
    connected: true,
    settings: { modelConfigured: true },
    runs: [],
    pendingTurns: [],
    toasts: [],
    pages: [],
    conversationDrafts: {},
    layout: {
      ...initial.layout,
      spaces: [{ id: "native-space", workspaceId: "space", name: "Space", color: "blue", grain: 0 }],
      archivedSpaces: [],
    },
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "workspaces.contentMemory.policy")
      return { enabled: true, retentionDays: 90, allowedOrigins: ["https://source.example"] };
    if (method === "workspaces.contentMemory.search") return [item];
    if (method === "workspaces.contentMemory.get") return { ...item, text: "Historical body" };
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function input(selector: string, value: string) {
  const field = host.querySelector<HTMLInputElement>(selector)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it.each([false, true])(
  "real store preserves original held Ask rejection and draft (Private retirement %s)",
  async (retired) => {
    const realStart = useStore.getState().startRun;
    let reject!: (reason: unknown) => void;
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    invoke.mockImplementation((method, params) =>
      method === "runs.start"
        ? new Promise((_resolve, fail) => {
            reject = fail;
          })
        : fallback(method, params),
    );
    await act(async () => root.render(<ContentMemory memory={memory} />));
    await input('[aria-label="Search remembered articles"]', "article");
    await act(async () => vi.advanceTimersByTimeAsync(200));
    await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
    await input('[aria-label="Question about saved article"]', "Original question");
    const button = host.querySelector<HTMLElement>('[data-command-id="ask-content-memory"]')!;
    button.focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("ask-content-memory");
    });
    const observed = completion.then(
      (value) => ({ value }),
      (reason) => ({ reason }),
    );
    expect(useStore.getState().startRun).toBe(realStart);
    expect(useStore.getState().pendingTurns).toMatchObject([{ goal: "Original question" }]);
    expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toHaveLength(1);
    if (retired) {
      mode.private = true;
      await act(async () => root.render(<ContentMemory memory={memory} />));
    }
    const reason = new Error("Original owned start refusal");
    await act(async () => {
      reject(reason);
      const result = await observed;
      expect("reason" in result && result.reason).toBe(reason);
    });
    expect(useStore.getState().pendingTurns).toEqual([]);
    expect(useStore.getState().runs).toEqual([]);
    expect(useStore.getState().toasts).toEqual([]);
    expect(useStore.getState().conversationDrafts).toEqual({});
    expect(
      host.querySelector<HTMLInputElement>('[aria-label="Question about saved article"]')?.value ?? null,
    ).toBe(retired ? null : "Original question");
    expect(host.querySelector('[role="alert"]')).toBeNull();
  },
);

it.each(["current", "Private", "revision"])(
  "real store retains successful Ask ACK without retired presentation (%s)",
  async (scenario) => {
    let resolve!: (value: ReturnType<typeof makeRun>) => void;
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    invoke.mockImplementation((method, params) =>
      method === "runs.start"
        ? new Promise((yes) => {
            resolve = yes;
          })
        : fallback(method, params),
    );
    const open = vi.spyOn(useStore.getState(), "openConversation").mockImplementation(() => {});
    await act(async () => root.render(<ContentMemory memory={memory} />));
    await input('[aria-label="Search remembered articles"]', "article");
    await act(async () => vi.advanceTimersByTimeAsync(200));
    await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
    await input('[aria-label="Question about saved article"]', "Original question");
    host.querySelector<HTMLElement>('[data-command-id="ask-content-memory"]')!.focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("ask-content-memory");
    });
    if (scenario === "Private") {
      mode.private = true;
      await act(async () => root.render(<ContentMemory memory={memory} />));
    }
    if (scenario === "revision")
      await act(async () => root.render(<ContentMemory memory={{ ...memory, revision: 4 }} />));
    const ack = makeRun({ runId: "original-ask", status: "running" });
    await act(async () => {
      resolve(ack);
      expect(await completion).toBe(ack);
    });
    expect(useStore.getState().runs).toEqual([ack]);
    expect(useStore.getState().pendingTurns).toEqual([]);
    expect(useStore.getState().toasts).toEqual([]);
    expect(open).toHaveBeenCalledTimes(scenario === "current" ? 1 : 0);
    expect(
      host.querySelector<HTMLInputElement>('[aria-label="Question about saved article"]')?.value ?? null,
    ).toBe(scenario === "current" ? "" : null);
  },
);
