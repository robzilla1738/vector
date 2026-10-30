/* Aux-owned source: a routine's environment label and the Advanced section of its dialog
 * (assets/provider-Cw0zhujt.js, Ki through qi): type, parent task, permission and environment. Routines
 * run on this computer; existing cloud routines are preserved and unavailable.
 * Names the rest of the chunk uses keep their chunk names: Ki the environment label (exported), Hi the section, Kn the device-only note.
 * Chunk names used: c React, r JSX runtime, q useApp, Q useTRPC, te useQuery, Le useFormContext, ba/xr
 * the cloud and laptop marks, Fs Skeleton, Bi the permission menu, Ke/Ue/ut/Ve/we Select parts, ce the
 * chevron, Ie/he buttonVariants and Button, je/ue/de tooltip, Dr/Or/Tr/Nr Collapsible, vt/gt/xt menu,
 * Ps/Os/Vs InputGroup, vr magnifying glass, be/qe menu group and item, pe dayjs, Tn checkmark. */
/** Where a routine runs. */
  Ki = ({environment, deviceName, isCurrent = false, loading = false}) =>
    (0, r.jsxs)('span', {
      className: 'inline-flex min-w-0 items-center gap-1.5',
      children: [
        environment === 'cloud'
          ? (0, r.jsx)(ba, {className: 'text-muted-foreground size-3.5 shrink-0'})
          : (0, r.jsx)(xr, {className: 'text-muted-foreground size-3.5 shrink-0'}),
        loading && environment === 'device'
          ? (0, r.jsx)(Fs, {className: 'h-2.5 w-24'})
          : (0, r.jsx)('span', {
              className: 'truncate',
              title: deviceName ?? void 0,
              children:
                environment === 'cloud'
                  ? 'Cloud unavailable · Preserved'
                  : isCurrent
                    ? 'This computer'
                    : `Device · ${deviceName || 'Unknown device'}`,
            }),
      ],
    }),
  /** The routine types. */
  ROUTINE_TYPES = {
    standalone: 'Standalone',
    child: 'Runs in task',
  },
  /** Why a routine's type and parent task cannot be changed. */
  Kn = 'Routines run on this computer. Existing cloud routines are preserved and unavailable.',
  /** The Advanced section of the routine dialog. */
  Hi = ({editing, environment = 'device', canEditSettings = true}) => {
    const form = Le(),
      attachment = form.watch('attachment'),
      currentEnvironment = editing ? environment : form.watch('environment'),
      setType = value => {
        value &&
          form.setValue('attachment', value === 'child' ? {type: value, parentSessionId: ''} : {type: value}, {
            shouldDirty: true,
            shouldValidate: true,
          });
      },
      setPermissionMode = value => form.setValue('permissionMode', value, {shouldDirty: true, shouldValidate: true}),
      fields = (0, r.jsxs)('div', {
        className: 'border-input divide-border divide-y rounded-lg border',
        children: [
          (0, r.jsxs)('div', {
            className: 'flex min-h-11 items-center justify-between gap-3 py-1.5 pr-2 pl-3',
            children: [
              (0, r.jsx)('span', {className: 'text-sm select-none', children: 'Type'}),
              (0, r.jsxs)(Ke, {
                items: ROUTINE_TYPES,
                value: attachment.type,
                disabled: editing || currentEnvironment === 'cloud',
                onValueChange: setType,
                children: [
                  (0, r.jsxs)(je, {
                    children: [
                      (0, r.jsx)(ue, {
                        disabled: !editing,
                        render: (0, r.jsx)('span', {className: 'inline-flex', tabIndex: editing ? 0 : void 0}),
                        children: (0, r.jsx)(Ue, {
                          'aria-label': 'Routine type',
                          icon: (0, r.jsx)(ce, {className: 'text-muted-foreground size-4'}),
                          className: Ie({
                            variant: 'ghost',
                            className:
                              'text-foreground w-fit bg-transparent font-normal shadow-none dark:bg-transparent',
                          }),
                          children: (0, r.jsx)(ut, {}),
                        }),
                      }),
                      (0, r.jsx)(de, {children: Kn}),
                    ],
                  }),
                  (0, r.jsxs)(Ve, {
                    align: 'end',
                    children: [
                      (0, r.jsx)(we, {value: 'standalone', children: 'Standalone'}),
                      (0, r.jsx)(we, {value: 'child', children: 'Runs in task'}),
                    ],
                  }),
                ],
              }),
            ],
          }),
          attachment.type === 'child' && (0, r.jsx)(ParentTaskField, {disabled: editing}),
          (0, r.jsxs)('div', {
            className: 'flex min-h-11 items-center justify-between gap-3 py-1.5 pr-2 pl-3',
            children: [
              (0, r.jsx)('span', {className: 'text-sm select-none', children: 'Permission'}),
              (0, r.jsx)(Bi, {
                mode: form.watch('permissionMode'),
                alwaysShowLabel: true,
                render: (0, r.jsx)(he, {
                  type: 'button',
                  variant: 'ghost',
                  disabled: !canEditSettings,
                  className:
                    '[&>div]:text-foreground [&_svg[data-icon=inline-end]]:text-muted-foreground font-normal [&_svg[data-icon=inline-end]]:size-4 [&>div]:text-sm',
                }),
                onModeChange: setPermissionMode,
              }),
            ],
          }),
          (0, r.jsxs)('div', {
            className: 'flex min-h-11 items-center justify-between gap-3 py-1.5 pr-2 pl-3',
            children: [
              (0, r.jsx)('span', {className: 'text-sm select-none', children: 'Environment'}),
              (0, r.jsxs)(Ke, {
                value: currentEnvironment,
                disabled: editing || !canEditSettings,
                onValueChange: value => {
                  value === 'device' &&
                    form.setValue('environment', 'device', {shouldDirty: true, shouldValidate: true});
                },
                children: [
                  (0, r.jsx)(Ue, {
                    'aria-label': 'Routine environment',
                    className: 'w-fit',
                    children: (0, r.jsx)(Ki, {
                      environment: currentEnvironment,
                      isCurrent: currentEnvironment === 'device' && canEditSettings,
                    }),
                  }),
                  (0, r.jsxs)(Ve, {
                    align: 'end',
                    children: [(0, r.jsx)(we, {value: 'device', children: 'This computer'})],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    return (0, r.jsx)(Dr, {
      children: (0, r.jsxs)(Or, {
        children: [
          (0, r.jsx)(Tr, {
            className: Ie({
              variant: 'ghost',
              className:
                'text-muted-foreground mb-2 w-fit flex-none items-center justify-start py-0 font-normal aria-expanded:bg-transparent aria-expanded:text-muted-foreground **:data-[slot=accordion-trigger-icon]:ml-0',
            }),
            children: 'Advanced',
          }),
          (0, r.jsx)(Nr, {className: 'pb-0', children: fields}),
        ],
      }),
    });
  },
  /** The task a routine runs in, searched from a menu; read-only once created. */
  ParentTaskField = ({disabled}) => {
    const {accountId} = q(),
      trpc = Q(),
      form = Le(),
      parentSessionId = form.watch('attachment.parentSessionId'),
      [open, setOpen] = (0, c.useState)(false),
      [query, setQuery] = (0, c.useState)(''),
      [pickedTitle, setPickedTitle] = (0, c.useState)(),
      {data: parentSession, isLoading} = te(
        trpc.sessions.get.queryOptions(
          {accountId, sessionId: parentSessionId},
          {enabled: disabled && !!parentSessionId},
        ),
      ),
      {
        data: tasks,
        isFetching,
        isError,
      } = te(
        trpc.sessions.listPreviewItems.queryOptions(
          {accountId, q: query, limit: 50, parent: 'root', coders: 'exclude'},
          {enabled: open},
        ),
      ),
      handleQueryChange = value => setQuery(value.target.value),
      handleSearchKeyDown = value => {
        if ((value.stopPropagation(), value.key !== 'ArrowDown' && value.key !== 'ArrowUp')) return;
        value.preventDefault();
        const items = [...(value.currentTarget.closest('[role=menu]')?.querySelectorAll('[role^=menuitem]') ?? [])];
        (value.key === 'ArrowDown' ? items[0] : items.at(-1))?.focus();
      },
      pickTask = value => () => {
        (form.setValue(
          'attachment',
          {type: 'child', parentSessionId: value.id},
          {shouldDirty: true, shouldValidate: true},
        ),
          setPickedTitle(value.title || 'Untitled task'),
          setOpen(false));
      };
    return (0, r.jsxs)('div', {
      className: 'flex min-h-11 items-center justify-between gap-3 py-1.5 pr-2 pl-3',
      children: [
        (0, r.jsx)('span', {className: 'shrink-0 text-sm select-none', children: 'Runs in task'}),
        (0, r.jsxs)(vt, {
          open,
          onOpenChange: setOpen,
          children: [
            (0, r.jsxs)(je, {
              children: [
                (0, r.jsx)(ue, {
                  disabled: !disabled,
                  render: (0, r.jsx)('span', {className: 'inline-flex min-w-0', tabIndex: disabled ? 0 : void 0}),
                  children: (0, r.jsxs)(gt, {
                    disabled,
                    render: (0, r.jsx)(he, {
                      type: 'button',
                      variant: 'ghost',
                      className: 'max-w-80 min-w-0 font-normal',
                    }),
                    children: [
                      (0, r.jsx)('span', {
                        className: 'truncate',
                        children: parentSession
                          ? parentSession.title || 'Untitled task'
                          : pickedTitle ||
                            (disabled ? (isLoading ? 'Loading task...' : 'Task unavailable') : 'Select task'),
                      }),
                      (0, r.jsx)(ce, {className: 'text-muted-foreground size-4'}),
                    ],
                  }),
                }),
                (0, r.jsx)(de, {children: Kn}),
              ],
            }),
            (0, r.jsxs)(xt, {
              align: 'end',
              side: 'top',
              positionerProps: {collisionAvoidance: {side: 'none', align: 'shift', fallbackAxisSide: 'none'}},
              className: 'w-80 max-w-[calc(100vw-2rem)] p-1',
              children: [
                (0, r.jsxs)(Ps, {
                  className: 'mb-1 border-0! bg-transparent! shadow-none ring-0!',
                  children: [
                    (0, r.jsx)(Os, {align: 'inline-start', children: (0, r.jsx)(vr, {className: 'size-4'})}),
                    (0, r.jsx)(Vs, {
                      autoFocus: true,
                      'aria-label': 'Search tasks',
                      placeholder: 'Search tasks',
                      value: query,
                      onChange: handleQueryChange,
                      onKeyDown: handleSearchKeyDown,
                    }),
                  ],
                }),
                (0, r.jsxs)(be, {
                  className: 'max-h-64 overflow-y-auto',
                  children: [
                    isFetching &&
                      (0, r.jsx)('p', {
                        className: 'text-muted-foreground px-2 py-2 text-xs',
                        children: 'Loading tasks...',
                      }),
                    !isFetching &&
                      !tasks?.length &&
                      (0, r.jsx)('p', {
                        className: 'text-muted-foreground px-2 py-2 text-xs',
                        children: isError ? 'Could not load tasks.' : 'No tasks found.',
                      }),
                    tasks?.map(value =>
                      (0, r.jsxs)(
                        qe,
                        {
                          onClick: pickTask(value),
                          children: [
                            (0, r.jsx)('span', {
                              className: 'min-w-0 flex-1 truncate text-left',
                              children: value.title || 'Untitled task',
                            }),
                            (0, r.jsx)('span', {
                              className: 'text-muted-foreground shrink-0 text-xs',
                              children: (0, pe.default)(value.createdAt).format('MMM D, YYYY'),
                            }),
                            value.id === parentSessionId && (0, r.jsx)(Tn, {className: 'size-4'}),
                          ],
                        },
                        value.id,
                      ),
                    ),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }
