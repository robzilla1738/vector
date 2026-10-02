import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseStartupLaunchReceipt } from '../host/lib/startup-launch-receipt.mjs';
const expected = {trial:'a'.repeat(32),kind:'aux',launcherPid:12,helperBinarySha256:'c'.repeat(64),helperSourceSha256:'d'.repeat(64)};
const sample = () => ({producer:'aux-native-startup-launch',version:1,...expected,browserPid:13,
  launchMachTicks:'9007199254740993',spawnReturnedMachTicks:'9007199254740994',nonce:'12345678-1234-1234-1234-123456789abc',sequence:'1'});
const line = record => 'AUX_STARTUP_LAUNCH_V1 '+JSON.stringify(Object.fromEntries(Object.keys(record).sort().map(key=>[key,record[key]])))+'\n';
test('retains exact original native integers above JavaScript safe range and original bytes', () => {
  const raw = line(sample()); const parsed = parseStartupLaunchReceipt(raw,expected);
  assert.equal(parsed.record.launchMachTicks,'9007199254740993'); assert.equal(parsed.raw,raw);
  assert.match(parsed.rawSha256,/^[a-f0-9]{64}$/); assert.equal(Object.hasOwn(parsed,'qualified'),false);
});
test('refuses fake/foreign channels, trial/helper/binary kind and coincident child identity', () => {
  for (const delta of [{trial:'b'.repeat(32)},{kind:'stock'},{launcherPid:14},{browserPid:12},
    {browserPid:1.5},{producer:'aux-native-performance'},{version:2},{requestedCold:true}])
    assert.throws(()=>parseStartupLaunchReceipt(line({...sample(),...delta}),expected));
  assert.throws(()=>parseStartupLaunchReceipt(line(sample())+line(sample()),expected));
  assert.throws(()=>parseStartupLaunchReceipt('browser output '+line(sample()),expected));
});
test('refuses rounded, overflow, absent and backward timestamps', () => {
  for (const delta of [{launchMachTicks:9007199254740992},{launchMachTicks:'01'},
    {launchMachTicks:'18446744073709551616'},{spawnReturnedMachTicks:'9007199254740992'},
    {launchMachTicks:null},{launchMachTicks:'0'}])
    assert.throws(()=>parseStartupLaunchReceipt(line({...sample(),...delta}),expected));
});

test('refuses unpaired build pins, reused/unknown sequence and noncanonical original bytes', () => {
  for (const delta of [{helperBinarySha256:'e'.repeat(64)},{helperSourceSha256:'e'.repeat(64)},
    {nonce:'00000000-0000-0000-0000-000000000000'},{nonce:1},{sequence:'2'},{sequence:1}])
    assert.throws(()=>parseStartupLaunchReceipt(line({...sample(),...delta}),expected));
  for (const raw of [line(sample()).replace('"version":1','"version":1,"version":1'),
    line(sample()).replace('"version":1','"version":1.0'), line(sample()).replace('{','{ '),
    line(sample()).slice(0,-1), line(sample())+'\r', line(sample()).replace('"trial"','"\\u0074rial"')])
    assert.throws(()=>parseStartupLaunchReceipt(raw,expected));
  const parsed = parseStartupLaunchReceipt(line(sample()),expected);
  assert.equal(parsed.receiptBytes, line(sample()).slice('AUX_STARTUP_LAUNCH_V1 '.length,-1));
  assert.match(parsed.receiptSha256,/^[a-f0-9]{64}$/);
});
