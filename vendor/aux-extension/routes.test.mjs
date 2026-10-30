// Host-only: each Aux-owned route against the staged chunk it replaces (see parity.mjs), staged as
// the release hands it over: after the package edits and every earlier transform.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {GLOBALS_CSS, ROUTES, TOKEN_CHANGES, integrateRoutes, integrateStyles, readRoute, renamedBindings} from './integration.mjs';
import {assertFreeNames, assertParity, createWorld, evaluatePair} from './parity.mjs';
import {STUB_PATH} from './render-harness.mjs';
import {stagedText} from './staged.mjs';

const candidate = requireInput('candidateApp');
const textOf = chunk => stagedText(candidate, chunk);

// Scenes that set what the routes' imports return, so each branch renders: signed in or not, a
// session open or not, sidebar mode open or closed, Settings embedded or not, a menu item active.
const signedIn = {data: {accountId: 7, mode: 'cloud', authStatus: 'active', browserProfile: 'p'}, refetch: async () => ({})};
const routeScenes = [
  world => ({imports: {
    './utils-DCBm67_n.js#y': true, './sidebar-Cj9gldy1.js#s': {sidebarState: 'closed', setSidebarState: world.stub('setSidebarState')},
    './newtab-CnOLQ0yu.js#o': {accountId: 7, browserMode: 'default', setAccountId: world.stub('setAccountId')},
    './strip-markdown-DRcmtuJc.js#nr': signedIn, './strip-markdown-DRcmtuJc.js#tr': signedIn, './utils-BEeo4-cB.js#n': true,
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7, mode: 'default'}, './extension-page-url-BH3pfT7h.js#i': false,
    './Matches-B99cyGDb.js#n': () => ({to}) => to.includes('memories'),
    './-components-4o0FSqQ9.js#r': {currentSessionId: null, onSessionChange: world.stub('onSessionChange')},
    './provider-Cw0zhujt.js#f': false, './context-q_vohNW8.js#n': {currentSession: {title: '', incognito: true}, updateMode: world.stub('updateMode')},
  }, state: ['mem', 1, true, null]}),
  world => ({imports: {
    './utils-DCBm67_n.js#y': true, './sidebar-Cj9gldy1.js#s': {sidebarState: 'open', setSidebarState: world.stub('setSidebarState')},
    './newtab-CnOLQ0yu.js#o': {accountId: null, browserMode: 'incognito', setAccountId: world.stub('setAccountId')},
    './strip-markdown-DRcmtuJc.js#nr': {data: {mode: 'local'}, refetch: async () => ({})}, './strip-markdown-DRcmtuJc.js#tr': {data: {mode: 'local'}},
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7, mode: 'incognito'}, './extension-page-url-BH3pfT7h.js#i': false,
    './Matches-B99cyGDb.js#n': () => () => false,
    './-components-4o0FSqQ9.js#r': {currentSessionId: 's1', onSessionChange: world.stub('onSessionChange')},
    './provider-Cw0zhujt.js#f': true, './context-q_vohNW8.js#n': {currentSession: {title: 'Plan', incognito: false}, updateMode: world.stub('updateMode')},
  }, state: ['zzzz', 0, false, 'x']}),
];

// A channel conversation with every kind of entry the chat view draws.
const at = Date.UTC(2026, 9, 1, 12);
const task = {id: 't1', title: 'Write the report', status: 'running', environment: {type: 'cloud'}, model: {modelId: 'model-x'}, last_error: 'Failed once',
  updated_at: '2026-10-01T12:00:00Z', preview: {status: 'idle', title: 'Report', readAt: null, updatedAt: '2026-10-01T12:00:00Z',
    toolCalls: [{id: 'c1', name: 'browser'}], previewText: '**Done**'}};
const messages = [
  {id: 'm1', isOwn: true, delivery: 'read', readAt: at + 9e4, message: {role: 'user', content: 'Look at https://example.com/a), please.', timestamp: at},
    attachments: [{id: 'a1', name: 'shot.png', mimeType: 'image/png', data: 'AAAA'}], reaction: '👍'},
  {id: 'm2', message: {role: 'assistant', content: [{type: 'text', text: 'On it: aux:task/t1'}], timestamp: at + 1e3}, authorLabel: 'Aux',
    presentation: {type: 'text', images: [{url: 'https://img.example/1.png', alt: 'one'}]}},
  {id: 'm3', message: {role: 'assistant', content: 'Pick one', timestamp: at + 2e3}, presentation: {type: 'widget', widget: {prompt: 'Which?',
    helpText: 'Choose', options: [{label: 'First'}, {label: 'Second', value: 'two', description: 'The other'}]}}},
  {id: 'm4', message: {role: 'assistant', content: 'https://only.link', timestamp: at + 4e5}, presentation: {type: 'attachment', url: 'aux:task/t1/files/output/r.pdf', alt: 'r.pdf'}},
  {id: 'm5', isOwn: true, delivery: 'failed', replyTo: 'm2', message: {role: 'user', content: 'Retry me', timestamp: at + 5e5}},
  {id: 'm6', isInterrupted: true, message: {role: 'assistant', content: 'Half', timestamp: at + 5e5 + 10}},
  {id: 'm7', isStreaming: true, message: {role: 'assistant', content: '', timestamp: at + 5e5 + 20}},
];
const conversationProps = [
  world => ({messages, allMessages: [...messages, {id: 'r1', replyTo: 'm3', replyRootId: 'm3', delivery: 'read', message: {role: 'user', content: 'two', timestamp: at + 3e3}}],
    typing: true, highlighted: 'm2', firstUnreadId: 'm4', history: 'Earlier', onRead: world.stub('spy:onRead'), onReadingChange: world.stub('spy:onReadingChange'),
    onReact: world.stub('spy:onReact'), onReply: world.stub('spy:onReply'), onJump: world.stub('spy:onJump'), onRetry: world.stub('spy:onRetry'),
    onAnswer: world.stub('spy:onAnswer'), accountId: 7, task, canOpen: true,
    draftKey: 'draft:1', replyTo: {id: 'm2', message: messages[1].message, authorLabel: 'Aux'}, onSubmit: world.stub('spy:onSubmit'), onTyping: world.stub('spy:onTyping')}),
  world => ({messages: [], allMessages: [], loading: true, prefix: 'replies', accountId: 7, task: {...task, preview: undefined, status: 'errored', model: null}, canOpen: false,
    reply: true, onSubmit: world.stub('spy:onSubmit')}),
  {messages: [], allMessages: [], loading: false, suspended: true, sessionId: 's1', prompt: 'Unlock'},
  // Composer attachments and file previews.
  {attachment: {id: 'a1', type: 'file', name: 'report.csv', mimeType: 'text/csv', path: 'out/report.csv', pastedText: {preview: 'x,y', characterCount: 1200}},
    sessionId: 's1', path: 'out/report.csv', fileUrl: 'https://files/report.csv', textContent: 'a,b\n"1,2",3\n', position: 'left',
    metadata: {kind: 'text', name: 'report.csv', extension: '.csv', mimeType: 'text/csv', path: 'out/report.csv'},
    metadataState: {isLoading: false, isError: false}, textState: {isLoading: false, isError: false}, badges: 'badge', agent: {id: 'g', title: 'Fix', cwd: '/w/aux/', model: 'm'}},
  world => ({attachment: {id: 't1', type: 'tab', name: 'Docs', url: 'https://docs.example/a', faviconUrl: 'f.png'}, isUploading: true, onRemove: world.stub('spy:onRemove'),
    preview: {fileUrl: 'https://files/p.pdf', metadata: {kind: 'pdf', name: 'p.pdf', path: 'p.pdf', mimeType: 'application/pdf'}}}),
];
const conversationScenes = [
  world => ({context: {accountId: 7, tasks: [task], canOpen: true}, imports: {'./strip-markdown-DRcmtuJc.js#Xt': false}, state: [undefined, undefined]}),
  world => ({context: {accountId: 7, tasks: [], canOpen: false}, imports: {'./strip-markdown-DRcmtuJc.js#Xt': true}, state: ['typed text', [{id: 'f1', name: 'a.txt', mimeType: 'text/plain', data: 'AA'}], false, 0, false]}),
];

// The composer's toolbar and queue read their data from imports: a model list across providers with
// thinking levels and fast mode, and a queue (one with attachments, one without text, a steering
// message) paused after an interrupt. These drive the model menu, the queue and the badges.
const COMPOSER = 'assets/session-composer-Dc0LRfZA.js';
const models = [
  {provider: 'anthropic', id: 'opus', shortName: 'Opus', availableThinkingLevels: ['low', 'medium', 'high'], supportsFastMode: true},
  {provider: 'anthropic', id: 'haiku', shortName: 'Haiku', availableThinkingLevels: [], supportsFastMode: false},
  {provider: 'openai', id: 'gpt', shortName: 'GPT', availableThinkingLevels: ['low', 'high'], supportsFastMode: false},
  {provider: 'google', id: 'gem', shortName: 'Gem', availableThinkingLevels: [], supportsFastMode: true},
  ...['mistral', 'xai', 'meta'].map(provider => ({provider, id: `${provider}-1`, shortName: provider, availableThinkingLevels: [], supportsFastMode: false})),
];
// More providers with models than the list shows at once, and one with none.
const providers = [{id: 'openai', name: 'OpenAI'}, {id: 'anthropic', name: 'Anthropic'}, {id: 'google', name: 'Google'}, {id: 'empty', name: 'Empty'},
  {id: 'mistral', name: 'Mistral'}, {id: 'xai', name: 'xAI'}, {id: 'meta', name: 'Meta'}];
const queuedMessages = [
  {role: 'user-message-metadata', attachments: [{type: 'tab', url: 'https://a.example', title: 'A', faviconUrl: 'f.png'}, {type: 'file', name: 'x'}]},
  {role: 'user', content: 'First queued', timestamp: 1}, {role: 'user', content: 'Second', timestamp: 2}, {role: 'user', content: [], timestamp: 3},
];
const queueItems = [{message: queuedMessages[1], metadata: queuedMessages[0], deliveryMode: 'queued'}, {message: queuedMessages[3], deliveryMode: 'queued'}];
const later = 4102444800000;
const fastNotices = {
  turnMessagesByKey: {a: {role: 'assistant', provider: 'anthropic', model: 'opus', timestamp: 5, diagnostics: [{type: 'model_fast_mode', details: {status: 'cooldown', retryAt: later}}]}},
  messagesByKey: {b: {role: 'assistant', provider: 'anthropic', model: 'opus', timestamp: 3, diagnostics: [{type: 'other'}, {type: 'model_fast_mode', details: {status: 'off', reason: 'Not on this plan'}}]},
    c: {role: 'user'}, d: {role: 'assistant', provider: 'openai', model: 'gpt', timestamp: 9, diagnostics: [{type: 'model_fast_mode', details: {status: 'off', reason: 'GPT is slow'}}]}},
  streamingMessage: undefined,
};
// The composer's notices: an account and a billing reply, the notice the session controller holds,
// the connection, the stream, and todos and subagents in the session's tool state.
const limit = {kind: 'aux-monthly-limit-warning', usedPercent: 92, exhausted: false, resetsAt: '2026-11-01T00:00:00Z', plan: 'pro'};
const connect = {kind: 'ai-subscription-connect', description: 'Connect my AI subscription', actionLabel: 'Connect', actionPath: '/u/7/settings/model'};
const signIn = {kind: 'aux-sign-in-required', description: 'Sign in to use Aux provider', actionLabel: 'Sign in', actionPath: '/auth/sign-in'};
const billing = {data: {credit: {used_percent: 92, balance_micros: '0', add_on_balance_micros: '0', refresh_at: '2026-11-01T00:00:00Z'},
  subscription: {plan: {slug: 'max'}}}, isPending: false};
const todos = [{id: 'd1', content: 'Read the spec', status: 'completed'}, {id: 'd2', content: 'Write it', status: 'in_progress'},
  {id: 'd3', content: 'Drop it', status: 'cancelled'}];
const subagents = [{sessionId: 'a1', description: 'Search the web', isRunning: true}, {sessionId: 'a2', description: 'Summarize', isRunning: false},
  {sessionId: 'a3', description: 'Check links', isRunning: true}];
// Comments on selected text: a range inside a transcript and an annotation host, two selections
// already added (one with a comment), and Projects to pick from.
const host = {closest: () => host, getBoundingClientRect: () => ({top: 10, left: 20, width: 400, height: 300, right: 420, bottom: 310}), clientWidth: 400,
  clientHeight: 300, isConnected: true};
const range = {startContainer: {parentElement: host, isConnected: true}, endContainer: {parentElement: host}};
const selection = {text: 'picked text', rect: {width: 10, height: 10}, range};
const selections = [{id: 'sel-1', type: 'selection', text: 'one', comment: 'Earlier note'}, {id: 'sel-2', type: 'selection', text: 'two'}, {id: 'f', type: 'file'}];
const badges = [{id: 'sel-1', range}, {id: 'sel-2', range}, {id: 'gone', range}];
const projects = [{id: 'p1', name: 'Aux', color: 'blue', icon: 'folder', workspacePath: '/w/aux/'}, {id: 'p2', name: 'Old', archivedAt: 1, workspacePath: '/w/old'},
  {id: 'p3', name: 'Docs', color: 'green', icon: 'book', workspacePath: '/w/docs'}];
// The side panel: every kind of tab, and subagents running, finished and failed.
const subagentItems = [
  {sessionId: 'a1', description: 'Search the web', isRunning: true, color: 'blue', model: 'm1',
    preview: {createdAt: '2026-10-01T00:00:00Z', latestRun: {startedAt: '2026-10-01T00:01:00Z'}}},
  {sessionId: 'a2', description: 'Summarize', isRunning: false, status: 'done', color: 'green', model: 'm2'},
  {sessionId: 'a3', description: 'Check links', isRunning: false, status: 'failed', color: 'red', model: 'm3'},
];
const sideTabs = [{id: 't1', kind: 'side-chat', title: 'Side chat', sessionId: 's2'}, {id: 't2', kind: 'file-preview', title: 'a.md', path: 'out/a.md'},
  {id: 't3', kind: 'subagents', title: 'Subagents'}, {id: 't4', kind: 'aux-code', title: 'Aux Code'},
  {id: 't5', kind: 'side-chat', title: 'New', sessionId: null, initialAttachments: [{id: 'x', type: 'tab'}]}];
const sidePanel = (world, side) => ({openSideChat: world.stub('spy:openSideChat'), bindSideChatSession: world.stub('spy:bind'),
  clearSideChatInitialAttachments: world.stub('spy:clearInitial'), showSubagentList: world.stub('spy:showList'), openSubagents: world.stub('spy:openSubagents'),
  toggle: world.stub('spy:toggle'), toggleMaximized: world.stub('spy:toggleMaximized'), setActiveTabId: world.stub('spy:setActiveTab'), closeTab: world.stub('spy:closeTab'),
  setPanelRef: world.stub('setPanelRef'), syncCollapsed: world.stub('spy:syncCollapsed'), previewFilesByPath: new Map([['out/a.md', {kind: 'text'}]]),
  selectedSubagentId: null, isMaximized: false, mode: 'open', tabs: sideTabs, activeTabId: 't3', ...side});
const composerImports = (world, {session = {}, options = {}, settings = {}, mode = 'default', store = fastNotices, pending,
  side = {}, streaming = false, account = {mode: 'cloud', authStatus: 'active'}, bill = billing, notice = limit, disconnected = false, dismissed = false, stream = 'streaming', panel = true} = {}) => ({
  './strip-markdown-DRcmtuJc.js#nr': options => (String(options).includes('billing') ? bill : String(options).includes('projects') ? {data: projects} : {data: account}),
  './provider-Cw0zhujt.js#X': sidePanel(world, side),
  './provider-Cw0zhujt.js#M': subagentItems,
  './provider-Cw0zhujt.js#j': item => item.status === 'failed',
  './permission-approval-D-GTf91U.js#h': attachment => attachment.type === 'selection',
  './permission-approval-D-GTf91U.js#m': text => ({id: `sel-${text.length}`, type: 'selection', text}),
  './use-agent-settings-DiedG0R1.js#o': (level, levels) => (levels.includes(level) ? level : levels[0]),
  './subscription-usage-BB4arJ0Z.js#r': percent => percent >= 80,
  './provider-Cw0zhujt.js#c': disconnected,
  './provider-Cw0zhujt.js#_': stream,
  './provider-Cw0zhujt.js#Z': panel ? {openSubagents: world.stub('spy:openSubagents')} : null,
  './provider-Cw0zhujt.js#N': world.stub('spy:openSession'),
  './utils-BEeo4-cB.js#t': {isDismissed: dismissed, dismiss: world.stub('spy:dismiss'), dismissForever: world.stub('spy:dismissForever')},
  // Minutes until a reset: a prop can set it, as resetsIn renders here with props for its date.
  './date-CxUVm-Dr.js#n.default': at => ({diff: (_, unit) => (unit === 'minute' ? (at?.minutes ?? 3000) : 5e6)}),
  './strip-markdown-DRcmtuJc.js#et': () => 'in 2 days',
  './strip-markdown-DRcmtuJc.js#g': () => true,
  './subagent-icon-B78zcDX8.js#n': list => new Map(list.slice(1).map(({sessionId}) => [sessionId, `color-${sessionId}`])),
  './context-q_vohNW8.js#n': {currentSession: {id: 's1', status: 'interrupted', incognito: false, projectId: 'p1', suspension: {id: 'q1'},
    model: {provider: 'anthropic', modelId: 'opus', thinkingLevel: 'high', fastMode: true}, runtimeConfig: {proactiveMode: false},
    queuedMessages, steeringMessages: [{role: 'user', content: 'Steer', timestamp: 4}], toolState: {todo: {todos}, subagent: {subagents}}, ...session},
  updateModel: world.stub('spy:updateModel'), updateRuntimeConfig: world.stub('spy:updateRuntimeConfig'), updateMode: world.stub('spy:updateMode')},
  './model-select-BvZsM1Kl.js#l': {isOpen: true, isThinkingOpen: true, proactiveMode: false, selectableProviders: providers,
    getModels: id => models.filter(model => model.provider === id), onOpenChange: world.stub('spy:modelOpen'), onThinkingOpenChange: world.stub('spy:thinkingOpen'),
    onChange: world.stub('spy:modelChange'), ...options},
  './model-select-BvZsM1Kl.js#s': levels => levels ?? [],
  './use-agent-settings-DiedG0R1.js#n': {availableModels: models, subscriptionPlan: 'pro', isLoading: false, hasExternalSubscription: false,
    modelProvider: 'anthropic', modelId: 'opus', thinkingLevel: 'medium', fastMode: true, proactiveMode: false, defaultPermissionMode: 'ask',
    modelsByProvider: Object.groupBy(models, model => model.provider), ...settings},
  './use-agent-settings-DiedG0R1.js#a': ({provider, modelId}) => `${provider}/${modelId}`,
  './provider-Cw0zhujt.js#x': (_, select) => select(store),
  '*.safeParse': details => ({data: details}),
  './permission-approval-D-GTf91U.js#b': {mode},
  './permission-approval-D-GTf91U.js#x': {notice, steer: world.stub('spy:steer'), continueConversation: world.stub('spy:continue'), sendMessage: world.stub('spy:send')},
  './permission-approval-D-GTf91U.js#f': {isStreaming: streaming, submitForm: world.stub('spy:submitForm'), stop: world.stub('spy:stop'), canSend: !streaming, uploadQueue: [],
    disabled: false},
  './permission-approval-D-GTf91U.js#p': {hasPreservedDraft: true, getText: () => ' edited ', insertText: world.stub('spy:insertText')},
  './permission-approval-D-GTf91U.js#l': {disabled: false, handleDirectories: world.stub('spy:dirs'), handleFiles: world.stub('spy:files'), attachments: selections,
    addAttachment: world.stub('spy:addAttachment'), updateAttachment: world.stub('spy:updateAttachment')},
  './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
  './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
  // Each mutation is pending only when the scene names it (a stub's text is its path).
  './strip-markdown-DRcmtuJc.js#er': options => ({isPending: Boolean(pending && String(options).includes(pending)), mutate: world.stub('spy:mutate'),
    mutateAsync: world.stub('spy:mutateAsync')}),
  './strip-markdown-DRcmtuJc.js#m': message => (typeof message.content === 'string' ? message.content : ''),
  './strip-markdown-DRcmtuJc.js#f': {canMove: true, isMoveLocked: false, handleMove: world.stub('spy:move')},
  './provider-Cw0zhujt.js#d': false,
  './sortable.esm-CGWaoCcY.js#i': {attributes: {role: 'button'}, listeners: {}, setNodeRef: world.stub('setNodeRef'), setActivatorNodeRef: world.stub('setActivatorNodeRef'),
    transform: {x: 0, y: 4}, transition: 'transform 200ms', isDragging: false},
  './sortable.esm-CGWaoCcY.js#d': {active: {id: 2}, activeNode: null},
  './browser-color-scheme-Df5VSuPV.js#T().createPortal': element => element,
});
// One context answers every context read: the mini popup's anchored layer and the badges' mode,
// queue-edit and side panel values.
const layer = world => ({open: true, optionsSize: {width: 280, maxHeight: 200, height: 168, fitWidth: true}, close: world.stub('spy:close'),
  setTrigger: world.stub('spy:setTrigger'), trigger: world.stub('trigger'), value: 'incognito', onChange: world.stub('spy:modeChange'), isSidepanel: false,
  pending: false, onCancel: world.stub('spy:cancelEdit'), visible: true, showInMenu: true, isAtBottom: false, isReadonly: false,
  scrollToBottom: world.stub('spy:scrollToBottom'), subscribe: world.stub('spy:subscribe'), getSnapshot: () => ({isAtBottom: false})});
const composerScenes = [
  world => ({imports: composerImports(world, {options: {proactiveMode: true}}), context: layer(world)}),
  // One provider, a free plan, an incognito session that is not interrupted, the question slot open, one model selected.
  world => ({imports: composerImports(world, {options: {selectableProviders: providers.slice(1, 2)}, settings: {subscriptionPlan: 'free'},
    session: {status: 'idle', incognito: true, queuedMessages: queuedMessages.slice(0, 3)}, mode: 'ask-user-question', store: {...fastNotices, turnMessagesByKey: {}}}),
  context: {isSidepanel: false, value: undefined, optionsSize: {width: 160, maxHeight: 320}, open: false}, renderProps: {payload: 'thinking', children: 'menu'},
  event: {key: '4', preventDefault: world.stub('spy:preventDefault'), stopPropagation: world.stub('spy:stopPropagation')}}),
  // No providers and no models; a queue held mid-reorder and pending.
  world => ({imports: composerImports(world, {options: {selectableProviders: [], isOpen: false}, settings: {availableModels: [], isLoading: true},
    pending: 'updateQueuedMessage'}), context: {isSidepanel: true, value: 'default'}, state: [null, [3, 1, 2], false]}),
  // A provider pane open, and a queued message being edited.
  world => ({imports: composerImports(world, {settings: {isLoading: true}, mode: 'action-confirmation'}), context: layer(world), state: ['anthropic']}),
  // Handlers get a picked model and a digit key, as the model menu and its shortcuts do.
  world => ({imports: composerImports(world, {options: {proactiveMode: true}}), context: layer(world),
    event: {provider: 'openai', modelId: 'gpt', key: '4', detail: 0, preventDefault: world.stub('spy:preventDefault'), stopPropagation: world.stub('spy:stopPropagation')}}),
  world => ({imports: composerImports(world), context: null, state: [queueItems[0], null, false]}),
  // Notices: a local account with no models, a paused one, an Aux plan near its limit, a missing subscription.
  world => ({imports: composerImports(world, {settings: {availableModels: []}, account: {mode: 'local'}, notice: connect, disconnected: true, stream: 'idle',
    panel: false}),
    context: {isReadonly: true, scrollToBottom: world.stub('spy:scrollToBottom'), getSnapshot: () => ({isAtBottom: true})}, state: ['d2']}),
  world => ({imports: composerImports(world, {settings: {availableModels: []}, account: {mode: 'cloud', authStatus: 'paused'}, notice: signIn, dismissed: true,
    session: {toolState: {todo: {todos: []}, subagent: {subagents: [subagents[1]]}}}}),
    context: {...layer(world), getSnapshot: () => ({isAtBottom: true})}}),
  world => ({imports: composerImports(world, {session: {model: {provider: 'aux', modelId: 'aux-1'}}, notice: connect,
    bill: {data: {...billing.data, credit: {...billing.data.credit, add_on_balance_micros: '5000000'}, subscription: null}, isPending: false}}), context: layer(world)}),
  world => ({imports: composerImports(world, {bill: {isPending: true}}), context: layer(world)}),
  // A selection showing its actions, a selection whose comment is open, the added selections' badges.
  world => ({imports: composerImports(world, {side: {activeTabId: 't1', mode: 'collapsed', isMaximized: true, selectedSubagentId: 'a1'}}), context: layer(world),
    state: [selection, null, badges, 'A comment', {top: 4, left: 8}]}),
  // The side panel on a file preview (its subagent gone), a new side chat, and no tab.
  world => ({imports: composerImports(world, {side: {activeTabId: 't2', selectedSubagentId: 'gone', mode: 'peek'}}), context: layer(world), state: [true, true, '720px']}),
  world => ({imports: composerImports(world, {side: {activeTabId: 't5', selectedSubagentId: 'a2'}}), context: layer(world)}),
  world => ({imports: composerImports(world, {side: {activeTabId: 't4', tabs: sideTabs.slice(3)}}), context: layer(world)}),
  world => ({imports: composerImports(world, {side: {activeTabId: null}}), context: layer(world)}),
  // While the agent works: Stop in place of Send.
  world => ({imports: composerImports(world, {streaming: true}), context: layer(world)}),
  world => ({imports: composerImports(world, {settings: {modelsByProvider: {}, availableModels: [], isLoading: true}}), context: layer(world),
    state: [selection, {id: 'sel-1', range}, badges, undefined, {top: 4, left: 8}],
    event: {key: 'Enter', metaKey: true, nativeEvent: {isComposing: false}, target: {value: 'typed'}, preventDefault: world.stub('spy:preventDefault'),
      stopPropagation: world.stub('spy:stopPropagation')}}),
];
const composerProps = [
  {model: {provider: 'anthropic', modelId: 'opus', thinkingLevel: 'high', fastMode: true}, variant: 'mini-popup', showThinkingLevel: true, item: queueItems[0],
    disabled: false, reorderable: true, editing: true, dragging: false, queue: queueItems, mode: 'default', inactive: false, label: false, showIncognito: true},
  {model: {provider: 'openai', modelId: 'gpt', thinkingLevel: 'low', fastMode: false}, variant: 'main', showThinkingLevel: true, item: queueItems[1],
    disabled: true, reorderable: false, editing: false, dragging: true, queue: [], mode: 'ask-user-question', inactive: true, persistDefaultOnChange: false},
  {model: {provider: 'google', modelId: 'gem', thinkingLevel: 'low', fastMode: false}, variant: 'mini-popup', showThinkingLevel: false, mode: 'approval',
    value: {provider: 'anthropic', modelId: 'haiku', thinkingLevel: 'low'}, proactiveMode: true, children: 'slot'},
  {selectedProvider: 'aux', accountId: 7, usage: limit, reason: connect, todos, subagents, title: 'Running', colorKeysBySessionId: new Map([['a1', 'blue']]),
    color: 'blue', subagent: subagents[0], className: 'probe', minutes: 1420},
  {selectedProvider: 'openai', accountId: 7, usage: {...limit, exhausted: true, plan: 'free'}, reason: signIn, todos: [], subagents: subagents.slice(1),
    title: 'Completed', colorKeysBySessionId: new Map(), color: 'mono', subagent: subagents[1], type: 'file', minutes: 61},
  world => ({range, initialComment: 'Earlier', number: 2, selection, showAskInSidechat: false, project: projects[0], selected: true, variant: 'submenu', size: 'xs',
    value: 'p1', memoryExtractionDisabled: true, finalConfirm: false, onSave: world.stub('spy:onSave'), onSubmit: world.stub('spy:onSubmit'),
    onAddToChat: world.stub('spy:onAddToChat'), onAskInSidechat: world.stub('spy:onAskInSidechat'), onDismiss: world.stub('spy:onDismiss'),
    onBadgeClick: world.stub('spy:onBadgeClick'), onDeselect: world.stub('spy:onDeselect'), defaultDraftState: {draftMode: 'incognito', draftProjectId: 'p3',
      draftModelOverride: {provider: 'openai', modelId: 'gpt', thinkingLevel: 'high'}, draftRuntimeConfig: {proactiveMode: true}}, defaultDraftStateKey: 'k1',
    onDraftStateChange: world.stub('spy:onDraftStateChange'), source: 'newtab', forcedMode: 'incognito', onSessionCreated: world.stub('spy:onSessionCreated')}),
  world => ({tab: sideTabs[0], isActive: true, onSelect: world.stub('spy:onSelect'), onClose: world.stub('spy:onClose'), sessionId: 's2', mainSessionId: 's1',
    tabId: 't1', placeholder: 'Ask', runCommand: world.stub('runCommand'), initialAttachments: [{id: 'x'}], items: subagentItems, empty: 'None yet', title: 'Active',
    item: subagentItems[0], isRunning: true, messageStartTimestamp: 5, startedAt: 9}),
  {tab: sideTabs[3], isActive: false, tabId: 't5', items: [], title: 'Failed', item: subagentItems[2], isRunning: false},
  {tab: sideTabs[1], item: subagentItems[1], items: subagentItems.slice(1)},
  {range, number: 1, selection, project: null, selected: false, variant: 'toolbar', value: 'p2', defaultDraftStateKey: 'k2',
    defaultDraftState: {draftModelOverride: {provider: 'gone', modelId: 'x'}, draftPermissionMode: 'auto'}},
];

