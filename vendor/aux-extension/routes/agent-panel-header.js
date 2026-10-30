/* Aux-owned source: the Agent panel header (assets/-components-4o0FSqQ9.js, exported as t), with its
 * New side chat, Open full view and Close side panel buttons. This block starts inside the chunk's
 * `var` list. The title in it is vendor/provided/agent/integration.mjs's Aux agent title.
 * Chunk names used: s JSX runtime, a React, T cn, _ platform, ie toolbar layout, b useApp, R the
 * session context, Ce useSidepanelRouteContext, xe the session menu, N SimpleTooltip, C Button,
 * oe openPage, D closeSidePanel, z the new chat icon, J arrow-up-right, ee cross, ce the Windows
 * close icon; AuxAgentTitle and auxAgentStartSideChat from aux-agent-ui.js.
 * Aux change: the header has no side padding, so its title sits 8px in (the title button's own
 * padding), in line with the composer's text, like the sidebar's row labels; the buttons meet the
 * panel edge, as the composer card does. */
/** The panel header: an optional leading control (a back button), the title, then the actions. On
 * Windows a vertical toolbar leaves room for the caption buttons. */
  qe = ({leading}) => {
    const {os} = _(),
      {data: toolbarLayout} = ie();
    return (0, s.jsxs)('header', {
      className: 'app-region-drag flex h-10 items-center gap-2 overflow-hidden px-0 pt-0.5',
      children: [
        (0, s.jsxs)('div', {
          className: 'no-drag **:no-drag flex min-w-0 flex-1 items-center gap-1 overflow-hidden',
          children: [
            leading,
            (0, s.jsx)(AuxAgentTitle, {
              sessionId: Ce().currentSessionId,
              navigate: R().navigate,
              menu: auxLabel => (0, s.jsx)(xe, {label: auxLabel}),
            }),
          ],
        }),
        (0, s.jsxs)('div', {
          className: T('no-drag **:no-drag flex shrink-0 items-center gap-0', os === 'windows' && toolbarLayout !== 'horizontal' && 'mr-[135px]'),
          children: [(0, s.jsx)(NewSideChatButton, {}), (0, s.jsx)(OpenFullViewButton, {}), (0, s.jsx)(CloseSidePanelButton, {})],
        }),
      ],
    });
  },
  NewSideChatButton = () => {
    const {navigate} = R();
    return (0, s.jsx)(N, {
      content: 'New side chat',
      children: (0, s.jsx)(C, {
        className: 'text-muted-foreground shrink-0',
        variant: 'ghost',
        size: 'icon-sm',
        shape: 'pill',
        'aria-label': 'New side chat',
        onClick: () => (auxAgentStartSideChat(), navigate(null)),
        children: (0, s.jsx)(z, {}),
      }),
    });
  },
  // Opens the session in a tab and closes the panel; only with a session open.
  OpenFullViewButton = () => {
    const {accountId} = b(),
      {currentSessionId} = Ce(),
      sessionId = currentSessionId,
      openFullView = (0, a.useCallback)(async () => {
        sessionId && (oe(`/u/${accountId}/tasks/${encodeURIComponent(sessionId)}`), await D());
      }, [accountId, sessionId]);
    return sessionId
      ? (0, s.jsx)(N, {
        content: 'Open full view',
        children: (0, s.jsx)(C, {
          className: 'text-muted-foreground shrink-0',
          variant: 'ghost',
          size: 'icon-sm',
          shape: 'pill',
          'aria-label': 'Open full view',
          onClick: openFullView,
          children: (0, s.jsx)(J, {}),
        }),
      })
      : null;
  },
  CloseSidePanelButton = () => {
    const {os} = _();
    return (0, s.jsx)(N, {
      content: 'Close side panel',
      children: (0, s.jsx)(C, {
        className: 'text-muted-foreground shrink-0',
        variant: 'ghost',
        size: 'icon-sm',
        shape: 'pill',
        'aria-label': 'Close side panel',
        onClick: D,
        children: (0, s.jsx)(os === 'windows' ? ce : ee, {}),
      }),
    });
  };
