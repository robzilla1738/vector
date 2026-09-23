#!/usr/bin/env node
/**
 * Performance budgets (`pnpm budgets`).
 *
 *   node scripts/check-budgets.mjs bundle            renderer startup JS/CSS from the Vite manifest
 *   node scripts/check-budgets.mjs bench <report>    p50 timings and bytes from a `pnpm bench` report
 *
 * Budgets live in scripts/budgets.json. Lower them as the code gets faster;
 * raising one needs a written tradeoff (docs/ROADMAP.md §6).
 */
import { readFileSync, statSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const budgets = JSON.parse(readFileSync(join(root, "scripts/budgets.json"), "utf8"));
const [mode, arg] = process.argv.slice(2);
const failures = [];
const report = (name, actual, limit, unit) => {
  const ok = actual <= limit;
  if (!ok) failures.push(name);
  console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(28)} ${String(actual).padStart(9)} ${unit}  (budget ${limit} ${unit})`);
};

if (mode === "bundle") {
  const dist = join(root, "apps/desktop/dist/renderer");
  const manifest = JSON.parse(readFileSync(join(dist, ".vite/manifest.json"), "utf8"));
  const size = (file) => statSync(join(dist, file)).size;
  // Everything the shell must download before its first interactive paint:
  // the entry, its static imports, and the boot-critical chunks it imports
  // dynamically on startup (App), plus their static imports.
  const seen = new Set();
  const js = new Set();
  const css = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = manifest[key];
    if (!chunk) return;
    js.add(chunk.file);
    for (const c of chunk.css ?? []) css.add(c);
    for (const i of chunk.imports ?? []) visit(i);
    for (const i of chunk.dynamicImports ?? []) if (bootDynamic.test(manifest[i]?.file ?? "")) visit(i);
  };
  const bootDynamic = new RegExp(budgets.bundle.bootDynamicImports);
  for (const key of budgets.bundle.startupEntries) visit(key);
  const kb = (n) => Math.round(n / 1024);
  const startupJs = [...js].reduce((n, f) => n + size(f), 0);
  const startupCss = [...css].reduce((n, f) => n + size(f), 0);
  const allJs = readdirSync(join(dist, "assets")).filter((f) => f.endsWith(".js")).reduce((n, f) => n + size(`assets/${f}`), 0);
  report("renderer startup JS", kb(startupJs), budgets.bundle.startupJsKb, "KB");
  report("renderer startup CSS", kb(startupCss), budgets.bundle.startupCssKb, "KB");
  report("renderer total JS", kb(allJs), budgets.bundle.totalJsKb, "KB");
  for (const f of [...js].sort((a, b) => size(b) - size(a))) console.log(`     ${String(kb(size(f))).padStart(5)} KB  ${f}`);
} else if (mode === "bench") {
  if (!arg) throw new Error("usage: check-budgets.mjs bench <report.json>");
  const bench = JSON.parse(readFileSync(resolve(arg), "utf8"));
  for (const [metric, limit] of Object.entries(budgets.bench)) {
    const m = bench.metrics?.[metric];
    if (!m) {
      failures.push(metric);
      console.log(`FAIL ${metric.padEnd(28)} missing from report`);
      continue;
    }
    report(metric, m.p50, limit, metric.endsWith(".bytes") ? "B" : "ms");
  }
} else {
  console.error("usage: check-budgets.mjs bundle | bench <report.json>");
  process.exit(2);
}
process.exit(failures.length ? 1 : 0);
