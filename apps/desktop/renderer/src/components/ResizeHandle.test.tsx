// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ResizeHandle } from "./ResizeHandle";

it("focuses a dragged divider so keyboard resizing and reset remain available", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container), onResize = vi.fn();
  try {
    act(() => root.render(<ResizeHandle side="left" value={280} min={200} max={400} reset={280} onResize={onResize} />));
    const divider = container.querySelector<HTMLElement>('[role="separator"]')!;
    act(() => divider.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 280 })));
    expect(document.activeElement).toBe(divider);
    act(() => divider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })));
    expect(onResize).toHaveBeenLastCalledWith(296);
    act(() => divider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Home" })));
    expect(onResize).toHaveBeenLastCalledWith(280);
  } finally {
    window.dispatchEvent(new Event("pointerup"));
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
