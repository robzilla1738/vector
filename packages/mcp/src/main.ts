#!/usr/bin/env node
/**
 * vector-mcp — MCP stdio server wrapping the Vector loopback API.
 * Lets MCP-capable agents drive the user's local browser through the same
 * execution service the built-in agent uses.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { rpc } from "./client.js";

const server = new McpServer({ name: "vector", version: "0.1.0" });

const text = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const err = (e: unknown) => ({ content: [{ type: "text" as const, text: `error: ${(e as Error).message}` }], isError: true });

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
    description: "Open a new page. Use backend chrome to open a tab in the user's attached Chrome.",
    inputSchema: {
      url: z.string().describe("URL to open"),
      backend: z.enum(["vector", "chrome"]).optional().describe("vector (default) or chrome"),
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

server.registerTool(
  "vector_page_observe",
  {
    description: "Structured observation of a page: title, url, element refs, forms, tables, headings. Returns revision + ref handles usable by vector_page_execute.",
    inputSchema: { pageId: z.string() },
  },
  async ({ pageId }) => {
    try {
      return text(await rpc("pages.observe", { pageId }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_page_execute",
  {
    description:
      "Execute a typed action program on a page. Steps: navigate/click/fill/select/wait/extract/keyboard/screenshot/dialog/upload/download. Refs come from vector_page_observe; semantic locators (role/text/css) are portable.",
    inputSchema: {
      pageId: z.string(),
      steps: z.array(z.record(z.string(), z.unknown())).describe("array of step objects, e.g. {op:'click', target:{ref:'r3'}}"),
      verify: z.boolean().optional(),
    },
  },
  async ({ pageId, steps, verify }) => {
    try {
      return text(await rpc("pages.execute", { program: { pageId, steps }, verify }));
    } catch (e) {
      return err(e);
    }
  },
);

server.registerTool(
  "vector_page_capture",
  {
    description: "Screenshot a page. Returns a data URL (or artifact id with format=artifact).",
    inputSchema: { pageId: z.string(), format: z.enum(["dataUrl", "artifact"]).optional() },
  },
  async ({ pageId, format }) => {
    try {
      return text(await rpc("pages.capture", { pageId, format: format ?? "artifact" }));
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

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("vector-mcp: connected on stdio");
