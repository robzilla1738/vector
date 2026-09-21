import type { ReaderNode } from "./bridge";
export type ReaderSection = {id: string; title: string; level: number};
export const readerSectionId = (key: string) => `reader-section-${key}`;
export function readerOutline(node: ReaderNode): ReaderSection[] {
  const sections: ReaderSection[] = [];
  function text(node: ReaderNode): string { return typeof node === "string" ? node : node.children.map(text).join(""); }
  function visit(node: ReaderNode, key: string) {
    if (typeof node === "string") return;
    if (/^h[1-6]$/.test(node.tag)) {
      const title = text(node).replace(/\s+/g, " ").trim();
      if (title) sections.push({id: readerSectionId(key), title, level: Number(node.tag[1])});
    }
    node.children.forEach((child, index) => visit(child, `${key}-${index}`));
  }
  visit(node, "article"); return sections;
}
