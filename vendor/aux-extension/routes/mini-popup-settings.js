/* Aux-owned source: Settings › Mini popup (assets/mini-popup-BBLwe-a8.js, the module body): the intro card, the
 * enable switch and its shortcut, saved as they change. A browser version without the API says so.
 * Names the rest of the chunk uses keep their chunk names: Z the page (exported).
 * Chunk names used: w JSX runtime, F title, Q page header, g/d/p settings card, row and text, P useQueryClient, E the
 * OS, N has command shortcuts, O useQueries, S/c/q the enabled, shortcut and shortcuts queries, x useMutation, K set a
 * shortcut, T commands, u toast, D shortcut field, R the update note, _ row end, M Spinner, A Switch. */
var MINI_POPUP_IMAGE = '/assets/aux-mini-popup-DpI8c-u_.webp',
  jsxRuntime = w();
/** The Mini popup page. */
function Z() {
  const miniPopup = typeof chrome > 'u' ? void 0 : chrome.auxMiniPopup;
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(F, {segments: ['Settings', 'Mini popup']}),
      (0, jsxRuntime.jsx)(Q, {children: (0, jsxRuntime.jsx)('h1', {children: 'Mini popup'})}),
      (0, jsxRuntime.jsxs)('div', {
        className: 'space-y-8',
        children: [(0, jsxRuntime.jsx)(IntroCard, {}), miniPopup ? (0, jsxRuntime.jsx)(MiniPopupSettings, {}) : null],
      }),
    ],
  });
}
var /** What Mini popup is. */
  IntroCard = () =>
    (0, jsxRuntime.jsx)(g, {
      children: (0, jsxRuntime.jsxs)(d, {
        className: 'items-stretch gap-2.5 p-1',
        children: [
          (0, jsxRuntime.jsx)('div', {
            className: 'flex min-w-0 flex-1 flex-col px-3.5 py-3',
            children: (0, jsxRuntime.jsx)(p, {
              title: (0, jsxRuntime.jsx)('span', {className: 'text-base', children: 'Chat with Aux anytime'}),
              description: (0, jsxRuntime.jsx)('span', {
                className: 'text-sm',
                children: 'Open Aux with your shortcut and start chatting from anywhere.',
              }),
            }),
          }),
          (0, jsxRuntime.jsx)('img', {
            src: MINI_POPUP_IMAGE,
            alt: 'Mini popup composer',
            className: 'pointer-events-none w-72 shrink-0 rounded-[10px] object-cover select-none',
          }),
        ],
      }),
    }),
  /** The switch and shortcut. */
  MiniPopupSettings = () => {
    const queryClient = P(),
      {os} = E(),
      miniPopup = chrome.auxMiniPopup,
      preferences = chrome.auxBrowserPreferences,
      canToggle = !!miniPopup?.setEnabled,
      canSetShortcut =
        N(preferences) || (typeof miniPopup?.getShortcut == 'function' && typeof miniPopup.setShortcut == 'function'),
      [enabledQuery, shortcutQuery] = O({
        queries: [
          {...S, enabled: canToggle},
          {...c, enabled: canSetShortcut},
        ],
      }),
      setEnabled = x({
        mutationFn: async value => (await miniPopup?.setEnabled?.(value), value),
        onSuccess: value => queryClient.setQueryData(S.queryKey, value),
        onError: value => u.error('Couldn’t update mini popup', {description: value.message}),
      }),
      setShortcut = x({
        mutationFn: async value => (await K(preferences, T.miniPopup.commandId, value), c.queryFn()),
        onSuccess: value => {
          (queryClient.setQueryData(c.queryKey, value),
            queryClient.invalidateQueries({queryKey: q.queryKey}),
            u.success('Mini popup shortcut updated'));
        },
        onError: value => u.error('Couldn’t update shortcut', {description: value.message}),
      }),
      isEnabled = !canToggle || enabledQuery.data === true,
      handleEnabledChange = value => setEnabled.mutate(value),
      handleShortcutChange = value => setShortcut.mutate(value),
      resetShortcut = () => setShortcut.mutate(void 0),
      shortcutRow = () =>
        isEnabled
          ? canSetShortcut
            ? (0, jsxRuntime.jsx)(D, {
                value: shortcutQuery.data,
                isMacOS: os === 'macos',
                disabled: shortcutQuery.isError || shortcutQuery.isLoading || setShortcut.isPending,
                onValueChange: handleShortcutChange,
                onReset: resetShortcut,
              })
            : (0, jsxRuntime.jsx)(d, {children: (0, jsxRuntime.jsx)(p, {title: 'Keyboard shortcut', description: R})})
          : null;
    return (0, jsxRuntime.jsxs)(g, {
      children: [
        (0, jsxRuntime.jsxs)(d, {
          children: [
            (0, jsxRuntime.jsx)(p, {
              title: 'Enable Mini popup',
              description: canToggle
                ? 'Open Mini popup from anywhere with your shortcut'
                : 'Unavailable in this browser version',
            }),
            (0, jsxRuntime.jsxs)(_, {
              children: [
                enabledQuery.isLoading && (0, jsxRuntime.jsx)(M, {}),
                (0, jsxRuntime.jsx)(A, {
                  checked: isEnabled,
                  disabled: !canToggle || enabledQuery.isLoading || setEnabled.isPending,
                  onCheckedChange: handleEnabledChange,
                }),
              ],
            }),
          ],
        }),
        shortcutRow(),
      ],
    });
  };
