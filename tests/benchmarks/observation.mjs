#!/usr/bin/env node
/** Offline observer comparison. APC rows are supplied by the native fork. */
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime } from "../../apps/runtime/dist/index.js";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";

const cases = [
  { id: "records", url: "http://127.0.0.1:4810/records", facts: ["Filter by status", "Record 01"] },
  { id: "detail", url: "http://127.0.0.1:4810/records/rec-09", facts: ["Owner", "Attachments"] },
  { id: "form", url: "http://127.0.0.1:4811/", facts: ["Name", "Submit"] },
];
const apcPath = process.argv.includes("--apc") ? process.argv[process.argv.indexOf("--apc") + 1] : undefined;
const apc = apcPath ? JSON.parse(readFileSync(apcPath, "utf8")) : {};
const procs = await startFixturesIfNeeded();
let runtime;
try {
  await waitForFixtures();
  runtime = await startRuntime({ ...process.env, AUX_DATA_DIR: mkdtempSync(join(tmpdir(), "aux-observer-")), AUX_ELECTRON_CDP: "" });
  const rows = [];
  for (const item of cases) {
    const page = await runtime.invoke("pages.open", { url: item.url, background: true });
    for (const [name, params] of [
      ["aux", { method: "pages.observe", params: { pageId: page.pageId, format: "compact" } }],
      ["accessibilityHtml", { method: "pages.accessibilityHtml", params: { pageId: page.pageId } }],
    ]) {
      const start = performance.now();
      const result = await runtime.invoke(params.method, params.params);
      const durationMs = Math.round(performance.now() - start);
      const text = result.observation?.text ?? result.text ?? "";
      rows.push({ caseId: item.id, observer: name, available: true, durationMs, chars: text.length,
        approxTokens: Math.ceil(text.length / 4), factsFound: item.facts.filter(fact => text.toLowerCase().includes(fact.toLowerCase())).length,
        factCount: item.facts.length });
    }
    const native = apc[item.id];
    const text = typeof native === "string" ? native : native?.text;
    rows.push(text ? { caseId: item.id, observer: "apc", available: true, durationMs: native.durationMs ?? null,
      chars: text.length, approxTokens: Math.ceil(text.length / 4), factsFound: item.facts.filter(fact => text.toLowerCase().includes(fact.toLowerCase())).length,
      factCount: item.facts.length } : { caseId: item.id, observer: "apc", available: false, reason: "Native APC capture was not supplied" });
    await runtime.invoke("pages.close", { pageId: page.pageId });
  }
  const report = { measuredAt: new Date().toISOString(), kind: "fixture-observation", apcSource: apcPath ?? null, rows };
  mkdirSync("tests/benchmarks/reports", { recursive: true });
  const output = join("tests/benchmarks/reports", `observer-${Date.now()}.json`);
  writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ report: output, rows }, null, 2));
} finally {
  await runtime?.close();
  for (const proc of procs) proc.kill?.();
}
