/* Aux-owned source: the Tabs parts (assets/tabs-VLDOVMHF.js). Exported here: tn Tabs, nn TabsList,
 * an TabsTrigger, rn TabsContent. Chunk names used: _ JSX runtime, ne cn, ye cva, ct motion;
 * primitives Ct Root, Vt List, Ot Indicator, Et Tab, Nt Panel.
 * The list's indicator is a spring-animated pill that slides to the active tab. */

/** Tabs (exported as t). */
function tn({className, orientation = 'horizontal', ...props}) {
  return (0, _.jsx)(Ct, {'data-slot': 'tabs', 'data-orientation': orientation, className: ne('group/tabs flex gap-2 data-horizontal:flex-col', className), ...props});
}

var tabsListVariants = ye('group/tabs-list text-muted-foreground relative isolate inline-flex w-fit items-center justify-center rounded-lg group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none', {
    variants: {
      variant: {
        default: 'bg-neutral-400/20 dark:bg-neutral-900/40',
        rounded: 'rounded-full bg-neutral-400/20 dark:bg-neutral-900/40',
        line: 'gap-1 bg-transparent',
      },
      size: {
        default: 'p-[3px] group-data-horizontal/tabs:h-8',
        // The leading "!" is in the supplied build; Tailwind ignores it.
        sm: '! p-[3px] group-data-horizontal/tabs:h-7',
      },
    },
    defaultVariants: {variant: 'default', size: 'default'},
  }),
  tabsIndicatorVariants = ye('pointer-events-none absolute z-0', {
    variants: {
      variant: {
        default: 'bg-surface-primary ring-border-surface rounded-md shadow-md ring-[0.5px]',
        rounded: 'bg-surface-primary ring-border-surface rounded-full shadow-sm ring-[0.5px]',
        line: 'after:bg-foreground after:absolute group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-4px] group-data-horizontal/tabs:after:h-px group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5',
      },
    },
  }),
  TABS_INDICATOR_SPRING = {type: 'spring', stiffness: 520, damping: 40, mass: 0.8};

/** TabsList (exported as r). Until the active tab is measured the indicator is a plain span. */
function nn({children, className, variant = 'default', size = 'default', ...props}) {
  return (0, _.jsxs)(Vt, {
    'data-slot': 'tabs-list',
    'data-variant': variant,
    className: ne(tabsListVariants({variant, size}), className),
    ...props,
    children: [
      (0, _.jsx)(Ot, {
        'data-slot': 'tabs-indicator',
        className: tabsIndicatorVariants({variant}),
        render: (indicatorProps, {activeTabPosition: position, activeTabSize: tabSize}) =>
          !position || !tabSize?.width || !tabSize?.height
            ? (0, _.jsx)('span', {...indicatorProps})
            : (0, _.jsx)(ct.span, {
              ...indicatorProps,
              animate: {x: position.left, y: position.top, width: tabSize.width, height: tabSize.height},
              initial: false,
              style: {...indicatorProps.style, top: 0, left: 0},
              transition: TABS_INDICATOR_SPRING,
            }),
      }),
      children,
    ],
  });
}

/** TabsTrigger (exported as i). */
function an({className, ...props}) {
  return (0, _.jsx)(Et, {
    'data-slot': 'tabs-trigger',
    className: ne("text-muted-foreground hover:text-foreground data-active:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
    ...props,
  });
}

/** TabsContent (exported as n). */
function rn({className, ...props}) {
  return (0, _.jsx)(Nt, {'data-slot': 'tabs-content', className: ne('flex-1 text-sm outline-none', className), ...props});
}
