/** The routine store and its scheduler: the `routines` table, routines on this device only. A
 * standalone routine owns a task that holds its prompt and runs; a child routine runs in a parent
 * task. The scheduler checks every 30 seconds for routines due on this device and runs each once,
 * moving it to its next time first. The recurrence rules, the run itself, routine memory and cloud
 * routine sync stay the supplied ones; queries use the supplied query builder and table. */

/** The device id routines here run on; a routine bound elsewhere (or to the cloud) is refused. */
export function requireCurrentDeviceRoutine(settings, accountId, routine) {
  const deviceId = settings(accountId).get('routineDeviceId');
  if (typeof deviceId !== 'string' || !deviceId.trim()) throw Error('Local scheduling device is not initialized.');
  if (routine && (routine.environment !== 'device' || routine.deviceId !== deviceId)) throw Error('Only routines on this computer are available. Cloud routines are preserved and unavailable.');
  return deviceId;
}

export function create({stateDb, stores: {routines: r}}) {
  const {RoutineTable: routines, SessionTable: sessions} = r.tables;
  const {eq, and, isNull, desc, inArray, lte} = r.operators;
  const timezone = accountId => r.settings(accountId).get('timezone') ?? 'UTC';
  const requireDevice = (accountId, routine) => requireCurrentDeviceRoutine(r.settings, accountId, routine);
  const fromRow = row => r.routineSchema.parse({...row, nextRunAt: row.nextRunAt ? new Date(row.nextRunAt) : null});
  const changed = (accountId, routineId) => r.EventBus.emit('routine:changed', {accountId, routineId});

  const listRoutines = (accountId, options = {}) => {
    const conditions = [];
    if (!options.includeDeleted) conditions.push(isNull(routines.deletedAt));
    if (options.projectId !== undefined) conditions.push(options.projectId === null ? isNull(routines.projectId) : eq(routines.projectId, options.projectId));
    if (options.parentSessionId) conditions.push(eq(routines.parentSessionId, options.parentSessionId));
    if (options.type) conditions.push(eq(routines.type, options.type));
    return stateDb(accountId).select().from(routines).where(and(...conditions)).orderBy(desc(routines.createdAt)).all().map(fromRow);
  };
  const getRoutine = (accountId, routineId, scope) => {
    const row = stateDb(accountId).select().from(routines).where(eq(routines.id, routineId)).get();
    if (!row || scope?.projectId !== undefined && row.projectId !== scope.projectId) return undefined;
    return fromRow(row);
  };
  /** With payments off there is no plan limit; the supplied free-plan limit is kept for when there is. */
  const assertCapacity = accountId => {
    if (!r.launchPolicy.paymentsEnabled) return;
    if ((r.AccountRegistry.getAccount(accountId)?.subscriptionPlan ?? 'free') === 'free' && listRoutines(accountId).filter(routine => routine.status === 'active').length >= 3)
      throw Error('Free plan can run up to 3 active routines. Pause a routine or upgrade.');
  };
  /** Drops the routine's pending notifications from its parent task and stops its running tasks. */
  const stopRoutineRuns = async (accountId, routineId) => {
    const routine = getRoutine(accountId, routineId);
    if (routine?.parentSessionId) {
      const parent = r.SessionStore.get(accountId, routine.parentSessionId), agent = r.GlobalAgentSessionServer.getLoadedAgent(accountId, routine.parentSessionId);
      if (agent) agent.discardRoutineNotifications(routineId);
      else if (parent) {
        const kept = parent.queuedMessages.filter(message => message.role !== 'system-message' || message.kind !== 'routine_notification' || message.metadata.routineId !== routineId);
        if (kept.length !== parent.queuedMessages.length) r.SessionStore.update(accountId, parent.id, {queuedMessages: kept});
      }
    }
    const running = stateDb(accountId).select({id: sessions.id}).from(sessions).where(and(eq(sessions.routineId, routineId), inArray(sessions.status, ['running', 'suspended']))).all();
    await Promise.all(running.map(session => r.GlobalAgentSessionServer.abort(accountId, session.id)));
  };

  const createRoutine = async (accountId, input) => {
    if (input.environment !== undefined && input.environment !== 'device') throw Error('Only device routines are available. Cloud routines are preserved.');
    if (r.isSyncEnabled(accountId)) await r.syncRoutines(accountId);
    if (!input.name.trim() || !input.prompt.trim()) throw Error('name and prompt are required.');
    const deviceId = requireDevice(accountId);
    const now = new Date(), rrule = r.normalizeRRule(input.rrule, now, timezone(accountId)), next = r.getNextRunAt(rrule, now, {timezone: timezone(accountId)});
    const status = input.status === 'paused' ? 'paused' : next ? 'active' : 'completed';
    if (status === 'active') assertCapacity(accountId);
    const type = input.type ?? 'standalone';
    let task = input.parentSessionId ? r.SessionStore.get(accountId, input.parentSessionId) : undefined;
    if (input.parentSessionId && (!task || task.archivedAt)) throw Error('Parent task is unavailable.');
    if (type === 'child' && !task) throw Error('Child routines require a parent task.');
    const id = r.nanoid();
    if (type === 'standalone') {
      task = await r.createSession(accountId, {title: input.name, projectId: input.projectId, browserBinding: input.browserBinding, ...input.sessionConfig,
        trigger: {type: 'standalone-routine', routineId: id}});
      await r.SessionStore.startLatestTurn(accountId, task.id, now);
      r.SessionStore.appendMessage(accountId, task.id, {role: 'user', content: input.prompt, timestamp: now.getTime()});
      r.SessionStore.finalizeLatestTurn(accountId, task.id, now);
    }
    requireDevice(accountId, {environment: 'device', deviceId});
    stateDb(accountId).insert(routines).values({id, name: input.name, prompt: input.prompt, rrule, type, environment: 'device', deviceId, parentSessionId: task?.id ?? null,
      projectId: task?.projectId ?? input.projectId ?? null, channelId: null, status, nextRunAt: status === 'active' ? next?.toISOString() : null,
      sessionConfig: task ? {model: task.model, harnessId: task.harnessId, permissionMode: task.permissionMode, ...input.sessionConfig} : input.sessionConfig ?? {},
      metadata: input.metadata ?? {origin: {type: 'user'}}, createdAt: now, updatedAt: now, pausedAt: status === 'paused' ? now : null, deletedAt: null}).run();
    const created = getRoutine(accountId, id);
    changed(accountId, id);
    await r.ensureRoutineMemory(accountId, created);
    if (r.isSyncEnabled(accountId)) await r.syncRoutines(accountId);
    r.notifyAgentFileChange(accountId);
    return getRoutine(accountId, id);
  };

  /** A synced routine changes through the server; a local one here. A new rule or resuming
   * reschedules it; a rule with no next time completes it. */
  const updateRoutine = async (accountId, routineId, changes) => {
    const routine = getRoutine(accountId, routineId);
    if (!routine || routine.status === 'deleted') throw Error('Routine not found.');
    requireDevice(accountId, routine);
    if (routine.revision) return r.updateServerRoutine(accountId, routineId, changes.revision ?? routine.revision, changes);
    const now = new Date(), rrule = changes.rrule === undefined ? routine.rrule : r.normalizeRRule(changes.rrule, now, timezone(accountId));
    let status = changes.status ?? routine.status;
    if (changes.rrule !== undefined && status === 'completed') status = 'active';
    let next = status === 'active' ? routine.nextRunAt : null;
    if (status === 'active' && (changes.rrule !== undefined || changes.status === 'active')) next = r.getNextRunAt(rrule, now, {timezone: timezone(accountId)});
    if (status === 'active' && !next) status = 'completed';
    if (status === 'active' && routine.status !== 'active') assertCapacity(accountId);
    stateDb(accountId).update(routines).set({...changes, ...changes.sessionConfig ? {sessionConfig: {...routine.sessionConfig, ...changes.sessionConfig}} : {}, rrule, status,
      nextRunAt: next?.toISOString() ?? null, pausedAt: status === 'paused' ? routine.pausedAt ?? now : null, updatedAt: now}).where(eq(routines.id, routineId)).run();
    changed(accountId, routineId);
    if (status === 'paused') await stopRoutineRuns(accountId, routineId);
    if (routine.type === 'standalone' && routine.parentSessionId && changes.name) r.SessionStore.update(accountId, routine.parentSessionId, {title: changes.name});
    r.notifyAgentFileChange(accountId);
    return getRoutine(accountId, routineId);
  };

  const deleteRoutine = async (accountId, routineId) => {
    const routine = getRoutine(accountId, routineId);
    if (!routine) throw Error('Routine not found.');
    requireDevice(accountId, routine);
    if (routine.revision) {
      await r.updateServerRoutine(accountId, routineId, routine.revision, {status: 'deleted'});
      return;
    }
    stateDb(accountId).update(routines).set({status: 'deleted', deletedAt: new Date(), nextRunAt: null, updatedAt: new Date()}).where(eq(routines.id, routineId)).run();
    changed(accountId, routineId);
    await stopRoutineRuns(accountId, routineId);
    r.notifyAgentFileChange(accountId);
  };

  const listDueRoutines = (accountId, at) => {
    const deviceId = r.settings(accountId).get('routineDeviceId');
    if (!deviceId) return [];
    return stateDb(accountId).select().from(routines).where(and(eq(routines.status, 'active'), eq(routines.environment, 'device'), eq(routines.deviceId, deviceId),
      lte(routines.nextRunAt, at.toISOString()))).all().map(fromRow);
  };
  /** Runs a due routine once, if it is still active here and its parent task is still open. */
  const runDueRoutine = async (accountId, due, at) => {
    const current = getRoutine(accountId, due.id);
    if (current?.status !== 'active' || current.environment !== 'device' || !current.deviceId || current.deviceId !== r.settings(accountId).get('routineDeviceId')) return;
    if (due.parentSessionId) {
      const parent = r.SessionStore.get(accountId, due.parentSessionId);
      if (!parent || parent.archivedAt) return;
    }
    const next = r.getNextRunAt(due.rrule, at, {timezone: timezone(accountId)});
    stateDb(accountId).update(routines).set({nextRunAt: next?.toISOString() ?? null, status: next ? 'active' : 'completed', updatedAt: at}).where(eq(routines.id, due.id)).run();
    changed(accountId, due.id);
    await r.runRoutine(accountId, due, due.nextRunAt.toISOString(), 'scheduled');
  };

  let started = false, checking = false;
  /** Once per daemon: archiving a parent stops its routines' runs, deleting it deletes them, and due routines run. */
  const startRoutineScheduler = () => {
    if (started) return;
    started = true;
    r.auxManagedEvent(r.EventBus, 'session:updated', async ({data: {accountId, sessionId, session}}) => {
      if (session.archivedAt) for (const routine of listRoutines(accountId, {parentSessionId: sessionId})) await stopRoutineRuns(accountId, routine.id);
    });
    r.auxManagedEvent(r.EventBus, 'session:deleted', async ({data: {accountId, sessionId}}) => {
      for (const routine of listRoutines(accountId, {parentSessionId: sessionId})) await deleteRoutine(accountId, routine.id).catch(async error => {
        await stopRoutineRuns(accountId, routine.id);
        r.logger.warn('[RoutineScheduler] Parent deletion will sync on reconnect', {routineId: routine.id, error});
      });
    });
    r.auxManagedInterval(() => {
      if (checking) return checking;
      checking = true;
      return (async () => {
        for (const account of r.AccountRegistry.getAll().accounts) {
          const now = new Date();
          for (const due of listDueRoutines(account.id, now)) {
            try {
              await runDueRoutine(account.id, due, now);
            } catch (error) {
              r.logger.warn('[RoutineScheduler] Run failed', {accountId: account.id, routineId: due.id, error});
            }
          }
        }
      })().catch(error => r.logger.warn('[RoutineScheduler] Check failed', {error})).finally(() => { checking = false; });
    }, 3e4);
  };

  return {
    listRoutines, getRoutine, assertCapacity, stopRoutineRuns, createRoutine, updateRoutine, deleteRoutine, listDueRoutines, runDueRoutine, startRoutineScheduler,
    getRoutineDetail(accountId, routineId) {
      const routine = getRoutine(accountId, routineId);
      return routine ? {...routine, runs: r.SessionStore.listPreviewItems(accountId, {routineId, parent: 'all', limit: 50, pinnedFirst: false})} : undefined;
    },
    getRoutineSummary(accountId, routineId) {
      const routine = getRoutine(accountId, routineId);
      if (!routine || routine.status === 'deleted') return undefined;
      const last = stateDb(accountId).select({createdAt: sessions.createdAt}).from(sessions).where(eq(sessions.routineId, routineId)).orderBy(desc(sessions.createdAt)).limit(1).get();
      return {...routine, lastRunAt: last?.createdAt ?? null,
        isCurrentDevice: routine.environment === 'device' && !!routine.deviceId && routine.deviceId === r.settings(accountId).get('routineDeviceId')};
    },
  };
}
