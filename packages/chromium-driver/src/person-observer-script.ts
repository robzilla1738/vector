import type { ObserveScriptResult } from "./observe-script.js";

export type PersonReadRequest =
  | {
      operation: "observe";
      maxElements: number;
      maxTextChars: number;
      filter?: "interactive" | "all" | "viewport";
      subtreeRef?: string;
    }
  | {
      operation: "extract";
      fields: Array<{ name: string; selector?: string; attribute?: string; all?: boolean }>;
    };

/** Fixed isolated-world reader. Arguments are data; no scripts or actuation. */
export function readPersonDocument(
  request: PersonReadRequest,
): ObserveScriptResult | Record<string, unknown> {
  const fail = () => {
    throw new Error("This page cannot be read safely.");
  };
  const secretIdentity =
    /password|passphrase|secret|api[-_ ]?key|(?:access|refresh|id|auth|authorization|session|bearer)[-_ ]?token|card[-_ ]?number|credit[-_ ]?card|security[-_ ]?code|\bcvv\b|\bcvc\b|\bcsc\b/i;
  const secretAutocomplete =
    /^(current-password|new-password|one-time-code|cc-number|cc-csc|cc-exp|cc-exp-month|cc-exp-year)$/;
  if (!request || !["observe", "extract"].includes(request.operation)) fail();
  if (
    request.operation === "observe" &&
    (!Number.isInteger(request.maxElements) ||
      request.maxElements < 1 ||
      request.maxElements > 200 ||
      !Number.isInteger(request.maxTextChars) ||
      request.maxTextChars < 1 ||
      request.maxTextChars > 16000)
  )
    fail();
  if (
    request.operation === "observe" &&
    ((request.filter !== undefined && !["interactive", "all", "viewport"].includes(request.filter)) ||
      (request.subtreeRef !== undefined &&
        (typeof request.subtreeRef !== "string" ||
          !request.subtreeRef.length ||
          request.subtreeRef.length > 512)))
  )
    fail();
  if (
    request.operation === "extract" &&
    (!Array.isArray(request.fields) || request.fields.length < 1 || request.fields.length > 20)
  )
    fail();

  const roots: Array<Document | ShadowRoot> = [document];
  const elements: Element[] = [];
  // Finish metadata admission before touching text, title or field properties.
  // Refuse protected forms as a whole, including echoes elsewhere in the DOM,
  // rather than reading a secret in order to redact it afterwards.
  for (let index = 0; index < roots.length; index++) {
    if (roots.length > 64) fail();
    const walker = document.createTreeWalker(roots[index]!, 1);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (elements.length >= 10000) fail();
      const element = node as Element;
      const type = (element.getAttribute("type") ?? "").toLowerCase();
      const identity = ["name", "id", "aria-label", "placeholder"]
        .map((key) => element.getAttribute(key) ?? "")
        .join(" ");
      const autocomplete = (element.getAttribute("autocomplete") ?? "").toLowerCase().split(/\s+/);
      if (
        type === "password" ||
        autocomplete.some((token) => secretAutocomplete.test(token)) ||
        secretIdentity.test(identity) ||
        element.hasAttribute("contenteditable")
      )
        fail();
      elements.push(element);
      if (element.shadowRoot) roots.push(element.shadowRoot);
    }
  }
  const safeUrl = (raw: string): string => {
    const url = new URL(raw, location.href);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      [...url.searchParams.keys()].some(
        (key) =>
          secretIdentity.test(key) ||
          /^(?:code|token|key|session|cookie|authorization|credential|client_secret)$/i.test(key),
      ) ||
      secretIdentity.test(decodeURIComponent(url.hash))
    )
      fail();
    return url.href;
  };
  const pageUrl = safeUrl(location.href);
  const ignored = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "INPUT", "TEXTAREA", "SELECT"]);
  const textOf = (root: Node, limit: number): string => {
    let text = "";
    let visited = 0;
    const walk = (node: Node, depth: number) => {
      if (++visited > 10000 || depth > 128) fail();
      if (text.length >= limit) return;
      if (node.nodeType === 3) {
        text += (node.nodeValue ?? "").slice(0, limit - text.length);
        return;
      }
      if (node.nodeType === 1) {
        const element = node as HTMLElement;
        if (ignored.has(element.tagName) || element.hidden || element.getAttribute("aria-hidden") === "true")
          return;
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse")
          return;
      }
      for (let child = node.firstChild; child && text.length < limit; child = child.nextSibling) {
        if (child.nodeType === 1 && text.length) text += " ";
        walk(child, depth + 1);
      }
      if (node.nodeType === 1 && (node as Element).shadowRoot && text.length < limit)
        walk((node as Element).shadowRoot!, depth + 1);
    };
    walk(root, 0);
    return text.replace(/\s+/g, " ").trim().slice(0, limit);
  };
  if (request.operation === "extract") {
    const output: Record<string, unknown> = Object.create(null);
    let outputChars = 0;
    const bounded = (value: string): string => {
      outputChars += value.length;
      if (outputChars > 65536) fail();
      return value;
    };
    const attributes = new Set(["href", "title", "alt", "aria-label", "name", "id", "role"]);
    for (const field of request.fields) {
      if (
        !field ||
        typeof field.name !== "string" ||
        !/^[A-Za-z][\w-]{0,63}$/.test(field.name) ||
        Object.hasOwn(output, field.name) ||
        (field.all !== undefined && typeof field.all !== "boolean") ||
        (field.attribute !== undefined && !attributes.has(field.attribute))
      )
        fail();
      if (field.selector === undefined) {
        if (field.attribute !== undefined || field.all !== undefined) fail();
        output[field.name] = bounded(
          field.name === "url"
            ? pageUrl
            : field.name === "title"
              ? document.title.slice(0, 512)
              : textOf(document.body, 4000),
        );
        continue;
      }
      if (typeof field.selector !== "string" || !field.selector.length || field.selector.length > 512) fail();
      const selected: Element[] = [];
      for (const root of roots) {
        for (const element of root.querySelectorAll(field.selector)) {
          if (selected.length >= 200) fail();
          selected.push(element);
          if (!field.all) break;
        }
        if (!field.all && selected.length) break;
      }
      const values = selected.map((element) =>
        bounded(
          field.attribute
            ? field.attribute === "href"
              ? safeUrl(element.getAttribute("href") ?? "")
              : (element.getAttribute(field.attribute) ?? "").slice(0, 4000)
            : textOf(element, 4000),
        ),
      );
      output[field.name] = field.all ? values : (values[0] ?? null);
    }
    return output;
  }
  const state = globalThis as typeof globalThis & {
    __auxPersonRefs?: { ids: WeakMap<Element, number>; next: number };
  };
  const refs = (state.__auxPersonRefs ??= { ids: new WeakMap(), next: 1 });
  let scope: Node = document.body;
  if (request.subtreeRef !== undefined) {
    const ref = /^r([1-9][0-9]*)$/.exec(request.subtreeRef);
    const matches = ref
      ? elements.filter((element) => refs.ids.get(element) === Number(ref[1]))
      : roots.flatMap((root) => [...root.querySelectorAll(request.subtreeRef!)]);
    if (matches.length !== 1 || !matches[0]!.isConnected) fail();
    scope = matches[0]!;
  }
  const inside = (element: Element): boolean => {
    for (
      let node: Node | null = element;
      node;
      node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)
    )
      if (node === scope) return true;
    return false;
  };
  const scoped = elements.filter(inside);
  const interactive = "a[href],button,input:not([type=hidden]),select,textarea,summary,[role],[tabindex]";
  const candidates =
    request.filter === "all" ? scoped : scoped.filter((element) => element.matches(interactive));
  const entries = [];
  for (const element of candidates) {
    if (entries.length >= request.maxElements) break;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (!rect.width || !rect.height || style.display === "none" || style.visibility !== "visible") continue;
    if (
      request.filter === "viewport" &&
      (rect.bottom <= 0 || rect.right <= 0 || rect.top >= innerHeight || rect.left >= innerWidth)
    )
      continue;
    let id = refs.ids.get(element);
    if (id === undefined) {
      id = refs.next++;
      refs.ids.set(element, id);
    }
    if (!Number.isSafeInteger(refs.next)) fail();
    const tag = element.tagName.toLowerCase();
    const label = element.getAttribute("id")
      ? elements.find(
          (candidate) => candidate.tagName === "LABEL" && candidate.getAttribute("for") === element.id,
        )
      : undefined;
    const name = (
      element.getAttribute("aria-label") ||
      (label ? textOf(label, 120) : "") ||
      element.getAttribute("placeholder") ||
      textOf(element, 120) ||
      element.getAttribute("name") ||
      ""
    ).slice(0, 120);
    entries.push({
      ref: `r${id}`,
      frame: "main",
      tag,
      name,
      role: element.getAttribute("role") ?? (tag === "button" ? "button" : tag === "a" ? "link" : undefined),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
      selector: {},
      ...(tag === "input" ? { type: element.getAttribute("type") ?? "text" } : {}),
      ...(tag === "a" ? { href: safeUrl(element.getAttribute("href") ?? "") } : {}),
    });
  }
  const formFields = entries
    .filter((entry) => ["input", "select", "textarea"].includes(entry.tag))
    .map((entry) => ({ ref: entry.ref, label: entry.name, type: entry.type ?? entry.tag }));
  const tables = scoped
    .filter((element) => element.tagName === "TABLE")
    .slice(0, 6)
    .map((table, index) => {
      const rows = [...table.querySelectorAll("tr")];
      const header = rows.find((row) => row.querySelector("th"));
      const body = rows.filter((row) => row !== header);
      const cells = (row: Element) =>
        [...row.querySelectorAll("th,td")].slice(0, 20).map((cell) => textOf(cell, 120));
      return {
        ref: `t${index + 1}`,
        caption: table.querySelector("caption") ? textOf(table.querySelector("caption")!, 80) : undefined,
        columns: header ? cells(header) : [],
        rows: body.slice(0, 12).map(cells),
        totalRows: body.length,
        truncated: body.length > 12,
      };
    });
  const dialogs = scoped
    .filter((element) => element.matches('dialog[open],[role="dialog"],[role="alertdialog"]'))
    .slice(0, 8)
    .map((element) => ({ type: element.getAttribute("role") ?? "dialog", message: textOf(element, 512) }));
  const text = textOf(scope, request.maxTextChars + 1);
  return {
    url: pageUrl,
    title: document.title.slice(0, 512),
    viewport: { width: innerWidth, height: innerHeight, scale: devicePixelRatio || 1 },
    scroll: {
      x: Math.round(scrollX),
      y: Math.round(scrollY),
      maxY: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    },
    text: text.slice(0, request.maxTextChars),
    headings: scoped
      .filter((element) => /^H[1-3]$/.test(element.tagName))
      .slice(0, 12)
      .map((element) => textOf(element, 140)),
    elements: entries,
    formFields,
    tables,
    links: entries
      .filter((element) => element.href)
      .map((element) => ({ ref: element.ref, text: element.name, href: element.href })),
    dialogs,
    truncated: candidates.length > entries.length || text.length > request.maxTextChars,
    elementsTotal: candidates.length,
    nextRef: refs.next,
  };
}

export const PERSON_OBSERVER_SOURCE = `(${readPersonDocument.toString()})`;
