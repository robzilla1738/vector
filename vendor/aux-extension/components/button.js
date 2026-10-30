/* Aux-owned source: Button and buttonVariants (assets/button-82u7k4S8.js).
 * Replaces the chunk's code between its imports and its export, which stays
 * `export{z as n,w as t}`. Imports used here, from browser-color-scheme:
 * g interop, v React, f JSX runtime, b cva, c cn, p useRender; from preload-helper: h useButton. */
var React = g(v(), 1),
  // The headless button: native <button> semantics, disabled handling and render-prop support.
  ButtonPrimitive = React.forwardRef(function ButtonPrimitive(props, forwardedRef) {
    const {render, className, disabled = false, focusableWhenDisabled = false, nativeButton = true, style, ...rest} = props;
    const {getButtonProps, buttonRef} = h({disabled, focusableWhenDisabled, native: nativeButton});
    return p('button', props, {state: {disabled}, ref: [forwardedRef, buttonRef], props: [rest, getButtonProps]});
  }),
  jsxRuntime = f(),
  buttonVariants = b(
    "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all will-change-transform outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
      variants: {
        variant: {
          default: 'bg-primary text-primary-foreground hover:bg-primary/90 [a]:hover:bg-primary/80',
          outline: 'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
          secondary: 'bg-secondary text-surface-primary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
          ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
          destructive: 'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
          link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
          default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
          xs: "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
          sm: "h-7 gap-1 rounded-lg px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
          lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
          icon: 'size-8',
          'icon-xs': "size-6 rounded-md in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
          'icon-sm': 'size-7 rounded-lg in-data-[slot=button-group]:rounded-lg',
          'icon-lg': 'size-9',
        },
        shape: {default: '', pill: 'rounded-full!'},
      },
      defaultVariants: {variant: 'default', size: 'default'},
    }),
  z = buttonVariants;

/** Button (exported as t). The Agent extension's button: variant, size and shape pick the classes; everything else goes to the primitive. */
function w({className, variant = 'default', size = 'default', shape = 'default', ...props}) {
  return (0, jsxRuntime.jsx)(ButtonPrimitive, {'data-slot': 'button', className: c(buttonVariants({variant, size, shape, className})), ...props});
}