test('every Aux-owned route renders, runs its effects and handles events like the one it replaces', async () => {
  await assertParity({blocksByChunk: ROUTES, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 600, scenes: [...routeScenes, ...conversationScenes],
    props: conversationProps, renamed: renamedBindings});
});

// A conversation: user turns (one steering), assistant runs with text, web search, a coder run and a
// subagent, citations, a memory update, compaction, retry, reconnect and error rows, system rows from
// a routine, a memory signal and another agent, thinking, and turns more than an hour apart.
const T = Date.UTC(2026, 9, 30, 9);
const step = (index, name, extra = {}) => ({index, part: {type: 'toolCall', id: `c${index}`, name}, call: {id: `c${index}`, name}, ...extra});
const sources = [{id: 's1', url: 'https://docs.example/a', title: 'Docs A', excerpt: '**Fast** setup'}, {id: 's2', url: 'https://www.blog.example/b', title: null}];
const steps1 = [step(0, 'websearch', {result: {details: {sources}}}), step(1, 'start_coder'), step(2, 'read', {result: {isError: true}})];
const assistant = (timestamp, text, extra = {}) => ({role: 'assistant', timestamp, completedAt: timestamp + 4000, provider: 'anthropic', model: 'opus',
  stopReason: 'stop', content: [{type: 'text', text}, {type: 'text', text: '  '}], ...extra});
const run1 = {type: 'assistant-activity', runId: 'run1', renderKey: 'run1-r', isStreaming: false, isHandoff: false,
  assistantMessages: [assistant(T + 1000, 'See <citation refs="s1,s2">the <quote>docs</quote></citation>.'), assistant(T + 6000, 'Done')],
  items: [{type: 'text', key: 'x1'}, {type: 'steps', key: 'k1', steps: steps1}, {type: 'text', key: 'x2'}]};
const run2 = {type: 'assistant-activity', runId: 'run2', isStreaming: true, assistantMessages: [assistant(T + 5e6 + 100, 'Working', {stopReason: 'error'})],
  items: [{type: 'steps', key: 'k2', steps: [step(3, 'subagent')]}, {type: 'error', key: 'e1'}]};
