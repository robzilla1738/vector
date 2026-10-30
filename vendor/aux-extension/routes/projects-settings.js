/* Aux-owned source: the Projects settings page (assets/projects-D4kjkizu.js, after its imports;
 * D exported as component): active and archived Projects, and creating one.
 * Names the rest of the chunk uses keep their chunk names: D the page.
 * Chunk names used: P navigate, y useTRPC, _ useSuspenseQuery, l sortProjects, c/j/N/F settings sections
 * and rows, m the Project list, q the new-Project dialog, A the route, R/I/b page header and loading. */
var React = S(f(), 1),
  jsxRuntime = v() /** Active Projects with Create, archived ones below, and the new-Project dialog. */,
  ProjectsSettings = ({userId}) => {
    const d = P(),
      r = Number(userId),
      [u, n] = (0, React.useState)(false),
      x = y(),
      {data} = _(x.projects.list.queryOptions({accountId: r})),
      a = l(data.filter(s => !s.archivedAt)),
      i = l(data.filter(s => !!s.archivedAt)),
      h = () => n(true),
      g = s => {
        d({to: '/u/$userId/projects/$projectId', params: {userId, projectId: s}});
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'space-y-8',
          children: [
            (0, jsxRuntime.jsx)(c, {
              label: 'Projects',
              children: (0, jsxRuntime.jsxs)(j, {
                children: [
                  a.length > 0 && (0, jsxRuntime.jsx)(m, {accountId: r, projects: a, userId}),
                  (0, jsxRuntime.jsxs)(N, {
                    variant: 'action',
                    onClick: h,
                    children: [
                      (0, jsxRuntime.jsx)(C, {className: 'mx-0.5 size-4'}),
                      (0, jsxRuntime.jsx)(F, {title: 'Create'}),
                    ],
                  }),
                ],
              }),
            }),
            i.length > 0 &&
              (0, jsxRuntime.jsx)(c, {
                title: 'Archived',
                children: (0, jsxRuntime.jsx)(j, {
                  children: (0, jsxRuntime.jsx)(m, {accountId: r, projects: i, userId}),
                }),
              }),
          ],
        }),
        (0, jsxRuntime.jsx)(q, {accountId: r, open: u, onOpenChange: n, onCreated: g}),
      ],
    });
  }; /** The Projects settings page. */
function D() {
  const {userId} = A.useParams();
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(R, {segments: ['Settings', 'Projects']}),
      (0, jsxRuntime.jsx)(I, {children: (0, jsxRuntime.jsx)('h1', {children: 'Projects'})}),
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(b, {}),
        children: (0, jsxRuntime.jsx)(ProjectsSettings, {userId}),
      }),
    ],
  });
}
