import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

/**
 * Daemon lifecycle (06-T): readiness gating lives on ApiServer; this module
 * is the takeover policy for a port already owned by another Aux
 * runtime, plus the bootstrap stall watchdog.
 *
 * Rules:
 *  - versioned takeover replaces ONLY a strictly older daemon with a
 *    matching authenticated descriptor, listener PID and executable. Legacy
 *    peers lacking that proof are left alone. An equal or newer peer keeps
 *    the port; the new process defers instead of fighting it.
 *  - development identity is the user id and executable path. Unsigned
 *    builds do not require a code signature. A different user is foreign,
 *    a different executable is changed, and an unreadable process is
 *    unproven. None of those are signalled.
 *  - an older-but-busy peer gets TAKEOVER_IDLE_WAIT_MS to go idle before we
 *    replace it; still busy after the wait → defer, don't kill.
 *  - a wedged peer (port bound, /health unreachable) is never signalled;
 *    its live identity cannot be proven well enough to justify a kill.
 */

export const TAKEOVER_IDLE_WAIT_MS = 30_000;
export const BOOTSTRAP_STALL_TIMEOUT_MS = 180_000;
const EXIT_GRACE_MS = 5_000;
const PROBE_TIMEOUT_MS = 1_000;
// A reused keep-alive socket accepts the next proof and then stays silent,
// so the idle-gap probe times out and a live peer looks like it changed.
const closedProbe = { connection: "close" };

/** Run statuses that count as in-flight work for the idle wait. */
const ACTIVE_RUN_STATUSES = new Set(["queued", "planning", "running", "paused", "needs_input"]);

export interface RuntimeDescriptor {
  port: number;
  token: string;
  pid?: number;
  version?: { schema: number };
  startedAt?: number;
  instanceId?: string;
  /** Recorded development identity. Absent on peers written before this policy. */
  uid?: number;
  executable?: string;
}

/** Unsigned development identity: the user and the running executable. No code signature. */
export interface DevelopmentPeerIdentity {
  uid: number;
  executable: string;
}

export function readRuntimeDescriptor(dataDir: string): RuntimeDescriptor | null {
  const path = join(dataDir, "runtime.json");
  try {
    const file = lstatSync(path);
    if (
      !file.isFile() ||
      file.isSymbolicLink() ||
      file.size > 8192 ||
      (file.mode & 0o077) !== 0 ||
      (typeof process.getuid === "function" && file.uid !== process.getuid())
    )
      return null;
    const value = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    if (!Number.isInteger(value.port) || typeof value.token !== "string") return null;
    const executable =
      typeof value.executable === "string" &&
      value.executable.startsWith("/") &&
      value.executable.length <= 1024 &&
      !value.executable.includes("\0")
        ? value.executable
        : undefined;
    return {
      port: value.port as number,
      token: value.token,
      ...(Number.isInteger(value.pid) ? { pid: value.pid as number } : {}),
      ...(value.version && typeof (value.version as { schema?: unknown }).schema === "number"
        ? { version: { schema: (value.version as { schema: number }).schema } }
        : {}),
      ...(typeof value.startedAt === "number" ? { startedAt: value.startedAt } : {}),
      ...(typeof value.instanceId === "string" ? { instanceId: value.instanceId } : {}),
      ...(Number.isInteger(value.uid) && (value.uid as number) >= 0 ? { uid: value.uid as number } : {}),
      ...(executable ? { executable } : {}),
    };
  } catch {
    return null;
  }
}

export function peerStrictlyOlder(peer: RuntimeDescriptor | null, ourSchema: number): boolean {
  // This only compares versions. Missing version is logically older, but
  // takeover still requires the separate authenticated identity proof.
  return (peer?.version?.schema ?? -1) < ourSchema;
}

type Fetch = typeof fetch;

