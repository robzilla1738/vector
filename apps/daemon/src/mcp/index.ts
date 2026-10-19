/** Implements docs/spec/daemon/services.md MCP client and local channels (MCP client). */

import { type AgentEngine, fail, scope } from '@aux/agent';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const serverSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('stdio'),
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    env: z.record(z.string(), z.string()).optional(),
  }),
  z.object({ type: z.literal('http'), url: z.url() }),
]);
const named = scope.extend({ name: z.string().min(1).max(100) });
interface Saved {
  server: z.infer<typeof serverSchema>;
  enabled: boolean;
  tools: unknown[];
  updatedAt: number;
}
export function createMcpRouter(
  { t, procedure, store }: DaemonServices,
  engine: AgentEngine,
) {
  const clients = new Map<string, Client>();
  engine.registerCloseHandler(async () => {
    await Promise.all([...clients.values()].map((client) => client.close()));
    clients.clear();
  });
  const key = (accountId: number, name: string) => `${accountId}:${name}`;
  async function connect(
    accountId: number,
    server: z.infer<typeof serverSchema>,
  ) {
    store.requireAccount(accountId);
    const client = new Client({ name: 'aux', version: '0.2.0' });
    const transport =
      server.type === 'stdio'
        ? new StdioClientTransport({
            command: server.command,
            args: server.args,
            env: {
              PATH: process.env.PATH ?? '/usr/bin:/bin',
              ...(server.env ?? {}),
            },
            stderr: 'pipe',
          })
        : new StreamableHTTPClientTransport(new URL(server.url));
    const timer = setTimeout(() => {
      void client.close();
    }, 15000);
    try {
      await client.connect(transport as Parameters<Client['connect']>[0], {
        timeout: 15000,
      });
      const inventory = await client.listTools({}, { timeout: 15000 });
      return { client, tools: inventory.tools };
    } catch (error) {
      await client.close();
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  function saved(accountId: number, name: string) {
    store.requireAccount(accountId);
    const value = store.get(accountId, 'mcp', name) as Saved | null;
    if (!value) fail('NOT_FOUND', 'MCP server not found');
    return value;
  }
  const redact = (value: Saved) => ({
    ...value,
    server:
      value.server.type === 'stdio'
        ? {
            ...value.server,
            env: value.server.env
              ? Object.fromEntries(
                  Object.keys(value.server.env).map((key) => [
                    key,
                    '[redacted]',
                  ]),
                )
              : {},
          }
        : value.server,
  });
  store.registerAccountDeletionHandler(async (accountId) => {
    for (const [name, client] of clients)
      if (name.startsWith(`${accountId}:`)) {
        await client.close();
        clients.delete(name);
      }
  });
  return t.router({
    testConnection: procedure
      .input(named.extend({ server: serverSchema }))
      .mutation(async ({ input }) => {
        const result = await connect(input.accountId, input.server);
        try {
          return { connected: true, tools: result.tools };
        } finally {
          await result.client.close();
        }
      }),
    saveServer: procedure
      .input(
        named.extend({
          server: serverSchema,
          previousName: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const result = await connect(input.accountId, input.server);
        await clients.get(key(input.accountId, input.name))?.close();
        if (input.previousName && input.previousName !== input.name) {
          await clients.get(key(input.accountId, input.previousName))?.close();
          clients.delete(key(input.accountId, input.previousName));
          store.set(input.accountId, 'mcp', input.previousName, null);
        }
        clients.set(key(input.accountId, input.name), result.client);
        const value: Saved = {
          server: input.server,
          enabled: true,
          tools: result.tools,
          updatedAt: Date.now(),
        };
        store.set(input.accountId, 'mcp', input.name, value);
        return { settings: redact(value), connection: { connected: true } };
      }),
    deleteServer: procedure.input(named).mutation(async ({ input }) => {
      saved(input.accountId, input.name);
      await clients.get(key(input.accountId, input.name))?.close();
      clients.delete(key(input.accountId, input.name));
      store.set(input.accountId, 'mcp', input.name, null);
      return { deleted: true };
    }),
    setEnabled: procedure
      .input(named.extend({ enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        const value = saved(input.accountId, input.name);
        if (input.enabled) {
          const result = await connect(input.accountId, value.server);
          await clients.get(key(input.accountId, input.name))?.close();
          clients.set(key(input.accountId, input.name), result.client);
          value.tools = result.tools;
        } else {
          await clients.get(key(input.accountId, input.name))?.close();
          clients.delete(key(input.accountId, input.name));
        }
        value.enabled = input.enabled;
        store.set(input.accountId, 'mcp', input.name, value);
        return { settings: redact(value) };
      }),
    connect: procedure.input(named).mutation(async ({ input }) => {
      const value = saved(input.accountId, input.name);
      if (!value.enabled) fail('FORBIDDEN', 'MCP server is disabled');
      const result = await connect(input.accountId, value.server);
      await clients.get(key(input.accountId, input.name))?.close();
      clients.set(key(input.accountId, input.name), result.client);
      value.tools = result.tools;
      store.set(input.accountId, 'mcp', input.name, value);
      return { connection: { connected: true }, settings: redact(value) };
    }),
    cancel: procedure.input(named).mutation(async ({ input }) => {
      saved(input.accountId, input.name);
      await clients.get(key(input.accountId, input.name))?.close();
      clients.delete(key(input.accountId, input.name));
      return { connection: { connected: false } };
    }),
    refreshTools: procedure.input(named).mutation(async ({ input }) => {
      const value = saved(input.accountId, input.name);
      if (!value.enabled) fail('FORBIDDEN', 'MCP server is disabled');
      const client = clients.get(key(input.accountId, input.name));
      if (!client) fail('PRECONDITION_FAILED', 'MCP server is disconnected');
      value.tools = (await client.listTools({}, { timeout: 15000 })).tools;
      store.set(input.accountId, 'mcp', input.name, value);
      return { settings: redact(value), connection: { connected: true } };
    }),
    connectionStatus: procedure.input(named).query(({ input }) => {
      const value = saved(input.accountId, input.name);
      return {
        connected: clients.has(key(input.accountId, input.name)),
        settings: redact(value),
      };
    }),
    callTool: procedure
      .input(
        named.extend({
          toolName: z.string(),
          arguments: z.record(z.string(), z.unknown()),
        }),
      )
      .mutation(async ({ input }) => {
        const value = saved(input.accountId, input.name);
        if (!value.enabled) fail('FORBIDDEN', 'MCP server is disabled');
        const client = clients.get(key(input.accountId, input.name));
        if (!client) fail('PRECONDITION_FAILED', 'MCP server is disconnected');
        return client.callTool(
          { name: input.toolName, arguments: input.arguments },
          undefined,
          { timeout: 30000 },
        );
      }),
  });
}
