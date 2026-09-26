import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_traces_list(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
  const p = params as { since?: number; runId?: string; limit?: number };
  return s.tracer.spansSince(p.since ?? 0, p.limit ?? 500, p.runId);
}
async function h_traces_summary(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
  return s.tracer.summary((params as { runId: string }).runId);
}
async function h_traces_counters(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
  return s.tracer.counters(); // flushes the in-memory increments first
}

export const tracesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "traces.list": h_traces_list,
  "traces.summary": h_traces_summary,
  "traces.counters": h_traces_counters,
};
