import { randomUUID } from 'node:crypto';
import {
  chmodSync,
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { CustomProviders } from './custom-providers.js';
import { OpenAIOAuth } from './oauth/client.js';
import type { AgentStorage } from './storage.js';
import { fail } from './storage.js';

const credential = z.object({
  type: z.literal('api_key'),
  key: z.string().min(1),
});
const credentialFile = z.record(z.string(), credential);
export class Credentials {
  readonly oauth: OpenAIOAuth;
  private redactors = new Set<(accountId: number, text: string) => string>();
  registerRedactor(redactor: (accountId: number, text: string) => string) {
    this.redactors.add(redactor);
    return () => this.redactors.delete(redactor);
  }
  constructor(
    private store: AgentStorage,
    private filename:
      | 'credentials.json'
      | 'channel-credentials.json' = 'credentials.json',
  ) {
    this.oauth = new OpenAIOAuth(store);
  }
  private path(accountId: number) {
    this.store.requireAccount(accountId);
    const home = this.store.accountHome(accountId);
    mkdirSync(home, { recursive: true, mode: 0o700 });
    if (lstatSync(home).isSymbolicLink())
      fail('FORBIDDEN', 'Account storage cannot be a symbolic link');
    const path = join(home, this.filename);
    if (existsSync(path) && lstatSync(path).isSymbolicLink())
      fail('FORBIDDEN', 'Credential storage cannot be a symbolic link');
    return path;
  }
  private read(accountId: number) {
    const path = this.path(accountId);
    if (!existsSync(path)) return {};
    chmodSync(path, 0o600);
    return credentialFile.parse(JSON.parse(readFileSync(path, 'utf8')));
  }
  list(accountId: number) {
    const entries: { providerId: string; exists: boolean; type: string }[] =
      Object.entries(this.read(accountId)).map(([providerId, value]) => ({
        providerId,
        exists: true,
        type: value.type,
      }));
    if (
      this.filename === 'credentials.json' &&
      this.oauth.status(accountId).exists
    )
      entries.push({ providerId: 'openai-codex', exists: true, type: 'oauth' });
    return entries;
  }
  status(accountId: number, providerId: string) {
    if (providerId === 'openai-codex') return this.oauth.status(accountId);
    const value = this.read(accountId)[providerId];
    return { exists: !!value, type: value?.type ?? null };
  }
  key(accountId: number, providerId: string) {
    const value = this.read(accountId)[providerId];
    if (!value)
      fail(
        'PRECONDITION_FAILED',
        `Configure a credential for ${providerId} before starting a model`,
      );
    return value.key;
  }
  set(accountId: number, providerId: string, value: unknown) {
    if (providerId === 'openai-codex')
      fail(
        'BAD_REQUEST',
        'Use the independently registered OAuth sign-in flow for this provider',
      );
    const values = this.read(accountId);
    values[providerId] = credential.parse(value);
    this.write(accountId, values);
    return this.status(accountId, providerId);
  }
  remove(accountId: number, providerId: string) {
    const values = this.read(accountId);
    delete values[providerId];
    this.write(accountId, values);
    return this.status(accountId, providerId);
  }
  private write(accountId: number, values: z.infer<typeof credentialFile>) {
    const path = this.path(accountId);
    const temporary = `${path}.${randomUUID()}`;
    const fd = openSync(temporary, 'wx', 0o600);
    try {
      writeFileSync(fd, JSON.stringify(values));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(temporary, path);
  }
  redact(accountId: number, value: string) {
    let result = value;
    for (const { key } of [
      ...Object.values(this.read(accountId)),
      ...(this.filename === 'credentials.json'
        ? Object.values(
            new Credentials(this.store, 'channel-credentials.json').read(
              accountId,
            ),
          )
        : []),
    ])
      result = result.replaceAll(key, '[redacted]');
    if (this.filename === 'credentials.json')
      result = new CustomProviders(this.store).redact(
        accountId,
        this.oauth.redact(accountId, result),
      );
    for (const redactor of this.redactors) result = redactor(accountId, result);
    return result.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]');
  }
}
