/* Aux-owned source: a Project's page (assets/_projectId-DW8jDyV7.js, the module body): the composer for new
 * tasks in the Project; its files and working directory, with files added from disk; AGENTS.md, shown as
 * Markdown and edited in a dialog; tabs for its chats, routines and Personalize; the name and icon, saved on
 * blur (Escape reverts); the breadcrumb with a switcher to other Projects; and the archived notice.
 * Names the rest of the chunk uses keep their chunk names: br the page (exported).
 * Chunk names used: ne/oe React, ie JSX runtime, b createFileRoute, A useNavigate, We/De the session providers and
 * the composer parts, is the file preview URL's base, h useTRPC, C useQueryClient, N useMutation, E useSuspenseQuery,
 * P useQuery, Ie/Ce/we/ke/Se useForm, resolver, defaults, useWatch and provider, W the Project schema, f toast,
 * x Button, z Spinner, v useApp, pe/he/le/fe/xe/ms/ps/ds/ls/us/xs/G/L dialog parts, ye the folder picker, j Skeleton,
 * Ve Markdown, fs its code plugin, ys/ws the editor, ts/js its extensions, D/O the path, M/$/q tooltip, hs the OS file
 * manager, J/V/U/K/H Empty, gs a file tile, os/ns/k/S Tabs, T Link, cs dayjs, Ge a routine's schedule, je icon picker,
 * R cn, B the route, es sidebar state, vs title, as toggle, ve Project settings, be/ge/Pe/me/ce the menu, Ne ProjectIcon. */
