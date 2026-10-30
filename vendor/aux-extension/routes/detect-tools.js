/* Aux-owned source: Settings › Experimental › Detect tools (assets/detect-tools-Bq1QGFUu.js, the module body):
 * the sites found in recent history, each with its score and active days.
 * Names the rest of the chunk uses keep their chunk names: N the page (exported).
 * Chunk names used: o JSX runtime, c useTRPC, m useQuery, d title, l page header, n Spinner, p a site's favicon. */
var jsxRuntime = o();
/** The Detect tools page. */
function N() {
  const trpc = c(),
    {data: report, isPending, error} = m(trpc.onboarding.analyzeUserApps.queryOptions({}, {staleTime: 1 / 0}));
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(d, {segments: ['Settings', 'Experimental', 'Detect tools']}),
      (0, jsxRuntime.jsx)(l, {children: (0, jsxRuntime.jsx)('h1', {children: 'Detect tools'})}),
      isPending && (0, jsxRuntime.jsx)(n, {className: 'mx-auto my-16'}),
      error && (0, jsxRuntime.jsx)('p', {className: 'text-destructive text-sm', children: error.message}),
      report &&
        (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            (0, jsxRuntime.jsxs)('p', {
              className: 'text-muted-foreground mb-6 text-sm',
              children: [
                report.apps.length,
                ' hosts from ',
                report.scannedVisits.toLocaleString('en-US'),
                ' visits in the last ',
                report.window.days,
                ' ',
                'days (',
                report.droppedHosts,
                ' noise hosts dropped).',
              ],
            }),
            (0, jsxRuntime.jsx)('div', {
              className: 'grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-4',
              children: report.apps.map(app =>
                (0, jsxRuntime.jsx)(HostTile, {host: app.host, score: app.score, activeDays: app.activeDays}, app.host),
              ),
            }),
          ],
        }),
    ],
  });
}
var /** A site's tile. */
  HostTile = ({host, score, activeDays}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex flex-col items-center gap-2 text-center',
      title: `${host} · score ${score} · ${activeDays} active days`,
      children: [
        (0, jsxRuntime.jsx)(p, {host, size: '96', className: 'bg-surface-secondary size-16 rounded-xl'}),
        (0, jsxRuntime.jsx)('span', {className: 'line-clamp-2 text-xs leading-tight', children: host}),
      ],
    });
