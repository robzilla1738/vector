import { expect, it } from "vitest";
import { existsSync, mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BashSeatbelt, CommandEscalationService, commandSegments, EventBus, openDb, Repo, TaskService, WorkspaceFolderService } from "@aux/runtime";

it("splits literal shell segments and rejects substitution or hidden commands", () => {
  expect(commandSegments("pwd && echo 'a;b' | cat; ls")).toEqual(["pwd", "echo 'a;b'", "cat", "ls"]);
  for (const command of ["pwd;", "pwd &&", "echo $(id)", "echo `id`", "echo hi > out", "echo hi\nwhoami", "pwd & id", "pwd\0", "cat *", "cat ~/secret", "sh -c 'pwd; id'"])
    expect(() => commandSegments(command)).toThrow();
});

it("binds an approved retry to the reviewed folder and stops on changed AGENTS or archive", async () => {
  const base = mkdtempSync(join(tmpdir(), "aux-work-journey-"));
  const root = join(base, "project");
  const scratch = join(base, "scratch");
  mkdirSync(root);
  mkdirSync(scratch);
  writeFileSync(join(root, "AGENTS.md"), "Local fixture instructions.");
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Research").workspaceId;
    const folders = new WorkspaceFolderService(repo);
    const review = folders.inspect(workspaceId, root, "read");
    const binding = folders.add(workspaceId, root, "read", review.reviewDigest);
    const service = new CommandEscalationService(repo, (space, workdir) => folders.scopeDigest(space, workdir));
    const launches: string[] = [];
    const bash = new BashSeatbelt({ writableRoots: () => [scratch], readableRoots: () => folders.roots(workspaceId).read,
      scratchDir: scratch, platform: "darwin",
      escalationGate: async (input, ctx) => service.authorize({ ...input, runId: ctx.runId, workspaceId }),
      escalationRecheck: ({ workdir, scopeDigest, requestIds }) => service.assertDispatch(workspaceId, workdir, scopeDigest, requestIds),
      runner: async (file, args) => { launches.push(`${file} ${args.at(-1)}`);
        return { stdout: "done", stderr: "", exitCode: 0, timedOut: false }; } });
    const ctx = { runId: "run-fixture", threadId: "thread-fixture", turnId: "turn-fixture" };
    const command = { command: "touch reviewed-output", workdir: root, requireEscalated: true,
      justification: "Need a reviewed write into the read-only project folder" };
    expect(await bash.run(command, ctx)).toHaveProperty("park");
    expect(launches).toEqual([]);
    const request = service.list(workspaceId)[0]!;
    expect(request).toMatchObject({ segment: command.command, workdir: realpathSync(root), state: "pending" });
    service.decide(request.requestId, "once");
    expect(await bash.run(command, ctx)).toMatchObject({ stdout: "done", exitCode: 0 });
    expect(launches).toEqual(["/bin/sh touch reviewed-output"]);
    expect(await bash.run(command, ctx)).toHaveProperty("park");
    const second = service.list(workspaceId).find(item => item.state === "pending")!;
    writeFileSync(join(root, "AGENTS.md"), "Changed fixture instructions.");
    expect(folders.roots(workspaceId)).toEqual({ read: [], write: [] });
    expect(() => service.decide(second.requestId, "once")).toThrow(/reviewed folder|scope changed/i);
    await expect(bash.run(command, ctx)).rejects.toThrow(/reviewed session roots/i);
    expect(launches).toHaveLength(1);
    folders.archive(workspaceId, binding.folderId);
    expect(() => service.authorize({ runId: ctx.runId, workspaceId,
      command: command.command, workdir: root, justification: command.justification })).toThrow(/reviewed folder/i);
  } finally { db.close(); rmSync(base, { recursive: true, force: true }); }
});

it("rechecks scope after approval and before launching an unsandboxed process", async () => {
  const db = openDb(":memory:");
  let scope = "a".repeat(64);
  const service = new CommandEscalationService(new Repo(db), () => scope);
  const launches: string[] = [];
  const bash = new BashSeatbelt({ writableRoots: () => ["/tmp"], scratchDir: "/tmp",
    platform: "darwin", runner: async file => { launches.push(file);
      return { stdout: "", stderr: "", exitCode: 0, timedOut: false }; },
    escalationGate: async (input, ctx) => {
      const decision = service.authorize({ ...input, runId: ctx.runId, workspaceId: "space" });
      if ("allow" in decision) scope = "b".repeat(64);
      return decision;
    },
    escalationRecheck: ({ workdir, scopeDigest, requestIds }) => service.assertDispatch("space", workdir, scopeDigest, requestIds) });
  try {
    const ctx = { runId: "run", threadId: "thread", turnId: "turn" };
    const input = { command: "pwd", workdir: "/tmp", requireEscalated: true,
      justification: "Review the exact working folder" };
    expect(await bash.run(input, ctx)).toHaveProperty("park");
    service.decide(service.list("space")[0]!.requestId, "once");
    await expect(bash.run(input, ctx)).rejects.toThrow(/scope changed/i);
    expect(launches).toEqual([]);
  } finally { db.close(); }
});

