// Synthetic provider evidence through Aux's real conversation and native Profile chooser.
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";
import { sidebarAction } from "./sidebar-action.mjs";

const root = resolve(import.meta.dirname, "../..");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-calendar-source-"));
const dataDir = join(temporary, "data");
mkdirSync(dataDir, { recursive: true });
const eventUrl = "https://calendar.google.com/calendar/event?eid=aux-fixture";
const legacyUrl = "https://calendar.google.com/calendar/event?eid=aux-legacy";
const now = Date.now();
const repo = new Repo(openDb(resolveDatabasePath(dataDir)));
repo.saveRun({ runId: "calendar-source-run", goal: "Prepare a meeting brief", status: "completed", pageIds: [],
  config: { chatId: "calendar-source-chat" }, result: { report: `- Meeting with Alice [source](${eventUrl})\n- Earlier meeting [older source](${legacyUrl})` }, createdAt: now, endedAt: now + 1 });
repo.saveStep({ stepId: "calendar-source-step", runId: "calendar-source-run", op: "calendar.events.list", startedAt: now,
  outcome: { stepId: "calendar-source-step", op: "calendar.events.list", status: "ok", startedAt: now, durationMs: 2,
    extracted: { events: [
      { eventId: "event-1", title: "Meeting with Alice", start: "2026-09-25T10:00:00Z", end: "2026-09-25T11:00:00Z",
        url: eventUrl, source: { connectionId: "account-1", profileId: "default", accountKey: "alice@example.test", fetchedAt: now } },
      { title: "Earlier meeting", start: "2026-09-24T10:00:00Z", end: "2026-09-24T11:00:00Z",
        url: legacyUrl, source: { connectionId: "account-1", accountKey: "alice@example.test", fetchedAt: now } },
    ] } } });
repo.db.close();

const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0" };
let app;
try {
  app = await launchApp({ args: ["--use-mock-keychain"], env });
  const page = await shellWindow(app, 15_000);
  page.setDefaultTimeout(20_000);
  await page.locator(".app").waitFor();
  await page.evaluate(() => window.aux.createBrowserProfile("Work"));
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Prepare a meeting brief" }).click();
  await page.getByText("Meeting with Alice", { exact: false }).first().waitFor();
  await page.getByRole("link", { name: "source", exact: true }).click();
  await page.waitForFunction(url => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.url === url)), eventUrl);
  const chooser = page.getByRole("dialog", { name: "Open Calendar source" });
  assert.equal(await chooser.count(), 0, "current-source Profile should route without a chooser");
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Prepare a meeting brief" }).click();
  await page.getByRole("link", { name: "older source" }).click();
  await chooser.waitFor();
  assert.equal(await chooser.evaluate(element => element.matches(":modal")), true, "Profile choice uses the native modal top layer");
  assert.match(await chooser.innerText(), /alice@example\.test/);
  await chooser.getByRole("button", { name: "Work" }).waitFor();
  await page.keyboard.press("Escape");
  await chooser.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.activeElement?.textContent?.includes("older source"));
  assert.match(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""), /older source/, "Escape returns focus to the Calendar citation");
  await page.getByText("Sources", { exact: true }).click();
  await page.locator(".conversation-sources button").filter({ hasText: "Earlier meeting" }).click();
  await chooser.waitFor();
  const current = (await page.evaluate(() => window.aux.browserProfiles())).find(profile => profile.current);
  assert.ok(current);
  await chooser.getByRole("button", { name: new RegExp(`${current.name}.*current`) }).click();
  await page.waitForFunction(url => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.url === url)), legacyUrl);
  console.log("Calendar citations route to their recorded native Profile; legacy sources ask for a Profile explicitly.");
} finally {
  await app?.close().catch(() => {});
  rmSync(temporary, { recursive: true, force: true });
}
