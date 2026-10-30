/** The `sessions` tRPC namespace: tasks and chats, their files, queue and turns. Creating a task
 * with a research request first checks that the model and browser can do the research (Aux's
 * local web search). The session store, agent server, sharing and channel delivery stay the
 * supplied ones. The `tabs` router is its own module (sessions.tabs.mjs). */
import {rename, rm, stat} from 'node:fs/promises';
import {basename, dirname, isAbsolute, relative, resolve} from 'node:path';

/** A suspension error from the agent server, as the tRPC code a client acts on. */
const suspensionError = (TRPCError, error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('No matching active suspension')) return new TRPCError({code: 'NOT_FOUND', message});
  if (message.includes('already resolved')) return new TRPCError({code: 'CONFLICT', message});
  return error;
};

export function create({accountProcedure, z, TRPCError, sessions: s}) {
  const bySession = s.sessionByIdProcedure, local = s.localSessionByIdProcedure;
  const current = ctx => s.SessionStore.get(ctx.accountId, ctx.session.id);
  const userMessage = text => ({role: 'user', content: [{type: 'text', text}], timestamp: Date.now()});
  const prompt = z.object({prompt: z.string().trim().min(1)});
  const queued = s.queuedUserMessageSchema;

  /** Applies a settings change to a task; a loaded agent picks up its new binding, policy or model. */
  const update = async ({input, ctx}) => {
    const {accountId} = ctx, {sessionId} = input, server = s.GlobalAgentSessionServer;
    const permissionChange = input.permissionMode !== undefined || input.permission !== undefined || input.runtimeConfig?.workingDirs !== undefined;
    const reloadsAgent = input.model !== undefined || input.incognito !== undefined || input.runtimeConfig !== undefined || input.permissionMode !== undefined || input.permission !== undefined;
    const blockedWhileRunning = input.incognito !== undefined || input.runtimeConfig?.workingDirs !== undefined;
    const session = s.SessionStore.get(accountId, sessionId);
    if (blockedWhileRunning && server.isRunning(accountId, sessionId)) throw new TRPCError({code: 'BAD_REQUEST',
      message: permissionChange ? 'Cannot change session permissions while the session is running.' : 'Cannot change session runtime configuration while the session is running.'});
    const changes = {};
    let bindingChanged = false;
    if (input.title !== undefined) changes.title = input.title;
    if (input.status !== undefined) changes.status = input.status;
    if (input.activeTabTargetId !== undefined) changes.activeTabTargetId = input.activeTabTargetId;
    if (input.pinned !== undefined) {
      if (input.pinned && session.ephemeral) throw new TRPCError({code: 'BAD_REQUEST', message: 'Ephemeral sessions cannot be pinned'});
      changes.pinnedAt = input.pinned ? new Date() : null;
    }
    if (input.browserBinding !== undefined) {
      const bound = session.browserBinding, next = input.browserBinding;
      if (bound && bound.profileId !== next.profileId) throw new TRPCError({code: 'CONFLICT', message: 'This task belongs to a different browser profile.'});
      if (bound?.browserMode && bound.browserMode !== next.browserMode)
        throw new TRPCError({code: 'CONFLICT', message: 'This task belongs to a different browser mode. Open it in its original regular or incognito window.'});
      if (!bound || bound.browserMode !== next.browserMode || bound.windowId !== next.windowId || bound.anchorTargetId !== next.anchorTargetId) {
        changes.browserBinding = next;
        bindingChanged = true;
      }
    }
    if (input.permissionMode !== undefined) changes.permissionMode = input.permissionMode;
    if (input.incognito !== undefined) {
      if ((await s.SessionStore.listMessageRows(accountId, sessionId)).length > 0) throw new TRPCError({code: 'BAD_REQUEST', message: 'Cannot change session mode after the first message.'});
      changes.incognito = input.incognito;
      changes.ephemeral = input.incognito;
      if (input.incognito !== session.incognito) changes.systemPrompt = '';
    }
    if (input.runtimeConfig !== undefined) changes.runtimeConfig = {...session.runtimeConfig, ...input.runtimeConfig};
    if (permissionChange) {
      const modePermission = s.permissionForMode(input.permissionMode ?? session.permissionMode, session.cwd, s.getSessionTaskDir(session, accountId), s.getAccountRoot(accountId),
        input.runtimeConfig?.workingDirs ?? session.runtimeConfig.workingDirs);
      changes.permission = s.mergePermissionConfig(s.mergePermissionConfig(s.settings(accountId).get('permission') ?? {}, modePermission), input.permission);
    }
    if (input.model !== undefined) changes.model = input.model;
    if (Object.keys(changes).length === 0) return session;
    s.SessionStore.update(accountId, sessionId, changes);
    const updated = s.SessionStore.get(accountId, sessionId);
    if (!server.getLoadedAgent(accountId, sessionId)) return updated;
    if (bindingChanged && updated.browserBinding) server.refreshLoadedSessionBrowserBinding(accountId, sessionId, updated.browserBinding);
    if (!reloadsAgent) return updated;
    if (server.isRunning(accountId, sessionId)) {
      server.refreshLoadedSessionPolicy(accountId, sessionId, {permissionMode: updated.permissionMode, permission: updated.permission, runtimeConfig: updated.runtimeConfig});
      if (input.model !== undefined) await server.refreshLoadedSessionModel(accountId, sessionId, updated.model);
    } else {
      await server.reloadLoadedAgentSession(accountId, sessionId);
      server.prewarm(accountId, sessionId).catch(() => undefined);
    }
    return updated;
  };

  const createAndPrompt = async ({ctx, input}) => {
    const {message, research, ...options} = input;
    let sessionId = null;
    try {
      if (research) {
        const capability = await s.researchCapability(ctx.accountId, ctx.account, {model: options.model ?? s.settings(ctx.accountId).get('defaultModel'), browserBinding: options.browserBinding});
        if (!capability.available) throw Error(capability.reason);
      }
      const session = await s.createSession(ctx.accountId, {...options, queuedMessages: s.captureInitialPrompt(ctx.accountId, ctx.account, message)});
      sessionId = session.id;
      await s.GlobalAgentSessionServer.startRun(ctx.accountId, session.id, agent => research ? s.runResearchSession(agent, message, research) : agent.prompt(message));
      return s.SessionStore.get(ctx.accountId, session.id) ?? session;
    } catch (error) {
      s.logger.alert('[Sessions] createAndPrompt failed', {accountId: ctx.accountId, sessionId, error});
      throw error;
    }
  };

  const editUserMessage = async ({input, ctx}) => {
    const {accountId, session} = ctx, server = s.GlobalAgentSessionServer;
    const project = session.projectId ? s.ProjectStore.require(accountId, session.projectId) : undefined;
    if (project?.archivedAt || current(ctx)?.archivedAt) throw new TRPCError({code: 'BAD_REQUEST', message: 'Cannot edit an archived task.'});
    if ((await s.SessionStore.listMessageRows(accountId, session.id)).find(row => row.id === input.messageId)?.role !== 'user')
      throw new TRPCError({code: 'BAD_REQUEST', message: 'Only user messages can be edited.'});
    await server.abort(accountId, session.id);
    const edited = await s.SessionStore.editUserMessage(accountId, {sessionId: session.id, messageId: input.messageId, content: input.content});
    const overview = s.SessionStore.listTurnOverviews(accountId, edited.id);
    const {messages} = await s.SessionStore.listTurnMessages(accountId, edited.id, overview.turns.at(-1).id, overview.transcriptRevision);
    await server.reloadLoadedAgentSession(accountId, edited.id);
    await server.startRun(accountId, edited.id, async agent => { await agent.continue(); });
    return {session: s.SessionStore.get(accountId, edited.id), messages, overview};
  };

  const channelTaskSnapshot = async ({ctx}) => {
    const {accountId, session} = ctx;
    if (session.harnessId !== 'worker' || session.trigger?.type !== 'v2-channel') throw new TRPCError({code: 'FORBIDDEN'});
    const messages = await s.SessionStore.listAllMessages(accountId, session.id), publication = s.publicationState(messages).lastPublication;
    const result = messages.slice(messages.findLastIndex(message => message.role === 'user'))
      .findLast(message => message.role === 'assistant' && !message.content.some(part => part.type === 'toolCall'));
    return {preview: s.channelTaskPreview(accountId, session.id), status: session.status, title: session.title, model: session.model, updatedAt: session.updatedAt,
      suspension: session.suspension, turnId: s.SessionStore.getLatestTurn(accountId, session.id)?.turnId ?? null,
      publication: publication?.role === 'published-message' ? publication : null,
      result: result?.role === 'assistant' && (s.textContent(result) || result.errorMessage) || null};
  };

  const files = {
    list: local.output(z.array(z.string())).query(async ({ctx}) => {
      try {
        return (await s.listSessionFiles(s.getSessionTaskDir(ctx.session, ctx.accountId))).sort((a, b) => a.localeCompare(b));
      } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') return [];
        throw error;
      }
    }),
    metadata: local.meta({method: 'GET', path: '/sessions/:sessionId/files/metadata'}).input(s.fileQuerySchema).output(s.fileMetadataSchema)
      .query(async ({ctx, input}) => (await s.resolveSessionFile(ctx.accountId, ctx.session, input.path, {allowDirectory: true})).metadata),
    uploadAttachment: local.input(z.object({attachment: s.fileAttachmentSchema})).output(s.fileAttachmentSchema.extend({path: z.string()})).mutation(async ({ctx, input}) => {
      const attachment = await s.prepareFileAttachment(s.getSessionTaskDir(ctx.session, ctx.accountId), input.attachment);
      if (!attachment.path) throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: 'Attachment upload did not return a path'});
      await s.cloudBackupAttachment(ctx.accountId, ctx.session, attachment)
        .catch(() => s.logger.warn('[Aux cloud] Attachment remains local; backup failed', {accountId: ctx.accountId, sessionId: ctx.session.id}));
      return {...attachment, path: attachment.path};
    }),
    content: local.meta({method: 'GET', path: '/sessions/:sessionId/files/content'}).input(s.fileQuerySchema).query(async ({ctx, input}) => {
      const file = await s.resolveSessionFile(ctx.accountId, ctx.session, input.path);
      return await s.buildSessionFileResponse(file.filePath, file.fileStat.size, file.fileStat.mtimeMs, file.metadata.mimeType, ctx.req.headers.get('range'),
        {maxBytes: input.previewMaxBytes, maxHeight: input.previewMaxHeight, maxWidth: input.previewMaxWidth});
    }),
    rename: local.input(z.object({path: z.string().trim().min(1), name: z.string().trim().min(1).max(255)})).output(z.object({path: z.string()})).mutation(async ({ctx, input}) => {
      const file = await s.resolveSessionFile(ctx.accountId, ctx.session, input.path, {allowDirectory: true}), name = input.name.trim();
      if (name !== basename(name) || name === '.' || name === '..') throw new TRPCError({code: 'BAD_REQUEST', message: 'Invalid file name'});
      const target = resolve(dirname(file.filePath), name), targetPath = relative(s.getSessionTaskDir(ctx.session, ctx.accountId), target);
      if (targetPath.startsWith('..') || isAbsolute(targetPath) || targetPath === '') throw new TRPCError({code: 'FORBIDDEN', message: 'File is outside the session directory'});
      if (target === file.filePath) return {path: targetPath};
      if (await stat(target).catch(() => undefined)) throw new TRPCError({code: 'CONFLICT', message: 'A file with that name already exists'});
      await rename(file.filePath, target);
      return {path: targetPath};
    }),
    delete: local.input(z.object({path: z.string().trim().min(1)})).mutation(async ({ctx, input}) => {
      const file = await s.resolveSessionFile(ctx.accountId, ctx.session, input.path, {allowDirectory: true});
      await s.cloudForgetAttachment(ctx.accountId, ctx.session, input.path);
      await rm(file.filePath, {recursive: true, force: true});
    }),
  };

  const turns = {
    activeMessages: bySession.query(async ({ctx}) => {
      const latest = s.SessionStore.getLatestTurn(ctx.accountId, ctx.session.id);
      if (!latest || latest.finishedAt) return [];
      const revision = s.SessionStore.listTurnOverviews(ctx.accountId, ctx.session.id, undefined, 1).transcriptRevision, messages = [];
      for (let cursor = 0; cursor !== undefined;) {
        const page = await s.SessionStore.listTurnMessages(ctx.accountId, ctx.session.id, latest.turnId, revision, cursor, 500);
        messages.push(...page.messages);
        cursor = page.nextCursor;
      }
      return messages;
    }),
    list: bySession.input(z.object({cursor: z.number().int().optional(), limit: z.number().int().min(1).max(100).default(50)}))
      .query(({ctx, input}) => s.SessionStore.listTurnOverviews(ctx.accountId, ctx.session.id, input.cursor, input.limit)),
    messages: bySession.input(z.object({turnId: z.string(), revision: z.number().int(), cursor: z.number().int().min(0).optional(), limit: z.number().int().min(1).max(500).default(100)}))
      .query(({ctx, input}) => s.SessionStore.listTurnMessages(ctx.accountId, ctx.session.id, input.turnId, input.revision, input.cursor, input.limit)),
  };

  return {
    researchCapability: accountProcedure.input(z.object({browserBinding: s.browserBindingSchema,
      model: z.object({provider: z.string().min(1).max(256), modelId: z.string().min(1).max(512)}).passthrough()}))
      .query(({ctx, input}) => s.researchCapability(ctx.accountId, ctx.account, input)),
    deliverChannelTask: accountProcedure.input(s.channelDeliverySchema).mutation(async ({ctx, input}) => {
      s.registerDeviceTaskPreviews(ctx.accountId);
      const browserBinding = s.SessionStore.get(ctx.accountId, input.sessionId)?.browserBinding ?? await s.resolveCliBrowserBinding(ctx.accountId);
      return {accepted: await s.deliverChannelInput(ctx.accountId, input, 'worker', {browserBinding})};
    }),
    channelTaskSnapshot: bySession.query(channelTaskSnapshot),
    create: accountProcedure.input(s.createSessionInputSchema).mutation(async ({ctx, input}) => {
      const fromCli = s.isCliSession(input), binding = input.browserBinding ?? (fromCli ? await s.resolveCliBrowserBinding(ctx.accountId) : undefined);
      const session = await s.createSession(ctx.accountId, {...input, ...binding ? {browserBinding: binding} : {},
        ...fromCli && input.activeTabTargetId === undefined && binding?.anchorTargetId ? {activeTabTargetId: binding.anchorTargetId} : {}});
      s.GlobalAgentSessionServer.prewarm(ctx.accountId, session.id).catch(() => undefined);
      return session;
    }),
    createAndPrompt: accountProcedure.input(s.createSessionInputSchema.extend({message: z.custom(),
      research: z.object({kind: z.literal('web-search'), query: z.string().trim().min(1).max(2000)}).strict().optional()})).mutation(createAndPrompt),
    branch: bySession.input(z.object({messageId: z.string()})).mutation(async ({input, ctx}) => {
      if ((await s.SessionStore.listMessageRows(ctx.accountId, ctx.session.id)).find(row => row.id === input.messageId)?.role !== 'assistant')
        throw new TRPCError({code: 'BAD_REQUEST', message: 'Only assistant messages can be branched.'});
      return {session: await s.SessionStore.branch(ctx.accountId, {sessionId: ctx.session.id, messageId: input.messageId})};
    }),
    editUserMessage: bySession.input(z.object({messageId: z.string(), content: z.string()})).mutation(editUserMessage),
    clearMessages: bySession.mutation(async ({ctx}) => {
      if (s.GlobalAgentSessionServer.isRunning(ctx.accountId, ctx.session.id)) throw new TRPCError({code: 'BAD_REQUEST', message: 'Cannot clear messages while the session is running.'});
      const session = await s.SessionStore.clearMessages(ctx.accountId, ctx.session.id);
      await s.GlobalAgentSessionServer.reloadLoadedAgentSession(ctx.accountId, session.id);
      return {session};
    }),
    list: accountProcedure.input(s.listOptionsSchema).query(({ctx, input}) => {
      s.startCloudSessionDiscovery(ctx.accountId);
      return s.SessionStore.list(ctx.accountId, input);
    }),
    listPreviewItems: accountProcedure.input(s.previewItemsOptionsSchema).query(({ctx, input}) => {
      s.startCloudSessionDiscovery(ctx.accountId);
      return s.SessionStore.listPreviewItems(ctx.accountId, input).map(item => {
        const toolState = item.trigger?.type === 'agent' && item.status === 'idle' ? s.SessionStore.get(ctx.accountId, item.id)?.toolState : undefined;
        return {...item, waiting: !!(toolState && s.hasPendingCoderWork(ctx.accountId, item.id, toolState))};
      });
    }),
    liveToolCalls: accountProcedure.input(z.object({sessionId: z.string().min(1)})).query(({ctx, input}) => s.GlobalAgentSessionServer.getRecentToolCalls(ctx.accountId, input.sessionId, 3)),
    get: bySession.query(({ctx}) => ctx.session),
    markRead: bySession.mutation(({ctx}) => ({readAt: s.SessionStore.markRead(ctx.accountId, ctx.session.id).toISOString()})),
    markUnread: bySession.mutation(({ctx}) => ({readAt: s.SessionStore.markUnread(ctx.accountId, ctx.session.id).toISOString()})),
    files,
    update: bySession.input(z.object({title: z.string().optional(), status: s.statusSchema.optional(), activeTabTargetId: z.string().nullable().optional(),
      browserBinding: s.browserBindingSchema.optional(), incognito: z.boolean().optional(), pinned: z.boolean().optional(), runtimeConfig: s.runtimeConfigPatchSchema.optional(),
      model: s.modelSelectionSchema.optional(), permissionMode: s.permissionModeSchema.optional(), permission: s.optionalPermissionConfigSchema})).mutation(update),
    moveToProject: bySession.input(z.object({projectId: z.string().min(1).nullable()})).mutation(({input, ctx}) => s.moveSessionToProject(ctx.accountId, ctx.session.id, input.projectId)),
    shareStatus: local.query(({ctx}) => s.getSharedSessionLink(ctx.accountId, ctx.session.id)),
    share: local.mutation(async ({ctx}) => {
      if (ctx.session.incognito) throw new TRPCError({code: 'BAD_REQUEST', message: 'Incognito sessions cannot be shared.'});
      return s.publishSharedSession(ctx.accountId, ctx.session, await s.SessionStore.listAllMessages(ctx.accountId, ctx.session.id));
    }),
    unshare: local.mutation(async ({ctx}) => {
      await s.unpublishSharedSession(ctx.accountId, ctx.session.id);
      return {ok: true};
    }),
    removeQueuedMessage: bySession.input(z.object({message: queued})).mutation(async ({ctx, input}) => {
      await s.GlobalAgentSessionServer.removeQueuedMessage(ctx.accountId, input.sessionId, input.message);
      return s.SessionStore.get(ctx.accountId, input.sessionId);
    }),
    updateQueuedMessage: bySession.input(z.object({message: queued, text: z.string().trim().min(1)})).mutation(async ({ctx, input}) => {
      if (!await s.GlobalAgentSessionServer.updateQueuedMessage(ctx.accountId, input.sessionId, input.message, input.text))
        throw new TRPCError({code: 'CONFLICT', message: 'This queued message has already been sent, removed, or changed.'});
      return s.SessionStore.get(ctx.accountId, input.sessionId);
    }),
    moveQueuedMessage: bySession.input(z.object({message: queued, beforeTimestamp: z.number().nullable()})).mutation(async ({ctx, input}) => {
      if (!await s.GlobalAgentSessionServer.moveQueuedMessage(ctx.accountId, input.sessionId, input.message, input.beforeTimestamp))
        throw new TRPCError({code: 'CONFLICT', message: 'The queue changed. Please try moving the message again.'});
      return s.SessionStore.get(ctx.accountId, input.sessionId);
    }),
    resolveSuspension: bySession.input(z.object({toolCallId: z.string(), suspensionId: z.string().optional(), response: z.unknown()})).mutation(async ({input, ctx}) => {
      try {
        return await s.resolveSuspension({accountId: ctx.accountId, sessionId: ctx.session.id, toolCallId: input.toolCallId, suspensionId: input.suspensionId, response: input.response});
      } catch (error) {
        throw suspensionError(TRPCError, error);
      }
    }),
    rejectSuspension: bySession.input(z.object({toolCallId: z.string(), suspensionId: z.string().optional(), error: z.string()})).mutation(async ({input, ctx}) => {
      try {
        return await s.rejectSuspension({accountId: ctx.accountId, sessionId: ctx.session.id, toolCallId: input.toolCallId, suspensionId: input.suspensionId, error: input.error});
      } catch (error) {
        throw suspensionError(TRPCError, error);
      }
    }),
    abort: bySession.mutation(async ({ctx}) => {
      await s.GlobalAgentSessionServer.abort(ctx.accountId, ctx.session.id);
      return current(ctx);
    }),
    interrupt: bySession.mutation(async ({ctx}) => {
      await s.GlobalAgentSessionServer.interrupt(ctx.accountId, ctx.session.id);
      return current(ctx);
    }),
    steer: bySession.input(prompt).mutation(async ({ctx, input}) => {
      await s.GlobalAgentSessionServer.steer(ctx.accountId, ctx.session.id, userMessage(input.prompt));
      return current(ctx);
    }),
    queue: bySession.input(prompt).mutation(async ({ctx, input}) => {
      await s.GlobalAgentSessionServer.queue(ctx.accountId, ctx.session.id, userMessage(input.prompt));
      return current(ctx);
    }),
    compact: bySession.input(z.object({instructions: z.string().trim().min(1).max(2e3).optional()})).mutation(async ({input, ctx}) => {
      await s.GlobalAgentSessionServer.compact(ctx.accountId, ctx.session.id, input.instructions);
      return current(ctx);
    }),
    reportFeedback: bySession.input(s.reportFeedbackInputSchema).mutation(async ({input, ctx}) => s.submitSessionFeedback(ctx.accountId, ctx.session, input.comment)),
    delete: bySession.mutation(({ctx}) => s.deleteSession(ctx.accountId, ctx.session.id)),
    archive: bySession.mutation(({ctx}) => s.archiveSession(ctx.accountId, ctx.session.id)),
    unarchive: bySession.mutation(({ctx}) => {
      const session = s.SessionStore.unarchive(ctx.accountId, ctx.session.id);
      if (!session) throw new TRPCError({code: 'NOT_FOUND', message: 'Session not found.'});
      return session;
    }),
    messages: bySession.query(({ctx}) => s.SessionStore.listAllMessages(ctx.accountId, ctx.session.id)),
    turns,
    messageRows: bySession.input(z.object({turnIds: z.array(z.string()).optional()})).query(({ctx, input}) => s.SessionStore.listMessageRows(ctx.accountId, ctx.session.id, input.turnIds)),
    listRuns: bySession.query(({ctx}) => s.SessionStore.listRuns(ctx.accountId, ctx.session.id)),
    childSessions: accountProcedure.input(z.object({parentId: z.string(), triggeredBy: z.string().optional(), archived: z.literal('exclude').optional()}))
      .query(({ctx, input}) => input.triggeredBy ? s.SessionStore.listByTriggeredBy(ctx.accountId, input.parentId, input.triggeredBy)
        : s.SessionStore.listByParentId(ctx.accountId, input.parentId, input.archived)),
  };
}
