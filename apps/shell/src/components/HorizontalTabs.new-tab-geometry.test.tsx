import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { useStore } from "../store";
import { HorizontalTabs } from "./HorizontalTabs";
import { runCommand } from "../commands";
vi.mock("../commands", () => ({ runCommand: vi.fn() }));
it("keeps the original registered New tab in its 28px hit area with the supplied 18px glyph", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const initial = useStore.getState();
  useStore.setState({ pages: normalizePages([]), layout: { ...initial.layout, folders: [] } });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HorizontalTabs />));
    const button = host.querySelector(
      '.horizontal-tab-tools button[aria-label="New tab"]',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.className).toBe("icon-btn");
    const glyph = button.querySelector(".ci")!;
    expect(glyph).not.toBeNull();
    const style = document.createElement("style");
    const workspace = readFileSync("apps/shell/src/styles/workspace.css", "utf8");
    const polish = readFileSync("apps/shell/src/styles/chrome-polish.css", "utf8");
    const rule = (text: string, selector: string) =>
      text.match(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]+)\\}"))![0];
    style.textContent =
      rule(workspace, ".horizontal-tab-tools .icon-btn") +
      "\n" +
      rule(workspace, ".horizontal-tab-tools .ci") +
      "\n" +
      rule(polish, ".icon-btn > .ci") +
      "\n" +
      rule(polish, ".horizontal-tab-tools .icon-btn > .ci");
    document.head.append(style);
    try {
      expect(getComputedStyle(button).width).toBe("28px");
      expect(getComputedStyle(button).height).toBe("28px");
      expect(getComputedStyle(glyph).width).toBe("18px");
      expect(getComputedStyle(glyph).height).toBe("18px");
    } finally {
      style.remove();
    }
    await act(async () => button.click());
    expect(runCommand).toHaveBeenCalledWith("new-tab");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(initial, true);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});
