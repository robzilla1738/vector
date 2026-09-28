import { expect, it } from "vitest";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BashSeatbelt, CommandEscalationService, commandSegments, openDb, Repo } from "@aux/runtime";

it("splits literal shell segments and rejects substitution or hidden commands", () => {
  expect(commandSegments("pwd && echo 'a;b' | cat; ls")).toEqual(["pwd", "echo 'a;b'", "cat", "ls"]);
  for (const command of ["pwd;", "pwd &&", "echo $(id)", "echo `id`", "echo hi > out", "echo hi\nwhoami", "pwd & id", "pwd\0"])
    expect(() => commandSegments(command)).toThrow();
});

it("requires owner review for every segment, consumes once, bounds prefixes, and honors decline/revoke", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const service = new CommandEscalationService(repo);
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
  expect(service.authorize({ ...base, command: "pwd && ls -la" })).toBe("allow");
  expect(service.authorize({ ...base, command: "pwd && ls -la" })).toHaveProperty("park");
  const newRequest = service.list("space-1").find(item => item.state === "pending")!;
  service.decide(newRequest.requestId, "decline");
  expect(() => service.authorize({ ...base, command: "pwd && ls -la" })).toThrow(/declined/);

  const other = { ...base, runId: "run-2", command: "ls -la", prefixRule: "ls" };
  expect(service.authorize(other)).toHaveProperty("park");
  const prefixRequest = service.list("space-1").find(item => item.runId === "run-2")!;
  service.decide(prefixRequest.requestId, "prefix");
  expect(service.authorize({ ...other, command: "ls -l" })).toBe("allow");
  expect(service.authorize({ ...other, command: "ls -LR" })).toHaveProperty("park");
  expect(service.authorize({ ...other, command: "ls /Users" })).toHaveProperty("park");
  service.revoke(prefixRequest.requestId);
  expect(service.authorize({ ...other, command: "ls -l" })).toHaveProperty("park");
  db.close();
});

it("never launches an escalated process until its reviewed command is approved", async () => {
  const root = mkdtempSync(join(tmpdir(), "aux-escalation-"));
  const db = openDb(":memory:");
  const service = new CommandEscalationService(new Repo(db));
  const calls: string[] = [];
  const bash = new BashSeatbelt({ writableRoots: () => [root], scratchDir: root, platform: "darwin",
    escalationGate: async (input, ctx) => service.authorize({ ...input, runId: ctx.runId, workspaceId: "space-1" }),
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
    const service = new CommandEscalationService(new Repo(db));
    const bash = new BashSeatbelt({ writableRoots: () => [root], scratchDir: root, platform: "darwin",
      escalationGate: async (input, ctx) => service.authorize({ ...input, runId: ctx.runId, workspaceId: "space-1" }) });
    const ctx = { runId: "run-live", threadId: "chat-live", turnId: "run-live" };
    const input = { command: "pwd", requireEscalated: true, justification: "Read disposable working directory" };
    expect(await bash.run(input, ctx)).toHaveProperty("park");
    service.decide(service.list("space-1")[0]!.requestId, "once");
    const result = await bash.run(input, ctx);
    expect(result).toMatchObject({ stdout: `${realpathSync(root)}\n`, exitCode: 0 });
    expect(await bash.run(input, ctx)).toHaveProperty("park");
  } finally { db.close(); rmSync(root, { recursive: true, force: true }); }
});
