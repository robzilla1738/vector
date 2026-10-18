import { memoryReadNoContentErrors, memorySearchFallbackReasons } from "./memory-source-outcomes.js";
import { createHash } from "node:crypto";
import {
  MemoryDocumentMethodSchemas,
  MemoryDocumentResultSchemas,
  MemoryRecallQuerySchema,
  MemoryRecallResultSchema,
} from "@aux/contracts/memory-documents";
import type { Repo } from "../store/repo.js";
import { AuxError } from "@aux/contracts";

export const memoryToolNames = new Set(["memory_search", "memory_read"]);
export const memorySearchInput = MemoryRecallQuerySchema.omit({ workspaceId: true });
export const memorySearchResult = MemoryRecallResultSchema;
export const memoryReadResult = MemoryDocumentResultSchemas["memory.pipeline.readSource"];
export const memoryReadInput = MemoryDocumentMethodSchemas["memory.pipeline.readSource"].omit({
  workspaceId: true,
});
export const memoryEvidenceHash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(value) ?? "undefined")
    .digest("hex");
export const memoryEvidenceObject = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

export function originalMemoryCalls(repo: Repo, runId: string, overBudget?: () => never) {
  const rows = repo.db
    .prepare(
      "SELECT tool_call_id,tool_name,started_at FROM run_tool_calls WHERE run_id=? ORDER BY tool_call_id LIMIT 16385",
    )
    .all(runId);
  if (rows.length > 16384 || Buffer.byteLength(JSON.stringify(rows)) > 1024 * 1024) {
    if (overBudget) return overBudget();
    throw new AuxError(
      "backend_unavailable",
      "Original Memory execution receipts exceed their inspection budget.",
    );
  }
  return rows as { tool_call_id: string; tool_name: string; started_at: number }[];
}

export function canonicalMemoryResult(name: string, input: Record<string, unknown>, output: unknown) {
  const value = memoryEvidenceObject(output);
  if (value?.type !== "json") return null;
  const parsed =
    name === "memory_search"
      ? MemoryRecallResultSchema.safeParse(value.value)
      : MemoryDocumentResultSchemas["memory.pipeline.readSource"].safeParse(value.value);
  if (!parsed.success) return null;
  if (
    name === "memory_read" &&
    ["sourceId", "revision", "sha256"].some(
      (key) => input[key] !== (parsed.data as Record<string, unknown>)[key],
    )
  )
    return null;
  return parsed.data;
}

// These exact original Memory read failures contain no source text. Arbitrary
// Error.message strings and legacy error-looking outputs never qualify.
const noContentErrors = new Set<string>(Object.values(memoryReadNoContentErrors));
export function canonicalMemoryNoContent(
  name: string,
  input: Record<string, unknown>,
  output: unknown,
): boolean {
  const value = memoryEvidenceObject(output);
  if (!value || Object.keys(value).some((key) => !["type", "value"].includes(key))) return false;
  if (value?.type === "error-text")
    return name === "memory_read" && typeof value.value === "string" && noContentErrors.has(value.value);
  const parsed = canonicalMemoryResult(name, input, output);
  if (!parsed || !("matches" in parsed) || parsed.matches.length !== 0) return false;
  const exact = MemoryRecallResultSchema.strict().safeParse(value.value);
  return (
    exact.success &&
    (exact.data.fallbackReason === undefined ||
      new Set<string>(Object.values(memorySearchFallbackReasons)).has(exact.data.fallbackReason))
  );
}
