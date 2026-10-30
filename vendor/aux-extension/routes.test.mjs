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
import {EDITS} from '../provided/polish/integration.mjs';

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

// Under bare stubs these two start async work that can only reject (sign out, and an error report
// with no URL), after the test has ended; their own tests below run them on real fixtures.
const stubbableRoutes = Object.fromEntries(Object.entries(ROUTES).filter(([chunk]) => !['assets/-utils-B_lbplVm.js', 'assets/error-tracking-B1YG2RRM.js'].includes(chunk)));

test('every Aux-owned route renders, runs its effects and handles events like the one it replaces', async () => {
  await assertParity({blocksByChunk: stubbableRoutes, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 600, scenes: [...routeScenes, ...conversationScenes],
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
      assert.ok(new RegExp(`\\.${pattern}(?:\\s*[{,[:>*)]|\\s+\\w)`).test(css), `${file}: .${name} is not compiled`);
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

// The chat commands: new, clear (confirmed, then failing) and compact (failing).
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
    for (const [name, detail] of [['new'], ['clear'], ['compact', 'Keep the plan'], ['other']]) calls.push([name, command(name, detail)]);
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
// skill; the MCP setup and questions.
test('the Developers page renders like the supplied one with the CLI, agents and MCP', async () => {
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

test('the Developers page lists the questions and agents, and its questions match what ships', async () => {
  const chunk = 'assets/developers-DTvaoVBC.js';
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const name of ['__pair_CLI_QUESTIONS', '__pair_SKILL_AGENTS', '__pair_CLI_ILLUSTRATION'])
    assert.equal(JSON.stringify(ours[name]), JSON.stringify(supplied[name]), name);
  const questions = JSON.stringify(ours.__pair_CLI_QUESTIONS);
  for (const tool of ['open', 'tabs', 'spaces', 'chats', 'status', 'resolve', 'ask']) assert.match(questions, new RegExp(`\`${tool}\``));
  assert.doesNotMatch(questions, /Playwright|browsing history|memory|signed-in|sign in|Remote Control/i);
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

// Onboarding: the New Tab chip row (deliberately no fold) in Ask and Search mode; the
// layout parts and the field group with their props; Continue pressing on Enter.
test('the onboarding helper, layout parts and field group render like the supplied ones', async () => {
  const scene = (world, {mode = 'ask', key = 'Enter', target = {}} = {}) => ({event: {key, target, currentTarget: {scrollIntoView: world.stub('spy:scroll')},
    preventDefault: world.stub('spy:preventDefault')}, imports: {
    './newtab-CnOLQ0yu.js#o': {omniboxMode: mode}, './newtab-CnOLQ0yu.js#s': {accountId: 7},
    './strip-markdown-DRcmtuJc.js#N': {broadcast: world.stub('spy:broadcast')}, './extension-page-url-BH3pfT7h.js#a': world.stub('spy:openPage'),
    './strip-markdown-DRcmtuJc.js#dn': () => false}});
  const blocksByChunk = Object.fromEntries(['assets/onboarding-helper-BVYyPOep.js', 'assets/onboarding-layout-MxuCwWDr.js', 'assets/onboarding-field-group-BpfduoJC.js']
    .map(chunk => [chunk, ROUTES[chunk]]));
  await assertParity({blocksByChunk, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {mode: 'search'}), world => scene(world, {key: 'Escape'})],
    props: [{children: 'Step', className: 'probe', variant: 'default', size: 'lg', id: 'x'}, {children: ['a', 'b'], variant: 'outline'}, {}]});
});

test('the onboarding suggestions and controls match the supplied ones', async () => {
  const world = createWorld();
  const pair = async chunk => evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  const helper = await pair('assets/onboarding-helper-BVYyPOep.js');
  assert.equal(JSON.stringify(helper.ours.__pair_SUGGESTIONS), JSON.stringify(helper.supplied.__pair_SUGGESTIONS));
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
  for (const name of ['__kept_le', '__kept_E', '__pair_PLATFORM_SETUP', '__pair_NO_PROJECT', '__pair_CREDENTIALS_FORM_ID', '__pair_COVER']) assert.equal(json(ours[name]), json(supplied[name]), name);
  for (const platform of ['slack', 'telegram', 'discord']) assert.equal(ours.__pair_guideUrl(platform), supplied.__pair_guideUrl(platform));
});

// Memory: files, a file in preview and edit, history entries with their changes and session, and the settings.
const memoryChunks = ['assets/route-CJZWzPOz.js', 'assets/files-DqqxHH6i.js', 'assets/histories-CpU8qS5w.js', 'assets/settings-DguZi_c6.js', 'assets/import-DX5BoL4B.js'];
test('the Memory pages render like the supplied ones with files and history', async () => {
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
// searching, the default option, loading, empty and error states.
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
    onChange: world.stub('spy:change'), isThinkingOpen: true, onThinkingOpenChange: world.stub('spy:thinkingOpen'), ...extra});
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
      world => scene(world, {isOpen: false, isThinkingOpen: false, selectedModel: {...selected, thinkingLevel: 'max', fastMode: false}}),
      world => scene(world, {selectedModel: {...selected, supportsFastMode: false, availableThinkingLevels: []}}),
      world => scene(world, {}, {event: {key: '2', defaultPrevented: false, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, preventDefault: world.stub('spy:prevent'),
        stopPropagation: world.stub('spy:stop'), target: {value: 'gp'}, currentTarget: {closest: () => null}}})],
    props: [world => ({checked: true, disabled: false, onCheckedChange: world.stub('spy:checked'), compact: false, animated: true, className: 'probe', thinking: true, shortcut: 'model',
      children: 'child', menuSize: 'sm', submenu: true, provider: selectable[2], onRetry: world.stub('spy:retry')}),
      world => ({checked: false, disabled: true, compact: true, tooltipAlign: 'start', thinking: false, shortcut: 'thinking', submenu: false, onCheckedChange: world.stub('spy:checked')}),
      {disabled: true, animated: false},
      world => ({value: {provider: 'anthropic', modelId: 'opus', thinkingLevel: 'max', fastMode: true}, allowDefaultOption: true, proactiveMode: false,
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

// Small chunks: the New Tab nudges, the chat error alert and the file tree, each with the data it reads.
test('the New Tab nudges, the error alert and the file tree render like the supplied ones', async () => {
  const chunks = ['assets/nudges-7TFAp4B-.js', 'assets/error-alert-Bu3EEewB.js', 'assets/file-tree-YTG8I4Hr.js'];
  const nudge = (world, browser, extra = {}) => ({imports: {'./strip-markdown-DRcmtuJc.js#nr': {data: browser, isLoading: false, refetch: world.stub('spy:refetch')},
    './utils-BEeo4-cB.js#t': {isDismissed: false, dismiss: world.stub('spy:dismiss')}, './browser-color-scheme-Df5VSuPV.js#r': true,
    './strip-markdown-DRcmtuJc.js#er': options => ({mutate: world.stub('spy:mutate'), isPending: false, options}), './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')},
    './use-agent-settings-DiedG0R1.js#n': {isLoading: false, modelProvider: 'anthropic'}, './strip-markdown-DRcmtuJc.js#qt': {accountId: 7}, ...extra}});
  const alert = (world, classified, meta = {}, detailsOpen = false) => ({actions: {retry: world.stub('spy:retry'), addCredits: world.stub('spy:addCredits'),
    upgrade: world.stub('spy:upgrade'), report: world.stub('spy:report')}, meta, state: {classified, details: classified.details, detailsOpen}, toggleDetails: world.stub('spy:toggle')});
  const kinds = [{kind: 'auth', title: 'Sign in again', description: 'The provider signed you out'}, {kind: 'disk-full', title: 'Disk full', description: 'Free space', details: 'ENOSPC'},
    {kind: 'generic', title: 'Something failed', description: 'Try again', reportable: true, details: 'stack'}, {kind: 'aborted', title: 'Stopped', description: 'You stopped it'},
    {kind: 'credits-aux-v2', title: 'Out of credits', description: 'Add credits', actions: ['addCredits', 'upgrade']}, {kind: 'credits-other', title: 'Provider credits', description: 'Top up'},
    {kind: 'rate-limit', title: 'Slow down', description: 'Rate limited'}, {kind: 'overloaded', title: 'Busy', description: 'Overloaded'}, {kind: 'provider-server', title: 'Provider error', description: '500'}];
  const nodes = [{type: 'directory', path: 'notes', name: 'notes', children: [{type: 'file', path: 'notes/plan.md', name: 'plan.md'},
    {type: 'directory', path: 'notes/old', name: 'old', children: [{type: 'file', path: 'notes/old/a.txt', name: 'a.txt', trailing: '2 KB'}]}]},
    {type: 'file', path: 'readme.md', name: 'readme.md', icon: 'custom-icon'}, {type: 'file', path: 'data.csv', name: 'data.csv'}];
  await assertParity({blocksByChunk: Object.fromEntries(chunks.map(chunk => [chunk, ROUTES[chunk]])), textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    minimum: 400, defaults: false, renamed: renamedBindings, scenes: [
      world => ({...nudge(world, {isDefault: false, canSet: true}), state: ['hidden'], context: alert(world, kinds[2], {}, true)}),
      world => ({...nudge(world, {isDefault: false, canSet: false, policyDisabled: false}), state: ['pending'], context: alert(world, kinds[4], {compact: true, className: 'probe'})}),
      world => ({...nudge(world, {isDefault: true}, {'./strip-markdown-DRcmtuJc.js#qt': null}), context: alert(world, kinds[0])}),
      world => ({...nudge(world, {policyDisabled: true}, {'./utils-BEeo4-cB.js#t': {isDismissed: true, dismiss: world.stub('spy:dismiss')}}), context: alert(world, kinds[3])}),
      ...kinds.slice(5).concat(kinds[1], kinds[4]).map(kind => world => ({...nudge(world, undefined, {'./browser-color-scheme-Df5VSuPV.js#r': false}), context: alert(world, kind, {}, true)})),
    ],
    props: [world => ({accountId: 7, className: 'probe', from: 'user', children: 'child', title: 'Out of credits', description: 'Add credits to continue', icon: 'abort', tone: 'destructive',
      actionsBelow: true, primary: true, onClick: world.stub('spy:onClick'), classified: kinds[2], actions: {retry: world.stub('spy:retry')}, meta: {compact: true},
      nodes, ariaLabel: 'Files', selectedPath: 'notes/old/a.txt', renderIcon: world.stub('spy:renderIcon'), onSelect: world.stub('spy:onSelect'), depth: 1,
      expandedPaths: new Set(['notes', 'notes/old']), node: nodes[0], onToggleDirectory: path => () => path}),
      {from: 'assistant', title: 'Hi', description: 'there', icon: 'brand', tone: 'muted', classified: kinds[0], nodes, expandAllByDefault: true, ariaLabel: 'All', node: nodes[1],
        depth: 0, expandedPaths: new Set(), selectedPath: 'readme.md', onSelect: () => () => 1, onToggleDirectory: () => () => 2},
      {icon: 'warning', tone: 'default', nodes: [], node: nodes[2], expandedPaths: new Set(), onSelect: () => () => 0, onToggleDirectory: () => () => 0}, {icon: undefined, children: 'Retry'}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk: chunks[2], text: textOf(chunks[2]), blocks: ROUTES[chunks[2]], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES,
    renamed: renamedBindings});
  for (const path of ['notes/old/a.txt', 'a', '', 'x/y/z/w.md']) assert.equal(JSON.stringify(ours.__pair_ancestorPaths(path)), JSON.stringify(supplied.__pair_ancestorPaths(path)));
  assert.equal(JSON.stringify(ours.__pair_directoryPaths(nodes)), JSON.stringify(supplied.__pair_directoryPaths(nodes)));
  for (const path of ['a.md', 'a.MD', 'a.txt']) assert.equal(ours.__pair_iconFor(path) === ours.__pair_FileIcon, supplied.__pair_iconFor(path) === supplied.__pair_FileIcon);
});

test('the Agent panel header renders and acts like the supplied one', async () => {
  const chunk = 'assets/-components-4o0FSqQ9.js';
  const header = (world, os, layout, sessionId) => ({context: {currentSessionId: sessionId}, imports: {'./strip-markdown-DRcmtuJc.js#Bn': {os},
    './utils-DCBm67_n.js#v': {data: layout}, './context-q_vohNW8.js#n': {navigate: world.stub('spy:navigate')}, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [
      world => header(world, 'windows', 'vertical', 's 1'),
      world => header(world, 'windows', 'horizontal', null),
      world => header(world, 'macos', 'vertical', 's2'),
      world => header(world, 'macos', 'horizontal', ''),
    ],
    props: [world => ({leading: world.stub('leading')}), {}]});
});

test('the capture toolbar picks modes, captures, closes and drags like the supplied one', async () => {
  const chunk = 'assets/capture-toolbar-HNeL44hk.js';
  const imports = world => ({'./translate-status-K6en4VW6.js#l': {ref: world.stub('frameRef'), sendMessage: world.stub('spy:send')},
    './use-messaging-DRNeToXk.js#r': world.stub('spy:sendMessage')});
  const pointer = (world, x, y, onButton) => ({screenX: x, screenY: y, pointerId: 3, target: onButton ? {closest: () => world.stub('button')} : null,
    currentTarget: {setPointerCapture: world.stub('spy:capture'), hasPointerCapture: () => true, releasePointerCapture: world.stub('spy:release')},
    preventDefault: world.stub('spy:preventDefault'), key: 'Escape'});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: imports(world), state: {mode: 'area', status: 'error', errorMessage: 'Capture failed'}, event: pointer(world, 10, 20, false)}),
      world => ({imports: imports(world), state: {mode: 'full', status: 'capturing'}, event: pointer(world, 0, 0, true)}),
      world => ({imports: imports(world), state: {mode: 'viewport', status: 'idle', errorMessage: ''},
        event: {...pointer(world, 5, 5, false), type: 'CAPTURE_TOOLBAR_SYNC', mode: 'area', status: 'idle'}}),
    ],
    props: [world => ({disabled: true, mode: 'full', errorMessage: 'Nope', status: 'error'}), {mode: 'area', status: 'capturing'}, {}]});
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const message of [{type: 'CAPTURE_TOOLBAR_SYNC'}, {type: 'SYNC'}, null, 'CAPTURE_TOOLBAR_SYNC', {}])
    assert.equal(ours.__pair_isSyncMessage(message), supplied.__pair_isSyncMessage(message));
});

test('the Messages access card and button render and set up access like the supplied ones', async () => {
  const chunk = 'assets/full-disk-access-BmnWkbG2.js';
  const access = (world, mac, status, session) => ({imports: {'./platform-CX_yPATJ.js#a': mac, './strip-markdown-DRcmtuJc.js#nr': {data: status && {status}},
    './context-q_vohNW8.js#r': session && {currentSession: {id: session}}, './strip-markdown-DRcmtuJc.js#N': {broadcast: world.stub('spy:broadcast')},
    './strip-markdown-DRcmtuJc.js#er': {mutateAsync: async () => ({completed: true})}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({...access(world, true, 'granted', 's1'), state: [false]}),
      world => ({...access(world, true, 'denied', 's1'), state: [true]}),
      world => ({...access(world, true, null, null), state: [false]}),
      world => ({...access(world, false, 'denied', 's1'), state: [false]}),
    ],
    props: [world => ({label: 'Allow', onGranted: world.stub('spy:onGranted'), size: 'sm', className: 'probe'}), {}]});
});

test('Notification Use lists grants and recent notifications like the supplied page', async () => {
  const chunk = 'assets/inbox-BIWs6dWb.js';
  const overview = {notificationGrants: [{origin: 'https://www.mail.example', grantedAt: '2026-10-01T12:00:00Z'}, {origin: 'not a url', grantedAt: null}],
    messages: [{id: 'n1', content: 'New mail', source: 'web-push-notification', from: {id: 'mail', name: 'Mail'}, metadata: {origin: 'https://mail.example'},
      receivedAt: '2026-10-01T12:00:00Z', deliveryState: 'delivered'},
    {id: 'n2', content: 'Own', source: 'web-push-notification', from: {id: ' aux-extension-id '}, metadata: {}, deliveryState: 'failed'},
    {id: 'n3', content: 'Own URL', source: 'web-push-notification', from: null, metadata: {contextUrl: 'chrome-extension://aux-extension-id/x'}, deliveryState: 'pending'},
    {id: 'n4', content: 'Other', source: 'channel', from: {name: 'Bot'}, metadata: {}, deliveryState: 'pending'},
    ...['n5', 'n6'].map(id => ({id, content: id, source: 'channel', metadata: {}, deliveryState: 'delivered'}))]};
  // useQuery runs its select on the overview, as react-query would.
  const query = options => ({data: options?.select ? options.select(overview) : overview});
  const queryEmpty = options => ({data: options?.select ? options.select({}) : {}});
  const trpc = world => ({inbox: {overview: {queryOptions: (input, options) => ({...options, input}), queryKey: input => ['inbox', input]},
    revokeNotificationGrant: {mutationOptions: options => options}}, toString: () => 'trpc'});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 6, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: {'./strip-markdown-DRcmtuJc.js#nr': query, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './queries-ldd77hNk.js#_': trpc(world),
        './strip-markdown-DRcmtuJc.js#M': {confirm: (options, run) => world.stub('spy:confirm')(options, run())}}}),
      world => ({imports: {'./strip-markdown-DRcmtuJc.js#nr': queryEmpty, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './queries-ldd77hNk.js#_': trpc(world)}}),
    ],
    props: [{}]});
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const origin of ['https://www.a.example', 'https://a.www.example', 'nope', ''])
    assert.equal(ours.__pair_siteName(origin), supplied.__pair_siteName(origin));
});

// A small UTC dayjs: just what the Statistics page calls.
const DAY = 864e5;
const dayjs = at => {
  const ms = at === undefined ? Date.UTC(2026, 9, 30, 15) : new Date(at).valueOf();
  const d = new Date(ms);
  const self = {
    valueOf: () => ms, toISOString: () => d.toISOString(), date: () => d.getUTCDate(),
    startOf: () => dayjs(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
    day: n => dayjs(ms + (n - d.getUTCDay()) * DAY), add: n => dayjs(ms + n * DAY), subtract: n => dayjs(ms - n * DAY),
    isAfter: other => ms > other.valueOf(), isBefore: other => ms < other.valueOf(),
    isSame: other => Math.floor(ms / DAY) === Math.floor(other.valueOf() / DAY),
    format: pattern => ({'YYYY-MM-DD': d.toISOString().slice(0, 10), 'YYYY-MM': d.toISOString().slice(0, 7),
      MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]})[pattern],
  };
  return self;
};

test('Statistics counts sessions and draws the heatmap like the supplied page', async () => {
  const chunk = 'assets/statistics-CsvIURox.js';
  const sessions = ['2026-10-30T09:00:00Z', '2026-10-30T10:00:00Z', '2026-10-01T09:00:00Z', '2026-09-01T09:00:00Z', '2026-08-09T09:00:00Z', '2026-08-01T09:00:00Z',
    '2025-01-01T00:00:00Z'].map((createdAt, index) => ({id: `s${index}`, createdAt}));
  const scene = list => ({imports: {'./extension-main-Dz1-AsCT.js#l.useParams': {userId: '7'}, './strip-markdown-DRcmtuJc.js#tr': {data: list},
    './date-CxUVm-Dr.js#n.default': dayjs}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 4, defaults: false,
    renamed: renamedBindings, scenes: [scene(sessions), scene([])], props: [{}, {className: 'probe'}]});
});

test('Archived chats pages, unarchives and deletes like the supplied page', async () => {
  const chunk = 'assets/archived-chats-BgWKiXTB.js';
  const chats = Array.from({length: 21}, (_, index) => ({id: `c${index}`, title: `Chat ${index}`, previewText: index % 2 ? `**Preview** ${index}` : '', updatedAt: '2026-10-01'}));
  const scene = (world, page, query) => ({imports: {'./extension-main-Dz1-AsCT.js#y.useParams': {userId: '7'}, './extension-main-Dz1-AsCT.js#y.useSearch': {page},
    './extension-main-Dz1-AsCT.js#y.useNavigate': world.stub('spy:navigate'), './strip-markdown-DRcmtuJc.js#nr': query,
    './strip-markdown-DRcmtuJc.js#M': {confirm: (options, run) => world.stub('spy:confirm')(options, run())},
    './strip-markdown-DRcmtuJc.js#er': {isPending: page === 3, mutateAsync: world.stub('spy:mutateAsync')}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 12, defaults: false,
    renamed: renamedBindings, scenes: [
      world => scene(world, 1, {data: chats, isLoading: false, refetch: world.stub('spy:refetch')}),
      world => scene(world, 2, {data: chats.slice(0, 3), isLoading: false}),
      world => scene(world, 3, {data: [], isLoading: false}),
      world => scene(world, 2, {data: [], isLoading: false}),
      world => scene(world, 1, {isLoading: true}),
      world => scene(world, 2, {error: new Error('x'), isLoading: false, refetch: world.stub('spy:refetch')}),
    ],
    props: [{item: chats[1]}, {item: chats[0]}]});
});

test('the New Tab search suggestions highlight, open, act and delete like the supplied ones', async () => {
  const chunk = 'assets/search-view-gCFKEZ8L.js';
  const matches = [
    {line: 0, item: {type: 'search-what-you-typed', isSearchType: true, description: '', contents: 'aux browser', destinationUrl: 'https://search.example/?q=aux'}},
    {line: 1, item: {type: 'history-url', description: 'Aux — the browser', contents: 'aux.example/docs', destinationUrl: 'https://aux.example/docs',
      supportsDeletion: true, iconUrl: 'icon.png', actions: [{hint: 'Switch to this tab'}, {hint: 'Pin'}]}},
    {line: 2, item: {type: 'url', hasInstantKeyword: true, description: '@tabs - Search tabs', fillIntoEdit: '@tabs', imageUrl: 'img.png'}},
    {line: 3, item: {type: 'navsuggest', description: 'Résumé café', contents: '', destinationUrl: 'https://cafe.example/'}},
  ];
  const search = (world, extra = {}) => ({activateScopeMatch: (item, line) => (world.stub('spy:activateScopeMatch')(item, line), line === 2), displayedMatches: matches, hasManualSelection: false,
    matchesInput: 'au br', removeMatch: world.stub('spy:removeMatch'), scope: null, selection: {line: 1}, session: {sessionId: 'o1'},
    setSelection: world.stub('spy:setSelection'), clearSearchState: world.stub('spy:clearSearchState'), ...extra});
  const scene = (world, extra, imports = {}) => ({imports: {'./newtab-CnOLQ0yu.js#i': search(world, extra), './newtab-CnOLQ0yu.js#t': item => (item.fillIntoEdit ? {keyword: 'tabs'} : null),
    './omnibox-scope-DGFEg60F.js#t': keyword => (keyword === 'tabs' ? world.stub('TabsIcon') : null), './newtab-CnOLQ0yu.js#r': item => item.type === 'history-url',
    './search-navigation-TWhZq3-H.js#t': url => (url?.includes('search.example') ? world.stub('searchPage') : null), './newtab-CnOLQ0yu.js#n': () => null, ...imports},
  event: {movementX: 0, movementY: 1, preventDefault: world.stub('spy:preventDefault'), stopPropagation: world.stub('spy:stopPropagation')}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 12, defaults: false,
    renamed: renamedBindings, scenes: [
      world => scene(world, {}),
      world => scene(world, {scope: 'tabs', hasManualSelection: true, session: null, selection: null}),
      world => scene(world, {matchesInput: ''}, {'./newtab-CnOLQ0yu.js#n': () => '/u/7/tasks'}),
      world => scene(world, {displayedMatches: []}),
    ],
    props: [world => ({isOpen: true, ref: world.stub('spy:ref')}), {isOpen: false, ref: {current: null}}]});
  const {supplied, ours} = await evaluatePair({world: createWorld(), chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute,
    changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const [text, query] of [['Aux — the browser', 'au br'], ['Résumé café', 'resume'], ['a-b_c/d', 'abcd'], ['hello', 'xyz'], ['', 'a'], ['abc', '   '], ['ＡＢＣ', 'abc']])
    assert.equal(JSON.stringify(ours.__pair_highlightSegments(text, query)), JSON.stringify(supplied.__pair_highlightSegments(text, query)));
  for (const [segments, hint] of [[[{text: '@tabs - Search tabs'}], '@tabs'], [[{text: 'Search tabs - @tabs'}], '@tabs'], [[{text: '@tabs'}], '@tabs'], [[{text: 'x'}], '@h']])
    assert.equal(JSON.stringify(ours.__pair_withoutScopeHint(segments, hint)), JSON.stringify(supplied.__pair_withoutScopeHint(segments, hint)));
  for (const [item, line] of [[{destinationUrl: 'https://a', type: 't'}, 1], [{fillIntoEdit: 'f'}, 2], [{}, 3]])
    assert.equal(ours.__pair_suggestionKey(item, line), supplied.__pair_suggestionKey(item, line));
  assert.equal(ours.__pair_bytesToBase64(new Uint8Array([104, 105, 255]).buffer), supplied.__pair_bytesToBase64(new Uint8Array([104, 105, 255]).buffer));
});

test('the capture result frame, file name, button and message check match the supplied ones', async () => {
  const chunk = 'assets/capture-result-nUfmrYC9.js';
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 6, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: {'./translate-status-K6en4VW6.js#o.useSearch': {frameId: 'f1'}, './translate-status-K6en4VW6.js#l': {ref: world.stub('frameRef')}}}),
    ],
    props: [world => ({'aria-label': 'Copy', label: 'Copy', onClick: world.stub('spy:onClick'), children: 'icon'}), {children: 'child'}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES});
  assert.equal(ours.__kept_$(new Date(2026, 0, 2, 3, 4, 5)), supplied.__kept_$(new Date(2026, 0, 2, 3, 4, 5)));
  assert.match(ours.__kept_$(new Date(2026, 0, 2, 3, 4, 5)), /^aux-capture-20260102-030405\.png$/);
  for (const url of ['data:image/png;base64,aGk=', 'data:text/plain,hi%20there', 'data:,x']) {
    const [mine, theirs] = [ours.__kept_f(url), supplied.__kept_f(url)];
    assert.deepEqual([mine.type, mine.size], [theirs.type, theirs.size]);
    assert.equal(await mine.text(), await theirs.text());
  }
  assert.throws(() => ours.__kept_f('nope'), /Invalid data URL/);
  for (const message of [{type: 'CAPTURE_RESULT_SYNC'}, {type: 'CAPTURE_RESULT_LANDED'}, {type: 'x'}, null, 'x', {}])
    assert.equal(ours.__kept_H(message), supplied.__kept_H(message));
});

