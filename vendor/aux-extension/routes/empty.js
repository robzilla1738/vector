/* Aux-owned source: the Empty state parts (assets/empty-D6YJzOw0.js, the module body).
 * Names the rest of the chunk uses keep their chunk names: o Empty, d EmptyHeader, c EmptyIcon, u EmptyTitle,
 * x EmptyDescription, f EmptyContent (exported).
 * Chunk names used: i JSX runtime, a cn, r cva. */
var jsxRuntime = i();
/** The frame. */
function o({className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'empty',
    className: a(
      'flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance',
      className,
    ),
    ...props,
  });
}
/** Its icon and title. */
function d({className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'empty-header',
    className: a('flex max-w-sm flex-col items-center gap-1', className),
    ...props,
  });
}
var emptyIconVariants = r(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {variant: 'default'},
  },
);
/** Its icon. */
function c({className, variant = 'default', ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'empty-icon',
    'data-variant': variant,
    className: a(emptyIconVariants({variant, className})),
    ...props,
  });
}
/** Its title. */
function u({className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'empty-title',
    className: a('text-sm font-medium tracking-tight', className),
    ...props,
  });
}
/** Its description. */
function x({className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'empty-description',
    className: a(
      'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
      className,
    ),
    ...props,
  });
}
/** Its actions. */
function f({className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'empty-content',
    className: a('flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance', className),
    ...props,
  });
}
