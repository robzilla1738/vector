/** Official provider CLIs Aux drives with the user's own login (owner decision 1,
 * 2026-10-28, "the T3 Code way"). Static data only: no process, network or
 * credential access. Every flag here was read from the CLI's own --help output
 * (see docs/integration/proposed/completion-20261026/runtime/provider-cli-a1). */

export const PROVIDER_STATES = Object.freeze(['not-installed', 'signed-out', 'ready', 'error']);

const provider = spec => Object.freeze({hiddenUnlessInstalled: false, ...spec});

export const PROVIDERS = Object.freeze([
  provider({
    id: 'codex', label: 'ChatGPT', product: 'Codex CLI', replaces: 'openai-codex',
    commands: ['codex'], versionArgs: ['--version'], statusArgs: ['login', 'status'],
    versionPattern: /^codex-cli\s+(\S+)/m,
    install: {url: 'https://developers.openai.com/codex/cli', command: 'brew install --cask codex'},
    login: 'codex login', logout: 'codex logout', driver: 'codex-app-server',
    models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini'],
  }),
  provider({
    id: 'claude', label: 'Claude', product: 'Claude Code', replaces: 'claude-code',
    commands: ['claude'], versionArgs: ['--version'], statusArgs: ['auth', 'status', '--json'],
    versionPattern: /^(\S+)\s+\(Claude Code\)/m,
    install: {url: 'https://docs.claude.com/en/docs/claude-code/setup', command: 'brew install --cask claude-code'},
    login: 'claude auth login', logout: 'claude auth logout', driver: 'claude-stream-json',
    models: ['sonnet', 'opus', 'haiku'],
  }),
  provider({
    id: 'cursor', label: 'Cursor', product: 'Cursor CLI', replaces: null,
    // `agent` is a generic name; prefer the unambiguous binary and verify the banner.
    commands: ['cursor-agent', 'agent'], versionArgs: ['--version'], statusArgs: ['status', '--format', 'json'],
    versionPattern: /^(\d{4}\.\d{1,2}\.\d{1,2}-[0-9a-f]+)\s*$/m,
    install: {url: 'https://cursor.com/cli', command: 'brew install --cask cursor-cli'},
    login: 'agent login', logout: 'agent logout', driver: 'cursor-stream-json',
    models: ['auto'],
  }),
  provider({
    id: 'grok', label: 'Grok', product: 'Grok Build', replaces: 'xai-grok-oauth',
    // Grok Build has no status subcommand; `grok models` prints the login line and model list.
    commands: ['grok'], versionArgs: ['--version'], statusArgs: ['models'],
    versionPattern: /^grok\s+(\S+)/m,
    install: {url: 'https://x.ai/build', command: 'brew install --cask grok-build'},
    login: 'grok login', logout: 'grok logout', driver: 'grok-streaming-json',
    models: [],
  }),
  provider({
    id: 'opencode', label: 'OpenCode', product: 'OpenCode', replaces: null,
    // --standalone: never start or depend on the user's shared OpenCode background service.
    commands: ['opencode'], versionArgs: ['--version'], statusArgs: ['auth', 'list', '--standalone'],
    versionPattern: /^opencode\s+v?(\S+)/m,
    install: {url: 'https://opencode.ai/docs', command: 'curl -fsSL https://opencode.ai/install | bash'},
    login: 'opencode auth login', logout: 'opencode auth logout', driver: 'opencode-json',
    models: [],
  }),
  provider({
    // GitHub's official Copilot CLI. Shown only when installed; its headless flags are
    // not verified on this Mac (not installed), so it has no driver yet.
    id: 'copilot', label: 'GitHub Copilot', product: 'GitHub Copilot CLI', replaces: 'github-copilot',
    commands: ['copilot'], versionArgs: ['--version'], statusArgs: null,
    versionPattern: /(\d+\.\d+\.\d+\S*)/,
    install: {url: 'https://gh.io/copilot-cli', command: 'npm install -g @github/copilot'},
    login: 'copilot (then /login)', logout: null, driver: null, hiddenUnlessInstalled: true,
    models: [],
  }),
]);

/** Providers without an official CLI stay on API keys (owner decision 1). */
export const API_KEY_ONLY = Object.freeze({
  'kimi-code': {useInstead: 'kimi-coding', reason: 'No official Kimi CLI login Aux can drive; use a Kimi For Coding API key.'},
  'meta-muse': {useInstead: 'meta', reason: 'No official Meta CLI login Aux can drive; use a Meta Model API key.'},
});

export const providerById = id => PROVIDERS.find(entry => entry.id === id);

const EMAIL = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]+)/g;
export const maskEmail = text => typeof text === 'string' ? text.replace(EMAIL, '$1…$2') : text;

