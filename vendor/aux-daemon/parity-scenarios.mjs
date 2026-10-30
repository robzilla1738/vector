// Test-only: the calls parity-harness.mjs makes for every namespace in registry.mjs, once through
// the supplied routers and once through Aux's. A call is [procedure, input, context?]; an input may
// be a function of the namespace's earlier outputs and the harness, and a context replaces the
// scenario's caller context for that call. A bare function is a step; what it
// returns, if anything, is compared too. `snapshot` reads
// the supplied state the namespace writes, after its calls.
const a = {accountId: 0};
/** A caller from another machine, as the daemon's HTTP server reports one. */
const remote = () => ({req: new Request('http://192.0.2.10/trpc'), honoCtx: {env: {incoming: {socket: {remoteAddress: '192.0.2.10', remoteFamily: 'IPv4', remotePort: 50000}}},
  req: {header: () => undefined, method: 'POST', query: () => undefined, raw: new Request('http://192.0.2.10/trpc')}}});
const created = (outputs, index = 0) => outputs.filter(output => output.procedure === 'create' && output.value)[index].value;

const web = (origin, extra = {}) => ({accountId: 0, source: 'web-push-notification', title: `From ${origin}`, content: 'Body', metadata: {origin}, ...extra});
const inbox = {calls: [
  ['listNotificationGrants', a],
  ['getNotificationGrant', {accountId: 0, origin: 'https://news.example'}],
  ['ingest', web('https://news.example/a/b?c', {externalEventId: 'push-1'})],
  ['ingest', web('https://news.example', {externalEventId: 'push-1', title: 'Same event again'})],
  ['ingest', web('https://news.example', {externalEventId: 'push-2', metadata: {origin: 'https://news.example', connectionId: 'k1'}})],
  ['ingest', web('https://news.example', {externalEventId: 'push-2', metadata: {origin: 'https://news.example', connectionId: 'k2'}})],
  ['ingest', web('https://news.example', {externalEventId: 'push-2', metadata: {origin: 'https://news.example', connectionId: 'k1'}})],
  ['ingest', {accountId: 0, source: 'channel', title: 'Hi', content: 'Hello', preview: 'He', threadKey: 't-1', from: {id: 'u1', name: 'Ada', type: 'user'}, metadata: {channel: 'slack'}}],
  ['ingest', {accountId: 0, source: 'web-push-notification', title: 'No metadata', content: 'x', from: {name: 'https://mail.example/inbox'}}],
  ['ingest', {accountId: 0, source: 'web-push-notification', title: 'Context only', content: 'x', metadata: {contextUrl: 'not a url'}}],
  ['syncNotificationPermission', {accountId: 0, origin: 'https://chat.example/room', permission: 'allow_for_ai', source: 'api', timestamp: 1700000000000}],
  ['syncNotificationPermission', {accountId: 0, origin: 'https://news.example', permission: 'deny', source: 'native_ui'}],
  ['ingest', web('https://news.example/later')],
  ['syncNotificationPermission', {accountId: 0, origin: 'not a url', permission: 'allow_for_ai', source: 'api'}],
  ['syncNotificationPermission', {accountId: 0, origin: 'https://far.example', permission: 'allow_for_ai', source: 'api', timestamp: 1e20}],
  ['revokeNotificationGrant', {accountId: 0, origin: 'https://never.example'}],
  ['syncNotificationPermission', {accountId: 0, origin: 'https://news.example', permission: 'allow_for_ai', source: 'native_ui'}],
  ['ingest', web('https://news.example/back', {externalEventId: 'push-3'})],
  ['overview', a],
  ['overview', {accountId: 0, messageLimit: 2}],
  ['listNotificationGrants', a],
  ['getNotificationGrant', {accountId: 0, origin: 'https://chat.example'}],
  ['getNotificationGrant', {accountId: 0, origin: 'https://never.example'}],
  ['ingest', {accountId: 0, source: 'x', content: 'no title'}],
  ['ingest', {accountId: 0, source: 'x', title: 't', content: 'c', from: {type: 'robot'}}],
  ['syncNotificationPermission', {accountId: 0, origin: 'https://a.example', permission: 'maybe', source: 'api'}],
  ['overview', {accountId: 0, messageLimit: 'ten'}],
  ['listNotificationGrants', {accountId: 7}],
  ['listNotificationGrants', {accountId: -1}],
]};

