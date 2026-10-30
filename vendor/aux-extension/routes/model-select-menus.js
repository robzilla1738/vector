/* Aux-owned source, model select pass 2 (assets/model-select-BvZsM1Kl.js, from the keyboard shortcuts to
 * the end of the module): the keyboard shortcuts (⌘⇧M model, ⌘⇧. thinking), the
 * model menu (search, providers as groups or submenus, expired sign-ins, the default option, loading,
 * empty and error states) and the thinking menu (reasoning levels, speed).
 * Names the rest of the chunk uses keep their chunk names: br ModelShortcuts, wr ShortcutTooltip, Mr
 * ModelSelector, kr ThinkingSelector, Je effectiveValue, ne useModelSelect, ke restoreFocus, je
 * thinkingLevels, ye maxLevel, Se selectionFor.
 * Chunk names used: d React, e JSX runtime, z cn, Me/se/Ve/we from the first pass, the menu, tooltip,
 * input group and radio parts, ie the level labels, Ae/ge the default and max levels, $e the platform
 * modifier, ze/Ge the shortcut label and Kbd, Oe the model key, ee the provider icon, be/xe link. */
br = ({thinking = true}) => {
    const o = (0, d.useRef)(null);
    return (
      (0, d.useEffect)(() => {
        const a = t => {
          handleShortcut(t, o.current, thinking);
        };
        return (
          window.addEventListener('keydown', a, {capture: true}),
          () => window.removeEventListener('keydown', a, {capture: true})
        );
      }, [thinking]),
      (0, e.jsx)('span', {ref: o, hidden: true})
    );
  },
  wr = ({shortcut, children}) => {
    const {isOpen, isThinkingOpen} = ne(),
      [c, u] = (0, d.useState)(false),
      p = shortcut ? (shortcut === 'model' ? isOpen : isThinkingOpen) : isOpen || isThinkingOpen;
    return (
      (0, d.useEffect)(() => {
        p && u(false);
      }, [p]),
      (0, e.jsx)(W, {disabled: p, open: p ? false : c, onOpenChange: u, children})
    );
  } /** The model menu. */,
  Mr = ({render, children, menuSize = 'md', submenu = false, ...c}) => {
    const {
        allowDefaultOption,
        isAvailableModelsLoading,
        isAvailableModelsError,
        retryAvailableModels,
        isUsingDefaultValue,
        isOpen,
        defaultOptionLabel,
        selectableProviders,
        selectedModel,
        unavailableValueLabel,
        getModels,
        isModelSelected,
        onOpenChange,
        onChange,
      } = ne(),
      g = (0, d.useRef)(null),
      T = (0, d.useRef)(null),
      [P, i] = (0, d.useState)(''),
      f = P.trim().toLowerCase(),
      b = (0, d.useMemo)(
        () =>
          selectableProviders
            .map(s => ({provider: s, models: getModels(s.id).filter(x => matchesQuery(x, s, f))}))
            .filter(
              ({provider, models}) =>
                models.length ||
                (provider.state === 'auth-expired' &&
                  (!f || `${provider.name} reauthentication required`.toLowerCase().includes(f))),
            ),
        [getModels, f, selectableProviders],
      ),
      E = f.length > 0,
      y = selectableProviders.length > 1,
      K = triggerLabel(selectedModel, allowDefaultOption, defaultOptionLabel, unavailableValueLabel),
      _ = ve({
        defaultTagName: 'button',
        props: de(
          {
            ref: g,
            children: (0, e.jsxs)(e.Fragment, {
              children: [
                (0, e.jsx)('span', {
                  className: z('min-w-0 grow truncate', !selectedModel && 'opacity-50'),
                  children: K,
                }),
                (0, e.jsx)(fe, {className: 'text-muted-foreground size-3.5! opacity-50', 'data-icon': 'inline-end'}),
              ],
            }),
          },
          c,
        ),
        render,
        state: {slot: 'model-selector-trigger'},
      }),
      R = s => {
        s && (onChange(null), onOpenChange(false));
      },
      O = s => x => {
        x && (onChange(Se(s, selectedModel?.fastMode)), onOpenChange(false));
      },
      w = s => {
        i(s.target.value);
      },
      D = s => {
        if (s.key !== 'ArrowDown' && s.key !== 'ArrowUp') {
          s.stopPropagation();
          return;
        }
        (s.preventDefault(), s.stopPropagation());
        const x = [...(s.currentTarget.closest('[role=menu]')?.querySelectorAll('[role^=menuitem]') ?? [])];
        (s.key === 'ArrowDown' ? x[0] : x.at(-1))?.focus();
      },
      H = s => {
        E && (s.preventDefault(), requestAnimationFrame(() => T.current?.focus({preventScroll: true})));
      };
    (0, d.useEffect)(() => {
      isOpen || (i(''), ke(g.current));
    }, [isOpen]);
    const U = s =>
        (0, e.jsx)(
          V,
          {
            checked: isModelSelected(s.provider, s.id),
            onCheckedChange: O(s),
            children: (0, e.jsx)('span', {className: 'grow truncate', children: s.shortName}),
          },
          Oe({provider: s.provider, modelId: s.id}),
        ),
      G = submenu ? J : me,
      A = submenu ? Y : he;
    return (0, e.jsxs)(G, {
      open: isOpen,
      onOpenChange,
      children: [
        submenu ? (0, e.jsx)(q, {nativeButton: true, render: _, children: K}) : (0, e.jsx)(ue, {render: _}),
        isAvailableModelsLoading &&
          (0, e.jsx)(A, {
            size: menuSize,
            align: submenu ? 'start' : 'end',
            className: 'w-48 text-center text-balance',
            children: (0, e.jsx)(Ce, {className: 'mx-auto'}),
          }),
        !isAvailableModelsLoading &&
          !selectableProviders.length &&
          (0, e.jsx)(A, {
            size: menuSize,
            align: submenu ? 'start' : 'end',
            className: 'w-48 text-center text-balance',
            children: isAvailableModelsError
              ? (0, e.jsx)(ModelsError, {onRetry: retryAvailableModels})
              : (0, e.jsx)(NoModels, {}),
          }),
        !isAvailableModelsLoading &&
          selectableProviders.length > 0 &&
          (0, e.jsx)(A, {
            size: menuSize,
            align: submenu ? 'start' : 'end',
            className: 'w-48',
            children: (0, e.jsxs)('div', {
              children: [
                (0, e.jsxs)(De, {
                  className: 'mb-1 border-0! bg-transparent! shadow-none ring-0!',
                  children: [
                    (0, e.jsx)(Ee, {align: 'inline-start', children: (0, e.jsx)(Ke, {className: 'size-4'})}),
                    (0, e.jsx)(Re, {
                      ref: T,
                      autoFocus: true,
                      value: P,
                      placeholder: 'Search models',
                      onChange: w,
                      onKeyDown: D,
                    }),
                  ],
                }),
                (0, e.jsxs)('div', {
                  className: '-mx-1.5 max-h-72 overflow-y-auto px-1.5',
                  onPointerMoveCapture: H,
                  children: [
                    !b.length &&
                      (0, e.jsx)('p', {
                        className: 'text-muted-foreground px-2.5 py-2 text-sm',
                        children: 'No matching models',
                      }),
                    !y &&
                      b[0]?.provider.state === 'auth-expired' &&
                      (0, e.jsx)(ExpiredProvider, {provider: b[0].provider}),
                    !y && b[0]?.provider.state === 'active' && (0, e.jsx)(X, {children: b[0].models.map(U)}),
                    y &&
                      E &&
                      b.map(({provider, models}, n) =>
                        (0, e.jsxs)(
                          d.Fragment,
                          {
                            children: [
                              n > 0 && (0, e.jsx)(Z, {}),
                              provider.state === 'auth-expired'
                                ? (0, e.jsx)(ExpiredProvider, {provider})
                                : (0, e.jsxs)(X, {
                                    children: [
                                      (0, e.jsxs)(pe, {
                                        className: 'flex items-center gap-1.5 select-none',
                                        children: [
                                          (0, e.jsx)(ee, {
                                            provider: provider.id,
                                            className: 'text-muted-foreground/60 -mx-0.5 size-3.5',
                                          }),
                                          (0, e.jsx)('span', {children: providerLabel(provider.name)}),
                                        ],
                                      }),
                                      models.map(U),
                                    ],
                                  }),
                            ],
                          },
                          provider.id,
                        ),
                      ),
                    y &&
                      !E &&
                      b.map(({provider, models}) =>
                        (0, e.jsx)(
                          d.Fragment,
                          {
                            children:
                              provider.state === 'auth-expired'
                                ? (0, e.jsx)(ExpiredProvider, {provider})
                                : (0, e.jsxs)(J, {
                                    children: [
                                      (0, e.jsxs)(q, {
                                        children: [
                                          (0, e.jsx)(ee, {
                                            provider: provider.id,
                                            className: 'text-muted-foreground -mx-0.5 size-4',
                                          }),
                                          (0, e.jsx)('span', {
                                            className: 'grow truncate',
                                            children: providerLabel(provider.name),
                                          }),
                                        ],
                                      }),
                                      (0, e.jsx)(Y, {
                                        size: menuSize,
                                        className: 'max-h-64 w-52 overflow-y-auto',
                                        children: models.map(U),
                                      }),
                                    ],
                                  }),
                          },
                          provider.id,
                        ),
                      ),
                  ],
                }),
                !E &&
                  (0, e.jsxs)(e.Fragment, {
                    children: [
                      allowDefaultOption &&
                        (0, e.jsxs)(e.Fragment, {
                          children: [
                            (0, e.jsx)(Z, {}),
                            (0, e.jsx)(V, {
                              checked: isUsingDefaultValue,
                              onCheckedChange: R,
                              children: defaultOptionLabel,
                            }),
                          ],
                        }),
                      children,
                    ],
                  }),
              ],
            }),
          }),
      ],
    });
  } /** The thinking menu: reasoning level and speed. */,
  kr = ({render, menuSize = 'md', ...a}) => {
    const {
        selectedModel,
        isThinkingOpen,
        onThinkingOpenChange,
        onChange,
      } = ne(),
      N = (0, d.useRef)(null),
      k = selectedModel ? je(selectedModel.availableThinkingLevels) : [],
      F = selectedModel ? ie[selectedModel.thinkingLevel] : 'Thinking level',
      C = k.length > 0,
      B = ve({
        defaultTagName: 'button',
        props: de(
          {
            ref: N,
            children: (0, e.jsxs)(e.Fragment, {
              children: [
                (0, e.jsx)('span', {className: 'grow truncate', children: F}),
                selectedModel?.fastMode && (0, e.jsx)('span', {className: 'opacity-50', children: 'Fast'}),
                (0, e.jsx)(fe, {className: 'text-muted-foreground size-3.5! opacity-50', 'data-icon': 'inline-end'}),
              ],
            }),
          },
          a,
        ),
        render,
        state: {slot: 'thinking-level-selector-trigger'},
      }),
      L = i => f => {
        selectedModel &&
          f &&
          (onChange({
            provider: selectedModel.provider,
            modelId: selectedModel.modelId,
            thinkingLevel: i,
            fastMode: selectedModel.fastMode,
          }),
          onThinkingOpenChange(false));
      },
      g = i => {
        selectedModel &&
          onChange({
            provider: selectedModel.provider,
            modelId: selectedModel.modelId,
            thinkingLevel: selectedModel.thinkingLevel,
            fastMode: i === 'fast',
          });
      },
      T = i => {
        i.preventDefault();
      },
      P = i => {
        if (i.defaultPrevented || i.metaKey || i.ctrlKey || i.altKey || i.shiftKey || !C) return;
        const b = k[Number(i.key) - 1];
        b && (i.preventDefault(), i.stopPropagation(), L(b)(true));
      };
    return (
      (0, d.useEffect)(() => {
        isThinkingOpen || ke(N.current);
      }, [isThinkingOpen]),
      !selectedModel || (!selectedModel.supportsFastMode && !C)
        ? null
        : (0, e.jsxs)(me, {
            open: isThinkingOpen,
            onOpenChange: onThinkingOpenChange,
            children: [
              (0, e.jsx)(ue, {render: B}),
              (0, e.jsxs)(he, {
                align: 'end',
                size: menuSize,
                onKeyDownCapture: P,
                onPointerMoveCapture: T,
                children: [
                  C &&
                    (0, e.jsxs)(X, {
                      children: [
                        (0, e.jsxs)(pe, {
                          className: 'flex items-center justify-between gap-3',
                          children: [
                            (0, e.jsx)('span', {children: 'Reasoning'}),
                            (0, e.jsx)(Ge, {children: ze('Meta+Shift+.')}),
                          ],
                        }),
                        k.map(i =>
                          (0, e.jsx)(
                            V,
                            {
                              checked: selectedModel.thinkingLevel === i,
                              onCheckedChange: L(i),
                              children: (0, e.jsx)('span', {children: ie[i]}),
                            },
                            i,
                          ),
                        ),
                      ],
                    }),
                  selectedModel.supportsFastMode &&
                    (0, e.jsxs)(e.Fragment, {
                      children: [
                        C && (0, e.jsx)(Z, {}),
                        (0, e.jsxs)(J, {
                          children: [
                            (0, e.jsxs)(q, {
                              children: [
                                (0, e.jsx)(Fe, {className: 'text-muted-foreground size-3.5'}),
                                (0, e.jsx)('span', {className: 'pr-3 text-sm font-medium', children: 'Speed'}),
                              ],
                            }),
                            (0, e.jsx)(Y, {
                              size: menuSize,
                              onPointerMoveCapture: T,
                              children: (0, e.jsxs)(Pe, {
                                value: selectedModel.fastMode ? 'fast' : 'default',
                                onValueChange: g,
                                children: [
                                  (0, e.jsxs)(W, {
                                    children: [
                                      (0, e.jsx)(re, {
                                        render: (0, e.jsx)(le, {value: 'default'}),
                                        children: 'Standard',
                                      }),
                                      (0, e.jsx)(te, {
                                        side: 'right',
                                        children: 'The default speed with normal credit usage.',
                                      }),
                                    ],
                                  }),
                                  (0, e.jsxs)(W, {
                                    children: [
                                      (0, e.jsx)(re, {render: (0, e.jsx)(le, {value: 'fast'}), children: 'Fast'}),
                                      (0, e.jsx)(te, {
                                        side: 'right',
                                        children: 'Faster speed with extra credit usage.',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
            ],
          })
    );
  },
  ExpiredProvider = ({provider}) =>
    (0, e.jsxs)(Ie, {
      disabled: true,
      children: [
        (0, e.jsx)(ee, {provider: provider.id, className: 'text-muted-foreground -mx-0.5 size-4'}),
        (0, e.jsxs)('span', {
          className: 'flex min-w-0 grow items-center gap-1',
          children: [
            (0, e.jsx)('span', {className: 'block grow truncate', children: providerLabel(provider.name)}),
            (0, e.jsx)('span', {className: 'text-muted-foreground block text-xs', children: 'Expired'}),
          ],
        }),
      ],
    }),
  providerLabel = r => r.replace(' Subscription', ''),
  NoModels = () => {
    const {accountId} = ce();
    return (0, e.jsxs)('div', {
      className: 'space-y-0.5 px-4 py-2 text-center',
      children: [
        (0, e.jsx)('p', {className: 'text-foreground text-sm', children: 'No models are available'}),
        (0, e.jsxs)('p', {
          className: 'text-muted-foreground text-sm',
          children: [
            'Open',
            ' ',
            (0, e.jsx)(be, {
              className: 'hover:text-primary underline transition-colors',
              to: xe(`/u/${accountId}/settings/model`),
              children: 'Settings',
            }),
            ' ',
            'to connect a model provider.',
          ],
        }),
      ],
    });
  },
  ModelsError = ({onRetry}) =>
    (0, e.jsxs)('div', {
      className: 'space-y-0.5 px-4 py-2 text-center',
      children: [
        (0, e.jsx)('p', {className: 'text-foreground text-sm', children: "Couldn't load models"}),
        (0, e.jsx)('button', {
          type: 'button',
          className: 'text-muted-foreground hover:text-primary text-sm underline transition-colors',
          onClick: onRetry,
          children: 'Try again',
        }),
      ],
    }),
  Je = (r, o, a) => ({effectiveValue: r ?? o ?? null, isUsingDefaultValue: !!(a && r === null)}),
  ne = () => {
    const r = (0, d.use)(Me);
    if (!r) throw new Error('ModelSelector must be used within ModelSelect.');
    return r;
  },
  shortcutFor = r => {
    if (r.defaultPrevented || !$e(r) || !r.shiftKey || r.altKey || r.isComposing) return null;
    const o = r.key.toLowerCase();
    return o === 'm' || r.code === 'KeyM' ? 'model' : o === '.' || r.code === 'Period' ? 'thinking' : null;
  } /** Opens the menu a shortcut names, remembering where focus was. */,
  handleShortcut = (r, o, a) => {
    const t = shortcutFor(r);
    if (!t || (t === 'thinking' && !a)) return;
    const c = o?.closest('[data-model-select-shortcuts]'),
      u = c?.querySelector(`[data-model-select-shortcut="${t}"]`);
    !u ||
      u.disabled ||
      (r.preventDefault(),
      r.stopPropagation(),
      c && document.activeElement instanceof HTMLElement && se.set(c, document.activeElement),
      u.click());
  } /** Puts focus back where it was before a shortcut opened a menu. */,
  ke = r => {
    const o = r?.closest('[data-model-select-shortcuts]'),
      a = o ? se.get(o) : void 0;
    !o || !a || (se.delete(o), window.setTimeout(() => a.isConnected && a.focus(), 0));
  },
  triggerLabel = (r, o, a, t) => (r ? r.modelShortName.replace(/^Claude\s+/, '') : (t ?? (o ? a : 'Select model'))),
  matchesQuery = (r, o, a) => (a ? [r.shortName, r.name, r.id, o.name].some(t => t.toLowerCase().includes(a)) : true),
  je = r => r.filter(o => o !== 'off' && o !== 'minimal'),
  ye = r => (r.length ? ge('max', r) : void 0),
  Se = (r, o = false) => ({
    provider: r.provider,
    modelId: r.id,
    thinkingLevel: Ae(r.availableThinkingLevels),
    fastMode: r.supportsFastMode ? o : false,
  })
