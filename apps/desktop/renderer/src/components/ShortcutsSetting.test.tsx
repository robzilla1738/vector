// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
import {ShortcutsSetting} from './ShortcutsSetting';
it('searches commands and stops recording when its Settings subview is hidden',async()=>{
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
  const host=document.createElement('div'),root=createRoot(host);document.body.append(host);
  const save=vi.fn().mockResolvedValue(true);
  try{
    await act(async()=>root.render(<ShortcutsSetting value={{}} onSave={save}/>));
    const total=host.querySelectorAll('.shortcut-row').length;
    const search=host.querySelector<HTMLInputElement>('[aria-label="Find keyboard shortcut"]')!;
    await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(search,'tab');search.dispatchEvent(new Event('input',{bubbles:true}));});
    expect(host.querySelectorAll('.shortcut-row').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('.shortcut-row').length).toBeLessThan(total);
    await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label^="Change "]')!.click());
    expect(host.textContent).toContain('Press keys');
    await act(async()=>root.render(<ShortcutsSetting value={{}} onSave={save} active={false}/>));
    const key=new KeyboardEvent('keydown',{key:'t',metaKey:true,bubbles:true,cancelable:true});
    await act(async()=>window.dispatchEvent(key));
    expect(key.defaultPrevented).toBe(false);
    expect(save).not.toHaveBeenCalled();
    expect(host.textContent).not.toContain('Press keys');
    expect(search.value).toBe('tab');
  }finally{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();}
});
