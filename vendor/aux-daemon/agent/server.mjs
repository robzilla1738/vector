/** The agent server: keeps one live agent per task, runs it, and fans its events out to the
 * websockets attached to that task. Commands are acknowledged once per id, a client that
 * reconnects replays what it missed, a run left by a previous process resumes up to three times,
 * and an idle agent is disposed. The agent itself (AgentSession), the wire encoding and channel
 * delivery stay the supplied ones. */
const DEFAULT_IDLE_TTL_MS = 6e5, DEFAULT_KEEPALIVE_MS = 15e3, DEFAULT_EVENT_BUFFER_LIMIT = 2048, CLI_DISCONNECT_ABORT_DEBOUNCE_MS = 2e3;
const MAX_SEEN_COMMAND_IDS = 128, MAX_CONCURRENT_RUNS = 200, MAX_RESUME_ATTEMPTS = 3, MAX_REPLAY_BYTES = 4194304;
const STATUS_RECONCILE_RETRY_DELAYS_MS = [100, 250, 500, 1e3, 2e3];
const CLOSED = 'AUX_AGENT_ADMISSION_CLOSED', PROTOCOL = {protocolVersion: 1}, PING = {op: 'ping', ...PROTOCOL}, BACKPRESSURE = {backpressure: true};

const keyOf = (accountId, sessionId) => `${accountId}:${sessionId}`;
const hasLiveRun = entry => entry.agent.agent.state.isStreaming || entry.runningPromise !== null;
const isBusy = entry => entry.runningPromise || entry.agent.agent.state.isStreaming;
const toError = error => error instanceof Error ? error : Error(String(error));
const firstUserMessage = message => message ? (Array.isArray(message) ? message : [message]).find(entry => entry.role === 'user') : undefined;
const clearTimer = (entry, name) => {
  if (!entry[name]) return;
  clearTimeout(entry[name]);
  entry[name] = null;
};

