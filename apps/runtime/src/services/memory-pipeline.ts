import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { AuxError, MemoryClaimSchema, MemoryPipelineForgetParams, MemoryPipelineInboxSchema, MemoryPipelineOverviewSchema,
  MemoryPipelinePolicySchema, type MemoryClaim } from "@aux/contracts";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import type { Run } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

const exec = promisify(execFile);
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
type Manifest = { generation: string; keyName: string };
type Revision = { revisionId: string; capturedAt: number; claims: MemoryClaim[] };
type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret">;

/** Opt-in, encrypted, git-backed Space memory. All derived views are rebuilt from source claims. */
export class MemoryPipeline {
  constructor(private repo: Repo, private secrets: Secrets, private baseDir: string, private profileId: string) {
    if (!profileId) throw new Error("Memory pipeline requires a Profile identity.");
    repo.db.exec(`CREATE TABLE IF NOT EXISTS memory_pipeline_leases(
      workspace_id TEXT PRIMARY KEY, owner TEXT NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS memory_pipeline_watermarks(
      workspace_id TEXT NOT NULL, run_id TEXT NOT NULL, captured_at INTEGER NOT NULL,
      PRIMARY KEY(workspace_id,run_id));`);
  }

  private async leased<T>(workspaceId: string, work: () => Promise<T>): Promise<T> {
    const owner = randomUUID();
    const now = Date.now();
    this.repo.db.prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=? AND expires_at<=?").run(workspaceId, now);
    const claimed = this.repo.db.prepare("INSERT OR IGNORE INTO memory_pipeline_leases(workspace_id,owner,expires_at) VALUES(?,?,?)")
      .run(workspaceId, owner, now + 5 * 60_000);
    if (claimed.changes !== 1) throw new AuxError("conflict", "Space memory is being updated. Try again after it finishes.");
    try { return await work(); }
    finally { this.repo.db.prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=? AND owner=?").run(workspaceId, owner); }
  }

  private requireSpace(workspaceId: string) {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Space does not exist.");
  }

  private directory(workspaceId: string) {
    return join(this.baseDir, sha(this.profileId).slice(0, 24), sha(workspaceId).slice(0, 24));
  }

  policy(workspaceId: string) {
    this.requireSpace(workspaceId);
    const saved = MemoryPipelinePolicySchema.safeParse(this.repo.getSetting(`memoryPipelinePolicy:${workspaceId}`));
    return saved.success ? saved.data : { workspaceId, enabled: false };
  }

  setPolicy(workspaceId: string, enabled: boolean) {
    const policy = MemoryPipelinePolicySchema.parse({ workspaceId, enabled });
    this.requireSpace(workspaceId);
    this.repo.setSetting(`memoryPipelinePolicy:${workspaceId}`, policy);
    return policy;
  }

  private sourceEligible(workspaceId: string, run: Run): boolean {
    if (run.config?.contextMemoryIds?.length || run.config?.contextAttachmentIds?.length
      || run.config?.contextImageArtifactIds?.length) return false;
    const excluded = this.repo.getSetting<{ excludedOrigins?: string[] }>(`workspaceMemory:${workspaceId}`)?.excludedOrigins ?? [];
    const allowedPage = (url: string, title: string) => {
      if (memorySensitivityReason(url, title)) return false;
      try { return !excluded.includes(new URL(url).origin); }
      catch { return false; }
    };
    for (const ref of run.config?.contextPageRefs ?? []) {
      const page = this.repo.getPage(ref.pageId);
      if (!page || !allowedPage(ref.url, page.title)) return false;
    }
    for (const pageId of run.pageIds) {
      const page = this.repo.getPage(pageId);
      if (!page || !allowedPage(page.url, page.title)) return false;
    }
    const report = [run.result?.report, run.result?.answer, run.result?.text]
      .find(value => typeof value === "string") as string | undefined;
    if (report && memoryContentSensitivityReason(report)) return false;
    return true;
  }

  private async git(directory: string, ...args: string[]) {
    await exec("git", ["-C", directory, "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false",
      "-c", "user.name=Aux Memory", "-c", "user.email=memory@aux.invalid", ...args],
    { timeout: 10_000, maxBuffer: 64_000, env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1" } });
  }

  private async init(directory: string) {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    try { await readdir(join(directory, ".git")); }
    catch { await this.git(directory, "init", "-q"); }
  }

  private async manifest(directory: string): Promise<Manifest | null> {
    let value: unknown;
    try { value = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8")); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
    if (!value || typeof value !== "object" ||
      !/^g-[a-f0-9-]{36}$/.test((value as Manifest).generation) ||
      !/^mem_[a-f0-9_]{1,59}$/.test((value as Manifest).keyName))
      throw new Error("Space memory manifest is invalid.");
    return value as Manifest;
  }

  private async key(manifest: Manifest): Promise<Buffer> {
    const value = (await this.secrets.readSecret(manifest.keyName)).value;
    if (!value) throw new Error("Space memory key is unavailable. Restore the original OS credential store or forget this memory.");
    const key = Buffer.from(value, "base64");
    if (key.length !== 32 || key.toString("base64") !== value) throw new Error("Space memory key is invalid.");
    return key;
  }

  private seal(key: Buffer, workspaceId: string, filename: string, plaintext: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(Buffer.from(`${this.profileId}\0${workspaceId}\0${filename}`));
    return Buffer.concat([iv, cipher.update(plaintext, "utf8"), cipher.final(), cipher.getAuthTag()]);
  }

  private open(key: Buffer, workspaceId: string, filename: string, bytes: Buffer) {
    if (bytes.length < 29) throw new Error("Space memory file is incomplete.");
    const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from(`${this.profileId}\0${workspaceId}\0${filename}`));
    decipher.setAuthTag(bytes.subarray(-16));
    return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]).toString("utf8");
  }

  private async readClaims(workspaceId: string): Promise<{ claims: MemoryClaim[]; inbox: MemoryClaim[]; history: Revision[]; prior: Manifest | null }> {
    const directory = this.directory(workspaceId);
    const prior = await this.manifest(directory);
    if (!prior) return { claims: [], inbox: [], history: [], prior: null };
    const key = await this.key(prior);
    const filename = "claims.json.enc";
    const bytes = await readFile(join(directory, prior.generation, filename));
    const parsed = JSON.parse(this.open(key, workspaceId, filename, bytes));
    if (!Array.isArray(parsed)) throw new Error("Space memory claims are invalid.");
    let inbox: MemoryClaim[] = [];
    try { inbox = MemoryPipelineInboxSchema.parse(JSON.parse(this.open(key, workspaceId, "inbox.json.enc",
      await readFile(join(directory, prior.generation, "inbox.json.enc"))))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    let history: Revision[] = [];
    try {
      const revisions = JSON.parse(this.open(key, workspaceId, "history.json.enc",
        await readFile(join(directory, prior.generation, "history.json.enc"))));
      if (!Array.isArray(revisions) || revisions.length > 20) throw new Error("Space memory history is invalid.");
      history = revisions.map((revision: Revision) => ({ revisionId: revision.revisionId,
        capturedAt: revision.capturedAt, claims: MemoryPipelineInboxSchema.parse(revision.claims) }));
      if (history.some(revision => !/^[a-f0-9-]{36}$/.test(revision.revisionId)
        || !Number.isSafeInteger(revision.capturedAt) || revision.capturedAt < 0))
        throw new Error("Space memory history is invalid.");
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    return { claims: parsed.map(value => MemoryClaimSchema.parse(value)), inbox, history, prior };
  }

  private summary(claims: MemoryClaim[]): string {
    const latest = [...claims].filter(claim => !memoryContentSensitivityReason(claim.text))
      .sort((a, b) => b.capturedAt - a.capturedAt).slice(0, 4);
    const lines: string[] = [];
    let bytes = 0;
    for (const claim of latest) {
      const line = `- ${claim.text.slice(0, 360)} [run:${claim.sourceRunId}]`;
      const size = Buffer.byteLength(line, "utf8") + 1;
      if (bytes + size > 1700) break;
      lines.push(line);
      bytes += size;
    }
    return lines.join("\n");
  }

  private snapshot(claims: MemoryClaim[]): Revision {
    return { revisionId: randomUUID(), capturedAt: Date.now(), claims };
  }

  private async writeGeneration(workspaceId: string, claims: MemoryClaim[], inbox: MemoryClaim[], history: Revision[], prior: Manifest | null) {
    const directory = this.directory(workspaceId);
    await this.init(directory);
    const generation = `g-${randomUUID()}`;
    const keyName = `mem_${sha(this.profileId).slice(0, 10)}_${sha(workspaceId).slice(0, 10)}_${generation.slice(2, 10)}`;
    const key = randomBytes(32);
    const target = join(directory, generation);
    let priorKeyRetired = false;
    try {
      await this.secrets.storeSecret(keyName, key.toString("base64"));
      if ((await this.secrets.readSecret(keyName)).value !== key.toString("base64"))
        throw new Error("Space memory key could not be confirmed.");
      await mkdir(join(target, "rollouts"), { recursive: true, mode: 0o700 });
      const put = (name: string, value: string) => writeFile(join(target, name), this.seal(key, workspaceId, name, value), { mode: 0o600 });
      await put("claims.json.enc", JSON.stringify(claims));
      await put("inbox.json.enc", JSON.stringify(inbox));
      await put("history.json.enc", JSON.stringify(history));
      await put("summary.md.enc", this.summary(claims));
      await put("handbook.md.enc", claims.map(claim => `## ${claim.claimId}\nSource run: ${claim.sourceRunId}\n${claim.text}`).join("\n\n"));
      for (const claim of claims) await put(`rollouts/${claim.claimId}.json.enc`, JSON.stringify(claim));
      const manifest: Manifest = { generation, keyName };
      const temp = join(directory, `manifest-${randomUUID()}.tmp`);
      await writeFile(temp, JSON.stringify(manifest), { mode: 0o600 });
      await rename(temp, join(directory, "manifest.json"));
      if (prior) {
        // The prior key is destroyed before its encrypted generation is removed or committed.
        // Historical Git objects are therefore unable to reveal forgotten claims.
        await this.secrets.storeSecret(prior.keyName, "");
        priorKeyRetired = true;
        await rm(join(directory, prior.generation), { recursive: true, force: true });
      }
      await this.git(directory, "add", "-A");
      await this.git(directory, "commit", "-q", "--allow-empty", "-m", prior ? "Update Space memory" : "Initialize Space memory");
    } catch (error) {
      // Before key retirement, restore the old pointer so failures cannot strand readable data.
      // After retirement the new generation is authoritative even if Git commit must be retried.
      if (!priorKeyRetired) {
        if ((await this.manifest(directory))?.generation === generation) {
          if (prior) await writeFile(join(directory, "manifest.json"), JSON.stringify(prior), { mode: 0o600 });
          else await rm(join(directory, "manifest.json"), { force: true });
        }
        await rm(target, { recursive: true, force: true });
        await this.secrets.storeSecret(keyName, "");
      }
      throw error;
    }
  }

  async extractRun(workspaceId: string, runId: string) {
    if (!this.policy(workspaceId).enabled) throw new AuxError("permission_denied", "Enable Space memory extraction first.");
    return this.leased(workspaceId, async () => {
      const run = this.repo.getRun(runId);
      if (!run || run.status !== "completed" || run.config?.contextWorkspaceId !== workspaceId)
        throw new AuxError("conflict", "Only a completed run from this Space can be extracted.");
      if (!this.sourceEligible(workspaceId, run))
        throw new AuxError("permission_denied", "This run includes a sensitive, excluded, or unverifiable source.");
      if (this.repo.db.prepare("SELECT 1 FROM memory_pipeline_watermarks WHERE workspace_id=? AND run_id=?").get(workspaceId, runId))
        return { extracted: 0 };
      const report = [run.result?.report, run.result?.answer, run.result?.text].find(value => typeof value === "string") as string | undefined;
      if (!report?.trim()) return { extracted: 0 };
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      if ([...claims, ...inbox].some(claim => claim.sourceRunId === runId)) {
        this.repo.db.prepare("INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)")
          .run(workspaceId, runId, Date.now());
        return { extracted: 0 };
      }
      const at = Date.now();
      const additions = report.split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/u).map(text => text.trim())
        .filter(text => text.length >= 20).slice(0, 20).map(text => MemoryClaimSchema.parse({
          claimId: randomUUID(), sourceRunId: runId, text: text.slice(0, 2000), capturedAt: at }));
      if (!additions.length) return { extracted: 0 };
      await this.writeGeneration(workspaceId, claims, [...inbox, ...additions].slice(-200), history, prior);
      this.repo.db.prepare("INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)")
        .run(workspaceId, runId, at);
      return { extracted: additions.length };
    });
  }

  sources(workspaceId: string) {
    this.requireSpace(workspaceId);
    const candidates = this.repo.db.prepare(`SELECT run_id AS runId, goal, ended_at AS endedAt FROM runs
      WHERE status='completed' AND json_extract(config,'$.contextWorkspaceId')=?
      AND (json_extract(result,'$.report') IS NOT NULL OR json_extract(result,'$.answer') IS NOT NULL
        OR json_extract(result,'$.text') IS NOT NULL)
      AND run_id NOT IN (SELECT run_id FROM memory_pipeline_watermarks WHERE workspace_id=?)
      ORDER BY ended_at DESC LIMIT 100`).all(workspaceId, workspaceId) as { runId: string; goal: string; endedAt: number }[];
    return candidates.filter(source => {
      const run = this.repo.getRun(source.runId);
      return run && this.sourceEligible(workspaceId, run);
    }).slice(0, 20);
  }

  async inbox(workspaceId: string): Promise<MemoryClaim[]> {
    if (!this.policy(workspaceId).enabled) return [];
    return (await this.readClaims(workspaceId)).inbox;
  }

  async claims(workspaceId: string): Promise<MemoryClaim[]> {
    if (!this.policy(workspaceId).enabled) return [];
    return (await this.readClaims(workspaceId)).claims;
  }

  async history(workspaceId: string) {
    if (!this.policy(workspaceId).enabled) return [];
    const { history } = await this.readClaims(workspaceId);
    return [...history].reverse().map(revision => ({ revisionId: revision.revisionId,
      capturedAt: revision.capturedAt, claimCount: revision.claims.length, summary: this.summary(revision.claims) }));
  }

  async revert(workspaceId: string, revisionId: string) {
    if (!this.policy(workspaceId).enabled) throw new AuxError("permission_denied", "Enable Space memory first.");
    return this.leased(workspaceId, async () => {
      const { claims: current, inbox, history, prior } = await this.readClaims(workspaceId);
      const selected = history.find(revision => revision.revisionId === revisionId);
      if (!selected) throw new AuxError("not_found", "Memory revision is unavailable or was forgotten.");
      const claims = [...selected.claims];
      await this.writeGeneration(workspaceId, claims, inbox, [...history, this.snapshot(current)].slice(-10), prior);
      return this.overview(workspaceId);
    });
  }

  async review(workspaceId: string, claimId: string, decision: "accept" | "discard") {
    if (!this.policy(workspaceId).enabled) throw new AuxError("permission_denied", "Enable Space memory first.");
    return this.leased(workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      const note = inbox.find(item => item.claimId === claimId);
      if (!note) throw new AuxError("not_found", "Pending memory note does not exist.");
      if (decision === "accept") {
        const source = this.repo.getRun(note.sourceRunId);
        const report = [source?.result?.report, source?.result?.answer, source?.result?.text]
          .find(value => typeof value === "string") as string | undefined;
        if (!source || source.status !== "completed" || source.config?.contextWorkspaceId !== workspaceId || !report?.includes(note.text))
          throw new AuxError("conflict", "The source run no longer verifies this note.");
        if (!this.sourceEligible(workspaceId, source))
          throw new AuxError("permission_denied", "The source is now sensitive, excluded, or unverifiable.");
      }
      const remaining = inbox.filter(item => item.claimId !== claimId);
      const accepted = decision === "accept" ? [...claims, note].slice(-200) : claims;
      await this.writeGeneration(workspaceId, accepted, remaining,
        decision === "accept" ? [...history, this.snapshot(accepted)].slice(-10) : history, prior);
      return { accepted: decision === "accept", remaining: remaining.length };
    });
  }

  async overview(workspaceId: string) {
    const policy = this.policy(workspaceId);
    if (!policy.enabled) return MemoryPipelineOverviewSchema.parse({ workspaceId, enabled: false, summary: "", claimCount: 0, sourceCount: 0 });
    const { claims } = await this.readClaims(workspaceId);
    return MemoryPipelineOverviewSchema.parse({ workspaceId, enabled: true, summary: this.summary(claims),
      claimCount: claims.length, sourceCount: new Set(claims.map(claim => claim.sourceRunId)).size });
  }

  async search(workspaceId: string, query: string) {
    if (!this.policy(workspaceId).enabled) return [];
    const terms = query.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(term => term.length > 1).slice(0, 8);
    if (!terms.length) return [];
    const { claims } = await this.readClaims(workspaceId);
    return claims.filter(claim => !memoryContentSensitivityReason(claim.text)
      && terms.every(term => claim.text.toLocaleLowerCase().includes(term))).slice(-20).reverse();
  }

  async forget(raw: unknown) {
    const input = MemoryPipelineForgetParams.parse(raw);
    this.requireSpace(input.workspaceId);
    return this.leased(input.workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(input.workspaceId);
      const keep = (claim: MemoryClaim) => !input.all && (input.claimId
        ? claim.claimId !== input.claimId : claim.sourceRunId !== input.sourceRunId);
      const remaining = claims.filter(keep);
      const pending = inbox.filter(keep);
      const forgotten = new Set([...claims, ...inbox, ...history.flatMap(revision => revision.claims)]
        .filter(claim => !keep(claim)).map(claim => claim.claimId)).size;
      if (forgotten) {
        const sanitized = history.map(revision => ({ ...revision, claims: revision.claims.filter(keep) }));
        await this.writeGeneration(input.workspaceId, remaining, pending,
          [...sanitized, this.snapshot(remaining)].slice(-10), prior);
      }
      return { forgotten, remaining: remaining.length + pending.length };
    });
  }
}
