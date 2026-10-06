// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { CookieControlsSetting } from "./CookieControls";

vi.mock("../../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../bridge")>()),
  inNativeHost: true,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("shows Chromium's saved third-party cookie setting after a change", async () => {
  const read = vi
    .spyOn(bridge, "cookieControls")
    .mockResolvedValueOnce({ blockThirdParty: false, managed: false })
    .mockResolvedValueOnce({ blockThirdParty: true, managed: false });
  const save = vi.spyOn(bridge, "setCookieControls").mockResolvedValue(true);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CookieControlsSetting active />));
    const control = host.querySelector<HTMLInputElement>('input[aria-label="Block third-party cookies"]')!;
    expect(control.checked).toBe(false);
    await act(async () => {
      control.click();
    });
    expect(save).toHaveBeenCalledWith(true);
    expect(read).toHaveBeenCalledTimes(2);
    expect(control.checked).toBe(true);
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});

it("does not offer changes to a policy-managed cookie setting", async () => {
  vi.spyOn(bridge, "cookieControls").mockResolvedValue({ blockThirdParty: true, managed: true });
  const save = vi.spyOn(bridge, "setCookieControls");
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CookieControlsSetting active />));
    expect(
      host.querySelector<HTMLInputElement>('input[aria-label="Block third-party cookies"]')?.disabled,
    ).toBe(true);
    expect(host.textContent).toContain("Managed by your organization");
    expect(save).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});
