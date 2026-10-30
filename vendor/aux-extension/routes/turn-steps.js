/* Aux-owned source, assistant step rows pass 1 (assets/turn-fold-B4gN_g5e.js, from the icons to the
 * subagent row; the JSX runtime binding before it stays supplied): the chevron and spinner icons, a
 * step in an assistant turn (icon on a timeline, a title that folds its details open, open while
 * the step is active), and a subagent's row (color, description, model, time, latest activity).
 * The bundled Radix controllable-state hooks after it stay supplied.
 * Names the rest of the chunk uses keep their chunk names (all exported or used by the second pass):
 * re ChevronIcon, oe SpinnerIcon, s React, se AssistantStep, ae SubagentRow.
 * Chunk names used: t JSX runtime, C cn, T/U/k the collapsible root, trigger and panel, q the agent
 * color mark, _ / S the chevron and spinner as used by the steps. */
re = ({size = 24, ariaHidden = true, ...r}) =>
    (0, t.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, t.jsx)('path', {
        d: 'M11.1967 2.71852C8.53683 0.970597 5 2.87854 5 6.06134V17.9389C5 21.1217 8.53684 23.0296 11.1967 21.2817L20.234 15.3429C22.6384 13.7629 22.6384 10.2373 20.234 8.6573L11.1967 2.71852Z',
        fill: 'currentColor',
      }),
    }),
  oe = ({size = 24, ariaHidden = true, ...r}) =>
    (0, t.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, t.jsx)('path', {
        d: 'M11 20V13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H11V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H13V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20Z',
        fill: 'currentColor',
      }),
    }),
  s = L(V(), 1) /** A step on the turn timeline; its details fold open, open while it is the active step. */,
  se = ({
    icon,
    title,
    children,
    className,
    contentClassName,
    inlineTimelineChildren = false,
    expandMode = 'open-when-active',
    isActiveGroup,
    isLastItem = false,
    hideConnector = false,
    bare = false,
    footer,
  }) => {
    const w = expandMode !== 'none',
      d = w && !!children,
      b = w ? U : 'div',
      h = d && (expandMode === 'force-open' || (expandMode === 'open-when-active' && isActiveGroup)),
      g = (0, s.useRef)(h),
      [x, v] = (0, s.useState)(false),
      y = d && (h || x),
      A = expandMode !== 'manual' || y;
    return (
      (0, s.useEffect)(() => {
        (g.current && !h && v(false), (g.current = h));
      }, [h]),
      bare
        ? (0, t.jsx)('div', {className: 'pt-1 pb-4', children})
        : (0, t.jsx)(T, {
            className: 'group/process-item',
            open: y,
            onOpenChange: D => {
              h || v(D);
            },
            children: (0, t.jsxs)('div', {
              className: C('relative flex items-start gap-1.5 pb-2 text-sm', icon !== null && '-mx-1', className),
              children: [
                icon !== null &&
                  (0, t.jsxs)('div', {
                    className: 'relative flex min-h-6 w-6 shrink-0 items-start justify-center self-stretch',
                    children: [
                      (0, t.jsx)('div', {
                        className: C(
                          'bg-border absolute top-6 left-1/2 h-[calc(100%-16px)] min-h-2 w-px -translate-x-1/2',
                          (hideConnector || inlineTimelineChildren || (isLastItem && !y)) && 'hidden',
                          y && !inlineTimelineChildren && isLastItem && 'h-[calc(100%-32px)]',
                        ),
                        'data-line': true,
                      }),
                      icon
                        ? (0, t.jsx)('div', {
                            className:
                              'text-muted-foreground relative z-10 flex size-6 items-center justify-center [&>svg]:size-4',
                            children: icon,
                          })
                        : (0, t.jsx)('div', {
                            className: 'relative z-10 flex size-6 items-center justify-center',
                            children: (0, t.jsx)('div', {className: 'bg-muted-foreground/35 size-1.5 rounded-full'}),
                          }),
                    ],
                  }),
                (0, t.jsxs)('div', {
                  className: 'min-w-0 flex-1',
                  children: [
                    (0, t.jsx)(b, {
                      className: C(
                        'group/accordion-trigger text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-6 w-full items-center justify-start gap-1 overflow-hidden border-0 p-0 py-0 text-left transition-colors outline-none focus-visible:ring-3',
                        'aria-disabled:opacity-100!',
                      ),
                      children: (0, t.jsxs)('span', {
                        className: 'flex max-w-full min-w-0 items-center gap-1',
                        children: [
                          (0, t.jsx)('span', {
                            className: 'block max-w-full min-w-0 truncate overflow-hidden text-left font-normal',
                            children: title,
                          }),
                          d &&
                            (0, t.jsx)(_, {
                              className:
                                'size-4 shrink-0 opacity-0 transition-all group-hover/accordion-trigger:opacity-100 group-aria-expanded/accordion-trigger:rotate-90 group-aria-expanded/accordion-trigger:opacity-100',
                            }),
                        ],
                      }),
                    }),
                    d && children
                      ? (0, t.jsx)(k, {
                          className: C(
                            'group/assistant-step-content h-(--collapsible-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0',
                            inlineTimelineChildren && icon !== null && '-ml-[30px] w-[calc(100%+30px)]',
                            contentClassName,
                          ),
                          keepMounted: A,
                          children: (0, t.jsx)('div', {
                            className: C(
                              icon === null ? 'pr-1' : 'px-1',
                              'opacity-0 transition-[opacity,padding] will-change-[opacity,padding] group-data-open/assistant-step-content:opacity-100',
                              inlineTimelineChildren
                                ? 'group-data-open/assistant-step-content:pt-2'
                                : 'pt-1 pb-2 group-data-open/assistant-step-content:pt-3',
                            ),
                            children,
                          }),
                        })
                      : null,
                    footer,
                  ],
                }),
              ],
            }),
          })
    );
  }; /** A subagent: its color, description, model and time, and what it is doing now. */