const window1 = {items: run1.items, start: 0, showActions: true, hasNextStepsRow: false};
const transcript = [
  {key: 'u1', row: {type: 'message', timestamp: T, messageKey: 'm1', turn: {id: 'turn1', startedAt: T, finishedAt: T + 1e4, finalStartedAt: T + 8000, hasBody: true}}},
  {key: 'r1', row: {...run1, turn: {id: 'turn1'}}, agentRunItemWindow: window1},
  {key: 'c1', row: {type: 'compacting', state: 'done', summary: 'Kept the plan', turn: {id: 'turn1'}}},
  {key: 'u2', row: {type: 'message', timestamp: T + 5e6, messageKey: 'm2'}},
  {key: 'r2', row: run2, agentRunItemWindow: {items: run2.items, start: 0, showActions: true}},
  {key: 'n1', row: {type: 'system-message', kind: 'agent_message', metadata: {deliveryMode: 'steer'}, content: 'Steer'}},
  {key: 'u3', row: {type: 'message', isSteer: true, timestamp: T + 5e6 + 500}},
  {key: 'u4', row: {type: 'message', timestamp: T + 9e6}},
  {key: 'th', row: {type: 'thinking'}},
];
const conversationRows = [
  {type: 'compacting', state: 'running'}, {type: 'compacting', state: 'error'}, {type: 'compacting', state: 'done', summary: 'Summary'}, {type: 'compacting', state: 'done', summary: '  '},
  {type: 'session-branch', parentSession: {id: 'p1', title: 'Parent'}}, {type: 'retrying', retry: {attempt: 2, maxAttempts: 5}},
  {type: 'reconnecting', reconnect: {phase: 'failed', error: 'Socket closed'}}, {type: 'reconnecting', reconnect: {phase: 'connecting', error: null}},
  {type: 'error', message: 'Model overloaded'}, {type: 'generated-files', files: [{type: 'created', path: 'out/report.md'}]},
  {type: 'generated-files', files: [{type: 'modified', path: 'src/a.ts', addedLines: 3, removedLines: 1}, {type: 'created', path: 'b.md', addedLines: 0, removedLines: 2}]},
  {type: 'system-message', kind: 'routine_trigger', content: 'Daily digest\n\nHere is the news', metadata: {routineId: 'rt 1', routineName: 'Digest'}},
  {type: 'system-message', kind: 'agent_message', content: 'Hi', metadata: {fromSessionId: 'x1', fromTitle: 'Fixer', report: 'yes', text: 'Report text'}},
  {type: 'system-message', kind: 'agent_message', content: 'Plain', metadata: {}},
  {type: 'system-message', kind: 'memory_signal', content: 'Remembered the plan'},
];
const sessionConversationImports = world => ({
  './strip-markdown-DRcmtuJc.js#it': text => String(text).replace(/[^]*/g, ''),
  './strip-markdown-DRcmtuJc.js#t': text => String(text).replace(/[*_`#]/g, ''),
  './strip-markdown-DRcmtuJc.js#zt': result => result.text ?? '',
  './favicon-Dpszfa2o.js#r': url => new URL(url).hostname,
  './utils-Cl9zfMcr.js#c': text => [...String(text).matchAll(/\/(\w+)/g)].map(match => ({start: match.index, end: match.index + match[0].length, name: match[1],
    skillPath: `skills/${match[1]}`})),
  './draft-artifacts-registry-CZ58X0Cu.js#s': text => text,
  './provider-Cw0zhujt.js#nt': message => message.stopReason === 'stop',
  './context-q_vohNW8.js#n': {currentSession: {id: 's1', status: 'running', suspension: null, model: {provider: 'anthropic', modelId: 'opus'}}},
  './context-q_vohNW8.js#r': {currentSession: {id: 's1', parentId: null}},
  './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
  './provider-Cw0zhujt.js#M': subagentItems,
  './provider-Cw0zhujt.js#Z': {...sidePanel(world, {}), openFilePreview: world.stub('spy:openFilePreview')},
  './browser-color-scheme-Df5VSuPV.js#T().createPortal': element => element,
});
// The message list context: what the rows read about the session and the live activity.
const messageList = world => ({isReadonly: false, sessionId: 's1', alwaysVisibleAssistantRunId: 'run1', canChangePlan: true, hideAssistantActions: false,
  onAddCreditsClick: world.stub('spy:addCredits'), onPaymentRequiredClick: world.stub('spy:paymentRequired'), onRetryAssistant: world.stub('spy:retry'),
  pendingToolCallId: 'c3', paymentRequiredPlan: 'pro', runId: 'run1', steps: steps1, active: steps1[0], thinkingHeader: 'Planning',
  retainTurnBody: world.stub('spy:retain'), scrollToBottom: world.stub('spy:scrollToBottom'), getSnapshot: () => ({isAtBottom: false})});
const sessionConversationScenes = [
  world => ({imports: sessionConversationImports(world), context: messageList(world)}),
  world => ({imports: sessionConversationImports(world), context: {...messageList(world), isReadonly: true, active: null, hideAssistantActions: true}, state: [true]}),
  // The turn rail shown (its fourth state) with the first turn hovered, every other state left as the component starts it.
  world => ({imports: sessionConversationImports(world), context: messageList(world), state: [undefined, 0, undefined, true, undefined]}),
];
const conversationRowProps = [
  ...conversationRows.map(row => ({row})),
  {row: run1, itemWindow: window1, state: 'done', alwaysVisible: true, isDone: true, message: assistant(T, 'Run one'), segment: {type: 'run-fold', isActive: true, startedAt: T, workedForMs: 65000, chunks: [], turnId: 'turn1'}},
  {row: run2, itemWindow: {items: run2.items, start: 0}, state: 'streaming', isDone: false, message: assistant(T, 'Run two'), segment: {type: 'run-fold', isActive: false, startedAt: T, finalStartedAt: T + 3000,
    workedForMs: 4000, chunks: [{type: 'fold', key: 'f', rows: transcript.slice(1, 2)}]}},
  {text: 'Use /deploy on @Docs\nline two', tabAttachments: [{name: 'Docs', id: 't1', url: 'https://docs.example', faviconUrl: 'f.png'}], collapsedLines: 1,
    refs: 's1, s2', sourcesById: new Map(sources.map(source => [source.id, source])), messageId: 'm1', children: '**cited** text', sources,
    images: [{mimeType: 'image/png', data: 'AA'}], files: [{type: 'created', path: 'a.md'}], parentSession: {id: 'p1', title: 'Parent'}, attempt: 1, maxAttempts: 3,
    phase: 'failed', message: assistant(T, 'Copy me'), timestamp: T - 864e5 * 3, routine: {id: 'r1', name: 'Digest'}, steps: steps1, isLastItem: true, status: 'running',
    href: 'https://x.example/files/content?path=out/a.md', items: ['First', 'Second', 'Third', 'Fourth', 'Fifth'].map((label, index) => ({key: `turn${index}`,
      label, response: index % 2 ? `Answer ${index}` : undefined})), isDone: true, memoryExtraction: {summary: 'Saved the plan',
      files: [{path: 'mem/a.md', addedLines: 2, removedLines: 1}, {path: 'b.md', addedLines: 0, removedLines: 3}]}, activity: {active: steps1[0],
      steps: steps1, thinkingHeader: 'Thinking'}},
];

// The composer under its data fixtures, so the model menu, the queue and the badges render with data.
test('the composer renders like the supplied one with models and a queue', async () => {
  await assertParity({blocksByChunk: {[COMPOSER]: ROUTES[COMPOSER]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 600,
    scenes: composerScenes, props: composerProps, renamed: renamedBindings, defaults: false});
});

test('the composer draws a conversation like the supplied one', async () => {
  await assertParity({blocksByChunk: {[COMPOSER]: ROUTES[COMPOSER]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 600,
    scenes: sessionConversationScenes, props: conversationRowProps, renamed: renamedBindings, defaults: false});
});

// The conversation's pure helpers, called with real rows and messages on both sides.
test('the conversation helpers group, fold, cite and label like the supplied ones', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  world.enter({imports: sessionConversationImports(world)});
  // Maps come back from the other realm, so they are listed rather than compared by identity.
  const json = value => JSON.stringify(value, (_, item) => (Object.prototype.toString.call(item) === '[object Map]' ? [...item] : item));
  const same = (name, ...args) => assert.equal(json(ours[name](...args)), json(supplied[name](...args)), `${name}(${json(args).slice(0, 80)})`);
  for (const message of [{content: 'Hi \uE200x\uE201'}, {content: [{type: 'text', text: 'a'}, {type: 'image'}, {type: 'text', text: '  '}]}])
    same('__pair_messageTextBlocks', message);
  same('__pair_mentionSegments', 'Use /deploy on @Docs and @Docs Old, @Docs', [{name: 'Docs', id: 't1'}, {name: 'Docs Old', id: 't2'}, {name: 'Docs', id: 't3'}]);
  same('__pair_mentionSegments', 'plain', []);
  for (const result of [{details: {sources: [...sources, {id: 2}]}}, {toolName: 'websearch', text: JSON.stringify({results: [{source_id: 'w1', url: 'https://w',
    title: 'W', publish_date: '2026-01-01', excerpts: ['e']}, {url: 'bad'}]})}, {toolName: 'websearch', text: '{'}, {toolName: 'other'}])
    same('__pair_toolSources', result);
  for (const refs of ['s1, s2,,s1', '', 5]) same('__pair_splitRefs', refs);
  const byId = new Map(sources.map(source => [source.id, source]));
  same('__pair_citationsAsLinks', 'See <citation refs="s1,s2">the <quote>docs</quote></citation> and <citation refs="zz">x</citation><quote>q</quote>', byId);
  same('__pair_citationsAsLinks', 'no citations', byId);
  same('__kept_Jn', [{details: {sources: [{id: 's1', url: 'u'}, {id: 's2#3', url: 'v'}]}}, {toolName: 'websearch', text: '{}'}], [{id: 'p', url: 'w'}]);
  for (const message of [{role: 'user', content: ' hi '}, {role: 'user', content: [{type: 'text', text: ' a '}, {type: 'text', text: ''}, {type: 'text', text: 'b'}]},
    assistant(T, 'See <citation refs="s1">it</citation>'), {role: 'system'}]) same('__pair_copyText', message, byId);
  for (const url of ['https://www.docs.example/a', 'https://x.example']) same('__pair_sourceHost', url);
  same('__pair_turnGroups', transcript);
  // Rows without turn ids: a system row then a message open one turn; a reply ends its prefix.
  same('__pair_turnGroups', [{key: 'n', row: conversationRows[11]}, {key: 'm', row: {type: 'message', timestamp: T}}, {key: 'm2', row: {type: 'message', timestamp: T}},
    {key: 'r', row: run1}, {key: 'n2', row: conversationRows[12]}]);
  same('__pair_foldRuns', transcript);
  same('__pair_splitCoderRuns', transcript[1]);
  same('__pair_splitTail', transcript[1]);
  same('__pair_splitTail', transcript[0]);
  same('__pair_workedForMs', transcript);
  same('__pair_workedForMs', []);
  same('__kept_t0', supplied.__pair_turnGroups(transcript).map(group => group.rows));
  for (const options of [{}, {isTrailingTurnStreaming: true, pendingToolCallId: 'c3'}, {pendingToolCallId: 'c1'}]) same('__kept_h0', transcript, options);
  same('__kept_h0', transcript.slice(3), {isTrailingTurnStreaming: true});
  for (const at of [T, T - 864e5, T - 864e5 * 3, T - 864e5 * 7, T - 864e5 * 8, T - 864e5 * 40, T - 864e5 * 400]) same('__kept_So', at, T + 3600e3);
  for (const href of ['https://x.example/files/content?path=out/a.md', 'https://x.example/files/content?path=', 'https://x.example/a', undefined])
    same('__pair_artifactName', href);
});

test('the routes replace their blocks once and refuse a second pass', () => {
  for (const [chunk, blocks] of Object.entries(ROUTES)) {
    const after = integrateRoutes(chunk, textOf(chunk));
    for (const {file} of blocks) assert.equal(after.split(readRoute(file)).length - 1, 1, file);
    assert.throws(() => integrateRoutes(chunk, after), /drift/);
  }
});

test('the module-scope names the Aux routes bind are free in the rest of their chunks', () => {
  assertFreeNames({blocksByChunk: ROUTES, textOf, read: readRoute});
});

test('the token changes use compiled, theme-following classes', () => {
  const css = integrateStyles(readFileSync(`${candidate}/Contents/Resources/aux/apps/extension/dist/${GLOBALS_CSS}`, 'utf8'));
  for (const [file, from, to] of TOKEN_CHANGES) {
    for (const name of to.split(' ')) {
      // A class as compiled CSS escapes it: every character but letters, digits, - and _.
      const selector = name.replace(/[^\w-]/g, '\\$&');
      const pattern = selector.replace(/[\\[\]().*+?^${}|]/g, '\\$&');
      assert.ok(new RegExp(`\\.${pattern}\\s*[{,[:]`).test(css), `${file}: .${name} is not compiled`);
    }
    // A change that adds a class keeps the supplied one; any other leaves none of it.
    assert.ok(readRoute(file).includes(to) && (to.includes(from) || !readRoute(file).includes(from)), file);
  }
});

// The chat view's pure helpers, called with real inputs on both sides.
test('the chat view helpers parse, extract and measure like the supplied ones', async () => {
  const chunk = 'assets/conversation-D9Q3VEsl.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  // Each side runs in its own VM realm, so results are compared as JSON.
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[`__pair_${name}`](...args)), JSON.stringify(supplied[`__pair_${name}`](...args)),
    `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const id = '0f6c6d42-3a3c-4f7e-8b1e-5d2c9a7e1b11';
  for (const path of [`./attachments/channel/${id}/${id}/${id}/a.png`, `attachments/channel/${id}/${id}/${id}/..`, './attachments/x', ''])
    same('parseChannelAttachmentPath', path);
  for (const url of ['aux:task/t1/files/tmp/a.txt', 'aux:task/t1/files/output/r%20e.pdf', 'aux:task/t1/files/etc/passwd', 'aux:task/t1/files/tmp/../x', 'aux:task/t1/files/%E0'])
    same('parseTaskFileUrl', url);
  for (const link of ['aux:task/abc', '#aux-task/x.y-1', 'aux:task/', 'https://x', undefined]) same('taskIdFromLink', link);
  for (const text of ['see https://a.com/x), and https://b.org/y.', '`https://code.com` https://u:p@c.com https://ok.dev', 'https://1.io https://2.io https://3.io https://4.io https://5.io', 'none'])
    same('extractLinks', text);
  const pixels = Uint8ClampedArray.from({length: 32 * 32 * 4}, (_, index) => (index % 4 === 3 ? 255 : (index * 37) % 256));
  same('averageColor', pixels);
  same('averageColor', new Uint8ClampedArray(16));
  for (const message of [{content: 'plain'}, {content: [{type: 'text', text: 'a'}, {type: 'image'}, {type: 'text', text: 'b'}]}]) same('messageText', message);
  for (const status of ['running', 'idle', 'bogus']) assert.equal(ours.__pair_taskStatus(status).label, supplied.__pair_taskStatus(status).label);
});

// The command bar's result builders and sections, called with real inputs on both sides.
test('the command bar builds and filters results like the supplied one', async () => {
  const chunk = 'assets/tabsearch-3k_2hgil.js';
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[`__pair_${name}`](...args)), JSON.stringify(supplied[`__pair_${name}`](...args)),
    `${name}(${JSON.stringify(args).slice(0, 80)})`);
  for (const args of [['  Title '], ['', 'https://x'], [undefined]]) same('titleOr', ...args);
  for (const url of ['https://a.b/', 'chrome://settings', 'chrome-extension://x/p.html', '', undefined]) { same('isWebUrl', url); }
  same('withoutScheme', 'https://example.com/');
  const item = {title: 'Docs', subtitle: 'Aux', url: 'https://aux.dev', searchText: 'help'};
  for (const query of ['DOC', 'aux.dev', 'help', 'zzz']) same('itemMatches', item, query);
  for (const tab of [{id: 3, url: 'https://a.com', title: 'A', favIconUrl: 'f.png'}, {id: 4, pendingUrl: 'chrome://x'}, {url: 'https://b.com'}]) same('tabItem', tab);
  same('recentlyClosedItem', {tab: {url: 'https://c.com', title: 'C', sessionId: 's'}, lastModified: 1}, 2);
  same('recentlyClosedItem', {window: {sessionId: 'w', tabs: [{url: 'chrome://x'}, {url: 'https://d.com'}]}, lastModified: 1}, 0);
  same('largestIcon', [{size: 16, url: 's'}, {size: 128, url: 'l'}, {size: 48, url: 'm'}]);
  same('largestIcon', []);
  for (const event of [{key: 'A', shiftKey: true, metaKey: true}, {key: 'a', shiftKey: false, ctrlKey: true}]) same('isCloseShortcut', event);
  const tabs = ['Alpha', 'Beta', 'Gamma'].map((title, index) => ({id: `tab:${index}`, title, url: `https://${title.toLowerCase()}.com`}));
  const sources = {openTabs: tabs, recentlyClosed: [...tabs, tabs[0]], recentChats: [{id: 'c', title: 'Chat'}], chatSearch: [{id: 's', title: 'Found'}],
    extensions: [{id: 'e', title: 'Alpha tools'}], bookmarks: [{id: 'b', title: 'Mark'}], history: [{id: 'h', title: 'Past'}]};
  for (const query of ['', 'alpha', '  ']) {
    same('browserSections', sources, query);
    same('flattenSections', supplied.__pair_browserSections(sources, query));
  }
});

// The composer's attachment and preview helpers, called with real inputs on both sides.
test('the composer attachment and preview helpers match the supplied ones', async () => {
  const chunk = 'assets/session-composer-Dc0LRfZA.js';
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[`__pair_${name}`](...args)), JSON.stringify(supplied[`__pair_${name}`](...args)),
    `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const attachments = [
    {type: 'tab', url: 'https://docs.example/a'}, {type: 'tab', url: 'not a url'},
    {type: 'selection', sourceKind: 'chat'}, {type: 'selection', selectionKind: 'region'}, {type: 'selection'},
    {type: 'directory', path: '/w/aux'}, {type: 'file', name: 'notes.md', mimeType: 'text/markdown'},
    {type: 'file', name: 'blob', mimeType: 'image/png'}, {type: 'file', name: 'x', mimeType: ''},
    {type: 'file', name: 'p', path: 'p.txt', mimeType: 'text/plain', pastedText: {characterCount: 12345}},
  ];
  for (const attachment of attachments) same('attachmentDetail', attachment);
  for (const attachment of [{type: 'selection', previewImage: 'data:x'}, {type: 'file', mimeType: 'image/png', data: 'AA'}, {type: 'file', mimeType: 'text/plain'}])
    same('imagePreviewUrl', attachment, undefined);
  for (const path of ['/w/aux/', 'single', '']) same('folderName', path);
  for (const metadata of [{kind: 'binary'}, {kind: 'directory'}, {kind: 'text'}, undefined]) same('openModeFor', metadata);
  same('parseDelimited', 'a,b\n"1,""2""",3\r\n,\n', ',');
  same('parseDelimited', 'x\ty', '\t');
  const wide = Array.from({length: 120}, (_, row) => Array.from({length: 14}, (__, column) => `${row}.${column}`).join(',')).join('\n');
  for (const [metadata, text] of [[{extension: '.csv', mimeType: 'text/csv'}, wide], [{extension: '.tsv', mimeType: 'text/tab-separated-values'}, 'a\tb\n1\t2'],
    [{extension: '.csv', mimeType: 'text/csv'}, '\n \n'], [{extension: '.md', mimeType: 'text/plain'}, '# hi'], [{mimeType: 'text/markdown'}, 'x'],
    [{extension: '.js', mimeType: 'text/javascript'}, 'let a'], [{extension: '.txt', mimeType: 'text/plain'}, 'plain']])
    same('textPreviewFor', metadata, text);
  for (const message of [{content: 'plain'}, {content: [{type: 'text', text: 'a'}, {type: 'image'}, {type: 'text', text: 'b'}]}]) same('messagePlainText', message);
  const turn = (id, ordinal, key) => ({id, ordinal, input: [{key}]});
  const overview = {turns: [turn('t3', 3, 'k3')], transcriptRevision: 'r', nextCursor: 'c'};
  for (const cached of [undefined, {pages: [{turns: [turn('t1', 1, 'k1'), turn('t2', 2, 'k2')]}], pageParams: [null]}])
    for (const key of ['k2', 'missing']) same('pagesAfterEdit', cached, overview, key);
  const screen = {availLeft: 0, availTop: 25, availWidth: 1440, availHeight: 875};
  for (const [screenX, screenY, left] of [[100, 300, 20], [1300, 40, 0], [10, 900, 300], [100, 219, 20], [1390, 50, 20]])
    same('popupPosition', {anchor: {left, top: 10, width: 30, height: 24}, screen, screenX, screenY, size: {width: 280, height: 200}});
  assert.equal(String(ours.__pair_optionsPageUrl('chrome-extension://x/minipopup.html?a=1')), String(supplied.__pair_optionsPageUrl('chrome-extension://x/minipopup.html?a=1')));
  same('fastModeDetails', {diagnostics: []});
  same('fastModeDetails', {});
});

// The transcript row model, called with a real session snapshot on both sides: a question, a run
// with thinking, web search and a bash session continued by bash_interact, a steer that landed
// mid-run, a routine row and a hidden system row, compaction, an interrupt, a branch, an error.
test('the transcript row model builds, keeps and groups rows like the supplied one', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  world.enter({imports: {...sessionConversationImports(world),
    './strip-markdown-DRcmtuJc.js#It': message => /interrupt/i.test(message),
    './strip-markdown-DRcmtuJc.js#Ft': message => !message.metadata?.hidden,
    './strip-markdown-DRcmtuJc.js#Pt': message => !(message.role === 'user' && message.content === ''),
    './strip-markdown-DRcmtuJc.js#Lt': part => part.type !== 'image',
    './strip-markdown-DRcmtuJc.js#Mt': message => /disk is full/.test(message),
    './strip-markdown-DRcmtuJc.js#zt': result => result.content?.map(part => part.text).join('') ?? result.text ?? ''}});
  const json = value => JSON.stringify(value, (_, item) => (Object.prototype.toString.call(item) === '[object Map]' ? [...item]
    : Object.prototype.toString.call(item) === '[object Set]' ? [...item] : item));
  const same = (name, ...args) => assert.equal(json(ours[name](...args)), json(supplied[name](...args)), `${name}(${json(args).slice(0, 80)})`);
  const text = value => [{type: 'text', text: value}];
  const messagesByKey = {
    k0: {role: 'user-message-metadata', attachments: [{type: 'tab', url: 'https://a.example'}]},
    k1: {role: 'user', content: 'Find the docs', timestamp: 1000},
    k2: {role: 'assistant', timestamp: 1100, stopReason: 'toolUse', responseId: 'resp1', content: [{type: 'thinking', thinking: 'plan it'},
      {type: 'thinking', thinking: '  '}, {type: 'text', text: 'Looking <system-message>hidden</system-message>'}, {type: 'image'},
      {type: 'toolCall', id: 'tc1', name: 'websearch', arguments: {}}, {type: 'toolCall', id: 'tc2', name: 'bash', arguments: {}}]},
    k3: {role: 'toolResult', toolCallId: 'tc1', timestamp: 1200, content: text('found'), details: {sources: [{id: 's1', url: 'https://a.example'}]}},
    k3b: {role: 'toolResult', toolCallId: 'tc2', timestamp: 1210, content: text('out 1'), details: {execSessionId: 7}},
    k4: {role: 'steering', id: 'st1', timestamp: 1250, after: {timestamp: 1100, contentIndex: 2}},
    k15: {role: 'user', content: 'steer', timestamp: 1260, metadata: {steer: true, steeringMessageId: 'st1'}},
    k5: {role: 'assistant', timestamp: 1300, stopReason: 'toolUse', content: [{type: 'toolCall', id: 'tc3', name: 'bash_interact', arguments: {exec_session_id: 7}}]},
    k5r: {role: 'toolResult', toolCallId: 'tc3', timestamp: 1310, content: text('out 2'), isError: false},
    k6: {role: 'assistant', timestamp: 1400, stopReason: 'stop', content: text('Done')},
    k7: {role: 'system-message', kind: 'routine_trigger', content: 'Daily run', metadata: {routineId: 'r1'}},
    k8: {role: 'system-message', kind: 'internal', content: 'hidden'},
    k9: {role: 'compaction', summary: 'Kept the plan', timestamp: 1500},
    k10: {role: 'user', content: 'Stop', timestamp: 1600, metadata: {interruptSteer: true}},
    k11: {role: 'assistant', stopReason: 'aborted', content: [], errorMessage: 'Interrupted by user', timestamp: 1650},
    k12: {role: 'session-branch', parentSession: {id: 'p1', title: 'Parent'}, timestamp: 1660},
    k13: {role: 'assistant', stopReason: 'error', errorMessage: 'Overloaded', content: text('partial'), timestamp: 1700},
    k14: {role: 'turn-lifecycle', timestamp: 1710},
    k16: {role: 'toolResult', toolCallId: 'tc9', timestamp: 1720, isError: true, content: text('database or disk is full')},
    k17: {role: 'assistant', stopReason: 'toolUse', timestamp: 1730, content: [{type: 'toolCall', id: 'tc9', name: 'write', arguments: {}}]},
    // An interrupted run the user then redirected, an aborted run followed by an ordinary message,
    // a steer whose steering message is gone, a steer anchored at the run's first part, and a
    // message with no text.
    k18: {role: 'assistant', stopReason: 'aborted', errorMessage: 'Interrupted', content: text('half'), timestamp: 1740},
    k19: {role: 'user', content: 'Redo it', timestamp: 1750, metadata: {interruptSteer: true}},
    k20: {role: 'assistant', stopReason: 'aborted', errorMessage: 'Interrupted', content: text('half again'), timestamp: 1760},
    k21: {role: 'user', content: 'Next', timestamp: 1770},
    k22: {role: 'user', content: 'orphan steer', timestamp: 1780, metadata: {steer: true, steeringMessageId: 'gone'}},
    k23: {role: 'steering', id: 'st2', timestamp: 1255, after: {timestamp: 1100, contentIndex: 0}},
    k24: {role: 'user', content: [{type: 'image'}], timestamp: 1900},
    k25: {role: 'assistant', stopReason: 'stop', content: text('ok'), timestamp: 1910},
  };
  const messageOrder = ['k0', 'k1', 'k2', 'k3', 'k3b', 'k4', 'k15', 'k5', 'k5r', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13', 'k14', 'k16', 'k17', 'k23', 'k18', 'k19', 'k20', 'k21',
    'k22', 'k24', 'k25'];
  const snapshot = {messagesByKey};
  for (const messageStartTimestamp of [undefined, 1250]) {
    same('__pair_visibleMessages', {messageOrder, messageStartTimestamp, snapshot});
    same('__pair_persistedRows', {messageOrder, messageStartTimestamp, snapshot});
  }
  const persisted = supplied.__pair_persistedRows({messageOrder, snapshot});
  const streaming = {role: 'assistant', timestamp: 1800, content: [{type: 'text', text: 'Live'}, {type: 'toolCall', id: 'tc10', name: 'read', arguments: {}}]};
  const live = {autoCompactionStatus: 'idle', autoRetry: {phase: 'idle'}, error: null, streamingMessage: streaming, persistedRowsState: persisted,
    reconnect: {phase: 'idle'}, status: 'streaming'};
  const variants = [{}, {status: 'idle', streamingMessage: undefined}, {autoCompactionStatus: 'running'}, {autoRetry: {phase: 'waiting', attempt: 2, maxAttempts: 5}},
    {reconnect: {phase: 'connecting', noticeDue: true, error: null}}, {reconnect: {phase: 'connecting', noticeDue: false}}, {status: 'error', error: 'Boom'},
    {status: 'error', error: 'Boom', reconnect: {phase: 'connecting', noticeDue: false}}];
  for (const variant of variants) same('__pair_liveRows', {...live, ...variant});
  const rows = supplied.__pair_liveRows(live);
  const idleRows = supplied.__pair_liveRows({...live, status: 'idle', streamingMessage: undefined});
  same('__pair_joinBashInteract', rows);
  for (const [a, b] of rows.flatMap(row => idleRows.map(other => [row, other]))) same('__pair_sameRow', a, b);
  same('__pair_keepRows', rows, idleRows);
  same('__pair_keepRows', idleRows, rows);
  // A row near the end that changed is redrawn; one further back keeps its identity.
  for (const back of [1, 3, 5, 7, 9]) {
    const at = idleRows.length - back;
    const changed = idleRows.map((row, index) => (index === at && row.type !== 'assistant-activity' ? {...row, metadataKey: 'changed', summary: 'changed'} : row));
    same('__pair_keepRows', idleRows, changed);
  }
  // A run whose cited sources shrank keeps its new sources.
  const cited = sourceList => idleRows.map(row => (row.type === 'assistant-activity'
    ? {...row, metadata: {citationSourcesById: new Map(sourceList.map(source => [source.id, source]))}} : row));
  same('__pair_keepRows', cited(sources), cited(sources.slice(0, 1)));
  same('__pair_keepRows', cited(sources), cited(sources));
  // While a run waits on a question the user has not been asked, the rows are not held.
  const asking = supplied.__pair_liveRows({...live, streamingMessage: {...streaming, content: [{type: 'toolCall', id: 'q1', name: 'ask_user_question', arguments: {}}]}});
  for (const suspension of ['tc10', 'q1'])
    same('__pair_nextRows', {activeSuspensionToolCallId: suspension, previousRows: asking, nextRows: asking.filter(row => row.type !== 'assistant-activity'),
      lastVisibleConversationMessageKey: 'k6', reconnect: {phase: 'idle'}, status: 'streaming'});
  same('__kept_rn', rows);
  for (const next of [idleRows, rows]) for (const [status, phase] of [['streaming', 'idle'], ['error', 'idle'], ['streaming', 'connecting']])
    same('__pair_nextRows', {activeSuspensionToolCallId: 'tc10', previousRows: rows, nextRows: next, lastVisibleConversationMessageKey: 'k6', reconnect: {phase}, status});
  const runs = [{finishedAt: 1, jsonlReadOffset: 0, jsonlReadSize: 100, filesChanged: [{path: 'a.md', type: 'created'}], memoryExtraction: {summary: 'Saved'}},
    {finishedAt: null, filesChanged: [], jsonlReadOffset: 0, jsonlReadSize: 0}];
  same('__pair_withRunFiles', rows, runs, messageOrder.map((key, index) => ({id: String(index), key})));
  same('__pair_withRunFiles', rows, [], []);
  const turned = rows.map(row => (row.type === 'assistant-activity' ? {...row, turn: {id: 'turn1', ordinal: 1, finishedAt: 2, finalMessage: [messagesByKey.k6]}} : row));
  same('__pair_withTurnResults', turned, [{createdRoutine: {id: 'rt1', turnId: 'turn1'}}, {createdRoutine: null}], [{id: 1, filesChanged: [{path: 'b.md'}]}]);
  const getMessage = key => messagesByKey[key];
  for (const options of [{getMessage, isStreaming: true, pendingToolCallId: 'tc10'}, {getMessage, hideUserInterruptedAbortMessage: true}])
    same('__pair_chatTurns', rows, options);
  for (const key of ['k11', 'k13', 'k6']) {
    same('__kept_nn', messagesByKey[key]);
    same('__pair_isInterruptAborted', messagesByKey[key]);
  }
  same('__pair_turnIdFor', {messageKey: 'k1'}, [{id: 'turn1', messageKey: 'k1'}]);
  same('__pair_isStorageErrorRun', {type: 'assistant-activity', runId: 'x', items: [{type: 'error', errorMessage: 'database or disk is full'}]}, 'y');
});

// The message list's layout, windowing, scroll-following and run-activity helpers, with real inputs.
test('the message list measures, windows, follows and reads activity like the supplied one', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  world.enter({imports: {'./strip-markdown-DRcmtuJc.js#Mt': message => /disk is full/.test(message)}});
  const json = value => JSON.stringify(value, (_, item) => (Object.prototype.toString.call(item) === '[object Map]' ? [...item] : item));
  const same = (name, ...args) => assert.equal(json(ours[name](...args)), json(supplied[name](...args)), `${name}(${json(args).slice(0, 80)})`);
  for (const heights of [[], [100], [50, 700, 200, 90], [300, 100, 200], [50, 60], [900, 1000, 950]]) same('__pair_medianHeight', heights);
  const measured = new Map([['a', 140], ['c', 0], ['e', 900]]);
  const entries = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((key, index) => ({key, estimatedHeightPx: index % 3 ? 60 + index * 10 : undefined}));
  for (const entry of entries) for (const options of [{rollingMedianPx: 110}, undefined]) same('__pair_rowHeight', entry, measured, options);
  for (const options of [undefined, {gapPx: 8, rollingMedianPx: 100}]) same('__pair_measureLayout', entries, measured, options);
  const layout = supplied.__pair_measureLayout(entries, measured, {gapPx: 8, rollingMedianPx: 100});
  const shifted = supplied.__pair_measureLayout(entries.slice(1), new Map([...measured, ['d', 400]]), {gapPx: 8});
  for (const [distance, viewport] of [[0, 300], [450, 200], [2000, 500], [-5, 0], [450, 0], [700, 10]]) {
    same('__pair_visibleRange', layout, distance, viewport);
    same('__pair_viewportAnchor', layout, distance, viewport, ['c', 'd', 'e']);
    same('__pair_viewportAnchor', layout, distance, viewport, ['zz']);
  }
  same('__pair_visibleRange', layout, 100, 200, {keysChanged: true, previousRange: {startIndex: 0, endIndex: 6, firstKey: 'b'}});
  same('__pair_visibleRange', supplied.__pair_measureLayout([], measured), 0, 100);
  for (const key of ['d', 'a', 'zz']) same('__pair_bottomShift', layout, shifted, key);
  for (const distance of [-3, 0, 24, 25]) same('__pair_bottomState', distance);
  for (const event of [{deltaMode: 0, deltaY: 3}, {deltaMode: 1, deltaY: 3}, {deltaMode: 2, deltaY: -1}]) same('__pair_wheelPixels', event);
  const element = {scrollTop: -120, scrollHeight: 2000, clientHeight: 600};
  for (const mode of ['__pair_TOP_DOWN_SCROLL', '__kept_as'])
    assert.equal(ours[mode].readDistanceFromBottom({...element}), supplied[mode].readDistanceFromBottom({...element}), mode);
  const states = [{type: 'attached'}, {type: 'detached'}, {type: 'settling', completion: 'attached', targetDistancePx: 0}];
  const actions = [{type: 'open-at-bottom'}, {type: 'user-input'}, {type: 'user-distance', distanceFromBottomPx: 30}, {type: 'user-distance', distanceFromBottomPx: 4, isStreaming: true},
    {type: 'user-distance', distanceFromBottomPx: 4}, {type: 'bottom-button', behavior: 'smooth', isStreaming: true}, {type: 'bottom-button', behavior: 'instant'},
    {type: 'scroll-to-key', targetDistancePx: 120}, {type: 'scroll-to-key', targetDistancePx: 5, behavior: 'smooth'}, {type: 'settling-complete'},
    {type: 'streaming-started'}, {type: 'streaming-ended'}, {type: 'other'}];
  for (const state of states) for (const action of actions) same('__pair_followReducer', state, action);
  const thinking = (text, extra) => ({part: {type: 'thinking', thinking: text}, ...extra});
  const run = {type: 'assistant-activity', runId: 'r1', assistantMessages: [{stopReason: 'aborted'}], items: [
    {type: 'steps', status: 'done', steps: [thinking('**Planning** the work\n**Reading files**'), step(1, 'read')]},
    {type: 'steps', status: 'streaming', steps: [step(2, 'subagent', {part: {type: 'toolCall', id: 'c2', name: 'subagent', arguments: {action: 'spawn'}}})]},
    {type: 'error', errorMessage: 'database or disk is full'}, {type: 'error', errorMessage: 'Other'}, {type: 'content', part: {type: 'text', text: 'hi'}}]};
  same('__pair_mergeStepGroups', run.items);
  const spawn = index => ({step: step(index, 'subagent', {part: {type: 'toolCall', id: `c${index}`, name: 'subagent', arguments: {action: 'spawn'}}}), props: {}});
  same('__kept_Ja', [spawn(1), spawn(2)], () => true);
  for (const options of [{row: run}, {row: run, hideUserInterruptedAbortMessage: true}, {row: run, hideUserInterruptedAbortMessage: true, paymentRequiredRunId: 'r1'}])
    same('__kept_hh', options);
  for (const message of [{role: 'assistant', stopReason: 'stop'}, {role: 'assistant', stopReason: ' Error '}, {role: 'user', stopReason: 'stop'}, {role: 'assistant'}]) {
    same('__pair_stopStatus', message);
    same('__kept_gh', message);
  }
  for (const row of [run, {type: 'message', key: 'm1'}, {...run, renderKey: 'rk'}]) same('__kept_$e', row);
  same('__kept_xh', run);
  same('__kept_xh', {...run, items: run.items.slice(0, 1)});
  for (const text of ['**One**\nthen **Two** ', 'no header', '**A**']) same('__pair_thinkingHeaderOf', text);
  for (const rows of [[{type: 'message'}, run], [run, {type: 'message'}], [{...run, items: [{type: 'steps', steps: [thinking('plain')]}]}], []])
    same('__pair_currentThinkingHeader', rows);
});

// The chat commands: feedback, new, clear (confirmed, then failing) and compact (failing).
test('the chat commands run like the supplied ones', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  // Each command fails once with an Error and once with something else, for both messages.
  const run = async (side, plain) => {
    const calls = [];
    const record = name => (...args) => (calls.push([name, ...args.filter(arg => typeof arg !== 'function')]), name === 'loading' ? 'toast-1' : undefined);
    world.enter({imports: {'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './context-q_vohNW8.js#n': {navigate: record('navigate')},
      './strip-markdown-DRcmtuJc.js#N': {broadcast: record('broadcast')}, './provider-Cw0zhujt.js#l': {setMessages: record('setMessages')},
      './strip-markdown-DRcmtuJc.js#M': {confirm: (options, then) => (calls.push(['confirm', options]), then())},
      // The toast is an object whose methods are called, so each method's path is set.
      './dist-LyKrHgST.js#n.loading': record('loading'), './dist-LyKrHgST.js#n.error': record('error'), './dist-LyKrHgST.js#n.success': record('success'),
      './strip-markdown-DRcmtuJc.js#er': options => ({mutateAsync: async input => { calls.push(['mutate', String(options), input]); throw String(options).includes(plain) ? 'not an Error' : new Error('boom'); }})}});
    const command = side.__kept_Ga({sessionId: 's1'});
    for (const [name, detail] of [['feedback', 'Nice'], ['new'], ['clear'], ['compact', 'Keep the plan'], ['other']]) calls.push([name, command(name, detail)]);
    await new Promise(resolve => setTimeout(resolve, 0));
    return JSON.stringify(calls);
  };
  for (const plain of ['clearMessages', 'compact']) assert.equal(await run(ours, plain), await run(supplied, plain), plain);
});

// The scroll controller, driven through a session: open at the bottom, stream, the user scrolls up by
// wheel, touch and keys, then jumps back; its follow mode, location, debug trail and scroll writes match.
test('the message list scroll controller follows and lets go like the supplied one', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const drive = (side, geometry) => {
    const trail = [];
    let streaming = false;
    const element = {scrollTop: 0, scrollHeight: 2000, clientHeight: 600, listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; }, removeEventListener(type) { delete this.listeners[type]; },
      getBoundingClientRect: () => ({top: 0, bottom: 600, height: 600}), querySelector: () => null};
    const controller = new side.__pair_ScrollController({isStreaming: () => streaming, onLocationChange: location => trail.push(['location', location]),
      prefersReducedMotion: () => true, geometry: geometry === 'bottom-up' ? side.__kept_as : undefined});
    const steps = [
      () => controller.attach(element), () => controller.openAtBottom(), () => { streaming = true; controller.notifyStreamingStarted(); },
      () => { element.scrollHeight += 300; controller.commitAttachedFollow(); }, () => controller.queueLayoutReplacement(),
      () => element.listeners.wheel?.({deltaMode: 0, deltaY: -240}), () => { element.scrollTop = Math.max(0, element.scrollTop - 240); element.listeners.scroll?.(); },
      () => element.listeners.touchstart?.({touches: [{clientY: 300}]}), () => element.listeners.touchmove?.({touches: [{clientY: 420}]}), () => element.listeners.touchend?.(),
      () => element.listeners.pointerdown?.(), () => controller.preserveDistance(80), () => controller.scrollToKeyDistance(150, 'smooth'),
      () => controller.scrollToBottom('smooth'), () => controller.commitPending(), () => { streaming = false; controller.notifyStreamingEnded(); },
      () => controller.queueFooterCorrection(24),
      // A touch after the last one ended starts fresh; many steps fill the debug trail past its cap.
      () => element.listeners.touchmove?.({touches: [{clientY: 500}]}),
      ...Array.from({length: 40}, (_, index) => () => (index % 2 ? controller.scrollToBottom() : controller.scrollToKeyDistance(60 + index))),
      () => controller.detach(),
    ];
    for (const [index, run] of steps.entries()) {
      let outcome;
      try { outcome = run(); } catch (error) { outcome = `threw ${error.name}`; }
      trail.push([index, outcome, controller.getFollowMode(), controller.getLocation?.(), element.scrollTop]);
    }
    return JSON.stringify([...trail, controller.getDebugEvents()]);
  };
  for (const geometry of ['top-down', 'bottom-up']) assert.equal(drive(ours, geometry), drive(supplied, geometry), geometry);
});

// The composer head's tool summaries, step groups, tab targets and sent prompts, with real steps.
test('the composer head summarizes tools, groups steps and lists prompts like the supplied one', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const kinds = {read: 'read', edit: 'edit', webfetch: 'search', websearch: 'search', memory_search: 'search', browsing_history_search: 'search', skill: 'skill',
    history_search: 'search', history_read: 'read'};
  world.enter({imports: {
    './tool-definition-registry-Cc6FCFb2.js#t': name => ({summaryKind: kinds[name] ?? 'tool', hide: name === 'hidden' ? () => true : undefined, standalone: name === 'todo'}),
    './tool-definition-registry-Cc6FCFb2.js#m': result => result?.content ?? [],
    './tool-definition-registry-Cc6FCFb2.js#d': call => ({name: `skill-${call.id}`}),
    './tool-definition-registry-Cc6FCFb2.js#u': args => ({target: args.target, action: args.action}),
    './tool-definition-registry-Cc6FCFb2.js#l': ({call}) => ({action: call.id.endsWith('2') ? 'Read' : 'Searched'}),
    './strip-markdown-DRcmtuJc.js#Nt': (message, index) => `${message.id ?? message.timestamp}:${index}`,
    './strip-markdown-DRcmtuJc.js#m': message => (typeof message.content === 'string' ? message.content : ''),
  }});
  const json = value => JSON.stringify(value, (_, item) => (Object.prototype.toString.call(item) === '[object Map]' ? [...item] : item));
  const same = (name, ...args) => assert.equal(json(ours[name](...args)), json(supplied[name](...args)), `${name}(${json(args).slice(0, 80)})`);
  const tool = (id, name, args = {}, result = {content: [{type: 'text', text: 'ok'}]}, details) => ({call: {id, name}, args, result, details});
  const steps = [tool('c1', 'read', {path: 'src\\a.ts'}), tool('c2', 'read', {file_path: 'src/a.ts'}), tool('c3', 'edit', {path: 'b.md'}), tool('c4', 'websearch'),
    tool('c5', 'webfetch', {url: 'https://x.example'}), tool('c6', 'memory_search', {}, undefined, {skipped: 'indexing'}), tool('c7', 'memory_search'),
    tool('c8', 'browsing_history_search'), tool('c9', 'skill', {path: 'skills/deploy'}), tool('c10', 'repl', {target: 'code', action: 'run'}),
    tool('c11', 'repl', {target: 'notes', action: 'search'}), tool('c12', 'repl', {target: 'mail', action: 'send'}), tool('c13', 'history_search'),
    tool('c22', 'history_read'), tool('c14', 'bash', {}, {isError: true}), tool('c15', 'bash', {}, undefined), tool('c16', 'bash', {}, {content: []}),
    tool('c17', 'todo'), tool('c18', 'hidden')];
  same('__kept_hu', steps);
  same('__kept_hu', steps.slice(0, 1));
  same('__kept_hu', []);
  for (const step of steps) { same('__pair_summaryKind', step); same('__kept_Kn', step); }
  const labels = [{label: 'Searched', priority: 2, stepIndex: 3}, {label: 'Read from', priority: 1, stepIndex: 5}, {label: 'Ran actions', priority: 1, stepIndex: 1},
    {label: 'Edited', priority: 4, stepIndex: 0}, {label: 'Sent via', priority: 3, stepIndex: 2}];
  for (const list of [labels, labels.slice(0, 3), labels.slice(0, 1), []]) same('__pair_toolActivityLabel', list);
  const numbers = Array.from({length: 450}, (_, index) => index);
  for (const keep of [index => index % 5 !== 0, () => true, () => false]) same('__kept_lu', numbers.slice(0, 30), keep);
  same('__kept_lu', numbers, () => true);
  same('__kept_pu', [{id: 't1', targetId: 'g1', url: 'https://a.example', data: {title: ' A ', iconUrl: 'i.png', viewport: {w: 1}}, createdAt: 1, updatedAt: 2, ownership: 'agent'},
    {id: 't2', targetId: 'g2', url: 'about:blank', data: {}}, {id: 't3', url: 'https://b.example', data: {}}, {id: 't4', targetId: 'g4', url: 'https://c.example', data: {title: '  '}},
    {id: 't5', targetId: 'g5', url: ':', data: {}}], 'g1');
  same('__pair_tabMentionsOf', [{type: 'tab', faviconUrl: 'f.png', url: 'https://a'}, {type: 'file', name: 'x'}]);
  const turns = [{input: [{role: 'user-message-metadata', attachments: [{type: 'tab', url: 'https://a', faviconUrl: 'f'}]}, {role: 'user', id: 'u1', content: 'First', timestamp: 1}],
    steeringMessages: [{role: 'steering', id: 's1', content: 'Steer', timestamp: 2, attachments: [{type: 'tab', url: 'https://b'}]}]}];
  const messagesByKey = {m1: {role: 'user', id: 'u2', content: 'Second', timestamp: 3}, m2: {role: 'user', id: 'u3', content: 'Recalled', timestamp: 4, metadata: {contextRecall: true}},
    m3: {role: 'user', id: 'u4', content: 'Steered', timestamp: 5, metadata: {steeringMessageId: 's1'}}, m4: {role: 'assistant', content: 'no'}};
  same('__pair_sentPrompts', {turns, messageOrder: ['m1', 'm2', 'm3', 'm4', 'gone'], messagesByKey});
});

// Pasted files in messages and the queue list, with real messages.
test('pasted files and queued items are handled like the supplied ones', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: COMPOSER, text: textOf(COMPOSER), blocks: ROUTES[COMPOSER], integrate: integrateRoutes,
    read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const meta = attachments => ({role: 'user-message-metadata', attachments});
  const messages = [
    [meta([{type: 'file', name: 'a.png', data: 'AA', path: 'a.png', pastedText: {characterCount: 3}}, {type: 'file', name: 'b', data: 'BB'}, {type: 'tab', url: 'u'}]),
      {role: 'user', content: 'hi'}],
    [meta([{type: 'file', name: 'c', path: 'c.txt'}]), {role: 'user', content: 'x'}],
    meta([{type: 'file', name: 'd', data: 'DD'}]), meta([{type: 'file', name: 'e', data: 'EE', path: 'e.txt'}, {type: 'tab', url: 'u'}]),
    {role: 'user', content: 'plain'}, [],
  ];
  for (const metadata of [{kind: 'binary'}, {kind: 'directory'}, {kind: 'text'}, undefined]) same('__pair_openModeOf', metadata);
  for (const message of messages) { same('__kept_Oh', message); same('__kept_Hh', message); }
  const upload = async attachment => ({id: `up-${attachment.name}`, path: `uploads/${attachment.name}`});
  for (const message of messages) assert.equal(JSON.stringify(await ours.__kept_oo(message, upload)), JSON.stringify(await supplied.__kept_oo(message, upload)));
  const queue = [meta([{type: 'tab', url: 'u'}]), {role: 'user', content: 'one', timestamp: 1}, {role: 'assistant'}, {role: 'user', content: 'two', timestamp: 2}];
  for (const session of [{queuedMessages: queue, steeringMessages: queue.slice(1, 2)}, {}, {queuedMessages: []}]) same('__kept_io', session);
  same('__pair_userMessagesOf', queue);
  same('__pair_userMessagesOf', undefined);
});

// The Security & Privacy page's ad blocker filters, update reporting and browsing-data work, run with
// a recording ad-blocker API and browser APIs on both sides.
test('the privacy settings manage filters and browsing data like the supplied page', async () => {
  const chunk = 'assets/privacy-BeEEt9Qu.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const json = value => JSON.stringify(value, (_, item) => (typeof item === 'function' ? `fn` : item));
  const same = (name, ...args) => assert.equal(json(ours[name](...args)), json(supplied[name](...args)), `${name}(${json(args).slice(0, 80)})`);
  const rules = '! Title: Social\n||social.example^\n||share.example^\n\n! Title:   \n##.banner\n\n';
  for (const text of [rules, '||plain.example^', '   ', '! Title: One\n']) same('__pair_parseCustomRules', text);
  same('__pair_formatCustomRules', supplied.__pair_parseCustomRules(rules));
  for (const editing of [{type: 'url', subscription: {name: 'EasyList', url: 'https://e.example/list.txt'}}, {type: 'url', subscription: {url: 'https://x'}},
    {type: 'text', index: 1}, {type: 'text', index: 9}, undefined]) same('__pair_filterDefaults', editing, rules);
  for (const [query, ...fields] of [['', 'a'], ['soc', 'Social', 'x'], ['zz', 'Social']]) same('__pair_matches', query, ...fields);
  for (const text of ['abc', 'é漢']) same('__pair_byteLength', text);
  for (const count of [0, 1, 7]) same('__pair_filterCount', count);
  const state = {available: true, stateLoaded: true, compiling: false, activeUpdateJobIds: [], enabled: true};
  for (const [current, lists] of [[undefined], [{available: false}], [{...state, stateLoaded: false}], [{...state, compiling: true}],
    [{...state, activeUpdateJobIds: ['j']}], [{...state, enabled: false}], [state, []], [state, [{lastSuccessfulCheckMs: 0}]], [state, [{lastSuccessfulCheckMs: 5}, {lastSuccessfulCheckMs: 9}]]])
    same('__pair_adblockStatus', current, lists);
  for (const period of ['all', '15', '10080']) same('__pair_periodStart', period);
  // The filter changes, against an API that records what it is asked.
  const run = async (side, work) => {
    const calls = [];
    const api = new Proxy({}, {get: (_, method) => async (...args) => {
      calls.push([method, ...args]);
      if (method === 'getCustomRules') return {rules};
      if (method === 'getSubscriptionUpdateProgress') return {status: calls.filter(([name]) => name === method).length < 3 ? 'running' : 'partiallyFailed'};
      if (method === 'addSubscription') return {updateJobId: 'job-1'};
    }});
    const toasts = name => (...args) => calls.push([name, ...args]);
    world.enter({imports: {'./dist-LyKrHgST.js#n.success': toasts('success'), './dist-LyKrHgST.js#n.error': toasts('error'),
      'chrome.history.search': async () => [{url: 'https://www.a.example/x'}, {url: 'https://b.example'}, {url: 'not a url'}, {}],
      'chrome.cookies.getAll': async () => [{domain: '.a.example'}, {domain: 'www.a.example'}, {domain: 'c.example'}],
      'chrome.downloads.search': async query => (calls.push(['downloads', query]), [{}]),
      'chrome.browsingData.remove': async (...args) => calls.push(['remove', ...args])}});
    let outcome;
    try { outcome = await work(side, api); } catch (error) { outcome = `threw ${error.message}`; }
    return json([outcome, calls]);
  };
  const works = [
    (side, api) => side.__pair_saveFilter(api, {mode: 'url', url: 'https://n.example', name: 'New'}),
    (side, api) => side.__pair_saveFilter(api, {mode: 'url', url: 'https://n.example', name: 'Renamed'}, {type: 'url', subscription: {id: 's1', url: 'https://n.example', name: 'Old'}}),
    (side, api) => side.__pair_saveFilter(api, {mode: 'url', url: 'https://m.example', name: 'Moved'}, {type: 'url', subscription: {id: 's1', url: 'https://n.example'}}),
    (side, api) => side.__pair_saveFilter(api, {mode: 'url', url: 'https://n.example', name: ''}, {type: 'url', subscription: {id: 's1', url: 'https://n.example'}}),
    (side, api) => side.__pair_saveFilter(api, {mode: 'text', name: 'Mine', rules: '##.ad'}),
    (side, api) => side.__pair_saveFilter(api, {mode: 'text', name: 'Edited', rules: '##.x'}, {type: 'text', index: 0}),
    (side, api) => side.__pair_removeFilter(api, {type: 'text', index: 1}),
    (side, api) => side.__pair_removeFilter(api, {type: 'url', subscription: {id: 's9'}}),
    (side, api) => side.__pair_removeFilter(api, undefined),
    (side, api) => side.__pair_editCustomRules(api, list => list.push({name: 'Huge', rules: 'x'.repeat(4194304)})),
    (side, api) => side.__pair_waitForUpdate(api, 'job-1'),
    (side, api) => side.__pair_announceUpdate(api, 'job-1', 'toast-1'),
    side => side.__pair_browsingDataDetails('15'),
    side => side.__pair_historyDetail(5),
    side => side.__pair_cookiesDetail(),
    side => side.__pair_downloadsDetail(undefined),
    side => side.__pair_deleteBrowsingData({period: '30', items: ['browsing-history', 'site-data', 'form-data']}),
    side => side.__pair_deleteBrowsingData({period: 'all', items: ['cookies']}),
  ];
  for (const [index, work] of works.entries()) assert.equal(await run(ours, work), await run(supplied, work), `work ${index}`);
});

// Settings pages answer their queries by name; a spread query's name is kept under STUB_PATH.
const queryName = options => String(options?.[STUB_PATH] ?? options);
const queries = answers => options => {
  const name = queryName(options);
  const key = Object.keys(answers).find(part => name.includes(part));
  return key ? answers[key] : {data: undefined, isLoading: true};
};

// The Account page with a cloud account, its profile, devices, sync key and a waiting CLI login.
test('the Account page renders like the supplied one with an account and devices', async () => {
  const chunk = 'assets/account-Dr_CA8LL.js';
  const account = {id: 7, mode: 'cloud', authStatus: 'active', email: 'r@aux.example', name: 'r@aux.example', profileUrl: null, userId: 'u1'};
  const devices = [{id: 'd1', deviceName: 'Studio', platform: 'macos', lastUsedAt: '2026-10-29T10:00:00Z', appVersion: '1.4.0', isCurrent: true},
    {id: 'd2', platform: 'windows', lastSeenAt: '2026-09-01T00:00:00Z', isCurrent: false}, {id: 'd3', platform: 'linux'}];
  const scene = (world, {mode = 'cloud', authStatus = 'active', status = {canEnroll: true, syncGeneration: 2, state: 'missing'}, me = {email: 'r@aux.example', name: 'Robert',
    profileUrl: 'https://img.example/me.png', userId: 'u1'}, pending = [{requestId: 'q1', deviceName: 'Terminal', expiresAt: '2026-10-30T12:05:00Z'}]} = {}) => ({imports: {
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
    './strip-markdown-DRcmtuJc.js#tr': queries({'accounts.get': {data: {...account, mode, authStatus}}, 'auth.devices': {data: devices}, deviceCodePending: {data: pending}}),
    './strip-markdown-DRcmtuJc.js#nr': queries({'auth.me': {data: me}, syncKeyStatus: {data: status, error: null}, 'auth.devices': {data: devices}}),
    './strip-markdown-DRcmtuJc.js#er': options => ({isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync'), variables: undefined,
      name: queryName(options)}),
    './date-CxUVm-Dr.js#n.default': at => ({isValid: () => Boolean(at), fromNow: () => 'a day ago', format: pattern => `${at} as ${pattern}`, diff: () => 1}),
  }});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 60, defaults: false,
    renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {authStatus: 'paused', me: undefined, pending: []}), world => scene(world, {mode: 'local'}),
      world => scene(world, {status: {canEnroll: false, syncGeneration: 0, state: 'mismatched'}}), world => ({...scene(world), state: [true]})],
    props: [{account, accountId: 7, userId: 'u1', email: 'r@aux.example', request: {requestId: 'q1', deviceName: 'Terminal', expiresAt: '2026-10-30T12:05:00Z'},
      device: devices[0], open: true, profile: {email: 'r@aux.example', name: 'Robert', profileUrl: 'https://img.example/me.png'}, ownerId: 'u1', needsSignIn: false,
      status: {canEnroll: true, syncGeneration: 1, state: 'usable_owned'}}, {account: {...account, authStatus: 'paused'}, accountId: 7, device: devices[1], open: false,
      profile: {email: 'x@y', name: 'x@y'}, needsSignIn: true, status: {canEnroll: false, state: 'usable_ownerless'}, statusError: {message: 'Offline'}}]});
});

test('the Account page helpers name devices and profiles like the supplied ones', async () => {
  const chunk = 'assets/account-Dr_CA8LL.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  world.enter({imports: {'./date-CxUVm-Dr.js#n.default': at => ({isValid: () => Boolean(at), fromNow: () => `since ${at}`})}});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const devices = [{deviceName: 'Studio', platform: 'macos', lastUsedAt: 'x', appVersion: '1.4'}, {platform: 'windows', lastSeenAt: 'y'}, {platform: 'linux'}, {}];
  for (const device of devices) { same('__pair_deviceName', device); same('__pair_deviceDetail', device); same('__pair_platformName', device.platform); }
  for (const profile of [{name: 'a@b', email: 'a@b'}, {name: 'Robert', email: 'a@b'}]) same('__pair_editableName', profile);
  assert.equal(JSON.stringify(ours.__pair_SYNC_KEY_PROBLEMS), JSON.stringify(supplied.__pair_SYNC_KEY_PROBLEMS));
  const run = side => { const calls = []; const client = {setQueryData: (key, value) => calls.push([String(key), typeof value === 'function' ? value({name: 'old', id: 7}) : value])};
    side.__pair_storeProfile(client, {accounts: {auth: {me: {queryKey: input => `me:${JSON.stringify(input)}`}}, get: {queryKey: input => `get:${JSON.stringify(input)}`}}},
      7, {name: 'New'}); return JSON.stringify(calls); };
  world.enter({imports: {'./-utils-B_lbplVm.js#t': (account, profile) => ({...account, ...profile})}});
  assert.equal(run(ours), run(supplied));
});

// The Models page: limits as typed, vendors, usage left and provider kinds, then the page with providers.
test('the Models page parses limits, groups vendors and lists providers like the supplied one', async () => {
  const chunk = 'assets/model-BrFuJM2w.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const kindImports = {'./use-agent-settings-DiedG0R1.js#c': id => id === 'ollama', './strip-markdown-DRcmtuJc.js#Dt': id => id === 'lmstudio'};
  world.enter({imports: kindImports});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  for (const text of ['120000', '120k', '1.5M', '1,500_000', ' 2 m ', '0', '-5', 'abc', '1e3', '']) same('__pair_parseTokens', text);
  for (const value of [1234567, 0]) same('__pair_formatTokens', value);
  for (const text of ['80%', ' 75 ', '7 5%', '', 'x', '33.6']) same('__pair_parsePercent', text);
  const ids = ['openai/gpt-5', 'anthropic/claude', 'openai/o3', 'workers-ai/@cf/meta/llama', 'workers-ai/@cf', 'groq/llama/x', 'fireworks/accounts/m', 'groq',
    'moonshotai/kimi', 'some-ai-studio/x', 'mcp_tools-gpt/x', '/odd', 'workers-ai/other/x', 'xai/grok'];
  for (const id of ids) { same('__pair_vendorOf', id); same('__pair_vendorName', id.split('/')[0]); }
  same('__pair_groupByVendor', ids.map(id => ({id})));
  for (const usedPercent of [0, 33.4, 100, 140, -3]) { same('__pair_percentLeft', {usedPercent}); same('__pair_leftLabel', {usedPercent}); }
  const providers = [{id: 'openrouter', method: 'api_key'}, {id: 'vercel-ai-gateway', method: 'models_json'}, {id: 'ollama', method: 'models_json'},
    {id: 'custom', method: 'models_json'}, {id: 'custom2', method: 'models_json', oauthOnly: true}, {id: 'lmstudio', method: 'models_json'}, {id: 'openai', method: 'oauth'},
    {id: 'anthropic', method: 'api_key'}];
  for (const provider of providers) {
    same('__pair_isGateway', provider.id);
    same('__pair_isGateway', 'cloudflare-ai-gateway');
    same('__pair_usesModelsJson', provider);
    same('__pair_canReauthenticate', provider);
  }
  for (const [provider, plan] of [[{state: 'auth-expired', id: 'x'}], [{id: 'aux'}, 'pro'], [{id: 'openai', type: 'subscription'}], [{id: 'anthropic', type: 'api'}]])
    same('__pair_providerDescription', provider, plan);
  // The page with connected providers, usage windows and limits.
  const connected = new Map([['openai', {id: 'openai', name: 'OpenAI', method: 'oauth', type: 'subscription'}], ['openrouter', {id: 'openrouter', name: 'OpenRouter',
    method: 'api_key', type: 'api'}], ['custom', {id: 'custom', name: 'Custom', method: 'models_json'}], ['anthropic', {id: 'anthropic', name: 'Anthropic', method: 'api_key',
    state: 'auth-expired'}]]);
  const scene = (world, extra = {}) => ({imports: {...kindImports, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
    './provider-context-A_wu0fRN.js#n': {accountId: 7, subscriptionPlan: 'pro', connected, refetch: world.stub('spy:refetch'), setCurrentProvider: world.stub('spy:setProvider'),
      ...extra},
    './subscription-usage-BB4arJ0Z.js#t': id => (id === 'openai' ? {five_hour: {usedPercent: 40}, weekly: {usedPercent: 90}} : null),
    './strip-markdown-DRcmtuJc.js#tr': queries({'accounts.get': {data: {mode: 'local'}}, listSupported: {data: [{provider: 'openai', id: 'gpt-image', supportsImages: true}]},
      'settings.getAll': {data: {defaultImageModel: {provider: 'openai', modelId: 'gpt-image'}, compaction: {thresholdPercent: 80, modelThresholdTokens: {'openai/gpt-5': 120000}}}}}),
    './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync')}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 60, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {subscriptionPlan: 'free', connected: new Map()}), world => ({...scene(world), state: ['120k']})],
    props: [{providerId: 'openrouter', modelKey: 'openai/gpt-5', label: 'Five hours', window: {usedPercent: 20}, provider: 'openai', checked: true, model: {id: 'openai/gpt-5', name: 'GPT-5'},
      value: 120000, format: value => `${value}`, parse: text => Number(text) || null, children: 'Limit'}, {providerId: 'vercel-ai-gateway', window: null, provider: 'custom',
      checked: false, model: {id: 'x', name: 'X'}}]});
});

// The Developers page: the CLI not installed, up to date and outdated; agents with and without the
// skill; remote control off, connecting and connected.
test('the Developers page renders like the supplied one with the CLI, agents and remote control', async () => {
  const chunk = 'assets/developers-DTvaoVBC.js';
  const scene = (world, {cli = {installed: true, updateAvailable: false, installCommand: 'curl -fsSL aux.sh | sh', commandPath: '/usr/local/bin/aux', currentVersion: '1.4.0',
    latestVersion: '1.4.0'}, agents = [{id: 'codex', installed: true, skill: {installed: true}}, {id: 'cursor', installed: true, skill: {installed: false}}, {id: 'opencode', installed: false, skill: {installed: false}}],
    remote = {status: 'connected', deviceName: 'Studio'}, account = {mode: 'cloud', authStatus: 'active'}, pending = false} = {}) => ({imports: {
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
    './strip-markdown-DRcmtuJc.js#nr': queries({checkCliInstallation: {data: cli, isPending: pending}, checkAgentInstallations: {data: {agents}},
      'accounts.get': {data: account}, 'remoteControl.status': {data: remote}}),
    './strip-markdown-DRcmtuJc.js#er': options => ({isPending: false, mutate: world.stub(`spy:mutate:${queryName(options).split('.').at(-2)}`), variables: undefined}),
    './Match-OymXmaXz.js#o': world.stub('spy:navigate')}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world),
      world => scene(world, {cli: {installed: false, installCommand: 'curl aux.sh | sh'}, agents: [], remote: {status: 'disabled'}, account: {mode: 'local'}}),
      world => scene(world, {cli: {installed: true, updateAvailable: true, currentVersion: '1.3', latestVersion: '1.4'}, remote: {status: 'connecting'}}),
      world => scene(world, {pending: true, remote: {status: 'errored', error: 'Port in use'}}), world => ({...scene(world), state: ['codex']})],
    props: [{children: 'aux exec'}, {}]});
});

test('the Developers page lists the same questions, agents and statuses', async () => {
  const chunk = 'assets/developers-DTvaoVBC.js';
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const name of ['__pair_CLI_QUESTIONS', '__pair_SKILL_AGENTS', '__pair_REMOTE_STATUS', '__pair_CLI_ILLUSTRATION'])
    assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
});

// The Agent page: permission rules and file roots merged and labelled, then the page with a sandbox,
// rules, roots, the runtime installed or installing, and its settings.
test('the Agent page merges permissions and renders like the supplied one', async () => {
  const chunk = 'assets/agents-urkO3LLg.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const permission = {sandbox: {enabled: true}, rules: {allow: [{type: 'tool', tool: 'read'}], deny: [{type: 'browser', action: 'navigate', url: 'https://bank.example'}],
    default: 'ask'}, files: {readableRoots: ['/w/docs'], outsideWrite: 'deny'}};
  for (const value of [permission, undefined, {}]) { same('__pair_toolRules', value); same('__pair_fileRules', value); }
  for (const change of [{rules: {ask: [{type: 'tool', tool: 'bash'}]}}, {files: {writableRoots: ['/w/out']}}, {sandbox: {enabled: false}}, {}])
    for (const value of [permission, undefined]) same('__pair_mergePermission', value, change);
  same('__pair_unique', ['a', 'b'], 'b', 'c', 'a');
  for (const rule of [{type: 'tool', tool: 'bash'}, {type: 'browser', action: 'click'}, {type: 'browser', action: 'navigate', url: 'https://x'}, {type: 'url', url: 'https://y'}])
    same('__pair_ruleLabel', rule);
  for (const action of ['allow', 'ask', 'deny']) same('__pair_actionDescription', action);
  same('__pair_runtimeVersion', '22.4');
  for (const name of ['__pair_TAB_CLEANUP_OPTIONS', '__pair_NOTIFICATION_KINDS', '__pair_RULE_ACTIONS', '__pair_DEFAULT_RULES', '__pair_DEFAULT_FILES',
    '__pair_DEFAULT_NOTIFICATIONS', '__pair_SOUND_TYPES', '__pair_SOUND_MAX_BYTES']) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  const settings = {permission, completionSound: {enabled: true, data: 'AAAA', mimeType: 'audio/wav', name: 'ding.wav'}, followUpBehavior: 'steer',
    agentTabs: {autoClose: true, closeAfterMinutes: 10}, agentTaskNotifications: {needsAttention: true, taskCompletions: false}, defaultPermissionMode: 'ask'};
  const scene = (world, {runtime = {installed: true, version: '22.4', healthy: true}, job = {state: 'idle'}, sandbox = permission, mode = 'new'} = {}) => ({
    context: {accountSettings: {...settings, permission: sandbox}, accountDir: '/w/aux', patchPermission: world.stub('spy:patchPermission')},
    imports: {'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
      './strip-markdown-DRcmtuJc.js#nr': queries({'settings.getAll': {data: settings}, 'agentRuntime.status': {data: runtime}, 'agentRuntime.job': {data: job},
        getSkillsDirectory: {data: '/w/aux/skills'}}),
      './strip-markdown-DRcmtuJc.js#tr': queries({'settings.getAll': {data: settings}, getSkillsDirectory: {data: '/w/aux/skills'}}),
      './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync')},
      './use-update-settings-ahXnGzre.js#t': {isPending: false, mutate: world.stub('spy:update')},
      './use-sidepanel-session-on-tab-change-BE8mSy2N.js#t': {mode}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 60, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {runtime: {installed: false}, job: {state: 'running', progress: 0.4}, sandbox: {sandbox: {enabled: false}},
      mode: 'keep'}), world => scene(world, {job: {state: 'failed', error: 'Disk full'}, sandbox: undefined}), world => ({...scene(world), state: [true]})],
    props: [{mode: 'read', group: 'allow', label: 'Allowed tools', onAdd: world.stub('spy:onAdd'), children: 'child'}, {mode: 'write', group: 'deny', label: 'Denied'}]});
});

// The Projects pages with active and archived Projects, none, and an error; the Plugins header on each tab.
test('the Projects pages and the Plugins header render like the supplied ones', async () => {
  const projects = [{id: 'p1', name: 'Aux', updatedAt: 2}, {id: 'p2', name: 'Old', archivedAt: 1}, {id: 'p3', name: 'Docs', updatedAt: 1}];
  const sort = list => [...list].sort((a, b) => a.name.localeCompare(b.name));
  const scene = (world, {list = projects, pending = false, error = false, path = '/u/7/settings/plugins/skills', mode} = {}) => ({imports: {
    './strip-markdown-DRcmtuJc.js#tr': {data: list}, './strip-markdown-DRcmtuJc.js#nr': {data: list, isPending: pending, isError: error},
    './project-list-BmtBNv8P.js#r': sort, './Match-OymXmaXz.js#o': world.stub('spy:navigate'),
    './extension-main-Dz1-AsCT.js#d.useParams': () => ({userId: '7'}), './extension-main-Dz1-AsCT.js#T.useParams': () => ({userId: '7'}),
    './extension-main-Dz1-AsCT.js#T.useSearch': () => ({mode}), './useRouterState-vMU34Fpy.js#t': ({select}) => select({location: {pathname: path}}),
    './link-q1zvRKtc.js#m': () => ({userId: '7'})}});
  const blocksByChunk = Object.fromEntries(['assets/projects-D4kjkizu.js', 'assets/projects-D_csJvC9.js', 'assets/plugins-header-28yyYrQl.js'].map(chunk => [chunk, ROUTES[chunk]]));
  await assertParity({blocksByChunk, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {list: [], path: '/u/7/settings/plugins/mcps', mode: 'create'}), world => scene(world, {pending: true}),
      world => scene(world, {error: true}), world => ({...scene(world), state: [true]})],
    props: [{userId: '7', initiallyCreating: true, actions: 'Add', onCreate: world => world}, {userId: '7'}]});
});

// The Routines page and a routine's row, menu and run history, with routines in every state.
test('the Routines page and a routine menu render like the supplied ones', async () => {
  const routine = (id, extra = {}) => ({id, name: `Routine ${id}`, prompt: 'Do it', rrule: 'FREQ=DAILY', type: 'standalone', environment: 'device', status: 'active',
    parentSessionId: `s-${id}`, revision: 2, appliedRevision: 2, ...extra});
  const routines = [routine('r1'), routine('r2', {status: 'paused', appliedRevision: 1}), routine('r3', {environment: 'cloud'}), routine('r4', {type: 'internal'})];
  const runs = [{id: 'run1', title: 'Today', status: 'completed', createdAt: '2026-10-30T08:00:00Z'}, {id: 'run2', title: 'Yesterday', status: 'failed',
    createdAt: '2026-10-29T08:00:00Z'}];
  const scene = (world, {list = routines, history = {data: {pages: [runs]}, hasNextPage: true, isPending: false, isError: false}, session = {data: {id: 'run1'}}} = {}) => ({
    imports: {'./strip-markdown-DRcmtuJc.js#tr': queries({'routines.list': {data: list}, 'accounts.get': {data: {subscriptionPlan: 'free'}}}),
      './strip-markdown-DRcmtuJc.js#$n': history, './strip-markdown-DRcmtuJc.js#nr': session, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
      './extension-main-Dz1-AsCT.js#u.useParams': () => ({userId: '7'}), './extension-main-Dz1-AsCT.js#u.useSearch': () => ({mode: 'edit', id: 'r1'}),
      './extension-main-Dz1-AsCT.js#u.useNavigate': () => world.stub('spy:navigate'),
      './tool-definition-registry-Cc6FCFb2.js#f': item => `Every day (${item.rrule})`,
      './provider-Cw0zhujt.js#L': {updateRoutine: {isPending: false, mutate: world.stub('spy:update')}, deleteRoutine: {isPending: false, mutate: world.stub('spy:delete')},
        runRoutine: {isPending: false, mutate: world.stub('spy:run')}},
      './date-CxUVm-Dr.js#n.default': at => ({format: pattern => `${at} as ${pattern}`, fromNow: () => 'today'})}});
  const blocksByChunk = Object.fromEntries(['assets/routines-BNdQOEUt.js', 'assets/routine-item-menu-DJrYR2RE.js'].map(chunk => [chunk, ROUTES[chunk]]));
  await assertParity({blocksByChunk, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {list: [], history: {data: {pages: [[]]}, hasNextPage: false}, session: {data: null}}),
      world => scene(world, {history: {isPending: true}, session: {isError: true}}), world => ({...scene(world), state: ['run2']}), world => ({...scene(world), state: [true]})],
    props: [{routine: routines[0], showSwitch: true, children: 'row', routineId: 'r1', name: 'Morning', sessionId: 'run1', pending: false, contextMenu: true},
      {routine: routines[1], routineId: 'r2', name: 'Weekly', sessionId: 'gone', pending: true, contextMenu: false}]});
});

// The New Tab tasks: a session waiting on a confirmation, recent chats (one unread) and routines, none,
// and incognito.
test('the New Tab tasks render like the supplied ones with sessions to confirm and recent work', async () => {
  const chunk = 'assets/tasks-CtF0WxoJ.js';
  const confirm = {kind: 'action-confirmation', toolCallId: 'tc1', createdAt: 5, request: {title: 'Send the email?', message: 'To the team', artifact: {type: 'email'}}};
  const sessions = [{id: 's1', title: 'Weekly update', status: 'suspended', suspension: confirm, updatedAt: '2026-10-30T10:00:00Z'},
    {id: 's2', title: 'Research', status: 'running', unread: true}, {id: 's3', title: 'Plan', status: 'idle'}, {id: 's4', title: 'Notes', status: 'idle'},
    {id: 's5', title: 'Asked', status: 'suspended', suspension: {kind: 'ask-user-question'}}];
  const scene = (world, {list = sessions, loading = false, mode = 'default', state} = {}) => ({state, imports: {
    './newtab-CnOLQ0yu.js#s': 7, './newtab-CnOLQ0yu.js#o': {browserMode: mode}, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
    './strip-markdown-DRcmtuJc.js#nr': {data: list, isLoading: loading}, './strip-markdown-DRcmtuJc.js#en': true,
    './file-attachments-D5m1O8aA.js#a': suspension => Boolean(suspension?.kind),
    './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutateAsync: world.stub('spy:resolve')}, './extension-page-url-BH3pfT7h.js#t': path => `ext:${path}`}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {list: [], state: ['routines', true]}), world => scene(world, {loading: true, list: []}),
      world => scene(world, {mode: 'incognito'}), world => scene(world, {state: ['routines', false]}), world => scene(world, {state: [true]})],
    props: [{session: sessions[0], items: sessions, children: 'island', disabled: false, message: 'To the team', sessionTitle: 'Weekly update', title: 'Send?',
      onConfirm: world => world, onCustom: world => world}, {session: sessions[1], items: [], isLoading: true, disabled: true}]});
});

test('the New Tab tasks cache their previews like the supplied ones', async () => {
  const chunk = 'assets/tasks-CtF0WxoJ.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const run = side => {
    const store = new Map([['aux.new-tab.session-previews.v2:7', JSON.stringify(Array.from({length: 10}, (_, index) => ({id: `s${index}`})))],
      ['aux.new-tab.session-previews.v2:8', '{"not": "a list"}'], ['aux.new-tab.session-previews.v2:9', 'broken']]);
    world.enter({imports: {'window.localStorage.getItem': key => store.get(key) ?? null, 'window.localStorage.setItem': (key, value) => store.set(key, value)}});
    const read = [7, 8, 9, 10].map(account => side.__pair_readCachedPreviews(account));
    side.__pair_writeCachedPreviews(11, Array.from({length: 12}, (_, index) => ({id: `w${index}`})));
    return JSON.stringify([read, side.__pair_previewCacheKey(3), store.get('aux.new-tab.session-previews.v2:11')]);
  };
  assert.equal(run(ours), run(supplied));
});

// The Tasks page: chats as cards and as a list, filtered and searched, loading more, empty and failed.
test('the Tasks page renders like the supplied one with chats, filters and paging', async () => {
  const chunk = 'assets/tasks-D7OPjR17.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  for (const status of ['all', 'running', 'failed', 'needs-review', 'done', 'other']) same('__pair_statusesFor', status);
  for (const status of ['running', 'suspended', 'idle']) same('__pair_isActive', {status});
  for (const item of [undefined, {previewText: 'x'}, {routine: {id: 'r'}}, {}]) same('__pair_rowHeight', item);
  for (const name of ['__pair_STATUS_FILTERS', '__pair_ORDERS', '__pair_PAGE_SIZE']) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  const items = [{id: 's1', title: 'Research', status: 'running', previewText: 'Reading'}, {id: 's2', title: 'Plan', status: 'idle', routine: {id: 'r1'}},
    {id: 's3', title: 'Old', status: 'errored'}];
  const scene = (world, {search = {filter: 'running', view: 'card', q: 'plan', order: 'oldest', projectId: 'p1'}, context = {}} = {}) => ({
    context: {canFetchMoreSessionPreviews: true, fetchMoreSessionPreviews: world.stub('spy:more'), isFetchingMoreSessionPreviews: false,
      isLoadingSessionPreviews: false, isSessionPreviewsError: false, items, ...context},
    imports: {'*.useSearch': () => search, '*.useNavigate': () => world.stub('spy:navigate'), './link-q1zvRKtc.js#r': () => ({userId: '7'}),
      './link-q1zvRKtc.js#n': options => ({href: `/u/7/tasks/${options.params.sessionId}`}), './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
      './strip-markdown-DRcmtuJc.js#$n': {data: {pages: [items]}, hasNextPage: true, isFetchingNextPage: false, isLoading: false, isError: false,
        fetchNextPage: world.stub('spy:fetchNext')},
      './strip-markdown-DRcmtuJc.js#nr': {data: [{id: 'p1', name: 'Aux'}, {id: 'p2', name: 'Docs'}]}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {search: {view: 'list'}}),
      world => scene(world, {search: {}, context: {items: [], isLoadingSessionPreviews: true, canFetchMoreSessionPreviews: false}}),
      world => scene(world, {context: {items: [], isSessionPreviewsError: true}}), world => scene(world, {context: {isFetchingMoreSessionPreviews: true}}),
      world => ({...scene(world), state: [true]})],
    props: [{session: items[0], userId: '7', style: {height: 40}, children: 'list', projectId: 'p1', projectIdLocked: true}, {session: items[1], userId: '7'}]});
});

// Onboarding: the New Tab helper folded, expanded and by task count, in Ask and Search mode; the
// layout parts and the field group with their props; Continue pressing on Enter.
test('the onboarding helper, layout parts and field group render like the supplied ones', async () => {
  const scene = (world, {fold = null, mode = 'ask', key = 'Enter', target = {}} = {}) => ({event: {key, target, currentTarget: {scrollIntoView: world.stub('spy:scroll')},
    preventDefault: world.stub('spy:preventDefault')}, imports: {
    'window.localStorage.getItem': () => fold, './newtab-CnOLQ0yu.js#o': {omniboxMode: mode}, './newtab-CnOLQ0yu.js#s': {accountId: 7},
    './strip-markdown-DRcmtuJc.js#N': {broadcast: world.stub('spy:broadcast')}, './extension-page-url-BH3pfT7h.js#a': world.stub('spy:openPage'),
    './strip-markdown-DRcmtuJc.js#dn': () => false}});
  const blocksByChunk = Object.fromEntries(['assets/onboarding-helper-BVYyPOep.js', 'assets/onboarding-layout-MxuCwWDr.js', 'assets/onboarding-field-group-BpfduoJC.js']
    .map(chunk => [chunk, ROUTES[chunk]]));
  await assertParity({blocksByChunk, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {fold: 'folded', mode: 'search'}), world => scene(world, {fold: 'expanded'}),
      world => scene(world, {key: 'Escape'}), world => ({...scene(world), state: [false]})],
    props: [{taskCount: 0, children: 'Step', className: 'probe', variant: 'default', size: 'lg', id: 'x'}, {taskCount: 4, children: ['a', 'b'], variant: 'outline'}, {}]});
});

test('the onboarding helpers read the fold and spot controls like the supplied ones', async () => {
  const world = createWorld();
  const pair = async chunk => evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const helper = await pair('assets/onboarding-helper-BVYyPOep.js');
  for (const fold of ['folded', 'expanded', 'other', null]) {
    world.enter({imports: {'window.localStorage.getItem': () => fold}});
    assert.equal(helper.ours.__pair_readFold(), helper.supplied.__pair_readFold(), String(fold));
  }
  assert.equal(JSON.stringify(helper.ours.__pair_SUGGESTIONS), JSON.stringify(helper.supplied.__pair_SUGGESTIONS));
  for (const name of ['__pair_FOLD_KEY', '__pair_SUGGESTIONS_SHOWN', '__pair_ILLUSTRATIONS']) assert.equal(JSON.stringify(helper.ours[name]), JSON.stringify(helper.supplied[name]), name);
  const layout = await pair('assets/onboarding-layout-MxuCwWDr.js');
  const field = await pair('assets/onboarding-field-group-BpfduoJC.js');
  assert.equal(field.ours.__pair_FIELD_GROUP, field.supplied.__pair_FIELD_GROUP);
  assert.equal(layout.ours.__pair_isControl({}), layout.supplied.__pair_isControl({}));
});

// The omnibox engine: the mode preference against local storage, the scope lookup, and the Ask panel
// in Ask and Search mode, connected and not, with an editor and a pending submit.
test('the omnibox mode, scopes and Ask panel behave like the supplied ones', async () => {
  const world = createWorld();
  const pair = async chunk => evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const mode = await pair('assets/omnibox-mode-preference-CWzOtieV.js');
  const run = side => {
    const store = new Map([['aux.new-tab.omnibox-mode.v2', 'ask']]);
    const calls = [];
    world.enter({imports: {'window.localStorage.getItem': key => store.get(key) ?? null, 'window.localStorage.setItem': (key, value) => (calls.push([key, value]), store.set(key, value))}});
    const out = [side.o('ask'), side.o('search'), side.o('other'), side.t(), side.d('search'), side.d(undefined)];
    side.n('search');
    out.push(side.t(), side.d('bogus'));
    store.set('aux.new-tab.omnibox-mode.v2', 'weird');
    out.push(side.t());
    return JSON.stringify([out, calls]);
  };
  // The chunk exports o as n, t as t, n as i, d as r.
  const exports = side => ({o: side.n, t: side.t, n: side.i, d: side.r});
  assert.equal(run(exports(mode.ours)), run(exports(mode.supplied)));
  const scope = await pair('assets/omnibox-scope-DGFEg60F.js');
  for (const id of ['bookmark', 'gemini', 'history', 'tabs', 'toString', 'other'])
    assert.equal(String(scope.ours.t(id)), String(scope.supplied.t(id)), id);
  const chunk = 'assets/ask-omnibox-panel-DkxXbN8c.js';
  const editor = world => ({mode: 'ask', draftWriter: {getDraft: () => ({text: 'draft'}), write: world.stub('spy:write'), flush: world.stub('spy:flush')},
    getSnapshot: () => ({plainText: 'Plan my week'}), takePendingAsk: () => null});
  const scene = (world, {accountId = 7, omniboxMode = 'ask', browserMode = 'default', hasEditor = true, creating = false} = {}) => ({imports: {
    './newtab-CnOLQ0yu.js#o': {accountId, browserMode, omniboxMode}, // A fresh editor per read: the panel's effects mark the editor, which must not leak between renders.
    './search-navigation-TWhZq3-H.js#u': () => (hasEditor ? editor(world) : null),
    './search-navigation-TWhZq3-H.js#a': text => Boolean(text?.trim()), './permission-approval-D-GTf91U.js#y': {isCreatingSession: creating, sendMessage: world.stub('spy:send')},
    './permission-approval-D-GTf91U.js#f': {disabled: false}, './permission-approval-D-GTf91U.js#p': {handleFiles: world.stub('spy:files'), submitForm: world.stub('spy:submit')},
    './extension-page-url-BH3pfT7h.js#t': path => `ext:${path}`, './utils-Cl9zfMcr.js#r': text => ({plainText: text})}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {omniboxMode: 'search', browserMode: 'incognito', creating: true}),
      world => scene(world, {accountId: null}), world => scene(world, {hasEditor: false}), world => ({...scene(world), state: [false]})],
    props: [world => ({hasSubmitPending: () => true, pendingSubmitInput: 'Plan my week', pendingSubmitSnapshot: null, onInputChange: world.stub('spy:onInput'),
      onAttachFilesReady: world.stub('spy:onAttach'), onPendingSubmitHandled: world.stub('spy:onHandled'), onSearchMode: world.stub('spy:onSearch'),
      onSubmitInFlightChange: world.stub('spy:onInFlight'), onSubmitStart: () => true, onSubmitReady: world.stub('spy:onReady'), forcedMode: null}),
      world => ({hasSubmitPending: () => false, pendingSubmitInput: null, onSubmitStart: () => false, onAttachFilesReady: world.stub('spy:onAttach'),
        onSubmitReady: world.stub('spy:onReady'), onSubmitInFlightChange: world.stub('spy:onInFlight'), onPendingSubmitHandled: world.stub('spy:onHandled')})]});
});

// Channels: connections on every platform and status, their policies, pairing requests and paired
// senders, remote control, and the new-connection dialog on each of its views.
test('the Channels page and its dialogs render like the supplied ones', async () => {
  const chunk = 'assets/channels-CJn5l9_T.js';
  const connections = [{id: 'c1', platform: 'slack', displayName: 'Aux Slack', enabled: true, status: 'connected', botUserId: 'U1', projectId: 'p1', lastUsedAt: 5},
    {id: 'c2', platform: 'telegram', displayName: 'Aux Bot', enabled: false, status: 'error', lastError: 'Token revoked', projectId: null, lastUsedAt: null},
    {id: 'c3', platform: 'discord', displayName: 'Aux Discord', enabled: true, status: 'backing_off'}];
  const policy = {dm: {access: 'pairing'}, group: {access: 'everyone', requireMention: true}, delivery: {whileRunning: 'follow_up', interruptCommands: ['stop'], debounceMs: 800}};
  const pairing = [{requestId: 'q1', senderId: 'U9', displayName: 'Sam', avatarUrl: null, createdAt: 1, expiresAt: 4102444800000},
    {requestId: 'q2', senderId: 'U8', displayName: null, expiresAt: 1}];
  const senders = [{connectionId: 'c1', senderId: 'U2', displayName: 'Robert', avatarUrl: 'a.png', canApprovePairing: true, pairedAt: 3}, {connectionId: 'c1', senderId: 'U3',
    displayName: null, canApprovePairing: false, pairedAt: null}];
  const scene = (world, {list = connections, account = {mode: 'cloud', authStatus: 'active', subscriptionPlan: 'pro'}, remote = {status: 'connected'}, view = 'choice',
    platform = 'slack', state} = {}) => ({state, context: {accountId: 7, platform, projects: [{id: 'p1', name: 'Aux'}], busyRef: {current: false}, setView: world.stub('spy:setView'),
      onOpenChange: world.stub('spy:onOpenChange'), onSaved: world.stub('spy:onSaved'), view}, imports: {
    './strip-markdown-DRcmtuJc.js#tr': queries({'connections.list': {data: list}, 'projects.list': {data: [{id: 'p1', name: 'Aux'}]}, 'accounts.get': {data: account},
      'pairing.list': {data: pairing}, 'principals.list': {data: senders}}),
    './strip-markdown-DRcmtuJc.js#nr': queries({'policies.get': {data: policy}, 'remoteControl.status': {data: remote}, isExperimentalEligible: {data: true}}),
    './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync')},
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
    './link-q1zvRKtc.js#r': () => ({userId: '7'}), './Match-OymXmaXz.js#o': world.stub('spy:navigate')}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 60, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {list: [], account: {mode: 'local'}, remote: {status: 'disabled'}, view: 'manual-form', platform: 'discord'}),
      world => scene(world, {platform: 'telegram', view: 'manual-form', account: {mode: 'cloud', authStatus: 'active', subscriptionPlan: 'free'}}), world => ({...scene(world), state: [true]}),
      world => scene(world, {state: ['manual']})],
    props: [{accountId: 7, connection: connections[0], connectionId: 'c1', displayName: 'Aux Slack', platform: 'slack', projects: [{id: 'p1', name: 'Aux'}], initialTab: 'pairing',
      userId: '7', showUpgrade: true, fields: [{name: 'botToken', label: 'Bot Token', requiredOnUpdate: true}], mode: 'create', method: 'manual', title: 'Pairing', children: 'x',
      avatarUrl: 'a.png', name: 'Robert', id: 'remote-1', label: 'Grok Bot', url: 'https://x', email: 'bot@x', host: 'x', toggleDisabled: false},
      {accountId: 7, connection: connections[1], connectionId: 'c2', platform: 'telegram', projects: [], initialTab: 'credentials', mode: 'update', method: 'aux', name: 'Sam'},
      {accountId: 7, connection: connections[2], platform: 'discord', projects: [], initialTab: 'options'}]});
});

test('the Channels platform fields and setup match the supplied ones', async () => {
  const chunk = 'assets/channels-CJn5l9_T.js';
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const json = value => JSON.stringify(value, (_, item) => (Object.prototype.toString.call(item) === '[object Map]' ? [...item] : typeof item === 'function' ? 'fn' : item));
  for (const name of ['__kept_le', '__kept_E', '__pair_PLATFORM_SETUP', '__pair_NO_PROJECT', '__pair_CREDENTIALS_FORM_ID', '__pair_COVER', '__pair_REMOTE_MESSENGERS']) assert.equal(json(ours[name]), json(supplied[name]), name);
  for (const platform of ['slack', 'telegram', 'discord']) assert.equal(ours.__pair_guideUrl(platform), supplied.__pair_guideUrl(platform));
});

// Memory: files, a file in preview and edit, history entries with their changes and session, the
// settings, and Context Awareness with history, exclusions and its model.
const memoryChunks = ['assets/route-CJZWzPOz.js', 'assets/files-DqqxHH6i.js', 'assets/histories-CpU8qS5w.js', 'assets/settings-DguZi_c6.js', 'assets/import-DX5BoL4B.js',
  'assets/context-awareness-BocPTg31.js'];
test('the Memory pages render like the supplied ones with files, history and Context Awareness', async () => {
  const fileList = [{path: 'people/robert.md', name: 'robert.md', sizeBytes: 300000, absolutePath: '/m/people/robert.md', updatedAt: 5},
    {path: 'projects/aux.md', name: 'aux.md', sizeBytes: 300, absolutePath: '/m/projects/aux.md', updatedAt: 4}];
  // One answer for the file list in every shape its selects make: a list, and a lookup by path.
  const filesAnswer = list => Object.assign([...list], {fileByPath: new Map(list.map(file => [file.path, file])), filePaths: list.map(file => file.path)});
  const files = fileList;
  const change = {path: 'people/robert.md', addedLines: 3, removedLines: 1, beforeContent: 'a', afterContent: 'b', beforeSha256: 'x', afterSha256: 'y'};
  const entry = {id: 'h1', trigger: 'session_completed', elapsedMs: 65000, model: {provider: 'anthropic', modelId: 'opus'}, sessionId: 's1', createdAt: 5,
    usage: {input: 1200, output: 300, cacheRead: 10, cacheWrite: 0, totalTokens: 1510, costUsd: 0.02}, changes: [change, {...change, path: 'b.md', addedLines: 0}]};
  const history = [{id: 'w1', windowFrom: 1, windowTo: 2, summary: 'Wrote the **plan** in `docs`', applications: [{bundleId: 'com.apple.Safari', name: 'Safari'}], urlDomains: ['aux.example']}];
  const scene = (world, {list = files, path = 'people/robert.md', entryId = 'h1', enabled = true, state} = {}) => ({state, imports: {
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
    './strip-markdown-DRcmtuJc.js#tr': queries({listFiles: {data: filesAnswer(list)}, readFile: {data: {content: '# Robert\nLikes fish'}}, getDirectory: {data: '/w/memory'},
      'settings.getAll': {data: {memory: {enabled, generateFromChats: true, episodicRetentionDays: 30}, contextAwareness: {enabled, retentionDays: 14, excludedBundleIds: ['com.x']}}},
      summaryModelDefault: {data: {provider: 'openai', modelId: 'gpt'}}}),
    './strip-markdown-DRcmtuJc.js#nr': queries({getHistoryEntry: {data: entry}, historyStatus: {data: {firstEventAt: 1, permission: 'granted', paused: false}},
      historyList: {data: history}, listApplications: {data: [{bundleId: 'com.apple.Safari', name: 'Safari'}]}, appIcons: {data: {}}}),
    './strip-markdown-DRcmtuJc.js#$n': {data: {pages: [{items: [entry], nextCursor: null}]}, hasNextPage: false, isLoading: false, isError: false},
    './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync')},
    '*.useParams': () => ({userId: '7'}), '*.useSearch': () => ({path, historyEntryId: entryId}),
    './date-CxUVm-Dr.js#n.default': at => ({add: () => ({startOf: () => ({valueOf: () => 1, add: () => ({valueOf: () => 2})}), format: () => 'Mon'}),
      diff: () => 3, format: pattern => `${at} as ${pattern}`, fromNow: () => 'today'})}});
  const blocksByChunk = Object.fromEntries(memoryChunks.map(chunk => [chunk, ROUTES[chunk]]));
  await assertParity({blocksByChunk, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 60, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {list: [], path: undefined, entryId: undefined, enabled: false}), world => scene(world, {state: ['edit']}),
      world => ({...scene(world), state: [true]})],
    props: [{accountId: 7, file: files[0], entry, change, canOpenInEditor: true, label: 'Trigger', value: 'Session', messages: [{role: 'user', content: 'Hi'}], sessionId: 's1',
      mode: 'preview', item: history[0], appIcons: {}, text: 'Use `aux` now', retentionDays: 14, offset: 0, oldestOffset: -3, app: {bundleId: 'com.x', name: 'X'},
      domain: 'aux.example', excludedBundleIds: ['com.x'], children: 'x'}, {accountId: 7, file: files[1], mode: 'edit', entry: {...entry, changes: []}, canOpenInEditor: false,
      offset: -1, oldestOffset: -1, disabled: true}]});
});

test('the Memory helpers label, filter and key like the supplied ones', async () => {
  const world = createWorld();
  const pair = async chunk => evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const history = await pair('assets/histories-CpU8qS5w.js');
  world.enter({imports: {'./strip-markdown-DRcmtuJc.js#zt': message => message.content}});
  for (const trigger of ['session_completed', 'manual_extraction', 'manual_dreaming', 'memory_migration', 'manual_revert', 'other'])
    assert.equal(history.ours.__pair_triggerLabel(trigger), history.supplied.__pair_triggerLabel(trigger), trigger);
  const messages = [{role: 'user', content: 'You are now acting as the memory extraction subagent. Go.'}, {role: 'user', content: 'Hello'}, {role: 'assistant', content: ' DONE '}, {role: 'assistant', content: 'NONE'},
    {role: 'assistant', content: 'Saved two memories'}, {role: 'tool', content: 'x'}];
  for (const message of messages) assert.equal(history.ours.__pair_isShownMessage(message), history.supplied.__pair_isShownMessage(message), message.content);
  assert.equal(JSON.stringify(history.ours.__pair_INTERNAL_PROMPTS), JSON.stringify(history.supplied.__pair_INTERNAL_PROMPTS));
  const awareness = await pair('assets/context-awareness-BocPTg31.js');
  for (const exclusion of [{scope: 'app', bundleId: 'com.x'}, {scope: 'url', urlDomain: 'aux.example'}])
    assert.equal(awareness.ours.__pair_exclusionKey(exclusion), awareness.supplied.__pair_exclusionKey(exclusion));
  for (const name of ['__pair_PAUSE_OPTIONS', '__pair_NEVER', '__pair_ILLUSTRATION']) assert.equal(JSON.stringify(awareness.ours[name]), JSON.stringify(awareness.supplied[name]), name);
  world.enter({imports: {'./date-CxUVm-Dr.js#n.default': () => ({add: days => ({format: () => `day ${days}`, startOf: () => ({valueOf: () => days, add: () => ({valueOf: () => days + 1})})})})}});
  for (const offset of [0, -1, -4]) {
    assert.equal(awareness.ours.__pair_dayName(offset), awareness.supplied.__pair_dayName(offset), String(offset));
    assert.equal(JSON.stringify(awareness.ours.__pair_dayRange(offset)), JSON.stringify(awareness.supplied.__pair_dayRange(offset)), String(offset));
  }
});

// General: preferred languages kept unique and summarized, import progress, spell check, versions
// and the background service's lag; then the page with account, browser and service data.
test('General settings keep languages, label versions and render like the supplied ones', async () => {
  const chunk = 'assets/general-3dgRbrRk.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const languages = [{code: 'en-US', displayName: 'English (United States)', nativeDisplayName: 'English (United States)'},
    {code: 'en', displayName: 'English', nativeDisplayName: 'English'}, {code: 'fr', displayName: 'French', nativeDisplayName: 'français'},
    {code: 'fr-CA', displayName: 'French', nativeDisplayName: 'français'}, {code: 'de', displayName: 'German', nativeDisplayName: 'Deutsch'}];
  same('__pair_uniqueLanguageCodes', ['en-US', ' EN-us ', 'fr-CA', 'fr', 'xx', 'de'], languages);
  same('__pair_uniqueLanguages', languages);
  for (const code of ['fr-CA', 'en', 'xx-YY', 'DE']) same('__pair_findLanguage', code, languages);
  for (const language of languages) same('__pair_preferredVariant', language, languages);
  for (const code of ['en-US', 'en', ' Fr-ca ']) { same('__pair_baseLanguage', code); same('__pair_normalize', code); }
  for (const args of [[['en', 'fr'], languages, true, true], [['en', 'fr', 'de', 'xx'], languages, true, true], [['en', 'fr', 'de'], languages, true, true], [[], languages, true, true], [['en'], languages, false, true],
    [['en'], languages, true, false]]) same('__pair_languagesSummary', ...args);
  for (const [a, b] of [[['a', 'b'], ['a', 'b']], [['a'], ['a', 'b']], [['b', 'a'], ['a', 'b']]]) same('__pair_sameLanguages', a, b);
  for (const [state, status] of [[{progress: 0.42}, 'running'], [{progress: 57}, 'running'], [undefined, 'succeeded'], [undefined, 'running']]) same('__pair_importPercent', state, status);
  for (const value of [false, true, undefined, 'x']) same('__pair_captureEnabled', value);
  for (const [available, settings] of [[false], [true], [true, {spellCheckSupported: true}], [true, {spellCheckSupported: false}]]) same('__pair_spellCheckLabel', available, settings);
  for (const version of ['dev', 'v1.2.3', '1.2.3', undefined, '']) { same('__pair_versionLabel', version); same('__pair_cleanVersion', version && ` ${version} `); }
  for (const name of ['__pair_IMPORT_KINDS', '__pair_CAPTURE_KEY', '__pair_LAG_KEY', '__kept_Pr', '__pair_SUPPORTED_LANGUAGES_KEY'])
    assert.equal(JSON.stringify(ours[name] instanceof Map ? [...ours[name]] : ours[name]), JSON.stringify(supplied[name] instanceof Map ? [...supplied[name]] : supplied[name]), name);
  const lag = side => { const store = new Map(); world.enter({imports: {'localStorage.getItem': key => store.get(key) ?? null, 'localStorage.setItem': (key, value) => store.set(key, value)}});
    return JSON.stringify([side.__pair_isSameLag(true, 'a'), side.__pair_isSameLag(true, 'a'), side.__pair_isSameLag(true, 'b'), side.__pair_isSameLag(false, 'b'), [...store]]); };
  assert.equal(lag(ours), lag(supplied));
  const byKey = answers => options => { const key = (options?.queryKey ?? []).join('.') || String(options?.[STUB_PATH] ?? options);
    return Object.entries(answers).find(([part]) => key.includes(part))?.[1] ?? {data: undefined, isLoading: true}; };
  const scene = (world, {account = {mode: 'cloud', authStatus: 'active', email: 'r@aux.example', name: 'Robert'}, supported = true} = {}) => ({imports: {
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
    './strip-markdown-DRcmtuJc.js#tr': byKey({'accounts.get': {data: account}}),
    './strip-markdown-DRcmtuJc.js#nr': byKey({languageSettings: {data: {preferredLanguages: ['en-US', 'fr'], spellCheckSupported: supported}}, supportedLanguages: {data: languages},
      searchEngines: {data: {engines: [{id: 'g', name: 'Google'}, {id: 'd', name: 'DuckDuckGo'}], defaultId: 'd'}}, autoPipEnabled: {data: true}, defaultBrowserState: {data: {isDefault: false}},
      version: {data: '1.4.0'}, 'capture.enabled': {data: true}, 'daemon.health': {data: {version: '1.4.0', startedAt: 'x'}}, 'accounts.get': {data: account}}),
    './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync')}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 60, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {account: {mode: 'local'}, supported: false}),
      world => scene(world, {account: {mode: 'cloud', authStatus: 'paused'}}), world => ({...scene(world), state: [true]})],
    props: [{children: 'card', className: 'probe', config: {kind: 'bookmarks', title: 'Import bookmarks'}, description: 'From Chrome', title: 'Detected browser',
      label: 'Bookmarks', status: 'running', progress: 0.5, isSaving: false, languages, open: true, preferredLanguages: ['en-US', 'fr'], code: 'fr', index: 1, selectedCodes: ['en-US', 'fr']},
      {status: 'succeeded', error: null, languages: [], preferredLanguages: [], code: 'xx', index: 0, open: false}]});
});


// The task session page: a running chat in a project, started by another chat from a channel, with
// agent tabs (owned and borrowed), outputs (an app bundle, nested artifacts), its routines and a
// standalone routine's details; the share link, the menu and the rename dialog; docked and floating.
test('the task session page renders like the supplied one with tabs, outputs, routines and sharing', async () => {
  const chunk = 'assets/_sessionId-ClN_BWh5.js';
  const SM = './strip-markdown-DRcmtuJc.js';
  const tabs = [{sessionTabId: 'st1', targetId: 'T1', url: 'https://docs.example/a#top', iconUrl: 'https://docs.example/i.png', title: 'Docs', ownership: 'owned', createdAt: '2026-10-30T09:00:00Z'},
    {sessionTabId: 'st2', targetId: null, url: 'https://blog.example/b', title: '', ownership: 'owned', createdAt: '2026-10-30T10:00:00Z'},
    {sessionTabId: 'st3', targetId: 'T3', url: 'https://mail.example', title: 'Mail', ownership: 'borrowed', createdAt: '2026-10-30T08:00:00Z'}];
  const files = ['output/report.md', 'artifacts/Tool.app/Contents/Info.plist', 'artifacts/docs/b.md', 'artifacts/docs/a.md', 'artifacts/notes', 'scratch.tmp'];
  const routine = {id: 'r1', name: 'Morning brief', status: 'active', environment: 'device', deviceId: 'd2', isCurrentDevice: false, lastRunAt: '2026-10-30T08:00:00Z', nextRunAt: null};
  const routines = [routine, {id: 'r2', name: 'Weekly', status: 'paused'}, {id: 'r3', name: 'Done', status: 'completed'}];
  const element = {getBoundingClientRect: () => ({right: 900, bottom: 64, width: 640}), closest: () => element, contains: () => false};
  const session = (extra = {}) => ({id: 's1', title: 'Plan the trip', status: 'running', incognito: false, messages: [{role: 'user'}], projectId: 'p1',
    trigger: {type: 'channel', channel: 'slack'}, activeTabTargetId: 'T1', ...extra});
  const context = (world, extra = {}) => ({sidePanelMode: 'open', sidePanelRef: {current: null}, setSidePanelDockLocked: world.stub('spy:dockLocked'),
    setSidePanelRef: world.stub('spy:setSidePanelRef'), syncSidePanelCollapsed: world.stub('spy:syncCollapsed'), toggleSidePanel: world.stub('spy:toggle'),
    floatAnchorElement: element, floatShellRef: {current: element}, isDocked: false, layoutElement: element, setFloatAnchorElement: world.stub('spy:anchor'),
    setLayoutElement: world.stub('spy:layout'), sessionId: 's1', userId: '7', playground: undefined, navigateToSession: world.stub('spy:navigateToSession'), ...extra});
  const scene = (world, {current = session(), share = {url: 'https://share.example/s1'}, local = true, wide = true, list = files, ctx = {}, mode = 'open'} = {}) => ({
    context: context(world, ctx), imports: {
      './context-q_vohNW8.js#n': {currentSession: current, create: world.stub('spy:create')}, [`${SM}#Kt`]: {accountId: 7},
      [`${SM}#jn`]: {host: {kind: local ? 'local' : 'cloud'}, can: name => name === 'tabs'}, [`${SM}#g`]: status => status === 'running',
      [`${SM}#Ht`]: {capture: world.stub('spy:capture')}, [`${SM}#M`]: {confirm: world.stub('spy:confirm')}, [`${SM}#N`]: {broadcast: world.stub('spy:broadcast')},
      [`${SM}#mt`]: path => !path.endsWith('.tmp'), [`${SM}#dt`]: path => path.startsWith('artifacts/'), [`${SM}#ct`]: path => path.split('/').pop(),
      [`${SM}#en`]: true, [`${SM}#pr`]: {invalidateQueries: world.stub('spy:invalidate'), refetchQueries: world.stub('spy:refetch')},
      './error-tracking-B1YG2RRM.js#u': {copy: world.stub('spy:copy')}, './provider-Cw0zhujt.js#X': {mode}, './utils-BEeo4-cB.js#n': true,
      './session-composer-Dc0LRfZA.js#H': (list, active) => ({tabs: list.map(tab => ({...tab, active: tab.targetId === active}))}),
      './favicon-Dpszfa2o.js#i': (url, icon) => [icon, `${url}/favicon.ico`].filter(Boolean), './tool-definition-registry-Cc6FCFb2.js#f': item => `Repeats for ${item.name}`,
      './date-CxUVm-Dr.js#n.default': at => ({format: pattern => `${at} as ${pattern}`}), 'window.matchMedia': () => ({matches: wide}),
      './extension-main-Dz1-AsCT.js#b.useParams': () => ({sessionId: 's1', userId: '7'}), './extension-main-Dz1-AsCT.js#b.useSearch': () => ({playground: undefined, [`${SM}#Fn`]: 'host-key'}),
      './tag-icon-DeMC7uIN.js#f': () => ({reset: world.stub('spy:reset'), handleSubmit: submit => submit, register: name => ({name}), watch: () => ' Plan '}),
      [`${SM}#tr`]: {data: {model: 'opus', projectId: 'p1'}}, 'chrome.debugger.getTargets': async () => [{id: 'T1', tabId: 11}, {id: 'T3', tabId: 13}],
      'chrome.tabs.update': async id => ({id, windowId: 2}), 'chrome.tabs.query': async () => [], 'chrome.tabs.create': async ({url}) => ({id: 31, url, windowId: 3}),
      'chrome.tabs.get': async id => ({id, groupId: 5}), 'chrome.tabGroups.get': async id => ({id, title: 'Agent Tabs'}), 'chrome.tabs.remove': async () => {},
      'chrome.windows.update': async () => {},
      [`${SM}#er`]: options => ({isPending: false, mutateAsync: world.stub('spy:mutateAsync'), name: queryName(options)}),
      [`${SM}#nr`]: queries({shareStatus: {data: share, isPending: false, refetch: world.stub('spy:refetchShare')}, 'tabs.list': {data: tabs},
        'routines.summary': {data: routine}, 'auth.devices': {data: [{id: 'd2', deviceName: 'Studio', isCurrent: false}], isLoading: false},
        'routines.list': {data: routines}, 'files.list': {data: list}, 'projects.get': {data: {id: 'p1', name: 'Aux', color: 'blue', icon: 'folder'}},
        listPreviewItems: {data: {id: 's0', title: 'Parent chat', name: '#general'}}}),
    }});
  const tree = [{type: 'file', name: 'report.md', path: 'output/report.md', data: 'output/report.md', children: []},
    {type: 'directory', name: 'docs', path: 'artifacts/docs', children: [{type: 'file', name: 'a.md', path: 'artifacts/docs/a.md', data: 'artifacts/docs/a.md', children: []}]}];
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 700, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world),
      world => scene(world, {current: session({trigger: {type: 'standalone-routine', routineId: 'r1'}, status: 'idle', projectId: null}), share: null, ctx: {isDocked: true}}),
      world => scene(world, {current: session({incognito: true, trigger: {type: 'agent', starterId: 's0'}}), local: false, wide: false, list: [], mode: 'collapsed',
        ctx: {sidePanelMode: 'collapsed', floatAnchorElement: null}}),
      world => scene(world, {current: session({status: 'idle', messages: [], trigger: undefined, title: ''})}),
      world => ({...scene(world), state: [true], event: {target: element, currentTarget: element, key: 'Enter', preventDefault: world.stub('spy:preventDefault'),
        stopPropagation: world.stub('spy:stopPropagation')}})],
    props: [world => ({sessionId: 's1', userId: '7', navigateToSession: world.stub('spy:navigate'), enabled: true, routineId: 'r1', datetime: '2026-10-30T08:00:00Z',
      empty: 'Not run yet', item: tabs[0], previewEnabled: true, canSwitchToTab: true, onActivate: world.stub('spy:activate'), onKeyDownActivate: world.stub('spy:keyDown'),
      onClose: world.stub('spy:close'), url: tabs[0].url, faviconUrl: tabs[0].iconUrl, nodes: tree, previewFilesByPath: new Map([['output/report.md', {previewUrl: 'blob:r'}]]),
      osActionsEnabled: true, onOpenFile: world.stub('spy:openFile'), open: true, onOpenChange: world.stub('spy:openChange'), files, tabs, filesOverride: files, children: 'chat',
      options: {outputArtifacts: false, streaming: true, subagentSeed: 3, subagents: true, todoList: false}, playgroundOptions: {streaming: false},
      onPlaygroundOptionsChange: world.stub('spy:playground'), onChange: world.stub('spy:change')}),
      {enabled: false, previewFiles: [{metadata: {path: 'output/a.md'}, previewUrl: 'blob:a'}, {metadata: {path: 'x.tmp'}}], item: tabs[1], canSwitchToTab: false,
        previewEnabled: false, nodes: [], previewFilesByPath: new Map(), datetime: null, empty: 'Not scheduled', open: false, files: [], tabs: [tabs[2]], className: 'probe'}]});
});

