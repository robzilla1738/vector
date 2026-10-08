import { expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";
import { JSDOM } from "jsdom";
import ExcelJS from "exceljs";
import { PNG } from "pngjs";
import { ArtifactStore, EventBus, openDb, Repo } from "@aux/runtime";
import { GenerateResultParamsSchema, ResultSchemas } from "@aux/contracts";
import { GeneratedResults } from "../../apps/runtime/src/services/generated-results.js";
import { SavedResults } from "../../apps/runtime/src/services/saved-results.js";

async function fixture(run: (results: GeneratedResults, files: ArtifactStore, repo: Repo) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), "aux-generated-"));
  const db = openDb(join(dir, "state.sqlite")),
    repo = new Repo(db);
  try {
    repo.saveRun({
      runId: "turn-1",
      goal: "Make a report",
      status: "completed",
      pageIds: [],
      config: { chatId: "chat-1" },
      createdAt: 1,
    });
    repo.saveRun({
      runId: "turn-2",
      goal: "Unrelated chat",
      status: "completed",
      pageIds: [],
      config: { chatId: "chat-2" },
      createdAt: 2,
    });
    const files = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
    await run(new GeneratedResults(repo, files), files, repo);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
}
const bytes = (files: ArtifactStore, id: string) => Buffer.from(files.read(id).dataBase64, "base64");

it("creates safe CSV and parseable XLSX with same-chat version lineage", async () =>
  fixture(async (results, files, repo) => {
    const csv = await results.generate({
      chatId: "chat-1",
      filename: "sales.csv",
      spec: {
        kind: "csv",
        table: {
          name: "Sales",
          rows: [
            ["Name", "Amount"],
            ['=HYPERLINK("https://evil.invalid")', 12],
          ],
        },
      },
    });
    expect(ResultSchemas["results.generate"].parse(csv)).toMatchObject({
      artifactId: csv.artifactId,
      revision: 1,
    });
    expect(bytes(files, csv.artifactId).toString("utf8")).toContain("'=HYPERLINK");
    const revision = await results.generate({
      chatId: "chat-1",
      sourceArtifactId: csv.artifactId,
      filename: "sales.csv",
      spec: {
        kind: "csv",
        table: {
          name: "Sales",
          rows: [
            ["Name", "Amount"],
            ["Revised", 15],
          ],
        },
      },
    });
    expect(revision).toMatchObject({
      revision: 2,
      rootArtifactId: csv.artifactId,
      parentArtifactId: csv.artifactId,
    });
    const history = results.versions(revision.artifactId);
    expect(ResultSchemas["results.generated.versions"].parse(history)).toHaveLength(2);
    expect(history.map((item) => item.revision)).toEqual([1, 2]);
    expect(history[0]).not.toHaveProperty("spec");
    expect(repo.getSetting("conversationArtifacts:chat-1")).toEqual([revision.artifactId]);
    expect(() =>
      new SavedResults(repo, files).saveVersion({
        chatId: "chat-1",
        sourceArtifactId: csv.artifactId,
        content: "changed",
      }),
    ).toThrow("structured source");
    await expect(
      results.generate({
        chatId: "chat-2",
        sourceArtifactId: csv.artifactId,
        filename: "stolen.csv",
        spec: { kind: "csv", table: { name: "S", rows: [["x"]] } },
      }),
    ).rejects.toThrow("unavailable");
    let latest = revision;
    for (let version = 3; version <= 21; version++)
      latest = await results.generate({
        chatId: "chat-1",
        sourceArtifactId: latest.artifactId,
        filename: "sales.csv",
        spec: revision.spec,
      });
    expect(ResultSchemas["results.generate"].parse(latest).revision).toBe(21);
    const siblings = await Promise.all(
      ["Branch A", "Branch B"].map((name) =>
        results.generate({
          chatId: "chat-1",
          sourceArtifactId: csv.artifactId,
          filename: "sales.csv",
          spec: { kind: "csv", table: { name, rows: [[name]] } },
        }),
      ),
    );
    expect(siblings.map((item) => item.revision).sort((a, b) => a - b)).toEqual([22, 23]);
    for (const [index, sibling] of siblings.entries()) {
      expect(sibling.parentArtifactId).toBe(csv.artifactId);
      expect(sibling.rootArtifactId).toBe(csv.artifactId);
      expect(bytes(files, sibling.artifactId).toString("utf8")).toContain(index ? "Branch B" : "Branch A");
    }
    expect(results.versions(latest.artifactId)).toHaveLength(23);
    repo.db
      .prepare("UPDATE result_versions SET revision=? WHERE artifact_id=?")
      .run(Number.MAX_SAFE_INTEGER, latest.artifactId);
    await expect(
      results.generate({
        chatId: "chat-1",
        sourceArtifactId: latest.artifactId,
        filename: "sales.csv",
        spec: revision.spec,
      }),
    ).rejects.toThrow("version history cannot advance safely");
    expect(results.versions(latest.artifactId)).toHaveLength(23);
    const xlsx = await results.generate({
      chatId: "chat-1",
      filename: "sales.xlsx",
      spec: {
        kind: "xlsx",
        sheets: [
          {
            name: "Sales",
            rows: [
              ["Name", "Amount"],
              ["=1+2", 42],
            ],
          },
        ],
      },
    });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(
      bytes(files, xlsx.artifactId) as unknown as Parameters<typeof workbook.xlsx.load>[0],
    );
    expect(workbook.worksheets[0]?.getCell("A2").value).toBe("=1+2");
    expect(workbook.worksheets[0]?.getCell("B2").value).toBe(42);
  }));