/** Parse one status probe into a state. `result` is {exitCode, stdout, stderr, error?, timedOut?}. */
export function parseAuthStatus(id, result) {
  const out = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (result.timedOut) return {state: 'error', detail: 'The status check timed out.'};
  const json = () => { try { return JSON.parse(result.stdout); } catch { return undefined; } };
  switch (id) {
    case 'codex': {
      const method = out.match(/Logged in using\s+(.+)/i)?.[1]?.trim();
      if (result.exitCode === 0 && method) return {state: 'ready', account: {method}};
      if (/not logged in/i.test(out) || result.exitCode === 1) return {state: 'signed-out'};
      break;
    }
    case 'claude': {
      const status = json();
      if (status && typeof status.loggedIn === 'boolean') {
        if (!status.loggedIn) return {state: 'signed-out'};
        return {state: 'ready', account: {method: status.authMethod ?? null, email: maskEmail(status.email ?? null), plan: status.subscriptionType ?? null}};
      }
      break;
    }
    case 'cursor': {
      const status = json();
      if (status && typeof status.isAuthenticated === 'boolean') {
        if (!status.isAuthenticated) return {state: 'signed-out'};
        return {state: 'ready', account: {email: maskEmail(status.userInfo?.email ?? null), team: status.userInfo?.teamName ?? null}};
      }
      if (/not (logged|signed) in|unauthenticated|login required/i.test(out)) return {state: 'signed-out'};
      break;
    }
    case 'grok': {
      const login = out.match(/You are logged in with\s+([^\s.]+(?:\.[a-z]+)?)/i)?.[1];
      if (result.exitCode === 0 && login) {
        const models = [...out.matchAll(/^\s*[*-]\s+([A-Za-z0-9._-]+)/gm)].map(match => match[1]);
        const fallback = out.match(/Default model:\s*(\S+)/i)?.[1] ?? null;
        return {state: 'ready', account: {method: login}, models, defaultModel: fallback};
      }
      if (/not logged in|grok login|sign in/i.test(out)) return {state: 'signed-out'};
      break;
    }
    case 'opencode': {
      if (result.exitCode === 0) {
        const rows = out.split('\n').map(line => line.trim()).filter(line => /\bstored$/.test(line));
        if (!rows.length) return {state: 'signed-out'};
        return {state: 'ready', account: {credentials: rows.map(line => line.replace(/\s{2,}.*$/, ''))}};
      }
      // OpenCode answers "Location plugins did not finish activating" while its runtime warms up.
      if (/did not finish activating/i.test(out)) return {state: 'error', detail: 'OpenCode is still starting. Try again.', retry: true};
      break;
    }
    case 'copilot':
      return {state: 'ready', account: null, detail: 'Sign-in state is shown in the Copilot CLI.'};
  }
  return {state: 'error', detail: firstLine(out) || `The status check exited with ${result.exitCode}.`};
}

const firstLine = text => maskEmail(text.trim().split('\n')[0] ?? '').slice(0, 200);

/** Settings row model. The extension renders it with the supplied provider row components. */
export function settingsRow(entry, detection) {
  const base = {id: entry.id, label: entry.label, product: entry.product, state: detection.state, version: detection.version ?? null};
  switch (detection.state) {
    case 'not-installed':
      return {...base, hidden: entry.hiddenUnlessInstalled,
        message: `Install ${entry.product} to use your ${entry.label} plan in Aux.`,
        actions: [{kind: 'link', label: 'Install guide', url: entry.install.url}, {kind: 'copy', label: 'Copy install command', command: entry.install.command}]};
    case 'signed-out':
      return {...base, hidden: false, message: `${entry.product} is installed but not signed in.`,
        actions: [{kind: 'copy', label: 'Copy sign-in command', command: entry.login}, {kind: 'terminal', label: 'Open Terminal', command: entry.login}, {kind: 'refresh', label: 'Check again'}]};
    case 'ready':
      return {...base, hidden: false, account: detection.account ?? null, models: detection.models?.length ? detection.models : entry.models,
        runnable: !!entry.driver,
        message: entry.driver ? `Signed in with ${entry.product}.` : `${entry.product} is installed. Aux support is not verified yet.`,
        actions: entry.logout ? [{kind: 'explain', label: 'Disconnect', text: `Sign out in ${entry.product}: run ${entry.logout}.`, command: entry.logout}] : []};
    default:
      return {...base, hidden: entry.hiddenUnlessInstalled && !detection.path, message: detection.detail ?? 'Aux could not check this provider.',
        actions: [{kind: 'refresh', label: 'Check again'}]};
  }
}