test('the browser importer lists targets, starts imports and draws its dialogs like the supplied one', async () => {
  const chunk = 'assets/use-browser-importer-GNOc7eYC.js';
  const sources = [{id: 'chrome', name: 'Chrome', profiles: [{id: 'p1', name: 'Work'}, {id: 'p2', name: 'Home'}]}, {id: 'arc', name: 'Arc', profiles: []},
    {id: 'safari', name: 'Safari', profiles: [], requiresFileImport: true}, {id: 'brave', name: 'Brave', profiles: [{id: 'b1', name: 'Default'}]}];
  const detected = [{name: 'Chrome', profiles: [{id: 'p1', name: 'Work', lastUsedAt: '2026-10-01'}]}, {name: 'Safari', profiles: [{id: 't', lastUsedAt: '2026-02-01'}, {id: 's', lastUsedAt: '2026-01-01'}]},
    {name: 'Edge', profiles: []}];
  const imports = (os = 'macos') => ({'./strip-markdown-DRcmtuJc.js#Bn': {os}, './useQueries-CrOl5VwX.js#t': options =>
    options.combine([{data: detected}, {data: sources}, {data: ['arc', 'chrome:p1']}])});
  const event = world => ({key: 'Enter', nativeEvent: {isComposing: false}, preventDefault: world.stub('spy:preventDefault'), stopPropagation: world.stub('spy:stopPropagation'),
    target: {files: [{name: 'export.zip', arrayBuffer: async () => new ArrayBuffer(1)}]}});
  const dialogs = [{type: 'grant-permission', source: sources[0], navigateToProgress: true, sourceProfileId: 'p1'}, {type: 'profile-select', source: sources[0], dataKinds: ['history'], navigateToProgress: false},
    {type: 'safari-file-import', source: sources[2], dataKinds: ['bookmarks'], navigateToProgress: true}];
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 12, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: imports(), event: event(world)}),
      world => ({imports: imports('windows'), state: [''], event: {...event(world), key: 'Escape', target: {files: [{name: 'a.txt'}]}}}),
      world => ({imports: imports(), state: ['p2', true], event: {...event(world), nativeEvent: {isComposing: true}, target: {files: []}}}),
    ],
    props: [...dialogs.map(dialog => world => ({dialog, onOpenChange: world.stub('spy:onOpenChange'), onProceed: world.stub('spy:onProceed'), onDialogChange: world.stub('spy:onDialogChange'),
      onResolve: world.stub('spy:onResolve')})), {dialog: null}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const sourceMap = new Map(sources.map(source => [source.id, source]));
  const profiles = new Map([['chrome', [{id: 'p1', name: 'Work', lastUsedAt: '2026-10-01'}]], ['safari', [{id: 't', lastUsedAt: '2026-02-01'}, {id: 's', lastUsedAt: '2026-01-01'}]]]);
  const targets = ours.__pair_importTargets(sourceMap, profiles, new Set(['arc', 'chrome:p1']));
  assert.equal(JSON.stringify(targets), JSON.stringify(supplied.__pair_importTargets(sourceMap, profiles, new Set(['arc', 'chrome:p1']))));
  for (const list of [targets, targets.map(target => ({...target, alreadyImported: true})), targets.map(target => ({...target, detected: false, alreadyImported: false})),
    [{id: 'a', detected: false, alreadyImported: false}, {id: 'b', detected: true, alreadyImported: false}]])
    assert.equal(JSON.stringify(ours.t(list)), JSON.stringify(supplied.t(list)));
  const scene = os => ({imports: imports(os)});
  for (const [target, options, os] of [[targets[0], undefined, 'macos'], [{...targets[1], alreadyImported: true}, undefined, 'macos'], [{...targets[1], alreadyImported: true}, {dataKinds: ['cookies']}, 'macos'],
    [targets.find(target => target.kind === 'file'), {navigateToProgress: false}, 'macos'], [targets[1], undefined, 'windows'], [targets.find(target => target.kind === 'source'), undefined, 'macos']]) {
    const start = hook => () => hook().importTarget(target, options);
    assert.equal(JSON.stringify(world.render(start(ours.n), {}, scene(os))), JSON.stringify(world.render(start(supplied.n), {}, scene(os))));
  }
});

test('onboarding import lists browsers, folds the rest and starts imports like the supplied page', async () => {
  const chunk = 'assets/import-browser-DwQpkFpc.js';
  const source = (id, name) => ({id, name});
  const profile = (id, sourceId, name, lastUsedAt, alreadyImported = false) => ({kind: 'profile', id: `${sourceId}:${id}`, source: source(sourceId, name), label: name, description: id, detected: true, alreadyImported, lastUsedAt});
  const targets = [profile('p1', 'chrome', 'Chrome', '2026-10-01'), profile('p2', 'chrome', 'Chrome', '2026-10-05'), {kind: 'source', id: 'arc', source: source('arc', 'Arc'), label: 'Arc', detected: true, alreadyImported: true},
    {kind: 'file', id: 'safari', source: source('safari', 'Safari'), label: 'Safari', detected: true, alreadyImported: false, lastUsedAt: '2026-10-09'},
    profile('b1', 'brave', 'Brave', '2026-09-01'), profile('e1', 'edge', 'Edge', '2026-08-01'), profile('v1', 'vivaldi', 'Vivaldi', '2026-07-01'), {kind: 'source', id: 'gone', source: source('gone', 'Gone'), detected: false, alreadyImported: false}];
  const importer = (world, list) => ({targets: list, importTarget: world.stub('spy:importTarget'), dialogs: 'dialogs'});
  const imports = (world, list, reduced = false) => ({'./use-browser-importer-GNOc7eYC.js#n': importer(world, list), './strip-markdown-DRcmtuJc.js#Xt': reduced,
    './use-browser-importer-GNOc7eYC.js#t': options => options.find(target => !target.alreadyImported) ?? options[0], './strip-markdown-DRcmtuJc.js#Ut': {track: world.stub('spy:track')}});
  const browsers = [{source: source('chrome', 'Chrome'), targets: targets.slice(0, 2), alreadyImported: false, requiresProfileSelection: true},
    {source: source('arc', 'Arc'), targets: [targets[2]], alreadyImported: true, requiresProfileSelection: false}];
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 20, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: imports(world, targets)}),
      world => ({imports: imports(world, targets.slice(0, 3)), state: ['arc', 'profile']}),
      world => ({imports: imports(world, targets.slice(0, 2), true), state: ['chrome', 'browser']}),
      world => ({imports: imports(world, [])}),
      world => ({imports: imports(world, targets), state: ['safari', 'browser', true, true]}),
      world => ({imports: imports(world, targets.slice(0, 5))}),
      world => ({imports: imports(world, targets), state: ['profile', 'chrome', '', false]}),
    ],
    props: [world => ({browsers, initialBrowserId: 'chrome', initialStep: 'browser', onCancel: world.stub('spy:onCancel'), onImport: world.stub('spy:onImport'), label: 'Chrome', selected: true,
      disabled: true, children: 'child', onClick: world.stub('spy:onClick')}),
    world => ({browsers, initialBrowserId: 'chrome', initialStep: 'profile', onCancel: world.stub('spy:onCancel'), onImport: world.stub('spy:onImport'), disabled: false, children: 'child'})]});
});

test('the chat preview card shows a task, its artifacts and its prompts like the supplied one', async () => {
  const chunk = 'assets/chat-preview-card-J0uel3r2.js';
  const reply = {role: 'assistant', content: [{type: 'text', text: 'Done ![chart](artifacts/chart.png) and ![x](<output/a b.png>)\n```aux-draft\n{"a":1}\n```\n```js\nx\n```'},
    {type: 'image', mimeType: 'image/png', data: 'AA'}]};
  const run = {startedAt: '2026-10-30T11:00:00Z', userMessage: [{role: 'user', content: 'Plan it'}, {role: 'system'}], finalAssistantMessage: [reply],
    filesChanged: [{path: 'output/report.pdf', artifact: {sizeBytes: 10}}, {path: 'output/page.html', artifact: {sizeBytes: 5}}, {path: 'skip.txt'}, {path: 'output/report.pdf', artifact: {sizeBytes: 10}}, {path: 'x/photo.PNG?v=1', artifact: {sizeBytes: 1}}]};
  const base = {id: 's1', title: 'Report', status: 'completed', updatedAt: '2026-10-30T10:00:00Z', latestRun: run, pinned: true, unread: true};
  const sessions = [base, {...base, status: 'running', activeTabTargetId: 't1'}, {...base, status: 'suspended', suspension: {kind: 'ask-user-question', id: 'q', toolCallId: 'c1', request: {questions: []}}},
    {...base, status: 'suspended', routine: {id: 'r1', name: 'Digest', scheduleLabel: 'Daily'}, trigger: {type: 'standalone-routine'}, suspension: {kind: 'approval', id: 'a', toolCallId: 'c2', request: {scope: 'x', source: {taskId: 't'}}}},
    {...base, status: 'suspended', suspension: {kind: 'action-confirmation', toolCallId: 'c3', createdAt: 'now', request: {}}}, {...base, status: 'interrupted', routine: {id: 'r1', name: 'Digest', scheduleLabel: 'Daily'},
      trigger: {type: 'channel', channel: 'slack'}, channel: {name: 'ops'}, latestRun: {...run, filesChanged: [], finalAssistantMessage: []}, activeTabTargetId: 't1'},
    {...base, latestRun: {...run, filesChanged: [{path: 'output/one.pdf', artifact: {sizeBytes: 2}}], finalAssistantMessage: []}},
    {...base, latestRun: {...run, filesChanged: [{path: 'output/shot.png', artifact: {sizeBytes: 2}}], finalAssistantMessage: []}}];
  const imports = (extra = {}) => ({'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#nr': {data: [{id: 'c1', name: 'read'}]},
    './strip-markdown-DRcmtuJc.js#zt': message => message.content?.[0]?.text ?? '', './strip-markdown-DRcmtuJc.js#tt': () => null, './strip-markdown-DRcmtuJc.js#it': text => text,
    './tool-definition-registry-Cc6FCFb2.js#t': () => ({hide: state => state === 'hidden', icon: 'icon', title: 'title'}), './tool-definition-registry-Cc6FCFb2.js#n': () => 'shown',
    './file-attachments-D5m1O8aA.js#a': suspension => Boolean(suspension?.kind), './strip-markdown-DRcmtuJc.js#ht': path => path.replace(/^\.\//, ''),
    './strip-markdown-DRcmtuJc.js#dt': path => path.startsWith('artifacts/'), './strip-markdown-DRcmtuJc.js#pt': path => path.startsWith('output/'), './draft-artifacts-registry-CZ58X0Cu.js#c': data => data,
    ...extra});
  const failed = {'./strip-markdown-DRcmtuJc.js#tt': () => ({message: 'Out of credits'}), './strip-markdown-DRcmtuJc.js#$': error => ({...error, kind: 'credits-aux-v2'}),
    './strip-markdown-DRcmtuJc.js#nr': {data: {subscription: {status: 'active', plan: {slug: 'pro'}}, credit: {refresh_at: 'soon'}}}};
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 40, defaults: false,
    renamed: renamedBindings, scenes: [
      {imports: imports(), state: [false]},
      {imports: imports({'./strip-markdown-DRcmtuJc.js#nr': {data: []}}), state: [true]},
      {imports: imports(failed), state: [false]},
      {imports: imports({'./strip-markdown-DRcmtuJc.js#nr': {data: {subscription: {status: 'canceled'}, credit: {}}}, './strip-markdown-DRcmtuJc.js#tt': failed['./strip-markdown-DRcmtuJc.js#tt'],
        './strip-markdown-DRcmtuJc.js#$': failed['./strip-markdown-DRcmtuJc.js#$']}), state: [false]},
    ],
    props: sessions.map(session => world => ({session, taskLinkProps: {href: '/task'}, onOpenRoutine: world.stub('spy:onOpenRoutine'), className: 'probe', sessionId: 's1',
      artifact: {path: 'output/a.png', mimeType: 'image/png', data: 'AA'}, artifacts: [], toolCall: {id: 'c', name: 'read'}, index: 2, startedAt: '2026-10-30T11:00:00Z', targetId: 't', title: 'T'}))});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  world.enter?.({imports: imports()});
  for (const path of ['a.PDF', 'x/y.png?v=1#z', 'page.html', 'noext', 'a.b.csv', '']) {
    assert.equal(ours.__pair_fileExtension(path), supplied.__pair_fileExtension(path));
    assert.equal(ours.__pair_fileKind(path), supplied.__pair_fileKind(path));
  }
  for (const code of ['', ' ', '{"a":1}', '[1]', 'null', '{oops'])
    assert.equal(JSON.stringify(ours.__pair_parseDraftBlock(code)), JSON.stringify(supplied.__pair_parseDraftBlock(code)));
  for (const artifact of [{kind: 'document'}, {kind: 'html'}, {kind: 'image'}, null])
    assert.equal(ours.__pair_isDocumentArtifact(artifact), supplied.__pair_isDocumentArtifact(artifact));
});

test('the selection popup lists shortcuts, chats and applies like the supplied one', async () => {
  const chunk = 'assets/lasso-Chg_FuP-.js';
  const popup = (world, extra = {}) => ({mode: 'main', messages: [], selection: {text: 'Hello', selectionKind: 'text', canApply: true, focusPolicy: 'popup-focused'}, response: '', errorMessage: '',
    isApplying: false, isCopyingCode: false, isStreaming: false, focusPopup: world.stub('spy:focusPopup'), releaseFocus: world.stub('spy:releaseFocus'), applyResponse: world.stub('spy:applyResponse'),
    copyCode: world.stub('spy:copyCode'), copyValue: world.stub('spy:copyValue'), close: world.stub('spy:close'), runInstruction: world.stub('spy:runInstruction'), ...extra});
  const chat = [{role: 'user', content: 'Fix {selected}  \n\n\n\nnow'}, {role: 'user', content: 'x', displayContent: 'Fix it'}, {role: 'assistant', content: 'Done'}];
  const imports = world => ({'./translate-status-K6en4VW6.js#i.useSearch': {accountId: 7, frameId: 'f'}, './translate-status-K6en4VW6.js#l': {ref: world.stub('frameRef'), sendMessage: world.stub('spy:send')},
    './use-messaging-DRNeToXk.js#r': world.stub('spy:sendMessage'), './personalization-C9HKLZT4.js#i': {shortcuts: [{id: 's1', type: 'text-selection', name: 'Explain', color: 'red', icon: 'i', action: {type: 'prompt', prompt: 'Explain {selected}'}},
      {id: 's2', type: 'text-selection', name: 'Copy', color: 'blue', icon: 'c', action: {type: 'copy'}}, {id: 's3', type: 'text-selection', name: 'Open', color: 'g', icon: 'o', action: {type: 'url'}},
      {id: 's4', type: 'lasso', name: 'Code', color: 'g', icon: 'o', action: {type: 'copy'}}]},
    './personalization-C9HKLZT4.js#r': () => ({selected: ' Hello ', image: 'img', text: 'T x'}), './personalization-C9HKLZT4.js#n': (shortcut, values) => (shortcut.name === 'Open' ? `https://x/?q=${values.selected}` : null),
    './lasso-shortcuts-BVNCEenS.js#i': (prompt, values) => Boolean(values.selected), './tag-icon-DeMC7uIN.js#f': {register: () => ({ref: world.stub('fieldRef'), name: 'message'}), handleSubmit: fn => fn, reset: world.stub('spy:reset'), formState: {errors: {}}}});
  const event = world => ({target: null, preventDefault: world.stub('spy:preventDefault'), button: 0, key: 'Escape'});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 40, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: imports(world), context: popup(world), event: event(world)}),
      world => ({imports: imports(world), context: popup(world, {mode: 'chat', messages: chat, response: 'Stream', errorMessage: 'Failed'}), event: {...event(world), button: 1}}),
      world => ({imports: imports(world), context: popup(world, {mode: 'chat', messages: chat, response: 'Done', isStreaming: true, selection: {text: '  ', selectionKind: 'region', canApply: false, focusPolicy: 'preserve-selection'}})}),
      world => ({imports: imports(world), context: popup(world, {selection: {text: 'R', selectionKind: 'region', canApply: true, focusPolicy: 'popup-focused'}, isCopyingCode: true, isApplying: true, mode: 'chat', response: 'Reply'})}),
      world => ({imports: {...imports(world), './translate-status-K6en4VW6.js#i.useSearch': {frameId: 'f'}}, context: popup(world)}),
    ],
    props: [{children: 'child', accountId: 7, message: chat[0], shortcut: {id: 's1', type: 'lasso', name: 'Explain', color: 'red', icon: 'i', action: {type: 'prompt', prompt: 'Go'}}, prompt: 'Go',
      templateValues: {selected: ' x ', image: 'i', text: 't'}, disabled: false, href: 'https://x'}, {message: chat[2], shortcut: {id: 's4', type: 'lasso', name: 'Code', color: 'g', icon: 'o', action: {type: 'copy'}},
      templateValues: {selected: '  ', image: '', text: ''}, disabled: true, href: null}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const [text, selection] of [[' Do ', {selectionKind: 'text'}], ['Do', {selectionKind: 'region', previewImage: 'data:x'}], ['Do', {selectionKind: 'region', previewImage: ' '}]])
    assert.equal(ours.__pair_withRegionImage(text, selection), supplied.__pair_withRegionImage(text, selection));
  for (const message of chat) assert.equal(ours.__pair_userMessageText(message), supplied.__pair_userMessageText(message));
  for (const [messages, response] of [[chat, ''], [chat, 'Done'], [chat, 'New'], [[], 'New']])
    assert.equal(JSON.stringify(ours.__pair_withStreamingResponse(messages, response)), JSON.stringify(supplied.__pair_withStreamingResponse(messages, response)));
});

test('Settings › Lasso lists shortcuts, edits them and templates placeholders like the supplied page', async () => {
  const chunk = 'assets/lasso-LoarCzmz.js';
  const shortcuts = [{id: 's1', type: 'text-selection', name: 'Explain', color: 'red', icon: 'i', action: {type: 'prompt', prompt: 'Explain {text}'}},
    {id: 's2', type: 'text-selection', name: 'Search', color: 'blue', icon: 'c', action: {type: 'open-url', href: 'https://x/?q={text}'}}, {id: 's3', type: 'lasso', name: 'Copy', color: 'g', icon: 'o', action: {type: 'copy'}}];
  const lasso = {textSelectionEnabled: true, lassoSelectionEnabled: false, hotkey: 'Alt', shortcuts};
  const ui = (world, dialog) => ({dialog, setDialog: world.stub('spy:setDialog'), saveSettings: world.stub('spy:saveSettings'), invalidateLassoCache: world.stub('spy:invalidate')});
  const imports = world => ({'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#tr': {data: lasso}, './strip-markdown-DRcmtuJc.js#nr': {data: lasso},
    './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')}, './strip-markdown-DRcmtuJc.js#M': {confirm: (options, run) => world.stub('spy:confirm')(options, run())},
    './platform-CX_yPATJ.js#a': true, './platform-CX_yPATJ.js#n': key => `key:${key}`, './tag-icon-DeMC7uIN.js#m': options => (options.name === 'action.type' ? 'prompt' : `value:${options.name}`),
    './lasso-shortcuts-BVNCEenS.js#r': (type, kind) => (kind === 'prompt' ? ['{text}', '{code}'] : ['{text}'])});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false,
    renamed: renamedBindings, scenes: [
      world => ({imports: imports(world), context: ui(world, {view: 'edit', type: 'text-selection', data: shortcuts[0]}), state: [true]}),
      world => ({imports: imports(world), context: ui(world, {view: 'add', type: 'lasso'}), state: [false]}),
      world => ({imports: imports(world), context: ui(world, null), event: {key: 'Escape', stopPropagation: world.stub('spy:stopPropagation')}}),
    ],
    props: [world => ({settings: lasso, type: 'text-selection', defaultValues: shortcuts[0], onClose: world.stub('spy:onClose'), items: ['s1'], onDragEnd: world.stub('spy:onDragEnd'), id: 's1', children: 'child',
      className: 'probe', command: world.stub('spy:command')}), world => ({settings: {...lasso, shortcuts: [], lassoSelectionEnabled: true, hotkey: 'Meta'}, type: 'lasso', onClose: world.stub('spy:onClose'), items: [], id: 'x', disabled: true,
      children: 'child', command: world.stub('spy:command')})]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const text of ['Plain', 'Fix {text} and {code}', 'line\nnext {image}', '', '{text}'])
    for (const name of ['promptDocument', 'urlDocument', 'templateNodes', 'withoutLineBreaks'])
      assert.equal(JSON.stringify(ours[`__pair_${name}`](text)), JSON.stringify(supplied[`__pair_${name}`](text)), `${name} ${text}`);
  const editor = {state: {doc: {firstChild: {content: {content: [{type: {name: 'text'}, text: 'Go '}, {type: {name: 'mention'}, attrs: {id: 'code'}}]}},
    content: {content: [{content: {content: [{type: {name: 'text'}, text: 'Go'}, {type: {name: 'hardBreak'}}, {type: {name: 'mention'}, attrs: {id: 'image'}}]}}]}}}};
  for (const name of ['promptText', 'urlText']) assert.equal(ours[`__pair_${name}`](editor), supplied[`__pair_${name}`](editor), name);
  for (const value of ['a.b*c', '{x}', '']) assert.equal(ours.__pair_escapeRegExp(value), supplied.__pair_escapeRegExp(value));
});

