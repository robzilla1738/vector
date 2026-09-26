import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_datasets_rows(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
  const p = params as { datasetId: string; limit?: number };
  return s.state.rows(p.datasetId).slice(0, p.limit ?? 5000);
}
async function h_datasets_transform(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
  const p = params as { datasetId: string; op: string; args?: Record<string, unknown> };
  return s.state.transform(p.datasetId, p.op, p.args);
}
async function h_datasets_save(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
  return s.state.saveDataset(params as never);
}

export const datasetsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "datasets.rows": h_datasets_rows,
  "datasets.transform": h_datasets_transform,
  "datasets.save": h_datasets_save,
};
