import type { RunWorkTrace } from "@aux/contracts/transcript";
import { looksLikeSecret, redactForModel } from "../agent/policy.js";
import type { TranscriptStore } from "../agent/loop/transcript.js";

const SECRET_TEXT =
  /\b(?:sk-[\w-]{16,}|ghp_[\w]{20,}|gh[ousr]_[\w]{20,}|github_pat_[\w]{20,}|xox[baprs]-[\w-]{10,}|AKIA[0-9A-Z]{16}|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]*|Bearer\s+[\w.+/=-]{8,})/gi;

function preview(value: unknown, limit: number) {
  let truncated = false;
  let remaining = limit;
  const visit = (item: unknown, depth: number): unknown => {
    if (remaining <= 0 || depth > 8) {
      truncated = true;
      return "[excerpt limit]";
    }
    remaining--;
    if (typeof item === "string") {
      const redacted = looksLikeSecret(item) ? "[redacted]" : item.replace(SECRET_TEXT, "[redacted]");
      const text = redacted.slice(0, remaining);
      truncated ||= text.length < redacted.length;
      remaining -= text.length;
      return text;
    }
    if (Array.isArray(item)) {
      truncated ||= item.length > 50;
      return item.slice(0, 50).map((part) => visit(part, depth + 1));
    }
    if (item && typeof item === "object") {
      const entries = Object.entries(item);
      truncated ||= entries.length > 100;
      return Object.fromEntries(
        entries.slice(0, 100).map(([key, part]) => {
          truncated ||= key.length > 100;
          return [key.slice(0, 100), visit(part, depth + 1)];
        }),
      );
    }
    return item;
  };
  const safe = redactForModel(visit(value, 0));
  const serialized = typeof safe === "string" ? safe : (JSON.stringify(safe, null, 2) ?? "null");
  const bytes = Buffer.from(serialized, "utf8");
  truncated ||= bytes.length > limit;
  return { text: new TextDecoder().decode(bytes.subarray(0, limit), { stream: true }), truncated };
}

/** Inert, redacted excerpts of the original encrypted call/result pairs, never executable recipes. */
export function projectRunWorkTrace(
  transcript: TranscriptStore,
  runId: string,
  beforeSeq?: number,
  limit = 40,
): RunWorkTrace {
  const page = transcript.pageEntries(runId, beforeSeq);
  const calls: (() => RunWorkTrace["calls"][number])[] = [];
  let omittedCalls = 0;
  for (const entry of page.entries) {
    if (entry.message.role !== "assistant" || !Array.isArray(entry.message.content)) continue;
    const next = transcript.messageAfter(runId, entry.seq);
    for (const part of entry.message.content) {
      if (part.type !== "tool-call") continue;
      if (part.toolCallId.length > 300 || part.toolName.length > 100) {
        omittedCalls++;
        continue;
      }
      calls.push(() => {
        const result =
          next?.role === "tool"
            ? next.content
                .filter((result) => result.type === "tool-result")
                .find((result) => result.toolCallId === part.toolCallId && result.toolName === part.toolName)
            : undefined;
        const input = preview(part.input, 8_192);
        const output =
          result && preview("value" in result.output ? result.output.value : result.output, 16_384);
        return {
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          sequence: entry.seq,
          status: !result ? "pending" : result.output.type.startsWith("error") ? "failed" : "completed",
          input: input.text,
          ...(output ? { output: output.text } : {}),
          inputTruncated: input.truncated,
          outputTruncated: output?.truncated ?? false,
        };
      });
      if (calls.length > limit) {
        calls.shift();
        omittedCalls++;
      }
    }
  }
  return {
    runId,
    calls: calls.map((call) => call()),
    omittedCalls,
    ...(page.earlierSequence !== undefined ? { earlierSequence: page.earlierSequence } : {}),
  };
}
