import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_sets_create(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.sets.create(params as never);
}
async function h_sets_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.sets.get(params.setId);
}
async function h_sets_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.sets.list();
}
async function h_sets_map(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.mapSet(params as never);
}
async function h_sets_results(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = params as { setId: string; status?: "ok" | "partial" | "error" };
  return s.sets.results(p.setId, p.status);

  // runs
}

export const setsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "sets.create": h_sets_create,
  "sets.get": h_sets_get,
  "sets.list": h_sets_list,
  "sets.map": h_sets_map,
  "sets.results": h_sets_results,
};
