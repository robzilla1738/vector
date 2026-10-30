/* Aux-owned source: Switch (assets/switch-BeLEn4vU.js, exported as t). The glass switch: an
 * emerald track and a white thumb that, while pressed or dragged, grows into a refracting glass lens
 * (an SVG displacement filter built once from a canvas-drawn map).
 * Imports used here: browser-color-scheme T interop, G React, P JSX runtime, D cn; react-Da396Co4 R (motion). */
var React = T(G(), 1),
  jsxRuntime = P();

/** The lens filter: refracts what is under the thumb through `displacementMap`. */
function GlassFilter({displacementMap, id}) {
  return (0, jsxRuntime.jsx)('svg', {
    'aria-hidden': 'true',
    className: 'absolute size-0 overflow-hidden',
    children: (0, jsxRuntime.jsxs)('filter', {
      id,
      filterUnits: 'objectBoundingBox',
      primitiveUnits: 'objectBoundingBox',
      colorInterpolationFilters: 'sRGB',
      x: '-0.18',
      y: '-0.35',
      width: '1.36',
      height: '1.7',
      children: [
        (0, jsxRuntime.jsx)('feFlood', {floodColor: 'rgb(128,128,128)', result: 'mapBg'}),
        (0, jsxRuntime.jsx)('feImage', {href: displacementMap, x: '0', y: '0', width: '1', height: '1', preserveAspectRatio: 'none', result: 'rawMap'}),
        (0, jsxRuntime.jsx)('feComposite', {in: 'rawMap', in2: 'mapBg', operator: 'over', result: 'map'}),
        (0, jsxRuntime.jsx)('feGaussianBlur', {in: 'SourceGraphic', stdDeviation: '0.006', result: 'soft'}),
        (0, jsxRuntime.jsx)('feDisplacementMap', {in: 'soft', in2: 'map', scale: '0.045', xChannelSelector: 'R', yChannelSelector: 'G', result: 'refracted'}),
        (0, jsxRuntime.jsx)('feColorMatrix', {in: 'refracted', type: 'saturate', values: '1.25'}),
      ],
    }),
  });
}

var LENS = {width: 64, height: 42, radius: 20, strength: 96, edgeWidth: 9},
  THUMB_SPRING = {type: 'spring', stiffness: 540, damping: 32, mass: 0.65},
  cachedDisplacementMap = null,
  clamp = (value, min, max) => Math.min(Math.max(value, min), max),
  smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },
  // Signed distance from (x, y) to a rounded rectangle centred on the origin.
  roundedRectDistance = (x, y, halfWidth, halfHeight, radius) => {
    const dx = Math.abs(x) - (halfWidth - radius);
    const dy = Math.abs(y) - (halfHeight - radius);
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radius;
  },
  // A PNG data URL: red and green push pixels outward near the lens edge, blue adds a highlight.
  drawDisplacementMap = ({width, height, radius, strength, edgeWidth}) => {
    if (typeof document > 'u') return '';
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return '';
    const image = context.createImageData(width, height);
    const halfWidth = (width - 1) / 2;
    const halfHeight = (height - 1) / 2;
    const lightX = Math.cos(-0.8);
    const lightY = Math.sin(-0.8);
    for (let row = 0; row < height; row++) {
      const y = row - halfHeight;
      for (let column = 0; column < width; column++) {
        const x = column - halfWidth;
        const pixel = (row * width + column) * 4;
        const distance = roundedRectDistance(x, y, halfWidth, halfHeight, radius);
        if (distance > 0) {
          image.data[pixel] = 128, image.data[pixel + 1] = 128, image.data[pixel + 2] = 128, image.data[pixel + 3] = 255;
          continue;
        }
        const edge = 1 - smoothstep(0, edgeWidth, -distance);
        const falloff = 1 - clamp((x / halfWidth) ** 2 * 0.35 + (y / halfHeight) ** 2 * 0.35, 0, 1);
        const highlight = Math.max(0, x / halfWidth * lightX + y / halfHeight * lightY) * edge;
        image.data[pixel] = clamp(Math.round(128 + x / halfWidth * edge * falloff * strength), 0, 255);
        image.data[pixel + 1] = clamp(Math.round(128 + y / halfHeight * edge * falloff * strength), 0, 255);
        image.data[pixel + 2] = clamp(Math.round(128 + highlight * 95), 0, 255);
        image.data[pixel + 3] = 255;
      }
    }
    return context.putImageData(image, 0, 0), canvas.toDataURL('image/png');
  },
  displacementMap = () => {
    if (cachedDisplacementMap) return cachedDisplacementMap;
    const map = drawDisplacementMap(LENS);
    return map && (cachedDisplacementMap = map), map;
  };

/** Switch (exported as t): a controlled button with role switch. Click toggles; dragging the thumb
 * past the middle sets the value on release, and the click that follows a drag only reaches onClick. */
