/* Aux-owned source: Settings › Experimental (assets/experimental-Xq3YsEPK.js, the module body): the
 * feature switches, Start onboarding, Detect tools, and for internal accounts a live tab webview beside
 * the page. The auxCode and format fields come from vendor/provided/aux-experimental-settings-v2.mjs.
 * Names the rest of the chunk uses keep their chunk names: $e the page (exported).
 * Chunk names used: _/M React, K JSX runtime, Q useNavigate, B Link, $ chevron, P useApp, G useMutation,
 * A/U/H resizable panel, group and handle, C useQuery, R useQueryClient, I useTRPC, V/W/Y/J/X the select,
 * Z info, ee play, k Button, T toast, O ScrollArea, F the route, te the browser binding, q error content,
 * g/S/j/N/b/se/ne the settings page kit, ae useUpdateSettings, w Switch, ie mention text, re the first
 * message draft, oe DocumentTitle, le/ce Alert. */
var React = _(M(), 1),
  jsxRuntime = K(),
  /** The query behind the live tab list. */
  LIVE_TABS_KEY = ['experimental-webview-tabs'];
/** The page, with the live tab panel for internal accounts. */
function ExperimentalLayout({children}) {
  const {accountId} = P(),
    trpc = I(),
    {data: account} = C(trpc.accounts.get.queryOptions({accountId}));
  return account?.email?.trim().toLowerCase().endsWith('@aux.invalid')
    ? (0, jsxRuntime.jsx)(LiveTabLayout, {children}, accountId)
    : (0, jsxRuntime.jsx)(O, {
        className: 'size-full',
        children: (0, jsxRuntime.jsx)('main', {className: 'mx-auto w-full max-w-2xl px-8 pt-16 pb-40', children}),
      });
}
/** The page beside an attached live tab. */
function LiveTabLayout({children}) {
  const supported = typeof chrome < 'u' && !!chrome.tabs?.query && !!customElements.get('webview'),
    queryClient = R(),
    [selectedId, setSelectedId] = (0, React.useState)(null),
    [attached, setAttached] = (0, React.useState)(null),
    [attaching, setAttaching] = (0, React.useState)(false),
    [attachError, setAttachError] = (0, React.useState)(null),
    {
      data: tabs = [],
      isFetching,
      error,
      refetch,
    } = C({
      queryKey: LIVE_TABS_KEY,
      enabled: supported,
      queryFn: async () => {
        const [openTabs, currentTab] = await Promise.all([chrome.tabs.query({}), chrome.tabs.getCurrent()]);
        return openTabs.filter(
          tab =>
            typeof tab.id == 'number' &&
            tab.id !== currentTab?.id &&
            !tab.active &&
            !tab.discarded &&
            /^https?:\/\//.test(tab.url ?? ''),
        );
      },
    });
  (0, React.useEffect)(() => {
    if (!supported) return;
    const refresh = () => {
      queryClient.invalidateQueries({queryKey: LIVE_TABS_KEY});
    };
    return (
      chrome.tabs.onCreated.addListener(refresh),
      chrome.tabs.onRemoved.addListener(refresh),
      chrome.tabs.onUpdated.addListener(refresh),
      chrome.tabs.onActivated.addListener(refresh),
      chrome.tabs.onReplaced.addListener(refresh),
      () => {
        (chrome.tabs.onCreated.removeListener(refresh),
          chrome.tabs.onRemoved.removeListener(refresh),
          chrome.tabs.onUpdated.removeListener(refresh),
          chrome.tabs.onActivated.removeListener(refresh),
          chrome.tabs.onReplaced.removeListener(refresh));
      }
    );
  }, [supported, queryClient]);
  const selected = tabs.find(tab => tab.id === selectedId);
  return (0, jsxRuntime.jsxs)(U, {
    children: [
      (0, jsxRuntime.jsx)(A, {
        id: 'experimental-settings',
        minSize: '320px',
        defaultSize: '45%',
        children: (0, jsxRuntime.jsx)(O, {
          className: 'size-full',
          children: (0, jsxRuntime.jsxs)('main', {
            className: 'mx-auto w-full max-w-2xl px-8 pt-16 pb-40',
            children: [
              children,
              (0, jsxRuntime.jsx)('div', {
                className: 'mt-8',
                children: (0, jsxRuntime.jsxs)(S, {
                  title: 'Live tab webview',
                  children: [
                    (0, jsxRuntime.jsx)('p', {
                      className: 'text-muted-foreground mb-4 text-sm',
                      children:
                        'Display an open tab beside these settings. Detaching keeps the original tab and its page state.',
                    }),
                    supported
                      ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                          children: [
                            (0, jsxRuntime.jsxs)('div', {
                              className: 'flex flex-wrap items-center gap-2',
                              children: [
                                (0, jsxRuntime.jsxs)(X, {
                                  value: selected?.id ?? null,
                                  onValueChange: setSelectedId,
                                  disabled: !!attached || isFetching,
                                  children: [
                                    (0, jsxRuntime.jsx)(Y, {
                                      className: 'min-w-0 flex-1',
                                      'aria-label': 'Tab to attach',
                                      children: (0, jsxRuntime.jsx)(J, {
                                        placeholder: isFetching ? 'Loading tabs…' : 'Choose a tab',
                                      }),
                                    }),
                                    (0, jsxRuntime.jsx)(W, {
                                      children: tabs.map(tab =>
                                        (0, jsxRuntime.jsx)(
                                          V,
                                          {
                                            value: tab.id,
                                            children: (0, jsxRuntime.jsx)('span', {
                                              className: 'max-w-80 truncate',
                                              children: tab.title || tab.url,
                                            }),
                                          },
                                          tab.id,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                                (0, jsxRuntime.jsx)(k, {
                                  variant: 'outline',
                                  disabled: isFetching || !!attached,
                                  onClick: () => {
                                    refetch();
                                  },
                                  children: 'Refresh',
                                }),
                                (0, jsxRuntime.jsx)(k, {
                                  disabled: !selected || !!attached,
                                  onClick: () => {
                                    selected &&
                                      (setAttachError(null),
                                      setAttaching(true),
                                      setAttached({id: selected.id, title: selected.title || selected.url || 'Tab'}));
                                  },
                                  children: 'Attach',
                                }),
                              ],
                            }),
                            !isFetching &&
                              !tabs.length &&
                              (0, jsxRuntime.jsx)('p', {
                                className: 'text-muted-foreground mt-3 text-sm',
                                children:
                                  'Open a website in another tab, then return here. Only loaded tabs that are not currently visible can be attached.',
                              }),
                          ],
                        })
                      : (0, jsxRuntime.jsx)('p', {
                          className: 'text-muted-foreground text-sm',
                          children:
                            'Open this page in the Aux extension with a browser build that supports live tab webviews.',
                        }),
                    (attachError || error) &&
                      (0, jsxRuntime.jsx)('p', {
                        role: 'alert',
                        className: 'text-destructive mt-3 text-sm',
                        children: attachError || error?.message,
                      }),
                  ],
                }),
              }),
            ],
          }),
        }),
      }),
      attached &&
        (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            (0, jsxRuntime.jsx)(H, {withHandle: true}),
            (0, jsxRuntime.jsx)(A, {
              id: 'experimental-webview',
              minSize: '280px',
              defaultSize: '55%',
              children: (0, jsxRuntime.jsxs)('section', {
                className: 'flex size-full min-h-0 flex-col',
                'aria-label': 'Attached tab',
                children: [
                  (0, jsxRuntime.jsxs)('div', {
                    className: 'flex items-center gap-3 border-b px-4 py-3',
                    children: [
                      (0, jsxRuntime.jsxs)('div', {
                        className: 'min-w-0 flex-1',
                        children: [
                          (0, jsxRuntime.jsx)('p', {
                            className: 'truncate text-sm font-medium',
                            children: attached.title,
                          }),
                          (0, jsxRuntime.jsx)('p', {
                            role: 'status',
                            className: 'text-muted-foreground text-xs',
                            children: attaching ? 'Attaching…' : 'Attached · original tab stays open',
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)(k, {
                        variant: 'outline',
                        onClick: () => {
                          (setAttached(null), setAttaching(false));
                        },
                        children: 'Detach',
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)(LiveTabView, {
                    tabId: attached.id,
                    onAttached: () => setAttaching(false),
                    onDetached: () => {
                      (setAttached(null), setAttaching(false));
                    },
                    onError: message => {
                      (setAttached(null), setAttaching(false), setAttachError(message));
                    },
                  }),
                ],
              }),
            }),
          ],
        }),
    ],
  });
}
/** The webview a tab is attached to. */
function LiveTabView({tabId, onAttached, onDetached, onError}) {
  const containerRef = (0, React.useRef)(null),
    handlers = (0, React.useRef)({onAttached, onDetached, onError});
  return (
    (handlers.current = {onAttached, onDetached, onError}),
    (0, React.useEffect)(() => {
      const container = containerRef.current;
      if (!container) return;
      const webview = document.createElement('webview');
      ((webview.className = 'size-full'), webview.setAttribute('aria-label', 'Live tab content'));
      let removed = false;
      const handleDetached = () => handlers.current.onDetached();
      return (
        webview.addEventListener('detached', handleDetached),
        container.append(webview),
        webview.attachTab(tabId).then(
          () => {
            removed || handlers.current.onAttached();
          },
          error => {
            removed || handlers.current.onError(error.message);
          },
        ),
        () => {
          ((removed = true), webview.removeEventListener('detached', handleDetached), webview.remove());
        }
      );
    }, [tabId]),
    (0, jsxRuntime.jsx)('div', {ref: containerRef, className: 'min-h-0 flex-1'})
  );
}
function $e() {
  return (0, jsxRuntime.jsxs)(ExperimentalLayout, {
    children: [
      (0, jsxRuntime.jsx)(oe, {segments: ['Settings', 'Experimental']}),
      (0, jsxRuntime.jsx)(se, {children: (0, jsxRuntime.jsx)('h1', {children: 'Experimental'})}),
      (0, jsxRuntime.jsxs)(ce, {
        className: 'mb-8',
        children: [
          (0, jsxRuntime.jsx)(Z, {}),
          (0, jsxRuntime.jsx)(le, {
            className: 'line-clamp-none whitespace-normal',
            children: 'These settings are only available to internal users and canary builds.',
          }),
        ],
      }),
      (0, jsxRuntime.jsxs)('div', {
        className: 'space-y-8',
        children: [
          (0, jsxRuntime.jsx)(S, {
            title: 'Features',
            children: (0, jsxRuntime.jsxs)(N, {
              children: [
                (0, jsxRuntime.jsx)(SyncRow, {}),
                (0, jsxRuntime.jsx)(KakaoTalkRow, {}),
                (0, jsxRuntime.jsx)(AuxCodeRow, {}),
                (0, jsxRuntime.jsx)(CompactionLimitsRow, {}),
              ],
            }),
          }),
          (0, jsxRuntime.jsx)(S, {
            title: 'Onboarding',
            children: (0, jsxRuntime.jsxs)(N, {
              children: [
                (0, jsxRuntime.jsx)(OnboardingRow, {}),
                (0, jsxRuntime.jsx)(StartOnboardingRow, {}),
                (0, jsxRuntime.jsx)(DetectToolsRow, {}),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
var /** The link to Detect tools. */
  DetectToolsRow = () => {
    const {userId} = F.useParams();
    return (0, jsxRuntime.jsxs)(ne, {
      render: (0, jsxRuntime.jsx)(B, {to: '/u/$userId/settings/experimental/detect-tools', params: {userId}}),
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'Detect tools',
          description: 'Services you use, inferred from the last 30 days of browsing history.',
        }),
        (0, jsxRuntime.jsx)(b, {children: (0, jsxRuntime.jsx)($, {className: 'text-muted-foreground size-4'})}),
      ],
    });
  },
  /** Until the settings load. */
  DEFAULT_SETTINGS = {
    sync: false,
    kakaotalk: false,
    onboarding: false,
    format: 'aux.experimental.v2',
    auxCode: false,
    compactionLimits: false,
  };
/** The experimental settings and how to save them. */
function useExperimental() {
  const {accountId} = P(),
    trpc = I(),
    {data: experimental = DEFAULT_SETTINGS} = C(
      trpc.settings.getAll.queryOptions({accountId}, {select: error => error.experimental}),
    );
  return {
    accountId,
    experimental,
    setExperimental: ae({
      accountId,
      syncGetAllCache: true,
      onError: async error => {
        const content = await q(error, 'Failed to update experimental settings.');
        T.error(content.title, {description: content.description});
      },
    }),
  };
}
var /** Sync. */
  SyncRow = () => {
    const {accountId, experimental, setExperimental} = useExperimental();
    return (0, jsxRuntime.jsxs)(j, {
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'Sync',
          description:
            'Sync agent files, projects, routines and browser cookies (for cloud sessions) across devices. Features may change or break.',
        }),
        (0, jsxRuntime.jsx)(b, {
          children: (0, jsxRuntime.jsx)(w, {
            checked: experimental.sync,
            disabled: setExperimental.isPending,
            onCheckedChange: checked => {
              setExperimental.mutate({accountId, key: 'experimental', value: {...experimental, sync: checked}});
            },
          }),
        }),
      ],
    });
  },
  /** The onboarding skill. */
  OnboardingRow = () => {
    const {accountId, experimental, setExperimental} = useExperimental();
    return (0, jsxRuntime.jsxs)(j, {
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'Onboarding',
          description: 'Enable the agent-led onboarding skill and the `onboarding` REPL global.',
        }),
        (0, jsxRuntime.jsx)(b, {
          children: (0, jsxRuntime.jsx)(w, {
            checked: experimental.onboarding,
            disabled: setExperimental.isPending,
            onCheckedChange: checked => {
              setExperimental.mutate({accountId, key: 'experimental', value: {...experimental, onboarding: checked}});
            },
          }),
        }),
      ],
    });
  },
  /** What Start onboarding runs on. */
  ONBOARDING_MODEL = {
    provider: 'aux',
    modelId: 'grok-4.6',
    thinkingLevel: 'medium',
    fastMode: false,
  },
  /** What Start onboarding says. */
  ONBOARDING_PROMPT =
    "Hi! I'm new to Aux. Take a look at the tools I use, show me something you can do for me right now, and then help me set up whatever's worth setting up.",
  /** Starts a new task running the onboarding skill. */
  StartOnboardingRow = () => {
    const {accountId, experimental} = useExperimental(),
      {userId} = F.useParams(),
      trpc = I(),
      queryClient = R(),
      navigate = Q(),
      createSession = G(trpc.sessions.createAndPrompt.mutationOptions()),
      start = async () => {
        const skill = (
            await queryClient
              .query({...trpc.projects.listSkills.queryOptions({projectId: null, accountId}), staleTime: 'static'})
              .catch(() => [])
          ).find(candidate => candidate.absolutePath.replaceAll('\\', '/').includes('/builtin/onboarding/')),
          message = {
            role: 'user',
            content: `${skill ? `${ie({type: 'skill', id: `skill:${skill.absolutePath}`, name: 'Onboarding', source: 'builtin', skillPath: skill.absolutePath})} ` : ''}${ONBOARDING_PROMPT}`,
            timestamp: Date.now(),
          };
        try {
          const browserBinding = await te(),
            session = await createSession.mutateAsync({
              accountId,
              title: 'Welcome to Aux',
              message,
              trigger: {type: 'user', source: 'onboarding'},
              model: ONBOARDING_MODEL,
              runtimeConfig: {strictModelSelection: true, memoryExtractionDisabled: true},
              ...(browserBinding ? {browserBinding} : {}),
            }),
            queryInput = {sessionId: session.id, accountId};
          (queryClient.setQueryData(trpc.sessions.get.queryKey(queryInput), session),
            queryClient.setQueryData(trpc.sessions.messages.queryKey(queryInput), []),
            re(session.id, message, {mode: 'display-only'}),
            queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
            await navigate({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: session.id}}));
        } catch (error) {
          const content = await q(error, 'Failed to start onboarding.');
          T.error(content.title, {description: content.description});
        }
      };
    return (0, jsxRuntime.jsxs)(j, {
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'Start onboarding',
          description: 'Open a new task that runs the onboarding skill on Grok 4.6 (medium).',
        }),
        (0, jsxRuntime.jsx)(b, {
          children: (0, jsxRuntime.jsxs)(k, {
            size: 'sm',
            variant: 'outline',
            disabled: !experimental.onboarding || createSession.isPending,
            onClick: start,
            children: [(0, jsxRuntime.jsx)(ee, {className: 'size-3.5'}), 'Start'],
          }),
        }),
      ],
    });
  },
  /** KakaoTalk. */
  KakaoTalkRow = () => {
    const {accountId, experimental, setExperimental} = useExperimental();
    return (0, jsxRuntime.jsxs)(j, {
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'KakaoTalk',
          description: 'Read KakaoTalk chats and messages (read-only). macOS only.',
        }),
        (0, jsxRuntime.jsx)(b, {
          children: (0, jsxRuntime.jsx)(w, {
            checked: experimental.kakaotalk,
            disabled: setExperimental.isPending,
            onCheckedChange: checked => {
              setExperimental.mutate({accountId, key: 'experimental', value: {...experimental, kakaotalk: checked}});
            },
          }),
        }),
      ],
    });
  },
  /** Custom compaction limits. */
  CompactionLimitsRow = () => {
    const {accountId, experimental, setExperimental} = useExperimental();
    return (0, jsxRuntime.jsxs)(j, {
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'Custom compaction limits',
          description: 'Choose when chats auto-compact, for all models or per model, in Settings › Models.',
        }),
        (0, jsxRuntime.jsx)(b, {
          children: (0, jsxRuntime.jsx)(w, {
            checked: experimental.compactionLimits,
            disabled: setExperimental.isPending,
            onCheckedChange: checked => {
              setExperimental.mutate({
                accountId,
                key: 'experimental',
                value: {...experimental, compactionLimits: checked},
              });
            },
          }),
        }),
      ],
    });
  },
  /** Aux Code. */
  AuxCodeRow = () => {
    const {accountId, experimental, setExperimental} = useExperimental();
    return (0, jsxRuntime.jsxs)(j, {
      children: [
        (0, jsxRuntime.jsx)(g, {
          title: 'Aux Code',
          description: 'Hand code work to Aux Code, a coding agent that works in its own task. macOS only.',
        }),
        (0, jsxRuntime.jsx)(b, {
          children: (0, jsxRuntime.jsx)(w, {
            checked: experimental.auxCode,
            disabled: setExperimental.isPending,
            onCheckedChange: checked => {
              setExperimental.mutate({accountId, key: 'experimental', value: {...experimental, auxCode: checked}});
            },
          }),
        }),
      ],
    });
  };
