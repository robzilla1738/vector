// @vitest-environment jsdom
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ActionMenu, ScrollArea, Tabs } from "./index";
import { Dialog, Menu } from "./dialog";
import { Popover } from "./popover";
import { useConfirm } from "./confirm";
import { Tooltip } from "./tooltip";
import { Toast } from "./toast";

let host: HTMLDivElement, root: Root;
const originalScroll = HTMLElement.prototype.scrollIntoView;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  if (originalScroll) HTMLElement.prototype.scrollIntoView = originalScroll;
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function key(node: Element, key: string, extra: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra });
  node.dispatchEvent(event);
  return event;
}

it("nested Dialog Escape and native cancel leave the enclosing Popover open and restore each opener", async () => {
  const escaped = vi.fn();
  window.addEventListener("keydown", escaped);
  function Fixture() {
    const [child, setChild] = useState(false);
    const opener = useRef<HTMLButtonElement>(null);
    return (
      <Popover label="Parent choices" trigger="Choose">
        {() => (
          <>
            <button hidden>Hidden</button>
            <button aria-disabled="true">Unavailable</button>
            <button ref={opener} onClick={() => setChild(true)}>
              Inspect
            </button>
            {child && (
              <Dialog label="Child details" returnFocus={opener} onClose={() => setChild(false)}>
                <button>Close with Escape</button>
              </Dialog>
            )}
          </>
        )}
      </Popover>
    );
  }
  try {
    await act(async () => root.render(<Fixture />));
    const outer = host.querySelector("button")!;
    await act(async () => outer.click());
    const inspect = document.querySelector<HTMLButtonElement>(
      'dialog[aria-label="Parent choices"] button:last-child',
    )!;
    expect(document.activeElement).toBe(inspect);
    await act(async () => inspect.click());
    await act(async () => key(document.activeElement!, "Escape"));
    expect(document.querySelector('[aria-label="Child details"]')).toBeNull();
    expect(document.querySelector('[aria-label="Parent choices"]')).not.toBeNull();
    expect(document.activeElement).toBe(inspect);
    expect(escaped).not.toHaveBeenCalled();
    await act(async () => inspect.click());
    await act(async () =>
      document
        .querySelector('[aria-label="Child details"]')!
        .dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })),
    );
    expect(document.activeElement).toBe(inspect);
    expect(document.querySelector('[aria-label="Parent choices"]')).not.toBeNull();
    await act(async () => key(inspect, "Escape"));
    expect(document.activeElement).toBe(outer);
  } finally {
    window.removeEventListener("keydown", escaped);
  }
});

it("menu-to-confirmation opens an alertdialog on Cancel and returns to the original menu trigger", async () => {
  function Fixture() {
    const { confirm, confirmation } = useConfirm();
    return (
      <>
        <ActionMenu
          label="Saved item"
          actions={[
            {
              label: "Remove…",
              onSelect: () => {
                void confirm({
                  title: "Remove saved item?",
                  description: "This affects this saved item.",
                  confirmLabel: "Remove",
                  danger: true,
                });
              },
            },
          ]}
        />
        {confirmation}
      </>
    );
  }
  await act(async () => root.render(<Fixture />));
  const trigger = host.querySelector("button")!;
  await act(async () => trigger.click());
  await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click());
  const alert = document.querySelector<HTMLElement>('[role="alertdialog"]')!;
  expect(alert).toBeTruthy();
  expect(document.activeElement?.textContent).toBe("Cancel");
  expect(document.getElementById(alert.getAttribute("aria-describedby")!)?.textContent).toContain(
    "this saved item",
  );
  await act(async () => key(document.activeElement!, "Escape"));
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("Popover replaces native autofocus when its first control is aria-disabled", async () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
    this.querySelector<HTMLButtonElement>("button")?.focus();
  };
  try {
    await act(async () =>
      root.render(
        <Popover label="Native choices" trigger="Choose">
          {() => (
            <>
              <button aria-disabled="true">Unavailable</button>
              <button>Available</button>
            </>
          )}
        </Popover>,
      ),
    );
    await act(async () => host.querySelector("button")!.click());
    expect(document.activeElement?.textContent).toBe("Available");
  } finally {
    if (originalShowModal) HTMLDialogElement.prototype.showModal = originalShowModal;
    else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  }
});

it("menu entry and arrows skip hidden, inert and aria-disabled controls", async () => {
  await act(async () =>
    root.render(
      <Menu label="Availability" onClose={() => {}}>
        <button role="menuitem" hidden>
          Hidden
        </button>
        <button role="menuitem" aria-disabled="true">
          Unavailable
        </button>
        <div inert>
          <button role="menuitem">Inert</button>
        </div>
        <button role="menuitem">Alpha</button>
        <button role="menuitem" style={{ visibility: "hidden" }}>
          Invisible
        </button>
        <button role="menuitem">Beta</button>
      </Menu>,
    ),
  );
  expect(document.activeElement?.textContent).toBe("Alpha");
  await act(async () => key(document.activeElement!, "ArrowDown"));
  expect(document.activeElement?.textContent).toBe("Beta");
  await act(async () => key(document.activeElement!, "a"));
  expect(document.activeElement?.textContent).toBe("Alpha");
});

