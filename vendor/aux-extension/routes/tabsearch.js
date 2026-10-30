/* Aux-owned source: the command bar (assets/tabsearch-3k_2hgil.js; the page tabsearch.html mounts
 * it): Cmd+T, Cmd+L, Cmd+K and Cmd+Shift+A all open it, in new-tab, navigate, commands or search
 * mode. The browser results (tabs, recently closed, chats, bookmarks, history, extensions) and the
 * component itself were minified; the Aux sections (navigation, commands, files, media, settings,
 * developer, productivity, ask, context actions) were already readable, from the browser-feature
 * integration and the polish edits, and keep their names.
 * Imports used here (the import statement above stays as supplied): browser-color-scheme re JSX
 * runtime, Y interop, ee React, X cn, te page setup, ne theme sync; client se react-dom/client;
 * queries oe fetch, H account id, auxFilesClient, auxFilesAccount; date me dayjs; scroll-area
 * ue backend URL, de ScrollArea; extension-page-url _; favicon R; avatar pe/fe/he Avatar parts;
 * empty we/be Empty parts; kbd ye; platform xe shortcut label; icons K arrow, ae chats, ie history,
 * ce search, V puzzle, le window. */
var jsxRuntime = re(),
  BookmarkIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M9.7002 17.3945C11.0801 16.4247 12.9199 16.4247 14.2998 17.3945L18 19.9951V6C18 4.89542 17.1046 4 16 4H8C6.89543 4 6 4.89543 6 6V19.9951L9.7002 17.3945ZM20 19.9951C19.9998 21.6146 18.1748 22.5623 16.8496 21.6309L13.1504 19.0303C12.4604 18.5453 11.5396 18.5453 10.8496 19.0303L7.15039 21.6309C5.8252 22.5623 4.00024 21.6146 4 19.9951V6C4 3.79087 5.79087 2 8 2H16C18.2092 2 20 3.79088 20 6V19.9951Z',
        fill: 'currentColor',
      }),
    }),
  ReactDOMClient = se(),
  React = Y(ee(), 1),
  DEFAULT_SECTION_SIZE = 2,
  SEARCH_LIMIT = 50,
  RECENTLY_CLOSED_LIMIT = 25,
  EXTENSION_PAGE_PREFIX = _(''); /** A trimmed title, else the fallback, else Untitled. */