function ae({description, color, model, time, activity, isRunning = false, onClick}) {
  return (0, t.jsxs)('button', {
    type: 'button',
    className:
      'hover:bg-muted dark:hover:bg-muted/50 relative -ml-1 flex min-w-0 items-start gap-2 rounded-lg py-1.5 pr-2 pl-1 text-left transition-colors disabled:pointer-events-none',
    disabled: !onClick,
    onClick,
    children: [
      (0, t.jsx)('svg', {
        'aria-hidden': 'true',
        className: 'text-border pointer-events-none absolute top-0 -left-[22px] h-4 w-5 overflow-visible',
        viewBox: '0 0 20 16',
        children: (0, t.jsx)('path', {
          d: 'M0 0v8a8 8 0 0 0 8 8h9',
          fill: 'none',
          stroke: 'currentColor',
          vectorEffect: 'non-scaling-stroke',
        }),
      }),
      (0, t.jsx)(q, {className: 'mt-0.5 size-4 shrink-0', color}),
      (0, t.jsxs)('span', {
        className: 'min-w-0 flex-1',
        children: [
          (0, t.jsxs)('span', {
            className: 'flex min-w-0 items-center gap-2',
            children: [
              (0, t.jsx)('span', {className: 'text-primary min-w-0 flex-1 truncate', children: description}),
              model &&
                (0, t.jsxs)('span', {
                  className: 'text-muted-foreground flex max-w-full min-w-0 items-center gap-1 text-xs',
                  children: [
                    model,
                    (0, t.jsx)('span', {children: '·'}),
                    time,
                    isRunning && (0, t.jsx)(S, {className: 'size-3.5'}),
                  ],
                }),
            ],
          }),
          activity &&
            (0, t.jsx)('span', {
              className: 'text-muted-foreground block truncate pt-0.5 text-[13px]',
              children: activity,
            }),
        ],
      }),
    ],
  });
}
