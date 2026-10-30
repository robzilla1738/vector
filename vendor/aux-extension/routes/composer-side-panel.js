/* Aux-owned source, composer pass 6: the session side panel (assets/session-composer-Dc0LRfZA.js,
 * from the side chat to the panel's width limit): its tabs (side chats, file previews, subagents,
 * Aux Code), the expand and toggle controls, a side chat with its composer, and the subagents tab
 * with its Active, Complete and Failed lists and a subagent's transcript with a follow-up composer.
 * Names the chunk uses elsewhere keep their chunk names: Ro the session transcript (rp), pp the
 * controls' spacer (exported), N1 SidePanelLayout (exported).
 * Chunk names used: a JSX runtime, g React, Y cn, me useSession, ge useApp, Ce useTRPC,
 * _e useQueryClient, Ve the side panel state, ga the session provider, ef/zo/af/lf/cf/uf/Ts/Uo/rf/sf
 * the composer parts, Qt ModeSlot, Ih the provider notice, Wd context usage, Ga commands, tc status
 * changes, _n finished, At attachments, Fl/Ll side chat drafts, ha subagents, pc failed, Rt the
 * subagent icon, ua/gr/xr/la subagent details, J Button, Ae/Pe/Ie tooltip parts, It/Vt/gt/We menu
 * parts, Un ScrollArea, Ii/qs/Ti resizable panels, Ad Aux Code, Rd the file preview. */
