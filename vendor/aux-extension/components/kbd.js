/* Aux-owned source: Kbd and KbdGroup (assets/kbd-BDAwTCNn.js, exported as t and n).
 * Imports used here, from browser-color-scheme: i JSX runtime, s cva, r cn. */
var jsxRuntime = i(),
  kbdVariants = s("text-box-trim font-system pointer-events-none inline-flex h-4.5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1.5 text-[11px] font-medium select-none [&_svg:not([class*='size-'])]:size-3", {
    variants: {
      variant: {
        default: 'bg-muted text-primary',
        primary: 'text-primary-foreground bg-transparent',
      },
    },
  });

/** Kbd (exported as t): one key of a shortcut, in the system font. */
function u({className, variant = 'default', ...props}) {
  return (0, jsxRuntime.jsx)('kbd', {'data-slot': 'kbd', className: r(kbdVariants({variant}), className), ...props});
}

/** KbdGroup (exported as n): keys of one shortcut side by side. */
function d({className, ...props}) {
  return (0, jsxRuntime.jsx)('kbd', {'data-slot': 'kbd-group', className: r('text-box-trim inline-flex items-center gap-1', className), ...props});
}
