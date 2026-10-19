'use strict';
// SEA early exit only: no product startup, native commands or PDF actions.
const fs = require('node:fs/promises');
const path = require('node:path');
module.exports = async function diagnoseSuppliedSea() {
  if (process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY !== '1' || process.env.AUX_ENABLE_PROVIDED_NATIVE_CARRIER) throw new Error('Dedicated load-only process required');
  const home = await fs.realpath(process.env.AUX_HOME);
  const metadata = await fs.lstat(home);
  if (!metadata.isDirectory() || metadata.uid !== process.getuid() || (metadata.mode & 0o7777) !== 0o700) throw new Error('Private diagnostic home required');
  const directory = await fs.realpath(__dirname);
  const otherHome = await fs.mkdtemp(path.join(home, '.aux-native-other-scope-'));
  let result;
  try { result = await require('./native-load-only-probe.cjs')(directory, otherHome); }
  finally { await fs.rm(otherHome, { recursive: true, force: true }); }
  result.host = 'supplied-sea';
  result.productMainStarted = false;
  result.dpRuntimeAccepted = false;
  await new Promise((resolve, reject) => process.stdout.write(`${JSON.stringify(result)}\n`, (e) => e ? reject(e) : resolve()));
  process.exit(0);
};
