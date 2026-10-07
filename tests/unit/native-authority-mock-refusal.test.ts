import { expect, it } from "vitest";
import { NativeRecorderStartedSchema, NativeCdpNavigationReceiptSchema } from "@aux/contracts";
import { createMockHost } from "../../apps/shell/src/host/mock.generated.js";

it.each([
  "native.contentBlockOperation",
  "native.foundationModelsStatus",
  "native.foundationModelsStart",
  "native.foundationModelsRead",
  "native.foundationModelsCancel",
  "native.cdpReset",
  "native.cdpCatalog",
  "native.cdpAttach",
  "native.cdpStartNavigation",
  "native.cdpTakeNavigationReceipt",
  "native.cdpDispatch",
  "native.egressContext",
  "native.egressInstall",
  "native.egressRevoke",
  "native.egressResumePerson",
  "native.egressResumeRun",
  "native.egressCheckRunResume",
  "native.egressRunTerminal",
  "native.createAgentPage",
  "native.creatorCleanupProof",
  "native.closeCreatedPage",
  "native.recorderStart",
  "native.recorderDrain",
  "native.recorderStop",
  "native.personRead",
  "native.personReadContext",
  "native.permissionRetire",
] as const)("browser mock cannot manufacture %s native authority", async (name) => {
  const host = createMockHost();
  await expect(Reflect.apply(Reflect.get(host, name), host, [{}])).rejects.toMatchObject({
    code: "backend_unavailable",
  });
});
it.each(["malformed", "0", "-1", "1e2", "18446744073709551616"])(
  "invalid native recorder generation %s returns schema refusal",
  (documentGeneration) => {
    expect(
      NativeRecorderStartedSchema.safeParse({
        recorderId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        documentGeneration,
        producerSha256: "a".repeat(64),
      }).success,
    ).toBe(false);
  },
);
it.each(["malformed", "0", "-1", "1e2", "9223372036854775808"])(
  "invalid native navigation ID %s returns schema refusal",
  (navigationId) => {
    expect(
      NativeCdpNavigationReceiptSchema.safeParse({
        originalAttachmentId: "A".repeat(32),
        originalLeaseId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        commandId: 1,
        navigationTransitionId: "B".repeat(32),
        navigationId,
        url: "https://fixture.test",
        context: {
          profileId: "profile",
          tabId: "page",
          frameId: "frame",
          documentToken: "document",
          sourceOrigin: "https://fixture.test",
          controlGeneration: "control",
          personControlled: false,
        },
      }).success,
    ).toBe(false);
  },
);
