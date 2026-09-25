import { MethodSchemas, ResultSchemas, type MethodName, type MethodParams, type MethodResult } from "./api.js";

export type AgentSurface = "sdk" | "mcp" | "cli" | "code";
export type AgentLayer = "management" | "playwright" | "dom" | "ax" | "cua" | "content" | "dev";
export type AgentDocMode = "included" | "model" | "lookup";

export interface AgentApiEntry<M extends MethodName = MethodName> {
  path: string;
  method: M;
  layer: AgentLayer;
  summary: string;
  documented: AgentDocMode;
  when?: string;
  requiredFor?: readonly string[];
  unsupportedByDefaultIn?: readonly AgentSurface[];
  /** Capability overrides are checked before a member is exposed. */
  capability?: string;
}

const entry = <M extends MethodName>(value: AgentApiEntry<M>) => value;

/**
 * The one surface catalog. Parameter and result types are the matching
 * MethodSchemas/ResultSchemas; every transport projects this catalog.
 * A method without a safe host implementation is absent, never a stub.
 */
export const AgentApiManifest = [
  entry({ path: "js.run", method: "agent.js.run", layer: "management", summary: "Run QuickJS code with manifest-backed Aux handles.", documented: "model", unsupportedByDefaultIn: ["code"] }),
  entry({ path: "js.reset", method: "agent.js.reset", layer: "management", summary: "Discard one code-mode session.", documented: "lookup", unsupportedByDefaultIn: ["code"] }),
  entry({ path: "tabs.list", method: "pages.list", layer: "management", summary: "List accessible tabs and their stable Aux page IDs.", documented: "included" }),
  entry({ path: "tabs.open", method: "pages.open", layer: "management", summary: "Open a tab under the caller's page authority.", documented: "model", unsupportedByDefaultIn: ["code"] }),
  entry({ path: "tabs.close", method: "pages.close", layer: "management", summary: "Close a tab owned by this turn.", documented: "model", unsupportedByDefaultIn: ["code"] }),
  entry({ path: "tabs.playwright.domSnapshot", method: "pages.observe", layer: "playwright", summary: "Read a structured DOM snapshot and stable element refs.", documented: "included" }),
  entry({ path: "tabs.playwright.elementInfo", method: "pages.elementInfo", layer: "playwright", summary: "Identify the observed element at viewport coordinates.", documented: "model" }),
  entry({ path: "tabs.playwright.evaluate", method: "pages.read", layer: "playwright", summary: "Evaluate a declarative read query for title, URL, text, count or attribute.", documented: "lookup", when: "a snapshot cannot answer a narrow read", requiredFor: ["analysis"] }),
  entry({ path: "tabs.playwright.extract", method: "pages.extract", layer: "playwright", summary: "Extract named fields from the current document.", documented: "model" }),
  entry({ path: "tabs.playwright.waitFor", method: "pages.waitFor", layer: "playwright", summary: "Wait for a declarative page condition.", documented: "model" }),
  entry({ path: "tabs.dom.observe", method: "pages.observe", layer: "dom", summary: "Observe Aux refs and current document epoch.", documented: "model" }),
  entry({ path: "tabs.dom.accessibilityHtml", method: "pages.accessibilityHtml", layer: "dom", summary: "Read viewport-clipped accessibility HTML with Aux handles.", documented: "lookup", requiredFor: ["accessibility"] }),
  entry({ path: "tabs.dom.execute", method: "pages.execute", layer: "dom", summary: "Run a typed program through the guarded journal and grants.", documented: "included" }),
  entry({ path: "tabs.dom_cua.observe", method: "pages.observe", layer: "dom", summary: "Alias for Aux ref observation.", documented: "lookup" }),
  entry({ path: "tabs.dom_cua.execute", method: "pages.execute", layer: "dom", summary: "Alias for guarded Aux ref actions.", documented: "lookup" }),
  entry({ path: "tabs.ax.observe", method: "pages.observe", layer: "ax", summary: "Read the indexed accessibility view when enabled for this browser.", documented: "lookup", when: "AX support is enabled after benchmark qualification", requiredFor: ["accessibility"], capability: "ax", unsupportedByDefaultIn: ["sdk", "mcp", "cli", "code"] }),
  entry({ path: "tabs.ax.write", method: "pages.execute", layer: "ax", summary: "Apply an accessibility action against a current observation revision.", documented: "lookup", capability: "ax", unsupportedByDefaultIn: ["sdk", "mcp", "cli", "code"] }),
  entry({ path: "tabs.cua.capture", method: "pages.capture", layer: "cua", summary: "Capture a page image with document epoch provenance.", documented: "model", requiredFor: ["visual"] }),
  entry({ path: "tabs.cua.execute", method: "pages.cuaExecute", layer: "cua", summary: "Run pixel actions with a current document epoch and captured viewport.", documented: "lookup", requiredFor: ["visual"] }),
  entry({ path: "tabs.content.text", method: "pages.observe", layer: "content", summary: "Read page text and headings.", documented: "model" }),
  entry({ path: "tabs.dialog", method: "pages.dialog", layer: "management", summary: "List or respond to a typed browser dialog.", documented: "lookup", unsupportedByDefaultIn: ["code"] }),
  entry({ path: "tabs.dev.logs", method: "pages.console", layer: "dev", summary: "Read recent page console lines.", documented: "lookup", requiredFor: ["debugging"] }),
  entry({ path: "history.search", method: "history.list", layer: "management", summary: "Search the derived browser history index.", documented: "lookup" }),
] as const;

