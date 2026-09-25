import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { closeAux, launchAux } from "./launch.mjs";

const directory = mkdtempSync("/tmp/aux-forced-colors-");
const { app, page } = await launchAux({
  args: ["--use-mock-keychain"],
  env: { ...process.env, AUX_PROFILE_DIR: `${directory}/profile`, AUX_DATA_DIR: `${directory}/data`, AUX_LOAD_DOTENV: "0" },
});
page.setDefaultTimeout(15000);
const outline = async locator => locator.evaluate(element => {
  const style = getComputedStyle(element);
  return { width: style.outlineWidth, style: style.outlineStyle, border: style.borderStyle, blur: style.backdropFilter };
});

try {
  await page.locator(".aux-home").waitFor();
  await page.evaluate(() => window.aux.invoke("pages.open", {
    url: "data:text/html,<title>Accessible tab</title><h1>Accessible tab</h1>", activate: true,
  }));
  await page.evaluate(() => window.aux.invoke("settings.set", { tabLayout: "vertical" }));
  await page.locator(".app.tabs-vertical").waitFor();
  if (!(await page.locator(".sidebar.expanded").isVisible())) {
    await page.keyboard.press("Meta+s");
    await page.locator(".sidebar.expanded").waitFor();
  }

  await page.emulateMedia({ forcedColors: "active" });
  const vertical = await outline(page.locator(".sidebar .tab-row.active"));
  assert.equal(vertical.width, "2px", "vertical active tab has a system-color boundary");
  assert.equal(vertical.style, "solid");
  assert.equal((await outline(page.locator(".sidebar"))).blur, "none", "glass is opaque in forced colors");
  await page.locator(".space-switch").click();
  await page.getByRole("menuitem", { name: "New space", exact: true }).click();
  const verticalDialog = page.getByRole("dialog", { name: "New space", exact: true });
  assert.equal((await outline(verticalDialog)).border, "solid", "dialog keeps a visible boundary");
  assert.equal((await outline(verticalDialog.getByRole("radio", { name: "violet" }))).width, "2px", "selected color stays visible");
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("space-switch")), true,
    "vertical dialog restores its Space trigger");

  await page.evaluate(() => window.aux.invoke("settings.set", { tabLayout: "horizontal" }));
  await page.locator(".app.tabs-horizontal").waitFor();
  const horizontal = await outline(page.locator('.horizontal-tab:has([data-active="true"])'));
  assert.equal(horizontal.width, "2px", "horizontal active tab has a system-color boundary");
  assert.equal(horizontal.style, "solid");
  await page.locator(".toolbar .cmdbar input").first().fill("accessible");
  const tabsScope = page.locator(".cb-provider-scopes button", { hasText: /^Tabs$/ });
  await tabsScope.click();
  assert.equal(await tabsScope.getAttribute("aria-pressed"), "true");
  assert.equal((await outline(tabsScope)).width, "2px", "selected search scope is distinct in forced colors");
  await page.keyboard.press("Escape");

  await page.locator(".horizontal-profile").click();
  await page.getByRole("menuitem", { name: "New space", exact: true }).click();
  await page.getByRole("dialog", { name: "New space", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("horizontal-profile")), true,
    "horizontal dialog restores its Space trigger");

  await page.emulateMedia({ forcedColors: "none" });
  await page.keyboard.press("Tab");
  await page.locator('.horizontal-tab-select[data-active="true"]').focus();
  assert.equal((await outline(page.locator('.horizontal-tab-select[data-active="true"]'))).width, "2px",
    "normal-mode keyboard focus remains visible");
  console.log("PASS vertical and horizontal forced-color selection, search scope, modal boundary and focus return");
} finally {
  await closeAux(app);
}
