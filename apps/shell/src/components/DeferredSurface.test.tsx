// @vitest-environment jsdom
import { act, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { deferSurface } from "./DeferredSurface";

vi.mock("../store", () => ({useStore:{getState:()=>({setOverlay:vi.fn(),setMode:vi.fn()})}}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT = true;

it("retries a failed module without remounting the surrounding browser", async () => {
  const errors = vi.spyOn(console,"error").mockImplementation(()=>{});
  let loads=0;
  const Surface=deferSurface(async()=>{ if(++loads===1)throw new Error("Module unavailable"); return {default:()=> <p>Settings ready</p>}; },"Settings");
  const host=document.createElement("div");document.body.appendChild(host);const root=createRoot(host);
  try {
    await act(async()=>{root.render(<><input defaultValue="Retained draft"/><Surface/></>);});
    const input=host.querySelector("input")!;
    expect(host.textContent).toContain("Settings couldn’t open");
    expect(host.textContent).toContain("Module unavailable");
    await act(async()=>{[...host.querySelectorAll("button")].find(button=>button.textContent==="Try again")!.click();});
    expect(host.textContent).toContain("Settings ready");
    expect(host.querySelector("input")).toBe(input);
    expect(input.value).toBe("Retained draft");
    expect(loads).toBe(2);
  } finally { act(()=>root.unmount());host.remove();errors.mockRestore(); }
});

it("lets an embedded surface close its own container while loading or after failure", async () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const close = vi.fn();
  let reject!: (error: Error) => void;
  const Surface = deferSurface(() => new Promise<{ default: ComponentType<object> }>((_, fail) => { reject = fail; }), "Set", true, false, close);
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () => { root.render(<Surface />); });
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    const region = host.querySelector('[role="region"]')!;
    await act(async () => { host.querySelector("button")!.click(); });
    expect(close).toHaveBeenCalledTimes(1);
    await act(async () => { region.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
    expect(close).toHaveBeenCalledTimes(2);
    await act(async () => { reject(new Error("Chunk unavailable")); });
    expect(host.textContent).toContain("Set couldn’t open");
    await act(async () => { [...host.querySelectorAll("button")].find(button => button.textContent === "Close")!.click(); });
    expect(close).toHaveBeenCalledTimes(3);
  } finally {
    act(() => root.unmount());
    host.remove();
    errors.mockRestore();
  }
});
