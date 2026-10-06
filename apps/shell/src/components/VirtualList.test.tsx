// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { VirtualList, windowRange } from "./VirtualList";

it("windows rows around the viewport and clamps to the list", () => {
  expect(windowRange(0, 300, 100, 30, 500, 5)).toEqual({ start: 0, end: 15 });
  expect(windowRange(3100, 300, 100, 30, 500, 5)).toEqual({ start: 95, end: 115 });
  expect(windowRange(20_000, 300, 100, 30, 500, 5)).toEqual({ start: 500, end: 500 });
  expect(windowRange(0, 300, 0, 0, 7, 5)).toEqual({ start: 0, end: 7 });
});

it("reveals the active row in an outer scroller and retains its focused DOM while drag disables windowing", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const host = document.createElement("div"),
    scroller = createRef<HTMLElement>();
  document.body.append(host);
  scroller.current = host;
  Object.defineProperty(host, "clientHeight", { value: 320 });
  const scrollTo = vi.fn(({ top }: { top: number }) => {
    host.scrollTop = top;
  });
  Object.defineProperty(host, "scrollTo", { value: scrollTo });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return { top: this === host ? 0 : 100 - host.scrollTop } as DOMRect;
  });
  const root = createRoot(host),
    items = Array.from({ length: 200 }, (_, i) => i);
  const render = (enabled: boolean) => (
    <VirtualList
      items={items}
      rowHeight={32}
      overscan={10}
      scroller={scroller}
      activeIndex={100}
      enabled={enabled}
      keyOf={(item) => String(item)}
      renderRow={(item) => <button data-row={item}>{item}</button>}
    />
  );
  try {
    await act(async () => root.render(render(true)));
    expect(scrollTo).toHaveBeenCalledWith({ top: 3012 });
    const active = host.querySelector<HTMLButtonElement>('[data-row="100"]')!;
    expect(active).not.toBeNull();
    expect(host.querySelector('[data-row="0"]')).toBeNull();
    active.focus();
    await act(async () => root.render(render(false)));
    expect(host.querySelectorAll("button")).toHaveLength(200);
    expect(host.querySelector('[data-row="100"]')).toBe(active);
    expect(document.activeElement).toBe(active);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
