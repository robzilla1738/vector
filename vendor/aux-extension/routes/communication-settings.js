/* Aux-owned source: Settings › Communications (assets/communication-xjhkYtDb.js, the module body): whether
 * Aux may send, whether it asks first, following up, matching your tone, and which detected apps it may
 * use. iMessage needs Full Disk Access on a Mac, so its tile sets that up first.
 * Names the rest of the chunk uses keep their chunk names: ce the page (exported).
 * Chunk names used: y/A React, N JSX runtime, p cn, I useApp, _ useQuery, R useTRPC, c/j/b/w/k the select,
 * F/P/D the tooltip, G Textarea, d/r/v/u/M/U the settings page kit, E useUpdateSettings, x Switch,
 * O/q the Messages icon and Full Disk Access, B DocumentTitle, L experimental badge, V a site's icon. */
var React = y(A(), 1),
  jsxRuntime = N(),
  /** The apps the page lists. */
  APPS = [
    {id: 'gmail', label: 'Gmail', host: 'mail.google.com'},
    {id: 'imessage', label: 'iMessage'},
    {id: 'slack', label: 'Slack', host: 'slack.com'},
    {id: 'linkedin', label: 'LinkedIn', host: 'linkedin.com'},
    {id: 'x', label: 'X', host: 'x.com'},
    {id: 'discord', label: 'Discord', host: 'discord.com'},
    {id: 'telegram', label: 'Telegram', host: 'telegram.org'},
    {id: 'whatsapp', label: 'WhatsApp', host: 'whatsapp.com'},
  ],
  /** The communication settings and how to save them. */
  useCommunication = () => {
    const {accountId} = I(),
      trpc = R(),
      {data: saved} = _(trpc.settings.getAll.queryOptions({accountId}, {select: settings => settings.communication})),
      updateSettings = E({accountId, syncGetAllCache: true}),
      value = saved ?? {
        enabled: false,
        beforeSending: 'ask',
        apps: {
          gmail: true,
          imessage: true,
          slack: true,
          linkedin: true,
          x: true,
          discord: true,
          telegram: true,
          whatsapp: true,
        },
        watchReplies: {enabled: false, duration: '3d'},
        matchTone: {enabled: false, customInstructions: ''},
        identities: {
          agentPhone: {enabled: false, number: ''},
          agentMail: {enabled: false, address: '', forwardReplies: true},
        },
      },
      patch = next => {
        updateSettings.mutate({accountId, key: 'communication', value: next});
      };
    return {accountId, isPending: updateSettings.isPending, patch, value};
  },
  /** The switches and choices. */
  CommunicationSettings = () => {
    const {isPending, patch, value} = useCommunication(),
      isOff = !value.enabled;
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(v, {
          children: [
            (0, jsxRuntime.jsxs)(r, {
              children: [
                (0, jsxRuntime.jsx)(d, {
                  title: 'Allow sending',
                  description: 'Aux may reach people from the apps you turn on.',
                }),
                (0, jsxRuntime.jsx)(u, {
                  children: (0, jsxRuntime.jsx)(x, {
                    checked: value.enabled,
                    disabled: isPending,
                    onCheckedChange: next => patch({...value, enabled: next}),
                  }),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(r, {
              children: [
                (0, jsxRuntime.jsx)(d, {
                  title: 'Ask before sending',
                  description: 'Drafts still show in the session for review.',
                }),
                (0, jsxRuntime.jsx)(u, {
                  className: 'max-w-52',
                  children: (0, jsxRuntime.jsxs)(k, {
                    value: value.beforeSending,
                    disabled: isOff || isPending,
                    onValueChange: next => {
                      (next === 'ask' || next === 'auto') && patch({...value, beforeSending: next});
                    },
                    children: [
                      (0, jsxRuntime.jsx)(b, {className: 'w-full font-medium', children: (0, jsxRuntime.jsx)(w, {})}),
                      (0, jsxRuntime.jsxs)(j, {
                        children: [
                          (0, jsxRuntime.jsx)(c, {value: 'ask', children: 'Ask every time'}),
                          (0, jsxRuntime.jsx)(c, {value: 'auto', children: 'Send without asking'}),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(r, {
              children: [
                (0, jsxRuntime.jsx)(d, {
                  title: 'Follow up after sending',
                  description: 'Keep watching the thread and follow up.',
                }),
                (0, jsxRuntime.jsx)(u, {
                  children: (0, jsxRuntime.jsx)(x, {
                    checked: value.watchReplies.enabled,
                    disabled: isOff || isPending,
                    onCheckedChange: next => patch({...value, watchReplies: {...value.watchReplies, enabled: next}}),
                  }),
                }),
              ],
            }),
            value.watchReplies.enabled &&
              (0, jsxRuntime.jsxs)(r, {
                children: [
                  (0, jsxRuntime.jsx)(d, {title: 'Follow up for', description: 'How long Aux keeps the thread open.'}),
                  (0, jsxRuntime.jsx)(u, {
                    className: 'max-w-44',
                    children: (0, jsxRuntime.jsxs)(k, {
                      value: value.watchReplies.duration,
                      disabled: isOff || isPending,
                      onValueChange: next => {
                        (next === '24h' || next === '3d' || next === '7d' || next === 'until-off') &&
                          patch({...value, watchReplies: {...value.watchReplies, duration: next}});
                      },
                      children: [
                        (0, jsxRuntime.jsx)(b, {className: 'w-full font-medium', children: (0, jsxRuntime.jsx)(w, {})}),
                        (0, jsxRuntime.jsxs)(j, {
                          children: [
                            (0, jsxRuntime.jsx)(c, {value: '24h', children: '24 hours'}),
                            (0, jsxRuntime.jsx)(c, {value: '3d', children: '3 days'}),
                            (0, jsxRuntime.jsx)(c, {value: '7d', children: '7 days'}),
                            (0, jsxRuntime.jsx)(c, {value: 'until-off', children: 'Until I turn off'}),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            (0, jsxRuntime.jsxs)(r, {
              children: [
                (0, jsxRuntime.jsx)(d, {
                  title: 'Match my tone',
                  description: 'Write like you. Uses recent sent mail and messages.',
                }),
                (0, jsxRuntime.jsx)(u, {
                  children: (0, jsxRuntime.jsx)(x, {
                    checked: value.matchTone.enabled,
                    disabled: isOff || isPending,
                    onCheckedChange: next => patch({...value, matchTone: {...value.matchTone, enabled: next}}),
                  }),
                }),
              ],
            }),
            value.matchTone.enabled &&
              (0, jsxRuntime.jsx)(CustomInstructions, {disabled: isOff || isPending, value, onChange: patch}),
          ],
        }),
        (0, jsxRuntime.jsx)(SectionHeading, {title: 'Detected Apps', description: 'Turn on the apps Aux can use.'}),
        (0, jsxRuntime.jsx)(DetectedApps, {disabled: isOff || isPending, value, onChange: patch}),
      ],
    });
  },
  /** A heading between sections. */
  SectionHeading = ({title, description}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'mt-4 mb-2 flex flex-col gap-0.5',
      children: [
        (0, jsxRuntime.jsx)('h3', {className: 'text-sm font-medium', children: title}),
        description &&
          (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs font-medium', children: description}),
      ],
    }),
  /** The tiles of detected apps. */
  DetectedApps = ({disabled, value, onChange}) => {
    const {isGranted, isMac, setUp} = q(),
      toggle = async id => {
        (id === 'imessage' && isMac && !isGranted && (!(await setUp()) || value.apps.imessage)) ||
          onChange({...value, apps: {...value.apps, [id]: !value.apps[id]}});
      };
    return (0, jsxRuntime.jsx)(v, {
      children: (0, jsxRuntime.jsx)(r, {
        className: 'grid! grid-cols-6 items-start gap-2 p-3',
        children: APPS.map(app => {
          const isOn = value.apps[app.id],
            needsAccess = app.id === 'imessage' && isMac && !isGranted,
            icon = app.host
              ? (0, jsxRuntime.jsx)(V, {host: app.host, className: p(APP_ICON_CLASS, needsAccess && 'grayscale')})
              : (0, jsxRuntime.jsx)(O, {className: p(APP_ICON_CLASS, needsAccess && 'grayscale')}),
            tile = (0, jsxRuntime.jsxs)(
              'button',
              {
                type: 'button',
                disabled,
                'aria-pressed': isOn && !needsAccess,
                onClick: () => {
                  toggle(app.id);
                },
                className: p(
                  'flex flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-xs font-medium disabled:opacity-50',
                  (!isOn || needsAccess) && 'text-muted-foreground',
                ),
                children: [icon, (0, jsxRuntime.jsx)('span', {children: app.label})],
              },
              app.id,
            );
          return needsAccess
            ? (0, jsxRuntime.jsxs)(
                D,
                {
                  children: [
                    (0, jsxRuntime.jsx)(F, {render: tile}),
                    (0, jsxRuntime.jsx)(P, {children: 'Need to connect'}),
                  ],
                },
                app.id,
              )
            : tile;
        }),
      }),
    });
  },
  /** An app tile's icon. */
  APP_ICON_CLASS =
    'size-11 rounded-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.28)]',
  /** Instructions that override the learned tone, saved on blur. */
  CustomInstructions = ({disabled, value, onChange}) => {
    const [instructions, setInstructions] = (0, React.useState)(value.matchTone.customInstructions);
    return (
      (0, React.useEffect)(() => {
        setInstructions(value.matchTone.customInstructions);
      }, [value.matchTone.customInstructions]),
      (0, jsxRuntime.jsxs)(r, {
        className: 'flex-col items-stretch gap-1.5',
        children: [
          (0, jsxRuntime.jsx)(d, {
            title: 'Custom instructions',
            description: 'Optional. Overrides the learned tone when filled.',
          }),
          (0, jsxRuntime.jsx)(G, {
            className: 'min-h-20 resize-none',
            disabled,
            placeholder: 'Short, no emoji. Sign off as Alex.',
            value: instructions,
            onChange: event => setInstructions(event.target.value),
            onBlur: () => {
              const trimmed = instructions.trim();
              trimmed !== value.matchTone.customInstructions &&
                onChange({...value, matchTone: {...value.matchTone, customInstructions: trimmed}});
            },
          }),
        ],
      })
    );
  };
/** The page. */
function ce() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(B, {segments: ['Settings', 'Communications']}),
      (0, jsxRuntime.jsx)(M, {
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'flex items-center gap-1.5',
          children: [(0, jsxRuntime.jsx)('h1', {children: 'Communications'}), (0, jsxRuntime.jsx)(L, {})],
        }),
      }),
      (0, jsxRuntime.jsxs)('div', {
        className: 'space-y-8',
        children: [
          (0, jsxRuntime.jsx)(U, {
            title: 'Let Aux reach out for you',
            description: 'Aux can message, email, and call on your behalf, the way you talk.',
          }),
          (0, jsxRuntime.jsx)(CommunicationSettings, {}),
        ],
      }),
    ],
  });
}
