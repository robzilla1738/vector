/* Aux-owned source: Dialog and its parts (assets/dialog-BAUCI3Qq.js). The export stays
 * `export{E as a,T as c,F as i,P as n,B as o,q as r,A as s,R as t}`.
 * Imports used here: browser-color-scheme n interop, d React, g JSX runtime, e cn; circle-x c (icon);
 * button u (Button); usePreviousValue m (component factory); DialogTrigger: f useDialogRoot, v Trigger,
 * j Portal, r Close, h Backdrop, p Popup, D Title, x Description.
 * Aux change: the content and footer take the popover corner (rounded-xl, 12px) instead of rounded-2xl. */
var DialogRoot = m(function DialogRoot(props) {
    return f('dialog', props);
  }),
  React = n(d(), 1),
  jsxRuntime = g();

/** Dialog (exported as t). */
function R({...props}) {
  return (0, jsxRuntime.jsx)(DialogRoot, {'data-slot': 'dialog', ...props});
}

/** DialogTrigger (exported as c). */
function T({...props}) {
  return (0, jsxRuntime.jsx)(v, {'data-slot': 'dialog-trigger', ...props});
}

function DialogPortal({...props}) {
  return (0, jsxRuntime.jsx)(j, {'data-slot': 'dialog-portal', ...props});
}

/** DialogClose (exported as n). */
function P({...props}) {
  return (0, jsxRuntime.jsx)(r, {'data-slot': 'dialog-close', ...props});
}

function DialogOverlay({className, ...props}) {
  return (0, jsxRuntime.jsx)(h, {
    'data-slot': 'dialog-overlay',
    className: e('data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/15 duration-100 supports-backdrop-filter:backdrop-blur-xs', className),
    ...props,
  });
}

/** DialogContent (exported as r): the overlay and the centred card, with a close button unless showCloseButton is false. */
function q({className, overlayClassName, children, showCloseButton = true, ...props}) {
  return (0, jsxRuntime.jsxs)(DialogPortal, {
    children: [
      (0, jsxRuntime.jsx)(DialogOverlay, {className: overlayClassName}),
      (0, jsxRuntime.jsxs)(p, {
        'data-slot': 'dialog-content',
        className: e(
          'no-drag data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 text-sm duration-100 outline-none sm:max-w-sm',
          'bg-popover border-glass rounded-xl px-6 py-5 shadow-2xl',
          className),
        ...props,
        children: [
          children,
          showCloseButton && (0, jsxRuntime.jsxs)(r, {
            'data-slot': 'dialog-close',
            render: (0, jsxRuntime.jsx)(u, {variant: 'ghost', className: 'text-secondary-foreground/50 absolute top-2 right-2', size: 'icon-xs', shape: 'pill'}),
            children: [
              (0, jsxRuntime.jsx)(c, {className: 'size-4!'}),
              (0, jsxRuntime.jsx)('span', {className: 'sr-only', children: 'Close'}),
            ],
          }),
        ],
      }),
    ],
  });
}

/** DialogHeader (exported as o). */
function B({className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {'data-slot': 'dialog-header', className: e('flex flex-col gap-0.5 pr-4', className), ...props});
}

/** DialogFooter (exported as a): bleeds to the card's edges and takes its bottom corners. */
function E({className, children, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'dialog-footer',
    className: e('-mx-5 -mb-5 flex shrink-0 flex-col-reverse gap-1 rounded-b-xl p-4 sm:flex-row sm:justify-end', className),
    ...props,
    children,
  });
}

/** DialogTitle (exported as s). */
function A({className, ...props}) {
  return (0, jsxRuntime.jsx)(D, {'data-slot': 'dialog-title', className: e('font-display text-lg leading-snug font-medium', className), ...props});
}

/** DialogDescription (exported as i). */
function F({className, ...props}) {
  return (0, jsxRuntime.jsx)(x, {
    'data-slot': 'dialog-description',
    className: e('text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3', className),
    ...props,
  });
}
