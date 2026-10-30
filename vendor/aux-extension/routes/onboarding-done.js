/* Aux-owned source: the last onboarding step (assets/done-DPzI9pFd.js, the module body): You're all set, the
 * appearance dialog whose settings save together on Apply, the Aux CLI setup, and the options saved on
 * finish (default browser, Dock, crash reports), then Adblock's recommended filters, and on to the tasks
 * or the account page. A step that skips Done finishes on its own. A browser that lacks a setting says so.
 * Names the rest of the chunk uses keep their chunk names: It the page (exported).
 * Chunk names used: $/G React, J JSX runtime, g/r/s browser preferences, X useTheme, te the OS, N useQueryClient,
 * B/ne useMutation and useQuery, z useTRPC, ie the session query, V track, de/ce/ue useForm, its resolver and
 * provider, Ue update settings, ge/be/fe/ye/we/he/xe the appearance controls, me tab style, Ie/Me/qe/Oe dialog,
 * I/E/R/q/Le settings rows, _e Switch, Fe Checkbox, M Button, pe return key, D toast, je error content, le/ee/O icons,
 * H/F field group, Ve Adblock, Ke/Qe/ze external password managers, Se the sign-in popup, ve extension URL,
 * Q the route, ke/Pe/Ee/Ae/Be/Te/De onboarding layout, He background, Ne motion, Re Windows, K/T/Ce schema,
 * L/$e/Ge/We the shortcut query and setter, Ye shortcut field. */
var jsxRuntime = J(),
  /** The appearance row's icon. */
  BrushIcon = ({size = 24, ariaHidden = true, ...props}) =>
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
        d: 'M12 2.5C17.4683 2.5 22 6.70021 22 12C22 13.8745 21.4953 15.2199 20.3486 15.9336C19.3009 16.5857 17.9969 16.5049 16.9756 16.3721C16.4477 16.3034 15.879 16.201 15.4014 16.126C14.8975 16.0468 14.4572 15.991 14.0723 15.9854C13.298 15.9741 13.0401 16.1561 12.8945 16.4473C12.8116 16.6132 12.7923 16.8408 12.9229 17.2275C13.061 17.6368 13.2968 18.0345 13.5625 18.5205C13.6824 18.7397 13.8184 18.9968 13.9141 19.25C14.0018 19.4823 14.1173 19.8623 14.0322 20.2783C13.9276 20.7892 13.5759 21.1312 13.166 21.3076C12.812 21.4599 12.4012 21.5 12 21.5C6.53178 21.5 2 17.2998 2 12C2 6.70021 6.53178 2.5 12 2.5ZM12 4.5C7.5271 4.5 4 7.91095 4 12C4 16.0326 7.43049 19.4028 11.8154 19.4951C11.8127 19.4901 11.8104 19.4845 11.8076 19.4795C11.595 19.0906 11.2381 18.488 11.0283 17.8662C10.8109 17.2217 10.6885 16.3866 11.1055 15.5527C11.7661 14.2315 13.0372 13.9699 14.1016 13.9854C14.6357 13.9932 15.1929 14.0688 15.7119 14.1504C16.2571 14.2361 16.7375 14.3242 17.2334 14.3887C18.2603 14.5222 18.9042 14.4776 19.292 14.2363C19.5809 14.0565 20 13.5786 20 12C20 7.91095 16.4729 4.5 12 4.5ZM7.5 10.75C8.32843 10.75 9 11.4216 9 12.25C9 13.0784 8.32843 13.75 7.5 13.75C6.67157 13.75 6 13.0784 6 12.25C6 11.4216 6.67157 10.75 7.5 10.75ZM15.5 8C16.3284 8 17 8.67157 17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8ZM10.5 6.5C11.3284 6.5 12 7.17157 12 8C12 8.82843 11.3284 9.5 10.5 9.5C9.67157 9.5 9 8.82843 9 8C9 7.17157 9.67157 6.5 10.5 6.5Z',
        fill: 'currentColor',
      }),
    }),
  React = $(G(), 1);
