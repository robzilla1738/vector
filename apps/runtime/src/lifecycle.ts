import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Daemon lifecycle (06-T): readiness gating lives on ApiServer; this module
 * is the takeover/reclaim policy for a port already owned by another Aux
 * runtime, plus the bootstrap stall watchdog.
 *
 * Rules:
 *  - versioned takeover replaces ONLY a strictly older daemon (an older
 *    SCHEMA_VERSION — a peer missing the field is a pre-versioning build and
 *    counts as older). An equal or newer peer keeps the port; the new
 *    process defers instead of fighting it.
 *  - an older-but-busy peer gets TAKEOVER_IDLE_WAIT_MS to go idle before we
 *    replace it; still busy after the wait → defer, don't kill.
 *  - a wedged peer (port bound, /health unreachable) is reclaimed only after
 *    its process is verified to be an Aux runtime binary — never kill a pid
 *    we can't identify.
 */

export const TAKEOVER_IDLE_WAIT_MS = 30_000;
export const BOOTSTRAP_STALL_TIMEOUT_MS = 180_000;
const EXIT_GRACE_MS = 5_000;
const PROBE_TIMEOUT_MS = 1_000;

/** Run statuses that count as in-flight work for the idle wait. */
const ACTIVE_RUN_STATUSES = new Set(["queued", "planning", "running", "paused", "needs_input"]);

export interface RuntimeDescriptor {
  port: number;
  token: string;
  pid?: number;
  version?: { schema: number };
  startedAt?: number;
}

export function readRuntimeDescriptor(dataDir: string): RuntimeDescriptor | null {
  const path = join(dataDir, "runtime.json");
  try {
    if (!existsSync(path)) return null;
    const value = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    if (!Number.isInteger(value.port) || typeof value.token !== "string") return null;
    return {
      port: value.port as number,
      token: value.token,
      ...(Number.isInteger(value.pid) ? { pid: value.pid as number } : {}),
      ...(value.version && typeof (value.version as { schema?: unknown }).schema === "number"
        ? { version: { schema: (value.version as { schema: number }).schema } }
        : {}),
      ...(typeof value.startedAt === "number" ? { startedAt: value.startedAt } : {}),
    };
  } catch {
    return null;
  }
}

export function peerStrictlyOlder(peer: RuntimeDescriptor | null, ourSchema: number): boolean {
  // Pre-versioning daemons (no version field) are strictly older by
  // definition; a peer on an equal or newer schema is never replaced.
  return (peer?.version?.schema ?? -1) < ourSchema;
}

type Fetch = typeof fetch;