function titleOr(title, fallback) {
  return title?.trim() || fallback || 'Untitled';
}
function relativeTime(time) {
  const moment = (0, me.default)(time);
  return moment.isValid() ? moment.fromNow() : void 0;
} /** A page URL the bar may show (not chrome:// or another extension). */
function isWebUrl(url) {
  return !!(url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://'));
}
function withoutScheme(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
function itemMatches(item, query) {
  const needle = query.toLowerCase();
  return [item.title, item.subtitle, item.url, item.searchText].some(text => text?.toLowerCase().includes(needle));
} /** An open tab as a result; this extension’s own pages are allowed. */
function tabItem(tab) {
  const url = tab.url ?? tab.pendingUrl ?? '';
  return typeof tab.id != 'number' || !(isWebUrl(url) || url.startsWith(EXTENSION_PAGE_PREFIX))
    ? null
    : {
        actionLabel: 'Switch to Tab',
        faviconUrl: tab.favIconUrl || R(url),
        id: `tab:${tab.id}`,
        kind: 'open-tab',
        tabId: tab.id,
        title: titleOr(tab.title, url),
        url,
      };
} /** A recently closed tab or window as a result. */
function recentlyClosedItem(entry, index) {
  const tab = entry.tab ?? entry.window?.tabs?.find(candidate => isWebUrl(candidate.url ?? candidate.pendingUrl)),
    url = tab?.url ?? tab?.pendingUrl ?? '',
    sessionId = tab?.sessionId ?? entry.window?.sessionId;
  return isWebUrl(url)
    ? {
        actionLabel: 'Reopen',
        faviconUrl: tab?.favIconUrl || R(url),
        id: `closed:${sessionId ?? url}:${index}`,
        kind: 'recently-closed',
        restoreSessionId: sessionId,
        timeLabel: relativeTime(entry.lastModified * 1e3),
        title: titleOr(tab?.title, url),
        url,
      }
    : null;
}
function recentChatItem(chat, accountId) {
  return {
    faviconUrl: void 0,
    id: `recent-chat:${chat.id}`,
    kind: 'chat',
    timeLabel: relativeTime(chat.updatedAt),
    title: titleOr(chat.title),
    url: _(`/u/${accountId}/tasks/${encodeURIComponent(chat.id)}`),
  };
}
function chatSearchItem(chat, accountId) {
  return {
    id: `chat:${chat.id}`,
    kind: 'chat',
    timeLabel: relativeTime(chat.updatedAt),
    title: titleOr(chat.title),
    url: _(`/u/${accountId}/tasks/${encodeURIComponent(chat.id)}`),
  };
}
function historyItem(entry) {
  if (!entry.url || !isWebUrl(entry.url)) return null;
  const url = entry.url;
  return {
    faviconUrl: R(url),
    id: `history:${entry.id}`,
    kind: 'history',
    subtitle: withoutScheme(url),
    timeLabel: entry.lastVisitTime ? relativeTime(entry.lastVisitTime) : void 0,
    title: titleOr(entry.title, url),
    url,
  };
}
function bookmarkItem(bookmark) {
  if (!bookmark.url || !isWebUrl(bookmark.url)) return null;
  const url = bookmark.url;
  return {
    faviconUrl: R(url),
    id: `bookmark:${bookmark.id}`,
    kind: 'bookmark',
    subtitle: withoutScheme(url),
    timeLabel: bookmark.dateAdded ? relativeTime(bookmark.dateAdded) : void 0,
    title: titleOr(bookmark.title, url),
    url,
  };
}
function isLaunchableExtension(extension) {
  return (
    extension.enabled &&
    extension.mayDisable &&
    extension.type !== 'theme' &&
    extension.type !== 'login_screen_extension' &&
    extension.id !== chrome.runtime.id
  );
}
function largestIcon(icons) {
  if (icons?.length) return [...icons].sort((a, b) => a.size - b.size).at(-1)?.url;
}
function extensionItem(extension) {
  return {
    actionLabel: 'Open',
    extensionId: extension.id,
    faviconUrl: largestIcon(extension.icons),
    id: `extension:${extension.id}`,
    isApp: extension.isApp,
    kind: 'extension',
    searchText: [extension.shortName, extension.description].filter(Boolean).join(' '),
    title: titleOr(extension.name),
  };
} /** GET an extension backend path for the account. */
async function fetchJson(path, accountId, params = {}, signal) {
  const url = ue(path, accountId);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const response = await oe(url, {signal});
  if (!response.ok) throw new Error(`Request failed: ${path}`);
  return await response.json();
}
async function loadOpenTabs() {
  return chrome.tabs?.query ? (await chrome.tabs.query({})).map(tabItem).filter(item => item !== null) : [];
}
async function loadRecentlyClosed() {
  return chrome.sessions?.getRecentlyClosed
    ? (await chrome.sessions.getRecentlyClosed({maxResults: RECENTLY_CLOSED_LIMIT}))
        .map(recentlyClosedItem)
        .filter(item => item !== null)
    : [];
}
async function loadRecentChats(signal) {
  const accountId = await H();
  return (await fetchJson('/session/for-chrome/recents', accountId, {}, signal)).map(chat =>
    recentChatItem(chat, accountId),
  );
}
async function searchChats(query, signal) {
  const accountId = await H();
  return (await fetchJson('/session/for-chrome/search', accountId, {q: query, limit: SEARCH_LIMIT}, signal)).map(chat =>
    chatSearchItem(chat, accountId),
  );
}
async function searchHistory(query) {
  return chrome.history?.search
    ? (await chrome.history.search({text: query, maxResults: SEARCH_LIMIT, startTime: 0}))
        .map(historyItem)
        .filter(item => item !== null)
    : [];
}
async function searchBookmarks(query) {
  return chrome.bookmarks?.search
    ? (await chrome.bookmarks.search(query)).map(bookmarkItem).filter(item => item !== null)
    : [];
}
async function loadExtensions() {
  return chrome.management?.getAll
    ? (await chrome.management.getAll())
        .filter(isLaunchableExtension)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(extensionItem)
    : [];
} /** The browser sections: extensions, open tabs, recently closed (one per URL), chats, bookmarks, history; two each until a query. */
function browserSections(sources, query) {
  const searching = query.trim().length > 0,
    limit = searching ? SEARCH_LIMIT : DEFAULT_SECTION_SIZE,
    openTabs = searching ? sources.openTabs.filter(item => itemMatches(item, query)) : sources.openTabs,
    recentlyClosed = (
      searching ? sources.recentlyClosed.filter(item => itemMatches(item, query)) : sources.recentlyClosed
    ).filter((item, index, all) => all.findIndex(other => other.url === item.url) === index);
  return [
    {
      id: 'extensions',
      title: 'Extensions',
      items: searching ? sources.extensions.filter(item => itemMatches(item, query)).slice(0, limit) : [],
    },
    {id: 'open-tabs', title: 'Open Tabs', items: openTabs.slice(0, limit)},
    {id: 'recently-closed', title: 'Recently Closed', items: recentlyClosed.slice(0, limit)},
    {
      id: 'chat',
      title: searching ? 'Chat' : 'Recent Chat',
      items: (searching ? sources.chatSearch : sources.recentChats).slice(0, limit),
    },
    {id: 'bookmarks', title: 'Bookmarks', items: searching ? sources.bookmarks.slice(0, limit) : []},
    {id: 'history', title: 'History', items: searching ? sources.history.slice(0, limit) : []},
  ].filter(section => section.items.length > 0);
}
function flattenSections(sections) {
  return sections.flatMap(section => section.items);
}
function closeWindow() {
  try {
    window.close();
  } catch {
    return;
  }
} /** Cmd/Ctrl+Shift+A closes the bar. */
function isCloseShortcut(event) {
  return event.key.toLowerCase() === 'a' && event.shiftKey && (event.metaKey || event.ctrlKey);
}
function navigationSections(context, query, sections) {
  if (!context?.success || typeof context.generation !== 'string') return sections;
  const text = query.trim();
  const result = [];
  if (text && context.mode !== 'tabs') {
    result.push({
      id: 'aux-navigation',
      title: 'Navigate',
      items: [
        {
          id: 'aux-navigate',
          kind: 'aux-navigate',
          title: text,
          subtitle:
            /^\S+$/.test(text) && /[.:/]|^localhost$/i.test(text)
              ? context.mode === 'navigate'
                ? 'Open in current tab'
                : 'Open in new tab'
              : 'Search the web',
          actionLabel: /^\S+$/.test(text) && /[.:/]|^localhost$/i.test(text) ? 'Open' : 'Search',
          text,
        },
      ],
    });
  }
  if (
    (context.mode === 'new-tab' || context.mode === 'commands') &&
    (!text || 'new blank tab'.includes(text.toLowerCase()))
  ) {
    result.push({
      id: 'aux-new-blank-tab',
      title: 'New tab',
      items: [
        {
          id: 'aux-new-blank-tab',
          kind: 'aux-new-blank-tab',
          title: 'New blank tab',
          subtitle: 'Open a new tab immediately',
          actionLabel: 'Open',
        },
      ],
    });
  }
  if (context.mode === 'commands') {
    const commands = (context.commands ?? [])
      .map(command => ({
        ...command,
        title: {34132: 'Split side by side', 34133: 'Split stacked'}[command.commandId] ?? command.title,
      }))
      .filter(
        command =>
          command.enabled && (!text || `${command.title} ${command.id}`.toLowerCase().includes(text.toLowerCase())),
      )
      .map(command => ({
        id: `aux-command:${command.id}`,
        kind: 'aux-command',
        title: command.title,
        subtitle: command.shortcut,
        commandId: command.commandId,
        actionLabel: 'Run',
      }));
    if (commands.length) result.unshift({id: 'aux-commands', title: 'Commands', items: commands});
  }
  const organization = context.organization;
  if (organization?.ownerGeneration && organization.revision) {
    const query = text.toLowerCase(),
      matches = value => !query || value.toLowerCase().includes(query);
    const logical = (organization.tabs ?? [])
      .filter(
        tab =>
          !(Number.isInteger(tab.nativeTabId) && tab.nativeTabId === context.activeTabId) &&
          matches(`${tab.title} ${tab.url}`),
      )
      .slice(0, 100)
      .map(tab => ({
        id: `aux-logical:${tab.id}`,
        kind: 'aux-logical-tab',
        logicalId: tab.id,
        title: tab.title || tab.url,
        subtitle: tab.url.startsWith('chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/') ? 'Aux' : tab.url,
        actionLabel: 'Switch',
      }));
    const spaces = (organization.spaces ?? [])
      .filter(space => matches(space.title))
      .sort((a, b) => Number(BigInt(a.order ?? 0) - BigInt(b.order ?? 0)))
      .slice(0, 100)
      .map(space => ({
        id: `aux-space:${space.id}`,
        kind: 'aux-space',
        spaceId: space.id,
        title: space.title,
        subtitle: space.id === organization.activeSpaceId ? 'Current Space' : 'Switch Space',
        actionLabel: 'Switch',
      }));
    if (logical.length) result.push({id: 'aux-logical-tabs', title: 'Tabs in this profile', items: logical});
    if (spaces.length && context.mode !== 'navigate') result.push({id: 'aux-spaces', title: 'Spaces', items: spaces});
    const represented = new Set((organization.tabs ?? []).map(tab => tab.nativeTabId).filter(Number.isInteger));
    const local = new Set(context.windowTabIds ?? []);
    sections = sections
      .map(section => ({
        ...section,
        items: section.items.filter(
          item => item.kind !== 'open-tab' || (local.has(item.tabId) && !represented.has(item.tabId)),
        ),
      }))
      .filter(section => section.items.length);
  } else if (Array.isArray(context.windowTabIds)) {
    const local = new Set(context.windowTabIds);
    sections = sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.kind !== 'open-tab' || local.has(item.tabId)),
      }))
      .filter(section => section.items.length);
  }
  return contextActionSections(context, query, askPaletteSections(context, query, [...result, ...sections]));
}
async function commitNavigation(api, context, item) {
  if (!context?.success || typeof context.generation !== 'string' || typeof api?.commitCommand !== 'function')
    throw Error('Command context is unavailable');
  const request = {generation: context.generation};
  if (item.kind === 'aux-logical-tab' || item.kind === 'aux-space') {
    const org = context.organization;
    if (!org?.ownerGeneration || !org.revision) throw Error('Organization context expired');
    Object.assign(request, {
      kind: item.kind === 'aux-space' ? 'select-space' : 'activate-logical-tab',
      id: item.kind === 'aux-space' ? item.spaceId : item.logicalId,
      organizationOwner: org.ownerGeneration,
      organizationRevision: org.revision,
    });
  } else if (item.kind === 'aux-command') Object.assign(request, {kind: 'command', commandId: item.commandId});
  else if (item.kind === 'aux-new-blank-tab') Object.assign(request, {kind: 'new-blank-tab'});
  else if (item.kind === 'open-tab') Object.assign(request, {kind: 'activate-tab', tabId: item.tabId});
  else Object.assign(request, {kind: 'navigate', text: item.text ?? item.url});
  const result = await api.commitCommand(request);
  if (!result?.success) throw Error(result?.error ?? 'Command was not completed');
  return result;
}
function productivitySections(context, receipt) {
  const proposal = context?.organizationProposal;
  if (context?.mode !== 'tidy' || !proposal) return null;
  if (receipt)
    return [
      {
        id: 'aux-tidy-result',
        title: receipt.undone ? 'Changes undone' : 'Tabs organized',
        items: receipt.undone
          ? [{id: 'aux-tidy-close', kind: 'aux-tidy-cancel', title: 'Done', actionLabel: 'Close'}]
          : [
              {id: 'aux-tidy-undo', kind: 'aux-tidy-undo', title: 'Undo organization', actionLabel: 'Undo'},
              {id: 'aux-tidy-close', kind: 'aux-tidy-cancel', title: 'Done', actionLabel: 'Close'},
            ],
      },
    ];
  return [
    {
      id: 'aux-tidy-actions',
      title: proposal.scope === 'selected-tabs' ? 'Review selected tab organization' : 'Review Space organization',
      items: [
        {
          id: 'aux-tidy-apply',
          kind: 'aux-tidy-apply',
          title: `Organize ${proposal.moves.length} tabs into ${proposal.createFolders.length} folders`,
          actionLabel: 'Apply',
        },
        {id: 'aux-tidy-cancel', kind: 'aux-tidy-cancel', title: 'Keep tabs as they are', actionLabel: 'Cancel'},
      ],
    },
    {
      id: 'aux-tidy-preview',
      title: 'Proposed moves',
      items: proposal.summaryRows.map(row => ({
        id: `aux-tidy:${row.id}`,
        kind: 'aux-tidy-preview',
        title: row.title,
        subtitle: row.folderTitle,
      })),
    },
  ];
}
async function commitProductivityAction(api, context, receipt, item) {
  if (item.kind === 'aux-tidy-preview') return {keepOpen: true};
  if (item.kind === 'aux-tidy-cancel') return {close: true};
  const proposal = context?.organizationProposal;
  if (!proposal || context.mode !== 'tidy') throw Error('Organization review expired.');
  if (item.kind === 'aux-tidy-apply') {
    // Never re-send renderer-owned moves. Native retains the reviewed proposal.
    const result = await api.applyOrganizationProposal({proposalId: proposal.proposalId});
    if (!result?.success) throw Error(result?.error ?? 'Organization was not applied.');
    return {receipt: result};
  }
  if (item.kind === 'aux-tidy-undo') {
    if (!receipt?.undoToken || typeof receipt.revision !== 'string') throw Error('Undo is unavailable.');
    const result = await api.undoOrganization({
      ownerGeneration: proposal.ownerGeneration,
      undoToken: receipt.undoToken,
      expectedRevision: receipt.revision,
      operationId: crypto.randomUUID(),
    });
    if (!result?.success) throw Error(result?.error ?? 'Organization could not be undone.');
    return {receipt: {...result, undone: true}};
  }
  throw Error('Unknown organization action');
}
function validDownloadStem(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length > 100 ||
    value !== value.trim() ||
    value.startsWith('.') ||
    /[\\/:\p{Cc}\p{Cf}]/u.test(value)
  )
    throw Error('Choose a filename without path separators or hidden control characters.');
  return value;
}
function createFileReviewGuard(cancel) {
  let epoch = 0,
    request = null;
  const stop = () => {
    const previous = request;
    request = null;
    if (previous)
      Promise.resolve()
        .then(() => cancel(previous))
        .catch(() => {});
  };
  return {
    begin() {
      stop();
      const current = ++epoch;
      const isCurrent = () => current === epoch;
      return {
        isCurrent,
        setRequest(value) {
          if (!isCurrent()) {
            if (value) throw Error('This file review changed.');
            return;
          }
          request = value;
        },
      };
    },
    invalidate() {
      ++epoch;
      stop();
    },
  };
}
function filesSections(context, state, query, sections) {
  if (!context?.success) return sections;
  const row = (kind, title, extra = {}) => ({id: kind, kind, title, ...extra});
  if (!state) {
    const q = query.trim().toLowerCase();
    return context.mode === 'commands' && (!q || 'recent files downloads'.includes(q))
      ? [
          {
            id: 'aux-file-entry',
            title: 'Files',
            items: [
              row('aux-files-open', 'Recent files', {
                subtitle: 'Downloads and files selected in this profile',
                actionLabel: 'Open',
              }),
            ],
          },
          ...sections,
        ]
      : sections;
  }
  if (state.view === 'list')
    return [
      {id: 'aux-file-actions', title: 'Recent files', items: [row('aux-files-back', 'Back to commands')]},
      {
        id: 'aux-files',
        title: 'Recent files',
        items: (state.files ?? [])
          .filter(file => file.name.toLowerCase().includes(query.toLowerCase()))
          .map(file => ({
            ...row('aux-file-select', file.name, {
              subtitle: file.available ? file.sourceHost : 'Moved or unavailable',
              actionLabel: file.source === 'chosen' ? 'Show' : 'Rename',
              file,
              generation: context.generation,
            }),
            id: `aux-file:${file.id}`,
          })),
      },
      ...(state.receipts ?? []).map(receipt => ({
        id: `receipt:${receipt.id}`,
        title: receipt.phase === 'complete' ? 'Recent rename' : 'Rename recovery',
        items: [
          receipt.phase === 'complete'
            ? row('aux-file-undo', `Undo ${receipt.filename}`, {receiptId: receipt.id, actionLabel: 'Undo'})
            : row('aux-file-note', receipt.filename, {
                subtitle:
                  receipt.phase === 'needs-review'
                    ? 'The file changed; review this download before renaming.'
                    : 'A previous rename needs recovery.',
              }),
        ],
      })),
    ];
  if (state.view === 'renamed')
    return [
      {
        id: 'aux-file-done',
        title: state.undone ? 'Name restored' : `Renamed to ${state.filename}`,
        items: [
          ...(state.undone
            ? []
            : [row('aux-file-undo', 'Undo rename', {receiptId: state.receiptId, actionLabel: 'Undo'})]),
          row('aux-files-open', 'Back to recent files'),
        ],
      },
    ];
  const prepared = state.prepared;
  return [
    {
      id: 'aux-file-review',
      title: `Rename ${prepared.filename}`,
      items: [
        row('aux-file-apply', `Use ${query}${prepared.extension ?? ''}`, {actionLabel: 'Apply'}),
        ...(Number.isInteger(prepared.accountId)
          ? [
              row('aux-file-suggest', 'Suggest a name with AI', {
                subtitle: 'Sends filename, file type and source domain to your selected provider',
                actionLabel: 'Suggest',
              }),
            ]
          : []),
        row('aux-files-open', 'Cancel rename'),
        row('aux-file-drag', 'Drag original file', {
          subtitle: 'Use the file row to drag to another app',
          downloadId: prepared.downloadId,
          actionLabel: 'Drag',
        }),
      ],
    },
  ];
}
async function runFileAction(api, client, account, context, state, query, item, onRequest) {
  const base = {generation: context.generation};
  const checked = result => {
    if (!result?.success) throw Error(result?.error ?? 'File action is unavailable.');
    return result;
  };
  if (item.kind === 'aux-file-note') return {state};
  if (item.kind === 'aux-files-back') return {state: null, text: ''};
  if (item.kind === 'aux-files-open')
    return {state: {...checked(await api.listRecentFiles(base)), view: 'list'}, text: ''};
  if (item.kind === 'aux-file-select') {
    if (item.file.source === 'chosen') {
      checked(await api.revealRecentFile({...base, downloadId: item.file.id}));
      return {state};
    }
    const prepared = checked(await api.prepareDownloadRename({...base, downloadId: item.file.id}));
    return {
      state: {view: 'rename', prepared},
      text: prepared.filename.slice(0, prepared.extension ? -prepared.extension.length : undefined),
    };
  }
  if (item.kind === 'aux-file-undo')
    return {
      state: {...checked(await api.undoDownloadRename({...base, receiptId: item.receiptId})), view: 'renamed'},
      text: '',
    };
  if (item.kind === 'aux-file-drag') {
    checked(await api.dragRecentFile({...base, downloadId: item.downloadId}));
    return {state};
  }
  if (item.kind === 'aux-file-apply')
    return {
      state: {
        ...checked(
          await api.applyDownloadRename({
            ...base,
            capability: state.prepared.capability,
            stem: validDownloadStem(query),
          }),
        ),
        view: 'renamed',
      },
      text: '',
    };
  if (item.kind === 'aux-file-suggest') {
    const prepared = state.prepared,
      binding = await account();
    if (binding.accountId !== prepared.accountId || !binding.browserProfile?.profileId)
      throw Error('The active profile changed.');
    const request = {
      accountId: prepared.accountId,
      profileId: binding.browserProfile.profileId,
      requestId: crypto.randomUUID(),
    };
    onRequest(request);
    try {
      const proposal = await client.models.downloadNameProposal.mutate({
        ...request,
        filename: prepared.filename,
        mime: prepared.mime,
        sourceHost: prepared.sourceHost,
      });
      const current = await api.getCommandContext();
      const currentAccount = await account();
      if (
        !current.success ||
        current.generation !== context.generation ||
        currentAccount.accountId !== prepared.accountId ||
        currentAccount.browserProfile?.profileId !== request.profileId
      )
        throw Error('The file review expired.');
      return {state, text: validDownloadStem(proposal.stem)};
    } finally {
      onRequest(null);
    }
  }
  throw Error('Unsupported file action.');
}
function mediaSections(context, query, sections) {
  if (
    context?.mode !== 'commands' ||
    !context.pictureInPicture?.available ||
    (query.trim() && !/picture|video|pip/i.test(query))
  )
    return sections;
  return [
    {
      id: 'aux-media',
      title: 'Media',
      items: [
        {
          id: 'aux-pip',
          kind: 'aux-pip',
          title: context.pictureInPicture.active ? 'Return video to tab' : 'Picture in picture',
          actionLabel: 'Run',
        },
      ],
    },
    ...sections,
  ];
}
function auxSettingsSections(context, query, sections) {
  if (context?.mode !== 'commands') return sections;
  const text = query.trim().toLowerCase();
  const pages = [
    ['General', 'general', 'updates language link routing tab cleanup'],
    ['Appearance', 'appearance', 'theme tabs sidebar'],
    ['Shortcuts', 'shortcuts', 'keyboard keys hotkeys'],
    ['Security & Privacy', 'privacy', 'ad blocker history site settings'],
    ['Agent', 'agents', 'permissions sandbox runtime'],
    ['Models', 'model', 'providers api keys local agents'],
  ];
  const items = [
    ...pages.map(([title, path, terms]) => ({
      id: `aux-settings:${path}`,
      kind: 'aux-settings',
      title: `Settings: ${title}`,
      subtitle: 'Opens in a new tab',
      terms,
      url: `main.html#/settings/${path}`,
      actionLabel: 'Open',
    })),
    {
      id: 'aux-settings:import',
      kind: 'aux-settings',
      title: 'Import from another browser',
      subtitle: 'Bookmarks and history',
      terms: 'arc chrome safari',
      url: 'main.html#/onboarding/import-browser',
      actionLabel: 'Open',
    },
  ].filter(item => !text || `${item.title} ${item.subtitle} ${item.terms}`.toLowerCase().includes(text));
  return items.length ? [...sections, {id: 'aux-settings', title: 'Settings', items}] : sections;
}
function developerSections(context, query, sections) {
  if (context?.mode !== 'commands' || !context.developer?.success) return sections;
  const items = [
    ...(context.developer.captureAvailable
      ? [
          {
            id: 'aux-developer-capture',
            kind: 'aux-developer-capture',
            title: 'Screenshot',
            subtitle: 'Capture this page or select an area',
          },
        ]
      : []),
    ...(context.developer.devToolsAvailable
      ? [
          {
            id: 'aux-developer-tools',
            kind: 'aux-developer-tools',
            title: 'Developer tools',
            subtitle: 'Inspect the active page',
          },
        ]
      : []),
    {
      id: 'aux-developer-extensions',
      kind: 'aux-developer-extensions',
      title: 'Manage extensions',
      subtitle: context.developer.developerMode
        ? 'Developer mode is on — load only extensions you trust'
        : 'Chrome-compatible extensions for this profile',
    },
  ].filter(
    item => !query.trim() || `${item.title} ${item.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return items.length ? [{id: 'aux-developer', title: 'Page tools', items}, ...sections] : sections;
}
async function runDeveloperCommand(api, tabs, context, item) {
  const checked = result => {
    if (!result?.success) throw Error(result?.error ?? 'This page action is unavailable.');
    return result;
  };
  const request = {generation: context.generation};
  if (item.kind === 'aux-developer-tools') {
    checked(await api.openDeveloperTools(request));
    return;
  }
  if (item.kind === 'aux-developer-extensions') {
    checked(await api.openExtensionManager(request));
    return;
  }
  if (item.kind === 'aux-developer-capture') {
    const target = checked(await api.getPageCaptureTarget(request));
    if (!Number.isInteger(target.tabId) || !target.documentId) throw Error('The selected page changed.');
    await tabs.sendMessage(target.tabId, {type: 'capture:open'}, {documentId: target.documentId});
    return;
  }
  throw Error('Unsupported page action.');
}
function createAuxPaletteInvocation() {
  let epoch = 0,
    edits = 0,
    generation = null;
  return {
    begin() {
      generation = null;
      const token = ++epoch,
        start = edits;
      return {
        current: () => epoch === token,
        unedited: () => epoch === token && edits === start,
        accept(value) {
          if (epoch === token) generation = value;
        },
      };
    },
    invalidate() {
      ++epoch;
      generation = null;
    },
    edit() {
      ++edits;
    },
    allows(value) {
      return generation !== null && generation === value;
    },
    capture(unedited = false) {
      const token = epoch,
        start = edits;
      return () => epoch === token && (!unedited || edits === start);
    },
  };
}
/** The command bar (Cmd+T, Cmd+L, Cmd+K, Cmd+Shift+A): one input over the browser, Aux and command sections, with arrow keys, Enter and the native input hand-off. */
function CommandBar() {
  const auxInputTransfer = (0, React.useRef)(false);
  const [auxNativeInput, auxSetNativeInput] = (0, React.useState)(null),
    [auxNativeSubmit, auxSetNativeSubmit] = (0, React.useState)(false);
  const auxInvocation = (0, React.useRef)(null);
  if (!auxInvocation.current) auxInvocation.current = createAuxPaletteInvocation();
  const [auxFileState, auxSetFileState] = (0, React.useState)(null),
    auxFileGuard = (0, React.useRef)(null);
  if (!auxFileGuard.current)
    auxFileGuard.current = createFileReviewGuard(request => auxFilesClient.models.downloadNameCancel.mutate(request));
  (0, React.useEffect)(() => () => auxFileGuard.current?.invalidate(), []);
  const [auxProductivityReceipt, auxSetProductivityReceipt] = (0, React.useState)(null);
  const [auxNavContext, auxNavSetContext] = (0, React.useState)(null),
    [auxNavError, auxNavSetError] = (0, React.useState)(''),
    [auxShortcutMap, auxSetShortcutMap] = (0, React.useState)(null),
    auxNavBusy = (0, React.useRef)(false);
  (0, React.useEffect)(() => {
    let live = true;
    const load = () => {
        const api = typeof chrome > 'u' ? void 0 : chrome.auxBrowserPreferences;
        typeof api?.getKeyboardShortcuts == 'function' &&
          Promise.resolve(api.getKeyboardShortcuts())
            .then(list => {
              live &&
                Array.isArray(list) &&
                auxSetShortcutMap(
                  new Map(
                    list.map(row => [
                      row.commandId,
                      typeof row.serializedShortcut == 'string' ? row.serializedShortcut : '',
                    ]),
                  ),
                );
            })
            .catch(() => {});
      },
      visible = () => {
        document.visibilityState !== 'hidden' && load();
      };
    load();
    document.addEventListener('visibilitychange', visible);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);
  (0, React.useLayoutEffect)(() => {
    let documentId = null,
      pending = null;
    const invalidate = () => {
      auxInvocation.current.invalidate();
      auxFileGuard.current.invalidate();
      auxNavBusy.current = false;
      auxNavSetContext(null);
      auxInputTransfer.current = false;
      auxSetNativeInput(null);
      auxSetNativeSubmit(false);
    };
    const refresh = (reset = true) => {
      const attempt = auxInvocation.current.begin();
      auxFileGuard.current.invalidate();
      auxNavBusy.current = false;
      auxNavSetContext(null);
      auxSetFileState(null);
      auxSetProductivityReceipt(null);
      auxNavSetError('');
      if (reset) {
        setInput('');
        setQuery('');
        setSelectedIndex(0);
        auxSetNativeSubmit(false);
      }
      chrome.auxBrowserPreferences
        .getCommandContext()
        .then(value => {
          if (!attempt.current()) return;
          documentId = value.paletteDocumentId ?? null;
          const queued = pending;
          pending = null;
          if (queued && queued.documentId === documentId) {
            if (queued.shown) refresh(false);
            else invalidate();
            return;
          }
          if (!value.success) throw Error(value.error);
          auxNavSetContext(value);
          if (value.nativeInput?.active) {
            auxInputTransfer.current = true;
            auxSetNativeInput(value.nativeInput);
            setInput(value.nativeInput.text);
            setQuery(value.nativeInput.text);
            return;
          }
          attempt.accept(value.generation);
          auxSetNativeInput(null);
          if (value.mode === 'navigate' && (reset || !inputRef.current?.value) && attempt.unedited()) {
            setInput(value.activeUrl ?? '');
            setQuery(value.activeUrl ?? '');
            requestAnimationFrame(() => {
              if (attempt.unedited()) {
                inputRef.current?.focus();
                inputRef.current?.select();
              }
            });
          }
        })
        .catch(error => {
          if (attempt.current()) auxNavSetError(error.message);
        });
    };
    const notify = event => {
      if (documentId === null) {
        pending = event;
        return;
      }
      if (event.documentId !== documentId) return;
      if (event.shown) refresh(!event.inputPending);
      else invalidate();
    };
    chrome.auxBrowserPreferences.onCommandInvocation.addListener(notify);
    refresh();
    return () => {
      chrome.auxBrowserPreferences.onCommandInvocation.removeListener(notify);
      invalidate();
    };
  }, []);
  const [input, setInput] = (0, React.useState)(''),
    [query, setQuery] = (0, React.useState)(''),
    [revision, setRevision] = (0, React.useState)(0),
    [settledSearch, setSettledSearch] = (0, React.useState)(null),
    [selectedIndex, setSelectedIndex] = (0, React.useState)(0),
    [sources, setSources] = (0, React.useState)({
      bookmarks: [],
      chatSearch: [],
      extensions: [],
      history: [],
      openTabs: [],
      recentChats: [],
      recentlyClosed: [],
    }),
    loadAbort = (0, React.useRef)(null),
    loadGeneration = (0, React.useRef)(0),
    loadsDone = (0, React.useRef)(Promise.resolve()),
    searchGeneration = (0, React.useRef)(0),
    inputRef = (0, React.useRef)(null),
    listRef = (0, React.useRef)(null),
    sections = (0, React.useMemo)(
      () =>
        productivitySections(auxNavContext, auxProductivityReceipt) ??
        filesSections(
          auxNavContext,
          auxFileState,
          query,
          auxSettingsSections(
            auxNavContext,
            query,
            developerSections(
              auxNavContext,
              query,
              mediaSections(
                auxNavContext,
                query,
                navigationSections(auxNavContext, query, browserSections(sources, query)),
              ),
            ),
          ),
        ),
      [query, sources, auxNavContext, auxProductivityReceipt, auxFileState],
    ),
    items = (0, React.useMemo)(() => flattenSections(sections), [sections]),
    focusInput = (0, React.useCallback)(() => {
      if (auxInputTransfer.current) return;
      const current = auxInvocation.current.capture(true);
      requestAnimationFrame(() => {
        if (current()) {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      });
    }, []),
    loadSources = (0, React.useCallback)(() => {
      const generation = ++loadGeneration.current;
      loadAbort.current?.abort();
      const controller = new AbortController();
      loadAbort.current = controller;
      const tabs = loadOpenTabs()
          .then(list => {
            loadGeneration.current === generation && setSources(current => ({...current, openTabs: list}));
          })
          .catch(() => {}),
        closed = loadRecentlyClosed()
          .then(list => {
            loadGeneration.current === generation && setSources(current => ({...current, recentlyClosed: list}));
          })
          .catch(() => {}),
        chats = loadRecentChats(controller.signal)
          .then(list => {
            loadGeneration.current === generation && setSources(current => ({...current, recentChats: list}));
          })
          .catch(() => {}),
        extensions = loadExtensions()
          .then(list => {
            loadGeneration.current === generation && setSources(current => ({...current, extensions: list}));
          })
          .catch(() => {});
      loadsDone.current = Promise.all([tabs, closed, chats, extensions]);
    }, []),
    activate = (0, React.useCallback)(
      async item => {
        if (auxNavBusy.current || !auxInvocation.current.allows(auxNavContext?.generation)) return;
        const auxActionCurrent = auxInvocation.current.capture();
        auxNavBusy.current = true;
        auxNavSetError('');
        let auxNavSuccess = false;
        try {
          if (item.kind === 'aux-context-action') {
            await commitContextAction(
              chrome.auxBrowserPreferences,
              auxFilesClient,
              auxFilesAccount,
              auxNavContext,
              item,
            );
            auxNavSuccess = true;
            return;
          }
          if (item.kind === 'aux-ask-query') {
            await commitPaletteAsk(chrome.auxBrowserPreferences, auxNavContext, item);
            auxNavSuccess = true;
            return;
          }
          if (item.kind?.startsWith('aux-developer-')) {
            await runDeveloperCommand(chrome.auxBrowserPreferences, chrome.tabs, auxNavContext, item);
            auxNavSuccess = true;
            return;
          }
          if (item.kind === 'aux-settings') {
            await chrome.tabs.create({url: chrome.runtime.getURL(item.url)});
            auxNavSuccess = true;
            return;
          }
          if (item.kind === 'aux-pip') {
            const result = await chrome.auxBrowserPreferences.togglePictureInPicture({
              generation: auxNavContext.generation,
            });
            if (!result.success) throw Error(result.error);
            auxNavSuccess = true;
            return;
          }
          if (item.kind?.startsWith('aux-file')) {
            const action = auxFileGuard.current.begin();
            try {
              const result = await runFileAction(
                chrome.auxBrowserPreferences,
                auxFilesClient,
                auxFilesAccount,
                auxNavContext,
                auxFileState,
                query,
                item,
                action.setRequest,
              );
              if (!action.isCurrent()) return;
              auxSetFileState(result.state);
              if (result.text !== undefined) {
                setInput(result.text);
                setQuery(result.text);
                requestAnimationFrame(() => {
                  if (action.isCurrent()) {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                  }
                });
              }
            } catch (error) {
              if (action.isCurrent()) throw error;
            }
            return;
          }
          if (item.kind?.startsWith('aux-tidy-')) {
            const result = await commitProductivityAction(
              chrome.auxBrowserPreferences,
              auxNavContext,
              auxProductivityReceipt,
              item,
            );
            if (!auxActionCurrent()) return;
            if (result.receipt) auxSetProductivityReceipt(result.receipt);
            auxNavSuccess = !!result.close;
            return;
          }
          if (
            item.kind === 'aux-logical-tab' ||
            item.kind === 'aux-space' ||
            item.kind === 'aux-navigate' ||
            item.kind === 'aux-command' ||
            item.kind === 'aux-new-blank-tab' ||
            item.kind === 'open-tab' ||
            (item.url && item.kind !== 'extension' && item.kind !== 'recently-closed')
          ) {
            await commitNavigation(chrome.auxBrowserPreferences, auxNavContext, item);
            auxNavSuccess = true;
            return;
          }
          const auxLive = await chrome.auxBrowserPreferences.getCommandContext();
          if (!auxActionCurrent()) return;
          if (!auxLive.success || auxLive.generation !== auxNavContext?.generation)
            throw Error('Command context expired; reopen the command bar');
          const chatUrl = item.kind === 'chat' ? item.url : void 0,
            tabId = chatUrl
              ? (await chrome.tabs.query({})).find(tab =>
                  [tab.url, tab.pendingUrl].some(
                    url => url?.startsWith(chatUrl) && /^([/?]|$)/.test(url.slice(chatUrl.length)),
                  ),
                )?.id
              : item.tabId;
          if (!auxActionCurrent()) return;
          if (tabId !== void 0) {
            const tab = await chrome.tabs.get(tabId);
            if (!auxActionCurrent()) return;
            typeof tab.windowId == 'number' &&
              (await Promise.all([
                chrome.tabs.update(tabId, {active: true}),
                chrome.windows.update(tab.windowId, {focused: true}),
              ]));
            return;
          }
          if (item.kind === 'recently-closed') {
            item.restoreSessionId && chrome.sessions?.restore && (await chrome.sessions.restore(item.restoreSessionId));
            auxNavSuccess = true;
            return;
          }
          if (item.kind === 'extension' && item.extensionId) {
            if (item.isApp && chrome.management?.launchApp) {
              await chrome.management.launchApp(item.extensionId);
              auxNavSuccess = true;
              return;
            }
            if (chrome.management?.launchExtension) {
              await chrome.management.launchExtension(item.extensionId);
              auxNavSuccess = true;
              return;
            }
            await chrome.tabs.create({url: `chrome-extension://${item.extensionId}/popup.html`});
            auxNavSuccess = true;
            return;
          }
          item.url && (await chrome.tabs.create({url: item.url}));
          auxNavSuccess = true;
        } catch (error) {
          if (auxActionCurrent()) auxNavSetError(error instanceof Error ? error.message : String(error));
        } finally {
          if (auxActionCurrent()) {
            auxNavBusy.current = false;
            if (auxNavSuccess) closeWindow();
          }
        }
      },
      [auxNavContext, auxProductivityReceipt, auxFileState, query],
    );
  ((0, React.useEffect)(() => {
    const refresh = () => {
        document.visibilityState !== 'hidden' &&
          (focusInput(),
          loadSources(),
          ne({disableTransitionOnChange: true}).catch(() => {}),
          setRevision(count => count + 1));
      },
      onVisibility = () => {
        document.visibilityState === 'visible' && refresh();
      };
    return (
      refresh(),
      window.addEventListener('focus', refresh),
      window.addEventListener('pageshow', refresh),
      document.addEventListener('visibilitychange', onVisibility),
      () => {
        (window.removeEventListener('focus', refresh),
          window.removeEventListener('pageshow', refresh),
          document.removeEventListener('visibilitychange', onVisibility),
          (loadGeneration.current += 1),
          loadAbort.current?.abort());
      }
    );
  }, [focusInput, loadSources]),
    (0, React.useEffect)(() => {
      const onKeyDown = event => {
        isCloseShortcut(event) && (event.preventDefault(), event.stopPropagation(), closeWindow());
      };
      return (
        window.addEventListener('keydown', onKeyDown, {capture: true}),
        () => {
          window.removeEventListener('keydown', onKeyDown, {capture: true});
        }
      );
    }, []),
    (0, React.useEffect)(() => {
      const trimmed = query.trim(),
        generation = ++searchGeneration.current,
        controller = new AbortController();
      if ((setSettledSearch(null), !trimmed)) return () => controller.abort();
      const timer = setTimeout(() => {
        const chats = searchChats(trimmed, controller.signal)
            .then(list => {
              searchGeneration.current === generation && setSources(current => ({...current, chatSearch: list}));
            })
            .catch(() => {}),
          history = searchHistory(trimmed)
            .then(list => {
              searchGeneration.current === generation && setSources(current => ({...current, history: list}));
            })
            .catch(() => {}),
          bookmarks = searchBookmarks(trimmed)
            .then(list => {
              searchGeneration.current === generation && setSources(current => ({...current, bookmarks: list}));
            })
            .catch(() => {});
        Promise.all([chats, history, bookmarks, loadsDone.current]).then(() => {
          searchGeneration.current === generation && setSettledSearch({query, revision});
        });
      }, 80);
      return () => {
        (clearTimeout(timer), controller.abort());
      };
    }, [revision, query]),
    (0, React.useEffect)(() => {
      setSelectedIndex(index => (items.length === 0 ? -1 : index < 0 ? 0 : Math.min(index, items.length - 1)));
    }, [items.length]),
    (0, React.useEffect)(() => {
      selectedIndex < 0 || listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({block: 'nearest'});
    }, [selectedIndex]));
  const handleKeyDown = (0, React.useCallback)(
      event => {
        if (!event.nativeEvent.isComposing) {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if ((event.preventDefault(), items.length === 0)) return;
            setSelectedIndex(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
            return;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            const item = items[selectedIndex];
            item && activate(item);
          }
        }
      },
      [activate, items, selectedIndex],
    ),
    commitQuery = value => {
      (setQuery(value), setSelectedIndex(0));
    },
    handleChange = event => {
      auxInvocation.current.edit();
      const value = event.currentTarget.value;
      (setInput(value),
        (!(event.nativeEvent instanceof InputEvent) || !event.nativeEvent.isComposing) && commitQuery(value));
    },
    searchSettled = settledSearch?.query === query && settledSearch.revision === revision;
  (0, React.useLayoutEffect)(() => {
    if (!auxNativeInput || !auxNavContext?.success) return;
    const current = auxInvocation.current.capture();
    const input = inputRef.current;
    if (!input || auxNativeInput.composing) return;
    input.focus();
    input.setSelectionRange(
      Math.min(auxNativeInput.selectionStart, auxNativeInput.selectionEnd),
      Math.max(auxNativeInput.selectionStart, auxNativeInput.selectionEnd),
      auxNativeInput.selectionStart > auxNativeInput.selectionEnd ? 'backward' : 'forward',
    );
    chrome.auxBrowserPreferences
      .getCommandContext({generation: auxNavContext.generation, inputRevision: auxNativeInput.revision})
      .then(value => {
        if (!current()) return;
        if (!value.success || value.generation !== auxNavContext.generation)
          throw Error('Command input changed; reopen the command bar');
        if (value.nativeInput?.active) {
          auxInputTransfer.current = true;
          auxSetNativeInput(value.nativeInput);
          setInput(value.nativeInput.text);
          setQuery(value.nativeInput.text);
          return;
        }
        if (!value.nativeInput?.accepted) return;
        auxInputTransfer.current = false;
        const attempt = auxInvocation.current.begin();
        attempt.accept(value.generation);
        auxSetNativeInput(null);
        auxSetNativeSubmit(!!value.nativeInput.submit);
        auxNavSetContext(value);
      })
      .catch(error => {
        if (current()) auxNavSetError(error.message);
      });
  }, [auxNativeInput, auxNavContext]);
  (0, React.useEffect)(() => {
    if (auxNativeSubmit && auxInvocation.current.allows(auxNavContext?.generation) && items.length) {
      auxSetNativeSubmit(false);
      activate(items[selectedIndex] ?? items[0]);
    }
  }, [auxNativeSubmit, auxNavContext, activate, items, selectedIndex]);
  return (0, jsxRuntime.jsxs)('main', {
    className: 'text-surface-primary-foreground flex h-85 w-full flex-col overflow-hidden',
    children: [
      (0, jsxRuntime.jsxs)('div', {
        className: 'flex h-11 min-h-11 items-center gap-2.5 px-3',
        children: [
          (0, jsxRuntime.jsx)(ce, {className: 'text-muted-foreground size-4.5 shrink-0'}),
          (0, jsxRuntime.jsx)('input', {
            ref: inputRef,
            value: input,
            spellCheck: false,
            autoCorrect: 'off',
            autoCapitalize: 'off',
            onFocus: event => {
              if (auxNavContext?.mode === 'navigate' && event.currentTarget.value === (auxNavContext.activeUrl ?? ''))
                event.currentTarget.select();
            },
            className:
              'placeholder:text-muted-foreground h-full min-w-0 grow bg-transparent text-base tracking-tight outline-none',
            readOnly: auxNavContext?.mode === 'tidy',
            placeholder:
              auxFileState?.view === 'rename'
                ? 'Filename without extension'
                : auxFileState?.view === 'list'
                  ? 'Search recent files'
                  : auxNavContext?.mode === 'tidy'
                    ? 'Review tab organization'
                    : auxNavContext?.mode === 'commands'
                      ? 'Search commands, tabs or enter a URL'
                      : auxNavContext?.mode === 'new-tab' || auxNavContext?.mode === 'navigate'
                        ? 'Search or type a URL'
                        : 'Search tabs, chats, history, bookmarks or extensions',
            onChange: handleChange,
            onCompositionEnd: event => commitQuery(event.currentTarget.value),
            onKeyDown: handleKeyDown,
          }),
          (() => {
            const mode = auxNavContext?.mode,
              [id, fallback] =
                mode === 'new-tab'
                  ? [34014, 'Meta+T']
                  : mode === 'navigate'
                    ? [39001, 'Meta+L']
                    : mode === 'commands'
                      ? [39002, 'Meta+K']
                      : [52500, 'Meta+Shift+A'],
              hint = auxShortcutMap?.has(id) ? auxShortcutMap.get(id) : fallback;
            return hint ? (0, jsxRuntime.jsx)(ye, {children: xe(hint)}) : null;
          })(),
        ],
      }),
      (0, jsxRuntime.jsxs)(de, {
        ref: listRef,
        className: 'min-h-0 grow overflow-hidden px-2 py-1',
        children: [
          sections.length > 0
            ? sections.map(section =>
                (0, jsxRuntime.jsx)(
                  ResultSection,
                  {
                    items: section.items,
                    selectedIndex,
                    section,
                    onActivate: activate,
                    onSelect: setSelectedIndex,
                    startIndex: items.findIndex(item => item.id === section.items[0]?.id),
                  },
                  section.id,
                ),
              )
            : null,
          auxNavError
            ? (0, jsxRuntime.jsx)(we, {children: (0, jsxRuntime.jsx)(be, {role: 'alert', children: auxNavError})})
            : sections.length === 0 && searchSettled
              ? (0, jsxRuntime.jsx)(we, {children: (0, jsxRuntime.jsx)(be, {children: 'No results'})})
              : null,
        ],
      }),
    ],
  });
}
var /** A titled section of results. */
  ResultSection = ({items, onActivate, onSelect, section, selectedIndex, startIndex}) =>
    (0, jsxRuntime.jsxs)('section', {
      className: 'pt-2 first:pt-1',
      children: [
        (0, jsxRuntime.jsx)('h2', {
          className: 'text-muted-foreground px-2 py-1.5 text-xs font-semibold',
          children: section.title,
        }),
        (0, jsxRuntime.jsx)('ul', {
          className: 'space-y-0.5',
          children: items.map((item, offset) => {
            const index = startIndex + offset;
            return (0, jsxRuntime.jsx)(
              ResultRow,
              {
                item,
                selected: selectedIndex === index,
                onClick: () => {
                  onActivate(item);
                },
                onPointerEnter: () => onSelect(index),
                onDragStart: () => onActivate({...item, kind: 'aux-file-drag', downloadId: item.file.id}),
              },
              item.id,
            );
          }),
        }),
      ],
    }) /** A result row: icon, title, subtitle, and its action or time; file results can be dragged out. */,
  ResultRow = ({item, onClick, onPointerEnter, selected, onDragStart}) =>
    (0, jsxRuntime.jsxs)('li', {
      className: X(
        'flex h-8 cursor-default items-center gap-2 rounded-lg px-2 text-sm leading-5 font-medium select-none',
        selected && 'bg-secondary',
      ),
      'data-selected': selected,
      onClick,
      onPointerEnter,
      draggable: item.kind === 'aux-file-select' && item.file.available,
      onDragStart: event => {
        event.preventDefault();
        onDragStart?.();
      },
      children: [
        (0, jsxRuntime.jsx)(ResultIcon, {item}),
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex min-w-0 flex-1 items-baseline gap-2',
          children: [
            (0, jsxRuntime.jsx)('span', {className: 'truncate', children: item.title}),
            item.subtitle
              ? (0, jsxRuntime.jsx)('span', {
                  className: 'text-muted-foreground min-w-0 truncate text-xs',
                  children: item.subtitle,
                })
              : null,
          ],
        }),
        item.actionLabel
          ? (0, jsxRuntime.jsxs)('div', {
              className: 'text-muted-foreground flex shrink-0 items-center gap-2 text-xs font-medium',
              children: [
                (0, jsxRuntime.jsx)('span', {children: item.actionLabel}),
                (0, jsxRuntime.jsx)(K, {className: 'size-3.5'}),
              ],
            })
          : item.timeLabel
            ? (0, jsxRuntime.jsx)('span', {
                className: 'text-muted-foreground shrink-0 text-xs',
                children: item.timeLabel,
              })
            : null,
      ],
    }); /** A result’s icon: the favicon, else one for its kind. */
