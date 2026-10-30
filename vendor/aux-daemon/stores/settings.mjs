/** The account settings store: settings.json under the account root, validated by the supplied
 * settings schema, one store per account. A file that fails the schema is kept as last read, and
 * healed on the next write with a warning. Writes go through the supplied JSON file backend (its
 * lock file, atomic write and corrupt-file recovery), so the file format and locking are unchanged. */

/** A shallow copy, as the supplied store hands out: callers may change it without touching the store. */
function shallowCopy(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0);
  return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
}

class SettingsStore {
  constructor(storage, {schema, defaults}) {
    this.storage = storage;
    this.schema = schema;
    this.defaults = defaults;
    this.data = shallowCopy(defaults);
    this.reload();
  }

  reload() {
    this.data = this.storage.withLock(raw => {
      const parsed = this.schema.safeParse(raw);
      if (parsed.success) return {result: parsed.data};
      console.error('[Settings] invalid settings file', {issues: parsed.error.issues});
      return {result: this.data};
    });
  }

  getAll() {
    return shallowCopy(this.data);
  }

  get(key) {
    return shallowCopy(this.data[key] ?? this.defaults[key]);
  }

  /** `update` gets a copy of the key's current value and returns its new value. */
  set(key, update) {
    return this.storage.withLock(raw => {
      const parsed = this.schema.safeParse(raw), current = parsed.success ? parsed.data : this.data, warnings = [];
      if (!parsed.success) {
        console.error('[Settings] invalid settings file; healing on write', {issues: parsed.error.issues});
        warnings.push('Your settings file was invalid and has been repaired.');
      } else {
        const dropped = (Array.isArray(raw.customModels) ? raw.customModels.length : 0) - current.customModels.length;
        if (dropped > 0) warnings.push(`Removed ${dropped} invalid custom model(s) from your settings.`);
      }
      const next = this.schema.parse({...current, [key]: update(shallowCopy(current[key]))});
      this.data = next;
      return {result: {settings: next, warnings}, next};
    });
  }
}

/** `settings(accountId)`: the account's store, cached in the supplied cache (which `settings.use`
 * also writes). Changing `experimental` asks the agent file sync to reconcile. */
export function create({stores: {settings: s}}) {
  return accountId => {
    const cached = s.settingsCache.get(accountId);
    if (cached) return cached;
    const store = new SettingsStore(new s.FileJsonStoreBackend(s.getSettingsJsonPath(accountId), s.defaults), {schema: s.schema, defaults: s.defaults});
    const set = store.set.bind(store);
    store.set = (key, update) => {
      const result = set(key, update);
      if (key === 'experimental') s.notifyAgentFileChange(accountId, 'reconcile');
      return result;
    };
    s.settingsCache.set(accountId, store);
    return store;
  };
}
