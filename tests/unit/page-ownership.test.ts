import { expect, it } from "vitest";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";

it("queues owners in order and skips a cancelled waiter", async () => {
  const ownership = new PageOwnership();
  const first = ownership.tryAcquire({ pageId: "tab", actor: "set_member", runId: "first" });
  const cancelled = new AbortController();
  const second = ownership.acquire({ pageId: "tab", actor: "coordinator", runId: "second" }, cancelled.signal);
  const third = ownership.acquire({ pageId: "tab", actor: "coordinator", runId: "third" });
  cancelled.abort();
  await expect(second).rejects.toMatchObject({ code: "cancelled" });
  first();
  const releaseThird = await third;
  expect(ownership.snapshot().tab).toMatchObject({ runId: "third" });
  releaseThird();
  expect(ownership.snapshot().tab).toBeUndefined();
});

it("releases earlier pages when a multi-page claim is cancelled", async () => {
  const ownership = new PageOwnership();
  const blocker = ownership.tryAcquire({ pageId: "b", actor: "external" });
  const abort = new AbortController();
  const pending = ownership.acquireMany(["b", "a", "a"], { actor: "coordinator", runId: "run" }, abort.signal);
  await Promise.resolve();
  expect(ownership.snapshot().a).toMatchObject({ runId: "run" });
  abort.abort();
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  expect(ownership.snapshot().a).toBeUndefined();
  blocker();
});
