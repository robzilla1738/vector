// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts/commands";
const state = vi.hoisted(() => ({
  windowId: "one",
  privateMode: false,
  native: true,
  toast: vi.fn(),
  open: vi.fn(),
}));
vi.mock("./bridge", () => ({
  inNativeHost: state.native,
  bridge: {
    get windowId() {
      return state.windowId;
    },
    get privateMode() {
      return state.privateMode;
    },
    quickAskShortcut: vi.fn(),
    defaultBrowser: vi.fn(),
    setDefaultBrowser: vi.fn(),
  },
}));
vi.mock("./store", () => ({ errToast: state.toast }));
vi.mock("./use-shortcut-label", () => ({ useShortcutLabels: () => () => "⌥Space" }));
vi.mock("./commands", async () => {
  const { invokeScopedControl } = await import("./scoped-control-commands");
  return {
    executeCommand: (id: string, context: object) => {
      try {
        return Promise.resolve(id === "quick-ask" ? state.open(context) : invokeScopedControl(id, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
import { bridge } from "./bridge";
import { invokeScopedControl } from "./scoped-control-commands";
import { QuickAskSetting } from "./components/QuickAskSetting";
import { DefaultBrowserSetting } from "./components/DefaultBrowserSetting";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
const status = { enabled: false, registered: false, error: "" };
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
async function mount() {
  await act(async () => root.render(<QuickAskSetting />));
}
const shortcut = () => host.querySelector<HTMLInputElement>("input")!;
const retry = () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Try again")!;
beforeEach(() => {
  state.windowId = "one";
  state.privateMode = false;
  state.toast.mockReset();
  state.open.mockReset();
  vi.mocked(bridge.quickAskShortcut).mockReset().mockResolvedValue(status);
  vi.mocked(bridge.defaultBrowser).mockReset().mockResolvedValue({ isDefault: false });
  vi.mocked(bridge.setDefaultBrowser).mockReset().mockResolvedValue({ isDefault: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
it("registers exactly two global shortcut actions without a regular-window restriction", () => {
  for (const id of ["toggle-quick-ask-shortcut", "retry-quick-ask-shortcut"]) {
    const rows = COMMANDS.filter((row) => row.id === id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ handler: "shell", feature: "quickAsk", palette: false, bindings: [] });
    expect(rows[0]).not.toHaveProperty("windows");
  }
});
it("uses the original focused checkbox and preserves actual registration failure", async () => {
  await mount();
  vi.mocked(bridge.quickAskShortcut).mockResolvedValue({
    enabled: true,
    registered: false,
    error: "Shortcut occupied by another application.",
  });
  shortcut().focus();
  await act(async () => {
    await invokeScopedControl("toggle-quick-ask-shortcut");
  });
  expect(bridge.quickAskShortcut).toHaveBeenLastCalledWith(true);
  expect(shortcut().checked).toBe(true);
  expect(host.textContent).toContain("Shortcut occupied");
  expect(host.textContent).toContain("Other apps and their contents are not captured.");
  expect(retry()).toBeTruthy();
});
it("retries an actual read failure and reports the original active rejection", async () => {
  vi.mocked(bridge.quickAskShortcut).mockRejectedValueOnce(new Error("Native read failed"));
  await mount();
  const original = new Error("Registration failed");
  vi.mocked(bridge.quickAskShortcut).mockRejectedValue(original);
  await act(async () => retry().click());
  expect(bridge.quickAskShortcut).toHaveBeenLastCalledWith(true);
  expect(state.toast).toHaveBeenCalledWith(original);
  expect(host.textContent).toContain("Registration failed");
});
it("synchronously reserves the original pending toggle", async () => {
  await mount();
  const held = deferred<typeof status>();
  vi.mocked(bridge.quickAskShortcut).mockReturnValue(held.promise);
  shortcut().focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("toggle-quick-ask-shortcut");
    expect(() => invokeScopedControl("toggle-quick-ask-shortcut")).toThrow();
  });
  expect(bridge.quickAskShortcut).toHaveBeenCalledTimes(2);
  await act(async () => {
    held.resolve(status);
    await completion;
  });
});
it("irreversibly retires a pending rejection across original window roundtrip", async () => {
  await mount();
  const held = deferred<typeof status>();
  vi.mocked(bridge.quickAskShortcut).mockReturnValueOnce(held.promise);
  await act(async () => shortcut().click());
  state.windowId = "two";
  await mount();
  state.windowId = "one";
  await mount();
  const original = new Error("Retired protected failure");
  await act(async () => held.reject(original));
  expect(state.toast).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain("Retired protected failure");
  expect(shortcut().disabled).toBe(false);
});
it("preserves global toggle policy in Private while refusing the original Open action", async () => {
  state.privateMode = true;
  await mount();
  const open = [...host.querySelectorAll("button")].find((b) => b.textContent === "Open Quick Ask")!;
  expect(open.disabled).toBe(true);
  expect(shortcut().disabled).toBe(false);
  await act(async () => shortcut().click());
  expect(bridge.quickAskShortcut).toHaveBeenLastCalledWith(true);
  expect(state.open).not.toHaveBeenCalled();
  expect(host.textContent).toContain("regular window");
});
it("uses the existing Open command with the original input event", async () => {
  await mount();
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  expect(state.open).toHaveBeenCalledTimes(1);
  expect(state.open.mock.calls[0]![0].nativeInputEvent).toBeInstanceOf(MouseEvent);
});
it("refuses a remapped shortcut without the original focused control", async () => {
  await mount();
  expect(() => invokeScopedControl("toggle-quick-ask-shortcut")).toThrow();
  expect(bridge.quickAskShortcut).toHaveBeenCalledTimes(1);
});
it("keeps the original successful ACK after Private retirement without overwriting fresh status", async () => {
  await mount();
  const held = deferred<typeof status>();
  vi.mocked(bridge.quickAskShortcut).mockReturnValueOnce(held.promise);
  shortcut().focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("toggle-quick-ask-shortcut");
  });
  state.privateMode = true;
  await mount();
  state.privateMode = false;
  await mount();
  const ack = { enabled: true, registered: true, error: "" };
  await act(async () => {
    held.resolve(ack);
    expect(await completion).toBe(ack);
  });
  expect(shortcut().checked).toBe(false);
  expect(state.toast).not.toHaveBeenCalled();
});
it("preserves the original focused command rejection object", async () => {
  await mount();
  const original = new Error("Native registration rejection");
  vi.mocked(bridge.quickAskShortcut).mockRejectedValueOnce(original);
  shortcut().focus();
  await act(async () => {
    await expect(invokeScopedControl("toggle-quick-ask-shortcut")).rejects.toBe(original);
  });
  expect(host.textContent).toContain(original.message);
});

it("recovers an original synchronous initial transport throw through Try again", async () => {
  const original = new Error("Initial transport unavailable");
  vi.mocked(bridge.quickAskShortcut).mockImplementationOnce(() => {
    throw original;
  });
  await mount();
  expect(host.textContent).toContain(original.message);
  expect(shortcut()).toBeNull();
  const ack = { enabled: true, registered: true, error: "" };
  vi.mocked(bridge.quickAskShortcut).mockResolvedValueOnce(ack);
  await act(async () => retry().click());
  expect(bridge.quickAskShortcut).toHaveBeenLastCalledWith(true);
  expect(shortcut().checked).toBe(true);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(state.toast).not.toHaveBeenCalled();
});

it("keeps the two measured owners independent during a real OS focus read and held shortcut mutation", async () => {
  await act(async () =>
    root.render(
      <>
        <QuickAskSetting />
        <DefaultBrowserSetting />
      </>,
    ),
  );
  const defaultButton = () =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent === "Make Aux the default browser",
    )!;
  const heldShortcut = deferred<typeof status>();
  vi.mocked(bridge.quickAskShortcut).mockReturnValueOnce(heldShortcut.promise);
  shortcut().focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("toggle-quick-ask-shortcut") as Promise<unknown>;
  });
  const heldRead = deferred<{ isDefault: boolean }>();
  vi.mocked(bridge.defaultBrowser).mockReturnValueOnce(heldRead.promise);
  await act(async () => window.dispatchEvent(new Event("focus")));
  expect(shortcut().disabled).toBe(true);
  expect(defaultButton().disabled).toBe(true);
  await act(async () => heldRead.resolve({ isDefault: false }));
  expect(defaultButton().disabled).toBe(false);
  expect(shortcut().disabled).toBe(true);
  const originalAck = { enabled: true, registered: false, error: "Original application owns shortcut" };
  await act(async () => heldShortcut.resolve(originalAck));
  expect(await completion).toBe(originalAck);
  expect(shortcut().disabled).toBe(false);
  expect(shortcut().checked).toBe(true);
  expect(host.textContent).toContain(originalAck.error);
  expect(defaultButton().disabled).toBe(false);
  expect(bridge.setDefaultBrowser).not.toHaveBeenCalled();
});
