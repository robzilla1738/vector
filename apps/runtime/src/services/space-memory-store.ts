import { withSecureDelete } from "../store/db.js";
import { randomBytes, randomUUID } from "node:crypto";
import { AuxError, MemoryPipelineInboxSchema, type MemoryClaim } from "@aux/contracts";
import { digest } from "@aux/contracts/util/digest";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";
import { ProtectedStore } from "./protected-store.js";

export type MemoryRevision = { revisionId: string; capturedAt: number; claims: MemoryClaim[] };
export type MemoryGeneration = { generation: string; keyName: string };
type FileRow = { name: string; generation: string; key_name: string; content: string };
type HistoryRow = {
  revision_id: string;
  captured_at: number;
  generation: string;
  key_name: string;
  content: string;
};
type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret">;

/** Current logical files and reversible history share a disposable generation key. */
export class SpaceMemoryStore {
  private readonly protectedStore: ProtectedStore;
  constructor(
    private repo: Repo,
    private secrets: Secrets,
    private profileId: string,
  ) {
    this.protectedStore = new ProtectedStore(secrets, profileId);
  }

  private keyName(workspaceId: string, generation: string) {
    return `mem_${digest(this.profileId).slice(0, 10)}_${digest(workspaceId).slice(0, 10)}_${generation.slice(2).replaceAll("-", "")}`;
  }

  private rows(workspaceId: string) {
    return this.repo.transaction(() => ({
      files: this.repo.db
        .prepare(
          "SELECT name,generation,key_name,content FROM memory_files WHERE workspace_id=? ORDER BY name",
        )
        .all(workspaceId) as FileRow[],
      history: this.repo.db
        .prepare(
          "SELECT revision_id,captured_at,generation,key_name,content FROM memory_history WHERE workspace_id=?",
        )
        .all(workspaceId) as HistoryRow[],
    }));
  }

  generation(workspaceId: string): MemoryGeneration | null {
    const row = this.repo.db
      .prepare("SELECT generation,key_name FROM memory_files WHERE workspace_id=? AND name='claims.json.enc'")
      .get(workspaceId) as { generation: string; key_name: string } | undefined;
    return row ? { generation: row.generation, keyName: row.key_name } : null;
  }

  workspaceIds(): string[] {
    return (
      this.repo.db
        .prepare("SELECT workspace_id FROM memory_files UNION SELECT workspace_id FROM memory_history")
        .all() as { workspace_id: string }[]
    ).map((row) => row.workspace_id);
  }

  async read(workspaceId: string) {
    const rows = this.rows(workspaceId);
    if (!rows.files.length && !rows.history.length)
      return {
        prior: null,
        files: new Map<string, string>(),
        history: [] as MemoryRevision[],
        inspectedBytes: 0,
      };
    const inspectedBytes = [...rows.files, ...rows.history].reduce(
      (total, row) => total + Buffer.byteLength(row.content),
      0,
    );
    if (inspectedBytes > 32 * 1024 * 1024)
      throw new Error("Space memory exceeds the 32 MB reviewed size cap.");
    const first = rows.files.find((row) => row.name === "claims.json.enc");
    if (
      !first ||
      !/^g-[a-f0-9-]{36}$/.test(first.generation) ||
      first.key_name !== this.keyName(workspaceId, first.generation)
    )
      throw new Error("Space memory generation is invalid.");
    if (
      [...rows.files, ...rows.history].some(
        (row) => row.generation !== first.generation || row.key_name !== first.key_name,
      )
    )
      throw new Error("Space memory generations are inconsistent.");
    const value = (await this.secrets.readSecret(first.key_name)).value;
    if (!value)
      throw new Error(
        "Space memory key is unavailable. Restore the original OS credential store or forget this memory.",
      );
    const factor = Buffer.from(value, "base64");
    if (factor.length !== 32 || factor.toString("base64") !== value)
      throw new Error("Space memory key is invalid.");
    const key = await this.protectedStore.generationKey("space-memory", factor);
    const open = (name: string, content: string) =>
      this.protectedStore.open(key, "space-memory", `${workspaceId}/${name}`, content).toString("utf8");
    const files = new Map(rows.files.map((row) => [row.name, open(row.name, row.content)]));
    if (!files.has("history.json.enc")) throw new Error("Space memory history is missing.");
    const index: unknown = JSON.parse(files.get("history.json.enc")!);
    if (!Array.isArray(index) || index.length > 20 || index.length !== rows.history.length)
      throw new Error("Space memory history inventory is invalid.");
    const byId = new Map(rows.history.map((row) => [row.revision_id, row]));
    const seen = new Set<string>();
    const history: MemoryRevision[] = index.map((entry) => {
      if (
        !entry ||
        typeof entry !== "object" ||
        !/^[a-f0-9-]{36}$/.test(entry.revisionId) ||
        !Number.isSafeInteger(entry.capturedAt) ||
        entry.capturedAt < 0 ||
        typeof entry.digest !== "string" ||
        seen.has(entry.revisionId)
      )
        throw new Error("Space memory history is invalid.");
      seen.add(entry.revisionId);
      const row = byId.get(entry.revisionId);
      if (!row || row.captured_at !== entry.capturedAt)
        throw new Error("Space memory history metadata changed.");
      const plaintext = open(`history/${row.revision_id}.json.enc`, row.content);
      if (digest(plaintext) !== entry.digest) throw new Error("Space memory history differs from its index.");
      const parsed = JSON.parse(plaintext) as MemoryRevision;
      if (parsed.revisionId !== row.revision_id || parsed.capturedAt !== row.captured_at)
        throw new Error("Space memory history identity changed.");
      return {
        revisionId: parsed.revisionId,
        capturedAt: parsed.capturedAt,
        claims: MemoryPipelineInboxSchema.parse(parsed.claims),
      };
    });
    return {
      prior: { generation: first.generation, keyName: first.key_name },
      files,
      history,
      inspectedBytes,
    };
  }

