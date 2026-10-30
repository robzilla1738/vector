/* Aux-owned source: the Security & Privacy settings page (assets/privacy-BeEEt9Qu.js, after its
 * imports; pr exported as component). The ad blocker (on or off, filter lists and custom filters
 * with their editor, updates and their progress, paused sites), deleting browsing data (by period
 * and kind, with counts of what would go), third-party cookies, crash reports, and links to history.
 * Names the rest of the chunk uses keep their chunk names: pr the page.
 * Chunk names used: A useQueryClient, N queryOptions, j useQuery, J useMutation, g toasts, W confirm,
 * Z/q settings sections, ge menu checkbox item, F Button, $e dialogs, ve/Ce form and resolver,
 * _/Pt/It/Y/ce/le/Mt zod, L form context, ye the native bridge, at relative time, xt sleep. */
var React = He(Ke(), 1);
function pendingMutations(t, r) {
  const s = A(r);
  return useMutationStates({filters: {...t, status: 'pending'}}, s).length;
}
function mutationStates(t, r) {
  return t.findAll(r.filters).map(s => (r.select ? r.select(s) : s.state));
} /** The states of the mutations matching a filter, kept in step with the mutation cache. */
function useMutationStates(t = {}, r) {
  const s = A(r).getMutationCache(),
    a = React.useRef(t),
    o = React.useRef(null);
  return (
    o.current === null && (o.current = mutationStates(s, t)),
    React.useEffect(() => {
      a.current = t;
    }),
    React.useSyncExternalStore(
      React.useCallback(
        l =>
          s.subscribe(() => {
            const c = ht(o.current, mutationStates(s, a.current));
            o.current !== c && ((o.current = c), gt.schedule(l));
          }),
        [s],
      ),
      () => o.current,
      () => o.current,
    )
  );
}
var jsxRuntime = ze(),
  ShieldIcon = ({size = 24, ariaHidden = true, ...s}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...s,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M19.1308 2.50574C19.4037 2.02582 20.014 1.85798 20.4941 2.13074C20.9742 2.40363 21.1419 3.0139 20.8691 3.49402L16.2109 11.6932L16.4736 11.7889C17.9943 12.3424 19.211 13.8514 18.958 15.6532C18.622 18.046 17.5993 19.7736 15.7129 21.7001C15.4258 21.993 14.9885 22.081 14.6103 21.9218L5.11229 17.9218C4.77309 17.7789 4.53974 17.461 4.50487 17.0946C4.47005 16.7282 4.63906 16.3721 4.9453 16.1678C6.40253 15.1964 7.56807 14.2449 8.44335 12.868C9.49982 11.2063 11.5973 10.0143 13.7236 10.788L14.3047 10.9999L19.1308 2.50574ZM13.04 12.6678C12.0566 12.3098 10.8498 12.8102 10.1308 13.9413C9.39345 15.1013 8.50191 15.9956 7.52831 16.7694L9.23632 17.4882C9.2937 17.5123 9.35999 17.5083 9.41405 17.4774L11.5449 16.2596C11.7043 16.1687 11.892 16.3228 11.834 16.4969L11.2822 18.1493C11.2492 18.2483 11.2983 18.3568 11.3945 18.3973L14.748 19.8095C16.1065 18.3156 16.7425 17.049 16.9775 15.3749C17.0723 14.7002 16.6191 13.9707 15.79 13.6688L13.04 12.6678ZM5.05175 5.89441C5.23601 5.52589 5.76201 5.52589 5.94628 5.89441L6.59081 7.18445C6.63917 7.28107 6.71783 7.35972 6.81444 7.40808L8.10448 8.05261C8.47297 8.23689 8.47299 8.76288 8.10448 8.94714L6.81444 9.59168C6.71783 9.64007 6.63916 9.71867 6.59081 9.81531L5.94628 11.1053C5.76198 11.4738 5.23603 11.4738 5.05175 11.1053L4.40722 9.81531C4.35884 9.71864 4.28027 9.64004 4.18358 9.59168L2.89354 8.94714C2.52505 8.76289 2.52509 8.2369 2.89354 8.05261L4.18358 7.40808C4.28025 7.35975 4.35883 7.28109 4.40722 7.18445L5.05175 5.89441ZM10.1797 2.63855C10.3113 2.37551 10.6867 2.37558 10.8183 2.63855L11.2793 3.56043C11.3139 3.62934 11.3705 3.68512 11.4394 3.71961L12.3603 4.18054C12.6234 4.31221 12.6234 4.6876 12.3603 4.81921L11.4394 5.28015C11.3705 5.31467 11.3139 5.37037 11.2793 5.43933L10.8183 6.36121C10.6866 6.62394 10.3113 6.62402 10.1797 6.36121L9.71874 5.43933C9.68421 5.37049 9.62841 5.31466 9.55956 5.28015L8.63768 4.81921C8.37488 4.68754 8.37495 4.31229 8.63768 4.18054L9.55956 3.71961C9.62839 3.68513 9.6842 3.62921 9.71874 3.56043L10.1797 2.63855Z',
        fill: 'currentColor',
      }),
    }),
  FilterIcon = ({size = 24, ariaHidden = true, ...s}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...s,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13V19.8994C15.2822 19.4361 17 17.4189 17 15V11C17 9.89542 16.1046 9 15 9H9C7.89543 9 7 9.89543 7 11V15C7 17.4189 8.71781 19.4361 11 19.8994V13ZM15 7C15 5.34315 13.6568 4 12 4C10.3431 4 9 5.34314 9 7H15ZM17 7.5C17 7.51178 16.9985 7.52347 16.998 7.53516C17.1992 7.6514 17.3893 7.78432 17.5664 7.93262L20.4561 7.04395C20.9839 6.88167 21.5437 7.17826 21.7061 7.70605C21.8683 8.23386 21.5717 8.79366 21.0439 8.95605L18.7676 9.65625C18.9174 10.0763 19 10.5285 19 11V12H21C21.5523 12 22 12.4477 22 13C22 13.5523 21.5523 14 21 14H19V15C19 15.4296 18.9579 15.8496 18.8838 16.2578L21.0918 17.0605C21.6107 17.2493 21.8782 17.8228 21.6895 18.3418C21.5007 18.8607 20.9272 19.1282 20.4082 18.9395L18.248 18.1533C17.0944 20.4346 14.7311 22 12 22C9.26871 22 6.90453 20.4348 5.75098 18.1533L3.5918 18.9395C3.07282 19.1282 2.49934 18.8607 2.31055 18.3418C2.12183 17.8228 2.38927 17.2493 2.9082 17.0605L5.11523 16.2578C5.04115 15.8496 5 15.4296 5 15V14H3C2.44772 14 2 13.5523 2 13C2 12.4477 2.44772 12 3 12H5V11C5 10.5463 5.07664 10.1106 5.21582 9.7041L2.93555 8.94922C2.41134 8.77556 2.12719 8.20979 2.30078 7.68555C2.47444 7.16134 3.04021 6.87719 3.56445 7.05078L6.37598 7.98145C6.56895 7.81355 6.77817 7.66398 7.00098 7.53516C7.00057 7.52348 7 7.51177 7 7.5V7C7 4.23858 9.23857 2 12 2C14.7614 2 17 4.23857 17 7V7.5Z',
        fill: 'currentColor',
      }),
    }),
  ADBLOCK_KEY = ['auxAdblock'],
  ADBLOCK_CHANGE_KEY = ['auxAdblock', 'change'],
  BUSY_STATUSES = new Set([
    'queued',
    'downloading',
    'compiling',
  ]) /** The ad blocker’s state, filter lists and custom rules, polled while they change. */,
  adblockQueries = {
    state: t =>
      N({
        queryKey: [...ADBLOCK_KEY, 'state'],
        queryFn: () => t.getState(),
        refetchInterval: r => (r.state.data?.compiling || r.state.data?.activeUpdateJobIds.length ? 1e3 : false),
        retry: false,
      }),
    subscriptions: t =>
      N({
        queryKey: [...ADBLOCK_KEY, 'subscriptions'],
        queryFn: () => t.getSubscriptions(),
        refetchInterval: r => (r.state.data?.some(s => BUSY_STATUSES.has(s.status)) ? 1e3 : false),
        retry: false,
      }),
    customRules: t => N({queryKey: [...ADBLOCK_KEY, 'customRules'], queryFn: () => t.getCustomRules(), retry: false}),
  };
