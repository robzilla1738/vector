import { createQuickJsContext } from "./quickjs.js";
import type { QuickJSAsyncContext } from "quickjs-emscripten-core";
import { randomUUID } from "node:crypto";
import {
  AgentJsRunParams,
  MethodSchemas,
  ResultSchemas,
  supportedAgentApi,
  AuxError,
  type AgentApiSupport,
} from "@aux/contracts";

type Client = { external: boolean; connectionId?: string; scope?: unknown; codeMode?: true };
type Invoke = (method: string, params: unknown, client: Client) => Promise<unknown>;
type Session = {
  context: QuickJSAsyncContext;
  queue: Promise<void>;
  client: Client;
  deadline: number;
  touchedAt: number;
  pending: number;
  hostFailures: Map<string, AuxError>;
};

const MAX_HEAP_BYTES = 128 * 1024 * 1024;
const MAX_SESSIONS = 8;
const IDLE_MS = 30 * 60_000;
const HOST_FAILURE_MARKER = "aux-host-error:";
const MAX_HOST_FAILURES = 32;

/** An isolated QuickJS context per caller/session. Only manifest-backed handles cross it. */
export class AgentCodeMode {
  private sessions = new Map<string, Session>();
  private creating = new Map<string, Promise<Session>>();
  constructor(
    private invoke: Invoke,
    private support: AgentApiSupport = { surface: "code" },
  ) {}

  private key(client: Client, sessionId: string) {
    return `${client.connectionId ?? (client.external ? "external" : "internal")}:${sessionId}`;
  }

  private dispose(key: string) {
    const session = this.sessions.get(key);
    if (!session) return;
    this.sessions.delete(key);
    session.context.dispose();
  }

  async reset(client: Client, sessionId = "default") {
    const key = this.key(client, sessionId);
    await this.creating.get(key);
    const session = this.sessions.get(key);
    while (session?.pending) await session.queue;
    if (this.sessions.get(key) === session) this.dispose(key);
    return { reset: true as const };
  }

  disposeAll() {
    for (const key of this.sessions.keys()) this.dispose(key);
  }

  private async makeSession(client: Client): Promise<Session> {
    const context = await createQuickJsContext();
    context.runtime.setMemoryLimit(MAX_HEAP_BYTES);
    context.runtime.setMaxStackSize(2 * 1024 * 1024);
    const session: Session = {
      context,
      queue: Promise.resolve(),
      client,
      deadline: 0,
      touchedAt: Date.now(),
      pending: 0,
      hostFailures: new Map(),
    };
    context.runtime.setInterruptHandler(() => Date.now() >= session.deadline);
    const available = supportedAgentApi(this.support);
    const byPath = new Map(available.map((item) => [item.path, item]));
    const handle = context.newAsyncifiedFunction("aux_call", async (pathHandle, paramsHandle) => {
      const path = context.getString(pathHandle);
      const entry = byPath.get(path);
      if (!entry)
        return context.newString(JSON.stringify({ ok: false, error: `Unsupported Aux API member: ${path}` }));
      if (Date.now() >= session.deadline)
        return context.newString(JSON.stringify({ ok: false, error: "Code mode deadline expired" }));
      try {
        const params = MethodSchemas[entry.method].parse(
          JSON.parse(context.getString(paramsHandle)),
        ) as never;
        const result = await this.invoke(entry.method, params, { ...session.client, codeMode: true });
        return context.newString(
          JSON.stringify({ ok: true, value: ResultSchemas[entry.method].parse(result) }),
        );
      } catch (error) {
        // Keep the host's error code across the QuickJS boundary. Unknown host
        // failures contain no public diagnostic and must not leak into code or RPC.
        const failure = error instanceof AuxError ? error : new AuxError("internal", "Aux host call failed.");
        const id = randomUUID();
        session.hostFailures.set(id, failure);
        if (session.hostFailures.size > MAX_HOST_FAILURES)
          session.hostFailures.delete(session.hostFailures.keys().next().value!);
        return context.newString(
          JSON.stringify({ ok: false, error: `${failure.message} [${HOST_FAILURE_MARKER}${id}]` }),
        );
      }
    });
    handle.consume((fn) => context.setProp(context.global, "aux_call", fn));
    const paths = available.map((item) => item.path);
    const bootstrap = `
      const aux = Object.create(null);
      for (const path of ${JSON.stringify(paths)}) {
        const names = path.split('.');
        let parent = aux;
        for (const name of names.slice(0, -1)) parent = parent[name] ??= Object.create(null);
        parent[names.at(-1)] = (params = {}) => {
          const response = JSON.parse(aux_call(path, JSON.stringify(params)));
          if (!response.ok) throw new Error(response.error);
          return response.value;
        };
      }
      Object.freeze(aux);
    `;
    session.deadline = Date.now() + 10_000;
    const initialized = await context.evalCodeAsync(bootstrap);
    context.unwrapResult(initialized).dispose();
    return session;
  }

  async run(raw: unknown, client: Client) {
    const params = AgentJsRunParams.parse(raw);
    const key = this.key(client, params.sessionId);
    for (const [id, session] of this.sessions)
      if (session.pending === 0 && Date.now() - session.touchedAt > IDLE_MS) this.dispose(id);
    let session = this.sessions.get(key);
    if (!session) {
      let creating = this.creating.get(key);
      if (!creating) {
        creating = this.makeSession(client).finally(() => this.creating.delete(key));
        this.creating.set(key, creating);
      }
      session = await creating;
    }
    const current = session;
    current.pending++;
    this.sessions.set(key, current);
    this.evictIdle(key);
    let release!: () => void;
    const previous = current.queue;
    current.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    const started = Date.now();
    current.client = client;
    current.deadline = started + params.deadlineMs;
    current.touchedAt = started;
    current.hostFailures.clear();
    try {
      const result = await current.context.evalCodeAsync(params.code);
      const value = current.context.unwrapResult(result).consume((handle) => current.context.dump(handle));
      const json = JSON.stringify(value ?? null);
      if (json.length > 1_000_000)
        throw new AuxError("invalid_params", "Code mode output exceeds 1 MB; return a smaller result.");
      return { value: JSON.parse(json) as unknown, durationMs: Date.now() - started };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const id = message.match(/aux-host-error:([0-9a-f-]{36})/)?.[1];
      const hostFailure = id && current.hostFailures.get(id);
      if (hostFailure) throw hostFailure;
      throw new AuxError("invalid_params", `Code mode failed: ${message}`);
    } finally {
      current.hostFailures.clear();
      current.pending--;
      current.touchedAt = Date.now();
      release();
      this.evictIdle();
    }
  }

  private evictIdle(keep?: string) {
    while (this.sessions.size > MAX_SESSIONS) {
      const oldest = [...this.sessions]
        .filter(([key, session]) => key !== keep && session.pending === 0)
        .sort((a, b) => a[1].touchedAt - b[1].touchedAt)[0];
      if (!oldest) return;
      this.dispose(oldest[0]);
    }
  }
}
