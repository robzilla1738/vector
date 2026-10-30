/* Aux-owned source: Input and InputGroup (assets/strip-markdown-DRcmtuJc.js). Exported here: mi Input,
 * og InputGroup, sg InputGroupAddon, ig InputGroupButton, ag InputGroupInput.
 * Chunk names used: p JSX runtime, $ cn, Nt cva, kc the headless input, oe Button. */

/** Input. */
function mi({className, type, ...props}) {
  return (0, p.jsx)(kc, {
    type,
    'data-slot': 'input',
    className: $('border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 truncate rounded-lg border bg-transparent px-2.5 py-1 text-base text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3', className),
    ...props,
  });
}

/** InputGroup: the field frame around an input or textarea and its addons; it takes the focus ring. */
function og({className, ...props}) {
  return (0, p.jsx)('div', {
    'data-slot': 'input-group',
    role: 'group',
    className: $('group/input-group border-input has-disabled:bg-input/50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:bg-input/30 dark:has-disabled:bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:border-destructive/50 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 relative flex h-8 w-full min-w-0 items-center rounded-lg border transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-3 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5', className),
    ...props,
  });
}

var inputGroupAddonVariants = Nt("text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
  variants: {
    align: {
      'inline-start': 'order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]',
      'inline-end': 'order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]',
      'block-start': 'order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2',
      'block-end': 'order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2',
    },
  },
  defaultVariants: {align: 'inline-start'},
});

/** InputGroupAddon: an icon, label or button beside the input; clicking it (not its buttons) focuses the input. */
function sg({className, align = 'inline-start', ...props}) {
  return (0, p.jsx)('div', {
    role: 'group',
    'data-slot': 'input-group-addon',
    'data-align': align,
    className: $(inputGroupAddonVariants({align}), className),
    onPointerDown: event => {
      event.target.closest('button') || event.currentTarget.parentElement?.querySelector('input')?.focus();
    },
    ...props,
  });
}

var inputGroupButtonVariants = Nt('flex items-center gap-2 text-sm shadow-none', {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
      sm: '',
      'icon-xs': 'size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0',
      'icon-sm': 'size-7 p-0 has-[>svg]:p-0',
      icon: 'size-8 p-0 has-[>svg]:p-0',
    },
  },
  defaultVariants: {size: 'xs'},
});

/** InputGroupButton: a ghost button sized for the group. */
function ig({className, type = 'button', variant = 'ghost', size = 'xs', ...props}) {
  return (0, p.jsx)(oe, {type, 'data-size': size, variant, className: $(inputGroupButtonVariants({size}), className), ...props});
}

/** InputGroupInput: an Input without its own frame. */
function ag({className, ...props}) {
  return (0, p.jsx)(mi, {
    'data-slot': 'input-group-control',
    className: $('flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent', className),
    ...props,
  });
}
