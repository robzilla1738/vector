import { randomUUID } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import type { PasskeyVaultAdapter } from '../passkeys/schema.js';
import { passkeyRecordSchema } from '../passkeys/schema.js';
import type { itemFields } from '../vault/schema.js';
import {
  exchangeBatch,
  exchangeHelperStatus,
  importedPasskey,
  passwordFields,
} from './exchange-schema.js';

type Scope = {
  accountId: number;
  profileId: string;
  vaultId: string;
  browserMode: 'default';
};
type HelperMethod =
  | 'capabilities'
  | 'exchange.begin'
  | 'exchange.status'
  | 'exchange.read'
  | 'exchange.ack'
  | 'exchange.cancel'
  | 'exchange.finish';
export interface ExchangeHelper {
  call(method: HelperMethod, params: Record<string, unknown>): Promise<unknown>;
}
export interface ExchangeVault extends PasskeyVaultAdapter {
  status(accountId: number): { locked: boolean };
  snapshot(accountId: number): { vaults: { id: string }[] };
  createItems(
    accountId: number,
    items: z.infer<typeof itemFields>[],
  ): { created: number; skipped: number };
}
type Job = Scope & {
  id: string;
  generation: number;
  state:
    | 'waiting'
    | 'importing'
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'timeout';
  createdAt: number;
  updatedAt: number;
  needsAuthorization: boolean;
  stage:
    | 'source-export'
    | 'destination-check'
    | 'normalizing'
    | 'writing'
    | 'authorization-required'
    | 'receipt-review'
    | 'complete';
  receiptId: string | null;
  acceptedReceiptId: string | null;
  needsAcceptance: boolean;
  busy: boolean;
  passwordTotal: number;
  passkeyTotal: number;
  passwordsCreated: number;
  passwordsSkipped: number;
  passkeysCreated: number;
  passkeysSkipped: number;
  unsupported: Record<string, number>;
  error?: string;
  helperCleanupFailed?: boolean;
};
const terminal = (job: Job) =>
  ['succeeded', 'failed', 'cancelled', 'timeout'].includes(job.state);
