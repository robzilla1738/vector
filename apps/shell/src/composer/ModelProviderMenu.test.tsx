// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { ModelProviderMenu } from "./ModelProviderMenu";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

async function mount(width: number) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Picker() {
    const [open, setOpen] = useState(false);
    return (
      <div className="composer-model-picker" role="menu">
        <input aria-label="Search models" />
        <div className="composer-model-list">
          <ModelProviderMenu
            label="Provider"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
          >
            <button type="button" role="menuitemradio" aria-checked="false">
              First model
            </button>
            <button type="button" role="menuitemradio" aria-checked="true">
              Second model
            </button>
          </ModelProviderMenu>
        </div>
      </div>
    );
  }
  await act(async () => root.render(<Picker />));
  const trigger = host.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
  const key = async (target: HTMLElement, value: string) =>
    act(async () => {
      for (const button of host.querySelectorAll("button")) button.scrollIntoView = vi.fn();
      target.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }));
    });
  return { host, root, trigger, key };
}

it("nests narrow choices in the original menu and restores its controls and focus on Back", async () => {
  const f = await mount(600);
  try {
    await act(async () => f.trigger.click());
    const owner = f.host.querySelector<HTMLElement>(".composer-model-picker")!;
    const panel = f.host.querySelector<HTMLElement>(".composer-model-submenu")!;
    expect(panel.parentElement).toBe(owner);
    expect(owner.querySelector("input")!.hidden).toBe(true);
    expect(f.trigger.closest<HTMLElement>(".composer-model-list")!.inert).toBe(true);
    expect(document.activeElement?.textContent).toBe("First model");
    await f.key(document.activeElement as HTMLElement, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Second model");
    await act(async () => panel.querySelector<HTMLButtonElement>(".composer-model-submenu-back")!.click());
    expect(f.host.querySelector(".composer-model-submenu")).toBeNull();
    expect(owner.querySelector("input")!.hidden).toBe(false);
    expect(document.activeElement).toBe(f.trigger);
    await f.key(f.trigger, "ArrowRight");
    await f.key(document.activeElement as HTMLElement, "Escape");
    expect(document.activeElement).toBe(f.trigger);
    expect(f.host.querySelector(".composer-model-submenu")).toBeNull();
  } finally {
    await act(async () => f.root.unmount());
  }
});

it("retains wide submenu placement and ArrowLeft focus return", async () => {
  const f = await mount(1024);
  try {
    await f.key(f.trigger, "ArrowRight");
    const panel = f.host.querySelector<HTMLElement>(".composer-model-submenu")!;
    expect(panel.parentElement).toBe(f.trigger.parentElement);
    expect(panel.classList.contains("popup-material")).toBe(true);
    expect(f.host.querySelector("input")!.hidden).toBe(false);
    await f.key(document.activeElement as HTMLElement, "ArrowLeft");
    expect(document.activeElement).toBe(f.trigger);
  } finally {
    await act(async () => f.root.unmount());
  }
});
