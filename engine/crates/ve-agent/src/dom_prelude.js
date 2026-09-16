(() => {
  const D = (op, ...a) => __ve.dom(op, ...a);
  const nodes = new Map();
  const registry = new Map();
  const listeners = new WeakMap();
  const store = (o) => {
    let m = listeners.get(o);
    if (!m) { m = new Map(); listeners.set(o, m); }
    return m;
  };

  class Event {
    constructor(type, init) {
      init = init || {};
      this.type = String(type);
      this.bubbles = !!init.bubbles;
      this.cancelable = !!init.cancelable;
      this.composed = init.composed !== undefined ? !!init.composed : this.type === "click" || this.type === "input" || this.type === "change";
      this.defaultPrevented = false;
      this.cancelBubble = false;
      this.target = null;
      this.currentTarget = null;
      this.eventPhase = 0;
      this.isTrusted = !!init.isTrusted;
      this.timeStamp = __ve.now();
      this.clientX = init.clientX || 0;
      this.clientY = init.clientY || 0;
      this.button = init.button || 0;
      this.key = init.key || "";
      this.code = init.code || "";
    }
    preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
    stopPropagation() { this.cancelBubble = true; }
    stopImmediatePropagation() { this.cancelBubble = true; this._stopImm = true; }
  }
  class MouseEvent extends Event { constructor(t, i) { super(t, i); } }
  class DragEvent extends MouseEvent {
    constructor(t, i) {
      super(t, i);
      this.dataTransfer = (i && i.dataTransfer) || {
        dropEffect: "move",
        effectAllowed: "all",
        files: [],
        items: [],
        types: [],
        setData() {},
        getData() { return ""; },
        clearData() {},
        setDragImage() {},
      };
    }
  }
  class KeyboardEvent extends Event { constructor(t, i) { super(t, i); } }
  class CustomEvent extends Event {
    constructor(t, i) { super(t, i); this.detail = i && i.detail; }
  }
  class UIEvent extends Event { constructor(t, i) { super(t, i); } }

  function composedPath(start) {
    const path = [];
    let n = start;
    while (n) {
      path.push(n);
      if (n instanceof ShadowRoot) n = n.host;
      else n = n.parentNode;
    }
    path.push(window);
    return path;
  }

  let upgrading = null;
  class EventTarget {
    constructor() {
      if (upgrading) return upgrading;
    }
    addEventListener(type, fn, opts) {
      if (typeof fn !== "function") return;
      const cap = !!(opts && (opts === true || opts.capture));
      const once = !!(opts && opts.once);
      const list = store(this);
      if (!list.has(type)) list.set(type, []);
      list.get(type).push({ fn, cap, once });
    }
    removeEventListener(type, fn, opts) {
      const cap = !!(opts && (opts === true || opts.capture));
      const arr = store(this).get(type);
      if (!arr) return;
      const i = arr.findIndex((x) => x.fn === fn && x.cap === cap);
      if (i >= 0) arr.splice(i, 1);
    }
    dispatchEvent(ev) {
      if (!ev || typeof ev.type !== "string") throw new TypeError("not an Event");
      ev.target = ev.target || this;
      const path = composedPath(this);
      const type = ev.type;
      const fire = (node, cap) => {
        if (ev._stopImm) return;
        ev.currentTarget = node;
        const arr = (listeners.get(node) && listeners.get(node).get(type)) || [];
        for (const l of arr.slice()) {
          if (l.cap !== cap) continue;
          try { l.fn.call(node, ev); } catch (e) { __ve.log("error", "Uncaught (in event) " + (e && e.stack || e)); }
          if (l.once) {
            const i = arr.indexOf(l);
            if (i >= 0) arr.splice(i, 1);
          }
          if (ev._stopImm) return;
        }
        const prop = node["on" + type];
        if (!cap && typeof prop === "function") {
          try { prop.call(node, ev); } catch (e) { __ve.log("error", String(e)); }
        }
      };
      ev.eventPhase = 1;
      for (let i = path.length - 1; i > 0; i--) {
        fire(path[i], true);
        if (ev.cancelBubble) break;
      }
      ev.eventPhase = 2;
      fire(path[0], true);
      fire(path[0], false);
      if (ev.bubbles && !ev.cancelBubble) {
        ev.eventPhase = 3;
        for (let i = 1; i < path.length; i++) {
          fire(path[i], false);
          if (ev.cancelBubble) break;
        }
      }
      ev.eventPhase = 0;
      ev.currentTarget = null;
      return !ev.defaultPrevented;
    }
  }

  function wrap(h) {
    if (h == null || h === "" || h === false) return null;
    let n = nodes.get(h);
    if (n) return n;
    const info = D("describe", h);
    if (!info) return null;
    let proto = Node.prototype;
    if (info.t === 9) proto = Document.prototype;
    else if (info.t === 11 && info.shadow) proto = ShadowRoot.prototype;
    else if (info.t === 11) proto = DocumentFragment.prototype;
    else if (info.t === 3) proto = Text.prototype;
    else if (info.t === 8) proto = Comment.prototype;
    else if (info.t === 1) {
      const tag = info.name;
      proto = (HTML[tag] || HTMLElement).prototype;
    }
    n = Object.create(proto);
    n.__h = h;
    nodes.set(h, n);
    const ctor = info.t === 1 && registry.get(info.name);
    if (ctor && !n.__upgraded) {
      n.__upgraded = true;
      Object.setPrototypeOf(n, ctor.prototype);
      upgrading = n;
      try { new ctor(); } catch (e) { __ve.log("error", String(e)); }
      upgrading = null;
      try { if (typeof n.connectedCallback === "function") n.connectedCallback(); } catch (e) { __ve.log("error", String(e)); }
    }
    return n;
  }
  function handleOf(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    return v.__h || "";
  }
  function list(arr) {
    const out = [];
    if (!arr) return out;
    for (const h of arr) {
      const n = wrap(h);
      if (n) out.push(n);
    }
    out.item = (i) => out[i] || null;
    return out;
  }

  class Node extends EventTarget {
    get nodeType() { return D("nodeType", this.__h); }
    get nodeName() { return D("nodeName", this.__h); }
    get nodeValue() { return D("nodeValue", this.__h); }
    set nodeValue(v) { D("setNodeValue", this.__h, v == null ? "" : String(v)); }
    get textContent() { return D("textContent", this.__h); }
    set textContent(v) { D("setTextContent", this.__h, v == null ? "" : String(v)); }
    get parentNode() { return wrap(D("parentNode", this.__h)); }
    get parentElement() {
      const p = this.parentNode;
      return p && p.nodeType === 1 ? p : null;
    }
    get firstChild() { return wrap(D("firstChild", this.__h)); }
    get lastChild() { return wrap(D("lastChild", this.__h)); }
    get previousSibling() { return wrap(D("prevSibling", this.__h)); }
    get nextSibling() { return wrap(D("nextSibling", this.__h)); }
    get childNodes() { return list(D("childNodes", this.__h)); }
    get isConnected() { return !!D("isConnected", this.__h); }
    get ownerDocument() { return document; }
    appendChild(n) { D("appendChild", this.__h, handleOf(n)); return n; }
    insertBefore(n, ref) { D("insertBefore", this.__h, handleOf(n), handleOf(ref)); return n; }
    removeChild(n) { D("removeChild", this.__h, handleOf(n)); return n; }
    replaceChild(n, old) { D("replaceChild", this.__h, handleOf(n), handleOf(old)); return old; }
    cloneNode(deep) { return wrap(D("cloneNode", this.__h, !!deep)); }
    contains(n) { return !!D("contains", this.__h, handleOf(n)); }
    hasChildNodes() { return this.childNodes.length > 0; }
    isEqualNode(n) { return !!(n && n.__h && D("isEqualNode", this.__h, n.__h)); }
    getRootNode(opts) { return wrap(D("getRootNode", this.__h, !!(opts && opts.composed))) || this; }
  }
  Node.ELEMENT_NODE = 1; Node.TEXT_NODE = 3; Node.COMMENT_NODE = 8;
  Node.DOCUMENT_NODE = 9; Node.DOCUMENT_TYPE_NODE = 10; Node.DOCUMENT_FRAGMENT_NODE = 11;

  class CharacterData extends Node {
    get data() { return this.nodeValue || ""; }
    set data(v) { this.nodeValue = v; }
    get length() { return this.data.length; }
  }
  class Text extends CharacterData {}
  class Comment extends CharacterData {}
  class DocumentFragment extends Node {
    querySelector(s) { return wrap(D("querySelector", this.__h, String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", this.__h, String(s))); }
    getElementById(id) { return wrap(D("getElementByIdScoped", this.__h, String(id))); }
    get children() { return list(D("children", this.__h)); }
    append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? document.createTextNode(n) : n); }
  }
  class ShadowRoot extends DocumentFragment {
    get mode() { return D("shadowMode", this.__h); }
    get host() { return wrap(D("host", this.__h)); }
    get innerHTML() { return D("innerHTML", this.__h); }
    set innerHTML(v) { D("setInnerHTML", this.__h, String(v)); }
  }

  function styleProxy(handle) {
    const decl = {
      getPropertyValue(name) { return D("computed", handle, String(name)) || ""; },
      setProperty(name, value) { D("setStyle", handle, String(name), value == null ? "" : String(value)); },
      removeProperty(name) { const old = this.getPropertyValue(name); D("setStyle", handle, String(name), ""); return old; },
      get cssText() { return D("getAttr", handle, "style") || ""; },
      set cssText(v) { D("setAttr", handle, "style", String(v)); },
    };
    return new Proxy(decl, {
      get(t, p) {
        if (p in t) return t[p];
        if (typeof p === "string" && p !== "toJSON") {
          const name = p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          return t.getPropertyValue(name);
        }
        return undefined;
      },
      set(t, p, v) {
        if (p === "cssText") { t.cssText = v; return true; }
        if (typeof p === "string") {
          const name = p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          t.setProperty(name, v);
          return true;
        }
        return false;
      },
    });
  }

  class DOMTokenList {
    constructor(h) { this.__h = h; }
    get length() { return (D("getAttr", this.__h, "class") || "").trim().split(/\s+/).filter(Boolean).length; }
    toString() { return D("getAttr", this.__h, "class") || ""; }
    contains(c) { return (" " + this.toString() + " ").includes(" " + c + " "); }
    add(...cs) { D("classAdd", this.__h, cs.join(" ")); }
    remove(...cs) { D("classRemove", this.__h, cs.join(" ")); }
    toggle(c, force) {
      const has = this.contains(c);
      if (force === true || (!has && force !== false)) { this.add(c); return true; }
      this.remove(c); return false;
    }
    item(i) { return (this.toString().trim().split(/\s+/).filter(Boolean)[i]) || null; }
    [Symbol.iterator]() { return this.toString().trim().split(/\s+/).filter(Boolean)[Symbol.iterator](); }
  }

  class Element extends Node {
    get tagName() { return D("tagName", this.__h); }
    get localName() { return D("localName", this.__h); }
    get namespaceURI() { return D("namespaceURI", this.__h); }
    get id() { return D("getAttr", this.__h, "id") || ""; }
    set id(v) { D("setAttr", this.__h, "id", String(v)); }
    get className() { return D("getAttr", this.__h, "class") || ""; }
    set className(v) { D("setAttr", this.__h, "class", String(v)); }
    get classList() { return new DOMTokenList(this.__h); }
    get innerHTML() { return D("innerHTML", this.__h); }
    set innerHTML(v) { D("setInnerHTML", this.__h, String(v)); }
    get outerHTML() { return D("outerHTML", this.__h); }
    set outerHTML(v) { D("setOuterHTML", this.__h, String(v)); }
    get children() { return list(D("children", this.__h)); }
    get childElementCount() { return this.children.length; }
    get firstElementChild() { return wrap(D("firstElementChild", this.__h)); }
    get lastElementChild() { return wrap(D("lastElementChild", this.__h)); }
    get nextElementSibling() { return wrap(D("nextElementSibling", this.__h)); }
    get previousElementSibling() { return wrap(D("prevElementSibling", this.__h)); }
    getAttribute(n) { const v = D("getAttr", this.__h, String(n)); return v == null ? null : v; }
    setAttribute(n, v) { D("setAttr", this.__h, String(n), String(v)); }
    removeAttribute(n) { D("removeAttr", this.__h, String(n)); }
    hasAttribute(n) { return !!D("hasAttr", this.__h, String(n)); }
    getAttributeNS(ns, n) { return this.getAttribute(n); }
    setAttributeNS(ns, n, v) { this.setAttribute(n, v); }
    querySelector(s) { return wrap(D("querySelector", this.__h, String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", this.__h, String(s))); }
    matches(s) { return !!D("matches", this.__h, String(s)); }
    closest(s) { return wrap(D("closest", this.__h, String(s))); }
    getElementsByTagName(n) { return list(D("getElementsByTagName", this.__h, String(n))); }
    getElementsByClassName(n) { return list(D("getElementsByClassName", this.__h, String(n))); }
    attachShadow(init) { return wrap(D("attachShadow", this.__h, (init && init.mode) || "open")); }
    get shadowRoot() { return wrap(D("shadowRoot", this.__h)); }
    remove() { D("remove", this.__h); }
    insertAdjacentHTML(pos, html) { D("insertAdjacentHTML", this.__h, String(pos), String(html)); }
    getBoundingClientRect() { return D("boundingRect", this.__h); }
    get clientWidth() { return D("box", this.__h, "clientWidth"); }
    get clientHeight() { return D("box", this.__h, "clientHeight"); }
    get offsetWidth() { return D("box", this.__h, "offsetWidth"); }
    get offsetHeight() { return D("box", this.__h, "offsetHeight"); }
    get offsetTop() { return D("box", this.__h, "offsetTop"); }
    get offsetLeft() { return D("box", this.__h, "offsetLeft"); }
    get scrollWidth() { return D("box", this.__h, "scrollWidth"); }
    get scrollHeight() { return D("box", this.__h, "scrollHeight"); }
    get scrollTop() { return D("box", this.__h, "scrollTop"); }
    set scrollTop(v) { D("setScroll", this.__h, "y", Number(v) || 0); this.dispatchEvent(new Event("scroll")); }
    get scrollLeft() { return D("box", this.__h, "scrollLeft"); }
    set scrollLeft(v) { D("setScroll", this.__h, "x", Number(v) || 0); this.dispatchEvent(new Event("scroll")); }
    get dataset() {
      const raw = D("dataset", this.__h) || {};
      const h = this.__h;
      return new Proxy(raw, {
        set(_, k, v) { D("setDataset", h, String(k), String(v)); raw[k] = String(v); return true; },
        get(t, k) { return t[k]; },
      });
    }
    get style() { return styleProxy(this.__h); }
    set style(v) { D("setAttr", this.__h, "style", String(v)); }
    get assignedSlot() { return null; }
  }

  class HTMLElement extends Element {
    get hidden() { return this.hasAttribute("hidden"); }
    set hidden(v) { v ? this.setAttribute("hidden", "") : this.removeAttribute("hidden"); }
    get innerText() { return this.textContent; }
    set innerText(v) { this.textContent = v; }
    get title() { return this.getAttribute("title") || ""; }
    set title(v) { this.setAttribute("title", v); }
    click() {
      const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
      if (this.dispatchEvent(ev)) D("activate", this.__h);
    }
    focus() { D("focus", this.__h); this.dispatchEvent(new Event("focus", { bubbles: false })); }
    blur() { D("blur", this.__h); this.dispatchEvent(new Event("blur", { bubbles: false })); }
    get value() { const v = D("formValue", this.__h); return v == null ? "" : v; }
    set value(v) { D("setFormValue", this.__h, String(v)); this.dispatchEvent(new Event("input", { bubbles: true })); }
    get checked() { return !!D("checked", this.__h); }
    set checked(v) { D("setChecked", this.__h, !!v); }
    get selected() { return !!D("selected", this.__h); }
    set selected(v) { D("setSelected", this.__h, !!v); }
    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(v) { v ? this.setAttribute("disabled", "") : this.removeAttribute("disabled"); }
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v); }
    get type() { return this.getAttribute("type") || ""; }
    set type(v) { this.setAttribute("type", v); }
    get href() { return this.getAttribute("href") || ""; }
    set href(v) { this.setAttribute("href", v); }
    get src() { return this.getAttribute("src") || ""; }
    set src(v) { this.setAttribute("src", v); }
    get placeholder() { return this.getAttribute("placeholder") || ""; }
    set placeholder(v) { this.setAttribute("placeholder", v); }
  }
  class HTMLInputElement extends HTMLElement {}
  class HTMLTextAreaElement extends HTMLElement {}
  class HTMLSelectElement extends HTMLElement {
    get options() { return this.querySelectorAll("option"); }
    get selectedIndex() {
      const opts = this.options;
      for (let i = 0; i < opts.length; i++) if (opts[i].selected) return i;
      return -1;
    }
    set selectedIndex(i) {
      const opts = this.options;
      for (let j = 0; j < opts.length; j++) opts[j].selected = j === i;
    }
  }
  class HTMLOptionElement extends HTMLElement {}
  class HTMLButtonElement extends HTMLElement {}
  class HTMLFormElement extends HTMLElement {
    submit() { D("submit", this.__h); }
    reset() { D("reset", this.__h); }
    get elements() { return this.querySelectorAll("input,select,textarea,button"); }
  }
  class HTMLAnchorElement extends HTMLElement {}
  class HTMLImageElement extends HTMLElement {
    get naturalWidth() { return D("box", this.__h, "naturalWidth"); }
    get naturalHeight() { return D("box", this.__h, "naturalHeight"); }
    get complete() { return true; }
  }
  class HTMLIFrameElement extends HTMLElement {
    get contentDocument() {
      const h = D("frameDocument", this.__h);
      if (!h) return null;
      const n = wrap(h);
      if (n && Document && !(n instanceof Document)) Object.setPrototypeOf(n, Document.prototype);
      return n;
    }
    get contentWindow() {
      const doc = this.contentDocument;
      if (!doc) return null;
      return { document: doc, frameElement: this, closed: false };
    }
  }
  class HTMLCanvasElement extends HTMLElement {
    getContext() {
      const noop = () => {};
      return new Proxy({}, { get: (_, p) => p === "canvas" ? this : noop });
    }
    toDataURL() { return "data:image/png;base64,"; }
  }
  const HTML = {
    input: HTMLInputElement, textarea: HTMLTextAreaElement, select: HTMLSelectElement,
    option: HTMLOptionElement, button: HTMLButtonElement, form: HTMLFormElement,
    a: HTMLAnchorElement, img: HTMLImageElement, iframe: HTMLIFrameElement, canvas: HTMLCanvasElement,
  };

  class Document extends Node {
    get documentElement() { return wrap(D("documentElement")); }
    get head() { return wrap(D("head")); }
    get body() { return wrap(D("body")); }
    get title() { return D("title"); }
    set title(v) { D("setTitle", String(v)); }
    get URL() { return D("url"); }
    get documentURI() { return D("url"); }
    get characterSet() { return "UTF-8"; }
    get charset() { return "UTF-8"; }
    get compatMode() { return D("compatMode"); }
    get cookie() { return D("cookie"); }
    set cookie(v) { D("setCookie", String(v)); }
    get defaultView() { return window; }
    get readyState() { return "complete"; }
    get hidden() { return false; }
    get visibilityState() { return "visible"; }
    createElement(name) { return wrap(D("createElement", String(name))); }
    createElementNS(ns, name) { return wrap(D("createElementNS", ns == null ? "" : String(ns), String(name))); }
    createTextNode(data) { return wrap(D("createTextNode", String(data))); }
    createComment(data) { return wrap(D("createComment", String(data))); }
    createDocumentFragment() { return wrap(D("createFragment")); }
    createEvent(t) { return new Event(t); }
    getElementById(id) { return wrap(D("getElementById", String(id))); }
    querySelector(s) { return wrap(D("querySelector", "", String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", "", String(s))); }
    getElementsByTagName(n) { return list(D("getElementsByTagName", "", String(n))); }
    getElementsByClassName(n) { return list(D("getElementsByClassName", "", String(n))); }
    getElementsByName(n) { return this.querySelectorAll("[name=\"" + CSS.escape(String(n)) + "\"]"); }
    importNode(n, deep) { return n.cloneNode(!!deep); }
    adoptNode(n) { return n; }
    write() {}
    writeln() {}
    open() {}
    close() {}
  }

  function storage(area) {
    return {
      getItem(k) { const v = D("storageGet", area, String(k)); return v == null ? null : v; },
      setItem(k, v) { D("storageSet", area, String(k), String(v)); },
      removeItem(k) { D("storageRemove", area, String(k)); },
      clear() { D("storageClear", area); },
      key(i) { return D("storageKey", area, i | 0); },
      get length() { return D("storageLength", area); },
    };
  }

  class Location {
    toString() { return D("locationGet", "href"); }
    get href() { return D("locationGet", "href"); }
    set href(v) { D("locationSet", "href", String(v)); }
    get protocol() { return D("locationGet", "protocol"); }
    get host() { return D("locationGet", "host"); }
    get hostname() { return D("locationGet", "hostname"); }
    get port() { return D("locationGet", "port"); }
    get pathname() { return D("locationGet", "pathname"); }
    get search() { return D("locationGet", "search"); }
    get hash() { return D("locationGet", "hash"); }
    get origin() { return D("locationGet", "origin"); }
    assign(v) { this.href = v; }
    replace(v) { D("locationSet", "replace", String(v)); }
    reload() { D("reload"); }
  }

  class History {
    get length() { return D("historyLength"); }
    get state() { try { return JSON.parse(D("historyState") || "null"); } catch { return null; } }
    back() { D("historyGo", -1); }
    forward() { D("historyGo", 1); }
    go(n) { D("historyGo", n | 0); }
    pushState(state, title, url) { D("pushState", JSON.stringify(state ?? null), url == null ? "" : String(url)); }
    replaceState(state, title, url) { D("replaceState", JSON.stringify(state ?? null), url == null ? "" : String(url)); }
  }

  class CustomElementRegistry {
    define(name, ctor) {
      name = String(name).toLowerCase();
      registry.set(name, ctor);
      const found = D("querySelectorAll", "", name) || [];
      for (const h of found) {
        const existing = nodes.get(h);
        if (existing && existing.__upgraded) continue;
        if (existing) nodes.delete(h);
        wrap(h);
      }
    }
    get(name) { return registry.get(String(name).toLowerCase()); }
    whenDefined(name) { return Promise.resolve(this.get(name)); }
    upgrade() {}
  }

  class MutationObserver {
    constructor(cb) { this._cb = cb; this._rev = D("revision"); this._on = false; observers.push(this); }
    observe() { this._on = true; this._rev = D("revision"); }
    disconnect() { this._on = false; }
    takeRecords() { return []; }
  }
  const observers = [];
  class IntersectionObserver {
    constructor(cb) { this._cb = cb; this._t = []; }
    observe(t) { this._t.push(t); queueMicrotask(() => this._fire()); }
    unobserve(t) { this._t = this._t.filter((x) => x !== t); }
    disconnect() { this._t = []; }
    _fire() {
      const recs = this._t.map((t) => {
        const r = t.getBoundingClientRect();
        const hit = r.width > 0 && r.height > 0;
        return { target: t, isIntersecting: hit, intersectionRatio: hit ? 1 : 0, boundingClientRect: r, time: performance.now() };
      });
      this._cb(recs, this);
    }
  }
  class ResizeObserver {
    constructor(cb) { this._cb = cb; this._t = []; }
    observe(t) { this._t.push(t); queueMicrotask(() => this._fire()); }
    unobserve(t) { this._t = this._t.filter((x) => x !== t); }
    disconnect() { this._t = []; }
    _fire() {
      this._cb(this._t.map((t) => ({ target: t, contentRect: t.getBoundingClientRect() })), this);
    }
  }

  class FormData {
    constructor(form) {
      this._ = [];
      if (form && form.elements) {
        for (const el of form.elements) {
          if (!el.name) continue;
          if ((el.type === "checkbox" || el.type === "radio") && !el.checked) continue;
          this.append(el.name, el.value);
        }
      }
    }
    append(k, v) { this._.push([String(k), String(v)]); }
    set(k, v) { this.delete(k); this.append(k, v); }
    get(k) { const x = this._.find((e) => e[0] === String(k)); return x ? x[1] : null; }
    getAll(k) { return this._.filter((e) => e[0] === String(k)).map((e) => e[1]); }
    has(k) { return this._.some((e) => e[0] === String(k)); }
    delete(k) { this._ = this._.filter((e) => e[0] !== String(k)); }
    *entries() { yield* this._; }
    [Symbol.iterator]() { return this.entries(); }
  }

  class XMLHttpRequest extends EventTarget {
    constructor() { super(); this.readyState = 0; this.status = 0; this.responseText = ""; this.response = ""; this.onload = null; this.onerror = null; this.onreadystatechange = null; }
    open(method, url) { this._m = method; this._u = url; this.readyState = 1; }
    setRequestHeader() {}
    send(body) {
      try {
        const r = D("fetch", String(this._u), this._m || "GET", "", body == null ? "" : String(body));
        this.status = r.status; this.responseText = r.body; this.response = r.body; this.readyState = 4;
        if (this.onreadystatechange) this.onreadystatechange();
        this.dispatchEvent(new Event("load"));
        if (this.onload) this.onload();
      } catch (e) {
        this.readyState = 4;
        this.dispatchEvent(new Event("error"));
        if (this.onerror) this.onerror(e);
      }
    }
    abort() {}
  }
  XMLHttpRequest.UNSENT = 0; XMLHttpRequest.OPENED = 1; XMLHttpRequest.HEADERS_RECEIVED = 2; XMLHttpRequest.LOADING = 3; XMLHttpRequest.DONE = 4;

  function fetchImpl(url, init) {
    init = init || {};
    return new Promise((resolve, reject) => {
      try {
        const headers = JSON.stringify(init.headers || {});
        const r = D("fetch", String(url && url.url ? url.url : url), init.method || "GET", headers, init.body == null ? "" : String(init.body));
        const body = r.body;
        resolve({
          ok: r.status >= 200 && r.status < 300,
          status: r.status,
          statusText: r.statusText || "",
          url: r.url,
          redirected: !!r.redirected,
          headers: { get(n) { n = String(n).toLowerCase(); return (r.headers && r.headers[n]) || null; }, has(n) { return this.get(n) != null; } },
          text() { return Promise.resolve(body); },
          json() { return Promise.resolve(JSON.parse(body || "null")); },
          arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); },
          blob() { return Promise.resolve({ size: body.length, type: "" }); },
          clone() { return this; },
        });
      } catch (e) { reject(e); }
    });
  }

  class URL {
    constructor(url, base) {
      let s = String(url);
      if (base && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) {
        const b = String(base);
        if (s.startsWith("//")) {
          const proto = (b.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) || ["http:"])[0];
          s = proto + s;
        } else if (s.startsWith("/")) {
          const origin = (b.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]*/) || [b])[0];
          s = origin + s;
        } else {
          s = b.replace(/[#?].*$/, "").replace(/\/[^/]*$/, "/") + s;
        }
      }
      this.href = s;
      const m = s.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)\/\/([^/?#:]*)(?::(\d+))?([^?#]*)(\?[^#]*)?(#.*)?$/);
      this.protocol = m ? m[1] : "";
      this.hostname = m ? m[2] : "";
      this.port = m && m[3] ? m[3] : "";
      this.pathname = m ? (m[4] || "/") : s;
      this.search = m && m[5] ? m[5] : "";
      this.hash = m && m[6] ? m[6] : "";
      this.host = this.hostname + (this.port ? ":" + this.port : "");
      this.origin = this.protocol ? (this.protocol + "//" + this.host) : "null";
      this.username = "";
      this.password = "";
    }
    toString() { return this.href; }
    toJSON() { return this.href; }
  }
  URL.createObjectURL = () => "blob:vector:0";
  URL.revokeObjectURL = () => {};

  const document = wrap(D("documentNode"));
  const location = new Location();
  const history = new History();
  const windowProps = {
    window: null, self: null, document, location, history,
    localStorage: storage("local"), sessionStorage: storage("session"),
    customElements: new CustomElementRegistry(),
    Event, MouseEvent, KeyboardEvent, CustomEvent, UIEvent, EventTarget, DragEvent,
    Node, Element, HTMLElement, Document, DocumentFragment, ShadowRoot, Text, Comment,
    HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement, HTMLOptionElement,
    HTMLButtonElement, HTMLFormElement, HTMLAnchorElement, HTMLImageElement,
    HTMLIFrameElement, HTMLCanvasElement, MutationObserver, IntersectionObserver, ResizeObserver,
    FormData, XMLHttpRequest, DOMTokenList, URL,
    navigator: {
      userAgent: "Vector/0.0.1", language: "en-US", languages: ["en-US"], onLine: true, platform: "vector",
      serviceWorker: {
        register(url, opts) {
          const scope = (opts && opts.scope) || "";
          D("serviceWorkerRegister", String(url), String(scope), "");
          return Promise.resolve({ scope, installing: null, waiting: null, active: { scriptURL: String(url), state: "activated" } });
        },
        get ready() { return Promise.resolve({ active: { state: "activated" } }); },
        addEventListener() {},
        removeEventListener() {},
      },
    },
    screen: { width: D("innerWidth"), height: D("innerHeight"), colorDepth: 24 },
    devicePixelRatio: 1,
    get innerWidth() { return D("innerWidth"); },
    get innerHeight() { return D("innerHeight"); },
    getComputedStyle(el, pseudo) {
      const h = handleOf(el);
      return new Proxy({}, {
        get(_, p) {
          if (p === "getPropertyValue") return (n) => D("computed", h, String(n)) || "";
          if (typeof p === "string") {
            const name = p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
            return D("computed", h, name) || "";
          }
        },
      });
    },
    matchMedia(q) { return { matches: false, media: String(q), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }; },
    getSelection() { return { rangeCount: 0, toString() { return ""; }, removeAllRanges() {}, addRange() {} }; },
    alert(m) { __ve.dom("scriptDialog", "alert", String(m), ""); },
    confirm(m) { return !!__ve.dom("scriptDialog", "confirm", String(m), ""); },
    prompt(m, d) { const r = __ve.dom("scriptDialog", "prompt", String(m), d == null ? "" : String(d)); return r == null ? null : String(r); },
    open() { return null; },
    close() {},
    focus() {},
    blur() {},
    scrollTo(x, y) { if (typeof x === "object") { y = x.top; x = x.left; } document.documentElement.scrollTop = y || 0; document.documentElement.scrollLeft = x || 0; },
    scrollBy(x, y) { window.scrollTo((document.documentElement.scrollLeft || 0) + (x || 0), (document.documentElement.scrollTop || 0) + (y || 0)); },
    fetch: fetchImpl,
    WebSocket: function WebSocket(url) {
      const r = D("wsConnect", String(url));
      this.url = String(url);
      this.readyState = typeof r === "string" && r.startsWith("ws:1") ? 1 : 0;
      this.protocol = "";
      this.bufferedAmount = 0;
      this.extensions = "";
      this.binaryType = "blob";
      this.send = function () {};
      this.close = function () { this.readyState = 3; };
      this.addEventListener = function () {};
      this.removeEventListener = function () {};
    },
    CSS: { escape(s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => "\\" + c); }, supports() { return true; } },
    Image: HTMLImageElement,
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4, SHOW_ALL: 0xFFFFFFFF },
    MutationRecord: function () {},
  };
  windowProps.window = windowProps;
  windowProps.self = windowProps;
  windowProps.top = windowProps;
  windowProps.parent = windowProps;
  windowProps.frames = windowProps;

  for (const [k, v] of Object.entries(windowProps)) {
    try { globalThis[k] = v; } catch {}
  }
  try {
    Object.defineProperty(globalThis, "window", { value: globalThis, writable: true, configurable: true });
  } catch {}

  globalThis.__veDispatch = (handle, type, init) => {
    const node = wrap(handle);
    if (!node) return false;
    init = init || {};
    init.isTrusted = true;
    const ev = type.indexOf("drag") === 0
      ? new DragEvent(type, init)
      : (type === "click" || type === "mousedown" || type === "mouseup" || type === "mousemove"
        ? new MouseEvent(type, init) : new Event(type, init));
    node.dispatchEvent(ev);
    return ev.defaultPrevented;
  };
  globalThis.__veFlushObservers = () => {
    for (const o of observers) {
      if (!o._on) continue;
      const recs = D("mutationsSince", o._rev) || [];
      o._rev = D("revision");
      if (recs.length) {
        try { o._cb(recs.map((r) => ({ type: r.type, target: wrap(r.target), addedNodes: list(r.added || []), removedNodes: list(r.removed || []), attributeName: r.attr || null })), o); }
        catch (e) { __ve.log("error", String(e)); }
      }
    }
  };
  globalThis.__veResetDocument = () => {
    nodes.clear();
    const d = wrap(D("documentNode"));
    globalThis.document = d;
    try { globalThis.window.document = d; } catch {}
  };
})();
