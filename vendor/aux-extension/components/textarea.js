/* Aux-owned source: Textarea (assets/textarea-5TASg52t.js, exported as t).
 * Imports used here, from browser-color-scheme: e interop, t React, n JSX runtime, a cn. */
var React = e(t(), 1),
  jsxRuntime = n();

/** Textarea (exported as t): grows with its content; the same field styling as Input. */
function l({className, ...props}) {
  return (0, jsxRuntime.jsx)('textarea', {
    'data-slot': 'textarea',
    className: a('border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-16 w-full rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm', className),
    ...props,
  });
}
