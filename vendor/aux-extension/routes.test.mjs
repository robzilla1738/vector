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
const signedIn = {data: {accountId: 7, mode: 'cloud', authStatus: 'active', browserProfile: 'p'}};
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
    './strip-markdown-DRcmtuJc.js#nr': {data: {mode: 'local'}}, './strip-markdown-DRcmtuJc.js#tr': {data: {mode: 'local'}},
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

