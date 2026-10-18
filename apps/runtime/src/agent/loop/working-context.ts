import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import type { JSONValue } from "ai";
import type { ModelMessage } from "./types.js";

const DEFAULT_CONTEXT_TOKENS = 64_000;
const MAX_INPUT_TOKENS = 128_000;
const KEEP_RECENT_MESSAGES = 8;
const MIN_COMPACT_BYTES = 2_048;
const EXCERPT_CHARS = 1_024;
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
  "memory_read",
  "desktop_context_search",
  "desktop_context_read",
  "websearch",
  "webfetch",
  "package_skill",
  "package_template",
  "package_workflow",
  "coder_worktree_diff",
]);
const PROTECTED_TOOLS = new Set([
  "ask_user_question",
  "request_action_confirmation",
  "write_todos",
  "goal_update",
  "submit_result",
]);
const EVIDENCE_FIELDS = new Set([
  "id",
  "ids",
  "url",
  "urls",
  "uri",
  "href",
  "ref",
  "refs",
  "path",
  "paths",
  "version",
  "revision",
  "title",
  "quote",
  "locator",
  "sourceId",
  "chunkId",
  "startLine",
  "endLine",
  "sha256",
  "status",
  "state",
  "exitCode",
  "timedOut",
  "signal",
  "interrupted",
  "error",
  "diagnostic",
  "command",
  "workdir",
  "fileOutcomes",
]);
const UNRESOLVED_STATES = new Set([
  "pending",
  "queued",
  "running",
  "starting",
  "yielded",
  "parked",
  "needs_input",
  "uncertain",
  "interrupted",
  "unconfirmed",
  "partially_applied",
]);
const bytes = (value: unknown): number => Buffer.byteLength(JSON.stringify(value ?? null), "utf8");

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function toolValue(output: unknown): unknown {
  const record = object(output);
  return record && "value" in record ? record.value : output;
}

/** Preserve every source/effect reference, including nested collections, without truncating IDs. */
export function retainedEvidence(value: unknown): unknown {
  if (Array.isArray(value)) {
    const entries = value.map(retainedEvidence).filter((entry) => entry !== undefined);
    return entries.length ? entries : undefined;
  }
  const record = object(value);
  if (!record) return undefined;
  const evidence: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (EVIDENCE_FIELDS.has(key) || /(?:Id|Ids|Url|Urls|Path|Paths|Version|Revision|Epoch|Hash)$/.test(key))
      evidence[key] = entry;
    else {
      const nested = retainedEvidence(entry);
      if (nested !== undefined) evidence[key] = nested;
    }
  }
  return Object.keys(evidence).length ? evidence : undefined;
}

export function hasUnresolvedEffect(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasUnresolvedEffect);
  const record = object(value);
  if (!record) return false;
  return Object.entries(record).some(
    ([key, entry]) =>
      ((key === "status" || key === "state") && UNRESOLVED_STATES.has(String(entry))) ||
      (["pending", "running", "uncertain"].includes(key) && entry === true) ||
      (key === "uncertainIntentIds" && Array.isArray(entry) && entry.length > 0) ||
      hasUnresolvedEffect(entry),
  );
}

function sourceKey(toolName: string, value: unknown): string | undefined {
  const record = object(value);
  if (!record) return undefined;
  const content = object(record.content);
  const source = record.pageId ?? record.url ?? record.path ?? content?.url;
  return typeof source === "string" ? `${toolName}:${source}` : undefined;
}

function elidedValue(value: unknown, toolCallId: string, toolName: string): unknown {
  const record = object(value);
  const content = object(record?.content);
  const text =
    [record?.text, content?.text, record?.stdout, record?.stderr]
      .filter((part): part is string => typeof part === "string")
      .join("\n") || (typeof value === "string" ? value : JSON.stringify(value));
  return {
    contextElided: true,
    toolCallId,
    originalBytes: bytes(value),
    evidence: retainedEvidence(value),
    excerpt:
      text.length <= EXCERPT_CHARS * 2
        ? { text }
        : {
            start: text.slice(0, EXCERPT_CHARS),
            end: text.slice(-EXCERPT_CHARS),
            omittedCharacters: text.length - EXCERPT_CHARS * 2,
          },
    recovery: READ_TOOLS.has(toolName)
      ? "Excerpt only; the original result remains in the durable transcript. Read the source again with a narrower query if needed; do not cite omitted text."
      : "Excerpt only; the original input/result remains in the durable transcript. Do not repeat effects to recover output. Inspect durable receipts, diff or process logs; reconcile uncertainty before writing.",
  };
}

/** Serialized UTF-8 bytes / 3 is an estimate, not a provider tokenizer. */
export function messageTokens(message: ModelMessage): number {
  if (message.role !== "user" || !Array.isArray(message.content)) return Math.ceil(bytes(message) / 3);
  let images = 0;
  const content = message.content.map((part) => {
    if (part.type !== "image") return part;
    images++;
    return { type: "image", image: "[selected image]" };
  });
  // Image encoding size is unrelated to provider token cost; reserve a per-image allowance.
  return Math.ceil(bytes({ ...message, content }) / 3) + images * 2_048;
}

export interface WorkingContextOptions {
  contextTokens?: number;
  maxOutputTokens: number;
  system: string;
  toolsBytes: number;
}

