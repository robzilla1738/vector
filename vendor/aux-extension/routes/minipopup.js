/* Aux-owned source: the mini popup (assets/minipopup-LkDLFvnq.js, Rs exported as component), the
 * small agent window opened from anywhere. A new session shows only the composer and grows with the
 * draft; an open session shows its header, conversation and reply composer. The Aux names (aux*)
 * come from the agent integration that runs before this block (vendor/provided/agent).
 * Imports used here (the import statement above stays as supplied): browser-color-scheme ne JSX
 * runtime, B interop, ee React, se react-dom, g cn; strip-markdown K useApp, re useQuery, xe
 * useAnchoredLayer, ye mention list, ce/te/ge/le/ke/Ae menu icons, C/T/v/b/q/H/oe menu item, radio
 * item, group, label, separator, radio group, checkbox item, O/z/F menu root, trigger, content;
 * queries ie useTRPC; session-composer: Pe useNewSessionComposer, we SessionProvider, G Composer,
 * U ComposerBody, fe Editor, pe attachments, M ModeSlot, W useComposer, je ModelSelect, de SendButton,
 * he Conversation, Ce ModeProvider, me useRunCommand, De SessionRoot, ue window-focus events, L/R
 * pickers and child windows; permission-approval ve/Me/be ask, confirm, approval, Ne/Se permission
 * modes; use-default-permission-mode Ie setDefaultFinalConfirm; provider Ee composer extensions;
 * tooltip N/w/S/Oe Tooltip, TooltipTrigger, TooltipContent, createTooltipHandle; browser-binding f
 * the mini popup's native API; context $ useSession; switch A; kbd Re; simple-tooltip Ve; Ke
 * SessionTitle; qe back button; Fe extension page URL; ze shortcut label; Be attention reporter;
 * Le accept list; _ project icon; cross-medium _e; key Ae; projects He; turn-fold Te.
 * Aux change: the session composer card takes the 12px scale corner (rounded-xl) instead of a
 * fixed 16px. */
