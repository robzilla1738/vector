import { createInterface } from 'node:readline';
import { type Client, type Json, object, text } from './client.js';
import { executeTask, type TaskOptions } from './task.js';

const tools = [
  {
    name: 'exec',
    description:
      'Run or continue a browser task on the selected local account. Review and resolve approvals in Aux.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', minLength: 1 },
        session_id: { type: 'string' },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
  },
  {
    name: 'repl',
    description:
      'Evaluate JavaScript in a persistent account-bound browser sandbox.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        code: { type: 'string', minLength: 1 },
      },
      required: ['title', 'code'],
      additionalProperties: false,
    },
  },
];
export async function serveMcp(
  client: Client,
  options: TaskOptions,
): Promise<void> {
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  let initialized = false;
  let ready = false;
  let replId: string | undefined;
  let replQueue: Promise<unknown> = Promise.resolve();
  const pending = new Set<Promise<void>>();
  const reply = (id: Json, result: Json) =>
    process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);
  const fail = (id: Json, code: number, message: string) =>
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })}\n`,
    );
  async function dispatch(line: string): Promise<void> {
    let request: Record<string, Json>;
    try {
      request = object(JSON.parse(line) as Json);
    } catch {
      fail(null, -32700, 'Invalid JSON message.');
      return;
    }
    const id = request.id;
    if (
      request.jsonrpc !== '2.0' ||
      typeof request.method !== 'string' ||
      (id !== undefined && typeof id !== 'string' && typeof id !== 'number')
    ) {
      fail(null, -32600, 'Invalid JSON-RPC request.');
      return;
    }
    if (request.method === 'notifications/initialized') {
      if (initialized) ready = true;
      return;
    }
    if (id === undefined) return;
    try {
      const params = request.params ? object(request.params) : {};
      if (request.method === 'initialize') {
        if (initialized) {
          fail(id, -32600, 'Already initialized.');
          return;
        }
        if (
          typeof params.protocolVersion !== 'string' ||
          !params.clientInfo ||
          !params.capabilities
        ) {
          fail(id, -32602, 'Missing initialization parameters.');
          return;
        }
        initialized = true;
        reply(id, {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          serverInfo: { name: 'aux', version: '0.2.0' },
        });
        return;
      }
      if (request.method === 'ping') {
        reply(id, {});
        return;
      }
      if (!ready) {
        fail(id, -32000, 'Initialize the connection before using tools.');
        return;
      }
      if (request.method === 'tools/list') {
        reply(id, { tools });
        return;
      }
      if (request.method !== 'tools/call') {
        fail(id, -32601, 'Unknown method.');
        return;
      }
      const input = object(params.arguments ?? {});
      let result: Json;
      if (params.name === 'exec') {
        result = await executeTask(
          client,
          text(input.prompt),
          options,
          input.session_id === undefined ? undefined : text(input.session_id),
        );
      } else if (params.name === 'repl') {
        text(input.title);
        const code = text(input.code);
        if (!code.trim()) throw new Error('Code must not be empty.');
        const evaluation = replQueue.then(async () => {
          if (!replId)
            replId = text(
              object(await client.scoped('cli.replStart', {}, true)).id,
            );
          return client.scoped('cli.replRun', { id: replId, code }, true);
        });
        replQueue = evaluation.catch(() => {});
        result = await evaluation;
      } else {
        fail(id, -32602, 'Unknown tool.');
        return;
      }
      reply(id, {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        isError: false,
      });
    } catch (error) {
      if (request.method === 'tools/call')
        reply(id, {
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : 'Tool failed.',
            },
          ],
          isError: true,
        });
      else
        fail(
          id,
          -32602,
          error instanceof Error ? error.message : 'Invalid parameters.',
        );
    }
  }
  try {
    for await (const line of lines) {
      const operation = dispatch(line);
      pending.add(operation);
      void operation.finally(() => pending.delete(operation));
    }
    await Promise.all(pending);
  } finally {
    if (replId) await client.scoped('cli.replClose', { id: replId }, true);
    lines.close();
  }
}
