import { createHash } from "node:crypto";
import { PERSON_OBSERVER_WRAPPED_SOURCE } from "@aux/chromium-driver";
import { AuxError, type ObservationContent, NativePersonReadParamsSchema, NativePersonReadReceiptSchema,
  NativePersonReadContextSchema, type NativePersonReadContext, type PersonReadRequest } from "@aux/contracts";

import { NativePersonObservedValueSchema, NativePersonExtractedValueSchema } from "./native-person-read-value.js";

/** Transport is the authenticated native host channel, never a page/CDP session. */
export interface NativePersonReadTransport {
  read(input: { pageId: string; request: PersonReadRequest }): Promise<unknown>;
}
const producerSha256 = createHash("sha256").update(PERSON_OBSERVER_WRAPPED_SOURCE).digest("hex");
function assertIdentity(pageId: string, receipt: Pick<NativePersonReadContext, "pageId" | "producerSha256">) {
  if (receipt.pageId !== pageId || receipt.producerSha256 !== producerSha256)
    throw new AuxError("backend_unavailable", "The native page reader does not match this runtime.");
}
export function parsePersonReadContext(pageId: string, raw: unknown): NativePersonReadContext {
  const context = NativePersonReadContextSchema.parse(raw);
  assertIdentity(pageId, context);
  return context;
}
export class NativePersonReader {
  constructor(private readonly transport: NativePersonReadTransport) {}
  private async read(pageId: string, request: PersonReadRequest, current: () => boolean) {
    if (!current()) throw new AuxError("target_detached", "This page changed before it could be read.");
    const input = NativePersonReadParamsSchema.parse({ pageId, request });
    const raw = await this.transport.read(input);
    if (!current()) throw new AuxError("target_detached", "This page changed while it was being read.");
    const receipt = NativePersonReadReceiptSchema.parse(raw);
    assertIdentity(pageId, receipt);
    const serialized = JSON.stringify(receipt.value);
    if (typeof serialized !== "string" || Buffer.byteLength(serialized, "utf8") > 131072)
      throw new AuxError("backend_unavailable", "This page read exceeded its bounded response.");
    return receipt;
  }
  async observe(pageId: string, request: Omit<Extract<PersonReadRequest, { operation: "observe" }>, "operation">, current: () => boolean):
    Promise<{ documentId: string; sessionId: string; content: ObservationContent }> {
    const receipt = await this.read(pageId, { operation: "observe", ...request }, current);
    const value = NativePersonObservedValueSchema.parse(receipt.value);
    if (value.elements.length > request.maxElements || value.text.length > request.maxTextChars)
      throw new AuxError("backend_unavailable", "The native page read exceeded its requested limits.");
    const { nextRef: _nextRef, elementsTotal, ...content } = value;
    return { documentId: receipt.documentId, sessionId: receipt.sessionId, content: { ...content,
      frames: [{ frame: "main", url: content.url, sameOrigin: true }],
      stats: { elementsTotal, elementsShown: content.elements.length, textChars: content.text.length,
        approxTokens: Math.ceil((content.text.length + content.elements.length * 60) / 4) } } };
  }
  async extract(pageId: string, fields: Extract<PersonReadRequest, { operation: "extract" }>["fields"],
    current: () => boolean): Promise<{ documentId: string; sessionId: string; fields: Record<string, string | string[] | null> }> {
    const receipt = await this.read(pageId, { operation: "extract", fields }, current);
    const value = NativePersonExtractedValueSchema.parse(receipt.value);
    const names = new Set(fields.map(field => field.name));
    if (Object.keys(value).length !== names.size || Object.keys(value).some(name => !names.has(name)))
      throw new AuxError("backend_unavailable", "The native extract result does not match its request.");
    return { documentId: receipt.documentId, sessionId: receipt.sessionId, fields: value };
  }
}
