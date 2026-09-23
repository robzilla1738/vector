/**
 * Serialized into page.evaluate(). Must stay self-contained — no imports,
 * no closures over module state. DOM types are intentionally loose (`any`)
 * because this package type-checks without DOM libs.
 */

export interface ObserveScriptArgs {
  maxElements: number;
  maxTextChars: number;
  /** only collect inside this element (css path) — for subtree scope */
  subtreeCss?: string;
  /** only collect inside this ref's live element — preferred over subtreeCss */
  subtreeRef?: string;
  frameKey: string;
  /** lowest number a newly seen element may take (page-wide, monotonic per document) */
  refStart: number;
  /** add to this frame's live ref map instead of replacing it (expandRef) */
  mergeRefs?: boolean;
}

export interface ObserveScriptResult {
  url: string;
  title: string;
  viewport: { width: number; height: number; scale: number };
  scroll: { x: number; y: number; maxY: number };
  text: string;
  headings: string[];
  elements: any[];
  formFields: any[];
  tables: any[];
  links: any[];
  dialogs: any[];
  truncated: boolean;
  elementsTotal: number;
  nextRef: number;
}

export function collectObservation(args: ObserveScriptArgs): ObserveScriptResult {
  const INTERACTIVE_SELECTOR = [
    "a[href]",
    "button",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    "[contenteditable=true]",
    "[contenteditable='']",
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="combobox"]',
    '[role="listbox"]',
    '[role="textbox"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="switch"]',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="searchbox"]',
    '[role="option"]',
    "[tabindex]",
  ].join(",");
  const CANDIDATE_TAGS = new Set(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY"]);
  const FIELD_SELECTOR = "input:not([type=hidden]),select,textarea,[contenteditable=true]";
  const SKIP_TEXT = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const BLOCK_TAGS = new Set([
    "ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "DD", "DETAILS", "DIALOG", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION",
    "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE",
    "SECTION", "SUMMARY", "TABLE", "TR", "UL", "OPTION",
  ]);

  const IMPLICIT_ROLE: Record<string, string> = {
    BUTTON: "button",
    SELECT: "combobox",
    TEXTAREA: "textbox",
    SUMMARY: "button",
  };
  const INPUT_ROLE: Record<string, string> = {
    button: "button",
    submit: "button",
    checkbox: "checkbox",
    radio: "radio",
    range: "slider",
    number: "spinbutton",
    search: "searchbox",
  };

  // one layout read per element per observation
  const rects = new Map<any, any>();
  const styles = new Map<any, any>();
  const rectOf = (el: any) => {
    let r = rects.get(el);
    if (!r) rects.set(el, (r = el.getBoundingClientRect()));
    return r;
  };
  const styleOf = (el: any) => {
    let s = styles.get(el);
    if (!s) styles.set(el, (s = getComputedStyle(el)));
    return s;
  };

  function implicitRole(el: any): string | undefined {
    const explicit = el.getAttribute && el.getAttribute("role");
    if (explicit) return explicit;
    const tag = el.tagName as string;
    if (tag === "A" && el.getAttribute("href")) return "link";
    if (tag === "INPUT") {
      const t = (el.getAttribute("type") || "text").toLowerCase();
      return INPUT_ROLE[t] ?? "textbox";
    }
    return IMPLICIT_ROLE[tag];
  }

  function visible(el: any): boolean {
    const style = styleOf(el);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
    const r = rectOf(el);
    return r.width > 0 && r.height > 0;
  }

  /** Rendered-ish text of a small subtree without forcing layout (innerText does). */
  function textOf(el: any, max: number): string {
    let out = "";
    const walk = (n: any) => {
      for (let c = n.firstChild; c && out.length <= max; c = c.nextSibling) {
        if (c.nodeType === 3) out += c.nodeValue ?? "";
        else if (c.nodeType === 1) {
          if (SKIP_TEXT.has(c.tagName) || c.hidden) continue;
          if (typeof c.checkVisibility === "function" && !c.checkVisibility()) continue;
          const block = BLOCK_TAGS.has(c.tagName) || c.tagName === "BR";
          if (block) out += " ";
          walk(c);
          if (block) out += " ";
        }
      }
    };
    walk(el);
    return out.replace(/\s+/g, " ").trim();
  }

  let labelsFor: Map<string, any> | null = null;
  const labelFor = (id: string) => {
    if (!labelsFor) {
      labelsFor = new Map();
      for (const l of Array.from(doc.querySelectorAll("label[for]")) as any[]) {
        const key = l.getAttribute("for");
        if (key && !labelsFor.has(key)) labelsFor.set(key, l);
      }
    }
    return labelsFor.get(id);
  };

  const names = new Map<any, string>();
  function accessibleName(el: any): string {
    let n = names.get(el);
    if (n === undefined) names.set(el, (n = computeName(el)));
    return n;
  }
  function computeName(el: any): string {
    const aria = el.getAttribute("aria-label");
    if (aria) return redactText(aria).trim().slice(0, 120);
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const t = labelledBy
        .split(/\s+/)
        .map((id: string) => el.ownerDocument.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
      if (t) return redactText(t).slice(0, 120);
    }
    // associated <label for=> or wrapping <label>
    const id = el.getAttribute("id");
    if (id) {
      const lab = labelFor(id);
      if (lab?.textContent?.trim()) return redactText(lab.textContent).trim().slice(0, 120);
    }
    let p = el.parentElement;
    while (p) {
      if (p.tagName === "LABEL" && p.textContent?.trim()) return redactText(p.textContent).trim().slice(0, 120);
      p = p.parentElement;
    }
    const tag = el.tagName as string;
    if (tag === "INPUT") {
      const t = (el.getAttribute("type") || "").toLowerCase();
      if (t === "submit" || t === "button") return redactText(el.value || t).slice(0, 120);
      const ph = el.getAttribute("placeholder");
      if (ph) return redactText(ph).slice(0, 120);
      const title = el.getAttribute("title");
      if (title) return redactText(title).slice(0, 120);
      const name = el.getAttribute("name");
      if (name) return redactText(name).slice(0, 120);
    }
    if (tag === "IMG") return redactText(el.getAttribute("alt") || "").slice(0, 120);
    const text = redactText(textOf(el, 160));
    if (text) return text.slice(0, 120);
    return redactText(el.getAttribute("title") || el.getAttribute("placeholder") || el.getAttribute("name") || "").slice(0, 120);
  }

  /** nth-of-type index among same-tag siblings, 0 when the tag is unique. */
  function typeIndex(node: any, parent: any): number {
    let before = 0;
    let passed = false;
    let dup = false;
    for (let s = parent.firstElementChild; s; s = s.nextElementSibling) {
      if (s === node) passed = true;
      else if (s.tagName === node.tagName) {
        dup = true;
        if (passed) break;
        before++;
      }
    }
    return dup ? before + 1 : 0;
  }

  /**
   * Build a CSS path for an element. Segments joined by " >> " may cross open
   * shadow roots — Playwright's css engine pierces them automatically.
   */
  function cssPath(el: any): string {
    const segments: string[] = [];
    let node: any = el;
    for (let depth = 0; node && depth < 12; depth++) {
      if (node.nodeType === 11 /* DocumentFragment (shadow root) */) {
        node = node.host;
        continue;
      }
      if (node.nodeType !== 1) break;
      const tag = (node.tagName as string).toLowerCase();
      const id = node.getAttribute?.("id");
      if (id && /^[A-Za-z][\w\-:.]*$/.test(id)) {
        segments.unshift(`${tag}#${id}`);
        // an id segment is usually enough of an anchor
        const root = node.getRootNode?.();
        if (root === node.ownerDocument) break;
        node = root?.host ?? null;
        continue;
      }
      const dataTest = node.getAttribute?.("data-testid") || node.getAttribute?.("data-test-id");
      if (dataTest) {
        segments.unshift(`[data-testid="${dataTest}"]`);
        break;
      }
      const parent: any = node.parentElement ?? node.getRootNode?.()?.host ?? null;
      const idx = parent ? typeIndex(node, node.parentElement ?? node.parentNode) : 0;
      segments.unshift(idx ? `${tag}:nth-of-type(${idx})` : tag);
      const root = node.getRootNode?.();
      if (root && root !== node.ownerDocument && root.host) {
        node = root.host;
        continue; // cross a shadow boundary
      }
      node = parent && parent !== node.ownerDocument.documentElement.parentNode ? parent : null;
      if (node && node.tagName === "HTML") break;
    }
    return segments.join(" >> ");
  }

  function xpathOf(el: any): string | undefined {
    // xpath cannot pierce shadow roots — only produce for light DOM.
    if (el.getRootNode?.() !== el.ownerDocument) return undefined;
    const parts: string[] = [];
    let node: any = el;
    while (node && node.nodeType === 1) {
      const tag = (node.tagName as string).toLowerCase();
      const parent: any = node.parentElement;
      if (!parent) {
        parts.unshift(tag);
        break;
      }
      const idx = typeIndex(node, parent);
      parts.unshift(idx ? `${tag}[${idx}]` : tag);
      node = parent;
    }
    return "/" + parts.join("/");
  }

  function isDisabled(el: any): boolean {
    return !!(el.disabled || el.getAttribute?.("aria-disabled") === "true");
  }

  function protectedField(el: any): boolean {
    if (String(el.type ?? el.getAttribute?.("type") ?? "").toLowerCase() === "password") return true;
    const tokens = String(el.getAttribute?.("autocomplete") ?? "").toLowerCase().split(/\s+/);
    return tokens.some(token => ["current-password", "new-password", "one-time-code"].includes(token));
  }

  const protectedValues = new Set<string>();
  let protectedTexts: string[] = [];
  function rememberProtectedValue(el: any) {
    if (!protectedField(el)) return;
    for (const value of [el.value, el.defaultValue, el.isContentEditable ? el.innerText : undefined])
      if (typeof value === "string" && value) protectedValues.add(value);
  }
  function redactText(text: string): string {
    for (const value of protectedTexts) text = text.split(value).join("{redacted}");
    return text;
  }

  function fieldValue(el: any): string | undefined {
    const tag = el.tagName as string;
    if (protectedField(el)) return (el.value || el.innerText) ? "{redacted}" : "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return redactText(el.value ?? "");
    if (el.isContentEditable) return redactText(el.innerText || "").slice(0, 500);
    return undefined;
  }

  // Per-world ref state: a WeakMap keeps a node's ref across observations of
  // one document; numbers only grow, so a ref is never reissued to another node.
  const g: any = globalThis as any;
  const store: { ids: WeakMap<any, number>; refs: Map<string, any>; next: number; cssPath?: (el: any) => string } =
    g.__auxStore && g.__auxStore.ids instanceof WeakMap ? g.__auxStore : (g.__auxStore = { ids: new WeakMap(), refs: new Map(), next: 1 });
  store.next = Math.max(store.next, args.refStart);
  store.cssPath = cssPath;
  const refOf = (el: any) => {
    let id = store.ids.get(el);
    if (id === undefined) store.ids.set(el, (id = store.next++));
    return `r${id}`;
  };

  const doc = document;
  const scoped = args.subtreeRef ? store.refs.get(args.subtreeRef) : undefined;
  const root: any = (scoped?.isConnected ? scoped : null) ?? (args.subtreeCss ? doc.querySelector(args.subtreeCss) ?? doc.body : doc.body);
  const result: ObserveScriptResult = {
    url: location.href,
    title: doc.title,
    viewport: { width: innerWidth, height: innerHeight, scale: devicePixelRatio || 1 },
    scroll: {
      x: Math.round(scrollX),
      y: Math.round(scrollY),
      maxY: Math.max(0, Math.round((doc.documentElement?.scrollHeight ?? 0) - innerHeight)),
    },
    text: "",
    headings: [],
    elements: [],
    formFields: [],
    tables: [],
    links: [],
    dialogs: [],
    truncated: false,
    elementsTotal: 0,
    nextRef: store.next,
  };

  // One pass over the tree (open shadow roots included): interactives from
  // every tree; headings, fields, tables and the main region from the light tree.
  const elements: any[] = [];
  const headingEls: any[] = [];
  const fieldEls: any[] = [];
  const tableEls: any[] = [];
  const shadowHosts: any[] = [];
  let mainEl: any = null;
  const visit = (container: any, light: boolean) => {
    if (!container) return;
    const tw = doc.createTreeWalker(container, 1 /* SHOW_ELEMENT */);
    for (let el: any = tw.nextNode(); el; el = tw.nextNode()) {
      const tag = el.tagName as string;
      if ((CANDIDATE_TAGS.has(tag) || el.hasAttribute("role") || el.hasAttribute("tabindex") || el.hasAttribute("contenteditable")) && el.matches(INTERACTIVE_SELECTOR))
        elements.push(el);
      if (light) {
        if ((tag === "H1" || tag === "H2" || tag === "H3") && headingEls.length < 12) headingEls.push(el);
        else if (tag === "TABLE" && tableEls.length < 6) tableEls.push(el);
        if (fieldEls.length < 60 && (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || el.hasAttribute("contenteditable")) && el.matches(FIELD_SELECTOR))
          fieldEls.push(el);
        if (!mainEl && (tag === "MAIN" || tag === "ARTICLE" || el.getAttribute("role") === "main")) mainEl = el;
      }
      if (el.shadowRoot) {
        shadowHosts.push(el);
        visit(el.shadowRoot, false);
      }
    }
  };
  visit(root, true);
  for (const el of elements) rememberProtectedValue(el);
  protectedTexts = [...protectedValues].sort((a, b) => b.length - a.length);
  result.title = redactText(result.title);
  for (const h of headingEls) {
    const t = redactText(h.textContent || "").replace(/\s+/g, " ").trim();
    if (t) result.headings.push(t.slice(0, 140));
  }

  result.elementsTotal = elements.length;

  // Real pages have far more interactives than the cap — nav chrome in DOM
  // order would crowd out actionable content. Show what the user/agent can
  // act on now: elements intersecting the viewport first (DOM order kept
  // within each tier), then everything below the fold.
  const vh = (globalThis as any).innerHeight ?? 0;
  const vw = (globalThis as any).innerWidth ?? 0;
  const inView: any[] = [];
  const offView: any[] = [];
  for (const el of elements) {
    const r = rectOf(el);
    (r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw ? inView : offView).push(el);
  }
  const ordered = inView.concat(offView);

  // Live ref map (speed P0-3 / plan A7): the driver resolves `rN` with one
  // map lookup instead of a css/xpath/role search, and falls back to the
  // selectors only when the node is gone. A full observe replaces the map:
  // refs it did not return are stale by contract.
  const refMap: Map<string, any> = args.mergeRefs ? store.refs : new Map();
  store.refs = refMap;
  const refByEl = new Map<any, string>();
  for (const el of ordered) {
    if (result.elements.length >= args.maxElements) {
      result.truncated = true;
      break;
    }
    if (!visible(el)) continue;
    const tag = (el.tagName as string).toLowerCase();
    const role = implicitRole(el);
    const name = accessibleName(el);
    const r = rectOf(el);
    const entry: any = {
      ref: refOf(el),
      frame: args.frameKey,
      tag,
      selector: { css: cssPath(el), xpath: xpathOf(el) },
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    };
    if (role) {
      entry.role = role;
      entry.selector.role = { role, name: name || undefined };
    }
    if (name) entry.name = name;
    const type = el.getAttribute?.("type")?.toLowerCase();
    if (type && tag === "input") entry.type = type;
    const val = fieldValue(el);
    if (val !== undefined && val !== "") entry.value = val.slice(0, 200);
    if (tag === "input" && (type === "checkbox" || type === "radio")) entry.checked = !!el.checked;
    if (tag === "select") entry.selected = el.options?.[el.selectedIndex]?.text?.trim() ?? "";
    if (tag === "a") entry.href = el.getAttribute("href") || undefined;
    const ph = el.getAttribute?.("placeholder");
    if (ph) entry.placeholder = redactText(ph).slice(0, 100);
    if (isDisabled(el)) entry.disabled = true;
    // Action-reliability state (plan A10): choices, toggles, focus, and
    // whether a click would actually land (viewport + occlusion).
    if (tag === "select" && el.options) {
      const opts = Array.from(el.options as any[]).map((o: any) => (o.label || o.text || "").trim()).filter(Boolean);
      if (opts.length) entry.options = opts.slice(0, 20);
    } else if (role === "listbox" || role === "menu" || role === "radiogroup") {
      const opts = Array.from(el.querySelectorAll('[role="option"],[role="menuitem"],[role="radio"]') as any[])
        .map((o: any) => (o.getAttribute("aria-label") || o.textContent || "").replace(/\s+/g, " ").trim())
        .filter(Boolean);
      if (opts.length) entry.options = opts.slice(0, 20);
    }
    const ariaExpanded = el.getAttribute?.("aria-expanded");
    if (ariaExpanded === "true" || ariaExpanded === "false") entry.expanded = ariaExpanded === "true";
    else if (tag === "summary" && el.parentElement?.tagName === "DETAILS") entry.expanded = !!el.parentElement.open;
    const ariaPressed = el.getAttribute?.("aria-pressed");
    if (ariaPressed === "true" || ariaPressed === "false") entry.pressed = ariaPressed === "true";
    if (doc.activeElement === el) entry.focused = true;
    if (el.required || el.getAttribute?.("aria-required") === "true") entry.required = true;
    const inViewport = r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
    if (!inViewport) entry.offscreen = true;
    else if (r.width > 0 && r.height > 0 && typeof doc.elementFromPoint === "function") {
      const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
      let hit: any = doc.elementFromPoint(cx, cy);
      // descend through open shadow roots to the real target
      while (hit && hit.shadowRoot && typeof hit.shadowRoot.elementFromPoint === "function") {
        const inner = hit.shadowRoot.elementFromPoint(cx, cy);
        if (!inner || inner === hit) break;
        hit = inner;
      }
      if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
        // labels and inline wrappers forward clicks to their control; anything else covers it
        const forwards = hit.tagName === "LABEL" && (hit.control === el || hit.contains(el));
        if (!forwards) entry.occluded = true;
      }
    }
    const txt = redactText(textOf(el, 160));
    if (txt && txt !== name) entry.text = txt.slice(0, 140);
    result.elements.push(entry);
    refMap.set(entry.ref, el);
    refByEl.set(el, entry.ref);
    if (tag === "a" && entry.href) result.links.push({ ref: entry.ref, text: name || txt || entry.href, href: entry.href });
  }
  result.nextRef = store.next;

  // Form fields with validity
  for (const el of fieldEls) {
    if (!visible(el)) continue;
    const field: any = {
      ref: refByEl.get(el),
      label: redactText(accessibleName(el)) || undefined,
      name: el.getAttribute?.("name") || undefined,
      type: (el.tagName === "INPUT" ? (el.getAttribute("type") || "text").toLowerCase() : (el.tagName as string).toLowerCase()),
      value: fieldValue(el)?.slice(0, 300),
      required: !!el.required || el.getAttribute?.("aria-required") === "true",
    };
    if (typeof el.checkValidity === "function") {
      field.valid = el.checkValidity();
      if (!field.valid && el.validationMessage && !protectedField(el)) field.validationMessage = redactText(el.validationMessage);
    }
    result.formFields.push(field);
  }

  // Tables — first rows only, marked truncated when applicable
  for (const t of tableEls) {
    if (!visible(t)) continue;
    const rows = Array.from(t.querySelectorAll("tr")) as any[];
    const headerRow = rows.find((r) => r.querySelector("th")) ?? rows[0];
    const cols = headerRow ? (Array.from(headerRow.querySelectorAll("th,td")) as any[]).map((c) => redactText((c.textContent as string) || "").trim().slice(0, 60)) : [];
    const bodyRows = rows.slice(headerRow ? rows.indexOf(headerRow) + 1 : 0).slice(0, 12);
    result.tables.push({
      ref: `t${result.tables.length + 1}`,
      caption: t.caption ? redactText(t.caption.textContent || "").trim().slice(0, 80) : undefined,
      columns: cols,
      rows: bodyRows.map((r) => (Array.from(r.querySelectorAll("th,td")) as any[]).map((c) => redactText((c.textContent as string) || "").replace(/\s+/g, " ").trim().slice(0, 120))),
      totalRows: Math.max(0, rows.length - 1),
      truncated: rows.length - 1 > bodyRows.length,
    });
  }

  // innerText skips open shadow roots — collect their text so content living
  // in shadow DOM (widgets, counters) is still observable by the planner.
  const shadowTextOf = (sr: any): string => {
    const parts: string[] = [];
    let len = 0;
    const walk = (n: any) => {
      for (let c = n.firstChild; c && len <= 400; c = c.nextSibling) {
        if (c.nodeType === 3) {
          const t = (c.nodeValue ?? "").replace(/\s+/g, " ").trim();
          if (t) {
            parts.push(t);
            len += t.length + 1;
          }
        } else if (c.nodeType === 1 && !SKIP_TEXT.has(c.tagName)) walk(c);
      }
    };
    walk(sr);
    return parts.join(" ");
  };
  const shadowChunks: string[] = [];
  for (const host of shadowHosts) {
    const t = redactText(shadowTextOf(host.shadowRoot)).slice(0, 400);
    if (t) shadowChunks.push(`${(host.tagName as string).toLowerCase()}: ${t}`);
  }

  // Main text — prefer article/main, fall back to the root. A budgeted walk
  // stops once the budget (plus the longest secret, so redaction still sees
  // whole values) is spent and skips hidden subtrees, instead of laying out
  // the whole region through innerText and cutting it afterwards. Block
  // edges emit break markers; like innerText, adjacent edges take the
  // largest required break (\u0002 = blank line for <p>) rather than summing.
  const budget = args.maxTextChars + (protectedTexts[0]?.length ?? 0) + 1;
  let collected = shadowChunks.length ? `— shadow DOM —\n${shadowChunks.join("\n")}\n\n` : "";
  let spent = collected.length;
  const chunks: string[] = [];
  const push = (s: string) => {
    chunks.push(s);
    spent += s.length;
  };
  const walkText = (n: any, shown: boolean) => {
    for (let c = n.firstChild; c && spent <= budget; c = c.nextSibling) {
      if (c.nodeType === 3) {
        // whitespace-only nodes still separate inline siblings
        const t = shown ? (c.nodeValue ?? "").replace(/[ \t\n\r\f]+/g, " ") : "";
        if (t) push(t);
        continue;
      }
      if (c.nodeType !== 1 || SKIP_TEXT.has(c.tagName)) continue;
      const style = styleOf(c);
      if (style.display === "none") continue;
      if (c.tagName === "BR") {
        push("\n");
        continue;
      }
      const display = String(style.display || "");
      const cell = display === "table-cell" || c.tagName === "TD" || c.tagName === "TH";
      const block = !cell && (BLOCK_TAGS.has(c.tagName) || (display !== "" && !display.startsWith("inline") && display !== "contents"));
      const edge = c.tagName === "P" ? "\u0002" : "\u0001";
      if (block) push(edge);
      // hidden boxes can hold visible descendants — only those contribute
      walkText(c, style.visibility !== "hidden" && style.visibility !== "collapse");
      if (block) push(edge);
      else if (cell) push("\t");
    }
  };
  walkText(mainEl ?? root, true);
  collected += chunks
    .join("")
    .replace(/ {2,}/g, " ")
    .replace(/ ?\t ?/g, "\t")
    .replace(/[ \t]*[\u0001\u0002][\u0001\u0002 \t]*/g, (run) => (run.includes("\u0002") ? "\n\n" : "\n"))
    .replace(/\t+\n/g, "\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  let text = redactText(collected.trim());
  if (text.length > args.maxTextChars || spent > budget) {
    text = text.slice(0, args.maxTextChars) + "\n…[text truncated]";
    result.truncated = true;
  }
  result.text = text;
  return result;
}