test('the task session page helpers share, address, open tabs and build output trees like the supplied ones', async () => {
  const chunk = 'assets/_sessionId-ClN_BWh5.js';
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  world.enter({imports: {'./strip-markdown-DRcmtuJc.js#g': status => status === 'running', './strip-markdown-DRcmtuJc.js#mt': () => true,
    './strip-markdown-DRcmtuJc.js#dt': path => path.startsWith('artifacts/'), './strip-markdown-DRcmtuJc.js#ct': path => path.split('/').pop(),
    './favicon-Dpszfa2o.js#r': url => new URL(url).hostname}});
  for (const [s, hasTurns] of [[{incognito: true, status: 'idle', messages: []}, false], [{status: 'running', messages: []}, true], [{status: 'idle', messages: []}, false],
    [{status: 'idle', messages: []}, true], [{status: 'idle', messages: [{}]}, false]]) same('__pair_shareBlockedReason', s, hasTurns);
  for (const url of ['https://a.example/p?q=1#frag', 'https://u:p@a.example:8443/x/#', 'not a url', 'chrome://newtab/']) { same('__pair_withoutHash', url); same('__pair_pageAddress', url); }
  for (const name of ['Tool.app', 'Widget.APPEX', 'notes.md', 'Kit.framework', 'x.xpcx']) same('__pair_isBundle', name);
  for (const status of ['running', 'suspended', 'idle', undefined]) same('__pair_isLiveStatus', status);
  for (const tab of [{title: 'Docs', url: 'https://d.example'}, {title: '', url: 'https://d.example/x'}, {}]) same('__pair_tabTitle', tab);
  same('__pair_fileTree', ['output/z.md', 'output/a.md', 'artifacts/Tool.app/Contents/Info.plist', 'artifacts/docs/b.md', 'artifacts/docs/a.md', 'artifacts/zeta', 'artifacts/Kit.framework']);
  same('__pair_fileTree', []);
  for (const input of [{files: ['a'], tabs: []}, {files: [], tabs: [{ownership: 'borrowed'}]}, {files: [], tabs: [{ownership: 'owned'}]}]) same('__pair_hasPinnedContent', input);
  for (const name of ['__pair_SIDE_PANEL_SIZE', '__pair_SIDE_PANEL_WIDTH', '__pair_TAB_QUERY_OPTIONS', '__pair_PLAYGROUND_DEFAULTS', '__pair_PLAYGROUND_SWITCHES',
    '__pair_PLAYGROUND_TODOS', '__pair_PLAYGROUND_MARKDOWN', '__pair_PLAYGROUND_CSV', '__pair_BUNDLE_EXTENSIONS', '__pair_CRUMB_CLASS', '__pair_PANEL_TRANSITION',
    '__pair_TAB_POLL_MS', '__pair_TAB_REFRESH_DELAY_MS', '__pair_DOCKED_MIN_WIDTH', '__pair_WIDE_MIN_WIDTH', '__pair_FLOAT_INSET', '__pair_PLAYGROUND_ENABLED'])
    assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  assert.deepEqual([...ours.__pair_TAB_EVENTS], [...supplied.__pair_TAB_EVENTS]);
  // Opening and closing tabs through a fake tabs API: a target that has a tab, a page already open
  // under another hash, a new page, a borrowed group, and an aborted command.
  const run = async (side, command, {targets = [{id: 'T1', tabId: 11}, {id: 'T2', tabId: 12}], open = [{id: 21, url: 'https://a.example/p#x', windowId: 2}],
    group = 'Agent Tabs', abort = false} = {}) => {
    const calls = [];
    const record = (name, value) => (...args) => (calls.push([name, ...args]), Promise.resolve(typeof value === 'function' ? value(...args) : value));
    world.enter({imports: {'chrome.tabs.get': record('get', id => ({id, groupId: 5, active: id === 11})), 'chrome.tabGroups.get': record('group', id => ({id, title: group})),
      'chrome.tabs.remove': record('remove'), 'chrome.tabs.update': record('update', id => ({id, windowId: 2})), 'chrome.windows.update': record('focus'),
      'chrome.tabs.query': record('query', open), 'chrome.tabs.create': record('create', ({url}) => ({id: 31, url, windowId: 3})),
      'chrome.debugger.getTargets': record('targets', targets)}});
    const signal = abort ? {aborted: true} : undefined;
    try { return JSON.stringify([await side.__pair_controlChromeTab(command, signal, command.windowId), calls]); } catch (error) { return JSON.stringify([error.name, error.message, calls]); }
  };
  for (const [command, options] of [[{action: 'open', targetId: 'T1', url: 'https://a.example/p'}], [{action: 'open', targetId: 'T9', url: 'https://a.example/p#y'}],
    [{action: 'open', url: 'https://new.example/', windowId: 4}], [{action: 'close', targetId: 'T1', skipIfActive: true}], [{action: 'close', targetId: 'T2'}],
    [{action: 'close', targetId: 'T2'}, {group: 'Mine'}], [{action: 'close', targetId: 'T9'}], [{action: 'open', targetId: 'T1', url: 'https://a.example'}, {abort: true}]])
    assert.equal(await run(ours, command, options), await run(supplied, command, options), JSON.stringify(command));
  for (const command of [{action: 'open'}, {action: 'close'}]) same('__pair_canControlChromeTabs', command);
});

