/* Aux-owned source: the Agent settings page (assets/agents-urkO3LLg.js, after its imports; Ls
 * exported as component). The completion sound (default or a short uploaded clip), the bundled agent
 * runtime and its install, cleaning up agent tabs, task notifications, the default access permission,
 * follow-up behavior (queue or steer), Messages access, the sandbox with file roots and tool rules,
 * and Ask Aux on tab switch.
 * Names the rest of the chunk uses keep their chunk names: Ls the page.
 * Chunk names used: S useApp, O analytics, I useTRPC, R useQuery, z useMutation, ne useQueryClient,
 * N update settings, ee confirm, Le the side panel mode, pe/fe React. */
var jsxRuntime = ge(),
  SoundIcon = ({size = 24, ariaHidden = true, ...a}) =>
    (0, jsxRuntime.jsxs)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...a,
      children: [
        (0, jsxRuntime.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M18 13C18.5523 13 19 13.4477 19 14V16H21C21.5523 16 22 16.4477 22 17C22 17.5523 21.5523 18 21 18H19V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V18H15C14.4477 18 14 17.5523 14 17C14 16.4477 14.4477 16 15 16H17V14C17 13.4477 17.4477 13 18 13Z',
          fill: 'currentColor',
        }),
        (0, jsxRuntime.jsx)('path', {
          d: 'M8.73241 3C9.85868 3 10.9104 3.56288 11.5352 4.5C12.1599 5.43712 13.2117 6 14.338 6H18C20.2091 6 22 7.79086 22 10V12.5278C20.9385 11.5777 19.5367 11 18 11C14.6863 11 12 13.6863 12 17C12 18.0929 12.2922 19.1175 12.8027 20H6C3.79086 20 2 18.2091 2 16V7C2 4.79086 3.79086 3 6 3H8.73241Z',
          fill: 'currentColor',
        }),
      ],
    }),
  React = pe(fe(), 1),
  SOUND_TYPES = 'audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/webm,.wav,.mp3,.m4a,.aac,.ogg,.webm',
  SOUND_MAX_BYTES = 524288,
  DEFAULT_SOUND = {
    enabled: true,
  } /** The completion sound: on or off, the default or an uploaded clip (up to 512 KB), and a preview. */,
  CompletionSound = () => {
    const {accountId} = S(),
      {capture} = O(),
      a = I(),
      r = ne(),
      o = (0, React.useRef)(null),
      n = (0, React.useRef)(null),
      i = (0, React.useRef)(null),
      {data} = R(a.settings.getAll.queryOptions({accountId}, {select: d => d.completionSound})),
      m = N({accountId, syncGetAllCache: true}),
      u = data ?? DEFAULT_SOUND,
      h = u.enabled,
      c = u.customFileName,
      w = d => {
        for (const x of d.warnings) f.warning(x);
        (r.setQueryData(a.settings.getAll.queryKey({accountId}), d.settings),
          r.invalidateQueries({queryKey: a.settings.getCompletionSound.queryKey({accountId})}));
      },
      p = z(
        a.settings.setCompletionSound.mutationOptions({
          onSuccess: d => {
            (w(d),
              capture('settings.completion-sound.set-custom', {
                fileName: d.settings.completionSound.customFileName ?? '',
              }));
          },
          onError: d => f.error(d.message),
        }),
      ),
      K = z(
        a.settings.resetCompletionSound.mutationOptions({
          onSuccess: d => {
            (w(d), capture('settings.completion-sound.reset'));
          },
          onError: d => f.error(d.message),
        }),
      ),
      H = R({...a.settings.getCompletionSound.queryOptions({accountId}), enabled: false}),
      F = m.isPending || p.isPending || K.isPending || H.isFetching,
      W = (d, x) => {
        (n.current?.pause(),
          (n.current = null),
          i.current && (URL.revokeObjectURL(i.current), (i.current = null)),
          x && (i.current = x));
        const C = new Audio(d);
        ((C.volume = Ue),
          (n.current = C),
          (C.onended = () => {
            (n.current === C && (n.current = null), i.current && (URL.revokeObjectURL(i.current), (i.current = null)));
          }),
          C.play().catch(() => f.error('Could not play completion sound.')));
      },
      ue = d => {
        (m.mutate({accountId, key: 'completionSound', value: {...u, enabled: d}}),
          capture('settings.completion-sound.set-enabled', {value: d}));
      },
      me = async () => {
        if (!c) {
          W('/sounds/success.wav');
          return;
        }
        const d = (await H.refetch()).data;
        if (!d) {
          f.error('Custom completion sound is missing. Reset to default or choose a new file.');
          return;
        }
        const x = Me(d.data, d.mimeType);
        W(x, x);
      },
      he = async d => {
        const x = d.target.files?.[0];
        if (((d.target.value = ''), !!x)) {
          if (x.size > SOUND_MAX_BYTES) {
            f.error('Sound file must be 512 KB or smaller.');
            return;
          }
          try {
            const C = await readBase64(x);
            p.mutate({accountId, fileName: x.name, mimeType: x.type || 'application/octet-stream', data: C});
          } catch {
            f.error('Failed to read file.');
          }
        }
      };
    return (0, jsxRuntime.jsxs)(g, {
      className: 'flex flex-col px-0',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex w-full items-center justify-between px-2.5',
          children: [
            (0, jsxRuntime.jsx)(v, {
              title: 'Completion sound',
              description: 'Play a sound when agents finish or need attention',
            }),
            (0, jsxRuntime.jsx)(y, {
              className: 'max-w-none items-center gap-1.5',
              children: (0, jsxRuntime.jsx)(re, {checked: h, disabled: F, onCheckedChange: ue}),
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex w-full items-center gap-1 px-2.5',
          children: [
            (0, jsxRuntime.jsxs)(j, {
              variant: 'outline',
              size: 'xs',
              'aria-label': 'Play completion sound',
              disabled: F,
              onClick: () => {
                me();
              },
              children: [(0, jsxRuntime.jsx)(Ne, {}), (0, jsxRuntime.jsx)('span', {children: 'Preview'})],
            }),
            (0, jsxRuntime.jsxs)(ve, {
              children: [
                (0, jsxRuntime.jsx)(j, {
                  variant: 'outline',
                  size: 'xs',
                  disabled: F,
                  onClick: () => o.current?.click(),
                  children: 'Change',
                }),
                c &&
                  (0, jsxRuntime.jsxs)(Q, {
                    children: [
                      (0, jsxRuntime.jsx)(B, {
                        render: (0, jsxRuntime.jsx)(j, {
                          variant: 'outline',
                          size: 'icon-xs',
                          disabled: F,
                          onClick: () => K.mutate({accountId}),
                        }),
                        children: (0, jsxRuntime.jsx)(Te, {}),
                      }),
                      (0, jsxRuntime.jsx)(G, {children: 'Reset to default'}),
                    ],
                  }),
              ],
            }),
            c &&
              (0, jsxRuntime.jsx)('span', {
                className: 'text-muted-foreground min-w-0 truncate pl-1 text-xs font-medium',
                title: c,
                children: c,
              }),
            (0, jsxRuntime.jsx)('input', {
              ref: o,
              type: 'file',
              className: 'hidden',
              accept: SOUND_TYPES,
              onChange: d => {
                he(d);
              },
            }),
          ],
        }),
      ],
    });
  }; /** A file’s contents as base64. */