const surfaces = ({daemon}) => [...daemon.attentionByAccountId].map(([accountId, entries]) => [accountId, [...entries]]);
const report = (surfaceId, extra = {}) => ['reportAgentManagerSessionAttention', {accountId: 0, surfaceId, focused: true, visible: true, ...extra}];
const uiAttention = {
  calls: [
    report('panel', {sessionId: 'session-1', sequence: 1}),
    report('panel', {focused: false, sequence: 1}),
    report('panel', {focused: false, sequence: 0}),
    report('panel', {focused: false}),
    report('tab', {focused: false, visible: false, engaged: true}),
    report('  popup  ', {sessionId: '  session-2 ', engaged: false}),
    ({advance}) => advance(31_000),
    report('newtab', {sequence: 3}),
    surfaces,
    ({advance}) => advance(61_000),
    report('panel', {sessionId: 'session-1', sequence: 2}),
    report('   '),
    report('x'.repeat(129)),
    report('panel', {sequence: -1}),
    report('panel', {sequence: 1.5}),
    report('panel', {sessionId: ''}),
    ['reportAgentManagerSessionAttention', {accountId: 0, surfaceId: 'panel', focused: 'yes', visible: true}],
    ['reportAgentManagerSessionAttention', {accountId: 9, surfaceId: 'panel', focused: true, visible: true}],
  ],
  snapshot: ({daemon}) => ({
    surfaces: surfaces({daemon}),
    foreground: ['session-1', 'session-2'].map(sessionId => daemon.hasForegroundAgentManagerSessionAttention(0, sessionId)),
    focused: daemon.hasFocusedAgentManagerSurface(),
  }),
};

const fullDiskAccess = {calls: [['check'], ['request'], ['check', {unexpected: true}]]};

const agentRuntime = {calls: [
  ['status'], ['job'],
  ['install', {force: 'yes'}], ['install', {force: false, extra: 1}], ['install', {}],
  ['install', {force: false}],
  () => new Promise(resolve => setTimeout(resolve, 50)),
  ['job'], ['install', {force: true}],
  () => new Promise(resolve => setTimeout(resolve, 50)),
  ['job'], ['status'],
]};

const document = {targetId: 'target-1', documentCapability: '6f1c2b8e-3a0d-4c5e-9b7a-2d4e6f8a0b1c'};
const capture = {calls: [
  ['viewport', document], ['fullPage', document],
  ['viewport', {...document, documentCapability: 'not-a-uuid'}], ['fullPage', {...document, targetId: ''}], ['viewport', {targetId: 'target-1'}],
]};

const routine = {name: 'Morning brief', prompt: 'Summarize my tabs.', rrule: 'FREQ=DAILY;BYHOUR=8'};
const routines = {calls: [
  ['create', {accountId: 0, ...routine}],
  ({daemon}) => daemon.settings(0).set('routineDeviceId', () => 'device-a'),
  ['list', a],
  ['create', {accountId: 0, ...routine}],
  ['create', {accountId: 0, ...routine, type: 'child'}],
  ['create', {accountId: 0, ...routine, name: ''}],
  ['list', a], ['list', {accountId: 0, type: 'standalone', includeDeleted: true}], ['list', {accountId: 0, type: 'weekly'}],
  ['get', outputs => ({accountId: 0, routineId: created(outputs).id})],
  ['summary', outputs => ({accountId: 0, routineId: created(outputs).id})],
  ['get', {accountId: 0, routineId: 'missing'}], ['summary', {accountId: 0, routineId: 'missing'}],
  ['update', outputs => ({accountId: 0, routineId: created(outputs).id, name: 'Evening brief'})],
  ['update', {accountId: 0, routineId: 'missing', name: 'x'}],
  ['delete', {accountId: 0, routineId: 'missing'}], ['runNow', {accountId: 0, routineId: 'missing'}],
  ({daemon}) => daemon.settings(0).set('routineDeviceId', () => 'device-b'),
  ['delete', outputs => ({accountId: 0, routineId: created(outputs).id})],
  ['runNow', outputs => ({accountId: 0, routineId: created(outputs).id})],
  ({daemon}) => daemon.settings(0).set('routineDeviceId', () => 'device-a'),
  ['runNow', outputs => ({accountId: 0, routineId: created(outputs).id})],
  () => new Promise(resolve => setTimeout(resolve, 100)),
  ['delete', outputs => ({accountId: 0, routineId: created(outputs).id, revision: 0})],
  ['delete', outputs => ({accountId: 0, routineId: created(outputs).id, revision: 1})],
  ['delete', outputs => ({accountId: 0, routineId: created(outputs).id})],
  ['list', {accountId: 0, includeDeleted: true}],
]};

