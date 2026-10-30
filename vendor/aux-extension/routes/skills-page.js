/* Aux-owned source, Plugins › Skills (assets/skills-CfSQ7MCw.js, from the skill icon to the end of the
 * module; es exported as component; the JSX runtime binding before it stays supplied): the skill
 * groups (mine, built-in, system, password manager), a skill row with its delete action, importing a
 * skill folder, and creating a new skill (name, description, activation, instructions).
 * The catalog query filters out the retired password-manager entry, an edit that
 * vendor/provided/native-ui-compat.mjs makes upstream.
 * Names the rest of the chunk uses keep their chunk names: es the page.
 * Chunk names used: e JSX runtime, v/F/P/ne tRPC, query client, mutation and query, D capture, ie
 * confirm, x toast, E/z/Ne/b the skill helpers, W skill ID, H list text, le the native bridge, De
 * the activation fields, the settings section and row parts, dialog, dropdown, avatar and form parts. */
SkillIcon = ({size = 24, ariaHidden = true, ...a}) =>
    (0, e.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...a,
      children: (0, e.jsx)('path', {
        d: 'M19 2C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H7C5.34315 22 4 20.6569 4 19V6C4 3.79086 5.79086 2 8 2H19ZM7 18C6.44772 18 6 18.4477 6 19C6 19.5523 6.44772 20 7 20H18V18H7ZM8 4C6.89543 4 6 4.89543 6 6V16.1709C6.31278 16.0604 6.64936 16 7 16H18V4H8ZM9.23242 10.5361C9.34315 10.3155 9.65793 10.3154 9.76855 10.5361L10.2891 11.5771C10.318 11.6351 10.365 11.682 10.4229 11.7109L11.4639 12.2314C11.6848 12.342 11.6849 12.6581 11.4639 12.7686L10.4229 13.2881C10.3649 13.3171 10.3181 13.3648 10.2891 13.4229L9.76855 14.4629C9.658 14.6841 9.34298 14.6841 9.23242 14.4629L8.71191 13.4229C8.68288 13.3648 8.63521 13.3171 8.57715 13.2881L7.53711 12.7686C7.316 12.6581 7.31599 12.3419 7.53711 12.2314L8.57715 11.7109C8.6352 11.6819 8.68288 11.6352 8.71191 11.5771L9.23242 10.5361ZM13.0527 5.89453C13.2369 5.52604 13.7629 5.52612 13.9473 5.89453L14.5928 7.18457C14.6412 7.2812 14.7197 7.35987 14.8164 7.4082L16.1055 8.05273C16.4741 8.23699 16.4741 8.76301 16.1055 8.94727L14.8164 9.5918C14.7198 9.64009 14.6412 9.71889 14.5928 9.81543L13.9473 11.1055C13.763 11.474 13.2369 11.474 13.0527 11.1055L12.4082 9.81543C12.3599 9.7188 12.2813 9.64013 12.1846 9.5918L10.8945 8.94727C10.5262 8.76294 10.5261 8.23699 10.8945 8.05273L12.1846 7.4082C12.2813 7.35984 12.3599 7.28129 12.4082 7.18457L13.0527 5.89453Z',
        fill: 'currentColor',
      }),
    }),
  React = Y(ee()),
  SkillsRoute = re('/_web/(settings)/u/$userId/settings/plugins/skills/');
