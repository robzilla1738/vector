/* Aux-owned source, the shared task list, second pass (assets/utils-DCBm67_n.js, from the Projects submenu to
 * the end of the module): the Add to / Move to project submenu and its Start a new project dialog, a task's
 * context menu (rename, copy ID, read state, pin, project, archive, delete), and the chat list row with
 * its title, badges, preview, status and time.
 * Names the rest of the chunk uses keep their chunk names: $t the project submenu, Ut the new project dialog,
 * Yt the context menu, ps the row's context provider, vs the row, Cs the label, xs the title, Ss the routine
 * badge, bs the preview, ws the trailing group, js the status, Is the time, ys truncate, Ms file size.
 * Chunk names used: o JSX runtime, I React, _ cn, be cva, oe mergeProps, ge useRender, Le/Oe/We/k/fe context menu
 * parts, Ee/Be/ze/De the context menu, Pe/Me/Ye/_e/Ae dropdown parts, he Input, de useMoveSessionToProject, Ge the
 * new project form, ce/ue/Ve/qe/Ke/ke/Te dialog parts, et ProjectIcon, He check, Ze plus, G Spinner, ae useApp, Fe
 * useConfirm, le analytics, tt useTRPC, Je useQueryClient, F useMutation, it toast, je/Ne/nt copy, archive and delete
 * icons, N Badge, ye an Aux Code session, st/me pin and routine icons, $e shimmer, Ue relative time, rt/ot/lt tooltip
 * parts, J dayjs, Xe/Ie a session's error and its copy, Re the error icon; at/ct/dt/ft/gt/ht/mt/ut the first
 * pass's icons, pt capitalize. */
