/* Aux-owned source: the Appearance route and the Shortcuts page (assets/appearance-C03x8vQf.js;
 * exported as component and shortcuts). The keyboard shortcuts list was minified; the shortcut
 * profiles (import, export, reset) were already Aux source and keep their names.
 * Imports used here (the import statement above stays as supplied): browser-color-scheme T interop,
 * A React, _ JSX runtime; strip-markdown M useQueryClient, K useMutation, F Input; useQueries U;
 * use-shortcut-capture h/ee/j/W/I/Z/X/te the shortcut queries, writes, command list, help text,
 * read-only check and capture hook; platform Q isMac, B format; settings layout b/H/G/S/Y/$/V;
 * kbd w; button y; tooltip C/g/v; dist D toast; document-title J; pending-component L; icons k reset,
 * q arrow; appearance z the Appearance settings; chrome-link se. */
var React = T(A(), 1),
  jsxRuntime =
    _() /** Keyboard shortcuts: one row per command (the Mini popup chord comes from its own API), shortcut profiles, and extension shortcuts. */,
  KeyboardShortcuts = () => {
    const queryClient = M(),
      browserApi = typeof chrome > 'u' ? void 0 : chrome.auxBrowserPreferences,
      readOnly = X(browserApi),
      miniPopupApi = typeof chrome > 'u' ? void 0 : chrome.auxMiniPopup,
      miniPopupEditable =
        typeof miniPopupApi?.getShortcut == 'function' && typeof miniPopupApi.setShortcut == 'function',
      [shortcuts, miniPopupEnabled, miniPopupShortcut] = U({
        queries: [h, ee, {...j, enabled: !readOnly && miniPopupEditable}],
      }),
      update = K({
        mutationFn: async ({commandId: request, shortcut}) => (await W(browserApi, request, shortcut), h.queryFn()),
        onSuccess: updated => {
          (queryClient.setQueryData(h.queryKey, updated), queryClient.invalidateQueries({queryKey: j.queryKey}));
        },
        onError: error =>
          D.error('Couldn’t update shortcut', {
            description: (message => {
              const name = id => {
                  const command = Object.values(I).find(candidate => String(candidate.commandId) === id);
                  return command ? `“${command.title}”` : 'Another command';
                },
                pair = /^Shortcut conflict between commands (\d+) and (\d+)$/.exec(message);
              if (pair) return `${name(pair[1])} already uses these keys. Change it first, or choose other keys.`;
              const owner = /^Command (\d+) conflicts with (a macOS|a browser menu) shortcut$/.exec(message);
              return owner
                ? `${owner[2] === 'a macOS' ? 'macOS' : 'A menu item'} already uses these keys. Choose other keys.`
                : message;
            })(error.message),
          }),
      }),
      changeFor = commandId => shortcut => update.mutate({commandId, shortcut}),
      retry = () => {
        shortcuts.refetch();
      },
      renderRow = binding => {
        let shown = binding,
          editable = readOnly,
          disabled = update.isPending;
        if (
          binding.commandId === I.miniPopup.commandId &&
          (miniPopupEditable && (editable = true),
          (miniPopupEnabled.isLoading || miniPopupEnabled.data === false) && (disabled = true),
          !readOnly && (miniPopupShortcut.isFetching && (disabled = true), miniPopupShortcut.data))
        ) {
          const chord = B(miniPopupShortcut.data);
          shown = {...binding, shortcut: chord, isCustomized: chord !== binding.defaultShortcut};
        }
        return (0, jsxRuntime.jsx)(
          ShortcutRow,
          {shortcut: shown, editable, disabled, onChange: changeFor(binding.commandId)},
          binding.commandId,
        );
      },
      renderList = () =>
        shortcuts.isPending
          ? (0, jsxRuntime.jsx)(E, {})
          : shortcuts.isError
            ? (0, jsxRuntime.jsxs)('div', {
                role: 'alert',
                className: 'text-destructive text-sm',
                children: [
                  shortcuts.error.message,
                  (0, jsxRuntime.jsx)(y, {variant: 'ghost', size: 'sm', onClick: retry, children: 'Retry'}),
                ],
              })
            : (0, jsxRuntime.jsx)(S, {
                children: shortcuts.data
                  .filter(binding => binding.commandId !== 34132 && binding.commandId !== 34133)
                  .map(renderRow),
              });
    return (0, jsxRuntime.jsxs)($, {
      title: 'Keyboard shortcuts',
      children: [
        renderList(),
        (0, jsxRuntime.jsx)(AuxShortcutProfiles, {onUpdated: retry}),
        (0, jsxRuntime.jsx)(S, {
          children: (0, jsxRuntime.jsxs)(Y, {
            render: (0, jsxRuntime.jsx)(se, {className: 'group', to: 'chrome://extensions/shortcuts'}),
            children: [
              (0, jsxRuntime.jsx)(b, {
                title: 'Extension shortcuts',
                description: 'Manage shortcuts for Aux extensions',
              }),
              (0, jsxRuntime.jsx)(q, {className: 'text-muted-foreground mx-1 size-4'}),
            ],
          }),
        }),
      ],
    });
  } /** A shortcut row: its command, the keys (captured or fixed) and reset to the default. */,
  ShortcutRow = ({shortcut, editable, disabled, onChange}) => {
    const command = Object.values(I).find(candidate => candidate.commandId === shortcut.commandId),
      title = command?.title ?? 'Shortcut',
      reset = () => onChange();
    return (0, jsxRuntime.jsxs)(H, {
      children: [
        (0, jsxRuntime.jsx)(b, {title, description: command?.description}),
        (0, jsxRuntime.jsxs)(G, {
          className: 'max-w-none items-center gap-2',
          children: [
            editable
              ? (0, jsxRuntime.jsx)(ShortcutCapture, {title, shortcut, disabled, onChange})
              : (0, jsxRuntime.jsx)(FixedShortcut, {title, value: shortcut.shortcut, disabled}),
            (0, jsxRuntime.jsxs)(C, {
              children: [
                (0, jsxRuntime.jsx)(g, {
                  render: (0, jsxRuntime.jsx)(y, {
                    variant: 'ghost',
                    size: 'icon',
                    'aria-label': `Reset ${title} shortcut`,
                    disabled: !editable || disabled || !shortcut.isCustomized,
                    onClick: reset,
                  }),
                  children: (0, jsxRuntime.jsx)(k, {}),
                }),
                (0, jsxRuntime.jsxs)(v, {children: ['Reset to ', shortcut.defaultShortcut]}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** Records new keys while focused. */,
  ShortcutCapture = ({title, shortcut, disabled, onChange}) => {
    const {inputRef, isCapturing, placeholder, handleFocus, handleBlur, handleKeyDown} = te({
      isMacOS: Q(),
      onValueChange: onChange,
    });
    return (0, jsxRuntime.jsxs)('span', {
      className:
        'focus-within:ring-ring/50 relative inline-flex rounded-sm focus-within:ring-2 has-disabled:opacity-50',
      children: [
        (0, jsxRuntime.jsx)(w, {
          className: 'h-5.5 min-w-6 px-2 text-xs',
          children: isCapturing ? placeholder : shortcut.shortcut || 'Not set',
        }),
        (0, jsxRuntime.jsx)(F, {
          ref: inputRef,
          'aria-label': `${title} shortcut`,
          title: `Default: ${shortcut.defaultShortcut}`,
          readOnly: true,
          value: isCapturing ? '' : shortcut.shortcut,
          placeholder,
          className: 'absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:opacity-0',
          disabled,
          onFocus: handleFocus,
          onBlur: handleBlur,
          onKeyDown: handleKeyDown,
        }),
      ],
    });
  } /** A shortcut that cannot be changed here; clicking explains why. */,
  FixedShortcut = ({title, value, disabled}) => {
    const [open, setOpen] = (0, React.useState)(false),
      show = () => setOpen(true);
    return (0, jsxRuntime.jsxs)(C, {
      open,
      onOpenChange: setOpen,
      children: [
        (0, jsxRuntime.jsx)(g, {
          tabIndex: 0,
          closeOnClick: false,
          render: (0, jsxRuntime.jsx)('button', {
            type: 'button',
            'aria-label': `${title} shortcut`,
            'aria-disabled': 'true',
            className:
              'focus-visible:ring-ring/50 inline-flex rounded-sm outline-none focus-visible:ring-2 disabled:opacity-50',
            disabled,
          }),
          onClick: show,
          children: (0, jsxRuntime.jsx)(w, {className: 'h-5.5 min-w-6 px-2 text-xs', children: value}),
        }),
        (0, jsxRuntime.jsx)(v, {children: Z}),
      ],
    });
  }; /** The Appearance page. */
function we() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(J, {segments: ['Settings', 'Appearance']}),
      (0, jsxRuntime.jsx)(V, {children: (0, jsxRuntime.jsx)('h1', {children: 'Appearance'})}),
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(L, {}),
        children: (0, jsxRuntime.jsx)('div', {className: 'space-y-8', children: (0, jsxRuntime.jsx)(z, {})}),
      }),
    ],
  });
}
function parseAuxShortcutProfile(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 65536)
    throw Error('Choose an Aux shortcuts file smaller than 64 KiB.');
  const value = JSON.parse(text);
  if (
    !value ||
    Array.isArray(value) ||
    Object.keys(value).some(k => !['format', 'version', 'platform', 'mappings'].includes(k)) ||
    value.format !== 'aux-shortcuts' ||
    value.version !== 1 ||
    value.platform !== 'mac' ||
    !value.mappings ||
    Array.isArray(value.mappings) ||
    typeof value.mappings !== 'object' ||
    Object.keys(value.mappings).length > 128 ||
    Object.entries(value.mappings).some(
      ([id, chord]) => !/^[1-9]\d{0,5}$/.test(id) || id === '34069' || typeof chord !== 'string' || chord.length > 96,
    )
  )
    throw Error('This is not a supported Aux browser shortcuts file.');
  return value;
}
function createAuxShortcutProfileSession(api, onState, onError) {
  let state = null,
    owner = null,
    live = true,
    busy = false;
  function accept(value) {
    if (!value?.success) throw Error(value?.error || 'Shortcut settings are unavailable.');
    if (
      typeof value.ownerGeneration !== 'string' ||
      !value.ownerGeneration ||
      typeof value.revision !== 'string' ||
      !value.revision ||
      !Array.isArray(value.bindings)
    )
      throw Error('Invalid shortcut state.');
    if (owner !== null && owner !== value.ownerGeneration) {
      state = null;
      throw Error('Profile changed. Reopen shortcut settings.');
    }
    if (live) {
      owner = value.ownerGeneration;
      state = value;
      onState(value);
    }
    return value;
  }
  async function run(operation, mappings) {
    if (!live) throw Error('Shortcut settings were closed.');
    if (busy) throw Error('A shortcut operation is already in progress.');
    busy = true;
    try {
      if (operation === 'load') return accept(await api.getShortcutProfile());
      if (!state) throw Error('Reload shortcut settings before continuing.');
      if (operation === 'export') {
        const result = await api.exportShortcutProfile();
        if (!live) return null;
        if (!result?.success) throw Error(result?.error || 'Could not export shortcuts.');
        if (result.ownerGeneration !== owner || result.revision !== state.revision)
          throw Error('Shortcuts changed. Reload before exporting.');
        parseAuxShortcutProfile(JSON.stringify(result.configuration));
        return result.configuration;
      }
      const request = {ownerGeneration: owner, revision: state.revision, ...(operation === 'import' ? {mappings} : {})};
      const result = await (operation === 'import'
        ? api.importShortcutProfile(request)
        : api.resetShortcutProfile(request));
      if (!live) return null;
      if (!result?.success) {
        // Do not auto-adopt a conflicting revision for a second click. Explicit
        // Reload requires reviewing the prospective table again.
        state = null;
        throw Error(result?.error || 'Shortcuts were not changed.');
      }
      return accept(result);
    } catch (error) {
      if (live) onError(error.message);
      throw error;
    } finally {
      busy = false;
    }
  }
  return {
    load: () => run('load'),
    export: () => run('export'),
    apply: mappings => run('import', mappings),
    reset: () => run('reset'),
    close() {
      live = false;
      state = null;
    },
  };
}
function AuxShortcutProfiles({onUpdated}) {
  const el = React.createElement,
    [state, setState] = React.useState(null),
    [proposal, setProposal] = React.useState(null),
    [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState(''),
    [open, setOpen] = React.useState(false);
  const session = React.useRef(null),
    file = React.useRef(null),
    alive = React.useRef(false),
    selection = React.useRef(0);
  React.useEffect(() => {
    alive.current = true;
    const client = createAuxShortcutProfileSession(chrome.auxBrowserPreferences, setState, setError);
    session.current = client;
    client.load().catch(() => {});
    return () => {
      alive.current = false;
      selection.current++;
      client.close();
      session.current = null;
    };
  }, []);
  const action = async operation => {
    setBusy(true);
    setError('');
    try {
      await operation();
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const reload = () =>
    action(async () => {
      selection.current++;
      await session.current.load();
      if (alive.current) {
        setProposal(null);
        onUpdated();
      }
    });
  const exportFile = () =>
    action(async () => {
      const value = await session.current.export();
      if (!alive.current || !value) return;
      const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2) + '\n'], {type: 'application/json'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'aux-shortcuts.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });
  const pick = async event => {
    const chosen = event.target.files?.[0];
    event.target.value = '';
    if (!chosen) return;
    const token = ++selection.current;
    setError('');
    try {
      if (chosen.size > 65536) throw Error('Choose an Aux shortcuts file smaller than 64 KiB.');
      const parsed = parseAuxShortcutProfile(await chosen.text());
      if (!alive.current || selection.current !== token) return;
      const known = new Set(state?.bindings.map(x => String(x.commandId)) ?? []);
      if (Object.keys(parsed.mappings).some(id => !known.has(id)))
        throw Error('This file contains shortcuts unavailable in this build.');
      setProposal({kind: 'import', mappings: parsed.mappings});
      setOpen(true);
    } catch (e) {
      if (alive.current && selection.current === token) setError(e.message);
    }
  };
  const apply = () =>
    action(async () => {
      selection.current++;
      const result = await (proposal.kind === 'reset'
        ? session.current.reset()
        : session.current.apply(proposal.mappings));
      if (alive.current && result) {
        setProposal(null);
        setOpen(false);
        onUpdated();
      }
    });
  const rows =
    proposal &&
    state?.bindings
      .map(binding => ({
        ...binding,
        next:
          proposal.kind === 'reset'
            ? binding.defaultSerializedShortcut
            : (proposal.mappings[String(binding.commandId)] ?? binding.defaultSerializedShortcut),
      }))
      .filter(binding => binding.next !== binding.serializedShortcut);
  return el(
    S,
    null,
    el(
      H,
      null,
      el(b, {
        title: 'Browser shortcut profiles',
        description: 'Import, export or reset in-app shortcuts. The global Mini popup shortcut is managed separately.',
      }),
      el(
        G,
        {className: 'max-w-none items-center gap-2'},
        el(y, {variant: 'ghost', size: 'sm', disabled: busy || !state, onClick: exportFile}, 'Export'),
        el(y, {variant: 'ghost', size: 'sm', disabled: busy || !state, onClick: () => file.current?.click()}, 'Import'),
        el(
          y,
          {
            variant: 'ghost',
            size: 'sm',
            disabled: busy || !state,
            onClick: () => {
              selection.current++;
              setProposal({kind: 'reset'});
              setOpen(true);
              setError('');
            },
          },
          'Reset all',
        ),
      ),
    ),
    el('input', {ref: file, type: 'file', accept: '.json,application/json', hidden: true, onChange: pick}),
    error &&
      el(
        'div',
        {role: 'alert', className: 'text-destructive text-sm'},
        error,
        el(y, {variant: 'ghost', size: 'sm', disabled: busy, onClick: reload}, 'Reload'),
      ),
    open &&
      proposal &&
      el(
        React.Fragment,
        null,
        el(b, {
          title: proposal.kind === 'reset' ? 'Reset browser shortcuts?' : 'Review shortcut import',
          description: 'Only these in-app mappings change. Native conflicts are checked together before applying.',
        }),
        rows?.map(row =>
          el(
            H,
            {key: row.commandId},
            el(b, {
              title: Object.values(I).find(x => x.commandId === row.commandId)?.title ?? `Command ${row.commandId}`,
            }),
            el(
              G,
              {className: 'max-w-none items-center gap-2'},
              el(w, null, row.shortcut || 'Not set'),
              ' → ',
              el(w, null, row.next || 'Not set'),
            ),
          ),
        ),
        el(
          H,
          null,
          el(b, {title: rows?.length ? `${rows.length} shortcuts will change` : 'No changes'}),
          el(
            G,
            {className: 'max-w-none items-center gap-2'},
            el(
              y,
              {
                variant: 'ghost',
                size: 'sm',
                disabled: busy,
                onClick: () => {
                  selection.current++;
                  setOpen(false);
                  setProposal(null);
                },
              },
              'Cancel',
            ),
            el(
              y,
              {variant: 'secondary', size: 'sm', disabled: busy || !rows?.length, onClick: apply},
              busy ? 'Applying…' : 'Apply',
            ),
          ),
        ),
      ),
  );
}
function auxShortcutsPage() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(J, {segments: ['Settings', 'Shortcuts']}),
      (0, jsxRuntime.jsx)(V, {children: (0, jsxRuntime.jsx)('h1', {children: 'Shortcuts'})}),
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(L, {}),
        children: (0, jsxRuntime.jsx)('div', {
          className: 'space-y-8',
          children: (0, jsxRuntime.jsx)(KeyboardShortcuts, {}),
        }),
      }),
    ],
  });
}
