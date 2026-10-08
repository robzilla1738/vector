import { createHash } from "node:crypto";
import { AuxError, type AttachmentReference } from "@aux/contracts";
import { documentCitationKey, type DocumentAdmissionRecipe } from "@aux/contracts/document-citation";
import { documentLocatorKey } from "@aux/contracts/document-intake";
import type { ConversationDocuments } from "../../services/conversation-documents.js";
import { documentReference } from "../../services/document-context.js";

export type AdmittedDocumentExcerpt = {
  recipe: DocumentAdmissionRecipe;
  checkCurrent(): void;
  read(): string;
};
export const documentAdmissionKey = (recipe: DocumentAdmissionRecipe) =>
  documentCitationKey(recipe.source, recipe.locator) + recipe.excerptSha256;

/** Indices are UTF-16 offsets into one immutable text segment or its versioned workbook projection. */
export function documentExcerptSpans(source: string, excerpt: string): DocumentAdmissionRecipe["spans"] {
  const exact = source.indexOf(excerpt);
  if (exact >= 0) return [{ start: exact, length: excerpt.length }];
  return excerpt.split("\n[…]\n").map((text) => {
    const start = source.indexOf(text);
    if (start < 0) throw new AuxError("ref_stale", "The document excerpt is not a source-relative span.");
    return { start, length: text.length };
  });
}

/** Build lazy, run-owned readers. Only an actually cited segment is decrypted after restart. */
export function documentCitationEvidence(
  references: readonly AttachmentReference[],
  documents: ConversationDocuments,
  recipes: readonly DocumentAdmissionRecipe[],
  signal: AbortSignal,
  checkRun: () => void,
): AdmittedDocumentExcerpt[] {
  return recipes.map((recipe) => {
    const reference = references.find(
      (ref) =>
        ref.chatId === recipe.source.chatId &&
        ref.attachmentId === recipe.source.attachmentId &&
        ref.sha256 === recipe.referenceSha256,
    );
    if (!reference)
      throw new AuxError(
        "ref_stale",
        "The admitted document does not belong to this run's captured sources.",
      );
    const checkCurrent = () => {
      if (signal.aborted) throw new AuxError("cancelled", "Document citation admission was cancelled.");
      checkRun();
      const captured = documents.referenceMetadata(reference).document;
      if (
        captured?.sha256 !== recipe.source.sha256 ||
        captured.document.snapshotId !== recipe.source.snapshotId
      )
        throw new AuxError("ref_stale", "The cited document no longer matches its original capture.");
    };
    return {
      recipe,
      checkCurrent,
      read: () => {
        checkCurrent();
        const segment = documents.referenceSegment(reference, recipe.ordinal);
        if (documentLocatorKey(segment.locator) !== documentLocatorKey(recipe.locator))
          throw new AuxError("ref_stale", "The cited document location changed.");
        const text =
          recipe.projection === "workbook-values-v1"
            ? documentReference("snapshot.xlsx", segment.text).join("\n\n")
            : segment.text;
        const parts = recipe.spans.map(({ start, length }) => {
          if (!Number.isSafeInteger(start + length) || start + length > text.length)
            throw new AuxError("ref_stale", "The admitted document span is unavailable.");
          return text.slice(start, start + length);
        });
        const full = parts.join("\n[…]\n");
        if (recipe.length > full.length)
          throw new AuxError("ref_stale", "The admitted document excerpt is incomplete.");
        const excerpt = full.slice(0, recipe.length);
        if (createHash("sha256").update(excerpt).digest("hex") !== recipe.excerptSha256)
          throw new AuxError(
            "ref_stale",
            "The admitted document excerpt no longer matches its original digest.",
          );
        return excerpt;
      },
    };
  });
}
