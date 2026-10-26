import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { transformAuxFixedComputerUse } from '../../../../../../vendor/provided/aux-fixed-computer-use.mjs';
const input = process.argv[2];
if (!input) throw Error('Pass the reviewed paired source directory.');
const output = mkdtempSync(join(tmpdir(), 'aux-fixed-computer-use-'));
const sha256 = text => createHash('sha256').update(text).digest('hex');
const files = [];
for (const name of ['index.mjs', 'aux-native-entry.mjs']) {
  const source = readFileSync(join(input, name), 'utf8');
  const result = transformAuxFixedComputerUse({ text: source });
  const target = join(output, name);
  writeFileSync(target, result.text, { mode: 0o600 });
  const check = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
  if (check.status !== 0) throw Error(`Paired source syntax failed for ${name}: ${check.stderr}`);
  let reversed = result.text;
  for (const anchor of [...result.anchors].reverse()) reversed = anchor.append ? reversed.slice(0, -anchor.append.length) : reversed.replace(anchor.replace, () => anchor.find);
  if (reversed !== source) throw Error('Fixed Computer Use source reverse replay failed.');
  files.push({ name, inputSha256: sha256(source), outputSha256: sha256(result.text), anchors: result.anchors.length });
}
console.log(JSON.stringify({ format: 'aux.fixed-computer-use.source.v1', output, files, productExecution: false }, null, 2));
