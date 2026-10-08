import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import type { Run } from "./entities.js";
import { conversationReply } from "./conversation-search.js";

/** Visible CommonMark/GFM text, excluding link targets and reference definitions. */
export function conversationReplyText(run: Run): string {
  const reply = conversationReply(run);
  if (!reply) return "";
  const tree = fromMarkdown(reply, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
  type Node = { type: string; value?: string; alt?: string | null; children?: Node[] };
  const inline = new Set([
    "paragraph",
    "heading",
    "emphasis",
    "strong",
    "delete",
    "link",
    "linkReference",
    "tableCell",
  ]);
  const text = (node: Node): string => {
    if (["definition", "html", "footnoteReference"].includes(node.type)) return "";
    if (node.type === "image" || node.type === "imageReference")
      return node.alt ? `Image: ${node.alt}` : "Image";
    if (node.type === "root") {
      const children = node.children ?? [];
      return [
        ...children.filter((child) => child.type !== "footnoteDefinition"),
        ...children.filter((child) => child.type === "footnoteDefinition"),
      ]
        .map(text)
        .join("\n");
    }
    if (node.value !== undefined) return node.value;
    return node.children?.map(text).join(inline.has(node.type) ? "" : "\n") ?? "";
  };
  return text(tree);
}

/** Portable answer Markdown follows the visible renderer: no raw HTML, remote images, or active links. */
export function visibleAnswerMarkdown(source: string): string {
  const tree = fromMarkdown(source, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
  const safeUrl = (value: string) => {
    if (value.startsWith("#")) return true;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  };
  type Node = { type: string; value?: string; url?: string; alt?: string | null; children?: Node[] };
  const visit = (node: Node): Node[] => {
    if (node.type === "html") return [];
    if (node.type === "image" || node.type === "imageReference")
      return [{ type: "text", value: node.alt ? `Image: ${node.alt}` : "Image" }];
    if (node.children) node.children = node.children.flatMap(visit);
    if (node.url !== undefined && !safeUrl(node.url))
      return node.type === "link" ? (node.children ?? []) : [];
    return [node];
  };
  visit(tree);
  return toMarkdown(tree, { extensions: [gfmToMarkdown()], bullet: "-", fences: true }).trimEnd();
}
