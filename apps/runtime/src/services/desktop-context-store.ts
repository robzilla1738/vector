import schema from "../store/schema.generated.json" with { type: "json" };
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { DesktopContextCaptureSchema, type DesktopContextCapture } from "@aux/contracts/desktop-context";
import { digest } from "@aux/contracts/util/digest";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";
import { withSecureDelete } from "../store/db.js";
import { ProtectedStore } from "./protected-store.js";

type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret">;
type Generation = { workspace_id: string; app_key: string; generation: string; key_name: string };
type Row = {
  workspace_id: string;
  capture_id: string;
  app_key: string;
  generation: string;
  captured_at: number;
  expires_at: number;
  content: string;
};

export const desktopContextTableSql = schema.desktop_context;
const domain = "desktop-context";
const maximumBytes = 32 * 1024 * 1024;
const maximumCaptures = 10000;

/** App-specific disposable generations: append is immutable; deletion reseals survivors. */
export class DesktopContextStore {
  private readonly protectedStore: ProtectedStore;
  constructor(
    private readonly repo: Repo,
    private readonly secrets: Secrets,
    private readonly profileId: string,
  ) {
    this.protectedStore = new ProtectedStore(secrets, profileId);
  }
  private async appKey(bundleId: string) {
    const key = await this.protectedStore.generationKey(
      domain,
      Buffer.alloc(32),
      !this.repo.db.prepare("SELECT 1 FROM desktop_context_generations LIMIT 1").get(),
    );
    return createHmac("sha256", key).update(bundleId).digest("hex");
  }
  private keyName(workspaceId: string, generation: string) {
    return `desktop_${digest(this.profileId).slice(0, 10)}_${digest(workspaceId).slice(0, 10)}_${generation.replaceAll("-", "")}`;
  }
  private generations(workspaceId: string) {
    return this.repo.db
      .prepare("SELECT * FROM desktop_context_generations WHERE workspace_id=?")
      .all(workspaceId) as Generation[];
  }
  private rows(workspaceId: string) {
    const size = this.repo.db
      .prepare(
        "SELECT count(*) AS count,coalesce(sum(length(CAST(content AS BLOB))),0) AS bytes FROM desktop_context_captures WHERE workspace_id=?",
      )
      .get(workspaceId) as { count: number; bytes: number };
    if (size.count > maximumCaptures || size.bytes > maximumBytes)
      throw new Error("Desktop context exceeds its reviewed 32 MB / 10,000 capture limit.");
    const rows = this.repo.db
      .prepare(
        "SELECT * FROM desktop_context_captures WHERE workspace_id=? ORDER BY captured_at DESC,capture_id",
      )
      .all(workspaceId) as Row[];
    if (
      rows.length > maximumCaptures ||
      rows.reduce((sum, row) => sum + Buffer.byteLength(row.content), 0) > maximumBytes
    )
      throw new Error("Desktop context exceeds its reviewed 32 MB / 10,000 capture limit.");
    return rows;
  }
  private async key(generation: Generation) {
    if (
      !/^[a-f0-9-]{36}$/.test(generation.generation) ||
      generation.key_name !== this.keyName(generation.workspace_id, generation.generation)
    )
      throw new Error("Desktop context generation is invalid.");
    const value = (await this.secrets.readSecret(generation.key_name)).value;
    const factor = Buffer.from(value ?? "", "base64");
    if (factor.length !== 32 || factor.toString("base64") !== value)
      throw new Error(
        "Desktop context key is unavailable; restore the original OS credential or Forget this source.",
      );
    return this.protectedStore.generationKey(domain, factor);
  }
  private current(generation: Generation) {
    return this.generations(generation.workspace_id).some(
      (row) => row.app_key === generation.app_key && row.generation === generation.generation,
    );
  }
  async read(workspaceId: string, check: () => void = () => {}) {
    const rows = this.rows(workspaceId);
    const generations = this.generations(workspaceId);
    const result: DesktopContextCapture[] = [];
    for (const generation of generations) {
      const key = await this.key(generation);
      check();
      if (!this.current(generation)) throw new Error("Desktop context changed during reading.");
      for (const row of rows.filter((entry) => entry.app_key === generation.app_key)) {
        if (row.generation !== generation.generation)
          throw new Error("Desktop context generation inventory differs.");
        const capture = DesktopContextCaptureSchema.parse(
          JSON.parse(
            this.protectedStore
              .open(key, domain, `${workspaceId}/${row.capture_id}`, row.content)
              .toString("utf8"),
          ),
        );
        if (
          capture.workspaceId !== workspaceId ||
          capture.captureId !== row.capture_id ||
          capture.capturedAt !== row.captured_at ||
          capture.expiresAt !== row.expires_at ||
          digest(capture.text + "\0" + capture.selection) !== capture.sha256 ||
          (await this.appKey(capture.app.bundleId)) !== row.app_key
        )
          throw new Error("Desktop context source identity differs.");
        check();
        result.push(capture);
      }
      if (!this.current(generation)) throw new Error("Desktop context changed during reading.");
    }
    if (result.length !== rows.length) throw new Error("Desktop context inventory is incomplete.");
    check();
    return result.sort((a, b) => b.capturedAt - a.capturedAt || a.captureId.localeCompare(b.captureId));
  }
  revision(workspaceId: string) {
    return digest(
      JSON.stringify({
        generations: this.generations(workspaceId),
        rows: this.repo.db
          .prepare(
            "SELECT capture_id,generation,captured_at,expires_at FROM desktop_context_captures WHERE workspace_id=? ORDER BY capture_id",
          )
          .all(workspaceId),
      }),
    );
  }
  stats(workspaceId: string) {
    const row = this.repo.db
      .prepare(
        "SELECT count(*) AS count,coalesce(sum(length(content)),0) AS bytes FROM desktop_context_captures WHERE workspace_id=?",
      )
      .get(workspaceId) as { count: number; bytes: number };
    return { storedCount: row.count, storedBytes: row.bytes };
  }
  async append(
    capture: DesktopContextCapture,
    check: () => void,
    beforeCommit: () => Promise<void> = async () => {},
  ) {
    DesktopContextCaptureSchema.parse(capture);
    const appKey = await this.appKey(capture.app.bundleId);
    check();
    let generation = this.generations(capture.workspaceId).find((row) => row.app_key === appKey);
    if (!generation) {
      const identity = randomUUID();
      generation = {
        workspace_id: capture.workspaceId,
        app_key: appKey,
        generation: identity,
        key_name: this.keyName(capture.workspaceId, identity),
      };
      const factor = randomBytes(32).toString("base64");
      await this.secrets.storeSecret(generation.key_name, factor);
      if ((await this.secrets.readSecret(generation.key_name)).value !== factor)
        throw new Error("Desktop context key could not be confirmed.");
      try {
        check();
        this.repo.db
          .prepare("INSERT INTO desktop_context_generations VALUES(?,?,?,?)")
          .run(generation.workspace_id, generation.app_key, generation.generation, generation.key_name);
      } catch (error) {
        await this.secrets.storeSecret(generation.key_name, "");
        throw error;
      }
    }
    const key = await this.key(generation);
    check();
    const content = this.protectedStore.seal(
      key,
      domain,
      `${capture.workspaceId}/${capture.captureId}`,
      Buffer.from(JSON.stringify(capture)),
    );
    await beforeCommit();
    return this.repo.transaction(() => {
      check();
      if (!this.current(generation)) throw new Error("Desktop context generation changed.");
      const prior = this.repo.db
        .prepare("SELECT content FROM desktop_context_captures WHERE workspace_id=? AND capture_id=?")
        .get(capture.workspaceId, capture.captureId) as { content: string } | undefined;
      if (prior) {
        const saved = DesktopContextCaptureSchema.parse(
          JSON.parse(
            this.protectedStore
              .open(key, domain, `${capture.workspaceId}/${capture.captureId}`, prior.content)
              .toString("utf8"),
          ),
        );
        if (JSON.stringify(saved) !== JSON.stringify(capture))
          throw new Error("Desktop capture identity was reused.");
        return false;
      }
      const stats = this.stats(capture.workspaceId);
      if (
        stats.storedCount >= maximumCaptures ||
        stats.storedBytes + Buffer.byteLength(content) > maximumBytes
      )
        throw new Error("Desktop context is full. Forget sources before collecting more.");
      this.repo.db
        .prepare("INSERT INTO desktop_context_captures VALUES(?,?,?,?,?,?,?)")
        .run(
          capture.workspaceId,
          capture.captureId,
          appKey,
          generation.generation,
          capture.capturedAt,
          capture.expiresAt,
          content,
        );
      return true;
    });
  }
  async retireKeys() {
    const rows = this.repo.db.prepare("SELECT key_name FROM desktop_context_retired_keys").all() as {
      key_name: string;
    }[];
    for (const row of rows) {
      await this.secrets.storeSecret(row.key_name, "");
      if ((await this.secrets.readSecret(row.key_name)).value)
        throw new Error("Desktop context key retirement could not be confirmed.");
      this.repo.db.prepare("DELETE FROM desktop_context_retired_keys WHERE key_name=?").run(row.key_name);
    }
  }
  async remove(
    workspaceId: string,
    matches: (capture: DesktopContextCapture) => boolean,
    beforeRemoval: () => Promise<void>,
    check: () => void = () => {},
  ) {
    const originalRows = this.rows(workspaceId);
    const captures = await this.read(workspaceId, check);
    const removed = captures.filter(matches);
    if (!removed.length) {
      await this.retireKeys();
      return 0;
    }
    await beforeRemoval();
    check();
    for (const previous of this.generations(workspaceId)) {
      const appCaptures = captures.filter((capture) =>
        originalRows.some((row) => row.capture_id === capture.captureId && row.app_key === previous.app_key),
      );
      if (!appCaptures.some(matches)) continue;
      const survivors = appCaptures.filter((capture) => !matches(capture));
      const generation = randomUUID();
      const keyName = this.keyName(workspaceId, generation);
      let sealed: { capture: DesktopContextCapture; content: string }[] = [];
      if (survivors.length) {
        const factor = randomBytes(32);
        const key = await this.protectedStore.generationKey(domain, factor);
        await this.secrets.storeSecret(keyName, factor.toString("base64"));
        if ((await this.secrets.readSecret(keyName)).value !== factor.toString("base64"))
          throw new Error("Desktop context replacement key could not be confirmed.");
        sealed = survivors.map((capture) => ({
          capture,
          content: this.protectedStore.seal(
            key,
            domain,
            `${workspaceId}/${capture.captureId}`,
            Buffer.from(JSON.stringify(capture)),
          ),
        }));
      }
      try {
        check();
        withSecureDelete(this.repo.db, () =>
          this.repo.transaction(() => {
            if (!this.current(previous)) throw new Error("Desktop context changed during retirement.");
            this.repo.db
              .prepare("DELETE FROM desktop_context_captures WHERE workspace_id=? AND app_key=?")
              .run(workspaceId, previous.app_key);
            this.repo.db
              .prepare("DELETE FROM desktop_context_generations WHERE workspace_id=? AND app_key=?")
              .run(workspaceId, previous.app_key);
            if (sealed.length) {
              this.repo.db
                .prepare("INSERT INTO desktop_context_generations VALUES(?,?,?,?)")
                .run(workspaceId, previous.app_key, generation, keyName);
              for (const { capture, content } of sealed)
                this.repo.db
                  .prepare("INSERT INTO desktop_context_captures VALUES(?,?,?,?,?,?,?)")
                  .run(
                    workspaceId,
                    capture.captureId,
                    previous.app_key,
                    generation,
                    capture.capturedAt,
                    capture.expiresAt,
                    content,
                  );
            }
            this.repo.db
              .prepare("INSERT OR IGNORE INTO desktop_context_retired_keys VALUES(?)")
              .run(previous.key_name);
          }),
        );
      } catch (error) {
        if (sealed.length) await this.secrets.storeSecret(keyName, "");
        throw error;
      }
      await this.retireKeys();
    }
    return removed.length;
  }
  async forgetScope(
    workspaceId: string,
    appBundleId: string | undefined,
    beforeRemoval: () => Promise<void>,
  ) {
    const appKey = appBundleId ? await this.appKey(appBundleId) : undefined;
    const generations = this.generations(workspaceId).filter((row) => !appKey || row.app_key === appKey);
    const rows = this.rows(workspaceId).filter((row) => !appKey || row.app_key === appKey);
    if (!rows.length && !generations.length) {
      await this.retireKeys();
      return 0;
    }
    await beforeRemoval();
    withSecureDelete(this.repo.db, () =>
      this.repo.transaction(() => {
        for (const row of generations) {
          this.repo.db
            .prepare("DELETE FROM desktop_context_captures WHERE workspace_id=? AND app_key=?")
            .run(workspaceId, row.app_key);
          this.repo.db
            .prepare("DELETE FROM desktop_context_generations WHERE workspace_id=? AND app_key=?")
            .run(workspaceId, row.app_key);
          this.repo.db
            .prepare("INSERT OR IGNORE INTO desktop_context_retired_keys VALUES(?)")
            .run(row.key_name);
        }
        if (!appKey)
          this.repo.db.prepare("DELETE FROM desktop_context_captures WHERE workspace_id=?").run(workspaceId);
      }),
    );
    await this.retireKeys();
    return rows.length;
  }
  expiredCount(now: number) {
    return (
      this.repo.db
        .prepare("SELECT count(*) AS count FROM desktop_context_captures WHERE expires_at<=?")
        .get(now) as { count: number }
    ).count;
  }
  workspaceIds() {
    return (
      this.repo.db.prepare("SELECT DISTINCT workspace_id FROM desktop_context_generations").all() as {
        workspace_id: string;
      }[]
    ).map((row) => row.workspace_id);
  }
  async exportRecoveryCaptures(now = Date.now()) {
    const captures: DesktopContextCapture[] = [];
    for (const workspaceId of this.workspaceIds())
      captures.push(...(await this.read(workspaceId)).filter((capture) => capture.expiresAt > now));
    if (Buffer.byteLength(JSON.stringify(captures)) > 16 * 1024 * 1024)
      throw new Error("Desktop context exceeds the reviewed portable recovery limit.");
    return captures;
  }
  async importRecoveryCaptures(raw: unknown, now = Date.now()) {
    if (
      !Array.isArray(raw) ||
      raw.length > maximumCaptures ||
      Buffer.byteLength(JSON.stringify(raw)) > 16 * 1024 * 1024
    )
      throw new Error("Desktop context recovery inventory is invalid.");
    const captures = raw.map((capture) => DesktopContextCaptureSchema.parse(capture));
    if (
      new Set(captures.map((capture) => `${capture.workspaceId}/${capture.captureId}`)).size !==
      captures.length
    )
      throw new Error("Desktop recovery contains duplicate source identities.");
    for (const capture of captures) {
      if (
        !this.repo.listWorkspaces().some((workspace) => workspace.workspaceId === capture.workspaceId) ||
        capture.expiresAt !== capture.capturedAt + 14 * 86400000 ||
        capture.capturedAt > now + 5000 ||
        digest(capture.text + "\0" + capture.selection) !== capture.sha256
      )
        throw new Error("Desktop recovery source identity is invalid.");
    }
    for (const capture of captures.filter((capture) => capture.expiresAt > now))
      await this.append(capture, () => {});
  }
  /** Ciphertext only. Central recovery must preserve this exact inventory and current key lineage. */
  recoverySnapshot() {
    return {
      generations: this.repo.db.prepare("SELECT * FROM desktop_context_generations").all(),
      captures: this.repo.db.prepare("SELECT * FROM desktop_context_captures").all(),
      retiredKeys: this.repo.db.prepare("SELECT * FROM desktop_context_retired_keys").all(),
    };
  }
}
