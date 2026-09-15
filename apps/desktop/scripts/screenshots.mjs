#!/usr/bin/env node
/**
 * Visual review of the shell in mock mode. Requires a running
 * `pnpm -C apps/desktop dev:mock` (127.0.0.1:5197) and a Playwright
 * chromium(-headless-shell) install. Writes PNGs to docs/ui/screenshots/.
 *
 *   node apps/desktop/scripts/screenshots.mjs [outDir] [only]
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] ?? join(here, "../../../docs/ui/screenshots");
const only = process.argv[3];
const base = process.env.VECTOR_MOCK_URL ?? "http://127.0.0.1:5197/";
mkdirSync(out, { recursive: true });

/** name → [query, viewport, pre-capture actions] */
const SHOTS = [
  ["01-start-page", "scenario=start&theme=dark", [1440, 900]],
  ["02-browsing-rail-collapsed", "scenario=browsing&theme=dark&sidebar=rail", [1440, 900]],
  ["03-browsing-sidebar", "scenario=browsing&theme=dark", [1440, 900]],
  ["04-active-run", "scenario=run&theme=dark&rail=1", [1440, 900]],
  ["05-takeover", "scenario=takeover&theme=dark&rail=1", [1440, 900]],
  ["06-needs-input", "scenario=needs-input&theme=dark&rail=1", [1440, 900]],
  ["07-light-mode-run", "scenario=run&theme=light&rail=1", [1440, 900]],
  ["08-light-start", "scenario=start&theme=light", [1440, 900]],
  ["09-many-tabs", "scenario=many&theme=dark", [1440, 900]],
  ["10-narrow", "scenario=run&theme=dark&rail=1", [900, 700]],
  ["11-command-bar-typing", "scenario=browsing&theme=dark", [1440, 900], "type"],
  ["12-palette", "scenario=browsing&theme=dark", [1440, 900], "palette"],
  ["13-set-progress", "scenario=set&theme=dark&rail=1", [1440, 900], "set"],
  ["14-disconnected", "scenario=disconnected&theme=dark", [1440, 900]],
  ["15-sidebar-peek", "scenario=browsing&theme=dark&sidebar=rail", [1440, 900], "peek"],
];

const browser = await chromium.launch({ headless: true });
try {
  for (const [name, query, [w, h], action] of SHOTS) {
    if (only && !name.includes(only)) continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: query.includes("light") ? "light" : "dark" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`${base}?${query}`, { waitUntil: "load" });
    await page.mouse.move(w / 2, h / 2);
    await page.waitForTimeout(900);
    if (action === "type") {
      await page.keyboard.press("Meta+L");
      await page.waitForTimeout(150);
      await page.keyboard.type("find every review comment that mentions accessibility", { delay: 5 });
      await page.waitForTimeout(400);
    }
    if (action === "palette") {
      await page.keyboard.press("Meta+K");
      await page.waitForTimeout(400);
    }
    if (action === "peek") {
      await page.hover(".sb-rail");
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: join(out, `${name}.png`) });
    console.log(`${name}.png${errors.length ? `  (console errors: ${errors.length})` : ""}`);
    for (const e of errors) console.log("   ", e.slice(0, 200));
    await page.close();
  }
} finally {
  await browser.close();
}
