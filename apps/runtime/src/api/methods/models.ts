import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_models_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.settings.listModels();
}
async function h_models_probe(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.settings.probe((params as { modelId?: string }).modelId);
}

export const modelsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "models.list": h_models_list,
  "models.probe": h_models_probe,
};
