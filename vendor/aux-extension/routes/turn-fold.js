/* Aux-owned source, assistant step rows pass 2 (assets/turn-fold-B4gN_g5e.js, after the bundled Radix
 * hooks to the end of the module): folding a finished turn's activity behind "Worked for …".
 * Names the rest of the chunk uses keep their chunk names (all exported): le TurnFold, ie
 * TurnFoldTrigger, ce TurnFoldContent, ue WorkedFor.
 * Chunk names used: t JSX runtime, s React, C cn, z useControllableState, T/k the collapsible root and
 * panel, _ / S the chevron and spinner, H the duration label. */
le = ({children, open, defaultOpen = false, onOpenChange}) => {
    const [o, a] = z({prop: open, defaultProp: defaultOpen, onChange: onOpenChange}),
      l = (0, s.useMemo)(() => ({open: o, setOpen: a}), [o, a]);
    return (0, t.jsx)(TurnFoldContext, {value: l, children});
  },
  ie = ({children, className, loading = false, disabled, onClick, ...a}) => {
    const {open, setOpen} = useTurnFold(),
      u = c => {
        (onClick?.(c), c.defaultPrevented || setOpen(!open));
      };
    return (0, t.jsxs)('button', {
      ...a,
      type: 'button',
      'aria-expanded': open,
      'aria-busy': loading || void 0,
      disabled: disabled || loading,
      className: C(
        'group/run-fold text-muted-foreground hover:text-foreground flex min-h-6 items-center gap-1 pb-2 text-sm tabular-nums transition-colors select-none',
        className,
      ),
      onClick: u,
      children: [
        children,
        loading
          ? (0, t.jsx)(S, {className: 'size-4 shrink-0', 'aria-label': 'Loading activity'})
          : (0, t.jsx)(_, {className: 'size-4 shrink-0 transition-transform group-aria-expanded/run-fold:rotate-90'}),
      ],
    });
  },
  ce = ({children}) => {
    const {open} = useTurnFold();
    return (0, t.jsx)(T, {
      open,
      children: (0, t.jsx)(k, {
        className:
          '-mx-2 h-(--collapsible-panel-height) w-[calc(100%+1rem)] overflow-hidden px-2 transition-[height] duration-200 ease-out [interpolate-size:allow-keywords] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none starting:h-0',
        keepMounted: open,
        children,
      }),
    });
  },
  ue = ({duration, working = false}) =>
    (0, t.jsxs)('span', {
      children: [working ? 'Working for' : 'Worked for', ' ', duration !== void 0 ? H(duration) : 'a moment'],
    }),
  TurnFoldContext = (0, s.createContext)(null),
  useTurnFold = () => {
    const e = (0, s.useContext)(TurnFoldContext);
    if (!e) throw new Error('TurnFold components must be rendered inside TurnFold');
    return e;
  }
