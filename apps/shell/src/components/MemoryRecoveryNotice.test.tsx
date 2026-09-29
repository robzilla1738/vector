// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";

const { rpc, openSettings, setState } = vi.hoisted(() => ({
  rpc: vi.fn(), openSettings: vi.fn(), setState: vi.fn(),
}));
vi.mock("../store", () => ({
  call: (...args: unknown[]) => rpc(...args),
  useStore: { setState, getState: () => ({ setOverlay: openSettings }) },
}));
vi.mock("../bridge", () => ({ bridge: { exportRuntimeBackup: vi.fn() } }));
import { MemoryRecoveryNotice } from "./MemoryRecoveryNotice";

afterEach(() => { rpc.mockReset(); openSettings.mockReset(); setState.mockReset(); });

it("shows issued recovery and opens an explicit new offline export after Forget", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockResolvedValue({ managedRecovery: { generation: 2, freshBackupIssued: true } });
  const element = document.createElement("div");
  const root = createRoot(element);
  try {
    await act(async () => root.render(<MemoryRecoveryNotice />));
    expect(element.textContent).toContain("Fresh Aux-managed task-data backup issued after Forget");
    expect(element.textContent).toContain("Protected Space and page memory need a new encrypted offline package");
    expect(element.textContent).toContain("Copies and phrases outside Aux cannot be revoked");
    const button = [...element.querySelectorAll("button")].find(item => item.textContent?.includes("encrypted offline package"));
    expect(button).toBeDefined();
    await act(async () => button!.click());
    expect(setState).toHaveBeenCalledWith({ settingsCategory: "General" });
    expect(openSettings).toHaveBeenCalledWith("settings");
  } finally { await act(async () => root.unmount()); vi.unstubAllGlobals(); }
});
