#!/usr/bin/env node
import { resolve } from 'node:path';
import { packageProvidedApp } from './lib/provided-package.mjs';
const names = { '--stage': 'stageRoot', '--native-receipt': 'nativeReceiptPath', '--composition': 'compositionRoot', '--boundary-receipt': 'boundaryReceiptPath', '--output': 'outputRoot', '--source-snapshot': 'sourceSnapshotRoot', '--native-main-receipt': 'nativeMainReceiptPath', '--native-pty-receipt': 'nativePtyReceiptPath', '--provider-native-receipt': 'providerNativeReceiptPath', '--final-local-native-receipt': 'finalLocalNativeReceiptPath' };
const options = {};
for (let index = 2; index < process.argv.length; index++) {
  if (process.argv[index] === '--development-dp-layout') {
    if (options.developmentDpLayout) throw new Error('Duplicate development layout flag');
    options.developmentDpLayout = true;
    continue;
  }
  const flag = process.argv[index], key = names[flag], value = process.argv[++index];
  if (!key || options[key] || !value || value.startsWith('--')) throw new Error('Usage: package-provided.mjs --stage PATH --native-receipt FILE --composition PATH --boundary-receipt FILE --output NEW_DIRECTORY [--source-snapshot ROOT] [--native-main-receipt FILE | --native-pty-receipt FILE | --provider-native-receipt FILE | --final-local-native-receipt FILE]');
  options[key] = resolve(value);
}
if (['stageRoot', 'nativeReceiptPath', 'compositionRoot', 'boundaryReceiptPath', 'outputRoot'].some(key => !options[key])) throw new Error('All five package inputs are required');
const report = await packageProvidedApp(options);
console.log(`Assembled ${report.suppliedResources} supplied resources and ${report.nativeFiles} native leaves into ${options.outputRoot}/Aux.app`);
console.log('Local development candidate; native loading and packaged UI/behavior acceptance remain unverified.');
