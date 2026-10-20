// Pure supplied-consumer boundary check: no DOM, browser, profile or RPC calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'source-evidence.json')));
const input = evidence.uiInputs.find(item => item.path.endsWith('/general-3dgRbrRk.js'));
const text = fs.readFileSync(input.path, 'utf8');
const predicate = 'e.every(N=>k.source.supportedDataKinds.includes(N))';
assert.equal(text.split(predicate).length - 1, 1);
const accepts = new Function('e', 'k', `return ${predicate}`);
assert.throws(() => accepts(['bookmarks'], {source: {categories: ['bookmarks']}}), TypeError);
assert.equal(accepts(['bookmarks'], {source: {supportedDataKinds: ['history', 'bookmarks']}}), true);
assert.equal(accepts(['passwords'], {source: {supportedDataKinds: ['history', 'bookmarks']}}), false);
assert.equal(accepts(['bookmarks'], {source: {supportedDataKinds: []}}), false);
console.log('PASS: exact supplied settings predicate requires array and rejects unavailable kinds; not native acceptance');
