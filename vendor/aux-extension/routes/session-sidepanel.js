/* Aux-owned source: the session's side panel state (assets/provider-Cw0zhujt.js, from the panel sizes
 * to its context hooks). Tabs for the subagents, Aux Code agents, side chats and a file preview; the
 * active tab, collapse and full-width state, reset when the session changes, and the resizable panel
 * it drives. Closing a side chat interrupts and archives its session.
 * Names the rest of the chunk uses keep their chunk names: $c SessionSidepanelProvider,
 * wt the context, Vc useSessionSidepanel, Ct the optional hook, et a side chat's tab ID, tt its query input.
 * Chunk names used: c React, r JSX runtime, St the current session, q useApp, kn the host, Q useTRPC,
 * Re useQueryClient, ne useMutation, te useQuery, gs a session's starter, Ns an untitled session,
 * Ds a path's file name. */
var /** The open panel width. */
  PANEL_SIZES = {open: '480px'},
  /** A side chat's tab ID. */
  et = e => `side-chat-${e}`,
  /** The query input for a session's side chats. */
  tt = (e, t) => ({parentId: e ?? '', accountId: t, archived: 'exclude'}),
  /** The side panel's context. */
  wt = (0, c.createContext)(null),
  /** SessionSidepanelProvider: the panel's tabs and state for a session. */
  $c = ({children, previewFiles, sessionId}) => {
    const {currentSession} = St(),
      {accountId} = q(),
      {host} = kn(),
      trpc = Q(),
      queryClient = Re(),
      interruptSession = ne(trpc.sessions.interrupt.mutationOptions()),
      archiveSession = ne(trpc.sessions.archive.mutationOptions()),
      previewFileByPath = (0, c.useMemo)(
        () => new Map(previewFiles?.map(value => [value.metadata.path, value])),
        [previewFiles],
      ),
      panelRef = (0, c.useRef)(null),
      [isCollapsed, setIsCollapsed] = (0, c.useState)(true),
      [isMaximized, setIsMaximized] = (0, c.useState)(false),
      [openTabs, setOpenTabs] = (0, c.useState)([]),
      [activeTabId, setActiveTabId] = (0, c.useState)(null),
      [selectedSubagentId, setSelectedSubagentId] = (0, c.useState)(null),
      hasSubagents = (currentSession.toolState.subagent?.subagents.length ?? 0) > 0,
      {data: auxCodeSessions = []} = te(
        trpc.sessions.listPreviewItems.queryOptions(
          {accountId, starterId: sessionId, pinnedFirst: false, limit: 100},
          {
            enabled: !!sessionId && host.kind !== 'cloud',
            select: value =>
              value
                .filter(next => gs(next) === sessionId)
                .toSorted((next, tab) => tab.createdAt.localeCompare(next.createdAt)),
          },
        ),
      ),
      hasAuxCode = auxCodeSessions.length > 0,
      openTabsRef = (0, c.useRef)(openTabs);
    (0, c.useLayoutEffect)(() => {
      openTabsRef.current = openTabs;
    }, [openTabs]);
    const panelState = isCollapsed ? 'collapsed' : 'open',
      {data: childSessions = []} = te(
        trpc.sessions.childSessions.queryOptions(tt(sessionId, accountId), {enabled: !!sessionId}),
      ),
      tabs = (0, c.useMemo)(() => {
        const value = childSessions
            .filter(item => item.trigger?.type === 'sidechat')
            .map(item => ({
              id: et(item.id),
              kind: 'side-chat',
              sessionId: item.id,
              title: Ns(item.title) ? 'Side chat' : item.title,
            })),
          next = hasSubagents ? [{id: 'subagents', kind: 'subagents', title: 'Subagents'}] : [],
          tab = hasAuxCode ? [{id: 'aux-code', kind: 'aux-code', title: 'Aux Code'}] : [];
        return [...next, ...tab, ...value, ...openTabs.filter(item => !value.some(other => other.id === item.id))];
      }, [childSessions, hasAuxCode, hasSubagents, openTabs]);
    ((0, c.useEffect)(() => {
      if (hasSubagents) {
        setActiveTabId(value => value ?? 'subagents');
        return;
      }
      (setSelectedSubagentId(null), setActiveTabId(value => (value === 'subagents' ? null : value)));
    }, [hasSubagents]),
      (0, c.useEffect)(() => {
        setActiveTabId(value => (hasAuxCode ? (value ?? 'aux-code') : value === 'aux-code' ? null : value));
      }, [hasAuxCode]));
    const discardSideChat = (0, c.useCallback)(
        value => {
          (queryClient.setQueryData(trpc.sessions.childSessions.queryKey(tt(sessionId, accountId)), next =>
            next?.filter(tab => tab.id !== value),
          ),
            interruptSession.mutateAsync({sessionId: value, accountId}).catch(() => {}),
            archiveSession.mutateAsync({sessionId: value, accountId}).catch(() => {}));
        },
        [accountId, archiveSession.mutateAsync, interruptSession.mutateAsync, queryClient, sessionId, trpc],
      ),
      previousSessionId = (0, c.useRef)(sessionId);
    (0, c.useEffect)(() => {
      const value = previousSessionId.current;
      ((previousSessionId.current = sessionId),
        !(!value || value === sessionId) &&
          (setOpenTabs([]),
          setActiveTabId(null),
          setSelectedSubagentId(null),
          setIsMaximized(false),
          setIsCollapsed(true)));
    }, [sessionId]);
    const syncCollapsed = (0, c.useCallback)(value => {
        (value && setIsMaximized(false), setIsCollapsed(next => (next === value ? next : value)));
      }, []),
      applyPanelState = (0, c.useCallback)((value, next, tab) => {
        if (value) {
          if (next === 'collapsed') {
            value.collapse();
            return;
          }
          (value.isCollapsed() && value.expand(), value.resize(tab ? '100%' : PANEL_SIZES.open));
        }
      }, []),
      setPanelRef = (0, c.useCallback)(
        value => {
          ((panelRef.current = value),
            window.requestAnimationFrame(() => applyPanelState(panelRef.current, panelState, isMaximized)));
        },
        [isMaximized, panelState, applyPanelState],
      ),
      toggle = (0, c.useCallback)(() => {
        setIsCollapsed(value => (value || setIsMaximized(false), !value));
      }, []),
      toggleMaximized = (0, c.useCallback)(() => {
        (setIsCollapsed(false), setIsMaximized(value => !value));
      }, []),
      openFilePreview = (0, c.useCallback)(value => {
        const next = Ds(value);
        (setOpenTabs(tab => {
          const item = tab.find(existing => existing.kind === 'file-preview');
          if (item)
            return (
              setActiveTabId(item.id),
              tab.map(existing => (existing.id === item.id ? {...item, path: value, title: next} : existing))
            );
          const other = {id: 'file-preview', kind: 'file-preview', path: value, title: next};
          return (setActiveTabId(other.id), [...tab, other]);
        }),
          setIsCollapsed(false));
      }, []),
      openSideChat = (0, c.useCallback)(value => {
        const next = {
          id: et(crypto.randomUUID()),
          kind: 'side-chat',
          sessionId: null,
          title: 'Side chat',
          initialAttachments: value?.initialAttachments,
        };
        (setOpenTabs(tab => [...tab, next]), setActiveTabId(next.id), setIsCollapsed(false));
      }, []),
      openSubagents = (0, c.useCallback)(value => {
        (setSelectedSubagentId(value ?? null), setActiveTabId('subagents'), setIsCollapsed(false));
      }, []),
      openAuxCode = (0, c.useCallback)(() => {
        (setActiveTabId('aux-code'), setIsCollapsed(false));
      }, []),
      showSubagentList = (0, c.useCallback)(() => setSelectedSubagentId(null), []),
      bindSideChatSession = (0, c.useCallback)(
        (value, next) => {
          if (!openTabsRef.current.some(item => item.id === value)) {
            discardSideChat(next);
            return;
          }
          const tab = et(next);
          (setOpenTabs(item =>
            item.map(other =>
              other.id === value && other.kind === 'side-chat' ? {...other, id: tab, sessionId: next} : other,
            ),
          ),
            setActiveTabId(item => (item === value ? tab : item)),
            queryClient.invalidateQueries(trpc.sessions.childSessions.queryFilter(tt(sessionId, accountId))));
        },
        [accountId, discardSideChat, queryClient, sessionId, trpc.sessions.childSessions],
      ),
      clearSideChatInitialAttachments = (0, c.useCallback)(value => {
        setOpenTabs(next =>
          next.map(tab => (tab.id === value && tab.kind === 'side-chat' ? {...tab, initialAttachments: void 0} : tab)),
        );
      }, []),
      closeTab = (0, c.useCallback)(
        value => {
          const next = tabs.findIndex(other => other.id === value);
          if (next < 0) return;
          const tab = tabs[next];
          if (tab?.kind === 'subagents' || tab?.kind === 'aux-code') return;
          tab?.kind === 'side-chat' && tab.sessionId && discardSideChat(tab.sessionId);
          const item = tabs.filter(other => other.id !== value);
          (setActiveTabId(other => (other === value ? ((item[next] ?? item[next - 1])?.id ?? null) : other)),
            setOpenTabs(other => other.filter(existing => existing.id !== value)),
            item.length === 0 && (setIsMaximized(false), setIsCollapsed(true)));
        },
        [discardSideChat, tabs],
      );
    ((0, c.useLayoutEffect)(() => {
      applyPanelState(panelRef.current, panelState, isMaximized);
    }, [isMaximized, panelState, applyPanelState]),
      (0, c.useLayoutEffect)(() => (tn(panelState === 'open'), () => tn(false)), [panelState]));
    const value = (0, c.useMemo)(
      () => ({
        activeTabId,
        auxCodeAgents: auxCodeSessions,
        isMaximized,
        mode: panelState,
        panelRef,
        previewFilesByPath: previewFileByPath,
        selectedSubagentId,
        tabs,
        closeTab,
        openFilePreview,
        openSideChat,
        openSubagents,
        openAuxCode,
        bindSideChatSession,
        clearSideChatInitialAttachments,
        setActiveTabId,
        setPanelRef,
        syncCollapsed,
        showSubagentList,
        toggle,
        toggleMaximized,
      }),
      [
        activeTabId,
        auxCodeSessions,
        closeTab,
        isMaximized,
        panelState,
        openAuxCode,
        openFilePreview,
        openSideChat,
        openSubagents,
        previewFileByPath,
        selectedSubagentId,
        setPanelRef,
        showSubagentList,
        syncCollapsed,
        tabs,
        toggle,
        toggleMaximized,
        bindSideChatSession,
        clearSideChatInitialAttachments,
      ],
    );
    return (0, r.jsx)(wt, {value, children});
  },
  /** useSessionSidepanel: the side panel, which must exist. */
  Vc = () => {
    const value = (0, c.use)(wt);
    if (!value) throw new Error('useSessionSidepanel must be used within SessionSidepanelProvider');
    return value;
  },
  /** The side panel, when there is one. */
  Ct = () => (0, c.use)(wt)
