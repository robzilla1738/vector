// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { executeCommand } from "./commands";
import { SidebarSection } from "./components/SidebarSection";
import * as scoped from "./scoped-control-commands";
it("committed callback replacement stays live across incidental render while original cleanup retires the captured owner", async () => {
  const original = { window: bridge.windowId, kind: bridge.windowKind, private: bridge.privateMode };
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  const geometry = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{ width: 100, height: 30 }] as unknown as DOMRectList);
  const registrations = vi.spyOn(scoped, "registerScopedControl");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const first = vi.fn(),
    second = vi.fn();
  try {
    await act(async () =>
      root.render(
        <SidebarSection title="Tabs" open onToggle={first}>
          Content
        </SidebarSection>,
      ),
    );
    const heading = host.querySelector<HTMLButtonElement>("button")!;
    const old = registrations.mock.calls.find(([, id]) => id === "toggle-sidebar-section")![3];
    await act(async () =>
      root.render(
        <SidebarSection title="Tabs" open={false} onToggle={second}>
          Updated content
        </SidebarSection>,
      ),
    );
    expect(host.querySelector("button")).toBe(heading);
    expect(registrations.mock.calls.filter(([, id]) => id === "toggle-sidebar-section")).toHaveLength(1);
    await act(async () => heading.click());
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    heading.focus();
    await act(async () => {
      await executeCommand("toggle-sidebar-section");
    });
    expect(second).toHaveBeenCalledTimes(2);
    await act(async () => root.unmount());
    expect(() => old()).toThrow("original sidebar section");
    await expect(executeCommand("toggle-sidebar-section")).rejects.toThrow();
    expect(second).toHaveBeenCalledTimes(2);
  } finally {
    if (host.hasChildNodes()) await act(async () => root.unmount());
    host.remove();
    bridge.windowId = original.window;
    bridge.windowKind = original.kind;
    bridge.privateMode = original.private;
    geometry.mockRestore();
    registrations.mockRestore();
    vi.unstubAllGlobals();
  }
});
