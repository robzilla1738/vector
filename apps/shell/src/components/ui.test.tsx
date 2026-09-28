// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ActionMenu, Menu, Tabs } from "../ui";
import { LayoutChoice } from "./LayoutChoice";

it("opens the portaled menu, skips disabled actions, restores focus on Escape, and invokes only the selected action", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { fn(0); return 1; });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container), selected = vi.fn();
  try {
    await act(async () => root.render(<ActionMenu label="Chat actions" actions={[
      { label: "Unavailable", disabled: true, onSelect: vi.fn() },
      { label: "Rename", onSelect: selected },
      { label: "Archive", onSelect: vi.fn() },
    ]}/>));
    const trigger = container.querySelector("button")!;
    await act(async () => trigger.click());
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement?.textContent).toBe("Rename");
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowDown",bubbles:true})));
    expect(document.activeElement?.textContent).toBe("Archive");
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape",bubbles:true})));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await act(async () => trigger.click());
    await act(async () => (document.activeElement as HTMLButtonElement).click());
    expect(selected).toHaveBeenCalledOnce();
    expect(document.querySelector('[role="menu"]')).toBeNull();
  } finally { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); }
});

it("positions a pointer menu, moves among menu radios, and returns focus on Escape", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { fn(0); return 1; });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container), trigger = createRef<HTMLButtonElement>();
  let open = false;
  const render = () => root.render(<><button ref={trigger}>Trigger</button>{open && <Menu label="Folder actions" point={{ x: 42, y: 72 }} returnFocus={trigger}
    onClose={() => { open = false; render(); }} className="menu ctx-menu"><button role="menuitemradio" aria-checked="true">Violet</button>
    <button role="menuitemradio" aria-checked="false">Blue</button></Menu>}</>);
  try {
    await act(async () => render());
    trigger.current!.focus();
    await act(async () => { open = true; render(); });
    const menu = document.querySelector<HTMLDialogElement>('dialog[role="menu"]')!;
    expect(menu.style.left).toBe("42px");
    expect(document.activeElement?.textContent).toBe("Violet");
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(document.activeElement?.textContent).toBe("Blue");
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.querySelector('dialog[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.current);
  } finally { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); }
});

it("places an anchored menu above its trigger and focuses its search field", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { fn(0); return 1; });
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container), anchor = createRef<HTMLButtonElement>(), searchRef = createRef<HTMLInputElement>();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 100, top: 200, right: 180, bottom: 230 } as DOMRect);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(80);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(90);
  try {
    await act(async () => root.render(<><button ref={anchor}>Spaces</button><Menu label="Spaces" anchor={anchor}
      placement="above-start" initialFocusRef={searchRef} returnFocus={anchor} onClose={() => {}}>
      <input ref={searchRef} type="search" aria-label="Search Spaces" /><button role="menuitemradio" aria-checked="true">Personal</button>
    </Menu></>));
    const menu = document.querySelector<HTMLDialogElement>('dialog[role="menu"]')!;
    expect(menu.style.left).toBe("100px");
    expect(menu.style.top).toBe("112px");
    expect(document.activeElement).toBe(menu.querySelector('input[type="search"]'));
    await act(async () => root.render(<><button ref={anchor}>More</button><Menu label="Browser tools" anchor={anchor}
      placement="above-end" returnFocus={anchor} onClose={() => {}}><button role="menuitem">Settings</button></Menu></>));
    expect(menu.style.left).toBe("90px");
    expect(menu.style.top).toBe("112px");
  } finally { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); }
});

it("uses native radios for layout choice and roving focus for tabs", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container);
  const changeLayout = vi.fn();
  let selected: "chats" | "routines" = "chats";
  const render = () => root.render(<><LayoutChoice value="horizontal" onChange={changeLayout} />
    <Tabs<"chats" | "routines"> label="Recent work" value={selected} onChange={value => { selected = value; render(); }} panelId="test-panel"
      items={[{ value: "chats", label: "Chats" }, { value: "routines", label: "Routines" }]} />
    <div id="test-panel" role="tabpanel" aria-labelledby={`test-panel-${selected}`} /></>);
  try {
    await act(async () => render());
    const radios = [...container.querySelectorAll<HTMLInputElement>('.layout-choice input[type="radio"]')];
    expect(radios.map(radio => radio.checked)).toEqual([true, false]);
    await act(async () => radios[1]!.click());
    expect(changeLayout).toHaveBeenCalledWith("vertical");
    const chats = container.querySelector<HTMLButtonElement>('#test-panel-chats')!;
    chats.focus();
    await act(async () => chats.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(selected).toBe("routines");
    expect(document.activeElement).toBe(container.querySelector('#test-panel-routines'));
    expect(container.querySelector('#test-panel-routines')?.getAttribute("aria-selected")).toBe("true");
    expect(container.querySelector('#test-panel')?.getAttribute("aria-labelledby")).toBe("test-panel-routines");
  } finally { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); }
});
