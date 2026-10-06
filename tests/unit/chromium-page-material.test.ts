import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {describe, expect, it} from 'vitest';

const header = readFileSync(new URL('../../chromium/test-fixtures/aux_page_material.h', import.meta.url), 'utf8');
const script = header.split('R"AUX(')[1]!.split(')AUX";')[0]!;
const setup = () => {
  const dom = new JSDOM('<html><body><a href="/">Page action</a></body></html>', {runScripts:'outside-only'});
  return {dom, update: (state: object) => dom.window.eval(`${script}(${JSON.stringify(state)});`)};
};
describe('candidate page material lifecycle', () => {
  it('keeps decoration inert, hidden from accessibility, and isolated from page styles', () => {
    const {dom,update} = setup(); update({enabled:true,toolbar:true});
    const host = dom.window.document.documentElement.lastElementChild!;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect((host as HTMLElement).style.pointerEvents).toBe('none');
    expect(host.shadowRoot).toBeNull();
    expect(dom.window.document.querySelector('a')?.textContent).toBe('Page action');
    dom.window.close();
  });
  it('preserves the same decoration during exit and rapid reopening, then removes it when disabled', () => {
    const {dom,update} = setup(); update({enabled:true,toolbar:true});
    const host = dom.window.document.documentElement.lastElementChild;
    update({enabled:true,toolbar:false,sidebar:{x:4,y:8,width:280,height:600}});
    expect(dom.window.document.documentElement.lastElementChild).toBe(host);
    update({enabled:true,toolbar:true});
    expect(dom.window.document.documentElement.lastElementChild).toBe(host);
    update({enabled:false}); expect(host?.isConnected).toBe(false);
    update({enabled:true,toolbar:true});
    expect(dom.window.document.documentElement.lastElementChild).not.toBe(host);
    dom.window.close();
  });
});
