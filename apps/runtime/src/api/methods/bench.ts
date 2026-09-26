import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_bench_run(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = params as { task?: string; repeats?: number };
  return s.benchRun(p.task, p.repeats);

  // ---- runtime-vnext: response capture / state / datasets / operations / traces ----
}

export const benchMethods: Partial<Record<MethodName, MethodHandler>> = {
  "bench.run": h_bench_run,
};
