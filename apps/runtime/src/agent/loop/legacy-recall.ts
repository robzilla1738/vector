import { originalTask } from "./original-task-message.js";
import { assertLegacyMemoryContext } from "../../services/legacy-memory-retirement.js";
import { AuxError } from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import type { TranscriptStore } from "./transcript.js";
import type { ModelMessage } from "./types.js";

const legacyHeading = "Auto-recalled memory (verify against the live page before citing):";
type Entry = { seq: number; message: ModelMessage };
type Branch = { sourceRunId: string; sourceRunIds: string[] };

function candidate(message: ModelMessage): boolean {
  return (
    message.role === "user" &&
    typeof message.content === "string" &&
    message.content.startsWith(legacyHeading)
  );
}

function same(left: ModelMessage | undefined, right: ModelMessage | undefined): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function resetRequired(): never {
  throw new AuxError(
    "conflict",
    "This older chat contains recalled context whose origin can no longer be verified. Use New Chat and enter your request again. Its history and Undo records are preserved; inspect the original action records before repeating any work.",
    { contextResetRequired: true },
  );
}

/**
 * Retire only provably runtime-generated legacy recall from model/fork inputs.
 * load()/entries() and durable human, tool, park and effect records stay untouched.
 * Unknown provenance refuses continuation rather than silently dropping authored text.
 */
export function projectLegacyRecall(
  repo: Repo,
  transcript: TranscriptStore,
  runId: string,
  messages = transcript.load(runId),
): ModelMessage[] {
  assertLegacyMemoryContext(repo, transcript, runId, messages);
  if (!messages.some(candidate)) return messages;
  const proofs = new Map<string, Set<number>>();
  const visiting = new Set<string>();

  const prove = (id: string): Set<number> => {
    const cached = proofs.get(id);
    if (cached) return cached;
    if (visiting.has(id)) return resetRequired();
    visiting.add(id);
    const entries = transcript.entries(id);
    const excluded = new Set<number>();
    const candidates = entries.filter((entry) => candidate(entry.message));
    if (!candidates.length) {
      visiting.delete(id);
      proofs.set(id, excluded);
      return excluded;
    }
    const run = repo.getRun(id);
    const draftChatId = id.startsWith("conversation-branch:")
      ? id.slice("conversation-branch:".length)
      : undefined;
    const branch = repo.getSetting<Branch>(`conversationBranch:${draftChatId ?? run?.config?.chatId ?? ""}`);
    const child = repo.db
      .prepare("SELECT agent_id AS agentId,body FROM subagents WHERE run_id=? OR reserved_run_id=? LIMIT 1")
      .get(id, id) as { agentId: string; body: string } | undefined;

    if (
      run?.config?.implementation === "agent-loop" &&
      !run.config.branchSourceRunIds?.length &&
      !run.config.subagentProfile &&
      !child &&
      !branch
    ) {
      const first = entries[0],
        recalled = entries[1];
      if (
        first?.seq === 0 &&
        recalled?.seq === 1 &&
        same(first.message, originalTask(run)) &&
        recalled.message.role === "user" &&
        typeof recalled.message.content === "string" &&
        recalled.message.content.startsWith(`${legacyHeading}\n- `) &&
        recalled.message.content.includes(" — ") &&
        recalled.message.content.includes("\n  ")
      )
        excluded.add(recalled.seq);
    }

    const inherit = (sourceId: string, copied: Entry[], offset: number): void => {
      const sourceProof = prove(sourceId);
      for (const [index, entry] of copied.entries()) {
        if (!same(entries[offset + index]?.message, entry.message)) return resetRequired();
        if (sourceProof.has(entry.seq)) excluded.add(entries[offset + index]!.seq);
      }
    };

    if ((draftChatId || run?.config?.branchSourceRunIds?.length) && branch) {
      if (
        !Array.isArray(branch.sourceRunIds) ||
        !branch.sourceRunIds.every((id) => typeof id === "string") ||
        typeof branch.sourceRunId !== "string"
      )
        return resetRequired();
      const lineage = [...new Set([...branch.sourceRunIds, branch.sourceRunId])];
      if (run && JSON.stringify(run.config?.branchSourceRunIds) !== JSON.stringify(lineage))
        return resetRequired();
      let offset = 0;
      for (const sourceId of branch.sourceRunIds) {
        const copied = transcript.forkEntries(sourceId);
        inherit(sourceId, copied, offset);
        offset += copied.length;
      }
      if (
        draftChatId ? entries.length !== offset : !run || !same(entries[offset]?.message, originalTask(run))
      )
        return resetRequired();
    } else if (child && run) {
      const source = JSON.parse(repo.revealRecordField("subagents", [child.agentId], "body", child.body)) as {
        sourceRunId?: string;
      };
      if (typeof source.sourceRunId !== "string") return resetRequired();
      const original = transcript.forkEntries(source.sourceRunId);
      let common = 0;
      while (common < original.length && same(entries[common]?.message, original[common]!.message)) common++;
      // The parent may have continued since the fork. Its copied prefix must end
      // at the child's exact own task, before any child-produced message.
      const boundary = entries.findIndex(
        (entry, index) => index > 0 && index <= common && same(entry.message, originalTask(run)),
      );
      if (boundary < 0) return resetRequired();
      inherit(source.sourceRunId, original.slice(0, boundary), 0);
    }

    if (candidates.some((entry) => !excluded.has(entry.seq))) return resetRequired();
    visiting.delete(id);
    proofs.set(id, excluded);
    return excluded;
  };

  const excluded = prove(runId);
  const entries = transcript.entries(runId);
  return messages.filter((message, index) => {
    if (!candidate(message)) return true;
    const entry = entries[index];
    if (!entry || !same(entry.message, message) || !excluded.has(entry.seq)) return resetRequired();
    return false;
  });
}
