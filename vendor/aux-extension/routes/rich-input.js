/* Aux-owned source: the RichInput compound parts (assets/provider-Cw0zhujt.js, zn through co): the root
 * that owns the editor runtime, the parts that register skills, tabs, submit, file paste and key
 * handling on it for as long as they render, and the mention candidates: skills, slash commands and
 * the cached open tabs (five seconds, per account and window; a missing extension reads as no tabs).
 * Names the rest of the chunk uses keep their chunk names: Ee the context hook, Xi the root, eo/to/no/so/ro
 * the parts, io a skill's candidate, oo the commands, lo the triggers, co open tabs.
 * Chunk names used: c React, r JSX runtime, Gr a new runtime, sa an empty snapshot, Jr the empty tab state,
 * fa a skill's name, ra/na the command list, uo/mo/fo the loaders, ho a missing extension, zs the CDP call. */
/** The root's context. */
  RichInputContext = (0, c.createContext)(null),
  /** The root's context, which its parts need. */
  Ee = () => {
    const value = (0, c.use)(RichInputContext);
    if (!value) throw new Error('RichInput compound components must be rendered inside <RichInput>.');
    return value;
  },
  /** The root: owns the runtime and its version. */
  Xi = ({children, disabled = false, initialSnapshot, onChange, onCommand, onControllerChange}) => {
    const [runtime] = (0, c.useState)(Gr),
      [initialContent] = (0, c.useState)(() => initialSnapshot ?? sa()),
      [runtimeVersion, setRuntimeVersion] = (0, c.useState)(0),
      bumpRuntimeVersion = (0, c.useCallback)(() => setRuntimeVersion(version => version + 1), []);
    (0, c.useLayoutEffect)(() => {
      (Object.assign(runtime.callbacks, {onChange, onCommand, onControllerChange}), (runtime.root.disabled = disabled));
    });
    const value = (0, c.useMemo)(
      () => ({bumpRuntimeVersion, disabled, initialContent, runtime, runtimeVersion}),
      [bumpRuntimeVersion, disabled, initialContent, runtime, runtimeVersion],
    );
    return (0, r.jsx)(RichInputContext, {value, children});
  },
  /** Registers skills as mentions. */
  eo = ({value}) => {
    const {bumpRuntimeVersion, runtime} = Ee();
    return (
      (0, c.useLayoutEffect)(
        () => (
          Object.assign(runtime.mention, {includeSkills: true, skills: value.skills, skillsLoaded: value.isLoaded}),
          bumpRuntimeVersion(),
          () => {
            Object.assign(runtime.mention, {includeSkills: false, skills: [], skillsLoaded: false});
          }
        ),
        [bumpRuntimeVersion, runtime, value.isLoaded, value.skills],
      ),
      null
    );
  },
  /** Registers open tabs as mentions. */
  to = ({value}) => {
    const {runtime} = Ee();
    return (
      (0, c.useLayoutEffect)(
        () => (
          Object.assign(runtime.mention, {includeTabs: true, tabMentionState: value}),
          () => {
            Object.assign(runtime.mention, {includeTabs: false, tabMentionState: Jr});
          }
        ),
        [runtime, value],
      ),
      null
    );
  },
  /** Registers submit on Enter. */
  no = ({canSubmit = true, onSubmit, onSubmitStart}) => {
    const {runtime} = Ee();
    return (
      (0, c.useLayoutEffect)(
        () => (
          Object.assign(runtime.submit, {canSubmit, enabled: true, onSubmit, onSubmitStart}),
          () => {
            Object.assign(runtime.submit, {canSubmit: true, enabled: false, onSubmit: void 0, onSubmitStart: void 0});
          }
        ),
        [canSubmit, onSubmit, onSubmitStart, runtime],
      ),
      null
    );
  },
  /** Registers file and text paste. */
  so = ({disableDrop, onPasteDirectories, onPasteFiles, onPasteText}) => {
    const {runtime} = Ee();
    return (
      (0, c.useLayoutEffect)(
        () => (
          Object.assign(runtime.file, {disableDrop: !!disableDrop, onPasteDirectories, onPasteFiles, onPasteText}),
          () => {
            Object.assign(runtime.file, {
              disableDrop: false,
              onPasteDirectories: void 0,
              onPasteFiles: void 0,
              onPasteText: void 0,
            });
          }
        ),
        [disableDrop, onPasteDirectories, onPasteFiles, onPasteText, runtime],
      ),
      null
    );
  },
  /** Registers a key handler. */
  ro = ({onKeyDown}) => {
    const {runtime} = Ee();
    return (
      (0, c.useLayoutEffect)(
        () => (
          (runtime.callbacks.onKeyDown = onKeyDown),
          () => {
            runtime.callbacks.onKeyDown = void 0;
          }
        ),
        [onKeyDown, runtime],
      ),
      null
    );
  },
  /** How long the open tabs list stays cached. */
  OPEN_TABS_CACHE_MS = 5e3,
  /** A skill as a mention candidate. */
  io = skill => {
    const name = fa(skill),
      skillPath = skill.absolutePath.endsWith('.md') ? skill.absolutePath : `${skill.absolutePath}/SKILL.md`;
    return {
      description: skill.description,
      groupLabel: 'Skills',
      icon: skill.metadata?.icon,
      id: `skill:${skillPath}`,
      keywords: [name, skillPath, skill.description],
      name,
      skillPath,
      source: 'skills',
      type: 'skill',
    };
  },
  /** The slash commands as candidates. */
  oo = ra.map(na),
  /** The mention triggers: @ tabs, $ skills, / commands. */
  lo = () => [
    {allowedPrefixes: null, char: '@', load: uo},
    {
      allowedPrefixes: [
        ' ',
        `
`,
      ],
      char: '$',
      load: mo,
    },
    {
      allowedPrefixes: [
        ' ',
        `
`,
      ],
      char: '/',
      load: fo,
    },
  ],
  /** The open tabs for a mention menu, cached. */
  co = async (cache, accountId) => {
    const windowId = typeof chrome > 'u' ? void 0 : (await chrome.windows?.getCurrent().catch(() => null))?.id;
    if (
      ((cache.accountId !== accountId || cache.windowId !== windowId) &&
        Object.assign(cache, {accountId, windowId, error: void 0, items: [], loadedAt: 0, promise: void 0}),
      Date.now() - cache.loadedAt < OPEN_TABS_CACHE_MS)
    )
      return {error: cache.error, items: cache.items};
    const requestedAccountId = accountId;
    return (
      (cache.promise ??= zs({method: 'Aux.listTabs', params: {accountId, groupWindowId: windowId}})
        .then(response => {
          const items = response.items.map(tab => ({
            faviconUrl: tab.faviconUrl || void 0,
            group: tab.group,
            id: tab.id,
            isActive: tab.active,
            label: tab.title || tab.url || 'about:blank',
            targetId: tab.targetId,
            url: tab.url,
          }));
          return (
            cache.accountId === requestedAccountId &&
              cache.windowId === windowId &&
              Object.assign(cache, {error: void 0, items, loadedAt: Date.now()}),
            {items}
          );
        })
        .catch(response => {
          if (ho(response))
            return (
              cache.accountId === requestedAccountId &&
                cache.windowId === windowId &&
                Object.assign(cache, {error: void 0, items: [], loadedAt: Date.now()}),
              {items: []}
            );
          const items = response instanceof Error ? response.message : 'Failed to load tabs.';
          return (
            cache.accountId === requestedAccountId &&
              cache.windowId === windowId &&
              Object.assign(cache, {error: items, loadedAt: Date.now()}),
            {
              error: items,
              items: cache.accountId === requestedAccountId && cache.windowId === windowId ? cache.items : [],
            }
          );
        })
        .finally(() => {
          cache.accountId === requestedAccountId && cache.windowId === windowId && (cache.promise = void 0);
        })),
      cache.promise
    );
  }
