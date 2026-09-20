export type BookmarkFileEntry = { url: string; title: string };
export const MAX_BOOKMARK_FILE_SIZE = 5_000_000;

export function bookmarkWebUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && value.length <= 8192 ? url.href : null;
  } catch { return null; }
}

/** Parse data without creating browser DOM nodes, running scripts or loading URLs. */
export async function parseBookmarkFile(source: string) {
  if (new TextEncoder().encode(source).length > MAX_BOOKMARK_FILE_SIZE) throw new Error('Choose a bookmark HTML file smaller than 5 MB.');
  const { parse } = await import('parse5');
  type Node = { nodeName: string; value?: string; attrs?: { name: string; value: string }[]; childNodes?: Node[] };
  const pending: Node[] = [parse(source)];
  const bookmarks: BookmarkFileEntry[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  while (pending.length) {
    const node = pending.pop()!;
    if (node.nodeName === 'a') {
      const href = node.attrs?.find(attr => attr.name === 'href')?.value ?? '';
      const url = bookmarkWebUrl(href);
      if (!url || seen.has(url)) { skipped++; continue; }
      const texts = [...(node.childNodes ?? [])].reverse();
      let title = '';
      while (texts.length) {
        const text = texts.pop()!;
        if (text.nodeName === '#text') title += text.value ?? '';
        else if (!['script','style'].includes(text.nodeName)) texts.push(...[...(text.childNodes ?? [])].reverse());
      }
      seen.add(url);
      bookmarks.push({ url, title: title.replace(/\s+/g, ' ').trim().slice(0,1000) || new URL(url).hostname });
      if (bookmarks.length > 10000) throw new Error('Import up to 10,000 bookmarks at a time.');
    } else if (!['script','style','template'].includes(node.nodeName)) pending.push(...[...(node.childNodes ?? [])].reverse());
  }
  if (!bookmarks.length) throw new Error('No supported web bookmarks found. Choose an HTML bookmark export from your browser.');
  return { bookmarks, skipped };
}

export function exportBookmarkFile(bookmarks: BookmarkFileEntry[]): string {
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
  return '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Aux Bookmarks</TITLE>\n<H1>Aux Bookmarks</H1>\n<DL><p>\n' + bookmarks.filter(bookmark => bookmarkWebUrl(bookmark.url)).map(bookmark => `  <DT><A HREF="${escape(bookmark.url)}">${escape(bookmark.title)}</A>`).join('\n') + '\n</DL><p>\n';
}
