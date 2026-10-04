// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { SidebarSection } from "./SidebarSection";

it("exposes section state and makes collapsed content inert without destroying it", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const original = { windowId: bridge.windowId, privateMode: bridge.privateMode, kind: bridge.windowKind };
  bridge.privateMode = false; bridge.windowKind = "normal";
  const geometry = vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 200, height: 30 }] as unknown as DOMRectList);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container), onToggle = vi.fn();
  const render = (open: boolean) => act(() => root.render(<SidebarSection title="Bookmarks" open={open} onToggle={onToggle}><button>Saved page</button></SidebarSection>));
  try {
    render(true);
    const toggle = container.querySelector<HTMLButtonElement>('[aria-expanded]')!;
    const body = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(body.hasAttribute("inert")).toBe(false);
    act(() => toggle.click());
    expect(onToggle).toHaveBeenCalledOnce();
    render(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(body.hasAttribute("inert")).toBe(true);
    expect(body.getAttribute("aria-hidden")).toBe("true");
    expect(body.textContent).toBe("Saved page");
  } finally {
    act(() => root.unmount());
    container.remove();
    bridge.windowId = original.windowId; bridge.privateMode = original.privateMode; bridge.windowKind = original.kind;
    geometry.mockRestore();
    vi.unstubAllGlobals();
  }
});
