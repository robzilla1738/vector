/** Explicit offline preparation + durable journal handoff. No discovery, app
 * launch, native/Keychain operations or inferred startup acceptance.
 */
import { createHash } from 'node:crypto';
import { prepareAuxProviderJsonFile, classifyAuxProviderJsonPath } from './aux-provider-json-files.mjs';
import { migrateAuxPreferenceDocument } from './aux-preference-identity.mjs';
import { checkpointPrivateSqliteSnapshot } from './aux-sqlite-wal-copy.mjs';
import { prepareSqliteProviderIdentity } from './aux-sqlite-provider-identity.mjs';
import { prepareStateMigration } from './aux-state-migration-transaction.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function prefix(value) {
  if (typeof value !== 'string' || value.split('/').some(part => !/^[A-Za-z0-9_. -]+$/.test(part) || ['.', '..'].includes(part) || part.endsWith(' ') || part.endsWith('.') || part.startsWith('.aux-'))) throw Error('Explicit safe disposable state prefixes required');
  return value;
}
function snapshot(value, kind, maximum = 16 * 1024 * 1024) {
  if (!value || !(value.bytes instanceof Uint8Array) || value.bytes.length > maximum || !/^[a-f0-9]{64}$/.test(value.expectedSha256) || sha(value.bytes) !== value.expectedSha256) throw Error(`Invalid or changed ${kind} snapshot`);
  return Buffer.from(value.bytes);
}
function prefJson(bytes) {
  let text, value;
  try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); value = JSON.parse(text); }
  catch { throw Error('Invalid native preference JSON snapshot'); }
  if (text.charCodeAt(0) === 0xFEFF) throw Error('Unsupported native preference JSON BOM');
  const stack = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      let end = index + 1;
      for (; end < text.length; end++) { if (text[end] === '\\') { end++; continue; } if (text[end] === '"') break; }
      const current = stack.at(-1);
      if (current?.object && current.key) {
        const key = JSON.parse(text.slice(index, end + 1));
        if (current.keys.has(key)) throw Error('Ambiguous duplicate native preference JSON member');
        current.keys.add(key); current.key = false;
      }
      index = end;
    } else if (char === '{') stack.push({ object: true, key: true, keys: new Set() });
    else if (char === '[') stack.push({ object: false });
    else if (char === '}' || char === ']') stack.pop();
    else if (char === ',' && stack.at(-1)?.object) stack.at(-1).key = true;
  }
  return value;
}
async function scope(capability, root, transactionId, hashes, phase) {
  if (!capability || capability.root !== root || capability.disposable !== true || capability.exclusive !== true || capability.rollbackJournalAbsent !== true || typeof capability.assertStopped !== 'function' || await capability.assertStopped({ root, transactionId, snapshotHashes: hashes, phase }) !== true) throw Error('Real stopped-exclusive disposable handoff scope required');
}

/** JSON descriptors:
 * {kind:'provider-json',logicalPath:'u/1/settings.json',bytes,expectedSha256}
 * {kind:'profile-preferences',profileDirectory:'Default',bytes,expectedSha256}
 * {kind:'local-state',bytes,expectedSha256}
 * SQLite descriptors: {accountId,database,wal,shm,rollbackJournal:'absent'};
 * database={bytes,expectedSha256}; wal/shm also require disposition:'present',
 * replacement:'empty-reviewed'. Missing/unknown sidecars are never inferred.
 */
