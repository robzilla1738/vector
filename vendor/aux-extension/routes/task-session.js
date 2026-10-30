/* Aux-owned source, the task session page (assets/_sessionId-ClN_BWh5.js, the whole module body;
 * Ga exported as component): the header with its breadcrumbs, Share and the chat menu (rename,
 * copy ID, project, archive, delete), the chat and its composer, and the pinned summary beside it
 * (routine details, the session's routines, outputs and the agent's tabs), docked on wide windows and
 * floating under its toggle on narrow ones; the side-panel layout and the browser tab controls
 * behind it; and the development playground switches, which stay off.
 * Names the rest of the chunk uses keep their chunk names: Ga the page.
 * Chunk names used: b cn, and the imported composer, provider, permission,
 * dialog, dropdown, tooltip and query parts. */
var jsxRuntime = Ue(),
  PinnedSummaryIcon = ({size = 24, ariaHidden = true, ...n}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M6 14C7.65685 14 9 15.3431 9 17C9 18.6569 7.65685 20 6 20C4.34315 20 3 18.6569 3 17C3 15.3431 4.34315 14 6 14ZM6 16C5.44771 16 5 16.4477 5 17C5 17.5523 5.44771 18 6 18C6.55229 18 7 17.5523 7 17C7 16.4477 6.55229 16 6 16ZM20 16C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H13C12.4477 18 12 17.5523 12 17C12 16.4477 12.4477 16 13 16H20ZM6 4C7.65685 4 9 5.34315 9 7C9 8.65685 7.65685 10 6 10C4.34315 10 3 8.65685 3 7C3 5.34315 4.34315 4 6 4ZM6 6C5.44771 6 5 6.44771 5 7C5 7.55229 5.44771 8 6 8C6.55229 8 7 7.55229 7 7C7 6.44771 6.55229 6 6 6ZM20 6C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H13C12.4477 8 12 7.55228 12 7C12 6.44772 12.4477 6 13 6H20Z',
        fill: 'currentColor',
      }),
    }),
  LinkIcon = ({size = 24, ariaHidden = true, ...n}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M4.78811 9.29782C5.17599 8.90483 5.80908 8.90035 6.20218 9.28805C6.59516 9.67593 6.59964 10.309 6.21194 10.7021L5.46975 11.4541L5.46585 11.459C3.51194 13.4129 3.51189 16.5802 5.46585 18.5341C7.41979 20.4881 10.5871 20.488 12.541 18.5341L12.5459 18.5302L13.2979 17.7881C13.691 17.4003 14.3241 17.4048 14.7119 17.7978C15.0997 18.1909 15.0952 18.824 14.7022 19.2119L13.9512 19.9531C11.2158 22.6836 6.78531 22.6817 4.05178 19.9482C1.31678 17.2132 1.31585 12.7789 4.05081 10.0439L4.78811 9.29782ZM13.293 9.29294C13.6835 8.90241 14.3165 8.90241 14.7071 9.29294C15.0976 9.68346 15.0976 10.3165 14.7071 10.707L10.7071 14.707C10.3165 15.0975 9.68352 15.0975 9.293 14.707C8.90247 14.3165 8.90247 13.6835 9.293 13.2929L13.293 9.29294ZM10.044 4.05075C12.7788 1.31595 17.2132 1.31623 19.9483 4.05075C22.6818 6.78428 22.6827 11.2148 19.9522 13.9502L19.9532 13.9511L19.2119 14.7021C18.8241 15.0951 18.191 15.0996 17.7979 14.7119C17.4049 14.324 17.4004 13.6909 17.7881 13.2978L18.5303 12.5459L18.5342 12.541C20.4881 10.587 20.4881 7.41974 18.5342 5.46579C16.5803 3.51184 13.413 3.51188 11.459 5.46579L11.4541 5.46969L10.7022 6.21188C10.3091 6.59959 9.67599 6.5951 9.28811 6.20212C8.90041 5.80903 8.90489 5.17593 9.29788 4.78805L10.044 4.05075Z',
        fill: 'currentColor',
      }),
    }),
  PlaygroundIcon = ({size = 24, ariaHidden = true, ...n}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M14.4462 12.9999C16.6549 13.0004 18.4462 14.791 18.4462 16.9999C18.4462 19.2088 16.6549 20.9994 14.4462 20.9999C12.2371 20.9999 10.4462 19.2091 10.4462 16.9999C10.4462 14.7907 12.2371 12.9999 14.4462 12.9999ZM14.4462 14.9999C13.3416 14.9999 12.4462 15.8953 12.4462 16.9999C12.4462 18.1045 13.3416 18.9999 14.4462 18.9999C15.5504 18.9994 16.4462 18.1042 16.4462 16.9999C16.4462 15.8956 15.5504 15.0004 14.4462 14.9999ZM4.36217 6.19228C4.69768 6.07048 5.07308 6.13664 5.34654 6.36611L10.6542 10.8192C10.9273 11.0489 11.0579 11.4072 10.996 11.7587C10.9339 12.1101 10.6886 12.402 10.3534 12.5243L3.84264 14.8944C3.50726 15.0164 3.13182 14.9497 2.85826 14.7206C2.58465 14.491 2.45455 14.1329 2.51647 13.7811L3.71959 6.9579L3.75084 6.829C3.84395 6.53587 4.06851 6.29916 4.36217 6.19228ZM4.786 12.4218L8.04088 11.2372L5.38756 9.00966L4.786 12.4218ZM13.0809 5.90615C13.5812 4.03924 15.5002 2.93159 17.3671 3.43154L18.3329 3.69033C20.1995 4.19074 21.3085 6.10957 20.8085 7.97646L20.5497 8.94228C20.0494 10.8092 18.1295 11.918 16.2626 11.4179L15.2967 11.1591C13.4299 10.6587 12.3219 8.73902 12.8221 6.87197L13.0809 5.90615ZM16.8495 5.36318C16.0494 5.14908 15.2269 5.62385 15.0126 6.42372L14.7538 7.38954C14.5394 8.18955 15.0144 9.01189 15.8143 9.22646L16.7801 9.48525C17.5801 9.6994 18.4027 9.22467 18.6171 8.4247L18.8758 7.45888C19.0901 6.6589 18.6152 5.83652 17.8153 5.62197L16.8495 5.36318Z',
        fill: 'currentColor',
      }),
    }),
  React = je(ze(), 1);
