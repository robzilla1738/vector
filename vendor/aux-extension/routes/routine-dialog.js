/* Aux-owned source: the routine dialog (assets/provider-Cw0zhujt.js, Wo through nl): the form schema and
 * its defaults, a one-time routine's DTSTART rule, the dialog with its discard guard, the form for
 * creating or editing, and opening a session where the composer lives. Routines on this computer
 * can change; anything else is read-only, with cloud routines preserved. Editing sends only what
 * changed; creating opens the routine's parent session when it has one.
 * Names the rest of the chunk uses keep their chunk names: Jo the dialog and nl useOpenSession (exported).
 * Chunk names used: c React, r JSX runtime, M/w/N/H/ze/On/pa/kr schema parts, ko the default rule, pe dayjs,
 * js useConfirm, Fr/Lr/Pn/_r/Pr dialog parts, pt Spinner, q useApp, Q useTRPC, $o/Vo default model and the
 * mutations, We agent settings, yt useSuspenseQuery, bn useNavigate, Gs/Js/er useForm, its resolver and
 * provider, auxDeviceRoutineEditable, dt the browser binding, Ce toast, Mn/ot/it/De Field parts and Input,
 * Co prompt, Fo schedule, Hi Advanced, Ji model, bt Switch, he Button, Sr/br pause and play, Le useFormContext,
 * hs useMatch, zr the mini popup. */
/** The routine form's schema. */
  routineFormSchema = M({
    environment: N('device'),
    projectId: w().nullable(),
    name: w().trim().min(1),
    prompt: w().trim().min(1),
    timezone: w(),
    model: pa.extend({fastMode: H()}),
    permissionMode: kr,
    notificationsEnabled: H(),
    attachment: ze('type', [M({type: N('standalone')}), M({type: N('child'), parentSessionId: w().min(1)})]),
    trigger: ze('kind', [M({kind: N('recurring'), rrule: w().min(1)}), M({kind: N('once'), runAt: On()})]),
  }),
  /** A new routine's values. */
  emptyRoutine = (model, projectId, permissionMode, timezone) => ({
    projectId,
    environment: 'device',
    name: '',
    prompt: '',
    timezone,
    model,
    permissionMode,
    notificationsEnabled: true,
    attachment: {type: 'standalone'},
    trigger: {kind: 'recurring', rrule: ko},
  }),
  /** A routine as form values. */
  routineToForm = (routine, model, timezone) => ({
    ...emptyRoutine(
      routine.sessionConfig.model ?? model,
      routine.projectId,
      routine.sessionConfig.permissionMode ?? 'guard',
      timezone,
    ),
    environment: routine.environment,
    name: routine.name,
    prompt: routine.prompt,
    notificationsEnabled: routine.sessionConfig.notificationsEnabled !== false,
    attachment:
      routine.type === 'child' && routine.parentSessionId
        ? {type: 'child', parentSessionId: routine.parentSessionId}
        : {type: 'standalone'},
    trigger: parseOnceRule(routine.rrule, timezone) ?? {kind: 'recurring', rrule: routine.rrule},
  }),
  /** The rule to save: once is a DTSTART with COUNT=1. */
  formRrule = values =>
    values.trigger.kind === 'once'
      ? `DTSTART:${(0, pe.default)(values.trigger.runAt).utc().format('YYYYMMDDTHHmmss')}Z
RRULE:FREQ=DAILY;COUNT=1`
      : values.trigger.rrule;
