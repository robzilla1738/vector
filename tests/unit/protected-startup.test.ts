import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { prepareProtectedDatabase } from "../../apps/runtime/src/store/protected-startup.js";

it("migrates adapted data before repository reads, survives restart and refuses a missing factor", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-protected-startup-"));
  const path = join(dir, "state.sqlite");
  const profileId = "profile-one";
  const secrets = new Map<string, string>();
  const name = (kind: "aux_root_v1" | "sqlite_factor_v1") =>
    `${kind}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  const native = {
    async readSecret(key: string) { return { value: secrets.get(key) }; },
    async storeSecret(key: string, value: string) { secrets.set(key, value); return { ok: true }; },
    async profileStorageRoot() {
      const key = name("aux_root_v1");
      if (!secrets.has(key)) secrets.set(key, randomBytes(32).toString("base64"));
      return { value: secrets.get(key)! };
    },
    async profileStorageFactor() {
      const key = name("sqlite_factor_v1");
      if (!secrets.has(key)) secrets.set(key, randomBytes(32).toString("base64"));
      return { value: secrets.get(key)! };
    },
  } as unknown as NativeBridge;
  let db = openDb(path);
  try {
    new Repo(db).saveModelCall({ callId: "old", runId: "run", role: "agent", modelId: "model", durationMs: 1,
      error: "private startup error", createdAt: 1 });
    const cipher = await prepareProtectedDatabase(db, native, profileId);
    expect(new Repo(db, cipher).listModelCalls("run")[0]?.error).toBe("private startup error");
    expect(readFileSync(path).includes("private startup error")).toBe(false);
    db.close();
    db = openDb(path);
    const reopened = await prepareProtectedDatabase(db, native, profileId);
    expect(new Repo(db, reopened).listModelCalls("run")[0]?.error).toBe("private startup error");
    secrets.delete(name("sqlite_factor_v1"));
    await expect(prepareProtectedDatabase(db, native, profileId)).rejects.toThrow(/factor is missing/);
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }); }
});
