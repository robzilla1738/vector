/* Aux-owned source: the Account settings page (assets/account-Dr_CA8LL.js, after its imports;
 * Gs exported as component). Local mode asks to sign in; a paused account offers signing in again or
 * starting fresh; a signed-in account shows its profile (name and photo), CLI login approval by the
 * terminal's eight-character code, its devices (each can be signed out), sync and browser data
 * recovery, and deleting the account.
 * Names the rest of the chunk uses keep their chunk names: Gs the page.
 * Chunk names used: b useTRPC, q useQuery, O useMutation, F useQueryClient, Y useApp, Z confirm,
 * N/A/g/m/I settings sections, rows and labels, _ Link, z Skeleton, he error boundary, te dayjs,
 * se/ee zod, re merge profile, ss/Xe/Je page header and loading. */
var jsxRuntime = ue(),
  AccountIcon = ({size = 24, ariaHidden = true, ...t}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...t,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M3 17V7C3 4.79087 4.79087 3 7 3H11.25C11.8023 3 12.25 3.44772 12.25 4C12.25 4.55228 11.8023 5 11.25 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89542 19 7 19H11.25C11.8023 19 12.25 19.4477 12.25 20C12.25 20.5523 11.8023 21 11.25 21H7C4.79088 21 3 19.2092 3 17ZM14.793 6.79297C15.1835 6.40244 15.8165 6.40244 16.207 6.79297L20.707 11.293C21.0976 11.6835 21.0976 12.3165 20.707 12.707L16.207 17.207C15.8165 17.5976 15.1835 17.5976 14.793 17.207C14.4024 16.8165 14.4024 16.1835 14.793 15.793L17.5859 13H8.75C8.19772 13 7.75 12.5523 7.75 12C7.75 11.4477 8.19772 11 8.75 11H17.5859L14.793 8.20703C14.4024 7.81651 14.4024 7.18349 14.793 6.79297Z',
        fill: 'currentColor',
      }),
    }),
  React = ce(de(), 1) /** Local mode: this Mac holds everything. */,
  LocalModeCard = () =>
    (0, jsxRuntime.jsx)(N, {
      children: (0, jsxRuntime.jsxs)(A, {
        children: [
          (0, jsxRuntime.jsx)(g, {
            className: 'gap-1',
            children: (0, jsxRuntime.jsx)(m, {
              searchable: false,
              title: "You're using Aux in local mode",
              description: 'Your browser data stays on this Mac.',
            }),
          }),
        ],
      }),
    }) /** A paused account: sign in again, or sign out and start fresh in local mode. */,
  PausedAccount = ({account}) => {
    const a = account.id,
      t = b(),
      i = F(),
      {capture} = G(),
      {confirm} = Z(),
      n = O(t.accounts.auth.signOut.mutationOptions()),
      d = () => {
        confirm(
          {
            title: 'Sign out on this device?',
            description: 'Aux will switch to local mode.',
            ui: {variant: 'destructive', action: 'Sign out'},
          },
          async () => {
            try {
              (await n.mutateAsync({accountId: a, strategy: 'reset_local_account'}),
                await ne(),
                capture('logout'),
                W(),
                await Promise.all([
                  i.invalidateQueries(t.accounts.get.queryFilter({accountId: a})),
                  i.invalidateQueries(t.accounts.auth.me.queryFilter({accountId: a})),
                  i.invalidateQueries(t.passwordManager.settings.get.queryFilter({accountId: a})),
                ]));
            } catch (u) {
              y.error(u instanceof Error ? u.message : 'Could not sign out.');
            }
          },
        );
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(N, {
          title: 'Sync',
          children: (0, jsxRuntime.jsxs)(A, {
            children: [
              (0, jsxRuntime.jsx)(g, {
                className: 'gap-1',
                children: (0, jsxRuntime.jsx)(m, {
                  title: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                    children: [
                      (0, jsxRuntime.jsx)('span', {children: 'Sync is paused'}),
                      (0, jsxRuntime.jsx)(Q, {
                        className: 'ml-1 h-4 px-1 py-0.5 align-text-top text-[10px]',
                        variant: 'secondary',
                        children: 'Paused',
                      }),
                    ],
                  }),
                  description: 'Your session was revoked. Sign in again to resume syncing on this device.',
                }),
              }),
              (0, jsxRuntime.jsxs)(I, {
                className: '**:text-muted-foreground gap-1',
                render: (0, jsxRuntime.jsx)(_, {to: '/auth/sign-in'}),
                children: [
                  (0, jsxRuntime.jsx)(L, {className: 'mx-0.5 size-4'}),
                  (0, jsxRuntime.jsx)(m, {
                    searchable: false,
                    title: 'Sign in again',
                    description: 'Resume sync on this device',
                  }),
                ],
              }),
              (0, jsxRuntime.jsxs)(I, {
                className: '**:text-muted-foreground gap-1',
                onClick: d,
                children: [
                  (0, jsxRuntime.jsx)(Le, {className: 'mx-0.5 size-4'}),
                  (0, jsxRuntime.jsx)(m, {
                    searchable: false,
                    title: 'Sign out on this device',
                    description: 'Start fresh in local mode',
                  }),
                ],
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)(N, {
          title: 'Profile',
          children: (0, jsxRuntime.jsx)(A, {
            children: (0, jsxRuntime.jsxs)(g, {
              className: 'gap-2',
              children: [
                (0, jsxRuntime.jsx)(ae, {
                  profileUrl: account.profileUrl ?? null,
                  className: '-ml-0.5 size-10 rounded-lg',
                  size: 'lg',
                }),
                (0, jsxRuntime.jsx)(m, {
                  title: account.name || account.email || 'Aux Account',
                  description: account.email ?? 'Saved on this device',
                }),
              ],
            }),
          }),
        }),
      ],
    });
  } /** A CLI login waiting for approval on this account. */,
  CliLoginRequest = ({accountId, userId, email}) => {
    const i = b(),
      [r, c] = (0, React.useState)(null),
      n = R({
        ...i.accounts.deviceCodePending.queryOptions({accountId}),
        retry: false,
        refetchInterval: 5e3,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always',
        refetchOnMount: 'always',
        staleTime: 1 / 0,
      }),
      d = o => () => c(o),
      u = () => {
        (c(null), n.refetch());
      },
      l = o => {
        o || c(null);
      };
    return n.data?.requests.length
      ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            n.data.requests.map(o =>
              (0, jsxRuntime.jsxs)(
                g,
                {
                  children: [
                    (0, jsxRuntime.jsxs)('div', {
                      className: 'relative mx-1 size-6',
                      children: [
                        (0, jsxRuntime.jsx)(T, {
                          className: 'text-muted-foreground size-6',
                          style: {maskImage: 'radial-gradient(circle 7px at 18px 18px, transparent 6px, black 7px)'},
                        }),
                        (0, jsxRuntime.jsx)(_e, {
                          'aria-hidden': 'true',
                          className: 'text-brand absolute top-3 left-3 size-3',
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)(m, {
                      title: o.deviceName,
                      description: `Login requested ${(0, te.default)(o.createdAt).format('MMM D, YYYY h:mm A')}`,
                    }),
                    (0, jsxRuntime.jsx)(k, {
                      children: (0, jsxRuntime.jsx)(D, {variant: 'outline', onClick: d(o), children: 'Confirm'}),
                    }),
                  ],
                },
                o.requestId,
              ),
            ),
            (0, jsxRuntime.jsx)(We, {
              open: r !== null,
              onOpenChange: l,
              children: (0, jsxRuntime.jsx)(Ye, {
                className: 'gap-0 p-5 sm:max-w-sm',
                children:
                  r &&
                  (0, jsxRuntime.jsx)(
                    CliLoginDialog,
                    {accountId, userId, email, request: r, onComplete: u},
                    `${accountId}:${userId}:${r.requestId}`,
                  ),
              }),
            }),
          ],
        })
      : null;
  },
  cliCodeForm = se({
    userCode: ee().regex(/^[A-Z0-9]{8}$/, 'Enter the eight-character code shown in your terminal.'),
  }) /** Approving a CLI login with the code the terminal shows. */,
  CliLoginDialog = ({accountId, userId, email, request, onComplete}) => {
    const c = b(),
      n = X({resolver: J(cliCodeForm), defaultValues: {userCode: ''}}),
      d = O(c.accounts.deviceCodeLookup.mutationOptions({retry: false})),
      u = O(c.accounts.deviceCodeDecide.mutationOptions({retry: false})),
      l = n.formState.isSubmitting,
      o = n.watch('userCode').length === 8,
      h = n.formState.errors.userCode?.message,
      v = n.handleSubmit(async ({userCode}) => {
        try {
          if (Ke() === 'incognito' || (await B()) !== accountId)
            throw new Error('Use the regular browser profile for this account.');
          if (request.expiresAt <= Date.now()) throw new Error('This request has expired. Refresh the list.');
          const f = await d.mutateAsync({accountId, userCode, id: request.requestId});
          if (f.id !== request.requestId || f.accountId !== userId)
            throw new Error('This code does not match the selected request and account.');
          const p = await Fe.accounts.get.query({accountId});
          if ((await B()) !== accountId || p?.userId !== userId)
            throw new Error('Account changed. Close this dialog and try again.');
          (await u.mutateAsync({
            accountId,
            userCode,
            id: request.requestId,
            expectedAccountId: userId,
            decision: 'approve',
          }),
            y.success('CLI login approved. Return to your terminal.'),
            onComplete());
        } catch (f) {
          n.setError('userCode', {message: f instanceof Error ? f.message : 'Could not confirm this login.'});
        }
      });
    return (0, jsxRuntime.jsxs)(ze, {
      ...n,
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'px-2 pt-2 pb-3',
          children: (0, jsxRuntime.jsx)(Ie, {className: 'size-6', 'aria-hidden': true}),
        }),
        (0, jsxRuntime.jsxs)(Ge, {
          className: 'gap-1 px-2',
          children: [
            (0, jsxRuntime.jsx)(Ze, {
              className: 'font-display text-2xl leading-8 font-medium',
              children: 'Sign in to Aux',
            }),
            (0, jsxRuntime.jsx)($e, {
              id: 'cli-login-code-description',
              children: 'Enter the code shown in your terminal.',
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)('form', {
          onSubmit: v,
          children: [
            (0, jsxRuntime.jsx)(CliLoginEntry, {}),
            (0, jsxRuntime.jsx)('dl', {
              className: 'px-2 pb-6 text-xs',
              children: [
                {label: 'Account', value: email},
                {label: 'Device', value: request.deviceName},
              ].map(({label, value}) =>
                (0, jsxRuntime.jsxs)(
                  'div',
                  {
                    className: 'flex items-start border-t py-1.5',
                    children: [
                      (0, jsxRuntime.jsx)('dt', {className: 'w-20 shrink-0 font-medium', children: label}),
                      (0, jsxRuntime.jsx)('dd', {
                        className: 'text-muted-foreground min-w-0 flex-1 truncate',
                        children: value,
                      }),
                    ],
                  },
                  label,
                ),
              ),
            }),
            (0, jsxRuntime.jsxs)(D, {
              type: 'submit',
              shape: 'pill',
              className: 'h-10 w-full text-base',
              disabled: l || !o,
              children: [l && (0, jsxRuntime.jsx)(P, {}), 'Continue'],
            }),
            (0, jsxRuntime.jsx)('p', {
              id: 'cli-login-code-feedback',
              'aria-live': 'polite',
              className: le('px-4 pt-4 text-center text-xs', h ? 'text-destructive' : 'text-muted-foreground'),
              children:
                h ||
                (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    'Only enter this code if you just initiated a',
                    (0, jsxRuntime.jsx)('br', {}),
                    'sign-in from your device.',
                  ],
                }),
            }),
          ],
        }),
      ],
    });
  },
  CliLoginEntry = () => {
    const {control, clearErrors, formState} = Te(),
      {field, fieldState} = Ee({control, name: 'userCode'}),
      c = n => {
        (clearErrors('userCode'), field.onChange(n.toUpperCase()));
      };
    return (0, jsxRuntime.jsx)(Se, {
      className: 'px-1 py-9',
      children: (0, jsxRuntime.jsxs)(Ce, {
        'data-invalid': fieldState.invalid,
        children: [
          (0, jsxRuntime.jsx)(ve, {
            className: 'sr-only',
            htmlFor: 'cli-login-code',
            children: 'Eight-character terminal code',
          }),
          (0, jsxRuntime.jsxs)(Be, {
            ...field,
            id: 'cli-login-code',
            maxLength: 8,
            pattern: '[A-Za-z0-9]*',
            inputMode: 'text',
            pasteTransformer: n => n.replaceAll('-', '').toUpperCase(),
            autoComplete: 'off',
            autoFocus: true,
            disabled: formState.isSubmitting,
            'aria-invalid': fieldState.invalid,
            'aria-describedby': 'cli-login-code-description cli-login-code-feedback',
            containerClassName: 'justify-center gap-1',
            onChange: c,
            children: [
              (0, jsxRuntime.jsx)(V, {
                className: 'min-w-0 gap-1 has-aria-invalid:ring-0',
                children: [0, 1, 2, 3].map(n =>
                  (0, jsxRuntime.jsx)(
                    U,
                    {
                      index: n,
                      'aria-invalid': fieldState.invalid,
                      className: 'h-9 w-9 min-w-0 rounded-md border text-lg first:rounded-md last:rounded-md',
                    },
                    n,
                  ),
                ),
              }),
              (0, jsxRuntime.jsx)(Me, {
                className: 'text-muted-foreground flex size-4 shrink-0 items-center justify-center',
              }),
              (0, jsxRuntime.jsx)(V, {
                className: 'min-w-0 gap-1 has-aria-invalid:ring-0',
                children: [4, 5, 6, 7].map(n =>
                  (0, jsxRuntime.jsx)(
                    U,
                    {
                      index: n,
                      'aria-invalid': fieldState.invalid,
                      className: 'h-9 w-9 min-w-0 rounded-md border text-lg first:rounded-md last:rounded-md',
                    },
                    n,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
    });
  } /** A signed-in account: profile, CLI login, devices, sync and the danger zone. */,
  CloudAccount = () => {
    const {accountId} = Y(),
      {capture} = G(),
      t = me(),
      [i, r] = (0, React.useState)(false),
      [c, n] = (0, React.useState)(false),
      d = b(),
      u = F(),
      {data: l} = q(d.accounts.get.queryOptions({accountId})),
      o = R({...d.accounts.auth.me.queryOptions({accountId}), retry: false}),
      h = R({...d.accounts.auth.syncKeyStatus.queryOptions({accountId}), retry: false}),
      {data} = o;
    (0, React.useEffect)(() => {
      data && u.setQueryData(d.accounts.get.queryKey({accountId}), j => j && re(j, data));
    }, [accountId, data, u, d]);
    const w = () => {
        r(true);
      },
      f = () => {
        (capture('delete-account'), n(true));
      },
      p = j => t({to: '/u/$userId/settings/account', params: {userId: String(j)}, replace: true}),
      x = () => {
        t({to: '/auth/recovery', search: {purpose: 'encrypted-data', completionTarget: 'settings-account'}});
      };
    if (l?.mode !== 'cloud') return null;
    const C = data || {email: l.email ?? '', name: l.name, profileUrl: l.profileUrl ?? null, userId: l.userId ?? ''};
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(N, {
          title: 'Profile',
          children: (0, jsxRuntime.jsx)(A, {
            children: (0, jsxRuntime.jsx)(ProfileSection, {accountId: l.id, profile: C}),
          }),
        }),
        (0, jsxRuntime.jsx)(Devices, {accountId, onSignOutThisDevice: w}),
        (0, jsxRuntime.jsx)(N, {
          title: 'Danger zone',
          children: (0, jsxRuntime.jsx)(A, {
            children: (0, jsxRuntime.jsxs)(g, {
              children: [
                (0, jsxRuntime.jsx)(m, {
                  title: 'Delete account',
                  description: 'Permanently delete your account and all associated data',
                }),
                (0, jsxRuntime.jsx)(k, {
                  children: (0, jsxRuntime.jsx)(D, {
                    variant: 'destructive',
                    onClick: f,
                    children: (0, jsxRuntime.jsx)('span', {children: 'Delete'}),
                  }),
                }),
              ],
            }),
          }),
        }),
        (0, jsxRuntime.jsx)(ts, {accountId, open: i, onOpenChange: r}),
        (0, jsxRuntime.jsx)(DeleteAccountDialog, {accountId, open: c, onOpenChange: n, onDeleted: p}),
      ],
    });
  } /** Devices, with a fallback when they cannot load. */,
  Devices = s =>
    (0, jsxRuntime.jsx)(he, {
      surface: 'settings-account-devices',
      fallback: (0, jsxRuntime.jsx)(DevicesUnavailable, {}),
      children: (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(DevicesLoading, {}),
        children: (0, jsxRuntime.jsx)(DeviceList, {...s}),
      }),
    }),
  DevicesUnavailable = () =>
    (0, jsxRuntime.jsx)(N, {
      title: 'Devices',
      children: (0, jsxRuntime.jsx)(A, {
        children: (0, jsxRuntime.jsxs)(g, {
          className: 'gap-1',
          children: [
            (0, jsxRuntime.jsx)(T, {className: 'text-muted-foreground mx-1 size-6'}),
            (0, jsxRuntime.jsx)(m, {
              searchable: false,
              title: 'Devices unavailable',
              description: 'Aux could not load active cloud sessions',
            }),
          ],
        }),
      }),
    }),
  DevicesLoading = () =>
    (0, jsxRuntime.jsx)(N, {
      title: 'Devices',
      children: (0, jsxRuntime.jsx)(A, {
        children: Array.from({length: 2}, (s, a) =>
          (0, jsxRuntime.jsxs)(
            g,
            {
              className: 'gap-1',
              children: [
                (0, jsxRuntime.jsx)(z, {className: 'mx-1 size-6 shrink-0 rounded-md'}),
                (0, jsxRuntime.jsxs)('div', {
                  className: 'min-w-0 grow space-y-1.5 px-1',
                  children: [
                    (0, jsxRuntime.jsx)(z, {className: 'h-4 w-28'}),
                    (0, jsxRuntime.jsx)(z, {className: 'h-3 w-48'}),
                  ],
                }),
              ],
            },
            a,
          ),
        ),
      }),
    }) /** The account’s devices; each can be signed out (this one switches Aux to local mode). */,
  DeviceList = ({accountId, onSignOutThisDevice}) => {
    const t = b(),
      i = F(),
      {confirm} = Z(),
      c = O(t.accounts.auth.signOutDevice.mutationOptions()),
      {data: n} = q(t.accounts.get.queryOptions({accountId})),
      {data} = q({...t.accounts.auth.devices.queryOptions({accountId}), retry: false}),
      u = l => {
        confirm(
          {
            title: 'Sign out device?',
            description: `This signs out ${deviceName(l)} from your Aux account. Local data on that device is not deleted.`,
            ui: {action: 'Sign out', variant: 'destructive'},
          },
          async () => {
            try {
              (await c.mutateAsync({accountId, deviceId: l.id}),
                await i.invalidateQueries(t.accounts.auth.devices.queryFilter({accountId})),
                y.success('Device signed out'));
            } catch (o) {
              y.error(o instanceof Error ? o.message : 'Failed to sign out device');
            }
          },
        );
      };
    return (0, jsxRuntime.jsx)(N, {
      title: 'Devices',
      children: (0, jsxRuntime.jsxs)(A, {
        children: [
          data.length === 0 &&
            (0, jsxRuntime.jsxs)(g, {
              className: 'gap-1',
              children: [
                (0, jsxRuntime.jsx)(T, {className: 'text-muted-foreground mx-1 size-6'}),
                (0, jsxRuntime.jsx)(m, {
                  searchable: false,
                  title: 'No tracked devices',
                  description: 'No active device sessions were found for this account',
                }),
              ],
            }),
          data.map(l => (0, jsxRuntime.jsx)(DeviceRow, {device: l, onSignOutDevice: u, onSignOutThisDevice}, l.id)),
          n?.userId &&
            (0, jsxRuntime.jsx)(
              CliLoginRequest,
              {accountId, userId: n.userId, email: n.email ?? ''},
              `${accountId}:${n.userId}`,
            ),
        ],
      }),
    });
  },
  DeviceRow = ({device, onSignOutDevice, onSignOutThisDevice}) => {
    const i = () => onSignOutDevice(device);
    return (0, jsxRuntime.jsxs)(g, {
      className: 'gap-1',
      children: [
        (0, jsxRuntime.jsx)(T, {className: 'text-muted-foreground mx-1 size-6'}),
        (0, jsxRuntime.jsx)(m, {
          title: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
            children: [
              (0, jsxRuntime.jsx)('span', {children: deviceName(device)}),
              device.isCurrent &&
                (0, jsxRuntime.jsx)(Q, {
                  className: 'ml-1 h-4 px-1 py-0.5 align-text-top text-[10px]',
                  variant: 'secondary',
                  children: 'This device',
                }),
            ],
          }),
          description: deviceDetail(device),
        }),
        (0, jsxRuntime.jsx)(k, {
          children: (0, jsxRuntime.jsxs)(ke, {
            children: [
              (0, jsxRuntime.jsx)(Ae, {
                render: (0, jsxRuntime.jsx)(D, {variant: 'ghost', size: 'icon'}),
                children: (0, jsxRuntime.jsx)(Qe, {}),
              }),
              (0, jsxRuntime.jsx)(Oe, {
                children: device.isCurrent
                  ? (0, jsxRuntime.jsxs)(M, {
                      variant: 'destructive',
                      onClick: onSignOutThisDevice,
                      children: [
                        (0, jsxRuntime.jsx)(AccountIcon, {}),
                        (0, jsxRuntime.jsx)('span', {children: 'Sign out this device'}),
                      ],
                    })
                  : (0, jsxRuntime.jsxs)(M, {
                      variant: 'destructive',
                      onClick: i,
                      children: [
                        (0, jsxRuntime.jsx)(AccountIcon, {}),
                        (0, jsxRuntime.jsx)('span', {children: 'Sign out device'}),
                      ],
                    }),
              }),
            ],
          }),
        }),
      ],
    });
  },
  deviceName = s => (s.deviceName ? s.deviceName : platformName(s.platform)),
  platformName = s => {
    switch (s) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
    }
  } /** Platform, last active and Aux version. */,
  deviceDetail = s => {
    const a = (0, te.default)(s.lastUsedAt ?? s.lastSeenAt);
    return [
      platformName(s.platform),
      a.isValid() && `Last active ${a.fromNow()}`,
      s.appVersion && `Aux ${s.appVersion}`,
    ]
      .filter(Boolean)
      .join(' • ');
  } /** What is wrong with this device’s sync key, and what to do. */,
  SYNC_KEY_PROBLEMS = {
    missing: `This device has no sync key. 
Turn on Browser data recovery on a device where sync works.`,
    mismatched: `The sync key on this device is for another account. 
Turn on Browser data recovery on a device where sync works.`,
    usable_ownerless: `Couldn't read the sync key on this device. 
Restart Aux and try again.`,
    usable_owned: `The sync key on this device is out of date. 
Turn on Browser data recovery on a device where sync works.`,
  } /** Sync and browser data recovery: enable, regenerate or recover. */,
  SyncSection = ({accountId: s, ownerId, needsSignIn, status, statusError, onRecover}) => {
    const c = b(),
      n = F(),
      [d, u] = (0, React.useState)(),
      l = O({...c.accounts.auth.enrollSyncKeyRecovery.mutationOptions(), gcTime: 0}),
      [auxOpen, auxSetOpen] = (0, React.useState)(false),
      auxLive = (0, React.useRef)(null),
      auxMutation = (0, React.useRef)(l),
      {accountId} = Y();
    auxMutation.current = l;
    auxLive.current =
      !needsSignIn &&
      !statusError &&
      accountId === s &&
      typeof ownerId === 'string' &&
      ownerId &&
      Number.isSafeInteger(status?.syncGeneration)
        ? {accountId: s, userId: ownerId, generation: status.syncGeneration}
        : null;
    (0, React.useEffect)(
      () => () => {
        auxMutation.current.reset();
      },
      [],
    );
    const o = () => {
        u(void 0);
        if (status?.canEnroll && auxLive.current) auxSetOpen(true);
      },
      auxClose = () => {
        auxSetOpen(false);
        auxMutation.current.reset();
      },
      auxValidate = async expected => {
        const [profile, status] = await Promise.all([
            n.fetchQuery({...c.accounts.auth.me.queryOptions({accountId: s}), staleTime: 0}),
            n.fetchQuery({...c.accounts.auth.syncKeyStatus.queryOptions({accountId: s}), staleTime: 0}),
          ]),
          live = auxLive.current;
        if (
          !live ||
          live.accountId !== expected.accountId ||
          live.userId !== expected.userId ||
          live.generation !== expected.generation ||
          profile.userId !== expected.userId ||
          status.syncGeneration !== expected.generation ||
          !status.canEnroll
        )
          throw Error('The account changed. Open browser data recovery again.');
      },
      auxEnroll = async input => {
        try {
          return await l.mutateAsync(input);
        } finally {
          l.reset();
        }
      },
      auxComplete = () => {
        auxClose();
        n.invalidateQueries(c.accounts.auth.syncKeyStatus.queryFilter({accountId: s})).catch(() => {});
        y.success('Browser data recovery enabled.');
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(N, {
          title: 'Sync',
          children: (0, jsxRuntime.jsxs)(A, {
            children: [
              needsSignIn &&
                (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    (0, jsxRuntime.jsx)(g, {
                      className: 'gap-1',
                      children: (0, jsxRuntime.jsx)(m, {
                        title: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                          children: [
                            (0, jsxRuntime.jsx)('span', {children: 'Sync needs attention'}),
                            (0, jsxRuntime.jsx)(Q, {
                              className: 'ml-1 h-4 px-1 py-0.5 align-text-top text-[10px]',
                              variant: 'secondary',
                              children: 'Needs sign-in',
                            }),
                          ],
                        }),
                        description:
                          'Aux could not verify your cloud session. Sign in again to resume syncing on this device.',
                      }),
                    }),
                    (0, jsxRuntime.jsxs)(I, {
                      className: '**:text-muted-foreground gap-1',
                      render: (0, jsxRuntime.jsx)(_, {to: '/auth/sign-in'}),
                      children: [
                        (0, jsxRuntime.jsx)(L, {className: 'mx-0.5 size-4'}),
                        (0, jsxRuntime.jsx)(m, {
                          searchable: false,
                          title: 'Sign in again',
                          description: 'Resume sync on this device',
                        }),
                      ],
                    }),
                  ],
                }),
              (0, jsxRuntime.jsxs)(g, {
                className: 'gap-1',
                children: [
                  (0, jsxRuntime.jsx)(m, {
                    title: 'Browser data recovery',
                    description: (0, jsxRuntime.jsx)('p', {
                      className: 'whitespace-pre-line',
                      children:
                        d ??
                        (status?.state === 'device_required' && !status.canEnroll
                          ? SYNC_KEY_PROBLEMS[status.localKeyStatus]
                          : status?.recoveryConfigured
                            ? 'Your saved recovery key can recover this browser data.'
                            : status && !status.canEnroll
                              ? 'This device needs its current Sync key before a recovery key can be saved.'
                              : 'Save a recovery key for your encrypted browser data.'),
                    }),
                  }),
                  (0, jsxRuntime.jsxs)(k, {
                    className: 'max-w-none shrink-0',
                    children: [
                      status?.recoveryConfigured === true &&
                        (0, jsxRuntime.jsx)(es, {checked: true, disabled: true, 'aria-label': 'Browser data recovery'}),
                      status &&
                        (status.canEnroll || (!status.recoveryConfigured && status.state === 'ready')) &&
                        (0, jsxRuntime.jsxs)(D, {
                          variant: 'outline',
                          disabled: l.isPending || !status.canEnroll || needsSignIn || !auxLive.current,
                          onClick: o,
                          children: [
                            l.isPending && (0, jsxRuntime.jsx)(P, {}),
                            (0, jsxRuntime.jsx)('span', {
                              children: status.recoveryConfigured ? 'Regenerate' : 'Enable',
                            }),
                          ],
                        }),
                      status?.recoveryConfigured &&
                        !status.canEnroll &&
                        (0, jsxRuntime.jsx)(D, {
                          variant: 'outline',
                          onClick: onRecover,
                          children: (0, jsxRuntime.jsx)('span', {children: 'Recover'}),
                        }),
                      (status?.state === 'provisioning' || (!status && !statusError)) && (0, jsxRuntime.jsx)(P, {}),
                      statusError &&
                        !needsSignIn &&
                        (0, jsxRuntime.jsx)(D, {
                          variant: 'outline',
                          onClick: () => n.invalidateQueries(c.accounts.auth.syncKeyStatus.queryFilter({accountId: s})),
                          children: 'Retry',
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
        auxOpen &&
          auxLive.current &&
          (0, jsxRuntime.jsx)(
            AuxSyncRecoveryEnrollment,
            {
              context: {...auxLive.current},
              getCurrentContext: () => auxLive.current,
              validateContext: auxValidate,
              enroll: auxEnroll,
              onComplete: auxComplete,
              onClose: auxClose,
            },
            `${s}:${ownerId}:${status.syncGeneration}`,
          ),
      ],
    });
  },
  DeleteAccountDialog = ({accountId, open, onDeleted, onOpenChange}) => {
    const r = b(),
      c = F(),
      n = O(r.accounts.auth.deleteAccount.mutationOptions()),
      d = o => {
        n.isPending || onOpenChange(o);
      },
      u = async () => {
        try {
          const o = accountId,
            h = await n.mutateAsync({accountId});
          (await ne(),
            W(),
            await Promise.all([
              c.invalidateQueries(r.accounts.get.queryFilter({accountId: h.currentAccountId})),
              c.invalidateQueries(r.accounts.list.queryFilter()),
              c.invalidateQueries(r.accounts.summary.queryFilter()),
              c.invalidateQueries(r.accounts.current.queryFilter()),
            ]),
            y.success('Account deleted'),
            await onDeleted(h.currentAccountId),
            c.removeQueries(r.accounts.auth.me.queryFilter({accountId: o})),
            o !== h.currentAccountId && c.removeQueries(r.accounts.get.queryFilter({accountId: o})),
            onOpenChange(false));
        } catch (o) {
          y.error(o instanceof Error ? o.message : 'Failed to delete account');
        }
      },
      l = () => {
        u();
      };
    return (0, jsxRuntime.jsx)(ge, {
      open,
      onOpenChange: d,
      children: (0, jsxRuntime.jsxs)(be, {
        className: 'max-w-lg sm:max-w-lg',
        children: [
          (0, jsxRuntime.jsxs)(je, {
            children: [
              (0, jsxRuntime.jsx)(fe, {children: 'Delete account?'}),
              (0, jsxRuntime.jsx)(pe, {
                children:
                  'This permanently deletes your Aux account and cloud data. Aux will switch away from this account on this device.',
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: '-mx-5 -mb-5 grid grid-cols-2 gap-2 rounded-b-3xl p-4',
            children: [
              (0, jsxRuntime.jsx)(xe, {className: 'w-full', disabled: n.isPending, children: 'Cancel'}),
              (0, jsxRuntime.jsxs)(D, {
                variant: 'destructive',
                className: 'w-full',
                disabled: n.isPending,
                onClick: l,
                children: [
                  n.isPending && (0, jsxRuntime.jsx)(P, {}),
                  (0, jsxRuntime.jsx)('span', {children: 'Delete account'}),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  } /** The profile: photo and name. */,
  ProfileSection = ({accountId, profile}) => {
    const t = b(),
      i = F(),
      r = (0, React.useRef)(null),
      c = O(t.accounts.auth.updateProfile.mutationOptions()),
      n = O({
        mutationFn: async p => {
          const x = new FormData();
          x.set('file', p);
          const C = await Pe(qe.auth.uploadAvatar(accountId), {body: x, method: 'POST'}),
            j = await C.json().catch(() => null);
          if (!C.ok)
            throw new Error(
              j && typeof j == 'object' && 'error' in j && typeof j.error == 'string'
                ? j.error
                : 'Failed to upload profile image',
            );
          return j;
        },
      }),
      d = X({mode: 'all', resolver: J(profileForm), defaultValues: {name: editableName(profile)}}),
      {reset} = d,
      l = () => r.current?.click(),
      o = async ({name}) => {
        try {
          const x = await c.mutateAsync({accountId, name});
          (storeProfile(i, t, accountId, x), reset({name: editableName(x)}), y.success('Profile updated'));
        } catch (x) {
          y.error(x instanceof Error ? x.message : 'Failed to update profile');
        }
      },
      h = c.isPending,
      v = n.isPending,
      w = async () => {
        if (h || !(await d.trigger('name'))) return;
        const p = profileForm.safeParse(d.getValues());
        !p.success || p.data.name === editableName(profile) || (await o(p.data));
      },
      f = async p => {
        const x = p.target.files?.[0];
        if (((p.target.value = ''), !!x))
          try {
            const C = await n.mutateAsync(x);
            (storeProfile(i, t, accountId, C), y.success('Profile photo updated'));
          } catch (C) {
            y.error(C instanceof Error ? C.message : 'Failed to upload profile image');
          }
      };
    return (
      (0, React.useEffect)(() => {
        reset({name: editableName(profile)});
      }, [profile.email, profile.name, reset]),
      (0, jsxRuntime.jsxs)('div', {
        className: 'divide-border divide-y dark:space-y-px dark:divide-y-0',
        children: [
          (0, jsxRuntime.jsxs)(g, {
            className: 'gap-2',
            children: [
              (0, jsxRuntime.jsx)(m, {title: 'Avatar'}),
              (0, jsxRuntime.jsxs)(k, {
                children: [
                  (0, jsxRuntime.jsxs)(He, {
                    children: [
                      (0, jsxRuntime.jsx)(Ue, {
                        render: ({className, ...x}) =>
                          (0, jsxRuntime.jsxs)('button', {
                            ...x,
                            type: 'button',
                            className: 'group/avatar-upload relative overflow-hidden rounded-lg',
                            disabled: v,
                            onClick: l,
                            children: [
                              (0, jsxRuntime.jsx)(ae, {profileUrl: profile.profileUrl, className: 'size-8 rounded-lg'}),
                              (0, jsxRuntime.jsx)('span', {
                                className:
                                  'absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover/avatar-upload:opacity-100 group-focus-visible/avatar-upload:opacity-100 group-disabled/avatar-upload:opacity-100',
                                children: v
                                  ? (0, jsxRuntime.jsx)(P, {className: 'size-4'})
                                  : (0, jsxRuntime.jsx)(Re, {className: 'size-4'}),
                              }),
                            ],
                          }),
                        children: (0, jsxRuntime.jsx)('span', {
                          className: 'sr-only',
                          children: 'Upload profile picture',
                        }),
                      }),
                      (0, jsxRuntime.jsx)(Ve, {children: 'Upload a new picture'}),
                    ],
                  }),
                  (0, jsxRuntime.jsx)('input', {
                    ref: r,
                    type: 'file',
                    className: 'hidden',
                    accept: 'image/jpeg,image/jpg,image/png,image/webp',
                    onChange: f,
                  }),
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)(g, {
            className: 'gap-2',
            children: [
              (0, jsxRuntime.jsx)(m, {title: 'Your name'}),
              (0, jsxRuntime.jsx)(k, {
                children: (0, jsxRuntime.jsxs)(Ne, {
                  children: [
                    (0, jsxRuntime.jsx)(De, {
                      ...d.register('name', {onBlur: w}),
                      'aria-invalid': !!d.formState.errors.name,
                      placeholder: 'e.g. Douglas Engelbart',
                    }),
                    h &&
                      (0, jsxRuntime.jsx)(ye, {
                        align: 'inline-end',
                        children: (0, jsxRuntime.jsx)(P, {className: 'size-4'}),
                      }),
                  ],
                }),
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)(g, {
            className: 'gap-2',
            children: [
              (0, jsxRuntime.jsx)(m, {title: 'Email'}),
              (0, jsxRuntime.jsx)(k, {children: (0, jsxRuntime.jsx)(we, {value: profile.email, readOnly: true})}),
            ],
          }),
        ],
      })
    );
  },
  profileForm = se({
    name: ee().trim().min(1, 'Please enter your name'),
  }) /** Stores a changed profile in the account queries. */,
  storeProfile = (s, a, t, i) => {
    (s.setQueryData(a.accounts.auth.me.queryKey({accountId: t}), i),
      s.setQueryData(a.accounts.get.queryKey({accountId: t}), r => r && re(r, i)));
  } /** A name the user set (an email used as the name counts as none). */,
  editableName = s => (s.name === s.email ? '' : s.name); /** The Account page. */
function Gs() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(ss, {segments: ['Settings', 'Account']}),
      (0, jsxRuntime.jsx)(Xe, {children: (0, jsxRuntime.jsx)('h1', {children: 'Account'})}),
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(Je, {}),
        children: (0, jsxRuntime.jsx)(AccountSettings, {}),
      }),
    ],
  });
}
var AccountSettings = () => {
  const {accountId} = Y(),
    a = b(),
    {data} = q(a.accounts.get.queryOptions({accountId}));
  return (0, jsxRuntime.jsxs)('div', {
    className: 'space-y-8',
    children: [
      data?.mode === 'cloud' && data.authStatus === 'paused' && (0, jsxRuntime.jsx)(PausedAccount, {account: data}),
      data?.mode === 'cloud' && data.authStatus !== 'paused' && (0, jsxRuntime.jsx)(CloudAccount, {}),
      data?.mode === 'local' && (0, jsxRuntime.jsx)(LocalModeCard, {}),
    ],
  });
};
