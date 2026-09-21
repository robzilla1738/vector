import { beforeAll, beforeEach, expect, it, vi } from "vitest";
import type { BaseWindow } from "electron";

const native = vi.hoisted(() => ({ setEnabled: vi.fn() }));
vi.mock("node:module", () => ({ createRequire: () => () => native }));
let setWindowMaterial: typeof import("../../apps/desktop/main/window-material").setWindowMaterial;
beforeAll(async () => {
  const platform = Object.getOwnPropertyDescriptor(process, "platform")!;
  Object.defineProperty(process, "platform", { ...platform, value: "darwin" });
  try { ({ setWindowMaterial } = await import("../../apps/desktop/main/window-material")); }
  finally { Object.defineProperty(process, "platform", platform); }
});
beforeEach(() => native.setEnabled.mockReset().mockReturnValue(true));
function fixture() {
  const handle = Buffer.alloc(8);
  const window = { getNativeWindowHandle: () => handle, setVibrancy: vi.fn() };
  return { handle, window, host: window as unknown as BaseWindow };
}
it("removes older vibrancy before installing glass", () => {
  const { handle, window, host } = fixture();
  setWindowMaterial(host, "liquid-glass");
  expect(window.setVibrancy).toHaveBeenCalledExactlyOnceWith(null);
  expect(native.setEnabled).toHaveBeenCalledExactlyOnceWith(handle, true);
  expect(window.setVibrancy.mock.invocationCallOrder[0]).toBeLessThan(native.setEnabled.mock.invocationCallOrder[0]!);
});
it("falls back to titlebar material when Liquid Glass is unavailable", () => {
  const { window, host } = fixture();
  native.setEnabled.mockReturnValue(false);
  setWindowMaterial(host, "liquid-glass");
  expect(window.setVibrancy).toHaveBeenLastCalledWith("titlebar");
});
it.each([null, "sidebar", "under-window", "titlebar"] as const)("unwraps glass before applying %s", material => {
  const { handle, window, host } = fixture();
  setWindowMaterial(host, material);
  expect(native.setEnabled).toHaveBeenCalledExactlyOnceWith(handle, false);
  expect(window.setVibrancy).toHaveBeenCalledExactlyOnceWith(material);
  expect(native.setEnabled.mock.invocationCallOrder[0]).toBeLessThan(window.setVibrancy.mock.invocationCallOrder[0]!);
});
