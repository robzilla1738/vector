/** The task store: the `sessions` table and its turns (`session_turns`, the memory extraction rows
 * and the tabs a task borrows), with each task's transcript in the transcript store. A turn is the
 * span of transcript between a `turn-lifecycle` start and finish; turn rows are a projection of the
 * transcript, rebuilt from it when a transcript is rewritten. Writes a signed-in account backs up
 * are queued for its cloud backup (Aux's edit), as the supplied store did.
 *
 * Queries go through the supplied query builder and table definitions, so column encodings (JSON,
 * timestamps, booleans) and the SQLite schema stay the supplied ones. */
import {rmSync} from 'node:fs';

/** `null` → `undefined`, through plain objects and arrays, in place. */
function nullToUndefined(value) {
  if (value == null) return undefined;
  if (value.constructor.name === 'Object' || Array.isArray(value)) for (const key in value) value[key] = nullToUndefined(value[key]);
  return value;
}

export function create({stateDb, stores: {sessions: b}}) {
  const {SessionTable: sessions, SessionTurnTable: turns} = b.tables;
  const {eq, and, or, isNull, isNotNull, inArray, sql, desc, lt, gte} = b.operators;
  const transcript = accountId => b.sessionMessageStore(accountId);
  const emitUpdated = (accountId, session) => b.EventBus.emit('session:updated', {accountId, sessionId: session.id, session});
  const purgeLease = (accountId, sessionId) => b.purgeLeaseKey(accountId, sessionId);

  const fromRow = row => {
    const session = {...nullToUndefined({...row}), projectId: row.projectId};
    return {...session, contextWindow: {usedTokens: session.contextWindow?.usedTokens ?? b.defaultContextWindow.usedTokens,
      totalTokens: session.contextWindow?.totalTokens ?? b.defaultContextWindow.totalTokens},
    queuedMessages: session.queuedMessages ?? [], steeringMessages: session.steeringMessages ?? []};
  };
  const listItemFromRow = row => ({...nullToUndefined({...row}), projectId: row.projectId});
  const runFromRow = row => nullToUndefined(row);

  /** The list filters every listing shares; defaults leave out routines, children, archived and ephemeral tasks. */
  const filters = options => {
    const conditions = [];
    if (options?.projectId !== undefined) conditions.push(options.projectId === null ? isNull(sessions.projectId) : eq(sessions.projectId, options.projectId));
    if (options?.routineId) conditions.push(eq(sessions.routineId, options.routineId));
    else if (options?.routines !== 'include') conditions.push(isNull(sessions.routineId));
    if (!options?.routineId && (options?.parent ?? 'root') === 'root') conditions.push(isNull(sessions.parentId));
    if (options?.coders === 'exclude') conditions.push(sql`coalesce(json_extract(${sessions.trigger}, '$.type'), '') != 'agent'`);
    if (options?.standaloneRoutines === 'only') conditions.push(sql`json_extract(${sessions.trigger}, '$.type') = 'standalone-routine'`);
    else if (options?.standaloneRoutines === 'exclude') conditions.push(sql`coalesce(json_extract(${sessions.trigger}, '$.type'), '') != 'standalone-routine'`);
    if ((options?.archived ?? 'exclude') === 'exclude') conditions.push(isNull(sessions.archivedAt));
    else if (options?.archived === 'only') conditions.push(isNotNull(sessions.archivedAt));
    if (options?.pinned === 'only') conditions.push(isNotNull(sessions.pinnedAt));
    else if (options?.pinned === 'exclude') conditions.push(isNull(sessions.pinnedAt));
    if ((options?.ephemeral ?? 'exclude') === 'exclude') conditions.push(eq(sessions.ephemeral, false));
    else if (options?.ephemeral === 'only') conditions.push(eq(sessions.ephemeral, true));
    if (options?.statuses?.length) conditions.push(inArray(sessions.status, options.statuses));
    return conditions;
  };
  const page = (query, options) => {
    if (options?.cursor !== undefined) query.offset(options.cursor);
    if (options?.limit !== undefined) query.limit(options.limit);
    return query.all();
  };
  const rebuildTurns = (database, sessionId, rows) => {
    database.delete(turns).where(eq(turns.sessionId, sessionId)).run();
    const inserts = b.buildSessionTurnInserts(sessionId, rows);
    if (inserts.length > 0) database.insert(turns).values(inserts).run();
  };
  const bumpRevision = (database, sessionId) =>
    database.update(sessions).set({transcriptRevision: sql`${sessions.transcriptRevision} + 1`}).where(eq(sessions.id, sessionId)).run();
  const revisionOf = (database, sessionId) => database.select({revision: sessions.transcriptRevision}).from(sessions).where(eq(sessions.id, sessionId)).get();

  const get = (accountId, sessionId) => {
    const row = stateDb(accountId).select().from(sessions).where(eq(sessions.id, sessionId)).get();
    return row ? fromRow(row) : undefined;
  };
  const requireSession = (accountId, sessionId) => {
    const session = get(accountId, sessionId);
    if (!session) throw Error(`Session not found: ${sessionId}`);
    return session;
  };
  const assertNotPurging = (session, sessionId) => {
    if (b.isEphemeralPurgePending(session)) throw Error(`Session is pending purge: ${sessionId}`);
  };

  /** A new task. A child inherits its parent's Project, working directory, harness and ephemerality;
   * its permissions start from the mode's and the account's. */
  const insert = (accountId, options) => {
    const database = stateDb(accountId), id = b.sessionIdSchema.parse(options.id ?? b.nanoid()), createdAt = options.createdAt ?? new Date();
    const parent = options.parentId ? get(accountId, options.parentId) : undefined;
    if (options.parentId && !parent) throw Error(`Parent session not found: ${options.parentId}`);
    const projectId = parent ? parent.projectId : options.projectId ?? null;
    if (options.projectId !== undefined && parent && options.projectId !== parent.projectId)
      throw Error(`Project ${options.projectId} does not match parent Project ${parent.projectId}`);
    const project = projectId ? b.ProjectStore.require(accountId, projectId) : undefined;
    if (project?.archivedAt) throw Error(`Project is archived: ${projectId}`);
    if (b.findSessionStorageDirById(accountId, id)) throw Error(`Session storage already exists for id: ${id}`);
    const taskRoot = b.getAccountTaskRoot(accountId), directory = b.ensureSessionDir({id, createdAt}, accountId);
    const cwd = parent?.cwd ?? options.cwd ?? project?.workspacePath ?? taskRoot;
    const runtimeConfig = b.sessionRuntimeConfigSchema.parse(options.runtimeConfig ?? parent?.runtimeConfig ?? {});
    const permissionMode = options.permissionMode ?? parent?.permissionMode ?? b.settings(accountId).get('defaultPermissionMode');
    const modePermission = b.mergePermissionConfig(b.permissionForMode(permissionMode, cwd, b.getSessionTaskDir({id}, accountId), taskRoot, runtimeConfig.workingDirs),
      b.settings(accountId).get('permission'));
    const permission = options.permissionMode === undefined && options.permission !== undefined ? options.permission : b.mergePermissionConfig(modePermission, options.permission);
    try {
      database.insert(sessions).values({id, projectId, harnessId: (options.routineId ? undefined : parent?.harnessId) ?? options.harnessId ?? 'v1',
        systemPrompt: options.systemPrompt, parentId: options.parentId ?? null, branchedFrom: options.branchedFrom ?? null, title: options.title ?? 'New Session',
        trigger: options.trigger ?? null, triggerIdempotencyKey: options.triggerIdempotencyKey ?? null, routineId: options.routineId ?? null,
        channelRouteKey: options.channelRouteKey ?? null, status: options.status ?? 'idle', model: options.model, permissionMode, permission,
        contextWindow: options.contextWindow ?? {usedTokens: 0, totalTokens: 0}, queuedMessages: options.queuedMessages ?? [], steeringMessages: options.steeringMessages ?? [],
        cwd, toolState: options.toolState ?? b.createDefaultToolState(cwd), activeTabTargetId: options.activeTabTargetId ?? null, browserBinding: options.browserBinding ?? null,
        incognito: options.incognito ?? false, ephemeral: options.ephemeral ?? parent?.ephemeral ?? options.incognito ?? false, runtimeConfig,
        readAt: options.readAt ?? options.updatedAt ?? createdAt, createdAt, updatedAt: options.updatedAt ?? createdAt}).run();
    } catch (error) {
      rmSync(directory, {recursive: true, force: true});
      throw error;
    }
    if (projectId) b.ProjectStore.touchLastActive(accountId, projectId, createdAt);
    const session = get(accountId, id);
    b.EventBus.emit('session:created', {accountId, sessionId: id, session});
    if (session.routineId) b.EventBus.emit('routine:changed', {accountId, routineId: session.routineId});
    return session;
  };

  /** Appends to the transcript; the open turn and the task's update time follow. */
  const appendMessage = (accountId, sessionId, message) => {
    const database = stateDb(accountId), session = requireSession(accountId, sessionId);
    assertNotPurging(session, sessionId);
    const id = transcript(accountId).append(session, message), row = {id, jsonlReadSize: Buffer.byteLength(`${JSON.stringify(message)}\n`), msg: message};
    if (message.role === 'compaction') database.update(sessions).set({latestCompactionMessageOffset: Number(id)}).where(eq(sessions.id, sessionId)).run();
    b.updateOpenSessionTurnForNewMessage(database, sessionId, row);
    b.EventBus.emit('message:added', {accountId, sessionId, messageId: id, messageRole: message.role});
    touch(accountId, sessionId);
  };

  const getLatestTurn = (accountId, sessionId) => {
    const row = stateDb(accountId).select().from(turns).where(eq(turns.sessionId, sessionId)).orderBy(desc(turns.id)).limit(1).get();
    return row ? runFromRow(row) : undefined;
  };
  const finalizeLatestTurn = (accountId, sessionId, at = new Date(), filesChanged) => {
    const latest = stateDb(accountId).select({id: turns.id, turnId: turns.turnId, finishedAt: turns.finishedAt}).from(turns)
      .where(eq(turns.sessionId, sessionId)).orderBy(desc(turns.id)).limit(1).get();
    if (!latest || latest.finishedAt) return;
    appendMessage(accountId, sessionId, {role: 'turn-lifecycle', event: 'finished', turnId: latest.turnId, timestamp: at.getTime()});
    stateDb(accountId).update(turns).set({finishedAt: at, ...filesChanged ? {filesChanged} : {}}).where(eq(turns.id, latest.id)).run();
  };
  /** Starts a turn, finishing an open one first, unless an open one is being resumed. */
  const startLatestTurn = async (accountId, sessionId, at = new Date(), options = {}) => {
    const session = requireSession(accountId, sessionId);
    assertNotPurging(session, sessionId);
    const latest = getLatestTurn(accountId, sessionId), open = latest && !latest.finishedAt;
    if (open && options.resume) return;
    if (open) finalizeLatestTurn(accountId, sessionId, at);
    appendMessage(accountId, sessionId, {role: 'turn-lifecycle', event: 'started', turnId: crypto.randomUUID(), timestamp: at.getTime()});
  };

  const update = (accountId, sessionId, changes) => {
    const session = requireSession(accountId, sessionId);
    if (b.isEphemeralPurgePending(session) && changes.status && b.hasLiveTodoState(changes.status)) throw Error(`Session is pending purge: ${sessionId}`);
    const status = changes.status ?? session.status;
    // An ephemeral task's update time moves only when it stops having live work, so purge can find it.
    const touchesEphemeral = (changes.ephemeral ?? session.ephemeral) && !b.hasLiveTodoState(status)
      && (changes.status !== undefined && session.status !== status || changes.ephemeral === true && session.ephemeral === false);
    let applied = changes;
    if (changes.status && changes.status !== session.status) {
      const toolState = changes.toolState ?? session.toolState;
      const tracked = b.trackExecutionStatusChange(toolState, {wasRunning: session.status === 'running', isRunning: changes.status === 'running'});
      if (tracked !== toolState) applied = {...changes, toolState: tracked};
    }
    stateDb(accountId).update(sessions).set({...applied, ...touchesEphemeral ? {updatedAt: new Date()} : {}}).where(eq(sessions.id, sessionId)).run();
    const updated = get(accountId, sessionId);
    b.EventBus.emit('session:updated', {accountId, sessionId, session: updated});
    if (applied.status && session.status !== applied.status) b.EventBus.emit('session:status-changed', {accountId, sessionId, from: session.status, to: applied.status});
  };

  const touch = (accountId, sessionId) => {
    stateDb(accountId).update(sessions).set({updatedAt: new Date()}).where(eq(sessions.id, sessionId)).run();
    const session = get(accountId, sessionId);
    if (session) emitUpdated(accountId, session);
  };

  const listFull = (accountId, options) => page(stateDb(accountId).select().from(sessions).where(and(...filters(options)))
    .orderBy((options?.order ?? 'desc') === 'asc' ? sessions.updatedAt : desc(sessions.updatedAt)).$dynamic(), options).map(fromRow);

  /** A copy of the task up to an assistant message, with the tabs it borrowed and a note of where it came from. */
  const branch = async (accountId, {sessionId, messageId}) => {
    const database = stateDb(accountId), source = get(accountId, sessionId);
    if (!source) throw Error(`Session not found: ${sessionId}`);
    const rows = await transcript(accountId).listRows(source), index = rows.findIndex(row => row.id === messageId);
    if (index === -1) throw Error(`Message not found in session ${sessionId}: ${messageId}`);
    const at = rows[index];
    if (at.msg.role !== 'assistant') throw Error(`Message ${messageId} is not an assistant message.`);
    const tabs = database.select().from(b.tables.SessionTabTable).where(eq(b.tables.SessionTabTable.sessionId, source.id)).all()
      .filter(tab => tab.ownership === 'borrowed' || tab.targetId === source.activeTabTargetId);
    const activeTabTargetId = tabs.some(tab => tab.targetId === source.activeTabTargetId) ? source.activeTabTargetId : undefined;
    const copy = insert(accountId, {projectId: source.projectId, harnessId: source.harnessId, systemPrompt: source.systemPrompt, branchedFrom: source.id,
      trigger: {type: 'user', source: 'branch'}, title: source.title, model: source.model, cwd: source.cwd, permissionMode: source.permissionMode,
      permission: source.permission, runtimeConfig: source.runtimeConfig, contextWindow: source.contextWindow, activeTabTargetId, browserBinding: source.browserBinding,
      incognito: source.incognito, ephemeral: source.ephemeral});
    if (source.permission) {
      database.update(sessions).set({permission: source.permission}).where(eq(sessions.id, copy.id)).run();
      copy.permission = source.permission;
    }
    if (tabs.length > 0) {
      const now = new Date();
      database.insert(b.tables.SessionTabTable).values(tabs.map(tab => ({id: b.nanoid(), sessionId: copy.id, ownership: 'borrowed', source: tab.source,
        targetId: tab.targetId, url: tab.url, data: tab.data, createdAt: now, updatedAt: now}))).run();
      b.EventBus.emit('session:tabs-updated', {accountId, sessionId: copy.id});
    }
    let compactionOffset = 0, openTurn;
    const offsets = new Map();
    for (const row of rows.slice(0, index + 1)) {
      const message = row.msg.role === 'compaction' && typeof row.msg.firstKeptEntryId === 'string'
        ? {...row.msg, firstKeptEntryId: offsets.get(row.msg.firstKeptEntryId) ?? row.msg.firstKeptEntryId} : row.msg;
      const id = transcript(accountId).append(copy, message);
      offsets.set(row.id, id);
      if (row.msg.role === 'compaction') compactionOffset = Number(id);
      if (row.msg.role === 'turn-lifecycle') {
        if (row.msg.event === 'started') openTurn = row.msg.turnId;
        if (row.msg.event === 'finished') openTurn = undefined;
      }
    }
    if (openTurn) transcript(accountId).append(copy, {role: 'turn-lifecycle', event: 'finished', turnId: openTurn, timestamp: at.msg.timestamp});
    if (compactionOffset > 0) stateDb(accountId).update(sessions).set({latestCompactionMessageOffset: compactionOffset}).where(eq(sessions.id, copy.id)).run();
    const note = {role: 'session-branch', parentSession: {id: source.id, title: source.title}, timestamp: Date.now()}, noteId = transcript(accountId).append(copy, note);
    b.EventBus.emit('message:added', {accountId, sessionId: copy.id, messageId: noteId, messageRole: note.role});
    const copied = await transcript(accountId).listRows(copy);
    database.delete(turns).where(eq(turns.sessionId, copy.id)).run();
    const inserts = b.buildSessionTurnInserts(copy.id, copied);
    if (inserts.length > 0) stateDb(accountId).insert(turns).values(inserts).run();
    return copy;
  };

  /** Replaces a user message: the transcript is cut at its turn, and the message (with its metadata) is sent again. */
  const editUserMessage = async (accountId, {sessionId, messageId, content}) => {
    const session = requireSession(accountId, sessionId);
    const rows = await transcript(accountId).listRows(session), edited = rows.find(row => row.id === messageId);
    if (!edited || edited.msg.role !== 'user') throw Error(`Message ${messageId} is not an editable user message.`);
    const database = stateDb(accountId), offset = Number(edited.id);
    const turnOf = list => list.find(turn => offset >= turn.jsonlReadOffset && offset < turn.jsonlReadOffset + turn.jsonlReadSize);
    let turn = turnOf(database.select().from(turns).where(eq(turns.sessionId, sessionId)).all());
    if (!turn) {
      rebuildTurns(database, sessionId, rows);
      turn = turnOf(database.select().from(turns).where(eq(turns.sessionId, sessionId)).all());
    }
    if (!turn) throw Error(`Run not found for message ${messageId}.`);
    const kept = rows.filter(row => Number(row.id) < turn.jsonlReadOffset);
    const metadata = rows.filter(row => Number(row.id) >= turn.jsonlReadOffset && Number(row.id) < offset && row.msg.role === 'user-message-metadata');
    bumpRevision(database, sessionId);
    await transcript(accountId).rewrite(session, kept);
    b.updateLatestCompactionOffset(accountId, sessionId, kept);
    database.transaction(tx => {
      const extractions = b.tables.SessionTurnMemoryExtractionTable;
      tx.delete(extractions).where(and(eq(extractions.sessionId, sessionId), gte(extractions.jsonlReadOffset, turn.jsonlReadOffset))).run();
      tx.delete(turns).where(and(eq(turns.sessionId, sessionId), gte(turns.id, turn.id))).run();
      const last = tx.select().from(turns).where(eq(turns.sessionId, sessionId)).orderBy(desc(turns.id)).limit(1).get();
      if (last && !last.finishedAt && last.jsonlReadSize > 0) tx.update(turns).set({finishedAt: last.lastMessageTimestamp}).where(eq(turns.id, last.id)).run();
    });
    await startLatestTurn(accountId, sessionId);
    for (const row of metadata) appendMessage(accountId, sessionId, row.msg);
    appendMessage(accountId, sessionId, {...edited.msg, content, timestamp: Date.now()});
    return get(accountId, sessionId);
  };

  const clearMessages = async (accountId, sessionId) => {
    const session = requireSession(accountId, sessionId), database = stateDb(accountId);
    bumpRevision(stateDb(accountId), sessionId);
    await transcript(accountId).rewrite(session, []);
    database.transaction(tx => {
      tx.delete(b.tables.SessionTurnMemoryExtractionTable).where(eq(b.tables.SessionTurnMemoryExtractionTable.sessionId, sessionId)).run();
      tx.delete(turns).where(eq(turns.sessionId, sessionId)).run();
      tx.update(sessions).set({contextWindow: b.defaultContextWindow, latestCompactionMessageOffset: 0, queuedMessages: [], steeringMessages: [],
        toolState: b.createDefaultToolState(session.cwd), updatedAt: new Date()}).where(eq(sessions.id, sessionId)).run();
    });
    const cleared = get(accountId, sessionId);
    b.EventBus.emit('session:updated', {accountId, sessionId, session: cleared});
    return cleared;
  };

  const previewItem = ({session: row, latestRun, routine, channelName}) => {
    const {pinnedAt, ...session} = listItemFromRow(row);
    const run = latestRun ? runFromRow(latestRun) : {id: 0, turnId: `empty:${session.id}`, bodyVersion: 0, hasBody: false, steeringMessages: [], trailingMessages: [],
      sessionId: session.id, userMessage: [], filesChanged: [], tokenUsage: b.createDefaultTokenUsage(), startedAt: session.createdAt, lastMessageTimestamp: session.createdAt,
      jsonlReadOffset: 0, jsonlReadSize: 0, resumeAttempts: 0};
    const {startedAt, lastMessageTimestamp, finishedAt, abortedAt, finalStartedAt, ...rest} = run;
    const runView = {...rest, startedAt: startedAt.toISOString(), finalStartedAt: finalStartedAt?.toISOString(), ...finishedAt ? {finishedAt: finishedAt.toISOString()} : {},
      ...abortedAt ? {abortedAt: abortedAt.toISOString()} : {}};
    const previewText = session.suspension?.kind === 'ask-user-question' ? session.suspension.request.questions[0]?.question
      : session.suspension?.kind === 'action-confirmation' ? session.suspension.request.message : b.textContent(run.finalAssistantMessage?.at(-1) ?? {content: []});
    return {...session, readAt: session.readAt.toISOString(), createdAt: session.createdAt.toISOString(), updatedAt: session.updatedAt.toISOString(),
      unread: session.status === 'idle' && b.isSessionUnread(session), pinned: pinnedAt !== undefined, activeTabTargetId: row.activeTabTargetId ?? undefined, cwd: row.cwd,
      latestRun: runView, previewText, routine: routine ? {id: routine.id, name: routine.name, scheduleLabel: b.formatRoutineSchedule(routine)} : undefined,
      channel: channelName ? {name: channelName} : undefined};
  };
  /** The sidebar rows: each task with its latest run, standalone routine and channel; `q` matches text in any of them. */
  const listPreviewItems = (accountId, options) => {
    const {LatestSessionTurnTable: latest, SessionRoutineTable: routines, ChannelConversationTable: channels} = b.tables;
    const conditions = filters(options);
    if (options?.projectIds?.length) conditions.push(inArray(sessions.projectId, options.projectIds));
    if (options?.sessionIds?.length) conditions.push(inArray(sessions.id, options.sessionIds));
    if (options?.starterId) conditions.push(sql`json_extract(${sessions.trigger}, '$.starterId') = ${options.starterId}`);
    const query = options?.q?.trim().toLowerCase();
    if (query) {
      const contains = column => sql`instr(lower(coalesce(cast(${column} as text), '')), ${query}) > 0`;
      conditions.push(or(contains(sql`${sessions.title}`), contains(sql`${sessions.status}`), contains(sql`${sessions.trigger}`), contains(sql`${sessions.suspension}`),
        contains(sql`${latest.finalAssistantMessage}`), contains(sql`${routines.name}`)));
    }
    const rows = stateDb(accountId).select({session: {...b.sessionListColumns, model: sessions.model, activeTabTargetId: sessions.activeTabTargetId, cwd: sessions.cwd},
      latestRun: latest, routine: {id: routines.id, name: routines.name, rrule: routines.rrule, nextRunAt: routines.nextRunAt}, channelName: channels.title}).from(sessions)
      .leftJoin(latest, and(eq(latest.sessionId, sessions.id), eq(latest.id, sql`(select max(${turns.id}) from ${turns} where ${turns.sessionId} = ${sessions.id})`)))
      .leftJoin(routines, and(sql`json_extract(${sessions.trigger}, '$.type') = 'standalone-routine'`, eq(routines.id, sql`json_extract(${sessions.trigger}, '$.routineId')`), isNull(routines.deletedAt)))
      .leftJoin(channels, eq(channels.routeKey, sessions.channelRouteKey)).where(and(...conditions))
      .orderBy(...options?.pinnedFirst === false ? [] : [sql`${sessions.pinnedAt} IS NULL`], ...b.sessionListOrderBy(options?.order, sql`${latest.startedAt}`)).$dynamic();
    return page(rows, options).map(previewItem);
  };

  const listTurnOverviews = (accountId, sessionId, cursor, limit = 50) => {
    const database = stateDb(accountId), session = get(accountId, sessionId);
    if (!session) throw Error('Session not found');
    const rows = database.select().from(turns).where(and(eq(turns.sessionId, sessionId), cursor === undefined ? undefined : lt(turns.id, cursor)))
      .orderBy(desc(turns.id)).limit(limit + 1).all();
    const status = turn => turn.finishedAt ? turn.abortReason ? 'interrupted' : 'completed' : session.status === 'suspended' ? 'waiting' : 'working';
    const error = turn => turn.abortReason ? turn.abortReason.kind === 'error' ? turn.abortReason.error ?? 'This Turn failed.' : 'This Turn was interrupted.' : undefined;
    return {transcriptRevision: revisionOf(database, sessionId).revision, nextCursor: rows.length > limit ? rows[limit - 1]?.id : undefined,
      turns: rows.slice(0, limit).reverse().map(turn => ({id: turn.turnId, error: error(turn), ordinal: turn.id, status: status(turn), startedAt: turn.startedAt.getTime(),
        finalStartedAt: turn.finalStartedAt?.getTime(), finishedAt: turn.finishedAt?.getTime(), input: turn.userMessage, steeringMessages: turn.steeringMessages,
        trailingMessages: turn.trailingMessages, finalMessage: turn.finishedAt || turn.finalStartedAt ? turn.finalAssistantMessage : undefined, hasBody: turn.hasBody,
        bodyVersion: turn.bodyVersion, filesChanged: turn.filesChanged, abortReason: turn.abortReason}))};
  };
  /** A page of one turn's messages, refused if the transcript was rewritten since `revision`. */
  const listTurnMessages = async (accountId, sessionId, turnId, revision, cursor = 0, limit = 100) => {
    const database = stateDb(accountId), assertRevision = () => {
      if (revisionOf(database, sessionId)?.revision !== revision) throw Error('Transcript changed; reload Turn overview');
    };
    assertRevision();
    const turn = database.select().from(turns).where(and(eq(turns.sessionId, sessionId), eq(turns.turnId, turnId))).get(), session = get(accountId, sessionId);
    if (!turn || !session) throw Error('Turn not found');
    const store = transcript(accountId);
    const rows = store.readRange ? await store.readRange(session, turn.jsonlReadOffset, turn.jsonlReadSize)
      : (await store.listRows(session)).filter(row => Number(row.id) >= turn.jsonlReadOffset && Number(row.id) < turn.jsonlReadOffset + turn.jsonlReadSize);
    assertRevision();
    return {messages: rows.slice(cursor, cursor + limit).map(row => row.msg), nextCursor: rows.length > cursor + limit ? cursor + limit : undefined, revision, bodyVersion: turn.bodyVersion};
  };
  const listRuns = (accountId, sessionId) => {
    const extractions = b.tables.SessionTurnMemoryExtractionTable;
    return stateDb(accountId).select({id: turns.id, filesChanged: turns.filesChanged, finishedAt: turns.finishedAt, jsonlReadOffset: turns.jsonlReadOffset,
      jsonlReadSize: turns.jsonlReadSize, memoryExtractionSummary: extractions.summary, memoryExtractionFiles: extractions.files}).from(turns)
      .leftJoin(extractions, and(eq(extractions.sessionId, turns.sessionId), eq(extractions.jsonlReadOffset, turns.jsonlReadOffset)))
      .where(eq(turns.sessionId, sessionId)).orderBy(turns.id).all()
      .map(run => ({id: run.id, filesChanged: Array.isArray(run.filesChanged) ? run.filesChanged : [], finishedAt: run.finishedAt ? run.finishedAt.toISOString() : undefined,
        jsonlReadOffset: run.jsonlReadOffset, jsonlReadSize: run.jsonlReadSize,
        memoryExtraction: run.memoryExtractionSummary ? {summary: run.memoryExtractionSummary, files: Array.isArray(run.memoryExtractionFiles) ? run.memoryExtractionFiles : []} : undefined}));
  };

  const abortRunningSession = (accountId, sessionId, reason = {kind: 'daemon-restart'}, status = 'aborted') => {
    const session = get(accountId, sessionId);
    if (!session || session.status !== 'running') return false;
    const at = new Date(Math.floor(Date.now() / 1e3) * 1e3), latest = getLatestTurn(accountId, sessionId);
    if (latest && !latest.finishedAt) stateDb(accountId).update(turns).set({abortedAt: at, finishedAt: at, abortReason: reason}).where(eq(turns.id, latest.id)).run();
    update(accountId, sessionId, {status});
    return true;
  };
  const remove = (accountId, sessionId) => {
    b.ephemeralPurgeLeases.delete(purgeLease(accountId, sessionId));
    const removed = stateDb(accountId).delete(sessions).where(eq(sessions.id, sessionId)).returning({routineId: sessions.routineId}).get();
    if (removed?.routineId) b.EventBus.emit('routine:changed', {accountId, routineId: removed.routineId});
    b.EventBus.emit('session:deleted', {accountId, sessionId});
  };
  const unarchive = (accountId, sessionId) => {
    if (b.ephemeralPurgeLeases.has(purgeLease(accountId, sessionId))) throw Error(`Session is pending purge: ${sessionId}`);
    const session = get(accountId, sessionId);
    stateDb(accountId).update(sessions).set({archivedAt: null, ...session?.ephemeral ? {updatedAt: new Date()} : {}}).where(eq(sessions.id, sessionId)).run();
    const unarchived = get(accountId, sessionId);
    if (unarchived) emitUpdated(accountId, unarchived);
    return unarchived;
  };
  const listAllMessageRows = (accountId, sessionId) => transcript(accountId).listRows(requireSession(accountId, sessionId));
  /** The transcript the agent sees: from the latest compaction's first kept entry, without bookkeeping or aborted replies. */
  const messagesForAgentContext = (rows, compaction) => {
    const start = compaction ? rows.findIndex(row => row.id === b.resolveCompactionFirstKeptEntryId(rows, compaction)) : 0;
    if (compaction && start === -1) throw Error(`Compaction boundary not found: ${compaction.firstKeptEntryId}`);
    const messages = rows.slice(start).filter(row => row.msg.role !== 'compaction' && row.msg.role !== 'steering' && row.msg.role !== 'turn-lifecycle').map(row => row.msg);
    return [...compaction ? [compaction] : [], ...messages].filter(message => message.role !== 'assistant' || message.stopReason !== 'aborted');
  };
  /** Light rows for the transcript view; a created routine is marked on the tool result that made it. */
  const listMessageRows = async (accountId, sessionId, turnIds) => {
    const session = get(accountId, sessionId);
    if (!session) throw Error('Session not found');
    const store = transcript(accountId);
    const selected = turnIds ? stateDb(accountId).select().from(turns).where(and(eq(turns.sessionId, sessionId), inArray(turns.turnId, turnIds))).orderBy(turns.id).all() : undefined;
    const rows = selected && store.readRange ? (await Promise.all(selected.map(turn => store.readRange(session, turn.jsonlReadOffset, turn.jsonlReadSize)))).flat()
      : (await listAllMessageRows(accountId, sessionId)).filter(row => !selected || selected.some(turn => Number(row.id) >= turn.jsonlReadOffset && Number(row.id) < turn.jsonlReadOffset + turn.jsonlReadSize));
    const routineCalls = new Set();
    let turnId;
    return rows.map((row, index) => {
      const message = row.msg;
      if (message.role === 'turn-lifecycle' && message.event === 'started') {
        turnId = message.turnId;
        routineCalls.clear();
      }
      if (message.role === 'assistant') for (const part of message.content)
        if (part.type === 'toolCall' && (part.name === 'routine_update' || part.name === 'routine.update') && part.arguments.mode === 'create') routineCalls.add(part.id);
      const created = message.role === 'toolResult' && !message.isError && routineCalls.has(message.toolCallId) ? b.createdRoutineResultSchema.safeParse(message.details) : undefined;
      return {id: row.id, messageKey: b.buildMessageKey(message, index), role: message.role, timestamp: message.timestamp,
        ...message.role === 'toolResult' ? {citationSources: b.getCitationSources(message)} : {},
        ...created?.success ? {createdRoutine: {...created.data.routine, turnId}} : {}};
    });
  };

  /** Signed-in accounts back up these writes (Aux's cloud backup); the store's own internal calls do not queue. */
  const backedUp = (write, sessionIdOf) => (...args) => {
    const result = write(...args);
    b.cloudQueueSessionBackup(args[0], sessionIdOf(args, result));
    return result;
  };
  const backedUpAsync = (write, sessionIdOf) => async (...args) => {
    const result = await write(...args);
    b.cloudQueueSessionBackup(args[0], sessionIdOf(args, result));
    return result;
  };
  const bySessionArgument = args => args[1];

  return {
    insert: backedUp(insert, (args, session) => session.id),
    branch,
    editUserMessage: backedUpAsync(editUserMessage, args => args[1].sessionId),
    clearMessages: backedUpAsync(clearMessages, bySessionArgument),
    get,
    getByChannelRouteKey(accountId, routeKey) {
      const row = stateDb(accountId).select().from(sessions).where(eq(sessions.channelRouteKey, routeKey)).get();
      return row ? fromRow(row) : undefined;
    },
    list: (accountId, options) => page(stateDb(accountId).select(b.sessionListColumns).from(sessions).where(and(...filters(options)))
      .orderBy(...b.sessionListOrderBy(options?.order)).$dynamic(), options).map(listItemFromRow),
    listPreviewItems,
    search(accountId, text, options) {
      const escaped = text.trim().replace(/[\\%_]/g, '\\$&');
      if (!escaped) return [];
      return stateDb(accountId).select().from(sessions).where(and(...filters(options), sql`${sessions.title} like ${`%${escaped}%`} escape '\\'`))
        .orderBy(...b.sessionListOrderBy(options?.order)).limit(options?.limit ?? 50).all().map(fromRow);
    },
    listFull,
    getLatestTurn,
    listTurnOverviews,
    listTurnMessages,
    listRuns,
    listTurnsForFeedback: (accountId, sessionId) => stateDb(accountId).select().from(turns).where(eq(turns.sessionId, sessionId)).orderBy(turns.id).all().map(runFromRow),
    startLatestTurn,
    finalizeLatestTurn,
    listByParentId(accountId, parentId, archived) {
      const isChild = eq(sessions.parentId, parentId);
      return stateDb(accountId).select(b.sessionListColumns).from(sessions).where(archived === 'exclude' ? and(isChild, isNull(sessions.archivedAt)) : isChild)
        .orderBy(sessions.createdAt).all().map(listItemFromRow);
    },
    listCoders: accountId => stateDb(accountId).select().from(sessions).where(and(eq(sessions.harnessId, 'coder'), isNull(sessions.parentId), isNull(sessions.archivedAt),
      sql`json_extract(${sessions.toolState}, '$.coder') is not null`)).all().map(fromRow),
    listByTriggeredBy: (accountId, parentId, toolCallId) => stateDb(accountId).select(b.sessionListColumns).from(sessions)
      .where(and(eq(sessions.parentId, parentId), sql`json_extract(${sessions.trigger}, '$.toolCallId') = ${toolCallId}`)).orderBy(sessions.createdAt).all().map(listItemFromRow),
    update: backedUp(update, bySessionArgument),
    /** A task as another device or a backup has it; an existing one is left alone. */
    restore(accountId, session) {
      b.ensureSessionDir(session, accountId);
      stateDb(accountId).insert(sessions).values({id: session.id, projectId: session.projectId ?? null, harnessId: session.harnessId ?? 'v1', systemPrompt: session.systemPrompt ?? '',
        parentId: session.parentId ?? null, branchedFrom: session.branchedFrom ?? null, title: session.title, trigger: session.trigger ?? null,
        triggerIdempotencyKey: session.triggerIdempotencyKey ?? null, routineId: session.routineId ?? null, channelRouteKey: session.channelRouteKey ?? null, status: session.status,
        suspension: session.suspension ?? null, model: session.model, permissionMode: session.permissionMode, permission: session.permission,
        contextWindow: session.contextWindow ?? {usedTokens: 0, totalTokens: 0}, queuedMessages: session.queuedMessages ?? [], steeringMessages: session.steeringMessages ?? [],
        cwd: session.cwd, toolState: session.toolState ?? b.createDefaultToolState(session.cwd), activeTabTargetId: session.activeTabTargetId ?? null,
        browserBinding: session.browserBinding ?? null, incognito: session.incognito ?? false, ephemeral: session.ephemeral ?? false,
        runtimeConfig: b.sessionRuntimeConfigSchema.parse(session.runtimeConfig ?? {}), readAt: session.readAt ?? session.updatedAt,
        latestCompactionMessageOffset: session.latestCompactionMessageOffset ?? 0, archivedAt: session.archivedAt ?? null, pinnedAt: session.pinnedAt ?? null,
        createdAt: session.createdAt, updatedAt: session.updatedAt}).onConflictDoNothing().run();
      return get(accountId, session.id);
    },
    /** Turn rows from a backup; returns how many were new. */
    restoreTurns(accountId, sessionId, restored) {
      if (restored.length === 0) return 0;
      const database = stateDb(accountId);
      let added = 0;
      for (const turn of restored) added += Number(database.insert(turns).values({...b.normalizeSessionTurnProjection(turn), sessionId}).onConflictDoNothing().run().changes ?? 0);
      return added;
    },
    adoptMirrorState(accountId, sessionId, state) {
      stateDb(accountId).update(sessions).set({readAt: state.readAt, archivedAt: state.archivedAt ?? null}).where(eq(sessions.id, sessionId)).run();
    },
    abortRunningSession,
    abortRunningSessions(accountId) {
      const running = stateDb(accountId).select({id: sessions.id}).from(sessions).where(eq(sessions.status, 'running')).all().map(row => row.id);
      for (const sessionId of running) abortRunningSession(accountId, sessionId);
      return running.length;
    },
    recordTurnResumeAttempt(accountId, sessionId) {
      const latest = getLatestTurn(accountId, sessionId);
      if (!latest || latest.finishedAt) return null;
      const attempts = latest.resumeAttempts + 1;
      stateDb(accountId).update(turns).set({resumeAttempts: attempts}).where(eq(turns.id, latest.id)).run();
      return attempts;
    },
    remove(accountId, sessionId) {
      b.cloudQueueSessionDelete(accountId, sessionId);
      return remove(accountId, sessionId);
    },
    /** Archives an idle ephemeral task untouched for 15 minutes with no open turn, and leases it for purge. */
    claimEphemeralForPurge(accountId, sessionId, at = new Date()) {
      const claimed = stateDb(accountId).update(sessions).set({archivedAt: at}).where(and(eq(sessions.id, sessionId), eq(sessions.ephemeral, true), isNull(sessions.archivedAt),
        lt(sessions.updatedAt, new Date(at.getTime() - 9e5)), inArray(sessions.status, b.terminalStatuses), sql`NOT EXISTS (
            SELECT 1 FROM ${turns}
            WHERE ${turns.sessionId} = ${sessions.id}
              AND ${turns.finishedAt} IS NULL
              AND ${turns.abortedAt} IS NULL
          )`)).run().changes === 0 ? undefined : get(accountId, sessionId);
      if (claimed) {
        b.ephemeralPurgeLeases.add(purgeLease(accountId, sessionId));
        emitUpdated(accountId, claimed);
      }
      return claimed;
    },
    archive: backedUp((accountId, sessionId) => { update(accountId, sessionId, {archivedAt: new Date()}); }, bySessionArgument),
    unarchive: backedUp(unarchive, bySessionArgument),
    releaseEphemeralPurge(accountId, sessionId) {
      b.ephemeralPurgeLeases.delete(purgeLease(accountId, sessionId));
      return unarchive(accountId, sessionId);
    },
    touch,
    markRead(accountId, sessionId, at = new Date()) {
      const session = requireSession(accountId, sessionId);
      if (session.readAt.getTime() >= session.updatedAt.getTime()) return session.readAt;
      const readAt = b.readAtAfterLatestUpdatedAt(at, [session]);
      stateDb(accountId).update(sessions).set({readAt}).where(eq(sessions.id, sessionId)).run();
      b.EventBus.emit('session:updated', {accountId, sessionId, session: get(accountId, sessionId)});
      return readAt;
    },
    markAllRead(accountId, options, at = new Date()) {
      const unread = listFull(accountId, options).filter(session => session.readAt.getTime() < session.updatedAt.getTime());
      if (unread.length === 0) return {readAt: at, count: 0};
      const readAt = b.readAtAfterLatestUpdatedAt(at, unread), ids = unread.map(session => session.id);
      stateDb(accountId).update(sessions).set({readAt}).where(inArray(sessions.id, ids)).run();
      const updated = ids.map(id => get(accountId, id)).filter(session => session !== undefined);
      for (const session of updated) emitUpdated(accountId, session);
      return {readAt, count: updated.length};
    },
    markUnread(accountId, sessionId) {
      requireSession(accountId, sessionId);
      const readAt = new Date(0);
      stateDb(accountId).update(sessions).set({readAt}).where(eq(sessions.id, sessionId)).run();
      b.EventBus.emit('session:updated', {accountId, sessionId, session: get(accountId, sessionId)});
      return readAt;
    },
    archiveAll(accountId, options, at = new Date()) {
      const matching = listFull(accountId, options);
      if (matching.length === 0) return [];
      const ids = matching.map(session => session.id);
      stateDb(accountId).update(sessions).set({archivedAt: at}).where(inArray(sessions.id, ids)).run();
      const archived = ids.map(id => get(accountId, id)).filter(session => session !== undefined);
      for (const session of archived) emitUpdated(accountId, session);
      return archived;
    },
    listAllMessages: async (accountId, sessionId) => (await listAllMessageRows(accountId, sessionId)).map(row => row.msg),
    listAllMessageRows,
    listMessageRows,
    async listMessagesForAgentContext(accountId, sessionId) {
      const session = requireSession(accountId, sessionId), rows = await transcript(accountId).listRows(session);
      const compaction = session.latestCompactionMessageOffset > 0
        ? rows.find(row => row.id === String(session.latestCompactionMessageOffset) && row.msg.role === 'compaction')?.msg : undefined;
      return messagesForAgentContext(rows, compaction);
    },
    messagesForAgentContext,
    appendMessage: backedUp(appendMessage, bySessionArgument),
  };
}
