import { createServer } from "node:http";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

type Rpc = { method: string; params?: Record<string, unknown> };

function pageTarget(overrides: Record<string, unknown> = {}) {
  return {
    pageId: "p1",
    backend: "aux",
    targetId: "p1",
    url: "https://app.test/form",
    title: "Form",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "background",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
    ...overrides,
  };
}

function compactObservation() {
  return {
    observation: {
      pageId: "p1",
      url: "https://app.test/form",
      title: "Form",
      documentEpoch: 1,
      revision: 0,
      text: 'r1 textbox "Name"\nr9 button "Save"',
      refs: [
        { ref: "r1", role: "textbox", name: "Name" },
        { ref: "r9", role: "button", name: "Save" },
      ],
    },
  };
}

function fullObservation() {
  return {
    observationId: "obs-full",
    pageId: "p1",
    documentEpoch: 1,
    revision: 0,
    observedAt: 1,
    scope: "full" as const,
    content: {
      url: "https://app.test/form",
      title: "Form",
      viewport: { width: 800, height: 600, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 },
      frames: [{ frame: "main", url: "https://app.test/form", sameOrigin: true }],
      text: 'r9 button "Save"',
      headings: [],
      elements: [
        {
          ref: "r9",
          tag: "button",
          role: "button",
          name: "Save",
          selector: { css: "#save" },
          rect: { x: 8, y: 12, w: 64, h: 28 },
        },
      ],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1, textChars: 16, approxTokens: 4 },
    },
  };
}

class McpStdio {
  private buf = "";
  private nextId = 1;
  private exited: string | null = null;
  constructor(private child: ChildProcessWithoutNullStreams) {
    child.stdout.on("data", (chunk: Buffer) => {
      this.buf += chunk.toString("utf8");
    });
    child.stderr.resume();
    child.once("exit", (code, signal) => {
      this.exited = `MCP process exited before replying (${signal ?? code ?? "unknown"})`;
    });
  }

  write(msg: unknown) {
    this.child.stdin.write(`${JSON.stringify(msg)}\n`);
  }

  async read(timeoutMs = 30_000): Promise<Record<string, unknown>> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const parsed = this.pull();
      if (parsed) return parsed;
      if (this.exited) throw new Error(this.exited);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error("mcp stdio timed out");
  }

  private pull(): Record<string, unknown> | null {
    const nl = this.buf.indexOf("\n");
    if (nl < 0) return null;
    const line = this.buf.slice(0, nl).replace(/\r$/, "");
    this.buf = this.buf.slice(nl + 1);
    if (!line.trim()) return this.pull();
    return JSON.parse(line) as Record<string, unknown>;
  }

  async call(method: string, params?: Record<string, unknown>) {
    const id = this.nextId++;
    this.write({ jsonrpc: "2.0", id, method, params });
    for (;;) {
      const msg = await this.read();
      if (msg.id === id) return msg;
    }
  }
}

