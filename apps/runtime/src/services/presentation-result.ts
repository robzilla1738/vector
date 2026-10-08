import type { GeneratedResult, GeneratedResultSpec } from "@aux/contracts";
import type PptxGenJS from "pptxgenjs";

// The library wraps at spaces; URLs and unspaced scripts also need break opportunities.
function wrapLongWords(text: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return text.replace(/\S{29,}/gu, (word) => {
    const letters = [...segmenter.segment(word)].map((part) => part.segment);
    return letters.map((letter, index) => (index && index % 28 === 0 ? "\n" : "") + letter).join("");
  });
}

export async function renderPresentation(spec: Extract<GeneratedResultSpec, { kind: "pptx" }>) {
  const pptxgen = (await import("pptxgenjs")).default;
  // PptxGenJS 4 declares a namespace default in NodeNext, while its ESM default is a constructor.
  // @ts-expect-error Upstream declaration does not model the NodeNext default export.
  const deck: InstanceType<typeof PptxGenJS.default> = new pptxgen();
  deck.author = "Aux";
  deck.subject = "Generated result";
  deck.title = spec.slides[0]?.title ?? "Presentation";
  deck.layout = "LAYOUT_WIDE";
  let count = 0;
  const lines: string[] = [];
  for (const [section, source] of spec.slides.entries()) {
    const slide = deck.addSlide();
    const rows: PptxGenJS.default.TableRow[] = [
      [
        {
          text: wrapLongWords(source.title),
          options: { fontSize: 28, bold: true, color: "26395A", margin: [8, 8, 14, 8] },
        },
      ],
      ...source.bullets.map((text): PptxGenJS.default.TableRow => [
        {
          text: wrapLongWords(text),
          options: { bullet: { indent: 18 }, fontSize: 18, margin: [6, 8, 6, 8] },
        },
      ]),
    ];
    // `fit: shrink` only runs after a person edits in PowerPoint. Auto-paging lays out
    // editable rows before export, keeping the actual font size and every text run.
    const layout: PptxGenJS.default.TableToSlidesProps = {
      x: 0.8,
      y: 0.55,
      w: 11.7,
      autoPage: true,
      autoPageSlideStartY: 0.55,
      slideMargin: [0.55, 0.8, 0.75, 0.8],
      autoPageCharWeight: -0.5,
      autoPageLineWeight: 0.35,
      fontFace: "Arial",
      fontSize: 18,
      color: "30435F",
      margin: [6, 8, 6, 8],
      border: { type: "none" },
      fill: { color: "F6F8FC" },
      valign: "top",
    };
    slide.addTable(rows, layout);
    const pages = [slide, ...slide.newAutoPagedSlides];
    const start = count + 1;
    for (const [part, page] of pages.entries()) {
      page.background = { color: "F6F8FC" };
      page.addText(`Section ${section + 1} · ${part + 1}/${pages.length}`, {
        x: 0.9,
        y: 7.05,
        w: 11.5,
        h: 0.2,
        margin: 0,
        fontSize: 10,
        color: "62758B",
        align: "right",
      });
    }
    if (source.notes) slide.addNotes(source.notes);
    count += pages.length;
    lines.push(`${start === count ? start : `${start}–${count}`}. ${source.title}`);
  }
  const preview: GeneratedResult["preview"] = {
    title: `${count} slide${count === 1 ? "" : "s"}`,
    lines: lines.slice(0, 24),
  };
  return { buffer: Buffer.from((await deck.write({ outputType: "nodebuffer" })) as Buffer), preview };
}