function readBase64(s) {
  return new Promise((t, a) => {
    const r = new FileReader();
    ((r.onerror = () => a(r.error ?? new Error('Failed to read file'))),
      (r.onload = () => {
        if (typeof r.result != 'string') {
          a(new Error('Failed to read file'));
          return;
        }
        const [, o = ''] = r.result.split(',', 2);
        t(o);
      }),
      r.readAsDataURL(s));
  });
}
var /** The bundled agent runtime: its version, and installing or repairing it with progress. */
  AgentRuntime = () => {
    const s = I(),
      t = ne(),
      a = R(s.agentRuntime.status.queryOptions()),
      r = R({
        ...s.agentRuntime.job.queryOptions(),
        refetchInterval: p => (p.state.data?.state === 'running' ? 400 : false),
      }),
      o = (0, React.useRef)(false),
      n = z(
        s.agentRuntime.install.mutationOptions({
          onSuccess: p => t.setQueryData(s.agentRuntime.job.queryKey(), p),
          onError: () => {
            ((o.current = false), f.error('Could not install the agent runtime.'));
          },
        }),
      ),
      i = a.data?.installed === true,
      l = a.data?.installed ? a.data : null,
      m = r.data,
      u = m?.state === 'running' ? m.percent : null,
      h = u !== null,
      c = () => {
        ((o.current = true), n.mutate({force: i}));
      },
      w = () => {
        a.refetch();
      };
    return (
      (0, React.useEffect)(() => {
        const p = r.data;
        if (!(!p || p.state === 'idle')) {
          if (p.state === 'running') {
            o.current = true;
            return;
          }
          if (o.current) {
            if (((o.current = false), p.state === 'succeeded')) {
              (t.setQueryData(s.agentRuntime.status.queryKey(), p.status),
                f.success(a.data?.installed ? 'Agent runtime reinstalled.' : 'Agent runtime installed.'));
              return;
            }
            f.error('Could not install the agent runtime.', {description: p.error});
          }
        }
      }, [r.data, t, a.data?.installed, s]),
      (0, jsxRuntime.jsx)(k, {
        label: 'Agent runtime',
        title: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            (0, jsxRuntime.jsx)('span', {className: 'mr-0.5', children: 'Agent runtime'}),
            (0, jsxRuntime.jsxs)(te, {
              children: [
                (0, jsxRuntime.jsx)(se, {
                  className: 'align-middle',
                  openOnHover: true,
                  children: (0, jsxRuntime.jsx)(Ee, {className: '-mt-px size-3.5'}),
                }),
                (0, jsxRuntime.jsx)(ae, {
                  className: 'w-80 space-y-1 px-3 py-2.5 text-sm',
                  children: (0, jsxRuntime.jsx)(RuntimeNote, {}),
                }),
              ],
            }),
          ],
        }),
        children: (0, jsxRuntime.jsxs)(A, {
          children: [
            l &&
              (0, jsxRuntime.jsx)(g, {
                children: (0, jsxRuntime.jsx)(v, {
                  title: 'Current version',
                  description: runtimeVersion(l.version, l.latestVersion, l.updateAvailable),
                }),
              }),
          ],
        }),
      })
    );
  },
  RuntimeNote = () =>
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)('p', {
          children: 'The agent runtime ships with Aux: Node.js, Python, fast file search and other tools.',
        }),
        (0, jsxRuntime.jsx)('p', {
          children:
            'Agents use it to run terminal commands and built-in skills on your Mac, so documents and scripts work whatever you have installed.',
        }),
      ],
    }),
  runtimeVersion = s => `Version ${s}, bundled with Aux.`,
  TAB_CLEANUP_OPTIONS = [
    {value: 5, label: 'After 5 min'},
    {value: 10, label: 'After 10 min'},
    {value: 15, label: 'After 15 min'},
    {value: 30, label: 'After 30 min'},
    {value: 60, label: 'After an hour'},
    {value: 120, label: 'After 2 hours'},
  ],
  DEFAULT_CLEANUP_MINUTES = 15 /** Close agent tabs after a while. */,
  TabCleanup = () => {
    const {accountId} = S(),
      {capture} = O(),
      a = I(),
      {data} = R(a.settings.getAll.queryOptions({accountId}, {select: l => l.agentTabs})),
      o = N({accountId, syncGetAllCache: true}),
      n = data?.closeAfterIdleMinutes ?? DEFAULT_CLEANUP_MINUTES,
      i = l => {
        if (!l) return;
        const m = {closeAfterIdleMinutes: Number.parseInt(l, 10)};
        (o.mutate({accountId, key: 'agentTabs', value: m}),
          capture('settings.agent-tabs.set-close-after-idle-minutes', {value: m.closeAfterIdleMinutes}));
      };
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsx)(v, {
          title: 'Clean up agent tabs',
          description: 'Automatically close tabs Aux used for tasks',
        }),
        (0, jsxRuntime.jsx)(y, {
          children: (0, jsxRuntime.jsxs)(U, {
            value: n.toString(),
            onValueChange: i,
            disabled: o.isPending,
            children: [
              (0, jsxRuntime.jsx)(D, {className: 'w-full font-medium', children: (0, jsxRuntime.jsx)(M, {})}),
              (0, jsxRuntime.jsx)(P, {
                children: TAB_CLEANUP_OPTIONS.map(l =>
                  (0, jsxRuntime.jsx)(T, {value: l.value.toString(), children: l.label}, l.value),
                ),
              }),
            ],
          }),
        }),
      ],
    });
  },
  DEFAULT_NOTIFICATIONS = {needsAttention: true, taskCompletions: true, routineCompletions: true},
  NOTIFICATION_KINDS = [
    {key: 'needsAttention', label: 'Needs attention', description: 'Approvals, questions, and confirmations'},
    {key: 'taskCompletions', label: 'Task completions', description: 'Tasks you start when they finish'},
    {
      key: 'routineCompletions',
      label: 'Routine completions',
      description: 'Tasks started by routines when they finish',
    },
  ] /** Which task events notify: needing attention, task and routine completions. */,
  TaskNotifications = () => {
    const {accountId} = S(),
      {capture} = O(),
      a = I(),
      {data} = R(a.settings.getAll.queryOptions({accountId}, {select: u => u.agentTaskNotifications})),
      o = N({accountId, syncGetAllCache: true}),
      n = data ?? DEFAULT_NOTIFICATIONS,
      i = NOTIFICATION_KINDS.filter(u => n[u.key]),
      l = i.length === 0 ? 'Off' : i.length === NOTIFICATION_KINDS.length ? 'Everything' : `${i.length} categories`,
      m = u => h => {
        const c = !!h,
          w = {...n, [u]: c};
        (o.mutate({accountId, key: 'agentTaskNotifications', value: w}),
          capture('settings.agent-task-notifications.set-category', {category: u, value: c}));
      };
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsx)(v, {
          title: 'Task notifications',
          description:
            i.length === 0 ? 'Task notifications are disabled' : 'Aux can notify you when tasks finish while unfocused',
        }),
        (0, jsxRuntime.jsx)(y, {
          children: (0, jsxRuntime.jsxs)(Se, {
            children: [
              (0, jsxRuntime.jsxs)(Ce, {
                render: (0, jsxRuntime.jsx)(j, {
                  className: 'w-40 justify-between',
                  variant: 'outline',
                  disabled: o.isPending,
                }),
                children: [
                  (0, jsxRuntime.jsx)('span', {className: xe(i.length === 0 && 'text-muted-foreground'), children: l}),
                  (0, jsxRuntime.jsx)(Fe, {className: 'text-muted-foreground', 'data-icon': 'inline-end'}),
                ],
              }),
              (0, jsxRuntime.jsx)(Ae, {
                align: 'end',
                className: 'w-72',
                children: NOTIFICATION_KINDS.map(u =>
                  (0, jsxRuntime.jsx)(
                    we,
                    {
                      checked: n[u.key],
                      closeOnClick: false,
                      disabled: o.isPending,
                      onCheckedChange: m(u.key),
                      children: (0, jsxRuntime.jsxs)('span', {
                        className: 'flex min-w-0 flex-col gap-0.5',
                        children: [
                          (0, jsxRuntime.jsx)('span', {children: u.label}),
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-muted-foreground text-xs',
                            children: u.description,
                          }),
                        ],
                      }),
                    },
                    u.key,
                  ),
                ),
              }),
            ],
          }),
        }),
      ],
    });
  } /** The access permission agents start with. */,
  DefaultPermission = () => {
    const {accountId} = S(),
      t = Oe(),
      a = N({accountId, syncGetAllCache: true}),
      r = o => {
        o === null || o === t || a.mutate({accountId, key: 'defaultPermissionMode', value: o});
      };
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsx)(v, {title: 'Access permission', description: 'Read and write permission for agents.'}),
        (0, jsxRuntime.jsx)(y, {
          children: (0, jsxRuntime.jsxs)(U, {
            value: t,
            disabled: a.isPending,
            onValueChange: r,
            children: [
              (0, jsxRuntime.jsx)(D, {
                className: 'w-full',
                'aria-label': 'Default permission',
                children: (0, jsxRuntime.jsx)(M, {
                  children: o => {
                    if (o == null) return null;
                    const {icon, label} = Y[o];
                    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                      children: [(0, jsxRuntime.jsx)(icon, {className: 'size-4'}), label],
                    });
                  },
                }),
              }),
              (0, jsxRuntime.jsx)(P, {
                children: Ie.map(o => {
                  const {icon, label, description} = Y[o];
                  return (0, jsxRuntime.jsxs)(
                    Q,
                    {
                      children: [
                        (0, jsxRuntime.jsxs)(B, {
                          render: (0, jsxRuntime.jsx)(T, {value: o}),
                          children: [(0, jsxRuntime.jsx)(icon, {className: 'size-4'}), label],
                        }),
                        (0, jsxRuntime.jsx)(G, {
                          side: 'right',
                          align: 'start',
                          sideOffset: 8,
                          className: 'max-w-64 text-pretty',
                          children: description,
                        }),
                      ],
                    },
                    o,
                  );
                }),
              }),
            ],
          }),
        }),
      ],
    });
  } /** Queue follow-ups while Aux runs, or steer the current run. */,
  FollowUpBehavior = () => {
    const {accountId} = S(),
      {capture} = O(),
      a = I(),
      {data = qe} = R(a.settings.getAll.queryOptions({accountId}, {select: i => i.followUpBehavior})),
      o = N({accountId, syncGetAllCache: true}),
      n = i => {
        if (i === null || i === data) return;
        const l = {accountId, key: 'followUpBehavior', value: i};
        o.mutate(l, {
          onSuccess: () => {
            capture('settings.chat.set-follow-up-behavior', {value: i});
          },
        });
      };
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsx)(v, {
          title: 'Follow-up behavior',
          description: 'Queue follow-ups while Aux runs or steer the current run.',
        }),
        (0, jsxRuntime.jsx)(y, {
          children: (0, jsxRuntime.jsxs)(U, {
            value: data,
            onValueChange: n,
            children: [
              (0, jsxRuntime.jsx)(D, {className: 'w-full', children: (0, jsxRuntime.jsx)(M, {placeholder: 'Select…'})}),
              (0, jsxRuntime.jsxs)(P, {
                children: [
                  (0, jsxRuntime.jsx)(T, {value: 'queue', children: 'Queue'}),
                  (0, jsxRuntime.jsx)(T, {value: 'steer', children: 'Steer'}),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  } /** Messages access: reading iMessages and sending approved messages. */,
  MessagesAccess = () => {
    const {isMac} = ze();
    return isMac
      ? (0, jsxRuntime.jsxs)(g, {
          children: [
            (0, jsxRuntime.jsx)(v, {
              title: 'Messages access',
              description: 'Let Aux read your iMessages and send messages you approve.',
            }),
            (0, jsxRuntime.jsx)(y, {children: (0, jsxRuntime.jsx)(Be, {label: 'Set up', size: 'default'})}),
          ],
        })
      : null;
  },
  DEFAULT_RULES = {allow: [], ask: [], deny: [], default: 'allow'},
  DEFAULT_FILES = {readableRoots: [], writableRoots: [], outsideRead: 'ask', outsideWrite: 'ask'},
  RULE_ACTIONS = [
    {key: 'allow', label: 'Allow'},
    {key: 'ask', label: 'Ask'},
    {key: 'deny', label: 'Deny'},
  ] /** The sandbox: on or off, folders it can view and edit, and tool rules. */,
  Sandbox = () =>
    (0, jsxRuntime.jsxs)(SandboxProvider, {
      children: [
        (0, jsxRuntime.jsx)(k, {
          title: 'Sandbox',
          children: (0, jsxRuntime.jsx)(A, {children: (0, jsxRuntime.jsx)(SandboxToggle, {})}),
        }),
        (0, jsxRuntime.jsx)(k, {
          title: 'File permissions',
          children: (0, jsxRuntime.jsxs)(A, {
            children: [(0, jsxRuntime.jsx)(FileRoots, {mode: 'read'}), (0, jsxRuntime.jsx)(FileRoots, {mode: 'write'})],
          }),
        }),
        (0, jsxRuntime.jsx)(k, {
          label: 'Tool permissions',
          title: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
            children: [
              (0, jsxRuntime.jsx)('span', {className: 'mr-0.5', children: 'Tool permissions'}),
              (0, jsxRuntime.jsxs)(Q, {
                children: [
                  (0, jsxRuntime.jsx)(B, {
                    className: '-mt-px align-middle',
                    'aria-label': 'Rule precedence',
                    children: (0, jsxRuntime.jsx)(_e, {className: 'size-3.5'}),
                  }),
                  (0, jsxRuntime.jsx)(G, {
                    children: (0, jsxRuntime.jsx)('p', {children: 'Deny wins before Ask, then Allow.'}),
                  }),
                ],
              }),
            ],
          }),
          children: (0, jsxRuntime.jsx)(A, {children: (0, jsxRuntime.jsx)(ToolRules, {})}),
        }),
      ],
    }),
  SandboxContext = (0, React.createContext)(null);
function useSandbox() {
  const s = (0, React.use)(SandboxContext);
  if (!s) throw new Error('useAccountSettings must be used within AccountContext');
  return s;
}
var /** The sandbox settings and how to change them. */
  SandboxProvider = ({children}) => {
    const {accountId} = S(),
      a = I(),
      {data: r} = J(a.settings.getAll.queryOptions({accountId})),
      {data} = J(a.projects.getSkillsDirectory.queryOptions({accountId, projectId: null})),
      n = data.replace(/\/skills$/, ''),
      i = N({
        accountId,
        onSuccess: (m, u, h, c) => {
          c.client.invalidateQueries(a.settings.getAll.queryFilter({accountId}));
        },
        onError: () => f.error('Could not update permissions.'),
      }),
      l = (0, React.useCallback)(
        m => {
          i.mutate({accountId, key: 'permission', value: mergePermission(r.permission, m)});
        },
        [accountId, r.permission, i],
      );
    return (0, jsxRuntime.jsx)(SandboxContext, {
      value: {accountSettings: r, accountDir: n, patchPermission: l},
      children,
    });
  },
  SandboxToggle = () => {
    const {accountSettings, patchPermission} = useSandbox(),
      {confirm} = ee(),
      r = accountSettings.permission?.sandbox?.enabled ?? true,
      o = n => {
        if (n) {
          patchPermission({sandbox: {enabled: true}});
          return;
        }
        confirm(
          {
            title: 'Disable sandbox?',
            description:
              'Commands will no longer be limited to the files and folders you allow. Only turn this off if you understand the risk.',
            ui: {action: 'Disable', variant: 'destructive'},
          },
          () => patchPermission({sandbox: {enabled: false}}),
        );
      };
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsx)(v, {
          title: 'Enable sandbox',
          description:
            'Aux runs commands in a sandbox, which keeps its work limited to the files and folders you allow.',
        }),
        (0, jsxRuntime.jsx)(y, {children: (0, jsxRuntime.jsx)(re, {checked: r, onCheckedChange: o})}),
      ],
    });
  } /** Folders the project can view, or edit. */,
  FileRoots = ({mode}) => {
    const {accountSettings, accountDir, patchPermission} = useSandbox(),
      {confirm} = ee(),
      n = fileRules(accountSettings.permission),
      i = mode === 'read' ? n.readableRoots : n.writableRoots,
      l = mode === 'read' ? 'Can view' : 'Can edit',
      m =
        mode === 'read'
          ? 'The project can view files in these folders, but cannot edit them unless they are also added below.'
          : 'The project can create, edit, and delete files in these folders. Keep this list small.',
      u = async () => {
        try {
          const c = await Re({
            method: 'Aux.pickDirectory',
            params: {
              prompt:
                mode === 'read' ? 'Choose a folder the project can open' : 'Choose a folder the project can change',
            },
          });
          if (c.status === 'cancelled') return;
          if (c.status === 'unavailable' || !c.path) {
            f.error('Folder picker is not available on this device.');
            return;
          }
          patchPermission({
            files: {
              ...n,
              readableRoots: mode === 'read' ? unique(n.readableRoots, c.path) : n.readableRoots,
              writableRoots: mode === 'write' ? unique(n.writableRoots, c.path) : n.writableRoots,
            },
          });
        } catch (c) {
          (f.error('There was an error opening the folder picker.'), console.error(c));
        }
      },
      h = c => () => {
        confirm({title: 'Remove file root?', description: c, ui: {action: 'Remove', variant: 'destructive'}}, () =>
          patchPermission({
            files: {
              ...n,
              readableRoots: mode === 'read' ? n.readableRoots.filter(w => w !== c) : n.readableRoots,
              writableRoots: mode === 'write' ? n.writableRoots.filter(w => w !== c) : n.writableRoots,
            },
          }),
        );
      };
    return (0, jsxRuntime.jsxs)(g, {
      className: 'flex-col items-stretch gap-3',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex items-center justify-between gap-3',
          children: [
            (0, jsxRuntime.jsx)(v, {title: l, description: m}),
            (0, jsxRuntime.jsxs)(j, {
              variant: 'outline',
              size: 'sm',
              onClick: u,
              children: [(0, jsxRuntime.jsx)(SoundIcon, {className: 'size-4'}), 'Add'],
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'border-border/70 divide-border/70 divide-y border-t',
          children: [
            (0, jsxRuntime.jsxs)('div', {
              className: 'flex items-center gap-3 py-2 pr-1 pl-4',
              children: [
                (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground text-sm font-medium',
                  children: 'Project root',
                }),
                (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground min-w-0 grow truncate font-mono text-xs',
                  children: accountDir,
                }),
                (0, jsxRuntime.jsx)(je, {variant: 'secondary', className: 'gap-1', children: 'Default'}),
              ],
            }),
            i.map(c =>
              (0, jsxRuntime.jsxs)(
                'div',
                {
                  className: 'flex min-h-10 items-center gap-3 py-2 pr-1 pl-4',
                  children: [
                    (0, jsxRuntime.jsx)('span', {
                      className: 'text-muted-foreground min-w-0 grow truncate font-mono text-xs',
                      children: c,
                    }),
                    (0, jsxRuntime.jsx)(j, {
                      className: 'hover:bg-destructive/20! focus-visible:bg-destructive/20!',
                      variant: 'ghost',
                      size: 'icon-sm',
                      'aria-label': `Remove ${c}`,
                      onClick: h(c),
                      children: (0, jsxRuntime.jsx)(ie, {className: 'text-destructive size-4'}),
                    }),
                  ],
                },
                c,
              ),
            ),
          ],
        }),
      ],
    });
  } /** Tool rules: allowed, asked and denied tools, and what happens otherwise. */,
  ToolRules = () => {
    const {accountSettings, patchPermission} = useSandbox(),
      a = toolRules(accountSettings.permission),
      r = (n, i) => {
        const l = i.trim();
        if (!l) return false;
        const m = {type: 'tool', tool: l};
        return (patchPermission({rules: {...a, [n]: [...a[n], m]}}), true);
      },
      o = (n, i) => () => {
        patchPermission({rules: {...a, [n]: a[n].filter((l, m) => m !== i)}});
      };
    return (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {
      children: RULE_ACTIONS.map(({key, label}) =>
        (0, jsxRuntime.jsxs)(
          g,
          {
            className: 'flex-col items-stretch gap-0 px-0 py-1 select-none',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'flex min-h-8 items-center gap-3 pr-2 pl-4',
                children: [
                  (0, jsxRuntime.jsx)('h4', {className: 'w-10 text-sm font-medium', children: label}),
                  (0, jsxRuntime.jsx)('span', {
                    className: 'text-muted-foreground grow text-sm',
                    children: actionDescription(key),
                  }),
                  (0, jsxRuntime.jsx)(AddRule, {group: key, label, onAdd: r}),
                ],
              }),
              (0, jsxRuntime.jsxs)('div', {
                className: 'space-y-px px-4',
                children: [
                  a[key].map((l, m) =>
                    (0, jsxRuntime.jsxs)(
                      'div',
                      {
                        className: 'flex min-h-8 items-center gap-3 py-1 pl-14',
                        children: [
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-foreground min-w-0 grow truncate font-mono text-xs',
                            children: ruleLabel(l),
                          }),
                          (0, jsxRuntime.jsx)(j, {
                            className: 'hover:bg-destructive/20! focus-visible:bg-destructive/20!',
                            variant: 'ghost',
                            size: 'icon-sm',
                            'aria-label': `Remove ${ruleLabel(l)}`,
                            onClick: o(key, m),
                            children: (0, jsxRuntime.jsx)(ie, {className: 'text-destructive size-4'}),
                          }),
                        ],
                      },
                      `${key}-${m}-${ruleLabel(l)}`,
                    ),
                  ),
                  !a[key]?.length &&
                    (0, jsxRuntime.jsxs)('div', {
                      className: 'text-muted-foreground flex items-center pb-2 pl-13 text-sm opacity-50',
                      children: ['No ', key, ' rules'],
                    }),
                ],
              }),
            ],
          },
          key,
        ),
      ),
    });
  },
  AddRule = ({group, label, onAdd}) => {
    const [r, o] = (0, React.useState)(false),
      [n, i] = (0, React.useState)(''),
      l = () => {
        onAdd(group, n) && (i(''), o(false));
      },
      m = h => {
        i(h.target.value);
      },
      u = h => {
        h.key === 'Enter' && l();
      };
    return (0, jsxRuntime.jsxs)(te, {
      open: r,
      onOpenChange: o,
      children: [
        (0, jsxRuntime.jsxs)(se, {
          render: (0, jsxRuntime.jsx)(j, {variant: 'ghost', size: 'sm', className: 'text-primary px-2'}),
          children: [(0, jsxRuntime.jsx)(be, {className: 'size-4'}), 'Add Rule'],
        }),
        (0, jsxRuntime.jsx)(ae, {
          className: 'w-80 p-3',
          align: 'end',
          children: (0, jsxRuntime.jsxs)('div', {
            className: 'space-y-3',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                children: [
                  (0, jsxRuntime.jsxs)('p', {
                    className: 'text-foreground text-sm font-medium',
                    children: ['Add ', label.toLowerCase(), ' rule'],
                  }),
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-muted-foreground text-xs',
                    children: actionDescription(group),
                  }),
                ],
              }),
              (0, jsxRuntime.jsxs)('div', {
                className: 'flex items-center gap-2',
                children: [
                  (0, jsxRuntime.jsx)(ye, {
                    value: n,
                    placeholder: 'Tool name or glob, e.g. bash or mcp__*',
                    onChange: m,
                    onKeyDown: u,
                  }),
                  (0, jsxRuntime.jsx)(j, {size: 'sm', disabled: !n.trim(), onClick: l, children: 'Add'}),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  };
function toolRules(s) {
  const t = s?.rules;
  return {
    allow: t?.allow ?? DEFAULT_RULES.allow,
    ask: t?.ask ?? DEFAULT_RULES.ask,
    deny: t?.deny ?? DEFAULT_RULES.deny,
    default: t?.default ?? DEFAULT_RULES.default,
  };
}
function fileRules(s) {
  const t = s?.files;
  return {
    readableRoots: t?.readableRoots ?? DEFAULT_FILES.readableRoots,
    writableRoots: t?.writableRoots ?? DEFAULT_FILES.writableRoots,
    outsideRead: t?.outsideRead ?? DEFAULT_FILES.outsideRead,
    outsideWrite: t?.outsideWrite ?? DEFAULT_FILES.outsideWrite,
  };
} /** A permission with a change applied, keeping what the change does not set. */
function mergePermission(s, t) {
  const a = toolRules(s),
    r = fileRules(s);
  return {
    rules: t.rules
      ? {
          allow: t.rules.allow ?? a.allow,
          ask: t.rules.ask ?? a.ask,
          deny: t.rules.deny ?? a.deny,
          default: t.rules.default ?? a.default,
        }
      : a,
    files: t.files
      ? {
          readableRoots: t.files.readableRoots ?? r.readableRoots,
          writableRoots: t.files.writableRoots ?? r.writableRoots,
          outsideRead: t.files.outsideRead ?? r.outsideRead,
          outsideWrite: t.files.outsideWrite ?? r.outsideWrite,
        }
      : r,
    sandbox: {enabled: t.sandbox?.enabled ?? s?.sandbox?.enabled ?? true},
  };
}
function unique(s, ...t) {
  return [...new Set([...s, ...t])];
} /** A rule’s text: the tool, the browser action and URL, or the URL. */
function ruleLabel(s) {
  return s.type === 'tool' ? s.tool : s.type === 'browser' ? `${s.action}${s.url ? ` ${s.url}` : ''}` : s.url;
}
function actionDescription(s) {
  return s === 'allow' ? 'Run without confirmation.' : s === 'ask' ? 'Ask before running.' : 'Reject before execution.';
}
var /** Ask Aux on tab switch: a new chat per tab, or keep the current one. */
  TabSwitchChat = () => {
    const {accountId} = S(),
      {capture} = O(),
      {mode} = Le(),
      r = N({accountId, syncGetAllCache: true}),
      o = n => {
        if (n === null || n === mode) return;
        const i = {accountId, key: 'sidepanelSessionOnTabChange', value: n};
        r.mutate(i, {
          onSuccess: () => {
            capture('settings.chat.set-sidepanel-session-on-tab-change', {value: n});
          },
        });
      };
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsx)(v, {
          title: 'Ask Aux on tab switch',
          description: 'When you switch tabs, start a new chat or keep the current chat.',
        }),
        (0, jsxRuntime.jsx)(y, {
          className: 'shrink-0',
          children: (0, jsxRuntime.jsxs)(U, {
            value: mode,
            onValueChange: o,
            children: [
              (0, jsxRuntime.jsx)(D, {children: (0, jsxRuntime.jsx)(M, {placeholder: 'Select…'})}),
              (0, jsxRuntime.jsxs)(P, {
                align: 'end',
                alignItemWithTrigger: false,
                className: 'w-max min-w-max',
                children: [
                  (0, jsxRuntime.jsx)(T, {value: 'new-session', children: 'New chat per tab'}),
                  (0, jsxRuntime.jsx)(T, {value: 'keep-session', children: 'Keep current chat'}),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  }; /** The Agent page. */
function Ls() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(Ge, {segments: ['Settings', 'Agent']}),
      (0, jsxRuntime.jsx)(De, {children: (0, jsxRuntime.jsx)('h1', {children: 'Agent'})}),
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(Pe, {}),
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'space-y-8',
          children: [
            (0, jsxRuntime.jsx)(AuxAgentSettings, {}),
            (0, jsxRuntime.jsxs)(k, {
              title: 'Chat',
              children: [
                (0, jsxRuntime.jsxs)(A, {
                  children: [(0, jsxRuntime.jsx)(TaskNotifications, {}), (0, jsxRuntime.jsx)(CompletionSound, {})],
                }),
                (0, jsxRuntime.jsxs)(A, {
                  children: [(0, jsxRuntime.jsx)(DefaultPermission, {}), (0, jsxRuntime.jsx)(FollowUpBehavior, {})],
                }),
              ],
            }),
            (0, jsxRuntime.jsx)(k, {
              title: 'Agent tabs',
              children: (0, jsxRuntime.jsx)(A, {children: (0, jsxRuntime.jsx)(TabCleanup, {})}),
            }),
            (0, jsxRuntime.jsx)(k, {
              title: 'Computer Use',
              children: (0, jsxRuntime.jsx)(A, {children: (0, jsxRuntime.jsx)(MessagesAccess, {})}),
            }),
            (0, jsxRuntime.jsx)(Sandbox, {}),
            (0, jsxRuntime.jsx)(AgentRuntime, {}),
          ],
        }),
      }),
    ],
  });
}
