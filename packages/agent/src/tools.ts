import { spawn } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { tool } from 'ai';
import { z } from 'zod';
import type { AgentEngine } from './engine.js';
import { fail } from './storage.js';

export function within(path: string, root: string) {
  const suffix = relative(root, path);
  return suffix === '' || (!suffix.startsWith('..') && !isAbsolute(suffix));
}
function canonical(path: string) {
  return existsSync(path)
    ? realpathSync(path)
    : join(realpathSync(dirname(path)), path.split('/').at(-1) ?? '');
}
export function sessionTools(
  engine: AgentEngine,
  accountId: number,
  sessionId: string,
  signal: AbortSignal,
) {
  async function tracked<T>(
    name: string,
    input: unknown,
    id: string,
    execute: () => Promise<T> | T,
  ) {
    const session = engine.get(accountId, sessionId);
    session.toolCalls.push({
      id,
      name,
      input,
      status: 'running',
      startedAt: Date.now(),
    });
    engine.emit(session, 'tool-started', { id, name, input });
    try {
      const result = await execute();
      signal.throwIfAborted();
      const latest = engine.get(accountId, sessionId);
      const call = latest.toolCalls.find((call) => call.id === id);
      const safe = JSON.parse(
        engine.credentials.redact(accountId, JSON.stringify(result)),
      ) as T;
      if (call) {
        call.status = 'completed';
        call.result = safe;
        call.finishedAt = Date.now();
      }
      engine.emit(latest, 'tool-finished', { id, result: safe });
      return safe;
    } catch (error) {
      const latest = engine.get(accountId, sessionId);
      const message = engine.credentials.redact(
        accountId,
        error instanceof Error ? error.message : String(error),
      );
      const call = latest.toolCalls.find((call) => call.id === id);
      if (call) {
        call.status = 'errored';
        call.error = message;
        call.finishedAt = Date.now();
      }
      engine.emit(latest, 'tool-error', { id, error: message });
      throw new Error(message);
    }
  }
  async function approve(id: string, title: string, operation: unknown) {
    const response = (await engine.suspend(
      accountId,
      sessionId,
      id,
      'approval',
      {
        title,
        message: 'Review the concrete operation before allowing execution.',
        operation,
      },
      signal,
    )) as { verdict: string };
    if (response.verdict !== 'allow')
      fail('FORBIDDEN', 'The user denied this operation');
  }
  async function filePath(
    path: string,
    operation: 'read' | 'write',
    id: string,
  ) {
    const session = engine.get(accountId, sessionId);
    const full = canonical(resolve(engine.directory(session), path));
    const forbidden = [
      join(engine.store.accountHome(accountId), 'credentials.json'),
      join(engine.store.home, 'installation'),
    ];
    if (
      forbidden.some((root) => within(full, root)) ||
      /(?:^|\/)(?:credentials\.json|private-key\.pem|token-secret)(?:$|\/)/.test(
        full,
      )
    )
      fail('FORBIDDEN', 'Agent tools cannot access credential material');
    const rules = session.permissionOverrides;
    if (rules?.deny.some((root) => within(full, canonical(root))))
      fail('FORBIDDEN', 'Path is denied by session policy');
    if (operation === 'write' && session.permissionMode === 'read-only')
      fail('FORBIDDEN', 'Session filesystem is read-only');
    const roots = [
      engine.directory(session),
      ...(session.runtimeConfig?.workingDirs ?? []),
    ].map(canonical);
    if (
      rules?.ask.some((root) => within(full, canonical(root))) ||
      (session.permissionMode !== 'full-access' &&
        !roots.some((root) => within(full, root)))
    )
      await approve(id, `${operation} file`, { path: full, operation });
    return full;
  }
  return {
    read_file: tool({
      description:
        'Read a permitted UTF-8 text file, with optional line slice. Credential files are unavailable.',
      inputSchema: z.object({
        path: z.string().min(1),
        startLine: z.number().int().positive().default(1),
        lineCount: z.number().int().min(1).max(2000).default(500),
      }),
      execute: (input, { toolCallId }) =>
        tracked('read_file', input, toolCallId, async () => {
          const path = await filePath(input.path, 'read', toolCallId);
          const text = readFileSync(path, 'utf8');
          if (text.length > 2_000_000)
            fail('BAD_REQUEST', 'File exceeds text read limit');
          return {
            path,
            content: text
              .split('\n')
              .slice(input.startLine - 1, input.startLine - 1 + input.lineCount)
              .join('\n'),
          };
        }),
    }),
    write_file: tool({
      description:
        'Create or explicitly overwrite a permitted text file. Existing files require overwrite=true.',
      inputSchema: z.object({
        path: z.string().min(1),
        content: z.string().max(2_000_000),
        overwrite: z.boolean().default(false),
      }),
      execute: (input, { toolCallId }) =>
        tracked('write_file', input, toolCallId, async () => {
          const path = await filePath(input.path, 'write', toolCallId);
          writeFileSync(path, input.content, {
            flag: input.overwrite ? 'w' : 'wx',
            mode: 0o600,
          });
          return { path, bytes: Buffer.byteLength(input.content) };
        }),
    }),
    edit_file: tool({
      description: 'Replace one exact unique occurrence in a permitted file.',
      inputSchema: z.object({
        path: z.string().min(1),
        oldText: z.string().min(1),
        newText: z.string(),
      }),
      execute: (input, { toolCallId }) =>
        tracked('edit_file', input, toolCallId, async () => {
          const path = await filePath(input.path, 'write', toolCallId);
          const before = readFileSync(path, 'utf8');
          if (before.split(input.oldText).length !== 2)
            fail('CONFLICT', 'Original text must match exactly once');
          writeFileSync(path, before.replace(input.oldText, input.newText));
          return { path, replaced: true };
        }),
    }),
    bash: tool({
      description:
        'Run a shell command after human approval of its exact command and working directory. Output is bounded. Shell execution is unavailable in read-only mode.',
      inputSchema: z.object({
        command: z.string().min(1),
        workingDirectory: z.string().optional(),
        timeoutMs: z.number().int().min(100).max(120000).default(30000),
      }),
      execute: (input, { toolCallId }) =>
        tracked('bash', input, toolCallId, async () => {
          const session = engine.get(accountId, sessionId);
          if (session.permissionMode === 'read-only')
            fail(
              'FORBIDDEN',
              'Shell execution is disabled for read-only sessions',
            );
          const cwd = canonical(
            input.workingDirectory ?? engine.directory(session),
          );
          await approve(toolCallId, 'Execute shell command', {
            command: input.command,
            workingDirectory: cwd,
          });
          return new Promise<{
            stdout: string;
            stderr: string;
            exitCode: number | null;
          }>((resolve, reject) => {
            const child = spawn('/bin/sh', ['-c', input.command], {
              cwd,
              detached: true,
              env: {
                PATH: process.env.PATH ?? '/usr/bin:/bin',
                HOME: engine.directory(session),
                TMPDIR: engine.directory(session),
              },
              stdio: ['ignore', 'pipe', 'pipe'],
            });
            let stdout = '',
              stderr = '';
            const kill = () => {
              if (child.pid) {
                try {
                  process.kill(-child.pid, 'SIGKILL');
                } catch (error) {
                  if ((error as NodeJS.ErrnoException).code !== 'ESRCH')
                    reject(error);
                }
              }
            };
            const timeout = setTimeout(kill, input.timeoutMs);
            signal.addEventListener('abort', kill, { once: true });
            child.stdout.on('data', (chunk) => {
              stdout = (stdout + chunk.toString()).slice(-100000);
            });
            child.stderr.on('data', (chunk) => {
              stderr = (stderr + chunk.toString()).slice(-100000);
            });
            child.on('error', reject);
            child.on('close', (exitCode) => {
              clearTimeout(timeout);
              signal.removeEventListener('abort', kill);
              resolve({ stdout, stderr, exitCode });
            });
          });
        }),
    }),
    webfetch: tool({
      description:
        'Fetch a public HTTP(S) URL as bounded text. Private network destinations and redirects are rejected.',
      inputSchema: z.object({ url: z.url() }),
      execute: (input, { toolCallId }) =>
        tracked('webfetch', input, toolCallId, async () => {
          const url = new URL(input.url);
          if (
            !['https:', 'http:'].includes(url.protocol) ||
            url.username ||
            url.password
          )
            fail('BAD_REQUEST', 'A public HTTP(S) URL is required');
          const addresses = await lookup(url.hostname, { all: true });
          const isPrivate = (address: string) =>
            isIP(address) === 6
              ? !/^[23]/.test(address)
              : /^(?:0|10|127|169\.254|172\.(?:1[6-9]|2\d|3[01])|192\.168|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])|22[4-9]|23\d|24\d|25[0-5])\./.test(
                  address,
                );
          if (
            !addresses.length ||
            addresses.some((item) => isPrivate(item.address))
          )
            fail('FORBIDDEN', 'Private network requests are unavailable');
          const address = addresses[0];
          if (!address) fail('BAD_REQUEST', 'URL did not resolve');
          return new Promise<{ url: string; status: number; content: string }>(
            (resolve, reject) => {
              const request = (
                url.protocol === 'https:' ? httpsRequest : httpRequest
              )(
                url,
                {
                  signal,
                  timeout: 15000,
                  lookup: (_host, _options, callback) =>
                    callback(null, address.address, address.family),
                },
                (response) => {
                  if (
                    (response.statusCode ?? 0) >= 300 &&
                    (response.statusCode ?? 0) < 400
                  ) {
                    response.resume();
                    reject(
                      new Error('Redirects require a separate validated fetch'),
                    );
                    return;
                  }
                  const chunks: Buffer[] = [];
                  let bytes = 0;
                  response.on('data', (chunk: Buffer) => {
                    bytes += chunk.length;
                    if (bytes > 1_000_000) {
                      request.destroy(
                        new Error('Response exceeds fetch limit'),
                      );
                      return;
                    }
                    chunks.push(chunk);
                  });
                  response.on('end', () =>
                    resolve({
                      url: url.href,
                      status: response.statusCode ?? 0,
                      content: Buffer.concat(chunks).toString('utf8'),
                    }),
                  );
                  response.on('error', reject);
                },
              );
              request.on('timeout', () =>
                request.destroy(new Error('Fetch deadline exceeded')),
              );
              request.on('error', reject);
              request.end();
            },
          );
        }),
    }),
    ask_user_question: tool({
      description:
        'Ask the user for missing information, suspending until the user answers.',
      inputSchema: z.object({
        questions: z
          .array(
            z.object({
              header: z.string().min(1),
              question: z.string().min(1),
              options: z.array(z.string()).optional(),
            }),
          )
          .min(1)
          .max(3),
      }),
      execute: (input, { toolCallId }) =>
        tracked('ask_user_question', input, toolCallId, () =>
          engine.suspend(
            accountId,
            sessionId,
            toolCallId,
            'ask-user-question',
            input,
            signal,
          ),
        ),
    }),
    request_action_confirmation: tool({
      description:
        'Show a concrete draft or consequential operation for human confirmation. Confirmation is returned as data and never executes an action itself.',
      inputSchema: z.object({
        title: z.string().min(1),
        message: z.string().min(1),
        artifact: z.string().min(1),
      }),
      execute: (input, { toolCallId }) =>
        tracked('request_action_confirmation', input, toolCallId, () =>
          engine.suspend(
            accountId,
            sessionId,
            toolCallId,
            'action-confirmation',
            input,
            signal,
          ),
        ),
    }),
    write_todos: tool({
      description: 'Replace or merge the session checklist by stable item ID.',
      inputSchema: z.object({
        items: z.array(
          z.object({
            id: z.string().min(1),
            text: z.string().min(1),
            status: z.enum(['pending', 'in-progress', 'completed']),
          }),
        ),
        merge: z.boolean().default(false),
      }),
      execute: (input, { toolCallId }) =>
        tracked('write_todos', input, toolCallId, () => {
          const old = engine.store.get(accountId, 'todos', sessionId) as
            | typeof input.items
            | null;
          const items = input.merge
            ? [
                ...new Map(
                  [...(old ?? []), ...input.items].map((item) => [
                    item.id,
                    item,
                  ]),
                ).values(),
              ]
            : input.items;
          engine.store.set(accountId, 'todos', sessionId, items);
          return { items };
        }),
    }),
  };
}
