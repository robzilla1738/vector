import { AuxError, SubagentGroupSchema, SubagentSchema } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const MAX_LINEAGE = 32;
const MAX_DESCENDANTS = 4096;
const ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

function edges(repo: Repo) {
  const rows = repo.db.prepare(`SELECT a.agent_id,a.group_id,a.run_id,a.body,a.state,g.parent_run_id,g.body AS group_body,g.state AS group_state
    FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id LIMIT ?`).all(MAX_DESCENDANTS + 1) as {
      agent_id: string; group_id: string; run_id: string | null; body: string; state: string;
      parent_run_id: string; group_body: string; group_state: string;
    }[];
  if (rows.length > MAX_DESCENDANTS) throw new AuxError("permission_denied", "Run lineage exceeds its bounded authority limit.");
  return rows.map(row => {
    const agent = SubagentSchema.parse(JSON.parse(repo.revealRecordField("subagents", [row.agent_id], "body", row.body)));
    const group = SubagentGroupSchema.parse(JSON.parse(repo.revealRecordField("subagent_groups", [row.group_id], "body", row.group_body)));
    if (agent.agentId !== row.agent_id || agent.groupId !== row.group_id || group.groupId !== row.group_id || group.parentRunId !== row.parent_run_id
      || (row.run_id && agent.runId && row.run_id !== agent.runId)) throw new AuxError("permission_denied", "Run lineage provenance changed.");
    return { runId: row.run_id ?? agent.runId, parentRunId: group.parentRunId, active: row.group_state === "active" && ["starting", "running"].includes(row.state) && Date.now() < group.deadlineAt };
  });
}

/** Trusted encrypted reservation plus durable parent/group membership, never a child queue identity. */
export function runRoot(repo: Repo, runId: string, requireActive = false): string {
  const membership = edges(repo), visited = new Set<string>();
  let current = runId;
  for (let depth = 0; depth < MAX_LINEAGE; depth++) {
    if (visited.has(current)) throw new AuxError("permission_denied", "Run lineage contains a cycle.");
    visited.add(current);
    const parents = membership.filter(edge => edge.runId === current);
    if (parents.length > 1) throw new AuxError("permission_denied", "Run lineage is ambiguous.");
    if (!parents.length) return current;
    const edge = parents[0]!;
    if (requireActive && (!edge.active || !ACTIVE.has(repo.getRun(edge.parentRunId)?.status ?? "missing")))
      throw new AuxError("permission_denied", "The parent run or subagent group is no longer active.");
    current = edge.parentRunId;
  }
  throw new AuxError("permission_denied", "Run lineage exceeds its depth limit.");
}

export function overnightRoot(repo: Repo, runId: string): string | undefined {
  const root = runRoot(repo, runId, true);
  return repo.getRun(root)?.config?.nightShiftItemId ? root : undefined;
}

/** Historical membership remains charged after child/group completion. */
export function lineageRuns(repo: Repo, runId: string): string[] {
  const membership = edges(repo), result = new Set([runId]);
  for (let depth = 0; depth < MAX_LINEAGE; depth++) {
    const next = membership.filter(edge => edge.runId && result.has(edge.parentRunId) && !result.has(edge.runId));
    if (!next.length) {
      for (const id of result) runRoot(repo, id);
      return [...result];
    }
    for (const edge of next) result.add(edge.runId!);
  }
  throw new AuxError("permission_denied", "Run descendants exceed their depth limit.");
}
