// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DefaultBrowserSetting } from "./components/DefaultBrowserSetting";
import { invokeScopedControl } from "./scoped-control-commands";
import { reportCommandCompletionFailure } from "./command-completion";
import { COMMANDS } from "@aux/contracts";
const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  set: vi.fn(),
  errors: vi.fn(),
  privateMode: false,
  windowId: "original-window",
  native: true,
}));
vi.mock("./bridge", () => ({
  get inNativeHost() {
    return mocks.native;
  },
  bridge: {
    get privateMode() {
      return mocks.privateMode;
    },
    get windowId() {
      return mocks.windowId;
    },
    defaultBrowser: mocks.read,
    setDefaultBrowser: mocks.set,
  },
}));
vi.mock("./store", () => ({ errToast: mocks.errors }));
vi.mock("./commands", async () => {
  const { invokeScopedControl } = await import("./scoped-control-commands");
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
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  mocks.read.mockReset().mockResolvedValue({ isDefault: false });
  mocks.set.mockReset().mockResolvedValue({ isDefault: true });
  mocks.errors.mockReset();
  mocks.privateMode = false;
  mocks.windowId = "original-window";
  mocks.native = true;
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
async function mount() {
  await act(async () => root.render(<DefaultBrowserSetting />));
}
function original() {
  const button = host.querySelector<HTMLButtonElement>("button")!;
  button.focus();
  return button;
}
it("actual normal-only remappable registered action requires original focused control and preserves original measured ACK", async () => {
  const rows = COMMANDS.filter((row) => row.id === "set-default-browser");
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    handler: "shell",
    windows: ["normal"],
    focusShell: true,
    palette: false,
    bindings: [],
    intercept: true,
  });
  await mount();
  expect(() => invokeScopedControl("set-default-browser")).toThrow("focused");
  original();
  const ack = { isDefault: false };
  mocks.set.mockResolvedValue(ack);
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("set-default-browser") as Promise<unknown>;
  });
  await expect(completion).resolves.toBe(ack);
  expect(mocks.set).toHaveBeenCalledExactlyOnceWith();
  expect(host.textContent).toContain("system did not confirm");
  expect(host.textContent).not.toContain("is your default browser");
});
it("does not authorize change while original OS state is unknown or from non-native/Private rendering", async () => {
  let finish!: (value: any) => void;
  mocks.read.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await mount();
  original();
  expect(() => invokeScopedControl("set-default-browser")).toThrow();
  expect(mocks.set).not.toHaveBeenCalled();
  mocks.privateMode = true;
  await mount();
  await act(async () => finish({ isDefault: false }));
  expect(host.querySelector("button")).toBeNull();
  mocks.privateMode = false;
  mocks.native = false;
  await mount();
  expect(host.textContent).toBe("");
  expect(mocks.set).not.toHaveBeenCalled();
});
it("one synchronous original reservation blocks duplicate mutation before React commits busy", async () => {
  await mount();
  const button = original();
  let finish!: (value: any) => void;
  mocks.set.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("set-default-browser") as Promise<unknown>;
    expect(() => invokeScopedControl("set-default-browser")).toThrow("current");
  });
  expect(mocks.set).toHaveBeenCalledOnce();
  const ack = { isDefault: true };
  await act(async () => finish(ack));
  await expect(completion).resolves.toBe(ack);
  expect(host.contains(button)).toBe(false);
  expect(host.textContent).toContain("Aux is your default browser");
});
it("Private roundtrip irreversibly retires original successful request without erasing fresh busy", async () => {
  await mount();
  original();
  const finishes: Array<(value: any) => void> = [];
  mocks.set.mockImplementation(() => new Promise((resolve) => finishes.push(resolve)));
  let old!: Promise<unknown>;
  await act(async () => {
    old = invokeScopedControl("set-default-browser") as Promise<unknown>;
  });
  mocks.privateMode = true;
  await mount();
  mocks.privateMode = false;
  await mount();
  original();
  let fresh!: Promise<unknown>;
  await act(async () => {
    fresh = invokeScopedControl("set-default-browser") as Promise<unknown>;
  });
  const ack = { isDefault: true };
  await act(async () => finishes[0]!(ack));
  await expect(old).resolves.toBe(ack);
  expect(host.textContent).toContain("Setting…");
  expect(host.textContent).not.toContain("Aux is your default browser");
  await act(async () => finishes[1]!({ isDefault: false }));
  await fresh;
  expect(host.textContent).toContain("system did not confirm");
});
it("original window replacement/unmount keeps rejection identity and suppresses only retired delivery", async () => {
  await mount();
  original();
  let fail!: (reason: unknown) => void;
  mocks.set.mockImplementation(
    () =>
      new Promise((_, reject) => {
        fail = reject;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("set-default-browser") as Promise<unknown>;
  });
  const originalError = new Error("Original OS failure");
  const failed = completion.catch((reason) => reason);
  mocks.windowId = "replacement-window";
  await mount();
  await act(async () => fail(originalError));
  expect(await failed).toBe(originalError);
  reportCommandCompletionFailure(completion, originalError, mocks.errors);
  expect(mocks.errors).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain(originalError.message);
});
it("focus reads retain newest actual OS reply and cannot overwrite completed mutation with an older read", async () => {
  await mount();
  let read!: (value: any) => void;
  mocks.read.mockImplementation(
    () =>
      new Promise((resolve) => {
        read = resolve;
      }),
  );
  await act(async () => window.dispatchEvent(new Event("focus")));
  expect(original().disabled).toBe(true);
  await act(async () => read({ isDefault: false }));
  original();
  let set!: (value: any) => void;
  mocks.set.mockImplementation(
    () =>
      new Promise((resolve) => {
        set = resolve;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("set-default-browser") as Promise<unknown>;
  });
  await act(async () => window.dispatchEvent(new Event("focus")));
  await act(async () => set({ isDefault: true }));
  await completion;
  await act(async () => read({ isDefault: false }));
  expect(host.textContent).toContain("Aux is your default browser");
});
it("active synchronous original native failure preserves error and releases reservation for real retry", async () => {
  await mount();
  const reason = new Error("Original synchronous bridge failure");
  mocks.set.mockImplementationOnce(() => {
    throw reason;
  });
  await act(async () => original().click());
  expect(mocks.errors).toHaveBeenCalledWith(reason);
  expect(host.textContent).toContain(reason.message);
  expect(original().disabled).toBe(false);
  await act(async () => original().click());
  expect(mocks.set).toHaveBeenCalledTimes(2);
  expect(host.textContent).toContain("Aux is your default browser");
});
it("fresh focus read synchronously retires readiness before React commits disabled state", async () => {
  await mount();
  original();
  let finish!: (value: any) => void;
  mocks.read.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
    expect(() => invokeScopedControl("set-default-browser")).toThrow("current");
  });
  expect(mocks.set).not.toHaveBeenCalled();
  await act(async () => finish({ isDefault: false }));
});

