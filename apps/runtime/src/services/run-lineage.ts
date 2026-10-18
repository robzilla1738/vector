import { withSecureDelete } from "../store/db.js";
import { AuxError, SubagentGroupSchema, SubagentSchema } from "@aux/contracts";
import { assertSetMemberSource } from "./set-member-lineage.js";
import type { Repo } from "../store/repo.js";

const MAX_LINEAGE = 32;
const MAX_DESCENDANTS = 4096;
const ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);
const EDGE_SELECT = `SELECT a.agent_id,a.group_id,a.run_id,a.reserved_run_id,a.body,a.state,
  g.parent_run_id,g.body AS group_body,g.state AS group_state
  FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id`;
type EdgeRow = {
  agent_id: string;
  group_id: string;
  run_id: string | null;
  reserved_run_id: string;
  body: string;
  state: string;
  parent_run_id: string;
  group_body: string;
  group_state: string;
};

function edge(repo: Repo, row: EdgeRow) {
  const agent = SubagentSchema.parse(
    JSON.parse(repo.revealRecordField("subagents", [row.agent_id], "body", row.body)),
  );
  const group = SubagentGroupSchema.parse(JSON.parse(row.group_body));
  if (
    agent.agentId !== row.agent_id ||
    agent.groupId !== row.group_id ||
    group.groupId !== row.group_id ||
    group.parentRunId !== row.parent_run_id ||
    !agent.runId ||
    agent.runId !== row.reserved_run_id ||
    (row.run_id !== null && row.run_id !== row.reserved_run_id)
  )
    throw new AuxError("permission_denied", "Run lineage provenance changed.");
  return {
    runId: row.reserved_run_id,
    parentRunId: group.parentRunId,
    active: row.group_state === "active" && ["starting", "running"].includes(row.state),
  };
}

/** Indexed trusted reservation lookup includes children before their run row exists. */
export function runAncestry(repo: Repo, runId: string, requireActive = false): string[] {
  const visited = new Set<string>();
  let current = runId;
  for (let depth = 0; depth < MAX_LINEAGE; depth++) {
    if (visited.has(current)) throw new AuxError("permission_denied", "Run lineage contains a cycle.");
    visited.add(current);
    const rows = repo.db
      .prepare(`${EDGE_SELECT} WHERE a.run_id=? OR a.reserved_run_id=? LIMIT 2`)
      .all(current, current) as EdgeRow[];
    const setParent = assertSetMemberSource(repo, current, requireActive);
    if (rows.length + (setParent ? 1 : 0) > 1)
      throw new AuxError("permission_denied", "Run lineage is ambiguous.");
    if (setParent) {
      if (requireActive && !ACTIVE.has(repo.getRun(setParent)?.status ?? "missing"))
        throw new AuxError("permission_denied", "The parent Set run is no longer active.");
      current = setParent;
      continue;
    }
    if (!rows.length) return [...visited];
    const parent = edge(repo, rows[0]!);
    if (
      requireActive &&
      (!parent.active || !ACTIVE.has(repo.getRun(parent.parentRunId)?.status ?? "missing"))
    )
      throw new AuxError("permission_denied", "The parent run or subagent group is no longer active.");
    current = parent.parentRunId;
  }
  throw new AuxError("permission_denied", "Run lineage exceeds its depth limit.");
}

/** Original child-to-root chain from the existing authenticated reservation records. */
export function runRoot(repo: Repo, runId: string, requireActive = false): string {
  return runAncestry(repo, runId, requireActive).at(-1)!;
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
      const rows = repo.db
        .prepare(`${EDGE_SELECT} WHERE g.parent_run_id=? LIMIT ?`)
        .all(parentRunId, remaining + 1) as EdgeRow[];
      if (rows.length > remaining)
        throw new AuxError("permission_denied", "Run descendants exceed their bounded authority limit.");
      const setRows = repo.db
        .prepare("SELECT child_run_id FROM set_run_members WHERE parent_run_id=? LIMIT ?")
        .all(parentRunId, remaining + 1) as { child_run_id: string }[];
      if (rows.length + setRows.length > remaining)
        throw new AuxError("permission_denied", "Run descendants exceed their bounded authority limit.");
      for (const row of setRows) {
        if (
          assertSetMemberSource(repo, row.child_run_id, false) !== parentRunId ||
          result.has(row.child_run_id)
        )
          throw new AuxError("permission_denied", "Run lineage contains ambiguous membership.");
        runRoot(repo, row.child_run_id);
        result.add(row.child_run_id);
        next.push(row.child_run_id);
      }
      for (const row of rows) {
        const child = edge(repo, row);
        if (result.has(child.runId))
          throw new AuxError("permission_denied", "Run lineage contains a cycle or ambiguous membership.");
        result.add(child.runId);
        next.push(child.runId);
      }
    }
    if (!next.length) return [...result];
    frontier = next;
  }
  throw new AuxError("permission_denied", "Run descendants exceed their depth limit.");
}

