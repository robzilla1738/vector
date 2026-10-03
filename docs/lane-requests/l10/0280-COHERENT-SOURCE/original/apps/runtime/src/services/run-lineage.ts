import { AuxError, SubagentGroupSchema, SubagentSchema } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const MAX_LINEAGE = 32;
const MAX_DESCENDANTS = 4096;
const ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);
const EDGE_SELECT = `SELECT a.agent_id,a.group_id,a.run_id,a.reserved_run_id,a.body,a.state,
  g.parent_run_id,g.body AS group_body,g.state AS group_state
  FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id`;
type EdgeRow = { agent_id: string; group_id: string; run_id: string | null; reserved_run_id: string;
  body: string; state: string; parent_run_id: string; group_body: string; group_state: string };

function edge(repo: Repo, row: EdgeRow) {
  const agent = SubagentSchema.parse(JSON.parse(repo.revealRecordField("subagents", [row.agent_id], "body", row.body)));
  const group = SubagentGroupSchema.parse(JSON.parse(repo.revealRecordField("subagent_groups", [row.group_id], "body", row.group_body)));
  if (agent.agentId !== row.agent_id || agent.groupId !== row.group_id || group.groupId !== row.group_id
    || group.parentRunId !== row.parent_run_id || !agent.runId || agent.runId !== row.reserved_run_id
    || (row.run_id !== null && row.run_id !== row.reserved_run_id))
    throw new AuxError("permission_denied", "Run lineage provenance changed.");
  return { runId: row.reserved_run_id, parentRunId: group.parentRunId,
    active: row.group_state === "active" && ["starting", "running"].includes(row.state) && Date.now() < group.deadlineAt };
}

/** Indexed trusted reservation lookup includes children before their run row exists. */
export function runRoot(repo: Repo, runId: string, requireActive = false): string {
  const visited = new Set<string>();
  let current = runId;
  for (let depth = 0; depth < MAX_LINEAGE; depth++) {
    if (visited.has(current)) throw new AuxError("permission_denied", "Run lineage contains a cycle.");
    visited.add(current);
    const rows = repo.db.prepare(`${EDGE_SELECT} WHERE a.run_id=? OR a.reserved_run_id=? LIMIT 2`).all(current, current) as EdgeRow[];
    if (rows.length > 1) throw new AuxError("permission_denied", "Run lineage is ambiguous.");
    if (!rows.length) return current;
    const parent = edge(repo, rows[0]!);
    if (requireActive && (!parent.active || !ACTIVE.has(repo.getRun(parent.parentRunId)?.status ?? "missing")))
      throw new AuxError("permission_denied", "The parent run or subagent group is no longer active.");
    current = parent.parentRunId;
  }
  throw new AuxError("permission_denied", "Run lineage exceeds its depth limit.");
}

export function overnightRoot(repo: Repo, runId: string): string | undefined {
  const root = runRoot(repo, runId, true);
  return repo.getRun(root)?.config?.nightShiftItemId ? root : undefined;
}

/** Scoped historical membership remains charged after child/group completion. */
export function lineageRuns(repo: Repo, runId: string): string[] {
  runRoot(repo, runId);
  const result = new Set([runId]);
  let frontier = [runId];
  for (let depth = 0; depth < MAX_LINEAGE; depth++) {
    const next: string[] = [];
    for (const parentRunId of frontier) {
      const remaining = MAX_DESCENDANTS - result.size;
      const rows = repo.db.prepare(`${EDGE_SELECT} WHERE g.parent_run_id=? LIMIT ?`).all(parentRunId, remaining + 1) as EdgeRow[];
      if (rows.length > remaining) throw new AuxError("permission_denied", "Run descendants exceed their bounded authority limit.");
      for (const row of rows) {
        const child = edge(repo, row);
        if (result.has(child.runId)) throw new AuxError("permission_denied", "Run lineage contains a cycle or ambiguous membership.");
        result.add(child.runId); next.push(child.runId);
      }
    }
    if (!next.length) return [...result];
    frontier = next;
  }
  throw new AuxError("permission_denied", "Run descendants exceed their depth limit.");
}
