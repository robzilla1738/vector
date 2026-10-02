import { MethodSchemas, type MethodName } from "@aux/contracts";
import { programContainsOperationCalls, programHasConsequentialSteps } from "../services/pages/executor.js";
import type { MentionAccess } from "../agent/turn-mentions.js";

type PageMethod = Extract<MethodName, `pages.${string}`>;
type Access = MentionAccess | "list" | "create" | "program" | "dialog" | "webmcp";
const access = Object.freeze({
  "pages.list": "list",
  "pages.open": "create",
  "pages.close": "act",
  "pages.moveToWindow": "act",
  "pages.reconcileWrite": "act",
  "pages.activate": "act",
  "pages.navigate": "act",
  "pages.back": "act",
  "pages.forward": "act",
  "pages.reload": "act",
  "pages.stop": "act",
  "pages.observe": "read",
  "pages.cuaExecute": "program",
  "pages.execute": "program",
  "pages.webmcp": "webmcp",
  "pages.extract": "read",
  "pages.elementInfo": "read",
  "pages.accessibilityHtml": "read",
  "pages.read": "read",
  "pages.waitFor": "read",
  "pages.console": "read",
  "pages.dialog": "dialog",
  "pages.network": "read",
  "pages.capture": "read",
  "pages.find": "read",
  "pages.stopFind": "read",
  "pages.zoom": "act",
  "pages.takeover": "act",
  "pages.pickElement": "read",
  "pages.resume": "act",
  "pages.openLive": "act",
} satisfies Record<PageMethod, Access>);
function isPageMethod(method: MethodName): method is PageMethod {
  return method.startsWith("pages.");
}

/** Authority follows the validated operation, never a caller's access label. */
export function pageToolTarget(
  method: MethodName,
  raw: unknown,
): { pageId: string; access: MentionAccess } | undefined {
  if (method === "sites.read") {
    const params = MethodSchemas["sites.read"].parse(raw);
    return { pageId: params.pageId, access: "read" };
  }
  if (method === "programs.run") {
    const params = MethodSchemas["programs.run"].parse(raw);
    return { pageId: params.pageId, access: "act" };
  }
  if (method === "responses.list") {
    const params = MethodSchemas["responses.list"].parse(raw);
    return { pageId: params.pageId, access: "read" };
  }
  if (method === "operations.invoke" || method === "operations.explain") {
    const params =
      method === "operations.invoke"
        ? MethodSchemas["operations.invoke"].parse(raw)
        : MethodSchemas["operations.explain"].parse(raw);
    return params.pageId
      ? { pageId: params.pageId, access: method === "operations.invoke" ? "act" : "read" }
      : undefined;
  }
  if (!isPageMethod(method)) return undefined;
  const requirement = access[method];
  if (requirement === "list" || requirement === "create") return undefined;
  if (requirement === "program") {
    const params =
      method === "pages.cuaExecute"
        ? MethodSchemas["pages.cuaExecute"].parse(raw)
        : MethodSchemas["pages.execute"].parse(raw);
    return {
      pageId: params.program.pageId,
      access:
        !programHasConsequentialSteps(params.program) && !programContainsOperationCalls(params.program)
          ? "read"
          : "act",
    };
  }
  if (requirement === "dialog") {
    const params = MethodSchemas["pages.dialog"].parse(raw);
    return { pageId: params.pageId, access: !params.action || params.action === "list" ? "read" : "act" };
  }
  if (requirement === "webmcp") {
    const params = MethodSchemas["pages.webmcp"].parse(raw);
    return { pageId: params.pageId, access: params.op === "call" ? "act" : "read" };
  }
  const params = MethodSchemas[method].parse(raw);
  if ("pageId" in params && typeof params.pageId === "string")
    return { pageId: params.pageId, access: requirement };
  throw new Error(`The page authority target for ${method} is missing.`);
}
