// Host-only: the Aux-owned styles against the sealed candidate's globals CSS.
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {chromiumSrc} from '../../scripts/lib/aux-chromium.mjs';
import {BLOCKS, GLOBALS_CSS, NEWTAB_BLOCKS, NEWTAB_PAGE, REMOVED_FILES, UTILITIES, declarations, geistFaces, integrateNewTab, integrateStyles,
  ULTRABROWSE_RULE, locateBlocks, readSource, shipped} from './integration.mjs';

const dist = `${requireInput('candidateApp')}/Contents/Resources/aux/apps/extension/dist`;
const sealed = readFileSync(`${dist}/${GLOBALS_CSS}`, 'utf8');
const spans = locateBlocks(sealed);
const after = integrateStyles(sealed);

test('the styles replace each pinned block once and refuse a second pass', () => {
  for (const {file} of BLOCKS) assert.equal(after.split(shipped(readSource(file))).length - 1, 1, file);
  assert.throws(() => integrateStyles(after), /drift/);
});

test('every rule outside the five blocks is byte for byte the supplied one', () => {
  const gaps = text => {
    const out = [];
    let cursor = 0;
    for (const {file} of BLOCKS) {
      const at = text.indexOf(shipped(readSource(file)), cursor);
      out.push(text.slice(cursor, at));
      cursor = at + shipped(readSource(file)).length;
    }
    return [...out, text.slice(cursor)];
  };
  const supplied = [];
  let cursor = 0;
  for (const [at, stop] of spans) { supplied.push(sealed.slice(cursor, at)); cursor = stop; }
  supplied.push(sealed.slice(cursor));
  const utilities = shipped(readSource(UTILITIES));
  assert.ok(after.endsWith(utilities));
  assert.deepEqual(gaps(after.slice(0, -utilities.length)), supplied.map(gap => gap.replace(ULTRABROWSE_RULE, '')));
  assert.ok(!after.includes('ultrabrowse'));
});

// The only intended differences outside fonts: the --aux-radius-* names and what reads them, and
// the --card / --sidebar names for the page tint. Substituted back, every declaration matches.
const AUX_RADIUS = {'--aux-radius-control': '.5rem', '--aux-radius-card': '.625rem', '--aux-radius-popover': '.75rem'};
const asSupplied = rows => rows
  .filter(([, name]) => !(name in AUX_RADIUS) && name !== '--card' && name !== '--sidebar')
  .map(([at, name, value]) => [at, name, value.replace(/var\((--aux-radius-[a-z]+)\)/g, (_, token) => AUX_RADIUS[token])]);

test('tokens, base styles and the document font keep the supplied values in the supplied order', () => {
  BLOCKS.forEach(({file}, index) => {
    if (file === 'fonts.css') return;
    const [at, stop] = spans[index];
    assert.deepEqual(asSupplied(declarations(readSource(file))), declarations(sealed.slice(at, stop)), file);
  });
});

test('the fonts are Geist only, every file they name ships, and the display face is gone', () => {
  const faces = shipped(readSource('fonts.css')).split('@font-face').slice(1).map(face => Object.fromEntries(declarations(`x${face}`).map(([, n, v]) => [n, v])));
  assert.deepEqual(faces.map(face => face['font-family']), [...Array(3).fill('Geist Variable'), ...Array(3).fill('Aux Display'), 'Geist Mono Variable']);
  for (const face of faces) {
    const file = face.src.match(/url\(\/(assets\/[^)]+)\)/)[1];
    assert.ok(/^assets\/geist-/.test(file) && existsSync(`${dist}/${file}`), file);
  }
  assert.deepEqual(faces.slice(3, 6).map(({src, 'unicode-range': range}) => [src, range]), faces.slice(0, 3).map(({src, 'unicode-range': range}) => [src, range]));
  for (const file of REMOVED_FILES) {
    assert.ok(existsSync(`${dist}/${file}`), `${file} is in the candidate`);
    assert.ok(!after.includes(file.split('/').pop()), file);
  }
});

test('the page tint still overrides exactly the names the tests expect', () => {
  const script = readFileSync(`${chromiumSrc}/chrome/browser/ui/views/frame/aux_page_tint.cc`, 'utf8');
  const names = script.match(/const names = \[([^\]]+)\]/)[1].match(/--[a-z-]+/g);
  const light = new Set(declarations(readSource('colors.css')).filter(([at]) => at === ':root,.light').map(([, name]) => name));
  for (const name of names) assert.ok(light.has(name), name);
});

const page = readFileSync(`${dist}/${NEWTAB_PAGE}`, 'utf8');
const pageAfter = integrateNewTab(page);

test('New Tab first paint: the block is replaced once with the Geist faces and the tokens, nothing else moves', () => {
  const [[at, stop]] = locateBlocks(page, NEWTAB_BLOCKS, 'New Tab');
  const replacement = geistFaces() + shipped(readSource('newtab-first-paint.css')) + shipped(readSource('newtab-page.css'));
  assert.equal(pageAfter, page.slice(0, at) + replacement + page.slice(stop));
  assert.deepEqual(asSupplied(declarations(readSource('newtab-first-paint.css'))), declarations(page.slice(at, stop)));
  assert.throws(() => integrateNewTab(pageAfter), /drift/);
});

test('New Tab first paint draws the faces and colors the loaded page uses', () => {
  assert.equal(geistFaces().split('@font-face').length - 1, 3);
  assert.ok(shipped(readSource('fonts.css')).includes(geistFaces()));
  // First paint writes resolved values where colors.css names palette tokens or mixes.
  const palette = Object.fromEntries(declarations(readSource('theme.css')).map(([, name, value]) => [name, value]));
  const resolve = value => value.replace(/var\((--color-[a-z0-9-]+)\)/g, (_, name) => palette[name]).replace(/ none\)/g, ' 0)')
    .replace(/^#fffc$/, 'color-mix(in oklab, #fff 80%, transparent)').replace(/#fff\b/g, 'oklch(100% 0 0)')
    .replace(/^oklch\(20\.5% 0 0\/\.8\)$/, 'color-mix(in oklab, oklch(20.5% 0 0) 80%, transparent)');
  const tokens = (css, context) => Object.fromEntries(declarations(css).filter(([at]) => at === context).map(([, name, value]) => [name, value]));
  const first = {light: tokens(readSource('newtab-first-paint.css'), ':root'), dark: tokens(readSource('newtab-first-paint.css'), '.dark')};
  const colors = readSource('colors.css');
  const loaded = {light: tokens(colors, ':root,.light'), dark: tokens(colors, '.dark')};
  const mixed = {light: tokens(colors, '@supports (color:color-mix(in lab,red,red)) > :root,.light'), dark: tokens(colors, '@supports (color:color-mix(in lab,red,red)) > .dark')};
  for (const mode of ['light', 'dark']) {
    let shared = 0;
    for (const [name, value] of Object.entries(first[mode])) {
      if (!(name in loaded[mode]) || name.startsWith('--lightningcss')) continue;
      shared++;
      let expected = resolve(loaded[mode][name]);
      if (name === '--web-content-background') expected = resolve(mixed[mode][name].replace('var(--background)', loaded[mode]['--background']));
      if (name === '--foreground' && mode === 'light') expected = resolve('var(--color-neutral-950)');
      assert.equal(resolve(value), expected, `${mode} ${name}`);
    }
    assert.ok(shared >= 8, `${mode}: ${shared} shared tokens`);
  }
});
