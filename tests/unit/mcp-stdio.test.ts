import { createServer } from "node:http";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

type Rpc = { method: string; params?: Record<string, unknown> };

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
    dataDir = mkdtempSync(join(tmpdir(), "vector-mcp-"));
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
          case "pages.open":
            result = { pageId: "p1", backend: "vector-engine", documentEpoch: 1, url: body.params?.url };
            break;
          case "pages.observe": {
            const format = body.params?.format ?? "compact";
            result =
              format === "full"
                ? {
                    pageId: "p1",
                    observation: {
                      format: "full",
                      url: "https://app.test/form",
                      elements: [
                        {
                          ref: "r9",
                          role: "button",
                          name: "Save",
                          selector: "#save",
                          rect: { x: 8, y: 12, w: 64, h: 28 },
                        },
                      ],
                    },
                  }
                : {
                    pageId: "p1",
                    observation: {
                      text: 'r1 textbox "Name"\nr9 button "Save"',
                      url: "https://app.test/form",
                      formFields: [{ ref: "r1", name: "Name", value: "typed-by-human" }],
                    },
                  };
            break;
          }
          case "pages.execute":
            result = { status: "completed", pageId: "p1", steps: [{ stepId: "c", status: "ok" }] };
            break;
          case "pages.takeover":
            controller = "human";
            result = { pageId: "p1", controller, backend: "vector-engine" };
            break;
          case "pages.resume":
            controller = "agent";
            result = { pageId: "p1", controller, backend: "vector-engine" };
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
      env: { ...process.env, VECTOR_DATA_DIR: dataDir },
      stdio: ["pipe", "pipe", "pipe"],
    });
    mcp = new McpStdio(child);
    const init = await mcp.call("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "review-gates", version: "0" },
    });
    expect(init.result).toBeTruthy();
    mcp.write({ jsonrpc: "2.0", method: "notifications/initialized" });
  }, 15_000);

  afterAll(async () => {
    child?.kill();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("opens, observes, executes, takes over, and resumes on one stdio session", async () => {
    const opened = await mcp.call("tools/call", {
      name: "vector_page_open",
      arguments: { url: "https://app.test/form", backend: "vector-engine" },
    });
    expect(JSON.stringify(opened)).toMatch(/p1/);
    const observed = await mcp.call("tools/call", {
      name: "vector_page_observe",
      arguments: { pageId: "p1" },
    });
    expect(JSON.stringify(observed)).toMatch(/r9 button/);
    const executed = await mcp.call("tools/call", {
      name: "vector_page_execute",
      arguments: { pageId: "p1", steps: [{ id: "c", op: "click", target: "r9" }] },
    });
    expect(JSON.stringify(executed)).toMatch(/completed/);
    const taken = await mcp.call("tools/call", {
      name: "vector_page_takeover",
      arguments: { pageId: "p1" },
    });
    expect(JSON.stringify(taken)).toMatch(/human/);
    const resumed = await mcp.call("tools/call", {
      name: "vector_page_resume",
      arguments: { pageId: "p1" },
    });
    expect(JSON.stringify(resumed)).toMatch(/agent/);
    expect(calls.map((c) => c.method)).toEqual([
      "pages.open",
      "pages.observe",
      "pages.execute",
      "pages.takeover",
      "pages.resume",
    ]);
  });

  it("reaches full observation over MCP", async () => {
    const observed = await mcp.call("tools/call", {
      name: "vector_page_observe",
      arguments: { pageId: "p1", format: "full" },
    });
    const text = (observed.result as { content: [{ text: string }] }).content[0].text;
    const parsed = JSON.parse(text) as {
      observation: { format: string; elements: { selector: string; rect: { w: number } }[] };
    };
    expect(parsed.observation.format).toBe("full");
    expect(parsed.observation.elements[0]).toMatchObject({ selector: "#save", rect: { w: 64 } });
    const observeCall = [...calls].reverse().find((c) => c.method === "pages.observe");
    expect(observeCall?.params).toMatchObject({ pageId: "p1", format: "full" });
  });

  it("preserves an omitted backend for runtime policy routing", async () => {
    await mcp.call("tools/call", {
      name: "vector_page_open",
      arguments: { url: "https://app.test/auto" },
    });
    const openCall = [...calls].reverse().find((c) => c.method === "pages.open");
    expect(openCall?.params).toEqual({ url: "https://app.test/auto", background: false });
  });
});
