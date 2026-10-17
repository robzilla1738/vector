// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { call } from "../store";
import { ClearBrowsingData } from "./ClearBrowsingData";

vi.mock("../store", () => ({ call: vi.fn(), toast: vi.fn() }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => vi.restoreAllMocks());

it("cancels a reviewed category clear without deleting any data", async () => {
  const rpc = vi.mocked(call);
  rpc.mockImplementation(async (method) => (method === "history.count" ? { count: 2 } : { removed: 0 }));
  vi.spyOn(bridge, "browsingDataPreview").mockResolvedValue({
    cookies: 3,
    cacheBytes: 4096,
    cacheEstimate: false,
  });
  const clear = vi.spyOn(bridge, "clearBrowsingData");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ClearBrowsingData active />));
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    expect(document.body.textContent).toContain("3 cookies");
    expect(document.body.textContent).toContain("4.0 KB");
    await act(async () =>
      Array.from(document.querySelectorAll<HTMLButtonElement>("dialog button"))
        .find((button) => button.textContent === "Cancel")!
        .click(),
    );
    expect(clear).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalledWith("history.clear", expect.anything());
    expect(document.querySelector("dialog")).toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    await act(async () =>
      document
        .querySelector("dialog")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
    );
    expect(document.querySelector("dialog")).toBeNull();
    expect(clear).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalledWith("history.clear", expect.anything());
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("recounts selected data and stops when its amount changed", async () => {
  const rpc = vi.mocked(call);
  rpc.mockImplementation(async (method) => (method === "history.count" ? { count: 2 } : { removed: 0 }));
  vi.spyOn(bridge, "browsingDataPreview")
    .mockResolvedValueOnce({ cookies: 3, cacheBytes: 4096, cacheEstimate: false })
    .mockResolvedValueOnce({ cookies: 4, cacheBytes: 4096, cacheEstimate: false });
  const clear = vi.spyOn(bridge, "clearBrowsingData");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ClearBrowsingData active />));
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    await act(async () => document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1]!.click());
    await act(async () =>
      Array.from(document.querySelectorAll<HTMLButtonElement>("dialog button"))
        .find((button) => button.textContent === "Clear selected data")!
        .click(),
    );
    expect(document.body.textContent).toContain("The amount of selected data changed");
    expect(clear).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalledWith("history.clear", expect.anything());
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
