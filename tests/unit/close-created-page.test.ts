import { expect, it, vi } from "vitest";
import { AuxError, type PageTarget } from "@aux/contracts";
import { closeCreatedPage } from "../../apps/runtime/src/services/close-created-page.js";

const original: PageTarget = {
  pageId: "created",
  backend: "aux",
  targetId: "target",
  sessionId: "attachment",
  url: "https://source.test/",
  title: "Created",
  documentEpoch: 1,
  lastRevision: 0,
  viewStatus: "background",
  controller: "agent",
  controllerEpoch: 0,
  ownedByRuntime: true,
  createdAt: 1,
  lastActiveAt: 1,
  agentIsolation: {
    isolationId: "isolation",
    runId: "run",
    taskRevision: 0,
    inMemory: true,
    cookies: "empty",
  },
};

it.each([
  { name: "missing attachment", change: { sessionId: undefined } },
  { name: "replacement attachment", change: { sessionId: "replacement" } },
  { name: "replacement target", change: { targetId: "replacement" } },
  { name: "replaced document", change: { documentEpoch: 2 } },
  { name: "person takeover", change: { controller: "human" as const } },
  { name: "later controller", change: { controllerEpoch: 1 } },
  { name: "detached target", change: { viewStatus: "detached" as const } },
  { name: "different creator", change: { agentIsolation: { ...original.agentIsolation!, runId: "other" } } },
  { name: "borrowed page", change: { ownedByRuntime: false } },
])("refuses cleanup of $name", async ({ change }) => {
  const close = vi.fn(async () => {});
  await closeCreatedPage({ get: () => ({ ...original, ...change }), closeCreated: close }, original, "run");
  expect(close).not.toHaveBeenCalled();
});

it("closes only the original current temporary attachment", async () => {
  const close = vi.fn(async () => {});
  await closeCreatedPage({ get: () => structuredClone(original), closeCreated: close }, original, "run");
  expect(close).toHaveBeenCalledExactlyOnceWith(original, "run");
});

it("preserves the primary cancellation when lookup of a detached page fails", async () => {
  const close = vi.fn(async () => {});
  const cancelled = new AuxError("cancelled", "Creator cancelled");
  const creator = async () => {
    try {
      throw cancelled;
    } catch (error) {
      await closeCreatedPage(
        {
          get: () => {
            throw new AuxError("not_found", "Detached");
          },
          closeCreated: close,
        },
        original,
        "run",
      );
      throw error;
    }
  };
  await expect(creator()).rejects.toBe(cancelled);
  expect(close).not.toHaveBeenCalled();
});

it("refuses a borrowed original even if a later row reports runtime ownership", async () => {
  const close = vi.fn(async () => {});
  await closeCreatedPage(
    { get: () => structuredClone(original), closeCreated: close },
    { ...original, ownedByRuntime: false },
    "run",
  );
  expect(close).not.toHaveBeenCalled();
});

it("retains a genuine native cleanup failure instead of claiming the original attachment closed", async () => {
  const failure = new AuxError("ref_stale", "Native final close authority was retired");
  const closeCreated = vi.fn(async () => {
    throw failure;
  });
  await expect(
    closeCreatedPage({ get: () => structuredClone(original), closeCreated }, original, "run"),
  ).rejects.toBe(failure);
  expect(closeCreated).toHaveBeenCalledExactlyOnceWith(original, "run");
});
