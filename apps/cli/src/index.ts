import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { accountId, Client, type Json, object, text } from './client.js';
import { serveMcp } from './mcp.js';
import { executeTask, type TaskOptions } from './task.js';

const help = `Aux 0.2.0 — local browser agent

aux [options] [prompt…]
aux exec <prompt…>               Run a task
aux repl [code…]                 Persistent browser JavaScript
aux mcp                         MCP server over stdio
aux session <action> [id]        list, resume, stop, steer, queue, archive, delete
aux memory <action> [value]      search, list, show, path
aux skills <action> [value]      list, show, install
aux settings <action> <value>    save-sessions, set-default-profile
aux account <action> [id]        list, status, use
aux host <action> [local]        list, status, profiles, use
aux guide [repl]                 Browser agent usage
aux login | logout | update      Local account and build status

Options: --account <number|uN>, --host local, --profile <id>,
-m/--model <provider/model>, -p/--provider <id>, -s/--speed default|fast,
--effort off|minimal|low|medium|high|xhigh|max|ultrabrowse,
--permission ask|guard|full-access, --json, -n/--max-results 1–10,
--target general|codex|claude-code|cursor|opencode, --path <skill root>,
--log-dump, -h/--help, -V/--version`;
const commands = new Set([
  'exec',
  'repl',
  'mcp',
  'session',
  'memory',
  'skills',
  'settings',
  'account',
  'host',
  'login',
  'logout',
  'update',
  'guide',
]);
const { values, positionals } = (() => {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        account: { type: 'string' },
        host: { type: 'string' },
        profile: { type: 'string' },
        model: { type: 'string', short: 'm' },
        provider: { type: 'string', short: 'p' },
        providerId: { type: 'string' },
        speed: { type: 'string', short: 's' },
        effort: { type: 'string' },
        thinking: { type: 'string', short: 't' },
        permission: { type: 'string' },
        json: { type: 'boolean' },
        'max-results': { type: 'string', short: 'n' },
        target: { type: 'string' },
        path: { type: 'string' },
        update: { type: 'boolean' },
        'log-dump': { type: 'boolean' },
        email: { type: 'string' },
        password: { type: 'string' },
        'device-code': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'V' },
      },
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Invalid options.');
    process.exit(1);
  }
})();
const options: TaskOptions = {};
if (values.model) options.model = values.model;
const provider = values.provider ?? values.providerId;
if (provider) options.provider = provider;
const effort = values.effort ?? values.thinking;
if (effort) options.effort = effort;
if (values.permission) options.permission = values.permission;
if (values.speed) options.speed = values.speed;
if (values.profile) options.profile = values.profile;
const client = new Client(values.account);
const print = (value: Json) =>
  console.log(
    typeof value === 'string' && !values.json
      ? value
      : JSON.stringify(value, null, 2),
  );
