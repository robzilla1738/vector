import { AuxError } from "@aux/contracts";

/** Qwen and other reasoners wrap the answer in <think>…</think>. */
export function stripReasoning(text: string): string {
  return text.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "").replace(/<think\b[^>]*>[\s\S]*$/gi, "");
}

/** Pull the first balanced JSON value out of a text completion (fences or prose allowed around it). */
export function extractJson(text: string): unknown {
  const body = stripReasoning(text);
  const start = body.search(/[{[]/);
  if (start < 0) throw new AuxError("model_output_invalid", "model returned no JSON value");
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (let i = start; i < body.length; i++) {
    const c = body[i]!;
    if (esc) {
      esc = false;
      continue;
    }
    if (c === "\\") {
      if (inStr) esc = true;
      continue;
    }
    if (c === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") {
      if (stack.pop() !== (c === "}" ? "{" : "[")) break;
      if (stack.length === 0) return JSON.parse(body.slice(start, i + 1));
    }
  }
  throw new AuxError("model_output_invalid", "model returned truncated or unbalanced JSON");
}
