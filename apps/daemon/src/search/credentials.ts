/** Write-only account search credentials; daemon/agent.md tool inventory. */
import { randomUUID } from 'node:crypto';
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
import { fail } from '@aux/agent';
import { z } from 'zod';
import type { Store } from '../storage/store.js';

export const searchConfigurationSchema = z
  .object({
    apiKey: z
      .string()
      .min(1)
      .max(8192)
      .regex(/^[!-~]+$/, 'A nonempty API key without whitespace is required'),
    enabled: z.boolean().default(true),
    maxResults: z.number().int().min(1).max(10).default(5),
  })
  .strict();
type Configuration = z.infer<typeof searchConfigurationSchema>;
export class SearchCredentials {
  constructor(private store: Pick<Store, 'requireAccount' | 'accountHome'>) {}
  private path(accountId: number) {
    this.store.requireAccount(accountId);
    const home = this.store.accountHome(accountId);
    mkdirSync(home, { recursive: true, mode: 0o700 });
    const stat = lstatSync(home);
    if (
      !stat.isDirectory() ||
      stat.isSymbolicLink() ||
      (stat.mode & 0o077) !== 0 ||
      (process.getuid && stat.uid !== process.getuid())
    )
      fail(
        'FORBIDDEN',
        'Search account storage must be an owner-only directory',
      );
    return join(home, 'search-credentials.json');
  }
  private read(accountId: number): Configuration | undefined {
    const path = this.path(accountId);
    let fd: number;
    try {
      fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      fail('FORBIDDEN', 'Search credential file is inaccessible');
    }
    try {
      const stat = fstatSync(fd);
      if (
        !stat.isFile() ||
        stat.nlink !== 1 ||
        (stat.mode & 0o077) !== 0 ||
        stat.size > 16384 ||
        (process.getuid && stat.uid !== process.getuid())
      )
        fail(
          'FORBIDDEN',
          'Search credential file must be a bounded owner-only regular file',
        );
      try {
        return searchConfigurationSchema.parse(
          JSON.parse(readFileSync(fd, 'utf8')),
        );
      } catch {
        fail('PRECONDITION_FAILED', 'Search credential file is invalid');
      }
    } finally {
      closeSync(fd);
    }
  }
  status(accountId: number) {
    const value = this.read(accountId);
    return {
      provider: 'perplexity' as const,
      configured: !!value,
      enabled: value?.enabled ?? false,
      maxResults: value?.maxResults ?? 5,
      credentialRequired: !value,
      endpoint: 'https://api.perplexity.ai/search' as const,
    };
  }
  configure(accountId: number, input: Configuration) {
    const value = searchConfigurationSchema.parse(input);
    const path = this.path(accountId);
    if (existsSync(path)) this.read(accountId); // Reject symlink/hardlink/mode failures before replacement.
    const temporary = `${path}.${randomUUID()}`;
    const fd = openSync(temporary, 'wx', 0o600);
    try {
      writeFileSync(fd, JSON.stringify(value));
      fsyncSync(fd);
      closeSync(fd);
      renameSync(temporary, path);
    } catch {
      try {
        closeSync(fd);
      } catch {}
      fail('PRECONDITION_FAILED', 'Search credential update failed');
    } finally {
      rmSync(temporary, { force: true });
    }
    return this.status(accountId);
  }
  setEnabled(accountId: number, enabled: boolean) {
    const value = this.read(accountId);
    if (!value)
      fail(
        'PRECONDITION_FAILED',
        'Configure a separate Perplexity Search API key first',
      );
    return this.configure(accountId, { ...value, enabled });
  }
  clear(accountId: number) {
    this.read(accountId);
    rmSync(this.path(accountId), { force: true });
    return this.status(accountId);
  }
  key(accountId: number) {
    const value = this.read(accountId);
    if (!value?.enabled)
      fail(
        'PRECONDITION_FAILED',
        'Web search is unavailable: configure and enable a separate Perplexity Search API key',
      );
    return value.apiKey;
  }
  redact(accountId: number, text: string) {
    try {
      const key = this.read(accountId)?.apiKey;
      return key ? text.split(key).join('[REDACTED]') : text;
    } catch {
      // If credential storage cannot be read, do not persist possibly secret text.
      return '[Search credential redaction unavailable]';
    }
  }
}
