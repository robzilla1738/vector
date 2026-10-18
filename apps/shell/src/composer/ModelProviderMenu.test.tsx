// @vitest-environment jsdom
import { act, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Menu } from "../ui/dialog";
import { ModelProviderMenu } from "./ModelProviderMenu";

const observers: { targets: Set<Element>; notify(): void }[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  observers.length = 0;
  document.body.replaceChildren();
});

async function mount(width: number, regionRight = width, settings = false) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", 700);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "ResizeObserver",
    class {
      targets = new Set<Element>();
      constructor(callback: () => void) {
        observers.push({ targets: this.targets, notify: callback });
      }
      observe(target: Element) {
        this.targets.add(target);
      }
      disconnect() {
        this.targets.clear();
      }
    },
  );
  const bounds = {
    regionLeft: 280,
    regionRight,
    dialogLeft: 420,
    dialogTop: 280,
    triggerLeft: 430,
    triggerTop: 350,
  };
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.matches(".conversation"))
      return new DOMRect(bounds.regionLeft, 42, bounds.regionRight - bounds.regionLeft, 650);
    if (this.matches("dialog")) return new DOMRect(bounds.dialogLeft, bounds.dialogTop, 192, 360);
    if (this.matches("[data-model-root]")) return new DOMRect(bounds.triggerLeft, bounds.triggerTop, 172, 32);
    return new DOMRect();
  });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".composer-model-submenu") ? 208 : 192;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".composer-model-submenu") ? 288 : 360;
  });
  Element.prototype.scrollIntoView ??= () => {};
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const closed = vi.fn();
  function Picker() {
    const [visible, setVisible] = useState(true);
    const [open, setOpen] = useState(false);
    const anchor = useRef<HTMLButtonElement>(null);
    const search = useRef<HTMLInputElement>(null);
    const controls = (
      <>
        <div className="composer-model-search">
          <input ref={search} aria-label="Search models" />
        </div>
        <div className="composer-model-list">
          <ModelProviderMenu
            label="Provider"
            menuAnchor={anchor}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => {
              closed();
              setOpen(false);
            }}
          >
            <button type="button" role="menuitemradio" aria-checked="false">
              First model
            </button>
            <button type="button" role="menuitemradio" aria-checked="true">
              Second model
            </button>
          </ModelProviderMenu>
        </div>
        <button type="button" className="composer-model-settings">
          Settings
        </button>
      </>
    );
    return (
      <>
        <div className="conversation">
          <button ref={anchor} type="button">
            Original model control
          </button>
        </div>
        {visible && (
          <Menu
            label="Choose a model"
            className={settings ? "settings-test-menu" : "composer-model-picker"}
            anchor={anchor}
            returnFocus={anchor}
            initialFocusRef={search}
            onClose={() => setVisible(false)}
          >
            {settings ? <div className="settings-model-picker">{controls}</div> : controls}
          </Menu>
        )}
      </>
    );
  }
  await act(async () => root.render(<Picker />));
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Choose a model"]')!;
  const trigger = dialog.querySelector<HTMLButtonElement>("[data-model-root]")!;
  const key = async (target: HTMLElement, value: string, state: KeyboardEventInit = {}) =>
    act(async () => {
      target.dispatchEvent(
        new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true, ...state }),
      );
    });
  return {
    host,
    root,
    trigger,
    key,
    bounds,
    dialog,
    closed,
    panel: () => dialog.querySelector<HTMLElement>(".composer-model-submenu"),
    regionResize: async (right: number) =>
      act(async () => {
        bounds.regionRight = right;
        const region = host.querySelector(".conversation")!;
        for (const observer of observers) if (observer.targets.has(region)) observer.notify();
      }),
    dispose: async () => {
      await act(async () => root.unmount());
    },
  };
}

it.each([{ isComposing: true }, { keyCode: 229 }])(
  "retains the current menu and focus while composing: %j",
  async (state) => {
    const f = await mount(853);
    try {
      await act(async () => f.trigger.focus());
      await f.key(f.trigger, "ArrowRight", state);
      expect(f.panel()).toBeNull();
      expect(document.activeElement).toBe(f.trigger);
      await f.key(f.trigger, "ArrowRight");
      const model = document.activeElement as HTMLElement;
      for (const key of ["ArrowLeft", "Escape"]) {
        await f.key(model, key, state);
        expect(f.panel()?.contains(model)).toBe(true);
        expect(document.activeElement).toBe(model);
        expect(f.dialog.isConnected).toBe(true);
      }
      await f.key(model, "Escape");
      expect(f.panel()).toBeNull();
      expect(document.activeElement).toBe(f.trigger);
    } finally {
      await f.dispose();
    }
  },
);

