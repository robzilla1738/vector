export function auxEventPollState() {
  return auxEventPollState.cached ??= { clients: new Set(), refreshes: new Set() };
}
export async function auxStopEventPolling() {
  const state = auxEventPollState(), polling = [...state.clients];
  // These are the supplied account owners: their stop clears refresh timers
  // and invalidates the exact account incarnation before awaiting its work.
  if (typeof clients !== 'undefined') { for (const owner of clients.values()) owner.stop(); clients.clear(); }
  await Promise.all(polling.map(client => client.stop()));
  await Promise.all([...state.refreshes]);
}
export async function auxRunEventRefresh(callback) {
  const state = auxEventPollState(), boundary = auxBrokerBoundary();
  const pending = boundary.awaited(callback);
  state.refreshes.add(pending);
  try { return await pending; }
  finally { state.refreshes.delete(pending); }
}
export function auxCreateEventPollClientClass() {
  return class {
    constructor(options) { this.options = options; this.listeners = new Set(); this.running = false; this.failures = 0; this.ready = false; }
    subscribe(topics, listener) {
      const entry = { topics, listener }; this.listeners.add(entry); this.cursor = undefined;
      return () => { this.listeners.delete(entry); this.cursor = undefined; };
    }
    start() {
      if (this.running) return;
      if (typeof this.options.isCurrent !== 'function') throw Error('Events require an originating account owner.');
      auxBrokerBoundary().registerProducerStop(auxStopEventPolling);
      this.running = true; auxEventPollState().clients.add(this); this.schedule(Math.random() * 2000);
    }
    stop() {
      this.running = false; clearTimeout(this.timer); this.controller?.abort(); auxEventPollState().clients.delete(this);
      return this.pending ?? Promise.resolve();
    }
    reconnect() { if (this.running) { this.retryNow = true; if (this.pending) this.controller?.abort(); else this.schedule(0); } }
    schedule(delay) { clearTimeout(this.timer); if (this.running) this.timer = setTimeout(() => this.tick(), delay); }
    tick() {
      if (!this.running || this.pending) return;
      this.pending = this.poll().finally(() => {
        this.pending = undefined;
        const delay = this.retryNow ? 0 : Math.min(300_000, 60_000 * 2 ** Math.min(this.failures, 3)) + Math.random() * 5000;
        this.retryNow = false; this.schedule(delay);
      });
    }
    async poll() {
      const controller = new AbortController(); this.controller = controller;
      const current = () => this.running && !controller.signal.aborted && this.options.isCurrent();
      try {
        if (!current()) return void this.stop();
        const allowed = ['account', 'billing', 'devices', 'user-settings', 'drive', 'routines', 'sessions'];
        const topics = [...new Set([...this.listeners].flatMap(entry => entry.topics))].sort();
        if (!topics.length || topics.some(topic => !allowed.includes(topic))) throw Error('Unsupported Aux event topics.');
        const url = new URL('/events/poll', this.options.baseUrl);
        if (url.protocol !== 'https:' || url.username || url.password) throw Error('Aux events require HTTPS.');
        url.searchParams.set('topics', topics.join(',')); if (this.cursor) url.searchParams.set('cursor', this.cursor);
        let reply;
        for (let attempt = 0; attempt < 2; attempt++) {
          const token = await this.options.getAccessToken(attempt === 1); if (!current()) return;
          if (!token) throw Error('Events credentials unavailable.');
          // Expected offline/cancel outcomes settle this read lease before the
          // error is reported; cancellation alone never stands in for settlement.
          const result = await auxBrokerBoundary().awaited(async () => {
            try {
              const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]) });
              if (!response.ok) { await response.body?.cancel(); return { status: response.status }; }
              const reader = response.body?.getReader(), chunks = []; let size = 0;
              if (!reader) throw Error('Aux event response is missing.');
              try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 8192) { await reader.cancel(); throw Error('Aux event response exceeds its bound.'); } chunks.push(Buffer.from(part.value)); } }
              finally { reader.releaseLock(); }
              return { body: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
            } catch (error) { return { error }; }
          });
          if (!current()) return;
          if (result.error) throw result.error;
          if (result.status === 401 && attempt === 0) continue;
          if (result.status) throw Error(`Aux event request failed (${result.status}).`);
          reply = result.body; break;
        }
        if (!reply || reply.protocol !== 'aux-events.poll.v1' || !/^aux-ev1\.[a-f0-9]{64}$/.test(reply.cursor) || reply.retryAfterMs !== 60_000 || !Array.isArray(reply.changed) || reply.changed.length > topics.length || new Set(reply.changed).size !== reply.changed.length || reply.changed.some(topic => !topics.includes(topic))) throw Error('Invalid Aux event snapshot.');
        if (!current()) return;
        const types = { account: 'account.updated', billing: 'billing.subscription-updated', devices: 'devices.changed', 'user-settings': 'user-settings.updated', drive: 'drive.files-changed', routines: 'routines.invalidated', sessions: 'sessions.changed' };
        for (const topic of reply.changed) for (const entry of this.listeners) if (entry.topics.includes(topic)) {
          if (!current()) return;
          entry.listener({ type: types[topic], ...topic === 'devices' ? { payload: { deviceId: '*' } } : {} });
        }
        this.cursor = reply.cursor; this.failures = 0;
        if (!this.ready) { this.ready = true; this.options.onReady?.(); }
      } catch {
        if (current()) { this.failures++; this.ready = false; this.options.onError?.(Error('Aux events are offline or unavailable; synchronization will retry.')); }
      } finally { if (this.controller === controller) this.controller = undefined; }
    }
  };
}
