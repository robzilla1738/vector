import { toMarkdown } from "mdast-util-to-markdown";
import { gfmToMarkdown } from "mdast-util-gfm";
import { parseAnswerMarkdown } from "./conversation-reply-text.js";

/** Portable answer Markdown follows the visible renderer: no raw HTML, remote images, or active links. */
export function visibleAnswerMarkdown(source: string): string {
  const tree = parseAnswerMarkdown(source);
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