function ResultIcon({item}) {
  return item.kind === 'chat'
    ? (0, jsxRuntime.jsx)('div', {
        className: 'pointer-events-none flex size-4.5 shrink-0 items-center justify-center select-none',
        draggable: false,
        children: (0, jsxRuntime.jsx)(ae, {className: 'text-muted-foreground size-4'}),
      })
    : item.kind === 'extension' && !item.faviconUrl
      ? (0, jsxRuntime.jsx)('div', {
          className: 'pointer-events-none flex size-4.5 shrink-0 items-center justify-center select-none',
          draggable: false,
          children: (0, jsxRuntime.jsx)(V, {className: 'text-muted-foreground size-4'}),
        })
      : (0, jsxRuntime.jsxs)(pe, {
          className:
            'text-muted-foreground pointer-events-none size-4.5 shrink-0 rounded-sm bg-transparent select-none',
          draggable: false,
          children: [
            item.faviconUrl ? (0, jsxRuntime.jsx)(fe, {draggable: false, src: item.faviconUrl}) : null,
            (0, jsxRuntime.jsx)(he, {
              className: 'bg-transparent',
              children:
                item.kind === 'open-tab'
                  ? (0, jsxRuntime.jsx)(le, {className: 'size-4'})
                  : item.kind === 'history'
                    ? (0, jsxRuntime.jsx)(ie, {className: 'size-4'})
                    : item.kind === 'bookmark'
                      ? (0, jsxRuntime.jsx)(BookmarkIcon, {className: 'size-4'})
                      : item.kind === 'extension'
                        ? (0, jsxRuntime.jsx)(V, {className: 'size-4'})
                        : (0, jsxRuntime.jsx)(K, {className: 'size-4'}),
            }),
          ],
        });
}
te();
var root = document.getElementById('root');
if (root) {
  const e = window;
  ((e.tabSearchRoot ??= (0, ReactDOMClient.createRoot)(root)),
    e.tabSearchRoot.render((0, jsxRuntime.jsx)(CommandBar, {})));
}

