// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { bridge } from '../bridge';
import { useStore } from '../store';
import { workFixtures } from '../mock/work';
import { Routines } from './Routines';
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('requestAnimationFrame',(fn:FrameRequestCallback)=>{fn(0);return 1;});host=document.createElement('div');document.body.append(host);root=createRoot(host);useStore.setState({pages:[],activePageId:null,skillSelection:null}); });
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('pauses the exact listed revision from its overflow menu and keeps unbound Skills from resuming',async()=>{
  const handlers=workFixtures('workspace',true);
  const invoke=vi.spyOn(bridge,'invoke').mockImplementation((method,params)=>{
    const handler=handlers[method as keyof typeof handlers];
    if(!handler)return Promise.reject(new Error(`Unexpected ${method}`));
    return handler((params??{}) as Record<string,unknown>) as never;
  });
  await act(async()=>root.render(<Routines workspaceId="workspace"/>));
  expect(host.querySelectorAll('.ui-work-row')).toHaveLength(3);
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Actions for Weekly research brief"]')!.click());
  await act(async()=>[...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(b=>b.textContent==='Pause')!.click());
  expect(invoke).toHaveBeenCalledWith('routines.pause',{routineId:'preview-routine-0',expectedRevision:1,paused:true});
  expect(host.querySelector('.ui-work-row')?.textContent).toContain('Paused');
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Actions for Imported comparison template"]')!.click());
  expect([...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(b=>b.textContent==='Resume')!.disabled).toBe(true);
});
