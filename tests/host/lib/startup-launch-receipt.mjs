import { createHash } from 'node:crypto';
const prefix = 'AUX_STARTUP_LAUNCH_V1 ';
const fields = ['producer', 'version', 'kind', 'trial', 'launcherPid', 'browserPid',
  'launchMachTicks', 'spawnReturnedMachTicks', 'helperBinarySha256', 'helperSourceSha256', 'nonce', 'sequence'].sort();
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const uint64 = value => {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,19}$/.test(value) || BigInt(value) > 18446744073709551615n)
    throw new Error('Invalid raw native Mach timestamp');
  return BigInt(value);
};
/** Original dedicated helper stdout only. Native admission independently checks
 * the same fixed-file bytes, live parent PID/image/kernel identity and pins.
 * Parsing does not qualify a launch or grant browser authority. */
export function parseStartupLaunchReceipt(raw, expected) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw) > 2048 || !raw.startsWith(prefix) ||
      !raw.endsWith('\n') || raw.slice(0, -1).includes('\n') ||
      !/^[a-f0-9]{32}$/.test(expected.trial) || !['aux', 'stock'].includes(expected.kind) ||
      !Number.isSafeInteger(expected.launcherPid) || expected.launcherPid <= 0 ||
      !hash(expected.helperBinarySha256) || !hash(expected.helperSourceSha256))
    throw new Error('Invalid native startup receipt channel');
  const bytes = raw.slice(prefix.length, -1);
  const record = JSON.parse(bytes);
  if (!record || typeof record !== 'object' || Array.isArray(record) ||
      JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(fields) ||
      JSON.stringify(Object.fromEntries(fields.map(key => [key, record[key]]))) !== bytes ||
      record.producer !== 'aux-native-startup-launch' || record.version !== 1 ||
      record.kind !== expected.kind || record.trial !== expected.trial ||
      record.helperBinarySha256 !== expected.helperBinarySha256 ||
      record.helperSourceSha256 !== expected.helperSourceSha256 ||
      record.sequence !== '1' || typeof record.nonce !== 'string' ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(record.nonce) ||
      record.nonce === '00000000-0000-0000-0000-000000000000' ||
      record.launcherPid !== expected.launcherPid || !Number.isSafeInteger(record.browserPid) ||
      record.browserPid <= 0 || record.browserPid === record.launcherPid ||
      uint64(record.spawnReturnedMachTicks) < uint64(record.launchMachTicks))
    throw new Error('Unpaired or invalid native startup launch');
  return { record, rawSha256: createHash('sha256').update(raw).digest('hex'),
    receiptSha256: createHash('sha256').update(bytes).digest('hex'), receiptBytes: bytes, raw };
}