function Breadcrumb({className, ...t}) {
  return (0, jsxRuntime.jsx)('nav', {
    'aria-label': 'breadcrumb',
    'data-slot': 'breadcrumb',
    className: b(className),
    ...t,
  });
}
function BreadcrumbList({className, ...t}) {
  return (0, jsxRuntime.jsx)('ol', {
    'data-slot': 'breadcrumb-list',
    className: b('text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word', className),
    ...t,
  });
}
function BreadcrumbItem({className, ...t}) {
  return (0, jsxRuntime.jsx)('li', {
    'data-slot': 'breadcrumb-item',
    className: b('inline-flex items-center gap-1', className),
    ...t,
  });
}
function BreadcrumbPage({className, ...t}) {
  return (0, jsxRuntime.jsx)('span', {
    'data-slot': 'breadcrumb-page',
    role: 'link',
    'aria-disabled': 'true',
    'aria-current': 'page',
    className: b('text-foreground font-normal', className),
    ...t,
  });
}
function BreadcrumbSeparator({children, className, ...n}) {
  return (0, jsxRuntime.jsx)('li', {
    'data-slot': 'breadcrumb-separator',
    role: 'presentation',
    'aria-hidden': 'true',
    className: b('[&>svg]:size-3.5', className),
    ...n,
    children: children ?? (0, jsxRuntime.jsx)(We, {}),
  });
}
var /** Share: a public snapshot link, or not shared. */
  ShareChat = () => {
    const [s, t] = (0, React.useState)(false),
      {copy} = we(),
      {accountId} = N(),
      {currentSession} = T(),
      o = ot(rt(), g => g.turns.length > 0),
      {capture} = se(),
      i = S(),
      c = {sessionId: currentSession.id, accountId},
      d = C(i.sessions.shareStatus.queryOptions(c, {enabled: s})),
      u = A(i.sessions.share.mutationOptions()),
      m = A(i.sessions.unshare.mutationOptions()),
      h = async () => {
        if (d.data)
          try {
            (await m.mutateAsync(c), await d.refetch(), L.success('Chat is no longer shared'));
          } catch (g) {
            L.error(g instanceof Error ? g.message : 'Failed to stop sharing this chat');
          }
      },
      f = async () => {
        if (!d.data)
          try {
            const g = await u.mutateAsync(c);
            if (!(await copy(g.url))) throw new Error('Clipboard is unavailable');
            (await d.refetch(), L.success('Share URL copied'), capture('tasks.share', {sessionId: currentSession.id}));
          } catch (g) {
            L.error(g instanceof Error ? g.message : 'Failed to share this chat');
          }
      },
      w = async () => {
        capture('tasks.share', {sessionId: currentSession.id});
      },
      v = shareBlockedReason(currentSession, o),
      x = u.isPending || m.isPending,
      j = !!d.data;
    return (0, jsxRuntime.jsxs)(Dt, {
      open: s,
      onOpenChange: t,
      children: [
        (0, jsxRuntime.jsxs)(M, {
          children: [
            (0, jsxRuntime.jsx)(D, {
              render: (0, jsxRuntime.jsxs)(kt, {
                render: (0, jsxRuntime.jsx)(I, {
                  'aria-label': 'Share chat',
                  className: 'text-muted-foreground h-8 max-sm:w-8 max-sm:p-0',
                  disabled: !!v,
                  size: 'sm',
                  variant: 'ghost',
                }),
                children: [
                  (0, jsxRuntime.jsx)(gt, {className: 'size-4'}),
                  (0, jsxRuntime.jsx)('span', {className: 'hidden sm:inline', children: 'Share'}),
                ],
              }),
            }),
            (0, jsxRuntime.jsx)(R, {children: v ?? 'Share chat'}),
          ],
        }),
        (0, jsxRuntime.jsxs)(Lt, {
          children: [
            (0, jsxRuntime.jsxs)(At, {
              children: [
                (0, jsxRuntime.jsx)(Et, {children: `Share "${currentSession.title || 'Untitled session'}"`}),
                (0, jsxRuntime.jsx)(Pt, {
                  children:
                    "A snapshot of this chat will be available to anyone with the link. Messages added later won't appear.",
                }),
              ],
            }),
            (0, jsxRuntime.jsx)('div', {
              className: '-m-6 mt-0 max-h-96 overflow-auto px-4 pb-4 [--mask-height:24px]',
              children: (0, jsxRuntime.jsxs)(ShareOptions, {
                children: [
                  (0, jsxRuntime.jsxs)(ShareOption, {
                    'aria-pressed': !j,
                    disabled: x || d.isPending,
                    onClick: h,
                    children: [
                      (0, jsxRuntime.jsx)(ft, {className: 'text-muted-foreground size-4 shrink-0'}),
                      (0, jsxRuntime.jsxs)('div', {
                        className: 'grow',
                        children: [
                          (0, jsxRuntime.jsx)('p', {
                            className: 'text-primary text-sm font-medium',
                            children: "Don't share",
                          }),
                          (0, jsxRuntime.jsx)('p', {
                            className: 'text-muted-foreground text-xs',
                            children: 'This chat will not be shared',
                          }),
                        ],
                      }),
                      !d.isPending && !j ? (0, jsxRuntime.jsx)(le, {className: 'size-4'}) : null,
                    ],
                  }),
                  (0, jsxRuntime.jsxs)(ShareOption, {
                    'aria-pressed': j,
                    disabled: x || d.isPending,
                    onClick: f,
                    children: [
                      (0, jsxRuntime.jsx)(ke, {className: 'text-muted-foreground size-4 shrink-0'}),
                      (0, jsxRuntime.jsxs)('div', {
                        className: 'grow',
                        children: [
                          (0, jsxRuntime.jsx)('p', {
                            className: 'text-primary text-sm font-medium',
                            children: 'Anyone with the link',
                          }),
                          (0, jsxRuntime.jsx)('p', {
                            className: 'text-muted-foreground text-xs',
                            children: 'Anyone with the link can view this chat',
                          }),
                        ],
                      }),
                      !d.isPending && j ? (0, jsxRuntime.jsx)(le, {className: 'size-4'}) : null,
                    ],
                  }),
                ],
              }),
            }),
            (0, jsxRuntime.jsx)(Nt, {
              children: (0, jsxRuntime.jsxs)(lt, {
                type: 'button',
                value: d.data?.url,
                disabled: x || d.isPending || !j,
                successMessage: 'Copied to clipboard!',
                onClick: w,
                children: [
                  (0, jsxRuntime.jsx)(it, {
                    className: '[&_svg]:text-primary-foreground!',
                    icon: (0, jsxRuntime.jsx)(LinkIcon, {}),
                  }),
                  'Copy link',
                ],
              }),
            }),
          ],
        }),
      ],
    });
  },
  ShareOptions = ({className = '', ...t}) =>
    (0, jsxRuntime.jsx)('div', {
      ...t,
      className: `bg-border space-y-hairline border-hairline overflow-hidden rounded-xl dark:space-y-px dark:border-transparent dark:bg-transparent ${className}`,
    }),
  ShareOption = ({className, children, ...n}) =>
    (0, jsxRuntime.jsx)('button', {
      ...n,
      type: 'button',
      className: b(
        'dark:hover:bg-muted relative flex min-w-0 rounded-lg transition-colors duration-75 hover:bg-muted disabled:cursor-default disabled:opacity-100',
        'dark:bg-secondary h-auto w-full flex-row items-center justify-start gap-3 rounded-none bg-background px-3 py-2 text-left',
        className,
      ),
      children,
    }) /** Why a chat cannot be shared yet, if it cannot. */,
  shareBlockedReason = (s, t) => {
    if (s.incognito) return 'Incognito chats cannot be shared';
    if (ye(s.status)) return 'Share this chat after it finishes';
    if (!t && s.messages.length === 0) return 'Send a message before sharing';
  },
  SIDE_PANEL_SIZE = {open: '320px'},
  ChatLayoutContext = (0, React.createContext)(null),
  ChatLayoutProvider = ({children}) =>
    (0, jsxRuntime.jsx)(ChatLayoutState, {
      children,
    }) /** The side panel: open or collapsed, locked while floating, and resized to match. */,
  ChatLayoutState = ({children}) => {
    const t = (0, React.useRef)(null),
      [n, r] = (0, React.useState)(false),
      [a, o] = (0, React.useState)(false),
      l = n ? 'collapsed' : 'open',
      i = (0, React.useCallback)(h => {
        r(f => (f === h ? f : h));
      }, []),
      c = (0, React.useCallback)(
        (h, f) => {
          if (h) {
            if (a || f === 'collapsed') {
              h.collapse();
              return;
            }
            (h.isCollapsed() && h.expand(), h.resize(SIDE_PANEL_SIZE[f]));
          }
        },
        [a],
      ),
      d = (0, React.useCallback)(
        h => {
          ((t.current = h), window.requestAnimationFrame(() => c(t.current, l)));
        },
        [l, c],
      ),
      u = (0, React.useCallback)(() => {
        if (n) {
          r(false);
          return;
        }
        r(true);
      }, [n]);
    (0, React.useLayoutEffect)(() => {
      c(t.current, l);
    }, [l, c]);
    const m = (0, React.useMemo)(
      () => ({
        sidePanelMode: l,
        sidePanelRef: t,
        setSidePanelDockLocked: o,
        setSidePanelRef: d,
        syncSidePanelCollapsed: i,
        toggleSidePanel: u,
      }),
      [d, l, i, u],
    );
    return (0, jsxRuntime.jsx)(ChatLayoutContext, {value: m, children});
  },
  useChatLayout = () => {
    const s = (0, React.use)(ChatLayoutContext);
    if (!s) throw new Error('useChatLayout must be used within ChatLayoutProvider');
    return s;
  }; /** Closes a tab Aux opened in its Agent Tabs group (optionally not the active one). */
async function closeAgentTab(s, t = {}) {
  t.signal?.throwIfAborted();
  const n = await chrome.tabs.get(s).catch(() => {});
  if (!n || n.groupId < 0) return false;
  const r = await chrome.tabGroups.get(n.groupId).catch(() => {});
  if (r?.title !== 'Agent Tabs') return false;
  const a = await chrome.tabs.get(s).catch(() => {});
  return (
    t.signal?.throwIfAborted(),
    a?.groupId !== r.id || (t.skipIfActive && a.active) ? false : (await chrome.tabs.remove(s), true)
  );
}
function throwIfAborted(s) {
  if (!s?.aborted) return;
  const t = new Error('Chrome tab command aborted');
  throw ((t.name = 'AbortError'), t);
}
var withoutHash = s => {
    try {
      const t = new URL(s);
      return ((t.hash = ''), t.toString());
    } catch {
      return s;
    }
  },
  pageAddress = s => {
    try {
      const t = new URL(s);
      return `${t.origin}${t.pathname}${t.search}`;
    } catch {
      return s;
    }
  };
