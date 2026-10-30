/* Aux-owned source: the first onboarding steps (assets/glance-BfAlmExy.js, replacing the supplied
 * "No more integrations" glance, which goes with its hero). ae is the Welcome step at
 * /onboarding/glance (exported as component); auxMakeItYours is /onboarding/make-it-yours (exported as
 * yours, routed by vendor/provided/polish/integration.mjs). Neither needs the daemon.
 * Chunk names used: C/G/I React and JSX runtime interop, O toast, y Link, A back arrow, L Button,
 * z/M/T/B/E the onboarding layout parts. */
var jsxRuntime = I();
function OnboardingPage({title, description, children, footer}) {
  return (0, jsxRuntime.jsxs)('div', {
    className: 'flex h-screen w-full min-w-0 flex-col overflow-hidden',
    children: [
      (0, jsxRuntime.jsxs)('div', {
        className: 'flex min-h-0 grow flex-col overflow-y-auto',
        children: [
          (0, jsxRuntime.jsxs)(z, {
            className: 'pt-9 pb-0',
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
function auxMakeItYours() {
  const preferences = globalThis.chrome?.auxBrowserPreferences;
  return (0, jsxRuntime.jsx)(OnboardingPage, {
    title: 'Make it yours',
    description: 'Pick the colors your Spaces start with. Imported Arc Spaces keep their colors and emoji.',
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
      className: 'space-y-3 px-5 py-6',
      children: [
        (0, jsxRuntime.jsx)(L, {
          variant: 'outline',
          size: 'lg',
          disabled: typeof preferences?.openThemePicker !== 'function',
          onClick: () => preferences.openThemePicker().catch(() => O.error('Couldn’t open the theme picker.')),
          children: 'Choose a theme',
        }),
        (0, jsxRuntime.jsx)('p', {
          className: 'text-muted-foreground text-sm',
          children: 'Name your agent and change its look from the agent panel anytime.',
        }),
      ],
    }),
  });
}