var /** The dropdown's sub-menu content at the small size. */
  SmallDropdownSubContent = props =>
    (0, o.jsx)(Ye, {size: 'sm', ...props}) /** A menu's parts, so one submenu serves context menus and dropdowns. */,
  MENU_PARTS = {
    context: {Sub: Le, SubTrigger: Oe, SubContent: We, Item: k, Separator: fe},
    dropdown: {Sub: Pe, SubTrigger: Me, SubContent: SmallDropdownSubContent, Item: _e, Separator: Ae},
  } /** Add to or Move to project: a filter from six Projects on, the Projects, Start a new project, Remove from project. */,
  $t = ({session, place, variant, onStartNewProject}) => {
    const {Sub, SubTrigger, SubContent, Item, Separator} = MENU_PARTS[variant],
      [filter, setFilter] = (0, I.useState)(''),
      {canMove, isMoveLocked, projects, isLoading, handleMove, isPending} = de({session, place}),
      clearFilterOnClose = open => {
        open || setFilter('');
      },
      updateFilter = event => {
        setFilter(event.target.value);
      },
      stopKey = event => {
        event.stopPropagation();
      },
      removeFromProject = () => {
        handleMove(null);
      };
    return canMove
      ? (0, o.jsxs)(Sub, {
          onOpenChange: clearFilterOnClose,
          children: [
            (0, o.jsxs)(SubTrigger, {
              disabled: isMoveLocked,
              children: [
                (0, o.jsx)(dt, {className: 'text-muted-foreground'}),
                (0, o.jsx)('span', {children: session.projectId ? 'Move to project' : 'Add to project'}),
              ],
            }),
            (0, o.jsxs)(SubContent, {
              className: 'max-h-72 w-56 overflow-y-auto',
              children: [
                projects.length >= 6 &&
                  (0, o.jsx)('div', {
                    className: 'p-1',
                    children: (0, o.jsx)(he, {
                      className: 'h-7',
                      placeholder: 'Filter projects…',
                      value: filter,
                      onChange: updateFilter,
                      onKeyDown: stopKey,
                    }),
                  }),
                (0, o.jsx)(ProjectMenuItems, {
                  Item,
                  session,
                  filter,
                  projects,
                  isLoading,
                  isPending,
                  onMove: handleMove,
                }),
                (session.projectId || onStartNewProject) && (0, o.jsx)(Separator, {}),
                onStartNewProject &&
                  (0, o.jsxs)(Item, {
                    onClick: onStartNewProject,
                    children: [
                      (0, o.jsx)(Ze, {className: 'text-muted-foreground'}),
                      (0, o.jsx)('span', {children: 'Start a new project'}),
                    ],
                  }),
                session.projectId &&
                  (0, o.jsxs)(Item, {
                    variant: 'destructive',
                    disabled: isPending,
                    onClick: removeFromProject,
                    children: [(0, o.jsx)(mt, {}), (0, o.jsx)('span', {children: 'Remove from project'})],
                  }),
              ],
            }),
          ],
        })
      : null;
  } /** The submenu's rows: loading, empty, or the matching Projects. */,
  ProjectMenuItems = ({Item, session, filter, projects, isLoading, isPending, onMove}) => {
    const query = filter.trim().toLowerCase(),
      matches = query ? projects.filter(project => project.name.toLowerCase().includes(query)) : projects,
      move = projectId => () => {
        onMove(projectId);
      };
    return isLoading
      ? (0, o.jsxs)(Item, {
          disabled: true,
          children: [(0, o.jsx)(G, {className: 'size-3.5'}), (0, o.jsx)('span', {children: 'Loading projects…'})],
        })
      : matches.length === 0
        ? (0, o.jsx)(Item, {
            disabled: true,
            children: (0, o.jsx)('span', {children: query ? 'No matching projects' : 'No projects yet'}),
          })
        : matches.map(project =>
            (0, o.jsxs)(
              Item,
              {
                disabled: isPending,
                onClick: move(project.id),
                children: [
                  (0, o.jsx)(et, {className: 'size-4', color: project.color, icon: project.icon}),
                  (0, o.jsx)('span', {className: 'truncate', children: project.name}),
                  project.id === session.projectId && (0, o.jsx)(He, {className: 'ml-auto'}),
                ],
              },
              project.id,
            ),
          );
  } /** The Start a new project dialog; the new Project takes the task without a confirmation. */,
  Ut = ({session, place, open, onOpenChange}) => {
    const {accountId} = ae(),
      {handleMove} = de({session, place}),
      close = () => {
        onOpenChange(false);
      },
      moveToCreated = projectId => {
        handleMove(projectId, {skipConfirm: true});
      },
      stopKey = event => {
        event.stopPropagation();
      };
    return (0, o.jsx)(ce, {
      open,
      onOpenChange,
      children: (0, o.jsx)(ue, {
        className: 'w-lg max-w-[calc(100%-(--spacing(8)))]!',
        onKeyDown: stopKey,
        children: open && (0, o.jsx)(Ge, {accountId, onClose: close, onCreated: moveToCreated}),
      }),
    });
  } /** A task's context menu and its Rename dialog. */,
  Yt = ({children, session, open, onOpenChange}) => {
    const {confirm} = Fe(),
      {accountId} = ae(),
      {capture} = le(),
      [renaming, setRenaming] = (0, I.useState)(false),
      [creatingProject, setCreatingProject] = (0, I.useState)(false),
      [title, setTitle] = (0, I.useState)(session.title ?? ''),
      trpc = tt(),
      queryClient = Je(),
      archive = F(trpc.sessions.archive.mutationOptions()),
      remove = F(trpc.sessions.delete.mutationOptions()),
      markRead = F(trpc.sessions.markRead.mutationOptions()),
      markUnread = F(trpc.sessions.markUnread.mutationOptions()),
      update = F(trpc.sessions.update.mutationOptions()),
      unread = session.unread,
      refreshList = () => {
        (queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
          queryClient.invalidateQueries(trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId})));
      },
      handleArchive = async () => {
        (await archive.mutateAsync({sessionId: session.id, accountId}),
          capture('tasks.card.archive', {sessionId: session.id, place: 'list'}),
          refreshList());
      },
      handleDelete = () => {
        confirm(
          {
            title: 'Delete chat?',
            description: 'This will permanently delete this chat and its messages.',
            ui: {action: 'Delete', variant: 'destructive'},
          },
          async () => {
            (await remove.mutateAsync({sessionId: session.id, accountId}),
              capture('tasks.card.delete', {sessionId: session.id, place: 'list'}),
              refreshList());
          },
        );
      },
      handleRename = async event => {
        event.preventDefault();
        const nextTitle = title.trim();
        if (!nextTitle || nextTitle === session.title) {
          setRenaming(false);
          return;
        }
        (await update.mutateAsync({sessionId: session.id, accountId, title: nextTitle}),
          capture('tasks.card.rename', {sessionId: session.id, place: 'list'}),
          refreshList(),
          setRenaming(false));
      },
      toggleRead = async () => {
        (unread
          ? (await markRead.mutateAsync({sessionId: session.id, accountId}),
            capture('tasks.card.mark-read', {sessionId: session.id, place: 'list'}))
          : (await markUnread.mutateAsync({sessionId: session.id, accountId}),
            capture('tasks.card.mark-unread', {sessionId: session.id, place: 'list'})),
          refreshList());
      },
      startRenaming = () => {
        (setTitle(session.title ?? ''), setRenaming(true));
      },
      startNewProject = () => {
        setCreatingProject(true);
      },
      togglePin = async () => {
        (await update.mutateAsync({sessionId: session.id, accountId, pinned: !session.pinned}),
          capture(session.pinned ? 'tasks.card.unpin' : 'tasks.card.pin', {sessionId: session.id, place: 'list'}),
          refreshList());
      },
      copySessionId = async () => {
        (await navigator.clipboard.writeText(session.id),
          capture('tasks.card.copy-id', {sessionId: session.id, place: 'list'}),
          it.success('Session ID copied'));
      },
      stopClick = event => {
        event.stopPropagation();
      },
      stopKey = event => {
        event.stopPropagation();
      },
      updateTitle = event => {
        setTitle(event.currentTarget.value);
      };
    return (0, o.jsxs)(o.Fragment, {
      children: [
        (0, o.jsxs)(Ee, {
          open,
          onOpenChange,
          children: [
            (0, o.jsx)(Be, {render: children}),
            (0, o.jsx)(ze, {
              className: 'w-48',
              onClick: stopClick,
              children: (0, o.jsxs)(De, {
                children: [
                  (0, o.jsxs)(k, {
                    onClick: startRenaming,
                    children: [
                      (0, o.jsx)(ut, {className: 'text-muted-foreground'}),
                      (0, o.jsx)('span', {children: 'Rename'}),
                    ],
                  }),
                  (0, o.jsxs)(k, {
                    onClick: copySessionId,
                    children: [
                      (0, o.jsx)(je, {className: 'text-muted-foreground'}),
                      (0, o.jsx)('span', {children: 'Copy session ID'}),
                    ],
                  }),
                  (0, o.jsxs)(k, {
                    disabled: markRead.isPending || markUnread.isPending,
                    onClick: toggleRead,
                    children: [
                      unread
                        ? (0, o.jsx)(at, {className: 'text-muted-foreground'})
                        : (0, o.jsx)(ct, {className: 'text-muted-foreground'}),
                      (0, o.jsx)('span', {children: unread ? 'Mark as read' : 'Mark as unread'}),
                    ],
                  }),
                  (0, o.jsxs)(k, {
                    disabled: update.isPending,
                    onClick: togglePin,
                    children: [
                      session.pinned
                        ? (0, o.jsx)(gt, {className: 'text-muted-foreground'})
                        : (0, o.jsx)(ft, {className: 'text-muted-foreground'}),
                      (0, o.jsx)('span', {children: session.pinned ? 'Unpin' : 'Pin'}),
                    ],
                  }),
                  (0, o.jsx)($t, {session, place: 'list', variant: 'context', onStartNewProject: startNewProject}),
                  (0, o.jsx)(fe, {}),
                  (0, o.jsxs)(k, {
                    disabled: archive.isPending,
                    onClick: handleArchive,
                    children: [(0, o.jsx)(Ne, {}), (0, o.jsx)('span', {children: 'Archive'})],
                  }),
                  (0, o.jsxs)(k, {
                    variant: 'destructive',
                    disabled: remove.isPending,
                    onClick: handleDelete,
                    children: [(0, o.jsx)(nt, {}), (0, o.jsx)('span', {children: 'Delete'})],
                  }),
                ],
              }),
            }),
          ],
        }),
        (0, o.jsx)(ce, {
          open: renaming,
          onOpenChange: setRenaming,
          children: (0, o.jsxs)(ue, {
            onKeyDown: stopKey,
            children: [
              (0, o.jsx)(Ve, {children: (0, o.jsx)(qe, {children: 'Rename task'})}),
              (0, o.jsx)('form', {
                id: `rename-task-form-${session.id}`,
                onSubmit: handleRename,
                children: (0, o.jsx)(he, {autoFocus: true, value: title, onChange: updateTitle}),
              }),
              (0, o.jsxs)(Ke, {
                children: [
                  (0, o.jsx)(ke, {disabled: update.isPending, children: 'Cancel'}),
                  (0, o.jsxs)(Te, {
                    type: 'submit',
                    form: `rename-task-form-${session.id}`,
                    disabled: update.isPending || !title.trim(),
                    children: [update.isPending && (0, o.jsx)(G, {}), (0, o.jsx)('span', {children: 'Rename'})],
                  }),
                ],
              }),
            ],
          }),
        }),
        (0, o.jsx)(Ut, {session, place: 'list', open: creatingProject, onOpenChange: setCreatingProject}),
      ],
    });
  },
  ChatListItemContext = (0, I.createContext)(null),
  ps = ChatListItemContext.Provider /** A row in a chat list: opens the task and carries the context menu. */,
  vs = ({render, session, ...props}) => {
    const {capture} = le(),
      {onClick, ...rest} = props,
      [menuOpen, setMenuOpen] = (0, I.useState)(false),
      handleClick = event => {
        (onClick?.(event),
          !event.defaultPrevented &&
            capture('tasks.card.open', {sessionId: session.id, place: 'list', status: session.status}));
      },
      row = ge({
        defaultTagName: 'div',
        props: oe(rest, {
          className: _(
            'group/chat-list-item flex w-full min-w-0 items-center gap-4 overflow-hidden rounded-xl px-3 py-2 transition-colors select-none',
            'hover:bg-secondary focus-visible:bg-secondary [&.active]:bg-muted! focus-visible:ring-foreground/60 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
            menuOpen && 'bg-secondary',
          ),
          onClick: handleClick,
        }),
        render,
        state: {slot: 'chat-list-item', status: statusSlot(session)},
      });
    return (0, o.jsx)(ChatListItemContext, {
      value: {session},
      children: (0, o.jsx)(Yt, {session, open: menuOpen, onOpenChange: setMenuOpen, children: row}),
    });
  } /** The row's label group. */,
  Cs = ({render, orientation = 'horizontal', ...props}) =>
    ge({
      defaultTagName: 'div',
      props: oe(props, {className: labelVariants({orientation})}),
      render,
      state: {slot: 'chat-list-item-label'},
    }) /** The label group's layout. */,
  labelVariants = be('flex min-w-0 grow items-center gap-2 truncate overflow-hidden text-sm', {
    variants: {orientation: {horizontal: 'flex-row', vertical: 'flex-col'}},
    defaultVariants: {orientation: 'horizontal'},
  }) /** The title, with the routine, pin, Remote and Aux Code marks. */,
  xs = ({children, className, ...props}) => {
    const item = (0, I.use)(ChatListItemContext),
      remote = item?.session.trigger?.type === 'user' && item.session.trigger.source === 'remote',
      auxCode = !!item && !!ye(item.session);
    return (0, o.jsxs)('p', {
      className: _('text-primary flex min-w-0 items-center gap-1.5 font-medium', className),
      ...props,
      children: [
        (0, o.jsx)('span', {className: 'truncate', children}),
        item?.session.trigger?.type === 'standalone-routine' &&
          (0, o.jsx)(me, {className: 'text-muted-foreground size-3.5 shrink-0', 'aria-label': 'Routine'}),
        item?.session.pinned && (0, o.jsx)(st, {className: 'text-muted-foreground size-3 shrink-0'}),
        remote && (0, o.jsx)(N, {variant: 'outline', className: 'shrink-0 text-[10px]', children: 'Remote'}),
        auxCode && (0, o.jsx)(N, {variant: 'outline', className: 'shrink-0 text-[10px]', children: 'Aux Code'}),
      ],
    });
  } /** A routine's schedule. */,
  Ss = () => {
    const {session} = useChatListItem();
    return session.routine
      ? (0, o.jsxs)(N, {
          variant: 'outline',
          className: 'max-w-48 text-[10px]',
          title: session.routine.scheduleLabel,
          children: [
            (0, o.jsx)(me, {className: 'size-3 shrink-0 text-green-600 dark:text-green-400'}),
            (0, o.jsx)('span', {className: 'truncate', children: session.routine.scheduleLabel}),
          ],
        })
      : null;
  } /** The preview: why a task failed or waits, or the given text, shimmering while it runs. */,
  bs = ({children, className, ...props}) => {
    const {session} = useChatListItem(),
      detail = statusDetail(session) ?? children;
    return (0, o.jsx)('p', {
      className: _('text-muted-foreground min-w-0 grow truncate', className),
      ...props,
      children:
        session.status === 'running' && typeof children == 'string' ? (0, o.jsx)($e, {as: 'span', children}) : detail,
    });
  } /** The row's trailing group. */,
  ws = ({className, children, ...props}) =>
    (0, o.jsx)('div', {
      className: _('flex shrink-0 items-center gap-2', className),
      ...props,
      children,
    }) /** What the task needs, else unread, else its status. */,
  js = ({size = 'default', className, variant, ...props}) => {
    const {session} = useChatListItem();
    let pill = null;
    return isAwaitingReview(session)
      ? (0, o.jsx)(AwaitingBadge, {className, ...props, children: 'Awaiting review'})
      : isAwaitingApproval(session)
        ? (0, o.jsx)(AwaitingBadge, {className, ...props, children: 'Awaiting approval'})
        : isAwaitingAnswer(session)
          ? (0, o.jsx)(AwaitingBadge, {className, ...props, children: 'Awaiting answer'})
          : session.unread
            ? (0, o.jsx)('span', {
                role: 'status',
                'aria-label': 'Unread task',
                className: _('flex size-4 shrink-0 items-center justify-center', className),
                ...props,
                children: (0, o.jsx)('span', {'aria-hidden': 'true', className: 'bg-brand size-1.5 rounded-full'}),
              })
            : (session.status === 'suspended' &&
                (pill = (0, o.jsxs)(o.Fragment, {
                  children: [(0, o.jsx)(ht, {}), (0, o.jsx)('span', {children: 'Waiting'})],
                })),
              (session.status === 'aborted' || session.status === 'errored') &&
                (pill = (0, o.jsxs)(o.Fragment, {
                  children: [
                    (0, o.jsx)(Re, {}),
                    (0, o.jsx)('span', {children: session.status === 'errored' ? 'Failed' : pt(session.status)}),
                  ],
                })),
              session.status === 'running' &&
                (pill = (0, o.jsxs)(o.Fragment, {
                  children: [(0, o.jsx)(G, {className: 'animate-spin'}), (0, o.jsx)('span', {children: 'Running'})],
                })),
              pill
                ? (0, o.jsx)(N, {
                    variant: 'ghost',
                    className: _(
                      'text-muted-foreground shrink-0 gap-1 text-xs font-medium',
                      size === 'sm' &&
                        'size-4 bg-transparent! p-0 [&>span]:sr-only [&>svg]:size-4! [&>svg]:text-inherit!',
                      'group-data-[status=waiting]/chat-list-item:bg-amber-400/10 group-data-[status=waiting]/chat-list-item:text-amber-500!',
                      'group-data-[status=error]/chat-list-item:text-destructive! group-data-[status=error]/chat-list-item:bg-destructive/10',
                      'group-data-[status=running]/chat-list-item:text-primary! group-data-[status=running]/chat-list-item:bg-primary/10',
                      size === 'default' && '[&>svg]:-ml-0.5',
                      className,
                    ),
                    ...props,
                    children: pill,
                  })
                : null);
  } /** The time, with the exact time in a tooltip. */,
  Is = ({datetime, className}) =>
    (0, o.jsxs)(lt, {
      children: [
        (0, o.jsx)(rt, {
          render: (0, o.jsx)('span', {className: _('text-muted-foreground shrink-0 text-xs font-medium', className)}),
          children: (0, o.jsx)(Ue, {datetime}),
        }),
        (0, o.jsxs)(ot, {
          children: [
            (0, o.jsx)('span', {
              className: 'font-medium',
              children: (0, J.default)(datetime).format('YYYY-MM-DD HH:mm:ss'),
            }),
            (0, o.jsx)('span', {className: 'text-muted-foreground', children: (0, J.default)(datetime).format('Z')}),
          ],
        }),
      ],
    }),
  useChatListItem = () => {
    const item = (0, I.use)(ChatListItemContext);
    if (!item) throw new Error('useChatListItem must be used within a ChatListItemContext');
    return item;
  }; /** What the row says instead of its preview. */
