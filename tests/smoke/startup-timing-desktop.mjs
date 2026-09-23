// Cold-launch timing: process spawn to shell window, painted home surface,
// and first runtime-backed page open. Prints medians over AUX_RUNS launches.
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';
const root = resolve(import.meta.dirname, '../..');
const { _electron } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
const server = createServer((_req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<title>Timing fixture</title><h1>Fixture</h1>'); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const runs = Number(process.env.AUX_RUNS ?? 5);
const samples = { window: [], home: [], pageOpen: [] };
const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
try {
  for (let i = 0; i < runs; i++) {
    const dir = mkdtempSync(join(tmpdir(), 'aux-timing-'));
    let app;
    try {
      const t0 = performance.now();
      app = await _electron.launch({ executablePath: createRequire(join(root, 'apps/desktop/package.json'))('electron'), args: [join(root, 'apps/desktop'), '--use-mock-keychain'],
        env: { PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, 'profile'), AUX_DATA_DIR: join(dir, 'data'), AUX_LOAD_DOTENV: '0' } });
      let page; for (let j = 0; j < 400; j++) { page = app.windows().find(p => p.url().includes('renderer/index.html')); if (page) break; await new Promise(r => setTimeout(r, 10)); }
      samples.window.push(performance.now() - t0);
      await page.locator('.aux-home').waitFor();
      samples.home.push(performance.now() - t0);
      await page.evaluate(async url => { await window.aux.invoke('pages.open', { url, activate: true }); }, `${base}/one`);
      samples.pageOpen.push(performance.now() - t0);
    } finally {
      await app?.close().catch(() => {});
      rmSync(dir, { recursive: true, force: true });
    }
  }
  for (const [k, xs] of Object.entries(samples)) console.log(`${k.padEnd(9)} median ${median(xs).toFixed(0)}ms  [${xs.map(x => x.toFixed(0)).join(', ')}]`);
} finally { server.close(); }
