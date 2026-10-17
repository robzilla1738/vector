// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { QuickAskShortcutField } from "./Appearance";

vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  inNativeHost: true,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("refreshes global registration after a shortcut save and rejects stale status", async () => {
  type Status = Awaited<ReturnType<typeof bridge.quickAskShortcut>>;
  let first!: (value: Status) => void;
  const read = vi
    .spyOn(bridge, "quickAskShortcut")
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          first = resolve;
        }),
    )
    .mockResolvedValue({ enabled: true, registered: false, error: "Already used by another app" });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <QuickAskShortcutField active revision={0}>
          <input aria-label="Existing shared recorder" />
        </QuickAskShortcutField>,
      ),
    );
    expect(host.textContent).toContain("Checking global shortcut");
    await act(async () =>
      root.render(
        <QuickAskShortcutField active revision={1}>
          <input aria-label="Existing shared recorder" />
        </QuickAskShortcutField>,
      ),
    );
    expect(host.textContent).toContain("Already used by another app");
    await act(async () => first({ enabled: true, registered: true, error: "" }));
    expect(host.textContent).toContain("Already used by another app");
    expect(read.mock.calls.every((args) => args.length === 0)).toBe(true);
    expect(host.querySelectorAll("input")).toHaveLength(1);
    read.mockResolvedValue({ enabled: false, registered: false, error: "" });
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(host.textContent).toContain("Global shortcut is disabled");
    read.mockResolvedValue({ enabled: true, registered: true, error: "" });
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(host.textContent).toContain("Open Quick Ask from any app");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});
