import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';

const output = resolve('out/utility-smoke');
mkdirSync(output, { recursive: true });
await build({
  entryPoints: ['apps/extension/test/utilities-browser.ts'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: join(output, 'fixture.js'),
});
const html = `<!doctype html><meta charset=utf-8><title>Aux disposable utilities fixture</title><style>body{font:16px system-ui;margin:32px;max-width:800px}textarea,input{display:block;margin:12px 0;width:300px}pre{white-space:pre-wrap;font-size:11px}#editor{border:1px solid #888;padding:8px}</style><h1>Aux utility fixture</h1><p id=paragraph>Hello from the original paragraph.</p><div id=editor contenteditable=true>Editable words</div><textarea id=field>alpha beta gamma</textarea><input id=password type=password value=secret-fixture><input id=sensitive name=cc-number value=42424242><form><label>Form label <input value=untouched></label></form><pre id=results>Running</pre><script src=/fixture.js></script>`;
const server = createServer((request, response) => {
  response.setHeader(
    'Content-Type',
    request.url === '/fixture.js' ? 'text/javascript' : 'text/html',
  );
  response.end(
    request.url === '/fixture.js'
      ? readFileSync(join(output, 'fixture.js'))
      : html,
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const url = `http://127.0.0.1:${address.port}/`;
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
async function run(extra, query = '') {
  const profile = mkdtempSync(join(tmpdir(), 'aux-utilities-chrome-'));
  try {
    return await new Promise((resolve, reject) => {
      const child = spawn(
        chrome,
        [
          '--headless=new',
          `--user-data-dir=${profile}`,
          '--use-mock-keychain',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-sync',
          '--virtual-time-budget=3000',
          ...extra,
          `${url}${query}`,
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let stdout = '',
        stderr = '';
      const timeout = setTimeout(() => {
        if (child.exitCode === null) child.kill('SIGTERM');
        reject(new Error('Disposable Chromium smoke timed out'));
      }, 20000);
      child.stdout.on('data', (value) => {
        stdout += value;
      });
      child.stderr.on('data', (value) => {
        stderr += value;
      });
      child.on('error', reject);
      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code !== 0)
          reject(
            new Error(
              `Chromium fixture failed ${code}: ${stderr.slice(-1000)}`,
            ),
          );
        else resolve(stdout);
      });
    });
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}
try {
  const dom = await run(['--dump-dom']);
  writeFileSync(join(output, 'fixture-dom.html'), dom);
  assert.match(dom, /data-smoke="passed"/);
  await run([
    `--screenshot=${join(output, 'light.png')}`,
    '--window-size=1000,800',
    '--blink-settings=preferredColorScheme=1',
  ]);
  await run([
    `--screenshot=${join(output, 'dark.png')}`,
    '--window-size=1000,800',
    '--force-dark-mode',
  ]);
  const translatedDom = await run(['--dump-dom'], '?surface=translation');
  writeFileSync(join(output, 'translation-dom.html'), translatedDom);
  assert.match(translatedDom, /data-smoke="passed"/);
  await run(
    [
      `--screenshot=${join(output, 'translation-light.png')}`,
      '--window-size=1000,800',
      '--blink-settings=preferredColorScheme=1',
    ],
    '?surface=translation',
  );
  await run(
    [
      `--screenshot=${join(output, 'translation-dark.png')}`,
      '--window-size=1000,800',
      '--force-dark-mode',
    ],
    '?surface=translation',
  );
  console.log(`Disposable Chromium DOM + overlay smoke passed; ${output}`);
} finally {
  server.close();
}
