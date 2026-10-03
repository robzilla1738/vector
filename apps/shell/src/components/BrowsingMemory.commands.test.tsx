// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BrowsingMemory } from "./BrowsingMemory";
import { invokeScopedControl } from "../scoped-control-commands";
const mocks = vi.hoisted(() => ({
  call: vi.fn(),
  newTab: vi.fn(),
  privateMode: false,
  saved: {} as any,
  state: {} as any,
  errors: vi.fn(),
  notify: (_event: any) => {},
}));
vi.mock("../bridge", () => ({
  bridge: {
    get privateMode() {
      return mocks.privateMode;
    },
    onEvent: (callback: (event: any) => void) => {
      mocks.notify = callback;
      return () => {};
    },
  },
}));
vi.mock("../store", () => ({
  call: mocks.call,
  errToast: mocks.errors,
  useStore: { getState: () => mocks.state },
}));
vi.mock("../commands", async () => {
  const module = await import("../scoped-control-commands");
  return {
    executeCommand: (id: string, context: any) => {
      try {
        return Promise.resolve(module.invokeScopedControl(id, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
vi.mock("./MemoryRecoveryNotice", () => ({
  MemoryRecoveryNotice: () => <output>Fresh backup needed</output>,
}));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const memory = (workspaceId = "wa", revision = 1) => ({
  workspaceId,
  revision,
  content: "",
  enabled: true,
  items: [],
  excludedOrigins: [],
});
function saved(workspaceId = "wa") {
  return {
    workspaceId,
    policy: { enabled: false, retentionDays: 30 },
    pages: [
      {
        memoryId: "page",
        url: "https://owned.example/page",
        title: "Original saved title",
        firstVisitedAt: 1,
        lastVisitedAt: 2,
      },
    ],
  };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  mocks.privateMode = false;
  mocks.saved = saved();
  mocks.call.mockReset();
  mocks.errors.mockReset();
  mocks.newTab.mockReset().mockResolvedValue(undefined);
  mocks.state = {
    layout: {
      spaces: [
        { id: "a", workspaceId: "wa" },
        { id: "b", workspaceId: "wb" },
      ],
      archivedSpaces: [],
    },
    newTab: mocks.newTab,
  };
  mocks.call.mockImplementation(async (method, params) => {
    if (method.endsWith(".get")) return mocks.saved;
    if (method.endsWith(".set")) {
      mocks.saved = { ...mocks.saved, policy: params.policy };
      return mocks.saved;
    }
    if (method.endsWith(".forget")) {
      mocks.saved = { ...mocks.saved, pages: [] };
      return mocks.saved;
    }
    throw new Error(method);
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
function button(text: string) {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
}
async function mount() {
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
}
async function disclose() {
  await act(async () => host.querySelector("summary")!.click());
  expect(host.querySelector("details")!.open).toBe(true);
}
it("routes original checkbox and retention actions and keeps authoring consent off by default", async () => {
  await mount();
  expect(host.textContent).toContain("Private windows and agent tabs are excluded");
  expect(mocks.call).toHaveBeenCalledOnce();
  const toggle = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  expect(toggle.checked).toBe(false);
  await act(async () => toggle.click());
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.browsingMemory.set", {
    workspaceId: "wa",
    policy: { enabled: true, retentionDays: 30 },
  });
  const select = host.querySelector<HTMLSelectElement>("select")!;
  await act(async () => {
    select.value = "7";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.browsingMemory.set", {
    workspaceId: "wa",
    policy: { enabled: true, retentionDays: 7 },
  });
});
it("keeps original row/menu item ownership, keyboard menu navigation and detail return focus", async () => {
  await mount();
  await disclose();
  const row = host.querySelector<HTMLButtonElement>(".ui-list-open")!;
  row.focus();
  await act(async () => {
    invokeScopedControl("select-browsing-memory-page");
  });
  expect(host.textContent).toContain("Page reference · This Space");
  const close = host.querySelector<HTMLButtonElement>('[aria-label="Close Original saved title"]')!;
  await act(async () => close.click());
  expect(document.activeElement).toBe(row);
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Actions for Original saved title"]')!;
  trigger.focus();
  await act(async () =>
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
    ),
  );
  const item = document.querySelector<HTMLButtonElement>('[role="menuitem"]')!;
  expect(document.activeElement).toBe(item);
  await act(async () => {
    invokeScopedControl("open-browsing-memory-page");
  });
  expect(mocks.newTab).toHaveBeenCalledExactlyOnceWith("https://owned.example/page");
  await act(async () => item.click());
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(() => invokeScopedControl("forget-browsing-memory-page")).toThrow();
});
it("requires explicit current clear confirmation, preserves cancel and invokes forget exactly once", async () => {
  await mount();
  await disclose();
  const before = mocks.call.mock.calls.length;
  const prepare = button("Forget all remembered pages…");
  prepare.focus();
  expect(() => invokeScopedControl("confirm-forget-browsing-memory")).toThrow();
  await act(async () => prepare.click());
  expect(mocks.call).toHaveBeenCalledTimes(before);
  await act(async () => button("Cancel").click());
  expect(mocks.call).toHaveBeenCalledTimes(before);
  await act(async () => button("Forget all remembered pages…").click());
  await act(async () => button("Forget all").click());
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.browsingMemory.forget", { workspaceId: "wa" });
  expect(host.textContent).toContain("Fresh backup needed");
  expect(host.textContent).toContain("No remembered pages.");
});
it("retries a genuine load error without changing workspace or consent", async () => {
  mocks.call.mockRejectedValueOnce(new Error("Original load failure"));
  await mount();
  const retry = button("Retry");
  retry.focus();
  await act(async () => {
    invokeScopedControl("retry-browsing-memory-load");
    expect(() => invokeScopedControl("retry-browsing-memory-load")).toThrow();
  });
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.browsingMemory.get", { workspaceId: "wa" });
  expect(host.textContent).not.toContain("Original load failure");
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
});
it("refuses changed record metadata, filtered retired rows and Private owners", async () => {
  await mount();
  await disclose();
  const row = host.querySelector<HTMLButtonElement>(".ui-list-open")!;
  row.focus();
  mocks.saved.pages[0].url = "https://foreign.example/replacement";
  expect(() => invokeScopedControl("select-browsing-memory-page")).toThrow("remembered page changed");
  const query = host.querySelector<HTMLInputElement>('[aria-label="Search remembered pages"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(query, "absent");
    query.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(row.isConnected).toBe(false);
  expect(() => invokeScopedControl("select-browsing-memory-page")).toThrow();
  mocks.privateMode = true;
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
  expect(host.textContent).toContain("unavailable in private");
  expect(() => invokeScopedControl("toggle-browsing-memory")).toThrow();
  expect(mocks.newTab).not.toHaveBeenCalled();
});
it("irreversibly retires a pending mutation across A→B→A and does not repaint its reply", async () => {
  await mount();
  let finish!: (value: any) => void;
  mocks.call.mockImplementation((method, params) =>
    method.endsWith(".get")
      ? Promise.resolve(saved(params.workspaceId))
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  await act(async () => root.render(<BrowsingMemory memory={memory("wb")} />));
  await act(async () => root.render(<BrowsingMemory memory={memory("wa")} />));
  await act(async () => finish({ ...saved(), policy: { enabled: true, retentionDays: 7 }, pages: [] }));
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
  expect(host.textContent).toContain("Remembered pages · 1");
  expect(mocks.errors).not.toHaveBeenCalled();
});
it("never reads browsing memory in a Private component", async () => {
  mocks.privateMode = true;
  await mount();
  expect(mocks.call).not.toHaveBeenCalled();
  expect(host.querySelector("input")).toBeNull();
});
it("retires a clear confirmation when a fresh loaded snapshot replaces its original records", async () => {
  await mount();
  await disclose();
  await act(async () => button("Forget all remembered pages…").click());
  const oldConfirm = button("Forget all");
  oldConfirm.focus();
  mocks.saved = {
    ...saved(),
    pages: [
      ...saved().pages,
      {
        memoryId: "new",
        url: "https://owned.example/new",
        title: "New saved page",
        firstVisitedAt: 3,
        lastVisitedAt: 4,
      },
    ],
  };
  await act(async () => root.render(<BrowsingMemory memory={memory("wa", 2)} />));
  expect(oldConfirm.isConnected).toBe(false);
  expect(button("Forget all remembered pages…")).toBeTruthy();
  expect(() => invokeScopedControl("confirm-forget-browsing-memory")).toThrow();
  expect(mocks.call.mock.calls.filter(([method]) => method.endsWith(".forget"))).toHaveLength(0);
});
it("does not restore an old detail opener after the original revision retires", async () => {
  await mount();
  await disclose();
  const row = host.querySelector<HTMLButtonElement>(".ui-list-open")!;
  row.focus();
  await act(async () => row.click());
  let frame!: FrameRequestCallback;
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    frame = fn;
    return 1;
  });
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Close Original saved title"]')!.click(),
  );
  await act(async () => root.render(<BrowsingMemory memory={memory("wa", 2)} />));
  const current = host.querySelector<HTMLSelectElement>("select")!;
  current.focus();
  frame(0);
  expect(document.activeElement).toBe(current);
});
it("refuses a foreign workspace load result rather than displaying its records", async () => {
  mocks.saved = { ...saved("foreign"), pages: [{ ...saved().pages[0], title: "Foreign private title" }] };
  await mount();
  expect(host.textContent).not.toContain("Foreign private title");
  expect(host.textContent).toContain("different Space");
  expect(host.querySelector("summary")).toBeNull();
});
it("a fresh revision owns its own pending update and late retired completion cannot unlock it", async () => {
  await mount();
  await disclose();
  const query = host.querySelector<HTMLInputElement>('[aria-label="Search remembered pages"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(query, "Original");
    query.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const releases: ((value: any) => void)[] = [];
  mocks.call.mockImplementation((method) =>
    method.endsWith(".get") ? Promise.resolve(saved()) : new Promise((resolve) => releases.push(resolve)),
  );
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.disabled).toBe(true);
  await act(async () => root.render(<BrowsingMemory memory={memory("wa", 2)} />));
  expect(host.querySelector<HTMLInputElement>('[aria-label="Search remembered pages"]')!.value).toBe(
    "Original",
  );
  const fresh = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  expect(fresh.disabled).toBe(false);
  await act(async () => fresh.click());
  expect(releases).toHaveLength(2);
  await act(async () => releases[0]!({ ...saved(), policy: { enabled: true, retentionDays: 7 }, pages: [] }));
  expect(fresh.disabled).toBe(true);
  expect(fresh.checked).toBe(false);
  expect(host.textContent).toContain("Remembered pages · 1");
  await act(async () => releases[1]!({ ...saved(), policy: { enabled: true, retentionDays: 30 } }));
  expect(fresh.disabled).toBe(false);
  expect(fresh.checked).toBe(true);
  expect(mocks.errors).not.toHaveBeenCalled();
});
it("refuses mutation delivery after its actual workspace leaves the allowed layout", async () => {
  await mount();
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  mocks.state.layout.spaces = [{ id: "b", workspaceId: "wb" }];
  await act(async () => finish({ ...saved(), policy: { enabled: true, retentionDays: 7 } }));
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
  expect(host.textContent).not.toContain("update retired");
  const original = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  original.focus();
  expect(() => invokeScopedControl("toggle-browsing-memory")).toThrow("changed");
});
it("retires old policy and page controls until an event refresh receives its own loaded snapshot", async () => {
  await mount();
  await disclose();
  const query = host.querySelector<HTMLInputElement>('[aria-label="Search remembered pages"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(query, "Original");
    query.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const old = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () =>
    mocks.notify({ type: "workspace.browsingMemory.updated", payload: { workspaceId: "wa" } }),
  );
  expect(old.isConnected).toBe(false);
  expect(host.textContent).toContain("Loading browsing memory");
  expect(() => invokeScopedControl("toggle-browsing-memory")).toThrow();
  expect(() => invokeScopedControl("select-browsing-memory-page")).toThrow();
  await act(async () => finish({ ...saved(), policy: { enabled: true, retentionDays: 7 } }));
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
  expect(host.querySelector<HTMLSelectElement>("select")!.value).toBe("7");
  expect(host.querySelector<HTMLInputElement>('[aria-label="Search remembered pages"]')!.value).toBe(
    "Original",
  );
});
it("a failed retired refresh publishes no error after Private lock/unlock and cannot replace fresh data", async () => {
  await mount();
  let fail!: (reason: Error) => void;
  mocks.call.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
  );
  await act(async () => root.render(<BrowsingMemory memory={memory("wa", 2)} />));
  mocks.privateMode = true;
  await act(async () => root.render(<BrowsingMemory memory={memory("wa", 2)} />));
  mocks.privateMode = false;
  await act(async () => root.render(<BrowsingMemory memory={memory("wa", 2)} />));
  await act(async () => fail(new Error("Retired protected error")));
  expect(host.textContent).not.toContain("Retired protected error");
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
});
it("a rejected held mutation reports while its original load owner survives ordinary busy rerenders", async () => {
  await mount();
  let fail!: (reason: unknown) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((_ok, reject) => {
        fail = reject;
      }),
  );
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
  const original = new Error("Original active failure");
  await act(async () => fail(original));
  expect(host.textContent).toContain("Original active failure");
  expect(mocks.errors).toHaveBeenCalledExactlyOnceWith(original);
});
it("a rejected held mutation retains its failure without globally publishing protected text after Private roundtrip", async () => {
  await mount();
  let fail!: (reason: unknown) => void;
  mocks.call.mockImplementationOnce(
    () =>
      new Promise((_ok, reject) => {
        fail = reject;
      }),
  );
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  mocks.privateMode = true;
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
  mocks.privateMode = false;
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
  await act(async () => fail(new Error("Protected retired mutation")));
  expect(host.textContent).not.toContain("Protected retired mutation");
  expect(mocks.errors).not.toHaveBeenCalled();
});
it("a successful retired mutation preserves its exact original ACK without repainting a replacement scope", async () => {
  await mount();
  const input = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  input.focus();
  let finish!: (value: any) => void;
  mocks.call.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("toggle-browsing-memory") as Promise<unknown>;
  });
  mocks.privateMode = true;
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
  mocks.privateMode = false;
  await act(async () => root.render(<BrowsingMemory memory={memory()} />));
  const ack = { ...saved(), policy: { enabled: true, retentionDays: 7 } };
  await act(async () => finish(ack));
  await expect(completion).resolves.toBe(ack);
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
  expect(mocks.errors).not.toHaveBeenCalled();
});
