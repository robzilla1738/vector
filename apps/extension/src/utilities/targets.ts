import type { Segment } from './contracts';
export interface SelectionTarget {
  id: string;
  url: string;
  text: string;
  rect: DOMRect;
  editable: boolean;
  apply: (text: string) => void;
  valid: () => boolean;
}
function safeField(field: HTMLInputElement | HTMLTextAreaElement) {
  if (
    field instanceof HTMLInputElement &&
    !['text', 'search', 'url', 'email', 'tel'].includes(field.type)
  )
    return false;
  return (
    !/password|one-time-code|cc-|credit|card|cvv|cvc|ssn|(?:^|[-_])pin(?:$|[-_])/i.test(
      `${field.autocomplete} ${field.name} ${field.id}`,
    ) && !field.closest('[data-aux-sensitive]')
  );
}
export function captureSelection(document: Document): SelectionTarget | null {
  const url = document.location.href,
    active = document.activeElement;
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement
  ) {
    if (!safeField(active)) return null;
    const start = active.selectionStart,
      end = active.selectionEnd;
    if (start === null || end === null || start === end) return null;
    const original = active.value,
      selected = original.slice(start, end);
    if (!selected.trim() || selected.length > 32000) return null;
    const valid = () =>
      active.isConnected &&
      active.ownerDocument === document &&
      document.location.href === url &&
      active.value === original &&
      safeField(active);
    return {
      id: crypto.randomUUID(),
      url,
      text: selected,
      rect: active.getBoundingClientRect(),
      editable: !active.readOnly && !active.disabled,
      valid,
      apply(text) {
        if (!valid() || active.readOnly || active.disabled)
          throw new Error(
            'The selected field changed. Copy the result instead.',
          );
        const event = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertReplacementText',
          data: text,
        });
        if (!active.dispatchEvent(event))
          throw new Error(
            'This editor refused replacement. Copy the result instead.',
          );
        if (!valid()) throw new Error('The field changed before replacement.');
        active.setRangeText(text, start, end, 'select');
        active.dispatchEvent(
          new InputEvent('input', {
            bubbles: true,
            inputType: 'insertReplacementText',
            data: text,
          }),
        );
      },
    };
  }
  const selection = document.getSelection();
  if (selection?.rangeCount !== 1 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0).cloneRange(),
    selected = range.toString();
  if (!selected.trim() || selected.length > 32000) return null;
  const node = range.startContainer,
    original = node.textContent;
  const element = node.parentElement;
  if (
    element?.closest(
      'input,textarea,select,[data-aux-sensitive],[data-aux-utility]',
    )
  )
    return null;
  const editable =
    node === range.endContainer &&
    node.nodeType === Node.TEXT_NODE &&
    !!element?.isContentEditable &&
    !element.closest('[contenteditable=false]');
  const valid = () =>
    node.isConnected &&
    node.ownerDocument === document &&
    node.parentElement === element &&
    document.location.href === url &&
    node.textContent === original &&
    range.toString() === selected;
  return {
    id: crypto.randomUUID(),
    url,
    text: selected,
    rect: range.getBoundingClientRect(),
    editable,
    valid,
    apply(text) {
      if (!editable || !valid() || !element?.isContentEditable)
        throw new Error(
          'The editable selection changed. Copy the result instead.',
        );
      if (
        !element.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertReplacementText',
            data: text,
          }),
        )
      )
        throw new Error(
          'The editor refused replacement. Copy the result instead.',
        );
      if (!valid())
        throw new Error('The selection changed before replacement.');
      (node as Text).replaceData(
        range.startOffset,
        range.endOffset - range.startOffset,
        text,
      );
      element.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          inputType: 'insertReplacementText',
          data: text,
        }),
      );
    },
  };
}
const unsafeTranslation =
  'script,style,noscript,template,form,input,textarea,select,button,option,pre,code,kbd,[contenteditable],[translate=no],[data-aux-utility],svg,math';
function safeText(node: Text) {
  return (
    node.isConnected &&
    !!node.parentElement &&
    !node.parentElement.closest(unsafeTranslation) &&
    node.parentElement.checkVisibility()
  );
}
export class TranslationTarget {
  readonly url: string;
  readonly segments: Segment[] = [];
  private nodes: {
    id: string;
    node: Text;
    original: string;
    applied?: string;
  }[] = [];
  constructor(private readonly document: Document) {
    this.url = document.location.href;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    let size = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (
        !parent ||
        parent.closest(
          'script,style,noscript,template,form,input,textarea,select,button,option,pre,code,kbd,[contenteditable],[translate=no],[data-aux-utility],svg,math',
        ) ||
        !parent.checkVisibility() ||
        !node.textContent?.trim()
      )
        continue;
      const text = node.textContent;
      size += text.length;
      if (text.length > 8000 || size > 64000 || this.nodes.length >= 400)
        throw new Error(
          'This page has too much text. Select a smaller passage to translate.',
        );
      const id = `t${this.nodes.length}`;
      this.nodes.push({ id, node: node as Text, original: text });
      this.segments.push({ id, text });
    }
    if (!this.nodes.length)
      throw new Error('This document has no safe translatable text.');
  }
  valid() {
    return (
      this.document.location.href === this.url &&
      this.nodes.every(
        (row) =>
          row.node.ownerDocument === this.document &&
          safeText(row.node) &&
          row.node.data === (row.applied ?? row.original),
      )
    );
  }
  apply(translated: Map<string, string>) {
    if (
      !this.valid() ||
      translated.size !== this.nodes.length ||
      this.nodes.some((row) => !translated.has(row.id))
    )
      throw new Error(
        'The page changed during translation. Nothing was applied.',
      );
    // Complete validation precedes a synchronous text-only commit. No HTML/form replacement.
    for (const row of this.nodes) {
      row.applied = translated.get(row.id) ?? '';
      row.node.data = row.applied;
    }
  }
  restore() {
    let restored = 0,
      skipped = 0;
    for (const row of this.nodes) {
      if (row.applied === undefined) continue;
      if (
        this.document.location.href === this.url &&
        row.node.ownerDocument === this.document &&
        safeText(row.node) &&
        row.node.data === row.applied
      ) {
        row.node.data = row.original;
        row.applied = undefined;
        restored++;
      } else skipped++;
    }
    return { restored, skipped };
  }
}
