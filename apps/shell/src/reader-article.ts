import { bridge, type ReaderArticle, type ReaderNode } from "./bridge";

const allowed = new Set([
  "div",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "a",
  "br",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "figcaption",
]);
const discarded = new Set([
  "script",
  "style",
  "template",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "svg",
  "math",
  "video",
  "audio",
]);
type ReaderPolicy = { createHTML(value: string): unknown };
let readerPolicy: ReaderPolicy | undefined;

export function normalizeReaderArticle(article: ReaderArticle): ReaderArticle {
  if (typeof article.content === "string" || article.content.tag !== "__aux_distilled_html") return article;
  const html = article.content.children[0];
  if (typeof html !== "string" || html.length > 2 * 1024 * 1024) throw new Error("Invalid Reader article");
  const trustedTypes = (
    globalThis as typeof globalThis & {
      trustedTypes?: {
        createPolicy(name: string, callbacks: { createHTML(value: string): string }): ReaderPolicy;
      };
    }
  ).trustedTypes;
  if (trustedTypes && !readerPolicy) {
    // Only the inert parser receives this HTML. Rendering uses the filtered tree below.
    readerPolicy = trustedTypes.createPolicy("aux-reader-distiller", { createHTML: (value) => value });
  }
  const document = new DOMParser().parseFromString(
    (readerPolicy?.createHTML(html) ?? html) as string,
    "text/html",
  );
  let visited = 0;
  function convert(node: Node, depth: number): ReaderNode[] {
    if (++visited > 100_000 || depth > 80) throw new Error("Reader article is too complex");
    if (node.nodeType === Node.TEXT_NODE) return [node.textContent ?? ""];
    if (!(node instanceof Element)) return [];
    const tag = node.localName.toLowerCase();
    if (discarded.has(tag)) return [];
    const children = Array.from(node.childNodes).flatMap((child) => convert(child, depth + 1));
    if (!allowed.has(tag)) return children;
    const result: Exclude<ReaderNode, string> = { tag, children };
    if (node.id) result.sourceId = node.id.slice(0, 256);
    if (tag === "a" && node.getAttribute("href")) {
      try {
        const url = new URL(node.getAttribute("href") ?? "", article.url);
        if (url.protocol === "http:" || url.protocol === "https:") result.href = url.href;
      } catch {
        /* An invalid URL stays plain text. */
      }
    }
    return [result];
  }
  const content: ReaderNode = {
    tag: "div",
    children: Array.from(document.body.childNodes).flatMap((node) => convert(node, 0)),
  };
  const text = (node: ReaderNode): string =>
    typeof node === "string" ? node : node.children.map(text).join(" ");
  const words = text(content).trim().split(/\s+/u).filter(Boolean).length;
  if (!words) throw new Error("Reader could not extract this article");
  return { ...article, content, minutes: Math.max(1, Math.ceil(words / 225)) };
}

export async function readReaderArticle(pageId: string): Promise<ReaderArticle> {
  return normalizeReaderArticle(await bridge.readArticle(pageId));
}
