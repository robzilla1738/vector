import { afterEach, describe, expect, it, vi } from "vitest";
import type { Run } from "@aux/contracts";
import { EventBus, openDb, Repo } from "@aux/runtime";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";
import { presentRun } from "../../apps/runtime/src/services/run-presentation.js";
import { redactedPageRecallConfig } from "@aux/contracts/portable-page-recall";

const queues: RunMessageQueue[] = [];
const databases: ReturnType<typeof openDb>[] = [];
afterEach(async () => {
  for (const queue of queues.splice(0)) await queue.stop();
  for (const db of databases.splice(0)) db.close();
});
function fixture(
  start: ConstructorParameters<typeof RunMessageQueue>[2] = async (message) => ({
    runId: message.deliveryRunId,
    goal: message.text,
    status: "completed",
    pageIds: [],
    createdAt: Date.now(),
  }),
) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db),
    events = new EventBus(repo);
  const target: Run = {
    runId: "original",
    goal: "Original request",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: {
      chatId: "chat",
      contextWorkspaceId: "space",
      contextWorkspaceRevision: 2,
      messageRevision: 0,
      contextAttachmentRefs: [{ chatId: "chat", attachmentId: "document-1", sha256: "a".repeat(64) }],
      contextImageArtifactIds: ["image-1"],
      context: "Original exact selected context",
    },
  };
  repo.saveRun(target);
  const queue = new RunMessageQueue(
    repo,
    events,
    start,
    () => true,
    () => {},
  );
  queues.push(queue);
  const add = (id: string, text = id) =>
    queue.queue({
      messageId: id,
      runId: "original",
      chatId: "chat",
      text,
      pageIds: [],
      contextPageRefs: [],
      mentions: [],
      expectedRevision: 0,
    });
  return { db, repo, events, queue, target, add };
}

describe("revision-bound durable queue order", () => {
  it("moves complete payload identities atomically and restores the order after restart", () => {
    const f = fixture();
    const first = f.add("first", "Draft with the original attachments"),
      second = f.add("second");
    const before = f.queue.order("chat");
    const next = f.queue.reorder({
      chatId: "chat",
      expectedRevision: before.revision,
      messageIds: [second.messageId, first.messageId],
    });
    expect(next.revision).not.toBe(before.revision);
    expect(f.queue.list("chat").map((message) => message.messageId)).toEqual(["second", "first"]);
    expect(f.repo.getRunMessage("first")).toEqual(first);
    expect(f.repo.getRunMessage("second")).toEqual(second);
    expect(first.context).toMatchObject({
      targetRunId: "original",
      targetMessageRevision: 0,
      workspaceId: "space",
      attachmentRefs: [{ attachmentId: "document-1", sha256: "a".repeat(64) }],
      imageArtifactIds: ["image-1"],
    });
    expect(new Repo(f.db).nextRunMessage("chat")?.messageId).toBe("second");
  });

  it("rejects stale order after addition, cancellation, source edits and delivery begins", () => {
    const f = fixture();
    f.add("a");
    f.add("b");
    const initial = f.queue.order("chat");
    f.add("c");
    expect(() =>
      f.queue.reorder({ chatId: "chat", expectedRevision: initial.revision, messageIds: ["b", "a"] }),
    ).toThrow(/changed/i);
    const beforeCancel = f.queue.order("chat");
    f.queue.cancel("c");
    expect(() =>
      f.queue.reorder({
        chatId: "chat",
        expectedRevision: beforeCancel.revision,
        messageIds: ["b", "a", "c"],
      }),
    ).toThrow(/changed/i);
    f.repo.updateRunMessage("a", "delivering");
    expect(() =>
      f.queue.reorder({
        chatId: "chat",
        expectedRevision: f.queue.order("chat").revision,
        messageIds: ["b", "a"],
      }),
    ).toThrow(/delivery/i);
    f.repo.updateRunMessage("a", "accepted");
    const run = f.repo.getRun("original")!;
    run.config = { ...run.config, contextWorkspaceId: "other" };
    f.repo.saveRun(run);
    expect(() =>
      f.queue.reorder({
        chatId: "chat",
        expectedRevision: f.queue.order("chat").revision,
        messageIds: ["b", "a"],
      }),
    ).toThrow(/source/i);
  });

  it("refuses omitted, duplicated or foreign message IDs without moving any row", () => {
    const f = fixture();
    f.add("a");
    f.add("b");
    const order = f.queue.order("chat");
    for (const ids of [["a"], ["a", "a"], ["a", "foreign"]])
      expect(() =>
        f.queue.reorder({ chatId: "chat", expectedRevision: order.revision, messageIds: ids }),
      ).toThrow(/exact/i);
    expect(f.queue.order("chat")).toEqual(order);
  });

  it("does not treat model progress as a changed source revision", () => {
    const f = fixture();
    f.add("a");
    f.add("b");
    const order = f.queue.order("chat");
    const run = f.repo.getRun("original")!;
    run.statusMessage = "Thinking";
    f.repo.saveRun(run);
    expect(f.queue.order("chat").revision).toBe(order.revision);
    f.queue.reorder({ chatId: "chat", expectedRevision: order.revision, messageIds: ["b", "a"] });
  });

  it("preserves cancellation when an async delivery rejects after Forget or owner removal", async () => {
    let reject!: (reason: unknown) => void;
    const start = vi.fn(
      () =>
        new Promise<Run>((_, fail) => {
          reject = fail;
        }),
    );
    const f = fixture(start);
    f.add("a");
    const target = f.repo.getRun("original")!;
    target.status = "completed";
    f.repo.saveRun(target);
    f.queue.resumePending();
    await vi.waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    f.queue.cancelForChat("chat");
    reject(new Error("Original source retired"));
    await vi.waitFor(() => expect(f.repo.getRunMessage("a")?.status).toBe("cancelled"));
    await f.queue.stop();
    expect(f.repo.getRunMessage("a")?.status).toBe("cancelled");
  });

  it("keeps captured selections private and removes them from forgotten or portable config", () => {
    const f = fixture();
    f.add("a");
    const run = f.repo.getRun("original")!;
    expect(run.config?.queuedMessageContexts?.a).toBeDefined();
    expect(presentRun(run).config?.queuedMessageContexts).toBeUndefined();
    expect(redactedPageRecallConfig(run.config!).queuedMessageContexts).toBeUndefined();
  });
});
