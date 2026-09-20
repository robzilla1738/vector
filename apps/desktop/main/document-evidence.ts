import { open } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, extname } from "node:path";
import { DOCUMENT_EVIDENCE_MAX_BYTES } from "@vector/contracts";

/** Called only with a path selected in the native picker. Never accepts renderer paths. */
export async function readEvidenceDocument(path: string): Promise<{ filename: string; content: string }> {
  if (![".txt", ".md", ".csv", ".json"].includes(extname(path).toLowerCase())) throw new Error("Choose a text, Markdown, CSV, or JSON document.");
  // Nonblocking open also lets us reject special files without blocking the UI process.
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error("Choose a regular document file.");
    if (stat.size > DOCUMENT_EVIDENCE_MAX_BYTES) throw new Error("Choose a document up to 512 KB.");
    const bytes = Buffer.alloc(DOCUMENT_EVIDENCE_MAX_BYTES + 1);
    let length = 0;
    while (length < bytes.length) {
      const { bytesRead } = await file.read(bytes, length, bytes.length - length, null);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > DOCUMENT_EVIDENCE_MAX_BYTES) throw new Error("Choose a document up to 512 KB.");
    let content: string;
    try { content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes.subarray(0, length)); }
    catch { throw new Error("This document is not UTF-8 text. Save it as UTF-8 and try again."); }
    if (content.includes("\0")) throw new Error("This document contains binary data. Choose a UTF-8 text document.");
    return { filename: basename(path), content };
  } finally { await file.close(); }
}
