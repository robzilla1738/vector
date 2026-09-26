import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_state_query(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
  if (params.entity === "responses") await s.responses?.flush();
  return s.state.query(params);
}
async function h_state_datasets(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
  return s.state.listDatasets(params as never);
}

export const stateMethods: Partial<Record<MethodName, MethodHandler>> = {
  "state.query": h_state_query,
  "state.datasets": h_state_datasets,
};
