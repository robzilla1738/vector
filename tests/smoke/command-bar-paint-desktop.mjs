// Current-source native measurement: renderer input event to a painted local history row.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo } from "../../apps/runtime/dist/index.js";
import { closeAux, launchAux } from "./launch.mjs";

const dir = mkdtempSync(join(tmpdir(), "aux-command-paint-"));
mkdirSync(join(dir, "data"));
const db = openDb(join(dir, "data/aux-state.sqlite"));
const repo = new Repo(db);
for (let i = 0; i < 2000; i++) repo.addHistory(`https://fixture${i}.example.test/`, `Reference ${i}`);
for (let i = 0; i < 12; i++) repo.addHistory(`https://needletopic${i}.example.test/`, `NeedleTopic${i}`);
db.close();

let app;
try {
  const launched = await launchAux({ args: ["--use-mock-keychain"], env: {
    PATH: process.env.PATH, HOME: dir, TMPDIR: dir,
    AUX_PROFILE_DIR: join(dir, "profile"), AUX_DATA_DIR: join(dir, "data"), AUX_LOAD_DOTENV: "0",
  } });
  app = launched.app;
  const shell = launched.page;
  await shell.locator(".aux-home").waitFor();
  const prewarmMs = process.argv.includes("--prewarm") ? await shell.evaluate(async () => {
    const start = performance.now();
    await window.aux.invoke("history.list", { query: "reference", limit: 1 });
    return performance.now() - start;
  }) : null;
  const input = shell.getByRole("combobox", { name: /Search or address/ });
  const samples = [];
  for (let i = 0; i < 12; i++) {
    const query = `needletopic${i}`;
    await shell.evaluate(query => {
      const input = document.querySelector('input[role="combobox"][aria-label^="Search or address"]');
      if (!input) throw new Error("Home command bar is missing");
      let started;
      window.__auxPaintSample = new Promise((resolve, reject) => {
        const timer = setTimeout(() => { observer.disconnect(); reject(new Error(`No local suggestion painted for ${query}`)); }, 5000);
        const observer = new MutationObserver(() => {
          if (started === undefined) return;
          const titles = [...document.querySelectorAll(".cb-opt.recent .cb-opt-title")].map(node => node.textContent?.toLowerCase());
          if (!titles.includes(query)) return;
          observer.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(() => {
            clearTimeout(timer);
            resolve(performance.now() - started);
          }));
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        input.addEventListener("input", () => { if (input.value.toLowerCase() === query) started = performance.now(); }, { once: true });
      });
    }, query);
    await input.fill(query);
    samples.push(await shell.evaluate(() => window.__auxPaintSample));
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const p50 = sorted[Math.ceil(sorted.length * 0.5) - 1];
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  assert.equal(samples.length, 12);
  await shell.keyboard.press("Escape");
  await shell.keyboard.press("Meta+k");
  const palette = shell.getByRole("combobox", { name: "Command palette" });
  await palette.waitFor();
  await shell.evaluate(() => {
    const input = document.querySelector('input[role="combobox"][aria-label="Command palette"]');
    if (!input) throw new Error("Palette input is missing");
    let started;
    window.__auxPalettePaint = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { observer.disconnect(); reject(new Error("Local palette result did not paint")); }, 5000);
      const observer = new MutationObserver(() => {
        if (started === undefined || ![...document.querySelectorAll(".pal-item .t")]
          .some(node => node.textContent?.toLowerCase() === "needletopic0")) return;
        observer.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(timer); resolve(performance.now() - started); }));
      });
      observer.observe(document.body, { subtree: true, childList: true, characterData: true });
      input.addEventListener("input", () => { if (input.value.toLowerCase() === "needletopic0") started = performance.now(); }, { once: true });
    });
  });
  await palette.fill("needletopic0");
  const palettePaintMs = await shell.evaluate(() => window.__auxPalettePaint);
  console.log(JSON.stringify({ kind: "native-local-suggestion-input-to-paint", historyRows: 2012,
    trials: samples.length, prewarmMs: prewarmMs === null ? null : Math.round(prewarmMs * 10) / 10,
    p50Ms: Math.round(p50 * 10) / 10, p95Ms: Math.round(p95 * 10) / 10,
    palettePaintMs: Math.round(palettePaintMs * 10) / 10,
    samplesMs: samples.map(value => Math.round(value * 10) / 10) }));
} finally {
  if (app) await closeAux(app);
  rmSync(dir, { recursive: true, force: true });
}
