/* Aux-owned source, the extension app's root (assets/extension-main-Dz1-AsCT.js): the theme, query and
 * tRPC providers around the routes, the toasts, and the theme, shortcut and side panel listeners.
 * The rest of the chunk is the router and its route table, whose guards and redirects belong to
 * vendor/provided/native-ui-compat.mjs and scripts/lib/provided-password-manager-scope.mjs; it stays
 * supplied.
 * Names the rest of the chunk uses keep their chunk names: Ct the root component.
 * Chunk names used: i JSX runtime, Ne ThemeProvider, fe forced theme, Je/rt query and tRPC providers,
 * D/k their clients, Ke devtools, et/ze/lt the providers around Ce (the outlet), dt Toaster, St/Tt/Ut
 * the listeners. */
function Ct() {
  return (0, i.jsxs)(Ne, {
    attribute: 'class',
    defaultTheme: 'system',
    forcedTheme: fe(),
    disableTransitionOnChange: true,
    enableSystem: true,
    children: [
      (0, i.jsx)(Je, {
        client: D,
        children: (0, i.jsxs)(rt, {
          trpcClient: k,
          queryClient: D,
          children: [
            (0, i.jsx)(Ke, {}),
            (0, i.jsxs)(et, {
              children: [
                (0, i.jsx)(ze, {children: (0, i.jsx)(lt, {delay: 500, children: (0, i.jsx)(Ce, {})})}),
                (0, i.jsx)(dt, {position: 'top-center'}),
              ],
            }),
          ],
        }),
      }),
      (0, i.jsxs)(i.Fragment, {children: [(0, i.jsx)(St, {}), (0, i.jsx)(Tt, {}), (0, i.jsx)(Ut, {})]}),
    ],
  });
}
