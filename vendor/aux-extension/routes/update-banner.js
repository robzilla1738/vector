/* Aux-owned source, the New Tab update banner (assets/update-banner-C_z-hMCt.js, the module body after its
 * imports; me exported as UpdateBanner): the latest changelog entry, fetched at most every three hours
 * and kept in local storage, shown for a week once this browser (and the background service) is new
 * enough for it, until dismissed; with its cover image or video, title, description and action.
 * Names the rest of the chunk uses keep their chunk names: me UpdateBanner.
 * Chunk names used: j/I React interop, f/s/B/P the schema builders, D the site fetch, w useQuery, R the
 * account, F/M motion, x Button, k the close icon, q markdown, O/L the link helpers, T the video gate,
 * _ JSX runtime. */
var React = j(I(), 1),
  ChangelogEntry = f({
    version: s(),
    minVersion: s().optional(),
    minBackgroundServiceVersion: s().optional(),
    date: s().refine(e => Number.isFinite(Date.parse(e))),
    coverImage: s().optional(),
    content: f({title: s(), description: s(), action: s().optional(), actionHref: s().optional()}),
  }).transform(e => ({...e, minVersion: e.minVersion ?? e.version})),
  Changelog = P(ChangelogEntry),
  fetchChangelog = async () => {
    const e = await D('/changelog/changelog');
    if (!e.ok) throw new Error(`Failed to fetch changelog: ${e.status}`);
    return Changelog.parse(await e.json());
  };
