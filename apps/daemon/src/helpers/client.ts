/** Original private helper transport; see apps/computer-use/PROTOCOL.md. */
import {
  type ChildProcessWithoutNullStreams,
  execFileSync,
  spawn,
} from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, realpathSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fail } from '@aux/agent';
import { z } from 'zod';

const reply = z.object({
  id: z.string(),
  result: z.unknown().optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
});
export type HelperMethod =
  | 'ping'
  | 'capabilities'
  | 'permissions.status'
  | 'notifications.status'
  | 'notifications.enqueue'
  | 'notifications.takeActivations'
  | 'permissions.request'
  | 'screen.capture'
  | 'input.click'
  | 'input.type'
  | 'input.scroll'
  | 'input.key'
  | 'apps.list'
  | 'apps.frontmost'
  | 'accessibility.snapshot'
  | 'semantic.prepare'
  | 'semantic.capture'
  | 'apps.open'
  | 'automation.run'
  | 'contacts.search'
  | 'messages.send'
  | 'vault.biometryAvailable'
  | 'vault.biometryStatus'
  | 'vault.biometryEnroll'
  | 'vault.biometryUnlock'
  | 'vault.biometryRemove'
  | 'import.pickFile'
  | 'import.prepare'
  | 'import.review'
  | 'import.commit'
  | 'import.cancel'
  | 'exchange.begin'
  | 'exchange.status'
  | 'exchange.read'
  | 'exchange.ack'
  | 'exchange.cancel'
  | 'exchange.finish';
interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
  abort?: () => void;
}
export class HelperClient {
  private child: ChildProcessWithoutNullStreams | undefined;
  private pending = new Map<string, Pending>();
  private buffer = '';
  private token = randomBytes(32).toString('hex');
  private closed = false;
  constructor(
    readonly executable: string,
    readonly artifactDirectory: string,
    private readonly options: { role?: 'notifications' } = {},
  ) {}
  private start() {
    if (this.closed) fail('PRECONDITION_FAILED', 'Helper client is closed');
    if (this.child) return this.child;
    const executable = resolve(this.executable);
    if (
      !['aux-computer-use', 'aux-password-importer'].includes(
        basename(executable),
      ) ||
      !existsSync(executable) ||
      !lstatSync(executable).isFile()
    )
      fail(
        'PRECONDITION_FAILED',
        'Build or bundle the independent Aux Computer Use helper before using native features',
      );
    mkdirSync(this.artifactDirectory, { recursive: true, mode: 0o700 });
    if (lstatSync(this.artifactDirectory).isSymbolicLink())
      fail('FORBIDDEN', 'Helper artifact storage cannot be a symbolic link');
    const child = spawn(executable, ['--stdio'], {
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        PATH: '/usr/bin:/bin:/usr/sbin:/sbin',
        HOME: homedir(),
        TMPDIR: tmpdir(),
        LANG: 'en_US.UTF-8',
        AUX_HELPER_AUTH_TOKEN: this.token,
        AUX_HELPER_ARTIFACT_DIR: resolve(this.artifactDirectory),
        ...(this.options.role ? { AUX_HELPER_ROLE: this.options.role } : {}),
      },
    });
    this.child = child;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      this.buffer += chunk;
      if (this.buffer.length > 2_000_000) {
        this.rejectAll(new Error('Helper reply exceeded the transport limit'));
        this.retire(child);
        return;
      }
      while (this.buffer.includes('\n')) {
        const end = this.buffer.indexOf('\n'),
          line = this.buffer.slice(0, end);
        this.buffer = this.buffer.slice(end + 1);
        let parsed: z.infer<typeof reply>;
        try {
          parsed = reply.parse(JSON.parse(line));
        } catch {
          this.rejectAll(
            new Error('Helper returned an invalid protocol reply'),
          );
          this.retire(child);
          return;
        }
        const pending = this.pending.get(parsed.id);
        if (!pending) continue;
        this.pending.delete(parsed.id);
        clearTimeout(pending.timeout);
        pending.abort?.();
        if (parsed.error)
          pending.reject(
            new Error(`${parsed.error.code}: ${parsed.error.message}`),
          );
        else pending.resolve(parsed.result);
      }
    });
    // Child diagnostics are deliberately drained without logging protocol secrets or owner content.
    child.stderr.resume();
    child.on('error', (error) => {
      this.rejectAll(
        new Error(
          `Aux helper could not start: ${'code' in error ? String(error.code) : 'process error'}`,
        ),
      );
      this.child = undefined;
    });
    child.on('exit', () => {
      this.rejectAll(
        new Error(
          'Aux helper disconnected; an in-flight mutation may have completed and must not be retried automatically',
        ),
      );
      this.child = undefined;
      this.buffer = '';
    });
    return child;
  }
  private retire(child: ChildProcessWithoutNullStreams) {
    child.stdin.end();
    const signal = (kind: NodeJS.Signals) => {
      if (!child.pid || child.exitCode !== null) return;
      let identity: string;
      try {
        identity = execFileSync(
          '/bin/ps',
          ['-p', String(child.pid), '-o', 'comm='],
          { encoding: 'utf8', timeout: 2000 },
        ).trim();
      } catch {
        return;
      }
      if (identity !== resolve(this.executable)) return;
      try {
        process.kill(-child.pid, kind);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
      }
    };
    signal('SIGTERM');
    const escalation = setTimeout(() => signal('SIGKILL'), 2000);
    escalation.unref();
    child.once('exit', () => clearTimeout(escalation));
  }
  private rejectAll(error: Error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout);
      pending.abort?.();
      pending.reject(error);
    }
    this.pending.clear();
  }
  call(
    method: HelperMethod,
    params: Record<string, unknown> = {},
    options: { signal?: AbortSignal; timeoutMs?: number } = {},
  ) {
    if (options.signal?.aborted)
      return Promise.reject(new Error('Helper operation cancelled'));
    const child = this.start(),
      id = randomUUID();
    return new Promise<unknown>((resolve, reject) => {
      const stop = () => {
        this.pending.delete(id);
        clearTimeout(pending.timeout);
        options.signal?.removeEventListener('abort', stop);
        reject(
          new Error(
            'Helper operation cancelled; reconcile the operation before repeating it',
          ),
        );
        this.retire(child);
      };
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        options.signal?.removeEventListener('abort', stop);
        reject(
          new Error(
            'Helper deadline exceeded; the operation outcome may be unknown',
          ),
        );
        this.retire(child);
      }, options.timeoutMs ?? 150000);
      const pending: Pending = {
        resolve,
        reject,
        timeout,
        abort: () => options.signal?.removeEventListener('abort', stop),
      };
      this.pending.set(id, pending);
      options.signal?.addEventListener('abort', stop, { once: true });
      child.stdin.write(
        `${JSON.stringify({ id, method, params, auth: this.token })}\n`,
        (error) => {
          if (error) {
            this.pending.delete(id);
            clearTimeout(timeout);
            pending.abort?.();
            reject(new Error('Aux helper input pipe failed'));
          }
        },
      );
    });
  }
  async close() {
    this.closed = true;
    const child = this.child;
    this.rejectAll(new Error('Aux helper is shutting down'));
    if (!child) return;
    this.retire(child);
    await new Promise<void>((resolve) => {
      if (child.exitCode !== null) {
        resolve();
        return;
      }
      child.once('exit', () => resolve());
    });
    this.child = undefined;
  }
}
export function createVaultBiometryAdapter(client: HelperClient) {
  // Disposable and relocated app bundles must not share an enrollment with
  // another Aux home. Canonicalize the existing home, never a credential path.
  const namespace = createHash('sha256')
    .update('Aux Vault Keychain v1\0')
    .update(realpathSync(dirname(client.artifactDirectory)))
    .digest('hex');
  const identity = (accountId: number) => ({
    accountId,
    vaultId: `master-${namespace}`,
  });
  return {
    status: async (accountId: number) =>
      z
        .object({ available: z.boolean(), enrolled: z.boolean() })
        .passthrough()
        .parse(await client.call('vault.biometryStatus', identity(accountId))),
    enroll: async (accountId: number, key: string) =>
      z
        .object({ available: z.boolean(), enrolled: z.boolean() })
        .passthrough()
        .parse(
          await client.call('vault.biometryEnroll', {
            ...identity(accountId),
            key,
          }),
        ),
    unlock: async (accountId: number) =>
      z
        .object({ key: z.string() })
        .parse(await client.call('vault.biometryUnlock', identity(accountId))),
    remove: async (accountId: number) =>
      z
        .object({ available: z.boolean(), enrolled: z.boolean() })
        .passthrough()
        .parse(await client.call('vault.biometryRemove', identity(accountId))),
  };
}
