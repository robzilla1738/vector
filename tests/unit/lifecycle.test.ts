import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { chmodSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer, EventBus, openDb, Repo } from "@aux/runtime";
import {
  bootstrapWatchdog,
  isAddrInUse,
  peerStrictlyOlder,
  peerOwnsPort,
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
const trustedPeer = (port: number, pid: number, schema = SCHEMA_VERSION - 1): RuntimeDescriptor =>
  ({ port, pid, token: "peer-secret", instanceId: `instance-${pid}`,
    startedAt: 1234, version: { schema } });
const peerFetch = (peer: RuntimeDescriptor,
  handler: (url: string, init?: RequestInit) => { status: number; body?: unknown }) =>
  fakeFetch((url, init) => {
    if (url.includes("/internal/peer")) {
      const nonce = new URL(url).searchParams.get("nonce");
      if (init?.headers && (init.headers as Record<string, string>).authorization !== `Bearer ${peer.token}`)
        return { status: 401 };
      return { status: 200, body: { service: "aux-runtime", nonce, instanceId: peer.instanceId,
        pid: peer.pid, schema: peer.version?.schema, startedAt: peer.startedAt, ready: true } };
    }
    return handler(url, init);
  });

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

  it("refuses a world-readable or linked descriptor before using its token", () => {
    const d = tmp(); const path = join(d, "runtime.json");
    writePeer(d, trustedPeer(40401, 123));
    chmodSync(path, 0o644);
    expect(readRuntimeDescriptor(d)).toBeNull();
    rmSync(path);
    const target = join(d, "target.json");
    writeFileSync(target, JSON.stringify(trustedPeer(40401, 123)), { mode: 0o600 });
    symlinkSync(target, path);
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
    const peer = trustedPeer(40001, 42, SCHEMA_VERSION);
    writePeer(d, peer);
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      kill,
      alive: () => true, verify: async () => true, ownsPort: async () => true,
      fetchImpl: peerFetch(peer, () => ({ status: 200 })),
    });
    expect(out.action).toBe("peer-serves");
    expect(kill).not.toHaveBeenCalled();
  });

  it("takes over a strictly older idle peer", async () => {
    const d = tmp();
    const peer = trustedPeer(40002, 4242); writePeer(d, peer);
    let peerAlive = true;
    const killed: string[] = [];
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      alive: () => peerAlive,
      verify: async () => true, ownsPort: async () => true,
      kill: (_pid, signal) => {
        killed.push(signal);
        peerAlive = false;
      },
      fetchImpl: peerFetch(peer, (url) =>
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
    const peer = trustedPeer(40003, 4243); writePeer(d, peer);
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      idleWaitMs: 150,
      sleep: () => new Promise((r) => setTimeout(r, 10)),
      alive: () => true,
      verify: async () => true, ownsPort: async () => true,
      kill,
      log: () => {},
      fetchImpl: peerFetch(peer, (url) =>
        url.endsWith("/health")
          ? { status: 200 }
          : { status: 200, body: { result: [{ status: "running" }, { status: "completed" }] } },
      ),
    });
    expect(out.action).toBe("defer");
    expect(out.reason).toContain("idle wait");
    expect(kill).not.toHaveBeenCalled();
  });

  it("replaces an older peer that goes idle across the keep-alive gap", async () => {
    let lists = 0;
    const peer = trustedPeer(0, 4245);
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const send = (status: number, body: unknown) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(body));
      };
      if (url.pathname === "/internal/peer") {
        const nonce = url.searchParams.get("nonce");
        send(req.headers.authorization === `Bearer ${peer.token}` ? 200 : 401, {
          service: "aux-runtime", nonce, instanceId: peer.instanceId, pid: peer.pid,
          schema: peer.version?.schema, startedAt: peer.startedAt, ready: true,
        });
        return;
      }
      if (url.pathname === "/health") return send(200, { ok: true, ready: true });
      lists += 1;
      send(200, { result: lists === 1 ? [{ status: "running" }] : [] });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const port = (server.address() as { port: number }).port;
    peer.port = port;
    const d = tmp();
    writePeer(d, peer);
    let peerAlive = true;
    const killed: string[] = [];
    try {
      const out = await resolvePortInUse({
        dataDir: d,
        ourSchema: SCHEMA_VERSION,
        boundPort: port,
        alive: () => peerAlive,
        verify: async () => true,
        ownsPort: async () => true,
        kill: (_pid, signal) => {
          killed.push(signal);
          peerAlive = false;
        },
        log: () => {},
      });
      expect(out.action).toBe("takeover");
      expect(killed).toEqual(["SIGTERM"]);
      expect(lists).toBeGreaterThan(1);
    } finally {
      server.closeAllConnections();
      server.close();
    }
  });

  it("never kills a booting peer — a 503 health read waits out the idle window then defers", async () => {
    const d = tmp();
    const peer = trustedPeer(40004, 4244); writePeer(d, peer);
    const kill = vi.fn();
    const out = await resolvePortInUse({
      dataDir: d,
      ourSchema: SCHEMA_VERSION,
      idleWaitMs: 120,
      sleep: () => new Promise((r) => setTimeout(r, 10)),
      alive: () => true,
      verify: async () => true, ownsPort: async () => true,
      kill,
      // 503 = booting; runs.list also 503s → active unknown → wait → defer.
      fetchImpl: peerFetch(peer, () => ({ status: 503 })),
    });
    expect(out.action).toBe("defer");
    expect(kill).not.toHaveBeenCalled();
  });

  it("does not signal a wedged peer when its listening identity cannot be proven", async () => {
    const d = tmp();
    writePeer(d, trustedPeer(40005, 4245));
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
    expect(out.action).toBe("defer");
    expect(killed).toEqual([]);
  });

  it("refuses to signal a wedged pid it cannot verify", async () => {
    const d = tmp();
    writePeer(d, trustedPeer(40006, 4246));
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
    expect(out.reason).toContain("could not be verified");
    expect(kill).not.toHaveBeenCalled();
  });

  it("does not reclaim a stale descriptor when the peer pid is gone", async () => {
    const d = tmp();
    writePeer(d, trustedPeer(40007, 4247));
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
    expect(out.action).toBe("defer");
    expect(kill).not.toHaveBeenCalled();
  });

  it("refuses foreign, changed, or unverified older peers before any signal", async () => {
    const d = tmp(); const peer = trustedPeer(40008, 4248); writePeer(d, peer);
    const kill = vi.fn();
    const base = { dataDir: d, ourSchema: SCHEMA_VERSION, alive: () => true,
      verify: async () => true, ownsPort: async () => true, kill };
    const foreign = await resolvePortInUse({ ...base, fetchImpl: fakeFetch((url) =>
      url.includes("/internal/peer") ? { status: 200, body: { service: "aux-runtime", nonce: "wrong" } }
        : { status: 200 }) });
    expect(foreign.action).toBe("defer");
    expect((await resolvePortInUse({ ...base, boundPort: 40009,
      fetchImpl: peerFetch(peer, () => ({ status: 200 })) })).action).toBe("defer");
    expect((await resolvePortInUse({ ...base, ownsPort: async () => false,
      fetchImpl: peerFetch(peer, () => ({ status: 200 })) })).action).toBe("defer");
    expect((await resolvePortInUse({ ...base, verify: async () => false,
      fetchImpl: peerFetch(peer, () => ({ status: 200 })) })).action).toBe("defer");
    expect(kill).not.toHaveBeenCalled();
  });

  it("refuses an idle peer whose descriptor changes during review", async () => {
    const d = tmp(); const peer = trustedPeer(40009, 4249); writePeer(d, peer);
    const kill = vi.fn(); let calls = 0;
    const fetchImpl = peerFetch(peer, (url) => {
      if (url.endsWith("/rpc") && ++calls === 1)
        writePeer(d, { ...peer, instanceId: "replacement" });
      return { status: 200, body: { result: [] } };
    });
    const out = await resolvePortInUse({ dataDir: d, ourSchema: SCHEMA_VERSION,
      alive: () => true, verify: async () => true, ownsPort: async () => true,
      kill, fetchImpl });
    expect(out.action).toBe("defer");
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
    server = new ApiServer({ token: "t", events: new EventBus(repo), invoke: async () => ({ ok: true }),
      peerIdentity: { instanceId: "instance", pid: 99, schema: SCHEMA_VERSION, startedAt: 1234 } });
    port = await server.listen(0);
  });
  afterAll(async () => {
    await server.close();
  });

  it("answers 503 on every route until ready, then serves normally", async () => {
    const base = `http://127.0.0.1:${port}`;
    expect(await peerOwnsPort(process.pid, port)).toBe(true);
    const nonce = "a".repeat(48);
    expect((await fetch(`${base}/internal/peer?nonce=${nonce}`)).status).toBe(401);
    expect((await fetch(`${base}/internal/peer?nonce=bad`,
      { headers: { authorization: "Bearer t" } })).status).toBe(400);
    const proof = await fetch(`${base}/internal/peer?nonce=${nonce}`,
      { headers: { authorization: "Bearer t" } });
    expect(proof.status).toBe(200);
    expect(await proof.json()).toMatchObject({ service: "aux-runtime", instanceId: "instance",
      nonce, pid: 99, schema: SCHEMA_VERSION, ready: false });
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