var Ro =
    rp /** A side chat tab: a new session started from the current one (its Project, model and permissions), or the one it opened. */,
  SideChat = ({tab}) => {
    const {currentSession} = me(),
      {openSideChat, bindSideChatSession} = Ve(),
      onSessionChange = (0, g.useCallback)(
        sessionId => {
          sessionId ? bindSideChatSession(tab.id, sessionId) : openSideChat();
        },
        [bindSideChatSession, openSideChat, tab.id],
      ),
      defaultDraftState = (0, g.useMemo)(
        () => ({
          draftProjectId: currentSession.projectId,
          draftModelOverride: currentSession.model,
          draftPermissionMode: currentSession.permissionMode,
        }),
        [currentSession.model, currentSession.permissionMode, currentSession.projectId],
      ),
      getCreateSessionInput = (0, g.useCallback)(
        () => ({
          parentId: currentSession.id,
          trigger: {type: 'sidechat'},
          browserBinding: currentSession.browserBinding ?? void 0,
        }),
        [currentSession.browserBinding, currentSession.id],
      );
    return (0, a.jsxs)(ga, {
      sessionId: tab.sessionId ?? void 0,
      projectId: currentSession.projectId,
      onSessionChange,
      children: [
        (0, a.jsx)(Ro, {
          className:
            '**:data-[agent-session-ui="chat"]:px-4 [&_.streamdown_pre]:wrap-anywhere [&_.streamdown_pre]:whitespace-pre-wrap',
          isSidepanel: true,
        }),
        tab.sessionId
          ? (0, a.jsx)(SideSessionComposer, {sessionId: tab.sessionId, mainSessionId: currentSession.id})
          : (0, a.jsx)(ef, {
              forcedMode: currentSession.incognito ? 'incognito' : null,
              defaultDraftState,
              getCreateSessionInput,
              onSessionChange,
              children: (0, a.jsx)(SideComposer, {tabId: tab.id, initialAttachments: tab.initialAttachments}),
            }),
      ],
    });
  } /** A side session’s composer; refreshes the main session’s files when the side session finishes. */,
  SideSessionComposer = ({sessionId, mainSessionId}) => {
    const {currentSession} = me(),
      {accountId} = ge(),
      trpc = Ce(),
      queryClient = _e(),
      runCommand = Ga({sessionId});
    return (
      tc(currentSession.status, (status, previous) => {
        !_n(status) ||
          _n(previous) ||
          queryClient.invalidateQueries(trpc.sessions.files.list.queryFilter({sessionId: mainSessionId, accountId}));
      }),
      (0, a.jsx)(zo, {children: (0, a.jsx)(SideComposer, {sessionId, runCommand})})
    );
  } /** The side panel’s composer: questions and confirmations, the input, permissions, model and context usage. */,
  SideComposer = ({placeholder, sessionId, tabId, runCommand, initialAttachments}) => {
    const commandExtensions = uc(),
      draftPersistence = (0, g.useMemo)(
        () => ({
          scopeKey: sessionId ?? tabId,
          defaultDraftRecord: Fl(sessionId, tabId),
          onDraftRecordChange: record => Ll(sessionId, record ?? null, tabId),
        }),
        [sessionId, tabId],
      );
    return (0, a.jsxs)(af, {
      className: 'pb-1',
      sessionId,
      isSidepanel: true,
      runCommand,
      draftPersistence,
      children: [
        tabId && initialAttachments && initialAttachments.length > 0
          ? (0, a.jsx)(SeedAttachments, {tabId, attachments: initialAttachments})
          : null,
        !sessionId && (0, a.jsx)(Ih, {}),
        (0, a.jsx)(Qt, {mode: 'ask-user-question', children: (0, a.jsx)(Yi, {})}),
        (0, a.jsx)(Qt, {mode: 'action-confirmation', children: (0, a.jsx)(qi, {})}),
        (0, a.jsxs)(lf, {
          children: [
            (0, a.jsx)(Qt, {
              mode: 'default',
              children: (0, a.jsx)(cf, {
                extensions: runCommand ? commandExtensions : void 0,
                leadingAction: (0, a.jsx)(Uo, {}),
                placeholder,
              }),
            }),
            (0, a.jsx)(Qt, {mode: 'approval', children: (0, a.jsx)(Xi, {})}),
          ],
        }),
        (0, a.jsxs)(uf, {
          children: [
            (0, a.jsx)(Ts, {children: (0, a.jsx)(rf, {})}),
            (0, a.jsxs)(Ts, {
              children: [
                (0, a.jsx)(Pu, {children: (0, a.jsx)(sf, {persistDefaultOnChange: false})}),
                (0, a.jsx)(Wd, {}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** Adds a side chat’s starting attachments once. */,
  SeedAttachments = ({tabId, attachments}) => {
    const {addAttachment} = At(),
      {clearSideChatInitialAttachments} = Ve(),
      seeded = (0, g.useRef)(false);
    return (
      (0, g.useEffect)(() => {
        if (!seeded.current) {
          seeded.current = true;
          for (const attachment of attachments) addAttachment(attachment);
          clearSideChatInitialAttachments(tabId);
        }
      }, [addAttachment, attachments, clearSideChatInitialAttachments, tabId]),
      null
    );
  },
  ignoreSessionChange =
    () => {} /** The subagents tab: the selected subagent, or the list (back to the list when it goes away). */,
  SubagentsTab = () => {
    const subagents = ha(),
      {selectedSubagentId, showSubagentList} = Ve(),
      selected = subagents.find(subagent => subagent.sessionId === selectedSubagentId);
    return (
      (0, g.useEffect)(() => {
        selectedSubagentId && !selected && showSubagentList();
      }, [selected, selectedSubagentId, showSubagentList]),
      selected
        ? (0, a.jsx)(SubagentDetail, {item: selected}, selected.sessionId)
        : (0, a.jsx)(SubagentList, {items: subagents})
    );
  } /** Subagents grouped as Active, Complete and Failed, newest first. */,
  SubagentList = ({items}) => {
    const {openSubagents} = Ve(),
      {active, completed, failed} = (0, g.useMemo)(() => {
        const activeList = [],
          completedList = [],
          failedList = [];
        for (const item of [...items].reverse())
          item.isRunning ? activeList.push(item) : pc(item) ? failedList.push(item) : completedList.push(item);
        return {active: activeList, completed: completedList, failed: failedList};
      }, [items]);
    return (0, a.jsxs)('div', {
      className: 'min-h-0 flex-1 overflow-y-auto px-3 pb-6',
      children: [
        (0, a.jsx)(SubagentSection, {
          items: active,
          title: 'Active',
          empty: 'No active subagents',
          onSelect: openSubagents,
        }),
        (0, a.jsx)(SubagentSection, {items: completed, title: 'Complete', onSelect: openSubagents}),
        (0, a.jsx)(SubagentSection, {items: failed, title: 'Failed', onSelect: openSubagents}),
      ],
    });
  },
  SubagentSection = ({empty, items, onSelect, title}) =>
    (0, a.jsxs)('section', {
      className: 'pt-4',
      children: [
        (0, a.jsxs)('h3', {
          className: 'text-muted-foreground px-2 pb-1.5 text-xs font-medium',
          children: [title, ' · ', items.length],
        }),
        items.length > 0
          ? (0, a.jsx)('div', {
              className: 'flex flex-col gap-0.5',
              children: items.map(item => (0, a.jsx)(SubagentListItem, {item, onSelect}, item.sessionId)),
            })
          : empty && (0, a.jsx)('p', {className: 'text-muted-foreground px-2 py-2 text-sm', children: empty}),
      ],
    }),
  SubagentListItem = ({item, onSelect}) =>
    (0, a.jsxs)('button', {
      type: 'button',
      className:
        'hover:bg-muted dark:hover:bg-muted/50 focus-visible:ring-ring/50 flex w-full min-w-0 items-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors outline-none focus-visible:ring-2',
      onClick: () => onSelect(item.sessionId),
      children: [
        (0, a.jsx)(Rt, {className: 'mt-0.5 size-4 shrink-0', color: item.color}),
        (0, a.jsxs)('span', {
          className: 'min-w-0 flex-1',
          children: [
            (0, a.jsx)('span', {className: 'text-primary block truncate text-sm', children: item.description}),
            item.isRunning &&
              (0, a.jsx)('span', {
                className: 'text-muted-foreground block truncate pt-0.5 text-[13px]',
                children: (0, a.jsx)(ua, {item}),
              }),
            (0, a.jsxs)('span', {
              className: 'text-muted-foreground flex min-w-0 items-center gap-1.5 pt-1 text-xs',
              children: [
                (0, a.jsx)(gr, {model: item.model, variant: 'badge', actualModel: la(item)}),
                (0, a.jsx)(xr, {item, variant: 'duration'}),
                item.isRunning && (0, a.jsx)(kt, {className: 'size-3.5'}),
              ],
            }),
          ],
        }),
      ],
    }) /** A subagent: back to the list, its description, and its transcript once it has one. */,
  SubagentDetail = ({item}) => {
    const {showSubagentList} = Ve();
    return (0, a.jsxs)('div', {
      className: 'flex min-h-0 flex-1 flex-col',
      children: [
        (0, a.jsxs)('div', {
          className: 'border-border flex h-11 shrink-0 items-center gap-1 border-b px-2',
          children: [
            (0, a.jsx)(J, {
              variant: 'ghost',
              size: 'icon-sm',
              className: 'text-muted-foreground',
              'aria-label': 'Back to subagents',
              onClick: showSubagentList,
              children: (0, a.jsx)(zs, {className: 'size-4'}),
            }),
            (0, a.jsx)(Rt, {className: 'size-4 shrink-0', color: item.color}),
            (0, a.jsx)('h2', {
              className: 'text-primary min-w-0 flex-1 truncate px-1 text-sm font-medium',
              children: item.description,
            }),
          ],
        }),
        (0, a.jsx)('div', {
          className: 'flex min-h-0 flex-1 flex-col overflow-hidden',
          children: item.preview
            ? (0, a.jsx)(ga, {
                sessionId: item.sessionId,
                onSessionChange: ignoreSessionChange,
                children: (0, a.jsx)(SubagentTranscript, {
                  isRunning: item.isRunning,
                  messageStartTimestamp: new Date(item.preview.createdAt).getTime(),
                  sessionId: item.sessionId,
                  startedAt: new Date(item.preview.latestRun.startedAt).getTime(),
                }),
              })
            : (0, a.jsx)(kt, {className: 'm-auto size-4'}),
        }),
      ],
    });
  } /** A subagent’s transcript and a composer to send it a follow-up. */,
  SubagentTranscript = ({isRunning, messageStartTimestamp, sessionId, startedAt}) => {
    const runCommand = Ga({sessionId});
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Ro, {
          className:
            '**:data-[agent-session-ui="chat"]:px-4 [&_.streamdown_pre]:wrap-anywhere [&_.streamdown_pre]:whitespace-pre-wrap',
          isSidepanel: true,
          messageStartTimestamp,
          streamingStartedAt: isRunning ? startedAt : void 0,
        }),
        (0, a.jsx)(zo, {
          children: (0, a.jsx)(SideComposer, {placeholder: 'Send follow-up with subagent.', sessionId, runCommand}),
        }),
      ],
    });
  } /** Expand or restore, and toggle, the side panel, at the window’s top right. */,
  SidePanelControls = () => {
    const {isMaximized, mode, toggle, toggleMaximized} = Ve(),
      open = mode !== 'collapsed';
    return (0, a.jsxs)('div', {
      className: 'pointer-events-none fixed top-0 right-0 z-50 flex h-11 items-center gap-0.5 pr-1.5',
      children: [
        (0, a.jsxs)(Ae, {
          children: [
            (0, a.jsx)(Pe, {
              render: (0, a.jsx)(J, {
                variant: 'ghost',
                size: 'icon',
                'aria-label': isMaximized ? 'Restore side panel' : 'Expand side panel',
                'aria-pressed': isMaximized,
                inert: !open,
                className: Y('text-muted-foreground pointer-events-auto', !open && 'opacity-0'),
                onClick: toggleMaximized,
              }),
              children: isMaximized ? (0, a.jsx)(Mr, {}) : (0, a.jsx)(wa, {}),
            }),
            (0, a.jsx)(Ie, {children: isMaximized ? 'Restore side panel' : 'Expand side panel'}),
          ],
        }),
        (0, a.jsxs)(Ae, {
          children: [
            (0, a.jsx)(Pe, {
              render: (0, a.jsx)(J, {
                variant: 'ghost',
                size: 'icon',
                'aria-label': 'Toggle side panel',
                'aria-pressed': open,
                className: Y(
                  'pointer-events-auto',
                  open ? 'bg-secondary text-foreground hover:bg-secondary' : 'text-muted-foreground',
                ),
                onClick: toggle,
              }),
              children: (0, a.jsx)(iu, {}),
            }),
            (0, a.jsx)(Ie, {children: 'Toggle side panel'}),
          ],
        }),
      ],
    });
  },
  pp = () => {
    const {mode} = Ve();
    return (0, a.jsx)('div', {
      className: Y('h-8 shrink-0', mode === 'open' ? 'w-[4.25rem]' : 'w-8'),
      'aria-hidden': true,
    });
  } /** The side panel’s tabs and the + menu for a new side chat. */,
  SidePanelTabs = () => {
    const {tabs, activeTabId, setActiveTabId, closeTab, openSideChat} = Ve();
    return (0, a.jsxs)('div', {
      className: 'flex h-11 shrink-0 items-center pr-1.5',
      children: [
        (0, a.jsx)(Un, {
          className: 'min-w-0 flex-1 **:data-[slot=scroll-area-scrollbar]:hidden',
          effect: false,
          children: (0, a.jsxs)('div', {
            className: 'flex h-11 w-max items-center gap-1 px-2',
            children: [
              tabs.map(tab =>
                (0, a.jsx)(
                  SidePanelTab,
                  {
                    tab,
                    isActive: tab.id === activeTabId,
                    onSelect: () => setActiveTabId(tab.id),
                    onClose: () => closeTab(tab.id),
                  },
                  tab.id,
                ),
              ),
              (0, a.jsxs)(It, {
                children: [
                  (0, a.jsx)(Vt, {
                    render: ({className, ...props}) =>
                      (0, a.jsx)(J, {
                        variant: 'ghost',
                        size: 'icon',
                        'aria-label': 'Add sidepanel tab',
                        className: 'text-muted-foreground size-6 shrink-0 rounded-md',
                        ...props,
                      }),
                    children: (0, a.jsx)(_s, {className: 'size-4'}),
                  }),
                  (0, a.jsx)(gt, {
                    size: 'sm',
                    children: (0, a.jsxs)(We, {
                      onClick: () => openSideChat(),
                      children: [
                        (0, a.jsx)(hn, {className: 'text-muted-foreground'}),
                        (0, a.jsx)('span', {children: 'Side chat'}),
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
        }),
        (0, a.jsx)(pp, {}),
      ],
    });
  } /** A side panel tab: its icon, title and close button. */,
  SidePanelTab = ({tab, isActive, onSelect, onClose}) =>
    (0, a.jsxs)('div', {
      role: 'tab',
      'aria-selected': isActive,
      tabIndex: 0,
      title: tab.title,
      className: Y(
        'group/tab flex h-7 w-40 shrink-0 items-center overflow-hidden rounded-lg pr-0.5 pl-2 text-left text-[13px] leading-5 font-medium shadow-sm shadow-black/5 transition-colors',
        isActive
          ? 'bg-surface-secondary text-foreground ring-border-surface-strong ring-[0.5px]'
          : 'text-muted-foreground hover:bg-muted dark:hover:bg-muted/50 hover:text-foreground',
      ),
      onClick: onSelect,
      onKeyDown: event => {
        (event.key === 'Enter' || event.key === ' ') && (event.preventDefault(), onSelect());
      },
      children: [
        tab.kind === 'file-preview'
          ? (0, a.jsx)(ln, {className: 'text-muted-foreground mr-1.5 size-4 shrink-0', filename: tab.title})
          : tab.kind === 'subagents'
            ? (0, a.jsx)(Rt, {className: 'text-muted-foreground mr-1.5 size-4 shrink-0', color: 'mono'})
            : tab.kind === 'aux-code'
              ? (0, a.jsx)(oa, {className: 'text-muted-foreground mr-1.5 size-4'})
              : (0, a.jsx)(hn, {className: 'text-muted-foreground mr-1.5 size-4 shrink-0'}),
        (0, a.jsx)('span', {
          className:
            'min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,black_calc(100%-8px),transparent)] whitespace-nowrap',
          children: tab.title,
        }),
        tab.kind !== 'subagents' &&
          tab.kind !== 'aux-code' &&
          (0, a.jsx)(J, {
            variant: 'ghost',
            size: 'icon',
            'aria-label': `Close ${tab.title}`,
            className:
              'pointer-events-none size-6 shrink-0 rounded-md opacity-0 transition-opacity group-focus-within/tab:pointer-events-auto group-focus-within/tab:opacity-100 group-hover/tab:pointer-events-auto group-hover/tab:opacity-100',
            onClick: event => {
              (event.stopPropagation(), onClose());
            },
            children: (0, a.jsx)(yr, {className: 'size-4'}),
          }),
      ],
    }),
  SIDE_PANEL_SIZE = {
    DEFAULT: '480px',
    MIN: '320px',
    MAIN_RESERVE_PX: 360,
  } /** SidePanelLayout: the main session beside the resizable side panel. */,
  N1 = ({children}) => {
    const {isMaximized} = Ve();
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(SidePanelControls, {}),
        (0, a.jsxs)(Ii, {
          className: 'h-full min-h-0 w-full',
          children: [
            (0, a.jsx)(qs, {
              id: 'session-main',
              className: 'min-w-0',
              minSize: isMaximized ? '0px' : `${SIDE_PANEL_SIZE.MAIN_RESERVE_PX}px`,
              children,
            }),
            (0, a.jsx)(SidePanel, {}),
          ],
        }),
      ],
    });
  } /** The resizable side panel: fades in when opened, and leaves the main session room. */,
  SidePanel = () => {
    const {mode, isMaximized, setPanelRef, syncCollapsed, tabs, activeTabId, previewFilesByPath} = Ve(),
      [shown, setShown] = (0, g.useState)(false),
      [mounted, setMounted] = (0, g.useState)(false),
      [maxWidth, setMaxWidth] = (0, g.useState)(maxSidePanelWidth);
    ((0, g.useEffect)(() => {
      const onWindowResize = () => setMaxWidth(maxSidePanelWidth());
      return (
        window.addEventListener('resize', onWindowResize),
        () => window.removeEventListener('resize', onWindowResize)
      );
    }, []),
      (0, g.useEffect)(() => {
        if (mode === 'collapsed') {
          setShown(false);
          return;
        }
        setMounted(true);
        const frame = window.requestAnimationFrame(() => {
          setShown(true);
        });
        return () => window.cancelAnimationFrame(frame);
      }, [mode]));
    const activeTab = tabs.find(tab => tab.id === activeTabId) ?? null,
      open = mode !== 'collapsed';
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Ti, {
          className: Y(
            'transition-[background,opacity,width] duration-150',
            open && !isMaximized
              ? 'w-hairline! bg-border mt-[0.5px] hover:bg-[linear-gradient(to_bottom,var(--border)_0%,var(--border)_42%,var(--border-surface-strong)_48%,var(--border-surface-strong)_52%,var(--border)_58%,var(--border)_100%)]'
              : 'pointer-events-none w-0! overflow-hidden bg-transparent opacity-0 after:hidden',
          ),
        }),
        (0, a.jsx)(qs, {
          id: 'session-sidepanel',
          className: 'relative flex overflow-hidden!',
          panelRef: setPanelRef,
          defaultSize: SIDE_PANEL_SIZE.DEFAULT,
          maxSize: isMaximized ? '100%' : maxWidth,
          minSize: SIDE_PANEL_SIZE.MIN,
          collapsedSize: '0px',
          collapsible: true,
          groupResizeBehavior: 'preserve-pixel-size',
          onResize: (size, previous, previousSize) => {
            if (size.inPixels <= 0) {
              syncCollapsed(true);
              return;
            }
            previousSize && previousSize.inPixels <= 0 && syncCollapsed(false);
          },
          children: (0, a.jsx)('div', {
            className: 'relative flex h-full w-full grow flex-col overflow-hidden',
            style: {minWidth: SIDE_PANEL_SIZE.MIN},
            children: (0, a.jsxs)('div', {
              className: Y(
                'flex h-full w-full grow flex-col opacity-0 transition-opacity duration-150 ease-out',
                shown && 'opacity-100',
              ),
              onTransitionEnd: event => event.target === event.currentTarget && !open && setMounted(false),
              children: [
                (0, a.jsx)(SidePanelTabs, {}),
                (0, a.jsx)('div', {
                  className: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent',
                  'data-chat-drop-zone': activeTab?.kind === 'side-chat' ? '' : void 0,
                  children:
                    activeTab?.kind === 'subagents'
                      ? (0, a.jsx)(SubagentsTab, {})
                      : activeTab?.kind === 'aux-code'
                        ? (0, a.jsx)(Ad, {})
                        : activeTab?.kind === 'file-preview'
                          ? (open || mounted) &&
                            (0, a.jsx)(
                              Rd,
                              {path: activeTab.path, preview: previewFilesByPath.get(activeTab.path)},
                              activeTab.path,
                            )
                          : activeTab?.kind === 'side-chat'
                            ? (0, a.jsx)(SideChat, {tab: activeTab}, activeTab.id)
                            : (0, a.jsx)(SidePanelEmpty, {}),
                }),
              ],
            }),
          }),
        }),
      ],
    });
  } /** An empty side panel: preview a file, or start a side chat. */,
  SidePanelEmpty = () => {
    const {openSideChat} = Ve();
    return (0, a.jsxs)('div', {
      className:
        'text-muted-foreground flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-sm',
      children: [
        'Open a file to preview it here.',
        (0, a.jsxs)('div', {
          className: 'flex w-40 items-center gap-3',
          children: [(0, a.jsx)($n, {className: 'grow basis-0'}), 'or', (0, a.jsx)($n, {className: 'grow basis-0'})],
        }),
        (0, a.jsxs)(J, {
          variant: 'outline',
          size: 'sm',
          onClick: () => openSideChat(),
          children: [(0, a.jsx)(hn, {}), 'New side chat'],
        }),
      ],
    });
  }; /** The widest the side panel may be: the window less the main session’s room. */
function maxSidePanelWidth() {
  return typeof window > 'u' ? '960px' : `${Math.max(320, window.innerWidth - SIDE_PANEL_SIZE.MAIN_RESERVE_PX)}px`;
}
