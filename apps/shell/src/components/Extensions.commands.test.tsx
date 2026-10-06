// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { bridge, type BrowserExtension } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { extensionInventory } from "../features/extensions/extension-inventory";
import { Extensions } from "./Extensions";
const policy = vi.hoisted(() => ({ available: true }));
vi.mock("../feature-availability", () => ({ featureAvailable: () => policy.available, featureVisible: () => policy.available, featureStage: () => policy.available ? "on" : "off" }));
vi.mock("../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../bridge")>()),
  inNativeHost: true,
}));
vi.mock("../use-feature", () => ({
  useFeature: () => policy.available,
  featureStage: () => (policy.available ? "on" : "off"),
}));
const initial = useStore.getState(),
  originalWindow = bridge.windowId,
  originalKind = bridge.windowKind,
  originalPrivate = bridge.privateMode;
const item: BrowserExtension = {
  key: "original",
  name: "Fixture extension",
  version: "1",
  permissions: ["tabs"],
  enabled: true,
  loaded: true,
  managed: true,
  source: "managed",
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, items: BrowserExtension[];
const ids = {
  permissions: "toggle-extension-permissions",
  review: "review-extension-removal",
  cancel: "cancel-extension-removal",
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  policy.available = true;
  bridge.windowId = "window-original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  useStore.setState({ ...initial, connected: false, toasts: [] }, true);
  items = [{ ...item }];
  extensionInventory.setState({ items, busy: false, loading: false, error: "", message: "" });
  vi.spyOn(bridge, "extensions").mockImplementation(async () => items);
  vi.spyOn(bridge, "onExtensionActionsChanged").mockReturnValue(() => {});
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  extensionInventory.setState({ items: [], busy: false, loading: true, error: "", message: "" });
  bridge.windowId = originalWindow;
  bridge.windowKind = originalKind;
  bridge.privateMode = originalPrivate;
  policy.available = true;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render() {
  await act(async () => root.render(<Extensions />));
}
function button(id: string) {
  return host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
}
async function action(id: string) {
  let completion!: Promise<unknown>;
  await act(async () => {
    button(id).focus();
    completion = executeCommand(id);
    void completion.catch(() => {});
  });
  return { completion };
}
function confirm() {
  return host.querySelector<HTMLButtonElement>('[data-command-id="confirm-extension-removal"]')!;
}
it("three original local actions use actual normal scoped IDs with offline availability", async () => {
  await render();
  for (const id of Object.values(ids))
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
    });
  await action(ids.review);
  expect(host.querySelector('[role="alertdialog"]')?.textContent).toContain("Remove Fixture extension?");
  await action(ids.cancel);
  expect(host.querySelector('[role="alertdialog"]')).toBeNull();
  expect(useStore.getState().connected).toBe(false);
});
it("summary native click and remapped disclosure toggle exactly once", async () => {
  await render();
  const summary = button(ids.permissions),
    details = summary.parentElement as HTMLDetailsElement;
  await act(async () => summary.click());
  expect(details.open).toBe(true);
  useStore.setState({
    settings: { shortcutOverrides: { [ids.permissions]: [{ key: "p", command: true, alt: true }] } },
  });
  await act(async () => {
    summary.focus();
    expect(dispatchShortcut({ key: "p", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(details.open).toBe(false);
});
it("refused summary prevents browser default and observed foreign owner ABA stays retired", async () => {
  await render();
  const summary = button(ids.permissions),
    details = summary.parentElement as HTMLDetailsElement;
  bridge.windowId = "foreign";
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => summary.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(details.open).toBe(false);
  bridge.windowId = "window-original";
  await expect((await action(ids.permissions)).completion).rejects.toThrow();
  expect(details.open).toBe(false);
  expect(useStore.getState().toasts).toEqual([]);
});
it("original inventory replacement before dispatch cannot review stale row", async () => {
  await render();
  let first!: Promise<unknown>, second!: Promise<unknown>;
  const original = items;
  await act(async () => {
    button(ids.review).focus();
    extensionInventory.setState({ items: [{ ...item, key: "replacement" }] });
    first = executeCommand(ids.review);
    void first.catch(() => {});
    extensionInventory.setState({ items: original });
    second = executeCommand(ids.review);
    void second.catch(() => {});
  });
  await expect(first).rejects.toThrow();
  await expect(second).rejects.toThrow();
  expect(host.querySelector('[role="alertdialog"]')).toBeNull();
});
it("actual native removal ACK refreshes inventory and closes only original target", async () => {
  await render();
  vi.spyOn(bridge, "removeExtension").mockImplementation(async () => {
    items = [];
    return true;
  });
  await action(ids.review);
  await act(async () => confirm().click());
  expect(bridge.removeExtension).toHaveBeenCalledExactlyOnceWith("original");
  expect(host.querySelector('[role="alertdialog"]')).toBeNull();
  expect(extensionInventory.getState().message).toBe("Extension removed.");
  expect(extensionInventory.getState().busy).toBe(false);
});
it("current original native rejection remains visible with same confirmation", async () => {
  await render();
  const reason = new Error("Native fixture refusal");
  vi.spyOn(bridge, "removeExtension").mockRejectedValue(reason);
  await action(ids.review);
  await act(async () => confirm().click());
  expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
  expect(extensionInventory.getState().error).toBe(reason.message);
  expect(extensionInventory.getState().busy).toBe(false);
});
it("held old native removal ACK cannot close newer review target", async () => {
  await render();
  let resolve!: (value: boolean) => void;
  vi.spyOn(bridge, "removeExtension").mockImplementation(
    () =>
      new Promise((yes) => {
        resolve = yes;
      }),
  );
  await action(ids.review);
  await act(async () => confirm().click());
  expect(extensionInventory.getState().busy).toBe(true);
  await act(async () => {
    extensionInventory.setState({ busy: false });
  });
  await action(ids.cancel);
  items = [{ ...item, key: "new", name: "New extension" }];
  await act(async () => extensionInventory.setState({ items }));
  await action(ids.review);
  await act(async () => resolve(true));
  expect(host.querySelector('[role="alertdialog"]')?.textContent).toContain("Remove New extension?");
  expect(bridge.removeExtension).toHaveBeenCalledExactlyOnceWith("original");
});
it("held removal failure after observed foreign owner cannot publish local error", async () => {
  await render();
  let reject!: (reason: unknown) => void;
  vi.spyOn(bridge, "removeExtension").mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  await action(ids.review);
  await act(async () => confirm().click());
  bridge.windowId = "foreign";
  await act(async () => button(ids.permissions).click());
  bridge.windowId = "window-original";
  const reason = new Error("Old native rejection");
  await act(async () => reject(reason));
  expect(extensionInventory.getState().error).toBe("");
  expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
});
it("hidden, Private, disabled managed and unavailable controls retain original admission", async () => {
  await render();
  button(ids.review).hidden = true;
  await expect((await action(ids.review)).completion).rejects.toThrow();
  button(ids.review).hidden = false;
  bridge.privateMode = true;
  await expect((await action(ids.review)).completion).rejects.toThrow();
  bridge.privateMode = false;
  await act(async () => root.render(<Extensions />));
  policy.available = false;
  await expect((await action(ids.permissions)).completion).rejects.toThrow();
  await render();
  expect(host.textContent).toBe("");
});

it("actual same-tick native removal remains serial before disabled render", async () => {
  await render();
  let resolve!: (value: boolean) => void;
  vi.spyOn(bridge, "removeExtension").mockImplementation(
    () =>
      new Promise((yes) => {
        resolve = yes;
      }),
  );
  await action(ids.review);
  const original = confirm();
  await act(async () => {
    original.click();
    original.click();
  });
  expect(bridge.removeExtension).toHaveBeenCalledExactlyOnceWith("original");
  expect(extensionInventory.getState().busy).toBe(true);
  await act(async () => resolve(true));
  expect(host.querySelector('[role="alertdialog"]')).toBeNull();
});

it("actual remapped confirmation delivers exact reviewed target through existing native command", async () => {
  await render();
  vi.spyOn(bridge, "removeExtension").mockResolvedValue(true);
  await action(ids.review);
  await act(async () =>
    useStore.setState({
      settings: {
        shortcutOverrides: { "confirm-extension-removal": [{ key: "x", command: true, alt: true }] },
      },
    }),
  );
  await act(async () => {
    confirm().focus();
    expect(dispatchShortcut({ key: "x", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(bridge.removeExtension).toHaveBeenCalledExactlyOnceWith("original");
  expect(host.querySelector('[role="alertdialog"]')).toBeNull();
});
it("actual scoped confirmation preserves original rejected object and suppresses duplicate global remap error", async () => {
  await render();
  const reason = new Error("Original confirmation rejection");
  vi.spyOn(bridge, "removeExtension").mockRejectedValue(reason);
  await action(ids.review);
  const completion = (await action("confirm-extension-removal")).completion;
  await expect(completion).rejects.toBe(reason);
  expect(extensionInventory.getState().error).toBe(reason.message);
  expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
  await act(async () =>
    useStore.setState({
      settings: {
        shortcutOverrides: { "confirm-extension-removal": [{ key: "x", command: true, alt: true }] },
      },
    }),
  );
  await act(async () => {
    confirm().focus();
    expect(dispatchShortcut({ key: "x", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(extensionInventory.getState().error).toBe(reason.message);
  expect(useStore.getState().toasts).toEqual([]);
});
it("stale inventory confirmation refuses before native removal, unknown target remains reviewed", async () => {
  await render();
  const native = vi.spyOn(bridge, "removeExtension").mockResolvedValue(true);
  await action(ids.review);
  let completion!: Promise<unknown>;
  await act(async () => {
    confirm().focus();
    extensionInventory.setState({ items: [{ ...item }] });
    completion = executeCommand("confirm-extension-removal");
    void completion.catch(() => {});
  });
  await expect(completion).rejects.toThrow("original extension removal review");
  expect(native).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
});
it("held admitted confirmation after foreign observation retains rejection without new-context error", async () => {
  await render();
  let reject!: (reason: unknown) => void;
  vi.spyOn(bridge, "removeExtension").mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  await action(ids.review);
  const completion = (await action("confirm-extension-removal")).completion;
  bridge.windowId = "foreign";
  await act(async () => button(ids.permissions).click());
  bridge.windowId = "window-original";
  const reason = new Error("Retained original reason");
  await act(async () => reject(reason));
  await expect(completion).rejects.toBe(reason);
  expect(extensionInventory.getState().error).toBe("");
  expect(useStore.getState().toasts).toEqual([]);
});

it("scoped confirmation retains actual native ACK and rejects unknown false ACK", async () => {
  await render();
  vi.spyOn(bridge, "removeExtension").mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  await action(ids.review);
  await expect((await action("confirm-extension-removal")).completion).resolves.toBe(true);
  await action(ids.review);
  await expect((await action("confirm-extension-removal")).completion).rejects.toThrow(
    "Chromium could not complete this extension operation.",
  );
  expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
  expect(extensionInventory.getState().error).toBe("Chromium could not complete this extension operation.");
  expect(useStore.getState().toasts).toEqual([]);
});
