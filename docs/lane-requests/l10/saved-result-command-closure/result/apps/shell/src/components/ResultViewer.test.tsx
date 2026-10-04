// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SavedResultPreview } from "./SavedResultPreview";
import { ResultCard } from "./ResultCard";
import { StructuredResult } from "./StructuredResult";
import { bridge } from "../bridge";
import { writeResultDraft } from "../result-drafts";

let host:HTMLDialogElement, root:ReturnType<typeof createRoot>;
beforeEach(()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);
  vi.stubGlobal("requestAnimationFrame",(fn:FrameRequestCallback)=>{fn(0);return 1;});
  vi.stubGlobal("cancelAnimationFrame",()=>{});
  const data=new Map<string,string>();
  vi.stubGlobal("localStorage",{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)});
  host=document.createElement('dialog');host.open=true;document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
const button=(name:string)=>[...host.querySelectorAll<HTMLButtonElement>('button')].find(node=>node.textContent===name)!;
const result={artifactId:'result-a',chatId:'chat-a',filename:'report.csv',mediaType:'text/csv',content:'Name,Value\nExample,42',createdAt:1,revision:2};

it('keeps export actions inside the active detail dialog and exports the saved content',async()=>{
  vi.spyOn(bridge,'invoke').mockResolvedValue(result);
  const save=vi.spyOn(bridge,'saveFile').mockResolvedValue(null);
  await act(async()=>root.render(<SavedResultPreview artifactId="result-a" chatId="chat-a" onClose={()=>{}}/>));
  expect(host.querySelector('.viewer-metadata')?.textContent).toContain('v2');
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Export result"]')!.click());
  const menu=document.body.querySelector<HTMLDialogElement>('[role="menu"]');
  expect(menu?.open).toBe(true);
  await act(async()=>menu!.querySelector<HTMLButtonElement>('button')!.click());
  expect(save).toHaveBeenCalledWith('report.csv',result.content);
  expect(document.body.querySelector('[role="menu"]')).toBeNull();
});

it('saves a durable edited copy as a new version and keeps source identity',async()=>{
  writeResultDraft('result-a',{chatId:'chat-a',source:result.content,content:'Name,Value\nEdited,43'});
  const invoke=vi.spyOn(bridge,'invoke').mockImplementation(async(method)=> method==='results.read'?result:{artifactId:'result-b',filename:'report.csv',revision:3});
  const saved=vi.fn();
  await act(async()=>root.render(<SavedResultPreview artifactId="result-a" chatId="chat-a" onClose={()=>{}} onVersionSaved={saved}/>));
  expect(host.querySelector('textarea')?.value).toContain('Edited,43');
  await act(async()=>button('Save version').click());
  expect(invoke).toHaveBeenCalledWith('results.saveVersion',{chatId:'chat-a',sourceArtifactId:'result-a',content:'Name,Value\nEdited,43'});
  expect(saved).toHaveBeenCalledWith('result-b');
});

it('blocks editing a changed source or displaying a different conversation result',async()=>{
  writeResultDraft('result-a',{chatId:'chat-a',source:'old source',content:'my edits'});
  vi.spyOn(bridge,'invoke').mockResolvedValue(result);
  await act(async()=>root.render(<SavedResultPreview artifactId="result-a" chatId="chat-a" onClose={()=>{}}/>));
  expect(button('Save version').disabled).toBe(true);
  expect(host.textContent).toContain('source changed');
  await act(async()=>root.render(<SavedResultPreview key="other" artifactId="result-a" chatId="other" onClose={()=>{}}/>));
  expect(host.textContent).toContain('another conversation');
  expect(host.querySelector('textarea')).toBeNull();
});

it('inspects CSV rows with keyboard and resets selection when content changes',async()=>{
  await act(async()=>root.render(<StructuredResult content={'A,B\nOne,Two'} mediaType="text/csv"/>));
  const row=host.querySelector<HTMLTableRowElement>('tbody tr')!;
  await act(async()=>row.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));
  expect(host.querySelector('[aria-label="Row 2 details"]')?.textContent).toContain('Two');
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Row 2');
  await act(async()=>root.render(<StructuredResult content="Changed" mediaType="text/plain"/>));
  expect(host.querySelector('.result-row-detail')).toBeNull();
  expect(host.textContent).toBe('Changed');
});

it('opens the exact result and never executes HTML excerpts in cards',async()=>{
  const open=vi.fn();
  await act(async()=>root.render(<ResultCard result={{...result,runId:'run-a',excerpt:'<img src="https://tracker.invalid/a"><script>bad()</script>',mediaType:'text/html',byteLength:120,turnGoal:'Report',included:true}} onOpen={open}/>));
  expect(host.querySelector('img,iframe,script')).toBeNull();
  expect(host.textContent).toContain('Interactive document');
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Open report.csv"]')!.click());
  expect(open).toHaveBeenCalledOnce();
});

it('preserves a truncated CSV excerpt without crashing the result card',async()=>{
  await act(async()=>root.render(<ResultCard result={{...result,runId:'run',excerpt:'Name,Notes\nExample,"unfinished',byteLength:3000,turnGoal:'Report',included:true}} onOpen={()=>{}}/>));
  expect(host.querySelector('pre')?.textContent).toBe('Name,Notes\nExample,"unfinished');
  expect(host.querySelector('[aria-label="Open report.csv"]')).not.toBeNull();
});
