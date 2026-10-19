import { fail } from '@aux/agent';
import type { BrowsingHistory } from '@aux/memory';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const batchSchema = z
  .object({
    accountId: z.number().int(),
    profileId: z.string(),
    browserMode: z.literal('default'),
    from: z.number(),
    through: z.number(),
    complete: z.literal(true),
    visits: z
      .array(
        z.object({
          id: z.string().min(1).max(128),
          url: z.url(),
          title: z.string().max(2000),
          visitedAt: z.number().nonnegative(),
          content: z.literal(''),
          transition: z.string().optional(),
        }),
      )
      .max(2000),
  })
  .strict();
type State = {
  cursor: number;
  lastCollectedAt?: number;
  lastError?: string;
  indexPending?: number;
};
export class HistoryCollector {
  private timer: NodeJS.Timeout | undefined;
  private active = new Set<string>();
  private closed = false;
  private epochs = new Map<number, number>();
  settingsChanged(accountId: number) {
    this.services.store.requireAccount(accountId);
    this.epochs.set(accountId, (this.epochs.get(accountId) ?? 0) + 1);
    const cursor = Date.now();
    for (const binding of this.services.store.bindings())
      if (binding.accountId === accountId)
        this.services.store.set(
          accountId,
          'historyCollection',
          binding.profileId,
          { cursor },
        );
  }
  constructor(
    private services: DaemonServices,
    private history: BrowsingHistory,
  ) {}
  private key(accountId: number, profileId: string) {
    return `${accountId}/${profileId}`;
  }
  private authorize(accountId: number, profileId: string) {
    const { store, bridge } = this.services;
    store.requireAccount(accountId);
    if (store.get(accountId, 'settings', 'browsingHistoryEnabled') !== true)
      fail('PRECONDITION_FAILED', 'Visited-page recall is disabled');
    if (
      !store
        .bindings()
        .some(
          (binding) =>
            binding.accountId === accountId && binding.profileId === profileId,
        )
    )
      fail('FORBIDDEN', 'History Profile is not bound to this account');
    if (
      !bridge.status({ accountId, profileId, browserMode: 'default' }).connected
    )
      fail(
        'PRECONDITION_FAILED',
        'The bound ordinary browser Profile is unavailable',
      );
    if (this.closed)
      fail('PRECONDITION_FAILED', 'History collector has stopped');
  }
  status(accountId: number, profileId: string) {
    this.services.store.requireAccount(accountId);
    if (
      !this.services.store
        .bindings()
        .some((b) => b.accountId === accountId && b.profileId === profileId)
    )
      fail('FORBIDDEN', 'History Profile is not bound to this account');
    return {
      enabled:
        this.services.store.get(
          accountId,
          'settings',
          'browsingHistoryEnabled',
        ) === true,
      active: this.active.has(this.key(accountId, profileId)),
      ...((this.services.store.get(
        accountId,
        'historyCollection',
        profileId,
      ) as State | null) ?? {}),
    };
  }
  async collect(
    accountId: number,
    profileId: string,
    options: { from?: number; to?: number } = {},
  ) {
    const epoch = this.epochs.get(accountId) ?? 0;
    const authorize = () => {
      this.authorize(accountId, profileId);
      if ((this.epochs.get(accountId) ?? 0) !== epoch)
        fail('CONFLICT', 'History consent changed during collection');
    };
    authorize();
    const key = this.key(accountId, profileId);
    if (this.active.has(key))
      fail('CONFLICT', 'History collection is already running');
    const { store, bridge } = this.services;
    const previous = store.get(
      accountId,
      'historyCollection',
      profileId,
    ) as State | null;
    // Automatic collection starts at opt-in observation. Earlier history needs
    // an explicit collect request with from/to; original timestamps are retained.
    const from = options.from ?? previous?.cursor ?? Date.now(),
      to = options.to ?? Date.now();
    if (
      !Number.isFinite(from) ||
      !Number.isFinite(to) ||
      from < 0 ||
      to < from ||
      to > Date.now() + 1000
    )
      fail('BAD_REQUEST', 'Invalid history collection interval');
    this.active.add(key);
    const inserted: string[] = [];
    try {
      const raw = await bridge.command(
        { accountId, profileId, browserMode: 'default' },
        {
          method: 'history.visits',
          params: { accountId, profileId, browserMode: 'default', from, to },
        },
        { timeoutMs: 15000 },
      );
      authorize();
      const batch = batchSchema.parse(raw);
      if (
        batch.accountId !== accountId ||
        batch.profileId !== profileId ||
        batch.from !== from ||
        batch.through !== to
      )
        fail(
          'FORBIDDEN',
          'Native history batch does not match its registered route and interval',
        );
      let indexPending = 0;
      for (const visit of batch.visits)
        if (visit.visitedAt < from || visit.visitedAt > to)
          fail('BAD_REQUEST', 'Native visit is outside the requested interval');
      for (const visit of batch.visits) {
        authorize();
        if (visit.visitedAt < from || visit.visitedAt > to)
          fail('BAD_REQUEST', 'Native visit is outside the requested interval');
        const result = await this.history.ingest(accountId, {
          ...visit,
          profileId,
          incognito: false,
        });
        if (result.inserted) inserted.push(result.id);
        if (result.indexState === 'pending') indexPending++;
        authorize();
      }
      authorize();
      const state: State = {
        cursor: Math.max(previous?.cursor ?? from, to),
        lastCollectedAt: Date.now(),
        indexPending,
      };
      store.set(accountId, 'historyCollection', profileId, state);
      return {
        collected: batch.visits.length,
        inserted: inserted.length,
        indexPending,
        through: to,
      };
    } catch (error) {
      // Revocation/rebinding during asynchronous indexing retires newly captured
      // rows and dependent vectors. Already existing evidence is preserved.
      try {
        if (inserted.length)
          this.history.remove(accountId, profileId, inserted);
      } catch {
        /* Account deletion already removes its database. */
      }
      try {
        store.requireAccount(accountId);
        if ((this.epochs.get(accountId) ?? 0) === epoch)
          store.set(accountId, 'historyCollection', profileId, {
            cursor: previous?.cursor ?? from,
            lastError:
              error instanceof Error
                ? error.message
                : 'History collection failed',
          });
      } catch {
        /* Deleted account is never recreated. */
      }
      throw error;
    } finally {
      this.active.delete(key);
    }
  }
  start(intervalMs = 10000) {
    if (this.timer) return;
    this.closed = false;
    const poll = () => {
      for (const binding of this.services.store.bindings()) {
        if (
          this.services.store.get(
            binding.accountId,
            'settings',
            'browsingHistoryEnabled',
          ) !== true ||
          this.active.has(this.key(binding.accountId, binding.profileId)) ||
          !this.services.bridge.status({ ...binding, browserMode: 'default' })
            .connected
        )
          continue;
        void this.collect(binding.accountId, binding.profileId).catch(() => {
          /* Status retains the concrete collection error. */
        });
      }
    };
    this.timer = setInterval(poll, Math.max(intervalMs, 1000));
    this.timer.unref();
    poll();
  }
  close() {
    this.closed = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
export function createHistoryCollector(
  services: DaemonServices,
  history: BrowsingHistory,
) {
  return new HistoryCollector(services, history);
}
