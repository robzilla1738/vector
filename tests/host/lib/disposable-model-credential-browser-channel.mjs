import assert from 'node:assert/strict';
import { awaitOriginalCredentialClose } from './disposable-model-credential-lifetime.mjs';
import { randomBytes } from 'node:crypto';

const hex = value => /^[a-f0-9]{64}$/.test(value);
/** Private App-side relay. The native child receives no credential or generic
 * operation API: one fixed acquisition, original witness and actual item ref.
 * Joining this relay requires App's original admitted pair/FD capability.
 */
export function bindOriginalCredentialBrowser({ child, guardian, currentOriginal, deadline }) {
  assert.ok(child && Number.isInteger(child.pid) && child.pid > 0);
  assert.ok(guardian && typeof guardian.arm === 'function' && typeof currentOriginal === 'function');
  assert.ok(Number.isFinite(deadline) && performance.now() < deadline);
  assert.ok(/^[1-9][0-9]*$/.test(guardian.acquiredMach) && BigInt(guardian.acquiredMach) <= 18446744073709551615n);
  assert.ok(hex(guardian.reservation) && /^http:\/\/127\.0\.0\.1:[1-9][0-9]*\/v1$/.test(guardian.endpoint));
  const endpointBytes = Buffer.from(guardian.endpoint).toString('base64');
  const originalReservation = guardian.reservation;
  const originalPid = child.pid, channel = child.stdio[3], nonce = randomBytes(32).toString('hex');
  assert.ok(channel && typeof channel.write === 'function');
  let retired = false, closed = false, buffered = '', pending, host, consumed = false, originalWitness, saved = false;
  const records = [];
  let closeResolve;
  const originalClose = new Promise(resolve => { closeResolve = resolve; });
  const live = () => {
    if (retired || closed) return false;
    try { if (!currentOriginal() || child.pid !== originalPid || performance.now() >= deadline) retired = true; }
    catch { retired = true; }
    return !retired;
  };
  const send = line => {
    assert.ok(live() && Buffer.byteLength(line) <= 4096 && !line.includes('\n'));
    channel.write(line + '\n');
  };
  const refuse = error => { retired = true; records.push(Object.freeze({ status: 'refused', reason: error })); };
  child.once('error', refuse);
  child.once('close', (code, signal) => {
    closed = true; retired = true;
    closeResolve(Object.freeze({ originalPid, code, signal, pending: !!pending, acquisitionConsumed: consumed }));
  });
  channel.on('error', refuse);
  channel.on('data', bytes => {
    buffered += bytes.toString('utf8');
    if (Buffer.byteLength(buffered) > 8192) { refuse(new Error('Original credential browser channel overflow')); return; }
    while (buffered.includes('\n')) {
      const end = buffered.indexOf('\n'), raw = buffered.slice(0, end); buffered = buffered.slice(end + 1);
      try {
        assert.ok(live() && !pending && Buffer.byteLength(raw) <= 4096);
        const fields = raw.split('|');
        assert.equal(fields[1], nonce);
        assert.ok(/^[A-F0-9]{32}$/.test(fields[2]) && /^[1-9][0-9]*$/.test(fields[3]));
        const generation = Number(fields[3]); assert.ok(Number.isSafeInteger(generation));
        const identity = fields[2] + '|' + fields[3];
        if (host) assert.equal(identity, host); else host = identity;
        let work;
        if (fields[0] === 'ACQUIRE' && fields.length === 7) {
          assert.ok(!consumed && ['tmp', 'private-tmp'].includes(fields[4]));
          assert.equal(fields[5], originalReservation); assert.equal(fields[6], endpointBytes); consumed = true;
          const witness = randomBytes(32).toString('hex'); originalWitness = witness;
          // Guardian holds absence and intent BEFORE browser receives witness.
          work = (async () => {
            await guardian.bindOriginalProfileAlias(fields[4]); assert.ok(live());
            await guardian.arm(); assert.ok(live());
            await guardian.retainIntent(witness); assert.ok(live());
            send(`INTENT|${nonce}|${identity}|${witness}`);
          })();
        } else if (fields[0] === 'SAVED' && fields.length === 6) {
          assert.ok(consumed && !saved && hex(fields[4]) && fields[4] === originalWitness); saved = true;
          work = (async () => {
            await guardian.retainSaved(fields[4], fields[5]); assert.ok(live());
            send(`RETAINED|${nonce}|${identity}`);
          })();
        } else assert.fail('Unknown fixed credential browser operation');
        const original = work; pending = original;
        work.then(() => { if (pending === original) pending = undefined; }, refuse);
        records.push(Object.freeze({ raw, status: fields[0], originalPid, host: identity }));
      } catch (error) { refuse(error); }
    }
  });
  // Original child transport/peer PID supplies identity; nonce is never argv,
  // environment, WebUI, public RPC or an appearance flag.
  send(`GRANT|${nonce}|${originalPid}|${guardian.acquiredMach}|${originalReservation}|${endpointBytes}`);
  return Object.freeze({ originalPid, originalClose,
    get receipt() { return Object.freeze({ retired, closed, pending: !!pending, acquisitionConsumed: consumed, records: records.slice() }); },
    async retireAfterOriginalClose() {
      const proof = await awaitOriginalCredentialClose(originalClose, deadline);
      assert.ok(closed && child.pid === originalPid);
      // Even unresolved Add/ACK remains guardian-owned intent cleanup debt.
      await guardian.retireOriginalBrowser();
      if (guardian.receipt.cleanupDebt) await guardian.cleanup();
      const final = await guardian.finish();
      const helperClose = await awaitOriginalCredentialClose(guardian.originalClose, deadline);
      assert.ok(final.status === 'FINAL' && helperClose.helperPid === guardian.helperPid &&
        helperClose.code === 0 && helperClose.signal === null && helperClose.completed && !helperClose.cleanupDebt);
      return Object.freeze({ browser: proof, guardian: Object.freeze({ record: final, close: helperClose, completed: true }) });
    },
  });
}