const projects = {calls: [
  ['list', a],
  ['defaultWorkspacePath', {accountId: 0, projectId: 'garden'}],
  ['create', outputs => ({accountId: 0, id: 'garden', name: 'Garden', workspacePath: outputs[1].value.defaultWorkspacePath})],
  ['create', outputs => ({accountId: 0, id: 'garden', name: 'Garden again', icon: 'aux', color: 'green', workspacePath: outputs[1].value.defaultWorkspacePath})],
  ['create', outputs => ({accountId: 0, id: 'garden', name: 'Garden', icon: 'leaf', workspacePath: outputs[1].value.defaultWorkspacePath})],
  ['defaultWorkspacePath', {accountId: 0, projectId: 'garden'}],
  ['create', (outputs, {home}) => ({accountId: 0, id: 'notes', name: 'Notes', workspacePath: `${home}/Notes folder`})],
  ['create', {accountId: 0, id: 'rel', name: 'Relative', workspacePath: 'relative/path'}],
  ['create', {accountId: 0, id: '', name: 'No id', workspacePath: '/abs'}],
  ['get', outputs => ({accountId: 0, projectId: created(outputs).id})],
  ['get', {accountId: 0, projectId: 'missing'}],
  ['listFiles', outputs => ({accountId: 0, projectId: created(outputs).id})],
  ['listFiles', outputs => ({accountId: 0, projectId: created(outputs, 2).id})],
  ['readFile', outputs => ({accountId: 0, projectId: created(outputs).id, fileName: 'AGENTS.md'})],
  ['writeFile', outputs => ({accountId: 0, projectId: created(outputs, 2).id, fileName: 'AGENTS.md', content: 'Be brief.'})],
  ['readFile', outputs => ({accountId: 0, projectId: created(outputs, 2).id, fileName: 'AGENTS.md'})],
  ['readFile', outputs => ({accountId: 0, projectId: created(outputs).id, fileName: 'NOTES.md'})],
  ['importFiles', outputs => ({accountId: 0, projectId: created(outputs, 2).id, files: [
    {name: 'plan.txt', data: Buffer.from('one').toString('base64')}, {name: 'nested/plan.txt', data: Buffer.from('two').toString('base64')},
    {name: 'archive', data: Buffer.from('three').toString('base64')}, {name: '.hidden', data: ''}]})],
  ['importFiles', outputs => ({accountId: 0, projectId: created(outputs, 2).id, files: [{name: 'ok.txt', data: 'b2s='}, {name: '..', data: ''}]})],
  ['importFiles', outputs => ({accountId: 0, projectId: created(outputs, 2).id, files: []})],
  ['listFiles', outputs => ({accountId: 0, projectId: created(outputs, 2).id})],
  ['update', outputs => ({accountId: 0, projectId: created(outputs).id, name: 'Kitchen garden', color: 'green'})],
  ['update', outputs => ({accountId: 0, projectId: created(outputs).id, name: ''})],
  ['delete', outputs => ({accountId: 0, projectId: created(outputs).id})],
  async ({daemon}) => void await daemon.createRoutine(0, {name: 'Water', prompt: 'Water the plants.', rrule: 'FREQ=DAILY', projectId: 'garden', type: 'standalone'}),
  ['archive', outputs => ({accountId: 0, projectId: created(outputs).id})],
  ['delete', outputs => ({accountId: 0, projectId: created(outputs).id})],
  ['get', outputs => ({accountId: 0, projectId: created(outputs).id})],
  ['list', a],
]};

const billing = {calls: [
  ['getUsage', {accountId: 0, start: 'yesterday', end: 'today'}], ['getUsage', {accountId: 0, start: '2026-01-01T00:00:00Z', end: '2026-01-02T00:00:00Z', limit: 101}],
  ['getSubscription', {accountId: 0, fresh: true}],
  ['getSummary', a], ['getSubscription', a], ['getUsage', {accountId: 0, start: '2026-01-01T00:00:00Z', end: '2026-01-02T00:00:00Z'}],
  ['createPortal', {accountId: 0, returnUrl: 'https://app.getaux.co/settings'}], ['createPortal', {accountId: 0, returnUrl: 'nope', place: 'settings'}],
  ['createCheckout', {accountId: 0, lookupKey: 'aux_pro_month', returnUrl: 'https://app.getaux.co'}], ['createCheckout', {accountId: 0, lookupKey: 'pro', returnUrl: 'https://app.getaux.co'}],
  ['createAddOnCheckout', {accountId: 0, cancelUrl: 'https://app.getaux.co', successUrl: 'https://app.getaux.co', creditCents: 1000}],
  ['createAddOnCheckout', {accountId: 0, cancelUrl: 'https://app.getaux.co', successUrl: 'https://app.getaux.co', creditCents: 7}],
  ['setAutoReload', {accountId: 0, enabled: false}], ['setAutoReload', {accountId: 0}],
  ['createPortal', {accountId: 3, returnUrl: 'https://app.getaux.co'}],
]};

const referrals = {calls: [['getGuestPasses', a], ['getCode', a], ['getCode', {accountId: 4}]]};