function statusDetail(session) {
  switch (session.status) {
    case 'errored': {
      const error = Xe(session);
      return error ? Ie(error).title : 'Task failed';
    }
    case 'suspended':
      return session.suspension?.kind === 'action-confirmation'
        ? session.suspension.request.message
        : session.suspension?.kind === 'ask-user-question'
          ? session.suspension.request.questions?.at(0)?.question
          : 'Waiting for your approval';
    case 'idle':
    case 'running':
    case 'aborted':
    case 'interrupted':
      return null;
    default:
      return session.status;
  }
} /** The status the row's styles read. */
function statusSlot(session) {
  if (session.status === 'suspended') return 'waiting';
  if (session.status === 'aborted' || session.status === 'errored') return 'error';
  if (session.status === 'running') return 'running';
}
var isAwaitingApproval = session => session.status === 'suspended' && session.suspension?.kind === 'approval',
  isAwaitingReview = session => session.status === 'suspended' && session.suspension?.kind === 'action-confirmation',
  isAwaitingAnswer = session =>
    session.status === 'suspended' && session.suspension?.kind === 'ask-user-question' /** The green Awaiting badge. */,
  AwaitingBadge = ({className, children, ...props}) =>
    (0, o.jsx)(N, {
      variant: 'ghost',
      className: _('bg-success/10 shrink-0 text-xs font-medium text-emerald-700! dark:text-emerald-300!', className),
      ...props,
      children,
    }),
  ys = (text, length) => (text.length <= length ? text : text.slice(0, length) + '...'),
  Ms = bytes =>
    bytes >= 1073741824
      ? `${(bytes / 1073741824).toFixed(1)} GB`
      : bytes >= 1048576
        ? `${(bytes / 1048576).toFixed(1)} MB`
        : bytes >= 1024
          ? `${Math.round(bytes / 1024)} KB`
          : `${bytes} B`;
