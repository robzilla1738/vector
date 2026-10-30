/* Aux-owned source, the browser importer (assets/use-browser-importer-GNOc7eYC.js, from React to the
 * end): the hook that lists what can be imported and starts an import, and its dialogs (grant
 * permission, choose a profile, upload a Safari export). The bundled useSuspenseQueries before it
 * (H) stays supplied.
 * Names the rest of the chunk uses keep their chunk names (both exported): fe useBrowserImporter,
 * he pickDefaultTarget; f React stays as named, the JSX runtime is jsxRuntime.
 * Chunk names used: B/K/R React and JSX runtime, _ useNavigate, q Spinner, E usePlatform, U/M/Z the
 * field parts, G useTRPC, h Button, b toast, Y/$ the completed-imports and sources queries, A
 * setPendingImport, z/Q the radio group, P/C/N/k/F/D/S the dialog parts, H useSuspenseQueries.
 * Aux changes: sources the browser lists as installed count as detected (the daemon's own list stops
 * at the browsers it knew), the Keychain explainer names the browser's real item and shows for
 * passwords as well as sign-ins, never for Firefox or Zen, and Safari's copy names the real menu. */
var f = B(K(), 1),
  GRANT_PERMISSION_IMAGE = '/assets/grant-permission-lDve06mu.webp',
  SAFARI_EXPORT_IMAGE = '/assets/safari-file-export-ClYcYuwR.webp',
  jsxRuntime = R(),
  /** useBrowserImporter: the import targets, starting an import, and the dialogs to render. */
  fe = () => {
    const [dialog, setDialog] = (0, f.useState)(null),
      resolveRef = (0, f.useRef)(null),
      trpc = G(),
      navigate = _(),
      {os} = E(),
      {sources, profilesByBrowser, completedKeys} = H({
        queries: [trpc.onboarding.detectBrowsers.queryOptions(), $, Y],
        combine: ([detected, sourceList, completed]) => {
          const sourcesById = new Map(sourceList.data?.map(source => [source.id, source])),
            profiles = new Map(
              detected.data?.flatMap(browser => {
                const match = Array.from(sourcesById.values()).find(item => item.name === browser.name);
                return match ? [[match.id, browser.profiles.map(profile => ({...profile, browser: match.id}))]] : [];
              }),
            );
          return {completedKeys: new Set(completed.data ?? []), profilesByBrowser: profiles, sources: sourcesById};
        },
      }),
      targets = (0, f.useMemo)(
        () => importTargets(sources, profilesByBrowser, completedKeys),
        [completedKeys, profilesByBrowser, sources],
      ),
      resolve = result => {
        (resolveRef.current?.(result), (resolveRef.current = null));
      },
      onOpenChange = open => {
        open || (setDialog(null), resolve('cancelled'));
      },
      proceed = request => {
        (A({
          sourceId: request.source.id,
          sourceName: request.source.name,
          dataKinds: request.dataKinds,
          destination: request.destination,
          sourceProfileId: request.sourceProfileId,
        }),
          resolve('completed'),
          setDialog(null),
          request.navigateToProgress &&
            navigate({to: '/onboarding/import-browser/progress', search: {browser: request.source.id}, replace: true}));
      };
    return {
      targets,
      importTarget: (target, options) =>
        new Promise(done => {
          if (target.alreadyImported && !options?.dataKinds) {
            (b.error('This browser profile has already been imported.'), done('cancelled'));
            return;
          }
          resolveRef.current = done;
          const navigateToProgress = options?.navigateToProgress ?? true;
          if (target.kind === 'file') {
            setDialog({
              type: 'safari-file-import',
              source: target.source,
              dataKinds: options?.dataKinds,
              navigateToProgress,
            });
            return;
          }
          const request = {
            type: 'grant-permission',
            source: target.source,
            dataKinds: options?.dataKinds,
            destination: options?.destination,
            sourceProfileId: target.kind === 'profile' ? target.profileId : void 0,
            navigateToProgress,
          };
          if (os === 'windows' || !needsKeychain(target.source, options?.dataKinds)) {
            proceed(request);
            return;
          }
          setDialog(request);
        }),
      dialogs: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsx)(GrantPermissionDialog, {dialog, onOpenChange, onProceed: proceed}),
          (0, jsxRuntime.jsx)(ProfileSelectDialog, {dialog, onDialogChange: setDialog, onOpenChange}),
          (0, jsxRuntime.jsx)(SafariImportDialog, {dialog, onOpenChange, onResolve: resolve}),
        ],
      }),
    };
  },
  /** Passwords and sign-ins are encrypted with a Keychain item; Firefox and Zen keep no such key. */
  needsKeychain = (source, dataKinds) =>
    !['firefox', 'zen'].includes(source.id) &&
    (!dataKinds || dataKinds.includes('cookies') || dataKinds.includes('passwords')),
  /** The Keychain item macOS names in its prompt. */
  safeStorage = ({id, name}) => (id === 'helium' ? 'Helium Storage Key' : `${name.replace(/^Google /, '')} Safe Storage`),
  /** The first detected target not yet imported, else any not yet imported, else the first. */
  he = targets =>
    targets.find(target => !target.alreadyImported && target.detected) ??
    targets.find(target => !target.alreadyImported) ??
    targets[0],
  /** What can be imported: a file for sources that need one, else each profile, or the source with no profiles. */
  importTargets = (sources, profilesByBrowser, completedKeys) =>
    Array.from(sources.values()).flatMap(source => {
      if (source.installed === false) return [];
      const profiles = profilesByBrowser.get(source.id) ?? [],
        detected = profilesByBrowser.has(source.id) || source.installed === true;
      if (source.requiresFileImport) {
        const lastUsedAt = profiles
          .map(profile => profile.lastUsedAt)
          .filter(Boolean)
          .sort()
          .at(-1);
        return [
          {
            kind: 'file',
            id: source.id,
            label: source.name,
            detected,
            alreadyImported: completedKeys.has(source.id),
            lastUsedAt,
            source,
            requiresFileImport: true,
          },
        ];
      }
      return source.profiles.length === 0
        ? [
            {
              kind: 'source',
              id: source.id,
              label: source.name,
              detected,
              alreadyImported: completedKeys.has(source.id),
              source,
              requiresFileImport: false,
            },
          ]
        : (profiles.length > 0 ? profiles : source.profiles.map(profile => ({...profile, browser: source.id}))).map(
            profile => {
              const id = `${source.id}:${profile.id}`;
              return {
                kind: 'profile',
                id,
                label: source.name,
                description: profile.name,
                detected,
                alreadyImported: completedKeys.has(id),
                lastUsedAt:
                  'lastUsedAt' in profile && typeof profile.lastUsedAt == 'string' ? profile.lastUsedAt : void 0,
                source,
                profileId: profile.id,
                requiresFileImport: false,
              };
            },
          );
    }),
  /** Explains the system prompt before reading browser data. */
  GrantPermissionDialog = ({dialog, onOpenChange, onProceed}) => {
    const storage = dialog?.source ? safeStorage(dialog.source) : 'Chrome Safe Storage',
      proceed = () => {
        dialog?.type === 'grant-permission' && onProceed(dialog);
      },
      onKeyDown = event => {
        event.key !== 'Enter' ||
          event.nativeEvent.isComposing ||
          (event.preventDefault(), event.stopPropagation(), proceed());
      };
    return (0, jsxRuntime.jsx)(S, {
      open: dialog?.type === 'grant-permission',
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(F, {
        className: 'w-130! max-w-none! gap-0',
        onKeyDownCapture: onKeyDown,
        children: [
          (0, jsxRuntime.jsxs)(k, {
            className: 'text-center',
            children: [
              (0, jsxRuntime.jsx)(D, {className: 'font-display text-xl', children: `macOS will ask about ${storage}`}),
              (0, jsxRuntime.jsxs)(C, {
                children: [
                  `macOS will ask to let Aux read ${storage}, so your passwords and sign-ins come over.`,
                  (0, jsxRuntime.jsx)('br', {}),
                  'Choose Always Allow.',
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('img', {
            src: GRANT_PERMISSION_IMAGE,
            className: 'pointer-events-none -my-2 h-60 select-none',
            alt: 'When the popup appears, click "Allow" to continue.',
          }),
          (0, jsxRuntime.jsxs)(P, {
            children: [
              (0, jsxRuntime.jsx)(N, {render: (0, jsxRuntime.jsx)(h, {variant: 'secondary'}), children: 'Cancel'}),
              (0, jsxRuntime.jsx)(h, {onClick: proceed, children: 'I understand'}),
            ],
          }),
        ],
      }),
    });
  },
  /** Chooses a browser profile. */
  ProfileSelectDialog = ({dialog, onDialogChange, onOpenChange}) => {
    const source = dialog?.type === 'profile-select' ? dialog.source : null,
      [selectedId, setSelectedId] = (0, f.useState)(''),
      next = () => {
        const profileId = selectedId || source?.profiles[0]?.id;
        dialog?.type !== 'profile-select' ||
          !source ||
          !profileId ||
          onDialogChange({
            type: 'grant-permission',
            source,
            dataKinds: dialog.dataKinds,
            sourceProfileId: profileId,
            navigateToProgress: dialog.navigateToProgress,
          });
      };
    return (0, jsxRuntime.jsx)(S, {
      open: dialog?.type === 'profile-select',
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(F, {
        className: 'w-130! max-w-none!',
        children: [
          (0, jsxRuntime.jsxs)(k, {
            children: [
              (0, jsxRuntime.jsx)(D, {className: 'font-display text-xl', children: 'Choose a profile'}),
              (0, jsxRuntime.jsxs)(C, {
                children: ['Select the ', source?.name ?? 'browser', ' profile you want to import.'],
              }),
            ],
          }),
          source &&
            (0, jsxRuntime.jsx)('div', {
              className: '-mx-2',
              children: (0, jsxRuntime.jsx)(Q, {
                className:
                  'bg-border space-y-hairline border-hairline block max-h-96 gap-0 overflow-auto rounded-xl dark:space-y-px dark:border-transparent dark:bg-transparent',
                value: selectedId || source.profiles[0]?.id,
                onValueChange: setSelectedId,
                children: source.profiles.map((profile, index) => {
                  const inputId = `browser-profile-${index}`;
                  return (0, jsxRuntime.jsx)(
                    U,
                    {
                      htmlFor: inputId,
                      className: 'bg-surface-primary! rounded-none! border-none!',
                      children: (0, jsxRuntime.jsxs)(M, {
                        className: 'relative flex min-h-12 w-full flex-row items-center gap-3 px-3 py-2.5',
                        children: [
                          (0, jsxRuntime.jsx)(z, {className: 'w-auto!', value: profile.id, id: inputId}),
                          (0, jsxRuntime.jsx)(Z, {
                            className: 'font-display text-primary truncate text-sm',
                            children: profile.name,
                          }),
                        ],
                      }),
                    },
                    profile.id,
                  );
                }),
              }),
            }),
          (0, jsxRuntime.jsxs)(P, {
            children: [
              (0, jsxRuntime.jsx)(N, {render: (0, jsxRuntime.jsx)(h, {variant: 'secondary'}), children: 'Cancel'}),
              (0, jsxRuntime.jsx)(h, {
                disabled: !selectedId && !source?.profiles[0]?.id,
                onClick: next,
                children: 'Continue',
              }),
            ],
          }),
        ],
      }),
    });
  },
  /** Asks for Safari's exported ZIP and reads it. */
  SafariImportDialog = ({dialog, onOpenChange, onResolve}) => {
    const inputRef = (0, f.useRef)(null),
      [isReading, setReading] = (0, f.useState)(false),
      navigate = _(),
      onFileChange = async event => {
        const file = event.target.files?.[0];
        if (file) {
          if (!file.name.endsWith('.zip')) {
            b.error('Please upload a ZIP file');
            return;
          }
          if (dialog?.type === 'safari-file-import')
            try {
              if (
                (setReading(true),
                A({
                  sourceId: dialog.source.id,
                  sourceName: dialog.source.name,
                  dataKinds: dialog.dataKinds,
                  safariArchive: {fileName: file.name, data: await file.arrayBuffer()},
                }),
                onResolve('completed'),
                dialog.navigateToProgress)
              ) {
                await navigate({
                  to: '/onboarding/import-browser/progress',
                  search: {browser: dialog.source.id},
                  replace: true,
                });
                return;
              }
              (setReading(false), onOpenChange(false));
            } catch (error) {
              (console.error(error), b.error('Failed to read the ZIP file'), setReading(false));
            }
        }
      },
      chooseFile = () => {
        inputRef.current?.click();
      };
    return (0, jsxRuntime.jsx)(S, {
      open: dialog?.type === 'safari-file-import',
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(F, {
        className: 'w-130! max-w-none!',
        children: [
          (0, jsxRuntime.jsxs)(k, {
            children: [
              (0, jsxRuntime.jsx)(D, {className: 'font-display text-xl', children: 'Export your Safari data first'}),
              (0, jsxRuntime.jsxs)(C, {
                children: [
                  'In Safari, choose ',
                  (0, jsxRuntime.jsx)('span', {children: 'File › Export Browsing Data to File…'}),
                  ', then import the ZIP file Safari creates.',
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('div', {
            className: '-mx-1 mt-1 overflow-hidden rounded-lg',
            children: (0, jsxRuntime.jsx)('img', {
              src: SAFARI_EXPORT_IMAGE,
              className: 'pointer-events-none w-full select-none',
              alt: 'In Safari, choose File › Export Browsing Data to File…, then import the ZIP file Safari creates.',
            }),
          }),
          (0, jsxRuntime.jsxs)(P, {
            children: [
              (0, jsxRuntime.jsx)(N, {render: (0, jsxRuntime.jsx)(h, {variant: 'secondary'}), children: 'Cancel'}),
              (0, jsxRuntime.jsxs)(h, {
                disabled: isReading,
                onClick: chooseFile,
                children: [isReading && (0, jsxRuntime.jsx)(q, {}), 'Upload file'],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('input', {
            ref: inputRef,
            'aria-label': 'Safari browsing data ZIP file',
            className: 'sr-only',
            type: 'file',
            accept: '.zip',
            onChange: onFileChange,
          }),
        ],
      }),
    });
  };
