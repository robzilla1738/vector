/* Aux-owned source: the composer's permission menu (assets/provider-Cw0zhujt.js, Bi through Ui): the
 * trigger and menu for the session's permission mode, its submenu form, the Final confirm choice,
 * and the Final confirm row. The memory row stays hidden as supplied (className hidden).
 * Names the rest of the chunk uses keep their chunk names: Bi the permission menu (exported), nt its radio rows.
 * Chunk names used: c React, r JSX runtime, L cn, q useApp, An/ct/En/mr/dr/cr the permission modes and
 * Final confirm values, Rr opens a settings page, Er/Sn useRender and mergeProps, ce the chevron,
 * Ms/ys/_s the submenu, be/qe/Nt/In/jn/Rs/xs the menu group, item, separator, label, checkbox and radio
 * parts, vt/gt/xt menu root, trigger and content, je/ue/de tooltip, wr/or/Zs/yr/Ca icons, bt Switch. */
/** The permission menu: the trigger and menu, or a submenu in a larger menu; or the Final confirm choice. */
  Bi = ({
    render,
    variant = 'default',
    mode,
    onModeChange,
    memoryExtractionDisabled = false,
    finalConfirm = true,
    alwaysShowLabel = false,
    onMemoryExtractionDisabledChange,
    onFinalConfirmChange,
    ...props
  }) => {
    const {accountId} = q(),
      isFinalConfirm = variant === 'final-confirm',
      option = isFinalConfirm ? An(finalConfirm) : ct[mode],
      Icon = option.icon,
      setFinalConfirm = value => {
        (cr(value), onFinalConfirmChange?.(value));
      },
      selectMode = value => {
        const match = En.find(candidate => candidate === value);
        match && onModeChange(match);
      },
      selectConfirmation = value => {
        const match = dr(value);
        match !== void 0 && setFinalConfirm(match);
      },
      openGlobalSetting = () => {
        Rr(`/u/${accountId}/settings/agents?focusField=Access%20permission`);
      },
      trigger = Er({
        defaultTagName: 'button',
        props: Sn(
          {
            type: 'button',
            className: isFinalConfirm && !finalConfirm ? 'text-orange-500' : 'text-muted-foreground',
            'aria-label': option.label,
            children: (0, r.jsxs)('div', {
              className: L(
                'inline-flex items-center gap-1 text-xs max-sm:gap-0.5',
                isFinalConfirm && !finalConfirm && 'text-orange-500 dark:text-orange-400',
                !isFinalConfirm && mode === 'full-access' && 'text-orange-500 dark:text-orange-400',
              ),
              children: [
                (0, r.jsx)(Icon, {className: 'size-4', 'data-icon': 'inline-start'}),
                (0, r.jsx)('span', {
                  className: L('grow truncate', !alwaysShowLabel && 'max-sm:hidden @max-sm/composer:hidden'),
                  'data-slot': 'agent-session-label',
                  children: option.label,
                }),
                (0, r.jsx)(ce, {className: 'size-3.5 opacity-50', 'data-icon': 'inline-end'}),
              ],
            }),
          },
          props,
        ),
        render,
        state: {slot: 'agent-session-permission-trigger'},
      });
    return variant === 'submenu'
      ? (0, r.jsxs)(Ms, {
          children: [
            (0, r.jsxs)(ys, {
              children: [
                (0, r.jsx)(wr, {className: 'text-muted-foreground size-4'}),
                (0, r.jsx)('span', {className: 'grow pr-4', children: 'Permission'}),
                (0, r.jsx)('span', {className: 'text-muted-foreground', children: ct[mode].label}),
              ],
            }),
            (0, r.jsxs)(_s, {
              size: 'sm',
              children: [
                (0, r.jsx)(be, {
                  children: (0, r.jsx)(nt, {value: mode, onValueChange: selectMode, options: PERMISSION_OPTIONS}),
                }),
                (0, r.jsx)(Nt, {}),
                (0, r.jsxs)(qe, {
                  onClick: openGlobalSetting,
                  children: [
                    (0, r.jsx)('span', {className: 'grow', children: 'Global setting'}),
                    (0, r.jsx)(or, {className: 'text-muted-foreground size-4'}),
                  ],
                }),
              ],
            }),
          ],
        })
      : (0, r.jsxs)(vt, {
          children: [
            (0, r.jsxs)(je, {
              children: [
                (0, r.jsx)(ue, {
                  render: (0, r.jsx)('span', {className: 'inline-flex min-w-0'}),
                  children: (0, r.jsx)(gt, {render: trigger}),
                }),
                (0, r.jsx)(de, {children: isFinalConfirm ? 'Confirmation' : 'Set permission mode'}),
              ],
            }),
            (0, r.jsx)(xt, {
              align: isFinalConfirm ? 'start' : void 0,
              size: 'sm',
              className: isFinalConfirm ? void 0 : 'w-72',
              children: isFinalConfirm
                ? (0, r.jsx)(be, {
                    children: (0, r.jsx)(nt, {
                      value: String(finalConfirm),
                      onValueChange: selectConfirmation,
                      options: CONFIRMATION_OPTIONS,
                      tooltipClassName: 'max-w-64 text-pretty',
                    }),
                  })
                : (0, r.jsxs)(r.Fragment, {
                    children: [
                      (0, r.jsxs)(be, {
                        children: [
                          (0, r.jsx)(In, {children: 'Permission'}),
                          (0, r.jsx)(nt, {value: mode, onValueChange: selectMode, options: PERMISSION_OPTIONS}),
                        ],
                      }),
                      onFinalConfirmChange &&
                        (0, r.jsxs)(r.Fragment, {
                          children: [
                            (0, r.jsx)(Nt, {}),
                            (0, r.jsx)(be, {
                              children: (0, r.jsx)(FinalConfirmRow, {
                                checked: finalConfirm,
                                onCheckedChange: setFinalConfirm,
                              }),
                            }),
                          ],
                        }),
                      onMemoryExtractionDisabledChange &&
                        (0, r.jsx)(DeveloperOptions, {memoryExtractionDisabled, onMemoryExtractionDisabledChange}),
                    ],
                  }),
            }),
          ],
        });
  },
  /** The permission modes as radio options. */
  PERMISSION_OPTIONS = En.map(mode => {
    const option = ct[mode];
    return {value: mode, label: option.label, tooltip: option.description, icon: option.icon};
  }),
  /** The Final confirm values as radio options. */
  CONFIRMATION_OPTIONS = mr.map(choice => ({
    value: String(choice.value),
    label: choice.label,
    tooltip: choice.tooltip,
  })),
  /** Radio rows, each with a tooltip. */
  nt = ({value, onValueChange, options, tooltipClassName}) =>
    (0, r.jsx)(Rs, {
      value,
      onValueChange,
      children: options.map(option =>
        (0, r.jsxs)(
          je,
          {
            children: [
              (0, r.jsxs)(ue, {
                render: (0, r.jsx)(xs, {value: option.value, closeOnClick: true}),
                children: [
                  option.icon ? (0, r.jsx)(option.icon, {className: 'text-muted-foreground'}) : null,
                  (0, r.jsx)('span', {className: 'pr-4', children: option.label}),
                ],
              }),
              (0, r.jsx)(de, {
                side: 'right',
                align: 'start',
                sideOffset: 8,
                className: tooltipClassName,
                children: option.tooltip,
              }),
            ],
          },
          option.value,
        ),
      ),
    }),
  /** The Final confirm row. */
  FinalConfirmRow = ({checked, onCheckedChange}) => {
    const option = An(true),
      toggle = () => onCheckedChange(!checked),
      stopPropagation = event => event.stopPropagation();
    return (0, r.jsxs)(je, {
      children: [
        (0, r.jsxs)(ue, {
          render: (0, r.jsx)(qe, {closeOnClick: false, onClick: toggle}),
          children: [
            (0, r.jsx)(Ca, {className: 'text-muted-foreground'}),
            (0, r.jsx)('span', {className: 'grow whitespace-nowrap', children: 'Final confirm'}),
            (0, r.jsx)('span', {onClick: stopPropagation, children: (0, r.jsx)(bt, {checked, onCheckedChange})}),
          ],
        }),
        (0, r.jsx)(de, {
          side: 'right',
          align: 'start',
          sideOffset: 8,
          className: 'w-72 text-pretty',
          children: option.tooltip,
        }),
      ],
    });
  },
  /** The developer section (hidden as supplied). */
  DeveloperOptions = ({memoryExtractionDisabled, onMemoryExtractionDisabledChange}) =>
    (0, r.jsxs)(be, {
      className: L('hidden'),
      children: [
        (0, r.jsx)(In, {children: 'Developer'}),
        (0, r.jsxs)(je, {
          children: [
            (0, r.jsxs)(ue, {
              render: (0, r.jsx)(qe, {closeOnClick: false}),
              children: [
                (0, r.jsx)(Zs, {className: 'text-muted-foreground'}),
                (0, r.jsx)('span', {className: 'grow whitespace-nowrap', children: 'Disable memory extraction'}),
                (0, r.jsx)(bt, {checked: memoryExtractionDisabled, onCheckedChange: onMemoryExtractionDisabledChange}),
              ],
            }),
            (0, r.jsx)(de, {
              side: 'right',
              align: 'start',
              sideOffset: 8,
              children: 'Skip automatic memory writes after this task. Memory recall stays available.',
            }),
          ],
        }),
        (0, r.jsxs)(jn, {
          checked: true,
          children: [
            (0, r.jsx)(yr, {className: 'text-muted-foreground'}),
            (0, r.jsx)('span', {children: 'Password access'}),
          ],
        }),
      ],
    })
