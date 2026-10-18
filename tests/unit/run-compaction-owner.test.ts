import { expect, it, vi } from "vitest";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
import { runningCompactionOwner } from "../../apps/runtime/src/api/methods/run-compaction-owner.js";

function fixture() {
  const request = { id: "original-compaction", cancel: new AbortController(), reason: "manual" as const };
  const control = { abort: new AbortController(), paused: false, contextCompaction: { active: request } };
  const controls = new Map([["original-run", control]]);
  const source = {
    runId: "original-run",
    status: "running",
    config: { implementation: "agent-loop", nativeTurnContext: "original-private-token" },
  };
  const read = vi.fn(async (_token: string) => ({ windowId: "private-window" }));
  const ctx = {
    params: { runId: source.runId },
    client: { nativeTurnContext: "requesting-private-token" },
    s: {
      repo: { getRun: () => source },
      runs: { coordinator: { controls } },
      native: { turnSourceContext: read },
      nativeIdentity: Promise.resolve({ privateSession: true }),
    },
  } as unknown as MethodCtx;
  return { ctx, control, controls, source, read, request };
}
it("admits existing private turns using both genuine original native tokens", async () => {
  const f = fixture(),
    owner = await runningCompactionOwner(f.ctx);
  await owner.current();
  expect(new Set(f.read.mock.calls.map(([token]) => token))).toEqual(
    new Set(["original-private-token", "requesting-private-token"]),
  );
  f.control.abort.abort();
  await expect(owner.current()).rejects.toMatchObject({ code: "permission_denied" });
});
it("rejects another window and original-control/token ABA during native verification", async () => {
  const foreign = fixture();
  foreign.read.mockImplementation(async (token) => ({
    windowId: token.startsWith("requesting") ? "another-window" : "private-window",
  }));
  await expect(runningCompactionOwner(foreign.ctx)).rejects.toMatchObject({ code: "permission_denied" });
  const changed = fixture();
  const owner = await runningCompactionOwner(changed.ctx);
  changed.controls.set("original-run", { ...changed.control });
  await expect(owner.current()).rejects.toMatchObject({ code: "permission_denied" });
  const token = fixture(),
    original = await runningCompactionOwner(token.ctx);
  token.source.config.nativeTurnContext = "another-token";
  await expect(original.current()).rejects.toMatchObject({ code: "permission_denied" });
});
it("lets a paused original turn cancel only its original pending compaction", async () => {
  const f = fixture();
  f.control.paused = true;
  f.source.status = "paused";
  await expect(runningCompactionOwner(f.ctx)).rejects.toMatchObject({ code: "permission_denied" });
  const owner = await runningCompactionOwner(f.ctx, f.request.id);
  await owner.current();
  f.control.contextCompaction.active = { ...f.request };
  await expect(owner.current()).rejects.toMatchObject({ code: "permission_denied" });
});
it("refuses external callers and missing native ownership before reading any token", async () => {
  const f = fixture();
  f.ctx.client.external = true;
  await expect(runningCompactionOwner(f.ctx)).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.read).not.toHaveBeenCalled();
});
