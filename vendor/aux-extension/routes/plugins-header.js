/* Aux-owned source: the Plugins & MCPs header (assets/plugins-header-28yyYrQl.js, after its imports;
 * h exported as t): the title and the Skills and MCPs tabs, with the page's actions beside them.
 * Names the rest of the chunk uses keep their chunk names: h the header.
 * Chunk names used: o useRouterState, m useParams, p the page header, d/u/a Tabs, r Link. */
var jsxRuntime = l() /** The Plugins & MCPs header: Skills or MCPs, by the current path. */,
  h = ({actions}) => {
    const t = o({select: n => n.location.pathname}).includes('/settings/plugins/skills'),
      {userId} = m({from: '/_web/(settings)/u/$userId/settings'});
    return (0, jsxRuntime.jsxs)(p, {
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex items-center justify-between gap-4',
          children: (0, jsxRuntime.jsx)('h1', {children: 'Plugins & MCPs'}),
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex items-end justify-between gap-4',
          children: [
            (0, jsxRuntime.jsx)(d, {
              value: t ? 'skills' : 'mcps',
              className: 'mt-3 gap-0',
              children: (0, jsxRuntime.jsxs)(u, {
                variant: 'line',
                className: 'gap-3',
                children: [
                  (0, jsxRuntime.jsx)(a, {
                    value: 'skills',
                    className: 'h-auto flex-none rounded-none px-0 py-1.5',
                    render: (0, jsxRuntime.jsx)(r, {to: '/u/$userId/settings/plugins/skills', params: {userId}}),
                    children: 'Skills',
                  }),
                  (0, jsxRuntime.jsx)(a, {
                    value: 'mcps',
                    className: 'h-auto flex-none rounded-none px-0 py-1.5',
                    render: (0, jsxRuntime.jsx)(r, {to: '/u/$userId/settings/plugins/mcps', params: {userId}}),
                    children: 'MCPs',
                  }),
                ],
              }),
            }),
            actions,
          ],
        }),
      ],
    });
  };
