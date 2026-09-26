import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_translate_page(ctx: MethodCtx): Promise<unknown> {
  const { params, translate } = ctx;
  return translate.page(params.texts, params.target, params.context);
}
async function h_translate_text(ctx: MethodCtx): Promise<unknown> {
  const { params, translate } = ctx;
  return translate.text(params.text, params.target, params.context);
}

export const translateMethods: Partial<Record<MethodName, MethodHandler>> = {
  "translate.page": h_translate_page,
  "translate.text": h_translate_text,
};
