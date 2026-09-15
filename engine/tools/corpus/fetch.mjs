#!/usr/bin/env node
/**
 * Snapshots the public-page corpus (`engine/conformance/corpus.json`) into
 * `engine/fixtures/public/{static,spa}/<name>.html`.
 *
 * Each snapshot is made self-contained for the engine, which does not fetch
 * subresources yet (plan A11): external stylesheets (`<link rel=stylesheet>`,
 * same-origin or CDN, up to CSS_BYTES_CAP) are inlined as `<style>` and a
 * `<base href>` is inserted so relative `href`/`src`/`action` values resolve
 * against the original URL. Scripts are left untouched: the router must see
 * the page exactly as served to classify it.
 *
 *   node engine/tools/corpus/fetch.mjs            # everything in the manifest
 *   node engine/tools/corpus/fetch.mjs --only hn  # names containing "hn"
 *   node engine/tools/corpus/fetch.mjs --kind spa
 *
 * Pages that fail (bot walls, timeouts, >HTML_BYTES_CAP) are reported and
 * skipped; the manifest is the source of truth, the fixtures directory is
 * whatever last fetched cleanly.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const engineRoot = resolve(here, "../..");
const manifest = JSON.parse(readFileSync(join(engineRoot, "conformance/corpus.json"), "utf8"));
const outRoot = join(engineRoot, "fixtures/public");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const HTML_BYTES_CAP = 1_500_000;
const CSS_BYTES_CAP = 600_000;
const TIMEOUT_MS = 20_000;

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const kindFilter = args.includes("--kind") ? args[args.indexOf("--kind") + 1] : null;

async function get(url, accept) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept, "accept-language": "en-US,en;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { text: await res.text(), url: res.url, contentType: res.headers.get("content-type") ?? "" };
}

const LINK_RE = /<link\b[^>]*>/gi;
const ATTR_RE = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(ATTR_RE)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return out;
}

/** Rewrites `url(...)` inside a stylesheet so relative asset paths stay valid. */
function absolutizeCss(css, sheetUrl) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) => {
    if (/^(data:|https?:|\/\/|#)/i.test(ref)) return m;
    try {
      return `url(${q}${new URL(ref, sheetUrl).href}${q})`;
    } catch {
      return m;
    }
  });
}

async function inlineStylesheets(html, pageUrl) {
  let budget = CSS_BYTES_CAP;
  let inlined = 0;
  const jobs = [];
  for (const tag of html.match(LINK_RE) ?? []) {
    const a = attrs(tag);
    const rel = (a.rel ?? "").toLowerCase().split(/\s+/);
    if (!rel.includes("stylesheet") || !a.href) continue;
    if (a.media && /print/i.test(a.media)) continue;
    let href;
    try {
      href = new URL(a.href, pageUrl).href;
    } catch {
      continue;
    }
    jobs.push({ tag, href, media: a.media });
  }
  const results = await Promise.allSettled(jobs.map((j) => get(j.href, "text/css,*/*;q=0.1")));
  results.forEach((r, i) => {
    const { tag, href, media } = jobs[i];
    if (r.status !== "fulfilled") return;
    const css = absolutizeCss(r.value.text, r.value.url);
    if (css.length > budget) return;
    budget -= css.length;
    inlined += 1;
    const mediaAttr = media && media !== "all" ? ` media="${media}"` : "";
    html = html.replace(tag, `<style data-inlined-from="${href}"${mediaAttr}>\n${css.replace(/<\/style/gi, "<\\/style")}\n</style>`);
  });
  return { html, inlined };
}

function insertBase(html, url) {
  if (/<base\b/i.test(html)) return html;
  const base = `<base href="${url}">`;
  const m = /<head\b[^>]*>/i.exec(html);
  if (m) return html.slice(0, m.index + m[0].length) + base + html.slice(m.index + m[0].length);
  return base + html;
}

async function snapshot(kind, entry) {
  const t0 = performance.now();
  const page = await get(entry.url, "text/html,application/xhtml+xml");
  if (!/html/i.test(page.contentType)) throw new Error(`not HTML: ${page.contentType}`);
  if (page.text.length > HTML_BYTES_CAP) throw new Error(`HTML ${page.text.length} bytes > cap`);
  const { html, inlined } = await inlineStylesheets(page.text, page.url);
  const out = `<!-- vector corpus snapshot: ${entry.url} (final ${page.url}) fetched ${new Date().toISOString()} -->\n${insertBase(html, page.url)}`;
  const dir = join(outRoot, kind);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${entry.name}.html`), out);
  return { bytes: out.length, inlined, ms: Math.round(performance.now() - t0), finalUrl: page.url };
}

const summary = { ok: [], failed: [] };
for (const kind of ["static", "spa"]) {
  if (kindFilter && kind !== kindFilter) continue;
  for (const entry of manifest[kind]) {
    if (only && !entry.name.includes(only)) continue;
    try {
      const r = await snapshot(kind, entry);
      summary.ok.push({ kind, ...entry, ...r });
      console.log(`ok    ${kind.padEnd(6)} ${entry.name.padEnd(28)} ${String(r.bytes).padStart(8)} B  css×${r.inlined}  ${r.ms} ms`);
    } catch (e) {
      summary.failed.push({ kind, ...entry, error: String(e.message ?? e) });
      console.log(`FAIL  ${kind.padEnd(6)} ${entry.name.padEnd(28)} ${e.message ?? e}`);
    }
  }
}
console.log(`\n${summary.ok.length} snapshots written, ${summary.failed.length} failed`);
if (summary.failed.length) process.exitCode = 2;