async function probeHealth(
  descriptor: RuntimeDescriptor,
  fetchImpl: Fetch,
): Promise<"ready" | "booting" | "down"> {
  try {
    const res = await fetchImpl(`http://127.0.0.1:${descriptor.port}/health`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (res.status === 200) return "ready";
    if (res.status === 503) return "booting";
    return "down";
  } catch {
    return "down";
  }
}

/** Active runs on the peer, or null when the count can't be learned. */
async function peerActiveRuns(descriptor: RuntimeDescriptor, fetchImpl: Fetch): Promise<number | null> {
  try {
    const res = await fetchImpl(`http://127.0.0.1:${descriptor.port}/rpc`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${descriptor.token}` },
      body: JSON.stringify({ id: 1, method: "runs.list", params: { limit: 200 } }),
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: { status?: string }[] };
    if (!Array.isArray(body.result)) return null;
    return body.result.filter((r) => ACTIVE_RUN_STATUSES.has(r.status ?? "")).length;
  } catch {
    return null;
  }
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * The wedged-daemon guard: reclaim only when the pid is a real process whose
 * command line identifies an Aux runtime (same entry filename we're running,
 * or an aux-runtime binary). We never signal a pid we can't identify.
 */
export async function verifyPeerProcess(
  pid: number,
  expectedEntry = process.argv[1] ?? "",
): Promise<boolean> {
  if (!pidAlive(pid)) return false;
  try {
    const { execFile } = await import("node:child_process");
    return await new Promise<boolean>((resolve) => {
      execFile("ps", ["-p", String(pid), "-o", "command="], { timeout: 3_000 }, (err, stdout) => {
        if (err) return resolve(false);
        const command = stdout.trim();
        const entry = expectedEntry.split("/").pop() ?? "";
        resolve((entry !== "" && command.includes(entry)) || command.includes("aux-runtime"));
      });
    });
  } catch {
    return false;
  }
}

export type TakeoverOutcome = {
  action: "takeover" | "reclaim" | "peer-serves" | "defer";
  reason: string;
};

export async function resolvePortInUse(opts: {
  dataDir: string;
  ourSchema: number;
  fetchImpl?: Fetch;
  idleWaitMs?: number;
  exitGraceMs?: number;
  verify?: (pid: number) => Promise<boolean>;
  alive?: (pid: number) => boolean;
  kill?: (pid: number, signal: NodeJS.Signals) => void;
  sleep?: (ms: number) => Promise<void>;
  log?: (line: string) => void;
}): Promise<TakeoverOutcome> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const verify = opts.verify ?? verifyPeerProcess;
  const alive = opts.alive ?? pidAlive;
  const kill = opts.kill ?? ((pid: number, signal: NodeJS.Signals) => process.kill(pid, signal));
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const log = opts.log ?? ((line: string) => process.stderr.write(`[runtime] ${line}\n`));

  const waitForExit = async (pid: number | undefined, graceMs: number): Promise<boolean> => {
    if (pid === undefined) return true;
    const deadline = Date.now() + graceMs;
    while (Date.now() < deadline) {
      if (!alive(pid)) return true;
      await sleep(100);
    }
    return !alive(pid);
  };

  const terminate = async (pid: number | undefined): Promise<boolean> => {
    if (pid === undefined || !alive(pid)) return true;
    kill(pid, "SIGTERM");
    if (await waitForExit(pid, opts.exitGraceMs ?? EXIT_GRACE_MS)) return true;
    // A verified-but-unresponsive daemon gets one SIGKILL; anything we could
    // not verify never reaches this branch.
    kill(pid, "SIGKILL");
    return waitForExit(pid, 2_000);
  };

  // No descriptor means a foreign process owns the port — we never guess.
  const peer = readRuntimeDescriptor(opts.dataDir);
  if (!peer) {
    return {
      action: "defer",
      reason: "port in use but no runtime descriptor found; refusing to signal an unknown owner",
    };
  }

  // A peer that never answers /health is wedged: reclaim only after the pid
  // is verified to be our runtime, never blind-kill a foreign process.
  const probe = await probeHealth(peer, fetchImpl);
  if (probe === "down") {
    if (peer.pid !== undefined && alive(peer.pid)) {
      if (!(await verify(peer.pid))) {
        return {
          action: "defer",
          reason: `port held by unverifiable pid ${peer.pid}; refusing to signal a foreign process`,
        };
      }
      if (!(await terminate(peer.pid))) {
        return { action: "defer", reason: `verified peer pid ${peer.pid} did not exit` };
      }
      return { action: "reclaim", reason: `reclaimed port from wedged runtime pid ${peer.pid}` };
    }
    // No pid to verify — stale descriptor. Retrying the bind fails again if
    // a real foreign process owns the port, which is the safe failure mode.
    return { action: "reclaim", reason: "wedged peer descriptor without a live pid" };
  }

  if (!peerStrictlyOlder(peer, opts.ourSchema)) {
    return {
      action: "peer-serves",
      reason: `existing runtime (schema ${peer.version?.schema ?? "unknown"}) is not strictly older`,
    };
  }

  // Strictly older and alive: wait out in-flight work (30 s) rather than
  // killing mid-run; still busy after the wait → defer.
  const idleWaitMs = opts.idleWaitMs ?? TAKEOVER_IDLE_WAIT_MS;
  const deadline = Date.now() + idleWaitMs;
  for (;;) {
    const active = await peerActiveRuns(peer, fetchImpl);
    if (active === 0) break;
    if (Date.now() >= deadline) {
      return {
        action: "defer",
        reason: `older runtime still busy after ${Math.round(idleWaitMs / 1000)}s idle wait`,
      };
    }
    log(`takeover waiting for ${active ?? "?"} active runs on older runtime`);
    await sleep(1_000);
  }

  if (!(await terminate(peer.pid))) {
    return { action: "defer", reason: `older runtime pid ${peer.pid} did not exit` };
  }
  return { action: "takeover", reason: `replaced strictly older runtime pid ${peer.pid ?? "unknown"}` };
}

export function isAddrInUse(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "EADDRINUSE";
}

/**
 * Bootstrap watchdog: if the runtime hasn't reached ready within the stall
 * window, declare it wedged. The default action exits so the supervising
 * browser can restart cleanly instead of serving a half-built daemon.
 */
export function bootstrapWatchdog(ms = BOOTSTRAP_STALL_TIMEOUT_MS, onStall?: () => void): () => void {
  const timer = setTimeout(() => {
    if (onStall) {
      onStall();
      return;
    }
    process.stderr.write(`[runtime] bootstrap stalled after ${Math.round(ms / 1000)}s; exiting\n`);
    process.exit(1);
  }, ms);
  timer.unref?.();
  return () => clearTimeout(timer);
}
