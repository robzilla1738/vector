/* Aux-owned source: ScrollArea (assets/scroll-area-DxAxP4Y6.js, Ke exported as t). Chunk names used:
 * B JSX runtime, zt cn; primitives Me Root, Xe Viewport, ze Scrollbar, Le Thumb, De Corner.
 * With `effect` (the default) the viewport fades out at whichever edges have more to scroll. */

var SCROLL_FADE_EDGES = [
  '[&[data-overflow-y-start][data-overflow-y-end]_[data-slot=scroll-area-viewport]]:scroll-fade-effect-y',
  '[&[data-overflow-y-start]:not([data-overflow-y-end])_[data-slot=scroll-area-viewport]]:scroll-fade-effect-t',
  '[&:not([data-overflow-y-start])[data-overflow-y-end]_[data-slot=scroll-area-viewport]]:scroll-fade-effect-b',
  '[&[data-overflow-x-start][data-overflow-x-end]_[data-slot=scroll-area-viewport]]:scroll-fade-effect-x',
  '[&[data-overflow-x-start]:not([data-overflow-x-end])_[data-slot=scroll-area-viewport]]:scroll-fade-effect-l',
  '[&:not([data-overflow-x-start])[data-overflow-x-end]_[data-slot=scroll-area-viewport]]:scroll-fade-effect-r',
];

/** ScrollArea (exported as t). The scrollbar shows on hover, while scrolling, or when the viewport has focus. */
function Ke({className, children, effect = true, viewportRef, ...props}) {
  return (0, B.jsxs)(Me, {
    'data-slot': 'scroll-area',
    className: zt('relative', className, effect && [...SCROLL_FADE_EDGES],
      '[&:has([data-slot=scroll-area-viewport]:focus-visible)_[data-slot=scroll-area-scrollbar]]:opacity-100'),
    ...props,
    children: [
      (0, B.jsx)(Xe, {
        ref: viewportRef,
        'data-slot': 'scroll-area-viewport',
        className: 'focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1',
        children,
      }),
      (0, B.jsx)(ScrollBar, {className: zt(effect && 'p-2 data-horizontal:h-6 data-vertical:w-6')}),
      (0, B.jsx)(De, {}),
    ],
  });
}

function ScrollBar({className, orientation = 'vertical', ...props}) {
  return (0, B.jsx)(ze, {
    'data-slot': 'scroll-area-scrollbar',
    'data-orientation': orientation,
    orientation,
    className: zt('relative z-10 flex touch-none p-1 opacity-0 transition-[opacity,color] duration-150 select-none focus-within:opacity-100 hover:opacity-100 data-horizontal:h-4 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-4 data-vertical:border-l data-vertical:border-l-transparent data-[scrolling]:opacity-100', className),
    ...props,
    children: (0, B.jsx)(Le, {'data-slot': 'scroll-area-thumb', className: 'bg-border relative flex-1 rounded-full'}),
  });
}
