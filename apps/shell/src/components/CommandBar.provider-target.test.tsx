import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { CommandBar } from "./CommandBar";
vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  inMock: true,
}));

it("retains query and combobox focus when choosing a full provider label with the existing hit target", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const initial = useStore.getState(),
    windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode,
    scroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  bridge.windowId = "provider-original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  useStore.setState(
    { ...initial, settings: { homeEntryMode: "search" }, pages: normalizePages([]), runs: [], toasts: [] },
    true,
  );
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  vi.spyOn(bridge, "extensions").mockResolvedValue([]);
  vi.spyOn(bridge, "autocomplete").mockResolvedValue([]);
  const host = document.createElement("div"),
    style = document.createElement("style");
  document.body.append(host);
  document.head.append(style);
  const css = readFileSync("apps/shell/src/components/CommandBar.css", "utf8"),
    token = readFileSync("apps/shell/src/tokens.css", "utf8").match(/--hit:\s*([^;]+);/)![1]!;
  style.textContent = css.match(/\.cb-provider-scopes button\s*\{[^}]+\}/)![0].replace("var(--hit)", token);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        input,
        "original query",
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const group = host.querySelector('[aria-label="Search providers"]')!,
      buttons = [...group.querySelectorAll<HTMLButtonElement>("button")],
      all = buttons.find((node) => node.textContent === "All")!,
      closed = buttons.find((node) => node.textContent === "Recently Closed")!;
    expect(closed.textContent).toBe("Recently Closed");
    expect(all.getAttribute("aria-pressed")).toBe("true");
    for (const button of buttons) expect(getComputedStyle(button).minHeight).toBe("32px");
    input.focus();
    await act(async () => closed.click());
    expect(input.value).toBe("original query");
    expect(document.activeElement).toBe(input);
    expect(closed.getAttribute("aria-pressed")).toBe("true");
    expect(all.getAttribute("aria-pressed")).toBe("false");
    expect(host.textContent).toContain("No closed matches. Choose another provider or edit the query.");
    await act(async () => all.click());
    expect(input.value).toBe("original query");
    expect(document.activeElement).toBe(input);
    expect(all.getAttribute("aria-pressed")).toBe("true");
    expect(closed.getAttribute("aria-pressed")).toBe("false");
    expect(host.querySelector('[role="combobox"]')).toBe(input);
    expect(host.querySelector('[data-command-id="retry-browser-autocomplete"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    useStore.setState(initial, true);
    bridge.windowId = windowId;
    bridge.windowKind = kind;
    bridge.privateMode = privateMode;
    if (scroll) Object.defineProperty(Element.prototype, "scrollIntoView", scroll);
    else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
