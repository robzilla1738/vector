/* Aux-owned source: onboarding › importing from a browser (assets/progress-CS-jrVXz.js, the module body): the
 * animated stack of icons, a status line that follows the import or cycles while it starts, and the
 * ways on: Next by itself, Try again, or retrying only site sign-ins when those were skipped. The stack
 * stays a fixed illustration, whatever the theme. auxPending, auxSkipped and auxRetrySignIns come
 * from the import retry in vendor/provided.
 * Names the rest of the chunk uses keep their chunk names: me the page (exported).
 * Chunk names used: N/S React, z JSX runtime, k cn, j useNavigate, B Spinner, _ arrow, v TextShimmer, A Button,
 * R source names, T the route, auxSetPending/C/E/w the pending import (set it, run it, clear it, read it),
 * M/O/P/F/$/g the onboarding layout, m motion, q AnimatePresence, X/Z/K/H/L dialog parts,
 * Y floating background, b browser icon. */
var React = N(S(), 1),
  jsxRuntime = z(),
  /** Twinkling dots behind the top layer. */
  DotMatrix = () => {
    const dots = (0, React.useMemo)(() => {
      const rects = [];
      for (let column = 0; column < 14.666666666666666; column++)
        for (let row = 0; row < 14.666666666666666; row++)
          if (Math.random() > 0.05) {
            const duration = (Math.random() * 0.6 + 0.2).toFixed(2),
              delay = (Math.random() * 0.5).toFixed(2);
            rects.push(
              (0, jsxRuntime.jsx)(
                'rect',
                {
                  x: column * 12 + 4.5,
                  y: row * 12 + 4.5,
                  width: 3,
                  height: 3,
                  fill: '#fff',
                  rx: 1,
                  className: 'matrix-dot',
                  style: {animationDuration: `${duration}s`, animationDelay: `${delay}s`},
                },
                `${column}-${row}`,
              ),
            );
          }
      return rects;
    }, []);
    return (0, jsxRuntime.jsxs)('div', {
      className: 'pointer-events-none absolute inset-0 overflow-hidden opacity-40 mix-blend-multiply',
      children: [
        (0, jsxRuntime.jsx)('style', {
          children: `
        .matrix-dot {
          opacity: 0;
          animation-name: dot-twinkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-direction: alternate;
        }
        @keyframes dot-twinkle {
          0% { opacity: 0; }
          100% { opacity: 0.8; }
        }
      `,
        }),
        (0, jsxRuntime.jsx)('svg', {className: 'absolute inset-0 size-full', viewBox: '0 0 176 176', children: dots}),
      ],
    });
  };
