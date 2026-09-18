#!/usr/bin/env node
/**
 * vector-mcp — MCP stdio server wrapping the Vector loopback API.
 * Lets MCP-capable agents drive the user's local browser through the same
 * execution service the built-in agent uses.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PlanStepSchema, toErrorPayload, VectorError } from "@vector/contracts";
import { rpc } from "./client.js";

const server = new McpServer({ name: "vector", version: "0.1.0" });

const FlattenedStepSchema = z
  .object({
    id: z.string(),
    op: z.string(),
  })
  .passthrough();
export const McpStepSchema = z.union([PlanStepSchema, FlattenedStepSchema]);

const text = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const err = (e: unknown) => {
  const payload = e instanceof VectorError
    ? { code: e.code, message: e.message, details: e.detail ?? null, retryable: false, hint: null }
    : {
        ...toErrorPayload(e),
        details: null,
        retryable: false,
        hint: null,
      };
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ code: payload.code, message: payload.message, details: payload.details, retryable: payload.retryable, hint: payload.hint }, null, 2) }],
    isError: true,
  };
};

server.registerTool("vector_pages_list", { description: "List open browser pages (tabs, background workers, attached Chrome tabs)." }, async () => {
  try {
    return text(await rpc("pages.list"));
  } catch (e) {
    return err(e);
  }
});

server.registerTool(
  "vector_page_open",
  {
    description: "Open a new page. Use backend chrome to open a tab in the user's attached Chrome; vector-engine forces the in-process Vector Engine.",
    inputSchema: {
      url: z.string().describe("URL to open"),
      backend: z.enum(["vector", "chrome", "vector-engine"]).optional().describe("vector (default, routable), chrome, or vector-engine"),
      background: z.boolean().optional().describe("open hidden worker page (no focus steal)"),
    },
  },
  async ({ url, backend, background }) => {
    try {
      return text(await rpc("pages.open", { url, backend: backend ?? "vector", background: background ?? false }));
    } catch (e) {
      return err(e);
    }
  },
);

const ObservationScope = z.enum(["full", "forms", "links", "tables", "subtree"]);
const ObservationFormat = z.enum(["full", "compact"]);

/** Compact observations are rendered as plain text — the model reads it directly. */
const observationOut = (v: unknown) => {
  const o = v as { observation?: { text?: string } } | undefined;
  if (o && typeof o === "object" && o.observation && typeof o.observation.text === "string") {
    return { content: [{ type: "text" as const, text: o.observation.text }] };
  }
  return text(v);
};

