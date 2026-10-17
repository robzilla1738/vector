// @vitest-environment jsdom
import { act, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { ActionMenu } from "./index";
import { Dialog } from "./dialog";

function key(node: Element, value: string, shiftKey = false) {
  node.dispatchEvent(new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true }));
}

afterEach(() => vi.unstubAllGlobals());

it("ActionMenu focuses the first enabled item and Escape restores its trigger", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <ActionMenu
          label="Actions"
          actions={[
            { label: "Disabled", disabled: true, onSelect() {} },
            { label: "Open", onSelect() {} },
          ]}
        />,
      ),
    );
    const trigger = host.querySelector("button")!;
    await act(async () => key(trigger, "ArrowDown"));
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu).toBeTruthy();
    expect(document.activeElement?.textContent).toContain("Open");
    await act(async () => key(menu, "Escape"));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("Tab leaves the menu toward the next control while Shift-Tab moves backward", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const getClientRects = HTMLElement.prototype.getClientRects;
  HTMLElement.prototype.getClientRects = () => ({ length: 1 }) as DOMRectList;
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Fixture() {
    return (
      <>
        <button>Before</button>
        <ActionMenu label="Actions" actions={[{ label: "Open", onSelect() {} }]} />
        <button>After</button>
      </>
    );
  }
  try {
    await act(async () => root.render(<Fixture />));
    const buttons = host.querySelectorAll("button");
    await act(async () => key(buttons[1]!, "ArrowDown"));
    await act(async () => {
      key(document.querySelector('[role="menu"]')!, "Tab");
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(buttons[2]);
    await act(async () => key(buttons[1]!, "ArrowDown"));
    await act(async () => {
      key(document.querySelector('[role="menu"]')!, "Tab", true);
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(buttons[0]);
  } finally {
    HTMLElement.prototype.getClientRects = getClientRects;
    await act(async () => root.unmount());
    host.remove();
  }
});

it("keeps menu Tab traversal inside its parent dialog and skips unavailable controls", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const getClientRects = HTMLElement.prototype.getClientRects;
  HTMLElement.prototype.getClientRects = () => ({ length: 1 }) as DOMRectList;
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Fixture() {
    const [open, setOpen] = useState(false);
    const opener = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button ref={opener} onClick={() => setOpen(true)}>
          Open dialog
        </button>
        <button>Outside dialog</button>
        {open && (
          <Dialog label="Parent" onClose={() => setOpen(false)} returnFocus={opener}>
            <button>Before</button>
            <ActionMenu label="Actions" actions={[{ label: "Run", onSelect() {} }]} />
            <button hidden>Hidden</button>
            <button aria-disabled="true">Unavailable</button>
            <button>After</button>
            <button onClick={() => setOpen(false)}>Close dialog</button>
          </Dialog>
        )}
      </>
    );
  }
  try {
    await act(async () => root.render(<Fixture />));
    const opener = host.querySelector("button")!;
    await act(async () => opener.click());
    const parent = document.querySelector<HTMLDialogElement>('dialog[aria-label="Parent"]')!;
    const trigger = parent.querySelector<HTMLButtonElement>('[aria-label="Actions"]')!;
    await act(async () => key(trigger, "ArrowDown"));
    await act(async () => {
      key(document.querySelector('[role="menu"]')!, "Tab");
      await Promise.resolve();
    });
    expect(document.activeElement?.textContent).toBe("After");
    await act(async () => key(trigger, "ArrowDown"));
    await act(async () => {
      key(document.querySelector('[role="menu"]')!, "Tab", true);
      await Promise.resolve();
    });
    expect(document.activeElement?.textContent).toBe("Before");
    await act(async () => key(trigger, "ArrowDown"));
    await act(async () => key(document.querySelector('[role="menu"]')!, "Escape"));
    expect(document.activeElement).toBe(trigger);
    await act(async () => parent.querySelector<HTMLButtonElement>("button:last-child")!.click());
    expect(document.activeElement).toBe(opener);
  } finally {
    HTMLElement.prototype.getClientRects = getClientRects;
    await act(async () => root.unmount());
    host.remove();
  }
});

it("Dialog focuses an explicit heading and restores the opener on close", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Fixture() {
    const [open, setOpen] = useState(false);
    const heading = useRef<HTMLElement>(null);
    const opener = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button ref={opener} onClick={() => setOpen(true)}>
          Inspect
        </button>
        {open && (
          <Dialog
            label="Observation"
            initialFocusRef={heading}
            returnFocus={opener}
            onClose={() => setOpen(false)}
          >
            <strong tabIndex={-1} ref={heading}>
              What the agent sees
            </strong>
            <button onClick={() => setOpen(false)}>Close</button>
          </Dialog>
        )}
      </>
    );
  }
  try {
    await act(async () => root.render(<Fixture />));
    const opener = host.querySelector("button")!;
    await act(async () => opener.click());
    expect(document.activeElement?.textContent).toBe("What the agent sees");
    await act(async () => key(document.querySelector("dialog")!, "Escape"));
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});


it("file input cancellation keeps its containing dialog open; dialog cancellation closes it", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const close = vi.fn();
  try {
    await act(async () => root.render(<Dialog label="Import" onClose={close}><input type="file" /></Dialog>));
    const dialog = document.querySelector("dialog")!;
    await act(async () => dialog.querySelector("input")!.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })));
    expect(close).not.toHaveBeenCalled();
    await act(async () => dialog.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })));
    expect(close).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
