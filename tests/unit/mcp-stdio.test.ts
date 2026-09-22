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
  constructor(private child: ChildProcessWithoutNullStreams) {
    child.stdout.on("data", (chunk: Buffer) => {
      this.buf += chunk.toString("utf8");
    });
  }

  write(msg: unknown) {
    this.child.stdin.write(`${JSON.stringify(msg)}\n`);
  }

  async read(timeoutMs = 8_000): Promise<Record<string, unknown>> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const parsed = this.pull();
      if (parsed) return parsed;
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

  beforeAll(async () => {
    dataDir = mkdtempSync(join(tmpdir(), "aux-mcp-"));
    server = createServer((req, res) => {
      let raw = "";
      req.on("data", (c) => {
        raw += c;
      });
      req.on("end", () => {
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
  }, 15_000);

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
});
