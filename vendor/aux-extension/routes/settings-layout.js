/* Aux-owned source: the Settings page kit (assets/-layouts-CcApOQbE.js). Every Settings page is built
 * from these: the page surface, header, sections, grouped cards of rows, row labels, a feature
 * tile and trailing controls. Exported names stay the chunk's: t page surface classes, o header,
 * c section, l group, i row, r interactive row, a row label, s feature tile, n trailing slot.
 * Imports used here: browser-color-scheme l JSX runtime, t cn, o cva, m mergeProps; useRender x.
 * Aux changes: the page sits flush in the native page card (a package edit already made it so),
 * and a hovered row takes the theme's --muted fill in light mode instead of a fixed neutral-100,
 * so it follows the Space tint like the dark-mode --accent fill already did. */
var jsxRuntime = l(),
  p = 'bg-web-content-background size-full border-l',
  // SettingsHeader: the page title.
  j = ({children}) => (0, jsxRuntime.jsx)('header', {className: '[&_h1]:font-display mb-6 [&_h1]:text-2xl [&_h1]:font-[450]', children}),
  // SettingsSection: a titled block; search and deep links find it by id and data-settings-section.
  N = ({id, title, label, description, badge, children}) => (0, jsxRuntime.jsxs)('section', {
    id,
    className: 'scroll-mt-10',
    'data-settings-section': typeof title == 'string' ? title : label,
    children: [
      title && (0, jsxRuntime.jsxs)('div', {
        className: 'mb-2',
        children: [
          (0, jsxRuntime.jsxs)('h2', {className: 'font-display text-muted-foreground/80 flex items-center gap-1.5 text-sm font-[550]', children: [title, badge]}),
          description && (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground mt-1 text-xs font-medium', children: description}),
        ],
      }),
      children,
    ],
  }),
  // SettingsGroup: a card of rows (12px corner), divided in light mode and spaced in dark.
  v = props => (0, jsxRuntime.jsx)('div', {
    ...props,
    className: t('divide-border -mx-3.5 divide-y overflow-hidden rounded-xl border dark:space-y-px dark:divide-y-0 dark:border-transparent dark:bg-transparent [&+&]:mt-2', props.className),
  }),
  // SettingsRow: one row of a group; `render` swaps the element (a link, a label).
  i = ({render, ...props}) => x({
    defaultTagName: 'div',
    props: m({className: t('bg-surface-secondary flex min-h-13 items-center gap-3 p-2.5', props.className)}, props),
    render,
  }),
  interactiveRowVariants = o('dark:hover:bg-accent cursor-pointer hover:bg-muted', {
    variants: {
      variant: {
        presentation: '',
        action: '**:text-muted-foreground cursor-pointer gap-1 text-left',
      },
    },
    defaultVariants: {variant: 'presentation'},
  }),
  // SettingsInteractiveRow: a row that responds to hover.
  b = ({variant, className, ...props}) => (0, jsxRuntime.jsx)(i, {className: t(interactiveRowVariants({variant}), 'transition-colors', className), ...props}),
  // SettingsLabel: a row's title and description; search finds the title by data-settings-field.
  f = ({title, label, description}) => (0, jsxRuntime.jsxs)('div', {
    className: 'min-w-0 grow px-1',
    children: [
      (0, jsxRuntime.jsx)('h4', {className: 'text-primary text-sm font-medium', 'data-settings-field': label ?? (typeof title == 'string' ? title : void 0), children: title}),
      description && (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs font-medium', children: description}),
    ],
  }),
  // SettingsFeatureTile: a group with one large row and an illustration.
  S = ({title, description, illustration}) => (0, jsxRuntime.jsx)(v, {
    children: (0, jsxRuntime.jsxs)(i, {
      className: 'items-stretch gap-2.5 p-1',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex min-w-0 flex-1 flex-col px-3.5 py-3',
          children: (0, jsxRuntime.jsx)(f, {
            title: (0, jsxRuntime.jsx)('span', {className: 'text-base', children: title}),
            description: (0, jsxRuntime.jsx)('span', {className: 'text-sm', children: description}),
          }),
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'relative h-40 w-72 shrink-0 overflow-hidden rounded-lg **:pointer-events-none **:select-none',
          'aria-hidden': illustration ? void 0 : true,
          children: illustration && (0, jsxRuntime.jsx)('img', {src: illustration.src, alt: illustration.alt, className: 'size-full object-cover'}),
        }),
      ],
    }),
  }),
  // SettingsTrailing: the right-hand control of a row.
  w = props => (0, jsxRuntime.jsx)('div', {...props, className: t('flex max-w-40 min-w-0 shrink justify-end', props.className)});
