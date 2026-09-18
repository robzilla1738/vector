// Official Speedometer 3.0 resources/benchmark-runner.mjs Page / PageElement /
// BenchmarkTestStep, document-backed (no iframe). Measurement matches
// RAFTestInvoker with waitBeforeSync=0 and warmupBeforeSync=0.
(function (global) {
  function getParent(lookupStartNode, path) {
    return path.reduce((root, selector) => {
      const node = root.querySelector(selector);
      return node.shadowRoot ?? node;
    }, lookupStartNode);
  }

  class Page {
    constructor() {
      this._frame = { contentDocument: document, contentWindow: window };
    }
    layout() {
      const body = this._frame.contentDocument.body.getBoundingClientRect();
      this.layout.e = document.elementFromPoint((body.width / 2) | 0, (body.height / 2) | 0);
    }
    async waitForElement(selector) {
      return new Promise((resolve) => {
        const resolveIfReady = () => {
          const element = this.querySelector(selector);
          let callback = resolveIfReady;
          if (element) callback = () => resolve(element);
          window.requestAnimationFrame(callback);
        };
        resolveIfReady();
      });
    }
    querySelector(selector, path = []) {
      const lookupStartNode = this._frame.contentDocument;
      const element = getParent(lookupStartNode, path).querySelector(selector);
      if (element === null) return null;
      return this._wrapElement(element);
    }
    querySelectorAll(selector, path = []) {
      const lookupStartNode = this._frame.contentDocument;
      const elements = Array.from(getParent(lookupStartNode, path).querySelectorAll(selector));
      for (let i = 0; i < elements.length; i++) elements[i] = this._wrapElement(elements[i]);
      return elements;
    }
    getElementById(id) {
      const element = this._frame.contentDocument.getElementById(id);
      if (element === null) return null;
      return this._wrapElement(element);
    }
    call(functionName) {
      this._frame.contentWindow[functionName]();
      return null;
    }
    callAsync(functionName) {
      setTimeout(() => {
        this._frame.contentWindow[functionName]();
      }, 0);
    }
    callToGetElement(functionName) {
      return this._wrapElement(this._frame.contentWindow[functionName]());
    }
    _wrapElement(element) {
      return new PageElement(element);
    }
  }

  const NATIVE_OPTIONS = { bubbles: true, cancellable: true };

  class PageElement {
    #node;
    constructor(node) {
      this.#node = node;
    }
    setValue(value) {
      this.#node.value = value;
    }
    click() {
      this.#node.click();
    }
    focus() {
      this.#node.focus();
    }
    getElementByMethod(name) {
      return new PageElement(this.#node[name]());
    }
    dispatchEvent(eventName, options = NATIVE_OPTIONS, eventType = Event) {
      if (eventName === "submit") this._dispatchSubmitEvent();
      else this.#node.dispatchEvent(new eventType(eventName, options));
    }
    _dispatchSubmitEvent() {
      const submitEvent = document.createEvent("Event");
      submitEvent.initEvent("submit", true, true);
      this.#node.dispatchEvent(submitEvent);
    }
    enter(type, options) {
      return this.dispatchKeyEvent(type, 13, "Enter", options);
    }
    dispatchKeyEvent(type, keyCode, key, options) {
      let eventOptions = { bubbles: true, cancelable: true, keyCode, which: keyCode, key };
      if (options !== undefined) eventOptions = Object.assign(eventOptions, options);
      this.#node.dispatchEvent(new KeyboardEvent(type, eventOptions));
    }
    dispatchMouseEvent(type, offsetX, offsetY, options) {
      const boundingRect = this.#node.getBoundingClientRect();
      const clientX = offsetX + boundingRect.x;
      const clientY = offsetY + boundingRect.y;
      const contentWindow = this.#node.ownerDocument.defaultView;
      const screenX = clientX + contentWindow.screenX;
      const screenY = clientY + contentWindow.screenY;
      let eventOptions = { bubbles: true, cancelable: true, clientX, clientY, screenX, screenY };
      if (options !== undefined) eventOptions = Object.assign(eventOptions, options);
      this.#node.dispatchEvent(new contentWindow.MouseEvent(type, eventOptions));
    }
    querySelectorInShadowRoot(selector, path = []) {
      const lookupStartNode = this.#node.shadowRoot ?? this.#node;
      const element = getParent(lookupStartNode, path).querySelector(selector);
      if (element === null) return null;
      return new PageElement(element);
    }
    querySelector(selector) {
      const element = this.#node.querySelector(selector);
      if (element === null) return null;
      return new PageElement(element);
    }
  }

  class BenchmarkTestStep {
    constructor(testName, testFunction) {
      this.name = testName;
      this.run = testFunction;
    }
  }

  global.Page = Page;
  global.PageElement = PageElement;
  global.BenchmarkTestStep = BenchmarkTestStep;
})(globalThis);