/** Pure request projection: durable messages and protected instructions never change. */
export function projectWorkingContext(
  messages: ModelMessage[],
  options: WorkingContextOptions,
): {
  messages: ModelMessage[];
  estimatedInputTokens: number;
  inputBudgetTokens: number;
} {
  const contextTokens = options.contextTokens ?? DEFAULT_CONTEXT_TOKENS;
  const inputBudgetTokens = Math.min(
    MAX_INPUT_TOKENS,
    Math.floor(contextTokens * 0.9) - options.maxOutputTokens,
  );
  const next = [...messages];
  const sizes = messages.map(messageTokens);
  let estimatedInputTokens =
    Math.ceil((Buffer.byteLength(options.system, "utf8") + options.toolsBytes) / 3) +
    sizes.reduce((sum, size) => sum + size, 0);
  const result = () => ({ messages: next, estimatedInputTokens, inputBudgetTokens });
  if (estimatedInputTokens <= inputBudgetTokens) return result();

  const answered = new Set<string>();
  const unresolved = new Set<string>();
  const latestSource = new Map<string, string>();
  const latestRead = new Map<string, string>();
  const candidates: {
    index: number;
    partIndex: number;
    kind: "input" | "output";
    toolCallId: string;
    toolName: string;
    source?: string;
    readHash?: string;
  }[] = [];
  for (const [index, message] of messages.entries()) {
    if (message.role !== "tool") continue;
    for (const [partIndex, part] of message.content.entries()) {
      if (part.type !== "tool-result") continue;
      answered.add(part.toolCallId);
      if (PROTECTED_TOOLS.has(part.toolName)) continue;
      const value = toolValue(part.output);
      if (hasUnresolvedEffect(value)) {
        unresolved.add(part.toolCallId);
        continue;
      }
      const source = sourceKey(part.toolName, value);
      if (source) latestSource.set(source, part.toolCallId);
      const serialized = JSON.stringify(value ?? null);
      const readHash = READ_TOOLS.has(part.toolName)
        ? createHash("sha256").update(`${part.toolName}\0`).update(serialized).digest("hex")
        : undefined;
      if (readHash) latestRead.set(readHash, part.toolCallId);
      if (Buffer.byteLength(serialized, "utf8") > (readHash ? 512 : MIN_COMPACT_BYTES))
        candidates.push({
          index,
          partIndex,
          kind: "output",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          source,
          readHash,
        });
    }
  }
  for (const [index, message] of messages.entries()) {
    if (message.role !== "assistant" || !Array.isArray(message.content)) continue;
    for (const [partIndex, part] of message.content.entries()) {
      if (
        part.type === "tool-call" &&
        answered.has(part.toolCallId) &&
        !PROTECTED_TOOLS.has(part.toolName) &&
        !unresolved.has(part.toolCallId) &&
        bytes(part.input) > MIN_COMPACT_BYTES
      )
        candidates.push({
          index,
          partIndex,
          kind: "input",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
        });
    }
  }
  const priority = (candidate: (typeof candidates)[number]): number => {
    if (candidate.readHash && latestRead.get(candidate.readHash) !== candidate.toolCallId) return -1;
    const read = READ_TOOLS.has(candidate.toolName);
    const old = candidate.index < messages.length - KEEP_RECENT_MESSAGES;
    if (candidate.kind === "input") return old ? 3 : 4;
    if (read && candidate.source && latestSource.get(candidate.source) !== candidate.toolCallId) return 0;
    if (old) return read ? 1 : 2;
    return read ? 5 : 6;
  };
  candidates.sort((a, b) => priority(a) - priority(b) || a.index - b.index || a.partIndex - b.partIndex);
  const replace = (index: number, message: ModelMessage) => {
    const size = messageTokens(message);
    if (size >= sizes[index]!) return;
    estimatedInputTokens += size - sizes[index]!;
    sizes[index] = size;
    next[index] = message;
  };
  for (const candidate of candidates) {
    const message = next[candidate.index]!;
    if (candidate.kind === "output" && message.role === "tool") {
      const duplicateId = candidate.readHash ? latestRead.get(candidate.readHash) : undefined;
      const content = message.content.map((part, index) =>
        index === candidate.partIndex && part.type === "tool-result"
          ? {
              ...part,
              output: {
                type: part.output.type.startsWith("error-") ? ("error-json" as const) : ("json" as const),
                value: (duplicateId && duplicateId !== part.toolCallId
                  ? {
                      contextElided: true,
                      identicalResultToolCallId: duplicateId,
                      evidence: retainedEvidence(toolValue(part.output)),
                      recovery:
                        "This exact read result also appeared at the referenced tool call. Original results remain in the durable transcript.",
                    }
                  : elidedValue(toolValue(part.output), part.toolCallId, part.toolName)) as JSONValue,
              },
            }
          : part,
      );
      replace(candidate.index, { ...message, content });
    }
    // Unanswered and unresolved inputs never become candidates, so recovery
    // and reconciliation retain the original action authority.
    if (candidate.kind === "input" && message.role === "assistant" && Array.isArray(message.content)) {
      const content = message.content.map((part, index) =>
        index === candidate.partIndex && part.type === "tool-call"
          ? { ...part, input: elidedValue(part.input, part.toolCallId, part.toolName) }
          : part,
      );
      replace(candidate.index, { ...message, content });
    }
    if (estimatedInputTokens <= inputBudgetTokens) return result();
  }
  return result();
}

export function prepareWorkingContext(messages: ModelMessage[], options: WorkingContextOptions) {
  const result = projectWorkingContext(messages, options);
  if (result.estimatedInputTokens <= result.inputBudgetTokens) return result;
  const { estimatedInputTokens, inputBudgetTokens } = result;
  throw new AuxError(
    "model_error",
    `The working context needs approximately ${estimatedInputTokens.toLocaleString("en-US")} input tokens; ` +
      `this route's budget is ${Math.max(0, inputBudgetTokens).toLocaleString("en-US")}. ` +
      "Choose a model with a larger context or narrow selected sources. User instructions, decisions and unresolved effects were preserved; the original history is intact. No model call was made.",
  );
}
