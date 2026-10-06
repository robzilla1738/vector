import { expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";
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
        paragraphs: ["Revenue rose."],
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
    expect(await docZip.file("word/document.xml")?.async("string")).toContain("Revenue rose.");
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
    expect(await deckZip.file("ppt/slides/slide1.xml")?.async("string")).toContain("Revenue rose.");
    expect(deckZip.file("ppt/presentation.xml")).toBeTruthy();
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
