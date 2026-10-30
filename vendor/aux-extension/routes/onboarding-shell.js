/* Aux-owned source: the onboarding layout (assets/route-CSKkWqf5.js, the module body): the step dots
 * and step analytics, and the right panel with its two hero animations: the glance prompts and
 * scrolling app rows, and the sign-in demo. The heroes stay fixed light illustrations, whatever the theme.
 * Names the rest of the chunk uses keep their chunk names: oe the layout (exported).
 * Chunk names used: y/I React, P JSX runtime, _ cn, S Outlet, z useAnalytics, u useReducedMotion,
 * E TextShimmer, p useRouterState, c motion, R/T the onboarding context and its provider. */
var React = y(I(), 1),
  BACKGROUND_IMAGE = '/assets/background-DmA5he4Z.avif',
  ROW_ONE_IMAGE = '/assets/illust-row-1-a2Jz7t0Y.webp',
  ROW_TWO_IMAGE = '/assets/illust-row-2-CNQbEInY.webp',
  jsxRuntime = P(),
  /** The glance hero. */
  GlanceHero = ({paused = false}) => {
    const reducedMotion = u(),
      isPaused = paused || !!reducedMotion;
    return (0, jsxRuntime.jsx)('div', {
      className: 'light size-full p-2.5',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'pointer-events-none relative size-full overflow-hidden rounded-xl select-none',
        children: [
          (0, jsxRuntime.jsx)('img', {
            src: BACKGROUND_IMAGE,
            alt: '',
            className: 'absolute inset-0 size-full object-cover object-right',
          }),
          (0, jsxRuntime.jsx)('div', {
            className: 'absolute top-32 left-1/2 z-1 w-full -translate-x-1/2',
            children: (0, jsxRuntime.jsx)(PromptStack, {paused: isPaused}),
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'absolute inset-x-0 bottom-10 z-1 flex flex-col gap-4 opacity-90',
            children: [
              (0, jsxRuntime.jsx)(IllustrationRow, {
                src: ROW_ONE_IMAGE,
                direction: 'left',
                duration: 28,
                paused: isPaused,
              }),
              (0, jsxRuntime.jsx)(IllustrationRow, {
                src: ROW_TWO_IMAGE,
                direction: 'right',
                duration: 32,
                paused: isPaused,
              }),
            ],
          }),
        ],
      }),
    });
  },
  /** A row of app logos, scrolling forever. */
  IllustrationRow = ({src, direction, duration, paused}) => {
    const end = direction === 'left' ? '-50%' : '0%',
      start = direction === 'left' ? '0%' : '-50%';
    return (0, jsxRuntime.jsx)('div', {
      className: 'overflow-hidden',
      children: (0, jsxRuntime.jsxs)(c.div, {
        className: 'flex w-max',
        initial: {x: start},
        animate: paused ? {x: start} : {x: [start, end]},
        transition: {duration, repeat: 1 / 0, ease: 'linear'},
        children: [
          (0, jsxRuntime.jsx)('img', {src, alt: '', className: 'mr-4 h-[52px] w-auto shrink-0', draggable: false}),
          (0, jsxRuntime.jsx)('img', {
            src,
            alt: '',
            className: 'h-[52px] w-auto shrink-0',
            'aria-hidden': true,
            draggable: false,
          }),
        ],
      }),
    });
  },
  /** What the stack cycles through. */
  PROMPTS = ['Find unused subs and request refunds', 'Draft replies in my LinkedIn inbox', 'Write an investor update'],
  /** Each slot of the stack, front first. */
  STACK_POSITIONS = {
    0: {y: 0, scale: 1, opacity: 1, blur: 0, zIndex: 3},
    1: {y: 48, scale: 0.9, opacity: 0.6, blur: 0.6, zIndex: 2},
    2: {y: 96, scale: 0.8, opacity: 0.3, blur: 1, zIndex: 1},
  },
  /** Which slot each prompt starts in. */
  INITIAL_SLOTS = {0: 0, 1: 1, 2: 2},
  /** The slot a prompt moves to. */
  nextSlot = slot => (slot === 0 ? 2 : slot - 1),
  /** Every prompt moved along. */
  rotateSlots = slots => Object.fromEntries(Object.entries(slots).map(([prompt, slot]) => [prompt, nextSlot(slot)])),
  /** The prompt stack; the front one drops to the back. */
  PromptStack = ({paused}) => {
    const [slots, setSlots] = (0, React.useState)(INITIAL_SLOTS);
    return (
      (0, React.useEffect)(() => {
        if (paused) return;
        const timer = setInterval(() => setSlots(rotateSlots), 2800);
        return () => clearInterval(timer);
      }, [paused]),
      (0, jsxRuntime.jsx)('div', {
        className: 'relative mx-auto h-[120px] w-max',
        children: PROMPTS.map((prompt, index) => {
          const position = STACK_POSITIONS[slots[index]];
          return (0, jsxRuntime.jsx)(
            c.div,
            {
              className:
                'absolute top-0 left-1/2 inline-flex h-9 origin-top -translate-x-1/2 items-center rounded-full bg-white/80 px-4 whitespace-nowrap ring-[0.5px] inset-ring-1 ring-neutral-950/20 inset-ring-white/80 backdrop-blur-sm',
              initial: false,
              animate: {
                y: position.y,
                scale: position.scale,
                opacity: position.opacity,
                filter: `blur(${position.blur}px)`,
                zIndex: position.zIndex,
              },
              transition: {duration: 0.7, ease: [0.22, 1, 0.36, 1]},
              children: (0, jsxRuntime.jsx)('p', {
                className: 'text-[15px] leading-none font-medium text-neutral-950/80',
                children: prompt,
              }),
            },
            prompt,
          );
        }),
      })
    );
  },
  ONE_PASSWORD_ICON = '/assets/1password-TKpIbsfH.webp',
  CHAT_BACKGROUND = '/assets/chat-background-DCqRNZhl.webp',
  EXTERNAL_SIGN_IN_VIDEO = '/assets/external-sign-in-DDfmNsnB.webm',
  STRIPE_SIGN_IN_VIDEO = '/assets/stripe-sign-in-BvUzdhNI.webm',
  STRIPE_LOGO = '/assets/stripe-BSlxDfXa.png',
  /** The sign-in hero. */
  SignInHero = () => {
    const {passwordManagerChoice} = R();
    return (0, jsxRuntime.jsx)('div', {
      className: 'light size-full p-2.5',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'relative size-full overflow-hidden rounded-xl select-none',
        children: [
          (0, jsxRuntime.jsx)('img', {
            alt: '',
            src: CHAT_BACKGROUND,
            className: 'absolute inset-0 size-full object-cover',
          }),
          (0, jsxRuntime.jsx)(SignInDemo, {choice: passwordManagerChoice}, passwordManagerChoice),
        ],
      }),
    });
  },
  /** The demo: a question, the sign-in video, the answer. */
  SignInDemo = ({choice}) => {
    const reducedMotion = u(),
      videoRef = (0, React.useRef)(null),
      [videoEnded, setVideoEnded] = (0, React.useState)(false),
      [showControls, setShowControls] = (0, React.useState)(false),
      [passwordUsed, setPasswordUsed] = (0, React.useState)(false),
      isExternal = choice === 'external';
    (0, React.useEffect)(() => {
      if (!isExternal) return;
      const timer = window.setTimeout(() => setPasswordUsed(true), 4e3);
      return () => window.clearTimeout(timer);
    }, [isExternal, reducedMotion]);
    const playVideo = () => {
        videoRef.current?.play().catch(() => setShowControls(true));
      },
      endVideo = () => setVideoEnded(true);
    return (0, jsxRuntime.jsxs)('div', {
      className: 'relative flex flex-col items-start px-5 pt-6 font-medium text-mist-950',
      children: [
        (0, jsxRuntime.jsx)(ChatBubble, {
          className: 'self-end bg-black text-white',
          delay: 0,
          children: 'What’s our current ARR?',
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'mt-9 flex w-full flex-col items-start gap-2',
          children: [
            (0, jsxRuntime.jsx)(ChatBubble, {
              delay: 0.45,
              children: (0, jsxRuntime.jsxs)('span', {
                className: 'flex items-center gap-1',
                children: [
                  (0, jsxRuntime.jsx)('span', {children: 'I’ll sign into'}),
                  (0, jsxRuntime.jsxs)('span', {
                    className: 'inline-flex items-center gap-1 text-indigo-600',
                    children: [
                      (0, jsxRuntime.jsx)('img', {alt: '', src: STRIPE_LOGO, className: 'size-4 shrink-0'}),
                      'Stripe',
                    ],
                  }),
                  (0, jsxRuntime.jsx)('span', {children: 'first.'}),
                ],
              }),
            }),
            isExternal &&
              (0, jsxRuntime.jsx)(ChatBubble, {
                delay: 0.9,
                children: (0, jsxRuntime.jsxs)('span', {
                  className: 'flex items-center gap-1',
                  children: [
                    (0, jsxRuntime.jsx)('img', {alt: '', src: ONE_PASSWORD_ICON, className: 'size-4 shrink-0'}),
                    passwordUsed || reducedMotion
                      ? (0, jsxRuntime.jsxs)('span', {
                          className: 'text-mist-950',
                          children: [passwordUsed ? 'Used' : 'Using', ' 1Password'],
                        })
                      : (0, jsxRuntime.jsx)(E, {
                          as: 'span',
                          shimmerColor: 'var(--color-mist-950)',
                          children: 'Using 1Password',
                        }),
                  ],
                }),
              }),
            (0, jsxRuntime.jsx)(c.div, {
              className: 'no-drag w-80 max-w-full overflow-hidden rounded-xl bg-white',
              initial: reducedMotion ? false : {opacity: 0, y: 10},
              animate: {opacity: 1, y: 0},
              transition: {
                type: 'spring',
                visualDuration: reducedMotion ? 0 : 0.2,
                bounce: reducedMotion ? 0 : 0.15,
                delay: reducedMotion ? 0 : isExternal ? 2.4 : 0.9,
                opacity: {duration: reducedMotion ? 0 : 0.15, delay: reducedMotion ? 0 : isExternal ? 2.4 : 0.9},
              },
              onAnimationComplete: playVideo,
              children: (0, jsxRuntime.jsx)('video', {
                ref: videoRef,
                src: isExternal ? EXTERNAL_SIGN_IN_VIDEO : STRIPE_SIGN_IN_VIDEO,
                className: 'block aspect-8/5 w-full',
                muted: true,
                playsInline: true,
                preload: 'auto',
                controls: showControls,
                'aria-label': 'Aux signing into Stripe',
                onEnded: endVideo,
              }),
            }),
            videoEnded &&
              (0, jsxRuntime.jsxs)(ChatBubble, {
                delay: 0,
                children: [
                  'The current ARR compared to',
                  (0, jsxRuntime.jsx)('br', {}),
                  'previous period is $19,840,124.',
                ],
              }),
          ],
        }),
      ],
    });
  },
  /** A chat bubble that fades in. */
  ChatBubble = ({children, className = 'bg-white', delay}) => {
    const reducedMotion = u();
    return (0, jsxRuntime.jsx)(c.div, {
      className: `rounded-xl px-3 py-2 text-base leading-6 shadow-xs ${className}`,
      initial: reducedMotion ? false : {opacity: 0, y: 10},
      animate: {opacity: 1, y: 0},
      transition: {
        type: 'spring',
        visualDuration: reducedMotion ? 0 : 0.2,
        bounce: reducedMotion ? 0 : 0.15,
        delay: reducedMotion ? 0 : delay,
        opacity: {duration: reducedMotion ? 0 : 0.15, delay: reducedMotion ? 0 : delay},
      },
      children,
    });
  },
  /** The panel's width while it is open. */
  PANEL_WIDTH = '400px',
  /** Which panel each path shows. */
  PANEL_BY_PATH = new Map([
    ['/onboarding/glance', 'glance'],
    ['/onboarding/import-password', 'import-password'],
  ]);
