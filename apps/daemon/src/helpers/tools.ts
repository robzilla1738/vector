import {
  type AgentEngine,
  type AgentExtensions,
  approveOperation,
  fail,
  type Session,
} from '@aux/agent';
import { z } from 'zod';
import type { HelperClient, HelperMethod } from './client.js';
import { notificationInputSchema } from './notifications.js';

type HelperTools = ReturnType<NonNullable<AgentExtensions['tools']>>;
const actionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('screenshot'),
    region: z
      .object({
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        height: z.number().positive(),
      })
      .optional(),
  }),
  z.object({
    action: z.literal('click'),
    finalAction: z.boolean().default(false),
    x: z.number(),
    y: z.number(),
    button: z.enum(['left', 'right']).default('left'),
  }),
  z.object({ action: z.literal('type'), text: z.string().min(1).max(50000) }),
  z.object({
    action: z.literal('scroll'),
    x: z.number().min(-10000).max(10000).default(0),
    y: z.number().min(-10000).max(10000),
  }),
  z.object({
    action: z.literal('key'),
    finalAction: z.boolean().default(false),
    key: z.string().min(1),
    modifiers: z
      .array(z.enum(['command', 'shift', 'option', 'control']))
      .default([]),
  }),
  z.object({ action: z.literal('list-apps') }),
  z.object({ action: z.literal('open-app'), bundleId: z.string().min(1) }),
  z.object({
    action: z.literal('applescript'),
    finalAction: z.boolean().default(false),
    script: z.string().min(1).max(100000),
  }),
]);
export function computerUseTools(
  engine: AgentEngine,
  client: HelperClient,
  session: Session,
  signal: AbortSignal,
): HelperTools {
  async function approve(
    toolCallId: string,
    title: string,
    operation: unknown,
    toolName = 'computer_use',
    mutation = true,
    defaultAsk = true,
  ) {
    return approveOperation(
      engine,
      session.accountId,
      session.id,
      toolCallId,
      toolName,
      title,
      operation,
      signal,
      { mutation, defaultAsk },
    );
  }
  return {
    computer_use: {
      description:
        'Operate macOS through the independent Aux helper. Native actions follow the session access policy and real OS permissions; consequential actions require distinct human confirmation. Posted input is not proof that the target action succeeded.',
      inputSchema: actionSchema,
      execute: async (input: z.infer<typeof actionSchema>, { toolCallId }) => {
        const current = engine.get(session.accountId, session.id);
        if (
          current.permissionMode === 'read-only' &&
          !['list-apps', 'screenshot'].includes(input.action)
        )
          fail('FORBIDDEN', 'Read-only sessions cannot actuate the desktop');
        const methods: Record<
          z.infer<typeof actionSchema>['action'],
          HelperMethod
        > = {
          screenshot: 'screen.capture',
          click: 'input.click',
          type: 'input.type',
          scroll: 'input.scroll',
          key: 'input.key',
          'list-apps': 'apps.list',
          'open-app': 'apps.open',
          applescript: 'automation.run',
        };
        await approveOperation(
          engine,
          session.accountId,
          session.id,
          toolCallId,
          'computer_use',
          `Native ${input.action}`,
          input,
          signal,
          {
            mutation: !['list-apps', 'screenshot'].includes(input.action),
            defaultAsk: input.action !== 'list-apps',
            finalAction: 'finalAction' in input && input.finalAction === true,
          },
        );
        const { action, ...params } = input;
        return client.call(
          methods[action],
          action === 'screenshot' ? (input.region ?? {}) : params,
          { signal },
        );
      },
    },
    contacts_search: {
      description:
        'Search macOS Contacts for an explicitly named person after human approval and OS Contacts permission.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(200),
        limit: z.number().int().min(1).max(100).default(20),
      }),
      execute: async (
        input: { query: string; limit: number },
        { toolCallId },
      ) => {
        await approve(
          toolCallId,
          'Look up a contact',
          input,
          'contacts_search',
          false,
        );
        return client.call('contacts.search', input, { signal });
      },
    },
    imessage_send: {
      description:
        'Send an iMessage only after the human reviews and confirms the exact recipient and complete body. No automatic retries are performed when outcome is uncertain.',
      inputSchema: z.object({
        recipient: z.string().trim().min(1).max(500),
        body: z.string().min(1).max(50000),
      }),
      execute: async (
        input: { recipient: string; body: string },
        { toolCallId },
      ) => {
        if (
          engine.get(session.accountId, session.id).permissionMode ===
          'read-only'
        )
          fail('FORBIDDEN', 'Read-only sessions cannot send messages');
        await approveOperation(
          engine,
          session.accountId,
          session.id,
          toolCallId,
          'imessage_send',
          'Send iMessage',
          { recipient: input.recipient, body: input.body },
          signal,
          { mutation: true, finalAction: true },
        );
        return client.call(
          'messages.send',
          { ...input, confirmed: true, operationId: toolCallId },
          { signal },
        );
      },
    },
  };
}

/** Always mount these names, including explicit unavailable capability results. */
export function notificationTools(
  service: import('./notifications.js').NotificationService | undefined,
  session: Session,
  signal: AbortSignal,
): HelperTools {
  return {
    notification: {
      description:
        'Show the exact title/body through the native notification helper after session policy and OS authorization checks. Optional sessionLink is this session ID, activating its bound ordinary Aux chat on click. Success means enqueued, never guaranteed delivery. Permission is requested only through explicit settings actions.',
      inputSchema: notificationInputSchema,
      execute: async (
        input: z.infer<typeof notificationInputSchema>,
        { toolCallId },
      ) => {
        if (!service)
          fail('PRECONDITION_FAILED', 'Native notifications are unavailable');
        return service.enqueue(session, input, toolCallId, signal);
      },
    },
    clip_search: {
      description:
        'Search owner-authorized clip evidence. This installation has no authorized clip source; the capability is unavailable and does not read the clipboard.',
      inputSchema: z.object({
        query: z.string().min(1).max(1000),
        from: z.number().nonnegative().optional(),
        to: z.number().nonnegative().optional(),
      }),
      execute: async () =>
        fail(
          'PRECONDITION_FAILED',
          'Clip search is unavailable: no owner-authorized clip source is configured',
        ),
    },
  };
}
