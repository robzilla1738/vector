const elements = new Map<string, HTMLElement>();
let snapshotUrl = '';
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    sender.id !== chrome.runtime.id ||
    !message ||
    typeof message !== 'object'
  )
    return;
  const request = message as {
    type?: string;
    documentUrl?: string;
    action?: {
      kind: string;
      ref?: string;
      text?: string;
      x?: number;
      y?: number;
    };
  };
  if (request.type === 'aux.snapshot') {
    elements.clear();
    snapshotUrl = location.href;
    const nodes: { ref: string; role: string; name: string }[] = [];
    for (const element of document.querySelectorAll<HTMLElement>(
      'a[href],button,input:not([type=password]),textarea,select,[role=button],[contenteditable=true]',
    )) {
      if (!element.checkVisibility()) continue;
      const ref = `element-${nodes.length + 1}`;
      elements.set(ref, element);
      nodes.push({
        ref,
        role: element.getAttribute('role') ?? element.tagName.toLowerCase(),
        name: (
          element.getAttribute('aria-label') ??
          element.innerText ??
          ''
        ).slice(0, 300),
      });
      if (nodes.length >= 1000) break;
    }
    respond({
      url: location.href,
      documentUrl: location.href,
      title: document.title,
      selection: getSelection()?.toString() ?? '',
      text: document.body.innerText.slice(0, 100000),
      elements: nodes,
    });
    return;
  }
  if (request.type !== 'aux.action') return;
  try {
    if (
      snapshotUrl !== location.href ||
      (request.documentUrl && request.documentUrl !== location.href)
    )
      throw new Error('The page changed. Read it again before acting.');
    const action = request.action;
    if (!action) throw new Error('An action is required.');
    if (action.kind === 'scroll') {
      scrollBy({
        left: Number(action.x ?? 0),
        top: Number(action.y ?? 500),
        behavior: 'instant',
      });
      respond({ ok: true });
      return;
    }
    const element = elements.get(action.ref ?? '');
    if (!element?.isConnected)
      throw new Error('The target changed. Read this page again.');
    if (action.kind === 'click') {
      element.click();
    } else if (action.kind === 'fill') {
      if (
        !(
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement
        )
      )
        throw new Error('The target is not a text field.');
      if (element instanceof HTMLInputElement && element.type === 'password')
        throw new Error(
          'Use the authorized Vault fill action for password fields.',
        );
      const setter = Object.getOwnPropertyDescriptor(
        element instanceof HTMLInputElement
          ? HTMLInputElement.prototype
          : HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      if (!setter) throw new Error('The field cannot be changed.');
      setter.call(element, action.text ?? '');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else throw new Error('This page action is not permitted.');
    respond({ ok: true });
  } catch (error) {
    respond({
      error: error instanceof Error ? error.message : 'The page action failed.',
    });
  }
});
