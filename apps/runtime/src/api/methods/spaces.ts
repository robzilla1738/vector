import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_spaces_list(ctx: MethodCtx): Promise<unknown> {
  const { spaces } = ctx;
  return spaces.list();
}
async function h_spaces_import(ctx: MethodCtx): Promise<unknown> {
  const { params, spaces } = ctx;
  return spaces.import(params.spaces);
}
async function h_spaces_create(ctx: MethodCtx): Promise<unknown> {
  const { params, spaces } = ctx;
  return spaces.create(params.name, params.color, params.grain, params.theme);
}
async function h_spaces_update(ctx: MethodCtx): Promise<unknown> {
  const { params, spaces } = ctx;
  const { id, ...patch } = params;
  return spaces.update(id, patch);
}

export const spacesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "spaces.list": h_spaces_list,
  "spaces.import": h_spaces_import,
  "spaces.create": h_spaces_create,
  "spaces.update": h_spaces_update,
};
