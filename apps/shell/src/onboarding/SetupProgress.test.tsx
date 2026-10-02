// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("../store", () => ({
  call: (...args: unknown[]) => rpc(...args),
}));
import { SetupProgress } from "./SetupProgress";
afterEach(() => {
  rpc.mockReset();
  vi.unstubAllGlobals();
});
it("shows the actual trusted saved receipt and refuses stale progress after Settings reopens", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let old: (value: { status: string }) => void = () => {};
  rpc
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          old = resolve;
        }),
    )
    .mockResolvedValueOnce({ status: "later" });
  const element = document.createElement("div"),
    root = createRoot(element);
  try {
    await act(async () => root.render(<SetupProgress />));
    await act(async () => root.render(null));
    await act(async () => root.render(<SetupProgress />));
    expect(element.textContent).toBe("Setup saved for later");
    await act(async () => old({ status: "complete" }));
    expect(element.textContent).toBe("Setup saved for later");
    expect(rpc.mock.calls).toEqual([["onboarding.get"], ["onboarding.get"]]);
  } finally {
    await act(async () => root.unmount());
  }
});
it("reports an unavailable receipt without claiming setup was saved", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockRejectedValue(new Error("Disconnected"));
  const element = document.createElement("div"),
    root = createRoot(element);
  try {
    await act(async () => root.render(<SetupProgress />));
    expect(element.textContent).toContain("Saved setup progress is unavailable");
    expect(element.textContent).not.toContain("Setup saved for later");
  } finally {
    await act(async () => root.unmount());
  }
});
