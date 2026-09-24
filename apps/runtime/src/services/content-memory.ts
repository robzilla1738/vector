import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomUUID } from "node:crypto";
import { AuxError, type WorkspaceMemory } from "@aux/contracts";
import { memoryOrigin, memorySourceExcluded } from "@aux/contracts/memory-context";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { NativeBridge } from "../native.js";

const KEY_NAME = "pageMemoryKey";
const DAY = 86_400_000;
const MAX_TEXT_BYTES = 64 * 1024;
const MAX_PAGES_PER_SPACE = 500;
const MAX_INDEXED_SPACES = 2;

type Policy = { enabled: boolean; retentionDays: 30 | 90; allowedOrigins: string[] };
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
type Row = { memory_id: string; source_key: string; origin: string; captured_at: number; expires_at: number; ciphertext: string };
type Index = { revision: number; expiresAt: number; rows: Map<string, RecordBody>; tokens: Map<string, Set<string>> };

const policyKey = (workspaceId: string) => `contentMemoryPolicy:${workspaceId}`;
const STOPWORDS = new Set(["a", "an", "and", "are", "at", "be", "by", "did", "do", "does", "for", "from", "how", "in", "is", "it", "of", "on", "or", "the", "to", "was", "were", "what", "when", "where", "which", "who", "why", "with"]);
const terms = (text: string) => [...new Set([...new Intl.Segmenter(undefined, { granularity: "word" }).segment(text)]
  .filter(part => part.isWordLike).map(part => part.segment.toLocaleLowerCase())
  .filter(part => part.length > 1 && !STOPWORDS.has(part)))];

/** Page text is encrypted before SQLite sees it. Search structures exist only in bounded process memory. */
export class ContentMemoryStore {
  private keyPromise?: Promise<Buffer>;
  private indexes = new Map<string, Index>();
  private unsubscribe?: () => void;

  constructor(private repo: Repo, private native: Pick<NativeBridge, "readSecret" | "storeSecret">,
    private profileId: string, private now: () => number = Date.now, events?: EventBus) {
    if (!profileId) throw new Error("Protected page memory requires a Profile identity.");
    this.unsubscribe = events?.subscribe(event => {
      if (event.type === "workspace.memory.updated" && typeof event.payload.workspaceId === "string")
        this.indexes.delete(event.payload.workspaceId);
    });
  }

  close() { this.unsubscribe?.(); this.indexes.clear(); this.keyPromise = undefined; }