it("creates openable DOCX and PPTX with expected document parts", async () =>
  fixture(async (results, files) => {
    const doc = await results.generate({
      chatId: "chat-1",
      filename: "brief.docx",
      spec: {
        kind: "docx",
        title: "Quarterly brief",
        paragraphs: [
          "## Findings",
          "**Revenue rose.** See [source](https://example.test/report).",
          "1. Keep the signed-in workflow\n2. Export the report",
          "| Metric | Result |\n| --- | --- |\n| Growth | 42 |",
          "[blocked](javascript:alert) ![Chart](https://tracking.test/pixel) <script>bad()</script>",
        ],
        tables: [
          {
            name: "Summary",
            rows: [
              ["Metric", "Value"],
              ["Revenue", 42],
            ],
          },
        ],
      },
    });
    const docZip = await JSZip.loadAsync(bytes(files, doc.artifactId));
    const document = await docZip.file("word/document.xml")!.async("string");
    const relations = await docZip.file("word/_rels/document.xml.rels")!.async("string");
    expect(document).toContain("Revenue rose.");
    expect(document).toContain('w:pStyle w:val="Heading2"');
    expect(document).toContain("<w:b/>");
    expect(document).toContain("<w:tbl>");
    expect(document).toContain("<w:numPr>");
    expect(document).toContain("Image: Chart");
    expect(relations).toContain("https://example.test/report");
    expect(relations).not.toMatch(/javascript:|tracking.test/);
    expect(document).not.toContain("<script>");
    expect(docZip.file("[Content_Types].xml")).toBeTruthy();
    const deck = await results.generate({
      chatId: "chat-1",
      filename: "brief.pptx",
      spec: {
        kind: "pptx",
        slides: [{ title: "Quarterly brief", bullets: ["Revenue rose."], notes: "Source: internal report" }],
      },
    });
    const deckZip = await JSZip.loadAsync(bytes(files, deck.artifactId));
    const slide = new JSDOM(await deckZip.file("ppt/slides/slide1.xml")!.async("string"), {
      contentType: "text/xml",
    });
    expect(
      [...slide.window.document.getElementsByTagName("a:t")].map((node) => node.textContent).join(""),
    ).toContain("Revenue rose.");
    slide.window.close();
    expect(deckZip.file("ppt/presentation.xml")).toBeTruthy();
  }));

