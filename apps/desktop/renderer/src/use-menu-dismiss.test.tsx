// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useMenuDismiss } from "./use-menu-dismiss";

afterEach(() => vi.unstubAllGlobals());

function Menu({ onClose }: { onClose(): void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dismiss = useMenuDismiss(ref, onClose);
  return <div ref={ref}><button onClick={dismiss}>Dismiss</button></div>;
}

it.each([false, true])("dismisses once and respects reduced motion: %s", reduced => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }));
  const container = document.createElement("div");
  const root = createRoot(container);
  const onClose = vi.fn();
  const animation = { onfinish: null as (() => void) | null, cancel: vi.fn() };
  const animate = vi.fn(() => animation);
  try {
    act(() => root.render(<Menu onClose={onClose} />));
    const menu = container.firstElementChild as HTMLDivElement;
    Object.defineProperty(menu, "animate", { value: animate });
    act(() => { menu.querySelector("button")!.click(); menu.querySelector("button")!.click(); });
    if (reduced) {
      expect(animate).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    } else {
      expect(menu.inert).toBe(true);
      expect(animate).toHaveBeenCalledTimes(1);
      expect(animate.mock.calls[0]).toEqual([
        expect.arrayContaining([{ opacity: 0, transform: "scale(.95)" }]),
        expect.objectContaining({ duration: 100, fill: "forwards" }),
      ]);
      expect(onClose).not.toHaveBeenCalled();
      act(() => animation.onfinish?.());
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  } finally {
    act(() => root.unmount());
  }
  if (!reduced) {
    expect(animation.onfinish).toBeNull();
    expect(animation.cancel).toHaveBeenCalledOnce();
  }
});
