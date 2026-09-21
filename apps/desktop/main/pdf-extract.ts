import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDocumentProxy } from "unpdf";
import { DOCUMENT_EVIDENCE_MAX_BYTES } from "@vector/contracts";

class LocalPdfData {
  async fetch({ kind, filename }: { kind: string; filename: string }) {
    const directory = kind === "cMapUrl" ? "cmaps" : kind === "standardFontDataUrl" ? "standard_fonts" : null;
    if (!directory || !/^[a-z0-9_-][a-z0-9_.-]*$/i.test(filename)) throw new Error("Unsupported PDF resource.");
    // This module runs only in the bundled CommonJS extraction worker.
    return new Uint8Array(await readFile(join(__dirname, "pdf-assets", directory, filename)));
  }
}

/** Read embedded text only. No rendering, script execution, link requests or OCR. */
export async function extractPdf(bytes: Buffer): Promise<string> {
  let pdf;
  try {
    pdf = await getDocumentProxy(Uint8Array.from(bytes), {
      useSystemFonts: false, disableFontFace: true,
      useWorkerFetch: false, useWasm: false, enableXfa: false, stopAtErrors: true,
      BinaryDataFactory: LocalPdfData, cMapPacked: true,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") throw new Error("This PDF is password protected. Unlock it in your PDF app and attach an unlocked copy.");
    throw new Error("This PDF could not be read. Open it in a PDF app and save a new copy, then try again.");
  }
  try {
    if (pdf.numPages > 500) throw new Error("This PDF has more than 500 pages. Attach only the pages you need.");
    const pages: string[] = [];
    let totalBytes = 0;
    let readable = false;
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const text = await page.getTextContent();
      const body = text.items.map(item => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join("").trim();
      readable ||= !!body;
      const section = `Page ${number} of ${pdf.numPages}\n${body || "[No embedded text on this page]"}`;
      totalBytes += Buffer.byteLength(section, "utf8") + 2;
      if (totalBytes > DOCUMENT_EVIDENCE_MAX_BYTES) throw new Error("This PDF contains more than 512 KB of text. Attach only the pages you need.");
      pages.push(section);
      page.cleanup();
    }
    if (!readable) throw new Error("This PDF has no embedded text. Scanned pages need OCR first, or attach a page image instead.");
    return pages.join("\n\n");
  } finally { await pdf.loadingTask.destroy(); }
}
