import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer, EventBus, MAX_BODY_BYTES, openDb, Repo, loadConfig, startRuntime } from "@vector/runtime";
import { VectorError } from "@vector/contracts";

const TOKEN = "t0ken-secret";
let server: ApiServer;
let base: string;
const seen: { method: string; params: unknown }[] = [];

beforeAll(async () => {
  const repo = new Repo(openDb(":memory:"));
  server = new ApiServer({
    token: TOKEN,
    events: new EventBus(repo),
    invoke: async (method, params) => {
      seen.push({ method, params });
      if (method === "runs.get") throw new VectorError("not_found", "no run");
      return { echo: method, params };
    },
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
    const r = await rpc({ method: "pages.list", params: { backend: "vector" } }, bearer);
    expect(r.status).toBe(200);
    const body = (await r.json()) as { result: { echo: string; params: unknown } };
    expect(body.result.echo).toBe("pages.list");
    expect(body.result.params).toEqual({ backend: "vector" });
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
    const parent = mkdtempSync(join(tmpdir(), "vector-perm-"));
    const dataDir = join(parent, "data");
    const env = { ...process.env, VECTOR_DATA_DIR: dataDir, VECTOR_STANDALONE: "0", VECTOR_IPC: "0" } as NodeJS.ProcessEnv;
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
