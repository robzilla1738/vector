/** Runs inside the selected page through the existing browser driver. It must
 * remain self-contained because PageDiagnostics serializes this function. */
export function pickZapInPage(timeoutMs: number): Promise<unknown> {
  return new Promise((resolve) => {
    const marker = "data-aux-zap-picker";
    const highlight = document.createElement("div");
    highlight.setAttribute(marker, "highlight");
    highlight.style.cssText = "position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #9f8cff;background:rgba(159,140,255,.15);border-radius:6px;display:none";
    const hint = document.createElement("div");
    hint.setAttribute(marker, "hint");
    hint.textContent = "Click an element to hide it · Esc cancels";
    hint.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#20202a;color:#f5f4ff;font:13px/1.4 system-ui,sans-serif;padding:9px 14px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.3);pointer-events:none";
    document.documentElement.append(highlight, hint);

    const escapeId = (value: string) => globalThis.CSS?.escape?.(value)
      ?? value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char.codePointAt(0)!.toString(16)} `).replace(/^[0-9]/, (char) => `\\3${char} `);
    const escapeString = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\n\r\f]/g, "\\a ");
    const stable = (value: string) => value.length > 0 && value.length <= 80
      && !/^[a-f0-9]{8,}$/i.test(value) && !/^[a-z_-]*[0-9][a-z0-9_-]{12,}$/i.test(value);
    const deepest = (event: Event): Element | null => {
      for (const node of event.composedPath()) {
        if (node instanceof Element && !node.hasAttribute(marker)) return node;
      }
      return null;
    };
    const styleKey = (element: Element) => {
      const style = getComputedStyle(element);
      return `${style.display}|${style.position}|${style.fontSize}|${style.backgroundColor}|${style.borderRadius}`;
    };
    const candidatesFor = (target: Element) => {
      const proposals: { selector: string; weight: number; targetLevel: number }[] = [];
      let element: Element | null = target;
      for (let level = 0; level <= 2 && element && element !== document.body && element !== document.documentElement; level += 1, element = element.parentElement) {
        const tag = element.tagName.toLowerCase();
        const add = (selector: string, weight: number) => { if (selector.length <= 1000) proposals.push({ selector, weight, targetLevel: level }); };
        if (stable(element.id)) add(`${tag}#${escapeId(element.id)}`, 1.2);
        const testId = element.getAttribute("data-testid") ?? "";
        if (stable(testId)) add(`${tag}[data-testid="${escapeString(testId)}"]`, 1);
        const aria = element.getAttribute("aria-label") ?? "";
        if (stable(aria)) add(`${tag}[aria-label="${escapeString(aria)}"]`, .8);
        const href = element.getAttribute("href") ?? "";
        if (href && href.length <= 200) add(`${tag}[href="${escapeString(href)}"]`, .6);
        if (tag.includes("-")) add(tag, 1);
        const classes = [...element.classList].filter(stable).slice(0, 3);
        for (const klass of classes) add(`${tag}.${escapeId(klass)}`, .45);
        if (classes.length >= 2) add(`${tag}.${escapeId(classes[0]!)}.${escapeId(classes[1]!)}`, .7);
        if (level === 0) {
          const path: string[] = [];
          let node: Element | null = element;
          for (let depth = 0; depth < 5 && node && node !== document.body; depth += 1, node = node.parentElement) {
            const siblings = node.parentElement ? [...node.parentElement.children].filter(child => child.tagName === node!.tagName) : [];
            path.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(node) + 1})`);
            if (node.id && stable(node.id)) { path[0] = `${node.tagName.toLowerCase()}#${escapeId(node.id)}`; break; }
          }
          add(path.join(" > "), .2);
        }
      }
      const seen = new Set<string>();
      return proposals.flatMap((proposal) => {
        if (seen.has(proposal.selector)) return [];
        seen.add(proposal.selector);
        let matches: Element[];
        try { matches = [...document.querySelectorAll(proposal.selector)]; } catch { return []; }
        if (!matches.length || matches.length > 100) return [];
        let ancestor: Element | null = target;
        for (let i = 0; i < proposal.targetLevel; i += 1) ancestor = ancestor?.parentElement ?? null;
        if (!ancestor || !matches.includes(ancestor)) return [];
        const diversity = new Set(matches.map(styleKey)).size;
        const uniform = matches.length > 1 && diversity === 1;
        const score = proposal.weight * 10 + (uniform ? 20 : 0)
          - Math.log10(matches.length) * 10 - Math.log10(diversity) * 10 - proposal.targetLevel * 1.5;
        return [{ selector: proposal.selector, matchCount: matches.length, targetLevel: proposal.targetLevel,
          score: Math.round(score * 100) / 100, related: matches.length > 1 }];
      }).sort((a, b) => b.score - a.score || a.matchCount - b.matchCount).slice(0, 15);
    };
    let settled = false;
    const finish = (value: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      document.removeEventListener("mouseover", onHover, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      highlight.remove(); hint.remove(); resolve(value);
    };
    const onHover = (event: Event) => {
      const element = deepest(event);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      highlight.style.display = "block";
      highlight.style.left = `${rect.left - 2}px`; highlight.style.top = `${rect.top - 2}px`;
      highlight.style.width = `${rect.width + 4}px`; highlight.style.height = `${rect.height + 4}px`;
    };
    const onClick = (event: Event) => {
      const element = deepest(event);
      if (!element) return;
      event.preventDefault(); event.stopPropagation();
      if (element.getRootNode() !== document) return finish({ picked: false, reason: "This element is inside a component that site CSS cannot reach." });
      const candidates = candidatesFor(element);
      if (!candidates.length) return finish({ picked: false, reason: "No bounded CSS selector matched this element." });
      finish({ picked: true, tag: element.tagName.toLowerCase(),
        text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160), candidates });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); finish({ picked: false }); }
    };
    const timer = setTimeout(() => finish({ picked: false }), timeoutMs);
    document.addEventListener("mouseover", onHover, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
  });
}
