(() => {
  const D = (op, ...a) => __ve.dom(op, ...a);
  const nodes = new Map();
  const registry = new Map();
  const listeners = new Map();
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
      this.timeStamp = __ve.now();
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
      list.get(type).push({ fn: call, orig: fn, cap, once });
    }
    removeEventListener(type, fn, opts) {
      const cap = !!(opts && (opts === true || opts.capture));
      const arr = store(this).get(type);
      if (!arr) return;
      const i = arr.findIndex((x) => (x.orig === fn || x.fn === fn) && x.cap === cap);
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

  let documentNamedTraps = {
    get(t, p, recv) { return Reflect.get(t, p, recv); },
    has(t, p) { return Reflect.has(t, p); },
    ownKeys(t) { return Reflect.ownKeys(t); },
    getOwnPropertyDescriptor(t, p) { return Reflect.getOwnPropertyDescriptor(t, p); },
  };
  let exposeWindowName = function () {};
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
    }
    if (info.t === 1) {
      upgradeOne(n);
      try { if (n.id) exposeWindowName(n.id); } catch (e) {}
    }
    return n;
  }
  function upgradeTree(n) {
    if (!n || n.nodeType !== 1) return;
    upgradeOne(n);
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
  function upgradeOne(n) {
    if (!n || n.nodeType !== 1) return;
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
      return (Array.isArray(v) && typeof (v && v.item) === "function") || v instanceof LiveNodeList;
    },
  });
  class LiveNodeList {
    constructor(fetch) {
      this._fetch = fetch;
      return new Proxy(this, {
        get(t, p, recv) {
          if (p === "length") return t._fetch().length;
          if (p === "item") return (i) => t._fetch()[i | 0] || null;
          if (p === "forEach") return (fn, self) => t._fetch().forEach(fn, self);
          if (typeof p === "symbol" || p === "_fetch") return Reflect.get(t, p, recv);
          if (/^\d+$/.test(String(p))) return t._fetch()[Number(p)];
          return Reflect.get(t, p, recv);
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
      if (typeof p === "symbol" || p === "_fetch") return Reflect.get(t, p, recv);
      if (p === "length") return t._fetch().length;
      if (p === "item" || p === "namedItem") return Reflect.get(t, p, recv);
      const s = String(p);
      if (/^\d+$/.test(s)) return t._fetch()[Number(s)];
      if (s) {
        const named = HTMLCollection.prototype.namedItem.call(t, s);
        if (named) return named;
      }
      return Reflect.get(t, p, recv);
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
      if (typeof p === "symbol") return Object.getOwnPropertyDescriptor(t, p);
      const s = String(p);
      if (/^\d+$/.test(s)) {
        const v = t._fetch()[Number(s)];
        if (v === undefined) return undefined;
        return { configurable: true, enumerable: true, writable: false, value: v };
      }
      const named = s ? HTMLCollection.prototype.namedItem.call(t, s) : null;
      if (named) return { configurable: true, enumerable: false, writable: false, value: named };
      return Object.getOwnPropertyDescriptor(HTMLCollection.prototype, p) || Object.getOwnPropertyDescriptor(t, p);
    },
    has(t, p) {
      return htmlCollectionTraps.getOwnPropertyDescriptor(t, p) !== undefined;
    },
  };

  class HTMLCollection {
    constructor(fetch) {
      this._fetch = fetch;
      return new Proxy(this, htmlCollectionTraps);
    }
    item(i) { return this._fetch()[i | 0] || null; }
    namedItem(name) {
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
      map.set(name, new HTMLCollection(() => namedElementsOf(doc, name)));
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
  documentNamedTraps = {
    get(t, p, recv) {
      if (typeof p !== "string" || p === "__proto__") return Reflect.get(t, p, recv);
      if (Reflect.has(t, p)) return Reflect.get(t, p, recv);
      const named = namedItemValue(t, p);
      return named === undefined ? Reflect.get(t, p, recv) : named;
    },
    has(t, p) {
      if (Reflect.has(t, p)) return true;
      return typeof p === "string" && namedElementsOf(t, p).length > 0;
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
    get ownerDocument() { return this.nodeType === 9 ? null : (wrap(D("ownerDocument", this.__h)) || document); }
    appendChild(n) {
      if (n && n.nodeType === 11) {
        while (n.firstChild) this.appendChild(n.firstChild);
        return n;
      }
      D("appendChild", this.__h, handleOf(n));
      upgradeTree(n);
      return n;
    }
    insertBefore(n, ref) {
      if (n && n.nodeType === 11) {
        while (n.firstChild) this.insertBefore(n.firstChild, ref);
        return n;
      }
      D("insertBefore", this.__h, handleOf(n), handleOf(ref));
      upgradeTree(n);
      return n;
    }
    append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? document.createTextNode(n) : n); }
    prepend(...nodes) {
      const ref = this.firstChild;
      for (const n of nodes) this.insertBefore(typeof n === "string" ? document.createTextNode(n) : n, ref);
    }
    get baseURI() { return D("url") || ""; }
    removeChild(n) { D("removeChild", this.__h, handleOf(n)); return n; }
    replaceChild(n, old) { D("replaceChild", this.__h, handleOf(n), handleOf(old)); upgradeTree(n); return old; }
    cloneNode(deep) { return wrap(D("cloneNode", this.__h, !!deep)); }
    contains(n) { return !!D("contains", this.__h, handleOf(n)); }
    hasChildNodes() { return this.childNodes.length > 0; }
    replaceChildren(...args) {
      while (this.firstChild) this.removeChild(this.firstChild);
      for (const a of args) {
        if (a == null) continue;
        if (typeof a === "string") this.appendChild(document.createTextNode(a));
        else this.appendChild(a);
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
    getRootNode(opts) { return wrap(D("getRootNode", this.__h, !!(opts && opts.composed))) || this; }
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
    proto.remove = function () { D("remove", this.__h); };
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
    set innerHTML(v) { D("setInnerHTML", this.__h, String(v)); }
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
    toggleAttribute(n, force) {
      const omitted = arguments.length < 2 || force === undefined;
      return !!D("toggleAttribute", this.__h, String(n), omitted ? null : !!force);
    }
    get attributes() {
      const h = this.__h;
      const names = D("attrNames", h) || [];
      const map = [];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const attr = {
          name,
          localName: name,
          prefix: null,
          namespaceURI: null,
          ownerElement: this,
          get value() { return D("getAttr", h, name) || ""; },
          set value(v) { D("setAttr", h, name, String(v)); },
        };
        map.push(attr);
        map[name] = attr;
      }
      map.item = (i) => map[i] || null;
      map.getNamedItem = (n) => map[n] || null;
      map.length = names.length;
      return map;
    }
    getAttributeNS(ns, n) { return this.getAttribute(n); }
    setAttributeNS(ns, n, v) { this.setAttribute(n, v); }
    querySelector(s) { return wrap(D("querySelector", this.__h, String(s))); }
    querySelectorAll(s) { return list(D("querySelectorAll", this.__h, String(s))); }
    matches(s) { return !!D("matches", this.__h, String(s)); }
    webkitMatchesSelector(s) { return this.matches(s); }
    msMatchesSelector(s) { return this.matches(s); }
    closest(s) { return wrap(D("closest", this.__h, String(s))); }
    getElementsByTagName(n) { return new HTMLCollection(() => list(D("getElementsByTagName", this.__h, String(n)))); }
    getElementsByTagNameNS(ns, n) {
      return new HTMLCollection(() => {
        const all = list(D("getElementsByTagName", this.__h, String(n)));
        if (ns === "*") return all;
        const uri = ns == null ? "" : String(ns);
        return all.filter((el) => el.namespaceURI === uri);
      });
    }
    getElementsByClassName(n) { return list(D("getElementsByClassName", this.__h, String(n))); }
    attachShadow(init) { return wrap(D("attachShadow", this.__h, (init && init.mode) || "open")); }
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
      ["ariaAtomic", "aria-atomic"],
      ["ariaAutoComplete", "aria-autocomplete"],
      ["ariaBrailleLabel", "aria-braillelabel"],
      ["ariaBrailleRoleDescription", "aria-brailleroledescription"],
      ["ariaBusy", "aria-busy"],
      ["ariaChecked", "aria-checked"],
      ["ariaColCount", "aria-colcount"],
      ["ariaColIndex", "aria-colindex"],
      ["ariaColIndexText", "aria-colindextext"],
      ["ariaColSpan", "aria-colspan"],
      ["ariaCurrent", "aria-current"],
      ["ariaDescription", "aria-description"],
      ["ariaDisabled", "aria-disabled"],
      ["ariaExpanded", "aria-expanded"],
      ["ariaHasPopup", "aria-haspopup"],
      ["ariaHidden", "aria-hidden"],
      ["ariaInvalid", "aria-invalid"],
      ["ariaKeyShortcuts", "aria-keyshortcuts"],
      ["ariaLabel", "aria-label"],
      ["ariaLevel", "aria-level"],
      ["ariaLive", "aria-live"],
      ["ariaModal", "aria-modal"],
      ["ariaMultiLine", "aria-multiline"],
      ["ariaMultiSelectable", "aria-multiselectable"],
      ["ariaOrientation", "aria-orientation"],
      ["ariaPlaceholder", "aria-placeholder"],
      ["ariaPosInSet", "aria-posinset"],
      ["ariaPressed", "aria-pressed"],
      ["ariaReadOnly", "aria-readonly"],
      ["ariaRelevant", "aria-relevant"],
      ["ariaRequired", "aria-required"],
      ["ariaRoleDescription", "aria-roledescription"],
      ["ariaRowCount", "aria-rowcount"],
      ["ariaRowIndex", "aria-rowindex"],
      ["ariaRowIndexText", "aria-rowindextext"],
      ["ariaRowSpan", "aria-rowspan"],
      ["ariaSelected", "aria-selected"],
      ["ariaSetSize", "aria-setsize"],
      ["ariaSort", "aria-sort"],
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
      let el = null;
      if (root && root.nodeType === 9 && root.getElementById) el = root.getElementById(id);
      if (!el && root && root.getElementById) {
        try { el = root.getElementById(id); } catch (e) {}
      }
      if (!el && root && root.querySelector) {
        try {
          const esc = String(id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
          el = root.querySelector('[id="' + esc + '"]');
          if (!el && root.nodeType === 1 && root.id === id) el = root;
        } catch (e) {}
      }
      if (!el || !ariaInScope(reflected, el)) return null;
      return el;
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
      if (String(n).toLowerCase() === "id") exposeWindowName(String(v));
    };
    Element.prototype.removeAttribute = function (n) {
      origRemove.call(this, n);
      const js = attrToJs[String(n).toLowerCase()];
      if (js) delete ariaState(this)[js];
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
    set dir(v) {
      const s = String(v).toLowerCase();
      if (s === "ltr" || s === "rtl" || s === "auto") this.setAttribute("dir", s);
      else this.setAttribute("dir", "");
    }
    get title() { return this.getAttribute("title") || ""; }
    set title(v) { this.setAttribute("title", v); }
    click() {
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
    }
    focus() {
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
    set type(v) { this.setAttribute("type", v); }
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
      set(v) { this.setAttribute("name", v == null ? "" : String(v)); },
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
    get elements() { return this.querySelectorAll("input,select,textarea,button"); }
  }
  class HTMLAnchorElement extends HTMLElement {
    get href() {
      const s = this.getAttribute("href") || "";
      return s;
    }
    set href(v) {
      const s = toUSV(v);
      this.setAttribute("href", /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s) ? encodeURI(s) : s);
    }
    get ping() { return this.getAttribute("ping") || ""; }
    set ping(v) { this.setAttribute("ping", toUSV(v)); }
  }
  class HTMLLinkElement extends HTMLElement {
    get rel() { return this.getAttribute("rel") || ""; }
    set rel(v) { this.setAttribute("rel", v == null ? "" : String(v)); }
    get href() { return this.getAttribute("href") || ""; }
    set href(v) { this.setAttribute("href", v == null ? "" : toUSV(v)); }
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
    w.postMessage = function (data, targetOrigin) {
      deliverMessage(w, data, targetOrigin, globalThis);
    };
    iframe._cw = w;
    return w;
  }
  class HTMLIFrameElement extends HTMLElement {
    get name() { return this.getAttribute("name") || ""; }
    set name(v) { this.setAttribute("name", v == null ? "" : String(v)); }
    get src() { return this.getAttribute("src") || ""; }
    set src(v) { this.setAttribute("src", toUSV(v)); }
    get longDesc() { return this.getAttribute("longdesc") || ""; }
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
    get width() { return D("canvasWidth", this.__h) || 300; }
    set width(v) { D("canvasResize", this.__h, v | 0, this.height); }
    get height() { return D("canvasHeight", this.__h) || 150; }
    set height(v) { D("canvasResize", this.__h, this.width, v | 0); }
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
    get blocking() { return this._blockingTL || (this._blockingTL = new DOMTokenList(this.__h, "blocking", RENDER_TOKENS)); }
    set blocking(v) { this.blocking.value = v == null ? "" : String(v); }
  }
  class HTMLStyleElement extends HTMLElement {
    get blocking() { return this._blockingTL || (this._blockingTL = new DOMTokenList(this.__h, "blocking", RENDER_TOKENS)); }
    set blocking(v) { this.blocking.value = v == null ? "" : String(v); }
  }
  class HTMLFrameSetElement extends HTMLElement {}
  class HTMLTemplateElement extends HTMLElement {
    get content() { return wrap(D("templateContent", this.__h)); }
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
    link: HTMLLinkElement, style: HTMLStyleElement,
    embed: HTMLEmbedElement, object: HTMLObjectElement,
    div: HTMLDivElement, p: HTMLParagraphElement, span: HTMLSpanElement,
    head: HTMLHeadElement, body: HTMLBodyElement, html: HTMLHtmlElement,
    title: HTMLTitleElement, script: HTMLScriptElement, frameset: HTMLFrameSetElement,
    template: HTMLTemplateElement,
  };
  const SVG = {
    svg: SVGSVGElement, path: SVGPathElement, g: SVGGraphicsElement, circle: SVGGraphicsElement,
    rect: SVGGraphicsElement, line: SVGGraphicsElement, polyline: SVGGraphicsElement,
    polygon: SVGGraphicsElement, text: SVGGraphicsElement, defs: SVGElement, use: SVGGraphicsElement,
    symbol: SVGElement, clipPath: SVGElement, linearGradient: SVGElement, radialGradient: SVGElement,
    stop: SVGElement, title: SVGElement, desc: SVGElement, tspan: SVGGraphicsElement,
  };

  class Document extends Node {
    get onreadystatechange() { return this.__onrs || null; }
    set onreadystatechange(v) { this.__onrs = v; }
    get documentElement() { return wrap(D("documentElement", this.__h)); }
    get dir() {
      const de = this.documentElement;
      const v = ((de && de.getAttribute("dir")) || "").toLowerCase();
      return v === "ltr" || v === "rtl" || v === "auto" ? v : "";
    }
    set dir(v) {
      if (this.documentElement) this.documentElement.dir = v;
    }
    set dir(v) { if (this.documentElement) this.documentElement.setAttribute("dir", v); }
    get doctype() { return wrap(D("doctype", this.__h)); }
    get head() { return wrap(D("head", this.__h)); }
    set head(_) {}
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
      return new HTMLCollection(() => list(D("getElementsByTagName", this.__h, "form")));
    }
    get images() {
      return new HTMLCollection(() =>
        list(D("getElementsByTagName", this.__h, "img")).filter(
          (el) => el.namespaceURI === "http://www.w3.org/1999/xhtml",
        ),
      );
    }
    get links() {
      return new HTMLCollection(() => list(D("documentLinks", this.__h)));
    }
    get scripts() {
      return new HTMLCollection(() =>
        list(D("getElementsByTagName", this.__h, "script")).filter(
          (el) => el.namespaceURI === "http://www.w3.org/1999/xhtml",
        ),
      );
    }
    get embeds() {
      if (!this._embeds) {
        const doc = this;
        this._embeds = new HTMLCollection(() =>
          list(D("getElementsByTagName", doc.__h, "embed")).filter(
            (el) => el.namespaceURI === "http://www.w3.org/1999/xhtml",
          ),
        );
      }
      return this._embeds;
    }
    get plugins() { return this.embeds; }
    get implementation() {
      return {
        createHTMLDocument(title) {
          if (arguments.length === 0 || title === undefined) {
            return wrap(D("createHTMLDocument", null));
          }
          return wrap(D("createHTMLDocument", String(title)));
        },
        hasFeature() { return true; },
        createDocument(ns, qname, doctype) {
          return wrap(D(
            "createDocument",
            ns == null ? "" : String(ns),
            qname == null ? "" : String(qname),
            handleOf(doctype),
          ));
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
    get applets() { return this._applets || (this._applets = new HTMLCollection(() => [])); }
    get all() {
      if (this._all) return this._all;
      const col = new HTMLCollection(() => list(D("getElementsByTagName", this.__h, "*")));
      this._all = new Proxy(col, {
        get(t, p, recv) {
          if (typeof p === "string" && p !== "length" && !/^\d+$/.test(p)) {
            const named = HTMLCollection.prototype.namedItem.call(t, p);
            if (named && (named.localName || "").toLowerCase() === "applet") return undefined;
            if (named) return named;
          }
          const v = Reflect.get(t, p, recv);
          if (v && v.localName === "applet") return undefined;
          return v;
        },
      });
      return this._all;
    }
    get defaultView() { return this.__h === D("documentNode") ? window : null; }
    get activeElement() {
      const h = D("activeElement");
      return h ? wrap(h) : (this.body || this.documentElement);
    }
    get location() { return this.__h === D("documentNode") ? location : null; }
    get readyState() { return "complete"; }
    get hidden() { return false; }
    get visibilityState() { return "visible"; }
    createElement(name) { return wrap(D("createElement", String(name))); }
    createElementNS(ns, name) { return wrap(D("createElementNS", ns == null ? "" : String(ns), String(name))); }
    createTextNode(data) { return wrap(D("createTextNode", String(data))); }
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
    getElementsByTagName(n) { return new HTMLCollection(() => list(D("getElementsByTagName", this.__h, String(n)))); }
    getElementsByTagNameNS(ns, n) {
      return new HTMLCollection(() => {
        const all = list(D("getElementsByTagName", this.__h, String(n)));
        if (ns === "*") return all;
        const uri = ns == null ? "" : String(ns);
        return all.filter((el) => el.namespaceURI === uri);
      });
    }
    getElementsByClassName(n) { return new HTMLCollection(() => list(D("getElementsByClassName", this.__h, String(n)))); }
    getElementsByName(n) {
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
          upgradeOne(n);
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
    _match(target, r, o) {
      const inScope = target === o.target || (o.subtree && o.target && o.target.contains && o.target.contains(target));
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
        if (!t) continue;
        for (const o of this._opts) {
          if (!this._match(t, r, o)) continue;
          const keepOld = (r.type === "attributes" && o.attributeOldValue) || (r.type === "characterData" && o.characterDataOldValue);
          recs.push({
            type: r.type,
            target: t,
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
    const stream = {
      getReader() {
        let i = 0;
        const buf = bytes();
        return {
          read() {
            if (i >= buf.length) return Promise.resolve({ done: true, value: undefined });
            const end = Math.min(i + 16384, buf.length);
            const value = buf.slice(i, end);
            i = end;
            return Promise.resolve({ done: false, value });
          },
          cancel() { i = buf.length; return Promise.resolve(); },
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
      text() { consume(); return Promise.resolve(textBody); },
      json() { consume(); return Promise.resolve(JSON.parse(textBody || "null")); },
      arrayBuffer() { consume(); return Promise.resolve(bytes().buffer); },
      blob() { consume(); const b = bytes(); return Promise.resolve({ size: b.length, type: "" }); },
      clone() {
        if (bodyUsed) throw new TypeError("body already used");
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
          const r = D("fetchPoll", id);
          if (!r || r.pending) { setTimeout(tick, 0); return; }
          if (r.error) reject(new TypeError(r.error));
          else resolve(responseFrom(r));
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
      this.searchParams = new URLSearchParams(this.search);
    }
    toString() { return this.href; }
    toJSON() { return this.href; }
  }
  class DOMParser {
    parseFromString(str, type) {
      const doc = document.implementation.createHTMLDocument("");
      const html = str == null ? "" : String(str);
      if (String(type || "").toLowerCase().includes("xml")) {
        doc.body.textContent = html;
        return doc;
      }
      const body = /<body[\s\S]*?>([\s\S]*)<\/body>/i.exec(html);
      doc.body.innerHTML = body ? body[1] : html;
      return doc;
    }
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
  const location = new Location();
  const history = new History();
  const windowProps = {
    window: null, self: null, document, location, history, atob, btoa,
    onhashchange: null, onpopstate: null,
    localStorage: storage("local"), sessionStorage: storage("session"),
    customElements: new CustomElementRegistry(),
    Event, HashChangeEvent, MouseEvent, KeyboardEvent, CustomEvent, UIEvent, InputEvent, MessageEvent, EventTarget, DragEvent,
    Node, NodeList, Element, HTMLElement, Document, DocumentFragment, ShadowRoot, Text, Comment, CharacterData,
    ProcessingInstruction, DocumentType, HTMLCollection,
    HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement, HTMLOptionElement,
    HTMLButtonElement, HTMLFormElement, HTMLAnchorElement, HTMLImageElement, HTMLLinkElement, HTMLUnknownElement, HTMLStyleElement,
    HTMLIFrameElement, HTMLCanvasElement, HTMLEmbedElement, HTMLObjectElement, HTMLDocument: Document, HTMLDivElement, HTMLParagraphElement,
    HTMLSpanElement, HTMLHeadElement, HTMLBodyElement, HTMLHtmlElement,
    HTMLTitleElement, HTMLScriptElement, HTMLFrameSetElement, HTMLTemplateElement,
    SVGElement, SVGSVGElement, SVGGraphicsElement, SVGPathElement, MathMLElement, DOMStringMap,
    CanvasRenderingContext2D, ImageData, Path2D, DOMException, TreeWalker,
    MutationObserver, IntersectionObserver, ResizeObserver, Range,
    FormData, XMLHttpRequest, DOMTokenList, URL, URLSearchParams, DOMParser, CSSStyleSheet,
    navigator: {
      userAgent: "Vector/0.0.1", language: "en-US", languages: ["en-US"], onLine: true, platform: "vector",
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
        get ready() { return this._ready || Promise.resolve({ active: null }); },
        addEventListener(type, fn) {
          if (type === "controllerchange" && typeof fn === "function") {
            this._controllerFns = this._controllerFns || [];
            this._controllerFns.push(fn);
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
    open() { return null; },
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
    return EventTarget.prototype.addEventListener.call(windowTarget, type, fn, opts);
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
  globalThis.__veDocumentEvents = () => {
    try { exposeAllIds(); } catch (e) {}
    try { customElements.upgrade(document); } catch (e) {}
    try { document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true })); } catch (e) {}
    try { window.dispatchEvent(new Event("load")); } catch (e) {}
  };
  windowProps.window = globalThis;
  windowProps.self = globalThis;
  windowProps.top = globalThis;
  windowProps.parent = globalThis;
  windowProps.frames = globalThis;

  for (const [k, v] of Object.entries(windowProps)) {
    try { globalThis[k] = v; } catch {}
  }
  try {
    Object.defineProperty(globalThis, "window", { value: globalThis, writable: true, configurable: true });
    Object.defineProperty(globalThis, "self", { value: globalThis, writable: true, configurable: true });
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
