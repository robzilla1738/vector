// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useConfirm } from "./confirm";
let host:HTMLDivElement,root:ReturnType<typeof createRoot>;
const result=vi.fn();
function Fixture(){const {confirm,confirmation}=useConfirm();return <><button onClick={()=>void confirm({title:"Original confirmation",description:"Original irreversible action",confirmLabel:"Confirm original",cancelLabel:"Keep original",danger:true}).then(result)}>Request confirmation</button>{confirmation}</>;}
function button(label:string){const node=[...document.body.querySelectorAll("button")].find(node=>node.textContent===label);if(!node)throw new Error(label);return node;}
beforeEach(()=>{vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);vi.spyOn(HTMLElement.prototype,"getClientRects").mockImplementation(()=>[{width:100}] as unknown as DOMRectList);result.mockReset();host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it("default confirm/cancel retain original decision and initial cancel focus",async()=>{
 await act(async()=>root.render(<Fixture/>));await act(async()=>button("Request confirmation").click());expect(document.activeElement).toBe(button("Keep original"));await act(async()=>button("Keep original").click());expect(result).toHaveBeenLastCalledWith(false);await act(async()=>button("Request confirmation").click());await act(async()=>button("Confirm original").click());expect(result).toHaveBeenLastCalledWith(true);expect(result).toHaveBeenCalledTimes(2);
});
it("default Escape and unmount settle only original pending decisions as refused",async()=>{
 await act(async()=>root.render(<Fixture/>));await act(async()=>button("Request confirmation").click());await act(async()=>document.querySelector('dialog')!.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true})));expect(result).toHaveBeenLastCalledWith(false);await act(async()=>button("Request confirmation").click());await act(async()=>root.render(null));expect(result).toHaveBeenLastCalledWith(false);expect(result).toHaveBeenCalledTimes(2);
});
it("an original opt-in settle closure cannot accept a replacement pending confirmation",async()=>{
 let originalConfirm:(()=>void)|undefined;
 function OwnedFixture(){const {confirm,confirmation}=useConfirm({confirmControl:(node,settle)=>{if(node&&!originalConfirm)originalConfirm=settle;}});return <><button onClick={()=>void confirm({title:"Owned decision",description:"Exact original",confirmLabel:"Confirm owned",cancelLabel:"Cancel owned"}).then(result)}>New owned decision</button>{confirmation}</>;}
 await act(async()=>root.render(<OwnedFixture/>));await act(async()=>button("New owned decision").click());await act(async()=>button("Cancel owned").click());expect(result).toHaveBeenCalledExactlyOnceWith(false);await act(async()=>button("New owned decision").click());await act(async()=>originalConfirm!());expect(result).toHaveBeenCalledTimes(1);expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();await act(async()=>button("Confirm owned").click());expect(result).toHaveBeenLastCalledWith(true);expect(result).toHaveBeenCalledTimes(2);
});
