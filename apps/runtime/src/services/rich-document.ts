import type { GeneratedResultSpec } from "@aux/contracts";
import { parseAnswerMarkdown } from "@aux/contracts/conversation-reply-text";
import type { IParagraphOptions, IRunOptions, ParagraphChild } from "docx";

type Block = ReturnType<typeof parseAnswerMarkdown>["children"][number];
type Inline = Extract<Block, { type: "paragraph" }>["children"][number];

/** Editable Word content from the same inert Markdown used for conversation answers. */
export async function renderDocument(spec: Extract<GeneratedResultSpec, { kind: "docx" }>) {
  const {
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    ExternalHyperlink,
    LevelFormat,
    AlignmentType,
    BorderStyle,
    WidthType,
  } = await import("docx");
  const tree = parseAnswerMarkdown(spec.paragraphs.join("\n\n"));
  const definitions = new Map(
    tree.children.flatMap((node) => (node.type === "definition" ? [[node.identifier, node.url]] : [])),
  );
  const link = (url: string, children: ParagraphChild[]): ParagraphChild[] => {
    try {
      const target = new URL(url);
      if (["https:", "http:"].includes(target.protocol) && !target.username && !target.password)
        return [new ExternalHyperlink({ link: target.href, children })];
    } catch {
      /* Local and unsupported targets remain readable text. */
    }
    return children;
  };
  const inline = (nodes: readonly Inline[], style: IRunOptions = {}): ParagraphChild[] =>
    nodes.flatMap((node): ParagraphChild[] => {
      switch (node.type) {
        case "text":
          return [new TextRun({ ...style, text: node.value })];
        case "strong":
          return inline(node.children, { ...style, bold: true });
        case "emphasis":
          return inline(node.children, { ...style, italics: true });
        case "delete":
          return inline(node.children, { ...style, strike: true });
        case "inlineCode":
          return [new TextRun({ ...style, text: node.value, font: "Consolas" })];
        case "break":
          return [new TextRun({ ...style, break: 1 })];
        case "link":
          return link(node.url, inline(node.children, { ...style, color: "315B85", underline: {} }));
        case "linkReference":
          return link(definitions.get(node.identifier) ?? "", inline(node.children, style));
        case "image":
        case "imageReference":
          return [new TextRun({ ...style, text: node.alt ? `Image: ${node.alt}` : "Image" })];
        default:
          return [];
      }
    });
  const numbering: NonNullable<ConstructorParameters<typeof Document>[0]["numbering"]>["config"][number][] =
    [];
  const headings = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4,
    HeadingLevel.HEADING_5,
    HeadingLevel.HEADING_6,
  ];
  const table = (rows: ParagraphChild[][][]) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (cells, index) =>
          new TableRow({
            tableHeader: index === 0,
            children: cells.map((children) => new TableCell({ children: [new Paragraph({ children })] })),
          }),
      ),
    });
  const blocks = (
    nodes: readonly Block[],
    options: IParagraphOptions = {},
    depth = 0,
  ): (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] =>
    nodes.flatMap((node) => {
      switch (node.type) {
        case "paragraph":
          return [new Paragraph({ ...options, children: inline(node.children) })];
        case "heading":
          return [
            new Paragraph({ ...options, heading: headings[node.depth - 1], children: inline(node.children) }),
          ];
        case "code":
          return node.value
            .split("\n")
            .map(
              (text) =>
                new Paragraph({
                  ...options,
                  spacing: { after: 0, line: 240 },
                  shading: { fill: "F3F4F6" },
                  children: [new TextRun({ text, font: "Consolas", size: 20 })],
                }),
            );
        case "blockquote":
          return blocks(
            node.children,
            {
              ...options,
              indent: { left: 360 },
              border: { left: { color: "C7CDD4", style: BorderStyle.SINGLE, size: 12, space: 8 } },
            },
            depth,
          );
        case "thematicBreak":
          return [
            new Paragraph({ border: { bottom: { color: "C7CDD4", style: BorderStyle.SINGLE, size: 6 } } }),
          ];
        case "table":
          return [
            table(
              node.children.map((row, index) =>
                row.children.map((cell) => inline(cell.children, { bold: index === 0 })),
              ),
            ),
          ];
        case "list": {
          const reference = `list-${numbering.length}`;
          if (node.ordered)
            numbering.push({
              reference,
              levels: [
                {
                  level: 0,
                  format: LevelFormat.DECIMAL,
                  text: "%1.",
                  start: node.start ?? 1,
                  alignment: AlignmentType.LEFT,
                  style: { paragraph: { indent: { left: 360 * (depth + 1), hanging: 240 } } },
                },
              ],
            });
          return node.children.flatMap((item) =>
            item.children.flatMap((child, index) =>
              blocks(
                [child],
                index === 0
                  ? {
                      ...options,
                      ...(node.ordered
                        ? { numbering: { reference, level: 0 } }
                        : { bullet: { level: Math.min(depth, 8) } }),
                    }
                  : { indent: { left: 360 * (depth + 1) } },
                depth + 1,
              ),
            ),
          );
        }
        default:
          return [];
      }
    });
  const children = [
    new Paragraph({ text: spec.title, heading: HeadingLevel.TITLE }),
    ...blocks(tree.children),
  ];
  for (const source of spec.tables)
    children.push(
      new Paragraph({ text: source.name, heading: HeadingLevel.HEADING_2 }),
      table(
        source.rows.map((row, index) =>
          row.map((value) => [new TextRun({ text: value === null ? "" : String(value), bold: index === 0 })]),
        ),
      ),
    );
  return Buffer.from(
    await Packer.toBuffer(
      new Document({
        creator: "Aux",
        title: spec.title,
        styles: {
          default: {
            document: {
              run: { font: "Calibri", size: 22, color: "243344" },
              paragraph: { spacing: { after: 160, line: 276 } },
            },
          },
        },
        numbering: { config: numbering },
        sections: [{ children }],
      }),
    ),
  );
}
