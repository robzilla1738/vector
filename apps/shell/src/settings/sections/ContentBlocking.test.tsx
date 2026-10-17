// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { ContentBlockingSettings } from "./ContentBlocking";

vi.mock("../../components/FilterListManager", () => ({ FilterListManager: () => null }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => vi.restoreAllMocks());

it("uses the native blocking acknowledgement and retains exceptions", async () => {
  vi.spyOn(bridge, "privacy").mockResolvedValue({
    trackerBlock: true,
    blocked: 2,
    allowedHosts: ["example.test"],
  });
  const save = vi.spyOn(bridge, "setTrackerBlock").mockResolvedValue({ trackerBlock: true, blocked: 2 });
  const resume = vi.spyOn(bridge, "removeAllowedHost").mockResolvedValue([]);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ContentBlockingSettings active />));
    const toggle = host.querySelector<HTMLInputElement>('[role="switch"]')!;
    await act(async () => toggle.click());
    expect(save).toHaveBeenCalledWith(false);
    expect(toggle.checked).toBe(true);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("did not save");
    expect(host.textContent).toContain("example.test");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Resume blocking on example.test"]')!.click(),
    );
    expect(resume).toHaveBeenCalledWith("example.test");
    expect(host.querySelector('[aria-label="Sites where blocking is paused"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
  }
});

it("ignores a stale read after a write and prevents overlapping writes", async () => {
  const state = { trackerBlock: true, blocked: 0, allowedHosts: [] };
  let resolveRead!: (value: typeof state) => void;
  let resolveSave!: (value: { trackerBlock: boolean; blocked: number }) => void;
  vi.spyOn(bridge, "privacy")
    .mockResolvedValueOnce(state)
    .mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve;
        }),
    );
  const save = vi.spyOn(bridge, "setTrackerBlock").mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
  );
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ContentBlockingSettings active />));
    await act(async () => window.dispatchEvent(new Event("focus")));
    const toggle = host.querySelector<HTMLInputElement>('[role="switch"]')!;
    await act(async () => {
      toggle.click();
      toggle.click();
    });
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave({ trackerBlock: false, blocked: 0 }));
    await act(async () => resolveRead(state));
    expect(toggle.checked).toBe(false);
  } finally {
    await act(async () => root.unmount());
  }
});
