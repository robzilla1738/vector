import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source = readFileSync(new URL('../../docs/integration/proposed/webview/chrome/renderer/resources/extensions/aux_webview_element.js', import.meta.url), 'utf8');

test('staged element returns cancelled leases and rejects detach-before-ack races', async () => {
  const definitions = new Map(), loads = [], requests = [], detached = [];
  let notify;
  class Target {
    listeners = new Map();
    addEventListener(type, fn) { this.listeners.set(type, fn); }
    dispatchEvent(event) { this.listeners.get(event.type)?.(event); }
  }
  class Element extends Target {
    isConnected = false;
    attachShadow() { return { replaceChildren(...nodes) {
      for (const node of nodes) if (node.contentWindow) loads.push(() => node.dispatchEvent({type:'load'}));
    } }; }
  }
  const native = {
    listen(fn) { notify = fn; },
    allowDefinition(fn) { fn(); },
    attachTab(tab, window) { return new Promise((resolve) => requests.push({tab,window,resolve})); },
    detach(lease) { detached.push(lease); },
  };
  runInNewContext(source, {
    HTMLElement: Element,
    document: {createElement(tag) { const node = new Target(); node.style = {}; if(tag==='iframe') node.contentWindow={fixture:true}; return node; }},
    customElements: {get: (name) => definitions.get(name), define: (name, value) => definitions.set(name,value)},
    requireNative: (name) => { assert.equal(name,'aux_webview'); return native; },
    Event: class { constructor(type) { this.type=type; } },
  });
  const Type = definitions.get('webview');
  const first = new Type(); first.isConnected = true;
  const attached = first.attachTab(10); loads.shift()(); await Promise.resolve();
  assert.equal(requests[0].tab,10);
  requests[0].resolve('issued-one'); await attached;
  let events=0; first.addEventListener('detached',()=>events++);
  notify('issued-one'); assert.equal(events,1);
  const second = new Type(); second.isConnected = true;
  const cancelled = second.attachTab(11); loads.splice(0).forEach(fn=>fn()); await Promise.resolve();
  second.isConnected = false; second.disconnectedCallback();
  requests[1].resolve('issued-two');
  await assert.rejects(cancelled,/cancelled/);
  assert.deepEqual(detached,['issued-two']);
  const third = new Type(); third.isConnected=true;
  const raced = third.attachTab(12); loads.splice(0).forEach(fn=>fn()); await Promise.resolve();
  notify('issued-three'); requests[2].resolve('issued-three');
  await assert.rejects(raced,/detached while attaching/);
});