it("reports a synchronous initial read failure and retries through the original focus recheck", async () => {
  const reason = new Error("Original initial OS transport <complete diagnostic>");
  mocks.read.mockImplementationOnce(() => { throw reason; });
  await mount();
  expect(host.textContent).toContain(reason.message);
  expect(host.querySelector("complete")).toBeNull();
  expect(original().disabled).toBe(true);
  expect(() => invokeScopedControl("set-default-browser")).toThrow();
  expect(mocks.set).not.toHaveBeenCalled();
  await act(async () => window.dispatchEvent(new Event("focus")));
  expect(mocks.read).toHaveBeenCalledTimes(2);
  expect(original().disabled).toBe(false);
  expect(host.textContent).not.toContain(reason.message);
  expect(mocks.set).not.toHaveBeenCalled();
});

it("retires the original initial-read rejection across window ABA and removes focus retry on unmount", async () => {
  let reject!: (reason: unknown) => void;
  mocks.read.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
  await mount();
  mocks.windowId = "replacement";
  await mount();
  mocks.windowId = "original-window";
  await mount();
  const reason = new Error("Original retired OS transport diagnostic");
  await act(async () => reject(reason));
  expect(host.textContent).not.toContain(reason.message);
  expect(original().disabled).toBe(false);
  expect(mocks.set).not.toHaveBeenCalled();
  expect(mocks.errors).not.toHaveBeenCalled();
  const reads = mocks.read.mock.calls.length;
  await act(async () => root.render(null));
  await act(async () => window.dispatchEvent(new Event("focus")));
  expect(mocks.read).toHaveBeenCalledTimes(reads);
});
