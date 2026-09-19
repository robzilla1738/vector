/**
 * Gate F: MCP stdio against a live runtime + vector-engine page.
 * Fake RPC cannot satisfy the review: the same page must observe, execute,
 * take over, and resume without Chromium.
 */
import { spawn, execSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startRuntime, type RuntimeHandle } from "@vector/runtime";
import { probeEngineNative } from "@vector/engine-client";

const engine = await probeEngineNative();
const describeIfEngine = engine.available ? describe : describe.skip;

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

  async read(timeoutMs = 20_000): Promise<Record<string, unknown>> {
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

function toolText(msg: Record<string, unknown>): string {
  const result = msg.result as { content?: { text?: string }[]; isError?: boolean } | undefined;
  const text = result?.content?.map((c) => c.text ?? "").join("\n") ?? JSON.stringify(msg);
  return text;
}

const FORM = "data:text/html,<!doctype html><title>live-mcp</title><form><label for=n>Name</label><input id=n name=n><button type=button id=save>Save</button></form>";

describeIfEngine("Gate F live MCP + vector-engine", () => {
  let dataDir: string;
  let rt: RuntimeHandle;
  let child: ChildProcessWithoutNullStreams;
  let mcp: McpStdio;

  beforeAll(async () => {
    dataDir = mkdtempSync(join(tmpdir(), "vector-mcp-live-"));
    rt = await startRuntime({
      ...process.env,
      VECTOR_DATA_DIR: dataDir,
      VECTOR_ELECTRON_CDP: "",
      VECTOR_API_TOKEN: "test-token",
      VECTOR_ENGINE_MODE: "always",
      VECTOR_STANDALONE: "0",
    });
    const mcpJs = join(process.cwd(), "packages/mcp/dist/main.js");
    if (!existsSync(mcpJs)) {
      execSync("pnpm --filter @vector/mcp build", { stdio: "inherit" });
    }
    child = spawn(process.execPath, [mcpJs], {
      env: { ...process.env, VECTOR_DATA_DIR: dataDir },
      stdio: ["pipe", "pipe", "pipe"],
    });
    mcp = new McpStdio(child);
    const init = await mcp.call("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "review-gates-live", version: "0" },
    });
    expect(init.result).toBeTruthy();
    mcp.write({ jsonrpc: "2.0", method: "notifications/initialized" });
  }, 60_000);

  afterAll(async () => {
    child?.kill();
    await rt?.close();
  });

  it("opens, observes, fills, takes over, blocks dispatch, and resumes on one engine page", async () => {
    const opened = await mcp.call("tools/call", {
      name: "vector_page_open",
      arguments: { url: FORM, backend: "vector-engine", background: true },
    });
    const openedText = toolText(opened);
    expect(openedText).toMatch(/vector-engine/);
    const pageId = /"pageId":\s*"([^"]+)"/.exec(openedText)?.[1];
    expect(pageId).toBeTruthy();

    const observed = await mcp.call("tools/call", {
      name: "vector_page_observe",
      arguments: { pageId, format: "compact" },
    });
    const obsText = toolText(observed);
    expect(obsText).toMatch(/textbox|Name|input/i);
    expect(obsText).toMatch(/Save/);

    const filled = await mcp.call("tools/call", {
      name: "vector_page_execute",
      arguments: {
        pageId,
        steps: [{ id: "f", op: "fill", target: "css:#n", value: "typed-by-agent" }],
        returnObservation: { format: "full" },
      },
    });
    expect(toolText(filled)).toMatch(/typed-by-agent|completed/);

    const taken = await mcp.call("tools/call", {
      name: "vector_page_takeover",
      arguments: { pageId },
    });
    expect(toolText(taken)).toMatch(/human/);

    const blocked = await mcp.call("tools/call", {
      name: "vector_page_execute",
      arguments: {
        pageId,
        steps: [{ id: "x", op: "fill", target: "css:#n", value: "should-not-land" }],
      },
    });
    const blockedText = toolText(blocked);
    expect(blockedText).toMatch(/human control|conflict|isError/i);
    const blockedResult = blocked.result as { isError?: boolean } | undefined;
    expect(blockedResult?.isError || /human control|conflict/.test(blockedText)).toBe(true);

    const resumed = await mcp.call("tools/call", {
      name: "vector_page_resume",
      arguments: { pageId },
    });
    expect(toolText(resumed)).toMatch(/none|agent/);

    const after = await mcp.call("tools/call", {
      name: "vector_page_execute",
      arguments: {
        pageId,
        steps: [{ id: "f2", op: "fill", target: "css:#n", value: "after-resume" }],
      },
    });
    expect(toolText(after)).toMatch(/completed|ok|after-resume/);
  }, 60_000);
});

if (!engine.available) {
  it.skip(`live MCP skipped: ${engine.error?.split("\n")[0]}`, () => {});
}
