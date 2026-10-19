/** Build/observe only original fixtures in a new disposable headless Chrome profile. */
import { execFile } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';

const run = promisify(execFile),
  app = fileURLToPath(new URL('..', import.meta.url)),
  temporary = mkdtempSync(join(tmpdir(), 'aux-vault-geometry-'));
const evidence = mkdtempSync(join(tmpdir(), 'aux-vault-observation-'));
const chrome =
  process.env.AUX_FIXTURE_CHROME ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const css = readdirSync(join(app, 'dist/assets')).find((file) =>
  /^app-.*\.css$/.test(file),
);
if (!css) throw new Error('Build Aux Vault before running this fixture.');
await build({
  entryPoints: [join(app, 'acceptance/geometry.tsx')],
  outfile: join(temporary, 'fixture.js'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  jsx: 'automatic',
  logLevel: 'error',
});
const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'none'",
  );
  if (url.pathname === '/') {
    response.setHeader('content-type', 'text/html');
    response.end(
      `<!doctype html><html data-theme="${url.searchParams.get('theme') === 'dark' ? 'dark' : 'light'}"><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/${css}"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`,
    );
    return;
  }
  if (url.pathname === '/fixture.js') {
    response.setHeader('content-type', 'text/javascript');
    response.end(readFileSync(join(temporary, 'fixture.js')));
    return;
  }
  if (/^\/assets\/[\w.-]+$/.test(url.pathname)) {
    try {
      response.setHeader(
        'content-type',
        url.pathname.endsWith('.css')
          ? 'text/css'
          : url.pathname.endsWith('.svg')
            ? 'image/svg+xml'
            : 'font/woff2',
      );
      response.end(readFileSync(join(app, 'dist', url.pathname)));
      return;
    } catch {}
  }
  response.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string')
  throw new Error('Fixture server failed');
const reports = [];
try {
  for (const [width, height] of [
    [600, 432],
    [900, 800],
  ])
    for (const theme of ['light', 'dark']) {
      const profile = join(temporary, `${theme}-${width}`);
      const { stdout } = await run(
        chrome,
        [
          `--user-data-dir=${profile}`,
          '--headless=new',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-background-networking',
          '--disable-component-update',
          '--disable-sync',
          '--use-mock-keychain',
          '--force-device-scale-factor=1',
          `--window-size=${width},${height}`,
          '--virtual-time-budget=2500',
          '--dump-dom',
          `--screenshot=${join(evidence, `${theme}-${width}.png`)}`,
          `http://127.0.0.1:${address.port}/?theme=${theme}`,
        ],
        { maxBuffer: 4000000, timeout: 20000 },
      );
      const match = stdout.match(
        /<pre id="geometry-results" hidden="">([^<]*)<\/pre>/,
      );
      if (!match)
        throw new Error(
          `Original fixture did not finish: ${stdout.slice(-1500)}`,
        );
      const report = {
        requestedWindowSize: [width, height],
        theme,
        measurements: JSON.parse(match[1]),
      };
      reports.push(report);
      const m = report.measurements;
      if (
        m.row.borderRadius !== '11.2px' ||
        m.detail.borderRadius !== '16.8px' ||
        m.unlock.width !== 320 ||
        m.decoration.width !== 112 ||
        m.number.width !== 64 ||
        m.number.height !== 28 ||
        m.slider.width !== 160 ||
        m.chooser.width !== 224 ||
        !m.chooserArrowFocus
      )
        throw new Error('Intrinsic geometry/chooser focus mismatch');
    }
  console.log(
    JSON.stringify(
      {
        kind: 'original-disposable-component-observation',
        evidenceDirectory: evidence,
        reports,
      },
      null,
      2,
    ),
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