function fail(
  code: 'FORBIDDEN' | 'PRECONDITION_FAILED' | 'CONFLICT' | 'NOT_FOUND',
  message: string,
): never {
  throw new TRPCError({ code, message });
}
export class CredentialExchange {
  private jobs = new Map<string, Job>();
  private timer: NodeJS.Timeout | undefined;
  private closed = false;
  private starting = false;
  constructor(
    private services: Pick<DaemonServices, 'store' | 'bridge'>,
    private vault: ExchangeVault,
    private helper: ExchangeHelper,
  ) {}
  private binding(scope: Scope) {
    const { store, bridge } = this.services;
    store.requireAccount(scope.accountId);
    if (
      store.current() !== scope.accountId ||
      !store
        .bindings()
        .some(
          (binding) =>
            binding.accountId === scope.accountId &&
            binding.profileId === scope.profileId,
        ) ||
      !bridge.status({
        accountId: scope.accountId,
        profileId: scope.profileId,
        browserMode: 'default',
      }).connected
    )
      fail(
        'FORBIDDEN',
        'The selected ordinary browser account and profile must remain active.',
      );
  }
  private authorize(scope: Scope) {
    this.binding(scope);
    if (
      !this.vault
        .snapshot(scope.accountId)
        .vaults.some((vault) => vault.id === scope.vaultId)
    )
      fail('NOT_FOUND', 'The import destination Vault is unavailable.');
    return this.vault.generation(scope.accountId);
  }
  private public(job: Job) {
    const {
      generation: _generation,
      busy: _busy,
      acceptedReceiptId: _accepted,
      ...status
    } = job;
    return {
      ...status,
      passwordCompleted: job.passwordsCreated + job.passwordsSkipped,
      passkeyCompleted: job.passkeysCreated + job.passkeysSkipped,
      ...(terminal(job) ? { completedAt: job.updatedAt } : {}),
    };
  }
  async status(accountId: number, id: string) {
    this.services.store.requireAccount(accountId);
    const job = this.jobs.get(id);
    if (!job || job.accountId !== accountId)
      fail('NOT_FOUND', 'The credential exchange session is unavailable.');
    if (terminal(job) && Date.now() - job.updatedAt > 86400_000) {
      this.jobs.delete(id);
      fail('NOT_FOUND', 'The credential exchange session has expired.');
    }
    if (!terminal(job) && Date.now() - job.updatedAt >= 600_000) {
      job.state = 'timeout';
      job.updatedAt = Date.now();
      await this.retire(job);
    }
    return this.public(job);
  }
  async support() {
    const result = z
      .object({
        nativeCredentialExchange: z.object({
          supported: z.boolean(),
          reason: z.string().max(128),
        }),
      })
      .parse(await this.helper.call('capabilities', {}));
    return result.nativeCredentialExchange;
  }
  async begin(scope: Scope) {
    if (this.closed)
      fail('PRECONDITION_FAILED', 'Credential exchange has stopped.');
    const generation = this.authorize(scope);
    if (this.starting)
      fail('CONFLICT', 'A native exchange is already being prepared.');
    this.starting = true;
    try {
      const support = await this.support();
      if (!support.supported)
        fail(
          'PRECONDITION_FAILED',
          'Native credential exchange requires an OS-authorized credential provider signature. This local helper can still import selected export files.',
        );
      if (this.authorize(scope) !== generation)
        fail(
          'PRECONDITION_FAILED',
          'Vault security changed while preparing import.',
        );
      for (const job of this.jobs.values()) {
        if (terminal(job) && Date.now() - job.updatedAt > 86400_000)
          this.jobs.delete(job.id);
        else if (!terminal(job)) await this.cancel(job.accountId, job.id);
      }
      if (this.jobs.size >= 64)
        fail('CONFLICT', 'Too many retained credential exchange sessions.');
      const now = Date.now();
      const job: Job = {
        ...scope,
        id: randomUUID(),
        generation,
        state: 'waiting',
        createdAt: now,
        updatedAt: now,
        needsAuthorization: false,
        stage: 'source-export',
        receiptId: null,
        acceptedReceiptId: null,
        needsAcceptance: false,
        busy: true,
        passwordTotal: 0,
        passkeyTotal: 0,
        passwordsCreated: 0,
        passwordsSkipped: 0,
        passkeysCreated: 0,
        passkeysSkipped: 0,
        unsupported: {},
      };
      this.jobs.set(job.id, job);
      try {
        const status = exchangeHelperStatus.parse(
          await this.helper.call('exchange.begin', {
            ...scope,
            sessionId: job.id,
          }),
        );
        this.check(job);
        if (status.sessionId !== job.id || status.state !== 'waiting')
          throw new Error('Invalid exchange begin acknowledgment.');
        job.busy = false;
        return this.public(job);
      } catch {
        if (!terminal(job)) job.state = 'failed';
        job.busy = false;
        job.updatedAt = Date.now();
        job.error = 'The native exchange receiver could not be prepared.';
        await this.retire(job);
        return this.public(job);
      }
    } finally {
      this.starting = false;
    }
  }
  private check(job: Job) {
    if (this.closed || terminal(job))
      fail('CONFLICT', 'The credential exchange session is no longer active.');
    this.binding(job);
    if (
      this.vault.status(job.accountId).locked ||
      this.vault.generation(job.accountId) !== job.generation
    )
      fail(
        'PRECONDITION_FAILED',
        'Reauthorize the unlocked import destination to continue.',
      );
  }
  async resume(accountId: number, id: string) {
    const job = this.jobs.get(id);
    if (!job || job.accountId !== accountId || terminal(job))
      fail('NOT_FOUND', 'The active exchange session is unavailable.');
    if (job.busy) fail('CONFLICT', 'The exchange is processing a batch.');
    if (Date.now() - job.updatedAt >= 600_000) {
      job.state = 'timeout';
      job.updatedAt = Date.now();
      await this.retire(job);
      fail('PRECONDITION_FAILED', 'This credential exchange session expired.');
    }
    job.generation = this.authorize(job);
    job.needsAuthorization = false;
    job.acceptedReceiptId = null;
    job.needsAcceptance = job.receiptId !== null;
    job.stage = job.needsAcceptance ? 'receipt-review' : 'source-export';
    job.updatedAt = Date.now();
    return this.public(job);
  }
  async accept(accountId: number, id: string, receiptId: string) {
    const job = this.jobs.get(id);
    if (!job || job.accountId !== accountId || terminal(job))
      fail('NOT_FOUND', 'The active exchange session is unavailable.');
    if (job.busy || job.needsAuthorization)
      fail(
        'CONFLICT',
        'Reauthorize the current import destination before accepting credentials.',
      );
    await this.status(accountId, id);
    this.check(job);
    const generation = job.generation;
    const status = exchangeHelperStatus.parse(
      await this.helper.call('exchange.status', { sessionId: id }),
    );
    await this.status(accountId, id);
    this.check(job);
    if (job.generation !== generation || job.needsAuthorization)
      fail(
        'CONFLICT',
        'Vault authorization changed while accepting the receipt.',
      );
    if (
      status.sessionId !== id ||
      status.state !== 'ready' ||
      status.receiptId !== receiptId ||
      job.receiptId !== receiptId
    )
      fail(
        'CONFLICT',
        'The received credential export changed. Review the current receipt.',
      );
    job.acceptedReceiptId = receiptId;
    job.needsAcceptance = false;
    job.stage = 'destination-check';
    job.updatedAt = Date.now();
    return this.public(job);
  }
  private async retire(job: Job) {
    try {
      await this.helper.call('exchange.cancel', { sessionId: job.id });
    } catch {
      job.helperCleanupFailed = true;
    }
  }
  async cancel(accountId: number, id: string) {
    const job = this.jobs.get(id);
    if (!job || job.accountId !== accountId)
      fail('NOT_FOUND', 'The exchange session is unavailable.');
    if (!terminal(job)) {
      job.state = 'cancelled';
      job.updatedAt = Date.now();
      await this.retire(job);
    }
    return this.public(job);
  }
  async poll() {
    for (const job of this.jobs.values()) {
      if (terminal(job) && Date.now() - job.updatedAt > 86400_000) {
        this.jobs.delete(job.id);
        continue;
      }
      if (terminal(job) || job.busy) continue;
      if (Date.now() - job.updatedAt >= 600_000) {
        job.state = 'timeout';
        job.updatedAt = Date.now();
        await this.retire(job);
        continue;
      }
      job.busy = true;
      try {
        this.binding(job);
        if (
          this.vault.status(job.accountId).locked ||
          this.vault.generation(job.accountId) !== job.generation
        ) {
          job.needsAuthorization = true;
          job.acceptedReceiptId = null;
          job.needsAcceptance = job.receiptId !== null;
          job.stage = 'authorization-required';
          continue;
        }
        if (job.needsAuthorization) continue;
        const status = exchangeHelperStatus.parse(
          await this.helper.call('exchange.status', { sessionId: job.id }),
        );
        this.check(job);
        if (status.sessionId !== job.id)
          throw new Error('Mismatched native exchange session.');
        job.passwordTotal = status.passwordTotal;
        job.passkeyTotal = status.passkeyTotal;
        job.unsupported = status.unsupported;
        if (['failed', 'cancelled', 'timeout'].includes(status.state)) {
          job.state = status.state as 'failed' | 'cancelled' | 'timeout';
          job.error = 'The native exchange ended before completion.';
          job.updatedAt = Date.now();
          await this.retire(job);
          continue;
        }
        if (status.state === 'waiting') continue;
        if (status.state === 'importing') {
          if (job.state !== 'importing') job.updatedAt = Date.now();
          job.state = 'importing';
          continue;
        }
        if (status.state !== 'ready' || !status.receiptId)
          throw new Error('Unexpected native exchange completion.');
        if (job.receiptId !== status.receiptId) job.updatedAt = Date.now();
        job.receiptId = status.receiptId;
        job.needsAcceptance = job.acceptedReceiptId !== status.receiptId;
        if (job.needsAcceptance) {
          job.stage = 'receipt-review';
          continue;
        }
        job.state = 'importing';
        job.stage = 'destination-check';
        const batch = exchangeBatch.parse(
          await this.helper.call('exchange.read', {
            sessionId: job.id,
            cursor: status.cursor,
            receiptId: status.receiptId,
          }),
        );
        this.check(job);
        if (
          batch.sessionId !== job.id ||
          batch.receiptId !== status.receiptId ||
          batch.cursor !== status.cursor ||
          (!batch.done && !batch.records.length)
        )
          throw new Error('Invalid native exchange batch.');
        if (this.authorize(job) !== job.generation)
          fail('PRECONDITION_FAILED', 'The import destination changed.');
        job.stage = 'normalizing';
        const passwords = batch.records
          .filter((record) => record.kind === 'password')
          .map((record) => passwordFields(record, job.vaultId));
        const passkeys = batch.records
          .filter((record) => record.kind === 'passkey')
          .map(importedPasskey);
        this.check(job);
        job.stage = 'writing';
        if (passwords.length) {
          const accepted = this.vault.createItems(job.accountId, passwords);
          job.passwordsCreated += accepted.created;
          job.passwordsSkipped += accepted.skipped;
        }
        let passkeysCreated = 0,
          passkeysSkipped = 0;
        if (passkeys.length)
          this.vault.commitPasskeys(
            job.accountId,
            job.generation,
            (records) => {
              this.check(job);
              const current = records.map((record) =>
                passkeyRecordSchema.parse(record),
              );
              for (const incoming of passkeys) {
                const existing = current.find(
                  (record) =>
                    record.credentialId === incoming.credentialId &&
                    record.rpId === incoming.rpId,
                );
                if (existing) {
                  if (
                    existing.publicX !== incoming.publicX ||
                    existing.publicY !== incoming.publicY ||
                    existing.userId !== incoming.userId
                  )
                    throw new Error(
                      'An existing passkey identity has different key material.',
                    );
                  passkeysSkipped++;
                } else {
                  current.push(incoming);
                  passkeysCreated++;
                }
              }
              return current;
            },
          );
        job.passkeysCreated += passkeysCreated;
        job.passkeysSkipped += passkeysSkipped;
        this.check(job);
        if (batch.records.length) {
          const acknowledged = exchangeHelperStatus.parse(
            await this.helper.call('exchange.ack', {
              sessionId: job.id,
              cursor: batch.cursor,
              count: batch.records.length,
              receiptId: status.receiptId,
            }),
          );
          this.check(job);
          if (
            acknowledged.sessionId !== job.id ||
            acknowledged.cursor !== batch.cursor + batch.records.length
          )
            throw new Error('Native exchange progress acknowledgment failed.');
          job.updatedAt = Date.now();
        }
        if (batch.done) {
          const completed = exchangeHelperStatus.parse(
            await this.helper.call('exchange.finish', {
              sessionId: job.id,
              receiptId: status.receiptId,
            }),
          );
          this.check(job);
          if (completed.sessionId !== job.id || completed.state !== 'succeeded')
            throw new Error('Native exchange completion was not acknowledged.');
          job.state = 'succeeded';
          job.stage = 'complete';
          job.updatedAt = Date.now();
        }
      } catch (error) {
        if (
          !terminal(job) &&
          error instanceof TRPCError &&
          error.code === 'PRECONDITION_FAILED'
        ) {
          job.needsAuthorization = true;
          job.acceptedReceiptId = null;
          job.needsAcceptance = job.receiptId !== null;
          job.stage = 'authorization-required';
        } else if (!terminal(job)) {
          job.state = 'failed';
          job.updatedAt = Date.now();
          job.error =
            'Credential exchange failed. Already accepted encrypted records were preserved.';
          await this.retire(job);
        }
      } finally {
        job.busy = false;
      }
    }
  }
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.poll();
    }, 500);
    this.timer.unref();
  }
  async close() {
    this.closed = true;
    if (this.timer) clearInterval(this.timer);
    for (const job of this.jobs.values())
      if (!terminal(job)) await this.cancel(job.accountId, job.id);
  }
}