// The session provider's UI: the side panel, composer controls, mention menu, RichInput, the routine
// dialog with its schedule, agent status and the tool card runtime, on a device routine, a cloud one,
// a session with subagents, Aux Code agents and side chats, and each key the time field and menu take.
test('the session provider UI renders and behaves like the supplied one', async () => {
  const chunk = 'assets/provider-Cw0zhujt.js';
  const dayjs = at => ({isValid: () => !String(at).startsWith('bad'), tz: zone => { if (zone === 'Bad/Zone') throw Error('zone'); return dayjs(`${at}@${zone}`); },
    format: pattern => `${at} as ${pattern}`, hour: () => 14, minute: () => 30, add: amount => dayjs(`${at}+${amount}`), startOf: unit => dayjs(`${at}^${unit}`), toISOString: () => `iso(${at})`, utc: () => dayjs(`${at}z`)});
  const model = {provider: 'anthropic', modelId: 'claude-x', thinkingLevel: 'medium', fastMode: false};
  const routine = {id: 'r1', name: 'Morning', prompt: 'Summarize', environment: 'device', deviceId: 'd1', type: 'child', parentSessionId: 's9', status: 'active', revision: 3, projectId: 'p1',
    rrule: 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0', sessionConfig: {model, permissionMode: 'auto', notificationsEnabled: false}};
  const preview = (id, extra = {}) => ({id, title: `Task ${id}`, status: 'idle', model: {provider: 'openai', modelId: 'gpt-x'}, createdAt: '2026-10-29T08:00:00Z', updatedAt: '2026-10-30T08:00:00Z', previewText: 'Almost done', waiting: false,
    latestRun: {startedAt: '2026-10-30T08:00:00Z', finishedAt: '2026-10-30T08:05:00Z', abortReason: null, finalAssistantMessage: [{model: 'gpt-x', responseModel: 'gpt-y', provider: 'openai'}]}, ...extra});
  const rows = [preview('a1', {status: 'running'}), preview('a2'), preview('a3', {status: 'errored'}), preview('a4', {status: 'suspended'}), preview('a5', {waiting: true}), preview('a6', {status: 'aborted'})];
  const subagents = [{sessionId: 'a1', model: 'm', isRunning: true}, {sessionId: 'a2', model: 'm', isRunning: false}];
  const children = [{id: 'c1', trigger: {type: 'sidechat'}, title: ''}, {id: 'c2', trigger: {type: 'sidechat'}, title: 'Notes'}, {id: 'c3', trigger: {type: 'other'}, title: 'No'}];
  const answer = {'sessions.get': {data: rows[1], isLoading: false}, 'sessions.childSessions': {data: children}, 'sessions.liveToolCalls': {data: [{name: 'read_file'}]},
    'projects.listSkills': {data: [{enabled: true, name: 'plan', absolutePath: '/s/plan', description: 'Plans'}, {enabled: false}], isFetched: true},
    'settings.getAll': {data: {timezone: 'America/Chicago', routineDeviceId: 'd1', mcp: {servers: {git: {transport: 'stdio'}, git__hub: {transport: 'streamable-http', url: 'https://mcp.example'}}}}}, 'routines.get': {data: routine}};
  const previews = data => (_, options) => ({query: 'previews', data: options?.select ? options.select(data) : data, isFetching: false, isError: false, refetch: () => {}, interval: options?.refetchInterval?.({state: {data}})});
  const query = options => (options?.query === 'previews' ? options : queries(answer)(options));
  const form = (world, values) => ({watch: name => name.split('.').reduce((value, key) => value?.[key], values), setValue: world.stub('spy:setValue'), register: name => ({name}), handleSubmit: run => run,
    formState: {isDirty: true, isSubmitting: false, isValid: true, dirtyFields: {model: true, trigger: true, notificationsEnabled: true, permissionMode: true}}});
  const values = (extra = {}) => ({environment: 'device', projectId: 'p1', name: 'Morning', prompt: 'Summarize', timezone: 'America/Chicago', model, permissionMode: 'guard', notificationsEnabled: true,
    attachment: {type: 'child', parentSessionId: 's9'}, trigger: {kind: 'recurring', rrule: 'FREQ=WEEKLY;BYDAY=MO,WE;BYHOUR=8;BYMINUTE=30'}, ...extra});
  const imports = (world, {formValues = values(), previewRows = rows, session = {toolState: {subagent: {subagents}}}, host = {kind: 'device'}, failing = false} = {}) => ({
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#qt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#nr': query, './strip-markdown-DRcmtuJc.js#tr': query,
    '*sessions.listPreviewItems.queryOptions': previews(previewRows),
    './strip-markdown-DRcmtuJc.js#er': () => ({isPending: false, mutateAsync: failing ? () => { throw 'offline'; } : world.stub('spy:mutateAsync')}), './strip-markdown-DRcmtuJc.js#jn': {host}, './strip-markdown-DRcmtuJc.js#M': {confirm: world.stub('spy:confirm')},
    './strip-markdown-DRcmtuJc.js#en': true, './strip-markdown-DRcmtuJc.js#g': status => status === 'running', './strip-markdown-DRcmtuJc.js#_': title => !title, './strip-markdown-DRcmtuJc.js#$t': item => item.id && 'starter',
    './strip-markdown-DRcmtuJc.js#ct': path => path.split('/').pop(), './strip-markdown-DRcmtuJc.js#xn': async () => ({items: [{id: 1, title: 'Docs', url: 'https://d', targetId: 't1', active: true}]}),
    './context-q_vohNW8.js#n': {currentSession: session}, './context-q_vohNW8.js#r': {navigate: world.stub('spy:miniNavigate')}, './subagent-icon-B78zcDX8.js#n': list => new Map(list.map(item => [item.sessionId, 'blue'])),
    './use-agent-settings-DiedG0R1.js#n': {...{modelProvider: 'anthropic', modelId: 'claude-x', thinkingLevel: 'high', fastMode: true}, defaultPermissionMode: 'guard', availableModels: [{provider: 'openai', id: 'gpt-x', shortName: 'GPT X'}]},
    './tag-icon-DeMC7uIN.js#p': form(world, formValues), './tag-icon-DeMC7uIN.js#f': form(world, formValues), './tag-icon-DeMC7uIN.js#c': world.stub('spy:resolver'),
    './use-default-permission-mode-DKp05vFQ.js#s': enabled => ({label: enabled ? 'Confirm' : 'Skip', tooltip: 'Final confirm', icon: world.stub('confirmIcon')}), './use-default-permission-mode-DKp05vFQ.js#o': value => (value === 'true' ? true : value === 'false' ? false : undefined),
    './model-select-BvZsM1Kl.js#l': {selectedModel: {modelShortName: 'Claude X', availableThinkingLevels: ['low', 'high'], supportsFastMode: true}, isOpen: false}, './model-select-BvZsM1Kl.js#s': levels => levels,
    './date-CxUVm-Dr.js#n.default': dayjs, './date-CxUVm-Dr.js#n.default.tz': (at, zone) => dayjs(`${at}@${zone}`), './date-CxUVm-Dr.js#t': ms => `${ms}ms`,
    './tool-definition-registry-Cc6FCFb2.js#t': name => ({title: `Tool ${name}`}), './tool-definition-registry-Cc6FCFb2.js#n': call => `Read ${call.name}`, './tool-definition-registry-Cc6FCFb2.js#r': (title, summary) => `${title}: ${summary}`,
    './strip-markdown-DRcmtuJc.js#t': text => `plain ${text}`, './strip-markdown-DRcmtuJc.js#zt': message => message.model, './browser-binding-CzDmxQNA.js#n': async () => ({windowId: 1}),
    './utils-Cl9zfMcr.js#g': text => (text.startsWith('/f') ? 'hint' : ''), '*.flushSync': run => run()});
  const context = (world, extra = {}) => ({onClose: world.stub('spy:onClose'), onCancel: world.stub('spy:onCancel'), onDirtyChange: world.stub('spy:onDirty'), runtime: {mention: {}, submit: {}, file: {}, callbacks: {}, root: {}}, bumpRuntimeVersion: world.stub('spy:bump'),
    disabled: false, initialContent: {type: 'doc'}, runtimeVersion: 2, openFilePreview: world.stub('spy:openFilePreview'), openAuxCode: world.stub('spy:openAuxCode'), ...extra});
  const key = (world, name, extra = {}) => ({key: name, nativeEvent: {isComposing: false}, preventDefault: world.stub('spy:preventDefault'), stopPropagation: world.stub('spy:stopPropagation'), metaKey: false, ctrlKey: false, altKey: false,
    currentTarget: {get value() { return '45'; }, set value(_) {}, selectionStart: 0, selectionEnd: 3, matches: () => true, closest: () => null}, target: {value: '9:30 pm'}, clipboardData: {getData: () => '7a'}, reason: 'none', cancel: world.stub('spy:cancel'), ...extra});
  const submitted = world => key(world, 'Enter', {...values(), name: 'Evening'});
  const mentions = [{type: 'tab', id: 't1', name: 'Docs', description: 'd.example', groupLabel: 'Open Tabs', icon: 'data:fav'}, {type: 'tab-group', id: 'g1', name: 'Work', groupLabel: 'Tab Groups'},
    {type: 'skill', id: 's1', name: 'plan', groupLabel: 'Skills', description: 'Plans'}, {type: 'command', id: 'c1', command: 'clear', name: 'clear', groupLabel: 'Commands'}, {type: 'command', id: 'c2', command: 'nope', name: 'nope', groupLabel: 'Commands'}];
  const scene = (world, options = {}, extra = {}) => ({imports: imports(world, options), context: context(world), window: {innerWidth: 1000, innerHeight: 800, location: {hash: '#/u/7/projects/p1/settings/memories/files', pathname: '/u/7/tasks'}, setInterval: () => 3, clearInterval: () => {}}, frames: true, ...extra});
  const scenes = [
    world => scene(world, {}, {event: submitted(world)}),
    world => scene(world, {formValues: values({trigger: {kind: 'recurring', rrule: 'FREQ=MINUTELY;INTERVAL=30'}, attachment: {type: 'standalone'}})}, {event: {...key(world, 'ArrowDown'), event: key(world, 'ArrowDown')}, state: [true, true, '9:30 pm', 600, 540]}),
    world => scene(world, {formValues: values({trigger: {kind: 'recurring', rrule: 'FREQ=DAILY;INTERVAL=3;BYHOUR=7;BYMINUTE=5'}})}, {event: {...key(world, 'ArrowUp'), event: key(world, 'ArrowUp')}, state: ['custom']}),
    world => scene(world, {formValues: values({trigger: {kind: 'once', runAt: '2026-11-01T15:00:00Z'}})}, {event: {...key(world, 'Enter'), event: key(world, 'Enter')}}),
    world => scene(world, {formValues: values({trigger: {kind: 'recurring', rrule: 'FREQ=MONTHLY;BYMONTHDAY=1'}, environment: 'cloud'}), previewRows: []}, {event: key(world, 'Escape'), state: [true, false, '', null, 15]}),
    world => scene(world, {session: {toolState: {}}, host: {kind: 'cloud'}, previewRows: []}, {event: key(world, 'Tab'), state: [true, true, 'x', null, 15]}),
    world => scene(world, {failing: true}, {event: submitted(world)}),
    world => scene(world, {}, {context: undefined, state: [true, false]}),
    world => scene(world, {}, {event: 'interval'}),
    world => scene(world, {}, {event: 'DAILY', state: ['custom']}),
    world => scene(world, {}, {event: key(world, 'a')}),
    world => scene(world, {}, {event: key(world, 'Backspace', {metaKey: true}), state: [false, true, '12:15', null, 735], context: context(world, {disabled: true})}),
  ];
  const propsets = [
    world => ({mode: 'guard', finalConfirm: true, alwaysShowLabel: true, memoryExtractionDisabled: true, onModeChange: world.stub('spy:onModeChange'), onFinalConfirmChange: world.stub('spy:onFinal'), onMemoryExtractionDisabledChange: world.stub('spy:onMem'), render: world.stub('render'),
      children: 'child', sessionId: 's1', previewFiles: [{metadata: {path: '/a.md'}}], value: model, model, shortName: 'Claude X', showThinkingLevel: true, provider: 'openai', fastMode: true, label: 'Medium', className: 'probe', hour: 14, minute: 45,
      routineId: 'r1', projectId: 'p1', open: true, defaults: values(), status: 'active', routine, editing: true, environment: 'device', canEditSettings: true, deviceName: 'Mac', isCurrent: true, days: ['TU', 'MO'], initialPrompt: 'Go', item: {...subagents[0], preview: rows[0]}, preview: rows[0], fallback: 'Busy',
      startedAt: '2026-10-30T08:00:00Z', actualModel: {provider: 'openai', modelId: 'gpt-y'}, taskId: 'a1', title: 'Fix', prompt: 'Do', path: 'memory/notes.md', tooltip: true, toolState: {subagent: {subagents}}, call: {name: 'mcp__git__hub__search'}, items: mentions, command: world.stub('spy:command'), isInteractionBlocked: () => false, index: 2, isSelected: true}),
    world => ({mode: 'full-access', variant: 'submenu', onModeChange: world.stub('spy:onModeChange'), value: {skills: [{id: 's'}], isLoaded: true}, model: {...model, fastMode: true}, status: 'paused', routine: {...routine, environment: 'cloud'}, routineId: 'r2', defaults: values({environment: 'cloud'}), editing: true, environment: 'cloud', canEditSettings: false,
      item: {...subagents[1], preview: rows[2]}, preview: rows[1], variant2: 1, taskId: 'a2', path: '../up.md', tooltip: false, call: {name: 'mcp__git__log'}, items: [], error: 'Tabs failed', isInteractionBlocked: () => true, days: ['MO','TU','WE','TH','FR']}),
    world => ({variant: 'final-confirm', finalConfirm: false, onModeChange: world.stub('spy:onModeChange'), onFinalConfirmChange: world.stub('spy:onFinal'), status: 'working', item: {...subagents[0], isRunning: false, preview: rows[1]}, preview: rows[3], path: 'C:\\x\\y.md', routineId: undefined, defaults: values(), environment: 'device', loading: true, days: ['SA', 'SU', 'MO', 'TU', 'WE', 'TH', 'FR'], actualModel: model, taskId: undefined, item2: 1}),
    world => ({variant: 'duration', status: 'needs-you', preview: preview('w', {status: 'suspended', previewText: ''}), item: {sessionId: 'a2', isRunning: false, preview: rows[1]}, model, actualModel: null, onChange: world.stub('spy:onChange'), hour: 0, minute: 0}),
    world => ({variant: 'badge', status: 'stopped', preview: rows[5], item: {...subagents[1], preview: rows[1]}, model, hour: 12, minute: 5}),
    world => ({status: 'failed', preview: rows[4], variant: 'duration', item: {...subagents[1], isRunning: true}}),
    world => ({status: 'done', preview: preview('z', {previewText: ''})}),
    world => ({status: 'waiting', preview: preview('y', {status: 'idle', waiting: true, previewText: ''})}),
  ];
  const {world} = await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 3000, defaults: false, renamed: renamedBindings, scenes, props: propsets});
  // Helpers on real values, in both versions: typed times, RRULEs through the fields and back, days, a one-time rule and form values.
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const same = (name, ...args) => { const run = side => { try { return JSON.stringify(side[name](...args)); } catch (error) { return `threw ${error.name}`; } }; assert.equal(run(ours), run(supplied), `${name} ${JSON.stringify(args)}`); return run(ours); };
  world.enter({imports: imports(world)});
  assert.equal(same('__kept_rt', 13, 5), '"1:05 PM"');
  assert.equal(same('__kept_ln', '9:30 pm', 0), '{"hour":21,"minute":30}');
  for (const [text, at] of [['9', 600], ['9', 300], ['0930', 0], ['12:15', 735], ['12a', 0], ['1230p', 0], ['13', 0], ['24', 0], ['9:60', 0], ['nope', 0], ['123:45', 0], ['7 a.m.', 0], ['0', 0], ['2359', 0]]) same('__kept_ln', text, at);
  const rules = ['FREQ=DAILY;BYHOUR=9;BYMINUTE=0', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=30', 'FREQ=WEEKLY;BYDAY=SU,SA;BYHOUR=10;BYMINUTE=15', 'FREQ=MINUTELY;INTERVAL=30', 'FREQ=HOURLY;INTERVAL=2', 'FREQ=DAILY;INTERVAL=3;BYHOUR=7;BYMINUTE=5',
    'DTSTART;TZID=America/Chicago:20261101T090000\nRRULE:FREQ=WEEKLY;BYDAY=TU;BYHOUR=9;BYMINUTE=0', 'FREQ=MONTHLY;BYMONTHDAY=1', 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=30', 'FREQ=WEEKLY;INTERVAL=2;BYDAY=XX;BYHOUR=9;BYMINUTE=0', ''];
  assert.equal(JSON.parse(same('__pair_parseSchedule', {scheduleKind: 'recurring', rrule: rules[3], timezone: 'UTC'})).interval, 30);
  for (const rrule of rules) {
    same('__pair_parseSchedule', {scheduleKind: 'recurring', rrule, timezone: 'UTC'});
    for (const type of ['daily', 'weekdays', 'weekly', 'custom', 'interval', 'once'])
      same('__pair_buildRrule', {...JSON.parse(ours.__pair_parseSchedule ? JSON.stringify(ours.__pair_parseSchedule({scheduleKind: 'recurring', rrule, timezone: 'UTC'})) : '{}'), type});
    same('__pair_parseRruleParts', rrule); same('__pair_hasFixedTime', Object.fromEntries(rrule.split(';').map(part => part.split('='))));
  }
  same('__pair_parseSchedule', {scheduleKind: 'once', runAt: '2026-11-01T15:00:00Z', timezone: 'UTC'}); same('__pair_parseSchedule', {scheduleKind: 'once', timezone: 'Bad/Zone'});
  same('__pair_triggerFromSchedule', {type: 'once', runAt: 'x'}, 'UTC'); same('__pair_triggerFromSchedule', {type: 'once'}, 'UTC'); same('__pair_triggerFromSchedule', {type: 'daily', rrule: rules[0]}, 'UTC');
  for (const days of [['MO'], ['MO', 'TU', 'WE', 'TH', 'FR'], ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'], ['SA', 'MO'], []]) {
    same('__pair_formatDays', days); same('__pair_sortDays', days);
    for (const day of ['MO', 'SA']) same('__pair_toggleDay', days, day);
  }
  for (const value of ['mo, tu', '', undefined]) same('__pair_parseDays', value);
  for (const [value, zone] of [['2026-11-01T09:00', 'UTC'], ['', 'UTC'], ['bad', 'Bad/Zone'], ['2026-11-01T09:00', 'Bad/Zone']]) { same('__pair_fromDateTimeLocal', value, zone); same('__pair_toDateTimeLocal', value, zone); same('__pair_inTimezone', value, zone); same('__pair_nextHour', zone); }
  same('__pair_formRrule', {trigger: {kind: 'once', runAt: '2026-11-01T15:00:00Z'}}); same('__pair_formRrule', {trigger: {kind: 'recurring', rrule: rules[0]}});
  for (const rule of ['DTSTART;TZID=America/Chicago:20261101T090000\nRRULE:FREQ=DAILY;COUNT=1', 'DTSTART:20261101T150000Z\nRRULE:FREQ=DAILY;COUNT=1', 'DTSTART:20261101T150000Z\nRRULE:FREQ=DAILY;COUNT=2', rules[0]]) same('__pair_parseOnceRule', rule, 'UTC');
  same('__pair_routineToForm', routine, model, 'UTC'); same('__pair_routineToForm', {...routine, type: 'standalone', rrule: 'DTSTART:20261101T150000Z\nRRULE:FREQ=DAILY;COUNT=1', sessionConfig: {}}, model, 'UTC');
  for (const path of ['memory/notes.md', './x/y.md', '../up.md', '', 'C:\\a\\b.md']) { same('__pair_projectMemoryPath', path, {projectId: 'p1'}); same('__pair_fileName', path); }
  // The suggestion popup through its whole life, the same way in both: open, update, keys, close.
  const popup = async side => {
    const calls = [];
    const runtime = {mention: {}, callbacks: {onCommand: command => (calls.push(['onCommand', command]), command === 'clear'), onChange: value => calls.push(['onChange', value])}};
    const disposers = [];
    const options = side.__kept_bo(runtime, {allowedPrefixes: null, char: '@', load: async input => (calls.push(['load', input.query, input.commandCandidates.length]), {items: mentions, error: 'x'})}, 'Menu', disposers);
    const editor = {isDestroyed: false, view: {dom: {offsetWidth: 300, getBoundingClientRect: () => ({left: 10, top: 700, bottom: 720})}}, extensionManager: {extensions: []}, commands: {clearContent: () => calls.push(['clear'])}, getJSON: () => ({})};
    const suggestion = {editor, items: mentions, loading: false, command: item => calls.push(['command', item.id]), clientRect: () => ({left: 900, top: 700, bottom: 720})};
    const items = await options.items({editor, query: 'do'});
    const popupHandlers = options.render();
    popupHandlers.onStart(suggestion); popupHandlers.onUpdate({...suggestion, items: []});
    calls.push([popupHandlers.onKeyDown({event: {key: 'ArrowDown'}}), popupHandlers.onKeyDown({event: {key: 'Enter'}}), runtime.mention.suppressSubmitUntil, runtime.mention.isSuggestionOpen, popupHandlers.onKeyDown({event: {key: 'Escape'}})]);
    popupHandlers.onExit(); disposers.forEach(run => run());
    return JSON.stringify([items.length, runtime.mention.error, calls]);
  };
  const opened = scenes[0](world);
  world.enter({...opened, imports: {...opened.imports, '*.createRoot': () => ({render: element => element.props.ref({onKeyDown: () => true}), unmount: () => {}}), './create-editor-B-Br5Wz9.js#c': () => false}});
  assert.equal(await popup(ours), await popup(supplied));
  const element = () => ({style: {}, isConnected: true, offsetHeight: 200});
  for (const [rect, width] of [[{left: 900, top: 700, bottom: 720}, 300], [{left: 4, top: 100, bottom: 120}, 0], [{left: 40, top: 300, bottom: 320}, 500], [{left: 40, top: 50, bottom: 690}, 200]]) {
    const place = side => { const box = element(); side.__pair_positionPopup(box, {editor: {view: {dom: {offsetWidth: width}}}, clientRect: () => rect}); return JSON.stringify(box.style); };
    assert.equal(place(ours), place(supplied));
  }
});

test('the Projects list and its dialog act like the supplied ones', async () => {
  const chunk = 'assets/project-list-BmtBNv8P.js';
  const projects = [{id: 'p1', name: 'Site', color: 'blue', icon: 'globe', lastActiveAt: '2026-10-30T08:00:00Z', updatedAt: '2026-10-01T08:00:00Z'}, {id: 'p2', name: 'Old', archivedAt: '2026-01-01', updatedAt: '2026-10-02T08:00:00Z'}, {id: 'p3', name: 'Bad', lastActiveAt: 'bad'}];
  const scene = (world, mutate = world.stub('spy:mutateAsync')) => ({imports: {'./strip-markdown-DRcmtuJc.js#er': {isPending: false, mutateAsync: mutate}, './strip-markdown-DRcmtuJc.js#M': {confirm: (options, run) => world.stub('spy:confirm')(options, run())},
    './date-CxUVm-Dr.js#n.default': at => ({isValid: () => at !== 'bad', format: pattern => `${at} as ${pattern}`})}, event: {preventDefault: world.stub('spy:preventDefault'), stopPropagation: world.stub('spy:stopPropagation')}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 8, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, () => { throw 'offline'; }), world => ({...scene(world), imports: {...scene(world).imports, './strip-markdown-DRcmtuJc.js#er': {isPending: true, mutateAsync: world.stub('spy:mutateAsync')}}})],
    props: [{accountId: 7, userId: '7', projects, project: projects[0], open: true, onCreated: () => {}}, {accountId: 7, userId: '7', projects: [], project: projects[1], open: false}, {project: projects[2]}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  assert.equal(ours.r(projects.slice(0, 2)).map(project => project.id).join(), 'p1,p2');
  assert.equal(JSON.stringify(ours.r(projects)), JSON.stringify(supplied.r(projects)));
});


test('the coding agent nudge picks its target and looks for code like the supplied one', async () => {
  const chunk = 'assets/coding-agent-nudge-Cy9BtLdb.js';
  const session = (provider, content, status = 'idle') => ({currentSession: {status, model: {provider}, messages: [{role: 'assistant', content: 'Hi'}, {role: 'user', content}]}});
  const scene = (world, value = session('aux', 'fix the bug in src/app.tsx'), {isDismissed = false, stream = 'idle', hidden = false} = {}) => ({event: {stopPropagation: world.stub('spy:stopPropagation')}, imports: {'./context-q_vohNW8.js#n': value, './provider-Cw0zhujt.js#l': {status: stream}, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
    './browser-binding-CzDmxQNA.js#l': hidden, './strip-markdown-DRcmtuJc.js#Ht': {capture: world.stub('spy:capture')}, './utils-BEeo4-cB.js#t': {isDismissed, dismiss: world.stub('spy:dismiss'), dismissForever: world.stub('spy:dismissForever')}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, session('claude-code', [{type: 'text', text: 'pnpm test'}, {type: 'image'}])), world => scene(world, session('openai-codex', 'Plan my trip')), world => scene(world, session('aux', 'git status', 'running'), {stream: 'streaming'}),
      world => scene(world, session('google', 'react')), world => scene(world, undefined, {isDismissed: true}), world => scene(world, undefined, {hidden: true})],
    props: [{className: 'probe', accountId: 7, targetId: 'codex', place: 'chat', isPending: true, onStatusChange: () => {}, children: 'Connect', dismissLabel: 'Dismiss', href: 'https://a', onDismiss: () => {}}, {accountId: 7, targetId: 'claude-code'}, {accountId: 7, isPending: true}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  for (const text of ['fix the bug', 'tell me about Paris', 'run pnpm install', 'see src/app/page.tsx:12', '```\nx\n```', '버그를 고쳐줘', 'the go team', 'go build ./x', 'localhost:3000', 'Node', 'a stack trace'])
    assert.equal(ours.__pair_looksLikeCode(text), supplied.__pair_looksLikeCode(text), text);
  assert.equal(ours.__pair_looksLikeCode('fix the bug'), true);
  for (const provider of [undefined, 'aux', 'openai-codex', 'claude-code', 'google']) assert.equal(ours.r(provider), supplied.r(provider));
  for (const message of [{content: ' hi <system-message>x</system-message> '}, {content: [{type: 'text', text: 'a'}, {type: 'image'}, {type: 'text', text: 'b'}]}]) assert.equal(ours.__pair_messageText(message), supplied.__pair_messageText(message));
  for (const messages of [[], [{role: 'assistant', content: 'x'}], [{role: 'user', content: 'a'}, {role: 'assistant', content: 'b'}, null]]) assert.equal(ours.__pair_lastUserMessage(messages), supplied.__pair_lastUserMessage(messages));
});

test('the Avatar parts render and report image loads like the supplied ones', async () => {
  const chunk = 'assets/avatar-iEt_J7Lk.js';
  const stateful = world => ({context: ['loaded', world.stub('spy:setStatus')], event: {currentTarget: {hidden: false}}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 12, defaults: false, renamed: renamedBindings,
    scenes: [stateful, world => ({context: ['error', world.stub('spy:setStatus')], event: {currentTarget: {hidden: true}}}), {context: undefined}],
    props: [world => ({className: 'probe', size: 'lg', src: '/a.png', alt: 'A', onError: world.stub('spy:onError'), onLoad: world.stub('spy:onLoad'), onLoadingStatusChange: world.stub('spy:status')}), {children: 'AB'}, {src: ''}, {delay: 300}]});
});

test('the Settings content layout tracks its sections and skips full pages like the supplied one', async () => {
  const chunk = 'assets/route-DMfKuXmY.js';
  const heading = (name, top) => ({dataset: {settingsSection: name}, getBoundingClientRect: () => ({top})});
  const headings = [heading('Appearance', 10), heading('Privacy', 45), heading('', 0), heading('Exact', 51), heading('Language', 400)];
  const viewport = (world, scrollTop = 100, scrollHeight = 900) => ({scrollTop, clientHeight: 500, scrollHeight, getBoundingClientRect: () => ({top: 10}), addEventListener: (name, handler) => { world.stub('spy:listen')(name); handler(); }, removeEventListener: world.stub('spy:unlisten')});
  const content = (world, list = headings) => ({querySelectorAll: () => list, querySelector: () => ({scrollIntoView: world.stub('spy:scrollIntoView')})});
  const route = (world, pathname, matches = []) => ({frames: true, state: [[{title: 'Appearance', isActive: true}, {title: 'Privacy', isActive: false}]], imports: {'./useRouterState-vMU34Fpy.js#t': options => options.select({location: {pathname}}), './Matches-B99cyGDb.js#n': () => match => matches.includes(match.to)}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 12, defaults: false, renamed: renamedBindings,
    scenes: [world => route(world, '/u/7/settings/general'), world => route(world, '/u/7/settings/plugins/skills'), world => route(world, '/x', ['/u/$userId/settings/experimental']), world => route(world, '/x', ['/u/$userId/settings/routines/$routineId']), world => ({...route(world, '/x'), state: [[]]}), world => ({...route(world, '/x'), state: [[{title: 'Only', isActive: true}]]})],
    props: [world => ({viewportRef: {current: viewport(world)}, contentRef: {current: content(world)}}), world => ({viewportRef: {current: viewport(world, 400, 901.5)}, contentRef: {current: content(world)}}), world => ({viewportRef: {current: viewport(world, 0)}, contentRef: {current: content(world, [])}}), {viewportRef: {current: null}, contentRef: {current: null}}]});
});

test('the side panel route keeps the session in the URL and goes dark in incognito like the supplied one', async () => {
  const chunk = 'assets/route-DI45z3OR.js';
  const scene = (world, mode, search) => ({imports: {'./strip-markdown-DRcmtuJc.js#Kt': {mode}, './extension-main-Dz1-AsCT.js#H.useParams': {userId: '7'}, './extension-main-Dz1-AsCT.js#H.useNavigate': world.stub('spy:navigate'), './extension-main-Dz1-AsCT.js#H.useSearch': search}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 6, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world, 'default', {sessionId: 's1'}), world => scene(world, 'incognito', {}), world => ({...scene(world, 'incognito', {sessionId: 's2'}), event: 's3'})], props: [{children: 'child'}, {}]});
});

test('the Done step applies appearance drafts and finishes onboarding like the supplied one', async () => {
  const chunk = 'assets/done-DPzI9pFd.js';
  const calls = [];
  const note = name => (...args) => { calls.push([name, ...args.map(arg => JSON.stringify(arg) ?? 'undefined')]); return undefined; };
  const preferences = {getBrowserColorScheme: async () => 'dark', setBrowserColorScheme: async () => {}, getTabStyle: async () => 'vertical', setTabStyle: async () => {}, getTabSwitcherSortByRecentlyUsed: async () => true, setTabSwitcherSortByRecentlyUsed: async () => {}};
  const settings = {'browserColorScheme': 'dark', tabStyle: 'horizontal', tabSwitcherSortByRecentlyUsed: true, windowBackgroundVibrancyEnabled: false, verticalTabInsertionPosition: 'top', enabled: true};
  const imports = (world, {os = 'macos', query = {}, mutation = {}, skipDone = false, target = 'workspace', browserPreferences = preferences} = {}) => ({
    './browser-color-scheme-Df5VSuPV.js#r': browserPreferences, './translate-status-K6en4VW6.js#d': {setTheme: note('setTheme')}, './strip-markdown-DRcmtuJc.js#Bn': {os}, './appearance-Ceuw3-j6.js#o': true, './appearance-Ceuw3-j6.js#c': true,
    './strip-markdown-DRcmtuJc.js#nr': options => ({data: settings[options.queryKey?.[1]], isError: false, isLoading: false, ...query}),
    './strip-markdown-DRcmtuJc.js#pr': {setQueryData: note('setQueryData'), invalidateQueries: note('invalidate'), query: async () => ({accountId: 7, browserProfile: {profilePath: '/p'}}), fetchQuery: async () => ({mode: 'cloud'})},
    '*.mutationOptions': options => options, './strip-markdown-DRcmtuJc.js#er': options => ({isPending: false, isError: false, mutate: () => { world.stub('spy:mutate')(); options?.onSuccess?.({installed: true}); options?.onError?.({message: 'Denied'}); options?.onSettled?.(); }, mutateAsync: async (...args) => note('mutateAsync')(...args), ...mutation}),
    './strip-markdown-DRcmtuJc.js#Ut': {track: (...args) => calls.push(['track', args])}, './tag-icon-DeMC7uIN.js#f': {handleSubmit: run => run, watch: id => id === 'defaultBrowser', setValue: note('setValue')},
    './use-update-settings-ahXnGzre.js#t': () => {}, './extension-main-Dz1-AsCT.js#R.useLoaderData': {skipDone}, './extension-main-Dz1-AsCT.js#R.useSearch': {completionTarget: target}, './platform-CX_yPATJ.js#o': false,
    './sign-in-popup-CzjJFAuC.js#t': async () => true, './error-content-CCom8r6s.js#t': async (error, title) => ({title, description: String(error?.message)}), './recommended-filters-gA0HHZVC.js#t': async () => { throw Error('filters'); },
    './dist-LyKrHgST.js#n.error': note('toast.error'), './dist-LyKrHgST.js#n.success': note('toast.success')});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 30, defaults: false, renamed: renamedBindings,
    scenes: [world => ({imports: imports(world)}), world => ({imports: imports(world, {os: 'windows', skipDone: true, mutation: {isPending: true}}), state: [true]}), world => ({imports: imports(world, {query: {isError: true}, browserPreferences: {}})}), world => ({imports: imports(world, {mutation: {isError: true, error: {message: 'Some settings'}}})}),
      world => ({imports: imports(world, {query: {isLoading: true, data: undefined}}), state: [false]}), world => ({imports: imports(world, {mutation: {isPending: true}, query: {data: undefined}})})],
    props: [{open: true, onOpenChange: () => {}, onClose: () => {}, onSavingChange: () => {}, children: 'child', autoComplete: false, onAutoCompleteError: () => {}}, {open: false, autoComplete: true}, {queryKey: ['x', 'tabStyle'], available: true, read: () => 'a', write: () => {}}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const dock = (isAdded, canAdd) => ({'chrome.auxBrowserPreferences.getDockState': {isAdded, canAdd}, 'chrome.auxBrowserPreferences.addToDock': {isAdded: true, added: 'now'}, 'chrome.auxBrowserPreferences.getDefaultBrowserState': {isDefault: isAdded, canSet: canAdd}, 'chrome.auxBrowserPreferences.setAsDefaultBrowser': {isDefault: true, set: 'now'}});
  // Whatever finishing does after its first await, in order, from the form's submit.
  const values = {defaultBrowser: true, addToDock: true, keepTasksRunning: false, helpImproveAux: true};
  const finish = async (side, options = {}) => {
    calls.length = 0;
    world.render(side.__pair_OptionsForm, {}, {imports: {...imports(world, options), ...dock(false, true), 'localStorage.setItem': note('localStorage')}, event: values, window: {location: {protocol: 'chrome-extension:', origin: 'o', replace: note('replace')}}});
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify(calls);
  };
  assert.equal(await finish(ours), await finish(supplied));
  assert.ok((await finish(ours)).includes('toast.error'));
  const draft = async (side, state, data, available = true) => {
    const written = [];
    world.enter({state: [state], imports: {...imports(world), './strip-markdown-DRcmtuJc.js#nr': {data, isError: false, isLoading: false}, './strip-markdown-DRcmtuJc.js#pr': {setQueryData: (key, value) => written.push(['cached', key, value])}}});
    const setting = side.__pair_useDraftSetting({queryKey: ['k'], available, read: () => {}, write: async value => written.push(['write', value])});
    await setting.save();
    return JSON.stringify([setting.value, setting.disabled, setting.available, written]);
  };
  for (const args of [['b', 'a'], ['a', 'a'], [undefined, 'a'], ['b', undefined], ['b', 'a', false]]) assert.equal(await draft(ours, ...args), await draft(supplied, ...args));
  assert.ok((await draft(ours, 'b', 'a')).includes('write'));
  // A failed Apply keeps the drafts and says so.
  const apply = async side => {
    let run;
    world.render(side.__pair_AppearanceForm, {onClose: () => {}, onSavingChange: note('saving')}, {state: ['vertical'], imports: {...imports(world), './browser-color-scheme-Df5VSuPV.js#o': () => ({...preferences, setTabStyle: async () => { throw Error('denied'); }}), './strip-markdown-DRcmtuJc.js#er': options => { run = options.mutationFn; return {}; }}});
    return run().then(() => 'saved', error => error.message);
  };
  assert.equal(await apply(ours), await apply(supplied));
  assert.notEqual(await apply(ours), 'saved');
  for (const [added, can, options] of [[false, true, {defaultBrowser: true, addToDock: true}], [true, true, {defaultBrowser: true, addToDock: true}], [false, false, {defaultBrowser: true, addToDock: true}], [false, true, {defaultBrowser: false, addToDock: false}]]) {
    world.enter({imports: dock(added, can)});
    assert.equal(JSON.stringify(await ours.__pair_applyBrowserOptions(options)), JSON.stringify(await supplied.__pair_applyBrowserOptions(options)));
  }
});

test('a Project page shows its files, instructions and tabs and saves its name like the supplied one', async () => {
  const chunk = 'assets/_projectId-DW8jDyV7.js';
  const calls = [];
  const note = name => (...args) => { calls.push([name, ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, (key, value) => (typeof value === 'function' ? 'fn' : value)) : String(arg)))]); };
  const project = {id: 'p1', name: 'Site', color: 'blue', icon: 'globe', workspacePath: '/Users/me/site', archivedAt: null};
  const archived = {...project, id: 'p2', name: 'Old', archivedAt: '2026-01-01'};
  const list = data => ({data, isPending: false, isError: false});
  const session = id => ({id, title: `Chat ${id}`, previewText: 'Hello', updatedAt: '2026-10-30T08:00:00Z'});
  const answers = {'projects.readFile': list({content: ' # Rules\n'}), 'projects.listFiles': list(['AGENTS.md', 'a.md', 'b.png']), 'sessions.listPreviewItems': list([session('s1'), session('s2')]), 'routines.list': list([{id: 'r1', name: 'Morning', pausedAt: null}, {id: 'r2', name: 'Weekly', pausedAt: '2026-10-01'}]), 'projects.list': list([project, archived, {...project, id: 'p3', name: 'Third'}])};
  const imports = (world, {current = project, answer = answers, updating = note('update')} = {}) => ({'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, '*.useParams': {projectId: current.id, userId: '7'}, './Match-OymXmaXz.js#o': world.stub('spy:navigate'),
    './strip-markdown-DRcmtuJc.js#tr': {data: current}, './strip-markdown-DRcmtuJc.js#nr': queries(answer), './strip-markdown-DRcmtuJc.js#er': {isPending: false, mutateAsync: async (...args) => updating(...args)},
    './strip-markdown-DRcmtuJc.js#pr': {invalidateQueries: note('invalidate')}, './tag-icon-DeMC7uIN.js#f': {control: {}, handleSubmit: run => run}, './tag-icon-DeMC7uIN.js#m': '/Users/me/site', './date-CxUVm-Dr.js#n.default': at => ({format: pattern => `${at} as ${pattern}`, fromNow: () => 'today'}),
    './tool-definition-registry-Cc6FCFb2.js#f': routine => `Every day (${routine.id})`, './utils-DCBm67_n.js#y': false, '*.safeParse': name => (String(name).trim() ? {success: true, data: String(name).trim()} : {success: false, error: {issues: String(name) ? [{message: 'Name it'}] : []}}),
    './dist-LyKrHgST.js#n.error': note('toast.error'), './dist-LyKrHgST.js#n.success': note('toast.success')});
  const scenes = [world => ({imports: imports(world), event: {target: {value: 'x'}, key: 'a', nativeEvent: {isComposing: false}, currentTarget: {blur: world.stub('spy:blur')}}}), world => ({imports: imports(world, {current: archived}), state: [true]}), world => ({imports: imports(world), event: 'routines'}),
    world => ({imports: imports(world, {answer: {}}), state: ['routines']}), world => ({imports: imports(world, {answer: Object.fromEntries(Object.keys(answers).map(key => [key, {isPending: false, isError: true}]))}), state: ['sources']}),
    world => ({imports: imports(world, {answer: Object.fromEntries(Object.keys(answers).map(key => [key, list([])]))}), state: ['chats']})];
  const {world} = await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 100, defaults: false, renamed: renamedBindings, scenes,
    props: [{project, accountId: 7, projectId: 'p1', content: '# Rules', rawContent: ' # Rules\n', isPending: false, isError: false, sourceFiles: ['a.md'], onClose: () => {}, onPersist: async () => true, initialContent: 'x', label: 'chats', title: 'No chats', description: 'Start', icon: 'i', selected: true},
      {project: archived, isPending: true, sourceFiles: [], selected: false, onClose: () => {}, onPersist: async () => false}, {project, isError: true, content: '', sourceFiles: [], onClose: () => {}, onPersist: async () => true}, {project, content: '', sourceFiles: [], onClose: () => {}, onPersist: async () => true}]});
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  // The name's save runs past its first await: every outcome, on both sides.
  const rename = async (side, name, event, onPersist) => {
    calls.length = 0;
    world.render(side.__pair_ProjectNameInput, {project, onPersist: async (...args) => { note('persist')(...args); return onPersist; }}, {imports: imports(world), state: [name], event: {target: {value: name}, key: event, nativeEvent: {isComposing: false}, currentTarget: {blur: note('blur')}}});
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify(calls);
  };
  for (const [name, event, result] of [['  New  ', 'x', true], ['New', 'x', false], ['Site', 'x', true], ['   ', 'x', true], ['New', 'Enter', true], ['New', 'Escape', true], ['', 'x', true]]) assert.equal(await rename(ours, name, event, result), await rename(supplied, name, event, result), name);
  assert.ok((await rename(ours, '  New  ', 'x', true)).includes('persist'));
  const persist = async (side, updating) => {
    calls.length = 0;
    world.render(side.__pair_ProjectIdentity, {project}, {imports: imports(world, {updating})});
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify(calls);
  };
  assert.equal(await persist(ours, note('update')), await persist(supplied, note('update')));
  const flow = async (side, component, props, event, updating) => {
    calls.length = 0;
    world.render(side[component], {project, accountId: 7, projectId: 'p1', initialContent: 'x', onClose: note('close'), ...props}, {imports: imports(world, {updating}), state: ['Rules'], event});
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify(calls);
  };
  for (const updating of [note('update'), () => { throw 'offline'; }]) {
    assert.equal(await flow(ours, '__pair_WorkingDirectoryForm', {}, {workspacePath: '/new'}, updating), await flow(supplied, '__pair_WorkingDirectoryForm', {}, {workspacePath: '/new'}, updating));
    assert.equal(await flow(ours, '__pair_InstructionsEditor', {}, {target: null}, updating), await flow(supplied, '__pair_InstructionsEditor', {}, {target: null}, updating));
  }
});

