import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer, EventBus, openDb, Repo } from "@aux/runtime";
import {
  bootstrapWatchdog,
  isAddrInUse,
  peerStrictlyOlder,
  readRuntimeDescriptor,
  resolvePortInUse,
  verifyPeerProcess,
  type RuntimeDescriptor,
} from "../../apps/runtime/src/lifecycle.js";
import { SCHEMA_VERSION } from "../../apps/runtime/src/store/db.js";

const dir = () => mkdtempSync(join(tmpdir(), "aux-lifecycle-"));
const dirs: string[] = [];
const tmp = () => {
  const d = dir();
  dirs.push(d);
  return d;
};
afterAll(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
});

const writePeer = (dataDir: string, peer: RuntimeDescriptor) =>
  writeFileSync(join(dataDir, "runtime.json"), JSON.stringify(peer), { mode: 0o600 });

const fakeFetch = (handler: (url: string, init?: RequestInit) => { status: number; body?: unknown }) =>
  (async (url: unknown, init?: unknown) => {
    const out = handler(String(url), init as RequestInit);
    return new Response(JSON.stringify(out.body ?? {}), { status: out.status });
  }) as unknown as typeof fetch;

describe("runtime lifecycle (06-T)", () => {
  it("readRuntimeDescriptor parses version and startedAt, tolerates missing/garbage", () => {
    const d = tmp();
    expect(readRuntimeDescriptor(d)).toBeNull();
    writePeer(d, { port: 4444, token: "t", pid: 123, version: { schema: 24 }, startedAt: 99 });
    expect(readRuntimeDescriptor(d)).toEqual({
      port: 4444,
      token: "t",
      pid: 123,
      version: { schema: 24 },
      startedAt: 99,
    });
    writeFileSync(join(d, "runtime.json"), "{nope");
    expect(readRuntimeDescriptor(d)).toBeNull();
    writeFileSync(join(d, "runtime.json"), JSON.stringify({ token: "no-port" }));
    expect(readRuntimeDescriptor(d)).toBeNull();
  });

  it("peerStrictlyOlder: only a strictly older schema (or a pre-versioning peer) is replaceable", () => {
    expect(peerStrictlyOlder(null, SCHEMA_VERSION)).toBe(true);
    expect(peerStrictlyOlder({ port: 1, token: "t" }, SCHEMA_VERSION)).toBe(true);
    expect(
      peerStrictlyOlder({ port: 1, token: "t", version: { schema: SCHEMA_VERSION - 1 } }, SCHEMA_VERSION),
    ).toBe(true);
    expect(
      peerStrictlyOlder({ port: 1, token: "t", version: { schema: SCHEMA_VERSION } }, SCHEMA_VERSION),
    ).toBe(false);
    expect(
      peerStrictlyOlder({ port: 1, token: "t", version: { schema: SCHEMA_VERSION + 1 } }, SCHEMA_VERSION),
    ).toBe(false);
  });

  it("defers when the port has no runtime descriptor — never signals an unknown owner", async () => {
    const d = tmp();
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      kill,
      fetchImpl: fakeFetch(() => ({ status: 200 })),
    });
    expect(out.action).toBe("defer");
    expect(kill).not.toHaveBeenCalled();
  });

  it("peer-serves when the live peer is not strictly older", async () => {
    const d = tmp();
    writePeer(d, { port: 40001, token: "t", pid: 42, version: { schema: SCHEMA_VERSION } });
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      kill,
      fetchImpl: fakeFetch(() => ({ status: 200 })),
    });
    expect(out.action).toBe("peer-serves");
    expect(kill).not.toHaveBeenCalled();
  });

  it("takes over a strictly older idle peer", async () => {
    const d = tmp();
    writePeer(d, { port: 40002, token: "t", pid: 4242, version: { schema: SCHEMA_VERSION - 1 } });
    let peerAlive = true;
    const killed: string[] = [];
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      alive: () => peerAlive,
      kill: (_pid, signal) => {
        killed.push(signal);
        peerAlive = false;
      },
      fetchImpl: fakeFetch((url) =>
        url.endsWith("/health")
          ? { status: 200 }
          : { status: 200, body: { result: [{ status: "completed" }] } },
      ),
    });
    expect(out.action).toBe("takeover");
    expect(killed).toEqual(["SIGTERM"]);
  });

  it("defers rather than killing an older peer that stays busy past the idle wait", async () => {
    const d = tmp();
    writePeer(d, { port: 40003, token: "t", pid: 4243, version: { schema: SCHEMA_VERSION - 1 } });
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      idleWaitMs: 150,
      sleep: () => new Promise((r) => setTimeout(r, 10)),
      alive: () => true,
      kill,
      log: () => {},
      fetchImpl: fakeFetch((url) =>
        url.endsWith("/health")
          ? { status: 200 }
          : { status: 200, body: { result: [{ status: "running" }, { status: "completed" }] } },
      ),
    });
    expect(out.action).toBe("defer");
    expect(out.reason).toContain("idle wait");
    expect(kill).not.toHaveBeenCalled();
  });

  it("never kills a booting peer — a 503 health read waits out the idle window then defers", async () => {
    const d = tmp();
    writePeer(d, { port: 40004, token: "t", pid: 4244, version: { schema: SCHEMA_VERSION - 1 } });
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      idleWaitMs: 120,
      sleep: () => new Promise((r) => setTimeout(r, 10)),
      alive: () => true,
      kill,
      // 503 = booting; runs.list also 503s → active unknown → wait → defer.
      fetchImpl: fakeFetch(() => ({ status: 503 })),
    });
    expect(out.action).toBe("defer");
    expect(kill).not.toHaveBeenCalled();
  });

  it("reclaims a wedged peer only after the pid verifies as our runtime", async () => {
    const d = tmp();
    writePeer(d, { port: 40005, token: "t", pid: 4245 });
    let peerAlive = true;
    const killed: string[] = [];
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      alive: () => peerAlive,
      verify: async () => true,
      kill: (_pid, signal) => {
        killed.push(signal);
        peerAlive = false;
      },
      fetchImpl: fakeFetch(() => {
        throw new Error("unreachable");
      }),
    });
    expect(out.action).toBe("reclaim");
    expect(killed).toEqual(["SIGTERM"]);
  });

  it("refuses to signal a wedged pid it cannot verify", async () => {
    const d = tmp();
    writePeer(d, { port: 40006, token: "t", pid: 4246 });
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      alive: () => true,
      verify: async () => false,
      kill,
      fetchImpl: fakeFetch(() => {
        throw new Error("unreachable");
      }),
    });
    expect(out.action).toBe("defer");
    expect(out.reason).toContain("unverifiable");
    expect(kill).not.toHaveBeenCalled();
  });

  it("reclaims when the wedged peer's pid is already gone", async () => {
    const d = tmp();
    writePeer(d, { port: 40007, token: "t", pid: 4247 });
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      alive: () => false,
      kill,
      fetchImpl: fakeFetch(() => {
        throw new Error("unreachable");
      }),
    });
    expect(out.action).toBe("reclaim");
    expect(kill).not.toHaveBeenCalled();
  });

  it("verifyPeerProcess only matches a live pid running our entry", async () => {
    expect(await verifyPeerProcess(process.pid, "vitest")).toBe(true);
    expect(await verifyPeerProcess(process.pid, "definitely-not-aux")).toBe(false);
    expect(await verifyPeerProcess(999_999_999, "vitest")).toBe(false);
  });

  it("bootstrapWatchdog fires the stall handler and disarms", async () => {
    const stall = vi.fn();
    bootstrapWatchdog(20, stall);
    await new Promise((r) => setTimeout(r, 60));
    expect(stall).toHaveBeenCalledTimes(1);
    const disarmed = vi.fn();
    const disarm = bootstrapWatchdog(20, disarmed);
    disarm();
    await new Promise((r) => setTimeout(r, 60));
    expect(disarmed).not.toHaveBeenCalled();
  });

  it("isAddrInUse matches only EADDRINUSE", () => {
    expect(isAddrInUse(Object.assign(new Error("x"), { code: "EADDRINUSE" }))).toBe(true);
    expect(isAddrInUse(new Error("x"))).toBe(false);
    expect(isAddrInUse(undefined)).toBe(false);
  });
});

