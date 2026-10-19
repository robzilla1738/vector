// Copyright 2026 Aux Authors. All rights reserved.
// Native extension module, loaded only for the exact private feature grant.
const native = requireNative('aux_webview');
const elements = new Map();
const retired = new Set();
native.listen((lease) => {
  const element = elements.get(lease);
  if (element) element.nativeDetached(lease);
  else {
    if (retired.size >= 32) retired.delete(retired.values().next().value);
    retired.add(lease);
  }
});
class AuxWebViewElement extends HTMLElement {
  #root;
  #iframe;
  #finishReady;
  #ready;
  #lease = null;
  #generation = 0;
  constructor() {
    super();
    this.#root = this.attachShadow({mode: 'closed'});
    // Keep the shadow reference private; no page can acquire the native bridge.
    this.createPlaceholder();
  }
  createPlaceholder() {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'width:100%;height:100%;border:0;display:block';
    frame.title = 'Live tab content';
    this.#ready = new Promise((resolve) => {
      this.#finishReady = resolve;
      frame.addEventListener('load', resolve, {once:true});
    });
    this.#iframe = frame;
    // A native module may retain a closed shadow root in a private field.
    const style = document.createElement('style');
    style.textContent = ':host{display:block}';
    this.#root.replaceChildren(style, frame);
  }
  connectedCallback() {}
  disconnectedCallback() {
    ++this.#generation;
    this.#finishReady();
    if (this.#lease) native.detach(this.#lease);
  }
  async attachTab(tabId) {
    if (!Number.isInteger(tabId) || tabId < 0) throw new TypeError('Expected a tab id');
    if (!this.isConnected) throw new Error('Webview is not connected');
    if (this.#lease) throw new Error('Webview already has an attached tab');
    const generation = ++this.#generation;
    await this.#ready;
    if (!this.isConnected || generation !== this.#generation)
      throw new Error('Webview attachment was cancelled');
    const lease = await native.attachTab(tabId, this.#iframe.contentWindow);
    if (retired.delete(lease)) throw new Error('Tab detached while attaching');
    if (!this.isConnected || generation !== this.#generation) {
      native.detach(lease);
      throw new Error('Webview attachment was cancelled');
    }
    this.#lease = lease;
    elements.set(lease, this);
  }
  nativeDetached(lease) {
    if (this.#lease !== lease) return;
    elements.delete(lease);
    this.#lease = null;
    ++this.#generation;
    this.createPlaceholder();
    this.dispatchEvent(new Event('detached'));
  }
}
// Preserve an existing real provider rather than replacing its element.
if (!customElements.get('webview')) {
  native.allowDefinition(() => customElements.define('webview', AuxWebViewElement));
}
