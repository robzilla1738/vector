import { randomUUID } from "node:crypto";
import { AuxError, CommandEscalationRequestSchema, type CommandEscalationRequest } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { LoopPark } from "../agent/loop/types.js";

/** The escalated shell subset is deliberately literal: no expansion, redirection, substitution or nested shell. */
export function commandSegments(command: string): string[] {
  if (
    !command.trim() ||
    /[$`\\<>{}()*?~#\u0000-\u001F\u007F]/.test(command) ||
    command.includes("[") ||
    command.includes("]")
  )
    throw new AuxError(
      "invalid_params",
      "Escalated commands must be literal; expansion, substitution, redirection and multiline shell are unavailable.",
    );
  const segments: string[] = [];
  let quote: "'" | '"' | undefined;
  let start = 0;
  for (let index = 0; index < command.length; index++) {
    const char = command[index]!;
    if (quote) {
      if (char === quote) quote = undefined;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    const operator = command.slice(index).match(/^(?:&&|\|\||;|\|)/)?.[0];
    if (char === "&" && operator !== "&&")
      throw new AuxError("invalid_params", "Background shell jobs are unavailable for escalation.");
    if (!operator) continue;
    const segment = command.slice(start, index).trim();
    if (!segment) throw new AuxError("invalid_params", "Every escalated command segment must be nonempty.");
    if (/^(?:(?:env|sudo|command|exec)\s+)*(?:sh|bash|zsh|dash|ksh|fish|eval)(?:\s|$)/.test(segment))
      throw new AuxError("invalid_params", "Nested shell commands are unavailable for escalation.");
    segments.push(segment);
    index += operator.length - 1;
    start = index + 1;
  }
  if (quote) throw new AuxError("invalid_params", "Escalated command has an unclosed quote.");
  const tail = command.slice(start).trim();
  if (!tail) throw new AuxError("invalid_params", "Every escalated command segment must be nonempty.");
  if (/^(?:(?:env|sudo|command|exec)\s+)*(?:sh|bash|zsh|dash|ksh|fish|eval)(?:\s|$)/.test(tail))
    throw new AuxError("invalid_params", "Nested shell commands are unavailable for escalation.");
  segments.push(tail);
  if (segments.length > 8)
    throw new AuxError("invalid_params", "Escalation supports at most eight command segments.");
  return segments;
}

const SAFE_PREFIX = /^(?:pwd|ls)$/;
function validatePrefix(rule: string, segment: string): string {
  const normalized = rule.trim().replace(/\s+/g, " ");
  if (!SAFE_PREFIX.test(normalized) || !(segment === normalized || segment.startsWith(`${normalized} `)))
    throw new AuxError(
      "invalid_params",
      "A reusable prefix must be pwd or ls and match this segment. Approve other commands once.",
    );
  return normalized;
}
function prefixMatches(rule: string, segment: string): boolean {
  if (segment === rule) return true;
  if (rule !== "ls") return false;
  if (!segment.startsWith(`${rule} `)) return false;
  // Reusable ls permits display flags only. -L, -R, paths, subprocesses and options with values need exact review.
  return /^-[a1lh]+(?: -[a1lh]+)*$/.test(segment.slice(rule.length + 1));
}

type Row = {
  request_id: string;
  body: string;
  state: CommandEscalationRequest["state"];
  decided_at: number | null;
};
type GrantRow = { request_id: string; body: string; mode: "once" | "prefix"; consumed_at: number | null };

/** Local-owner reviewed command exceptions. No model-facing decision method exists. */
export class CommandEscalationService {
  constructor(
    private readonly repo: Repo,
    private readonly reviewedScope?: (workspaceId: string, workdir: string) => string,
  ) {}

  assertScope(workspaceId: string, workdir: string, expectedDigest: string): void {
    if (!this.reviewedScope || this.reviewedScope(workspaceId, workdir) !== expectedDigest)
      throw new AuxError(
        "permission_denied",
        "Reviewed folder scope changed. Review the folder and command again.",
      );
  }

  assertDispatch(workspaceId: string, workdir: string, expectedDigest: string, requestIds: string[]): void {
    this.assertScope(workspaceId, workdir, expectedDigest);
    if (!requestIds.length || requestIds.length > 8)
      throw new AuxError("permission_denied", "Escalated command approval is missing.");
    for (const requestId of requestIds) {
      const row = this.repo.db
        .prepare("SELECT body FROM command_escalation_grants WHERE request_id=?")
        .get(requestId) as { body: string } | undefined;
      if (!row) throw new AuxError("permission_denied", "Command approval was revoked before dispatch.");
      const grant = JSON.parse(row.body) as { workspaceId: string; workdir: string; scopeDigest?: string };
      if (
        grant.workspaceId !== workspaceId ||
        grant.workdir !== workdir ||
        grant.scopeDigest !== expectedDigest
      )
        throw new AuxError("permission_denied", "Command approval scope changed before dispatch.");
    }
  }

  list(workspaceId: string): CommandEscalationRequest[] {
    const rows = this.repo.db
      .prepare(
        "SELECT * FROM command_escalation_requests WHERE json_extract(body,'$.workspaceId')=? ORDER BY json_extract(body,'$.createdAt') DESC LIMIT 100",
      )
      .all(workspaceId) as Row[];
    return rows.map((row) => this.fromRow(row));
  }

  decide(
    requestId: string,
    decision: "once" | "prefix" | "decline",
    amendment?: string,
  ): CommandEscalationRequest {
    const row = this.repo.db
      .prepare("SELECT * FROM command_escalation_requests WHERE request_id=?")
      .get(requestId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "Command request does not exist.");
    const request = this.fromRow(row);
    if (request.state !== "pending")
      throw new AuxError("conflict", "This command request was already decided.");
    if (decision !== "decline") {
      if (!request.scopeDigest)
        throw new AuxError("permission_denied", "Legacy command request needs fresh folder review.");
      this.assertScope(request.workspaceId, request.workdir, request.scopeDigest);
    }
    const prefixRule =
      decision === "prefix"
        ? validatePrefix(amendment ?? request.prefixRule ?? "", request.segment)
        : undefined;
    const now = Date.now();
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      const updated = this.repo.db
        .prepare(
          "UPDATE command_escalation_requests SET state=?,body=?,decided_at=? WHERE request_id=? AND state='pending'",
        )
        .run(
          decision === "decline" ? "declined" : "approved",
          JSON.stringify(prefixRule ? { ...request, prefixRule } : request),
          now,
          requestId,
        );
      if (updated.changes !== 1) throw new AuxError("conflict", "This command request changed. Refresh it.");
      if (decision !== "decline")
        this.repo.db
          .prepare("INSERT INTO command_escalation_grants(request_id,body,mode) VALUES(?,?,?)")
          .run(
            requestId,
            JSON.stringify({
              runId: request.runId,
              workspaceId: request.workspaceId,
              segment: request.segment,
              workdir: request.workdir,
              scopeDigest: request.scopeDigest,
              ...(prefixRule ? { prefixRule } : {}),
            }),
            decision,
          );
      this.repo.db.exec("COMMIT");
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
    const result = this.fromRow(
      this.repo.db
        .prepare("SELECT * FROM command_escalation_requests WHERE request_id=?")
        .get(requestId) as Row,
    );
    return prefixRule ? { ...result, prefixRule } : result;
  }

  revoke(requestId: string): CommandEscalationRequest {
    const row = this.repo.db
      .prepare("SELECT * FROM command_escalation_requests WHERE request_id=?")
      .get(requestId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "Command request does not exist.");
    this.repo.db.prepare("DELETE FROM command_escalation_grants WHERE request_id=?").run(requestId);
    return this.fromRow(row);
  }

  /** Gate every literal segment before an unsandboxed process starts. One-time grants are consumed together. */
  authorize(input: {
    runId: string;
    workspaceId: string;
    command: string;
    workdir: string;
    justification: string;
    prefixRule?: string;
  }): { allow: string; requestIds: string[] } | { park: LoopPark } {
    const segments = commandSegments(input.command);
    if (!this.reviewedScope)
      throw new AuxError("permission_denied", "Escalation needs a current reviewed folder.");
    const scopeDigest = this.reviewedScope(input.workspaceId, input.workdir);
    if (input.justification.trim().length < 8 || input.justification.length > 2_000)
      throw new AuxError(
        "invalid_params",
        "Explain why sandboxed execution cannot do this in 8–2,000 characters.",
      );
    const proposal = input.prefixRule ? validatePrefix(input.prefixRule, segments[0]!) : undefined;
    const grants = this.repo.db
      .prepare("SELECT * FROM command_escalation_grants WHERE consumed_at IS NULL")
      .all() as GrantRow[];
    const onceIds = new Set<string>();
    const requestIds: string[] = [];
    for (const segment of segments) {
      const matched = grants.find((row) => {
        const grant = JSON.parse(row.body) as {
          runId: string;
          workspaceId: string;
          segment: string;
          workdir: string;
          scopeDigest?: string;
          prefixRule?: string;
        };
        if (
          grant.workspaceId !== input.workspaceId ||
          grant.workdir !== input.workdir ||
          grant.scopeDigest !== scopeDigest
        )
          return false;
        if (row.mode === "once")
          return grant.runId === input.runId && grant.segment === segment && !onceIds.has(row.request_id);
        return !!grant.prefixRule && prefixMatches(grant.prefixRule, segment);
      });
      if (matched) {
        requestIds.push(matched.request_id);
        if (matched.mode === "once") onceIds.add(matched.request_id);
        continue;
      }
      const prior = this.repo.db
        .prepare(
          "SELECT * FROM command_escalation_requests WHERE json_extract(body,'$.runId')=? AND json_extract(body,'$.segment')=? AND json_extract(body,'$.workdir')=? AND json_extract(body,'$.scopeDigest')=? ORDER BY json_extract(body,'$.createdAt') DESC, rowid DESC LIMIT 1",
        )
        .get(input.runId, segment, input.workdir, scopeDigest) as Row | undefined;
      if (prior?.state === "declined")
        throw new AuxError(
          "permission_denied",
          "The owner declined this exact command segment. Do not retry it.",
        );
      let request = prior?.state === "pending" ? this.fromRow(prior) : undefined;
      if (!request) {
        request = CommandEscalationRequestSchema.parse({
          requestId: randomUUID(),
          runId: input.runId,
          workspaceId: input.workspaceId,
          segment,
          workdir: input.workdir,
          scopeDigest,
          justification: input.justification.trim(),
          ...(proposal && segment === segments[0] ? { prefixRule: proposal } : {}),
          state: "pending",
          createdAt: Date.now(),
        });
        this.repo.db
          .prepare("INSERT INTO command_escalation_requests(request_id,body,state) VALUES(?,?,'pending')")
          .run(request.requestId, JSON.stringify(request));
      }
      return {
        park: {
          kind: "ask-user-question",
          instruction: `Escalated command needs owner review in Settings → Workspaces. Segment: ${segment}. Reason: ${request.justification}. It would run outside the file/network sandbox from ${input.workdir}. Approve or decline request ${request.requestId}, then answer this run to continue. The command has not run.`,
        },
      };
    }
    this.assertScope(input.workspaceId, input.workdir, scopeDigest);
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      for (const requestId of onceIds) {
        const result = this.repo.db
          .prepare(
            "UPDATE command_escalation_grants SET consumed_at=? WHERE request_id=? AND consumed_at IS NULL",
          )
          .run(Date.now(), requestId);
        if (result.changes !== 1) throw new AuxError("conflict", "Command approval was already used.");
      }
      this.repo.db.exec("COMMIT");
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
    return { allow: scopeDigest, requestIds };
  }

  private fromRow(row: Row): CommandEscalationRequest {
    const body = JSON.parse(row.body) as object;
    const grant =
      row.state === "approved"
        ? (this.repo.db
            .prepare(
              "SELECT mode,consumed_at AS consumedAt FROM command_escalation_grants WHERE request_id=?",
            )
            .get(row.request_id) as { mode: "once" | "prefix"; consumedAt: number | null } | undefined)
        : undefined;
    return CommandEscalationRequestSchema.parse({
      ...body,
      state: row.state,
      ...(grant ? { mode: grant.mode, grantActive: grant.consumedAt === null } : {}),
      ...(row.decided_at ? { decidedAt: row.decided_at } : {}),
    });
  }
}
