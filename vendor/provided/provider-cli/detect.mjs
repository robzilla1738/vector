/** Find each provider CLI and ask it for its own login state. Reads no token files,
 * runs only --version, the CLI's status command and Codex's model list, sends no prompt. */
import {accessSync, constants, statSync} from 'node:fs';
import {homedir, userInfo} from 'node:os';
import path from 'node:path';
import {PROVIDERS, parseAuthStatus} from './catalog.mjs';
import {capture} from './process.mjs';
import {codexModels} from './drivers.mjs';

const START = '__AUX_PATH_START__', END = '__AUX_PATH_END__';

/** Install locations the official installers use, after the user's login-shell PATH. */
export function fallbackDirectories(home = homedir()) {
  return ['/opt/homebrew/bin', '/usr/local/bin', path.join(home, '.local/bin'), path.join(home, '.npm-global/bin'),
    path.join(home, '.volta/bin'), path.join(home, '.bun/bin'), path.join(home, 'Library/pnpm'), path.join(home, '.opencode/bin'),
    path.join(home, '.claude/local'), path.join(home, '.cursor/bin')];
}

/** The PATH a login shell would give the user (fish, zsh and bash all export it colon-joined). */
export async function loginShellPath({shell = process.env.SHELL, env = process.env, timeoutMs = 8000} = {}) {
  if (!shell || !path.isAbsolute(shell)) return null;
  const result = await capture(shell, ['-ilc', `echo ${START}; /usr/bin/printenv PATH; echo ${END}`], {env, timeoutMs});
  const text = result.stdout, start = text.indexOf(START), end = text.indexOf(END, start);
  if (result.exitCode !== 0 || start < 0 || end < 0) return null;
  const value = text.slice(start + START.length, end).trim().split('\n').pop()?.trim();
  return value && value.split(':').every(entry => !entry || path.isAbsolute(entry)) ? value : null;
}

const executable = file => { try { accessSync(file, constants.X_OK); return statSync(file).isFile(); } catch { return false; } };

export function searchPath(directories) {
  return [...new Set(directories.filter(entry => entry && path.isAbsolute(entry)))];
}

export function resolveCommand(names, directories) {
  for (const name of names) for (const directory of directories) {
    const candidate = path.join(directory, name);
    if (executable(candidate)) return candidate;
  }
  return null;
}

/** Environment for provider children: the daemon's own (it already drops inherited provider
 * keys), the login-shell PATH, no Aux secrets and no nested-agent markers. */
export function childEnvironment(base, searchDirectories, extra = {}) {
  const env = {};
  for (const [key, value] of Object.entries(base)) {
    if (/^AUX_/.test(key) || /^(CLAUDECODE|CLAUDE_CODE_ENTRYPOINT|CODEX_SANDBOX.*|CODEX_THREAD_ID|CURSOR_AGENT|GROK_SESSION_ID)$/.test(key)) continue;
    env[key] = value;
  }
  env.PATH = searchDirectories.join(':');
  env.TERM = 'dumb';
  env.NO_COLOR = '1';
  return {...env, ...extra};
}

/** Detect one provider. `context` carries the resolved directories and environment. */
export async function detectProvider(entry, context) {
  const file = resolveCommand(entry.commands, context.directories);
  if (!file) return {id: entry.id, state: 'not-installed', path: null};
  const version = await capture(file, entry.versionArgs, {env: context.env, timeoutMs: context.versionTimeoutMs ?? 10000});
  const versionText = `${version.stdout}\n${version.stderr}`;
  const match = versionText.match(entry.versionPattern);
  if (!match) {
    // Exit 0 without the banner: a different program owns the name (for example another `agent`).
    if (version.exitCode === 0) return {id: entry.id, state: 'not-installed', path: file, detail: `${path.basename(file)} is not ${entry.product}.`};
    return {id: entry.id, state: 'error', path: file, detail: version.timedOut ? `${entry.product} did not answer --version.` : `${entry.product} failed to start.`};
  }
  if (!entry.statusArgs) return {id: entry.id, path: file, version: match[1], ...parseAuthStatus(entry.id, {exitCode: 0, stdout: '', stderr: ''})};
  let status, parsed;
  for (let attempt = 0; attempt < 2; attempt++) {
    status = await capture(file, entry.statusArgs, {env: context.env, timeoutMs: context.statusTimeoutMs ?? 20000});
    parsed = parseAuthStatus(entry.id, status);
    if (!parsed.retry) break;
  }
  const {retry, ...state} = parsed;
  if (entry.driver === 'codex-app-server' && state.state === 'ready') {
    // The model list changes with the CLI and the account, not between focus checks.
    const before = context.previous?.find(found => found.id === entry.id);
    state.models = before?.state === 'ready' && before.version === match[1] && before.models?.length ? before.models
      : await codexModels(file, {env: context.env, timeoutMs: context.statusTimeoutMs ?? 20000});
  }
  return {id: entry.id, path: file, version: match[1], ...state};
}

/** The account's login shell first (what Terminal would start), then $SHELL. An rc file
 * that hands off to another shell prints nothing, so try the next candidate. */
export async function userLoginPath({shells, env = process.env} = {}) {
  let account;
  try { account = userInfo().shell; } catch {}
  for (const shell of [...new Set(shells ?? [account, env.SHELL])]) {
    const value = await loginShellPath({shell, env});
    if (value) return value;
  }
  return null;
}

/** Detect every provider in parallel. `searchDirectories` skips the login-shell lookup (a
 * re-check reuses the last one); `previous` is the last result, whose Codex models are reused
 * while the version and state hold. */
export async function detectAll({providers = PROVIDERS, env = process.env, home = homedir(), shells, searchDirectories, previous, ...timeouts} = {}) {
  const shellPath = searchDirectories ? null : await userLoginPath({shells, env});
  const directories = searchPath(searchDirectories ?? [...(shellPath ?? env.PATH ?? '').split(':'), ...fallbackDirectories(home)]);
  const context = {directories, env: childEnvironment(env, directories), previous, ...timeouts};
  const results = await Promise.all(providers.map(entry => detectProvider(entry, context)));
  return {directories, loginShellPath: shellPath !== null, providers: results};
}
