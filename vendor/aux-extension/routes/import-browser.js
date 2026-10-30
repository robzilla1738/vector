/* Aux-owned source, onboarding › Import from your browser (assets/import-browser-DwQpkFpc.js, the
 * module body, exported as component): the detected browsers as tiles, recently used first (the
 * fourth and on fold into Others), the dialog to pick a browser and a profile, and Skip or Next.
 * Skip goes to the password manager step (vendor/provided/polish/integration.mjs's onboarding).
 * Names the rest of the chunk uses keep their chunk names: he the page; h React stays as named,
 * the JSX runtime is jsxRuntime.
 * Chunk names used: A/z/O React and JSX runtime, P Link, D analytics, T useReducedMotion,
 * _ RelativeTime, v Tooltip wrapper parts, M Skeleton, q useBrowserImporter, N pickDefaultTarget,
 * F the checked badge, U Return arrow, E check, R/H/L the import dialog parts, b Button, Y/G/J the
 * tooltip parts, W/X/Z/$/S/K the onboarding layout parts, Q motion, y BrowserIcon.
 * Aux change: the browser tiles and their placeholders take the 12px card corner (rounded-xl). */
var h = A(z(), 1),
  jsxRuntime = O(),
  /** The dialog: pick a browser, then a profile when it has several. */
  ImportDialog = ({browsers, initialBrowserId, initialStep, onCancel, onImport}) => {
    const [step, setStep] = (0, h.useState)(initialStep),
      [browserId, setBrowserId] = (0, h.useState)(initialBrowserId),
      [targetId, setTargetId] = (0, h.useState)(''),
      browser = browsers.find(item => item.source.id === browserId),
      target =
        browser?.targets.find(item => item.id === targetId && !item.alreadyImported) ?? N(browser?.targets ?? []),
      selectBrowser = item => () => {
        (setBrowserId(item.source.id), setTargetId(''), item.requiresProfileSelection && setStep('profile'));
      },
      selectTarget = id => () => setTargetId(id),
      onOpenChange = open => {
        open || onCancel();
      },
      back = () => {
        initialStep === 'browser' ? setStep('browser') : onCancel();
      },
      next = () => {
        if (!(!browser || !target || target.alreadyImported)) {
          if (step === 'browser' && browser.requiresProfileSelection) {
            setStep('profile');
            return;
          }
          onImport(target);
        }
      };
    return (0, jsxRuntime.jsxs)(R, {
      open: true,
      onOpenChange,
      children: [
        (0, jsxRuntime.jsx)(
          H,
          {
            title: step === 'browser' ? 'Import from your browser' : 'Which profile to import?',
            description:
              step === 'browser'
                ? 'Choose a browser to import from'
                : `Choose a profile from ${browser?.source.name} to import`,
            icon:
              step === 'profile' && browser && (0, jsxRuntime.jsx)(y, {value: browser.source.id, className: 'size-12'}),
            children: (0, jsxRuntime.jsx)('div', {
              className:
                'bg-border space-y-hairline border-hairline shrink-0 overflow-hidden rounded-xl dark:space-y-px dark:border-transparent dark:bg-transparent',
              children:
                step === 'browser'
                  ? browsers.map(item =>
                      (0, jsxRuntime.jsxs)(
                        ImportDialogRow,
                        {
                          selected: item.source.id === browserId,
                          disabled: item.alreadyImported,
                          onClick: selectBrowser(item),
                          children: [
                            (0, jsxRuntime.jsx)(y, {value: item.source.id, className: 'size-8 shrink-0'}),
                            (0, jsxRuntime.jsx)('span', {
                              className: 'min-w-0 grow truncate px-0.5',
                              children: item.source.name,
                            }),
                            item.alreadyImported &&
                              (0, jsxRuntime.jsx)('span', {
                                className: 'text-muted-foreground text-xs',
                                children: 'Already imported',
                              }),
                          ],
                        },
                        item.source.id,
                      ),
                    )
                  : browser?.targets.map(item =>
                      (0, jsxRuntime.jsxs)(
                        ImportDialogRow,
                        {
                          selected: item.id === target?.id,
                          disabled: item.alreadyImported,
                          onClick: selectTarget(item.id),
                          children: [
                            (0, jsxRuntime.jsx)('span', {
                              className: 'min-w-0 truncate',
                              children: item.description || item.label,
                            }),
                            (0, jsxRuntime.jsx)('span', {
                              className: 'text-muted-foreground min-w-0 grow truncate text-xs',
                              children: item.alreadyImported
                                ? 'Already imported'
                                : item.lastUsedAt && (0, jsxRuntime.jsx)(_, {datetime: item.lastUsedAt}),
                            }),
                          ],
                        },
                        item.id,
                      ),
                    ),
            }),
          },
          step,
        ),
        (0, jsxRuntime.jsxs)(L, {
          children: [
            step === 'profile' &&
              (0, jsxRuntime.jsx)(b, {variant: 'outline', size: 'lg', onClick: back, children: 'Back'}),
            (0, jsxRuntime.jsxs)('div', {
              className: 'ml-auto flex gap-2',
              children: [
                (0, jsxRuntime.jsx)(b, {variant: 'secondary', size: 'lg', onClick: onCancel, children: 'Cancel'}),
                (0, jsxRuntime.jsxs)(b, {
                  size: 'lg',
                  'data-dialog-enter-action': 'true',
                  disabled: !target || target.alreadyImported,
                  onClick: next,
                  children: [
                    (0, jsxRuntime.jsx)('span', {children: step === 'browser' ? 'Next' : 'Import'}),
                    (0, jsxRuntime.jsx)(U, {className: 'size-4 opacity-50'}),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  /** A row in the dialog, checked while selected. */
  ImportDialogRow = ({selected, disabled, children, onClick}) =>
    (0, jsxRuntime.jsxs)('button', {
      type: 'button',
      className:
        'bg-surface-primary dark:hover:bg-muted dark:aria-pressed:bg-muted focus-visible:ring-ring text-primary flex h-13.5 w-full min-w-0 items-center gap-1.5 px-3 text-left text-sm font-medium transition-colors duration-75 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-default disabled:opacity-50 aria-pressed:bg-neutral-100',
      'aria-pressed': selected,
      disabled,
      onClick,
      children: [
        children,
        (0, jsxRuntime.jsx)(E, {className: 'size-4 shrink-0', style: {visibility: selected ? 'visible' : 'hidden'}}),
      ],
    });
/** The Import step. */
function he() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsxs)(X, {
        className: 'pb-0',
        children: [
          (0, jsxRuntime.jsx)($, {children: 'Import from your browser'}),
          (0, jsxRuntime.jsxs)(W, {
            children: [
              'Bring your browser history, cookies, and bookmarks',
              (0, jsxRuntime.jsx)('br', {}),
              'so you don’t have to configure Aux from scratch.',
            ],
          }),
        ],
      }),
      (0, jsxRuntime.jsx)(h.Suspense, {
        fallback: (0, jsxRuntime.jsx)(ImportPlaceholder, {}),
        children: (0, jsxRuntime.jsx)(BrowserChoices, {}),
      }),
    ],
  });
}
/** Placeholder tiles while the browsers load. */
var ImportPlaceholder = () =>
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(S, {
          children: (0, jsxRuntime.jsx)('div', {
            className: 'grid w-full max-w-184 grid-cols-4 gap-2.5',
            children: Array.from({length: 4}, (_, index) =>
              (0, jsxRuntime.jsx)(M, {className: 'h-36 rounded-xl'}, index),
            ),
          }),
        }),
        (0, jsxRuntime.jsx)(ImportFooter, {disabled: true}),
      ],
    }),
  /** The browser tiles, the footer and the dialogs. */
  BrowserChoices = () => {
    const importer = q(),
      [selectedId, setSelectedId] = (0, h.useState)(''),
      [dialogStep, setDialogStep] = (0, h.useState)(null),
      browsers = Array.from(new Set(importer.targets.filter(target => target.detected).map(target => target.source.id)))
        .map(id => {
          const targets = importer.targets.filter(target => target.source.id === id);
          return {
            source: targets[0].source,
            targets,
            alreadyImported: targets.every(target => target.alreadyImported),
            requiresProfileSelection:
              targets.filter(target => target.kind === 'profile' && !target.alreadyImported).length > 1,
            lastUsedAt: Math.max(0, ...targets.map(target => Date.parse(target.lastUsedAt ?? '') || 0)),
          };
        })
        .sort((a, b) => b.lastUsedAt - a.lastUsedAt),
      selected =
        browsers.find(browser => browser.source.id === selectedId && !browser.alreadyImported) ??
        browsers.find(browser => !browser.alreadyImported),
      visible = browsers.length > 4 ? browsers.slice(0, 3) : browsers,
      others = browsers.length > 4 ? browsers.slice(3) : [],
      selectBrowser = browser => () => {
        (setSelectedId(browser.source.id), browser.requiresProfileSelection && setDialogStep('profile'));
      },
      closeDialog = () => setDialogStep(null),
      openOthers = () => setDialogStep('browser'),
      startImport = target => {
        (setSelectedId(target.source.id), setDialogStep(null), importer.importTarget(target));
      },
      importSelected = () => {
        if (!selected) return;
        const target = N(selected.targets);
        if (!(!target || target.alreadyImported)) {
          if (selected.requiresProfileSelection) {
            setDialogStep('profile');
            return;
          }
          startImport(target);
        }
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(S, {
          children:
            browsers.length > 0
              ? (0, jsxRuntime.jsxs)('div', {
                  className: 'no-drag flex w-full max-w-184 justify-center gap-2.5',
                  'aria-label': 'Browsers',
                  children: [
                    visible.map(browser =>
                      (0, jsxRuntime.jsx)(
                        BrowserTile,
                        {
                          label: browser.source.name,
                          selected: selected?.source.id === browser.source.id,
                          disabled: browser.alreadyImported,
                          onClick: selectBrowser(browser),
                          children: (0, jsxRuntime.jsx)(y, {value: browser.source.id, className: 'size-15'}),
                        },
                        browser.source.id,
                      ),
                    ),
                    others.length > 0 &&
                      (0, jsxRuntime.jsx)(BrowserTile, {
                        label: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                          children: [
                            'Others',
                            (0, jsxRuntime.jsxs)('span', {
                              className: 'text-muted-foreground ml-1',
                              children: ['+', others.length],
                            }),
                          ],
                        }),
                        selected: others.some(browser => browser.source.id === selected?.source.id),
                        disabled: others.every(browser => browser.alreadyImported),
                        onClick: openOthers,
                        children: (0, jsxRuntime.jsx)(OtherBrowserIcons, {browsers: others}),
                      }),
                  ],
                })
              : (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground text-center text-sm',
                  children: 'No browsers available to import. You can skip this step and import later in Settings.',
                }),
        }),
        (0, jsxRuntime.jsx)(ImportFooter, {disabled: !selected, onImport: importSelected}),
        dialogStep &&
          (0, jsxRuntime.jsx)(ImportDialog, {
            browsers,
            initialBrowserId: selected?.source.id,
            initialStep: dialogStep,
            onCancel: closeDialog,
            onImport: startImport,
          }),
        importer.dialogs,
      ],
    });
  },
  /** The Others tile's icons: two at a time, cycling every 3.2 seconds with more than two. */
  OtherBrowserIcons = ({browsers}) => {
    const reducedMotion = T(),
      [index, setIndex] = (0, h.useState)(0),
      [fading, setFading] = (0, h.useState)(false),
      animated = browsers.length > 2 && !reducedMotion,
      next = () => {
        (setIndex(value => (value + 1) % browsers.length), setFading(false));
      };
    return (
      (0, h.useEffect)(() => {
        if (!animated) {
          setFading(false);
          return;
        }
        const timer = window.setTimeout(() => setFading(true), 3200);
        return () => window.clearTimeout(timer);
      }, [index, animated]),
      (0, jsxRuntime.jsx)('span', {
        className: 'relative size-15',
        'aria-hidden': 'true',
        children: [1, 0].map(offset => {
          const browser = browsers[(index + offset) % browsers.length],
            fadingOut = animated && fading && offset === 0;
          return (0, jsxRuntime.jsx)(
            Q.span,
            {
              className: 'absolute top-0 left-0 size-11',
              style: {zIndex: 1 - offset},
              initial: animated && offset === 1 ? {opacity: 0, filter: 'blur(4px)', x: 24, y: -8} : false,
              animate: {
                opacity: fadingOut ? 0 : 1,
                filter: fadingOut ? 'blur(4px)' : 'blur(0px)',
                x: offset * 16 - (fadingOut ? 8 : 0),
                y: (1 - offset) * 16 + (fadingOut ? 8 : 0),
              },
              transition: {
                duration: reducedMotion ? 0 : 0.26,
                delay: animated && offset === 1 ? 0.26 : 0,
                ease: 'easeInOut',
              },
              onAnimationComplete: fadingOut ? next : void 0,
              children: (0, jsxRuntime.jsx)(y, {value: browser.source.id, className: 'size-11'}),
            },
            browser.source.id,
          );
        }),
      })
    );
  },
  /** A browser tile. */
  BrowserTile = ({label, selected, disabled, children, onClick}) =>
    (0, jsxRuntime.jsxs)('button', {
      type: 'button',
      className:
        'bg-secondary hover:bg-accent focus-visible:ring-ring relative flex h-36 max-w-44 min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl px-2 pt-3 transition-colors outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-50',
      'aria-pressed': selected,
      disabled,
      onClick,
      children: [
        selected && (0, jsxRuntime.jsx)(F, {className: 'text-brand absolute top-2.5 right-2.5 size-4'}),
        children,
        (0, jsxRuntime.jsx)('span', {
          className: 'text-primary w-full truncate text-center text-sm font-medium',
          children: label,
        }),
        disabled && (0, jsxRuntime.jsx)('span', {className: 'sr-only', children: 'Already imported'}),
      ],
    }),
  /** Skip, with where to import later, and Next. */
  ImportFooter = ({disabled, onImport}) => {
    const {track} = D();
    return (0, jsxRuntime.jsx)(Z, {
      className: 'justify-end',
      children: (0, jsxRuntime.jsxs)(v, {
        children: [
          (0, jsxRuntime.jsx)(v, {
            children: (0, jsxRuntime.jsxs)(J, {
              children: [
                (0, jsxRuntime.jsx)(Y, {
                  delay: 0,
                  render: () =>
                    (0, jsxRuntime.jsx)(b, {
                      variant: 'secondary',
                      size: 'lg',
                      nativeButton: false,
                      render: (0, jsxRuntime.jsx)(P, {
                        to: '/onboarding/import-password',
                        replace: true,
                        onClick: () => {
                          track('onboarding.import-browser.skip');
                        },
                      }),
                      children: 'Skip',
                    }),
                }),
                (0, jsxRuntime.jsx)(G, {
                  children: (0, jsxRuntime.jsxs)('span', {
                    className: 'text-[13px] text-pretty',
                    children: [
                      'You can import browser data anytime in',
                      ' ',
                      (0, jsxRuntime.jsxs)('span', {
                        className: 'font-medium',
                        children: ['Settings ', '>', ' Import from your browser'],
                      }),
                      ' section.',
                    ],
                  }),
                }),
              ],
            }),
          }),
          (0, jsxRuntime.jsx)(v, {children: (0, jsxRuntime.jsx)(K, {disabled, onClick: onImport, children: 'Next'})}),
        ],
      }),
    });
  };
