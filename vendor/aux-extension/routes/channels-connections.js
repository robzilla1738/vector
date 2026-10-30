/* Aux-owned source, channels pass 2: managing messenger connections and the Channels page
 * (assets/channels-CJn5l9_T.js, from the connection's credentials to the add menu; fa exported as
 * component). A connection's settings dialog (credentials, options for direct messages, groups and
 * delivery, pairing requests and paired senders, restart and delete), the remote-control messengers
 * set up through another app, the connection list with its switches, and adding a messenger.
 * This block starts inside the chunk's `var` list.
 * Names the rest of the chunk uses keep their chunk names: fa the page.
 * Chunk names used: S React, jsxRuntime (from the first pass), E PLATFORM_INFO, as PLATFORMS, K the Discord schema, and the
 * setup pass's names; $ useTRPC, z useQueryClient, O useMutation, R analytics, the dialog, tabs, form,
 * menu and button parts.
 * Aux change: the connection settings dialog takes the 12px dialog corner like every other dialog. */
/** A connection’s credentials: re-enter tokens and change its Project. */
  CredentialsTab = ({accountId, connection, projects}) => {
    const a = $(),
      r = z(),
      o = le[connection.platform],
      c = O(a.channels.connections.update.mutationOptions()),
      m = a.channels.connections.list.queryKey({accountId}),
      i = We({mode: 'onChange', resolver: He(o.updateSchema), defaultValues: o.updateDefaults(connection)}),
      d = Object.values(i.formState.errors).flat(),
      h = i.handleSubmit(async u => {
        try {
          const j = await c.mutateAsync({accountId, connectionId: connection.id, ...u});
          (i.reset(o.updateDefaults(j)), N.success(`${connection.displayName} updated.`));
        } catch (j) {
          N.error(j instanceof Error ? j.message : 'Failed to update connection.');
        } finally {
          await r.invalidateQueries({queryKey: m});
        }
      });
    return (0, jsxRuntime.jsx)(Je, {
      ...i,
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]',
        children: [
          (0, jsxRuntime.jsxs)('form', {
            id: CREDENTIALS_FORM_ID,
            className: 'min-h-0 space-y-4 overflow-y-auto p-5',
            onSubmit: h,
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'space-y-4',
                children: [(0, jsxRuntime.jsx)(is, {fields: o.fields, mode: 'update'}), (0, jsxRuntime.jsx)(os, {projects})],
              }),
              d.length > 0 && (0, jsxRuntime.jsx)(Le, {className: 'text-xs', errors: d}),
            ],
          }),
          (0, jsxRuntime.jsx)('div', {
            className: 'border-border bg-popover flex justify-end border-t px-5 py-4',
            children: (0, jsxRuntime.jsxs)(k, {
              form: CREDENTIALS_FORM_ID,
              type: 'submit',
              disabled: !i.formState.isValid || i.formState.isSubmitting,
              children: [i.formState.isSubmitting && (0, jsxRuntime.jsx)(de, {}), 'Update'],
            }),
          }),
        ],
      }),
    });
  },
  SettingsSection = ({title, children}) =>
    (0, jsxRuntime.jsx)(ce, {
      title: (0, jsxRuntime.jsx)('span', {className: 'font-display text-sm', children: title}),
      children: (0, jsxRuntime.jsx)(Z, {children}),
    }) /** A connection’s options: direct messages, groups, mentions and delivery; restart or delete it. */,
  OptionsTab = ({accountId, connectionId, displayName, platform, onRemoved}) => {
    const o = $(),
      c = z(),
      {confirm} = Ie(),
      {capture} = R(),
      d = o.channels.policies.get.queryOptions({accountId, connectionId}),
      h = o.channels.connections.list.queryKey({accountId}),
      {data} = W(d),
      j = O(o.channels.policies.update.mutationOptions()),
      y = O(o.channels.connections.restart.mutationOptions()),
      f = O(o.channels.connections.remove.mutationOptions()),
      C = data?.group.access ?? 'pairing',
      A = data?.delivery.whileRunning ?? 'steer',
      D = !data || j.isPending,
      P = y.isPending || f.isPending,
      M = async (p, w) => {
        try {
          (await j.mutateAsync({accountId, connectionId, policy: p}), c.setQueryData(d.queryKey, p), w?.());
        } catch (V) {
          N.error(V instanceof Error ? V.message : 'Failed to update channel settings.');
        }
      },
      F = p => {
        !data ||
          !p ||
          M(
            {...data, dm: {access: p === 'everyone' ? 'everyone' : 'pairing'}, group: {...data.group, access: p}},
            () => {
              capture('settings.channels.set-access', {platform, value: p});
            },
          );
      },
      l = p => {
        !data ||
          !p ||
          M({...data, delivery: {...data.delivery, whileRunning: p}}, () => {
            capture('settings.channels.set-follow-up-behavior', {
              platform,
              value: p === 'follow_up' ? 'queue' : 'steer',
            });
          });
      },
      v = async () => {
        try {
          (await y.mutateAsync({accountId, connectionId}),
            await c.invalidateQueries({queryKey: h}),
            capture('settings.channels.restart', {platform}),
            N.success(`${displayName} restarted.`));
        } catch (p) {
          N.error(p instanceof Error ? p.message : 'Failed to restart connection.');
        }
      },
      x = async () => {
        if (
          await confirm({
            title: `Delete ${displayName}?`,
            description: 'This disconnects the bot and deletes stored credentials for this connection.',
            ui: {variant: 'destructive', action: 'Delete', cancel: 'Cancel'},
          })
        )
          try {
            (await f.mutateAsync({accountId, connectionId}),
              await c.invalidateQueries({queryKey: h}),
              capture('settings.channels.disconnect', {platform}),
              N.success('Connection deleted.'),
              onRemoved());
          } catch (p) {
            N.error(p instanceof Error ? p.message : 'Failed to delete connection.');
          }
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'space-y-6 px-6 py-5',
      children: [
        (0, jsxRuntime.jsx)(SettingsSection, {
          title: 'Access',
          children: (0, jsxRuntime.jsxs)(T, {
            children: [
              (0, jsxRuntime.jsx)(I, {
                title: 'Access permission',
                description: 'Set who can use this bot to run browser tasks.',
              }),
              (0, jsxRuntime.jsx)(q, {
                children: (0, jsxRuntime.jsxs)(we, {
                  value: C,
                  disabled: D,
                  onValueChange: F,
                  children: [
                    (0, jsxRuntime.jsx)(Ne, {
                      className:
                        'w-36 *:data-[slot=select-value]:block *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate',
                      children: (0, jsxRuntime.jsx)(Se, {}),
                    }),
                    (0, jsxRuntime.jsxs)(Ce, {
                      children: [
                        (0, jsxRuntime.jsx)(U, {
                          value: 'pairing',
                          render: p =>
                            (0, jsxRuntime.jsxs)(X, {
                              children: [
                                (0, jsxRuntime.jsx)(G, {...p}),
                                (0, jsxRuntime.jsx)(J, {side: 'right', children: 'Only paired people can use this bot.'}),
                              ],
                            }),
                          children: 'Paired people only',
                        }),
                        (0, jsxRuntime.jsx)(U, {
                          value: 'everyone',
                          render: p =>
                            (0, jsxRuntime.jsxs)(X, {
                              children: [
                                (0, jsxRuntime.jsx)(G, {...p}),
                                (0, jsxRuntime.jsx)(J, {side: 'right', children: 'Anyone can use this bot anywhere.'}),
                              ],
                            }),
                          children: 'Everyone',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsxs)(SettingsSection, {
          title: 'Chat behavior',
          children: [
            (0, jsxRuntime.jsxs)(T, {
              children: [
                (0, jsxRuntime.jsx)(I, {
                  title: 'Require mentions in threads',
                  description: 'Require an @mention for the bot to respond in a thread or topic.',
                }),
                (0, jsxRuntime.jsx)(q, {
                  children: (0, jsxRuntime.jsx)(ss, {
                    checked: data?.group.requireMention ?? true,
                    disabled: D,
                    onCheckedChange: p => {
                      data &&
                        M({...data, group: {...data.group, requireMention: p}}, () => {
                          capture('settings.channels.set-require-mention', {platform, value: p});
                        });
                    },
                  }),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(T, {
              children: [
                (0, jsxRuntime.jsx)(I, {
                  title: 'Follow-up behavior',
                  description: 'Queue follow-ups while Aux runs or steer the current run.',
                }),
                (0, jsxRuntime.jsx)(q, {
                  children: (0, jsxRuntime.jsxs)(we, {
                    value: A,
                    disabled: D,
                    onValueChange: l,
                    children: [
                      (0, jsxRuntime.jsx)(Ne, {children: (0, jsxRuntime.jsx)(Se, {})}),
                      (0, jsxRuntime.jsxs)(Ce, {
                        children: [
                          (0, jsxRuntime.jsx)(U, {value: 'follow_up', children: 'Queue'}),
                          (0, jsxRuntime.jsx)(U, {value: 'steer', children: 'Steer'}),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)(SettingsSection, {
          title: 'Danger zone',
          children: [
            (0, jsxRuntime.jsxs)(T, {
              children: [
                (0, jsxRuntime.jsx)(I, {title: 'Reconnect', description: 'Use this when messages stop arriving.'}),
                (0, jsxRuntime.jsx)(q, {
                  children: (0, jsxRuntime.jsx)(k, {
                    variant: 'secondary',
                    disabled: P,
                    onClick: () => {
                      v();
                    },
                    children: 'Reconnect',
                  }),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(T, {
              children: [
                (0, jsxRuntime.jsx)(I, {title: 'Disconnect', description: 'You can reconnect later by adding this again.'}),
                (0, jsxRuntime.jsx)(q, {
                  children: (0, jsxRuntime.jsx)(k, {
                    variant: 'destructive',
                    disabled: P,
                    onClick: () => {
                      x();
                    },
                    children: 'Disconnect',
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  PairingTab = s =>
    (0, jsxRuntime.jsx)(S.Suspense, {
      fallback: (0, jsxRuntime.jsx)(PairingLoading, {}),
      children: (0, jsxRuntime.jsx)(PairingRequests, {...s}),
    }) /** Pairing requests to approve or ignore, and the senders already paired. */,
  PairingRequests = ({accountId, connectionId, platform}) => {
    const a = $(),
      r = z(),
      {confirm} = Ie(),
      {capture} = R(),
      m = a.channels.pairing.list.queryOptions({accountId, connectionId}, {refetchInterval: 5e3}),
      i = a.channels.principals.list.queryOptions({accountId, connectionId}),
      {data: d} = B(m),
      {data} = B(i),
      u = O(a.channels.pairing.approve.mutationOptions()),
      j = O(a.channels.pairing.reject.mutationOptions()),
      y = O(a.channels.principals.remove.mutationOptions()),
      f = O(a.channels.principals.update.mutationOptions()),
      C = () => r.invalidateQueries({queryKey: m.queryKey}),
      A = () => r.invalidateQueries({queryKey: i.queryKey}),
      D = l => async () => {
        try {
          const v = await u.mutateAsync({accountId, requestId: l});
          (await Promise.all([C(), A()]),
            v.approved
              ? (capture('settings.channels.pairing.approve', {platform}), N.success('Sender approved.'))
              : N.error('This pairing request has expired.'));
        } catch (v) {
          N.error(v instanceof Error ? v.message : 'Failed to approve sender.');
        }
      },
      P = l => async () => {
        try {
          (await j.mutateAsync({accountId, requestId: l}),
            await C(),
            capture('settings.channels.pairing.ignore', {platform}));
        } catch (v) {
          N.error(v instanceof Error ? v.message : 'Failed to ignore request.');
        }
      },
      M = l => async () => {
        const v = l.displayName || l.senderId;
        if (
          await confirm({
            title: `Revoke ${v}?`,
            description: 'They will need to pair again before they can message this bot.',
            ui: {variant: 'destructive', action: 'Revoke', cancel: 'Cancel'},
          })
        )
          try {
            (await y.mutateAsync({accountId, connectionId, senderId: l.senderId}),
              await A(),
              capture('settings.channels.pairing.revoke', {platform}));
          } catch (x) {
            N.error(x instanceof Error ? x.message : 'Failed to revoke access.');
          }
      },
      F = async (l, v) => {
        try {
          (await f.mutateAsync({accountId, connectionId, senderId: l.senderId, canApprovePairing: v}),
            await A(),
            capture('settings.channels.pairing.set-role', {platform, value: v ? 'admin' : 'member'}));
        } catch (x) {
          N.error(x instanceof Error ? x.message : 'Failed to update pairing permission.');
        }
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'space-y-6',
      children: [
        d.length > 0 &&
          (0, jsxRuntime.jsx)(SettingsSection, {
            title: 'Request',
            children: d.map(l => {
              const v = `Requested ${(0, Ze.default)(l.lastSeenAt).fromNow()}`;
              return (0, jsxRuntime.jsxs)(
                T,
                {
                  className: 'gap-1.5',
                  children: [
                    (0, jsxRuntime.jsx)(SenderAvatar, {avatarUrl: l.avatarUrl, name: l.senderName || l.senderId}),
                    (0, jsxRuntime.jsx)(I, {
                      title: l.senderName || l.senderId,
                      description: l.senderName ? `${l.senderId} · ${v}` : v,
                    }),
                    (0, jsxRuntime.jsx)(q, {
                      children: (0, jsxRuntime.jsxs)(be, {
                        children: [
                          (0, jsxRuntime.jsxs)(ve, {
                            render: (0, jsxRuntime.jsx)(k, {
                              variant: 'outline',
                              size: 'sm',
                              disabled: u.isPending || j.isPending,
                            }),
                            children: ['Action', (0, jsxRuntime.jsx)(Ts, {'data-icon': 'inline-end'})],
                          }),
                          (0, jsxRuntime.jsxs)(ye, {
                            align: 'end',
                            children: [
                              (0, jsxRuntime.jsxs)(oe, {
                                onClick: D(l.id),
                                children: [(0, jsxRuntime.jsx)(ks, {className: 'text-success'}), 'Approve'],
                              }),
                              (0, jsxRuntime.jsxs)(oe, {
                                onClick: P(l.id),
                                children: [(0, jsxRuntime.jsx)(Ps, {className: 'text-destructive'}), 'Ignore'],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                },
                l.id,
              );
            }),
          }),
        (0, jsxRuntime.jsx)(SettingsSection, {
          title: 'Paired',
          children:
            data.length === 0
              ? (0, jsxRuntime.jsx)(T, {
                  children: (0, jsxRuntime.jsx)(I, {
                    title: 'No paired people',
                    description: 'Approved people will appear here.',
                  }),
                })
              : data.map(l => {
                  const v = l.lastSeenAt
                    ? (0, jsxRuntime.jsx)(Re, {datetime: l.lastSeenAt})
                    : l.pairedAt
                      ? (0, jsxRuntime.jsx)(Re, {datetime: l.pairedAt})
                      : 'Paired';
                  return (0, jsxRuntime.jsxs)(
                    T,
                    {
                      className: 'gap-1.5',
                      children: [
                        (0, jsxRuntime.jsx)(SenderAvatar, {avatarUrl: l.avatarUrl, name: l.displayName || l.senderId}),
                        (0, jsxRuntime.jsx)(I, {
                          title: l.displayName || l.senderId,
                          description: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {children: [l.displayName && `${l.senderId} · `, v]}),
                        }),
                        (0, jsxRuntime.jsx)(q, {
                          children: (0, jsxRuntime.jsxs)(be, {
                            children: [
                              (0, jsxRuntime.jsx)(ve, {
                                render: (0, jsxRuntime.jsx)(k, {
                                  variant: 'ghost',
                                  size: 'icon-sm',
                                  disabled: y.isPending || f.isPending,
                                  'aria-label': `Actions for ${l.displayName || l.senderId}`,
                                }),
                                children: (0, jsxRuntime.jsx)(Os, {}),
                              }),
                              (0, jsxRuntime.jsxs)(ye, {
                                align: 'end',
                                children: [
                                  (0, jsxRuntime.jsxs)(xs, {
                                    children: [
                                      (0, jsxRuntime.jsxs)(hs, {children: [(0, jsxRuntime.jsx)(Ss, {}), 'Permission']}),
                                      (0, jsxRuntime.jsx)(fs, {
                                        children: (0, jsxRuntime.jsxs)(gs, {
                                          value: l.canApprovePairing ? 'approver' : 'user',
                                          onValueChange: x => {
                                            F(l, x === 'approver');
                                          },
                                          children: [
                                            (0, jsxRuntime.jsxs)(X, {
                                              children: [
                                                (0, jsxRuntime.jsx)(G, {
                                                  render: (0, jsxRuntime.jsx)(qe, {value: 'approver'}),
                                                  children: 'Admin',
                                                }),
                                                (0, jsxRuntime.jsxs)(J, {
                                                  side: 'right',
                                                  children: [
                                                    'Grant full access to the chat.',
                                                    (0, jsxRuntime.jsx)('br', {}),
                                                    'The user can approve pairing requests.',
                                                  ],
                                                }),
                                              ],
                                            }),
                                            (0, jsxRuntime.jsxs)(X, {
                                              children: [
                                                (0, jsxRuntime.jsx)(G, {
                                                  render: (0, jsxRuntime.jsx)(qe, {value: 'user'}),
                                                  children: 'Member',
                                                }),
                                                (0, jsxRuntime.jsxs)(J, {
                                                  side: 'right',
                                                  children: [
                                                    'The user can mention the bot to use it.',
                                                    (0, jsxRuntime.jsx)('br', {}),
                                                    'Some requests are limited.',
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      }),
                                    ],
                                  }),
                                  (0, jsxRuntime.jsxs)(oe, {
                                    variant: 'destructive',
                                    onClick: M(l),
                                    children: [(0, jsxRuntime.jsx)(Cs, {}), 'Revoke'],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    },
                    l.senderId,
                  );
                }),
        }),
      ],
    });
  },
  PairingLoading = () =>
    (0, jsxRuntime.jsx)(SettingsSection, {
      title: 'Paired',
      children: Array.from({length: 3}, (s, t) =>
        (0, jsxRuntime.jsxs)(
          T,
          {
            className: 'gap-1.5',
            children: [
              (0, jsxRuntime.jsx)(he, {className: 'size-8 shrink-0 rounded-lg'}),
              (0, jsxRuntime.jsxs)('div', {
                className: 'min-w-0 grow space-y-1.5 px-1',
                children: [(0, jsxRuntime.jsx)(he, {className: 'h-4 w-28'}), (0, jsxRuntime.jsx)(he, {className: 'h-3 w-40'})],
              }),
            ],
          },
          t,
        ),
      ),
    }),
  SenderAvatar = ({avatarUrl, name}) =>
    (0, jsxRuntime.jsxs)(ne, {
      className: 'rounded-lg border',
      children: [
        (0, jsxRuntime.jsx)(ae, {src: avatarUrl ?? void 0, alt: ''}),
        (0, jsxRuntime.jsx)(te, {children: name.slice(0, 2).toUpperCase()}),
      ],
    }) /** A connection’s settings: credentials, options and pairing, in tabs. */,
  ConnectionSettingsDialog = ({accountId, connection, initialTab, projects, onOpenChangeComplete}) => {
    const [o, c] = (0, S.useState)(true),
      [m, i] = (0, S.useState)(initialTab),
      d = $(),
      {data} = W(d.channels.policies.get.queryOptions({accountId, connectionId: connection.id})),
      u = E[connection.platform],
      j = data?.dm.access === 'everyone' && data.group.access === 'everyone';
    (0, S.useEffect)(() => {
      j && m === 'pairing' && i('options');
    }, [j, m]);
    const y = (f, C) => {
      if (!f && C.reason === 'escape-key') {
        C.cancel();
        return;
      }
      c(f);
    };
    return (0, jsxRuntime.jsx)(Te, {
      open: o,
      onOpenChange: y,
      onOpenChangeComplete,
      children: (0, jsxRuntime.jsxs)(Me, {
        className:
          'h-120 max-h-[calc(100vh-2rem)] w-lg max-w-lg! grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl p-0',
        children: [
          (0, jsxRuntime.jsx)(Oe, {
            className: 'flex flex-col items-stretch gap-0.5 p-5 pr-4 pb-3 text-left',
            children: (0, jsxRuntime.jsxs)(pe, {
              className: 'flex items-center gap-2.5 text-base',
              children: [
                (0, jsxRuntime.jsx)(es, {className: 'size-8 rounded-lg', name: connection.displayName || u.label, url: u.url}),
                (0, jsxRuntime.jsx)('span', {className: 'truncate', children: connection.displayName || u.label}),
              ],
            }),
          }),
          (0, jsxRuntime.jsxs)(Ae, {
            className: 'text-secondary-foreground/50 absolute top-2 right-2',
            variant: 'ghost',
            size: 'icon-xs',
            shape: 'pill',
            children: [
              (0, jsxRuntime.jsx)(Fe, {className: 'size-4!'}),
              (0, jsxRuntime.jsx)('span', {className: 'sr-only', children: 'Close'}),
            ],
          }),
          (0, jsxRuntime.jsxs)(Rs, {
            className: 'min-h-0 gap-0',
            value: j && m === 'pairing' ? 'options' : m,
            onValueChange: f => i(f),
            children: [
              (0, jsxRuntime.jsxs)(qs, {
                className: 'h-10 w-full justify-start gap-4 border-b px-5',
                variant: 'line',
                children: [
                  (0, jsxRuntime.jsx)(xe, {className: 'flex-none p-0', value: 'options', children: 'Options'}),
                  !j && (0, jsxRuntime.jsx)(xe, {className: 'flex-none p-0', value: 'pairing', children: 'Pairing'}),
                  (0, jsxRuntime.jsx)(xe, {className: 'flex-none p-0', value: 'credentials', children: 'Credentials'}),
                ],
              }),
              (0, jsxRuntime.jsx)(ge, {
                className: 'min-h-0 overflow-y-auto',
                value: 'options',
                children: (0, jsxRuntime.jsx)(OptionsTab, {
                  accountId,
                  connectionId: connection.id,
                  displayName: connection.displayName,
                  platform: connection.platform,
                  onRemoved: () => c(false),
                }),
              }),
              !j &&
                (0, jsxRuntime.jsx)(ge, {
                  className: 'min-h-0 overflow-y-auto',
                  value: 'pairing',
                  children: (0, jsxRuntime.jsx)('div', {
                    className: 'px-6 py-5',
                    children: (0, jsxRuntime.jsx)(PairingTab, {
                      accountId,
                      connectionId: connection.id,
                      platform: connection.platform,
                    }),
                  }),
                }),
              (0, jsxRuntime.jsx)(ge, {
                className: 'min-h-0 overflow-hidden',
                value: 'credentials',
                children: (0, jsxRuntime.jsx)(CredentialsTab, {accountId, connection, projects}),
              }),
            ],
          }),
        ],
      }),
    });
  },
  PLATFORM_ICONS = {slack: ws, telegram: $s, discord: bs}; /** The Channels page. */
function fa() {
  const {userId} = H.useParams(),
    t = $(),
    n = Number.parseInt(userId, 10),
    {data} = B(t.accounts.get.queryOptions({accountId: n})),
    r = Ye(data);
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(Gs, {segments: ['Settings', 'Channels']}),
      (0, jsxRuntime.jsx)(zs, {children: (0, jsxRuntime.jsx)('h1', {className: 'flex items-center gap-1.5', children: 'Channels'})}),
      (0, jsxRuntime.jsxs)('div', {
        className: 'flex flex-col gap-8',
        children: [
          (0, jsxRuntime.jsx)(et, {}),
          r && (0, jsxRuntime.jsx)(S.Suspense, {fallback: (0, jsxRuntime.jsx)(Bs, {}), children: (0, jsxRuntime.jsx)(ConnectionList, {})}),
        ],
      }),
    ],
  });
}
var /** The connections, each with its switch and settings, and adding a messenger. */
  ConnectionList = () => {
    const {userId} = H.useParams(),
      {connection, tab} = H.useSearch(),
      a = H.useNavigate(),
      r = Number.parseInt(userId, 10),
      o = $(),
      c = z(),
      {confirm} = Ie(),
      {capture} = R(),
      [d, h] = (0, S.useState)(null),
      u = o.channels.connections.list.queryKey({accountId: r}),
      {data: j} = B(o.channels.connections.list.queryOptions({accountId: r}, {refetchInterval: 5e3})),
      {data} = B(o.projects.list.queryOptions({accountId: r})),
      f = O(o.channels.connections.update.mutationOptions()),
      C = data.filter(x => !x.archivedAt),
      A = j.find(x => x.id === connection),
      D = x => async p => {
        if (!(
          !p &&
          !(await confirm({
            title: `Disable ${x.displayName}?`,
            description: `${x.displayName} will stop receiving messages and sending replies in ${E[x.platform].label} until you enable it again.`,
            ui: {variant: 'destructive', action: 'Disable', cancel: 'Cancel'},
          }))
        ))
          try {
            const w = await f.mutateAsync({accountId: r, connectionId: x.id, enabled: p});
            (c.setQueryData(u, V => (V ?? []).map(re => (re.id === w.id ? w : re))),
              capture('settings.channels.enable', {platform: x.platform, value: p}));
          } catch (w) {
            N.error(w instanceof Error ? w.message : 'Failed to update connection.');
          }
      },
      P = x => {
        (capture('settings.channels.connect.open', {platform: x}), h(x));
      },
      M = x => () => {
        a({search: p => ({...p, connection: x.id, tab: void 0})});
      },
      F = x => {
        N.success(`${x.displayName} connected.`, {
          description: 'Message the bot to request access, then approve it in the Pairing tab.',
        });
      },
      l = x => {
        x || h(null);
      },
      v = x => {
        x || a({search: p => ({...p, connection: void 0, tab: void 0}), replace: true});
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex flex-col gap-8',
      children: [
        j.length > 0 &&
          (0, jsxRuntime.jsx)(ce, {
            title: 'Messengers',
            children: (0, jsxRuntime.jsxs)(Z, {
              children: [
                j.map(x =>
                  (0, jsxRuntime.jsx)(
                    ConnectionRow,
                    {connection: x, toggleDisabled: f.isPending, onToggleEnabled: D(x), onOpenSettings: M(x)},
                    x.id,
                  ),
                ),
                (0, jsxRuntime.jsx)(AddMessengerMenu, {onSelect: P}),
              ],
            }),
          }),
        j.length === 0 &&
          (0, jsxRuntime.jsx)(ce, {
            title: 'Messengers',
            children: (0, jsxRuntime.jsx)(Z, {
              children: as.map(x => (0, jsxRuntime.jsx)(AddPlatformItem, {platform: x, onSelect: P}, x)),
            }),
          }),
        d &&
          (0, jsxRuntime.jsx)(ot, {accountId: r, platform: d, projects: C, onOpenChangeComplete: l, onSaved: F}, `create-${d}`),
        A &&
          (0, jsxRuntime.jsx)(
            ConnectionSettingsDialog,
            {accountId: r, connection: A, initialTab: tab ?? 'options', projects: C, onOpenChangeComplete: v},
            A.id,
          ),
      ],
    });
  },
  ConnectionRow = ({connection, toggleDisabled, onToggleEnabled, onOpenSettings}) => {
    const r = E[connection.platform],
      o = connection.lastUsedAt ? `Last used at ${(0, Ze.default)(connection.lastUsedAt).format('ll')}` : 'Never used';
    return (0, jsxRuntime.jsxs)(T, {
      className: 'gap-1.5',
      children: [
        (0, jsxRuntime.jsxs)(ne, {
          className: 'border-muted rounded-md border',
          children: [
            (0, jsxRuntime.jsx)(ae, {src: auxPinnedChannelBotImages[connection.platform]}),
            (0, jsxRuntime.jsx)(te, {children: r.label.charAt(0)}),
          ],
        }),
        (0, jsxRuntime.jsx)(I, {title: connection.displayName, description: o}),
        (0, jsxRuntime.jsxs)(q, {
          className: 'items-center gap-1',
          children: [
            (0, jsxRuntime.jsx)(ss, {
              checked: connection.enabled,
              disabled: toggleDisabled,
              'aria-label': `${connection.enabled ? 'Disable' : 'Enable'} ${connection.displayName}`,
              onCheckedChange: onToggleEnabled,
            }),
            (0, jsxRuntime.jsx)(k, {
              variant: 'ghost',
              size: 'icon',
              className: 'text-muted-foreground',
              'aria-label': `Settings for ${connection.displayName}`,
              onClick: onOpenSettings,
              children: (0, jsxRuntime.jsx)(Fs, {}),
            }),
          ],
        }),
      ],
    });
  },
  AddPlatformItem = ({platform, onSelect}) => {
    const n = E[platform],
      a = () => onSelect(platform);
    return (0, jsxRuntime.jsxs)(T, {
      className: 'gap-1.5',
      children: [
        (0, jsxRuntime.jsxs)(ne, {
          className: 'border-muted rounded-md border',
          children: [
            (0, jsxRuntime.jsx)(ae, {src: auxPinnedChannelBotImages[platform]}),
            (0, jsxRuntime.jsx)(te, {children: platform.charAt(0)}),
          ],
        }),
        (0, jsxRuntime.jsx)(I, {title: n.label}),
        (0, jsxRuntime.jsx)(k, {
          size: 'icon',
          variant: 'secondary',
          'aria-label': `Connect ${n.label}`,
          onClick: a,
          children: (0, jsxRuntime.jsx)(Pe, {}),
        }),
      ],
    });
  },
  AddMessengerMenu = ({onSelect}) => {
    const t = n => () => onSelect(n);
    return (0, jsxRuntime.jsxs)(be, {
      children: [
        (0, jsxRuntime.jsxs)(ve, {
          nativeButton: false,
          render: n => {
            const {className, ...r} = n;
            return (0, jsxRuntime.jsx)(Vs, {variant: 'action', className: 'aria-expanded:border-b-0!', ...r});
          },
          children: [(0, jsxRuntime.jsx)(Pe, {className: 'mx-0.5 size-4'}), (0, jsxRuntime.jsx)(I, {title: 'Add'})],
        }),
        (0, jsxRuntime.jsx)(ye, {
          className: 'max-h-64 w-fit max-w-none overflow-auto',
          align: 'start',
          children: as.map(n => {
            const a = PLATFORM_ICONS[n];
            return (0, jsxRuntime.jsxs)(
              oe,
              {
                className: 'pr-6!',
                onClick: t(n),
                children: [(0, jsxRuntime.jsx)(a, {}), (0, jsxRuntime.jsx)('span', {children: E[n].label})],
              },
              n,
            );
          }),
        }),
      ],
    });
  };