async function focusTab(s, t) {
  throwIfAborted(t);
  const n = await chrome.tabs.update(s, {active: true});
  (throwIfAborted(t),
    chrome.windows?.update &&
      typeof n?.windowId == 'number' &&
      (await chrome.windows.update(n.windowId, {focused: true})));
}
async function tabIdForTarget(s, t) {
  if ((throwIfAborted(t), !s || !chrome.debugger?.getTargets)) return;
  const n = await chrome.debugger.getTargets().catch(() => []);
  return (throwIfAborted(t), n.find(r => r.id === s && typeof r.tabId == 'number')?.tabId);
}
async function targetIdForTab(s, t) {
  if ((throwIfAborted(t), !chrome.debugger?.getTargets)) return;
  const n = await chrome.debugger.getTargets().catch(() => []);
  return (throwIfAborted(t), n.find(r => r.tabId === s && typeof r.id == 'string')?.id);
} /** Focuses the tab for a target or an open tab with the same page, or opens one. */
async function openChromeTab(s, t, n) {
  if ((throwIfAborted(t), !chrome.tabs?.create || !chrome.tabs.update || !chrome.tabs.query))
    throw new Error('Chrome tabs API is unavailable');
  const r = await tabIdForTarget(s.targetId, t);
  if (typeof r == 'number')
    try {
      return (
        await focusTab(r, t),
        {action: 'open', created: false, tabId: r, targetId: (await targetIdForTab(r, t)) ?? s.targetId}
      );
    } catch {
      throwIfAborted(t);
    }
  const a = withoutHash(s.url),
    o = pageAddress(s.url),
    l = await chrome.tabs.query(n === void 0 ? {} : {windowId: n});
  throwIfAborted(t);
  const i = l.find(d => {
    if (typeof d.id != 'number') return false;
    const u = d.url ?? d.pendingUrl;
    return u ? withoutHash(u) === a || pageAddress(u) === o : false;
  });
  if (typeof i?.id == 'number')
    try {
      return (
        await focusTab(i.id, t),
        {action: 'open', created: false, tabId: i.id, targetId: (await targetIdForTab(i.id, t)) ?? s.targetId}
      );
    } catch {
      throwIfAborted(t);
    }
  throwIfAborted(t);
  const c = await chrome.tabs.create({url: s.url, active: true, ...(n !== void 0 ? {windowId: n} : {})});
  if (
    (throwIfAborted(t),
    chrome.windows?.update &&
      typeof c.windowId == 'number' &&
      (await chrome.windows.update(c.windowId, {focused: true})),
    typeof c.id != 'number')
  )
    throw new Error(`Failed to create Chrome tab for ${s.url}`);
  return {action: 'open', created: true, tabId: c.id, targetId: (await targetIdForTab(c.id, t)) ?? s.targetId};
}
async function closeChromeTab(s, t) {
  if ((throwIfAborted(t), !chrome.tabs?.remove || !chrome.tabs.get || !chrome.tabGroups?.get))
    throw new Error('Chrome tabs API is unavailable');
  const n = await tabIdForTarget(s.targetId, t);
  return typeof n != 'number'
    ? {action: 'close', closed: false, targetId: s.targetId}
    : {
        action: 'close',
        closed: await closeAgentTab(n, {signal: t, skipIfActive: s.skipIfActive}),
        tabId: n,
        targetId: s.targetId,
      };
} /** Opens or closes a session tab through the tabs API. */
async function controlChromeTab(s, t, n) {
  return s.action === 'open' ? await openChromeTab(s, t, n) : await closeChromeTab(s, t);
}
var TAB_QUERY_OPTIONS = {staleTime: 3e4, refetchOnWindowFocus: false},
  TAB_POLL_MS = 2e3,
  TAB_REFRESH_DELAY_MS = 500,
  TAB_EVENTS = new Set(['browser:navigation', 'browser:popup', 'browser:snapshot']),
  BrowserEvent = E({
    op: ee('event'),
    name: yt(['browser:alert', 'browser:download', 'browser:navigation', 'browser:popup', 'browser:snapshot']),
    data: wt([bt(G(), jt()), E({session: E({id: G()})})]),
  }),
  TabsUpdatedEvent = E({op: ee('event'), name: ee('session:tabs-updated'), data: E({sessionId: G()})});
function isLiveStatus(s) {
  return s === 'running' || s === 'suspended';
}
function tabTitle(s) {
  return s.title || (s.url ? _t(s.url) : 'Loading tab');
} /** Refreshes the session tabs when the browser reports a change. */
function TabEvents({sessionId, accountId}) {
  const n = S(),
    r = (0, React.useRef)(null);
  return (
    oe({
      path: `event-bus?pattern=${encodeURIComponent('browser:*')}`,
      accountId,
      schema: BrowserEvent,
      onMessage({client, message}) {
        message.data[1].session.id !== sessionId ||
          !TAB_EVENTS.has(message.name) ||
          r.current ||
          (r.current = setTimeout(() => {
            ((r.current = null), client.invalidateQueries(n.sessions.tabs.list.queryFilter({sessionId, accountId})));
          }, TAB_REFRESH_DELAY_MS));
      },
    }),
    oe({
      path: `event-bus?pattern=${encodeURIComponent('session:tabs-updated')}`,
      accountId,
      schema: TabsUpdatedEvent,
      onMessage({client, message}) {
        message.data.sessionId !== sessionId ||
          r.current ||
          (r.current = setTimeout(() => {
            ((r.current = null), client.invalidateQueries(n.sessions.tabs.list.queryFilter({sessionId, accountId})));
          }, TAB_REFRESH_DELAY_MS));
      },
    }),
    (0, React.useEffect)(
      () => () => {
        r.current && (clearTimeout(r.current), (r.current = null));
      },
      [],
    ),
    null
  );
}
function useSessionTabs(s, t, n, r = {}) {
  const a = S(),
    o = r.enabled ?? true;
  return C(
    a.sessions.tabs.list.queryOptions(
      {sessionId: s, accountId: n},
      {...TAB_QUERY_OPTIONS, enabled: o, refetchInterval: o && isLiveStatus(t) ? TAB_POLL_MS : false},
    ),
  );
} /** Opens or closes a session tab: through the tabs API when it can, then Aux.controlTab, then a new window. */
function useTabControl(s, t) {
  const n = S(),
    r = te(),
    a = A(
      n.sessions.tabs.remove.mutationOptions({
        onSettled: () => {
          r.invalidateQueries(n.sessions.tabs.list.queryFilter({sessionId: s, accountId: t}));
        },
      }),
    ),
    o = async () => {
      await r.invalidateQueries(n.sessions.tabs.list.queryFilter({sessionId: s, accountId: t}));
    },
    l = async c => {
      await a.mutateAsync({sessionId: s, sessionTabId: c.sessionTabId, accountId: t});
    };
  return {
    controlTabInBrowser: async (c, d) => {
      if (c.action === 'close' && d?.ownership === 'borrowed') {
        await l(d);
        return;
      }
      if (canControlChromeTabs(c))
        try {
          const u = await controlChromeTab(c);
          if (u.action === 'open' || u.closed) {
            await o();
            return;
          }
        } catch (u) {
          console.error(u);
        }
      try {
        (await Cs({method: 'Aux.controlTab', params: c}), await o());
        return;
      } catch (u) {
        console.error(u);
      }
      c.action === 'open' && window.open(c.url, '_blank')?.focus();
    },
  };
}
var /** The tabs the agent opened for this session, newest first. */
  SessionTabs = ({enabled = true}) => {
    const {currentSession} = T(),
      {sidePanelMode} = useChatLayout(),
      {accountId} = N(),
      {controlTabInBrowser} = useTabControl(currentSession.id, accountId),
      {data = []} = useSessionTabs(currentSession.id, currentSession.status, accountId, {enabled}),
      {tabs} = Ie(data, currentSession.activeTabTargetId),
      i = tabs
        .filter(m => m.ownership === 'owned')
        .sort((m, h) => new Date(h.createdAt).getTime() - new Date(m.createdAt).getTime()),
      c = m => async h => {
        (h.stopPropagation(), await controlTabInBrowser({action: 'close', targetId: m.targetId, url: m.url}, m));
      },
      d = m => async () => {
        m.targetId && (await controlTabInBrowser({action: 'open', targetId: m.targetId, url: m.url}, m));
      },
      u = m => async h => {
        h.target !== h.currentTarget || (h.key !== 'Enter' && h.key !== ' ') || (h.preventDefault(), await d(m)());
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(TabEvents, {sessionId: currentSession.id, accountId}),
        i.map(m => {
          const h = !!m.targetId,
            f = {
              item: m,
              previewEnabled: enabled && sidePanelMode !== 'collapsed',
              canSwitchToTab: h,
              onActivate: d(m),
              onKeyDownActivate: u(m),
              onClose: c(m),
            };
          return h
            ? (0, jsxRuntime.jsxs)(
                M,
                {
                  children: [
                    (0, jsxRuntime.jsx)(D, {render: (0, jsxRuntime.jsx)(TabPreview, {...f})}),
                    (0, jsxRuntime.jsx)(R, {children: 'Switch to tab'}),
                  ],
                },
                m.sessionTabId,
              )
            : (0, jsxRuntime.jsx)(TabPreview, {...f}, m.sessionTabId);
        }),
      ],
    });
  }; /** A live preview of an agent tab, with its title and close button. */
