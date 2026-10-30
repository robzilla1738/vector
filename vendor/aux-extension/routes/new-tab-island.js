/* Aux-owned source: the New Tab page body (assets/island-C0ouZ54e.js, exported as NewTabIsland).
 * newtab.html paints the omnibox itself; this island mounts the rest into the page's slots through
 * portals: the Spaces sidebar (#new-tab-sidebar), the sidebar-mode toggle (#new-tab-header), the
 * suggestion chips (#new-tab-tasks), nudges (#new-tab-content) and the update banner.
 * Aux change: no task cards on New Tab (owner, 2026-10-30); the page is always logo, search, chips.
 * The supplied profile and billing menu was already removed by a package edit (Aux has no
 * accounts or payments), so its unreachable code is gone here.
 *
 * Imports used here: browser-color-scheme T interop, k React, E JSX runtime, g cn;
 * error-tracking A ErrorBoundary, P error fallback; preload-helper u preload; strip-markdown
 * H QueryProvider, O devtools, q TooltipProvider, V AppContext, G agent settings warmup,
 * D account sync, M analytics; queries h useQuery, $ and K the account query; sidebar
 * ne storage key, re useSidebarState, se SidebarModeToggle; utils w isSidebarMode, te setup;
 * R and z the open/close chevrons; portal x Portal; newtab ie useNewTab; utils-BEeo4 le useDelay;
 * data-provider me DataProvider. */
var jsxRuntime = E(),
  React = T(k(), 1),
  SIDEBAR_STORAGE_KEY = ne,
  // Top-left in sidebar mode: open or close the Spaces sidebar.
  SidebarModeToggle = () => w()
    ? (0, jsxRuntime.jsx)(se, {
      className: 'click-depth-effect [&_svg]:text-muted-foreground absolute top-2 left-2 [&_svg]:size-4.5!',
      size: 'icon-lg',
      defaultState: 'closed',
      storageKey: SIDEBAR_STORAGE_KEY,
    })
    : null,
  SIDEBAR_WIDTH = '280px',
  SidebarContent = (0, React.lazy)(() => u(() => import('./sidebar-Cj9gldy1.js').then(module => module.a).then(module => ({default: module.ExtensionWebSidebarContent})), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43]))),
  // The Spaces sidebar beside the page, in sidebar mode only. It mounts on first open and then stays
  // mounted, sliding in and out; a hover strip on its edge toggles it.
  NewTabSidebar = ({accountId}) => {
    const sidebarMode = w();
    const {sidebarState, setSidebarState} = re('closed', {storageKey: SIDEBAR_STORAGE_KEY});
    const closed = sidebarState === 'closed';
    const everOpened = (0, React.useRef)(!closed);
    if (everOpened.current ||= !closed, !sidebarMode) return null;
    const toggle = event => {
      setSidebarState(closed ? 'open' : 'closed'), event.currentTarget.blur();
    };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex h-full',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'h-full overflow-hidden',
          style: {width: closed ? 0 : SIDEBAR_WIDTH},
          children: (0, jsxRuntime.jsx)('div', {
            className: g('h-full overflow-hidden transition-[opacity,transform] duration-100 ease-out will-change-transform', closed ? '-translate-x-2 opacity-0' : 'translate-x-0 opacity-100'),
            style: {width: SIDEBAR_WIDTH},
            children: everOpened.current && (0, jsxRuntime.jsx)(React.Suspense, {
              fallback: null,
              children: (0, jsxRuntime.jsx)(SidebarContent, {mainDocumentLinks: true, userId: String(accountId)}),
            }),
          }),
        }),
        (0, jsxRuntime.jsx)('button', {
          type: 'button',
          'aria-label': closed ? 'Open sidebar' : 'Close sidebar',
          className: g(
            'group/sidebar-toggle relative z-30 w-0 shrink-0 cursor-pointer overflow-visible outline-none',
            'after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-linear-to-r after:from-transparent after:to-transparent after:transition-colors',
            'hover:after:from-brand/5 focus-visible:after:from-brand/5'),
          onClick: toggle,
          children: (0, jsxRuntime.jsx)('span', {
            className: g(
              'text-brand absolute top-1/2 left-0 -translate-y-1/2 opacity-0 transition-all delay-75 [&_svg]:size-4',
              'group-hover/sidebar-toggle:opacity-100 group-focus-visible/sidebar-toggle:opacity-100',
              'group-hover/sidebar-toggle:-ml-1 group-focus-visible/sidebar-toggle:-ml-1'),
            children: closed ? (0, jsxRuntime.jsx)(R, {}) : (0, jsxRuntime.jsx)(z, {}),
          }),
        }),
      ],
    });
  },
  Nudges = (0, React.lazy)(() => u(() => import('./nudges-7TFAp4B-.js').then(module => ({default: module.NewTabPageNudges})), __vite__mapDeps([44,1,3,4,5,6,7,8,9,2,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,43,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,42,113]))),
  OnboardingHelper = (0, React.lazy)(() => u(() => import('./onboarding-helper-BVYyPOep.js').then(module => ({default: module.OnboardingHelper})), __vite__mapDeps([114,1,9,2,3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,84,68,43,115,116,54,117,118,96,119]))),
  Toaster = (0, React.lazy)(() => u(() => import('./sonner-B6vOp_bX.js').then(module => module.n).then(module => ({default: () => (0, jsxRuntime.jsx)(module.Toaster, {position: 'top-center'})})), __vite__mapDeps([165,1,10,11,12,13,14,15,4,8,16,7,17,18,19,20,66,50,26]))),
  UpdateBanner = (0, React.lazy)(() => u(() => import('./update-banner-C_z-hMCt.js').then(module => ({default: module.UpdateBanner})), __vite__mapDeps([166,1,9,2,3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,50,71,72,73,66,74,43,115,116,54,117,118,96,119,51])));
