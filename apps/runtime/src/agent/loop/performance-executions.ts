import { executingReplSessionCount, type ReplPool } from "./repl.js";

// Process-local evidence follows actual host lifetimes. This registry creates
// neither a VM nor a page grant and has no external API or selector surface.
const pools = new Set<ReplPool>();
export function registerPerformanceReplPool(pool: ReplPool): () => void {
  pools.add(pool);
  return () => pools.delete(pool);
}
export function observePerformanceExecutions() {
  const now = Date.now();
  if (pools.size > 8) return undefined;
  const cells = [...pools].flatMap((pool) => pool.performanceExecutions(now));
  const actual = executingReplSessionCount();
  if (actual > 128 || cells.length !== actual) return undefined;
  return cells.sort((a, b) => a.runId.localeCompare(b.runId));
}
export function currentPerformanceExecutions() {
  const cells = observePerformanceExecutions();
  if (!cells) return undefined;
  if (
    cells.length !== 5 ||
    new Set(cells.map((cell) => cell.runId)).size !== 5 ||
    new Set(cells.map((cell) => cell.cellId)).size !== 5
  )
    return undefined;
  return cells.sort((a, b) => a.runId.localeCompare(b.runId));
}
