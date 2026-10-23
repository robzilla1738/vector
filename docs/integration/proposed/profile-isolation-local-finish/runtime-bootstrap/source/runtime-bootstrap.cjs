'use strict';
const fs = require('node:fs/promises');
const { constants } = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { seedBundledRuntime } = require('./runtime-seed.cjs');
async function readRegular(p) {
  const h = await fs.open(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const s = await h.stat();
    if (!s.isFile() || (s.mode & 0o022) || s.size > 8 * 1024 * 1024) throw new Error('Unsafe bundled runtime metadata');
    return await h.readFile();
  } finally { await h.close(); }
}
function captureNativeRuntime() {
  const binding=process._linkedBinding('aux_owned_native');
  const functions={};
  for(const name of ['captureStorageRoots','withBrokerAwaited']) {
    const d=Object.getOwnPropertyDescriptor(binding,name);
    if(!d||!Object.hasOwn(d,'value')||typeof d.value!=='function'||d.writable||d.configurable)throw Error('Native runtime authority unavailable');
    functions[name]=d.value.bind(binding);
  }
  const roots=functions.captureStorageRoots();
  const keys=['format','layoutVersion','ownerGeneration','transportGeneration','controlHome','taskHome'];
  if(!roots||!Object.isFrozen(roots)||Object.keys(roots).sort().join('\0')!==keys.sort().join('\0')||roots.format!=='aux.native.storage-roots.v1'||roots.layoutVersion!==1)throw Error('Invalid native runtime roots');
  for(const key of ['ownerGeneration','transportGeneration'])if(typeof roots[key]!=='string'||!(/^[1-9][0-9]{0,19}$/).test(roots[key]))throw Error('Invalid runtime generation');
  for(const key of ['controlHome','taskHome'])if(typeof roots[key]!=='string'||!path.isAbsolute(roots[key])||roots[key].includes('\0')||path.resolve(roots[key])!==roots[key]||roots[key]==='/')throw Error('Invalid runtime root');
  if(roots.controlHome===roots.taskHome||roots.controlHome.startsWith(roots.taskHome+path.sep)||roots.taskHome.startsWith(roots.controlHome+path.sep))throw Error('Overlapping native roots');
  return {roots,functions,keys};
}
let active,activeRoots;
module.exports = function provisionBundledRuntime(destination) {
  const authority=captureNativeRuntime(),home=authority.roots.taskHome;
  if(typeof destination!=='string'||destination!==path.join(home,'runtime'))throw Error('Runtime destination must match native task home');
  if(active){if(authority.keys.some(key=>activeRoots[key]!==authority.roots[key]))throw Error('Runtime owner changed');return active}
  activeRoots=authority.roots;
  active = authority.functions.withBrokerAwaited(async () => {
    const directory = await fs.realpath(__dirname), root = path.resolve(directory, '../../../../../..');
    if (directory !== path.join(root, 'apps/daemon/Aux Daemon.app/Contents/Resources/native')) throw new Error('Unexpected runtime bootstrap bundle layout');
    if(await fs.realpath(home)!==home)throw Error('Native task home must be canonical');
    const bytes = await readRegular(path.join(directory, 'runtime-source-pins.json'));
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== '7fa5c41acab7c3e9c052bf44b9daa4c0892e717f70718ca9f6a65b030e13bba8') throw new Error('Runtime source inventory mismatch');
    const reportBytes=await readRegular(path.join(directory,'runtime-text-root.json'));
    if(crypto.createHash('sha256').update(reportBytes).digest('hex')!=='225e0eb0faad6e021a6ed181d6b07a262e6ec43a053a6103c804b3aae2d27be6')throw Error('Runtime text-root metadata mismatch');
    const report=JSON.parse(reportBytes);
    if(report.format!=='aux.runtime-text-root.v1')throw Error('Runtime text-root metadata format');
    if (typeof report.runtimeRoot !== 'string' || !path.isAbsolute(report.runtimeRoot) || !report.runtimeRoot.endsWith('/Contents/Resources/aux/agent-runtime')) throw new Error('Invalid bundled runtime text relocation root');
    const pins = JSON.parse(bytes);
    if (pins.sourceVersion !== '1.26.1019.335' || pins.files.length !== 10929 || pins.files.filter((e) => e.anchors?.length).length !== 9) throw new Error('Unexpected supplied runtime inventory');
    const current=authority.functions.captureStorageRoots();
    if(authority.keys.some(key=>current[key]!==authority.roots[key]))throw Error('Native runtime owner changed before seeding');
    return seedBundledRuntime({ source: path.join(root, 'agent-runtime'), home, bundleRuntimeRoot: report.runtimeRoot, pins });
  });
  const operation=active;operation.then(()=>{if(active===operation){active=undefined;activeRoots=undefined}},()=>{if(active===operation){active=undefined;activeRoots=undefined}});
  return operation;
};