/** The frames a reconnecting client is owed, within the event and byte limits. */
class EventReplayBuffer {
  #frames = [];
  #head = 0;
  #size = 0;
  #bytes = 0;
  #runId = null;
  #lastSeq = 0;
  constructor(limit) { this.limit = limit; }
  clear() {
    this.#frames.length = 0;
    this.#head = this.#size = this.#bytes = this.#lastSeq = 0;
    this.#runId = null;
  }
  append(event, payload) {
    const bytes = payload.length * 2;
    if (bytes > MAX_REPLAY_BYTES) {
      this.clear();
      this.#runId = event.runId;
      this.#lastSeq = event.seq;
      return;
    }
    while (this.#size > 0 && (this.#size >= this.limit || this.#bytes + bytes > MAX_REPLAY_BYTES)) {
      this.#bytes -= (this.#frames[this.#head]?.payload.length ?? 0) * 2;
      this.#frames[this.#head] = undefined;
      this.#head = (this.#head + 1) % this.limit;
      this.#size -= 1;
    }
    this.#frames[(this.#head + this.#size) % this.limit] = {runId: event.runId, seq: event.seq, payload};
    this.#size += 1;
    this.#bytes += bytes;
    this.#runId = event.runId;
    this.#lastSeq = event.seq;
  }
  #inOrder() {
    return Array.from({length: this.#size}, (_, index) => this.#frames[(this.#head + index) % this.limit]).filter(Boolean);
  }
  getReplayFrames({activeRunId, cursor}) {
    const runId = this.#runId;
    if (!runId) return {kind: 'frames', frames: [], runId: null, cursorMatched: false};
    const frames = this.#inOrder().filter(frame => frame.runId === runId);
    if (!cursor || cursor.runId !== runId) return {kind: 'frames', frames: activeRunId === runId ? frames : [], runId, cursorMatched: false};
    const firstAvailableSeq = frames[0]?.seq ?? this.#lastSeq + 1;
    return cursor.seq < firstAvailableSeq - 1 ? {kind: 'gap', runId, cursorSeq: cursor.seq, firstAvailableSeq}
      : {kind: 'frames', frames: frames.filter(frame => frame.seq > cursor.seq), runId, cursorMatched: true};
  }
}

/** Remembers recent command ids, so a resend is acknowledged again rather than run again. */
class CommandLedger {
  #seen = new Map;
  register(commandId, command) {
    const ack = (commandType, duplicate) => ({op: 'ack', ...PROTOCOL, commandId, commandType, ...duplicate ? {duplicate} : {}});
    const fingerprint = JSON.stringify(command), seen = this.#seen.get(commandId);
    if (seen) return seen.fingerprint === fingerprint ? {kind: 'duplicate', ack: ack(seen.commandType, true)} : {kind: 'conflict', commandId};
    this.#seen.set(commandId, {commandType: command.type, fingerprint});
    if (this.#seen.size > MAX_SEEN_COMMAND_IDS) this.#seen.delete(this.#seen.keys().next().value);
    return {kind: 'new', ack: ack(command.type)};
  }
}

const storedStop = (status, error) => (s, accountId, sessionId) => {
  const session = s.SessionStore.get(accountId, sessionId);
  if (!session || session.status !== 'running' && session.status !== 'suspended') return false;
  const {suspension} = session, unanswered = suspension && !suspension.response && !suspension.error;
  s.SessionStore.update(accountId, session.id, {status, ...unanswered ? {suspension: {...suspension, error, resolvedAt: new Date().toISOString()}} : {}});
  s.SessionStore.touch(accountId, session.id);
  return true;
};
const interruptStoredSession = storedStop('interrupted', 'Session interrupted by user.'), abortStoredSession = storedStop('aborted', 'Session aborted.');

export function create({agentServer: s}) {
  const runEndRecipient = session => session.trigger?.type === 'subagent' || session.trigger?.type === 'agent' ? s.delegatorOf(session) : undefined;
  const assertCanStart = (accountId, sessionId) => {
    const session = s.SessionStore.get(accountId, sessionId);
    if (session && s.isEphemeralPurgePending(session)) throw Error(`Session is pending purge: ${sessionId}`);
  };

  /** The websockets of one task, each with a heartbeat. */
  class WebSocketFanout {
    #sockets = new Set;
    #heartbeats = new Map;
    constructor(keepAliveMs) { this.keepAliveMs = keepAliveMs; }
    get size() { return this.#sockets.size; }
    has(socket) { return this.#sockets.has(socket); }
    attach(socket) {
      if (this.#sockets.has(socket)) return;
      this.#sockets.add(socket);
      this.#heartbeats.set(socket, s.startWebsocketHeartbeat(socket, PING, this.keepAliveMs, BACKPRESSURE));
    }
    detach(socket) {
      this.#sockets.delete(socket);
      this.#heartbeats.get(socket)?.();
      this.#heartbeats.delete(socket);
    }
    send(socket, frame) {
      if (s.safeWebsocketSend(socket, frame, BACKPRESSURE)) return true;
      this.detach(socket);
      return false;
    }
    replay(socket, frames) {
      for (const {payload} of frames) if (!s.safeWebsocketSendText(socket, payload, BACKPRESSURE)) {
        this.detach(socket);
        return false;
      }
      return true;
    }
    broadcast(payload) {
      let dropped = 0;
      for (const socket of this.#sockets) if (!s.safeWebsocketSendText(socket, payload, BACKPRESSURE)) {
        this.detach(socket);
        dropped += 1;
      }
      return dropped;
    }
    closeAll() {
      for (const socket of [...this.#sockets]) {
        this.detach(socket);
        s.safeWebsocketClose(socket, 1001, 'session disposed');
      }
    }
  }

  /** The status change with a few retries; a run that cannot record its end must still finish. */
  async function changeStatusWithRetry(entry, status, reason) {
    const {accountId, sessionId} = entry;
    for (let attempt = 0; ; attempt += 1) try {
      entry.agent.changeStatus(status);
      return;
    } catch (error) {
      const delayMs = STATUS_RECONCILE_RETRY_DELAYS_MS[attempt];
      if (delayMs === undefined) {
        s.logger.error('[AgentSessionServer] Failed to reconcile session status', {accountId, sessionId, status, reason, error: s.errorMessage(error)});
        return;
      }
      s.logger.warn('[AgentSessionServer] Retrying session status reconciliation', {accountId, sessionId, status, reason, attempt: attempt + 1, delayMs, error: s.errorMessage(error)});
      await s.sleep(delayMs);
    }
  }

  const capture = (accountId, event, properties) => s.posthog(accountId).capture({event, properties});

  let runSlots;
  return class AgentSessionServer {
    #closing = false;
    #disposals = new Map;
    #drain;
    #entries = new Map;
    #loading = new Map;
    #resuming = new Map;
    #recovering = new Map;
    #createAgent;
    #idleTtlMs;
    #keepAliveMs;
    #replayToNewSubscribers;
    #eventBufferLimit;

    constructor(options) {
      this.#createAgent = options.createAgentSession ?? (async (accountId, sessionId) => {
        const session = s.SessionStore.get(accountId, sessionId);
        if (!session) throw Error(`Session not found: ${sessionId}`);
        return s.AgentSession.create(accountId, await s.restoreCliBrowserBinding(accountId, session));
      });
      this.#idleTtlMs = options.idleTtlMs ?? DEFAULT_IDLE_TTL_MS;
      this.#keepAliveMs = options.keepAliveMs ?? DEFAULT_KEEPALIVE_MS;
      this.#replayToNewSubscribers = options.replayEventsToNewSubscribers ?? false;
      this.#eventBufferLimit = options.eventBufferLimit ?? DEFAULT_EVENT_BUFFER_LIMIT;
    }

    get #runSlots() { return runSlots ??= new s.Semaphore(MAX_CONCURRENT_RUNS); }
    #entry(accountId, sessionId) { return this.#entries.get(keyOf(accountId, sessionId)); }
    #assertOpen() { if (this.#closing) throw Error(CLOSED); }

    async getAgent(accountId, sessionId) {
      const entry = await this.#load(accountId, sessionId);
      this.#scheduleCleanup(entry);
      return entry.agent;
    }
    getLoadedAgent(accountId, sessionId) { return this.#entry(accountId, sessionId)?.agent; }
    hasLiveActivity(accountId, sessionId) {
      const key = keyOf(accountId, sessionId), entry = this.#entries.get(key);
      return this.#loading.has(key) || !!(entry && (entry.runningPromise || entry.agent.agent.state.isStreaming || entry.fanout.size > 0));
    }
    refreshLoadedSessionBrowserBinding(accountId, sessionId, binding) { this.#entry(accountId, sessionId)?.agent.refreshBrowserBinding(binding); }
    refreshLoadedSessionPolicy(accountId, sessionId, policy) {
      const agent = this.#entry(accountId, sessionId)?.agent;
      if (!agent) return;
      if (agent.session.permissionMode !== policy.permissionMode || !s.isEqual(agent.session.permission, policy.permission)) agent.execSessions.terminateAll();
      Object.assign(agent.session, {permissionMode: policy.permissionMode, permission: policy.permission, runtimeConfig: policy.runtimeConfig});
    }
    async refreshLoadedSessionModel(accountId, sessionId, model) { await this.#entry(accountId, sessionId)?.agent.applyExecutionModel(model); }
    reloadLoadedAgentSession(accountId, sessionId) { return s.backgroundWriters().run(() => this.#reload(accountId, sessionId)); }
    async #reload(accountId, sessionId) {
      const key = keyOf(accountId, sessionId);
      await this.#loading.get(key)?.catch(() => undefined);
      const entry = this.#entries.get(key);
      if (!entry) return;
      if (isBusy(entry)) throw Error('Cannot reload a session while the agent is running.');
      clearTimer(entry, 'cleanupTimer');
      const previous = entry.agent, agent = await this.#createAgent(accountId, sessionId);
      if (this.#closing || this.#entries.get(key) !== entry) {
        await agent.dispose({closeOwnedTabs: false});
        return;
      }
      entry.unsubscribe();
      entry.agent = agent;
      entry.replayBuffer.clear();
      entry.runState = {runId: null, seq: 0};
      entry.unsubscribe = agent.subscribe(event => this.#publish(entry, event));
      await previous.dispose({closeOwnedTabs: false});
    }
    getRecentToolCalls(accountId, sessionId, limit = 3) { return this.#entry(accountId, sessionId)?.agent.getRecentToolCalls(limit) ?? []; }
    async prewarm(accountId, sessionId) { this.#scheduleCleanup(await this.#load(accountId, sessionId)); }

    /** Attaches a socket: says whether a run is live, resumes one left running, and replays from `cursor`. */
    async connect(accountId, sessionId, socket, cursor) {
      const entry = await this.#load(accountId, sessionId);
      this.#clearTimers(entry);
      entry.fanout.attach(socket);
      const session = s.SessionStore.get(accountId, sessionId);
      if (s.isEphemeralPurgePending(session)) {
        this.#detach(entry, socket);
        throw Error(`Session is pending purge: ${sessionId}`);
      }
      const live = hasLiveRun(entry), leftRunning = entry.agent.session.status === 'running' && !live;
      if (!entry.fanout.send(socket, {op: 'ready', ...PROTOCOL, sessionId, running: live || leftRunning})) return this.#detach(entry, socket);
      if (session?.status === 'errored' && !live && !leftRunning) {
        entry.fanout.send(socket, {op: 'error', ...PROTOCOL, message: 'This task stopped before completing. Check the pending message and attachments, then retry after checking its model, tools and selected page.'});
        return this.#scheduleCleanup(entry);
      }
      const resumed = leftRunning ? await this.resumeRun(accountId, sessionId) : 'skipped';
      if (!this.#replayToNewSubscribers) return undefined;
      const replay = entry.replayBuffer.getReplayFrames({activeRunId: live ? entry.runState.runId : null, cursor});
      const ended = () => cursor && !live && resumed === 'skipped' && !hasLiveRun(entry);
      if (replay.kind === 'gap') {
        if (ended()) return this.#sendRunEnd(entry, socket, cursor);
        entry.fanout.send(socket, {op: 'error', ...PROTOCOL, message: 'Replay buffer no longer contains requested cursor. Reload session to resync.'});
        return undefined;
      }
      if (!entry.fanout.replay(socket, replay.frames)) return this.#scheduleCleanup(entry);
      if (!replay.cursorMatched && ended()) this.#sendRunEnd(entry, socket, cursor);
      return undefined;
    }
    /** A client reconnecting after its run ended is told so. */
    #sendRunEnd(entry, socket, cursor) {
      entry.fanout.send(socket, {op: 'event', ...PROTOCOL, runId: cursor.runId, seq: cursor.seq + 1, event: {type: 'agent_end'}});
    }

    async resumeRun(accountId, sessionId) {
      this.#assertOpen();
      const key = keyOf(accountId, sessionId), pending = this.#resuming.get(key);
      if (pending) return pending;
      const resume = this.#resume(accountId, sessionId, key);
      this.#resuming.set(key, resume);
      try {
        return await resume;
      } finally {
        this.#resuming.delete(key);
      }
    }
    async #resume(accountId, sessionId, key) {
      const session = s.SessionStore.get(accountId, sessionId);
      if (!session || session.status !== 'running') return 'skipped';
      const entry = this.#entries.get(key);
      if (entry && hasLiveRun(entry)) return 'skipped';
      const attempt = s.SessionStore.recordTurnResumeAttempt(accountId, sessionId);
      if (attempt === null) {
        s.logger.warn('[AgentSessionServer] Running session has no open run to resume', {accountId, sessionId});
        await this.#abortRun(accountId, sessionId, {kind: 'daemon-restart'}, 'aborted');
        return 'exhausted';
      }
      if (attempt > MAX_RESUME_ATTEMPTS) {
        const error = `The run could not be resumed after ${MAX_RESUME_ATTEMPTS} server restarts.`;
        s.logger.error('[AgentSessionServer] Run resume budget exhausted', {accountId, sessionId, attempt});
        await this.#abortRun(accountId, sessionId, {kind: 'error', error}, 'errored', error);
        return 'exhausted';
      }
      s.logger.info('[AgentSessionServer] Resuming run after restart', {accountId, sessionId, attempt});
      try {
        await this.startRun(accountId, sessionId, agent => agent.resumeAfterCrash(), {trigger: 'resume'});
        return 'resumed';
      } catch (failure) {
        const error = s.errorMessage(failure);
        s.logger.error('[AgentSessionServer] Run resume failed to start', {accountId, sessionId, error});
        await this.#abortRun(accountId, sessionId, {kind: 'error', error}, 'errored', error);
        return 'exhausted';
      }
    }
    recoverInterruptedRuns(accountId) {
      this.#assertOpen();
      const recovery = Promise.resolve().then(() => this.#recover(accountId));
      this.#recovering.set(accountId, recovery);
      recovery.catch(() => {}).finally(() => {
        if (this.#recovering.get(accountId) === recovery) this.#recovering.delete(accountId);
      });
      return recovery;
    }
    async whenRecovered(accountId) { await this.#recovering.get(accountId)?.catch(() => {}); }
    /** Every task still marked running, workers first, so each parent resumes to their reports. */
    async #recover(accountId) {
      const outcomes = {resumed: [], skipped: [], exhausted: []};
      const running = s.SessionStore.listFull(accountId, {statuses: ['running'], parent: 'all', archived: 'include', ephemeral: 'include', routines: 'include'}).sort((a, b) => Number(!a.parentId) - Number(!b.parentId));
      for (const session of running) {
        const outcome = await this.resumeRun(accountId, session.id).catch(error => {
          s.logger.error('[AgentSessionServer] Run recovery failed', {accountId, sessionId: session.id, error: s.errorMessage(error)});
          return 'exhausted';
        });
        outcomes[outcome].push(session.id);
      }
      if (running.length > 0) s.logger.info('[AgentSessionServer] Recovered runs left by the previous process', {accountId, ...outcomes});
      return outcomes;
    }
    async #abortRun(accountId, sessionId, reason, status, error) {
      s.SessionStore.abortRunningSession(accountId, sessionId, reason, status);
      const session = s.SessionStore.get(accountId, sessionId);
      const entry = this.#entry(accountId, sessionId) ?? (session && runEndRecipient(session) ? await this.#load(accountId, sessionId).catch(() => undefined) : undefined);
      if (!entry) return;
      entry.agent.session.status = status;
      if (error) this.#publish(entry, {type: 'agent_error', errorMessage: error});
      await this.#reportRunEnd(entry.agent, status, error ?? '');
      this.#scheduleCleanup(entry);
    }
    /** Tells the delegating task its worker finished. */
    async #reportRunEnd(agent, status, textContent) {
      const {session} = agent, parentSessionId = runEndRecipient(session);
      if (!parentSessionId || status === 'running' || status === 'suspended') return;
      await agent.hooks.trigger('subagent.run.ended', {parentSessionId, childSession: status === session.status ? session : {...session, status}, textContent}, undefined)
        .catch(error => console.error('[Hook] subagent.run.ended failed:', error));
    }
    disconnect(accountId, sessionId, socket) {
      const entry = this.#entry(accountId, sessionId);
      if (entry) this.#detach(entry, socket);
    }
    async handleCommand(sessionId, socket, command, commandId, accountId) {
      const entry = await this.#load(accountId, sessionId);
      if (!entry.fanout.has(socket)) {
        await this.connect(accountId, sessionId, socket);
        if (!entry.fanout.has(socket)) return;
      }
      const registered = entry.commandLedger.register(commandId, command);
      if (registered.kind === 'conflict') {
        entry.fanout.send(socket, {op: 'error', ...PROTOCOL, commandId, message: 'Command id reused with different payload'});
        return;
      }
      if (!entry.fanout.send(socket, registered.ack)) return void this.#detach(entry, socket);
      if (registered.kind !== 'duplicate') await this.#dispatch(accountId, sessionId, command);
    }
    async steer(accountId, sessionId, message) { await this.#dispatch(accountId, sessionId, {type: 'steer', message}); }
    async queue(accountId, sessionId, message) { await this.#dispatch(accountId, sessionId, {type: 'queue', message}); }
    async #dispatch(accountId, sessionId, command) {
      const entry = await this.#load(accountId, sessionId);
      if (command.type === 'interrupt') return void await this.interrupt(accountId, sessionId);
      if (command.type === 'steer') {
        const turn = s.SessionStore.getLatestTurn(accountId, sessionId);
        if (command.expectedTurnId && (turn?.turnId !== command.expectedTurnId || turn.finishedAt)) throw Error('This Turn has ended. Send the message again to start a new Turn.');
        const userMessage = firstUserMessage(command.message);
        if (userMessage && entry.agent.hasQueuedMessage(userMessage)) return void await this.#steerQueued(entry, userMessage, command.interrupt === true, command.steeringMessage);
        if (userMessage && command.interrupt && entry.agent.hasSteeringMessage(userMessage)) return void await this.#interruptAndContinue(entry);
      }
      if (entry.agent.agent.state.isStreaming) {
        if (command.type === 'steer') return void await (command.interrupt ? this.#interruptSteer(entry, command.message, command.steeringMessage) : entry.agent.steer(command.message, command.steeringMessage));
        if (command.type === 'queue') return void await entry.agent.followUp(command.message);
      }
      if (entry.runningPromise && !entry.agent.agent.state.isStreaming) await entry.runningPromise;
      await this.startRun(accountId, sessionId, async agent => {
        switch (command.type) {
          case 'prompt': return void await agent.prompt(command.message);
          case 'continue': return void await agent.continue();
          case 'steer': return void await (command.interrupt ? agent.interruptSteer(command.message, command.steeringMessage) : agent.steer(command.message, command.steeringMessage));
          case 'queue': return void await agent.followUp(command.message);
          default: throw Error(`Unhandled session command: ${command}`);
        }
      }, {trigger: 'user'});
      return undefined;
    }
    async compact(accountId, sessionId, options) {
      const entry = await this.#load(accountId, sessionId);
      if (entry.runningPromise) await entry.runningPromise;
      let failure;
      await this.startRun(accountId, sessionId, async agent => {
        try {
          await agent.compact(options);
        } catch (error) {
          failure = toError(error);
        }
      });
      await (await this.#load(accountId, sessionId)).runningPromise;
      if (failure) throw failure;
    }
    isRunning(accountId, sessionId) {
      const entry = this.#entry(accountId, sessionId);
      return entry ? entry.agent.agent.state.isStreaming || entry.runningPromise !== null : false;
    }
    isSteerable(accountId, sessionId) {
      const entry = this.#entry(accountId, sessionId);
      return !entry?.runningPromise || entry.agent.acceptsSteering;
    }
    async whenSteerable(accountId, sessionId) {
      const entry = this.#entry(accountId, sessionId), running = entry?.runningPromise;
      if (!entry || !running || entry.agent.acceptsSteering) return;
      const {promise, resolve} = Promise.withResolvers();
      const unsubscribe = entry.agent.agent.subscribe(event => {
        if (event.type === 'agent_start') resolve();
      });
      await Promise.race([promise, running]).finally(unsubscribe);
    }
    isLoading(accountId, sessionId) { return this.#loading.has(keyOf(accountId, sessionId)); }
    getRunningSessionCount() { return [...this.#entries.values()].filter(isBusy).length; }
    getSemaphoreStats() { return {available: this.#runSlots.available, capacity: MAX_CONCURRENT_RUNS}; }
    async sendSystemMessage(accountId, sessionId, content, options) {
      const message = {role: 'system-message', content, kind: options.kind, metadata: options.metadata ?? {}, timestamp: Date.now()};
      const entry = this.#entry(accountId, sessionId);
      if (entry && this.isRunning(accountId, sessionId)) return void await entry.agent.sendSystemMessage(content, {...options, mode: options.mode === 'wakeup' ? 'steer' : options.mode});
      if (options.mode !== 'wakeup' && options.mode !== 'queue') return undefined;
      if (s.SessionStore.get(accountId, sessionId)?.status === 'suspended') return void await this.appendMessage(accountId, sessionId, message);
      return void await this.startRun(accountId, sessionId, agent => agent.prompt(message));
    }
    async waitForIdle(accountId, sessionId, signal) {
      const entry = await this.#load(accountId, sessionId);
      this.#scheduleCleanup(entry);
      const idle = async () => {
        if (entry.runningPromise) await entry.runningPromise;
        if (entry.agent.agent.state.isStreaming) await entry.agent.agent.waitForIdle();
      };
      if (!signal) return idle();
      if (signal.aborted) throw Error('Aborted');
      return new Promise((resolve, reject) => {
        const onAbort = () => {
          signal.removeEventListener('abort', onAbort);
          reject(Error('Aborted'));
        };
        signal.addEventListener('abort', onAbort, {once: true});
        idle().then(() => {
          signal.removeEventListener('abort', onAbort);
          resolve();
        }, error => {
          signal.removeEventListener('abort', onAbort);
          reject(error);
        });
      });
    }
    async removeQueuedMessage(accountId, sessionId, id) { return (await this.getAgent(accountId, sessionId)).removeQueuedMessage(id); }
    async updateQueuedMessage(accountId, sessionId, id, message) { return (await this.getAgent(accountId, sessionId)).updateQueuedMessage(id, message); }
    async moveQueuedMessage(accountId, sessionId, id, position) { return (await this.getAgent(accountId, sessionId)).moveQueuedMessage(id, position); }
    /** Stops a loaded task and its running workers, workers first. */
    async #stopTree(accountId, sessionId, stop, {waitForRun = true} = {}) {
      const entry = this.#entry(accountId, sessionId);
      if (!entry) return false;
      for (const child of s.SessionStore.listByParentId(accountId, sessionId))
        if (child.status === 'running' || this.isRunning(accountId, child.id)) await this.#stopTree(accountId, child.id, stop, {waitForRun}).catch(() => {});
      await stop(entry.agent);
      if (waitForRun && entry.runningPromise) await entry.runningPromise;
      this.#scheduleCleanup(entry);
      return true;
    }
    async interrupt(accountId, sessionId) {
      return await this.#stopTree(accountId, sessionId, agent => agent.interrupt(), {waitForRun: false}) ? true : interruptStoredSession(s, accountId, sessionId);
    }
    async abort(accountId, sessionId) {
      return await this.#stopTree(accountId, sessionId, agent => agent.abort()) ? true : abortStoredSession(s, accountId, sessionId);
    }
    async appendMessage(accountId, sessionId, message) {
      const entry = this.#entry(accountId, sessionId);
      if (entry) {
        entry.agent.appendMessage(message);
        return;
      }
      await s.SessionStore.listAllMessageRows(accountId, sessionId);
      s.SessionStore.appendMessage(accountId, sessionId, message);
    }
    disposeSession(accountId, sessionId, options = {}) {
      const key = keyOf(accountId, sessionId), pending = this.#disposals.get(key);
      if (pending) return pending;
      const disposal = s.backgroundWriters().cleanup(() => this.#dispose(accountId, sessionId, options));
      this.#disposals.set(key, disposal);
      const forget = () => this.#disposals.delete(key);
      disposal.then(forget, forget);
      return disposal;
    }
    async #dispose(accountId, sessionId, options) {
      const key = keyOf(accountId, sessionId);
      await this.#loading.get(key)?.catch(() => undefined);
      const entry = this.#entries.get(key);
      if (!entry) return false;
      if (isBusy(entry)) {
        await entry.agent.abort().catch(() => {});
        await entry.runningPromise?.catch(() => {});
      }
      this.#entries.delete(key);
      this.#clearTimers(entry);
      entry.fanout.closeAll();
      await entry.agent.dispose(options);
      entry.unsubscribe();
      return true;
    }
    terminateExecSessions() { return {loaded: [...this.#entries.values()].map(entry => entry.agent.execSessions.terminateAll()), pendingSessionCreations: this.#loading.size}; }
    async disposeAll() { await Promise.all([...this.#entries.values()].map(entry => this.disposeSession(entry.accountId, entry.sessionId))); }
    /** Stops admitting work and settles everything under way; used at daemon shutdown. */
    auxCloseAdmissionAndDrain() {
      if (this.#drain) return this.#drain;
      this.#closing = true;
      this.#drain = (async () => {
        const errors = [];
        for (const entry of this.#entries.values()) {
          this.#clearTimers(entry);
          entry.fanout.closeAll();
        }
        do {
          const results = await Promise.allSettled([...this.#loading.values(), ...this.#resuming.values(), ...this.#recovering.values(), ...this.#disposals.values(),
            ...[...this.#entries.values()].map(entry => this.disposeSession(entry.accountId, entry.sessionId))]);
          for (const result of results) if (result.status === 'rejected') errors.push(result.reason);
        } while (this.#loading.size || this.#resuming.size || this.#recovering.size || this.#disposals.size || this.#entries.size);
        if (errors.length) throw new AggregateError(errors, 'Aux agent sessions did not settle');
      })();
      this.#drain.catch(() => {});
      return this.#drain;
    }
    /** The task's live entry, creating its agent once however many callers ask at the same time. */
    async #load(accountId, sessionId) {
      this.#assertOpen();
      assertCanStart(accountId, sessionId);
      const key = keyOf(accountId, sessionId), loaded = this.#entries.get(key);
      if (loaded) {
        this.#clearTimers(loaded);
        return loaded;
      }
      const loading = this.#loading.get(key);
      if (loading) return loading;
      const load = this.#createEntry(accountId, sessionId, key);
      this.#loading.set(key, load);
      try {
        return await load;
      } finally {
        this.#loading.delete(key);
      }
    }
    async #createEntry(accountId, sessionId, key) {
      const agent = await this.#createAgent(accountId, sessionId);
      let unsubscribe;
      try {
        this.#assertOpen();
        assertCanStart(accountId, sessionId);
        const entry = {sessionId, accountId, agent, fanout: new WebSocketFanout(this.#keepAliveMs), replayBuffer: new EventReplayBuffer(this.#eventBufferLimit), commandLedger: new CommandLedger,
          runState: {runId: null, seq: 0}, runAssistantMessage: undefined, runningPromise: null, cleanupTimer: null, cliDisconnectAbortTimer: null, unsubscribe: () => undefined};
        entry.unsubscribe = unsubscribe = agent.subscribe(event => this.#publish(entry, event));
        this.#entries.set(key, entry);
        return entry;
      } catch (error) {
        unsubscribe?.();
        try {
          await agent.dispose();
        } catch (cleanupError) {
          throw new AggregateError([error, cleanupError], 'Aux unpublished agent disposal failed');
        }
        throw error;
      }
    }
    #publish(entry, event) {
      const {session} = entry.agent;
      if (session.trigger?.type === 'v2-channel' && ['orchestrator', 'worker'].includes(session.harnessId ?? '')) s.EventBus.emit('channel:agent-event', {accountId: entry.accountId, sessionId: entry.sessionId, event});
      if (event.type === 'message_end' && event.message.role === 'assistant') entry.runAssistantMessage = event.message;
      if (!entry.runState.runId) entry.runState = {runId: crypto.randomUUID(), seq: 0};
      entry.runState.seq += 1;
      const encoded = s.encodeAgentSessionEvent({runId: entry.runState.runId, seq: entry.runState.seq, event}), payload = JSON.stringify(encoded);
      if (this.#replayToNewSubscribers && this.#eventBufferLimit > 0) entry.replayBuffer.append(encoded, payload);
      else entry.replayBuffer.clear();
      if (entry.fanout.broadcast(payload) > 0 || event.type === 'agent_end' || event.type === 'agent_error') this.#scheduleCleanup(entry);
    }
    /** Starts `run` on the task's agent and returns once it holds a run slot; the run itself goes on in the background. */
    async startRun(accountId, sessionId, run, options) {
      const owner = s.AccountRegistry.getAccount(accountId);
      let entry, attempt;
      try {
        attempt = s.captureAgentStartAttempt(accountId, sessionId);
        entry = await this.#load(accountId, sessionId);
      } catch (error) {
        s.reportAgentStartFailure(accountId, sessionId, owner, attempt, error);
      }
      assertCanStart(accountId, sessionId);
      const {projectId} = entry.agent.session, project = projectId ? s.ProjectStore.get(entry.accountId, projectId) : undefined;
      if (projectId && (!project || project.archivedAt)) throw Error(`Project is unavailable: ${projectId}`);
      if (isBusy(entry)) throw Error('Agent is already processing. Use steer() or queue() while streaming.');
      if (this.#runSlots.available <= 0) throw Error('Global run semaphore full. Too many concurrent agent runs.');
      const started = Promise.withResolvers();
      entry.runningPromise = started.promise;
      const abandon = error => {
        if (entry.runningPromise === started.promise) entry.runningPromise = null;
        started.resolve();
        throw error;
      };
      const slot = await this.#runSlots.acquire().catch(abandon);
      try {
        this.#assertOpen();
        assertCanStart(accountId, sessionId);
        this.#clearTimers(entry);
        entry.replayBuffer.clear();
        entry.runState = {runId: crypto.randomUUID(), seq: 0};
        entry.runAssistantMessage = undefined;
      } catch (error) {
        slot[Symbol.dispose]();
        abandon(error);
      }
      const running = s.backgroundWriters().run(() => this.#run(entry, run, options, slot, owner));
      entry.runningPromise = running;
      running.then(started.resolve, started.resolve);
    }
    async #run(entry, run, options, slot, owner) {
      const {accountId, sessionId} = entry, startedAt = Date.now(), initialMessageCount = entry.agent.agent.state.messages.length;
      const trigger = options?.trigger ?? (entry.agent.session.routineId ? 'routine' : 'user'), routineTrigger = options?.routineTrigger;
      let failed;
      capture(accountId, 'tasks.run.started', s.runStartProperties(entry.agent.session, trigger));
      if (routineTrigger) capture(accountId, 'routines.run.started', {trigger: routineTrigger});
      const pendingAttempt = s.captureAgentStartAttempt(accountId, sessionId);
      try {
        await entry.agent.refreshMcpTools();
        await s.runWithBoundChannelProjection(accountId, sessionId, entry.agent, () => run(entry.agent));
        const durationMs = Date.now() - startedAt;
        capture(accountId, 'tasks.run.completed', s.runCompletionProperties({messages: entry.agent.agent.state.messages, trigger, durationMs, initialMessageCount}));
        if (routineTrigger) capture(accountId, 'routines.run.completed', {trigger: routineTrigger, durationMs});
      } catch (error) {
        failed = error instanceof Error ? error.message : String(error);
        const durationMs = Date.now() - startedAt, errorMessage = s.errorMessage(error);
        capture(accountId, 'tasks.run.failed', {trigger, durationMs, errorMessage});
        if (routineTrigger) capture(accountId, 'routines.run.failed', {trigger: routineTrigger, durationMs, errorMessage});
        s.logger.error('[AgentSessionServer] Agent run failed', {sessionId, error: failed});
        if (entry.agent.session.status === 'running') await changeStatusWithRetry(entry, 'errored', 'runner_error');
        else s.markUnstartedRunError(entry, owner, pendingAttempt);
        this.#publish(entry, {type: 'agent_error', errorMessage: failed});
      } finally {
        slot[Symbol.dispose]();
        const status = failed ? 'errored' : entry.agent.session.status, last = entry.runAssistantMessage;
        await this.#reportRunEnd(entry.agent, status, status === 'errored' ? failed || last?.errorMessage || '' : last && (s.textContent(last) || last.errorMessage) || '');
        entry.runningPromise = null;
        entry.runState = {runId: null, seq: 0};
        entry.runAssistantMessage = undefined;
        if (!entry.agent.agent.state.isStreaming) this.#scheduleCleanup(entry);
      }
    }
    /** Moves queued messages ahead as a steer; they go back in the queue if that fails. */
    async #steerQueued(entry, message, interrupt, steeringMessage) {
      if (entry.runningPromise && !entry.agent.agent.state.isStreaming) await entry.runningPromise;
      const transfer = await entry.agent.takeQueuedMessagesForSend(message);
      if (!transfer) return;
      const {messages} = transfer;
      try {
        if (entry.agent.agent.state.isStreaming) {
          await (interrupt ? this.#interruptSteer(entry, messages, steeringMessage) : entry.agent.steer(messages, steeringMessage));
          return;
        }
        await this.startRun(entry.accountId, entry.sessionId, async agent => {
          try {
            await (interrupt ? agent.interruptSteer(messages, steeringMessage) : agent.steer(messages, steeringMessage));
          } catch (error) {
            transfer.restore();
            throw error;
          }
        });
      } catch (error) {
        transfer.restore();
        throw error;
      }
    }
    async #interruptSteer(entry, message, steeringMessage) {
      if (await entry.agent.interruptSteer(message, steeringMessage) === 'interrupted') await this.#interruptAndContinue(entry);
    }
    async #interruptAndContinue(entry) {
      if (entry.agent.agent.state.isStreaming) await entry.agent.abortForSteering();
      if (entry.runningPromise) await entry.runningPromise;
      await this.startRun(entry.accountId, entry.sessionId, agent => agent.continue());
    }
    #detach(entry, socket) {
      entry.fanout.detach(socket);
      if (entry.fanout.size === 0) {
        const session = s.SessionStore.get(entry.accountId, entry.sessionId);
        if (session && s.isCliSession(session) && (session.status === 'running' || session.status === 'suspended')) this.#scheduleCliAbort(entry);
        if (session?.ephemeral && !session.archivedAt) s.SessionStore.touch(entry.accountId, entry.sessionId);
      }
      this.#scheduleCleanup(entry);
    }
    #clearTimers(entry) {
      clearTimer(entry, 'cleanupTimer');
      clearTimer(entry, 'cliDisconnectAbortTimer');
    }
    /** A CLI that went away leaves no one to answer its suspended task. */
    #scheduleCliAbort(entry) {
      clearTimer(entry, 'cliDisconnectAbortTimer');
      entry.cliDisconnectAbortTimer = setTimeout(() => {
        entry.cliDisconnectAbortTimer = null;
        if (entry.fanout.size > 0) return;
        const session = s.SessionStore.get(entry.accountId, entry.sessionId);
        if (session && s.isCliSession(session) && session.status === 'suspended') this.abort(entry.accountId, entry.sessionId);
      }, CLI_DISCONNECT_ABORT_DEBOUNCE_MS);
    }
    /** Disposes an entry with no sockets and no run once it has been idle for the TTL. */
    #scheduleCleanup(entry) {
      if (this.#closing) return void this.#clearTimers(entry);
      const unused = () => !(entry.fanout.size > 0 || isBusy(entry)), dispose = () => this.disposeSession(entry.accountId, entry.sessionId, {closeOwnedTabs: false});
      clearTimer(entry, 'cleanupTimer');
      if (!unused()) return undefined;
      if (this.#idleTtlMs <= 0) return void dispose();
      entry.cleanupTimer = setTimeout(() => {
        entry.cleanupTimer = null;
        if (unused()) dispose();
      }, this.#idleTtlMs);
      return undefined;
    }
  };
}
