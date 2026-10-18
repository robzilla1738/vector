import type { MemoryRecallSource } from "@aux/contracts/memory-documents";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { setImmediate as idle } from "node:timers/promises";
import {
  AuxError,
  CapturedSourceSchema,
  sameCapturedSource,
  type CapturedSource,
  type MethodParams,
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

/** Internal original-removal proof, never supplied through a public API or model input. */
export type ContentRemovalScope = { workspaceId: string; memoryId?: string };
export type ContentRemovalCheck = ((scope?: ContentRemovalScope) => void) & { committed?: () => void };
type BeforeContentRemoval = () => void | ContentRemovalCheck | Promise<void | ContentRemovalCheck>;

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
type IndexedPage = Omit<RecordBody, "text"> & {
  normalizedText: string;
  sourceVersion: string;
  embeddingVersion: string;
};
type Index = {
  revision: number;
  generation: number;
  epoch: number;
  policy: string;
  expiresAt: number;
  rows: Map<string, IndexedPage>;
};
type WarmIndex = {
  controller: AbortController;
  promise: Promise<void>;
  generation: number;
  startedAt: number;
  model?: LocalEmbeddingModel;
  vectors: Map<string, { embeddingVersion: string; vector: Float32Array }>;
};
type HistoryIndex = {
  controller: AbortController;
  startedAt: number;
  model?: LocalEmbeddingModel;
  vectors: Map<string, { entry: HistoryEntry; vector: Float32Array }>;
};
type DerivativeInput<T> = {
  workspaceId: string;
  signature: string;
  eligible: () => boolean;
  parse: (value: unknown) => T;
};
function compactVector(vector: number[]): Float32Array {
  const scale = Math.max(...vector.map(Math.abs));
  return Float32Array.from(vector, (value) => value / scale);
}
const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex");

async function cancellable<T>(pending: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return pending;
  signal.throwIfAborted();
  let abort: () => void;
  try {
    return await Promise.race([
      pending,
      new Promise<never>((_, reject) => {
        abort = () => reject(signal.reason);
        signal.addEventListener("abort", abort, { once: true });
      }),
    ]);
  } finally {
    signal.removeEventListener("abort", abort!);
  }
}

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

export function contentMemoryExcerpt(text: string, query: string): string {
  const normalized = text.toLocaleLowerCase();
  const tokens = terms(query.slice(0, 200)).slice(0, 8);
  const token = tokens.find((word) => termPosition(normalized, word) >= 0);
  const at = token ? termPosition(normalized, token) : 0;
  const start = Math.max(0, at - 70),
    end = Math.min(text.length, start + 240);
  return `${start ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

/** Page text is encrypted before SQLite sees it. Search structures exist only in bounded process memory. */
export class ContentMemoryStore {
  private keyPromise?: Promise<Buffer>;
  private protectedStore: ProtectedStore;
  private rotationQueue: Promise<unknown> = Promise.resolve();
  private indexes = new Map<string, Index>();
  private derivativeEpoch = 0;
  private generations = new Map<string, number>();
  private indexBuilds = new Map<string, { controller: AbortController; promise: Promise<Index> }>();
  private warms = new Map<string, WarmIndex>();
  private unsubscribe?: () => void;
  private embeddings: LocalMemoryEmbeddings;
  private closed = false;
  private closing?: Promise<void>;
  private pending = new Set<Promise<unknown>>();
  private discoveryController = new AbortController();
  private semanticControllers = new Map<string, AbortController>();
  private historyControllers = new Set<AbortController>();
  private historyIndexes = new Map<string, HistoryIndex>();
  private historyEpoch = 0;

  private retireHistory(): void {
    this.historyEpoch++;
    for (const controller of this.historyControllers) controller.abort();
    for (const index of this.historyIndexes.values()) index.controller.abort();
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
        this.derivativeEpoch++;
        this.retireIndexes(event.payload.workspaceId);
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
    this.retireIndexes();
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
    beforeRemoval?: BeforeContentRemoval,
  ): Promise<Policy> {
    return this.own(() => this.setPolicyOwned(workspaceId, policy, beforeRemoval));
  }

  private async setPolicyOwned(
    workspaceId: string,
    policy: Policy,
    beforeRemoval?: BeforeContentRemoval,
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
        { kind: "policy", scope: { workspaceId } },
      );
      this.retireIndexes(workspaceId);
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
  async cachedDerivative<T>(
    input: DerivativeInput<T> & {
      cacheable?: (value: T) => boolean;
      compute: () => Promise<T>;
    },
  ): Promise<T> {
    return this.own(() => this.cachedDerivativeOwned<T>(input));
  }

  private async cachedDerivativeOwned<T>(
    input: DerivativeInput<T> & {
      cacheable?: (value: T) => boolean;
      compute: () => Promise<T>;
    },
  ): Promise<T> {
    const cache = await this.prepareDerivative(input);
    if (!cache) return input.compute();
    const cached = cache.read();
    if (cached) return cached.result;
    const result = input.parse(await input.compute());
    if (input.cacheable?.(result) !== false) cache.write(result);
    return result;
  }

  private async prepareDerivative<T>(input: DerivativeInput<T>) {
    const maxEntryBytes = 1024 * 1024;
    const maxCacheBytes = 200_000_000;
    if (!input.eligible() || Buffer.byteLength(input.signature) > maxEntryBytes) return undefined;
    const epoch = this.derivativeEpoch;
    const factor = this.factorName();
    const key = await this.key();
    const current = () =>
      !this.closed && epoch === this.derivativeEpoch && factor === this.factorName() && input.eligible();
    if (!current()) return undefined;
    const cacheKey = createHmac("sha256", key)
      .update(`${this.profileId}\0${input.workspaceId}\0${input.signature}`)
      .digest("hex");
    const read = () =>
      this.repo.transaction(() => {
        if (!current()) return undefined;
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
    const write = (result: T) => {
      if (!current()) return;
      const bytes = Buffer.from(
        JSON.stringify({ profileId: this.profileId, workspaceId: input.workspaceId, result }),
      );
      if (bytes.length > maxEntryBytes / 2) return;
      const ciphertext = this.protectedStore.seal(key, "ai-result-cache", cacheKey, bytes);
      if (Buffer.byteLength(ciphertext) > maxEntryBytes) return;
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
              .prepare(
                "SELECT COALESCE(SUM(length(CAST(ciphertext AS BLOB))),0) AS bytes FROM ai_result_cache",
              )
              .get() as { bytes: number }
          ).bytes;
        while (total() > maxCacheBytes)
          this.repo.db
            .prepare(
              "DELETE FROM ai_result_cache WHERE cache_key=(SELECT cache_key FROM ai_result_cache ORDER BY accessed_at,cache_key LIMIT 1)",
            )
            .run();
      });
    };
    return { read, write };
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
    this.retireIndexes();
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
      .prepare(
        "SELECT memory_id,captured_at FROM content_memory WHERE profile_id=? AND workspace_id=? AND source_key=?",
      )
      .get(this.profileId, input.workspaceId, sourceKey) as
      { memory_id: string; captured_at: number } | undefined;
    // Reusing an article ID must still produce a distinct capture identity, even within one clock tick.
    const at = Math.max(this.now(), (existing?.captured_at ?? -1) + 1);
    const body: RecordBody = {
      ...input,
      memoryId: existing?.memory_id ?? randomUUID(),
      profileId: this.profileId,
      url: url.href,
      title: input.title.trim().slice(0, 300) || url.hostname,
      text: input.text.trim(),
      capturedAt: at,
    };
    const ciphertext = this.encrypt(key, body);
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
          ciphertext,
        );
      this.repo.db
        .prepare(
          `DELETE FROM content_memory WHERE memory_id IN (SELECT memory_id FROM content_memory
        WHERE profile_id=? AND workspace_id=? ORDER BY captured_at DESC,memory_id DESC LIMIT -1 OFFSET ?)`,
        )
        .run(this.profileId, input.workspaceId, MAX_PAGES_PER_SPACE);
    });
    const generation = this.generation(input.workspaceId) + 1;
    this.generations.set(input.workspaceId, generation);
    const building = this.indexBuilds.get(input.workspaceId);
    building?.controller.abort();
    this.indexBuilds.delete(input.workspaceId);
    const cached = this.indexes.get(input.workspaceId);
    if (cached) {
      cached.generation = generation;
      cached.rows.set(body.memoryId, this.indexPage(body, ciphertext));
      cached.expiresAt = Math.min(cached.expiresAt, at + current.retentionDays * DAY);
      const retained = new Set(
        (
          this.repo.db
            .prepare("SELECT memory_id FROM content_memory WHERE profile_id=? AND workspace_id=?")
            .all(this.profileId, input.workspaceId) as { memory_id: string }[]
        ).map((row) => row.memory_id),
      );
      for (const id of cached.rows.keys()) if (!retained.has(id)) cached.rows.delete(id);
    }
    if (this.warms.has(input.workspaceId)) void this.prewarm(input.workspaceId);
    return body;
  }

  private generation(workspaceId: string): number {
    return this.generations.get(workspaceId) ?? 0;
  }

  private retireIndexes(workspaceId?: string): void {
    for (const [id, work] of this.indexBuilds) {
      if (workspaceId !== undefined && id !== workspaceId) continue;
      work.controller.abort();
      this.indexBuilds.delete(id);
    }
    for (const [id, work] of this.warms) {
      if (workspaceId !== undefined && id !== workspaceId) continue;
      work.controller.abort();
      this.warms.delete(id);
    }
    if (workspaceId === undefined) this.indexes.clear();
    else this.indexes.delete(workspaceId);
  }

  private indexPage(body: RecordBody, ciphertext: string): IndexedPage {
    const { text, ...metadata } = body;
    const normalizedText = text.toLocaleLowerCase();
    return {
      ...metadata,
      normalizedText,
      sourceVersion: fingerprint(ciphertext),
      embeddingVersion: fingerprint(JSON.stringify([body.title, normalizedText.slice(0, 6000)])),
    };
  }

  private authenticated(key: Buffer, row: Row, workspaceId: string): RecordBody {
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
    return body;
  }

  private index(workspaceId: string, originalSignal?: AbortSignal): Promise<Index> {
    const policy = this.policy(workspaceId);
    const memory = readWorkspaceMemory(this.repo, workspaceId);
    const cached = this.indexes.get(workspaceId);
    const identity = JSON.stringify(policy);
    if (
      cached?.revision === memory.revision &&
      cached.policy === identity &&
      cached.epoch === this.derivativeEpoch &&
      cached.generation === this.generation(workspaceId) &&
      cached.expiresAt > this.now()
    )
      return cancellable(Promise.resolve(cached), originalSignal);
    const pending = this.indexBuilds.get(workspaceId);
    if (pending) return cancellable(pending.promise, originalSignal);
    const controller = new AbortController();
    const promise = this.own(() => this.buildIndex(workspaceId, controller.signal));
    this.indexBuilds.set(workspaceId, { controller, promise });
    void promise
      .finally(() => {
        if (this.indexBuilds.get(workspaceId)?.controller === controller)
          this.indexBuilds.delete(workspaceId);
      })
      .catch(() => undefined); // The owning search/prewarm receives the original failure.
    return cancellable(promise, originalSignal);
  }

  private async buildIndex(workspaceId: string, signal: AbortSignal): Promise<Index> {
    const policy = this.policy(workspaceId);
    const memory = readWorkspaceMemory(this.repo, workspaceId);
    const index: Index = {
      revision: memory.revision,
      policy: JSON.stringify(policy),
      epoch: this.derivativeEpoch,
      generation: this.generation(workspaceId),
      expiresAt: Infinity,
      rows: new Map(),
    };
    const retired = () =>
      this.closed ||
      signal.aborted ||
      index.epoch !== this.derivativeEpoch ||
      index.generation !== this.generation(workspaceId) ||
      readWorkspaceMemory(this.repo, workspaceId).revision !== index.revision ||
      JSON.stringify(this.policy(workspaceId)) !== index.policy;
    const empty = () => ({ ...index, expiresAt: this.now(), rows: new Map<string, IndexedPage>() });
    if (!policy.enabled || !memory.enabled) return empty();
    await idle(undefined, { signal });
    if (retired()) return empty();
    const rows = this.repo.db
      .prepare(
        `SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext FROM content_memory
      WHERE profile_id=? AND workspace_id=? AND expires_at>? AND captured_at>? ORDER BY captured_at DESC,memory_id DESC LIMIT ?`,
      )
      .all(
        this.profileId,
        workspaceId,
        this.now(),
        this.now() - policy.retentionDays * DAY,
        MAX_PAGES_PER_SPACE,
      ) as Row[];
    if (!rows.length) {
      await this.retirePendingFactors();
      if (retired()) return empty();
      this.indexes.set(workspaceId, index);
      if (this.indexes.size > MAX_INDEXED_SPACES) this.retireIndexes(this.indexes.keys().next().value!);
      return index;
    }
    let key: Buffer;
    try {
      key = await this.key();
    } catch (error) {
      if (retired()) return empty();
      throw error;
    }
    for (let offset = 0; offset < rows.length; offset += 16) {
      await idle(undefined, { signal });
      if (retired()) return empty();
      for (const row of rows.slice(offset, offset + 16)) {
        if (!memoryOriginAllowed(policy, row.origin) || memory.excludedOrigins?.includes(row.origin))
          continue;
        const body = this.authenticated(key, row, workspaceId);
        if (
          !this.readable(body) ||
          memorySensitivityReason(body.url, body.title) ||
          memoryContentSensitivityReason(body.text)
        )
          continue;
        index.expiresAt = Math.min(
          index.expiresAt,
          row.expires_at,
          row.captured_at + policy.retentionDays * DAY,
        );
        index.rows.set(row.memory_id, this.indexPage(body, row.ciphertext));
      }
    }
    if (retired()) return empty();
    this.indexes.delete(workspaceId);
    this.indexes.set(workspaceId, index);
    if (this.indexes.size > MAX_INDEXED_SPACES) this.retireIndexes(this.indexes.keys().next().value!);
    return index;
  }

  private sourceCurrent(body: IndexedPage): boolean {
    if (!this.readable(body)) return false;
    const row = this.repo.db
      .prepare(
        `SELECT ciphertext,expires_at,captured_at FROM content_memory
      WHERE memory_id=? AND profile_id=? AND workspace_id=?`,
      )
      .get(body.memoryId, this.profileId, body.workspaceId) as
      Pick<Row, "ciphertext" | "expires_at" | "captured_at"> | undefined;
    return (
      !!row &&
      row.expires_at > this.now() &&
      row.captured_at > this.now() - this.policy(body.workspaceId).retentionDays * DAY &&
      fingerprint(row.ciphertext) === body.sourceVersion
    );
  }

  private async readIndexedPage(body: IndexedPage): Promise<RecordBody | undefined> {
    const key = await this.key();
    if (!this.sourceCurrent(body)) return undefined;
    const row = this.repo.db
      .prepare(
        `SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext FROM content_memory
      WHERE memory_id=? AND profile_id=? AND workspace_id=?`,
      )
      .get(body.memoryId, this.profileId, body.workspaceId) as Row;
    return this.authenticated(key, row, body.workspaceId);
  }

  private readable(body: Pick<RecordBody, "workspaceId" | "url">): boolean {
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
  prewarm(workspaceId: string): Promise<void> {
    const previous = this.warms.get(workspaceId);
    const generation = this.generation(workspaceId);
    if (
      previous &&
      previous.generation === generation &&
      !previous.controller.signal.aborted &&
      this.now() - previous.startedAt < 60_000
    )
      return previous.promise;
    previous?.controller.abort();
    const controller = new AbortController();
    const promise = this.own(() => this.prewarmOwned(workspaceId, controller));
    this.warms.set(workspaceId, {
      controller,
      promise,
      generation,
      startedAt: this.now(),
      model: previous?.model,
      vectors: previous?.vectors ?? new Map(),
    });
    if (this.warms.size > MAX_INDEXED_SPACES) this.retireIndexes(this.warms.keys().next().value!);
    return promise;
  }

  private async prewarmOwned(workspaceId: string, controller: AbortController): Promise<void> {
    const signal = AbortSignal.any([
      controller.signal,
      this.discoveryController.signal,
      AbortSignal.timeout(60_000),
    ]);
    await idle(undefined, { signal });
    const policy = this.policy(workspaceId);
    const memory = readWorkspaceMemory(this.repo, workspaceId);
    const epoch = this.derivativeEpoch;
    const warm = this.warms.get(workspaceId)!;
    const current = () =>
      !this.closed &&
      !signal.aborted &&
      warm.controller === controller &&
      this.warms.get(workspaceId) === warm &&
      epoch === this.derivativeEpoch &&
      policy.enabled &&
      memory.enabled !== false &&
      JSON.stringify(this.policy(workspaceId)) === JSON.stringify(policy) &&
      readWorkspaceMemory(this.repo, workspaceId).revision === memory.revision;
    const check = () => {
      if (!current()) throw new AuxError("cancelled", "The original Memory index or policy changed.");
    };
    if (!policy.enabled || !memory.enabled) return;
    const index = await this.index(workspaceId, signal);
    check();
    let models: LocalEmbeddingModel[];
    try {
      models = await this.embeddings.discover(signal);
    } catch (error) {
      check();
      if (error instanceof AuxError && error.code !== "backend_unavailable") throw error;
      warm.model = undefined;
      warm.vectors.clear();
      return; // Lexical recall stays available when the installed local server is offline.
    }
    check();
    const model = policy.semanticModelId
      ? models.find((item) => item.modelId === policy.semanticModelId)
      : models[0];
    if (!model) {
      warm.model = undefined;
      warm.vectors.clear();
      return;
    }
    if (JSON.stringify(warm.model) !== JSON.stringify(model)) warm.vectors.clear();
    warm.model = model;
    for (const [id, cached] of warm.vectors)
      if (index.rows.get(id)?.embeddingVersion !== cached.embeddingVersion) warm.vectors.delete(id);
    const pages = [...index.rows.values()];
    for (let offset = 0; offset < pages.length; offset += 8) {
      await idle(undefined, { signal });
      check();
      const missing: {
        body: IndexedPage;
        cache:
          { read: () => { result: number[] } | undefined; write: (result: number[]) => void } | undefined;
      }[] = [];
      for (const body of pages.slice(offset, offset + 8)) {
        check();
        const eligible = () => current() && this.sourceCurrent(body);
        if (!eligible() || warm.vectors.get(body.memoryId)?.embeddingVersion === body.embeddingVersion)
          continue;
        const cache = await this.prepareDerivative({
          workspaceId,
          signature: JSON.stringify([
            "local-memory-embedding-v2",
            model,
            body.memoryId,
            body.embeddingVersion,
          ]),
          eligible,
          parse: embeddingVector,
        });
        check();
        const cached = cache?.read();
        if (cached && eligible())
          warm.vectors.set(body.memoryId, {
            embeddingVersion: body.embeddingVersion,
            vector: compactVector(cached.result),
          });
        else if (eligible()) missing.push({ body, cache });
      }
      if (!missing.length) continue;
      const vectors = await this.embeddings.embedBatch(
        model,
        missing.map(({ body }) => `${body.title}\n${body.normalizedText.slice(0, 6000)}`),
        signal,
      );
      check();
      for (const [i, item] of missing.entries()) {
        if (!this.sourceCurrent(item.body)) continue;
        const vector = vectors[i]!;
        item.cache?.write(vector);
        if (current() && this.sourceCurrent(item.body))
          warm.vectors.set(item.body.memoryId, {
            embeddingVersion: item.body.embeddingVersion,
            vector: compactVector(vector),
          });
      }
    }
  }

  async semanticSearch(workspaceId: string, query: string, limit = 10, originalSignal?: AbortSignal) {
    return this.own(() => this.semanticSearchOwned(workspaceId, query, limit, originalSignal));
  }

  private async semanticSearchOwned(
    workspaceId: string,
    query: string,
    limit: number,
    originalSignal?: AbortSignal,
  ) {
    this.requireSpace(workspaceId);
    originalSignal?.throwIfAborted();
    const lexical = async (message: string) => ({
      mode: "lexical" as const,
      message,
      matches: await this.search(workspaceId, query, limit, originalSignal),
    });
    if (!this.policy(workspaceId).enabled || !readWorkspaceMemory(this.repo, workspaceId).enabled)
      return lexical("Memory recall is paused in this Space.");
    if (memoryContentSensitivityReason(query))
      throw new AuxError("permission_denied", "Sensitive queries cannot be sent for semantic recall.");
    void this.prewarm(workspaceId);
    const warm = this.warms.get(workspaceId)!;
    if (!warm.model || !warm.vectors.size)
      return lexical("The local index is warming or unavailable. Showing keyword matches.");
    const model = warm.model;
    const checkModel = () => {
      if (JSON.stringify(warm.model) !== JSON.stringify(model))
        throw new AuxError("cancelled", "The installed local embedding model changed.");
    };
    this.retireSemantic(workspaceId);
    const controller = new AbortController();
    this.semanticControllers.set(workspaceId, controller);
    const signal = AbortSignal.any([
      controller.signal,
      warm.controller.signal,
      ...(originalSignal ? [originalSignal] : []),
      AbortSignal.timeout(15_000),
    ]);
    const epoch = this.derivativeEpoch;
    const policy = JSON.stringify(this.policy(workspaceId));
    const revision = readWorkspaceMemory(this.repo, workspaceId).revision;
    const check = () => {
      signal.throwIfAborted();
      if (
        this.closed ||
        epoch !== this.derivativeEpoch ||
        this.warms.get(workspaceId) !== warm ||
        JSON.stringify(this.policy(workspaceId)) !== policy ||
        readWorkspaceMemory(this.repo, workspaceId).revision !== revision
      )
        throw new AuxError("cancelled", "The original Memory search or policy changed.");
    };
    try {
      const index = await this.index(workspaceId, signal);
      check();
      const queryVector = await this.embeddings.embed(model, query, signal);
      check();
      checkModel();
      const ranked: { body: IndexedPage; score: number }[] = [];
      for (const body of index.rows.values()) {
        const cached = warm.vectors.get(body.memoryId);
        if (cached?.embeddingVersion === body.embeddingVersion && this.sourceCurrent(body))
          ranked.push({ body, score: cosineSimilarity(queryVector, cached.vector) });
      }
      const matches = [];
      for (const { body } of ranked
        .sort((a, b) => b.score - a.score || b.body.capturedAt - a.body.capturedAt)
        .slice(0, Math.max(1, Math.min(limit, 20)))) {
        const original = await this.readIndexedPage(body);
        check();
        checkModel();
        if (original) matches.push(this.match(original, original.text.slice(0, 240)));
      }
      return {
        mode: "semantic" as const,
        modelId: model.modelId,
        message:
          "Local semantic matches use prepared article titles and their first 6,000 readable characters; remaining articles index in the background.",
        matches,
      };
    } catch (error) {
      check();
      if (error instanceof AuxError && error.code === "cancelled") {
        warm.controller.abort();
        this.warms.delete(workspaceId);
        void this.prewarm(workspaceId);
        return lexical(
          "The installed local model changed. Showing keyword matches while its index refreshes.",
        );
      }
      if (error instanceof AuxError && error.code === "backend_unavailable")
        return lexical("Local embeddings are unavailable. Showing keyword matches.");
      throw error;
    } finally {
      if (this.semanticControllers.get(workspaceId) === controller)
        this.semanticControllers.delete(workspaceId);
    }
  }

  private match(body: RecordBody, snippet: string) {
    return {
      memoryId: body.memoryId,
      profileId: body.profileId,
      workspaceId: body.workspaceId,
      pageId: body.pageId,
      documentEpoch: body.documentEpoch,
      url: body.url,
      title: body.title,
      capturedAt: body.capturedAt,
      snippet,
    };
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

  private historyEligible(workspaceId: string, entry: HistoryEntry): boolean {
    try {
      const url = new URL(entry.url);
      const fragment = new URLSearchParams(url.hash.slice(1).split("?").pop());
      const credentialKey =
        /^(?:access_token|refresh_token|id_token|token|password|passwd|secret|api_key|apikey|authorization|otp|one_time_code)$/i;
      if ([...url.searchParams.keys(), ...fragment.keys()].some((key) => credentialKey.test(key)))
        return false;
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        !memorySensitivityReason(entry.url, entry.title) &&
        !memoryContentSensitivityReason(entry.title) &&
        memoryOriginAllowed(this.policy(workspaceId), url.origin) &&
        !memorySourceExcluded(readWorkspaceMemory(this.repo, workspaceId), entry.url)
      );
    } catch {
      return false;
    }
  }

  private historyCurrent(workspaceId: string, entry: HistoryEntry): boolean {
    return (
      this.historyEligible(workspaceId, entry) &&
      !!this.repo.db
        .prepare("SELECT 1 FROM history WHERE url=? AND visited_at=? AND title=?")
        .get(entry.url, entry.visitedAt, entry.title)
    );
  }

  private prewarmHistory(workspaceId: string) {
    let index = this.historyIndexes.get(workspaceId);
    if (index && this.now() - index.startedAt < 60_000 && !index.controller.signal.aborted) return index;
    index?.controller.abort();
    const controller = new AbortController();
    index = { controller, startedAt: this.now(), vectors: index?.vectors ?? new Map(), model: index?.model };
    this.historyIndexes.set(workspaceId, index);
    if (this.historyIndexes.size > MAX_INDEXED_SPACES) {
      const oldest = this.historyIndexes.keys().next().value!;
      this.historyIndexes.get(oldest)?.controller.abort();
      this.historyIndexes.delete(oldest);
    }
    void this.own(() => this.prewarmHistoryOwned(workspaceId, index));
    return index;
  }

  private async prewarmHistoryOwned(workspaceId: string, index: HistoryIndex): Promise<void> {
    const signal = AbortSignal.any([
      index.controller.signal,
      this.discoveryController.signal,
      AbortSignal.timeout(60_000),
    ]);
    await idle(undefined, { signal });
    const epoch = this.historyEpoch;
    const policy = this.policy(workspaceId);
    const workspace = readWorkspaceMemory(this.repo, workspaceId);
    const check = () => {
      signal.throwIfAborted();
      if (
        this.closed ||
        epoch !== this.historyEpoch ||
        this.historyIndexes.get(workspaceId) !== index ||
        JSON.stringify(this.policy(workspaceId)) !== JSON.stringify(policy) ||
        JSON.stringify(readWorkspaceMemory(this.repo, workspaceId)) !== JSON.stringify(workspace)
      )
        throw new AuxError("cancelled", "The original history index or policy changed.");
    };
    if (!policy.enabled || !workspace.enabled) return;
    const models = await this.embeddings.discover(signal);
    check();
    const model = policy.semanticModelId
      ? models.find((item) => item.modelId === policy.semanticModelId)
      : models[0];
    if (!model) {
      index.model = undefined;
      index.vectors.clear();
      return;
    }
    if (JSON.stringify(index.model) !== JSON.stringify(model)) index.vectors.clear();
    index.model = model;
    const entries = this.repo
      .listHistory(undefined, MAX_PAGES_PER_SPACE)
      .filter((entry) => this.historyCurrent(workspaceId, entry));
    const keys = new Set(entries.map((entry) => fingerprint(JSON.stringify(entry))));
    for (const key of index.vectors.keys()) if (!keys.has(key)) index.vectors.delete(key);
    for (let offset = 0; offset < entries.length; offset += 8) {
      await idle(undefined, { signal });
      check();
      const missing = entries
        .slice(offset, offset + 8)
        .filter((entry) => !index.vectors.has(fingerprint(JSON.stringify(entry))));
      if (!missing.length) continue;
      const vectors = await this.embeddings.embedBatch(
        model,
        missing.map((entry) => {
          const url = new URL(entry.url);
          return `${entry.title.slice(0, 4000)}\n${url.hostname}${url.pathname.slice(0, 2000)}`;
        }),
        signal,
      );
      check();
      for (const [i, entry] of missing.entries())
        if (this.historyCurrent(workspaceId, entry))
          index.vectors.set(fingerprint(JSON.stringify(entry)), {
            entry,
            vector: compactVector(vectors[i]!),
          });
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
    const count = Math.min(50, Math.max(1, Math.floor(limit)));
    const lexical = async (message: string) => {
      check();
      const entries: HistoryEntry[] = [];
      let inspected = 0;
      for (const entry of this.historyVisits(query)) {
        if (inspected++ % 64 === 0) {
          await idle(undefined, { signal });
          check();
        }
        if (this.historyCurrent(workspaceId, entry)) entries.push(entry);
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
      const index = this.prewarmHistory(workspaceId);
      if (!index.model || !index.vectors.size)
        return lexical(
          "The local history index is warming or unavailable; these are keyword history matches.",
        );
      const model = index.model;
      const queryVector = await this.embeddings.embed(
        model,
        query,
        AbortSignal.any([signal, index.controller.signal]),
      );
      check();
      if (this.historyIndexes.get(workspaceId) !== index)
        throw new AuxError("cancelled", "The original history index changed.");
      if (JSON.stringify(index.model) !== JSON.stringify(model))
        throw new AuxError("cancelled", "The installed local embedding model changed.");
      const ranked = [...index.vectors.values()]
        .filter(({ entry }) => this.historyCurrent(workspaceId, entry))
        .map(({ entry, vector }) => ({ entry, score: cosineSimilarity(queryVector, vector) }))
        .sort((a, b) => b.score - a.score || b.entry.visitedAt - a.entry.visitedAt);
      return {
        mode: "semantic",
        message:
          "Local semantic history matches use prepared titles and URL paths from up to 500 recent visits; older visits remain searchable by keyword.",
        entries: ranked.slice(0, count).map(({ entry }) => entry),
      };
    } catch (error) {
      check();
      if (error instanceof AuxError && error.code === "cancelled") {
        this.historyIndexes.get(workspaceId)?.controller.abort();
        this.historyIndexes.delete(workspaceId);
        this.prewarmHistory(workspaceId);
        return lexical(
          "The installed local model changed; keyword history matches remain available while its index refreshes.",
        );
      }
      if (error instanceof AuxError && error.code === "backend_unavailable")
        return lexical("Local embeddings are unavailable; these are keyword history matches.");
      throw error;
    } finally {
      this.historyControllers.delete(controller);
    }
  }

  /** Internal bounded source projection; complete article text never crosses the renderer catalog API. */
  async recallDocuments(workspaceId: string, signal: AbortSignal): Promise<MemoryRecallSource[]> {
    return this.own(async () => {
      if (!this.policy(workspaceId).enabled || !readWorkspaceMemory(this.repo, workspaceId).enabled)
        return [];
      const index = await this.index(workspaceId, signal);
      const check = () => {
        signal.throwIfAborted();
        if (
          this.closed ||
          this.indexes.get(workspaceId) !== index ||
          !this.policy(workspaceId).enabled ||
          readWorkspaceMemory(this.repo, workspaceId).revision !== index.revision
        )
          throw new AuxError("cancelled", "Saved article sources changed during recall.");
      };
      const sources: MemoryRecallSource[] = [];
      let bytes = 0;
      for (const indexed of [...index.rows.values()].sort((a, b) => b.capturedAt - a.capturedAt)) {
        check();
        const body = await this.readIndexedPage(indexed);
        check();
        if (!body) continue;
        const size = Buffer.byteLength(body.text);
        if (bytes + size > 8 * 1024 * 1024) break;
        bytes += size;
        sources.push({
          sourceId: `page:${body.memoryId}`,
          kind: "page",
          path: body.url,
          title: body.title.slice(0, 500),
          text: body.text,
          revision: indexed.sourceVersion,
          sha256: createHash("sha256").update(body.text).digest("hex"),
          updatedAt: body.capturedAt,
          url: body.url,
          sourceRefs: [],
        });
      }
      check();
      return sources;
    });
  }

  /** Bind returned page recall to its actual immutable encrypted capture before publication. */
  admitRecallSources(
    workspaceId: string,
    sources: readonly Pick<MemoryRecallSource, "kind" | "sourceId" | "revision" | "sha256">[],
    signal: AbortSignal,
  ) {
    return this.own(async () => {
      signal.throwIfAborted();
      if (sources.length > MAX_PAGES_PER_SPACE)
        throw new AuxError("invalid_params", "Too many saved article recall sources.");
      const index = await this.index(workspaceId, signal);
      const admitted: { source: IndexedPage; reference: CapturedSource }[] = [];
      for (const source of sources) {
        signal.throwIfAborted();
        const indexed =
          source.kind === "page" && source.sourceId.startsWith("page:")
            ? index.rows.get(source.sourceId.slice(5))
            : undefined;
        const body = indexed && (await this.readIndexedPage(indexed));
        if (
          !indexed ||
          !body ||
          indexed.sourceVersion !== source.revision ||
          createHash("sha256").update(body.text).digest("hex") !== source.sha256
        )
          throw new AuxError("ref_stale", "A recalled article changed or is no longer eligible.");
        const { text: _text, sessionId: _session, ...metadata } = body;
        admitted.push({ source: indexed, reference: CapturedSourceSchema.parse(metadata) });
      }
      const check = () => {
        signal.throwIfAborted();
        if (
          this.closed ||
          this.indexes.get(workspaceId) !== index ||
          admitted.some(({ source }) => !this.sourceCurrent(source))
        )
          throw new AuxError("cancelled", "A recalled article retired before publication.");
      };
      check();
      return { references: admitted.map(({ reference }) => reference), check };
    });
  }

  /** Historical owner inspection does not re-enable ingestion or grant model access. */
  assertHistoricalSources(workspaceId: string, refs: readonly CapturedSource[]) {
    return this.own(async () => {
      this.requireSpace(workspaceId);
      if (refs.length > MAX_PAGES_PER_SPACE || refs.some((ref) => ref.workspaceId !== workspaceId))
        throw new AuxError("permission_denied", "The recorded article sources belong to another Space.");
      const rows = refs.map(
        (ref) =>
          this.repo.db
            .prepare(
              "SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext FROM content_memory WHERE memory_id=? AND profile_id=? AND workspace_id=?",
            )
            .get(ref.memoryId, this.profileId, workspaceId) as Row | undefined,
      );
      if (rows.some((row) => !row))
        throw new AuxError("permission_denied", "A recorded article was removed.");
      const key = await this.key();
      if (this.closed) throw new AuxError("cancelled", "Article storage is closed.");
      const bodies = rows.map((row) => this.authenticated(key, row!, workspaceId));
      const check = () => {
        const policy = this.policy(workspaceId),
          memory = readWorkspaceMemory(this.repo, workspaceId);
        if (this.closed) throw new AuxError("cancelled", "Article storage is closed.");
        for (let index = 0; index < refs.length; index++) {
          const body = bodies[index]!,
            row = rows[index]!;
          const current = this.repo.db
            .prepare(
              "SELECT ciphertext,expires_at FROM content_memory WHERE memory_id=? AND profile_id=? AND workspace_id=?",
            )
            .get(body.memoryId, this.profileId, workspaceId) as
            Pick<Row, "ciphertext" | "expires_at"> | undefined;
          const { text: _text, sessionId: _session, ...metadata } = body;
          if (
            !current ||
            current.ciphertext !== row.ciphertext ||
            current.expires_at <= this.now() ||
            body.capturedAt <= this.now() - policy.retentionDays * DAY ||
            !sameCapturedSource(refs[index]!, CapturedSourceSchema.parse(metadata)) ||
            !memoryOriginAllowed(policy, new URL(body.url).origin) ||
            memorySourceExcluded(memory, body.url) ||
            memorySensitivityReason(body.url, body.title) ||
            memoryContentSensitivityReason(body.text)
          )
            throw new AuxError(
              "permission_denied",
              "A recorded article expired, was forgotten or is excluded.",
            );
        }
      };
      check();
      return check;
    });
  }

  /** Catalog metadata pages never decrypt complete articles into the renderer. */
  async list(workspaceId: string, options: MethodParams<"workspaces.contentMemory.list">) {
    return this.own(async () => {
      if (!this.policy(workspaceId).enabled || !readWorkspaceMemory(this.repo, workspaceId).enabled)
        return { items: [], selected: [], nextCursor: null };
      const index = await this.index(workspaceId);
      if (this.indexes.get(workspaceId) !== index || this.closed)
        throw new AuxError("cancelled", "The saved article collection changed. Try again.");
      const selectedIds = new Set(options.selectedIds);
      const available = [...index.rows.values()].filter((body) => this.readable(body));
      const selected = available
        .filter((body) => selectedIds.has(body.memoryId))
        .map((body) => {
          const {
            normalizedText: _text,
            sourceVersion: _source,
            embeddingVersion: _embedding,
            sessionId: _session,
            ...metadata
          } = body;
          return CapturedSourceSchema.parse(metadata);
        });
      const query = (options.query ?? "").toLocaleLowerCase();
      const cursor = options.cursor;
      const candidates = available
        .filter(
          (body) =>
            `${body.title} ${body.url}`.toLocaleLowerCase().includes(query) &&
            (!cursor ||
              body.capturedAt < cursor.capturedAt ||
              (body.capturedAt === cursor.capturedAt && body.memoryId < cursor.memoryId)),
        )
        .sort(
          (a, b) =>
            b.capturedAt - a.capturedAt || (a.memoryId < b.memoryId ? 1 : a.memoryId > b.memoryId ? -1 : 0),
        );
      const page = candidates.slice(0, 20);
      const items = page.map((body) => {
        const {
          normalizedText: _text,
          sourceVersion: _source,
          embeddingVersion: _embedding,
          sessionId: _session,
          ...metadata
        } = body;
        return CapturedSourceSchema.parse(metadata);
      });
      const last = page.at(-1);
      return {
        items,
        selected,
        nextCursor:
          candidates.length > page.length && last
            ? { capturedAt: last.capturedAt, memoryId: last.memoryId }
            : null,
      };
    });
  }

  async search(workspaceId: string, query: string, limit = 10, signal?: AbortSignal) {
    return this.own(() => this.searchOwned(workspaceId, query, limit, signal));
  }

  private async searchOwned(workspaceId: string, query: string, limit: number, signal?: AbortSignal) {
    signal?.throwIfAborted();
    if (!this.policy(workspaceId).enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return [];
    const epoch = this.derivativeEpoch;
    const revision = readWorkspaceMemory(this.repo, workspaceId).revision;
    const policy = JSON.stringify(this.policy(workspaceId));
    const check = () => {
      signal?.throwIfAborted();
      if (
        this.closed ||
        epoch !== this.derivativeEpoch ||
        revision !== readWorkspaceMemory(this.repo, workspaceId).revision ||
        policy !== JSON.stringify(this.policy(workspaceId))
      )
        throw new AuxError("cancelled", "The original Memory source or policy changed.");
    };
    const tokens = terms(query.slice(0, 200)).slice(0, 8);
    if (!tokens.length) return [];
    const index = await this.index(workspaceId, signal);
    check();
    if (!this.policy(workspaceId).enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return [];
    const frequencies = new Map(tokens.map((token) => [token, 0]));
    const candidates: { body: IndexedPage; haystack: { title: string; text: string }; hits: string[] }[] = [];
    let inspected = 0;
    for (const body of index.rows.values()) {
      if (inspected++ % 16 === 0) {
        await idle(undefined, { signal });
        check();
      }
      const haystack = { title: body.title.toLocaleLowerCase(), text: body.normalizedText };
      const hits = tokens.filter(
        (token) => termPosition(haystack.title, token) >= 0 || termPosition(haystack.text, token) >= 0,
      );
      for (const token of hits) frequencies.set(token, frequencies.get(token)! + 1);
      // Multi-term questions need corroboration, not one common incidental word.
      if (hits.length >= (tokens.length >= 3 ? 2 : 1)) candidates.push({ body, haystack, hits });
    }
    const ranked = candidates
      .map(({ body, haystack, hits }) => {
        const score =
          hits.reduce((sum, token) => {
            const frequency = frequencies.get(token) ?? 1;
            const rarity = Math.log(1 + (index.rows.size + 1) / frequency);
            return sum + rarity * (termPosition(haystack.title, token) >= 0 ? 3 : 1);
          }, 0) *
          (0.5 + hits.length / tokens.length);
        return { body, score };
      })
      .sort((a, b) => b.score - a.score || b.body.capturedAt - a.body.capturedAt);
    const matches = [];
    for (const { body } of ranked
      .filter(({ body }) => this.readable(body))
      .slice(0, Math.max(1, Math.min(limit, 20)))) {
      check();
      const original = await this.readIndexedPage(body);
      check();
      if (!original) continue;
      matches.push(this.match(original, contentMemoryExcerpt(original.text, query)));
    }
    return matches;
  }

  async get(workspaceId: string, memoryId: string): Promise<RecordBody | undefined> {
    return this.own(() => this.getOwned(workspaceId, memoryId));
  }

  private async getOwned(workspaceId: string, memoryId: string): Promise<RecordBody | undefined> {
    if (!this.policy(workspaceId).enabled || readWorkspaceMemory(this.repo, workspaceId)?.enabled === false)
      return undefined;
    const record = (await this.index(workspaceId)).rows.get(memoryId);
    return record && this.readable(record) ? this.readIndexedPage(record) : undefined;
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
    beforeRemoval?: BeforeContentRemoval,
  ): Promise<number> {
    return this.own(() => this.forgetOwned(workspaceId, memoryId, beforeRemoval));
  }

  private async forgetOwned(
    workspaceId: string,
    memoryId?: string,
    beforeRemoval?: BeforeContentRemoval,
  ): Promise<number> {
    return this.serialized(async () => {
      this.requireSpace(workspaceId);
      const removed = await this.rotateSelection(
        (row) => row.workspace_id === workspaceId && (!memoryId || row.memory_id === memoryId),
        undefined,
        undefined,
        beforeRemoval,
        { kind: "forget", scope: { workspaceId, memoryId } },
      );
      if (removed) this.indexes.clear();
      return removed;
    });
  }

  private async rotateSelection(
    select: (row: Row & { workspace_id: string }) => boolean,
    expiryFor: (row: Row & { workspace_id: string }) => number = (row) => row.expires_at,
    onCommit: () => void = () => {},
    beforeRemoval?: BeforeContentRemoval,
    removal?: { kind: "forget" | "policy"; scope: ContentRemovalScope },
  ): Promise<number> {
    this.retireSemantic();
    this.retireIndexes();
    this.retireHistory();
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
      const finalCheck = removal?.kind === "forget" ? await beforeRemoval?.() : undefined;
      this.repo.transaction(() => {
        if (typeof finalCheck === "function") finalCheck(removal?.scope);
        const update = this.repo.db.prepare("UPDATE content_memory SET expires_at=? WHERE memory_id=?");
        for (const row of rows)
          if (expiryFor(row) !== row.expires_at) update.run(expiryFor(row), row.memory_id);
        onCommit();
      });
      if (typeof finalCheck === "function") finalCheck.committed?.();
      await this.retirePendingFactors();
      return 0;
    }
    const finalCheck = await beforeRemoval?.();
    const oldKey = await this.key();
    const oldFactor = this.factorName();
    rows = query();
    const removed = rows.filter(select);
    if (!removed.length && !hasDerivatives) {
      this.repo.transaction(() => {
        if (typeof finalCheck === "function") finalCheck(removal?.scope);
        onCommit();
      });
      if (typeof finalCheck === "function") finalCheck.committed?.();
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
        if (typeof finalCheck === "function") finalCheck(removal?.scope);
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
    if (typeof finalCheck === "function") finalCheck.committed?.();
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
