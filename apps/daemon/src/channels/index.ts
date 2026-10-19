import {
  type AgentExtensions,
  approveOperation,
  fail,
  type Session,
  scope,
} from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { type ChannelService, channelPolicy } from './service.js';

export type {
  ChannelPolicy,
  Connection,
  Pairing,
  Principal,
} from './service.js';
export { ChannelService } from './service.js';
export type { ChannelTransport, TelegramUpdate } from './telegram.js';

export function createChannelRouter(
  { t, procedure, store }: DaemonServices,
  service: ChannelService,
) {
  const connectionScope = scope.extend({ connectionId: z.string().uuid() });
  const senderScope = connectionScope.extend({
    senderId: z.string().regex(/^\d{1,20}$/),
  });
  store.registerAccountDeletionHandler(async (accountId) => {
    for (const connection of service.list(accountId))
      await service.stop(accountId, connection.id);
  });
  return t.router({
    connections: t.router({
      create: procedure
        .input(
          scope.extend({
            platform: z.literal('telegram'),
            name: z.string().trim().min(1).max(200),
            token: z.string().min(1).max(250),
            enabled: z.boolean().default(true),
          }),
        )
        .mutation(({ input }) => service.create(input.accountId, input)),
      list: procedure
        .input(scope)
        .query(({ input }) => service.list(input.accountId)),
      update: procedure
        .input(
          connectionScope.extend({
            name: z.string().trim().min(1).max(200).optional(),
            enabled: z.boolean().optional(),
            token: z.string().min(1).max(250).optional(),
          }),
        )
        .mutation(({ input }) =>
          service.update(input.accountId, input.connectionId, input),
        ),
      remove: procedure
        .input(connectionScope)
        .mutation(({ input }) =>
          service.remove(input.accountId, input.connectionId),
        ),
      restart: procedure
        .input(connectionScope)
        .mutation(({ input }) =>
          service.restart(input.accountId, input.connectionId),
        ),
    }),
    pairing: t.router({
      list: procedure
        .input(scope.extend({ connectionId: z.string().uuid().optional() }))
        .query(({ input }) =>
          service.pairings(input.accountId, input.connectionId),
        ),
      approve: procedure
        .input(scope.extend({ requestId: z.string().uuid() }))
        .mutation(({ input }) =>
          service.decide(input.accountId, input.requestId, true),
        ),
      reject: procedure
        .input(scope.extend({ requestId: z.string().uuid() }))
        .mutation(({ input }) =>
          service.decide(input.accountId, input.requestId, false),
        ),
    }),
    principals: t.router({
      list: procedure
        .input(connectionScope)
        .query(({ input }) =>
          service.principals(input.accountId, input.connectionId),
        ),
      update: procedure
        .input(senderScope.extend({ enabled: z.boolean() }))
        .mutation(({ input }) =>
          service.updatePrincipal(
            input.accountId,
            input.connectionId,
            input.senderId,
            input.enabled,
          ),
        ),
      remove: procedure
        .input(senderScope)
        .mutation(({ input }) =>
          service.removePrincipal(
            input.accountId,
            input.connectionId,
            input.senderId,
          ),
        ),
    }),
    policies: t.router({
      get: procedure
        .input(connectionScope)
        .query(({ input }) =>
          service.policy(input.accountId, input.connectionId),
        ),
      update: procedure
        .input(connectionScope.extend({ policy: channelPolicy }))
        .mutation(({ input }) =>
          service.updatePolicy(
            input.accountId,
            input.connectionId,
            input.policy,
          ),
        ),
    }),
  });
}
const sendInput = z.object({
  connectionId: z.string().uuid(),
  senderId: z.string().regex(/^\d{1,20}$/),
  text: z.string().min(1).max(4096),
});
export function channelTools(
  service: ChannelService,
  session: Session,
  signal: AbortSignal,
): ReturnType<NonNullable<AgentExtensions['tools']>> {
  const source = service.sessionSource(session.accountId, session.id);
  return {
    channel_connections: {
      description:
        'List local paired channel connections and their approved sender identities; never reveals tokens.',
      inputSchema: z.object({}),
      execute: async () =>
        service
          .list(session.accountId)
          .filter(
            (connection) => !source || connection.id === source.connectionId,
          )
          .map((connection) => ({
            ...connection,
            senders: service
              .principals(session.accountId, connection.id)
              .filter(
                (principal) =>
                  !source || principal.senderId === source.senderId,
              ),
          })),
    },
    channel_send: {
      description:
        'Send an exact message to an approved channel sender after local human confirmation. Replies must be enabled by connection policy. An uncertain send is never retried automatically.',
      inputSchema: sendInput,
      execute: async (
        input: z.infer<typeof sendInput>,
        { toolCallId }: { toolCallId: string },
      ) => {
        if (
          source &&
          (input.connectionId !== source.connectionId ||
            input.senderId !== source.senderId)
        )
          fail(
            'FORBIDDEN',
            'Channel tasks can reply only to their own approved sender',
          );
        const current = service.engine.get(session.accountId, session.id);
        if (current.permissionMode === 'read-only')
          fail('FORBIDDEN', 'Read-only sessions cannot send channel messages');
        service.get(session.accountId, input.connectionId);
        if (
          !service.principal(
            session.accountId,
            input.connectionId,
            input.senderId,
          )?.enabled ||
          !service.policy(session.accountId, input.connectionId).allowReplies
        )
          fail(
            'FORBIDDEN',
            'Enable replies and approve this sender before sending',
          );
        await approveOperation(
          service.engine,
          session.accountId,
          session.id,
          toolCallId,
          'channel_send',
          'Send channel message',
          input,
          signal,
          { mutation: true, finalAction: true },
        );
        return service.send(
          session.accountId,
          input.connectionId,
          input.senderId,
          input.text,
          toolCallId,
          signal,
        );
      },
    },
  };
}