/** The panel for a path, if it has one. */
function panelForPath(path) {
  return PANEL_BY_PATH.get(path.replace(/\/+$/, '')) ?? null;
}
/** The right panel. A panel seen once stays mounted, hidden, so it keeps its place. */
function RightPanel({width}) {
  const panel = panelForPath(p({select: location => location.pathname})),
    [seen, setSeen] = (0, React.useState)(() => new Set()),
    mounted = (0, React.useMemo)(
      () => (panel ? (seen.has(panel) ? seen : new Set(seen).add(panel)) : seen),
      [panel, seen],
    );
  return (
    (0, React.useEffect)(() => {
      !panel || seen.has(panel) || setSeen(current => new Set(current).add(panel));
    }, [panel, seen]),
    (0, jsxRuntime.jsx)('aside', {
      id: 'right-panel',
      className:
        'h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none',
      style: {width: width ?? '0px'},
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'relative h-full',
        style: {width: PANEL_WIDTH},
        children: [
          mounted.has('glance') &&
            (0, jsxRuntime.jsx)(PanelSlot, {
              active: panel === 'glance',
              children: (0, jsxRuntime.jsx)(GlanceHero, {paused: panel !== 'glance'}),
            }),
          mounted.has('import-password') &&
            (0, jsxRuntime.jsx)(PanelSlot, {
              active: panel === 'import-password',
              children: (0, jsxRuntime.jsx)(SignInHero, {}),
            }),
        ],
      }),
    })
  );
}
/** A panel, hidden unless active. */
function PanelSlot({active, children}) {
  return (0, jsxRuntime.jsx)('div', {
    className: _('absolute inset-0', !active && 'pointer-events-none invisible'),
    'aria-hidden': !active,
    children,
  });
}
var /** The step dots. */
  StepDots = () => {
    const path = p({select: location => location.pathname.replace(/\/+$/, '')});
    if (['/onboarding/done', '/onboarding/splash'].includes(path)) return null;
    const stepIndex = STEPS.findIndex(step => path.includes(step));
    return (0, jsxRuntime.jsx)('div', {
      className: 'pointer-events-none absolute bottom-0 left-1/2 z-5 flex -translate-x-1/2 justify-center py-5',
      children: (0, jsxRuntime.jsx)('div', {
        className: 'flex h-9 items-center gap-1.5',
        children: STEPS.map((step, index) =>
          (0, jsxRuntime.jsx)(
            'div',
            {
              className: 'bg-muted data-active:bg-primary size-1.5 rounded-full transition data-active:w-3',
              'data-active': index === stepIndex ? true : void 0,
            },
            index,
          ),
        ),
      }),
    });
  },
  /** The steps the dots count. */
  STEPS = ['/onboarding/import-browser', '/onboarding/import-password', '/onboarding/ai'],
  /** The steps that open the right panel. */
  PANEL_STEPS = ['/onboarding/import-password'];
