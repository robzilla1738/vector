import { expect, it, vi } from "vitest";
import { MethodSchemas, type Run } from "@aux/contracts";
import { runsMethods } from "../../apps/runtime/src/api/methods/runs.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

function fixture(client: MethodCtx["client"] = { external: false, nativeRunResume: "original-owner-ticket" }) {
  const run: Run = { runId: "run", status: "paused", goal: "Work", pageIds: ["child-page"], createdAt: 1,
    config: { taskId: "task", taskRevision: 4 } };
  const consume = vi.fn(async () => ({ accepted: true as const }));
  const check = vi.fn(async () => ({ accepted: true as const }));
  const resume = vi.fn(async () => ({ ...run, status: "running" as const }));
  // Narrow API boundary fixture; native ticket production is covered separately
  // by genuine native owner ingress definitions, never synthesized here.
  const ctx = { params: { runId: "run" }, client,
    s: { native: { egressResumeRun: consume, egressCheckRunResume: check }, runs: { coordinator: { get: () => run }, resume } } } as unknown as MethodCtx;
  return { run, ctx, consume, check, resume, invoke: () => runsMethods["runs.resume"]!(ctx) };
}
it("waits for the original native owner intent acknowledgement before resuming a paused run", async () => {
  const f = fixture();
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  f.consume.mockImplementationOnce(async () => { await hold; return { accepted: true }; });
  const pending = f.invoke();
  expect(f.resume).not.toHaveBeenCalled();
  release();
  await expect(pending).resolves.toMatchObject({ status: "running" });
  expect(f.consume).toHaveBeenCalledExactlyOnceWith({ runId: "run", ticketId: "original-owner-ticket" });
  expect(f.resume).toHaveBeenCalledExactlyOnceWith("run");
});
it.each(["status", "task", "page"])("refuses original paused run %s drift while native receipt is held", async change => {
  const f = fixture();
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  f.consume.mockImplementationOnce(async () => { await hold; return { accepted: true }; });
  const pending = f.invoke().catch(error => error);
  if (change === "status") f.run.status = "cancelled";
  if (change === "task") f.run.config!.taskRevision = 5;
  if (change === "page") f.run.pageIds = ["foreign-page"];
  release();
  expect(await pending).toMatchObject({ code: "ref_stale" });
  expect(f.resume).not.toHaveBeenCalled();
});
it.each([{ external: true }, { external: false, codeMode: true as const }])("cannot consume owner run authority from an external/code-mode caller %j", async client => {
  const f = fixture({ ...client, nativeRunResume: "untrusted" });
  await expect(f.invoke()).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.consume).not.toHaveBeenCalled();
  expect(f.resume).not.toHaveBeenCalled();
});
it("retains a native refusal and never calls runtime resume", async () => {
  const f = fixture();
  f.consume.mockRejectedValueOnce(new Error("original receipt consumed"));
  await expect(f.invoke()).rejects.toThrow("original receipt consumed");
  expect(f.resume).not.toHaveBeenCalled();
});
it("preserves valid task-originated resume without inventing a native owner receipt", async () => {
  const f = fixture({ external: true });
  await expect(f.invoke()).resolves.toMatchObject({ status: "running" });
  expect(f.consume).not.toHaveBeenCalled();
  expect(f.resume).toHaveBeenCalledExactlyOnceWith("run");
});
it("public resume parameters cannot supply a native owner receipt", () => {
  expect(MethodSchemas["runs.resume"].parse({ runId: "run", nativeRunResume: "forged" })).toEqual({ runId: "run" });
});

it.each([{ external: false }, { external: true }, { external: false, codeMode: true as const }])("refuses ticketless native-stopped families before runtime resume %j", async client => {
  const f = fixture(client);
  f.check.mockRejectedValueOnce(Object.assign(new Error("Original ancestor run control remains stopped"), { code: "ref_stale" }));
  await expect(f.invoke()).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.check).toHaveBeenCalledExactlyOnceWith({ runId: "run" });
  expect(f.consume).not.toHaveBeenCalled();
  expect(f.resume).not.toHaveBeenCalled();
});
it("refuses original run drift while a ticketless native-state check is held", async () => {
  const f = fixture({ external: true });
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  f.check.mockImplementationOnce(async () => { await hold; return { accepted: true }; });
  const pending = f.invoke().catch(error => error);
  f.run.config!.taskRevision = 5;
  release();
  expect(await pending).toMatchObject({ code: "ref_stale" });
  expect(f.resume).not.toHaveBeenCalled();
});
