import { AuxError } from "@aux/contracts";
import type { DriverPage } from "@aux/chromium-driver";
import type { NativeCdpBroker } from "../../native-cdp-broker.js";
import type { BrowserEgress } from "../../safety/browser-egress.js";
import type { PageRegistry } from "./registry.js";
import type { MentionPage } from "../../agent/turn-mentions.js";

const receiptBrand = Symbol("native-controlled-attachment");
export interface ControlledAttachmentNavigationReceipt { readonly [receiptBrand]: true }
const receipts = new WeakMap<ControlledAttachmentNavigationReceipt, {
  runId: string; original: MentionPage; page: MentionPage; mentionAuthority?: () => void; consumed: boolean; current(): boolean; publish(): void; cancel(): Promise<void>;
}>();

/** Consume only an actual completed native continuation, never caller fields. */
export function consumeControlledAttachmentNavigation(receipt: ControlledAttachmentNavigationReceipt,
  runId: string, pageId: string, original: MentionPage, mentionAuthority: () => void): MentionPage | null {
  const retained = receipts.get(receipt);
  if (!retained || retained.consumed) return null;
  retained.consumed = true;
  if (retained.mentionAuthority !== mentionAuthority || retained.runId !== runId || retained.original.pageId !== pageId
    || retained.original.sessionId !== original.sessionId || retained.original.url !== original.url
    || retained.original.documentEpoch !== original.documentEpoch || !retained.current()) return null;
  mentionAuthority();
  return { ...retained.page };
}

/** Original receipt cleanup remains available until outer turn publication. */
export async function retireControlledAttachmentNavigation(receipt: ControlledAttachmentNavigationReceipt): Promise<void> {
  const retained = receipts.get(receipt);
  receipts.delete(receipt);
  await retained?.cancel();
}
export function finalizeControlledAttachmentNavigation(receipt: ControlledAttachmentNavigationReceipt): void {
  const retained = receipts.get(receipt);
  if (!retained?.consumed || !retained.current())
    throw new AuxError("ref_stale", "The consumed native navigation source changed before turn publication.");
  retained.publish();
  receipts.delete(receipt);
}

export interface ControlledNavigationReadmission {
  driver: DriverPage; receipt: ControlledAttachmentNavigationReceipt;
}

/** One original native command through a real replacement driver incarnation. */
export async function navigateControlledPage(input: {
  runId: string; pageId: string; url: string; signal?: AbortSignal;
  validateSource(): void;
  /** Exact closure minted by the original active mention navigation, never serialized. */
  mentionAuthority?: () => void;
  revalidateMentionSource?: () => Promise<void>;
}, pages: PageRegistry, egress: BrowserEgress, cdp: Pick<NativeCdpBroker, "navigateControlled" | "navigationDeadline">): Promise<ControlledNavigationReadmission> {
  input.validateSource();
  if (input.mentionAuthority && !input.revalidateMentionSource)
    throw new AuxError("permission_denied", "Original mention source revalidation is unavailable.");
  const live = pages.live.get(input.pageId);
  if (!live?.target.sessionId) throw new AuxError("ref_stale", "The original navigation session is unavailable.");
  const originalPage: MentionPage = { pageId: input.pageId, url: live.target.url,
    documentEpoch: live.target.documentEpoch, sessionId: live.target.sessionId };
  const attachment = pages.beginControlledTransition(input.pageId);
  let receiptDeadline: number | undefined;
  let readmitted: { driver: DriverPage; sessionId: string } | undefined;
  let signal = input.signal;
  const check = () => {
    input.validateSource();
    input.mentionAuthority?.();
    const current = readmitted
      ? pages.live.get(input.pageId) === live && live.driver === readmitted.driver
        && live.target.sessionId === readmitted.sessionId && readmitted.driver.isAttached()
      : attachment.current();
    if (signal?.aborted || !current || (receiptDeadline !== undefined && Date.now() >= receiptDeadline))
      throw new AuxError("ref_stale", "The original navigation attachment or source changed.");
  };
  let authority: ReturnType<BrowserEgress["captureControlledNavigation"]> | undefined;
  try {
    authority = egress.captureControlledNavigation(input.runId, input.pageId, check);
    // The original native authority supplies mandatory retirement cancellation.
    // A caller signal can narrow it, but its absence never supplies authority.
    signal = input.signal ? AbortSignal.any([input.signal, authority.signal]) : authority.signal;
    const receipt = await cdp.navigateControlled(input.pageId, input.url, signal);
    check();
    receiptDeadline = Math.min(authority.expiresAt, cdp.navigationDeadline(receipt));
    await attachment.waitRetired(receiptDeadline, signal, check);
    check();
    const lease = await authority.install(receipt, document => attachment.stage(document, check), receiptDeadline);
    check();
    const original = pages.get(input.pageId);
    const driver = await attachment.attach({ url: receipt.url, documentEpoch: original.documentEpoch }, () => authority!.check());
    if (pages.live.get(input.pageId) !== live || live.driver !== driver || !live.target.sessionId)
      throw new AuxError("ref_stale", "The new navigation driver changed before its incarnation was admitted.");
    readmitted = { driver, sessionId: live.target.sessionId };
    check();
    await input.revalidateMentionSource?.();
    check();
    if (signal?.aborted) throw new AuxError("cancelled", "Navigation was cancelled before driver readmission.");
    authority.complete();
    if (!input.mentionAuthority) authority.publish(input.validateSource);
    const cdpAuthority = egress.captureCdpAuthority(input.pageId, lease);
    const admittedPage: MentionPage = { pageId: input.pageId, url: live.target.url,
      documentEpoch: live.target.documentEpoch, sessionId: readmitted.sessionId };
    const token: ControlledAttachmentNavigationReceipt = Object.freeze<ControlledAttachmentNavigationReceipt>({ [receiptBrand]: true });
    receipts.set(token, { runId: input.runId, original: originalPage, page: admittedPage, mentionAuthority: input.mentionAuthority, consumed: false, publish: () => authority!.publish(input.validateSource), cancel: async () => {
      const outcomes = await Promise.allSettled([authority!.cancel(), attachment.cancel()]);
      const errors = outcomes.flatMap(outcome => outcome.status === "rejected" ? [outcome.reason] : []);
      if (errors.length) throw new AggregateError(errors, "Original navigation authority and attachment cleanup failed");
    }, current: () => {
      input.validateSource();
      return !signal?.aborted && Date.now() < receiptDeadline! && cdpAuthority.current() && pages.live.get(input.pageId) === live
        && live.driver === driver && driver.isAttached() && live.target.sessionId === admittedPage.sessionId
        && live.target.url === admittedPage.url && live.target.documentEpoch === admittedPage.documentEpoch;
    } });
    return { driver, receipt: token };
  } catch (error) {
    // Both producers retire their runtime rows synchronously before awaiting
    // original native ACKs/driver disposal. Retain both cleanup failures.
    const outcomes = await Promise.allSettled([authority?.cancel(), attachment.cancel()]);
    const cleanupErrors = outcomes.flatMap(outcome => outcome.status === "rejected" ? [outcome.reason] : []);
    if (cleanupErrors.length) throw new AggregateError([error, ...cleanupErrors], "Controlled navigation and original authority retirement failed", { cause: error });
    throw error;
  }
}
