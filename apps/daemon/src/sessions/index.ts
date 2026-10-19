/** Implements docs/spec/daemon/agent.md session lifecycle, API and streaming. */

import {
  AgentEngine,
  attachmentInput,
  bindingSchema,
  createSchema,
  fail,
  runtimeSchema,
  type Session,
  scope,
  selectionSchema,
  sessionScope,
} from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { createMcpRouter } from '../mcp/index.js';
import { createModelRouter } from '../models/index.js';
import { createProjectRouter } from '../projects/index.js';
import { createRoutineRouter } from '../routines/index.js';

export function createAgentRouters(
  services: DaemonServices,
  engine = new AgentEngine(services.store, services.bridge),
) {
  const { t, procedure, store } = services;
  store.registerAccountDeletionHandler(async (accountId) => {
    const sessions = engine.list(accountId);
    for (const session of sessions)
      engine.stop(accountId, session.id, 'aborted');
    await Promise.all(
      sessions.map((session) => engine.wait(accountId, session.id)),
    );
  });
  const get = (input: z.infer<typeof sessionScope>) =>
    engine.get(input.accountId, input.sessionId);
  const updated = (session: Session) => {
    engine.emit(session, 'session-updated', {});
    return engine.public(session);
  };
  const listSchema = scope.extend({
    projectId: z.string().nullable().optional(),
    archived: z.enum(['exclude', 'include', 'only']).default('exclude'),
    pinned: z.enum(['exclude', 'include', 'only']).default('include'),
    parent: z.enum(['root', 'all']).default('root'),
    order: z.enum(['asc', 'desc']).default('desc'),
    ephemeral: z.enum(['exclude', 'include', 'only']).default('exclude'),
    routines: z.enum(['exclude', 'include']).default('include'),
    routineId: z.string().optional(),
    statuses: z.array(z.string()).optional(),
    cursor: z.number().int().nonnegative().default(0),
    limit: z.number().int().min(1).max(200).default(50),
    q: z.string().optional(),
    projectIds: z.array(z.string()).optional(),
    sessionIds: z.array(z.string()).optional(),
    pinnedFirst: z.boolean().default(true),
  });
  function list(input: z.infer<typeof listSchema>) {
    return engine
      .list(input.accountId)
      .filter(
        (s) =>
          (input.projectId === undefined || s.projectId === input.projectId) &&
          (input.archived === 'include' ||
            s.archived === (input.archived === 'only')) &&
          (input.ephemeral === 'include' ||
            s.ephemeral === (input.ephemeral === 'only')) &&
          (input.pinned === 'include' ||
            s.pinned === (input.pinned === 'only')) &&
          (input.parent === 'all' || !s.parentId) &&
          (input.routines === 'include' || !s.routineId) &&
          (!input.routineId || s.routineId === input.routineId) &&
          (!input.statuses || input.statuses.includes(s.status)) &&
          (!input.q || s.title.toLowerCase().includes(input.q.toLowerCase())) &&
          (!input.sessionIds || input.sessionIds.includes(s.id)) &&
          (!input.projectIds ||
            (!!s.projectId && input.projectIds.includes(s.projectId))),
      )
      .sort((a, b) => {
        if (input.pinnedFirst && a.pinned !== b.pinned)
          return a.pinned ? -1 : 1;
        return (
          (input.order === 'desc' ? -1 : 1) * (a.updatedAt - b.updatedAt) ||
          a.id.localeCompare(b.id)
        );
      })
      .slice(input.cursor, input.cursor + input.limit)
      .map((s) => engine.public(s));
  }
  const turns = t.router({
    activeMessages: procedure.input(sessionScope).query(({ input }) => {
      const s = get(input);
      const active = s.runs.findLast(
        (run) => run.status === 'running' || run.status === 'suspended',
      );
      return active ? s.messages.filter((m) => m.turnId === active.id) : [];
    }),
    list: procedure
      .input(
        sessionScope.extend({
          cursor: z.number().int().nonnegative().default(0),
          limit: z.number().int().min(1).max(100).default(50),
        }),
      )
      .query(({ input }) => {
        const s = get(input);
        return {
          turns: s.runs.slice(input.cursor, input.cursor + input.limit),
          transcriptRevision: s.transcriptRevision,
          nextCursor:
            input.cursor + input.limit < s.runs.length
              ? input.cursor + input.limit
              : null,
        };
      }),
    messages: procedure
      .input(
        sessionScope.extend({
          turnId: z.string(),
          revision: z.number().int().nonnegative(),
          cursor: z.number().int().nonnegative().default(0),
          limit: z.number().int().min(1).max(500).default(100),
        }),
      )
      .query(({ input }) => {
        const s = get(input);
        if (input.revision !== s.transcriptRevision)
          fail('CONFLICT', 'Transcript revision changed');
        const messages = s.messages.filter((m) => m.turnId === input.turnId);
        return {
          messages: messages.slice(input.cursor, input.cursor + input.limit),
          nextCursor:
            input.cursor + input.limit < messages.length
              ? input.cursor + input.limit
              : null,
          transcriptRevision: s.transcriptRevision,
        };
      }),
  });
  const sessions = t.router({
    create: procedure
      .input(createSchema)
      .mutation(({ input }) => engine.public(engine.create(input))),
    createAndPrompt: procedure
      .input(
        createSchema.extend({
          message: z.string().trim().min(1),
          idempotencyKey: z.string().optional(),
          attachmentIds: z.array(z.string().uuid()).max(10).default([]),
        }),
      )
      .mutation(({ input }) => {
        const session = engine.create(input);
        return engine.prompt(
          input.accountId,
          session.id,
          input.message,
          input.idempotencyKey,
          input.attachmentIds,
        );
      }),
    prompt: procedure
      .input(
        sessionScope.extend({
          message: z.string().trim().min(1).optional(),
          prompt: z.string().trim().min(1).optional(),
          idempotencyKey: z.string().optional(),
          attachmentIds: z.array(z.string().uuid()).max(10).default([]),
        }),
      )
      .mutation(({ input }) =>
        engine.prompt(
          input.accountId,
          input.sessionId,
          input.message ?? input.prompt ?? '',
          input.idempotencyKey,
          input.attachmentIds,
        ),
      ),
    uploadAttachment: procedure
      .input(sessionScope.extend(attachmentInput.shape))
      .mutation(({ input }) => {
        get(input);
        const file = engine.attachments.upload(
          input.accountId,
          input.sessionId,
          input,
        );
        engine.emit(get(input), 'attachment-added', file);
        return file;
      }),
    attachments: procedure.input(sessionScope).query(({ input }) => {
      get(input);
      return engine.attachments.list(input.accountId, input.sessionId);
    }),
    readAttachment: procedure
      .input(sessionScope.extend({ attachmentId: z.string().uuid() }))
      .query(({ input }) => {
        get(input);
        return engine.attachments.read(
          input.accountId,
          input.sessionId,
          input.attachmentId,
        );
      }),
    removeAttachment: procedure
      .input(sessionScope.extend({ attachmentId: z.string().uuid() }))
      .mutation(({ input }) => {
        const s = get(input);
        if (
          [...s.messages, ...s.queue].some((entry) =>
            entry.attachmentIds?.includes(input.attachmentId),
          )
        )
          fail(
            'CONFLICT',
            'Submitted attachments remain part of the transcript; clear messages to remove them',
          );
        engine.attachments.remove(
          input.accountId,
          input.sessionId,
          input.attachmentId,
        );
        engine.emit(get(input), 'attachment-removed', {
          id: input.attachmentId,
        });
        return { removed: true };
      }),
    get: procedure
      .input(sessionScope)
      .query(({ input }) => engine.public(get(input))),
    list: procedure.input(listSchema).query(({ input }) => list(input)),
    listPreviewItems: procedure
      .input(listSchema)
      .query(({ input }) => list(input)),
    messages: procedure
      .input(sessionScope)
      .query(({ input }) => get(input).messages),
    messageRows: procedure
      .input(sessionScope.extend({ turnIds: z.array(z.string()).optional() }))
      .query(({ input }) =>
        get(input).messages.filter(
          (m) => !input.turnIds || input.turnIds.includes(m.turnId),
        ),
      ),
    listRuns: procedure
      .input(sessionScope)
      .query(({ input }) => get(input).runs),
    liveToolCalls: procedure
      .input(sessionScope)
      .query(({ input }) => get(input).toolCalls.slice(-3)),
    eventsSince: procedure
      .input(
        sessionScope.extend({
          cursor: z.number().int().nonnegative().default(0),
        }),
      )
      .query(({ input }) =>
        get(input).events.filter((e) => e.cursor > input.cursor),
      ),
    events: procedure
      .input(
        sessionScope.extend({
          cursor: z.number().int().nonnegative().default(0),
        }),
      )
      .subscription(({ input, signal }) =>
        engine.subscribe(
          input.accountId,
          input.sessionId,
          input.cursor,
          signal,
        ),
      ),
    queue: procedure
      .input(
        sessionScope.extend({
          prompt: z.string().trim().min(1),
          idempotencyKey: z.string().optional(),
          attachmentIds: z.array(z.string().uuid()).max(10).default([]),
        }),
      )
      .mutation(({ input }) =>
        engine.queue(
          input.accountId,
          input.sessionId,
          input.prompt,
          'prompt',
          input.idempotencyKey,
          input.attachmentIds,
        ),
      ),
    steer: procedure
      .input(
        sessionScope.extend({
          prompt: z.string().trim().min(1),
          idempotencyKey: z.string().optional(),
          attachmentIds: z.array(z.string().uuid()).max(10).default([]),
        }),
      )
      .mutation(({ input }) =>
        engine.queue(
          input.accountId,
          input.sessionId,
          input.prompt,
          'steering',
          input.idempotencyKey,
          input.attachmentIds,
        ),
      ),
    abort: procedure
      .input(sessionScope)
      .mutation(({ input }) =>
        engine.stop(input.accountId, input.sessionId, 'aborted'),
      ),
    interrupt: procedure
      .input(sessionScope)
      .mutation(({ input }) =>
        engine.stop(input.accountId, input.sessionId, 'interrupted'),
      ),
    resolveSuspension: procedure
      .input(
        sessionScope.extend({ toolCallId: z.string(), response: z.unknown() }),
      )
      .mutation(({ input }) =>
        engine.resolve(
          input.accountId,
          input.sessionId,
          input.toolCallId,
          input.response,
        ),
      ),
    rejectSuspension: procedure
      .input(sessionScope.extend({ toolCallId: z.string(), error: z.string() }))
      .mutation(({ input }) => {
        const s = get(input);
        const suspension = s.suspensions.find(
          (s) => s.toolCallId === input.toolCallId,
        );
        if (!suspension) fail('NOT_FOUND', 'Decision not found');
        if (suspension.kind === 'ask-user-question') {
          engine.stop(input.accountId, input.sessionId, 'interrupted');
          return engine.public(get(input));
        }
        return engine.resolve(
          input.accountId,
          input.sessionId,
          input.toolCallId,
          {
            verdict: suspension.kind === 'approval' ? 'deny' : 'cancel',
            always: false,
          },
        );
      }),
    compact: procedure
      .input(
        sessionScope.extend({
          instructions: z.string().min(1).max(2000).optional(),
        }),
      )
      .mutation(({ input }) =>
        engine.compact(input.accountId, input.sessionId, input.instructions),
      ),
    update: procedure
      .input(
        sessionScope.extend({
          title: z.string().min(1).max(500).optional(),
          model: selectionSchema.optional(),
          permissionMode: z
            .enum(['read-only', 'guard', 'full-access'])
            .optional(),
          runtimeConfig: runtimeSchema.optional(),
          browserBinding: bindingSchema.optional(),
          pinned: z.boolean().optional(),
          incognito: z.boolean().optional(),
        }),
      )
      .mutation(({ input }) => {
        const s = get(input);
        if (input.pinned && s.ephemeral)
          fail('CONFLICT', 'Ephemeral sessions cannot be pinned');
        if (
          input.browserBinding &&
          s.browserBinding &&
          (input.browserBinding.profileId !== s.browserBinding.profileId ||
            input.browserBinding.browserMode !== s.browserBinding.browserMode)
        )
          fail('CONFLICT', 'Browser binding cannot switch profile or mode');
        if (
          input.incognito !== undefined &&
          input.incognito !== s.incognito &&
          s.messages.length
        )
          fail('CONFLICT', 'Incognito mode is fixed after the first message');
        if (
          (s.status === 'running' || s.status === 'suspended') &&
          (input.runtimeConfig?.workingDirs || input.incognito !== undefined)
        )
          fail(
            'CONFLICT',
            'Working directories and mode cannot change while running',
          );
        const { accountId, sessionId, runtimeConfig, ...patch } = input;
        Object.assign(s, patch);
        if (runtimeConfig)
          s.runtimeConfig = { ...s.runtimeConfig, ...runtimeConfig };
        if (s.incognito) {
          s.ephemeral = true;
          s.pinned = false;
        }
        return updated(s);
      }),
    clearMessages: procedure.input(sessionScope).mutation(({ input }) => {
      const s = get(input);
      if (['running', 'suspended'].includes(s.status))
        fail('CONFLICT', 'Cannot clear an active run');
      for (const file of engine.attachments.list(
        input.accountId,
        input.sessionId,
      ))
        engine.attachments.remove(input.accountId, input.sessionId, file.id);
      s.messages = [];
      s.context = [];
      s.runs = [];
      s.toolCalls = [];
      s.suspensions = [];
      s.queue = [];
      return { session: updated(s) };
    }),
    branch: procedure
      .input(sessionScope.extend({ messageId: z.string() }))
      .mutation(({ input }) => {
        const s = get(input);
        const index = s.messages.findIndex(
          (m) => m.id === input.messageId && m.role === 'assistant',
        );
        if (index < 0)
          fail('BAD_REQUEST', 'Branch point must be an assistant message');
        const { id: oldId, ...creation } = createSchema.parse(s);
        const branch = engine.create({
          ...creation,
          parentId: s.id,
          title: `${s.title} (branch)`,
        });
        const copied = new Map<string, string>();
        branch.messages = s.messages.slice(0, index + 1).map((m) => ({
          ...m,
          attachmentIds: m.attachmentIds?.map((id) => {
            let target = copied.get(id);
            if (!target) {
              target = engine.attachments.copy(
                input.accountId,
                s.id,
                branch.id,
                id,
              );
              copied.set(id, target);
            }
            return target;
          }),
        }));
        branch.context = branch.messages
          .filter((m) => m.role !== 'tool')
          .map((m) =>
            m.role === 'user'
              ? {
                  role: 'user' as const,
                  content: engine.userContent(
                    branch,
                    m.content,
                    m.attachmentIds,
                  ),
                }
              : { role: 'assistant' as const, content: m.content },
          );
        return { session: updated(branch) };
      }),
    editUserMessage: procedure
      .input(
        sessionScope.extend({
          messageId: z.string(),
          content: z.string().trim().min(1),
        }),
      )
      .mutation(async ({ input }) => {
        const s = get(input);
        const index = s.messages.findIndex(
          (m) => m.id === input.messageId && m.role === 'user',
        );
        if (index < 0) fail('BAD_REQUEST', 'Message must be a user message');
        engine.stop(input.accountId, input.sessionId, 'aborted');
        await engine.wait(input.accountId, input.sessionId);
        const latest = get(input);
        latest.messages = latest.messages.slice(0, index);
        latest.context = latest.messages
          .filter((m) => m.role !== 'tool')
          .map((m) =>
            m.role === 'user'
              ? {
                  role: 'user' as const,
                  content: engine.userContent(
                    latest,
                    m.content,
                    m.attachmentIds,
                  ),
                }
              : { role: 'assistant' as const, content: m.content },
          );
        engine.save(latest);
        const session = engine.prompt(
          input.accountId,
          input.sessionId,
          input.content,
          undefined,
          s.messages[index]?.attachmentIds,
        );
        return { session, messages: get(input).messages };
      }),
    markRead: procedure.input(sessionScope).mutation(({ input }) => {
      const s = get(input);
      s.readAt = new Date().toISOString();
      updated(s);
      return { readAt: s.readAt };
    }),
    markUnread: procedure.input(sessionScope).mutation(({ input }) => {
      const s = get(input);
      s.readAt = null;
      updated(s);
      return { readAt: null };
    }),
    archive: procedure.input(sessionScope).mutation(({ input }) => {
      engine.stop(input.accountId, input.sessionId, 'aborted');
      const s = get(input);
      s.archived = true;
      return updated(s);
    }),
    unarchive: procedure.input(sessionScope).mutation(({ input }) => {
      const s = get(input);
      s.archived = false;
      return updated(s);
    }),
    delete: procedure.input(sessionScope).mutation(async ({ input }) => {
      engine.stop(input.accountId, input.sessionId, 'aborted');
      await engine.wait(input.accountId, input.sessionId);
      for (const file of engine.attachments.list(
        input.accountId,
        input.sessionId,
      ))
        engine.attachments.remove(input.accountId, input.sessionId, file.id);
      store.set(input.accountId, 'sessions', input.sessionId, null);
      return { deleted: true };
    }),
    moveToProject: procedure
      .input(sessionScope.extend({ projectId: z.string().nullable() }))
      .mutation(({ input }) => {
        const s = get(input);
        if (input.projectId)
          engine.requireProject(input.accountId, input.projectId);
        s.projectId = input.projectId;
        const routine = s.routineId
          ? (store.get(input.accountId, 'routines', s.routineId) as Record<
              string,
              unknown
            > | null)
          : null;
        const db = store.accountDb(input.accountId);
        try {
          db.exec('BEGIN IMMEDIATE');
          s.updatedAt = Date.now();
          const set = db.prepare('INSERT OR REPLACE INTO kv VALUES (?,?,?)');
          set.run('sessions', s.id, JSON.stringify(s));
          if (s.routineId && routine?.kind === 'heartbeat')
            set.run(
              'routines',
              s.routineId,
              JSON.stringify({ ...routine, projectId: input.projectId }),
            );
          db.exec('COMMIT');
        } catch (error) {
          db.exec('ROLLBACK');
          throw error;
        } finally {
          db.close();
        }
        return engine.public(s);
      }),
    childSessions: procedure
      .input(
        scope.extend({
          parentId: z.string(),
          archived: z.enum(['exclude', 'include', 'only']).default('exclude'),
        }),
      )
      .query(({ input }) =>
        engine
          .list(input.accountId)
          .filter(
            (s) =>
              s.parentId === input.parentId &&
              (input.archived === 'include' ||
                s.archived === (input.archived === 'only')),
          )
          .map((s) => engine.public(s)),
      ),
    removeQueuedMessage: procedure
      .input(
        sessionScope.extend({
          queuedMessageId: z.string(),
          version: z.number().int().optional(),
        }),
      )
      .mutation(({ input }) => {
        const s = get(input);
        const item = s.queue.find((item) => item.id === input.queuedMessageId);
        if (
          !item ||
          (input.version !== undefined && item.version !== input.version)
        )
          fail('CONFLICT', 'Queued input changed or was delivered');
        s.queue = s.queue.filter((item) => item.id !== input.queuedMessageId);
        return updated(s);
      }),
    updateQueuedMessage: procedure
      .input(
        sessionScope.extend({
          queuedMessageId: z.string(),
          version: z.number().int(),
          prompt: z.string().trim().min(1),
        }),
      )
      .mutation(({ input }) => {
        const s = get(input);
        const item = s.queue.find((item) => item.id === input.queuedMessageId);
        if (!item || item.version !== input.version)
          fail('CONFLICT', 'Queued input changed or was delivered');
        item.prompt = input.prompt;
        item.version++;
        return updated(s);
      }),
    moveQueuedMessage: procedure
      .input(
        sessionScope.extend({
          queuedMessageId: z.string(),
          version: z.number().int(),
          beforeTimestamp: z.number().nullable(),
        }),
      )
      .mutation(({ input }) => {
        const s = get(input);
        const item = s.queue.find((item) => item.id === input.queuedMessageId);
        if (!item || item.version !== input.version)
          fail('CONFLICT', 'Queued input changed or was delivered');
        const before =
          input.beforeTimestamp === null
            ? -1
            : s.queue.findIndex(
                (item) => item.timestamp === input.beforeTimestamp,
              );
        if (input.beforeTimestamp !== null && before < 0)
          fail('CONFLICT', 'Queue position changed');
        s.queue = s.queue.filter((other) => other.id !== item.id);
        const target =
          input.beforeTimestamp === null
            ? s.queue.length
            : s.queue.findIndex(
                (other) => other.timestamp === input.beforeTimestamp,
              );
        s.queue.splice(target, 0, { ...item, version: item.version + 1 });
        return updated(s);
      }),
    turns,
  });
  return {
    sessions,
    turns,
    models: createModelRouter(services, engine),
    projects: createProjectRouter(services, engine),
    routines: createRoutineRouter(services, engine),
    mcp: createMcpRouter(services, engine),
  };
}
