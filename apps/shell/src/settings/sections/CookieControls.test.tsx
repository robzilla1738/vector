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

it.each([true, false])(
  "shows Chromium's saved third-party cookie setting after choosing block=%s",
  async (block) => {
    const read = vi
      .spyOn(bridge, "cookieControls")
      .mockResolvedValueOnce({ blockThirdParty: !block, managed: false })
      .mockResolvedValueOnce({ blockThirdParty: block, managed: false });
    const save = vi.spyOn(bridge, "setCookieControls").mockResolvedValue(block);
    const host = document.createElement("div");
    const root = createRoot(host);
    try {
      await act(async () => root.render(<CookieControlsSetting active />));
      const control = host.querySelector<HTMLSelectElement>(
        'select[aria-label="Allow third-party cookies"]',
      )!;
      expect(control.value).toBe(block ? "allow" : "block");
      await act(async () => {
        control.value = block ? "block" : "allow";
        control.dispatchEvent(new Event("change", { bubbles: true }));
      });
      expect(save).toHaveBeenCalledWith(block);
      expect(read).toHaveBeenCalledTimes(2);
      expect(control.value).toBe(block ? "block" : "allow");
    } finally {
      await act(async () => root.unmount());
      vi.restoreAllMocks();
    }
  },
);

it("does not offer changes to a policy-managed cookie setting", async () => {
  vi.spyOn(bridge, "cookieControls").mockResolvedValue({ blockThirdParty: true, managed: true });
  const save = vi.spyOn(bridge, "setCookieControls");
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CookieControlsSetting active />));
    expect(
      host.querySelector<HTMLSelectElement>('select[aria-label="Allow third-party cookies"]')?.disabled,
    ).toBe(true);
    expect(host.textContent).toContain("Managed by your organization");
    expect(save).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});
