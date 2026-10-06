import { createHash } from "node:crypto";
import { AuxError, type Run } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

export type SetMemberSource = NonNullable<NonNullable<Run["config"]>["setMemberSource"]>;
export function setMemberSourceDigest(source: Omit<SetMemberSource, "sourceDigest">): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        source.parentRunId,
        source.setId,
        source.memberId,
        source.url,
        source.memberUrl ?? null,
        source.pageId ?? null,
        source.sessionId ?? null,
        source.documentEpoch ?? null,
        source.recordKey ?? null,
      ]),
    )
    .digest("hex");
}
export function assertSetMemberSource(repo: Repo, runId: string, active: boolean): string | undefined {
  const row = repo.db.prepare("SELECT * FROM set_run_members WHERE child_run_id=?").get(runId) as
    | { parent_run_id: string; set_id: string; member_id: string; source_digest: string; state: string }
    | undefined;
  if (!row) return undefined;
  const child = repo.getRun(runId);
  const source = child?.config?.setMemberSource;
  if (
    !source ||
    source.parentRunId !== row.parent_run_id ||
    source.setId !== row.set_id ||
    source.memberId !== row.member_id ||
    source.sourceDigest !== row.source_digest ||
    setMemberSourceDigest(source) !== row.source_digest
  )
    throw new AuxError("permission_denied", "Set member lineage provenance changed.");
  if (active) {
    const member = repo.listMembers(row.set_id).find((member) => member.memberId === row.member_id);
    const set = repo.getSet(row.set_id);
    if (
      !["starting", "running"].includes(row.state) ||
      !set?.memberIds.includes(row.member_id) ||
      !member ||
      member.setId !== source.setId ||
      member.url !== source.memberUrl ||
      member.pageId !== source.pageId ||
      member.recordKey !== source.recordKey
    )
      throw new AuxError("permission_denied", "This Set member's approved source changed.");
  }
  return row.parent_run_id;
}
