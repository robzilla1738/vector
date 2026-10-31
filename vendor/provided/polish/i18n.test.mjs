// The scripted check of the extension's languages: each one complete, and the runtime serving it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {ENGLISH, LOCALES, OWN, localize, localizeAnchors, runtimeModule, templateMessage, withRuntime} from '../i18n/integration.mjs';

const catalog = name => JSON.parse(readFileSync(new URL(`../i18n/catalog/${name}.json`, import.meta.url), 'utf8'));
const placeholders = text => (text.match(/\{\w+\}/g) ?? []).sort().join();
const english = {...Object.fromEntries(Object.entries(ENGLISH).map(([key, {message}]) => [key, message])), ...OWN};

for (const locale of LOCALES) test(`${locale}: every string is translated, with its placeholders`, () => {
  const table = {...catalog(locale), ...catalog(`own-${locale}`)};
  assert.deepEqual(Object.keys(table).sort(), Object.keys(english).sort());
  let same = 0;
  for (const [key, text] of Object.entries(english)) {
    assert.ok(table[key]?.trim(), key);
    assert.equal(placeholders(table[key]), placeholders(text), key);
    if (table[key] === text) same++;
  }
  assert.ok(same / Object.keys(english).length < 0.2, `${same} strings read the same as English`);
});

const running = (language, chrome = {i18n: {getUILanguage: () => language}}) => {
  const context = {chrome};
  context.globalThis = context;
  vm.runInNewContext(runtimeModule(), context);
  return context;
};
const anyKey = Object.keys(ENGLISH)[0];

test('the runtime picks the browser language, its nearest catalog, or English', () => {
  for (const [language, locale] of [['de', 'de'], ['de-AT', 'de'], ['pt', 'pt-BR'], ['pt-PT', 'pt-BR'], ['zh', 'zh-CN'], ['zh-Hant-HK', 'zh-TW'], ['zh_TW', 'zh-TW'], ['ja', 'ja'], ['en-US', 'en-US'], ['xx', 'en-US']])
    assert.equal(running(language).__auxLocale, locale, language);
  assert.equal(running('de').__auxT(anyKey, 'English'), catalog('de')[anyKey]);
  assert.equal(running('en-US').__auxT(anyKey, 'English'), 'English');
  assert.equal(running('fr').__auxT('not.a.key', 'Kept'), 'Kept');
  assert.equal(running('fr').__auxT('not.a.key', 'Hi {1}', {1: 'Ada'}), 'Hi Ada');
});

test('a display string is wrapped once; other strings and code are left', () => {
  const message = ENGLISH[anyKey].message;
  const wrapped = localize(`x({children:${JSON.stringify(message)},id:${JSON.stringify(message)}})`);
  assert.equal(wrapped, `x({children:__auxT(${JSON.stringify(anyKey)},${JSON.stringify(message)}),id:${JSON.stringify(message)}})`);
  assert.equal(localize(wrapped), wrapped);
  assert.equal(localize('x({children:"Not in any catalog at all"})'), 'x({children:"Not in any catalog at all"})');
  assert.deepEqual(templateMessage('Hello ${name}, ${a.b}'), {message: 'Hello {1}, {2}', values: ['name', 'a.b']});
});

test('a template string keeps its values', () => {
  const [key, message] = Object.entries(OWN).find(([, text]) => text.includes('{1}') && !text.includes('{2}'));
  const wrapped = localize(`x({title:\`${message.replace('{1}', '${name}')}\`})`);
  assert.equal(wrapped, `x({title:__auxT(${JSON.stringify(key)},${JSON.stringify(message)},{1:name})})`);
});

test('an anchor outside a display position is wrapped by its catalog entry', () => {
  const [key, entry] = Object.entries(ENGLISH).find(([, value]) => value.anchor === JSON.stringify(value.message));
  assert.ok(localizeAnchors(entry.source, `a(${entry.anchor})`).includes(`__auxT(${JSON.stringify(key)}`));
});

test('the entry points load the runtime first', () => {
  assert.equal(withRuntime('background.js', 'x').split('\n')[0], 'import "./assets/aux-i18n.js";');
  assert.ok(withRuntime('assets/newtab-editor-u_GbForB.js', '}catch(e){}}();y').includes('}catch(e){}}();import"./aux-i18n.js";y'));
  assert.equal(withRuntime('assets/other.js', 'x'), 'x');
});
