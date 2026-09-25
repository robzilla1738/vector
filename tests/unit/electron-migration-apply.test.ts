import { afterEach, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { applyElectronMigration, openDb, prepareElectronMigration, Repo, VaultService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

async function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aux-migration-apply-")); roots.push(root);
  const source = join(root, "electron"), bundle = join(root, "bundle"), profile = join(root, "chromium-profile");
  mkdirSync(source);
  writeFileSync(join(source, "Cookies"), "source-cookie-sentinel");
  const db = openDb(join(source, "aux-state.sqlite")), repo = new Repo(db);
  db.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES('w1','Work',1)").run();
  repo.setSetting("browserSpaces", [{ id: "space-work", workspaceId: "w1", name: "Work", color: "violet", archived: false }]);
  db.prepare("INSERT INTO pages(page_id,backend,target_id,url,title,view_status,controller,owned,created_at,active_at) VALUES('p1','aux','electron-target','https://example.com','Example','visible','human',0,1,1)").run();
  db.prepare("INSERT INTO tabs(page_id,ordinal,url,title,backend,active,window_id) VALUES('p1',0,'https://example.com','Example','aux',1,'main')").run();
  db.prepare("INSERT INTO bookmarks(url,title,created_at,folder_path,reading_list) VALUES('https://example.com/docs','Docs',1,'[\"Reading\"]',1)").run();
  mkdirSync(join(source, "artifacts", "run1"), { recursive: true });
  const sourceArtifact = join(source, "artifacts", "run1", "report.txt");
  writeFileSync(sourceArtifact, "copied artifact");
  db.prepare("INSERT INTO artifacts(artifact_id,path,media_type,size,status,created_at) VALUES('a1',?,'text/plain',15,'complete',1)").run(sourceArtifact);
  db.close();
  const sourceHash = sha(join(source, "aux-state.sqlite")), artifactHash = sha(sourceArtifact);
  const layoutJson = JSON.stringify({ spaces: [{ id: "space-work", name: "Work", color: "violet" }], activeSpaceId: "space-work",
    tabSpace: { p1: "space-work" }, order: ["p1"], activeTabs: { "space-work": "p1" }, splits: {}, splitRatio: .5 });
  await prepareElectronMigration({ sourceDataDir: source, destinationDir: bundle, layoutJson });
  return { root, source, bundle, profile, sourceArtifact, sourceHash, artifactHash };
}

async function encryptedVault(root: string) {
  const secrets = new Map<string, string>();
  const db = openDb(":memory:");
  const native = { available: () => true,
    storeSecret: async (name: string, value: string) => { secrets.set(name, value); return { ok: true as const }; },
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
  } as NativeBridge;
  try {
    const vault = new VaultService(new Repo(db), native);
    vault.lock("local-vault-passphrase");
    await vault.unlock("local-vault-passphrase", 60_000);
    await vault.save({ label: "Example", origin: "https://example.com", username: "ada", secret: "s3cret!" });
    const path = join(root, "credentials.auxvault");
    writeFileSync(path, JSON.stringify(await vault.exportEncrypted("a-long-transfer-passphrase")));
    return path;
  } finally { db.close(); }
}

it("verifies and atomically seeds a copied profile with relocated artifacts and sealed vault handoff", async () => {
  const f = await fixture(), vaultPath = await encryptedVault(f.root);
  const relocatedBundle = join(f.root, "relocated-bundle");
  cpSync(f.bundle, relocatedBundle, { recursive: true });
  const before = { db: sha(join(f.source, "aux-state.sqlite")), artifact: sha(f.sourceArtifact), cookies: sha(join(f.source, "Cookies")) };
  const dry = await applyElectronMigration({ bundleDir: relocatedBundle, profileDir: f.profile, vaultPath, vaultPassphrase: "a-long-transfer-passphrase", dryRun: true });
  expect(dry).toMatchObject({ dryRun: true, profileDir: null, tabs: 1, bookmarks: 1, artifactFiles: 1, vaultItems: 1 });
  expect(existsSync(f.profile)).toBe(false);
  const first = await applyElectronMigration({ bundleDir: relocatedBundle, profileDir: f.profile, vaultPath, vaultPassphrase: "a-long-transfer-passphrase" });
  expect(first.alreadyApplied).toBe(false);
  const receipt = JSON.parse(readFileSync(join(f.profile, "apply-receipt.json"), "utf8"));
  expect(receipt).toMatchObject({ contentHash: first.contentHash, vault: { state: "pending_native_import", items: 1 } });
  expect(sha(join(f.profile, "manifest.json"))).toBe(receipt.manifestSha256);
  expect(sha(join(f.profile, "aux-state.sqlite"))).toBe(receipt.databaseSha256);
  expect(sha(join(f.profile, "vault-transfer.auxvault"))).toBe(receipt.vault.sha256);
  expect(readFileSync(join(f.profile, "vault-transfer.auxvault"), "utf8")).not.toContain("s3cret!");
  const db = new DatabaseSync(join(f.profile, "aux-state.sqlite"), { readOnly: true });
  const artifact = db.prepare("SELECT path FROM artifacts WHERE artifact_id='a1'").get() as { path: string };
  expect(artifact.path).toBe(join(f.profile, "artifacts", "migrated", "a1.txt"));
  expect(readFileSync(artifact.path, "utf8")).toBe("copied artifact");
  expect(db.prepare("SELECT 1 FROM tabs LIMIT 1").get()).toBeUndefined();
  db.close();
  expect(await applyElectronMigration({ bundleDir: relocatedBundle, profileDir: f.profile, vaultPath, vaultPassphrase: "a-long-transfer-passphrase" }))
    .toMatchObject({ alreadyApplied: true, contentHash: first.contentHash });
  expect(sha(join(f.source, "aux-state.sqlite"))).toBe(before.db);
  expect(sha(f.sourceArtifact)).toBe(before.artifact);
  expect(sha(join(f.source, "Cookies"))).toBe(before.cookies);
  expect(existsSync(join(f.profile, "Cookies"))).toBe(false);
  expect(f.sourceHash).toBe(before.db);
  expect(f.artifactHash).toBe(before.artifact);
});

it("rejects a changed staged manifest before treating an existing seed as idempotent", async () => {
  const f = await fixture();
  const sourceCookieSha = sha(join(f.source, "Cookies"));
  await applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile });
  const stagedManifest = join(f.profile, "manifest.json");
  writeFileSync(stagedManifest, readFileSync(stagedManifest, "utf8").replace("Example", "Modified"));
  await expect(applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile }))
    .rejects.toThrow(/manifest has changed/);
  expect(sha(join(f.source, "Cookies"))).toBe(sourceCookieSha);
});

