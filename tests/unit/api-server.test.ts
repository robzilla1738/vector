import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer, EventBus, MAX_BODY_BYTES, openDb, Repo, loadConfig, startRuntime } from "@aux/runtime";
import { AuxError } from "@aux/contracts";

const TOKEN = "t0ken-secret";
let server: ApiServer;
let events: EventBus;
let base: string;
const seen: { method: string; params: unknown }[] = [];

beforeAll(async () => {
  const repo = new Repo(openDb(":memory:"));
  events = new EventBus(repo);
  server = new ApiServer({
    token: TOKEN,
    events,
    invoke: async (method, params) => {
      seen.push({ method, params });
      if (method === "runs.get") throw new AuxError("not_found", "no run");
      return { echo: method, params };
    },
    authorizeScopedToken: token => token === "scoped" ? { external: true, connectionId: "connection", scope: { kind: "workspace", workspaceId: "workspace" } } : null,
  });
  const port = await server.listen(0);
  base = `http://127.0.0.1:${port}`;
});
afterAll(async () => {
  await server.close();
});

const rpc = (body: unknown | string, headers: Record<string, string> = {}, path = "/rpc") =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const bearer = { authorization: `Bearer ${TOKEN}` };

describe("ApiServer over HTTP", () => {
  it("health is open, everything else needs a bearer token", async () => {
    expect((await fetch(`${base}/health`)).status).toBe(200);
    const r = await rpc({ method: "pages.list", params: {} });
    expect(r.status).toBe(401);
    const body = (await r.json()) as { error: { code: string } };
    expect(body.error.code).toBe("unauthorized");
  });

  it("rejects the query-string token on /rpc (P0-3)", async () => {
    const r = await rpc({ method: "pages.list", params: {} }, {}, `/rpc?token=${TOKEN}`);
    expect(r.status).toBe(401);
    expect(seen.some((s) => s.method === "pages.list")).toBe(false);
  });

  it("dispatches with a bearer token", async () => {
    const r = await rpc({ method: "pages.list", params: { backend: "aux" } }, bearer);
    expect(r.status).toBe(200);
    const body = (await r.json()) as { result: { echo: string; params: unknown } };
    expect(body.result.echo).toBe("pages.list");
    expect(body.result.params).toEqual({ backend: "aux" });
  });

  it("accepts a valid scoped token for HTTP and rejects revoked or unknown tokens", async () => {
    const response = await rpc({ method: "pages.list", params: {} }, { authorization: "Bearer scoped" });
    expect(response.status).toBe(200);
    const revoked = await rpc({ method: "pages.list", params: {} }, { authorization: "Bearer revoked" });
    expect(revoked.status).toBe(401);
  });

  it("returns 413 for oversized bodies", async () => {
    const big = JSON.stringify({ method: "pages.list", params: { pad: "x".repeat(MAX_BODY_BYTES + 16) } });
    const r = await rpc(big, bearer);
    expect(r.status).toBe(413);
  });

  it("404 for unknown methods, 400 for malformed JSON, error envelope for handler failures", async () => {
    const unknown = await rpc({ method: "pages.teleport", params: {} }, bearer);
    expect(unknown.status).toBe(404);
    const bad = await rpc("{not json", bearer);
    expect(bad.status).toBe(400);
    const missing = await rpc({ params: {} }, bearer);
    expect(missing.status).toBe(404);
    const failed = await rpc({ method: "runs.get", params: { runId: "nope" } }, bearer);
    expect(failed.status).toBe(200);
    expect(((await failed.json()) as { error: { code: string } }).error.code).toBe("not_found");
  });
});

