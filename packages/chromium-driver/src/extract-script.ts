/** Serialized by Playwright: keep helpers inside this function, with no imports. */
export function extractElements(elements: Element[] | null, attribute: string | null = null): (string | null)[] {
  const doc = elements?.[0]?.ownerDocument ?? document;
  const secrets = new Set<string>();
  const protectedField = (element: Element) =>
    (element.getAttribute("type") ?? "").toLowerCase() === "password"
    || (element.getAttribute("autocomplete") ?? "").toLowerCase().split(/\s+/)
      .some(token => ["current-password", "new-password", "one-time-code"].includes(token));
  const scan = (root: Document | ShadowRoot) => {
    for (const element of root.querySelectorAll("*")) {
      if (protectedField(element)) {
        const field = element as HTMLInputElement;
        for (const value of [field.value, field.defaultValue, field.isContentEditable ? field.innerText : undefined])
          if (typeof value === "string" && value) secrets.add(value);
      }
      if (element.shadowRoot) scan(element.shadowRoot);
    }
  };
  scan(doc);
  const values = [...secrets].sort((a, b) => b.length - a.length);
  const redact = (text: string) => {
    for (const value of values) text = text.split(value).join("{redacted}");
    return text;
  };
  const textOf = (root: Node): string => {
    const parts: string[] = [];
    const walk = (node: Node) => {
      if (node.nodeType === 3) { const text = redact(node.nodeValue ?? "").replace(/\s+/g, " ").trim(); if (text) parts.push(text); return; }
      if (node.nodeType === 1) {
        const element = node as Element;
        if (["style", "script", "template", "noscript"].includes(element.tagName.toLowerCase())) return;
        if (protectedField(element)) { if ((element as HTMLInputElement).value || element.textContent) parts.push("{redacted}"); return; }
      }
      node.childNodes.forEach(walk);
      if (node.nodeType === 1 && (node as Element).shadowRoot) walk((node as Element).shadowRoot!);
    };
    walk(root);
    return parts.join(" ").trim();
  };
  if (elements === null) {
    const base = redact(doc.body?.innerText ?? "");
    const chunks: string[] = [];
    const visit = (root: Element) => {
      for (const element of [root, ...root.querySelectorAll("*")]) {
        if (element.shadowRoot) {
          // textOf already traverses nested open shadow roots.
          const text = textOf(element.shadowRoot).slice(0, 400);
          if (text) chunks.push(text);
        }
      }
    };
    visit(doc.body ?? doc.documentElement);
    return [(chunks.length ? `— shadow DOM —\n${chunks.join("\n")}\n\n${base}` : base).slice(0, 4000)];
  }
  return elements.map(element => {
    if (!attribute) return textOf(element);
    const value = element.getAttribute(attribute);
    if (value === null) return null;
    if (attribute.toLowerCase() === "value" && protectedField(element)) return value ? "{redacted}" : "";
    return redact(value);
  });
}
