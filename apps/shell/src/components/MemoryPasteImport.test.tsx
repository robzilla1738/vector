// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { MemoryPasteImport } from "./MemoryPasteImport";

const rpc = vi.hoisted(() => vi.fn());
const native = vi.hoisted(() => ({
  privateMode: false,
  onEvent: vi.fn((_callback: (event: unknown) => void) => () => {}),
}));
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      windowKind: "normal",
      get privateMode() {
        return native.privateMode;
      },
      onEvent: native.onEvent,
    },
  };
});
vi.mock("../store", async (original) => ({ ...(await original<typeof import("../store")>()), call: rpc }));
const ids = ["03ff3a89-bf13-4277-a4ec-26cba3ea9b56", "1047cd75-63c7-4e97-a4c9-c70ab7c9d580"];
const previewId = "2047cd75-63c7-4e97-a4c9-c70ab7c9d581";
const preview = {
  status: "ready",
  workspaceId: "workspace-one",
  previewId,
  expiresAt: Date.now() + 600000,
  candidates: ids.map((candidateId, index) => ({
    candidateId,
    text: `Useful note ${index}`,
    duplicate: index === 1,
  })),
};
const receipt = {
  importId: previewId,
  createdAt: 1,
  selected: 1,
  added: 1,
  duplicates: 0,
  pending: 1,
  accepted: 0,
  restorable: 0,
  removed: 0,
};
const review = vi.fn();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === text)!;
async function choose(value = "workspace-one") {
  await act(async () => {
    const select = host.querySelector("select")!;
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
async function paste(text = "Useful note 0\nUseful note 1") {
  await act(async () => {
    const textarea = host.querySelector("textarea")!;
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function mount() {
  await act(async () => root.render(<MemoryPasteImport onReview={review} />));
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(
    () => [{ width: 100 }] as unknown as DOMRectList,
  );
  useStore.setState({
    layout: {
      ...useStore.getState().layout,
      spaces: [
        { id: "space-one", workspaceId: "workspace-one", name: "Personal", color: "blue", grain: 0 },
        { id: "space-two", workspaceId: "workspace-two", name: "Research", color: "blue", grain: 0 },
      ],
      archivedSpaces: [],
    },
  });
  rpc.mockReset();
  review.mockClear();
  native.privateMode = false;
  rpc.mockImplementation(async (method: string, params: { workspaceId: string }) => {
    if (method === "memory.pipeline.policy") return { workspaceId: params.workspaceId, enabled: false };
    if (method === "memory.paste.status") return [];
    if (method === "memory.paste.preview") return preview;
    if (method === "memory.pipeline.setPolicy") return { workspaceId: params.workspaceId, enabled: true };
    if (method === "memory.paste.commit") return receipt;
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("requires an explicit destination and preview, with every candidate initially unchecked", async () => {
  await mount();
  await paste();
  expect(rpc).not.toHaveBeenCalled();
  expect(button("Preview pasted notes").disabled).toBe(true);
  await choose();
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.preview")).toBe(false);
  await act(async () => button("Preview pasted notes").click());
  expect(rpc).toHaveBeenCalledWith("memory.paste.preview", {
    workspaceId: "workspace-one",
    text: "Useful note 0\nUseful note 1",
  });
  const inputs = [...host.querySelectorAll<HTMLInputElement>('fieldset input[type="checkbox"]')];
  expect(inputs).toHaveLength(3);
  expect(inputs.every((input) => !input.checked)).toBe(true);
  expect(inputs[1]!.disabled).toBe(true);
  expect(
    rpc.mock.calls.some(
      ([method]) => method === "memory.paste.commit" || method === "memory.pipeline.setPolicy",
    ),
  ).toBe(false);
});

it("enables Memory only on explicit choice and queues just the checked notes for separate acceptance", async () => {
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => host.querySelector<HTMLInputElement>('fieldset input[type="checkbox"]')!.click());
  expect(button("Add 1 note to Memory review").disabled).toBe(true);
  await act(async () =>
    [...host.querySelectorAll<HTMLInputElement>('fieldset input[type="checkbox"]')].at(-1)!.click(),
  );
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.setPolicy", {
    workspaceId: "workspace-one",
    enabled: true,
  });
  await act(async () => button("Add 1 note to Memory review").click());
  expect(rpc).toHaveBeenCalledWith("memory.paste.commit", {
    workspaceId: "workspace-one",
    previewId,
    selectedIds: [ids[0]],
  });
  expect(host.querySelector("textarea")!.value).toBe("");
  expect(review).toHaveBeenCalledWith("workspace-one");
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(rpc.mock.calls.some(([method]) => method === "memory.pipeline.review")).toBe(false);
});

it("invalidates a review after editing text or choosing another Space", async () => {
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await paste("A changed note");
  expect(host.querySelector("fieldset")).toBeNull();
  await act(async () => button("Preview pasted notes").click());
  await choose("workspace-two");
  expect(review).toHaveBeenLastCalledWith(null);
  expect(host.querySelector("fieldset")).toBeNull();
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.commit")).toBe(false);
});

it("shows a blocked sensitivity result without an import or approval path", async () => {
  const original = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method, params) =>
    method === "memory.paste.preview"
      ? { status: "blocked", workspaceId: "workspace-one", reason: "Remove the credential before preview." }
      : original(method, params),
  );
  await mount();
  await choose();
  await paste("password = fixture-only");
  await act(async () => button("Preview pasted notes").click());
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("No notes were saved");
  expect(host.querySelector("fieldset")).toBeNull();
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.commit")).toBe(false);
});

it("reconciles a lost commit response with durable receipts and does not repeat work after remount", async () => {
  const original = rpc.getMockImplementation()!;
  let committed = false;
  rpc.mockImplementation(async (method, params) => {
    if (method === "memory.paste.commit") {
      committed = true;
      throw new Error("Response interrupted. Check receipts.");
    }
    if (method === "memory.paste.status") return committed ? [receipt] : [];
    if (method === "memory.pipeline.policy") return { workspaceId: params.workspaceId, enabled: true };
    return original(method, params);
  });
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => host.querySelector<HTMLInputElement>('fieldset input[type="checkbox"]')!.click());
  await act(async () => button("Add 1 note to Memory review").click());
  await act(async () => button("Refresh import receipts").click());
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(host.querySelector("fieldset")).toBeNull();
  await act(async () => root.render(null));
  await mount();
  await choose();
  expect(host.querySelector("textarea")!.value).toBe("");
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(rpc.mock.calls.filter(([method]) => method === "memory.paste.commit")).toHaveLength(1);
  expect(rpc.mock.calls.filter(([method]) => method === "memory.paste.preview")).toHaveLength(1);
});

it("does not expose paste controls or issue RPCs in private browsing", async () => {
  native.privateMode = true;
  await mount();
  expect(host.querySelector("textarea")).toBeNull();
  expect(rpc).not.toHaveBeenCalled();
});

it("ignores a late preview when the permitted destination changes", async () => {
  const original = rpc.getMockImplementation()!;
  let finish!: () => void;
  rpc.mockImplementation(async (method, params) => {
    if (method === "memory.paste.preview") {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return preview;
    }
    return original(method, params);
  });
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => root.render(<MemoryPasteImport workspaceId="workspace-two" onReview={review} />));
  await act(async () => finish());
  expect(host.querySelector("fieldset")).toBeNull();
  expect(host.querySelector("select")!.value).toBe("");
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.commit")).toBe(false);
});

const commands = [
  "select-memory-import-space",
  "preview-memory-import",
  "clear-memory-import-draft",
  "select-memory-import-note",
  "enable-memory-import",
  "commit-memory-import",
  "refresh-memory-import-receipts",
  "review-memory-import-space",
] as const;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
it.each(commands)("registers %s with remapping and no palette owner escape", (command) => {
  expect(COMMANDS.filter((row) => row.id === command)).toHaveLength(1);
  expect(COMMANDS.find((row) => row.id === command)).toMatchObject({
    palette: false,
    handler: "shell",
    windows: ["normal"],
    bindings: [],
    intercept: true,
  });
  expect(
    matchShortcut(effectiveShortcuts({ [command]: [{ key: "i", command: true, alt: true }] }), {
      key: "i",
      meta: true,
      alt: true,
      shift: false,
    })?.id,
  ).toBe(command);
});
it.each(["Private", "destination", "missing-space"])(
  "does not revive a held preview after original %s retirement",
  async (scenario) => {
    const hold = deferred<typeof preview>(),
      fallback = rpc.getMockImplementation()!;
    rpc.mockImplementation((method, params) =>
      method === "memory.paste.preview" ? hold.promise : fallback(method, params),
    );
    await mount();
    await choose();
    await paste();
    await act(async () => button("Preview pasted notes").click());
    if (scenario === "Private") {
      native.privateMode = true;
      await mount();
      native.privateMode = false;
      await mount();
    }
    if (scenario === "destination") {
      await act(async () => root.render(<MemoryPasteImport workspaceId="workspace-two" onReview={review} />));
      await mount();
    }
    if (scenario === "missing-space") {
      const original = useStore.getState().layout;
      await act(async () => useStore.setState({ layout: { ...original, spaces: [] } }));
      await act(async () => useStore.setState({ layout: original }));
    }
    await act(async () => hold.resolve(preview));
    expect(host.querySelector("fieldset")).toBeNull();
    expect(host.querySelector("textarea")!.value).toBe("Useful note 0\nUseful note 1");
    expect(rpc.mock.calls.filter(([method]) => method === "memory.paste.commit")).toHaveLength(0);
  },
);
it("keeps the original awaited rejection while suppressing retired UI delivery", async () => {
  const hold = deferred<typeof preview>(),
    fallback = rpc.getMockImplementation()!;
  rpc.mockImplementation((method, params) =>
    method === "memory.paste.preview" ? hold.promise : fallback(method, params),
  );
  await mount();
  await choose();
  await paste();
  button("Preview pasted notes").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("preview-memory-import");
  });
  const observed = completion.then(
    (value) => ({ value }),
    (reason) => ({ reason }),
  );
  native.privateMode = true;
  await mount();
  native.privateMode = false;
  await mount();
  const reason = new Error("Original private import refusal");
  await act(async () => {
    hold.reject(reason);
    const result = await observed;
    expect("reason" in result && result.reason).toBe(reason);
  });
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(button("Preview pasted notes").disabled).toBe(false);
});
it("only the newest genuine policy/receipt GET can publish or report a mismatched fulfilled response", async () => {
  const hold = deferred<{ workspaceId: string; enabled: boolean }>(),
    fallback = rpc.getMockImplementation()!;
  let reads = 0,
    listener!: (event: unknown) => void;
  native.onEvent.mockImplementation((callback) => {
    listener = callback as typeof listener;
    return () => {};
  });
  rpc.mockImplementation((method, params) =>
    method === "memory.pipeline.policy" && ++reads === 1
      ? hold.promise
      : method === "memory.paste.status"
        ? [receipt]
        : fallback(method, params),
  );
  await mount();
  await choose();
  await act(async () =>
    listener({ type: "workspace.memory.updated", payload: { workspaceId: "workspace-one" } }),
  );
  expect(host.textContent).toContain("1 pending, 0 approved");
  await act(async () => hold.resolve({ workspaceId: "foreign", enabled: true }));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain("1 pending, 0 approved");
});
it("an explicit policy ACK cannot be overwritten by the earlier held GET", async () => {
  const hold = deferred<{ workspaceId: string; enabled: boolean }>(),
    fallback = rpc.getMockImplementation()!;
  rpc.mockImplementation((method, params) =>
    method === "memory.pipeline.policy" ? hold.promise : fallback(method, params),
  );
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => host.querySelector<HTMLElement>('[data-command-id="enable-memory-import"]')!.click());
  await act(async () =>
    host.querySelector<HTMLElement>('[data-command-id="select-memory-import-note"]')!.click(),
  );
  expect(button("Add 1 note to Memory review").disabled).toBe(false);
  await act(async () => hold.resolve({ workspaceId: "workspace-one", enabled: false }));
  expect(button("Add 1 note to Memory review").disabled).toBe(false);
});
it("refuses an unowned shortcut and invokes the focused original review callback once", async () => {
  await mount();
  await expect(executeCommand("clear-memory-import-draft")).rejects.toThrow("focused");
  await choose();
  await paste();
  button("Clear pasted draft").focus();
  await act(async () => executeCommand("clear-memory-import-draft"));
  expect(host.querySelector("textarea")!.value).toBe("");
});

