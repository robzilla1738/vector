import { randomUUID } from "node:crypto";
import type { MemoryModelJob } from "../../apps/runtime/src/agent/model-client.js";
import { memoryModelSource } from "../../apps/runtime/dist/services/memory-model-source.js";

export function memoryTestJob(operation: MemoryModelJob["operation"]): MemoryModelJob {
  return {
    workspaceId: "fixture-space",
    operationId: randomUUID(),
    operation,
    modelGeneration: "fixture-model-generation",
    memoryGeneration: null,
    ownerRevision: 0,
    sourceDigest: "a".repeat(64),
    policyDigest: "b".repeat(64),
  };
}
export function memoryTestSource(job: MemoryModelJob, checkCurrent: () => void) {
  return memoryModelSource(job, {
    profileId: "fixture-profile",
    checkCurrent,
    modelGeneration: () => job.modelGeneration,
    safetyGate: { checkTrustedEffect: async () => undefined },
  });
}
