/* Aux-owned source: Popover (assets/strip-markdown-DRcmtuJc.js). This block is part of the chunk's
 * `var` list. Exported here: Dp Popover, _p PopoverTrigger, Wp PopoverContent. Chunk names used:
 * p JSX runtime, $ cn; primitives ef Root, rf Trigger, sf Portal, lf Positioner, df Popup.
 * Aux change: the popup takes the popover corner (rounded-xl, 12px) instead of rounded-2xl. */
Dp = props => (0, p.jsx)(ef, {'data-slot': 'popover', ...props}),
  _p = props => (0, p.jsx)(rf, {'data-slot': 'popover-trigger', ...props}),
  PopoverPortal = props => (0, p.jsx)(sf, {'data-slot': 'popover-portal', ...props}),
  PopoverPositioner = ({className, ...props}) => (0, p.jsx)(lf, {'data-slot': 'popover-positioner', className: $('isolate z-50', className), ...props}),
  // PopoverContent: below its trigger by default, 8px away, flipping or shifting to stay on screen.
  Wp = ({className, side = 'bottom', sideOffset = 8, align = 'center', alignOffset = 0, collisionAvoidance, anchor, ...props}) =>
    (0, p.jsx)(PopoverPortal, {
      children: (0, p.jsx)(PopoverPositioner, {
        align,
        alignOffset,
        collisionAvoidance,
        anchor,
        side,
        sideOffset,
        children: (0, p.jsx)(df, {
          'data-slot': 'popover-content',
          className: $(
            'no-drag data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-none',
            'bg-glass border-glass rounded-xl shadow-xl',
            className),
          ...props,
        }),
      }),
    });
