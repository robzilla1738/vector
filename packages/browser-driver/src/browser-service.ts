/**
 * Node/MCP client of the Rust browser service (Finding 1 / Gate B).
 * Native UI and the Node planner are clients of the same page authority.
 * When VECTOR_BROWSER_SERVICE is unset the driver starts `ve-shell --service`
 * (or NAPI `BrowserServiceHandle.listen`) and attaches as a client.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, type ChildProcess } from "node:child_process";
import { createConnection, type Socket } from "node:net";
import { VectorError, type VectorErrorCode } from "@vector/contracts";

export function browserServiceAddr(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const raw = env.VECTOR_BROWSER_SERVICE?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

/** Local BrowserService started by the Node planner (Finding 1). */
export interface OwnedBrowserService {
  addr: string;
  shutdown(): void;
}

function withExe(path: string): string {
  return process.platform === "win32" && !path.endsWith(".exe") ? `${path}.exe` : path;
}

/** `VECTOR_SHELL` / `VECTOR_BROWSER_SHELL`, then cargo/release locations. */
export function resolveVeShell(env: NodeJS.ProcessEnv = process.env, cwd = process.cwd()): string | undefined {
  const named = (env.VECTOR_SHELL ?? env.VECTOR_BROWSER_SHELL)?.trim();
  if (named && existsSync(named)) return named;
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "..", "..", "..");
  const candidates = [
    named,
    join(root, "engine/target/debug/ve-shell"),
    join(root, "engine/target/release/ve-shell"),
    join(root, "release/ve-shell"),
    join(cwd, "engine/target/debug/ve-shell"),
    join(cwd, "engine/target/release/ve-shell"),
    join(cwd, "release/ve-shell"),
  ]
    .filter((p): p is string => Boolean(p && p.length > 0))
    .map(withExe);
  return candidates.find((p) => existsSync(p));
}

/**
 * Spawn `ve-shell --service 127.0.0.1:0` and read `VECTOR_BROWSER_SERVICE`
 * from the first JSON stdout line. Cargo noise is ignored.
 */
export function spawnVeShellService(
  bin = resolveVeShell(),
  bind = "127.0.0.1:0",
): Promise<OwnedBrowserService | undefined> {
  if (!bin) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    let settled = false;
    let child: ChildProcess;
    try {
      child = spawn(bin, ["--service", bind], {
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });
    } catch {
      resolve(undefined);
      return;
    }
    const finish = (owned?: OwnedBrowserService) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.stdout?.off("data", onData);
      if (!owned) {
        try {
          child.kill();
        } catch {
          /* already gone */
        }
      }
      resolve(owned);
    };
    const timer = setTimeout(() => finish(undefined), 8000);
    let buf = "";
    const onData = (chunk: Buffer | string) => {
      buf += String(chunk);
      for (;;) {
        const nl = buf.indexOf("\n");
        if (nl < 0) break;
        const line = buf.slice(0, nl).replace(/\r$/, "");
        buf = buf.slice(nl + 1);
        if (!line.trim()) continue;
        try {
          const v = JSON.parse(line) as { VECTOR_BROWSER_SERVICE?: string };
          if (v.VECTOR_BROWSER_SERVICE) {
            finish({
              addr: v.VECTOR_BROWSER_SERVICE,
              shutdown: () => {
                try {
                  child.kill();
                } catch {
                  /* already gone */
                }
              },
            });
            return;
          }
        } catch {
          /* cargo / rustc lines */
        }
      }
    };
    child.stdout?.on("data", onData);
    child.once("error", () => finish(undefined));
    child.once("exit", () => {
      if (!settled) finish(undefined);
    });
  });
}

export class BrowserServiceClient {
  private socket: Socket | null = null;
  private buf = "";
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();

  constructor(private readonly addr: string) {}

