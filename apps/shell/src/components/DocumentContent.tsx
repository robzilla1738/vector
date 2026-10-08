import { staticHintProps } from "../ui/class-props";
import { lazy, Suspense, useMemo } from "react";
import type { DocumentMetadata, DocumentWarning } from "@aux/contracts/document-intake";
import { WorkbookSnapshotSchema } from "@aux/contracts/workbook-snapshot";

const WorkbookPreview = lazy(() =>
  import("./WorkbookPreview").then((module) => ({ default: module.WorkbookPreview })),
);

function warningText(warning: DocumentWarning): string {
  const count = warning.count.toLocaleString();
  switch (warning.code) {
    case "no_selectable_text":
      return `${count} ${warning.count === 1 ? "page had" : "pages had"} no selectable text, starting at page ${warning.firstPage}. Use OCR to include scanned text.`;
    case "unmapped_text":
      return `${count} text ${warning.count === 1 ? "symbol could" : "symbols could"} not be read, starting at page ${warning.firstPage}. Check the original for missing text.`;
    case "external_relationships_ignored":
      return `${count} external ${warning.count === 1 ? "reference was" : "references were"} not followed.`;
    case "embedded_content_ignored":
      return `${count} embedded ${warning.count === 1 ? "item was" : "items were"} not extracted.`;
    case "unsupported_markup_ignored":
      return `${count} unsupported content ${warning.count === 1 ? "item was" : "items were"} not extracted.`;
  }
}
export function DocumentExtractionNote({ document }: { document: DocumentMetadata }) {
  return (
    <div>
      <p {...staticHintProps}>
        {document.format === "pdf"
          ? `PDF text · ${document.pageCount} pages. Images and scanned text are not included; reading order may differ from the original.`
          : document.format === "docx"
            ? "Word text with paragraph references. Images, formatting, and page layout are not included."
            : "Captured UTF-8 text with line references."}
      </p>
      {document.warnings.map((warning) => (
        <p {...staticHintProps} key={`${warning.code}:${warning.story ?? ""}`}>
          {warningText(warning)}
          {warning.story ? ` (${warning.story})` : ""}
        </p>
      ))}
    </div>
  );
}

/** Historical inline evidence can contain a typed workbook snapshot; its filename is only a label. */
export function DocumentContent({ content }: { content: string }) {
  const workbook = useMemo(() => {
    try {
      return WorkbookSnapshotSchema.safeParse(JSON.parse(content)).success;
    } catch {
      return false;
    }
  }, [content]);
  if (workbook)
    return (
      <Suspense
        fallback={
          <output {...staticHintProps} data-block>
            Loading workbook preview…
          </output>
        }
      >
        <WorkbookPreview content={content} />
      </Suspense>
    );
  return (
    <pre role="group" tabIndex={0} className="evidence-text" aria-label="Saved captured text">
      {content || "Empty document"}
    </pre>
  );
}
