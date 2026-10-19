import {
  type AgentEngine,
  type AgentExtensions,
  fail,
  type Session,
} from '@aux/agent';
import { z } from 'zod';
import type { HelperClient, HelperMethod } from './client.js';

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
    key: z.string().min(1),
    modifiers: z
      .array(z.enum(['command', 'shift', 'option', 'control']))
      .default([]),
  }),
  z.object({ action: z.literal('list-apps') }),
  z.object({ action: z.literal('open-app'), bundleId: z.string().min(1) }),
  z.object({
    action: z.literal('applescript'),
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
  ) {
    const answer = (await engine.suspend(
      session.accountId,
      session.id,
      toolCallId,
      'approval',
      {
        title,
        message:
          'Review this exact native operation before allowing execution.',
        operation,
      },
      signal,
    )) as { verdict: string };
    if (answer.verdict !== 'allow')
      fail('FORBIDDEN', 'The user denied the native operation');
  }
  return {
    computer_use: {
      description:
        'Operate macOS through the independent Aux helper. Native screen/input/launch/AppleScript actions require concrete human approval and real OS permission. Posted input is not proof that the target action succeeded.',
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
        if (input.action !== 'list-apps')
          await approve(toolCallId, `Native ${input.action}`, input);
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
        await approve(toolCallId, 'Look up a contact', input);
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
        const answer = (await engine.suspend(
          session.accountId,
          session.id,
          toolCallId,
          'action-confirmation',
          {
            title: 'Send iMessage',
            message: `Recipient: ${input.recipient}`,
            artifact: input.body,
          },
          signal,
        )) as { verdict: string };
        if (answer.verdict !== 'confirm')
          fail('FORBIDDEN', 'The user did not confirm this message');
        return client.call(
          'messages.send',
          { ...input, confirmed: true, operationId: toolCallId },
          { signal },
        );
      },
    },
  };
}
