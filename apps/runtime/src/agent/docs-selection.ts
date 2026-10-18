/** Fixed read-only producer. No export/REST range, clipboard, editor toggles or page writes. */
export function readDocsSelectionInPage(input: { expectedUrl: string }) {
  const unsupported = (reason: string) => ({ ok: false as const, reason });
  if (location.href !== input.expectedUrl) return unsupported("document-changed");
  const topUrl = new URL(location.href);
  const documentId = /^\/document\/d\/([A-Za-z0-9_-]{20,200})(?:\/|$)/.exec(topUrl.pathname)?.[1];
  if (topUrl.origin !== "https://docs.google.com" || !documentId || topUrl.username || topUrl.password)
    return unsupported("unsupported-document");
  let current: Document = document;
  const framePath: number[] = [];
  const visible = (element: Element): boolean => {
    const view = element.ownerDocument.defaultView;
    if (
      !view ||
      !element.isConnected ||
      element.closest(
        '[hidden],[inert],[aria-hidden="true"],[data-aux-private],[data-private],[data-sensitive]',
      )
    )
      return false;
    let ancestors = 0;
    for (let item: Element | null = element; item; item = item.parentElement) {
      if (++ancestors > 64) return false;
      const style = view.getComputedStyle(item);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse" ||
        style.opacity === "0"
      )
        return false;
    }
    return element.getClientRects().length > 0;
  };
  for (let depth = 0; ; depth++) {
    const active = current.activeElement;
    if (!active || active.tagName !== "IFRAME") break;
    if (depth >= 4 || !visible(active)) return unsupported("hidden-or-deep-editor-frame");
    const children = current.defaultView?.frames;
    if (!children || children.length > 128) return unsupported("too-many-editor-frames");
    let index = -1;
    for (let child = 0; child < children.length; child++)
      if (children[child] === (active as HTMLIFrameElement).contentWindow) {
        index = child;
        break;
      }
    try {
      const frame = active as HTMLIFrameElement,
        child = frame.contentDocument;
      if (!child?.defaultView || child.defaultView.location.origin !== topUrl.origin || index < 0)
        return unsupported("foreign-editor-frame");
      const nestedId = /^\/document\/d\/([A-Za-z0-9_-]{20,200})(?:\/|$)/.exec(
        child.defaultView.location.pathname,
      )?.[1];
      if (nestedId !== documentId) return unsupported("foreign-document-frame");
      framePath.push(index);
      current = child;
    } catch {
      return unsupported("foreign-editor-frame");
    }
  }
  const view = current.defaultView,
    selection = view?.getSelection();
  if (!view || !selection || selection.rangeCount !== 1 || !selection.anchorNode || !selection.focusNode)
    return unsupported("canvas-or-selection-unavailable");
  const range = selection.getRangeAt(0),
    element =
      range.startContainer.nodeType === 1
        ? (range.startContainer as Element)
        : range.startContainer.parentElement;
  const root = element?.closest('[role="document"]');
  if (
    !root ||
    !root.closest('main,[role="main"],[role="application"]') ||
    !visible(root) ||
    !root.contains(range.endContainer)
  )
    return unsupported("no-accessible-document-selection");
  if (
    root.closest(
      'dialog,[role="dialog"],[role="toolbar"],nav,[role="navigation"],header,aside,[role="complementary"]',
    ) ||
    root.matches("input,textarea,canvas,script,style")
  )
    return unsupported("toolbar-comment-or-hidden-editor-buffer");
  const forbidden =
    'dialog,[role="dialog"],[role="toolbar"],nav,[role="navigation"],aside,[role="complementary"],[role="comment"],[data-comment-id],[role="textbox"]';
  if (element?.closest(forbidden) || range.endContainer.parentElement?.closest(forbidden))
    return unsupported("toolbar-comment-or-hidden-editor-buffer");
  const active = current.activeElement;
  if (active !== root && !root.contains(active)) return unsupported("document-editor-not-focused");
  const editor = element?.closest("[contenteditable]");
  const editable = ["true", "plaintext-only", ""].includes(
    editor?.getAttribute("contenteditable") ?? "false",
  );
  if (selection.isCollapsed && !editable) return unsupported("caret-unavailable");
  let rootText = "",
    visited = 0;
  const walker = current.createTreeWalker(root, 5);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (
      ++visited > 6000 ||
      !node.parentElement ||
      !visible(node.nodeType === 1 ? (node as Element) : node.parentElement)
    )
      return unsupported("hidden-or-large-document-root");
    if (
      node.nodeType === 1 &&
      (node as Element).matches("input,textarea,canvas,script,style,[data-private],[data-sensitive]")
    )
      return unsupported("toolbar-comment-or-hidden-editor-buffer");
    if (node.nodeType === 3) rootText += node.nodeValue ?? "";
    if (rootText.length > 20_000) return unsupported("document-root-too-large");
  }
  for (let index = 0; index < rootText.length; index++) {
    const code = rootText.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = rootText.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return unsupported("invalid-document-unicode");
    } else if (code >= 0xdc00 && code <= 0xdfff) return unsupported("invalid-document-unicode");
  }
  const prefix = range.cloneRange();
  prefix.selectNodeContents(root);
  prefix.setEnd(range.startContainer, range.startOffset);
  const start = prefix.toString().length,
    text = range.toString(),
    end = start + text.length;
  if ((!selection.isCollapsed && !text) || text.length > 8000 || rootText.slice(start, end) !== text)
    return unsupported("selection-text-unavailable");
  const boundary = (index: number) =>
    !(
      index > 0 &&
      index < rootText.length &&
      rootText.charCodeAt(index - 1) >= 0xd800 &&
      rootText.charCodeAt(index - 1) <= 0xdbff &&
      rootText.charCodeAt(index) >= 0xdc00 &&
      rootText.charCodeAt(index) <= 0xdfff
    );
  if (!boundary(start) || !boundary(end)) return unsupported("unicode-boundary");
  let beforeStart = Math.max(0, start - 256),
    afterEnd = Math.min(rootText.length, end + 256);
  if (!boundary(beforeStart)) beforeStart++;
  if (!boundary(afterEnd)) afterEnd--;
  const rootPath: number[] = [];
  let cursor: Node = root;
  while (cursor !== current.documentElement) {
    if (!cursor.parentNode || rootPath.length >= 64) return unsupported("document-root-unavailable");
    rootPath.unshift(Array.prototype.indexOf.call(cursor.parentNode.childNodes, cursor) as number);
    cursor = cursor.parentNode;
  }
  const forward =
    selection.anchorNode === range.startContainer && selection.anchorOffset === range.startOffset;
  return {
    ok: true as const,
    text,
    rootText,
    selection: {
      basis: "live-dom-root-utf16" as const,
      mode: selection.isCollapsed ? ("caret" as const) : ("range" as const),
      documentId,
      framePath,
      frameUrl: current === document ? input.expectedUrl : current.URL,
      rootPath,
      rootTextLength: rootText.length,
      start,
      end,
      direction: selection.isCollapsed
        ? ("none" as const)
        : forward
          ? ("forward" as const)
          : ("backward" as const),
      before: rootText.slice(beforeStart, start),
      after: rootText.slice(end, afterEnd),
    },
  };
}
