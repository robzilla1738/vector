import { AuxError } from "@aux/contracts";
import { pageDerivativeCache } from "../../services/ai-result-cache.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

function boundCache(ctx: MethodCtx) {
  const source = ctx.params.source;
  if (!source || ctx.client.external || ctx.client.codeMode) return undefined;
  const page = ctx.s.pages.get(source.pageId);
  if (page.url !== source.expectedUrl ||
    (source.expectedDocumentEpoch !== undefined && page.documentEpoch !== source.expectedDocumentEpoch))
    throw new AuxError("conflict", "The translation source document changed.");
  return pageDerivativeCache(ctx.s, [page.pageId]);
}

async function h_translate_page(ctx: MethodCtx): Promise<unknown> {
  const { params, translate } = ctx;
  return translate.page(params.texts, params.target, params.context, boundCache(ctx));
}
async function h_translate_text(ctx: MethodCtx): Promise<unknown> {
  const { params, translate } = ctx;
  return translate.text(params.text, params.target, params.context, boundCache(ctx));
}

export const translateMethods: Partial<Record<MethodName, MethodHandler>> = {
  "translate.page": h_translate_page,
  "translate.text": h_translate_text,
};
