import { afterEach, describe, expect, it, vi } from "vitest";
import { EventTypes, taskConversationId, type Run } from "@aux/contracts";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

describe("durable conversation queue", () => {
  it("acknowledges in order, starts each follow-up once, and cancels waiting messages on stop", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const repo = new Repo(db);
    const events = new EventBus(repo);
    const current: Run = { runId: "run-current", goal: "First task", status: "running", pageIds: ["p1"],
      config: { chatId: "chat-1", messageRevision: 0 }, createdAt: 1 };
    repo.saveRun(current);
    const started: string[] = [];
    const queue = new RunMessageQueue(repo, events, async message => {
      started.push(message.messageId);
      const run: Run = { runId: message.deliveryRunId, goal: message.text, status: "running", pageIds: message.pageIds,
        config: { chatId: message.chatId, messageId: message.messageId }, createdAt: Date.now() };
      repo.saveRun(run);
      events.emit(EventTypes.RunUpdated, { run }, run.runId);
      return run;
    }, () => true, () => {});
    const input = (messageId: string, text: string) => ({ messageId, runId: current.runId, chatId: "chat-1", text,
      pageIds: ["p1"], contextPageRefs: [{ pageId: "p1", url: "https://example.test/", documentEpoch: 1 }], expectedRevision: 0 });
    const first = queue.queue(input("11111111-1111-4111-8111-111111111111", "Second task"));
    const second = queue.queue(input("22222222-2222-4222-8222-222222222222", "Third task"));
    expect(first.status).toBe("accepted");
    expect(queue.queue(input(first.messageId, "Second task")).deliveryRunId).toBe(first.deliveryRunId);
    expect(started).toEqual([]);

    repo.saveRun({ ...current, status: "completed", endedAt: Date.now() });
    events.emit(EventTypes.RunUpdated, { run: { ...current, status: "completed" } }, current.runId);
    await vi.waitFor(() => expect(queue.list("chat-1")[0]?.status).toBe("delivered"));
    expect(started).toEqual([first.messageId]);
    expect(queue.list("chat-1")[1]?.status).toBe("accepted");

    queue.resumePending();
    expect(started).toEqual([first.messageId]);
    const delivered = repo.getRun(first.deliveryRunId)!;
    repo.saveRun({ ...delivered, status: "completed", endedAt: Date.now() });
    events.emit(EventTypes.RunUpdated, { run: { ...delivered, status: "completed" } }, delivered.runId);
    await vi.waitFor(() => expect(queue.list("chat-1")[1]?.status).toBe("delivered"));
    expect(started).toEqual([first.messageId, second.messageId]);

    const fourth = queue.queue(input("44444444-4444-4444-8444-444444444444", "Fourth task"));
    queue.cancelForChat("chat-1");
    expect(repo.getRunMessage(fourth.messageId)?.status).toBe("cancelled");
    expect(started).toEqual([first.messageId, second.messageId]);
  });

  it("persists a correction and advances the run revision exactly once", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const repo = new Repo(db);
    const events = new EventBus(repo);
    const refs = [{ pageId: "p1", url: "https://example.test/", documentEpoch: 1 }];
    repo.saveRun({ runId: "run-steer", goal: "Find a result", status: "planning", pageIds: ["p1"],
      config: { chatId: "chat-steer", messageRevision: 0, contextPageRefs: refs }, createdAt: 1 });
    const signaled = vi.fn();
    const messages = new RunMessageQueue(repo, events, async () => { throw new Error("queue should not start"); }, () => true, signaled);
    const input = { messageId: "11111111-1111-4111-8111-111111111111", runId: "run-steer", chatId: "chat-steer",
      text: "Use the latest figures", pageIds: ["p1"], contextPageRefs: refs, expectedRevision: 0 };
    const first = messages.steer(input);
    expect(first).toMatchObject({ mode: "steer", status: "delivered" });
    expect(repo.getRun("run-steer")?.config?.messageRevision).toBe(1);
    expect(repo.listRunSteers("run-steer").map(message => message.text)).toEqual([input.text]);
    expect(messages.steer(input).messageId).toBe(first.messageId);
    expect(repo.getRun("run-steer")?.config?.messageRevision).toBe(1);
    expect(signaled).toHaveBeenCalledTimes(1);
    expect(() => messages.steer({ ...input, messageId: "22222222-2222-4222-8222-222222222222" })).toThrow(/changed/);
    await messages.stop();
  });

  it("steers an active saved task only within its current revision and tabs", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const repo = new Repo(db);
    const events = new EventBus(repo);
    const tasks = new TaskService(repo, events);
    const workspace = tasks.createWorkspace("Work");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Research", objective: "Find sources",
      criteria: [{ criterionId: "source", description: "Cite one source", verification: "manual" }], resources: [] });
    const chatId = taskConversationId(task.taskId);
    const target: Run = { runId: "task-steer", goal: task.objective, status: "planning", pageIds: ["p1"], createdAt: Date.now(),
      config: { chatId, taskId: task.taskId, taskRevision: 1, messageRevision: 0, contextPageRefs: [] } };
    repo.saveRun(target);
    const signaled = vi.fn();
    const messages = new RunMessageQueue(repo, events, async () => { throw new Error("queue should not start"); }, () => true, signaled);
    const input = { messageId: "33333333-3333-4333-8333-333333333333", runId: target.runId, chatId,
      text: "Prefer the official source", pageIds: ["p1"], contextPageRefs: [], expectedRevision: 0 };
    expect(() => messages.steer({ ...input, messageId: "44444444-4444-4444-8444-444444444444", pageIds: ["p1", "p2"] }))
      .toThrow(/context changed/i);
    expect(messages.steer(input).status).toBe("delivered");
    expect(signaled).toHaveBeenCalledTimes(1);
    await messages.stop();
  });
});
