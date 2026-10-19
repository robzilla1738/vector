import { spawn } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { type ToolSet, tool } from 'ai';
import { z } from 'zod';
import type { AgentEngine } from './engine.js';
import { approveOperation } from './permissions.js';
import { fail } from './storage.js';
import {
  startSubagent,
  subagentInput,
  synchronizeChildPolicy,
} from './subagents.js';
import { agentToolServices } from './tool-services.js';

function titleForTool(name: string) {
  return name.replaceAll('_', ' ');
}
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
): ToolSet {
  async function tracked<T>(
    name: string,
    input: unknown,
    id: string,
    execute: () => Promise<T> | T,
  ) {
    const session = engine.get(accountId, sessionId);
    synchronizeChildPolicy(engine, session);
    if (!session.toolCalls.some((call) => call.id === id)) {
      session.toolCalls.push({
        id,
        name,
        input,
        status: 'running',
        startedAt: Date.now(),
      });
      engine.emit(session, 'tool-started', { id, name, input });
    }
    try {
      if (
        ![
          'routine_update',
          'read_file',
          'write_file',
          'edit_file',
          'bash',
          'browser_navigate',
          'browser_open',
          'browser_close',
          'browser_click',
          'browser_type',
          'browser_scroll',
        ].includes(name)
      )
        await approveOperation(
          engine,
          accountId,
          sessionId,
          id,
          name,
          titleForTool(name),
          input,
          signal,
          { defaultAsk: false },
        );
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
  async function approve(
    id: string,
    title: string,
    operation: unknown,
    toolName: string,
    path?: string,
    finalAction = false,
  ) {
    return approveOperation(
      engine,
      accountId,
      sessionId,
      id,
      toolName,
      title,
      operation,
      signal,
      { mutation: true, finalAction, ...(path ? { path } : {}) },
    );
  }
  async function filePath(
    path: string,
    operation: 'read' | 'write',
    id: string,
    toolName = operation === 'read' ? 'read_file' : 'write_file',
  ) {
    const session = engine.get(accountId, sessionId);
    const full = canonical(resolve(engine.directory(session), path));
    const forbidden = [
      join(engine.store.accountHome(accountId), 'credentials.json'),
      join(engine.store.home, 'installation'),
      join(engine.store.home, 'installation-private.pem'),
      join(engine.store.home, 'session-secret'),
    ];
    if (
      forbidden.some((root) => within(full, root)) ||
      /(?:^|\/)(?:(?:channel-|oauth-)?credentials\.json|custom-provider-secrets\.json|oauth-private\.key|oauth-refresh\.(?:lock|sqlite)(?:-[a-z]+)?|oauth-host\.json|(?:installation-private|private-key)\.pem|(?:token|session)-secret)(?:$|\/)/.test(
        full,
      )
    )
      fail('FORBIDDEN', 'Agent tools cannot access credential material');
    const roots = [
      engine.directory(session),
      ...(session.runtimeConfig?.workingDirs ?? []),
    ].map(canonical);
    await approveOperation(
      engine,
      accountId,
      sessionId,
      id,
      toolName,
      `${operation} file`,
      { path: full, operation },
      signal,
      {
        path: full,
        mutation: operation === 'write',
        defaultAsk: !roots.some((root) => within(full, root)),
      },
    );
    return full;
  }
  async function browser(method: string, params: Record<string, unknown>) {
    const session = engine.get(accountId, sessionId);
    if (!engine.bridge || !session.browserBinding)
      fail(
        'PRECONDITION_FAILED',
        'Bind this session to a connected browser profile before using browser tools',
      );
    if (
      session.permissionMode === 'read-only' &&
      !['tabs.query', 'page.snapshot', 'page.screenshot'].includes(method)
    )
      fail('FORBIDDEN', 'Read-only sessions cannot mutate browser state');
    return engine.bridge.command(
      { accountId, ...session.browserBinding },
      { method, params },
      { signal },
    );
  }
  return {
    browser_open: tool({
      description:
        'Create a new agent-owned tab in this session bound profile. Cleanup ownership is tied to the exact created target and document; user navigation releases it. Default keep retains tabs after task completion.',
      inputSchema: z.object({
        url: z.url(),
        active: z.boolean().default(false),
        autoClosePolicy: z.enum(['keep', 'on-completion']).optional(),
      }),
      execute: (input, { toolCallId }) =>
        tracked('browser_open', input, toolCallId, async () => {
          await approve(
            toolCallId,
            'Open agent browser tab',
            input,
            'browser_open',
          );
          return engine.tabs.create(
            accountId,
            sessionId,
            {
              url: input.url,
              active: input.active,
              ...(input.autoClosePolicy
                ? { autoClosePolicy: input.autoClosePolicy }
                : {}),
            },
            signal,
          );
        }),
    }),
    browser_owned_tabs: tool({
      description:
        'List only live positively agent-owned tabs for this session. Never infer ownership from URL or reusable tab numbers.',
      inputSchema: z.object({}),
      execute: (input, { toolCallId }) =>
        tracked('browser_owned_tabs', input, toolCallId, () =>
          engine.tabs.list(accountId, sessionId, signal),
        ),
    }),
    browser_close: tool({
      description:
        'Close an exact positively agent-owned target from browser_owned_tabs. Ordinary user tabs and changed documents cannot be closed by this tool.',
      inputSchema: z.object({
        targetId: z.string().min(1),
        tabId: z.number().int().nonnegative().optional(),
      }),
      execute: (input, { toolCallId }) =>
        tracked('browser_close', input, toolCallId, async () => {
          const tab = (
            await engine.tabs.list(accountId, sessionId, signal)
          ).find(
            (row) =>
              row.targetId === input.targetId &&
              (input.tabId === undefined || row.tabId === input.tabId),
          );
          if (!tab)
            fail(
              'FORBIDDEN',
              'Only an exact live tab created by this agent session may be closed',
            );
          await approve(
            toolCallId,
            'Close agent browser tab',
            tab,
            'browser_close',
          );
          return engine.tabs.close(
            accountId,
            sessionId,
            tab.id,
            { targetId: tab.targetId, tabId: tab.tabId },
            signal,
          );
        }),
    }),
    browser_tabs: tool({
      description:
        'List tabs in the session-bound browser profile without selecting one.',
      inputSchema: z.object({}),
      execute: (input, { toolCallId }) =>
        tracked('browser_tabs', input, toolCallId, () =>
          browser('tabs.query', {}),
        ),
    }),
    page_view: tool({
      description:
        'Read a fresh semantic snapshot of a tab by targetId. Use returned element refs and document URL for subsequent actions.',
      inputSchema: z.object({ targetId: z.string().min(1) }),
      execute: (input, { toolCallId }) =>
        tracked('page_view', input, toolCallId, () =>
          browser('page.snapshot', input),
        ),
    }),
    browser_navigate: tool({
      description:
        'Navigate a bound-profile tab to an HTTP(S) URL under the session access policy.',
      inputSchema: z.object({ targetId: z.string().min(1), url: z.url() }),
      execute: (input, { toolCallId }) =>
        tracked('browser_navigate', input, toolCallId, async () => {
          if (!['http:', 'https:'].includes(new URL(input.url).protocol))
            fail('BAD_REQUEST', 'Navigation requires an HTTP(S) URL');
          await approve(
            toolCallId,
            'Navigate browser tab',
            input,
            'browser_navigate',
          );
          return engine.tabs.has(accountId, sessionId, input.targetId)
            ? engine.tabs.navigate(
                accountId,
                sessionId,
                input.targetId,
                input.url,
                signal,
              )
            : browser('page.navigate', input);
        }),
    }),
    browser_click: tool({
      description:
        'Click an element from a fresh observed snapshot under the session access policy. Set finalAction=true for send, submit, purchase, delete or publish to require distinct human confirmation. Pass its ref and documentUrl; stale references fail.',
      inputSchema: z.object({
        targetId: z.string().min(1),
        ref: z.string().min(1),
        documentUrl: z.url(),
        finalAction: z.boolean().default(false),
      }),
      execute: (input, { toolCallId }) =>
        tracked('browser_click', input, toolCallId, async () => {
          await approve(
            toolCallId,
            'Click browser element',
            input,
            'browser_click',
            undefined,
            input.finalAction === true,
          );
          return browser('page.click', input);
        }),
    }),
    browser_type: tool({
      description:
        'Type into a field from a fresh observed snapshot under the session access policy. Pass its ref and documentUrl.',
      inputSchema: z.object({
        targetId: z.string().min(1),
        ref: z.string().min(1),
        documentUrl: z.url(),
        text: z.string(),
      }),
      execute: (input, { toolCallId }) =>
        tracked('browser_type', input, toolCallId, async () => {
          await approve(
            toolCallId,
            'Type in browser field',
            input,
            'browser_type',
          );
          return browser('page.type', input);
        }),
    }),
    browser_scroll: tool({
      description: 'Scroll a tab in the bound browser profile.',
      inputSchema: z.object({
        targetId: z.string().min(1),
        x: z.number().default(0),
        y: z.number(),
      }),
      execute: (input, { toolCallId }) =>
        tracked('browser_scroll', input, toolCallId, async () => {
          await approveOperation(
            engine,
            accountId,
            sessionId,
            toolCallId,
            'browser_scroll',
            'Scroll browser tab',
            input,
            signal,
            { mutation: true, defaultAsk: false },
          );
          return browser('page.scroll', input);
        }),
    }),
    subagent: tool({
      description:
        'Start a bounded child task using fresh, read-only explorer, text-only forked context, or an independently configured custom profile. Children cannot recursively delegate and never inherit live browser/REPL handles.',
      inputSchema: subagentInput,
      execute: (input, { toolCallId }) =>
        tracked('subagent', input, toolCallId, () =>
          startSubagent(
            engine,
            accountId,
            sessionId,
            input,
            toolCallId,
            signal,
          ),
        ),
    }),
    routine_update: tool({
      description:
        'Create/suggest/update/pause/resume/delete a validated local cron or heartbeat routine. Preview the concrete record for approval; suggestions remain drafts. Deletion requires human confirmation.',
      inputSchema: z
        .object({
          operation: z.enum([
            'create',
            'suggest',
            'update',
            'pause',
            'resume',
            'delete',
          ]),
          routineId: z.string().min(1).max(128).optional(),
          record: z.record(z.string(), z.unknown()).optional(),
        })
        .strict(),
      execute: (input, { toolCallId }) =>
        tracked('routine_update', input, toolCallId, async () => {
          const prepare = agentToolServices(engine).prepareRoutineUpdate;
          if (!prepare)
            fail('PRECONDITION_FAILED', 'Routine service is unavailable');
          const session = engine.get(accountId, sessionId);
          const prepared = await prepare(session, input, toolCallId, signal);
          await approveOperation(
            engine,
            accountId,
            sessionId,
            toolCallId,
            'routine_update',
            'Update local routine',
            prepared.preview,
            signal,
            { mutation: true, finalAction: input.operation === 'delete' },
          );
          signal.throwIfAborted();
          return prepared.execute();
        }),
    }),
    subagent_wait: tool({
      description:
        'Wait for owned child sessions and return their current status and transcript.',
      inputSchema: z.object({ sessionIds: z.array(z.string()).min(1).max(3) }),
      execute: (input, { toolCallId }) =>
        tracked('subagent_wait', input, toolCallId, async () => {
          for (const id of input.sessionIds)
            if (engine.get(accountId, id).parentId !== sessionId)
              fail('FORBIDDEN', 'Only this parent owns these child sessions');
          return Promise.all(
            input.sessionIds.map(async (id) => {
              const child = await engine.wait(accountId, id);
              return {
                sessionId: id,
                status: child.status,
                messages: child.messages,
              };
            }),
          );
        }),
    }),
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
          const path = await filePath(
            input.path,
            'write',
            toolCallId,
            'edit_file',
          );
          const before = readFileSync(path, 'utf8');
          if (before.split(input.oldText).length !== 2)
            fail('CONFLICT', 'Original text must match exactly once');
          writeFileSync(path, before.replace(input.oldText, input.newText));
          return { path, replaced: true };
        }),
    }),
    bash: tool({
      description:
        'Run a shell command under the current access policy. Mark consequential sends, submissions, purchases, deletes or publication as finalAction for exact human confirmation. Output is bounded. Shell execution is unavailable in read-only mode.',
      inputSchema: z.object({
        command: z.string().min(1),
        finalAction: z.boolean().default(false),
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
          await approve(
            toolCallId,
            'Execute shell command',
            {
              command: input.command,
              workingDirectory: cwd,
            },
            'bash',
            cwd,
            input.finalAction === true,
          );
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
