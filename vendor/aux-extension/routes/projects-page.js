/* Aux-owned source: the Projects page (assets/projects-D_csJvC9.js, after its imports; U exported as
 * component): active and archived Projects, an empty state that invites creating one, and the
 * new-Project dialog (open at once with ?mode=create).
 * Names the rest of the chunk uses keep their chunk names: U the page.
 * Chunk names used: y navigate, w useTRPC, b useQuery, u sortProjects, _ Skeleton, I/E page frame and
 * breadcrumb, x/j/B/z settings sections and rows, p the Project list, R the new-Project dialog, k the
 * Projects icon, A Button, d the route. */
var React = P(N(), 1),
  jsxRuntime = C() /** Projects, or an error, or the empty state; and the new-Project dialog. */,
  ProjectsPage = ({initiallyCreating = false, userId}) => {
    const h = y(),
      a = Number(userId),
      [f, c] = (0, React.useState)(initiallyCreating),
      g = w(),
      o = b(g.projects.list.queryOptions({accountId: a})),
      i = () => c(true),
      v = r => {
        h({to: '/u/$userId/projects/$projectId', params: {userId, projectId: r}});
      };
    if (o.isPending) return (0, jsxRuntime.jsx)(_, {className: 'm-8 h-48 rounded-xl'});
    const n = o.data ?? [],
      l = u(n.filter(r => !r.archivedAt)),
      m = u(n.filter(r => !!r.archivedAt));
    return (0, jsxRuntime.jsxs)(I, {
      className: 'size-full',
      children: [
        (0, jsxRuntime.jsx)(E, {segments: ['Projects']}),
        (0, jsxRuntime.jsxs)('main', {
          className: 'mx-auto w-full max-w-2xl px-8 pt-16 pb-40 text-left',
          children: [
            (0, jsxRuntime.jsx)('header', {
              className: 'mb-8',
              children: (0, jsxRuntime.jsx)('div', {
                className: 'flex items-center gap-3',
                children: (0, jsxRuntime.jsx)('h1', {
                  className: 'font-display text-3xl font-medium',
                  children: 'Projects',
                }),
              }),
            }),
            o.isError
              ? (0, jsxRuntime.jsx)('p', {
                  className: 'text-destructive text-sm',
                  children: 'Projects could not be loaded.',
                })
              : n.length === 0
                ? (0, jsxRuntime.jsx)(NoProjects, {onCreate: i})
                : (0, jsxRuntime.jsxs)('div', {
                    className: 'space-y-8',
                    children: [
                      (0, jsxRuntime.jsx)(x, {
                        label: 'Projects',
                        children: (0, jsxRuntime.jsxs)(j, {
                          children: [
                            l.length > 0 && (0, jsxRuntime.jsx)(p, {accountId: a, projects: l, userId}),
                            (0, jsxRuntime.jsxs)(B, {
                              variant: 'action',
                              onClick: i,
                              children: [
                                (0, jsxRuntime.jsx)(S, {className: 'mx-0.5 size-4'}),
                                (0, jsxRuntime.jsx)(z, {title: 'Create'}),
                              ],
                            }),
                          ],
                        }),
                      }),
                      m.length > 0 &&
                        (0, jsxRuntime.jsx)(x, {
                          title: 'Archived',
                          children: (0, jsxRuntime.jsx)(j, {
                            children: (0, jsxRuntime.jsx)(p, {accountId: a, projects: m, userId}),
                          }),
                        }),
                    ],
                  }),
          ],
        }),
        (0, jsxRuntime.jsx)(R, {accountId: a, open: f, onOpenChange: c, onCreated: v}),
      ],
    });
  } /** No Projects yet: what they are for, and Create a Project. */,
  NoProjects = ({onCreate}) =>
    (0, jsxRuntime.jsxs)('section', {
      className: 'flex min-h-72 flex-col items-center justify-center py-16 text-center',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className:
            'bg-surface-secondary text-muted-foreground mb-5 flex size-14 items-center justify-center rounded-2xl',
          children: (0, jsxRuntime.jsx)(k, {className: 'size-7'}),
        }),
        (0, jsxRuntime.jsx)('h2', {
          className: 'font-display text-lg font-medium',
          children: 'Make room for focused work',
        }),
        (0, jsxRuntime.jsx)('p', {
          className: 'text-muted-foreground mt-2 max-w-sm text-sm',
          children: 'Bring related tasks, instructions, and context together whenever a project needs its own space.',
        }),
        (0, jsxRuntime.jsx)(A, {
          className: 'mt-5',
          variant: 'outline',
          onClick: onCreate,
          children: 'Create a Project',
        }),
      ],
    }); /** The Projects page. */
function U() {
  const {userId} = d.useParams(),
    {mode} = d.useSearch();
  return (0, jsxRuntime.jsx)(ProjectsPage, {initiallyCreating: mode === 'create', userId});
}