//# chunkId=4ec9f952-5790-5976-9a6b-e41ea5323bb5
function askPaletteSections(context, query, sections) {
  if (
    !context?.success ||
    !['commands', 'new-tab', 'navigate'].includes(context.mode) ||
    typeof query !== 'string' ||
    !query.trim() ||
    query.length > 32768 ||
    !context.commands?.some(command => command.id === 'ask-aux' && command.enabled)
  )
    return sections;
  return [
    ...sections,
    {
      id: 'aux-ask-query',
      title: 'Ask',
      items: [
        {
          id: 'aux-ask-query',
          kind: 'aux-ask-query',
          title: 'Ask your agent',
          subtitle: query,
          text: query,
          actionLabel: 'Send',
        },
      ],
    },
  ];
}
async function commitPaletteAsk(api, context, item) {
  if (
    !context?.success ||
    typeof context.generation !== 'string' ||
    item?.kind !== 'aux-ask-query' ||
    typeof item.text !== 'string' ||
    !item.text.trim() ||
    item.text.length > 32768
  )
    throw Error('Ask context expired; reopen the command bar.');
  const result = await api.commitCommand({kind: 'ask', generation: context.generation, text: item.text});
  if (!result?.success || !Number.isInteger(result.windowId))
    throw Error(result?.error ?? 'Could not open your agent.');
  // The agent panel in that window takes the question from here (aux-agent-ui.js).
  await chrome.storage.session.set({
    'aux.agent.pendingAsk.v1': {windowId: result.windowId, text: item.text, at: Date.now()},
  });
  return result;
}

