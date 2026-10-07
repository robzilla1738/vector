import { existsSync, statSync } from "node:fs";
import {
  filesystemSeatbelt,
  requireFilesystemPath,
  type FilesystemPolicy,
} from "../../services/filesystem-policy.js";
import { execFile } from "node:child_process";
import { AuxError } from "@aux/contracts";
import type { LoopPark } from "./types.js";

/** Every command remains under the current filesystem sandbox, including Auto and Full. */

export interface BashSeatbeltInput {
  command: string;
  timeoutMs?: number;
  workdir?: string;
  network?: boolean;
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
          stderr:
            stderr ??
            (timedOut ? "" : err && typeof err.code === "string" ? `${err.code}: ${err.message}` : ""),
          exitCode: timedOut ? null : typeof err?.code === "number" ? err.code : err ? null : 0,
          timedOut,
        });
      },
    );
  });

export class BashSeatbelt {
  constructor(
    private readonly opts: {
      filesystemPolicy: (ctx?: { runId: string; threadId: string; turnId: string }) => FilesystemPolicy;
      scratchDir: string;
      directoriesForRun?: (ctx: { runId: string; threadId: string; turnId: string }) => {
        scratchDir: string;
        workdir: string;
      };
      networkDefault?: (ctx?: { runId: string; threadId: string; turnId: string }) => boolean;
      networkGate?: BashGate;
      runner?: BashRunner;
      platform?: string;
    },
  ) {}

  profile(network: boolean, ctx?: { runId: string; threadId: string; turnId: string }): string {
    return filesystemSeatbelt(this.opts.filesystemPolicy(ctx), network);
  }

  private runner(): BashRunner {
    const platform = this.opts.platform ?? process.platform;
    if (platform !== "darwin" || (!this.opts.runner && !existsSync(SANDBOX_EXEC)))
      throw new AuxError(
        "capability_unsupported",
        "bash needs the macOS seatbelt (sandbox-exec); it is unavailable here.",
      );
    return this.opts.runner ?? defaultRunner;
  }

  /** The park path returns the suspension instead of a result — the loop parks on it like any gated tool. */
  async run(
    input: BashSeatbeltInput,
    ctx: { runId: string; threadId: string; turnId: string },
  ): Promise<BashSeatbeltResult | { park: LoopPark }> {
    const prepared = await this.prepare(input, ctx);
    if ("park" in prepared) return prepared;
    const result = await this.runner()(prepared.file, prepared.args, {
      ...prepared.options,
      signal: input.signal,
    });
    return this.clip(result);
  }

  async prepare(
    input: BashSeatbeltInput,
    ctx: { runId: string; threadId: string; turnId: string },
    admission?: "command_authorized" | "background_authorized",
  ) {
    const command = input.command?.trim() ?? "";
    if (!command || Buffer.byteLength(command, "utf8") > MAX_COMMAND_BYTES)
      throw new AuxError("invalid_params", `command must be 1 to ${MAX_COMMAND_BYTES} bytes.`);
    const policy = this.opts.filesystemPolicy(ctx);
    const directories = this.opts.directoriesForRun?.(ctx) ?? {
      scratchDir: this.opts.scratchDir,
      workdir: this.opts.scratchDir,
    };
    const scratchDir = requireFilesystemPath(policy, directories.scratchDir, "read");
    const cwd = requireFilesystemPath(policy, input.workdir ?? directories.workdir, "read");
    if (!statSync(cwd).isDirectory())
      throw new AuxError("permission_denied", "Bash workdir must be a granted directory.");
    const timeoutMs = Math.min(Math.max(1_000, Math.floor(input.timeoutMs ?? 30_000)), MAX_TIMEOUT_MS);
    const defaultNetwork = this.opts.networkDefault?.(ctx) ?? false;
    const network = input.network ?? defaultNetwork;
    if (network && !defaultNetwork && admission === undefined) {
      if (!this.opts.networkGate)
        throw new AuxError("capability_unsupported", "Network permission is unavailable.");
      const verdict = await this.opts.networkGate(command, ctx);
      if (verdict === "deny") throw new AuxError("permission_denied", "Bash network was denied.");
      if (verdict !== "allow") return verdict;
    }
    if (
      JSON.stringify(this.opts.filesystemPolicy(ctx)) !== JSON.stringify(policy) ||
      (defaultNetwork && !this.opts.networkDefault?.(ctx))
    )
      throw new AuxError("ref_stale", "Permissions changed before command dispatch.");
    this.runner();
    const sandbox =
      filesystemSeatbelt(policy, network) +
      (admission === "background_authorized"
        ? '\n(allow network-inbound network-bind (local ip "localhost:*"))'
        : "");
    const args = ["-p", sandbox, "/bin/sh", "-c", command];
    const env = {
      PATH: `${cwd}/node_modules/.bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
      TMPDIR: scratchDir,
      HOME: scratchDir,
      LANG: "en_US.UTF-8",
    };
    const check = () => {
      input.signal?.throwIfAborted();
      if (
        JSON.stringify(this.opts.filesystemPolicy(ctx)) !== JSON.stringify(policy) ||
        (defaultNetwork && !this.opts.networkDefault?.(ctx))
      )
        throw new AuxError("ref_stale", "Permissions changed before command dispatch.");
    };
    return { file: SANDBOX_EXEC, args, options: { cwd, env, timeoutMs }, policy, check };
  }

  private clip(result: {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
  }): BashSeatbeltResult {
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
