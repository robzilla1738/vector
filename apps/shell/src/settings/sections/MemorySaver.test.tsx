// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { MemorySaverSetting } from "./MemorySaver";
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  inNativeHost: true,
}));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("reads and saves native memory saver while the runtime is disconnected, preserving its value on refusal", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState({ connected: false });
  vi.spyOn(bridge, "memorySaverGet").mockResolvedValue({ minutes: 30, managed: false });
  const save = vi
    .spyOn(bridge, "memorySaverSet")
    .mockResolvedValueOnce({ minutes: 1, managed: false })
    .mockRejectedValueOnce(new Error("Profile policy changed"));
  const runtime = vi.spyOn(bridge, "invoke");
  const element = document.createElement("div");
  const root = createRoot(element);
  try {
    await act(async () => root.render(<MemorySaverSetting active />));
    const control = element.querySelector<HTMLSelectElement>("select")!;
    expect(control.value).toBe("30");
    await act(async () => {
      control.value = "1";
      control.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(save).toHaveBeenCalledWith(1);
    expect(control.value).toBe("1");
    await act(async () => {
      control.value = "15";
      control.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(control.value).toBe("1");
    expect(element.textContent).toContain("Profile policy changed");
    expect(runtime).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
  }
});
