import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  windowKind: "normal",
  privateMode: false,
  routedOpens: vi.fn(async () => []),
  off: vi.fn(),
  onRoutedOpen: vi.fn(),
  resyncTabs: vi.fn(async () => {}),
  refreshSpaces: vi.fn(async () => {}),
  browserProfiles: vi.fn(async () => []),
  errToast: vi.fn(),
}));
vi.mock("../../bridge", () => ({
  bridge: {
    get windowKind() {
      return mocks.windowKind;
    },
    get privateMode() {
      return mocks.privateMode;
    },
    routedOpens: mocks.routedOpens,
    onRoutedOpen: mocks.onRoutedOpen,
    browserProfiles: mocks.browserProfiles,
  },
}));
vi.mock("../../store", () => ({
  useStore: { getState: () => mocks },
  errToast: mocks.errToast,
  toast: vi.fn(),
}));
vi.mock("../../commands", () => ({ executeCommand: vi.fn() }));
vi.mock("./slots", () => ({ RoutingSettings: () => null, RoutingOverlay: () => null }));
import { mount } from "./mount";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.windowKind = "normal";
  mocks.privateMode = false;
  mocks.onRoutedOpen.mockReturnValue(mocks.off);
});
it.each(["quick-ask", "little", "private"])("does not drain regular-window receipts in %s", (kind) => {
  mocks.windowKind = kind;
  expect(mount.boot?.()).toBeUndefined();
  expect(mocks.routedOpens).not.toHaveBeenCalled();
  expect(mocks.onRoutedOpen).not.toHaveBeenCalled();
});
it("retains receipt synchronization and cleanup in a regular window", async () => {
  const stop = mount.boot?.();
  await vi.waitFor(() => expect(mocks.browserProfiles).toHaveBeenCalledOnce());
  expect(mocks.routedOpens).toHaveBeenCalledOnce();
  expect(mocks.resyncTabs).toHaveBeenCalledOnce();
  expect(mocks.refreshSpaces).toHaveBeenCalledOnce();
  stop?.();
  expect(mocks.off).toHaveBeenCalledOnce();
  expect(mocks.errToast).not.toHaveBeenCalled();
});