it("paginates dense presentation text at readable sizes with complete content and truthful counts", async () =>
  fixture(async (results, files) => {
    const title = "Research findings: " + "a clear comparison of the original sources ".repeat(4);
    const bullets = Array.from(
      { length: 10 },
      (_, index) =>
        `Finding ${index + 1}: ` +
        "The original signed-in source provides complete evidence for this comparison. ".repeat(5),
    );
    bullets.push("https://example.test/" + "a".repeat(350), "界".repeat(360) + " END-CJK");
    const notes = "Keep these original speaker notes exactly once.";
    const result = await results.generate({
      chatId: "chat-1",
      filename: "dense.pptx",
      spec: {
        kind: "pptx",
        slides: [
          { title, bullets, notes },
          { title: "Conclusion", bullets: ["Final visible conclusion."], notes: "Final speaker notes." },
        ],
      },
    });
    const zip = await JSZip.loadAsync(bytes(files, result.artifactId));
    const slides = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => Number(a.match(/slide(\d+)/)![1]) - Number(b.match(/slide(\d+)/)![1]));
    expect(slides.length).toBeGreaterThan(2);
    expect(result.preview.title).toBe(`${slides.length} slides`);
    expect(result.preview.lines).toEqual([
      `1–${slides.length - 1}. ${title}`,
      `${slides.length}. Conclusion`,
    ]);
    const presentation = new JSDOM(await zip.file("ppt/presentation.xml")!.async("string"), {
      contentType: "text/xml",
    });
    expect(presentation.window.document.getElementsByTagName("p:sldId").length).toBe(slides.length);
    presentation.window.close();
    let body = "";
    for (const name of slides) {
      const parsed = new JSDOM(await zip.file(name)!.async("string"), { contentType: "text/xml" });
      const document = parsed.window.document;
      for (const frame of document.getElementsByTagName("p:graphicFrame")) {
        const table = frame.getElementsByTagName("a:tbl")[0]!;
        body += [...table.getElementsByTagName("a:t")].map((node) => node.textContent).join("");
        const y = Number(frame.getElementsByTagName("a:off")[0]!.getAttribute("y"));
        const height = [...table.getElementsByTagName("a:tr")].reduce(
          (sum, row) => sum + Number(row.getAttribute("h")),
          0,
        );
        // 0.55-inch top and a protected footer on the real 7.5-inch slide.
        expect(y).toBeGreaterThanOrEqual(0.5 * 914400);
        expect(y + height).toBeLessThanOrEqual(7 * 914400);
        for (const text of table.getElementsByTagName("a:rPr"))
          expect(Number(text.getAttribute("sz"))).toBeGreaterThanOrEqual(1800);
      }
      parsed.window.close();
    }
    const visible = body.replace(/\s/g, "");
    for (const text of [title, ...bullets, "Conclusion", "Final visible conclusion."])
      expect(visible).toContain(text.replace(/\s/g, ""));
    const allNotes = (
      await Promise.all(
        Object.keys(zip.files)
          .filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name))
          .map((name) => zip.file(name)!.async("string")),
      )
    ).join("");
    expect(allNotes.split(notes)).toHaveLength(2);
    expect(allNotes).toContain("Final speaker notes.");
  }));

it(
  "renders a parseable chart PNG and rejects invalid or over-limit requests",
  async () =>
    fixture(async (results, files) => {
      const chart = await results.generate({
        chatId: "chat-1",
        filename: "trend.png",
        spec: {
          kind: "chart",
          title: "Trend",
          mark: "line",
          x: "Month",
          y: "Sales",
          data: [
            { Month: "Jan", Sales: 4 },
            { Month: "Feb", Sales: 7 },
          ],
        },
      });
      const png = PNG.sync.read(bytes(files, chart.artifactId));
      expect(png.width).toBeGreaterThan(500);
      expect(png.height).toBeGreaterThan(300);
      await expect(
        results.generate({
          chatId: "chat-1",
          filename: "bad.png",
          spec: {
            kind: "chart",
            title: "Bad",
            mark: "bar",
            x: "Month",
            y: "Sales",
            data: [{ Month: "Jan", Sales: "oops" }],
          },
        }),
      ).rejects.toThrow("must all be numbers");
      expect(
        GenerateResultParamsSchema.safeParse({
          chatId: "chat-1",
          filename: "bad.csv",
          spec: { kind: "csv", table: { name: "S", rows: Array.from({ length: 2001 }, () => ["x"]) } },
        }).success,
      ).toBe(false);
    }),
  60_000,
);
