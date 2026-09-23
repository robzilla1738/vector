/**
 * Element picker — a small, self-contained in-page overlay the shell runs in a
 * preview tab so the user can point at a visible element and describe the edit
 * they want. The picked element becomes human-readable context on the task's
 * next run; it is never a driver target, so the agent reads the description
 * rather than replaying a selector.
 *
 * `pickElementInPage` is serialized into `page.evaluate`, so it cannot capture
 * variables from this module — every constant it needs is a parameter or a
 * literal.
 */

export interface PickedElement {
  tag: string;
  id?: string;
  classes: string[];
  text?: string;
  role?: string;
  ariaLabel?: string;
  href?: string;
  selector: string;
  rect: { x: number; y: number; width: number; height: number };
}

export const ELEMENT_PICK_TIMEOUT_MS = 60_000;

export function describePickedElement(el: PickedElement): string {
  const bits = [el.tag, ...(el.id ? [`#${el.id}`] : []), ...(el.classes.length ? [`(${el.classes.slice(0, 3).join(", ")})`] : [])];
  const extra = [
    el.ariaLabel && `aria-label "${el.ariaLabel}"`,
    el.role && `role "${el.role}"`,
    el.text && `text "${el.text}"`,
    el.href && `link ${el.href}`,
  ].filter(Boolean).join("; ");
  return `${bits.join(" ")} at "${el.selector}"${extra ? ` — ${extra}` : ""}`;
}

/** Serialized into the page — keep it free of module-scope references. */
export function pickElementInPage(timeoutMs: number): Promise<unknown> {
  const CHROME_ATTR = "data-aux-element-picker";
  return new Promise(resolve => {
    let done = false;
    const overlay = document.createElement("div");
    overlay.setAttribute(CHROME_ATTR, "overlay");
    overlay.style.cssText = "position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #4c8dff;background:rgba(76,141,255,.12);border-radius:4px;transition:all 60ms ease;display:none;";
    const hint = document.createElement("div");
    hint.setAttribute(CHROME_ATTR, "hint");
    hint.textContent = "Click the element to request an edit — Esc cancels";
    hint.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#17181c;color:#f3f4f6;font:13px/1.4 system-ui,sans-serif;padding:8px 14px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.35);pointer-events:none;";
    document.documentElement.append(overlay, hint);

    const deepest = (event: Event): Element | null => {
      const path = event.composedPath();
      for (const node of path) {
        if (!(node instanceof Element)) continue;
        if (node.hasAttribute(CHROME_ATTR)) continue;
        return node;
      }
      return null;
    };
    const escapeIdent = (value: string) => (globalThis.CSS?.escape ?? ((text: string) => text))(value);
    const summarize = (el: Element) => {
      const classes = [...el.classList].slice(0, 8);
      const segments: string[] = [];
      let cursor: Element | null = el;
      for (let depth = 0; depth < 4 && cursor && cursor.nodeType === 1; depth += 1) {
        const tag = cursor.tagName.toLowerCase();
        if (cursor.id) {
          segments.unshift(`${tag}#${escapeIdent(cursor.id)}`);
          break;
        }
        const klass = [...cursor.classList].slice(0, 2).map(name => `.${escapeIdent(name)}`).join("");
        segments.unshift(`${tag}${klass}`);
        if (tag === "body" || tag === "html") break;
        const root = cursor.getRootNode();
        cursor = cursor.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
      }
      const rect = el.getBoundingClientRect();
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
      const href = el instanceof HTMLAnchorElement ? el.href : el.closest("a")?.href;
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        classes,
        text: text || undefined,
        role: el.getAttribute("role") || undefined,
        ariaLabel: el.getAttribute("aria-label") || undefined,
        href: href || undefined,
        selector: segments.join(" > "),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
      };
    };
    const place = (el: Element) => {
      const rect = el.getBoundingClientRect();
      overlay.style.display = "block";
      overlay.style.left = `${rect.left - 2}px`;
      overlay.style.top = `${rect.top - 2}px`;
      overlay.style.width = `${rect.width + 4}px`;
      overlay.style.height = `${rect.height + 4}px`;
    };
    const finish = (value: unknown) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      hint.remove();
      resolve(value);
    };
    const onOver = (event: Event) => {
      const el = deepest(event);
      if (el) place(el);
    };
    const onClick = (event: Event) => {
      const el = deepest(event);
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      finish(summarize(el));
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(null);
      }
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
  });
}