function H({className, checked = false, onCheckedChange, onClick, onPointerCancel, onPointerDown, onPointerMove, onPointerUp, ...props}) {
  const filterId = React.useId().replace(/:/g, '');
  const [dragCenter, setDragCenter] = React.useState(null);
  const drag = React.useRef(null);
  const justDragged = React.useRef(false);
  const map = displacementMap();
  const pressed = dragCenter !== null;
  const thumbWidth = pressed ? 36 : 24;
  const thumbHeight = pressed ? 24 : 16;
  const offCenter = 14;
  const onCenter = 26;
  const thumbX = pressed ? (dragCenter ?? (checked ? onCenter : offCenter)) - thumbWidth / 2 : checked ? 14 : 2;
  const thumbY = pressed ? -2 : 2;
  return (0, jsxRuntime.jsxs)('button', {
    ...props,
    type: 'button',
    role: 'switch',
    'aria-checked': checked,
    'data-slot': 'switch',
    'data-state': checked ? 'checked' : 'unchecked',
    className: D(
      'focus-visible:ring-ring/50 relative inline-flex h-5 min-h-5 w-10 min-w-10 shrink-0 cursor-pointer items-center overflow-visible rounded-full align-middle transition-colors duration-200 focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-emerald-500' : 'dark:bg-muted bg-neutral-200',
      className),
    onClick: event => {
      if (!props.disabled) {
        if (justDragged.current) {
          justDragged.current = false, onClick?.(event);
          return;
        }
        onCheckedChange?.(!checked), onClick?.(event);
      }
    },
    onPointerCancel: event => {
      setDragCenter(null), drag.current = null, onPointerCancel?.(event);
    },
    onPointerDown: event => {
      if (props.disabled) return;
      const start = checked ? onCenter : offCenter;
      const bounds = event.currentTarget.getBoundingClientRect();
      setDragCenter(start);
      drag.current = {hasDragged: false, offsetX: event.clientX - bounds.left - start, pointerId: event.pointerId, startCenterX: start};
      event.currentTarget.focus(), event.currentTarget.setPointerCapture(event.pointerId), onPointerDown?.(event);
    },
    onPointerMove: event => {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) {
        onPointerMove?.(event);
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      const center = Math.min(Math.max(event.clientX - bounds.left - current.offsetX, offCenter), onCenter);
      current.hasDragged ||= Math.abs(center - current.startCenterX) > 3;
      setDragCenter(center), onPointerMove?.(event);
    },
    onPointerUp: event => {
      const current = drag.current;
      if (props.disabled || !current) {
        setDragCenter(null), drag.current = null, onPointerUp?.(event);
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      const center = Math.min(Math.max(event.clientX - bounds.left - current.offsetX, offCenter), onCenter);
      const next = current.hasDragged || Math.abs(center - current.startCenterX) > 3 ? center >= 20 : !checked;
      setDragCenter(null), drag.current = null;
      event.currentTarget.hasPointerCapture(event.pointerId) && event.currentTarget.releasePointerCapture(event.pointerId);
      onCheckedChange?.(next), justDragged.current = true, onPointerUp?.(event);
    },
    children: [
      (0, jsxRuntime.jsx)(GlassFilter, {displacementMap: map, id: `switch-glass-${filterId}`}),
      (0, jsxRuntime.jsx)('span', {className: D('absolute inset-0 rounded-full bg-emerald-500 transition-opacity duration-200', checked ? 'opacity-100' : 'opacity-0')}),
      // The solid thumb, shown at rest.
      (0, jsxRuntime.jsx)(R.span, {
        animate: {height: thumbHeight, opacity: pressed ? 0 : 1, width: thumbWidth, x: thumbX, y: thumbY},
        className: 'pointer-events-none absolute top-0 left-0 block overflow-hidden rounded-full bg-white shadow-sm',
        initial: false,
        transition: THUMB_SPRING,
      }),
      // The glass lens, shown while pressed: a copy of the track, refracted.
      (0, jsxRuntime.jsx)(R.span, {
        animate: {height: thumbHeight, opacity: pressed ? 1 : 0, width: thumbWidth, x: thumbX, y: thumbY},
        className: 'pointer-events-none absolute top-0 left-0 overflow-hidden rounded-full bg-white/15 opacity-0 shadow-[0_0_0_1px_rgb(255_255_255_/_0.42),inset_1px_0_0_rgb(255_255_255_/_0.95),inset_-1px_0_0_rgb(125_211_252_/_0.45),inset_0_-1px_1px_rgb(0_0_0_/_0.18)] backdrop-blur-[1px]',
        initial: false,
        transition: THUMB_SPRING,
        children: (0, jsxRuntime.jsx)('span', {
          className: D('absolute top-[-2px] left-[-2px] h-5 w-10 rounded-full transition-colors duration-200', checked ? 'bg-emerald-500/35' : 'dark:bg-muted/55 bg-neutral-200'),
          style: {filter: `url(#switch-glass-${filterId})`, transform: `translate(${-thumbX}px, ${-thumbY}px)`},
        }),
      }),
    ],
  });
}