  async connect(): Promise<void> {
    if (this.socket) return;
    const [host, portText] = this.addr.includes("]")
      ? [this.addr.slice(0, this.addr.lastIndexOf(":")), this.addr.slice(this.addr.lastIndexOf(":") + 1)]
      : this.addr.split(":");
    const port = Number(portText);
    if (!host || !Number.isFinite(port)) {
      throw new VectorError("backend_unavailable", `bad VECTOR_BROWSER_SERVICE ${this.addr}`);
    }
    const socket = await new Promise<Socket>((resolve, reject) => {
      const s = createConnection({ host, port }, () => resolve(s));
      s.once("error", reject);
    });
    socket.setNoDelay(true);
    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => {
      this.buf += chunk;
      for (;;) {
        const nl = this.buf.indexOf("\n");
        if (nl < 0) break;
        const line = this.buf.slice(0, nl).replace(/\r$/, "");
        this.buf = this.buf.slice(nl + 1);
        if (!line.trim()) continue;
        this.onLine(line);
      }
    });
    socket.on("close", () => {
      this.socket = null;
      for (const [, p] of this.pending) {
        p.reject(new VectorError("backend_unavailable", "browser service closed"));
      }
      this.pending.clear();
    });
    this.socket = socket;
  }

  async call(method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    await this.connect();
    const id = this.nextId++;
    const reply = await new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket?.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
    return (reply ?? {}) as Record<string, unknown>;
  }

  close() {
    this.socket?.end();
    this.socket = null;
  }

  private onLine(line: string) {
    let msg: { id?: number; result?: unknown; error?: { code?: string; message?: string } };
    try {
      msg = JSON.parse(line) as typeof msg;
    } catch {
      return;
    }
    if (msg.id == null) return;
    const pending = this.pending.get(msg.id);
    if (!pending) return;
    this.pending.delete(msg.id);
    if (msg.error) {
      pending.reject(
        new VectorError(
          (msg.error.code ?? "internal") as VectorErrorCode,
          msg.error.message ?? "browser service error",
        ),
      );
      return;
    }
    pending.resolve(msg.result);
  }
}

/** `NativeEngine` adapter so the existing driver talks to the shared service. */
export class ServiceNativeEngine {
  constructor(private readonly client: BrowserServiceClient) {}

  newContext(): number {
    return 1;
  }

  identity(): string {
    return JSON.stringify({
      engine: "vector-engine",
      isolation: "process",
      service: "browser-service",
      chromium: false,
    });
  }

  async open(_contextId: number, url: string, optionsJson?: string | null): Promise<string> {
    const opts = optionsJson ? (JSON.parse(optionsJson) as { html?: string }) : {};
    const r = await this.client.call("pages.open", { url, html: opts.html });
    return JSON.stringify({
      ok: true,
      page: r.page,
      context: 1,
      url: r.url ?? url,
      title: r.title ?? "",
      generation: 1,
      revision: 1,
      settled: true,
      routing: { requiresScript: false, reason: "browser-service", kind: "static" },
    });
  }

  async observe(_page: number, optionsJson?: string | null): Promise<string> {
    const opts = optionsJson ? (JSON.parse(optionsJson) as Record<string, unknown>) : {};
    const r = await this.client.call("pages.observe", opts);
    return JSON.stringify({ ok: true, ...r, generation: r.documentEpoch ?? r.generation ?? 1 });
  }

  async execute(_page: number, stepsJson: string, _optionsJson?: string | null): Promise<string> {
    const program = JSON.parse(stepsJson) as unknown;
    const r = await this.client.call("pages.execute", { program });
    return JSON.stringify({ ok: true, ...r });
  }

  async takeover(): Promise<string> {
    const r = await this.client.call("pages.takeover", {});
    return JSON.stringify({ ok: true, ...r });
  }

  async resume(): Promise<string> {
    const r = await this.client.call("pages.resume", {});
    return JSON.stringify({ ok: true, ...r });
  }

  async inputEvent(event: Record<string, unknown>): Promise<string> {
    const r = await this.client.call("input.event", event);
    return JSON.stringify({ ok: true, ...r });
  }

  async screenshot(_page: number, _optionsJson?: string | null): Promise<string> {
    const r = await this.client.call("scene.update", {});
    return JSON.stringify({
      ok: true,
      width: r.width ?? 0,
      height: r.height ?? 0,
      pngBase64: "",
      scene: r,
    });
  }

  async close(_page: number): Promise<string> {
    return JSON.stringify({ ok: true, closed: true });
  }

  async getCookies(_contextId: number, _url?: string | null): Promise<string> {
    return JSON.stringify({ ok: true, cookies: [] });
  }

  async setCookies(_contextId: number, _cookiesJson: string): Promise<string> {
    return JSON.stringify({ ok: true });
  }

  pages(): number[] {
    return [];
  }

  shutdown(): void {
    this.client.close();
  }
}