/** The page. */
function me() {
  const {browser} = T.useSearch(),
    navigate = j(),
    auxPending = (0, React.useRef)(w()),
    [attempt, setAttempt] = (0, React.useState)(0),
    [error, setError] = (0, React.useState)(null),
    [dismissed, setDismissed] = (0, React.useState)(false),
    [progress, setProgress] = (0, React.useState)(null),
    pending = w(),
    sourceName = pending?.sourceId === browser ? pending.sourceName : R.get(browser),
    failed = !!error || progress?.state === 'failed' || progress?.state === 'cancelled',
    succeeded = progress?.state === 'succeeded',
    auxSkipped = succeeded && !!progress.skippedDataKinds?.length,
    retry = () => {
      (setError(null), setDismissed(false), setProgress(null), setAttempt(current => current + 1));
    },
    auxRetrySignIns = () => {
      (auxPending.current && auxSetPending({...auxPending.current, dataKinds: ['cookies']}), retry());
    };
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsxs)(O, {
        className: 'pb-0',
        children: [
          (0, jsxRuntime.jsx)(F, {children: `Importing from ${sourceName}`}),
          (0, jsxRuntime.jsx)(M, {
            className: 'min-h-5',
            children: (0, jsxRuntime.jsx)(ImportStatus, {error, progress}),
          }),
        ],
      }),
      (0, jsxRuntime.jsx)($, {children: (0, jsxRuntime.jsx)(ImportAnimation, {browser})}),
      (0, jsxRuntime.jsxs)(P, {
        children: [
          (0, jsxRuntime.jsxs)(A, {
            variant: 'secondary',
            size: 'lg',
            disabled: !failed && !auxSkipped,
            onClick: () => navigate({to: '/onboarding/import-browser', replace: true}),
            children: [
              (0, jsxRuntime.jsx)(_, {'data-icon': 'inline-start'}),
              (0, jsxRuntime.jsx)('span', {children: 'Back'}),
            ],
          }),
          auxSkipped
            ? (0, jsxRuntime.jsxs)('div', {
                className: 'flex gap-2',
                children: [
                  (0, jsxRuntime.jsx)(A, {
                    variant: 'secondary',
                    size: 'lg',
                    onClick: auxRetrySignIns,
                    children: 'Try again',
                  }),
                  (0, jsxRuntime.jsx)(g, {
                    type: 'button',
                    onClick: () => navigate({to: '/onboarding/import-password', replace: true}),
                    children: 'Next',
                  }),
                ],
              })
            : failed
              ? (0, jsxRuntime.jsx)(g, {type: 'button', onClick: retry, children: 'Try again'})
              : (0, jsxRuntime.jsxs)(g, {
                  disabled: true,
                  children: [
                    !succeeded && (0, jsxRuntime.jsx)(B, {}),
                    (0, jsxRuntime.jsx)('span', {children: succeeded ? 'Done' : 'Import'}),
                  ],
                }),
        ],
      }),
      (0, jsxRuntime.jsx)(ImportRunner, {attempt, browser, onError: setError, onProgress: setProgress}),
      (0, jsxRuntime.jsx)(X, {
        open: !!error && !dismissed,
        onOpenChange: open => {
          open || setDismissed(true);
        },
        children: (0, jsxRuntime.jsx)(Z, {
          children: (0, jsxRuntime.jsxs)(K, {
            children: [
              (0, jsxRuntime.jsx)(H, {children: error}),
              (0, jsxRuntime.jsx)(L, {className: 'sr-only', children: 'The browser import could not be completed.'}),
            ],
          }),
        }),
      }),
      (0, jsxRuntime.jsx)(Y, {}),
    ],
  });
}
var /** Runs the import for each attempt and moves on when it succeeds. */
  ImportRunner = ({attempt, browser, onError, onProgress}) => {
    const navigate = j(),
      advanced = (0, React.useRef)(false);
    return (
      (0, React.useEffect)(() => {
        let active = true,
          timer;
        const pending = w();
        if (!pending || pending.sourceId !== browser) {
          navigate({to: '/onboarding/import-browser', replace: true});
          return;
        }
        if (typeof chrome > 'u' || !chrome.auxBrowserImport) {
          onError('Browser import is unavailable in this version of Aux.');
          return;
        }
        return (
          C(pending, {
            onProgress: update => {
              active &&
                (onProgress(update),
                !(update.state !== 'succeeded' || advanced.current) &&
                  (E(),
                  update.skippedDataKinds?.length ||
                    ((advanced.current = true),
                    (timer = window.setTimeout(() => {
                      navigate({to: '/onboarding/import-password', replace: true});
                    }, 800)))));
            },
          }).catch(failure => {
            active && onError(failure.message);
          }),
          () => {
            ((active = false), timer && window.clearTimeout(timer));
          }
        );
      }, [attempt, browser, navigate, onError, onProgress]),
      null
    );
  },
  /** The three layers of the icon stack. */
  ImportAnimation = ({browser}) =>
    (0, jsxRuntime.jsx)('div', {
      className: '**:border-shape-initial! relative flex h-80 w-90 items-center justify-center perspective-distant',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'relative size-44',
        style: {transformStyle: 'preserve-3d', transform: 'scale3d(1.2, 1.2, 1.2) rotateX(60deg) rotateZ(-45deg)'},
        children: [
          (0, jsxRuntime.jsx)(m.div, {
            className:
              'bg-muted border-muted absolute inset-0 flex items-center justify-center overflow-hidden rounded-[48px] border-b-3 border-l-3 shadow-lg',
            style: {transform: 'translateZ(-60px)', filter: 'grayscale(100%)'},
            initial: {opacity: 0.3},
            animate: {
              opacity: [0.3, 1, 1, 1, 0.3, 0.3],
              filter: [
                'grayscale(100%)',
                'grayscale(100%)',
                'grayscale(0%)',
                'grayscale(0%)',
                'grayscale(100%)',
                'grayscale(100%)',
              ],
            },
            transition: {duration: 4, times: [0, 0.05, 0.1, 0.35, 0.8, 1], repeat: 1 / 0, ease: 'linear'},
            children: (0, jsxRuntime.jsx)(b, {
              value: browser,
              className: k('size-30', ['comet', 'chatgpt-atlas', 'helium'].includes(browser) && 'size-44'),
            }),
          }),
          (0, jsxRuntime.jsx)(m.div, {
            className:
              'absolute inset-0 flex items-center justify-center overflow-hidden rounded-[48px] border border-sky-400/5 bg-linear-to-br from-sky-400/10 from-40% to-sky-400/50',
            initial: {z: -60, opacity: 0, filter: 'blur(16px)', backdropFilter: 'blur(0px)', scale: 1},
            animate: {
              z: [-60, -60, -60, -60, 50, 55, 60],
              opacity: [0, 1, 1, 0.8, 0.6, 0.5, 0],
              filter: ['blur(16px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(8px)', 'blur(16px)'],
              backdropFilter: [
                'blur(0px)',
                'blur(0px)',
                'blur(0px)',
                'blur(3px)',
                'blur(8px)',
                'blur(4px)',
                'blur(0px)',
              ],
              scale: [1, 1, 1, 1, 1, 1, 1.2],
            },
            transition: {duration: 4, times: [0, 0.05, 0.1, 0.35, 0.8, 0.9, 1], repeat: 1 / 0, ease: 'linear'},
            children: (0, jsxRuntime.jsx)(DotMatrix, {}),
          }),
          (0, jsxRuntime.jsxs)(m.div, {
            className: 'absolute inset-0 z-5',
            style: {transformStyle: 'preserve-3d'},
            initial: {z: 60},
            animate: {z: [60, 68, 60]},
            transition: {duration: 4, repeat: 1 / 0, ease: 'easeInOut'},
            children: [
              (0, jsxRuntime.jsx)('div', {
                className: 'bg-brand/50 absolute inset-0 rounded-[48px] blur-xl',
                style: {transform: 'translateZ(-10px) translateY(20px) scale(0.9) translateX(-15px)'},
              }),
              Array.from({length: 5}).map((item, depth) =>
                (0, jsxRuntime.jsx)(
                  'div',
                  {
                    className: 'bg-muted absolute inset-0 rounded-[48px] border-3 border-neutral-200',
                    style: {transform: `translateZ(-${depth + 1}px)`},
                  },
                  depth,
                ),
              ),
              (0, jsxRuntime.jsx)('div', {
                className: 'absolute inset-0 overflow-hidden rounded-[48px] bg-white',
                children: (0, jsxRuntime.jsx)(b, {value: 'aux', className: 'size-full rounded-[48px]'}),
              }),
            ],
          }),
        ],
      }),
    }),
  /** What shows until the import reports a step. */
  CyclingStatus = () => {
    const [index, setIndex] = (0, React.useState)(0);
    return (
      (0, React.useEffect)(() => {
        const timer = setInterval(() => {
          setIndex(current => (current + 1) % STATUS_LINES.length);
        }, 6e3);
        return () => clearInterval(timer);
      }, []),
      (0, jsxRuntime.jsx)('div', {
        className: 'font-display overflow-hidden text-base font-[450]',
        children: (0, jsxRuntime.jsx)(q, {
          children: (0, jsxRuntime.jsx)(
            m.p,
            {
              className: 'overflow-hidden',
              initial: {opacity: 0, y: 10, height: 0},
              animate: {opacity: 1, y: 0, height: 'auto'},
              exit: {opacity: 0, y: -10, height: 0},
              transition: {delay: 0.1},
              children: (0, jsxRuntime.jsx)(v, {children: STATUS_LINES[index]}),
            },
            index,
          ),
        }),
      })
    );
  },
  /** The lines it cycles through. */
  STATUS_LINES = [
    'Importing your browsing history...',
    'Importing your bookmarks...',
    'Importing your passwords...',
    'Importing your cookies...',
    'Importing your autofill data...',
  ],
  /** How each data kind reads. */
  DATA_KIND_LABELS = new Map([
    ['history', 'browsing history'],
    ['bookmarks', 'bookmarks'],
    ['passwords', 'passwords'],
    ['cookies', 'cookies'],
    ['autofill', 'autofill data'],
    ['paymentCards', 'payment cards'],
    ['spaces', 'Spaces and pins'],
  ]),
  /** The status line. */
  ImportStatus = ({error, progress}) =>
    error
      ? (0, jsxRuntime.jsx)('span', {children: error})
      : progress?.state === 'failed'
        ? (0, jsxRuntime.jsx)('span', {children: progress.errorMessage || 'Import failed.'})
        : progress?.state === 'cancelled'
          ? (0, jsxRuntime.jsx)('span', {children: 'Import cancelled.'})
          : progress?.state === 'succeeded'
            ? progress.skippedDataKinds?.length
              ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
                    (0, jsxRuntime.jsx)('span', {
                      className: 'block',
                      children: 'Imported everything except site sign-ins.',
                    }),
                    progress.skippedMessage &&
                      (0, jsxRuntime.jsx)('span', {
                        className: 'text-muted-foreground block',
                        children: progress.skippedMessage,
                      }),
                  ],
                })
              : (0, jsxRuntime.jsx)('span', {children: 'Import complete.'})
            : progress?.currentDataKind
              ? (0, jsxRuntime.jsx)(v, {
                  children: `Importing your ${DATA_KIND_LABELS.get(progress.currentDataKind) ?? progress.currentDataKind}...`,
                })
              : (0, jsxRuntime.jsx)(CyclingStatus, {});
