/* Aux-owned source, model select pass 1 (assets/model-select-BvZsM1Kl.js, from the Ultrabrowse switch
 * to the select's context; the launch policy, React and the JSX runtime before it stay supplied):
 * the Ultrabrowse switch (with why it is off for a model) and its rainbow label.
 * Names the rest of the chunk uses keep their chunk names: Ve UltrabrowseSwitch, we UltrabrowseLabel,
 * Me the select context, se the focus to restore per shortcut root.
 * Chunk names used: d React, e JSX runtime, z cn, ce the account, V the menu checkbox item, W/re/te
 * Tooltip, TooltipTrigger, TooltipContent, _e motion. */
/** The Ultrabrowse switch; when off for a model, a tooltip says why. */
  Ve = ({
    checked,
    disabled,
    onCheckedChange,
    compact = false,
    tooltipAlign,
    tooltipClassName = 'w-64',
    tooltipSide = 'right',
  }) => {
    const {accountId} = ce(),
      [S, h] = (0, d.useState)(false),
      N = (0, e.jsx)(V, {
        checked,
        disabled,
        onCheckedChange,
        onPointerEnter: () => h(true),
        onPointerLeave: () => h(false),
        children: (0, e.jsx)(we, {animated: S && !disabled}),
      });
    return disabled
      ? (0, e.jsxs)(W, {
          disableHoverablePopup: compact,
          children: [
            (0, e.jsx)(re, {
              render: (0, e.jsx)('span', {className: 'block'}),
              onPointerEnter: () => h(true),
              onPointerLeave: () => h(false),
              children: N,
            }),
            (0, e.jsx)(te, {
              align: tooltipAlign,
              className: tooltipClassName,
              side: tooltipSide,
              children: (0, e.jsx)('div', {
                className: z(compact ? 'select-none' : 'space-y-0.5 py-1'),
                children: (0, e.jsx)('p', {children: 'Ultrabrowse isn’t available for this model.'}),
              }),
            }),
          ],
        })
      : N;
  } /** Ultrabrowse in rainbow letters; a moving gradient while animated. */,
  we = ({animated = false, className}) =>
    (0, e.jsxs)('span', {
      className: z('relative inline-grid', className),
      'aria-label': 'Ultrabrowse',
      children: [
        (0, e.jsx)('span', {
          className: z('col-start-1 row-start-1', animated && 'opacity-0'),
          children: ULTRABROWSE_LETTERS.map(({color, letter}, c) =>
            (0, e.jsx)('span', {className: color, children: letter}, `${letter}:${c}`),
          ),
        }),
        (0, e.jsx)(_e.span, {
          'aria-hidden': true,
          className: z('col-start-1 row-start-1 bg-clip-text text-transparent', ULTRABROWSE_COLORS),
          style: {
            backgroundClip: 'text',
            backgroundImage: ULTRABROWSE_GRADIENT,
            backgroundSize: '200% 100%',
            color: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
          animate: animated
            ? {backgroundPosition: ['0% 50%', '100% 50%'], opacity: 1, fontWeight: 500}
            : {backgroundPosition: '0% 50%', opacity: 0, fontWeight: 400},
          transition: animated
            ? {backgroundPosition: {duration: 1.4, ease: 'linear', repeat: 1 / 0}, opacity: {duration: 0}}
            : {duration: 0},
          children: 'Ultrabrowse',
        }),
      ],
    }),
  ULTRABROWSE_LETTERS = [
    {letter: 'U', color: 'text-red-500 dark:text-red-400'},
    {letter: 'l', color: 'text-orange-500 dark:text-orange-400'},
    {letter: 't', color: 'text-amber-500 dark:text-amber-400'},
    {letter: 'r', color: 'text-green-500 dark:text-green-400'},
    {letter: 'a', color: 'text-sky-500 dark:text-sky-400'},
    {letter: 'b', color: 'text-blue-500 dark:text-blue-400'},
    {letter: 'r', color: 'text-violet-500 dark:text-violet-400'},
    {letter: 'o', color: 'text-pink-500 dark:text-pink-400'},
    {letter: 'w', color: 'text-red-500 dark:text-red-400'},
    {letter: 's', color: 'text-orange-500 dark:text-orange-400'},
    {letter: 'e', color: 'text-amber-500 dark:text-amber-400'},
  ],
  ULTRABROWSE_COLORS = [
    '[--ultrabrowse-red:var(--color-red-500)] dark:[--ultrabrowse-red:var(--color-red-400)]',
    '[--ultrabrowse-orange:var(--color-orange-500)] dark:[--ultrabrowse-orange:var(--color-orange-400)]',
    '[--ultrabrowse-yellow:var(--color-amber-500)] dark:[--ultrabrowse-yellow:var(--color-amber-400)]',
    '[--ultrabrowse-green:var(--color-green-500)] dark:[--ultrabrowse-green:var(--color-green-400)]',
    '[--ultrabrowse-sky:var(--color-sky-500)] dark:[--ultrabrowse-sky:var(--color-sky-400)]',
    '[--ultrabrowse-blue:var(--color-blue-500)] dark:[--ultrabrowse-blue:var(--color-blue-400)]',
    '[--ultrabrowse-violet:var(--color-violet-500)] dark:[--ultrabrowse-violet:var(--color-violet-400)]',
    '[--ultrabrowse-pink:var(--color-pink-500)] dark:[--ultrabrowse-pink:var(--color-pink-400)]',
  ],
  ULTRABROWSE_GRADIENT =
    'linear-gradient(90deg, var(--ultrabrowse-red), var(--ultrabrowse-orange), var(--ultrabrowse-yellow), var(--ultrabrowse-green), var(--ultrabrowse-sky), var(--ultrabrowse-blue), var(--ultrabrowse-violet), var(--ultrabrowse-pink), var(--ultrabrowse-red), var(--ultrabrowse-orange), var(--ultrabrowse-yellow), var(--ultrabrowse-green), var(--ultrabrowse-sky), var(--ultrabrowse-blue), var(--ultrabrowse-violet), var(--ultrabrowse-pink), var(--ultrabrowse-red))',
  Me = (0, d.createContext)(null),
  se = new WeakMap()
