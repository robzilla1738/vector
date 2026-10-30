/* Aux-owned source: the Projects list (assets/project-list-BmtBNv8P.js, the module body): a row for each
 * Project with its icon, last activity and a menu to archive it, or to delete it once archived; the
 * create dialog; most recently active first.
 * Names the rest of the chunk uses keep their chunk names: U ProjectList, X NewProjectDialog, Y sortProjects,
 * e the JSX runtime.
 * Chunk names used: f JSX runtime, Q the row card, g Link, N ProjectIcon, $ the title, L Button, T more, h toast,
 * M useTRPC, I useQueryClient, A useConfirm, p useMutation, F/y/b/D/u the menu, _/w trash and archive, P/k the
 * dialog, C the create form, q dayjs. */
/** The Projects. */
  U = ({accountId, projects, userId}) =>
    (0, e.jsx)(e.Fragment, {
      children: projects.map(project => (0, e.jsx)(ProjectRow, {accountId, project, userId}, project.id)),
    }),
  /** A Project's row. */
  ProjectRow = ({accountId, project, userId}) => {
    const trpc = M(),
      queryClient = I(),
      {confirm} = A(),
      archiveProject = p(trpc.projects.archive.mutationOptions()),
      deleteProject = p(trpc.projects.delete.mutationOptions()),
      isArchived = !!project.archivedAt,
      isPending = archiveProject.isPending || deleteProject.isPending,
      handleArchive = event => {
        (event.preventDefault(),
          event.stopPropagation(),
          confirm(
            {
              title: `Archive ${project.name}?`,
              description: 'Its tasks and routines stay available, but new work is disabled.',
              ui: {action: 'Archive', variant: 'destructive'},
            },
            async () => {
              try {
                (await archiveProject.mutateAsync({accountId, projectId: project.id}),
                  await queryClient.invalidateQueries(trpc.projects.list.queryFilter({accountId})));
              } catch (error) {
                h.error(error instanceof Error ? error.message : 'Failed to archive Project.');
              }
            },
          ));
      },
      handleDelete = event => {
        (event.preventDefault(),
          event.stopPropagation(),
          confirm(
            {
              title: `Delete ${project.name}?`,
              description: 'This removes the Project from Aux. It does not delete the project files on disk.',
              ui: {action: 'Delete', variant: 'destructive'},
            },
            async () => {
              try {
                (await deleteProject.mutateAsync({accountId, projectId: project.id}),
                  await queryClient.invalidateQueries(trpc.projects.list.queryFilter({accountId})));
              } catch (error) {
                h.error(error instanceof Error ? error.message : 'Failed to delete Project.');
              }
            },
          ));
      };
    return (0, e.jsxs)(Q, {
      className: 'p-0',
      children: [
        (0, e.jsxs)(g, {
          className: 'flex min-h-13 min-w-0 grow items-center gap-1 px-3 py-2.5 focus-visible:outline-0',
          to: '/u/$userId/projects/$projectId',
          params: {userId, projectId: project.id},
          children: [
            (0, e.jsx)(N, {className: 'size-5 shrink-0', color: project.color, icon: project.icon}),
            (0, e.jsx)($, {title: project.name}),
            (0, e.jsx)('span', {
              className: 'text-muted-foreground ml-auto shrink-0 pl-3 text-xs',
              children: formatLastActive(project.lastActiveAt),
            }),
          ],
        }),
        (0, e.jsx)('div', {
          className: 'flex shrink-0 items-center pr-3',
          children: (0, e.jsxs)(F, {
            children: [
              (0, e.jsx)(y, {
                render: (0, e.jsx)(L, {
                  variant: 'ghost',
                  size: 'icon-sm',
                  className: 'text-muted-foreground',
                  'aria-label': `${project.name} actions`,
                }),
                children: (0, e.jsx)(T, {}),
              }),
              (0, e.jsx)(b, {
                className: 'w-44',
                align: 'end',
                children: (0, e.jsx)(D, {
                  children: isArchived
                    ? (0, e.jsxs)(u, {
                        variant: 'destructive',
                        disabled: isPending,
                        onClick: handleDelete,
                        children: [(0, e.jsx)(_, {}), (0, e.jsx)('span', {children: 'Delete'})],
                      })
                    : (0, e.jsxs)(u, {
                        variant: 'destructive',
                        disabled: isPending,
                        onClick: handleArchive,
                        children: [(0, e.jsx)(w, {}), (0, e.jsx)('span', {children: 'Archive'})],
                      }),
                }),
              }),
            ],
          }),
        }),
      ],
    });
  },
  /** The new Project dialog. */
  X = ({accountId, open, onCreated, onOpenChange}) => {
    const close = () => {
      onOpenChange(false);
    };
    return (0, e.jsx)(P, {
      open,
      onOpenChange,
      children: (0, e.jsx)(k, {
        className: 'w-lg max-w-[calc(100%-(--spacing(8)))]!',
        children: open && (0, e.jsx)(C, {accountId, onClose: close, onCreated}),
      }),
    });
  },
  /** Projects, most recently active first. */
  Y = projects =>
    [...projects].sort(
      (a, b) => new Date(b.lastActiveAt ?? b.updatedAt).getTime() - new Date(a.lastActiveAt ?? a.updatedAt).getTime(),
    ),
  /** A date, or a dash when it is invalid. */
  formatLastActive = value => {
    if (!value) return '';
    const date = (0, q.default)(value);
    return date.isValid() ? date.format('LL') : '—';
  };
