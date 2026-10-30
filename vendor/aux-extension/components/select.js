/* Aux-owned source: the Select parts (assets/select-B-J-L73E.js). This block is part of the chunk's
 * `var` list, between the headless primitives and the value-label helpers (Et, Zo) that follow it.
 * Exported here: Sr SelectGroup, vr SelectValue, br SelectTrigger, yr SelectContent, qo SelectItem
 * (also matched by identity when the chunk collects item labels), Rr SelectSeparator.
 * Chunk names used: r React, f JSX runtime, xe cn, Gt the item-labels context; primitives zo Group,
 * Co Value, wo Trigger, Mo Icon, To Portal, Eo Positioner, Vo Popup, Lo List, Oo Item, Fo ItemText,
 * Ho ItemIndicator, _o Separator, Bo ScrollUpArrow, Do ScrollDownArrow; icons no chevron, oo up,
 * ln down, rn checkmark.
 * Aux change: the popup takes the popover corner (rounded-xl, 12px) instead of rounded-2xl. */
Sr = function SelectGroup({className, ...props}) {
    return (0, f.jsx)(zo, {'data-slot': 'select-group', className: xe('scroll-my-1 pb-1.5', className), ...props});
  },
  // The selected item's label, from the items prop or the items' own labels when the value has no children.
  vr = function SelectValue({className, children, placeholder, ...props}) {
    const labels = (0, r.use)(Gt);
    return (0, f.jsx)(Co, {
      'data-slot': 'select-value',
      className: xe('flex flex-1 text-left', className),
      placeholder,
      ...props,
      children: children ?? (value => Zo(value, placeholder, labels)),
    });
  },
  br = function SelectTrigger({className, icon = (0, f.jsx)(no, {className: 'text-muted-foreground pointer-events-none size-4', 'data-icon': 'inline-end'}), size = 'default', children, ...props}) {
    return (0, f.jsxs)(wo, {
      'data-slot': 'select-trigger',
      'data-size': size,
      className: xe("border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex w-fit items-center justify-between gap-1.5 rounded-lg border bg-transparent px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
      ...props,
      children: [children, (0, f.jsx)(Mo, {render: icon})],
    });
  },
  // By default the popup opens over the trigger with the selected item aligned to it.
  yr = function SelectContent({className, children, side = 'bottom', sideOffset = 4, align = 'center', alignOffset = 0, alignItemWithTrigger = true, ...props}) {
    return (0, f.jsx)(To, {
      children: (0, f.jsx)(Eo, {
        side,
        sideOffset,
        align,
        alignOffset,
        alignItemWithTrigger,
        className: 'isolate z-50',
        children: (0, f.jsxs)(Vo, {
          'data-slot': 'select-content',
          'data-align-trigger': alignItemWithTrigger,
          className: xe(
            'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative isolate z-50 flex max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) flex-col overflow-hidden rounded-xl p-1.5 shadow-lg duration-100 data-[align-trigger=true]:animate-none',
            'bg-glass border-glass',
            className),
          ...props,
          children: [
            (0, f.jsx)(SelectScrollUpButton, {}),
            (0, f.jsx)(Lo, {className: 'min-h-0 overflow-x-hidden overflow-y-auto', children}),
            (0, f.jsx)(SelectScrollDownButton, {}),
          ],
        }),
      }),
    });
  },
  qo = function SelectItem({className, children, ...props}) {
    return (0, f.jsxs)(Oo, {
      'data-slot': 'select-item',
      className: xe("focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-xl py-1.5 pr-10 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
      ...props,
      children: [
        (0, f.jsx)(Fo, {className: 'inline-flex min-w-0 flex-1 items-center gap-1.5 truncate', children}),
        (0, f.jsx)(Ho, {
          render: (0, f.jsx)('span', {className: 'pointer-events-none absolute right-2 flex size-4 items-center justify-center'}),
          children: (0, f.jsx)(rn, {className: 'pointer-events-none size-3!'}),
        }),
      ],
    });
  },
  Rr = function SelectSeparator({className, ...props}) {
    return (0, f.jsx)('div', {
      className: '-mx-1 my-1',
      children: (0, f.jsx)(_o, {'data-slot': 'select-separator', className: xe('bg-border h-hairline pointer-events-none', className), ...props}),
    });
  },
  SelectScrollUpButton = function SelectScrollUpButton({className, ...props}) {
    return (0, f.jsx)(Bo, {
      'data-slot': 'select-scroll-up-button',
      className: xe("from-popover top-0 right-0 left-0 z-10 flex w-auto cursor-default items-center justify-center bg-linear-to-b to-transparent py-1 [&_svg:not([class*='size-'])]:size-4", className),
      ...props,
      children: (0, f.jsx)(oo, {}),
    });
  },
  SelectScrollDownButton = function SelectScrollDownButton({className, ...props}) {
    return (0, f.jsx)(Do, {
      'data-slot': 'select-scroll-down-button',
      className: xe("to-popover right-0 bottom-0 left-0 z-10 flex w-auto cursor-default items-center justify-center bg-linear-to-b from-transparent py-1 [&_svg:not([class*='size-'])]:size-4", className),
      ...props,
      children: (0, f.jsx)(ln, {}),
    });
  }