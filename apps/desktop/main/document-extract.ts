import { parentPort, workerData } from "node:worker_threads";
import mammoth from "mammoth";
import { DOCUMENT_EVIDENCE_MAX_BYTES } from "@vector/contracts";
import { extractPdf } from "./pdf-extract.js";
import { extractWorkbook } from "./workbook-extract.js";

// Only bytes cross this boundary: parsers never receive a source path or HTML renderer.
async function extract() {
  const workbook = workerData.format === "xlsx";
  try {
    const bytes = Buffer.from(workerData.bytes);
    const content = workerData.format === "pdf" ? await extractPdf(bytes) : workbook ? await extractWorkbook(bytes) : (await mammoth.extractRawText({ buffer: bytes })).value.trim();
    if (!content) throw new Error("This Word document has no readable text. Scanned pages and images are not supported.");
    if (Buffer.byteLength(content, "utf8") > DOCUMENT_EVIDENCE_MAX_BYTES) {
      throw new Error("This document contains more than 512 KB of text. Split it into smaller documents.");
    }
    if (content.includes("\0")) throw new Error("This document contains unreadable characters. Save a new text copy and try again.");
    parentPort?.postMessage({ content });
  } catch (error) {
    const message = error instanceof Error && /^This (Word document|workbook|document|PDF)/.test(error.message)
      ? error.message : `Could not read this ${workerData.format === "pdf" ? "PDF. Save a new copy and try again." : workbook ? "Excel workbook. Open it in Excel and save a new .xlsx or CSV copy." : "Word document. Open it in Word and save a new .docx or text copy."}`;
    parentPort?.postMessage({ error: message });
  }
}
void extract();