/** A one-time rule as a trigger. */
function parseOnceRule(rrule, timezone) {
  const match = rrule.match(/^DTSTART(?:;TZID=([^:]+))?:(\d{8}T\d{6})(Z)?/);
  if (!match || !/(?:^|;)COUNT=1(?:;|$)/.test(rrule.split('RRULE:')[1] ?? '')) return;
  const local = match[2].replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6');
  return {
    kind: 'once',
    runAt: (match[3] ? (0, pe.default)(`${local}Z`) : pe.default.tz(local, match[1] ?? timezone)).toISOString(),
  };
}
var /** The routine dialog; unsaved changes need a confirmation. */
  Jo = ({open, routineId, projectId, onClose}) => {
    const {confirm} = js(),
      confirming = (0, c.useRef)(false),
      [isDirty, setIsDirty] = (0, c.useState)(false),
      cancel = async () => {
        if (!confirming.current) {
          if (isDirty) {
            confirming.current = true;
            try {
              if (
                !(await confirm({
                  title: 'Discard changes?',
                  description: 'Your unsaved changes will be lost.',
                  ui: {action: 'Discard', cancel: 'Keep editing', variant: 'destructive'},
                }))
              )
                return;
            } finally {
              confirming.current = false;
            }
          }
          onClose();
        }
      },
      handleOpenChange = (nextOpen, details) => {
        nextOpen || (details.cancel(), cancel());
      };
    return (0, r.jsx)(RoutineDialogContext, {
      value: {onClose, onCancel: cancel, onDirtyChange: setIsDirty},
      children: (0, r.jsx)(Fr, {
        open,
        onOpenChange: handleOpenChange,
        children: (0, r.jsx)(Lr, {
          className: 'w-xl max-w-[calc(100%-2rem)]!',
          children: (0, r.jsx)(c.Suspense, {
            fallback: (0, r.jsx)(pt, {className: 'mx-auto size-4'}),
            children: open && (0, r.jsx)(RoutineDialogBody, {routineId, projectId}, routineId ?? 'create'),
          }),
        }),
      }),
    });
  },
  /** The dialog's callbacks. */
  RoutineDialogContext = (0, c.createContext)(null),
  /** Resolves the defaults, then the form. */
  RoutineDialogBody = ({routineId, projectId = null}) => {
    const {accountId} = q(),
      trpc = Q(),
      model = $o(),
      {defaultPermissionMode} = We({loadModelCatalog: false}),
      {data: settings} = yt(trpc.settings.getAll.queryOptions({accountId})),
      defaults = emptyRoutine(model, projectId, defaultPermissionMode, settings.timezone ?? 'UTC');
    return routineId ? (0, r.jsx)(EditRoutineForm, {routineId, defaults}) : (0, r.jsx)(RoutineForm, {defaults});
  },
  /** Loads the routine to edit. */
  EditRoutineForm = ({routineId, defaults}) => {
    const {accountId} = q(),
      trpc = Q(),
      {data: routine} = yt(trpc.routines.get.queryOptions({accountId, routineId}));
    return routine
      ? (0, r.jsx)(RoutineForm, {
          routineId,
          defaults: routineToForm(routine, defaults.model, defaults.timezone),
          status: routine.status,
          routine,
        })
      : (0, r.jsx)(Pn, {children: 'Routine not found'});
  },
  /** The routine form. */
  RoutineForm = ({routineId, defaults, status, routine}) => {
    const {onClose, onCancel, onDirtyChange} = (0, c.useContext)(RoutineDialogContext),
      {accountId} = q(),
      navigate = bn(),
      trpc = Q(),
      {data: settings} = yt(trpc.settings.getAll.queryOptions({accountId})),
      editable = auxDeviceRoutineEditable(routine, settings),
      id = (0, c.useId)(),
      form = Gs({mode: 'all', resolver: Js(routineFormSchema), defaultValues: defaults}),
      {createRoutine, updateRoutine} = Vo(),
      environment = routine?.environment ?? form.watch('environment'),
      {isDirty} = form.formState,
      isBusy = form.formState.isSubmitting || updateRoutine.isPending,
      togglePaused = async () => {
        if (!(!routineId || (status !== 'active' && status !== 'paused')))
          try {
            if (!auxDeviceRoutineEditable(routine, settings))
              throw Error('This routine is unavailable on this computer.');
            await updateRoutine.mutateAsync({
              accountId,
              routineId,
              revision: routine?.revision,
              status: status === 'active' ? 'paused' : 'active',
            });
          } catch (error) {
            Ce.error(error instanceof Error ? error.message : 'Could not update routine.');
          }
      },
      save = async values => {
        try {
          if (values.environment !== 'device' || !auxDeviceRoutineEditable(routine, settings))
            throw Error('Only routines on this computer can be changed. Cloud routines are preserved and unavailable.');
          if (routineId)
            (await updateRoutine.mutateAsync({
              accountId,
              routineId,
              revision: routine?.revision,
              name: values.name,
              prompt: values.prompt,
              ...(editable &&
              (form.formState.dirtyFields.model ||
                form.formState.dirtyFields.permissionMode ||
                form.formState.dirtyFields.notificationsEnabled)
                ? {
                    sessionConfig: {
                      ...(form.formState.dirtyFields.model ? {model: values.model} : {}),
                      ...(form.formState.dirtyFields.notificationsEnabled
                        ? {notificationsEnabled: values.notificationsEnabled}
                        : {}),
                      ...(form.formState.dirtyFields.permissionMode ? {permissionMode: values.permissionMode} : {}),
                    },
                  }
                : {}),
              ...(form.formState.dirtyFields.trigger ? {rrule: formRrule(values)} : {}),
            }),
              onClose());
          else {
            const created = await createRoutine.mutateAsync({
              accountId,
              name: values.name,
              prompt: values.prompt,
              rrule: formRrule(values),
              projectId: values.projectId,
              ...values.attachment,
              environment: 'device',
              browserBinding: await dt(),
              sessionConfig: {
                model: values.model,
                permissionMode: values.permissionMode,
                notificationsEnabled: values.notificationsEnabled,
              },
            });
            (onClose(),
              created.parentSessionId &&
                created.environment === 'device' &&
                (await navigate({
                  to: '/u/$userId/tasks/$sessionId',
                  params: {userId: String(accountId), sessionId: created.parentSessionId},
                })));
          }
        } catch (error) {
          Ce.error(error instanceof Error ? error.message : 'Could not save routine.');
        }
      },
      setPrompt = prompt => form.setValue('prompt', prompt, {shouldDirty: true, shouldValidate: true});
    return (
      (0, c.useEffect)(() => (onDirtyChange(isDirty), () => onDirtyChange(false)), [isDirty, onDirtyChange]),
      (0, r.jsx)(er, {
        ...form,
        children: (0, r.jsxs)('form', {
          className: 'flex max-h-[calc(100dvh-4.5rem)] min-w-0 flex-col gap-4',
          onSubmit: form.handleSubmit(save),
          children: [
            (0, r.jsx)(Pn, {
              children:
                routine?.environment === 'cloud'
                  ? 'Cloud routine unavailable'
                  : routineId
                    ? 'Edit routine'
                    : 'Create routine',
            }),
            (0, r.jsx)(_r, {
              className: 'sr-only',
              children:
                routine?.environment === 'cloud'
                  ? 'Cloud routine preserved. Cloud execution and changes are unavailable.'
                  : !editable
                    ? 'This routine belongs to another device or this computer is not initialized.'
                    : 'Set the routine name, schedule, and prompt.',
            }),
            (0, r.jsx)('fieldset', {
              disabled: !editable,
              className: '-mx-1 min-h-0 min-w-0 overflow-y-auto px-1',
              children: (0, r.jsxs)(Mn, {
                className: 'gap-4 py-1',
                children: [
                  (0, r.jsxs)(ot, {
                    children: [
                      (0, r.jsx)(it, {htmlFor: `${id}-title`, children: 'Title'}),
                      (0, r.jsx)(De, {
                        id: `${id}-title`,
                        className: 'bg-transparent!',
                        placeholder: 'Routine name',
                        autoComplete: 'off',
                        ...form.register('name'),
                      }),
                    ],
                  }),
                  (0, r.jsxs)(ot, {
                    'aria-labelledby': `${id}-prompt-label`,
                    children: [
                      (0, r.jsx)(it, {id: `${id}-prompt-label`, children: 'Prompt'}),
                      (0, r.jsx)('div', {
                        className: 'border-input rounded-lg border px-2.5 py-2',
                        children: (0, r.jsx)(Co, {
                          projectId: defaults.projectId,
                          disabled: !editable,
                          className: 'h-40 max-h-40 overflow-y-auto p-0! text-sm',
                          initialPrompt: defaults.prompt,
                          onChange: setPrompt,
                        }),
                      }),
                    ],
                  }),
                  (0, r.jsxs)('div', {
                    className: 'border-input divide-border divide-y rounded-lg border',
                    children: [
                      (0, r.jsx)(Fo, {}),
                      (0, r.jsxs)('fieldset', {
                        disabled: !editable,
                        className: 'divide-border divide-y disabled:opacity-50',
                        children: [
                          (0, r.jsx)(ModelRow, {}),
                          environment === 'device' && (0, r.jsx)(NotificationsRow, {}),
                        ],
                      }),
                    ],
                  }),
                  (0, r.jsx)(Hi, {editing: !!routineId, environment, canEditSettings: editable}),
                ],
              }),
            }),
            (0, r.jsx)(Pr, {
              children: (0, r.jsxs)('div', {
                className: 'flex justify-end gap-1',
                children: [
                  (0, r.jsxs)(he, {
                    type: 'button',
                    variant: 'secondary',
                    disabled: isBusy || (!!routineId && (!editable || (status !== 'active' && status !== 'paused'))),
                    onClick: routineId ? togglePaused : onCancel,
                    children: [
                      routineId &&
                        (status === 'active'
                          ? (0, r.jsx)(Sr, {className: 'size-4'})
                          : (0, r.jsx)(br, {className: 'size-4'})),
                      routineId ? (status === 'active' ? 'Pause' : 'Resume') : 'Cancel',
                    ],
                  }),
                  (0, r.jsx)(he, {
                    type: 'submit',
                    disabled: isBusy || !editable || !form.formState.isValid,
                    children: routineId ? 'Update' : 'Create',
                  }),
                ],
              }),
            }),
          ],
        }),
      })
    );
  },
  /** The Model row. */
  ModelRow = () => {
    const form = Le(),
      model = form.watch('model'),
      setModel = value => form.setValue('model', value, {shouldDirty: true, shouldValidate: true});
    return (0, r.jsxs)('div', {
      className: 'flex min-h-11 items-center justify-between gap-3 py-1.5 pr-2 pl-3',
      children: [
        (0, r.jsx)('span', {className: 'text-sm select-none', children: 'Model'}),
        (0, r.jsx)(Ji, {value: model, onValueChange: setModel}),
      ],
    });
  },
  /** The Notifications row. */
  NotificationsRow = () => {
    const form = Le(),
      enabled = form.watch('notificationsEnabled'),
      setEnabled = value => form.setValue('notificationsEnabled', value, {shouldDirty: true, shouldValidate: true});
    return (0, r.jsxs)('div', {
      className: 'flex min-h-11 items-center justify-between gap-3 px-3 py-2',
      children: [
        (0, r.jsx)('span', {className: 'text-sm select-none', children: 'Notifications'}),
        (0, r.jsx)(bt, {'aria-label': 'Routine notifications', checked: enabled, onCheckedChange: setEnabled}),
      ],
    });
  };
/** Opens a session in the side panel, mini popup or tasks page. */
function nl() {
  const navigate = bn(),
    matchRoute = hs(),
    miniPopup = zr(),
    {accountId} = q(),
    userId = String(accountId);
  return (0, c.useCallback)(
    (sessionId, options) => {
      if (matchRoute({to: '/u/$userId/sidepanel', fuzzy: true}))
        return navigate({to: '/u/$userId/sidepanel', params: {userId}, search: {sessionId}, replace: options?.replace});
      if (matchRoute({to: '/u/$userId/minipopup', fuzzy: true}) && miniPopup) {
        miniPopup.navigate(sessionId);
        return;
      }
      return navigate({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId}, replace: options?.replace});
    },
    [miniPopup, matchRoute, navigate, userId],
  );
}
