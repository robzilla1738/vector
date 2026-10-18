import { AuxError } from "@aux/contracts";
import type {
  MemoryDocumentTarget,
  MemoryDocumentRecord,
  MemoryDreamOperation,
} from "@aux/contracts/memory-documents";
import { digest } from "@aux/contracts/util/digest";
export function memoryDocumentPath(target: MemoryDocumentTarget): string {
  if (target.kind === "routine") return `routines/${digest(target.routineId).slice(0, 24)}.md`;
  let url: URL;
  try {
    url = new URL(target.origin);
  } catch {
    throw new AuxError("invalid_params", "Choose a valid website origin.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.origin !== target.origin
  )
    throw new AuxError("invalid_params", "Use an exact HTTP or HTTPS origin without a path or credentials.");
  return `sites/${url.hostname.slice(0, 120)}-${digest(url.origin).slice(0, 12)}.md`;
}
export function validateMemoryDocuments(documents: MemoryDocumentRecord[]) {
  if (
    new Set(documents.map((document) => document.documentId)).size !== documents.length ||
    new Set(documents.map((document) => document.path)).size !== documents.length
  )
    throw new Error("Memory documents have duplicate identities.");
  for (const document of documents)
    if (
      document.path !== memoryDocumentPath(document.target) ||
      document.contentSha256 !== digest(document.content) ||
      (document.authoredBy === "generated" && !document.sourceRefs.length)
    )
      throw new Error("Memory document content or provenance changed.");
  return documents;
}
export function validateDreamOperations(operations: MemoryDreamOperation[]) {
  if (new Set(operations.map((operation) => operation.operationId)).size !== operations.length)
    throw new Error("Memory Dream operations have duplicate identities.");
  for (const operation of operations)
    for (const change of operation.changes)
      if (
        digest(change.after) !== change.afterSha256 ||
        (change.before === null
          ? change.beforeSha256 !== null
          : digest(change.before) !== change.beforeSha256)
      )
        throw new Error("Memory Dream diff content changed.");
  return operations;
}
