import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_operations_list(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  return s.operations.list((params as { siteKey?: string }).siteKey);
}
async function h_operations_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  const p = params as { siteKey: string; name: string };
  return s.operations.get(p.siteKey, p.name);
}
async function h_operations_saveProgram(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  return s.operations.saveFromProgram(params as never);
}
async function h_operations_saveRequest(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  return s.operations.saveRequestImpl(params as never);
}
async function h_operations_invoke(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  const p = params as { pageId?: string };
  return p.pageId
    ? withExternalPage(p.pageId, () => s.operations!.invoke(params as never), undefined, true)
    : s.operations.invoke(params as never);
}
async function h_operations_explain(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  const p = params as { siteKey: string; name: string; pageId?: string };
  return s.operations.explain(p.siteKey, p.name, { pageId: p.pageId });
}
async function h_operations_setImplState(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  const p = params as { implId: string; state: "candidate" | "validated" | "shadow" | "quarantined" };
  return s.operations.setImplState(p.implId, p.state);
}
async function h_operations_disable(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  // quarantine is the disable — the impl stays on record but never routes
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  return s.operations.setImplState((params as { implId: string }).implId, "quarantined");
}
async function h_operations_forget(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  const p = params as { siteKey: string; name: string };
  return s.operations.forget(p.siteKey, p.name);
}
async function h_operations_compile(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
  return s.operations.compileFromRun(params as { runId: string; siteKey?: string; name?: string });
}

export const operationsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "operations.list": h_operations_list,
  "operations.get": h_operations_get,
  "operations.saveProgram": h_operations_saveProgram,
  "operations.saveRequest": h_operations_saveRequest,
  "operations.invoke": h_operations_invoke,
  "operations.explain": h_operations_explain,
  "operations.setImplState": h_operations_setImplState,
  "operations.disable": h_operations_disable,
  "operations.forget": h_operations_forget,
  "operations.compile": h_operations_compile,
};