// The prompts that take over the composer: an action to confirm, two questions (one multiple
// choice) and a permission for a tool, a file, the browser and the network, from the chat and from
// a subagent; then the chat input's attachment and message helpers on real attachments.
const PERMISSION = 'assets/permission-approval-D-GTf91U.js';
const confirmation = {kind: 'action-confirmation', id: 'su1', toolCallId: 'c1', request: {title: 'Send the email', message: 'To: r@aux.example\nSubject: Plan', artifact: {type: 'email', to: 'r@aux.example'}}};
const questions = [{header: 'Scope', question: 'Which files?', multiple: false, options: [{label: 'All', description: 'Every file'}, {label: 'Changed'}]},
  {header: 'Format', question: 'Which formats?', multiple: true, options: [{label: 'PDF'}, {label: 'CSV'}]}, {header: 'Note', question: 'Anything else?', options: []}];
const question = {kind: 'ask-user-question', id: 'su2', toolCallId: 'c2', request: {questions}};
const scopes = [{type: 'tool', tool: 'bash', args: {command: 'ls -la'}}, {type: 'file', path: '/w/aux/README.md', mode: 'read'}, {type: 'file', path: '/w/aux/out.md', mode: 'write'},
  {type: 'browser', action: 'modify', url: 'https://mail.example'}, {type: 'browser', action: 'download', url: 'https://files.example/a.zip'}, {type: 'network', url: 'https://api.example'}];