test('the new task page keeps its draft and Project in the URL like the supplied one', async () => {
  const chunk = 'assets/new-DS2pRmiw.js';
  const scene = (world, search) => ({event: 's9', imports: {'./extension-main-Dz1-AsCT.js#C.useParams': {userId: '7'}, './extension-main-Dz1-AsCT.js#C.useSearch': search, './extension-main-Dz1-AsCT.js#C.useNavigate': world.stub('spy:navigate')}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 8, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world, {projectId: 'p1'}), world => scene(world, {}), world => ({...scene(world, {projectId: 'p1'}), event: null})], props: [{projectId: 'p1', onProjectIdChange: () => {}, onSessionChange: () => {}}, {projectId: null}]});
});

test('Settings › Mini popup saves its switch and shortcut like the supplied page', async () => {
  const chunk = 'assets/mini-popup-BBLwe-a8.js';
  const calls = [];
  const note = name => (...args) => { calls.push([name, String(args[0]?.message ?? args[0])]); };
  const scene = (world, {enabled = {data: true}, shortcut = {data: 'Alt+Space'}, os = 'macos', pending = false} = {}) => ({imports: {'./strip-markdown-DRcmtuJc.js#Bn': {os}, './strip-markdown-DRcmtuJc.js#pr': {setQueryData: note('setQueryData'), invalidateQueries: note('invalidate')},
    './useQueries-CrOl5VwX.js#t': () => [enabled, shortcut], './strip-markdown-DRcmtuJc.js#er': options => ({isPending: pending, mutate: value => { note('mutate')(value); options.onSuccess?.(value); options.onError?.({message: 'Denied'}); }}), './use-shortcut-capture-DGr8Ws5Z.js#i': true,
    './dist-LyKrHgST.js#n.error': note('toast.error'), './dist-LyKrHgST.js#n.success': note('toast.success')}, event: false});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 8, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world), world => scene(world, {enabled: {data: false}}), world => scene(world, {enabled: {isLoading: true}, shortcut: {isError: true}, os: 'windows', pending: true})], props: [{}, {children: 'x'}]});
  const world = createWorld();
  const {supplied, ours} = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  const run = side => { calls.length = 0; world.render(side.__pair_MiniPopupSettings, {}, scene(world)); return JSON.stringify(calls); };
  assert.equal(run(ours), run(supplied));
  assert.ok(run(ours).includes('toast.error'));
});

test('Detect tools lists its sites like the supplied page', async () => {
  const chunk = 'assets/detect-tools-Bq1QGFUu.js';
  const report = {apps: [{host: 'mail.example', score: 8, activeDays: 12}, {host: 'docs.example', score: 3, activeDays: 2}], scannedVisits: 12450, droppedHosts: 7, window: {days: 30}};
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 6, defaults: false, renamed: renamedBindings,
    scenes: [{imports: {'./strip-markdown-DRcmtuJc.js#nr': {data: report, isPending: false}}}, {imports: {'./strip-markdown-DRcmtuJc.js#nr': {isPending: true}}}, {imports: {'./strip-markdown-DRcmtuJc.js#nr': {isPending: false, error: {message: 'No history'}}}}], props: [{host: 'a.example', score: 2, activeDays: 1}, {}]});
});

test('the Mini popup shortcut row captures and resets like the supplied one', async () => {
  const chunk = 'assets/mini-popup-shortcut-field-zmtLA1sg.js';
  const scene = (world, isCapturing) => ({imports: {'./use-shortcut-capture-DGr8Ws5Z.js#t': options => { options.onValueChange?.('Alt+Space'); options.onValueChange?.('Alt+K'); return {inputRef: world.stub('inputRef'), isCapturing, placeholder: 'Press keys', handleFocus: world.stub('spy:focus'), handleBlur: world.stub('spy:blur'), handleKeyDown: world.stub('spy:key')}; },
    './platform-CX_yPATJ.js#n': (value, isMac) => `${value}:${isMac}`}});
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 6, defaults: false, renamed: renamedBindings,
    scenes: [world => scene(world, false), world => scene(world, true)], props: [world => ({value: 'Alt+Space', isMacOS: true, onValueChange: world.stub('spy:value'), onReset: world.stub('spy:reset')}), {value: '', isMacOS: false, disabled: true}, {value: 'Alt+K', disabled: false}]});
});

test('an action confirmation shows its artifact like the supplied one', async () => {
  const chunk = 'assets/action-confirmation-artifact-BOdmqe64.js';
  const skill = {name: 'Plan', description: 'Plans a week', body: 'Do this', operation: 'update', existingSkillName: 'Planner', existingSkillCreator: 'builtin', keywords: ['plan', 3], urlPatterns: ['https://x/*']};
  const scene = {imports: {'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './draft-artifacts-registry-CZ58X0Cu.js#i': kind => kind === 'gmail-draft'}};
  await assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 10, defaults: false, renamed: renamedBindings, scenes: [scene],
    props: [{artifact: {type: 'screenshot', path: 'shots/a.png', alt: 'Page'}, sessionId: 's1', className: 'probe', compact: true}, {artifact: {type: 'screenshot', path: 'https://x/a.png', caption: 'Page'}}, {artifact: {type: 'screenshot', path: 'a.png'}}, {artifact: {type: 'screenshot', path: 'data:image/png;base64,AA'}, sessionId: 's1'}, {data: {operation: 'customize', existingSkillName: 'Planner', existingSkillCreator: 'builtin'}},
      {artifact: {type: 'skill-draft', data: skill}, compact: true, data: skill, label: 'Keywords', values: ['a', 'b']}, {artifact: {type: 'skill-draft', data: {operation: 'customize', existingSkillName: 'Planner'}}, data: {operation: 'customize', existingSkillName: 'Planner', existingSkillCreator: 'user'}},
      {artifact: {type: 'skill-draft', data: {operation: 'create'}}, data: {}}, {artifact: {type: 'gmail-draft', data: {to: 'a'}}, sessionId: 's1'}, {artifact: {type: 'tweet', data: {text: 'hi'}}}]});
});

