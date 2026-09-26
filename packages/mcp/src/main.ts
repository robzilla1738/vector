#!/usr/bin/env node
/**
 * aux-mcp — MCP stdio server wrapping the Aux loopback API.
 * Lets MCP-capable agents drive the user's local browser through the same
 * execution service the built-in agent uses.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  AgentApiManifest,
  supportedAgentApi,
  CalendarTaskEventsInputSchema,
  MethodSchemas,
  errorAdvice,
  toErrorPayload,
  AuxError,
  requireScopedAuxMcpCatalog,
} from "@aux/contracts";
import { rpc } from "./client.js";
import { McpStepInputSchema, parseMcpSteps, summarizeExecute } from "./steps.js";

requireScopedAuxMcpCatalog();

const server = new McpServer({ name: "aux", version: "0.1.0" });

const resourceUri = (path: string) => `aux://${path}`;
const scopedKind = process.env.AUX_MCP_SCOPE_KIND;

const RO = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;
const WRITE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;
const DESTRUCTIVE = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: true,
} as const;
const ANNOTATIONS = { ro: RO, w: WRITE, d: DESTRUCTIVE } as const;

const text = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v) }] });
const err = (e: unknown) => {
  const safe = toErrorPayload(e);
  const base = { ...safe, details: safe.detail ?? null };
  const advice = errorAdvice(base.code);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          code: base.code,
          message: base.message,
          details: base.details,
          retryable: advice.retryable,
          hint: advice.hint,
        }),
      },
    ],
    isError: true,
  };
};

server.registerTool(
  "aux_pages_list",
  {
    description: "List open browser pages (tabs, background workers, attached Chrome tabs).",
    annotations: RO,
  },
  async () => {
    try {
      return text(await rpc("pages.list"));
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
    annotations: RO,
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
        await rpc("pages.observe", {
          pageId,
          format: format ?? "compact",
          scope,
          subtreeRef,
          maxElements,
          maxTextChars,
        }),
      );
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "aux_page_execute",
  {
    annotations: DESTRUCTIVE,
    description:
      "Execute a typed program (array of steps) on a page; steps run in order and stop at the first non-optional failure. " +
      'Each step: {id, op, ...fields, optional?, timeoutMs?, expect?: Condition[]}. `target` is a STRING: a ref from aux_page_observe ("r3") or a portable locator ("css:#save", "text:Save", "role=button[name=Save]"). ' +
      "Ops: navigate{url} back forward reload stop click{target,button?} dblclick hover fill{target,value} fillCredential{passwordSelector,usernameSelector?} type{target,value,delayMs?} press{key,target?} check uncheck select{target,value} " +
      "scroll{direction,amount?,target?} dragTo{target,to} clickPoint{x,y} upload{target,files} waitFor{condition} extract{fields:[{name,selector?,attribute?,all?}],as?} " +
      "screenshot{fullPage?} expectDownload dialog{action} collectScroll{item,container?,key?,fields?,limit?}. " +
      "Conditions (waitFor/expect): {kind:'textVisible',text} {kind:'selector',selector,state?} {kind:'urlMatches',pattern} {kind:'navigationSettled'} {kind:'settled',policy?} {kind:'response',urlIncludes,status?} {kind:'refReady',ref} {kind:'downloadCompleted'}. " +
      "Scoped connections must pass taskId and expectedRevision from the saved Aux task. Pass returnObservation to get the resulting page state in the same call (saves a round trip). Example: " +
      "{pageId, taskId, expectedRevision, steps:[{id:'s1',op:'fill',target:'r4',value:'hello'},{id:'s2',op:'press',key:'Enter',target:'r4',expect:[{kind:'textVisible',text:'Results'}]}], returnObservation:{format:'compact'}}",
    inputSchema: {
      pageId: z.string(),
      taskId: z.string().optional().describe("Saved Aux task ID; required for scoped connections"),
      expectedRevision: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Current saved task revision; required for scoped connections"),
      steps: z.array(McpStepInputSchema).describe("step objects, e.g. {id:'s1', op:'click', target:'r3'}"),
      documentEpoch: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("epoch the refs were observed in; the program fails fast if the page navigated since"),
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
  async ({ pageId, taskId, expectedRevision, steps, documentEpoch, returnObservation }) => {
    try {
      if (scopedKind && (!taskId || expectedRevision === undefined))
        throw new AuxError("invalid_params", "Scoped aux_page_execute requires taskId and expectedRevision");
      const parsed = parseMcpSteps(steps);
      if ("error" in parsed) throw new AuxError("invalid_params", parsed.error);
      const ro = returnObservation
        ? { ...returnObservation, format: returnObservation.format ?? "compact" }
        : undefined;
      const res = (await rpc("pages.execute", {
        program: { pageId, documentEpoch, steps: parsed.steps },
        taskId,
        expectedRevision,
        returnObservation: ro,
      })) as Parameters<typeof summarizeExecute>[0] & {
        observation?: { text?: string };
      };
      const observed = res.observation
        ? typeof res.observation.text === "string"
          ? res.observation.text
          : JSON.stringify(res.observation)
        : undefined;
      const summary = summarizeExecute(res);
      return {
        content: [
          {
            type: "text" as const,
            text: observed ? `${summary}\n\n=== OBSERVATION ===\n${observed}` : summary,
          },
        ],
      };
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "aux_page_takeover",
  {
    annotations: { ...WRITE, idempotentHint: true },
    description:
      "Human takeover: stop subsequent agent dispatch on this page. Resume with aux_page_resume after revalidating page and authorization state.",
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
    annotations: { ...WRITE, idempotentHint: true },
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
    annotations: RO,
    description:
      "Screenshot a page. Default returns the PNG as MCP image content (so a vision-capable model sees it) plus its size and scale; format=artifact stores it and returns the artifact id; format=dataUrl returns the base64 data URL as text. Coordinates for clickPoint are screenshot pixels divided by `scale`.",
    inputSchema: {
      pageId: z.string(),
      fullPage: z.boolean().optional(),
      format: z.enum(["image", "dataUrl", "artifact"]).optional(),
    },
  },
  async ({ pageId, fullPage, format }) => {
    try {
      if (format === "artifact")
        return text(await rpc("pages.capture", { pageId, fullPage, format: "artifact" }));
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
          {
            type: "text" as const,
            text: JSON.stringify({ width: shot.width, height: shot.height, scale: shot.scale }),
          },
        ],
      };
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "aux_run_get",
  { annotations: RO, description: "Get run status and step records.", inputSchema: { runId: z.string() } },
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
    annotations: { ...WRITE, destructiveHint: true, idempotentHint: true },
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
    annotations: WRITE,
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
  "aux_extract",
  {
    annotations: RO,
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
    annotations: RO,
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
    annotations: RO,
    description: "Read page console lines.",
    inputSchema: {
      pageId: z.string(),
      since: z.number().optional(),
      limit: z.number().int().positive().optional(),
    },
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
    annotations: WRITE,
    description:
      "List the current page dialog (alert/confirm/prompt). Scoped connections accept or dismiss through a task-bound aux_page_execute dialog step.",
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
    annotations: RO,
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
    if (!pageId)
      return {
        contents: [
          { uri: resourceUri("page/observation"), text: JSON.stringify({ error: "no active page" }) },
        ],
      };
    return {
      contents: [
        {
          uri: resourceUri("page/observation"),
          text: JSON.stringify(await rpc("pages.observe", { pageId, format: "compact" })),
        },
      ],
    };
  },
);

server.registerResource(
  resourceUri("page/console"),
  resourceUri("page/console"),
  { description: "Console lines for the active page." },
  async () => {
    const pageId = await activePageId();
    if (!pageId)
      return { contents: [{ uri: resourceUri("page/console"), text: JSON.stringify({ lines: [] }) }] };
    return {
      contents: [
        { uri: resourceUri("page/console"), text: JSON.stringify(await rpc("pages.console", { pageId })) },
      ],
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
      contents: [
        { uri: resourceUri("page/network"), text: JSON.stringify(await rpc("pages.network", { pageId })) },
      ],
    };
  },
);

const taskTools = [
  ["aux_workspaces_list", "workspaces.list", "List persistent Aux workspaces.", "ro"],
  ["aux_tasks_list", "tasks.list", "List saved tasks, optionally by workspace.", "ro"],
  [
    "aux_task_create",
    "tasks.create",
    "Save an objective and explicit acceptance criteria. A task-scoped connection must create a resource-free child under an authorized task; descendants stay within the original scope.",
    "w",
  ],
  ["aux_task_get", "tasks.get", "Read a task, its revisions, and associated Aux runs.", "ro"],
  [
    "aux_task_update",
    "tasks.update",
    "Revise a task using its expected current revision. Earlier evidence does not carry acceptance to a new revision.",
    "w",
  ],
  ["aux_task_archive", "tasks.archive", "Archive or restore a task. Requires its current revision.", "w"],
  [
    "aux_task_start",
    "tasks.start",
    "Start Aux's configured built-in agent on a saved task. Requires an Aux model connection and explicit page scope; this does not start this MCP client's own agent.",
    "d",
  ],
  [
    "aux_task_record_evidence",
    "tasks.recordEvidence",
    "Record an external-client claim for a task criterion. This is not human acceptance or independent verification.",
    "w",
  ],
  [
    "aux_task_capture_evidence",
    "tasks.captureEvidence",
    "Capture a dated page-text observation from a current task resource or run. Content is stored locally as evidence.",
    "w",
  ],
  [
    "aux_task_receipt",
    "tasks.receipt",
    "Read criterion evidence, human review, unresolved actions, run history, and recorded model costs. Optional revision reads an earlier definition; freshness is assessed now, not as of that revision date. External client model costs are not included.",
    "ro",
  ],
  [
    "aux_task_verify_criterion",
    "tasks.verifyCriterion",
    "Run an honest local criterion check against saved evidence. Manual and service criteria stay unverified. This never records human acceptance.",
    "w",
  ],
  [
    "aux_task_replace_agent",
    "tasks.replaceAgent",
    "Cancel the active Aux built-in agent on this task and start a replacement that keeps the same task and conversation identity.",
    "d",
  ],
] as const;
for (const [name, method, description, annotation] of taskTools) {
  if (name === "aux_task_create" && scopedKind !== "workspace" && scopedKind !== "task") continue;
  server.registerTool(
    name,
    { description, annotations: ANNOTATIONS[annotation], inputSchema: MethodSchemas[method].shape },
    async (params: unknown) => {
      try {
        return text(await rpc(method, params));
      } catch (error) {
        return err(error);
      }
    },
  );
}

server.registerTool(
  "aux_calendar_task_grants",
  {
    description:
      "List only Calendar accounts that the Aux user explicitly granted to this saved task revision. No tokens are returned.",
    annotations: RO,
    inputSchema: MethodSchemas["calendar.taskGrants.list"].shape,
  },
  async (params: unknown) => {
    try {
      return text(await rpc("calendar.taskGrants.list", params));
    } catch (error) {
      return err(error);
    }
  },
);
server.registerTool(
  "aux_calendar_task_events",
  {
    description:
      "Read one page of events from a Calendar account granted to this task revision. Pass the grant ID from aux_calendar_task_grants. Revocation or task edits stop further reads.",
    annotations: RO,
    inputSchema: CalendarTaskEventsInputSchema.shape,
  },
  async (params: unknown) => {
    try {
      return text(await rpc("calendar.taskEvents.list", params));
    } catch (error) {
      return err(error);
    }
  },
);

/** One manifest-backed dispatcher keeps tools/list bounded as the typed API grows. */
const mcpApi = supportedAgentApi({ surface: "mcp" }).filter(
  (item) => item.method !== "agent.js.run" && item.method !== "agent.js.reset",
);
const mcpApiByPath = new Map(mcpApi.map((item) => [item.path, item]));
const mcpApiPaths = mcpApi.map((item) => item.path);
server.registerTool(
  "aux_api_describe",
  {
    description:
      "Look up an Aux API path and its exact typed input schema before calling aux_api_call. The path catalog comes from the shared agent API manifest.",
    annotations: RO,
    inputSchema: { path: z.string().min(1) },
  },
  async ({ path }) => {
    const item = mcpApiByPath.get(path);
    if (!item)
      return err(
        new AuxError(
          "not_found",
          `Unknown Aux API path: ${path}. Available paths: ${mcpApiPaths.join(", ")}`,
        ),
      );
    return text({
      path: item.path,
      summary: item.summary,
      when: item.when,
      inputSchema: z.toJSONSchema(MethodSchemas[item.method]),
    });
  },
);
server.registerTool(
  "aux_api_call",
  {
    description: `Call a typed Aux API path. Use aux_api_describe for its input schema. Paths: ${mcpApiPaths.join(", ")}.`,
    annotations: WRITE,
    inputSchema: {
      path: z.enum(mcpApiPaths as [string, ...string[]]),
      params: z.record(z.string(), z.unknown()),
    },
  },
  async ({ path, params }) => {
    try {
      const item = mcpApiByPath.get(path);
      if (!item) throw new AuxError("not_found", `Unknown Aux API path: ${path}`);
      return text(await rpc(item.method, MethodSchemas[item.method].parse(params)));
    } catch (error) {
      return err(error);
    }
  },
);
for (const [name, method] of [
  ["aux_js", "agent.js.run"],
  ["aux_js_reset", "agent.js.reset"],
] as const) {
  const description = AgentApiManifest.find((item) => item.method === method)!.summary;
  server.registerTool(
    name,
    {
      description,
      annotations: method === "agent.js.run" ? WRITE : RO,
      inputSchema: MethodSchemas[method].shape,
    },
    async (params: unknown) => {
      try {
        return text(await rpc(method, params));
      } catch (error) {
        return err(error);
      }
    },
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("aux-mcp: connected on stdio");