async function probeHealth(
  descriptor: RuntimeDescriptor,
  fetchImpl: Fetch,
): Promise<"ready" | "booting" | "down"> {
  try {
    const res = await fetchImpl(`http://127.0.0.1:${descriptor.port}/health`, {
      headers: closedProbe,
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    await res.body?.cancel();
    if (res.status === 200) return "ready";
    if (res.status === 503) return "booting";
    return "down";
  } catch {
    return "down";
  }
}

/** Bind a bearer-authenticated challenge to the descriptor and listening peer. */
async function probePeer(
  descriptor: RuntimeDescriptor,
  fetchImpl: Fetch,
): Promise<"ready" | "booting" | null> {
  if (
    !descriptor.pid ||
    !descriptor.instanceId ||
    !descriptor.startedAt ||
    !descriptor.version ||
    !descriptor.token
  )
    return null;
  const nonce = randomBytes(24).toString("hex");
  try {
    const res = await fetchImpl(`http://127.0.0.1:${descriptor.port}/internal/peer?nonce=${nonce}`, {
      headers: { ...closedProbe, authorization: `Bearer ${descriptor.token}` },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const body = (await res.json()) as Record<string, unknown>;
    if (
      body.service !== "aux-runtime" ||
      body.nonce !== nonce ||
      body.instanceId !== descriptor.instanceId ||
      body.pid !== descriptor.pid ||
      body.schema !== descriptor.version.schema ||
      body.startedAt !== descriptor.startedAt ||
      typeof body.ready !== "boolean"
    )
      return null;
    return body.ready ? "ready" : "booting";
  } catch {
    return null;
  }
}

/** Require the descriptor PID to own the loopback listening socket. */
export async function peerOwnsPort(pid: number, port: number): Promise<boolean> {
  try {
    const { execFile } = await import("node:child_process");
    return await new Promise<boolean>((resolve) => {
      execFile("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], { timeout: 3_000 }, (err, stdout) => {
        if (err) return resolve(false);
        const pids = stdout.trim().split(/\s+/).filter(Boolean);
        resolve(pids.length === 1 && pids[0] === String(pid));
      });
    });
  } catch {
    return false;
  }
}

/** Active runs on the peer, or null when the count can't be learned. */
async function peerActiveRuns(descriptor: RuntimeDescriptor, fetchImpl: Fetch): Promise<number | null> {
  try {
    const res = await fetchImpl(`http://127.0.0.1:${descriptor.port}/rpc`, {
      method: "POST",
      headers: {
        ...closedProbe,
        "content-type": "application/json",
        authorization: `Bearer ${descriptor.token}`,
      },
      body: JSON.stringify({ id: 1, method: "runs.list", params: { limit: 200 } }),
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const body = (await res.json()) as { result?: { status?: string }[] };
    if (!Array.isArray(body.result)) return null;
    // A full page may hide further active runs. Unknown means defer.
    if (body.result.length >= 200) return null;
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
 * Extra executable check after the authenticated peer and listening PID checks.
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

export function developmentPeerIdentity(): DevelopmentPeerIdentity {
  const uid = typeof process.getuid === "function" ? process.getuid() : -1;
  return { uid, executable: realpathSync(process.execPath) };
}

function canonicalPath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

function execText(command: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    import("node:child_process")
      .then(({ execFile }) => {
        execFile(command, args, { timeout: 3_000 }, (err, stdout) => {
          resolve(err ? null : String(stdout));
        });
      })
      .catch(() => resolve(null));
  });
}

/**
 * Live user and executable for `pid`. macOS `ps` reports argv0, not the
 * binary, so the text file is read from lsof (or `/proc/pid/exe`).
 * Unreadable identity is null — never a guess.
 */
export async function peerProcessIdentity(pid: number): Promise<DevelopmentPeerIdentity | null> {
  try {
    const ps = await execText("ps", ["-ww", "-p", String(pid), "-o", "uid="]);
    const uidText = ps?.trim() ?? "";
    if (!/^\d+$/.test(uidText)) return null;
    const uid = Number(uidText);
    let executable: string | null = null;
    if (process.platform === "darwin") {
      const listing = await execText("lsof", ["-n", "-a", "-p", String(pid), "-d", "txt", "-Fn"]);
      if (listing === null) return null;
      for (const line of listing.split("\n")) {
        if (line.startsWith("n/")) {
          executable = line.slice(1);
          break;
        }
      }
    } else if (process.platform === "linux") {
      try {
        executable = realpathSync(`/proc/${pid}/exe`);
      } catch {
        return null;
      }
    }
    if (!executable) return null;
    return { uid, executable: canonicalPath(executable) };
  } catch {
    return null;
  }
}

export function assessDevelopmentPeer(input: {
  ours: DevelopmentPeerIdentity;
  peerUid: number | null;
  peerExecutable: string | null;
  descriptorUid?: number;
  descriptorExecutable?: string;
}): "accept" | "foreign" | "changed" | "unproven" {
  if (input.peerUid === null || !input.peerExecutable) return "unproven";
  if (!Number.isInteger(input.peerUid) || input.peerUid < 0) return "unproven";
  if (input.peerUid !== input.ours.uid) return "foreign";
  if (input.descriptorUid !== undefined && input.descriptorUid !== input.peerUid) return "foreign";
  const live = canonicalPath(input.peerExecutable);
  if (live !== canonicalPath(input.ours.executable)) return "changed";
  if (input.descriptorExecutable !== undefined && canonicalPath(input.descriptorExecutable) !== live)
    return "changed";
  return "accept";
}

function developmentRefusal(verdict: "foreign" | "changed" | "unproven"): string {
  if (verdict === "foreign") return "peer user does not match this development identity";
  if (verdict === "changed") return "peer executable changed";
  return "peer development identity could not be verified";
}

export type TakeoverOutcome = {
  action: "takeover" | "peer-serves" | "defer";
  reason: string;
};

export async function resolvePortInUse(opts: {
  dataDir: string;
  ourSchema: number;
  fetchImpl?: Fetch;
  idleWaitMs?: number;
  exitGraceMs?: number;
  verify?: (pid: number) => Promise<boolean>;
  ownsPort?: (pid: number, port: number) => Promise<boolean>;
  /** When set, takeover also requires this unsigned development identity. */
  identity?: DevelopmentPeerIdentity;
  identify?: (pid: number) => Promise<DevelopmentPeerIdentity | null>;
  boundPort?: number;
  alive?: (pid: number) => boolean;
  kill?: (pid: number, signal: NodeJS.Signals) => void;
  sleep?: (ms: number) => Promise<void>;
  log?: (line: string) => void;
}): Promise<TakeoverOutcome> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const verify = opts.verify ?? verifyPeerProcess;
  const ownsPort = opts.ownsPort ?? peerOwnsPort;
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

  if (
    !peer.pid ||
    !peer.instanceId ||
    !peer.startedAt ||
    !peer.version ||
    (opts.boundPort !== undefined && peer.port !== opts.boundPort)
  )
    return { action: "defer", reason: "peer descriptor lacks exact identity or bound port" };

  const peerPid = peer.pid;
  const developmentBlock = async (recorded: RuntimeDescriptor): Promise<TakeoverOutcome | null> => {
    if (!opts.identity) return null;
    const identify = opts.identify ?? peerProcessIdentity;
    let verdict: "accept" | "foreign" | "changed" | "unproven" = "unproven";
    try {
      const live = await identify(peerPid);
      verdict = assessDevelopmentPeer({
        ours: opts.identity,
        peerUid: live?.uid ?? null,
        peerExecutable: live?.executable ?? null,
        descriptorUid: recorded.uid,
        descriptorExecutable: recorded.executable,
      });
    } catch {
      verdict = "unproven";
    }
    if (verdict === "accept") return null;
    return { action: "defer", reason: developmentRefusal(verdict) };
  };

  const authenticated = await probePeer(peer, fetchImpl);
  if (!authenticated || !alive(peerPid) || !(await ownsPort(peerPid, peer.port)) || !(await verify(peerPid)))
    return { action: "defer", reason: "peer identity, port ownership, or executable could not be verified" };

  const initialBlock = await developmentBlock(peer);
  if (initialBlock) return initialBlock;

  if (authenticated !== "ready") return { action: "defer", reason: "peer is still booting" };

  // A peer that stops answering health after the proof must be left alone.
  const probe = await probeHealth(peer, fetchImpl);
  if (probe !== "ready") {
    return { action: "defer", reason: "peer health is unavailable; refusing an unprovable takeover" };
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
    const reviewed = readRuntimeDescriptor(opts.dataDir);
    if (
      !reviewed ||
      reviewed.instanceId !== peer.instanceId ||
      (await probePeer(peer, fetchImpl)) !== "ready" ||
      !(await ownsPort(peerPid, peer.port))
    )
      return { action: "defer", reason: "peer changed during takeover review" };
    const reviewedBlock = await developmentBlock(reviewed);
    if (reviewedBlock) return reviewedBlock;
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

  // Re-read immediately before the signal. A peer whose user or executable
  // changed during the idle wait is left running.
  const fresh = readRuntimeDescriptor(opts.dataDir);
  if (
    !fresh ||
    fresh.instanceId !== peer.instanceId ||
    (await probePeer(peer, fetchImpl)) !== "ready" ||
    !(await ownsPort(peerPid, peer.port)) ||
    !(await verify(peerPid))
  )
    return { action: "defer", reason: "peer changed before takeover dispatch" };
  const freshBlock = await developmentBlock(fresh);
  if (freshBlock) return freshBlock;

  if (!(await terminate(peerPid))) {
    return { action: "defer", reason: `older runtime pid ${peerPid} did not exit` };
  }
  return { action: "takeover", reason: `replaced strictly older runtime pid ${peerPid}` };
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
