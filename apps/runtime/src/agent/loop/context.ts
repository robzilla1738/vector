import type { CodingFileReceipt } from "@aux/contracts/coding-files";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";
import type { ModelMessage } from "./types.js";

/**
 * Context management for the durable transcript (S5 deliverable 5 / 06-Z).
 * Three deterministic mechanisms — no model call is spent managing context:
 *
 * - `pruneMedia` strips large embedded media (data URLs) out of tool outputs
 *   before they persist — the artifact already lives on disk via outputDir.
 * - `budgetToolOutputs` caps the aggregate tool-result bytes in one step.
 * - `compactMessages` rewrites old output to placeholders, keeping the task
 *   and newest exchange verbatim; the store persists this before another call.
 */

/** One model step's tool results may carry at most this much output. */
export const TURN_TOOL_BUDGET_BYTES = 40 * 1024;
/** Serialized history beyond this compacts on the next model call. */
export const TRANSCRIPT_COMPACT_BYTES = 192 * 1024;
/** Verbatim tail kept across compaction. */
export const TRANSCRIPT_KEEP_TAIL = 8;
/** Outputs smaller than this survive compaction/pruning untouched. */
const PRUNE_MIN_BYTES = 1_024;
const COMPACT_PART_BYTES = 1_024;
const COMPACT_TEXT_CHARS = 400;

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

