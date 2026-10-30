/* Aux-owned source: a radio group of cards (assets/radio-card-group-DhMlHjFD.js, the module body).
 * Names the rest of the chunk uses keep their chunk names: b the group, j a card (exported).
 * Chunk names used: i JSX runtime, s cn, l/n/c/p/m Field parts, f/h radio group and item. */
var jsxRuntime = i(),
  /** The group. */
  b = ({className, ...props}) =>
    (0, jsxRuntime.jsx)(f, {
      className: s(
        'bg-border space-y-hairline border-hairline gap-0 overflow-hidden rounded-xl',
        'dark:space-y-px dark:border-transparent dark:bg-transparent',
        className,
      ),
      ...props,
    }),
  /** A card. */
  j = ({description, disabled, id, title, value}) =>
    (0, jsxRuntime.jsx)(l, {
      className: s(
        'bg-surface-primary dark:has-data-checked:bg-surface-primary! cursor-pointer has-data-checked:bg-muted',
        'has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border-0',
        '*:data-[slot=field]:px-3 *:data-[slot=field]:pt-3 *:data-[slot=field]:pb-2.5 *:data-[slot=field]:pl-3.5',
        disabled && 'cursor-not-allowed',
      ),
      htmlFor: id,
      children: (0, jsxRuntime.jsxs)(n, {
        className: 'gap-1.5 has-[>[data-slot=field-content]]:items-center',
        orientation: 'horizontal',
        children: [
          (0, jsxRuntime.jsxs)(p, {
            className: s('gap-0', disabled && 'opacity-50'),
            children: [
              (0, jsxRuntime.jsx)(m, {className: 'leading-5', children: title}),
              description
                ? (0, jsxRuntime.jsx)(c, {className: 'text-xs leading-4 font-medium', children: description})
                : null,
            ],
          }),
          (0, jsxRuntime.jsx)(h, {disabled, id, value}),
        ],
      }),
    });