function contextActionSections(context, query, sections) {
  if (
    !context?.success ||
    !['commands', 'new-tab', 'navigate'].includes(context.mode) ||
    !context.commands?.some(item => item.id === 'ask-aux' && item.enabled)
  )
    return sections;
  const state = context.contextActions,
    items = [],
    text = typeof query === 'string' ? query.trim() : '';
  if (text.length > 32768) return sections;
  const add = (action, title, subtitle) =>
    items.push({
      id: `aux-context-${action}`,
      kind: 'aux-context-action',
      action,
      title,
      subtitle,
      text,
      actionLabel: action === 'summarize-page' ? 'Summarize' : 'Ask',
    });
  if (text && state?.pageAvailable) add('ask-page', 'Ask current page', text);
  if (text && state?.selectedAvailable && state.selectedCount > 0)
    add('ask-selected-tabs', `Ask selected tabs (${state.selectedCount})`, text);
  if (state?.pageAvailable && (!text || /summari[sz]|page/i.test(text)))
    add('summarize-page', 'Summarize current page', 'Start a chat with this page attached');
  return items.length ? [...sections, {id: 'aux-context-actions', title: 'Page context', items}] : sections;
}
async function commitContextAction(api, client, account, context, item) {
  if (
    !context?.success ||
    typeof context.generation !== 'string' ||
    item?.kind !== 'aux-context-action' ||
    !['ask-page', 'ask-selected-tabs', 'summarize-page'].includes(item.action)
  )
    throw Error('Page action expired; reopen the command bar.');
  const prepared = await api.commitCommand({
    kind: 'context-ask',
    generation: context.generation,
    action: item.action,
    text: item.text,
  });
  const requireReceipt = value => {
    if (
      !value?.success ||
      typeof value.token !== 'string' ||
      !Number.isSafeInteger(value.accountId) ||
      value.accountId < 0 ||
      !value.profileId ||
      !value.ownerGeneration ||
      !Number.isInteger(value.windowId) ||
      !value.originTargetId ||
      typeof value.query !== 'string' ||
      !value.query.trim() ||
      !Array.isArray(value.references) ||
      !value.references.length ||
      value.references.length > 64 ||
      value.references.some(ref => !ref.targetId || !ref.url || !ref.documentCapability)
    )
      throw Error(value?.error ?? 'The original page context could not be retained. Reopen the command bar.');
    return value;
  };
  requireReceipt(prepared);
  const binding = await account();
  if (
    binding?.accountId !== prepared.accountId ||
    binding.browserProfile?.profileId !== prepared.profileId ||
    (binding.browserProfile.chromiumProfileId && binding.browserProfile.chromiumProfileId !== prepared.profileId)
  )
    throw Error('The original profile changed. Reopen the command bar.');
  // Native rechecks the retained documents, native selection, profile epoch and
  // original window immediately before the original session mutation. No await
  // occurs between this authorization and dispatch to the supplied client.
  const receipt = requireReceipt(
    await api.commitCommand({kind: 'context-ask-authorize', generation: context.generation, token: prepared.token}),
  );
  if (JSON.stringify(receipt) !== JSON.stringify(prepared)) throw Error('Page context changed before submission.');
  const now = Date.now();
  const session = await client.sessions.createAndPrompt.mutate({
    accountId: receipt.accountId,
    trigger: {type: 'user', source: 'remix'},
    activeTabTargetId: receipt.originTargetId,
    browserBinding: {
      profileId: receipt.profileId,
      browserMode: 'default',
      windowId: receipt.windowId,
      anchorTargetId: receipt.originTargetId,
    },
    message: [
      {
        role: 'user-message-metadata',
        timestamp: now - 1,
        attachments: receipt.references.map(ref => ({
          id: `tab:${ref.targetId}`,
          type: 'tab',
          targetId: ref.targetId,
          url: ref.url,
          name: ref.name || ref.url,
          documentCapability: ref.documentCapability,
        })),
      },
      {role: 'user', content: receipt.query, timestamp: now},
    ],
  });
  if (typeof session?.id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(session.id))
    throw Error('The session response was unavailable. Check chat history before retrying.');
  const opened = await api.commitCommand({
    kind: 'context-ask-open',
    generation: context.generation,
    token: receipt.token,
    sessionId: session.id,
  });
  if (!opened?.success)
    throw Error(
      `Chat created, but its original page or window changed. Open it from chat history. ${opened?.error ?? ''}`.trim(),
    );
  return opened;
}
