/* Aux-owned source, composer pass 3: the toolbar, the model menu, queued messages and the composer
 * shell (assets/session-composer-Dc0LRfZA.js, from the fast-mode lookup to the composer footer).
 * Names the chunk uses elsewhere keep their chunk names, among them: Lo MiniPopupMenu, Bo its
 * content, Bp useAnchoredLayer, R1 withNativePicker, E1 onPopupBlur, Wp ModelSelect, Vo/ef/zo the
 * session, composer and mode providers, Uo the + menu, tf/D1/F1/rf/sf/af toolbar controls, Qt
 * ModeSlot, of/cf ComposerBody and ComposerInput, lf ComposerCard, uf ComposerFooter, Ts the footer
 * group, Ss/Ps/nr/_o/Mn/jn/In the shared contexts and sets. Locals named in props keep the prop's
 * name; the rest stay short where the supplied code had them.
 * Chunk names used: a JSX runtime, g React, Y cn, me useSession, ge useApp, ot session client,
 * Tt useEditor, xt streaming state, fr mode, zt queue, ir analytics, Ta model options, Nt models,
 * ht search, na model id, It/gt/Es menu parts, Lc/Dc/Oc dnd-kit, Rl editor document, Qs pencil icon,
 * Qi session context, Mu send button, Rp fast-mode schema.
 * Aux change: the composer card, the queue and question cards and the drop overlay take the 12px
 * scale corner (rounded-xl) instead of the 16px 2xl step, matching the mini popup's composer. */