it("rejects wrong passphrases and modified bundles before creating a profile", async () => {
  const f = await fixture(), vaultPath = await encryptedVault(f.root);
  await expect(applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile, vaultPath, vaultPassphrase: "wrong-passphrase" })).rejects.toThrow(/invalid/);
  expect(existsSync(f.profile)).toBe(false);
  const artifact = join(f.bundle, "artifacts", "migrated", "a1.txt");
  writeFileSync(artifact, "tampered artifact");
  await expect(applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile })).rejects.toThrow(/SHA-256|size/);
  expect(existsSync(f.profile)).toBe(false);
});

it("rejects conflicting destination and leaves no partial profile on a failed apply", async () => {
  const f = await fixture();
  await expect(applyElectronMigration({ bundleDir: f.bundle, profileDir: join(f.source, "nested-profile") })).rejects.toThrow(/outside any existing Aux data directory/);
  expect(existsSync(join(f.source, "nested-profile"))).toBe(false);
  mkdirSync(f.profile);
  await expect(applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile })).rejects.toThrow();
  expect(readdirSync(f.profile)).toEqual([]);
  rmSync(f.profile, { recursive: true });
  const first = await applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile });
  expect(first.alreadyApplied).toBe(false);
  writeFileSync(join(f.profile, "aux-state.sqlite"), "changed");
  await expect(applyElectronMigration({ bundleDir: f.bundle, profileDir: f.profile })).rejects.toThrow(/changed/);
});
