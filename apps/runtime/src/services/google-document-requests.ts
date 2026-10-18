import type { GoogleArguments } from "@aux/contracts/google";
import type { z } from "zod";

/** API UTF-16 body indices only; no browser cursor, inferred table-cell offset or HTML paste. */
export function googleDocumentRequests(edits: z.output<(typeof GoogleArguments)["docs.edit"]>["edits"]) {
  return edits.flatMap<Record<string, unknown>>((edit) => {
    const tab = edit.tabId ? { tabId: edit.tabId } : {};
    if (edit.kind === "table")
      return [
        { insertTable: { location: { index: edit.index, ...tab }, rows: edit.rows, columns: edit.columns } },
      ];
    if (edit.kind !== "insert") {
      const range = { startIndex: edit.startIndex, endIndex: edit.endIndex, ...tab };
      if (edit.kind === "delete") return [{ deleteContentRange: { range } }];
      if (edit.kind === "list") return [{ createParagraphBullets: { range, bulletPreset: edit.preset } }];
      const paragraphStyle = {
        ...(edit.namedStyleType !== undefined ? { namedStyleType: edit.namedStyleType } : {}),
        ...(edit.alignment !== undefined ? { alignment: edit.alignment } : {}),
      };
      return [
        { updateParagraphStyle: { range, paragraphStyle, fields: Object.keys(paragraphStyle).join(",") } },
      ];
    }
    const requests: Record<string, unknown>[] = [
      { insertText: { location: { index: edit.index, ...tab }, text: edit.text } },
    ];
    const fields = ["bold", "italic", "underline", "link"] as const;
    if (fields.some((field) => edit[field] !== undefined))
      requests.push({
        updateTextStyle: {
          range: { startIndex: edit.index, endIndex: edit.index + edit.text.length, ...tab },
          textStyle: {
            ...(edit.bold !== undefined ? { bold: edit.bold } : {}),
            ...(edit.italic !== undefined ? { italic: edit.italic } : {}),
            ...(edit.underline !== undefined ? { underline: edit.underline } : {}),
            ...(edit.link ? { link: { url: edit.link } } : {}),
          },
          fields: fields.filter((field) => edit[field] !== undefined).join(","),
        },
      });
    return requests;
  });
}