describe("Gate F MCP stdio session", () => {
  let dataDir: string;
  let server: ReturnType<typeof createServer>;
  let child: ChildProcessWithoutNullStreams;
  let mcp: McpStdio;
  const calls: Rpc[] = [];
  let controller = "agent";
  let revoked = false;

  beforeAll(async () => {
    dataDir = mkdtempSync(join(tmpdir(), "aux-mcp-"));
    server = createServer((req, res) => {
      let raw = "";
      req.on("data", (c) => {
        raw += c;
      });
      req.on("end", () => {
        if (revoked) {
          res.writeHead(401, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: { code: "unauthorized", message: "Revoked token" } }));
          return;
        }
        const body = JSON.parse(raw || "{}") as Rpc;
        if (typeof body.method === "string") {
          calls.push({ method: body.method, params: body.params });
        }
        let result: unknown = {};
        switch (body.method) {
          case "pages.list":
            result = [pageTarget()];
            break;
          case "pages.observe": {
            const format = body.params?.format ?? "compact";
            result = format === "full" ? fullObservation() : compactObservation();
            break;
          }
          case "pages.execute":
            if ((body.params as { program?: { steps?: { target?: string }[] } })?.program?.steps?.[0]?.target === "r404") {
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: { code: "ref_stale", message: "ref r404 is stale" } }));
              return;
            }
            result = { status: "completed", steps: [{ stepId: "c", op: "click", status: "ok", startedAt: 1, durationMs: 1 }] };
            break;
          case "pages.takeover":
            controller = "human";
            result = pageTarget({ controller });
            break;
          case "pages.resume":
            controller = "agent";
            result = pageTarget({ controller });
            break;
          default:
            result = { ok: true };
        }
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ result }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    writeFileSync(
      join(dataDir, "runtime.json"),
      JSON.stringify({ port: addr.port, token: "test-token", pid: process.pid }),
    );
    child = spawn(process.execPath, [join(process.cwd(), "packages/mcp/dist/main.js")], {
      env: { ...process.env, AUX_DATA_DIR: dataDir, AUX_MCP_TOKEN: "test-token" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    mcp = new McpStdio(child);
    const init = await mcp.call("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "review-gates", version: "0" },
    });
    if (!init.result) throw new Error("MCP initialize handshake failed");
    mcp.write({ jsonrpc: "2.0", method: "notifications/initialized" });
  }, 45_000);

  afterAll(async () => {
    child?.kill();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("lists, observes, executes, takes over, and resumes on one stdio session", async () => {
    const listed = await mcp.call("tools/call", { name: "aux_pages_list" });
    expect(JSON.stringify(listed)).toMatch(/p1/);
    const observed = await mcp.call("tools/call", {
      name: "aux_page_observe",
      arguments: { pageId: "p1" },
    });
    expect(JSON.stringify(observed)).toMatch(/r9 button/);
    const executed = await mcp.call("tools/call", {
      name: "aux_page_execute",
      arguments: { pageId: "p1", steps: [{ id: "c", op: "click", target: "r9" }] },
    });
    expect(JSON.stringify(executed)).toMatch(/completed/);
    const taken = await mcp.call("tools/call", {
      name: "aux_page_takeover",
      arguments: { pageId: "p1" },
    });
    expect(JSON.stringify(taken)).toMatch(/human/);
    const resumed = await mcp.call("tools/call", {
      name: "aux_page_resume",
      arguments: { pageId: "p1" },
    });
    expect(JSON.stringify(resumed)).toMatch(/agent/);
    expect(calls.map((c) => c.method)).toEqual([
      "pages.list",
      "pages.observe",
      "pages.execute",
      "pages.takeover",
      "pages.resume",
    ]);
  });

  it("reaches full observation over MCP", async () => {
    const observed = await mcp.call("tools/call", {
      name: "aux_page_observe",
      arguments: { pageId: "p1", format: "full" },
    });
    const text = (observed.result as { content: [{ text: string }] }).content[0].text;
    const parsed = JSON.parse(text) as {
      content: { elements: { selector: { css: string }; rect: { w: number } }[] };
    };
    expect(parsed.content.elements[0]).toMatchObject({ selector: { css: "#save" }, rect: { w: 64 } });
    const observeCall = [...calls].reverse().find((c) => c.method === "pages.observe");
    expect(observeCall?.params).toMatchObject({ pageId: "p1", format: "full" });
  });

  it("keeps page creation outside the scoped catalog", async () => {
    const listed = await mcp.call("tools/list");
    const names = ((listed.result as { tools: { name: string }[] }).tools ?? []).map(t => t.name);
    expect(names).toContain("aux_pages_list");
    expect(names).not.toContain("aux_page_open");
    const opened = await mcp.call("tools/call", {
      name: "aux_page_open",
      arguments: { url: "https://app.test/auto" },
    });
    expect(JSON.stringify(opened)).not.toMatch(/app\.test\/auto/);
    expect(calls.some(c => c.method === "pages.open")).toBe(false);
  });

  it("keeps tools/list small, annotated and free of uncallable tools", async () => {
    const listed = await mcp.call("tools/list");
    const tools = (listed.result as { tools: { name: string; inputSchema: unknown; annotations?: Record<string, boolean> }[] }).tools;
    expect(JSON.stringify(listed.result).length).toBeLessThan(30_000);
    const execute = tools.find((t) => t.name === "aux_page_execute")!;
    expect(JSON.stringify(execute).length).toBeLessThan(8_000);
    expect(execute.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    expect(tools.find((t) => t.name === "aux_page_observe")?.annotations).toMatchObject({ readOnlyHint: true });
    expect(tools.every((t) => t.annotations)).toBe(true);
    expect(tools.some((t) => t.name.startsWith("aux_development_") || t.name.startsWith("aux_cloud_"))).toBe(false);
    expect(tools.map((t) => t.name)).toContain("aux_api_describe");
    expect(tools.map((t) => t.name)).toContain("aux_api_call");
    const described = await mcp.call("tools/call", { name: "aux_api_describe", arguments: { path: "tabs.list" } });
    expect(JSON.parse((described.result as { content: [{ text: string }] }).content[0].text)).toMatchObject({ path: "tabs.list", inputSchema: { type: "object" } });
    const called = await mcp.call("tools/call", { name: "aux_api_call", arguments: { path: "tabs.list", params: {} } });
    expect((called.result as { isError?: boolean }).isError).not.toBe(true);
    for (const gone of ["aux_run_start", "aux_set_map", "aux_operation_invoke", "aux_chrome_import_cookies", "aux_task_create"]) expect(tools.map((t) => t.name)).not.toContain(gone);
  });

  it("validates flat steps against the planner vocabulary and summarizes results one line per step", async () => {
    const bad = await mcp.call("tools/call", { name: "aux_page_execute", arguments: { pageId: "p1", steps: [{ id: "n", op: "navigate", url: "not a url" }] } });
    expect(JSON.stringify(bad)).toMatch(/invalid_params/);
    const good = await mcp.call("tools/call", { name: "aux_page_execute", arguments: { pageId: "p1", steps: [{ id: "c", op: "click", target: "r9" }] } });
    const text = (good.result as { content: [{ text: string }] }).content[0].text;
    expect(text).toBe("completed (1 step)\nc click ok 1ms");
  });

  it("preserves runtime error codes", async () => {
    const stale = await mcp.call("tools/call", { name: "aux_page_execute", arguments: { pageId: "p1", steps: [{ id: "c", op: "click", target: "r404" }] } });
    const payload = JSON.parse((stale.result as { content: [{ text: string }] }).content[0].text) as { code: string; retryable: boolean };
    expect(payload).toMatchObject({ code: "ref_stale", retryable: true });
  });

  it("reports a revoked scoped token as a non-retryable authorization denial", async () => {
    revoked = true;
    const denied = await mcp.call("tools/call", { name: "aux_pages_list" });
    const payload = JSON.parse((denied.result as { content: [{ text: string }] }).content[0].text) as { code: string; retryable: boolean; message: string };
    expect(payload).toMatchObject({ code: "permission_denied", retryable: false });
    expect(payload.message).not.toContain("Revoked token");
  });
});

describe("MCP project tool gating", () => {
  async function toolNames(env: Record<string, string>) {
    const dir = mkdtempSync(join(tmpdir(), "aux-mcp-gate-"));
    writeFileSync(join(dir, "runtime.json"), JSON.stringify({ port: 1, token: "t", pid: process.pid }));
    const child = spawn(process.execPath, [join(process.cwd(), "packages/mcp/dist/main.js")], {
      env: { ...process.env, AUX_DATA_DIR: dir, AUX_MCP_TOKEN: "t", ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    try {
      const mcp = new McpStdio(child);
      await mcp.call("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "gate", version: "0" } });
      mcp.write({ jsonrpc: "2.0", method: "notifications/initialized" });
      const listed = await mcp.call("tools/list");
      return ((listed.result as { tools: { name: string }[] }).tools ?? []).map((t) => t.name);
    } finally {
      child.kill();
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it("exposes development and cloud tools only to opted-in task or workspace scopes", async () => {
    const task = await toolNames({ AUX_MCP_SCOPE_KIND: "task" });
    expect(task).toContain("aux_task_create");
    expect(task.some((n) => n.startsWith("aux_development_"))).toBe(false);
    const projects = await toolNames({ AUX_MCP_SCOPE_KIND: "task", AUX_MCP_PROJECT_TOOLS: "1" });
    expect(projects).toContain("aux_development_files");
    expect(projects).toContain("aux_cloud_environments");
    const unscoped = await toolNames({ AUX_MCP_PROJECT_TOOLS: "1" });
    expect(unscoped.some((n) => n.startsWith("aux_cloud_"))).toBe(false);
  }, 20_000);
});
