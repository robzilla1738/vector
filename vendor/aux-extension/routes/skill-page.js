/* Aux-owned source, a skill's page (assets/_skillId-CAwCRjA8.js, from the delete icon to the end of the
 * module; Gt exported as component; the JSX runtime binding before it stays supplied): the header
 * (breadcrumb, the file picker over the skill's file tree, which agents use it, the on switch and the
 * menu: copy a built-in to customize, edit or delete), the edit dialog, and the file preview (markdown
 * with its front matter, or a note that other files open in the system app).
 * Names the rest of the chunk uses keep their chunk names: Gt the page.
 * Chunk names used: e JSX runtime, E/se/P/V/be tRPC, query client, mutation and queries, ke capture, ve
 * confirm, j toast, k/oe/G/et/tt/at/it/de/Ye/ce/st the skill path and markdown helpers, le the
 * platform's reveal labels, _e the file tree, $e markdown, and the settings, select, tooltip,
 * dropdown, popover and avatar parts. */
DeleteIcon = ({size = 24, ariaHidden = true, ...s}) =>
    (0, e.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...s,
      children: (0, e.jsx)('path', {
        d: 'M12 1.5C14.2393 1.50016 16.133 2.97167 16.7705 5H20.5C21.0523 5 21.5 5.44772 21.5 6C21.5 6.55228 21.0523 7 20.5 7H19.9688L19.1904 18.2754C19.0457 20.3725 17.3022 21.9998 15.2002 22H8.7998C6.69772 21.9998 4.95429 20.3725 4.80957 18.2754L4.03125 7H3.5C2.94772 7 2.5 6.55228 2.5 6C2.5 5.44772 2.94772 5 3.5 5H7.23047C7.86793 2.97178 9.76078 1.50016 12 1.5ZM6.80469 18.1377C6.87703 19.1862 7.74886 19.9998 8.7998 20H15.2002C16.2511 19.9998 17.1229 19.1862 17.1953 18.1377L17.9629 7H6.03711L6.80469 18.1377ZM12 3.5C10.8906 3.50013 9.9222 4.10391 9.40332 5H14.5967C14.0776 4.10394 13.1093 3.50013 12 3.5Z',
        fill: 'currentColor',
      }),
    }),
  React = he(pe(), 1),
  UNUSED_SKILL_ROUTE = te('/_web/(settings)/u/$userId/settings/plugins/skills/$skillId/'),
  treeNodes = t => {
    const i = skillTree(t);
    return i.type === 'file' ? [i] : i.children;
  } /** A skill as a tree: SKILL.md first, then folders, then files by name. */,
  skillTree = t => {
    const i = k(t.path);
    if (oe(t.path)) return {children: [], data: t, name: G(t), path: i, trailing: overriddenBadge(t), type: 'file'};
    const s = {
      children: [],
      data: t,
      icon: t.metadata?.icon
        ? (0, e.jsxs)(ne, {
            className: 'size-4! rounded-none',
            children: [
              (0, e.jsx)(re, {src: `${t.metadata.icon}?width=16&height=16`}),
              (0, e.jsx)(ae, {
                className: 'bg-transparent',
                children: (0, e.jsx)(Fe, {className: 'text-muted-foreground size-4'}),
              }),
            ],
          })
        : void 0,
      name: G(t),
      path: i,
      trailing: overriddenBadge(t),
      type: 'directory',
    };
    for (const r of t.files) addFile(s, t, r);
    return (sortTree(s), s);
  },
  overriddenBadge = t => {
    if (t.overriddenBy)
      return (0, e.jsx)(Se, {variant: 'secondary', className: 'h-4 rounded px-1 text-[10px]', children: 'Overridden'});
  },
  addFile = (t, i, s) => {
    const r = et(s);
    let a = t;
    for (let o = 0; o < r.length; o += 1) {
      const c = r[o],
        u = k(i.path, ...r.slice(0, o + 1)),
        n = o === r.length - 1 ? 'file' : 'directory';
      let m = a.children.find(h => h.path === u);
      (m || ((m = {children: [], data: i, name: c, path: u, type: n}), a.children.push(m)), (a = m));
    }
  },
  sortTree = t => {
    t.children.sort(treeOrder);
    for (const i of t.children) sortTree(i);
  },
  treeOrder = (t, i) =>
    t.name === 'SKILL.md'
      ? -1
      : i.name === 'SKILL.md'
        ? 1
        : t.type !== i.type
          ? t.type === 'directory'
            ? -1
            : 1
          : t.name.localeCompare(i.name),
  SkillRoute = te('/_web/(settings)/u/$userId/settings/plugins/skills/$skillId/'),
  SkillFileContext = (0, React.createContext)(null),
  SkillFileProvider = ({accountId, projectId, children, filePath, skill}) => {
    const o = E(),
      c = P(o.meta.open.mutationOptions()),
      u = oe(filePath),
      n = tt(skill, filePath),
      m = G(skill),
      h = (0, React.useCallback)(async () => {
        try {
          await c.mutateAsync({path: n, mode: 'reveal', accountId});
        } catch (g) {
          (j.error(le().revealError), console.error(g));
        }
      }, [accountId, n, c]),
      f = (0, React.useMemo)(
        () => ({accountId, projectId, canPreviewFile: u, filePath, skill, skillName: m, onRevealFile: h}),
        [accountId, projectId, u, filePath, h, skill, m],
      );
    return (0, e.jsx)(SkillFileContext, {value: f, children});
  },
  useSkillFile = () => {
    const t = (0, React.use)(SkillFileContext);
    if (!t) throw new Error('Skill file content components must be rendered inside <SkillFileContentProvider>.');
    return t;
  } /** The header: breadcrumb, file picker, agents, on switch and menu. */,
  SkillHeader = () => {
    const {accountId, projectId, skill, skillName} = useSkillFile(),
      a = SkillRoute.useNavigate(),
      {userId} = SkillRoute.useParams(),
      c = E(),
      u = se(),
      {capture} = ke(),
      {confirm} = ve(),
      [h, f] = (0, React.useState)(false),
      g = (0, React.useCallback)(
        () =>
          Promise.all([
            u.invalidateQueries(c.projects.listSkillsForSettings.queryFilter({projectId, accountId})),
            u.invalidateQueries(c.projects.listSkills.queryFilter({projectId, accountId})),
          ]),
        [accountId, projectId, u, c],
      ),
      v = P(c.projects.setSkillEnabled.mutationOptions({onSuccess: g})),
      y = P(c.projects.setSkillAgents.mutationOptions({onSuccess: g})),
      N = P(c.projects.copySkillForCustomization.mutationOptions()),
      w = P(c.projects.deleteSkill.mutationOptions()),
      I = skill.enabled ? 'Do not use this skill' : 'Use this skill',
      F = skill.metadata?.autoInject?.keywords?.length ?? 0,
      T = skill.metadata?.autoInject?.url?.length ?? 0,
      z = (0, React.useCallback)(
        async l => {
          try {
            await v.mutateAsync({projectId, skillPath: skill.path, enabled: l, accountId});
          } catch (S) {
            (j.error('There was an error updating the skill.'), console.error(S));
          }
        },
        [accountId, projectId, v, skill.path],
      ),
      {data = false} = V(c.settings.getAll.queryOptions({accountId}, {select: l => l.experimental.auxCode})),
      $ = data && skill.group === 'user' && skill.path.startsWith('user/') && !skill.siteSpecific,
      C = skill.metadata?.agents ?? ['aux'],
      b = (0, React.useCallback)(
        async l => {
          if (l.length !== 0)
            try {
              await y.mutateAsync({projectId, skillPath: skill.path, agents: l, accountId});
            } catch (S) {
              (j.error('There was an error updating the skill.'), console.error(S));
            }
        },
        [accountId, projectId, y, skill.path],
      ),
      L = (0, React.useCallback)(async () => {
        try {
          const l = await N.mutateAsync({accountId, projectId, skillPath: skill.path});
          (await g(),
            capture('settings.skills.copy-to-customize', {
              sourceGroup: skill.group,
              siteSpecific: skill.siteSpecific,
              overridesBuiltin: l.overridesBuiltin,
            }),
            await a({
              to: '/u/$userId/settings/plugins/skills/$skillId',
              params: {userId, skillId: de(l.path)},
              search: {file: l.definitionPath},
              resetScroll: false,
            }),
            j.success(`Copied ${l.name} to My skills.`));
        } catch (l) {
          (j.error(l instanceof Error ? l.message : 'There was an error copying the skill.'), console.error(l));
        }
      }, [accountId, projectId, capture, N, g, a, skill.group, skill.path, skill.siteSpecific]),
      B = (0, React.useCallback)(async () => {
        if (
          await confirm({
            title: `Delete ${skillName}?`,
            description: 'This removes the user-owned skill and its files.',
            ui: {variant: 'destructive', action: 'Delete'},
          })
        )
          try {
            (await w.mutateAsync({accountId, projectId, skillPath: skill.path}),
              await g(),
              capture('settings.skills.delete', {
                keywordCount: F,
                urlPatternCount: T,
                siteSpecific: skill.siteSpecific,
                wasEnabled: skill.enabled,
              }),
              await a({
                to: '/u/$userId/settings/plugins/skills',
                params: {userId},
                search: {},
                replace: true,
                resetScroll: false,
              }),
              j.success(`Deleted ${skillName}.`));
          } catch (l) {
            (j.error(l instanceof Error ? l.message : 'There was an error deleting the skill.'), console.error(l));
          }
      }, [
        accountId,
        projectId,
        capture,
        confirm,
        w,
        g,
        F,
        a,
        skill.enabled,
        skill.path,
        skill.siteSpecific,
        skillName,
        T,
      ]),
      {filePath} = useSkillFile(),
      {skillId} = SkillRoute.useParams(),
      x = l => {
        l.type === 'file' &&
          a({
            to: '/u/$userId/settings/plugins/skills/$skillId',
            params: {userId, skillId},
            search: {file: l.path},
            replace: true,
            resetScroll: false,
          });
      },
      R = () => f(true),
      _ = at(filePath),
      p = treeNodes(skill);
    return (0, e.jsxs)('header', {
      className: 'flex h-12 w-full shrink-0 items-center justify-between gap-3 px-3',
      children: [
        (0, e.jsxs)('div', {
          className: 'flex min-w-0 items-center gap-1.5 text-sm',
          children: [
            (0, e.jsx)(ge, {
              to: '/u/$userId/settings/plugins/skills',
              params: {userId},
              className: 'text-muted-foreground hover:text-foreground shrink-0',
              children: 'Plugins & MCPs',
            }),
            (0, e.jsx)(W, {className: 'text-muted-foreground size-4 shrink-0'}),
            (0, e.jsxs)(ne, {
              className: 'border-border border-hairline size-4 rounded-sm',
              children: [
                skill.metadata?.icon && (0, e.jsx)(re, {src: skill.metadata.icon}),
                (0, e.jsx)(ae, {className: 'rounded-sm text-[10px]', children: skillName.slice(0, 1)}),
              ],
            }),
            (0, e.jsx)('span', {className: 'max-w-40 truncate font-medium', children: skillName}),
            (0, e.jsx)(W, {className: 'text-muted-foreground size-4 shrink-0'}),
            (0, e.jsxs)(Ce, {
              children: [
                (0, e.jsxs)(ye, {
                  render: (0, e.jsx)(A, {variant: 'ghost', size: 'sm', className: 'min-w-0 px-2'}),
                  children: [
                    (0, e.jsx)('span', {className: 'truncate', children: _}),
                    (0, e.jsx)(Te, {className: 'size-4 shrink-0'}),
                  ],
                }),
                (0, e.jsx)(Pe, {
                  align: 'start',
                  className: 'flex max-h-80 w-80 flex-col overflow-hidden p-1',
                  children: (0, e.jsx)(_e, {
                    ariaLabel: `${skillName} files`,
                    expandAllByDefault: true,
                    nodes: p,
                    selectedPath: filePath,
                    onSelect: x,
                  }),
                }),
              ],
            }),
          ],
        }),
        (0, e.jsxs)('div', {
          className: 'flex shrink-0 items-center gap-0.5',
          children: [
            $ &&
              (0, e.jsxs)(ze, {
                multiple: true,
                value: C,
                disabled: y.isPending,
                onValueChange: b,
                children: [
                  (0, e.jsx)(Ae, {
                    'aria-label': 'Agents that use this skill',
                    size: 'sm',
                    className: 'mr-1.5',
                    children: (0, e.jsx)(Ee, {}),
                  }),
                  (0, e.jsx)(Me, {
                    alignItemWithTrigger: false,
                    children: AGENTS.map(({value, label}) => (0, e.jsx)(De, {value, children: label}, value)),
                  }),
                ],
              }),
            (0, e.jsxs)(He, {
              children: [
                (0, e.jsx)(qe, {
                  render: (0, e.jsx)('div', {
                    children: (0, e.jsx)(Je, {
                      'aria-label': I,
                      checked: skill.enabled,
                      disabled: v.isPending,
                      onCheckedChange: z,
                    }),
                  }),
                }),
                (0, e.jsx)(Be, {children: I}),
              ],
            }),
            (0, e.jsxs)(Ie, {
              children: [
                (0, e.jsx)(we, {
                  render: ({className, ...S}) =>
                    (0, e.jsx)(A, {size: 'icon-sm', variant: 'ghost', 'aria-label': 'Open skill actions', ...S}),
                  children: (0, e.jsx)(Le, {}),
                }),
                (0, e.jsx)(Ne, {
                  align: 'end',
                  children:
                    skill.creator === 'builtin'
                      ? (0, e.jsxs)(Q, {
                          disabled: N.isPending,
                          onClick: L,
                          children: [(0, e.jsx)(fe, {}), (0, e.jsx)('span', {children: 'Copy to customize'})],
                        })
                      : (0, e.jsxs)(e.Fragment, {
                          children: [
                            (0, e.jsxs)(Q, {
                              onClick: R,
                              children: [(0, e.jsx)(Oe, {}), (0, e.jsx)('span', {children: 'Edit'})],
                            }),
                            (0, e.jsxs)(Q, {
                              variant: 'destructive',
                              disabled: w.isPending,
                              onClick: B,
                              children: [(0, e.jsx)(DeleteIcon, {}), (0, e.jsx)('span', {children: 'Delete'})],
                            }),
                          ],
                        }),
                }),
              ],
            }),
            skill.creator !== 'builtin' && (0, e.jsx)(EditSkillDialog, {open: h, onOpenChange: f}),
          ],
        }),
      ],
    });
  } /** Editing a user skill. */,
  EditSkillDialog = ({open, onOpenChange}) => {
    const {accountId, projectId, skill} = useSkillFile(),
      o = SkillRoute.useNavigate(),
      {userId} = SkillRoute.useParams(),
      u = E(),
      n = se(),
      [m, h] = (0, React.useState)(null),
      [f, g] = (0, React.useState)(skill.name),
      [v, y] = (0, React.useState)(skill.description),
      [N, w] = (0, React.useState)(false),
      [I, F] = (0, React.useState)(
        skill.metadata?.autoInject?.keywords?.join(`
`) ?? '',
      ),
      [T, z] = (0, React.useState)(
        skill.metadata?.autoInject?.url?.join(`
`) ?? '',
      ),
      [D, $] = (0, React.useState)(''),
      C = V(
        u.projects.readSkillFile.queryOptions({projectId, skillPath: skill.definitionPath, accountId}, {enabled: open}),
      ),
      b = P(u.projects.updateSkill.mutationOptions());
    (0, React.useEffect)(() => {
      !open ||
        !C.data ||
        m === skill.definitionPath ||
        (g(skill.name),
        y(skill.description),
        w(false),
        F(
          skill.metadata?.autoInject?.keywords?.join(`
`) ?? '',
        ),
        z(
          skill.metadata?.autoInject?.url?.join(`
`) ?? '',
        ),
        $(ce(C.data.content)),
        h(skill.definitionPath));
    }, [C.data, m, open, skill]);
    const L = x => {
        (!x && b.isPending) || (onOpenChange(x), x || h(null));
      },
      B = () => L(false),
      O = async x => {
        x.preventDefault();
        const R = J(I),
          _ = J(T);
        if (_.some(p => p.includes('://') || /\s/.test(p))) {
          j.error('URL patterns should omit the scheme, e.g. github.com/**.');
          return;
        }
        try {
          const p = await b.mutateAsync({
            accountId,
            projectId,
            skillPath: skill.path,
            name: f,
            description: v,
            body: D,
            enabled: skill.enabled,
            keywords: R,
            urlPatterns: _,
          });
          (await Promise.all([
            n.invalidateQueries(u.projects.listSkillsForSettings.queryFilter({projectId, accountId})),
            n.invalidateQueries(u.projects.listSkills.queryFilter({projectId, accountId})),
            n.invalidateQueries(
              u.projects.readSkillFile.queryFilter({projectId, skillPath: skill.definitionPath, accountId}),
            ),
          ]),
            await o({
              to: '/u/$userId/settings/plugins/skills/$skillId',
              params: {userId, skillId: de(p.path)},
              search: {file: p.definitionPath},
              resetScroll: false,
            }),
            j.success(
              p.overridesBuiltin ? `Saved ${p.name}. It will override the built-in skill.` : `Saved ${p.name}.`,
            ),
            onOpenChange(false),
            h(null));
        } catch (p) {
          (j.error(p instanceof Error ? p.message : 'There was an error saving the skill.'), console.error(p));
        }
      },
      H = m === skill.definitionPath && f.trim().length > 0 && v.trim().length > 0 && D.trim().length > 0;
    return (0, e.jsx)(We, {
      open,
      onOpenChange: L,
      children: (0, e.jsx)(Ve, {
        className: 'flex h-[min(46rem,calc(100vh-2rem))] overflow-hidden sm:max-w-3xl',
        children: (0, e.jsxs)('form', {
          className: 'flex min-h-0 w-full flex-col gap-4',
          onSubmit: O,
          children: [
            (0, e.jsxs)(Ge, {
              className: 'shrink-0',
              children: [
                (0, e.jsx)(Ze, {children: 'Edit skill'}),
                (0, e.jsx)(Ue, {className: 'sr-only', children: 'Edit this user-owned skill.'}),
              ],
            }),
            (0, e.jsx)('div', {
              className: 'min-h-0 flex-1 overflow-y-auto pr-1',
              children: (0, e.jsxs)('div', {
                className: 'grid gap-3',
                children: [
                  (0, e.jsxs)('div', {
                    className: 'grid gap-1.5',
                    children: [
                      (0, e.jsx)(U, {htmlFor: 'edit-skill-name', children: 'Name'}),
                      (0, e.jsx)(Z, {
                        id: 'edit-skill-name',
                        autoComplete: 'off',
                        value: f,
                        onChange: x => g(x.target.value),
                        required: true,
                      }),
                    ],
                  }),
                  (0, e.jsxs)('div', {
                    className: 'grid gap-1.5',
                    children: [
                      (0, e.jsx)(U, {htmlFor: 'edit-skill-description', children: 'Description'}),
                      (0, e.jsx)(Z, {
                        id: 'edit-skill-description',
                        autoComplete: 'off',
                        value: v,
                        onChange: x => y(x.target.value),
                        required: true,
                      }),
                    ],
                  }),
                  (0, e.jsx)(rt, {
                    idPrefix: 'edit-skill',
                    open: N,
                    keywordsText: I,
                    urlPatternsText: T,
                    onOpenChange: w,
                    onKeywordsTextChange: F,
                    onUrlPatternsTextChange: z,
                  }),
                  (0, e.jsxs)('div', {
                    className: 'grid gap-1.5',
                    children: [
                      (0, e.jsx)(U, {htmlFor: 'edit-skill-body', children: 'Instructions'}),
                      (0, e.jsx)(Qe, {
                        id: 'edit-skill-body',
                        className:
                          'field-sizing-fixed h-[min(24rem,42vh)] min-h-44 resize-none overflow-y-auto font-mono text-sm',
                        value: D,
                        disabled: C.isLoading,
                        onChange: x => $(x.target.value),
                        required: true,
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, e.jsxs)(Ke, {
              children: [
                (0, e.jsx)(A, {
                  type: 'button',
                  variant: 'secondary',
                  disabled: b.isPending,
                  onClick: B,
                  children: 'Cancel',
                }),
                (0, e.jsx)(A, {type: 'submit', disabled: !H || b.isPending, children: 'Save'}),
              ],
            }),
          ],
        }),
      }),
    });
  } /** Markdown files preview here; other files open in the system app. */,
  SkillFileContent = () => {
    const {accountId, projectId, canPreviewFile, filePath, onRevealFile, skill} = useSkillFile();
    return canPreviewFile
      ? (0, e.jsx)(MarkdownFile, {
          accountId,
          projectId,
          filePath,
          showSkillMetadata: k(filePath) === k(skill.definitionPath),
        })
      : (0, e.jsx)(OtherFile, {onRevealFile});
  },
  MarkdownFile = ({accountId, projectId, filePath, showSkillMetadata}) => {
    const a = E(),
      o = V(a.projects.readSkillFile.queryOptions({projectId, skillPath: filePath, accountId})),
      c = (0, React.useMemo)(() => ce(o.data?.content ?? ''), [o.data?.content]),
      u = (0, React.useMemo)(() => (showSkillMetadata ? st(c) : {body: c}), [c, showSkillMetadata]);
    if (o.isLoading) return (0, e.jsx)('div', {className: 'min-h-full p-2', children: (0, e.jsx)(ie, {})});
    const n = o.data?.metadata,
      m = n?.autoInject?.keywords?.join(', ');
    return (0, e.jsxs)('div', {
      className: 'mx-auto w-full max-w-(--breakpoint-md) px-8 py-9',
      children: [
        u.heading && (0, e.jsx)(Markdown, {className: 'mb-5', children: u.heading}),
        showSkillMetadata &&
          n &&
          (0, e.jsxs)('div', {
            className: 'mb-10 border-y',
            children: [
              (0, e.jsx)(MetadataRow, {label: 'Description', value: n.description}),
              (0, e.jsx)(MetadataRow, {label: 'Keywords', value: m || '-'}),
            ],
          }),
        (0, e.jsx)(Markdown, {children: u.body}),
      ],
    });
  },
  OtherFile = ({onRevealFile}) => {
    const i = le();
    return (0, e.jsx)('div', {
      className: 'min-h-full p-2',
      children: (0, e.jsxs)('div', {
        className:
          'bg-background/20 flex size-full flex-col items-center justify-center gap-3 rounded-lg border px-4 py-3 text-center',
        children: [
          (0, e.jsx)(je, {className: 'text-muted-foreground/60 size-12'}),
          (0, e.jsxs)('div', {
            children: [
              (0, e.jsxs)('div', {
                className: 'text-primary font-display text-xl font-[450]',
                children: ['This file opens in ', i.name],
              }),
              (0, e.jsx)('div', {
                className: 'text-muted-foreground text-base',
                children: 'Only markdown files can be previewed here.',
              }),
            ],
          }),
          (0, e.jsx)(A, {onClick: onRevealFile, children: (0, e.jsx)('span', {children: i.revealLabel})}),
        ],
      }),
    });
  },
  Markdown = ({children, className}) =>
    (0, e.jsx)('div', {
      className: `[&_.streamdown]:text-sm [&_.streamdown_h1]:text-[30px] [&_.streamdown_h1]:leading-9 [&>div]:p-0 ${className ?? ''}`,
      children: (0, e.jsx)($e, {children}),
    }),
  MetadataRow = ({label, value}) =>
    (0, e.jsxs)('div', {
      className: 'grid min-h-9 grid-cols-[120px_1fr] items-start border-b py-2 text-sm last:border-b-0',
      children: [
        (0, e.jsx)('div', {className: 'text-muted-foreground font-medium', children: label}),
        (0, e.jsx)('div', {children: value}),
      ],
    }),
  AGENTS = [
    {value: 'aux', label: 'Aux'},
    {value: 'aux-code', label: 'Aux Code'},
  ];
function Gt() {
  const {userId, skillId} = K.useParams(),
    {file} = K.useSearch(),
    r = K.useNavigate(),
    a = Number.parseInt(userId, 10),
    o = E(),
    {data} = be(o.projects.listSkillsForSettings.queryOptions({projectId: null, accountId: a}, {select: Ye})),
    u = it(skillId),
    n = data.skills.find(f => k(f.path) === k(u ?? '')),
    m = file ? k(file) : void 0,
    h = m && data.skillByFilePath.get(m)?.path === n?.path ? m : n?.definitionPath ? k(n.definitionPath) : void 0;
  return (
    (0, React.useEffect)(() => {
      !n || file === h || r({search: {file: h}, replace: true, resetScroll: false});
    }, [file, r, h, n]),
    !n || !h
      ? null
      : (0, e.jsxs)('div', {
          className: 'flex size-full flex-col overflow-hidden',
          children: [
            (0, e.jsx)(Xe, {segments: ['Settings', 'Plugins & MCPs', n.name]}),
            (0, e.jsx)(React.Suspense, {
              fallback: (0, e.jsx)(ie, {}),
              children: (0, e.jsxs)(SkillFileProvider, {
                accountId: a,
                projectId: null,
                filePath: h,
                skill: n,
                children: [
                  (0, e.jsx)(SkillHeader, {}),
                  (0, e.jsx)('div', {
                    className: 'min-h-0 grow',
                    children: (0, e.jsx)(Re, {
                      className: 'size-full min-h-0',
                      children: (0, e.jsx)(SkillFileContent, {}),
                    }),
                  }),
                ],
              }),
            }),
          ],
        })
  );
}
