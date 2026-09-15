/**
 * AssistantBench (Yoran et al., 2024) validation split as a task manifest.
 *
 * Downloads the 33-task validation split through the Hugging Face datasets
 * server (no token needed), caches it under tests/benchmarks/reports/cache/,
 * and converts each row to the harness task shape. Gold answers stay as the
 * dataset gives them (string, number, list, or JSON object); the scorer
 * applies the strict rule described in run.mjs.
 *
 *   node tests/benchmarks/tasks/run.mjs --suite assistantbench --adapter vector
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(here, "../reports/cache");
const cachePath = join(cacheDir, "assistantbench-validation.json");
const ROWS_URL =
  "https://datasets-server.huggingface.co/rows?dataset=AssistantBench%2FAssistantBench&config=default&split=validation&offset=0&length=100";

export async function loadAssistantBench() {
  let rows;
  if (existsSync(cachePath)) {
    rows = JSON.parse(readFileSync(cachePath, "utf8"));
  } else {
    const res = await fetch(ROWS_URL, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`AssistantBench download failed: HTTP ${res.status}`);
    const body = await res.json();
    rows = body.rows.map((r) => r.row);
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, JSON.stringify(rows, null, 2));
  }
  return {
    suite: "assistantbench",
    tasks: rows.map((r) => ({
      id: r.id,
      // AssistantBench tasks start from a search engine; the runtime's
      // planner can navigate anywhere, so the start URL is a neutral search.
      url: "https://html.duckduckgo.com/html/",
      goal: r.task,
      expected: parseGold(r.answer),
      difficulty: r.difficulty,
      explanation: r.explanation,
    })),
  };
}

function parseGold(answer) {
  if (answer === null || answer === undefined) return { type: "text", value: "" };
  if (typeof answer === "number") return { type: "number", value: answer };
  const s = String(answer).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return { type: "number", value: Number(s) };
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return { type: "list", value: parsed };
    if (parsed && typeof parsed === "object") return { type: "object", value: parsed };
  } catch {
    // plain string
  }
  return { type: "text", value: s };
}
