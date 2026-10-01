import { beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { extensionInventory, extensionOperation, refreshExtensions } from "./extension-inventory";
vi.mock("../../bridge", () => ({ bridge: { extensions: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks();
  extensionInventory.setState({ items: [], busy: false, loading: true, error: "", message: "" });
  vi.mocked(bridge.extensions).mockResolvedValue([]);
});
it("rejects an older inventory fetch after an acknowledged removal refresh", async () => {
  let finish: ((value: Awaited<ReturnType<typeof bridge.extensions>>) => void) | undefined;
  vi.mocked(bridge.extensions).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const initial = refreshExtensions();
  await extensionOperation(async () => true, "Removed.");
  finish?.([
    {
      key: "stale",
      name: "Stale",
      version: "1",
      enabled: true,
      source: "environment",
      managed: true,
      loaded: true,
      permissions: [],
    },
  ]);
  await initial;
  expect(extensionInventory.getState().items).toEqual([]);
  expect(extensionInventory.getState().message).toBe("Removed.");
});
it("keeps native operations serial until the actual acknowledgement and resets busy on rejection", async () => {
  let reject: ((error: Error) => void) | undefined;
  const first = extensionOperation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
    "Installed.",
  );
  expect(extensionInventory.getState().busy).toBe(true);
  const second = vi.fn();
  await expect(extensionOperation(second, "Other.")).rejects.toThrow("still running");
  expect(second).not.toHaveBeenCalled();
  reject?.(new Error("Native installation failed"));
  await expect(first).rejects.toThrow("Native installation failed");
  expect(extensionInventory.getState().busy).toBe(false);
});
it("does not announce successful installation when the native folder picker is cancelled", async () => {
  await extensionOperation(async () => null, "Installed.");
  expect(extensionInventory.getState().message).toBe("");
});
