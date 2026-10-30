/* Aux-owned source: the Routines settings page (assets/routines-BNdQOEUt.js, after its imports; re
 * exported as component): the routine schemas, the user's routines (each with its schedule, a switch,
 * its menu and whether a change is still syncing to this device), Create, and the routine dialog.
 * Names the rest of the chunk uses keep their chunk names: re the page.
 * Chunk names used: o/a/c/t/d/i/M/_ zod, q/N/k/C model, harness, permission and browser schemas,
 * p the route, y useTRPC, g useSuspenseQuery, R the schedule's description, L the routine row with its
 * menu, P the routine dialog, A/z/f/x settings sections and rows, m Link, I the plus icon. */
var ROUTINE_TYPES = o(['standalone', 'child', 'internal']),
  ROUTINE_STATUSES = o(['active', 'paused', 'completed', 'deleted']),
  routineSessionConfig = a({
    model: q.optional(),
    harnessId: N.optional(),
    permissionMode: k.optional(),
    notificationsEnabled: _().optional(),
  }),
  routineMetadata = a({
    origin: M('type', [
      a({type: c('user')}),
      a({type: c('session-message'), sessionId: t(), messageId: t()}),
      a({type: c('channel-message'), channelId: t(), messageId: t()}),
    ]).optional(),
    memoryPath: t().optional(),
  }),
  routineSchema = a({
    id: t(),
    name: t().min(1),
    prompt: t().min(1),
    rrule: t().min(1),
    type: ROUTINE_TYPES,
    environment: o(['device', 'cloud']),
    deviceId: t().nullable(),
    revision: d().int().positive().nullable().optional(),
    appliedRevision: d().int().positive().nullable().optional(),
    parentSessionId: t().nullable(),
    projectId: t().nullable(),
    channelId: t().nullable(),
    status: ROUTINE_STATUSES,
    nextRunAt: i().nullable(),
    metadata: routineMetadata,
    sessionConfig: routineSessionConfig,
    createdAt: i(),
    updatedAt: i(),
    pausedAt: i().nullable(),
    deletedAt: i().nullable(),
  }),
  createRoutineSchema = a({
    environment: c('device').default('device'),
    name: t().trim().min(1),
    prompt: t().trim().min(1),
    rrule: t().trim().min(1),
    status: o(['active', 'paused']).optional(),
    projectId: t().nullable().optional(),
    browserBinding: C.optional(),
    sessionConfig: routineSessionConfig.optional(),
  }).strict(),
  updateRoutineSchema = createRoutineSchema
    .pick({name: true, prompt: true, rrule: true, status: true, sessionConfig: true})
    .partial()
    .extend({revision: d().int().positive().nullable().optional()}),
  jsxRuntime = S(); /** The Routines page. */
function re() {
  const n = p.useSearch(),
    r = p.useNavigate(),
    l = () => {
      r({search: {}});
    };
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(B, {segments: ['Settings', 'Routines']}),
      (0, jsxRuntime.jsx)($, {children: (0, jsxRuntime.jsx)('h1', {children: 'Routines'})}),
      (0, jsxRuntime.jsx)(MyRoutines, {}),
      (0, jsxRuntime.jsx)(P, {open: !!n.mode, routineId: n.mode === 'edit' ? n.id : void 0, onClose: l}),
    ],
  });
}
var /** My routines: each routine with its switch and menu, then Create (held at the Free plan’s limit when payments are on). */
  MyRoutines = () => {
    const {userId} = p.useParams(),
      r = Number(userId),
      l = y(),
      {data: u} = g(l.routines.list.queryOptions({accountId: r})),
      {data} = g(l.accounts.get.queryOptions({accountId: r})),
      h = AUX_LAUNCH_POLICY.paymentsEnabled && (data?.subscriptionPlan ?? 'free') === 'free',
      v = h && u.filter(s => s.status === 'active').length >= 3;
    return (0, jsxRuntime.jsxs)(A, {
      title: 'My routines',
      children: [
        false &&
          (0, jsxRuntime.jsxs)('div', {
            className:
              'inner-curved-shape-top bg-muted text-muted-foreground relative z-10 -mx-3.5 flex items-center justify-between gap-1 border border-transparent px-4 pt-1.5 text-[13px] font-medium',
            children: [
              (0, jsxRuntime.jsx)(w, {className: '-ml-0.5 size-4'}),
              (0, jsxRuntime.jsx)('p', {
                className: 'grow',
                children: v
                  ? "You've reached the Free plan limit. Pause a routine or upgrade."
                  : 'You can keep up to 3 routines active on the Free plan.',
              }),
              (0, jsxRuntime.jsx)(F, {
                size: 'xs',
                variant: 'secondary',
                render: (0, jsxRuntime.jsx)(m, {
                  to: '/u/$userId/settings/billing',
                  params: {userId},
                  search: {change_plan: 1},
                }),
                children: 'Upgrade',
              }),
            ],
          }),
        (0, jsxRuntime.jsxs)(z, {
          className: 'z-1',
          children: [
            u
              .filter(s => s.type !== 'internal')
              .map(s =>
                (0, jsxRuntime.jsx)(
                  L,
                  {
                    routine: s,
                    showSwitch: true,
                    children: (0, jsxRuntime.jsx)(f, {
                      className:
                        'dark:group-hover/routine:bg-accent h-12 w-full pr-28 group-hover/routine:bg-neutral-100',
                      render: (0, jsxRuntime.jsx)(m, {
                        to: '/u/$userId/tasks/$sessionId',
                        params: {userId, sessionId: s.parentSessionId},
                      }),
                      children: (0, jsxRuntime.jsx)(x, {
                        title: (0, jsxRuntime.jsx)('span', {className: 'block truncate', children: s.name}),
                        label: s.name,
                        description: (0, jsxRuntime.jsxs)('span', {
                          className: 'flex items-center gap-2 truncate',
                          children: [
                            (0, jsxRuntime.jsx)('span', {
                              children: s.environment === 'cloud' ? 'Cloud routine unavailable · Preserved' : R(s),
                            }),
                            s.environment === 'device' &&
                            s.revision &&
                            (!s.appliedRevision || s.appliedRevision < s.revision)
                              ? (0, jsxRuntime.jsx)('span', {children: 'Pending sync'})
                              : null,
                          ],
                        }),
                      }),
                    }),
                  },
                  s.id,
                ),
              ),
            (0, jsxRuntime.jsxs)(f, {
              variant: 'action',
              className: 'h-12 w-full',
              render: v
                ? (0, jsxRuntime.jsx)('button', {
                    type: 'button',
                    className: 'pointer-events-none *:opacity-50',
                    disabled: true,
                  })
                : (0, jsxRuntime.jsx)(m, {
                    to: '/u/$userId/settings/routines',
                    params: {userId},
                    search: {mode: 'create'},
                    replace: true,
                  }),
              children: [(0, jsxRuntime.jsx)(I, {className: 'size-4'}), (0, jsxRuntime.jsx)(x, {title: 'Create'})],
            }),
          ],
        }),
      ],
    });
  };
