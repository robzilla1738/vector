// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { CrashReportingSetting } from "./CrashReporting";

vi.mock("../../bridge", async importOriginal => ({
  ...await importOriginal<typeof import("../../bridge")>(),
  inNativeHost: true,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("keeps upload consent off when the build has no destination", async () => {
  vi.spyOn(bridge, "crashReporting").mockResolvedValue({ available: false, decided: false, consent: false });
  const save = vi.spyOn(bridge, "setCrashReporting");
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CrashReportingSetting active />));
    expect(host.querySelector<HTMLInputElement>('input[aria-label="Send crash reports"]')?.disabled).toBe(true);
    expect(host.textContent).toContain("no crash-report destination");
    expect(save).not.toHaveBeenCalled();
  } finally { await act(async () => root.unmount()); vi.restoreAllMocks(); }
});

it("requires an explicit second action before enabling uploads", async () => {
  vi.spyOn(bridge, "crashReporting")
    .mockResolvedValueOnce({ available: true, decided: false, consent: false })
    .mockResolvedValueOnce({ available: true, decided: true, consent: true });
  const save = vi.spyOn(bridge, "setCrashReporting").mockResolvedValue(true);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CrashReportingSetting active />));
    const control = host.querySelector<HTMLInputElement>('input[aria-label="Send crash reports"]')!;
    await act(async () => { control.click(); });
    expect(save).not.toHaveBeenCalled();
    const allow = Array.from(host.querySelectorAll("button")).find(button => button.textContent === "Allow uploads")!;
    await act(async () => { allow.click(); });
    expect(save).toHaveBeenCalledWith(true);
    expect(control.checked).toBe(true);
  } finally { await act(async () => root.unmount()); vi.restoreAllMocks(); }
});
