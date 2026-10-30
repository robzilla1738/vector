/* Aux-owned source: the subagent icon and its colors (assets/subagent-icon-B78zcDX8.js, the module body).
 * Each subagent in a session keeps one color; siblings get different ones while any are free. The
 * gradient colors are the icon's own, for light and dark.
 * Names the rest of the chunk uses keep their chunk names: j the icon, A the color map (exported).
 * Chunk names used: f/p React, v JSX runtime, m cn, x the mark. */
var React = f(p(), 1),
  jsxRuntime = v(),
  /** The icon. */
  j = ({color = 'mono', className, style, ...props}) => {
    const id = (0, React.useId)().replaceAll(':', ''),
      lightId = `subagent-gradient-light-${id}`,
      darkId = `subagent-gradient-dark-${id}`,
      colorName = SUBAGENT_COLORS.find(option => option === color) ?? 'neutral',
      [lightFrom, darkFrom, to] = GRADIENTS[colorName];
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)('svg', {
          'aria-hidden': 'true',
          className: 'absolute size-0',
          children: (0, jsxRuntime.jsxs)('defs', {
            children: [
              (0, jsxRuntime.jsx)(IconGradient, {from: lightFrom, id: lightId, to}),
              (0, jsxRuntime.jsx)(IconGradient, {from: darkFrom, id: darkId, to}),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)(x, {
          ...props,
          className: m(
            'size-4 [&_path]:fill-[var(--subagent-gradient)] dark:[&_path]:fill-[var(--subagent-dark-gradient)]',
            className,
          ),
          style: {'--subagent-gradient': `url(#${lightId})`, '--subagent-dark-gradient': `url(#${darkId})`, ...style},
        }),
      ],
    });
  },
  /** One gradient. */
  IconGradient = ({from, id, to}) =>
    (0, jsxRuntime.jsxs)('linearGradient', {
      id,
      x2: '1',
      y2: '1',
      children: [
        (0, jsxRuntime.jsx)('stop', {stopColor: from}),
        (0, jsxRuntime.jsx)('stop', {offset: '1', stopColor: to}),
      ],
    }),
  /** The colors a subagent can take. */
  SUBAGENT_COLORS = ['orange', 'yellow', 'green', 'sky', 'indigo', 'violet', 'pink', 'red'],
  /** Light start, dark start and shared end of each color. */
  GRADIENTS = {
    neutral: ['oklch(70.8% 0 0)', 'oklch(87% 0 0)', 'oklch(43.9% 0 0)'],
    orange: ['oklch(75% 0.183 55.934)', 'oklch(83.7% 0.128 66.29)', 'oklch(64.6% 0.222 41.116)'],
    yellow: ['oklch(85.2% 0.199 91.936)', 'oklch(90.5% 0.182 98.111)', 'oklch(68.1% 0.162 75.834)'],
    green: ['oklch(79.2% 0.209 151.711)', 'oklch(87.1% 0.15 154.449)', 'oklch(62.7% 0.194 149.214)'],
    sky: ['oklch(74.6% 0.16 232.661)', 'oklch(82.8% 0.111 230.318)', 'oklch(58.8% 0.158 241.966)'],
    indigo: ['oklch(67.3% 0.182 276.935)', 'oklch(78.5% 0.115 274.713)', 'oklch(51.1% 0.262 276.966)'],
    violet: ['oklch(70.2% 0.183 293.541)', 'oklch(81.1% 0.111 293.571)', 'oklch(54.1% 0.281 293.009)'],
    pink: ['oklch(71.8% 0.202 349.761)', 'oklch(82.3% 0.12 346.018)', 'oklch(59.2% 0.249 0.584)'],
    red: ['oklch(70.4% 0.191 22.216)', 'oklch(80.8% 0.114 19.571)', 'oklch(57.7% 0.245 27.325)'],
  },
  /** A color for each subagent. */
  A = subagents => {
    const used = new Set(),
      colors = new Map();
    for (const subagent of subagents) {
      const color = pickColor(subagent.sessionId, used);
      (used.add(color), colors.set(subagent.sessionId, color));
    }
    return colors;
  },
  /** The first free color from the session's own. */
  pickColor = (sessionId, used) => {
    const start = colorIndex(sessionId);
    for (let offset = 0; offset < SUBAGENT_COLORS.length; offset += 1) {
      const color = SUBAGENT_COLORS[(start + offset) % SUBAGENT_COLORS.length];
      if (!used.has(color)) return color;
    }
    return SUBAGENT_COLORS[start];
  },
  /** A session's own color. */
  colorIndex = sessionId =>
    [...sessionId].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0) % SUBAGENT_COLORS.length;