/** Both sides of a chunk, for calling its helpers directly. */
const bothSides = async (chunk, constants) => {
  const world = createWorld(constants);
  const pair = await evaluatePair({world, chunk, text: textOf(chunk), blocks: ROUTES[chunk], integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, renamed: renamedBindings});
  return {world, ...pair};
};
const parityOf = (chunk, options) => assertParity({blocksByChunk: {[chunk]: ROUTES[chunk]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, defaults: false, renamed: renamedBindings, ...options});
/** Compares what a chunk returned (from the VM's realm) by value. */
const same = (actual, wanted) => assert.deepEqual(actual === undefined ? actual : JSON.parse(JSON.stringify(actual)), wanted);
/** Applies the writes a scene's useState hears, in the order they came. */
const stateHeap = initial => {
  const values = [...initial];
  return {values, onSetState: (slot, next) => { values[slot] = typeof next === 'function' ? next(values[slot]) : next; }};
};

const CHANNEL_CHAT = 'assets/route-VV0zL3cm.js';
const stored = (id, sequence, role, extra = {}) => ({id, sequence, stream_state: 'complete', reactions: [], message: {role, content: `${id} text`, timestamp: 1000 + sequence}, ...extra});
const channelFeed = [
  stored('u1', 1, 'user', {author_user_id: 'viewer-00', agent_read_at: 1500, message: {role: 'user', content: 'Hi', timestamp: 1, metadata: {attachments: [{id: 'a'}]}}}),
  stored('u2', 2, 'user', {author_user_id: 'member-12345678', reply_to: 'u1'}),
  stored('p1', 3, 'published-message', {response_id: 'r1', message: {role: 'published-message', content: 'Done', timestamp: 3, presentation: {widget: {prompt: 'Pick one'}}}, reactions: [{emoji: '+1'}]}),
  stored('p0', 4, 'published-message', {response_id: 'r1', stream_state: 'streaming'}),
  stored('prog', 5, 'published-message', {response_id: 'r2', message: {role: 'published-message', kind: 'progress', content: 'Working', timestamp: 5}}),
  stored('s1', 6, 'published-message', {response_id: 'r3', stream_state: 'streaming'}),
  stored('s2', 7, 'published-message', {response_id: 'r3', stream_state: 'streaming'}),
  stored('i1', 8, 'published-message', {response_id: 'r4', stream_state: 'interrupted'}),
  stored('i2', 9, 'published-message', {response_id: 'r5', stream_state: 'interrupted'}),
  stored('u3', 10, 'user', {reply_to: 'i2'}),
  stored('sys', 11, 'system'),
];
const channelStreams = {s2: {id: 's2', responseId: 'r3', content: 'partial', timestamp: 2000, attemptId: 1, revision: 4}, live: {id: 'live', responseId: 'r6', content: 'new', timestamp: 2100}, stale: {id: 'stale', responseId: 'r6', content: 'old', timestamp: 2050}, gone: {id: 'gone', responseId: 'r1', content: 'late', timestamp: 2200}};

test('the Channels chat builds its feed and unread line like the supplied one', async () => {
  const {supplied, ours} = await bothSides(CHANNEL_CHAT);
  const rows = side => side.__pair_feedMessages(channelFeed, channelStreams, 'viewer-00');
  assert.equal(JSON.stringify(rows(ours)), JSON.stringify(rows(supplied)));
  same(rows(ours).map(row => row.id), ['u1', 'u2', 'p1', 'prog', 's2', 'i1', 'u3', 'live']);
  const [own, other, published, , streaming, interrupted, , live] = rows(ours);
  same([own.isOwn, own.delivery, own.readAt, own.attachments], [true, 'read', 1500, [{id: 'a'}]]);
  same([other.isOwn, other.authorLabel, other.delivery, other.replyTo], [false, 'Member member-1', 'sent', 'u1']);
  same([published.message, published.reaction], [{role: 'assistant', content: 'Pick one', timestamp: 3}, {emoji: '+1'}]);
  same([streaming.isStreaming, streaming.message.content, interrupted.isInterrupted, interrupted.message.content], [true, 'partial', true, '']);
  same([live.isStreaming, live.message.content], [true, 'new']);

  const incoming = side => channelFeed.map(message => side.__pair_isIncoming(message, 'viewer-00'));
  same(incoming(ours), incoming(supplied));
  same(incoming(ours).slice(0, 3), [false, true, true]);
  const marker = (side, ...args) => JSON.stringify(side.__pair_unreadMarker(...args));
  const cases = [[undefined, 'main', 0, channelFeed, 'viewer-00', false], [undefined, 'main', 1, channelFeed, 'viewer-00', true], [{channelId: 'main', sequence: 11, markerId: 'u2'}, 'main', 1, channelFeed, 'viewer-00', true],
    [{channelId: 'main', sequence: 11}, 'main', 1, channelFeed, 'viewer-00', false], [{channelId: 'main', sequence: 2}, 'main', 1, channelFeed, 'viewer-00', false], [{channelId: 'main', sequence: 2}, 'main', 1, channelFeed, 'viewer-00', true], [{channelId: 'other', sequence: 9, markerId: 'x'}, 'main', 3, [], 'viewer-00', false]];
  for (const args of cases) assert.equal(marker(ours, ...args), marker(supplied, ...args));
  same(ours.__pair_unreadMarker(...cases[0]), {channelId: 'main', sequence: 11, markerId: 'u2'});
  same(ours.__pair_unreadMarker(...cases[1]), {channelId: 'main', sequence: 11, markerId: 'u2'});
  same(ours.__pair_unreadMarker(...cases[4]), {channelId: 'main', sequence: 11, markerId: 'p1'});
  same(ours.__pair_unreadMarker(...cases[5]), {channelId: 'main', sequence: 11});
});

test('the Channels chat applies socket events like the supplied one', async () => {
  const {supplied, ours} = await bothSides(CHANNEL_CHAT);
  const snapshot = {cursor: '7', channel: {id: 'main', name: 'Main'}, messages: [stored('b', 2, 'user'), stored('a', 1, 'user')], tasks: [{id: 't1', status: 'running', preview: {id: 't1', text: 'kept'}}], commands: [{id: 'c1', status: 'pending'}], responses: [{id: 'r1', status: 'queued'}],
    members: [{user_id: 'u', role: 'owner'}], reactions: [{message_id: 'a', user_id: 'u', emoji: '+1'}, {message_id: 'a', user_id: 'v', emoji: '+1'}]};
  const events = [{type: 'channel.updated', data: {id: 'main', name: 'Renamed'}}, {type: 'reaction.updated', data: {message_id: 'a', user_id: 'u', emoji: '+1', deleted: true}}, {type: 'reaction.updated', data: {message_id: 'b', user_id: 'u', emoji: '🎉'}},
    {type: 'message.updated', data: stored('c', 0, 'user')}, {type: 'message.updated', data: {id: 'a', deleted: true}}, {type: 'task.updated', data: {id: 't1', status: 'completed'}}, {type: 'task.updated', data: {id: 't2', status: 'running'}},
    {type: 'command.updated', data: {id: 'c1', status: 'delivered'}}, {type: 'command.updated', data: {id: 'c2', status: 'failed', error: 'No'}}, {type: 'response.updated', data: {id: 'r2', status: 'preparing'}}, {type: 'member.updated', data: {user_id: 'n', role: 'member'}}, {type: 'member.updated', data: {user_id: 'u', deleted: true}}, {type: 'other', data: {}}];
  for (const event of events) assert.equal(JSON.stringify(ours.__pair_applyChannelEvent(snapshot, {...event, cursor: '8'})), JSON.stringify(supplied.__pair_applyChannelEvent(snapshot, {...event, cursor: '8'})), event.type);
  const apply = index => ours.__pair_applyChannelEvent(snapshot, {...events[index], cursor: '8'});
  assert.equal(apply(0).cursor, '8');
  same(apply(1).reactions.map(reaction => reaction.user_id), ['v']);
  same(apply(3).messages.map(message => message.id), ['c', 'a', 'b']);
  same(apply(5).tasks, [{id: 't1', status: 'completed', preview: {id: 't1', text: 'kept'}}]);
  same(apply(7).commands, []);
  same(apply(11).members, []);
  same(ours.__pair_upsertById([{id: 'x'}, {id: 'y'}], {id: 'x', deleted: true}), [{id: 'y'}]);
});

test('the Channels socket connects, resyncs and reconnects like the supplied one', async () => {
  const {world, supplied, ours} = await bothSides(CHANNEL_CHAT, {'./strip-markdown-DRcmtuJc.js#Mn': 'https://api.aux.test'});
  const snapshot = {cursor: '1', channel: {id: 'main'}, messages: Array.from({length: 60}, (_, index) => stored(`m${index}`, index + 5, 'user')), tasks: [{id: 't1'}], commands: [], responses: [], members: [], reactions: []};
  const frames = [{type: 'snapshot', snapshot, streaming: [{id: 's1', responseId: 'r', attemptId: 1, revision: 2}], viewerId: 'me'}, {type: 'ready'},
    {type: 'event', event: {cursor: '1', type: 'channel.updated', data: {id: 'stale'}}}, {type: 'event', event: {cursor: '3', type: 'channel.updated', data: {id: 'gap'}}},
    {type: 'event', event: {cursor: '2', type: 'message.updated', data: {...stored('s1', 70, 'user')}}}, {type: 'input.failed', id: 'f1'}, {type: 'event', event: {cursor: '3', type: 'message.updated', data: {...stored('f1', 71, 'user')}}},
    {type: 'model.read', ids: ['m1', 'x'], at: 99}, {type: 'task.preview', preview: {id: 't1', text: 'Reading'}}, {type: 'streaming', streaming: {id: 's2', attemptId: 1, revision: 2}}, {type: 'streaming', streaming: {id: 's2', attemptId: 1, revision: 1}}, {type: 'streaming', streaming: {id: 's3', attemptId: 1, revision: 1}}, {type: 'streaming.removed', id: 's3'},
    {type: 'presence', userIds: ['me', 'them']}, {type: 'typing', userId: 'them', active: true, expiresAt: Date.UTC(2026, 9, 30, 12, 1)}, {type: 'typing', userId: 'gone', active: false, expiresAt: 5}];
  const run = async side => {
    const sockets = [];
    const timers = [];
    const heap = stateHeap([undefined, {}, {}, [], '', undefined, false, [], {}]);
    let hook;
    const Probe = () => (hook = side.__pair_useChannelSocket(7, 'main/1'), null);
    const scene = {timers, ...heap, liveEffects: true, imports: {'./strip-markdown-DRcmtuJc.js#An': () => 'token'}, socket: (url, protocols) => { const socket = {url: String(url), protocols, sent: [], closes: [], readyState: 1, send: text => socket.sent.push(text), close: (...args) => { socket.closes.push(args); }}; sockets.push(socket); return socket; }};
    const {effects} = world.render(Probe, {}, scene);
    await new Promise(resolve => setImmediate(resolve));
    for (const frame of frames) sockets[0].onmessage({data: JSON.stringify({version: 2, ...frame})});
    sockets[0].onmessage({data: JSON.stringify({version: 1, type: 'ready'})});
    const socket = sockets[0];
    socket.onerror();
    hook.typing(true);
    hook.appendHistory([stored('m5', 1, 'user'), stored('old', 0, 'user')]);
    const beforeClose = {nextBefore: hook.nextBefore.current, cursor: heap.values[0]?.cursor, responses: heap.values[0]?.responses, messages: heap.values[0]?.messages.length};
    socket.onclose({code: 1006});
    const delays = timers.map(([, delay]) => delay);
    await timers.at(-1)[0]();
    await new Promise(resolve => setImmediate(resolve));
    const reconnected = sockets.length;
    sockets.at(-1).onclose({code: 1006});
    delays.push(timers.at(-1)[1]);
    sockets[0].onclose({code: 1006});
    sockets.at(-1).onmessage({data: JSON.stringify({version: 2, type: 'ready'})});
    sockets.at(-1).onclose({code: 1008});
    const {values} = heap;
    return {connected: socket.url, protocols: socket.protocols, sent: socket.sent, closes: socket.closes, delays, reconnected, beforeClose, snapshot: values[0], streaming: values[1], receipts: values[2], failed: values[3], viewer: values[4], error: String(values[5]), online: values[7], typers: values[8], effects: effects.length};
  };
  const [mine, theirs] = [await run(ours), await run(supplied)];
  assert.equal(JSON.stringify(mine), JSON.stringify(theirs));
  assert.equal(mine.connected, 'wss://' + mine.connected.slice(6));
  assert.ok(mine.connected.endsWith('/channel-chat/channels/main%2F1/ws'), mine.connected);
  same(mine.protocols, ['aux-channel-v2', 'bearer.token']);
  same(mine.sent.map(text => JSON.parse(text)), [{type: 'resync'}, {type: 'typing', active: true}]);
  same(mine.closes, [[1002, 'Unsupported protocol'], []]);
  same(mine.delays, [1000, 2000]);
  assert.equal(mine.reconnected, 2);
  same(mine.beforeClose, {nextBefore: 5, cursor: '3', responses: [{id: 'm1', status: 'preparing'}, {id: 'x', status: 'preparing'}], messages: 63});
  assert.equal(mine.snapshot, undefined);
  assert.equal(mine.error, 'Error: Channel access was revoked.');
  same([mine.failed, Object.keys(mine.receipts), mine.online, mine.viewer], [[], ['m1', 'x'], ['me', 'them'], 'me']);
  same(Object.keys(mine.typers), ['them', 'gone']);
});

const channelSnapshot = {cursor: '5', channel: {id: 'main', name: 'Launch', cloudSessionId: 'cs1'}, messages: channelFeed.slice(0, 3), tasks: [{id: 't1', status: 'running', environment: {type: 'cloud'}}, {id: 't2', status: 'completed', environment: {type: 'cloud'}}, {id: 't3', status: 'pending', environment: {type: 'local'}}, {id: 't4', status: 'suspended', environment: {type: 'cloud'}}],
  commands: [{id: 'c1', status: 'failed', error: 'Could not start'}, {id: 'c2', status: 'running'}], responses: [{id: 'u1', status: 'preparing'}, {id: 'u2', status: 'queued'}, {id: 'p1', status: 'done'}],
  members: [{user_id: 'viewer-00', role: 'owner'}], reactions: [{message_id: 'u1', user_id: 'viewer-00', emoji: '+1'}]};
const channelList = [{id: 'side', name: 'Side', icon: 'star', color: 'red'}, {id: 'main', name: 'Launch', isMain: true, icon: 'tag', color: 'blue'}, {id: 'third', name: 'Third'}];
const channelState = ({snapshot = channelSnapshot, streaming = {}, receipts = {u2: 9}, failed = [], viewer = 'viewer-00', error, connected = true, presence = ['viewer-00', 'them'], typers = {them: Date.UTC(2026, 9, 30, 13), me: 1}, pending = [], marker} = {}) =>
  [snapshot, streaming, receipts, failed, viewer, error, connected, presence, typers, false, pending, true, marker];
const channelImports = (world, {calls = [], channels = {data: channelList}, status = 200} = {}) => ({
  './strip-markdown-DRcmtuJc.js#An': () => 'token',
  './strip-markdown-DRcmtuJc.js#nr': options => (String(options.queryKey.at(-1)) === 'read-state' ? {data: [{channel_id: 'main', read_sequence: 1, unread_count: 2}, {channel_id: 'side', read_sequence: 0, unread_count: 150}]} : channels),
  './strip-markdown-DRcmtuJc.js#er': options => ({isPending: false, mutate: (value, handlers) => { calls.push(['mutate', value, Boolean(handlers?.onError)]); handlers?.onError?.({message: 'Denied'}); }, mutateAsync: async value => { const result = await options.mutationFn(value); options.onSuccess?.(result); return result; }}),
  './strip-markdown-DRcmtuJc.js#pr': {setQueryData: (key, update) => calls.push(['setQueryData', key, update([{channel_id: 'main', read_sequence: 1, unread_count: 2}, {channel_id: 'side', read_sequence: 0}])]), invalidateQueries: filter => calls.push(['invalidate', filter]), fetchQuery: options => (calls.push(['fetchQuery', options.queryKey, options.staleTime, options.retry]), options.queryFn())},
  fetch: async (url, init) => { calls.push(['fetch', String(url), init?.method, init?.body, init?.headers]); return {ok: status < 400, status, json: async () => (status < 400 ? {nextBefore: 3, messages: [], read_sequence: 2, unread_count: 0} : {error: 'Bad channel'})}; },
  './link-q1zvRKtc.js#r': () => ({userId: '7', channelId: 'main'}),
  './Match-OymXmaXz.js#o': () => world.stub('spy:navigate'),
  matchMedia: () => ({matches: true}),
  'window.matchMedia': () => ({matches: true}),
  'document.getElementById': () => ({scrollIntoView: world.stub('spy:scrollIntoView')}),
});

test('the Channels rail and page render like the supplied ones', async () => {
  const cases = [{}, {receipts: {}, typers: {}, presence: ['viewer-00'], viewer: 'x'}, {snapshot: {...channelSnapshot, channel: {id: 'main', name: 'Launch'}, tasks: [], commands: []}}, {snapshot: undefined, error: new Error('Reconnecting to channel…'), connected: false}];
  await parityOf(CHANNEL_CHAT, {minimum: 30,
    scenes: [...cases.map(options => world => ({state: channelState(options), imports: channelImports(world), event: {target: {value: 'side'}}})),
      world => ({state: channelState({snapshot: undefined}), imports: channelImports(world, {channels: {data: undefined}})}),
      ...[[undefined, false, false], [{id: 'n', name: '', icon: 'tag', color: 'blue', instructions: ''}, false, false], [{id: 'main', name: ' Launch ', isMain: true, instructions: 'Be brief'}, false, true], [{id: 'x', name: 'Edit me', instructions: 'Hi'}, true, false]].map(state => world => ({state, imports: channelImports(world), event: {preventDefault: world.stub('spy:preventDefault'), target: {value: 'typed'}}}))],
    props: [{channels: channelList, unreadCounts: {side: 150, third: 99}, selected: 'main', onSelect: () => {}, onSave: async () => {}, onArchive: async () => {}, accountId: 7, channelId: 'main'},
      {channels: [channelList[0]], selected: 'side', onSelect: () => {}, onSave: async () => { throw new Error('Taken'); }, onArchive: async () => { throw 'offline'; }, accountId: 7, channelId: 'gone', task: channelSnapshot.tasks[0], clientFactory: id => `client:${id}`}]});
});

test('the Channels chat sends, retries and marks read like the supplied one', async () => {
  const {world, supplied, ours} = await bothSides(CHANNEL_CHAT, {'./strip-markdown-DRcmtuJc.js#Mn': 'https://api.aux.test'});
  const flow = async (side, options) => {
    const calls = [];
    const heap = stateHeap(channelState(options));
    let chat;
    const Probe = () => (chat = side.__pair_useChannelChat(7, 'main/1'), null);
    world.render(Probe, {}, {state: heap.values, ...heap, imports: channelImports(world, {calls, ...options}), timers: []});
    const settled = async work => { try { calls.push(['result', await work()]); } catch (error) { calls.push(['threw', String(error.message)]); } };
    const shown = {messages: chat.messages, typing: chat.typing, isOwner: chat.isOwner, online: chat.online, humanTypers: chat.humanTypers, unreadCounts: chat.unreadCounts, firstUnreadId: chat.firstUnreadId, feed: {isPending: chat.feed.isPending, hasNextPage: chat.feed.hasNextPage}};
    await settled(() => chat.send('Hello', 'u1', [{id: 'f'}], 'keyboard'));
    await settled(() => chat.saveChannel.mutateAsync({id: 'a b', name: 'New'}));
    await settled(() => chat.archiveChannel.mutateAsync('a b'));
    await settled(() => chat.react.mutateAsync({id: 'u1', emoji: '+1'}));
    await settled(() => chat.react.mutateAsync({id: 'u2', emoji: '+1'}));
    await settled(() => chat.retryCommand.mutateAsync('c 1'));
    await settled(() => chat.feed.fetchNextPage());
    await settled(() => chat.warm());
    chat.markRead('u2');
    chat.markRead('u2');
    chat.markRead('u1');
    chat.markRead('missing');
    chat.dismissUnread();
    await new Promise(resolve => setImmediate(resolve));
    chat.retry('p1');
    chat.retry('none');
    chat.retry('i9');
    await new Promise(resolve => setImmediate(resolve));
    return {shown, calls, pending: heap.values[10], marker: heap.values[12], loading: heap.values[9]};
  };
  for (const options of [{}, {status: 500}, {snapshot: {...channelSnapshot, messages: [...channelFeed.slice(0, 2), stored('i9', 3, 'published-message', {stream_state: 'interrupted', response_id: 'r9'})], responses: []}, failed: ['local'], pending: [{id: 'local', message: {role: 'user', content: 'x'}}, {id: 'read', message: {role: 'user', content: 'y'}}, {id: 'u1', message: {role: 'user', content: 'dup'}}], receipts: {read: 5}}])
    assert.equal(JSON.stringify(await flow(ours, options)), JSON.stringify(await flow(supplied, options)));
  const ok = await flow(ours, {});
  same(ok.shown.messages.map(message => message.id), ['u1', 'u2', 'p1']);
  same([ok.shown.typing, ok.shown.isOwner, ok.shown.online, ok.shown.humanTypers, ok.shown.unreadCounts, ok.shown.feed], [true, true, 2, ['Member them'], {main: 2, side: 150}, {isPending: false, hasNextPage: false}]);
  const fetches = ok.calls.filter(([kind]) => kind === 'fetch');
  same(fetches.find(([, url]) => url.endsWith('/messages')).slice(1), ['https://api.aux.test/channel-chat/channels/main%2F1/messages', 'POST', '{"text":"Hello","replyTo":"u1","attachments":[{"id":"f"}]}', {'content-type': 'application/json', authorization: 'Bearer token'}]);
  same(fetches.slice(2, 7).map(([, url, method, body]) => [url.split('/channel-chat')[1], method, body]), [['/channels/a%20b', 'PUT', '{"id":"a b","name":"New"}'], ['/channels/a%20b', 'PATCH', '{"archived":true}'],
    ['/channels/main%2F1/messages/u1/reactions', 'PUT', '{"emoji":"+1","selected":false}'], ['/channels/main%2F1/messages/u2/reactions', 'PUT', '{"emoji":"+1","selected":true}'], ['/channels/main%2F1/retry/c%201', 'POST', '{}']]);
  assert.ok(fetches.some(([, url]) => url.endsWith('/channels/main%2F1/warm')));
  same(fetches.filter(([, url]) => url.endsWith('/channels/main/read')).map(([, , , body]) => JSON.parse(body).sequence), [3, 2, 3]);
  same(ok.calls.find(([kind]) => kind === 'setQueryData')[2], [{channel_id: 'main', read_sequence: 2, unread_count: 1, nextBefore: 3, messages: []}, {channel_id: 'side', read_sequence: 0}]);
  same(ok.pending.map(item => item.delivery), ['sent']);
  const interrupted = await flow(ours, {snapshot: {...channelSnapshot, messages: [stored('i9', 3, 'published-message', {stream_state: 'interrupted', response_id: 'r9'})], responses: []}});
  assert.ok(interrupted.calls.some(([kind, , , body]) => kind === 'fetch' && body?.includes('Please finish your previous reply.') && body.includes('"replyTo":"i9"')));
  const failed = await flow(ours, {status: 500});
  same(failed.calls.filter(([kind]) => kind === 'threw')[0], ['threw', 'Bad channel']);
  same(failed.pending.map(item => item.delivery), ['failed']);
});

const ONBOARDING_AI = 'assets/ai-CzEX5E7S.js';
const onboardingPlans = [{id: 'free', name: 'Aux Free', prices: {monthly: {amount: '$0', lookupKey: null}}, features: [{text: 'Basic chat', icon: 'check'}, {text: 'Routines · 3 a day', icon: 'plus', muted: true, badge: 'New'}]},
  {id: 'pro', name: 'Aux Pro', prices: {monthly: {amount: '$20', lookupKey: 'pro_monthly'}}, features: [{text: 'Deep research', icon: 'check'}]}, {id: 'team', name: 'Aux Team', prices: {monthly: {amount: '$40', lookupKey: 'team'}}, features: []}];
const onboardingProviders = [{id: 'aux', name: 'Aux', type: 'subscription'}, {id: 'github-copilot', name: 'Copilot', type: 'subscription', description: 'Your plan'}, {id: 'claude-code', name: 'Claude', type: 'subscription'}, {id: 'openai-codex', name: 'Codex', type: 'subscription'}, {id: 'gemini', name: 'Google', type: 'manual'}, {id: 'openrouter', name: 'OpenRouter', type: 'manual'}, {id: 'custom-json', name: 'Custom', type: 'manual'}];
const paid = {plan: {slug: 'pro'}, status: 'active'};
const onboardingImports = (world, {calls = [], subscription = paid, connected = new Set(['claude-code']), search = {}, form = {}} = {}) => {
  const note = name => (...args) => { calls.push([name, args[0]]); };
  return {
    './strip-markdown-DRcmtuJc.js#St': options => options, './strip-markdown-DRcmtuJc.js#bt': inventory => inventory, './strip-markdown-DRcmtuJc.js#Ot': (selection, id) => selection.modelsByProvider[id]?.[0]?.id,
    './strip-markdown-DRcmtuJc.js#tr': options => (String(options[STUB_PATH]).includes('getSubscription') ? {data: {subscription}} : {data: {plans: onboardingPlans}}),
    './strip-markdown-DRcmtuJc.js#er': () => ({isPending: false, mutateAsync: async input => { calls.push(['checkout', input.lookupKey, input.returnUrl]); return {clientSecret: 'sec', publishableKey: 'pk'}; }}),
    './strip-markdown-DRcmtuJc.js#pr': {fetchQuery: async () => (calls.push(['fetchQuery']), {modelsByProvider: {gemini: [{id: 'g-1', provider: 'gemini', availableThinkingLevels: ['low']}]}}), setQueryData: (key, update) => calls.push(['setQueryData', update({theme: 'dark'}), update(undefined)]), query: async () => ({subscription})},
    './strip-markdown-DRcmtuJc.js#Ut': {track: (...args) => calls.push(['track', args])}, './strip-markdown-DRcmtuJc.js#En': {broadcastBillingChanged: note('broadcast')},
    './queries-ldd77hNk.js#g.settings.set.mutate': async input => (calls.push(['setDefault', input]), {warnings: ['Model is new']}),
    './use-agent-settings-DiedG0R1.js#s': levels => levels[0], './use-agent-settings-DiedG0R1.js#r': (...args) => calls.push(['remember', args]), './use-agent-settings-DiedG0R1.js#c': id => id === 'openrouter',
    './pricing-table-shared-BWz9Ewvm.js#s': plans => plans, './pricing-table-shared-BWz9Ewvm.js#o': text => text.split(' · '), './pricing-table-shared-BWz9Ewvm.js#r': id => `Choose ${id}`, './pricing-table-shared-BWz9Ewvm.js#i': (plan, price) => `${plan}/${price.amount}`,
    './provider-context-A_wu0fRN.js#n': {modelCatalog: {providerOptions: onboardingProviders}, connected, setCurrentProvider: note('setCurrentProvider'), completeConnection: async id => calls.push(['completeConnection', id])},
    './tag-icon-DeMC7uIN.js#f': () => ({formState: {}}), './tag-icon-DeMC7uIN.js#p': () => ({watch: () => 'byok', setValue: (...args) => calls.push(['setValue', args]), handleSubmit: handler => () => handler(form), ...form.overrides}),
    './extension-main-Dz1-AsCT.js#z.useLoaderData': {accountId: 7}, './extension-main-Dz1-AsCT.js#z.useSearch': search,
    './Match-OymXmaXz.js#o': () => note('navigate'), './dist-LyKrHgST.js#n.error': note('toast.error'), './dist-LyKrHgST.js#n.warning': note('toast.warning'),
  };
};

test('onboarding lists its providers and plans like the supplied page', async () => {
  const props = [{}, {accountId: 7}, {accountId: 7, onCheckoutComplete: async () => {}, onConnectAux: async () => {}}, {plans: onboardingPlans, isActionPending: false, onPlanSelect: () => {}, plan: onboardingPlans[1], disabled: false, feature: onboardingPlans[0].features[1], price: onboardingPlans[1].prices.monthly},
    {plan: onboardingPlans[0], price: onboardingPlans[0].prices.monthly, feature: onboardingPlans[0].features[0], onPlanSelect: () => {}, disabled: true, isActionPending: true, plans: []}, {plan: {...onboardingPlans[1], prices: {monthly: {amount: '$20'}}}, price: onboardingPlans[1].prices.monthly},
    {open: true, providers: onboardingProviders.slice(1, 3), onOpenChange: () => {}, onSelect: () => {}}, {provider: onboardingProviders[0]}, {provider: {id: 'aux', name: 'Aux', description: 'x'}, icon: 'icon'}, {provider: onboardingProviders[1]},
    {clientSecret: 'sec', publishableKey: 'pk', isCompleting: true, onComplete: () => {}, children: 'x'}, {clientSecret: 'sec', publishableKey: 'pk', isCompleting: false, onComplete: () => {}}];
  const awaited = {onConnectAux: async () => {}, onCheckoutComplete: async () => {}, onComplete: () => {}, onPlanSelect: () => {}};
  await parityOf(ONBOARDING_AI, {minimum: 60, props: props.map(entry => ({...awaited, ...entry})),
    scenes: [world => ({imports: onboardingImports(world), state: [null, false], event: {key: 'x', target: {}}}), world => ({imports: onboardingImports(world, {subscription: null}), state: ['more', false]}), world => ({imports: onboardingImports(world), state: ['byok', true]}),
      world => ({imports: onboardingImports(world), state: [{clientSecret: 's', publishableKey: 'pk'}, true], window: {location: {protocol: 'chrome-extension:'}}}), world => ({imports: onboardingImports(world), state: [{clientSecret: 's', publishableKey: 'pk'}, false], window: {location: {protocol: 'https:'}}}), world => ({imports: onboardingImports(world), state: ['Could not load', true]})]});
});

test('onboarding sets the default model and submits a provider like the supplied page', async () => {
  const {world, supplied, ours} = await bothSides(ONBOARDING_AI, {'./queries-ldd77hNk.js#S': 'https://app.aux.test/'});
  const trpc = {models: {listSettingsInventory: {queryOptions: input => input}}, settings: {getAll: {queryKey: input => ['settings', input]}}};
  const setDefault = async (side, providerId) => {
    const calls = [];
    const imports = onboardingImports(world, {calls});
    world.enter({imports});
    await side.__pair_setDefaultModel({accountId: 7, providerId, queryClient: imports['./strip-markdown-DRcmtuJc.js#pr'], trpc});
    return calls;
  };
  for (const id of ['gemini', 'none']) assert.equal(JSON.stringify(await setDefault(ours, id)), JSON.stringify(await setDefault(supplied, id)));
  same((await setDefault(ours, 'gemini')).filter(([name]) => name === 'setDefault' || name === 'remember' || name === 'setQueryData'), [['setDefault', {accountId: 7, key: 'defaultModel', value: {provider: 'gemini', modelId: 'g-1', thinkingLevel: 'low', fastMode: false}}], ['remember', [7, 'gemini', 'g-1', 'low', false]],
    ['setQueryData', {theme: 'dark', defaultModel: {provider: 'gemini', modelId: 'g-1', thinkingLevel: 'low', fastMode: false}}, null]]);
  assert.ok(JSON.stringify(await setDefault(ours, 'gemini')).includes('Model is new'));
  same(await setDefault(ours, 'none'), [['fetchQuery']]);

  const picker = async (side, provider, event) => {
    const calls = [];
    let tree;
    const scene = {imports: onboardingImports(world, {calls, form: {provider}}), state: [null], event: event ?? {key: 'x'}};
    tree = world.render(side.__pair_ProviderPicker, {accountId: 7}, scene);
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify([tree, calls]);
  };
  for (const provider of ['claude-code', 'github-copilot', 'aux', 'byok']) assert.equal(await picker(ours, provider), await picker(supplied, provider));
  const keys = {key: 'Enter', defaultPrevented: false, repeat: false, nativeEvent: {isComposing: false}, preventDefault: () => {}, stopPropagation: () => {}};
  for (const event of [keys, {...keys, repeat: true}, {...keys, defaultPrevented: true}, {...keys, nativeEvent: {isComposing: true}}, {...keys, metaKey: true}, {...keys, ctrlKey: true}, {...keys, altKey: true}, {...keys, shiftKey: true}, {...keys, key: 'a'}])
    assert.equal(await picker(ours, 'claude-code', event), await picker(supplied, 'claude-code', event));
  const route = async (side, provider, failing) => {
    const calls = [];
    const imports = onboardingImports(world, {calls});
    if (failing) imports['./strip-markdown-DRcmtuJc.js#pr'] = {...imports['./strip-markdown-DRcmtuJc.js#pr'], fetchQuery: async () => { throw new Error('offline'); }};
    world.render(side.component, {}, {imports, args: [provider]});
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify(calls);
  };
  for (const [provider, failing] of [['claude-code'], ['github-copilot'], ['gemini', true], ['aux'], ['custom']]) assert.equal(await route(ours, provider, failing), await route(supplied, provider, failing));
  const offline = await route(ours, 'gemini', true);
  assert.ok(offline.includes('Failed to set the default model for this provider.') && offline.includes('/onboarding/done'));
});

const EXPERIMENTAL = 'assets/experimental-Xq3YsEPK.js';
const experimentalImports = (world, {calls = [], email = 'dev@aux.invalid', experimental = {sync: true, kakaotalk: false, onboarding: true, format: 'aux.experimental.v2', auxCode: true, compactionLimits: false}, tabs = [{id: 3, title: 'Docs', url: 'https://docs.example'}, {id: 4, title: '', url: 'https://x.example'}], fetching = false, error, pending = false, skills = [], create} = {}) => ({
  './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7},
  './strip-markdown-DRcmtuJc.js#nr': options => (Array.isArray(options.queryKey) ? {data: tabs, isFetching: fetching, error, refetch: world.stub('spy:refetch')} : String(options[STUB_PATH]).includes('accounts') ? {data: {email}} : {data: experimental ?? undefined}),
  './strip-markdown-DRcmtuJc.js#pr': {invalidateQueries: filter => { calls.push(['invalidate', filter]); }, query: async () => { if (skills === null) throw new Error('offline'); return skills; }, setQueryData: (key, value) => { calls.push(['setQueryData', value]); }},
  './strip-markdown-DRcmtuJc.js#er': () => ({isPending: pending, mutateAsync: create ?? (async input => (calls.push(['create', input]), {id: 'task-1'}))}),
  './use-update-settings-ahXnGzre.js#t': () => ({isPending: pending, mutate: input => { calls.push(['mutate', input]); }}),
  './extension-main-Dz1-AsCT.js#m.useParams': {userId: '7'}, './Match-OymXmaXz.js#o': () => async target => calls.push(['navigate', target]),
  './browser-binding-CzDmxQNA.js#n': async () => 'binding-1', './error-content-CCom8r6s.js#t': async (failure, fallback) => ({title: fallback, description: String(failure.message)}),
  './utils-Cl9zfMcr.js#f': mention => `[[${mention.skillPath}]]`, './draft-storage-ixLojjZ5.js#c': (id, message, options) => { calls.push(['draft', id, message.content, options]); },
  './dist-LyKrHgST.js#n.error': (title, options) => { calls.push(['toast.error', title, options.description]); },
  'customElements.get': true,
});

test('Settings › Experimental renders and saves like the supplied page', async () => {
  const scenes = [{}, {email: 'Robert@AUX.invalid ', tabs: [], error: {message: 'No tabs'}}, {email: 'person@example.com', pending: true}, {fetching: true, tabs: [], experimental: null}, {experimental: {sync: false, onboarding: false}}];
  await parityOf(EXPERIMENTAL, {minimum: 60, props: [{children: 'Page'}, {tabId: 3, onAttached: () => {}, onDetached: () => {}, onError: () => {}}],
    scenes: [...scenes.flatMap(options => [[null, null, false, null], [3, {id: 3, title: 'Docs'}, true, 'Could not attach'], [4, {id: 4, title: 'x'}, false, null]].map(state => world => ({imports: experimentalImports(world, options), state, args: [true]}))),
      world => ({imports: {...experimentalImports(world), 'customElements.get': false}, state: [null, null, false, null]})]});
  const {world, supplied, ours} = await bothSides(EXPERIMENTAL);
  const save = (side, row) => {
    const calls = [];
    world.render(side[`__pair_${row}`], {}, {imports: experimentalImports(world, {calls}), args: [true]});
    return calls;
  };
  const failure = async side => {
    const calls = [];
    let onError;
    world.render(side.__pair_useExperimental, {}, {imports: {...experimentalImports(world, {calls}), './use-update-settings-ahXnGzre.js#t': options => (onError = options.onError, {})}});
    await onError(new Error('Offline'));
    return calls;
  };
  same(await failure(ours), await failure(supplied));
  same(await failure(ours), [['toast.error', 'Failed to update experimental settings.', 'Offline']]);
  const rows = {SyncRow: 'sync', KakaoTalkRow: 'kakaotalk', OnboardingRow: 'onboarding', AuxCodeRow: 'auxCode', CompactionLimitsRow: 'compactionLimits'};
  for (const [row, key] of Object.entries(rows)) {
    assert.equal(JSON.stringify(save(ours, row)), JSON.stringify(save(supplied, row)));
    same(save(ours, row)[0][1].value[key], true);
    same([save(ours, row)[0][1].key, save(ours, row)[0][1].value.format], ['experimental', 'aux.experimental.v2']);
  }
});

test('Start onboarding opens a task like the supplied row', async () => {
  const {world, supplied, ours} = await bothSides(EXPERIMENTAL);
  const start = async (side, options) => {
    const calls = [];
    world.render(side.__pair_StartOnboardingRow, {}, {imports: experimentalImports(world, {calls, ...options})});
    await new Promise(resolve => setImmediate(resolve));
    return calls;
  };
  const skill = {absolutePath: 'C:\\aux\\builtin\\onboarding\\SKILL.md'};
  for (const options of [{skills: [{absolutePath: '/other/SKILL.md'}, skill]}, {skills: []}, {skills: null}, {create: async () => { throw new Error('Quota'); }}])
    assert.equal(JSON.stringify(await start(ours, options)), JSON.stringify(await start(supplied, options)));
  const [[, created], ...rest] = await start(ours, {skills: [skill]});
  same(created.message.content.startsWith(`[[${skill.absolutePath}]] Hi! I'm new to Aux.`), true);
  same([created.title, created.trigger, created.model, created.runtimeConfig, created.browserBinding], ['Welcome to Aux', {type: 'user', source: 'onboarding'}, {provider: 'aux', modelId: 'grok-4.6', thinkingLevel: 'medium', fastMode: false}, {strictModelSelection: true, memoryExtractionDisabled: true}, 'binding-1']);
  same(rest.at(-1), ['navigate', {to: '/u/$userId/tasks/$sessionId', params: {userId: '7', sessionId: 'task-1'}}]);
  same((await start(ours, {skills: []}))[0][1].message.content.startsWith('Hi!'), true);
  same((await start(ours, {create: async () => { throw new Error('Quota'); }})).at(-1), ['toast.error', 'Failed to start onboarding.', 'Quota']);
});

test('the live tab webview attaches and detaches like the supplied one', async () => {
  const {world, supplied, ours} = await bothSides(EXPERIMENTAL);
  const openTabs = [{id: 1, url: 'https://a.example', title: 'A'}, {id: 2, url: 'https://b.example', active: true}, {id: 3, url: 'https://c.example', discarded: true}, {id: 4, url: 'chrome://settings'}, {id: 5}, {url: 'https://none'}, {id: 6, url: 'http://plain.example'}, {id: 9, url: 'http://self.example'}];
  const list = async side => {
    let run;
    const imports = {...experimentalImports(world), './strip-markdown-DRcmtuJc.js#nr': options => { if (Array.isArray(options.queryKey)) run = options.queryFn; return {data: []}; }, 'chrome.tabs.query': async () => openTabs, 'chrome.tabs.getCurrent': async () => ({id: 9})};
    world.render(side.__pair_LiveTabLayout, {}, {imports, state: [null, null, false, null]});
    world.enter({imports});
    return (await run()).map(tab => tab.id);
  };
  same(await list(ours), [1, 6]);
  same(await list(supplied), [1, 6]);
  const attach = async (side, attachTab) => {
    const calls = [];
    const note = name => (...args) => { calls.push([name, ...args]); };
    const imports = {'document.createElement(webview).attachTab': attachTab, 'document.createElement(webview).setAttribute': note('setAttribute'), 'document.createElement(webview).addEventListener': note('listen'), 'document.createElement(webview).remove': note('remove'), 'container.append': note('append')};
    world.render(side.__pair_LiveTabView, {tabId: 3, onAttached: note('attached'), onDetached: note('detached'), onError: note('failed')}, {imports, domRef: world.stub('container'), liveEffects: true});
    await new Promise(resolve => setImmediate(resolve));
    return calls.filter(([name]) => name !== 'listen');
  };
  for (const attachTab of [async () => {}, async () => { throw new Error('Tab closed'); }]) assert.equal(JSON.stringify(await attach(ours, attachTab)), JSON.stringify(await attach(supplied, attachTab)));
  const shown = await attach(ours, async id => { assert.equal(id, 3); });
  same(shown.map(([name]) => name), ['setAttribute', 'append', 'attached']);
  same(shown[0], ['setAttribute', 'aria-label', 'Live tab content']);
  same((await attach(ours, async () => { throw new Error('Tab closed'); })).at(-1), ['failed', 'Tab closed']);
});

test('the onboarding layout and its heroes render like the supplied ones', async () => {
  const chunk = 'assets/route-CSKkWqf5.js';
  const scene = (path, {reduced = false, choice = 'external', state, video} = {}) => world => ({state, frames: true, imports: {'./strip-markdown-DRcmtuJc.js#mr': ({select}) => select({pathname: path}), './strip-markdown-DRcmtuJc.js#Xt': reduced,
    './strip-markdown-DRcmtuJc.js#Ut': {track: world.stub('spy:track')}, './-context-CnivYB_B.js#n': {passwordManagerChoice: choice}, 'window.setTimeout': (fn, delay) => (world.stub('spy:timer')(delay), 11)}});
  const paths = ['/onboarding/glance/', '/onboarding/import-password', '/onboarding/import-browser/progress', '/onboarding/ai', '/onboarding/done', '/onboarding/splash///', '/elsewhere'];
  await parityOf(chunk, {minimum: 100, props: [{}, {paused: true, width: '400px', active: true, children: 'x', choice: 'external', delay: 0.4}, {paused: false, active: false, width: null, choice: 'builtin', className: 'bg-black text-white', children: ['a', 'b'], delay: 0, src: '/row.webp', direction: 'left', duration: 28}, {direction: 'right', src: '/row.webp', duration: 32, paused: true}],
    scenes: [...paths.map(path => scene(path)), scene('/onboarding/glance', {reduced: true, choice: 'builtin'}), scene('/onboarding/import-password', {choice: 'builtin', state: [true, true, true]}), scene('/onboarding/import-password', {reduced: true, state: [new Set(['glance']), false, false]})]});
  const {world, supplied, ours} = await bothSides(chunk);
  for (const path of [...paths, '/onboarding/glance///']) assert.equal(ours.__pair_panelForPath(path), supplied.__pair_panelForPath(path));
  same(paths.map(path => ours.__pair_panelForPath(path)), ['glance', 'import-password', null, null, null, null, null]);
  same(paths.map(path => ours.__pair_panelWidth(path)), [null, '400px', null, null, null, null, null]);
  same(['/onboarding/import-password/', '/x'].map(path => supplied.__pair_panelWidth(path)), ['400px', null]);
  same(ours.__pair_rotateSlots(ours.__pair_rotateSlots({0: 0, 1: 1, 2: 2})), {0: 1, 1: 2, 2: 0});
  same(supplied.__pair_rotateSlots({0: 0, 1: 1, 2: 2}), {0: 2, 1: 0, 2: 1});
  same([0, 1, 2].map(slot => ours.__pair_nextSlot(slot)), [2, 0, 1]);
  same(ours.__pair_STEP_NAMES.size, 7);
  const timers = [];
  const tracked = [];
  world.render(ours.__pair_PromptStack, {paused: false}, {timers, state: [{0: 0, 1: 1, 2: 2}]});
  same(timers.map(([, delay]) => delay), [2800]);
  world.render(ours.component, {}, {imports: {'./strip-markdown-DRcmtuJc.js#mr': ({select}) => select({pathname: '/onboarding/import-browser/progress/'}), './strip-markdown-DRcmtuJc.js#Ut': {track: (...args) => tracked.push(args)}}});
  same(tracked, [['onboarding.step.reach', {value: 'import-browser-progress'}]]);
});

const WEB_LAYOUT = 'assets/route-BiU8pLwS.js';
/** A small zustand: `create()(init)` and `create(init)`. */
const zustand = () => {
  const stores = [];
  const create = init => {
    if (!init) return create;
    let state = init();
    const listeners = new Set();
    const store = {getState: () => state, setState: patch => { const before = state; state = {...state, ...patch}; for (const listener of listeners) listener(state, before); }, subscribe: listener => (listeners.add(listener), () => listeners.delete(listener))};
    stores.push(store);
    return store;
  };
  return create;
};

test('the cloud chat store keeps one client per session like the supplied one', async () => {
  const {world, supplied, ours} = await bothSides(WEB_LAYOUT);
  const textMessage = (role, text, extra) => ({role, content: [{type: 'text', text}], ...extra});
  const hello = {role: 'user', content: 'Hi', metadata: {}};
  const recall = {role: 'user', content: 'Memory', metadata: {contextRecall: true}};
  const answer = textMessage('assistant', 'Sure');
  const blank = textMessage('assistant', '');
  const tools = {role: 'assistant', content: [{type: 'tool', name: 'x'}]};
  const metadata = {role: 'user-message-metadata', metadata: {}};
  const brief = textMessage('assistant', 'k');
  const run = async (side, script) => {
    const calls = [];
    const clients = [];
    let racing = false;
    const imports = {'./provider-Cw0zhujt.js#it': zustand(), 'new ./provider-Cw0zhujt.js#et': options => {
      const clientStore = zustand()(() => ({messageOrder: 0, messagesByKey: 1, streamingMessage: null, status: 'idle', error: null, messages: [hello, recall, blank, tools, answer, metadata, brief]}));
      const client = {options, store: clientStore, getStore: () => clientStore, getState: () => clientStore.getState(), reconnectToStream: async () => { calls.push(['reconnect', options.sessionId]); if (script.failReconnect) throw new Error('Network'); }, hydrateMessages: messages => { calls.push(['hydrate', messages.length]); clientStore.setState({messages}); }, dispose: () => calls.push(['dispose', options.sessionId])};
      clients.push(client);
      return client;
    }};
    world.enter({imports});
    const chat = side.__pair_createCloudChatStore({endpoint: id => `https://cloud/${id}`, createSocket: async () => 'socket', readSession: async id => { calls.push(['read', id]); if (racing) clients[0].options.onEvent({type: 'text_delta'}); return {messages: script.history ?? [hello, answer, metadata, brief], status: script.status ?? 'idle'}; }});
    const outcomes = [];
    for (let time = 0; time < 2; time++) await chat.connect('s1').then(() => outcomes.push('ok'), error => outcomes.push(error.message));
    const snapshot = () => ({view: chat.store.getState(), execution: chat.executionStore.getState()});
    const steps = [snapshot()];
    const client = clients[0];
    if (client) {
      client.options.onEvent({type: 'agent_start'});
      steps.push(snapshot());
      racing = true;
      await chat.refresh('s1');
      racing = false;
      steps.push(snapshot());
      client.store.setState({streamingMessage: textMessage('assistant', 'Typing')});
      steps.push(snapshot());
      client.store.setState({status: 'streaming', streamingMessage: null});
      client.store.setState({status: 'error', error: 'Lost'});
      steps.push(snapshot());
      client.store.setState({status: 'idle', error: null});
      client.options.onEvent({type: 'tool_call'});
      client.options.onEvent({type: 'agent_end'});
      await new Promise(resolve => setImmediate(resolve));
      steps.push(snapshot());
      steps.push(await client.options.resync());
      steps.push(await chat.refresh('none'));
    }
    chat.dispose();
    calls.push(['disposed']);
    return {calls, steps, outcomes, clients: clients.length, options: Object.keys(clients[0]?.options ?? {})};
  };
  for (const script of [{}, {status: 'running'}, {failReconnect: true}, {history: [recall, blank]}])
    assert.equal(JSON.stringify(await run(ours, script)), JSON.stringify(await run(supplied, script)));
  const shown = await run(ours, {});
  same(shown.clients, 1);
  same(shown.steps[0].view.s1.messages, [hello, answer, metadata, brief]);
  same(shown.steps[1].view.s1.status, 'running');
  same(shown.steps[2].view.s1.status, 'running');
  same(shown.steps[3].execution.s1.at(-1), textMessage('assistant', 'Typing'));
  same([shown.steps[4].view.s1.status, shown.steps[4].view.s1.error], ['errored', 'Lost']);
  same(shown.steps[5].view.s1.status, 'idle');
  same(shown.steps[6], {live: false});
  same((await run(ours, {status: 'running'})).steps[6], {live: true});
  same(shown.calls.slice(-2), [['dispose', 's1'], ['disposed']]);
  const failed = await run(ours, {failReconnect: true});
  same([failed.outcomes, failed.clients, failed.calls.filter(([name]) => name === 'dispose').length >= 2], [['Network', 'Network'], 2, true]);
  same(failed.steps[0].view.s1.error, 'Network');
});

test('the web layout gates on the account and arranges the sidebar like the supplied one', async () => {
  const base = (world, {sidebar = 'open', pathname = '/u/7/tasks/s1', enabled = true, narrow = true, focused = true, extension = false, browserProfile = 'p', accountId = 7, collapsed = true} = {}) => ({frames: true, imports: {
    './strip-markdown-DRcmtuJc.js#mr': options => (options?.select ? options.select({pathname}) : {pathname}), './utils-DCBm67_n.js#y': enabled, './sidebar-Cj9gldy1.js#s': {sidebarState: sidebar, setSidebarState: world.stub('spy:setSidebarState')},
    './provider-Cw0zhujt.js#Q': focused, './extension-page-url-BH3pfT7h.js#i': extension, './extension-main-Dz1-AsCT.js#j.useRouteContext': {accountId: 7}, './queries-ldd77hNk.js#i': async () => ({browserProfile, accountId}), 'window.matchMedia': () => ({matches: narrow, addEventListener: world.stub('spy:listen'), removeEventListener: world.stub('spy:unlisten')}),
    'window.requestAnimationFrame': run => (run(), 1), 'argument.isCollapsed': collapsed, './queries-ldd77hNk.js#a': 7}});
  const cases = [{}, {sidebar: 'closed'}, {narrow: false}, {enabled: false}, {extension: true}, {pathname: '/u/7/experimental/v2/channels/main'}, {pathname: '/u/7/experimental/v20'}, {pathname: '/u/7/projects/p1'}, {pathname: '/u/7/settings'}, {pathname: '/u/7/tasks'}, {sidebar: 'closed', focused: false}, {collapsed: false}];
  await parityOf(WEB_LAYOUT, {minimum: 40, props: [{}, {accountId: 7, children: 'Page'}, {visible: true}],
    scenes: [...cases.map(options => world => base(world, options)), world => ({...base(world), state: [4]})]});
  const {world, supplied, ours} = await bothSides(WEB_LAYOUT);
  const settle = async (side, account) => {
    const calls = [];
    const imports = {'./queries-ldd77hNk.js#a': 7, './error-tracking-B1YG2RRM.js#h': {invalidate: async () => { calls.push(['invalidate']); }}, './queries-ldd77hNk.js#i': async () => { if (!account) throw new Error('offline'); return account; }};
    const heap = stateHeap([3]);
    world.render(side.__pair_AccountSettled, {accountId: 7, children: 'Page'}, {imports, state: heap.values, onSetState: heap.onSetState, liveEffects: true});
    await new Promise(resolve => setImmediate(resolve));
    return {calls, settled: heap.values[0]};
  };
  for (const account of [{browserProfile: 'p', accountId: 7}, {browserProfile: 'p', accountId: 8}, {browserProfile: null, accountId: 8}, null]) assert.equal(JSON.stringify(await settle(ours, account)), JSON.stringify(await settle(supplied, account)));
  same((await settle(ours, {browserProfile: 'p', accountId: 8})).calls, [['invalidate']]);
  same((await settle(ours, null)).calls, [['invalidate']]);
  same((await settle(ours, {browserProfile: 'p', accountId: 7})).calls, []);
});

const COMMUNICATION = 'assets/communication-xjhkYtDb.js';
const communicationValue = {enabled: true, beforeSending: 'auto', apps: {gmail: true, imessage: true, slack: false, linkedin: true, x: true, discord: false, telegram: true, whatsapp: true}, watchReplies: {enabled: true, duration: '7d'}, matchTone: {enabled: true, customInstructions: 'Short, no emoji.'}, identities: {agentPhone: {enabled: false, number: ''}, agentMail: {enabled: false, address: '', forwardReplies: true}}};
const communicationImports = (world, {value = communicationValue, pending = false, granted = true, mac = true, setUp = async () => true, calls = []} = {}) => ({
  './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#nr': {data: value ?? undefined}, './full-disk-access-BmnWkbG2.js#r': {isGranted: granted, isMac: mac, setUp},
  './use-update-settings-ahXnGzre.js#t': () => ({isPending: pending, mutate: input => { calls.push(input); }})});

test('Settings › Communications renders and saves like the supplied page', async () => {
  const scenes = [{}, {value: null}, {value: {...communicationValue, enabled: false, watchReplies: {enabled: false, duration: '3d'}, matchTone: {enabled: false, customInstructions: ''}}}, {granted: false}, {mac: false, granted: false}, {pending: true}, {value: {...communicationValue, apps: {...communicationValue.apps, imessage: false}}, granted: false}];
  await parityOf(COMMUNICATION, {minimum: 40, props: [{}, {value: communicationValue, disabled: false, onChange: () => {}, title: 'Detected Apps', description: 'Turn on'}, {value: communicationValue, disabled: true, onChange: () => {}, title: 'Apps'}],
    scenes: scenes.flatMap(options => [undefined, 'Longer instructions '].map(typed => world => ({imports: communicationImports(world, options), state: [typed], event: {target: {value: 'New'}}, args: ['3d']})))});
  const {world, supplied, ours} = await bothSides(COMMUNICATION);
  // Each onValueChange and onCheckedChange fires with the scene's value; the saves show what each builds.
  const saves = (side, value, options) => {
    const calls = [];
    world.render(side.__pair_CommunicationSettings, {}, {imports: communicationImports(world, {calls, ...options}), args: [value]});
    return calls.map(call => ({key: call.key, ...call.value}));
  };
  for (const value of ['ask', 'auto', '24h', '3d', '7d', 'until-off', 'never', true, false]) same(saves(ours, value), JSON.parse(JSON.stringify(saves(supplied, value))));
  same(saves(ours, 'ask').every(value => value.key === 'communication'), true);
  same(saves(ours, 'ask').some(value => value.beforeSending === 'ask'), true);
  same(saves(ours, 'never').every(value => value.beforeSending === 'auto' && value.watchReplies.duration === '7d'), true);
  same(saves(ours, 'until-off').some(value => value.watchReplies.duration === 'until-off'), true);
  const defaults = (side, options) => { let value; world.render(() => (value = side.__pair_useCommunication(), null), {}, {imports: communicationImports(world, {value: null, ...options})}); return value.value; };
  same(defaults(ours), JSON.parse(JSON.stringify(defaults(supplied))));
  same([defaults(ours).enabled, defaults(ours).beforeSending, defaults(ours).watchReplies, defaults(ours).identities.agentMail.forwardReplies], [false, 'ask', {enabled: false, duration: '3d'}, true]);

  const toggle = async (side, id, options, value = communicationValue) => {
    const changes = [];
    const tree = world.render(side.__pair_DetectedApps, {disabled: false, value, onChange: next => { changes.push(next.apps[id]); }}, {imports: communicationImports(world, options), event: {}});
    await new Promise(resolve => setImmediate(resolve));
    return {changes, needs: JSON.stringify(tree).includes('Need to connect')};
  };
  for (const [id, options, value] of [['imessage', {granted: false}], ['imessage', {granted: false, setUp: async () => false}], ['imessage', {granted: false}, {...communicationValue, apps: {...communicationValue.apps, imessage: false}}], ['imessage', {}], ['imessage', {granted: false, mac: false}]])
    same(await toggle(ours, id, options, value), JSON.parse(JSON.stringify(await toggle(supplied, id, options, value))));
  const instructions = (side, typed, saved) => {
    const changes = [];
    world.render(side.__pair_CustomInstructions, {disabled: false, value: {...communicationValue, matchTone: {enabled: true, customInstructions: saved}}, onChange: next => { changes.push(next.matchTone.customInstructions); }}, {state: [typed], event: {target: {value: 'x'}}});
    return changes;
  };
  same(instructions(ours, '  Keep it brief  ', 'old'), ['Keep it brief']);
  same(instructions(ours, ' old ', 'old'), []);
  same(instructions(supplied, '  Keep it brief  ', 'old'), ['Keep it brief']);
});

const RECOVERY = 'assets/recovery-DY2UC0Rx.js';
const recoveryWords = 'apple bread cider dough eagle fable grape honey ivory jolly koala lemon'.split(' ');
const recoveryImports = (world, {calls = [], parse = async text => ({phrase: text.toLowerCase(), entropyB64: 'ZW50cm9weQ=='}), recover = async input => { calls.push(['recover', input]); }, fields = recoveryWords.map(value => ({value})), submitting = false, errors = {}} = {}) => {
  const values = {recoveryWords: fields};
  const form = {setValue: (name, value, options) => { calls.push(['setValue', name, value, options]); values[name] = value; }, getValues: name => values[name], register: name => ({name}), formState: {isSubmitting: submitting, errors}, control: 'control', handleSubmit: (valid, invalid) => async () => { calls.push(['handleSubmit']); return invalid && !values.recoveryWords.every(field => field.value) ? invalid() : valid({recoveryWords: values.recoveryWords}); }};
  return {
    './tag-icon-DeMC7uIN.js#p': form, './tag-icon-DeMC7uIN.js#f': () => form, './tag-icon-DeMC7uIN.js#m': fields, './strip-markdown-DRcmtuJc.js#er': () => ({mutateAsync: recover}),
    './recovery-key-CPOQuYx2.js#a': parse, './queries-ldd77hNk.js#m.query': async () => ({accountId: 7}), './queries-ldd77hNk.js#t': () => calls.push(['clearKeyState']), './queries-ldd77hNk.js#m.invalidateQueries': filter => (calls.push(['invalidate', String(filter[STUB_PATH]).replace(/\(.*/, '')]), filter),
    './dist-LyKrHgST.js#n.error': (title, options) => { calls.push(['toast.error', title, options?.description]); }, './dist-LyKrHgST.js#n.success': title => { calls.push(['toast.success', title]); },
    './error-content-CCom8r6s.js#t': async (failure, fallback) => ({title: fallback, description: failure.message}), './queries-ldd77hNk.js#i': async () => ({accountId: 7}), './Match-OymXmaXz.js#o': () => target => { calls.push(['navigate', target]); },
  };
};

test('the recovery key page normalizes words and recovers like the supplied one', async () => {
  const imports = recoveryImports;
  const paste = text => ({clipboardData: {getData: () => text}, preventDefault: () => {}, currentTarget: {files: [{text: async () => text}], value: 'x'}});
  await parityOf(RECOVERY, {minimum: 12, props: [{}, {onRecoveryKeyVerified: () => {}}],
    scenes: [world => ({imports: imports(world), event: paste('one')}), world => ({imports: imports(world, {submitting: true, fields: []}), event: paste('')}), world => ({imports: imports(world, {errors: {recoveryWords: {}}, fields: [{value: ''}]})}), world => ({imports: imports(world, {errors: {recoveryWords: {}}})})]});
  const {world, supplied, ours} = await bothSides(RECOVERY);
  for (const side of [ours, supplied]) {
    same(side.__pair_normalizeWord('  Ápple-1 '), 'pple');
    same(side.__pair_splitWords('  One\ntwo\t 3 Three! '), ['one', 'two', 'three']);
    same(side.__pair_toWordFields(['Apple']).map(field => field.value), ['apple', ...Array(11).fill('')]);
    same(side.__pair_toWordFields(recoveryWords).length, 12);
    same(side.__pair_joinWords([{value: ' Apple'}, {value: '12'}, {value: 'Bread'}]), 'apple bread');
    same(side.__pair_recoverySchema !== undefined, true);
  }
  const form = async (side, event, options) => {
    const calls = [];
    const scene = {imports: imports(world, {calls, ...options}), event};
    world.render(side.__pair_RecoveryKeyForm, {onRecoveryKeyVerified: () => calls.push(['verified'])}, scene);
    await new Promise(resolve => setImmediate(resolve));
    return JSON.stringify([calls, event.currentTarget.value]);
  };
  const phrase = recoveryWords.join(' ');
  for (const [event, options] of [[paste(phrase), {}], [paste('single'), {}], [paste('   '), {}], [paste('a b c'), {parse: async () => { throw new Error('Not a key'); }}], [paste(phrase), {recover: async () => { throw new Error('Wrong key'); }}], [paste('A b ' + phrase), {parse: async () => { throw new Error('Not a key'); }}], [paste(phrase), {fields: [{value: ''}]}]])
    assert.equal(await form(ours, event, options), await form(supplied, event, options));
  const calls = JSON.parse(await form(ours, paste(phrase), {}))[0];
  const filled = calls.find(([name]) => name === 'setValue');
  same(filled[2].map(field => field.value), recoveryWords);
  same(filled[3], {shouldDirty: true, shouldTouch: true, shouldValidate: true});
  same(calls.find(([name]) => name === 'recover')[1], {accountId: 7, recoveryEntropyB64: 'ZW50cm9weQ=='});
  same(calls.filter(([name]) => name === 'invalidate').slice(0, 3).map(([, query]) => query.replace(/.*#h\.|\.queryFilter$/g, '')), ['accounts.get', 'accounts.auth.me', 'accounts.auth.syncKeyStatus']);
  same(JSON.parse(await form(ours, paste(phrase), {}))[1], '');
  assert.ok(calls.some(([name]) => name === 'verified'));
  const wrong = JSON.parse(await form(ours, paste(phrase), {recover: async () => { throw new Error('Wrong key'); }}))[0];
  assert.ok(wrong.some(([name, title, description]) => name === 'toast.error' && title === 'Could not verify your recovery key.' && description === 'Wrong key'));
  assert.ok(!wrong.some(([name]) => name === 'verified'));
  const partial = JSON.parse(await form(ours, paste('a b c'), {parse: async () => { throw new Error('Not a key'); }}))[0];
  same(partial.filter(([name]) => name === 'setValue').flatMap(([, , value]) => value.map(field => field.value)).slice(0, 4), ['a', 'b', 'c', 'dough']);
  const verified = [];
  world.render(ours.component, {}, {imports: {...imports(world, {calls: verified})}});
  await new Promise(resolve => setImmediate(resolve));
  same(verified.filter(([name]) => name === 'toast.success' || name === 'navigate'), [['toast.success', 'Encrypted browser data recovered.'], ['navigate', {to: '/u/$userId/settings/account', params: {userId: '7'}, replace: true}]]);
});

const IMPORT_PROGRESS = 'assets/progress-CS-jrVXz.js';
const importImports = (world, {calls = [], pending = {sourceId: 'chrome', sourceName: 'Chrome', dataKinds: ['history', 'cookies']}, run, updates = []} = {}) => ({
  './extension-main-Dz1-AsCT.js#E.useSearch': {browser: 'chrome'}, './extension-main-Dz1-AsCT.js#N': pending, './extension-main-Dz1-AsCT.js#D.get': id => `${id} (known)`, './extension-main-Dz1-AsCT.js#I': value => { calls.push(['setPending', value]); },
  './extension-main-Dz1-AsCT.js#M': () => { calls.push(['clearPending']); }, './extension-main-Dz1-AsCT.js#L': run ?? (async (input, options) => { calls.push(['run', input.sourceId]); for (const update of updates) options.onProgress(update); }),
  './Match-OymXmaXz.js#o': () => target => { calls.push(['navigate', target]); }, 'window.setTimeout': (fn, delay) => { calls.push(['timer', delay]); fn(); return 5; }, 'window.clearTimeout': id => { calls.push(['clearTimer', id]); },
});

test('the onboarding import shows its progress like the supplied page', async () => {
  const progressStates = [null, {state: 'running', currentDataKind: 'bookmarks'}, {state: 'running', currentDataKind: 'paymentCards'}, {state: 'running', currentDataKind: 'spaces'}, {state: 'running', currentDataKind: 'unknown-kind'}, {state: 'failed', errorMessage: 'Locked'}, {state: 'failed'}, {state: 'cancelled'}, {state: 'succeeded'}, {state: 'succeeded', skippedDataKinds: ['cookies'], skippedMessage: 'Quit Chrome and retry.'}, {state: 'succeeded', skippedDataKinds: ['cookies']}];
  await parityOf(IMPORT_PROGRESS, {minimum: 60, props: [{}, {browser: 'comet', error: null, progress: {state: 'running'}, attempt: 1, onError: () => {}, onProgress: () => {}}, {browser: 'chatgpt-atlas'}, {browser: 'helium'}, {browser: 'firefox'}, ...progressStates.map(progress => ({progress, error: null})), {error: 'Disk full', progress: null}],
    scenes: [...progressStates.map(progress => world => ({imports: importImports(world), state: [undefined, null, false, progress], args: [false]})), world => ({imports: importImports(world), state: [2, 'Disk full', false, null]}), world => ({imports: importImports(world), state: [2, 'Disk full', true, null]}), world => ({imports: importImports(world, {pending: {sourceId: 'edge', sourceName: 'Edge'}})})]});
  const {world, supplied, ours} = await bothSides(IMPORT_PROGRESS);
  const run = async (side, options, chrome) => {
    const calls = [];
    const errors = [];
    const seen = [];
    world.render(side.__pair_ImportRunner, {attempt: 0, browser: 'chrome', onError: value => errors.push(value), onProgress: value => seen.push(value.state)}, {imports: importImports(world, {calls, ...options}), chrome});
    await new Promise(resolve => setImmediate(resolve));
    return {calls, errors, seen};
  };
  const done = {state: 'succeeded'};
  const cases = [[{updates: [{state: 'running'}, done, done]}], [{updates: [{state: 'succeeded', skippedDataKinds: ['cookies']}]}], [{pending: null}], [{pending: {sourceId: 'edge'}}], [{run: async () => { throw new Error('No access'); }}], [{}, {auxBrowserImport: undefined}]];
  for (const [options, chrome] of cases) same(await run(ours, options, chrome), JSON.parse(JSON.stringify(await run(supplied, options, chrome))));
  // The render above has already torn its effect down, so nothing moves on; running it live does.
  const live = async (side, options) => {
    const calls = [];
    world.render(side.__pair_ImportRunner, {attempt: 0, browser: 'chrome', onError: () => {}, onProgress: () => {}}, {imports: importImports(world, {calls, ...options}), liveEffects: true});
    await new Promise(resolve => setImmediate(resolve));
    return calls;
  };
  for (const options of [{updates: [done, done]}, {updates: [{state: 'succeeded', skippedDataKinds: ['cookies']}]}, {pending: null}]) same(await live(ours, options), JSON.parse(JSON.stringify(await live(supplied, options))));
  same(await live(ours, {updates: [done, done]}), [['run', 'chrome'], ['clearPending'], ['timer', 800], ['navigate', {to: '/onboarding/import-password', replace: true}]]);
  same(await live(ours, {updates: [{state: 'succeeded', skippedDataKinds: ['cookies']}]}), [['run', 'chrome'], ['clearPending']]);
  same(await live(ours, {pending: null}), [['navigate', {to: '/onboarding/import-browser', replace: true}]]);
  same((await run(ours, {}, {auxBrowserImport: undefined})).errors, ['Browser import is unavailable in this version of Aux.']);
  same((await run(ours, {run: async () => { throw new Error('No access'); }})).errors, []);
  const cycle = (side, last) => {
    const timers = [];
    const heap = stateHeap([last]);
    world.render(side.__pair_CyclingStatus, {}, {timers, state: heap.values, onSetState: heap.onSetState, liveEffects: true});
    timers[0][0]();
    return [timers[0][1], heap.values[0]];
  };
  same(cycle(ours, 3), [6000, 0]);
  same(cycle(supplied, 3), [6000, 0]);
  const retried = [];
  world.render(ours.component, {}, {imports: importImports(world, {calls: retried}), state: [0, null, false, {state: 'succeeded', skippedDataKinds: ['cookies']}]});
  same(retried.filter(([name]) => name === 'setPending')[0], ['setPending', {sourceId: 'chrome', sourceName: 'Chrome', dataKinds: ['cookies']}]);
});

test('the app layout redirects accounts and pings the bridge like the supplied one', async () => {
  const chunk = 'assets/route-Dh145hWk.js';
  const scene = (world, {pathname = '/u/3/tasks', accountId = 7, loading = false, calls = [], chrome} = {}) => ({chrome, imports: {'./useRouterState-vMU34Fpy.js#t': ({select}) => select({isLoading: loading}), './strip-markdown-DRcmtuJc.js#mr': {pathname, href: `${pathname}?tab=1`}, './strip-markdown-DRcmtuJc.js#nr': {data: {accountId}},
    './Match-OymXmaXz.js#o': () => target => { calls.push(['navigate', target]); }, './error-tracking-B1YG2RRM.js#c': (href, id) => `${href}#${id}`, 'chrome.runtime.sendMessage': (message, done) => { calls.push(['send', message]); done(); }, 'window.setInterval': (fn, delay) => { calls.push(['interval', delay]); return 3; }, 'window.clearInterval': id => { calls.push(['clearInterval', id]); }}});
  await parityOf(chunk, {minimum: 12, props: [{}], scenes: [world => scene(world), world => scene(world, {pathname: '/u/7/tasks'}), world => scene(world, {pathname: '/settings'}), world => scene(world, {accountId: undefined}), world => scene(world, {loading: true}), world => scene(world, {chrome: {runtime: {id: undefined}}})]});
  const {world, supplied, ours} = await bothSides(chunk);
  const redirect = (side, options) => { const calls = []; world.render(side.__pair_AccountRedirect, {}, scene(world, {calls, ...options})); return calls; };
  for (const options of [{}, {pathname: '/u/7'}, {pathname: '/u/7/x'}, {pathname: '/u/70'}, {pathname: '/u/3abc'}, {pathname: '/u/abc'}, {accountId: undefined}, {loading: true}]) same(redirect(ours, options), JSON.parse(JSON.stringify(redirect(supplied, options))));
  same(redirect(ours, {}), [['navigate', {href: '/u/3/tasks?tab=1#7', replace: true}]]);
  same(redirect(ours, {pathname: '/u/7/x'}), []);
  same(redirect(ours, {pathname: '/u/70'}), [['navigate', {href: '/u/70?tab=1#7', replace: true}]]);
  const bridge = side => { const calls = []; world.render(side.__pair_ExtensionBridgeKeepAlive, {}, {...scene(world, {calls}), liveEffects: true}); return calls; };
  same(bridge(ours), JSON.parse(JSON.stringify(bridge(supplied))));
  same(bridge(ours), [['send', {type: 'extension-bridge:ensure'}], ['interval', 5000]]);
  let refetch;
  world.render(ours.__pair_AccountRedirect, {}, {imports: {...scene(world).imports, './strip-markdown-DRcmtuJc.js#nr': options => (refetch = options.refetchInterval, {data: {}})}});
  same([refetch({state: {data: {reconnecting: true}}}), refetch({state: {data: {}}})], [5000, false]);
});

test('the sign out dialog signs out and updates a profile like the supplied one', async () => {
  const chunk = 'assets/-utils-B_lbplVm.js';
  const imports = (world, {calls = [], failing = false, error, pending = false} = {}) => ({'./strip-markdown-DRcmtuJc.js#Ht': {capture: name => { calls.push(['capture', name]); }}, './strip-markdown-DRcmtuJc.js#er': () => ({isPending: pending, error, mutateAsync: async input => { calls.push(['signOut', input]); if (failing) throw new Error('Offline'); }}),
    './strip-markdown-DRcmtuJc.js#pr': {invalidateQueries: filter => { calls.push(['invalidate', String(filter[STUB_PATH]).replace(/.*#_\(\)\.|\.queryFilter.*/g, '')]); }}, './queries-ldd77hNk.js#t': () => { calls.push(['clearAccountState']); }, 'chrome.storage.local.remove': async key => { calls.push(['remove', key]); }});
  await parityOf(chunk, {minimum: 8, props: [{accountId: 7, open: true, onOpenChange: () => {}}, {accountId: 7, open: false}], scenes: [world => ({imports: imports(world)}), world => ({imports: imports(world, {pending: true, error: {message: 'Offline'}})})]});
  const {world, supplied, ours} = await bothSides(chunk);
  const signOut = async (side, options) => {
    const calls = [];
    world.render(side.n, {accountId: 7, open: true, onOpenChange: value => { if (value === false) calls.push(['open', value]); }}, {imports: imports(world, {calls, ...options})});
    await new Promise(resolve => setImmediate(resolve));
    return calls;
  };
  same(await signOut(ours, {}), JSON.parse(JSON.stringify(await signOut(supplied, {}))));
  same(await signOut(ours, {}), [['signOut', {accountId: 7}], ['remove', 'aux.profileMetadataSync.v2'], ['capture', 'logout'], ['open', false], ['clearAccountState'], ['invalidate', 'accounts.get'], ['invalidate', 'accounts.auth.devices'], ['invalidate', 'accounts.auth.me']]);
  same(await signOut(ours, {failing: true}), [['signOut', {accountId: 7}]]);
  const profile = {email: 'a@example.com', name: 'Ada', profileUrl: 'https://p', userId: 'u1', theme: 'dark'};
  const account = {email: 'a@example.com', name: 'Ada', profileUrl: 'https://p', userId: 'u1'};
  assert.equal(ours.t(profile, account), profile);
  assert.equal(supplied.t(profile, account), profile);
  for (const change of [{email: 'b@example.com'}, {name: 'Bea'}, {profileUrl: null}, {userId: 'u2'}]) same(ours.t(profile, {...account, ...change}), JSON.parse(JSON.stringify(supplied.t(profile, {...account, ...change}))));
  same(ours.t(profile, {...account, profileUrl: null}), {email: 'a@example.com', name: 'Ada', userId: 'u1', theme: 'dark'});
});

test('the tab preview and channel icon behave like the supplied ones', async () => {
  const chunk = 'assets/channel-platform-icon-Cjhdli_M.js';
  const runtime = {runtime: {getURL: path => `https://player.test/${path}`}};
  const scene = (world, {visible = true, active = true, state} = {}) => ({state, chrome: runtime, imports: {'./strip-markdown-DRcmtuJc.js#en': active, './search-params-DwFnFOOw.js#n': params => new URLSearchParams(params).toString(), 'new IntersectionObserver': (update, options) => ({observe: () => update([{isIntersecting: visible, intersectionRatio: 0.1}], options), disconnect: () => {}})}, window: {IntersectionObserver: true, location: {origin: 'chrome-extension://self'}}});
  await parityOf(chunk, {minimum: 24, props: [{targetId: 't1', title: 'Docs', className: 'probe', onTopToneChange: () => {}}, {targetId: 't2', enabled: false}, {platform: 'slack', channelName: 'launch'}, {platform: 'telegram', showTooltip: false, className: 'probe'}, {platform: 'discord'}, {platform: 'email'}, {ratio: 1.6, className: 'x'}],
    scenes: [world => scene(world), world => scene(world, {visible: false}), world => scene(world, {active: false}), world => scene(world, {state: [{id: 'el'}, true]})]});
  const {world, supplied, ours} = await bothSides(chunk, {'./extension-ids-BPbqTbQi.js#t': 'ext-id'});
  const frame = (side, active) => {
    const tones = [];
    const sent = [];
    const listeners = [];
    const contentWindow = {postMessage: (value, target) => sent.push([value, target])};
    const base = scene(world, {active});
    const heap = stateHeap(['element', false, true]);
    world.render(side.n, {targetId: 't1', onTopToneChange: tone => tones.push(tone)}, {...base, state: heap.values, onSetState: heap.onSetState, liveEffects: true, domRef: {contentWindow}, imports: {...base.imports, 'window.addEventListener': (name, handler) => listeners.push(handler)}});
    const source = {source: contentWindow, origin: 'https://player.test'};
    tones.length = sent.length = 0;
    for (const event of [{...source, data: {type: 'aux.tab-preview.ready'}}, {source: contentWindow, origin: 'https://evil.example', data: {type: 'aux.tab-preview.ready'}}, {source: {}, ...{origin: source.origin}, data: {type: 'aux.tab-preview.render-state', visible: true, topTone: 'dark'}},
      {...source, data: {type: 'aux.tab-preview.render-state', visible: true, topTone: 'dark'}}, {...source, data: {type: 'aux.tab-preview.render-state', visible: 'yes', topTone: 'sepia'}}, {...source, data: {type: 'other'}}]) listeners[0](event);
    return {tones, sent, painted: heap.values[1]};
  };
  same(frame(ours, true), {tones: ['dark', null], sent: [[{type: 'aux.tab-preview.visibility', live: true}, '*']], painted: false});
  same(frame(ours, false).sent, [[{type: 'aux.tab-preview.visibility', live: false}, '*']]);
  same(frame(ours, true), JSON.parse(JSON.stringify(frame(supplied, true))));
  const url = (side, chrome) => { world.enter({chrome, imports: scene(world).imports}); return side.__pair_previewUrl({targetId: 't1'}); };
  assert.equal(url(ours, runtime), 'https://player.test/tab-preview-player.html?data=targetId=t1');
  assert.equal(url(ours, {runtime: {}}), 'chrome-extension://ext-id/tab-preview-player.html?data=targetId=t1');
  assert.equal(url(supplied, {runtime: {}}), 'chrome-extension://ext-id/tab-preview-player.html?data=targetId=t1');
  assert.equal(ours.__pair_PREVIEW_RATIO, 1.6);
});

test('subagent colors stay stable and distinct like the supplied ones', async () => {
  const chunk = 'assets/subagent-icon-B78zcDX8.js';
  await parityOf(chunk, {minimum: 16, props: [{}, {color: 'violet', className: 'probe', style: {top: 1}}, {color: 'teal'}, {from: 'a', id: 'g', to: 'b'}], scenes: [{}, {imports: {'React.useId': ':r9:'}}]});
  const {supplied, ours} = await bothSides(chunk);
  const ids = ['session-a', 'session-b', 'sess-3', 'x', 'y', 'z', 'q', 'w', 'e', 'r', 't'];
  const colors = side => [...side.n(ids.map(sessionId => ({sessionId}))).entries()];
  same(colors(ours), JSON.parse(JSON.stringify(colors(supplied))));
  const firstEight = colors(ours).slice(0, 8).map(([, color]) => color);
  assert.equal(new Set(firstEight).size, 8);
  same(colors(ours).length, ids.length);
  for (const id of ids) assert.equal(ours.__pair_colorIndex(id), supplied.__pair_colorIndex(id));
  assert.equal(ours.__pair_colorIndex('ab'), (97 * 31 + 98) % 8);
  same(ours.__pair_pickColor('ab', new Set(['violet'])), supplied.__pair_pickColor('ab', new Set(['violet'])));
  same(ours.__pair_pickColor('ab', new Set(ours.__pair_SUBAGENT_COLORS)), ours.__pair_SUBAGENT_COLORS[(97 * 31 + 98) % 8]);
});

test('the capture anchor and selection handle talk to the page like the supplied ones', async () => {
  const anchor = 'assets/capture-anchor-CI2S0j85.js';
  const handle = 'assets/selection-handle-Df1vMUiF.js';
  const route = textOf(anchor).match(/import\{l as u,s as p\}from"(\.\/translate-status-[\w-]+\.js)"/)[1];
  const messaging = textOf(anchor).match(/from"(\.\/use-messaging-[\w-]+\.js)"/)[1];
  const scene = (world, search, {calls = [], incoming} = {}) => ({event: {key: 'Escape', button: 0, preventDefault: world.stub('spy:prevent'), stopPropagation: world.stub('spy:stop')}, imports: {[`${route}#s.useSearch`]: search, [`${route}#r.useSearch`]: search, [`${route}#l`]: (frameId, type) => ({ref: {current: null}, sendMessage: message => { calls.push(['send', frameId, type, message]); }}),
    [`${messaging}#n`]: handler => { for (const message of incoming ?? []) handler(message); }, [`${messaging}#r`]: () => message => { calls.push(['click', message]); }, 'window.addEventListener': (name, handler) => { calls.push(['listen', name]); handler({key: 'Escape'}); handler({key: 'a'}); }}});
  await parityOf(anchor, {minimum: 12, props: [{}, {placement: 'top-left', initialPlacement: 'top-left'}, {placement: 'bottom-right', initialPlacement: 'bottom-right'}], scenes: [world => scene(world, {frameId: 'f1', placement: 'top-left'}), world => scene(world, {frameId: 'f2', placement: 'bottom-right'}, {incoming: [{type: 'CAPTURE_ANCHOR_SYNC', placement: 'bottom-right'}, {type: 'OTHER'}, null, 'text']})]});
  await parityOf(handle, {minimum: 8, props: [{}, {handlePlacement: 'top-left'}, {handlePlacement: 'bottom-right'}], scenes: [world => scene(world, {frameId: 'f1', handlePlacement: 'top-left'}), world => scene(world, {frameId: 'f1', handlePlacement: 'bottom-right'}, {incoming: [{type: 'SELECTION_HANDLE_SYNC', handlePlacement: 'top-left', requestKey: 'k1'}, {type: 'OTHER'}, null]})]});
  const {world, supplied, ours} = await bothSides(anchor);
  same(['x', {type: 'CAPTURE_ANCHOR_SYNC'}, {type: 'y'}, null, {}].map(value => ours.__pair_isSyncMessage(value)), [false, true, false, false, false]);
  same(['x', {type: 'CAPTURE_ANCHOR_SYNC'}, null].map(value => supplied.__pair_isSyncMessage(value)), [false, true, false]);
  const run = side => { const calls = []; world.render(side.component, {}, {...scene(world, {frameId: 'f1', placement: 'top-left'}, {calls})}); return calls.filter(([name, , , message]) => name === 'send' && typeof message?.type === 'string'); };
  same(run(ours), [['send', 'f1', 'CAPTURE_ANCHOR_READY', {type: 'CAPTURE_ANCHOR_ESCAPE'}]]);
  same(run(ours), JSON.parse(JSON.stringify(run(supplied))));
  const pair = await bothSides(handle);
  const sync = side => { const calls = []; const heap = stateHeap(['top-left', null]); const base = scene(pair.world, {frameId: 'f1', handlePlacement: 'top-left'}, {calls, incoming: [{type: 'SELECTION_HANDLE_SYNC', handlePlacement: 'bottom-right', requestKey: 'k1'}, {type: 'OTHER'}]}); pair.world.render(side.component, {}, {...base, state: heap.values, onSetState: heap.onSetState}); return {heap: heap.values, sent: calls.filter(([name, , , message]) => name === 'send' && typeof message?.type === 'string').map(([, , , message]) => message)}; };
  same(sync(pair.ours), {heap: ['bottom-right', 'k1'], sent: [{type: 'SELECTION_HANDLE_SYNCED', requestKey: null, handlePlacement: 'top-left'}]});
  same(sync(pair.ours), JSON.parse(JSON.stringify(sync(pair.supplied))));
  const click = (side, button) => { const calls = []; pair.world.render(side.__pair_SelectionHandle, {handlePlacement: 'top-left'}, {...scene(pair.world, {}, {calls}), event: {button, preventDefault: () => {}, stopPropagation: () => {}}}); return calls.filter(([name]) => name === 'click'); };
  same(click(pair.ours, 0), [['click', {type: 'SELECTION_HANDLE_CLICK'}]]);
  same(click(pair.ours, 2), []);
  same(click(pair.supplied, 2), []);
});

test('file artifacts, radio cards, Empty and the window icon render like the supplied ones', async () => {
  const files = 'assets/files-artifact-DHQjjsEB.js';
  const previews = {'./strip-markdown-DRcmtuJc.js#dt': type => type === 'image', './strip-markdown-DRcmtuJc.js#ht': path => (path.endsWith('.png') ? 'image' : 'other'), './strip-markdown-DRcmtuJc.js#ct': path => path.split('/').at(-1)};
  const artifacts = [{source: 'tool', path: 'out/chart.png'}, {source: 'tool', path: 'out/data.csv'}, {source: 'draft', kind: 'draft-block', path: 'draft.png'}, {source: 'tool', kind: 'url'}, {source: 'tool', path: ''}];
  await parityOf(files, {minimum: 6, scenes: [{imports: previews}], props: [{path: 'out/chart.png', sessionId: 's1'}, {artifacts, className: 'probe', sessionId: 's1'}, {artifacts: artifacts.slice(1), sessionId: 's1'}, {artifacts: []}]});
  const {world, ours, supplied} = await bothSides(files);
  world.enter({imports: previews});
  same(artifacts.map(artifact => ours.__pair_hasPreview(artifact)), [true, false, false, false, false]);
  same(artifacts.map(artifact => supplied.__pair_hasPreview(artifact)), [true, false, false, false, false]);
  await parityOf('assets/radio-card-group-DhMlHjFD.js', {minimum: 4, scenes: [{}], props: [{className: 'probe', value: 'a', children: 'x'}, {id: 'plan-a', title: 'Plan', description: 'Details', value: 'a', disabled: true}, {id: 'plan-b', title: 'Plan', value: 'b'}, {description: ''}]});
  await parityOf('assets/empty-D6YJzOw0.js', {minimum: 10, scenes: [{}], props: [{className: 'probe', id: 'e'}, {variant: 'icon', children: 'x'}, {variant: 'default', className: 'y'}]});
  await parityOf('assets/window-cursor-ClCFre_a.js', {minimum: 3, scenes: [{}], props: [{}, {size: 16, ariaHidden: false, className: 'probe'}, {'aria-label': 'Window'}]});
});

test('the error page and reporting behave like the supplied ones', async () => {
  const chunk = 'assets/error-tracking-B1YG2RRM.js';
  await parityOf(chunk, {minimum: 20, props: [{}, {className: 'probe', size: 16, ariaHidden: false}, {error: new Error('Boom'), reset: () => {}, data: {}}, {error: undefined}], scenes: [{imports: {'./queries-ldd77hNk.js#L': false, './queries-ldd77hNk.js#m.getQueryCache': {getAll: () => []}}, window: {location: {href: 'https://aux.test/u/7', hash: '', origin: 'https://aux.test'}}, context: {subscribe: () => () => {}, state: {location: {href: 'a'}, matches: []}, reset: () => {}, clearReset: () => {}}, state: [false]},
    {imports: {'./queries-ldd77hNk.js#L': true, './queries-ldd77hNk.js#m.getQueryCache': {getAll: () => []}}, window: {location: {href: 'https://aux.test/u/7', hash: '', origin: 'https://aux.test'}}, context: {subscribe: () => () => {}, state: {location: {href: 'a'}, matches: []}, reset: () => {}, clearReset: () => {}}, state: [false]}]});
  const {world, supplied, ours} = await bothSides(chunk);
  const both = (name, ...args) => { const value = ours[name](...args); same(value, JSON.parse(JSON.stringify(supplied[name](...args)) ?? 'null') ?? undefined); return value; };
  for (const [path, search, wanted] of [['/u/7/tasks', '', 7], ['/u/0', '', 0], ['/u/7x', '?accountId=3', 3], ['/settings', '?accountId=12', 12], ['/settings', '?accountId=0', 0], ['/settings', '?accountId=-1', null], ['/settings', '?accountId=1.5', null], ['/settings', '?accountId=%20', null], [undefined, undefined, null]]) same(ours.s(path, search), wanted);
  same(both('s', '/u/9', '?accountId=3'), 9);
  same(both('c', '/u/7/tasks?x=1', 12), '/u/12/tasks?x=1');
  same(both('c', '/u/abc#top', 12), '/u/12#top');
  same(both('c', '/settings', 12), '/settings');
  same(ours.__pair_describeError(new TypeError('Bad')).name, 'TypeError');
  same([ours.__pair_describeError('text'), supplied.__pair_describeError(3)], [{name: 'Error', message: 'text'}, {name: 'UnhandledRejection', message: '3'}]);
  const seen = {};
  same([ours.__pair_alreadyReported(seen), ours.__pair_alreadyReported(seen), ours.__pair_alreadyReported('text'), ours.__pair_alreadyReported(null)], [false, true, false, false]);
  const capture = async (side, {href = 'https://aux.test/u/7/tasks', hash = '', incognito, error = new Error('Boom'), reject} = {}) => {
    const sent = [];
    world.enter({chrome: {extension: {inIncognitoContext: incognito}}, window: {location: {href, hash, origin: 'https://aux.test'}}, imports: {'./queries-ldd77hNk.js#g.analytics.captureException.mutate': async input => { if (reject) throw new Error('down'); sent.push({...input, stack: undefined}); }, './queries-ldd77hNk.js#i': async () => ({accountId: 7, browserProfile: 'p'})}});
    await side.i(error, {source: 'window_error', handled: false, properties: {extra: 1}});
    return sent;
  };
  for (const options of [{}, {href: 'https://aux.test/settings'}, {hash: '#top'}, {hash: '#/u/9/tasks?accountId=2'}, {incognito: true}, {reject: true}, {error: 'text'}]) same(await capture(ours, options), JSON.parse(JSON.stringify(await capture(supplied, options))));
  const [report] = await capture(ours);
  same(report, {accountId: 7, name: 'Error', message: 'Boom', properties: {source: 'window_error', handled: false, route: '/u/7/tasks', surface: 'agent-manager', extra: 1}});
  same((await capture(ours, {hash: '#/u/9/tasks'}))[0].properties.route, '/u/9/tasks');
  same((await capture(ours, {hash: '#top'}))[0].properties.route, '/u/7/tasks');
  const reports = async (side, trigger) => {
    const sent = [];
    const scene = {window: {location: {href: 'https://aux.test/u/7', hash: '', origin: 'https://aux.test'}}, imports: {'./queries-ldd77hNk.js#g.analytics.captureException.mutate': async input => { sent.push(input.properties); }}};
    world.enter(scene);
    trigger(scene);
    await new Promise(resolve => setImmediate(resolve));
    return sent;
  };
  same(await reports(ours, scene => world.render(ours.n, {error: new Error('Route')}, scene)), [{source: 'router_boundary', handled: true, route: '/u/7', surface: 'agent-manager'}]);
  same(await reports(ours, () => ours.t.prototype.componentDidCatch.call({props: {surface: 'panel'}}, new Error('React'))), [{source: 'react_boundary', handled: true, route: '/u/7', surface: 'panel'}]);
  same(await capture(ours, {incognito: true}), []);
  const twice = new Error('Twice');
  same([(await capture(ours, {error: twice})).length, (await capture(ours, {error: twice})).length], [1, 0]);

  const copied = [];
  const copy = async (side, content) => {
    copied.length = 0;
    let hook;
    world.render(() => (hook = side.u(), null), {}, {imports: {'navigator.clipboard.writeText': async text => { copied.push(text); }, 'navigator.clipboard.write': async ([item]) => { copied.push(item['text/plain'].type); }, 'new ClipboardItem': items => items}});
    const result = await hook.copy(content);
    return [result, ...copied];
  };
  same(await copy(ours, 'text'), [true, 'text']);
  same(await copy(ours, {'text/plain': 'x'}), [true, 'text/plain']);
  same(await copy(supplied, 'text'), [true, 'text']);

  // Recovery: a query that failed, retried with growing delays, three times, then the error page.
  const recover = async side => {
    const timers = [];
    const calls = [];
    const error = new Error('Offline');
    const query = {queryKey: ['tasks'], options: {queryFn: 'tasks'}, state: {error}};
    const router = {state: {location: {href: 'https://aux.test/u/7'}, matches: [{status: 'error', error}]}, subscribe: name => (calls.push(['subscribe', name]), () => calls.push(['unsubscribe'])), invalidate: () => calls.push(['invalidate']), reset: () => calls.push(['reset']), clearReset: () => calls.push(['clearReset'])};
    const heap = stateHeap([false, undefined]);
    const imports = {'./queries-ldd77hNk.js#L': true, './queries-ldd77hNk.js#m.getQueryCache': {getAll: () => [query, {state: {error: new Error('Other')}}]}, './queries-ldd77hNk.js#m.getQueryState': () => ({status: 'error'}), './queries-ldd77hNk.js#m.fetchQuery': async options => { calls.push(['fetch', options.queryKey, options.staleTime]); }, 'window.setTimeout': (fn, delay) => (timers.push([fn, delay]), timers.length), 'window.clearTimeout': () => {}};
    world.render(side.r, {error}, {context: router, imports, state: heap.values, onSetState: heap.onSetState, liveEffects: true});
    const delays = [];
    for (let round = 0; round < 6; round++) {
      await new Promise(resolve => setImmediate(resolve));
      const next = timers.shift();
      if (!next) break;
      delays.push(next[1]);
      await next[0]();
    }
    await new Promise(resolve => setImmediate(resolve));
    return {delays, calls, gaveUp: heap.values[0]};
  };
  const [mine, theirs] = [await recover(ours), await recover(supplied)];
  same(mine, JSON.parse(JSON.stringify(theirs)));
  same([mine.delays, mine.gaveUp], [[5000, 10000, 15000, 20000, 25000, 30000], true]);
  same(mine.calls.filter(([name]) => name === 'fetch'), Array(6).fill(['fetch', ['tasks'], 0]));
  const listeners = [];
  const sent = [];
  world.enter({window: {location: {href: 'https://aux.test/u/7', hash: '', origin: 'https://aux.test'}}, imports: {'window.addEventListener': (name, handler) => listeners.push([name, handler]), './queries-ldd77hNk.js#g.analytics.captureException.mutate': async input => { sent.push([input.name, input.message, input.properties]); }}});
  ours.o('side-panel');
  ours.o('other');
  same(listeners.map(([name]) => name), ['error', 'unhandledrejection']);
  listeners[0][1]({message: 'Script error'});
  listeners[1][1]({reason: new Error('Rejected')});
  await new Promise(resolve => setImmediate(resolve));
  same(sent, [['Error', 'Script error', {source: 'window_error', handled: false, route: '/u/7', surface: 'other'}], ['Error', 'Rejected', {source: 'unhandled_rejection', handled: false, route: '/u/7', surface: 'other'}]]);
});

// The task lists' shared helpers: every status a row shows and both kinds of menu.
const TASK_LIST = 'assets/utils-DCBm67_n.js';
test('the task menus and chat rows render and act like the supplied ones', async () => {
  const sessions = [
    {id: 's1', title: 'Plan', status: 'running', pinned: true, projectId: 'p1', trigger: {type: 'user', source: 'remote'}, routine: {scheduleLabel: 'Daily'}},
    {id: 's2', title: null, status: 'errored', unread: true, trigger: {type: 'standalone-routine'}},
    {id: 's3', title: 'Ask', status: 'suspended', suspension: {kind: 'approval'}},
    {id: 's4', title: 'Confirm', status: 'suspended', suspension: {kind: 'action-confirmation', request: {message: 'Send it?'}}},
    {id: 's5', title: 'Question', status: 'suspended', suspension: {kind: 'ask-user-question', request: {questions: [{question: 'Which one?'}]}}},
    {id: 's6', title: 'Idle', status: 'idle', unread: true},
    {id: 's7', title: 'Waiting', status: 'suspended'},
    {id: 's8', title: 'Stopped', status: 'aborted'},
    {id: 's9', title: 'New kind', status: 'other'},
  ];
  const projects = Array.from({length: 7}, (_, index) => ({id: `p${index}`, name: `Project ${index}`, color: 'blue', icon: 'folder'}));
  const move = (overrides = {}) => ({canMove: true, isMoveLocked: false, projects, isLoading: false, handleMove: () => {}, isPending: false, ...overrides});
  const scene = (session, overrides, extra = {}) => ({context: {session}, imports: {'./strip-markdown-DRcmtuJc.js#f': move(overrides), './strip-markdown-DRcmtuJc.js#$t': session.id === 's1',
    './strip-markdown-DRcmtuJc.js#tt': session.id === 's2' ? {message: 'Boom'} : null, './strip-markdown-DRcmtuJc.js#$': () => ({title: 'It failed'}), './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}}, ...extra});
  await parityOf(TASK_LIST, {minimum: 600, props: sessions.flatMap(session => ['context', 'dropdown'].flatMap(variant => [
    {session, variant, place: 'list', open: true, children: 'Row', className: 'probe', datetime: '2026-10-01T12:00:00Z', onStartNewProject: () => {}},
    {session, variant, place: 'list', open: false, size: 'sm', orientation: 'vertical', children: 'Preview', render: 'div'},
  ])), scenes: [...sessions.map(session => scene(session)), scene(sessions[1], {isLoading: true}, {state: ['nothing matches', false, 'Plan', true]}), scene(sessions[0], {projects: []}, {state: [true, true, '  ', false]}),
    scene(sessions[2], {canMove: false}), scene(sessions[5], {}, {state: ['project 3', false, 'Renamed', false]})]});

  const {world, supplied, ours} = await bothSides(TASK_LIST);
  for (const [text, length] of [['short', 9], ['a longer title', 8]]) same(ours.n(text, length), supplied.n(text, length));
  same([1, 2048, 5 * 1048576, 3 * 1073741824].map(ours.t), [1, 2048, 5 * 1048576, 3 * 1073741824].map(size => supplied.t(size)));
  same(ours.x('word'), 'Word');
  same([ours.__pair_statusSlot(sessions[1]), ours.__pair_statusSlot(sessions[2]), ours.__pair_statusSlot(sessions[0]), ours.__pair_statusSlot(sessions[5]) ?? null], ['error', 'waiting', 'running', null]);
  world.enter({imports: {'./strip-markdown-DRcmtuJc.js#tt': {message: 'Boom'}, './strip-markdown-DRcmtuJc.js#$': () => ({title: 'It failed'})}});
  for (const session of sessions) assert.equal(ours.__pair_statusDetail(session), supplied.__pair_statusDetail(session));

  // The zoom indicator: a message draws it once, sized against the page's zoom.
  const zoom = async side => {
    const listeners = [];
    const replies = [];
    const elements = {style: {setProperty: (name, value) => replies.push([name, value])}, dataset: {}, isConnected: true};
    const scene = {chrome: {runtime: {onMessage: {addListener: listener => listeners.push(listener)}}}, window: {location: {protocol: 'https:'}},
      imports: {'document.createElement(div).attachShadow': () => ({getElementById: () => elements})}};
    world.enter(scene);
    side.b();
    world.enter(scene);
    listeners[0]({type: 'current-zoom-indicator:show', zoomFactor: 1.25}, {}, reply => replies.push(reply));
    listeners[0]({type: 'other', zoomFactor: 2}, {}, reply => replies.push(reply));
    return {count: listeners.length, replies, text: elements.textContent, visible: elements.dataset.visible};
  };
  const shown = await zoom(ours);
  assert.deepEqual(plain(shown), plain(await zoom(supplied)));
  same([shown.text, shown.visible], ['125%', 'true']);
});

test('the setup dialog kit renders like the supplied one, and pastes a phrase into the word inputs', async () => {
  const phrase = Array.from({length: 12}, (_, index) => `word${index}`);
  await parityOf('assets/components-BlZz2O2v.js', {minimum: 80, props: [
    {className: 'probe', children: 'Body', open: true, title: 'Set up', description: 'Connect it', icon: 'icon', badge: 'New', phrase, value: Array(12).fill(''), wordIndexes: [2, 5, 8], autoFocus: true,
      required: true, size: 'lg', startAddon: 'Key', image: 'a.png', label: 'One', status: 'Connected', selected: true, defaultOpen: true},
    {title: 'Set up', children: 'Body', phrase: phrase.slice(0, 7), value: ['alpha', '', ''], disabled: true, label: 'Two', done: true, open: false},
  ], scenes: [{}, {state: [true, ['providers']]}, {event: {target: {value: 'one two three'}, clipboardData: {getData: () => 'one two three'}, preventDefault: () => {}}},
    {event: {target: {value: 'Ab1'}, clipboardData: {getData: () => 'single'}, preventDefault: () => {}}}]});
  const {world, supplied, ours} = await bothSides('assets/components-BlZz2O2v.js');
  const parse = async text => { if (text.includes('key')) throw new Error('No'); return {phrase: 'parsed one two'}; };
  for (const pasted of ['one two three', 'a key with four words']) {
    world.enter({imports: {'./recovery-key-CPOQuYx2.js#a': parse}});
    const mine = await ours.h(['', '', '', ''], 1, pasted);
    world.enter({imports: {'./recovery-key-CPOQuYx2.js#a': parse}});
    same(mine, JSON.parse(JSON.stringify(await supplied.h(['', '', '', ''], 1, pasted))));
  }
  assert.ok(!/vault/i.test(readRoute('setup-dialog.js').replace(/\/\*[\s\S]*?\*\//g, '')));
  assert.deepEqual(['t', 'r'].filter(name => name in ours), []);
});

/** A value from the VM's realm, as plain data. */
const plain = value => JSON.parse(JSON.stringify(value) ?? 'null');
const MODEL_CATEGORIES = 'assets/model-categories-BLKcCTS7.js';
test('the model categories pick the same models as the supplied ones', async () => {
  const catalog = [
    {provider: 'anthropic', id: 'claude-opus-5-5', availableThinkingLevels: ['off', 'medium', 'high'], supportsFastMode: true, supportsVision: true},
    {provider: 'anthropic', id: 'claude-haiku-5-5', availableThinkingLevels: ['off'], supportsFastMode: false},
    {provider: 'anthropic', id: 'claude-fable-5-1', availableThinkingLevels: ['high'], supportsFastMode: false, supportsVision: true},
    {provider: 'openai', id: 'gpt-6.1-sol', availableThinkingLevels: ['low', 'high'], supportsFastMode: true},
    {provider: 'openai', id: 'router/gpt-6-luna', availableThinkingLevels: ['off'], supportsFastMode: false},
    {provider: 'google', id: 'gemini-4-argon-preview', availableThinkingLevels: ['off'], supportsFastMode: false, supportsVision: true},
    {provider: 'xai', id: 'grok-4.7', availableThinkingLevels: ['off'], supportsFastMode: false},
  ];
  const setting = (provider, modelId, extra = {}) => ({provider, modelId, thinkingLevel: 'high', fastMode: true, ...extra});
  const presets = {fast: [setting('anthropic', 'claude-haiku-5-5')], standard: [setting('openai', 'gpt-6-sol'), setting('anthropic', 'claude-sonnet-5')],
    deep: [setting('anthropic', 'claude-fable-5'), setting('openai', 'gpt-5.5')], visual: [setting('google', 'gemini-3-pro')]};
  const version = (a, b) => a.localeCompare(b, undefined, {numeric: true});
  const {world, supplied, ours} = await bothSides(MODEL_CATEGORIES, {'./types-BEI3ap6-.js#n': presets});
  const imports = {'./strip-markdown-DRcmtuJc.js#At': (provider, models) => models, './strip-markdown-DRcmtuJc.js#jt': version,
    './types-BEI3ap6-.js#r': (level, levels) => (levels.includes(level) ? level : levels.at(-1))};
  world.enter({imports});
  const both = (name, ...args) => { const value = ours[`__pair_${name}`](...args); assert.deepEqual(plain(value), plain(supplied[`__pair_${name}`](...args))); return value; };
  for (const id of ['claude-opus-4-8', 'claude-haiku-4-5-20251001', 'claude-opus-5-5-20261001', 'gpt-5.6-terra', 'gpt-6-luna', 'gemini-3.1-pro-preview', 'gemini-3-flash', 'grok-4.7', 'grok-4.7-fast', 'gpt-6-nova', 'x/y', 'gpt']) {
    both('currentHostedModel', id); both('modelVendor', id); both('modelSlug', id); both('modelFamily', id);
  }
  same(both('modelFamily', 'claude-opus-5-5'), {family: 'claude-opus', version: '5.5'});
  same(both('modelFamily', 'gemini-4-argon-preview'), {family: 'gemini-pro', version: '4'});
  for (const saved of [setting('aux', 'claude-opus-5'), setting('anthropic', 'claude-sonnet-4-6'), setting('openai', 'gpt-6.1-sol'), setting('openai', 'gone'), setting('claude-code', 'claude-sonnet-4-6')]) {
    both('migrateModel', saved); both('fallbackModel', saved, catalog); both('fallbackModel', saved, []);
    for (const category of ['fast', 'standard', 'deep', 'visual']) {
      both('presetsFor', category, catalog);
      both('categoryModel', category, undefined, saved, catalog);
      both('categoryModel', category, setting('anthropic', 'claude-opus-5-5'), saved, catalog);
      for (const family of ['same', 'other']) both('categoryModel', category, undefined, saved, catalog, {selection: {family, relativeTo: {modelId: 'gpt-6.1-sol'}}});
    }
  }
  same(both('categoryModel', 'fast', undefined, setting('openai', 'gone'), catalog).modelId, 'claude-haiku-5-5');
  same(both('categoryModel', 'deep', undefined, setting('anthropic', 'claude-opus-5-5'), catalog).modelId, 'claude-fable-5-1');
  const models = {modelCatalog: {models: catalog}};
  const data = {data: {defaultModel: setting('anthropic', 'claude-opus-5-5'), modelCategories: {fast: setting('openai', 'gpt-6.1-sol')}}};
  await parityOf(MODEL_CATEGORIES, {minimum: 30, props: [{value: setting('openai', 'gpt-6.1-sol'), modelCatalog: {models: catalog}, onChange: () => {}, info: {title: 'Fast', description: 'Quick'}},
    {value: null, fallbackValue: setting('anthropic', 'claude-opus-5-5'), modelCatalog: {models: catalog}, allowDefaultValue: true, disabled: true, onChange: () => {}, label: 'Label', info: {title: 'Visual', requireVision: true}},
    {value: null, modelCatalog: {models: catalog}, onChange: () => {}, iconProvider: 'openai', disabled: false}],
  scenes: [{imports: {...imports, './strip-markdown-DRcmtuJc.js#nr': data, './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './provider-context-A_wu0fRN.js#n': models}, renderProps: {children: 'Pick', id: 'x'}}]});
});

const DRAFTS = 'assets/draft-artifacts-registry-CZ58X0Cu.js';
test('drafts, session images and the carousel render like the supplied ones', async () => {
  const attendee = {name: 'Ada Lovelace', email: 'ada@example.com', avatarUrl: 'a.png'};
  const data = {to: ['a@example.com'], cc: ['b@example.com'], bcc: ['c@example.com'], subject: 'Hello', body: '안녕 from https://example.com/x', draft: 'Draft text', title: 'Lunch', time: 'Noon', location: 'Cafe', reminder: '10 min',
    description: 'Catch up', color: '#123456', attendees: [attendee, {name: 'Bo', email: 'bo@example.com'}, 'junk'], channel: 'general', workspace: 'Team', profiles: [{name: 'Ada', avatarUrl: 'a.png'}],
    messages: [{name: 'Ada', message: 'Hi', timestamp: '2026-10-01T12:00:00Z', sender: 'them'}, {name: 'Me', message: 'Hey', timestamp: 'nope', sender: 'me'}, {sender: 'me', message: '둘'}],
    attachments: ['shot.png', {name: 'r.pdf', path: 'out/r.pdf'}, {attachmentPath: 'a.heic'}, 3, ''], authorName: 'Ada', avatarUrl: 'a.png', handle: 'ada', headline: 'Engineer', timestamp: 'Today',
    stats: {likes: '1', replies: '2', reposts: '3', views: '4', comments: '5', reactions: '6'}, profile: {authorName: 'Bo', handle: 'bo', headline: 'Writer'}};
  const languages = ['calendar-draft', 'calendar-event-draft', 'gmail-draft', 'imessage-draft', 'linkedin-draft', 'linkedin-message-draft', 'linkedin-post', 'linkedin-post-draft', 'slack-draft', 'slack-message-draft', 'tweet', 'tweet-draft', 'x-post', 'x-post-draft', 'x-tweet', 'x-tweet-draft', 'unknown'];
  const image = {src: 'https://api.aux.test/f.png', alt: 'A', caption: 'One'};
  await parityOf(DRAFTS, {minimum: 300, props: [
    ...languages.flatMap(language => [{language, data, sessionId: 's1', compact: true, className: 'probe'}, {language, data: {}}, {language, code: JSON.stringify(data)}, {language, code: ' '}, {language, code: '{"body"'}]),
    {images: [image, {...image, src: 'b.png', alt: 'B'}], sessionId: 's1', src: 'b.png', alt: 'B', caption: 'Two', className: 'object-cover', path: 'out/shot.png', sender: 'me', title: 'Shot', orientation: 'vertical'},
    {images: [image], sessionId: 's1', src: 'https://api.aux.test/f.png', previewSrc: 'p.png', fullSrc: 'f.png', path: 'out/a.pdf', preferThumbnail: true, sender: 'them', orientation: 'horizontal', variant: 'ghost'},
    {images: [], src: '', path: 'a.txt', previewUrl: 'p.png', onClick: () => {}, onKeyDown: () => {}, setApi: () => {}},
  ], scenes: [{imports: {'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './context-q_vohNW8.js#r': {currentSession: {id: 's9'}}}},
    {imports: {'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, './strip-markdown-DRcmtuJc.js#dt': true},
      context: {carouselRef: 'ref', orientation: 'vertical', scrollPrev: () => {}, scrollNext: () => {}, canScrollPrev: true, canScrollNext: false},
      state: ['open', {sourceHeight: 1, sourceLeft: 2, sourceTop: 3, sourceWidth: 4, targetHeight: 5, targetLeft: 6, targetTop: 7, targetWidth: 8}, 'p.png', true],
      event: {key: 'Enter', preventDefault: () => {}, stopPropagation: () => {}, defaultPrevented: false, dataTransfer: {setData: () => {}}}},
    {context: {carouselRef: 'ref', orientation: 'horizontal'}, state: ['closing-morph', {sourceHeight: 1, sourceLeft: 2, sourceTop: 3, sourceWidth: 4, targetHeight: 5, targetLeft: 6, targetTop: 7, targetWidth: 8}, null, false], event: {key: 'Escape', defaultPrevented: true}},
    {state: ['closing-fade', null, null, false], domRef: {isConnected: false, naturalWidth: 100, naturalHeight: 50, getBoundingClientRect: () => ({top: 1, left: 2, width: 3, height: 4, right: 5, bottom: 6})}}]});

  const {world, supplied, ours} = await bothSides(DRAFTS, {'./queries-ldd77hNk.js#S': 'https://api.aux.test'});
  const both = (name, ...args) => { const value = ours[name](...args); assert.deepEqual(plain(value), plain(supplied[name](...args))); return value; };
  for (const language of languages) { both('i', language); both('__pair_draftText', language, data); both('__pair_parseDraft', JSON.stringify({type: 'x', data: {[language]: 1}})); }
  same(both('c', {type: 'gmail', data: {subject: 'x'}}), {subject: 'x'});
  same(both('__pair_emailText', {to: ['a', 'b'], cc: ['c'], bcc: [], subject: 'Hi', body: 'Text'}), 'To: a, b\nCc: c\nSubject: Hi\n\nText');
  same(both('__pair_tweetLength', 'hi 안 😀 https://example.com/x'), both('__pair_tweetLength', 'hi 안 😀 https://example.com/x'));
  for (const reader of ['emailData', 'iMessageData', 'linkedInMessageData', 'slackData', 'calendarData', 'tweetData', 'tweetProfile', 'linkedInPostData', 'linkedInProfile']) { both(`__pair_${reader}`, data); both(`__pair_${reader}`, {}); }
  // Finished draft fences become text, at the fence's indent; an open fence stays.
  const fence = (lang, json) => `\`\`\`${lang}\n${json}\n\`\`\``;
  const markdown = `Intro\n\n- ${fence('gmail-draft', '{"subject":"Hi","body":"Text\\nMore","to":["a"]}')}\n\nThen\n${fence('slack-draft', '{"data":{"draft":"Yo"},"type":"x"}')}\n${fence('tweet', '{"body":"no"}')}\n${fence('imessage-draft', 'broken')}\n`;
  const offset = text => markdown.indexOf(text);
  const nodes = [['gmail-draft', 8], ['slack-draft', 0], ['tweet', 0], ['imessage-draft', 0]].map(([lang]) => { const at = offset(`\`\`\`${lang}`), end = markdown.indexOf('\n```', at) + 4; return {type: 'code', lang, value: markdown.slice(markdown.indexOf('\n', at) + 1, end - 4), position: {start: {offset: at}, end: {offset: end}}}; });
  world.enter({imports: {'./lib-CwyXkVLI.js#t': () => ({type: 'root', children: [{type: 'list', children: [nodes[0]]}, ...nodes.slice(1)]})}});
  const text = both('s', markdown);
  assert.ok(text.includes('To: a') && text.includes('  Text\n  More'.replace('  ', '')) && text.includes('Yo') && text.includes('```imessage-draft'), text);
});

// Owner decisions (2026-10-30), which the parity tests can't speak to.
test('New Tab has no task cards, whatever chats exist', () => {
  assert.ok(!readRoute('new-tab-island.js').includes('tasks-CtF0WxoJ'));
  const helper = readRoute('onboarding-helper.js');
  for (const gone of ['Show suggestions', 'localStorage', 'taskCount']) assert.ok(!helper.includes(gone), gone);
});

test('onboarding reaches local users, and each finished profile only once', () => {
  const guard = EDITS['assets/-types-Wy38XkNB.js'][0].replace;
  const K = done => new Function('localStorage', `${guard};return K`)({getItem: () => (done ? '1' : null)});
  assert.equal(K(false)({mode: 'local'}), '/onboarding/glance');
  assert.equal(K(false)({mode: 'cloud', onboardingCompletedAt: null}), '/onboarding/glance');
  assert.equal(K(false)({mode: 'cloud', onboardingCompletedAt: 5}), null);
  assert.equal(K(true)({mode: 'local'}), null);
  assert.equal(K(false)(null), null);
});

