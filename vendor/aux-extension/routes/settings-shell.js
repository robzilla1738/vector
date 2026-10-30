/* Aux-owned source: the Settings shell (assets/route-TQyeTEXE.js, Xe exported as component): the
 * left column with settings search and the page menu, and the page outlet beside it. This block
 * starts inside the chunk's `var` list, right after the menu (y) and the search index (q2), which
 * stay supplied because the polish and agent edits rewrite their entries.
 *
 * Chunk names used: t JSX runtime, h React, E cn, y the menu sections, q2 the search index,
 * W requestSettingsFocus, U2 useSettingsFocus; imports O useApp, F useRouter, A useTRPC, V useQuery,
 * g1 useSuspenseQuery, Z useMatchRoute, T Link, a2 external link, o2 chrome:// link, m Button,
 * _ Badge, p1 InputGroup, c1 InputGroupAddon, f1 InputGroupInput, $1 search icon, Z1 arrow-up-right,
 * T1 puzzle icon, Y1 ScrollArea, G1 Tooltip, U1 TooltipTrigger, q1 TooltipContent, U motion,
 * q AnimatePresence, z1 isEmbedded, i1 the page provider, n2 SessionListSubscriptionHandler,
 * o1 the settings toaster, t1 Outlet. */
EXTERNAL_LINKS = [{label: 'Extensions', icon: T1, kind: 'chrome', to: 'chrome://extensions'}],
  MENU_ITEM = 'h-8 text-muted-foreground data-[active=true]:[&_svg]:text-primary data-[active=true]:bg-muted! data-[active=true]:text-foreground click-depth-effect-slightly w-full justify-start text-left',
  MENU_ITEM_MOTION = {duration: 0.16, ease: 'easeOut'},
  // The left column: search on top (results float over the menu), the scrolling menu below.
  SettingsSidebar = () => {
    const {accountId} = O();
    const router = F();
    const trpc = A();
    const {data: account} = V(trpc.accounts.get.queryOptions({accountId}));
    const signedIn = account?.mode === 'cloud' && account.authStatus !== 'paused';
    const [query, setQueryState] = (0, h.useState)('');
    const [selectedIndex, setSelectedIndex] = (0, h.useState)(0);
    (0, h.useEffect)(() => router.subscribe('onBeforeNavigate', () => setQueryState('')), [router]);
    const hasQuery = query.trim().length > 0;
    const results = (0, h.useMemo)(() => hasQuery ? searchSettings(query, signedIn) : [], [hasQuery, signedIn, query]);
    const setQuery = value => {
      setQueryState(value), setSelectedIndex(0);
    };
    const openResult = result => {
      setQuery('');
      const path = result.path.replace('$userId', `${accountId}`);
      result.kind !== 'page' && W({kind: result.kind, title: result.title, path}), router.history.push(path);
    };
    const handleKeyDown = event => {
      if (results.length !== 0) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const step = event.key === 'ArrowDown' ? 1 : -1;
          setSelectedIndex(index => (index + step + results.length) % results.length);
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          const result = results[selectedIndex];
          result && openResult(result);
        }
      }
    };
    return (0, t.jsxs)('aside', {
      className: 'relative flex h-full w-[clamp(9rem,30vw,13rem)] shrink-0 flex-col py-1 pr-0 pl-1.5',
      children: [
        (0, t.jsxs)('div', {
          className: 'group/search relative z-50 shrink-0',
          children: [
            (0, t.jsx)(SettingsSearchField, {query, hasQuery, selectedResultId: results[selectedIndex]?.id, onKeyDown: handleKeyDown, onQueryChange: setQuery}),
            hasQuery && (0, t.jsx)('div', {
              className: 'bg-popover border-glass absolute top-full left-1 mt-1 hidden w-56 overflow-hidden rounded-xl p-1 shadow-xl group-focus-within/search:block',
              onMouseDown: event => event.preventDefault(),
              children: (0, t.jsx)(SettingsSearchResults, {results, selectedIndex, onActivate: openResult, onSelect: setSelectedIndex}),
            }),
          ],
        }),
        (0, t.jsx)(Y1, {
          className: 'min-h-0 flex-1 **:data-[slot=scroll-area-scrollbar]:hidden',
          children: (0, t.jsx)(h.Suspense, {children: (0, t.jsx)(SettingsMenu, {accountId})}),
        }),
      ],
    });
  },
  // Escape clears the query, or leaves the field when it is already empty.
  SettingsSearchField = ({query, hasQuery, selectedResultId, onQueryChange, onKeyDown}) => {
    const input = (0, h.useRef)(null);
    const handleChange = event => {
      onQueryChange(event.currentTarget.value);
    };
    const handleKeyDown = event => {
      if (!event.nativeEvent.isComposing) {
        if (event.key === 'Escape') {
          event.preventDefault(), query ? onQueryChange('') : input.current?.blur();
          return;
        }
        onKeyDown(event);
      }
    };
    return (0, t.jsxs)(p1, {
      className: 'bg-surface-primary mb-3 h-8 shadow-xs',
      children: [
        (0, t.jsx)(c1, {align: 'inline-start', children: (0, t.jsx)($1, {className: 'size-4'})}),
        (0, t.jsx)(f1, {
          ref: input,
          value: query,
          'aria-activedescendant': selectedResultId,
          'aria-controls': hasQuery ? 'settings-search-results' : void 0,
          'aria-expanded': hasQuery,
          'aria-label': 'Search settings',
          role: 'combobox',
          placeholder: 'Search…',
          onChange: handleChange,
          onKeyDown: handleKeyDown,
        }),
      ],
    });
  },
  SettingsSearchResults = ({results, selectedIndex, onActivate, onSelect}) => {
    const list = (0, h.useRef)(null);
    return (0, h.useEffect)(() => {
      list.current?.querySelector('[data-selected="true"]')?.scrollIntoView({block: 'nearest'});
    }, [selectedIndex]), results.length === 0
      ? (0, t.jsx)('p', {className: 'text-muted-foreground px-3 py-6 text-center text-sm', children: 'No settings found'})
      : (0, t.jsx)('ul', {
        id: 'settings-search-results',
        ref: list,
        'aria-label': 'Settings search results',
        role: 'listbox',
        className: 'max-h-80 overflow-y-auto overscroll-contain',
        children: results.map((result, index) => (0, t.jsx)(SettingsSearchResult, {result, index, selectedIndex, onActivate, onSelect}, result.id)),
      });
  },
  SettingsSearchResult = ({result, index, selectedIndex, onActivate, onSelect}) => {
    const selected = index === selectedIndex;
    return (0, t.jsx)('li', {
      role: 'option',
      'aria-selected': selected,
      children: (0, t.jsx)(m, {
        id: result.id,
        className: E('h-auto min-h-10 items-start gap-0 py-1.5', selected && 'bg-muted! text-foreground', MENU_ITEM),
        'data-selected': selected,
        nativeButton: true,
        size: 'lg',
        variant: 'ghost',
        onClick: bind(onActivate, result),
        onFocus: bind(onSelect, index),
        onMouseEnter: bind(onSelect, index),
        children: (0, t.jsxs)('span', {
          className: 'min-w-0',
          children: [
            (0, t.jsx)('span', {className: 'text-foreground block truncate text-[13px] leading-4', children: result.title}),
            result.breadcrumb && (0, t.jsx)('span', {className: 'text-muted-foreground block truncate text-[11px] leading-4', children: result.breadcrumb}),
          ],
        }),
      }),
    });
  },
  // The menu: each section's visible items (sign-in, internal and platform gates), then external links.
  SettingsMenu = ({accountId}) => {
    const trpc = A();
    const {data: account} = g1(trpc.accounts.get.queryOptions({accountId}));
    const {data: canSeeExperimental = false} = V(trpc.analytics.isExperimentalEligible.queryOptions({accountId}));
    const signedIn = account?.mode === 'cloud' && account.authStatus !== 'paused';
    return (0, t.jsxs)('nav', {
      className: 'flex flex-col gap-3 pb-10',
      children: [
        y.map(section => (0, t.jsxs)('div', {
          children: [
            (0, t.jsx)('h5', {className: 'text-muted-foreground font-display px-2.5 pb-1 text-[13px] font-[450] select-none', children: section.title}),
            (0, t.jsx)('ul', {
              children: section.items.map(item => item.requiresSignIn && !signedIn || item.internalOnly && !canSeeExperimental || item.shouldShow?.() === false
                ? null
                : (0, t.jsx)(SettingsMenuEntry, {accountId, canSeeExperimental, item}, item.label)),
            }),
          ],
        }, section.title)),
        (0, t.jsxs)('ul', {children: [EXTERNAL_LINKS.map(link => (0, t.jsx)(SettingsExternalLink, {link}, link.label))]}),
      ],
    });
  },
  // An item, and while its submenu is collapsed, the children it promotes to the top level.
  SettingsMenuEntry = ({accountId, canSeeExperimental, item}) => {
    const matchRoute = Z();
    const submenu = visibleChildren(item, canSeeExperimental);
    const expanded = isExpanded(item, submenu, matchRoute, `${accountId}`);
    const promoted = expanded ? [] : submenu?.filter(child => child.promoteWhenCollapsed) ?? [];
    return (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsx)('li', {children: (0, t.jsx)(SettingsMenuItem, {accountId, isExpanded: expanded, item, submenu})}),
        (0, t.jsx)(q, {
          initial: false,
          children: promoted.map(child => (0, t.jsx)(U.li, {
            initial: {height: 0, opacity: 0},
            animate: {height: 'auto', opacity: 1},
            exit: {height: 0, opacity: 0},
            transition: MENU_ITEM_MOTION,
            className: 'overflow-hidden',
            children: (0, t.jsx)(SettingsMenuItem, {accountId, item: child}),
          }, child.label)),
        }),
      ],
    });
  },
  // A menu link; an item with a submenu is never itself active, its children are.
  SettingsMenuItem = ({accountId, isExpanded = false, item, submenu}) => {
    const matchRoute = Z();
    const userId = `${accountId}`;
    const exact = item.exact !== false;
    const active = !!(!submenu?.length && (matchRoute({to: item.href, params: {userId}, fuzzy: !exact})
      || item.expansionHref && matchRoute({to: item.expansionHref, params: {userId}, fuzzy: true})));
    const Icon = active && item.activeIcon ? item.activeIcon : item.icon;
    return (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsxs)(TruncationTooltipButton, {
          label: item.label,
          className: MENU_ITEM,
          'data-active': active || void 0,
          nativeButton: false,
          size: 'lg',
          variant: 'ghost',
          render: (0, t.jsx)(T, {to: item.href, params: {userId}, activeOptions: {exact}, activeProps: submenu?.length ? {className: ''} : void 0}),
          children: [
            (0, t.jsx)(Icon, {'data-icon': 'inline-start'}),
            (0, t.jsx)('span', {className: 'grow truncate', children: item.label}),
            item.badge && (0, t.jsx)(_, {size: 'sm', className: 'bg-brand/10 text-brand-content dark:bg-brand/20 -mr-1', children: item.badge}),
          ],
        }),
        (0, t.jsx)(q, {
          initial: false,
          children: isExpanded && submenu && (0, t.jsx)(U.ul, {
            className: 'before:bg-border relative overflow-hidden before:pointer-events-none before:absolute before:inset-y-px before:left-4 before:z-10 before:w-px',
            initial: {height: 0, opacity: 0},
            animate: {height: 'auto', opacity: 1},
            exit: {height: 0, opacity: 0},
            transition: MENU_ITEM_MOTION,
            children: submenu.map(child => (0, t.jsx)('li', {children: (0, t.jsx)(SettingsSubmenuItem, {accountId, item: child})}, child.label)),
          }, item.label),
        }),
      ],
    });
  },
  // A submenu link, indented along the submenu's guide line.
  SettingsSubmenuItem = ({accountId, item}) => {
    const matchRoute = Z();
    const userId = `${accountId}`;
    const active = !!matchRoute({to: item.href, params: {userId}, fuzzy: false});
    const Icon = active ? item.activeIcon : item.icon;
    return (0, t.jsxs)(TruncationTooltipButton, {
      label: item.label,
      className: E(MENU_ITEM, 'relative has-data-[icon=inline-start]:pl-8 **:data-icon:relative **:data-icon:z-20'),
      'data-active': active || void 0,
      nativeButton: false,
      size: 'lg',
      variant: 'ghost',
      render: (0, t.jsx)(T, {to: item.href, params: {userId}, activeOptions: {exact: true}}),
      children: [
        (0, t.jsx)(Icon, {'data-icon': 'inline-start'}),
        (0, t.jsx)('span', {className: 'relative z-20 grow truncate', children: item.label}),
        item.badge && (0, t.jsx)(_, {size: 'sm', className: 'bg-brand/10 text-brand-content dark:bg-brand/20 relative z-20 -mr-1', children: item.badge}),
      ],
    });
  },
  // A menu button whose tooltip shows its label only when the label is cut off.
  TruncationTooltipButton = ({label, children, ...props}) => (0, t.jsxs)(G1, {
    onOpenChange: (open, details) => {
      const text = details.trigger?.querySelector('span.truncate');
      open && text && text.scrollWidth <= text.clientWidth && details.cancel();
    },
    children: [
      (0, t.jsx)(U1, {tabIndex: 0, render: (0, t.jsx)(m, {...props}), children}),
      (0, t.jsx)(q1, {side: 'right', children: label}),
    ],
  }),
  SettingsExternalLink = ({link}) => {
    const Icon = link.icon;
    return (0, t.jsx)('li', {
      children: (0, t.jsxs)(m, {
        className: MENU_ITEM,
        nativeButton: false,
        size: 'lg',
        variant: 'ghost',
        render: link.kind === 'chrome' ? (0, t.jsx)(o2, {to: link.to}) : (0, t.jsx)(a2, {to: link.to}),
        children: [
          (0, t.jsx)(Icon, {'data-icon': 'inline-start'}),
          (0, t.jsx)('span', {className: 'grow', children: link.label}),
          (0, t.jsx)(Z1, {className: 'text-muted-foreground', 'data-icon': 'inline-end'}),
        ],
      }),
    });
  },
  visibleChildren = (item, canSeeExperimental) => item.children?.filter(child => !child.internalOnly || canSeeExperimental),
  isExpanded = (item, submenu, matchRoute, userId) => {
    const target = {to: item.expansionHref ?? item.href, params: {userId}, fuzzy: true};
    return !!(submenu?.length && (matchRoute(target) || matchRoute({...target, pending: true})));
  },
  bind = (handler, value) => () => {
    handler(value);
  },
  isGated = item => !!(item.internalOnly || item.eapOnly),
  // Search: every word must hit; page titles weigh most, then sections, then fields and their
  // descriptions and search terms. Hidden and gated pages never show. The top twelve, best first.
  searchSettings = (query, signedIn) => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const hiddenPaths = y.flatMap(section => section.items).filter(item => item.shouldShow?.() === false || item.requiresSignIn && !signedIn).map(item => item.href);
    const gatedPaths = y.flatMap(section => section.items).flatMap(item => [...isGated(item) ? [item.href] : [], ...item.children?.filter(isGated).map(child => child.href) ?? []]);
    const results = [];
    let order = 0;
    for (const page of q2) {
      if (gatedPaths.some(path => page.path === path || page.path.startsWith(`${path}/`)) || hiddenPaths.some(path => page.path === path || page.path.startsWith(`${path}/`))) continue;
      const pageScore = scoreWords(words, [{text: page.title, weight: 3}]);
      pageScore !== null && results.push({id: `${page.path}:page`, path: page.path, title: page.title, kind: 'page', score: pageScore, order});
      order += 1;
      page.sections.forEach((section, index) => {
        const score = scoreWords(words, [{text: section, weight: 3}, {text: page.title, weight: 1.5}]);
        score !== null && results.push({id: `${page.path}:section:${index}`, path: page.path, title: section, kind: 'section', breadcrumb: page.title, score, order});
        order += 1;
      });
      page.fields.forEach((field, index) => {
        const score = scoreWords(words, [
          {text: field.title, weight: 3},
          {text: page.title, weight: 1.5},
          {text: 'description' in field ? field.description ?? '' : '', weight: 1},
          ...('searchTerms' in field ? field.searchTerms ?? [] : []).map(term => ({text: term, weight: 2})),
        ]);
        score !== null && results.push({id: `${page.path}:field:${index}`, path: page.path, title: field.title, kind: 'field', breadcrumb: page.title, score, order});
        order += 1;
      });
    }
    return results.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, 12);
  },
  // Each word takes its best weighted match among the texts; a word that matches none fails the entry.
  scoreWords = (words, texts) => {
    let total = 0;
    for (const word of words) {
      let best = 0;
      for (const text of texts) best = Math.max(best, scoreText(text.text, word) * text.weight);
      if (best === 0) return null;
      total += best;
    }
    return total;
  },
  // Exact > whole word > prefix (shorter texts first) > word prefix > substring (earlier first).
  scoreText = (text, word) => {
    const normalized = normalize(text);
    if (!normalized) return 0;
    if (normalized === word) return 120;
    const textWords = normalized.split(/\s+/);
    if (textWords.includes(word)) return 105;
    if (normalized.startsWith(word)) return 90 - Math.min(normalized.length - word.length, 20) * 0.25;
    if (textWords.some(textWord => textWord.startsWith(word))) return 80;
    const at = normalized.indexOf(word);
    return at >= 0 ? 65 - Math.min(at, 20) * 0.5 : 0;
  },
  normalize = text => text.normalize('NFD').replace(new RegExp('\\p{M}', 'gu'), '').toLocaleLowerCase().trim();

/** The Settings route: the menu column (not when embedded) beside the page. */
function Xe() {
  const embedded = z1();
  return U2(), (0, t.jsxs)(i1, {
    children: [
      (0, t.jsx)(n2, {}),
      (0, t.jsx)(o1, {}),
      (0, t.jsxs)('div', {
        className: 'flex h-dvh w-full',
        children: [!embedded && (0, t.jsx)(SettingsSidebar, {}), (0, t.jsx)('div', {className: 'min-w-0 grow', children: (0, t.jsx)(t1, {})})],
      }),
    ],
  });
}
