import type { CodingFileReceipt } from "@aux/contracts/coding-files";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";

const PRUNE_MIN_BYTES = 1_024;

const bytes = (value: unknown): number => Buffer.byteLength(JSON.stringify(value ?? null) ?? "", "utf8");

/** True for embedded media strings — data: URIs are the only unambiguous case. */
function isMediaString(value: string): boolean {
  return value.length >= PRUNE_MIN_BYTES && value.startsWith("data:");
}

/**
 * Deep-walk a JSON-safe tool output; any oversized media string becomes a
 * `{prunedMedia}` marker carrying only its size. Non-JSON values are left —
 * marshalability is the tool's own contract.
 */
export function pruneMedia(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || value === undefined) return value;
  if (typeof value === "string") {
    return isMediaString(value)
      ? {
          prunedMedia: true,
          bytes: value.length,
          mime: value.startsWith("data:") ? value.slice(5, value.indexOf(";")) : "raw",
        }
      : value;
  }
  if (Array.isArray(value)) return value.map((item) => pruneMedia(item, depth + 1));
  if (typeof value === "object") {
    // Only plain objects — Error and other class instances must keep their
    // identity so downstream typing (error-text results) still holds.
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>))
      out[key] = pruneMedia(item, depth + 1);
    return out;
  }
  return value;
}

export function annotateToolFailure(output: unknown, depth = 0): unknown {
  if (depth > 3) return output;
  if (!output || typeof output !== "object" || Array.isArray(output) || output instanceof Error)
    return output;
  const value = output as Record<string, unknown>;
  if (value.value && typeof value.value === "object")
    return { ...value, value: annotateToolFailure(value.value, depth + 1) };
  if (
    !(typeof value.exitCode === "number" && value.exitCode !== 0) &&
    !value.timedOut &&
    !["failed", "stopped", "interrupted", "uncertain"].includes(String(value.state)) &&
    !value.signal
  )
    return output;
  const text = [value.stderr, value.stdout]
    .filter((item): item is string => typeof item === "string")
    .join("\n");
  return {
    ...value,
    diagnostic: {
      command: String(value.command ?? "").slice(0, 8192),
      workdir: String(value.workdir ?? "").slice(0, 4096),
      state: value.state,
      signal: value.signal,
      exitCode: value.exitCode,
      timedOut: value.timedOut ?? false,
      excerpt: text.slice(-4096),
      artifactId: value.artifactId,
      processId: value.processId,
      guidance:
        "Inspect the failure and make a focused repair before retrying. Full output remains in the command artifact or process logs.",
    },
  };
}
export function codingResumeSummary(
  files: CodingFileReceipt[],
  processes: CodingProcessReceipt[],
  totalFileReceipts = files.length,
  unresolved?: {
    total: number;
    receipts: { kind: string; receiptId: string; state: string }[];
    nextOffset?: number;
    omittedCount?: number;
  },
): string {
  const summary: {
    note: string;
    unresolved?: typeof unresolved;
    fileCount: number;
    recentProcessReceiptCount: number;
    recentFileReceiptCount: number;
    files: unknown[];
    processes: unknown[];
  } = {
    note: "Durable coding state: confirmed effects must not be replayed. Use coding_state to page through all unresolved receipt references (nextOffset indicates omitted entries). Use diff, reconcile_file, reconcile_process, bg_status and bg_logs to inspect results or resolve uncertainty. Interrupted commands have unknown outcomes and are never proof of success.",
    unresolved,
    fileCount: totalFileReceipts,
    recentFileReceiptCount: files.length,
    recentProcessReceiptCount: processes.length,
    files: [],
    processes: [],
  };
  for (const process of processes.slice(-12).reverse()) {
    summary.processes.push({
      processId: process.processId,
      command: process.command.slice(0, 1024),
      workdir: process.workdir.slice(0, 512),
      signal: process.signal,
      state: process.state,
      exitCode: process.exitCode,
      artifactId: process.artifactId,
      diagnostic:
        (process.exitCode !== undefined && process.exitCode !== 0) ||
        !!process.timedOut ||
        ["failed", "stopped", "interrupted"].includes(process.state)
          ? {
              excerpt: [process.stderr, process.stdout].filter(Boolean).join("\n").slice(-2048),
              guidance: "Inspect the command failure before retrying; use process logs for full output.",
            }
          : undefined,
    });
    if (bytes(summary) > 8192) {
      summary.processes.pop();
      break;
    }
  }
  for (const receipt of files.slice(-12).reverse()) {
    const entry = {
      receiptId: receipt.receiptId,
      status: receipt.status,
      fileOutcomes: receipt.fileOutcomes?.slice(0, 8),
      changedFileCount: receipt.after.length,
      changes: receipt.after.slice(0, 6).map((after) => {
        const before = receipt.before.find((state) => state.path === after.path)?.content ?? "";
        const content = after.content ?? "";
        let offset = 0;
        while (offset < Math.min(before.length, content.length) && before[offset] === content[offset])
          offset++;
        const start = Math.max(0, offset - 60);
        return {
          path: after.path.slice(-512),
          pathTruncated: after.path.length > 512,
          version: after.version,
          binary: after.contentBase64 !== undefined,
          before: before.slice(start, start + 180),
          after: content.slice(start, start + 180),
        };
      }),
    };
    summary.files.push(entry);
    if (bytes(summary) > 8192) {
      summary.files.pop();
      break;
    }
  }
  return JSON.stringify(summary);
}