function es() {
  return (0, e.jsxs)(e.Fragment, {
    children: [
      (0, e.jsx)(ye, {segments: ['Settings', 'Plugins & MCPs', 'Skills']}),
      (0, e.jsxs)('div', {
        className: 'mx-auto w-full max-w-2xl px-8 pt-16 pb-40',
        children: [
          (0, e.jsx)(Ie, {actions: (0, e.jsx)(SkillActions, {})}),
          (0, e.jsx)(React.Suspense, {children: (0, e.jsx)(SkillGroups, {})}),
        ],
      }),
    ],
  });
}
var /** The skills by group; password-manager skills in their own group. */
  SkillGroups = () => {
    const {userId} = ue.useParams(),
      i = Number.parseInt(userId, 10),
      a = v(),
      {data} = ne(
        a.projects.listSkillsForSettings.queryOptions(
          {projectId: null, accountId: i},
          {
            select: t => {
              const p = be(t);
              return {...p, skills: p.skills.filter(t => t.path !== 'builtin/password-manager')};
            },
          },
        ),
      ),
      o = data.skills.filter(t => E.has(t.name.toLowerCase())),
      m = data.skills.filter(t => t.group === 'builtin' && !E.has(t.name.toLowerCase())),
      c = Ne(m.filter(z)),
      h = m.filter(t => !z(t)).sort((t, p) => b(t).localeCompare(b(p))),
      d = data.skills.filter(t => t.group === 'user');
    return (0, e.jsxs)('div', {
      className: 'space-y-8',
      children: [
        d.length > 0 && (0, e.jsx)(SkillGroup, {title: 'My Skills', skills: d, userId}),
        (0, e.jsx)(SkillGroup, {title: 'Built-in Skills', skills: h, userId}),
        (0, e.jsx)(SkillGroup, {title: 'System', skills: c, userId}),
        (0, e.jsx)(SkillGroup, {title: 'Password Manager', skills: o, userId}),
      ],
    });
  },
  SkillGroup = ({title, skills, userId}) =>
    (0, e.jsx)(ve, {
      label: title,
      title: (0, e.jsxs)(e.Fragment, {
        children: [
          title,
          ' ',
          (0, e.jsx)('span', {className: 'text-muted-foreground/60 ml-1', children: skills.length}),
        ],
      }),
      children: (0, e.jsx)(we, {children: skills.map(r => (0, e.jsx)(SkillRow, {skill: r, userId}, r.path))}),
    }) /** A skill: opens its page; user skills can be deleted. */,
  SkillRow = ({skill, userId}) => {
    const a = Number.parseInt(userId, 10),
      r = null,
      o = v(),
      m = F(),
      {capture} = D(),
      {confirm} = ie(),
      d = P(o.projects.deleteSkill.mutationOptions()),
      t = {userId, skillId: W(skill.path)},
      p = {file: skill.definitionPath},
      n = b(skill),
      j = skill.group === 'user',
      C = async () => {
        if (
          await confirm({
            title: `Delete ${n}?`,
            description: 'This removes the skill and its files.',
            ui: {variant: 'destructive', action: 'Delete'},
          })
        )
          try {
            (await d.mutateAsync({accountId: a, projectId: r, skillPath: skill.path}),
              await Promise.all([
                m.invalidateQueries(o.projects.listSkillsForSettings.queryFilter({projectId: r, accountId: a})),
                m.invalidateQueries(o.projects.listSkills.queryFilter({projectId: r, accountId: a})),
              ]),
              capture('settings.skills.delete', {
                keywordCount: skill.metadata?.autoInject?.keywords?.length ?? 0,
                urlPatternCount: skill.metadata?.autoInject?.url?.length ?? 0,
                siteSpecific: skill.siteSpecific,
                wasEnabled: skill.enabled,
              }),
              x.success(`Deleted ${n}.`));
          } catch (f) {
            (x.error(f instanceof Error ? f.message : 'There was an error deleting the skill.'), console.error(f));
          }
      };
    return (0, e.jsxs)('div', {
      className: 'bg-surface-secondary dark:hover:bg-accent flex min-h-14 items-center p-2.5 hover:bg-muted',
      children: [
        (0, e.jsxs)(te, {
          to: '/u/$userId/settings/plugins/skills/$skillId',
          params: t,
          search: p,
          className: 'flex min-w-0 grow items-center gap-2.5',
          children: [
            (0, e.jsxs)(ge, {
              className: 'border-border border-hairline size-9 rounded-lg',
              children: [
                skill.metadata?.icon && (0, e.jsx)(he, {src: skill.metadata.icon}),
                (0, e.jsx)(pe, {
                  className: 'bg-secondary rounded-lg',
                  children: (0, e.jsx)(SkillIcon, {className: 'size-6'}),
                }),
              ],
            }),
            (0, e.jsxs)('div', {
              className: 'min-w-0 grow',
              children: [
                (0, e.jsx)('div', {className: 'text-primary truncate text-sm font-medium', children: n}),
                (0, e.jsx)('div', {className: 'text-muted-foreground truncate text-xs', children: skill.description}),
              ],
            }),
          ],
        }),
        j &&
          (0, e.jsxs)(Z, {
            children: [
              (0, e.jsx)(Q, {
                render: (0, e.jsx)(k, {size: 'icon-sm', variant: 'ghost', 'aria-label': `Open actions for ${n}`}),
                children: (0, e.jsx)(ce, {className: 'size-4'}),
              }),
              (0, e.jsx)(V, {
                align: 'end',
                children: (0, e.jsxs)(R, {
                  variant: 'destructive',
                  disabled: d.isPending,
                  onClick: C,
                  children: [(0, e.jsx)(de, {}), (0, e.jsx)('span', {children: 'Delete'})],
                }),
              }),
            ],
          }),
      ],
    });
  } /** Import a skill folder, or create a new skill. */,
  SkillActions = () => {
    const {userId} = SkillsRoute.useParams(),
      i = null,
      a = Number.parseInt(userId, 10),
      r = v(),
      o = F(),
      {capture} = D(),
      c = P(r.projects.importSkillFolder.mutationOptions()),
      [h, d] = (0, React.useState)(false),
      t = () => d(true),
      p = async () => {
        try {
          const n = await le({method: 'Aux.pickDirectory', params: {prompt: 'Import skill folder'}});
          if (n.status === 'cancelled') return;
          if (n.status === 'unavailable' || !n.path) {
            x.error('Folder picker is not available on this device.');
            return;
          }
          const j = await c.mutateAsync({projectId: i, sourcePath: n.path, accountId: a});
          (await Promise.all([
            o.invalidateQueries(r.projects.listSkillsForSettings.queryFilter({projectId: i, accountId: a})),
            o.invalidateQueries(r.projects.listSkills.queryFilter({projectId: i, accountId: a})),
          ]),
            capture('settings.skills.import', {source: 'folder'}),
            x.success(`Imported ${j.name}.`));
        } catch (n) {
          (x.error(n instanceof Error ? n.message : 'There was an error importing the skill folder.'),
            console.error(n));
        }
      };
    return (0, e.jsxs)(e.Fragment, {
      children: [
        (0, e.jsxs)(ae, {
          children: [
            (0, e.jsxs)(k, {
              disabled: c.isPending,
              onClick: p,
              children: [(0, e.jsx)(O, {className: 'size-4'}), (0, e.jsx)('span', {children: 'Import'})],
            }),
            (0, e.jsxs)(Z, {
              children: [
                (0, e.jsx)(Q, {
                  render: (0, e.jsx)(k, {size: 'icon', 'aria-label': 'More import actions'}),
                  children: (0, e.jsx)(oe, {className: 'size-4'}),
                }),
                (0, e.jsx)(V, {
                  align: 'end',
                  children: (0, e.jsxs)(R, {
                    onClick: t,
                    children: [(0, e.jsx)(O, {}), (0, e.jsx)('span', {children: 'Create new skill'})],
                  }),
                }),
              ],
            }),
          ],
        }),
        (0, e.jsx)(CreateSkillDialog, {open: h, onOpenChange: d}),
      ],
    });
  } /** Creating a skill. */,
  CreateSkillDialog = ({open, onOpenChange}) => {
    const {userId} = SkillsRoute.useParams(),
      r = null,
      o = Number.parseInt(userId, 10),
      m = SkillsRoute.useNavigate(),
      c = v(),
      h = F(),
      {capture} = D(),
      t = P(c.projects.createSkill.mutationOptions()),
      [p, n] = (0, React.useState)(''),
      [j, C] = (0, React.useState)(''),
      [f, L] = (0, React.useState)(false),
      [M, T] = (0, React.useState)(''),
      [q, A] = (0, React.useState)(''),
      [w, B] = (0, React.useState)(''),
      G = () => {
        (n(''), C(''), L(false), T(''), A(''), B(''));
      },
      K = () => onOpenChange(false),
      U = u => {
        (!u && t.isPending) || onOpenChange(u);
      },
      J = async u => {
        u.preventDefault();
        const _ = H(M),
          y = H(q);
        if (y.some(l => l.includes('://') || /\s/.test(l))) {
          x.error('URL patterns should omit the scheme, e.g. github.com/**.');
          return;
        }
        try {
          const l = await t.mutateAsync({
            accountId: o,
            projectId: r,
            name: p,
            description: j,
            body: w,
            enabled: true,
            keywords: _,
            urlPatterns: y,
          });
          (await Promise.all([
            h.invalidateQueries(c.projects.listSkillsForSettings.queryFilter({projectId: r, accountId: o})),
            h.invalidateQueries(c.projects.listSkills.queryFilter({projectId: r, accountId: o})),
          ]),
            await m({
              to: '/u/$userId/settings/plugins/skills/$skillId',
              params: {userId, skillId: W(l.path)},
              search: {file: l.definitionPath},
            }),
            x.success(
              l.overridesBuiltin ? `Created ${l.name}. It will override the built-in skill.` : `Created ${l.name}.`,
            ),
            capture('settings.skills.create', {
              keywordCount: _.length,
              urlPatternCount: y.length,
              overridesBuiltin: l.overridesBuiltin,
            }),
            G(),
            onOpenChange(false));
        } catch (l) {
          (x.error(l instanceof Error ? l.message : 'There was an error creating the skill.'), console.error(l));
        }
      },
      X = p.trim().length > 0 && j.trim().length > 0 && w.trim().length > 0;
    return (0, e.jsx)(Se, {
      open,
      onOpenChange: U,
      children: (0, e.jsx)(ke, {
        className: 'flex h-[min(46rem,calc(100vh-2rem))] overflow-hidden sm:max-w-3xl',
        children: (0, e.jsxs)('form', {
          className: 'flex min-h-0 w-full flex-col gap-4',
          onSubmit: J,
          children: [
            (0, e.jsxs)(fe, {
              className: 'shrink-0',
              children: [
                (0, e.jsx)(Ce, {children: 'Create new skill'}),
                (0, e.jsx)(je, {className: 'sr-only', children: 'Create a user-owned skill for this project.'}),
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
                      (0, e.jsx)(I, {htmlFor: 'create-skill-name', children: 'Name'}),
                      (0, e.jsx)($, {
                        id: 'create-skill-name',
                        autoComplete: 'off',
                        value: p,
                        onChange: u => n(u.target.value),
                        placeholder: 'e.g. Weekly metrics review',
                        required: true,
                      }),
                    ],
                  }),
                  (0, e.jsxs)('div', {
                    className: 'grid gap-1.5',
                    children: [
                      (0, e.jsx)(I, {htmlFor: 'create-skill-description', children: 'Description'}),
                      (0, e.jsx)($, {
                        id: 'create-skill-description',
                        autoComplete: 'off',
                        value: j,
                        onChange: u => C(u.target.value),
                        placeholder: 'When the project should use this skill',
                        required: true,
                      }),
                    ],
                  }),
                  (0, e.jsx)(De, {
                    idPrefix: 'create-skill',
                    open: f,
                    keywordsText: M,
                    urlPatternsText: q,
                    onOpenChange: L,
                    onKeywordsTextChange: T,
                    onUrlPatternsTextChange: A,
                  }),
                  (0, e.jsxs)('div', {
                    className: 'grid gap-1.5',
                    children: [
                      (0, e.jsx)(I, {htmlFor: 'create-skill-body', children: 'Instructions'}),
                      (0, e.jsx)(me, {
                        id: 'create-skill-body',
                        className:
                          '[field-sizing:fixed] h-[min(24rem,42vh)] min-h-44 resize-none overflow-y-auto font-mono text-sm',
                        value: w,
                        onChange: u => B(u.target.value),
                        placeholder: 'Describe the workflow, constraints, and expected outputs.',
                        required: true,
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, e.jsxs)(xe, {
              children: [
                (0, e.jsx)(k, {
                  type: 'button',
                  variant: 'secondary',
                  disabled: t.isPending,
                  onClick: K,
                  children: 'Cancel',
                }),
                (0, e.jsx)(k, {type: 'submit', disabled: !X || t.isPending, children: 'Create'}),
              ],
            }),
          ],
        }),
      }),
    });
  }
