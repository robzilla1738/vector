#!/usr/bin/env node
/**
 * aux-mcp — MCP stdio server wrapping the Aux loopback API.
 * Lets MCP-capable agents drive the user's local browser through the same
 * execution service the built-in agent uses.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MethodSchemas, errorAdvice, toErrorPayload, AuxError, requireScopedAuxMcpCatalog } from "@aux/contracts";
import { rpc } from "./client.js";
import { McpStepSchema } from "./steps.js";

requireScopedAuxMcpCatalog();

const server = new McpServer({ name: "aux", version: "0.1.0" });

const resourceUri=(path:string)=>`aux://${path}`;
const scopedKind=process.env.AUX_MCP_SCOPE_KIND;
const scopedTools=new Set([
  'aux_pages_list','aux_page_observe','aux_page_execute','aux_page_takeover','aux_page_resume','aux_page_capture',
  'aux_run_get','aux_run_control','aux_run_answer','aux_extract','aux_wait_for','aux_console','aux_dialog','aux_network',
  'aux_workspaces_list','aux_tasks_list','aux_task_get','aux_task_update','aux_task_archive','aux_task_start',
  'aux_task_record_evidence','aux_task_capture_evidence','aux_task_receipt','aux_task_verify_criterion','aux_task_replace_agent',
]);
const catalogAllows=(name:string)=>scopedTools.has(name)||name.startsWith('aux_development_')||name.startsWith('aux_cloud_')||(name==='aux_task_create'&&(scopedKind==='workspace'||scopedKind==='task'));
const registerToolOriginal=server.registerTool.bind(server);
server.registerTool=((name:string,config:Parameters<typeof server.registerTool>[1],handler:Parameters<typeof server.registerTool>[2])=>{
  const tool=registerToolOriginal(name,config,handler);
  if(!catalogAllows(name))tool.disable();
  return tool;
}) as typeof server.registerTool;

const text = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const err = (e: unknown) => {
  const base = e instanceof AuxError
    ? { code: e.code, message: e.message, details: e.detail ?? null }
    : { ...toErrorPayload(e), details: null as unknown };
  const advice = errorAdvice(base.code);
  const payload = { ...base, retryable: advice.retryable, hint: advice.hint };
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ code: payload.code, message: payload.message, details: payload.details, retryable: payload.retryable, hint: payload.hint }, null, 2) }],
    isError: true,
  };
};

server.registerTool("aux_pages_list", { description: "List open browser pages (tabs, background workers, attached Chrome tabs)." }, async () => {
  try {
    return text(await rpc("pages.list"));
  } catch (e) {
    return err(e);
  }
});

server.registerTool(
  "aux_page_open",
  {
    description: "Open a new page. Omit backend for the default embedded Chromium view; aux selects it explicitly, chrome adopts an attached Chrome tab.",
    inputSchema: {
      url: z.string().describe("URL to open"),
      backend: z.enum(["aux", "chrome"]).optional().describe("omit for the default; aux or chrome to force a backend"),
      background: z.boolean().optional().describe("open hidden worker page (no focus steal)"),
    },
  },
  async ({ url, backend, background }) => {
    try {
      return text(await rpc("pages.open", {
        url,
        ...(backend ? { backend } : {}),
        background: background ?? false,
      }));
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
  "aux_page_observe",
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
  "aux_page_execute",
  {
    description:
      "Execute a typed program (array of steps) on a page; steps run in order and stop at the first non-optional failure. " +
      "Each step: {id, op, ...fields, optional?, timeoutMs?, expect?: Condition[]}. `target` is a STRING: a ref from aux_page_observe (\"r3\") or a portable locator (\"css:#save\", \"text:Save\", \"role=button[name=Save]\"). " +
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
  "aux_page_takeover",
  {
    description: "Human takeover: stop subsequent agent dispatch on this page. Resume with aux_page_resume after revalidating page and authorization state.",
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
  "aux_page_resume",
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
  "aux_page_capture",
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
  "aux_set_create",
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
  "aux_set_map",
  {
    description: "Run a program or an agent goal across every member of a set (bounded parallelism). Returns a runId — poll aux_run_get / aux_set_results.",
    inputSchema: {
      setId: z.string(),
      goal: z.string().optional(),
      steps: z.array(McpStepSchema).optional(),
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
  "aux_set_results",
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
  "aux_run_start",
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
  "aux_run_get",
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
  "aux_run_control",
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
  "aux_run_answer",
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
  "aux_events",
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
  "aux_chrome_attach",
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

server.registerTool("aux_chrome_tabs", { description: "List attachable Chrome tabs." }, async () => {
  try {
    return text(await rpc("chrome.tabs"));
  } catch (e) {
    return err(e);
  }
});

server.registerTool(
  "aux_chrome_import_cookies",
  {
    description:
      "Import Chrome's cookies into Aux's session so signed-in sites work. Prefers an attached Chrome (covers app-bound cookies); falls back to decrypting the on-disk profile store (macOS keychain prompt). Returns counts only — never cookie values.",
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
  "aux_artifacts",
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
  "aux_artifact_read",
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
  "aux_state_query",
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
  "aux_responses_list",
  {
    description: "HTTP responses captured on a page (metadata; bodies via aux_response_body).",
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
  "aux_response_body",
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
  "aux_operations_list",
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
  "aux_operation_invoke",
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
  "aux_operation_explain",
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
  "aux_operation_save_program",
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
  "aux_operation_compile",
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
  "aux_program_validate",
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
  "aux_program_run",
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
  "aux_traces",
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
  "aux_extract",
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
  "aux_wait_for",
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
  "aux_console",
  {
    description: "Read page console lines.",
    inputSchema: { pageId: z.string(), since: z.number().optional(), limit: z.number().int().positive().optional() },
  },
  async ({ pageId, since, limit }) => {
    try {
      return text(await rpc("pages.console", { pageId, since, limit }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "aux_dialog",
  {
    description: "List or accept/dismiss the current page dialog (alert/confirm/prompt).",
    inputSchema: {
      pageId: z.string(),
      action: z.enum(["list", "accept", "dismiss"]).optional(),
      promptText: z.string().optional(),
    },
  },
  async ({ pageId, action, promptText }) => {
    try {
      return text(await rpc("pages.dialog", { pageId, action: action ?? "list", promptText }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "aux_network",
  {
    description: "List captured HTTP responses for a page (url, status, type, timing).",
    inputSchema: {
      pageId: z.string(),
      since: z.number().optional(),
      urlIncludes: z.string().optional(),
      limit: z.number().int().positive().optional(),
    },
  },
  async ({ pageId, since, urlIncludes, limit }) => {
    try {
      return text(await rpc("pages.network", { pageId, since, urlIncludes, limit }));
    } catch (e) {
      return err(e);
    }
  },
);

async function activePageId(): Promise<string | null> {
  const ws = (await rpc("workspace.get")) as { activePageId?: string | null };
  return ws.activePageId ?? null;
}

server.registerResource(
  resourceUri("page/observation"),
  resourceUri("page/observation"),
  { description: "Latest compact observation for the active page." },
  async () => {
    const pageId = await activePageId();
    if (!pageId) return { contents: [{ uri: resourceUri("page/observation"), text: JSON.stringify({ error: "no active page" }) }] };
    return {
      contents: [{ uri: resourceUri("page/observation"), text: JSON.stringify(await rpc("pages.observe", { pageId, format: "compact" })) }],
    };
  },
);

server.registerResource(
  resourceUri("page/console"),
  resourceUri("page/console"),
  { description: "Console lines for the active page." },
  async () => {
    const pageId = await activePageId();
    if (!pageId) return { contents: [{ uri: resourceUri("page/console"), text: JSON.stringify({ lines: [] }) }] };
    return {
      contents: [{ uri: resourceUri("page/console"), text: JSON.stringify(await rpc("pages.console", { pageId })) }],
    };
  },
);

server.registerResource(
  resourceUri("page/network"),
  resourceUri("page/network"),
  { description: "Captured HTTP responses for the active page." },
  async () => {
    const pageId = await activePageId();
    if (!pageId) return { contents: [{ uri: resourceUri("page/network"), text: "[]" }] };
    return {
      contents: [{ uri: resourceUri("page/network"), text: JSON.stringify(await rpc("pages.network", { pageId })) }],
    };
  },
);

const taskTools = [
  ["aux_workspaces_list", "workspaces.list", "List persistent Aux workspaces."],
  ["aux_workspace_create", "workspaces.create", "Create a persistent workspace for related tasks."],
  ["aux_tasks_list", "tasks.list", "List saved tasks, optionally by workspace."],
  ["aux_task_create", "tasks.create", "Save an objective and explicit acceptance criteria. A task-scoped connection must create a resource-free child under an authorized task; descendants stay within the original scope."],
  ["aux_task_get", "tasks.get", "Read a task, its revisions, and associated Aux runs."],
  ["aux_task_update", "tasks.update", "Revise a task using its expected current revision. Earlier evidence does not carry acceptance to a new revision."],
  ["aux_task_archive", "tasks.archive", "Archive or restore a task. Requires its current revision."],
  ["aux_task_start", "tasks.start", "Start Aux's configured built-in agent on a saved task. Requires an Aux model connection and explicit page scope; this does not start this MCP client's own agent."],
  ["aux_task_record_evidence", "tasks.recordEvidence", "Record an external-client claim for a task criterion. This is not human acceptance or independent verification."],
  ["aux_task_capture_evidence", "tasks.captureEvidence", "Capture a dated page-text observation from a current task resource or run. Content is stored locally as evidence."],
  ["aux_task_receipt", "tasks.receipt", "Read criterion evidence, human review, unresolved actions, run history, and recorded model costs. Optional revision reads an earlier definition; freshness is assessed now, not as of that revision date. External client model costs are not included."],
  ["aux_task_verify_criterion", "tasks.verifyCriterion", "Run an honest local criterion check against saved evidence. Manual and service criteria stay unverified. This never records human acceptance."],
  ["aux_task_replace_agent", "tasks.replaceAgent", "Cancel the active Aux built-in agent on this task and start a replacement that keeps the same task and conversation identity."],
] as const;
for (const [name, method, description] of taskTools) {
  server.registerTool(name, { description, inputSchema: MethodSchemas[method].shape }, async (params: unknown) => {
    try { return text(await rpc(method, params)); } catch (error) { return err(error); }
  });
}

const developmentTools = [
  ['aux_development_projects','development.projects','List only managed checkouts attached to the authorized saved task.'],
  ['aux_development_inspect','development.inspect','Inspect one attached checkout and compare it with its saved baseline.'],
  ['aux_development_github_status','development.githubStatus','Use the explicitly connected GitHub account to inspect the attached checkout repository, permissions, remote commit presence and current commit status. This is read-only and does not push or create a pull request.'],
  ['aux_development_operations_status','development.operationsStatus','Read the selected Vercel deployment and Sentry unresolved-issue health for an attached project. This is read-only and cannot deploy, roll back, resolve, assign, or delete.'],
  ['aux_development_incident_report','development.incidentReport','Create a durable local incident snapshot from an authorized task page or verified project preview, checkout changes, recent project commands, browser console and network responses. Query values are redacted. This records evidence; it does not prove root cause or resolution.'],
  ['aux_development_files','development.files','List tracked and untracked, non-ignored files in one attached checkout.'],
  ['aux_development_read_file','development.readFile','Read one listed UTF-8 checkout file up to 256 KB. Returns a SHA-256 required for conflict-safe saving.'],
  ['aux_development_write_file','development.writeFile','Propose replacing one listed file at its expected SHA-256. Aux shows a native content preview for human approval, preserves recovery data, and rejects outside changes.'],
  ['aux_development_create_file','development.createFile','Propose a new non-ignored text file inside an attached checkout. Aux shows a native content preview for human approval and never replaces an existing path.'],
  ['aux_development_rename_file','development.renameFile','Propose renaming one file inside an attached checkout at its expected SHA-256. Aux requires native human approval, refuses replacement, and keeps recovery data.'],
  ['aux_development_delete_file','development.deleteFile','Propose deleting one file from an attached checkout at its expected SHA-256. Aux requires native human approval and keeps a recovery copy outside the checkout.'],
  ['aux_development_commands','development.commands','Read saved command and service records for one attached checkout.'],
  ['aux_development_run_command','development.runCommand','Propose an exact local command or service in an attached checkout. Aux requires native human approval; execution is not sandboxed and receives no model credentials.'],
  ['aux_development_open_preview','development.openPreview','Propose checking and opening a localhost preview for an attached checkout. Aux requires native human approval, sends a cookie-free loopback check, and grants this connection access only to the opened preview tab for the current Aux runtime session.'],
  ['aux_development_stop_command','development.stopCommand','Stop a command or service that belongs to the attached checkout.'],
  ['aux_development_review','development.review','Write a durable local Markdown handoff containing the fresh diff, untracked names, recent command evidence and last preview check. This does not commit, push, publish or create a pull request.'],
  ['aux_development_commit','development.commit','Propose one local commit of the exact reviewed snapshot. Aux requires native human approval and explicit author identity; hooks, signing, credential helpers and network protocols stay disabled. This does not push, publish or create a pull request.'],
  ['aux_cloud_environments','cloud.environments','List durable Vercel Sandbox environments belonging to the authorized task, including lifecycle, region, preview, expiry, snapshot and resource usage. Environment creation, stop and deletion remain desktop-only.'],
  ['aux_cloud_command_history','cloud.commands','Read and reconcile the bounded durable command history for one task-owned Vercel Sandbox environment.'],
  ['aux_cloud_run_command','cloud.runCommand','Propose an exact command in an existing task-owned Vercel Sandbox. Aux must be open and requires native human approval before dispatch; the result is durable and uncertain outcomes are never retried automatically.'],
  ['aux_cloud_start_service','cloud.startService','Propose an exact bounded service in an existing task-owned Vercel Sandbox. Aux must be open and requires native human approval before dispatch.'],
  ['aux_cloud_refresh_command','cloud.refreshCommand','Refresh the provider status and bounded logs for one durable task-owned cloud command without dispatching work.'],
  ['aux_cloud_stop_command','cloud.stopCommand','Stop a running command or service that belongs to the authorized task and environment. This does not stop or delete the environment.'],
  ['aux_cloud_files','cloud.files','List one bounded directory inside the task-owned remote workspace. Paths remain rooted in the sandbox workspace.'],
  ['aux_cloud_read_file','cloud.readFile','Read one bounded UTF-8 file inside the task-owned remote workspace.'],
  ['aux_cloud_task_result','cloud.taskResult','Read and validate the detached cloud worker result against the exact authorized task revision and uploaded source tree. The result is evidence for human review, not automatic acceptance.'],
] as const;
for(const [name,method,description] of developmentTools){
  server.registerTool(name,{description,inputSchema:MethodSchemas[method].shape},async(params:unknown)=>{
    try{return text(await rpc(method,params));}catch(error){return err(error);}
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("aux-mcp: connected on stdio");
