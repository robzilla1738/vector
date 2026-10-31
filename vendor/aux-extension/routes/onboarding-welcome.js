/* Aux-owned source: the first onboarding steps (assets/glance-BfAlmExy.js, replacing the supplied
 * "No more integrations" glance, which goes with its hero). ae is the Welcome step at
 * /onboarding/glance (exported as component); auxMakeItYours is /onboarding/make-it-yours (exported as
 * yours, routed by vendor/provided/polish/integration.mjs). Neither waits for the daemon: the agent's
 * name and look (AuxAgentSetup) arrive inline when it's ready. Make it yours previews the Spaces an
 * import brought (getOrganizationSettings: name and emoji, and the color once native reports one).
 * Chunk names used: C/G/I React and JSX runtime interop, O toast, y Link, A back arrow, L Button,
 * z/M/T/B/E the onboarding layout parts. */
var jsxRuntime = I(),
  React = C(G(), 1);
function OnboardingPage({title, description, children, footer}) {
  return (0, jsxRuntime.jsxs)('div', {
    className: 'flex h-screen w-full min-w-0 flex-col overflow-hidden',
    children: [
      (0, jsxRuntime.jsxs)('div', {
        className: 'flex min-h-0 grow flex-col overflow-y-auto',
        children: [
          (0, jsxRuntime.jsxs)(z, {
            // A step with nothing below its heading centers it, so Welcome isn't a heading over an empty page.
            className: children ? 'pt-9 pb-0' : 'my-auto pb-0',
            children: [(0, jsxRuntime.jsx)(M, {children: title}), (0, jsxRuntime.jsx)(T, {children: description})],
          }),
          children,
        ],
      }),
      (0, jsxRuntime.jsx)(B, {children: footer}),
    ],
  });
}
function ae() {
  return (0, jsxRuntime.jsx)(OnboardingPage, {
    title: 'A browser with an agent built in.',
    description: 'Bring your stuff over, pick a model, and start browsing. No account needed.',
    footer: (0, jsxRuntime.jsx)(E, {
      className: 'ml-auto',
      render: (0, jsxRuntime.jsx)(y, {to: '/onboarding/import-browser', replace: true}),
      children: 'Get started',
    }),
  });
}
/** The Spaces an import brought: a fresh browser has only its first Space. */
function useImportedSpaces(preferences) {
  const [spaces, setSpaces] = (0, React.useState)([]);
  (0, React.useEffect)(() => {
    let live = true;
    (async () => {
      const settings = await preferences?.getOrganizationSettings?.().catch(() => null);
      if (live && settings?.success && settings.spaces.length > 1)
        setSpaces([...settings.spaces].sort((a, b) => a.order - b.order));
    })();
    return () => {
      live = false;
    };
  }, [preferences]);
  return spaces;
}
/** The imported Spaces, each in its color with its emoji. */
function SpacesPreview({spaces}) {
  return (0, jsxRuntime.jsxs)('section', {
    className: 'space-y-2',
    children: [
      (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs font-medium', children: 'Your Spaces'}),
      (0, jsxRuntime.jsx)('ul', {
        className: 'flex flex-wrap gap-1.5',
        children: spaces.map(space =>
          (0, jsxRuntime.jsxs)(
            'li',
            {
              className: 'bg-secondary inline-flex h-7 max-w-44 min-w-0 items-center gap-1.5 rounded-full px-2.5 text-sm',
              children: [
                (0, jsxRuntime.jsx)('span', {
                  'aria-hidden': true,
                  className: 'bg-muted-foreground size-2 shrink-0 rounded-full',
                  style: space.color ? {backgroundColor: space.color} : void 0,
                }),
                space.icon && (0, jsxRuntime.jsx)('span', {'aria-hidden': true, children: space.icon}),
                (0, jsxRuntime.jsx)('span', {className: 'truncate', children: space.name}),
              ],
            },
            space.id,
          ),
        ),
      }),
    ],
  });
}
function auxMakeItYours() {
  const preferences = globalThis.chrome?.auxBrowserPreferences,
    spaces = useImportedSpaces(preferences);
  return (0, jsxRuntime.jsx)(OnboardingPage, {
    title: 'Make it yours',
    description: spaces.length
      ? 'Name your agent and pick your colors. Your imported Spaces keep theirs.'
      : 'Name your agent and pick your colors.',
    footer: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(L, {
          variant: 'secondary',
          size: 'lg',
          nativeButton: false,
          render: (0, jsxRuntime.jsx)(y, {to: '/onboarding/import-password', replace: true}),
          children: [(0, jsxRuntime.jsx)(A, {'data-icon': 'inline-start'}), (0, jsxRuntime.jsx)('span', {children: 'Back'})],
        }),
        (0, jsxRuntime.jsx)(E, {render: (0, jsxRuntime.jsx)(y, {to: '/onboarding/ai', replace: true}), children: 'Next'}),
      ],
    }),
    children: (0, jsxRuntime.jsxs)('div', {
      className: 'mx-auto w-full max-w-sm space-y-6 px-5 py-6',
      children: [
        (0, jsxRuntime.jsx)(AuxAgentSetup, {}),
        spaces.length > 0 && (0, jsxRuntime.jsx)(SpacesPreview, {spaces}),
        (0, jsxRuntime.jsx)(L, {
          variant: 'outline',
          size: 'lg',
          disabled: typeof preferences?.openThemePicker !== 'function',
          onClick: () => preferences.openThemePicker().catch(() => O.error('Couldn’t open the theme picker.')),
          children: 'Choose a theme',
        }),
      ],
    }),
  });
}
