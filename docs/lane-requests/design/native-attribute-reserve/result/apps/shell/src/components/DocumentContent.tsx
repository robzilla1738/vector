import { staticHintProps } from "../ui/class-props";
import { lazy, Suspense } from "react";
import { nativeGroupRoleProps } from "../ui/native-attribute-props";

const WorkbookPreview = lazy(() => import("./WorkbookPreview").then(module => ({ default: module.WorkbookPreview })));

export function DocumentExtractionNote({ filename }: { filename: string }) {
  const name = filename.toLowerCase();
  if (name.endsWith(".pdf")) return <p {...staticHintProps}>Embedded PDF text with page numbers. Scanned text, images, and page layout are not included; reading order may differ from the original.</p>;
  if (name.endsWith(".docx")) return <p {...staticHintProps}>Extracted Word text. Images, formatting, and page layout are not included.</p>;
  if (name.endsWith(".xlsx")) return <p {...staticHintProps}>Saved cell values from all sheets, including hidden sheets. Formula results may be out of date. Charts, images, and display formatting are not included.</p>;
  return null;
}

export function DocumentContent({ filename, content }: { filename: string; content: string }) {
  if (filename.toLowerCase().endsWith(".xlsx")) return <Suspense fallback={<output {...staticHintProps} data-block>Loading workbook preview…</output>}><WorkbookPreview content={content} /></Suspense>;
  return <pre {...nativeGroupRoleProps} tabIndex={0} className="evidence-text" aria-label="Full document snapshot">{content || "Empty document"}</pre>;
}
