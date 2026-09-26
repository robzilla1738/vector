// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ActionMenu } from "./ui";

it("opens the portaled menu, skips disabled actions, restores focus on Escape, and invokes only the selected action", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { fn(0); return 1; });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container), selected = vi.fn();
  try {
    await act(async () => root.render(<ActionMenu label="Chat actions" actions={[
      { label: "Unavailable", disabled: true, onSelect: vi.fn() },
      { label: "Rename", onSelect: selected },
      { label: "Archive", onSelect: vi.fn() },
    ]}/>));
    const trigger = container.querySelector("button")!;
    await act(async () => trigger.click());
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement?.textContent).toBe("Rename");
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowDown",bubbles:true})));
    expect(document.activeElement?.textContent).toBe("Archive");
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape",bubbles:true})));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await act(async () => trigger.click());
    await act(async () => (document.activeElement as HTMLButtonElement).click());
    expect(selected).toHaveBeenCalledOnce();
    expect(document.querySelector('[role="menu"]')).toBeNull();
  } finally { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); }
});
