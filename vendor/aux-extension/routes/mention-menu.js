/* Aux-owned source: the composer's mention menu (assets/provider-Cw0zhujt.js, fo through xo): the slash
 * command loader, a tab's candidate, the ghost text for a slash command's arguments, and the list:
 * its groups, arrow keys and Enter, and the rows with favicon or type icon.
 * Names the rest of the chunk uses keep their chunk names: fo the loader, sn the tab candidate, ho a missing
 * extension, Uc/Kc the feedback event and schema, zc the ghost text, yo the menu (exported).
 * Chunk names used: c React, r JSX runtime, L cn, jt ranks candidates, Br a URL's host, xa/wa/va/Sa
 * command icons, M/w schema, ca/oa/la/da editor extension, Fn the ghost extension's name, ta a command's
 * hint, Ma group by, ha match on a value, Qs/gr/Ss the type icons. */
/** Loads the slash commands and skills. */
  fo = async ({commandCandidates, query, runtime}) =>
    jt(query, {items: []}, runtime.mention.includeSkills ? {items: runtime.mention.skills} : {items: []}, runtime, {
      commandCandidates,
    }),
  /** A tab as a mention candidate. */
  sn = (tab, source, groupLabel) => {
    const host = Br(tab.url);
    return {
      description: host || tab.url,
      groupLabel,
      icon: tab.faviconUrl,
      id: tab.id,
      isActive: tab.isActive,
      keywords: [tab.label, tab.url, host],
      name: tab.label,
      source,
      targetId: tab.targetId,
      type: 'tab',
      url: tab.url,
    };
  },
  /** Whether a failed tab list only means the extension is not connected. */
  ho = error => {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('Chrome extension not connected') || message.includes('Extension not connected');
  },
  /** The slash command icons. */
  COMMAND_ICONS = {clear: xa, compact: wa, feedback: va, new: Sa},
  /** A slash command's icon. */
  commandIcon = command => COMMAND_ICONS[command],
  /** The event that opens the feedback dialog. */
  Uc = '@browser-aux/session-feedback/open',
  /** Its payload. */
  Kc = M({sessionId: w().min(1), comment: w().optional()}),
  /** Shows a slash command's argument hint after the text. */
  zc = () =>
    (0, c.useMemo)(
      () => [
        ca.create({
          name: Fn,
          addProseMirrorPlugins() {
            return [
              new oa({
                props: {
                  decorations: state => {
                    const text = state.doc.textContent,
                      hint = ta(text);
                    return hint
                      ? la.create(state.doc, [
                          da.widget(
                            state.doc.content.size - 1,
                            () => {
                              const element = document.createElement('span');
                              return (
                                (element.className =
                                  'pointer-events-none text-[color:var(--editor-text-muted)] opacity-60'),
                                (element.textContent = text.endsWith(' ') ? hint : ` ${hint}`),
                                element
                              );
                            },
                            {side: 1},
                          ),
                        ])
                      : null;
                  },
                },
              }),
            ];
          },
        }),
      ],
      [],
    ),
  /** The mention menu: its groups and keyboard selection. */
  yo = ({command, error, isInteractionBlocked, items = [], ref}) => {
    const listRef = (0, c.useRef)(null),
      selectedRef = (0, c.useRef)(0),
      [selectedIndex, setSelectedIndex] = (0, c.useState)(0),
      groups = (0, c.useMemo)(
        () =>
          Object.entries(Ma(items, value => value.groupLabel)).map(([value, item]) => ({label: value, items: item})),
        [items],
      ),
      flatItems = (0, c.useMemo)(() => groups.flatMap(value => value.items), [groups]);
    if (
      ((0, c.useEffect)(() => {
        ((selectedRef.current = 0), setSelectedIndex(0));
      }, [items]),
      (0, c.useEffect)(() => {
        listRef.current?.querySelector(`[data-mention-index="${selectedIndex}"]`)?.scrollIntoView({block: 'nearest'});
      }, [selectedIndex]),
      (0, c.useImperativeHandle)(ref, () => ({
        onKeyDown: ({event: value}) => {
          if (isInteractionBlocked()) return false;
          if (value.key === 'ArrowDown' || value.key === 'ArrowUp') {
            value.preventDefault();
            const step = value.key === 'ArrowDown' ? 1 : -1,
              next = flatItems.length ? (selectedRef.current + step + flatItems.length) % flatItems.length : 0;
            return ((selectedRef.current = next), setSelectedIndex(next), true);
          }
          if (value.key !== 'Enter') return false;
          const item = flatItems[selectedRef.current];
          return item ? (value.preventDefault(), command(item), true) : false;
        },
      })),
      !items.length)
    )
      return error ? (0, r.jsx)(MentionSurface, {children: error}) : null;
    let rowIndex = 0;
    return (0, r.jsx)(MentionSurface, {
      ref: listRef,
      children: groups.map(value =>
        (0, r.jsxs)(
          'div',
          {
            className: 'pt-2 first:pt-0',
            children: [
              (0, r.jsx)('div', {
                className:
                  'text-muted-foreground px-2.5 py-1 text-xs font-medium tracking-wide select-none in-data-[size=sm]:px-1.5 data-inset:pl-7 in-data-[size=sm]:data-inset:pl-5',
                children: value.label,
              }),
              value.items.map(item => {
                const step = rowIndex;
                return (
                  (rowIndex += 1),
                  (0, r.jsx)(
                    MentionRow,
                    {command, index: step, isSelected: step === selectedIndex, item},
                    `${item.groupLabel}:${item.id}`,
                  )
                );
              }),
            ],
          },
          value.label,
        ),
      ),
    });
  },
  /** The menu surface. */
  MentionSurface = ({children, ref}) =>
    (0, r.jsx)('div', {
      className: L(
        'bg-glass border-glass rounded-xl p-1.5 shadow-lg',
        'max-h-60 overflow-x-hidden overflow-y-auto',
      ),
      'data-size': 'sm',
      'data-slot': 'rich-input-mention-surface',
      ref,
      children,
    }),
  /** A mention row. */
  MentionRow = ({command, index, isSelected, item}) => {
    const isSkill = item.type === 'skill',
      CommandIcon = item.type === 'command' ? commandIcon(item.command) : void 0,
      isCommandLike = item.type === 'command' || isSkill,
      handleClick = () => command(item),
      handleMouseDown = event => event.preventDefault();
    return (0, r.jsxs)('button', {
      type: 'button',
      className: L(
        "group/dropdown-menu-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:hover:**:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10! data-[variant=destructive]:hover:text-destructive data-[variant=destructive]:focus:bg-destructive/10! data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20! dark:data-[variant=destructive]:focus:bg-destructive/20! data-[variant=destructive]:*:[svg]:text-destructive relative flex min-h-8 cursor-default items-center gap-2 rounded-lg px-2.5 py-1 text-sm outline-hidden select-none in-data-[size=sm]:min-h-7 in-data-[size=sm]:rounded-md in-data-[size=sm]:px-1.5 in-data-[size=sm]:py-1.5 data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 in-data-[size=sm]:data-inset:pl-5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'w-full min-w-0 overflow-hidden text-left',
        isSelected && 'bg-accent text-accent-foreground **:text-accent-foreground',
      ),
      'data-mention-index': index,
      onClick: handleClick,
      onMouseDown: handleMouseDown,
      children: [
        (0, r.jsx)('span', {
          className:
            'text-muted-foreground flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-xs [&_svg]:size-4',
          children: item.icon
            ? (0, r.jsx)('img', {alt: '', className: 'size-full rounded-sm', src: item.icon})
            : (0, r.jsx)(ha, {
                value: item.type,
                caseBy: {
                  command: CommandIcon ? (0, r.jsx)(CommandIcon, {}) : null,
                  skill: (0, r.jsx)(Qs, {}),
                  tab: (0, r.jsx)(gr, {}),
                  'tab-group': (0, r.jsx)(Ss, {}),
                },
              }),
        }),
        (0, r.jsx)('span', {
          className: L('inline-block font-medium', isCommandLike ? 'shrink-0' : 'min-w-0 flex-1 truncate'),
          children: item.name,
        }),
        (0, r.jsx)('span', {
          className: L(
            'text-muted-foreground min-w-0 truncate',
            isCommandLike ? 'grow' : 'max-w-[45%] shrink-0 text-right',
          ),
          children: item.description ?? '',
        }),
      ],
    });
  }
