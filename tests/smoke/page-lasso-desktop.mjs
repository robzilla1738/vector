// A visible native page can be selected in place and saved with its original document identity.
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";

const temporary = mkdtempSync(join(tmpdir(), "aux-page-lasso-"));
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end('<!doctype html><title>Lasso fixture</title><style>body{margin:0;background:#124c87;color:white;font:28px sans-serif}main{height:100vh;display:grid;place-items:center}input{position:absolute;left:20px;top:20px;width:140px;height:40px;background:white}</style><main>Source page</main><input aria-label="API token" value="synthetic-secret">');
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${fixture.address().port}/source`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary,
  AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: join(temporary, "data"), AUX_LOAD_DOTENV: "0" };
let app;
try {
  app = await launchApp({ args: ["--use-mock-keychain"], env });
  const shell = await shellWindow(app, 15_000);
  shell.setDefaultTimeout(20_000);
  await shell.locator(".app").waitFor();
  const opened = await shell.evaluate(value => window.aux.invoke("pages.open", { url: value, activate: true }), url);
  await shell.waitForFunction(async pageId => (await window.aux.invoke("pages.list", {})).some(item => item.pageId === pageId && !item.loading), opened.pageId);
  const source = await shell.evaluate(async pageId => (await window.aux.invoke("pages.list", {})).find(item => item.pageId === pageId), opened.pageId);
  const protectedShot = await shell.evaluate(pageId => window.aux.invoke("pages.capture", { pageId, format: "dataUrl" }), source.pageId);
  const maskedPixel = await shell.evaluate(async shot => {
    const image = new Image(); image.src = shot.dataUrl; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext("2d"); context.drawImage(image, 0, 0);
    return Array.from(context.getImageData(Math.round(60 * shot.scale), Math.round(40 * shot.scale), 1, 1).data).slice(0, 3);
  }, protectedShot);
  assert.deepEqual(maskedPixel, [36, 36, 36], "the public capture path must mask editable pixels");
  await app.evaluate(({ webContents }, action) => {
    webContents.getAllWebContents().find(item => item.getURL().includes("renderer/index.html"))?.send("page.quickAction", action);
  }, { pageId: source.pageId, url: source.url, topUrl: source.url, title: source.title,
    capturedAt: Date.now(), action: "ask", selection: "Source page", truncated: false });
  await shell.getByRole("textbox", { name: "Reply to conversation" }).waitFor();
  await shell.getByRole("button", { name: "Toggle agent rail" }).click();
  await shell.locator(".main-col.has-page").waitFor();
  await shell.getByRole("button", { name: "Add context", exact: true }).click();
  await shell.getByRole("button", { name: "Select area", exact: true }).click();
  const lasso = shell.getByRole("dialog", { name: "Select an area of the captured page" });
  await lasso.waitFor();
  const box = await lasso.locator(".capture-canvas").boundingBox();
  assert.ok(box && box.width > 200 && box.height > 100, "selection should use the visible page area");
  await shell.mouse.move(box.x + box.width * .2, box.y + box.height * .2);
  await shell.mouse.down();
  await shell.mouse.move(box.x + box.width * .7, box.y + box.height * .7);
  await shell.mouse.up();
  await lasso.getByRole("button", { name: "Attach region" }).click();
  await lasso.waitFor({ state: "detached" });
  const chatId = await shell.evaluate(() => {
    const key = Object.keys(localStorage).find(item => item.startsWith("aux.conversation-browser-sources.v1:chat:"));
    return key?.split(":").at(-1);
  });
  assert.ok(chatId);
  const result = await shell.evaluate(value => window.aux.invoke("conversations.images.get", { chatId: value }), chatId);
  assert.equal(result.images.length, 1);
  assert.equal(result.images[0].sourceUrl, source.url);
  assert.equal(result.images[0].sourcePage.pageId, source.pageId);
  assert.equal(result.images[0].sourcePage.documentEpoch, source.documentEpoch);
  const full = await shell.evaluate(pageId => window.aux.invoke("pages.capture", { pageId, format: "dataUrl", fullPage: false }), source.pageId);
  const fullWidth = Buffer.from(full.dataUrl.split(",")[1], "base64").readUInt32BE(16);
  assert.ok(result.images[0].width > 8 && result.images[0].width < fullWidth, "saved image should be a crop");
  await shell.locator(".main-col.has-page").waitFor();
  console.log("Direct page selection saved a cropped image with source page and document identity.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