export type AgentApiPath = (typeof AgentApiManifest)[number]["path"];
export type AgentApiMethod<P extends AgentApiPath> = Extract<typeof AgentApiManifest[number], { path: P }>["method"];
export type AgentApiParams<P extends AgentApiPath> = MethodParams<AgentApiMethod<P>>;
export type AgentApiResult<P extends AgentApiPath> = MethodResult<AgentApiMethod<P>>;
type TreeForPath<P extends AgentApiPath, S extends string = P> = S extends `${infer Key}.${infer Rest}`
  ? { [K in Key]: TreeForPath<P, Rest> }
  : { [K in S]: (params: AgentApiParams<P>) => Promise<AgentApiResult<P>> };
type UnionToIntersection<U> = (U extends unknown ? (value: U) => void : never) extends (value: infer I) => void ? I : never;
type DefaultPath<E extends typeof AgentApiManifest[number]> = E extends { capability: string } ? never
  : E extends { unsupportedByDefaultIn: readonly AgentSurface[] }
    ? "sdk" extends E["unsupportedByDefaultIn"][number] ? never : E["path"]
    : E["path"];
export type DefaultAgentApiPath = DefaultPath<typeof AgentApiManifest[number]>;
/** Compile-time shape of the default manifest-generated SDK API. */
export type AgentApiTree = UnionToIntersection<{ [P in DefaultAgentApiPath]: TreeForPath<P> }[DefaultAgentApiPath]>;
export type AgentApiSupportOverrides = Partial<Record<AgentApiPath, boolean>>;
export interface AgentApiSupport {
  surface: AgentSurface;
  capabilities?: ReadonlySet<string>;
  apiSupportOverrides?: AgentApiSupportOverrides;
}

export function supportedAgentApi(support: AgentApiSupport): typeof AgentApiManifest[number][] {
  return AgentApiManifest.filter(item => {
    const override = support.apiSupportOverrides?.[item.path];
    if (override === false) return false;
    if (item.capability && !support.capabilities?.has(item.capability)) return false;
    return override === true || !item.unsupportedByDefaultIn?.includes(support.surface);
  });
}

export function agentApiDocs(support: AgentApiSupport, mode: AgentDocMode, requiredFor?: string): string {
  const entries = supportedAgentApi(support).filter(item =>
    item.documented === "included" || mode !== "included" &&
    (item.documented === "model" || mode === "lookup") &&
    (!item.requiredFor?.length || requiredFor && item.requiredFor.includes(requiredFor)));
  return entries.map(item => `- aux.${item.path}(params): ${item.summary}${item.when ? ` When: ${item.when}.` : ""}`).join("\n");
}

/** A nested Proxy exposes only supported methods; missing members are undefined. */
export function createAgentApi(
  dispatch: <M extends MethodName>(method: M, params: MethodParams<M>) => Promise<MethodResult<M>>,
  support: AgentApiSupport,
): AgentApiTree {
  const root: Record<string, unknown> = Object.create(null);
  for (const item of supportedAgentApi(support)) {
    const parts = item.path.split(".");
    let parent = root;
    for (const part of parts.slice(0, -1)) {
      parent = (parent[part] ??= Object.create(null)) as Record<string, unknown>;
    }
    parent[parts.at(-1)!] = async (params: unknown = {}) => {
      const parsed = MethodSchemas[item.method].parse(params) as never;
      const result = await dispatch(item.method, parsed);
      return ResultSchemas[item.method].parse(result);
    };
  }
  const hide = (value: Record<string, unknown>): Record<string, unknown> => new Proxy(value, {
    get(target, key) {
      if (typeof key !== "string" || !Object.hasOwn(target, key)) return undefined;
      const member = target[key];
      return member && typeof member === "object" ? hide(member as Record<string, unknown>) : member;
    },
    has(target, key) { return typeof key === "string" && Object.hasOwn(target, key); },
    ownKeys(target) { return Reflect.ownKeys(target); },
    getOwnPropertyDescriptor(target, key) { return Reflect.getOwnPropertyDescriptor(target, key); },
  });
  return hide(root) as AgentApiTree;
}
