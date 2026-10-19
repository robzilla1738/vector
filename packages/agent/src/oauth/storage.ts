/** Separate encrypted OAuth state. agent.md Model/provider contract. */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from 'node:crypto';
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { type AgentStorage, fail } from '../storage.js';

const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  idToken: z.string().min(1),
  scopes: z.array(z.string()),
  expiresAt: z.number(),
  earliestRefreshMetadata: z
    .union([z.number(), z.string(), z.null()])
    .optional(),
});
export const registrationSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().regex(/^oaiapp_[A-Za-z0-9_-]+$/),
  subject: z.string().min(1),
  email: z.string().optional(),
  createdAt: z.number(),
  revision: z.number().int().positive(),
  tokens: tokensSchema.optional(),
  reauthorizationRequired: z.boolean().default(false),
});
export type Registration = z.infer<typeof registrationSchema>;
const stateSchema = z.object({
  version: z.literal(1),
  activeId: z.string().nullable(),
  registrations: z.array(registrationSchema),
});
export type OAuthState = z.infer<typeof stateSchema>;
const empty = (): OAuthState => ({
  version: 1,
  activeId: null,
  registrations: [],
});
function secureRead(path: string, max = 1000000) {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(fd);
    if (
      !stat.isFile() ||
      stat.nlink !== 1 ||
      (stat.mode & 0o077) !== 0 ||
      (process.getuid && stat.uid !== process.getuid()) ||
      stat.size > max
    )
      fail(
        'FORBIDDEN',
        'OAuth storage must be a bounded owner-only regular file',
      );
    return readFileSync(fd);
  } finally {
    closeSync(fd);
  }
}
function atomic(path: string, data: Buffer | string) {
  const temporary = `${path}.${randomUUID()}`;
  const fd = openSync(temporary, 'wx', 0o600);
  try {
    writeFileSync(fd, data);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}
export class OAuthStorage {
  constructor(readonly store: AgentStorage) {}
  private path(accountId: number, name: string) {
    this.store.requireAccount(accountId);
    const directory = this.store.accountHome(accountId);
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (lstatSync(directory).isSymbolicLink())
      fail('FORBIDDEN', 'OAuth account storage cannot be a symbolic link');
    const path = join(directory, name);
    if (existsSync(path) && lstatSync(path).isSymbolicLink())
      fail('FORBIDDEN', 'OAuth storage cannot be a symbolic link');
    return path;
  }
  hostId() {
    const path = join(this.store.home, 'oauth-host.json');
    if (!existsSync(path)) {
      try {
        const fd = openSync(path, 'wx', 0o600);
        try {
          writeFileSync(
            fd,
            JSON.stringify({ hostId: `urn:uuid:${randomUUID()}` }),
          );
          fsyncSync(fd);
        } finally {
          closeSync(fd);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
    }
    return z
      .object({ hostId: z.string().regex(/^urn:uuid:[0-9a-f-]{36}$/) })
      .parse(JSON.parse(secureRead(path, 1000).toString())).hostId;
  }
  private key(accountId: number, create: boolean) {
    const path = this.path(accountId, 'oauth-private.key');
    if (!existsSync(path) && create) {
      const bytes = randomBytes(32);
      try {
        const fd = openSync(path, 'wx', 0o600);
        try {
          writeFileSync(fd, bytes);
          fsyncSync(fd);
        } finally {
          closeSync(fd);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      } finally {
        bytes.fill(0);
      }
    }
    const key = secureRead(path, 32);
    if (key.length !== 32)
      fail('PRECONDITION_FAILED', 'OAuth encryption key is invalid');
    return key;
  }
  read(accountId: number): OAuthState {
    const path = this.path(accountId, 'oauth-credentials.json');
    if (!existsSync(path)) return empty();
    const key = this.key(accountId, false);
    try {
      const envelope = z
        .object({
          version: z.literal(1),
          iv: z.string(),
          tag: z.string(),
          data: z.string(),
        })
        .parse(JSON.parse(secureRead(path).toString()));
      const decipher = createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(envelope.iv, 'base64'),
      );
      decipher.setAAD(Buffer.from(`Aux OAuth Credentials v1:${accountId}`));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
      const plain = Buffer.concat([
        decipher.update(Buffer.from(envelope.data, 'base64')),
        decipher.final(),
      ]);
      try {
        return stateSchema.parse(JSON.parse(plain.toString()));
      } finally {
        plain.fill(0);
      }
    } catch {
      return fail(
        'PRECONDITION_FAILED',
        'OAuth encrypted credentials are invalid or unavailable',
      );
    } finally {
      key.fill(0);
    }
  }
  write(accountId: number, state: OAuthState) {
    const key = this.key(accountId, true),
      iv = randomBytes(12),
      plain = Buffer.from(JSON.stringify(stateSchema.parse(state)));
    try {
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(Buffer.from(`Aux OAuth Credentials v1:${accountId}`));
      const data = Buffer.concat([cipher.update(plain), cipher.final()]);
      const envelope = JSON.stringify({
        version: 1,
        iv: iv.toString('base64'),
        tag: cipher.getAuthTag().toString('base64'),
        data: data.toString('base64'),
      });
      if (Buffer.byteLength(envelope) > 1000000)
        fail(
          'PRECONDITION_FAILED',
          'OAuth credential storage limit reached; sign out of unused registrations',
        );
      atomic(this.path(accountId, 'oauth-credentials.json'), envelope);
    } finally {
      key.fill(0);
      plain.fill(0);
    }
  }
  async exclusive<T>(accountId: number, operation: () => Promise<T>) {
    const path = this.path(accountId, 'oauth-refresh.sqlite');
    const fd = openSync(
      path,
      constants.O_RDWR | constants.O_CREAT | constants.O_NOFOLLOW,
      0o600,
    );
    try {
      const stat = fstatSync(fd);
      if (
        !stat.isFile() ||
        stat.nlink !== 1 ||
        (stat.mode & 0o077) !== 0 ||
        (process.getuid && stat.uid !== process.getuid())
      )
        fail(
          'FORBIDDEN',
          'OAuth refresh coordination requires owner-only storage',
        );
    } finally {
      closeSync(fd);
    }
    // An independent SQLite connection holds an OS-released cross-process lock.
    // Tokens never enter this database; process death cannot leave a stale lock.
    const database = new DatabaseSync(path);
    try {
      try {
        database.exec(
          'PRAGMA busy_timeout=0; CREATE TABLE IF NOT EXISTS credential_lock (id INTEGER PRIMARY KEY); BEGIN EXCLUSIVE',
        );
      } catch (error) {
        if ([5, 6].includes((error as { errcode?: number }).errcode ?? 0))
          fail(
            'CONFLICT',
            'Another OAuth credential operation is in progress; retry when it finishes',
          );
        throw error;
      }
      return await operation();
    } finally {
      try {
        if (database.isTransaction) database.exec('ROLLBACK');
      } finally {
        database.close();
      }
    }
  }
  redact(accountId: number, value: string) {
    let result = value;
    for (const registration of this.read(accountId).registrations)
      if (registration.tokens)
        for (const token of [
          registration.tokens.accessToken,
          registration.tokens.refreshToken,
          registration.tokens.idToken,
        ])
          result = result.replaceAll(token, '[redacted]');
    return result;
  }
}
