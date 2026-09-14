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
  frameKey: string;
  refStart: number;
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

  function implicitRole(el: any): string | undefined {
    if (el.getAttribute && el.getAttribute("role")) return el.getAttribute("role");
    const tag = el.tagName as string;
    if (tag === "A" && el.getAttribute("href")) return "link";
    if (tag === "INPUT") {
      const t = (el.getAttribute("type") || "text").toLowerCase();
      return INPUT_ROLE[t] ?? "textbox";
    }
    return IMPLICIT_ROLE[tag];
  }

  function visible(el: any): boolean {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function accessibleName(el: any): string {
    const aria = el.getAttribute("aria-label");
    if (aria) return aria.trim().slice(0, 120);
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const t = labelledBy
        .split(/\s+/)
        .map((id: string) => el.ownerDocument.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
      if (t) return t.slice(0, 120);
    }
    // associated <label for=> or wrapping <label>
    const id = el.getAttribute("id");
    if (id) {
      const lab = el.ownerDocument.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lab?.textContent?.trim()) return lab.textContent.trim().slice(0, 120);
    }
    let p = el.parentElement;
    while (p) {
      if (p.tagName === "LABEL" && p.textContent?.trim()) return p.textContent.trim().slice(0, 120);
      p = p.parentElement;
    }
    const tag = el.tagName as string;
    if (tag === "INPUT") {
      const t = (el.getAttribute("type") || "").toLowerCase();
      if (t === "submit" || t === "button") return (el.value || t).slice(0, 120);
      const ph = el.getAttribute("placeholder");
      if (ph) return ph.slice(0, 120);
      const title = el.getAttribute("title");
      if (title) return title.slice(0, 120);
      const name = el.getAttribute("name");
      if (name) return name.slice(0, 120);
    }
    if (tag === "IMG") return (el.getAttribute("alt") || "").slice(0, 120);
    const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    if (text) return text.slice(0, 120);
    return (el.getAttribute("title") || el.getAttribute("placeholder") || el.getAttribute("name") || "").slice(0, 120);
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
      let seg: string;
      if (id && /^[A-Za-z][\w\-:.]*$/.test(id)) {
        seg = `${tag}#${id}`;
        segments.unshift(seg);
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
      if (parent) {
        const sameTag = [...parent.children].filter((c: any) => c.tagName === node.tagName);
        if (sameTag.length > 1) {
          const idx = sameTag.indexOf(node) + 1;
          seg = `${tag}:nth-of-type(${idx})`;
        } else {
          seg = tag;
        }
      } else {
        seg = tag;
      }
      segments.unshift(seg);
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
    let n: any = el;
    while (n) {
      const root = n.getRootNode?.();
      if (root && root !== n.ownerDocument) return undefined;
      n = n.parentElement;
    }
    const parts: string[] = [];
    let node: any = el;
    while (node && node.nodeType === 1) {
      const tag = (node.tagName as string).toLowerCase();
      const parent: any = node.parentElement;
      if (!parent) {
        parts.unshift(tag);
        break;
      }
      const same = [...parent.children].filter((c: any) => c.tagName === node.tagName);
      parts.unshift(same.length > 1 ? `${tag}[${same.indexOf(node) + 1}]` : tag);
      node = parent;
    }
    return "/" + parts.join("/");
  }

  function isDisabled(el: any): boolean {
    return !!(el.disabled || el.getAttribute?.("aria-disabled") === "true");
  }

  function fieldValue(el: any): string | undefined {
    const tag = el.tagName as string;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return el.value ?? "";
    if (el.isContentEditable) return (el.innerText || "").slice(0, 500);
    return undefined;
  }

  const doc = document;
  const root: any = args.subtreeCss ? doc.querySelector(args.subtreeCss) ?? doc.body : doc.body;
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
    nextRef: args.refStart,
  };

  // Headings
  for (const h of (Array.from(root.querySelectorAll("h1,h2,h3")) as any[]).slice(0, 12)) {
    const t = (h.textContent || "").replace(/\s+/g, " ").trim();
    if (t) result.headings.push(t.slice(0, 140));
  }

  // Interactive elements — include shadow DOM via a manual deep walk.
  const seen = new Set<any>();
  const elements: any[] = [];
  const visit = (container: any) => {
    const found = container.querySelectorAll ? container.querySelectorAll(INTERACTIVE_SELECTOR) : [];
    for (const el of Array.from(found) as any[]) {
      if (seen.has(el)) continue;
      seen.add(el);
      elements.push(el);
    }
    // descend into open shadow roots
    const all = container.querySelectorAll ? container.querySelectorAll("*") : [];
    for (const el of Array.from(all) as any[]) {
      const sr = (el as any).shadowRoot;
      if (sr) visit(sr);
    }
  };
  visit(root);
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
    const r = el.getBoundingClientRect();
    (r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw ? inView : offView).push(el);
  }
  const ordered = inView.concat(offView);

  let refNum = args.refStart;
  for (const el of ordered) {
    if (result.elements.length >= args.maxElements) {
      result.truncated = true;
      break;
    }
    if (!visible(el)) continue;
    const tag = (el.tagName as string).toLowerCase();
    const role = implicitRole(el);
    const name = accessibleName(el);
    const r = el.getBoundingClientRect();
    const entry: any = {
      ref: `r${refNum++}`,
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
    const type = el.getAttribute?.("type");
    if (type && tag === "input") entry.type = type;
    const val = fieldValue(el);
    if (val !== undefined && val !== "") entry.value = val.slice(0, 200);
    if (tag === "input" && (type === "checkbox" || type === "radio")) entry.checked = !!el.checked;
    if (tag === "select") entry.selected = el.options?.[el.selectedIndex]?.text?.trim() ?? "";
    if (tag === "a") entry.href = el.getAttribute("href") || undefined;
    const ph = el.getAttribute?.("placeholder");
    if (ph) entry.placeholder = ph.slice(0, 100);
    if (isDisabled(el)) entry.disabled = true;
    const txt = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (txt && txt !== name) entry.text = txt.slice(0, 140);
    result.elements.push(entry);
    if (tag === "a" && entry.href) result.links.push({ ref: entry.ref, text: name || txt || entry.href, href: entry.href });
  }
  result.nextRef = refNum;

  // Form fields with validity
  for (const el of (Array.from(root.querySelectorAll("input:not([type=hidden]),select,textarea,[contenteditable=true]")) as any[]).slice(0, 60)) {
    if (!visible(el)) continue;
    const field: any = {
      ref: undefined as string | undefined,
      label: accessibleName(el) || undefined,
      name: el.getAttribute?.("name") || undefined,
      type: (el.tagName === "INPUT" ? (el.getAttribute("type") || "text") : (el.tagName as string).toLowerCase()),
      value: fieldValue(el)?.slice(0, 300),
      required: !!el.required || el.getAttribute?.("aria-required") === "true",
    };
    if (typeof el.checkValidity === "function") {
      field.valid = el.checkValidity();
      if (!field.valid && el.validationMessage) field.validationMessage = el.validationMessage;
    }
    const existing = result.elements.find((e) => e.selector.css && e.selector.css === cssPath(el));
    field.ref = existing?.ref;
    result.formFields.push(field);
  }

  // Tables — first rows only, marked truncated when applicable
  for (const t of (Array.from(root.querySelectorAll("table")) as any[]).slice(0, 6)) {
    if (!visible(t)) continue;
    const rows = Array.from(t.querySelectorAll("tr")) as any[];
    const headerRow = rows.find((r) => r.querySelector("th")) ?? rows[0];
    const cols = headerRow ? (Array.from(headerRow.querySelectorAll("th,td")) as any[]).map((c) => ((c.textContent as string) || "").trim().slice(0, 60)) : [];
    const bodyRows = rows.slice(headerRow ? rows.indexOf(headerRow) + 1 : 0).slice(0, 12);
    result.tables.push({
      ref: `t${result.tables.length + 1}`,
      caption: t.caption?.textContent?.trim()?.slice(0, 80),
      columns: cols,
      rows: bodyRows.map((r) => (Array.from(r.querySelectorAll("th,td")) as any[]).map((c) => ((c.textContent as string) || "").replace(/\s+/g, " ").trim().slice(0, 120))),
      totalRows: Math.max(0, rows.length - 1),
      truncated: rows.length - 1 > bodyRows.length,
    });
  }

  // Main text — prefer article/main, fall back to body
  const mainEl = root.querySelector?.("main, article, [role=main]") ?? root;
  let text = (mainEl.innerText || "").replace(/\n{3,}/g, "\n\n").trim();

  // innerText skips open shadow roots — collect their text so content living
  // in shadow DOM (widgets, counters) is still observable by the planner.
  const shadowTextOf = (sr: any): string => {
    const parts: string[] = [];
    const walk = (n: any) => {
      for (const c of Array.from(n.childNodes ?? []) as any[]) {
        if (c.nodeType === 3) {
          const t = (c.nodeValue ?? "").replace(/\s+/g, " ").trim();
          if (t) parts.push(t);
        } else if (c.nodeType === 1) {
          const tag = (c.tagName as string).toLowerCase();
          if (tag === "style" || tag === "script" || tag === "template" || tag === "noscript") continue;
          walk(c);
        }
      }
    };
    walk(sr);
    return parts.join(" ");
  };
  const shadowChunks: string[] = [];
  const visitShadow = (container: any) => {
    for (const el of Array.from(container.querySelectorAll?.("*") ?? []) as any[]) {
      const sr = (el as any).shadowRoot;
      if (!sr) continue;
      const t = shadowTextOf(sr).slice(0, 400);
      if (t) shadowChunks.push(`${(el.tagName as string).toLowerCase()}: ${t}`);
      visitShadow(sr);
    }
  };
  visitShadow(root);
  // front-load it — shadow content is exactly what flat text extraction
  // hides, so the planner needs it where it can't be missed
  if (shadowChunks.length) {
    text = `— shadow DOM —\n${shadowChunks.join("\n")}${text ? `\n\n${text}` : ""}`;
  }

  if (text.length > args.maxTextChars) {
    text = text.slice(0, args.maxTextChars) + "\n…[text truncated]";
    result.truncated = true;
  }
  result.text = text;
  return result;
}
