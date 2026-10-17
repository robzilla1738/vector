// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useDismissable } from "./use-dismissable";

afterEach(() => vi.unstubAllGlobals());

function Layer({ open, onDismiss }: { open: boolean; onDismiss(): void }) {
  useDismissable(open, onDismiss);
  return null;
}

const escape = (target: EventTarget = document.body) => {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
};

it("closes the most recently opened layer first, then the one beneath it", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const root = createRoot(document.createElement("div"));
  const menu = vi.fn(),
    dialog = vi.fn(),
    fallback = vi.fn();
  const onWindow = (event: KeyboardEvent) => {
    if (!event.defaultPrevented) fallback();
  };
  window.addEventListener("keydown", onWindow);
  try {
    act(() => root.render(<Layer open onDismiss={dialog} />));
    act(() =>
      root.render(
        <>
          <Layer open onDismiss={dialog} />
          <Layer open onDismiss={menu} />
        </>,
      ),
    );
    expect(escape().defaultPrevented).toBe(true);
    expect(menu).toHaveBeenCalledOnce();
    expect(dialog).not.toHaveBeenCalled();
    expect(fallback).not.toHaveBeenCalled();

    act(() =>
      root.render(
        <>
          <Layer open onDismiss={dialog} />
          <Layer open={false} onDismiss={menu} />
        </>,
      ),
    );
    escape();
    expect(dialog).toHaveBeenCalledOnce();
    expect(menu).toHaveBeenCalledOnce();

    act(() => root.render(<Layer open={false} onDismiss={dialog} />));
    expect(escape().defaultPrevented).toBe(false);
    expect(fallback).toHaveBeenCalledOnce();
  } finally {
    window.removeEventListener("keydown", onWindow);
    act(() => root.unmount());
  }
});

it("leaves Escape to a field that already handled it", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const root = createRoot(document.createElement("div"));
  const dismiss = vi.fn();
  const field = document.body.appendChild(document.createElement("input"));
  field.addEventListener("keydown", (event) => event.preventDefault());
  try {
    act(() => root.render(<Layer open onDismiss={dismiss} />));
    escape(field);
    expect(dismiss).not.toHaveBeenCalled();
  } finally {
    field.remove();
    act(() => root.unmount());
  }
});

it("lets a native picker close before dismissing its surrounding layer", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const root = createRoot(document.createElement("div"));
  const dismiss = vi.fn();
  const select = document.body.appendChild(document.createElement("select"));
  // JSDOM has no native picker; Chromium supplies this open state.
  const open = vi.spyOn(select, "matches").mockReturnValue(true);
  try {
    act(() => root.render(<Layer open onDismiss={dismiss} />));
    expect(escape(select).defaultPrevented).toBe(false);
    expect(dismiss).not.toHaveBeenCalled();
    open.mockReturnValue(false);
    expect(escape(select).defaultPrevented).toBe(true);
    expect(dismiss).toHaveBeenCalledOnce();
  } finally {
    open.mockRestore();
    select.remove();
    act(() => root.unmount());
  }
});
