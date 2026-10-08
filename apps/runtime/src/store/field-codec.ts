import { createHash, createHmac } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { NativeBridge } from "../native.js";
import { ProtectedStore } from "../services/protected-store.js";
import { protectLegacyTaskEvidence, taskEvidenceProtection } from "./task-evidence-protection.js";

const PREFIX = "auxenc:v3:";
const NAME = /^[a-z][a-z0-9_]*$/;
type Secrets = Pick<NativeBridge, "readSecret" | "storeSecret"> & {
  profileStorageRoot?: (args: { version: 1 }) => Promise<{ value: string }>;
  profileStorageFactor?: (args: { version: 1; purpose: "sqlite" }) => Promise<{ value: string }>;
};

/** Runtime content and account metadata use this codec. Memory owns its generation keys. */
export const ENCRYPTED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  subagents: ["body"],
  runs: ["goal", "config", "status_message", "result", "error", "failure"],
  run_messages: ["text", "context_page_refs", "mentions", "error"],
  run_transcript: ["message", "park"],
  conversations: ["title"],
  safety_send_journal: ["text"],
  safety_approval_requests: ["action_json"],
  coding_file_receipts: ["receipt", "summary"],
  coding_process_receipts: ["receipt"],
  coding_process_logs: ["text"],
  coding_repl_calls: ["signature", "response"],
  coding_repl_cells: ["source"],
  coder_worktree_receipts: ["body"],
  model_calls: ["provider_metadata"],
  calendar_connections: ["account_key", "label", "secret_name", "scopes"],
  task_evidence: ["json"],
};
/** Restorable v2/v3 snapshots predate the separate encrypted process log table. */
export function encryptedFieldsForDatabase(db: DatabaseSync): typeof ENCRYPTED_FIELDS {
  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  if (version !== 2 && version !== 3 && version !== 4)
    throw new Error("Unsupported encrypted database schema.");
  const evidence = taskEvidenceProtection(db);
  if (evidence && evidence.cursor !== null)
    throw new Error("Task evidence protection must finish before backup or recovery.");
  return Object.fromEntries(
    Object.entries(ENCRYPTED_FIELDS).filter(
      ([table]) =>
        (version >= 4 || table !== "coding_process_logs") && (evidence || table !== "task_evidence"),
    ),
  );
}

export const encryptedField = (table: string, column: string): boolean =>
  ENCRYPTED_FIELDS[table]?.includes(column) ?? false;

/** AAD binds every value to its Profile, table, row and column. */
export class FieldCodec {
  private constructor(
    private readonly protectedStore: ProtectedStore,
    private readonly key: Buffer,
  ) {}

  static async create(secrets: Secrets, profileId: string, create: boolean) {
    const factorName = `sqlite_factor_v1_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
    let value = (await secrets.readSecret(factorName)).value;
    if (!value) {
      if (!create)
        throw new Error(
          "The protected database factor is missing. Restore its OS credential store or use reviewed recovery.",
        );
      if (!secrets.profileStorageFactor)
        throw new Error("Atomic protected database factor creation is unavailable.");
      const created = (await secrets.profileStorageFactor({ version: 1, purpose: "sqlite" })).value;
      value = (await secrets.readSecret(factorName)).value;
      if (value !== created) throw new Error("The protected database factor could not be confirmed.");
    }
    const factor = Buffer.from(value, "base64");
    if (factor.length !== 32 || factor.toString("base64") !== value)
      throw new Error("The protected database factor is invalid.");
    const protectedStore = new ProtectedStore(secrets, profileId);
    const key = await protectedStore.generationKey("runtime-sqlite-v3", factor, create);
    return new FieldCodec(protectedStore, key);
  }

  protects(table: string, column: string): boolean {
    return encryptedField(table, column);
  }

  encrypt(table: string, rowId: string | number, column: string, value: string): string {
    if (!NAME.test(table) || !NAME.test(column) || !String(rowId))
      throw new Error("Protected database field identity is invalid.");
    return (
      PREFIX +
      this.protectedStore.seal(
        this.key,
        "runtime-sqlite-v3",
        `${table}/${rowId}/${column}`,
        Buffer.from(value),
      )
    );
  }

  decrypt(table: string, rowId: string | number, column: string, value: string): string {
    if (!value.startsWith(PREFIX))
      throw new Error("Protected database field is plaintext or has an unknown version.");
    return this.protectedStore
      .open(this.key, "runtime-sqlite-v3", `${table}/${rowId}/${column}`, value.slice(PREFIX.length))
      .toString("utf8");
  }

  isEncrypted(value: string) {
    return value.startsWith(PREFIX);
  }

  exactLookup(table: string, column: string, value: string): string {
    if (!NAME.test(table) || !NAME.test(column))
      throw new Error("Protected database lookup identity is invalid.");
    return `auxidx:v3:${createHmac("sha256", this.key).update(`sqlite-exact:v3\0${table}\0${column}\0${value}`).digest("hex")}`;
  }
}

/** Fetch the Profile key; completed evidence conversions take a constant-time proof check. */
export async function initializeFieldCodec(
  db: DatabaseSync,
  native: Secrets,
  profileId: string,
): Promise<FieldCodec> {
  if (!profileId) throw new Error("Encrypted storage requires a Profile identity.");
  const initialized = !!db.prepare("SELECT 1 FROM aux_meta WHERE key='field_codec_v3'").get();
  const codec = await FieldCodec.create(native, profileId, !initialized);
  if (!initialized) db.prepare("INSERT INTO aux_meta(key,value) VALUES('field_codec_v3','1')").run();
  await protectLegacyTaskEvidence(db, codec);
  return codec;
}
