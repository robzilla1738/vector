import assert from 'node:assert/strict';

const token = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const reference = value => typeof value === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(value) &&
  value.length <= 1368 && Buffer.from(value, 'base64').toString('base64') === value && Buffer.from(value, 'base64').length > 0;
const sameOwner = (left, right) => ['grant', 'profile', 'host', 'generation'].every(key => left[key] === right[key]);
const keys = (value, expected) => {
  assert.ok(value && Object.getPrototypeOf(value) === Object.prototype, 'Invalid original credential channel record');
  assert.deepEqual(Object.keys(value).sort(), expected.slice().sort(), 'Unexpected credential channel field');
};

/** Internal guardian state only. Its factory must be joined to the original App
 * pair/FD channel; this module neither admits a pair nor invokes Security.
 * The supplied fixed backend must never read secret data or select another item.
 * Every asynchronous backend operation retains the original invocation/debt.
 */
export class DisposableModelCredentialDebt {
  #owner;
  #current;
  #backend;
  #witness;
  #reference;
  #state = 'unarmed';
  #pending;
  #retired = false;
  #debt = false;
  constructor(original, currentOriginal, fixedBackend) {
    keys(original, ['grant', 'profile', 'host', 'generation']);
    assert.ok(token(original.grant) && token(original.profile) && token(original.host) &&
      Number.isSafeInteger(original.generation) && original.generation > 0, 'Invalid original guardian identity');
    assert.equal(typeof currentOriginal, 'function');
    assert.equal(typeof fixedBackend.observeFixedOriginal, 'function');
    assert.equal(typeof fixedBackend.removeFixedOriginal, 'function');
    this.#owner = Object.freeze({ ...original });
    this.#current = currentOriginal;
    this.#backend = fixedBackend;
  }
  #live() {
    if (this.#retired) return false;
    const originalCheck = this.#current;
    const current = originalCheck();
    if (!current) this.#retired = true;
    return !this.#retired;
  }
  #record(record, extra) {
    keys(record, ['grant', 'profile', 'host', 'generation', ...extra]);
    assert.ok(sameOwner(record, this.#owner), 'Foreign original credential channel owner');
  }
  get receipt() {
    return Object.freeze({ ...this.#owner, state: this.#state, cleanupDebt: this.#debt,
      pending: !!this.#pending, retired: this.#retired });
  }
  async arm(record) {
    this.#record(record, []);
    assert.ok(this.#live() && this.#state === 'unarmed' && !this.#pending, 'Original credential grant unavailable');
    const invocation = {};
    this.#pending = invocation;
    const backend = this.#backend;
    try {
      const observed = await backend.observeFixedOriginal();
      assert.ok(this.#pending === invocation && this.#live(), 'Original credential grant retired during absence check');
      assert.equal(observed.kind, 'absent', 'Original fixed credential is not absent');
      this.#state = 'absent';
      return this.receipt;
    } finally { if (this.#pending === invocation) this.#pending = undefined; }
  }
  // The browser must await this exact acknowledgment before atomic SecItemAdd.
  retainWriteIntent(record) {
    this.#record(record, ['creationWitness']);
    assert.ok(this.#live() && this.#state === 'absent' && !this.#pending && token(record.creationWitness),
      'Original credential write intent refused');
    this.#witness = record.creationWitness;
    this.#debt = true;
    this.#state = 'write-pending';
    return this.receipt;
  }
  retainSavedReference(record) {
    this.#record(record, ['creationWitness', 'persistentReference']);
    assert.ok(this.#live() && this.#state === 'write-pending' && this.#debt &&
      record.creationWitness === this.#witness && reference(record.persistentReference),
      'Foreign or missing original saved item reference');
    this.#reference = record.persistentReference;
    this.#state = 'saved';
    return this.receipt;
  }
  browserRetired(record) {
    this.#record(record, []);
    // Browser retirement closes acquisition; original guardian ownership and
    // retained Profile/item evidence remain mandatory for cleanup.
    if (this.#state === 'write-pending' || this.#state === 'saved') this.#state = 'cleanup';
    else if (!this.#debt) this.#state = 'retired';
    return this.receipt;
  }
  cleanup() {
    assert.ok(!this.#pending && this.#debt && this.#state === 'cleanup' && this.#live(),
      'Original credential cleanup unavailable');
    const invocation = {};
    this.#pending = invocation;
    const backend = this.#backend;
    const witness = this.#witness;
    const originalReference = this.#reference;
    const operation = (async () => {
      const item = await backend.observeFixedOriginal();
      assert.ok(this.#pending === invocation && this.#live(), 'Original guardian retired during cleanup observation');
      if (item.kind !== 'absent') {
        assert.equal(item.kind, 'original', 'Foreign or unavailable credential cleanup item');
        assert.equal(item.creationWitness, witness, 'Original creation witness changed');
        assert.ok(reference(item.persistentReference), 'Missing actual original item reference');
        if (originalReference !== undefined) assert.equal(item.persistentReference, originalReference, 'Original item reference replaced');
        const retainedReference = item.persistentReference;
        await backend.removeFixedOriginal(Object.freeze({ creationWitness: witness, persistentReference: retainedReference }));
        assert.ok(this.#pending === invocation && this.#live(), 'Original guardian retired during removal');
        const after = await backend.observeFixedOriginal();
        assert.ok(this.#pending === invocation && this.#live(), 'Original guardian retired during absence readback');
        assert.equal(after.kind, 'absent', 'Original fixed item removal not confirmed');
      }
      this.#debt = false;
      this.#state = 'removed';
      return this.receipt;
    })();
    return operation.finally(() => { if (this.#pending === invocation) this.#pending = undefined; });
  }
}