var React = ne(oe(), 1),
  jsxRuntime = ie(),
  composerRoute = b('/_web/(profile)/u/$userId/projects/$projectId/'),
  /** The composer for a new task in the Project. */
  ProjectComposer = () => {
    const {projectId, userId} = composerRoute.useParams(),
      navigate = A(),
      openSession = sessionId => {
        sessionId && navigate({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId}});
      };
    return (0, jsxRuntime.jsx)(We, {
      projectId,
      onSessionChange: openSession,
      children: (0, jsxRuntime.jsx)(De, {
        source: 'tasks-page',
        defaultDraftState: {draftProjectId: projectId},
        defaultDraftStateKey: `project:${projectId}`,
        projectIdLocked: true,
        onSessionChange: openSession,
        children: (0, jsxRuntime.jsx)('div', {
          className: 'w-full **:data-[agent-session-ui="chat"]:max-w-none',
          children: (0, jsxRuntime.jsxs)(_e, {
            className: 'max-w-none p-0',
            children: [
              (0, jsxRuntime.jsxs)(qe, {
                className: 'p-1',
                children: [
                  (0, jsxRuntime.jsx)(Ee, {placeholder: 'Ask AI a task, @ for context'}),
                  (0, jsxRuntime.jsxs)(Oe, {
                    className: 'p-1',
                    children: [
                      (0, jsxRuntime.jsxs)(_, {
                        children: [
                          (0, jsxRuntime.jsx)(Me, {}),
                          (0, jsxRuntime.jsx)($e, {}),
                          (0, jsxRuntime.jsx)(Fe, {}),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)(_, {
                        children: [
                          (0, jsxRuntime.jsx)(Te, {children: (0, jsxRuntime.jsx)(Re, {})}),
                          (0, jsxRuntime.jsx)(ze, {}),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)(Ae, {}),
            ],
          }),
        }),
      }),
    });
  };
/** A file's preview URL. */
function filePreviewUrl(projectId, path, kind, base) {
  const url = is(`/project/${encodeURIComponent(projectId)}/file-preview`, base);
  return (url.searchParams.set('path', path), url.searchParams.set('kind', kind), url.toString());
}
var /** The working directory form. */
  WorkingDirectoryForm = ({accountId, project, onClose}) => {
    const trpc = h(),
      queryClient = C(),
      updateProject = N(trpc.projects.update.mutationOptions()),
      form = Ie({mode: 'onSubmit', reValidateMode: 'onChange', resolver: Ce(W), defaultValues: we(project)}),
      workspacePath = ke({control: form.control, name: 'workspacePath'}),
      save = async values => {
        try {
          (await updateProject.mutateAsync({accountId, projectId: project.id, workspacePath: values.workspacePath}),
            await Promise.all([
              queryClient.invalidateQueries(trpc.projects.list.queryFilter({accountId})),
              queryClient.invalidateQueries(trpc.projects.get.queryFilter({accountId, projectId: project.id})),
              queryClient.invalidateQueries(trpc.projects.listFiles.queryFilter({accountId, projectId: project.id})),
              queryClient.invalidateQueries(
                trpc.projects.readFile.queryFilter({accountId, projectId: project.id, fileName: 'AGENTS.md'}),
              ),
            ]),
            onClose());
        } catch (error) {
          f.error(error instanceof Error ? error.message : 'Failed to update the working directory.');
        }
      };
    return (0, jsxRuntime.jsx)(Se, {
      ...form,
      children: (0, jsxRuntime.jsxs)('form', {
        onSubmit: form.handleSubmit(save),
        children: [
          (0, jsxRuntime.jsxs)(pe, {
            children: [
              (0, jsxRuntime.jsx)(he, {children: 'Working directory'}),
              (0, jsxRuntime.jsx)(le, {children: 'Choose the default folder used for new work in this Project.'}),
            ],
          }),
          (0, jsxRuntime.jsx)(fe, {
            className: 'py-5',
            children: (0, jsxRuntime.jsx)(ye, {accountId, draftProjectId: project.id, project}),
          }),
          (0, jsxRuntime.jsxs)(xe, {
            children: [
              (0, jsxRuntime.jsx)(x, {
                type: 'button',
                variant: 'secondary',
                disabled: updateProject.isPending,
                onClick: onClose,
                children: 'Cancel',
              }),
              (0, jsxRuntime.jsxs)(x, {
                type: 'submit',
                disabled: updateProject.isPending || !workspacePath.trim(),
                children: [updateProject.isPending && (0, jsxRuntime.jsx)(z, {}), 'Save'],
              }),
            ],
          }),
        ],
      }),
    });
  },
  instructionsRoute = b('/_web/(profile)/u/$userId/projects/$projectId/'),
  /** The AGENTS.md section. */
  InstructionsSection = () => {
    const {accountId} = v(),
      {projectId} = instructionsRoute.useParams(),
      [isEditing, setIsEditing] = (0, React.useState)(false),
      trpc = h(),
      {data: project} = E(trpc.projects.get.queryOptions({accountId, projectId})),
      file = P(trpc.projects.readFile.queryOptions({accountId, projectId, fileName: 'AGENTS.md'})),
      canEdit = !project.archivedAt,
      content = file.data?.content.trim() ?? '',
      edit = () => {
        setIsEditing(true);
      },
      close = () => {
        setIsEditing(false);
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)('section', {
          className: 'border-border rounded-xl border',
          children: [
            (0, jsxRuntime.jsxs)('header', {
              className: 'flex min-w-0 items-center gap-3 p-3',
              children: [
                (0, jsxRuntime.jsx)('h2', {className: 'min-w-0 flex-1 text-sm font-medium', children: 'Instruction'}),
                canEdit &&
                  (0, jsxRuntime.jsx)(x, {
                    size: 'icon-sm',
                    variant: 'ghost',
                    className: 'text-muted-foreground shrink-0',
                    'aria-label': 'Edit AGENTS.md',
                    disabled: file.isPending,
                    onClick: edit,
                    children: (0, jsxRuntime.jsx)(Ze, {}),
                  }),
              ],
            }),
            (0, jsxRuntime.jsx)('div', {
              className: 'max-h-80 min-h-24 overflow-y-auto px-3 pb-4',
              children: (0, jsxRuntime.jsx)(InstructionsContent, {
                content,
                isError: file.isError,
                isPending: file.isPending,
                rawContent: file.data?.content ?? '',
              }),
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(xs, {
          open: isEditing,
          onOpenChange: setIsEditing,
          children: (0, jsxRuntime.jsx)(us, {
            className: 'flex h-[min(46rem,calc(100vh-2rem))] overflow-hidden sm:max-w-3xl',
            children:
              isEditing &&
              (0, jsxRuntime.jsx)(InstructionsEditor, {
                accountId,
                initialContent: file.data?.content ?? '',
                projectId,
                onClose: close,
              }),
          }),
        }),
      ],
    });
  },
  /** AGENTS.md, or why it is not there. */
  InstructionsContent = ({content, isError, isPending, rawContent}) =>
    isPending
      ? (0, jsxRuntime.jsxs)('div', {
          className: 'space-y-2 py-1',
          children: [
            (0, jsxRuntime.jsx)(j, {className: 'h-4 w-2/5'}),
            (0, jsxRuntime.jsx)(j, {className: 'h-3 w-full'}),
            (0, jsxRuntime.jsx)(j, {className: 'h-3 w-4/5'}),
          ],
        })
      : isError
        ? (0, jsxRuntime.jsx)('p', {
            role: 'alert',
            className: 'text-destructive py-8 text-center text-sm',
            children: 'Couldn’t load Project instruction.',
          })
        : content
          ? (0, jsxRuntime.jsx)(Ve, {
              className:
                'text-primary text-sm leading-6 [&_code]:text-xs [&_h1]:text-lg [&_h1]:leading-7 [&_h2]:text-base [&_h2]:leading-6 [&_h3]:text-sm [&_h3]:leading-6 [&_li]:my-0.5 [&_pre]:text-xs',
              plugins: {code: fs},
              children: rawContent,
            })
          : (0, jsxRuntime.jsx)('p', {
              className: 'text-muted-foreground text-sm leading-6',
              children:
                'Write hard rules and workflow preferences for this Project. Aux loads them into every task’s system prompt.',
            }),
  /** The AGENTS.md editor. */
  InstructionsEditor = ({accountId, initialContent, projectId, onClose}) => {
    const [content, setContent] = (0, React.useState)(initialContent),
      trpc = h(),
      queryClient = C(),
      writeFile = N(trpc.projects.writeFile.mutationOptions()),
      editor = ys({
        autofocus: true,
        contentType: 'markdown',
        content: initialContent,
        extensions: event => [...event, ts, js.configure({placeholder: 'e.g. This project is for research on...'})],
        editorProps: {attributes: {class: 'min-h-full cursor-text text-sm leading-7 outline-none'}},
        onUpdate: ({editor: event}) => {
          setContent(event.getMarkdown());
        },
      }),
      focusEditor = event => {
        editor &&
          event.target instanceof Element &&
          (event.target.closest('.ProseMirror') || (event.preventDefault(), editor.chain().focus('end').run()));
      },
      save = async () => {
        try {
          (await writeFile.mutateAsync({accountId, projectId, fileName: 'AGENTS.md', content}),
            await queryClient.invalidateQueries(
              trpc.projects.readFile.queryFilter({accountId, projectId, fileName: 'AGENTS.md'}),
            ),
            onClose());
        } catch (event) {
          (f.error(event instanceof Error ? event.message : 'There was an error saving AGENTS.md.'),
            console.error(event));
        }
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex min-h-0 w-full flex-col gap-4',
      children: [
        (0, jsxRuntime.jsxs)(ms, {
          className: 'shrink-0',
          children: [
            (0, jsxRuntime.jsx)(ps, {children: 'AGENTS.md'}),
            (0, jsxRuntime.jsxs)(ds, {
              children: [
                'Write hard rules and workflow preferences for this Project. ',
                (0, jsxRuntime.jsx)('br', {}),
                'Aux loads them into every task’s system prompt.',
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'min-h-0 flex-1 cursor-text overflow-y-auto',
          onMouseDown: focusEditor,
          children: (0, jsxRuntime.jsx)(ws, {className: 'min-h-full [&_.ProseMirror]:min-h-full', editor}),
        }),
        (0, jsxRuntime.jsxs)(ls, {
          children: [
            (0, jsxRuntime.jsx)(x, {
              type: 'button',
              variant: 'secondary',
              disabled: writeFile.isPending,
              onClick: onClose,
              children: 'Cancel',
            }),
            (0, jsxRuntime.jsxs)(x, {
              type: 'button',
              disabled: writeFile.isPending,
              onClick: save,
              children: [
                writeFile.isPending && (0, jsxRuntime.jsx)(z, {}),
                (0, jsxRuntime.jsx)('span', {children: 'Save'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  filesRoute = b('/_web/(profile)/u/$userId/projects/$projectId/'),
  /** The Personalize tab. */
  PersonalizeTab = () =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'space-y-3',
      children: [(0, jsxRuntime.jsx)(FilesSection, {}), (0, jsxRuntime.jsx)(InstructionsSection, {})],
    }),
  /** The Files section. */
  FilesSection = () => {
    const {accountId} = v(),
      {projectId} = filesRoute.useParams(),
      fileInputRef = (0, React.useRef)(null),
      [isChangingDirectory, setIsChangingDirectory] = (0, React.useState)(false),
      fileManager = hs(),
      trpc = h(),
      queryClient = C(),
      {data: project} = E(trpc.projects.get.queryOptions({accountId, projectId})),
      openFolder = N(trpc.meta.open.mutationOptions()),
      importFiles = N(trpc.projects.importFiles.mutationOptions()),
      files = P(trpc.projects.listFiles.queryOptions({accountId, projectId})),
      canEdit = !project.archivedAt,
      sourceFiles = (files.data ?? []).filter(event => event !== 'AGENTS.md'),
      handleOpenFolder = async () => {
        try {
          await openFolder.mutateAsync({path: project.workspacePath, mode: 'open', accountId});
        } catch (event) {
          (f.error(`There was an error opening the workspace in ${fileManager.name}.`), console.error(event));
        }
      },
      chooseFiles = () => {
        fileInputRef.current?.click();
      },
      addFiles = async event => {
        const picked = Array.from(event.target.files ?? []);
        if (((event.target.value = ''), picked.length !== 0))
          try {
            const uploads = await Promise.all(picked.map(readUpload)),
              result = await importFiles.mutateAsync({accountId, projectId, files: uploads});
            (await queryClient.invalidateQueries(trpc.projects.listFiles.queryFilter({accountId, projectId})),
              f.success(
                result.imported.length === 1
                  ? `Added ${result.imported[0]}.`
                  : `Added ${result.imported.length} files.`,
              ));
          } catch (uploads) {
            (f.error(uploads instanceof Error ? uploads.message : 'There was an error adding files.'),
              console.error(uploads));
          }
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)('section', {
          className: 'border-border rounded-xl border',
          children: [
            (0, jsxRuntime.jsxs)('header', {
              className: 'flex min-w-0 items-center gap-3 p-3',
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'flex min-w-0 flex-1 items-center gap-2',
                  children: [
                    (0, jsxRuntime.jsx)('h2', {className: 'shrink-0 text-sm font-medium', children: 'Files'}),
                    canEdit
                      ? (0, jsxRuntime.jsxs)(x, {
                          size: 'xs',
                          variant: 'ghost',
                          className: 'text-muted-foreground min-w-0 font-normal',
                          'aria-label': 'Change working directory',
                          onClick: () => setIsChangingDirectory(true),
                          children: [
                            (0, jsxRuntime.jsx)('span', {className: 'shrink-0', children: 'Working directory'}),
                            (0, jsxRuntime.jsx)(D, {
                              className: 'min-w-0 font-mono text-xs',
                              children: O(project.workspacePath),
                            }),
                          ],
                        })
                      : (0, jsxRuntime.jsxs)('div', {
                          className: 'text-muted-foreground flex min-w-0 items-baseline gap-2 text-xs',
                          children: [
                            (0, jsxRuntime.jsx)('span', {className: 'shrink-0', children: 'Working directory'}),
                            (0, jsxRuntime.jsx)(D, {
                              className: 'min-w-0 font-mono',
                              children: O(project.workspacePath),
                            }),
                          ],
                        }),
                  ],
                }),
                canEdit &&
                  (0, jsxRuntime.jsxs)('div', {
                    className: 'flex shrink-0 items-center gap-0.5',
                    children: [
                      (0, jsxRuntime.jsx)('input', {
                        className: 'hidden',
                        multiple: true,
                        onChange: addFiles,
                        ref: fileInputRef,
                        tabIndex: -1,
                        type: 'file',
                      }),
                      (0, jsxRuntime.jsxs)($, {
                        children: [
                          (0, jsxRuntime.jsx)(M, {
                            render: (0, jsxRuntime.jsx)(x, {
                              size: 'icon-sm',
                              variant: 'ghost',
                              className: 'text-muted-foreground',
                              'aria-label': 'Open Project Folder',
                              disabled: openFolder.isPending,
                              onClick: handleOpenFolder,
                              children: (0, jsxRuntime.jsx)(rs, {}),
                            }),
                          }),
                          (0, jsxRuntime.jsx)(q, {children: 'Open Project Folder'}),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)($, {
                        children: [
                          (0, jsxRuntime.jsx)(M, {
                            render: (0, jsxRuntime.jsx)(x, {
                              size: 'icon-sm',
                              variant: 'ghost',
                              className: 'text-muted-foreground',
                              'aria-label': 'Add a file to project',
                              disabled: importFiles.isPending,
                              onClick: chooseFiles,
                              children: (0, jsxRuntime.jsx)(ue, {}),
                            }),
                          }),
                          (0, jsxRuntime.jsx)(q, {children: 'Add a file to project'}),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
            (0, jsxRuntime.jsx)('div', {
              className: 'px-3 pb-4',
              children: (0, jsxRuntime.jsx)(FilesGrid, {
                accountId,
                isError: files.isError,
                isPending: files.isPending,
                projectId,
                sourceFiles,
              }),
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(G, {
          open: isChangingDirectory,
          onOpenChange: setIsChangingDirectory,
          children: (0, jsxRuntime.jsx)(L, {
            className: 'w-lg max-w-[calc(100%-(--spacing(8)))]!',
            children:
              isChangingDirectory &&
              (0, jsxRuntime.jsx)(WorkingDirectoryForm, {
                accountId,
                project,
                onClose: () => setIsChangingDirectory(false),
              }),
          }),
        }),
      ],
    });
  },
  /** The file tiles. */
  FilesGrid = ({accountId, isError, isPending, projectId, sourceFiles}) =>
    isPending
      ? (0, jsxRuntime.jsx)('div', {
          className: 'flex flex-wrap gap-x-2 gap-y-3 py-1',
          children: Array.from({length: 6}, (path, index) =>
            (0, jsxRuntime.jsxs)(
              'div',
              {
                className: 'flex w-20 flex-col items-center gap-2',
                children: [
                  (0, jsxRuntime.jsx)(j, {className: 'size-[72px] rounded-lg'}),
                  (0, jsxRuntime.jsx)(j, {className: 'h-3 w-14'}),
                ],
              },
              index,
            ),
          ),
        })
      : isError
        ? (0, jsxRuntime.jsx)('p', {
            role: 'alert',
            className: 'text-destructive py-8 text-center text-sm',
            children: 'Couldn’t load Project files.',
          })
        : sourceFiles.length === 0
          ? (0, jsxRuntime.jsx)(J, {
              className: 'min-h-40 border-0',
              children: (0, jsxRuntime.jsxs)(V, {
                children: [
                  (0, jsxRuntime.jsx)(U, {variant: 'icon', children: (0, jsxRuntime.jsx)(ss, {})}),
                  (0, jsxRuntime.jsx)(K, {children: 'No files yet'}),
                  (0, jsxRuntime.jsx)(H, {children: 'Files in this Project’s workspace will appear here.'}),
                ],
              }),
            })
          : (0, jsxRuntime.jsx)('div', {
              className: 'flex flex-wrap gap-x-2 gap-y-3 py-1',
              children: sourceFiles.map(path =>
                (0, jsxRuntime.jsx)(gs, {path, previewUrl: filePreviewUrl(projectId, path, 'icon', accountId)}, path),
              ),
            }),
  /** A file as a name and base64. */
  readUpload = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      ((reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))),
        (reader.onload = () => {
          if (typeof reader.result != 'string') {
            reject(new Error('Failed to read file'));
            return;
          }
          const [, data = ''] = reader.result.split(',', 2);
          resolve({name: file.name, data});
        }),
        reader.readAsDataURL(file));
    }),
  tabsRoute = b('/_web/(profile)/u/$userId/projects/$projectId/'),
  /** The Project's tabs. */
  ProjectTabs = () => {
    const [tab, setTab] = (0, React.useState)('chats'),
      handleChange = value => {
        (value === 'chats' || value === 'routines' || value === 'sources') && setTab(value);
      };
    return (0, jsxRuntime.jsxs)(os, {
      className: 'gap-4',
      value: tab,
      onValueChange: handleChange,
      children: [
        (0, jsxRuntime.jsxs)(ns, {
          variant: 'rounded',
          children: [
            (0, jsxRuntime.jsx)(k, {value: 'chats', children: 'Chats'}),
            (0, jsxRuntime.jsx)(k, {value: 'routines', children: 'Routines'}),
            (0, jsxRuntime.jsx)(k, {value: 'sources', children: 'Personalize'}),
          ],
        }),
        (0, jsxRuntime.jsx)(S, {value: 'chats', children: tab === 'chats' && (0, jsxRuntime.jsx)(ChatsTab, {})}),
        (0, jsxRuntime.jsx)(S, {
          value: 'routines',
          children: tab === 'routines' && (0, jsxRuntime.jsx)(RoutinesTab, {}),
        }),
        (0, jsxRuntime.jsx)(S, {
          value: 'sources',
          children: tab === 'sources' && (0, jsxRuntime.jsx)(PersonalizeTab, {}),
        }),
      ],
    });
  },
  /** The chats. */
  ChatsTab = () => {
    const {accountId} = v(),
      {projectId, userId} = tabsRoute.useParams(),
      trpc = h(),
      sessions = P(
        trpc.sessions.listPreviewItems.queryOptions({
          accountId,
          projectId,
          limit: 200,
          order: 'desc',
          routines: 'exclude',
        }),
      );
    return sessions.isPending
      ? (0, jsxRuntime.jsx)(ListSkeleton, {})
      : sessions.isError
        ? (0, jsxRuntime.jsx)(ListError, {label: 'chats'})
        : sessions.data.length
          ? (0, jsxRuntime.jsx)('div', {
              className: 'px-1',
              children: sessions.data.map((session, index) =>
                (0, jsxRuntime.jsxs)(
                  React.Fragment,
                  {
                    children: [
                      (0, jsxRuntime.jsx)(Xe, {
                        session,
                        className: 'hover:bg-secondary/60 -mx-1 rounded-none rounded-xl px-0 py-3',
                        render: (0, jsxRuntime.jsx)(T, {
                          to: '/u/$userId/tasks/$sessionId',
                          params: {userId, sessionId: session.id},
                        }),
                        children: (0, jsxRuntime.jsxs)(Ye, {
                          orientation: 'vertical',
                          className: 'gap-0!',
                          children: [
                            (0, jsxRuntime.jsxs)('div', {
                              className: 'flex w-full min-w-0 items-baseline gap-3',
                              children: [
                                (0, jsxRuntime.jsx)(He, {className: 'min-w-0 grow', children: session.title}),
                                (0, jsxRuntime.jsx)('span', {
                                  className: 'text-muted-foreground shrink-0 text-xs',
                                  children: (0, cs.default)(session.updatedAt).format('LL'),
                                }),
                              ],
                            }),
                            (0, jsxRuntime.jsx)(Je, {
                              className: 'text-muted-foreground w-full text-xs',
                              children: session.previewText,
                            }),
                          ],
                        }),
                      }),
                      index !== sessions.data.length - 1 && (0, jsxRuntime.jsx)(Q, {}),
                    ],
                  },
                  session.id,
                ),
              ),
            })
          : (0, jsxRuntime.jsx)(ListEmpty, {
              icon: (0, jsxRuntime.jsx)(Ue, {}),
              title: 'No chats yet',
              description: 'Start with the composer above. New chats stay connected to this Project.',
            });
  },
  /** The routines. */
  RoutinesTab = () => {
    const {accountId} = v(),
      {projectId, userId} = tabsRoute.useParams(),
      trpc = h(),
      routines = P(trpc.routines.list.queryOptions({accountId, projectId, type: 'standalone'}));
    return routines.isPending
      ? (0, jsxRuntime.jsx)(ListSkeleton, {})
      : routines.isError
        ? (0, jsxRuntime.jsx)(ListError, {label: 'routines'})
        : routines.data.length
          ? (0, jsxRuntime.jsx)('div', {
              className: 'px-1',
              children: routines.data.map((routine, index) =>
                (0, jsxRuntime.jsxs)(
                  React.Fragment,
                  {
                    children: [
                      (0, jsxRuntime.jsxs)(T, {
                        to: '/u/$userId/settings/routines/$routineId',
                        params: {userId, routineId: routine.id},
                        className:
                          'hover:bg-secondary/60 focus-visible:bg-secondary focus-visible:ring-foreground/60 -mx-1 flex min-w-0 items-baseline gap-3 rounded-xl px-3 py-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                        children: [
                          (0, jsxRuntime.jsxs)('span', {
                            className: 'min-w-0 grow',
                            children: [
                              (0, jsxRuntime.jsx)('span', {
                                className: 'block truncate text-sm font-medium',
                                children: routine.name,
                              }),
                              (0, jsxRuntime.jsx)('span', {
                                className: 'text-muted-foreground mt-1 block truncate text-sm',
                                children: Ge(routine),
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-muted-foreground shrink-0 text-sm',
                            children: routine.pausedAt ? 'Paused' : 'Active',
                          }),
                        ],
                      }),
                      index !== routines.data.length - 1 && (0, jsxRuntime.jsx)(Q, {}),
                    ],
                  },
                  routine.id,
                ),
              ),
            })
          : (0, jsxRuntime.jsx)(ListEmpty, {
              icon: (0, jsxRuntime.jsx)(Le, {}),
              title: 'No routines yet',
              description: 'Create a routine to automate recurring work in this Project.',
            });
  },
  /** Rows while loading. */
  ListSkeleton = () =>
    (0, jsxRuntime.jsx)('div', {
      children: Array.from({length: 3}, (item, index) =>
        (0, jsxRuntime.jsxs)(
          'div',
          {
            className: 'not-last:border-b-hairline space-y-1.5 px-3 py-4',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'flex items-center justify-between gap-3',
                children: [
                  (0, jsxRuntime.jsx)(j, {className: 'h-4 w-2/5'}),
                  (0, jsxRuntime.jsx)(j, {className: 'h-3 w-24'}),
                ],
              }),
              (0, jsxRuntime.jsx)(j, {className: 'h-3 w-4/5'}),
            ],
          },
          index,
        ),
      ),
    }),
  /** A list that did not load. */
  ListError = ({label}) =>
    (0, jsxRuntime.jsxs)('p', {
      role: 'alert',
      className: 'text-destructive py-12 text-center text-sm',
      children: ['Couldn’t load Project ', label, '.'],
    }),
  /** An empty list. */
  ListEmpty = ({description, icon, title}) =>
    (0, jsxRuntime.jsx)(J, {
      className: 'min-h-64 border-0',
      children: (0, jsxRuntime.jsxs)(V, {
        children: [
          (0, jsxRuntime.jsx)(U, {variant: 'icon', children: icon}),
          (0, jsxRuntime.jsx)(K, {children: title}),
          (0, jsxRuntime.jsx)(H, {children: description}),
        ],
      }),
    }),
  /** The icon and name, saved as they change. */
  ProjectIdentity = ({project}) => {
    const {accountId} = v(),
      trpc = h(),
      queryClient = C(),
      updateProject = N(trpc.projects.update.mutationOptions()),
      persist = async (changes, options) => {
        try {
          return (
            await updateProject.mutateAsync({accountId, projectId: project.id, ...changes}),
            await Promise.all([
              queryClient.invalidateQueries(trpc.projects.list.queryFilter({accountId})),
              queryClient.invalidateQueries(trpc.projects.get.queryFilter({accountId, projectId: project.id})),
            ]),
            options?.successToast && f.success(options.successToast),
            true
          );
        } catch (error) {
          return (f.error(error instanceof Error ? error.message : 'Failed to update Project.'), false);
        }
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(ProjectIconPicker, {project, onPersist: persist}),
        (0, jsxRuntime.jsx)(ProjectNameInput, {project, onPersist: persist}),
      ],
    });
  },
  /** The icon picker. */
  ProjectIconPicker = ({project, onPersist}) => {
    const setColor = value => {
        onPersist({color: value});
      },
      setIcon = value => {
        onPersist({icon: value});
      };
    return (0, jsxRuntime.jsx)(je, {
      color: project.color,
      icon: project.icon,
      iconClassName: 'size-8',
      label: 'Choose Project icon and color',
      size: 'icon-lg',
      variant: 'ghost',
      onColorChange: setColor,
      onIconChange: setIcon,
    });
  },
  /** The name, saved on blur. */
  ProjectNameInput = ({project, onPersist}) => {
    const [name, setName] = (0, React.useState)(project.name),
      skipBlur = (0, React.useRef)(false);
    (0, React.useEffect)(() => {
      setName(project.name);
    }, [project.name]);
    const handleChange = event => {
        setName(event.target.value);
      },
      handleBlur = () => {
        if (skipBlur.current) {
          skipBlur.current = false;
          return;
        }
        save(name);
      },
      handleKeyDown = event => {
        if (!event.nativeEvent.isComposing) {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
            return;
          }
          event.key === 'Escape' && ((skipBlur.current = true), setName(project.name), event.currentTarget.blur());
        }
      },
      save = async event => {
        const parsed = W.shape.name.safeParse(event);
        if (!parsed.success) {
          (f.error(parsed.error.issues[0]?.message ?? 'Invalid Project name.'), setName(project.name));
          return;
        }
        if (parsed.data === project.name) {
          setName(project.name);
          return;
        }
        (await onPersist({name: parsed.data}, {successToast: 'Updated'})) || setName(project.name);
      };
    return (0, jsxRuntime.jsx)('input', {
      'aria-label': 'Project name',
      className: 'font-display text-box-trim min-w-0 grow bg-transparent text-3xl font-medium outline-none',
      maxLength: 80,
      value: name,
      onBlur: handleBlur,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
    });
  };
/** A Project's page. */
function br() {
  const {projectId, userId} = B.useParams(),
    {accountId} = v(),
    navigate = A(),
    isSidebarCollapsed = es(),
    trpc = h(),
    {data: project} = E(trpc.projects.get.queryOptions({accountId, projectId})),
    [settingsOpen, setSettingsOpen] = (0, React.useState)(false),
    openSettings = () => setSettingsOpen(true),
    closeSettings = () => setSettingsOpen(false),
    leaveArchived = () => {
      navigate({to: '/u/$userId/projects', params: {userId}, replace: true});
    };
  return (0, jsxRuntime.jsxs)('div', {
    className: 'grid size-full min-h-0 grid-rows-[auto_minmax(0,1fr)]',
    children: [
      (0, jsxRuntime.jsx)(vs, {segments: ['Projects', project.name]}),
      (0, jsxRuntime.jsxs)('header', {
        className: R('flex h-11 min-w-0 shrink-0 items-center gap-2 pr-3', isSidebarCollapsed ? 'pl-1.5' : 'pl-4'),
        children: [
          isSidebarCollapsed && (0, jsxRuntime.jsx)(as, {className: 'shrink-0 max-lg:aria-pressed:hidden'}),
          (0, jsxRuntime.jsxs)('nav', {
            'aria-label': 'Breadcrumb',
            className: 'flex min-w-0 items-center gap-1.5 text-sm',
            children: [
              (0, jsxRuntime.jsx)(T, {
                to: '/u/$userId/projects',
                params: {userId},
                className: 'text-muted-foreground hover:text-foreground shrink-0 font-medium',
                children: 'Projects',
              }),
              (0, jsxRuntime.jsx)(de, {className: 'text-muted-foreground size-3.5 shrink-0'}),
              (0, jsxRuntime.jsx)(ProjectSwitcher, {project}),
            ],
          }),
          !project.archivedAt &&
            (0, jsxRuntime.jsx)(x, {
              size: 'icon',
              variant: 'ghost',
              className: 'ml-auto shrink-0',
              'aria-label': 'Project settings',
              onClick: openSettings,
              children: (0, jsxRuntime.jsx)(Ke, {}),
            }),
        ],
      }),
      (0, jsxRuntime.jsx)('main', {
        className: 'min-h-0 overflow-y-auto px-8 pt-16 pb-40',
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'mx-auto w-full max-w-2xl space-y-8',
          children: [
            (0, jsxRuntime.jsx)('header', {
              className: 'flex min-w-0 items-center gap-2',
              children: (0, jsxRuntime.jsx)(ProjectIdentity, {project}),
            }),
            project.archivedAt &&
              (0, jsxRuntime.jsxs)('div', {
                className: 'bg-secondary/40 rounded-xl px-4 py-3 text-sm',
                children: [
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-primary font-medium',
                    children: 'This Project is archived.',
                  }),
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-muted-foreground',
                    children: 'Its tasks and routines remain available, but new work is disabled.',
                  }),
                ],
              }),
            !project.archivedAt && (0, jsxRuntime.jsx)(ProjectComposer, {}),
            (0, jsxRuntime.jsx)(ProjectTabs, {}),
          ],
        }),
      }),
      (0, jsxRuntime.jsx)(G, {
        open: settingsOpen,
        onOpenChange: setSettingsOpen,
        children: (0, jsxRuntime.jsx)(L, {
          className: 'w-lg max-w-[calc(100%-(--spacing(8)))]!',
          children:
            settingsOpen &&
            (0, jsxRuntime.jsx)(ve, {accountId, project, onClose: closeSettings, onArchived: leaveArchived}),
        }),
      }),
    ],
  });
}
var /** The breadcrumb menu of Projects. */
  ProjectSwitcher = ({project}) => {
    const {userId} = B.useParams(),
      {accountId} = v(),
      navigate = A(),
      trpc = h(),
      [open, setOpen] = (0, React.useState)(false),
      projects = (P({...trpc.projects.list.queryOptions({accountId}), enabled: open}).data ?? []).filter(
        other => !other.archivedAt,
      ),
      select = other => () => {
        other !== project.id && navigate({to: '/u/$userId/projects/$projectId', params: {userId, projectId: other}});
      };
    return (0, jsxRuntime.jsxs)(be, {
      open,
      onOpenChange: setOpen,
      children: [
        (0, jsxRuntime.jsxs)(ge, {
          render: (0, jsxRuntime.jsx)(x, {
            variant: 'ghost',
            size: 'sm',
            className: 'text-foreground h-auto max-w-60 min-w-0 gap-1 px-1.5 py-0.5 text-sm font-medium',
            'aria-current': 'page',
          }),
          children: [
            (0, jsxRuntime.jsx)('span', {className: 'truncate', children: project.name}),
            (0, jsxRuntime.jsx)(Be, {className: 'text-muted-foreground size-3.5 shrink-0', 'data-icon': 'inline-end'}),
          ],
        }),
        (0, jsxRuntime.jsx)(Pe, {
          align: 'start',
          className: 'max-h-80 w-64 overflow-y-auto',
          children: (0, jsxRuntime.jsx)(me, {
            children: projects.map(other =>
              (0, jsxRuntime.jsx)(
                ProjectSwitcherItem,
                {project: other, selected: other.id === project.id, onSelect: select(other.id)},
                other.id,
              ),
            ),
          }),
        }),
      ],
    });
  },
  /** A Project in that menu. */
  ProjectSwitcherItem = ({project, selected, onSelect}) =>
    (0, jsxRuntime.jsxs)(ce, {
      onClick: onSelect,
      children: [
        (0, jsxRuntime.jsx)(Ne, {className: 'size-4 shrink-0', color: project.color, icon: project.icon}),
        (0, jsxRuntime.jsx)('span', {className: 'min-w-0 grow truncate', children: project.name}),
        (0, jsxRuntime.jsx)(Qe, {className: R('size-4 shrink-0', !selected && 'invisible')}),
      ],
    });
