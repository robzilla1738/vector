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
    return isMediaString(value) ? { prunedMedia: true, bytes: value.length, mime: value.startsWith("data:") ? value.slice(5, value.indexOf(";")) : "raw" } : value;
  }
  if (Array.isArray(value)) return value.map((item) => pruneMedia(item, depth + 1));
  if (typeof value === "object") {
    // Only plain objects — Error and other class instances must keep their
    // identity so downstream typing (error-text results) still holds.
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) out[key] = pruneMedia(item, depth + 1);
    return out;
  }
  return value;
}

/**
 * The per-turn tool budget: results keep their slot but oversize outputs
 * shrink to a marker once the running total passes the cap. The smallest
 * outputs are kept verbatim — statuses and ids stay visible to the model.
 */
export function budgetToolOutputs<T extends { output?: unknown }>(results: T[]): T[] {
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
        note: "Tool output exceeded this step's 40 KB tool budget. Re-issue the call with a narrower query, or read the spilled artifact if one was written.",
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
    return { ...part, output: { type: "json", value: { compacted: true, bytes: bytes(part.output), hint: "This tool result was compacted — re-issue the call if you still need its content." } } };
  if ((part.type === "text" || part.type === "reasoning") && typeof part.text === "string" && part.text.length > COMPACT_TEXT_CHARS)
    return { ...part, text: `${part.text.slice(0, COMPACT_TEXT_CHARS)}… [compacted ${part.text.length - COMPACT_TEXT_CHARS} chars]` };
  return part;
}

/**
 * Deterministic compaction: keep the task and newest exchange verbatim. First
 * shrink older history; if still over budget, shrink the older part of the
 * tail. Returns changed indexes for one durable transaction.
 */
export function compactMessages(messages: ModelMessage[]): { messages: ModelMessage[]; changed: number[] } | null {
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
  if (!changed.length) return null;
  // Guard against compaction that fails to shrink below the trigger — callers
  // treat that as "nothing more we can do", not a loop of rewrites.
  if (transcriptBytes(next) >= transcriptBytes(messages)) return null;
  return { messages: next, changed };
}
