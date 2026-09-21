import { open } from "node:fs/promises";
import { constants } from "node:fs";
import { Worker } from "node:worker_threads";
import { basename, extname } from "node:path";
import { DOCUMENT_EVIDENCE_MAX_BYTES } from "@vector/contracts";

const BINARY_DOCUMENT_MAX_BYTES = 16 * 1024 * 1024;

function extractDocument(bytes: Buffer, format: "docx" | "xlsx" | "pdf"): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./document-extract.cjs", import.meta.url), {
      workerData: { bytes, format },
      resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16 },
    });
    const timer = setTimeout(() => finish(new Error("This document took too long to read. Try a smaller document or save it as text.")), 15_000);
    let settled = false;
    function finish(error?: Error, content?: string) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      if (error) reject(error); else resolve(content!);
    }
    worker.once("message", (result: { content?: string; error?: string }) => {
      if (typeof result.content !== "string") finish(new Error(result.error || "Could not read this document."));
      else finish(undefined, result.content);
    });
    worker.once("error", () => finish(new Error("Could not read this document. Try saving it as text.")));
    worker.once("exit", () => finish(new Error("Document import stopped. Try a smaller document or save it as text.")));
  });
}

/** Called only with a path selected in the native picker. Never accepts renderer paths. */
export async function readEvidenceDocument(path: string): Promise<{ filename: string; content: string }> {
  const extension = extname(path).toLowerCase();
  const format = extension === ".docx" ? "docx" : extension === ".xlsx" ? "xlsx" : extension === ".pdf" ? "pdf" : null;
  if (![".txt", ".md", ".csv", ".json", ".docx", ".xlsx", ".pdf"].includes(extension)) throw new Error("Choose a PDF, Word (.docx), Excel (.xlsx), text, Markdown, CSV, or JSON document.");
  const limit = format ? BINARY_DOCUMENT_MAX_BYTES : DOCUMENT_EVIDENCE_MAX_BYTES;
  const sizeError = format ? "Choose a PDF, Word or Excel document up to 16 MB." : "Choose a text document up to 512 KB.";
  // Nonblocking open also lets us reject special files without blocking the UI process.
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error("Choose a regular document file.");
    if (stat.size > limit) throw new Error(sizeError);
    const bytes = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < bytes.length) {
      const { bytesRead } = await file.read(bytes, length, bytes.length - length, null);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > limit) throw new Error(sizeError);
    if (format) return { filename: basename(path), content: await extractDocument(bytes.subarray(0, length), format) };
    let content: string;
    try { content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes.subarray(0, length)); }
    catch { throw new Error("This document is not UTF-8 text. Save it as UTF-8 and try again."); }
    if (content.includes("\0")) throw new Error("This document contains binary data. Choose a UTF-8 text document.");
    return { filename: basename(path), content };
  } finally { await file.close(); }
}
