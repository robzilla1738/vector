import { fixtureFilesystemPolicy } from "../fixtures/filesystem-policy.js";
import { expect, it } from "vitest";
import {
  BashSeatbelt,
  EventBus,
  HookService,
  installRunEndHooks,
  openDb,
  Repo,
  TaskService,
} from "@aux/runtime";
import { AuxError, EventTypes } from "@aux/contracts";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function fixture(authorize: () => void = () => {}) {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Research");
  return { db, repo, workspace, hooks: new HookService(repo, authorize) };
}

it("rechecks a Hook's capability and exact handler bytes before automatic dispatch", async () => {
  let allowed = true;
  const f = fixture(() => {
    if (!allowed) throw new AuxError("permission_denied", "Grant was revoked.");
  });
  try {
    const create = (event: "run.start" | "run.end") => {
      const hook = f.hooks.register({
        workspaceId: f.workspace.workspaceId,
        event,
        handler: {
          type: "mcp_tool",
          serverId: "fixture",

          toolName: "record_result",
        },
      });

      return hook;
    };
    const revokedGrant = create("run.start");
    allowed = false;
    let calls = 0;
    const executor = async () => {
      calls++;
    };
    expect(
      (
        await f.hooks.dispatch(
          {
            eventId: "grant-revoked",
            workspaceId: f.workspace.workspaceId,
            event: "run.start",
            at: Date.now(),
          },
          executor,
        )
      )[0]?.state,
    ).toBe("failed");
    expect(calls).toBe(0);
    expect(f.hooks.invocations(revokedGrant.hookId)).toHaveLength(1);
    allowed = true;
    const changed = create("run.end");
    const altered = { ...changed, handler: { ...changed.handler, toolName: "other_tool" } };
    f.repo.db
      .prepare("UPDATE hooks SET body=? WHERE hook_id=?")
      .run(
        f.repo.protectRecordField("hooks", [changed.hookId], "body", JSON.stringify(altered)),
        changed.hookId,
      );
    expect(
      (
        await f.hooks.dispatch(
          {
            eventId: "changed-handler",
            workspaceId: f.workspace.workspaceId,
            event: "run.end",
            at: Date.now(),
          },
          executor,
        )
      )[0]?.state,
    ).toBe("failed");
    expect(f.hooks.get(changed.hookId).trust).toBe("revoked");
    expect(calls).toBe(0);
  } finally {
    f.db.close();
  }
});

it("rejects unauthorized creation, then dispatches a consented exact handler once", async () => {
  let allowed = false;
  const f = fixture(() => {
    if (!allowed) throw new AuxError("permission_denied", "The connected handler is unavailable.");
  });
  expect(() =>
    f.hooks.register({
      workspaceId: f.workspace.workspaceId,
      event: "tool.after",
      handler: { type: "command", command: "printf REVIEWED" },
    }),
  ).toThrow();
  expect(() =>
    f.hooks.register({
      workspaceId: f.workspace.workspaceId,
      event: "run.end",
      handler: { type: "mcp_tool", serverId: "local", toolName: "summarize" },
    }),
  ).toThrow(/unavailable/);
  expect(f.repo.db.prepare("SELECT count(*) AS n FROM hooks").get()).toMatchObject({ n: 0 });
  allowed = true;
  const hook = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "summarize",
      arguments: {},
    },
  });
  const event = {
    eventId: "event-1",
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    at: Date.now(),
  };
  let calls = 0;
  const executor = async () => {
    calls++;
  };
  expect(hook.trust).toBe("approved");
  expect((await f.hooks.dispatch(event, executor))[0]?.state).toBe("completed");
  expect(await f.hooks.dispatch(event, executor)).toEqual([]);
  expect(calls).toBe(1);
  expect(f.hooks.invocations(hook.hookId)).toHaveLength(1);
  expect((await f.hooks.test(hook.hookId, executor)).state).toBe("completed");
  expect(calls).toBe(2);
  f.hooks.revoke(hook.hookId);
  await expect(f.hooks.test(hook.hookId, executor)).rejects.toMatchObject({ code: "permission_denied" });
  expect(await f.hooks.dispatch({ ...event, eventId: "event-2" }, executor)).toEqual([]);
  expect(calls).toBe(2);
  f.db.close();
});

it("aborts a revoked in-flight hook and never replays an uncertain dispatch after restart", async () => {
  const f = fixture();
  const hook = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "summarize",
    },
  });

  const event = {
    eventId: "event-race",
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    at: Date.now(),
  };
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const pending = f.hooks.dispatch(event, async (_handler, _context, signal) => {
    started();
    await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
  });
  await ready;
  f.hooks.revoke(hook.hookId);
  expect((await pending)[0]?.state).toBe("uncertain");
  expect(f.hooks.invocations(hook.hookId)[0]?.state).toBe("uncertain");
  f.repo.db
    .prepare(
      "INSERT INTO hook_invocations(invocation_id,hook_id,event_id,state,created_at) VALUES(?,?,?,'invoking',?)",
    )
    .run("00000000-0000-4000-8000-000000000001", hook.hookId, "crashed", Date.now());
  const recovered = new HookService(f.repo);
  expect(recovered.invocations(hook.hookId).find((item) => item.eventId === "crashed")?.state).toBe(
    "uncertain",
  );
  f.db.close();
});

