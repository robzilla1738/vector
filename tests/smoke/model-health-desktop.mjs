// Nonsecret model-health continuity in an isolated profile. No provider request or credential access.
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { launchApp, shellWindow } from "./launch.mjs";

const root = resolve(import.meta.dirname, "../..");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-model-health-"));
const dataDir = join(temporary, "data");
mkdirSync(dataDir, { recursive: true });
const modelId = "meta/muse-spark-1.3-contributor";
const checkedAt = Date.now() - 60_000;
const repo = new Repo(openDb(resolveDatabasePath(dataDir)));
repo.setSetting("modelProvider", "gateway");
repo.setSetting("plannerModel", modelId);
repo.setSetting("modelProbe", { provider: "gateway", modelId, ok: false, checkedAt });
repo.db.close();
let app;
try {
  app = await launchApp({args:["--use-mock-keychain"],env: { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0" }});
  let page = await shellWindow(app, 15000); page.setDefaultTimeout(20_000); await page.locator(".app").waitFor();
  await sidebarAction(page, "Settings");
  const settings = page.getByRole("region", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "Connections", exact: true }).click();
  await settings.getByRole("tab", { name: "Models", exact: true }).click();
  await settings.getByRole("status").filter({ hasText: "Failed — Last connection test failed" }).waitFor();
  mkdirSync(join(root, "release/test-artifacts"), { recursive: true });
  await page.screenshot({ path: join(root, "release/test-artifacts/aux-model-health.png") });
  await settings.getByRole("combobox", { name: "Planner model", exact: true }).fill("changed-model");
  await settings.getByRole("button", { name: "Save model", exact: true }).click();
  await settings.getByRole("status").filter({ hasText: "Failed — Last connection test failed" }).waitFor({ state: "hidden" });
  assert.equal((await page.evaluate(() => window.aux.invoke("settings.get", {}))).modelProbe, undefined);
  console.log("Saved nonsecret model health survives reopening and is cleared when the selected model changes.");
} finally {
  await app?.close().catch(() => {});
  rmSync(temporary, { recursive: true, force: true });
}
