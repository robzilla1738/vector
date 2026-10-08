import { documentCitationKey, type DocumentCitationReceipt } from "@aux/contracts/document-citation";
import type { AdmittedDocumentExcerpt } from "./loop/document-admissions.js";
import type { BrowserResultCitation, ResultCitation, StepOutcome } from "@aux/contracts";
import { isConsequential } from "./permissions.js";

/** Verification v2 — navigation family ops are never counted as writes. */
export const NAV_OPS: ReadonlySet<string> = new Set(["navigate", "back", "forward", "reload"]);

/**
 * Verification v2 — navigation family ops are never counted as writes. A
 * completed write with no observed post-state is marked `unconfirmed` on its
 * receipt (the user sees it) — it does not fail the run. Returns the marked
 * step ids.
 */
export function markUnconfirmedWrites(outcomes: StepOutcome[]): string[] {
  const unconfirmed: string[] = [];
  for (const o of outcomes) {
    if (o.status !== "ok" || !isConsequential(o.op) || NAV_OPS.has(o.op)) continue;
    if (o.receipt?.observed || o.receipt?.remoteConfirmed === true || o.effect === "observed") continue;
    unconfirmed.push(o.stepId);
    o.receipt = {
      remoteConfirmed: false,
      uncertain: false,
      dispatchedBeforeTakeover: false,
      ...o.receipt,
      unconfirmed: true,
    };
  }
  return unconfirmed;
}

/** Normalize for quote matching — rendered text reflows; whitespace is not load-bearing. */
const normalizeQuote = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

/** Explicit snapshot identities never fall back to a different document's text. */
function citationKey(citation: BrowserResultCitation): string | undefined {
  if (citation.observationId) return citation.observationId;
  if (citation.pageId && citation.revision !== undefined) return `${citation.pageId}@${citation.revision}`;
  return citation.pageId;
}

/**
 * Verification v2 — every cited quote must appear verbatim (modulo
 * whitespace/case) in the rendered text of the cited snapshot. Paraphrase
 * around the quotes is allowed; only quoted spans are binding. Returns the
 * indexes of citations whose quote could not be verified.
 */
export function verifyResultCitations(
  citations: ResultCitation[],
  snapshotTexts: ReadonlyMap<string, string>,
  documents: Iterable<AdmittedDocumentExcerpt> = [],
): { unverified: number[]; missing: number[]; documents: Omit<DocumentCitationReceipt, "runId">[] } {
  const unverified: number[] = [];
  const missing: number[] = [];
  const verified: Omit<DocumentCitationReceipt, "runId">[] = [];
  const admitted = [...documents];
  citations.forEach((citation, index) => {
    if ("kind" in citation) {
      const key = documentCitationKey(citation.source, citation.locator);
      const candidates = admitted.filter(
        (excerpt) => documentCitationKey(excerpt.recipe.source, excerpt.recipe.locator) === key,
      );
      if (!candidates.length) {
        missing.push(index);
        return;
      }
      // Document quotes preserve case and cannot cross the projection's elision marker.
      const quote = citation.quote.replace(/\s+/g, " ").trim();
      const excerpt = candidates.find((entry) =>
        entry
          .read()
          .split("\n[…]\n")
          .some((part) => part.replace(/\s+/g, " ").includes(quote)),
      );
      if (!excerpt) {
        unverified.push(index);
        return;
      }
      excerpt.checkCurrent();
      verified.push({
        citation,
        referenceSha256: excerpt.recipe.referenceSha256,
        excerptSha256: excerpt.recipe.excerptSha256,
      });
      return;
    }
    const key = citationKey(citation);
    if (key === undefined || !snapshotTexts.has(key)) {
      missing.push(index);
      return;
    }
    if (!normalizeQuote(snapshotTexts.get(key)!).includes(normalizeQuote(citation.quote)))
      unverified.push(index);
  });
  return { unverified, missing, documents: verified };
}