export function createCredentialExchangeRouter(
  services: DaemonServices,
  exchange: CredentialExchange,
) {
  const scope = z.object({ accountId: z.number().int().nonnegative() });
  const session = scope.extend({ sessionId: z.string().uuid() });
  const procedure = services.procedure.use(({ ctx, next }) => {
    if (ctx.clientKind !== 'password-manager-extension')
      fail('FORBIDDEN', 'Open Aux Vault to manage native credential exchange.');
    return next();
  });
  return services.t.router({
    support: procedure.input(scope).query(({ input }) => {
      services.store.requireAccount(input.accountId);
      return exchange.support();
    }),
    begin: procedure
      .input(
        scope.extend({
          profileId: z.string().min(1).max(256),
          browserMode: z.literal('default'),
          vaultId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
          authorized: z.literal(true),
        }),
      )
      .mutation(({ input }) => exchange.begin(input)),
    status: procedure
      .input(session)
      .query(({ input }) => exchange.status(input.accountId, input.sessionId)),
    accept: procedure
      .input(
        session.extend({
          receiptId: z.string().uuid(),
          authorized: z.literal(true),
        }),
      )
      .mutation(({ input }) =>
        exchange.accept(input.accountId, input.sessionId, input.receiptId),
      ),
    resume: procedure
      .input(session)
      .mutation(({ input }) =>
        exchange.resume(input.accountId, input.sessionId),
      ),
    cancel: procedure
      .input(session)
      .mutation(({ input }) =>
        exchange.cancel(input.accountId, input.sessionId),
      ),
  });
}
