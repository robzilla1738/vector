/* Aux-owned source, the New Tab nudges (assets/nudges-7TFAp4B-.js, the module body; Q exported as
 * NewTabPageNudges): the coding-agent nudge, and when it is hidden, the default-browser nudge (shown
 * until Aux is the default, policy disables it, or it is dismissed for a week).
 * vendor/provided/agent/integration.mjs drops the nudge's small Aux mark before this; the source keeps
 * the nudge without it.
 * Names the rest of the chunk uses keep their chunk names: o the analytics place, Q the nudges.
 * Chunk names used: A/S React, N cn, m the browser API, h whether it is reachable, B Spinner, v analytics,
 * C/D mutation and query hooks, _ agent settings, P the close icon, f Button, E dayjs, q useDismissable,
 * k/I the coding-agent nudge and its target. */
var c = A(S(), 1),
  jsxRuntime = j(),
  /** Where the nudges show, for analytics. */
  o = 'new-tab',
  /** Asks to make Aux the default browser. */
  DefaultBrowserNudge = () => {
    const {capture} = v(),
      viewed = (0, c.useRef)(false),
      {isDismissed, dismiss} = q('nudge.defaultBrowser.dismissedUntil', E.default.duration(1, 'week')),
      reachable = !!h(),
      {
        data: state,
        isLoading,
        refetch,
      } = D({
        queryKey: ['browserPreferences', 'defaultBrowserState'],
        queryFn: () => m().getDefaultBrowserState(),
        enabled: reachable && !isDismissed,
      }),
      hidden = isDismissed || state?.policyDisabled || !reachable || state?.isDefault;
    (0, c.useEffect)(() => {
      hidden ||
        isLoading ||
        viewed.current ||
        ((viewed.current = true), capture('nudges.default-browser.view', {place: o}));
    }, [capture, isLoading, hidden]);
    const setDefault = C({
        mutationFn: () => m().setAsDefaultBrowser(),
        onSuccess: result => {
          (refetch(), capture('settings.set-as-default-browser', {place: o, value: result.isDefault}));
        },
      }),
      onSetDefault = () => {
        (capture('nudges.default-browser.set-default', {place: o}), setDefault.mutate());
      },
      onDismiss = () => {
        (capture('nudges.default-browser.dismiss', {place: o}), dismiss());
      };
    if (hidden || isLoading) return null;
    const disabled = !state?.canSet || setDefault.isPending;
    return (0, jsxRuntime.jsxs)('div', {
      className: 'mb-1 flex h-12 w-full items-center gap-1.5 rounded-xl px-2.5',
      children: [
        (0, jsxRuntime.jsx)('span', {
          className: 'text-muted-foreground grow text-sm font-medium select-none',
          children: 'Aux works best as your default browser',
        }),
        (0, jsxRuntime.jsxs)(f, {
          variant: 'outline',
          className: 'bg-transparent',
          disabled,
          onClick: onSetDefault,
          children: [
            setDefault.isPending && (0, jsxRuntime.jsx)(B, {}),
            (0, jsxRuntime.jsx)('span', {children: 'Set as default'}),
          ],
        }),
        (0, jsxRuntime.jsx)(f, {
          'aria-label': 'Close',
          variant: 'ghost',
          size: 'icon',
          className: 'text-muted-foreground',
          onClick: onDismiss,
          children: (0, jsxRuntime.jsx)(P, {}),
        }),
      ],
    });
  },
  /** The New Tab nudges: the coding agent first, then the default browser. */
  Q = ({accountId, className}) => {
    const {isLoading, modelProvider} = _({loadModelCatalog: false}),
      [agentNudge, setAgentNudge] = (0, c.useState)('pending');
    return (0, jsxRuntime.jsxs)('div', {
      className: N('w-full max-w-2xl', className),
      children: [
        (0, jsxRuntime.jsx)(k, {
          accountId,
          isPending: isLoading,
          onStatusChange: setAgentNudge,
          targetId: I(modelProvider),
        }),
        agentNudge === 'hidden' && (0, jsxRuntime.jsx)(DefaultBrowserNudge, {}),
      ],
    });
  };