describe("ApiServer readiness gate", () => {
  let server: ApiServer;
  let port: number;
  beforeAll(async () => {
    const repo = new Repo(openDb(":memory:"));
    server = new ApiServer({ token: "t", events: new EventBus(repo), invoke: async () => ({ ok: true }) });
    port = await server.listen(0);
  });
  afterAll(async () => {
    await server.close();
  });

  it("answers 503 on every route until ready, then serves normally", async () => {
    const base = `http://127.0.0.1:${port}`;
    const health = await fetch(`${base}/health`);
    expect(health.status).toBe(503);
    expect(await health.json()).toMatchObject({ ok: false, ready: false });
    const rpc = await fetch(`${base}/rpc`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer t" },
      body: JSON.stringify({ id: 1, method: "pages.list", params: {} }),
    });
    expect(rpc.status).toBe(503);
    expect(await rpc.json()).toMatchObject({ error: { code: "not_ready" } });
    // WS upgrades are refused pre-ready too.
    await expect(
      new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://127.0.0.1:${port}/ws?token=t`);
        ws.onopen = resolve;
        ws.onerror = () => reject(new Error("upgrade refused"));
      }),
    ).rejects.toThrow("upgrade refused");

    server.setReady();
    expect((await fetch(`${base}/health`)).status).toBe(200);
    const ready = await (await fetch(`${base}/health`)).json();
    expect(ready).toMatchObject({ ok: true, ready: true });
    const after = await fetch(`${base}/rpc`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer t" },
      body: JSON.stringify({ id: 1, method: "pages.list", params: {} }),
    });
    expect(after.status).toBe(200);
  });
});
