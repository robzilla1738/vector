import { useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const parser = unified().use(remarkParse).use(remarkGfm);
type TextNode = { type: string; value?: string; alt?: string | null; children?: TextNode[] };
const blocks = new Set(["root", "blockquote", "list", "listItem", "table", "tableRow", "tableCell"]);
function nodeText(node: TextNode): string {
  if (["html", "definition", "footnoteDefinition"].includes(node.type)) return "";
  if (node.type === "break") return " ";
  if (node.type === "image" || node.type === "imageReference") return node.alt ?? "";
  if (node.children) return node.children.map(nodeText).join(blocks.has(node.type) ? " " : "");
  return node.value ?? "";
}

/** A bounded list teaser from the same Markdown grammar as the rich answer. */
export function markdownPreviewText(text: string): string {
  return nodeText(parser.parse(text.slice(0, 4096)))
    .replace(/\s+/g, " ")
    .trim();
}

export function PlainAnswerText({ text }: { text: string }) {
  return useMemo(() => markdownPreviewText(text), [text]);
}
