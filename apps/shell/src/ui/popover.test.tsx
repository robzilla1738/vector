// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Popover } from "./popover";
import * as placement from "../position-context-menu";

it("opens an accessible dialog, focuses its first control, and restores its trigger on Escape", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <Popover label="Choose context" trigger="Context">
          {(close) => (
            <>
              <button disabled>Unavailable</button>
              <input aria-label="Find context" />
              <button onClick={close}>Done</button>
            </>
          )}
        </Popover>,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.click());
    const panel = document.querySelector<HTMLDialogElement>('dialog[aria-label="Choose context"]')!;
    expect(panel).toBeTruthy();
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(document.activeElement).toBe(panel.querySelector('input[aria-label="Find context"]'));
    await act(async () =>
      panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
    );
    expect(document.querySelector('dialog[aria-label="Choose context"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});

it("preserves its own bounded scroll while following scroll outside its popup", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const place = vi.spyOn(placement, "positionAnchoredPopover");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <Popover label="Scrollable context" trigger="Context">
          {() => <button>Last context option</button>}
        </Popover>,
      ),
    );
    await act(async () => host.querySelector("button")!.click());
    const panel = document.querySelector<HTMLDialogElement>('dialog[aria-label="Scrollable context"]')!;
    const count = place.mock.calls.length;
    panel.scrollTop = 16;
    panel.dispatchEvent(new Event("scroll", { bubbles: false }));
    expect(place).toHaveBeenCalledTimes(count);
    expect(panel.scrollTop).toBe(16);
    host.dispatchEvent(new Event("scroll", { bubbles: false }));
    expect(place).toHaveBeenCalledTimes(count + 1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
