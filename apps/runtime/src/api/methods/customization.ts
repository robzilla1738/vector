import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_customization_zap_pick(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.pages.pickZap(params.pageId, params.expectedDocumentEpoch, params.timeoutMs);
}
async function h_customization_zap_list(ctx: MethodCtx): Promise<unknown> {
  const { customization, params } = ctx;
  return customization.list(params.origin);
}
async function h_customization_zap_add(ctx: MethodCtx): Promise<unknown> {
  const { customization, params, s } = ctx;
  const count = await s.pages.countZapMatches(
    params.pageId,
    params.expectedDocumentEpoch,
    params.origin,
    params.selector,
  );
  return customization.add(params.origin, params.selector, count);
}
async function h_customization_zap_remove(ctx: MethodCtx): Promise<unknown> {
  const { customization, params } = ctx;
  return { removed: customization.remove(params.ruleId) };
}
async function h_customization_css_get(ctx: MethodCtx): Promise<unknown> {
  const { customization, params } = ctx;
  return customization.getCss(params.origin);
}
async function h_customization_css_set(ctx: MethodCtx): Promise<unknown> {
  const { customization, params } = ctx;
  return customization.setCss(params.origin, params.css);
}
async function h_customization_css_effective(ctx: MethodCtx): Promise<unknown> {
  const { customization, params } = ctx;
  return { origin: params.origin, css: customization.effectiveCss(params.origin) };
}
async function h_customization_css_apply(ctx: MethodCtx): Promise<unknown> {
  const { customization, params, s } = ctx;
  const page = s.pages.get(params.pageId);
  const origin = new URL(page.url).origin;
  return s.pages.applyUserCss(
    params.pageId,
    params.expectedDocumentEpoch,
    customization.effectiveCss(origin),
  );
}

export const customizationMethods: Partial<Record<MethodName, MethodHandler>> = {
  "customization.zap.pick": h_customization_zap_pick,
  "customization.zap.list": h_customization_zap_list,
  "customization.zap.add": h_customization_zap_add,
  "customization.zap.remove": h_customization_zap_remove,
  "customization.css.get": h_customization_css_get,
  "customization.css.set": h_customization_css_set,
  "customization.css.effective": h_customization_css_effective,
  "customization.css.apply": h_customization_css_apply,
};
