// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { MemoryExclusions } from "./MemoryExclusions";
import { invokeScopedControl } from "../scoped-control-commands";
import { reportCommandCompletionFailure } from "../command-completion";
const mocks = vi.hoisted(() => ({
  call: vi.fn(),
  saved: vi.fn(),
  errors: vi.fn(),
  privateMode: false,
  state: {} as any,
}));
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "original-window",
    get privateMode() {
      return mocks.privateMode;
    },
  },
}));
vi.mock("../store", () => ({
  call: mocks.call,
  errToast: mocks.errors,
  useStore: Object.assign((select: (state: any) => unknown) => select(mocks.state), {
    getState: () => mocks.state,
  }),
}));
vi.mock("../commands", async () => {
  const { invokeScopedControl } = await import("../scoped-control-commands");
  return {
    executeCommand: (id: string, context: any) => {
      try {
        return Promise.resolve(invokeScopedControl(id, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const memory = (revision = 1) => ({
  workspaceId: "wa",
  revision,
  content: "Original overview",
  excludedOrigins: ["https://original.example"],
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  mocks.privateMode = false;
  mocks.call.mockReset();
  mocks.saved.mockReset();
  mocks.errors.mockReset();
  mocks.state = { layout: { spaces: [{ id: "original-space", workspaceId: "wa" }], archivedSpaces: [] } };
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  mocks.call.mockImplementation(async (method, params) => ({
    ...memory(params.expectedRevision ? params.expectedRevision + 1 : 2),
    excludedOrigins: params.excludedOrigins ?? memory().excludedOrigins,
  }));
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount(value = memory(), disabled = false) {
  await act(async () =>
    root.render(<MemoryExclusions memory={value} disabled={disabled} onSaved={mocks.saved} />),
  );
}
async function address(value: string) {
  const node = host.querySelector<HTMLInputElement>("input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
  return node;
}
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
async function submit() {
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
}
function focused(command: string, node: HTMLElement) {
  node.focus();
  return invokeScopedControl(command);
}
it("uses actual disclosure and keyboard form owner, exact origin/protocol/port and original revision", async () => {
  await mount();
  const summary = host.querySelector("summary")!;
  await act(async () => summary.click());
  expect(host.querySelector("details")!.open).toBe(true);
  await address("https://sub.example:8443/long/path?q=1");
  await submit();
  expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.set", {
    workspaceId: "wa",
    expectedRevision: 1,
    content: "Original overview",
    excludedOrigins: ["https://original.example", "https://sub.example:8443"],
  });
  expect(mocks.saved).toHaveBeenCalledOnce();
  expect(host.querySelector<HTMLInputElement>("input")!.value).toBe("");
});
it.each(["https://user:password@example.com", "ftp://example.com", "not a URL"])(
  "refuses invalid or credential-bearing origin %s without writing",
  async (value) => {
    await mount();
    await address(value);
    await submit();
    expect(mocks.call).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Enter a full web address");
  },
);
it("retains duplicate and 100-origin admission limits for actual focused form shortcuts", async () => {
  await mount();
  await address("https://original.example/path");
  await submit();
  expect(host.textContent).toContain("already excluded");
  expect(mocks.call).not.toHaveBeenCalled();
  await mount({
    ...memory(),
    excludedOrigins: Array.from({ length: 100 }, (_, i) => `https://site${i}.example`),
  });
  const input = await address("https://new.example");
  await act(async () => focused("exclude-memory-site", input));
  expect(mocks.call).not.toHaveBeenCalled();
  expect(host.textContent).toContain("100 sites");
});
it("Allow publishes exact original origin removal and refuses unrelated focus", async () => {
  await mount();
  expect(() => invokeScopedControl("allow-memory-site")).toThrow("focused");
  await act(async () => button("Allow").click());
  expect(mocks.call).toHaveBeenCalledWith(
    "workspaces.memory.set",
    expect.objectContaining({ excludedOrigins: [], expectedRevision: 1 }),
  );
});
it("synchronous reservation refuses duplicate pending submission", async () => {
  await mount();
  await address("https://new.example");
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const input = host.querySelector<HTMLInputElement>("input")!;
  input.focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("exclude-memory-site") as Promise<unknown>;
  });
  expect(() =>
    invokeScopedControl("exclude-memory-site", { nativeInputEvent: new Event("submit") }),
  ).toThrow();
  expect(mocks.call).toHaveBeenCalledOnce();
  await act(async () =>
    finish({ ...memory(2), excludedOrigins: [...memory().excludedOrigins, "https://new.example"] }),
  );
  await completion;
});
it("held old save cannot erase fresh address, clear fresh busy or deliver after disable roundtrip", async () => {
  await mount();
  await address("https://old.example");
  const finishes: Array<(value: any) => void> = [];
  mocks.call.mockImplementation(() => new Promise((resolve) => finishes.push(resolve)));
  let old!: Promise<unknown>;
  await act(async () => {
    old = focused("exclude-memory-site", host.querySelector("input")!) as Promise<unknown>;
  });
  await mount(memory(), true);
  await mount();
  await address("https://fresh.example");
  let fresh!: Promise<unknown>;
  await act(async () => {
    fresh = focused("exclude-memory-site", host.querySelector("input")!) as Promise<unknown>;
  });
  const ack = { ...memory(2), excludedOrigins: ["https://old.example"] };
  await act(async () => finishes[0]!(ack));
  await expect(old).resolves.toBe(ack);
  expect(host.querySelector<HTMLInputElement>("input")!.value).toBe("https://fresh.example");
  expect(host.textContent).toContain("Updating exclusions");
  expect(mocks.saved).not.toHaveBeenCalled();
  await act(async () => finishes[1]!({ ...memory(2), excludedOrigins: ["https://fresh.example"] }));
  await fresh;
  expect(mocks.saved).toHaveBeenCalledOnce();
});
it("actual unique Space A→B→A, same-revision snapshot and Private changes retire old failure delivery", async () => {
  await mount();
  let fail!: (reason: unknown) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((_, reject) => {
        fail = reject;
      }),
  );
  button("Allow").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("allow-memory-site") as Promise<unknown>;
  });
  const reason = new Error("Original protected backend error");
  const rejected = completion.catch((value) => value);
  mocks.state.layout.spaces[0] = { id: "replacement", workspaceId: "wa" };
  await mount();
  mocks.state.layout.spaces[0] = { id: "original-space", workspaceId: "wa" };
  await mount();
  await mount({ ...memory(), content: "New same-revision content" });
  mocks.privateMode = true;
  await mount();
  mocks.privateMode = false;
  await mount();
  await act(async () => fail(reason));
  expect(await rejected).toBe(reason);
  reportCommandCompletionFailure(completion, reason, mocks.errors);
  expect(mocks.errors).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain(reason.message);
  expect(mocks.saved).not.toHaveBeenCalled();
});
it("duplicate mapping and disabled/Private direct commands cannot borrow authority", async () => {
  await mount(memory(), true);
  const summary = host.querySelector("summary")!;
  summary.focus();
  expect(() => invokeScopedControl("toggle-memory-exclusions")).toThrow("Space changed");
  await mount();
  mocks.state.layout.archivedSpaces = [{ id: "duplicate", workspaceId: "wa" }];
  await mount();
  summary.focus();
  expect(() => invokeScopedControl("toggle-memory-exclusions")).toThrow("Space changed");
  mocks.privateMode = true;
  await mount();
  expect(() => invokeScopedControl("toggle-memory-exclusions")).toThrow();
  expect(mocks.call).not.toHaveBeenCalled();
});
it("active real failure exposes Retry and genuine current reload acknowledgement", async () => {
  await mount();
  const reason = new Error("Actual revision conflict");
  mocks.call.mockRejectedValueOnce(reason);
  await act(async () => button("Allow").click());
  expect(host.textContent).toContain(reason.message);
  expect(mocks.errors).toHaveBeenCalledWith(reason);
  const ack = memory(3);
  mocks.call.mockResolvedValueOnce(ack);
  await act(async () => button("Reload saved memory").click());
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.get", { workspaceId: "wa" });
  expect(mocks.saved).toHaveBeenCalledWith(ack);
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("retired held reload returns original ACK without publishing another Space's snapshot", async () => {
  await mount();
  mocks.call.mockRejectedValueOnce(new Error("Current conflict"));
  await act(async () => button("Allow").click());
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = focused("reload-memory-exclusions", button("Reload saved memory")) as Promise<unknown>;
  });
  await mount({ ...memory(), content: "Same revision replacement" });
  const ack = memory(4);
  await act(async () => finish(ack));
  await expect(completion).resolves.toBe(ack);
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("foreign returned workspace refuses actual delivery and preserves rejection rather than fabricating an ACK", async () => {
  await mount();
  mocks.call.mockResolvedValue({ ...memory(2), workspaceId: "foreign" });
  await act(async () => button("Allow").click());
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(host.textContent).toContain("reply changed Space or revision");
  expect(mocks.errors).toHaveBeenCalledOnce();
});
