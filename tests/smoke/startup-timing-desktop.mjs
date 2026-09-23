// Cold-launch timing: process spawn to shell window, painted home surface,
// and first runtime-backed page open. Prints medians over AUX_RUNS launches.
// AUX_SEED_FILTERS=1 starts from a profile holding a ~2.3 MB downloaded hosts
// list (fresh, so no refetch) — the realistic returning-user startup.
// AUX_ROOT points at another checkout to compare builds.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { launchApp, shellWindow } from './launch.mjs';
const server = createServer((_req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<title>Timing fixture</title><h1>Fixture</h1>'); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const runs = Number(process.env.AUX_RUNS ?? 5);
const samples = { window: [], home: [], runtime: [], pageOpen: [] };
function seedFilters(filters) {
  mkdirSync(filters, { recursive: true });
  const url = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts';
  const id = createHash('sha256').update(url).digest('hex').slice(0, 12);
  const text = Array.from({ length: 90_000 }, (_, i) => `0.0.0.0 ads-${i.toString(36)}.tracker${i % 97}.example`).join('\n');
  writeFileSync(join(filters, 'sources.json'), JSON.stringify([{ id, name: 'StevenBlack unified hosts', url, enabled: true }]));
  writeFileSync(join(filters, `${id}.txt`), text);
  writeFileSync(join(filters, `${id}.meta.json`), JSON.stringify({ fetchedAt: Date.now(), hosts: 90_000, sha256: createHash('sha256').update(text).digest('hex') }));
}
const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
try {
  for (let i = 0; i < runs; i++) {
    const dir = mkdtempSync(join(tmpdir(), 'aux-timing-'));
    if (process.env.AUX_SEED_FILTERS === '1') seedFilters(join(dir, 'data', 'filters'));
    let app;
    try {
      const t0 = performance.now();
      app = await launchApp({args:['--use-mock-keychain'],env: { PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, 'profile'), AUX_DATA_DIR: join(dir, 'data'), AUX_LOAD_DOTENV: '0', ...(process.env.NODE_COMPILE_CACHE ? { NODE_COMPILE_CACHE: process.env.NODE_COMPILE_CACHE } : {}) }});
      const runtimeReady = new Promise(resolve => app.process().stdout.on('data', chunk => { if (String(chunk).includes('runtime ready')) resolve(performance.now() - t0); }));
      let page = await shellWindow(app);
      samples.window.push(performance.now() - t0);
      await page.locator('.aux-home').waitFor();
      samples.home.push(performance.now() - t0);
      await page.evaluate(async url => { await window.aux.invoke('pages.open', { url, activate: true }); }, `${base}/one`);
      samples.pageOpen.push(performance.now() - t0);
      samples.runtime.push(await runtimeReady);
    } finally {
      await app?.close().catch(() => {});
      rmSync(dir, { recursive: true, force: true });
    }
  }
  for (const [k, xs] of Object.entries(samples)) console.log(`${k.padEnd(9)} median ${median(xs).toFixed(0)}ms  [${xs.map(x => x.toFixed(0)).join(', ')}]`);
} finally { server.close(); }