it("old import finally and rejection cannot clear a fresh destination's pending operation", async () => {
  const old = deferred<typeof preview>(),
    fresh = deferred<typeof preview>(),
    fallback = rpc.getMockImplementation()!;
  rpc.mockImplementation((method, params) =>
    method === "memory.paste.preview"
      ? params.workspaceId === "workspace-one"
        ? old.promise
        : fresh.promise
      : fallback(method, params),
  );
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => root.render(<MemoryPasteImport workspaceId="workspace-two" onReview={review} />));
  await choose("workspace-two");
  await act(async () => button("Preview pasted notes").click());
  await act(async () => old.reject(new Error("Original retired import failure")));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(button("Preview pasted notes").disabled).toBe(true);
  await act(async () => fresh.resolve({ ...preview, workspaceId: "workspace-two" }));
  expect(host.querySelector("legend")?.textContent).toBe("Review notes for Research");
  expect(button("Preview pasted notes").disabled).toBe(false);
});
it("an active mismatched policy reply is rejected without enabling the destination", async () => {
  const fallback = rpc.getMockImplementation()!;
  rpc.mockImplementation((method, params) =>
    method === "memory.pipeline.policy"
      ? Promise.resolve({ workspaceId: "foreign", enabled: true })
      : fallback(method, params),
  );
  await mount();
  await choose();
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(
    "Memory returned a different destination Space.",
  );
  expect(
    rpc.mock.calls.filter(
      ([method]) => method === "memory.pipeline.setPolicy" || method === "memory.paste.commit",
    ),
  ).toHaveLength(0);
});
it("a held policy reload cannot reuse the previous enabled policy to commit", async () => {
  const hold = deferred<{ workspaceId: string; enabled: boolean }>(),
    fallback = rpc.getMockImplementation()!;
  let reads = 0,
    listener!: (event: unknown) => void;
  native.onEvent.mockImplementation((callback) => {
    listener = callback;
    return () => {};
  });
  rpc.mockImplementation((method, params) =>
    method === "memory.pipeline.policy"
      ? ++reads === 1
        ? Promise.resolve({ workspaceId: params.workspaceId, enabled: true })
        : hold.promise
      : fallback(method, params),
  );
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => host.querySelector<HTMLInputElement>('fieldset input[type="checkbox"]')!.click());
  button("Add 1 note to Memory review").focus();
  await act(async () => {
    listener({ type: "workspace.memory.updated", payload: { workspaceId: "workspace-one" } });
    await expect(executeCommand("commit-memory-import")).rejects.toThrow("current Memory policy");
  });
  expect(rpc.mock.calls.filter(([method]) => method === "memory.paste.commit")).toHaveLength(0);
  await act(async () => hold.resolve({ workspaceId: "workspace-one", enabled: false }));
  expect(button("Add 1 note to Memory review").disabled).toBe(true);
});
it("fresh explicit receipt refresh survives an older held policy/status pair", async () => {
  const hold = deferred<{ workspaceId: string; enabled: boolean }>(),
    fallback = rpc.getMockImplementation()!;
  let reads = 0;
  rpc.mockImplementation((method, params) =>
    method === "memory.pipeline.policy"
      ? hold.promise
      : method === "memory.paste.status"
        ? Promise.resolve(++reads === 1 ? [] : [receipt])
        : fallback(method, params),
  );
  await mount();
  await choose();
  await act(async () => button("Refresh import receipts").click());
  expect(host.textContent).toContain("1 pending, 0 approved");
  await act(async () => hold.resolve({ workspaceId: "workspace-one", enabled: false }));
  expect(host.textContent).toContain("1 pending, 0 approved");
});
it("older rejected receipt GET cannot report after a fresh receipt read while policy remains original", async () => {
  const old = deferred<(typeof receipt)[]>(),
    fallback = rpc.getMockImplementation()!;
  let reads = 0;
  rpc.mockImplementation((method, params) =>
    method === "memory.paste.status"
      ? ++reads === 1
        ? old.promise
        : Promise.resolve([receipt])
      : fallback(method, params),
  );
  await mount();
  await choose();
  await act(async () => button("Refresh import receipts").click());
  await act(async () => old.reject(new Error("Retired receipt read failure")));
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