const approval = (scope, source) => ({kind: 'approval', id: 'su3', toolCallId: 'c3', createdAt: 5, request: {scope, source}});

test('the composer prompts confirm, ask and approve like the supplied ones', async () => {
  const SM = './strip-markdown-DRcmtuJc.js';
  const scene = (world, {suspension = confirmation, text = '', session = {}, state, key = 'Enter'} = {}) => ({state,
    context: {text, getText: () => text, setText: world.stub('spy:setText'), registerResponseSubmit: world.stub('spy:registerSubmit'),
      setResponsePending: world.stub('spy:pending'), setResponseSubmitLabel: world.stub('spy:submitLabel')},
    event: {key, metaKey: key === 'Enter', shiftKey: false, nativeEvent: {isComposing: false}, isComposing: false, defaultPrevented: false, preventDefault: world.stub('spy:preventDefault'),
      stopPropagation: world.stub('spy:stopPropagation'), target: {value: 'typed', closest: () => null}},
    imports: {'./context-q_vohNW8.js#n': {currentSession: {id: 's1', suspension, ...session}}, [`${SM}#Kt`]: {accountId: 7},
      [`${SM}#er`]: options => ({isPending: false, mutateAsync: world.stub('spy:mutateAsync'), name: queryName(options)}),
      [`${SM}#pr`]: {setQueryData: world.stub('spy:setQueryData'), invalidateQueries: world.stub('spy:invalidate')},
      './file-attachments-D5m1O8aA.js#a': value => Boolean(value?.kind), './platform-CX_yPATJ.js#i': event => Boolean(event?.metaKey),
      './platform-CX_yPATJ.js#n': shortcut => shortcut.replace('Meta+', '⌘'), './tool-definition-registry-Cc6FCFb2.js#t': name => ({icon: `icon:${name}`, title: call => `Run ${call.name}`}),
      './tool-definition-registry-Cc6FCFb2.js#n': call => ({...call, input: call.arguments}), './tool-definition-registry-Cc6FCFb2.js#r': (value, call) => (typeof value === 'function' ? value(call) : value),
      './tag-icon-DeMC7uIN.js#f': () => ({watch: () => ' instead ', handleSubmit: submit => submit, register: name => ({name})})}});
  await assertParity({blocksByChunk: {[PERMISSION]: ROUTES[PERMISSION]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 4000, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {text: 'Do it tomorrow'}), world => scene(world, {suspension: question}),
      world => scene(world, {suspension: question, text: 'my own answer', state: [1, {0: {type: 'select', items: ['Changed']}, 1: {type: 'select', items: ['PDF', 'CSV']}}, true]}),
      world => scene(world, {suspension: approval(scopes[0])}), world => scene(world, {suspension: approval(scopes[1], {taskId: 'task-9'})}),
      world => scene(world, {suspension: approval(scopes[3]), session: {parentId: 'p1', trigger: {type: 'subagent'}}}),
      world => scene(world, {suspension: approval(scopes[5]), key: 'ArrowDown'}), world => scene(world, {suspension: question, key: 'ArrowUp', state: [2, {}, false, true]}),
      world => scene(world, {suspension: null, state: [true]})],
    props: [world => ({className: 'probe', request: confirmation.request, sessionId: 's1', onSubmit: world.stub('spy:onSubmit'), compact: false, isBusy: false, questions,
      onCancel: world.stub('spy:onCancel'), scope: scopes[0], toolCallId: 'c3', sourceTaskId: undefined, onResolve: world.stub('spy:onResolve'), delegated: false, index: 2,
      label: 'All', multiple: true, selected: true, muted: false, value: 'typed', visible: true, onActivate: world.stub('spy:onActivate'), onChange: world.stub('spy:onChange'),
      disabled: false}),
      world => ({request: {...confirmation.request, artifact: undefined}, compact: true, isBusy: true, questions: questions.slice(0, 1), scope: scopes[2], sourceTaskId: 'task-9',
        delegated: true, onResolve: world.stub('spy:onResolve'), index: 1, label: 'Changed', multiple: false, selected: false, muted: true, visible: false, shortcut: 'Esc'}),
      ...scopes.slice(3).map(scope => ({scope, toolCallId: 'c4', delegated: false, label: 'Access', value: scope.url})),
      {scope: scopes[0], toolCallId: 'c5', delegated: true}, {questions: [], label: 'x', value: ''}].map(props => world => {
      const given = typeof props === 'function' ? props(world) : props;
      return {onResolve: world.stub('spy:onResolve'), onSubmit: world.stub('spy:onSubmit'), onCancel: world.stub('spy:onCancel'), ...given};
    })});
});

test('the chat input helpers keep context, summarize attachments and step through answers like the supplied ones', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: PERMISSION, text: textOf(PERMISSION), blocks: ROUTES[PERMISSION], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  const tab = {id: 'tab:1', type: 'tab', targetId: 'T1', name: 'Docs', url: 'https://docs.example', faviconUrl: 'f.png'};
  const page = {id: 'sel:1', type: 'selection', requestKey: 'page:1', name: 'Picked', text: 'Picked text', selectionKind: 'text', sourceKind: 'page'};
  const region = {id: 'sel:2', type: 'selection', requestKey: 'page:2', name: 'Region', selectionKind: 'region', elementSummary: 'A table with 3 rows', sourceKind: 'page', elements: [{tag: 'table'}]};
  const chat = {id: 'sel:3', type: 'selection', requestKey: 'chat:1', name: 'From chat', text: 'x', sourceKind: 'chat'};
  const file = {id: 'f1', type: 'file', name: 'a.pdf', mimeType: 'application/pdf', path: '/w/a.pdf', data: 'AA'};
  const folder = {id: 'd1', type: 'directory', name: 'docs', path: '/w/docs'};
  for (const text of ['  short  ', 'x'.repeat(72), `${'word '.repeat(20)}end`, '   ', '\n\tmulti\n line ']) same('__pair_selectionName', text);
  const context = {tabAttachment: tab, selectionAttachment: page, suppressedTabTargetIds: new Set(), suppressedSelectionRequestKey: null};
  for (const [list, ctx] of [[[tab, page, file], context], [[file], context], [[tab, file], {...context, tabAttachment: {...tab, name: 'Docs 2'}}],
    [[{...tab, targetId: 'T2'}, page], context], [[tab, page], {...context, suppressedTabTargetIds: new Set(['T1'])}], [[page], {...context, suppressedSelectionRequestKey: 'page:1'}],
    [[], {...context, tabAttachment: null, selectionAttachment: null}], [[chat, region], context]])
    assert.equal(JSON.stringify(ours.__kept_ue(list, ctx)), JSON.stringify(supplied.__kept_ue(list, ctx)));
  for (const [a, b] of [[tab, {...tab}], [tab, {...tab, url: 'x'}], [region, {...region, elements: []}], [file, {...file}], [folder, {...folder, path: '/x'}], [file, folder]])
    same('__pair_sameAttachment', a, b);
  for (const list of [[file, folder, {...file, id: 'f2', name: 'b.txt'}], [page], [region], [page, region, file], [chat], []]) {
    same('__pair_attachmentsSummary', list);
    for (const plainText of ['', '  Hello  ']) {
      const at = Date.now();
      same('__pair_userMessage', {plainText}, list);
      assert.equal(JSON.stringify(ours.__kept_An({plainText}, list)), JSON.stringify(supplied.__kept_An({plainText}, list)), `${at}`);
    }
  }
  const state = {attachments: [file], uploadQueue: ['u'], text: 'a', richInputAttachments: [], initialRichInputSnapshot: null};
  for (const action of [{type: 'richInputSummary', richInputAttachments: [tab], text: 'b'}, {type: 'updateAttachments', update: list => [...list, folder]},
    {type: 'uploadQueue', uploadQueue: []}, {type: 'resetScope', attachments: [], initialRichInputSnapshot: {doc: 1}, richInputAttachments: [], text: '', uploadQueue: ['kept']}, {type: 'other'}])
    assert.equal(JSON.stringify(ours.__kept_In(state, action)), JSON.stringify(supplied.__kept_In(state, action)), action.type);
  for (const value of [chat, page, tab]) assert.equal(ours.__kept_Ee(value), supplied.__kept_Ee(value));
  same('__kept_we', {doc: {type: 'doc', content: [1]}});
  assert.equal(ours.__kept_kn('{"a":1}', {doc: {a: 1}}), supplied.__kept_kn('{"a":1}', {doc: {a: 1}}));
  // Answers: defaults from first options, a step's state, toggling multiple choice, custom text, and submitting.
  const defaults = ours.__pair_defaultAnswers(questions);
  same('__pair_defaultAnswers', questions);
  same('__pair_questionsKey', questions);
  const answers = [{}, {0: {type: 'select', items: ['Changed']}, 1: {type: 'select', items: []}}, {1: {type: 'custom', content: '  both  '}, 2: {type: 'custom', content: 'Thanks'}}];
  for (const given of answers) {
    same('__pair_answersFor', questions.slice(0, 2), given, defaults);
    same('__pair_allAnswered', questions, given, defaults);
    for (const step of [0, 1, 2, 3]) { same('__pair_questionState', {answers: given, currentStep: step, defaultAnswers: defaults, questions}); same('__pair_answerAt', given, defaults, step); }
  }
  for (const answer of [{type: 'select', items: []}, {type: 'select', items: ['A'], customDraft: 'd'}, {type: 'custom', content: ' '}, {type: 'custom', content: 'x'}]) {
    same('__pair_isAnswered', answer); same('__pair_customText', answer);
    for (const [q, label] of [[questions[0], 'All'], [questions[1], 'PDF'], [questions[1], 'CSV']]) same('__pair_toggleOption', {currentAnswer: answer, currentQuestion: q, label});
  }
  same('__pair_toggleOption', {currentAnswer: {type: 'select', items: ['PDF', 'CSV']}, currentQuestion: questions[1], label: 'PDF'});
  for (const event of [{key: 'Enter', shiftKey: false, nativeEvent: {isComposing: false}}, {key: 'Enter', shiftKey: true, nativeEvent: {}}, {key: 'Enter', nativeEvent: {isComposing: true}}, {key: 'a', nativeEvent: {}}])
    same('__pair_isPlainEnter', event);
  for (const name of ['__pair_PERMISSION_CHOICES', '__pair_EMPTY_ANSWER', '__pair_SELECTION_NAME_MAX']) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
});

// Plugins › MCPs: a local stdio server, an OAuth server that is connected but needs authorizing
// (and matches a preset), a disabled one with request headers, presets to connect, cached tools,
// and the add and edit dialog for each transport and auth type.
const MCPS = 'assets/mcps-DmPp5oo9.js';
const mcpServers = {
  files: {enabled: true, transport: 'stdio', command: 'npx', args: ['-y', '@example/files', '--root', '/w/my docs'], env: {TOKEN: 'a=b'}},
  linear: {enabled: true, transport: 'streamable-http', url: 'https://MCP.Linear.app/mcp/', auth: {type: 'auto', clientId: 'client-1'}},
  intranet: {enabled: false, transport: 'streamable-http', url: 'http://localhost:8080/mcp', auth: {type: 'headers', headers: {Authorization: 'Bearer x', 'X-Key': 'v'}}},
};
const mcpPresets = [{name: 'Linear', description: 'Issues', url: 'https://linear.app', server: {transport: 'streamable-http', url: 'https://mcp.linear.app/mcp', auth: {type: 'auto'}}},
  {name: 'Granola', description: 'Notes', url: 'https://granola.ai', server: {transport: 'streamable-http', url: 'https://mcp.granola.ai/mcp', auth: {type: 'auto'}}},
  {name: 'Files', description: 'Local files', server: {transport: 'stdio', command: 'npx', args: ['-y', '@example/files', '--root', '/w/my docs']}}];
const inventories = {files: {tools: [{name: 'read_file', description: 'Reads a file'}, {name: 'list'}], refreshedAt: '2026-10-30T09:00:00Z'}, linear: {tools: [{name: 'create_issue'}], refreshedAt: '2026-10-29T00:00:00Z'}};

test('Plugins › MCPs renders servers, presets and the server dialog like the supplied page', async () => {
  const SM = './strip-markdown-DRcmtuJc.js';
  const scene = (world, {status = {status: 'connected', authStatus: 'required', message: 'Signed in as r'}, values = {transport: 'stdio', authType: 'auto'}, state} = {}) => ({state,
    renderProps: {field: {value: values.transport, onChange: world.stub('spy:fieldChange')}},
    imports: {[`${SM}#tr`]: {data: {mcp: {servers: mcpServers, inventories}}}, [`${SM}#nr`]: {data: status}, [`${SM}#M`]: {confirm: world.stub('spy:confirm')},
      [`${SM}#er`]: options => ({isPending: false, mutate: world.stub('spy:mutate'), mutateAsync: world.stub('spy:mutateAsync'), name: queryName(options)}),
      [`${SM}#pr`]: {setQueryData: world.stub('spy:setQueryData'), removeQueries: world.stub('spy:removeQueries'), invalidateQueries: world.stub('spy:invalidate')},
      './extension-main-Dz1-AsCT.js#r.useParams': () => ({userId: '7'}), './types-CMWBt-OE.js#r.map': fn => mcpPresets.map(fn),
      './tag-icon-DeMC7uIN.js#f': () => ({handleSubmit: submit => submit, formState: {isValid: true, isSubmitting: false}, control: 'control'}),
      './tag-icon-DeMC7uIN.js#p': () => ({control: 'control', reset: world.stub('spy:reset'), getValues: name => (name === 'name' ? 'files' : values[name]), register: name => ({name})}),
      './tag-icon-DeMC7uIN.js#m': ({name}) => values[name], './tag-icon-DeMC7uIN.js#d': ({name}) => ({field: {name, value: 'files', onChange: world.stub('spy:nameChange')}})}});
  const list = Object.entries(mcpServers).map(([name, server]) => ({name, ...server}));
  const value = (world, server, connection) => ({state: {connection, inventory: inventories[server.name], server},
    actions: Object.fromEntries(['cancel', 'connect', 'delete', 'disconnect', 'edit', 'refresh', 'test', 'toggle', 'viewTools'].map(name => [name, world.stub(`spy:${name}`)])),
    meta: {connectionPending: false, refreshing: server.name === 'files', testing: false, toggling: false}});
  await assertParity({blocksByChunk: {[MCPS]: ROUTES[MCPS]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 900, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {status: {status: 'connecting'}, values: {transport: 'streamable-http', authType: 'headers'}}),
      world => scene(world, {status: {status: 'unreachable', message: 'Timed out'}, values: {transport: 'streamable-http', authType: 'auto'}}),
      world => scene(world, {status: {status: 'invalid_server'}, values: {transport: 'streamable-http', authType: 'none'}}),
      world => ({...scene(world), context: value(world, list[1], {status: 'connected', authStatus: 'required'})}),
      world => ({...scene(world), context: value(world, list[0], undefined)}),
      world => ({...scene(world, {status: undefined}), context: value(world, list[2], {status: 'connected', authStatus: 'ok', message: 'Ready'}), state: [{mode: 'edit', name: 'linear', draft: {}}]})],
    props: [world => ({accountId: 7, servers: list, inventories, existingNames: new Set(['files', 'Linear']), preset: mcpPresets[1], server: list[1], inventory: inventories.linear,
      onEdit: world.stub('spy:onEdit'), state: {mode: 'create', draft: {name: '', transport: 'stdio', command: '', envText: ''}}, onSave: world.stub('spy:onSave'), mode: 'create',
      open: true, serverName: 'linear', connection: {status: 'connected', authStatus: 'required'}, children: 'row'}),
      world => ({accountId: 7, servers: [], inventories: {}, existingNames: new Set(), preset: mcpPresets[2], server: undefined, inventory: undefined, state: {mode: 'edit', name: 'x', draft: {}},
        mode: 'edit', open: false, serverName: 'files', connection: {status: 'unreachable'}, onSave: world.stub('spy:onSave')}),
      {accountId: 7, preset: mcpPresets[0], existingNames: new Set(), server: {...list[1], enabled: false}, inventory: {tools: [], refreshedAt: 'x'}, open: true, serverName: 'x', connection: {status: 'connecting'}}]});
});

test('Plugins › MCPs parses commands, drafts servers and checks URLs like the supplied page', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: MCPS, text: textOf(MCPS), blocks: ROUTES[MCPS], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  for (const line of ['npx -y @example/mcp', `node "my server.js" --flag='a b' \\"x\\" c\\ d`, '  spaced   out  ', "echo 'it''s'", 'tail\\', '', 'a "unterminated', 'x \\q'])
    same('__kept_dt', line);
  for (const [command, args] of [['npx', ['-y', 'a b', "it's", '$HOME', '']], ['node', []]]) same('__kept_ut', command, args);
  for (const arg of ['plain', 'with space', "o'neil", 'back\\slash', '"q"']) same('__pair_shellQuote', arg);
  for (const host of ['localhost', 'App.Localhost', '127.0.0.1', '127.1.2.300', '[::1]', '::', '0.0.0.0', 'example.com', ' LOCALHOST ']) same('__pair_isLoopbackHost', host);
  for (const url of ['https://mcp.example', 'http://localhost:3000/mcp', 'http://127.0.0.1', 'http://example.com', 'ftp://x', 'not a url', 'http://[::1]:8080'])
    same('__kept_pt', url);
  for (const server of Object.entries(mcpServers).map(([name, s]) => ({name, ...s}))) { same('__pair_serverDraft', server); same('__pair_endpointLabel', server); }
  for (const server of [{transport: 'stdio', command: ''}, {transport: 'streamable-http', url: ''}]) same('__pair_endpointLabel', server);
  for (const args of [[], ['stdio', 'files'], ['streamable-http', 'x']]) same('__pair_emptyDraft', ...args);
  const drafts = [{transport: 'stdio', command: 'npx -y "a b"', envText: 'A=1\n\n B = two=2 \n'}, {transport: 'streamable-http', url: 'https://x', authType: 'headers', headersText: 'Authorization=Bearer t'},
    {transport: 'streamable-http', url: 'https://x', authType: 'none'}, {transport: 'streamable-http', url: 'https://x', authType: 'auto', clientId: '  '}, {transport: 'streamable-http', url: 'https://x', authType: 'auto', clientId: ' id '}];
  for (const draft of drafts) for (const previous of [undefined, {enabled: false}]) same('__pair_serverFromDraft', draft, previous, 'name');
  for (const url of ['https://MCP.Example.com/mcp/#x', 'https://a.example/', 'https://a.example/x//', 'http://Localhost:8/A/']) same('__pair_normalUrl', url);
  for (const [name, taken] of [['linear', []], ['linear', ['linear']], ['linear', ['linear', 'linear_2']], ['x'.repeat(40), ['x'.repeat(32)]]]) same('__pair_uniqueName', name, new Set(taken));
  for (const text of ['A=1\nB=2', 'A=1\n=2', 'novalue', '', ' A = 1 \r\n\r\n']) { same('__kept_Ue', text); same('__pair_parseEnv', text); }
  same('__pair_envText', {A: '1', B: 'x=y'});
  for (const name of ['__pair_STATUS_LABELS', '__pair_ACTION_LABELS']) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  // The OAuth popup: a chrome window that reports closing, and the window.open fallback.
  const auth = side => { const calls = []; world.enter({imports: {'chrome.windows.create': options => (calls.push(['create', options]), {then: then => (then({id: 4}), {catch: () => {}})}),
    'chrome.windows.onRemoved.addListener': listener => (calls.push(['listen']), listener(3), listener(4)), 'chrome.windows.onRemoved.removeListener': () => calls.push(['unlisten'])}});
    side.__pair_openAuthWindow('https://auth.example', () => calls.push(['closed'])); return JSON.stringify(calls); };
  assert.equal(auth(ours), auth(supplied));
});

// The connect provider dialog: each kind of provider current in turn (an API key, a regional token
// plan, Cloudflare, a local server new and saved, the custom JSON editor and a saved custom provider),
// with detected and saved models.
const CONNECT = 'assets/connect-dialog-CacgpFap.js';
test('the connect provider dialogs render like the supplied ones for keys, local servers and custom JSON', async () => {
  const SM = './strip-markdown-DRcmtuJc.js';
  const ids = ['openai', 'meta', 'openrouter', 'opencode', 'opencode-go', 'qwen-token-plan', 'anthropic', 'google', 'xai', 'deepseek', 'commandcode', 'minimax',
    'moonshotai', 'kimi-coding', 'zai', 'xiaomi', 'xiaomi-token-plan-cn', 'xiaomi-token-plan-ams', 'xiaomi-token-plan-sgp', 'cloudflare-ai-gateway', 'ollama', 'lm-studio',
    'custom-json', 'my-provider'];
  const all = new Map(ids.map(id => [id, {id, name: id.toUpperCase()}]));
  const saved = {name: 'Ollama', baseUrl: 'http://localhost:11434/v1', models: [{id: 'llama3', name: 'Llama 3', reasoning: false}, {id: 'gone', name: 'Gone'}]};
  const scene = (world, current, {connected = ['ollama', 'my-provider'], detected = [{id: 'llama3', name: 'Llama 3 8B'}, {id: 'qwen', name: 'Qwen'}], errors = {}, state} = {}) => ({state,
    imports: {'./provider-context-A_wu0fRN.js#n': {all, currentProvider: current, setCurrentProvider: world.stub('spy:setCurrent'), accountId: 7,
      connected: new Map(connected.map(id => [id, {id, method: 'models_json'}])), completeConnection: world.stub('spy:complete')},
      [`${SM}#er`]: options => ({isPending: false, mutateAsync: world.stub('spy:mutateAsync'), name: queryName(options)}),
      [`${SM}#tr`]: queries({getCustomProviderConfig: {data: {providerConfig: current === 'my-provider' ? {name: 'Mine', api: 'openai-completions', models: []} : saved}}}),
      [`${SM}#nr`]: queries({discoverCustomProviderModels: {data: {models: detected}}}), [`${SM}#pr`]: {fetchQuery: world.stub('spy:fetchQuery')},
      '*schemas-Z5KNLPhp.js#S().safeParse': value => ({success: Boolean(value?.id), data: value}),
      './tag-icon-DeMC7uIN.js#f': () => ({formState: {errors}, register: name => ({name}),
        handleSubmit: submit => () => void submit({apiKey: ' key ', region: 'sgp', accountId: 'acct', gatewayId: 'gw', baseUrl: 'http://localhost:11434/v1', modelIds: ['llama3', 'qwen'],
          json: '{"providers":{"mine":{"api":"openai-completions","models":[{"id":"m"}]}}}'})?.catch?.(() => {})}),
      './tag-icon-DeMC7uIN.js#p': () => ({register: name => ({name, ref: world.stub('spy:ref')}), formState: {errors}, watch: () => ['llama3'], getValues: name => (name === 'modelIds' ? ['llama3'] : 'http://localhost:11434/v1'),
        getFieldState: () => ({isDirty: false}), setValue: world.stub('spy:setValue'), setError: world.stub('spy:setError')})}});
  await assertParity({blocksByChunk: {[CONNECT]: ROUTES[CONNECT]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 1200, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world, 'openai'), world => scene(world, 'commandcode', {errors: {apiKey: [{message: 'Please enter your API key'}]}}),
      world => scene(world, 'xiaomi-token-plan-sgp', {state: ['sgp']}), world => scene(world, 'cloudflare-ai-gateway'), world => scene(world, 'ollama'),
      world => scene(world, 'lm-studio', {connected: [], detected: []}), world => scene(world, 'custom-json'), world => scene(world, 'my-provider'),
      world => scene(world, 'ollama', {state: [[{id: 'extra', name: 'Extra'}, {id: 'llama3', name: 'Llama'}]]}), world => scene(world, null)],
    props: [world => ({provider: 'openai', description: 'Get a key', placeholder: 'sk-...', preset: 'ollama', mode: 'update', defaultValues: {baseUrl: 'http://localhost:11434/v1', apiKey: '',
      modelIds: ['llama3']}, defaultModels: saved.models, models: saved.models, defaultModelIds: ['llama3'], onModelsDetected: world.stub('spy:detected'), value: 'cn',
      onValueChange: world.stub('spy:valueChange'), invalid: true, register: {name: 'apiKey', ref: world.stub('spy:ref')}, defaultJson: '{"providers":{}}', children: 'body',
      title: 'Custom', contentClassName: 'wide', schema: 'schema', name: 'apiKey'}),
      world => ({provider: 'my-provider', preset: 'lm-studio', mode: 'create', defaultValues: {baseUrl: '', apiKey: 'k', modelIds: []}, defaultModels: [], models: [], defaultModelIds: [],
        invalid: false, register: {name: 'json'}, value: 'global', defaultJson: '{}', name: 'json', onModelsDetected: world.stub('spy:detected')})]});
});

