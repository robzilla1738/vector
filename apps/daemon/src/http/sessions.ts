import { spawn } from 'node:child_process';
import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { AgentEngine, Session } from '@aux/agent';
import { TRPCError } from '@trpc/server';
import type { Context, Hono } from 'hono';
import { z } from 'zod';
import type { DaemonServices } from './server.js';

function preview(session: Session, engine: AgentEngine) {
  const suspension = engine.public(session).suspension;
  let status: string = session.status;
  if (session.status === 'suspended')
    status =
      suspension?.kind === 'ask-user-question'
        ? 'awaiting-answer'
        : 'awaiting-approval';
  else if (['errored', 'aborted'].includes(session.status)) status = 'error';
  else if (session.status === 'idle')
    status = session.readAt === null ? 'finished-unread' : 'idle';
  return {
    id: session.id,
    title: session.title,
    status,
    unread: session.readAt === null,
    pinned: session.pinned,
    canPin: !session.ephemeral,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    projectId: session.projectId ?? null,
    ...(suspension
      ? {
          popover: {
            id: suspension.toolCallId,
            kind: suspension.kind,
            request: suspension.request,
          },
        }
      : {}),
  };
}
export function installSessionHttp(
  app: Hono,
  { store }: DaemonServices,
  engine: AgentEngine,
) {
  const account = (c: Context) => {
    const accountId = z.coerce
      .number()
      .int()
      .nonnegative()
      .parse(c.req.query('accountId'));
    store.requireAccount(accountId);
    return accountId;
  };
  const recent = (accountId: number) =>
    engine
      .list(accountId)
      .filter((session) => !session.archived && !session.ephemeral)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  app.get('/session/for-chrome/recents', (c) =>
    c.json(
      recent(account(c))
        .slice(0, 20)
        .map((session) => preview(session, engine)),
    ),
  );
  app.get('/session/for-chrome/chats', (c) => {
    const sessions = recent(account(c));
    return c.json({
      pinned: sessions.filter((s) => s.pinned).map((s) => preview(s, engine)),
      recents: sessions
        .filter((s) => !s.pinned)
        .slice(0, 20)
        .map((s) => preview(s, engine)),
    });
  });
  app.get('/session/for-chrome/search', (c) => {
    const query = z
      .string()
      .max(1000)
      .parse(c.req.query('q') ?? '')
      .toLocaleLowerCase();
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(200)
      .parse(c.req.query('limit') ?? 20);
    return c.json(
      recent(account(c))
        .filter((s) => s.title.toLocaleLowerCase().includes(query))
        .slice(0, limit)
        .map((s) => preview(s, engine)),
    );
  });
  app.get('/session/for-chrome/projects', (c) =>
    c.json(
      Object.values(store.all(account(c), 'projects')).filter(
        (value) =>
          value && typeof value === 'object' && !('archivedAt' in value),
      ),
    ),
  );
  app.get('/session/for-chrome/:sessionId/state', (c) => {
    const accountId = account(c);
    const session = store.get(
      accountId,
      'sessions',
      c.req.param('sessionId'),
    ) as Session | null;
    return c.json({
      state:
        !session || 'deleted' in session
          ? 'deleted'
          : session.archived
            ? 'archived'
            : 'active',
    });
  });
  app.post('/session/for-chrome/:sessionId/:action', async (c) => {
    const accountId = account(c),
      id = c.req.param('sessionId'),
      session = engine.get(accountId, id);
    const body = z.record(z.string(), z.unknown()).parse(await c.req.json());
    switch (c.req.param('action')) {
      case 'rename':
        session.title = z.string().trim().min(1).max(1000).parse(body.title);
        break;
      case 'archive':
        engine.stop(accountId, id, 'aborted');
        session.archived = true;
        break;
      case 'delete':
        engine.stop(accountId, id, 'aborted');
        await engine.wait(accountId, id);
        store.set(accountId, 'sessions', id, { id, deleted: true });
        return c.json({ success: true });
      case 'mark-read':
        session.readAt = new Date().toISOString();
        break;
      case 'pin':
        if (session.ephemeral)
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Temporary sessions cannot be pinned.',
          });
        session.pinned = true;
        break;
      case 'unpin':
        session.pinned = false;
        break;
      case 'move-to-project': {
        const projectId = z.string().nullable().parse(body.projectId);
        if (projectId) engine.requireProject(accountId, projectId);
        session.projectId = projectId;
        break;
      }
      case 'open-folder': {
        const root = engine.directory(session),
          requested = resolve(root, z.string().default('.').parse(body.path));
        if (
          (requested !== root && !requested.startsWith(root + sep)) ||
          !existsSync(requested) ||
          lstatSync(requested).isSymbolicLink() ||
          !realpathSync(requested).startsWith(realpathSync(root))
        )
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Folder is outside session storage.',
          });
        if (process.platform !== 'darwin')
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Native folder opening requires macOS.',
          });
        await new Promise<void>((done, reject) => {
          const opener = spawn('/usr/bin/open', [requested], {
            stdio: 'ignore',
          });
          opener.once('error', reject);
          opener.once('exit', (code) =>
            code === 0 ? done() : reject(new Error('Folder opener failed.')),
          );
        });
        return c.json({ success: true });
      }
      case 'resolve-popover': {
        const toolCallId = z.string().parse(body.popoverId),
          suspension = engine.public(session).suspension;
        if (suspension?.toolCallId !== toolCallId)
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This action is no longer pending.',
          });
        const action = z.enum(['approve', 'deny']).parse(body.action);
        engine.resolve(accountId, id, toolCallId, {
          verdict: action === 'approve' ? 'allow' : 'deny',
          always: false,
        });
        return c.json({ success: true });
      }
      default:
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unknown session action.',
        });
    }
    engine.emit(session, 'session-updated', {});
    return c.json(preview(session, engine));
  });
}