te();

/** NewTabIsland: providers around the page body, with an error boundary that shows the fallback. */
var Ge = () => (0, jsxRuntime.jsx)(A, {
    surface: 'newtab',
    fallback: (0, jsxRuntime.jsx)(P, {}),
    children: (0, jsxRuntime.jsx)(H, {
      children: (0, jsxRuntime.jsxs)(me, {
        children: [
          (0, jsxRuntime.jsx)(O, {}),
          (0, jsxRuntime.jsxs)(q, {
            children: [
              (0, jsxRuntime.jsx)(NewTabBody, {}),
              (0, jsxRuntime.jsx)(React.Suspense, {fallback: null, children: (0, jsxRuntime.jsx)(Toaster, {})}),
            ],
          }),
        ],
      }),
    }),
  }),
  // Once the account is known, each slot gets its piece; incognito keeps only the omnibox.
  NewTabBody = () => {
    const {accountId, browserMode, setAccountId} = ie();
    const {data: account} = h({...$.queryOptions, queryFn: K});
    const resolvedAccountId = account?.accountId ?? null;
    const showUpdate = le({minDelayMs: 500, timeoutMs: 1e3});
    const incognito = browserMode === 'incognito';
    const ready = accountId !== null;
    return (0, React.useEffect)(() => {
      setAccountId(resolvedAccountId);
    }, [setAccountId, resolvedAccountId]), (0, jsxRuntime.jsxs)(V, {
      value: {accountId: accountId ?? 0, browserProfile: account?.browserProfile ?? null, mode: browserMode},
      children: [
        ready && accountId > 0 && (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [(0, jsxRuntime.jsx)(G, {accountId}), (0, jsxRuntime.jsx)(D, {accountId})],
        }),
        ready && (0, jsxRuntime.jsx)(M, {}),
        !incognito && ready && (0, jsxRuntime.jsx)(x, {root: '#new-tab-sidebar', children: (0, jsxRuntime.jsx)(NewTabSidebar, {accountId})}),
        (0, jsxRuntime.jsxs)(x, {root: '#new-tab-header', children: [!incognito && (0, jsxRuntime.jsx)(SidebarModeToggle, {})]}),
        !incognito && ready && (0, jsxRuntime.jsx)(x, {
          root: '#new-tab-tasks',
          children: (0, jsxRuntime.jsx)(React.Suspense, {
            fallback: null,
            children: (0, jsxRuntime.jsx)(OnboardingHelper, {}),
          }),
        }),
        !incognito && ready && (0, jsxRuntime.jsx)(x, {
          root: '#new-tab-content',
          children: (0, jsxRuntime.jsx)(React.Suspense, {fallback: null, children: (0, jsxRuntime.jsx)(Nudges, {accountId, className: 'mx-auto shrink-0'})}),
        }),
        !incognito && showUpdate && (0, jsxRuntime.jsx)(React.Suspense, {fallback: null, children: (0, jsxRuntime.jsx)(UpdateBanner, {})}),
      ],
    });
  };