test('the connect provider dialog indents JSON and checks values like the supplied one', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: CONNECT, text: textOf(CONNECT), blocks: ROUTES[CONNECT], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const text of ['plain', '$HOME', '${TOKEN}', '$$HOME', '$!cmd', 'cost $5', 'end$', '$_x']) assert.equal(ours.__pair_hasEnvReference(text), supplied.__pair_hasEnvReference(text), text);
  for (const id of ['ollama', 'lm-studio', 'openrouter', 'mine']) assert.equal(ours.__pair_isBuiltInCustom(id), supplied.__pair_isBuiltInCustom(id), id);
  // Tab in the JSON editor: insert at a caret, indent and outdent a selection over lines, and other keys.
  const tab = (side, {key = 'Tab', shiftKey = false, value = '{\n  "a": 1,\n"b": 2\n}', start = 2, end = 2} = {}) => {
    const calls = [];
    const target = {value, selectionStart: start, selectionEnd: end, setRangeText: (...args) => calls.push(['range', ...args]),
      dispatchEvent: event => calls.push(['dispatch', event.type, event.data])};
    world.enter({});
    side.__pair_indentWithTab({key, shiftKey, currentTarget: target, preventDefault: () => calls.push(['prevent'])});
    return JSON.stringify([calls, target.selectionStart, target.selectionEnd]);
  };
  for (const options of [{}, {start: 2, end: 14}, {shiftKey: true, start: 4, end: 14}, {shiftKey: true, start: 2, end: 2}, {key: 'Enter'}, {value: '\tx', shiftKey: true, start: 0, end: 2}])
    assert.equal(tab(ours, options), tab(supplied, options), JSON.stringify(options));
  for (const name of ['__pair_EXAMPLE_JSON', '__pair_INDENT', '__kept_fe']) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
});

// Model select: several providers (one signed out), models with thinking levels and fast mode,
// searching, the default option, loading, empty and error states, and Ultrabrowse on and off.
const MODEL_SELECT = 'assets/model-select-BvZsM1Kl.js';
test('the model and thinking menus render like the supplied ones', async () => {
  const catalog = {anthropic: [{provider: 'anthropic', id: 'opus', name: 'Claude Opus', shortName: 'Opus', availableThinkingLevels: ['off', 'low', 'high', 'max'], supportsFastMode: true},
    {provider: 'anthropic', id: 'haiku', name: 'Claude Haiku', shortName: 'Haiku', availableThinkingLevels: [], supportsFastMode: false}],
    openai: [{provider: 'openai', id: 'gpt', name: 'GPT', shortName: 'GPT', availableThinkingLevels: ['minimal', 'medium'], supportsFastMode: false}]};
  const selectable = [{id: 'anthropic', name: 'Claude Subscription', state: 'active'}, {id: 'openai', name: 'OpenAI', state: 'active'}, {id: 'grok', name: 'Grok', state: 'auth-expired'}];
  const selected = {provider: 'anthropic', modelId: 'opus', modelShortName: 'Claude Opus', thinkingLevel: 'high', fastMode: true, supportsFastMode: true, availableThinkingLevels: ['off', 'low', 'high', 'max']};
  const context = (world, extra = {}) => ({allowDefaultOption: true, isAvailableModelsLoading: false, isAvailableModelsError: false, retryAvailableModels: world.stub('spy:retry'),
    isUsingDefaultValue: false, isOpen: true, defaultOptionLabel: 'Default model', selectableProviders: selectable, selectedModel: selected, unavailableValueLabel: undefined,
    getModels: id => catalog[id] ?? [], isModelSelected: (provider, id) => provider === 'anthropic' && id === 'opus', onOpenChange: world.stub('spy:openChange'),
    onChange: world.stub('spy:change'), enableUltrabrowse: true, canUseUltrabrowse: true, proactiveMode: true, isThinkingOpen: true, onThinkingOpenChange: world.stub('spy:thinkingOpen'), ...extra});
  const providerOptions = [...selectable, {id: 'aux', name: 'Aux', state: 'active'}];
  const modelsByProvider = {...catalog, aux: [{provider: 'aux', id: 'free', shortName: 'Free', availableThinkingLevels: [], supportsFastMode: false}],
    grok: [{provider: 'grok', id: 'grok-4', shortName: 'Grok', availableThinkingLevels: [], supportsFastMode: false}]};
  const allModels = Object.values(modelsByProvider).flat().map(model => ({...model, supportsVision: model.id !== 'haiku'}));
  const imports = (world, plan = 'pro') => ({'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
    './use-agent-settings-DiedG0R1.js#n': () => ({providerOptions, modelsByProvider, availableModels: allModels, isLoading: false, isModelCatalogError: false,
      subscriptionPlan: plan, refetchModelCatalog: world.stub('spy:refetchCatalog')}),
    './use-agent-settings-DiedG0R1.js#o': (level, levels) => (levels?.includes(level) ? level : levels?.[0] ?? 'off')});
  const scene = (world, extra, more = {}) => ({context: context(world, extra), imports: imports(world, more.plan), ...more});
  await assertParity({blocksByChunk: {[MODEL_SELECT]: ROUTES[MODEL_SELECT]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 950, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world, {}), world => scene(world, {}, {state: ['opus']}), world => scene(world, {}, {state: ['grok']}), world => scene(world, {}, {state: ['reauth']}), world => scene(world, {}, {state: ['zzz']}), world => scene(world, {}, {plan: 'free'}),
      world => scene(world, {selectableProviders: selectable.slice(0, 1), selectedModel: null, isUsingDefaultValue: true, proactiveMode: false}),
      world => scene(world, {selectableProviders: selectable.slice(2)}), world => scene(world, {isAvailableModelsLoading: true}),
      world => scene(world, {selectableProviders: [], isAvailableModelsError: true}), world => scene(world, {selectableProviders: [], allowDefaultOption: false, selectedModel: null, unavailableValueLabel: 'Gone'}),
      world => scene(world, {canUseUltrabrowse: false, isOpen: false, isThinkingOpen: false, selectedModel: {...selected, thinkingLevel: 'max', fastMode: false}}),
      world => scene(world, {selectedModel: {...selected, supportsFastMode: false, availableThinkingLevels: []}}),
      world => scene(world, {}, {event: {key: '2', defaultPrevented: false, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, preventDefault: world.stub('spy:prevent'),
        stopPropagation: world.stub('spy:stop'), target: {value: 'gp'}, currentTarget: {closest: () => null}}})],
    props: [world => ({checked: true, disabled: false, onCheckedChange: world.stub('spy:checked'), compact: false, animated: true, className: 'probe', thinking: true, shortcut: 'model',
      children: 'child', menuSize: 'sm', submenu: true, provider: selectable[2], onRetry: world.stub('spy:retry')}),
      world => ({checked: false, disabled: true, compact: true, tooltipAlign: 'start', thinking: false, shortcut: 'thinking', submenu: false, onCheckedChange: world.stub('spy:checked')}),
      {disabled: true, animated: false},
      world => ({value: {provider: 'anthropic', modelId: 'opus', thinkingLevel: 'max', fastMode: true}, allowDefaultOption: true, enableUltrabrowse: true, proactiveMode: true,
        children: 'menus', onChange: world.stub('spy:onChange'), onInvalidProactiveMode: world.stub('spy:invalidProactive')}),
      world => ({value: null, fallbackValue: {provider: 'openai', modelId: 'gpt', thinkingLevel: 'medium'}, requireVision: true, unavailableValueLabel: 'Gone', proactiveMode: true,
        onChange: world.stub('spy:onChange'), modelCatalog: {providerOptions: providerOptions.slice(1), modelsByProvider, models: allModels}}),
      world => ({value: {provider: 'anthropic', modelId: 'haiku'}, requireVision: true, hideFreeAuxProvider: false, onChange: world.stub('spy:onChange')}),
      world => ({value: null, onChange: world.stub('spy:onChange'), modelCatalog: {providerOptions: [providerOptions[0], providerOptions[3]], modelsByProvider, models: allModels}})]});
});

test('the model select helpers label, match and pick like the supplied ones', async () => {
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: MODEL_SELECT, text: textOf(MODEL_SELECT), blocks: ROUTES[MODEL_SELECT], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  world.enter({imports: {'./platform-CX_yPATJ.js#i': event => Boolean(event.metaKey)}});
  for (const event of [{key: 'M', metaKey: true, shiftKey: true}, {key: 'µ', code: 'KeyM', metaKey: true, shiftKey: true}, {key: '>', code: 'Period', metaKey: true, shiftKey: true},
    {key: '.', metaKey: true, shiftKey: true, altKey: true}, {key: 'm', metaKey: false, shiftKey: true}, {key: 'm', metaKey: true, shiftKey: false}, {key: 'x', metaKey: true, shiftKey: true},
    {key: 'm', metaKey: true, shiftKey: true, isComposing: true}, {key: 'm', metaKey: true, shiftKey: true, defaultPrevented: true}]) same('__pair_shortcutFor', event);
  for (const args of [[{modelShortName: 'Claude Opus 5'}], [null, true, 'Default'], [null, false, 'Default'], [null, true, 'Default', 'Unavailable']]) same('__pair_triggerLabel', ...args);
  const model = {shortName: 'Opus', name: 'Claude Opus', id: 'claude-opus'};
  for (const query of ['', 'opus', 'anthropic', 'gpt', 'claude-o']) same('__pair_matchesQuery', model, {name: 'Anthropic'}, query);
  for (const name of ['Claude Subscription', 'OpenAI', 'ChatGPT Subscription Plus']) same('__pair_providerLabel', name);
  for (const levels of [['off', 'minimal', 'low', 'high'], [], ['off']]) same('__kept_je', levels);
  for (const args of [[null, 'b', false], [undefined, undefined, true], ['a', 'b', true], [null, null, true]]) same('__kept_Je', ...args);
  for (const [model, fast] of [[{provider: 'p', id: 'm', availableThinkingLevels: ['low'], supportsFastMode: true}, true], [{provider: 'p', id: 'm', supportsFastMode: false}, true],
    [{provider: 'p', id: 'm', supportsFastMode: true}, undefined]]) same('__kept_Se', model, fast);
  for (const name of ['__pair_ULTRABROWSE_LETTERS', '__pair_ULTRABROWSE_COLORS', '__pair_ULTRABROWSE_GRADIENT']) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  // A shortcut opens its menu once, remembering focus, and only when that menu is there and enabled.
  const press = (side, key, {disabled = false, thinking = true} = {}) => {
    const calls = [];
    const button = {disabled, click: () => calls.push('click')};
    const root = {querySelector: selector => (calls.push(selector), button)};
    side.__pair_handleShortcut({key, metaKey: true, shiftKey: true, preventDefault: () => calls.push('prevent'), stopPropagation: () => calls.push('stop')},
      {closest: () => root}, thinking);
    return JSON.stringify(calls);
  };
  for (const [key, options] of [['m'], ['.'], ['.', {thinking: false}], ['m', {disabled: true}], ['x']]) assert.equal(press(ours, key, options), press(supplied, key, options), key);
});

// Skills: a user skill with files, keywords, URL patterns and both agents, a built-in overridden by
// it, a system skill, a password-manager skill and a single-file skill; the Skills page, a skill's
// page on each kind of file, and the activation fields and catalog helpers on the same skills.
const skillFixtures = [
  {name: 'weekly-review', path: 'user/weekly-review', definitionPath: 'user/weekly-review/SKILL.md', absolutePath: '/u/skills/weekly-review', group: 'user', creator: 'user',
    description: 'Review the week', enabled: true, siteSpecific: false, files: ['run.sh', 'notes/b.md', 'SKILL.md', 'notes/a.md', 'a.md'],
    metadata: {icon: 'https://img.example/w.png', autoInject: {keywords: ['week', 'metrics'], url: ['github.com/**']}, agents: ['aux', 'aux-code']}},
  {name: 'visualize', path: 'builtin/visualize', definitionPath: 'builtin/visualize/SKILL.md', absolutePath: '/app/skills/visualize', group: 'builtin', creator: 'builtin',
    description: 'Charts', enabled: false, files: ['SKILL.md'], overriddenBy: 'user/visualize', metadata: {}},
  {name: 'aux', path: 'builtin/aux', definitionPath: 'builtin/aux/SKILL.md', absolutePath: '/app/skills/aux', group: 'builtin', creator: 'builtin', description: 'Aux', enabled: true, files: ['SKILL.md']},
  {name: '1password', path: 'builtin/1password', definitionPath: 'builtin/1password/SKILL.md', absolutePath: '/app/skills/1password', group: 'builtin', creator: 'builtin', description: '1P', enabled: true, files: ['SKILL.md']},
  {name: 'linkedin', path: 'builtin/linkedin', group: 'builtin', creator: 'builtin', files: ['SKILL.md'], absolutePath: '/app/skills/linkedin'},
  {name: 'sites', path: 'builtin/sites', group: 'builtin-site-specific', creator: 'builtin', files: ['SKILL.md'], absolutePath: '/app/skills/sites'},
  {name: 'notes.md', path: 'user/notes.md', definitionPath: 'user/notes.md', absolutePath: '/u/skills/notes.md', group: 'user', creator: 'user', description: 'One file', enabled: true, files: [],
    overriddenBy: 'user/notes-2.md'},
];
const isSingleFile = path => path.endsWith('.md');
const displayName = skill => skill.name.replace(/-/g, ' ');

test('the Skills pages render like the supplied ones', async () => {
  const SM = './strip-markdown-DRcmtuJc.js';
  const chunks = ['assets/skills-CfSQ7MCw.js', 'assets/_skillId-CAwCRjA8.js', 'assets/skill-activation-fields-wmmVsYeN.js'];
  const skills = skillFixtures.slice(0, 4).concat(skillFixtures[6]);
  const join = (...parts) => parts.flatMap(part => part.split('/').filter(Boolean)).join('/');
  const scene = (world, {file = 'user/weekly-review/SKILL.md', skill = 'user/weekly-review', auxCode = true, content = '---\nname: x\n---\n# Weekly review\n\nSteps', loading = false, state} = {}) => ({state,
    context: {accountId: 7, projectId: null, canPreviewFile: isSingleFile(file), filePath: file, skill: skills.find(s => s.path === skill), skillName: displayName(skills.find(s => s.path === skill)),
      onRevealFile: world.stub('spy:reveal')},
    imports: {[`${SM}#Kt`]: {accountId: 7}, [`${SM}#Ht`]: {capture: world.stub('spy:capture')}, [`${SM}#M`]: {confirm: world.stub('spy:confirm')},
      [`${SM}#er`]: options => ({isPending: false, mutateAsync: world.stub('spy:mutateAsync'), name: queryName(options)}),
      [`${SM}#pr`]: {invalidateQueries: world.stub('spy:invalidate')},
      [`${SM}#tr`]: {data: {skills, skillByFilePath: new Map([[file, skills.find(s => s.path === skill)]])}},
      [`${SM}#nr`]: queries({'settings.getAll': {data: auxCode}, readSkillFile: {data: {content, metadata: {description: 'Review the week', autoInject: {keywords: ['week', 'metrics']}}}, isLoading: loading}}),
      '*useParams': () => ({userId: '7', skillId: `id:${skill}`}), '*useSearch': () => ({file}), '*useNavigate': () => world.stub('spy:navigate'),
      './skill-activation-fields-wmmVsYeN.js#n.has': name => ['1password', 'bitwarden'].includes(name), './skill-activation-fields-wmmVsYeN.js#l': s => s.path === 'builtin/aux',
      './skill-activation-fields-wmmVsYeN.js#f': list => [...list].reverse(), './skill-activation-fields-wmmVsYeN.js#i': path => `id:${path}`,
      './skill-activation-fields-wmmVsYeN.js#r': id => id.replace(/^id:/, ''), './skill-activation-fields-wmmVsYeN.js#u': join,
      './skill-activation-fields-wmmVsYeN.js#m': path => path.split('/').filter(Boolean), './skill-activation-fields-wmmVsYeN.js#s': path => path.split('/').at(-1),
      './skill-activation-fields-wmmVsYeN.js#o': (s, path) => `${s.absolutePath}/${path}`, './skill-activation-fields-wmmVsYeN.js#c': text => text.replace(/^---[\s\S]*?---\n/, ''),
      './skill-activation-fields-wmmVsYeN.js#p': text => ({heading: text.split('\n')[0], body: text.split('\n').slice(1).join('\n')}),
      './skill-activation-fields-wmmVsYeN.js#d': text => text.split(/[\n,]/).map(part => part.trim()).filter(Boolean),
      './utils-WfPpT5w5.js#t': displayName, './utils-WfPpT5w5.js#n': isSingleFile, './platform-CX_yPATJ.js#r': () => ({name: 'Finder', revealLabel: 'Show in Finder', revealError: 'Could not show'}),
      './utils-WfPpT5w5.js#u': isSingleFile}});
  await assertParity({blocksByChunk: Object.fromEntries(chunks.map(chunk => [chunk, ROUTES[chunk]])), textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    minimum: 700, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {file: 'user/weekly-review/run.sh'}), world => scene(world, {skill: 'builtin/visualize', file: 'builtin/visualize/SKILL.md', auxCode: false}),
      world => scene(world, {file: 'user/weekly-review/notes/a.md', loading: true}), world => scene(world, {skill: 'user/notes.md', file: 'user/notes.md', content: 'No heading'}),
      world => scene(world, {state: [true, 'Weekly', 'Review', true, 'week, metrics', 'github.com/**', 'Do it']}), world => scene(world, {state: ['https://x.example/**']}),
      world => scene(world, {state: ['Name', '', true, 'k', 'u', 'Body']}), world => scene(world, {skill: 'builtin/visualize', file: 'builtin/visualize/SKILL.md', state: [true]})],
    props: [world => ({skill: skillFixtures[0], userId: '7', title: 'My Skills', skills, open: true, onOpenChange: world.stub('spy:openChange'), accountId: 7, projectId: null,
      filePath: 'user/weekly-review/SKILL.md', showSkillMetadata: true, onRevealFile: world.stub('spy:reveal'), children: '# Title', className: 'probe', label: 'Keywords', value: 'week',
      idPrefix: 'edit-skill', keywordsText: 'week, metrics', urlPatternsText: 'github.com/**\nexample.com', onKeywordsTextChange: world.stub('spy:keywords'),
      onUrlPatternsTextChange: world.stub('spy:urls')}),
      world => ({skill: skillFixtures[1], userId: '7', title: 'System', skills: [], open: false, accountId: 7, filePath: 'builtin/visualize/run.sh', showSkillMetadata: false,
        keywordsText: '', urlPatternsText: '', idPrefix: 'create-skill', onOpenChange: world.stub('spy:openChange')})]});
});

test('the skill helpers sort, catalog, encode and summarize like the supplied ones', async () => {
  const world = createWorld();
  const chunk = 'assets/skill-activation-fields-wmmVsYeN.js';
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args), (_, value) => (value instanceof Map ? [...value] : value instanceof Set ? [...value] : value)),
    JSON.stringify(supplied[name](...args), (_, value) => (value instanceof Map ? [...value] : value instanceof Set ? [...value] : value)), `${name}(${JSON.stringify(args).slice(0, 80)})`);
  world.enter({imports: {'./utils-WfPpT5w5.js#n': isSingleFile, './utils-WfPpT5w5.js#t': displayName}});
  for (const path of ['a/b\\c//d', '', '/x/']) { same('__kept_v', path); same('__kept_G', path); }
  same('__kept_i', 'a/', '/b', 'c\\d');
  for (const skill of [...skillFixtures, {...skillFixtures[1], path: 'builtin/Visualize/'}]) { same('__kept_U', skill); same('__pair_isHidden', skill); same('__pair_builtinName', skill); }
  same('__kept_W', [...skillFixtures].reverse());
  for (const text of ['week, metrics\n reports ,', '', ' , ']) same('__kept_g', text);
  same('__pair_catalogPaths', skillFixtures);
  same('__pair_skillsByFile', skillFixtures);
  same('__kept_Y', [...skillFixtures, {...skillFixtures[2], metadata: {settingsGate: 'x'}}, {...skillFixtures[2], name: 'internal', metadata: {metadata: {internal: true}}}]);
  for (const [skill, path] of [[skillFixtures[0], 'user/weekly-review/notes/a.md'], [skillFixtures[0], 'user/weekly-review'], [skillFixtures[6], 'user/notes.md']]) same('__kept_q', skill, path);
  for (const text of ['# Title\n\nBody', '#NoSpace\nBody', 'Body only', '# Only']) same('__kept_J', text);
  for (const text of ['---\nname: x\n---\nBody', '---\r\nname: x\r\n---\r\n\r\nBody', 'No front matter', '---\nunclosed']) same('__kept_Q', text);
  for (const id of ['user/weekly-review', 'builtin/ünïcode/✓', '']) { same('__kept_V', id); same('__kept_X', ours.__kept_V(id)); }
  same('__kept_X', '!!not base64');
  for (const [keywords, urls] of [[0, 0], [1, 0], [2, 3], [0, 1]]) same('__pair_activationSummary', keywords, urls);
  for (const name of ['__kept_K', '__pair_HIDDEN_BUILTINS', '__pair_SYSTEM_ORDER']) assert.deepEqual([...ours[name]], [...supplied[name]], name);
  assert.equal(String(ours.__pair_FRONT_MATTER), String(supplied.__pair_FRONT_MATTER));
});

