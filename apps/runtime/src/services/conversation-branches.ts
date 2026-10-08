import { withSecureDelete } from "../store/db.js";
import { randomUUID } from "node:crypto";
import { AuxError, type Run, type ConversationBranchMetadata } from "@aux/contracts";
import { z } from "zod";
import { TranscriptStore } from "../agent/loop/transcript.js";
import { projectLegacyRecall } from "../agent/loop/legacy-recall.js";
import type { Repo } from "../store/repo.js";

const metadataSchema = z.object({
  sourceRunId: z.string(),
  sourceRunIds: z.array(z.string()),
  mode: z.enum(["branch", "edit"]),
  windowId: z.string(),
  revoked: z.boolean().optional(),
});
export type ConversationBranch = z.infer<typeof metadataSchema>;
const transcriptKey = (chatId: string) => `conversation-branch:${chatId}`;

/** A draft snapshot is history, never a Run, page grant, parked call or effect receipt. */
export class ConversationBranches {
  constructor(private readonly repo: Repo) {}

  get(chatId: string): ConversationBranch | undefined {
    const value = this.repo.getSetting(`conversationBranch:${chatId}`);
    return value === undefined ? undefined : metadataSchema.parse(value);
  }

  source(metadata: ConversationBranch): Run {
    if (metadata.revoked)
      throw new AuxError("permission_denied", "A historical source was removed or forgotten.");
    const selected = this.repo.getRun(metadata.sourceRunId);
    if (!selected || selected.status !== "completed")
      throw new AuxError("ref_stale", "The selected completed turn is no longer available.");
    if (selected.setId || selected.config?.subagentProfile || selected.config?.setMemberSource)
      throw new AuxError("invalid_params", "Branch a completed conversation turn.");
    for (const runId of new Set([...metadata.sourceRunIds, metadata.sourceRunId])) {
      const run = this.repo.getRun(runId);
      if (!run || run.config?.contextMemoryRevoked)
        throw new AuxError("permission_denied", "A historical source was removed or forgotten.");
      if (
        (run.config?.chatId ?? run.runId) !== (selected.config?.chatId ?? selected.runId) ||
        !!run.config?.privateTask !== !!selected.config?.privateTask
      )
        throw new AuxError("permission_denied", "The historical conversation source changed.");
      if (
        ["queued", "planning", "running", "paused", "needs_input"].includes(run.status) ||
        this.repo.db
          .prepare(
            "SELECT 1 FROM action_intents WHERE run_id=? AND status IN ('pending','uncertain') LIMIT 1",
          )
          .get(runId) ||
        this.repo.db
          .prepare(
            "SELECT 1 FROM operation_invocations WHERE run_id=? AND (status IN ('running','interrupted') OR effect_outcome='unknown') LIMIT 1",
          )
          .get(runId)
      )
        throw new AuxError("conflict", "Reconcile the original turn before branching its history.");
    }
    return selected;
  }

  async create(runId: string, mode: "branch" | "edit", windowId: string, current: () => Promise<void>) {
    const selected = this.repo.getRun(runId);
    if (!selected) throw new AuxError("not_found", "The selected turn does not exist.");
    const history = this.repo.conversationRuns(selected.config?.chatId ?? selected.runId).reverse();
    const index = history.findIndex((run) => run.runId === runId);
    if (index < 0) throw new AuxError("ref_stale", "The selected turn is no longer in this conversation.");
    const retained = history.slice(0, mode === "edit" ? index : index + 1);
    const metadata: ConversationBranch = {
      sourceRunId: runId,
      sourceRunIds: retained.map((run) => run.runId),
      mode,
      windowId,
    };
    this.source(metadata);
    const transcript = new TranscriptStore(this.repo.db, this.repo.columnCipher);
    const prefix = retained.flatMap((run) => transcript.forkPrefix(run.runId, this.repo));
    await current();
    this.source(metadata);
    const chatId = randomUUID();
    this.repo.transaction(() => {
      this.repo.createConversationDraft(
        chatId,
        mode === "edit" ? "Edited conversation" : "Branched conversation",
        !!selected.config?.privateTask,
      );
      this.repo.setSetting(`conversationBranch:${chatId}`, metadata);
      if (selected.config?.contextWorkspaceId)
        this.repo.setSetting(`conversationWorkspace:${chatId}`, selected.config.contextWorkspaceId);
      transcript.append(transcriptKey(chatId), prefix);
    });
    const draft = this.info(chatId);
    if (!draft)
      throw new AuxError("operation_uncertain", "The branch draft was saved but its receipt is unavailable.");
    return draft;
  }

  info(chatId: string): ConversationBranchMetadata | undefined {
    const metadata = this.get(chatId);
    if (!metadata || this.repo.listRuns(1, { chatId }).length) return undefined;
    let selected: Run | undefined;
    try {
      selected = this.source(metadata);
    } catch {
      /* Retired history remains a real deletable draft. */
    }
    return {
      kind: "branch-draft",
      chatId,
      sourceRunId: metadata.sourceRunId,
      mode: metadata.mode,
      title: this.repo.getConversationTitle(chatId) ?? "Branched conversation",
      archived: false,
      available: !!selected,
      privateTask: this.repo.conversationPrivateTask(chatId) ?? false,
      draftText: selected && metadata.mode === "edit" ? selected.goal : "",
      contextPageRefs: selected?.config?.contextPageRefs ?? [],
      taskId: selected?.config?.taskId,
      taskRevision: selected?.config?.taskRevision,
      modelId: selected?.config?.modelId,
      reasoning: selected?.config?.reasoning,
      executionTarget: selected?.config?.executionTarget,
    };
  }

  list() {
    return this.repo.settingKeys("conversationBranch:").flatMap((key) => {
      const chatId = key.slice("conversationBranch:".length),
        metadata = this.get(chatId);
      const info = metadata ? this.info(chatId) : undefined;
      return info ? [info] : [];
    });
  }

  purgeRevoked() {
    for (const key of this.repo.settingKeys("conversationBranch:")) {
      const chatId = key.slice("conversationBranch:".length),
        metadata = this.get(chatId);
      if (
        !metadata ||
        metadata.revoked ||
        ![...metadata.sourceRunIds, metadata.sourceRunId].some((id) => {
          const source = this.repo.getRun(id);
          return !source || source.config?.contextMemoryRevoked;
        })
      )
        continue;
      this.repo.transaction(() => {
        this.repo.setSetting(key, { ...metadata, revoked: true });
        withSecureDelete(this.repo.db, () =>
          this.repo.db.prepare("DELETE FROM run_transcript WHERE run_id=?").run(transcriptKey(chatId)),
        );
      });
    }
  }

  prefix(chatId: string) {
    const metadata = this.get(chatId);
    if (!metadata) return undefined;
    this.source(metadata);
    const transcript = new TranscriptStore(this.repo.db, this.repo.columnCipher);
    return projectLegacyRecall(this.repo, transcript, transcriptKey(chatId));
  }
}