function oe() {
  const path = p({select: location => location.pathname}),
    width = panelWidth(path),
    {track} = z();
  return (
    (0, React.useEffect)(() => {
      const step = STEP_NAMES.get(path.replace(/\/+$/, ''));
      step && track('onboarding.step.reach', {value: step});
    }, [path, track]),
    (0, jsxRuntime.jsx)(T, {
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'app-region-drag flex h-screen w-full overflow-hidden',
        children: [
          (0, jsxRuntime.jsxs)('main', {
            className: 'relative flex h-screen min-w-0 flex-1 flex-col items-center justify-center overflow-hidden',
            children: [(0, jsxRuntime.jsx)(S, {}), (0, jsxRuntime.jsx)(StepDots, {})],
          }),
          (0, jsxRuntime.jsx)(RightPanel, {width}),
        ],
      }),
    })
  );
}
var /** The analytics name of each step. */
  STEP_NAMES = new Map([
    ['/onboarding/splash', 'splash'],
    ['/onboarding/glance', 'glance'],
    ['/onboarding/import-browser', 'import-browser'],
    ['/onboarding/import-browser/progress', 'import-browser-progress'],
    ['/onboarding/import-password', 'import-password'],
    ['/onboarding/ai', 'ai'],
    ['/onboarding/done', 'done'],
  ]);
/** How wide the panel is on this path. */
function panelWidth(path) {
  const trimmed = path.replace(/\/+$/, '');
  return PANEL_STEPS.some(step => trimmed.includes(step)) ? PANEL_WIDTH : null;
}
