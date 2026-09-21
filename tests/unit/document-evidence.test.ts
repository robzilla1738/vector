import { afterEach, expect, it } from "vitest";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readEvidenceDocument } from "../../apps/desktop/main/document-evidence.js";
const dirs: string[] = [];
afterEach(async () => { await Promise.all(dirs.splice(0).map(path => rm(path, { recursive: true, force: true }))); });
it("reads only bounded UTF-8 regular documents and preserves exact bytes including BOM", async () => {
  const dir = await mkdtemp(join(tmpdir(), "aux-evidence-")); dirs.push(dir);
  const path = join(dir, "record.md"), bytes = Buffer.from("\ufeff# Receipt\r\nCafé ✓\n");
  await writeFile(path, bytes);
  const document = await readEvidenceDocument(path);
  expect(document.filename).toBe("record.md");
  expect(Buffer.from(document.content)).toEqual(bytes);
  expect(createHash("sha256").update(document.content).digest("hex")).toBe(createHash("sha256").update(bytes).digest("hex"));
  await writeFile(path, Buffer.from([0xff, 0xfe]));
  await expect(readEvidenceDocument(path)).rejects.toThrow("UTF-8");
  await writeFile(path, "binary\0text");
  await expect(readEvidenceDocument(path)).rejects.toThrow("binary");
  await writeFile(path, Buffer.alloc(512 * 1024 + 1));
  await expect(readEvidenceDocument(path)).rejects.toThrow("512 KB");
  await expect(readEvidenceDocument(join(dir, "record.exe"))).rejects.toThrow("Choose a PDF");
  const folder = join(dir, "folder.txt"); await mkdir(folder);
  await expect(readEvidenceDocument(folder)).rejects.toThrow("regular document");
});

it("accepts extracted Word snapshots while rejecting binary or unsafe attachment input", async () => {
  const { ConversationAttachmentAddParams, EvidenceDocumentParams } = await import("@vector/contracts");
  expect(ConversationAttachmentAddParams.safeParse({ chatId: "word-chat", filename: "Notes.DOCX", content: "Extracted notes" }).success).toBe(true);
  expect(ConversationAttachmentAddParams.safeParse({ chatId: "workbook-chat", filename: "Budget.xlsx", content: '{"format":"aux.workbook.v1","sheets":[]}' }).success).toBe(true);
  for (const filename of ["Notes.docx", "Budget.xlsx", "Research.pdf"]) expect(EvidenceDocumentParams.safeParse({ taskId: "task-documents", expectedRevision: 1, criterionId: "result", filename, content: "Saved text" }).success).toBe(true);
  for (const value of [
    { filename: "../Notes.docx", content: "notes" },
    { filename: "Notes.docx", content: "binary\0content" },
    { filename: "Notes.docx", content: "x".repeat(512 * 1024 + 1) },
  ]) expect(ConversationAttachmentAddParams.safeParse({ chatId: "word-chat", ...value }).success).toBe(false);
});
