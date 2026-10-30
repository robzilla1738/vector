/* Aux-owned source: Checkbox (assets/checkbox-5u7RNXxY.js, exported as Lt → t). This block sits at
 * the end of the chunk's `var` list, after the headless primitives it uses: mt CheckboxRoot,
 * gt CheckboxIndicator, p JSX runtime, re cn, ae motion (react-Da396Co4). The check draws itself in
 * with a short pop; unchecking fades it. */
CHECK_PATH_TRANSITION = {duration: 0.18, ease: [0.22, 1, 0.36, 1]},
  CHECK_DELAY = 0.08;

/** Checkbox (exported as t). */
function Lt({className, ...props}) {
  return (0, p.jsx)(mt, {
    'data-slot': 'checkbox',
    className: re('peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary relative flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3', className),
    ...props,
    children: (0, p.jsx)(gt, {
      'data-slot': 'checkbox-indicator',
      keepMounted: true,
      render: (indicatorProps, state) => (0, p.jsx)('span', {
        ...indicatorProps,
        className: re('grid place-content-center text-current [&>svg]:size-3.5', indicatorProps.className),
        children: (0, p.jsx)(ae.svg, {
          'aria-hidden': 'true',
          animate: state.checked ? {opacity: 1, scale: [0.75, 1.08, 1]} : {opacity: 0, scale: 0.7},
          fill: 'none',
          initial: false,
          transition: {duration: state.checked ? 0.22 : 0.12, ease: [0.22, 1, 0.36, 1]},
          viewBox: '0 0 16 16',
          children: (0, p.jsx)(ae.path, {
            animate: state.checked ? {opacity: 1, pathLength: 1} : {opacity: 0, pathLength: 0},
            d: 'M3.5 8.5L6.5 11.5L12.5 5.5',
            stroke: 'currentColor',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: '2.25',
            transition: {
              opacity: {delay: state.checked ? CHECK_DELAY : 0, duration: state.checked ? 0.01 : 0.08},
              pathLength: {...CHECK_PATH_TRANSITION, delay: state.checked ? CHECK_DELAY : 0},
            },
          }),
        }),
      }),
    }),
  });
}
