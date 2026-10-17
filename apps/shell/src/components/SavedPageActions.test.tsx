// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SavedPageActions } from "./SavedPageActions";

it("opens from the row with pointer or keyboard, skips disabled items, and restores focus", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const scrollIntoView = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = vi.fn();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Fixture({ disabled = false }: { disabled?: boolean }) {
    const rowRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={rowRef}>
        <button className="library-open">Saved page</button>
        <input aria-label="Edit title" />
        <SavedPageActions rowRef={rowRef} title="Saved page" menu hidden={false} disabled={disabled}>
          <>
            <button disabled>Unavailable</button>
            <button>Edit</button>
            <hr />
            <button>Open</button>
          </>
        </SavedPageActions>
      </div>
    );
  }
  try {
    await act(async () => root.render(<Fixture />));
    const opener = host.querySelector("button")!;
    opener.focus();
    await act(async () =>
      opener.dispatchEvent(
        new KeyboardEvent("keydown", { key: "F10", shiftKey: true, bubbles: true, cancelable: true }),
      ),
    );
    expect(document.querySelector('[role="menu"]')).toBeTruthy();
    expect(document.activeElement?.textContent).toBe("Edit");
    await act(async () =>
      document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })),
    );
    expect(document.activeElement?.textContent).toBe("Open");
    await act(async () =>
      document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.activeElement).toBe(opener);
    await act(async () =>
      opener.dispatchEvent(
        new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 120, clientY: 80 }),
      ),
    );
    expect(document.querySelector('[role="menu"]')).toBeTruthy();
    await act(async () => root.render(<Fixture disabled />));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await act(async () => root.render(<Fixture />));
    const inputEvent = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    await act(async () => host.querySelector("input")!.dispatchEvent(inputEvent));
    expect(inputEvent.defaultPrevented).toBe(false);
    expect(document.querySelector('[role="menu"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    vi.unstubAllGlobals();
  }
});
