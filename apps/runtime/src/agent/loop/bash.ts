import { existsSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { execFile } from "node:child_process";
import { AuxError } from "@aux/contracts";
import type { LoopPark } from "./types.js";

/**
 * S5 deliverable 2 — `bash` under a seatbelt (06-X). The seatbelt is the
 * policy surface: a generated SBPL profile denies process startup nothing it
 * needs but confines writes to the session roots, denies reads of /Users
 * and the runtime/OS credential stores (the session roots are re-allowed
 * after, so their contents stay readable), and denies the network by
 * default. `network: true` runs one recipient-scoped decide() first
 * (always confirms) and then allows outbound only. No cookie store, no
 * user env — PATH, TMPDIR and HOME are synthesized inside the scratch
 * root so nothing outside the roots is needed.
 */

export interface BashSeatbeltInput {
  command: string;
  timeoutMs?: number;
  workdir?: string;
  network?: boolean;
  requireEscalated?: boolean;
  justification?: string;
  prefixRule?: string;
  signal?: AbortSignal;
}

export interface BashSeatbeltResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  truncated: boolean;
}

const MAX_COMMAND_BYTES = 8_192;
const MAX_TIMEOUT_MS = 120_000;
const OUTPUT_CAP_BYTES = 64 * 1024;
const SANDBOX_EXEC = "/usr/bin/sandbox-exec";

export type BashRunner = (
  file: string,
  args: string[],
  opts: { cwd: string; env: Record<string, string>; timeoutMs: number; signal?: AbortSignal },
) => Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }>;

/** decide() verdict for a network-enabled command — `park` carries the suspension for the loop. */
export type BashGate = (
  command: string,
  ctx: { runId: string; threadId: string; turnId: string },
) => Promise<"allow" | "deny" | { park: LoopPark }>;

