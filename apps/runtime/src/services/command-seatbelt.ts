import { createHash, randomUUID } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { isAbsolute, relative } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import {
  AuxError, CommandEscalationDecisionSchema, CommandEscalationRequestSchema,
  CommandSeatbeltProfileSchema, type CommandEscalationDecision,
  type CommandEscalationRequest, type CommandSeatbeltProfile,
} from "@aux/contracts";

const BANNED_EXECUTABLES = new Set([
  "sudo", "doas", "su", "rm", "dd", "mkfs", "diskutil", "mount", "umount", "chown",
  "sh", "bash", "zsh", "fish", "env", "xargs", "find", "osascript", "open", "launchctl",
  "node", "python", "python3", "ruby", "perl", "php", "npx", "bunx", "deno",
  "curl", "wget", "ssh", "scp", "rsync", "nc", "netcat", "socat", "openssl",
]);
const BANNED_GENERIC_SUBCOMMANDS = new Set(["run", "exec", "dlx", "-c", "-e", "eval"]);
const SHELL_OPERATORS = /[;&|<>`$()\n\r\\]/;

export function commandDigest(command: string): string {
  return createHash("sha256").update(command).digest("hex");
}

function inside(root: string, path: string): boolean {
  const delta = relative(root, path);
  return delta === "" || delta !== ".." && !delta.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(delta);
}

function canonicalRoot(path: string): string {
  try { return realpathSync(path); }
  catch { throw new AuxError("permission_denied", "A command seatbelt root is unavailable."); }
}

/** A prefix grant is only valid for a literal, shell-operator-free command line. */
export function validPrefixRule(prefix: string): boolean {
  const trimmed = prefix.trim();
  if (!trimmed || SHELL_OPERATORS.test(trimmed) || /["']/.test(trimmed)) return false;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 2 || tokens[1]!.startsWith("-") || BANNED_GENERIC_SUBCOMMANDS.has(tokens[1]!.toLowerCase())) return false;
  const executable = tokens[0]!.split("/").at(-1)!.toLowerCase();
  return !BANNED_EXECUTABLES.has(executable) &&
    !/^(?:python(?:\d+(?:\.\d+)?)?|node(?:js)?|ruby(?:\d+)?|perl(?:\d+)?)$/.test(executable) &&
    /^[A-Za-z0-9_./:=+@%,\-\s]+$/.test(trimmed);
}

/** No network; writes are limited to this isolated checkout. */
export function defaultCommandSeatbelt(input: { sessionId: string; projectId: string; projectPath: string; expiresAt: number }): CommandSeatbeltProfile {
  const project = canonicalRoot(input.projectPath);
  return CommandSeatbeltProfileSchema.parse({ version: 1, sessionId: input.sessionId, projectId: input.projectId,
    readableRoots: [project, ...["/usr", "/bin", "/lib", "/System", "/Library"].filter(existsSync).map(canonicalRoot)],
    writableRoots: [project], network: false, allowProcessSpawn: true, expiresAt: input.expiresAt });
}

export function validateCommandSeatbelt(profile: CommandSeatbeltProfile, projectPath: string, now = Date.now()): CommandSeatbeltProfile {
  const parsed = CommandSeatbeltProfileSchema.parse(profile);
  const project = canonicalRoot(projectPath);
  if (parsed.expiresAt <= now || parsed.writableRoots.some(path => !inside(project, canonicalRoot(path))))
    throw new AuxError("permission_denied", "The command seatbelt is expired or writes outside the project checkout.");
  if (!parsed.readableRoots.some(path => inside(canonicalRoot(path), project)))
    throw new AuxError("permission_denied", "The command seatbelt cannot read its project checkout.");
  return parsed;
}

/** Native may narrow a requested profile; it cannot silently expand the human-reviewed authority. */
export function validateEffectiveSeatbelt(requested: CommandSeatbeltProfile, effective: CommandSeatbeltProfile,
  projectPath: string, now = Date.now()): CommandSeatbeltProfile {
  const permitted = validateCommandSeatbelt(requested, projectPath, now);
  const applied = validateCommandSeatbelt(effective, projectPath, now);
  if (applied.projectId !== permitted.projectId || applied.sessionId !== permitted.sessionId ||
    applied.expiresAt > permitted.expiresAt || applied.network && !permitted.network ||
    applied.allowProcessSpawn && !permitted.allowProcessSpawn)
    throw new AuxError("permission_denied", "The native command seatbelt exceeds the reviewed profile.");
  for (const [roots, allowed] of [[applied.readableRoots, permitted.readableRoots], [applied.writableRoots, permitted.writableRoots]] as const) {
    if (roots.some(root => !allowed.some(parent => inside(canonicalRoot(parent), canonicalRoot(root)))))
      throw new AuxError("permission_denied", "The native command seatbelt exceeds the reviewed roots.");
  }
  return applied;
}

type RequestRow = { body: string; state: string; decided_at: number | null };
type GrantRow = { request_id: string; body: string; mode: "once" | "prefix"; consumed_at: number | null };

/** Durable local decisions. The model can request escalation but cannot decide it. */
export class CommandEscalationStore {
  constructor(private readonly db: DatabaseSync) {}

  request(input: Omit<CommandEscalationRequest, "requestId" | "createdAt" | "expiresAt" | "commandSha256" | "commandPreview"> & { command: string }, now = Date.now()): CommandEscalationRequest {
    if (!input.command.trim() || input.command.length > 8000) throw new AuxError("invalid_params", "The command must be 1 to 8,000 characters.");
    if (input.prefixRule && !validPrefixRule(input.prefixRule)) throw new AuxError("invalid_params", "This prefix cannot be granted safely.");
    if (input.prefixRule && input.command !== input.prefixRule && !input.command.startsWith(`${input.prefixRule} `))
      throw new AuxError("invalid_params", "The proposed prefix must match the exact command under review.");
    if (input.requestedProfile.sessionId !== input.sessionId || input.requestedProfile.projectId !== input.projectId)
      throw new AuxError("invalid_params", "The requested command profile has a different session or project.");
    const { command, ...fields } = input;
    const body = CommandEscalationRequestSchema.parse({ ...fields, commandSha256: commandDigest(command),
      commandPreview: command, requestId: randomUUID(), createdAt: now, expiresAt: now + 10 * 60_000 });
    this.db.prepare("INSERT INTO command_escalation_requests(request_id,body,state) VALUES(?,?,'pending')")
      .run(body.requestId, JSON.stringify(body));
    return body;
  }

  pending(now = Date.now()): CommandEscalationRequest[] {
    const rows = this.db.prepare("SELECT body FROM command_escalation_requests WHERE state='pending' ORDER BY rowid")
      .all() as { body: string }[];
    return rows.map(row => CommandEscalationRequestSchema.parse(JSON.parse(row.body)))
      .filter(request => request.expiresAt > now);
  }

  decide(raw: CommandEscalationDecision, now = Date.now()): void {
    const decision = CommandEscalationDecisionSchema.parse(raw);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const row = this.db.prepare("SELECT body,state,decided_at FROM command_escalation_requests WHERE request_id=?")
        .get(decision.requestId) as RequestRow | undefined;
      if (!row || row.state !== "pending") throw new AuxError("conflict", "This command request is no longer pending.");
      const request = CommandEscalationRequestSchema.parse(JSON.parse(row.body));
      if (request.expiresAt <= now || request.commandSha256 !== decision.expectedCommandSha256)
        throw new AuxError("conflict", "The command changed or its review expired.");
      if (decision.decision === "approvePrefix" && (!request.prefixRule || !validPrefixRule(request.prefixRule)))
        throw new AuxError("permission_denied", "A safe prefix rule was not proposed.");
      this.db.prepare("UPDATE command_escalation_requests SET state=?,decided_at=? WHERE request_id=?")
        .run(decision.decision === "decline" ? "declined" : "approved", now, request.requestId);
      if (decision.decision !== "decline") this.db.prepare("INSERT INTO command_escalation_grants(request_id,body,mode) VALUES(?,?,?)")
        .run(request.requestId, row.body, decision.decision === "approveOnce" ? "once" : "prefix");
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  /** Re-evaluate right before native launch; one-time grants are consumed atomically. */
  authorizeGrant(input: { taskId: string; projectId: string; sessionId: string; command: string; projectPath: string }, now = Date.now(), consume = true):
    { profile: CommandSeatbeltProfile; requestId: string; mode: "once" | "prefix" } | undefined {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const rows = this.db.prepare("SELECT request_id,body,mode,consumed_at FROM command_escalation_grants ORDER BY rowid DESC")
        .all() as GrantRow[];
      for (const row of rows) {
        const request = CommandEscalationRequestSchema.parse(JSON.parse(row.body));
        if (request.taskId !== input.taskId || request.projectId !== input.projectId || request.sessionId !== input.sessionId
          || request.expiresAt <= now || row.mode === "once" && row.consumed_at !== null) continue;
        const matched = row.mode === "once" ? request.commandSha256 === commandDigest(input.command)
          : !!request.prefixRule && validPrefixRule(request.prefixRule) && validPrefixRule(input.command)
            && (input.command === request.prefixRule || input.command.startsWith(`${request.prefixRule} `));
        if (!matched) continue;
        const profile = validateCommandSeatbelt(request.requestedProfile, input.projectPath, now);
        if (row.mode === "once" && consume) this.db.prepare("UPDATE command_escalation_grants SET consumed_at=? WHERE request_id=? AND consumed_at IS NULL")
          .run(now, request.requestId);
        this.db.exec("COMMIT");
        return { profile, requestId: request.requestId, mode: row.mode };
      }
      this.db.exec("COMMIT");
      return undefined;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  authorize(input: { taskId: string; projectId: string; sessionId: string; command: string; projectPath: string }, now = Date.now(), consume = true): CommandSeatbeltProfile | undefined {
    return this.authorizeGrant(input, now, consume)?.profile;
  }

  revokeSession(sessionId: string): number {
    const rows = this.db.prepare("SELECT request_id,body FROM command_escalation_grants")
      .all() as { request_id: string; body: string }[];
    let count = 0;
    for (const row of rows) {
      if (CommandEscalationRequestSchema.parse(JSON.parse(row.body)).sessionId !== sessionId) continue;
      count += Number(this.db.prepare("DELETE FROM command_escalation_grants WHERE request_id=?").run(row.request_id).changes);
    }
    return count;
  }
}
