// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { startupPreferences } = vi.hoisted(() => {
  let current = { mode: "continue", urls: [] as string[], managed: false };
  return {
    startupPreferences: vi.fn(async (next?: { mode: string; urls: string[] }) => {
      if (next) current = { ...next, managed: false };
      return current;
    }),
  };
});
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  bridge: {
    ...(await original<typeof import("../../bridge")>()).bridge,
    privateMode: false,
    windowId: "original",
    windowKind: "normal",
    startupPreferences,
  },
  inMock: true,
  inNativeHost: false,
}));

import { ordinaryWebUrl, StartupSetting } from "./Startup";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

it("accepts ordinary startup URLs and rejects unsafe schemes and credentials", () => {
  expect(ordinaryWebUrl("example.com")).toBe("https://example.com/");
  expect(ordinaryWebUrl("http://127.0.0.1:8080/page")).toBe("http://127.0.0.1:8080/page");
  expect(ordinaryWebUrl("file:///tmp/page.html")).toBeNull();
  expect(ordinaryWebUrl("https://user:secret@example.com")).toBeNull();
});

it("reads and updates Chromium's startup mode", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<StartupSetting active />));
    expect(startupPreferences).toHaveBeenCalledWith();
    const select = container.querySelector<HTMLSelectElement>('select[aria-label="On startup"]')!;
    expect(select.value).toBe("continue");
    await act(async () => {
      select.value = "new-tab";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(startupPreferences).toHaveBeenCalledWith({ mode: "new-tab", urls: [] });
    expect(select.value).toBe("new-tab");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
