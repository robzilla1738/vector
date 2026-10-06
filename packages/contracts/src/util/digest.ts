import { createHash, type BinaryLike } from "node:crypto";

/** SHA-256 of bytes or UTF-8 text, returned as lowercase hexadecimal. Node-only. */
export function digest(value: BinaryLike): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Preserve JSON.stringify property order and its existing invalid-input behavior. */
export function jsonDigest(value: unknown): string {
  return digest(JSON.stringify(value));
}