function useAdblockMutation(t) {
  const r = A();
  return J({
    mutationKey: ADBLOCK_CHANGE_KEY,
    mutationFn: t,
    onError: s => g.error('Couldn’t update the ad blocker', {description: s.message}),
    onSettled: () => r.invalidateQueries({queryKey: ADBLOCK_KEY}),
  });
}
var /** Waits for a filter-list update to finish, checking each second. */
  waitForUpdate = async (t, r) => {
    let s = await t.getSubscriptionUpdateProgress(r);
    for (; s.status === 'running';) (await xt(1e3), (s = await t.getSubscriptionUpdateProgress(r)));
    return s;
  },
  announcedUpdates =
    new Set() /** The filters menu: recommended and regional lists, custom filters, and adding or editing one. */,
  FilterMenu = ({api, disabled}) => {
    const [s, a] = (0, React.useState)(false),
      [o, l] = (0, React.useState)(''),
      c = j({...adblockQueries.subscriptions(api), enabled: s}),
      m = j({...adblockQueries.customRules(api), enabled: s}),
      i = j({...Qt, enabled: s}),
      {confirm} = W(),
      x = useAdblockMutation(async n => {
        const {updateJobId} = await api.addSubscription(n);
        await waitForUpdate(api, updateJobId);
      }),
      y = useAdblockMutation(({id, enabled}) => api.setSubscriptionEnabled(id, enabled)),
      v = useAdblockMutation(n => removeFilter(api, {type: 'text', index: n})),
      b = (0, React.useMemo)(() => new Map(c.data?.map(n => [n.url, n]) ?? []), [c.data]),
      w = o.trim().toLowerCase(),
      p = (0, React.useMemo)(
        () =>
          parseCustomRules(m.data?.rules ?? '')
            .map((n, d) => ({filter: n, index: d}))
            .filter(({filter}) => matches(w, filter.name, filter.rules)),
        [m.data?.rules, w],
      ),
      ee = i.data?.urls ?? announcedUpdates,
      te = (0, React.useMemo)(
        () => (c.data ?? []).filter(n => !ee.has(n.url) && matches(w, n.name, n.url)),
        [ee, w, c.data],
      ),
      se = (0, React.useMemo)(
        () =>
          FILTER_GROUPS.map(({key, label}) => ({
            key,
            label,
            filters: (i.data?.[key] ?? []).filter(f => matches(w, f.name, f.url)),
          })).filter(n => n.filters.length > 0),
        [i.data, w],
      ),
      z = p.length > 0 || te.length > 0,
      Ie = z || se.length > 0,
      k = x.isPending || y.isPending || v.isPending,
      re = n => {
        k || (a(n), n || l(''));
      },
      Be = n => {
        l(n.target.value);
      },
      Re = n => {
        if (n.key !== 'ArrowDown' && n.key !== 'ArrowUp') {
          n.stopPropagation();
          return;
        }
        (n.preventDefault(), n.stopPropagation());
        const d = [...(n.currentTarget.closest('[role=menu]')?.querySelectorAll('[role^=menuitem]') ?? [])];
        (n.key === 'ArrowDown' ? d[0] : d.at(-1))?.focus();
      },
      Ue = n => d => {
        const f = b.get(n.url);
        f ? y.mutate({id: f.id, enabled: d}) : d && x.mutate({url: n.url, name: n.name});
      },
      Q = n => {
        (re(false), openFilterEditor(api, m.data?.rules ?? '', n));
      },
      _e = n => () => Q({type: 'text', index: n}),
      qe = n => () => {
        Q({type: 'url', subscription: n});
      },
      Oe = n => d => {
        k || y.mutate({id: n.id, enabled: d});
      },
      Ve = (n, d) => f => {
        f ||
          k ||
          confirm(
            {
              title: `Remove ${d} filter?`,
              description: 'This filter will be removed and its rules will stop applying.',
              ui: {variant: 'destructive', action: 'Remove'},
            },
            async () => {
              await v.mutateAsync(n);
            },
          );
      };
    return (0, jsxRuntime.jsxs)(je, {
      highlightItemOnHover: false,
      open: s,
      onOpenChange: re,
      children: [
        (0, jsxRuntime.jsxs)(xe, {
          disabled,
          render: (0, jsxRuntime.jsx)(F, {variant: 'outline'}),
          children: [
            k
              ? (0, jsxRuntime.jsx)(T, {className: 'text-muted-foreground', 'data-icon': 'inline-start'})
              : (0, jsxRuntime.jsx)(Ft, {className: 'text-muted-foreground', 'data-icon': 'inline-start'}),
            (0, jsxRuntime.jsx)('span', {children: 'Configure'}),
          ],
        }),
        (0, jsxRuntime.jsxs)(pe, {
          align: 'end',
          className: 'w-72',
          children: [
            (0, jsxRuntime.jsxs)(lt, {
              className: 'mb-1 border-0! bg-transparent! shadow-none ring-0!',
              children: [
                (0, jsxRuntime.jsx)(ot, {
                  align: 'inline-start',
                  children: (0, jsxRuntime.jsx)(kt, {className: 'size-4'}),
                }),
                (0, jsxRuntime.jsx)(ut, {
                  autoFocus: true,
                  value: o,
                  placeholder: 'Search filters',
                  onChange: Be,
                  onKeyDown: Re,
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: '-mx-1.5 max-h-72 overflow-y-auto px-1.5',
              children: [
                i.isPending &&
                  (0, jsxRuntime.jsx)('div', {
                    className: 'flex justify-center py-6',
                    children: (0, jsxRuntime.jsx)(T, {}),
                  }),
                i.isError &&
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-muted-foreground px-2.5 py-2 text-sm',
                    children: 'Couldn’t load filter catalog',
                  }),
                !i.isPending &&
                  !i.isError &&
                  !Ie &&
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-muted-foreground px-2.5 py-2 text-sm',
                    children: 'No matching filters',
                  }),
                z &&
                  (0, jsxRuntime.jsxs)(ne, {
                    children: [
                      (0, jsxRuntime.jsx)(oe, {children: 'Custom'}),
                      p.map(({filter, index}) =>
                        (0, jsxRuntime.jsx)(
                          CustomFilterToggle,
                          {
                            checked: true,
                            disabled: k,
                            name: filter.name,
                            onEdit: _e(index),
                            onToggle: Ve(index, filter.name || 'custom'),
                          },
                          `text-${index}`,
                        ),
                      ),
                      te.map(n =>
                        (0, jsxRuntime.jsx)(
                          CustomFilterToggle,
                          {checked: n.enabled, disabled: k, name: n.name || n.url, onEdit: qe(n), onToggle: Oe(n)},
                          n.id,
                        ),
                      ),
                    ],
                  }),
                se.map((n, d) =>
                  (0, jsxRuntime.jsxs)(
                    React.Fragment,
                    {
                      children: [
                        (z || d > 0) && (0, jsxRuntime.jsx)(ae, {}),
                        (0, jsxRuntime.jsxs)(ne, {
                          children: [
                            (0, jsxRuntime.jsx)(oe, {children: n.label}),
                            n.filters.map(f =>
                              (0, jsxRuntime.jsx)(
                                FilterToggle,
                                {checked: b.get(f.url)?.enabled ?? false, disabled: k, name: f.name, onToggle: Ue(f)},
                                f.id,
                              ),
                            ),
                          ],
                        }),
                      ],
                    },
                    n.key,
                  ),
                ),
              ],
            }),
            (0, jsxRuntime.jsx)(ae, {}),
            (0, jsxRuntime.jsxs)(U, {
              onClick: () => Q(),
              children: [(0, jsxRuntime.jsx)(Xe, {}), (0, jsxRuntime.jsx)('span', {children: 'Add filter'})],
            }),
          ],
        }),
      ],
    });
  },
  FILTER_GROUPS = [
    {key: 'recommended', label: 'Recommended'},
    {key: 'regional', label: 'Regional'},
  ],
  FilterToggle = ({checked, disabled, name, onToggle}) =>
    (0, jsxRuntime.jsx)(ge, {
      checked,
      closeOnClick: false,
      disabled,
      onCheckedChange: onToggle,
      children: (0, jsxRuntime.jsx)('span', {className: 'grow truncate', children: name}),
    }),
  CustomFilterToggle = ({checked, disabled, name, onEdit, onToggle}) => {
    const l = c => {
      (c.preventDefault(), c.stopPropagation(), onEdit());
    };
    return (0, jsxRuntime.jsxs)(ge, {
      checked,
      className: 'group/custom-filter pr-2.5 **:data-[slot=dropdown-menu-checkbox-item-indicator]:hidden',
      closeOnClick: false,
      disabled,
      onCheckedChange: onToggle,
      children: [
        (0, jsxRuntime.jsx)('span', {className: 'grow truncate', children: name}),
        checked && (0, jsxRuntime.jsx)(rt, {className: 'size-4'}),
        (0, jsxRuntime.jsx)(F, {
          variant: 'ghost',
          size: 'icon-sm',
          className: 'text-muted-foreground -m-1 -mr-2 hidden group-hover/custom-filter:flex focus-visible:flex',
          'aria-label': `Edit ${name}`,
          onClick: l,
          children: (0, jsxRuntime.jsx)(wt, {}),
        }),
      ],
    });
  },
  RULES_LIMIT = 4194304,
  byteLength = t => new TextEncoder().encode(t).length,
  filterName = _()
    .trim()
    .min(1, 'Enter a name')
    .refine(t => byteLength(t) <= 256, 'Use a shorter name (up to 256 bytes).'),
  filterForm = It('mode', [
    Y({
      mode: ce('url'),
      name: filterName,
      url: Pt().refine(t => t.startsWith('https://'), 'Enter an HTTPS URL'),
      rules: _(),
    }),
    Y({mode: ce('text'), name: filterName, url: _(), rules: _().trim().min(1, 'Enter filter rules')}),
  ]),
  openFilterEditor = (t, r, s) => {
    $e.open(({isOpen, close}) =>
      (0, jsxRuntime.jsx)(FilterEditor, {api: t, existingRules: r, editing: s, open: isOpen, onClose: close}),
    );
  } /** The custom filter editor: a list by HTTPS URL, or rules typed in. */,
  FilterEditor = ({api, existingRules, editing, open, onClose}) => {
    const {confirm} = W(),
      c = ve({mode: 'onChange', resolver: Ce(filterForm), defaultValues: filterDefaults(editing, existingRules)}),
      m = useAdblockMutation(p => saveFilter(api, p, editing)),
      i = useAdblockMutation(() => removeFilter(api, editing)),
      u = m.isPending || i.isPending,
      x = m.error ?? i.error,
      y = p => {
        u || p || onClose();
      },
      v = () => y(false),
      b = p => {
        m.mutate(p, {onSuccess: v});
      },
      w = () => {
        if (!editing || u) return;
        const p = c.getValues('name').trim() || 'custom';
        confirm(
          {
            title: `Remove ${p}?`,
            description: 'This filter will be removed and its rules will stop applying.',
            ui: {variant: 'destructive', action: 'Remove'},
          },
          async () => {
            (await i.mutateAsync(), v());
          },
        );
      };
    return (0, jsxRuntime.jsx)(Vt, {
      open,
      onOpenChange: y,
      children: (0, jsxRuntime.jsx)(qt, {
        showCloseButton: false,
        children: (0, jsxRuntime.jsxs)(we, {
          ...c,
          children: [
            (0, jsxRuntime.jsx)(_t, {
              children: (0, jsxRuntime.jsx)(Ot, {children: editing ? 'Edit custom filter' : 'Custom filter'}),
            }),
            (0, jsxRuntime.jsxs)('form', {
              id: 'adblock-custom-filter-form',
              className: 'space-y-3',
              onSubmit: c.handleSubmit(b),
              children: [
                !editing && (0, jsxRuntime.jsx)(FilterModeField, {disabled: u}),
                (0, jsxRuntime.jsx)(FilterNameField, {disabled: u}),
                (0, jsxRuntime.jsx)(FilterUrlHint, {disabled: u}),
                x &&
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-destructive text-xs wrap-break-word',
                    role: 'alert',
                    children: x.message,
                  }),
              ],
            }),
            (0, jsxRuntime.jsxs)(Ut, {
              className: editing ? 'sm:justify-between' : void 0,
              children: [
                editing &&
                  (0, jsxRuntime.jsxs)(F, {
                    variant: 'ghost',
                    className: 'text-destructive hover:text-destructive hover:bg-destructive/10',
                    disabled: u,
                    onClick: w,
                    children: [
                      i.isPending && (0, jsxRuntime.jsx)(T, {}),
                      (0, jsxRuntime.jsx)('span', {children: 'Remove'}),
                    ],
                  }),
                (0, jsxRuntime.jsxs)('div', {
                  className: 'flex gap-1',
                  children: [
                    (0, jsxRuntime.jsx)(F, {variant: 'secondary', disabled: u, onClick: v, children: 'Cancel'}),
                    (0, jsxRuntime.jsxs)(F, {
                      form: 'adblock-custom-filter-form',
                      type: 'submit',
                      disabled: u,
                      children: [
                        m.isPending && (0, jsxRuntime.jsx)(T, {}),
                        (0, jsxRuntime.jsx)('span', {children: editing ? 'Save' : 'Add'}),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
    });
  },
  FilterModeField = ({disabled}) => {
    const r = L(),
      s = be({control: r.control, name: 'mode'}),
      a = o => {
        r.setValue('mode', o);
      };
    return (0, jsxRuntime.jsx)(Et, {
      value: s,
      onValueChange: a,
      children: (0, jsxRuntime.jsxs)(Nt, {
        className: 'w-full',
        children: [
          (0, jsxRuntime.jsx)(ie, {disabled, value: 'url', children: 'URL'}),
          (0, jsxRuntime.jsx)(ie, {disabled, value: 'text', children: 'Custom'}),
        ],
      }),
    });
  },
  FilterNameField = ({disabled}) => {
    const r = L(),
      s = r.formState.errors.name;
    return (0, jsxRuntime.jsxs)(B, {
      'data-invalid': !!s,
      children: [
        (0, jsxRuntime.jsx)(I, {htmlFor: 'adblock-custom-filter-name', children: 'Name'}),
        (0, jsxRuntime.jsx)(fe, {
          id: 'adblock-custom-filter-name',
          maxLength: 256,
          placeholder: 'e.g. My filter',
          disabled,
          'aria-invalid': !!s,
          ...r.register('name'),
        }),
        (0, jsxRuntime.jsx)(X, {children: s?.message}),
      ],
    });
  },
  FilterUrlHint = ({disabled}) => {
    const r = L();
    return be({control: r.control, name: 'mode'}) === 'text'
      ? (0, jsxRuntime.jsx)(FilterRulesField, {disabled})
      : (0, jsxRuntime.jsx)(FilterUrlField, {disabled});
  },
  FilterUrlField = ({disabled}) => {
    const r = L(),
      s = r.formState.errors.url;
    return (0, jsxRuntime.jsxs)(B, {
      'data-invalid': !!s,
      children: [
        (0, jsxRuntime.jsx)(I, {htmlFor: 'adblock-custom-filter-url', children: 'URL'}),
        (0, jsxRuntime.jsx)(fe, {
          id: 'adblock-custom-filter-url',
          type: 'url',
          pattern: 'https://.*',
          title: 'Enter an HTTPS URL',
          placeholder: 'https://example.com/filters.txt',
          autoComplete: 'off',
          disabled,
          'aria-invalid': !!s,
          ...r.register('url'),
        }),
        (0, jsxRuntime.jsx)(X, {children: s?.message}),
      ],
    });
  },
  FilterRulesField = ({disabled}) => {
    const r = L(),
      s = r.formState.errors.rules;
    return (0, jsxRuntime.jsxs)(B, {
      'data-invalid': !!s,
      children: [
        (0, jsxRuntime.jsx)(I, {htmlFor: 'adblock-custom-filter-rules', children: 'Filter rules'}),
        (0, jsxRuntime.jsx)(Bt, {
          id: 'adblock-custom-filter-rules',
          className: 'min-h-40 resize-y font-mono text-xs',
          placeholder: `||example.com^
@@||allowed.example^`,
          spellCheck: false,
          autoCapitalize: 'off',
          autoComplete: 'off',
          disabled,
          'aria-invalid': !!s,
          ...r.register('rules'),
        }),
        (0, jsxRuntime.jsx)(X, {children: s?.message}),
      ],
    });
  },
  filterDefaults = (t, r) => {
    if (t?.type === 'url') return {mode: 'url', name: t.subscription.name || '', url: t.subscription.url, rules: ''};
    if (t?.type === 'text') {
      const s = parseCustomRules(r)[t.index];
      return {mode: 'text', name: s?.name ?? '', url: '', rules: s?.rules ?? ''};
    }
    return {mode: 'url', name: '', url: '', rules: ''};
  } /** Saves a filter: a list by URL, or custom rules. */,
  saveFilter = async (t, r, s) => {
    switch (r.mode) {
      case 'url':
        return saveFilterList(t, {url: r.url, name: r.name}, s);
      case 'text':
        return saveCustomFilter(t, {name: r.name, rules: r.rules}, s);
      default:
        r.mode;
        return;
    }
  } /** Saves a filter list; a changed URL adds the new list before removing the old. */,
  saveFilterList = async (t, r, s) => {
    if (s?.type !== 'url') return t.addSubscription(r);
    const {subscription} = s;
    (subscription.url === r.url && (subscription.name || '') === r.name) ||
      (subscription.url === r.url && (await t.removeSubscription(subscription.id)),
      await t.addSubscription(r),
      subscription.url !== r.url && (await t.removeSubscription(subscription.id)));
  },
  saveCustomFilter = async (t, r, s) =>
    editCustomRules(t, a => {
      s?.type === 'text' ? (a[s.index] = r) : a.push(r);
    }),
  removeFilter = async (t, r) => {
    if (!r) throw new Error('No filter to remove');
    switch (r.type) {
      case 'url':
        return t.removeSubscription(r.subscription.id);
      case 'text':
        return editCustomRules(t, s => {
          s.splice(r.index, 1);
        });
      default:
        return;
    }
  } /** Edits the custom rules as separate filters, kept under 4 MiB. */,
  editCustomRules = async (t, r) => {
    const s = await t.getCustomRules(),
      a = parseCustomRules(s.rules);
    r(a);
    const o = formatCustomRules(a);
    if (byteLength(o) > RULES_LIMIT) throw new Error('Your rules exceed the 4 MiB limit.');
    return t.saveCustomRules({rules: o});
  },
  matches = (t, ...r) =>
    !t ||
    r.some(s => s.toLowerCase().includes(t)) /** Custom rules as separate filters, split at each “! Title:” line. */,
  parseCustomRules = t => {
    if (!t.trim()) return [];
    const r = [...t.matchAll(/^!\s*Title:\s*(.*)$/gm)];
    return r.length === 0
      ? [{name: '', rules: t}]
      : r.map((s, a) => {
          const o = s[1]?.trim() || '',
            l = (s.index ?? 0) + s[0].length,
            c = r[a + 1]?.index ?? t.length;
          return {name: o, rules: t.slice(l, c).replace(/^\n/, '').replace(/\n+$/, '')};
        });
  },
  formatCustomRules = t =>
    t.map(
      r => `! Title: ${r.name}
${r.rules.trimEnd()}`,
    ).join(`

`) /** Ad blocker, where the browser provides it. */,
  AdBlockerSection = () => {
    const t = typeof chrome > 'u' ? void 0 : chrome.auxAdblock;
    return t
      ? (0, jsxRuntime.jsx)(Z, {
          title: 'Ad blocker',
          children: (0, jsxRuntime.jsx)(q, {children: (0, jsxRuntime.jsx)(AdBlockerRow, {api: t})}),
        })
      : null;
  } /** The ad blocker’s switch, its status and its filters. */,
  AdBlockerRow = ({api}) => {
    const {confirm} = W(),
      s = A(),
      a = j(adblockQueries.state(api)),
      o = j(adblockQueries.subscriptions(api)),
      l = j(adblockQueries.customRules(api)),
      c = pendingMutations({mutationKey: ADBLOCK_CHANGE_KEY}),
      m = useAdblockMutation(async b => {
        b ? await $t(api, s) : await api.setEnabled(false);
      }),
      i = a.data,
      u = (o.data?.length ?? 0) + parseCustomRules(l.data?.rules ?? '').length,
      x = c > 0 || !!i?.compiling || !!i?.activeUpdateJobIds.length,
      y = !!(i?.available && i.stateLoaded) && !a.isError,
      v = b => {
        if (b) {
          m.mutate(true);
          return;
        }
        confirm(
          {
            title: 'Turn off the ad blocker?',
            description: 'Ads and trackers will no longer be blocked. You can turn this back on anytime.',
            ui: {variant: 'destructive', action: 'Disable'},
          },
          () => m.mutateAsync(false),
        );
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(R, {
          className: 'gap-1',
          children: [
            (0, jsxRuntime.jsx)(bt, {className: 'text-muted-foreground mx-1 size-5'}),
            (0, jsxRuntime.jsx)(C, {title: 'Block ads and trackers', description: adblockStatus(i, o.data)}),
            (0, jsxRuntime.jsx)(H, {
              children: (0, jsxRuntime.jsx)(Ae, {
                'aria-label': 'Block ads and trackers',
                checked: i?.enabled ?? false,
                disabled: !y || c > 0,
                onCheckedChange: v,
              }),
            }),
          ],
        }),
        i?.enabled &&
          (0, jsxRuntime.jsx)(FilterRow, {
            api,
            canUpdate: !!o.data?.length,
            description: o.isPending || l.isPending ? 'Loading…' : filterCount(u),
            disabled: !y || x,
          }),
        i?.enabled && (0, jsxRuntime.jsx)(auxPausedSites, {api}),
      ],
    });
  } /** Sites the ad blocker is paused on, each with Resume. */,
  auxPausedSites = ({api}) => {
    const r = j(
        N({
          queryKey: [...ADBLOCK_KEY, 'pausedSites'],
          queryFn: () => api.getPausedSites(),
          enabled: typeof api.getPausedSites === 'function',
          retry: false,
        }),
      ),
      s = useAdblockMutation(o => api.resumeSite(o)),
      a = r.data ?? [];
    return a.length
      ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            (0, jsxRuntime.jsx)(R, {
              className: 'gap-1',
              children: (0, jsxRuntime.jsx)(C, {
                title: 'Paused sites',
                description:
                  'Ads and trackers aren’t blocked on these sites. Pause one from the command bar while you’re on it.',
              }),
            }),
            a.map(o =>
              (0, jsxRuntime.jsxs)(
                R,
                {
                  className: 'gap-1',
                  children: [
                    (0, jsxRuntime.jsx)(C, {title: o}),
                    (0, jsxRuntime.jsx)(H, {
                      children: (0, jsxRuntime.jsx)(F, {
                        variant: 'outline',
                        disabled: s.isPending,
                        onClick: () => s.mutate(o),
                        children: 'Resume',
                      }),
                    }),
                  ],
                },
                o,
              ),
            ),
          ],
        })
      : null;
  },
  FilterRow = ({api, canUpdate, description, disabled}) => {
    const o = useAdblockMutation(() => api.startSubscriptionUpdate()),
      l = useAdblockMutation(() => api.clearEngineCache()),
      c = () => {
        const i = g.loading('Updating filters…');
        o.mutate(void 0, {
          onSuccess: u => {
            announceUpdate(api, u.jobId, i);
          },
          onError: () => g.dismiss(i),
        });
      },
      m = () => {
        l.mutate(void 0, {onSuccess: () => g.success('Filter cache cleared')});
      };
    return (0, jsxRuntime.jsxs)(R, {
      className: 'gap-1',
      children: [
        (0, jsxRuntime.jsx)(Dt, {className: 'text-muted-foreground mx-1 size-5'}),
        (0, jsxRuntime.jsx)(C, {title: 'Manage filters', description}),
        (0, jsxRuntime.jsxs)(nt, {
          children: [
            (0, jsxRuntime.jsx)(FilterMenu, {api, disabled}),
            (0, jsxRuntime.jsxs)(je, {
              children: [
                (0, jsxRuntime.jsx)(xe, {
                  disabled,
                  render: (0, jsxRuntime.jsx)(F, {variant: 'outline', size: 'icon', 'aria-label': 'Filter actions'}),
                  children: (0, jsxRuntime.jsx)(jt, {className: 'size-4'}),
                }),
                (0, jsxRuntime.jsxs)(pe, {
                  align: 'end',
                  children: [
                    (0, jsxRuntime.jsxs)(U, {
                      disabled: !canUpdate,
                      onClick: c,
                      children: [
                        (0, jsxRuntime.jsx)(yt, {className: 'text-muted-foreground -ml-0.5'}),
                        (0, jsxRuntime.jsx)('span', {children: 'Update'}),
                      ],
                    }),
                    (0, jsxRuntime.jsxs)(U, {
                      onClick: m,
                      children: [
                        (0, jsxRuntime.jsx)(ShieldIcon, {className: 'text-muted-foreground -ml-0.5'}),
                        (0, jsxRuntime.jsx)('span', {children: 'Clear cache'}),
                      ],
                    }),
                    (0, jsxRuntime.jsxs)(U, {
                      render: (0, jsxRuntime.jsx)(P, {to: 'aux://adblock-internals'}),
                      children: [
                        (0, jsxRuntime.jsx)(FilterIcon, {className: 'text-muted-foreground -ml-0.5'}),
                        (0, jsxRuntime.jsx)('span', {className: 'grow', children: 'Debug'}),
                        (0, jsxRuntime.jsx)(E, {className: 'text-muted-foreground -mr-0.5'}),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  } /** Reports how a filter update ended. */,
  announceUpdate = async (t, r, s) => {
    try {
      const a = await waitForUpdate(t, r);
      switch (a.status) {
        case 'succeeded':
          g.success('Updated', {id: s});
          return;
        case 'partiallyFailed':
          g.error('Some filter lists couldn’t update', {id: s});
          return;
        case 'failed':
          g.error('Filter update failed', {id: s});
          return;
        default:
          a.status;
      }
    } catch (a) {
      g.error(a instanceof Error ? a.message : 'Couldn’t update the ad blocker', {id: s});
    }
  },
  filterCount = t => (t === 1 ? '1 filter configured' : `${t} filters configured`) /** The ad blocker’s status line. */,
  adblockStatus = (t, r) => {
    if (!t) return 'Loading…';
    if (!t.available) return 'The ad blocker needs a newer version of Aux.';
    if (!t.stateLoaded) return 'Starting…';
    if (t.compiling) return 'Applying filters…';
    if (t.activeUpdateJobIds.length > 0) return 'Updating filters…';
    if (!t.enabled) return 'Browse with more privacy and fewer distractions.';
    if (!r?.length) return 'Please set up filters to start service.';
    const s = Math.max(0, ...r.map(a => a.lastSuccessfulCheckMs));
    return s
      ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {children: ['Last updated ', (0, jsxRuntime.jsx)(at, {datetime: s})]})
      : 'Not updated yet';
  },
  DATA_TYPES = {
    'browsing-history': 'history',
    cookies: 'cookies',
    cache: 'cache',
    downloads: 'downloads',
    'form-data': 'formData',
  },
  SITE_STORAGE = [
    'cacheStorage',
    'fileSystems',
    'indexedDB',
    'localStorage',
    'serviceWorkers',
    'webSQL',
  ] /** Browsing-data details, third-party cookies, and deleting and changing them. */,
  privacyQueries = {
    browsingDataDetails: t =>
      N({
        queryKey: [{scope: 'settings', page: 'security', query: 'browsing-data-details', period: t}],
        queryFn: () => browsingDataDetails(t),
      }),
    thirdPartyCookies: () =>
      N({
        queryKey: [{scope: 'settings', page: 'security', query: 'third-party-cookies'}],
        queryFn: readThirdPartyCookies,
      }),
    deleteBrowsingData: () => ({mutationFn: deleteBrowsingData}),
    setThirdPartyCookies: () => ({mutationFn: writeThirdPartyCookies}),
  }; /** What deleting would remove for a period: sites in history, sites with cookies, downloads. */
async function browsingDataDetails(t) {
  const r = periodStart(t),
    s = await Promise.all([
      historyDetail(r).catch(() => null),
      cookiesDetail().catch(() => null),
      downloadsDetail(r).catch(() => null),
    ]);
  return Object.fromEntries(s.filter(a => a !== null));
}
async function historyDetail(t) {
  if (typeof chrome > 'u' || !chrome.history?.search) return null;
  const r = await chrome.history.search({text: '', startTime: t, maxResults: 1e4}),
    s = Array.from(
      new Set(
        r.flatMap(o => {
          if (!o.url) return [];
          try {
            return [new URL(o.url).hostname.replace(/^www\./, '')];
          } catch {
            return [];
          }
        }),
      ),
    ),
    a = s[0];
  return a
    ? s.length === 1
      ? ['browsing-history', `From ${a}`]
      : ['browsing-history', `From ${s.length} sites`]
    : ['browsing-history', 'No browsing history'];
}
async function cookiesDetail() {
  if (typeof chrome > 'u' || !chrome.cookies?.getAll) return null;
  const t = await chrome.cookies.getAll({}),
    r = new Set(t.map(s => s.domain.replace(/^\./, '').replace(/^www\./, '')));
  return ['cookies', r.size === 0 ? 'No site data' : `From ${r.size} sites`];
}
async function downloadsDetail(t) {
  if (typeof chrome > 'u' || !chrome.downloads?.search) return null;
  const r = await chrome.downloads.search(t === void 0 ? {} : {startedAfter: new Date(t).toISOString()});
  return ['downloads', `${r.length} ${r.length === 1 ? 'item' : 'items'}`];
} /** Deletes the chosen kinds of browsing data since the period’s start. */
async function deleteBrowsingData(t) {
  if (typeof chrome > 'u' || !chrome.browsingData?.remove)
    throw new Error('Browsing data can only be deleted from the extension.');
  const r = t.items.reduce((a, o) => {
      if (o === 'site-data') {
        for (const l of SITE_STORAGE) a[l] = true;
        return a;
      }
      return ((a[DATA_TYPES[o]] = true), a);
    }, {}),
    s = periodStart(t.period);
  await chrome.browsingData.remove(s === void 0 ? {} : {since: s}, r);
}
async function readThirdPartyCookies() {
  if (typeof chrome < 'u' && chrome.privacy?.websites?.thirdPartyCookiesAllowed) {
    const t = await readSetting(chrome.privacy.websites.thirdPartyCookiesAllowed);
    return {value: t.value ? 'allow' : 'block', levelOfControl: t.levelOfControl, isAvailable: true};
  }
  return await ye({method: 'Aux.getThirdPartyCookies', params: {}});
}
async function writeThirdPartyCookies(t) {
  if (typeof chrome < 'u' && chrome.privacy?.websites?.thirdPartyCookiesAllowed) {
    await writeSetting(chrome.privacy.websites.thirdPartyCookiesAllowed, t === 'allow');
    return;
  }
  await ye({method: 'Aux.setThirdPartyCookies', params: {value: t}});
}
function periodStart(t) {
  return t === 'all' ? void 0 : Date.now() - Number(t) * 60 * 1e3;
}
function readSetting(t) {
  return new Promise((r, s) => {
    t.get({}, a => {
      const o = chrome.runtime.lastError;
      if (o) {
        s(new Error(o.message));
        return;
      }
      r(a);
    });
  });
}
function writeSetting(t, r) {
  return new Promise((s, a) => {
    t.set({value: r}, () => {
      const o = chrome.runtime.lastError;
      if (o) {
        a(new Error(o.message));
        return;
      }
      s();
    });
  });
}
var /** The Delete browsing data dialog. */
  DeleteBrowsingDataDialog = () => {
    const t = (0, React.useRef)(null),
      r = A(),
      s = J(privacyQueries.deleteBrowsingData()),
      a = ve({
        mode: 'all',
        reValidateMode: 'onChange',
        resolver: Ce(deleteForm),
        defaultValues: {period: 'all', items: DATA_KINDS.map(i => i.value)},
      }),
      o = async i => {
        try {
          (await s.mutateAsync(i),
            g.success('Browsing data deleted.'),
            await r.invalidateQueries({queryKey: privacyQueries.browsingDataDetails(l).queryKey}),
            t.current?.click());
        } catch (u) {
          g.error(u instanceof Error ? u.message : 'Failed to delete browsing data.');
        }
      },
      l = a.watch('period'),
      c = a.watch('items'),
      m = !(typeof chrome < 'u' && chrome.browsingData?.remove) || Object.keys(a.formState.errors).length > 0;
    return (0, jsxRuntime.jsxs)(we, {
      ...a,
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'scroll-fade-effect-y max-h-84 space-y-4 overflow-y-auto px-6 py-5',
          children: [
            (0, jsxRuntime.jsxs)(et, {
              children: [
                (0, jsxRuntime.jsx)(st, {children: 'Delete browsing data'}),
                (0, jsxRuntime.jsx)(Ge, {
                  children: 'This will delete your browsing data, including history, cookies, cache, and more.',
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('form', {
              id: 'delete-browsing-history-form',
              className: 'space-y-4',
              onSubmit: a.handleSubmit(o),
              children: [
                (0, jsxRuntime.jsxs)(B, {
                  children: [
                    (0, jsxRuntime.jsx)(I, {htmlFor: 'delete-browsing-history-period', children: 'Period'}),
                    (0, jsxRuntime.jsxs)(De, {
                      value: a.watch('period'),
                      onValueChange: i => {
                        a.setValue('period', i, {shouldDirty: true, shouldValidate: true});
                      },
                      children: [
                        (0, jsxRuntime.jsx)(ke, {
                          id: 'delete-browsing-history-period',
                          children: (0, jsxRuntime.jsx)(Fe, {placeholder: 'Select..'}),
                        }),
                        (0, jsxRuntime.jsx)(Se, {
                          children: PERIODS.map(i =>
                            (0, jsxRuntime.jsxs)(
                              React.Fragment,
                              {
                                children: [
                                  (0, jsxRuntime.jsx)(G, {value: i.value, children: i.label}),
                                  i.value === 'all' && (0, jsxRuntime.jsx)(Ct, {}),
                                ],
                              },
                              i.value,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)(it, {
                  className: 'gap-3',
                  children: [
                    (0, jsxRuntime.jsx)(mt, {className: 'm-0', variant: 'label', children: 'Items to delete'}),
                    DATA_KINDS.map(i =>
                      (0, jsxRuntime.jsxs)(
                        B,
                        {
                          orientation: 'horizontal',
                          children: [
                            (0, jsxRuntime.jsx)(Rt, {
                              id: i.value,
                              name: i.value,
                              checked: c.includes(i.value),
                              onCheckedChange: u => {
                                const x = new Set(a.getValues('items'));
                                (u ? x.add(i.value) : x.delete(i.value),
                                  a.setValue('items', [...x], {shouldDirty: true, shouldValidate: true}));
                              },
                            }),
                            (0, jsxRuntime.jsx)(ct, {
                              className: 'gap-0',
                              children: (0, jsxRuntime.jsxs)(I, {
                                htmlFor: i.value,
                                children: [i.label, (0, jsxRuntime.jsx)(DataDetail, {value: i.value})],
                              }),
                            }),
                          ],
                        },
                        i.value,
                      ),
                    ),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)(tt, {
          className: 'm-0 pt-0',
          children: [
            (0, jsxRuntime.jsx)(Ye, {ref: t, children: 'Cancel'}),
            (0, jsxRuntime.jsxs)(Qe, {
              type: 'submit',
              variant: 'destructive',
              form: 'delete-browsing-history-form',
              disabled: m || s.isPending,
              children: [s.isPending && (0, jsxRuntime.jsx)(T, {}), (0, jsxRuntime.jsx)('span', {children: 'Delete'})],
            }),
          ],
        }),
      ],
    });
  },
  DataDetail = ({value}) => {
    const r = L().watch('period'),
      s = A(),
      {data} = j(privacyQueries.browsingDataDetails(r));
    (0, React.useEffect)(
      () => () => {
        s.removeQueries({queryKey: privacyQueries.browsingDataDetails(r).queryKey});
      },
      [r, s],
    );
    const o = data?.[value];
    return o
      ? (0, jsxRuntime.jsxs)(Lt, {
          children: [
            (0, jsxRuntime.jsx)(At, {
              children: (0, jsxRuntime.jsx)(vt, {className: 'text-muted-foreground -ml-1 size-3'}),
            }),
            (0, jsxRuntime.jsx)(Tt, {children: o}),
          ],
        })
      : null;
  },
  deleteForm = Y({
    period: le(['all', '15', '30', '1440', '10080', '40320']),
    items: Mt(le(['browsing-history', 'cookies', 'cache', 'downloads', 'form-data', 'site-data'])).min(
      1,
      'At least one item must be selected',
    ),
  }),
  PERIODS = [
    {value: 'all', label: 'All time'},
    {value: '15', label: 'Last 15 min'},
    {value: '30', label: 'Last 30 min'},
    {value: '1440', label: 'Last 24 hours'},
    {value: '10080', label: 'Last 7 days'},
    {value: '40320', label: 'Last 4 weeks'},
  ],
  DATA_KINDS = [
    {value: 'browsing-history', label: 'Browsing history'},
    {value: 'cookies', label: 'Cookies and other site data'},
    {value: 'cache', label: 'Cached images and files'},
    {value: 'downloads', label: 'Download history'},
    {value: 'form-data', label: 'Autofill form data'},
    {value: 'site-data', label: 'Site storage'},
  ]; /** The Security & Privacy page. */
function pr() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(zt, {segments: ['Settings', 'Security & Privacy']}),
      (0, jsxRuntime.jsx)(Ht, {children: (0, jsxRuntime.jsx)('h1', {children: 'Security & Privacy'})}),
      (0, jsxRuntime.jsxs)('div', {
        className: 'space-y-8',
        children: [
          (0, jsxRuntime.jsx)(Z, {
            title: 'Browsing history',
            children: (0, jsxRuntime.jsxs)(q, {
              children: [(0, jsxRuntime.jsx)(DeleteBrowsingDataRow, {}), (0, jsxRuntime.jsx)(HistoryRow, {})],
            }),
          }),
          (0, jsxRuntime.jsx)(AdBlockerSection, {}),
          (0, jsxRuntime.jsxs)(Z, {
            title: 'Privacy',
            children: [
              (0, jsxRuntime.jsxs)(q, {
                children: [(0, jsxRuntime.jsx)(ThirdPartyCookiesRow, {}), (0, jsxRuntime.jsx)(CrashReportsRow, {})],
              }),
              (0, jsxRuntime.jsxs)(q, {
                children: [
                  (0, jsxRuntime.jsxs)(O, {
                    render: (0, jsxRuntime.jsx)(P, {className: 'group', to: 'aux://settings/content'}),
                    children: [
                      (0, jsxRuntime.jsx)(C, {
                        title: 'Site settings',
                        description: 'Manage site permissions (location, camera, pop-ups, and more)',
                      }),
                      (0, jsxRuntime.jsx)(E, {className: 'text-muted-foreground mx-1 size-4'}),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)(O, {
                    render: (0, jsxRuntime.jsx)(P, {className: 'group', to: 'aux://settings/security'}),
                    children: [
                      (0, jsxRuntime.jsx)(C, {
                        title: 'Advanced',
                        description: 'Manage DNS, SSL certificates and Safe Browsing settings',
                      }),
                      (0, jsxRuntime.jsx)(E, {className: 'text-muted-foreground mx-1 size-4'}),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
var DeleteBrowsingDataRow = () =>
    (0, jsxRuntime.jsxs)(R, {
      className: 'gap-1',
      children: [
        (0, jsxRuntime.jsx)(pt, {className: 'text-muted-foreground mx-1 size-5'}),
        (0, jsxRuntime.jsx)(C, {
          title: 'Delete browsing history',
          description: 'Delete history, cookies, cache, and more',
        }),
        (0, jsxRuntime.jsx)(H, {
          children: (0, jsxRuntime.jsxs)(Je, {
            children: [
              (0, jsxRuntime.jsx)(We, {render: (0, jsxRuntime.jsx)(F, {variant: 'destructive'}), children: 'Delete'}),
              (0, jsxRuntime.jsx)(dt, {
                className: 'gap-2 p-0 text-left',
                children: (0, jsxRuntime.jsx)(DeleteBrowsingDataDialog, {}),
              }),
            ],
          }),
        }),
      ],
    }),
  HistoryRow = () =>
    (0, jsxRuntime.jsxs)(O, {
      className: 'gap-1',
      render: (0, jsxRuntime.jsx)(P, {className: 'group', to: 'aux://history/'}),
      children: [
        (0, jsxRuntime.jsx)(St, {className: 'text-muted-foreground mx-1 size-5'}),
        (0, jsxRuntime.jsx)(C, {title: 'View browsing history'}),
        (0, jsxRuntime.jsx)(E, {className: 'text-muted-foreground mx-1 size-4'}),
      ],
    }) /** Send crash reports. */,
  CrashReportsRow = () => {
    const t = A(),
      r = globalThis.chrome?.auxBrowserPreferences,
      k = ['browserPreferences', 'crashReports'],
      {data} = j({queryKey: k, queryFn: () => r.getCrashReports(), enabled: typeof r?.getCrashReports === 'function'}),
      a = J({
        mutationFn: async l => (await r.setCrashReports(l), l),
        onSuccess: () => t.invalidateQueries({queryKey: k}),
        onError: l => {
          g.error(l instanceof Error ? l.message : 'Couldn’t save your crash report choice.');
        },
      });
    if (!data?.available) return null;
    return (0, jsxRuntime.jsxs)(R, {
      children: [
        (0, jsxRuntime.jsx)(C, {
          title: 'Send crash reports',
          description:
            'When Aux quits unexpectedly, send a technical report of the crash. Never your pages, passwords or files.',
        }),
        (0, jsxRuntime.jsx)(H, {
          children: (0, jsxRuntime.jsx)(Ae, {
            checked: !!data.enabled,
            disabled: a.isPending,
            onCheckedChange: l => a.mutate(l),
          }),
        }),
      ],
    });
  } /** Allow or block third-party cookies. */,
  ThirdPartyCookiesRow = () => {
    const t = A(),
      {isError, isLoading, data} = j(privacyQueries.thirdPartyCookies()),
      o = J(privacyQueries.setThirdPartyCookies()),
      l = i => {
        i &&
          o.mutate(i, {
            onSuccess: async () => {
              (g.success('Third-party cookie setting updated.'),
                await t.invalidateQueries({queryKey: privacyQueries.thirdPartyCookies().queryKey}));
            },
            onError: u => {
              g.error(u instanceof Error ? u.message : 'Failed to update cookie settings.');
            },
          });
      },
      c = isError || data?.isAvailable === false,
      m = ['controllable_by_this_extension', 'controlled_by_this_extension'].includes(data?.levelOfControl ?? '');
    return (0, jsxRuntime.jsxs)(R, {
      children: [
        (0, jsxRuntime.jsx)(C, {
          title: 'Allow third-party cookies',
          description: 'Used for embedded content, ads, and tracking by websites.',
        }),
        (0, jsxRuntime.jsx)(H, {
          children: (0, jsxRuntime.jsxs)(De, {
            value: data?.value ?? null,
            disabled: c || isLoading || o.isPending || !m,
            onValueChange: l,
            children: [
              (0, jsxRuntime.jsxs)(ke, {
                className: 'w-32',
                children: [
                  (0, jsxRuntime.jsx)(Fe, {placeholder: isLoading ? 'Loading…' : '-'}),
                  o.isPending && (0, jsxRuntime.jsx)(T, {}),
                ],
              }),
              (0, jsxRuntime.jsxs)(Se, {
                children: [
                  (0, jsxRuntime.jsx)(G, {value: 'allow', children: 'Allow'}),
                  (0, jsxRuntime.jsx)(G, {value: 'block', children: 'Block all'}),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  };
