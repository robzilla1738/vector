/* Aux-owned source: the Tooltip parts (assets/tooltip-Q2cPCEgr.js). Exported here: Eo TooltipProvider,
 * Po createTooltipHandle, So Tooltip, Ro TooltipTrigger, Co TooltipContent.
 * Chunk names used: V JSX runtime, Ue cn, io the handle factory; primitives qn Provider, _n Root,
 * Xn Trigger, $n Portal, zn Positioner, Wn Popup, ro Viewport (the travelling tooltip's content). */

/** TooltipProvider (exported as r). Tooltips under one provider share a delay; the default is none. */
function Eo({delay = 0, ...props}) {
  return (0, V.jsx)(qn, {'data-slot': 'tooltip-provider', delay, ...props});
}

/** createTooltipHandle (exported as a): lets a detached trigger open a tooltip. */
var Po = io;

/** Tooltip (exported as t). The popup is not hoverable unless asked. */
function So({disableHoverablePopup = true, ...props}) {
  return (0, V.jsx)(_n, {'data-slot': 'tooltip', disableHoverablePopup, ...props});
}

/** TooltipTrigger (exported as i). Not a tab stop of its own. */
function Ro({...props}) {
  return (0, V.jsx)(Xn, {'data-slot': 'tooltip-trigger', tabIndex: -1, ...props});
}

var TRAVEL_POSITIONER = 'h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none',
  TRAVEL_POPUP = 'h-(--popup-height) w-(--popup-width) overflow-hidden whitespace-nowrap transition-[opacity,scale,width,height] delay-[80ms,80ms,0ms,0ms] duration-[150ms,150ms,160ms,160ms] ease-[ease-out,ease-out,cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:delay-0 data-ending-style:duration-50 data-starting-style:scale-98 data-starting-style:opacity-0 motion-reduce:transition-none',
  STILL_POPUP = 'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 w-fit';

/** TooltipContent (exported as n). With `travel`, one popup glides between triggers and resizes to each label. */
function Co({className, side = 'top', sideOffset = 4, align = 'center', alignOffset = 0, travel = false, children, ...props}) {
  return (0, V.jsx)($n, {
    children: (0, V.jsx)(zn, {
      align,
      alignOffset,
      side,
      sideOffset,
      className: Ue('isolate z-50', travel && TRAVEL_POSITIONER),
      children: (0, V.jsx)(Wn, {
        'data-slot': 'tooltip-content',
        className: Ue(
          travel ? TRAVEL_POPUP : STILL_POPUP,
          'z-50 inline-flex max-w-xs origin-(--transform-origin) items-center gap-1.5 has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm',
          'bg-popover border-glass no-squircle text-surface-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium shadow-md dark:font-normal',
          className),
        ...props,
        children: travel ? (0, V.jsx)(ro, {className: '*:flex *:items-center *:gap-1.5 *:data-previous:hidden', children}) : children,
      }),
    }),
  });
}
