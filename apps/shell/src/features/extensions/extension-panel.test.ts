// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from "vitest";
import type { HostMethodResult } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { closeExtensionPanel, extensionPanel, installExtensionPanel } from "./extension-panel";
vi.mock("../../bridge", () => ({
  bridge: {
    privateMode: false,
    windowKind: "normal",
    windowId: "local",
    extensionSidePanel: vi.fn(),
    onSidePanel: vi.fn(),
  },
}));
vi.mock("../../store", async () => {
  const { createStore } = await import("zustand/vanilla");
  return { useStore: createStore(() => ({ railOpen: false, railView: "conversations", toast: vi.fn() })) };
});
const panel: NonNullable<HostMethodResult<"extensionSidePanel">> = {
  extensionId: "fixture",
  windowId: "local",
  pageId: "page",
  contentId: "actual-guest",
  title: "Fixture",
  open: true,
};
beforeEach(() => {
  vi.resetAllMocks();
  bridge.privateMode = false;
  extensionPanel.setState({ panel: null });
  useStore.setState({ railOpen: false });
});
it("filters Profile broadcasts by window and ignores a stale describe after an actual close event", async () => {
  let event: ((value: typeof panel) => void) | undefined;
  let describe: ((value: typeof panel) => void) | undefined;
  const stop = vi.fn();
  vi.mocked(bridge.onSidePanel).mockImplementation((callback) => {
    event = callback;
    return stop;
  });
  vi.mocked(bridge.extensionSidePanel).mockImplementation(
    () =>
      new Promise((resolve) => {
        describe = resolve;
      }),
  );
  const cleanup = installExtensionPanel();
  event?.({ ...panel, windowId: "other" });
  expect(extensionPanel.getState().panel).toBeNull();
  event?.(panel);
  expect(useStore.getState().railOpen).toBe(true);
  event?.({ ...panel, open: false, contentId: null } as typeof panel);
  describe?.(panel);
  await Promise.resolve();
  expect(extensionPanel.getState().panel).toBeNull();
  cleanup?.();
  expect(stop).toHaveBeenCalledOnce();
});
it("closes the native guest when the rail is hidden and waits for the native reply", async () => {
  vi.mocked(bridge.onSidePanel).mockReturnValue(vi.fn());
  vi.mocked(bridge.extensionSidePanel).mockResolvedValueOnce(panel).mockResolvedValue(null);
  const cleanup = installExtensionPanel();
  await Promise.resolve();
  expect(extensionPanel.getState().panel?.contentId).toBe("actual-guest");
  useStore.setState({ railOpen: false });
  await Promise.resolve();
  expect(bridge.extensionSidePanel).toHaveBeenCalledWith("close");
  expect(extensionPanel.getState().panel).toBeNull();
  cleanup?.();
});
it("never installs an extension guest in a private window", () => {
  bridge.privateMode = true;
  expect(installExtensionPanel()).toBeUndefined();
  expect(bridge.extensionSidePanel).not.toHaveBeenCalled();
  expect(bridge.onSidePanel).not.toHaveBeenCalled();
});

it("preserves a replacement native guest when an older rail close reply arrives", async () => {
  let event!: (value: typeof panel) => void;
  let reply!: (value: null) => void;
  vi.mocked(bridge.onSidePanel).mockImplementation((callback) => {
    event = callback;
    return vi.fn();
  });
  vi.mocked(bridge.extensionSidePanel)
    .mockResolvedValueOnce(panel)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          reply = resolve;
        }),
    );
  const cleanup = installExtensionPanel();
  await Promise.resolve();
  useStore.setState({ railOpen: false });
  const replacement = { ...panel, contentId: "replacement-guest" };
  event(replacement);
  reply(null);
  await Promise.resolve();
  expect(extensionPanel.getState().panel).toBe(replacement);
  cleanup?.();
});
it("does not clear a new boot's panel when a disposed boot's close reply arrives", async () => {
  let reply!: (value: null) => void;
  const replacement = { ...panel, contentId: "new-boot-guest" };
  vi.mocked(bridge.onSidePanel).mockReturnValue(vi.fn());
  vi.mocked(bridge.extensionSidePanel)
    .mockResolvedValueOnce(panel)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          reply = resolve;
        }),
    )
    .mockResolvedValueOnce(replacement);
  const stopOld = installExtensionPanel();
  await Promise.resolve();
  useStore.setState({ railOpen: false });
  stopOld?.();
  const stopNew = installExtensionPanel();
  await Promise.resolve();
  reply(null);
  await Promise.resolve();
  expect(extensionPanel.getState().panel).toBe(replacement);
  stopNew?.();
});
it("uses the same replacement guard for the registered close command", async () => {
  let reply!: (value: null) => void;
  vi.mocked(bridge.extensionSidePanel).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        reply = resolve;
      }),
  );
  extensionPanel.setState({ panel });
  const closing = closeExtensionPanel();
  const replacement = { ...panel, contentId: "command-replacement" };
  extensionPanel.setState({ panel: replacement });
  reply(null);
  await closing;
  expect(extensionPanel.getState().panel).toBe(replacement);
});
