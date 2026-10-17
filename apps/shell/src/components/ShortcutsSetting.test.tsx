// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ShortcutsSetting } from "./ShortcutsSetting";
import { bridge } from "../bridge";
it("searches commands and stops recording when its Settings subview is hidden", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  const save = vi.fn().mockResolvedValue(true);
  try {
    await act(async () => root.render(<ShortcutsSetting value={{}} onSave={save} />));
    const total = host.querySelectorAll(".shortcut-row").length;
    const search = host.querySelector<HTMLInputElement>('[aria-label="Find keyboard shortcut"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(search, "tab");
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(host.querySelectorAll(".shortcut-row").length).toBeGreaterThan(0);
    expect(host.querySelectorAll(".shortcut-row").length).toBeLessThan(total);
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label^="Change "]')!.click());
    expect(host.textContent).toContain("Press keys");
    await act(async () => root.render(<ShortcutsSetting value={{}} onSave={save} active={false} />));
    const key = new KeyboardEvent("keydown", { key: "t", metaKey: true, bubbles: true, cancelable: true });
    await act(async () => window.dispatchEvent(key));
    expect(key.defaultPrevented).toBe(false);
    expect(save).not.toHaveBeenCalled();
    expect(host.textContent).not.toContain("Press keys");
    expect(search.value).toBe("tab");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
it("reuses conflict checks in the dedicated Quick Ask recorder and lets Tab leave it", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  const save = vi.fn().mockResolvedValue(true);
  vi.spyOn(bridge, "setShortcuts").mockResolvedValue(true);
  vi.spyOn(bridge, "setShortcutOverrides").mockResolvedValue(true);
  try {
    await act(async () => root.render(<ShortcutsSetting value={{}} onSave={save} commandId="quick-ask" />));
    expect(host.querySelector('[aria-label="Find keyboard shortcut"]')).toBeNull();
    expect(host.textContent).not.toContain("Reset all shortcuts");
    const recorder = host.querySelector<HTMLInputElement>('[aria-label="Change Quick Ask shortcut"]')!;
    await act(async () => recorder.focus());
    const reserved = new KeyboardEvent("keydown", {
      key: "q",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    await act(async () => window.dispatchEvent(reserved));
    expect(host.textContent).toContain("macOS uses");
    expect(save).not.toHaveBeenCalled();
    await act(async () =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "t", metaKey: true, bubbles: true, cancelable: true }),
      ),
    );
    expect(host.textContent).toContain("is used by");
    expect(save).not.toHaveBeenCalled();
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent?.startsWith("Assign anyway"))!
        .click(),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        "quick-ask": [{ key: "t", command: true }],
        "new-tab": [],
      }),
    );
    await act(async () => recorder.click());
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    await act(async () => window.dispatchEvent(tab));
    expect(tab.defaultPrevented).toBe(false);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});

it("shares one recorder across common rows and restores native shortcuts when leaving the view", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  const root = createRoot(host);
  document.body.append(host);
  const save = vi.fn().mockResolvedValue(true);
  const suspend = vi.spyOn(bridge, "setShortcuts").mockResolvedValue(true);
  const restore = vi.spyOn(bridge, "setShortcutOverrides").mockResolvedValue(true);
  const featured = ["sidebar", "copy-url"];
  try {
    await act(async () =>
      root.render(<ShortcutsSetting value={{}} onSave={save} featuredCommands={featured} />),
    );
    expect(host.querySelectorAll(".shortcut-single-control")).toHaveLength(2);
    expect(host.querySelector('[aria-label="Find keyboard shortcut"]')).toBeNull();
    const inputs = host.querySelectorAll<HTMLInputElement>("input");
    await act(async () => inputs[0]!.focus());
    expect(suspend).toHaveBeenLastCalledWith([]);
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    await act(async () => window.dispatchEvent(tab));
    expect(tab.defaultPrevented).toBe(false);
    expect(restore).toHaveBeenCalledWith({});
    await act(async () => inputs[1]!.focus());
    await act(async () =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "t",
          metaKey: true,
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(host.textContent).toContain("is used by");
    expect(save).not.toHaveBeenCalled();
    await act(async () => root.render(<ShortcutsSetting value={{}} onSave={save} />));
    expect(host.textContent).not.toContain("is used by");
    expect(host.querySelector('[aria-label="Find keyboard shortcut"]')).not.toBeNull();
    expect(restore).toHaveBeenLastCalledWith({});
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
