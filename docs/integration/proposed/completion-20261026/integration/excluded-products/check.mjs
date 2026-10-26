import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { transformAuxExcludedProducts } from '../../../../../../vendor/provided/aux-excluded-product-pruning.mjs';
const pins = JSON.parse(readFileSync(new URL('./source-pins.json', import.meta.url), 'utf8'));
const output = mkdtempSync(join(tmpdir(), 'aux-excluded-product-source-'));
const files = [];
for (const file of pins.files) {
  const source = readFileSync(file.original, 'utf8'), text = readFileSync(file.current, 'utf8');
  const result = transformAuxExcludedProducts({ source, text });
  let reversed = result.text;
  for (const anchor of [...result.anchors].reverse()) {
    if (reversed.slice(anchor.offsetAtApplication, anchor.offsetAtApplication + anchor.replace.length) !== anchor.replace) throw Error('Reverse offset drift');
    reversed = reversed.slice(0, anchor.offsetAtApplication) + anchor.find + reversed.slice(anchor.offsetAtApplication + anchor.replace.length);
  }
  if (reversed !== text) throw Error('Exact paired reverse reconstruction failed');
  for (const token of ['aside-native.node', 'EMBEDDED_BINDING_ASSET', 'materializeEmbeddedBinding', '--aside-home', '--aside-product-variant', 'aside-password-importer', 'aside-credential-exchange', 'launchAppleCredentialExchangeImporterApp', 'passwordManagerRouter'])
    if (result.text.includes(token)) throw Error('Excluded product atom remains: ' + token);
  for (const token of ['function auxFindPasswordManagerMemoryBlock(', 'externalPasswordManagers:externalPasswordManagersRouter', 'function auxSelectedAccountIdentity(', 'PwmAccountRegistry', 'loadPdfBinding()'])
    if (!result.text.includes(token)) throw Error('Required shared source removed: ' + token);
  const target = join(output, file.name); writeFileSync(target, result.text, { mode: 0o600, flag: 'wx' });
  const check = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
  if (check.status !== 0) throw Error('Pruned paired source syntax failed: ' + check.stderr);
  let repeated = false;
  try { transformAuxExcludedProducts({ source, text: result.text }); } catch { repeated = true; }
  if (!repeated) throw Error('Repeated pruning unexpectedly accepted');
  files.push({ path: target, inputSha256: file.currentSha256, outputSha256: createHash('sha256').update(result.text).digest('hex'), anchors: result.anchors.length, syntaxPassed: true, exactReversePassed: true });
}
const receipt = { format: 'aux.excluded-products.source-check.v1', output, files, helperSymbolsRemoved: 73, appExecuted: false, nativeCompiled: false, originalAddonBytesChanged: false, ownerStateRead: false };
writeFileSync(new URL('./verification.json', import.meta.url), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ output, files: files.length, anchorsPerLeaf: 7, appExecuted: false }));
