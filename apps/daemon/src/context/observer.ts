/** Opt-in local observer; services.md Context awareness. Never opens permission prompts. */
import { createHash, randomUUID } from 'node:crypto';
import { fail } from '@aux/agent';
import {
  activitySchema,
  type CaptureCandidate,
  type ContextService,
  type ObserverState,
} from '@aux/memory';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

export function createContextObserver(
  { store, bridge }: DaemonServices,
  context: ContextService,
  security: { isUnlocked(accountId: number): boolean },
) {
  let timer: NodeJS.Timeout | undefined;
  let closed = true;
  let active:
    | { accountId: number; controller: AbortController; promise: Promise<void> }
    | undefined;
  let observedAccount: number | undefined;
  const browserLast = new Map<string, string>();
  let last: { accountId: number; fingerprint: string } | undefined;
  const epoch = new Map<number, number>();
  const state = (accountId: number, value: ObserverState) =>
    context.setObserverState(accountId, value);
  function changed(accountId: number) {
    epoch.set(accountId, (epoch.get(accountId) ?? 0) + 1);
    if (active?.accountId === accountId)
      active.controller.abort(
        new Error('Context security or settings changed'),
      );
    last = undefined;
    browserLast.clear();
    state(accountId, {
      running: false,
      phase: 'blocked',
      reason: 'settings-or-security-changed',
    });
  }
  async function sample(accountId: number, signal: AbortSignal) {
    const generation = epoch.get(accountId) ?? 0;
    const captureVersion = context.captureVersion(accountId);
    const check = async (candidate?: CaptureCandidate) => {
      signal.throwIfAborted();
      if (
        closed ||
        (epoch.get(accountId) ?? 0) !== generation ||
        context.captureVersion(accountId) !== captureVersion
      )
        fail('CONFLICT', 'Observer generation changed');
      store.requireAccount(accountId);
      if (store.current() !== accountId || !security.isUnlocked(accountId))
        fail(
          'FORBIDDEN',
          'Context capture requires the current unlocked account',
        );
      context.captureAllowed(
        accountId,
        candidate ?? { bundleId: '', appName: '' },
      );
      if (
        (await context.permissions(accountId, signal)).semanticCapture !==
        'granted'
      )
        fail(
          'PRECONDITION_FAILED',
          'Semantic capture permission is denied or unavailable',
        );
      signal.throwIfAborted();
      // Permission queries cross the helper transport, so recheck local state.
      if (
        closed ||
        (epoch.get(accountId) ?? 0) !== generation ||
        context.captureVersion(accountId) !== captureVersion ||
        store.current() !== accountId ||
        !security.isUnlocked(accountId)
      )
        fail('CONFLICT', 'Capture authorization changed');
      context.captureAllowed(
        accountId,
        candidate ?? { bundleId: '', appName: '' },
      );
    };
    state(accountId, { running: true, phase: 'checking' });
    await check();
    const adapter = context.adapter;
    if (!adapter?.prepare || !adapter.capture)
      fail('PRECONDITION_FAILED', 'Native semantic observer is unavailable');
    const prepared = await adapter.prepare(accountId, signal);
    await check();
    if (prepared.state === 'skipped') {
      state(accountId, {
        running: true,
        phase: 'skipped',
        reason: prepared.reason,
      });
      return;
    }
    const candidate = prepared.candidate;
    await check(candidate);
    state(accountId, { running: true, phase: 'capturing' });
    const result = await adapter.capture(accountId, candidate, signal);
    await check(candidate);
    if (result.state === 'skipped') {
      state(accountId, {
        running: true,
        phase: 'skipped',
        reason: result.reason,
      });
      return;
    }
    if (
      result.candidateId !== candidate.id ||
      result.pid !== candidate.pid ||
      result.bundleId !== candidate.bundleId
    )
      fail('CONFLICT', 'Semantic capture application identity changed');
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify([
          result.pid,
          result.bundleId,
          result.windowTitle,
          result.content,
        ]),
      )
      .digest('hex');
    if (last?.accountId !== accountId || last.fingerprint !== fingerprint) {
      await context.ingestObserved(
        accountId,
        activitySchema.parse({
          source: 'native-semantic',
          sourceId: randomUUID(),
          kind: 'window',
          occurredAt: result.occurredAt,
          appName: result.appName,
          bundleId: result.bundleId,
          windowTitle: result.windowTitle,
          content: result.content,
        }),
        () => check(candidate),
      );
      last = { accountId, fingerprint };
    }
    state(accountId, {
      running: true,
      phase: 'waiting',
      lastCapturedAt: result.occurredAt,
    });
  }
  async function browserActivity(accountId: number, signal: AbortSignal) {
    const generation = epoch.get(accountId) ?? 0;
    const captureVersion = context.captureVersion(accountId);
    const schema = z.discriminatedUnion('state', [
      z.object({ state: z.literal('skipped'), reason: z.string() }),
      z.object({
        state: z.literal('captured'),
        accountId: z.number().int(),
        profileId: z.string(),
        browserMode: z.literal('default'),
        targetId: z.string().min(1),
        tabId: z.number().int().nonnegative(),
        url: z.url(),
        title: z.string().max(2000),
        content: z.literal(''),
        occurredAt: z.number().nonnegative(),
      }),
    ]);
    for (const binding of store
      .bindings()
      .filter((b) => b.accountId === accountId)) {
      const route = {
        accountId,
        profileId: binding.profileId,
        browserMode: 'default' as const,
      };
      if (!bridge.status(route).connected) continue;
      const check = async (url?: string) => {
        signal.throwIfAborted();
        if (
          closed ||
          (epoch.get(accountId) ?? 0) !== generation ||
          context.captureVersion(accountId) !== captureVersion ||
          store.current() !== accountId ||
          !security.isUnlocked(accountId) ||
          !store
            .bindings()
            .some(
              (b) =>
                b.accountId === accountId && b.profileId === binding.profileId,
            ) ||
          !bridge.status(route).connected
        )
          fail('FORBIDDEN', 'Browser activity authorization changed');
        if (
          (await context.permissions(accountId, signal)).semanticCapture !==
          'granted'
        )
          fail('PRECONDITION_FAILED', 'Capture permission was revoked');
        signal.throwIfAborted();
        if (
          closed ||
          (epoch.get(accountId) ?? 0) !== generation ||
          context.captureVersion(accountId) !== captureVersion ||
          store.current() !== accountId ||
          !security.isUnlocked(accountId) ||
          !store
            .bindings()
            .some(
              (b) =>
                b.accountId === accountId && b.profileId === binding.profileId,
            ) ||
          !bridge.status(route).connected
        )
          fail('CONFLICT', 'Browser capture authorization changed');
        context.captureAllowed(accountId, {
          bundleId: 'dev.aux.browser',
          appName: 'Aux Browser',
          domain: url ? new URL(url).hostname.toLowerCase() : null,
        });
      };
      const exclusions = (await context.status(accountId)).exclusions;
      await check();
      state(accountId, { running: true, phase: 'capturing' });
      const response = schema.parse(
        await bridge.command(
          route,
          {
            method: 'context.activity',
            params: {
              ...route,
              excludedDomains: exclusions.domains,
            },
          },
          { signal, timeoutMs: 6000 },
        ),
      );
      await check();
      if (response.state === 'skipped') {
        state(accountId, {
          running: true,
          phase: 'skipped',
          reason: response.reason,
        });
        continue;
      }
      if (
        response.accountId !== accountId ||
        response.profileId !== binding.profileId ||
        Math.abs(Date.now() - response.occurredAt) > 15000
      )
        fail(
          'FORBIDDEN',
          'Browser activity does not match the registered native route',
        );
      await check(response.url);
      const fingerprint = createHash('sha256')
        .update(
          JSON.stringify([response.targetId, response.url, response.title]),
        )
        .digest('hex');
      if (browserLast.get(binding.profileId) === fingerprint) {
        state(accountId, {
          running: true,
          phase: 'waiting',
          lastCapturedAt: response.occurredAt,
        });
        continue;
      }
      await context.ingestObserved(
        accountId,
        activitySchema.parse({
          source: 'browser-observer',
          sourceId: randomUUID(),
          kind: 'activation',
          occurredAt: response.occurredAt,
          profileId: binding.profileId,
          targetId: response.targetId,
          url: response.url,
          appName: 'Aux Browser',
          bundleId: 'dev.aux.browser',
          windowTitle: response.title,
          content: '',
        }),
        () => check(response.url),
      );
      browserLast.set(binding.profileId, fingerprint);
      state(accountId, {
        running: true,
        phase: 'waiting',
        lastCapturedAt: response.occurredAt,
      });
    }
  }
  function tick(): Promise<void> {
    if (closed) return Promise.resolve();
    if (active) return active.promise;
    const accountId = store.current();
    if (observedAccount !== undefined && observedAccount !== accountId) {
      browserLast.clear();
      state(observedAccount, {
        running: false,
        phase: 'blocked',
        reason: 'account-changed',
      });
    }
    observedAccount = accountId;
    if (
      store.get(accountId, 'settings', 'contextAwarenessEnabled') !== true ||
      !security.isUnlocked(accountId)
    ) {
      state(accountId, {
        running: false,
        phase: 'blocked',
        reason: 'disabled-or-locked',
      });
      return Promise.resolve();
    }
    const controller = new AbortController();
    const promise = sample(accountId, controller.signal)
      .then(() => browserActivity(accountId, controller.signal))
      .catch((error) => {
        state(accountId, {
          running: false,
          phase: 'blocked',
          reason: controller.signal.aborted
            ? 'capture-cancelled'
            : error instanceof Error
              ? error.message
              : 'capture-failed',
        });
      })
      .finally(() => {
        active = undefined;
      });
    active = { accountId, controller, promise };
    return promise;
  }
  return {
    tick,
    changed,
    start(intervalMs = 5000) {
      if (timer) return;
      closed = false;
      timer = setInterval(
        () => {
          void tick();
        },
        Math.max(intervalMs, 1000),
      );
      timer.unref();
      void tick();
    },
    async close() {
      closed = true;
      if (timer) clearInterval(timer);
      timer = undefined;
      if (observedAccount !== undefined)
        state(observedAccount, {
          running: false,
          phase: 'stopped',
          reason: 'observer-stopped',
        });
      if (active) {
        const { accountId, controller, promise } = active;
        controller.abort(new Error('Observer stopped'));
        await promise;
        state(accountId, {
          running: false,
          phase: 'stopped',
          reason: 'observer-stopped',
        });
      }
    },
  };
}
