// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { bridge } from '../bridge';
import { ContentMemory } from './ContentMemory';
let host:HTMLDivElement,root:ReturnType<typeof createRoot>;
beforeEach(()=>{vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.useFakeTimers();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('does not display an article that finishes reading after switching Spaces',async()=>{
  let finish:(value:unknown)=>void=()=>{};
  vi.spyOn(bridge,'onEvent').mockReturnValue(()=>{});
  vi.spyOn(bridge,'invoke').mockImplementation(async(method)=>{
    if(method==='workspaces.contentMemory.policy')return {enabled:true,retentionDays:30,allowedOrigins:['https://source.example']} as never;
    if(method==='workspaces.contentMemory.search')return [{memoryId:'article',title:'Recorded article',url:'https://source.example/article',snippet:'Saved text',capturedAt:1}] as never;
    if(method==='workspaces.contentMemory.get')return new Promise(resolve=>{finish=resolve;}) as never;
    throw new Error(`Unexpected ${method}`);
  });
  const render=(workspaceId:string)=>root.render(<ContentMemory memory={{workspaceId,revision:1,content:''}}/>);
  await act(async()=>render('first-space'));
  const input=host.querySelector<HTMLInputElement>('[aria-label="Search remembered articles"]')!;
  await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'article');input.dispatchEvent(new Event('input',{bubbles:true}));});
  await act(async()=>vi.advanceTimersByTimeAsync(200));
  await act(async()=>host.querySelector<HTMLButtonElement>('.ui-list-open')!.click());
  await act(async()=>render('second-space'));
  await act(async()=>finish({memoryId:'article',title:'Private first-space title',text:'First-space saved content',url:'https://source.example/article',capturedAt:1}));
  expect(host.textContent).not.toContain('Private first-space title');
  expect(host.querySelector('.content-memory-document')).toBeNull();
  expect(host.querySelector<HTMLInputElement>('[aria-label="Search remembered articles"]')!.value).toBe('');
});