const READ_TOOLS = new Set([
  "get_time",
  "snapshot",
  "read_file",
  "grep",
  "glob",
  "list_directory",
  "stat",
  "diff",
  "bg_status",
  "bg_logs",
  "history_search",
  "memory_search",
  "websearch",
  "webfetch",
  "package_skill",
  "package_template",
  "package_workflow",
  "coder_worktree_diff",
]);
const evidenceFields = [
  "receiptId",
  "receiptIds",
  "fileReceiptIds",
  "processReceiptIds",
  "processId",
  "artifactId",
  "artifactIds",
  "cellId",
  "intentId",
  "uncertainIntentIds",
  "status",
  "state",
  "exitCode",
  "timedOut",
  "fileOutcomes",
  "diagnostic",
];
function retainedEvidence(output: unknown): Record<string, unknown> {
  if (!output || typeof output !== "object" || Array.isArray(output)) return {};
  const object = output as Record<string, unknown>;
  if (object.type === "json") return retainedEvidence(object.value);
  const evidence: Record<string, unknown> = {};
  for (const name of evidenceFields) {
    const value = object[name];
    if (typeof value === "string") evidence[name] = value.slice(0, 512);
    else if (typeof value === "number" || typeof value === "boolean" || value === null)
      evidence[name] = value;
    else if (Array.isArray(value))
      evidence[name] = value.slice(0, 16).map((item) =>
        typeof item === "string"
          ? item.slice(0, 512)
          : item && typeof item === "object"
            ? {
                path: String((item as { path?: unknown }).path ?? "").slice(-512),
                status: String((item as { status?: unknown }).status ?? "").slice(0, 64),
              }
            : item,
      );
    else if (name === "diagnostic" && value && typeof value === "object") {
      const diagnostic = value as Record<string, unknown>;
      evidence[name] = {
        command: String(diagnostic.command ?? "").slice(0, 2048),
        workdir: String(diagnostic.workdir ?? "").slice(0, 512),
        state: diagnostic.state,
        signal: diagnostic.signal,
        exitCode: diagnostic.exitCode,
        timedOut: diagnostic.timedOut,
        excerpt: String(diagnostic.excerpt ?? "").slice(-4096),
        processId: String(diagnostic.processId ?? "").slice(0, 512),
        artifactId: String(diagnostic.artifactId ?? "").slice(0, 512),
      };
    }
  }
  return evidence;
}
function recoveryHint(toolName?: string): string {
  return toolName && READ_TOOLS.has(toolName)
    ? "Read this content again with a narrower query if needed."
    : "Do not repeat this action to recover its output. Inspect its durable receipt, diff, or process logs; reconcile uncertain effects before further writes.";
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

/**
 * The per-turn tool budget: results keep their slot but oversize outputs
 * shrink to a marker once the running total passes the cap. The smallest
 * outputs are kept verbatim — statuses and ids stay visible to the model.
 */
export function budgetToolOutputs<T extends { output?: unknown; toolName?: string }>(results: T[]): T[] {
  let spent = 0;
  return results.map((result) => {
    if (!("output" in result)) return result;
    const size = bytes(result.output);
    if (spent + size <= TURN_TOOL_BUDGET_BYTES) {
      spent += size;
      return result;
    }
    spent += size;
    return {
      ...result,
      output: {
        truncated: true,
        bytes: size,
        evidence: retainedEvidence(result.output),
        note: recoveryHint(result.toolName),
      },
    };
  });
}

/** Total serialized size of the message history. */
export function transcriptBytes(messages: ModelMessage[]): number {
  return bytes(messages);
}

interface MessagePart {
  type?: string;
  text?: string;
  output?: unknown;
  [key: string]: unknown;
}

function compactPart(part: MessagePart): MessagePart {
  if (part.type === "tool-result" && bytes(part.output) > COMPACT_PART_BYTES)
    return {
      ...part,
      output: {
        type: "json",
        value: {
          compacted: true,
          bytes: bytes(part.output),
          evidence: retainedEvidence(part.output),
          hint: recoveryHint(typeof part.toolName === "string" ? part.toolName : undefined),
        },
      },
    };
  // Provider reasoning signatures can be tens of KB per part. Once the
  // assistant's tool result is durable, the provider metadata is no longer
  // evidence or action authority and need not accompany the next request.
  if (part.type === "reasoning" && part.providerOptions && bytes(part.providerOptions) > COMPACT_PART_BYTES) {
    const { providerOptions: _providerOptions, ...rest } = part;
    return typeof rest.text === "string" && rest.text.length > COMPACT_TEXT_CHARS
      ? {
          ...rest,
          text: `${rest.text.slice(0, COMPACT_TEXT_CHARS)}… [compacted ${rest.text.length - COMPACT_TEXT_CHARS} chars]`,
        }
      : rest;
  }
  if (
    (part.type === "text" || part.type === "reasoning") &&
    typeof part.text === "string" &&
    part.text.length > COMPACT_TEXT_CHARS
  )
    return {
      ...part,
      text: `${part.text.slice(0, COMPACT_TEXT_CHARS)}… [compacted ${part.text.length - COMPACT_TEXT_CHARS} chars]`,
    };
  return part;
}

/** A completed tool call can shed its bulky input without losing its ID or result pairing. */
function compactCompletedCall(part: MessagePart, answered: Set<string>): MessagePart {
  if (
    part.type !== "tool-call" ||
    typeof part.toolCallId !== "string" ||
    !answered.has(part.toolCallId) ||
    bytes(part.input) <= COMPACT_PART_BYTES
  )
    return part;
  return {
    ...part,
    input: {
      compacted: true,
      bytes: bytes(part.input),
      hint: "The completed tool input was compacted; the durable action ledger retains effect authority.",
    },
  };
}

/**
 * Deterministic compaction: keep the task and newest exchange verbatim. First
 * shrink older history; if still over budget, shrink the older part of the
 * tail. Returns changed indexes for one durable transaction.
 */
export function compactMessages(
  messages: ModelMessage[],
): { messages: ModelMessage[]; changed: number[] } | null {
  const tailStart = Math.max(1, messages.length - TRANSCRIPT_KEEP_TAIL);
  const next = [...messages];
  const changed: number[] = [];
  const compactAt = (i: number) => {
    const message = next[i]!;
    const content = message.content;
    let compacted: unknown = content;
    if (typeof content === "string" && content.length > COMPACT_TEXT_CHARS) {
      compacted = `${content.slice(0, COMPACT_TEXT_CHARS)}… [compacted ${content.length - COMPACT_TEXT_CHARS} chars]`;
    } else if (Array.isArray(content)) {
      compacted = (content as MessagePart[]).map(compactPart);
    }
    if (JSON.stringify(compacted) !== JSON.stringify(content)) {
      next[i] = { ...message, content: compacted } as ModelMessage;
      changed.push(i);
    }
  };
  for (let i = 1; i < tailStart; i++) compactAt(i);
  // An eight-message tail can itself exceed the context cap after several
  // large tool results. Keep only the newest assistant/result exchange exact.
  if (transcriptBytes(next) > TRANSCRIPT_COMPACT_BYTES)
    for (let i = tailStart; i < messages.length - 2; i++) compactAt(i);
  // A large generated REPL program can exceed the cap in the newest exchange
  // even after all older results shrink. Only completed calls qualify: an
  // unanswered call after a crash must keep its original input for recovery.
  if (transcriptBytes(next) > TRANSCRIPT_COMPACT_BYTES) {
    const answered = new Set<string>();
    for (const message of next)
      if (message.role === "tool" && Array.isArray(message.content))
        for (const part of message.content as MessagePart[])
          if (part.type === "tool-result" && typeof part.toolCallId === "string")
            answered.add(part.toolCallId);
    for (let i = 1; i < next.length; i++) {
      const message = next[i]!;
      if (!Array.isArray(message.content)) continue;
      const compacted = (message.content as MessagePart[]).map((part) =>
        compactCompletedCall(part, answered),
      );
      if (JSON.stringify(compacted) !== JSON.stringify(message.content)) {
        next[i] = { ...message, content: compacted } as ModelMessage;
        if (!changed.includes(i)) changed.push(i);
      }
    }
  }
  // Tool results in the newest exchange are already durably recorded. If the
  // history still exceeds the limit, keep their call IDs and bounded summary.
  if (transcriptBytes(next) > TRANSCRIPT_COMPACT_BYTES)
    for (let i = Math.max(1, next.length - 2); i < next.length; i++) compactAt(i);
  if (!changed.length) return null;
  // Guard against compaction that fails to shrink below the trigger — callers
  // treat that as "nothing more we can do", not a loop of rewrites.
  if (transcriptBytes(next) >= transcriptBytes(messages)) return null;
  return { messages: next, changed };
}
