import { expect, it, vi } from "vitest";
import { memoryMethods } from "../../apps/runtime/src/api/methods/memory.js";

it("refreshes and revokes active context after successful Memory changes only", async () => {
  const emit = vi.fn();
  const revokeWorkspaceContext = vi.fn();
  const review = vi.fn().mockResolvedValue({ accepted: true, remaining: 0 });
  const forget = vi.fn().mockResolvedValueOnce({ forgotten: 0, remaining: 1 })
    .mockResolvedValueOnce({ forgotten: 1, remaining: 0 });
  const context = (method: "memory.pipeline.review" | "memory.pipeline.forget") => ({
    client: { external: false, codeMode: false }, method,
    params: { workspaceId: "space-1", claimId: "11669024-a817-444b-bafa-7622510e51a2", decision: "accept" },
    revokeWorkspaceContext, s: { memoryPipeline: { review, forget }, events: { emit } },
  }) as unknown as Parameters<NonNullable<(typeof memoryMethods)[typeof method]>>[0];

  await memoryMethods["memory.pipeline.review"]!(context("memory.pipeline.review"));
  expect(revokeWorkspaceContext).toHaveBeenCalledWith("space-1", false);
  expect(emit).toHaveBeenCalledWith("workspace.memory.updated", { workspaceId: "space-1" });

  revokeWorkspaceContext.mockClear();
  emit.mockClear();
  await memoryMethods["memory.pipeline.forget"]!(context("memory.pipeline.forget"));
  expect(revokeWorkspaceContext).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();

  await memoryMethods["memory.pipeline.forget"]!(context("memory.pipeline.forget"));
  expect(revokeWorkspaceContext).toHaveBeenCalledWith("space-1", false);
  expect(emit).toHaveBeenCalledWith("workspace.memory.updated", { workspaceId: "space-1" });

  review.mockRejectedValueOnce(new Error("source changed"));
  revokeWorkspaceContext.mockClear();
  emit.mockClear();
  await expect(memoryMethods["memory.pipeline.review"]!(context("memory.pipeline.review")))
    .rejects.toThrow("source changed");
  expect(revokeWorkspaceContext).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();
});