it("refuses dispatch if the owner revokes approval after authorization", async () => {
  const db = openDb(":memory:");
  const service = new CommandEscalationService(new Repo(db), () => "a".repeat(64));
  const launches: string[] = [];
  const bash = new BashSeatbelt({ writableRoots: () => ["/tmp"], scratchDir: "/tmp",
    platform: "darwin", runner: async file => { launches.push(file);
      return { stdout: "", stderr: "", exitCode: 0, timedOut: false }; },
    escalationGate: async (input, ctx) => {
      const verdict = service.authorize({ ...input, runId: ctx.runId, workspaceId: "space" });
      if ("allow" in verdict) service.revoke(verdict.requestIds[0]!);
      return verdict;
    },
    escalationRecheck: ({ workdir, scopeDigest, requestIds }) =>
      service.assertDispatch("space", workdir, scopeDigest, requestIds) });
  try {
    const ctx = { runId: "run", threadId: "thread", turnId: "turn" };
    const input = { command: "pwd", workdir: "/tmp", requireEscalated: true,
      justification: "Review the exact working folder" };
    expect(await bash.run(input, ctx)).toHaveProperty("park");
    service.decide(service.list("space")[0]!.requestId, "once");
    await expect(bash.run(input, ctx)).rejects.toThrow(/revoked before dispatch/i);
    expect(launches).toEqual([]);
  } finally { db.close(); }
});

it("does not carry a reusable prefix across a changed reviewed scope", () => {
  const db = openDb(":memory:");
  let scope = "a".repeat(64);
  const service = new CommandEscalationService(new Repo(db), () => scope);
  try {
    const input = { runId: "run", workspaceId: "space", workdir: "/tmp/project",
      command: "ls -l", justification: "Review directory listing outside the seatbelt", prefixRule: "ls" };
    expect(service.authorize(input)).toHaveProperty("park");
    service.decide(service.list("space")[0]!.requestId, "prefix");
    expect(service.authorize(input)).toMatchObject({ allow: scope });
    scope = "b".repeat(64);
    expect(service.authorize(input)).toHaveProperty("park");
    const pending = service.list("space").find(item => item.state === "pending");
    expect(pending?.scopeDigest).toBe(scope);
  } finally { db.close(); }
});

it("requires owner review for every segment, consumes once, bounds prefixes, and honors decline/revoke", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const service = new CommandEscalationService(repo, () => "a".repeat(64));
  const base = { runId: "run-1", workspaceId: "space-1", workdir: "/tmp/project",
    justification: "Inspect the project outside the seatbelt" };
  const first = service.authorize({ ...base, command: "pwd && ls -la", prefixRule: "pwd" });
  expect(first).toHaveProperty("park");
  const pending = service.list("space-1");
  expect(pending).toMatchObject([{ segment: "pwd", prefixRule: "pwd", state: "pending" }]);
  service.decide(pending[0]!.requestId, "once");
  expect(service.authorize({ ...base, command: "pwd && ls -la" })).toHaveProperty("park");
  const second = service.list("space-1").find(item => item.state === "pending")!;
  expect(second.segment).toBe("ls -la");
  expect(() => service.decide(second.requestId, "prefix")).toThrow(/reusable prefix/);
  service.decide(second.requestId, "once");
  expect(service.authorize({ ...base, command: "pwd && ls -la" })).toMatchObject({ allow: "a".repeat(64) });
  expect(service.authorize({ ...base, command: "pwd && ls -la" })).toHaveProperty("park");
  const newRequest = service.list("space-1").find(item => item.state === "pending")!;
  service.decide(newRequest.requestId, "decline");
  expect(() => service.authorize({ ...base, command: "pwd && ls -la" })).toThrow(/declined/);

  const other = { ...base, runId: "run-2", command: "ls -la", prefixRule: "ls" };
  expect(service.authorize(other)).toHaveProperty("park");
  const prefixRequest = service.list("space-1").find(item => item.runId === "run-2")!;
  service.decide(prefixRequest.requestId, "prefix");
  expect(service.authorize({ ...other, command: "ls -l" })).toMatchObject({ allow: "a".repeat(64) });
  expect(service.authorize({ ...other, command: "ls -LR" })).toHaveProperty("park");
  expect(service.authorize({ ...other, command: "ls /Users" })).toHaveProperty("park");
  service.revoke(prefixRequest.requestId);
  expect(service.authorize({ ...other, command: "ls -l" })).toHaveProperty("park");
  db.close();
});

