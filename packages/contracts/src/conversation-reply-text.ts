import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import type { Run } from "./entities.js";
import { conversationReply } from "./conversation-search.js";

export const parseAnswerMarkdown = (source: string): ReturnType<typeof fromMarkdown> =>
  fromMarkdown(source, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });

/** Visible CommonMark/GFM text, excluding link targets and reference definitions. */
export function conversationReplyText(run: Run): string {
  const reply = conversationReply(run);
  if (!reply) return "";
  const tree = parseAnswerMarkdown(reply);
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
