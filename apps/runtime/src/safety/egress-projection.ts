import { createHash } from "node:crypto";
import { EgressProjectionSchema, type EgressProjection } from "@aux/contracts";
const MAX_REQUEST_BYTES = 64 * 1024;

export const MEMORY_WINDOW = 12;
export function textFingerprints(text: string): Set<string> {
  const normalized = text.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ");
  const hashes = new Set<string>();
  for (let at = 0; at + MEMORY_WINDOW <= normalized.length; at++)
    hashes.add(
      createHash("sha256")
        .update(normalized.slice(at, at + MEMORY_WINDOW))
        .digest("hex"),
    );
  return hashes;
}

export function inspectableText(raw: string): string[] {
  const variants = [raw];
  for (let depth = 0; depth < 2; depth++) {
    try {
      variants.push(decodeURIComponent(variants.at(-1)!.replace(/\+/g, "%20")));
    } catch {
      break;
    }
  }
  // Common body/query encoding. Decoded data remains ephemeral and bounded.
  const encodedVariants = variants.slice(); // Decoding appends to variants; iterate the original inputs once.
  for (const text of encodedVariants)
    for (const candidate of text.match(/[A-Za-z0-9+/_-]{16,}={0,2}/g) ?? []) {
      if (candidate.replace(/=+$/, "").length % 4 === 1) continue;
      const decoded = Buffer.from(candidate, "base64");
      if (decoded.length < MEMORY_WINDOW || decoded.length > MAX_REQUEST_BYTES) continue;
      try {
        variants.push(new TextDecoder("utf-8", { fatal: true }).decode(decoded));
      } catch {
        /* Binary encodings do not create a text representation. */
      }
    }
  return [...new Set(variants)];
}

export function phraseHashes(text: string): Set<string> {
  const words =
    text
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? [];
  const hashes = new Set<string>();
  for (let at = 0; at + 4 <= words.length; at++) {
    const phrase = words.slice(at, at + 4).join(" ");
    if (phrase.length >= 20) hashes.add(createHash("sha256").update(phrase).digest("hex"));
  }
  return hashes;
}

/** Reference/golden implementation of the native projection algorithm, never a public API. */
export function projectEgressRequest(input: {
  url: string;
  method: string;
  body?: Uint8Array;
  headers?: Array<[string, string]>;
  phase?: "preflight" | "send";
  headersComplete?: boolean;
}): EgressProjection {
  const body = input.body ?? new Uint8Array();
  if (body.byteLength > MAX_REQUEST_BYTES) throw new Error("Body exceeds the inspectable bound");
  const text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  const headers = input.headers ?? [];
  const headerBytes = headers.reduce(
    (sum, [name, value]) => sum + Buffer.byteLength(name) + Buffer.byteLength(value) + 4,
    0,
  );
  if (headers.length > 128 || headerBytes > 16384 || Buffer.byteLength(input.url) > 2048)
    throw new Error("Request exceeds the inspectable bound");
  const fields = [input.url, ...headers.flat(), text];
  const textHashes = new Set<string>(),
    phrases = new Set<string>();
  for (const field of fields)
    for (const variant of inspectableText(field)) {
      for (const hash of textFingerprints(variant)) textHashes.add(hash);
      for (const hash of phraseHashes(variant)) phrases.add(hash);
    }
  const phase = input.phase ?? "send";
  const headersComplete = input.headersComplete ?? phase === "send";
  const digest = createHash("sha256");
  // Length-prefix UTF-8 bytes, in order. Header names are lowercase; order and
  // duplicates remain part of the exact request. No raw values leave this scope.
  const parts = [
    "aux-egress-v1",
    phase,
    input.method,
    input.url,
    headersComplete ? "complete" : "partial",
    String(headers.length),
    ...headers.flatMap(([name, value]) => [name.toLowerCase(), value]),
    text,
  ];
  for (const part of parts) digest.update(String(Buffer.byteLength(part)) + ":").update(part);
  return EgressProjectionSchema.parse({
    version: 1,
    phase,
    headersComplete,
    projectionComplete: true,
    urlDigest: createHash("sha256").update(input.url).digest("hex"),
    requestDigest: digest.digest("hex"),
    urlBytes: Buffer.byteLength(input.url),
    headerBytes,
    textHashes: [...textHashes].sort(),
    phraseHashes: [...phrases].sort(),
  });
}
