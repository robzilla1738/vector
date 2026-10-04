// @vitest-environment jsdom
import { act, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Popover } from "./popover";
import { useNativeDialog } from "./native-dialog";

it("returns nested composer focus past a nonmodal education dialog without stealing newer focus", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  function Parent() {
    const [mounted, setMounted] = useState(true);
    return <><dialog open aria-label="Tabs stay one click away">Tab education</dialog>
      {mounted && <Popover label="Add context" trigger="Add context">{() => <Popover label="Browser context" trigger="Browser context">{() => <input aria-label="Find browser context" />}</Popover>}</Popover>}
      <button onClick={() => setMounted(false)}>New chat</button><textarea aria-label="New draft" /></>;
  }
  const button = (name: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent === name)!;
  const escape = async () => act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
  try {
    await act(async () => root.render(<Parent />));
    const original = button("Add context");
    await act(async () => original.click());
    const inner = document.querySelector<HTMLButtonElement>('dialog[aria-label="Add context"] button')!;
    await act(async () => inner.click());
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Find browser context");
    await escape(); expect(document.activeElement).toBe(inner);
    await escape(); expect(document.activeElement).toBe(original);
    await act(async () => original.click());
    const draft = host.querySelector<HTMLTextAreaElement>("textarea")!;
    await act(async () => { draft.focus(); button("New chat").click(); });
    expect(document.activeElement).toBe(draft);
    expect(document.querySelector('dialog[aria-label="Add context"]')).toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("uses actual modal acquisition order when retained dialogs are arranged in reverse DOM order", async () => {
 vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 let openFirst!:()=>void,openSecond!:()=>void,removeFirst!:()=>void;
 function Panel({open,name}:{open:boolean;name:string}) {const ref=useRef<HTMLDialogElement>(null);useNativeDialog(open,ref);return <dialog ref={ref} tabIndex={-1} aria-label={name}><button>{name}</button></dialog>;}
 function Parent(){const [first,setFirst]=useState(false),[second,setSecond]=useState(false);openFirst=()=>setFirst(true);openSecond=()=>setSecond(true);removeFirst=()=>setFirst(false);return <><Panel open={second} name="Newer"/><Panel open={first} name="Older"/></>;}
 try {
  await act(async()=>root.render(<Parent/>));await act(async()=>openFirst());await act(async()=>openSecond());
  const newer=host.querySelector<HTMLDialogElement>('dialog[aria-label="Newer"]')!;
  expect(document.activeElement).toBe(newer.querySelector("button"));
  await act(async()=>{newer.querySelector("button")!.remove();});
  expect(document.activeElement).toBe(newer);
  await act(async()=>removeFirst());expect(document.activeElement).toBe(newer);
 } finally {await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();}
});
