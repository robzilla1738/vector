import { describe, expect, it } from "vitest";
import {
  NativeCdpAttachedSchema,
  NativeCdpAttachSchema,
  NativeCdpDispatchSchema,
  NativeCdpNavigationReceiptSchema,
  NativeCdpStartNavigationSchema,
  NativeCdpNavigationStateSchema,
} from "@aux/contracts";
const pageId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const leaseId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const attachmentId = "0123456789ABCDEF0123456789ABCDEF";
describe("original native CDP attachment envelopes", () => {
  it("retains exact original command and browser navigation identity for one-use transition", () => {
    const receipt = {
      originalAttachmentId: attachmentId,
      originalLeaseId: leaseId,
      commandId: 7,
      url: "https://example.test/committed",
      navigationId: "9223372036854775807",
      navigationTransitionId: "F".repeat(32),
      context: {
        profileId: "profile",
        tabId: pageId,
        frameId: "new-frame",
        documentToken: "new-document",
        sourceOrigin: "https://example.test",
        controlGeneration: "new-control",
        personControlled: false,
      },
    };
    expect(NativeCdpNavigationReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(
      NativeCdpNavigationReceiptSchema.safeParse({ ...receipt, navigationId: "9223372036854775808" }).success,
    ).toBe(false);
    expect(NativeCdpNavigationReceiptSchema.safeParse({ ...receipt, commandId: 0 }).success).toBe(false);
    expect(
      NativeCdpNavigationReceiptSchema.safeParse({ ...receipt, navigationTransitionId: "0".repeat(32) })
        .success,
    ).toBe(false);
    expect(NativeCdpNavigationReceiptSchema.safeParse({ ...receipt, scope: "observer" }).success).toBe(false);
  });

  it("accepts the native Token representation and rejects empty/UUID/substituted receipts", () => {
    expect(NativeCdpAttachedSchema.parse({ attachmentId })).toEqual({ attachmentId });
    for (const invalid of ["0".repeat(32), pageId, attachmentId.toLowerCase(), "A".repeat(31)])
      expect(NativeCdpAttachedSchema.safeParse({ attachmentId: invalid }).success).toBe(false);
  });
  it("does not permit caller-selected observer or script authority", () => {
    const acknowledgedExpiresAt = 31000;
    expect(NativeCdpAttachSchema.parse({ pageId, leaseId, acknowledgedExpiresAt })).toEqual({
      pageId,
      leaseId,
      acknowledgedExpiresAt,
    });
    expect(NativeCdpAttachSchema.safeParse({ pageId, leaseId }).success).toBe(false);
    expect(
      NativeCdpAttachSchema.safeParse({ pageId, leaseId, acknowledgedExpiresAt, scope: "observer" }).success,
    ).toBe(false);
    expect(
      NativeCdpAttachSchema.safeParse({ pageId, leaseId, acknowledgedExpiresAt, script: "1" }).success,
    ).toBe(false);
  });
  it("requires the original attachment on each dispatch", () => {
    const message = JSON.stringify({ id: 1, method: "Runtime.enable" });
    const acknowledgedExpiresAt = 31000;
    expect(NativeCdpDispatchSchema.parse({ pageId, attachmentId, acknowledgedExpiresAt, message })).toEqual({
      pageId,
      attachmentId,
      acknowledgedExpiresAt,
      message,
    });
    expect(NativeCdpDispatchSchema.safeParse({ pageId, message }).success).toBe(false);
    expect(NativeCdpDispatchSchema.safeParse({ pageId, attachmentId, message }).success).toBe(false);
    for (const invalid of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity])
      expect(
        NativeCdpDispatchSchema.safeParse({ pageId, attachmentId, message, acknowledgedExpiresAt: invalid })
          .success,
      ).toBe(false);
    expect(
      NativeCdpDispatchSchema.safeParse({
        pageId,
        attachmentId,
        acknowledgedExpiresAt,
        message,
        runId: "new-run",
      }).success,
    ).toBe(false);
  });
});

describe("private controlled navigation protocol", () => {
  it("accepts only a fixed original website command and rejects caller script/frame overrides", () => {
    const original = {
      pageId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      attachmentId: "A".repeat(32),
      commandId: 7,
      acknowledgedExpiresAt: 31000,
      url: "https://example.test/next",
    };
    expect(NativeCdpStartNavigationSchema.parse(original)).toEqual(original);
    for (const url of [
      "about:blank",
      "chrome://newtab",
      "javascript:alert(1)",
      "https://person:secret@example.test/",
    ])
      expect(NativeCdpStartNavigationSchema.safeParse({ ...original, url }).success).toBe(false);
    for (const extra of [{ frameId: "child" }, { message: "Runtime.evaluate" }, { runId: "replacement" }])
      expect(NativeCdpStartNavigationSchema.safeParse({ ...original, ...extra }).success).toBe(false);
  });
  it("requires the original native page, attachment, lease and command on readiness", () => {
    const original = {
      pageId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      attachmentId: "A".repeat(32),
      commandId: 7,
      leaseId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      state: "ready",
    };
    expect(NativeCdpNavigationStateSchema.parse(original)).toEqual(original);
    expect(NativeCdpNavigationStateSchema.safeParse({ ...original, leaseId: undefined }).success).toBe(false);
    expect(NativeCdpNavigationStateSchema.safeParse({ ...original, state: "committed" }).success).toBe(false);
    expect(NativeCdpNavigationStateSchema.safeParse({ ...original, accepted: true }).success).toBe(false);
  });
});