it("Tabs retain a reachable stop after disabling selection and use focused identity for rapid keys", async () => {
  const change = vi.fn();
  await act(async () =>
    root.render(
      <Tabs
        label="View"
        value="disabled"
        onChange={change}
        panelId="view"
        items={[
          { value: "disabled", label: "Disabled", disabled: true },
          { value: "a", label: "A" },
          { value: "b", label: "B" },
          { value: "c", label: "C" },
        ]}
      />,
    ),
  );
  const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect([...tabs].filter((tab) => tab.tabIndex === 0)).toEqual([tabs[1]]);
  await act(async () => {
    tabs[1]!.focus();
    key(tabs[1]!, "ArrowRight");
    key(document.activeElement!, "ArrowRight");
  });
  expect(document.activeElement).toBe(tabs[3]);
  expect(change.mock.calls.map(([value]) => value)).toEqual(["b", "c"]);
  let down!: KeyboardEvent;
  await act(async () => {
    down = key(tabs[3]!, "ArrowDown");
    key(tabs[3]!, "Home", { metaKey: true });
  });
  expect(down.defaultPrevented).toBe(false);
  expect(change).toHaveBeenCalledTimes(2);
});

it("vertical Tabs use vertical arrows and horizontal RTL reverses left/right", async () => {
  const change = vi.fn();
  const items = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];
  await act(async () =>
    root.render(
      <Tabs
        label="Vertical"
        value="a"
        onChange={change}
        panelId="view"
        orientation="vertical"
        items={items}
      />,
    ),
  );
  await act(async () => key(host.querySelector("button")!, "ArrowDown"));
  expect(change).toHaveBeenLastCalledWith("b");
  await act(async () =>
    root.render(<Tabs label="RTL" value="a" onChange={change} panelId="view" items={items} />),
  );
  host.querySelector<HTMLElement>('[role="tablist"]')!.style.direction = "rtl";
  await act(async () => key(host.querySelector("button")!, "ArrowLeft"));
  expect(change).toHaveBeenLastCalledWith("b");
});

it("Tooltip is in its active dialog, dismisses before that dialog, and remains pointer-hoverable", async () => {
  vi.useFakeTimers();
  const close = vi.fn();
  await act(async () =>
    root.render(
      <Dialog label="Description owner" onClose={close}>
        <Tooltip content="Long description">{(id) => <button aria-describedby={id}>Explain</button>}</Tooltip>
      </Dialog>,
    ),
  );
  const button = document.querySelector<HTMLButtonElement>("dialog button")!;
  await act(async () => button.focus());
  const dialog = document.querySelector("dialog")!;
  expect(dialog.querySelector('[role="tooltip"]')).not.toBeNull();
  await act(async () => key(button, "Escape"));
  expect(close).not.toHaveBeenCalled();
  await act(async () => key(button, "Escape"));
  expect(close).toHaveBeenCalledOnce();
  await act(async () => button.blur());
  await act(async () => button.dispatchEvent(new MouseEvent("pointerover", { bubbles: true })));
  await act(async () =>
    button.dispatchEvent(new MouseEvent("pointerout", { bubbles: true, relatedTarget: document.body })),
  );
  const tip = document.querySelector('[role="tooltip"]')!;
  await act(async () => {
    tip.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(200);
  });
  expect(document.querySelector('[role="tooltip"]')).toBe(tip);
  await act(async () => {
    tip.dispatchEvent(new MouseEvent("pointerout", { bubbles: true, relatedTarget: document.body }));
    await vi.advanceTimersByTimeAsync(121);
  });
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});

it("Toast stays paused until both keyboard focus and pointer hover leave", async () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  await act(async () => root.render(<Toast id={1} text="Saved" kind="info" onDismiss={dismiss} />));
  const toast = host.firstElementChild!,
    button = host.querySelector("button")!;
  await act(async () => {
    button.focus();
    toast.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
  });
  await act(async () => {
    toast.dispatchEvent(new MouseEvent("pointerout", { bubbles: true, relatedTarget: document.body }));
    await vi.advanceTimersByTimeAsync(4000);
  });
  expect(dismiss).not.toHaveBeenCalled();
  await act(async () => {
    button.blur();
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(dismiss).toHaveBeenCalledOnce();
});

it("pointer-only Tooltip dismisses on Escape without moving focus", async () => {
  await act(async () =>
    root.render(
      <>
        <button>Elsewhere</button>
        <Tooltip content="Description">{(id) => <button aria-describedby={id}>Hover</button>}</Tooltip>
      </>,
    ),
  );
  const [elsewhere, trigger] = host.querySelectorAll("button");
  await act(async () => {
    elsewhere!.focus();
    trigger!.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
  });
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  await act(async () => key(elsewhere!, "Escape"));
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  expect(document.activeElement).toBe(elsewhere);
});

it("ScrollArea only fades overflowing edges and exposes overflow as a keyboard stop", async () => {
  await act(async () =>
    root.render(
      <ScrollArea aria-label="Items">
        <button>Item</button>
      </ScrollArea>,
    ),
  );
  const scroll = host.firstElementChild as HTMLElement;
  expect(scroll.hasAttribute("tabindex")).toBe(false);
  Object.defineProperties(scroll, {
    scrollHeight: { configurable: true, value: 300 },
    clientHeight: { configurable: true, value: 100 },
    scrollTop: { configurable: true, writable: true, value: 0 },
  });
  await act(async () => scroll.dispatchEvent(new Event("scroll")));
  expect(scroll.tabIndex).toBe(0);
  expect(scroll.dataset.fadeBottom).toBe("true");
  expect(scroll.dataset.fadeTop).toBeUndefined();
  await act(async () => {
    scroll.scrollTop = 200;
    scroll.dispatchEvent(new Event("scroll"));
  });
  expect(scroll.dataset.fadeBottom).toBeUndefined();
  expect(scroll.dataset.fadeTop).toBe("true");
});