function TabPreview({item, previewEnabled, canSwitchToTab, onActivate, onKeyDownActivate, onClose}) {
  const [l, i] = (0, React.useState)(null),
    c = tabTitle(item);
  return (0, jsxRuntime.jsx)('div', {
    className: 'ring-border-surface-strong relative overflow-hidden rounded-xl shadow-lg ring-[0.5px]',
    children: (0, jsxRuntime.jsxs)('div', {
      className: b('bg-surface-primary relative w-full overflow-hidden', canSwitchToTab && 'cursor-pointer'),
      role: canSwitchToTab ? 'button' : void 0,
      tabIndex: canSwitchToTab ? 0 : void 0,
      onClick: onActivate,
      onKeyDown: onKeyDownActivate,
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className:
            'absolute top-0 left-0 z-1 flex h-8 w-full items-center gap-1.5 bg-black/20 py-0.5 pr-1 pl-3 backdrop-blur-lg',
          children: [
            (0, jsxRuntime.jsx)(TabFavicon, {url: item.url, faviconUrl: item.iconUrl}),
            (0, jsxRuntime.jsx)('p', {
              className: b(
                'm-0! grow truncate text-left text-[13px] font-medium',
                l === 'light' ? 'text-black' : l === 'dark' ? 'text-white' : 'text-primary',
              ),
              children: c,
            }),
            (0, jsxRuntime.jsx)(I, {
              className: b(
                'size-6 rounded-md',
                l === 'light' && 'text-black hover:text-black',
                l === 'dark' && 'text-white hover:text-white',
              ),
              variant: 'ghost',
              size: 'icon',
              onClick: onClose,
              children: (0, jsxRuntime.jsx)(ct, {}),
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(qt, {
          className: 'pointer-events-none',
          targetId: item.targetId,
          title: c,
          enabled: previewEnabled,
          onTopToneChange: i,
        }),
      ],
    }),
  });
}
function TabFavicon({url, faviconUrl}) {
  const n = Mt(url, faviconUrl),
    [r, a] = (0, React.useState)(0),
    o = n[r];
  return (
    (0, React.useEffect)(() => {
      a(0);
    }, [url, faviconUrl]),
    (0, jsxRuntime.jsxs)(Tt, {
      className: 'size-3.5 rounded-xs',
      children: [
        o
          ? (0, jsxRuntime.jsx)(
              It,
              {
                src: o,
                onLoadingStatusChange: l => {
                  l === 'error' && a(i => (i < n.length - 1 ? i + 1 : i));
                },
              },
              o,
            )
          : null,
        (0, jsxRuntime.jsx)(St, {
          className: 'bg-transparent',
          children: (0, jsxRuntime.jsx)(ke, {className: 'text-foreground size-[14px] opacity-55'}),
        }),
      ],
    })
  );
}
var canControlChromeTabs = s =>
    typeof chrome > 'u'
      ? false
      : s.action === 'open'
        ? typeof chrome.tabs?.create == 'function' &&
          typeof chrome.tabs.update == 'function' &&
          typeof chrome.tabs.query == 'function'
        : typeof chrome.tabs?.remove == 'function' && typeof chrome.tabs.query == 'function',
  SIDE_PANEL_WIDTH = {DEFAULT: '320px', MAX: '480px'},
  DOCKED_MIN_WIDTH = 1024,
  WIDE_MIN_WIDTH = 700,
  PinnedSummaryContext = (0, React.createContext)(
    null,
  ) /** Whether the pinned summary docks beside the chat (wide layouts) or floats under its toggle. */,
  PinnedSummaryProvider = ({children}) => {
    const [t, n] = (0, React.useState)(null),
      r = (0, React.useRef)(null),
      [a, o] = (0, React.useState)(null),
      [l, i] = (0, React.useState)(false);
    (0, React.useLayoutEffect)(() => {
      if (!a) return;
      const d = m => i(m >= DOCKED_MIN_WIDTH);
      d(a.getBoundingClientRect().width);
      const u = new ResizeObserver(([m]) => {
        m && d(m.contentRect.width);
      });
      return (u.observe(a), () => u.disconnect());
    }, [a]);
    const c = (0, React.useMemo)(
      () => ({
        floatAnchorElement: t,
        floatShellRef: r,
        isDocked: l,
        layoutElement: a,
        setFloatAnchorElement: n,
        setLayoutElement: o,
      }),
      [t, l, a],
    );
    return (0, jsxRuntime.jsx)(PinnedSummaryContext, {value: c, children});
  },
  usePinnedSummary = () => {
    const s = (0, React.use)(PinnedSummaryContext);
    if (!s) throw new Error('usePinnedSummary must be used within PinnedSummaryProvider');
    return s;
  },
  PANEL_TRANSITION =
    '**:data-[slot=resizable-panel]:transition-[flex-grow] **:data-[slot=resizable-panel]:duration-200 **:data-[slot=resizable-panel]:ease-out motion-reduce:**:data-[slot=resizable-panel]:transition-none',
  ChatPanels = ({children}) => {
    const {setLayoutElement} = usePinnedSummary();
    return (0, jsxRuntime.jsx)(gs, {
      className: b('min-h-0 flex-1', PANEL_TRANSITION),
      elementRef: setLayoutElement,
      children,
    });
  },
  ChatPanel = ({children}) =>
    (0, jsxRuntime.jsx)(Se, {id: 'default', children}) /** The docked side panel the pinned summary sits in. */,
  SidePanel = ({children}) => {
    const {setSidePanelRef, sidePanelMode, syncSidePanelCollapsed} = useChatLayout(),
      [a, o] = (0, React.useState)(false),
      {isDocked} = usePinnedSummary(),
      i = sidePanelMode !== 'collapsed',
      c = !isDocked && i,
      d = isDocked && i;
    return (
      (0, React.useEffect)(() => {
        if (!i) {
          o(false);
          return;
        }
        const u = window.requestAnimationFrame(() => {
          o(true);
        });
        return () => window.cancelAnimationFrame(u);
      }, [i]),
      (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsx)(vs, {
            withHandle: true,
            className: b(
              'bg-transparent transition-[width,opacity] duration-200 ease-out **:data-[slot=resizable-handle-handle]:opacity-0 hover:**:data-[slot=resizable-handle-handle]:opacity-100! motion-reduce:transition-none',
              d ? 'w-1.5' : 'pointer-events-none w-0! overflow-hidden opacity-0 after:hidden',
            ),
          }),
          (0, jsxRuntime.jsx)(Se, {
            id: 'side-panel',
            className: b('relative flex text-right', c ? 'min-w-0! overflow-visible!' : 'overflow-hidden!'),
            panelRef: setSidePanelRef,
            defaultSize: SIDE_PANEL_WIDTH.DEFAULT,
            maxSize: isDocked ? SIDE_PANEL_WIDTH.MAX : '0px',
            minSize: isDocked && i ? SIDE_PANEL_WIDTH.DEFAULT : '0px',
            collapsedSize: '0px',
            collapsible: true,
            groupResizeBehavior: 'preserve-pixel-size',
            onResize: (u, m, h) => {
              if (isDocked) {
                if (u.inPixels <= 0) {
                  h && h.inPixels > 0 && syncSidePanelCollapsed(true);
                  return;
                }
                h && h.inPixels <= 0 && syncSidePanelCollapsed(false);
              }
            },
            children: (0, jsxRuntime.jsx)('div', {
              className: b(
                'relative h-full w-full grow text-left',
                c ? 'overflow-x-visible overflow-y-visible' : 'overflow-hidden',
              ),
              style: {minWidth: isDocked && i ? SIDE_PANEL_WIDTH.DEFAULT : 0},
              children: (0, jsxRuntime.jsx)('div', {
                className: b(
                  'h-full w-full grow translate-x-2 space-y-2.5 px-2.5 py-2 opacity-0 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                  c ? 'overflow-visible' : 'overflow-y-auto',
                  a && 'translate-x-0 opacity-100',
                ),
                children,
              }),
            }),
          }),
        ],
      })
    );
  },
  useIsWide = () => (0, React.useSyncExternalStore)(subscribeToWidth, isWide, () => false);