export async function prepareAuxDisposableStateHandoff({ root, capability, transactionId, paths, jsonSnapshots = [], sqliteSnapshots = [], onCheckpoint }) {
  const home = prefix(paths?.auxHome), browser = prefix(paths?.browserUserData);
  if (home.toLowerCase() === browser.toLowerCase() || home.toLowerCase().startsWith(browser.toLowerCase() + '/') || browser.toLowerCase().startsWith(home.toLowerCase() + '/')) throw Error('Disposable state roots must be distinct and nonoverlapping');
  if (!Array.isArray(jsonSnapshots) || !Array.isArray(sqliteSnapshots) || jsonSnapshots.length + sqliteSnapshots.length < 1 || jsonSnapshots.length + sqliteSnapshots.length * 3 > 128) throw Error('Explicit bounded handoff snapshot list required');
  const sources = [], jsonPlans = [], databasePlans = [], buffers = [], names = new Set(); let inputBytes = 0;
  function add(path, bytes, expectedSha256, kind) {
    inputBytes += bytes.length;
    if (inputBytes > 128 * 1024 * 1024) throw Error('Disposable handoff snapshot budget exceeded');
    if (names.has(path.toLowerCase())) throw Error('Duplicate disposable handoff target');
    names.add(path.toLowerCase()); sources.push({ path, sourceSha256: expectedSha256, kind }); buffers.push(bytes);
  }
  try {
    for (const input of jsonSnapshots) {
      const before = snapshot(input, 'JSON'); let target;
      if (input.kind === 'provider-json') { classifyAuxProviderJsonPath(input.logicalPath); target = `${home}/${input.logicalPath}`; }
      else if (input.kind === 'local-state') target = `${browser}/Local State`;
      else if (input.kind === 'profile-preferences' && /^(Default|Profile [1-9][0-9]*)$/.test(input.profileDirectory)) target = `${browser}/${input.profileDirectory}/Preferences`;
      else throw Error('Unknown native/provider JSON handoff descriptor');
      add(target, before, input.expectedSha256, input.kind); jsonPlans.push({ input, target, before });
    }
    for (const input of sqliteSnapshots) {
      if (!Number.isSafeInteger(input.accountId) || input.accountId < 0 || input.rollbackJournal !== 'absent' || [input.wal, input.shm].some(sidecar => sidecar?.disposition !== 'present' || sidecar.replacement !== 'empty-reviewed')) throw Error('Existing reviewed WAL/SHM and absent rollback-journal disposition required');
      const database = snapshot(input.database, 'database', 64 * 1024 * 1024), wal = snapshot(input.wal, 'WAL', 64 * 1024 * 1024), shm = snapshot(input.shm, 'SHM', 4 * 1024 * 1024);
      if (shm.length && shm.length % 32768) throw Error('Unsupported SQLite SHM snapshot length');
      const target = `${home}/u/${input.accountId}/state.db`;
      add(target, database, input.database.expectedSha256, 'sqlite-main');
      add(`${target}-wal`, wal, input.wal.expectedSha256, 'sqlite-wal-reviewed-empty');
      add(`${target}-shm`, shm, input.shm.expectedSha256, 'sqlite-shm-reviewed-empty');
      databasePlans.push({ input, target, database, wal, shm });
    }
    await scope(capability, root, transactionId, sources, 'handoff-snapshots-validated');
    const files = [], transformations = [];
    for (const plan of jsonPlans) {
      let after, detail;
      if (plan.input.kind === 'provider-json') {
        const prepared = prepareAuxProviderJsonFile({ path: plan.input.logicalPath, bytes: plan.before });
        after = prepared.after;
        detail = { format: 'aux.provider-json.v2', kind: prepared.kind, accountId: prepared.accountId, changed: prepared.changed };
        prepared.before.fill(0);
      } else {
        const prepared = migrateAuxPreferenceDocument(prefJson(plan.before), { scope: plan.input.kind === 'local-state' ? 'local-state' : 'profile' });
        after = prepared.receipt.changed ? Buffer.from(JSON.stringify(prepared.preferences, null, 2) + '\n') : Buffer.from(plan.before);
        detail = prepared.receipt;
      }
      buffers.push(after); files.push({ path: plan.target, expectedSha256: sha(plan.before), bytes: after });
      transformations.push({ path: plan.target, ...detail });
    }
    for (const plan of databasePlans) {
      const derivedCapability = { ...capability, assertStopped: async ({ phase }) => { await scope(capability, root, transactionId, sources, `handoff-${phase}`); return true; } };
      const checkpointed = await checkpointPrivateSqliteSnapshot({ databaseBytes: plan.database, expectedSha256: sha(plan.database), walBytes: plan.wal, expectedWalSha256: sha(plan.wal), rollbackJournalBytes: null, capability: derivedCapability });
      buffers.push(checkpointed.bytes);
      const migrated = await prepareSqliteProviderIdentity({ databaseBytes: checkpointed.bytes, expectedSha256: checkpointed.receipt.outputSha256, walBytes: null, capability: derivedCapability });
      buffers.push(migrated.bytes);
      files.push({ path: plan.target, expectedSha256: sha(plan.database), bytes: migrated.bytes });
      files.push({ path: `${plan.target}-wal`, expectedSha256: sha(plan.wal), bytes: Buffer.alloc(0) });
      files.push({ path: `${plan.target}-shm`, expectedSha256: sha(plan.shm), bytes: Buffer.alloc(0) });
      transformations.push({ path: plan.target, checkpoint: checkpointed.receipt, providerMigration: migrated.receipt, sidecars: { wal: 'reviewed-empty-replacement', shm: 'reviewed-empty-replacement', originalBackupsRequired: true } });
    }
    await scope(capability, root, transactionId, sources, 'handoff-before-journal');
    const forwarded = { ...capability, assertStopped: context => capability.assertStopped({ ...context, snapshotHashes: sources }) };
    const handle = await prepareStateMigration({ root, capability: forwarded, transactionId, files, onCheckpoint });
    const preparedFiles = files.map(file => ({ path: file.path, beforeSha256: file.expectedSha256, afterSha256: sha(file.bytes) }));
    return {
      ...handle,
      receipt: { format: 'aux.disposable-state-handoff.v1', status: 'prepared-not-committed', transactionId, sourceSnapshots: sources, preparedFiles, preparedSetSha256: sha(JSON.stringify(preparedFiles)), transformations, startupVerified: false, remaining: ['real stopped-writer/startup fence integration', 'renderer storage acknowledgement', 'queued/transcript provider reference audit', 'actual app restart acceptance'] },
    };
  } finally { for (const bytes of buffers) bytes.fill(0); }
}
