/** Remove the supplied in-app subscription sign-ins that borrow another product's OAuth
 * client or impersonate another client (owner decision 1, 2026-10-28). Sign-in moves to the
 * official CLIs (index.mjs); Kimi and Meta stay on API keys. Count-checked exact anchors on
 * the composed daemon entry and the Agent provider list; apply once, after identity edits.
 * Hosted inference paths, API-key providers and the Aux ChatGPT module are untouched. */

const signIn = (product, command) => `throw Error(${JSON.stringify(`Sign in with ${product} instead: run ${command} in Terminal, then choose it in Settings > Models.`)});`;
const apiKey = provider => `throw Error(${JSON.stringify(`${provider} sign-in is not available in Aux. Add a ${provider} API key in Settings > Models.`)});`;
const CODEX = signIn('the Codex CLI', 'codex login'), CLAUDE = signIn('Claude Code', 'claude auth login'),
  GROK = signIn('Grok Build', 'grok login'), COPILOT = signIn('the GitHub Copilot CLI', 'copilot'),
  KIMI = apiKey('Kimi For Coding'), META = apiKey('Meta Model');
const edit = (group, name, find, replace, count = 1) => Object.freeze({group, name, find, replace, count});

export const DAEMON_EDITS = Object.freeze([
  edit('codex', 'Codex CLI OAuth client id (pi-ai flow)', 'CLIENT_ID$2=`app_EMoamEEZ73f0CkXaXp7hrann`', 'CLIENT_ID$2=``'),
  edit('codex', 'Codex CLI OAuth client id (web flow)', 'CLIENT_ID=`app_EMoamEEZ73f0CkXaXp7hrann`', 'CLIENT_ID=``'),
  edit('codex', 'refuse borrowed Codex login', 'openaiCodexOAuth={name:`OpenAI (ChatGPT Plus/Pro)`,isSubscription:!0,async login(Cn){', `openaiCodexOAuth={name:\`OpenAI (ChatGPT Plus/Pro)\`,isSubscription:!0,async login(Cn){${CODEX}`),
  edit('codex', 'refuse borrowed Codex refresh', 'refresh:(Cn,ei)=>refreshOpenAICodexToken(Cn.refresh,ei)', `refresh:async()=>{${CODEX}}`),
  edit('copilot', 'VS Code Copilot OAuth client id', 'CLIENT_ID$5=decode$1(`SXYxLmI1MDdhMDhjODdlY2ZlOTg=`)', 'CLIENT_ID$5=``'),
  edit('copilot', 'VS Code editor headers (OAuth helpers)', 'COPILOT_HEADERS={"User-Agent":`GitHubCopilotChat/0.35.0`,"Editor-Version":`vscode/1.107.0`,"Editor-Plugin-Version":`copilot-chat/0.35.0`,"Copilot-Integration-Id":`vscode-chat`}', 'COPILOT_HEADERS={}'),
  edit('copilot', 'VS Code editor headers (model manager)', 'GITHUB_COPILOT_HEADERS={"User-Agent":`GitHubCopilotChat/0.35.0`,"Editor-Version":`vscode/1.107.0`,"Editor-Plugin-Version":`copilot-chat/0.35.0`,"Copilot-Integration-Id":`vscode-chat`,"X-GitHub-Api-Version":`2026-06-01`}', 'GITHUB_COPILOT_HEADERS={"X-GitHub-Api-Version":`2026-06-01`}'),
  edit('copilot', 'VS Code editor headers (bundled model catalog)', 'headers:{"User-Agent":`GitHubCopilotChat/0.35.0`,"Editor-Version":`vscode/1.107.0`,"Editor-Plugin-Version":`copilot-chat/0.35.0`,"Copilot-Integration-Id":`vscode-chat`}', 'headers:{}', 29),
  edit('copilot', 'VS Code Copilot user agent (device flow)', ',"User-Agent":`GitHubCopilotChat/0.35.0`},body:new URLSearchParams({client_id:CLIENT_ID$5,', '},body:new URLSearchParams({client_id:CLIENT_ID$5,', 2),
  edit('copilot', 'refuse borrowed Copilot login', 'githubCopilotOAuth={name:`GitHub Copilot`,isSubscription:!0,login:loginGitHubCopilot,', `githubCopilotOAuth={name:\`GitHub Copilot\`,isSubscription:!0,login:async()=>{${COPILOT}},`),
  edit('claude', 'Claude Code OAuth client id (pi-ai flow)', 'CLIENT_ID$6=decode$2(`OWQxYzI1MGEtZTYxYi00NGQ5LTg4ZWQtNTk0NGQxOTYyZjVl`)', 'CLIENT_ID$6=``'),
  edit('claude', 'Claude Code OAuth client id (subscription flow)', 'CLIENT_ID$1=Buffer$1.from(`OWQxYzI1MGEtZTYxYi00NGQ5LTg4ZWQtNTk0NGQxOTYyZjVl`,`base64`).toString(`utf8`)', 'CLIENT_ID$1=``'),
  edit('claude', 'refuse borrowed Anthropic login', 'anthropicOAuth={name:`Anthropic (Claude Pro/Max)`,isSubscription:!0,login:loginAnthropic,', `anthropicOAuth={name:\`Anthropic (Claude Pro/Max)\`,isSubscription:!0,login:async()=>{${CLAUDE}},`),
  edit('claude', 'refuse borrowed Claude subscription login', 'oauth:{name:`Claude Subscription`,async login(Cn){', `oauth:{name:\`Claude Subscription\`,async login(Cn){${CLAUDE}`),
  edit('claude', 'stop Claude Code billing impersonation', 'function withClaudeCodeBilling(Cn,ei){return Cn.provider===`claude-code`?', 'function withClaudeCodeBilling(Cn,ei){return !1?'),
  edit('claude', 'Claude Code version and billing salt', 'CLAUDE_CODE_VERSION=`2.1.280`,BILLING_FINGERPRINT_SALT=`59cf53e54c78`', 'CLAUDE_CODE_VERSION=``,BILLING_FINGERPRINT_SALT=``'),
  edit('claude', 'Claude Code billing header block', 'return{type:`text`,text:`x-anthropic-billing-header: cc_version=${CLAUDE_CODE_VERSION}.${ii.slice(0,3)}; cc_entrypoint=cli; cch=00000;`}', 'return{type:`text`,text:``}'),
  edit('claude', 'Claude Code user agent (subscription policy)', ',"user-agent":`claude-cli/${CLAUDE_CODE_VERSION}`', ''),
  edit('claude', 'Claude Code user agent (OAuth token client)', ',"user-agent":`claude-cli/${claudeCodeVersion}`,"x-app":`cli`', ''),
  edit('grok', 'Grok CLI OAuth client id', 'XAI_CLIENT_ID=`b1a00492-073a-47ea-816f-4c329264a828`', 'XAI_CLIENT_ID=``'),
  edit('grok', 'Grok CLI OAuth scope', 'XAI_SCOPE=`openid profile email offline_access grok-cli:access api:access`', 'XAI_SCOPE=``'),
  edit('grok', 'refuse borrowed xAI login', 'login:loginXai,', `login:async()=>{${GROK}},`),
  edit('grok', 'Grok CLI client headers (composer model)', '"X-XAI-Token-Auth":`xai-grok-cli`,"x-authenticateresponse":`authenticate-response`,"x-grok-client-version":`1.0.13`,', ''),
  edit('grok', 'Grok CLI client header (usage)', 'headers:{"X-XAI-Token-Auth":`xai-grok-cli`}', 'headers:{}'),
  edit('kimi', 'Kimi Code CLI OAuth client id', 'CLIENT_ID$4=`17e5f671-d194-4dfb-9706-5516cb48c098`', 'CLIENT_ID$4=``'),
  edit('kimi', 'refuse Kimi Code subscription login', 'login:loginKimiCoding,', `login:async()=>{${KIMI}},`),
  edit('meta', 'Meta Muse OAuth client id', 'CLIENT_ID$3=`1031625952748946`', 'CLIENT_ID$3=``'),
  edit('meta', 'refuse Meta Muse subscription login', 'login:loginMeta,', `login:async()=>{${META}},`),
]);

