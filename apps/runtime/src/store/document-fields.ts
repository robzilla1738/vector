import type { DatabaseSync } from "node:sqlite";
import {
  DOCUMENT_BODY_PREFIX,
  DOCUMENT_COLLECTION_PREFIX,
  documentExcerptIdentity,
  DOCUMENT_COLLECTION_PROOF_PREFIX,
  documentCollectionProofKey,
} from "@aux/contracts/document-storage";
import type { FieldCodec } from "./field-codec.js";

/** These historical and metadata-only KV fields have explicit identities, unlike ordinary settings. */
export function transformDocumentFields(
  db: DatabaseSync,
  cipher: FieldCodec,
  operation: "authenticate" | "encrypt" | "decrypt",
): string[] {
  let found = false;
  const transform = (identity: string[], column: string, value: string) => {
    if (operation === "authenticate") {
      cipher.decrypt("kv", JSON.stringify(identity), column, value);
      return value;
    }
    return cipher[operation]("kv", JSON.stringify(identity), column, value);
  };
  for (const prefix of [DOCUMENT_BODY_PREFIX, DOCUMENT_COLLECTION_PREFIX]) {
    const full = `setting:${prefix}`;
    let after = "";
    for (;;) {
      const row = db
        .prepare("SELECT key,value FROM kv WHERE key>? AND substr(key,1,length(?))=? ORDER BY key LIMIT 1")
        .get(after, full, full) as { key: string; value: string } | undefined;
      if (!row) break;
      after = row.key;
      found = true;
      const value: unknown = JSON.parse(row.value);
      if (prefix === DOCUMENT_COLLECTION_PREFIX)
        authenticateDocumentCollection(
          db,
          cipher,
          row.key,
          typeof value === "string",
          operation === "encrypt",
        );
      const collection = (items: unknown) => {
        if (!Array.isArray(items)) throw new Error("The protected document metadata is invalid.");
        return items.map((record: unknown) => {
          if (!record || typeof record !== "object")
            throw new Error("The legacy document metadata is invalid.");
          if (!("excerptCiphertext" in record)) return record;
          if (
            !("attachmentId" in record) ||
            typeof record.attachmentId !== "string" ||
            typeof record.excerptCiphertext !== "string"
          )
            throw new Error("The protected document preview is invalid.");
          return {
            ...record,
            excerptCiphertext: transform(
              documentExcerptIdentity(row.key.slice(full.length), record.attachmentId),
              "excerpt",
              record.excerptCiphertext,
            ),
          };
        });
      };
      let next: unknown;
      if (typeof value === "string") {
        if (prefix === DOCUMENT_BODY_PREFIX) next = transform([row.key], "value", value);
        else if (operation === "encrypt")
          next = transform([row.key], "value", JSON.stringify(collection(JSON.parse(value))));
        else {
          const clear = cipher.decrypt("kv", JSON.stringify([row.key]), "value", value);
          const decoded = collection(JSON.parse(clear));
          next = operation === "decrypt" ? JSON.stringify(decoded) : value;
        }
      } else {
        if (prefix !== DOCUMENT_COLLECTION_PREFIX) throw new Error("The protected document body is invalid.");
        next = collection(value);
      }
      if (operation !== "authenticate")
        db.prepare("UPDATE kv SET value=? WHERE key=?").run(JSON.stringify(next), row.key);
    }
  }
  const tables = found ? ["kv"] : [];
  const proofs = db
    .prepare("SELECT key,value FROM aux_meta WHERE substr(key,1,length(?))=?")
    .all(DOCUMENT_COLLECTION_PROOF_PREFIX, DOCUMENT_COLLECTION_PROOF_PREFIX) as {
    key: string;
    value: string;
  }[];
  if (proofs.length) tables.push("aux_meta");
  for (const proof of proofs) {
    const key = proof.key.slice(DOCUMENT_COLLECTION_PROOF_PREFIX.length);
    const value =
      operation === "encrypt"
        ? proof.value
        : cipher.decrypt("aux_meta", JSON.stringify([proof.key]), "value", proof.value);
    if (value !== collectionProofValue(key))
      throw new Error("The document collection protection proof is invalid.");
    if (operation !== "authenticate")
      db.prepare("UPDATE aux_meta SET value=? WHERE key=?").run(
        operation === "encrypt"
          ? cipher.encrypt("aux_meta", JSON.stringify([proof.key]), "value", value)
          : value,
        proof.key,
      );
  }
  return tables;
}

const collectionProofValue = (key: string) => JSON.stringify(["aux-document-collection-v1", key]);

export function authenticateDocumentCollection(
  db: DatabaseSync,
  cipher: FieldCodec | undefined,
  key: string,
  sealed: boolean,
  portablePlain = false,
) {
  const proofKey = documentCollectionProofKey(key);
  const proof = db.prepare("SELECT value FROM aux_meta WHERE key=?").get(proofKey) as
    { value: string } | undefined;
  if (!proof) {
    if (sealed) throw new Error("The protected document collection is missing its original proof.");
    return;
  }
  const value =
    cipher && !portablePlain
      ? cipher.decrypt("aux_meta", JSON.stringify([proofKey]), "value", proof.value)
      : proof.value;
  if (value !== collectionProofValue(key) || !sealed)
    throw new Error("The document collection cannot return to a plaintext legacy layout.");
}

export function markDocumentCollectionProtected(
  db: DatabaseSync,
  cipher: FieldCodec | undefined,
  key: string,
) {
  const proofKey = documentCollectionProofKey(key);
  const clear = collectionProofValue(key);
  const proof = cipher ? cipher.encrypt("aux_meta", JSON.stringify([proofKey]), "value", clear) : clear;
  db.prepare(
    "INSERT INTO aux_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  ).run(proofKey, proof);
}

/** Old inline metadata is protected in a portable copy before publication; layout conversion remains lazy. */
export function protectLegacyDocumentCollections(db: DatabaseSync, cipher: FieldCodec) {
  const prefix = `setting:${DOCUMENT_COLLECTION_PREFIX}`;
  let after = "";
  for (;;) {
    const row = db
      .prepare("SELECT key,value FROM kv WHERE key>? AND substr(key,1,length(?))=? ORDER BY key LIMIT 1")
      .get(after, prefix, prefix) as { key: string; value: string } | undefined;
    if (!row) return;
    after = row.key;
    const records: unknown = JSON.parse(row.value);
    if (typeof records === "string") continue;
    if (!Array.isArray(records)) throw new Error("The legacy document metadata is invalid.");
    db.prepare("UPDATE kv SET value=? WHERE key=?").run(
      JSON.stringify(cipher.encrypt("kv", JSON.stringify([row.key]), "value", row.value)),
      row.key,
    );
    markDocumentCollectionProtected(db, cipher, row.key);
  }
}

/** Only physically present document fields participate in portable recovery inventory. */
export function documentFieldTables(db: DatabaseSync): string[] {
  const tables: string[] = [];
  if (
    [DOCUMENT_BODY_PREFIX, DOCUMENT_COLLECTION_PREFIX].some((prefix) => {
      const full = `setting:${prefix}`;
      return !!db.prepare("SELECT 1 FROM kv WHERE substr(key,1,length(?))=? LIMIT 1").get(full, full);
    })
  )
    tables.push("kv");
  if (
    db
      .prepare("SELECT 1 FROM aux_meta WHERE substr(key,1,length(?))=? LIMIT 1")
      .get(DOCUMENT_COLLECTION_PROOF_PREFIX, DOCUMENT_COLLECTION_PROOF_PREFIX)
  )
    tables.push("aux_meta");
  return tables;
}
