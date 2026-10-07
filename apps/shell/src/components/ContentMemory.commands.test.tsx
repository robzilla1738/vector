// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  COMMANDS,
  effectiveShortcuts,
  matchShortcut,
  type WorkspaceMemory,
  type ContentMemoryPolicy,
  type ContentMemoryMatch,
} from "@aux/contracts";
import { ContentMemory } from "./ContentMemory";
import { executeCommand, runCommand } from "../commands";
import { useStore } from "../store";
const mocks = vi.hoisted(() => ({
  call: vi.fn(),
  toast: vi.fn(),
  privateMode: false,
  listeners: new Set<(event: unknown) => void>(),
}));
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      windowKind: "normal",
      get privateMode() {
        return mocks.privateMode;
      },
      onEvent: (listener: (event: unknown) => void) => {
        mocks.listeners.add(listener);
        return () => mocks.listeners.delete(listener);
      },
    },
  };
});
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: mocks.call,
  errToast: mocks.toast,
}));
vi.mock("./MemoryRecoveryNotice", () => ({
  MemoryRecoveryNotice: () => <output>Fresh backup needed</output>,
}));
const ids = [
  "toggle-content-memory",
  "set-content-memory-retention",
  "detect-content-memory-models",
  "select-content-memory-model",
  "toggle-content-memory-sites",
  "remove-content-memory-site",
  "read-content-memory",
  "open-content-memory-source",
  "forget-content-memory",
  "ask-content-memory",
  "confirm-clear-content-memory",
  "clear-content-memory",
  "cancel-clear-content-memory",
  "close-content-memory-detail",
  "toggle-content-memory-actions",
] as const;
const memory: WorkspaceMemory = { workspaceId: "space", revision: 3, enabled: true, content: "" };
const policy: ContentMemoryPolicy = {
  enabled: true,
  retentionDays: 90,
  allowedOrigins: ["https://source.example"],
};
const item: ContentMemoryMatch = {
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
const saved = { ...item, text: "Historical body" };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function control(id: string) {
  const result = host.querySelector<HTMLElement>(`[data-command-id="${id}"]`);
  if (!result) throw new Error(id);
  return result;
}
function button(label: string) {
  const result = [...document.body.querySelectorAll("button")].find((node) => node.textContent === label);
  if (!result) throw new Error(label);
  return result;
}
async function click(id: string) {
  await act(async () => control(id).click());
}
async function render(value = memory) {
  await act(async () => root.render(<ContentMemory memory={value} />));
}
async function input(selector: string, value: string) {
  const field = host.querySelector<HTMLInputElement>(selector)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function search() {
  await input('[aria-label="Search remembered articles"]', "article");
  await act(async () => vi.advanceTimersByTimeAsync(200));
}
async function read() {
  await search();
  await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(
    () => [{ width: 100 }] as unknown as DOMRectList,
  );
  useStore.setState({
    layout: {
      ...useStore.getState().layout,
      spaces: [{ id: "native-space", workspaceId: "space", name: "Space", color: "blue", grain: 0 }],
      archivedSpaces: [],
    },
  });
  mocks.privateMode = false;
  mocks.listeners.clear();
  mocks.call.mockReset();
  mocks.toast.mockReset();
  mocks.call.mockImplementation(async (method, params) => {
    if (method === "workspaces.contentMemory.policy") return policy;
    if (method === "workspaces.contentMemory.semanticSearch") return { mode: "lexical", matches: [item] };
    if (method === "workspaces.contentMemory.get") return saved;
    if (method === "workspaces.contentMemory.setPolicy") return params.policy;
    if (method === "workspaces.contentMemory.forget") return { forgotten: 1 };
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it.each(ids)("registers %s once with focused remapping and no palette escape", (id) => {
  expect(COMMANDS.filter((row) => row.id === id)).toHaveLength(1);
  expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
    palette: false,
    handler: "shell",
    windows: ["normal"],
    bindings: [],
    intercept: true,
  });
  expect(
    matchShortcut(effectiveShortcuts({ [id]: [{ key: "m", command: true, alt: true }] }), {
      key: "m",
      meta: true,
      alt: true,
      shift: false,
    })?.id,
  ).toBe(id);
});
it("requires explicit opt-in and uses the original policy for toggle and retention", async () => {
  mocks.call.mockResolvedValueOnce({ ...policy, enabled: false });
  await render();
  expect(mocks.call).toHaveBeenCalledTimes(1);
  expect(host.querySelector<HTMLInputElement>('input[type="search"]')!.disabled).toBe(true);
  await click("toggle-content-memory");
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.setPolicy", {
    workspaceId: "space",
    policy,
  });
  const select = control("set-content-memory-retention") as HTMLSelectElement;
  await act(async () => {
    select.value = "30";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.setPolicy", {
    workspaceId: "space",
    policy: { ...policy, retentionDays: 30 },
  });
});
it("registers disclosure/site removal and reviews clear before actual deletion", async () => {
  await render();
  await click("toggle-content-memory-sites");
  expect(host.querySelector("details")!.open).toBe(true);
  await click("remove-content-memory-site");
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.setPolicy", {
    workspaceId: "space",
    policy: { ...policy, allowedOrigins: [] },
  });
  await click("confirm-clear-content-memory");
  expect(
    mocks.call.mock.calls.filter(([method]) => method === "workspaces.contentMemory.forget"),
  ).toHaveLength(0);
  await click("cancel-clear-content-memory");
  expect(host.textContent).not.toContain("Forget all saved articles in this Space?");
  await click("confirm-clear-content-memory");
  await click("clear-content-memory");
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.forget", {
    workspaceId: "space",
    memoryId: undefined,
  });
});
it("real row and menu controls retain saved article identity and original opener", async () => {
  const newTab = vi.fn().mockResolvedValue(null);
  vi.spyOn(useStore, "getState").mockReturnValue({ ...useStore.getState(), newTab });
  await render();
  await search();
  await click("toggle-content-memory-actions");
  await act(async () => button("Open live source").click());
  expect(newTab).toHaveBeenCalledWith(item.url);
  await click("toggle-content-memory-actions");
  await act(async () => button("Read saved text").click());
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.get", {
    workspaceId: "space",
    memoryId: "article",
  });
  expect(host.textContent).toContain("Historical body");
  await click("close-content-memory-detail");
  expect(host.querySelector(".content-memory-document")).toBeNull();
  await click("toggle-content-memory-actions");
  await act(async () => button("Forget").click());
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.forget", {
    workspaceId: "space",
    memoryId: "article",
  });
});
it("refuses foreign saved document and keeps original source checks", async () => {
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy"
      ? policy
      : method === "workspaces.contentMemory.semanticSearch"
        ? { mode: "lexical", matches: [item] }
        : { ...saved, documentEpoch: 5 },
  );
  await render();
  await read();
  expect(host.querySelector(".content-memory-document")).toBeNull();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("original version");
});
it("keeps a newer question after the original Ask ACK and does not open its stale run", async () => {
  const hold = deferred<never>();
  const startRun = vi.fn().mockReturnValue(hold.promise),
    openConversation = vi.fn();
  vi.spyOn(useStore, "getState").mockReturnValue({ ...useStore.getState(), startRun, openConversation });
  await render();
  await read();
  await input('[aria-label="Question about saved article"]', "original question");
  await act(async () => button("Ask Aux").click());
  expect(startRun).toHaveBeenCalledWith(
    "original question",
    expect.objectContaining({
      memorySource: { workspaceId: "space", memoryId: "article" },
      presentation: "conversation",
    }),
  );
  await input('[aria-label="Question about saved article"]', "new question");
  await act(async () => hold.resolve({ runId: "old-run" } as never));
  expect(openConversation).not.toHaveBeenCalled();
  expect(host.querySelector<HTMLInputElement>('[aria-label="Question about saved article"]')!.value).toBe(
    "new question",
  );
});
it("same workspace revision roundtrip cannot revive a held article read", async () => {
  const hold = deferred<typeof saved>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy"
      ? policy
      : method === "workspaces.contentMemory.semanticSearch"
        ? { mode: "lexical", matches: [item] }
        : hold.promise,
  );
  await render();
  await search();
  await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
  await render({ ...memory, revision: 4 });
  await render();
  await act(async () => hold.resolve(saved));
  expect(host.querySelector(".content-memory-document")).toBeNull();
});
it("held policy rejection belongs only to its original scope; replacement can retry", async () => {
  const hold = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? policy : hold.promise,
  );
  await render();
  await click("toggle-content-memory");
  await render({ ...memory, revision: 4 });
  await render();
  await act(async () => hold.reject(new Error("old policy error")));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  mocks.call.mockImplementation(async (method, params) =>
    method === "workspaces.contentMemory.policy" ? policy : params.policy,
  );
  await click("toggle-content-memory");
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.setPolicy", {
    workspaceId: "space",
    policy: { ...policy, enabled: false },
  });
});
it("hidden/private/foreign and unfocused controls refuse without content or model mutation", async () => {
  await render();
  await expect(executeCommand("toggle-content-memory")).rejects.toThrow("focused");
  control("toggle-content-memory").focus();
  await expect(executeCommand("toggle-content-memory", { payload: { scopeId: "other" } })).rejects.toThrow(
    "focused",
  );
  host.hidden = true;
  await expect(executeCommand("toggle-content-memory")).rejects.toThrow("focused");
  host.hidden = false;
  mocks.privateMode = true;
  await expect(executeCommand("toggle-content-memory")).rejects.toThrow("controls changed");
  expect(mocks.call).toHaveBeenCalledTimes(1);
});
it("Private does not load policy or search content", async () => {
  mocks.privateMode = true;
  await render();
  expect(mocks.call).not.toHaveBeenCalled();
  expect(host.querySelector('input[type="search"]')).toBeNull();
});
it("focused Ask preserves its actual acknowledged run and opens only its original question", async () => {
  const hold = deferred<never>();
  const startRun = vi.fn().mockReturnValue(hold.promise),
    openConversation = vi.fn();
  vi.spyOn(useStore, "getState").mockReturnValue({ ...useStore.getState(), startRun, openConversation });
  await render();
  await read();
  await input('[aria-label="Question about saved article"]', "question");
  control("ask-content-memory").focus();
  let result!: Promise<unknown>;
  await act(async () => {
    result = executeCommand("ask-content-memory");
  });
  const originalRun = { runId: "original-run" };
  await act(async () => {
    hold.resolve(originalRun as never);
    expect(await result).toBe(originalRun);
  });
  expect(openConversation).toHaveBeenCalledWith("original-run");
  expect(host.querySelector<HTMLInputElement>('[aria-label="Question about saved article"]')!.value).toBe("");
});
it("real menu keyboard activation retains original arrow focus and registers focused actions", async () => {
  const newTab = vi.fn().mockResolvedValue(null);
  vi.spyOn(useStore, "getState").mockReturnValue({ ...useStore.getState(), newTab });
  await render();
  await search();
  const trigger = control("toggle-content-memory-actions");
  trigger.focus();
  await act(async () =>
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })),
  );
  expect(document.activeElement).toBe(button("Forget"));
  button("Open live source").focus();
  await act(async () => {
    await executeCommand("open-content-memory-source");
  });
  expect(newTab).toHaveBeenCalledWith(item.url);
});
it("query roundtrip cannot publish an old search result with the same item ID", async () => {
  const hold = deferred<ContentMemoryMatch[]>();
  let searches = 0;
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy"
      ? policy
      : ++searches === 1
        ? hold.promise.then((matches) => ({ mode: "lexical", matches }))
        : { mode: "lexical", matches: [{ ...item, title: "Current article" }] },
  );
  await render();
  await search();
  await input('[aria-label="Search remembered articles"]', "other");
  await input('[aria-label="Search remembered articles"]', "article");
  await act(async () => vi.advanceTimersByTimeAsync(200));
  await act(async () => hold.resolve([item]));
  expect(host.textContent).toContain("Current article");
  expect(host.textContent).not.toContain("Recorded article");
});
it("original acknowledged policy write after unmount stays truthful without presenting new scope state", async () => {
  const hold = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? policy : hold.promise,
  );
  await render();
  control("toggle-content-memory").focus();
  let result!: Promise<unknown>;
  await act(async () => {
    result = executeCommand("toggle-content-memory");
  });
  await act(async () => root.render(null));
  const acknowledged = { ...policy, enabled: false };
  await act(async () => {
    hold.resolve(acknowledged);
    expect(await result).toBe(acknowledged);
  });
  expect(host.textContent).toBe("");
});
it("held read cannot revive across committed normal Private normal ownership", async () => {
  const hold = deferred<typeof saved>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy"
      ? policy
      : method === "workspaces.contentMemory.semanticSearch"
        ? { mode: "lexical", matches: [item] }
        : hold.promise,
  );
  await render();
  await search();
  await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
  mocks.privateMode = true;
  await render();
  mocks.privateMode = false;
  await render();
  await act(async () => hold.resolve(saved));
  expect(host.querySelector(".content-memory-document")).toBeNull();
});
it("a removed native Space retires original controls and held read before publication", async () => {
  const hold = deferred<typeof saved>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy"
      ? policy
      : method === "workspaces.contentMemory.semanticSearch"
        ? { mode: "lexical", matches: [item] }
        : hold.promise,
  );
  await render();
  await search();
  await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
  await act(async () => useStore.setState({ layout: { ...useStore.getState().layout, spaces: [] } }));
  await act(async () => hold.resolve(saved));
  expect(host.querySelector(".content-memory-document")).toBeNull();
  expect(control.bind(null, "toggle-content-memory")).toThrow("toggle-content-memory");
});
it("revision reload hides old policy and refuses effects while the genuine GET is held", async () => {
  await render();
  const hold = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? hold.promise : policy,
  );
  await render({ ...memory, revision: 4 });
  expect(host.querySelector('[data-command-id="toggle-content-memory"]')).toBeNull();
  await expect(executeCommand("toggle-content-memory", { payload: { scopeId: "space" } })).rejects.toThrow(
    "focused",
  );
  expect(
    mocks.call.mock.calls.filter(([method]) => method === "workspaces.contentMemory.setPolicy"),
  ).toHaveLength(0);
  await act(async () => hold.resolve({ ...policy, enabled: false }));
  expect((control("toggle-content-memory") as HTMLInputElement).checked).toBe(false);
});
it("an original held policy GET cannot overwrite fresh policy after a Private roundtrip", async () => {
  const hold = deferred<ContentMemoryPolicy>();
  let loads = 0;
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? (++loads === 1 ? hold.promise : policy) : policy,
  );
  await render();
  mocks.privateMode = true;
  await render();
  mocks.privateMode = false;
  await render();
  await act(async () => hold.resolve({ ...policy, enabled: false }));
  expect((control("toggle-content-memory") as HTMLInputElement).checked).toBe(true);
});
it("archived Space mapping remains valid but missing membership refuses before committed rerender", async () => {
  await act(async () =>
    useStore.setState({
      layout: {
        ...useStore.getState().layout,
        spaces: [],
        archivedSpaces: [
          { id: "archived-space", workspaceId: "space", name: "Space", color: "blue", grain: 0 },
        ],
      },
    }),
  );
  await render();
  control("toggle-content-memory").focus();
  await act(async () => {
    useStore.setState({ layout: { ...useStore.getState().layout, archivedSpaces: [] } });
    await expect(executeCommand("toggle-content-memory")).rejects.toThrow("controls changed");
  });
  expect(
    mocks.call.mock.calls.filter(([method]) => method === "workspaces.contentMemory.setPolicy"),
  ).toHaveLength(0);
});
it("remapped held policy rejection is not reported after original owner retirement", async () => {
  const hold = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? policy : hold.promise,
  );
  await render();
  control("toggle-content-memory").focus();
  await act(async () => {
    expect(runCommand("toggle-content-memory")).toBe(true);
  });
  await render({ ...memory, revision: 4 });
  await act(async () => hold.reject(new Error("Original private policy failure")));
  expect(mocks.toast).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("awaited original failure and ACK remain exact after retired ownership", async () => {
  const hold = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? policy : hold.promise,
  );
  await render();
  control("toggle-content-memory").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("toggle-content-memory");
  });
  const observed = completion.then(
    (value) => ({ kind: "resolved", value }),
    (reason) => ({ kind: "rejected", reason }),
  );
  mocks.privateMode = true;
  await render();
  const reason = new Error("Original policy refusal");
  await act(async () => {
    hold.reject(reason);
    expect(await observed).toEqual({ kind: "rejected", reason });
  });
  expect(mocks.toast).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).toBeNull();
  mocks.privateMode = false;
  const success = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? policy : success.promise,
  );
  await render();
  control("toggle-content-memory").focus();
  await act(async () => {
    completion = executeCommand("toggle-content-memory");
  });
  await act(async () => root.render(null));
  const ack = { ...policy, enabled: false };
  await act(async () => {
    success.resolve(ack);
    expect(await completion).toBe(ack);
  });
});
it("live remapped policy failure preserves exact rejection reporting", async () => {
  const hold = deferred<ContentMemoryPolicy>();
  mocks.call.mockImplementation(async (method) =>
    method === "workspaces.contentMemory.policy" ? policy : hold.promise,
  );
  await render();
  control("toggle-content-memory").focus();
  await act(async () => {
    expect(runCommand("toggle-content-memory")).toBe(true);
  });
  const reason = new Error("Current policy refused");
  await act(async () => hold.reject(reason));
  expect(mocks.toast).toHaveBeenCalledExactlyOnceWith(reason);
  expect((control("toggle-content-memory") as HTMLInputElement).disabled).toBe(false);
});

it("discovers semantic models only on demand and stores an actually installed selection", async () => {
  mocks.call.mockImplementation(async (method, params) => {
    if (method === "workspaces.contentMemory.policy") return policy;
    if (method === "workspaces.contentMemory.embeddingModels")
      return [{ modelId: "installed-embedding:latest", digest: "a".repeat(64) }];
    if (method === "workspaces.contentMemory.setPolicy") return params.policy;
    throw new Error(`Unexpected ${method}`);
  });
  await render();
  expect(mocks.call).toHaveBeenCalledTimes(1);
  await click("detect-content-memory-models");
  const select = control("select-content-memory-model") as HTMLSelectElement;
  expect(select.options).toHaveLength(2);
  await act(async () => {
    select.value = "installed-embedding:latest";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.contentMemory.setPolicy", {
    workspaceId: "space",
    policy: { ...policy, semanticModelId: "installed-embedding:latest" },
  });
});
