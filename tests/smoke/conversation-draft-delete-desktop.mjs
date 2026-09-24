// An unsent page attachment can be deleted through the real desktop draft list.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launchAux } from "./launch.mjs";
import { sidebarAction } from "./sidebar-action.mjs";

const dir = mkdtempSync(join(tmpdir(), "aux-draft-delete-"));
let app;
try {
  const launched = await launchAux({ args: ["--use-mock-keychain"], env: {
    PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, "profile"),
    AUX_DATA_DIR: join(dir, "data"), AUX_LOAD_DOTENV: "0",
  } });
  app = launched.app;
  const page = launched.page;
  await page.locator(".aux-home").waitFor();
  await page.evaluate(() => window.aux.invoke("conversations.attachments.add", {
    chatId: "unsent-page-chat", filename: "Saved page.txt", content: "Private unsent page body",
    sourceUrl: "https://example.test/article",
  }));
  await sidebarAction(page, "Chats");
  const drafts = page.getByRole("region", { name: "Unsent drafts" });
  await drafts.getByText("Saved page.txt").waitFor();
  await drafts.getByRole("button", { name: "Delete saved draft and attachments: Saved page.txt" }).click();
  await drafts.getByRole("button", { name: "Delete permanently" }).click();
  await drafts.getByText("Saved page.txt").waitFor({ state: "detached" });
  const state = await page.evaluate(async () => ({
    drafts: await window.aux.invoke("conversations.prepared", {}),
    attachments: await window.aux.invoke("conversations.attachments.get", { chatId: "unsent-page-chat" }),
  }));
  assert.deepEqual(state.drafts, []);
  assert.deepEqual(state.attachments.attachments, []);
  console.log("The native draft list deletes an unsent page attachment and its runtime record.");
} finally { await app?.close().catch(() => {}); rmSync(dir, { recursive: true, force: true }); }