it("nests choices for the actual573px page inside an853px window and restores controls/focus on Back", async () => {
  const f = await mount(853);
  try {
    await act(async () => f.trigger.click());
    const panel = f.panel()!;
    expect(panel.parentElement).toBe(f.dialog);
    expect(panel.classList.contains("composer-model-submenu-nested")).toBe(true);
    expect(f.dialog.querySelector<HTMLElement>(".composer-model-search")!.hidden).toBe(true);
    expect(f.trigger.closest<HTMLElement>(".composer-model-list")!.inert).toBe(true);
    expect(document.activeElement?.textContent).toBe("First model");
    await f.key(document.activeElement as HTMLElement, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Second model");
    await act(async () => panel.querySelector<HTMLButtonElement>(".composer-model-submenu-back")!.click());
    expect(f.panel()).toBeNull();
    expect(f.dialog.querySelector<HTMLElement>(".composer-model-search")!.hidden).toBe(false);
    expect(document.activeElement).toBe(f.trigger);
    await f.key(f.trigger, "ArrowRight");
    await f.key(document.activeElement as HTMLElement, "Escape");
    expect(f.panel()).toBeNull();
    expect(document.activeElement).toBe(f.trigger);
    expect(f.dialog.isConnected).toBe(true);
    await f.key(f.trigger, "Escape");
    expect(f.dialog.isConnected).toBe(false);
    expect(document.activeElement?.textContent).toBe("Original model control");
  } finally {
    await f.dispose();
  }
});

it("places wide choices as a direct child in dialog-local coordinates despite glass/borders/scroll", async () => {
  const f = await mount(1280);
  try {
    Object.defineProperties(f.dialog, { clientLeft: { value: 2 }, clientTop: { value: 2 } });
    f.dialog.scrollLeft = 4;
    f.dialog.scrollTop = 12;
    await f.key(f.trigger, "ArrowRight");
    const panel = f.panel()!;
    expect(panel.parentElement).toBe(f.dialog);
    expect(panel.classList.contains("popup-material")).toBe(true);
    expect(panel.style.left).toBe("192px");
    expect(panel.style.top).toBe("80px");
    expect(f.dialog.querySelector<HTMLElement>(".composer-model-search")!.hidden).toBe(false);
    await f.key(document.activeElement as HTMLElement, "ArrowLeft");
    expect(document.activeElement).toBe(f.trigger);
  } finally {
    await f.dispose();
  }
});

it("flips a wide submenu left and bounds its bottom before translating into its actual dialog", async () => {
  const f = await mount(1280);
  try {
    f.bounds.dialogLeft = 1090;
    f.bounds.triggerLeft = 1100;
    f.bounds.triggerTop = 650;
    await act(async () => f.trigger.click());
    const panel = f.panel()!;
    expect(Number.parseFloat(panel.style.left) + 1090).toBe(884);
    expect(Number.parseFloat(panel.style.top) + 280).toBe(404);
    expect(884 + 208).toBeLessThan(1280 - 8);
    expect(404 + 288).toBe(700 - 8);
  } finally {
    await f.dispose();
  }
});

it("changes to Back navigation when its page shrinks without window resize and preserves the focused model", async () => {
  const f = await mount(1280);
  try {
    await act(async () => f.trigger.click());
    await f.key(document.activeElement as HTMLElement, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Second model");
    await f.regionResize(853);
    expect(f.panel()!.classList.contains("composer-model-submenu-nested")).toBe(true);
    expect(f.panel()!.style.left).toBe("");
    expect(f.panel()!.style.top).toBe("");
    expect(document.activeElement?.textContent).toBe("Second model");
    await f.regionResize(1280);
    expect(f.panel()!.classList.contains("composer-model-submenu-nested")).toBe(false);
    expect(document.activeElement?.textContent).toBe("Second model");
    expect(f.dialog.querySelector<HTMLElement>(".composer-model-search")!.hidden).toBe(false);
  } finally {
    await f.dispose();
  }
});

it("uses the same owning-dialog and nested Back path for a Settings model root", async () => {
  const f = await mount(853, 853, true);
  try {
    await act(async () => f.trigger.click());
    expect(f.panel()!.parentElement?.className).toBe("settings-model-picker");
    expect(f.dialog.querySelector<HTMLElement>(".composer-model-search")!.hidden).toBe(true);
    await f.key(document.activeElement as HTMLElement, "ArrowLeft");
    expect(document.activeElement).toBe(f.trigger);
    expect(f.panel()).toBeNull();
    vi.stubGlobal("innerWidth", 1280);
    await f.regionResize(1280);
    await act(async () => f.trigger.click());
    expect(f.panel()!.parentElement).toBe(f.dialog);
    expect(f.panel()!.classList.contains("popup-material")).toBe(true);
  } finally {
    await f.dispose();
  }
});

it("retains the focused model when Settings moves the active portal between its root and dialog", async () => {
  const f = await mount(853, 853, true);
  try {
    await act(async () => f.trigger.click());
    await f.key(document.activeElement as HTMLElement, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Second model");
    vi.stubGlobal("innerWidth", 1280);
    await f.regionResize(1280);
    expect(f.panel()!.parentElement).toBe(f.dialog);
    expect(document.activeElement?.textContent).toBe("Second model");
    await f.regionResize(853);
    expect(f.panel()!.parentElement?.className).toBe("settings-model-picker");
    expect(document.activeElement?.textContent).toBe("Second model");
    expect(document.querySelectorAll("dialog")).toHaveLength(1);
    await f.key(document.activeElement as HTMLElement, "ArrowLeft");
    expect(document.activeElement).toBe(f.trigger);
  } finally {
    await f.dispose();
  }
});

it("ignores an original queued layout callback after submenu retirement", async () => {
  const f = await mount(1280);
  try {
    await act(async () => f.trigger.click());
    const region = f.host.querySelector(".conversation")!;
    const old = observers.find((observer) => observer.targets.has(region))!.notify;
    await f.key(document.activeElement as HTMLElement, "ArrowLeft");
    const calls = f.closed.mock.calls.length;
    await act(async () => old());
    expect(f.closed).toHaveBeenCalledTimes(calls);
    expect(f.panel()).toBeNull();
    expect(document.activeElement).toBe(f.trigger);
  } finally {
    await f.dispose();
  }
});