/** SBPL string literals escape `"` and `\`. */
const sbplLiteral = (path: string) => `"${path.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;

/** Real path when the entry exists — the sandbox evaluates resolved paths, not spellings. */
const canonical = (path: string) => {
  const resolved = resolve(path);
  try {
    return realpathSync(resolved);
  } catch {
    return resolved;
  }
};

const defaultRunner: BashRunner = (file, args, opts) =>
  new Promise((resolvePromise) => {
    execFile(
      file,
      args,
      {
        cwd: opts.cwd,
        env: opts.env,
        timeout: opts.timeoutMs,
        signal: opts.signal,
        killSignal: "SIGKILL",
        maxBuffer: OUTPUT_CAP_BYTES * 2,
        encoding: "utf8",
      },
      (error, stdout, stderr) => {
        const timedOut = !!error && (error as NodeJS.ErrnoException & { killed?: boolean }).killed === true;
        const err = error as (Error & { code?: number | string }) | null;
        resolvePromise({
          stdout: stdout ?? "",
          stderr: stderr ?? (timedOut ? "" : err && typeof err.code === "string" ? `${err.code}: ${err.message}` : ""),
          exitCode: timedOut ? null : typeof err?.code === "number" ? err.code : err ? null : 0,
          timedOut,
        });
      },
    );
  });

export class BashSeatbelt {
  constructor(
    private readonly opts: {
      /** Writable session roots — resolved; the only places commands may write, and the only user-side paths readable. */
      writableRoots: (ctx?: { runId: string; threadId: string; turnId: string }) => string[];
      readableRoots?: (ctx?: { runId: string; threadId: string; turnId: string }) => string[];
      /** Scratch dir (inside a writable root) used as TMPDIR/HOME. */
      scratchDir: string;
      /**
       * Extra paths denied for file reads beyond /Users — the runtime data
       * dir (API token, cookies, history) and OS credential stores. The
       * session roots are re-allowed after these, so a root inside a denied
       * region stays readable while its siblings do not.
       */
      extraDenyRead?: () => string[];
      /** decide() gate for `network: true` — absent means network requests are unsupported. */
      networkGate?: BashGate;
      escalationGate?: (input: { command: string; workdir: string; justification: string; prefixRule?: string },
        ctx: { runId: string; threadId: string; turnId: string }) => Promise<{ allow: string; requestIds: string[] } | { park: LoopPark }>;
      escalationRecheck?: (input: { workdir: string; scopeDigest: string; requestIds: string[] },
        ctx: { runId: string; threadId: string; turnId: string }) => void;
      runner?: BashRunner;
      platform?: string;
    },
  ) {}

  /** SBPL matches real paths — a root reached through /tmp or /var must be canonicalized or the profile silently misses it. */
  private roots(ctx?: { runId: string; threadId: string; turnId: string }): string[] {
    return this.opts.writableRoots(ctx).map((root) => canonical(root));
  }

  /**
   * SBPL profile: deny-everything baseline; writes confined to the roots;
   * reads broad minus a sensitive-path denylist. An allowlist for reads
   * turns out unusable — process startup reads paths that cannot be
   * enumerated (dyld/cryptex internals), so the denylist is the honest
   * middle ground: /Users and the runtime/OS credential stores are denied,
   * then the session roots are re-allowed after them (last match wins).
   */
  profile(network: boolean, ctx?: { runId: string; threadId: string; turnId: string }): string {
    const roots = this.roots(ctx);
    const readable = [...roots, ...(this.opts.readableRoots?.(ctx) ?? []).map(canonical)];
    const dev = ["/dev/null", "/dev/zero", "/dev/random", "/dev/urandom"];
    const deny = ["/Users", "/private/tmp", "/private/var/folders", "/Volumes",
      ...(this.opts.extraDenyRead?.() ?? []).map(canonical)];
    const lines = [
      "(version 1)",
      "(deny default)",
      "(allow process-exec process-fork signal sysctl-read)",
      "(allow mach-lookup)",
      "(allow file-read-metadata)",
      "(allow file-read-data)",
      `(deny file-read-data ${deny.map((root) => `(subpath ${sbplLiteral(root)})`).join(" ")})`,
      `(allow file-read-data ${readable.map((root) => `(subpath ${sbplLiteral(root)})`).join(" ")})`,
      `(allow file-write* ${roots.map((root) => `(subpath ${sbplLiteral(root)})`).join(" ")}`,
      `  ${dev.map((devPath) => `(literal ${sbplLiteral(devPath)})`).join(" ")})`,
      network ? "(allow network-outbound)" : "(deny network-inbound network-outbound network-bind)",
    ];
    return lines.join("\n");
  }

  private runner(): BashRunner {
    const platform = this.opts.platform ?? process.platform;
    if (platform !== "darwin" || (!this.opts.runner && !existsSync(SANDBOX_EXEC)))
      throw new AuxError("capability_unsupported", "bash needs the macOS seatbelt (sandbox-exec); it is unavailable here.");
    return this.opts.runner ?? defaultRunner;
  }

  /** The park path returns the suspension instead of a result — the loop parks on it like any gated tool. */
  async run(
    input: BashSeatbeltInput,
    ctx: { runId: string; threadId: string; turnId: string },
  ): Promise<BashSeatbeltResult | { park: LoopPark }> {
    const command = input.command?.trim() ?? "";
    if (!command || Buffer.byteLength(command, "utf8") > MAX_COMMAND_BYTES)
      throw new AuxError("invalid_params", `command must be 1 to ${MAX_COMMAND_BYTES} bytes.`);
    const roots = this.roots(ctx);
    const readable = [...roots, ...(this.opts.readableRoots?.(ctx) ?? []).map(canonical)];
    if (!roots.length) throw new AuxError("permission_denied", "bash has no writable session roots.");
    const cwd = input.workdir ? canonical(input.workdir) : roots[0]!;
    if (!readable.some((root) => cwd === root || cwd.startsWith(root + sep)))
      throw new AuxError("permission_denied", "bash workdir must stay inside reviewed session roots.");
    const timeoutMs = Math.min(Math.max(1_000, Math.floor(input.timeoutMs ?? 30_000)), MAX_TIMEOUT_MS);
    if (input.requireEscalated) {
      if (input.network) throw new AuxError("invalid_params", "Escalated commands cannot also request the separate network grant.");
      if (!this.opts.escalationGate) throw new AuxError("capability_unsupported", "Command escalation is unavailable.");
      const verdict = await this.opts.escalationGate({ command, workdir: cwd,
        justification: input.justification ?? "", ...(input.prefixRule ? { prefixRule: input.prefixRule } : {}) }, ctx);
      if ("park" in verdict) return verdict;
      const runner = this.runner();
      if (!this.opts.escalationRecheck)
        throw new AuxError("permission_denied", "Escalated command scope cannot be rechecked.");
      this.opts.escalationRecheck({ workdir: cwd, scopeDigest: verdict.allow,
        requestIds: verdict.requestIds }, ctx);
      const result = await runner("/bin/sh", ["-c", command], { cwd,
        env: { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", TMPDIR: this.opts.scratchDir,
          HOME: this.opts.scratchDir, LANG: "en_US.UTF-8" }, timeoutMs, signal: input.signal });
      return this.clip(result);
    }
    if (input.network) {
      if (!this.opts.networkGate)
        throw new AuxError("capability_unsupported", "bash network is off; use webfetch for HTTP access.");
      const verdict = await this.opts.networkGate(command, ctx);
      if (verdict === "deny")
        throw new AuxError("permission_denied", "bash network was denied; use webfetch for HTTP access.");
      if (verdict !== "allow") return verdict;
    }
    const run = this.runner();
    const args = ["-p", this.profile(input.network === true, ctx), "/bin/sh", "-c", command];
    const env = {
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      TMPDIR: this.opts.scratchDir,
      HOME: this.opts.scratchDir,
      LANG: "en_US.UTF-8",
    };
    const result = await run(SANDBOX_EXEC, args, { cwd, env, timeoutMs, signal: input.signal });
    return this.clip(result);
  }

  private clip(result: { stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }): BashSeatbeltResult {
    const clip = (text: string) => {
      const bytes = Buffer.byteLength(text, "utf8");
      return bytes > OUTPUT_CAP_BYTES
        ? { text: Buffer.from(text, "utf8").subarray(0, OUTPUT_CAP_BYTES).toString("utf8"), truncated: true }
        : { text, truncated: false };
    };
    const out = clip(result.stdout);
    const err = clip(result.stderr);
    return {
      stdout: out.text,
      stderr: err.text,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      truncated: out.truncated || err.truncated,
    };
  }
}
