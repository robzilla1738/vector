import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
const directory = new URL('./', import.meta.url);
async function load(side) {
  const source = fs.readFileSync(new URL(`registry/${side}/packages/contracts/src/commands.ts`, directory), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
}
const before = await load('before'), result = await load('result');
const rows = JSON.parse(fs.readFileSync(new URL('registry-rows.json', directory)));
const ids = new Set(rows.map(([id]) => id));
assert.equal(ids.size, 20);
assert.deepEqual(result.COMMANDS.filter(row => !ids.has(row.id)), before.COMMANDS);
assert.deepEqual(result.COMMANDS.slice(0, 20).map(row => [row.id,row.label]), rows);
for (const row of result.COMMANDS.slice(0,20)) {
  assert.deepEqual(row, { id: row.id, label: row.label, section: 'Application', handler:'shell', focusShell:true, palette:false, windows:['normal','private'], bindings:[], intercept:true, dispatch:'scoped' });
  assert(result.SCOPED_COMMANDS.some(scoped => scoped.id === row.id));
}
assert.equal(new Set(result.COMMANDS.map(row => row.id)).size, result.COMMANDS.length);
console.log(JSON.stringify({ originalRows:before.COMMANDS.length, addedRows:ids.size, completeOriginalMetadataAndOrderUnchanged:true, scopedDispatcherAutomatic:true, originalDigest:crypto.createHash('sha256').update(JSON.stringify(before.COMMANDS)).digest('hex') },null,2));
