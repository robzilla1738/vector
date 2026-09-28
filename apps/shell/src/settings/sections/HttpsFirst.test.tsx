// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { HttpsFirstSetting } from "./HttpsFirst";

vi.mock("../../bridge", async importOriginal => ({
  ...await importOriginal<typeof import("../../bridge")>(),
  inNativeHost: true,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("reads and confirms the saved HTTPS-first preference", async () => {
  const read = vi.spyOn(bridge, "httpsUpgrade")
    .mockResolvedValueOnce({ enabled: false, available: true, managed: false })
    .mockResolvedValueOnce({ enabled: true, available: true, managed: false });
  const save = vi.spyOn(bridge, "setHttpsUpgrade").mockResolvedValue(true);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HttpsFirstSetting active />));
    const control = host.querySelector<HTMLInputElement>('input[aria-label="Automatically upgrade eligible HTTP pages"]')!;
    expect(control.checked).toBe(false);
    await act(async () => { control.click(); });
    expect(save).toHaveBeenCalledWith(true);
    expect(read).toHaveBeenCalledTimes(2);
    expect(control.checked).toBe(true);
  } finally { await act(async () => root.unmount()); vi.restoreAllMocks(); }
});

it("keeps a policy-blocked HTTPS-first preference unavailable", async () => {
  vi.spyOn(bridge, "httpsUpgrade").mockResolvedValue({ enabled: false, available: false, managed: true });
  const save = vi.spyOn(bridge, "setHttpsUpgrade");
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HttpsFirstSetting active />));
    const control = host.querySelector<HTMLInputElement>('input[aria-label="Automatically upgrade eligible HTTP pages"]')!;
    expect(control.disabled).toBe(true);
    expect(host.textContent).toContain("Disabled by your organization");
    expect(save).not.toHaveBeenCalled();
  } finally { await act(async () => root.unmount()); vi.restoreAllMocks(); }
});
