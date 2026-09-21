import { lazy, Suspense } from "react";

const WorkbookPreview = lazy(() => import("./WorkbookPreview").then(module => ({ default: module.WorkbookPreview })));

export function DocumentExtractionNote({ filename }: { filename: string }) {
  const name = filename.toLowerCase();
  if (name.endsWith(".pdf")) return <p className="hint">Embedded PDF text with page numbers. Scanned text, images, and page layout are not included; reading order may differ from the original.</p>;
  if (name.endsWith(".docx")) return <p className="hint">Extracted Word text. Images, formatting, and page layout are not included.</p>;
  if (name.endsWith(".xlsx")) return <p className="hint">Saved cell values from all sheets, including hidden sheets. Formula results may be out of date. Charts, images, and display formatting are not included.</p>;
  return null;
}

export function DocumentContent({ filename, content }: { filename: string; content: string }) {
  if (filename.toLowerCase().endsWith(".xlsx")) return <Suspense fallback={<p className="hint" role="status">Loading workbook preview…</p>}><WorkbookPreview content={content} /></Suspense>;
  return <pre tabIndex={0} className="evidence-text" aria-label="Full document snapshot">{content || "Empty document"}</pre>;
}
