import { withPdfSources, type PdfSourceDependencies } from "./pdf-sources.js";
import { randomUUID } from "node:crypto";
import { AuxError, type Run } from "@aux/contracts";
import {
  PdfJobReceiptSchema,
  PdfToolInputSchema,
  type PdfJobReceipt,
  type PdfToolInput,
} from "@aux/contracts/document-jobs";
import type { NativeBridge } from "../native.js";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { ArtifactStore } from "./artifacts.js";
import { nativeDocumentJob } from "./native-document-jobs.js";

/** PDF processing has no path or network authority and always creates new artifacts. */
export async function processPdfArtifacts(
  deps: {
    repo: Repo;
    artifacts: ArtifactStore;
    events: EventBus;
    native: NativeBridge;
  } & PdfSourceDependencies,
  input: PdfToolInput,
  owner: { run: Run; signal: AbortSignal; checkCurrent(): void },
): Promise<PdfJobReceipt> {
  const params = PdfToolInputSchema.parse(input);
  const sourceKeys = params.sources.map((source) => JSON.stringify(source));
  if (
    new Set(sourceKeys).size !== sourceKeys.length ||
    (params.options.operation !== "merge" && params.sources.length !== 1)
  )
    throw new AuxError("invalid_params", "Use one PDF source, or distinct sources for a merge.");
  const operationId = randomUUID();
  const startedAt = Date.now();
  return withPdfSources(deps, params.sources, owner, async (sources, signal, checkCurrent) => {
    const check = () => {
      signal.throwIfAborted();
      checkCurrent();
    };
    const identities = sources.map(({ source, snapshotSha256, sha256, bytes }) => ({
      source,
      ...(snapshotSha256 ? { snapshotSha256 } : {}),
      sha256,
      size: bytes.length,
    }));
    // Flush the original receipt before computation; recovery never replays PDF jobs.
    deps.events.emit(
      "document.job",
      { operationId, operation: params.options.operation, sources: identities, status: "running" },
      owner.run.runId,
    );
    deps.repo.flush();
    try {
      const result = await nativeDocumentJob(deps.native, { kind: "pdf", options: params.options }, sources, {
        signal,
        checkCurrent: check,
      });
      check();
      if (params.options.operation === "fill" && !result.report.appearancesVerified)
        throw new AuxError("backend_unavailable", "Saved PDF values and appearances were not both verified.");
      const fields = result.report.fields;
      const fieldBytes = fields ? Buffer.from(JSON.stringify(fields)) : undefined;
      const files = result.outputs.map((output) => ({
        runId: owner.run.runId,
        label: output.label,
        buffer: output.bytes,
        mediaType: output.mediaType,
      }));
      if (fieldBytes)
        files.push({
          runId: owner.run.runId,
          label: "pdf-fields.json",
          buffer: fieldBytes,
          mediaType: "application/json",
        });
      const saved = await deps.artifacts.saveManyStrict(files, check);
      check();
      const receipt = PdfJobReceiptSchema.parse({
        operationId,
        runId: owner.run.runId,
        operation: params.options.operation,
        sources: identities,
        outputs: result.outputs.map((output, index) => ({
          artifactId: saved[index]!.artifactId,
          sha256: output.sha256,
          mediaType: output.mediaType,
          size: output.bytes.length,
          label: output.label,
        })),
        report: {
          ...result.report,
          ...(result.report.text ? { text: result.report.text.slice(0, 6000) } : {}),
          ...(fields
            ? {
                fields: fields.slice(0, 100).map((field) => ({
                  ...field,
                  value: typeof field.value === "string" ? field.value.slice(0, 512) : field.value,
                })),
              }
            : {}),
        },
        truncated:
          (result.report.text?.length ?? 0) > 6000 ||
          (fields?.length ?? 0) > 100 ||
          fields?.some((field) => typeof field.value === "string" && field.value.length > 512) ||
          false,
        ...(fields ? { fieldsArtifactId: saved.at(-1)!.artifactId } : {}),
        durationMs: Date.now() - startedAt,
      });
      deps.events.emit("document.job", { operationId, status: "completed", receipt }, owner.run.runId);
      deps.repo.flush();
      return receipt;
    } catch (error) {
      // A removed original run must not be recreated by a late failure receipt.
      if (deps.repo.getRun(owner.run.runId)) {
        deps.events.emit(
          "document.job",
          {
            operationId,
            status: signal.aborted ? "cancelled" : "failed",
            sources: identities,
            code: error instanceof AuxError ? error.code : "internal",
          },
          owner.run.runId,
        );
        deps.repo.flush();
      }
      throw error;
    } finally {
      for (const source of sources) source.bytes.fill(0);
    }
  });
}