/** Whole authenticated effect family: child outputs can be echoed by their original parent. */
export function protectedRunFamily(repo: Repo, seeds: ReadonlySet<string>): Set<string> {
  const roots = new Set<string>();
  for (const id of seeds) {
    const root = runRoot(repo, id);
    if (!repo.getRun(root))
      throw new AuxError("permission_denied", "The original protected run family is unavailable.");
    roots.add(root);
  }
  const result = new Set<string>();
  for (const root of roots)
    for (const id of lineageRuns(repo, root)) {
      result.add(id);
      if (result.size > MAX_DESCENDANTS)
        throw new AuxError(
          "permission_denied",
          "Protected run families exceed their bounded authority limit.",
        );
    }
  return result;
}

/** Only authenticated generated-child tasks can contain model-authored goals/follow-ups. */
export function retireProtectedGeneratedTask(
  repo: Repo,
  runId: string,
  source: "article" | "desktop" = "article",
): boolean {
  if (runAncestry(repo, runId).length < 2) return false;
  return withSecureDelete(repo.db, () => {
    const run = repo.getRun(runId);
    if (!run) throw new AuxError("permission_denied", "The generated task is unavailable.");
    const goal =
      source === "desktop" ? "Desktop-source-derived task retired" : "Saved-article-derived task retired";
    let changed = run.goal !== goal;
    if (
      source === "desktop" &&
      repo.db.prepare("SELECT 1 FROM run_transcript WHERE run_id=? LIMIT 1").get(runId)
    ) {
      // Model-to-child instructions/fork copies are not new human parent follow-ups.
      repo.db.prepare("DELETE FROM run_transcript WHERE run_id=?").run(runId);
      changed = true;
    }
    if (run.goal !== goal) {
      // Run goals are intentionally immutable in saveRun; retirement is the exact exception.
      repo.db
        .prepare("UPDATE runs SET goal=? WHERE run_id=?")
        .run(repo.protectRecordField("runs", [runId], "goal", goal), runId);
      const chatId = run.config?.chatId ?? runId;
      const conversation = repo.getConversation(chatId);
      if (conversation?.title === run.goal.slice(0, 160))
        repo.db
          .prepare("UPDATE conversations SET title=? WHERE chat_id=?")
          .run(repo.protectRecordField("conversations", [chatId], "title", goal), chatId);
    }
    const rows = repo.db
      .prepare(`${EDGE_SELECT} WHERE a.run_id=? OR a.reserved_run_id=? LIMIT 2`)
      .all(runId, runId) as EdgeRow[];
    for (const row of rows) {
      edge(repo, row);
      const agent = SubagentSchema.parse(
        JSON.parse(repo.revealRecordField("subagents", [row.agent_id], "body", row.body)),
      );
      if (agent.goal !== goal) {
        repo.db
          .prepare("UPDATE subagents SET body=? WHERE agent_id=?")
          .run(
            repo.protectRecordField("subagents", [row.agent_id], "body", JSON.stringify({ ...agent, goal })),
            row.agent_id,
          );
        changed = true;
      }
      // These are internal model-to-child instructions, not the human root request.
      const messages = repo.db
        .prepare("SELECT message_id FROM run_messages WHERE target_run_id=? AND chat_id=?")
        .all(runId, row.agent_id) as { message_id: string }[];
      for (const { message_id: id } of messages) {
        const message = repo.getRunMessage(id)!;
        if (message.text !== goal || message.status !== "cancelled") changed = true;
        repo.db
          .prepare(
            "UPDATE run_messages SET text=?,status='cancelled',context_page_refs=?,mentions=?,error=NULL WHERE message_id=?",
          )
          .run(
            repo.protectRecordField("run_messages", [id], "text", goal),
            repo.protectRecordField("run_messages", [id], "context_page_refs", "[]"),
            repo.protectRecordField("run_messages", [id], "mentions", "[]"),
            id,
          );
        // Keep the exact local-send identity/state/digest receipt while removing its derived body.
        repo.db
          .prepare("UPDATE safety_send_journal SET text=? WHERE nonce=? AND thread_id=? AND turn_id=?")
          .run(repo.protectRecordField("safety_send_journal", [id], "text", goal), id, row.agent_id, runId);
      }
    }
    return changed;
  });
}
