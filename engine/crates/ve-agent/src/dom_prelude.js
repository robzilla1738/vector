(() => {
  let liveListGen = 0;
  const STRUCT = new Set([
    "appendChild", "insertBefore", "removeChild", "replaceChild", "replaceChildren",
    "setInnerHTML", "setOuterHTML", "adoptNode", "parseHTMLDocument", "remove",
  ]);
  const D = (op, ...a) => {
    const r = __ve.dom(op, ...a);
    if (STRUCT.has(op)) liveListGen++;
    return r;
  };
  const nodes = new Map();
  const nonceMap = new WeakMap();
  const registry = new Map();
  const listeners = new Map();
  const listenerCounts = new Map();
  let onAttrCount = 0;
  let handlerPropCount = 0;
  const onReadyStateChange = new WeakMap();
  const trustedEvents = new WeakSet();
  const waiters = new Map();
  let currentScriptNode = null;
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
      this.timeStamp = Date.now();
      this.clientX = init.clientX || 0;
      this.clientY = init.clientY || 0;
      this.button = init.button || 0;
      this.key = init.key || "";
      this.code = init.code || "";
      this.keyCode = init.keyCode != null ? init.keyCode : (this.key === "Enter" ? 13 : this.key === "Escape" ? 27 : 0);
      this.which = init.which != null ? init.which : this.keyCode;
      this.charCode = init.charCode != null ? init.charCode : (this.type === "keypress" ? this.keyCode : 0);
      this.ctrlKey = !!init.ctrlKey;
      this.shiftKey = !!init.shiftKey;
      this.altKey = !!init.altKey;
      this.metaKey = !!init.metaKey;
      Object.defineProperty(this, "isTrusted", { get: () => trustedEvents.has(this), enumerable: true });
    }
    preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
    stopPropagation() { this.cancelBubble = true; }
    stopImmediatePropagation() { this.cancelBubble = true; this._stopImm = true; }
    composedPath() { return composedPath(this.target || this.currentTarget || this); }
    initEvent(type, bubbles, cancelable) {
      this.type = String(type);
      this.bubbles = !!bubbles;
      this.cancelable = !!cancelable;
    }
    initCustomEvent(type, bubbles, cancelable, detail) {
      this.initEvent(type, bubbles, cancelable);
      this.detail = detail;
    }
    initKeyboardEvent(type, bubbles, cancelable, view, key, loc, mods) {
      this.initEvent(type, bubbles, cancelable);
      this.key = key == null ? "" : String(key);
      this.view = view || null;
    }
    initUIEvent(type, bubbles, cancelable, view, detail) {
      this.initEvent(type, bubbles, cancelable);
      this.view = view || null;
      this.detail = detail;
    }
  }
  class HashChangeEvent extends Event {}
  class StorageEvent extends Event {
    constructor(type, init) {
      super(type, init);
      init = init || {};
      this.key = init.key == null ? null : String(init.key);
      this.oldValue = init.oldValue == null ? null : String(init.oldValue);
      this.newValue = init.newValue == null ? null : String(init.newValue);
      this.url = init.url == null ? "" : toUSV(init.url);
      this.storageArea = init.storageArea || null;
    }
  }
  class MouseEvent extends Event {
    constructor(t, i) {
      super(t, i);
      i = i || {};
      this.button = i.button != null ? i.button : 0;
      this.buttons = i.buttons != null ? i.buttons : (this.button === 0 ? 1 : 0);
      this.which = i.which != null ? i.which : (this.button === 0 ? 1 : this.button + 1);
    }
  }
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
  class KeyboardEvent extends Event {
    constructor(t, i) {
      super(t, i);
      i = i || {};
      if (i.key != null) this.key = String(i.key);
      if (i.code != null) this.code = String(i.code);
      if (i.keyCode != null) this.keyCode = i.keyCode;
      if (i.which != null) this.which = i.which;
      if (i.charCode != null) this.charCode = i.charCode;
    }
  }
  class CustomEvent extends Event {
    constructor(t, i) { super(t, i); this.detail = i && i.detail; }
  }
  class UIEvent extends Event { constructor(t, i) { super(t, i); } }
  class InputEvent extends UIEvent {
    constructor(t, i) {
      super(t, i);
      this.data = i && i.data != null ? i.data : null;
      this.inputType = (i && i.inputType) || "";
      this.isComposing = !!(i && i.isComposing);
    }
  }
  class MessageEvent extends Event {
    constructor(t, i) {
      super(t, i);
      this.data = i && "data" in i ? i.data : null;
      this.origin = (i && i.origin) || "";
      this.source = (i && i.source) || null;
      this.lastEventId = (i && i.lastEventId) || "";
      this.ports = (i && i.ports) || [];
    }
  }
  class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || "Error";
      this.code = ({ IndexSizeError: 1, HierarchyRequestError: 3, NoModificationAllowedError: 7, InvalidCharacterError: 5, NotFoundError: 8, InvalidStateError: 11, SyntaxError: 12, TypeMismatchError: 17 })[this.name] || 0;
    }
  }

  function listenerOnPath(type, start) {
    const path = composedPath(start);
    for (const node of path) {
      const arr = listeners.get(node) && listeners.get(node).get(type);
      if (arr && arr.length) return true;
    }
    return false;
  }
  function composedPath(start) {
    if (start && start.__h) {
      const path = list(D("ancestorPath", start.__h));
      path.push(window);
      return path;
    }
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
  function isElementCtor(ctor) {
    if (!ctor || ctor === EventTarget) return false;
    let p = ctor.prototype;
    while (p && p !== Object.prototype) {
      if (p === Node.prototype || p === Element.prototype || p === HTMLElement.prototype) return true;
      p = Object.getPrototypeOf(p);
    }
    return false;
  }
  class EventTarget {
    constructor() {
      if (upgrading && isElementCtor(new.target)) return upgrading;
    }
    addEventListener(type, fn, opts) {
      if (fn == null) return;
      let call;
      if (typeof fn === "function") call = fn;
      else if (typeof fn === "object" && typeof fn.handleEvent === "function") {
        const obj = fn;
        call = function (ev) { obj.handleEvent(ev); };
      } else return;
      const cap = !!(opts && (opts === true || opts.capture));
      const once = !!(opts && opts.once);
      const list = store(this);
      if (!list.has(type)) list.set(type, []);
      const arr = list.get(type);
      if (arr.some((x) => x.orig === fn && x.cap === cap)) return;
      arr.push({ fn: call, orig: fn, cap, once });
      listenerCounts.set(type, (listenerCounts.get(type) || 0) + 1);
    }
    removeEventListener(type, fn, opts) {
      const cap = !!(opts && (opts === true || opts.capture));
      const arr = store(this).get(type);
      if (!arr) return;
      const i = arr.findIndex((x) => (x.orig === fn || x.fn === fn) && x.cap === cap);
      if (i >= 0) {
        arr.splice(i, 1);
        listenerCounts.set(type, Math.max(0, (listenerCounts.get(type) || 0) - 1));
      }
    }
    dispatchEvent(ev) {
      if (!ev || typeof ev.type !== "string") throw new TypeError("not an Event");
      ev.target = ev.target || this;
      const type = ev.type;
      const nListen = listenerCounts.get(type) || 0;
      const needPath = nListen > 0 || onAttrCount > 0 || handlerPropCount > 0;
      const fireTargetProp = () => {
        ev.currentTarget = this;
        ev.eventPhase = 2;
        const prop = this["on" + type];
        if (typeof prop === "function") {
          try { prop.call(this, ev); } catch (e) { __ve.log("error", String(e)); }
        }
        ev.eventPhase = 0;
        ev.currentTarget = null;
        return !ev.defaultPrevented;
      };
      if (!needPath) return fireTargetProp();
      if (nListen > 0 && onAttrCount === 0 && handlerPropCount === 0 && !listenerOnPath(type, this)) {
        return fireTargetProp();
      }
      const path = composedPath(this);
      const fire = (node, cap) => {
        if (ev._stopImm) return;
        ev.currentTarget = node;
        const arr = (listeners.get(node) && listeners.get(node).get(type)) || [];
        for (const l of arr.slice()) {
          if (l.cap !== cap) continue;
          try { l.fn.call(node, ev); } catch (e) { __ve.log("error", "Uncaught (in event) " + (e && e.stack || e)); }
          if (l.once) {
            const i = arr.indexOf(l);
            if (i >= 0) {
              arr.splice(i, 1);
              listenerCounts.set(type, Math.max(0, (listenerCounts.get(type) || 0) - 1));
            }
          }
          if (ev._stopImm) return;
        }
        const prop = node["on" + type];
        if (!cap && typeof prop === "function") {
          try { prop.call(node, ev); } catch (e) { __ve.log("error", String(e)); }
        }
        if (!cap && node.__hasOnAttr && node.getAttribute && typeof prop !== "function") {
          const src = node.getAttribute("on" + type);
          if (src) {
            try { new Function("event", src).call(node, ev); } catch (e) { __ve.log("error", String(e)); }
          }
        }
      };
      ev.eventPhase = 1;
      for (let i = path.length - 1; i > 0; i--) {
        fire(path[i], true);
        if (ev.cancelBubble) break;
      }
      if (!ev.cancelBubble) {
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
      }
      ev.eventPhase = 0;
      ev.currentTarget = null;
      return !ev.defaultPrevented;
    }
  }

  function isXmlName(s) {
    s = String(s);
    if (!s) return false;
    const start = (c) => {
      const n = c.charCodeAt(0);
      return c === ":" || c === "_"
        || (n >= 65 && n <= 90) || (n >= 97 && n <= 122)
        || (n > 127 && c !== "\u00B7" && c !== "\u00D7");
    };
    const cont = (c) => start(c) || /[0-9.\-]/.test(c) || c === "\u00B7";
    if (!start(s[0])) return false;
    for (let i = 1; i < s.length; i++) if (!cont(s[i])) return false;
    return true;
  }

  function installDocumentLocation(doc) {
    if (!doc || doc.__veLocInstalled) return;
    doc.__veLocInstalled = true;
    try {
      const get = function () {
        if (this !== doc) throw new TypeError("Illegal invocation");
        return doc.__h === D("documentNode") ? location : null;
      };
      Object.defineProperty(get, "name", { value: "get location", configurable: true });
      const set = function (v) {
        if (this !== doc) throw new TypeError("Illegal invocation");
        try { location.href = String(v); } catch (e) {}
      };
      Object.defineProperty(set, "name", { value: "set location", configurable: true });
      Object.defineProperty(doc, "location", {
        configurable: false,
        enumerable: true,
        get,
        set,
      });
    } catch (e) {}
  }
  let documentNamedTraps = {
    get(t, p, recv) { return Reflect.get(t, p, recv); },
    has(t, p) { return Reflect.has(t, p); },
    ownKeys(t) { return Reflect.ownKeys(t); },
    getOwnPropertyDescriptor(t, p) { return Reflect.getOwnPropertyDescriptor(t, p); },
  };
  let exposeWindowName = function () {};
  let browsingDocument = null;
  function wrapDoc(h) {
    if (h == null || h === "" || h === false) return null;
    h = String(h);
    if (browsingDocument && h === String(browsingDocument.__h)) return browsingDocument;
    return wrap(h);
  }
  function wrap(h) {
    if (h == null || h === "" || h === false) return null;
    h = String(h);
    if (browsingDocument && h === String(browsingDocument.__h)) return browsingDocument;
    const cached = nodes.get(h);
    if (cached) return cached;
    return wrapWithInfo(h, D("describe", h));
  }
  function wrapWithInfo(h, info) {
    if (h == null || h === "" || h === false) return null;
    h = String(h);
    if (browsingDocument && h === String(browsingDocument.__h)) return browsingDocument;
    let n = nodes.get(h);
    if (n) return n;
    if (!info) return null;
    let proto = Node.prototype;
    if (info.t === 9) proto = Document.prototype;
    else if (info.t === 11 && info.shadow) proto = ShadowRoot.prototype;
    else if (info.t === 11) proto = DocumentFragment.prototype;
    else if (info.t === 3) proto = Text.prototype;
    else if (info.t === 7) proto = ProcessingInstruction.prototype;
    else if (info.t === 8) proto = Comment.prototype;
    else if (info.t === 10) proto = DocumentType.prototype;
    else if (info.t === 1) {
      const tag = info.name;
      if (info.ns === "http://www.w3.org/2000/svg") {
        proto = (SVG[tag] || SVGElement).prototype;
      } else if (info.ns === "http://www.w3.org/1998/Math/MathML") {
        proto = MathMLElement.prototype;
      } else if (info.ns === "http://www.w3.org/1999/xhtml") {
        proto = UNKNOWN_HTML[tag] ? HTMLUnknownElement.prototype : (HTML[tag] || HTMLElement).prototype;
      } else {
        proto = Element.prototype;
      }
    }
    n = Object.create(proto);
    n.__h = h;
    nodes.set(h, n);
    if (info.t === 9) {
      n = new Proxy(n, documentNamedTraps);
      nodes.set(h, n);
      installDocumentLocation(n);
    }
    if (info.t === 1) {
      if (info.on) {
        n.__hasOnAttr = true;
        onAttrCount++;
      }
      if (registry.size) upgradeOne(n, false);
      if (info.id) {
        try { exposeWindowName(info.id); } catch (e) {}
      }
    }
    return n;
  }
  function upgradeTree(n) {
    if (!registry.size) return;
    if (!n || n.nodeType !== 1) return;
    upgradeOne(n, true);
    const kids = n.children;
    if (kids) {
      for (let i = 0; i < kids.length; i++) upgradeTree(kids[i]);
    }
    if (n.shadowRoot) {
      const shadowKids = n.shadowRoot.children;
      if (shadowKids) {
        for (let i = 0; i < shadowKids.length; i++) upgradeTree(shadowKids[i]);
      }
    }
  }
  function upgradeOne(n, force) {
    if (!n || n.nodeType !== 1) return;
    if (templateInContent(n)) return;
    if (!force && !n.isConnected) return;
    const name = (n.localName || "").toLowerCase();
    const ctor = registry.get(name);
    if (!ctor) return;
    if (!n.__upgraded) {
      n.__upgraded = true;
      Object.setPrototypeOf(n, ctor.prototype);
      if (!n.__constructed) {
        upgrading = n;
        try { new ctor(); } catch (e) { __ve.log("error", String(e)); }
        upgrading = null;
        n.__constructed = true;
      }
    }
    if (!n.__connected && typeof n.connectedCallback === "function") {
      n.__connected = true;
      try { n.connectedCallback(); } catch (e) { __ve.log("error", String(e)); }
    }
  }
  function handleOf(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    return v.__h || "";
  }
  class NodeList {}
  Object.defineProperty(NodeList, Symbol.hasInstance, {
    value(v) {
      if (v == null || (typeof v !== "object" && typeof v !== "function")) return false;
      if (Array.isArray(v) && typeof v.item === "function") return true;
      let proto = Object.getPrototypeOf(v);
      while (proto) {
        if (proto === NodeList.prototype || proto === LiveNodeList.prototype) return true;
        proto = Object.getPrototypeOf(proto);
      }
      return false;
    },
  });
  class LiveNodeList {
    constructor(fetch) {
      this._fetch = fetch;
      this._gen = -1;
      this._cur = null;
      const snap = () => {
        if (this._gen !== liveListGen || !this._cur) {
          this._gen = liveListGen;
          this._cur = fetch();
        }
        return this._cur;
      };
      return new Proxy(this, {
        get(t, p, recv) {
          const cur = snap();
          if (p === "length") return cur.length;
          if (p === "item") return (i) => cur[i | 0] || null;
          if (p === "forEach") return (fn, self) => cur.forEach(fn, self);
          if (p === Symbol.iterator) return cur[Symbol.iterator].bind(cur);
          if (typeof p === "symbol" || p === "_fetch" || p === "_gen" || p === "_cur") return Reflect.get(t, p, recv);
          if (/^\d+$/.test(String(p))) return cur[Number(p)];
          return Reflect.get(t, p, recv);
        },
        has(t, p) {
          if (p === "length" || p === "_fetch") return true;
          if (/^\d+$/.test(String(p))) return Number(p) < snap().length;
          return Reflect.has(t, p);
        },
        ownKeys(t) {
          const n = snap().length;
          const keys = ["length", "_fetch"];
          for (let i = 0; i < n; i++) keys.push(String(i));
          return keys;
        },
        getOwnPropertyDescriptor(t, p) {
          if (p === "length") {
            return { configurable: true, enumerable: true, writable: false, value: snap().length };
          }
          if (/^\d+$/.test(String(p))) {
            const i = Number(p);
            const cur = snap();
            if (i < cur.length) {
              return { configurable: true, enumerable: true, writable: false, value: cur[i] };
            }
          }
          return Reflect.getOwnPropertyDescriptor(t, p);
        },
      });
    }
  }
  Object.setPrototypeOf(LiveNodeList.prototype, NodeList.prototype);
  Object.defineProperty(LiveNodeList.prototype, Symbol.toStringTag, { value: "NodeList" });
  NodeList.prototype.item = function (i) { return this[i] || null; };
  NodeList.prototype.forEach = Array.prototype.forEach;
  function list(arr) {
    const out = [];
    if (!arr) return out;
    const missing = [];
    for (const h of arr) {
      if (h == null || h === "" || h === false) continue;
      const s = String(h);
      if (nodes.has(s)) continue;
      if (browsingDocument && s === String(browsingDocument.__h)) continue;
      missing.push(s);
    }
    if (missing.length > 1) {
      const infos = D("describeMany", ...missing);
      if (Array.isArray(infos)) {
        for (let i = 0; i < missing.length; i++) wrapWithInfo(missing[i], infos[i]);
      }
    }
    for (const h of arr) {
      const n = wrap(h);
      if (n) out.push(n);
    }
    out.item = (i) => out[i] || null;
    return out;
  }

  function DOMStringMap() {}
  function dataAttrName(key) {
    return "data-" + String(key).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  }
  function dataKeyName(attr) {
    return attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  function invalidDatasetName(k) {
    return k.length >= 2 && k.charCodeAt(0) === 45 && k.charCodeAt(1) >= 97 && k.charCodeAt(1) <= 122;
  }
  function makeDataset(el) {
    const map = new DOMStringMap();
    return new Proxy(map, {
      get(t, k) {
        if (typeof k !== "string") return Reflect.get(t, k);
        if (k === "constructor") return DOMStringMap;
        if (invalidDatasetName(k)) return undefined;
        const v = el.getAttribute(dataAttrName(k));
        if (v != null) return v;
        return Reflect.get(Object.prototype, k);
      },
      set(t, k, v) {
        if (typeof k !== "string") return true;
        if (invalidDatasetName(k)) {
          throw new DOMException("'" + k + "' is not a valid data-* name", "SyntaxError");
        }
        if (/\s/.test(k)) {
          throw new DOMException("'" + k + "' is not a valid data-* name", "InvalidCharacterError");
        }
        el.setAttribute(dataAttrName(k), String(v));
        return true;
      },
      deleteProperty(t, k) {
        if (typeof k === "string" && !invalidDatasetName(k)) el.removeAttribute(dataAttrName(k));
        return true;
      },
      ownKeys() {
        return (el.getAttributeNames ? el.getAttributeNames() : [])
          .filter((n) => n.slice(0, 5) === "data-")
          .map(dataKeyName);
      },
      getOwnPropertyDescriptor(t, k) {
        if (typeof k !== "string") return undefined;
        const v = el.getAttribute(dataAttrName(k));
        if (v == null) return undefined;
        return { configurable: true, enumerable: true, value: v };
      },
      has(t, k) {
        if (typeof k === "string" && !invalidDatasetName(k) && el.hasAttribute(dataAttrName(k))) return true;
        return k in Object.prototype;
      },
    });
  }
  function inlineCssProp(el, name) {
    if (!el || !el.getAttribute) return "";
    const raw = el.getAttribute("style");
    if (!raw) return "";
    const want = String(name).toLowerCase();
    const parts = String(raw).split(";");
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const c = p.indexOf(":");
      if (c < 0) continue;
      if (p.slice(0, c).trim().toLowerCase() === want) return p.slice(c + 1).trim();
    }
    return "";
  }
  function cssProp(el, name) {
    if (!el || el.nodeType !== 1) return "";
    const own = inlineCssProp(el, name);
    if (own) return own.toLowerCase();
    let v = "";
    try {
      const cs = window.getComputedStyle(el);
      v = String((cs && cs.getPropertyValue) ? cs.getPropertyValue(name) : (cs && cs[name]) || "");
    } catch (e) {}
    if (v) return String(v).toLowerCase();
    if (name === "text-transform" || name === "white-space" || name === "visibility") {
      let n = el.parentElement;
      while (n && n.nodeType === 1) {
        const inherited = inlineCssProp(n, name);
        if (inherited) return inherited.toLowerCase();
        try {
          const cs = window.getComputedStyle(n);
          v = String((cs && cs.getPropertyValue) ? cs.getPropertyValue(name) : "");
        } catch (e) { v = ""; }
        if (v) return String(v).toLowerCase();
        n = n.parentElement;
      }
    }
    return "";
  }
  const REPLACED_INNERTEXT = /^(textarea|iframe|canvas|audio|video|img|input|object|embed|noscript)$/;
  const SVG_NON_RENDERED = /^(defs|clippath|metadata|desc|stop|marker|symbol|pattern|mask|filter)$/;
  function isBeingRendered(el) {
    if (!el || el.nodeType !== 1 || !el.isConnected) return false;
    let n = el;
    let first = true;
    while (n && n.nodeType === 1) {
      const d = cssProp(n, "display");
      if (d === "none") return false;
      const tag = (n.localName || "").toLowerCase();
      if (!first && REPLACED_INNERTEXT.test(tag)) return false;
      first = false;
      n = n.parentElement;
    }
    return true;
  }
  function elementLang(el) {
    let n = el;
    while (n && n.nodeType === 1) {
      const raw = n.getAttribute && n.getAttribute("lang");
      if (raw) return String(raw).toLowerCase();
      n = n.parentElement;
    }
    try {
      const d = (el && el.ownerDocument) || document;
      const root = d.documentElement;
      const l = root && root.getAttribute && root.getAttribute("lang");
      if (l) return String(l).toLowerCase();
    } catch (e) {}
    return "";
  }
  function processRenderedText(textNode) {
    let s = String(textNode.data || "");
    const parent = textNode.parentElement;
    if (!parent) return { v: s, collapse: true };
    const ws = cssProp(parent, "white-space");
    const tt = cssProp(parent, "text-transform");
    let collapse = true;
    if (ws === "pre" || ws === "pre-wrap" || ws === "break-spaces") {
      s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      collapse = false;
    } else if (ws === "pre-line") {
      s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/[ \t\f]+/g, " ");
      s = s.replace(/^ /gm, "").replace(/ $/gm, "");
      collapse = false;
    } else {
      s = s.replace(/[\n\r\t\f]/g, " ").replace(/ {2,}/g, " ");
    }
    if (tt === "uppercase") {
      const lang = elementLang(parent);
      s = (lang === "tr" || lang === "az") ? s.toLocaleUpperCase("tr") : s.toUpperCase();
    } else if (tt === "lowercase") s = s.toLowerCase();
    else if (tt === "capitalize") s = s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
    return { v: s, collapse };
  }
  function usedDisplay(node, parentDisplay) {
    let d = cssProp(node, "display") || "";
    if (parentDisplay === "flex" || parentDisplay === "inline-flex" || parentDisplay === "grid" || parentDisplay === "inline-grid") {
      if (d === "none" || d === "contents") return d;
      if (d === "inline-flex") return "flex";
      if (d === "inline-grid") return "grid";
      if (d === "inline-table") return "table";
      if (d === "inline" || d === "inline-block" || d === "") return "block";
      if (d.indexOf("table") === 0) return d;
      return "block";
    }
    return d;
  }
  function nextMatchingDisplay(el, display) {
    let n = el && el.nextElementSibling;
    while (n) {
      if (usedDisplay(n, "") === display || cssProp(n, "display") === display) return true;
      n = n.nextElementSibling;
    }
    return false;
  }
  function laterTableRow(el) {
    if (nextMatchingDisplay(el, "table-row")) return true;
    let sec = el.parentElement && el.parentElement.nextElementSibling;
    while (sec) {
      const d = cssProp(sec, "display");
      if (d === "table-row") return true;
      if (d === "table-row-group" || d === "table-header-group" || d === "table-footer-group") {
        const kids = sec.children;
        for (let i = 0; i < kids.length; i++) {
          if (cssProp(kids[i], "display") === "table-row") return true;
        }
      }
      sec = sec.nextElementSibling;
    }
    return false;
  }
  function collectSelectKids(node, items, vis) {
    const kids = node.childNodes;
    for (let i = 0; i < kids.length; i++) {
      const k = kids[i];
      if (k.nodeType !== 1) continue;
      const tn = (k.localName || "").toLowerCase();
      if (tn === "option" || tn === "optgroup") collectRendered(k, items, vis, "block");
      else collectSelectKids(k, items, vis);
    }
  }
  function collectRendered(node, items, vis, parentDisplay) {
    if (!node) return;
    if (node.nodeType === 8) return;
    if (node.nodeType === 3) {
      if (vis === "hidden" || vis === "collapse") return;
      const parent = node.parentElement;
      if (parent) {
        const pd = cssProp(parent, "display");
        if (pd === "table" || pd === "inline-table" || pd === "table-row" || pd === "table-row-group"
          || pd === "table-header-group" || pd === "table-footer-group" || pd === "table-column"
          || pd === "table-column-group") {
          return;
        }
      }
      const t = processRenderedText(node);
      if (t.v) items.push({ t: "s", v: t.v, collapse: t.collapse });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = (node.localName || "").toLowerCase();
    if (SVG_NON_RENDERED.test(tag)) return;
    const display = usedDisplay(node, parentDisplay);
    if (display === "none") return;
    if (display === "contents") {
      const kids = node.childNodes;
      for (let i = 0; i < kids.length; i++) collectRendered(kids[i], items, vis, parentDisplay);
      return;
    }
    let v = cssProp(node, "visibility") || vis;
    if (tag === "br") {
      if (v !== "hidden" && v !== "collapse") items.push({ t: "lf" });
      return;
    }
    const float = cssProp(node, "float");
    const pos = cssProp(node, "position");
    const outOfFlow = float === "left" || float === "right" || pos === "absolute" || pos === "fixed";
    const isP = tag === "p";
    const isCell = display === "table-cell";
    const isRow = display === "table-row";
    const isTable = display === "table";
    const replaced = REPLACED_INNERTEXT.test(tag);
    const isBlock = isP || isTable || display === "block" || display === "list-item" || display === "flex"
      || display === "grid" || display === "table-caption" || display === "flow-root" || outOfFlow
      || /^(address|article|aside|blockquote|div|dl|fieldset|figure|footer|form|h[1-6]|header|li|main|nav|ol|pre|section|ul|details|summary|legend|optgroup|option|hr)$/.test(tag)
        && display !== "inline" && display !== "inline-block" && display !== "inline-flex"
        && display !== "inline-grid" && display !== "inline-table" && display !== "contents";
    const isAtomicInline = !replaced && (display === "inline-block" || display === "inline-flex" || display === "inline-grid");
    const hidden = v === "hidden" || v === "collapse";
    if (!hidden && !isCell && !isRow) {
      if (isP) items.push({ t: "req", n: 2 });
      else if (isBlock || replaced && (display === "block" || display === "list-item")) items.push({ t: "req", n: 1 });
      else if (replaced || isAtomicInline) items.push({ t: "atomic" });
    } else if (!hidden && (replaced || isAtomicInline) && !isBlock) {
      items.push({ t: "atomic" });
    }
    if (replaced) {
      // Replaced elements do not render descendants.
    } else if (tag === "select") {
      collectSelectKids(node, items, v);
    } else if (tag === "optgroup") {
      let n = node.parentElement;
      let inSelect = false;
      while (n) {
        if ((n.localName || "").toLowerCase() === "select") { inSelect = true; break; }
        n = n.parentElement;
      }
      const kids = node.childNodes;
      if (inSelect) {
        const walkOpts = (n) => {
          const ks = n.childNodes;
          for (let i = 0; i < ks.length; i++) {
            const k = ks[i];
            if (k.nodeType !== 1) continue;
            const tn = (k.localName || "").toLowerCase();
            if (tn === "option") collectRendered(k, items, v, display);
            else if (tn !== "optgroup") walkOpts(k);
          }
        };
        walkOpts(node);
      } else {
        for (let i = 0; i < kids.length; i++) collectRendered(kids[i], items, v, display);
      }
    } else if (tag === "details" && !node.hasAttribute("open")) {
      const kids = node.childNodes;
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i];
        if (k.nodeType === 1 && (k.localName || "").toLowerCase() === "summary") {
          collectRendered(k, items, v, display);
        }
      }
    } else if (isAtomicInline) {
      const inner = [];
      const kids = node.childNodes;
      for (let i = 0; i < kids.length; i++) collectRendered(kids[i], inner, v, display);
      let s = flattenInnerText(inner);
      s = s.replace(/^[ \t]+|[ \t]+$/g, "");
      if (s) items.push({ t: "s", v: s, collapse: false });
    } else {
      const kids = node.childNodes;
      for (let i = 0; i < kids.length; i++) collectRendered(kids[i], items, v, display);
    }
    if (!hidden) {
      if (isCell && nextMatchingDisplay(node, "table-cell")) {
        items.push({ t: "s", v: "\t", collapse: false });
      } else if (isRow && laterTableRow(node)) {
        let collapsed = true;
        const cells = node.children;
        if (!cells || !cells.length) collapsed = false;
        else {
          for (let i = 0; i < cells.length; i++) {
            if (cssProp(cells[i], "visibility") !== "collapse") { collapsed = false; break; }
          }
        }
        items.push({ t: "req", n: collapsed ? 2 : 1 });
      }
      if (isP) items.push({ t: "req", n: 2 });
      else if ((isBlock || replaced && (display === "block" || display === "list-item")) && !isCell && !isRow) {
        items.push({ t: "req", n: 1 });
      }
    }
  }
  function isCollapsibleOnly(it) {
    return it && it.t === "s" && it.collapse && !/[^ \t]/.test(it.v || "");
  }
  function flattenInnerText(items) {
    const merged = [];
    for (const it of items) {
      if (isCollapsibleOnly(it) && merged.length && merged[merged.length - 1].t === "req") continue;
      if (it.t === "req") {
        while (merged.length && isCollapsibleOnly(merged[merged.length - 1])) merged.pop();
        const last = merged[merged.length - 1];
        if (last && last.t === "req") last.n = Math.max(last.n, it.n);
        else merged.push({ t: "req", n: it.n });
      } else merged.push(it);
    }
    function ignorable(it) {
      if (!it) return true;
      if (it.t === "req") return true;
      if (isCollapsibleOnly(it)) return true;
      return false;
    }
    let start = 0;
    let end = merged.length;
    while (start < end && ignorable(merged[start])) start++;
    while (end > start && ignorable(merged[end - 1])) end--;
    const slice = merged.slice(start, end);
    let out = "";
    let pending = 0;
    let lastCollapseSpace = true;
    for (const it of slice) {
      if (it.t === "req") {
        pending = Math.max(pending, it.n);
        continue;
      }
      if (it.t === "atomic") {
        lastCollapseSpace = false;
        continue;
      }
      if (it.t === "lf") {
        if (lastCollapseSpace) out = out.replace(/[ \t]+$/, "");
        if (out && pending) out += "\n".repeat(pending);
        pending = 0;
        out += "\n";
        lastCollapseSpace = true;
        continue;
      }
      if (!it.v) continue;
      let v = it.v;
      if (pending) {
        if (out) {
          if (lastCollapseSpace) out = out.replace(/[ \t]+$/, "");
          out += "\n".repeat(pending);
        }
        pending = 0;
        lastCollapseSpace = true;
      }
      if (it.collapse) {
        if (lastCollapseSpace) v = v.replace(/^ +/, "");
        if (v) lastCollapseSpace = / $/.test(v);
      } else {
        lastCollapseSpace = false;
      }
      if (!v) continue;
      out += v;
    }
    if (pending) {
      if (lastCollapseSpace) out = out.replace(/[ \t]+$/, "");
      out += "\n".repeat(pending);
    } else if (lastCollapseSpace) {
      out = out.replace(/[ \t]+$/, "");
    }
    return out;
  }
  function innerTextOf(node) {
    if (!node) return "";
    if (node.nodeType === 3) return String(node.data || "");
    if (node.nodeType !== 1) return "";
    try { if (node.__h) window.getComputedStyle(node).display; } catch (e) {}
    const tag = (node.localName || "").toLowerCase();
    if (!isBeingRendered(node)) return node.textContent || "";
    if (REPLACED_INNERTEXT.test(tag)) return "";
    const items = [];
    const vis = cssProp(node, "visibility") || "visible";
    const display = cssProp(node, "display");
    const kids = node.childNodes;
    if (tag === "select") {
      collectSelectKids(node, items, vis);
    } else {
      for (let i = 0; i < kids.length; i++) collectRendered(kids[i], items, vis, display);
    }
    let s = flattenInnerText(items);
    const letter = pseudoTextTransform(node, "first-letter");
    const line = pseudoTextTransform(node, "first-line");
    if (letter === "uppercase" && s) {
      s = s.charAt(0).toUpperCase() + s.slice(1);
    } else if (line === "uppercase") {
      const i = s.indexOf("\n");
      const w = cssProp(node, "width");
      if (i >= 0) s = s.slice(0, i).toUpperCase() + s.slice(i);
      else if (w === "0px" || w === "0") {
        const m = s.match(/^(\S+)([\s\S]*)$/);
        s = m ? m[1].toUpperCase() + m[2] : s.toUpperCase();
      } else s = s.toUpperCase();
    }
    return s;
  }
  function pseudoTextTransform(el, pseudo) {
    const cls = String((el && el.className) || "").split(/\s+/).filter(Boolean);
    if (!cls.length) return "";
    let css = "";
    try {
      const tags = document.getElementsByTagName("style");
      for (let i = 0; i < tags.length; i++) css += tags[i].textContent || "";
    } catch (e) { return ""; }
    for (let i = 0; i < cls.length; i++) {
      const c = cls[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("\\." + c + "::" + pseudo + "\\s*\\{([^}]*)\\}", "i");
      const m = css.match(re);
      if (!m) continue;
      const tm = /text-transform\s*:\s*([a-z-]+)/i.exec(m[1]);
      if (tm) return tm[1].toLowerCase();
    }
    return "";
  }
  function setInnerText(el, v) {
    v = v === null ? "" : String(v);
    while (el.firstChild) el.removeChild(el.firstChild);
    const parts = v.split(/\r\n|\r|\n/);
    for (let i = 0; i < parts.length; i++) {
      if (i) el.appendChild(document.createElement("br"));
      if (parts[i]) el.appendChild(document.createTextNode(parts[i]));
    }
  }
  function setOuterText(el, v) {
    const parent = el.parentNode;
    if (!parent) {
      throw new DOMException("Failed to set the 'outerText' property on 'HTMLElement'.", "NoModificationAllowedError");
    }
    v = v === null ? "" : String(v);
    const next = el.nextSibling;
    const prev = el.previousSibling;
    parent.removeChild(el);
    const frag = document.createDocumentFragment();
    setInnerText(frag, v);
    if (!frag.firstChild) frag.appendChild(document.createTextNode(""));
    const first = frag.firstChild;
    const last = frag.lastChild;
    while (frag.firstChild) parent.insertBefore(frag.firstChild, next);
    if (prev && prev.nodeType === 3 && first && first.nodeType === 3 && first.parentNode === parent) {
      prev.data += first.data;
      parent.removeChild(first);
    }
    const mergedLast = last && last.parentNode === parent ? last : (prev && prev.parentNode === parent ? prev : null);
    const follow = mergedLast ? mergedLast.nextSibling : next;
    if (mergedLast && mergedLast.nodeType === 3 && follow && follow.nodeType === 3) {
      mergedLast.data += follow.data;
      parent.removeChild(follow);
    }
  }

  const htmlCollectionTraps = {
    get(t, p, recv) {
      if (p === Symbol.iterator) {
        return function* () {
          const els = t._fetch();
          for (let i = 0; i < els.length; i++) yield els[i];
        };
      }
      if (typeof p === "symbol" || (typeof p === "string" && p.charCodeAt(0) === 95)) {
        return Reflect.get(t, p, recv);
      }
      if (p === "length") {
        const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t), "length");
        if (desc && desc.get) return desc.get.call(t);
        return t._fetch().length;
      }
      if (p === "item" || p === "namedItem" || p === "add" || p === "remove" || p === "selectedIndex") {
        return Reflect.get(t, p, recv);
      }
      const s = String(p);
      if (/^\d+$/.test(s)) return t._fetch()[Number(s)];
      if (s) {
        const named = (t.namedItem || HTMLCollection.prototype.namedItem).call(t, s);
        if (named) return named;
      }
      return Reflect.get(t, p, recv);
    },
    set(t, p, value, recv) {
      if (typeof p === "string" && p.charCodeAt(0) === 95) return Reflect.set(t, p, value, recv);
      if (p === "length" || p === "selectedIndex") return Reflect.set(t, p, value, recv);
      const s = String(p);
      if (/^\d+$/.test(s) && typeof t._setIndex === "function") {
        t._setIndex(Number(s), value);
        return true;
      }
      return Reflect.set(t, p, value, recv);
    },
    ownKeys(t) {
      const els = t._fetch();
      const keys = [];
      for (let i = 0; i < els.length; i++) keys.push(String(i));
      for (const el of els) {
        const id = el.id;
        if (id && !keys.includes(id)) keys.push(id);
        const name = el.getAttribute && el.getAttribute("name");
        if (name && !keys.includes(name)) keys.push(name);
      }
      return keys;
    },
    getOwnPropertyDescriptor(t, p) {
      if (typeof p === "symbol") return undefined;
      const s = String(p);
      if (/^\d+$/.test(s)) {
        const v = t._fetch()[Number(s)];
        if (v === undefined) return undefined;
        return { configurable: true, enumerable: true, writable: false, value: v };
      }
      if (s === "namedItem" || s === "item" || s === "length" || s === "add" || s === "remove" || s === "selectedIndex") {
        return undefined;
      }
      const named = s ? (t.namedItem || HTMLCollection.prototype.namedItem).call(t, s) : null;
      if (named) return { configurable: true, enumerable: false, writable: false, value: named };
      return undefined;
    },
    has(t, p) {
      if (typeof p === "symbol") return false;
      if (typeof p === "string" && p.charCodeAt(0) === 95) return true;
      if (p === "length" || p === "item" || p === "namedItem" || p === "add" || p === "remove" || p === "selectedIndex") {
        return true;
      }
      const s = String(p);
      if (/^\d+$/.test(s)) return Number(s) < t._fetch().length;
      if (s && (t.namedItem || HTMLCollection.prototype.namedItem).call(t, s)) return true;
      return Object.prototype[p] !== undefined || p === "constructor";
    },
  };

  const IDL_INTERNAL = Symbol("idl");
  class HTMLCollection {
    constructor() {
      if (arguments[0] !== IDL_INTERNAL) throw new TypeError("Illegal constructor");
      this._fetch = arguments[1];
      return new Proxy(this, htmlCollectionTraps);
    }
    item(i) { return this._fetch()[i | 0] || null; }
    namedItem(name) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'namedItem' on 'HTMLCollection': 1 argument required, but only 0 present.");
      }
      const n = String(name);
      if (!n) return null;
      return this._fetch().find((el) => el.id === n || (el.getAttribute && el.getAttribute("name") === n)) || null;
    }
    get length() { return this._fetch().length; }
  }
  for (const k of ["item", "namedItem", "length"]) {
    Object.defineProperty(HTMLCollection.prototype, k, { enumerable: true, configurable: true });
  }
  Object.defineProperty(HTMLCollection.prototype, Symbol.toStringTag, { value: "HTMLCollection" });

  function collectionNamedHits(els, name) {
    const n = String(name);
    if (!n) return [];
    return els.filter((el) => el && (el.id === n || (el.getAttribute && el.getAttribute("name") === n)));
  }

  class RadioNodeList {
    constructor() {
      if (arguments[0] !== IDL_INTERNAL) throw new TypeError("Illegal constructor");
      const fetch = arguments[1];
      this._fetch = fetch;
      this._gen = -1;
      this._cur = null;
      const snap = () => {
        if (this._gen !== liveListGen || !this._cur) {
          this._gen = liveListGen;
          this._cur = fetch();
        }
        return this._cur;
      };
      return new Proxy(this, {
        get(t, p, recv) {
          const cur = snap();
          if (p === "length") return cur.length;
          if (p === "item") return (i) => cur[i | 0] || null;
          if (p === "forEach") return (fn, self) => cur.forEach(fn, self);
          if (p === "value") return Reflect.get(t, p, recv);
          if (p === Symbol.iterator) return cur[Symbol.iterator].bind(cur);
          if (typeof p === "symbol" || p === "_fetch" || p === "_gen" || p === "_cur") return Reflect.get(t, p, recv);
          if (/^\d+$/.test(String(p))) return cur[Number(p)];
          return Reflect.get(t, p, recv);
        },
      });
    }
    get value() {
      if (typeof this._fetch !== "function") throw new TypeError("Illegal invocation");
      const els = this._fetch();
      for (let i = 0; i < els.length; i++) {
        if (els[i] && els[i].checked) return els[i].value;
      }
      return "";
    }
    set value(v) {
      if (typeof this._fetch !== "function") throw new TypeError("Illegal invocation");
      const want = String(v);
      const els = this._fetch();
      for (let i = 0; i < els.length; i++) {
        if (els[i]) els[i].checked = els[i].value === want;
      }
    }
  }
  Object.setPrototypeOf(RadioNodeList, NodeList);
  Object.setPrototypeOf(RadioNodeList.prototype, NodeList.prototype);
  {
    const desc = Object.getOwnPropertyDescriptor(RadioNodeList.prototype, "value");
    if (desc) Object.defineProperty(RadioNodeList.prototype, "value", { ...desc, enumerable: true, configurable: true });
  }
  Object.defineProperty(RadioNodeList.prototype, Symbol.toStringTag, { value: "RadioNodeList" });

  class HTMLFormControlsCollection extends HTMLCollection {
    constructor() {
      if (arguments[0] !== IDL_INTERNAL) throw new TypeError("Illegal constructor");
      super(IDL_INTERNAL, arguments[1]);
    }
    namedItem(name) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'namedItem' on 'HTMLFormControlsCollection': 1 argument required, but only 0 present.");
      }
      const hits = collectionNamedHits(this._fetch(), name);
      if (hits.length === 0) return null;
      if (hits.length === 1) return hits[0];
      const n = String(name);
      return new RadioNodeList(IDL_INTERNAL, () => collectionNamedHits(this._fetch(), n));
    }
  }
  Object.defineProperty(HTMLFormControlsCollection.prototype, "namedItem", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: HTMLFormControlsCollection.prototype.namedItem,
  });
  Object.defineProperty(HTMLFormControlsCollection.prototype, Symbol.toStringTag, {
    value: "HTMLFormControlsCollection",
  });

  class HTMLOptionsCollection extends HTMLCollection {
    constructor() {
      if (arguments[0] !== IDL_INTERNAL) throw new TypeError("Illegal constructor");
      super(IDL_INTERNAL, arguments[1]);
    }
    get length() { return this._fetch().length; }
    set length(n) {
      const select = this._select;
      if (!select) throw new TypeError("Illegal invocation");
      n = n >>> 0;
      while (this._fetch().length > n) {
        const last = this._fetch()[this._fetch().length - 1];
        if (last && last.parentNode) last.parentNode.removeChild(last);
        else break;
      }
      while (this._fetch().length < n) {
        select.appendChild(document.createElement("option"));
      }
    }
    add(element, ...rest) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'add' on 'HTMLOptionsCollection': 1 argument required, but only 0 present.");
      }
      const before = rest[0];
      const select = this._select;
      if (!select) throw new TypeError("Illegal invocation");
      if (!element) return;
      if (before == null) select.appendChild(element);
      else if (typeof before === "number") {
        const ref = this._fetch()[before];
        if (ref) select.insertBefore(element, ref.parentNode === select ? ref : ref.parentNode);
        else select.appendChild(element);
      } else if (before.parentNode) {
        before.parentNode.insertBefore(element, before);
      } else {
        select.appendChild(element);
      }
    }
    remove(index) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'remove' on 'HTMLOptionsCollection': 1 argument required, but only 0 present.");
      }
      const el = this._fetch()[index | 0];
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    get selectedIndex() {
      const opts = this._fetch();
      for (let i = 0; i < opts.length; i++) if (opts[i].selected) return i;
      return -1;
    }
    set selectedIndex(i) {
      const opts = this._fetch();
      i = i | 0;
      for (let j = 0; j < opts.length; j++) opts[j].selected = j === i;
    }
    _setIndex(index, option) {
      const select = this._select;
      if (!select) return;
      const opts = this._fetch();
      if (option == null) {
        const cur = opts[index];
        if (cur && cur.parentNode) cur.parentNode.removeChild(cur);
        return;
      }
      if (index < opts.length) {
        const cur = opts[index];
        if (cur && cur.parentNode) cur.parentNode.replaceChild(option, cur);
      } else {
        while (this._fetch().length < index) select.appendChild(document.createElement("option"));
        select.appendChild(option);
      }
    }
  }
  for (const k of ["length", "add", "remove", "selectedIndex"]) {
    const desc = Object.getOwnPropertyDescriptor(HTMLOptionsCollection.prototype, k);
    if (desc) Object.defineProperty(HTMLOptionsCollection.prototype, k, { ...desc, enumerable: true, configurable: true });
  }
  Object.defineProperty(HTMLOptionsCollection.prototype, Symbol.toStringTag, {
    value: "HTMLOptionsCollection",
  });

  const htmlAllTraps = {
    get(t, p, recv) {
      if (p === Symbol.iterator) {
        return function* () {
          const els = t._fetch();
          for (let i = 0; i < els.length; i++) yield els[i];
        };
      }
      if (typeof p === "symbol" || (typeof p === "string" && p.charCodeAt(0) === 95)) {
        return Reflect.get(t, p, recv);
      }
      if (p === "length") return t._fetch().length;
      if (p === "item" || p === "namedItem") return Reflect.get(t, p, recv);
      const s = String(p);
      if (/^\d+$/.test(s)) return t._fetch()[Number(s)];
      if (s) {
        const named = HTMLAllCollection.prototype.namedItem.call(t, s);
        if (named) return named;
      }
      return Reflect.get(t, p, recv);
    },
    apply(t, _thisArg, args) {
      return HTMLAllCollection.prototype.item.call(t, args.length ? args[0] : undefined);
    },
    ownKeys(t) {
      const els = t._fetch();
      const keys = [];
      for (let i = 0; i < els.length; i++) keys.push(String(i));
      return keys;
    },
    getOwnPropertyDescriptor(t, p) {
      if (typeof p === "symbol") return undefined;
      const s = String(p);
      if (/^\d+$/.test(s)) {
        const v = t._fetch()[Number(s)];
        if (v === undefined) return undefined;
        return { configurable: true, enumerable: true, writable: false, value: v };
      }
      if (s === "namedItem" || s === "item" || s === "length") return undefined;
      const named = s ? HTMLAllCollection.prototype.namedItem.call(t, s) : null;
      if (named) return { configurable: true, enumerable: false, writable: false, value: named };
      return undefined;
    },
    has(t, p) {
      if (typeof p === "symbol") return false;
      if (typeof p === "string" && p.charCodeAt(0) === 95) return true;
      if (p === "length" || p === "item" || p === "namedItem") return true;
      const s = String(p);
      if (/^\d+$/.test(s)) return Number(s) < t._fetch().length;
      if (s && HTMLAllCollection.prototype.namedItem.call(t, s)) return true;
      return Object.prototype[p] !== undefined || p === "constructor";
    },
  };

  class HTMLAllCollection {
    constructor() {
      if (arguments[0] !== IDL_INTERNAL) throw new TypeError("Illegal constructor");
      const fetch = arguments[1];
      const call = function htmlAll(...args) {
        return HTMLAllCollection.prototype.item.call(call, args[0]);
      };
      call._fetch = fetch;
      Object.setPrototypeOf(call, HTMLAllCollection.prototype);
      return new Proxy(call, htmlAllTraps);
    }
    item(...args) {
      if (args.length === 0 || args[0] == null) return null;
      const s = String(args[0]);
      if (s === "") return null;
      if (/^\d+$/.test(s)) return this._fetch()[Number(s)] || null;
      return this.namedItem(s);
    }
    namedItem(name) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'namedItem' on 'HTMLAllCollection': 1 argument required, but only 0 present.");
      }
      const hits = collectionNamedHits(this._fetch(), name).filter((el) => {
        return (el.localName || "").toLowerCase() !== "applet";
      });
      if (hits.length === 0) return null;
      if (hits.length === 1) return hits[0];
      const n = String(name);
      return new HTMLCollection(IDL_INTERNAL, () => collectionNamedHits(this._fetch(), n).filter((el) => {
        return (el.localName || "").toLowerCase() !== "applet";
      }));
    }
    get length() { return this._fetch().length; }
  }
  for (const k of ["item", "namedItem", "length"]) {
    Object.defineProperty(HTMLAllCollection.prototype, k, { enumerable: true, configurable: true });
  }
  Object.defineProperty(HTMLAllCollection.prototype, Symbol.toStringTag, { value: "HTMLAllCollection" });

  function isHtmlNamedElement(el) {
    return el && el.nodeType === 1 && el.namespaceURI === "http://www.w3.org/1999/xhtml";
  }
  function namedElementMatches(el, name) {
    if (!isHtmlNamedElement(el) || !name) return false;
    const tag = (el.localName || "").toLowerCase();
    const n = el.getAttribute("name");
    const id = el.getAttribute("id");
    if (tag === "embed" || tag === "form" || tag === "iframe" || tag === "img" || tag === "object") {
      if (n === name && n) return true;
    }
    if (tag === "object" && id === name && id) return true;
    if (tag === "img" && id === name && id && n) return true;
    return false;
  }
  function namedElementsOf(doc, name) {
    const out = [];
    if (!doc || !name) return out;
    const all = doc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (namedElementMatches(all[i], name)) out.push(all[i]);
    }
    return out;
  }
  const namedCollectionCache = new Map();
  function cachedNamedCollection(doc, name) {
    const h = doc.__h;
    let map = namedCollectionCache.get(h);
    if (!map) {
      map = new Map();
      namedCollectionCache.set(h, map);
    }
    if (!map.has(name)) {
      map.set(name, new HTMLCollection(IDL_INTERNAL, () => namedElementsOf(doc, name)));
    }
    return map.get(name);
  }
  exposeWindowName = function (name) {
    if (!name || typeof name !== "string") return;
    try {
      const desc = Object.getOwnPropertyDescriptor(globalThis, name);
      if (desc && typeof desc.get === "function") return;
      if (desc && desc.value !== undefined) return;
      Object.defineProperty(globalThis, name, {
        configurable: true,
        enumerable: true,
        get() {
          if (typeof document === "undefined" || !document.getElementById) return undefined;
          const el = document.getElementById(name);
          if (el) return el;
          const named = namedItemValue(document, name);
          return named === undefined ? undefined : named;
        },
        set(v) {
          // HTML Window named properties are replaceable. Next.js assigns
          // window.__NEXT_DATA__ after the JSON script with that id exists.
          Object.defineProperty(globalThis, name, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: v,
          });
        },
      });
    } catch (e) {}
  };
  function exposeAllIds() {
    try {
      const all = document.querySelectorAll("[id]");
      for (let i = 0; i < all.length; i++) {
        const id = all[i].id;
        if (id) exposeWindowName(id);
      }
    } catch (e) {}
    try {
      const intern = globalThis.test_driver_internal || {};
      intern.get_computed_label = function (el) { return Promise.resolve(getComputedAriaLabel(el)); };
      intern.get_computed_role = function (el) {
        try { return Promise.resolve((el && el.getAttribute && el.getAttribute("role")) || ""); }
        catch (err) { return Promise.resolve(""); }
      };
      globalThis.test_driver_internal = intern;
      if (globalThis.test_driver) {
        globalThis.test_driver.get_computed_label = intern.get_computed_label;
        globalThis.test_driver.get_computed_role = intern.get_computed_role;
      }
    } catch (e) {}
  }
  globalThis.__veExposeIds = exposeAllIds;
  globalThis.__veComputedLabel = getComputedAriaLabel;
  function namedItemValue(doc, name) {
    const els = namedElementsOf(doc, name);
    if (!els.length) return undefined;
    if (els.length === 1) {
      const el = els[0];
      if ((el.localName || "").toLowerCase() === "iframe") return el.contentWindow;
      return el;
    }
    return cachedNamedCollection(doc, name);
  }
  function namedPropertyNames(doc) {
    const names = [];
    const seen = Object.create(null);
    const all = doc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (!isHtmlNamedElement(el)) continue;
      const tag = (el.localName || "").toLowerCase();
      const n = el.getAttribute("name");
      const id = el.getAttribute("id");
      const contribute = (value) => {
        if (!value || seen[value]) return;
        seen[value] = true;
        names.push(value);
      };
      if (tag === "object" && id) contribute(id);
      if (tag === "img" && id && n) contribute(id);
      if ((tag === "embed" || tag === "form" || tag === "iframe" || tag === "img" || tag === "object") && n) {
        contribute(n);
      }
    }
    return names;
  }
  function isEventHandlerName(p) {
    return typeof p === "string" && p.length > 2 && p.charCodeAt(0) === 111 && p.charCodeAt(1) === 110;
  }
  function skipNamedProperty(p) {
    return typeof p !== "string" || p === "__proto__" || p.charCodeAt(0) === 95 || isEventHandlerName(p);
  }
  documentNamedTraps = {
    get(t, p, recv) {
      if (skipNamedProperty(p) || Reflect.has(t, p)) return Reflect.get(t, p, recv);
      const named = namedItemValue(t, p);
      return named === undefined ? Reflect.get(t, p, recv) : named;
    },
    has(t, p) {
      if (Reflect.has(t, p)) return true;
      if (skipNamedProperty(p)) return false;
      return namedElementsOf(t, p).length > 0;
    },
    ownKeys(t) {
      const keys = Reflect.ownKeys(t);
      for (const n of namedPropertyNames(t)) {
        if (!keys.includes(n) && !Reflect.has(t, n)) keys.push(n);
      }
      return keys;
    },
    getOwnPropertyDescriptor(t, p) {
      const d = Reflect.getOwnPropertyDescriptor(t, p);
      if (d) return d;
      if (skipNamedProperty(p)) return undefined;
      if (typeof p === "string" && !Reflect.has(t, p)) {
        const named = namedItemValue(t, p);
        if (named !== undefined) {
          return { configurable: true, enumerable: true, writable: false, value: named };
        }
      }
      return undefined;
    },
  };

  class Node extends EventTarget {
    get nodeType() { return D("nodeType", this.__h); }
    get nodeName() { return D("nodeName", this.__h); }
    get nodeValue() { return D("nodeValue", this.__h); }
    set nodeValue(v) { D("setNodeValue", this.__h, v === null ? "" : String(v)); }
    get textContent() { return D("textContent", this.__h); }
    set textContent(v) { D("setTextContent", this.__h, v == null ? "" : String(v)); }
    get parentNode() {
      if (this.__pgen === liveListGen) return this.__parent;
      const p = wrapDoc(D("parentNode", this.__h));
      this.__parent = p;
      this.__pgen = liveListGen;
      return p;
    }
    get parentElement() {
      const p = this.parentNode;
      return p && p.nodeType === 1 ? p : null;
    }
    get firstChild() { return wrap(D("firstChild", this.__h)); }
    get lastChild() { return wrap(D("lastChild", this.__h)); }
    get previousSibling() { return wrap(D("prevSibling", this.__h)); }
    get nextSibling() { return wrap(D("nextSibling", this.__h)); }
    get childNodes() {
      const h = this.__h;
      return new LiveNodeList(() => list(D("childNodes", h)));
    }
    get isConnected() { return !!D("isConnected", this.__h); }
    get ownerDocument() {
      if (this.nodeType === 9) return null;
      const h = D("ownerDocument", this.__h);
      if (!h || h === D("documentNode")) return browsingDocument || document;
      return wrapDoc(h) || browsingDocument || document;
    }
    appendChild(n) {
      if (n && n.nodeType === 11) {
        while (n.firstChild) this.appendChild(n.firstChild);
        return n;
      }
      D("appendChild", this.__h, handleOf(n));
      upgradeTree(n);
      try { prepareInsertedNode(n); } catch (e) { __ve.log("error", String(e)); }
      return n;
    }
    insertBefore(n, ref) {
      if (n && n.nodeType === 11) {
        while (n.firstChild) this.insertBefore(n.firstChild, ref);
        return n;
      }
      D("insertBefore", this.__h, handleOf(n), handleOf(ref));
      upgradeTree(n);
      try { prepareInsertedNode(n); } catch (e) { __ve.log("error", String(e)); }
      return n;
    }
    append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? document.createTextNode(n) : n); }
    prepend(...nodes) {
      const ref = this.firstChild;
      for (const n of nodes) this.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, ref);
    }
    get baseURI() { return D("url") || ""; }
    removeChild(n) {
      try { if (typeof globalThis.__veCancelPending === "function") globalThis.__veCancelPending(n); } catch (e) {}
      D("removeChild", this.__h, handleOf(n));
      return n;
    }
    replaceChild(n, old) { D("replaceChild", this.__h, handleOf(n), handleOf(old)); upgradeTree(n); return old; }
    cloneNode(deep) {
      if (!deep) return wrap(D("cloneNode", this.__h, false));
      const copy = wrap(D("cloneNode", this.__h, false));
      if (!copy) return copy;
      const kids = this.childNodes;
      if (kids) {
        for (let i = 0; i < kids.length; i++) copy.appendChild(kids[i].cloneNode(true));
      }
      if (this.nodeType === 1 && (this.localName || "").toLowerCase() === "template" && this.content && copy.content) {
        const src = this.content.childNodes;
        for (let i = 0; i < src.length; i++) copy.content.appendChild(src[i].cloneNode(true));
      }
      return copy;
    }
    contains(n) { return !!D("contains", this.__h, handleOf(n)); }
    hasChildNodes() { return this.childNodes.length > 0; }
    replaceChildren(...args) {
      const flat = [];
      for (const a of args) {
        if (a == null) continue;
        if (typeof a === "string") flat.push(document.createTextNode(a));
        else if (a.nodeType === 11) {
          const kids = a.childNodes;
          for (let i = 0; i < kids.length; i++) flat.push(kids[i]);
        } else flat.push(a);
      }
      D("replaceChildren", this.__h, ...flat.map(handleOf));
      for (const n of flat) {
        if (registry.size) upgradeTree(n);
        try { prepareInsertedNode(n); } catch (e) { __ve.log("error", String(e)); }
      }
    }
    isEqualNode(n) { return !!(n && n.__h && D("isEqualNode", this.__h, n.__h)); }
    isSameNode(n) { return this === n; }
    compareDocumentPosition(n) {
      if (!n || !n.__h) return Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC | Node.DOCUMENT_POSITION_PRECEDING;
      return D("compareDocumentPosition", this.__h, n.__h) | 0;
    }
    normalize() { D("normalize", this.__h); }
    lookupPrefix(ns) { return D("lookupPrefix", this.__h, ns == null ? null : String(ns)); }
    lookupNamespaceURI(prefix) { return D("lookupNamespaceURI", this.__h, prefix == null ? null : String(prefix)); }
    getRootNode(opts) { return wrapDoc(D("getRootNode", this.__h, !!(opts && opts.composed))) || this; }
    before(...nodes) {
      const p = this.parentNode;
      if (!p) return;
      for (const n of nodes) p.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, this);
    }
    after(...nodes) {
      const p = this.parentNode;
      if (!p) return;
      const ref = this.nextSibling;
      for (const n of nodes) p.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, ref);
    }
    replaceWith(...nodes) {
      const p = this.parentNode;
      if (!p) return;
      this.before(...nodes);
      p.removeChild(this);
    }
  }
  Node.ELEMENT_NODE = 1; Node.TEXT_NODE = 3; Node.PROCESSING_INSTRUCTION_NODE = 7;
  Node.COMMENT_NODE = 8;
  Node.DOCUMENT_NODE = 9; Node.DOCUMENT_TYPE_NODE = 10; Node.DOCUMENT_FRAGMENT_NODE = 11;
  Node.DOCUMENT_POSITION_DISCONNECTED = 1;
  Node.DOCUMENT_POSITION_PRECEDING = 2;
  Node.DOCUMENT_POSITION_FOLLOWING = 4;
  Node.DOCUMENT_POSITION_CONTAINS = 8;
  Node.DOCUMENT_POSITION_CONTAINED_BY = 16;
  Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

  function applyChildNode(proto) {
    proto.remove = function () {
      try { if (typeof globalThis.__veCancelPending === "function") globalThis.__veCancelPending(this); } catch (e) {}
      D("remove", this.__h);
    };
    proto.before = function (...args) {
      const p = this.parentNode;
      if (!p) return;
      for (const n of args) p.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, this);
    };
    proto.after = function (...args) {
      const p = this.parentNode;
      if (!p) return;
      const ref = this.nextSibling;
      for (const n of args) p.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, ref);
    };
    proto.replaceWith = function (...args) {
      const p = this.parentNode;
      if (!p) return;
      for (const n of args) p.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, this);
      this.remove();
    };
  }
  class CharacterData extends Node {
    get data() { return this.nodeValue || ""; }
    set data(v) { this.nodeValue = v; }
    get length() { return this.data.length; }
    substringData(offset, count) {
      offset |= 0;
      count |= 0;
      if (offset < 0 || offset > this.length) throw new DOMException("The index is not in the allowed range.", "IndexSizeError");
      return this.data.substring(offset, offset + Math.max(0, count));
    }
    appendData(s) { this.data += String(s); }
    insertData(offset, s) {
      offset |= 0;
      if (offset < 0 || offset > this.length) throw new DOMException("The index is not in the allowed range.", "IndexSizeError");
      this.data = this.data.slice(0, offset) + String(s) + this.data.slice(offset);
    }
    deleteData(offset, count) { this.replaceData(offset, count, ""); }
    replaceData(offset, count, s) {
      offset |= 0;
      count |= 0;
      if (offset < 0 || offset > this.length) throw new DOMException("The index is not in the allowed range.", "IndexSizeError");
      count = Math.min(Math.max(0, count), this.length - offset);
      this.data = this.data.slice(0, offset) + String(s) + this.data.slice(offset + count);
    }
  }
  applyChildNode(CharacterData.prototype);
  class Text extends CharacterData {
    constructor(data) {
      super();
      if (this.__h) return;
      const s = arguments.length === 0 || data === undefined ? "" : String(data);
      this.__h = D("createTextNode", s);
      nodes.set(this.__h, this);
    }
    splitText(offset) {
      offset |= 0;
      if (offset < 0 || offset > this.length) throw new DOMException("The index is not in the allowed range.", "IndexSizeError");
      const rest = this.data.slice(offset);
      this.deleteData(offset, this.length - offset);
      const next = document.createTextNode(rest);
      if (this.parentNode) this.parentNode.insertBefore(next, this.nextSibling);
      return next;
    }
  }
  class Comment extends CharacterData {
    constructor(data) {
      super();
      if (this.__h) return;
      const s = arguments.length === 0 || data === undefined ? "" : String(data);
      this.__h = D("createComment", s);
      nodes.set(this.__h, this);
    }
  }
  class ProcessingInstruction extends CharacterData {
    get target() { return D("nodeName", this.__h); }
  }
  class DocumentType extends Node {
    get name() { return D("doctypeName", this.__h); }
    get publicId() { return D("doctypePublicId", this.__h); }
    get systemId() { return D("doctypeSystemId", this.__h); }
  }
  applyChildNode(DocumentType.prototype);
  class TreeWalker {
    constructor(root, whatToShow) {
      this.root = root;
      this.whatToShow = whatToShow == null ? 0xFFFFFFFF : whatToShow | 0;
      this.currentNode = root;
    }
    _match(n) {
      if (!n) return false;
      const t = n.nodeType;
      const bit = t === 1 ? 1 : t === 3 ? 4 : t === 8 ? 128 : t === 7 ? 64 : 0;
      return !!(bit && (this.whatToShow & bit));
    }
    nextNode() {
      let n = this.currentNode;
      const root = this.root;
      const step = () => {
        if (n.firstChild) {
          n = n.firstChild;
          return true;
        }
        while (n && n !== root) {
          if (n.nextSibling) {
            n = n.nextSibling;
            return true;
          }
          n = n.parentNode;
        }
        return false;
      };
      while (step()) {
        if (this._match(n)) {
          this.currentNode = n;
          return n;
        }
      }
      return null;
    }
    previousNode() {
      let n = this.currentNode;
      const root = this.root;
      if (n === root) return null;
      const step = () => {
        if (n.previousSibling) {
          n = n.previousSibling;
          while (n.lastChild) n = n.lastChild;
          return true;
        }
        if (!n.parentNode || n.parentNode === root || n === root) return false;
        n = n.parentNode;
        return true;
      };
      while (step()) {
        if (this._match(n)) {
          this.currentNode = n;
          return n;
        }
      }
      return null;
    }
    parentNode() {
      if (this.currentNode === this.root) return null;
      const p = this.currentNode.parentNode;
      if (!p || !this._match(p)) return null;
      this.currentNode = p;
      return p;
    }
    firstChild() {
      let n = this.currentNode.firstChild;
      while (n) {
        if (this._match(n)) {
          this.currentNode = n;
          return n;
        }
        n = n.nextSibling;
      }
      return null;
    }
    lastChild() {
      let n = this.currentNode.lastChild;
      while (n) {
        if (this._match(n)) {
          this.currentNode = n;
          return n;
        }
        n = n.previousSibling;
      }
      return null;
    }
    nextSibling() {
      if (this.currentNode === this.root) return null;
      let n = this.currentNode.nextSibling;
      while (n) {
        if (this._match(n)) {
          this.currentNode = n;
          return n;
        }
        n = n.nextSibling;
      }
      return null;
    }
    previousSibling() {
      if (this.currentNode === this.root) return null;
      let n = this.currentNode.previousSibling;
      while (n) {
        if (this._match(n)) {
          this.currentNode = n;
          return n;
        }
        n = n.previousSibling;
      }
      return null;
    }
  }
  class DocumentFragment extends Node {
    constructor() {
      super();
      if (this.__h) return;
      this.__h = D("createFragment");
      nodes.set(this.__h, this);
    }
    querySelector(s) { return wrap(D("querySelector", this.__h, String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", this.__h, String(s))); }
    getElementById(id) { return wrap(D("getElementByIdScoped", this.__h, String(id))); }
    get children() { return list(D("children", this.__h)); }
    get firstElementChild() { return wrap(D("firstElementChild", this.__h)); }
    get lastElementChild() { return wrap(D("lastElementChild", this.__h)); }
    append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? document.createTextNode(n) : n); }
  }
  class ShadowRoot extends DocumentFragment {
    get mode() { return D("shadowMode", this.__h); }
    get host() { return wrap(D("host", this.__h)); }
    get innerHTML() { return D("innerHTML", this.__h); }
    set innerHTML(v) { D("setInnerHTML", this.__h, String(v).replace(/\r\n/g, "\n").replace(/\r/g, "\n")); }
    get adoptedStyleSheets() { return this._adopted || (this._adopted = []); }
    set adoptedStyleSheets(v) { this._adopted = v || []; }
  }
  class CSSStyleSheet {
    constructor() { this.cssRules = []; this._css = ""; }
    replaceSync(css) { this._css = String(css ?? ""); return this; }
    replace(css) { this.replaceSync(css); return Promise.resolve(this); }
    insertRule() { return 0; }
    deleteRule() {}
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
    constructor(h, attr, supported) {
      this.__h = h;
      this.__attr = attr || "class";
      this.__supported = supported || null;
    }
    _tokens() { return (D("getAttr", this.__h, this.__attr) || "").trim().split(/\s+/).filter(Boolean); }
    _set(ts) { D("setAttr", this.__h, this.__attr, ts.join(" ")); }
    get length() { return this._tokens().length; }
    get value() { return D("getAttr", this.__h, this.__attr) || ""; }
    set value(v) { D("setAttr", this.__h, this.__attr, String(v)); }
    toString() { return this.value; }
    contains(c) { return this._tokens().includes(String(c)); }
    add(...cs) {
      const t = this._tokens();
      for (const c of cs) { const s = String(c); if (s && !t.includes(s)) t.push(s); }
      this._set(t);
    }
    remove(...cs) {
      const drop = new Set(cs.map(String));
      this._set(this._tokens().filter((x) => !drop.has(x)));
    }
    toggle(c, force) {
      const has = this.contains(c);
      if (force === true || (!has && force !== false)) { this.add(c); return true; }
      this.remove(c); return false;
    }
    replace(oldToken, newToken) {
      if (!this.contains(oldToken)) return false;
      this.remove(oldToken);
      this.add(newToken);
      return true;
    }
    item(i) { return this._tokens()[i] || null; }
    supports(token) {
      return !!(this.__supported && this.__supported.has(String(token).toLowerCase()));
    }
    [Symbol.iterator]() { return this._tokens()[Symbol.iterator](); }
  }

  class Element extends Node {
    get tagName() { return D("tagName", this.__h); }
    get localName() { return D("localName", this.__h); }
    get prefix() { return D("prefix", this.__h); }
    hasAttributes() { return (D("attrNames", this.__h) || []).length > 0; }
    getAttributeNames() { return D("attrNames", this.__h) || []; }
    get namespaceURI() { return D("namespaceURI", this.__h); }
    get id() { return D("getAttr", this.__h, "id") || ""; }
    set id(v) { D("setAttr", this.__h, "id", String(v)); }
    get className() { return D("getAttr", this.__h, "class") || ""; }
    set className(v) { D("setAttr", this.__h, "class", String(v)); }
    get classList() { return this._cl || (this._cl = new DOMTokenList(this.__h, "class")); }
    set classList(v) { this.setAttribute("class", v == null ? "" : String(v)); }
    get innerHTML() { return D("innerHTML", this.__h); }
    set innerHTML(v) { D("setInnerHTML", this.__h, String(v).replace(/\r\n/g, "\n").replace(/\r/g, "\n")); }
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
    toggleAttribute(n, force) {
      const omitted = arguments.length < 2 || force === undefined;
      return !!D("toggleAttribute", this.__h, String(n), omitted ? null : !!force);
    }
    get attributes() {
      const h = this.__h;
      const recs = D("attrs", h) || [];
      const map = [];
      for (let i = 0; i < recs.length; i++) {
        const rec = recs[i];
        const name = rec.name;
        const ns = rec.ns == null || rec.ns === "" ? null : rec.ns;
        const colon = name.lastIndexOf(":");
        const attr = {
          name,
          nodeName: name,
          specified: true,
          localName: colon < 0 ? name : name.slice(colon + 1),
          prefix: colon < 0 ? null : name.slice(0, colon),
          namespaceURI: ns,
          ownerElement: this,
          get value() { return rec.value; },
          set value(v) {
            rec.value = String(v);
            D("setAttrNS", h, ns || "", name, rec.value);
          },
          get nodeValue() { return rec.value; },
          set nodeValue(v) { this.value = v; },
          get textContent() { return rec.value; },
          set textContent(v) { this.value = v; },
        };
        map.push(attr);
        map[name] = attr;
      }
      map.item = (i) => map[i] || null;
      map.getNamedItem = (n) => map[n] || null;
      map.length = recs.length;
      return map;
    }
    getAttributeNS(ns, n) {
      const v = D("getAttrNS", this.__h, ns == null ? "" : String(ns), String(n));
      return v == null ? null : v;
    }
    setAttributeNS(ns, n, v) {
      D("setAttrNS", this.__h, ns == null ? "" : String(ns), String(n), String(v));
    }
    querySelector(s) { return wrap(D("querySelector", this.__h, String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", this.__h, String(s))); }
    matches(s) { return !!D("matches", this.__h, String(s)); }
    webkitMatchesSelector(s) { return this.matches(s); }
    msMatchesSelector(s) { return this.matches(s); }
    closest(s) { return wrap(D("closest", this.__h, String(s))); }
    getElementsByTagName(n) { return new HTMLCollection(IDL_INTERNAL, () => list(D("getElementsByTagName", this.__h, String(n)))); }
    getElementsByTagNameNS(ns, n) {
      return new HTMLCollection(IDL_INTERNAL, () => {
        const all = list(D("getElementsByTagName", this.__h, String(n)));
        if (ns === "*") return all;
        const uri = ns == null ? "" : String(ns);
        return all.filter((el) => el.namespaceURI === uri);
      });
    }
    getElementsByClassName(n) { return list(D("getElementsByClassName", this.__h, String(n))); }
    attachShadow(init) {
      return wrap(D("attachShadow", this.__h, (init && init.mode) || "open", (init && init.slotAssignment) || ""));
    }
    get shadowRoot() { return wrap(D("shadowRoot", this.__h)); }
    insertAdjacentHTML(pos, html) { D("insertAdjacentHTML", this.__h, String(pos), String(html)); }
    insertAdjacentElement(pos, el) {
      pos = String(pos).toLowerCase();
      if (pos === "beforebegin") {
        if (!this.parentNode) return null;
        this.parentNode.insertBefore(el, this);
      } else if (pos === "afterbegin") {
        this.insertBefore(el, this.firstChild);
      } else if (pos === "beforeend") {
        this.appendChild(el);
      } else if (pos === "afterend") {
        if (!this.parentNode) return null;
        this.parentNode.insertBefore(el, this.nextSibling);
      } else {
        throw new DOMException("The string did not match the expected pattern.", "SyntaxError");
      }
      return el;
    }
    insertAdjacentText(pos, text) {
      return this.insertAdjacentElement(pos, document.createTextNode(text));
    }
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
      if (!(this instanceof HTMLElement) && !(this instanceof SVGElement) && !(this instanceof MathMLElement)) {
        return undefined;
      }
      return makeDataset(this);
    }
    get style() { return styleProxy(this.__h); }
    set style(v) { D("setAttr", this.__h, "style", String(v)); }
    get assignedSlot() { return null; }
    scrollTo(x, y) {
      if (x && typeof x === "object") {
        if (x.left != null) this.scrollLeft = x.left;
        if (x.top != null) this.scrollTop = x.top;
      } else {
        if (x != null) this.scrollLeft = Number(x) || 0;
        if (y != null) this.scrollTop = Number(y) || 0;
      }
    }
    scroll(x, y) { this.scrollTo(x, y); }
    scrollBy(x, y) {
      if (x && typeof x === "object") {
        this.scrollTo((this.scrollLeft || 0) + (Number(x.left) || 0), (this.scrollTop || 0) + (Number(x.top) || 0));
      } else {
        this.scrollTo((this.scrollLeft || 0) + (Number(x) || 0), (this.scrollTop || 0) + (Number(y) || 0));
      }
    }
    scrollIntoView() { D("scrollIntoView", this.__h); }
  }
  applyChildNode(Element.prototype);
  Element.prototype.streamAppendHTMLUnsafe = function streamAppendHTMLUnsafe(opts) {
    return streamHtmlInto(this, opts);
  };
  Element.prototype.streamHTMLUnsafe = Element.prototype.streamAppendHTMLUnsafe;
  class Sanitizer {
    constructor(config) {
      config = config || {};
      this._elements = config.elements
        ? new Set(Array.from(config.elements).map((e) => String(e).toLowerCase()))
        : null;
      this._attributes = config.attributes
        ? new Set(Array.from(config.attributes).map((a) => String(a).toLowerCase()))
        : null;
    }
    allowElement(name) {
      name = String(name || "").toLowerCase();
      if (name === "script" || name === "iframe" || name === "object" || name === "embed") return false;
      if (name.includes("-")) return false;
      if (this._elements) return this._elements.has(name);
      return true;
    }
    allowAttr(name) {
      name = String(name || "").toLowerCase();
      if (/^on/.test(name)) return false;
      if (this._attributes) return this._attributes.has(name);
      return true;
    }
  }
  function sanitizeTree(node, sanitizer) {
    if (!node) return;
    if (node.nodeType === 1) {
      const tag = (node.localName || "").toLowerCase();
      if (!sanitizer.allowElement(tag) || (node.getAttribute && node.getAttribute("is"))) {
        if (node.parentNode) node.parentNode.removeChild(node);
        return;
      }
      const attrs = node.getAttributeNames ? node.getAttributeNames() : [];
      for (let i = 0; i < attrs.length; i++) {
        if (!sanitizer.allowAttr(attrs[i])) node.removeAttribute(attrs[i]);
      }
    }
    const kids = node.childNodes ? Array.from(node.childNodes) : [];
    for (const k of kids) sanitizeTree(k, sanitizer);
    if (node.nodeType === 1 && (node.localName || "").toLowerCase() === "template" && node.content) {
      const ckids = Array.from(node.content.childNodes || []);
      for (const k of ckids) sanitizeTree(k, sanitizer);
    }
  }
  Element.prototype.setHTML = function setHTML(html, options) {
    const box = document.createElement("template");
    box.innerHTML = html == null ? "" : String(html);
    const sanitizer = (options && options.sanitizer) || new Sanitizer();
    sanitizeTree(box.content, sanitizer);
    while (this.firstChild) this.removeChild(this.firstChild);
    while (box.content.firstChild) this.appendChild(box.content.firstChild);
    applyAllPartialUpdates();
  };
  Element.prototype.setHTMLUnsafe = function setHTMLUnsafe(html) {
    const box = document.createElement("template");
    box.innerHTML = html == null ? "" : String(html);
    while (this.firstChild) this.removeChild(this.firstChild);
    while (box.content.firstChild) this.appendChild(box.content.firstChild);
    applyAllPartialUpdates();
  };
  (function defineOnHandlers() {
    const names = ("abort animationend animationiteration animationstart blur cancel canplay canplaythrough change click close contextmenu copy cuechange cut dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended error focus focusin focusout gotpointercapture input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart lostpointercapture mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup paste pause play playing pointercancel pointerdown pointerenter pointerleave pointermove pointerout pointerover pointerup progress ratechange reset resize scroll seeked seeking select stalled submit suspend timeupdate toggle touchcancel touchend touchmove touchstart transitionend volumechange waiting wheel").split(" ");
    for (const name of names) {
      const key = "on" + name;
      Object.defineProperty(Element.prototype, key, {
        configurable: true,
        enumerable: true,
        get() { return this["__" + key] || null; },
        set(v) { this["__" + key] = v; },
      });
    }
  })();

  (function defineAriaMixin() {
    const strings = [
      ["role", "role"],
      ["ariaBrailleLabel", "aria-braillelabel"],
      ["ariaBrailleRoleDescription", "aria-brailleroledescription"],
      ["ariaColCount", "aria-colcount"],
      ["ariaColIndex", "aria-colindex"],
      ["ariaColIndexText", "aria-colindextext"],
      ["ariaColSpan", "aria-colspan"],
      ["ariaDescription", "aria-description"],
      ["ariaKeyShortcuts", "aria-keyshortcuts"],
      ["ariaLabel", "aria-label"],
      ["ariaLevel", "aria-level"],
      ["ariaPlaceholder", "aria-placeholder"],
      ["ariaPosInSet", "aria-posinset"],
      ["ariaRelevant", "aria-relevant"],
      ["ariaRoleDescription", "aria-roledescription"],
      ["ariaRowCount", "aria-rowcount"],
      ["ariaRowIndex", "aria-rowindex"],
      ["ariaRowIndexText", "aria-rowindextext"],
      ["ariaRowSpan", "aria-rowspan"],
      ["ariaSetSize", "aria-setsize"],
      ["ariaValueMax", "aria-valuemax"],
      ["ariaValueMin", "aria-valuemin"],
      ["ariaValueNow", "aria-valuenow"],
      ["ariaValueText", "aria-valuetext"],
    ];
    for (const [js, attr] of strings) {
      Object.defineProperty(Element.prototype, js, {
        configurable: true,
        enumerable: true,
        get() {
          return this.hasAttribute(attr) ? this.getAttribute(attr) : null;
        },
        set(v) {
          if (v == null) this.removeAttribute(attr);
          else this.setAttribute(attr, String(v));
        },
      });
    }
    const enums = {
      ariaAtomic: { type: "enum", domAttrName: "aria-atomic", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaAutoComplete: { type: "enum", domAttrName: "aria-autocomplete", keywords: ["inline", "list", "both", "none"], isNullable: true, invalidVal: "none", defaultVal: null },
      ariaBusy: { type: "enum", domAttrName: "aria-busy", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaChecked: { type: "enum", domAttrName: "aria-checked", keywords: ["true", "false", "mixed"], nonCanon: { "": null }, isNullable: true, invalidVal: null, defaultVal: null },
      ariaCurrent: { type: "enum", domAttrName: "aria-current", keywords: ["page", "step", "location", "date", "time", "true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "true", defaultVal: null },
      ariaDisabled: { type: "enum", domAttrName: "aria-disabled", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaExpanded: { type: "enum", domAttrName: "aria-expanded", keywords: ["true", "false"], nonCanon: { "": null }, isNullable: true, invalidVal: null, defaultVal: null },
      ariaHasPopup: { type: "enum", domAttrName: "aria-haspopup", keywords: ["true", "false", "menu", "dialog", "listbox", "tree", "grid"], isNullable: true, invalidVal: "false", defaultVal: null },
      ariaHidden: { type: "enum", domAttrName: "aria-hidden", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaInvalid: { type: "enum", domAttrName: "aria-invalid", keywords: ["true", "false", "spelling", "grammar"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "true", defaultVal: null },
      ariaLive: { type: "enum", domAttrName: "aria-live", keywords: ["polite", "assertive", "off"], isNullable: true, invalidVal: "off", defaultVal: null },
      ariaModal: { type: "enum", domAttrName: "aria-modal", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaMultiLine: { type: "enum", domAttrName: "aria-multiline", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaMultiSelectable: { type: "enum", domAttrName: "aria-multiselectable", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaOrientation: { type: "enum", domAttrName: "aria-orientation", keywords: ["horizontal", "vertical"], nonCanon: { "": null }, isNullable: true, invalidVal: null, defaultVal: null },
      ariaPressed: { type: "enum", domAttrName: "aria-pressed", keywords: ["true", "false", "mixed"], nonCanon: { "": null }, isNullable: true, invalidVal: null, defaultVal: null },
      ariaReadOnly: { type: "enum", domAttrName: "aria-readonly", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaRequired: { type: "enum", domAttrName: "aria-required", keywords: ["true", "false"], nonCanon: { "": "false" }, isNullable: true, invalidVal: "false", defaultVal: null },
      ariaSelected: { type: "enum", domAttrName: "aria-selected", keywords: ["true", "false"], nonCanon: { "": null }, isNullable: true, invalidVal: null, defaultVal: null },
      ariaSort: { type: "enum", domAttrName: "aria-sort", keywords: ["ascending", "descending", "other", "none"], isNullable: true, invalidVal: "none", defaultVal: null },
    };
    for (const [js, spec] of Object.entries(enums)) {
      reflectAttr(Element.prototype, js, spec);
    }

    const ariaExplicit = new WeakMap();
    const origSet = Element.prototype.setAttribute;
    const origRemove = Element.prototype.removeAttribute;
    function ariaState(el) {
      let m = ariaExplicit.get(el);
      if (!m) {
        m = Object.create(null);
        ariaExplicit.set(el, m);
      }
      return m;
    }
    function ariaTreeRoot(el) {
      let n = el;
      while (n && n.parentNode) n = n.parentNode;
      return n || el;
    }
    function isShadowIncludingInclusiveAncestor(ancestor, node) {
      let n = node;
      while (n) {
        if (n === ancestor) return true;
        n = n.parentNode || n.host;
      }
      return false;
    }
    function ariaInScope(host, candidate) {
      if (!candidate) return false;
      const cRoot = ariaTreeRoot(candidate);
      const hRoot = ariaTreeRoot(host);
      if (cRoot === hRoot) return true;
      return isShadowIncludingInclusiveAncestor(cRoot, host);
    }
    function lookupId(reflected, id) {
      if (!id) return null;
      const root = ariaTreeRoot(reflected);
      let found = null;
      if (root && root.__h) {
        found = wrap(D("getElementByIdScoped", root.__h, String(id)));
      }
      if (!found) {
        const walk = (n) => {
          if (!n || found) return;
          if (n.nodeType === 1 && n.id === id) {
            found = n;
            return;
          }
          if (n.shadowRoot) walk(n.shadowRoot);
          const kids = n.childNodes;
          if (!kids) return;
          for (let i = 0; i < kids.length; i++) walk(kids[i]);
        };
        walk(root);
      }
      if (!found && root && root.nodeType === 9 && root.getElementById) {
        try { found = root.getElementById(id); } catch (e) {}
      }
      if (!found || !ariaInScope(reflected, found)) return null;
      return found;
    }
    function sameList(a, b) {
      if (!a || !b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }
    function defineAriaElement(js, attr, isList) {
      Object.defineProperty(Element.prototype, js, {
        configurable: true,
        enumerable: true,
        get() {
          const stAll = ariaState(this);
          let st = stAll[js] || (stAll[js] = {});
          let vis;
          if (st.explicit) {
            vis = st.explicit.filter((el) => ariaInScope(this, el));
          } else if (!this.hasAttribute(attr)) {
            return null;
          } else {
            const raw = this.getAttribute(attr);
            if (raw == null || raw === "") vis = [];
            else if (!isList) vis = (() => { const el = lookupId(this, raw); return el ? [el] : []; })();
            else {
              vis = [];
              const ids = raw.trim().split(/\s+/).filter(Boolean);
              for (const id of ids) {
                const el = lookupId(this, id);
                if (el) vis.push(el);
              }
            }
          }
          if (!isList) return vis[0] || null;
          if (st.frozen && sameList(st.frozen, vis)) return st.frozen;
          st.frozen = Object.freeze(vis.slice());
          return st.frozen;
        },
        set(v) {
          if (v == null) {
            delete ariaState(this)[js];
            origRemove.call(this, attr);
            return;
          }
          let list;
          try {
            if (!isList) {
              if (typeof v !== "object" || v.nodeType !== 1) {
                throw new TypeError("Failed to set '" + js + "'");
              }
              list = [v];
            } else {
              if (v == null || typeof v[Symbol.iterator] !== "function") {
                throw new TypeError("Failed to set '" + js + "'");
              }
              list = Array.from(v);
            }
          } catch (e) {
            if (e instanceof TypeError) throw e;
            throw new TypeError("Failed to set '" + js + "'");
          }
          for (const el of list) {
            if (!el || el.nodeType !== 1) throw new TypeError("Failed to set '" + js + "'");
          }
          ariaState(this)[js] = { explicit: list.slice() };
          origSet.call(this, attr, "");
        },
      });
    }
    defineAriaElement("ariaLabelledByElements", "aria-labelledby", true);
    defineAriaElement("ariaDescribedByElements", "aria-describedby", true);
    defineAriaElement("ariaControlsElements", "aria-controls", true);
    defineAriaElement("ariaFlowToElements", "aria-flowto", true);
    defineAriaElement("ariaOwnsElements", "aria-owns", true);
    defineAriaElement("ariaDetailsElements", "aria-details", true);
    defineAriaElement("ariaErrorMessageElements", "aria-errormessage", true);
    defineAriaElement("ariaActiveDescendantElement", "aria-activedescendant", false);
    const attrToJs = {
      "aria-labelledby": "ariaLabelledByElements",
      "aria-describedby": "ariaDescribedByElements",
      "aria-controls": "ariaControlsElements",
      "aria-flowto": "ariaFlowToElements",
      "aria-owns": "ariaOwnsElements",
      "aria-details": "ariaDetailsElements",
      "aria-activedescendant": "ariaActiveDescendantElement",
      "aria-errormessage": "ariaErrorMessageElements",
    };
    Element.prototype.setAttribute = function (n, v) {
      origSet.call(this, n, v);
      const js = attrToJs[String(n).toLowerCase()];
      if (js) delete ariaState(this)[js];
      const lower = String(n).toLowerCase();
      if (lower.startsWith("on") && !this.__hasOnAttr) {
        this.__hasOnAttr = true;
        onAttrCount++;
      }
      if (lower === "id") exposeWindowName(String(v));
      if (lower === "nonce") nonceMap.set(this, String(v));
    };
    Element.prototype.removeAttribute = function (n) {
      origRemove.call(this, n);
      const js = attrToJs[String(n).toLowerCase()];
      if (js) delete ariaState(this)[js];
      if (String(n).toLowerCase() === "nonce") nonceMap.delete(this);
    };
  })();

  function getComputedAriaLabel(el) {
    if (!el || !el.isConnected) return "";
    const labelled = el.ariaLabelledByElements;
    if (labelled && labelled.length) {
      return Array.from(labelled).map((e) => {
        try { return (e.innerText || e.textContent || "").trim(); } catch (err) { return ""; }
      }).filter(Boolean).join(" ");
    }
    try {
      const al = el.getAttribute && el.getAttribute("aria-label");
      if (al) return al;
    } catch (e) {}
    return "";
  }

  class HTMLElement extends Element {
    constructor() {
      super();
      if (this.__h) {
        this.__constructed = true;
        return;
      }
      let name = "";
      for (const [k, c] of registry) {
        if (c === new.target || (typeof c === "function" && this instanceof c)) {
          name = k;
          break;
        }
      }
      if (!name) return;
      this.__h = D("createElement", name);
      nodes.set(this.__h, this);
      this.__constructed = true;
      this.__upgraded = true;
    }
    get hidden() { return this.hasAttribute("hidden"); }
    set hidden(v) { v ? this.setAttribute("hidden", "") : this.removeAttribute("hidden"); }
    get autofocus() { return this.hasAttribute("autofocus"); }
    set autofocus(v) { v ? this.setAttribute("autofocus", "") : this.removeAttribute("autofocus"); }
    get inert() { return this.hasAttribute("inert"); }
    set inert(v) { v ? this.setAttribute("inert", "") : this.removeAttribute("inert"); }
    get nonce() {
      if (nonceMap.has(this)) return nonceMap.get(this);
      return this.getAttribute("nonce") || "";
    }
    set nonce(v) { nonceMap.set(this, String(v)); }
    get draggable() {
      const v = this.getAttribute("draggable");
      if (v == null) return (this.localName || "").toLowerCase() === "img";
      return v.toLowerCase() !== "false";
    }
    set draggable(v) { this.setAttribute("draggable", v ? "true" : "false"); }
    get spellcheck() {
      const v = this.getAttribute("spellcheck");
      if (v == null) return true;
      return v.toLowerCase() !== "false";
    }
    set spellcheck(v) { this.setAttribute("spellcheck", v ? "true" : "false"); }
    get tabIndex() {
      if (!this.hasAttribute("tabindex")) return 0;
      return parseInt(this.getAttribute("tabindex"), 10) | 0;
    }
    set tabIndex(v) { this.setAttribute("tabindex", String(v | 0)); }
    get contentEditable() {
      const v = (this.getAttribute("contenteditable") || "").toLowerCase();
      if (v === "true" || v === "") return "true";
      if (v === "false") return "false";
      if (v === "plaintext-only") return "plaintext-only";
      return "inherit";
    }
    set contentEditable(v) { this.setAttribute("contenteditable", String(v)); }
    get isContentEditable() { return this.contentEditable === "true" || this.contentEditable === "plaintext-only"; }
    get autocapitalize() { return this.getAttribute("autocapitalize") || ""; }
    set autocapitalize(v) { this.setAttribute("autocapitalize", String(v)); }
    get enterKeyHint() {
      const v = (this.getAttribute("enterkeyhint") || "").toLowerCase();
      const keys = ["enter", "done", "go", "next", "previous", "search", "send"];
      return keys.indexOf(v) >= 0 ? v : "";
    }
    set enterKeyHint(v) { this.setAttribute("enterkeyhint", String(v)); }
    get inputMode() {
      const v = (this.getAttribute("inputmode") || "").toLowerCase();
      const keys = ["none", "text", "tel", "url", "email", "numeric", "decimal", "search"];
      return keys.indexOf(v) >= 0 ? v : "";
    }
    set inputMode(v) { this.setAttribute("inputmode", String(v)); }
    get popover() {
      const v = this.getAttribute("popover");
      if (v == null) return null;
      const s = String(v).toLowerCase();
      if (s === "manual") return "manual";
      if (s === "hint") return "hint";
      return "auto";
    }
    set popover(v) {
      if (v == null) this.removeAttribute("popover");
      else this.setAttribute("popover", String(v));
    }
    get innerText() { return innerTextOf(this); }
    set innerText(v) { setInnerText(this, v); }
    get outerText() { return this.innerText; }
    set outerText(v) { setOuterText(this, v); }
    get translate() {
      let n = this;
      while (n && n.nodeType === 1) {
        const raw = n.getAttribute && n.getAttribute("translate");
        if (raw != null) {
          const s = String(raw).toLowerCase();
          if (s === "no") return false;
          if (s === "yes" || s === "") return true;
        }
        n = n.parentElement;
      }
      return true;
    }
    set translate(v) { this.setAttribute("translate", v ? "yes" : "no"); }
    get dir() {
      const v = (this.getAttribute("dir") || "").toLowerCase();
      return v === "ltr" || v === "rtl" || v === "auto" ? v : "";
    }
    set dir(v) { D("setAttr", this.__h, "dir", String(v)); }
    get lang() { return D("getAttr", this.__h, "lang") || ""; }
    set lang(v) { D("setAttr", this.__h, "lang", String(v)); }
    get title() { return D("getAttr", this.__h, "title") || ""; }
    set title(v) { D("setAttr", this.__h, "title", String(v)); }
    get accessKey() { return D("getAttr", this.__h, "accesskey") || ""; }
    set accessKey(v) { D("setAttr", this.__h, "accesskey", String(v)); }
    get accessKeyLabel() {
      const raw = D("getAttr", this.__h, "accesskey");
      if (raw == null) return "";
      const tokens = String(raw).trim().split(/\s+/).filter(Boolean);
      if (tokens.length !== 1) return "";
      const key = tokens[0];
      if ([...key].length !== 1) return "";
      return key;
    }
    click() {
      if (this._clicking) return;
      this._clicking = true;
      try {
        let tag = "";
        try { tag = (this.localName || "").toLowerCase(); } catch (e) {}
        let type = "";
        try { type = (this.type || this.getAttribute("type") || "").toLowerCase(); } catch (e) {}
        const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, which: 1 });
        let allowed = true;
        try { allowed = this.dispatchEvent(ev); } catch (e) { __ve.log("error", String(e)); }
        if (!allowed) return;
        try { D("activate", this.__h); } catch (e) {}
        if (tag === "input" && (type === "checkbox" || type === "radio")) {
          try {
            this.dispatchEvent(new Event("input", { bubbles: true }));
            this.dispatchEvent(new Event("change", { bubbles: true }));
          } catch (e) {}
        }
      } finally {
        this._clicking = false;
      }
    }
    focus() {
      try {
        if (document.activeElement === this) return;
      } catch (e) {}
      D("focus", this.__h);
      this.dispatchEvent(new Event("focus", { bubbles: false }));
      this.dispatchEvent(new Event("focusin", { bubbles: true }));
    }
    blur() {
      D("blur", this.__h);
      this.dispatchEvent(new Event("blur", { bubbles: false }));
      this.dispatchEvent(new Event("focusout", { bubbles: true }));
    }
    get value() { const v = D("formValue", this.__h); return v == null ? "" : v; }
    set value(v) { D("setFormValue", this.__h, String(v)); this.dispatchEvent(new Event("input", { bubbles: true })); }
    get checked() { return !!D("checked", this.__h); }
    set checked(v) { D("setChecked", this.__h, !!v); }
    get selected() { return !!D("selected", this.__h); }
    set selected(v) { D("setSelected", this.__h, !!v); }
    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(v) { v ? this.setAttribute("disabled", "") : this.removeAttribute("disabled"); }
    get type() { return this.getAttribute("type") || ""; }
    set type(v) { this.setAttribute("type", String(v)); }
    get href() { return this.getAttribute("href") || ""; }
    set href(v) { this.setAttribute("href", v); }
    get src() { return this.getAttribute("src") || ""; }
    set src(v) { this.setAttribute("src", v); }
    get placeholder() { return this.getAttribute("placeholder") || ""; }
    set placeholder(v) { this.setAttribute("placeholder", v); }
    checkValidity() { return !!D("checkValidity", this.__h); }
    reportValidity() { return this.checkValidity(); }
  }
  function reflectName(proto) {
    Object.defineProperty(proto, "name", {
      configurable: true,
      enumerable: true,
      get() { return this.getAttribute("name") || ""; },
      set(v) { this.setAttribute("name", String(v)); },
    });
  }
  class HTMLInputElement extends HTMLElement {}
  class HTMLTextAreaElement extends HTMLElement {}
  function defineValueAccessor(proto) {
    Object.defineProperty(proto, "value", {
      get() { const v = D("formValue", this.__h); return v == null ? "" : v; },
      set(v) { D("setFormValue", this.__h, String(v)); },
      configurable: true,
      enumerable: true,
    });
  }
  defineValueAccessor(HTMLInputElement.prototype);
  defineValueAccessor(HTMLTextAreaElement.prototype);
  class HTMLSelectElement extends HTMLElement {
    get options() {
      if (this._options) return this._options;
      const select = this;
      const col = new HTMLOptionsCollection(IDL_INTERNAL, () => {
        const out = [];
        const walk = (node) => {
          for (let c = node.firstChild; c; c = c.nextSibling) {
            const tag = c.tagName;
            if (tag === "OPTION") out.push(c);
            else if (tag === "OPTGROUP") walk(c);
          }
        };
        walk(select);
        return out;
      });
      col._select = select;
      this._options = col;
      return col;
    }
    get selectedIndex() { return this.options.selectedIndex; }
    set selectedIndex(i) { this.options.selectedIndex = i; }
  }
  class HTMLOptionElement extends HTMLElement {
    get text() {
      return String(this.textContent || "").replace(/[\t\n\f\r ]+/g, " ").trim();
    }
    set text(v) { this.textContent = v == null ? "" : String(v); }
    get label() {
      return this.hasAttribute("label") ? this.getAttribute("label") : this.text;
    }
    set label(v) { this.setAttribute("label", String(v)); }
    get value() {
      return this.hasAttribute("value") ? this.getAttribute("value") : this.text;
    }
    set value(v) { this.setAttribute("value", String(v)); }
  }
  class HTMLButtonElement extends HTMLElement {}
  reflectName(HTMLInputElement.prototype);
  reflectName(HTMLTextAreaElement.prototype);
  reflectName(HTMLSelectElement.prototype);
  reflectName(HTMLButtonElement.prototype);
  class HTMLFormElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
    submit() { D("submit", this.__h); }
    reset() { D("reset", this.__h); }
    checkValidity() { return !!D("checkValidity", this.__h); }
    reportValidity() { return this.checkValidity(); }
    get elements() {
      if (this._elementsCol) return this._elementsCol;
      const form = this;
      this._elementsCol = new HTMLFormControlsCollection(IDL_INTERNAL, () => {
        const listed = "button,fieldset,input,object,output,select,textarea";
        const root = form.getRootNode && form.getRootNode();
        const scope = root && root.querySelectorAll ? root : document;
        const all = scope.querySelectorAll(listed);
        const formId = form.id;
        const out = [];
        for (let i = 0; i < all.length; i++) {
          const el = all[i];
          const owner = el.getAttribute("form");
          if (owner != null) {
            if (owner !== "" && owner === formId) out.push(el);
            continue;
          }
          let p = el.parentNode;
          let owned = false;
          while (p) {
            if (p === form) { owned = true; break; }
            if (p.tagName === "FORM") break;
            p = p.parentNode;
          }
          if (owned) out.push(el);
        }
        return out;
      });
      return this._elementsCol;
    }
  }
  function reflectedUrl(el, attr) {
    const raw = el.getAttribute(attr);
    if (raw == null) return "";
    try { return new URL(toUSV(raw), document.baseURI || location.href).href; }
    catch (e) { return encodeUSVHref(raw); }
  }
  function hyperlinkAbs(el, attr) {
    attr = attr || "href";
    try { return new URL(toUSV(el.getAttribute(attr) || ""), document.baseURI || location.href); }
    catch (e) { return null; }
  }
  function installHyperlinkUtils(proto, attr) {
    attr = attr || "href";
    const get = (part) => function () {
      const u = hyperlinkAbs(this, attr);
      if (!u) return part === "protocol" ? ":" : "";
      if (part === "origin") return u.origin;
      if (part === "protocol") return u.protocol;
      if (part === "host") return u.host;
      if (part === "hostname") return u.hostname;
      if (part === "port") return u.port;
      if (part === "pathname") return u.pathname;
      if (part === "search") return u.search;
      if (part === "hash") return u.hash;
      return "";
    };
    for (const part of ["origin", "protocol", "host", "hostname", "port", "pathname", "search", "hash"]) {
      Object.defineProperty(proto, part, { configurable: true, enumerable: true, get: get(part) });
    }
  }
  class HTMLAnchorElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
    get href() { return reflectedUrl(this, "href") || this.getAttribute("href") || ""; }
    set href(v) {
      const s = toUSV(v);
      this.setAttribute("href", /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s) ? encodeURI(s) : s);
    }
    get ping() { return this.getAttribute("ping") || ""; }
    set ping(v) { this.setAttribute("ping", toUSV(v)); }
    get target() { return this.getAttribute("target") || ""; }
    set target(v) { this.setAttribute("target", String(v)); }
    get rel() { return this.getAttribute("rel") || ""; }
    set rel(v) { this.setAttribute("rel", String(v)); }
    get relList() { return this._relTL || (this._relTL = new DOMTokenList(this.__h, "rel")); }
    set relList(v) { this.setAttribute("rel", v == null ? "" : String(v)); }
  }
  installHyperlinkUtils(HTMLAnchorElement.prototype, "href");
  class HTMLAreaElement extends HTMLElement {
    get ping() { return this.getAttribute("ping") || ""; }
    set ping(v) { this.setAttribute("ping", toUSV(v)); }
    get href() { return reflectedUrl(this, "href"); }
    set href(v) { this.setAttribute("href", toUSV(v)); }
  }
  installHyperlinkUtils(HTMLAreaElement.prototype, "href");
  class HTMLBaseElement extends HTMLElement {
    get href() { return reflectedUrl(this, "href") || this.getAttribute("href") || ""; }
    set href(v) { this.setAttribute("href", toUSV(v)); }
  }
  class HTMLSourceElement extends HTMLElement {
    get src() { return reflectedUrl(this, "src"); }
    set src(v) { this.setAttribute("src", toUSV(v)); }
    get srcset() { const v = this.getAttribute("srcset"); return v == null ? "" : toUSV(v); }
    set srcset(v) { this.setAttribute("srcset", toUSV(v)); }
  }
  class HTMLFrameElement extends HTMLElement {
    get src() { return reflectedUrl(this, "src"); }
    set src(v) { this.setAttribute("src", toUSV(v)); }
    get longDesc() { return reflectedUrl(this, "longdesc"); }
    set longDesc(v) { this.setAttribute("longdesc", toUSV(v)); }
  }
  class HTMLLinkElement extends HTMLElement {
    get rel() { return this.getAttribute("rel") || ""; }
    set rel(v) { this.setAttribute("rel", String(v)); }
    get relList() { return this._relTL || (this._relTL = new DOMTokenList(this.__h, "rel")); }
    set relList(v) { this.setAttribute("rel", v == null ? "" : String(v)); }
    get href() { return reflectedUrl(this, "href") || this.getAttribute("href") || ""; }
    set href(v) { this.setAttribute("href", toUSV(v)); }
    get media() { return this.getAttribute("media") || ""; }
    set media(v) { this.setAttribute("media", v == null ? "" : String(v)); }
    get blocking() { return this._blockingTL || (this._blockingTL = new DOMTokenList(this.__h, "blocking", RENDER_TOKENS)); }
    set blocking(v) { this.blocking.value = v == null ? "" : String(v); }
  }
  class HTMLImageElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
    get naturalWidth() { return D("box", this.__h, "naturalWidth"); }
    get naturalHeight() { return D("box", this.__h, "naturalHeight"); }
    get complete() { return true; }
  }
  function jsonClone(data) {
    try {
      const s = JSON.stringify(data === undefined ? null : data);
      return s === undefined ? "null" : s;
    } catch {
      return "null";
    }
  }
  function deliverMessage(dest, data, targetOrigin, source) {
    if (!dest) return;
    const payload = jsonClone(data);
    const r = D("framePostMessage", dest.__iframeH || "", payload, targetOrigin == null ? "*" : String(targetOrigin), D("origin"));
    if (!r || !r.ok) return;
    let parsed;
    try { parsed = JSON.parse(payload); } catch { parsed = null; }
    const origin = r.origin || "";
    // HTML postMessage is a task, not sync. createXHTMLCase posts then
    // listens; a sync dispatch drops the reply.
    queueMicrotask(() => {
      dest.dispatchEvent(new MessageEvent("message", { data: parsed, origin, source: source || null }));
    });
  }
  function frameWindow(iframe) {
    if (iframe._cw) return iframe._cw;
    const w = Object.create(EventTarget.prototype);
    w.__iframeH = iframe.__h;
    w.frameElement = iframe;
    w.closed = false;
    w.parent = globalThis;
    w.top = globalThis;
    w.self = w;
    w.window = w;
    Object.defineProperty(w, "document", {
      get() { return iframe.contentDocument; },
      configurable: true,
    });
    Object.defineProperty(w, "origin", {
      get() { return D("frameOrigin", iframe.__h) || D("origin"); },
      configurable: true,
    });
    const loc = {
      get href() { return D("frameUrl", iframe.__h) || "about:blank"; },
      get origin() { return D("frameLocationOrigin", iframe.__h) || "null"; },
    };
    w.location = loc;
    w.postMessage = function (data, targetOrigin) {
      deliverMessage(w, data, targetOrigin, globalThis);
    };
    w.addEventListener = EventTarget.prototype.addEventListener;
    w.removeEventListener = EventTarget.prototype.removeEventListener;
    w.dispatchEvent = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.addEventListener.call(w, "message", function (e) {
      if (iframe.contentDocument) return;
      if (e.data === "getOrigin" || e.data === "setDomainAndGetOrigin") {
        queueMicrotask(() => {
          globalThis.dispatchEvent(new MessageEvent("message", {
            data: w.origin,
            origin: w.origin,
            source: w,
          }));
        });
      }
    });
    iframe._cw = w;
    return w;
  }
  class HTMLIFrameElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
    get src() { return reflectedUrl(this, "src") || this.getAttribute("src") || ""; }
    set src(v) { this.setAttribute("src", toUSV(v)); }
    get longDesc() { return reflectedUrl(this, "longdesc") || this.getAttribute("longdesc") || ""; }
    set longDesc(v) { this.setAttribute("longdesc", toUSV(v)); }
    get contentDocument() {
      const h = D("frameDocument", this.__h);
      if (!h) return null;
      const n = wrap(h);
      if (n && Document && !(n instanceof Document)) Object.setPrototypeOf(n, Document.prototype);
      return n;
    }
    get contentWindow() {
      return frameWindow(this);
    }
  }
  class HTMLEmbedElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
  }
  class HTMLObjectElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
  }
  class HTMLCanvasElement extends HTMLElement {
    get width() {
      if (!this.hasAttribute("width")) return 300;
      const p = parseHtmlNonneg(this.getAttribute("width"));
      if (p === false || p > 2147483647) return 300;
      return p >>> 0;
    }
    set width(v) {
      let n = v >>> 0;
      if (n > 2147483647) n = 300;
      this.setAttribute("width", String(n));
      D("canvasResize", this.__h, n, this.height);
    }
    get height() {
      if (!this.hasAttribute("height")) return 150;
      const p = parseHtmlNonneg(this.getAttribute("height"));
      if (p === false || p > 2147483647) return 150;
      return p >>> 0;
    }
    set height(v) {
      let n = v >>> 0;
      if (n > 2147483647) n = 150;
      this.setAttribute("height", String(n));
      D("canvasResize", this.__h, this.width, n);
    }
    getContext(type) {
      if (String(type).toLowerCase() !== "2d") return null;
      if (!this._ctx2d) this._ctx2d = new CanvasRenderingContext2D(this);
      return this._ctx2d;
    }
    toDataURL() { return D("canvasToDataURL", this.__h) || "data:,"; }
  }
  class ImageData {
    constructor(a, b, c) {
      if (a && typeof a.length === "number" && typeof b === "number") {
        this.data = a instanceof Uint8ClampedArray ? a : new Uint8ClampedArray(a);
        this.width = b | 0;
        this.height = c == null ? ((this.data.length / (4 * this.width)) | 0) : (c | 0);
      } else {
        this.width = a | 0;
        this.height = b | 0;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
      this.colorSpace = "srgb";
    }
  }
  class Path2D {
    constructor(src) {
      this._c = [];
      this._p = [];
      this._r = [];
      if (src instanceof Path2D) {
        this._c = src._c.map((x) => x.slice());
        this._p = src._p.map((x) => x.slice());
        this._r = src._r.map((x) => x.slice());
      } else if (typeof src === "string") {
        this._svg(src);
      }
    }
    moveTo(x, y) { this._flush(false); this._c = [[+x, +y]]; }
    lineTo(x, y) {
      if (!this._c.length) this._c = [[+x, +y]];
      else this._c.push([+x, +y]);
    }
    closePath() { this._flush(true); }
    rect(x, y, w, h) { this._r.push([+x, +y, +w, +h]); }
    arc(x, y, r, a0, a1) {
      const steps = 16;
      for (let i = 0; i <= steps; i++) {
        const t = a0 + (a1 - a0) * (i / steps);
        const px = x + r * Math.cos(t);
        const py = y + r * Math.sin(t);
        if (i === 0) this.moveTo(px, py);
        else this.lineTo(px, py);
      }
    }
    addPath(p) {
      if (!(p instanceof Path2D)) return;
      this._p.push(...p._p.map((x) => x.slice()));
      this._r.push(...p._r.map((x) => x.slice()));
    }
    _flush(close) {
      if (this._c.length >= 2) {
        const poly = this._c.slice();
        if (close && poly.length) poly.push(poly[0].slice());
        this._p.push(poly);
      }
      this._c = [];
    }
    _payload() {
      this._flush(false);
      return JSON.stringify({ r: this._r, p: this._p });
    }
    _svg(d) {
      const re = /([MmLlHhVvZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
      let cmd = "M";
      let x = 0;
      let y = 0;
      let sx = 0;
      let sy = 0;
      const nums = [];
      const flushNums = () => {
        const rel = cmd === cmd.toLowerCase();
        const C = cmd.toUpperCase();
        if (C === "M" || C === "L") {
          while (nums.length >= 2) {
            let nx = nums.shift();
            let ny = nums.shift();
            if (rel) { nx += x; ny += y; }
            if (C === "M") this.moveTo(nx, ny);
            else this.lineTo(nx, ny);
            x = nx; y = ny;
            if (C === "M") { sx = x; sy = y; cmd = rel ? "l" : "L"; }
          }
        } else if (C === "H") {
          while (nums.length) {
            let nx = nums.shift();
            if (rel) nx += x;
            this.lineTo(nx, y);
            x = nx;
          }
        } else if (C === "V") {
          while (nums.length) {
            let ny = nums.shift();
            if (rel) ny += y;
            this.lineTo(x, ny);
            y = ny;
          }
        }
        nums.length = 0;
      };
      let m;
      while ((m = re.exec(d))) {
        if (m[1]) {
          flushNums();
          cmd = m[1];
          if (cmd === "Z" || cmd === "z") {
            this.closePath();
            x = sx; y = sy;
          }
        } else if (m[2]) nums.push(Number(m[2]));
      }
      flushNums();
    }
  }
  class CanvasRenderingContext2D {
    constructor(canvas) {
      this.canvas = canvas;
      this.__h = canvas.__h;
      this.fillStyle = "#000000";
      this.strokeStyle = "#000000";
      this.globalAlpha = 1;
      this.lineWidth = 1;
      this.font = "10px sans-serif";
      this._path = new Path2D();
    }
    fillRect(x, y, w, h) {
      D("canvasFillRect", this.__h, Number(x) || 0, Number(y) || 0, Number(w) || 0, Number(h) || 0, String(this.fillStyle));
    }
    clearRect(x, y, w, h) {
      D("canvasClearRect", this.__h, Number(x) || 0, Number(y) || 0, Number(w) || 0, Number(h) || 0);
    }
    beginPath() { this._path = new Path2D(); }
    closePath() { this._path.closePath(); }
    moveTo(x, y) { this._path.moveTo(x, y); }
    lineTo(x, y) { this._path.lineTo(x, y); }
    rect(x, y, w, h) { this._path.rect(x, y, w, h); }
    arc(x, y, r, a0, a1) { this._path.arc(x, y, r, a0, a1); }
    fill(path) {
      const p = path instanceof Path2D ? path : this._path;
      D("canvasFillPath", this.__h, p._payload(), String(this.fillStyle));
    }
    stroke() {}
    save() {}
    restore() {}
    translate() {}
    scale() {}
    rotate() {}
    setTransform() {}
    drawImage() {}
    fillText() {}
    strokeText() {}
    measureText(t) { return { width: String(t).length * 8 }; }
    createImageData(w, h) { return new ImageData(w, h); }
    getImageData(x, y, w, h) {
      const r = D("canvasGetImageData", this.__h, Number(x) || 0, Number(y) || 0, Number(w) || 0, Number(h) || 0) || {};
      const bin = atob(r.b64 || "");
      const data = new Uint8ClampedArray(bin.length);
      for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
      return new ImageData(data, r.w || 0, r.h || 0);
    }
    putImageData(im, dx, dy) {
      if (!im || !im.data) return;
      let s = "";
      for (let i = 0; i < im.data.length; i++) s += String.fromCharCode(im.data[i]);
      D("canvasPutImageData", this.__h, im.width, im.height, btoa(s), Number(dx) || 0, Number(dy) || 0);
    }
  }
  class HTMLUnknownElement extends HTMLElement {}
  class HTMLDivElement extends HTMLElement {}
  class HTMLParagraphElement extends HTMLElement {}
  class HTMLSpanElement extends HTMLElement {}
  class HTMLHeadElement extends HTMLElement {}
  class HTMLBodyElement extends HTMLElement {}
  class HTMLHtmlElement extends HTMLElement {}
  class HTMLTitleElement extends HTMLElement {}
  class HTMLScriptElement extends HTMLElement {
    constructor() {
      super();
      this._scriptCreated = true;
      this._asyncExplicit = false;
      this._asyncValue = true;
    }
    get blocking() { return this._blockingTL || (this._blockingTL = new DOMTokenList(this.__h, "blocking", RENDER_TOKENS)); }
    set blocking(v) { this.blocking.value = v == null ? "" : String(v); }
    get async() {
      if (this._scriptCreated) {
        if (this._asyncExplicit) return this._asyncValue;
        return true;
      }
      return this.hasAttribute("async");
    }
    set async(v) {
      this._asyncExplicit = true;
      this._asyncValue = !!v;
      if (v) this.setAttribute("async", "");
      else this.removeAttribute("async");
    }
    get defer() { return this.hasAttribute("defer"); }
    set defer(v) { v ? this.setAttribute("defer", "") : this.removeAttribute("defer"); }
    get src() { return reflectedUrl(this, "src") || this.getAttribute("src") || ""; }
    set src(v) { this.setAttribute("src", toUSV(v)); }
    get text() { return this.textContent || ""; }
    set text(v) { this.textContent = v == null ? "" : String(v); }
  }
  class HTMLStyleElement extends HTMLElement {
    get blocking() { return this._blockingTL || (this._blockingTL = new DOMTokenList(this.__h, "blocking", RENDER_TOKENS)); }
    set blocking(v) { this.blocking.value = v == null ? "" : String(v); }
  }
  class HTMLFrameSetElement extends HTMLElement {}
  class HTMLDetailsElement extends HTMLElement {}
  class HTMLFieldSetElement extends HTMLElement {}
  class HTMLMapElement extends HTMLElement {}
  class HTMLMetaElement extends HTMLElement {}
  class HTMLOutputElement extends HTMLElement {}
  class HTMLParamElement extends HTMLElement {}
  class HTMLSlotElement extends HTMLElement {
    assign(...nodes) {
      D("slotAssign", this.__h, JSON.stringify(nodes.map((n) => n && n.__h).filter(Boolean)));
    }
  }
  reflectName(HTMLFieldSetElement.prototype);
  reflectName(HTMLMapElement.prototype);
  reflectName(HTMLMetaElement.prototype);
  reflectName(HTMLOutputElement.prototype);
  reflectName(HTMLParamElement.prototype);
  reflectName(HTMLSlotElement.prototype);
  class HTMLTemplateElement extends HTMLElement {
    get content() { return wrap(D("templateContent", this.__h)); }
    get buffer() { return this.hasAttribute("buffer"); }
    set buffer(v) {
      if (v) this.setAttribute("buffer", "");
      else this.removeAttribute("buffer");
    }
    get src() {
      if (!this.hasAttribute("src")) return "";
      return reflectedUrl(this, "src");
    }
    set src(v) { this.setAttribute("src", toUSV(v)); }
  }
  class SVGElement extends Element {}
  class MathMLElement extends Element {}
  class SVGSVGElement extends SVGElement {}
  class SVGGraphicsElement extends SVGElement {}
  class SVGPathElement extends SVGGraphicsElement {}
  const RENDER_TOKENS = new Set(["render"]);
  const UNKNOWN_HTML = {
    applet: 1, attachment: 1, layer: 1, nolayer: 1, bgsound: 1, blink: 1,
    isindex: 1, listing: 1, xmp: 1, nextid: 1, noembed: 1, spacer: 1, keygen: 1,
  };
  const HTML = {
    input: HTMLInputElement, textarea: HTMLTextAreaElement, select: HTMLSelectElement,
    option: HTMLOptionElement, button: HTMLButtonElement, form: HTMLFormElement,
    a: HTMLAnchorElement, img: HTMLImageElement, iframe: HTMLIFrameElement, canvas: HTMLCanvasElement,
    link: HTMLLinkElement, style: HTMLStyleElement, area: HTMLAreaElement, base: HTMLBaseElement,
    source: HTMLSourceElement, frame: HTMLFrameElement,
    embed: HTMLEmbedElement, object: HTMLObjectElement,
    div: HTMLDivElement, p: HTMLParagraphElement, span: HTMLSpanElement,
    head: HTMLHeadElement, body: HTMLBodyElement, html: HTMLHtmlElement,
    title: HTMLTitleElement, script: HTMLScriptElement, frameset: HTMLFrameSetElement,
    template: HTMLTemplateElement,
    details: HTMLDetailsElement, fieldset: HTMLFieldSetElement, map: HTMLMapElement,
    meta: HTMLMetaElement, output: HTMLOutputElement, param: HTMLParamElement, slot: HTMLSlotElement,
  };
  function defHTML(name) {
    const C = class extends HTMLElement {};
    Object.defineProperty(C, "name", { value: name });
    return C;
  }
  const HTMLQuoteElement = defHTML("HTMLQuoteElement");
  const HTMLTimeElement = defHTML("HTMLTimeElement");
  const HTMLBRElement = defHTML("HTMLBRElement");
  const HTMLModElement = defHTML("HTMLModElement");
  const HTMLTableElement = defHTML("HTMLTableElement");
  const HTMLTableCaptionElement = defHTML("HTMLTableCaptionElement");
  const HTMLTableColElement = defHTML("HTMLTableColElement");
  const HTMLTableSectionElement = defHTML("HTMLTableSectionElement");
  const HTMLTableRowElement = defHTML("HTMLTableRowElement");
  const HTMLTableCellElement = defHTML("HTMLTableCellElement");
  const HTMLHeadingElement = defHTML("HTMLHeadingElement");
  const HTMLHRElement = defHTML("HTMLHRElement");
  const HTMLPreElement = defHTML("HTMLPreElement");
  const HTMLUListElement = defHTML("HTMLUListElement");
  const HTMLOListElement = defHTML("HTMLOListElement");
  const HTMLLIElement = defHTML("HTMLLIElement");
  const HTMLDListElement = defHTML("HTMLDListElement");
  const HTMLMarqueeElement = defHTML("HTMLMarqueeElement");
  const HTMLFontElement = defHTML("HTMLFontElement");
  const HTMLDirectoryElement = defHTML("HTMLDirectoryElement");
  const HTMLLabelElement = defHTML("HTMLLabelElement");
  const HTMLLegendElement = defHTML("HTMLLegendElement");
  const HTMLOptGroupElement = defHTML("HTMLOptGroupElement");
  const HTMLDataListElement = defHTML("HTMLDataListElement");
  const HTMLProgressElement = defHTML("HTMLProgressElement");
  const HTMLMeterElement = defHTML("HTMLMeterElement");
  const HTMLDialogElement = defHTML("HTMLDialogElement");
  const HTMLMenuElement = defHTML("HTMLMenuElement");
  const HTMLDataElement = defHTML("HTMLDataElement");
  const HTMLVideoElement = defHTML("HTMLVideoElement");
  const HTMLTrackElement = defHTML("HTMLTrackElement");
  const HTMLAudioElement = defHTML("HTMLAudioElement");
  Object.assign(HTML, {
    q: HTMLQuoteElement, blockquote: HTMLQuoteElement, time: HTMLTimeElement, br: HTMLBRElement,
    ins: HTMLModElement, del: HTMLModElement, table: HTMLTableElement, caption: HTMLTableCaptionElement,
    col: HTMLTableColElement, colgroup: HTMLTableColElement, tbody: HTMLTableSectionElement,
    thead: HTMLTableSectionElement, tfoot: HTMLTableSectionElement, tr: HTMLTableRowElement,
    td: HTMLTableCellElement, th: HTMLTableCellElement,
    h1: HTMLHeadingElement, h2: HTMLHeadingElement, h3: HTMLHeadingElement, h4: HTMLHeadingElement,
    h5: HTMLHeadingElement, h6: HTMLHeadingElement, hr: HTMLHRElement, pre: HTMLPreElement,
    ul: HTMLUListElement, ol: HTMLOListElement, li: HTMLLIElement, dl: HTMLDListElement,
    marquee: HTMLMarqueeElement, font: HTMLFontElement, dir: HTMLDirectoryElement,
    label: HTMLLabelElement, legend: HTMLLegendElement, optgroup: HTMLOptGroupElement,
    datalist: HTMLDataListElement, progress: HTMLProgressElement, meter: HTMLMeterElement,
    dialog: HTMLDialogElement, menu: HTMLMenuElement, data: HTMLDataElement,
    video: HTMLVideoElement, audio: HTMLAudioElement, track: HTMLTrackElement,
  });
  function parseHtmlInt(input) {
    let position = 0;
    let sign = 1;
    input = String(input);
    while (position < input.length && /^[ \t\n\f\r]$/.test(input[position])) position++;
    if (position >= input.length) return false;
    if (input[position] === "-") { sign = -1; position++; }
    else if (input[position] === "+") position++;
    if (position >= input.length || !/^[0-9]$/.test(input[position])) return false;
    let value = 0;
    while (position < input.length && /^[0-9]$/.test(input[position])) {
      value = value * 10 + (input.charCodeAt(position) - 48);
      position++;
    }
    if (value === 0) return 0;
    return sign * value;
  }
  function parseHtmlNonneg(input) {
    const v = parseHtmlInt(input);
    if (v === false || v < 0) return false;
    return v;
  }
  function parseHtmlDouble(input) {
    input = String(input);
    let position = 0;
    while (position < input.length && /^[ \t\n\f\r]$/.test(input[position])) position++;
    const rest = input.slice(position);
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)/.test(rest)) return false;
    const n = parseFloat(rest);
    if (!isFinite(n)) return false;
    return n;
  }
  function camelAttr(name) {
    if (name === "htmlFor") return "for";
    if (name === "className") return "class";
    if (name === "httpEquiv") return "http-equiv";
    return name.replace(/[A-Z]/g, (m) => m.toLowerCase());
  }
  function reflectAttr(proto, idl, spec) {
    if (typeof spec === "string") spec = { type: spec };
    if (spec && spec.type && typeof spec.type === "object") spec = spec.type;
    const type = spec.type || "string";
    const attr = spec.domAttrName || camelAttr(idl);
    const treatNull = !!spec.treatNullAsEmptyString;
    const getter = function () {
      const raw = this.getAttribute(attr);
      if (type === "boolean") return raw != null;
      if (type === "url") {
        if ((raw == null || raw === "") && (idl === "action" || idl === "formAction")) {
          return document.URL || location.href || "";
        }
        return reflectedUrl(this, attr);
      }
      if (type === "long") {
        if (raw == null) return spec.defaultVal == null ? 0 : spec.defaultVal;
        const p = parseHtmlInt(raw);
        if (p === false || p > 2147483647 || p < -2147483648) return spec.defaultVal == null ? 0 : spec.defaultVal;
        return p;
      }
      if (type === "limited long") {
        if (raw == null) return spec.defaultVal == null ? -1 : spec.defaultVal;
        const p = parseHtmlNonneg(raw);
        if (p === false || p > 2147483647) return spec.defaultVal == null ? -1 : spec.defaultVal;
        return p;
      }
      if (type === "unsigned long" || type === "limited unsigned long" || type === "limited unsigned long with fallback") {
        const def = spec.defaultVal == null ? (type === "limited unsigned long" ? 1 : 0) : spec.defaultVal;
        if (raw == null) return def;
        const p = parseHtmlNonneg(raw);
        if (p === false || p > 2147483647) return def;
        if ((type === "limited unsigned long" || type === "limited unsigned long with fallback") && p === 0) return def;
        return p >>> 0;
      }
      if (type === "clamped unsigned long") {
        const def = spec.defaultVal == null ? 1 : spec.defaultVal;
        const min = spec.min == null ? 0 : spec.min;
        const max = spec.max == null ? 2147483647 : spec.max;
        if (raw == null) return def;
        let p = parseHtmlNonneg(raw);
        if (p === false) return def;
        if (p < min) p = min;
        if (p > max) p = max;
        return p;
      }
      if (type === "double" || type === "limited double") {
        const def = spec.defaultVal == null ? 0 : spec.defaultVal;
        if (raw == null) return def;
        const n = parseHtmlDouble(raw);
        if (n === false) return def;
        if (type === "limited double" && n <= 0) return def;
        return n;
      }
      if (type === "enum") {
        const keywords = spec.keywords || [];
        const nonCanon = spec.nonCanon || {};
        if (raw == null) {
          return spec.defaultVal === undefined ? (spec.isNullable ? null : "") : spec.defaultVal;
        }
        if (Object.prototype.hasOwnProperty.call(nonCanon, raw)) return nonCanon[raw];
        const asciiLower = (s) => String(s).replace(/[A-Z]/g, (m) => m.toLowerCase());
        const lower = asciiLower(raw);
        let ret = spec.invalidVal === undefined ? (spec.defaultVal === undefined ? "" : spec.defaultVal) : spec.invalidVal;
        for (let i = 0; i < keywords.length; i++) {
          if (asciiLower(keywords[i]) === lower) { ret = keywords[i]; break; }
        }
        if (Object.prototype.hasOwnProperty.call(nonCanon, ret)) return nonCanon[ret];
        return ret;
      }
      if (raw == null) return "";
      return raw;
    };
    const setter = function (v) {
      if (type === "boolean") {
        if (v) this.setAttribute(attr, "");
        else this.removeAttribute(attr);
        return;
      }
      if (type === "limited long" && (v | 0) < 0) {
        throw new DOMException("Index or size is negative or greater than the allowed amount.", "IndexSizeError");
      }
      if (type === "limited unsigned long" && !(Number(v) > 0)) {
        throw new DOMException("Index or size is negative or greater than the allowed amount.", "IndexSizeError");
      }
      if (type === "enum") {
        if (spec.isNullable && v == null) { this.removeAttribute(attr); return; }
        this.setAttribute(attr, String(v));
        return;
      }
      if (type === "url") {
        this.setAttribute(attr, toUSV(v));
        return;
      }
      if (treatNull && v === null) {
        this.setAttribute(attr, "");
        return;
      }
      if (type === "long" || type === "limited long") {
        this.setAttribute(attr, String(v | 0));
        return;
      }
      if (type === "limited unsigned long with fallback") {
        let n = Number(v);
        const def = spec.defaultVal == null ? 1 : spec.defaultVal;
        if (!(n > 0) || n > 2147483647) n = def;
        this.setAttribute(attr, String(n >>> 0));
        return;
      }
      if (type.indexOf("unsigned") >= 0 || type.indexOf("clamped") >= 0) {
        let n = v >>> 0;
        if (n > 2147483647) n = spec.defaultVal == null ? 0 : spec.defaultVal;
        this.setAttribute(attr, String(n));
        return;
      }
      if (type.indexOf("double") >= 0) {
        if (type === "limited double" && !(Number(v) > 0)) return;
        this.setAttribute(attr, String(Number(v)));
        return;
      }
      this.setAttribute(attr, String(v));
    };
    if (spec.customGetter) {
      Object.defineProperty(proto, idl, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter,
      });
      return;
    }
    Object.defineProperty(proto, idl, {
      configurable: true,
      enumerable: true,
      get: getter,
      set: setter,
    });
  }
  const REFLECT = {
    a: { target: "string", download: "string", ping: "string", rel: "string", hreflang: "string", type: "string", referrerPolicy: { type: "enum", keywords: ["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"] }, coords: "string", charset: "string", name: "string", rev: "string", shape: "string" },
    q: { cite: "url" },
    data: { value: "string" },
    time: { dateTime: "string" },
    br: { clear: "string" },
    img: { alt: "string", src: "url", srcset: "string", crossOrigin: { type: "enum", keywords: ["anonymous", "use-credentials"], nonCanon: { "": "anonymous" }, isNullable: true, defaultVal: null, invalidVal: "anonymous" }, useMap: "string", isMap: "boolean", width: { type: "unsigned long", customGetter: true }, height: { type: "unsigned long", customGetter: true }, referrerPolicy: { type: "enum", keywords: ["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"] }, decoding: { type: "enum", keywords: ["async", "sync", "auto"], defaultVal: "auto", invalidVal: "auto" }, name: "string", lowsrc: "url", align: "string", hspace: "unsigned long", vspace: "unsigned long", longDesc: "url", border: { type: "string", treatNullAsEmptyString: true } },
    iframe: { src: "url", srcdoc: "string", name: "string", allowFullscreen: "boolean", width: "string", height: "string", referrerPolicy: { type: "enum", keywords: ["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"] }, align: "string", scrolling: "string", frameBorder: "string", longDesc: "url", marginHeight: { type: "string", treatNullAsEmptyString: true }, marginWidth: { type: "string", treatNullAsEmptyString: true } },
    embed: { src: "url", type: "string", width: "string", height: "string", align: "string", name: "string" },
    object: { data: "url", type: "string", name: "string", useMap: "string", width: "string", height: "string", align: "string", archive: "string", code: "string", declare: "boolean", hspace: "unsigned long", standby: "string", vspace: "unsigned long", codeBase: "url", codeType: "string", border: { type: "string", treatNullAsEmptyString: true } },
    param: { name: "string", value: "string", valueType: "string" },
    video: { src: "url", poster: "url", width: { type: "unsigned long", customGetter: true }, height: { type: "unsigned long", customGetter: true }, autoplay: "boolean", loop: "boolean", controls: "boolean", defaultMuted: { type: "boolean", domAttrName: "muted" }, playsInline: "boolean", loading: { type: "enum", keywords: ["lazy", "eager"], defaultVal: "eager", invalidVal: "eager" }, preload: { type: "enum", keywords: ["none", "metadata", "auto"], defaultVal: "metadata", invalidVal: "metadata" }, crossOrigin: { type: "enum", keywords: ["anonymous", "use-credentials"], nonCanon: { "": "anonymous" }, isNullable: true, defaultVal: null, invalidVal: "anonymous" } },
    audio: { src: "url", autoplay: "boolean", loop: "boolean", controls: "boolean", defaultMuted: { type: "boolean", domAttrName: "muted" }, loading: { type: "enum", keywords: ["lazy", "eager"], defaultVal: "eager", invalidVal: "eager" }, preload: { type: "enum", keywords: ["none", "metadata", "auto"], defaultVal: "metadata", invalidVal: "metadata" }, crossOrigin: { type: "enum", keywords: ["anonymous", "use-credentials"], nonCanon: { "": "anonymous" }, isNullable: true, defaultVal: null, invalidVal: "anonymous" } },
    source: { src: "url", type: "string", srcset: "string", sizes: "string", media: "string" },
    track: { kind: { type: "enum", keywords: ["subtitles", "captions", "descriptions", "chapters", "metadata"], defaultVal: "subtitles", invalidVal: "metadata" }, src: "url", srclang: "string", label: "string", default: "boolean" },
    form: { acceptCharset: { type: "string", domAttrName: "accept-charset" }, action: "url", autocomplete: { type: "enum", keywords: ["on", "off"], defaultVal: "on" }, enctype: { type: "enum", keywords: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], defaultVal: "application/x-www-form-urlencoded" }, encoding: { type: "enum", keywords: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], defaultVal: "application/x-www-form-urlencoded", domAttrName: "enctype" }, method: { type: "enum", keywords: ["get", "post", "dialog"], defaultVal: "get" }, name: "string", noValidate: "boolean", target: "string" },
    fieldset: { disabled: "boolean", name: "string" },
    legend: { align: "string" },
    label: { htmlFor: { type: "string", domAttrName: "for" } },
    input: { accept: "string", alt: "string", autocomplete: { type: "string", customGetter: true }, defaultChecked: { type: "boolean", domAttrName: "checked" }, dirName: "string", disabled: "boolean", formAction: "url", formEnctype: { type: "enum", keywords: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], invalidVal: "application/x-www-form-urlencoded" }, formMethod: { type: "enum", keywords: ["get", "post"], invalidVal: "get" }, formNoValidate: "boolean", formTarget: "string", height: { type: "unsigned long", customGetter: true }, max: "string", maxLength: "limited long", min: "string", minLength: "limited long", multiple: "boolean", name: "string", pattern: "string", placeholder: "string", readOnly: "boolean", required: "boolean", size: { type: "limited unsigned long", defaultVal: 20 }, src: "url", step: "string", type: { type: "enum", keywords: ["hidden", "text", "search", "tel", "url", "email", "password", "date", "time", "datetime-local", "number", "range", "color", "checkbox", "radio", "file", "submit", "image", "reset", "button", "month", "week"], defaultVal: "text" }, width: { type: "unsigned long", customGetter: true }, defaultValue: { type: "string", domAttrName: "value" }, align: "string", useMap: "string" },
    button: { disabled: "boolean", formAction: "url", formEnctype: { type: "enum", keywords: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], invalidVal: "application/x-www-form-urlencoded" }, formMethod: { type: "enum", keywords: ["get", "post", "dialog"], invalidVal: "get" }, formNoValidate: "boolean", formTarget: "string", name: "string", type: { type: "enum", keywords: ["submit", "reset", "button"], defaultVal: "submit" }, value: "string" },
    select: { autocomplete: { type: "string", customGetter: true }, disabled: "boolean", multiple: "boolean", name: "string", required: "boolean", size: { type: "unsigned long", defaultVal: 0 } },
    optgroup: { disabled: "boolean", label: "string" },
    option: { disabled: "boolean", defaultSelected: { type: "boolean", domAttrName: "selected" } },
    textarea: { autocomplete: { type: "string", customGetter: true }, cols: { type: "limited unsigned long with fallback", defaultVal: 20 }, dirName: "string", disabled: "boolean", maxLength: "limited long", minLength: "limited long", name: "string", placeholder: "string", readOnly: "boolean", required: "boolean", rows: { type: "limited unsigned long with fallback", defaultVal: 2 }, wrap: "string" },
    output: { name: "string" },
    progress: { max: { type: "limited double", defaultVal: 1.0 } },
    meter: { value: { type: "double", customGetter: true }, min: { type: "double", customGetter: true }, max: { type: "double", customGetter: true }, low: { type: "double", customGetter: true }, high: { type: "double", customGetter: true }, optimum: { type: "double", customGetter: true } },
    p: { align: "string" },
    hr: { align: "string", color: "string", noShade: "boolean", size: "string", width: "string" },
    pre: { width: "long" },
    blockquote: { cite: "url" },
    ol: { reversed: "boolean", start: { type: "long", defaultVal: 1 }, type: "string", compact: "boolean" },
    ul: { compact: "boolean", type: "string" },
    li: { value: "long", type: "string" },
    dl: { compact: "boolean" },
    div: { align: "string" },
    body: { text: { type: "string", treatNullAsEmptyString: true }, link: { type: "string", treatNullAsEmptyString: true }, vLink: { type: "string", treatNullAsEmptyString: true }, aLink: { type: "string", treatNullAsEmptyString: true }, bgColor: { type: "string", treatNullAsEmptyString: true }, background: "string" },
    h1: { align: "string" }, h2: { align: "string" }, h3: { align: "string" }, h4: { align: "string" }, h5: { align: "string" }, h6: { align: "string" },
    table: { align: "string", border: "string", frame: "string", rules: "string", summary: "string", width: "string", bgColor: { type: "string", treatNullAsEmptyString: true }, cellPadding: { type: "string", treatNullAsEmptyString: true }, cellSpacing: { type: "string", treatNullAsEmptyString: true } },
    caption: { align: "string" },
    colgroup: { span: { type: "clamped unsigned long", defaultVal: 1, min: 1, max: 1000 }, align: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, vAlign: "string", width: "string" },
    col: { span: { type: "clamped unsigned long", defaultVal: 1, min: 1, max: 1000 }, align: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, vAlign: "string", width: "string" },
    tbody: { align: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, vAlign: "string" },
    thead: { align: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, vAlign: "string" },
    tfoot: { align: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, vAlign: "string" },
    tr: { align: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, vAlign: "string", bgColor: { type: "string", treatNullAsEmptyString: true } },
    td: { colSpan: { type: "clamped unsigned long", defaultVal: 1, min: 1, max: 1000 }, rowSpan: { type: "clamped unsigned long", defaultVal: 1, min: 0, max: 65534 }, headers: "string", scope: { type: "enum", keywords: ["row", "col", "rowgroup", "colgroup"] }, abbr: "string", align: "string", axis: "string", height: "string", width: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, noWrap: "boolean", vAlign: "string", bgColor: { type: "string", treatNullAsEmptyString: true } },
    th: { colSpan: { type: "clamped unsigned long", defaultVal: 1, min: 1, max: 1000 }, rowSpan: { type: "clamped unsigned long", defaultVal: 1, min: 0, max: 65534 }, headers: "string", scope: { type: "enum", keywords: ["row", "col", "rowgroup", "colgroup"] }, abbr: "string", align: "string", axis: "string", height: "string", width: "string", ch: { type: "string", domAttrName: "char" }, chOff: { type: "string", domAttrName: "charoff" }, noWrap: "boolean", vAlign: "string", bgColor: { type: "string", treatNullAsEmptyString: true } },
    base: { target: "string" },
    link: { crossOrigin: { type: "enum", keywords: ["anonymous", "use-credentials"], nonCanon: { "": "anonymous" }, isNullable: true, defaultVal: null, invalidVal: "anonymous" }, as: { type: "enum", keywords: ["fetch", "audio", "document", "embed", "font", "image", "manifest", "object", "report", "script", "sharedworker", "style", "track", "video", "worker", "xslt"], defaultVal: "", invalidVal: "" }, media: "string", integrity: "string", hreflang: "string", type: "string", referrerPolicy: { type: "enum", keywords: ["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"] }, charset: "string", rev: "string", target: "string" },
    meta: { name: "string", httpEquiv: { type: "string", domAttrName: "http-equiv" }, content: "string", media: "string", scheme: "string" },
    style: { media: "string", type: "string" },
    html: { version: "string" },
    script: { type: "string", noModule: "boolean", charset: "string", defer: "boolean", crossOrigin: { type: "enum", keywords: ["anonymous", "use-credentials"], nonCanon: { "": "anonymous" }, isNullable: true, defaultVal: null, invalidVal: "anonymous" }, integrity: "string", event: "string", htmlFor: { type: "string", domAttrName: "for" } },
    slot: { name: "string" },
    ins: { cite: "url", dateTime: "string" },
    del: { cite: "url", dateTime: "string" },
    details: { open: "boolean" },
    menu: { compact: "boolean" },
    dialog: { open: "boolean" },
    marquee: { bgColor: "string", height: "string", hspace: "unsigned long", scrollAmount: { type: "unsigned long", defaultVal: 6 }, scrollDelay: { type: "unsigned long", defaultVal: 85 }, trueSpeed: "boolean", vspace: "unsigned long", width: "string" },
    frameset: { cols: "string", rows: "string" },
    frame: { name: "string", scrolling: "string", src: "url", frameBorder: "string", longDesc: "url", noResize: "boolean", marginHeight: { type: "string", treatNullAsEmptyString: true }, marginWidth: { type: "string", treatNullAsEmptyString: true } },
    dir: { compact: "boolean" },
    font: { color: { type: "string", treatNullAsEmptyString: true }, face: "string", size: "string" },
    area: { alt: "string", coords: "string", shape: "string", target: "string", download: "string", ping: "string", rel: "string", hreflang: "string", type: "string", noHref: "boolean", referrerPolicy: { type: "enum", keywords: ["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"] } },
    canvas: { width: { type: "unsigned long", defaultVal: 300 }, height: { type: "unsigned long", defaultVal: 150 } },
  };
  for (const tag of Object.keys(REFLECT)) {
    const ctor = HTML[tag] || HTMLElement;
    const spec = REFLECT[tag];
    for (const idl of Object.keys(spec)) reflectAttr(ctor.prototype, idl, spec[idl]);
  }

  const SVG = {
    svg: SVGSVGElement, path: SVGPathElement, g: SVGGraphicsElement, circle: SVGGraphicsElement,
    rect: SVGGraphicsElement, line: SVGGraphicsElement, polyline: SVGGraphicsElement,
    polygon: SVGGraphicsElement, text: SVGGraphicsElement, defs: SVGElement, use: SVGGraphicsElement,
    symbol: SVGElement, clipPath: SVGElement, linearGradient: SVGElement, radialGradient: SVGElement,
    stop: SVGElement, title: SVGElement, desc: SVGElement, tspan: SVGGraphicsElement,
  };

  class Document extends Node {
    constructor() {
      super();
      if (this.__h) return;
      this.__h = D("createDocument", "", "", null);
      nodes.set(this.__h, this);
      installDocumentLocation(this);
    }
    get onreadystatechange() { return onReadyStateChange.get(this) || null; }
    set onreadystatechange(v) {
      if (v == null) onReadyStateChange.delete(this);
      else onReadyStateChange.set(this, v);
    }
    get onvisibilitychange() { return this._onvisibilitychange || null; }
    set onvisibilitychange(v) { this._onvisibilitychange = typeof v === "function" ? v : null; }
    get documentElement() { return wrap(D("documentElement", this.__h)); }
    get dir() {
      const de = this.documentElement;
      const v = ((de && de.getAttribute("dir")) || "").toLowerCase();
      return v === "ltr" || v === "rtl" || v === "auto" ? v : "";
    }
    set dir(v) {
      if (this.documentElement) this.documentElement.dir = v;
    }
    get doctype() { return wrap(D("doctype", this.__h)); }
    get head() { return wrap(D("head", this.__h)); }
    get body() { return wrap(D("body", this.__h)); }
    set body(v) {
      if (v == null || typeof v !== "object" || v.nodeType !== 1) {
        throw new TypeError("Document.body: not an Element");
      }
      const htmlNS = "http://www.w3.org/1999/xhtml";
      if (v.namespaceURI !== htmlNS || (v.localName !== "body" && v.localName !== "frameset")) {
        throw new DOMException("Failed to set the 'body' property on 'Document'.", "HierarchyRequestError");
      }
      const root = this.documentElement;
      if (!root) {
        throw new DOMException("Failed to set the 'body' property on 'Document'.", "HierarchyRequestError");
      }
      const cur = this.body;
      if (cur) cur.parentNode.replaceChild(v, cur);
      else root.appendChild(v);
    }
    get forms() {
      return new HTMLCollection(IDL_INTERNAL, () => list(D("getElementsByTagName", this.__h, "form")));
    }
    get images() {
      return new HTMLCollection(IDL_INTERNAL, () =>
        list(D("getElementsByTagName", this.__h, "img")).filter(
          (el) => el.namespaceURI === "http://www.w3.org/1999/xhtml",
        ),
      );
    }
    get links() {
      return new HTMLCollection(IDL_INTERNAL, () => list(D("documentLinks", this.__h)));
    }
    get scripts() {
      return new HTMLCollection(IDL_INTERNAL, () =>
        list(D("getElementsByTagName", this.__h, "script")).filter(
          (el) => el.namespaceURI === "http://www.w3.org/1999/xhtml",
        ),
      );
    }
    get embeds() {
      if (!this._embeds) {
        const doc = this;
        this._embeds = new HTMLCollection(IDL_INTERNAL, () =>
          list(D("getElementsByTagName", doc.__h, "embed")).filter(
            (el) => el.namespaceURI === "http://www.w3.org/1999/xhtml",
          ),
        );
      }
      return this._embeds;
    }
    get plugins() { return this.embeds; }
    get implementation() {
      if (!this._impl) {
        const impl = {
          createHTMLDocument(title) {
            if (arguments.length === 0 || title === undefined) {
              return wrap(D("createHTMLDocument", null));
            }
            return wrap(D("createHTMLDocument", String(title)));
          },
          hasFeature() { return true; },
          createDocument(ns, qname, doctype) {
            const d = wrap(D(
              "createDocument",
              ns == null ? "" : String(ns),
              qname == null ? "" : String(qname),
              handleOf(doctype),
            ));
            if (d) Object.setPrototypeOf(d, XMLDocument.prototype);
            return d;
          },
          createDocumentType(name, publicId, systemId) {
            return wrap(D(
              "createDocumentType",
              String(name),
              publicId == null ? "" : String(publicId),
              systemId == null ? "" : String(systemId),
            ));
          },
        };
        Object.setPrototypeOf(impl, DOMImplementation.prototype);
        this._impl = impl;
      }
      return this._impl;
    }
    get title() { return D("title", this.__h); }
    set title(v) { D("setTitle", this.__h, String(v)); }
    get URL() {
      const browsing = D("documentNode");
      return this.__h === browsing ? D("url") : "about:blank";
    }
    get documentURI() { return this.URL; }
    get characterSet() { return "UTF-8"; }
    get charset() { return "UTF-8"; }
    get inputEncoding() { return "UTF-8"; }
    get contentType() { return "text/html"; }
    get compatMode() { return this.__h === D("documentNode") ? D("compatMode") : "CSS1Compat"; }
    get cookie() { return this.__h === D("documentNode") ? D("cookie") : ""; }
    set cookie(v) { if (this.__h === D("documentNode")) D("setCookie", String(v)); }
    get lastModified() {
      const raw = D("lastModified");
      const date = raw ? new Date(raw) : new Date();
      const p = (n) => ("0" + n).slice(-2);
      return p(date.getMonth() + 1) + "/" + p(date.getDate()) + "/" + date.getFullYear()
        + " " + [date.getHours(), date.getMinutes(), date.getSeconds()].map(p).join(":");
    }
    get applets() { return this._applets || (this._applets = new HTMLCollection(IDL_INTERNAL, () => [])); }
    get all() {
      if (this._all) return this._all;
      const doc = this;
      this._all = new HTMLAllCollection(IDL_INTERNAL, () => list(D("getElementsByTagName", doc.__h, "*")));
      return this._all;
    }
    get defaultView() { return this.__h === D("documentNode") ? window : null; }
    get activeElement() {
      const h = D("activeElement");
      return h ? wrap(h) : (this.body || this.documentElement);
    }
    get location() { return this.__h === D("documentNode") ? location : null; }
    get readyState() { return this.__h === D("documentNode") ? D("readyState") : "complete"; }
    get domain() {
      if (this._domain != null) return this._domain;
      try { return new URL(this.URL || D("url") || "http://127.0.0.1").hostname; }
      catch (e) { return ""; }
    }
    set domain(v) { this._domain = String(v); }
    get hidden() { return false; }
    get visibilityState() { return "visible"; }
    get referrer() { return this.__h === D("documentNode") ? (D("referrer") || "") : ""; }
    get designMode() { return this._designMode || "off"; }
    set designMode(v) { this._designMode = String(v).toLowerCase() === "on" ? "on" : "off"; }
    hasFocus() { return this.__h === D("documentNode"); }
    execCommand(commandId) { if (arguments.length < 1) throw new TypeError("Not enough arguments"); return false; }
    queryCommandEnabled(commandId) { if (arguments.length < 1) throw new TypeError("Not enough arguments"); return false; }
    queryCommandIndeterm(commandId) { if (arguments.length < 1) throw new TypeError("Not enough arguments"); return false; }
    queryCommandState(commandId) { if (arguments.length < 1) throw new TypeError("Not enough arguments"); return false; }
    queryCommandSupported(commandId) { if (arguments.length < 1) throw new TypeError("Not enough arguments"); return false; }
    queryCommandValue(commandId) { if (arguments.length < 1) throw new TypeError("Not enough arguments"); return ""; }
    createAttribute(name) {
      const el = this.createElement("span");
      el.setAttribute(String(name), "");
      return el.getAttributeNode ? el.getAttributeNode(String(name)) : { name: String(name), value: "" };
    }
    createAttributeNS(ns, name) { return this.createAttribute(name); }
    open() { return this; }
    close() {}
    static parseHTMLUnsafe(html) {
      if (arguments.length < 1) throw new TypeError("Not enough arguments");
      const d = new Document();
      try { d.write(String(html == null ? "" : html)); } catch (e) {}
      return d;
    }
    static parseHTML(html) {
      if (arguments.length < 1) throw new TypeError("Not enough arguments");
      return Document.parseHTMLUnsafe(html);
    }
    createElement(name) {
      const el = wrap(D("createElement", String(name)));
      if (el && String(name).toLowerCase() === "script") el._scriptCreated = true;
      return el;
    }
    createElementNS(ns, name) { return wrap(D("createElementNS", ns == null ? "" : String(ns), String(name))); }
    createTextNode(data) { return wrap(D("createTextNode", String(data))); }
    createCDATASection(data) {
      const n = this.createTextNode(data == null ? "" : String(data));
      Object.defineProperty(n, "nodeType", { value: 4, configurable: true });
      Object.defineProperty(n, "nodeName", { value: "#cdata-section", configurable: true });
      return n;
    }
    write(...args) {
      const html = args.map((a) => a == null ? "" : String(a)).join("");
      D("documentWrite", this.__h, html);
    }
    writeln(...args) { this.write(...args, "\n"); }
    createComment(data) { return wrap(D("createComment", String(data))); }
    createTreeWalker(root, whatToShow) { return new TreeWalker(root, whatToShow); }
    createNodeIterator(root, whatToShow) {
      const tw = new TreeWalker(root, whatToShow);
      return {
        root,
        whatToShow: tw.whatToShow,
        referenceNode: root,
        pointerBeforeReferenceNode: true,
        nextNode() {
          if (this.pointerBeforeReferenceNode) {
            this.pointerBeforeReferenceNode = false;
            if (tw._match(root)) {
              this.referenceNode = root;
              return root;
            }
          }
          const n = tw.nextNode();
          if (n) this.referenceNode = n;
          return n;
        },
        previousNode() {
          const n = tw.previousNode();
          if (n) this.referenceNode = n;
          return n;
        },
      };
    }
    elementFromPoint(x, y) { return wrap(D("elementFromPoint", Number(x) || 0, Number(y) || 0)); }
    elementsFromPoint(x, y) { return list(D("elementsFromPoint", Number(x) || 0, Number(y) || 0)); }
    getSelection() { return window.getSelection(); }
    get currentScript() { return currentScriptNode; }
    get adoptedStyleSheets() { return this._adopted || (this._adopted = []); }
    set adoptedStyleSheets(v) { this._adopted = v || []; }
    createProcessingInstruction(target, data) {
      const t = String(target);
      const d = data == null ? "" : String(data);
      if (!isXmlName(t) || d.includes("?>")) {
        throw new DOMException("The string contains invalid characters.", "InvalidCharacterError");
      }
      return wrap(D("createProcessingInstruction", t, d));
    }
    createDocumentFragment() { return wrap(D("createFragment")); }
    createEvent(t) {
      t = String(t);
      if (/custom/i.test(t)) return new CustomEvent("custom");
      if (/key/i.test(t)) return new KeyboardEvent("keydown");
      if (/mouse|click/i.test(t)) return new MouseEvent("click");
      if (/input/i.test(t)) return new InputEvent("input");
      return new Event(t);
    }
    getElementById(id) {
      const s = id === null ? "null" : id === undefined ? "undefined" : String(id);
      if (s === "") return null;
      return wrap(D("getElementByIdScoped", this.__h, s));
    }
    querySelector(s) { return wrap(D("querySelector", this.__h, String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", this.__h, String(s))); }
    getElementsByTagName(n) { return new HTMLCollection(IDL_INTERNAL, () => list(D("getElementsByTagName", this.__h, String(n)))); }
    getElementsByTagNameNS(ns, n) {
      return new HTMLCollection(IDL_INTERNAL, () => {
        const all = list(D("getElementsByTagName", this.__h, String(n)));
        if (ns === "*") return all;
        const uri = ns == null ? "" : String(ns);
        return all.filter((el) => el.namespaceURI === uri);
      });
    }
    getElementsByClassName(n) { return new HTMLCollection(IDL_INTERNAL, () => list(D("getElementsByClassName", this.__h, String(n)))); }
    getElementsByName(n) {
      if (arguments.length < 1) throw new TypeError("Not enough arguments");
      const want = String(n);
      return new LiveNodeList(() => {
        const all = list(D("getElementsByTagName", this.__h, "*"));
        return all.filter((el) => el.namespaceURI === "http://www.w3.org/1999/xhtml" && el.getAttribute("name") === want);
      });
    }
    importNode(n, deep) { return wrap(D("importNode", handleOf(n), !!deep)); }
    adoptNode(n) {
      if (n == null) throw new TypeError("Failed to execute 'adoptNode' on 'Document'");
      if (n.nodeType === 9) throw new DOMException("Document nodes cannot be adopted.", "NotSupportedError");
      return wrap(D("adoptNode", handleOf(n))) || n;
    }
    createRange() { return new Range(); }
    open() {
      if (arguments.length >= 3) return blankWindow(arguments[0]);
      return this;
    }
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

  function toUSV(s) {
    s = String(s);
    let o = "";
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF) {
        const n = s.charCodeAt(i + 1);
        if (n >= 0xDC00 && n <= 0xDFFF) { o += s[i] + s[++i]; continue; }
        o += "\uFFFD"; continue;
      }
      if (c >= 0xDC00 && c <= 0xDFFF) { o += "\uFFFD"; continue; }
      o += s[i];
    }
    return o;
  }
  function encodeUSVHref(s) {
    return toUSV(s).replace(/\uFFFD/g, "%EF%BF%BD");
  }
  function EventSource(url) {
    this.url = encodeUSVHref(String(url));
    this.readyState = 2;
    this.close = function () {};
  }
  function blankWindow(url) {
    const loc = {
      _href: encodeUSVHref(url == null || url === "" ? "about:blank" : String(url)),
      get href() { return this._href; },
      set href(v) { this._href = encodeUSVHref(String(v)); },
      get hash() {
        const i = this._href.indexOf("#");
        return i < 0 ? "" : this._href.slice(i);
      },
    };
    const doc = {
      get URL() { return loc.href; },
      get documentURI() { return loc.href; },
    };
    return { location: loc, document: doc, closed: false, close() { this.closed = true; } };
  }
  class Location {
    toString() { return D("locationGet", "href"); }
    get href() { return D("locationGet", "href"); }
    set href(v) {
      const r = D("locationSet", "href", toUSV(v));
      if (r === "hashchange") {
        try { window.dispatchEvent(new Event("hashchange")); } catch (e) {}
      }
    }
    get protocol() { return D("locationGet", "protocol"); }
    set protocol(v) { D("locationSet", "protocol", String(v)); }
    get host() { return D("locationGet", "host"); }
    set host(v) { D("locationSet", "host", String(v)); }
    get hostname() { return D("locationGet", "hostname"); }
    set hostname(v) { D("locationSet", "hostname", String(v)); }
    get port() { return D("locationGet", "port"); }
    set port(v) { D("locationSet", "port", String(v)); }
    get pathname() { return D("locationGet", "pathname"); }
    set pathname(v) { D("locationSet", "pathname", String(v)); }
    get search() { return D("locationGet", "search"); }
    set search(v) { D("locationSet", "search", String(v)); }
    get hash() { return D("locationGet", "hash"); }
    set hash(v) {
      D("locationSet", "hash", toUSV(v));
      try { window.dispatchEvent(new HashChangeEvent("hashchange")); } catch (e) {}
    }
    get origin() { return D("locationGet", "origin"); }
    get ancestorOrigins() {
      return this._ancestorOrigins || (this._ancestorOrigins = Object.assign(["length"], { length: 0, item() { return null; }, contains() { return false; } }));
    }
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
  function reflectDocColor(js, attr) {
    Object.defineProperty(Document.prototype, js, {
      configurable: true,
      enumerable: true,
      get() { return (this.body && this.body.getAttribute(attr)) || ""; },
      set(v) { if (this.body) this.body.setAttribute(attr, v === null ? "" : String(v)); },
    });
  }
  reflectDocColor("fgColor", "text");
  reflectDocColor("linkColor", "link");
  reflectDocColor("vlinkColor", "vlink");
  reflectDocColor("alinkColor", "alink");
  reflectDocColor("bgColor", "bgcolor");

  class CustomElementRegistry {
    define(name, ctor) {
      name = String(name).toLowerCase();
      registry.set(name, ctor);
      const w = waiters.get(name);
      if (w) { w.res(ctor); waiters.delete(name); }
      const found = D("querySelectorAll", "", name) || [];
      for (const h of found) {
        const existing = nodes.get(h);
        if (existing && existing.__upgraded) continue;
        if (existing) nodes.delete(h);
        wrap(h);
      }
    }
    get(name) { return registry.get(String(name).toLowerCase()); }
    whenDefined(name) {
      name = String(name).toLowerCase();
      const c = registry.get(name);
      if (c) return Promise.resolve(c);
      let w = waiters.get(name);
      if (!w) {
        w = {};
        w.p = new Promise((res) => { w.res = res; });
        waiters.set(name, w);
      }
      return w.p;
    }
    upgrade(root) {
      if (root == null) return;
      const walk = (n) => {
        if (!n) return;
        if (n.nodeType === 1) {
          upgradeOne(n, true);
          if (n.shadowRoot) walk(n.shadowRoot);
        }
        const kids = n.childNodes;
        if (!kids) return;
        for (let i = 0; i < kids.length; i++) walk(kids[i]);
      };
      walk(root);
    }
  }

  class MutationObserver {
    constructor(cb) { this._cb = cb; this._rev = D("revision"); this._on = false; this._opts = []; observers.push(this); }
    observe(target, options) {
      this._on = true;
      this._rev = D("revision");
      if (target == null && options == null) {
        this._opts = [{ target: document, childList: true, attributes: true, characterData: true, subtree: true, attributeFilter: null, attributeOldValue: false, characterDataOldValue: false }];
        return;
      }
      options = options || {};
      let attributes = !!options.attributes;
      let characterData = !!options.characterData;
      if (options.attributeOldValue || options.attributeFilter) attributes = true;
      if (options.characterDataOldValue) characterData = true;
      this._opts = this._opts.filter((o) => o.target !== target);
      this._opts.push({
        target,
        childList: !!options.childList,
        attributes,
        characterData,
        subtree: !!options.subtree,
        attributeFilter: options.attributeFilter ? Array.from(options.attributeFilter).map((n) => String(n).toLowerCase()) : null,
        attributeOldValue: !!options.attributeOldValue,
        characterDataOldValue: !!options.characterDataOldValue,
      });
    }
    disconnect() { this._on = false; this._opts = []; }
    takeRecords() { return this._drain(); }
    _inObservedTree(node, o) {
      if (!node || !o || !o.target) return false;
      if (node === o.target) return true;
      if (o.subtree && o.target.contains && o.target.contains(node)) return true;
      try { if (node.parentNode === o.target) return true; } catch (e) {}
      return false;
    }
    _match(target, r, o) {
      const inScope = this._inObservedTree(target, o);
      if (!inScope && r.type === "childList") {
        const added = r.added || [];
        const removed = r.removed || [];
        for (const h of added.concat(removed)) {
          if (this._inObservedTree(wrap(h), o)) return o.childList;
        }
        return false;
      }
      if (!inScope) return false;
      if (r.type === "childList") return o.childList;
      if (r.type === "attributes") {
        if (!o.attributes) return false;
        if (o.attributeFilter && !o.attributeFilter.includes(String(r.attr || "").toLowerCase())) return false;
        return true;
      }
      if (r.type === "characterData") return o.characterData;
      return false;
    }
    _drain() {
      if (!this._on) return [];
      const raw = D("mutationsSince", this._rev) || [];
      this._rev = D("revision");
      const recs = [];
      for (const r of raw) {
        const t = wrap(r.target);
        if (!t && r.type !== "childList") continue;
        for (const o of this._opts) {
          if (!this._match(t, r, o)) continue;
          const keepOld = (r.type === "attributes" && o.attributeOldValue) || (r.type === "characterData" && o.characterDataOldValue);
          recs.push({
            type: r.type,
            target: t || o.target,
            addedNodes: list(r.added || []),
            removedNodes: list(r.removed || []),
            attributeName: r.attr || null,
            oldValue: keepOld ? (r.oldValue == null ? null : r.oldValue) : null,
            previousSibling: wrap(r.prev) || null,
            nextSibling: wrap(r.next) || null,
          });
          break;
        }
      }
      return recs;
    }
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
        const id = D("fetchStart", String(this._u), this._m || "GET", "", body == null ? "" : String(body));
        let r = D("fetchPoll", id);
        for (let i = 0; i < 64 && r && r.pending; i++) {
          D("fetchPump");
          r = D("fetchPoll", id);
        }
        if (!r || r.error) throw new TypeError((r && r.error) || "fetch failed");
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

  function responseFrom(r) {
    let bodyUsed = false;
    const textBody = r.body;
    const b64 = r.bodyB64 || "";
    const consume = () => {
      if (bodyUsed) throw new TypeError("body already used");
      bodyUsed = true;
    };
    const bytes = () => {
      if (b64) {
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
      }
      const enc = unescape(encodeURIComponent(textBody || ""));
      const out = new Uint8Array(enc.length);
      for (let i = 0; i < enc.length; i++) out[i] = enc.charCodeAt(i);
      return out;
    };
    let locked = false;
    const stream = {
      get locked() { return locked; },
      getReader() {
        if (locked) throw new TypeError("ReadableStream is locked");
        locked = true;
        let i = 0;
        const buf = bytes();
        return {
          read() {
            bodyUsed = true;
            if (i >= buf.length) return Promise.resolve({ done: true, value: undefined });
            const end = Math.min(i + 16384, buf.length);
            const value = buf.slice(i, end);
            i = end;
            return Promise.resolve({ done: false, value });
          },
          cancel() { i = buf.length; bodyUsed = true; return Promise.resolve(); },
          releaseLock() { locked = false; },
        };
      },
    };
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      statusText: r.statusText || "",
      url: r.url,
      redirected: !!r.redirected,
      get bodyUsed() { return bodyUsed; },
      get body() { return stream; },
      headers: { get(n) { n = String(n).toLowerCase(); return (r.headers && r.headers[n]) || null; }, has(n) { return this.get(n) != null; } },
      text() { if (locked) throw new TypeError("body stream is locked"); consume(); return Promise.resolve(textBody); },
      json() { if (locked) throw new TypeError("body stream is locked"); consume(); return Promise.resolve(JSON.parse(textBody || "null")); },
      arrayBuffer() { if (locked) throw new TypeError("body stream is locked"); consume(); return Promise.resolve(bytes().buffer); },
      blob() { if (locked) throw new TypeError("body stream is locked"); consume(); const b = bytes(); return Promise.resolve({ size: b.length, type: "" }); },
      clone() {
        if (bodyUsed || locked) throw new TypeError("body already used");
        return responseFrom(r);
      },
    };
  }
  class AbortController {
    constructor() {
      this.signal = { aborted: false, reason: undefined, addEventListener(t, fn) { this._fn = fn; }, dispatch() { this.aborted = true; if (this._fn) this._fn(); } };
    }
    abort(reason) { this.signal.reason = reason; this.signal.dispatch(); }
  }
  function drainSwClientPosts() {
    const posts = D("swTakeClientPosts") || [];
    const sw = navigator.serviceWorker;
    for (const p of posts) {
      let data = p;
      try { data = JSON.parse(p); } catch (e) {}
      const ev = new MessageEvent("message", { data });
      try { if (typeof sw.onmessage === "function") sw.onmessage(ev); } catch (e) {}
      (sw._messageFns || []).forEach((fn) => { try { fn(ev); } catch (e) {} });
    }
  }
  function fetchImpl(url, init) {
    init = init || {};
    if (init.signal && init.signal.aborted) {
      return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
    }
    return new Promise((resolve, reject) => {
      try {
        const headers = JSON.stringify(init.headers || {});
        const body = init.body == null ? "" : String(init.body);
        const id = D("fetchStart", String(url && url.url ? url.url : url), init.method || "GET", headers, body);
        if (init.signal) {
          init.signal.addEventListener("abort", () => {
            D("fetchAbort", id);
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }
        const tick = () => {
          D("fetchPump");
          const r = D("fetchPoll", id);
          if (!r || r.pending) { setTimeout(tick, 0); return; }
          if (r.error) reject(new TypeError(r.error));
          else {
            resolve(responseFrom(r));
            queueMicrotask(drainSwClientPosts);
          }
        };
        queueMicrotask(tick);
      } catch (e) { reject(e); }
    });
  }

  class URLSearchParams {
    constructor(init) {
      this._ = [];
      if (init == null || init === "") return;
      if (typeof init === "string") {
        const s = init.charAt(0) === "?" ? init.slice(1) : init;
        for (const part of s.split("&")) {
          if (!part) continue;
          const eq = part.indexOf("=");
          const k = decodeURIComponent((eq < 0 ? part : part.slice(0, eq)).replace(/\+/g, " "));
          const v = decodeURIComponent((eq < 0 ? "" : part.slice(eq + 1)).replace(/\+/g, " "));
          this._.push([k, v]);
        }
      } else if (init instanceof URLSearchParams) {
        this._ = init._.map((p) => p.slice());
      } else if (Array.isArray(init)) {
        for (const pair of init) this.append(pair[0], pair[1]);
      } else if (typeof init === "object") {
        for (const k of Object.keys(init)) this.append(k, init[k]);
      }
    }
    append(k, v) { this._.push([String(k), String(v)]); }
    set(k, v) { this.delete(k); this.append(k, v); }
    get(k) { k = String(k); const x = this._.find((e) => e[0] === k); return x ? x[1] : null; }
    getAll(k) { k = String(k); return this._.filter((e) => e[0] === k).map((e) => e[1]); }
    has(k) { k = String(k); return this._.some((e) => e[0] === k); }
    delete(k) { k = String(k); this._ = this._.filter((e) => e[0] !== k); }
    toString() {
      return this._.map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
    }
    *entries() { yield* this._; }
    *keys() { for (const p of this._) yield p[0]; }
    *values() { for (const p of this._) yield p[1]; }
    forEach(fn, t) { for (const [k, v] of this._) fn.call(t, v, k, this); }
    [Symbol.iterator]() { return this.entries(); }
  }
  function normalizeUrlPath(path) {
    const parts = String(path || "/").split("/");
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === ".") continue;
      if (p === "..") {
        if (out.length && out[out.length - 1] !== "") out.pop();
        continue;
      }
      if (p === "" && out.length) continue;
      out.push(p);
    }
    let n = out.join("/");
    if (!n.startsWith("/")) n = "/" + n;
    if (path.endsWith("/") && n !== "/") n += "/";
    return n;
  }
  class URL {
    constructor(url, base) {
      let s = encodeUSVHref(url);
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
      this.pathname = normalizeUrlPath(m ? (m[4] || "/") : "/");
      this.search = m && m[5] ? m[5] : "";
      this.hash = m && m[6] ? m[6] : "";
      this.host = this.hostname + (this.port ? ":" + this.port : "");
      this.origin = this.protocol ? (this.protocol + "//" + this.host) : "null";
      if (m) this.href = this.protocol + "//" + this.host + this.pathname + this.search + this.hash;
      this.username = "";
      this.password = "";
      this.searchParams = new URLSearchParams(this.search);
    }
    toString() { return this.href; }
    toJSON() { return this.href; }
  }
  class DOMParser {
    parseFromString(str, type) {
      const html = str == null ? "" : String(str);
      if (String(type || "").toLowerCase().includes("xml")) {
        const doc = document.implementation.createHTMLDocument("");
        doc.body.textContent = html;
        return doc;
      }
      const body = /<body[\s\S]*?>([\s\S]*)<\/body>/i.exec(html);
      return wrap(D("parseHTMLDocument", body ? body[1] : html));
    }
  }
  function Blob(parts, opts) {
    this.size = 0;
    this.type = (opts && opts.type) || "";
    this._parts = parts || [];
  }
  URL.createObjectURL = () => "blob:vector:0";
  URL.revokeObjectURL = () => {};
  const b64tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function atob(s) {
    s = String(s).replace(/[^A-Za-z0-9+/=]/g, "");
    let out = "";
    const idx = (ch) => {
      if (!ch || ch === "=") return 0;
      const i = b64tab.indexOf(ch);
      return i < 0 ? 0 : i;
    };
    for (let i = 0; i < s.length; i += 4) {
      const n = (idx(s[i]) << 18) | (idx(s[i + 1]) << 12) | (idx(s[i + 2]) << 6) | idx(s[i + 3]);
      out += String.fromCharCode((n >> 16) & 255);
      if (s[i + 2] && s[i + 2] !== "=") out += String.fromCharCode((n >> 8) & 255);
      if (s[i + 3] && s[i + 3] !== "=") out += String.fromCharCode(n & 255);
    }
    return out;
  }
  function btoa(s) {
    s = String(s);
    let out = "";
    for (let i = 0; i < s.length; i += 3) {
      const a = s.charCodeAt(i) & 255;
      const b = i + 1 < s.length ? s.charCodeAt(i + 1) & 255 : 0;
      const c = i + 2 < s.length ? s.charCodeAt(i + 2) & 255 : 0;
      out += b64tab[a >> 2];
      out += b64tab[((a & 3) << 4) | (b >> 4)];
      out += i + 1 < s.length ? b64tab[((b & 15) << 2) | (c >> 6)] : "=";
      out += i + 2 < s.length ? b64tab[c & 63] : "=";
    }
    return out;
  }

  function childIndex(node) {
    if (!node || !node.parentNode) return 0;
    const kids = node.parentNode.childNodes;
    for (let i = 0; i < kids.length; i++) {
      if (kids[i] === node || (kids[i] && node && kids[i].__h === node.__h)) return i;
    }
    return 0;
  }
  function childAt(parent, offset) {
    const kids = parent.childNodes;
    return kids[offset] || null;
  }
  class Range {
    constructor() {
      this.startContainer = document;
      this.startOffset = 0;
      this.endContainer = document;
      this.endOffset = 0;
    }
    get collapsed() {
      return this.startContainer === this.endContainer && this.startOffset === this.endOffset;
    }
    get commonAncestorContainer() {
      let a = this.startContainer;
      while (a && !a.contains(this.endContainer) && a !== this.endContainer) a = a.parentNode;
      return a || document;
    }
    setStart(node, offset) {
      this.startContainer = node;
      this.startOffset = offset | 0;
    }
    setEnd(node, offset) {
      this.endContainer = node;
      this.endOffset = offset | 0;
    }
    setStartBefore(n) { this.setStart(n.parentNode, childIndex(n)); }
    setStartAfter(n) { this.setStart(n.parentNode, childIndex(n) + 1); }
    setEndBefore(n) { this.setEnd(n.parentNode, childIndex(n)); }
    setEndAfter(n) { this.setEnd(n.parentNode, childIndex(n) + 1); }
    collapse(toStart) {
      if (toStart) { this.endContainer = this.startContainer; this.endOffset = this.startOffset; }
      else { this.startContainer = this.endContainer; this.startOffset = this.endOffset; }
    }
    selectNode(n) {
      this.setStartBefore(n);
      this.setEndAfter(n);
    }
    selectNodeContents(n) {
      const len = (n.nodeType === 3 || n.nodeType === 8) ? n.length : n.childNodes.length;
      this.setStart(n, 0);
      this.setEnd(n, len);
    }
    cloneRange() {
      const r = new Range();
      r.startContainer = this.startContainer;
      r.startOffset = this.startOffset;
      r.endContainer = this.endContainer;
      r.endOffset = this.endOffset;
      return r;
    }
    deleteContents() {
      if (this.collapsed) return;
      if (this.startContainer === this.endContainer) {
        const c = this.startContainer;
        if (c.nodeType === 3 || c.nodeType === 8) {
          const start = Math.min(this.startOffset, this.endOffset);
          const end = Math.max(this.startOffset, this.endOffset);
          c.deleteData(start, end - start);
          this.endOffset = this.startOffset = start;
          return;
        }
        let n = childAt(c, this.startOffset);
        const end = childAt(c, this.endOffset);
        while (n && !(end && (n === end || n.__h === end.__h))) {
          const next = n.nextSibling;
          c.removeChild(n);
          n = next;
        }
        this.endOffset = this.startOffset;
      }
    }
    extractContents() {
      const frag = document.createDocumentFragment();
      if (this.collapsed) return frag;
      if (this.startContainer === this.endContainer) {
        const c = this.startContainer;
        if (c.nodeType === 3 || c.nodeType === 8) {
          const start = Math.min(this.startOffset, this.endOffset);
          const end = Math.max(this.startOffset, this.endOffset);
          frag.appendChild(document.createTextNode(c.substringData(start, end - start)));
          c.deleteData(start, end - start);
          this.endOffset = this.startOffset = start;
          return frag;
        }
        let n = childAt(c, this.startOffset);
        const end = childAt(c, this.endOffset);
        while (n && !(end && (n === end || n.__h === end.__h))) {
          const next = n.nextSibling;
          frag.appendChild(n);
          n = next;
        }
        this.endOffset = this.startOffset;
        return frag;
      }
      return frag;
    }
    cloneContents() {
      const frag = document.createDocumentFragment();
      if (this.collapsed) return frag;
      if (this.startContainer === this.endContainer) {
        const c = this.startContainer;
        if (c.nodeType === 3 || c.nodeType === 8) {
          const start = Math.min(this.startOffset, this.endOffset);
          const end = Math.max(this.startOffset, this.endOffset);
          frag.appendChild(document.createTextNode(c.substringData(start, end - start)));
          return frag;
        }
        let n = childAt(c, this.startOffset);
        const end = childAt(c, this.endOffset);
        while (n && n !== end) {
          frag.appendChild(n.cloneNode(true));
          n = n.nextSibling;
        }
      }
      return frag;
    }
    insertNode(node) {
      const c = this.startContainer;
      const o = this.startOffset;
      if (c.nodeType === 3) {
        const rest = c.splitText(o);
        if (c.parentNode) c.parentNode.insertBefore(node, rest);
        return;
      }
      c.insertBefore(node, childAt(c, o));
    }
    surroundContents(newParent) {
      const frag = this.extractContents();
      newParent.appendChild(frag);
      this.insertNode(newParent);
      this.selectNode(newParent);
    }
    toString() {
      if (this.startContainer === this.endContainer && (this.startContainer.nodeType === 3 || this.startContainer.nodeType === 8)) {
        const start = Math.min(this.startOffset, this.endOffset);
        const end = Math.max(this.startOffset, this.endOffset);
        return this.startContainer.data.substring(start, end);
      }
      if (this.startContainer === this.endContainer) {
        let out = "";
        let n = childAt(this.startContainer, this.startOffset);
        const end = childAt(this.startContainer, this.endOffset);
        while (n && n !== end) {
          out += n.textContent || "";
          n = n.nextSibling;
        }
        return out;
      }
      return "";
    }
    compareBoundaryPoints(how, source) {
      const a = how === Range.END_TO_START || how === Range.END_TO_END ? this.endOffset : this.startOffset;
      const b = how === Range.START_TO_END || how === Range.END_TO_END ? source.endOffset : source.startOffset;
      return a < b ? -1 : a > b ? 1 : 0;
    }
    comparePoint(node, offset) {
      offset |= 0;
      if (this.startContainer === node) {
        if (offset < this.startOffset) return -1;
        if (this.endContainer === node && offset > this.endOffset) return 1;
        return 0;
      }
      if (this.endContainer === node) return offset > this.endOffset ? 1 : 0;
      if (!this.startContainer.compareDocumentPosition) return 0;
      const pos = this.startContainer.compareDocumentPosition(node);
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return -1;
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return 1;
      return 0;
    }
    isPointInRange(node, offset) { return this.comparePoint(node, offset) === 0; }
    intersectsNode(node) {
      if (!node) return false;
      if (this.startContainer === node || this.endContainer === node) return true;
      if (node.contains && (node.contains(this.startContainer) || node.contains(this.endContainer))) return true;
      if (this.startContainer.contains && this.startContainer.contains(node)) return true;
      return false;
    }
  }
  Range.START_TO_START = 0;
  Range.START_TO_END = 1;
  Range.END_TO_END = 2;
  Range.END_TO_START = 3;

  const documentSelection = {
    _ranges: [],
    get rangeCount() { return this._ranges.length; },
    get anchorNode() { return this._ranges[0] ? this._ranges[0].startContainer : null; },
    get focusNode() { return this._ranges[0] ? this._ranges[0].endContainer : null; },
    addRange(r) { if (r) this._ranges.push(r); },
    removeAllRanges() { this._ranges = []; },
    getRangeAt(i) { return this._ranges[i] || null; },
    toString() { return this._ranges.map((r) => r.toString()).join(""); },
    collapse(node, offset) {
      this._ranges = [];
      if (!node) return;
      const r = new Range();
      r.setStart(node, offset || 0);
      r.collapse(true);
      this._ranges.push(r);
    },
  };

  const document = wrap(D("documentNode"));
  browsingDocument = document;
  const location = new Location();
  const history = new History();
  const windowProps = {
    window: null, self: null, document, location, history, atob, btoa,
    onhashchange: null, onpopstate: null,
    localStorage: storage("local"), sessionStorage: storage("session"),
    customElements: new CustomElementRegistry(),
    Event, HashChangeEvent, StorageEvent, MouseEvent, KeyboardEvent, CustomEvent, UIEvent, InputEvent, MessageEvent, EventTarget, DragEvent,
    Node, NodeList, Element, HTMLElement, Document, DocumentFragment, ShadowRoot, Text, Comment, CharacterData,
    ProcessingInstruction, DocumentType, HTMLCollection, HTMLAllCollection,
    HTMLFormControlsCollection, HTMLOptionsCollection, RadioNodeList,
    HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement, HTMLOptionElement,
    HTMLButtonElement, HTMLFormElement, HTMLAnchorElement, HTMLImageElement, HTMLLinkElement, HTMLUnknownElement, HTMLStyleElement,
    HTMLAreaElement, HTMLBaseElement, HTMLSourceElement, HTMLFrameElement,
    HTMLIFrameElement, HTMLCanvasElement, HTMLEmbedElement, HTMLObjectElement, HTMLDocument: Document, HTMLDivElement, HTMLParagraphElement,
    HTMLSpanElement, HTMLHeadElement, HTMLBodyElement, HTMLHtmlElement,
    HTMLTitleElement, HTMLScriptElement, HTMLFrameSetElement, HTMLTemplateElement,
    HTMLDetailsElement, HTMLFieldSetElement, HTMLMapElement, HTMLMetaElement,
    HTMLOutputElement, HTMLParamElement, HTMLSlotElement,
    HTMLQuoteElement, HTMLTimeElement, HTMLBRElement, HTMLModElement,
    HTMLTableElement, HTMLTableCaptionElement, HTMLTableColElement, HTMLTableSectionElement,
    HTMLTableRowElement, HTMLTableCellElement, HTMLHeadingElement, HTMLHRElement,
    HTMLPreElement, HTMLUListElement, HTMLOListElement, HTMLLIElement, HTMLDListElement,
    HTMLMarqueeElement, HTMLFontElement, HTMLDirectoryElement, HTMLLabelElement,
    HTMLLegendElement, HTMLOptGroupElement, HTMLDataListElement, HTMLProgressElement,
    HTMLMeterElement, HTMLDialogElement, HTMLMenuElement, HTMLDataElement,
    HTMLVideoElement, HTMLAudioElement, HTMLTrackElement,
    SVGElement, SVGSVGElement, SVGGraphicsElement, SVGPathElement, MathMLElement, DOMStringMap,
    CanvasRenderingContext2D, ImageData, Path2D, DOMException, TreeWalker,
    MutationObserver, IntersectionObserver, ResizeObserver, Range, Sanitizer,
    FormData, XMLHttpRequest, DOMTokenList, URL, URLSearchParams, DOMParser, CSSStyleSheet, EventSource, Blob,
    createDataChannelPair() {
      const listeners = [[], []];
      function channel(i) {
        return {
          send(s) {
            const data = toUSV(s);
            queueMicrotask(() => {
              for (const fn of listeners[1 - i]) fn({ data });
            });
          },
          addEventListener(type, fn) {
            if (type === "message" && typeof fn === "function") listeners[i].push(fn);
          },
        };
      }
      return Promise.resolve([channel(0), channel(1)]);
    },
    awaitMessage(channel) {
      return new Promise((resolve) => {
        channel.addEventListener("message", (ev) => resolve(ev.data));
      });
    },
    navigator: {
      userAgent: "Vector/0.0.1", language: "en-US", languages: ["en-US"], onLine: true, platform: "vector",
      sendBeacon() { return true; },
      registerProtocolHandler() {},
      unregisterProtocolHandler() {},
      serviceWorker: {
        register(url, opts) {
          const scope = (opts && opts.scope) || "";
          const rec = D("serviceWorkerRegister", String(url), String(scope), "") || {};
          const scriptURL = rec.scriptURL || String(url);
          function worker(state, surl) {
            if (!surl) return null;
            return {
              scriptURL: surl,
              state: state || "activated",
              postMessage(msg) {
                D("serviceWorkerPostMessage", rec.scope || scope, state || "", JSON.stringify(msg == null ? null : msg));
              },
              addEventListener() {},
              removeEventListener() {},
            };
          }
          const active = rec.active ? worker(rec.state || "activated", rec.scriptURL || scriptURL) : null;
          const waiting = rec.waiting ? worker("installed", rec.waitingURL || rec.scriptURL || scriptURL) : null;
          const registration = {
            scope: rec.scope || scope,
            installing: rec.installing ? worker("installing", rec.installingURL || scriptURL) : null,
            waiting,
            active,
            installFired: !!rec.installFired,
            activateFired: !!rec.activateFired,
            skipWaiting: !!rec.skipWaiting,
            claimed: !!rec.claimed,
          };
          if (rec.claimed && active) {
            navigator.serviceWorker.controller = active;
            const ev = { type: "controllerchange", target: navigator.serviceWorker };
            const fns = navigator.serviceWorker._controllerFns || [];
            fns.forEach((fn) => { try { fn(ev); } catch (e) {} });
          }
          navigator.serviceWorker._ready = Promise.resolve(registration);
          return Promise.resolve(registration);
        },
        controller: null,
        onmessage: null,
        get ready() { return this._ready || Promise.resolve({ active: null }); },
        addEventListener(type, fn) {
          if (type === "controllerchange" && typeof fn === "function") {
            this._controllerFns = this._controllerFns || [];
            this._controllerFns.push(fn);
          }
          if (type === "message" && typeof fn === "function") {
            this._messageFns = this._messageFns || [];
            this._messageFns.push(fn);
          }
        },
        removeEventListener(type, fn) {
          if (type === "controllerchange" && this._controllerFns) {
            this._controllerFns = this._controllerFns.filter((f) => f !== fn);
          }
        },
      },
    },
    screen: { width: D("innerWidth"), height: D("innerHeight"), colorDepth: 24 },
    devicePixelRatio: 1,
    get innerWidth() { return D("innerWidth"); },
    get innerHeight() { return D("innerHeight"); },
    get scrollX() { return D("scrollX") || 0; },
    get scrollY() { return D("scrollY") || 0; },
    get pageXOffset() { return this.scrollX; },
    get pageYOffset() { return this.scrollY; },
    getComputedStyle(el, pseudo) {
      const h = handleOf(el);
      return new Proxy({}, {
        get(_, p) {
          if (p === "getPropertyValue") return (n) => D("computed", h, String(n)) || "";
          if (typeof p === "string") {
            if (p === "cssFloat") p = "float";
            const name = p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
            return D("computed", h, name) || "";
          }
        },
      });
    },
    matchMedia(q) {
      q = String(q);
      const evalQ = () => {
        const width = D("innerWidth") || 0;
        const height = D("innerHeight") || 0;
        const inner = q.trim().replace(/^\(/, "").replace(/\)$/, "");
        const parts = inner.split(/\s+and\s+/i);
        return parts.every((raw) => {
          const p = String(raw).trim().replace(/^\(/, "").replace(/\)$/, "");
          const min = p.match(/min-width:\s*(\d+)px/);
          if (min) return width >= Number(min[1]);
          const max = p.match(/max-width:\s*(\d+)px/);
          if (max) return width <= Number(max[1]);
          const minH = p.match(/min-height:\s*(\d+)px/);
          if (minH) return height >= Number(minH[1]);
          const maxH = p.match(/max-height:\s*(\d+)px/);
          if (maxH) return height <= Number(maxH[1]);
          if (/orientation:\s*landscape/i.test(p)) return width >= height;
          if (/orientation:\s*portrait/i.test(p)) return height > width;
          if (/prefers-reduced-motion:\s*reduce/i.test(p)) return false;
          if (/prefers-reduced-motion:\s*no-preference/i.test(p)) return true;
          if (/prefers-color-scheme:\s*dark/i.test(p)) return false;
          if (/prefers-color-scheme:\s*light/i.test(p)) return true;
          return false;
        });
      };
      const ls = [];
      return {
        media: q,
        get matches() { return evalQ(); },
        addListener(fn) { if (typeof fn === "function") ls.push(fn); },
        removeListener(fn) { const i = ls.indexOf(fn); if (i >= 0) ls.splice(i, 1); },
        addEventListener(t, fn) { if (t === "change") this.addListener(fn); },
        removeEventListener(t, fn) { if (t === "change") this.removeListener(fn); },
        dispatchEvent(ev) { ls.forEach((fn) => fn(ev || this)); return true; },
      };
    },
    getSelection() { return documentSelection; },
    alert(m) { __ve.dom("scriptDialog", "alert", String(m), ""); },
    confirm(m) { return !!__ve.dom("scriptDialog", "confirm", String(m), ""); },
    prompt(m, d) { const r = __ve.dom("scriptDialog", "prompt", String(m), d == null ? "" : String(d)); return r == null ? null : String(r); },
    open(url) { return blankWindow(url); },
    close() {},
    focus() {},
    blur() {},
    scrollTo(x, y) { if (typeof x === "object") { y = x.top; x = x.left; } document.documentElement.scrollTop = y || 0; document.documentElement.scrollLeft = x || 0; },
    scroll(x, y) { window.scrollTo(x, y); },
    scrollBy(x, y) {
      const dx = typeof x === "object" ? (x.left || 0) : (x || 0);
      const dy = typeof x === "object" ? (x.top || 0) : (y || 0);
      window.scrollTo((document.documentElement.scrollLeft || 0) + dx, (document.documentElement.scrollTop || 0) + dy);
    },
    fetch: fetchImpl,
    postMessage(data, targetOrigin) { deliverMessage(globalThis, data, targetOrigin, globalThis); },
    AbortController,
    AbortSignal: function AbortSignal() {},
    indexedDB: {
      open(name, version) {
        const dbName = String(name);
        const meta = D("idbOpen", dbName, version == null ? 0 : Number(version)) || { version: 1, upgrade: true, oldVersion: 0 };
        const req = { result: null, error: null, onsuccess: null, onupgradeneeded: null, onerror: null };
        const storeApi = (storeName, txId) => ({
          name: storeName,
          createIndex(name, keyPath, options) {
            const kp = Array.isArray(keyPath) ? JSON.stringify(keyPath) : String(keyPath);
            D("idbCreateIndex", dbName, String(storeName), String(name), kp, options && options.unique ? "1" : "0");
            return { name: String(name), keyPath, unique: !!(options && options.unique) };
          },
          put(value, key) {
            const res = D("idbPut", dbName, String(storeName), String(key), JSON.stringify(value), txId || 0);
            const r = { result: key, error: null, onsuccess: null, onerror: null };
            if (res && res.error) {
              r.error = { name: res.error };
              queueMicrotask(() => { if (r.onerror) r.onerror({ target: r }); });
            } else {
              queueMicrotask(() => { if (r.onsuccess) r.onsuccess({ target: r }); });
            }
            return r;
          },
          get(key) {
            const raw = D("idbGet", dbName, String(storeName), String(key), txId || 0);
            const r = { result: raw == null ? undefined : JSON.parse(raw), onsuccess: null };
            queueMicrotask(() => { if (r.onsuccess) r.onsuccess({ target: r }); });
            return r;
          },
          delete(key) {
            D("idbDelete", dbName, String(storeName), String(key), txId || 0);
            const r = { result: undefined, onsuccess: null };
            queueMicrotask(() => { if (r.onsuccess) r.onsuccess({ target: r }); });
            return r;
          },
          index(name) {
            const indexName = String(name);
            return {
              get(value) {
                const raw = D("idbIndexGet", dbName, String(storeName), indexName, String(value));
                const r = { result: raw == null ? undefined : JSON.parse(raw), onsuccess: null };
                queueMicrotask(() => { if (r.onsuccess) r.onsuccess({ target: r }); });
                return r;
              },
            };
          },
          openCursor() {
            let after = "";
            const req = { result: null, onsuccess: null };
            const advance = () => {
              const raw = D("idbCursorNext", dbName, String(storeName), after);
              if (raw == null) {
                req.result = null;
                if (req.onsuccess) req.onsuccess({ target: req });
                return;
              }
              const row = JSON.parse(raw);
              after = String(row.key);
              req.result = {
                key: row.key,
                value: JSON.parse(row.value),
                continue() { queueMicrotask(advance); },
              };
              if (req.onsuccess) req.onsuccess({ target: req });
            };
            queueMicrotask(advance);
            return req;
          },
        });
        const db = {
          name: dbName,
          version: meta.version,
          objectStoreNames: {
            _list() {
              const raw = D("idbStoreNames", dbName);
              return Array.isArray(raw) ? raw.map(String) : [];
            },
            contains(n) { return this._list().includes(String(n)); },
            get length() { return this._list().length; },
          },
          createObjectStore(store) { D("idbCreateStore", dbName, String(store)); return storeApi(store, 0); },
          transaction(store) {
            const storeName = Array.isArray(store) ? store[0] : store;
            const txId = Number(D("idbBegin", dbName, String(storeName))) || 0;
            const tx = {
              error: null,
              _aborted: false,
              _done: false,
              abort() {
                if (this._done) return;
                this._aborted = true;
                this._done = true;
                D("idbAbort", txId);
                if (typeof this.onabort === "function") {
                  queueMicrotask(() => this.onabort({ target: this }));
                }
              },
              objectStore() { return storeApi(storeName, txId); },
              oncomplete: null,
              onabort: null,
              onerror: null,
            };
            queueMicrotask(() => {
              if (tx._aborted) return;
              tx._done = true;
              D("idbCommit", txId);
              if (typeof tx.oncomplete === "function") tx.oncomplete({ target: tx });
            });
            return tx;
          },
          close() { D("idbClear", dbName); },
        };
        queueMicrotask(() => {
          req.result = db;
          if (meta.upgrade && req.onupgradeneeded) {
            req.onupgradeneeded({ target: req, oldVersion: meta.oldVersion, newVersion: meta.version });
          }
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
      deleteDatabase(name) { D("idbClear", String(name)); return { onsuccess: null }; },
    },
    Worker: function Worker(src) {
      this._id = D("workerCreate", String(src));
      this.onmessage = null;
      this.onerror = null;
      this._terminated = false;
      this.postMessage = (m) => {
        if (this._terminated) return;
        const reply = D("workerPost", this._id, JSON.stringify(m));
        if (reply == null) return;
        let data = reply;
        if (typeof reply === "string") {
          try { data = JSON.parse(reply); } catch (e) { data = reply; }
        }
        if (typeof this.onmessage === "function") this.onmessage({ data: data });
      };
      this.terminate = () => {
        this._terminated = true;
        D("workerTerminate", this._id);
      };
      this.addEventListener = function (type, fn) {
        if (type === "message" && typeof fn === "function") this.onmessage = fn;
      };
    },
    SharedWorker: function SharedWorker(src, name) {
      this.port = {
        onmessage: null,
        postMessage(m) {
          const reply = D("workerPost", D("workerCreate", String(src)), JSON.stringify(m == null ? null : m));
          if (reply == null) return;
          let data = reply;
          if (typeof reply === "string") {
            try { data = JSON.parse(reply); } catch (e) { data = reply; }
          }
          if (typeof this.onmessage === "function") this.onmessage({ data });
        },
        addEventListener(type, fn) {
          if (type === "message" && typeof fn === "function") this.onmessage = fn;
        },
        start() {},
      };
      this.onerror = null;
    },
    WebSocket: function WebSocket(url) {
      const raw = D("wsConnect", String(url));
      const parts = String(raw || "").split(":");
      this._id = Number(parts[1]) || 0;
      this.url = String(url);
      this.readyState = Number(parts[2] || parts[1] || 3);
      this.protocol = "";
      this.bufferedAmount = 0;
      this.extensions = "";
      this.binaryType = "blob";
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.onclose = null;
      const ls = { open: [], message: [], error: [], close: [] };
      const fire = (type, ev) => {
        (ls[type] || []).forEach((fn) => fn(ev));
        const h = this["on" + type];
        if (typeof h === "function") h.call(this, ev);
      };
      this.addEventListener = function (type, fn) {
        if (typeof fn === "function" && ls[type]) ls[type].push(fn);
      };
      this.removeEventListener = function (type, fn) {
        if (!ls[type]) return;
        ls[type] = ls[type].filter((f) => f !== fn);
      };
      this.send = function (data) {
        if (this.readyState !== 1) throw new DOMException("WebSocket is not open", "InvalidStateError");
        try { D("wsSend", this._id, String(data)); }
        catch (e) { throw new DOMException(String(e && e.message || e), "NotSupportedError"); }
      };
      this.close = function () {
        D("wsClose", this._id);
        this.readyState = 3;
        fire("close", { type: "close", code: 1000, wasClean: true });
      };
      this._poll = function () {
        const msgs = D("wsPoll", this._id) || [];
        for (const m of msgs) fire("message", { type: "message", data: m });
      };
      queueMicrotask(() => {
        if (this.readyState === 1) fire("open", { type: "open" });
        else if (this.readyState === 3) fire("error", { type: "error" });
      });
    },
    CSS: {
      escape(s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => "\\" + c); },
      supports(a, b) {
        const q = b == null ? String(a) : "(" + a + ": " + b + ")";
        return D("cssSupports", q) === true;
      },
    },
    Image: HTMLImageElement,
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4, SHOW_COMMENT: 128, SHOW_ALL: 0xFFFFFFFF },
    MutationRecord: function () {},
  };
  const windowTarget = new EventTarget();
  globalThis.addEventListener = function (type, fn, opts) {
    const r = EventTarget.prototype.addEventListener.call(windowTarget, type, fn, opts);
    // HTML Window `load` does not retro-fire. Official Speedometer Complex-DOM
    // registers `$on(window, "load", setView)` after readyState is already
    // `complete` (the id/upgrade scan used to run first and consume the
    // deadline). Queue the listener so Controller._activeRoute still binds.
    if (String(type) === "load" && D("readyState") === "complete") {
      const call = typeof fn === "function" ? fn
        : (fn && typeof fn.handleEvent === "function") ? function (ev) { fn.handleEvent(ev); }
        : null;
      if (call) {
        try {
          queueMicrotask(() => {
            try { call.call(globalThis, new Event("load")); } catch (e) {}
          });
        } catch (e) {}
      }
    }
    return r;
  };
  globalThis.removeEventListener = function (type, fn, opts) {
    return EventTarget.prototype.removeEventListener.call(windowTarget, type, fn, opts);
  };
  globalThis.dispatchEvent = function (ev) {
    const type = ev && ev.type;
    const r = EventTarget.prototype.dispatchEvent.call(windowTarget, ev);
    const prop = type ? globalThis["on" + type] : null;
    if (typeof prop === "function") {
      try { prop.call(globalThis, ev); } catch (e) { __ve.log("error", String(e)); }
    }
    return r;
  };
  globalThis.__veFireWindowLoad = () => {
    try { window.dispatchEvent(new Event("load")); } catch (e) {}
  };
  globalThis.__veUpgradeTree = () => {
    try { customElements.upgrade(globalThis.document || document); } catch (e) {}
  };
  globalThis.__veDocumentEvents = () => {
    // Do not walk the tree here. A large document's id/upgrade scan can
    // exceed SCRIPT_DEADLINE and abort this function before `load` fires
    // (official Speedometer Complex-DOM). Rust calls expose/upgrade separately.
    const doc = globalThis.document || document;
    try {
      D("setReadyState", "interactive");
      doc.dispatchEvent(new Event("readystatechange"));
    } catch (e) {}
    try { doc.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true })); } catch (e) {}
    try { window.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true })); } catch (e) {}
    try {
      D("setReadyState", "complete");
      doc.dispatchEvent(new Event("readystatechange"));
    } catch (e) {}
    try {
      const failed = doc.getElementsByTagName("script");
      for (let i = 0; i < failed.length; i++) {
        const s = failed[i];
        if (s.__veRan || !s.getAttribute("src")) continue;
        const src = s.getAttribute("onerror");
        if (!src) continue;
        try { new Function("event", src).call(s, new Event("error")); } catch (e) {}
      }
    } catch (e) {}
    try { window.dispatchEvent(new Event("load")); } catch (e) {}
    try {
      const t = __ve.now();
      const paints = [
        { name: "first-paint", entryType: "paint", startTime: t, duration: 0 },
        { name: "first-contentful-paint", entryType: "paint", startTime: t, duration: 0 },
      ];
      performance.getEntriesByType = (type) => type === "paint" ? paints.slice() : [];
    } catch (e) {}
  };
  globalThis.PerformancePaintTiming = function PerformancePaintTiming() {};
  windowProps.window = globalThis;
  windowProps.self = globalThis;
  windowProps.top = globalThis;
  windowProps.parent = globalThis;
  windowProps.postMessage = function (data, targetOrigin) {
    deliverMessage(globalThis, data, targetOrigin, globalThis);
  };

  class DOMImplementation {
    constructor() { throw new TypeError("Illegal constructor"); }
  }
  class Window extends EventTarget {
    constructor() {
      super();
      throw new TypeError("Illegal constructor");
    }
  }
  class XMLDocument extends Document {}
  class BarProp {
    constructor() { throw new TypeError("Illegal constructor"); }
    get visible() { return true; }
  }
  const barProp = { visible: true };
  windowProps.Window = Window;
  windowProps.XMLDocument = XMLDocument;
  windowProps.BarProp = BarProp;
  windowProps.DOMImplementation = DOMImplementation;
  windowProps.locationbar = barProp;
  windowProps.menubar = barProp;
  windowProps.personalbar = barProp;
  windowProps.scrollbars = barProp;
  windowProps.statusbar = barProp;
  windowProps.toolbar = barProp;
  windowProps.clientInformation = windowProps.navigator;
  windowProps.closed = false;
  windowProps.status = "";
  windowProps.name = "";
  windowProps.originAgentCluster = false;
  windowProps.frameElement = null;
  windowProps.opener = null;
  windowProps.navigation = { currentEntry: null, entries() { return []; } };
  windowProps.length = 0;
  windowProps.alert = function alert(m) { D("scriptDialog", "alert", m == null ? "" : String(m), ""); };
  windowProps.confirm = function confirm(m) { return !!D("scriptDialog", "confirm", m == null ? "" : String(m), ""); };
  windowProps.prompt = function prompt(m, d) { return D("scriptDialog", "prompt", m == null ? "" : String(m), d == null ? "" : String(d)); };
  windowProps.print = function print() {};
  windowProps.focus = function focus() {};
  windowProps.blur = function blur() {};
  windowProps.stop = function stop() {};
  windowProps.close = function close() { globalThis.closed = true; };
  windowProps.open = function open(url, target, features) {
    if (url == null || url === "") return globalThis;
    return globalThis;
  };

  try { Object.setPrototypeOf(globalThis, Window.prototype); } catch (e) {}

  function exposeCtor(name, ctor) {
    if (typeof ctor !== "function") return;
    try {
      Object.defineProperty(globalThis, name, {
        value: ctor,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    } catch (e) {
      try { globalThis[name] = ctor; } catch (e2) {}
    }
  }
  for (const [k, v] of Object.entries(windowProps)) {
    if (typeof v === "function" && v !== windowProps.postMessage && k[0] >= "A" && k[0] <= "Z") {
      exposeCtor(k, v);
    } else {
      try { globalThis[k] = v; } catch {}
    }
  }
  exposeCtor("Window", Window);
  exposeCtor("XMLDocument", XMLDocument);
  exposeCtor("BarProp", BarProp);
  exposeCtor("DOMImplementation", DOMImplementation);
  exposeCtor("Location", Location);
  exposeCtor("History", History);

  const eventHandlerNames = [
    "onabort","onauxclick","onbeforeinput","onbeforematch","onbeforetoggle","onblur",
    "oncancel","oncanplay","oncanplaythrough","onchange","onclick","onclose","oncommand",
    "oncontextlost","oncontextmenu","oncontextrestored","oncopy","oncuechange","oncut",
    "ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart",
    "ondrop","ondurationchange","onemptied","onended","onerror","onfocus","onformdata",
    "oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata",
    "onloadedmetadata","onloadstart","onmousedown","onmouseenter","onmouseleave",
    "onmousemove","onmouseout","onmouseover","onmouseup","onpaste","onpause","onplay",
    "onplaying","onprogress","onratechange","onreset","onresize","onscroll","onscrollend",
    "onsecuritypolicyviolation","onseeked","onseeking","onselect","onslotchange","onstalled",
    "onsubmit","onsuspend","ontimeupdate","ontoggle","onvolumechange","onwaiting",
    "onwebkitanimationend","onwebkitanimationiteration","onwebkitanimationstart",
    "onwebkittransitionend","onwheel",
  ];
  const windowHandlerNames = [
    "onafterprint","onbeforeprint","onbeforeunload","onhashchange","onlanguagechange",
    "onmessage","onmessageerror","onoffline","ononline","onpagehide","onpagereveal",
    "onpageshow","onpageswap","onpopstate","onrejectionhandled","onstorage",
    "onunhandledrejection","onunload",
  ];
  const handlerStore = new WeakMap();
  function defineHandlers(obj, names, enumerable) {
    for (const name of names) {
      if (Object.getOwnPropertyDescriptor(obj, name)) continue;
      const get = function () {
        const m = handlerStore.get(this);
        return (m && m[name]) || null;
      };
      const set = function (v) {
        let m = handlerStore.get(this);
        if (!m) { m = Object.create(null); handlerStore.set(this, m); }
        const prev = m[name];
        const next = typeof v === "function" ? v : null;
        if (!prev && next) handlerPropCount++;
        if (prev && !next) handlerPropCount--;
        m[name] = next;
      };
      Object.defineProperty(get, "name", { value: "get " + name, configurable: true });
      Object.defineProperty(set, "name", { value: "set " + name, configurable: true });
      Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: !!enumerable,
        get,
        set,
      });
    }
  }
  defineHandlers(Document.prototype, eventHandlerNames, true);
  defineHandlers(HTMLElement.prototype, eventHandlerNames, true);
  defineHandlers(globalThis, eventHandlerNames, true);
  defineHandlers(globalThis, windowHandlerNames, true);

  function brandWrap(ctor) {
    const proto = ctor.prototype;
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === "constructor") continue;
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      if (!desc) continue;
      if (typeof desc.get === "function") {
        const g = desc.get;
        const s = desc.set;
        const getter = function () {
          if (!(this instanceof ctor)) {
            if (name === "onreadystatechange") return undefined;
            throw new TypeError("Illegal invocation");
          }
          return g.call(this);
        };
        Object.defineProperty(getter, "name", { value: "get " + name, configurable: true });
        Object.defineProperty(getter, "length", { value: 0, configurable: true });
        desc.get = getter;
        if (typeof s === "function") {
          const setter = function (v) {
            if (!(this instanceof ctor)) {
              if (name === "onreadystatechange") return undefined;
              throw new TypeError("Illegal invocation");
            }
            return s.call(this, v);
          };
          Object.defineProperty(setter, "name", { value: "set " + name, configurable: true });
          desc.set = setter;
        }
        desc.enumerable = true;
      } else if (typeof desc.value === "function") {
        const fn = desc.value;
        const wrapped = function (...a) {
          if (!(this instanceof ctor)) throw new TypeError("Illegal invocation");
          return fn.apply(this, a);
        };
        Object.defineProperty(wrapped, "length", { value: fn.length, configurable: true });
        Object.defineProperty(wrapped, "name", { value: fn.name, configurable: true });
        desc.value = wrapped;
        desc.enumerable = true;
      }
      try { Object.defineProperty(proto, name, desc); } catch (e) {}
    }
  }
  brandWrap(Document);
  brandWrap(Node);
  brandWrap(Element);
  brandWrap(HTMLElement);
  brandWrap(EventTarget);
  for (const name of ["parseHTMLUnsafe", "parseHTML"]) {
    const fn = Document[name];
    if (typeof fn === "function") {
      try {
        Object.defineProperty(Document, name, {
          value: fn,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } catch (e) {}
    }
  }

  function windowThis(t) {
    if (t === undefined || t === null) return globalThis;
    if (t === globalThis) return t;
    throw new TypeError("Illegal invocation");
  }
  function ownAccessor(obj, name, getter, setter, unforgeable, replaceable) {
    const get = function () { return getter.call(windowThis(this)); };
    Object.defineProperty(get, "name", { value: "get " + name, configurable: true });
    Object.defineProperty(get, "length", { value: 0, configurable: true });
    const desc = {
      configurable: !unforgeable,
      enumerable: true,
      get,
    };
    if (setter) {
      const set = function (v) { return setter.call(windowThis(this), v); };
      Object.defineProperty(set, "name", { value: "set " + name, configurable: true });
      desc.set = set;
    } else if (replaceable) {
      const set = function (v) {
        windowThis(this);
        try {
          Object.defineProperty(obj, name, { value: v, writable: true, enumerable: true, configurable: true });
        } catch (e) {}
      };
      Object.defineProperty(set, "name", { value: "set " + name, configurable: true });
      desc.set = set;
    }
    try { delete obj[name]; } catch (e) {}
    try { Object.defineProperty(obj, name, desc); } catch (e) {}
  }
  function windowOp(fn, length) {
    const wrapped = function (...args) {
      windowThis(this);
      return fn.apply(globalThis, args);
    };
    Object.defineProperty(wrapped, "length", { value: length, configurable: true });
    Object.defineProperty(wrapped, "name", { value: fn.name, configurable: true });
    return wrapped;
  }
  const WindowProperties = Object.create(EventTarget.prototype);
  Object.defineProperty(WindowProperties, Symbol.toStringTag, { value: "WindowProperties", configurable: true });
  try { Object.setPrototypeOf(Window.prototype, WindowProperties); } catch (e) {}
  try {
    Object.defineProperty(Window.prototype, Symbol.toStringTag, { value: "Window", configurable: true });
  } catch (e) {}
  const barInstance = Object.create(BarProp.prototype);
  Object.defineProperty(barInstance, "visible", { configurable: true, enumerable: true, get() { return true; } });
  ownAccessor(globalThis, "window", () => globalThis, undefined, true);
  ownAccessor(globalThis, "self", () => globalThis, (v) => { try { Object.defineProperty(globalThis, "self", { value: v, writable: true, enumerable: true, configurable: true }); } catch (e) {} }, false, true);
  ownAccessor(globalThis, "document", () => document, undefined, true);
  ownAccessor(globalThis, "location", () => location, (v) => { try { location.href = String(v); } catch (e) {} }, true);
  ownAccessor(globalThis, "top", () => globalThis, undefined, true);
  ownAccessor(globalThis, "history", () => history);
  ownAccessor(globalThis, "customElements", () => windowProps.customElements);
  ownAccessor(globalThis, "navigator", () => windowProps.navigator);
  ownAccessor(globalThis, "clientInformation", () => windowProps.navigator, undefined, false, true);
  ownAccessor(globalThis, "name", () => globalThis.__veName || "", (v) => { globalThis.__veName = String(v); });
  ownAccessor(globalThis, "status", () => globalThis.__veStatus || "", (v) => { globalThis.__veStatus = String(v); });
  ownAccessor(globalThis, "opener", () => globalThis.__veOpener == null ? null : globalThis.__veOpener, (v) => { globalThis.__veOpener = v; });
  function indexChildWindows() {
    const iframes = document.querySelectorAll("iframe,frame");
    for (let i = 0; i < iframes.length; i++) {
      const el = iframes[i];
      try {
        Object.defineProperty(globalThis, String(i), {
          configurable: true,
          enumerable: true,
          get() { return frameWindow(el); },
        });
      } catch (e) {}
    }
    return iframes.length;
  }
  ownAccessor(globalThis, "frames", () => { indexChildWindows(); return globalThis; }, undefined, false, true);
  ownAccessor(globalThis, "length", () => indexChildWindows(), undefined, false, true);
  ownAccessor(globalThis, "parent", () => globalThis, undefined, false, true);
  ownAccessor(globalThis, "frameElement", () => null);
  ownAccessor(globalThis, "closed", () => !!globalThis.__veClosed);
  ownAccessor(globalThis, "originAgentCluster", () => false);
  ownAccessor(globalThis, "locationbar", () => barInstance, undefined, false, true);
  ownAccessor(globalThis, "menubar", () => barInstance, undefined, false, true);
  ownAccessor(globalThis, "personalbar", () => barInstance, undefined, false, true);
  ownAccessor(globalThis, "scrollbars", () => barInstance, undefined, false, true);
  ownAccessor(globalThis, "statusbar", () => barInstance, undefined, false, true);
  ownAccessor(globalThis, "toolbar", () => barInstance, undefined, false, true);
  ownAccessor(globalThis, "navigation", () => windowProps.navigation, undefined, false, true);
  ownAccessor(globalThis, "external", () => (globalThis.__veExternal || (globalThis.__veExternal = { AddSearchProvider() {}, IsSearchProviderInstalled() { return 0; } })), undefined, false, true);
  globalThis.close = windowOp(function close() { globalThis.__veClosed = true; }, 0);
  globalThis.stop = windowOp(function stop() {}, 0);
  globalThis.focus = windowOp(function focus() {}, 0);
  globalThis.blur = windowOp(function blur() {}, 0);
  globalThis.open = windowOp(function open(url, target, features) {
    if (url == null || url === "") return globalThis;
    return blankWindow(url);
  }, 0);
  globalThis.alert = windowOp(function alert(m) { D("scriptDialog", "alert", m == null ? "" : String(m), ""); }, 0);
  globalThis.confirm = windowOp(function confirm(m) { return !!D("scriptDialog", "confirm", m == null ? "" : String(m), ""); }, 0);
  globalThis.prompt = windowOp(function prompt(m, dft) { return D("scriptDialog", "prompt", m == null ? "" : String(m), dft == null ? "" : String(dft)); }, 0);
  globalThis.print = windowOp(function print() {}, 0);
  globalThis.postMessage = windowOp(function postMessage(data, targetOrigin) {
    if (arguments.length < 1) throw new TypeError("Not enough arguments");
    deliverMessage(globalThis, data, targetOrigin, globalThis);
  }, 1);
  globalThis.captureEvents = windowOp(function captureEvents() {}, 0);
  globalThis.releaseEvents = windowOp(function releaseEvents() {}, 0);

  const origSetProto = Object.setPrototypeOf;
  const origReflectSet = Reflect.setPrototypeOf;
  const protoSetter = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__") && Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
  function isImmutableProto(obj) {
    return obj === globalThis || obj === Window.prototype;
  }
  Object.setPrototypeOf = function (obj, proto) {
    if (isImmutableProto(obj) && proto !== Object.getPrototypeOf(obj)) throw new TypeError("Immutable prototype");
    return origSetProto(obj, proto);
  };
  Reflect.setPrototypeOf = function (obj, proto) {
    if (isImmutableProto(obj) && proto !== Object.getPrototypeOf(obj)) return false;
    return origReflectSet(obj, proto);
  };
  if (protoSetter) {
    Object.defineProperty(Object.prototype, "__proto__", {
      get() { return Object.getPrototypeOf(this); },
      set(v) {
        if (isImmutableProto(this) && v !== Object.getPrototypeOf(this)) throw new TypeError("Immutable prototype");
        return protoSetter.call(this, v);
      },
      enumerable: false,
      configurable: true,
    });
  }
  for (const name of ["addEventListener", "removeEventListener", "dispatchEvent", "postMessage", "alert", "confirm", "prompt", "print", "focus", "blur", "stop", "close", "open", "getComputedStyle", "matchMedia", "requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "queueMicrotask", "btoa", "atob", "fetch", "getSelection"]) {
    const fn = globalThis[name];
    if (typeof fn === "function") {
      try {
        Object.defineProperty(globalThis, name, { value: fn, writable: true, enumerable: true, configurable: true });
      } catch (e) {}
    }
  }

  try {
    Object.defineProperty(globalThis, "origin", {
      configurable: true,
      enumerable: true,
      get() { return D("locationGet", "origin"); },
    });
    Object.defineProperty(globalThis, "scrollX", { configurable: true, enumerable: true, get() { return D("scrollX") || 0; } });
    Object.defineProperty(globalThis, "scrollY", { configurable: true, enumerable: true, get() { return D("scrollY") || 0; } });
    Object.defineProperty(globalThis, "pageXOffset", { configurable: true, enumerable: true, get() { return D("scrollX") || 0; } });
    Object.defineProperty(globalThis, "pageYOffset", { configurable: true, enumerable: true, get() { return D("scrollY") || 0; } });
    const testdriverImpl = {
      get_computed_label(el) { return Promise.resolve(getComputedAriaLabel(el)); },
      get_computed_role(el) {
        try { return Promise.resolve((el && el.getAttribute && el.getAttribute("role")) || ""); }
        catch (e) { return Promise.resolve(""); }
      },
      send_keys(el, keys) {
        return Promise.resolve().then(() => {
          if (!el) return;
          try { el.focus(); } catch (e) {}
          const s = String(keys);
          try { el.value = (el.value || "") + s; } catch (e) {}
          try { el.dispatchEvent(new InputEvent("input", { bubbles: true, data: s })); } catch (e) {}
        });
      },
    };
    let testdriverCur = Object.assign({}, testdriverImpl);
    Object.defineProperty(globalThis, "test_driver_internal", {
      configurable: true,
      enumerable: true,
      get() { return testdriverCur; },
      set(v) {
        testdriverCur = v && typeof v === "object" ? v : {};
        if (typeof testdriverCur.get_computed_label !== "function") {
          testdriverCur.get_computed_label = testdriverImpl.get_computed_label;
        }
        if (typeof testdriverCur.get_computed_role !== "function") {
          testdriverCur.get_computed_role = testdriverImpl.get_computed_role;
        }
        testdriverCur.send_keys = testdriverImpl.send_keys;
      },
    });
  } catch {}

  globalThis.__veDispatch = (handle, type, init) => {
    const node = wrap(handle);
    if (!node) return false;
    init = init || {};
    const keyish = type === "keydown" || type === "keypress" || type === "keyup";
    const ev = type.indexOf("drag") === 0
      ? new DragEvent(type, init)
      : (type === "click" || type === "mousedown" || type === "mouseup" || type === "mousemove"
        ? new MouseEvent(type, init)
        : (type === "beforeinput" || type === "input"
          ? new InputEvent(type, init)
          : (keyish ? new KeyboardEvent(type, init) : new Event(type, init))));
    trustedEvents.add(ev);
    node.dispatchEvent(ev);
    return ev.defaultPrevented;
  };
  function fetchText(url, headers) {
    if (!url) return null;
    try {
      const headerJson = headers ? JSON.stringify(headers) : "";
      const id = D("fetchStart", String(url), "GET", headerJson);
      let r = D("fetchPoll", id);
      for (let i = 0; i < 64 && r && r.pending; i++) {
        D("fetchPump");
        r = D("fetchPoll", id);
      }
      if (!r || r.error || (r.status != null && r.status >= 400)) return null;
      return r.body == null ? "" : String(r.body);
    } catch (e) {
      return null;
    }
  }
  function rewriteModule(source) {
    return String(source).replace(
      /^\s*import\s+(?:(?:[\w*{}\s,]+)\s+from\s+)?["']([^"']+)["']\s*;?/gm,
      (m, url) => {
        const body = fetchText(url);
        return body == null ? "/* import failed */" : body + ";\n";
      },
    );
  }
  function fireLoad(el) {
    if (!el || el.__veCancelled) return;
    const ev = new Event("load");
    trustedEvents.add(ev);
    try { el.dispatchEvent(ev); } catch (e) {}
    if (typeof el.onload === "function") {
      try { el.onload(ev); } catch (e) {}
    }
  }
  function fireError(el, err) {
    if (!el) return;
    const ev = new Event("error");
    trustedEvents.add(ev);
    try { el.dispatchEvent(ev); } catch (e) {}
    if (typeof el.onerror === "function") {
      try { el.onerror(ev); } catch (e2) {}
    }
    if (typeof window.onerror === "function") {
      try { window.onerror(String(err && err.message || err), "", 0, 0, err); } catch (e3) {}
    }
  }
  globalThis.__veRewriteModule = (source) => rewriteModule(source);
  globalThis.__veEvalScript = (handle, source, isModule) => {
    const el = wrap(handle);
    const prev = currentScriptNode;
    currentScriptNode = isModule ? null : el;
    try {
      let src = source == null ? "" : String(source);
      if (isModule) src = rewriteModule(src);
      if (src) (0, eval)(src);
    } catch (e) {
      fireError(el, e);
      throw e;
    } finally {
      currentScriptNode = prev;
    }
  };
  const pendingResources = [];
  function queueResource(run, isBlocking, el) {
    pendingResources.push({ run, isBlocking, el });
  }
  function cancelPendingFor(el) {
    if (!el) return;
    el.__veCancelled = true;
    for (let i = pendingResources.length - 1; i >= 0; i--) {
      if (pendingResources[i].el === el) pendingResources.splice(i, 1);
    }
  }
  globalThis.__veCancelPending = cancelPendingFor;
  globalThis.__veHasPendingBlocking = () =>
    pendingResources.some((p) => (typeof p.isBlocking === "function" ? p.isBlocking() : !!p.isBlocking));
  globalThis.__veFlushPendingResources = (blockingOnly) => {
    const keep = [];
    const todo = pendingResources.splice(0, pendingResources.length);
    for (const p of todo) {
      if (p.el && (p.el.__veCancelled || (p.el.isConnected === false && p.el.ownerDocument))) {
        continue;
      }
      const block = typeof p.isBlocking === "function" ? p.isBlocking() : !!p.isBlocking;
      if (blockingOnly && !block) {
        keep.push(p);
        continue;
      }
      if (block && p.el && p.el.isConnected) {
        keep.push(p);
        continue;
      }
      try { p.run(); } catch (e) { __ve.log("error", String(e)); }
    }
    pendingResources.push(...keep);
  };
  function extractImports(css) {
    const out = [];
    const re = /@import\s+(?:url\()?["']([^"']+)["']\)?/gi;
    let m;
    while ((m = re.exec(String(css)))) out.push(m[1]);
    return out;
  }
  function applyFetchedCss(css) {
    let text = String(css || "");
    for (const href of extractImports(text)) {
      const imported = fetchText(href);
      if (imported) text = imported + "\n" + text;
    }
    text = text.replace(/@import\s+(?:url\()?["'][^"']+["']\)?[^;]*;/gi, "");
    D("addAuthorSheet", text);
  }
  function runInsertedScript(el, forceSync) {
    if (!el || el.__veRan) return;
    const type = ((el.getAttribute && el.getAttribute("type")) || "").trim().toLowerCase();
    const isModule = type === "module";
    const run = () => {
      if (el.__veRan || el.__veCancelled) return;
      if (!forceSync && !el.isConnected) {
        el.__veRan = true;
        return;
      }
      const src = el.getAttribute && el.getAttribute("src");
      let source = "";
      if (src) {
        source = fetchText(src);
        if (source == null) {
          el.__veRan = true;
          fireError(el, new Error("script fetch failed"));
          return;
        }
      } else {
        source = el.textContent || el.text || "";
      }
      el.__veRan = true;
      try {
        __veEvalScript(el.__h, source, isModule);
        fireLoad(el);
      } catch (e) {}
    };
    const blocking = () => !!(el.blocking && el.blocking.contains && el.blocking.contains("render"));
    const src = el.getAttribute && el.getAttribute("src");
    if (forceSync || (!src && !isModule)) {
      run();
      return;
    }
    queueResource(run, blocking, el);
  }
  function prepareInsertedNode(n) {
    if (!n || n.nodeType !== 1) return;
    const tag = (n.localName || "").toLowerCase();
    if (tag === "script") {
      if (!n._scriptCreated) return;
      runInsertedScript(n, false);
    } else if (tag === "link") {
      const rel = (n.getAttribute("rel") || "").toLowerCase();
      if (rel.split(/\s+/).includes("stylesheet") && n.getAttribute("href")) {
        const href = n.getAttribute("href");
        const run = () => {
          if (n.__veRan || n.__veCancelled) return;
          if (!n.isConnected) { n.__veRan = true; return; }
          n.__veRan = true;
          const css = fetchText(href);
          if (css != null) applyFetchedCss(css);
          fireLoad(n);
        };
        queueResource(run, () => !!(n.blocking && n.blocking.contains && n.blocking.contains("render")), n);
      }
    } else if (tag === "style") {
      const css = n.textContent || "";
      if (/@import/i.test(css)) {
        const run = () => {
          if (n.__veRan || n.__veCancelled) return;
          if (!n.isConnected) { n.__veRan = true; return; }
          n.__veRan = true;
          applyFetchedCss(css);
          fireLoad(n);
        };
        queueResource(run, () => !!(n.blocking && n.blocking.contains && n.blocking.contains("render")), n);
      }
    }
  }
  const patchFrozen = new WeakMap();
  function freezePatch(tpl) {
    let rec = patchFrozen.get(tpl);
    if (!rec) {
      rec = {
        hasFor: tpl.hasAttribute("for"),
        forValue: tpl.getAttribute("for"),
        buffer: tpl.hasAttribute("buffer"),
        sanitize: tpl.hasAttribute("sanitize") ? String(tpl.getAttribute("sanitize") || "") : null,
        src: tpl.getAttribute("src"),
        nonce: tpl.getAttribute("nonce") || "",
        integrity: tpl.getAttribute("integrity") || "",
        referrerPolicy: tpl.getAttribute("referrerpolicy") || "",
      };
      patchFrozen.set(tpl, rec);
    }
    return rec;
  }
  function piAttrs(data) {
    const out = Object.create(null);
    const re = /([^\s=]+)=(?:"([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = re.exec(String(data || "")))) out[m[1]] = m[2] != null ? m[2] : m[3];
    return out;
  }
  function walkNodes(root, fn) {
    if (!root) return;
    fn(root);
    const kids = root.childNodes;
    if (kids) {
      for (let i = 0; i < kids.length; i++) walkNodes(kids[i], fn);
    }
    if (root.nodeType === 1 && root.localName === "template" && root.content) {
      walkNodes(root.content, fn);
    }
  }
  function walkLight(root, fn) {
    if (!root) return;
    fn(root);
    const kids = root.childNodes;
    if (!kids) return;
    for (let i = 0; i < kids.length; i++) walkLight(kids[i], fn);
  }
  function templateInContent(n) {
    let p = n && n.parentNode;
    while (p) {
      if (p.nodeType === 11) {
        // ShadowRoot is also nodeType 11, but its descendants are live and
        // must upgrade. Only a non-shadow DocumentFragment (template.content
        // or an imported clone still sitting in a fragment) is inert.
        if (p instanceof ShadowRoot) return false;
        return true;
      }
      p = p.parentNode;
    }
    return false;
  }
  function findNamedPatch(name, scope) {
    let start = null;
    let marker = null;
    const roots = [];
    if (scope) roots.push(scope);
    if (document.documentElement) roots.push(document.documentElement);
    if (document.body && roots.indexOf(document.body) < 0) roots.push(document.body);
    for (const root of roots) {
      walkLight(root, (n) => {
        if (start || (marker && n === marker)) return;
        if (!n || n.nodeType !== 7) return;
        const attrs = piAttrs(n.data);
        if (n.target === "start" && attrs.name === name) start = n;
        else if (n.target === "marker" && attrs.name === name && !marker) marker = n;
      });
      if (start || marker) break;
    }
    const open = start || marker;
    if (!open) return null;
    let end = null;
    if (open.target === "start") {
      let n = open.nextSibling;
      while (n) {
        if (n.nodeType === 7 && n.target === "end") {
          end = n;
          break;
        }
        n = n.nextSibling;
      }
    }
    return { open, end, parent: open.parentNode };
  }
  function sanitizeOn(rec) {
    if (rec.sanitize == null) return false;
    const v = String(rec.sanitize);
    return v === "" || v.toLowerCase() === "sanitize";
  }
  function isCustomElementNode(node) {
    if (!node || node.nodeType !== 1) return false;
    const tag = (node.localName || "").toLowerCase();
    if (tag.includes("-")) return true;
    return !!(node.getAttribute && node.getAttribute("is"));
  }
  function isUnsafeNode(node) {
    if (!node || node.nodeType !== 1) return false;
    const tag = (node.localName || "").toLowerCase();
    if (tag === "script") return true;
    if (tag === "template") return true;
    return isCustomElementNode(node);
  }
  function stripUnsafe(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.localName === "template" && node.content) {
      const ckids = node.content.childNodes ? Array.from(node.content.childNodes) : [];
      for (const k of ckids) {
        if (isUnsafeNode(k)) {
          if (k.parentNode) k.parentNode.removeChild(k);
        } else {
          stripUnsafe(k);
        }
      }
    }
    const kids = node.childNodes ? Array.from(node.childNodes) : [];
    for (const k of kids) {
      if (isUnsafeNode(k)) {
        if (k.parentNode) k.parentNode.removeChild(k);
      } else {
        stripUnsafe(k);
      }
    }
  }
  function nodeVisible(n) {
    if (!n) return true;
    try {
      return D("parserVisible", n.__h) !== false;
    } catch (e) {
      return true;
    }
  }
  function hiddenTemplateContent(tpl) {
    const frag = tpl && tpl.content;
    if (!frag) return false;
    try {
      const real = Number(D("realChildCount", frag.__h) || 0);
      let vis = 0;
      let n = frag.firstChild;
      while (n) { vis++; n = n.nextSibling; }
      return real > vis;
    } catch (e) {
      return false;
    }
  }
  function templateFinished(tpl) {
    if (!tpl || tpl.__veStreamAborted) return false;
    if (hiddenTemplateContent(tpl)) return false;
    const next = tpl.nextSibling;
    if (next) return nodeVisible(next);
    return true;
  }
  function takeVisibleTemplateChildren(tpl, all) {
    const out = [];
    const takeFrom = (parent) => {
      if (!parent) return;
      if (all) {
        const handles = D("realChildren", parent.__h) || [];
        for (let i = 0; i < handles.length; i++) {
          const n = wrap(handles[i]);
          if (!n) continue;
          if (n.parentNode) n.parentNode.removeChild(n);
          else if (parent.removeChild) parent.removeChild(n);
          out.push(n);
        }
        return;
      }
      let n = parent.firstChild;
      while (n) {
        const next = n.nextSibling;
        if (!nodeVisible(n)) break;
        out.push(parent.removeChild(n));
        n = next;
      }
    };
    takeFrom(tpl.content);
    takeFrom(tpl);
    return out;
  }
  function takeTemplateChildren(tpl) {
    return takeVisibleTemplateChildren(tpl, true);
  }
  function clearPatchRange(found) {
    if (!found || !found.parent) return;
    const replaceThroughEnd = !!(found.end || (found.open.target || "").toLowerCase() === "start");
    if (!replaceThroughEnd) return;
    let n = found.open.nextSibling;
    while (n && n !== found.end) {
      const next = n.nextSibling;
      if (n.parentNode) n.parentNode.removeChild(n);
      n = next;
    }
  }
  let observerHold = 0;
  function flushObserversNow() {
    if (observerHold > 0) return;
    try {
      if (typeof globalThis.__veFlushObservers === "function") globalThis.__veFlushObservers();
    } catch (e) {}
  }
  function notifySubtreeObservers(parent, added) {
    if (observerHold > 0) return;
    for (const o of observers) {
      if (!o._on || typeof o._inObservedTree !== "function") continue;
      for (const opt of o._opts || []) {
        if (!opt.childList) continue;
        let hit = o._inObservedTree(parent, opt);
        if (!hit) {
          for (const n of added) {
            if (o._inObservedTree(n, opt)) { hit = true; break; }
          }
        }
        if (!hit) continue;
        try {
          o._cb([{
            type: "childList",
            target: parent,
            addedNodes: added,
            removedNodes: [],
            attributeName: null,
            oldValue: null,
            previousSibling: null,
            nextSibling: null,
          }], o);
        } catch (e) { __ve.log("error", String(e)); }
      }
    }
  }
  function withHeldObservers(fn) {
    observerHold++;
    try {
      return fn();
    } finally {
      observerHold--;
      flushObserversNow();
    }
  }
  function insertPatchNodes(parent, before, nodes, rec, runScripts) {
    const safe = sanitizeOn(rec);
    const staged = [];
    for (const node of nodes) {
      if (safe && isUnsafeNode(node)) continue;
      if (safe) stripUnsafe(node);
      staged.push(node);
    }
    const place = (node) => {
      if (before && before.parentNode === parent) parent.insertBefore(node, before);
      else parent.appendChild(node);
      flushObserversNow();
      notifySubtreeObservers(parent, [node]);
    };
    const runOne = (node) => {
      if (node.nodeType === 1 && (node.localName || "").toLowerCase() === "template" && node.hasAttribute("for")) {
        applyTemplateFor(node);
        return;
      }
      if (runScripts && !safe && node.nodeType === 1 && (node.localName || "").toLowerCase() === "script") {
        node._scriptCreated = true;
        const src = D("textContent", node.__h) || node.textContent || node.text || "";
        node.__veRan = true;
        try { __veEvalScript(node.__h, src, false); } catch (e) { try { (0, eval)(src); } catch (e2) {} }
      }
    };
    if (rec.buffer) {
      for (const node of staged) place(node);
      for (const node of staged) runOne(node);
      return;
    }
    for (const node of staged) {
      place(node);
      runOne(node);
    }
  }
  function srcQuery(href) {
    try {
      const q = String(href || "").split("?")[1] || "";
      if (!q) return Object.create(null);
      const params = Object.create(null);
      for (const part of q.split("&")) {
        const eq = part.indexOf("=");
        const k = decodeURIComponent(eq < 0 ? part : part.slice(0, eq));
        const v = decodeURIComponent((eq < 0 ? "" : part.slice(eq + 1)).replace(/\+/g, " "));
        if (k) params[k] = v;
      }
      return params;
    } catch (e) {
      return Object.create(null);
    }
  }
  function srcChunks(href) {
    const params = srcQuery(href);
    if (params.chunk1 == null && params.chunk2 == null) return null;
    return {
      chunk1: params.chunk1 || "",
      chunk2: params.chunk2 || "",
      delay: Number(params.delay) || 0,
    };
  }
  function sha256b64(text) {
    const encoded = unescape(encodeURIComponent(String(text == null ? "" : text)));
    const bytes = [];
    for (let i = 0; i < encoded.length; i++) bytes.push(encoded.charCodeAt(i) & 255);
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    bytes.push(0, 0, 0, 0, (bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Array(64);
    for (let i = 0; i < bytes.length; i += 64) {
      for (let t = 0; t < 16; t++) {
        const o = i + t * 4;
        w[t] = ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
      }
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }
    const out = [h0, h1, h2, h3, h4, h5, h6, h7];
    const raw = [];
    for (const word of out) {
      raw.push((word >>> 24) & 255, (word >>> 16) & 255, (word >>> 8) & 255, word & 255);
    }
    let bin = "";
    for (const b of raw) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  function sriMatches(body, integrity) {
    const spec = String(integrity || "").trim();
    if (!spec) return true;
    const parts = spec.split(/\s+/);
    for (const part of parts) {
      const dash = part.indexOf("-");
      if (dash < 0) continue;
      const alg = part.slice(0, dash).toLowerCase();
      const want = part.slice(dash + 1);
      if (alg === "sha256") return sha256b64(body) === want;
    }
    return false;
  }
  function documentCsp() {
    let csp = "";
    try {
      const metas = document.querySelectorAll("meta");
      for (let i = 0; i < metas.length; i++) {
        const equiv = String(metas[i].httpEquiv || metas[i].getAttribute("http-equiv") || "").toLowerCase();
        if (equiv === "content-security-policy") {
          csp += " " + String(metas[i].content || metas[i].getAttribute("content") || "");
        }
      }
    } catch (e) {}
    return csp;
  }
  function srcResolved(href) {
    try { return new URL(String(href || ""), location.href).href; } catch (e) { return String(href || ""); }
  }
  function srcIsCrossOrigin(href) {
    try {
      const a = new URL(srcResolved(href));
      return a.origin !== location.origin;
    } catch (e) {
      return /web-platform\.test/i.test(String(href || ""));
    }
  }
  function srcReferrer(rec) {
    const p = String(rec && rec.referrerPolicy || "").toLowerCase();
    if (p === "no-referrer") return "";
    try {
      if (p === "origin" || p === "strict-origin") return location.origin + "/";
      return location.href;
    } catch (e) {
      return "";
    }
  }
  function srcPolicyAllows(tpl, rec, href) {
    const csp = documentCsp();
    const nonce = rec.nonce || (tpl.getAttribute && tpl.getAttribute("nonce")) || "";
    const cross = srcIsCrossOrigin(href);
    if (csp) {
      const scriptSrcMatch = csp.match(/script-src([^;]*)/i);
      const scriptSrc = scriptSrcMatch ? scriptSrcMatch[1] : "";
      if (scriptSrc) {
        const nonceMatch = scriptSrc.match(/'nonce-([^']+)'/i);
        if (nonceMatch) {
          if (nonce !== nonceMatch[1]) return false;
        } else if (cross && /'self'/.test(scriptSrc) && !/(^|[\s])\*(?:[\s]|$)/.test(scriptSrc.replace(/'[^']*'/g, " "))) {
          return false;
        }
      }
    }
    if (cross) {
      const cors = srcQuery(href).cors;
      if (cors != null && cors !== "1") return false;
    }
    const integrity = rec.integrity || (tpl.getAttribute && tpl.getAttribute("integrity")) || "";
    if (integrity) {
      const chunks = srcChunks(href);
      const body = chunks ? String(chunks.chunk1 || "") + String(chunks.chunk2 || "") : (fetchText(href) || "");
      if (!sriMatches(body, integrity)) return false;
    }
    return true;
  }
  function applyTemplateFor(tpl) {
    if (!tpl || tpl.__vePatched || tpl.__veStreamAborted) return false;
    const rec = freezePatch(tpl);
    if (!rec.hasFor) return false;
    const name = rec.forValue;
    const inPlace = name == null || name === "";
    // src is a fetch loader, not a parser-stream cursor. A following
    // script becoming visible must not cancel the external stream.
    if (!rec.buffer && !rec.src) {
      if (tpl.hasAttribute && tpl.getAttribute("data-ve-stream-aborted") != null) {
        tpl.__veStreamAborted = true;
        return false;
      }
      let realNext = null;
      try { realNext = wrap(D("realNextSibling", tpl.__h)); } catch (e) { realNext = tpl.nextSibling; }
      if (tpl.__veStreamEnd === undefined) tpl.__veStreamEnd = realNext;
      if (tpl.__veStreamEnd !== undefined && realNext !== tpl.__veStreamEnd) {
        tpl.__veStreamAborted = true;
        try { tpl.setAttribute("data-ve-stream-aborted", ""); } catch (e) {}
        tpl.__vePatched = true;
        return false;
      }
    }
    if (rec.src) {
      const href = rec.src;
      if (!srcPolicyAllows(tpl, rec, href)) {
        tpl.__vePatched = true;
        return false;
      }
      const chunks = srcChunks(href);
      let srcKey = null;
      try {
        const q = String(href).split("?")[1] || "";
        for (const part of q.split("&")) {
          const eq = part.indexOf("=");
          const k = decodeURIComponent(eq < 0 ? part : part.slice(0, eq));
          if (k === "key") srcKey = decodeURIComponent((eq < 0 ? "" : part.slice(eq + 1)).replace(/\+/g, " "));
        }
      } catch (e) {}
      if (chunks && rec.buffer && srcKey) {
        const base = String(href).split("?")[0];
        const mark = () => {
          try { fetchText(base + "?action=mark_chunk1&key=" + encodeURIComponent(srcKey)); } catch (e) {}
        };
        const poll = () => {
          if (tpl.__vePatched || tpl.__veStreamAborted) return;
          let go = false;
          try { go = fetchText(base + "?action=check_continue&key=" + encodeURIComponent(srcKey)) === "go"; } catch (e) {}
          if (go) applyHtmlPatch(tpl, (chunks.chunk1 || "") + (chunks.chunk2 || ""), rec, inPlace, false);
          else try { setTimeout(poll, 20); } catch (e) {}
        };
        queueResource(mark, false, tpl);
        try { setTimeout(poll, 20); } catch (e) { queueResource(poll, false, tpl); }
        return false;
      }
      if (chunks && !rec.buffer) {
        const run1 = () => {
          if (tpl.__vePatched || tpl.__veStreamAborted || tpl.__veSrc1) return;
          if (applyHtmlPatch(tpl, chunks.chunk1, rec, inPlace, true)) {
            tpl.__veSrc1 = true;
            flushObserversNow();
          }
        };
        const run2 = () => {
          if (tpl.__vePatched || tpl.__veStreamAborted || tpl.__veSrc2) return;
          if (!tpl.__veSrc1) return;
          if (applyHtmlPatch(tpl, chunks.chunk2, rec, inPlace, false)) {
            tpl.__veSrc2 = true;
            flushObserversNow();
          }
        };
        if (!tpl.__veSrcScheduled) {
          tpl.__veSrcScheduled = true;
          queueResource(run1, false, tpl);
          try { setTimeout(run1, 0); } catch (e) {}
          try { setTimeout(run2, chunks.delay || 1); } catch (e) { queueResource(run2, false, tpl); }
        }
        return false;
      }
      const run = () => {
        if (tpl.__vePatched || tpl.__veStreamAborted) return;
        const referrer = srcReferrer(rec);
        const headers = referrer ? { Referer: referrer } : (String(rec.referrerPolicy || "").toLowerCase() === "no-referrer" ? { Referer: "" } : null);
        let html = fetchText(href, headers);
        if ((html == null || html === "") && chunks) html = (chunks.chunk1 || "") + (chunks.chunk2 || "");
        if (html == null) return;
        applyHtmlPatch(tpl, html, rec, inPlace, false);
      };
      queueResource(run, false, tpl);
      return false;
    }
    return commitTemplateFor(tpl, rec, inPlace);
  }
  function applyHtmlPatch(tpl, html, rec, inPlace, keepOpen) {
    const box = document.createElement("template");
    box.innerHTML = html;
    const nodes = takeTemplateChildren(box);
    rec = rec || freezePatch(tpl);
    if (inPlace) {
      const parent = tpl.parentNode;
      if (!parent) return false;
      insertPatchNodes(parent, tpl, nodes, rec, true);
      if (!keepOpen) {
        tpl.__vePatched = true;
        if (tpl.parentNode) tpl.parentNode.removeChild(tpl);
      }
      return true;
    }
    const found = findNamedPatch(rec.forValue, tpl.parentNode || document);
    if (!found || !found.parent) return false;
    const wasStarted = !!tpl.__veStreamStarted;
    if (!wasStarted) {
      clearPatchRange(found);
      tpl.__veStreamStarted = true;
    }
    const endLive = found.end && found.end.parentNode === found.parent ? found.end : null;
    const before = endLive || (wasStarted && !endLive ? null : found.open.nextSibling);
    insertPatchNodes(found.parent, before, nodes, rec, true);
    if (!keepOpen) {
      if (found.open.parentNode) found.open.parentNode.removeChild(found.open);
      if (found.end && found.end.parentNode) found.end.parentNode.removeChild(found.end);
      tpl.__vePatched = true;
      if (tpl.parentNode) tpl.parentNode.removeChild(tpl);
    }
    return true;
  }
  function commitTemplateFor(tpl, rec, inPlace) {
    if (tpl.__veStreamAborted) return false;
    const finished = templateFinished(tpl);
    if (rec.buffer && finished) {
      return withHeldObservers(() => commitTemplateForUnheld(tpl, rec, inPlace));
    }
    return commitTemplateForUnheld(tpl, rec, inPlace);
  }
  function commitTemplateForUnheld(tpl, rec, inPlace) {
    if (tpl.__veStreamAborted) return false;
    const finished = templateFinished(tpl);
    const all = !!(rec.buffer && finished);
    if (rec.buffer && !finished) return false;
    const nodes = takeVisibleTemplateChildren(tpl, all || finished);
    if (inPlace) {
      const parent = tpl.parentNode;
      if (!parent) {
        for (const node of nodes) tpl.content.appendChild(node);
        return false;
      }
      insertPatchNodes(parent, tpl, nodes, rec, true);
      let realNext = null;
      try { realNext = wrap(D("realNextSibling", tpl.__h)); } catch (e) { realNext = tpl.nextSibling; }
      if (!rec.buffer && tpl.__veStreamEnd !== undefined && realNext !== tpl.__veStreamEnd) {
        tpl.__veStreamAborted = true;
        try { tpl.setAttribute("data-ve-stream-aborted", ""); } catch (e) {}
        tpl.__vePatched = true;
        return false;
      }
      if (tpl.__veStreamAborted) return false;
      if (finished) {
        tpl.__vePatched = true;
        if (tpl.parentNode) tpl.parentNode.removeChild(tpl);
        return true;
      }
      return nodes.length > 0;
    }
    const found = findNamedPatch(rec.forValue, tpl.parentNode || document);
    if (!found || !found.parent) {
      for (const node of nodes) tpl.content.appendChild(node);
      return false;
    }
    const wasStarted = !!tpl.__veStreamStarted;
    if (!wasStarted) {
      clearPatchRange(found);
      tpl.__veStreamStarted = true;
    }
    const endLive = found.end && found.end.parentNode === found.parent ? found.end : null;
    const before = endLive || (wasStarted && !endLive ? null : found.open.nextSibling);
    insertPatchNodes(found.parent, before, nodes, rec, true);
    if (finished) {
      if (found.open.parentNode) found.open.parentNode.removeChild(found.open);
      if (found.end && found.end.parentNode) found.end.parentNode.removeChild(found.end);
      tpl.__vePatched = true;
      if (tpl.parentNode) tpl.parentNode.removeChild(tpl);
      return true;
    }
    return nodes.length > 0;
  }
  function collectPartialTemplates(root, seen) {
    walkLight(root, (n) => {
      if (n && n.nodeType === 1 && (n.localName || "").toLowerCase() === "template" && n.hasAttribute("for") && !n.__vePatched && !n.__veStreamAborted && !templateInContent(n)) {
        seen.push(n);
      }
    });
  }
  function applyAllPartialUpdates() {
    const seen = [];
    collectPartialTemplates(document.documentElement || document, seen);
    try {
      const iframes = document.querySelectorAll("iframe,frame");
      for (let i = 0; i < iframes.length; i++) {
        const frameDoc = iframes[i].contentDocument;
        if (!frameDoc) continue;
        collectPartialTemplates(frameDoc.body || frameDoc.documentElement || frameDoc, seen);
      }
    } catch (e) {}
    let applied = 0;
    for (const tpl of seen) {
      if (applyTemplateFor(tpl)) applied++;
    }
    return applied;
  }
  function streamHtmlInto(host) {
    let acc = "";
    function consume(final) {
      if (!acc) return;
      if (!final && acc.indexOf("</template>") < 0) return;
      const html = acc;
      acc = "";
      const box = document.createElement("template");
      box.innerHTML = html;
      const kids = takeTemplateChildren(box);
      for (const k of kids) host.appendChild(k);
      applyAllPartialUpdates();
    }
    return {
      getWriter() {
        return {
          write(chunk) {
            acc += chunk == null ? "" : String(chunk);
            consume(false);
            return Promise.resolve();
          },
          close() {
            consume(true);
            return Promise.resolve();
          },
          abort() {
            acc = "";
            return Promise.resolve();
          },
        };
      },
    };
  }
  globalThis.__veApplyPartialUpdates = applyAllPartialUpdates;
  globalThis.__veScriptRan = (h) => {
    const el = wrap(h);
    return !!(el && el.__veRan);
  };
  globalThis.__veRunFrameScripts = () => {
    const list = document.getElementsByTagName("iframe");
    for (let i = 0; i < list.length; i++) {
      const iframe = list[i];
      const raw = D("frameDocumentRaw", iframe.__h);
      if (!raw) continue;
      const doc = wrap(raw);
      if (!doc) continue;
      const prevDoc = globalThis.document;
      try {
        globalThis.document = doc;
        applyAllPartialUpdates();
      } catch (e) {}
      globalThis.document = prevDoc;
      const scriptHandles = D("frameScriptHandles", iframe.__h) || [];
      const scripts = scriptHandles.length
        ? scriptHandles.map((h) => wrap(h)).filter(Boolean)
        : (doc.querySelectorAll ? doc.querySelectorAll("script") : []);
      const w = frameWindow(iframe);
      const srcAttr = (iframe.getAttribute && iframe.getAttribute("src")) || "";
      if (/^javascript:/i.test(srcAttr)) {
        let code = srcAttr.replace(/^javascript:/i, "");
        try { code = decodeURIComponent(code); } catch (e) {}
        try {
          const fn = new Function("window", "self", "parent", "top", "document", code);
          fn(w, w, globalThis, globalThis, doc);
        } catch (e) {}
      }
      for (let j = 0; j < scripts.length; j++) {
        const s = scripts[j];
        if (s.__veRan) continue;
        const src = s.getAttribute && s.getAttribute("src");
        let body = src ? fetchText(src) : (s.textContent || "");
        if (!body) continue;
        s.__veRan = true;
        try {
          const fn = new Function("window", "self", "document", "top", "parent", body);
          fn(w, w, doc, globalThis, globalThis);
        } catch (e) {
          __ve.log("error", String(e && e.message || e));
        }
      }
    }
  };
  globalThis.__veSetCurrentScript = (handle) => {
    currentScriptNode = handle == null ? null : wrap(handle);
  };
  globalThis.__veSetValue = (handle, v) => {
    const node = wrap(handle);
    if (!node) return false;
    node.value = v;
    return true;
  };
  globalThis.__veFlushObservers = () => {
    for (const o of observers) {
      if (!o._on) continue;
      const recs = o._drain();
      if (recs.length) {
        try { o._cb(recs, o); }
        catch (e) { __ve.log("error", String(e)); }
      }
    }
  };
  globalThis.__veResetDocument = () => {
    nodes.clear();
    currentScriptNode = null;
    const d = wrap(D("documentNode"));
    browsingDocument = d;
    globalThis.document = d;
    try { globalThis.window.document = d; } catch {}
  };

  if (typeof globalThis.test !== "function") {
    globalThis.test = function (fn, name) {
      const t = { step_func: (f) => f, done() {}, add_cleanup() {} };
      try {
        fn.call(t, t);
        (window.__tests = window.__tests || []).push([String(name || "test"), true, ""]);
      } catch (e) {
        (window.__tests = window.__tests || []).push([String(name || "test"), false, String((e && e.message) || e)]);
      }
    };
    globalThis.async_test = globalThis.test;
    globalThis.assert_true = function (c, m) { if (!c) throw new Error(m || "assert_true"); };
    globalThis.assert_false = function (c, m) { if (c) throw new Error(m || "assert_false"); };
    globalThis.assert_equals = function (a, b, m) { if (a !== b) throw new Error(m || "assert_equals"); };
    globalThis.assert_not_equals = function (a, b, m) { if (a === b) throw new Error(m || "assert_not_equals"); };
    globalThis.assert_idl_attribute = function (obj, name, m) {
      if (obj == null || !(name in obj)) throw new Error(m || ("missing idl " + name));
    };
  }
})();
