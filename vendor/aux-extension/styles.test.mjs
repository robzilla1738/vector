// The Aux-owned extension styles on their own: token names, light and dark, the page-tint names.
import assert from 'node:assert/strict';
import test from 'node:test';
import {BLOCKS, NEWTAB_BLOCKS, REMOVED_FILES, UTILITIES, declarations, geistFaces, readSource, shipped} from './integration.mjs';

const names = (css, context) => new Set(declarations(css).filter(([at]) => at === context).map(([, name]) => name));
const colors = readSource('colors.css');
const light = names(colors, ':root,.light');
const dark = names(colors, '.dark');
const theme = names(readSource('theme.css'), '@layer theme > :root,:host');
// chrome/browser/ui/views/frame/aux_page_tint.cc sets these inline on <html>.
const TINT = ['--background', '--web-content-background', '--sidebar', '--card', '--popover', '--muted', '--secondary', '--accent', '--border', '--input'];

test('light and dark define the same color tokens; only light carries the radius and hairline', () => {
  for (const name of ['--foreground', '--primary', '--primary-foreground', '--muted-foreground', '--destructive', '--brand', '--ring', '--surface-primary', '--border-surface'])
    assert.ok(light.has(name) && dark.has(name), name);
  assert.deepEqual([...dark].filter(name => !light.has(name)), []);
  assert.deepEqual([...light].filter(name => !dark.has(name)).sort(), ['--hairline', '--radius']);
});

test('every name the page tint overrides is a token in light and dark', () => {
  for (const name of TINT) assert.ok(light.has(name) && dark.has(name), name);
});

test('the theme layer keeps the type, spacing, radius and shadow scales', () => {
  for (const name of ['--font-sans', '--font-mono', '--font-system', '--default-font-family', '--spacing', '--text-sm', '--text-sm--line-height',
    '--font-weight-medium', '--radius-xs', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl', '--radius-3xl', '--drop-shadow-sm',
    '--squircle-factor', '--color-neutral-950', '--color-white'])
    assert.ok(theme.has(name), name);
});

test('the corner tokens are the frame metrics: control 8, card 10, popover 12', () => {
  const value = name => declarations(readSource('theme.css')).find(([, n]) => n === name)[2];
  const px = name => parseFloat(value(name)) * 16;
  assert.deepEqual([px('--aux-radius-control'), px('--aux-radius-card'), px('--aux-radius-popover')], [8, 10, 12]);
  assert.equal(value('--radius-lg'), 'calc(var(--aux-radius-control) * var(--squircle-factor))');
  assert.equal(value('--radius-xl'), 'calc(var(--aux-radius-popover) * var(--squircle-factor))');
  assert.equal(declarations(colors).find(([, n]) => n === '--radius')[2], 'var(--aux-radius-card)');
});

test('each source ships as balanced CSS without comments, and no font points at a removed file', () => {
  for (const file of [...BLOCKS, ...NEWTAB_BLOCKS].map(({file}) => file).concat(UTILITIES)) {
    const css = shipped(readSource(file));
    assert.equal(css.split('{').length, css.split('}').length, file);
    assert.ok(!css.includes('/*') && !css.includes('\n'), file);
  }
  const fonts = shipped(readSource('fonts.css'));
  for (const file of REMOVED_FILES) assert.ok(!fonts.includes(file.split('/').pop()), file);
  assert.equal(fonts.split('@font-face').length - 1, 7);
});

test('New Tab first paint defines light and dark alike and draws Geist from the fonts source', () => {
  const css = readSource('newtab-first-paint.css');
  const firstLight = names(css, ':root');
  const firstDark = names(css, '.dark');
  assert.deepEqual([...firstLight].filter(name => !firstDark.has(name)), ['--font-sans', '--font-system']);
  assert.equal(geistFaces().split('@font-face').length - 1, 3);
  assert.ok(!geistFaces().includes('Aux Display'));
});

test('the added utilities live in the utilities layer and only add what the components need', () => {
  const rows = declarations(readSource(UTILITIES));
  assert.deepEqual([...new Set(rows.map(([at]) => at))], ['@layer utilities > .rounded-b-xl', '@layer utilities > .bg-card',
    '@layer utilities > .-mt-\\[var\\(--radius-xl\\)\\]', '@layer utilities > .\\[--_r\\:var\\(--radius-xl\\)\\]',
    '@layer utilities > @media (hover: hover) > .group-hover\\/routine\\:bg-muted:is(:where(.group\\/routine):hover *)']);
  assert.deepEqual(rows.map(([, , value]) => value), ['var(--radius-xl)', 'var(--radius-xl)', 'var(--card)', 'calc(var(--radius-xl) * -1)', 'var(--radius-xl)',
    'var(--muted)']);
});
