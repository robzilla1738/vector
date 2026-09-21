export type BookmarkFileEntry = { url: string; title: string; folderPath?: string[] };
export const MAX_BOOKMARK_FILE_SIZE = 5_000_000;

export function bookmarkWebUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && value.length <= 8192 ? url.href : null;
  } catch { return null; }
}

type BookmarkNode = { nodeName: string; value?: string; attrs?: { name: string; value: string }[]; childNodes?: BookmarkNode[] };

function nodeText(node: BookmarkNode): string {
  const pending = [node];
  let text = '';
  while (pending.length) {
    const item = pending.pop()!;
    if (item.nodeName === '#text') text += item.value ?? '';
    else if (!['script', 'style', 'template'].includes(item.nodeName)) pending.push(...[...(item.childNodes ?? [])].reverse());
  }
  return text.replace(/\s+/g, ' ').trim();
}

/** parse5 reads bookmark exports without executing markup or requesting their URLs. */
export async function parseBookmarkFile(source: string) {
  if (new TextEncoder().encode(source).length > MAX_BOOKMARK_FILE_SIZE) throw new Error('Choose a bookmark HTML file smaller than 5 MB.');
  const { parse } = await import('parse5');
  const pending: { node: BookmarkNode; path: string[] }[] = [{ node: parse(source), path: [] }];
  const bookmarks: BookmarkFileEntry[] = [];
  const folders = new Map<string, string[]>();
  const seen = new Set<string>();
  let skipped = 0;
  while (pending.length) {
    const { node, path } = pending.pop()!;
    if (['script', 'style', 'template'].includes(node.nodeName)) continue;
    if (node.nodeName === 'a') {
      const href = node.attrs?.find(attr => attr.name === 'href')?.value ?? '';
      const url = bookmarkWebUrl(href);
      if (!url || seen.has(url)) { skipped++; continue; }
      seen.add(url);
      bookmarks.push({ url, title: nodeText(node).slice(0, 1000) || new URL(url).hostname, ...(path.length ? { folderPath: path } : {}) });
      if (bookmarks.length > 10000) throw new Error('Import up to 10,000 bookmarks at a time.');
      continue;
    }
    let heading = '';
    const children: typeof pending = [];
    for (const child of node.childNodes ?? []) {
      if (child.nodeName === 'h3') heading = nodeText(child).slice(0, 200);
      if (child.nodeName === 'dt') {
        const title = child.childNodes?.find(item => item.nodeName === 'h3');
        heading = title ? nodeText(title).slice(0, 200) : '';
      }
      const childPath = child.nodeName === 'dl' && heading ? [...path, heading] : path;
      if (childPath.length > 32) throw new Error('Bookmark folders can be nested up to 32 levels.');
      if (child.nodeName === 'dl' && heading) {
        folders.set(JSON.stringify(childPath), childPath);
        if (folders.size > 10000) throw new Error('Import up to 10,000 bookmark folders at a time.');
        heading = '';
      }
      children.push({ node: child, path: childPath });
    }
    pending.push(...children.reverse());
  }
  if (!bookmarks.length && !folders.size) throw new Error('No supported web bookmarks found. Choose an HTML bookmark export from your browser.');
  return { bookmarks, folders: [...folders.values()], skipped };
}

export function exportBookmarkFile(bookmarks: BookmarkFileEntry[], folders: string[][] = []): string {
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
  type Folder = { children: Map<string, Folder>; bookmarks: BookmarkFileEntry[] };
  const root: Folder = { children: new Map(), bookmarks: [] };
  const folderAt = (path: string[]) => {
    let folder = root;
    for (const part of path) {
      let child = folder.children.get(part);
      if (!child) { child = { children: new Map(), bookmarks: [] }; folder.children.set(part, child); }
      folder = child;
    }
    return folder;
  };
  for (const path of folders) folderAt(path);
  for (const bookmark of bookmarks) {
    if (bookmarkWebUrl(bookmark.url)) folderAt(bookmark.folderPath ?? []).bookmarks.push(bookmark);
  }
  const render = (folder: Folder, depth: number): string => {
    const indent = '  '.repeat(depth);
    return [...folder.children].map(([name, child]) => `${indent}<DT><H3>${escape(name)}</H3>\n${indent}<DL><p>\n${render(child, depth + 1)}${indent}</DL><p>\n`).join('')
      + folder.bookmarks.map(bookmark => `${indent}<DT><A HREF="${escape(bookmark.url)}">${escape(bookmark.title)}</A>\n`).join('');
  };
  return '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Aux Bookmarks</TITLE>\n<H1>Aux Bookmarks</H1>\n<DL><p>\n' + render(root, 1) + '</DL><p>\n';
}