function subscribeToWidth(s) {
  if (typeof window > 'u') return () => {};
  const t = wideQuery();
  return (t.addEventListener('change', s), () => t.removeEventListener('change', s));
}
function isWide() {
  return typeof window > 'u' ? false : wideQuery().matches;
}
function wideQuery() {
  return window.matchMedia(`(min-width: ${WIDE_MIN_WIDTH}px)`);
}
var ReactDOM = je(qe(), 1) /** A standalone routine: status, repeat, last and next run, device. */,
  RoutineDetails = ({routineId}) => {
    const {accountId} = N(),
      {host} = Z(),
      r = S(),
      {data: a} = C(r.routines.summary.queryOptions({accountId, routineId}, {enabled: host.kind === 'local'})),
      {data, isLoading} = C(
        r.accounts.auth.devices.queryOptions(
          {accountId},
          {
            enabled: host.kind === 'local' && a?.environment === 'device' && !!a.deviceId && !a.isCurrentDevice,
            staleTime: 3e5,
            retry: false,
          },
        ),
      );
    if (!a || a.status === 'deleted') return null;
    const i = data?.find(c => c.id === a.deviceId);
    return (0, jsxRuntime.jsxs)('section', {
      className:
        'ring-border-surface-strong bg-surface-secondary group-data-floated/floated:bg-surface-primary flex flex-col gap-2 overflow-hidden rounded-xl p-1.5 shadow-lg ring-[0.5px]',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex h-6 shrink-0 items-center gap-1 pr-1 pl-2',
          children: [
            (0, jsxRuntime.jsx)('h3', {
              className: 'text-muted-foreground grow text-[13px] leading-none font-medium select-none',
              children: 'Routine details',
            }),
            (0, jsxRuntime.jsx)(Pe, {
              routine: a,
              trigger: (0, jsxRuntime.jsx)(I, {
                variant: 'ghost',
                size: 'icon-xs',
                className: 'text-muted-foreground',
                'aria-label': 'Routine actions',
              }),
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)('dl', {
          className:
            '[&_dt]:text-muted-foreground px-2 text-[13px] select-none [&_dd]:min-w-0 [&_dd]:text-right [&_dt]:shrink-0 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-3 [&>div]:py-1.5',
          children: [
            (0, jsxRuntime.jsxs)('div', {
              children: [
                (0, jsxRuntime.jsx)('dt', {children: 'Status'}),
                (0, jsxRuntime.jsxs)('dd', {
                  className: b('flex items-center gap-1.5', {
                    'text-green-600 dark:text-green-400': a.status === 'active',
                    'text-blue-600 dark:text-blue-400': a.status === 'completed',
                    'text-muted-foreground': a.status === 'paused',
                  }),
                  children: [
                    a.status === 'paused'
                      ? (0, jsxRuntime.jsx)(xt, {className: 'size-3'})
                      : (0, jsxRuntime.jsx)('span', {className: 'size-1.5 rounded-full bg-current'}),
                    a.status === 'active' ? 'Active' : a.status === 'completed' ? 'Completed' : 'Paused',
                  ],
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              children: [(0, jsxRuntime.jsx)('dt', {children: 'Repeat'}), (0, jsxRuntime.jsx)('dd', {children: Te(a)})],
            }),
            (0, jsxRuntime.jsxs)('div', {
              children: [
                (0, jsxRuntime.jsx)('dt', {children: 'Last run'}),
                (0, jsxRuntime.jsx)('dd', {
                  children: (0, jsxRuntime.jsx)(RunTime, {datetime: a.lastRunAt, empty: 'Not run yet'}),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              children: [
                (0, jsxRuntime.jsx)('dt', {children: 'Next run'}),
                (0, jsxRuntime.jsx)('dd', {
                  children: (0, jsxRuntime.jsx)(RunTime, {datetime: a.nextRunAt, empty: 'Not scheduled'}),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              children: [
                (0, jsxRuntime.jsx)('dt', {children: 'Runs on'}),
                (0, jsxRuntime.jsx)('dd', {
                  className: 'flex items-center gap-1.5',
                  children: (0, jsxRuntime.jsx)(tt, {
                    environment: a.environment,
                    deviceName: i?.deviceName,
                    isCurrent: i?.isCurrent ?? a.isCurrentDevice === true,
                    loading: isLoading,
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  RunTime = ({datetime, empty}) =>
    datetime
      ? (0, jsxRuntime.jsxs)(M, {
          children: [
            (0, jsxRuntime.jsx)(D, {
              render: (0, jsxRuntime.jsx)('time', {dateTime: datetime}),
              children: (0, jsxRuntime.jsx)(rs, {datetime}),
            }),
            (0, jsxRuntime.jsx)(R, {children: (0, Ct.default)(datetime).format('MMM D, YYYY, h:mm:ss A')}),
          ],
        })
      : (0, jsxRuntime.jsx)('span', {
          className: 'text-muted-foreground',
          children: empty,
        }) /** Routines started from this chat. */,
  SessionRoutines = () => {
    const {currentSession} = T(),
      {accountId} = N(),
      {host} = Z(),
      r = S(),
      {data = []} = C(
        r.routines.list.queryOptions(
          {accountId, parentSessionId: currentSession.id},
          {enabled: host.kind === 'local' && currentSession.trigger?.type !== 'standalone-routine'},
        ),
      );
    return currentSession.trigger?.type === 'standalone-routine' || !data.length
      ? null
      : (0, jsxRuntime.jsxs)('section', {
          className:
            'ring-border-surface-strong bg-surface-secondary group-data-floated/floated:bg-surface-primary flex max-h-[280px] flex-col gap-2 overflow-hidden rounded-xl p-1.5 shadow-lg ring-[0.5px]',
          children: [
            (0, jsxRuntime.jsx)('div', {
              className: 'flex h-6 shrink-0 items-center gap-1 pr-1 pl-2',
              children: (0, jsxRuntime.jsx)('h3', {
                className: 'text-muted-foreground text-[13px] leading-none font-medium select-none',
                children: 'Routines',
              }),
            }),
            (0, jsxRuntime.jsx)('div', {
              className: 'min-h-0 overflow-y-auto',
              children: (0, jsxRuntime.jsx)('div', {
                className: 'divide-border-surface-strong divide-y',
                children: data.map(o =>
                  (0, jsxRuntime.jsx)(
                    Pe,
                    {
                      routine: o,
                      children: (0, jsxRuntime.jsxs)('div', {
                        className: 'flex items-center gap-2.5 py-2 pr-10 pl-2',
                        children: [
                          (0, jsxRuntime.jsx)(Ts, {
                            className: 'text-muted-foreground size-4 shrink-0',
                            'aria-hidden': true,
                          }),
                          (0, jsxRuntime.jsxs)('div', {
                            className: 'min-w-0',
                            children: [
                              (0, jsxRuntime.jsx)('h4', {
                                className: 'truncate text-[13px] font-medium',
                                title: o.name,
                                children: o.name,
                              }),
                              (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs', children: Te(o)}),
                            ],
                          }),
                        ],
                      }),
                    },
                    o.id,
                  ),
                ),
              }),
            }),
          ],
        });
  },
  BUNDLE_EXTENSIONS = [
    '.app',
    '.appex',
    '.bundle',
    '.framework',
    '.plugin',
    '.xpc',
  ]; /** Output paths as a tree: folders first, app bundles as files. */
function fileTree(s) {
  const t = {children: [], name: '', path: '', type: 'directory'};
  for (const n of s) {
    if (!ds(n)) {
      t.children.push({children: [], data: n, name: ls(n), path: n, type: 'file'});
      continue;
    }
    const r = n.split('/').slice(1);
    let a = t;
    for (let o = 0; o < r.length; o += 1) {
      const l = r[o],
        i = ['artifacts', ...r.slice(0, o + 1)].join('/'),
        c = isBundle(l),
        d = (o === r.length - 1 && !c) || c ? 'file' : 'directory';
      let u = a.children.find(m => m.path === i);
      if (
        (u || ((u = {children: [], name: l, path: i, type: d}), d === 'file' && (u.data = i), a.children.push(u)),
        d === 'file')
      )
        break;
      a = u;
    }
  }
  return (sortTree(t), t.children);
}
function sortTree(s) {
  s.children.sort((t, n) => (t.type !== n.type ? (t.type === 'directory' ? -1 : 1) : t.name.localeCompare(n.name)));
  for (const t of s.children) sortTree(t);
}
function isBundle(s) {
  const t = s.toLowerCase();
  return BUNDLE_EXTENSIONS.some(n => t.endsWith(n));
}
var /** The files the session wrote. */
  SessionOutputs = ({enabled = true, previewFiles}) => {
    const {currentSession} = T(),
      r = Os(),
      a = us(),
      o = currentSession.status === 'running' || currentSession.status === 'suspended',
      {accountId} = N(),
      i = S(),
      c = C(
        i.sessions.files.list.queryOptions(
          {sessionId: currentSession.id, accountId},
          {
            enabled: enabled && !previewFiles,
            refetchInterval: a && o ? 5e3 : false,
            staleTime: Number.POSITIVE_INFINITY,
          },
        ),
      ),
      d = previewFiles?.map(x => x.metadata.path) ?? c.data,
      u = (0, React.useMemo)(() => (d ?? []).filter(Ce), [d]),
      m = (0, React.useMemo)(() => fileTree(u), [u]),
      h = (0, React.useMemo)(() => new Map(previewFiles?.map(x => [x.metadata.path, x])), [previewFiles]),
      f = u.some(x => x.startsWith('artifacts/')) ? 'artifacts' : 'output',
      w = (0, React.useCallback)(
        x => {
          (x.stopPropagation(), r(f));
        },
        [f, r],
      );
    if (u.length === 0) return null;
    const v = `Show in ${Rt().name}`;
    return (0, jsxRuntime.jsxs)('div', {
      className:
        'ring-border-surface-strong bg-surface-secondary group-data-floated/floated:bg-surface-primary flex max-h-[280px] flex-col gap-2 overflow-hidden rounded-xl p-1.5 shadow-lg ring-[0.5px]',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex h-6 shrink-0 items-center justify-between gap-1 pr-1 pl-2',
          children: [
            (0, jsxRuntime.jsx)('p', {
              className: 'text-muted-foreground text-[13px] leading-none font-medium select-none',
              children: 'Outputs',
            }),
            !previewFiles &&
              (0, jsxRuntime.jsxs)(M, {
                children: [
                  (0, jsxRuntime.jsx)(D, {
                    render: (0, jsxRuntime.jsx)(I, {
                      className: 'text-muted-foreground',
                      variant: 'ghost',
                      size: 'icon-sm',
                      'aria-label': v,
                      onClick: w,
                    }),
                    children: (0, jsxRuntime.jsx)(Is, {}),
                  }),
                  (0, jsxRuntime.jsx)(R, {children: v}),
                ],
              }),
          ],
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'min-h-0 overflow-y-auto',
          children: (0, jsxRuntime.jsx)(OutputFiles, {
            nodes: m,
            previewFilesByPath: h,
            sessionId: currentSession.id,
            osActionsEnabled: !previewFiles,
            onOpenFile: r,
          }),
        }),
      ],
    });
  },
  OutputFiles = ({nodes, previewFilesByPath, sessionId, osActionsEnabled, onOpenFile}) =>
    (0, jsxRuntime.jsx)('div', {
      className: 'flex flex-wrap gap-1.5',
      children: nodes.map(o => {
        const l = o.type === 'file' ? o.data : o.path;
        if (!l) return null;
        const i = previewFilesByPath.get(l);
        return (0, jsxRuntime.jsx)(
          Us,
          {
            path: l,
            enabled: osActionsEnabled,
            children: (0, jsxRuntime.jsx)(I, {
              className: 'h-auto px-2 py-1 whitespace-normal',
              variant: 'ghost',
              onClick: () => onOpenFile(l),
              children: i
                ? (0, jsxRuntime.jsx)(ce, {path: l, previewUrl: i.previewUrl ?? ''})
                : (0, jsxRuntime.jsx)(ce, {path: l, sessionId}),
            }),
          },
          o.path,
        );
      }),
    }),
  FLOAT_INSET = 16 /** The pinned summary: docked in the side panel, or floating under its toggle. */,
  PinnedSummary = ({enabled = true, previewFiles}) => {
    const {floatAnchorElement, floatShellRef, isDocked, layoutElement} = usePinnedSummary(),
      {sidePanelMode, setSidePanelDockLocked, syncSidePanelCollapsed} = useChatLayout(),
      {mode} = Ne(),
      [u, m] = (0, React.useState)(),
      h = mode !== 'collapsed',
      f = !isDocked && sidePanelMode !== 'collapsed';
    ((0, React.useLayoutEffect)(() => {
      setSidePanelDockLocked(!isDocked);
    }, [isDocked, setSidePanelDockLocked]),
      (0, React.useLayoutEffect)(() => {
        h && syncSidePanelCollapsed(true);
      }, [h, syncSidePanelCollapsed]),
      (0, React.useLayoutEffect)(() => {
        if (!f || !floatAnchorElement) {
          m(void 0);
          return;
        }
        const j = 320,
          g = () => {
            const O = floatAnchorElement.getBoundingClientRect(),
              U = O.right - j - FLOAT_INSET,
              H = O.bottom + 8 - FLOAT_INSET,
              $ = 352;
            m(k =>
              k?.left === U && k.top === H && k.width === $
                ? k
                : {
                    position: 'fixed',
                    top: H,
                    left: U,
                    width: $,
                    paddingTop: FLOAT_INSET,
                    paddingRight: FLOAT_INSET,
                    paddingBottom: FLOAT_INSET,
                    paddingLeft: FLOAT_INSET,
                    maxHeight: `calc(100vh - ${O.bottom + 16 - FLOAT_INSET}px)`,
                    zIndex: 50,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                  },
            );
          };
        (g(), window.addEventListener('resize', g), window.visualViewport?.addEventListener('resize', g));
        const _ = new ResizeObserver(g);
        layoutElement && _.observe(layoutElement);
        const q = floatAnchorElement.closest('nav');
        return (
          q && _.observe(q),
          () => {
            (window.removeEventListener('resize', g),
              window.visualViewport?.removeEventListener('resize', g),
              _.disconnect());
          }
        );
      }, [floatAnchorElement, f, layoutElement]));
    const w = (0, jsxRuntime.jsx)(PinnedSummaryCards, {enabled, previewFiles}),
      v = (0, jsxRuntime.jsx)('div', {className: 'flex flex-col gap-4', children: w}),
      x = (0, jsxRuntime.jsx)('div', {
        ref: floatShellRef,
        className: b(
          'flex flex-col gap-4',
          'group/floated scrollbar-none transition-[left,top,max-height,width,opacity] duration-200 ease-out [-ms-overflow-style:none] *:shrink-0 motion-reduce:transition-none [&::-webkit-scrollbar]:hidden',
        ),
        'data-floated': '',
        style: u,
        children: w,
      });
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(SidePanel, {children: isDocked ? v : null}),
        f && u && typeof document < 'u' && (0, ReactDOM.createPortal)(x, document.body),
      ],
    });
  },
  PinnedSummaryCards = ({enabled = true, previewFiles}) => {
    const {can} = Z(),
      {currentSession} = T();
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        currentSession.trigger?.type === 'standalone-routine'
          ? (0, jsxRuntime.jsx)(RoutineDetails, {routineId: currentSession.trigger.routineId})
          : (0, jsxRuntime.jsx)(SessionRoutines, {}),
        (0, jsxRuntime.jsx)(SessionOutputs, {enabled, previewFiles}),
        (0, jsxRuntime.jsx)(SessionTabs, {enabled: enabled && can('tabs')}),
      ],
    });
  },
  hasPinnedContent = ({files, tabs}) => files.some(Ce) || tabs.some(n => n.ownership === 'owned'),
  TaskDetailContext = (0, React.createContext)(null),
  PLAYGROUND_ENABLED = false,
  PLAYGROUND_DEFAULTS = {outputArtifacts: false, streaming: false, subagentSeed: 0, subagents: false, todoList: false},
  PLAYGROUND_SWITCHES = [
    {key: 'streaming', label: 'Streaming'},
    {key: 'todoList', label: 'Todo list'},
    {key: 'subagents', label: 'Subagents'},
    {key: 'outputArtifacts', label: 'Output artifacts'},
  ],
  PLAYGROUND_MARKDOWN = `# Task result

This preview is rendered by the same output-artifact component as a real task.

- Latest session transcript stays real
- Playground state stays local
- No daemon data is changed
`,
  PLAYGROUND_CSV = `Item,Status,Owner
Research,Complete,Main agent
Browser task,In progress,Subagent
Summary,Pending,Main agent
`;
(`${encodeURIComponent(PLAYGROUND_MARKDOWN)}`,
  PLAYGROUND_MARKDOWN.length,
  `${encodeURIComponent(PLAYGROUND_CSV)}`,
  PLAYGROUND_CSV.length);
var /** The task page: session, layout and pinned summary providers around the header and the chat. */
  TaskDetail = s => {
    const {sessionId, userId, playground, navigateToSession} = s,
      o = S(),
      l = useSessionReady(sessionId),
      [i, c] = (0, React.useState)(PLAYGROUND_DEFAULTS),
      d = PLAYGROUND_ENABLED,
      {data: u} = bs(o.sessions.get.queryOptions({sessionId, accountId: Number(userId)})),
      {data = []} = C(
        o.sessions.listPreviewItems.queryOptions(
          {accountId: Number(userId), limit: 20, order: 'desc', parent: 'all'},
          {enabled: d},
        ),
      ),
      h = (0, React.useMemo)(() => {
        if (!i.subagents) return [];
        const v = data.filter(j => j.id !== sessionId),
          x = v.length > 0 ? i.subagentSeed % v.length : 0;
        return [...v.slice(x), ...v.slice(0, x)]
          .slice(0, 3)
          .map((j, g) => ({
            sessionId: j.id,
            description: j.title || `Subagent ${g + 1}`,
            model: u.model,
            isRunning: g === 0,
            isBackground: true,
          }));
      }, [i.subagentSeed, i.subagents, u.model, sessionId, data]),
      f = void 0;
    const w = (0, React.useCallback)(
      v => navigateToSession(v, {projectId: u.projectId}),
      [navigateToSession, u.projectId],
    );
    return (0, jsxRuntime.jsx)(TaskDetailContext, {
      value: s,
      children: (0, jsxRuntime.jsx)(at, {
        sessionId,
        sessionTransform: void 0,
        chatStatusOverride: void 0,
        onSessionChange: w,
        children: (0, jsxRuntime.jsx)(ChatLayoutProvider, {
          children: (0, jsxRuntime.jsx)(Js, {
            sessionId,
            previewFiles: f,
            children: (0, jsxRuntime.jsxs)(PinnedSummaryProvider, {
              children: [
                (0, jsxRuntime.jsx)(PinnedSummaryAutoOpen, {filesOverride: void 0}),
                (0, jsxRuntime.jsx)(TaskDocumentTitle, {}),
                (0, jsxRuntime.jsx)(Es, {
                  children: (0, jsxRuntime.jsxs)('div', {
                    className: 'flex h-full w-full flex-col',
                    children: [
                      (0, jsxRuntime.jsx)(TaskHeader, {playgroundOptions: void 0, onPlaygroundOptionsChange: c}),
                      (0, jsxRuntime.jsxs)(ChatPanels, {
                        children: [
                          (0, jsxRuntime.jsx)(ChatPanel, {children: (0, jsxRuntime.jsx)(TaskChat, {})}),
                          (0, jsxRuntime.jsx)(PinnedSummary, {enabled: l, previewFiles: f}),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          }),
        }),
      }),
    });
  };
function useTaskDetail() {
  const s = (0, React.use)(TaskDetailContext);
  if (!s) throw new Error('useTaskDetail must be used within TaskDetail');
  return s;
}
var TaskDocumentTitle = () => {
    const {currentSession} = T();
    return (0, jsxRuntime.jsx)($t, {title: currentSession.title || 'Tasks'});
  },
  CRUMB_CLASS =
    'text-surface-primary-foreground h-auto min-w-0 max-w-full shrink px-1.5 py-1 text-[13px] font-medium tracking-[-0.007em] select-none',
  TaskHeader = ({playgroundOptions, onPlaygroundOptionsChange}) =>
    (0, jsxRuntime.jsx)(Vt, {
      right: (0, jsxRuntime.jsxs)('div', {
        className: 'flex items-center gap-0.5',
        children: [
          playgroundOptions &&
            onPlaygroundOptionsChange &&
            (0, jsxRuntime.jsx)(PlaygroundControls, {options: playgroundOptions, onChange: onPlaygroundOptionsChange}),
          (0, jsxRuntime.jsx)(ShareChat, {}),
          (0, jsxRuntime.jsx)(PinnedSummaryToggle, {}),
          (0, jsxRuntime.jsx)(SidePanelOpener, {}),
        ],
      }),
      children: (0, jsxRuntime.jsx)(TaskBreadcrumbs, {}),
    }) /** New chat, then project › starting chat › channel and title. */,
  TaskBreadcrumbs = () => {
    const s = pt(),
      {create, currentSession} = T(),
      {userId} = useTaskDetail(),
      {accountId} = N(),
      o = S(),
      l = currentSession.projectId,
      i = currentSession.trigger?.type === 'channel' ? currentSession.trigger.channel : void 0,
      c = currentSession.trigger?.type === 'agent' ? currentSession.trigger.starterId : void 0,
      {data: d} = C({...o.projects.get.queryOptions({accountId, projectId: l ?? ''}), enabled: !!l}),
      {data: u} = C(
        o.sessions.listPreviewItems.queryOptions(
          {accountId, sessionIds: [currentSession.id], limit: 1},
          {enabled: !!i, select: ([h]) => h?.channel},
        ),
      ),
      {data} = C(
        o.sessions.listPreviewItems.queryOptions(
          {accountId, sessionIds: [c ?? ''], limit: 1, archived: 'include'},
          {enabled: !!c, select: ([h]) => h},
        ),
      );
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex min-w-0 items-center gap-0',
      children: [
        (0, jsxRuntime.jsxs)(M, {
          children: [
            (0, jsxRuntime.jsx)(D, {
              render: (0, jsxRuntime.jsx)(I, {
                variant: 'ghost',
                size: 'icon',
                'aria-label': 'New chat',
                className: 'text-muted-foreground',
                onClick: create,
              }),
              children: (0, jsxRuntime.jsx)(xs, {}),
            }),
            (0, jsxRuntime.jsx)(R, {children: 'New chat'}),
          ],
        }),
        (0, jsxRuntime.jsx)(Breadcrumb, {
          className: b('min-w-0', s && '-order-1'),
          children: (0, jsxRuntime.jsxs)(BreadcrumbList, {
            className: 'min-w-0 gap-0.5 px-0',
            children: [
              d &&
                (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    (0, jsxRuntime.jsx)(BreadcrumbItem, {
                      className: 'min-w-0',
                      children: (0, jsxRuntime.jsxs)(I, {
                        variant: 'ghost',
                        size: 'sm',
                        className: CRUMB_CLASS,
                        render: (0, jsxRuntime.jsx)(ae, {
                          to: '/u/$userId/projects/$projectId',
                          params: {userId, projectId: d.id},
                        }),
                        children: [
                          (0, jsxRuntime.jsx)(ws, {className: 'size-3.5!', color: d.color, icon: d.icon}),
                          (0, jsxRuntime.jsx)('span', {className: 'truncate', children: d.name}),
                        ],
                      }),
                    }),
                    (0, jsxRuntime.jsx)(BreadcrumbSeparator, {}),
                  ],
                }),
              data &&
                (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    (0, jsxRuntime.jsx)(BreadcrumbItem, {
                      className: 'min-w-0',
                      children: (0, jsxRuntime.jsxs)(I, {
                        variant: 'ghost',
                        size: 'sm',
                        className: CRUMB_CLASS,
                        render: (0, jsxRuntime.jsx)(ae, {
                          to: '/u/$userId/tasks/$sessionId',
                          params: {userId, sessionId: data.id},
                        }),
                        children: [
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-muted-foreground shrink-0',
                            children: 'Started by',
                          }),
                          (0, jsxRuntime.jsx)('span', {className: 'truncate', children: data.title}),
                        ],
                      }),
                    }),
                    (0, jsxRuntime.jsx)(BreadcrumbSeparator, {}),
                  ],
                }),
              (0, jsxRuntime.jsx)(BreadcrumbItem, {
                className: 'min-w-0',
                children: (0, jsxRuntime.jsxs)(BreadcrumbPage, {
                  className: b(vt({variant: 'ghost', size: 'sm'}), CRUMB_CLASS),
                  children: [
                    (0, jsxRuntime.jsx)(Ut, {
                      className: 'shrink-0',
                      platform: i,
                      channelName: u?.name,
                      showTooltip: false,
                    }),
                    u?.name &&
                      (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                        children: [
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-muted-foreground max-w-40 truncate',
                            children: u.name,
                          }),
                          (0, jsxRuntime.jsx)('span', {className: 'text-muted-foreground', children: '·'}),
                        ],
                      }),
                    (0, jsxRuntime.jsx)(Ht, {
                      trigger: currentSession.trigger,
                      title: currentSession.title,
                      className: 'min-w-0',
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)(os, {
          className: '*:text-muted-foreground gap-0!',
          children: (0, jsxRuntime.jsx)(TaskMenu, {}),
        }),
      ],
    });
  },
  PlaygroundControls = ({options, onChange}) => {
    const n = r => a => {
      onChange({...options, [r]: a, subagentSeed: r === 'subagents' && a ? Date.now() : options.subagentSeed});
    };
    return (0, jsxRuntime.jsxs)(ps, {
      children: [
        (0, jsxRuntime.jsx)(cs, {
          render: (0, jsxRuntime.jsx)(I, {
            variant: 'ghost',
            size: 'icon',
            'aria-label': 'Open mock playground controls',
            className: 'text-muted-foreground',
          }),
          children: (0, jsxRuntime.jsx)(PlaygroundIcon, {}),
        }),
        (0, jsxRuntime.jsxs)(js, {
          align: 'end',
          className: 'w-64 p-3',
          children: [
            (0, jsxRuntime.jsxs)('div', {
              className: 'mb-2 px-1',
              children: [
                (0, jsxRuntime.jsx)('p', {className: 'text-sm font-medium', children: 'Mock playground'}),
                (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground text-xs',
                  children: 'Presentation-only overrides for the latest task.',
                }),
              ],
            }),
            (0, jsxRuntime.jsx)('div', {
              className: 'space-y-1',
              children: PLAYGROUND_SWITCHES.map(({key, label}) =>
                (0, jsxRuntime.jsxs)(
                  'label',
                  {
                    className: 'flex h-9 cursor-pointer items-center justify-between gap-3 rounded-lg px-1 text-sm',
                    children: [
                      (0, jsxRuntime.jsx)('span', {children: label}),
                      (0, jsxRuntime.jsx)(Ft, {checked: options[key], 'aria-label': label, onCheckedChange: n(key)}),
                    ],
                  },
                  key,
                ),
              ),
            }),
          ],
        }),
      ],
    });
  } /** Shows or hides the pinned summary; on narrow windows a click outside closes it. */,
  PinnedSummaryToggle = () => {
    const {sidePanelMode, toggleSidePanel, syncSidePanelCollapsed} = useChatLayout(),
      {currentSession} = T(),
      {floatShellRef, isDocked, setFloatAnchorElement} = usePinnedSummary(),
      i = useIsWide(),
      {hasToggleContent} = usePinnedSummaryContent(),
      {accountId} = N(),
      u = S(),
      m = te(),
      h = sidePanelMode !== 'collapsed',
      f = !hasToggleContent || !i,
      w = b(h ? 'bg-secondary text-foreground hover:bg-secondary' : 'text-muted-foreground'),
      v = () => {
        (m.invalidateQueries(u.sessions.files.list.queryFilter({sessionId: currentSession.id, accountId})),
          toggleSidePanel());
      };
    return (
      (0, React.useEffect)(() => {
        i || syncSidePanelCollapsed(true);
      }, [i, syncSidePanelCollapsed]),
      (0, React.useEffect)(() => {
        if (isDocked || !h) return;
        const x = j => {
          const g = j.target;
          g instanceof Node &&
            (floatShellRef.current?.contains(g) ||
              (g instanceof Element && g.closest('[data-pinned-summary-toggle]')) ||
              syncSidePanelCollapsed(true));
        };
        return (document.addEventListener('pointerdown', x), () => document.removeEventListener('pointerdown', x));
      }, [floatShellRef, isDocked, h, syncSidePanelCollapsed]),
      (0, jsxRuntime.jsx)('span', {
        ref: setFloatAnchorElement,
        className: 'inline-flex',
        'data-pinned-summary-toggle': '',
        children: (0, jsxRuntime.jsxs)(M, {
          children: [
            (0, jsxRuntime.jsx)(D, {
              render: (0, jsxRuntime.jsx)(I, {
                variant: 'ghost',
                size: 'icon',
                'aria-label': 'Toggle pinned summary',
                'aria-pressed': h,
                disabled: f,
                'data-pinned-summary-toggle': '',
                className: w,
                onClick: v,
              }),
              children: (0, jsxRuntime.jsx)(PinnedSummaryIcon, {}),
            }),
            (0, jsxRuntime.jsx)(R, {children: 'Toggle pinned summary'}),
          ],
        }),
      })
    );
  },
  SidePanelOpener = () => {
    const {mode} = Ne();
    return mode !== 'collapsed' ? null : (0, jsxRuntime.jsx)(Ls, {});
  } /** Opens the docked pinned summary when there is something to show in it. */,
  PinnedSummaryAutoOpen = ({filesOverride}) => {
    const {syncSidePanelCollapsed} = useChatLayout(),
      {isDocked} = usePinnedSummary(),
      {hasAutoOpenContent} = usePinnedSummaryContent(filesOverride),
      a = (0, React.useRef)(isDocked);
    return (
      (0, React.useLayoutEffect)(() => {
        const o = a.current;
        if (((a.current = isDocked), !isDocked)) {
          o && syncSidePanelCollapsed(true);
          return;
        }
        syncSidePanelCollapsed(!hasAutoOpenContent);
      }, [hasAutoOpenContent, isDocked, syncSidePanelCollapsed]),
      null
    );
  } /** Whether the pinned summary has anything to show. */,
  usePinnedSummaryContent = s => {
    const {host} = Z(),
      {currentSession} = T(),
      {accountId} = N(),
      a = S(),
      o = useSessionReady(currentSession.id),
      l = C(
        a.sessions.files.list.queryOptions(
          {sessionId: currentSession.id, accountId},
          {enabled: o, refetchOnMount: true, staleTime: Number.POSITIVE_INFINITY},
        ),
      ),
      {data: i = []} = useSessionTabs(currentSession.id, currentSession.status, accountId, {enabled: o}),
      {tabs} = Ie(i, currentSession.activeTabTargetId),
      d = currentSession.trigger?.type === 'standalone-routine' ? currentSession.trigger.routineId : void 0,
      {data: u = []} = C(
        a.routines.list.queryOptions(
          {accountId, parentSessionId: currentSession.id},
          {enabled: o && host.kind === 'local' && !d},
        ),
      ),
      {data} = C(
        a.routines.summary.queryOptions({accountId, routineId: d ?? ''}, {enabled: o && host.kind === 'local' && !!d}),
      ),
      h = (d ? !!data : u.length > 0) || hasPinnedContent({files: s ?? l.data ?? [], tabs});
    return {hasAutoOpenContent: h, hasToggleContent: h};
  } /** The chat: transcript, composer and the question, confirmation and approval prompts. */,
  TaskChat = () => {
    const {sessionId} = useTaskDetail(),
      t = et(),
      n = Rs({sessionId}),
      r = (0, React.useMemo)(
        () => ({defaultDraftRecord: Bt(sessionId), onDraftRecordChange: a => zt(sessionId, a)}),
        [sessionId],
      );
    return (0, jsxRuntime.jsxs)('div', {
      className: b('flex size-full grow flex-col overflow-hidden', '**:data-[agent-session-ui="chat"]:max-w-4xl'),
      'data-chat-drop-zone': '',
      children: [
        (0, jsxRuntime.jsx)(_s, {}),
        (0, jsxRuntime.jsx)($s, {
          children: (0, jsxRuntime.jsxs)(qs, {
            sessionId,
            className: 'px-4 lg:px-8',
            runCommand: n,
            draftPersistence: r,
            children: [
              (0, jsxRuntime.jsx)(Q, {mode: 'ask-user-question', children: (0, jsxRuntime.jsx)(Ws, {})}),
              (0, jsxRuntime.jsx)(Q, {mode: 'action-confirmation', children: (0, jsxRuntime.jsx)(Zs, {})}),
              (0, jsxRuntime.jsxs)(Qs, {
                children: [
                  (0, jsxRuntime.jsx)(Q, {mode: 'default', children: (0, jsxRuntime.jsx)(TaskComposer, {})}),
                  (0, jsxRuntime.jsx)(Q, {mode: 'approval', children: (0, jsxRuntime.jsx)(Ks, {})}),
                ],
              }),
              (0, jsxRuntime.jsxs)(Vs, {
                children: [
                  (0, jsxRuntime.jsxs)(ie, {
                    children: [(0, jsxRuntime.jsx)(Bs, {}), !t && (0, jsxRuntime.jsx)(zs, {})],
                  }),
                  (0, jsxRuntime.jsxs)(ie, {
                    children: [
                      (0, jsxRuntime.jsx)(Ds, {children: (0, jsxRuntime.jsx)(Gs, {})}),
                      (0, jsxRuntime.jsx)(Ms, {}),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  },
  TaskComposer = () => {
    const s = st(),
      t = Xs();
    return (0, jsxRuntime.jsx)(Fs, {
      extensions: t,
      leadingAction: (0, jsxRuntime.jsx)(Hs, {showIncognito: false}),
      placeholder: s ? 'Reply, @ for context' : void 0,
    });
  },
  useSessionReady = s => Ot({resetKey: s}) /** The chat menu: rename, copy ID, project, archive, delete. */,
  TaskMenu = () => {
    const {confirm} = Xe(),
      {copy} = we(),
      {sessionId, userId, playground, navigateToSession} = useTaskDetail(),
      {capture} = se();
    He();
    const {currentSession} = T(),
      {broadcast} = Je(),
      {accountId} = N(),
      u = S(),
      m = te(),
      [h, f] = (0, React.useState)(false),
      [w, v] = (0, React.useState)(false),
      x = A(u.sessions.archive.mutationOptions()),
      j = A(u.sessions.delete.mutationOptions());
    (A(u.memory.rerunExtraction.mutationOptions()), !currentSession.incognito && ye(currentSession.status));
    const g = () => {
        confirm(
          {title: 'Archive chat?', description: 'This will archive this chat.', ui: {action: 'Archive'}},
          async () => {
            await x.mutateAsync(
              {sessionId, accountId},
              {
                onSuccess: ($, k, ra, ne) => {
                  (ne.client.refetchQueries(u.sessions.listPreviewItems.queryFilter({accountId})),
                    ne.client.refetchQueries(u.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
                    capture('tasks.archive', {sessionId}),
                    navigateToSession(null, {projectId: currentSession.projectId}));
                },
              },
            );
          },
        );
      },
      _ = () => {
        confirm(
          {
            title: 'Delete chat?',
            description: 'This will permanently delete this chat and its messages.',
            ui: {action: 'Delete', variant: 'destructive'},
          },
          async () => {
            (await j.mutateAsync({sessionId, accountId}),
              m.refetchQueries(u.sessions.listPreviewItems.queryFilter({accountId})),
              m.refetchQueries(u.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
              capture('tasks.delete', {sessionId}),
              await navigateToSession(null, {projectId: currentSession.projectId}));
          },
        );
      },
      q = () => {
        f(true);
      },
      U = () => {
        (copy(currentSession.id), L.success('Copied!'));
      },
      H = () => {
        v(true);
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(Ss, {
          children: [
            (0, jsxRuntime.jsx)(ms, {
              render: ({className, ...k}) => (0, jsxRuntime.jsx)(I, {variant: 'ghost', size: 'icon', ...k}),
              children: (0, jsxRuntime.jsx)(dt, {}),
            }),
            (0, jsxRuntime.jsxs)(ys, {
              size: 'sm',
              className: 'w-48',
              children: [
                (0, jsxRuntime.jsxs)(F, {
                  onClick: q,
                  children: [
                    (0, jsxRuntime.jsx)(ht, {className: 'text-muted-foreground'}),
                    (0, jsxRuntime.jsx)('span', {children: 'Rename'}),
                  ],
                }),
                (0, jsxRuntime.jsxs)(F, {
                  onClick: U,
                  children: [
                    (0, jsxRuntime.jsx)(Qe, {className: 'text-muted-foreground'}),
                    (0, jsxRuntime.jsx)('span', {children: 'Copy session ID'}),
                  ],
                }),
                (0, jsxRuntime.jsx)(ut, {
                  session: currentSession,
                  place: 'detail',
                  variant: 'dropdown',
                  onStartNewProject: H,
                }),
                PLAYGROUND_ENABLED,
                (0, jsxRuntime.jsx)(Ve, {}),
                (0, jsxRuntime.jsxs)(F, {
                  onClick: g,
                  children: [(0, jsxRuntime.jsx)(es, {}), (0, jsxRuntime.jsx)('span', {children: 'Archive'})],
                }),
                (0, jsxRuntime.jsxs)(F, {
                  variant: 'destructive',
                  onClick: _,
                  children: [(0, jsxRuntime.jsx)(Ns, {}), (0, jsxRuntime.jsx)('span', {children: 'Delete'})],
                }),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(RenameChatDialog, {open: h, onOpenChange: f}),
        (0, jsxRuntime.jsx)(mt, {session: currentSession, place: 'detail', open: w, onOpenChange: v}),
      ],
    });
  },
  RenameSchema = E({title: G()}) /** Renaming the chat. */,
  RenameChatDialog = ({open, onOpenChange}) => {
    const {currentSession} = T(),
      {accountId} = N(),
      {capture} = se(),
      o = S(),
      {sessionId} = useTaskDetail(),
      i = Ps({resolver: ks(RenameSchema), defaultValues: {title: ''}}),
      c = A(o.sessions.update.mutationOptions()),
      d = async ({title}) => {
        const h = title.trim();
        if (!h || h === currentSession.title) {
          onOpenChange(false);
          return;
        }
        await c.mutateAsync(
          {sessionId, accountId, title: h},
          {
            onSuccess: (f, w, v, x) => {
              (x.client.invalidateQueries(o.sessions.get.queryFilter({sessionId, accountId})),
                x.client.invalidateQueries(o.sessions.listPreviewItems.queryFilter({accountId})),
                x.client.invalidateQueries(o.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
                capture('tasks.rename', {sessionId, place: 'detail'}),
                onOpenChange(false));
            },
            onError: f => L.error(f.message),
          },
        );
      },
      u = (0, React.useEffectEvent)(() => i.reset({title: currentSession.title ?? ''}));
    return (
      (0, React.useEffect)(() => {
        open && u();
      }, [open]),
      (0, jsxRuntime.jsx)(ss, {
        open,
        onOpenChange,
        children: (0, jsxRuntime.jsxs)(fs, {
          children: [
            (0, jsxRuntime.jsxs)(ts, {
              children: [
                (0, jsxRuntime.jsx)(as, {children: 'Rename chat'}),
                (0, jsxRuntime.jsx)(Ze, {children: 'Choose a short, recognizable name.'}),
              ],
            }),
            (0, jsxRuntime.jsx)(As, {
              ...i,
              children: (0, jsxRuntime.jsx)('form', {
                id: `rename-chat-form-${sessionId}`,
                onSubmit: i.handleSubmit(d),
                children: (0, jsxRuntime.jsx)(is, {
                  id: `rename-chat-input-${sessionId}`,
                  autoFocus: true,
                  ...i.register('title'),
                }),
              }),
            }),
            (0, jsxRuntime.jsxs)(ns, {
              children: [
                (0, jsxRuntime.jsx)(Ke, {disabled: c.isPending, children: 'Cancel'}),
                (0, jsxRuntime.jsxs)(Ge, {
                  type: 'submit',
                  form: `rename-chat-form-${sessionId}`,
                  disabled: c.isPending || !i.watch('title').trim(),
                  children: [
                    c.isPending && (0, jsxRuntime.jsx)($e, {}),
                    (0, jsxRuntime.jsx)('span', {children: 'Save'}),
                  ],
                }),
              ],
            }),
          ],
        }),
      })
    );
  };
function Ga() {
  const {sessionId, userId} = K.useParams(),
    {playground, [re]: r} = K.useSearch(),
    a = K.useNavigate(),
    o = (0, React.useMemo)(() => Ye(r), [r]),
    l = (0, React.useCallback)(
      (i, c) => {
        if (i) {
          a({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: i}, search: {[re]: r}, replace: true});
          return;
        }
        a({to: '/u/$userId/tasks/new', params: {userId}, search: {projectId: c?.projectId ?? void 0}, replace: true});
      },
      [r, a, userId],
    );
  return (0, jsxRuntime.jsx)(hs, {
    host: o,
    accountId: Number(userId),
    children: (0, jsxRuntime.jsx)(TaskDetail, {sessionId, userId, playground, navigateToSession: l}),
  });
}
