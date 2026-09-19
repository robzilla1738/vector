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

export function browserServiceToken(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const raw = env.VECTOR_BROWSER_SERVICE_TOKEN?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

/** Local BrowserService started by the Node planner (Finding 1). */
export interface OwnedBrowserService {
  addr: string;
  token: string;
  shutdown(): void;
}

function withExe(path: string): string {
  return process.platform === "win32" && !path.endsWith(".exe") ? `${path}.exe` : path;
}

function veName(base: string): string {
  return process.platform === "win32" && !base.endsWith(".exe") ? `${base}.exe` : base;
}

/** `VECTOR_SHELL` / `VECTOR_BROWSER_SHELL`, then packaged Resources and cargo/release locations. */
export function resolveVeShell(env: NodeJS.ProcessEnv = process.env, cwd = process.cwd()): string | undefined {
  const named = (env.VECTOR_SHELL ?? env.VECTOR_BROWSER_SHELL)?.trim();
  if (named && existsSync(named)) return named;
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "..", "..", "..");
  const resources = (env.VECTOR_RESOURCES ?? "").trim();
  const candidates = [
    named,
    resources ? join(resources, "engine", veName("ve-shell")) : undefined,
    resources ? join(resources, veName("ve-shell")) : undefined,
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
          const v = JSON.parse(line) as {
            VECTOR_BROWSER_SERVICE?: string;
            VECTOR_BROWSER_SERVICE_TOKEN?: string;
          };
          if (v.VECTOR_BROWSER_SERVICE && v.VECTOR_BROWSER_SERVICE_TOKEN) {
            finish({
              addr: v.VECTOR_BROWSER_SERVICE,
              token: v.VECTOR_BROWSER_SERVICE_TOKEN,
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

  constructor(
    private readonly addr: string,
    private readonly token: string,
  ) {
    if (!token) {
      throw new VectorError("permission_denied", "VECTOR_BROWSER_SERVICE_TOKEN is required");
    }
  }

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
      this.socket?.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params, token: this.token })}\n`);
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
  private pageIds: number[] = [];

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
    if (typeof r.page === "number") this.pageIds.push(r.page);
    return JSON.stringify({
      ok: true,
      page: r.page,
      context: 1,
      url: r.url ?? url,
      title: r.title ?? "",
      generation: r.generation ?? r.documentEpoch ?? 0,
      revision: r.revision ?? 0,
      settled: true,
      routing: { requiresScript: false, reason: "browser-service", kind: "static" },
    });
  }

  async observe(page: number, optionsJson?: string | null): Promise<string> {
    const opts = optionsJson ? (JSON.parse(optionsJson) as Record<string, unknown>) : {};
    const r = await this.client.call("pages.observe", { ...opts, page });
    return JSON.stringify({ ok: true, ...r, documentEpoch: r.documentEpoch ?? r.generation ?? 1 });
  }

  async execute(page: number, stepsJson: string, optionsJson?: string | null): Promise<string> {
    const program = JSON.parse(stepsJson) as unknown;
    const opts = optionsJson ? (JSON.parse(optionsJson) as { returnObservation?: unknown }) : {};
    const params: Record<string, unknown> = { page, program };
    if (opts.returnObservation != null && opts.returnObservation !== false) {
      params.returnObservation = opts.returnObservation;
    }
    const r = await this.client.call("pages.execute", params);
    return JSON.stringify(flattenExecuteResult(r));
  }

  async takeover(page: number): Promise<string> {
    const r = await this.client.call("pages.takeover", { page });
    return JSON.stringify({ ok: true, ...r });
  }

  async resume(page: number): Promise<string> {
    const r = await this.client.call("pages.resume", { page });
    return JSON.stringify({ ok: true, ...r });
  }

  async inputEvent(page: number, event: Record<string, unknown>): Promise<string> {
    const r = await this.client.call("input.event", { ...event, page });
    return JSON.stringify({ ok: true, ...r });
  }

  async screenshot(page: number, _optionsJson?: string | null): Promise<string> {
    const r = await this.client.call("pages.screenshot", { page });
    if (!r.pngBase64) {
      throw new VectorError("capability_unsupported", "screenshot returned no image");
    }
    return JSON.stringify({ ok: true, ...r });
  }

  async scene(page: number): Promise<string> {
    const r = await this.client.call("scene.update", { page });
    return JSON.stringify({ ok: true, ...r });
  }

  async close(page: number): Promise<string> {
    const r = await this.client.call("pages.close", { page });
    this.pageIds = this.pageIds.filter((id) => id !== page);
    return JSON.stringify({ ok: true, ...r });
  }

  async getCookies(contextId: number, url?: string | null): Promise<string> {
    const r = await this.client.call("cookies.get", { context: contextId, url: url ?? undefined });
    return JSON.stringify({ ok: true, ...r });
  }

  async setCookies(contextId: number, cookiesJson: string): Promise<string> {
    const parsed = JSON.parse(cookiesJson) as unknown;
    const cookies = Array.isArray(parsed) ? parsed : (parsed as { cookies?: unknown }).cookies;
    const r = await this.client.call("cookies.set", { context: contextId, cookies });
    return JSON.stringify({ ok: true, ...r });
  }

  pages(): number[] {
    return [...this.pageIds];
  }

  shutdown(): void {
    this.client.close();
  }
}

/** NAPI `Engine.execute` envelope. Nested `{ result: { steps } }` is flattened. */
export function flattenExecuteResult(r: Record<string, unknown>): Record<string, unknown> {
  const nested =
    r.result && typeof r.result === "object" && !Array.isArray(r.result)
      ? (r.result as Record<string, unknown>)
      : undefined;
  const steps = Array.isArray(r.steps) ? r.steps : Array.isArray(nested?.steps) ? nested.steps : [];
  const status =
    (typeof r.status === "string" ? r.status : undefined) ??
    (typeof nested?.status === "string" ? nested.status : undefined) ??
    "failed";
  const extracted = r.extracted !== undefined ? r.extracted : (nested?.extracted ?? null);
  const error = r.error !== undefined ? r.error : (nested?.error ?? null);
  let observation = r.observation;
  if (observation && typeof observation === "object" && !Array.isArray(observation)) {
    const obs = observation as Record<string, unknown>;
    if (obs.ok !== true && obs.ok !== false) {
      observation = {
        ok: true,
        ...obs,
        generation: obs.generation ?? obs.documentEpoch ?? 1,
      };
    }
  }
  return {
    ok: true,
    status,
    steps,
    extracted,
    error,
    url: r.url ?? null,
    title: r.title ?? null,
    titleChanged: Boolean(r.titleChanged),
    generation: r.generation ?? r.documentEpoch ?? 1,
    navigated: Boolean(r.navigated),
    revision: r.revision ?? 1,
    ...(observation !== undefined ? { observation } : {}),
  };
}