/** The fast-mode details a model reports in its diagnostics, latest first. */
function fastModeDetails(e) {
  const t = e.diagnostics ?? [];
  for (let n = t.length - 1; n >= 0; n--) {
    const r = t[n];
    if (r?.type === 'model_fast_mode') return Rp.safeParse(r.details).data;
  }
}
var /** Where the mini popup opens a menu window: beside its anchor, kept on screen. */
  popupPosition = ({anchor, screen, screenX, screenY, size}) => {
    const o = screenX + anchor.left,
      i = screenY + anchor.top,
      c = o + size.width <= screen.availLeft + screen.availWidth ? o : o + anchor.width - size.width,
      l = i - size.height - 4 >= screen.availTop ? i - size.height - 4 : i + anchor.height + 4;
    return {left: Math.round(c), top: Math.round(l)};
  },
  optionsPageUrl = e => {
    const t = new URL(e),
      n = new URL('minipopup-options.html', t);
    return ((n.search = t.search), n);
  },
  AnchoredLayerContext = (0, g.createContext)(
    null,
  ) /** MiniPopupMenu: menus in the mini popup open as their own small window, anchored to the trigger. */,
  Lo = ({
    defaultOpen,
    highlightItemOnHover = false,
    onNarrowMorphHeightChange,
    onOpenChange,
    open,
    optionsSize,
    ...i
  }) => {
    const [c, l] = (0, g.useState)(defaultOpen ?? false),
      [u, h] = (0, g.useState)(null),
      [d, m] = (0, g.useState)(),
      p = open ?? c,
      f = (0, g.useCallback)(
        C => {
          (m(C), onNarrowMorphHeightChange?.(C));
        },
        [onNarrowMorphHeightChange],
      ),
      x = (0, g.useCallback)(
        (C, S) => {
          (l(C), C || m(void 0), onOpenChange?.(C, S));
        },
        [onOpenChange],
      ),
      b = (0, g.useCallback)(() => {
        p && x(false, void 0);
      }, [p, x]),
      v = (0, g.useMemo)(
        () => ({close: b, narrowMorphHeight: d, open: p, optionsSize, setTrigger: h, trigger: u}),
        [p, b, d, optionsSize, u],
      );
    return (0, a.jsx)(AnchoredLayerContext, {
      value: v,
      children: (0, a.jsx)(It, {
        defaultOpen,
        forceNarrow: true,
        highlightItemOnHover,
        narrowMorphScale: false,
        onNarrowMorphHeightChange: f,
        onOpenChange: x,
        open,
        ...i,
      }),
    });
  },
  Ss = ({ref, ...t}) => {
    const n = (0, g.useContext)(AnchoredLayerContext),
      r = dl(ref, n?.setTrigger);
    return (0, a.jsx)(Vt, {ref: r, 'data-slot': 'dropdown-menu-trigger', ...t});
  },
  Bo = ({className, children, ref, size = 'md', style, ...o}) => {
    const i = (0, g.useContext)(AnchoredLayerContext),
      [c, l] = (0, g.useState)(null),
      [u, h] = (0, g.useState)(null),
      [d, m] = (0, g.useState)(),
      p = useMenuLayer(i, d),
      f = i?.optionsSize.width,
      x = i?.optionsSize.maxHeight,
      b = i?.optionsSize.fitWidth ?? false,
      v = Y(
        'text-surface-primary-foreground pointer-events-auto overflow-x-hidden overflow-y-auto bg-transparent p-1.5 outline-none data-[size=sm]:p-1',
        className,
      );
    return (
      (0, g.useLayoutEffect)(() => {
        if (!i?.open) {
          m(void 0);
          return;
        }
        if (p || !c || !u || f === void 0 || x === void 0) return;
        const C = () => {
            const y = getComputedStyle(c),
              k =
                u.scrollHeight +
                Number.parseFloat(y.paddingTop) +
                Number.parseFloat(y.paddingBottom) +
                Number.parseFloat(y.borderTopWidth) +
                Number.parseFloat(y.borderBottomWidth);
            m({
              width: b ? Math.ceil(c.getBoundingClientRect().width) : f,
              height: Math.max(1, Math.min(x, Math.ceil(k))),
            });
          },
          S = new ResizeObserver(C);
        return (S.observe(c), S.observe(u), C(), () => S.disconnect());
      }, [i?.open, b, p, x, u, c, f]),
      !i?.open || f === void 0 || x === void 0
        ? null
        : p
          ? (0, a.jsx)(gt, {
              ref,
              align: 'start',
              alignOffset: 0,
              className: Y(v, 'max-h-screen min-h-0 w-screen px-1.5 data-[size=sm]:px-1 data-[size=sm]:py-[3px]'),
              portalContainer: p.container,
              positionerProps: {
                anchor: p.anchor,
                className: 'pointer-events-none isolate z-50 w-screen outline-none',
                collisionAvoidance: {side: 'none', align: 'none', fallbackAxisSide: 'none'},
                collisionPadding: 0,
                positionMethod: 'fixed',
                style: {position: 'fixed', top: 0, left: 0, width: '100vw', transform: 'none'},
              },
              side: 'bottom',
              sideOffset: 0,
              size,
              style,
              narrowMorph: true,
              unstyled: true,
              ...o,
              children: (0, a.jsx)('div', {
                className: 'flex h-full min-h-0 flex-col',
                'data-slot': 'mini-popup-options-content',
                children,
              }),
            })
          : (0, a.jsx)(gt, {
              ref: l,
              align: 'start',
              alignOffset: 0,
              className: Y(v, 'animate-none! transition-none!'),
              positionerProps: {
                className: 'pointer-events-none fixed -left-[10000px] top-0 isolate z-50 outline-none',
                collisionAvoidance: {side: 'none', align: 'none', fallbackAxisSide: 'none'},
                collisionPadding: 0,
                positionMethod: 'fixed',
                style: {position: 'fixed', top: 0, left: -1e4, width: f, transform: 'none', visibility: 'hidden'},
              },
              side: 'bottom',
              sideOffset: 0,
              size,
              style: {...style, width: b ? 'max-content' : f, maxWidth: f, maxHeight: x},
              unstyled: true,
              ...o,
              children: (0, a.jsx)('div', {ref: h, 'data-slot': 'mini-popup-options-measurement-body', children}),
            })
    );
  },
  useMenuLayer = (e, t) => {
    const n = e?.optionsSize.maxHeight,
      r = e?.narrowMorphHeight ?? e?.optionsSize.height ?? Math.min(t?.height ?? 1, n ?? 1);
    return Bp({
      anchor: e?.trigger ?? null,
      onDismiss: e?.close,
      open: !!(e?.open && n !== void 0 && t !== void 0),
      optionsSize: {width: t?.width ?? 1, height: r},
    });
  },
  Ps = new Set(),
  blurListeners = new Set(),
  pickersOpen = 0 /** Tells the popup it lost focus, unless a native picker is open. */,
  nr = () => {
    pickersOpen || blurListeners.forEach(e => e('blurred'));
  } /** Runs a native picker without the popup closing under it. */,
  R1 = async e => {
    pickersOpen++;
    try {
      return await e;
    } finally {
      (pickersOpen--, nr());
    }
  },
  E1 = e => (
    blurListeners.add(e),
    () => {
      blurListeners.delete(e);
    }
  ) /** useAnchoredLayer: a floating layer anchored to an element, dismissed on blur, Escape or outside clicks. */,
  Bp = ({anchor, focus = true, onDismiss, open, optionsSize}) => {
    const [o, i] = (0, g.useState)(null),
      c = (0, g.useRef)(null),
      l = (0, g.useRef)(false),
      u = (0, g.useRef)(onDismiss),
      {height, width} = optionsSize;
    (0, g.useLayoutEffect)(() => {
      u.current = onDismiss;
    });
    const m = (0, g.useCallback)(p => {
      const f = u.current;
      p.key !== 'Escape' ||
        !f ||
        (p.preventDefault(),
        f(),
        window.focus(),
        document.querySelector('[data-testid="chat-input"]')?.focus({preventScroll: true}));
    }, []);
    return (
      (0, g.useLayoutEffect)(() => {
        if (!open) return;
        const p = f => {
          (f.target instanceof Element && f.target.closest('[data-slot="dropdown-menu-trigger"]')) || u.current?.();
        };
        return (
          window.addEventListener('pointerdown', p, true),
          window.addEventListener('keydown', m, true),
          () => {
            (window.removeEventListener('pointerdown', p, true), window.removeEventListener('keydown', m, true));
          }
        );
      }, [m, open]),
      (0, g.useLayoutEffect)(() => {
        if (!open || !anchor || l.current) return;
        l.current = true;
        const {left, top} = popupPosition({
            anchor: anchor.getBoundingClientRect(),
            screen: window.screen,
            screenX: window.screenX,
            screenY: window.screenY,
            size: {width, height},
          }),
          x = optionsPageUrl(window.location.href);
        (x.searchParams.set('left', String(left)),
          x.searchParams.set('top', String(top)),
          x.searchParams.set('width', String(width)),
          x.searchParams.set('height', String(height)),
          x.searchParams.set('focus', String(focus)));
        const b = window.open(x.href, '_blank', 'popup=yes');
        if (!b) {
          u.current?.();
          return;
        }
        (focus && (Ps.add(b), b.addEventListener('blur', nr), blurListeners.forEach(S => S('opened'))),
          b.addEventListener('keydown', m, true));
        const v = () => u.current?.(),
          C = () => {
            const S = b.document.getElementById('mini-popup-options-root');
            if (!S) return;
            b.removeEventListener('load', C);
            const y = b;
            ((b.document.documentElement.className = document.documentElement.className),
              (b.document.body.className = document.body.className),
              i({anchor: () => ({getBoundingClientRect: () => new y.DOMRect(0, 0, 0, 0)}), container: S, popup: b}),
              b.addEventListener('pagehide', v, {once: true}));
          };
        ((c.current = () => {
          const S = !b.closed && b.document.hasFocus();
          (Ps.delete(b),
            b.removeEventListener('blur', nr),
            b.removeEventListener('keydown', m, true),
            b.removeEventListener('load', C),
            b.removeEventListener('pagehide', v),
            b.closed || b.close(),
            S && window.focus(),
            (c.current = null));
        }),
          b.addEventListener('load', C),
          C());
      }, [anchor, m, focus, height, open, width]),
      (0, g.useLayoutEffect)(() => {
        open || (c.current?.(), (l.current = false), i(null));
      }, [open]),
      (0, g.useLayoutEffect)(() => {
        !open || !o || o.popup.closed || o.popup.chrome?.auxMiniPopup?.setOptionWindowSize(width, height);
      }, [height, o, open, width]),
      (0, g.useLayoutEffect)(
        () => () => {
          c.current?.();
        },
        [],
      ),
      o
    );
  } /** The model menu: providers, models, thinking level and fast mode, with search. */,
  ModelMenuContent = ({model, variant, showThinkingLevel, children}) => {
    const {
        isOpen,
        isThinkingOpen,
        onOpenChange,
        onThinkingOpenChange,
        proactiveMode,
        selectableProviders,
        getModels,
        onChange,
      } = Ta(),
      m = (0, g.useRef)(null),
      p = (0, g.useRef)(null),
      [f] = (0, g.useState)(() => sl()),
      [x, b] = (0, g.useState)(null),
      v = (0, g.useRef)(null),
      C = (0, g.useRef)(null),
      {availableModels} = on(),
      k = availableModels.find(E => E.provider === model.provider && E.id === model.modelId),
      M = k ? Ml(k.availableThinkingLevels) : [],
      R = (0, g.useMemo)(() => {
        const E = selectableProviders
            .map(F => ({id: F.id, name: F.name, models: getModels(F.id)}))
            .filter(F => F.models.length > 0),
          ee = E.findIndex(F => F.id === model.provider);
        return (ee > 0 && E.unshift(...E.splice(ee, 1)), E);
      }, [getModels, model.provider, selectableProviders]),
      j = R.length > 1,
      N = j ? R.find(E => E.id === x)?.id : R[0]?.id,
      O = MODEL_LIST_PADDING + Math.min(Math.max(R.length, 1), MODEL_ROWS_VISIBLE) * MODEL_ROW_HEIGHT,
      W = N ? (j ? MODEL_MENU_MAX_HEIGHT : MODEL_LIST_HEIGHT) : O,
      se = showThinkingLevel && k && (M.length > 0 || k.supportsFastMode),
      U = E => {
        (onOpenChange(E), E || Gr(m.current));
      },
      ae = E => {
        (onThinkingOpenChange(E), E || Gr(p.current));
      },
      _ = E => {
        const ee = availableModels.find(F => modelKey(F) === E);
        ee && (onChange(kl(ee, model.fastMode)), onOpenChange(false));
      },
      ce = (E, ee) => {
        E !== x && ((C.current = {previousProviderId: x, viaKeyboard: ee}), b(E));
      },
      le = E => ee => ce(E, ee.detail === 0),
      V = E => ee => {
        ee.key === 'ArrowRight' && ce(E, true);
      },
      K = E => {
        j && E.key === 'ArrowLeft' && ce(null, true);
      },
      ne = (E, ee = false) => {
        (onChange({...model, thinkingLevel: E, proactiveMode: ee}), onThinkingOpenChange(false));
      },
      he =
        (E, ee = false) =>
        F => {
          F && ne(E, ee);
        },
      X = E => {
        if (E.defaultPrevented || E.metaKey || E.ctrlKey || E.altKey || E.shiftKey) return;
        const F = M[Number(E.key) - 1];
        F && (E.preventDefault(), E.stopPropagation(), ne(F));
      };
    ((0, g.useLayoutEffect)(() => {
      const E = C.current,
        ee = v.current;
      if (!E || !ee) return;
      C.current = null;
      const F = Array.from(ee.querySelectorAll('[data-provider-pane]')).find(fe => fe.dataset.providerPane === x);
      (E.viaKeyboard
        ? x
          ? (F?.querySelector('[aria-checked=true]') ?? F?.querySelector('[role=menuitemradio]'))
          : Array.from(ee.querySelectorAll('[data-provider-row]')).find(
              fe => fe.dataset.providerRow === E.previousProviderId,
            )
        : ee.closest('[role=menu]')
      )?.focus({preventScroll: true});
    }, [x]),
      (0, g.useEffect)(() => {
        isOpen || b(null);
      }, [isOpen]));
    const re = (0, a.jsx)(ac, {ref: m, model, shortName: k?.shortName, showThinkingLevel: !!se, open: isOpen}),
      ue = (0, a.jsx)(Pe, {
        handle: f,
        payload: 'model',
        render: (0, a.jsx)('span', {className: 'inline-flex min-w-0'}),
        children:
          variant === 'main'
            ? (0, a.jsx)(Sl, {
                menuSize: 'sm',
                render: ({children, ...ee}) => (0, g.cloneElement)(re, Qo(re.props, ee)),
                children,
              })
            : (0, a.jsx)(Ss, {render: re}),
      });
    return (0, a.jsxs)('div', {
      className: 'flex min-w-0 items-center',
      'data-model-select-shortcuts': true,
      children: [
        (0, a.jsx)(Pl, {thinking: !!se}),
        variant === 'main'
          ? ue
          : (0, a.jsxs)(Lo, {
              open: isOpen,
              optionsSize: {width: 280, maxHeight: MODEL_MENU_MAX_HEIGHT, fitWidth: true, height: W},
              onOpenChange: U,
              children: [
                ue,
                (0, a.jsx)(Bo, {
                  className: 'flex h-screen flex-col overflow-hidden !p-0',
                  finalFocus: false,
                  size: 'sm',
                  children: (0, a.jsxs)('div', {
                    ref: v,
                    className: 'grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden',
                    children: [
                      !R.length &&
                        (0, a.jsx)('p', {
                          className: 'text-muted-foreground col-start-1 row-start-1 self-center text-center text-sm',
                          children: 'No models available',
                        }),
                      j &&
                        (0, a.jsx)(Un, {
                          inert: !!N,
                          className: Y(
                            MENU_PANE,
                            SCROLLBAR_VISIBLE,
                            'p-1',
                            N && [MENU_PANE_HIDDEN, 'translate-x-full'],
                          ),
                          style: {height: O},
                          children: R.map(E =>
                            (0, a.jsxs)(
                              We,
                              {
                                className: 'h-8',
                                closeOnClick: false,
                                nativeButton: true,
                                render: (0, a.jsx)('button', {disabled: !!N, className: 'w-full text-left'}),
                                'data-provider-row': E.id,
                                onClick: le(E.id),
                                onKeyDown: V(E.id),
                                children: [
                                  (0, a.jsx)(zn, {className: 'text-muted-foreground size-4', provider: E.id}),
                                  (0, a.jsx)('span', {className: 'grow truncate', children: E.name}),
                                  (0, a.jsx)('span', {
                                    className: 'text-muted-foreground text-xs tabular-nums',
                                    children: E.models.length,
                                  }),
                                  (0, a.jsx)(cr, {className: 'text-muted-foreground size-3.5'}),
                                ],
                              },
                              E.id,
                            ),
                          ),
                        }),
                      R.map(E =>
                        (0, a.jsxs)(
                          'div',
                          {
                            className: Y(MENU_PANE, E.id !== N && [MENU_PANE_HIDDEN, '-translate-x-full']),
                            'data-provider-pane': E.id,
                            inert: E.id !== N,
                            onKeyDown: K,
                            children: [
                              j &&
                                (0, a.jsxs)('div', {
                                  className:
                                    'grid h-8 shrink-0 grid-cols-[1.5rem_1fr_1.5rem] items-center gap-1 border-b px-1',
                                  children: [
                                    (0, a.jsx)(J, {
                                      'aria-label': 'All providers',
                                      size: 'icon-xs',
                                      variant: 'ghost',
                                      onClick: le(null),
                                      children: (0, a.jsx)(Zl, {className: 'size-3.5'}),
                                    }),
                                    (0, a.jsxs)('span', {
                                      className:
                                        'flex min-w-0 items-center justify-center gap-1.5 text-[13px] font-medium',
                                      children: [
                                        (0, a.jsx)(zn, {className: 'text-muted-foreground size-3.5', provider: E.id}),
                                        (0, a.jsx)('span', {className: 'truncate', children: E.name}),
                                      ],
                                    }),
                                  ],
                                }),
                              (0, a.jsx)(Un, {
                                className: Y(SCROLLBAR_VISIBLE, 'shrink-0 p-1'),
                                style: {height: MODEL_LIST_HEIGHT},
                                viewportRef: scrollCheckedIntoView,
                                children: (0, a.jsx)(Os, {
                                  value: na(model),
                                  onValueChange: _,
                                  children: E.models.map(ee =>
                                    (0, a.jsx)(ModelMenuItem, {model: ee, inactive: E.id !== N}, modelKey(ee)),
                                  ),
                                }),
                              }),
                            ],
                          },
                          E.id,
                        ),
                      ),
                    ],
                  }),
                }),
              ],
            }),
        se &&
          (0, a.jsxs)(ModelMenuRoot, {
            variant,
            open: isThinkingOpen,
            optionsSize: {width: k.supportsFastMode ? 160 : 130, maxHeight: 320},
            onOpenChange: ae,
            children: [
              (0, a.jsx)(Pe, {
                handle: f,
                payload: 'thinking',
                render: (0, a.jsx)('span', {className: 'inline-flex min-w-0'}),
                children: (0, a.jsx)(Ss, {
                  render: (0, a.jsx)(ic, {
                    ref: p,
                    label: (0, a.jsx)('span', {className: 'opacity-80', children: zr[model.thinkingLevel]}),
                  }),
                }),
              }),
              (0, a.jsxs)(ModelMenuPopup, {
                variant,
                size: 'sm',
                onKeyDownCapture: X,
                children: [
                  M.length
                    ? (0, a.jsxs)(ft, {
                        children: [
                          M.map(E =>
                            (0, a.jsx)(
                              Us,
                              {checked: model.thinkingLevel === E, onCheckedChange: he(E), children: zr[E]},
                              E,
                            ),
                          ),
                        ],
                      })
                    : null,
                  k.supportsFastMode &&
                    (0, a.jsxs)(ft, {
                      children: [
                        M.length ? (0, a.jsx)(_t, {}) : null,
                        (0, a.jsx)(Zs, {children: 'Options'}),
                        (0, a.jsx)(ModelMenuFooter, {model, variant}),
                      ],
                    }),
                ],
              }),
            ],
          }),
        (0, a.jsx)(Ae, {
          handle: f,
          children: ({payload}) =>
            (0, a.jsxs)(Ie, {
              travel: true,
              children: [
                payload === 'thinking' ? 'Effort' : 'Model',
                (0, a.jsx)(ja, {children: ml(payload === 'thinking' ? 'Meta+Shift+.' : 'Meta+Shift+M')}),
              ],
            }),
        }),
      ],
    });
  },
  ModelMenuFooter = ({model, variant}) => {
    const {proactiveMode, onChange} = Ta(),
      s = Nt(),
      [o, i] = (0, g.useState)(),
      c = ht(s, x => {
        let b;
        for (const v of [...Object.values(x.turnMessagesByKey), ...Object.values(x.messagesByKey), x.streamingMessage])
          v?.role !== 'assistant' ||
            v.provider !== model.provider ||
            v.model !== model.modelId ||
            (v.diagnostics?.some(C => C.type === 'model_fast_mode') && (!b || v.timestamp >= b.timestamp) && (b = v));
        return b;
      }),
      l = c ? fastModeDetails(c) : void 0,
      u = model.fastMode && l?.status === 'cooldown' ? l.retryAt : void 0,
      h = u !== void 0 && u !== o && u > Date.now(),
      d = h
        ? 'Using standard speed. Fast mode will resume automatically.'
        : l?.status === 'off' && !model.fastMode
          ? l.reason
          : void 0,
      m = x => onChange({...model, fastMode: x, proactiveMode}),
      p = () => m(!model.fastMode),
      f = x => x.stopPropagation();
    return (
      (0, g.useEffect)(() => {
        if (u === void 0 || !h) return;
        const x = setTimeout(() => i(u), Math.max(0, u - Date.now() + 1));
        return () => clearTimeout(x);
      }, [u, h]),
      (0, a.jsxs)(Ae, {
        children: [
          (0, a.jsx)(Pe, {
            render: (0, a.jsxs)(We, {
              closeOnClick: false,
              onClick: p,
              children: [
                (0, a.jsx)('span', {className: 'grow', children: 'Fast mode'}),
                (0, a.jsx)('span', {
                  onClick: f,
                  children: (0, a.jsx)(bl, {checked: model.fastMode, tabIndex: -1, onCheckedChange: m}),
                }),
              ],
            }),
          }),
          (0, a.jsx)(Ie, {
            side: variant === 'mini-popup' ? 'top' : 'right',
            children:
              d ??
              (0, a.jsxs)(a.Fragment, {
                children: ['Significantly faster', (0, a.jsx)('br', {}), 'consumes more usage'],
              }),
          }),
        ],
      })
    );
  },
  ModelMenuItem = ({model, inactive}) =>
    (0, a.jsx)(Es, {
      className: 'h-8',
      closeOnClick: true,
      nativeButton: true,
      render: (0, a.jsx)('button', {disabled: inactive, className: 'w-full text-left'}),
      value: modelKey(model),
      children: (0, a.jsx)('span', {className: 'truncate', children: model.shortName}),
    }),
  modelKey = e => na({provider: e.provider, modelId: e.id}),
  scrollCheckedIntoView = e => {
    const t = e?.querySelector('[aria-checked=true]');
    !e ||
      !t ||
      (e.scrollTop +=
        t.getBoundingClientRect().top - e.getBoundingClientRect().top - (e.clientHeight - t.offsetHeight) / 2);
  },
  MODEL_ROW_HEIGHT = 32,
  MODEL_LIST_PADDING = 8,
  MODEL_ROWS_VISIBLE = 5,
  MODEL_LIST_HEIGHT = 168,
  MODEL_MENU_MAX_HEIGHT = 200,
  SCROLLBAR_VISIBLE = '[&_[data-slot=scroll-area-scrollbar]]:opacity-100',
  MENU_PANE =
    'col-start-1 row-start-1 flex flex-col self-start transition-[translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
  MENU_PANE_HIDDEN = 'invisible transition-[translate,visibility]',
  ModelMenuRoot = ({variant, optionsSize, ...n}) =>
    variant === 'mini-popup' ? (0, a.jsx)(Lo, {optionsSize, ...n}) : (0, a.jsx)(It, {...n}),
  ModelMenuPopup = ({variant, ...t}) =>
    variant === 'mini-popup'
      ? (0, a.jsx)(Bo, {...t})
      : (0, a.jsx)(gt, {
          align: 'end',
          ...t,
        }) /** ModelSelect: the model button and its menu (a window in the mini popup, a dropdown elsewhere). */,
  Wp = ({
    variant = 'main',
    value,
    proactiveMode,
    persistDefaultOnChange = true,
    showThinkingLevel = true,
    onValueChange,
  }) => {
    const {currentSession, updateModel, updateRuntimeConfig} = me(),
      {accountId} = ge(),
      h = Ce(),
      d = vl(),
      m = value ?? currentSession.model,
      p = proactiveMode ?? currentSession.runtimeConfig.proactiveMode ?? false,
      f = (0, g.useCallback)(
        (C, S) => {
          d.mutate(
            {accountId, key: 'defaultModel', value: C},
            {
              onSuccess: (y, k, M, w) => {
                (Ri(accountId, C.provider, C.modelId, C.thinkingLevel, C.fastMode, S?.proactiveMode),
                  w.client.setQueryData(h.settings.getAll.queryKey({accountId}), I =>
                    I ? {...I, defaultModel: C} : void 0,
                  ));
              },
            },
          );
        },
        [accountId, h.settings.getAll, d],
      ),
      x = C => {
        if (!C) return;
        const S = {
            provider: C.provider,
            modelId: C.modelId,
            thinkingLevel: C.thinkingLevel ?? m.thinkingLevel,
            fastMode: C.fastMode ?? false,
          },
          y = C.proactiveMode ?? false;
        if ((persistDefaultOnChange && f(S, {proactiveMode: y}), onValueChange)) {
          onValueChange(S, {proactiveMode: y});
          return;
        }
        (updateModel({provider: S.provider, model: S.modelId, thinkingLevel: S.thinkingLevel, fastMode: S.fastMode}),
          p !== y && updateRuntimeConfig({proactiveMode: y}));
      },
      b = () => {
        br(`/u/${accountId}/settings/model`);
      },
      v = (0, g.useCallback)(() => {
        if (p) {
          if ((persistDefaultOnChange && f(m, {proactiveMode: false}), onValueChange)) {
            onValueChange(m, {proactiveMode: false});
            return;
          }
          updateRuntimeConfig({proactiveMode: false});
        }
      }, [p, m, onValueChange, persistDefaultOnChange, f, updateRuntimeConfig]);
    return (0, a.jsx)(jl, {
      value: m,
      proactiveMode: p,
      onChange: x,
      onInvalidProactiveMode: v,
      children: (0, a.jsxs)(ModelMenuContent, {
        model: m,
        variant,
        showThinkingLevel,
        children: [
          (0, a.jsx)(_t, {}),
          (0, a.jsxs)(We, {
            onClick: b,
            children: [
              (0, a.jsx)('span', {className: 'grow', children: 'Settings'}),
              (0, a.jsx)(cn, {className: 'text-muted-foreground -mr-1'}),
            ],
          }),
        ],
      }),
    });
  },
  QueueEditContext = (0, g.createContext)(
    null,
  ) /** Queued messages: send now, edit, reorder by dragging, or remove; paused after an interrupt. */,
  QueuedMessages = ({children}) => {
    const {currentSession} = me(),
      {mode} = fr(),
      r = zt(),
      s = ot(),
      {accountId} = ge(),
      {capture} = ir(),
      c = (0, g.useRef)(null),
      [l, u] = (0, g.useState)(null),
      [h, d] = (0, g.useState)(null),
      [m, p] = (0, g.useState)(false),
      f = (0, g.useRef)(false),
      x = Ce(),
      b = _e(),
      v = _ => {
        b.setQueryData(x.sessions.get.queryKey({sessionId: currentSession.id, accountId}), _);
      },
      C = _ => {
        de.error(_.message);
      },
      S = ve(x.sessions.moveQueuedMessage.mutationOptions({onSuccess: v, onError: C, onSettled: () => d(null)})),
      y = ve(x.sessions.removeQueuedMessage.mutationOptions({onSuccess: v, onError: C})),
      k = ve(x.sessions.updateQueuedMessage.mutationOptions({onSuccess: v})),
      M = io(currentSession).filter(_ => _.deliveryMode === 'queued');
    if (h) {
      const _ = new Map(h.map((ce, le) => [ce, le]));
      M.sort((ce, le) => (_.get(ce.message.timestamp) ?? h.length) - (_.get(le.message.timestamp) ?? h.length));
    }
    const w = mode === 'default' ? l : null;
    l && mode !== 'default' && u(null);
    const I = m || S.isPending || y.isPending || k.isPending || !!w || mode !== 'default',
      R = Vc(Wr(Bc, {activationConstraint: {distance: 4}}), Wr(Ec, {coordinateGetter: zc})),
      j = _ => _ === c.current,
      N = ({active, over}) => {
        if (I || !over || active.id === over.id) return;
        const le = M.findIndex(ne => ne.message.timestamp === active.id),
          V = M.findIndex(ne => ne.message.timestamp === over.id);
        if (le < 0 || V < 0) return;
        const K = Hc(M, le, V);
        (d(K.map(ne => ne.message.timestamp)),
          S.mutate({
            sessionId: currentSession.id,
            accountId,
            message: M[le].message,
            beforeTimestamp: K[V + 1]?.message.timestamp ?? null,
          }));
      },
      O = _ => async () => {
        if (!(I || f.current)) {
          ((f.current = true), p(true));
          try {
            _
              ? (await (r?.steer ?? s.steer)(_.metadata ? [_.metadata, _.message] : _.message),
                capture('tasks.steer', {sessionId: currentSession.id}))
              : (await (r?.continueConversation ?? s.continueConversation)(),
                capture('tasks.queue.resume', {sessionId: currentSession.id}));
          } catch (ce) {
            de.error(ce instanceof Error ? ce.message : 'Could not send queued message');
          } finally {
            ((f.current = false), p(false));
          }
        }
      },
      W = _ => () => u(_),
      se = () => u(null),
      U = _ => () => {
        y.mutate({sessionId: currentSession.id, accountId, message: _.message});
      },
      ae = async _ => {
        w && (await k.mutateAsync({sessionId: currentSession.id, accountId, message: w.message, text: _}), u(null));
      };
    return (0, a.jsxs)(QueueEditContext, {
      value: w ? {pending: k.isPending, onCancel: se} : null,
      children: [
        w && (0, a.jsx)(QueuedMessageEditor, {item: w, pending: k.isPending, onSave: ae}, w.message.timestamp),
        M.length > 0 &&
          (0, a.jsx)('div', {
            className: 'px-0.5 pt-1 pb-2',
            children: (0, a.jsxs)('div', {
              className: 'bg-surface-primary ring-border-surface overflow-hidden rounded-xl shadow-md ring-[0.5px]',
              children: [
                currentSession.status === 'interrupted' &&
                  (0, a.jsxs)('div', {
                    className: 'flex items-center gap-2 px-3 pt-2 text-xs',
                    children: [
                      (0, a.jsx)('span', {
                        className: 'text-muted-foreground min-w-0 flex-1',
                        children: 'Queue paused because you interrupted',
                      }),
                      (0, a.jsxs)(J, {
                        size: 'xs',
                        variant: 'outline',
                        disabled: I,
                        onClick: O(),
                        children: [(0, a.jsx)(Zc, {className: 'size-3'}), 'Resume'],
                      }),
                    ],
                  }),
                (0, a.jsxs)(_c, {
                  sensors: R,
                  modifiers: QUEUE_DRAG_MODIFIERS,
                  autoScroll: {canScroll: j},
                  collisionDetection: Kc,
                  onDragEnd: N,
                  children: [
                    (0, a.jsx)($c, {
                      items: M.map(_ => _.message.timestamp),
                      strategy: Rc,
                      children: (0, a.jsx)('ul', {
                        ref: c,
                        'aria-label': 'Queued messages',
                        className: 'flex max-h-52 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2 py-1.5',
                        children: M.map(_ =>
                          (0, a.jsx)(
                            SortableQueuedMessage,
                            {
                              item: _,
                              disabled: I,
                              reorderable: M.length > 1,
                              editing: w?.message.timestamp === _.message.timestamp,
                              onEdit: W(_),
                              onSendNow: O(_),
                              onRemove: U(_),
                            },
                            _.message.timestamp,
                          ),
                        ),
                      }),
                    }),
                    (0, a.jsx)(QueueDragOverlay, {queue: M}),
                  ],
                }),
              ],
            }),
          }),
        children,
      ],
    });
  },
  QUEUE_DRAG_MODIFIERS = [
    ({transform, draggingNodeRect, containerNodeRect}) =>
      !draggingNodeRect || !containerNodeRect
        ? {...transform, x: 0}
        : {
            ...transform,
            x: 0,
            y: Math.min(
              containerNodeRect.bottom - draggingNodeRect.bottom,
              Math.max(containerNodeRect.top - draggingNodeRect.top, transform.y),
            ),
          },
  ],
  SortableQueuedMessage = e => {
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = Lc({
      id: e.item.message.timestamp,
      disabled: e.disabled || !e.reorderable,
    });
    return (0, a.jsx)(QueuedMessage, {
      ...e,
      ref: setNodeRef,
      style: {
        transform: isDragging ? void 0 : Oc.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : void 0,
      },
      handleProps: {...attributes, ...listeners, ref: setActivatorNodeRef},
    });
  },
  QueueDragOverlay = ({queue}) => {
    const {active, activeNode} = Dc(),
      r = queue.find(i => i.message.timestamp === active?.id),
      [s, o] = (0, g.useState)(null);
    return (
      (0, g.useLayoutEffect)(() => {
        if (!activeNode) {
          o(null);
          return;
        }
        let i;
        const c = () => {
          const {left, width} = activeNode.getBoundingClientRect();
          (o(h => (h && h.left === left && h.width === width ? h : {left, width})), (i = requestAnimationFrame(c)));
        };
        return (c(), () => cancelAnimationFrame(i));
      }, [activeNode]),
      (0, kn.createPortal)(
        (0, a.jsx)(Uc, {
          dropAnimation: null,
          style: s ?? void 0,
          children:
            r &&
            (0, a.jsx)('ul', {
              'aria-hidden': true,
              children: (0, a.jsx)(QueuedMessage, {
                item: r,
                disabled: true,
                reorderable: true,
                editing: false,
                dragging: true,
              }),
            }),
        }),
        document.body,
      )
    );
  },
  QueuedMessage = ({
    item,
    disabled,
    reorderable,
    editing,
    onEdit,
    onSendNow,
    onRemove,
    dragging,
    handleProps,
    ref,
    style,
  }) => {
    const d = Ht(item.message) || 'Message with attachments';
    return (0, a.jsxs)('li', {
      ref,
      style,
      className: Y(
        'relative flex h-8 shrink-0 items-center gap-2 rounded-xl pl-1',
        editing && 'bg-muted dark:bg-secondary',
        dragging && 'bg-surface-primary shadow-sm',
      ),
      children: [
        reorderable &&
          (0, a.jsx)('button', {
            type: 'button',
            ...handleProps,
            disabled,
            'aria-label': `Reorder queued message: ${d}`,
            className:
              'text-muted-foreground flex size-4 shrink-0 cursor-grab touch-none items-center justify-center rounded-xs focus-visible:outline-2 active:cursor-grabbing disabled:cursor-default',
            children: (0, a.jsx)(Fc, {className: 'size-4'}),
          }),
        (0, a.jsx)('span', {
          className: 'text-primary min-w-0 flex-1 truncate text-sm',
          title: d,
          children: (0, a.jsx)(fo, {
            text: d,
            tabAttachments: item.metadata?.attachments.filter(m => m.type === 'tab'),
            singleLine: true,
          }),
        }),
        (0, a.jsxs)('div', {
          className: 'flex shrink-0 items-center',
          children: [
            (0, a.jsx)(Rn, {
              content: 'Send at the next opportunity instead of waiting in the queue',
              children: (0, a.jsx)(J, {
                variant: 'outline',
                size: 'xs',
                className: 'mr-1',
                disabled,
                onClick: onSendNow,
                children: 'Send now',
              }),
            }),
            (0, a.jsx)(Rn, {
              content: 'Edit message',
              children: (0, a.jsx)(J, {
                variant: 'ghost',
                size: 'icon-xs',
                className: 'text-muted-foreground',
                'aria-label': 'Edit message',
                disabled,
                onClick: onEdit,
                children: (0, a.jsx)(Qs, {className: 'size-3.5'}),
              }),
            }),
            (0, a.jsx)(Rn, {
              content: 'Remove',
              children: (0, a.jsx)(J, {
                variant: 'ghost',
                size: 'icon-xs',
                className: 'text-muted-foreground',
                'aria-label': 'Remove',
                disabled,
                onClick: onRemove,
                children: (0, a.jsx)(Ca, {className: 'size-3.5'}),
              }),
            }),
          ],
        }),
      ],
    });
  },
  QueuedMessageEditor = ({item, pending, onSave}) => {
    const {getText} = Tt(),
      [s] = (0, g.useState)(() =>
        Rl({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: Nl(Ht(item.message), {
                skills: Na(Ht(item.message)),
                tabs: item.metadata?.attachments
                  .filter(i => i.type === 'tab')
                  .map(i => ({...i, icon: i.faviconUrl, source: 'tab'})),
              }),
            },
          ],
        }),
      );
    return (
      Gi(
        async () => {
          const i = getText().trim();
          i && (await onSave(i));
        },
        pending,
        'Save',
        s,
      ),
      null
    );
  },
  QueueEditBadge = () => {
    const e = (0, g.use)(QueueEditContext);
    return e
      ? (0, a.jsxs)('span', {
          className:
            'ml-1 inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-amber-400/20 px-2 text-xs font-medium text-amber-500',
          children: [
            (0, a.jsx)(Qs, {className: 'size-3.5'}),
            'Edit',
            (0, a.jsx)(J, {
              variant: 'ghost',
              size: 'icon-xs',
              shape: 'pill',
              className: '-mr-1.5 -ml-1 text-inherit!',
              'aria-label': 'Cancel queue edit',
              'data-composer-badge-dismiss': true,
              disabled: e.pending,
              onClick: e.onCancel,
              children: (0, a.jsx)(Ca, {className: 'size-3.5'}),
            }),
          ],
        })
      : null;
  },
  Mn = (0, g.createContext)(null),
  jn = (0, g.createContext)(null),
  In = (0, g.createContext)(null),
  _o = (0, g.createContext)(null),
  Vo = ({children, session}) =>
    (0, a.jsx)(Qi, {
      value: session ?? {},
      children,
    }) /** ComposerProvider: the composer’s draft, project and attachments state. */,
  ef = ({children, projectIdLocked = false, onProjectIdChange, ...r}) => {
    const s = Ip(r),
      o = i => {
        projectIdLocked || (s.handleDraftProjectIdChange(i), onProjectIdChange?.(i));
      };
    return (0, a.jsx)(Vo, {
      session: {
        disabled: s.isInputDisabled,
        submitDisabled: s.isSubmitDisabled,
        isCreatingSession: s.createSessionMutation.isPending,
        sendMessage: s.handleCreateAndSend,
        notice: s.notice,
      },
      children: (0, a.jsx)(Mn, {
        value: {value: s.resolvedMode, onChange: s.isModeForced ? void 0 : s.handleDraftModeChange},
        children: (0, a.jsx)(jn, {
          value: {
            value: s.draftProjectId,
            showInMenu: !projectIdLocked,
            visible: s.resolvedMode === 'default',
            onChange: projectIdLocked || s.resolvedMode === 'incognito' ? void 0 : o,
          },
          children: (0, a.jsx)(In, {
            value: {
              value: s.draftPermissionMode,
              onValueChange: s.handleDraftPermissionModeChange,
              memoryExtractionDisabled: s.draftRuntimeConfig.memoryExtractionDisabled,
              onMemoryExtractionDisabledChange: s.handleDraftMemoryExtractionDisabledChange,
              finalConfirm: s.draftRuntimeConfig.finalConfirm,
              onFinalConfirmChange: s.handleDraftFinalConfirmChange,
            },
            children: (0, a.jsx)(_o, {
              value: {
                value: s.draftModel,
                proactiveMode: s.draftRuntimeConfig.proactiveMode,
                onValueChange: s.handleDraftModelChange,
              },
              children,
            }),
          }),
        }),
      }),
    });
  },
  zo = ({children, mode}) => {
    const {currentSession, updateMode} = me(),
      s = ma(),
      {canMove, isMoveLocked, handleMove} = wi({session: currentSession, place: 'composer'}),
      {availableModels, isLoading} = on(),
      h = availableModels.some(
        p => p.provider === currentSession.model.provider && p.id === currentSession.model.modelId,
      ),
      d = Nr({selectedProvider: currentSession.model.provider}),
      m = p => {
        !canMove || isMoveLocked || handleMove(p);
      };
    const auxExistingSessionState = (0, g.useEffectEvent)(() => {
      if (currentSession.incognito || mode?.value === 'incognito')
        throw Error('A private session must remain in its current view');
      return {sessionId: currentSession.id, mode: mode?.value ?? 'default'};
    });
    (0, g.useLayoutEffect)(
      () =>
        auxRegisterDraftMigrationOwner('session-owner', {
          inspect: () => auxExistingSessionState(),
          flush: () => {},
          freeze: () => () => {},
        }),
      [],
    );
    return (0, a.jsx)(Vo, {
      session: {submitDisabled: isLoading || !h, notice: d},
      children: (0, a.jsx)(Mn, {
        value: mode ?? {value: currentSession.incognito ? 'incognito' : 'default', onChange: s ? void 0 : updateMode},
        children: (0, a.jsx)(jn, {
          value: {
            value: currentSession.projectId,
            visible: !currentSession.incognito,
            showInMenu: !s,
            onChange: canMove && !isMoveLocked ? m : void 0,
          },
          children,
        }),
      }),
    });
  },
  Uo = ({className, showIncognito = true}) => {
    const n = (0, g.use)(Mn),
      r = (0, g.use)(pr),
      {currentSession} = me(),
      o = (0, g.use)(In),
      i = (0, g.use)(jn);
    return (0, a.jsxs)(Cu, {
      className,
      mode:
        !showIncognito || r?.isSidepanel ? void 0 : (n?.value ?? (currentSession.incognito ? 'incognito' : 'default')),
      onModeChange: n?.onChange,
      children: [
        (0, a.jsx)(Or, {...o, variant: 'submenu'}),
        i?.showInMenu && i.visible && (0, a.jsx)(Fo, {variant: 'submenu', value: i.value, onValueChange: i.onChange}),
      ],
    });
  },
  tf = () => (0, a.jsxs)(a.Fragment, {children: [(0, a.jsx)(QueueEditBadge, {}), (0, a.jsx)(IncognitoBadge, {})]}),
  IncognitoBadge = () => {
    const e = (0, g.use)(Mn),
      t = (0, g.use)(pr),
      {currentSession} = me(),
      {isStreaming} = xt(),
      s = () => e?.onChange?.('default');
    return t?.isSidepanel || (e?.value ?? (currentSession.incognito ? 'incognito' : 'default')) !== 'incognito'
      ? null
      : (0, a.jsxs)('span', {
          className:
            'ml-1 inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-violet-500/15 px-2 text-[13px] leading-none font-medium text-violet-500 dark:bg-violet-400/15 dark:text-violet-400',
          children: [
            (0, a.jsx)(Da, {className: 'size-4'}),
            'Incognito',
            e?.onChange &&
              (0, a.jsx)(J, {
                variant: 'ghost',
                className: '-mr-1.5 -ml-1 text-inherit!',
                size: 'icon-xs',
                shape: 'pill',
                'aria-label': 'Turn off incognito mode',
                'data-composer-badge-dismiss': true,
                disabled: isStreaming,
                onClick: s,
                children: (0, a.jsx)(yr, {className: 'size-3.5'}),
              }),
          ],
        });
  },
  D1 = ({size = 'xs'}) => {
    const t = (0, g.use)(jn);
    return t?.visible === false ? null : (0, a.jsx)(Fo, {size, value: t?.value ?? null, onValueChange: t?.onChange});
  },
  F1 = () => {
    const e = (0, g.use)(In);
    return (0, a.jsx)(Or, {...e, render: (0, a.jsx)(J, {variant: 'ghost', size: 'sm', shape: 'pill'})});
  },
  rf = () => {
    const e = (0, g.use)(In);
    return (0, a.jsx)(Or, {
      ...e,
      variant: 'final-confirm',
      render: (0, a.jsx)(J, {variant: 'ghost', size: 'xs', shape: 'pill'}),
    });
  },
  sf = ({persistDefaultOnChange}) => {
    const t = (0, g.use)(_o);
    return (0, a.jsx)(Wp, {
      value: t?.value,
      proactiveMode: t?.proactiveMode,
      persistDefaultOnChange,
      onValueChange: t?.onValueChange,
    });
  },
  af = ({
    className,
    children,
    sessionId,
    draftScopeKey,
    sendMessage,
    runCommand,
    stop,
    onSubmitWhileResponding,
    appendSubmittedMessageWhileResponding,
    isSidepanel,
    draftPersistence,
  }) => {
    const {currentSession} = me(),
      m = zt(),
      p = Vh({sendMessage: sendMessage ?? m?.sendMessage, stop, onSubmitWhileResponding}),
      f = ca(currentSession.suspension);
    return (0, a.jsxs)(Iu, {
      sessionId,
      draftScopeKey,
      ...p,
      runCommand,
      appendSubmittedMessageWhileResponding,
      isSidepanel,
      draftPersistence,
      children: [
        (0, a.jsx)(Mp, {showAskInSidechat: !isSidepanel}),
        (0, a.jsx)(of, {}),
        (0, a.jsx)(Au, {
          children: (0, a.jsx)(Su, {
            children: (0, a.jsx)(pr, {
              value: {mode: f, isSidepanel},
              children: (0, a.jsxs)('div', {
                className: Y('@container/composer mx-auto w-full px-3 pb-2', className),
                'data-agent-session-ui': 'chat',
                children: [(0, a.jsx)(jh, {}), (0, a.jsx)(QueuedMessages, {children}, currentSession.id)],
              }),
            }),
          }),
        }),
      ],
    });
  },
  Qt = ({mode: e, children}) => {
    const {mode} = fr(),
      {currentSession} = me(),
      {hasPreservedDraft} = Tt(),
      o = mode === e || (e === 'default' && (mode === 'ask-user-question' || mode === 'action-confirmation'));
    return e === 'default'
      ? (0, a.jsx)('div', {className: o ? void 0 : 'hidden', 'aria-hidden': !o, inert: !o || void 0, children})
      : o
        ? e === 'approval'
          ? children
          : (0, a.jsxs)(
              'div',
              {
                className: 'px-4 pt-1 pb-2 @max-[520px]/composer:px-1.5',
                children: [
                  (0, a.jsx)('div', {
                    className:
                      'bg-surface-primary ring-border-surface overflow-hidden rounded-xl shadow-md ring-[0.5px]',
                    children,
                  }),
                  hasPreservedDraft &&
                    (0, a.jsx)('p', {
                      role: 'status',
                      className: 'text-muted-foreground px-2 pt-2 text-xs',
                      children: 'Your message draft is saved and will return when this closes.',
                    }),
                ],
              },
              currentSession.suspension?.id ?? currentSession.suspension?.toolCallId,
            )
        : null;
  },
  of = () => {
    const {currentSession} = me(),
      {insertText} = Tt();
    return (
      ui(Yl, ({sessionId, text}) => {
        sessionId === currentSession.id && insertText(text);
      }),
      null
    );
  } /** ComposerInput: the editor with its leading and trailing actions. */,
  cf = ({extensions, leadingAction = (0, a.jsx)(Uo, {}), placeholder, trailingAction = (0, a.jsx)(Mu, {})}) =>
    (0, a.jsxs)('div', {
      className:
        'relative @max-[520px]/composer:[&_.composer-editor]:py-2.5 @max-[520px]/composer:[&_[data-multiline=false]_.composer-editor]:px-1.5',
      children: [
        (0, a.jsx)(Sd, {}),
        (0, a.jsx)(Pd, {
          badges: (0, a.jsx)(tf, {}),
          children: (0, a.jsx)(fu, {
            extensions,
            placeholder: useAuxAgentPlaceholder(placeholder),
            editorClassName: 'composer-editor px-2 py-3 leading-5! in-data-[multiline=true]:px-3.5',
          }),
        }),
        (0, a.jsx)(ns, {position: 'left', children: leadingAction}),
        (0, a.jsx)(ns, {position: 'right', children: trailingAction}),
      ],
    }) /** ComposerCard: the composer surface, with the drop target for files. */,
  lf = ({children, className}) => {
    const {disabled, handleDirectories, handleFiles} = At(),
      {mode} = fr(),
      i = (0, g.useRef)(null),
      [c, l] = (0, g.useState)(false),
      u = !disabled && mode === 'default',
      h = (0, g.useEffectEvent)(d => {
        if (!u) return;
        const m = Al(d);
        (m.hasDirectory &&
          (m.paths.length === 0
            ? de.error('Folder path is not available for this drop. Use Files and folders instead.')
            : handleDirectories(m.paths)),
          handleFiles(m.files));
      });
    return (
      (0, g.useEffect)(() => {
        const d = i.current;
        if (!d) return;
        const m = d.closest('[data-chat-drop-zone]') ?? d;
        let p = 0;
        const f = () => {
            ((p = 0), l(false));
          },
          x = y =>
            y.dataTransfer?.types.includes('Files') &&
            y.target instanceof Element &&
            (y.target.closest('[data-chat-drop-zone]') ?? d) === m,
          b = y => {
            x(y) && (y.preventDefault(), (p += 1), l(u));
          },
          v = y => {
            x(y) && (y.preventDefault(), y.dataTransfer && (y.dataTransfer.dropEffect = u ? 'copy' : 'none'));
          },
          C = y => {
            x(y) && ((p = Math.max(0, p - 1)), p || f());
          },
          S = y => {
            !x(y) || !y.dataTransfer || (y.preventDefault(), y.stopPropagation(), f(), h(y.dataTransfer));
          };
        return (
          m.addEventListener('dragenter', b, true),
          m.addEventListener('dragover', v, true),
          m.addEventListener('dragleave', C, true),
          m.addEventListener('drop', S, true),
          window.addEventListener('dragend', f),
          window.addEventListener('blur', f),
          () => {
            (m.removeEventListener('dragenter', b, true),
              m.removeEventListener('dragover', v, true),
              m.removeEventListener('dragleave', C, true),
              m.removeEventListener('drop', S, true),
              window.removeEventListener('dragend', f),
              window.removeEventListener('blur', f),
              f());
          }
        );
      }, [u]),
      (0, a.jsxs)('div', {
        className: Y(
          'bg-surface-primary no-squircle ring-border-surface relative mx-auto flex w-full flex-col gap-0 overflow-hidden rounded-xl shadow-md ring-[0.5px] transition-shadow',
          className,
        ),
        'data-agent-session-ui': 'chat',
        ref: i,
        children: [
          c &&
            (0, a.jsx)('div', {
              className:
                'text-brand-content pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl text-center text-sm font-medium backdrop-blur-xs',
              children: 'Drop files or folders anywhere in this chat to attach',
            }),
          children,
        ],
      })
    );
  },
  uf = ({label = true, className, children, ...r}) =>
    (0, a.jsx)('div', {
      ...r,
      className: Y(
        'flex min-w-0 items-center px-2 py-2 @max-[520px]/composer:p-1.5',
        !label && '**:data-[slot=agent-session-label]:hidden',
        className,
      ),
      'data-model-select-shortcuts': true,
      children,
    }),
  Ts = ({children}) =>
    (0, a.jsx)('div', {className: 'flex min-w-0 items-center gap-1 first:shrink-0 first:grow', children});
