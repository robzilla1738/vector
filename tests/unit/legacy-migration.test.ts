import { afterEach, expect, it } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo } from "@vector/runtime";
import { legacyInstallationStatus, migrateLegacyInstallation } from "../../apps/runtime/src/services/legacy-migration.js";

const cleanup: string[] = [];
afterEach(() => { for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true }); });

function roots() {
  const home = mkdtempSync(join(tmpdir(), "aux-legacy-home-"));
  cleanup.push(home);
  const source = join(home, "Library", "Application Support", "Vector");
  const destination = join(home, "Library", "Application Support", "Aux Browser");
  mkdirSync(source, { recursive: true });
  return { home, source, destination };
}

it("copies task data with a backup and never moves credential files or kv keys", async () => {
  const { home, source, destination } = roots();
  const db = openDb(join(source, "vector.sqlite"));
  const repo = new Repo(db);
  repo.setSetting("gatewayApiKey", "synthetic-key");
  repo.setSetting("theme", "dark");
  db.close();
  mkdirSync(join(source, "secrets"), { recursive: true });
  writeFileSync(join(source, "secrets", "gatewayApiKey"), "synthetic-secret");
  writeFileSync(join(source, "gateway.key"), "legacy-file");
  mkdirSync(join(source, "artifacts"), { recursive: true });
  writeFileSync(join(source, "artifacts", "note.txt"), "kept");
  const status = legacyInstallationStatus({ source, destination, home, platform: "darwin" });
  expect(status.skippedCredentials).toBe(true);
  expect(status.migrated).toBe(false);
  const result = await migrateLegacyInstallation({ confirm: true, source, destination, home, platform: "darwin" });
  expect(result.copiedDatabase).toBe(true);
  expect(result.skippedCredentials).toBe(true);
  expect(result.skipped).toEqual(expect.arrayContaining(["secrets", "gateway.key"]));
  expect(existsSync(join(destination, "secrets"))).toBe(false);
  expect(existsSync(join(destination, "gateway.key"))).toBe(false);
  expect(readFileSync(join(destination, "artifacts", "note.txt"), "utf8")).toBe("kept");
  const migrated = openDb(join(destination, "aux-state.sqlite"));
  try {
    const keys = migrated.prepare("SELECT key FROM kv").all() as { key: string }[];
    expect(keys.some(row => row.key.includes("gatewayApiKey") || row.key.includes("Credential"))).toBe(false);
    expect(JSON.stringify(keys)).not.toContain("synthetic-key");
  } finally { migrated.close(); }
  const receipt = JSON.parse(readFileSync(join(destination, "legacy-migration.json"), "utf8")) as { skippedCredentials: boolean };
  expect(receipt.skippedCredentials).toBe(true);
  await expect(migrateLegacyInstallation({ confirm: true, source, destination, home, platform: "darwin" })).rejects.toMatchObject({ code: "conflict" });
});

it("fails closed when the destination already has a runtime database", async () => {
  const { home, source, destination } = roots();
  writeFileSync(join(source, "vector.sqlite"), "");
  mkdirSync(destination, { recursive: true });
  writeFileSync(join(destination, "aux-state.sqlite"), "");
  await expect(migrateLegacyInstallation({ confirm: true, source, destination, home, platform: "darwin" })).rejects.toMatchObject({ code: "conflict" });
});
