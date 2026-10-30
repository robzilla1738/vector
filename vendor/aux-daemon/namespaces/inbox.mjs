/** The `inbox` tRPC namespace: inbox messages and web notification grants, kept by the inbox
 * store (stores/inbox.mjs). Same input schemas and outputs as the supplied router. */
import {create as createInboxStore} from '../stores/inbox.mjs';

const PERMISSIONS = ['allow_for_ai', 'allow', 'deny', 'default'];

export function create({accountProcedure, z, stateDb}) {
  const inbox = createInboxStore({stateDb});
  return {
    ingest: accountProcedure.input(z.object({
      source: z.string(), externalEventId: z.string().optional(), threadKey: z.string().optional(), title: z.string(), content: z.string(), preview: z.string().optional(),
      from: z.object({id: z.string().optional(), name: z.string().optional(), type: z.enum(['user', 'bot', 'system', 'service']).optional()}).optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    })).mutation(({ctx, input}) => inbox.ingestInboxMessage(ctx.accountId, {...input, metadata: input.metadata ?? {}})),
    overview: accountProcedure.input(z.object({messageLimit: z.number().optional()})).query(({ctx, input}) =>
      ({messages: inbox.listInboxMessages(ctx.accountId, {limit: input.messageLimit ?? 20}), notificationGrants: inbox.listNotificationGrants(ctx.accountId)})),
    listNotificationGrants: accountProcedure.query(({ctx}) => inbox.listNotificationGrants(ctx.accountId)),
    getNotificationGrant: accountProcedure.input(z.object({origin: z.string()})).query(({ctx, input}) => inbox.getNotificationGrant(ctx.accountId, input.origin) ?? null),
    revokeNotificationGrant: accountProcedure.input(z.object({origin: z.string()})).mutation(({ctx, input}) => {
      inbox.revokeNotificationGrant(ctx.accountId, input.origin);
      return {success: true};
    }),
    syncNotificationPermission: accountProcedure.input(z.object({
      origin: z.string(), permission: z.enum(PERMISSIONS), source: z.enum(['api', 'native_ui']), timestamp: z.number().optional(),
    })).mutation(({ctx, input}) => ({success: true, grant: inbox.syncNotificationGrantFromPermission({accountId: ctx.accountId, origin: input.origin,
      permission: input.permission, timestamp: input.timestamp}) ?? null})),
  };
}