/** Agent provider order: OAuth-only rows with no official CLI route leave the picker. Rows a
 * profile already connected stay visible through `providerIds`. */
export const AGENT_PATH = 'assets/strip-markdown-DRcmtuJc.js';
export const AGENT_EDITS = Object.freeze([
  edit('ui', 'hide Meta Muse, Grok and Kimi Code subscription rows', '"meta","meta-muse","xai-grok-oauth","kimi-code","openrouter"', '"meta","openrouter"'),
  edit('ui', 'hide in-app GitHub Copilot row', '"google","github-copilot","xai"', '"google","xai"'),
]);

/** Strings that must not survive in the delivered daemon. */
export const FORBIDDEN = Object.freeze(['app_EMoamEEZ73f0CkXaXp7hrann', 'SXYxLmI1MDdhMDhjODdlY2ZlOTg=', 'Iv1.b507a08c87ecfe98',
  'OWQxYzI1MGEtZTYxYi00NGQ5LTg4ZWQtNTk0NGQxOTYyZjVl', '9d1c250a-e61b-44d9-88ed-5944d1962f5e', 'b1a00492-073a-47ea-816f-4c329264a828',
  '17e5f671-d194-4dfb-9706-5516cb48c098', '1031625952748946', 'Copilot-Integration-Id', 'vscode-chat', 'GitHubCopilotChat',
  'copilot-chat/', 'Editor-Plugin-Version', 'Editor-Version', 'xai-grok-cli', 'x-grok-client-version', 'grok-cli:access',
  'claude-cli/', 'x-anthropic-billing-header', '59cf53e54c78']);

export function applyBorrowedIdentityRemoval({component, path, text}) {
  const edits = component === 'daemon' && path === 'entry.mjs' ? DAEMON_EDITS : component === 'agent' && path === AGENT_PATH ? AGENT_EDITS : null;
  if (!edits) return {text, anchors: []};
  if (typeof text !== 'string') throw TypeError('Borrowed identity removal requires source text');
  let output = text;
  const anchors = [];
  for (const rule of edits) {
    const actual = output.split(rule.find).length - 1;
    if (actual !== rule.count) throw Error(`Borrowed identity removal drift: ${component}/${path}: ${rule.name}: expected ${rule.count}, got ${actual}`);
    output = output.split(rule.find).join(rule.replace);
    anchors.push({kind: 'platform', ...rule});
  }
  return {text: output, anchors};
}
