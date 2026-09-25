import { expect, it } from "vitest";
import { EventBus, HookService, openDb, Repo, TaskService } from "@aux/runtime";

function fixture() {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Research");
  return { db, repo, workspace, hooks: new HookService(repo) };
}

it("keeps command hooks inert until exact-handler approval and records each event once", async () => {
  const f = fixture();
  const hook = f.hooks.register({ workspaceId: f.workspace.workspaceId, event: "tool.after",
    handler: { type: "command", command: "printf REVIEWED" } });
  const event = { eventId: "event-1", workspaceId: f.workspace.workspaceId, event: "tool.after", at: Date.now() };
  let calls = 0;
  const executor = async () => { calls++; };
  expect(await f.hooks.dispatch(event, executor)).toEqual([]);
  expect(() => f.hooks.approve(hook.hookId, "0".repeat(64))).toThrow(/Review/);
  expect(f.hooks.approve(hook.hookId, hook.handlerDigest).trust).toBe("approved");
  expect((await f.hooks.dispatch(event, executor))[0]?.state).toBe("completed");
  expect(await f.hooks.dispatch(event, executor)).toEqual([]);
  expect(calls).toBe(1);
  expect(f.hooks.invocations(hook.hookId)).toHaveLength(1);
  f.hooks.revoke(hook.hookId);
  expect(await f.hooks.dispatch({ ...event, eventId: "event-2" }, executor)).toEqual([]);
  expect(calls).toBe(1);
  f.db.close();
});

it("aborts a revoked in-flight hook and never replays an uncertain dispatch after restart", async () => {
  const f = fixture();
  const hook = f.hooks.register({ workspaceId: f.workspace.workspaceId, event: "run.end",
    handler: { type: "mcp_tool", serverId: "local", toolName: "summarize" } });
  f.hooks.approve(hook.hookId, hook.handlerDigest);
  const event = { eventId: "event-race", workspaceId: f.workspace.workspaceId, event: "run.end", at: Date.now() };
  let started!: () => void;
  const ready = new Promise<void>(resolve => { started = resolve; });
  const pending = f.hooks.dispatch(event, async (_handler, _context, signal) => {
    started();
    await new Promise<void>(resolve => signal.addEventListener("abort", () => resolve(), { once: true }));
  });
  await ready;
  f.hooks.revoke(hook.hookId);
  expect((await pending)[0]?.state).toBe("uncertain");
  expect(f.hooks.invocations(hook.hookId)[0]?.state).toBe("uncertain");
  f.repo.db.prepare("INSERT INTO hook_invocations(invocation_id,hook_id,event_id,state,created_at) VALUES(?,?,?,'invoking',?)")
    .run("00000000-0000-4000-8000-000000000001", hook.hookId, "crashed", Date.now());
  const recovered = new HookService(f.repo);
  expect(recovered.invocations(hook.hookId).find(item => item.eventId === "crashed")?.state).toBe("uncertain");
  f.db.close();
});