var jsxRuntime = ne(),
  OpenInBrowserIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsxs)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: [
        (0, jsxRuntime.jsx)('path', {
          d: 'M9 13C10.6569 13 12 14.3431 12 16V19C12 20.6569 10.6569 22 9 22H5C3.34315 22 2 20.6569 2 19V16C2 14.3431 3.34315 13 5 13H9Z',
          fill: 'currentColor',
        }),
        (0, jsxRuntime.jsx)('path', {
          d: 'M20 7C20 5.89543 19.1046 5 18 5H7C5.89543 5 5 5.89543 5 7V10C5 10.5523 4.55228 11 4 11C3.44772 11 3 10.5523 3 10V7C3 4.79086 4.79086 3 7 3H18C20.2091 3 22 4.79086 22 7V12C22 14.2091 20.2091 16 18 16H15C14.4477 16 14 15.5523 14 15C14 14.4477 14.4477 14 15 14H18C19.1046 14 20 13.1046 20 12V7Z',
          fill: 'currentColor',
        }),
        (0, jsxRuntime.jsx)('path', {
          d: 'M17 7C17.5523 7 18 7.44772 18 8V11C18 11.5523 17.5523 12 17 12C16.4477 12 16 11.5523 16 11V10.4142L14.7071 11.7071C14.3166 12.0976 13.6834 12.0976 13.2929 11.7071C12.9024 11.3166 12.9024 10.6834 13.2929 10.2929L14.5858 9H14C13.4477 9 13 8.55228 13 8C13 7.44772 13.4477 7 14 7H17Z',
          fill: 'currentColor',
        }),
      ],
    }),
  BrowserProfileIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M16 14C18.7614 14 21 16.2386 21 19V20C21 20.5523 20.5523 21 20 21C19.4477 21 19 20.5523 19 20V19C19 17.3432 17.6568 16 16 16H8C6.34315 16 5 17.3432 5 19V20C5 20.5523 4.55228 21 4 21C3.44772 21 3 20.5523 3 20V19C3 16.2386 5.23857 14 8 14H16ZM12 2C15.0376 2 17.5 4.46244 17.5 7.5C17.5 10.5376 15.0376 13 12 13C8.96244 13 6.5 10.5376 6.5 7.5C6.5 4.46244 8.96244 2 12 2ZM12 4C10.067 4 8.5 5.567 8.5 7.5C8.5 9.433 10.067 11 12 11C13.933 11 15.5 9.433 15.5 7.5C15.5 5.567 13.933 4 12 4Z',
        fill: 'currentColor',
      }),
    }),
  React = B(ee(), 1),
  ReactDOM = B(se(), 1),
  MENTION_MENU_WIDTH = 360,
  MENTION_MENU_MAX_HEIGHT = 240 /** The @ mention menu, sized to its items and anchored to the caret in its own layer. */,
  MentionMenu = ({items = [], ...props}) => {
    const groupCount = new Set(items.map(item => item.groupLabel)).size,
      height = Math.min(
        MENTION_MENU_MAX_HEIGHT,
        Math.max(56, 12 + items.length * 32 + groupCount * 24 + Math.max(0, groupCount - 1) * 8),
      ),
      open = !!(items.length || props.error),
      layer = xe({
        anchor: props.anchor,
        focus: false,
        onDismiss: props.onDismiss,
        open,
        optionsSize: {width: MENTION_MENU_WIDTH, height},
      });
    return layer ? (0, ReactDOM.createPortal)((0, jsxRuntime.jsx)(ye, {...props, items}), layer.container) : null;
  } /** The + menu: incognito, photos and files, a folder. */,
  AttachMenu = ({tooltip, mode, onModeChange}) => {
    const {disabled, fileInputRef, isStreaming, handleDirectories, handleFiles} = W(),
      [open, setOpen] = (0, React.useState)(false),
      canSwitchMode = !!(mode && onModeChange),
      close = () => {
        setOpen(false);
      },
      setIncognito = enabled => {
        onModeChange?.(enabled ? 'incognito' : 'default');
      },
      pickFiles = event => {
        const input = event.currentTarget;
        L(
          new Promise(resolve => {
            (input.addEventListener('change', () => resolve(Array.from(input.files ?? [])), {once: true}),
              input.addEventListener('cancel', () => resolve([]), {once: true}),
              input.ownerDocument.defaultView?.addEventListener('pagehide', () => resolve([]), {once: true}));
          }).then(handleFiles),
        ).then(close);
      },
      attachFolder = async () => {
        try {
          const directory = await L(f.pickDirectory());
          directory && handleDirectories([directory]);
        } catch (error) {
          (Z.error(error instanceof Error ? error.message : 'There was an error opening the folder picker.'),
            console.error(error));
        } finally {
          close();
        }
      };
    return (0, jsxRuntime.jsxs)(O, {
      optionsSize: {width: 240, maxHeight: 108},
      open,
      onOpenChange: setOpen,
      children: [
        (0, jsxRuntime.jsx)(w, {
          handle: tooltip,
          payload: 'Attach files, incognito, and more',
          render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex min-w-0'}),
          children: (0, jsxRuntime.jsx)(z, {
            render: (0, jsxRuntime.jsx)(I, {
              'aria-label': 'Add attachment',
              className: 'text-muted-foreground size-7',
              'data-testid': 'attachments-button',
              disabled,
              shape: 'pill',
              size: 'icon-xs',
              variant: 'ghost',
            }),
            children: (0, jsxRuntime.jsx)(Te, {className: 'size-4'}),
          }),
        }),
        (0, jsxRuntime.jsxs)(F, {
          size: 'sm',
          className: 'w-60',
          children: [
            (0, jsxRuntime.jsxs)(N, {
              onOpenChange: (nextOpen, details) => {
                nextOpen && details.reason === 'trigger-focus' && details.cancel();
              },
              children: [
                (0, jsxRuntime.jsxs)(w, {
                  render: (0, jsxRuntime.jsx)(C, {closeOnClick: false, disabled: isStreaming || !canSwitchMode}),
                  children: [
                    (0, jsxRuntime.jsx)(ge, {className: 'text-muted-foreground'}),
                    (0, jsxRuntime.jsx)('span', {className: 'grow', children: 'Incognito mode'}),
                    (0, jsxRuntime.jsx)(A, {
                      checked: mode === 'incognito',
                      disabled: isStreaming || !canSwitchMode,
                      onCheckedChange: setIncognito,
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)(S, {
                  align: 'start',
                  className: 'w-[calc(100vw-0.625rem)] text-pretty',
                  side: 'bottom',
                  children: (0, jsxRuntime.jsx)('p', {
                    children: 'If enabled, browsing history and memory will not be used.',
                  }),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(C, {
              closeOnClick: false,
              render: (0, jsxRuntime.jsx)('label', {}),
              children: [
                (0, jsxRuntime.jsx)('input', {
                  accept: Le,
                  className: 'hidden',
                  disabled,
                  multiple: true,
                  onClick: pickFiles,
                  ref: fileInputRef,
                  type: 'file',
                }),
                (0, jsxRuntime.jsx)(ce, {className: 'text-muted-foreground'}),
                (0, jsxRuntime.jsx)('span', {children: 'Upload photos & file'}),
              ],
            }),
            (0, jsxRuntime.jsxs)(C, {
              closeOnClick: false,
              onClick: attachFolder,
              children: [
                (0, jsxRuntime.jsx)(te, {className: 'text-muted-foreground'}),
                (0, jsxRuntime.jsx)('span', {children: 'Attach folder'}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** Permission modes, Final confirm, and the hidden developer rows. */,
  PermissionMenuItems = ({
    value,
    finalConfirm,
    memoryExtractionDisabled,
    onValueChange,
    onFinalConfirmChange,
    onMemoryExtractionDisabledChange,
  }) => {
    const readOnly = value === 'read-only',
      finalConfirmOn = !readOnly && finalConfirm,
      setFinalConfirm = (enabled, force = false) => {
        (!force && readOnly && enabled) || (Ie(enabled), onFinalConfirmChange(enabled));
      },
      setPermission = value => {
        const mode = value;
        (mode === 'guard' && setFinalConfirm(true, true),
          mode === 'read-only' && setFinalConfirm(false, true),
          onValueChange(mode));
      },
      stopPropagation = event => {
        event.stopPropagation();
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(v, {
          children: [
            (0, jsxRuntime.jsx)(b, {children: 'Permission'}),
            (0, jsxRuntime.jsx)(H, {
              value,
              onValueChange: setPermission,
              children: Ne.map(mode => {
                const option = Se[mode];
                return (0, jsxRuntime.jsxs)(
                  N,
                  {
                    children: [
                      (0, jsxRuntime.jsx)(w, {
                        render: (0, jsxRuntime.jsxs)(T, {
                          value: mode,
                          children: [
                            (0, jsxRuntime.jsx)(option.icon, {className: 'text-muted-foreground'}),
                            (0, jsxRuntime.jsx)('span', {children: option.label}),
                          ],
                        }),
                      }),
                      (0, jsxRuntime.jsx)(S, {
                        align: 'start',
                        className: 'w-[calc(100vw-0.625rem)] text-pretty',
                        side: 'bottom',
                        children: option.description,
                      }),
                    ],
                  },
                  mode,
                );
              }),
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(q, {}),
        (0, jsxRuntime.jsxs)(N, {
          children: [
            (0, jsxRuntime.jsxs)(w, {
              render: (0, jsxRuntime.jsx)(C, {
                'aria-disabled': readOnly,
                className: g(readOnly && 'opacity-50'),
                closeOnClick: false,
              }),
              children: [
                (0, jsxRuntime.jsx)(ke, {className: 'text-muted-foreground'}),
                (0, jsxRuntime.jsx)('span', {className: 'grow whitespace-nowrap', children: 'Final confirm'}),
                (0, jsxRuntime.jsx)('span', {
                  onClick: stopPropagation,
                  children: (0, jsxRuntime.jsx)(A, {
                    checked: finalConfirmOn,
                    disabled: readOnly,
                    onCheckedChange: setFinalConfirm,
                  }),
                }),
              ],
            }),
            (0, jsxRuntime.jsx)(S, {
              align: 'start',
              className: 'w-[calc(100vw-0.625rem)] text-pretty',
              side: 'bottom',
              children: readOnly
                ? 'Read only cannot take actions, so Final confirm is off.'
                : 'Ask before actions like send, pay, delete, or submit.',
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)(v, {
          className: g('hidden'),
          children: [
            (0, jsxRuntime.jsx)(b, {children: 'Developer'}),
            (0, jsxRuntime.jsxs)(C, {
              closeOnClick: false,
              children: [
                (0, jsxRuntime.jsx)(le, {className: 'text-muted-foreground'}),
                (0, jsxRuntime.jsx)('span', {
                  className: 'grow whitespace-nowrap',
                  children: 'Disable memory extraction',
                }),
                (0, jsxRuntime.jsx)(A, {
                  checked: memoryExtractionDisabled,
                  onCheckedChange: onMemoryExtractionDisabledChange,
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(oe, {
              checked: true,
              disabled: true,
              children: [
                (0, jsxRuntime.jsx)(Ae, {className: 'text-muted-foreground'}),
                (0, jsxRuntime.jsx)('span', {children: 'Password access'}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** Switch the browser profile; shown only with two or more profiles. */,
  BrowserProfileMenu = ({tooltip}) => {
    const [open, setOpen] = (0, React.useState)(false),
      [profiles, setProfiles] = (0, React.useState)([]),
      current = profiles.find(profile => profile.isCurrent),
      selectProfile = value => {
        const index = Number(value);
        Number.isInteger(index) &&
          (setOpen(false),
          index !== current?.profileIndex &&
            f
              .selectProfile(index)
              .catch(error => Z.error(error instanceof Error ? error.message : 'Failed to select profile')));
      };
    return (
      (0, React.useEffect)(() => {
        f.getProfiles().then(setProfiles).catch(console.error);
      }, []),
      profiles.length < 2
        ? null
        : (0, jsxRuntime.jsxs)(O, {
            open,
            optionsSize: {width: 224, maxHeight: 420},
            onOpenChange: setOpen,
            children: [
              (0, jsxRuntime.jsx)(w, {
                handle: tooltip,
                payload: 'Switch browser profile',
                render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex min-w-0'}),
                children: (0, jsxRuntime.jsx)(z, {
                  render: (0, jsxRuntime.jsx)(I, {
                    'aria-label': 'Browser profile',
                    className: 'text-muted-foreground size-7',
                    shape: 'pill',
                    size: 'icon-xs',
                    variant: 'ghost',
                  }),
                  children: (0, jsxRuntime.jsx)(BrowserProfileIcon, {className: 'size-4'}),
                }),
              }),
              (0, jsxRuntime.jsx)(F, {
                className: 'w-56',
                size: 'sm',
                children: (0, jsxRuntime.jsxs)(v, {
                  children: [
                    (0, jsxRuntime.jsx)(b, {children: 'Browser profile'}),
                    (0, jsxRuntime.jsx)(H, {
                      value: String(current?.profileIndex ?? ''),
                      onValueChange: selectProfile,
                      children: profiles.map(profile =>
                        (0, jsxRuntime.jsx)(
                          T,
                          {
                            disabled: profile.isLocked,
                            value: String(profile.profileIndex),
                            children: (0, jsxRuntime.jsx)('span', {className: 'truncate', children: profile.name}),
                          },
                          profile.profileIndex,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
            ],
          })
    );
  },
  ProjectSelectorContext = (0, React.createContext)(
    null,
  ) /** The project choice for a new session (archived projects are hidden). */,
  ProjectSelectorProvider = ({children, value, onValueChange}) => {
    const {accountId} = K(),
      trpc = ie(),
      {data: allProjects = []} = re(trpc.projects.list.queryOptions({accountId})),
      projects = allProjects.filter(project => !project.archivedAt),
      selectedProject = projects.find(project => project.id === value) ?? null,
      context = (0, React.useMemo)(
        () => ({
          state: {projects, selectedProject, value},
          actions: {select: id => onValueChange?.(id === value ? null : id)},
          meta: {canEdit: !!onValueChange},
        }),
        [onValueChange, projects, selectedProject, value],
      );
    return (0, jsxRuntime.jsx)(ProjectSelectorContext, {value: context, children});
  } /** The projects and permissions menu button, showing the chosen project. */,
  ProjectsAndPermissionsMenu = ({children, tooltip}) => {
    const {state} = useProjectSelector(),
      {selectedProject} = state;
    return (0, jsxRuntime.jsxs)(O, {
      optionsSize: {width: 288, maxHeight: 420},
      children: [
        (0, jsxRuntime.jsx)(w, {
          handle: tooltip,
          payload: 'Projects & permissions',
          render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex min-w-0'}),
          children: (0, jsxRuntime.jsx)(z, {
            render: (0, jsxRuntime.jsx)(I, {
              'aria-label': selectedProject ? `${selectedProject.name}, permissions` : 'Projects & permissions',
              className: g('text-muted-foreground min-[560px]:gap-1 min-[560px]:px-2'),
              shape: 'pill',
              size: selectedProject ? 'sm' : 'icon-sm',
              variant: 'ghost',
            }),
            children: selectedProject
              ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    (0, jsxRuntime.jsx)(_, {
                      className: 'size-4',
                      color: selectedProject.color,
                      icon: selectedProject.icon,
                    }),
                    (0, jsxRuntime.jsx)('span', {
                      className: 'max-w-24 min-w-0 truncate min-[560px]:inline',
                      children: selectedProject.name,
                    }),
                  ],
                })
              : (0, jsxRuntime.jsx)(He, {className: 'size-4'}),
          }),
        }),
        (0, jsxRuntime.jsx)(F, {className: 'w-72', size: 'sm', children}),
      ],
    });
  },
  ProjectMenuItems = () => {
    const {state, actions, meta} = useProjectSelector(),
      {projects, selectedProject, value} = state,
      deselectOnRepeat = id => () => {
        id === value && actions.select(id);
      };
    return (meta.canEdit ? projects.length === 0 : !selectedProject)
      ? null
      : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            (0, jsxRuntime.jsxs)(v, {
              children: [
                (0, jsxRuntime.jsx)(b, {children: 'Projects'}),
                meta.canEdit
                  ? (0, jsxRuntime.jsx)(H, {
                      value: value ?? '',
                      onValueChange: actions.select,
                      children: projects.map(project =>
                        (0, jsxRuntime.jsxs)(
                          T,
                          {
                            closeOnClick: false,
                            onClick: deselectOnRepeat(project.id),
                            value: project.id,
                            children: [
                              (0, jsxRuntime.jsx)(_, {className: 'size-4', color: project.color, icon: project.icon}),
                              (0, jsxRuntime.jsx)('span', {className: 'truncate', children: project.name}),
                            ],
                          },
                          project.id,
                        ),
                      ),
                    })
                  : selectedProject &&
                    (0, jsxRuntime.jsxs)(C, {
                      disabled: true,
                      children: [
                        (0, jsxRuntime.jsx)(_, {
                          className: 'size-4',
                          color: selectedProject.color,
                          icon: selectedProject.icon,
                        }),
                        (0, jsxRuntime.jsx)('span', {className: 'truncate', children: selectedProject.name}),
                      ],
                    }),
              ],
            }),
            (0, jsxRuntime.jsx)(q, {}),
          ],
        });
  },
  useProjectSelector = () => {
    const context = (0, React.use)(ProjectSelectorContext);
    if (!context) throw new Error('MiniPopupProjectSelectorList must be used within MiniPopupProjectSelectorProvider');
    return context;
  } /** The toolbar under the input: attach, projects and permissions, profile, model, and send. */,
  ComposerToolbar = ({draft}) => {
    const {currentSession, updatePermissionMode, updateRuntimeConfig} = $(),
      mode = draft?.resolvedMode ?? (currentSession.incognito ? 'incognito' : 'default'),
      runtimeConfig = draft?.draftRuntimeConfig ?? currentSession.runtimeConfig,
      setFinalConfirm = enabled => {
        if (draft?.handleDraftFinalConfirmChange) {
          draft.handleDraftFinalConfirmChange(enabled);
          return;
        }
        updateRuntimeConfig({finalConfirm: enabled});
      },
      setMemoryExtractionDisabled = disabled => {
        if (draft?.handleDraftMemoryExtractionDisabledChange) {
          draft.handleDraftMemoryExtractionDisabledChange(disabled);
          return;
        }
        updateRuntimeConfig({memoryExtractionDisabled: disabled});
      },
      setPermissionMode = draft?.handleDraftPermissionModeChange ?? updatePermissionMode,
      [tooltip] = (0, React.useState)(() => Oe());
    return (0, jsxRuntime.jsxs)('div', {
      className: g('flex h-9 w-full items-center justify-between gap-1', !draft && 'px-1'),
      'data-slot': 'mini-popup-composer-toolbar',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex min-w-0 items-center',
          children: [
            (0, jsxRuntime.jsx)(AttachMenu, {
              tooltip,
              mode,
              onModeChange: draft?.isModeForced ? void 0 : draft?.handleDraftModeChange,
            }),
            (0, jsxRuntime.jsx)(ProjectSelectorProvider, {
              value: draft?.draftProjectId ?? currentSession.projectId,
              onValueChange: draft?.handleDraftProjectIdChange,
              children: (0, jsxRuntime.jsxs)(ProjectsAndPermissionsMenu, {
                tooltip,
                children: [
                  mode !== 'incognito' && (0, jsxRuntime.jsx)(ProjectMenuItems, {}),
                  (0, jsxRuntime.jsx)(PermissionMenuItems, {
                    finalConfirm: runtimeConfig.finalConfirm ?? false,
                    memoryExtractionDisabled: runtimeConfig.memoryExtractionDisabled ?? false,
                    value: draft?.draftPermissionMode ?? currentSession.permissionMode,
                    onFinalConfirmChange: setFinalConfirm,
                    onMemoryExtractionDisabledChange: setMemoryExtractionDisabled,
                    onValueChange: setPermissionMode,
                  }),
                ],
              }),
            }),
            draft && (0, jsxRuntime.jsx)(BrowserProfileMenu, {tooltip}),
            (0, jsxRuntime.jsx)(N, {
              handle: tooltip,
              children: ({payload}) => (0, jsxRuntime.jsx)(S, {travel: true, children: payload}),
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex shrink-0 items-center',
          children: [
            (0, jsxRuntime.jsx)(je, {
              variant: 'mini-popup',
              proactiveMode: draft?.draftRuntimeConfig.proactiveMode,
              value: draft?.draftModel,
              onValueChange: draft?.handleDraftModelChange,
            }),
            (0, jsxRuntime.jsx)(de, {className: 'bg-foreground text-background ml-0.5'}),
          ],
        }),
      ],
    });
  },
  COMPOSER_HEIGHT = 92,
  COMPOSER_HEIGHT_WITH_ATTACHMENTS = 148,
  COMPOSER_MAX_HEIGHT = 320,
  auxMiniDraftOwners =
    new Map() /** The new-session draft per account, saved unless private, with a migration owner for the draft store. */,
  auxGetMiniDraft = accountId => {
    let owner = auxMiniDraftOwners.get(accountId);
    if (owner) return owner;
    const scope = 'mini-popup-account:' + accountId + ':new',
      privateContext = typeof chrome !== 'undefined' && chrome.extension?.inIncognitoContext === true,
      unload = e => {
        (e.preventDefault(), (e.returnValue = ''));
      };
    owner = {
      record: privateContext ? null : auxReadMiniDraft(void 0, scope),
      mode: 'default',
      set(record) {
        auxDraftMigrationChanged();
        owner.record = record;
        const saved = privateContext || owner.mode === 'incognito' || auxWriteMiniDraft(void 0, record, scope) === true;
        if (
          !saved ||
          ((privateContext || owner.mode === 'incognito') && (record?.plainText?.length || record?.attachments?.length))
        )
          window.addEventListener('beforeunload', unload);
        else window.removeEventListener('beforeunload', unload);
        return saved;
      },
      setMode(mode) {
        if (mode !== 'default' && mode !== 'incognito') return false;
        if (mode === 'incognito' && !privateContext && auxWriteMiniDraft(void 0, null, scope) !== true) {
          Z.error('Could not remove the saved draft. Keep this window open and try again before entering incognito.');
          return false;
        }
        owner.mode = mode;
        owner.set(owner.record) || Z.error('Could not save this draft. Keep this window open and try again.');
        return true;
      },
    };
    auxMiniDraftOwners.set(accountId, owner);
    auxRegisterDraftMigrationOwner('mini', {
      inspect: () => {
        if (
          (privateContext || owner.mode === 'incognito') &&
          (owner.record?.plainText?.length || owner.record?.attachments?.length)
        )
          throw Error('A private Mini draft must remain in its current view');
        return {scope, mode: owner.mode, record: owner.record};
      },
      flush: () => owner.set(owner.record),
      freeze: () => () => {},
    });
    return owner;
  },
  auxNewSessionComposer = auxProps => {
    const {accountId} = K();
    return Number.isSafeInteger(accountId) && accountId >= 0
      ? (0, jsxRuntime.jsx)(auxMiniComposer, {...auxProps, auxAccountId: accountId}, accountId)
      : null;
  } /** A new session: the draft composer; the popup closes when it loses focus (unless a child window has it). */,
  auxMiniComposer = ({onHeightChange, onSessionChange, auxAccountId}) => {
    const auxDraft = auxGetMiniDraft(auxAccountId);
    const handleSessionChange = (0, React.useCallback)(
        sessionId => {
          (auxDraft.set(null) || Z.error('Could not clear the saved draft. Keep this window open and try again.'),
            onSessionChange(sessionId));
        },
        [onSessionChange],
      ),
      composer = Pe({
        onSessionChange: handleSessionChange,
        source: 'mini-popup',
        defaultDraftState: {draftMode: auxDraft.mode},
      }),
      onDraftRecordChange = (0, React.useCallback)(record => auxDraft.set(record), []),
      draftPersistence = (0, React.useMemo)(
        () => ({defaultDraftRecord: auxDraft.record, onDraftRecordChange}),
        [onDraftRecordChange],
      );
    return (
      (0, React.useEffect)(() => {
        if (composer.isInputDisabled) return;
        const closeOnBlur = () => {
          R.size || f.requestClose();
        };
        let timer;
        const unsubscribe = ue(state => {
          (window.clearTimeout(timer),
            state !== 'opened' &&
              (timer = window.setTimeout(() => {
                const windows = [...R];
                if (!(document.hasFocus() || windows.some(popup => !popup.closed && popup.document.hasFocus()))) {
                  for (const popup of windows) popup.close();
                  f.requestClose();
                }
              }, 150)));
        });
        return (
          window.addEventListener('blur', closeOnBlur),
          () => {
            (window.clearTimeout(timer), unsubscribe(), window.removeEventListener('blur', closeOnBlur));
          }
        );
      }, [composer.isInputDisabled]),
      (0, jsxRuntime.jsx)('div', {
        className:
          'flex h-screen w-screen flex-col **:data-chat-input-form:mb-0 **:data-chat-input-form:h-full **:data-chat-input-form:w-full [&_form]:flex [&_form]:h-full [&_form]:w-full [&_form]:flex-col',
        children: (0, jsxRuntime.jsx)(we, {
          session: {
            disabled: composer.isInputDisabled,
            submitDisabled: composer.isSubmitDisabled,
            isCreatingSession: composer.createSessionMutation.isPending,
            sendMessage: composer.handleCreateAndSend,
            notice: composer.notice,
          },
          children: (0, jsxRuntime.jsx)(G, {
            className: 'flex h-full w-full flex-col p-1.5 py-1 pb-0.5',
            draftPersistence,
            children: (0, jsxRuntime.jsx)(ComposerFrame, {
              draft: {
                ...composer,
                handleDraftModeChange: mode => {
                  auxDraft.setMode(mode) && composer.handleDraftModeChange(mode);
                },
              },
              fill: true,
              children: (0, jsxRuntime.jsx)(U, {
                className: 'min-h-0 flex-1 rounded-none bg-transparent shadow-none ring-0 focus-within:shadow-none',
                children: (0, jsxRuntime.jsx)(ComposerInput, {
                  compact: true,
                  onHeightChange,
                  placeholder: auxAgentAsk(),
                }),
              }),
            }),
          }),
        }),
      })
    );
  } /** The composer: its input and the toolbar; `surface` gives it the card look inside a session. */,
  ComposerFrame = ({children, draft, fill = false, surface = false}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: g(
        'flex flex-col gap-0.5',
        fill ? 'h-full' : 'pb-1',
        surface && 'bg-surface-primary ring-border-surface-strong squircle rounded-xl py-0 shadow-lg ring-[0.5px]',
      ),
      children: [
        children,
        (0, jsxRuntime.jsx)(M, {mode: 'default', children: (0, jsxRuntime.jsx)(ComposerToolbar, {draft})}),
      ],
    }) /** The input; in compact mode it reports the height the popup needs, from 92 to 320. */,
  ComposerInput = ({compact = false, extensions, onHeightChange, placeholder}) => {
    const {attachments, uploadQueue} = W(),
      hasAttachments = attachments.length > 0 || uploadQueue.length > 0,
      scroller = (0, React.useRef)(null);
    (0, React.useLayoutEffect)(() => {
      const element = scroller.current;
      if (!compact || !element || !onHeightChange) return;
      const measure = () => {
          const input = element.querySelector('[data-testid="chat-input"]');
          if (!input) return;
          observer.observe(input);
          const style = getComputedStyle(input),
            oneLine =
              Number.parseFloat(style.lineHeight) +
              Number.parseFloat(style.paddingTop) +
              Number.parseFloat(style.paddingBottom);
          onHeightChange(
            Math.min(
              COMPOSER_MAX_HEIGHT,
              Math.ceil(
                (hasAttachments ? COMPOSER_HEIGHT_WITH_ATTACHMENTS : COMPOSER_HEIGHT) +
                  Math.max(0, input.scrollHeight - oneLine),
              ),
            ),
          );
        },
        observer = new ResizeObserver(measure);
      return (observer.observe(element), measure(), () => observer.disconnect());
    }, [compact, hasAttachments, onHeightChange]);
    const editor = (0, jsxRuntime.jsx)(fe, {
      editorClassName: g('px-3 py-2.5 text-sm font-[450]', compact && 'max-h-none px-2.5'),
      extensions,
      mentionMenu: MentionMenu,
      placeholder,
    });
    return (0, jsxRuntime.jsxs)('div', {
      className: g('relative -mb-2', compact && 'mb-0 flex h-full min-h-0 flex-col'),
      onKeyDownCapture: event => {
        event.key !== 'Escape' || event.defaultPrevented || (event.preventDefault(), f.requestClose());
      },
      onPointerDownCapture: event => {
        !(event.target instanceof Element) || !event.target.closest('[data-testid="chat-input"]') || window.focus();
      },
      children: [
        (0, jsxRuntime.jsx)(pe, {}),
        compact
          ? (0, jsxRuntime.jsx)('div', {className: 'min-h-0 overflow-y-auto', ref: scroller, children: editor})
          : editor,
        compact && (0, jsxRuntime.jsx)('div', {'aria-hidden': true, className: 'min-h-0 flex-1'}),
      ],
    });
  } /** A session’s header: back to the parent, title, New session (Cmd/Ctrl+N), Open in browser, Close. */,
  SessionHeader = ({sessionId}) => {
    const {accountId} = K(),
      {currentSession, navigate} = $(),
      newSession = () => {
        navigate(null);
      },
      openInBrowser = async () => {
        const url = Fe(`/u/${accountId}/tasks/${encodeURIComponent(sessionId)}/`);
        (await f.openProfileUrl(url), f.requestClose());
      },
      close = () => {
        f.requestClose();
      };
    return (
      (0, React.useEffect)(() => {
        const onKeyDown = event => {
          event.isComposing ||
            event.key.toLowerCase() !== 'n' ||
            !(event.metaKey || event.ctrlKey) ||
            event.altKey ||
            event.shiftKey ||
            (event.preventDefault(), event.stopPropagation(), navigate(null));
        };
        return (
          window.addEventListener('keydown', onKeyDown, true),
          () => window.removeEventListener('keydown', onKeyDown, true)
        );
      }, [navigate]),
      (0, jsxRuntime.jsxs)('header', {
        className: 'app-region-drag relative z-10 flex h-10 w-full shrink-0 items-center gap-1 pr-2.5 pl-[8px]',
        children: [
          (0, jsxRuntime.jsx)(qe, {className: 'no-drag rounded-full'}),
          (0, jsxRuntime.jsx)(Ke, {
            trigger: currentSession.trigger,
            className: g('min-w-0 flex-1 text-[13px] font-medium select-none', !currentSession.parentId && 'pl-[8px]'),
            title: currentSession.title,
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex items-center',
            children: [
              (0, jsxRuntime.jsx)(HeaderButton, {
                label: 'New session',
                shortcut: ze('Meta+N'),
                onClick: newSession,
                children: (0, jsxRuntime.jsx)(ae, {}),
              }),
              (0, jsxRuntime.jsx)(HeaderButton, {
                label: 'Open in browser',
                onClick: openInBrowser,
                children: (0, jsxRuntime.jsx)(OpenInBrowserIcon, {}),
              }),
              (0, jsxRuntime.jsx)(HeaderButton, {
                label: 'Close',
                onClick: close,
                children: (0, jsxRuntime.jsx)(_e, {}),
              }),
            ],
          }),
        ],
      })
    );
  },
  HeaderButton = ({children, label, shortcut, onClick}) =>
    (0, jsxRuntime.jsx)(Ve, {
      content: shortcut
        ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {children: [label, (0, jsxRuntime.jsx)(Re, {children: shortcut})]})
        : label,
      children: (0, jsxRuntime.jsx)(I, {
        'aria-label': label,
        className: "no-drag text-muted-foreground size-7 shrink-0 [&_svg:not([class*='size-'])]:size-4",
        onClick,
        shape: 'pill',
        size: 'icon-sm',
        variant: 'ghost',
        children,
      }),
    }) /** An open session: header, conversation and the reply composer. */,
  SessionView = ({sessionId}) => {
    const runCommand = me({sessionId}),
      extensions = Ee();
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(SessionHeader, {sessionId}),
        (0, jsxRuntime.jsx)(he, {
          className: g(
            '**:data-[agent-session-ui="chat"]:pt-4 **:data-[agent-session-ui="chat"]:pr-3 **:data-[agent-session-ui="chat"]:pl-4',
            '[&_.streamdown_pre]:wrap-anywhere [&_.streamdown_pre]:whitespace-pre-wrap',
          ),
          isSidepanel: true,
        }),
        (0, jsxRuntime.jsx)(Ce, {
          children: (0, jsxRuntime.jsx)(G, {
            className: 'px-2.5 pb-2.5',
            isSidepanel: true,
            runCommand,
            sessionId,
            children: (0, jsxRuntime.jsxs)(ComposerFrame, {
              surface: true,
              children: [
                (0, jsxRuntime.jsx)(M, {mode: 'ask-user-question', children: (0, jsxRuntime.jsx)(ve, {})}),
                (0, jsxRuntime.jsx)(M, {mode: 'action-confirmation', children: (0, jsxRuntime.jsx)(Me, {})}),
                (0, jsxRuntime.jsxs)(U, {
                  className: 'rounded-none bg-transparent shadow-none ring-0 focus-within:shadow-none',
                  children: [
                    (0, jsxRuntime.jsx)(M, {
                      mode: 'default',
                      children: (0, jsxRuntime.jsx)(ComposerInput, {extensions, placeholder: 'Reply, @ for context'}),
                    }),
                    (0, jsxRuntime.jsx)(M, {mode: 'approval', children: (0, jsxRuntime.jsx)(be, {})}),
                  ],
                }),
              ],
            }),
          }),
        }),
      ],
    });
  },
  NEW_SESSION_HEIGHT = 92,
  SESSION_HEIGHT = 534 /** The mini popup: 92px tall for a new session (growing with the draft), 534px with a session open; Esc closes it. */,
  MiniPopup = () => {
    const [sessionId, setSessionId] = (0, React.useState)(null),
      [height, setHeight] = (0, React.useState)(NEW_SESSION_HEIGHT),
      changeSession = (0, React.useCallback)(nextSessionId => {
        (nextSessionId && setHeight(NEW_SESSION_HEIGHT), setSessionId(nextSessionId));
      }, []);
    return (
      usePopupWindow(sessionId ? SESSION_HEIGHT : height),
      (0, jsxRuntime.jsxs)(De, {
        onSessionChange: changeSession,
        sessionId: sessionId ?? void 0,
        children: [
          (0, jsxRuntime.jsx)(Be, {locationHref: sessionId ? `/tasks/${sessionId}` : '/tasks/new'}),
          (0, jsxRuntime.jsx)('div', {
            className: g(
              'bg-background/50 flex h-full flex-col overflow-hidden text-[13px]',
              !sessionId && 'app-region-drag',
            ),
            'data-mini-popup-card': '',
            'data-chat-drop-zone': '',
            children: sessionId
              ? (0, jsxRuntime.jsx)(SessionView, {sessionId})
              : (0, jsxRuntime.jsx)(auxNewSessionComposer, {onHeightChange: setHeight, onSessionChange: changeSession}),
          }),
        ],
      })
    );
  },
  usePopupWindow = height => {
    ((0, React.useEffect)(() => {
      f.setHeight(height);
    }, [height]),
      (0, React.useEffect)(() => {
        const onKeyDown = event => {
          event.key === 'Escape' && !event.defaultPrevented && f.requestClose();
        };
        return (window.addEventListener('keydown', onKeyDown), () => window.removeEventListener('keydown', onKeyDown));
      }, []));
  },
  Rs = MiniPopup;
