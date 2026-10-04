// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { ImagePreview, ImageSnapshot } from "./ImageSnapshot";
import { executeCommand } from "../commands";
import { bridge } from "../bridge";
const snapshot={dataUrl:"data:image/png;base64,AA==",image:{imageId:"image",chatId:"chat",artifactId:"artifact",filename:"original.png",width:800,height:400,byteLength:1,mediaType:"image/png" as const,createdAt:1,included:true}};
let root:ReturnType<typeof createRoot>,host:HTMLDivElement;
beforeEach(()=>{
 vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
 vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);
 host=document.createElement("div");document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function command(id:string){const node=host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;node.focus();await act(async()=>{await executeCommand(id);});}
it("remaps original Fit/100%/zoom controls without changing pixel dimensions, limits or metadata",async()=>{
 await act(async()=>root.render(<ImagePreview snapshot={snapshot} onClose={()=>{}}/>));
 const img=host.querySelector("img")!;Object.defineProperty(img,"naturalWidth",{value:800});await act(async()=>img.dispatchEvent(new Event("load")));
 await command("show-conversation-image-actual-size");expect(img.style.width).toBe("800px");
 await command("zoom-conversation-image-in");expect(img.style.width).toBe("1000px");
 await command("zoom-conversation-image-out");expect(img.style.width).toBe("800px");
 await command("fit-conversation-image");expect(img.style.width).toBe("");expect(host.querySelector("output")?.textContent).toBe("Fit");
 const details=host.querySelector("details")!;await command("toggle-conversation-image-details");expect(details.open).toBe(true);
 await act(async()=>details.querySelector("summary")!.click());expect(details.open).toBe(false);
 expect(host.textContent).toContain("Included in new replies");expect(img.src).toBe(snapshot.dataUrl);
});
it("refuses original focused controls immediately when the parent snapshot/native owner retires",async()=>{
 let current=true;await act(async()=>root.render(<ImagePreview snapshot={snapshot} current={()=>current} onClose={()=>{}}/>));
 const zoom=host.querySelector<HTMLElement>('[data-command-id="zoom-conversation-image-in"]')!;zoom.focus();current=false;
 await expect(executeCommand("zoom-conversation-image-in")).rejects.toThrow("current image control");
 expect(host.querySelector("output")?.textContent).toBe("Fit");
 const summary=host.querySelector<HTMLElement>("summary")!;summary.focus();await expect(executeCommand("toggle-conversation-image-details")).rejects.toThrow("current image details");
 expect(host.querySelector("details")!.open).toBe(false);
});
it("reserves original Retry synchronously and preserves the actual read error and original selected image ACK",async()=>{
 const original=new Error("original saved image read refusal");let done!:(value:unknown)=>void;
 const invoke=vi.spyOn(bridge,"invoke").mockRejectedValueOnce(original).mockImplementation(()=>new Promise(resolve=>{done=resolve;}));
 await act(async()=>root.render(<ImageSnapshot chatId="chat" imageId="image" onClose={()=>{}}/>));
 expect(host.querySelector('[role="alert"]')?.textContent).toContain(original.message);
 host.querySelector<HTMLElement>('[data-command-id="retry-conversation-image-preview"]')!.focus();let first!:Promise<unknown>,second!:Promise<unknown>;
 await act(async()=>{first=executeCommand("retry-conversation-image-preview");second=executeCommand("retry-conversation-image-preview");void second.catch(()=>{});await first;});
 await expect(second).rejects.toThrow("current image control");expect(invoke).toHaveBeenCalledTimes(2);
 expect(invoke).toHaveBeenLastCalledWith("conversations.images.read",{chatId:"chat",imageId:"image"});
 await act(async()=>done(snapshot));expect(host.querySelector("img")?.src).toBe(snapshot.dataUrl);
});
it("discards old read success after selected-image A→B→A and does not restart an unchanged read",async()=>{
 const held:Array<(value:unknown)=>void>=[];vi.spyOn(bridge,"invoke").mockImplementation(()=>new Promise(done=>held.push(done)));
 const render=async(id:string)=>act(async()=>root.render(<ImageSnapshot chatId="chat" imageId={id} onClose={()=>{}}/>));
 await render("A");await render("A");expect(held).toHaveLength(1);
 await render("B");await render("A");expect(held).toHaveLength(3);
 await act(async()=>held[0]!({...snapshot,dataUrl:"data:image/png;base64,old"}));expect(host.querySelector("img")).toBeNull();
 await act(async()=>held[2]!(snapshot));expect(host.querySelector("img")?.src).toBe(snapshot.dataUrl);
});
