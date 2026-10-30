/* Aux-owned source: AlertDialog and ContextMenu (assets/strip-markdown-DRcmtuJc.js). Every function
 * keeps its chunk name; the chunk's export and its confirm-dialog helper use them.
 * Chunk names used: p JSX runtime, $ cn, oe Button, Ks chevron-right icon; alert-dialog primitives
 * bd Root, xd Trigger, mu Portal, vu Backdrop, pu Popup, hu Title, du Description, gu Close;
 * menu primitives Kd ContextMenu Root, Qd Trigger, pr Portal, qd Positioner, Kt Popup, Di Group,
 * _i Item, Gi SubmenuRoot, Ki SubmenuTrigger, fi Separator.
 * Aux change: the alert dialog and its footer take the popover corner (rounded-xl, 12px) instead of
 * rounded-2xl. The context menu was already rounded-xl. */

/** AlertDialog. */
function ko({...props}) {
  return (0, p.jsx)(bd, {'data-slot': 'alert-dialog', ...props});
}

/** AlertDialogTrigger. */
function Gg({...props}) {
  return (0, p.jsx)(xd, {'data-slot': 'alert-dialog-trigger', ...props});
}

function AlertDialogPortal({...props}) {
  return (0, p.jsx)(mu, {'data-slot': 'alert-dialog-portal', ...props});
}

function AlertDialogOverlay({className, ...props}) {
  return (0, p.jsx)(vu, {
    'data-slot': 'alert-dialog-overlay',
    className: $('data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/15 duration-100 supports-backdrop-filter:backdrop-blur-xs', className),
    ...props,
  });
}

/** AlertDialogContent: the overlay and the centred card; `size` sm keeps it narrow with two equal buttons. */
function Eo({className, size = 'default', ...props}) {
  return (0, p.jsxs)(AlertDialogPortal, {
    children: [
      (0, p.jsx)(AlertDialogOverlay, {}),
      (0, p.jsx)(pu, {
        'data-slot': 'alert-dialog-content',
        'data-size': size,
        className: $(
          'group/alert-dialog-content no-drag data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm',
          'bg-popover border-glass gap-3 rounded-xl px-5 py-4 shadow-2xl',
          className),
        ...props,
      }),
    ],
  });
}

/** AlertDialogHeader: centred, or left-aligned beside its media on wider default-size dialogs. */
function Tn({className, ...props}) {
  return (0, p.jsx)('div', {
    'data-slot': 'alert-dialog-header',
    className: $('grid grid-rows-[auto_1fr] place-items-center gap-1 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]', className),
    ...props,
  });
}

/** AlertDialogFooter. */
function An({className, ...props}) {
  return (0, p.jsx)('div', {
    'data-slot': 'alert-dialog-footer',
    className: $('-mx-5 -mb-4 flex flex-col-reverse gap-1 rounded-b-xl p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end', className),
    ...props,
  });
}

/** AlertDialogTitle. */
function jn({className, ...props}) {
  return (0, p.jsx)(hu, {
    'data-slot': 'alert-dialog-title',
    className: $('font-display text-lg leading-6 font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2', className),
    ...props,
  });
}

/** AlertDialogDescription. */
function Fn({className, ...props}) {
  return (0, p.jsx)(du, {
    'data-slot': 'alert-dialog-description',
    className: $('text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3', className),
    ...props,
  });
}

/** AlertDialogAction: a Button. */
function Io({className, ...props}) {
  return (0, p.jsx)(oe, {'data-slot': 'alert-dialog-action', className: $(className), ...props});
}

/** AlertDialogCancel: closes the dialog, rendered as a secondary Button. */
function Cp({className, variant = 'secondary', size = 'default', shape = 'default', ...props}) {
  return (0, p.jsx)(gu, {'data-slot': 'alert-dialog-cancel', className: $(className), render: (0, p.jsx)(oe, {variant, size, shape}), ...props});
}

/** ContextMenu. */
function Kg({...props}) {
  return (0, p.jsx)(Kd, {'data-slot': 'context-menu', ...props});
}

/** ContextMenuTrigger. */
function Qg({className, ...props}) {
  return (0, p.jsx)(Qd, {'data-slot': 'context-menu-trigger', className: $('select-none', className), ...props});
}

/** ContextMenuContent: opens to the right of the pointer by default. */
function Mp({className, align = 'start', alignOffset = 4, side = 'right', sideOffset = 0, ...props}) {
  return (0, p.jsx)(pr, {
    children: (0, p.jsx)(qd, {
      className: 'isolate z-50 outline-none',
      align,
      alignOffset,
      side,
      sideOffset,
      children: (0, p.jsx)(Kt, {
        'data-slot': 'context-menu-content',
        className: $(
          'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto duration-100 outline-none',
          'bg-glass border-glass rounded-xl p-1 shadow-xl',
          className),
        ...props,
      }),
    }),
  });
}

/** ContextMenuGroup. */
function qg({...props}) {
  return (0, p.jsx)(Di, {'data-slot': 'context-menu-group', ...props});
}

/** ContextMenuItem; `variant` destructive tints it red. */
function Yg({className, inset, variant = 'default', ...props}) {
  return (0, p.jsx)(_i, {
    'data-slot': 'context-menu-item',
    'data-inset': inset,
    'data-variant': variant,
    className: $("group/context-menu-item focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10! data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20! data-[variant=destructive]:*:[svg]:text-destructive relative flex min-h-8 cursor-default items-center gap-2 rounded-lg px-2 py-0.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
    ...props,
  });
}

/** ContextMenuSub. */
function Jg({...props}) {
  return (0, p.jsx)(Gi, {'data-slot': 'context-menu-sub', ...props});
}

/** ContextMenuSubTrigger: an item with a trailing chevron. */
function Zg({className, inset, children, ...props}) {
  return (0, p.jsxs)(Ki, {
    'data-slot': 'context-menu-sub-trigger',
    'data-inset': inset,
    className: $("focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex min-h-8 cursor-default items-center gap-2 rounded-lg px-2 py-0.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
    ...props,
    children: [children, (0, p.jsx)(Ks, {className: 'text-muted-foreground -mr-1 ml-auto', 'data-icon': 'inline-end'})],
  });
}

/** ContextMenuSubContent: a ContextMenuContent beside its trigger. */
function Xg({...props}) {
  return (0, p.jsx)(Mp, {'data-slot': 'context-menu-sub-content', className: 'shadow-lg', side: 'right', ...props});
}

/** ContextMenuSeparator. */
function em({className, ...props}) {
  return (0, p.jsx)('div', {
    className: '-mx-1 my-1',
    children: (0, p.jsx)(fi, {'data-slot': 'context-menu-separator', className: $('bg-border h-hairline mx-px', className), ...props}),
  });
}