function required(value: string | undefined, label: string): string {
  if (!value?.trim()) throw new Error(`Missing ${label}.`);
  return value;
}
async function respond(suspension: Json): Promise<Json> {
  const pending = object(suspension);
  const request = object(pending.request ?? {});
  console.error(JSON.stringify(request, null, 2));
  const terminal = createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  try {
    if (pending.kind === 'approval') {
      const answer = (
        await terminal.question('Allow this action? [y/N/always] ')
      )
        .trim()
        .toLowerCase();
      return {
        verdict: ['y', 'yes', 'always'].includes(answer) ? 'allow' : 'deny',
        always: answer === 'always',
      };
    }
    if (pending.kind === 'action-confirmation') {
      const answer = (await terminal.question('Confirm this action? [y/N] '))
        .trim()
        .toLowerCase();
      return { verdict: ['y', 'yes'].includes(answer) ? 'confirm' : 'cancel' };
    }
    if (
      pending.kind === 'ask-user-question' &&
      Array.isArray(request.questions)
    ) {
      const answers: Json[] = [];
      for (const question of request.questions) {
        const item = object(question);
        const header = text(item.header);
        answers.push({
          header,
          answer: await terminal.question(`${header}: `),
        });
      }
      return { answers };
    }
    throw new Error('Unknown human-response request; respond in Aux.');
  } finally {
    terminal.close();
  }
}
async function runPrompt(prompt: string, id?: string): Promise<void> {
  const output = await executeTask(
    client,
    prompt,
    options,
    id,
    values.json ? () => {} : (chunk) => process.stdout.write(chunk),
    process.stdin.isTTY ? respond : undefined,
  );
  if (values.json) print(output);
  else {
    process.stdout.write('\n');
    const result = object(output);
    if (result.status === 'suspended') {
      console.error(`Task ${result.session_id} needs your response in Aux.`);
      process.exitCode = 2;
    }
  }
}
async function interactive(id?: string): Promise<void> {
  if (!process.stdin.isTTY)
    throw new Error('Provide a prompt when stdin is not interactive.');
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    while (true) {
      const prompt = await terminal.question('aux> ');
      if (prompt.trim() === '/exit') break;
      if (!prompt.trim()) continue;
      const result = object(
        await executeTask(client, prompt, options, id, (chunk) =>
          process.stdout.write(chunk),
        ),
      );
      id = text(result.session_id);
      console.log('');
      if (result.status === 'suspended')
        console.error(
          'Respond to the pending request in Aux before continuing.',
        );
    }
  } finally {
    terminal.close();
  }
}
async function repl(code: string): Promise<void> {
  const session = object(
    await client.scoped(
      'cli.replStart',
      options.profile ? { profileId: options.profile } : {},
      true,
    ),
  );
  const id = text(session.id);
  try {
    if (code) {
      print(await client.scoped('cli.replRun', { id, code }, true));
      return;
    }
    if (!process.stdin.isTTY)
      throw new Error('Provide JavaScript when stdin is not interactive.');
    const terminal = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      while (true) {
        const input = await terminal.question('repl> ');
        if (input.trim() === '/exit') break;
        if (!input.trim()) continue;
        try {
          print(await client.scoped('cli.replRun', { id, code: input }, true));
        } catch (error) {
          console.error(
            error instanceof Error ? error.message : 'Evaluation failed.',
          );
        }
      }
    } finally {
      terminal.close();
    }
  } finally {
    await client.scoped('cli.replClose', { id }, true);
  }
}
async function installSkill(): Promise<void> {
  const roots: Record<string, string> = {
    general: '.agents/skills',
    codex: '.codex/skills',
    'claude-code': '.claude/skills',
    cursor: '.cursor/skills',
    opencode: '.config/opencode/skills',
  };
  const target = values.target ?? 'general';
  if (!roots[target]) throw new Error('Unknown skill installation target.');
  if (values.path && values.target)
    throw new Error('Choose --path or --target.');
  const directory = values.path
    ? resolve(values.path)
    : join(homedir(), required(roots[target], 'skill root'));
  const skill = object(
    await client.scoped('cli.skillsShow', { name: 'aux-browser' }),
  );
  const path = join(directory, 'aux-browser', 'SKILL.md');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text(skill.body), { flag: 'wx' });
  print({ installed: true, path });
}
async function main(): Promise<void> {
  if (values.help) {
    console.log(help);
    return;
  }
  if (values.version) {
    console.log('0.2.0');
    return;
  }
  if (values.host && values.host !== 'local')
    throw new Error('Only the local host is available in this build.');
  if (values['log-dump']) {
    const directory = join(client.home, 'diagnostics');
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const path = join(directory, `cli-${Date.now()}.json`);
    let health: Json;
    try {
      const response = await fetch(`${client.origin}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      health = response.ok
        ? ((await response.json()) as Json)
        : { status: response.status };
    } catch {
      health = { unavailable: true };
    }
    await writeFile(
      path,
      JSON.stringify(
        {
          version: '0.2.0',
          node: process.version,
          platform: process.platform,
          date: new Date().toISOString(),
          health,
        },
        null,
        2,
      ),
      { mode: 0o600, flag: 'wx' },
    );
    console.error(`Diagnostics: ${path}`);
  }
  let command = values.update ? 'update' : positionals[0];
  let args = values.update ? [] : positionals.slice(1);
  if (!command) {
    await interactive();
    return;
  }
  if (!commands.has(command)) {
    args = positionals;
    command = 'exec';
  }
  const [action, argument] = args;
  const rest = args.slice(2).join(' ');
  switch (command) {
    case 'guide':
      if (action && action !== 'repl')
        throw new Error('Only the repl guide is available.');
      console.log(
        'Start Aux with a disposable profile, select a local account and configure a model. Use aux exec to run a task. Use aux repl to list or attach observed tabs and inspect a fresh snapshot before interacting. Persistent JavaScript bindings belong to one account and sandbox; imports and unrestricted host access are unavailable. Resolve approvals in the Aux conversation. Use /exit to close an interactive CLI.',
      );
      return;
    case 'exec':
      if (!args.length) await interactive();
      else await runPrompt(args.join(' '));
      return;
    case 'repl':
      await repl(args.join(' '));
      return;
    case 'mcp':
      await serveMcp(client, options);
      return;
    case 'session': {
      if (action === 'list') {
        print(
          await client.scoped('sessions.list', {
            ephemeral: 'include',
            parent: 'all',
          }),
        );
        return;
      }
      const sessionId = required(argument, 'session ID');
      if (action === 'resume') {
        if (rest) await runPrompt(rest, sessionId);
        else await interactive(sessionId);
        return;
      }
      const names: Record<string, string> = {
        stop: 'abort',
        steer: 'steer',
        queue: 'queue',
        archive: 'archive',
        delete: 'delete',
      };
      const procedure = names[required(action, 'session action')];
      if (!procedure) throw new Error('Unknown session action.');
      print(
        await client.scoped(
          `sessions.${procedure}`,
          {
            sessionId,
            ...(['steer', 'queue'].includes(procedure)
              ? { prompt: required(rest, 'prompt') }
              : {}),
          },
          true,
        ),
      );
      return;
    }
    case 'memory': {
      if (action === 'path') {
        print(await client.scoped('memory.getDirectory'));
        return;
      }
      if (action === 'list') {
        print(await client.scoped('memory.listFiles'));
        return;
      }
      if (action === 'show') {
        const result = object(
          await client.scoped('memory.readFile', {
            filePath: required(argument, 'memory path'),
          }),
        );
        print(result.content ?? '');
        return;
      }
      if (action !== 'search') throw new Error('Unknown memory action.');
      const maxResults = Number(values['max-results'] ?? '5');
      if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 10)
        throw new Error('Maximum results must be 1–10.');
      print(
        await client.scoped('memory.search', {
          queries: [required(args.slice(1).join(' '), 'query')],
          maxResults,
        }),
      );
      return;
    }
    case 'skills':
      if (action === 'list') print(await client.scoped('cli.skillsList'));
      else if (action === 'show') {
        const result = object(
          await client.scoped('cli.skillsShow', {
            name: required(argument, 'skill name'),
          }),
        );
        print(result.body ?? '');
      } else if (action === 'install') await installSkill();
      else throw new Error('Unknown skills action.');
      return;
    case 'settings':
      if (action === 'save-sessions') {
        if (!['true', 'false'].includes(argument ?? ''))
          throw new Error('Use true or false.');
        print(
          await client.scoped(
            'settings.set',
            { key: 'cli.saveSessions', value: argument === 'true' },
            true,
          ),
        );
        return;
      }
      if (action === 'set-default-profile') {
        print(
          await client.call(
            'accounts.setCurrent',
            { accountId: accountId(required(argument, 'account')) },
            true,
          ),
        );
        return;
      }
      throw new Error('Unknown settings action.');
    case 'account':
      if (action === 'list') print(await client.call('accounts.list'));
      else if (action === 'status')
        print(
          await client.call('accounts.get', {
            accountId: argument ? accountId(argument) : await client.account(),
          }),
        );
      else if (action === 'use')
        print(
          await client.call(
            'accounts.setCurrent',
            { accountId: accountId(required(argument, 'account')) },
            true,
          ),
        );
      else throw new Error('Unknown account action.');
      return;
    case 'host':
      if (action === 'list') {
        print([{ id: 'local', name: 'This Mac', local: true }]);
        return;
      }
      if (action === 'status') {
        print({
          id: 'local',
          accountId: await client.account(),
          localOnly: true,
        });
        return;
      }
      if (action === 'profiles') {
        print(
          object(await client.call('accounts.summary')).profileBindings ?? [],
        );
        return;
      }
      if (action === 'use' && argument === 'local') {
        print({ host: 'local' });
        return;
      }
      throw new Error('Unknown host action or remote host.');
    case 'login':
      throw new Error(
        'This build uses local accounts. Cloud login is unavailable.',
      );
    case 'logout': {
      const path = join(client.home, 'cli-auth.json');
      try {
        await unlink(path);
      } catch (error) {
        if (
          !(
            error instanceof Error &&
            'code' in error &&
            error.code === 'ENOENT'
          )
        )
          throw error;
      }
      print({ loggedOut: true });
      return;
    }
    case 'update': {
      print({
        version: '0.2.0',
        localDevelopment: true,
        automaticUpdates: false,
      });
      return;
    }
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Command failed.');
  process.exitCode = 1;
});