fetchChangelog.queryKey = [{scope: 'global', entity: 'changelog'}];
fetchChangelog.queryOptions = {queryKey: fetchChangelog.queryKey, queryFn: fetchChangelog};
var STORAGE_KEY = 'aux.new-tab.update-banner.changelog.v2',
  REFRESH_MS = 108e5,
  SHOW_FOR_MS = 6048e5,
  StoredState = f({
    requestedAt: B(),
    dismissedVersion: s().nullable().optional().default(null),
    changelog: ChangelogEntry.nullable(),
  }) /** The latest entry, whether to show it and how to dismiss it. */,
  useUpdateBanner = () => {
    const [e, t] = (0, React.useState)(readState),
      r = !e || Date.now() - e.requestedAt >= REFRESH_MS,
      {data: o} = w({
        ...fetchChangelog.queryOptions,
        enabled: r,
        initialData: !r && e?.changelog ? [e.changelog] : void 0,
        initialDataUpdatedAt: r ? void 0 : e?.requestedAt,
      }),
      {data} = w({
        queryKey: ['browserPreferences', 'version'],
        queryFn: () => {
          const l = browserPreferences();
          if (!l) throw new Error('chrome.auxBrowserPreferences API is unavailable');
          return l.getBrowserVersion();
        },
      }),
      n = o?.[0] ?? e?.changelog,
      c = n?.minBackgroundServiceVersion,
      d = typeof chrome > 'u' ? void 0 : chrome.runtime?.getManifest().version,
      h = n ? Date.parse(n.date) : NaN,
      V = n ? e?.dismissedVersion === n.version : false,
      A = !!(
        n &&
        data &&
        isAtMost(n.minVersion, data) &&
        (!c || (d && isAtMost(c, d))) &&
        Date.now() - h <= SHOW_FOR_MS
      ),
      v = (0, React.useCallback)(l => {
        t(p => {
          const u = {requestedAt: p?.requestedAt ?? Date.now(), dismissedVersion: l.version, changelog: l};
          return (writeState(u), u);
        });
      }, []),
      S = (0, React.useCallback)(() => {
        n && v(n);
      }, [n, v]);
    return (
      (0, React.useEffect)(() => {
        const l = o?.[0];
        !r ||
          !l ||
          t(p => {
            const u = {requestedAt: Date.now(), dismissedVersion: p?.dismissedVersion ?? null, changelog: l};
            return (writeState(u), u);
          });
      }, [o, r]),
      {isVisible: A && !V, handleClose: S, latest: n}
    );
  },
  browserPreferences = () => (typeof chrome > 'u' ? void 0 : chrome.auxBrowserPreferences),
  isAtMost = (e, t) =>
    compareVersions(e, t) <= 0 /** Compares dotted versions numerically; anything else only by equality. */,
  compareVersions = (e, t) => {
    const r = versionParts(e),
      o = versionParts(t);
    if (!r || !o) return e === t ? 0 : 1;
    const i = Math.max(r.length, o.length);
    for (let n = 0; n < i; n += 1) {
      const c = r[n] ?? 0,
        d = o[n] ?? 0;
      if (c !== d) return c - d;
    }
    return 0;
  },
  versionParts = e => {
    const t = e.split('.').map(Number);
    return t.every(Number.isFinite) ? t : null;
  },
  readState = () => {
    if (!(typeof window > 'u'))
      try {
        const e = window.localStorage.getItem(STORAGE_KEY);
        if (!e) return;
        const t = StoredState.safeParse(JSON.parse(e));
        return t.success ? t.data : void 0;
      } catch {
        return;
      }
  },
  writeState = e => {
    if (!(typeof window > 'u'))
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
      } catch {}
  },
  jsxRuntime = _(),
  DEFAULT_ACTION_PATH = '/u/{accountId}/settings',
  me = () => {
    const {accountId} = R(),
      {isVisible, latest, handleClose} = useUpdateBanner();
    if (!latest) return null;
    const {action, actionHref} = latest.content,
      c = (actionHref ?? DEFAULT_ACTION_PATH).replaceAll('{accountId}', String(accountId ?? 'current')),
      d = h => {
        (handleClose(), L(h));
      };
    return (0, jsxRuntime.jsx)(F, {
      children:
        isVisible &&
        (0, jsxRuntime.jsxs)(M.div, {
          className: 'bg-popover absolute right-4 bottom-4 z-50 w-75 overflow-hidden rounded-xl border shadow-2xl',
          variants: CARD_MOTION,
          initial: 'initial',
          animate: 'animate',
          exit: 'exit',
          children: [
            latest.coverImage &&
              (0, jsxRuntime.jsx)('div', {
                className: 'aspect-5/3 w-full overflow-hidden',
                children: (0, jsxRuntime.jsx)(CoverMedia, {src: latest.coverImage, alt: latest.content.title}),
              }),
            (0, jsxRuntime.jsx)(x, {
              className: 'text-surface-primary-foreground absolute top-2.5 right-2.5 backdrop-blur-xs',
              'aria-label': 'Dismiss update banner',
              size: 'icon-xs',
              shape: 'pill',
              variant: 'secondary',
              onClick: handleClose,
              children: (0, jsxRuntime.jsx)(k, {}),
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: 'space-y-1 p-4 pt-5 select-none',
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'font-display',
                  children: [
                    (0, jsxRuntime.jsx)('p', {
                      className: 'text-muted-foreground text-xs leading-none font-medium tracking-wide',
                      children: "What's new?",
                    }),
                    (0, jsxRuntime.jsx)('p', {
                      className: 'text-primary text-lg font-medium',
                      children: latest.content.title,
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)(q, {
                  className: 'text-surface-primary-foreground text-sm',
                  children: latest.content.description,
                }),
              ],
            }),
            action &&
              (0, jsxRuntime.jsx)('div', {
                className: 'p-2.5',
                children: (0, jsxRuntime.jsx)(x, {
                  className: 'w-full',
                  variant: 'secondary',
                  size: 'lg',
                  nativeButton: false,
                  render: (0, jsxRuntime.jsx)('a', {href: O(c), onClick: d}),
                  children: action,
                }),
              }),
          ],
        }),
    });
  },
  VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv']),
  isVideo = e => {
    try {
      const t = new URL(e, 'https://localhost').pathname.split('.').pop()?.toLowerCase();
      return t != null && VIDEO_EXTENSIONS.has(t);
    } catch {
      return false;
    }
  },
  CoverMedia = ({src, alt}) => {
    const r = isVideo(src),
      o = T({enabled: r, timeoutMs: 1500});
    return r
      ? (0, jsxRuntime.jsx)('video', {
          src: o ? src : void 0,
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          preload: 'none',
          disablePictureInPicture: true,
          'aria-label': alt,
          className: 'pointer-events-none h-full w-full object-cover select-none',
          onLoadedData: i => {
            i.currentTarget.play();
          },
        })
      : (0, jsxRuntime.jsx)('img', {
          src,
          alt,
          loading: 'lazy',
          decoding: 'async',
          className: 'pointer-events-none h-full w-full object-cover select-none',
        });
  },
  CARD_MOTION = {
    initial: {opacity: 0.05, filter: 'blur(10px)', scale: 0.5, bottom: -40, right: -24},
    animate: {opacity: 1, filter: 'blur(0px)', scale: 1, bottom: 16, right: 16},
    exit: {opacity: 0.05, filter: 'blur(4px)', scale: 0.8, bottom: -24, right: -12, transition: {duration: 0.1}},
  }