it("dispatches a terminal run update once and records the invocation", async () => {
  const f = fixture();
  const eventBus = new EventBus(f.repo);
  const hook = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "summarize",
      arguments: { marker: "reviewed" },
    },
  });

  let calls = 0;
  const stop = installRunEndHooks(eventBus, f.hooks, async (handler) => {
    expect(handler).toMatchObject({ type: "mcp_tool", arguments: { marker: "reviewed" } });
    calls++;
  });
  const run = {
    runId: "run-1",
    status: "completed",
    config: { contextWorkspaceId: f.workspace.workspaceId },
    endedAt: Date.now(),
  };
  eventBus.emit(EventTypes.RunUpdated, { run });
  eventBus.emit(EventTypes.RunUpdated, { run });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(calls).toBe(1);
  expect(f.hooks.invocations(hook.hookId)).toMatchObject([{ state: "completed", eventId: "run:run-1:end" }]);
  stop();
  f.db.close();
});

it("dispatches a run-start Hook once when the run is queued, independently of run-end", async () => {
  const f = fixture();
  const eventBus = new EventBus(f.repo);
  const start = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.start",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "notify",
      arguments: { phase: "start" },
    },
  });
  const end = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "notify",
      arguments: { phase: "end" },
    },
  });

  const seen: string[] = [];
  const stop = installRunEndHooks(eventBus, f.hooks, async (_handler, context) => {
    seen.push(context.event);
  });
  const base = {
    runId: "run-lifecycle",
    config: { contextWorkspaceId: f.workspace.workspaceId },
    createdAt: Date.now(),
  };
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "queued" } });
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "queued" } });
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "running" } });
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "completed", endedAt: Date.now() } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(seen).toEqual(["run.start", "run.end"]);
  expect(f.hooks.invocations(start.hookId)).toMatchObject([
    { eventId: "run:run-lifecycle:start", state: "completed" },
  ]);
  expect(f.hooks.invocations(end.hookId)).toMatchObject([
    { eventId: "run:run-lifecycle:end", state: "completed" },
  ]);
  stop();
  f.db.close();
});

it("dispatches run.start once when a run is first seen running, then run.end once when it fails", async () => {
  const f = fixture();
  const eventBus = new EventBus(f.repo);
  const start = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.start",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "notify",
      arguments: { phase: "start" },
    },
  });
  const end = f.hooks.register({
    workspaceId: f.workspace.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "local",

      toolName: "notify",
      arguments: { phase: "end" },
    },
  });

  const seen: string[] = [];
  const stop = installRunEndHooks(eventBus, f.hooks, async (_handler, context) => {
    seen.push(`${context.event}:${context.runId}`);
  });
  const base = {
    runId: "run-already-running",
    config: { contextWorkspaceId: f.workspace.workspaceId },
    createdAt: Date.now(),
  };
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "running", startedAt: base.createdAt } });
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "running", startedAt: base.createdAt } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(seen).toEqual(["run.start:run-already-running"]);
  expect(f.hooks.invocations(end.hookId)).toEqual([]);
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "failed", endedAt: Date.now() } });
  eventBus.emit(EventTypes.RunUpdated, { run: { ...base, status: "failed", endedAt: Date.now() } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(seen).toEqual(["run.start:run-already-running", "run.end:run-already-running"]);
  expect(f.hooks.invocations(start.hookId)).toMatchObject([
    { eventId: "run:run-already-running:start", state: "completed" },
  ]);
  expect(f.hooks.invocations(end.hookId)).toMatchObject([
    { eventId: "run:run-already-running:end", state: "completed" },
  ]);
  stop();
  f.db.close();
});

it("executes an exactly approved command Hook inside the confined folder and stops after revoke", async () => {
  const f = fixture();
  const root = mkdtempSync(join(tmpdir(), "aux-hook-command-"));
  try {
    const hook = f.hooks.register({
      workspaceId: f.workspace.workspaceId,
      event: "run.end",
      handler: { type: "command", command: "pwd", workdir: root },
    });
    const launches: string[] = [];
    const seatbelt = new BashSeatbelt({
      filesystemPolicy: () => fixtureFilesystemPolicy([root]),
      scratchDir: root,
      platform: "darwin",
      runner: async (file, args) => {
        launches.push(`${file} ${args.at(-1)}`);
        return { stdout: root, stderr: "", exitCode: 0, timedOut: false };
      },
    });
    const executor = async (
      handler: typeof hook.handler,
      context: { eventId: string },
      signal: AbortSignal,
    ) => {
      if (handler.type !== "command") throw new Error("unexpected handler");
      const result = await seatbelt.run(
        { command: handler.command, workdir: handler.workdir, signal },
        { runId: "run-1", threadId: "run-1", turnId: context.eventId },
      );
      expect(result).toMatchObject({ exitCode: 0 });
    };
    expect((await f.hooks.test(hook.hookId, executor)).state).toBe("completed");
    expect(launches).toEqual(["/usr/bin/sandbox-exec pwd"]);
    f.hooks.revoke(hook.hookId);
    await expect(f.hooks.test(hook.hookId, executor)).rejects.toMatchObject({ code: "permission_denied" });
  } finally {
    f.db.close();
    rmSync(root, { recursive: true, force: true });
  }
});
