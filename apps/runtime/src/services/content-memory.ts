import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import {
  AuxError,
  ContentMemoryPolicySchema,
  type ContentMemoryPolicy,
  type HistoryEntry,
} from "@aux/contracts";
import { memoryOrigin, memoryOriginAllowed, memorySourceExcluded } from "@aux/contracts/memory-context";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import { readWorkspaceMemory } from "./workspace-memory.js";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { NativeBridge } from "../native.js";
import {
  LocalMemoryEmbeddings,
  embeddingVector,
  cosineSimilarity,
  type LocalEmbeddingModel,
} from "./local-memory-embeddings.js";
import { ProtectedStore } from "./protected-store.js";

const DAY = 86_400_000;
const MAX_TEXT_BYTES = 64 * 1024;
const MAX_PAGES_PER_SPACE = 500;
const MAX_INDEXED_SPACES = 2;

type Policy = ContentMemoryPolicy;
type RecordBody = {
  memoryId: string;
  profileId: string;
  workspaceId: string;
  pageId: string;
  documentEpoch: number;
  sessionId?: string;
  url: string;
  title: string;
  text: string;
  capturedAt: number;
};
export type RecoveryPageMemory = { body: RecordBody; expiresAt: number };
type Row = {
  memory_id: string;
  source_key: string;
  origin: string;
  captured_at: number;
  expires_at: number;
  ciphertext: string;
};
type Index = {
  revision: number;
  expiresAt: number;
  rows: Map<string, RecordBody>;
  searchable: Map<string, { title: string; text: string }>;
};

const policyKey = (workspaceId: string) => `contentMemoryPolicy:${workspaceId}`;
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "by",
  "did",
  "do",
  "does",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
]);
const terms = (text: string) => [
  ...new Set(
    [...new Intl.Segmenter(undefined, { granularity: "word" }).segment(text)]
      .filter((part) => part.isWordLike)
      .map((part) => part.segment.toLocaleLowerCase())
      .filter((part) => part.length > 1 && !STOPWORDS.has(part)),
  ),
];
const WORD_CHAR = /[\p{L}\p{N}]/u;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
function termPosition(text: string, token: string): number {
  let at = text.indexOf(token);
  if (CJK.test(token)) return at;
  while (at >= 0) {
    if (
      (!at || !WORD_CHAR.test(text[at - 1]!)) &&
      (at + token.length === text.length || !WORD_CHAR.test(text[at + token.length]!))
    )
      return at;
    at = text.indexOf(token, at + token.length);
  }
  return -1;
}

/** Page text is encrypted before SQLite sees it. Search structures exist only in bounded process memory. */
export class ContentMemoryStore {
  private keyPromise?: Promise<Buffer>;
  private protectedStore: ProtectedStore;
  private rotationQueue: Promise<unknown> = Promise.resolve();
  private indexes = new Map<string, Index>();
  private derivativeEpoch = 0;
  private unsubscribe?: () => void;
  private embeddings: LocalMemoryEmbeddings;
  private closed = false;
  private closing?: Promise<void>;
  private pending = new Set<Promise<unknown>>();
  private discoveryController = new AbortController();
  private semanticControllers = new Map<string, AbortController>();
  private historyControllers = new Set<AbortController>();
  private historyIndexes = new Map<string, { model: string; vectors: Map<string, number[]> }>();
  private historyEpoch = 0;

  private retireHistory(): void {
    this.historyEpoch++;
    for (const controller of this.historyControllers) controller.abort();
    this.historyIndexes.clear();
  }

  constructor(
    private repo: Repo,
    private native: Pick<NativeBridge, "readSecret" | "storeSecret">,
    private profileId: string,
    private now: () => number = Date.now,
    events?: EventBus,
    request: typeof fetch = fetch,
  ) {
    if (!profileId) throw new Error("Protected page memory requires a Profile identity.");
    this.embeddings = new LocalMemoryEmbeddings(request);
    this.protectedStore = new ProtectedStore(native, profileId);
    this.unsubscribe = events?.subscribe((event) => {
      if (
        event.type === "history.changed" ||
        event.type === "workspace.memory.updated" ||
        event.type === "workspace.contentMemory.updated"
      )
        this.retireHistory();
      if (event.type === "workspace.memory.updated" && typeof event.payload.workspaceId === "string") {
        this.indexes.delete(event.payload.workspaceId);
        this.retireSemantic(event.payload.workspaceId);
      }
    });
  }