const settings = {calls: [
  ['getAll', a], ['get', {accountId: 0, key: 'completionSound'}], ['get', {accountId: 0, key: 'timezone'}],
  ['set', {accountId: 0, key: 'timezone', value: 'America/Chicago'}], ['set', {accountId: 0, key: 'sidebarRecentChatLimit', value: 12}],
  ['set', {accountId: 0, key: 'contextAwareness', value: {enabled: true}}], ['set', {accountId: 0, key: 'nope', value: 1}], ['get', {accountId: 0, key: 'timezone'}],
  ['agentGet', a], ['agentUpdate', {accountId: 0, name: 'Juniper', setupCompleted: true}], ['agentUpdate', {accountId: 0, name: 'x'.repeat(201)}],
  ['agentAvatar', {accountId: 0, revision: '1'}], ['agentSetAvatar', {accountId: 0, dataUrl: 'data:text/plain,hi'}], ['agentClearAvatar', a],
  ['agentSetHome', {accountId: 0, sessionId: 'missing'}], ['agentGet', a],
  ['readContextFile', {accountId: 0, fileName: 'AGENTS.md'}], ['writeContextFile', {accountId: 0, fileName: 'AGENTS.md', content: 'Be kind.'}],
  ['readContextFile', {accountId: 0, fileName: 'AGENTS.md'}], ['readContextFile', {accountId: 0, fileName: 'secrets.txt'}],
  ['getCompletionSound', a], ['setCompletionSound', {accountId: 0, fileName: 'ding.mp3', mimeType: 'audio/mpeg', data: 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA'}],
  ['getCompletionSound', a], ['setCompletionSound', {accountId: 0, fileName: 'x.exe', mimeType: 'application/x-msdownload', data: 'AAAA'}],
  ['resetCompletionSound', a], ['getCompletionSound', a],
]};

const developers = {calls: [
  ['getAuxBrowserSkill'], ['checkCliInstallation'], ['checkAgentInstallations'],
  ['installAuxBrowserSkill', {id: 'general'}], ['installAuxBrowserSkill', {id: 'claude-code'}], ['installAuxBrowserSkill', {id: 'nope'}],
  ['refreshAuxBrowserSkills'], ['checkAgentInstallations'],
]};

const onboarding = {calls: [
  ['detectBrowsers'], ['detectPasswordManagers', {}], ['detectPasswordManagers', {extensions: 'x'}], ['detectAISubscription'],
  ['analyzeUserApps'], ['analyzeUserApps', {days: 7, limit: 5}], ['analyzeUserApps', {days: 0}],
]};

const homeFile = (outputs, {home}) => ({accountId: 0, path: `${home}/control/accounts.json`});
const meta = {
  // A loopback caller, as the daemon's HTTP server reports one.
  context: () => ({honoCtx: {env: {incoming: {socket: {remoteAddress: '127.0.0.1', remoteFamily: 'IPv4', remotePort: 50000}}}}}),
  calls: [
    ['resolvePath', homeFile], ['resolvePath', {accountId: 0, path: 'missing.txt'}], ['resolvePath', {accountId: 0, path: 'x', session: {id: 'missing'}}],
    ['resolvePath', {accountId: 8, path: 'x'}], ['resolvePath', homeFile, remote], ['copyFile', homeFile], ['listOpenApps', homeFile],
    ['open', (outputs, harness) => ({...homeFile(outputs, harness), mode: 'reveal'})], ['open', (outputs, harness) => ({...homeFile(outputs, harness), mode: 'print'})],
    ['openWith', (outputs, harness) => ({...homeFile(outputs, harness), appPath: '/Applications/TextEdit.app'})], ['resolvePath', {}],
  ],
};

const firstSession = outputs => outputs.find(output => output.procedure === 'list' && output.value?.length)?.value[0].id ?? 'missing';
const sessionTabs = {calls: [
  ['list', {accountId: 0, sessionId: 'missing'}], ['resolveByTarget', {accountId: 0, targetId: 'target-1'}],
  ['remove', {accountId: 0, sessionId: 'missing', sessionTabId: 'tab-1'}], ['list', {accountId: 0}],
]};

const stdio = {transport: 'stdio', command: 'nonexistent-mcp', args: [], env: {}, enabled: true};
const mcp = {calls: [
  ['connectionStatus', {accountId: 0, name: 'notes'}], ['setEnabled', {accountId: 0, name: 'notes', enabled: true}], ['deleteServer', {accountId: 0, name: 'notes'}],
  ['saveServer', {accountId: 0, name: 'notes', server: stdio}], ['saveServer', {accountId: 0, name: 'notes', server: {...stdio, enabled: false}}],
  ['saveServer', {accountId: 0, previousName: 'notes', name: 'journal', server: {...stdio, enabled: false, args: ['--quiet']}}],
  ['setEnabled', {accountId: 0, name: 'journal', enabled: false}], ['setEnabled', {accountId: 0, name: 'journal', enabled: true}],
  ['testConnection', {accountId: 0, name: 'journal', server: stdio}], ['connect', {accountId: 0, name: 'journal'}], ['cancel', {accountId: 0, name: 'journal'}],
  ['refreshTools', {accountId: 0, name: 'journal'}], ['connectionStatus', {accountId: 0, name: 'journal'}], ['deleteServer', {accountId: 0, name: 'journal'}],
  ['saveServer', {accountId: 0, name: 'bad name!', server: stdio}],
]};

const connection = {accountId: 0, connectionId: '6f1c2b8e-3a0d-4c5e-9b7a-2d4e6f8a0b1c'};
const channels = {calls: [
  ['connections.list', a], ['pairing.list', connection], ['principals.list', connection], ['policies.get', connection],
  ['connections.remove', connection], ['connections.restart', connection], ['pairing.reject', {accountId: 0, requestId: connection.connectionId}],
  ['pairing.approve', {accountId: 0, requestId: connection.connectionId}], ['principals.remove', {...connection, senderId: 'U1'}],
  ['principals.update', {...connection, senderId: 'U1', canApprovePairing: true}], ['policies.update', {...connection, policy: {}}],
  ['connections.create', {accountId: 0, platform: 'slack'}], ['connections.update', {accountId: 0, connectionId: 'not-a-uuid'}], ['pairing.list', {accountId: 0, connectionId: 'x'}],
]};

const cli = {calls: [
  ['replDescription'], ['browserProfiles', a], ['resolveBrowserBinding', {accountId: 0, profileId: 'Default'}], ['skillsList', a],
  ['skillsShow', {accountId: 0, name: 'aux'}], ['skillsShow', {accountId: 0, name: 'nope'}],
  ['browserRoute', {accountId: 0, operation: 'list'}], ['browserRoute', {accountId: 0, operation: 'open', url: 'https://example.com', profile: 'Work'}],
  ['browserRoute', {accountId: 0, operation: 'delete'}], ['browserRoute', {accountId: 0, operation: 'list', accountCreatedAt: 1}],
  ['replState', {accountId: 0, id: 'missing'}], ['replRun', {accountId: 0, id: 'missing', code: '1'}], ['replClose', {accountId: 0, id: 'missing'}],
]};

const memory = {
  // Random routine ids name the directories, so their listing order differs between runs.
  unordered: ['listFiles'],
  calls: [
  ['getDirectory', a], ['listFiles', a], ['readFile', {accountId: 0, filePath: 'notes.md'}], ['writeFile', {accountId: 0, filePath: 'notes.md', content: 'x'}],
  ['readFile', {accountId: 0, filePath: '../outside.md'}], ['readFile', {accountId: 0, filePath: 'notes.txt'}], ['writeFile', {accountId: 0, filePath: 'notes.txt', content: 'x'}],
  ['listHistory', a], ['listHistory', {accountId: 0, limit: 500}], ['getHistoryEntry', {accountId: 0, historyEntryId: 'missing'}], ['getDreamState', a],
  ['revertHistoryEntry', {accountId: 0, historyEntryId: 'missing'}], ['rerunExtraction', {accountId: 0, sessionId: 'missing'}],
  ['runDreaming', {accountId: 0, force: false}], ['search', {accountId: 0, queries: []}], ['search', {accountId: 0, queries: ['garden'], maxResults: 3}],
  ['indexStatus', a],
]};

const contextAwareness = {calls: [
  ['status', a], ['status', {accountId: 0, url: 'https://example.com'}], ['permissions', a], ['historyStatus', a], ['summaries', {accountId: 0, limit: 5}],
  ['historyList', {accountId: 0, from: 0, to: Date.parse('2026-01-02')}], ['appIcons', {accountId: 0, bundleIds: []}], ['listApplications', a],
  ['pause', {accountId: 0, durationMs: 60_000}], ['resume', a], ['reportTabSignal', {accountId: 0, targetId: 't', url: 'https://example.com', kind: 'activation', sequence: 1}],
  ['reportTabSignal', {accountId: 0, targetId: '', url: 'x', kind: 'scroll'}], ['summaryModelDefault', a], ['verifyStore', {accountId: 0}],
  ['events', {accountId: 0}], ['search', {accountId: 0}], ['read', {accountId: 0}], ['summaries', {accountId: 0, limit: 0}],
]};

const request = {requestId: '6f1c2b8e-3a0d-4c5e-9b7a-2d4e6f8a0b1c', profileId: 'Default'};
const models = {calls: [
  ['getCredentialStatus', {accountId: 0, providerId: 'openrouter'}], ['listOpenRouterModelIds', a], ['listCredentials', a],
  ['listSupported', a], ['listAvailable', a], ['listAvailableImages', a], ['listSettingsInventory', a],
  ['downloadNameCancel', {accountId: 0, ...request}], ['productivityCancel', {accountId: 0, ...request}],
  ['downloadNameProposal', {accountId: 0, ...request, filename: 'scan0001.pdf', mime: 'application/pdf', sourceHost: 'example.com'}],
  ['productivityPlan', {accountId: 0, ...request, tabs: [{id: '1', title: 'A', origin: 'https://a.example'}]}],
  ['downloadNameProposal', {accountId: 0, ...request, requestId: 'x', filename: '', mime: '', sourceHost: ''}],
  ['providerCliStatus', a], ['providerCliRefresh', a],
  ['setCredential', {accountId: 0, providerId: 'openrouter', credential: {type: 'api_key', key: 'sk-parity-test'}}], ['getCredentialStatus', {accountId: 0, providerId: 'openrouter'}],
  ['listOpenRouterModelIds', a], ['setCredential', {accountId: 0, providerId: 'not-a-provider', credential: {type: 'api_key', key: 'x'}}],
  ['removeCredential', {accountId: 0, providerId: 'openrouter'}], ['getCredentialStatus', {accountId: 0, providerId: 'openrouter'}],
  ['addCustom', {accountId: 0, provider: 'ollama', modelId: 'llama3', name: 'Llama 3'}], ['removeCustom', {accountId: 0, modelId: 'llama3'}],
  ['getCustomProviderConfig', {accountId: 0, providerId: 'ollama'}], ['setCustomProvidersConfig', {accountId: 0, providers: {}}],
  ['setCustomProvidersConfig', {accountId: 0, providers: {ollama: {baseUrl: 'http://127.0.0.1:11434/v1', apiKey: 'parity-secret', api: 'openai-completions', models: [{id: 'llama3', name: 'Llama 3'}]}}}],
  ['getCustomProviderConfig', {accountId: 0, providerId: 'ollama'}], ['removeCustomProviderConfig', {accountId: 0, providerId: 'ollama'}],
  ['discoverCustomProviderModels', {accountId: 0, baseUrl: 'http://127.0.0.1:9/v1'}],
  ['listAuxModelIds', a], ['searchAuxModels', {accountId: 0, query: 'claude'}], ['setAuxModelIds', {accountId: 0, modelIds: []}],
  ['listAiGatewayModelIds', {accountId: 0, providerId: 'vercel-ai-gateway'}], ['searchAiGatewayModels', {accountId: 0, providerId: 'vercel-ai-gateway', query: 'gpt'}],
  ['setAiGatewayModelIds', {accountId: 0, providerId: 'vercel-ai-gateway', modelIds: ['openai/gpt-5']}], ['searchOpenRouterModels', {accountId: 0, query: 'auto'}],
  ['setOpenRouterModelIds', {accountId: 0, modelIds: ['openrouter/auto']}], ['ensureRoutingSelectionsAvailable', a],
  ['getSubscriptionUsage', {accountId: 0, providerId: 'claude-code'}], ['getSubscriptionUsage', {accountId: 0, providerId: 'meta'}],
  ['listOAuthProviders', a], ['oauthAuthorize', {accountId: 0, providerId: 'claude-code'}], ['oauthStatus', {accountId: 0, flowId: 'missing'}],
  ['oauthCallback', {accountId: 0, flowId: 'missing', code: 'x'}], ['oauthCancel', {accountId: 0, flowId: 'missing'}],
]};


const loopbackRequest = () => new Request('http://127.0.0.1:21520/trpc');
/** A caller on loopback, as the daemon's HTTP server reports one; `headers` are its request headers. */
const loopback = (headers = {}) => ({req: loopbackRequest(), honoCtx: {env: {incoming: {socket: {remoteAddress: '127.0.0.1', remoteFamily: 'IPv4', remotePort: 50000}}},
  req: {header: name => headers[name.toLowerCase()], method: 'POST', query: () => undefined, raw: loopbackRequest()}}});

const createdTask = outputs => outputs.find(output => output.procedure === 'create' && output.value)?.value.id ?? 'missing';
const task = extra => outputs => ({accountId: 0, sessionId: createdTask(outputs), ...extra});
const queuedMessage = {role: 'user', content: [{type: 'text', text: 'later'}], timestamp: 1};
const sessions = {
  context: () => loopback(),
  calls: [
    ['create', {accountId: 0, title: 'Garden notes'}], ['create', {accountId: 0, trigger: {type: 'agent'}}], ['create', {accountId: 0, harnessId: 'coder'}],
    ['list', a], ['listPreviewItems', a], ['list', {accountId: 0, archived: 'include'}],
    ['get', task()], ['get', {accountId: 0, sessionId: 'missing'}], ['markRead', task()], ['markUnread', task()], ['listRuns', task()],
    ['update', task({title: 'Kitchen notes', pinned: true})], ['update', task({runtimeConfig: {workingDirs: []}})], ['update', task({incognito: true})],
    ['update', task({permissionMode: 'guard'})], ['update', task({browserBinding: {profileId: 'Default', browserMode: 'default', windowId: 1}})],
    ['update', task({browserBinding: {profileId: 'Work', browserMode: 'default', windowId: 1}})], ['update', task({})], ['update', task({status: 'flying'})],
    ['moveToProject', task({projectId: 'missing'})], ['moveToProject', task({projectId: null})],
    ['files.list', task()], ['files.metadata', task({path: 'notes.txt'})], ['files.content', task({path: 'notes.txt'})],
    ['files.uploadAttachment', task({attachment: {name: 'notes.txt', mimeType: 'text/plain', data: Buffer.from('hello').toString('base64')}})],
    ['files.uploadAttachment', task({attachment: {id: 'a1', type: 'file', name: 'notes.txt', mimeType: 'text/plain', data: Buffer.from('hello').toString('base64')}})],
    ['files.uploadAttachment', task({attachment: {id: 'a2', type: 'file', name: 'plan.md', mimeType: 'text/markdown', data: Buffer.from('# Plan').toString('base64')}})],
    ['files.list', task()],
    ['files.metadata', outputs => task({path: outputs.find(output => output.procedure === 'files.uploadAttachment' && output.value)?.value.path ?? 'x'})(outputs)],
    ['files.rename', outputs => task({path: outputs.find(output => output.procedure === 'files.uploadAttachment' && output.value)?.value.path ?? 'x', name: '../x'})(outputs)],
    ['files.rename', outputs => task({path: outputs.filter(output => output.procedure === 'files.uploadAttachment' && output.value)[1]?.value.path ?? 'x', name: 'notes.txt'})(outputs)],
    ['files.rename', outputs => task({path: outputs.find(output => output.procedure === 'files.uploadAttachment' && output.value)?.value.path ?? 'x', name: 'todo.txt'})(outputs)],
    ['files.rename', outputs => task({path: outputs.filter(output => output.procedure === 'files.rename' && output.value).at(-1)?.value.path ?? 'x', name: 'todo.txt'})(outputs)],
    ['files.list', task(), remote], ['files.list', task()], ['files.delete', task({path: 'missing.txt'})],
    ['files.delete', outputs => task({path: outputs.filter(output => output.procedure === 'files.rename' && output.value).at(-1)?.value.path ?? 'x'})(outputs)], ['files.list', task()],
    ['messages', task()], ['messageRows', task()], ['turns.list', task()], ['turns.activeMessages', task()], ['turns.messages', task({turnId: 'missing', revision: 0})],
    ['branch', task({messageId: 'missing'})], ['editUserMessage', task({messageId: 'missing', content: 'x'})], ['clearMessages', task()],
    ['removeQueuedMessage', task({message: queuedMessage})], ['updateQueuedMessage', task({message: queuedMessage, text: 'sooner'})],
    ['moveQueuedMessage', task({message: queuedMessage, beforeTimestamp: null})],
    ['resolveSuspension', task({toolCallId: 'call-1', response: {ok: true}})], ['rejectSuspension', task({toolCallId: 'call-1', error: 'no'})],
    ['abort', task()], ['interrupt', task()], ['compact', task({instructions: ''})], ['shareStatus', task()], ['share', task()], ['unshare', task()],
    ['channelTaskSnapshot', task()], ['deliverChannelTask', {accountId: 0}], ['childSessions', outputs => ({accountId: 0, parentId: createdTask(outputs)})],
    ['childSessions', {accountId: 0, parentId: 'p', archived: 'include'}], ['liveToolCalls', task()], ['archive', task()], ['unarchive', task()],
    ['reportFeedback', task({comment: 'Great.'})], ['researchCapability', {accountId: 0, browserBinding: {}, model: {provider: 'openrouter', modelId: 'openrouter/auto'}}],
    ['createAndPrompt', {accountId: 0, title: 'Research', message: {role: 'user', content: 'hi'}, research: {kind: 'web-search', query: 'tomatoes'}}],
    ['createAndPrompt', {accountId: 0, title: 'Ask', message: {role: 'user', content: [{type: 'text', text: 'hi'}], timestamp: 1}}],
    () => new Promise(resolve => setTimeout(resolve, 100)),
    ['steer', task({prompt: 'faster'})], ['queue', task({prompt: 'then this'})], ['steer', task({prompt: '  '})],
    () => new Promise(resolve => setTimeout(resolve, 100)),
    ['delete', task()], ['get', task()], ['list', a],
  ],
};

const skill = extra => ({accountId: 0, projectId: null, ...extra});
const skills = [
  ['getSkillsDirectory', skill()], ['listSkills', skill()], ['listSkillsForSettings', skill()], ['getSkillsDirectory', skill({projectId: 'missing'})],
  ['createSkill', skill({name: 'Plant care', description: 'Water and feed plants.', body: 'Water weekly.'})],
  ['createSkill', skill({name: 'Plant care', description: 'Again.', body: 'x'})], ['listSkillsForSettings', skill()],
  ['readSkillFile', skill({skillPath: 'user/plant-care/SKILL.md'})], ['readSkillFile', skill({skillPath: '../../x.md'})], ['listSkillFiles', skill({skillName: 'user/plant-care'})],
  ['updateSkill', skill({skillPath: 'user/plant-care', name: 'Plant care', description: 'Water, feed and repot.', body: 'Water weekly.'})],
  ['setSkillEnabled', skill({skillPath: 'user/plant-care', enabled: false})], ['readSkillFile', skill({skillPath: 'user/plant-care/SKILL.md'})],
  ['setSkillEnabled', skill({skillPath: 'user/plant-care', enabled: true})], ['readSkillFile', skill({skillPath: 'user/plant-care/SKILL.md'})], ['setSkillAgents', skill({skillPath: 'user/plant-care', agents: ['aux']})],
  ['setSkillAgents', skill({skillPath: 'user/plant-care', agents: []})], ['copySkillForCustomization', skill({skillPath: 'user/plant-care'})],
  ['copySkillForCustomization', skill({skillPath: 'missing'})], ['importSkillFolder', skill({sourcePath: '/nonexistent/skill'})],
  ['importSkillFolder', (outputs, {home}) => skill({sourcePath: `${home}/control/accounts.json`})], ['importSkillFolder', skill({sourcePath: '.hidden'})],
  ['deleteSkill', skill({skillPath: 'user/plant-care'})], ['listSkillsForSettings', skill()], ['listSkills', skill()],
];
projects.calls.push(...skills);

const analytics = {calls: [
  ['identify', {accountId: 0, appVersion: '1.0.0'}], ['identify', {accountId: 0, appVersion: '  '}], ['capture', {accountId: 0, event: 'tab.opened', properties: {count: 1}}],
  ['captureException', {accountId: 0, name: 'TypeError', message: 'boom', stack: 'TypeError: boom', properties: {}}], ['isFeatureEnabled', {accountId: 0, key: 'agents'}],
  ['isExperimentalEligible', a], ['capture', {accountId: 0, event: 'x', properties: 'no'}],
]};

const sync = {calls: [
  ['status', a], ['resolveConflict', {accountId: 0, path: 'AGENTS.md', choice: 'local'}], ['resolveConflict', {accountId: 0, path: '', choice: 'mine'}], ['status', a],
]};

const lasso = {
  context: ({daemon}) => loopback({origin: [...daemon.allowedExtensionOrigins][0]}),
  calls: [
    ['transform', {selection: {text: 'hey there', selectionKind: 'text', sourceKind: 'textarea'}, messages: [{role: 'user', content: 'Make it formal.'}]}],
    ['transform', {selection: {text: 'hello'}, messages: [{role: 'user', content: 'Make it formal.'}]}],
    ['transform', {selection: {text: 'x', selectionKind: 'text', sourceKind: 'input'}, messages: [{role: 'user', content: 'x'}]}, () => loopback({origin: 'https://example.com'})], ['transform', {selection: {text: 'x', selectionKind: 'text', sourceKind: 'input'}, messages: []}],
  ],
};

const profileContext = {profileId: 'Default', profilePath: '/tmp/aux-parity-profile', bindingVersion: 1};
const accounts = {
  context: () => loopback(),
  calls: [
    ['list'], ['summary'], ['current'], ['get', {accountId: 0}], ['get', {accountId: 5}], ['update', {accountId: 0, name: 'Robert'}],
    ['update', {accountId: 0, profileUrl: 'nope'}], ['setCurrent', {accountId: 0}], ['get', {accountId: -1}],
    ['apiAccessToken', a], ['apiAccessToken', a, remote], ['deviceCodePending', a], ['deviceCodeLookup', {accountId: 0, userCode: 'ABCD-EFGH'}], ['deviceCodeDecide', {accountId: 0, userCode: 'ABCD-EFGH', decision: 'deny'}],
    // A second profile gets its own account; removing that profile's binding removes the account
    // and its local data, which must leave account 0 alone.
    ['syncProfileMetadata', a], ['resolveProfileAccountByProfile', {profileId: 'Work'}], ['bindProfile', {profileId: 'Work', userId: 'user-1', accountId: 1}],
    ['bindProfile', {profileId: ''}], ['summary'], ['removeProfileBinding', {}], ['removeProfileBinding', {profileId: 'Work'}], ['ensureProfileAccount', {}],
    ['add', {name: 'Second', provider: 'nope', mode: 'local'}], ['summary'],
    ['auth.prepareSignIn', {profileContext: {profileId: 'Default'}}], ['auth.prepareSignIn', {email: 'not-an-email', profileContext}],
    ['auth.startEmailAuth', {accountId: 0, email: 'robert@example.com'}], ['auth.startEmailAuth', {accountId: 0, email: 'x', intent: 'again'}],
    ['auth.verifyEmailCode', {accountId: 0, email: 'robert@example.com', code: '12345'}], ['auth.verifyEmailCode', {accountId: 0, email: 'robert@example.com', code: '123456'}],
    ['auth.exchangeToken', {accountId: 0, supabaseAccessToken: ''}], ['auth.exchangeToken', {accountId: 0, supabaseAccessToken: 'token', signInAttemptId: 'x'}],
    ['auth.startGoogleOAuth', {accountId: 0, returnUrl: 'https://evil.example/'}], ['auth.cancelGoogleOAuth', {oauthAttemptId: 'attempt-1'}], ['auth.cancelGoogleOAuth', {oauthAttemptId: ''}],
    ['auth.me', {accountId: 0}], ['auth.devices', a], ['auth.signOutDevice', {accountId: 0, deviceId: 'x'}], ['auth.updateProfile', {accountId: 0, name: ' '}],
    ['auth.syncKeyStatus', a], ['auth.enrollSyncKeyRecovery', {accountId: 0, expectedSyncGeneration: -1}], ['auth.recoverSyncKey', {accountId: 0, recoveryEntropyB64: ''}],
    ['auth.completeOnboarding', {accountId: 9}], ['auth.signOut', {accountId: 9}], ['auth.deleteAccount', {accountId: 9}], ['auth.signOut', {accountId: 0, strategy: 'everywhere'}],
    ['summary'],
  ],
};

export const SCENARIOS = {inbox, uiAttention, fullDiskAccess, agentRuntime, capture, routines, projects, billing, referrals,
  settings, developers, onboarding, meta, 'sessions.tabs': sessionTabs, mcp, channels, cli, memory, contextAwareness, models, sessions, analytics, sync, lasso,
  // Last: it adds and removes accounts.
  accounts};
/** Bundle names the scenarios read beyond the routers. */
export const EXTRA_EXPORTS = ['attentionByAccountId', 'hasForegroundAgentManagerSessionAttention', 'hasFocusedAgentManagerSurface', 'settings', 'createRoutine', 'allowedExtensionOrigins'];