  async write(
    workspaceId: string,
    files: Map<string, string>,
    history: MemoryRevision[],
    prior: MemoryGeneration | null,
  ) {
    const generation = `g-${randomUUID()}`;
    const keyName = this.keyName(workspaceId, generation);
    const factor = randomBytes(32);
    const key = await this.protectedStore.generationKey("space-memory", factor, !prior);
    const seal = (name: string, value: string) =>
      this.protectedStore.seal(key, "space-memory", `${workspaceId}/${name}`, Buffer.from(value));
    if (history.length > 20 || new Set(history.map((row) => row.revisionId)).size !== history.length)
      throw new Error("Space memory history inventory is invalid.");
    for (const revision of history) {
      if (
        !/^[a-f0-9-]{36}$/.test(revision.revisionId) ||
        !Number.isSafeInteger(revision.capturedAt) ||
        revision.capturedAt < 0
      )
        throw new Error("Space memory history identity is invalid.");
      MemoryPipelineInboxSchema.parse(revision.claims);
    }
    const historyValues = history.map((revision) => ({ revision, plaintext: JSON.stringify(revision) }));
    const nextFiles = new Map(files);
    nextFiles.set(
      "history.json.enc",
      JSON.stringify(
        historyValues.map(({ revision, plaintext }) => ({
          revisionId: revision.revisionId,
          capturedAt: revision.capturedAt,
          digest: digest(plaintext),
        })),
      ),
    );
    const fileRows = [...nextFiles].map(([name, content]) => ({
      name,
      generation,
      key_name: keyName,
      content: seal(name, content),
    }));
    const historyRows = historyValues.map(({ revision, plaintext }) => ({
      revision_id: revision.revisionId,
      captured_at: revision.capturedAt,
      generation,
      key_name: keyName,
      content: seal(`history/${revision.revisionId}.json.enc`, plaintext),
    }));
    if (
      [...fileRows, ...historyRows].reduce((bytes, row) => bytes + Buffer.byteLength(row.content), 0) >
      32 * 1024 * 1024
    )
      throw new Error("Space memory exceeds the 32 MB reviewed size cap.");
    const previous = this.rows(workspaceId);
    const priorFactor = prior ? (await this.secrets.readSecret(prior.keyName)).value : undefined;
    if (prior && !priorFactor) throw new Error("The prior Space memory key is unavailable.");
    let published = false;
    let retirementStarted = false;
    const publish = (fileValues: FileRow[], revisionValues: HistoryRow[]) => {
      withSecureDelete(this.repo.db, () => {
        this.repo.db.prepare("DELETE FROM memory_files WHERE workspace_id=?").run(workspaceId);
        this.repo.db.prepare("DELETE FROM memory_history WHERE workspace_id=?").run(workspaceId);
      });
      const putFile = this.repo.db.prepare(
        "INSERT INTO memory_files(workspace_id,name,generation,key_name,content) VALUES(?,?,?,?,?)",
      );
      const putHistory = this.repo.db.prepare(
        "INSERT INTO memory_history(workspace_id,revision_id,captured_at,generation,key_name,content) VALUES(?,?,?,?,?,?)",
      );
      for (const row of fileValues)
        putFile.run(workspaceId, row.name, row.generation, row.key_name, row.content);
      for (const row of revisionValues)
        putHistory.run(
          workspaceId,
          row.revision_id,
          row.captured_at,
          row.generation,
          row.key_name,
          row.content,
        );
    };
    try {
      await this.secrets.storeSecret(keyName, factor.toString("base64"));
      if ((await this.secrets.readSecret(keyName)).value !== factor.toString("base64"))
        throw new Error("Space memory key could not be confirmed.");
      this.repo.transaction(() => {
        if (this.generation(workspaceId)?.generation !== prior?.generation)
          throw new AuxError("conflict", "Space memory changed while its generation was prepared.");
        publish(fileRows, historyRows);
      });
      published = true;
      if (prior) {
        retirementStarted = true;
        await this.secrets.storeSecret(prior.keyName, "");
        if ((await this.secrets.readSecret(prior.keyName)).value)
          throw new Error("The prior Space memory key could not be retired.");
      }
    } catch (error) {
      // A retirement can complete before its response arrives. Roll back only
      // when the original factor is confirmed to have survived unchanged.
      let canRollback = !retirementStarted;
      if (retirementStarted && prior && priorFactor) {
        try {
          canRollback = (await this.secrets.readSecret(prior.keyName)).value === priorFactor;
        } catch {
          canRollback = false;
        }
      }
      if (canRollback) {
        if (published)
          this.repo.transaction(() => {
            if (this.generation(workspaceId)?.generation === generation)
              publish(previous.files, previous.history);
          });
        await this.secrets.storeSecret(keyName, "");
      }
      throw error;
    }
  }
}
