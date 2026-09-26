/** Local heading targets: no global IDs that could collide across conversation turns. */
type MarkdownNode = {
  type: string;
  value?: string;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown>; [key: string]: unknown };
};
const textOf = (node: MarkdownNode): string => node.value ?? node.children?.map(textOf).join("") ?? "";

export function answerHeadings() {
  return (tree: MarkdownNode) => {
    const used = new Set<string>();
    function visit(node: MarkdownNode) {
      if (node.type === "heading") {
        const base = textOf(node).toLowerCase().trim().replace(/[^\p{L}\p{N}\p{M}_\s-]/gu, "").replace(/\s/g, "-") || "section";
        let slug = base, suffix = 0;
        while (used.has(slug)) slug = `${base}-${++suffix}`;
        used.add(slug);
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, "data-answer-heading": slug, tabIndex: -1 } };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

export function answerFragment(href: string): string {
  try { return decodeURIComponent(href.slice(1)); } catch { return href.slice(1); }
}
