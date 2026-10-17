import type { DefaultTreeAdapterMap } from "parse5";
import type { BookmarkFolderSnapshot } from "@aux/contracts/bookmark-folder-methods";
export type BookmarkFileEntry = { url: string; title: string; folderPath?: string[] };
export const MAX_BOOKMARK_FILE_SIZE = 5_000_000;

export function bookmarkWebUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      value.length <= 8192
      ? url.href
      : null;
  } catch {
    return null;
  }
}

type ParsedNode = DefaultTreeAdapterMap["node"];
const childrenOf = (node: ParsedNode): ParsedNode[] => ("childNodes" in node ? node.childNodes : []);

function nodeText(node: ParsedNode): string {
  const pending = [node];
  let text = "";
  while (pending.length) {
    const item = pending.pop()!;
    const name = item.nodeName.toLowerCase();
    if (name === "#text" && "value" in item) text += item.value;
    else if (!["script", "style", "template"].includes(name))
      pending.push(...childrenOf(item).slice().reverse());
  }
  return text.replace(/\s+/g, " ").trim();
}

/** Parse HTML into plain data, without DOM sinks, scripts, requests or TrustedHTML.
 * Load the parser only when the user chooses a bookmark export. */
export async function parseBookmarkFile(source: string) {
  if (new TextEncoder().encode(source).length > MAX_BOOKMARK_FILE_SIZE)
    throw new Error("Choose a bookmark HTML file smaller than 5 MB.");
  const { parseFragment } = await import("parse5");
  const pending: { node: ParsedNode; path: string[] }[] = [{ node: parseFragment(source), path: [] }];
  const bookmarks: BookmarkFileEntry[] = [];
  const folders = new Map<string, string[]>();
  const seen = new Set<string>();
  let skipped = 0;
  while (pending.length) {
    const { node, path } = pending.pop()!;
    const nodeName = node.nodeName.toLowerCase();
    if (["script", "style", "template"].includes(nodeName)) continue;
    if (nodeName === "a") {
      const href = "attrs" in node ? (node.attrs.find((attr) => attr.name === "href")?.value ?? "") : "";
      const url = bookmarkWebUrl(href);
      if (!url || seen.has(url)) {
        skipped++;
        continue;
      }
      seen.add(url);
      bookmarks.push({
        url,
        title: nodeText(node).slice(0, 1000) || new URL(url).hostname,
        ...(path.length ? { folderPath: path } : {}),
      });
      if (bookmarks.length > 10000) throw new Error("Import up to 10,000 bookmarks at a time.");
      continue;
    }
    let heading = "";
    const children: typeof pending = [];
    for (const child of childrenOf(node)) {
      const childName = child.nodeName.toLowerCase();
      if (childName === "h3") heading = nodeText(child).slice(0, 200);
      if (childName === "dt") {
        const title = childrenOf(child).find((item) => item.nodeName.toLowerCase() === "h3");
        heading = title ? nodeText(title).slice(0, 200) : "";
      }
      const childPath = childName === "dl" && heading ? [...path, heading] : path;
      if (childPath.length > 32) throw new Error("Bookmark folders can be nested up to 32 levels.");
      if (childName === "dl" && heading) {
        folders.set(JSON.stringify(childPath), childPath);
        if (folders.size > 10000) throw new Error("Import up to 10,000 bookmark folders at a time.");
        heading = "";
      }
      children.push({ node: child, path: childPath });
    }
    pending.push(...children.reverse());
  }
  if (!bookmarks.length && !folders.size)
    throw new Error("No supported web bookmarks found. Choose an HTML bookmark export from your browser.");
  return { bookmarks, folders: [...folders.values()], skipped };
}

/** Export the actual native tree, including duplicate/empty folders and browser URL schemes. */
export function exportBookmarkFile(
  bookmarks: (BookmarkFileEntry & { nodeId?: string })[],
  snapshot: BookmarkFolderSnapshot,
): string {
  const escape = (text: string) =>
    text.replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
    );
  const folders = new Map(snapshot.folders.map((folder) => [folder.nodeId, folder]));
  const entries = new Map(bookmarks.map((bookmark) => [bookmark.nodeId, bookmark]));
  const render = (id: string, depth: number): string => {
    const indent = "  ".repeat(depth);
    const folder = folders.get(id);
    if (folder)
      return `${indent}<DT><H3>${escape(folder.path.at(-1) ?? folder.title)}</H3>\n${indent}<DL><p>\n${folder.childIds.map((child) => render(child, depth + 1)).join("")}${indent}</DL><p>\n`;
    const bookmark = entries.get(id);
    return bookmark ? `${indent}<DT><A HREF="${escape(bookmark.url)}">${escape(bookmark.title)}</A>\n` : "";
  };
  const root = folders.get(snapshot.rootId);
  const roots = [
    ...(root?.childIds ?? []),
    ...snapshot.folders
      .filter((folder) => folder.permanent && folder.nodeId !== snapshot.rootId)
      .map((folder) => folder.nodeId),
  ];
  return (
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Aux Bookmarks</TITLE>\n<H1>Aux Bookmarks</H1>\n<DL><p>\n' +
    roots.map((id) => render(id, 1)).join("") +
    "</DL><p>\n"
  );
}