/** Opens a browser's password manager settings when one needs it; whether one opened. */
async function recheckPasswordManagers({accountId, currentProfilePath, queryClient, trpc}) {
  try {
    const [managers, detected] = await Promise.all([
        queryClient.query(trpc.externalPasswordManagers.list.queryOptions({accountId})),
        queryClient.query(trpc.onboarding.detectPasswordManagers.queryOptions({currentProfilePath})),
      ]),
      byProvider = new Map(Ke(Qe(detected)).map(manager => [manager.provider, manager]));
    for (const {provider: manager} of managers)
      if (byProvider.get(manager)?.agentUsable === false && (await ze(manager))) return true;
    return false;
  } catch {
    return false;
  }
}
var /** The appearance dialog. */
  AppearanceDialog = ({open, onOpenChange}) => {
    const [isSaving, setIsSaving] = (0, React.useState)(false);
    return (0, jsxRuntime.jsx)(Ie, {
      open,
      onOpenChange: nextOpen => !isSaving && onOpenChange(nextOpen),
      children: (0, jsxRuntime.jsxs)(Me, {
        showCloseButton: false,
        className:
          'flex h-[520px] max-h-[calc(100dvh-2rem)] w-[640px] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]',
        children: [
          (0, jsxRuntime.jsx)(qe, {className: 'sr-only', children: 'Appearance'}),
          open &&
            (0, jsxRuntime.jsx)(AppearanceForm, {onClose: () => onOpenChange(false), onSavingChange: setIsSaving}),
        ],
      }),
    });
  },
  /** The appearance settings, applied together. */
  AppearanceForm = ({onClose, onSavingChange}) => {
    const {setTheme} = X(),
      queryClient = N(),
      {os} = te(),
      preferences = Y(),
      hasCommandShortcuts = $e(preferences),
      miniPopup = typeof chrome > 'u' ? void 0 : chrome.auxMiniPopup,
      colorScheme = useDraftSetting({
        queryKey: ['browserPreferences', 'browserColorScheme'],
        available: !!(preferences?.getBrowserColorScheme && preferences?.setBrowserColorScheme),
        read: () => g().getBrowserColorScheme(),
        write: async value => {
          (g(), await Z(value), setTheme(value));
        },
      }),
      tabStyle = useDraftSetting({
        queryKey: ['browserPreferences', 'tabStyle'],
        available: !!(preferences?.getTabStyle && preferences?.setTabStyle),
        read: () => g().getTabStyle(),
        write: async value => {
          (await g().setTabStyle(value), me(value));
        },
      }),
      tabSwitcherOrder = useDraftSetting({
        queryKey: ['browserPreferences', 'tabSwitcherSortByRecentlyUsed'],
        available: !!(preferences?.getTabSwitcherSortByRecentlyUsed && preferences?.setTabSwitcherSortByRecentlyUsed),
        read: () => g().getTabSwitcherSortByRecentlyUsed(),
        write: value => g().setTabSwitcherSortByRecentlyUsed(value),
      }),
      canVibrancy = os === 'macos' && xe(),
      vibrancy = useDraftSetting({
        queryKey: ['browserPreferences', 'windowBackgroundVibrancyEnabled'],
        available: canVibrancy,
        read: () => g().getWindowBackgroundVibrancyEnabled(),
        write: value => g().setWindowBackgroundVibrancyEnabled(value),
      }),
      hasInsertionPosition = he(),
      insertionPosition = useDraftSetting({
        queryKey: ['browserPreferences', 'verticalTabInsertionPosition'],
        available: hasInsertionPosition,
        read: () => g().getVerticalTabInsertionPosition(),
        write: value => g().setVerticalTabInsertionPosition(value),
      }),
      miniPopupEnabled = useDraftSetting({
        queryKey: ['miniPopup', 'enabled'],
        available: !!(miniPopup?.getEnabled && miniPopup?.setEnabled),
        read: () => {
          if (!miniPopup?.getEnabled) throw new Error('Mini popup is unavailable in this browser.');
          return miniPopup.getEnabled();
        },
        write: value => {
          if (!miniPopup?.setEnabled) throw new Error('Mini popup is unavailable in this browser.');
          return miniPopup.setEnabled(value);
        },
      }),
      miniPopupShortcut = useDraftSetting({
        queryKey: L.queryKey,
        available:
          hasCommandShortcuts ||
          (typeof miniPopup?.getShortcut == 'function' && typeof miniPopup.setShortcut == 'function'),
        read: L.queryFn,
        write: async value => {
          (await We(preferences, Ge.miniPopup.commandId, value),
            queryClient.invalidateQueries({queryKey: ['browser', 'keyboardShortcuts']}));
        },
      }),
      settings = [
        colorScheme,
        tabStyle,
        tabSwitcherOrder,
        ...(canVibrancy ? [vibrancy] : []),
        ...(hasInsertionPosition ? [insertionPosition] : []),
        miniPopupEnabled,
        ...(miniPopupEnabled.value ? [miniPopupShortcut] : []),
      ],
      apply = B({
        mutationFn: async () => {
          if (
            (onSavingChange(true),
            (await Promise.allSettled(settings.map(value => value.save()))).some(value => value.status === 'rejected'))
          )
            throw new Error('Some settings could not be saved. Your changes are still here; try Apply again.');
        },
        onSuccess: onClose,
        onSettled: () => onSavingChange(false),
      }),
      anyError = settings.some(value => value.isError),
      anyUnavailable = settings.some(value => !value.available),
      anyLoading = settings.some(value => value.isLoading),
      handleApply = () => apply.mutate();
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'scroll-fade-effect-y min-h-0 flex-1 overflow-y-auto px-12 py-8',
          children: [
            (0, jsxRuntime.jsxs)('fieldset', {
              disabled: apply.isPending,
              className: 'min-w-0 space-y-6',
              children: [
                (0, jsxRuntime.jsxs)(I, {
                  title: 'Appearance',
                  children: [
                    (0, jsxRuntime.jsx)(E, {
                      children: (0, jsxRuntime.jsx)(ge, {
                        value: colorScheme.value ?? 'system',
                        disabled: colorScheme.disabled,
                        onValueChange: colorScheme.setDraft,
                      }),
                    }),
                    (0, jsxRuntime.jsxs)(E, {
                      children: [
                        (0, jsxRuntime.jsx)(be, {
                          value: tabStyle.value ?? 'vertical',
                          disabled: tabStyle.disabled,
                          onValueChange: tabStyle.setDraft,
                        }),
                        canVibrancy &&
                          (0, jsxRuntime.jsx)(fe, {
                            value: vibrancy.value ?? true,
                            disabled: vibrancy.disabled,
                            onValueChange: vibrancy.setDraft,
                          }),
                      ],
                    }),
                    (0, jsxRuntime.jsxs)(E, {
                      children: [
                        hasInsertionPosition &&
                          tabStyle.value !== 'horizontal' &&
                          (0, jsxRuntime.jsx)(ye, {
                            value: insertionPosition.value ?? 'top',
                            disabled: insertionPosition.disabled,
                            onValueChange: insertionPosition.setDraft,
                          }),
                        (0, jsxRuntime.jsx)(we, {
                          value: tabSwitcherOrder.value ?? true,
                          disabled: tabSwitcherOrder.disabled,
                          onValueChange: tabSwitcherOrder.setDraft,
                        }),
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)(I, {
                  title: 'Mini popup',
                  children: (0, jsxRuntime.jsxs)(E, {
                    children: [
                      (0, jsxRuntime.jsxs)(R, {
                        children: [
                          (0, jsxRuntime.jsx)(q, {
                            title: 'Enable Mini popup',
                            description: 'Open Mini popup from anywhere with your shortcut',
                          }),
                          (0, jsxRuntime.jsx)(Le, {
                            children: (0, jsxRuntime.jsx)(_e, {
                              'aria-label': 'Enable Mini popup',
                              checked: miniPopupEnabled.value ?? false,
                              disabled: miniPopupEnabled.disabled,
                              onCheckedChange: miniPopupEnabled.setDraft,
                            }),
                          }),
                        ],
                      }),
                      miniPopupEnabled.value &&
                        (miniPopupShortcut.available
                          ? (0, jsxRuntime.jsx)(Ye, {
                              value: miniPopupShortcut.value,
                              isMacOS: os === 'macos',
                              disabled: miniPopupShortcut.disabled || apply.isPending,
                              onValueChange: miniPopupShortcut.setDraft,
                            })
                          : (0, jsxRuntime.jsx)(R, {
                              children: (0, jsxRuntime.jsx)(q, {
                                title: 'Keyboard shortcut',
                                description: 'Update Aux to customize this shortcut.',
                              }),
                            })),
                    ],
                  }),
                }),
              ],
            }),
            apply.isError
              ? (0, jsxRuntime.jsx)('p', {
                  role: 'alert',
                  className: 'text-destructive mt-3 text-xs',
                  children: apply.error.message,
                })
              : anyError
                ? (0, jsxRuntime.jsx)('p', {
                    role: 'alert',
                    className: 'text-destructive mt-3 text-xs',
                    children: 'Could not load some settings. Close and reopen this dialog to retry.',
                  })
                : anyUnavailable
                  ? (0, jsxRuntime.jsx)('p', {
                      className: 'text-muted-foreground mt-3 text-xs',
                      children: 'Some settings are unavailable in this browser version.',
                    })
                  : anyLoading
                    ? (0, jsxRuntime.jsx)('p', {
                        role: 'status',
                        className: 'text-muted-foreground mt-3 text-xs',
                        children: 'Loading settings…',
                      })
                    : null,
          ],
        }),
        (0, jsxRuntime.jsxs)(Oe, {
          className: 'm-0 pt-2',
          children: [
            (0, jsxRuntime.jsx)(M, {
              variant: 'secondary',
              disabled: apply.isPending,
              onClick: onClose,
              children: 'Cancel',
            }),
            (0, jsxRuntime.jsxs)(M, {
              disabled: apply.isPending || anyLoading || !settings.some(value => !value.disabled),
              onClick: handleApply,
              children: [
                apply.isPending ? 'Applying…' : 'Apply',
                (0, jsxRuntime.jsx)(pe, {className: 'size-4 opacity-50'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  /** A setting edited as a draft: read, kept until Apply, and written if it changed. */
  useDraftSetting = ({queryKey, available, read, write}) => {
    const queryClient = N(),
      [draft, setDraft] = (0, React.useState)(),
      query = ne({queryKey, queryFn: read, enabled: available, retry: false}),
      disabled = !available || query.data === void 0 || query.isError;
    return {
      value: draft ?? query.data,
      setDraft,
      available,
      disabled,
      isError: available && query.isError,
      isLoading: query.isLoading,
      save: async () => {
        disabled ||
          draft === void 0 ||
          draft === query.data ||
          (await write(draft), queryClient.setQueryData(queryKey, draft));
      },
    };
  };
K({completionTarget: Ce(['workspace', 'settings-account']).default('workspace')});
/** The Done page. */
function It() {
  const {skipDone} = Q.useLoaderData(),
    [autoCompleteFailed, setAutoCompleteFailed] = (0, React.useState)(false),
    handleError = () => setAutoCompleteFailed(true);
  return skipDone && !autoCompleteFailed
    ? (0, jsxRuntime.jsx)(OptionsForm, {autoComplete: true, onAutoCompleteError: handleError})
    : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsx)(FadeIn, {
            children: (0, jsxRuntime.jsxs)(ke, {
              className: 'pt-8 pb-4',
              children: [
                (0, jsxRuntime.jsx)(FadeIn, {children: (0, jsxRuntime.jsx)(Pe, {})}),
                (0, jsxRuntime.jsx)(FadeIn, {children: (0, jsxRuntime.jsx)(Ee, {children: 'You’re all set!'})}),
                (0, jsxRuntime.jsx)(FadeIn, {
                  children: (0, jsxRuntime.jsx)(Ae, {children: 'Start browsing or run your first task with Aux.'}),
                }),
              ],
            }),
          }),
          (0, jsxRuntime.jsx)(Be, {
            className: 'min-h-0 justify-start overflow-y-auto py-0',
            children: (0, jsxRuntime.jsx)(FadeIn, {
              children: (0, jsxRuntime.jsxs)('div', {
                className: 'flex w-110 max-w-full flex-col gap-3',
                children: [(0, jsxRuntime.jsx)(SetupList, {}), (0, jsxRuntime.jsx)(OptionsForm, {})],
              }),
            }),
          }),
          (0, jsxRuntime.jsx)(Te, {
            className: 'justify-center',
            children: (0, jsxRuntime.jsx)(FadeIn, {
              children: (0, jsxRuntime.jsx)(De, {type: 'submit', form: 'options-form', children: 'Get started'}),
            }),
          }),
          (0, jsxRuntime.jsx)(He, {}),
        ],
      });
}
var /** The appearance and Aux CLI rows. */
  SetupList = () => {
    const trpc = z(),
      queryClient = N(),
      {track} = V(),
      [open, setOpen] = (0, React.useState)(false),
      installCli = B(
        trpc.developers.installCli.mutationOptions({
          onSuccess: result => {
            (queryClient.setQueryData(trpc.developers.checkCliInstallation.queryKey(), result),
              queryClient.invalidateQueries(trpc.developers.checkCliInstallation.queryFilter()),
              D.success('Aux CLI installed.'));
          },
          onError: result => D.error('Could not install Aux CLI.', {description: result.message}),
        }),
      ),
      openAppearance = () => {
        setOpen(true);
      },
      handleInstall = () => {
        (track('settings.developers.cli.install', {action: 'install'}), installCli.mutate());
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(H, {
          className: 'rounded-xl',
          children: [
            (0, jsxRuntime.jsxs)('button', {
              type: 'button',
              className: `${F} hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 px-3 pt-3 pb-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset`,
              onClick: openAppearance,
              children: [
                (0, jsxRuntime.jsx)(BrushIcon, {className: 'text-muted-foreground size-5 shrink-0'}),
                (0, jsxRuntime.jsxs)('span', {
                  className: 'flex flex-1 flex-col gap-1',
                  children: [
                    (0, jsxRuntime.jsx)('span', {
                      className: 'text-sm leading-none font-medium',
                      children: 'Customize appearance',
                    }),
                    (0, jsxRuntime.jsx)('span', {
                      className: 'text-muted-foreground text-xs leading-none',
                      children: 'Appearance, Tab style, Mini popup..',
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)(O, {className: 'text-muted-foreground size-4 shrink-0'}),
              ],
            }),
            (0, jsxRuntime.jsxs)('button', {
              type: 'button',
              disabled: installCli.isPending,
              'aria-busy': installCli.isPending,
              className: `${F} hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 px-3 pt-3 pb-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:pointer-events-none`,
              onClick: handleInstall,
              children: [
                (0, jsxRuntime.jsx)(le, {className: 'text-muted-foreground size-5 shrink-0'}),
                (0, jsxRuntime.jsxs)('span', {
                  className: 'flex flex-1 flex-col gap-1',
                  children: [
                    (0, jsxRuntime.jsx)('span', {
                      className: 'text-sm leading-none font-medium',
                      children: 'Set up Aux CLI',
                    }),
                    (0, jsxRuntime.jsx)('span', {
                      className: 'text-muted-foreground text-xs leading-none',
                      children: 'Give your agents powerful browsing capability.',
                    }),
                  ],
                }),
                installCli.isPending
                  ? (0, jsxRuntime.jsx)(ee, {className: 'text-muted-foreground size-4 shrink-0'})
                  : (0, jsxRuntime.jsx)(O, {className: 'text-muted-foreground size-4 shrink-0'}),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(AppearanceDialog, {open, onOpenChange: setOpen}),
      ],
    });
  },
  /** The finish options and what finishing does. */
  OptionsForm = ({autoComplete = false, onAutoCompleteError}) => {
    const {completionTarget} = Q.useSearch(),
      {track} = V(),
      trpc = z(),
      queryClient = N(),
      started = (0, React.useRef)(false),
      cleanupHours = (0, React.useRef)(0),
      form = de({
        resolver: ce(optionsSchema),
        defaultValues: {defaultBrowser: true, addToDock: false, helpImproveAux: false},
      }),
      updateSettings = Ue(),
      capture = B(trpc.analytics.capture.mutationOptions()),
      completeOnboarding = B(trpc.accounts.auth.completeOnboarding.mutationOptions()),
      toggle = option => value => {
        const checked = value === true;
        (form.setValue(option, checked, {shouldDirty: true}),
          track('onboarding.done.toggle-setting', {id: option, value: checked}));
      },
      finish = async values => {
        try {
          const session = await queryClient.query({...ie.queryOptions, staleTime: 'static'}),
            {accountId} = session,
            [, browserResult] = await Promise.all([
              globalThis.chrome?.auxBrowserPreferences?.setCrashReports?.(values.helpImproveAux).catch(() => {}),
              applyBrowserOptions(values),
              applyTabCleanup(cleanupHours.current).catch(() => {}),
            ]),
            events = [];
          if (
            (values.defaultBrowser &&
              browserResult.defaultBrowserState &&
              events.push({
                event: 'settings.set-as-default-browser',
                properties: {place: 'onboarding', value: browserResult.defaultBrowserState.isDefault},
              }),
            values.addToDock && browserResult.dockState)
          ) {
            const {supported, isAdded} = browserResult.dockState;
            events.push({
              event: 'onboarding.done.add-to-dock',
              properties: {place: 'onboarding', value: isAdded, supported, isAdded},
            });
          }
          values.helpImproveAux &&
            (events.push({event: 'settings.analytics.enable', properties: {place: 'onboarding', value: true}}),
            await Promise.all(
              events.map(({event, properties}) => capture.mutateAsync({accountId, event, properties}).catch(() => {})),
            ));
          const adblock = typeof chrome > 'u' ? void 0 : chrome.auxAdblock;
          (adblock &&
            (await Ve(adblock, queryClient).catch(error => {
              (console.error('[onboarding] Could not set up Adblock', error),
                D.error('Could not set up Adblock. You can enable it in Settings → Privacy.'));
            })),
            await (async () => {
              try {
                localStorage.setItem('aux.onboarding.completed.v1', '1');
              } catch {}
              if ((await queryClient.fetchQuery(trpc.accounts.get.queryOptions({accountId})))?.mode === 'cloud')
                await completeOnboarding.mutateAsync({accountId});
            })(),
            await queryClient.invalidateQueries(trpc.accounts.get.queryFilter({accountId})),
            await finishOnboarding({
              accountId,
              completionTarget,
              currentProfilePath: session.browserProfile?.profilePath,
              queryClient,
              trpc,
            }));
        } catch (error) {
          const content = await je(error, 'Could not finish onboarding.');
          (D.error(content.title, {description: content.description}), onAutoCompleteError?.());
        }
      },
      finishOnce = (0, React.useEffectEvent)(() => {
        form.handleSubmit(finish)();
      });
    return (
      (0, React.useEffect)(() => {
        !autoComplete || started.current || ((started.current = true), finishOnce());
      }, [autoComplete]),
      autoComplete
        ? null
        : (0, jsxRuntime.jsx)(ue, {
            ...form,
            children: (0, jsxRuntime.jsx)('form', {
              id: 'options-form',
              onSubmit: form.handleSubmit(finish),
              children: (0, jsxRuntime.jsx)(H, {
                className: 'w-110 rounded-xl',
                children: [...OPTIONS.map(option =>
                  (0, jsxRuntime.jsxs)(
                    ae,
                    {
                      orientation: 'horizontal',
                      className: `${F} p-3 py-2.5`,
                      children: [
                        (0, jsxRuntime.jsx)(Fe, {
                          id: option.id,
                          name: option.id,
                          checked: form.watch(option.id),
                          onCheckedChange: toggle(option.id),
                        }),
                        (0, jsxRuntime.jsxs)(oe, {
                          className: 'leading-none',
                          children: [
                            (0, jsxRuntime.jsx)(se, {htmlFor: option.id, children: option.label}),
                            (0, jsxRuntime.jsx)(re, {
                              className: 'text-muted-foreground text-xs',
                              children: option.description,
                            }),
                          ],
                        }),
                      ],
                    },
                    option.id,
                  ),
                ), (0, jsxRuntime.jsx)(TabCleanupRow, {hours: cleanupHours}, 'tab-cleanup')],
              }),
            }),
          })
    );
  },
  /** Opens where the person goes next. */
  finishOnboarding = async ({accountId, completionTarget, currentProfilePath, queryClient, trpc}) => {
    if (await Se()) return;
    if (window.location.protocol === 'chrome-extension:') {
      (await chrome.tabs.create({url: completionUrl(accountId, completionTarget), active: true}),
        await recheckPasswordManagers({accountId, currentProfilePath, queryClient, trpc}));
      const currentTab = await chrome.tabs.getCurrent();
      currentTab?.id != null && (await chrome.tabs.remove(currentTab.id));
      return;
    }
    const target =
      completionTarget === 'settings-account'
        ? new URL(`/u/${accountId}/settings/account`, window.location.origin).toString()
        : new URL(`/u/${accountId}/tasks`, window.location.origin).toString();
    (await recheckPasswordManagers({accountId, currentProfilePath, queryClient, trpc}),
      window.location.replace(target));
  },
  /** Where a finished onboarding opens. */
  completionUrl = (accountId, completionTarget) =>
    completionTarget === 'settings-account'
      ? ve(`/u/${accountId}/settings/account`)
      : new URL('/newtab.html?mode=search', window.location.origin).toString(),
  /** Applies default browser and Dock. */
  applyBrowserOptions = async ({defaultBrowser, addToDock}) => {
    const preferences = typeof chrome > 'u' ? void 0 : chrome.auxBrowserPreferences,
      result = {defaultBrowserState: null, dockState: null};
    if (!preferences) return result;
    if (defaultBrowser) {
      const state = await preferences.getDefaultBrowserState();
      result.defaultBrowserState = state.isDefault || !state.canSet ? state : await preferences.setAsDefaultBrowser();
    }
    if (addToDock) {
      const state = await preferences.getDockState();
      result.dockState = state.isAdded || !state.canAdd ? state : await preferences.addToDock();
    }
    return result;
  },
  TAB_CLEANUP = [[0, 'Never'], [12, '12 hours'], [24, '24 hours'], [168, '7 days']],
  /** Turns on tab cleanup through the call Settings uses, for every Space. */
  applyTabCleanup = async hours => {
    const preferences = globalThis.chrome?.auxBrowserPreferences;
    if (!hours || typeof preferences?.setOrganizationCleanupPolicy !== 'function') return;
    const settings = await preferences.getOrganizationSettings();
    if (settings?.success)
      await preferences.setOrganizationCleanupPolicy({ownerGeneration: settings.ownerGeneration, expectedRevision: settings.revision,
        enabled: true, inactivityHours: hours, spaceIds: settings.cleanup.spaceIds});
  },
  /** The Tab cleanup row. */
  TabCleanupRow = ({hours}) =>
    (0, jsxRuntime.jsxs)(ae, {
      orientation: 'horizontal',
      className: `${F} p-3 py-2.5`,
      children: [
        (0, jsxRuntime.jsxs)(oe, {
          className: 'leading-none',
          children: [
            (0, jsxRuntime.jsx)(se, {htmlFor: 'tab-cleanup', children: 'Tab cleanup'}),
            (0, jsxRuntime.jsx)(re, {className: 'text-muted-foreground text-xs', children: 'Archive tabs you haven’t used for a while'}),
          ],
        }),
        (0, jsxRuntime.jsx)('select', {
          id: 'tab-cleanup',
          defaultValue: 0,
          className: 'bg-surface-primary border-border rounded-lg border px-2 py-1 text-sm',
          onChange: event => {
            hours.current = Number(event.target.value);
          },
          children: TAB_CLEANUP.map(([value, label]) => (0, jsxRuntime.jsx)('option', {value, children: label}, value)),
        }),
      ],
    }),
  /** The options. */
  optionsSchema = K({
    defaultBrowser: T(),
    addToDock: T(),
    helpImproveAux: T(),
  }),
  /** The option rows. */
  OPTIONS = [
    {id: 'defaultBrowser', label: 'Set Aux as your default browser', description: 'You can switch back anytime'},
    {
      id: 'addToDock',
      label: Re() ? 'Pin Aux to taskbar' : 'Add Aux to Dock',
      description: 'Easily start browsing or run task when you need it',
    },
    {
      id: 'helpImproveAux',
      label: 'Send crash reports',
      description: 'When Aux quits unexpectedly, send a technical report. Never your pages, passwords or files.',
    },
  ],
  /** Fades in. */
  FadeIn = ({children}) =>
    (0, jsxRuntime.jsx)(Ne.div, {initial: {opacity: 0}, animate: {opacity: 1}, transition: {duration: 0.2}, children});