it("never launches an escalated process until its reviewed command is approved", async () => {
  const root = mkdtempSync(join(tmpdir(), "aux-escalation-"));
  const db = openDb(":memory:");
  const service = new CommandEscalationService(new Repo(db), () => "a".repeat(64));
  const calls: string[] = [];
  const bash = new BashSeatbelt({ writableRoots: () => [root], scratchDir: root, platform: "darwin",
    escalationGate: async (input, ctx) => service.authorize({ ...input, runId: ctx.runId, workspaceId: "space-1" }),
    escalationRecheck: ({ workdir, scopeDigest, requestIds }) => service.assertDispatch("space-1", workdir, scopeDigest, requestIds),
    runner: async (file) => { calls.push(file); return { stdout: "ok", stderr: "", exitCode: 0, timedOut: false }; } });
  const input = { command: "pwd", requireEscalated: true, justification: "Need owner-reviewed command access" };
  const ctx = { runId: "run-3", threadId: "chat-3", turnId: "run-3" };
  expect(await bash.run(input, ctx)).toHaveProperty("park");
  expect(calls).toEqual([]);
  service.decide(service.list("space-1")[0]!.requestId, "once");
  expect(await bash.run(input, ctx)).toMatchObject({ stdout: "ok", exitCode: 0 });
  expect(calls).toEqual(["/bin/sh"]);
  expect(await bash.run(input, ctx)).toHaveProperty("park");
  db.close();
  rmSync(root, { recursive: true, force: true });
});

it.skipIf(process.platform !== "darwin")("runs only the exact approved segment outside the seatbelt on macOS", async () => {
  const root = mkdtempSync(join(tmpdir(), "aux-escalation-live-"));
  const db = openDb(":memory:");
  try {
    const service = new CommandEscalationService(new Repo(db), () => "a".repeat(64));
    const bash = new BashSeatbelt({ writableRoots: () => [root], scratchDir: root, platform: "darwin",
      escalationGate: async (input, ctx) => service.authorize({ ...input, runId: ctx.runId, workspaceId: "space-1" }),
      escalationRecheck: ({ workdir, scopeDigest, requestIds }) => service.assertDispatch("space-1", workdir, scopeDigest, requestIds) });
    const ctx = { runId: "run-live", threadId: "chat-live", turnId: "run-live" };
    const input = { command: "pwd", requireEscalated: true, justification: "Read disposable working directory" };
    expect(await bash.run(input, ctx)).toHaveProperty("park");
    service.decide(service.list("space-1")[0]!.requestId, "once");
    const result = await bash.run(input, ctx);
    expect(result).toMatchObject({ stdout: `${realpathSync(root)}\n`, exitCode: 0 });
    expect(await bash.run(input, ctx)).toHaveProperty("park");
  } finally { db.close(); rmSync(root, { recursive: true, force: true }); }
});

it.skipIf(process.platform !== "darwin")("confines a real write until exact owner escalation, then refuses after archive", async () => {
  const base = mkdtempSync(join(tmpdir(), "aux-work-seatbelt-live-"));
  const root = join(base, "reviewed");
  const scratch = join(base, "scratch");
  mkdirSync(root);
  mkdirSync(scratch);
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Work fixture").workspaceId;
    const folders = new WorkspaceFolderService(repo);
    const review = folders.inspect(workspaceId, root, "read");
    const folder = folders.add(workspaceId, root, "read", review.reviewDigest);
    const escalations = new CommandEscalationService(repo,
      (space, workdir) => folders.scopeDigest(space, workdir));
    const bash = new BashSeatbelt({ writableRoots: () => [scratch],
      readableRoots: () => folders.roots(workspaceId).read, scratchDir: scratch, platform: "darwin",
      escalationGate: async (input, ctx) => escalations.authorize({ ...input, runId: ctx.runId, workspaceId }),
      escalationRecheck: ({ workdir, scopeDigest, requestIds }) => escalations.assertDispatch(workspaceId, workdir, scopeDigest, requestIds) });
    const ctx = { runId: "run-live-work", threadId: "thread-live-work", turnId: "turn-live-work" };
    const command = "touch limited.txt";
    const denied = await bash.run({ command, workdir: root }, ctx);
    expect("exitCode" in denied && denied.exitCode).not.toBe(0);
    expect(existsSync(join(root, "limited.txt"))).toBe(false);
    const input = { command, workdir: root, requireEscalated: true,
      justification: "Create one reviewed fixture file outside the seatbelt" };
    expect(await bash.run(input, ctx)).toHaveProperty("park");
    expect(existsSync(join(root, "limited.txt"))).toBe(false);
    escalations.decide(escalations.list(workspaceId)[0]!.requestId, "once");
    expect(await bash.run(input, ctx)).toMatchObject({ exitCode: 0 });
    expect(existsSync(join(root, "limited.txt"))).toBe(true);
    folders.archive(workspaceId, folder.folderId);
    await expect(bash.run(input, ctx)).rejects.toThrow(/reviewed session roots/i);
  } finally { db.close(); rmSync(base, { recursive: true, force: true }); }
});
