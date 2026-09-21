class TextSurfaceFinder {
  constructor(private surface: "conversation" | "reader", private scrollSelector: string) {}
  private get matchesKey() { return `aux-${this.surface}-matches`; }
  private get activeKey() { return `aux-${this.surface}-active`; }
  private root: HTMLElement | null = null;
  private query = '';
  private active = -1;

  clear() {
    globalThis.CSS?.highlights?.delete(this.matchesKey);
    globalThis.CSS?.highlights?.delete(this.activeKey);
    this.root = null; this.query = ''; this.active = -1;
  }

  find(query: string, next = false, forward = true, reveal = true) {
    const root = [...document.querySelectorAll<HTMLElement>(`[data-find-surface="${this.surface}"]`)]
      .find(element => !element.closest('[inert], [aria-hidden="true"]') && element.getClientRects().length > 0);
    if (!root || !query) { this.clear(); return {matches:0}; }
    if (!globalThis.CSS?.highlights || typeof Highlight === 'undefined') throw new Error('Text highlighting is not supported by this browser.');
    const previous = this.root === root && this.query === query ? this.active : -1;
    const segments: {node:Text; start:number; end:number}[] = [];
    let text = '', block: Element | null = null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode(node) {
      const parent = node.parentElement;
      return parent && !parent.closest('button, input, textarea, select, script, style, [aria-hidden="true"], [inert]') && parent.getClientRects().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }});
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const current = node.parentElement?.closest('p,li,pre,h1,h2,h3,h4,h5,h6,td,th,blockquote,.user-message') ?? node.parentElement;
      if (current !== block && text) text += '\n';
      block = current;
      const start = text.length;
      text += node.data;
      segments.push({node,start,end:text.length});
    }
    const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'giu');
    const ranges: Range[] = [];
    let cursor = 0;
    for (const match of text.matchAll(expression)) {
      const start = match.index, end = start + match[0].length;
      while (segments[cursor] && segments[cursor]!.end <= start) cursor++;
      const first = segments[cursor];
      let lastIndex = cursor;
      while (segments[lastIndex] && segments[lastIndex]!.end < end) lastIndex++;
      const last = segments[lastIndex];
      if (!first || !last || start < first.start || end > last.end) continue;
      const range = new Range();
      range.setStart(first.node,start-first.start); range.setEnd(last.node,end-last.start);
      ranges.push(range);
    }
    this.root = root; this.query = query;
    this.active = !ranges.length ? -1 : previous < 0 ? (forward ? 0 : ranges.length-1) : (Math.min(previous,ranges.length-1)+(next ? forward ? 1 : -1 : 0)+ranges.length)%ranges.length;
    CSS.highlights.set(this.matchesKey,new Highlight(...ranges));
    CSS.highlights.delete(this.activeKey);
    const active = ranges[this.active];
    if (active) {
      CSS.highlights.set(this.activeKey,new Highlight(active));
      const scroll = root.closest<HTMLElement>(this.scrollSelector);
      if (scroll && reveal) {
        const bounds = active.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
        scroll.scrollTop += bounds.top-viewport.top-viewport.height/2+bounds.height/2;
      }
    }
    return {matches:ranges.length,activeMatch:this.active+1};
  }
}

export const conversationFinder = new TextSurfaceFinder("conversation", ".conversation-scroll");
export const readerFinder = new TextSurfaceFinder("reader", ".reader-scroll");
