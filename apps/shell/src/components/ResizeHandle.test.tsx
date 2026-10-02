// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ResizeHandle, snapResizeWidth } from "./ResizeHandle";

it("snaps near the reset width and clamps outside the resize range", () => {
  expect(snapResizeWidth(273, 220, 380, 280)).toBe(280);
  expect(snapResizeWidth(287, 220, 380, 280)).toBe(280);
  expect(snapResizeWidth(270, 220, 380, 280)).toBe(270);
  expect(snapResizeWidth(399, 220, 380, 280)).toBe(380);
});

it("focuses a dragged divider so keyboard resizing and reset remain available", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container),
    onResize = vi.fn();
  try {
    act(() =>
      root.render(
        <ResizeHandle side="left" value={280} min={200} max={400} reset={280} onResize={onResize} />,
      ),
    );
    const divider = container.querySelector<HTMLElement>('[role="separator"]')!;
    act(() =>
      divider.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 280 })),
    );
    expect(document.activeElement).toBe(divider);
    act(() => divider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })));
    expect(onResize).toHaveBeenLastCalledWith(296);
    act(() => divider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Home" })));
    expect(onResize).toHaveBeenLastCalledWith(280);
    act(() => window.dispatchEvent(new MouseEvent("pointermove", { buttons: 1, clientX: 295 })));
    act(() => window.dispatchEvent(new MouseEvent("pointerup", { clientX: 295 })));
    expect(onResize).toHaveBeenLastCalledWith(295);
    expect(container.style.getPropertyValue("--sb-w")).toBe("295px");
  } finally {
    window.dispatchEvent(new Event("pointerup"));
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

it("restores the saved width when a pointer drag is cancelled", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container),
    onResize = vi.fn();
  try {
    act(() =>
      root.render(
        <ResizeHandle side="left" value={280} min={200} max={400} reset={280} onResize={onResize} />,
      ),
    );
    const divider = container.querySelector<HTMLElement>('[role="separator"]')!;
    act(() =>
      divider.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 280 })),
    );
    act(() => window.dispatchEvent(new MouseEvent("pointermove", { buttons: 1, clientX: 320 })));
    act(() => window.dispatchEvent(new Event("pointercancel")));
    expect(onResize).not.toHaveBeenCalled();
    expect(container.style.getPropertyValue("--sb-w")).toBe("280px");
  } finally {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

it.each([
  [110, [], 1, 280],
  [111, [[126]], 0, 126],
  [265, [], 0, 280],
  [264, [[264]], 0, 264],
  [415, [[400]], 0, 400],
])("commits sidebar drag %i with collapse and snap boundaries", (target, resized, collapses, width) => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const app = document.createElement("div");
  app.className = "app";
  const panel = document.createElement("aside");
  app.append(panel);
  document.body.append(app);
  const root = createRoot(panel),
    onResize = vi.fn(),
    onCollapse = vi.fn();
  try {
    act(() =>
      root.render(
        <ResizeHandle
          side="left"
          value={280}
          min={126}
          max={400}
          reset={280}
          onResize={onResize}
          onCollapse={onCollapse}
        />,
      ),
    );
    const handle = panel.querySelector<HTMLElement>('[role="separator"]')!;
    act(() =>
      handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 280 })),
    );
    act(() => window.dispatchEvent(new MouseEvent("pointermove", { buttons: 1, clientX: target })));
    expect(onResize).not.toHaveBeenCalled();
    expect(onCollapse).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new Event("pointerup")));
    expect(onCollapse).toHaveBeenCalledTimes(collapses);
    expect(onResize.mock.calls).toEqual(resized);
    expect(app.style.getPropertyValue("--sb-w")).toBe(`${width}px`);
  } finally {
    act(() => root.unmount());
    app.remove();
    vi.unstubAllGlobals();
  }
});

it("announces the sidebar keyboard's 50 pixel step", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const panel = document.createElement("aside");
  document.body.append(panel);
  const root = createRoot(panel),
    onResize = vi.fn();
  try {
    act(() =>
      root.render(
        <ResizeHandle
          side="left"
          value={280}
          min={126}
          max={400}
          reset={280}
          onResize={onResize}
          onCollapse={vi.fn()}
        />,
      ),
    );
    act(() =>
      panel
        .querySelector('[role="separator"]')!
        .dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })),
    );
    expect(onResize).toHaveBeenCalledWith(330);
    expect(panel.querySelector('[aria-live="polite"]')?.textContent).toBe("Sidebar width 330 pixels");
    act(() => vi.advanceTimersByTime(1000));
    expect(panel.querySelector('[aria-live="polite"]')).toBeNull();
  } finally {
    act(() => root.unmount());
    panel.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

it.each([
  [110, 1, []],
  [111, 0, [[126]]],
])(
  "commits the matching final pointer position %i after coalesced movement",
  (target, collapses, resized) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const panel = document.createElement("aside");
    document.body.append(panel);
    const root = createRoot(panel),
      onResize = vi.fn(),
      onCollapse = vi.fn();
    const pointer = (type: string, clientX: number, pointerId: number, buttons = 0) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, buttons });
      Object.defineProperty(event, "pointerId", { value: pointerId });
      return event;
    };
    try {
      act(() =>
        root.render(
          <ResizeHandle
            side="left"
            value={280}
            min={126}
            max={400}
            reset={280}
            onResize={onResize}
            onCollapse={onCollapse}
          />,
        ),
      );
      const handle = panel.querySelector<HTMLElement>('[role="separator"]')!;
      act(() => handle.dispatchEvent(pointer("pointerdown", 280, 7, 1)));
      act(() => window.dispatchEvent(pointer("pointermove", 160, 7, 1)));
      act(() => window.dispatchEvent(pointer("pointermove", 100, 8, 1)));
      act(() => window.dispatchEvent(pointer("pointerup", 100, 8)));
      expect(onResize).not.toHaveBeenCalled();
      expect(onCollapse).not.toHaveBeenCalled();
      act(() => window.dispatchEvent(pointer("pointerup", target, 7)));
      expect(onCollapse).toHaveBeenCalledTimes(collapses);
      expect(onResize.mock.calls).toEqual(resized);
    } finally {
      act(() => root.unmount());
      panel.remove();
      vi.unstubAllGlobals();
    }
  },
);