  private requireSpace(workspaceId: string) {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "This Space no longer exists.");
  }

  policy(workspaceId: string): Policy {
    this.requireSpace(workspaceId);
    const saved = this.repo.getSetting<unknown>(policyKey(workspaceId));
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      const value = saved as Record<string, unknown>;
      if (typeof value.enabled === "boolean" && (value.retentionDays === 30 || value.retentionDays === 90)
        && Array.isArray(value.allowedOrigins) && value.allowedOrigins.every(origin => typeof origin === "string"))
        return { enabled: value.enabled, retentionDays: value.retentionDays, allowedOrigins: value.allowedOrigins };
    }
    return { enabled: false, retentionDays: 30, allowedOrigins: [] };
  }

  setPolicy(workspaceId: string, policy: Policy): Policy {
    this.requireSpace(workspaceId);
    if (typeof policy.enabled !== "boolean" || (policy.retentionDays !== 30 && policy.retentionDays !== 90)
      || !Array.isArray(policy.allowedOrigins) || policy.allowedOrigins.length > 100)
      throw new AuxError("invalid_params", "Choose a valid content-memory policy.");
    let allowedOrigins: string[];
    try {
      allowedOrigins = [...new Set(policy.allowedOrigins.map(origin => memoryOrigin(origin)))];
      if (allowedOrigins.some(origin => !origin.startsWith("https://"))) throw new Error("Secure origin required");
    }
    catch { throw new AuxError("invalid_params", "Use valid web origins for content recall."); }
    const next = { ...policy, allowedOrigins };
    this.repo.transaction(() => {
      this.repo.setSetting(policyKey(workspaceId), next);
      this.repo.db.prepare(`UPDATE content_memory SET expires_at=min(expires_at,captured_at+?)
        WHERE profile_id=? AND workspace_id=?`).run(policy.retentionDays * DAY, this.profileId, workspaceId);
      this.repo.db.prepare("DELETE FROM content_memory WHERE expires_at<=?").run(this.now());
      if (allowedOrigins.length) {
        const placeholders = allowedOrigins.map(() => "?").join(",");
        this.repo.db.prepare(`DELETE FROM content_memory WHERE profile_id=? AND workspace_id=? AND origin NOT IN (${placeholders})`)
          .run(this.profileId, workspaceId, ...allowedOrigins);
      } else this.repo.db.prepare("DELETE FROM content_memory WHERE profile_id=? AND workspace_id=?")
        .run(this.profileId, workspaceId);
    });
    this.indexes.delete(workspaceId);
    return next;
  }

  private async key(): Promise<Buffer> {
    this.keyPromise ??= (async () => {
      let saved = (await this.native.readSecret(KEY_NAME)).value;
      if (!saved) {
        if (this.repo.db.prepare("SELECT 1 FROM content_memory WHERE profile_id=? LIMIT 1").get(this.profileId))
          throw new Error("Protected page-memory key is missing. Restore the original OS credential store or forget this memory.");
        const created = randomBytes(32).toString("base64");
        await this.native.storeSecret(KEY_NAME, created);
        saved = (await this.native.readSecret(KEY_NAME)).value;
        if (saved !== created) throw new Error("Protected page-memory key could not be confirmed.");
      }
      const key = Buffer.from(saved, "base64");
      if (key.length !== 32 || key.toString("base64") !== saved)
        throw new Error("Protected page-memory key is invalid. Restore the original OS credential store or forget this memory.");
      return key;
    })().catch(error => { this.keyPromise = undefined; throw error; });
    return this.keyPromise;
  }

  private encrypt(key: Buffer, body: RecordBody): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const bytes = Buffer.concat([cipher.update(JSON.stringify(body), "utf8"), cipher.final()]);
    return `v1:${Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString("base64")}`;
  }

  private decrypt(key: Buffer, ciphertext: string): RecordBody {
    if (!ciphertext.startsWith("v1:")) throw new Error("Unknown protected page-memory format.");
    const bytes = Buffer.from(ciphertext.slice(3), "base64");
    if (bytes.length < 29) throw new Error("Protected page memory is incomplete.");
    const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8")) as RecordBody;
  }

  /** Caller must establish foreground/document eligibility before supplying page text. */
  async saveEligible(input: Omit<RecordBody, "memoryId" | "profileId" | "capturedAt">): Promise<RecordBody> {
    const policy = this.policy(input.workspaceId);
    const memory = this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${input.workspaceId}`);
    if (!policy.enabled || memory?.enabled === false) throw new AuxError("permission_denied", "Enable page-content recall in this Space first.");
    let url: URL;
    try { url = new URL(input.url); } catch { throw new AuxError("invalid_params", "Choose a secure web page."); }
    if (url.protocol !== "https:" || url.username || url.password || input.url.length > 8192
      || !policy.allowedOrigins.includes(url.origin)
      || memory && memorySourceExcluded(memory, url.href))
      throw new AuxError("permission_denied", "This page is not eligible for content recall.");
    if (!input.pageId || input.pageId.length > 200 || (input.sessionId?.length ?? 0) > 200
      || !Number.isSafeInteger(input.documentEpoch) || input.documentEpoch < 0
      || !input.text.trim() || Buffer.byteLength(input.text, "utf8") > MAX_TEXT_BYTES)
      throw new AuxError("invalid_params", "Use readable page text up to 64 KB from the current document.");
    url.search = ""; url.hash = "";
    const key = await this.key();
    // Recheck after the OS credential call; opt-in or exclusions may have changed.
    const current = this.policy(input.workspaceId);
    const currentMemory = this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${input.workspaceId}`);
    if (!current.enabled || !current.allowedOrigins.includes(url.origin) || currentMemory?.enabled === false
      || currentMemory && memorySourceExcluded(currentMemory, url.href))
      throw new AuxError("permission_denied", "Page-content recall changed while this page was being protected.");
    const sourceKey = createHmac("sha256", key).update(`${this.profileId}\0${input.workspaceId}\0${url.href}`).digest("hex");
    const existing = this.repo.db.prepare("SELECT memory_id FROM content_memory WHERE profile_id=? AND workspace_id=? AND source_key=?")
      .get(this.profileId, input.workspaceId, sourceKey) as { memory_id: string } | undefined;
    const at = this.now();
    const body: RecordBody = { ...input, memoryId: existing?.memory_id ?? randomUUID(), profileId: this.profileId,
      url: url.href, title: input.title.trim().slice(0, 300) || url.hostname, text: input.text.trim(), capturedAt: at };
    this.repo.transaction(() => {
      this.repo.db.prepare(`INSERT INTO content_memory(memory_id,profile_id,workspace_id,source_key,origin,captured_at,expires_at,ciphertext)
        VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,workspace_id,source_key) DO UPDATE SET
        origin=excluded.origin,captured_at=excluded.captured_at,expires_at=excluded.expires_at,ciphertext=excluded.ciphertext`)
        .run(body.memoryId, this.profileId, input.workspaceId, sourceKey, url.origin, at, at + current.retentionDays * DAY, this.encrypt(key, body));
      this.repo.db.prepare(`DELETE FROM content_memory WHERE memory_id IN (SELECT memory_id FROM content_memory
        WHERE profile_id=? AND workspace_id=? ORDER BY captured_at DESC,memory_id DESC LIMIT -1 OFFSET ?)`)
        .run(this.profileId, input.workspaceId, MAX_PAGES_PER_SPACE);
    });
    this.indexes.delete(input.workspaceId);
    return body;
  }

  private async index(workspaceId: string): Promise<Index> {
    const memory = this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${workspaceId}`);
    const revision = memory?.revision ?? 0;
    const cached = this.indexes.get(workspaceId);
    if (cached?.revision === revision && cached.expiresAt > this.now()) return cached;
    const key = await this.key();
    const policy = this.policy(workspaceId);
    if (!policy.enabled || this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${workspaceId}`)?.enabled === false)
      return { revision, expiresAt: this.now(), rows: new Map(), tokens: new Map() };
    const rows = this.repo.db.prepare(`SELECT memory_id,source_key,origin,captured_at,expires_at,ciphertext FROM content_memory
      WHERE profile_id=? AND workspace_id=? AND expires_at>? AND captured_at>? ORDER BY captured_at DESC LIMIT ?`)
      .all(this.profileId, workspaceId, this.now(), this.now() - policy.retentionDays * DAY, MAX_PAGES_PER_SPACE) as Row[];
    const index: Index = { revision, expiresAt: Infinity, rows: new Map(), tokens: new Map() };
    for (const row of rows) {
      if (!policy.allowedOrigins.includes(row.origin) || memory?.excludedOrigins?.includes(row.origin)) continue;
      index.expiresAt = Math.min(index.expiresAt, row.expires_at);
      const body = this.decrypt(key, row.ciphertext);
      const sourceKey = createHmac("sha256", key).update(`${this.profileId}\0${workspaceId}\0${body.url}`).digest("hex");
      if (body.memoryId !== row.memory_id || body.profileId !== this.profileId || body.workspaceId !== workspaceId
        || new URL(body.url).origin !== row.origin || body.capturedAt !== row.captured_at || sourceKey !== row.source_key)
        throw new Error("Protected page-memory provenance does not match its storage record.");
      index.rows.set(row.memory_id, body);
      for (const token of terms(`${body.title}\n${body.text}`)) {
        let ids = index.tokens.get(token);
        if (!ids) index.tokens.set(token, ids = new Set());
        ids.add(row.memory_id);
      }
    }
    this.indexes.delete(workspaceId);
    this.indexes.set(workspaceId, index);
    if (this.indexes.size > MAX_INDEXED_SPACES) this.indexes.delete(this.indexes.keys().next().value!);
    return index;
  }

  private readable(body: RecordBody): boolean {
    const policy = this.policy(body.workspaceId);
    const memory = this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${body.workspaceId}`);
    return policy.enabled && memory?.enabled !== false && policy.allowedOrigins.includes(new URL(body.url).origin)
      && (!memory || !memorySourceExcluded(memory, body.url));
  }

  async search(workspaceId: string, query: string, limit = 10) {
    if (!this.policy(workspaceId).enabled || this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${workspaceId}`)?.enabled === false) return [];
    const tokens = terms(query.slice(0, 200)).slice(0, 8);
    if (!tokens.length) return [];
    const index = await this.index(workspaceId);
    if (!this.policy(workspaceId).enabled || this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${workspaceId}`)?.enabled === false) return [];
    const candidates = new Set(tokens.flatMap(token => [...(index.tokens.get(token) ?? [])]));
    const ranked = [...candidates].map(id => {
      const body = index.rows.get(id)!;
      const titleTokens = new Set(terms(body.title));
      const hits = tokens.filter(token => index.tokens.get(token)?.has(id));
      const score = hits.reduce((sum, token) => {
        const frequency = index.tokens.get(token)?.size ?? 1;
        const rarity = Math.log(1 + (index.rows.size + 1) / frequency);
        return sum + rarity * (titleTokens.has(token) ? 3 : 1);
      }, 0) * (0.5 + hits.length / tokens.length);
      return { body, score, hits };
    }).sort((a, b) => b.score - a.score || b.body.capturedAt - a.body.capturedAt);
    return ranked.filter(({ body }) => this.readable(body)).slice(0, Math.max(1, Math.min(limit, 20)))
      .map(({ body, hits }) => {
        const lower = body.text.toLocaleLowerCase();
        const at = Math.max(0, lower.indexOf(hits.find(token => lower.includes(token)) ?? hits[0]!));
        const start = Math.max(0, at - 70), end = Math.min(body.text.length, start + 240);
        return { memoryId: body.memoryId, profileId: body.profileId, workspaceId: body.workspaceId,
          url: body.url, title: body.title, capturedAt: body.capturedAt, pageId: body.pageId,
          documentEpoch: body.documentEpoch, snippet: `${start ? "…" : ""}${body.text.slice(start, end)}${end < body.text.length ? "…" : ""}` };
      });
  }

  async get(workspaceId: string, memoryId: string): Promise<RecordBody | undefined> {
    if (!this.policy(workspaceId).enabled || this.repo.getSetting<WorkspaceMemory>(`workspaceMemory:${workspaceId}`)?.enabled === false) return undefined;
    const record = (await this.index(workspaceId)).rows.get(memoryId);
    return record && this.readable(record) ? record : undefined;
  }

  forget(workspaceId: string, memoryId?: string): number {
    this.requireSpace(workspaceId);
    const result = memoryId
      ? this.repo.db.prepare("DELETE FROM content_memory WHERE profile_id=? AND workspace_id=? AND memory_id=?").run(this.profileId, workspaceId, memoryId)
      : this.repo.db.prepare("DELETE FROM content_memory WHERE profile_id=? AND workspace_id=?").run(this.profileId, workspaceId);
    this.indexes.delete(workspaceId);
    return Number(result.changes);
  }

  prune(): number {
    const result = this.repo.db.prepare("DELETE FROM content_memory WHERE expires_at<=?").run(this.now());
    if (result.changes) this.indexes.clear();
    return Number(result.changes);
  }
}