describe("ApiServer over WebSocket", () => {
  const connect = (url: string) =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => resolve(ws);
      ws.onerror = () => reject(new Error("ws failed"));
      ws.onclose = () => reject(new Error("ws closed"));
    });
  const roundtrip = (ws: WebSocket, frame: string) =>
    new Promise<Record<string, unknown>>((resolve) => {
      ws.onmessage = (ev) => resolve(JSON.parse(String(ev.data)) as Record<string, unknown>);
      ws.send(frame);
    });

  it("accepts the token on the upgrade query and refuses without it", async () => {
    await expect(connect(base.replace("http", "ws") + "/ws")).rejects.toThrow();
    const ws = await connect(`${base.replace("http", "ws")}/ws?token=${TOKEN}`);
    const ok = await roundtrip(ws, JSON.stringify({ id: 7, method: "pages.list", params: {} }));
    expect(ok.id).toBe(7);
    expect((ok.result as { echo: string }).echo).toBe("pages.list");
    ws.close();
  });

  it("connects scoped tokens and filters their event stream to scope", async () => {
    const ws = await connect(`${base.replace("http", "ws")}/ws?token=scoped`);
    const received: Record<string, unknown>[] = [];
    ws.onmessage = (ev) => received.push(JSON.parse(String(ev.data)) as Record<string, unknown>);
    // The test server has no filterEvent — a scoped socket must see nothing.
    events.emit("task.updated", { task: { taskId: "t1", workspaceId: "workspace" } });
    events.emit("run.updated", { run: { runId: "r1" } }, "r1");
    await new Promise((r) => setTimeout(r, 50));
    expect(received).toHaveLength(0);
    // RPC still dispatches under the scoped client context.
    const ok = await new Promise<Record<string, unknown>>((resolve) => {
      ws.onmessage = (ev) => resolve(JSON.parse(String(ev.data)) as Record<string, unknown>);
      ws.send(JSON.stringify({ id: 9, method: "pages.list", params: {} }));
    });
    expect((ok.result as { echo: string }).echo).toBe("pages.list");
    ws.close();
  });

  it("delivers only in-scope events to a filtered scoped socket", async () => {
    const filtered = new ApiServer({
      token: TOKEN,
      events,
      invoke: async () => ({}),
      authorizeScopedToken: (token) =>
        token === "scoped" ? { external: true, connectionId: "c1", scope: { kind: "task", workspaceId: "w1", taskId: "t1" } } : null,
      filterEvent: (_client, event) =>
        (event.payload as { task?: { taskId?: string } }).task?.taskId === "t1",
    });
    const port = await filtered.listen(0);
    try {
      const ws = await connect(`ws://127.0.0.1:${port}/ws?token=scoped`);
      const received: Record<string, unknown>[] = [];
      ws.onmessage = (ev) => received.push(JSON.parse(String(ev.data)) as Record<string, unknown>);
      events.emit("task.updated", { task: { taskId: "t1", workspaceId: "w1" } });
      events.emit("task.updated", { task: { taskId: "other", workspaceId: "w1" } });
      events.emit("settings.changed", { category: "calendar" });
      await new Promise((r) => setTimeout(r, 50));
      expect(received).toHaveLength(1);
      expect((received[0] as { event: { payload: { task: { taskId: string } } } }).event.payload.task.taskId).toBe("t1");
      ws.close();
    } finally {
      await filtered.close();
    }
  });

  it("error frames carry the request id; method is validated against MethodSchemas", async () => {
    const ws = await connect(`${base.replace("http", "ws")}/ws?token=${TOKEN}`);
    const before = seen.length;
    const unknown = await roundtrip(ws, JSON.stringify({ id: 42, method: "pages.teleport", params: {} }));
    expect(unknown.id).toBe(42);
    expect((unknown.error as { code: string }).code).toBe("not_found");
    expect(seen.length).toBe(before); // never reached invoke
    const failed = await roundtrip(ws, JSON.stringify({ id: "abc", method: "runs.get", params: { runId: "x" } }));
    expect(failed.id).toBe("abc");
    expect((failed.error as { code: string }).code).toBe("not_found");
    const bad = await roundtrip(ws, "{oops");
    expect((bad.error as { code: string }).code).toBe("invalid_params");
    ws.close();
  });
});

describe("token file permissions", () => {
  it("creates the data dir 0700 and runtime.json 0600", async () => {
    const parent = mkdtempSync(join(tmpdir(), "aux-perm-"));
    const dataDir = join(parent, "data");
    const env = { ...process.env, AUX_DATA_DIR: dataDir, AUX_STANDALONE: "0", AUX_IPC: "0" } as NodeJS.ProcessEnv;
    loadConfig(env);
    expect(statSync(dataDir).mode & 0o777).toBe(0o700);
    const rt = await startRuntime(env);
    try {
      expect(statSync(join(dataDir, "runtime.json")).mode & 0o777).toBe(0o600);
    } finally {
      await rt.close();
      rmSync(parent, { recursive: true, force: true });
    }
  });
});
