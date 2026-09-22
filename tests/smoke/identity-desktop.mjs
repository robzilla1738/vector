// Private bundle identity and synthetic restart continuity. Never uses real keys.
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../..');
const { _electron } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
const platformDirectory = process.arch === 'x64' ? 'mac' : `mac-${process.arch}`;
const bundle = join(root, 'release', platformDirectory, 'Aux Browser.app');
const plist = JSON.parse(execFileSync('plutil', ['-convert', 'json', '-o', '-', join(bundle, 'Contents/Info.plist')], { encoding: 'utf8' }));
assert.equal(plist.CFBundleDisplayName, 'Aux');
assert.equal(plist.CFBundleExecutable, 'Aux Browser');
assert.equal(plist.CFBundleIdentifier, 'dev.aux.browser');
const dir = mkdtempSync(join(tmpdir(), 'aux-identity-'));
let app;
let encrypted;
const evidence = [];
try {
  for (const round of [0, 1]) {
    app = await _electron.launch({
      executablePath: join(bundle, 'Contents/MacOS/Aux Browser'), args: ['--use-mock-keychain'],
      env: { PATH: process.env.PATH, HOME: dir, TMPDIR: dir,
        AUX_PROFILE_DIR: join(dir, 'profile'), AUX_DATA_DIR: join(dir, 'data'),
        AUX_LOAD_DOTENV: '0' },
    });
    let page;
    for (let i = 0; i < 100; i++) {
      page = app.windows().find(page => page.url().includes('renderer/index.html'));
      if (page) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(page, 'shell opens from the Aux executable');
    await page.locator('.aux-home').waitFor();
    const identity = await app.evaluate(({ app, Menu }) => ({
      name: app.getName(), version: app.getVersion(),
      menu: Menu.getApplicationMenu().items[0].submenu.items.map(item => item.label),
    }));
    assert.equal(identity.name, '@aux/desktop', 'encryption identity remains unchanged');
    for (const label of ['About Aux', 'Hide Aux', 'Quit Aux']) assert.ok(identity.menu.includes(label));
    if (round === 0) {
      encrypted = await app.evaluate(({ safeStorage }) => safeStorage.encryptString('aux-synthetic-restart-fixture').toString('base64'));
      await page.evaluate(() => localStorage.setItem('aux.identity.fixture', 'saved-before-restart'));
    } else {
      const decrypted = await app.evaluate(({ safeStorage }, value) => safeStorage.decryptString(Buffer.from(value, 'base64')), encrypted);
      assert.equal(decrypted, 'aux-synthetic-restart-fixture');
      assert.equal(await page.evaluate(() => localStorage.getItem('aux.identity.fixture')), 'saved-before-restart');
    }
    evidence.push({ round, ...identity });
    await app.close(); app = undefined;
  }
  const out = join(root, 'release/test-artifacts'); mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'aux-identity.json'), JSON.stringify({
    displayName: plist.CFBundleDisplayName, bundleId: plist.CFBundleIdentifier,
    evidence, restartContinuity: true, credentialStorage: 'synthetic mock only; real OS migration not qualified',
  }, null, 2));
  console.log('Aux bundle and menus verified; internal identity and synthetic restart data preserved.');
} finally { await app?.close(); rmSync(dir, { recursive: true, force: true }); }