// The app shell's UI: the root providers, the Settings placeholder (sidebar collapsed or not) and the
// memory index status in every phase.
const MAIN = 'assets/extension-main-Dz1-AsCT.js';
test('the app root, Settings placeholder and memory index status render like the supplied ones', async () => {
  const SM = './strip-markdown-DRcmtuJc.js';
  const statuses = [{phase: 'downloading', downloadedBytes: 25, totalDownloadBytes: 100}, {phase: 'indexing', processedChunks: 3, totalChunks: 4}, {phase: 'indexing', processedFiles: 1, totalFiles: 8},
    {phase: 'indexing'}, {phase: 'preparing'}, {phase: 'ready', updatedAt: '2026-10-30T09:00:00Z', indexedChunks: 12345}, {phase: 'ready'}, {phase: 'error', errorKind: 'download'},
    {phase: 'error', errorKind: 'disk'}, {phase: 'idle'}, {phase: 'unknown'}];
  const scene = (world, status, {pending = false, error = false, collapsed = true} = {}) => ({imports: {
    [`${SM}#nr`]: {data: status, isSuccess: !pending && !error, isPending: pending, isError: error, error: {message: 'Daemon offline'}, isFetching: false, refetch: world.stub('spy:refetch')},
    [`${SM}#er`]: options => ({isPending: false, mutate: world.stub('spy:mutate'), name: queryName(options)}), '*useParams': () => ({userId: '7'}),
    './sidebar-Cj9gldy1.js#s': {sidebarState: collapsed ? 'closed' : 'open'}}});
  await assertParity({blocksByChunk: {[MAIN]: ROUTES[MAIN]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 1000, defaults: false,
    renamed: renamedBindings, scenes: [...statuses.map(status => world => scene(world, status)), world => scene(world, undefined, {pending: true}),
      world => scene(world, undefined, {error: true, collapsed: false})],
    props: [...statuses.map((status, index) => ({status, percent: index % 2 ? null : 42})), {}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: MAIN, text: textOf(MAIN), blocks: ROUTES[MAIN], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    renamed: renamedBindings});
  for (const status of statuses) {
    assert.equal(JSON.stringify(ours.__pair_indexProgress(status)), JSON.stringify(supplied.__pair_indexProgress(status)), status.phase);
    for (const percent of [null, 0, 57]) assert.equal(ours.__pair_statusTitle(status, percent), supplied.__pair_statusTitle(status, percent), status.phase);
  }
});

// Small live parts: assistant steps and the turn fold, the New Tab update banner (fresh, cached,
// dismissed, too new for this browser, a video cover), and the copy button.
test('the assistant steps, turn fold, update banner and copy button render like the supplied ones', async () => {
  const chunks = ['assets/turn-fold-B4gN_g5e.js', 'assets/update-banner-C_z-hMCt.js', 'assets/copy-button-C-CFkoWv.js'];
  const entry = {version: '1.5.0', minVersion: '1.5.0', date: '2026-10-27T00:00:00Z', coverImage: 'https://cdn.example/new.mp4',
    content: {title: 'Spaces', description: 'Keep work apart', action: 'Open settings', actionHref: '/u/{accountId}/settings/general'}};
  const scene = (world, {stored, browser = '1.5.2', service = '1.5.0', latest = entry, open = true, copied = false, state, accountId = 7} = {}) => ({state,
    context: {open, setOpen: world.stub('spy:setOpen'), isCopied: copied},
    imports: {'./newtab-CnOLQ0yu.js#o': {accountId}, './utils-BEeo4-cB.js#n': true, 'chrome.runtime.getManifest': () => ({version: service}),
      'window.localStorage.getItem': () => (stored ? JSON.stringify(stored) : null), '*safeParse': value => ({success: Boolean(value?.requestedAt), data: value}),
      './strip-markdown-DRcmtuJc.js#nr': options => (options?.queryKey?.[0]?.entity === 'changelog' ? {data: latest ? [latest] : []} : {data: browser}),
      './error-tracking-B1YG2RRM.js#u': {copy: world.stub('spy:copy')}, './date-CxUVm-Dr.js#t': ms => `${ms / 1000}s`}});
  const now = Date.UTC(2026, 9, 30, 12);
  await assertParity({blocksByChunk: Object.fromEntries(chunks.map(chunk => [chunk, ROUTES[chunk]])), textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    minimum: 1100, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {stored: {requestedAt: now - 1000, dismissedVersion: null, changelog: {...entry, coverImage: 'https://cdn.example/new.png?x=1'}}}),
      world => scene(world, {stored: {requestedAt: now - 1000, dismissedVersion: '1.5.0', changelog: entry}}), world => scene(world, {browser: '1.4.9', open: false, copied: true}), world => scene(world, {accountId: null}),
      world => scene(world, {service: '1.4', latest: {...entry, minBackgroundServiceVersion: '1.5.0', content: {title: 'T', description: 'D'}}}),
      world => scene(world, {latest: {...entry, date: '2026-10-01T00:00:00Z'}}), world => scene(world, {latest: null, state: [undefined]})],
    props: [world => ({icon: 'icon', title: 'Searched the web', children: 'details', className: 'probe', contentClassName: 'inner', inlineTimelineChildren: true, expandMode: 'open-when-active',
      isActiveGroup: true, isLastItem: true, footer: 'footer', description: 'Check links', color: 'blue', model: 'Opus', time: '2m', activity: 'Reading docs', isRunning: true,
      onClick: world.stub('spy:onClick'), open: true, defaultOpen: false, onOpenChange: world.stub('spy:onOpenChange'), loading: false, duration: 125000, working: true,
      value: 'copied text', successMessage: 'Copied!', src: 'https://cdn.example/a.webm', alt: 'Demo'}),
      {icon: null, title: 'Step', children: undefined, expandMode: 'manual', hideConnector: true, isLastItem: false, description: 'Idle', loading: true, disabled: true, working: false,
        value: () => 'computed', src: 'https://cdn.example/a.jpg', alt: 'Still'},
      {icon: undefined, title: 'Bare', children: 'body', bare: true, expandMode: 'none', duration: undefined, value: ''},
      {icon: 'i', title: 'Forced', children: 'body', expandMode: 'force-open', isActiveGroup: false, isLastItem: true}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: chunks[1], text: textOf(chunks[1]), blocks: ROUTES[chunks[1]], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const [a, b] of [['1.5.0', '1.5.0'], ['1.5', '1.5.1'], ['1.10.0', '1.9.9'], ['2', '10'], ['1.x', '1.x'], ['1.x', '1.y'], ['1.5.0', 'dev']]) {
    assert.equal(ours.__pair_compareVersions(a, b), supplied.__pair_compareVersions(a, b), `${a} ${b}`);
    assert.equal(ours.__pair_isAtMost(a, b), supplied.__pair_isAtMost(a, b), `${a} ${b}`);
  }
  for (const src of ['https://a/x.MP4', '/v/clip.webm?t=1', 'https://a/x.png', 'movie.mov', '']) assert.equal(ours.__pair_isVideo(src), supplied.__pair_isVideo(src), src);
  for (const name of ['__pair_STORAGE_KEY', '__pair_REFRESH_MS', '__pair_SHOW_FOR_MS', '__pair_CARD_MOTION', '__pair_DEFAULT_ACTION_PATH'])
    assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  assert.deepEqual([...ours.__pair_VIDEO_EXTENSIONS], [...supplied.__pair_VIDEO_EXTENSIONS]);
});

// The onboarding splash hero: still (reduced motion) and animated, the New Tab intro and the chat
// at several phases, and its parts with real task, screenshot and subagent data.
const SPLASH = 'assets/splash-D666ivBP.js';
test('the onboarding splash hero renders and schedules like the supplied one', async () => {
  const task = {workingForSeconds: 226, title: 'Finding website design example', image: '/a.png', routine: 'Daily', tools: ['browser', 'search']};
  const element = {getBoundingClientRect: () => ({left: 10, top: 20, width: 800, height: 600, bottom: 620, right: 810}), offsetWidth: 400, offsetHeight: 300, offsetLeft: 0,
    parentElement: {getBoundingClientRect: () => ({bottom: 500})}, closest: () => element, querySelector: () => element};
  const scene = (world, {reduced = false, state, inView = true} = {}) => ({state, imports: {'./strip-markdown-DRcmtuJc.js#Xt': reduced, 'HTMLElement': element,
    '*useInView': inView}});
  await assertParity({blocksByChunk: {[SPLASH]: ROUTES[SPLASH]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 900, defaults: false,
    renamed: renamedBindings, scenes: [world => scene(world), world => scene(world, {reduced: true}), world => scene(world, {state: ['done']}), world => scene(world, {state: ['typing', 'cursor', 12]}),
      world => scene(world, {state: ['tool-chase', 3, 5, 2, 1, 4000, 1000]}), world => scene(world, {state: ['subagents-header', 30, 20, 2]}), world => scene(world, {state: [1, true]})],
    props: [world => ({paused: false, variant: 'intro', onDone: world.stub('spy:onDone'), onScreenshotChange: world.stub('spy:shot'), task, initialSeconds: 3725, className: 'probe',
      image: '/b.png', icon: 'icon', label: 'Chase', chevron: true, title: 'Card Overview', active: true, children: 'child', text: 'First, I will check the statement', wordCount: 4,
      isTyping: true, visibleCount: 2, elapsedMs: 61000, showStopIcon: true, showAmazonPrime: true, showChase: true, showStatement: true, showSubscriptionWindow: true, mode: 'ask',
      addressBarMode: 'url', agentTabsCount: 3, selectedTabLabel: 'Netflix', item: {label: 'Gmail', icon: 'g'}, type: 'point', name: 'instagram', textRef: {current: element},
      placeholderVisible: true, typedText: 'cancel all', tabHintVisible: true, layer: {frame: element, path: {start: {x: 0, y: 0}, control: {x: 5, y: 5}, end: {x: 10, y: 10}},
        keyframes: [{x: 0, y: 0}, {x: 10, y: 10}]}, pointerType: 'cursor', pointerOpacity: 1, pointerMoving: true, pointerAtStart: false, moveMs: 935, fadeMs: 306}),
      {paused: true, variant: 'return', task: {...task, routine: undefined, tools: undefined}, initialSeconds: 9, chevron: false, active: false, isTyping: false, wordCount: 0,
        showStopIcon: false, showAmazonPrime: false, mode: 'search', type: 'default', pointerMoving: false, pointerAtStart: true}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: SPLASH, text: textOf(SPLASH), blocks: ROUTES[SPLASH], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), name);
  for (const seconds of [0, 59, 61, 3600, 3725]) same('__pair_durationLabel', seconds);
  for (const n of [0, 0.5, 1]) same('__pair_easeOutCubic', n);
  same('__pair_curveKeyframes', {x: 0, y: 100}, {x: 40, y: 20}, {x: 80, y: 0});
  same('__pair_curveControl', {x: 0, y: 100}, {x: 80, y: 0});
  for (const phase of ['user-message', 'aux', 'done', 'nope']) { same('__pair_phaseIndex', phase); same('__pair_reached', phase, 'tool-search'); }
  same('__pair_firstWords', 'one two three four', 2);
  for (const value of [600, 1200]) { same('__pair_introMs', value); same('__pair_chatMs', value); same('__pair_chatFastMs', value); }
  for (const name of Object.keys(ours).filter(key => /^__pair_[A-Z0-9_]+$/.test(key))) assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  same('__pair_frameScale', element); same('__pair_pointerPath', element, {x: 300, y: 40}); same('__pair_omniboxPointer', element, element); same('__pair_newTabPointer', element, element);
});

const TOOLS = 'assets/tool-definition-registry-Cc6FCFb2.js';
// The bundled diff renderer loads its themes through the preload helper; under these scenes the loads
// stay pending (a stub loader would only reject after the test).
const quiet = scene => world => {
  const shown = typeof scene === 'function' ? scene(world) : scene;
  return {...shown, imports: {'./preload-helper-WHe_eoSx.js#t': () => new Promise(() => {}), ...shown.imports}};
};
test('the tool step icons render like the supplied ones', async () => {
  const chunk = 'assets/tool-definition-registry-Cc6FCFb2.js';
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 15, defaults: false,
    renamed: renamedBindings, scenes: [quiet({})], props: [{}, {size: 16, ariaHidden: false, className: 'size-4', 'aria-label': 'Tool'}]});
});

// Tool definitions pass 2: realistic tool steps in every phase through each summary, routine schedules
// of every kind, and the cards with real terminal output, memory search results and questions.
const toolArgs = {path: 'src/app/main.ts', file_path: 'notes/plan.md', content: 'one\ntwo\nthree', title: 'Build the app', input: 'ls -la\n', resize: {cols: 120, rows: 40},
  signal: 'interrupt', pattern: 'TODO(aux)', description: 'Watch the dev server', id: 'bg-1', ids: ['bg-1', 'bg-2'], background: true,
  script: "export const meta = {name: 'Weekly digest', steps: 3}", code: 'const page = await tabs.openTab("https://x.com"); await page.click("#go"); slack.chat.postMessage({})',
  url: 'https://www.example.com/docs/a', objective: 'aux browser release notes', queries: ['release notes', 7, 'changelog'], argquery: 'aux', query: 'trip to Paris',
  action: 'spawn', to: 'Research agent', task_id: 'task-9', status: 'paused', mode: 'update', name: 'Morning brief', rrule: 'FREQ=DAILY;BYHOUR=8;BYMINUTE=30',
  scheduleKind: 'recurring', timezone: 'America/Chicago', questions: [{header: 'Size', question: 'Which size?'}, {header: 'Color', question: 'Which color?'}],
  todos: [{id: 'd1', content: 'Read', status: 'completed'}]};
const variants = [toolArgs, {}, {...toolArgs, input: '\x03', signal: 'terminate', resize: undefined}, {...toolArgs, input: '\x04', signal: 'kill'}, {...toolArgs, input: '', signal: undefined, resize: undefined},
  {...toolArgs, action: 'list_models', background: false, mode: 'create', status: 'active'}, {...toolArgs, action: 'resume', mode: 'delete', path: 'skills/deep-research/SKILL.md'},
  {...toolArgs, action: 'list', mode: 'view', code: 'imagegen.generate({prompt: "a cat"})', title: 'Take screenshot'}, {...toolArgs, action: 'wait', pattern: '', queries: undefined, url: 'not a url'}];
const toolDetails = [undefined, {diff: '--- a\n+++ b\n@@ -1 +1 @@\n-old\n+new\n+more', skillName: 'Deep Research', skillIcon: 'https://cdn.example/skill.png', title: 'Docs page',
  faviconUrl: 'https://example.com/favicon.ico', recipientTitle: 'Planner', routine: {id: 'r1', name: 'Morning brief', scheduleKind: 'recurring', rrule: 'FREQ=WEEKLY;BYDAY=MO,WE'},
  previousTodos: [{id: 'd1', status: 'pending'}, {id: 'd2', status: 'in_progress'}], updatedTodos: [{id: 'd1', status: 'completed', content: 'Read'}, {id: 'd2', status: 'completed', content: 'Write'}, {id: 'd3', status: 'pending', content: 'Ship'}]},
  {skipped: 'indexing', previousTodos: [{id: 'd1', status: 'pending'}], updatedTodos: []}, {routineId: 'r2', name: 'Digest', previousTodos: [], updatedTodos: [{id: 'd9', status: 'in_progress', content: 'Plan'}]}];
const resultTexts = ['---\nname: deep-research\nicon: https://cdn.example/i.png\n---\nbody', 'Asked user 3 question(s)\nUser confirmed the action', 'Free plan can create up to 3 routines',
  'id: r7\nname: Standup\nscheduleKind: once\nrunAt: 2026-11-02T09:00:00Z\ntimezone: UTC', 'interrupted by user', 'Asked user 1 question(s)'];
const toolNames = ['read_file', 'write_file', 'edit_file', 'bash', 'bash_interact', 'fd', 'rg', 'bg_start', 'bg_monitor', 'bg_status', 'bg_list', 'bg_kill', 'memory_read', 'memory_write',
  'workflow', 'automation_create', 'automation_list', 'automation_delete', 'start_coder', 'repl', 'webfetch', 'websearch', 'browsing_history_search', 'history_search', 'history_read',
  'search_channels', 'search_threads', 'read_thread', 'route_message', 'send_message', 'memory_search', 'message_agent', 'notification', 'subagent', 'subagent_wait', 'ask_user_question',
  'request_action_confirmation', 'write_todos', 'get_time', 'notify_parent', 'routine_update', 'routine.notify_parent', 'routine.update', 'mcp__github__create_issue', 'mcp__odd', 'unknown_tool'];
function* toolSteps() {
  for (const name of toolNames) for (const [index, args] of variants.entries()) {
    const call = {id: `c-${name}-${index}`, name, arguments: args};
    const details = toolDetails[index % toolDetails.length], text = resultTexts[index % resultTexts.length];
    yield {call};
    yield {call, isStreaming: true};
    yield {call, result: {content: [{type: 'text', text}, {type: 'image', data: 'AA'}, {type: 'text', text: 'more'}], details, isError: false}};
    yield {call, result: {content: [{type: 'text', text}], details, isError: true}, isStreaming: true};
  }
}
const schedules = [
  {triggerKind: 'event', eventFilter: {source: 'webhook', from: 'https://hooks.example.com', externalConversationId: 'C42'}}, {triggerKind: 'event', eventFilter: {source: 'telegram'}}, {triggerKind: 'event'},
  {scheduleKind: 'once', runAt: '2026-10-30T15:00:00Z', timezone: 'America/Chicago'}, {scheduleKind: 'once', nextRunAt: '2026-10-31T09:30:00Z', timezone: 'Not/AZone'}, {scheduleKind: 'once'},
  {rrule: 'DTSTART;TZID=Europe/Paris:20261101T090000\nRRULE:FREQ=DAILY;COUNT=1'}, {rrule: 'DTSTART:20261101T090000Z\nRRULE:FREQ=DAILY;COUNT=1'},
  ...['FREQ=MINUTELY', 'FREQ=MINUTELY;INTERVAL=5', 'FREQ=HOURLY', 'FREQ=HOURLY;INTERVAL=3', 'FREQ=DAILY', 'FREQ=DAILY;INTERVAL=2;BYHOUR=7,19', 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0,30',
    'FREQ=DAILY;BYHOUR=9,10,11,12,13,14,15,16,17;BYMINUTE=0,15,30,45', 'FREQ=DAILY;BYHOUR=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23', 'FREQ=DAILY;BYHOUR=8,9,10,11,12;BYMINUTE=0',
    'FREQ=DAILY;BYHOUR=1,3,5,7,9,11', 'FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=18;BYMINUTE=45', 'FREQ=WEEKLY', 'FREQ=WEEKLY;INTERVAL=2;BYDAY=1SU,XX', 'FREQ=MONTHLY;BYMONTHDAY=1,15,40,x',
    'FREQ=MONTHLY;INTERVAL=3', 'FREQ=YEARLY', 'freq=daily;interval=0;byhour=25,12', 'RRULE:FREQ=WEEKLY;BYDAY=SA,SU;BYHOUR=10'].map(rrule => ({rrule, timezone: 'UTC'})), {},
];
test('the tool summaries, schedules and cards render and summarize like the supplied ones', async () => {
  const output = '\x1B[32mok\x1B[0m line one\r\n[session 4 still running]\nline two\r' + 'x'.repeat(8100);
  const memory = {results: [{chunkId: 'k1', path: '/Users/r/aux/memory/people/ada.md', title: 'Ada', excerpt: '**Ada** likes tea', line: 12}, {chunkId: 'k2', path: 'C:\\notes\\memory\\trip.md', title: 'Trip', excerpt: 'Paris', line: 3}]};
  const review = {title: 'Send the email', message: 'Send it to Ada?', artifact: {type: 'email', data: {to: 'ada@example.com', cc: null, n: 2, tags: ['a', {deep: true}]}}};
  await assertParity({blocksByChunk: {[TOOLS]: ROUTES[TOOLS]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 300, defaults: false,
    renamed: renamedBindings, scenes: [quiet({}), quiet({state: [true]})],
    props: [world => ({args: {command: 'pnpm test', ...toolArgs}, resultText: output, state: 'idle', details: memory, onOpenMemoryFile: world.stub('spy:open'), children: 'body', className: 'probe',
      content: output, output: 'done', label: 'Result', expandLabel: 'More'}),
      {args: {questions: toolArgs.questions, ...review}, resultText: 'User responses to asked questions:\n- Size: Large\n- Color: custom: teal\nignored\n- Bad', state: 'loading', details: {skipped: 'indexing'}, errorText: 'Boom', content: 'short', limit: 3},
      {args: {resize: {cols: 80}, input: 'q', signal: 'interrupt', exec_session_id: 3, artifact: {type: 'screenshot', path: 'shots/a.png', alt: 'A', caption: 'Cap'}, title: 'T', message: 'M'}, resultText: '', state: 'error', details: {results: []}},
      {args: {exec_session_id: 'e1', title: '', artifact: {type: 'list', data: {f: () => 1}}}, state: 'suspended', details: null, output: null},
      {details: {skipped: 'indexing'}, state: 'idle', args: {}}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: TOOLS, text: textOf(TOOLS), blocks: ROUTES[TOOLS], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    renamed: renamedBindings});
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name} ${JSON.stringify(args).slice(0, 160)}`);
  let steps = 0;
  for (const step of toolSteps()) { same('__kept_ho', step); same('__kept_dl', supplied.__kept_ho(step)); steps++; }
  assert.ok(steps > 1500);
  // dayjs, enough of it for one-off runs: dates in UTC, a timezone that does not exist throws.
  const day = date => {
    const value = new Date(date), valid = !Number.isNaN(value.getTime());
    const self = {isValid: () => valid, toDate: () => value, minute: () => value.getUTCMinutes(), add: (n, unit) => day(value.getTime() + n * 864e5 * (unit === 'day')),
      isSame: (other, unit) => unit === 'day' && value.toISOString().slice(0, 10) === other.toDate().toISOString().slice(0, 10),
      tz: zone => { if (zone.startsWith('Not/')) throw Error('bad zone'); return self; },
      format: pattern => pattern === 'MMM D' ? `${['Oct', 'Nov'][value.getUTCMonth() - 9]} ${value.getUTCDate()}` : `${value.getUTCHours() % 12 || 12}${pattern === 'hA' ? '' : `:${String(value.getUTCMinutes()).padStart(2, '0')}`}${value.getUTCHours() < 12 ? 'AM' : 'PM'}`};
    return self;
  };
  world.enter({imports: {'*.default': day, '*.default.tz': (date, zone) => day(`${date}Z`).tz(zone)}});
  for (const routine of [...schedules, {scheduleKind: 'once', runAt: '2026-10-31T09:00:00Z'}, {scheduleKind: 'once', runAt: '2026-11-04T21:15:00Z', timezone: 'UTC'}, {scheduleKind: 'once', runAt: 'nope'}])
    same('__kept_tl', routine, new Date(Date.UTC(2026, 9, 30, 12)));
  world.enter();
  for (const step of toolSteps()) if (step.result) { same('__kept_gi', step.call, step.result); same('__kept_cl', step.call, step.result); same('__kept_bg', step.result); }
  for (const text of [output, '', '\x1B[1mbold\x1B[0m']) same('__pair_cleanTerminalOutput', text);
  for (const text of ['', 'User responses to asked questions:\n- A: b\n- C: custom: d\n- e', 'no answers']) assert.deepEqual([...ours.__pair_parseQuestionAnswers(text)], [...supplied.__pair_parseQuestionAnswers(text)]);
  for (const args of [review, {...review, title: ''}, {...review, artifact: {type: 'screenshot', path: 'a.png'}}, {...review, artifact: {type: 'screenshot'}}, {...review, artifact: [1]}, {}])
    same('__pair_parseActionReview', args);
  for (const state of ['loading', 'error', 'suspended', 'idle']) { same('__pair_stateLabel', state); same('__kept_Ne', state); }
  for (const path of ['/a/memory/b/c.md', 'C:\\x\\memory\\y.md', 'plain.md']) same('__pair_memoryRelativePath', path);
  for (const code of ['imessage.contacts.list()', 'gmail.send("a")', 'x.conversations.history({})', 'notion.pages', 'const page = tabs.openTab()', 'page.click() // "slack.x"', 'console.log(1)', '']) {
    for (const title of ['Type the name', 'Scroll down', 'Take screenshot', '']) same('__kept_vi', {title, code});
    same('__kept_po', code);
  }
  for (const label of ['a [b] (c) *d*\n  e', '']) for (const kind of ['file', 'routine']) same('__pair_markdownLink', label, kind, "it's (x)!*/y");
});

// Tool definitions pass 3: each step's title and icon in every phase, with and without the host's
// renderers, the summary's links drawn with real hrefs, and REPL scripts classified.
test('the tool step titles, icons and browse classification render like the supplied ones', async () => {
  const phases = [...toolSteps()].filter((_, index) => index % 3 === 0);
  const runtime = world => ({context: {renderFileLink: world.stub('spy:renderFileLink'), renderRoutineLink: world.stub('spy:renderRoutineLink'),
    renderMcpIcon: world.stub('spy:renderMcpIcon'), renderSubagentIcon: world.stub('spy:renderSubagentIcon')}});
  await assertParity({blocksByChunk: {[TOOLS]: ROUTES[TOOLS]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 2000, defaults: false,
    renamed: renamedBindings, scenes: [quiet({context: {}}), quiet(runtime), quiet({context: {}, state: [true]})],
    props: [...phases.map((step, index) => ({...step, state: step.result ? (step.result.isError ? 'error' : 'idle') : ['loading', 'idle', 'suspended'][index % 3]})),
      {icon: {type: 'image', url: 'https://example.com/favicon.ico', fallback: 'browser'}}, {icon: {type: 'image', url: 'https://cdn.example/s.png', fallback: 'skill'}},
      {children: 'child', runtime: {renderFileLink: () => 'link'}}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: TOOLS, text: textOf(TOOLS), blocks: ROUTES[TOOLS], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    renamed: renamedBindings});
  // The markdown link renderer a title hands its summary, called with real links under both runtimes.
  const linkRenderer = (element, depth = 0) => {
    if (!element || typeof element !== 'object' || depth > 40) return undefined;
    if (element.props?.components?.a) return element.props.components.a;
    for (const child of [element.props?.children].flat()) { const found = linkRenderer(child, depth + 1); if (found) return found; }
    return undefined;
  };
  const step = {call: {id: 'l1', name: 'edit_file', arguments: {path: 'src/a b.ts'}}, result: {content: [{type: 'text', text: 'ok'}], isError: false, details: {diff: '+a\n-b'}}, state: 'idle'};
  const routine = {call: {id: 'l2', name: 'routine_update', arguments: {mode: 'create', id: 'r/1', name: 'Brief', rrule: 'FREQ=DAILY;BYHOUR=8'}}, result: {content: [{type: 'text', text: 'ok'}]}, state: 'idle'};
  let links = 0;
  for (const scene of [{context: {}}, runtime(world)]) for (const props of [step, {...step, state: 'loading', result: undefined}, routine]) {
    world.enter(scene);
    const [a, b] = [linkRenderer(supplied.__kept_kl(props)), linkRenderer(ours.__kept_kl(props))];
    assert.equal(typeof b, typeof a);
    if (!a) continue;
    for (const href of ['#aux-file:src%2Fa%20b.ts', '#aux-routine:r%2F1', 'https://example.com/x', '']) {
      assert.equal(JSON.stringify(world.render(() => b({href, children: 'label'}), {}, scene)), JSON.stringify(world.render(() => a({href, children: 'label'}), {}, scene)), href);
      links++;
    }
  }
  assert.ok(links >= 8, `compared ${links} links`);
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name} ${JSON.stringify(args).slice(0, 160)}`);
  for (const code of ['await slack.chat.postMessage({channel: "c"}); slack.search.messages({})', 'x.conversations.history({}); x.chat.postMessage({})', 'gmail.users.messages.list(); notion.pages.create()',
    'imessage.sendMessage("hi")', 'slack.chat.postMessage(); gmail.users.list(); notion.pages.create()', 'twitter.tweet("x"); twitter.getClient()', 'linkedin.getProfile(); linkedin.update()', 'notion.pages.updatePage(); notion.blocks.append()',
    'googleAccounts.listAccounts(); googleAccounts.drive.files.retrieve()', 'gmail.x.y.z.read(); console.log(gmail)', 'const page = await tabs.openTab("u")', 'print(1)', '', undefined])
    for (const title of ['Click Send', '']) same('__kept_Cg', {code, title});
  for (const args of [{action: 'spawn'}, {action: 'resume'}, {action: 'wait'}, {action: 7}, {}]) { assert.equal(ours.__kept_Ll.hide({args}), supplied.__kept_Ll.hide({args})); assert.equal(ours.__kept_wl.hide({args}), supplied.__kept_wl.hide({args})); }
  for (const skill of [{name: 'Deep Research', path: 'deep-research'}, {name: 'deep-research', path: 'deep-research.md'}, {name: '', path: 'pdf-to-csv-api'}, {path: 'x-twitter'},
    {name: '  ', path: 'html-url'}, {name: 'skill.md', path: 'skill.md'}]) same('__kept_Cl', skill);
});

// Tool definitions passes 4 and 5: every tool's definition through the registry, each of its parts
// rendered with real results of that tool, with and without the host's renderers.
const cardArgs = {...toolArgs, path: 'src/app/main.ts', content: 'export const a = 1;\nexport const b = 2;', format: 'markdown', prompt: 'Build the settings page',
  code: 'await page.fill("#email", "ada@example.com"); await page.type(\'#pw\', `s3cret`); page.click("#go")', message: 'Ping the planner', todos: [
    {id: 't1', content: 'Read the spec', status: 'completed'}, {id: '', content: 'Write it', status: 'in_progress'}, {content: 'Plan', status: 'pending'}, {id: 't4', content: 'Drop', status: 'cancelled'}, {id: 't5', content: 'Odd', status: 'other'}]};
const cardResults = [
  {text: '<webfetch-citation source_id="s1"></webfetch-citation>\n# Docs\nThe page body', details: {diff: '@@ -1,2 +1,2 @@\n-old line\n+new line\n context', elapsedMs: 412.6, taskId: 'task-3', title: 'Settings page',
    items: [{url: 'https://www.example.com/a', title: 'Example A', faviconUrl: 'https://example.com/f.ico', lastVisitTime: 1793000000000}, {url: 'not a url', title: 'Local'}], openSettings: true}},
  {text: JSON.stringify({search_id: 's9', results: [{url: 'https://news.example/1', title: 'One'}, {url: 'https://b.example/2'}]}), details: {skipped: 'indexing'}},
  {text: '[Output too large, saved to out.json] {"search_id":"s2","results":[{"url":"https://c.example/x","title":"Cut"},{"title":"no url"}', details: {results: memoryResults()}},
  {text: JSON.stringify({items: [{url: 'https://d.example/', title: 'D', lastVisitTime: 1}]}), details: null},
  {text: 'Free plan can run up to 2 routines', details: {openSettings: false}}, {text: '', details: {items: 'nope'}},
  {text: '{"search_id":"e","results":[]}', details: {openSettings: 1}}, {text: '[Output too large] {"search_id":"t","results":[]', details: [1, 2]},
  {text: `${'long output line\n'.repeat(500)}`, details: 'not an object'},
];
function memoryResults() { return [{chunkId: 'k1', path: '/u/memory/people/ada.md', title: 'Ada', excerpt: 'tea', line: 4}]; }
function* cardSteps() {
  for (const name of [...toolNames, 'start_coder', 'webfetch', 'websearch']) for (const [index, {text, details}] of cardResults.entries())
    for (const state of ['loading', 'idle', 'error', 'suspended']) {
      const args = index % 2 ? {...cardArgs, action: 'list', format: 'text', title: 7, message: undefined, todos: []} : cardArgs;
      yield {call: {id: `k-${name}-${index}`, name, arguments: args}, args, result: state === 'loading' ? undefined : {content: [{type: 'text', text}], isError: state === 'error', details},
        resultText: state === 'loading' ? undefined : text, details: state === 'loading' ? undefined : details, state, sessionId: 's1'};
    }
}
// Enough of a partial JSON parser for a cut-off search result: closes what is still open.
const partialJson = text => {
  for (const tail of ['', '}', ']}', '}]}', '"}]}']) try { return JSON.parse(text + tail); } catch {}
  throw Error('unparseable');
};
test('the tool cards and the registry render like the supplied ones', async () => {
  const host = world => ({context: {showDeveloperOutput: true, renderMcpSettingsLink: world.stub('spy:mcpLink'), openMemoryFile: world.stub('spy:openMemory'),
    renderCoderCard: world.stub('spy:coderCard'), renderFileLink: world.stub('spy:fileLink')}, imports: {'*useCopy': () => ({copy: async () => true}), '*.parseJSON': partialJson}});
  const steps = [...cardSteps()];
  await assertParity({blocksByChunk: {[TOOLS]: ROUTES[TOOLS]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 3000, defaults: false,
    renamed: renamedBindings, scenes: [quiet({context: {}}), quiet(host), quiet({context: {}, state: [true], imports: {'./strip-markdown-DRcmtuJc.js#Xt': true}})],
    props: [...steps.filter((_, index) => index % 7 === 0), {title: 'Settings page', prompt: 'Build it', status: 'running', onOpen: () => {}}, {title: '', status: 'pending', onOpen: () => {}},
      {patch: '--- a.ts\n+++ a.ts\n@@ -1 +1 @@\n-a\n+b', stats: {addedLines: 1, removedLines: 1}, filename: 'a.ts', result: 'Boom', status: 'completed'},
      {options: {hunkSeparators: 'line-info'}, style: {color: 'red'}, patch: 'p', oldFile: {name: 'a', contents: 'x'}, newFile: {name: 'a', contents: 'y'}, status: 'cancelled'}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: TOOLS, text: textOf(TOOLS), blocks: ROUTES[TOOLS], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    renamed: renamedBindings});
  const json = value => JSON.stringify(value, (key, item) => (typeof item === 'function' ? `fn:${item.length}` : item));
  let parts = 0;
  for (const name of [...new Set([...toolNames, 'routine.update', 'mcp__linear__list', 'mcp_single'])]) {
    const [a, b] = [supplied.__kept_Hg(name), ours.__kept_Hg(name)];
    assert.deepEqual(Object.keys(b), Object.keys(a), name);
    for (const key of Object.keys(a)) {
      assert.equal(typeof b[key], typeof a[key], `${name}.${key}`);
      if (typeof a[key] !== 'function') { assert.equal(json(b[key]), json(a[key]), `${name}.${key}`); continue; }
      for (const step of steps.filter(step => step.call.name === name || step.call.name === 'repl').slice(0, 24)) for (const scene of [quiet({context: {}})(world), quiet(host)(world)]) {
        assert.equal(JSON.stringify(world.render(b[key], step, scene)), JSON.stringify(world.render(a[key], step, scene)), `${name}.${key} ${step.state}`);
        parts++;
      }
    }
  }
  assert.ok(parts > 1500, `compared ${parts} parts`);
  const same = (name, ...args) => assert.equal(JSON.stringify(ours[name](...args)), JSON.stringify(supplied[name](...args)), `${name} ${JSON.stringify(args).slice(0, 160)}`);
  for (const step of [...toolSteps()].slice(0, 400)) for (const options of [undefined, {isStreaming: false, isSuspended: true, sessionId: 's1'}, {isStreaming: true}])
    same('__kept_Vg', step.call, step.result, options);
  same('__kept_Vg', {id: 'x', name: 'bash'}, undefined, undefined);
  world.enter({imports: {'*.parseJSON': partialJson}});
  for (const {text} of cardResults) { same('__pair_parseSearchResults', text); same('__pair_stripCitation', text); }
  for (const {text, details} of cardResults) same('__kept_Vg', {id: 'v', name: 'webfetch', arguments: cardArgs}, {content: [{type: 'text', text}], details});
  world.enter();
  for (const code of [cardArgs.code, 'page.insertText(`a\\`b`); x.pressSequentially("q\\"r")', '']) same('__pair_redactTypedText', code);
  for (const args of [cardArgs, {file_path: 'C:\\w\\b.md', content: ''}, {path: 5}, {}]) for (const text of ['+a\n-b', '+a\n']) {
    same('__pair_editPatch', args, text); same('__pair_writePatch', args, text); same('__pair_fileNameArg', args); same('__pair_editDiffPatch', {args, details: {diff: text}});
  }
  for (const url of ['https://www.example.com/x', 'garbage', '']) same('__pair_hostLabel', url);
  world.enter();
  assert.equal(JSON.stringify(world.render(() => ours.__kept_Fg(ours.__pair_TodosCard, {args: cardArgs}), {})), JSON.stringify(world.render(() => supplied.__kept_Fg(supplied.__pair_TodosCard, {args: cardArgs}), {})));
  assert.equal(ours.__kept_Fg(null, {}), supplied.__kept_Fg(null, {}));
});