  private own<T>(work: () => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new AuxError("cancelled", "Page memory is closed."));
    const pending = work();
    this.pending.add(pending);
    void pending.then(
      () => this.pending.delete(pending),
      () => this.pending.delete(pending),
    );
    return pending;
  }

  close(): Promise<void> {
    this.closed = true;
    this.discoveryController.abort();
    this.retireHistory();
    this.retireSemantic();
    this.unsubscribe?.();
    if (this.closing) return this.closing;
    const closing = (async () => {
      const embeddings = this.embeddings.close();
      const results = await Promise.allSettled([embeddings, ...this.pending]);
      if (results[0]?.status === "rejected") throw results[0].reason;
      await this.retirePendingFactors();
      this.indexes.clear();
      this.keyPromise = undefined;
    })();
    this.closing = closing;
    void closing.catch(() => {
      if (this.closing === closing) this.closing = undefined;
    });
    return closing;
  }

  private factorSetting() {
    return `pageMemoryFactorName:${this.profileId}`;
  }
  private retiredSetting() {
    return `pageMemoryRetiredFactors:${this.profileId}`;
  }
  private serialized<T>(work: () => Promise<T>): Promise<T> {
    const operation = this.rotationQueue.then(work);
    this.rotationQueue = operation.catch(() => undefined);
    return operation;
  }
  private factorName() {
    return (
      this.repo.getSetting<string>(this.factorSetting()) ??
      `pageMemoryFactorV2_${createHash("sha256").update(this.profileId).digest("hex").slice(0, 24)}`
    );
  }

  private async retirePendingFactors() {
    const pending = this.repo.getSetting<string[]>(this.retiredSetting()) ?? [];
    for (const name of pending) {
      if (name === this.factorName()) throw new Error("The active page-memory factor cannot be retired.");
      await this.native.storeSecret(name, "");
      if ((await this.native.readSecret(name)).value)
        throw new Error("A retired page-memory factor is still available in the OS credential store.");
      this.repo.setSetting(
        this.retiredSetting(),
        pending.filter((item) => item !== name),
      );
    }
  }

  private requireSpace(workspaceId: string) {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "This Space no longer exists.");
  }

  policy(workspaceId: string): Policy {
    this.requireSpace(workspaceId);
    const saved = this.repo.getSetting<unknown>(policyKey(workspaceId));
    if (saved === undefined && !this.repo.hasSetting(policyKey(workspaceId)))
      return { enabled: true, retentionDays: 30, allowedOrigins: [], originScope: "safe-sites" };
    const parsed = ContentMemoryPolicySchema.safeParse(saved);
    if (
      parsed.success &&
      parsed.data.allowedOrigins.every((origin) => {
        try {
          return origin === memoryOrigin(origin) && origin.startsWith("https://");
        } catch {
          return false;
        }
      })
    )
      return parsed.data;
    return { enabled: false, retentionDays: 30, allowedOrigins: [] };
  }

  /** Run before requesting readable text from the browser or native host. */
  assertCaptureEligible(input: {
    workspaceId: string;
    url: string;
    title: string;
    privateMode?: boolean;
  }): void {
    const policy = this.policy(input.workspaceId);
    const memory = readWorkspaceMemory(this.repo, input.workspaceId);
    let url: URL;
    try {
      url = new URL(input.url);
    } catch {
      throw new AuxError("permission_denied", "This page is not eligible for content recall.");
    }
    if (!policy.enabled || memory?.enabled === false)
      throw new AuxError("permission_denied", "Enable page-content recall in this Space first.");
    if (input.privateMode || memorySensitivityReason(input.url, input.title))
      throw new AuxError("permission_denied", "Sensitive pages cannot be saved to Memory.");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      input.url.length > 8192 ||
      !memoryOriginAllowed(policy, url.origin) ||
      (memory && memorySourceExcluded(memory, url.href))
    )
      throw new AuxError("permission_denied", "This page is not eligible for content recall.");
  }

  async setPolicy(
    workspaceId: string,
    policy: Policy,
    beforeRemoval?: () => void | Promise<void>,
  ): Promise<Policy> {
    return this.own(() => this.setPolicyOwned(workspaceId, policy, beforeRemoval));
  }

  private async setPolicyOwned(
    workspaceId: string,
    policy: Policy,
    beforeRemoval?: () => void | Promise<void>,
  ): Promise<Policy> {
    this.requireSpace(workspaceId);
    this.retireSemantic(workspaceId);
    this.retireHistory();
    if (!ContentMemoryPolicySchema.safeParse(policy).success)
      throw new AuxError("invalid_params", "Choose a valid content-memory policy.");
    if (
      typeof policy.enabled !== "boolean" ||
      (policy.retentionDays !== 30 && policy.retentionDays !== 90) ||
      !Array.isArray(policy.allowedOrigins) ||
      policy.allowedOrigins.length > 100
    )
      throw new AuxError("invalid_params", "Choose a valid content-memory policy.");
    let allowedOrigins: string[];
    try {
      allowedOrigins = [...new Set(policy.allowedOrigins.map((origin) => memoryOrigin(origin)))];
      if (allowedOrigins.some((origin) => !origin.startsWith("https://")))
        throw new Error("Secure origin required");
    } catch {
      throw new AuxError("invalid_params", "Use valid web origins for content recall.");
    }
    const next = { ...policy, allowedOrigins };
    return this.serialized(async () => {
      const expires = (row: Row & { workspace_id: string }) =>
        row.workspace_id === workspaceId
          ? Math.min(row.expires_at, row.captured_at + policy.retentionDays * DAY)
          : row.expires_at;
      await this.rotateSelection(
        (row) =>
          row.workspace_id === workspaceId &&
          (!policy.enabled || expires(row) <= this.now() || !memoryOriginAllowed(next, row.origin)),
        expires,
        () => this.repo.setSetting(policyKey(workspaceId), next),
        beforeRemoval,
      );
      this.indexes.delete(workspaceId);
      return next;
    });
  }

  private async key(): Promise<Buffer> {
    this.keyPromise ??= (async () => {
      if (
        this.repo.db
          .prepare("SELECT 1 FROM content_memory WHERE profile_id=? AND ciphertext NOT LIKE 'v2:%' LIMIT 1")
          .get(this.profileId)
      )
        throw new Error("Unknown protected page-memory format.");
      const factorName = this.factorName();
      const hasNewRows = !!this.repo.db
        .prepare("SELECT 1 FROM content_memory WHERE profile_id=? AND ciphertext LIKE 'v2:%' LIMIT 1")
        .get(this.profileId);
      const hasDerivatives = !!this.repo.db
        .prepare("SELECT 1 FROM ai_result_cache WHERE profile_id=? LIMIT 1")
        .get(this.profileId);
      let saved = (await this.native.readSecret(factorName)).value;
      if (!saved) {
        if (hasNewRows || hasDerivatives)
          throw new Error(
            "Protected page-memory factor is missing. Restore the original OS credential store or use reviewed recovery.",
          );
        const created = randomBytes(32).toString("base64");
        await this.native.storeSecret(factorName, created);
        saved = (await this.native.readSecret(factorName)).value;
        if (saved !== created) throw new Error("Protected page-memory key could not be confirmed.");
      }
      const factor = Buffer.from(saved, "base64");
      if (factor.length !== 32 || factor.toString("base64") !== saved)
        throw new Error(
          "Protected page-memory key is invalid. Restore the original OS credential store or forget this memory.",
        );
      const key = await this.protectedStore.generationKey(
        "page-memory",
        factor,
        !hasNewRows && !hasDerivatives,
      );
      return key;
    })().catch((error) => {
      this.keyPromise = undefined;
      throw error;
    });
    return this.keyPromise.then(async (key) => {
      await this.retirePendingFactors();
      return key;
    });
  }

  /** Only admitted page derivatives enter this cache; model receipts and action authority never do. */
  async cachedDerivative<T>(input: {
    workspaceId: string;
    signature: string;
    eligible: () => boolean;
    parse: (value: unknown) => T;
    cacheable?: (value: T) => boolean;
    compute: () => Promise<T>;
  }): Promise<T> {
    return this.own(() => this.cachedDerivativeOwned<T>(input));
  }

  private async cachedDerivativeOwned<T>(input: {
    workspaceId: string;
    signature: string;
    eligible: () => boolean;
    parse: (value: unknown) => T;
    cacheable?: (value: T) => boolean;
    compute: () => Promise<T>;
  }): Promise<T> {
    const maxEntryBytes = 1024 * 1024;
    const maxCacheBytes = 200_000_000;
    if (!input.eligible() || Buffer.byteLength(input.signature) > maxEntryBytes) return input.compute();
    const epoch = this.derivativeEpoch;
    const factor = this.factorName();
    const key = await this.key();
    const current = () => epoch === this.derivativeEpoch && factor === this.factorName() && input.eligible();
    if (!current()) return input.compute();
    const cacheKey = createHmac("sha256", key)
      .update(`${this.profileId}\0${input.workspaceId}\0${input.signature}`)
      .digest("hex");
    const cached = this.repo.transaction(() => {
      const size = this.repo.db
        .prepare(
          "SELECT length(CAST(ciphertext AS BLOB)) AS bytes FROM ai_result_cache WHERE cache_key=? AND profile_id=? AND workspace_id=? AND expires_at>?",
        )
        .get(cacheKey, this.profileId, input.workspaceId, this.now()) as { bytes: number } | undefined;
      if (!size) return undefined;
      if (size.bytes > maxEntryBytes) throw new Error("AI cache entry exceeds its reviewed size cap.");
      const row = this.repo.db
        .prepare("SELECT ciphertext FROM ai_result_cache WHERE cache_key=?")
        .get(cacheKey) as { ciphertext: string };
      const body = JSON.parse(
        this.protectedStore.open(key, "ai-result-cache", cacheKey, row.ciphertext).toString("utf8"),
      ) as {
        profileId: string;
        workspaceId: string;
        result: unknown;
      };
      if (body.profileId !== this.profileId || body.workspaceId !== input.workspaceId)
        throw new Error("AI cache provenance does not match this Profile and Space.");
      const result = input.parse(body.result);
      this.repo.db
        .prepare("UPDATE ai_result_cache SET accessed_at=? WHERE cache_key=?")
        .run(this.now(), cacheKey);
      return { result };
    });
    if (cached && current()) return cached.result;
    const result = input.parse(await input.compute());
    if (!current() || input.cacheable?.(result) === false) return result;
    const bytes = Buffer.from(
      JSON.stringify({ profileId: this.profileId, workspaceId: input.workspaceId, result }),
    );
    if (bytes.length > maxEntryBytes / 2) return result;
    const ciphertext = this.protectedStore.seal(key, "ai-result-cache", cacheKey, bytes);
    if (Buffer.byteLength(ciphertext) > maxEntryBytes) return result;
    this.repo.transaction(() => {
      if (!current()) return;
      this.repo.db.prepare("DELETE FROM ai_result_cache WHERE expires_at<=?").run(this.now());
      this.repo.db
        .prepare(
          "INSERT INTO ai_result_cache(cache_key,workspace_id,profile_id,ciphertext,created_at,accessed_at,expires_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(cache_key) DO UPDATE SET ciphertext=excluded.ciphertext,accessed_at=excluded.accessed_at,expires_at=excluded.expires_at",
        )
        .run(
          cacheKey,
          input.workspaceId,
          this.profileId,
          ciphertext,
          this.now(),
          this.now(),
          this.now() + DAY,
        );
      const total = () =>
        (
          this.repo.db
            .prepare("SELECT COALESCE(SUM(length(CAST(ciphertext AS BLOB))),0) AS bytes FROM ai_result_cache")
            .get() as { bytes: number }
        ).bytes;
      while (total() > maxCacheBytes)
        this.repo.db
          .prepare(
            "DELETE FROM ai_result_cache WHERE cache_key=(SELECT cache_key FROM ai_result_cache ORDER BY accessed_at,cache_key LIMIT 1)",
          )
          .run();
    });
    return result;
  }

  private encrypt(key: Buffer, body: RecordBody): string {
    return `v2:${this.protectedStore.seal(key, "page-memory", body.memoryId, Buffer.from(JSON.stringify(body)))}`;
  }

  private decrypt(key: Buffer, row: Row): RecordBody {
    if (!row.ciphertext.startsWith("v2:")) throw new Error("Unknown protected page-memory format.");
    return JSON.parse(
      this.protectedStore.open(key, "page-memory", row.memory_id, row.ciphertext.slice(3)).toString("utf8"),
    ) as RecordBody;
  }

  /** Export canonical records only after authenticating every row and its Profile-bound lookup. */
  async recoverySnapshot(): Promise<RecoveryPageMemory[]> {
    return this.own(() => this.recoverySnapshotOwned());
  }

  private async recoverySnapshotOwned(): Promise<RecoveryPageMemory[]> {
    const foreign = this.repo.db
      .prepare("SELECT 1 FROM content_memory WHERE profile_id<>? LIMIT 1")
      .get(this.profileId);
    if (foreign) throw new Error("Recovery requires a single disposable Profile's page memory.");
    const rows = this.repo.db
      .prepare(
        `SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext,workspace_id
      FROM content_memory WHERE profile_id=? ORDER BY memory_id`,
      )
      .all(this.profileId) as (Row & { workspace_id: string })[];
    if (!rows.length) return [];
    const key = await this.key();
    return rows.map((row) => {
      const body = this.decrypt(key, row);
      const sourceKey = createHmac("sha256", key)
        .update(`${this.profileId}\0${row.workspace_id}\0${body.url}`)
        .digest("hex");
      if (
        body.memoryId !== row.memory_id ||
        body.profileId !== this.profileId ||
        body.workspaceId !== row.workspace_id ||
        new URL(body.url).origin !== row.origin ||
        body.capturedAt !== row.captured_at ||
        sourceKey !== row.source_key
      )
        throw new Error("Protected page-memory provenance does not match its storage record.");
      return { body, expiresAt: row.expires_at };
    });
  }

  /** Destination Profile receives its own Keychain factor and fresh record envelopes. */
  async importRecoverySnapshot(records: RecoveryPageMemory[]): Promise<void> {
    return this.own(() => this.importRecoverySnapshotOwned(records));
  }

  private async importRecoverySnapshotOwned(records: RecoveryPageMemory[]): Promise<void> {
    if (this.repo.db.prepare("SELECT 1 FROM content_memory LIMIT 1").get())
      throw new Error("Recovery destination already has page memory.");
    if (!records.length) return;
    const key = await this.key();
    this.repo.transaction(() => {
      const insert = this.repo.db.prepare(`INSERT INTO content_memory
        (memory_id,profile_id,workspace_id,source_key,origin,captured_at,expires_at,ciphertext) VALUES(?,?,?,?,?,?,?,?)`);
      for (const record of records) {
        const body = { ...record.body, profileId: this.profileId };
        if (
          !body.memoryId ||
          !body.workspaceId ||
          !Number.isSafeInteger(record.expiresAt) ||
          !this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(body.workspaceId)
        )
          throw new Error("Recovery page-memory record is invalid.");
        const origin = new URL(body.url).origin;
        const sourceKey = createHmac("sha256", key)
          .update(`${this.profileId}\0${body.workspaceId}\0${body.url}`)
          .digest("hex");
        insert.run(
          body.memoryId,
          this.profileId,
          body.workspaceId,
          sourceKey,
          origin,
          body.capturedAt,
          record.expiresAt,
          this.encrypt(key, body),
        );
      }
    });
    this.indexes.clear();
  }

  /** Caller must establish foreground/document eligibility before supplying page text. */
  async saveEligible(
    input: Omit<RecordBody, "memoryId" | "profileId" | "capturedAt">,
    currentDocument?: () => boolean,
  ): Promise<RecordBody> {
    return this.own(() => this.saveEligibleOwned(input, currentDocument));
  }

  private async saveEligibleOwned(
    input: Omit<RecordBody, "memoryId" | "profileId" | "capturedAt">,
    currentDocument?: () => boolean,
  ): Promise<RecordBody> {
    this.assertCaptureEligible(input);
    let url: URL;
    try {
      url = new URL(input.url);
    } catch {
      throw new AuxError("invalid_params", "Choose a secure web page.");
    }
    if (memoryContentSensitivityReason(input.text))
      throw new AuxError("permission_denied", "Sensitive pages cannot be saved to Memory.");
    if (
      !input.pageId ||
      input.pageId.length > 200 ||
      (input.sessionId?.length ?? 0) > 200 ||
      !Number.isSafeInteger(input.documentEpoch) ||
      input.documentEpoch < 0 ||
      !input.text.trim() ||
      Buffer.byteLength(input.text, "utf8") > MAX_TEXT_BYTES
    )
      throw new AuxError("invalid_params", "Use readable page text up to 64 KB from the current document.");
    url.search = "";
    url.hash = "";
    const key = await this.key();
    // Recheck after the OS credential call; opt-in or exclusions may have changed.
    const current = this.policy(input.workspaceId);
    const currentMemory = readWorkspaceMemory(this.repo, input.workspaceId);
    if (
      !current.enabled ||
      !memoryOriginAllowed(current, url.origin) ||
      currentMemory?.enabled === false ||
      (currentMemory && memorySourceExcluded(currentMemory, url.href))
    )
      throw new AuxError(
        "permission_denied",
        "Page-content recall changed while this page was being protected.",
      );
    if (currentDocument && !currentDocument())
      throw new AuxError("conflict", "The document changed while this page was being protected.");
    const sourceKey = createHmac("sha256", key)
      .update(`${this.profileId}\0${input.workspaceId}\0${url.href}`)
      .digest("hex");
    const existing = this.repo.db
      .prepare("SELECT memory_id FROM content_memory WHERE profile_id=? AND workspace_id=? AND source_key=?")
      .get(this.profileId, input.workspaceId, sourceKey) as { memory_id: string } | undefined;
    const at = this.now();
    const body: RecordBody = {
      ...input,
      memoryId: existing?.memory_id ?? randomUUID(),
      profileId: this.profileId,
      url: url.href,
      title: input.title.trim().slice(0, 300) || url.hostname,
      text: input.text.trim(),
      capturedAt: at,
    };
    this.repo.transaction(() => {
      this.repo.db
        .prepare(
          `INSERT INTO content_memory(memory_id,profile_id,workspace_id,source_key,origin,captured_at,expires_at,ciphertext)
        VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,workspace_id,source_key) DO UPDATE SET
        origin=excluded.origin,captured_at=excluded.captured_at,expires_at=excluded.expires_at,ciphertext=excluded.ciphertext`,
        )
        .run(
          body.memoryId,
          this.profileId,
          input.workspaceId,
          sourceKey,
          url.origin,
          at,
          at + current.retentionDays * DAY,
          this.encrypt(key, body),
        );
      this.repo.db
        .prepare(
          `DELETE FROM content_memory WHERE memory_id IN (SELECT memory_id FROM content_memory
        WHERE profile_id=? AND workspace_id=? ORDER BY captured_at DESC,memory_id DESC LIMIT -1 OFFSET ?)`,
        )
        .run(this.profileId, input.workspaceId, MAX_PAGES_PER_SPACE);
    });
    this.indexes.delete(input.workspaceId);
    return body;
  }

  private async index(workspaceId: string): Promise<Index> {
    const memory = readWorkspaceMemory(this.repo, workspaceId);
    const revision = memory?.revision ?? 0;
    const cached = this.indexes.get(workspaceId);
    if (cached?.revision === revision && cached.expiresAt > this.now()) return cached;
    const policy = this.policy(workspaceId);
    if (!policy.enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return { revision, expiresAt: this.now(), rows: new Map(), searchable: new Map() };
    if (
      !this.repo.db
        .prepare("SELECT 1 FROM content_memory WHERE profile_id=? AND workspace_id=? LIMIT 1")
        .get(this.profileId, workspaceId)
    ) {
      await this.retirePendingFactors();
      return { revision, expiresAt: this.now(), rows: new Map(), searchable: new Map() };
    }
    const policyIdentity = JSON.stringify(policy);
    const retired = () =>
      readWorkspaceMemory(this.repo, workspaceId).revision !== revision ||
      JSON.stringify(this.policy(workspaceId)) !== policyIdentity;
    const empty = (): Index => ({ revision, expiresAt: this.now(), rows: new Map(), searchable: new Map() });
    let key: Buffer;
    try {
      key = await this.key();
    } catch (error) {
      // Revocation may remove the factor while this original read is awaiting Keychain.
      if (retired()) return empty();
      throw error;
    }
    if (retired()) return empty();
    const rows = this.repo.db
      .prepare(
        `SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext FROM content_memory
      WHERE profile_id=? AND workspace_id=? AND expires_at>? AND captured_at>? ORDER BY captured_at DESC LIMIT ?`,
      )
      .all(
        this.profileId,
        workspaceId,
        this.now(),
        this.now() - policy.retentionDays * DAY,
        MAX_PAGES_PER_SPACE,
      ) as Row[];
    const index: Index = { revision, expiresAt: Infinity, rows: new Map(), searchable: new Map() };
    for (const row of rows) {
      if (!memoryOriginAllowed(policy, row.origin) || memory?.excludedOrigins?.includes(row.origin)) continue;
      index.expiresAt = Math.min(index.expiresAt, row.expires_at);
      const body = this.decrypt(key, row);
      const sourceKey = createHmac("sha256", key)
        .update(`${this.profileId}\0${workspaceId}\0${body.url}`)
        .digest("hex");
      if (
        body.memoryId !== row.memory_id ||
        body.profileId !== this.profileId ||
        body.workspaceId !== workspaceId ||
        new URL(body.url).origin !== row.origin ||
        body.capturedAt !== row.captured_at ||
        sourceKey !== row.source_key
      )
        throw new Error("Protected page-memory provenance does not match its storage record.");
      if (memorySensitivityReason(body.url, body.title) || memoryContentSensitivityReason(body.text))
        continue;
      index.rows.set(row.memory_id, body);
      index.searchable.set(row.memory_id, {
        title: body.title.toLocaleLowerCase(),
        text: body.text.toLocaleLowerCase(),
      });
    }
    this.indexes.delete(workspaceId);
    this.indexes.set(workspaceId, index);
    if (this.indexes.size > MAX_INDEXED_SPACES) this.indexes.delete(this.indexes.keys().next().value!);
    return index;
  }

  private readable(body: RecordBody): boolean {
    const policy = this.policy(body.workspaceId);
    const memory = readWorkspaceMemory(this.repo, body.workspaceId);
    return (
      policy.enabled &&
      memory?.enabled !== false &&
      memoryOriginAllowed(policy, new URL(body.url).origin) &&
      (!memory || !memorySourceExcluded(memory, body.url))
    );
  }

  private retireSemantic(workspaceId?: string): void {
    for (const [id, controller] of this.semanticControllers) {
      if (workspaceId !== undefined && id !== workspaceId) continue;
      controller.abort();
      this.semanticControllers.delete(id);
    }
  }
  async embeddingModels(workspaceId: string) {
    return this.own(() => this.embeddingModelsOwned(workspaceId));
  }

  private async embeddingModelsOwned(workspaceId: string) {
    this.requireSpace(workspaceId);
    if (!this.policy(workspaceId).enabled || !readWorkspaceMemory(this.repo, workspaceId).enabled) return [];
    return this.embeddings.discover(
      AbortSignal.any([this.discoveryController.signal, AbortSignal.timeout(30_000)]),
    );
  }
  async semanticSearch(workspaceId: string, query: string, limit = 10) {
    return this.own(() => this.semanticSearchOwned(workspaceId, query, limit));
  }

  private async semanticSearchOwned(workspaceId: string, query: string, limit = 10) {
    this.requireSpace(workspaceId);
    this.retireSemantic(workspaceId);
    const controller = new AbortController();
    this.semanticControllers.set(workspaceId, controller);
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(60_000)]);
    const initial = this.policy(workspaceId),
      epoch = this.derivativeEpoch;
    const eligible = () =>
      !this.closed &&
      !signal.aborted &&
      epoch === this.derivativeEpoch &&
      initial.enabled &&
      JSON.stringify(this.policy(workspaceId)) === JSON.stringify(initial) &&
      readWorkspaceMemory(this.repo, workspaceId).enabled !== false;
    const check = () => {
      if (!eligible()) throw new AuxError("cancelled", "The original Memory search or policy changed.");
    };
    try {
      check();
      if (memoryContentSensitivityReason(query))
        throw new AuxError("permission_denied", "Sensitive queries cannot be sent for semantic recall.");
      let models: Awaited<ReturnType<LocalMemoryEmbeddings["discover"]>>;
      try {
        models = await this.embeddings.discover(signal);
      } catch (error) {
        check();
        if (error instanceof AuxError && error.code !== "backend_unavailable") throw error;
        return {
          mode: "lexical" as const,
          message: "Local embeddings are unavailable. Showing keyword matches.",
          matches: await this.search(workspaceId, query, limit),
        };
      }
      check();
      const model = initial.semanticModelId
        ? models.find((item) => item.modelId === initial.semanticModelId)
        : models[0];
      if (!model)
        return {
          mode: "lexical" as const,
          message: "No installed local embedding model is available. Showing keyword matches.",
          matches: await this.search(workspaceId, query, limit),
        };
      const index = await this.index(workspaceId);
      check();
      const queryVector = await this.embeddings.embed(model, query, signal);
      check();
      const ranked: Array<{ body: RecordBody; score: number }> = [];
      for (const body of index.rows.values()) {
        check();
        const text = `${body.title}\n${body.text.slice(0, 6000)}`;
        const sourceCurrent = () =>
          eligible() &&
          this.readable(body) &&
          !!this.repo.db
            .prepare(
              "SELECT 1 FROM content_memory WHERE memory_id=? AND profile_id=? AND workspace_id=? AND captured_at=?",
            )
            .get(body.memoryId, this.profileId, workspaceId, body.capturedAt);
        if (!sourceCurrent()) continue;
        const vector = await this.cachedDerivative({
          workspaceId,
          signature: JSON.stringify([
            "local-memory-embedding-v1",
            model,
            body.memoryId,
            body.capturedAt,
            text,
          ]),
          eligible: sourceCurrent,
          parse: embeddingVector,
          compute: async () => {
            check();
            if (!sourceCurrent()) throw new AuxError("cancelled", "The original Memory source changed.");
            const value = await this.embeddings.embed(model, text, signal);
            check();
            return value;
          },
        });
        if (sourceCurrent()) ranked.push({ body, score: cosineSimilarity(queryVector, vector) });
      }
      const currentModels = await this.embeddings.discover(signal);
      check();
      if (!currentModels.some((item) => item.modelId === model.modelId && item.digest === model.digest))
        throw new AuxError("cancelled", "The installed local embedding model changed.");
      return {
        mode: "semantic" as const,
        modelId: model.modelId,
        message: "Local semantic matches use each article’s title and first 6,000 readable characters.",
        matches: ranked
          .sort((a, b) => b.score - a.score || b.body.capturedAt - a.body.capturedAt)
          .filter((item) => this.readable(item.body))
          .slice(0, Math.max(1, Math.min(limit, 20)))
          .map(({ body }) => ({
            memoryId: body.memoryId,
            profileId: body.profileId,
            workspaceId: body.workspaceId,
            pageId: body.pageId,
            documentEpoch: body.documentEpoch,
            url: body.url,
            title: body.title,
            capturedAt: body.capturedAt,
            snippet: body.text.slice(0, 240),
          })),
      };
    } finally {
      if (this.semanticControllers.get(workspaceId) === controller)
        this.semanticControllers.delete(workspaceId);
    }
  }

  private *historyVisits(query?: string): Generator<HistoryEntry> {
    let before: { visitedAt: number; url: string } | undefined;
    for (;;) {
      const batch = this.repo.listHistory(query, 500, { before });
      if (!batch.length) return;
      for (const entry of batch) yield entry;
      const last = batch[batch.length - 1]!;
      before = { visitedAt: last.visitedAt, url: last.url };
    }
  }

  semanticHistory(
    workspaceId: string,
    query: string,
    limit: number,
    originalSignal: AbortSignal,
    checkOwner: () => void,
  ): Promise<{ mode: "semantic" | "lexical"; message: string; entries: HistoryEntry[] }> {
    return this.own(() => this.semanticHistoryOwned(workspaceId, query, limit, originalSignal, checkOwner));
  }

  private async semanticHistoryOwned(
    workspaceId: string,
    query: string,
    limit: number,
    originalSignal: AbortSignal,
    checkOwner: () => void,
  ): Promise<{ mode: "semantic" | "lexical"; message: string; entries: HistoryEntry[] }> {
    this.requireSpace(workspaceId);
    const controller = new AbortController();
    this.historyControllers.add(controller);
    const signal = AbortSignal.any([originalSignal, controller.signal, this.discoveryController.signal]);
    const policy = this.policy(workspaceId);
    const workspace = readWorkspaceMemory(this.repo, workspaceId);
    const epoch = this.historyEpoch;
    const check = () => {
      signal.throwIfAborted();
      checkOwner();
      if (
        this.closed ||
        epoch !== this.historyEpoch ||
        JSON.stringify(policy) !== JSON.stringify(this.policy(workspaceId)) ||
        JSON.stringify(workspace) !== JSON.stringify(readWorkspaceMemory(this.repo, workspaceId))
      )
        throw new AuxError("cancelled", "The original history source or memory policy changed.");
    };
    const eligible = (entry: HistoryEntry) => {
      try {
        const url = new URL(entry.url);
        // Do not put an original credential-bearing link into a model tool result.
        // Retain ordinary query URLs exactly; never manufacture a replacement destination.
        const fragment = new URLSearchParams(url.hash.slice(1).split("?").pop());
        const credentialKey = /^(?:access_token|refresh_token|id_token|token|password|passwd|secret|api_key|apikey|authorization|otp|one_time_code)$/i;
        if ([...url.searchParams.keys(), ...fragment.keys()].some((key) => credentialKey.test(key)))
          return false;
        return (
          ["https:", "http:"].includes(url.protocol) &&
          !url.username &&
          !url.password &&
          !memorySensitivityReason(entry.url, entry.title) &&
          !memoryContentSensitivityReason(entry.title) &&
          memoryOriginAllowed(policy, url.origin) &&
          !memorySourceExcluded(workspace, entry.url)
        );
      } catch {
        return false;
      }
    };
    const current = (entry: HistoryEntry) =>
      eligible(entry) &&
      !!this.repo.db
        .prepare("SELECT 1 FROM history WHERE url=? AND visited_at=? AND title=?")
        .get(entry.url, entry.visitedAt, entry.title);
    const count = Math.min(50, Math.max(1, Math.floor(limit)));
    const lexical = (message: string) => {
      check();
      const entries: HistoryEntry[] = [];
      for (const entry of this.historyVisits(query)) {
        check();
        if (current(entry)) entries.push(entry);
        if (entries.length >= count) break;
      }
      return { mode: "lexical" as const, message, entries };
    };
    try {
      check();
      if (!policy.enabled || !workspace.enabled)
        return { mode: "lexical", message: "History recall is paused in this Space.", entries: [] };
      if (memoryContentSensitivityReason(query))
        throw new AuxError(
          "permission_denied",
          "Sensitive queries cannot be sent for semantic history recall.",
        );
      let models: LocalEmbeddingModel[];
      try {
        models = await this.embeddings.discover(signal);
      } catch (error) {
        check();
        if (error instanceof AuxError && error.code !== "backend_unavailable") throw error;
        return lexical("Local embeddings are unavailable; these are keyword history matches.");
      }
      check();
      const model = policy.semanticModelId
        ? models.find((entry) => entry.modelId === policy.semanticModelId)
        : models[0];
      if (!model)
        return lexical("No installed embedding model is selected; these are keyword history matches.");
      const identity = JSON.stringify(model);
      let index = this.historyIndexes.get(workspaceId);
      if (!index || index.model !== identity) {
        if (this.historyIndexes.size >= MAX_INDEXED_SPACES) this.historyIndexes.clear();
        index = { model: identity, vectors: new Map() };
        this.historyIndexes.set(workspaceId, index);
      }
      const key = (entry: HistoryEntry) =>
        createHash("sha256")
          .update(JSON.stringify([entry.url, entry.title, entry.visitedAt, model]))
          .digest("hex");
      const queryVector = await this.embeddings.embed(model, query, signal);
      check();
      const ranked: Array<{ entry: HistoryEntry; score: number }> = [];
      for (const entry of this.historyVisits()) {
        check();
        if (!current(entry)) continue;
        const signature = key(entry);
        let vector = index.vectors.get(signature);
        if (!vector) {
          const url = new URL(entry.url);
          // Only original HistoryService metadata; never query/fragment secrets or a borrowed page read.
          vector = await this.embeddings.embed(
            model,
            `${entry.title.slice(0, 4000)}\n${url.hostname}${url.pathname.slice(0, 2000)}`,
            signal,
          );
          check();
          if (!current(entry)) continue;
          if (index.vectors.size >= 500) index.vectors.delete(index.vectors.keys().next().value!);
          index.vectors.set(signature, vector);
        } else {
          index.vectors.delete(signature);
          index.vectors.set(signature, vector);
        }
        ranked.push({ entry, score: cosineSimilarity(queryVector, vector) });
        ranked.sort((a, b) => b.score - a.score || b.entry.visitedAt - a.entry.visitedAt);
        if (ranked.length > count) ranked.pop();
      }
      const installed = await this.embeddings.discover(signal);
      check();
      if (!installed.some((entry) => entry.modelId === model.modelId && entry.digest === model.digest))
        throw new AuxError("cancelled", "The installed history embedding model changed.");
      return {
        mode: "semantic",
        message:
          "Local semantic history matches use eligible visit titles and URL path metadata, not page bodies.",
        entries: ranked
          .sort((a, b) => b.score - a.score || b.entry.visitedAt - a.entry.visitedAt)
          .filter(({ entry }) => current(entry))
          .slice(0, count)
          .map(({ entry }) => entry),
      };
    } catch (error) {
      check();
      if (error instanceof AuxError && error.code === "backend_unavailable")
        return lexical(
          "The installed local embedding model is unavailable; these are keyword history matches.",
        );
      throw error;
    } finally {
      this.historyControllers.delete(controller);
    }
  }

  async search(workspaceId: string, query: string, limit = 10) {
    return this.own(() => this.searchOwned(workspaceId, query, limit));
  }

  private async searchOwned(workspaceId: string, query: string, limit = 10) {
    if (!this.policy(workspaceId).enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return [];
    const tokens = terms(query.slice(0, 200)).slice(0, 8);
    if (!tokens.length) return [];
    const index = await this.index(workspaceId);
    if (!this.policy(workspaceId).enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return [];
    const frequencies = new Map(tokens.map((token) => [token, 0]));
    const candidates = [...index.rows].flatMap(([id, body]) => {
      const haystack = index.searchable.get(id)!;
      const hits = tokens.filter(
        (token) => termPosition(haystack.title, token) >= 0 || termPosition(haystack.text, token) >= 0,
      );
      for (const token of hits) frequencies.set(token, frequencies.get(token)! + 1);
      // Multi-term questions need corroboration. A single common word such as
      // Spanish "de" should not surface an unrelated saved page as an answer.
      return hits.length >= (tokens.length >= 3 ? 2 : 1) ? [{ body, haystack, hits }] : [];
    });
    const ranked = candidates
      .map(({ body, haystack, hits }) => {
        const score =
          hits.reduce((sum, token) => {
            const frequency = frequencies.get(token) ?? 1;
            const rarity = Math.log(1 + (index.rows.size + 1) / frequency);
            return sum + rarity * (termPosition(haystack.title, token) >= 0 ? 3 : 1);
          }, 0) *
          (0.5 + hits.length / tokens.length);
        return { body, haystack, score, hits };
      })
      .sort((a, b) => b.score - a.score || b.body.capturedAt - a.body.capturedAt);
    return ranked
      .filter(({ body }) => this.readable(body))
      .slice(0, Math.max(1, Math.min(limit, 20)))
      .map(({ body, haystack, hits }) => {
        const at = Math.max(
          0,
          termPosition(
            haystack.text,
            hits.find((token) => termPosition(haystack.text, token) >= 0) ?? hits[0]!,
          ),
        );
        const start = Math.max(0, at - 70),
          end = Math.min(body.text.length, start + 240);
        return {
          memoryId: body.memoryId,
          profileId: body.profileId,
          workspaceId: body.workspaceId,
          url: body.url,
          title: body.title,
          capturedAt: body.capturedAt,
          pageId: body.pageId,
          documentEpoch: body.documentEpoch,
          snippet: `${start ? "…" : ""}${body.text.slice(start, end)}${end < body.text.length ? "…" : ""}`,
        };
      });
  }

  async get(workspaceId: string, memoryId: string): Promise<RecordBody | undefined> {
    return this.own(() => this.getOwned(workspaceId, memoryId));
  }

  private async getOwned(workspaceId: string, memoryId: string): Promise<RecordBody | undefined> {
    if (!this.policy(workspaceId).enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return undefined;
    const record = (await this.index(workspaceId)).rows.get(memoryId);
    return record && this.readable(record) ? record : undefined;
  }

  async invalidateDerivatives(): Promise<void> {
    return this.own(() => this.invalidateDerivativesOwned());
  }

  private async invalidateDerivativesOwned(): Promise<void> {
    await this.serialized(async () => {
      await this.rotateSelection(() => false);
    });
  }

  async forget(
    workspaceId: string,
    memoryId?: string,
    beforeRemoval?: () => void | Promise<void>,
  ): Promise<number> {
    return this.own(() => this.forgetOwned(workspaceId, memoryId, beforeRemoval));
  }

  private async forgetOwned(
    workspaceId: string,
    memoryId?: string,
    beforeRemoval?: () => void | Promise<void>,
  ): Promise<number> {
    return this.serialized(async () => {
      this.requireSpace(workspaceId);
      const removed = await this.rotateSelection(
        (row) => row.workspace_id === workspaceId && (!memoryId || row.memory_id === memoryId),
        undefined,
        undefined,
        beforeRemoval,
      );
      if (removed) this.indexes.clear();
      return removed;
    });
  }

  private async rotateSelection(
    select: (row: Row & { workspace_id: string }) => boolean,
    expiryFor: (row: Row & { workspace_id: string }) => number = (row) => row.expires_at,
    onCommit: () => void = () => {},
    beforeRemoval?: () => void | Promise<void>,
  ): Promise<number> {
    this.retireSemantic();
    this.derivativeEpoch++;
    const hasDerivatives = !!this.repo.db
      .prepare("SELECT 1 FROM ai_result_cache WHERE profile_id=? LIMIT 1")
      .get(this.profileId);
    const query = () =>
      this.repo.db
        .prepare(
          `SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext,workspace_id
      FROM content_memory WHERE profile_id=?`,
        )
        .all(this.profileId) as (Row & { workspace_id: string })[];
    let rows = query();
    if (!rows.some(select) && !hasDerivatives) {
      this.repo.transaction(() => {
        const update = this.repo.db.prepare("UPDATE content_memory SET expires_at=? WHERE memory_id=?");
        for (const row of rows)
          if (expiryFor(row) !== row.expires_at) update.run(expiryFor(row), row.memory_id);
        onCommit();
      });
      await this.retirePendingFactors();
      return 0;
    }
    await beforeRemoval?.();
    const oldKey = await this.key();
    const oldFactor = this.factorName();
    rows = query();
    const removed = rows.filter(select);
    if (!removed.length && !hasDerivatives) {
      this.repo.transaction(onCommit);
      return 0;
    }
    const retained = rows
      .filter((row) => !removed.includes(row))
      .map((row) => {
        const body = this.decrypt(oldKey, row);
        const sourceKey = createHmac("sha256", oldKey)
          .update(`${this.profileId}\0${row.workspace_id}\0${body.url}`)
          .digest("hex");
        if (
          body.memoryId !== row.memory_id ||
          body.profileId !== this.profileId ||
          body.workspaceId !== row.workspace_id ||
          new URL(body.url).origin !== row.origin ||
          body.capturedAt !== row.captured_at ||
          sourceKey !== row.source_key
        )
          throw new Error("Protected page-memory provenance does not match its storage record.");
        return { row, body };
      });
    const nextFactor = randomBytes(32);
    const nextName = `pageMemoryFactorV2_${createHash("sha256").update(this.profileId).digest("hex").slice(0, 16)}_${randomUUID().slice(0, 8)}`;
    const nextKey = await this.protectedStore.generationKey("page-memory", nextFactor);
    await this.native.storeSecret(nextName, nextFactor.toString("base64"));
    if ((await this.native.readSecret(nextName)).value !== nextFactor.toString("base64"))
      throw new Error("A new page-memory factor could not be confirmed.");
    try {
      this.repo.transaction(() => {
        const remove = this.repo.db.prepare("DELETE FROM content_memory WHERE profile_id=? AND memory_id=?");
        for (const row of removed)
          if (remove.run(this.profileId, row.memory_id).changes !== 1)
            throw new Error("Page memory changed during removal.");
        const update = this.repo.db.prepare(
          "UPDATE content_memory SET source_key=?,ciphertext=?,expires_at=? WHERE memory_id=?",
        );
        for (const { row, body } of retained) {
          const sourceKey = createHmac("sha256", nextKey)
            .update(`${this.profileId}\0${row.workspace_id}\0${body.url}`)
            .digest("hex");
          update.run(sourceKey, this.encrypt(nextKey, body), expiryFor(row), row.memory_id);
        }
        this.repo.db.prepare("DELETE FROM ai_result_cache WHERE profile_id=?").run(this.profileId);
        onCommit();
        this.repo.setSetting(this.factorSetting(), nextName);
        const pending = this.repo.getSetting<string[]>(this.retiredSetting()) ?? [];
        this.repo.setSetting(this.retiredSetting(), [...new Set([...pending, oldFactor])]);
      });
    } catch (error) {
      await this.native.storeSecret(nextName, "");
      throw error;
    }
    this.keyPromise = Promise.resolve(nextKey);
    this.indexes.clear();
    await this.retirePendingFactors();
    return removed.length;
  }

  async prune(): Promise<{ removed: number; workspaceIds: string[] }> {
    return this.own(() => this.pruneOwned());
  }

  private async pruneOwned(): Promise<{ removed: number; workspaceIds: string[] }> {
    return this.serialized(async () => {
      const workspaceIds = (
        this.repo.db
          .prepare(
            "SELECT DISTINCT workspace_id AS workspaceId FROM content_memory WHERE profile_id=? AND expires_at<=?",
          )
          .all(this.profileId, this.now()) as { workspaceId: string }[]
      ).map((row) => row.workspaceId);
      const removed = await this.rotateSelection((row) => row.expires_at <= this.now());
      if (removed) this.indexes.clear();
      return { removed, workspaceIds };
    });
  }
}
