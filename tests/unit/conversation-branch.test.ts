import { expect, it } from "vitest";
import { openDb } from "@aux/runtime/database";
import { Repo } from "@aux/runtime/repository";
import { TranscriptStore, type ModelMessage } from "@aux/runtime";
import { ConversationBranches } from "../../apps/runtime/dist/services/conversation-branches.js";

it("branches only through the selected completed turn, edits before it, and refuses source retirement", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db),
      branches = new ConversationBranches(repo),
      transcript = new TranscriptStore(db);
    const messages: ModelMessage[][] = [];
    for (const [index, runId] of ["before", "selected", "after"].entries()) {
      repo.saveRun({
        runId,
        goal: `${runId} task`,
        status: "completed",
        pageIds: [],
        createdAt: index + 1,
        config: { chatId: "original", privateTask: true },
      });
      const turn: ModelMessage[] = [
        { role: "user", content: `${runId} task` },
        { role: "assistant", content: `${runId} answer` },
      ];
      messages.push(turn);
      transcript.append(runId, turn);
    }
    const original = transcript.load("selected");
    const branch = await branches.create("selected", "branch", "window", async () => {});
    const edit = await branches.create("selected", "edit", "window", async () => {});
    expect(new ConversationBranches(repo).prefix(branch.chatId)).toEqual(messages.slice(0, 2).flat());
    expect(branches.prefix(edit.chatId)).toEqual(messages[0]);
    expect(edit.draftText).toBe("selected task");
    expect(repo.conversationPrivateTask(edit.chatId)).toBe(true);
    expect(branches.info(edit.chatId)).toMatchObject({
      kind: "branch-draft",
      privateTask: true,
      available: true,
      draftText: "selected task",
    });
    expect(branches.list().map((draft) => draft.chatId)).toContain(edit.chatId);
    expect(new ConversationBranches(repo).list().map((draft) => draft.chatId)).toContain(branch.chatId);
    expect(transcript.load("selected")).toEqual(original);
    expect(repo.listRuns(10, { chatId: branch.chatId })).toEqual([]);
    let entered!: () => void, release!: () => void;
    const awaited = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pending = branches.create("selected", "branch", "window", async () => {
      entered();
      await held;
    });
    await awaited;
    const selected = repo.getRun("selected")!;
    selected.config = { ...selected.config, contextMemoryRevoked: true };
    repo.saveRun(selected);
    release();
    await expect(pending).rejects.toMatchObject({ code: "permission_denied" });
    await expect(Promise.resolve().then(() => branches.prefix(branch.chatId))).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(transcript.load("selected")).toEqual(original);
    branches.purgeRevoked();
    expect(transcript.count(`conversation-branch:${branch.chatId}`)).toBe(0);
    expect(branches.info(branch.chatId)?.available).toBe(false);
    repo.deleteConversation(edit.chatId);
    expect(transcript.count(`conversation-branch:${edit.chatId}`)).toBe(0);
  } finally {
    db.close();
  }
});
