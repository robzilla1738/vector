import { expect, it, vi } from "vitest";
import { desktopContextDefaults, type DesktopContextNativeStatus } from "@aux/contracts/desktop-context";
import { DesktopContextNativeAdapter } from "../../apps/runtime/src/services/desktop-context-native.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
it("binds an explicit configure to the native consent revision independently of restored runtime settings", async () => {
  const status: DesktopContextNativeStatus = {
    supported: true,
    phase: "off",
    accessibilityTrusted: false,
    ocrSupported: true,
    pickerGrantActive: false,
    leaseId: null,
    configurationRevision: 17,
    consentRevision: 40,
    dropped: 0,
    reason: "none",
  };
  const method = vi.fn(async (input) => ({ op: input.op, status }));
  const adapter = new DesktopContextNativeAdapter(
    { desktopContext: method } as unknown as NativeBridge,
    async () => true,
  );
  const reset = desktopContextDefaults();
  await adapter.configure({ ...reset, revision: 1 }, "original-window");
  expect(method.mock.calls).toEqual([
    [{ op: "status" }],
    [
      {
        op: "configure",
        settings: { ...reset, revision: 1 },
        token: "original-window",
        expectedConsentRevision: 40,
      },
    ],
  ]);
  method.mockClear();
  await adapter.attach(reset);
  expect(method).toHaveBeenCalledExactlyOnceWith({ op: "attach", settings: reset });
});
it("refuses malformed or unavailable native consent before configuring", async () => {
  const method = vi.fn(async () => ({ op: "status", status: { consentRevision: -1 } }));
  const adapter = new DesktopContextNativeAdapter(
    { desktopContext: method } as unknown as NativeBridge,
    async () => true,
  );
  await expect(adapter.configure(desktopContextDefaults(), "original-window")).rejects.toThrow();
  expect(method).toHaveBeenCalledTimes(1);
  const unavailable = new DesktopContextNativeAdapter(
    { desktopContext: method } as unknown as NativeBridge,
    async () => false,
  );
  await expect(unavailable.configure(desktopContextDefaults(), "original-window")).rejects.toMatchObject({
    code: "backend_unavailable",
  });
  expect(method).toHaveBeenCalledTimes(1);
});
