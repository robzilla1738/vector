// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { FileTree } from './FileTree';
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(()=>{vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
it('navigates folders and files from one tab stop without opening a folder as a file',async()=>{
 const open=vi.fn();await act(async()=>root.render(<FileTree paths={['README.md','src/nested/a.ts','src/b.ts']} onSelect={open}/>));
 const key=async(value:string)=>act(async()=>document.activeElement?.dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true})));
 await act(async()=>host.querySelector<HTMLButtonElement>('[tabindex="0"]')!.focus());
 expect(document.activeElement?.textContent).toBe('src');
 await key('ArrowRight');await key('ArrowRight');expect(document.activeElement?.textContent).toBe('nested');
 await key('ArrowRight');await key('ArrowRight');expect(document.activeElement?.textContent).toBe('a.ts');
 await act(async()=> (document.activeElement as HTMLButtonElement).click());expect(open).toHaveBeenCalledWith('src/nested/a.ts');
 await key('ArrowLeft');expect(document.activeElement?.textContent).toBe('nested');await key('ArrowLeft');
 expect(host.querySelector('[title="src/nested/a.ts"]')).toBeNull();
 await key('End');expect(document.activeElement?.textContent).toBe('README.md');
 expect(host.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
});
it('reveals search matches while retaining directory collapse controls',async()=>{
 await act(async()=>root.render(<FileTree paths={['src/nested/a.ts']} selected="src/nested/a.ts" expandAll onSelect={()=>{}}/>));
 expect(host.querySelector('[title="src/nested/a.ts"]')?.getAttribute('aria-selected')).toBe('true');
 await act(async()=>host.querySelector<HTMLButtonElement>('[title="src"]')!.click());
 expect(host.querySelector('[title="src/nested/a.ts"]')).toBeNull();
});
