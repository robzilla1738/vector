// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ImageViewer } from './ImageViewer';
import { ImagePreview } from './ImageSnapshot';
let host:HTMLDivElement, root:ReturnType<typeof createRoot>;
beforeEach(()=>{vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([{width:100}] as unknown as DOMRectList);host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('zooms the original local pixels with bounded controls and resets for a different image',async()=>{
  await act(async()=>root.render(<ImageViewer src="data:image/png;base64,AA==" alt="Screenshot"/>));
  const img=host.querySelector('img')!;
  Object.defineProperty(img,'naturalWidth',{value:800});
  await act(async()=>img.dispatchEvent(new Event('load')));
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Zoom image in"]')!.click());
  expect(img.style.width).toBe('1000px');
  expect(host.querySelector('output')?.textContent).toBe('125%');
  for(let i=0;i<20;i++)await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Zoom image in"]')!.click());
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Zoom image in"]')!.disabled).toBe(true);
  expect(img.style.width).toBe('3200px');
  await act(async()=>root.render(<ImageViewer src="data:image/png;base64,BB==" alt="Other screenshot"/>));
  expect(host.querySelector('output')?.textContent).toBe('Fit');
  expect(host.querySelector('img')?.style.width).toBe('');
});
it('keeps inclusion provenance visible and reports image decode failure',async()=>{
  const snapshot={dataUrl:'data:image/png;base64,AA==',image:{imageId:'img',chatId:'chat',filename:'page.png',width:800,height:600,createdAt:1,included:false,byteLength:1,mediaType:'image/png'}};
  await act(async()=>root.render(<ImagePreview snapshot={snapshot as never} onClose={()=>{}}/>));
  expect(host.textContent).toContain('Excluded from new replies');
  await act(async()=>host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not be displayed');
  expect(host.querySelector('[aria-label="Close image preview"]')).not.toBeNull();
});
