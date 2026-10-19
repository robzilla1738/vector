import { randomUUID } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type {
  Account,
  AccountRegistry,
  ProfileBinding,
  ProfileContext,
} from '@aux/contracts';
import { TRPCError } from '@trpc/server';
export function atomicJson(path: string, value: unknown) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2), {
    mode: 0o600,
    flag: 'wx',
  });
  renameSync(temporary, path);
  chmodSync(path, 0o600);
}
export class Store {
  readonly db: DatabaseSync;
  private deletionHandlers = new Set<
    (accountId: number) => Promise<void> | void
  >();
  registerAccountDeletionHandler(
    handler: (accountId: number) => Promise<void> | void,
  ) {
    this.deletionHandlers.add(handler);
    return () => this.deletionHandlers.delete(handler);
  }
  constructor(readonly home: string) {
    mkdirSync(home, { recursive: true, mode: 0o700 });
    chmodSync(home, 0o700);
    for (const name of ['', 'registry.db']) {
      const path = join(home, name);
      if (existsSync(path) && lstatSync(path).isSymbolicLink())
        throw new Error('FORBIDDEN');
    }
    this.db = new DatabaseSync(join(home, 'registry.db'));
    chmodSync(join(home, 'registry.db'), 0o600);
    this.db.exec(
      'PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS bindings (profileId TEXT PRIMARY KEY,data TEXT NOT NULL)',
    );
    if (!this.accounts().length) this.add('Local account', 'local');
    this.mirror();
  }
  accounts(): Account[] {
    return (
      this.db.prepare('SELECT data FROM accounts ORDER BY id').all() as {
        data: string;
      }[]
    ).map((r) => JSON.parse(r.data));
  }
  account(id: number): Account | undefined {
    const row = this.db
      .prepare('SELECT data FROM accounts WHERE id=?')
      .get(id) as { data: string } | undefined;
    return row ? JSON.parse(row.data) : undefined;
  }
  requireAccount(id: number) {
    const account = this.account(id);
    if (!account)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });
    return account;
  }
  current() {
    const row = this.db
      .prepare("SELECT value FROM metadata WHERE key='currentAccountId'")
      .get() as { value: string } | undefined;
    const first = this.accounts()[0];
    if (!row && !first) throw new Error('Account registry is empty');
    return row ? Number(row.value) : (first as Account).id;
  }
  setCurrent(id: number) {
    this.requireAccount(id);
    this.db
      .prepare("INSERT OR REPLACE INTO metadata VALUES ('currentAccountId',?)")
      .run(String(id));
    this.mirror();
    return id;
  }
  registry(): AccountRegistry {
    return {
      version: 1,
      currentAccountId: this.current(),
      accounts: this.accounts(),
      localBootstrap: { initialized: true },
      profileBindings: this.bindings(),
    };
  }
  mirror() {
    atomicJson(join(this.home, 'accounts.json'), this.registry());
  }
  add(name: string, provider: string) {
    this.db.exec('BEGIN');
    try {
      const result = this.db
        .prepare("INSERT INTO accounts(data) VALUES ('{}')")
        .run();
      const account: Account = {
        id: Number(result.lastInsertRowid),
        name,
        provider,
        mode: 'local',
        authStatus: 'local',
        createdAt: Date.now(),
      };
      this.db
        .prepare('UPDATE accounts SET data=? WHERE id=?')
        .run(JSON.stringify(account), account.id);
      this.db.exec('COMMIT');
      this.accountHome(account.id);
      this.mirror();
      return account;
    } catch (error) {
      if (this.db.isTransaction) this.db.exec('ROLLBACK');
      throw error;
    }
  }
  update(
    id: number,
    patch: {
      name?: string | undefined;
      profileImageUrl?: string | undefined;
      onboardingCompletedAt?: number | undefined;
    },
  ) {
    const account = {
      ...this.requireAccount(id),
      ...Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ),
      id,
    };
    this.db
      .prepare('UPDATE accounts SET data=? WHERE id=?')
      .run(JSON.stringify(account), id);
    this.mirror();
    return account;
  }
  bindings(): ProfileBinding[] {
    return (
      this.db.prepare('SELECT data FROM bindings').all() as { data: string }[]
    ).map((r) => JSON.parse(r.data));
  }
  bind(context: ProfileContext & { localUserId?: string | undefined }) {
    const path = context.profilePath ? resolve(context.profilePath) : undefined;
    const bindings = this.bindings();
    const sameId = bindings.find(
      (binding) => binding.profileId === context.profileId,
    );
    if (sameId?.profilePath && path && resolve(sameId.profilePath) !== path)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Profile identity is already bound to another directory.',
      });
    const previous = path
      ? bindings.find(
          (binding) =>
            binding.profilePath && resolve(binding.profilePath) === path,
        )
      : sameId;
    const accountId =
      context.accountId ??
      previous?.accountId ??
      this.add('Local account', 'local').id;
    this.requireAccount(accountId);
    const binding = {
      ...previous,
      ...context,
      ...(path ? { profilePath: path } : {}),
      accountId,
    };
    if (previous && previous.profileId !== context.profileId)
      this.db
        .prepare('DELETE FROM bindings WHERE profileId=?')
        .run(previous.profileId);
    this.db
      .prepare('INSERT OR REPLACE INTO bindings VALUES (?,?)')
      .run(context.profileId, JSON.stringify(binding));
    this.mirror();
    return this.requireAccount(accountId);
  }
  removeBinding(context: {
    profileId?: string | undefined;
    profilePath?: string | undefined;
  }) {
    for (const binding of this.bindings())
      if (
        binding.profileId === context.profileId ||
        (context.profilePath && binding.profilePath === context.profilePath)
      )
        this.db
          .prepare('DELETE FROM bindings WHERE profileId=?')
          .run(binding.profileId);
    this.mirror();
    return { success: true };
  }
  async deleteAccount(id: number) {
    this.requireAccount(id);
    for (const handler of this.deletionHandlers) await handler(id);
    const accountPath = this.accountHome(id);
    this.db.prepare('DELETE FROM accounts WHERE id=?').run(id);
    for (const binding of this.bindings())
      if (binding.accountId === id)
        this.db
          .prepare('DELETE FROM bindings WHERE profileId=?')
          .run(binding.profileId);
    rmSync(accountPath, { recursive: true, force: true });
    if (!this.accounts().length) this.add('Local account', 'local');
    const first = this.accounts()[0];
    if (this.current() === id && first) this.setCurrent(first.id);
    this.mirror();
    return { success: true };
  }
  accountHome(id: number) {
    this.requireAccount(id);
    const users = join(this.home, 'u');
    if (existsSync(users) && lstatSync(users).isSymbolicLink())
      throw new Error('FORBIDDEN');
    const path = join(users, String(id));
    if (existsSync(path) && lstatSync(path).isSymbolicLink())
      throw new Error('FORBIDDEN');
    mkdirSync(path, { recursive: true, mode: 0o700 });
    if (lstatSync(path).isSymbolicLink()) throw new Error('FORBIDDEN');
    return path;
  }
  accountDb(id: number) {
    const db = new DatabaseSync(this.safeFile(id, 'state.db'));
    chmodSync(join(this.accountHome(id), 'state.db'), 0o600);
    db.exec(
      'PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS kv (namespace TEXT,key TEXT,value TEXT NOT NULL,PRIMARY KEY(namespace,key))',
    );
    return db;
  }
  get(id: number, namespace: string, key: string): unknown {
    const db = this.accountDb(id);
    try {
      const row = db
        .prepare('SELECT value FROM kv WHERE namespace=? AND key=?')
        .get(namespace, key) as { value: string } | undefined;
      return row ? JSON.parse(row.value) : null;
    } finally {
      db.close();
    }
  }
  all(id: number, namespace: string): Record<string, unknown> {
    const db = this.accountDb(id);
    try {
      return Object.fromEntries(
        (
          db
            .prepare('SELECT key,value FROM kv WHERE namespace=?')
            .all(namespace) as { key: string; value: string }[]
        ).map((r) => [r.key, JSON.parse(r.value)]),
      );
    } finally {
      db.close();
    }
  }
  set(id: number, namespace: string, key: string, value: unknown) {
    const db = this.accountDb(id);
    try {
      db.prepare('INSERT OR REPLACE INTO kv VALUES (?,?,?)').run(
        namespace,
        key,
        JSON.stringify(value),
      );
    } finally {
      db.close();
    }
    return value;
  }
  safeFile(id: number, filename: string) {
    const base = this.accountHome(id),
      path = resolve(base, filename);
    if (!path.startsWith(base + sep) || filename.includes('..'))
      throw new Error('FORBIDDEN');
    let part = base;
    for (const segment of filename.split('/')) {
      part = join(part, segment);
      if (existsSync(part) && lstatSync(part).isSymbolicLink())
        throw new Error('FORBIDDEN');
    }
    return path;
  }
  close() {
    this.db.close();
  }
}
