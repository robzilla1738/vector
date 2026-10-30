// Host-only: each Aux-owned route against the staged chunk it replaces (see parity.mjs), staged as
// the release hands it over: after the package edits and every earlier transform.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {GLOBALS_CSS, ROUTES, TOKEN_CHANGES, integrateRoutes, integrateStyles, readRoute, renamedBindings} from './integration.mjs';
import {assertFreeNames, assertParity, createWorld, evaluatePair} from './parity.mjs';
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
const composerImports = (world, {session = {}, options = {}, settings = {}, mode = 'default', store = fastNotices, pending} = {}) => ({
  './context-q_vohNW8.js#n': {currentSession: {id: 's1', status: 'interrupted', incognito: false, projectId: 'p1', suspension: {id: 'q1'},
    model: {provider: 'anthropic', modelId: 'opus', thinkingLevel: 'high', fastMode: true}, runtimeConfig: {proactiveMode: false},
    queuedMessages, steeringMessages: [{role: 'user', content: 'Steer', timestamp: 4}], ...session},
  updateModel: world.stub('spy:updateModel'), updateRuntimeConfig: world.stub('spy:updateRuntimeConfig'), updateMode: world.stub('spy:updateMode')},
  './model-select-BvZsM1Kl.js#l': {isOpen: true, isThinkingOpen: true, proactiveMode: false, selectableProviders: providers,
    getModels: id => models.filter(model => model.provider === id), onOpenChange: world.stub('spy:modelOpen'), onThinkingOpenChange: world.stub('spy:thinkingOpen'),
    onChange: world.stub('spy:modelChange'), ...options},
  './model-select-BvZsM1Kl.js#s': levels => levels ?? [],
  './use-agent-settings-DiedG0R1.js#n': {availableModels: models, subscriptionPlan: 'pro', isLoading: false, hasExternalSubscription: false, ...settings},
  './use-agent-settings-DiedG0R1.js#a': ({provider, modelId}) => `${provider}/${modelId}`,
  './provider-Cw0zhujt.js#x': (_, select) => select(store),
  '*.safeParse': details => ({data: details}),
  './permission-approval-D-GTf91U.js#b': {mode},
  './permission-approval-D-GTf91U.js#x': {steer: world.stub('spy:steer'), continueConversation: world.stub('spy:continue'), sendMessage: world.stub('spy:send')},
  './permission-approval-D-GTf91U.js#f': {isStreaming: false},
  './permission-approval-D-GTf91U.js#p': {hasPreservedDraft: true, getText: () => ' edited ', insertText: world.stub('spy:insertText')},
  './permission-approval-D-GTf91U.js#l': {disabled: false, handleDirectories: world.stub('spy:dirs'), handleFiles: world.stub('spy:files')},
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
  pending: false, onCancel: world.stub('spy:cancelEdit'), visible: true, showInMenu: true});
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
];
const composerProps = [
  {model: {provider: 'anthropic', modelId: 'opus', thinkingLevel: 'high', fastMode: true}, variant: 'mini-popup', showThinkingLevel: true, item: queueItems[0],
    disabled: false, reorderable: true, editing: true, dragging: false, queue: queueItems, mode: 'default', inactive: false, label: false, showIncognito: true},
  {model: {provider: 'openai', modelId: 'gpt', thinkingLevel: 'low', fastMode: false}, variant: 'main', showThinkingLevel: true, item: queueItems[1],
    disabled: true, reorderable: false, editing: false, dragging: true, queue: [], mode: 'ask-user-question', inactive: true, persistDefaultOnChange: false},
  {model: {provider: 'google', modelId: 'gem', thinkingLevel: 'low', fastMode: false}, variant: 'mini-popup', showThinkingLevel: false, mode: 'approval',
    value: {provider: 'anthropic', modelId: 'haiku', thinkingLevel: 'low'}, proactiveMode: true, children: 'slot'},
];

test('every Aux-owned route renders, runs its effects and handles events like the one it replaces', async () => {
  await assertParity({blocksByChunk: ROUTES, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 600, scenes: [...routeScenes, ...conversationScenes],
    props: conversationProps, renamed: renamedBindings});
});

// The composer under its data fixtures, so the model menu, the queue and the badges render with data.
test('the composer renders like the supplied one with models and a queue', async () => {
  await assertParity({blocksByChunk: {[COMPOSER]: ROUTES[COMPOSER]}, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 600,
    scenes: composerScenes, props: composerProps, renamed: renamedBindings, defaults: false});
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
      const selector = name.replace(/:/g, '\\:');
      assert.ok(css.includes(`.${selector}:hover`) || new RegExp(`\\.${selector.replace(/\\/g, '\\\\')}[{,[]`).test(css), `${file}: .${name} is not compiled`);
    }
    assert.ok(readRoute(file).includes(to) && !readRoute(file).includes(from), file);
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
