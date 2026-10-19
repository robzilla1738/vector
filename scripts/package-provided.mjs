#!/usr/bin/env node
import { resolve } from 'node:path';
import { packageProvidedApp } from './lib/provided-package.mjs';
const names = { '--stage': 'stageRoot', '--native-receipt': 'nativeReceiptPath', '--composition': 'compositionRoot', '--boundary-receipt': 'boundaryReceiptPath', '--output': 'outputRoot' };
const options = {};
for (let index = 2; index < process.argv.length; index++) {
  const flag = process.argv[index], key = names[flag], value = process.argv[++index];
  if (!key || options[key] || !value || value.startsWith('--')) throw new Error('Usage: package-provided.mjs --stage PATH --native-receipt FILE --composition PATH --boundary-receipt FILE --output NEW_DIRECTORY');
  options[key] = resolve(value);
}
if (Object.values(names).some(key => !options[key])) throw new Error('All five package inputs are required');
const report = await packageProvidedApp(options);
console.log(`Assembled ${report.suppliedResources} supplied resources and ${report.nativeFiles} native leaves into ${options.outputRoot}/Aux.app`);
console.log('Unsigned candidate only; native loading, signing and packaged acceptance remain required.');