server.registerTool(
  "vector_page_observe",
  {
    description:
      "Structured observation of a page: title, url, element refs (r1, r2, …), forms, tables, headings, text. " +
      "format 'compact' (default) returns the rendered text view — one line per ref like `r12 button \"Save\"` — which is 5–10× smaller than 'full' JSON (elements with selectors/rects). " +
      "Refs are valid until the page navigates (documentEpoch changes). Use scope to narrow (forms/links/tables, or subtree with subtreeRef).",
    inputSchema: {
      pageId: z.string(),
      format: ObservationFormat.optional().describe("compact (default) or full JSON"),
      scope: ObservationScope.optional().describe("full (default), forms, links, tables, or subtree"),
      subtreeRef: z.string().optional().describe("ref to observe under when scope=subtree"),
      maxElements: z.number().int().positive().optional().describe("cap on elements (default 120)"),
      maxTextChars: z.number().int().positive().optional().describe("cap on page text (default 6000)"),
    },
  },
  async ({ pageId, format, scope, subtreeRef, maxElements, maxTextChars }) => {
    try {
      return observationOut(
        await rpc("pages.observe", { pageId, format: format ?? "compact", scope, subtreeRef, maxElements, maxTextChars }),
      );
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_page_execute",
  {
    description:
      "Execute a typed program (array of steps) on a page; steps run in order and stop at the first non-optional failure. " +
      "Each step: {id, op, ...fields, optional?, timeoutMs?, expect?: Condition[]}. `target` is a STRING: a ref from vector_page_observe (\"r3\") or a portable locator (\"css:#save\", \"text:Save\", \"role=button[name=Save]\"). " +
      "Ops: navigate{url} click{target,button?} dblclick hover fill{target,value} type{target,value,delayMs?} press{key,target?} check uncheck select{target,value} " +
      "scroll{direction,amount?,target?} dragTo{target,to} clickPoint{x,y} upload{target,files} waitFor{condition} extract{fields:[{name,selector?,attribute?,all?}],as?} " +
      "screenshot{fullPage?} expectDownload dialog{action} collectScroll{item,container?,key?,fields?,limit?} evaluate{expression,as?}. " +
      "Conditions (waitFor/expect): {kind:'textVisible',text} {kind:'selector',selector,state?} {kind:'urlMatches',pattern} {kind:'navigationSettled'} {kind:'settled'} {kind:'response',urlIncludes} {kind:'refReady',ref} {kind:'expression',expression}. " +
      "Pass returnObservation to get the resulting page state in the same call (saves a round trip). Example: " +
      "{pageId, steps:[{id:'s1',op:'fill',target:'r4',value:'hello'},{id:'s2',op:'press',key:'Enter',target:'r4',expect:[{kind:'textVisible',text:'Results'}]}], returnObservation:{format:'compact'}}",
    inputSchema: {
      pageId: z.string(),
      steps: z.array(McpStepSchema).describe("step objects, e.g. {id:'s1', op:'click', target:'r3'}"),
      documentEpoch: z.number().int().nonnegative().optional().describe("epoch the refs were observed in; the program fails fast if the page navigated since"),
      returnObservation: z
        .object({
          scope: ObservationScope.optional(),
          subtreeRef: z.string().optional(),
          format: ObservationFormat.optional().describe("compact (default) or full"),
        })
        .optional()
        .describe("observe the page after the program and return it with the result"),
    },
  },
  async ({ pageId, steps, documentEpoch, returnObservation }) => {
    try {
      const ro = returnObservation ? { ...returnObservation, format: returnObservation.format ?? "compact" } : undefined;
      const res = (await rpc("pages.execute", { program: { pageId, documentEpoch, steps }, returnObservation: ro })) as {
        observation?: { text?: string };
      };
      if (res.observation && typeof res.observation.text === "string") {
        const { observation, ...result } = res;
        return {
          content: [{ type: "text" as const, text: `${JSON.stringify(result, null, 2)}\n\n=== OBSERVATION ===\n${observation.text}` }],
        };
      }
      return text(res);
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_page_takeover",
  {
    description: "Human takeover: stop subsequent agent dispatch on this page. Resume with vector_page_resume after revalidating page and authorization state.",
    inputSchema: { pageId: z.string() },
  },
  async ({ pageId }) => {
    try {
      return text(await rpc("pages.takeover", { pageId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_page_resume",
  {
    description: "Release human takeover on a page so an authorized agent can dispatch again.",
    inputSchema: { pageId: z.string() },
  },
  async ({ pageId }) => {
    try {
      return text(await rpc("pages.resume", { pageId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_page_capture",
  {
    description:
      "Screenshot a page. Default returns the PNG as MCP image content (so a vision-capable model sees it) plus its size and scale; format=artifact stores it and returns the artifact id; format=dataUrl returns the base64 data URL as text. Coordinates for clickPoint are screenshot pixels divided by `scale`.",
    inputSchema: { pageId: z.string(), fullPage: z.boolean().optional(), format: z.enum(["image", "dataUrl", "artifact"]).optional() },
  },
  async ({ pageId, fullPage, format }) => {
    try {
      if (format === "artifact") return text(await rpc("pages.capture", { pageId, fullPage, format: "artifact" }));
      const shot = (await rpc("pages.capture", { pageId, fullPage, format: "dataUrl" })) as {
        dataUrl: string;
        width: number;
        height: number;
        scale: number;
      };
      if (format === "dataUrl") return text(shot);
      const m = /^data:([^;]+);base64,(.*)$/s.exec(shot.dataUrl);
      if (!m) return text(shot);
      return {
        content: [
          { type: "image" as const, data: m[2]!, mimeType: m[1]! },
          { type: "text" as const, text: JSON.stringify({ width: shot.width, height: shot.height, scale: shot.scale }) },
        ],
      };
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_set_create",
  {
    description: "Create a page set from URLs, open tabs, or records.",
    inputSchema: {
      name: z.string(),
      urls: z.array(z.string()).optional(),
      pageIds: z.array(z.string()).optional(),
    },
  },
  async ({ name, urls, pageIds }) => {
    try {
      return text(await rpc("sets.create", { name, source: urls ? "urls" : "tabs", urls, pageIds }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_set_map",
  {
    description: "Run a program or an agent goal across every member of a set (bounded parallelism). Returns a runId — poll vector_run_get / vector_set_results.",
    inputSchema: {
      setId: z.string(),
      goal: z.string().optional(),
      steps: z.array(z.record(z.string(), z.unknown())).optional(),
      concurrency: z.number().int().min(1).max(16).optional(),
    },
  },
  async ({ setId, goal, steps, concurrency }) => {
    try {
      return text(await rpc("sets.map", { setId, goal, program: steps ? { steps } : undefined, concurrency }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_set_results",
  { description: "Result records collected for a set.", inputSchema: { setId: z.string() } },
  async ({ setId }) => {
    try {
      return text(await rpc("sets.results", { setId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_run_start",
  {
    description: "Start an agent run with a natural-language goal (plans, executes, verifies).",
    inputSchema: { goal: z.string(), pageId: z.string().optional(), setId: z.string().optional() },
  },
  async ({ goal, pageId, setId }) => {
    try {
      return text(await rpc("runs.start", { goal, pageId, setId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_run_get",
  { description: "Get run status and step records.", inputSchema: { runId: z.string() } },
  async ({ runId }) => {
    try {
      return text(await rpc("runs.get", { runId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_run_control",
  {
    description: "Pause, resume, or cancel a run.",
    inputSchema: { runId: z.string(), action: z.enum(["pause", "resume", "cancel"]) },
  },
  async ({ runId, action }) => {
    try {
      return text(await rpc(`runs.${action}`, { runId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_run_answer",
  {
    description: "Answer a run waiting on human input (needs_input).",
    inputSchema: { runId: z.string(), answer: z.string() },
  },
  async ({ runId, answer }) => {
    try {
      return text(await rpc("runs.answer", { runId, answer }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_events",
  {
    description: "Read the event stream since a sequence number.",
    inputSchema: { sinceSeq: z.number().int().nonnegative().optional() },
  },
  async ({ sinceSeq }) => {
    try {
      return text(await rpc("events.since", { sinceSeq: sinceSeq ?? 0, limit: 500 }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_chrome_attach",
  {
    description: "Attach to the user's Chrome (started with --remote-debugging-port).",
    inputSchema: { port: z.number().int().positive().optional() },
  },
  async ({ port }) => {
    try {
      return text(await rpc("chrome.attach", { port: port ?? 9222 }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool("vector_chrome_tabs", { description: "List attachable Chrome tabs." }, async () => {
  try {
    return text(await rpc("chrome.tabs"));
  } catch (e) {
    return err(e);
  }
});

server.registerTool(
  "vector_chrome_import_cookies",
  {
    description:
      "Import Chrome's cookies into Vector's session so signed-in sites work. Prefers an attached Chrome (covers app-bound cookies); falls back to decrypting the on-disk profile store (macOS keychain prompt). Returns counts only — never cookie values.",
    inputSchema: { source: z.enum(["auto", "attached", "profile"]).optional() },
  },
  async ({ source }) => {
    try {
      return text(await rpc("chrome.importCookies", { source: source ?? "auto" }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_artifacts",
  { description: "List artifacts (screenshots, downloads, exports).", inputSchema: { runId: z.string().optional() } },
  async ({ runId }) => {
    try {
      return text(await rpc("artifacts.list", { runId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_artifact_read",
  { description: "Read an artifact as base64.", inputSchema: { artifactId: z.string() } },
  async ({ artifactId }) => {
    try {
      return text(await rpc("artifacts.read", { artifactId }));
    } catch (e) {
      return err(e);
    }
  },
);

// ---- runtime-vnext surface ----

server.registerTool(
  "vector_state_query",
  {
    description:
      "Structured query over the runtime's state index — captured responses, results, controls, datasets, artifacts, operations. No inference; reads persisted state.",
    inputSchema: {
      entity: z.enum(["controls", "records", "responses", "artifacts", "operations", "datasets"]),
      pageIds: z.array(z.string()).optional(),
      runId: z.string().optional(),
      where: z.array(z.object({ field: z.string(), op: z.enum(["eq", "ne", "contains", "in", "gt", "gte", "lt", "lte"]), value: z.unknown() })).optional(),
      limit: z.number().int().positive().optional(),
    },
  },
  async ({ entity, pageIds, runId, where, limit }) => {
    try {
      return text(await rpc("state.query", { entity, scope: { pageIds, runId }, where, limit }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_responses_list",
  {
    description: "HTTP responses captured on a page (metadata; bodies via vector_response_body).",
    inputSchema: { pageId: z.string(), urlIncludes: z.string().optional(), limit: z.number().int().positive().optional() },
  },
  async ({ pageId, urlIncludes, limit }) => {
    try {
      return text(await rpc("responses.list", { pageId, urlIncludes, limit }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_response_body",
  { description: "Body of a captured response as base64.", inputSchema: { requestId: z.string() } },
  async ({ requestId }) => {
    try {
      return text(await rpc("responses.body", { requestId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_operations_list",
  {
    description: "List registered operations (validated ways to do things on sites) with their implementations.",
    inputSchema: { siteKey: z.string().optional() },
  },
  async ({ siteKey }) => {
    try {
      return text(await rpc("operations.list", { siteKey }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_operation_invoke",
  {
    description:
      "Invoke a registered operation with zero model involvement — picks the cheapest eligible implementation (direct request or browser program).",
    inputSchema: {
      siteKey: z.string().describe("site the operation is bound to, e.g. 127.0.0.1:4810"),
      name: z.string(),
      inputs: z.record(z.string(), z.unknown()).optional(),
      pageId: z.string().optional().describe("required for browser-program impls"),
    },
  },
  async ({ siteKey, name, inputs, pageId }) => {
    try {
      return text(await rpc("operations.invoke", { siteKey, name, inputs, pageId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_operation_explain",
  {
    description: "Explain which implementation an invoke would pick and why (route selection).",
    inputSchema: { siteKey: z.string(), name: z.string(), pageId: z.string().optional() },
  },
  async ({ siteKey, name, pageId }) => {
    try {
      return text(await rpc("operations.explain", { siteKey, name, pageId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_operation_save_program",
  {
    description: "Register a proven program as a named operation on a site so future invokes need no model.",
    inputSchema: {
      siteKey: z.string(),
      name: z.string(),
      description: z.string().optional(),
      program: z.record(z.string(), z.unknown()).describe("program object: {steps|nodes, inputs?, budget?}"),
      effectClass: z.enum(["read", "write", "destructive"]).optional(),
    },
  },
  async ({ siteKey, name, description, program, effectClass }) => {
    try {
      return text(await rpc("operations.saveProgram", { siteKey, name, description, program, effectClass }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_operation_compile",
  {
    description: "Compile a replayable operation candidate from a finished run's step trace (trace-derived, §10.3).",
    inputSchema: { runId: z.string(), siteKey: z.string().optional(), name: z.string().optional() },
  },
  async ({ runId, siteKey, name }) => {
    try {
      return text(await rpc("operations.compile", { runId, siteKey, name }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_program_validate",
  {
    description: "Validate a program (steps or control-flow nodes) without executing it.",
    inputSchema: { program: z.record(z.string(), z.unknown()) },
  },
  async ({ program }) => {
    try {
      return text(await rpc("programs.validate", { program }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_program_run",
  {
    description: "Run a saved program (typed steps or control-flow nodes) on a page — zero model.",
    inputSchema: {
      programId: z.string(),
      pageId: z.string(),
      parameters: z.record(z.string(), z.string()).optional(),
    },
  },
  async ({ programId, pageId, parameters }) => {
    try {
      return text(await rpc("programs.run", { programId, pageId, parameters }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_traces",
  {
    description: "List structured execution spans (program.execute, run, model calls) — optionally scoped to a run.",
    inputSchema: { runId: z.string().optional(), since: z.number().optional(), limit: z.number().int().positive().optional() },
  },
  async ({ runId, since, limit }) => {
    try {
      return text(await rpc("traces.list", { runId, since, limit }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_extract",
  {
    description: "Extract structured fields from the current observation.",
    inputSchema: { pageId: z.string(), fields: z.array(z.string()).optional() },
  },
  async ({ pageId, fields }) => {
    try {
      return text(await rpc("pages.extract", { pageId, fields }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_wait_for",
  {
    description: "Wait until a condition holds on the page.",
    inputSchema: { pageId: z.string(), condition: z.record(z.string(), z.unknown()) },
  },
  async ({ pageId, condition }) => {
    try {
      return text(await rpc("pages.waitFor", { pageId, condition }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_console",
  {
    description: "Read page console lines.",
    inputSchema: { pageId: z.string() },
  },
  async ({ pageId }) => {
    try {
      return text(await rpc("pages.console", { pageId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerResource(
  "vector://page/observation",
  "vector://page/observation",
  { description: "Latest compact observation for the active page." },
  async () => ({
    contents: [{ uri: "vector://page/observation", text: JSON.stringify(await rpc("pages.observe", { format: "compact" })) }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("vector-mcp: connected on stdio");
